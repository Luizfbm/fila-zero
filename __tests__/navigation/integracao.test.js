import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import Rotas from '../../src/navigation';
import { UsuarioProvider } from '../../src/contexts/UsuarioContext';
import { CarrinhoProvider } from '../../src/contexts/CarrinhoContext';
import { PedidosProvider } from '../../src/contexts/PedidosContext';

jest.useFakeTimers();

describe('Rotas com os provedores de verdade', () => {
  it('começa no Cadastro, sem menu, enquanto ninguém se cadastrou', async () => {
    render(
      <UsuarioProvider>
        <CarrinhoProvider>
          <PedidosProvider>
            <Rotas />
          </PedidosProvider>
        </CarrinhoProvider>
      </UsuarioProvider>
    );
    await act(() => jest.runAllTimers());

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Abrir menu')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Cardápio' })).toBeNull();
  });
});
