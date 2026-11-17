import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Aviso from '../../components/Aviso';
import BarraCarrinho from '../../components/BarraCarrinho';
import CampoTexto from '../../components/CampoTexto';
import Carregando from '../../components/Carregando';
import EstadoVazio from '../../components/EstadoVazio';
import ItemCardapio from '../../components/ItemCardapio';
import Seletor from '../../components/Seletor';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { useUsuario } from '../../contexts/UsuarioContext';
import { ROTAS } from '../../navigation/rotas';
import { listarCategorias, listarProdutos } from '../../services/produtos';
import { cores } from '../../theme';
import styles, { LARGURA_MAXIMA } from './styles';

const TODAS = '';

// "Pão" e "pao" precisam bater: tiro os acentos e deixo tudo em minúscula.
function semAcento(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function contar(achados, total) {
  return `${achados} de ${total} ${total === 1 ? 'produto' : 'produtos'}`;
}

// Esgotado vai para o fim; dentro de cada grupo a ordem do serviço continua.
function disponiveisPrimeiro(lista) {
  return [
    ...lista.filter((produto) => produto.disponivel),
    ...lista.filter((produto) => !produto.disponivel),
  ];
}

function sempre() {
  return true;
}

function Separador() {
  return <View style={styles.separador} />;
}

export default function Cardapio({ navigation }) {
  const { usuario } = useUsuario();
  const { itens, total, quantidade, adicionar, alterarQuantidade } = useCarrinho();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [origem, setOrigem] = useState('api');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState(TODAS);

  // `continuar` diz se a tela ainda está aberta; se ela fechou no meio da carga, a resposta é descartada.
  async function carregar(continuar = sempre) {
    setCarregando(true);
    setErro(false);
    try {
      const [respostaProdutos, respostaCategorias] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
      ]);
      if (!continuar()) return;
      const algumLocal = respostaProdutos.origem === 'local' || respostaCategorias.origem === 'local';
      setProdutos(respostaProdutos.dados);
      setCategorias(respostaCategorias.dados);
      setOrigem(algumLocal ? 'local' : 'api');
    } catch (falha) {
      if (!continuar()) return;
      setErro(true);
    }
    setCarregando(false);
  }

  useEffect(() => {
    let ativo = true;
    carregar(() => ativo);
    return () => {
      ativo = false;
    };
  }, []);

  function limparFiltros() {
    setBusca('');
    setCategoria(TODAS);
  }

  function quantidadeNoCarrinho(produtoId) {
    const item = itens.find((atual) => atual.produto.id === produtoId);
    return item ? item.quantidade : 0;
  }

  // Chegando a zero o próprio carrinho tira o item.
  function diminuir(produto) {
    alterarQuantidade(produto.id, quantidadeNoCarrinho(produto.id) - 1);
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <Carregando mensagem="Carregando o cardápio..." />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.tela}>
        <View style={styles.coluna}>
          <Aviso
            tipo="erro"
            mensagem="Não deu para carregar o cardápio."
            acao={{ titulo: 'Tentar de novo', onPress: () => carregar() }}
          />
        </View>
      </View>
    );
  }

  const primeiroNome = usuario && usuario.nome ? usuario.nome.trim().split(/\s+/)[0] : '';
  const procurado = semAcento(busca);
  const categoriaEscolhida = categorias.find((item) => item.id === categoria);

  const visiveis = disponiveisPrimeiro(
    produtos.filter((produto) => {
      const daCategoria = categoria === TODAS || produto.categoria === categoria;
      const doNome = procurado === '' || semAcento(produto.nome).includes(procurado);
      return daCategoria && doNome;
    })
  );

  const opcoes = [
    { rotulo: 'Todas as categorias', valor: TODAS },
    ...categorias.map((item) => ({ rotulo: item.nome, valor: item.id })),
  ];

  function mensagemDeVazio() {
    const termo = busca.trim();
    if (termo && categoriaEscolhida) {
      return `Nada com "${termo}" em ${categoriaEscolhida.nome}.`;
    }
    if (termo) {
      return `Nada com "${termo}" no cardápio.`;
    }
    if (categoriaEscolhida) {
      return `Nenhum item em ${categoriaEscolhida.nome} por enquanto.`;
    }
    return 'A cantina ainda não cadastrou nenhum item.';
  }

  const filtrando = busca.trim() !== '' || categoria !== TODAS;

  const cabecalho = (
    <View>
      <Text style={styles.saudacao} accessibilityRole="header">
        {primeiroNome ? `Oi, ${primeiroNome}` : 'Oi'}
      </Text>

      {origem === 'local' ? (
        <View style={styles.avisoLocal}>
          <MaterialCommunityIcons name="information-outline" size={16} color={cores.textoSuave} />
          <Text style={styles.avisoLocalTexto}>
            Este é um cardápio de exemplo. Itens e preços podem não ser os da cantina.
          </Text>
        </View>
      ) : null}

      <View style={styles.filtros}>
        <CampoTexto
          rotulo="Buscar no cardápio"
          placeholder="Ex.: coxinha"
          value={busca}
          onChangeText={setBusca}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.filtro}
        />
        <Seletor
          rotulo="Categoria"
          valor={categoria}
          aoMudar={setCategoria}
          opcoes={opcoes}
          style={styles.filtro}
        />
      </View>

      {filtrando && visiveis.length > 0 ? (
        <Text style={styles.contador} accessibilityLiveRegion="polite">
          {contar(visiveis.length, produtos.length)}
        </Text>
      ) : null}
    </View>
  );

  const vazio = (
    <EstadoVazio
      icone={filtrando ? 'magnify-close' : 'food-off'}
      titulo={filtrando ? 'Nada encontrado' : 'Cardápio vazio'}
      mensagem={mensagemDeVazio()}
      acao={filtrando ? { titulo: 'Limpar filtros', onPress: limparFiltros } : undefined}
    />
  );

  return (
    <View style={styles.tela}>
      <FlatList
        data={visiveis}
        keyExtractor={(produto) => String(produto.id)}
        renderItem={({ item }) => (
          <ItemCardapio
            produto={item}
            categoria={categorias.find((atual) => atual.id === item.categoria)}
            quantidade={quantidadeNoCarrinho(item.id)}
            aoAdicionar={adicionar}
            aoAumentar={adicionar}
            aoDiminuir={diminuir}
          />
        )}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={vazio}
        ItemSeparatorComponent={Separador}
        keyboardShouldPersistTaps="handled"
        style={styles.lista}
        contentContainerStyle={styles.conteudoDaLista}
      />
      <BarraCarrinho
        quantidade={quantidade}
        total={total}
        aoAbrir={() => navigation.navigate(ROTAS.CARRINHO)}
        larguraMaxima={LARGURA_MAXIMA}
      />
    </View>
  );
}
