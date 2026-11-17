import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CampoTexto from '../../src/components/CampoTexto';
import { cores } from '../../src/theme';

describe('CampoTexto', () => {
  it('mostra o rótulo e repassa o que foi digitado', () => {
    const onChangeText = jest.fn();
    render(<CampoTexto rotulo="Nome" value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByLabelText('Nome'), 'Luiz');

    expect(screen.getByText('Nome')).toBeOnTheScreen();
    expect(onChangeText).toHaveBeenCalledWith('Luiz');
  });

  it('repassa as props do TextInput', () => {
    render(<CampoTexto rotulo="E-mail" placeholder="voce@faculdade.br" />);

    expect(screen.getByPlaceholderText('voce@faculdade.br')).toBeOnTheScreen();
  });

  it('mostra a mensagem de erro e pinta a borda', () => {
    render(<CampoTexto rotulo="E-mail" erro="Informe um e-mail válido." />);

    expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toHaveStyle({
      borderColor: cores.erro,
    });
  });

  it('sem erro fica com a borda padrão e sem mensagem', () => {
    render(<CampoTexto rotulo="E-mail" />);

    expect(screen.getByLabelText('E-mail')).toHaveStyle({
      borderColor: cores.bordaCampo,
      borderWidth: 1,
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('destaca a borda no foco e continua avisando o pai', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<CampoTexto rotulo="Curso" onFocus={onFocus} onBlur={onBlur} />);
    const campo = screen.getByLabelText('Curso');

    fireEvent(campo, 'focus');
    expect(campo).toHaveStyle({ borderColor: cores.texto, borderWidth: 2 });
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent(campo, 'blur');
    expect(campo).toHaveStyle({ borderColor: cores.bordaCampo, borderWidth: 1 });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('a borda mais grossa do foco não muda o tamanho do campo', () => {
    render(<CampoTexto rotulo='Curso' />);
    const campo = screen.getByLabelText('Curso');
    const ocupado = () => {
      const { borderWidth, paddingHorizontal, paddingVertical } = StyleSheet.flatten(
        campo.props.style
      );
      return [borderWidth + paddingHorizontal, borderWidth + paddingVertical];
    };

    const antes = ocupado();
    fireEvent(campo, 'focus');

    expect(ocupado()).toEqual(antes);
  });

  it('aceita um estilo de fora no contêiner', () => {
    render(<CampoTexto rotulo='Curso' style={{ marginBottom: 0 }} />);

    expect(screen.root).toHaveStyle({ marginBottom: 0 });
  });
});
