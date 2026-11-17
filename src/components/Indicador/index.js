import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import styles, { TAMANHO_ICONE } from './styles';

// Com `detalhe`, o valor é um texto (o nome de um item, por exemplo) e o detalhe vem embaixo.
export default function Indicador({ rotulo, valor, icone, detalhe }) {
  const leitura = detalhe ? `${rotulo}: ${valor}, ${detalhe}` : `${rotulo}: ${valor}`;

  return (
    <View style={styles.indicador} accessible accessibilityLabel={leitura}>
      <View style={styles.topo}>
        <Text style={styles.rotulo} numberOfLines={1}>
          {rotulo}
        </Text>
        {icone ? <MaterialCommunityIcons name={icone} size={TAMANHO_ICONE} color={cores.textoSuave} /> : null}
      </View>
      <Text style={detalhe ? styles.valorEmTexto : styles.valor} numberOfLines={2}>
        {valor}
      </Text>
      {detalhe ? (
        <Text style={styles.detalhe} numberOfLines={1}>
          {detalhe}
        </Text>
      ) : null}
    </View>
  );
}
