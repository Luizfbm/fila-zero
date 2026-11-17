import axios from 'axios';
import { buscarCep } from '../../src/services/cep';

jest.mock('axios');

const respostaViaCep = {
  cep: '29100-010',
  logradouro: 'Avenida Champagnat',
  complemento: 'até 499/500',
  bairro: 'Centro',
  localidade: 'Vila Velha',
  uf: 'ES',
  ibge: '3205200',
  ddd: '27',
};

describe('buscarCep', () => {
  it('consulta o ViaCEP e devolve só o endereço, com localidade virando cidade', async () => {
    axios.get.mockResolvedValueOnce({ data: respostaViaCep });

    const endereco = await buscarCep('29100010');

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get.mock.calls[0][0]).toBe('https://viacep.com.br/ws/29100010/json/');
    expect(endereco).toEqual({
      logradouro: 'Avenida Champagnat',
      bairro: 'Centro',
      cidade: 'Vila Velha',
      uf: 'ES',
    });
  });

  it('aceita CEP com máscara', async () => {
    axios.get.mockResolvedValueOnce({ data: respostaViaCep });

    await buscarCep('29.100-010');

    expect(axios.get.mock.calls[0][0]).toBe('https://viacep.com.br/ws/29100010/json/');
  });

  it('devolve texto vazio no que o ViaCEP não tiver, como em CEP geral de cidade', async () => {
    axios.get.mockResolvedValueOnce({ data: { cep: '29260-000', localidade: 'Domingos Martins', uf: 'ES' } });

    await expect(buscarCep('29260000')).resolves.toEqual({
      logradouro: '',
      bairro: '',
      cidade: 'Domingos Martins',
      uf: 'ES',
    });
  });

  it('recusa CEP que não tem 8 dígitos sem chamar a rede', async () => {
    await expect(buscarCep('2910')).rejects.toThrow('O CEP precisa ter 8 números');
    await expect(buscarCep('291000101')).rejects.toThrow('O CEP precisa ter 8 números');
    await expect(buscarCep('')).rejects.toThrow('O CEP precisa ter 8 números');
    await expect(buscarCep(undefined)).rejects.toThrow('O CEP precisa ter 8 números');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('avisa quando o CEP não existe', async () => {
    axios.get.mockResolvedValueOnce({ data: { erro: true } });
    await expect(buscarCep('99999999')).rejects.toThrow('CEP não encontrado. Confira os números.');

    axios.get.mockResolvedValueOnce({ data: { erro: 'true' } });
    await expect(buscarCep('99999999')).rejects.toThrow('CEP não encontrado. Confira os números.');
  });

  it('avisa quando a rede falha', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(buscarCep('29100010')).rejects.toThrow(
      'Não deu para consultar o CEP agora. Verifique a conexão e tente de novo.'
    );
  });

  it('trata resposta sem dados como falha de consulta', async () => {
    axios.get.mockResolvedValueOnce({ data: '' });

    await expect(buscarCep('29100010')).rejects.toThrow(
      'Não deu para consultar o CEP agora. Verifique a conexão e tente de novo.'
    );
  });

  it('lança Error de verdade, para a tela ler a mensagem', async () => {
    axios.get.mockRejectedValueOnce(new Error('timeout of 8000ms exceeded'));

    await expect(buscarCep('29100010')).rejects.toBeInstanceOf(Error);
  });
});
