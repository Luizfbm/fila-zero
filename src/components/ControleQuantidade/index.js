import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import styles from './styles';

export default function ControleQuantidade({ valor, nome, aoDiminuir, aoAumentar }) {
  // Com vários itens na tela, o nome diz ao leitor de tela de qual produto é o botão.
  const alvo = nome ? `quantidade de ${nome}` : 'quantidade';

  return (
    <View style={styles.container}>
      <Pressable
        onPress={aoDiminuir}
        accessibilityRole="button"
        accessibilityLabel={`Diminuir ${alvo}`}
        style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
      >
        <MaterialCommunityIcons name="minus" size={20} color={cores.primariaEscura} />
      </Pressable>
      <Text style={styles.valor}>{valor}</Text>
      <Pressable
        onPress={aoAumentar}
        accessibilityRole="button"
        accessibilityLabel={`Aumentar ${alvo}`}
        style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
      >
        <MaterialCommunityIcons name="plus" size={20} color={cores.primariaEscura} />
      </Pressable>
    </View>
  );
}
