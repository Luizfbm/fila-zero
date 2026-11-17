import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Seletor from '../../src/components/Seletor';

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
});
