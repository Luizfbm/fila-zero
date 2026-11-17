import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import styles from './styles';

export default function ControleQuantidade({ valor, aoDiminuir, aoAumentar }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={aoDiminuir}
        accessibilityRole="button"
        accessibilityLabel="Diminuir quantidade"
        style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
      >
        <MaterialCommunityIcons name="minus" size={20} color={cores.primariaEscura} />
      </Pressable>
      <Text style={styles.valor} accessibilityLabel={`Quantidade: ${valor}`}>
        {valor}
      </Text>
      <Pressable
        onPress={aoAumentar}
        accessibilityRole="button"
        accessibilityLabel="Aumentar quantidade"
        style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
      >
        <MaterialCommunityIcons name="plus" size={20} color={cores.primariaEscura} />
      </Pressable>
    </View>
  );
}
