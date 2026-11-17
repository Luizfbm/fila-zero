import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';

export default function Etiqueta({ texto, tom = 'neutro' }) {
  return (
    <View style={[styles.etiqueta, styles[tom] || styles.neutro]}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}
