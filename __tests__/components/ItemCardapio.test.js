import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ItemCardapio from '../../src/components/ItemCardapio';

const coxinha = {
  id: '1',
  nome: 'Coxinha de frango',
  descricao: 'Frango desfiado com requeijão, frita na hora.',
  preco: 7.5,
  categoria: 'salgados',
  disponivel: true,
};

const salgados = { id: 'salgados', nome: 'Salgados', icone: 'food-croissant' };

function montar(props = {}) {
  const funcoes = {
    aoAdicionar: jest.fn(),
    aoAumentar: jest.fn(),
    aoDiminuir: jest.fn(),
  };
  render(
    <ItemCardapio
      produto={coxinha}
      categoria={salgados}
      quantidade={0}
      {...funcoes}
      {...props}
    />
  );
  return funcoes;
}

describe('ItemCardapio', () => {
  it('mostra nome, descrição, preço formatado e o ícone da categoria', () => {
    montar();

    expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
    expect(screen.getByText('Frango desfiado com requeijão, frita na hora.')).toBeOnTheScreen();
    expect(screen.getByText('R$ 7,50')).toBeOnTheScreen();
    expect(screen.getByText('food-croissant')).toBeOnTheScreen();
  });

  it('limita a descrição a duas linhas', () => {
    montar();

    expect(
      screen.getByText('Frango desfiado com requeijão, frita na hora.').props.numberOfLines
    ).toBe(2);
  });

  it('usa um ícone padrão quando a categoria não veio', () => {
    montar({ categoria: undefined });

    expect(screen.getByText('food')).toBeOnTheScreen();
  });

  it('fora do carrinho, o botão Adicionar avisa o pai com o produto', () => {
    const { aoAdicionar } = montar();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Coxinha de frango' }));

    expect(aoAdicionar).toHaveBeenCalledWith(coxinha);
    expect(screen.queryByRole('button', { name: 'Aumentar quantidade' })).toBeNull();
  });

  it('no carrinho, troca o botão pelo controle de quantidade', () => {
    const { aoAumentar, aoDiminuir } = montar({ quantidade: 2 });

    expect(screen.queryByRole('button', { name: 'Adicionar Coxinha de frango' })).toBeNull();
    expect(screen.getByText('2')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade' }));
    expect(aoAumentar).toHaveBeenCalledWith(coxinha);

    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    expect(aoDiminuir).toHaveBeenCalledWith(coxinha);
  });

  it('esgotado mostra a etiqueta e nenhum botão', () => {
    montar({ produto: { ...coxinha, disponivel: false } });

    expect(screen.getByText('Esgotado')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('esgotado fica esmaecido', () => {
    montar({ produto: { ...coxinha, disponivel: false } });

    expect(screen.getByTestId('item-cardapio-conteudo')).toHaveStyle({ opacity: 0.55 });
  });
});
