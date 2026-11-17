import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatarMoeda } from '../../utils/formatar';
import { cores } from '../../theme';
import styles from './styles';

export default function BarraCategoria({ nome, icone, valor, percentual }) {
  const numero = Number(percentual);
  const largura = Math.min(100, Math.max(0, Number.isFinite(numero) ? numero : 0));
  const valorFormatado = formatarMoeda(valor);

  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`${nome}: ${valorFormatado}, ${percentual}% do total`}
    >
      <View style={styles.topo}>
        {icone ? <MaterialCommunityIcons name={icone} size={18} color={cores.textoSuave} /> : null}
        <Text style={styles.nome} numberOfLines={1}>
          {nome}
        </Text>
        <Text style={styles.valor}>{valorFormatado}</Text>
        <Text style={styles.percentual}>{`${percentual}%`}</Text>
      </View>
      <View testID="barra-trilho" style={styles.trilho}>
        <View testID="barra-preenchimento" style={[styles.preenchimento, { width: `${largura}%` }]} />
      </View>
    </View>
  );
}
