import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../Cartao';
import ControleQuantidade from '../ControleQuantidade';
import Etiqueta from '../Etiqueta';
import { cores } from '../../theme';
import { formatarMoeda } from '../../utils/formatar';
import styles from './styles';

export default function ItemCardapio({
  produto,
  categoria,
  quantidade = 0,
  aoAdicionar,
  aoAumentar,
  aoDiminuir,
}) {
  const esgotado = !produto.disponivel;
  const icone = categoria && categoria.icone ? categoria.icone : 'food';

  function acao() {
    if (esgotado) {
      return <Etiqueta texto="Esgotado" tom="neutro" />;
    }

    if (quantidade > 0) {
      return (
        <ControleQuantidade
          valor={quantidade}
          aoDiminuir={() => aoDiminuir(produto)}
          aoAumentar={() => aoAumentar(produto)}
        />
      );
    }

    return (
      <Pressable
        onPress={() => aoAdicionar(produto)}
        accessibilityRole="button"
        accessibilityLabel={`Adicionar ${produto.nome}`}
        style={({ pressed }) => [styles.adicionar, pressed && styles.adicionarPressionado]}
      >
        <MaterialCommunityIcons name="plus" size={18} color={cores.primariaEscura} />
        <Text style={styles.adicionarTexto}>Adicionar</Text>
      </Pressable>
    );
  }

  return (
    <Cartao style={styles.cartao}>
      <View
        testID="item-cardapio-conteudo"
        style={[styles.conteudo, esgotado && styles.esmaecido]}
      >
        <View style={styles.icone}>
          <MaterialCommunityIcons name={icone} size={24} color={cores.primariaEscura} />
        </View>
        <View style={styles.textos}>
          <Text style={styles.nome}>{produto.nome}</Text>
          {produto.descricao ? (
            <Text style={styles.descricao} numberOfLines={2}>
              {produto.descricao}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rodape}>
        <Text style={[styles.preco, esgotado && styles.esmaecido]}>
          {formatarMoeda(produto.preco)}
        </Text>
        {acao()}
      </View>
    </Cartao>
  );
}
