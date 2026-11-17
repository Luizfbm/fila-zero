import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Cardapio from '../../src/screens/Cardapio';
import { UsuarioProvider, useUsuario } from '../../src/contexts/UsuarioContext';
import { CarrinhoProvider } from '../../src/contexts/CarrinhoContext';
import { listarCategorias, listarProdutos } from '../../src/services/produtos';

jest.mock('../../src/services/produtos');

const categorias = [
  { id: 'salgados', nome: 'Salgados', icone: 'food-croissant' },
  { id: 'bebidas', nome: 'Bebidas', icone: 'bottle-soda' },
  { id: 'cafes', nome: 'Cafés', icone: 'coffee' },
];

const produtos = [
  { id: '1', nome: 'Coxinha de frango', descricao: 'Frita na hora.', preco: 7.5, categoria: 'salgados', disponivel: true },
  { id: '2', nome: 'Pão de queijo', descricao: 'Unidade grande.', preco: 5, categoria: 'salgados', disponivel: true },
  { id: '3', nome: 'Empada de palmito', descricao: 'Massa amanteigada.', preco: 8, categoria: 'salgados', disponivel: false },
  { id: '4', nome: 'Suco de maracujá', descricao: 'Copo de 300 ml.', preco: 6, categoria: 'bebidas', disponivel: true },
  { id: '5', nome: 'Café com leite', descricao: 'Xícara média.', preco: 4.5, categoria: 'cafes', disponivel: true },
];

const maria = { id: 'u1', nome: 'Maria Clara Souza', email: 'maria@faculdade.br' };

// Entra com a Maria assim que monta, como o Cadastro faz no app.
function ComUsuario({ children }) {
  const { usuario, entrar } = useUsuario();

  useEffect(() => {
    entrar(maria);
  }, []);

  return usuario ? children : null;
}

function montar() {
  const navigation = { navigate: jest.fn() };
  render(
    <UsuarioProvider>
      <CarrinhoProvider>
        <ComUsuario>
          <Cardapio navigation={navigation} />
        </ComUsuario>
      </CarrinhoProvider>
    </UsuarioProvider>
  );
  return navigation;
}

async function montarCarregado() {
  const navigation = montar();
  await screen.findByText('Coxinha de frango');
  return navigation;
}

function escolherCategoria(valor) {
  fireEvent(screen.getByLabelText('Categoria'), 'valueChange', valor, 0);
}

function buscar(texto) {
  fireEvent.changeText(screen.getByLabelText('Buscar no cardápio'), texto);
}

beforeEach(() => {
  listarProdutos.mockResolvedValue({ dados: produtos, origem: 'api' });
  listarCategorias.mockResolvedValue({ dados: categorias, origem: 'api' });
});

