import React, { createContext, useContext } from 'react';

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

export function CarrinhoProvider({ children }) {
  return <CarrinhoContext.Provider value={vazio}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
