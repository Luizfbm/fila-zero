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

function totalDoPedido(pedido) {
  if (pedido.total === undefined || pedido.total === null) {
    return (pedido.itens || []).reduce((soma, item) => soma + valorDoItem(item), 0);
  }

  return emCentavos(pedido.total);
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
    const criado = new Date(pedido.criadoEm);
    return !Number.isNaN(criado.getTime()) && criado >= inicio;
  });
}

function agruparItens(pedidos) {
  const grupos = {};

  itensDe(pedidos).forEach((item) => {
    const chave = String(item.produtoId !== undefined && item.produtoId !== null ? item.produtoId : item.nome);
    if (!grupos[chave]) {
      grupos[chave] = { nome: item.nome, quantidade: 0, centavos: 0 };
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
    .map((grupo) => ({ nome: grupo.nome, quantidade: grupo.quantidade, valor: emReais(grupo.centavos) }));
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

  const lista = comValor.map((grupo) => ({
    id: grupo.id,
    nome: grupo.nome,
    icone: grupo.icone,
    valor: emReais(grupo.centavos),
    percentual: Math.round((grupo.centavos / total) * 100),
  }));

  // Arredondando cada um, a soma pode dar 99 ou 101. A diferença vai para a maior categoria.
  if (lista.length) {
    const soma = lista.reduce((parcial, atual) => parcial + atual.percentual, 0);
    lista[0].percentual += 100 - soma;
  }

  return lista;
}
