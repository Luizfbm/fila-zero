import React from 'react';
import { render, screen } from '@testing-library/react-native';
import BarraCategoria from '../../src/components/BarraCategoria';
import { cores } from '../../src/theme';

describe('BarraCategoria', () => {
  it('mostra o nome, o valor em reais e o percentual', () => {
    render(<BarraCategoria nome="Lanches" icone="hamburger" valor={32} percentual={42} />);

    expect(screen.getByText('Lanches')).toBeOnTheScreen();
    expect(screen.getByText('R$ 32,00')).toBeOnTheScreen();
    expect(screen.getByText('42%')).toBeOnTheScreen();
  });

  it('descreve a linha inteira para o leitor de tela', () => {
    render(<BarraCategoria nome="Lanches" icone="hamburger" valor={32} percentual={42} />);

    expect(screen.getByLabelText('Lanches: R$ 32,00, 42% do total')).toBeOnTheScreen();
  });

  it('preenche a barra na largura do percentual, sobre um trilho na cor da borda', () => {
    render(<BarraCategoria nome="Lanches" icone="hamburger" valor={32} percentual={42} />);

    expect(screen.getByTestId('barra-trilho')).toHaveStyle({ backgroundColor: cores.borda });
    expect(screen.getByTestId('barra-preenchimento')).toHaveStyle({
      backgroundColor: cores.primaria,
      width: '42%',
    });
  });

  it('não deixa a barra passar do trilho nem ficar negativa', () => {
    const { rerender } = render(<BarraCategoria nome="Lanches" valor={32} percentual={140} />);
    expect(screen.getByTestId('barra-preenchimento')).toHaveStyle({ width: '100%' });

    rerender(<BarraCategoria nome="Lanches" valor={0} percentual={-5} />);
    expect(screen.getByTestId('barra-preenchimento')).toHaveStyle({ width: '0%' });
  });

  it('mostra o ícone da categoria quando recebe um', () => {
    render(<BarraCategoria nome="Lanches" icone="hamburger" valor={32} percentual={42} />);

    expect(screen.getByText('hamburger', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('abaixo de 1% escreve "menos de 1%" e deixa um fio de barra', () => {
    render(<BarraCategoria nome="Doces" icone="cupcake" valor={0.5} percentual={0} />);

    expect(screen.getByText('menos de 1%')).toBeOnTheScreen();
    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.getByLabelText('Doces: R$ 0,50, menos de 1% do total')).toBeOnTheScreen();
    expect(screen.getByTestId('barra-preenchimento')).toHaveStyle({ width: '1%' });
  });

  it('o trilho fica na mesma coluna do nome, depois do ícone', () => {
    render(<BarraCategoria nome="Lanches" icone="hamburger" valor={32} percentual={42} />);

    const coluna = screen.getByTestId('barra-coluna');
    expect(coluna).toContainElement(screen.getByText('Lanches'));
    expect(coluna).toContainElement(screen.getByTestId('barra-trilho'));
    expect(coluna).not.toContainElement(screen.getByText('hamburger', { includeHiddenElements: true }));
  });
});
