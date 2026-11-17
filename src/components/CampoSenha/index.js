import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../../theme';
import styles from './styles';

export default function CampoSenha({ rotulo, erro, style, onFocus, onBlur, ...props }) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

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
      <View
        testID="campo-senha-caixa"
        style={[
          styles.caixa,
          focado && styles.caixaFocada,
          erro ? styles.caixaComErro : null,
        ]}
      >
        <TextInput
          accessibilityLabel={rotulo}
          placeholderTextColor={cores.textoSuave}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
          secureTextEntry={!visivel}
          onFocus={aoFocar}
          onBlur={aoDesfocar}
          style={styles.campo}
        />
        <Pressable
          onPress={() => setVisivel(!visivel)}
          accessibilityRole="button"
          accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={4}
          style={styles.botao}
        >
          <MaterialCommunityIcons
            name={visivel ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={cores.textoSuave}
          />
        </Pressable>
      </View>
      {erro ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}
