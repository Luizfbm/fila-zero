// Contas do Painel. Tudo aqui é função pura: recebe os pedidos e devolve números,
// sem guardar nada. As somas são feitas em centavos para não sobrar 0,30000000000000004.

const OUTROS = { id: 'outros', nome: 'Outros', icone: 'dots-horizontal' };

const DIAS_POR_PERIODO = { hoje: 1, '7dias': 7, '30dias': 30 };

function emCentavos(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
}

function emReais(centavos) {
  return centavos / 100;
}

function quantidadeDo(item) {
  const numero = Number(item.quantidade);
  return Number.isFinite(numero) ? numero : 0;
}

function valorDoItem(item) {
  return emCentavos(item.preco) * quantidadeDo(item);
}

function itensDe(pedidos) {
  return (pedidos || []).flatMap((pedido) => pedido.itens || []);
}

// O total sai dos itens, que é de onde saem as barras, para os números da tela fecharem entre si.
// O `total` gravado no pedido só entra quando o pedido chega sem itens.
function totalDoPedido(pedido) {
  const itens = pedido.itens || [];

  if (itens.length === 0) {
    return emCentavos(pedido.total);
  }

  return itens.reduce((soma, item) => soma + valorDoItem(item), 0);
}

// Data sem hora ("2026-11-17") é lida como UTC pelo Date e cairia no dia anterior
// no Brasil, então monto no horário local.
function paraData(iso) {
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());

  return soData ? new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3])) : new Date(iso);
}

export function filtrarPorPeriodo(pedidos, periodo, agora = new Date()) {
  const lista = pedidos || [];
  const dias = DIAS_POR_PERIODO[periodo];

  if (!dias) {
    return [...lista];
  }

  // O período começa à meia-noite (horário do aparelho) e inclui o dia de hoje.
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - (dias - 1));

  return lista.filter((pedido) => {
    const criado = paraData(pedido.criadoEm);
    return !Number.isNaN(criado.getTime()) && criado >= inicio;
  });
}

function agruparItens(pedidos) {
  const grupos = {};

  itensDe(pedidos).forEach((item) => {
    const chave = String(item.produtoId !== undefined && item.produtoId !== null ? item.produtoId : item.nome);
    if (!grupos[chave]) {
      grupos[chave] = { produtoId: item.produtoId, nome: item.nome, quantidade: 0, centavos: 0 };
    }
    grupos[chave].quantidade += quantidadeDo(item);
    grupos[chave].centavos += valorDoItem(item);
  });

  return Object.values(grupos)
    .filter((grupo) => grupo.quantidade > 0)
    .sort(
      (a, b) =>
        b.quantidade - a.quantidade ||
        b.centavos - a.centavos ||
        String(a.nome).localeCompare(String(b.nome), 'pt-BR')
    );
}

export function itensMaisPedidos(pedidos, limite = 5) {
  return agruparItens(pedidos)
    .slice(0, limite)
    .map((grupo) => ({
      produtoId: grupo.produtoId,
      nome: grupo.nome,
      quantidade: grupo.quantidade,
      valor: emReais(grupo.centavos),
    }));
}

export function resumir(pedidos) {
  const lista = pedidos || [];
  const centavos = lista.reduce((soma, pedido) => soma + totalDoPedido(pedido), 0);
  const maisPedido = agruparItens(lista)[0];

  return {
    totalGasto: emReais(centavos),
    quantidadePedidos: lista.length,
    ticketMedio: lista.length ? emReais(Math.round(centavos / lista.length)) : 0,
    itemMaisPedido: maisPedido ? { nome: maisPedido.nome, quantidade: maisPedido.quantidade } : null,
  };
}

export function gastoPorCategoria(pedidos, categorias) {
  const conhecidas = categorias || [];
  const grupos = {};

  itensDe(pedidos).forEach((item) => {
    const categoria = conhecidas.find((atual) => String(atual.id) === String(item.categoria)) || OUTROS;
    if (!grupos[categoria.id]) {
      grupos[categoria.id] = { id: categoria.id, nome: categoria.nome, icone: categoria.icone, centavos: 0 };
    }
    grupos[categoria.id].centavos += valorDoItem(item);
  });

  const comValor = Object.values(grupos)
    .filter((grupo) => grupo.centavos > 0)
    .sort((a, b) => b.centavos - a.centavos || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  const total = comValor.reduce((soma, grupo) => soma + grupo.centavos, 0);

  // Método do maior resto: todo mundo arredonda para baixo e os pontos que faltam para 100
  // vão para quem tem a maior parte decimal. No empate, leva quem vem antes na lista.
  const percentuais = comValor.map((grupo) => Math.floor((grupo.centavos * 100) / total));
  const faltam = 100 - percentuais.reduce((soma, atual) => soma + atual, 0);

  comValor
    .map((grupo, indice) => ({ indice, resto: (grupo.centavos * 100) % total }))
    .sort((a, b) => b.resto - a.resto || a.indice - b.indice)
    .slice(0, faltam)
    .forEach((escolhido) => {
      percentuais[escolhido.indice] += 1;
    });

  return comValor.map((grupo, indice) => ({
    id: grupo.id,
    nome: grupo.nome,
    icone: grupo.icone,
    valor: emReais(grupo.centavos),
    percentual: percentuais[indice],
  }));
}
