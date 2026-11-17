import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Seletor from '../../src/components/Seletor';
import { cores } from '../../src/theme';

const opcoes = [
  { rotulo: 'Todas', valor: '' },
  { rotulo: 'Salgados', valor: 'salgados' },
  { rotulo: 'Bebidas', valor: 'bebidas' },
  { rotulo: 'Combo do dia', valor: 7 },
];

describe('Seletor', () => {
  it('mostra o rótulo', () => {
    render(
      <Seletor rotulo="Categoria" valor="" aoMudar={jest.fn()} opcoes={opcoes} />
    );

    expect(screen.getByText('Categoria')).toBeOnTheScreen();
    expect(screen.getByLabelText('Categoria')).toBeOnTheScreen();
  });

  it('avisa o pai com o valor escolhido', () => {
    const aoMudar = jest.fn();
    render(
      <Seletor rotulo="Categoria" valor="" aoMudar={aoMudar} opcoes={opcoes} />
    );

    fireEvent(screen.getByLabelText('Categoria'), 'valueChange', 'bebidas', 2);

    expect(aoMudar).toHaveBeenCalledWith('bebidas');
  });

  it('devolve o valor original mesmo quando a web entrega texto', () => {
    const aoMudar = jest.fn();
    render(
      <Seletor rotulo="Categoria" valor="" aoMudar={aoMudar} opcoes={opcoes} />
    );

    fireEvent(screen.getByLabelText('Categoria'), 'valueChange', '7', 3);

    expect(aoMudar).toHaveBeenCalledWith(7);
  });

  it('mostra a mensagem de erro', () => {
    render(
      <Seletor
        rotulo="Curso"
        valor=""
        aoMudar={jest.fn()}
        opcoes={opcoes}
        erro="Escolha o seu curso."
      />
    );

    expect(screen.getByText('Escolha o seu curso.')).toBeOnTheScreen();
  });

  it('não quebra sem opções', () => {
    render(<Seletor rotulo="Curso" valor="" aoMudar={jest.fn()} />);

    expect(screen.getByText('Curso')).toBeOnTheScreen();
  });

  it('em repouso a caixa tem a borda de campo', () => {
    render(
      <Seletor rotulo='Categoria' valor='' aoMudar={jest.fn()} opcoes={opcoes} />
    );

    expect(screen.getByTestId('seletor-caixa')).toHaveStyle({
      borderColor: cores.bordaCampo,
      borderWidth: 1,
    });
  });

  it('destaca a borda no foco sem mudar o tamanho da caixa', () => {
    render(
      <Seletor rotulo='Categoria' valor='' aoMudar={jest.fn()} opcoes={opcoes} />
    );
    const caixa = screen.getByTestId('seletor-caixa');
    const ocupado = () => {
      const { borderWidth, padding } = StyleSheet.flatten(caixa.props.style);
      return borderWidth + padding;
    };
    const antes = ocupado();

    fireEvent(screen.getByLabelText('Categoria'), 'focus');
    expect(caixa).toHaveStyle({ borderColor: cores.texto, borderWidth: 2 });
    expect(ocupado()).toBe(antes);

    fireEvent(screen.getByLabelText('Categoria'), 'blur');
    expect(caixa).toHaveStyle({ borderColor: cores.bordaCampo, borderWidth: 1 });
  });

  it('com erro a borda da caixa fica na cor de erro', () => {
    render(
      <Seletor
        rotulo='Curso'
        valor=''
        aoMudar={jest.fn()}
        opcoes={opcoes}
        erro='Escolha o seu curso.'
      />
    );

    expect(screen.getByTestId('seletor-caixa')).toHaveStyle({
      borderColor: cores.erro,
    });
  });

  it('aceita um estilo de fora no contêiner', () => {
    render(
      <Seletor
        rotulo='Curso'
        valor=''
        aoMudar={jest.fn()}
        opcoes={opcoes}
        style={{ marginBottom: 0 }}
      />
    );

    expect(screen.root).toHaveStyle({ marginBottom: 0 });
  });
});
