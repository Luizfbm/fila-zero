import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Painel from '../../src/screens/Painel';
import { usePedidos } from '../../src/contexts/PedidosContext';
import { useUsuario } from '../../src/contexts/UsuarioContext';
import { listarCategorias } from '../../src/services/produtos';
import { ROTAS } from '../../src/navigation/rotas';

jest.mock('../../src/contexts/PedidosContext', () => ({ usePedidos: jest.fn() }));
jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));
jest.mock('../../src/services/produtos', () => ({ listarCategorias: jest.fn() }));

const categorias = [
  { id: 'salgados', nome: 'Salgados', icone: 'food-croissant' },
  { id: 'lanches', nome: 'Lanches', icone: 'hamburger' },
  { id: 'bebidas', nome: 'Bebidas', icone: 'bottle-soda' },
];

function diasAtras(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toISOString();
}

// Hoje: 2 coxinhas (R$ 15,00). Há 60 dias: 1 X-salada e 1 suco (R$ 25,00).
function pedidosDeExemplo() {
  return [
    {
      id: '2',
      usuarioId: '7',
      itens: [{ produtoId: '1', nome: 'Coxinha de frango', preco: 7.5, quantidade: 2, categoria: 'salgados' }],
      total: 15,
      retirada: '09:50',
      observacao: '',
      status: 'recebido',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '1',
      usuarioId: '7',
      itens: [
        { produtoId: '5', nome: 'X-salada', preco: 17, quantidade: 1, categoria: 'lanches' },
        { produtoId: '9', nome: 'Suco de laranja', preco: 8, quantidade: 1, categoria: 'bebidas' },
      ],
      total: 25,
      retirada: '12:10',
      observacao: '',
      status: 'retirado',
      criadoEm: diasAtras(60),
    },
  ];
}

let carregar;
let navigation;
let ouvintes;
let cancelarOuvinte;

function comPedidos(contexto) {
  usePedidos.mockReturnValue({
    pedidos: [],
    carregando: false,
    erro: null,
    origem: 'local',
    carregar,
    registrar: jest.fn(),
    ...contexto,
  });
}

// O Drawer avisa do foco assim que a tela aparece; aqui o teste faz esse papel.
async function abrir() {
  const tela = render(<Painel navigation={navigation} />);
  await act(async () => {
    ouvintes.focus();
  });
  return tela;
}

function escolherPeriodo(valor) {
  fireEvent(screen.getByLabelText('Período'), 'valueChange', valor, 0);
}

beforeEach(() => {
  carregar = jest.fn().mockResolvedValue(undefined);
  ouvintes = {};
  cancelarOuvinte = jest.fn();
  navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((evento, ouvinte) => {
      ouvintes[evento] = ouvinte;
      return cancelarOuvinte;
    }),
  };
  useUsuario.mockReturnValue({ usuario: { id: '7', nome: 'Ana' }, entrar: jest.fn(), sair: jest.fn() });
  listarCategorias.mockResolvedValue({ dados: categorias, origem: 'local' });
  comPedidos({ pedidos: pedidosDeExemplo() });
});

