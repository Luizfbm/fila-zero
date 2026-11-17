import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { cores } from '../../theme';
import styles from './styles';

export default function CampoTexto({ rotulo, erro, style, onFocus, onBlur, ...props }) {
  const [focado, setFocado] = useState(false);

  function aoFocar(evento) {
    setFocado(true);
    if (onFocus) onFocus(evento);
  }

  function aoDesfocar(evento) {
    setFocado(false);
    if (onBlur) onBlur(evento);
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSuave}
        {...props}
        onFocus={aoFocar}
        onBlur={aoDesfocar}
        style={[
          styles.campo,
          focado && styles.campoFocado,
          erro ? styles.campoComErro : null,
        ]}
      />
      {erro ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}
