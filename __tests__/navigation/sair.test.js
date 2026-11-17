import React, { useState } from 'react';
import { act, configure, fireEvent, render, screen } from '@testing-library/react-native';
import Rotas from '../../src/navigation';
import { useUsuario } from '../../src/contexts/UsuarioContext';
import { useCarrinho } from '../../src/contexts/CarrinhoContext';

jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));
jest.mock('../../src/contexts/CarrinhoContext', () => ({ useCarrinho: jest.fn() }));

function mockDeTela(texto) {
  const ReactDoMock = require('react');
  const { Text } = require('react-native');
  return () => ReactDoMock.createElement(Text, null, texto);
}

// O Cadastro de mentira escreve na tela se o drawer está aberto ou fechado.
jest.mock('../../src/screens/Cadastro', () => {
  const ReactDoMock = require('react');
  const { Text } = require('react-native');
  const { useDrawerStatus } = require('@react-navigation/drawer');
  return () =>
    ReactDoMock.createElement(Text, null, `Tela de cadastro, menu ${useDrawerStatus()}`);
});
jest.mock('../../src/screens/Cardapio', () => mockDeTela('Tela do cardápio'));
jest.mock('../../src/screens/Carrinho', () => mockDeTela('Tela do carrinho'));
jest.mock('../../src/screens/Pedidos', () => mockDeTela('Tela dos pedidos'));
jest.mock('../../src/screens/Painel', () => mockDeTela('Tela do painel'));

jest.useFakeTimers();

beforeAll(() => {
  configure({ defaultIncludeHiddenElements: true });
});

afterAll(() => {
  configure({ defaultIncludeHiddenElements: false });
});

// Guarda o usuário em estado de verdade, para o Sair do menu desmontar as telas logadas.
function AppDeTeste() {
  const [usuario, setUsuario] = useState({ id: '1', nome: 'Ana Souza', curso: 'Direito' });
  useUsuario.mockReturnValue({ usuario, entrar: jest.fn(), sair: () => setUsuario(null) });
  useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 0 });
  return <Rotas />;
}

describe('Sair pelo menu', () => {
  it('fecha o menu e mostra o Cadastro', async () => {
    render(<AppDeTeste />);
    await act(() => jest.runAllTimers());

    fireEvent.press(screen.getByLabelText('Abrir menu'));
    await act(() => jest.runAllTimers());
    fireEvent.press(screen.getByRole('button', { name: 'Sair' }));
    await act(() => jest.runAllTimers());

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeOnTheScreen();
    expect(screen.getByText('Tela de cadastro, menu closed')).toBeOnTheScreen();
  });
});
