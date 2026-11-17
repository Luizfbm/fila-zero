import React from 'react';
import { View } from 'react-native';
import styles from './styles';

export default function Cartao({ children, style }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}
