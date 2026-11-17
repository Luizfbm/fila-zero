import React, { createContext, useContext } from 'react';

const vazio = {
  pedidos: [],
  carregando: false,
  erro: null,
  origem: 'local',
  carregar: async () => {},
  registrar: async () => null,
};

const PedidosContext = createContext(vazio);

export function PedidosProvider({ children }) {
  return <PedidosContext.Provider value={vazio}>{children}</PedidosContext.Provider>;
}

export function usePedidos() {
  return useContext(PedidosContext);
}
