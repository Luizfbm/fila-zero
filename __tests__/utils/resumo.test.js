import {
  filtrarPorPeriodo,
  gastoPorCategoria,
  itensMaisPedidos,
  resumir,
} from '../../src/utils/resumo';

const categorias = [
  { id: 'salgados', nome: 'Salgados', icone: 'food-croissant' },
  { id: 'lanches', nome: 'Lanches', icone: 'hamburger' },
  { id: 'bebidas', nome: 'Bebidas', icone: 'bottle-soda' },
];

function item(produtoId, nome, preco, quantidade, categoria) {
  return { produtoId, nome, preco, quantidade, categoria };
}

function pedido(id, itens, criadoEm = '2026-11-17T12:00:00.000Z') {
  const total = itens.reduce((soma, atual) => soma + atual.preco * atual.quantidade, 0);
  return { id, usuarioId: '1', itens, total, retirada: '09:50', observacao: '', status: 'recebido', criadoEm };
}

// Datas montadas no horário local para o teste dar o mesmo resultado em qualquer fuso.
function em(ano, mes, dia, hora = 12, minuto = 0) {
  return new Date(ano, mes - 1, dia, hora, minuto).toISOString();
}

describe('filtrarPorPeriodo', () => {
  const agora = new Date(2026, 10, 17, 15, 30);
  const pedidos = [
    pedido('agora-ha-pouco', [], em(2026, 11, 17, 15, 0)),
    pedido('hoje-cedo', [], em(2026, 11, 17, 0, 0)),
    pedido('ontem-tarde', [], em(2026, 11, 16, 23, 59)),
    pedido('seis-dias', [], em(2026, 11, 11, 0, 0)),
    pedido('sete-dias', [], em(2026, 11, 10, 23, 59)),
    pedido('vinte-nove-dias', [], em(2026, 10, 19, 0, 0)),
    pedido('trinta-dias', [], em(2026, 10, 18, 23, 59)),
    pedido('ano-passado', [], em(2025, 11, 17)),
  ];

  function ids(periodo) {
    return filtrarPorPeriodo(pedidos, periodo, agora).map((atual) => atual.id);
  }

  it('em "tudo" devolve todos os pedidos', () => {
    expect(ids('tudo')).toHaveLength(pedidos.length);
  });

  it('em "hoje" fica só com os pedidos do mesmo dia', () => {
    expect(ids('hoje')).toEqual(['agora-ha-pouco', 'hoje-cedo']);
  });

  it('em "7dias" conta hoje e os seis dias anteriores', () => {
    expect(ids('7dias')).toEqual(['agora-ha-pouco', 'hoje-cedo', 'ontem-tarde', 'seis-dias']);
  });

  it('em "30dias" conta hoje e os 29 dias anteriores', () => {
    expect(ids('30dias')).toEqual([
      'agora-ha-pouco',
      'hoje-cedo',
      'ontem-tarde',
      'seis-dias',
      'sete-dias',
      'vinte-nove-dias',
    ]);
  });

  it('atravessa a virada do mês e do ano', () => {
    const virada = new Date(2027, 0, 2, 8, 0);
    const lista = [
      pedido('dezembro', [], em(2026, 12, 27, 0, 0)),
      pedido('antes', [], em(2026, 12, 26, 23, 59)),
    ];

    expect(filtrarPorPeriodo(lista, '7dias', virada).map((atual) => atual.id)).toEqual(['dezembro']);
  });

  it('deixa de fora pedido sem data válida quando há período', () => {
    const lista = [pedido('sem-data', [], undefined), pedido('data-ruim', [], 'ontem')];
    lista[0].criadoEm = undefined;

    expect(filtrarPorPeriodo(lista, 'hoje', agora)).toEqual([]);
    expect(filtrarPorPeriodo(lista, 'tudo', agora)).toHaveLength(2);
  });

  it('período desconhecido se comporta como "tudo"', () => {
    expect(ids('semana-que-vem')).toHaveLength(pedidos.length);
  });

  it('aceita lista vazia ou ausente', () => {
    expect(filtrarPorPeriodo([], 'hoje', agora)).toEqual([]);
    expect(filtrarPorPeriodo(undefined, 'hoje', agora)).toEqual([]);
  });

  it('não altera a lista recebida', () => {
    const copia = [...pedidos];
    filtrarPorPeriodo(pedidos, 'hoje', agora);

    expect(pedidos).toEqual(copia);
  });
});

