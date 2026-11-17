import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Carregando from '../../src/components/Carregando';

describe('Carregando', () => {
  it('mostra a mensagem que recebe', () => {
    render(<Carregando mensagem="Buscando o cardápio..." />);

    expect(screen.getByText('Buscando o cardápio...')).toBeOnTheScreen();
    expect(screen.getByTestId('carregando-indicador')).toBeOnTheScreen();
  });

  it('sem mensagem mostra um texto padrão', () => {
    render(<Carregando />);

    expect(screen.getByText('Carregando...')).toBeOnTheScreen();
  });
});
