import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
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
import styles from './styles';

const TODAS = '';

// "Pão" e "pao" precisam bater: tiro os acentos e deixo tudo em minúscula.
function semAcento(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function contar(total) {
  return total === 1 ? '1 item' : `${total} itens`;
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

  async function carregar() {
    setCarregando(true);
    setErro(false);
    try {
      const [respostaProdutos, respostaCategorias] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
      ]);
      setProdutos(respostaProdutos.dados);
      setCategorias(respostaCategorias.dados);
      setOrigem(respostaProdutos.origem);
    } catch (falha) {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparFiltros() {
    setBusca('');
    setCategoria(TODAS);
  }

  function quantidadeNoCarrinho(produtoId) {
    const item = itens.find((atual) => atual.produto.id === produtoId);
    return item ? item.quantidade : 0;
  }

  function aumentar(produto) {
    alterarQuantidade(produto.id, quantidadeNoCarrinho(produto.id) + 1);
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
            acao={{ titulo: 'Tentar de novo', onPress: carregar }}
          />
        </View>
      </View>
    );
  }

  const primeiroNome = usuario && usuario.nome ? usuario.nome.trim().split(/\s+/)[0] : '';
  const procurado = semAcento(busca);
  const categoriaEscolhida = categorias.find((item) => item.id === categoria);

  const visiveis = produtos.filter((produto) => {
    const daCategoria = categoria === TODAS || produto.categoria === categoria;
    const doNome = procurado === '' || semAcento(produto.nome).includes(procurado);
    return daCategoria && doNome;
  });

  const opcoes = [
    { rotulo: 'Todas as categorias', valor: TODAS },
    ...categorias.map((item) => ({ rotulo: item.nome, valor: item.id })),
  ];

  function mensagemDeVazio() {
    const termo = busca.trim();
    if (termo && categoriaEscolhida) {
      return `Nenhum item de ${categoriaEscolhida.nome} tem "${termo}" no nome.`;
    }
    if (termo) {
      return `Nenhum item tem "${termo}" no nome.`;
    }
    if (categoriaEscolhida) {
      return `Ainda não tem nenhum item em ${categoriaEscolhida.nome}.`;
    }
    return 'A cantina ainda não cadastrou nenhum item.';
  }

  const filtrando = busca.trim() !== '' || categoria !== TODAS;

  const cabecalho = (
    <View>
      <Text style={styles.saudacao} accessibilityRole="header">
        {primeiroNome ? `Oi, ${primeiroNome}` : 'Oi'}
      </Text>
      <Text style={styles.chamada}>O que você vai pedir hoje?</Text>

      {origem === 'local' ? (
        <Aviso
          tipo="info"
          mensagem="Este cardápio é de exemplo e está guardado no aparelho."
          style={styles.avisoLocal}
        />
      ) : null}

      <View style={styles.filtros}>
        <CampoTexto
          rotulo="Buscar no cardápio"
          placeholder="Nome do item"
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

      {visiveis.length > 0 ? (
        <Text style={styles.contador} accessibilityLiveRegion="polite">
          {contar(visiveis.length)}
        </Text>
      ) : null}
    </View>
  );

  const vazio = (
    <EstadoVazio
      icone="magnify-close"
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
            aoAumentar={aumentar}
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
      />
    </View>
  );
}
