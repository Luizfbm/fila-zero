import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ControleQuantidade from '../../src/components/ControleQuantidade';

// A fonte dos ícones não carrega no Jest, então troco o ícone por uma View simples.
jest.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: ({ testID }) => createElement(View, { testID }),
  };
});

describe('ControleQuantidade', () => {
  it('mostra a quantidade atual', () => {
    render(
      <ControleQuantidade valor={3} aoDiminuir={jest.fn()} aoAumentar={jest.fn()} />
    );

    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  it('avisa o pai ao diminuir e ao aumentar', () => {
    const aoDiminuir = jest.fn();
    const aoAumentar = jest.fn();
    render(
      <ControleQuantidade valor={2} aoDiminuir={aoDiminuir} aoAumentar={aoAumentar} />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    expect(aoDiminuir).toHaveBeenCalledTimes(1);
    expect(aoAumentar).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade' }));
    expect(aoAumentar).toHaveBeenCalledTimes(1);
  });

  it('os dois botões têm área de toque de pelo menos 44', () => {
    render(
      <ControleQuantidade valor={1} aoDiminuir={jest.fn()} aoAumentar={jest.fn()} />
    );

    screen.getAllByRole('button').forEach((botao) => {
      expect(botao).toHaveStyle({ minWidth: 44, minHeight: 44 });
    });
  });
});
