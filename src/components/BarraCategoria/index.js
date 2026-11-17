import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatarMoeda } from '../../utils/formatar';
import { cores } from '../../theme';
import styles, { TAMANHO_ICONE } from './styles';

export default function BarraCategoria({ nome, icone, valor, percentual }) {
  const numero = Number(percentual);
  const limitado = Math.min(100, Math.max(0, Number.isFinite(numero) ? numero : 0));
  // Quem gastou alguma coisa mas não chegou a 1% aparece como "menos de 1%", com um fio de barra.
  const quaseNada = limitado < 1 && Number(valor) > 0;
  const largura = quaseNada ? 1 : limitado;
  const textoPercentual = quaseNada ? 'menos de 1%' : `${percentual}%`;
  const valorFormatado = formatarMoeda(valor);

  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`${nome}: ${valorFormatado}, ${textoPercentual} do total`}
    >
      {icone ? <MaterialCommunityIcons name={icone} size={TAMANHO_ICONE} color={cores.textoSuave} /> : null}
      <View testID="barra-coluna" style={styles.coluna}>
        <View style={styles.topo}>
          <Text style={styles.nome} numberOfLines={1}>
            {nome}
          </Text>
          <Text style={styles.valor}>{valorFormatado}</Text>
          <Text style={styles.percentual}>{textoPercentual}</Text>
        </View>
        <View testID="barra-trilho" style={styles.trilho}>
          <View testID="barra-preenchimento" style={[styles.preenchimento, { width: `${largura}%` }]} />
        </View>
      </View>
    </View>
  );
}
