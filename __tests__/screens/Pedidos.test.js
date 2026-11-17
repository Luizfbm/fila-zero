import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Pedidos from '../../src/screens/Pedidos';
import { usePedidos } from '../../src/contexts/PedidosContext';
import { useUsuario } from '../../src/contexts/UsuarioContext';
import { ROTAS } from '../../src/navigation/rotas';

jest.mock('../../src/contexts/PedidosContext', () => ({ usePedidos: jest.fn() }));
jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));

const AGORA = new Date('2026-11-17T15:00:00.000Z');
const SEGUNDO = 1000;

function item(nome, preco, quantidade, produtoId) {
  return { produtoId, nome, preco, quantidade, categoria: 'salgados' };
}

// De propósito fora de ordem: a tela é que tem de ordenar.
const pedidos = [
  {
    id: 10,
    usuarioId: 7,
    itens: [item('Pão de queijo', 5, 1, 3)],
    total: 5,
    retirada: '09:50',
    observacao: '',
    status: 'retirado',
    criadoEm: '2026-11-16T12:00:00.000Z',
  },
  {
    id: 12,
    usuarioId: 7,
    itens: [item('Coxinha', 6.5, 2, 1), item('Suco de laranja', 7, 1, 2)],
    total: 20,
    retirada: '12:00',
    observacao: 'Sem gelo no suco',
    status: 'em preparo',
    criadoEm: '2026-11-17T14:30:00.000Z',
  },
  {
    id: 11,
    usuarioId: 7,
    itens: [item('Café', 4, 1, 4)],
    total: 4,
    retirada: '10:10',
    observacao: '',
    status: 'pronto',
    criadoEm: '2026-11-17T13:00:00.000Z',
  },
];

let carregar;
let navigation;
let tirarOuvinte;

function montar(contexto = {}) {
  usePedidos.mockReturnValue({
    pedidos,
    carregando: false,
    erro: null,
    origem: 'local',
    carregar,
    registrar: jest.fn(),
    ...contexto,
  });
  return render(<Pedidos navigation={navigation} />);
}

function numerosNaTela() {
  return screen.getAllByText(/^Pedido nº/).map((no) => no.props.children.split(',')[0]);
}

// O Drawer emite focus na primeira exibição e a cada volta para a tela.
function focar() {
  const chamadas = navigation.addListener.mock.calls;
  const [, aoFocar] = chamadas[chamadas.length - 1];
  act(() => {
    aoFocar();
  });
}

