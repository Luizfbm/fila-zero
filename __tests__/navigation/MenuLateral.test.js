import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { act, configure, fireEvent, render, screen } from '@testing-library/react-native';
import MenuLateral from '../../src/navigation/MenuLateral';
import { ROTAS } from '../../src/navigation/rotas';
import { useUsuario } from '../../src/contexts/UsuarioContext';
import { useCarrinho } from '../../src/contexts/CarrinhoContext';

jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));
jest.mock('../../src/contexts/CarrinhoContext', () => ({ useCarrinho: jest.fn() }));

jest.useFakeTimers();

const Drawer = createDrawerNavigator();

const usuario = { id: '1', nome: 'Luiz Filipe Miranda', curso: 'Sistemas de Informação' };

function TelaCardapio() {
  return <Text>Tela do cardápio</Text>;
}

function TelaCarrinho() {
  return <Text>Tela do carrinho</Text>;
}

function TelaPedidos() {
  return <Text>Tela dos pedidos</Text>;
}

function TelaPainel() {
  return <Text>Tela do painel</Text>;
}

function Navegacao() {
  return (
    <NavigationContainer>
      <Drawer.Navigator drawerContent={(props) => <MenuLateral {...props} />}>
        <Drawer.Screen name={ROTAS.CARDAPIO} component={TelaCardapio} options={{ title: 'Cardápio' }} />
        <Drawer.Screen name={ROTAS.CARRINHO} component={TelaCarrinho} options={{ title: 'Carrinho' }} />
        <Drawer.Screen name={ROTAS.PEDIDOS} component={TelaPedidos} options={{ title: 'Meus pedidos' }} />
        <Drawer.Screen name={ROTAS.PAINEL} component={TelaPainel} options={{ title: 'Painel' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// O drawer fechado fica marcado como escondido para leitor de tela, e no Jest essa marca
// não muda quando ele abre. Por isso as buscas daqui também olham elementos escondidos.
beforeAll(() => {
  configure({ defaultIncludeHiddenElements: true });
});

afterAll(() => {
  configure({ defaultIncludeHiddenElements: false });
});

async function abrirMenu() {
  render(<Navegacao />);
  await act(() => jest.runAllTimers());
}

describe('MenuLateral', () => {
  let sair;

  beforeEach(() => {
    sair = jest.fn();
    useUsuario.mockReturnValue({ usuario, entrar: jest.fn(), sair });
    useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 0 });
  });

  it('mostra as iniciais, o nome e o curso de quem está logado', async () => {
    await abrirMenu();

    expect(screen.getByText('LM')).toBeOnTheScreen();
    expect(screen.getByText('Luiz Filipe Miranda')).toBeOnTheScreen();
    expect(screen.getByText('Sistemas de Informação')).toBeOnTheScreen();
  });

  it('usa uma letra só quando o nome tem uma palavra', async () => {
    useUsuario.mockReturnValue({ usuario: { ...usuario, nome: '  ana ' }, sair });

    await abrirMenu();

    expect(screen.getByText('A')).toBeOnTheScreen();
  });

  it('lista as rotas pelo título e marca a que está aberta', async () => {
    await abrirMenu();

    expect(screen.getByRole('button', { name: 'Cardápio' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Carrinho' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Meus pedidos' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Painel' })).not.toBeSelected();
  });

  it('leva para a tela do item tocado', async () => {
    await abrirMenu();

    fireEvent.press(screen.getByRole('button', { name: 'Meus pedidos' }));
    await act(() => jest.runAllTimers());

    expect(screen.getByText('Tela dos pedidos')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Meus pedidos' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Cardápio' })).not.toBeSelected();
  });

  it('não mostra contador com o carrinho vazio', async () => {
    await abrirMenu();

    expect(screen.queryByTestId('contador-do-carrinho')).toBeNull();
  });

  it('mostra quantos itens tem no carrinho ao lado de Carrinho', async () => {
    useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 3 });

    await abrirMenu();

    expect(screen.getByTestId('contador-do-carrinho')).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: 'Carrinho, 3 itens' })).toBeOnTheScreen();
  });

  it('fala "1 item" quando só tem uma unidade no carrinho', async () => {
    useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 1 });

    await abrirMenu();

    expect(screen.getByRole('button', { name: 'Carrinho, 1 item' })).toBeOnTheScreen();
  });

  it('mostra 99 no contador enquanto cabe', async () => {
    useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 99 });

    await abrirMenu();

    expect(screen.getByTestId('contador-do-carrinho')).toHaveTextContent('99');
  });

  it('troca o contador por 99+ a partir de 100 itens', async () => {
    useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 100 });

    await abrirMenu();

    expect(screen.getByTestId('contador-do-carrinho')).toHaveTextContent('99+');
    expect(screen.getByRole('button', { name: 'Carrinho, 100 itens' })).toBeOnTheScreen();
  });

  it('chama sair ao tocar em Sair', async () => {
    await abrirMenu();

    fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    expect(sair).toHaveBeenCalledTimes(1);
  });

  it('fica vazio enquanto ninguém se cadastrou', async () => {
    useUsuario.mockReturnValue({ usuario: null, sair });

    await abrirMenu();

    expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cardápio' })).toBeNull();
  });
});
