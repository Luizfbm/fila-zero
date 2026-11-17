import api, { apiDisponivel } from './api';

// Cadastros feitos sem API. Vivem só enquanto o app está aberto.
let usuariosLocais = [];
let proximoId = 1;

function semSenha(dados) {
  const { senha, confirmarSenha, ...resto } = dados || {};
  return resto;
}

export async function cadastrarUsuario(dados) {
  const usuario = semSenha(dados);

  if (apiDisponivel) {
    try {
      const resposta = await api.post('usuarios', usuario);
      return { dados: semSenha(resposta.data), origem: 'api' };
    } catch (erro) {
      // Sem API, o cadastro fica guardado em memória.
    }
  }

  const guardado = { ...usuario, id: String(proximoId) };
  proximoId += 1;
  usuariosLocais.push(guardado);

  return { dados: { ...guardado }, origem: 'local' };
}

// Só para os testes começarem com a memória limpa.
export function __reiniciar() {
  usuariosLocais = [];
  proximoId = 1;
}
