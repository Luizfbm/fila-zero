import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import { formatarMoeda } from '../../utils/formatar';
import styles from './styles';

export default function BarraCarrinho({ quantidade, total, aoAbrir }) {
  if (!quantidade) {
    return null;
  }

  const itens = quantidade === 1 ? '1 item' : `${quantidade} itens`;
  const valor = formatarMoeda(total);

  return (
    <View style={styles.faixa}>
      <Pressable
        onPress={aoAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Ver carrinho, ${itens}, ${valor}`}
        style={({ pressed }) => [styles.barra, pressed && styles.pressionada]}
      >
        <MaterialCommunityIcons name="cart-outline" size={22} color={cores.textoSobrePrimaria} />
        <Text style={styles.resumo} numberOfLines={1}>
          {`${itens} · ${valor}`}
        </Text>
        <View style={styles.acao}>
          <Text style={styles.acaoTexto}>Ver carrinho</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={cores.textoSobrePrimaria} />
        </View>
      </Pressable>
    </View>
  );
}
