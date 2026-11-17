import axios from 'axios';
import { somenteDigitos } from '../utils/formatar';

const CEP_INCOMPLETO = 'O CEP tem 8 dígitos';
const CEP_INEXISTENTE = 'CEP não encontrado. Confira os números.';
const FALHA_NA_CONSULTA = 'Não deu para consultar o CEP agora. Verifique a conexão e tente de novo.';

export async function buscarCep(cep) {
  const digitos = somenteDigitos(cep);
  if (digitos.length !== 8) {
    throw new Error(CEP_INCOMPLETO);
  }

  let endereco;
  try {
    const resposta = await axios.get(`https://viacep.com.br/ws/${digitos}/json/`, { timeout: 8000 });
    endereco = resposta.data;
  } catch (erro) {
    throw new Error(FALHA_NA_CONSULTA);
  }

  if (!endereco || typeof endereco !== 'object') {
    throw new Error(FALHA_NA_CONSULTA);
  }

  // O ViaCEP responde 200 com { erro: true } (ou "true") quando o CEP não existe.
  if (endereco.erro === true || endereco.erro === 'true') {
    throw new Error(CEP_INEXISTENTE);
  }

  return {
    logradouro: endereco.logradouro || '',
    bairro: endereco.bairro || '',
    cidade: endereco.localidade || '',
    uf: endereco.uf || '',
  };
}
