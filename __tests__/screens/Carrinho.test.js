import React, { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Carrinho from '../../src/screens/Carrinho';
import { UsuarioProvider, useUsuario } from '../../src/contexts/UsuarioContext';
import { CarrinhoProvider, useCarrinho } from '../../src/contexts/CarrinhoContext';
import { PedidosProvider } from '../../src/contexts/PedidosContext';
import { criarPedido } from '../../src/services/pedidos';

jest.mock('../../src/services/pedidos');

const ana = { id: 'u1', nome: 'Ana Souza' };
const coxinha = {
  id: 'p1', nome: 'Coxinha de frango', descricao: 'Frita na hora', preco: 6.5, categoria: 'salgados', disponivel: true,
};
const suco = {
  id: 'p2', nome: 'Suco de laranja', descricao: 'Copo de 300 ml', preco: 5, categoria: 'bebidas', disponivel: true,
};
const pao = {
  id: 'p3', nome: 'Pão de queijo', descricao: 'Porção com três', preco: 4, categoria: 'salgados', disponivel: true,
};

// Uma coxinha e dois sucos: R$ 6,50 + R$ 10,00 = R$ 16,50.
const doisProdutos = [coxinha, suco, suco];

const pedidoEsperado = {
  usuarioId: 'u1',
  itens: [
    { produtoId: 'p1', nome: 'Coxinha de frango', preco: 6.5, quantidade: 1, categoria: 'salgados' },
    { produtoId: 'p2', nome: 'Suco de laranja', preco: 5, quantidade: 2, categoria: 'bebidas' },
  ],
  total: 16.5,
  retirada: '09:50',
  observacao: '',
};

function criado(pedido) {
  return {
    dados: { ...pedido, id: '42', status: 'recebido', criadoEm: '2026-11-17T12:00:00.000Z' },
    origem: 'api',
  };
}

// Faz o papel do resto do app: cadastra a Ana e põe produtos no carrinho.
function Preparo({ produtos }) {
  const { entrar } = useUsuario();
  const { adicionar } = useCarrinho();

  useEffect(() => {
    entrar(ana);
    produtos.forEach((produto) => adicionar(produto));
  }, []);

  return (
    <Pressable accessibilityRole="button" onPress={() => adicionar(pao)}>
      <Text>teste: pôr pão de queijo</Text>
    </Pressable>
  );
}

function montar(produtos = doisProdutos) {
  const ouvintes = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((evento, ouvinte) => {
      ouvintes[evento] = ouvinte;
      return jest.fn();
    }),
  };

  render(
    <UsuarioProvider>
      <CarrinhoProvider>
        <PedidosProvider>
          <Preparo produtos={produtos} />
          <Carrinho navigation={navigation} />
        </PedidosProvider>
      </CarrinhoProvider>
    </UsuarioProvider>
  );

  return { navigation, ouvintes };
}

function escolherHorario(horario) {
  fireEvent(screen.getByLabelText('Horário de retirada'), 'valueChange', horario, 1);
}

function confirmar() {
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar pedido' }));
}

async function enviarComSucesso() {
  criarPedido.mockImplementation(async (pedido) => criado(pedido));
  escolherHorario('09:50');
  confirmar();
  await screen.findByText('Pedido nº 42 recebido');
}