describe('resumir', () => {
  it('sem pedidos devolve tudo zerado e nenhum item', () => {
    const esperado = { totalGasto: 0, quantidadePedidos: 0, ticketMedio: 0, itemMaisPedido: null };

    expect(resumir([])).toEqual(esperado);
    expect(resumir(undefined)).toEqual(esperado);
  });

  it('soma o total, conta os pedidos e calcula o ticket médio', () => {
    const pedidos = [
      pedido('1', [item('1', 'Coxinha de frango', 7.5, 2, 'salgados')]),
      pedido('2', [item('9', 'Suco de laranja', 8, 1, 'bebidas'), item('5', 'X-salada', 17, 1, 'lanches')]),
    ];

    expect(resumir(pedidos)).toEqual({
      totalGasto: 40,
      quantidadePedidos: 2,
      ticketMedio: 20,
      itemMaisPedido: { nome: 'Coxinha de frango', quantidade: 2 },
    });
  });

  it('arredonda o ticket médio em centavos', () => {
    const pedidos = [
      pedido('1', [item('1', 'Café', 3.5, 1, 'cafes')]),
      pedido('2', [item('1', 'Café', 3.5, 1, 'cafes')]),
      pedido('3', [item('2', 'Pão de queijo', 3, 1, 'salgados')]),
    ];

    expect(resumir(pedidos).ticketMedio).toBe(3.33);
  });

  it('não acumula erro de ponto flutuante no total', () => {
    const pedidos = [
      pedido('1', [item('1', 'Bala', 0.1, 1, 'doces')]),
      pedido('2', [item('1', 'Bala', 0.2, 1, 'doces')]),
    ];

    expect(resumir(pedidos).totalGasto).toBe(0.3);
  });

  it('usa a soma dos itens quando o pedido vem sem total', () => {
    const semTotal = pedido('1', [item('1', 'Coxinha de frango', 7.5, 2, 'salgados')]);
    delete semTotal.total;

    expect(resumir([semTotal]).totalGasto).toBe(15);
  });

  it('junta o mesmo item de pedidos diferentes para achar o mais pedido', () => {
    const pedidos = [
      pedido('1', [item('1', 'Coxinha de frango', 7.5, 2, 'salgados'), item('9', 'Suco de laranja', 8, 3, 'bebidas')]),
      pedido('2', [item('1', 'Coxinha de frango', 7.5, 2, 'salgados')]),
    ];

    expect(resumir(pedidos).itemMaisPedido).toEqual({ nome: 'Coxinha de frango', quantidade: 4 });
  });

  it('pedido sem itens conta como pedido e não quebra', () => {
    const pedidos = [{ id: '1', total: 10, criadoEm: em(2026, 11, 17) }];

    expect(resumir(pedidos)).toEqual({
      totalGasto: 10,
      quantidadePedidos: 1,
      ticketMedio: 10,
      itemMaisPedido: null,
    });
  });
});

