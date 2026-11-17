import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Botao from '../../src/components/Botao';
import { cores } from '../../src/theme';

// A fonte dos ícones não carrega no Jest, então troco o ícone por uma View simples.
jest.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: ({ testID }) => createElement(View, { testID }),
  };
});

describe('Botao', () => {
  it('mostra o título e avisa quando é tocado', () => {
    const onPress = jest.fn();
    render(<Botao titulo="Fazer pedido" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Fazer pedido' }));

    expect(screen.getByText('Fazer pedido')).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('carregando mostra o indicador e não dispara o toque', () => {
    const onPress = jest.fn();
    render(<Botao titulo="Enviar" onPress={onPress} carregando />);

    const botao = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.press(botao);

    expect(screen.getByTestId('botao-carregando')).toBeOnTheScreen();
    expect(botao).toBeBusy();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('sem carregando não mostra o indicador', () => {
    render(<Botao titulo="Enviar" onPress={jest.fn()} />);

    expect(screen.queryByTestId('botao-carregando')).toBeNull();
  });

  it('desabilitado não dispara o toque', () => {
    const onPress = jest.fn();
    render(<Botao titulo="Enviar" onPress={onPress} desabilitado />);

    const botao = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.press(botao);

    expect(botao).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each(['primario', 'secundario', 'texto'])(
    'aceita a variante %s com área de toque de 48',
    (variante) => {
      render(<Botao titulo="Voltar" onPress={jest.fn()} variante={variante} />);

      expect(screen.getByRole('button', { name: 'Voltar' })).toHaveStyle({
        minHeight: 48,
      });
    }
  );

  it('mostra o ícone quando recebe um', () => {
    render(<Botao titulo="Adicionar" onPress={jest.fn()} icone="plus" />);

    expect(screen.getByTestId('botao-icone')).toBeOnTheScreen();
  });

  it('carregando esconde o ícone para sobrar só o indicador', () => {
    render(<Botao titulo='Adicionar' onPress={jest.fn()} icone='plus' carregando />);

    expect(screen.queryByTestId('botao-icone')).toBeNull();
    expect(screen.getByTestId('botao-carregando')).toBeOnTheScreen();
  });

  it.each([
    ['primario', cores.textoSobrePrimaria],
    ['secundario', cores.primariaEscura],
    ['texto', cores.primariaEscura],
  ])('o título da variante %s tem a cor certa', (variante, cor) => {
    render(<Botao titulo='Voltar' onPress={jest.fn()} variante={variante} />);

    expect(screen.getByText('Voltar')).toHaveStyle({ color: cor });
  });
});
