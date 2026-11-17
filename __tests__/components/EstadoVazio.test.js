import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EstadoVazio from '../../src/components/EstadoVazio';

// A fonte dos ícones não carrega no Jest, então troco o ícone por uma View simples.
jest.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: ({ testID }) => createElement(View, { testID }),
  };
});

describe('EstadoVazio', () => {
  it('mostra o título e a mensagem', () => {
    render(
      <EstadoVazio
        icone="cart-outline"
        titulo="Seu carrinho está vazio"
        mensagem="Escolha um lanche no cardápio para começar o pedido."
      />
    );

    expect(screen.getByText('Seu carrinho está vazio')).toBeOnTheScreen();
    expect(
      screen.getByText('Escolha um lanche no cardápio para começar o pedido.')
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('mostra a ação quando recebe uma', () => {
    const onPress = jest.fn();
    render(
      <EstadoVazio
        titulo="Seu carrinho está vazio"
        acao={{ titulo: 'Ver cardápio', onPress }}
      />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Ver cardápio' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
