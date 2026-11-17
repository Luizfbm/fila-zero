import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UsuarioContext = createContext({ usuario: null, entrar: () => {}, sair: () => {} });

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const entrar = useCallback((novoUsuario) => setUsuario(novoUsuario), []);
  const sair = useCallback(() => setUsuario(null), []);

  const valor = useMemo(() => ({ usuario, entrar, sair }), [usuario, entrar, sair]);

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
