import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CampoSenha from '../../src/components/CampoSenha';
import { cores } from '../../src/theme';

describe('CampoSenha', () => {
  it('mostra o rótulo e repassa o que foi digitado', () => {
    const onChangeText = jest.fn();
    render(<CampoSenha rotulo="Senha" value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByLabelText('Senha'), 'abc123');

    expect(screen.getByText('Senha')).toBeOnTheScreen();
    expect(onChangeText).toHaveBeenCalledWith('abc123');
  });

  it('começa com a senha escondida', () => {
    render(<CampoSenha rotulo="Senha" value="abc123" />);

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeOnTheScreen();
  });

  it('mostra e volta a esconder a senha pelo botão', () => {
    render(<CampoSenha rotulo="Senha" value="abc123" />);

    fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);

    fireEvent.press(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
  });

  it('mostra a mensagem de erro e pinta a borda', () => {
    render(<CampoSenha rotulo="Senha" erro="Crie uma senha" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Crie uma senha');
    expect(screen.getByTestId('campo-senha-caixa')).toHaveStyle({ borderColor: cores.erro });
  });

  it('destaca a borda no foco e continua avisando o pai', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<CampoSenha rotulo="Senha" onFocus={onFocus} onBlur={onBlur} />);
    const caixa = screen.getByTestId('campo-senha-caixa');

    fireEvent(screen.getByLabelText('Senha'), 'focus');
    expect(caixa).toHaveStyle({ borderColor: cores.texto, borderWidth: 2 });
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent(screen.getByLabelText('Senha'), 'blur');
    expect(caixa).toHaveStyle({ borderColor: cores.bordaCampo, borderWidth: 1 });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('aceita um estilo de fora no contêiner', () => {
    render(<CampoSenha rotulo="Senha" style={{ marginBottom: 0 }} />);

    expect(screen.root).toHaveStyle({ marginBottom: 0 });
  });
});
