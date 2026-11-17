import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Aviso from '../../src/components/Aviso';
import { cores } from '../../src/theme';

// A fonte dos ícones não carrega no Jest, então troco o ícone por uma View simples.
jest.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: ({ testID }) => createElement(View, { testID }),
  };
});

describe('Aviso', () => {
  it('mostra a mensagem', () => {
    render(<Aviso tipo="info" mensagem="Mostrando o cardápio salvo no aparelho." />);

    expect(
      screen.getByText('Mostrando o cardápio salvo no aparelho.')
    ).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Mostrando o cardápio salvo no aparelho.'
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    ['erro', cores.erroClaro],
    ['info', cores.superficie],
    ['sucesso', cores.sucessoClaro],
  ])('o tipo %s muda a cor de fundo', (tipo, fundo) => {
    render(<Aviso tipo={tipo} mensagem="Pedido enviado." />);

    expect(screen.root).toHaveStyle({ backgroundColor: fundo });
  });

  it('sem tipo se comporta como info', () => {
    render(<Aviso mensagem="Pedido enviado." />);

    expect(screen.root).toHaveStyle({ backgroundColor: cores.superficie });
  });

  it('mostra a ação quando recebe uma', () => {
    const onPress = jest.fn();
    render(
      <Aviso
        tipo="erro"
        mensagem="Não deu para carregar os pedidos."
        acao={{ titulo: 'Tentar de novo', onPress }}
      />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
