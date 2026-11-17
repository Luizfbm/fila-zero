import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { UsuarioProvider, useUsuario } from '../../src/contexts/UsuarioContext';
import { PedidosProvider, usePedidos } from '../../src/contexts/PedidosContext';
import { listarPedidos, criarPedido } from '../../src/services/pedidos';

jest.mock('../../src/services/pedidos');

const ana = { id: 'u1', nome: 'Ana Souza' };
const itens = [{ produtoId: 'p1', nome: 'Coxinha', preco: 6.5, quantidade: 2, categoria: 'salgados' }];
const antigo = {
  id: '1', usuarioId: 'u1', itens, total: 13, retirada: '09:50', observacao: '',
  status: 'retirado', criadoEm: '2026-11-16T12:30:00.000Z',
};
const novo = { usuarioId: 'u1', itens, total: 13, retirada: '10:10', observacao: 'Sem catchup' };
const criado = { ...novo, id: '2', status: 'recebido', criadoEm: '2026-11-17T12:50:00.000Z' };

function envolver({ children }) {
  return (
    <UsuarioProvider>
      <PedidosProvider>{children}</PedidosProvider>
    </UsuarioProvider>
  );
}

function montar() {
  return renderHook(() => ({ pedidos: usePedidos(), conta: useUsuario() }), { wrapper: envolver });
}

function adiar() {
  let resolver;
  let rejeitar;
  const promessa = new Promise((ok, falha) => {
    resolver = ok;
    rejeitar = falha;
  });
  return { promessa, resolver, rejeitar };
}

describe('PedidosContext', () => {
  it('começa sem pedidos, sem erro e sem estar carregando', () => {
    const { result } = montar();

    expect(result.current.pedidos.pedidos).toEqual([]);
    expect(result.current.pedidos.carregando).toBe(false);
    expect(result.current.pedidos.erro).toBeNull();
    expect(result.current.pedidos.origem).toBe('local');
  });

  describe('carregar', () => {
    it('busca os pedidos do usuário e guarda a lista e a origem', async () => {
      listarPedidos.mockResolvedValue({ dados: [antigo], origem: 'api' });
      const { result } = montar();

      await act(() => result.current.pedidos.carregar('u1'));

      expect(listarPedidos).toHaveBeenCalledWith('u1');
      expect(result.current.pedidos.pedidos).toEqual([antigo]);
      expect(result.current.pedidos.origem).toBe('api');
      expect(result.current.pedidos.carregando).toBe(false);
      expect(result.current.pedidos.erro).toBeNull();
    });

    it('fica carregando enquanto o serviço não responde', async () => {
      const espera = adiar();
      listarPedidos.mockReturnValue(espera.promessa);
      const { result } = montar();

      let chamada;
      act(() => {
        chamada = result.current.pedidos.carregar('u1');
      });
      expect(result.current.pedidos.carregando).toBe(true);

      await act(async () => {
        espera.resolver({ dados: [], origem: 'local' });
        await chamada;
      });
      expect(result.current.pedidos.carregando).toBe(false);
    });

    it('mostra uma mensagem em português quando a busca falha', async () => {
      listarPedidos.mockRejectedValue(new Error('Network Error'));
      const { result } = montar();

      await act(() => result.current.pedidos.carregar('u1'));

      expect(result.current.pedidos.erro).toBe('Não deu para carregar seus pedidos. Tente de novo.');
      expect(result.current.pedidos.carregando).toBe(false);
      expect(result.current.pedidos.pedidos).toEqual([]);
    });

    it('limpa o erro anterior ao tentar de novo', async () => {
      listarPedidos.mockRejectedValueOnce(new Error('Network Error'));
      const espera = adiar();
      listarPedidos.mockReturnValueOnce(espera.promessa);
      const { result } = montar();

      await act(() => result.current.pedidos.carregar('u1'));
      let chamada;
      act(() => {
        chamada = result.current.pedidos.carregar('u1');
      });
      expect(result.current.pedidos.erro).toBeNull();

      await act(async () => {
        espera.resolver({ dados: [antigo], origem: 'api' });
        await chamada;
      });
      expect(result.current.pedidos.pedidos).toEqual([antigo]);
    });
  });

  describe('registrar', () => {
    it('cria pelo serviço, põe o pedido no começo da lista e devolve o criado', async () => {
      listarPedidos.mockResolvedValue({ dados: [antigo], origem: 'local' });
      criarPedido.mockResolvedValue({ dados: criado, origem: 'api' });
      const { result } = montar();
      await act(() => result.current.pedidos.carregar('u1'));

      let devolvido;
      await act(async () => {
        devolvido = await result.current.pedidos.registrar(novo);
      });

      expect(criarPedido).toHaveBeenCalledWith(novo);
      expect(devolvido).toEqual(criado);
      expect(result.current.pedidos.pedidos).toEqual([criado, antigo]);
      expect(result.current.pedidos.origem).toBe('api');
    });

    it('repassa o erro do serviço e deixa a lista como estava', async () => {
      listarPedidos.mockResolvedValue({ dados: [antigo], origem: 'api' });
      criarPedido.mockRejectedValue(new Error('falhou'));
      const { result } = montar();
      await act(() => result.current.pedidos.carregar('u1'));

      let erro;
      await act(async () => {
        try {
          await result.current.pedidos.registrar(novo);
        } catch (e) {
          erro = e;
        }
      });

      expect(erro).toEqual(new Error('falhou'));
      expect(result.current.pedidos.pedidos).toEqual([antigo]);
      expect(result.current.pedidos.origem).toBe('api');
    });
  });

  describe('ao sair da conta', () => {
    it('esvazia a lista de pedidos de quem estava logado', async () => {
      listarPedidos.mockResolvedValue({ dados: [antigo], origem: 'api' });
      const { result } = montar();
      act(() => result.current.conta.entrar(ana));
      await act(() => result.current.pedidos.carregar('u1'));

      act(() => result.current.conta.sair());

      expect(result.current.pedidos.pedidos).toEqual([]);
      expect(result.current.pedidos.erro).toBeNull();
      expect(result.current.pedidos.carregando).toBe(false);
    });

    it('descarta a resposta de uma busca que ainda estava em andamento', async () => {
      const espera = adiar();
      listarPedidos.mockReturnValue(espera.promessa);
      const { result } = montar();
      act(() => result.current.conta.entrar(ana));
      let chamada;
      act(() => {
        chamada = result.current.pedidos.carregar('u1');
      });

      act(() => result.current.conta.sair());
      await act(async () => {
        espera.resolver({ dados: [antigo], origem: 'api' });
        await chamada;
      });

      expect(result.current.pedidos.pedidos).toEqual([]);
      expect(result.current.pedidos.carregando).toBe(false);
    });
  });

  it('mantém o mesmo valor e as mesmas funções enquanto o estado não muda', async () => {
    listarPedidos.mockResolvedValue({ dados: [antigo], origem: 'api' });
    const { result, rerender } = montar();
    const antes = result.current.pedidos;

    rerender();
    expect(result.current.pedidos).toBe(antes);

    await act(() => result.current.pedidos.carregar('u1'));
    await waitFor(() => expect(result.current.pedidos.pedidos).toEqual([antigo]));
    expect(result.current.pedidos.carregar).toBe(antes.carregar);
    expect(result.current.pedidos.registrar).toBe(antes.registrar);
  });
});
