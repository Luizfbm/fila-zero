import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import LimiteDeErro from '../../src/components/LimiteDeErro';

let deveQuebrar = false;

function TelaInstavel() {
  if (deveQuebrar) {
    throw new Error('falha de teste');
  }
  return <Text>Tela funcionando</Text>;
}

describe('LimiteDeErro', () => {
  let erroDoConsole;

  beforeEach(() => {
    deveQuebrar = false;
    // O React escreve o erro capturado no console; silencio para não sujar a saída.
    erroDoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    erroDoConsole.mockRestore();
  });

  it('mostra os filhos quando nada quebra', () => {
    render(
      <LimiteDeErro>
        <TelaInstavel />
      </LimiteDeErro>
    );

    expect(screen.getByText('Tela funcionando')).toBeOnTheScreen();
    expect(screen.queryByText('Tentar de novo')).toBeNull();
  });

  it('troca a tela quebrada por um aviso com botão para tentar de novo', () => {
    deveQuebrar = true;

    render(
      <LimiteDeErro>
        <TelaInstavel />
      </LimiteDeErro>
    );

    expect(screen.queryByText('Tela funcionando')).toBeNull();
    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(screen.getByText('Não deu para abrir esta tela')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeOnTheScreen();
  });

  it('volta a mostrar os filhos depois de tentar de novo', () => {
    deveQuebrar = true;

    render(
      <LimiteDeErro>
        <TelaInstavel />
      </LimiteDeErro>
    );

    deveQuebrar = false;
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(screen.getByText('Tela funcionando')).toBeOnTheScreen();
    expect(screen.queryByText('Tentar de novo')).toBeNull();
  });

  it('continua no aviso se a tela quebrar outra vez', () => {
    deveQuebrar = true;

    render(
      <LimiteDeErro>
        <TelaInstavel />
      </LimiteDeErro>
    );

    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeOnTheScreen();
  });
});
