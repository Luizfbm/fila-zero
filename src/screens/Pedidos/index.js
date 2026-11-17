import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Aviso from '../../components/Aviso';
import Botao from '../../components/Botao';
import Carregando from '../../components/Carregando';
import CartaoPedido from '../../components/CartaoPedido';
import EstadoVazio from '../../components/EstadoVazio';
import Seletor from '../../components/Seletor';
import { usePedidos } from '../../contexts/PedidosContext';
import { useUsuario } from '../../contexts/UsuarioContext';
import { ROTAS } from '../../navigation/rotas';
import { STATUS, rotuloStatus, statusAtual } from '../../utils/statusPedido';
import styles from './styles';

const TODOS = '';
const INTERVALO_DO_RELOGIO = 30 * 1000;

const OPCOES_DE_STATUS = [
  { rotulo: 'Todos os status', valor: TODOS },
  ...STATUS.map((status) => ({ rotulo: rotuloStatus(status), valor: status })),
];

function instante(pedido) {
  const tempo = new Date(pedido.criadoEm).getTime();
  return Number.isNaN(tempo) ? 0 : tempo;
}

export default function Pedidos({ navigation }) {
  const { usuario } = useUsuario();
  const { pedidos, carregando, erro, carregar } = usePedidos();
  const [agora, setAgora] = useState(Date.now());
  const [filtro, setFiltro] = useState(TODOS);
  const [abertoId, setAbertoId] = useState(null);
  const [puxando, setPuxando] = useState(false);
  const usuarioId = usuario ? usuario.id : null;

  function buscar() {
    if (usuarioId !== null) {
      return carregar(usuarioId);
    }
    return Promise.resolve();
  }

  // O Drawer emite focus também na primeira exibição, então não precisa buscar na montagem.
  useEffect(() => {
    const pararDeOuvir = navigation.addListener('focus', buscar);
    return pararDeOuvir;
  }, [navigation, usuarioId]);

  // O status simulado depende da hora, então a tela olha o relógio de tempos em tempos.
  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), INTERVALO_DO_RELOGIO);
    return () => clearInterval(relogio);
  }, []);

  async function aoPuxar() {
    setPuxando(true);
    await buscar();
    setPuxando(false);
  }

  function aoAlternar(pedidoId) {
    setAbertoId(abertoId === pedidoId ? null : pedidoId);
  }

  if (carregando && !puxando && pedidos.length === 0) {
    return (
      <View style={styles.container}>
        <Carregando mensagem="Carregando seus pedidos..." />
      </View>
    );
  }

  const comStatus = [...pedidos]
    .sort((a, b) => instante(b) - instante(a))
    .map((pedido) => ({ pedido, status: statusAtual(pedido, agora) }));
  const visiveis = filtro === TODOS ? comStatus : comStatus.filter((linha) => linha.status === filtro);
  const temPedidos = pedidos.length > 0;
  const palavra = pedidos.length === 1 ? 'pedido' : 'pedidos';
  const contador =
    filtro === TODOS
      ? `${pedidos.length} ${palavra}`
      : `${visiveis.length} de ${pedidos.length} ${palavra}`;

  function vazio() {
    // Com erro e sem lista, o aviso já explica: dizer que não há pedidos seria mentira.
    if (erro) {
      return null;
    }

    if (temPedidos) {
      return (
        <EstadoVazio
          icone="filter-off-outline"
          titulo="Nenhum pedido com esse status"
          mensagem="Escolha outro status ou veja a lista inteira."
          acao={{ titulo: 'Mostrar todos', onPress: () => setFiltro(TODOS) }}
        />
      );
    }

    return (
      <EstadoVazio
        icone="receipt-text-outline"
        titulo="Você ainda não fez nenhum pedido"
        mensagem="Os pedidos que você fizer pelo app aparecem aqui."
        acao={{ titulo: 'Ver cardápio', onPress: () => navigation.navigate(ROTAS.CARDAPIO) }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {erro || temPedidos ? (
        <View style={styles.topo}>
          {erro ? (
            <Aviso
              tipo="erro"
              mensagem={erro}
              acao={{ titulo: 'Tentar de novo', onPress: buscar }}
              style={styles.aviso}
            />
          ) : null}
          {temPedidos ? (
            <View>
              <Seletor
                rotulo="Status"
                valor={filtro}
                aoMudar={setFiltro}
                opcoes={OPCOES_DE_STATUS}
                style={styles.seletor}
              />
              <View style={styles.linhaDoContador}>
                <Text style={styles.contador}>{contador}</Text>
                <Botao
                  titulo="Atualizar"
                  variante="texto"
                  carregando={carregando}
                  onPress={buscar}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <FlatList
        testID="pedidos-lista"
        style={styles.lista}
        contentContainerStyle={styles.conteudoDaLista}
        data={visiveis}
        keyExtractor={(linha) => String(linha.pedido.id)}
        renderItem={({ item }) => (
          <CartaoPedido
            pedido={item.pedido}
            status={item.status}
            aberto={item.pedido.id === abertoId}
            aoAlternar={aoAlternar}
          />
        )}
        ItemSeparatorComponent={Separador}
        ListEmptyComponent={vazio()}
        refreshing={puxando}
        onRefresh={aoPuxar}
      />
    </View>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}
