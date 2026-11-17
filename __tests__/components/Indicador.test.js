import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Indicador from '../../src/components/Indicador';
import { cores } from '../../src/theme';

describe('Indicador', () => {
  it('mostra o rótulo e o valor', () => {
    render(<Indicador rotulo="Total gasto" valor="R$ 40,00" icone="cash-multiple" />);

    expect(screen.getByText('Total gasto')).toBeOnTheScreen();
    expect(screen.getByText('R$ 40,00')).toBeOnTheScreen();
  });

  it('é lido de uma vez só, como "rótulo: valor"', () => {
    render(<Indicador rotulo="Pedidos" valor="3" icone="receipt-text-outline" />);

    expect(screen.getByLabelText('Pedidos: 3')).toBeOnTheScreen();
  });

  it('mostra o ícone quando recebe um', () => {
    render(<Indicador rotulo="Pedidos" valor="3" icone="receipt-text-outline" />);

    expect(screen.getByText('receipt-text-outline', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('funciona sem ícone', () => {
    render(<Indicador rotulo="Ticket médio" valor="R$ 20,00" />);

    expect(screen.getByText('Ticket médio')).toBeOnTheScreen();
  });

  it('aceita número como valor', () => {
    render(<Indicador rotulo="Pedidos" valor={3} />);

    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pedidos: 3')).toBeOnTheScreen();
  });

  it('deixa o rótulo em tom suave para o valor aparecer mais', () => {
    render(<Indicador rotulo="Total gasto" valor="R$ 40,00" />);

    expect(screen.getByText('Total gasto')).toHaveStyle({ color: cores.textoSuave });
    expect(screen.getByText('R$ 40,00')).toHaveStyle({ color: cores.texto });
  });
});