function escolherStatus(valor) {
  fireEvent(screen.getByLabelText('Status'), 'valueChange', valor, 0);
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(AGORA);
  carregar = jest.fn(() => Promise.resolve());
  tirarOuvinte = jest.fn();
  navigation = { navigate: jest.fn(), addListener: jest.fn(() => tirarOuvinte) };
  useUsuario.mockReturnValue({ usuario: { id: 7, nome: 'Ana' }, entrar: jest.fn(), sair: jest.fn() });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Pedidos', () => {
  describe('carga', () => {
    it('busca os pedidos do usuário quando a tela ganha foco', () => {
      montar();

      expect(navigation.addListener.mock.calls[0][0]).toBe('focus');
      focar();

      expect(carregar).toHaveBeenCalledTimes(1);
      expect(carregar).toHaveBeenCalledWith(7);
    });

    it('não busca por conta própria na montagem, para não buscar duas vezes ao abrir', () => {
      montar();

      expect(carregar).not.toHaveBeenCalled();
    });

    it('busca de novo a cada volta para a tela e para de ouvir ao sair', () => {
      const { unmount } = montar();

      focar();
      focar();
      expect(carregar).toHaveBeenCalledTimes(2);

      unmount();
      expect(tirarOuvinte).toHaveBeenCalled();
    });

    it('mostra o carregando na primeira carga', () => {
      montar({ pedidos: [], carregando: true });

      expect(screen.getByText('Carregando seus pedidos...')).toBeOnTheScreen();
      expect(screen.queryByText('Você ainda não fez nenhum pedido')).toBeNull();
    });

    it('mantém a lista na tela enquanto atualiza', () => {
      montar({ carregando: true });

      expect(screen.getByText(/^Pedido nº 12,/)).toBeOnTheScreen();
      expect(screen.queryByText('Carregando seus pedidos...')).toBeNull();
    });

    it('tem um botão Atualizar que busca de novo', () => {
      montar();

      fireEvent.press(screen.getByRole('button', { name: 'Atualizar' }));

      expect(carregar).toHaveBeenCalledTimes(1);
      expect(carregar).toHaveBeenCalledWith(7);
    });

    it('o botão Atualizar mostra que está buscando', () => {
      montar({ carregando: true });

      expect(screen.getByRole('button', { name: 'Atualizar', busy: true })).toBeOnTheScreen();
    });

    it('puxar a lista chama carregar outra vez', async () => {
      montar();

      await act(async () => {
        screen.getByTestId('pedidos-lista').props.refreshControl.props.onRefresh();
      });

      expect(carregar).toHaveBeenCalledTimes(1);
      expect(carregar).toHaveBeenLastCalledWith(7);
    });
  });

  describe('listagem', () => {
    it('lista do mais novo para o mais antigo', () => {
      montar();

      expect(numerosNaTela()).toEqual(['Pedido nº 12', 'Pedido nº 11', 'Pedido nº 10']);
    });

    it('mostra os dados de cada pedido', () => {
      montar();

      expect(screen.getByText('Retirada às 12:00')).toBeOnTheScreen();
      expect(screen.getByText('2x Coxinha, 1x Suco de laranja')).toBeOnTheScreen();
      expect(screen.getByText('R$ 20,00')).toBeOnTheScreen();
      expect(screen.getByText('Em preparo')).toBeOnTheScreen();
      expect(screen.getByText('Pronto para retirar')).toBeOnTheScreen();
      expect(screen.getByText('Retirado')).toBeOnTheScreen();
    });

    it('conta os pedidos', () => {
      montar();

      expect(screen.getByText('3 pedidos')).toBeOnTheScreen();
    });

    it('conta no singular quando só há um', () => {
      montar({ pedidos: [pedidos[0]] });

      expect(screen.getByText('1 pedido')).toBeOnTheScreen();
    });
  });

  describe('status simulado', () => {
    it('faz o pedido recebido andar sozinho com o passar do tempo', () => {
      const novo = { ...pedidos[1], id: 20, status: 'recebido', criadoEm: AGORA.toISOString() };
      montar({ pedidos: [novo] });

      expect(screen.getByText('Recebido')).toBeOnTheScreen();

      act(() => jest.advanceTimersByTime(60 * SEGUNDO));
      expect(screen.getByText('Em preparo')).toBeOnTheScreen();

      act(() => jest.advanceTimersByTime(150 * SEGUNDO));
      expect(screen.getByText('Pronto para retirar')).toBeOnTheScreen();
    });

    it('mostra como retirado o pedido recebido que ficou de outro dia', () => {
      const antigo = { ...pedidos[1], id: 21, status: 'recebido', criadoEm: '2026-11-10T15:00:00.000Z' };
      montar({ pedidos: [antigo] });

      expect(screen.getByText('Retirado')).toBeOnTheScreen();
    });

    it('para o relógio quando a tela sai', () => {
      const { unmount } = montar();

      unmount();

      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('filtro por status', () => {
    it('mostra só os pedidos do status escolhido', () => {
      montar();

      escolherStatus('pronto');

      expect(numerosNaTela()).toEqual(['Pedido nº 11']);
      expect(screen.getByText('1 de 3 pedidos')).toBeOnTheScreen();
    });

    it('volta a mostrar tudo em Todos os status', () => {
      montar();

      escolherStatus('retirado');
      escolherStatus('');

      expect(numerosNaTela()).toHaveLength(3);
      expect(screen.getByText('3 pedidos')).toBeOnTheScreen();
    });

    it('filtra pelo status simulado, não pelo gravado', () => {
      const novo = { ...pedidos[1], id: 20, status: 'recebido', criadoEm: '2026-11-17T14:58:00.000Z' };
      montar({ pedidos: [novo, pedidos[0]] });

      escolherStatus('em preparo');

      expect(numerosNaTela()).toEqual(['Pedido nº 20']);
    });

    it('sem resultado, oferece mostrar todos', () => {
      montar();

      escolherStatus('recebido');

      expect(screen.getByText('Nenhum pedido com esse status')).toBeOnTheScreen();
      expect(screen.getByText('0 de 3 pedidos')).toBeOnTheScreen();
      expect(screen.queryByText(/^Pedido nº/)).toBeNull();

      fireEvent.press(screen.getByRole('button', { name: 'Mostrar todos' }));

      expect(numerosNaTela()).toHaveLength(3);
    });
  });

  describe('sem pedidos', () => {
    it('mostra o estado vazio com atalho para o cardápio', () => {
      montar({ pedidos: [] });

      expect(screen.getByText('Você ainda não fez nenhum pedido')).toBeOnTheScreen();
      expect(screen.getByText('Os pedidos que você fizer pelo app aparecem aqui.')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Status')).toBeNull();

      fireEvent.press(screen.getByRole('button', { name: 'Ver cardápio' }));

      expect(navigation.navigate).toHaveBeenCalledWith(ROTAS.CARDAPIO);
    });
  });

  describe('erro', () => {
    const erro = 'Não deu para carregar seus pedidos. Tente de novo.';

    it('mostra o erro do contexto e tenta de novo', () => {
      montar({ pedidos: [], erro });

      expect(screen.getByText(erro)).toBeOnTheScreen();
      expect(screen.queryByText('Você ainda não fez nenhum pedido')).toBeNull();

      fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

      expect(carregar).toHaveBeenCalledTimes(1);
      expect(carregar).toHaveBeenLastCalledWith(7);
    });

    it('mantém os pedidos que já tinha embaixo do aviso', () => {
      montar({ erro });

      expect(screen.getByText(erro)).toBeOnTheScreen();
      expect(screen.getByText(/^Pedido nº 12,/)).toBeOnTheScreen();
    });
  });

  describe('detalhe', () => {
    it('abre e fecha o detalhe ao tocar no pedido', () => {
      montar();

      expect(screen.queryByText('Sem gelo no suco')).toBeNull();

      fireEvent.press(screen.getByText(/^Pedido nº 12,/));
      expect(screen.getByText('2x Coxinha')).toBeOnTheScreen();
      expect(screen.getByText('R$ 13,00')).toBeOnTheScreen();
      expect(screen.getByText('Sem gelo no suco')).toBeOnTheScreen();

      fireEvent.press(screen.getByText(/^Pedido nº 12,/));
      expect(screen.queryByText('Sem gelo no suco')).toBeNull();
    });

    it('deixa só um pedido aberto por vez', () => {
      montar();

      fireEvent.press(screen.getByText(/^Pedido nº 12,/));
      fireEvent.press(screen.getByText(/^Pedido nº 11,/));

      expect(screen.getByText('1x Café')).toBeOnTheScreen();
      expect(screen.queryByText('Sem gelo no suco')).toBeNull();
      expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
    });
  });
});
