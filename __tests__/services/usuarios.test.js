import api from '../../src/services/api';
import { cadastrarUsuario, __reiniciar } from '../../src/services/usuarios';

let mockApiDisponivel = false;

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  URL_BASE: '',
  get apiDisponivel() {
    return mockApiDisponivel;
  },
}));

const formulario = {
  nome: 'Marina Souza',
  email: 'marina.souza@aluno.edu.br',
  matricula: '20261234',
  curso: 'Sistemas de Informação',
  cep: '29100-000',
  logradouro: 'Rua das Palmeiras',
  bairro: 'Centro',
  cidade: 'Vila Velha',
  uf: 'ES',
  senha: 'cantina26',
  confirmarSenha: 'cantina26',
};

const { senha, confirmarSenha, ...semSenha } = formulario;

beforeEach(() => {
  mockApiDisponivel = false;
  __reiniciar();
});

describe('cadastrarUsuario sem API', () => {
  it('devolve o usuário com id e sem senha', async () => {
    const resultado = await cadastrarUsuario(formulario);

    expect(resultado).toEqual({ dados: { ...semSenha, id: '1' }, origem: 'local' });
    expect(resultado.dados).not.toHaveProperty('senha');
    expect(resultado.dados).not.toHaveProperty('confirmarSenha');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('dá um id novo a cada cadastro', async () => {
    const primeiro = await cadastrarUsuario(formulario);
    const segundo = await cadastrarUsuario({ ...formulario, nome: 'Caio Ramos' });

    expect(primeiro.dados.id).toBe('1');
    expect(segundo.dados.id).toBe('2');
  });

  it('não altera o objeto do formulário', async () => {
    const valores = { ...formulario };
    await cadastrarUsuario(valores);

    expect(valores).toEqual(formulario);
  });
});

describe('cadastrarUsuario com API', () => {
  beforeEach(() => {
    mockApiDisponivel = true;
  });

  it('faz POST em usuarios sem mandar a senha', async () => {
    api.post.mockImplementationOnce(async (rota, corpo) => ({ data: { ...corpo, id: '12' } }));

    const resultado = await cadastrarUsuario(formulario);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('usuarios', semSenha);
    expect(resultado).toEqual({ dados: { ...semSenha, id: '12' }, origem: 'api' });
  });

  it('tira a senha da resposta se a API devolver uma', async () => {
    api.post.mockResolvedValueOnce({ data: { ...semSenha, id: '12', senha: 'x', confirmarSenha: 'x' } });

    const { dados } = await cadastrarUsuario(formulario);

    expect(dados).toEqual({ ...semSenha, id: '12' });
  });

  it('cadastra em memória quando o POST falha', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(cadastrarUsuario(formulario)).resolves.toEqual({
      dados: { ...semSenha, id: '1' },
      origem: 'local',
    });
  });
});
