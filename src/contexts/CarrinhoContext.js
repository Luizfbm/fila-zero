import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

  const adicionar = useCallback((produto) => {
    setItens((atuais) => {
      const jaTem = atuais.some((item) => item.produto.id === produto.id);
      if (!jaTem) {
        return [...atuais, { produto, quantidade: 1 }];
      }
      return atuais.map((item) =>
        item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
      );
    });
  }, []);

  const remover = useCallback((produtoId) => {
    setItens((atuais) => semProduto(atuais, produtoId));
  }, []);

  const alterarQuantidade = useCallback((produtoId, quantidade) => {
    setItens((atuais) => {
      if (quantidade <= 0) {
        return semProduto(atuais, produtoId);
      }
      return atuais.map((item) => (item.produto.id === produtoId ? { ...item, quantidade } : item));
    });
  }, []);

  const limpar = useCallback(() => {
    setItens((atuais) => (atuais.length === 0 ? atuais : []));
  }, []);

  // Quem sai da conta não deixa o carrinho para a próxima pessoa que usar o aparelho.
  useEffect(() => {
    if (!usuario) {
      limpar();
    }
  }, [usuario, limpar]);

  const valor = useMemo(() => {
    const total = arredondar(itens.reduce((soma, item) => soma + item.produto.preco * item.quantidade, 0));
    const quantidade = itens.reduce((soma, item) => soma + item.quantidade, 0);
    return { itens, total, quantidade, adicionar, remover, alterarQuantidade, limpar };
  }, [itens, adicionar, remover, alterarQuantidade, limpar]);

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
