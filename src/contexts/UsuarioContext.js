import React, { createContext, useContext } from 'react';

const UsuarioContext = createContext({ usuario: null, entrar: () => {}, sair: () => {} });

export function UsuarioProvider({ children }) {
  return (
    <UsuarioContext.Provider value={{ usuario: null, entrar: () => {}, sair: () => {} }}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
