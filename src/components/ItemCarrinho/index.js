import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../Cartao';
import ControleQuantidade from '../ControleQuantidade';
import { cores } from '../../theme';
import { formatarMoeda } from '../../utils/formatar';
import styles from './styles';

export default function ItemCarrinho({ item, aoAumentar, aoDiminuir, aoRemover }) {
  const { produto, quantidade } = item;
  // Em centavos para a conta não sair com 0,30000000000000004.
  const subtotal = Math.round(produto.preco * 100 * quantidade) / 100;

  return (
    <Cartao style={styles.cartao}>
      <View style={styles.topo}>
        <View style={styles.descricao}>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.unitario}>{formatarMoeda(produto.preco)} cada</Text>
        </View>
        <Pressable
          onPress={aoRemover}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${produto.nome}`}
          style={({ pressed }) => [styles.remover, pressed && styles.removerPressionado]}
        >
          {({ pressed }) => (
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={22}
              color={pressed ? cores.erro : cores.textoSuave}
            />
          )}
        </Pressable>
      </View>
      <View style={styles.rodape}>
        <ControleQuantidade valor={quantidade} aoDiminuir={aoDiminuir} aoAumentar={aoAumentar} />
        <View style={styles.subtotal}>
          <Text style={styles.rotuloSubtotal}>Subtotal</Text>
          <Text style={styles.valorSubtotal}>{formatarMoeda(subtotal)}</Text>
        </View>
      </View>
    </Cartao>
  );
}
