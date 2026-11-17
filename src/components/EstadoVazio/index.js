import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../Botao';
import { cores } from '../../theme';
import styles from './styles';

export default function EstadoVazio({ icone, titulo, mensagem, acao }) {
  return (
    <View style={styles.container}>
      {icone ? (
        <View style={styles.icone}>
          <MaterialCommunityIcons name={icone} size={40} color={cores.primariaEscura} />
        </View>
      ) : null}
      <Text style={styles.titulo}>{titulo}</Text>
      {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
      {acao ? (
        <View style={styles.acao}>
          <Botao titulo={acao.titulo} onPress={acao.onPress} />
        </View>
      ) : null}
    </View>
  );
}
