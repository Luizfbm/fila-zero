import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

export function PedidosProvider({ children }) {
  const { usuario } = useUsuario();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [origem, setOrigem] = useState('local');

  // Muda a cada logout. Resposta de serviço que chega com a sessão antiga é descartada.
  const sessao = useRef(0);

  const carregar = useCallback(async (usuarioId) => {
    const sessaoDaChamada = sessao.current;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await listarPedidos(usuarioId);
      if (sessaoDaChamada !== sessao.current) return;
      setPedidos(resposta.dados);
      setOrigem(resposta.origem);
    } catch (falha) {
      if (sessaoDaChamada !== sessao.current) return;
      setErro(ERRO_AO_CARREGAR);
    } finally {
      if (sessaoDaChamada === sessao.current) {
        setCarregando(false);
      }
    }
  }, []);

  const registrar = useCallback(async (pedido) => {
    const sessaoDaChamada = sessao.current;
    const resposta = await criarPedido(pedido);
    if (sessaoDaChamada === sessao.current) {
      setPedidos((atuais) => [resposta.dados, ...atuais]);
      setOrigem(resposta.origem);
    }
    return resposta.dados;
  }, []);

  // Quem sai da conta não deixa os pedidos para a próxima pessoa que usar o aparelho.
  useEffect(() => {
    if (!usuario) {
      sessao.current += 1;
      setPedidos((atuais) => (atuais.length === 0 ? atuais : []));
      setCarregando(false);
      setErro(null);
    }
  }, [usuario]);

  const valor = useMemo(
    () => ({ pedidos, carregando, erro, origem, carregar, registrar }),
    [pedidos, carregando, erro, origem, carregar, registrar]
  );

  return <PedidosContext.Provider value={valor}>{children}</PedidosContext.Provider>;
}

export function usePedidos() {
  return useContext(PedidosContext);
}