describe('Cardapio', () => {
  it('mostra que está carregando enquanto os serviços não respondem', async () => {
    montar();

    expect(screen.getByText('Carregando o cardápio...')).toBeOnTheScreen();

    await screen.findByText('Coxinha de frango');
    expect(screen.queryByText('Carregando o cardápio...')).toBeNull();
  });

  it('lista os produtos que vieram do serviço, com o total de itens', async () => {
    await montarCarregado();

    produtos.forEach((produto) => {
      expect(screen.getByText(produto.nome)).toBeOnTheScreen();
    });
    expect(screen.getByText('R$ 7,50')).toBeOnTheScreen();
    expect(screen.getByText('5 itens')).toBeOnTheScreen();
  });

  it('cumprimenta a pessoa pelo primeiro nome', async () => {
    await montarCarregado();

    expect(screen.getByText('Oi, Maria')).toBeOnTheScreen();
  });

  it('oferece Todas as categorias e as categorias do serviço no seletor', async () => {
    await montarCarregado();

    const rotulos = screen
      .getByLabelText('Categoria')
      .props.items.map((item) => item.label);

    expect(rotulos).toEqual(['Todas as categorias', 'Salgados', 'Bebidas', 'Cafés']);
  });

  it('filtrar por categoria mostra só os itens dela', async () => {
    await montarCarregado();

    escolherCategoria('bebidas');

    expect(screen.getByText('Suco de maracujá')).toBeOnTheScreen();
    expect(screen.queryByText('Coxinha de frango')).toBeNull();
    expect(screen.queryByText('Café com leite')).toBeNull();
    expect(screen.getByText('1 item')).toBeOnTheScreen();
  });

  it('a busca acha o nome mesmo sem acento e sem maiúscula', async () => {
    await montarCarregado();

    buscar('pao');
    expect(screen.getByText('Pão de queijo')).toBeOnTheScreen();
    expect(screen.queryByText('Coxinha de frango')).toBeNull();

    buscar('  MARACUJA ');
    expect(screen.getByText('Suco de maracujá')).toBeOnTheScreen();
    expect(screen.queryByText('Pão de queijo')).toBeNull();
  });

  it('busca e categoria valem juntas', async () => {
    await montarCarregado();

    escolherCategoria('salgados');
    buscar('de');

    expect(screen.getByText('Coxinha de frango')).toBeOnTheScreen();
    expect(screen.getByText('Pão de queijo')).toBeOnTheScreen();
    expect(screen.getByText('Empada de palmito')).toBeOnTheScreen();
    expect(screen.queryByText('Suco de maracujá')).toBeNull();
    expect(screen.getByText('3 itens')).toBeOnTheScreen();
  });

  it('sem resultado mostra o estado vazio, e Limpar filtros traz a lista de volta', async () => {
    await montarCarregado();

    escolherCategoria('bebidas');
    buscar('coxinha');

    expect(screen.getByText('Nada encontrado')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum item de Bebidas tem "coxinha" no nome.')).toBeOnTheScreen();
    expect(screen.queryByText('Coxinha de frango')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(screen.queryByText('Nada encontrado')).toBeNull();
    expect(screen.getByText('5 itens')).toBeOnTheScreen();
    expect(screen.getByLabelText('Buscar no cardápio').props.value).toBe('');
    // Todas as categorias é a primeira opção do seletor.
    expect(screen.getByLabelText('Categoria').props.selectedIndex).toBe(0);
  });

  it('Adicionar põe o item no carrinho e a barra aparece com quantidade e total', async () => {
    await montarCarregado();

    expect(screen.queryByText('Ver carrinho')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Coxinha de frango' }));
    expect(screen.getByText('1 item · R$ 7,50')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Pão de queijo' }));
    expect(screen.getByText('2 itens · R$ 12,50')).toBeOnTheScreen();
    expect(screen.getByText('Ver carrinho')).toBeOnTheScreen();
  });

  it('quem já está no carrinho ganha o controle de quantidade, e diminuir até zero tira', async () => {
    await montarCarregado();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Coxinha de frango' }));
    expect(screen.queryByRole('button', { name: 'Adicionar Coxinha de frango' })).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Aumentar quantidade' }));
    expect(screen.getByText('2 itens · R$ 15,00')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade' }));
    fireEvent.press(screen.getByRole('button', { name: 'Diminuir quantidade' }));

    expect(screen.getByRole('button', { name: 'Adicionar Coxinha de frango' })).toBeOnTheScreen();
    expect(screen.queryByText('Ver carrinho')).toBeNull();
  });

  it('item esgotado aparece marcado e sem botão de adicionar', async () => {
    await montarCarregado();

    expect(screen.getByText('Esgotado')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Adicionar Empada de palmito' })).toBeNull();
  });

  it('Ver carrinho leva para a tela Carrinho', async () => {
    const navigation = await montarCarregado();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar Suco de maracujá' }));
    fireEvent.press(screen.getByText('Ver carrinho'));

    expect(navigation.navigate).toHaveBeenCalledWith('Carrinho');
  });

  it('avisa quando os dados são os de exemplo do aparelho', async () => {
    listarProdutos.mockResolvedValue({ dados: produtos, origem: 'local' });
    await montarCarregado();

    expect(
      screen.getByText('Este cardápio é de exemplo e está guardado no aparelho.')
    ).toBeOnTheScreen();
  });

  it('não mostra o aviso de exemplo quando os dados vieram da API', async () => {
    await montarCarregado();

    expect(
      screen.queryByText('Este cardápio é de exemplo e está guardado no aparelho.')
    ).toBeNull();
  });

  it('se algo inesperado falhar, mostra o erro e Tentar de novo recarrega', async () => {
    listarProdutos.mockRejectedValueOnce(new Error('quebrou'));
    montar();

    expect(await screen.findByText('Não deu para carregar o cardápio.')).toBeOnTheScreen();
    expect(screen.queryByText('Coxinha de frango')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Coxinha de frango')).toBeOnTheScreen();
    expect(screen.queryByText('Não deu para carregar o cardápio.')).toBeNull();
  });
});
