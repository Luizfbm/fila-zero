import api from '../../src/services/api';
import { listarProdutos, listarCategorias } from '../../src/services/produtos';
import produtosLocais from '../../src/data/produtos.json';
import categoriasLocais from '../../src/data/categorias.json';
import glifos from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

let mockApiDisponivel = false;

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  URL_BASE: '',
  get apiDisponivel() {
    return mockApiDisponivel;
  },
}));

beforeEach(() => {
  mockApiDisponivel = false;
});

describe('cardápio local', () => {
  it('tem de 18 a 24 produtos em 5 ou 6 categorias', () => {
    expect(produtosLocais.length).toBeGreaterThanOrEqual(18);
    expect(produtosLocais.length).toBeLessThanOrEqual(24);
    expect(categoriasLocais.length).toBeGreaterThanOrEqual(5);
    expect(categoriasLocais.length).toBeLessThanOrEqual(6);
  });

  it('segue o formato de produto do contrato', () => {
    produtosLocais.forEach((produto) => {
      expect(Object.keys(produto).sort()).toEqual(
        ['categoria', 'descricao', 'disponivel', 'id', 'nome', 'preco'].sort()
      );
      expect(typeof produto.id).toBe('string');
      expect(produto.nome.trim()).not.toBe('');
      expect(produto.descricao.trim()).not.toBe('');
      expect(typeof produto.preco).toBe('number');
      expect(produto.preco).toBeGreaterThan(0);
      expect(typeof produto.disponivel).toBe('boolean');
    });
  });

  it('não repete id de produto nem de categoria', () => {
    const idsProdutos = produtosLocais.map((produto) => produto.id);
    const idsCategorias = categoriasLocais.map((categoria) => categoria.id);
    expect(new Set(idsProdutos).size).toBe(idsProdutos.length);
    expect(new Set(idsCategorias).size).toBe(idsCategorias.length);
  });

  it('liga cada produto a uma categoria que existe, e nenhuma categoria fica vazia', () => {
    const idsCategorias = categoriasLocais.map((categoria) => categoria.id);
    produtosLocais.forEach((produto) => {
      expect(idsCategorias).toContain(produto.categoria);
    });
    idsCategorias.forEach((id) => {
      expect(produtosLocais.some((produto) => produto.categoria === id)).toBe(true);
    });
  });

  it('usa ícones que existem no MaterialCommunityIcons', () => {
    categoriasLocais.forEach((categoria) => {
      expect(Object.keys(categoria).sort()).toEqual(['icone', 'id', 'nome']);
      expect(glifos[categoria.icone]).toBeDefined();
    });
  });

  it('tem itens indisponíveis, mas a maioria disponível', () => {
    const indisponiveis = produtosLocais.filter((produto) => !produto.disponivel);
    expect(indisponiveis.length).toBeGreaterThanOrEqual(2);
    expect(indisponiveis.length).toBeLessThan(produtosLocais.length / 3);
  });
});

describe('listarProdutos', () => {
  it('devolve os produtos locais sem chamar a API quando não há URL', async () => {
    const resultado = await listarProdutos();

    expect(resultado).toEqual({ dados: produtosLocais, origem: 'local' });
    expect(api.get).not.toHaveBeenCalled();
  });

  it('busca em GET produtos quando a API está configurada', async () => {
    mockApiDisponivel = true;
    const daApi = [{ id: '90', nome: 'Pastel', descricao: 'De feira', preco: 9, categoria: 'salgados', disponivel: true }];
    api.get.mockResolvedValueOnce({ data: daApi });

    const resultado = await listarProdutos();

    expect(api.get).toHaveBeenCalledWith('produtos');
    expect(resultado).toEqual({ dados: daApi, origem: 'api' });
  });

  it('cai para os dados locais quando a chamada falha', async () => {
    mockApiDisponivel = true;
    api.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(listarProdutos()).resolves.toEqual({ dados: produtosLocais, origem: 'local' });
  });

  it('cai para os dados locais quando a API responde algo que não é lista', async () => {
    mockApiDisponivel = true;
    api.get.mockResolvedValueOnce({ data: 'Not found' });

    await expect(listarProdutos()).resolves.toEqual({ dados: produtosLocais, origem: 'local' });
  });

  it('entrega uma cópia, para a tela não alterar o cardápio guardado', async () => {
    const { dados } = await listarProdutos();
    dados.pop();

    const { dados: deNovo } = await listarProdutos();
    expect(deNovo).toHaveLength(produtosLocais.length);
  });
});

describe('listarCategorias', () => {
  it('devolve as categorias locais quando não há URL', async () => {
    const resultado = await listarCategorias();

    expect(resultado).toEqual({ dados: categoriasLocais, origem: 'local' });
    expect(api.get).not.toHaveBeenCalled();
  });

  it('busca em GET categorias quando a API está configurada', async () => {
    mockApiDisponivel = true;
    const daApi = [{ id: 'salgados', nome: 'Salgados', icone: 'food-croissant' }];
    api.get.mockResolvedValueOnce({ data: daApi });

    const resultado = await listarCategorias();

    expect(api.get).toHaveBeenCalledWith('categorias');
    expect(resultado).toEqual({ dados: daApi, origem: 'api' });
  });

  it('cai para os dados locais quando a chamada falha', async () => {
    mockApiDisponivel = true;
    api.get.mockRejectedValueOnce(new Error('timeout'));

    await expect(listarCategorias()).resolves.toEqual({ dados: categoriasLocais, origem: 'local' });
  });
});
