import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import styles from './styles';

export default function Indicador({ rotulo, valor, icone }) {
  return (
    <View style={styles.indicador} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <View style={styles.topo}>
        <Text style={styles.rotulo} numberOfLines={1}>
          {rotulo}
        </Text>
        {icone ? <MaterialCommunityIcons name={icone} size={18} color={cores.textoSuave} /> : null}
      </View>
      <Text style={styles.valor} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}
