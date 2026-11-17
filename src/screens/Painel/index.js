import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Aviso from '../../components/Aviso';
import BarraCategoria from '../../components/BarraCategoria';
import Carregando from '../../components/Carregando';
import Cartao from '../../components/Cartao';
import EstadoVazio from '../../components/EstadoVazio';
import Indicador from '../../components/Indicador';
import Seletor from '../../components/Seletor';
import { usePedidos } from '../../contexts/PedidosContext';
import { useUsuario } from '../../contexts/UsuarioContext';
import { ROTAS } from '../../navigation/rotas';
import { listarCategorias } from '../../services/produtos';
import { formatarMoeda } from '../../utils/formatar';
import { filtrarPorPeriodo, gastoPorCategoria, itensMaisPedidos, resumir } from '../../utils/resumo';
import styles from './styles';

const PERIODOS = [
  { rotulo: 'Tudo', valor: 'tudo' },
  { rotulo: 'Hoje', valor: 'hoje' },
  { rotulo: 'Últimos 7 dias', valor: '7dias' },
  { rotulo: 'Últimos 30 dias', valor: '30dias' },
];

function unidades(quantidade) {
  return quantidade === 1 ? '1 unidade' : `${quantidade} unidades`;
}

export default function Painel({ navigation }) {
  const { usuario } = useUsuario();
  const { pedidos, carregando, erro, carregar } = usePedidos();
  const [periodo, setPeriodo] = useState('tudo');
  // null enquanto as categorias não chegam, para não desenhar as barras com tudo em "Outros".
  const [categorias, setCategorias] = useState(null);
  const [buscou, setBuscou] = useState(false);

  const usuarioId = usuario ? usuario.id : null;

  function buscarPedidos() {
    if (usuarioId !== null) {
      carregar(usuarioId);
    }
  }

  useEffect(() => {
    let naTela = true;

    listarCategorias()
      .then((resposta) => {
        if (naTela) {
          setCategorias(resposta.dados);
        }
      })
      .catch(() => {
        if (naTela) {
          setCategorias([]);
        }
      });

    return () => {
      naTela = false;
    };
  }, []);

  useEffect(() => {
    buscarPedidos();
    setBuscou(true);

    // O Drawer avisa do foco no mesmo instante em que a tela abre.
    // Esse primeiro aviso é ignorado para não buscar os pedidos duas vezes.
    let acabouDeAbrir = true;
    const espera = setTimeout(() => {
      acabouDeAbrir = false;
    }, 0);

    const pararDeOuvir = navigation.addListener('focus', () => {
      if (!acabouDeAbrir) {
        buscarPedidos();
      }
    });

    return () => {
      clearTimeout(espera);
      pararDeOuvir();
    };
  }, [navigation, usuarioId]);

  const semPedidos = pedidos.length === 0;

  if (semPedidos && erro) {
    return (
      <View style={styles.tela}>
        <View style={styles.conteudo}>
          <Aviso tipo="erro" mensagem={erro} acao={{ titulo: 'Tentar de novo', onPress: buscarPedidos }} />
        </View>
      </View>
    );
  }

  if (semPedidos && (carregando || !buscou)) {
    return (
      <View style={styles.centro}>
        <Carregando mensagem="Carregando seus pedidos..." />
      </View>
    );
  }

  if (semPedidos) {
    return (
      <View style={styles.centro}>
        <EstadoVazio
          icone="chart-box-outline"
          titulo="Você ainda não fez nenhum pedido"
          mensagem="Quando fizer o primeiro, o resumo dos seus gastos aparece aqui."
          acao={{ titulo: 'Ver cardápio', onPress: () => navigation.navigate(ROTAS.CARDAPIO) }}
        />
      </View>
    );
  }

  const doPeriodo = filtrarPorPeriodo(pedidos, periodo, new Date());
  const resumo = resumir(doPeriodo);
  const porCategoria = categorias ? gastoPorCategoria(doPeriodo, categorias) : [];
  const maisPedidos = itensMaisPedidos(doPeriodo, 5);

  const indicadores = [
    { rotulo: 'Total gasto', valor: formatarMoeda(resumo.totalGasto), icone: 'cash-multiple' },
    { rotulo: 'Pedidos', valor: String(resumo.quantidadePedidos), icone: 'receipt-text-outline' },
    { rotulo: 'Ticket médio', valor: formatarMoeda(resumo.ticketMedio), icone: 'calculator-variant-outline' },
    {
      rotulo: 'Mais pedido',
      valor: resumo.itemMaisPedido ? resumo.itemMaisPedido.nome : 'Nenhum ainda',
      icone: 'star-outline',
    },
  ];

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.rolagem}>
      <View style={styles.conteudo}>
        {erro ? (
          <Aviso
            tipo="erro"
            mensagem={erro}
            acao={{ titulo: 'Tentar de novo', onPress: buscarPedidos }}
            style={styles.aviso}
          />
        ) : null}

        <Seletor rotulo="Período" valor={periodo} aoMudar={setPeriodo} opcoes={PERIODOS} />

        {doPeriodo.length === 0 ? (
          <Cartao style={styles.semPeriodo}>
            <Text style={styles.semPeriodoTitulo}>Nenhum pedido neste período.</Text>
            <Text style={styles.semPeriodoTexto}>Escolha outro período para ver seus gastos.</Text>
          </Cartao>
        ) : (
          <>
            <View style={styles.grade}>
              {indicadores.map((indicador) => (
                <View key={indicador.rotulo} style={styles.celula}>
                  <Indicador rotulo={indicador.rotulo} valor={indicador.valor} icone={indicador.icone} />
                </View>
              ))}
            </View>

            {porCategoria.length > 0 ? (
              <View style={styles.secao}>
                <Text style={styles.tituloSecao} accessibilityRole="header">
                  Gasto por categoria
                </Text>
                <Cartao>
                  {porCategoria.map((categoria) => (
                    <BarraCategoria
                      key={categoria.id}
                      nome={categoria.nome}
                      icone={categoria.icone}
                      valor={categoria.valor}
                      percentual={categoria.percentual}
                    />
                  ))}
                </Cartao>
              </View>
            ) : null}

            {maisPedidos.length > 0 ? (
              <View style={styles.secao}>
                <Text style={styles.tituloSecao} accessibilityRole="header">
                  Mais pedidos
                </Text>
                <Cartao>
                  {maisPedidos.map((item, indice) => (
                    <View
                      key={item.nome}
                      style={[styles.item, indice > 0 && styles.itemComDivisor]}
                      accessible
                      accessibilityLabel={`${indice + 1}º ${item.nome}, ${unidades(item.quantidade)}, ${formatarMoeda(item.valor)}`}
                    >
                      <Text style={styles.posicao}>{indice + 1}</Text>
                      <Text style={styles.itemNome} numberOfLines={2}>
                        {item.nome}
                      </Text>
                      <Text style={styles.itemQuantidade}>{`${item.quantidade} un.`}</Text>
                      <Text style={styles.itemValor}>{formatarMoeda(item.valor)}</Text>
                    </View>
                  ))}
                </Cartao>
              </View>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}
