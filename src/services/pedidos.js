import api, { apiDisponivel } from './api';

// Pedidos feitos sem API. Vivem só enquanto o app está aberto.
let pedidosLocais = [];
let proximoId = 1;

function copiar(pedido) {
  return { ...pedido, itens: (pedido.itens || []).map((item) => ({ ...item })) };
}

function maisNovosPrimeiro(a, b) {
  return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
}

export async function listarPedidos(usuarioId) {
  if (apiDisponivel) {
    try {
      const resposta = await api.get('pedidos', { params: { usuarioId } });
      if (Array.isArray(resposta.data)) {
        return { dados: [...resposta.data].sort(maisNovosPrimeiro), origem: 'api' };
      }
    } catch (erro) {
      // Sem API, mostra o que foi pedido nesta sessão.
    }
  }

  // A lista já está do mais novo para o mais antigo, porque cada pedido entra no começo.
  const dados = pedidosLocais
    .filter((pedido) => String(pedido.usuarioId) === String(usuarioId))
    .map(copiar);

  return { dados, origem: 'local' };
}

export async function criarPedido(pedido) {
  const { id, ...semId } = pedido || {};
  const novo = { ...semId, status: 'recebido', criadoEm: new Date().toISOString() };

  if (apiDisponivel) {
    try {
      const resposta = await api.post('pedidos', novo);
      return { dados: resposta.data, origem: 'api' };
    } catch (erro) {
      // Sem API, o pedido fica guardado em memória.
    }
  }

  const guardado = { ...copiar(novo), id: String(proximoId) };
  proximoId += 1;
  pedidosLocais.unshift(guardado);

  return { dados: copiar(guardado), origem: 'local' };
}

// Só para os testes começarem com a memória limpa.
export function __reiniciar() {
  pedidosLocais = [];
  proximoId = 1;
}
