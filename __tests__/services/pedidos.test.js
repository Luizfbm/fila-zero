import api from '../../src/services/api';
import { listarPedidos, criarPedido, __reiniciar } from '../../src/services/pedidos';

let mockApiDisponivel = false;

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  URL_BASE: '',
  get apiDisponivel() {
    return mockApiDisponivel;
  },
}));

const AGORA = new Date('2026-11-17T11:30:00.000Z');

function pedidoDe(usuarioId, extras = {}) {
  return {
    usuarioId,
    itens: [
      { produtoId: '1', nome: 'Coxinha de frango', preco: 7.5, quantidade: 2, categoria: 'salgados' },
    ],
    total: 15,
    retirada: '09:50',
    observacao: '',
    ...extras,
  };
}

function erroHttp(status) {
  const erro = new Error(`Request failed with status code ${status}`);
  erro.response = { status };
  return erro;
}

beforeEach(() => {
  mockApiDisponivel = false;
  __reiniciar();
  jest.useFakeTimers();
  jest.setSystemTime(AGORA);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('pedidos sem API', () => {
  it('começa sem nenhum pedido', async () => {
    await expect(listarPedidos('1')).resolves.toEqual({ dados: [], origem: 'local' });
    expect(api.get).not.toHaveBeenCalled();
  });

  it('cria o pedido com id, status recebido e a hora de agora', async () => {
    const resultado = await criarPedido(pedidoDe('1'));

    expect(resultado.origem).toBe('local');
    expect(resultado.dados).toEqual({
      ...pedidoDe('1'),
      id: 'local-1',
      status: 'recebido',
      criadoEm: '2026-11-17T11:30:00.000Z',
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('numera os pedidos em sequência, com prefixo para não bater com id da API', async () => {
    const primeiro = await criarPedido(pedidoDe('1'));
    const segundo = await criarPedido(pedidoDe('2'));

    expect(primeiro.dados.id).toBe('local-1');
    expect(segundo.dados.id).toBe('local-2');
  });

  it('mostra o pedido criado na listagem seguinte', async () => {
    const { dados: criado } = await criarPedido(pedidoDe('1'));

    const { dados } = await listarPedidos('1');
    expect(dados).toEqual([criado]);
  });

  it('lista só os pedidos do usuário pedido', async () => {
    await criarPedido(pedidoDe('1', { retirada: '09:50' }));
    await criarPedido(pedidoDe('2', { retirada: '10:10' }));

    const { dados } = await listarPedidos('2');
    expect(dados).toHaveLength(1);
    expect(dados[0].usuarioId).toBe('2');
    expect(dados[0].retirada).toBe('10:10');
  });

  it('devolve lista vazia quando não vem usuário', async () => {
    await criarPedido(pedidoDe('1'));

    await expect(listarPedidos(undefined)).resolves.toEqual({ dados: [], origem: 'local' });
    await expect(listarPedidos('')).resolves.toEqual({ dados: [], origem: 'local' });
  });

  it('não confunde o usuário 1 com o 10', async () => {
    await criarPedido(pedidoDe('10'));

    const { dados } = await listarPedidos('1');
    expect(dados).toEqual([]);
  });

  it('compara o usuário sem ligar se o id veio como número ou texto', async () => {
    await criarPedido(pedidoDe(7));

    const { dados } = await listarPedidos('7');
    expect(dados).toHaveLength(1);
  });

  it('põe os mais novos primeiro', async () => {
    await criarPedido(pedidoDe('1', { retirada: '09:50' }));
    jest.setSystemTime(new Date('2026-11-17T12:00:00.000Z'));
    await criarPedido(pedidoDe('1', { retirada: '12:30' }));

    const { dados } = await listarPedidos('1');
    expect(dados.map((pedido) => pedido.retirada)).toEqual(['12:30', '09:50']);
  });

  it('não deixa quem chamou alterar o que está guardado', async () => {
    const { dados: criado } = await criarPedido(pedidoDe('1'));
    criado.status = 'retirado';
    const { dados: lista } = await listarPedidos('1');
    lista.pop();

    const { dados } = await listarPedidos('1');
    expect(dados).toHaveLength(1);
    expect(dados[0].status).toBe('recebido');
  });

  it('ignora id, status e data que vierem no pedido', async () => {
    const { dados } = await criarPedido(
      pedidoDe('1', { id: '99', status: 'pronto', criadoEm: '2020-01-01T00:00:00.000Z' })
    );

    expect(dados.id).toBe('local-1');
    expect(dados.status).toBe('recebido');
    expect(dados.criadoEm).toBe('2026-11-17T11:30:00.000Z');
  });
});

describe('pedidos com API', () => {
  beforeEach(() => {
    mockApiDisponivel = true;
  });

  it('lista com GET pedidos filtrando pelo usuário', async () => {
    const daApi = [{ id: '5', usuarioId: '3', criadoEm: '2026-11-17T10:00:00.000Z' }];
    api.get.mockResolvedValueOnce({ data: daApi });

    const resultado = await listarPedidos('3');

    expect(api.get).toHaveBeenCalledWith('pedidos', { params: { usuarioId: '3' } });
    expect(resultado).toEqual({ dados: daApi, origem: 'api' });
  });

  it('ordena o que vem da API do mais novo para o mais antigo', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: '5', usuarioId: '3', criadoEm: '2026-11-16T10:00:00.000Z' },
        { id: '6', usuarioId: '3', criadoEm: '2026-11-17T10:00:00.000Z' },
      ],
    });

    const { dados } = await listarPedidos('3');
    expect(dados.map((pedido) => pedido.id)).toEqual(['6', '5']);
  });

  it('envia o pedido por POST já com status e data, e devolve o que a API gravou', async () => {
    api.post.mockImplementationOnce(async (rota, corpo) => ({ data: { ...corpo, id: '41' } }));

    const resultado = await criarPedido(pedidoDe('3'));

    expect(api.post).toHaveBeenCalledWith('pedidos', {
      ...pedidoDe('3'),
      status: 'recebido',
      criadoEm: '2026-11-17T11:30:00.000Z',
    });
    expect(resultado.origem).toBe('api');
    expect(resultado.dados.id).toBe('41');
  });

  it('guarda o pedido em memória quando o POST falha', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    api.get.mockRejectedValueOnce(new Error('Network Error'));

    const criado = await criarPedido(pedidoDe('3'));
    expect(criado.origem).toBe('local');
    expect(criado.dados).toMatchObject({ id: 'local-1', status: 'recebido', usuarioId: '3' });

    const lista = await listarPedidos('3');
    expect(lista).toEqual({ dados: [criado.dados], origem: 'local' });
  });

  it('cai para a memória quando a listagem falha por rede', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(listarPedidos('3')).resolves.toEqual({ dados: [], origem: 'local' });
  });

  it('cai para a memória quando a API responde erro que não é 404', async () => {
    api.get.mockRejectedValueOnce(erroHttp(500));

    await expect(listarPedidos('3')).resolves.toEqual({ dados: [], origem: 'local' });
  });

  it('trata o 404 do mockapi como lista vazia da API', async () => {
    api.get.mockRejectedValueOnce(erroHttp(404));

    await expect(listarPedidos('3')).resolves.toEqual({ dados: [], origem: 'api' });
  });

  it('no 404, mostra o que foi criado na sessão e mantém a origem da API', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    const { dados: criado } = await criarPedido(pedidoDe('3'));
    api.get.mockRejectedValueOnce(erroHttp(404));

    await expect(listarPedidos('3')).resolves.toEqual({ dados: [criado], origem: 'api' });
  });

  it('mantém o pedido que a API aceitou quando a listagem seguinte falha', async () => {
    api.post.mockImplementationOnce(async (rota, corpo) => ({ data: { ...corpo, id: '41' } }));
    const { dados: criado } = await criarPedido(pedidoDe('3'));
    api.get.mockRejectedValueOnce(new Error('Network Error'));

    const lista = await listarPedidos('3');

    expect(lista.origem).toBe('local');
    expect(lista.dados).toEqual([criado]);
    expect(lista.dados[0].id).toBe('41');
  });

  it('junta o pedido feito sem rede aos que vêm da API, do mais novo para o mais antigo', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    const { dados: local } = await criarPedido(pedidoDe('3'));
    const antigo = { id: '5', usuarioId: '3', criadoEm: '2026-11-16T10:00:00.000Z' };
    const recente = { id: '6', usuarioId: '3', criadoEm: '2026-11-17T12:00:00.000Z' };
    api.get.mockResolvedValueOnce({ data: [antigo, recente] });

    const lista = await listarPedidos('3');

    expect(lista.origem).toBe('api');
    expect(lista.dados).toEqual([recente, local, antigo]);
  });

  it('não repete o pedido da sessão que a API já devolveu', async () => {
    api.post.mockImplementationOnce(async (rota, corpo) => ({ data: { ...corpo, id: '41' } }));
    const { dados: criado } = await criarPedido(pedidoDe('3'));
    api.get.mockResolvedValueOnce({ data: [{ ...criado, status: 'em preparo' }] });

    const { dados } = await listarPedidos('3');

    expect(dados).toHaveLength(1);
    expect(dados[0]).toMatchObject({ id: '41', status: 'em preparo' });
  });

  it('não mistura na lista o pedido de sessão de outro usuário', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    await criarPedido(pedidoDe('8'));
    api.get.mockResolvedValueOnce({ data: [] });

    await expect(listarPedidos('3')).resolves.toEqual({ dados: [], origem: 'api' });
  });

  it('descarta pedido de outro usuário que o filtro da API deixar passar', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: '5', usuarioId: '1', criadoEm: '2026-11-16T10:00:00.000Z' },
        { id: '6', usuarioId: '10', criadoEm: '2026-11-17T10:00:00.000Z' },
        { id: '7', usuarioId: 1, criadoEm: '2026-11-15T10:00:00.000Z' },
      ],
    });

    const { dados } = await listarPedidos('1');
    expect(dados.map((pedido) => pedido.id)).toEqual(['5', '7']);
  });

  it('não chama a API quando não vem usuário', async () => {
    await expect(listarPedidos('')).resolves.toEqual({ dados: [], origem: 'api' });
    await expect(listarPedidos(null)).resolves.toEqual({ dados: [], origem: 'api' });
    expect(api.get).not.toHaveBeenCalled();
  });
});
