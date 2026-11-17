import React, { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { cores, espacos } from '../../theme';
import { formatarMoeda } from '../../utils/formatar';
import styles from './styles';

export default function BarraCarrinho({ quantidade, total, aoAbrir, larguraMaxima }) {
  // No iPhone a barra de gestos fica por cima do rodapé; o respiro cresce o tanto que ela ocupa.
  const margens = useContext(SafeAreaInsetsContext);
  const folga = margens ? margens.bottom : 0;

  if (!quantidade) {
    return null;
  }

  const itens = quantidade === 1 ? '1 item' : `${quantidade} itens`;
  const valor = formatarMoeda(total);

  return (
    <View
      testID="barra-carrinho-faixa"
      style={[styles.faixa, { paddingBottom: espacos.sm + folga }]}
    >
      <Pressable
        onPress={aoAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Ver carrinho, ${itens}, ${valor}`}
        style={({ pressed }) => [
          styles.barra,
          larguraMaxima ? { maxWidth: larguraMaxima } : null,
          pressed && styles.pressionada,
        ]}
      >
        <View style={styles.resumo}>
          <Text style={styles.itens}>{itens}</Text>
          <Text style={styles.total}>{valor}</Text>
        </View>
        <View style={styles.acao}>
          <Text style={styles.acaoTexto}>Ver carrinho</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={cores.textoSobrePrimaria} />
        </View>
      </Pressable>
    </View>
  );
}
