import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { UsuarioProvider, useUsuario } from '../../src/contexts/UsuarioContext';
import { CarrinhoProvider, useCarrinho } from '../../src/contexts/CarrinhoContext';

const coxinha = { id: 'p1', nome: 'Coxinha', descricao: 'De frango', preco: 6.5, categoria: 'salgados', disponivel: true };
const suco = { id: 'p2', nome: 'Suco de laranja', descricao: '300 ml', preco: 5.1, categoria: 'bebidas', disponivel: true };
const ana = { id: 'u1', nome: 'Ana Souza' };

function envolver({ children }) {
  return (
    <UsuarioProvider>
      <CarrinhoProvider>{children}</CarrinhoProvider>
    </UsuarioProvider>
  );
}

function montar() {
  return renderHook(() => ({ carrinho: useCarrinho(), conta: useUsuario() }), { wrapper: envolver });
}

describe('CarrinhoContext', () => {
  it('começa vazio', () => {
    const { result } = montar();

    expect(result.current.carrinho.itens).toEqual([]);
    expect(result.current.carrinho.total).toBe(0);
    expect(result.current.carrinho.quantidade).toBe(0);
  });

  it('adiciona um produto com uma unidade', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 1 }]);
  });

  it('soma a quantidade quando o mesmo produto entra de novo', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.adicionar(coxinha));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 2 }]);
  });

  it('calcula total e quantidade a partir dos itens', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.adicionar(suco));

    expect(result.current.carrinho.quantidade).toBe(3);
    expect(result.current.carrinho.total).toBe(18.1);
  });

  it('não deixa sobra de ponto flutuante no total', () => {
    const { result } = montar();
    const bala = { id: 'p3', nome: 'Bala', preco: 0.1, categoria: 'doces', disponivel: true };

    act(() => result.current.carrinho.adicionar(bala));
    act(() => result.current.carrinho.alterarQuantidade('p3', 3));

    expect(result.current.carrinho.total).toBe(0.3);
  });

  it('remove um produto pelo id', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.adicionar(suco));
    act(() => result.current.carrinho.remover('p1'));

    expect(result.current.carrinho.itens).toEqual([{ produto: suco, quantidade: 1 }]);
  });

  it('troca a quantidade de um item', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.alterarQuantidade('p1', 4));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 4 }]);
  });

  it('tira o item quando a quantidade vai para zero ou menos', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.adicionar(suco));
    act(() => result.current.carrinho.alterarQuantidade('p1', 0));
    act(() => result.current.carrinho.alterarQuantidade('p2', -1));

    expect(result.current.carrinho.itens).toEqual([]);
  });

  it('ignora a troca de quantidade de um produto que não está no carrinho', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.alterarQuantidade('p2', 3));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 1 }]);
  });

  it('esvazia tudo com limpar', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.limpar());

    expect(result.current.carrinho.itens).toEqual([]);
    expect(result.current.carrinho.total).toBe(0);
  });

  it('esvazia o carrinho quando a pessoa sai da conta', () => {
    const { result } = montar();

    act(() => result.current.conta.entrar(ana));
    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.conta.sair());

    expect(result.current.carrinho.itens).toEqual([]);
  });

  it('mantém o carrinho de quem montou o pedido antes de se cadastrar', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.conta.entrar(ana));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 1 }]);
  });

  it('trata quantidade que chega como texto sem concatenar', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.alterarQuantidade('p1', '2'));
    act(() => result.current.carrinho.adicionar(coxinha));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 3 }]);
    expect(result.current.carrinho.quantidade).toBe(3);
    expect(result.current.carrinho.total).toBe(19.5);
  });

  it('ignora quantidade que não é número', () => {
    const { result } = montar();

    act(() => result.current.carrinho.adicionar(coxinha));
    act(() => result.current.carrinho.alterarQuantidade('p1', 'abc'));

    expect(result.current.carrinho.itens).toEqual([{ produto: coxinha, quantidade: 1 }]);
  });
});
