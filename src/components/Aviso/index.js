import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../Botao';
import styles, { aparencia } from './styles';

export default function Aviso({ tipo = 'info', mensagem, acao }) {
  const { icone, cor } = aparencia[tipo] || aparencia.info;

  return (
    <View style={[styles.aviso, styles[tipo] || styles.info]}>
      <View style={styles.linha}>
        <MaterialCommunityIcons name={icone} size={22} color={cor} />
        <Text
          style={styles.mensagem}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {mensagem}
        </Text>
      </View>
      {acao ? (
        <View style={styles.acao}>
          <Botao titulo={acao.titulo} onPress={acao.onPress} variante="texto" />
        </View>
      ) : null}
    </View>
  );
}