describe('Carrinho', () => {
  describe('vazio', () => {
    it('mostra o estado vazio em vez da lista', () => {
      montar([]);

      expect(screen.getByText('Seu carrinho está vazio')).toBeOnTheScreen();
      expect(screen.getByText('cart-outline')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).toBeNull();
    });

    it('leva para o cardápio pela ação', () => {
      const { navigation } = montar([]);

      fireEvent.press(screen.getByRole('button', { name: 'Ver cardápio' }));

      expect(navigation.navigate).toHaveBeenCalledWith('Cardapio');
    });
  });

  describe('com itens', () => {
    it('mostra cada item com o subtotal e o total do pedido', () => {
      montar();

      expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
      expect(screen.getByText('Suco de laranja')).toBeOnTheScreen();
      expect(screen.getByText('R$ 6,50')).toBeOnTheScreen();
      expect(screen.getByText('R$ 10,00')).toBeOnTheScreen();
      expect(screen.getByText('R$ 16,50')).toBeOnTheScreen();
      expect(screen.getByText('3 unidades')).toBeOnTheScreen();
    });

    it('aumentar a quantidade muda o subtotal e o total', () => {
      montar();

      fireEvent.press(screen.getAllByRole('button', { name: 'Aumentar quantidade' })[0]);

      expect(screen.getByText('R$ 13,00')).toBeOnTheScreen();
      expect(screen.getByText('R$ 23,00')).toBeOnTheScreen();
    });

    it('diminuir a quantidade muda o subtotal e o total', () => {
      montar();

      fireEvent.press(screen.getAllByRole('button', { name: 'Diminuir quantidade' })[1]);

      expect(screen.getByText('R$ 5,00')).toBeOnTheScreen();
      expect(screen.getByText('R$ 11,50')).toBeOnTheScreen();
    });

    it('diminuir quando só tem uma unidade tira o item', () => {
      montar();

      fireEvent.press(screen.getAllByRole('button', { name: 'Diminuir quantidade' })[0]);

      expect(screen.queryByText('Coxinha de frango')).toBeNull();
      expect(screen.getAllByText('R$ 10,00')).toHaveLength(2);
    });

    it('remover tira o item e desconta do total', () => {
      montar();

      fireEvent.press(screen.getByRole('button', { name: 'Remover Suco de laranja' }));

      expect(screen.queryByText('Suco de laranja')).toBeNull();
      expect(screen.getAllByText('R$ 6,50')).toHaveLength(2);
      expect(screen.getByText('1 unidade')).toBeOnTheScreen();
    });

    it('remover o último item cai no estado vazio', () => {
      montar([coxinha]);

      fireEvent.press(screen.getByRole('button', { name: 'Remover Coxinha de frango' }));

      expect(screen.getByText('Seu carrinho está vazio')).toBeOnTheScreen();
    });
  });

  describe('retirada e observação', () => {
    it('oferece os horários de intervalo, começando sem nenhum escolhido', () => {
      montar();

      expect(screen.getByText('Retirada')).toBeOnTheScreen();
      expect(screen.getByLabelText('Horário de retirada').props.selectedValue).toBe('');
    });

    it('conta os caracteres da observação', () => {
      montar();
      expect(screen.getByText('0/140')).toBeOnTheScreen();

      fireEvent.changeText(screen.getByLabelText('Observação (opcional)'), 'Sem cebola');

      expect(screen.getByText('10/140')).toBeOnTheScreen();
    });

    it('não deixa a observação passar de 140 caracteres', () => {
      montar();

      fireEvent.changeText(screen.getByLabelText('Observação (opcional)'), 'a'.repeat(150));

      expect(screen.getByText('140/140')).toBeOnTheScreen();
      expect(screen.getByLabelText('Observação (opcional)').props.value).toHaveLength(140);
    });
  });

  describe('confirmar', () => {
    it('sem horário mostra o erro no seletor e não envia', () => {
      montar();

      confirmar();

      expect(screen.getByText('Escolha o horário de retirada')).toBeOnTheScreen();
      expect(criarPedido).not.toHaveBeenCalled();
      expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
    });

    it('o erro do horário some quando a pessoa escolhe um', () => {
      montar();
      confirmar();

      escolherHorario('12:00');

      expect(screen.queryByText('Escolha o horário de retirada')).toBeNull();
    });

    it('envia o pedido no formato combinado', async () => {
      montar();

      await enviarComSucesso();

      expect(criarPedido).toHaveBeenCalledTimes(1);
      expect(criarPedido).toHaveBeenCalledWith(pedidoEsperado);
    });

    it('manda a observação sem espaços sobrando', async () => {
      montar();
      fireEvent.changeText(screen.getByLabelText('Observação (opcional)'), '  Sem cebola ');

      await enviarComSucesso();

      expect(criarPedido).toHaveBeenCalledWith({ ...pedidoEsperado, observacao: 'Sem cebola' });
    });

    it('deixa o botão ocupado enquanto o pedido não volta', async () => {
      let responder;
      criarPedido.mockReturnValue(
        new Promise((ok) => {
          responder = ok;
        })
      );
      montar();
      escolherHorario('09:50');

      confirmar();
      expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeBusy();
      confirmar();
      expect(criarPedido).toHaveBeenCalledTimes(1);

      await act(async () => {
        responder(criado(pedidoEsperado));
      });
      expect(screen.getByText('Pedido nº 42 recebido')).toBeOnTheScreen();
    });

    it('depois de enviar, esvazia o carrinho e mostra a confirmação com o número e o horário', async () => {
      montar();

      await enviarComSucesso();

      expect(screen.getByText('Pedido nº 42 recebido')).toBeOnTheScreen();
      expect(screen.getByText('Retire no balcão às 09:50')).toBeOnTheScreen();
      expect(screen.queryByText('Coxinha de frango')).toBeNull();
      expect(screen.queryByText('Seu carrinho está vazio')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).toBeNull();
    });

    it('a confirmação leva para os pedidos ou de volta ao cardápio', async () => {
      const { navigation } = montar();
      await enviarComSucesso();

      fireEvent.press(screen.getByRole('button', { name: 'Ver meus pedidos' }));
      expect(navigation.navigate).toHaveBeenLastCalledWith('Pedidos');

      fireEvent.press(screen.getByRole('button', { name: 'Voltar ao cardápio' }));
      expect(navigation.navigate).toHaveBeenLastCalledWith('Cardapio');
    });

    it('a confirmação some quando a tela perde o foco', async () => {
      const { ouvintes } = montar();
      await enviarComSucesso();

      act(() => ouvintes.blur());

      expect(screen.queryByText('Pedido nº 42 recebido')).toBeNull();
      expect(screen.getByText('Seu carrinho está vazio')).toBeOnTheScreen();
    });

    it('a confirmação some quando entra item novo no carrinho, e o horário volta a ficar em branco', async () => {
      montar();
      await enviarComSucesso();

      fireEvent.press(screen.getByText('teste: pôr pão de queijo'));

      expect(screen.queryByText('Pedido nº 42 recebido')).toBeNull();
      expect(screen.getByText('Pão de queijo')).toBeOnTheScreen();
      expect(screen.getByLabelText('Horário de retirada').props.selectedValue).toBe('');
    });
  });

  describe('quando o envio falha', () => {
    it('avisa do erro e mantém os itens no carrinho', async () => {
      criarPedido.mockRejectedValue(new Error('Network Error'));
      montar();
      escolherHorario('09:50');

      confirmar();

      expect(
        await screen.findByText('Não deu para enviar o pedido. Seus itens continuam no carrinho.')
      ).toBeOnTheScreen();
      expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
      expect(screen.getByText('R$ 16,50')).toBeOnTheScreen();
      expect(screen.queryByText(/Pedido nº/)).toBeNull();
      expect(screen.getByRole('button', { name: 'Confirmar pedido' })).not.toBeBusy();
    });

    it('tentar de novo reenvia o mesmo pedido', async () => {
      criarPedido.mockRejectedValueOnce(new Error('Network Error'));
      criarPedido.mockImplementationOnce(async (pedido) => criado(pedido));
      montar();
      escolherHorario('09:50');
      confirmar();

      fireEvent.press(await screen.findByRole('button', { name: 'Tentar de novo' }));

      expect(await screen.findByText('Pedido nº 42 recebido')).toBeOnTheScreen();
      expect(criarPedido).toHaveBeenCalledTimes(2);
      expect(criarPedido).toHaveBeenLastCalledWith(pedidoEsperado);
      expect(screen.queryByText(/Não deu para enviar/)).toBeNull();
    });
  });
});