describe('gastoPorCategoria', () => {
  it('sem pedidos devolve lista vazia', () => {
    expect(gastoPorCategoria([], categorias)).toEqual([]);
    expect(gastoPorCategoria(undefined, categorias)).toEqual([]);
  });

  it('soma por categoria, do maior gasto para o menor, só com quem tem valor', () => {
    const pedidos = [
      pedido('1', [item('1', 'Coxinha de frango', 7.5, 2, 'salgados'), item('5', 'X-salada', 17, 1, 'lanches')]),
      pedido('2', [item('5', 'X-salada', 17, 1, 'lanches')]),
    ];

    expect(gastoPorCategoria(pedidos, categorias)).toEqual([
      { id: 'lanches', nome: 'Lanches', icone: 'hamburger', valor: 34, percentual: 69 },
      { id: 'salgados', nome: 'Salgados', icone: 'food-croissant', valor: 15, percentual: 31 },
    ]);
  });

  it('os percentuais são inteiros e somam 100, com o resto no maior', () => {
    const pedidos = [
      pedido('1', [
        item('1', 'Coxinha de frango', 10, 1, 'salgados'),
        item('5', 'X-salada', 10, 1, 'lanches'),
        item('9', 'Suco de laranja', 10, 1, 'bebidas'),
      ]),
    ];
    const lista = gastoPorCategoria(pedidos, categorias);

    expect(lista.map((atual) => atual.percentual)).toEqual([34, 33, 33]);
    expect(lista.reduce((soma, atual) => soma + atual.percentual, 0)).toBe(100);
  });

  it('tira do maior quando o arredondamento passa de 100', () => {
    const pedidos = [
      pedido('1', [
        item('1', 'Coxinha de frango', 49.5, 1, 'salgados'),
        item('5', 'X-salada', 25.5, 1, 'lanches'),
        item('9', 'Suco de laranja', 25, 1, 'bebidas'),
      ]),
    ];
    const lista = gastoPorCategoria(pedidos, categorias);

    expect(lista.map((atual) => atual.percentual)).toEqual([49, 26, 25]);
  });

  it('uma categoria só fica com 100%', () => {
    const pedidos = [pedido('1', [item('9', 'Suco de laranja', 8, 1, 'bebidas')])];

    expect(gastoPorCategoria(pedidos, categorias)).toEqual([
      { id: 'bebidas', nome: 'Bebidas', icone: 'bottle-soda', valor: 8, percentual: 100 },
    ]);
  });

  it('item sem categoria conhecida cai em "Outros"', () => {
    const pedidos = [
      pedido('1', [
        item('1', 'Coxinha de frango', 6, 1, 'salgados'),
        item('20', 'Marmita', 3, 1, 'congelados'),
        item('21', 'Chiclete', 1, 1, undefined),
      ]),
    ];

    expect(gastoPorCategoria(pedidos, categorias)).toEqual([
      { id: 'salgados', nome: 'Salgados', icone: 'food-croissant', valor: 6, percentual: 60 },
      { id: 'outros', nome: 'Outros', icone: 'dots-horizontal', valor: 4, percentual: 40 },
    ]);
  });

  it('sem a lista de categorias, tudo vai para "Outros"', () => {
    const pedidos = [pedido('1', [item('1', 'Coxinha de frango', 6, 1, 'salgados')])];

    expect(gastoPorCategoria(pedidos, undefined)).toEqual([
      { id: 'outros', nome: 'Outros', icone: 'dots-horizontal', valor: 6, percentual: 100 },
    ]);
  });

  it('compara a categoria como texto, porque a API pode mandar o id como número', () => {
    const pedidos = [pedido('1', [item('1', 'Coxinha de frango', 6, 1, 3)])];
    const lista = gastoPorCategoria(pedidos, [{ id: '3', nome: 'Salgados', icone: 'food-croissant' }]);

    expect(lista[0].nome).toBe('Salgados');
  });
});

describe('itensMaisPedidos', () => {
  const pedidos = [
    pedido('1', [
      item('1', 'Coxinha de frango', 7.5, 2, 'salgados'),
      item('9', 'Suco de laranja', 8, 1, 'bebidas'),
    ]),
    pedido('2', [
      item('1', 'Coxinha de frango', 7.5, 1, 'salgados'),
      item('5', 'X-salada', 17, 1, 'lanches'),
      item('2', 'Pão de queijo', 5, 2, 'salgados'),
    ]),
  ];

  it('sem pedidos devolve lista vazia', () => {
    expect(itensMaisPedidos([])).toEqual([]);
    expect(itensMaisPedidos(undefined)).toEqual([]);
  });

  it('junta por produto e ordena pela quantidade; no empate, pelo valor gasto', () => {
    expect(itensMaisPedidos(pedidos)).toEqual([
      { nome: 'Coxinha de frango', quantidade: 3, valor: 22.5 },
      { nome: 'Pão de queijo', quantidade: 2, valor: 10 },
      { nome: 'X-salada', quantidade: 1, valor: 17 },
      { nome: 'Suco de laranja', quantidade: 1, valor: 8 },
    ]);
  });

  it('respeita o limite pedido', () => {
    expect(itensMaisPedidos(pedidos, 2).map((atual) => atual.nome)).toEqual([
      'Coxinha de frango',
      'Pão de queijo',
    ]);
  });

  it('por padrão para em cinco itens', () => {
    const muitos = [
      pedido(
        '1',
        ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((letra, indice) => item(letra, `Item ${letra}`, 1, 10 - indice, 'doces'))
      ),
    ];

    expect(itensMaisPedidos(muitos)).toHaveLength(5);
  });

  it('no empate completo, segue a ordem alfabética', () => {
    const empate = [
      pedido('1', [item('2', 'Pão de queijo', 5, 1, 'salgados'), item('3', 'Brigadeiro', 5, 1, 'doces')]),
    ];

    expect(itensMaisPedidos(empate).map((atual) => atual.nome)).toEqual(['Brigadeiro', 'Pão de queijo']);
  });
});
