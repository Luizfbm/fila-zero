import React from 'react';
import { act, configure, fireEvent, render, screen } from '@testing-library/react-native';
import Rotas from '../../src/navigation';
import { cores } from '../../src/theme';
import { useUsuario } from '../../src/contexts/UsuarioContext';
import { useCarrinho } from '../../src/contexts/CarrinhoContext';

jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));
jest.mock('../../src/contexts/CarrinhoContext', () => ({ useCarrinho: jest.fn() }));

// As telas de verdade são de outras frentes. Aqui cada uma vira um texto simples.
function mockDeTela(texto) {
  const ReactDoMock = require('react');
  const { Text } = require('react-native');
  return () => ReactDoMock.createElement(Text, null, texto);
}

jest.mock('../../src/screens/Cadastro', () => mockDeTela('Tela de cadastro'));
jest.mock('../../src/screens/Cardapio', () => mockDeTela('Tela do cardápio'));
jest.mock('../../src/screens/Carrinho', () => mockDeTela('Tela do carrinho'));
jest.mock('../../src/screens/Pedidos', () => mockDeTela('Tela dos pedidos'));
jest.mock('../../src/screens/Painel', () => {
  const ReactDoMock = require('react');
  const { Text } = require('react-native');
  return () => {
    if (global.painelDeveQuebrar) {
      throw new Error('falha de teste');
    }
    return ReactDoMock.createElement(Text, null, 'Tela do painel');
  };
});

jest.useFakeTimers();

const usuario = { id: '1', nome: 'Luiz Filipe Miranda', curso: 'Sistemas de Informação' };

function logar() {
  useUsuario.mockReturnValue({ usuario, entrar: jest.fn(), sair: jest.fn() });
}

function deslogar() {
  useUsuario.mockReturnValue({ usuario: null, entrar: jest.fn(), sair: jest.fn() });
}

async function abrir() {
  const resultado = render(<Rotas />);
  await act(() => jest.runAllTimers());
  return resultado;
}

async function tocarNoMenu(nome) {
  fireEvent.press(screen.getByRole('button', { name: nome }));
  await act(() => jest.runAllTimers());
}

// O drawer fechado fica marcado como escondido para leitor de tela, e no Jest essa marca
// não muda quando ele abre. Por isso as buscas daqui também olham elementos escondidos.
beforeAll(() => {
  configure({ defaultIncludeHiddenElements: true });
});

afterAll(() => {
  configure({ defaultIncludeHiddenElements: false });
});

beforeEach(() => {
  global.painelDeveQuebrar = false;
  deslogar();
  useCarrinho.mockReturnValue({ itens: [], total: 0, quantidade: 0 });
});

describe('Rotas sem usuário', () => {
  it('mostra só o Cadastro, com o título Criar conta', async () => {
    await abrir();

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeOnTheScreen();
    expect(screen.getByText('Tela de cadastro')).toBeOnTheScreen();
    expect(screen.queryByText('Tela do cardápio')).toBeNull();
  });

  it('não oferece o menu', async () => {
    await abrir();

    expect(screen.queryByLabelText('Abrir menu')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cardápio' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
  });
});

describe('Rotas com usuário', () => {
  beforeEach(() => {
    logar();
  });

  it('abre no Cardápio e tira o Cadastro do menu', async () => {
    await abrir();

    expect(screen.getByRole('heading', { name: 'Cardápio' })).toBeOnTheScreen();
    expect(screen.getByText('Tela do cardápio')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cardápio' })).toBeSelected();
    expect(screen.queryByText('Tela de cadastro')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Criar conta' })).toBeNull();
  });

  it('tem o botão de abrir o menu no cabeçalho', async () => {
    await abrir();

    expect(screen.getByLabelText('Abrir menu')).toBeOnTheScreen();
  });

  it.each([
    ['Carrinho', 'Carrinho', 'Tela do carrinho'],
    ['Meus pedidos', 'Meus pedidos', 'Tela dos pedidos'],
    ['Painel', 'Painel', 'Tela do painel'],
  ])('vai para %s pelo menu', async (item, titulo, conteudo) => {
    await abrir();

    await tocarNoMenu(item);

    expect(screen.getByRole('heading', { name: titulo })).toBeOnTheScreen();
    expect(screen.getByText(conteudo)).toBeOnTheScreen();
  });

  it('pinta o cabeçalho com as cores do tema', async () => {
    await abrir();

    expect(screen.getByRole('heading', { name: 'Cardápio' })).toHaveStyle({ color: cores.texto });
  });
});

describe('Rotas quando o usuário muda', () => {
  it('cai no Cardápio depois do cadastro', async () => {
    const { rerender } = await abrir();

    logar();
    rerender(<Rotas />);
    await act(() => jest.runAllTimers());

    expect(screen.getByRole('heading', { name: 'Cardápio' })).toBeOnTheScreen();
    expect(screen.queryByText('Tela de cadastro')).toBeNull();
  });

  it('volta para o Cadastro depois de sair', async () => {
    logar();
    const { rerender } = await abrir();
    await tocarNoMenu('Meus pedidos');

    deslogar();
    rerender(<Rotas />);
    await act(() => jest.runAllTimers());

    expect(screen.getByRole('heading', { name: 'Criar conta' })).toBeOnTheScreen();
    expect(screen.queryByText('Tela dos pedidos')).toBeNull();
    expect(screen.queryByLabelText('Abrir menu')).toBeNull();
  });
});

describe('Rotas quando uma tela quebra', () => {
  let erroDoConsole;

  beforeEach(() => {
    logar();
    erroDoConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    erroDoConsole.mockRestore();
  });

  it('mostra o aviso no lugar da tela branca e recomeça pelo Cardápio', async () => {
    await abrir();
    global.painelDeveQuebrar = true;

    await tocarNoMenu('Painel');

    expect(screen.getByText('Não deu para abrir esta tela')).toBeOnTheScreen();

    global.painelDeveQuebrar = false;
    await tocarNoMenu('Tentar de novo');

    expect(screen.getByRole('heading', { name: 'Cardápio' })).toBeOnTheScreen();
    expect(screen.getByText('Tela do cardápio')).toBeOnTheScreen();
  });
});
