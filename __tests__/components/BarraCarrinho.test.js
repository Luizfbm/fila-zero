import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import BarraCarrinho from '../../src/components/BarraCarrinho';
import { espacos } from '../../src/theme';

describe('BarraCarrinho', () => {
  it('mostra a quantidade e o total do carrinho em linhas separadas', () => {
    render(<BarraCarrinho quantidade={3} total={27.5} aoAbrir={jest.fn()} />);

    expect(screen.getByText('3 itens')).toBeOnTheScreen();
    expect(screen.getByText('R$ 27,50')).toBeOnTheScreen();
    expect(screen.getByText('Ver carrinho')).toBeOnTheScreen();
  });

  it('escreve item no singular quando só tem um', () => {
    render(<BarraCarrinho quantidade={1} total={7.5} aoAbrir={jest.fn()} />);

    expect(screen.getByText('1 item')).toBeOnTheScreen();
  });

  it('não corta nenhum texto em uma linha só', () => {
    render(<BarraCarrinho quantidade={10} total={120} aoAbrir={jest.fn()} />);

    ['10 itens', 'R$ 120,00', 'Ver carrinho'].forEach((texto) => {
      expect(screen.getByText(texto).props.numberOfLines).toBeUndefined();
    });
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

  it('limita a largura da barra à que o pai mandar', () => {
    render(<BarraCarrinho quantidade={1} total={5} aoAbrir={jest.fn()} larguraMaxima={720} />);

    expect(screen.getByRole('button')).toHaveStyle({ maxWidth: 720 });
  });

  it('sobe acima da barra de gestos do aparelho', () => {
    render(
      <SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 34, left: 0 }}>
        <BarraCarrinho quantidade={1} total={5} aoAbrir={jest.fn()} />
      </SafeAreaInsetsContext.Provider>
    );

    expect(screen.getByTestId('barra-carrinho-faixa')).toHaveStyle({
      paddingBottom: espacos.sm + 34,
    });
  });

  it('sem área segura informada usa só o respiro normal', () => {
    render(<BarraCarrinho quantidade={1} total={5} aoAbrir={jest.fn()} />);

    expect(screen.getByTestId('barra-carrinho-faixa')).toHaveStyle({ paddingBottom: espacos.sm });
  });
});
