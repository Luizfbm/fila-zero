import api, { apiDisponivel } from './api';

// Todo pedido criado enquanto o app está aberto, tanto o que a API aceitou
// quanto o que ficou só aqui. O mais novo entra no começo.
let pedidosDaSessao = [];
let proximoIdLocal = 1;

function copiar(pedido) {
  return { ...pedido, itens: (pedido.itens || []).map((item) => ({ ...item })) };
}

function instante(pedido) {
  const tempo = new Date(pedido.criadoEm).getTime();
  return Number.isNaN(tempo) ? 0 : tempo;
}

function maisNovosPrimeiro(a, b) {
  return instante(b) - instante(a);
}

function doUsuario(pedidos, usuarioId) {
  return pedidos.filter((pedido) => String(pedido.usuarioId) === String(usuarioId));
}

function juntar(daApi, daSessao) {
  const idsDaApi = daApi.map((pedido) => String(pedido.id));
  const soDaSessao = daSessao.filter((pedido) => !idsDaApi.includes(String(pedido.id)));

  return [...daApi, ...soDaSessao].sort(maisNovosPrimeiro);
}

export async function listarPedidos(usuarioId) {
  const semUsuario = usuarioId === undefined || usuarioId === null || usuarioId === '';
  if (semUsuario) {
    return { dados: [], origem: apiDisponivel ? 'api' : 'local' };
  }

  const daSessao = doUsuario(pedidosDaSessao, usuarioId).map(copiar);

  if (apiDisponivel) {
    try {
      const resposta = await api.get('pedidos', { params: { usuarioId } });
      if (Array.isArray(resposta.data)) {
        // O filtro do mockapi casa por trecho (1 também traz 10), então confiro de novo.
        return { dados: juntar(doUsuario(resposta.data, usuarioId), daSessao), origem: 'api' };
      }
    } catch (erro) {
      // O mockapi responde 404 quando o filtro não acha nada: é lista vazia, não falha.
      if (erro && erro.response && erro.response.status === 404) {
        return { dados: juntar([], daSessao), origem: 'api' };
      }
    }
  }

  return { dados: daSessao.sort(maisNovosPrimeiro), origem: 'local' };
}

export async function criarPedido(pedido) {
  const { id, ...semId } = pedido || {};
  const novo = { ...semId, status: 'recebido', criadoEm: new Date().toISOString() };

  if (apiDisponivel) {
    try {
      const resposta = await api.post('pedidos', novo);
      pedidosDaSessao.unshift(copiar(resposta.data));
      return { dados: resposta.data, origem: 'api' };
    } catch (erro) {
      // Sem API, o pedido fica guardado só em memória.
    }
  }

  // O prefixo evita bater com um id numérico do mockapi quando as listas se juntam.
  const guardado = { ...copiar(novo), id: `local-${proximoIdLocal}` };
  proximoIdLocal += 1;
  pedidosDaSessao.unshift(guardado);

  return { dados: copiar(guardado), origem: 'local' };
}

// Só para os testes começarem com a memória limpa.
export function __reiniciar() {
  pedidosDaSessao = [];
  proximoIdLocal = 1;
}
