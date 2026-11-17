import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Aviso from '../../components/Aviso';
import Botao from '../../components/Botao';
import CampoTexto from '../../components/CampoTexto';
import EstadoVazio from '../../components/EstadoVazio';
import ItemCarrinho from '../../components/ItemCarrinho';
import Seletor from '../../components/Seletor';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { usePedidos } from '../../contexts/PedidosContext';
import { useUsuario } from '../../contexts/UsuarioContext';
import horarios from '../../data/horarios.json';
import { ROTAS } from '../../navigation/rotas';
import { cores } from '../../theme';
import { formatarMoeda, numeroDoPedido } from '../../utils/formatar';
import styles from './styles';

const LIMITE_DA_OBSERVACAO = 140;
const ERRO_SEM_HORARIO = 'Escolha o horário de retirada';
const ERRO_NO_ENVIO = 'Não deu para enviar o pedido. Seus itens continuam no carrinho.';

const opcoesDeHorario = [
  { rotulo: 'Escolha um horário', valor: '' },
  ...horarios.map((horario) => ({ rotulo: horario, valor: horario })),
];

export default function Carrinho({ navigation }) {
  const { usuario } = useUsuario();
  const { itens, total, quantidade, remover, alterarQuantidade, limpar } = useCarrinho();
  const { registrar } = usePedidos();

  const [retirada, setRetirada] = useState('');
  const [erroDaRetirada, setErroDaRetirada] = useState('');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroDoEnvio, setErroDoEnvio] = useState('');
  // Guarda o pedido que acabou de ser aceito enquanto a confirmação está na tela.
  const [confirmado, setConfirmado] = useState(null);

  // Quem sai da tela e volta depois encontra o carrinho, sem a confirmação nem o erro de antes.
  useEffect(() => {
    const cancelar = navigation.addListener('blur', () => {
      setConfirmado(null);
      setErroDoEnvio('');
    });
    return cancelar;
  }, [navigation]);

  // Item novo no carrinho quer dizer que a pessoa já está montando outro pedido.
  useEffect(() => {
    if (itens.length > 0) {
      setConfirmado(null);
    }
  }, [itens.length]);

  function escolherRetirada(horario) {
    setRetirada(horario);
    if (horario) {
      setErroDaRetirada('');
    }
  }

  function escreverObservacao(texto) {
    setObservacao(texto.slice(0, LIMITE_DA_OBSERVACAO));
  }

  async function confirmar() {
    if (enviando) {
      return;
    }
    if (!retirada) {
      setErroDaRetirada(ERRO_SEM_HORARIO);
      return;
    }

    const pedido = {
      usuarioId: usuario ? usuario.id : null,
      itens: itens.map((item) => ({
        produtoId: item.produto.id,
        nome: item.produto.nome,
        preco: item.produto.preco,
        quantidade: item.quantidade,
        categoria: item.produto.categoria,
      })),
      total,
      retirada,
      observacao: observacao.trim(),
    };

    setEnviando(true);
    setErroDoEnvio('');
    try {
      const criado = await registrar(pedido);
      limpar();
      setConfirmado(criado);
      setRetirada('');
      setObservacao('');
    } catch (falha) {
      setErroDoEnvio(ERRO_NO_ENVIO);
    }
    setEnviando(false);
  }

  if (confirmado) {
    return (
      <View style={styles.tela}>
        <View style={styles.centro}>
          <MaterialCommunityIcons name="check-circle" size={72} color={cores.sucesso} />
          <Text style={styles.confirmacaoTitulo} accessibilityRole="header">
            Pedido nº {numeroDoPedido(confirmado.id)} recebido
          </Text>
          <Text style={styles.confirmacaoTexto}>Retire no balcão às {confirmado.retirada}</Text>
          <Text style={styles.confirmacaoTotal}>Total: {formatarMoeda(confirmado.total)}</Text>
          <Text style={styles.confirmacaoTexto}>Acompanhe o andamento em Meus pedidos.</Text>
          <View style={styles.confirmacaoAcoes}>
            <Botao titulo="Ver meus pedidos" onPress={() => navigation.navigate(ROTAS.PEDIDOS)} />
            <Botao
              titulo="Voltar ao cardápio"
              variante="secundario"
              onPress={() => navigation.navigate(ROTAS.CARDAPIO)}
            />
          </View>
        </View>
      </View>
    );
  }

  if (itens.length === 0) {
    return (
      <View style={styles.tela}>
        <View style={styles.centro}>
          <EstadoVazio
            icone="cart-outline"
            titulo="Seu carrinho está vazio"
            mensagem="Escolha o que vai querer no cardápio e o pedido aparece aqui."
            acao={{ titulo: 'Ver cardápio', onPress: () => navigation.navigate(ROTAS.CARDAPIO) }}
          />
        </View>
      </View>
    );
  }

  const rodape = (
    <View style={styles.rodape}>
      <Text style={styles.secao} accessibilityRole="header">
        Retirada
      </Text>
      <Seletor
        rotulo="Horário"
        valor={retirada}
        aoMudar={escolherRetirada}
        opcoes={opcoesDeHorario}
        erro={erroDaRetirada}
      />
      <CampoTexto
        rotulo="Observação (opcional)"
        value={observacao}
        onChangeText={escreverObservacao}
        placeholder="Ex.: sem cebola"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={LIMITE_DA_OBSERVACAO}
        style={styles.observacao}
      />
      <Text
        style={styles.contador}
        accessibilityLabel={`${observacao.length} de ${LIMITE_DA_OBSERVACAO} caracteres`}
      >
        {observacao.length}/{LIMITE_DA_OBSERVACAO}
      </Text>
    </View>
  );

  return (
    <View style={styles.tela}>
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.produto.id)}
        renderItem={({ item }) => (
          <ItemCarrinho
            item={item}
            aoAumentar={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
            aoDiminuir={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}
            aoRemover={() => remover(item.produto.id)}
          />
        )}
        ListFooterComponent={rodape}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        style={styles.rolagem}
      />
      {erroDoEnvio ? (
        <View style={styles.faixaDoAviso}>
          <Aviso
            tipo="erro"
            mensagem={erroDoEnvio}
            acao={{ titulo: 'Tentar de novo', onPress: confirmar }}
          />
        </View>
      ) : null}
      <View style={styles.barra}>
        <View style={styles.barraConteudo}>
          <View style={styles.barraTotal}>
            <Text style={styles.barraLegenda}>
              Total <Text style={styles.barraItens}>{quantidade === 1 ? '1 item' : `${quantidade} itens`}</Text>
            </Text>
            <Text style={styles.totalValor}>{formatarMoeda(total)}</Text>
          </View>
          <Botao titulo="Confirmar pedido" onPress={confirmar} carregando={enviando} />
        </View>
      </View>
    </View>
  );
}
