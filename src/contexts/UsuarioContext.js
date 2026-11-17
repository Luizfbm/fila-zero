import React, { createContext, useContext, useState } from 'react';

const UsuarioContext = createContext({ usuario: null, entrar: () => {}, sair: () => {} });

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  function entrar(novoUsuario) {
    setUsuario(novoUsuario);
  }

  function sair() {
    setUsuario(null);
  }

  return (
    <UsuarioContext.Provider value={{ usuario, entrar, sair }}>{children}</UsuarioContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
