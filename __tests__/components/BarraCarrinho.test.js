import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import BarraCarrinho from '../../src/components/BarraCarrinho';

describe('BarraCarrinho', () => {
  it('mostra a quantidade e o total do carrinho', () => {
    render(<BarraCarrinho quantidade={3} total={27.5} aoAbrir={jest.fn()} />);

    expect(screen.getByText('3 itens · R$ 27,50')).toBeOnTheScreen();
    expect(screen.getByText('Ver carrinho')).toBeOnTheScreen();
  });

  it('escreve item no singular quando só tem um', () => {
    render(<BarraCarrinho quantidade={1} total={7.5} aoAbrir={jest.fn()} />);

    expect(screen.getByText('1 item · R$ 7,50')).toBeOnTheScreen();
  });

  it('avisa o pai quando a pessoa toca para ver o carrinho', () => {
    const aoAbrir = jest.fn();
    render(<BarraCarrinho quantidade={2} total={14} aoAbrir={aoAbrir} />);

    fireEvent.press(screen.getByRole('button', { name: 'Ver carrinho, 2 itens, R$ 14,00' }));

    expect(aoAbrir).toHaveBeenCalledTimes(1);
  });

  it('não aparece com o carrinho vazio', () => {
    render(<BarraCarrinho quantidade={0} total={0} aoAbrir={jest.fn()} />);

    expect(screen.queryByText('Ver carrinho')).toBeNull();
  });
});
