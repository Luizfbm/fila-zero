import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from './styles';

export default function Seletor({ rotulo, valor, aoMudar, opcoes = [], erro }) {
  const [focado, setFocado] = useState(false);

  // Na web o Picker é um <select> e sempre entrega texto,
  // então procuro a opção para devolver o valor do jeito que ele veio.
  function aoEscolher(escolhido) {
    const opcao = opcoes.find((item) => String(item.valor) === String(escolhido));
    aoMudar(opcao ? opcao.valor : escolhido);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View
        style={[
          styles.caixa,
          focado && styles.caixaFocada,
          erro ? styles.caixaComErro : null,
        ]}
      >
        <Picker
          accessibilityLabel={rotulo}
          selectedValue={valor}
          onValueChange={aoEscolher}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={styles.seletor}
        >
          {opcoes.map((opcao) => (
            <Picker.Item
              key={String(opcao.valor)}
              label={opcao.rotulo}
              value={opcao.valor}
            />
          ))}
        </Picker>
      </View>
      {erro ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}
