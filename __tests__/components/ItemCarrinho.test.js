import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ItemCarrinho from '../../src/components/ItemCarrinho';

const coxinha = {
  id: 'p1',
  nome: 'Coxinha de frango',
  descricao: 'Frita na hora',
  preco: 6.5,
  categoria: 'salgados',
  disponivel: true,
};

function montar(quantidade = 3) {
  const aoAumentar = jest.fn();
  const aoDiminuir = jest.fn();
  const aoRemover = jest.fn();
  render(
    <ItemCarrinho
      item={{ produto: coxinha, quantidade }}
      aoAumentar={aoAumentar}
      aoDiminuir={aoDiminuir}
      aoRemover={aoRemover}
    />
  );
  return { aoAumentar, aoDiminuir, aoRemover };
}

describe('ItemCarrinho', () => {
  it('mostra o nome, o preço de uma unidade e a quantidade', () => {
    montar(3);

    expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
    expect(screen.getByText('R$ 6,50 cada')).toBeOnTheScreen();
    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  it('mostra o subtotal do item', () => {
    montar(3);

    expect(screen.getByText('R$ 19,50')).toBeOnTheScreen();
  });

  it('não erra o subtotal por causa de casas decimais', () => {
    render(
      <ItemCarrinho
        item={{ produto: { ...coxinha, preco: 0.1 }, quantidade: 3 }}
        aoAumentar={jest.fn()}
        aoDiminuir={jest.fn()}
        aoRemover={jest.fn()}
      />
    );

    expect(screen.getByText('R$ 0,30')).toBeOnTheScreen();
  });

  it('avisa o pai ao aumentar e ao diminuir', () => {
    const { aoAumentar, aoDiminuir, aoRemover } = montar(2);

    fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade' }));
    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade' }));

    expect(aoAumentar).toHaveBeenCalledTimes(1);
    expect(aoDiminuir).toHaveBeenCalledTimes(1);
    expect(aoRemover).not.toHaveBeenCalled();
  });

  it('tem um botão de remover que diz o nome do produto', () => {
    const { aoRemover } = montar(2);

    fireEvent.press(screen.getByRole('button', { name: 'Remover Coxinha de frango' }));

    expect(aoRemover).toHaveBeenCalledTimes(1);
  });
});
