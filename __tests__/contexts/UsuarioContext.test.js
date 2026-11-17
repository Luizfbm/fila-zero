import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { UsuarioProvider, useUsuario } from '../../src/contexts/UsuarioContext';

const ana = { id: 'u1', nome: 'Ana Souza', email: 'ana@faculdade.edu.br' };

function envolver({ children }) {
  return <UsuarioProvider>{children}</UsuarioProvider>;
}

describe('UsuarioContext', () => {
  it('começa sem usuário', () => {
    const { result } = renderHook(() => useUsuario(), { wrapper: envolver });

    expect(result.current.usuario).toBeNull();
  });

  it('guarda o usuário ao entrar', () => {
    const { result } = renderHook(() => useUsuario(), { wrapper: envolver });

    act(() => result.current.entrar(ana));

    expect(result.current.usuario).toEqual(ana);
  });

  it('volta a ficar sem usuário ao sair', () => {
    const { result } = renderHook(() => useUsuario(), { wrapper: envolver });

    act(() => result.current.entrar(ana));
    act(() => result.current.sair());

    expect(result.current.usuario).toBeNull();
  });
});
