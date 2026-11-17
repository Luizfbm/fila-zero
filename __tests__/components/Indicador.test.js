import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Indicador from '../../src/components/Indicador';
import { cores, fontes } from '../../src/theme';

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
    render(<Indicador rotulo="Média por pedido" valor="R$ 20,00" />);

    expect(screen.getByText('Média por pedido')).toBeOnTheScreen();
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

  it('usa o tamanho de subtítulo no valor, para "R$ 1.234,56" caber em tela estreita', () => {
    render(<Indicador rotulo="Total gasto" valor="R$ 1.234,56" />);

    expect(screen.getByText('R$ 1.234,56')).toHaveStyle({ fontSize: fontes.subtitulo.fontSize });
  });

  it('com detalhe, mostra o valor como texto e o detalhe embaixo em legenda', () => {
    render(<Indicador rotulo="Seu preferido" valor="Coxinha de frango" detalhe="2 unidades" />);

    expect(screen.getByText('Coxinha de frango')).toHaveStyle({
      fontSize: fontes.corpo.fontSize,
      fontWeight: '600',
    });
    expect(screen.getByText('Coxinha de frango').props.numberOfLines).toBe(2);
    expect(screen.getByText('2 unidades')).toHaveStyle({ fontSize: fontes.legenda.fontSize });
  });

  it('inclui o detalhe na leitura', () => {
    render(<Indicador rotulo="Seu preferido" valor="Coxinha de frango" detalhe="2 unidades" />);

    expect(screen.getByLabelText('Seu preferido: Coxinha de frango, 2 unidades')).toBeOnTheScreen();
  });
});
