import React, { createContext, useContext, useEffect, useState } from 'react';
import { criarPedido, listarPedidos } from '../services/pedidos';
import { useUsuario } from './UsuarioContext';

const ERRO_AO_CARREGAR = 'Não deu para carregar seus pedidos. Tente de novo.';

const vazio = {
  pedidos: [],
  carregando: false,
  erro: null,
  origem: 'local',
  carregar: async () => {},
  registrar: async () => null,
};

const PedidosContext = createContext(vazio);

// `busca` guarda o número da última chamada de carregar. Zero quer dizer que não há busca valendo.
const inicial = { pedidos: [], carregando: false, erro: null, origem: 'local', busca: 0 };

let ultimaBusca = 0;

export function PedidosProvider({ children }) {
  const { usuario } = useUsuario();
  const [estado, setEstado] = useState(inicial);

  // Quem sai da conta não deixa os pedidos para a próxima pessoa que usar o aparelho.
  useEffect(() => {
    if (!usuario) {
      setEstado(inicial);
    }
  }, [usuario]);

  async function carregar(usuarioId) {
    ultimaBusca += 1;
    const busca = ultimaBusca;
    setEstado((atual) => ({ ...atual, carregando: true, erro: null, busca }));

    // A resposta só vale se nenhuma busca mais nova começou e ninguém saiu da conta no meio do caminho.
    function seAindaVale(mudanca) {
      setEstado((atual) => (atual.busca === busca ? { ...atual, ...mudanca, carregando: false } : atual));
    }

    try {
      const resposta = await listarPedidos(usuarioId);
      seAindaVale({ pedidos: resposta.dados, origem: resposta.origem });
    } catch (falha) {
      seAindaVale({ erro: ERRO_AO_CARREGAR });
    }
  }

  async function registrar(pedido) {
    const resposta = await criarPedido(pedido);
    setEstado((atual) => ({
      ...atual,
      pedidos: [resposta.dados, ...atual.pedidos],
      origem: resposta.origem,
    }));
    return resposta.dados;
  }

  const pedidos = usuario ? estado.pedidos.filter((pedido) => String(pedido.usuarioId) === String(usuario.id)) : [];

  return (
    <PedidosContext.Provider
      value={{
        pedidos,
        carregando: estado.carregando,
        erro: estado.erro,
        origem: estado.origem,
        carregar,
        registrar,
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidos() {
  return useContext(PedidosContext);
}
