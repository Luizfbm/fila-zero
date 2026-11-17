import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../Botao';
import styles, { aparencia } from './styles';

export default function Aviso({ tipo = 'info', mensagem, acao, style }) {
  const { icone, cor } = aparencia[tipo] || aparencia.info;
  // Só o erro interrompe o leitor de tela; info e sucesso são lidos quando ele estiver livre.
  const acessibilidade =
    tipo === 'erro'
      ? { accessibilityRole: 'alert' }
      : { accessibilityLiveRegion: 'polite' };

  return (
    <View style={[styles.aviso, styles[tipo] || styles.info, style]}>
      <MaterialCommunityIcons name={icone} size={22} color={cor} />
      <View style={styles.conteudo}>
        <Text style={styles.mensagem} {...acessibilidade}>
          {mensagem}
        </Text>
        {acao ? (
          <View style={styles.acao}>
            <Botao titulo={acao.titulo} onPress={acao.onPress} variante="texto" />
          </View>
        ) : null}
      </View>
    </View>
  );
}