describe('Painel: busca dos pedidos', () => {
  it('carrega os pedidos do usuário quando a tela ganha foco', async () => {
    await abrir();

    expect(navigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(carregar).toHaveBeenCalledTimes(1);
    expect(carregar).toHaveBeenCalledWith('7');
  });

  it('não busca por conta própria na montagem, só pelo foco', () => {
    comPedidos({ pedidos: [] });
    render(<Painel navigation={navigation} />);

    expect(carregar).not.toHaveBeenCalled();
    expect(screen.getByText('Carregando seus pedidos...')).toBeOnTheScreen();
  });

  it('carrega de novo quando a tela volta a ter foco', async () => {
    await abrir();

    act(() => ouvintes.focus());

    expect(carregar).toHaveBeenCalledTimes(2);
    expect(carregar).toHaveBeenLastCalledWith('7');
  });

  it('para de ouvir o foco quando a tela sai', async () => {
    const tela = await abrir();

    tela.unmount();

    expect(cancelarOuvinte).toHaveBeenCalled();
  });

  it('mostra que está carregando na primeira busca', async () => {
    comPedidos({ pedidos: [], carregando: true });
    await abrir();

    expect(screen.getByText('Carregando seus pedidos...')).toBeOnTheScreen();
    expect(screen.queryByText('Você ainda não fez nenhum pedido')).toBeNull();
  });

  it('ao atualizar com pedidos na tela, não troca o resumo pelo carregando', async () => {
    comPedidos({ pedidos: pedidosDeExemplo(), carregando: true });
    await abrir();

    expect(screen.queryByText('Carregando seus pedidos...')).toBeNull();
    expect(screen.getByLabelText('Pedidos: 2')).toBeOnTheScreen();
  });

  it('mostra o erro do contexto com a opção de tentar de novo', async () => {
    comPedidos({ pedidos: [], erro: 'Não deu para carregar seus pedidos. Tente de novo.' });
    await abrir();

    expect(screen.getByText('Não deu para carregar seus pedidos. Tente de novo.')).toBeOnTheScreen();
    expect(screen.queryByText('Você ainda não fez nenhum pedido')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(carregar).toHaveBeenCalledTimes(2);
    expect(carregar).toHaveBeenLastCalledWith('7');
  });
});

describe('Painel: com pedidos', () => {
  it('mostra os quatro indicadores com os valores formatados', async () => {
    await abrir();

    expect(screen.getByLabelText('Total gasto: R$ 40,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pedidos: 2')).toBeOnTheScreen();
    expect(screen.getByLabelText('Média por pedido: R$ 20,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu preferido: Coxinha de frango, 2 unidades')).toBeOnTheScreen();
  });

  it('mostra o gasto por categoria em barras, do maior para o menor', async () => {
    await abrir();

    expect(screen.getByRole('header', { name: 'Gasto por categoria' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Lanches: R$ 17,00, 43% do total')).toBeOnTheScreen();
    expect(screen.getByLabelText('Salgados: R$ 15,00, 37% do total')).toBeOnTheScreen();
    expect(screen.getByLabelText('Bebidas: R$ 8,00, 20% do total')).toBeOnTheScreen();
    expect(screen.getAllByTestId('barra-preenchimento')).toHaveLength(3);
  });

  it('lista os itens mais pedidos com quantidade e valor', async () => {
    await abrir();

    expect(screen.getByRole('header', { name: 'Mais pedidos' })).toBeOnTheScreen();
    expect(screen.getByLabelText('1º Coxinha de frango, 2 unidades, R$ 15,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('2º X-salada, 1 unidade, R$ 17,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('3º Suco de laranja, 1 unidade, R$ 8,00')).toBeOnTheScreen();
    expect(screen.getByText('2x')).toBeOnTheScreen();
    expect(screen.queryByText(/un\./)).toBeNull();
  });

  it('lista separados dois produtos diferentes que têm o mesmo nome', async () => {
    const pedidos = pedidosDeExemplo();
    pedidos[0].itens = [
      { produtoId: '30', nome: 'Combo do dia', preco: 20, quantidade: 2, categoria: 'lanches' },
      { produtoId: '31', nome: 'Combo do dia', preco: 25, quantidade: 1, categoria: 'lanches' },
    ];
    comPedidos({ pedidos: pedidos.slice(0, 1) });
    const erroNoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
    await abrir();

    expect(screen.getByLabelText('1º Combo do dia, 2 unidades, R$ 40,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('2º Combo do dia, 1 unidade, R$ 25,00')).toBeOnTheScreen();
    expect(erroNoConsole).not.toHaveBeenCalled();
    erroNoConsole.mockRestore();
  });

  it('oferece os quatro períodos', async () => {
    await abrir();

    const rotulos = screen.getByLabelText('Período').props.items.map((opcao) => opcao.label);
    expect(rotulos).toEqual(['Desde o começo', 'Hoje', 'Últimos 7 dias', 'Últimos 30 dias']);
  });

  it('trocar o período recalcula os indicadores, as barras e a lista', async () => {
    await abrir();

    escolherPeriodo('hoje');

    expect(screen.getByLabelText('Total gasto: R$ 15,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pedidos: 1')).toBeOnTheScreen();
    expect(screen.getByLabelText('Média por pedido: R$ 15,00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Salgados: R$ 15,00, 100% do total')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Lanches/)).toBeNull();
    expect(screen.queryByLabelText(/X-salada/)).toBeNull();

    escolherPeriodo('tudo');

    expect(screen.getByLabelText('Total gasto: R$ 40,00')).toBeOnTheScreen();
  });

  it('em período sem pedidos, diz qual é o período e mantém o seletor na tela', async () => {
    comPedidos({ pedidos: pedidosDeExemplo().slice(1) });
    await abrir();

    escolherPeriodo('hoje');
    expect(screen.getByText('Você não pediu nada hoje')).toBeOnTheScreen();

    escolherPeriodo('7dias');
    expect(screen.getByText('Você não pediu nada nos últimos 7 dias')).toBeOnTheScreen();

    escolherPeriodo('30dias');
    expect(screen.getByText('Você não pediu nada nos últimos 30 dias')).toBeOnTheScreen();
    expect(screen.getByText('Escolha outro período para ver seus gastos.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Período')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Total gasto/)).toBeNull();
    expect(screen.queryByText('Ver cardápio')).toBeNull();
  });

  it('o total gasto fecha com a soma das barras mesmo se o total do pedido vier diferente', async () => {
    const pedidos = pedidosDeExemplo();
    pedidos[0].total = 99;
    comPedidos({ pedidos });
    await abrir();

    expect(screen.getByLabelText('Total gasto: R$ 40,00')).toBeOnTheScreen();
  });

  it('não desenha as barras antes de as categorias chegarem', async () => {
    listarCategorias.mockReturnValue(new Promise(() => {}));
    await abrir();

    expect(screen.getByLabelText('Total gasto: R$ 40,00')).toBeOnTheScreen();
    expect(screen.queryByText('Gasto por categoria')).toBeNull();
    expect(screen.queryByText('Outros')).toBeNull();
  });
});

describe('Painel: sem pedidos', () => {
  beforeEach(() => {
    comPedidos({ pedidos: [] });
  });

  it('mostra o estado vazio no lugar do resumo', async () => {
    await abrir();

    expect(screen.getByText('Você ainda não fez nenhum pedido')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Período')).toBeNull();
    expect(screen.queryByLabelText(/^Total gasto/)).toBeNull();
  });

  it('leva para o Cardápio pelo botão', async () => {
    await abrir();

    fireEvent.press(screen.getByRole('button', { name: 'Ver cardápio' }));

    expect(navigation.navigate).toHaveBeenCalledWith(ROTAS.CARDAPIO);
  });
});
