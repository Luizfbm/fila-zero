import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import Cartao from '../../src/components/Cartao';
import { cores } from '../../src/theme';

describe('Cartao', () => {
  it('mostra o conteúdo que recebe', () => {
    render(
      <Cartao>
        <Text>Coxinha de frango</Text>
      </Cartao>
    );

    expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
  });

  it('junta o estilo de fora com o do cartão', () => {
    render(
      <Cartao style={{ marginTop: 8 }}>
        <Text>Suco de laranja</Text>
      </Cartao>
    );

    expect(screen.root).toHaveStyle({
      marginTop: 8,
      backgroundColor: cores.superficie,
    });
  });
});
