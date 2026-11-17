import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CartaoPedido from '../../src/components/CartaoPedido';
import { formatarData } from '../../src/utils/formatar';
import { cores } from '../../src/theme';

const pedido = {
  id: 12,
  usuarioId: 1,
  itens: [
    { produtoId: 1, nome: 'Coxinha', preco: 6.5, quantidade: 2, categoria: 'salgados' },
    { produtoId: 2, nome: 'Suco de laranja', preco: 7, quantidade: 1, categoria: 'bebidas' },
  ],
  total: 20,
  retirada: '12:00',
  observacao: 'Sem gelo no suco',
  status: 'em preparo',
  criadoEm: '2026-11-17T11:30:00.000Z',
};

function montar(props = {}) {
  const aoAlternar = jest.fn();
  render(
    <CartaoPedido
      pedido={pedido}
      status="em preparo"
      aberto={false}
      aoAlternar={aoAlternar}
      {...props}
    />
  );
  return aoAlternar;
}

// A caixa do Cartao é a primeira View dentro da área tocável.
function caixaDoCartao() {
  const tocavel = screen.getByTestId('cartao-pedido-12');
  return tocavel.findAll((no) => typeof no.type === 'string' && no !== tocavel)[0];
}

describe('CartaoPedido', () => {
  it('mostra número, data, retirada, resumo, total e status', () => {
    montar();

    expect(screen.getByText('Retirada às 12:00')).toBeOnTheScreen();
    expect(
      screen.getByText(`Pedido nº 12, feito em ${formatarData(pedido.criadoEm)}`)
    ).toBeOnTheScreen();
    expect(screen.getByText('2x Coxinha, 1x Suco de laranja')).toBeOnTheScreen();
    expect(screen.getByText('R$ 20,00')).toBeOnTheScreen();
    expect(screen.getByText('Em preparo')).toBeOnTheScreen();
  });

  it('usa o status recebido por prop, não o que está gravado no pedido', () => {
    montar({ status: 'pronto' });

    expect(screen.getByText('Pronto para retirar')).toBeOnTheScreen();
    expect(screen.queryByText('Em preparo')).toBeNull();
  });

  it('fechado, é um botão recolhido e não mostra o detalhe', () => {
    montar();

    expect(screen.getByRole('button', { expanded: false })).toBeOnTheScreen();
    expect(screen.queryByText('R$ 13,00')).toBeNull();
    expect(screen.queryByText('Sem gelo no suco')).toBeNull();
  });

  it('aberto, lista os itens com quantidade e subtotal e a observação', () => {
    montar({ aberto: true });

    expect(screen.getByRole('button', { expanded: true })).toBeOnTheScreen();
    expect(screen.getByText('2x Coxinha')).toBeOnTheScreen();
    expect(screen.getByText('R$ 13,00')).toBeOnTheScreen();
    expect(screen.getByText('1x Suco de laranja')).toBeOnTheScreen();
    expect(screen.getByText('R$ 7,00')).toBeOnTheScreen();
    expect(screen.getByText('Observação')).toBeOnTheScreen();
    expect(screen.getByText('Sem gelo no suco')).toBeOnTheScreen();
  });

  it('aberto e sem observação, não mostra o título da observação', () => {
    montar({ aberto: true, pedido: { ...pedido, observacao: '   ' } });

    expect(screen.queryByText('Observação')).toBeNull();
  });

  it('avisa o pai com o id do pedido quando é tocado', () => {
    const aoAlternar = montar();

    fireEvent.press(screen.getByRole('button'));

    expect(aoAlternar).toHaveBeenCalledTimes(1);
    expect(aoAlternar).toHaveBeenCalledWith(12);
  });

  it('não quebra com pedido sem itens e sem horário de retirada', () => {
    montar({ pedido: { id: 3, total: 0, status: 'recebido', criadoEm: pedido.criadoEm }, status: 'recebido' });

    expect(screen.getByText(/^Pedido nº 3, feito em/)).toBeOnTheScreen();
    expect(screen.queryByText(/Retirada/)).toBeNull();
  });

  it('mostra o número sem o prefixo do pedido guardado só no aparelho', () => {
    montar({ pedido: { ...pedido, id: 'local-1' } });

    expect(screen.getByText(/^Pedido nº 1, feito em/)).toBeOnTheScreen();
    expect(screen.queryByText(/local-/)).toBeNull();
  });

  it('avisa o pai com o id inteiro, com prefixo e tudo', () => {
    const aoAlternar = montar({ pedido: { ...pedido, id: 'local-1' } });

    fireEvent.press(screen.getByRole('button'));

    expect(aoAlternar).toHaveBeenCalledWith('local-1');
  });

  it('mostra só o número quando a data do pedido não dá para ler', () => {
    montar({ pedido: { ...pedido, criadoEm: 'ontem' } });

    expect(screen.getByText('Pedido nº 12')).toBeOnTheScreen();
  });

  it('aberto, troca o resumo pela palavra Total ao lado do valor', () => {
    montar({ aberto: true });

    expect(screen.queryByText('2x Coxinha, 1x Suco de laranja')).toBeNull();
    expect(screen.getByText('Total')).toBeOnTheScreen();
    expect(screen.getByText('R$ 20,00')).toBeOnTheScreen();
  });

  it('diz no hint o que o toque faz', () => {
    montar();
    expect(screen.getByHintText('Mostra os itens do pedido')).toBeOnTheScreen();

    screen.unmount();
    montar({ aberto: true });
    expect(screen.getByHintText('Esconde os itens do pedido')).toBeOnTheScreen();
  });

  it('pedido retirado fica com o texto apagado', () => {
    montar({ status: 'retirado' });

    expect(screen.getByText('Retirada às 12:00')).toHaveStyle({ color: cores.textoSuave });
    expect(screen.getByText('R$ 20,00')).toHaveStyle({ color: cores.textoSuave });
  });

  it('pedido em andamento fica com o texto na cor normal', () => {
    montar();

    expect(screen.getByText('Retirada às 12:00')).toHaveStyle({ color: cores.texto });
  });

  it('pedido pronto ganha a borda na cor de sucesso', () => {
    montar({ status: 'pronto' });

    expect(caixaDoCartao()).toHaveStyle({
      borderColor: cores.sucesso,
    });
  });

  it('os outros status ficam com a borda comum', () => {
    montar();

    expect(caixaDoCartao()).toHaveStyle({
      borderColor: cores.borda,
    });
  });
});
