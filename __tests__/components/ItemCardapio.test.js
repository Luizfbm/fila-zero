import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ItemCardapio from '../../src/components/ItemCardapio';
import { cores, fontes } from '../../src/theme';

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
    // O ícone é enfeite e fica fora da leitura de tela, por isso a busca inclui os escondidos.
    expect(screen.getByText('food-croissant', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('limita a descrição a duas linhas', () => {
    montar();

    expect(
      screen.getByText('Frango desfiado com requeijão, frita na hora.').props.numberOfLines
    ).toBe(2);
  });

  it('usa um ícone padrão quando a categoria não veio', () => {
    montar({ categoria: undefined });

    expect(screen.getByText('food', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('fora do carrinho, o botão Adicionar avisa o pai com o produto', () => {
    const { aoAdicionar } = montar();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Coxinha de frango' }));

    expect(aoAdicionar).toHaveBeenCalledWith(coxinha);
    expect(screen.queryByRole('button', { name: /^Aumentar quantidade/ })).toBeNull();
  });

  it('no carrinho, troca o botão pelo controle de quantidade', () => {
    const { aoAumentar, aoDiminuir } = montar({ quantidade: 2 });

    expect(screen.queryByRole('button', { name: 'Adicionar Coxinha de frango' })).toBeNull();
    expect(screen.getByText('2')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade de Coxinha de frango' }));
    expect(aoAumentar).toHaveBeenCalledWith(coxinha);

    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade de Coxinha de frango' }));
    expect(aoDiminuir).toHaveBeenCalledWith(coxinha);
  });

  it('esgotado mostra a etiqueta e nenhum botão', () => {
    montar({ produto: { ...coxinha, disponivel: false } });

    expect(screen.getByText('Esgotado')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('esgotado esmaece só o ícone e o preço, e o texto fica na cor suave', () => {
    montar({ produto: { ...coxinha, disponivel: false } });

    expect(screen.getByTestId('item-cardapio-icone')).toHaveStyle({ opacity: 0.55 });
    expect(screen.getByText('R$ 7,50')).toHaveStyle({ opacity: 0.55 });
    expect(screen.getByText('Coxinha de frango')).toHaveStyle({ color: cores.textoSuave });
    expect(screen.getByText('Frango desfiado com requeijão, frita na hora.')).toHaveStyle({
      color: cores.textoSuave,
    });
    expect(screen.getByText('Coxinha de frango')).not.toHaveStyle({ opacity: 0.55 });
  });

  it('disponível mantém o nome na cor normal do texto', () => {
    montar();

    expect(screen.getByText('Coxinha de frango')).toHaveStyle({ color: cores.texto });
    expect(screen.getByTestId('item-cardapio-icone')).not.toHaveStyle({ opacity: 0.55 });
  });

  it('só usa tamanhos de letra do tema', () => {
    montar();

    expect(screen.getByText('R$ 7,50')).toHaveStyle({ fontSize: fontes.corpo.fontSize });
    expect(screen.getByText('Adicionar')).toHaveStyle({ fontSize: fontes.corpo.fontSize });
    expect(screen.getByText('Frango desfiado com requeijão, frita na hora.')).toHaveStyle({
      fontSize: fontes.legenda.fontSize,
    });
  });
});
