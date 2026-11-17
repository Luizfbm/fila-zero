import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Etiqueta from '../../src/components/Etiqueta';
import { cores } from '../../src/theme';

describe('Etiqueta', () => {
  it('mostra o texto', () => {
    render(<Etiqueta texto="em preparo" />);

    expect(screen.getByText('em preparo')).toBeOnTheScreen();
  });

  it.each([
    ['neutro', cores.borda],
    ['sucesso', cores.sucessoClaro],
    ['alerta', cores.destaque],
    ['erro', cores.erroClaro],
  ])('o tom %s muda a cor de fundo', (tom, fundo) => {
    render(<Etiqueta texto="pronto" tom={tom} />);

    expect(screen.root).toHaveStyle({ backgroundColor: fundo });
  });

  it('usa o tom neutro quando não recebe um tom conhecido', () => {
    render(<Etiqueta texto="recebido" tom="qualquer" />);

    expect(screen.root).toHaveStyle({ backgroundColor: cores.borda });
  });
});
