import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles, { corDoConteudo } from './styles';

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  icone,
}) {
  const parado = carregando || desabilitado;
  const cor = corDoConteudo[variante] || corDoConteudo.primario;

  return (
    <Pressable
      onPress={onPress}
      disabled={parado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: parado, busy: carregando }}
      style={({ pressed }) => [
        styles.base,
        styles[variante] || styles.primario,
        pressed && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator testID="botao-carregando" color={cor} />
      ) : null}
      {icone && !carregando ? (
        <MaterialCommunityIcons
          testID="botao-icone"
          name={icone}
          size={20}
          color={cor}
        />
      ) : null}
      <Text style={[styles.titulo, { color: cor }]}>{titulo}</Text>
    </Pressable>
  );
}
