import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { cores } from '../../theme';
import styles from './styles';

export default function Carregando({ mensagem = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        testID="carregando-indicador"
        size="large"
        color={cores.primaria}
      />
      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}
