import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUsuario } from './UsuarioContext';

const vazio = {
  itens: [],
  total: 0,
  quantidade: 0,
  adicionar: () => {},
  remover: () => {},
  alterarQuantidade: () => {},
  limpar: () => {},
};

const CarrinhoContext = createContext(vazio);

function semProduto(itens, produtoId) {
  return itens.filter((item) => item.produto.id !== produtoId);
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

export function CarrinhoProvider({ children }) {
  const { usuario } = useUsuario();
  const [itens, setItens] = useState([]);

  // Quem sai da conta não deixa o carrinho para a próxima pessoa que usar o aparelho.
  useEffect(() => {
    if (!usuario) {
      setItens([]);
    }
  }, [usuario]);

  function adicionar(produto) {
    setItens((atuais) => {
      const jaTem = atuais.some((item) => item.produto.id === produto.id);
      if (!jaTem) {
        return [...atuais, { produto, quantidade: 1 }];
      }
      return atuais.map((item) =>
        item.produto.id === produto.id ? { ...item, quantidade: Number(item.quantidade) + 1 } : item
      );
    });
  }

  function remover(produtoId) {
    setItens((atuais) => semProduto(atuais, produtoId));
  }

  function alterarQuantidade(produtoId, quantidade) {
    const novaQuantidade = Number(quantidade);
    if (Number.isNaN(novaQuantidade)) {
      return;
    }
    setItens((atuais) => {
      if (novaQuantidade <= 0) {
        return semProduto(atuais, produtoId);
      }
      return atuais.map((item) =>
        item.produto.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      );
    });
  }

  function limpar() {
    setItens([]);
  }

  const total = arredondar(itens.reduce((soma, item) => soma + item.produto.preco * item.quantidade, 0));
  const quantidade = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <CarrinhoContext.Provider
      value={{ itens, total, quantidade, adicionar, remover, alterarQuantidade, limpar }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
