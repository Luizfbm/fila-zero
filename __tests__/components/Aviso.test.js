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
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    ['erro', cores.erroClaro],
    ['info', cores.alertaClaro],
    ['sucesso', cores.sucessoClaro],
  ])('o tipo %s muda a cor de fundo', (tipo, fundo) => {
    render(<Aviso tipo={tipo} mensagem="Pedido enviado." />);

    expect(screen.root).toHaveStyle({ backgroundColor: fundo });
  });

  it('sem tipo se comporta como info', () => {
    render(<Aviso mensagem="Pedido enviado." />);

    expect(screen.root).toHaveStyle({ backgroundColor: cores.alertaClaro });
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

  it('só o erro interrompe o leitor de tela', () => {
    render(<Aviso tipo='erro' mensagem='Não deu para enviar o pedido.' />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não deu para enviar o pedido.'
    );
  });

  it.each(['info', 'sucesso'])('o tipo %s não usa o papel de alerta', (tipo) => {
    render(<Aviso tipo={tipo} mensagem='Pedido enviado.' />);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Pedido enviado.')).toBeOnTheScreen();
  });

  it('não traz margem própria e aceita um estilo de fora', () => {
    render(<Aviso mensagem='Pedido enviado.' style={{ marginBottom: 16 }} />);

    expect(screen.root).toHaveStyle({ marginBottom: 16 });
  });

  it('sem estilo de fora fica sem margem embaixo', () => {
    render(<Aviso mensagem='Pedido enviado.' />);

    expect(screen.root).not.toHaveStyle({ marginBottom: 16 });
  });
});
