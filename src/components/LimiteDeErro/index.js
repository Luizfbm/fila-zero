import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styles from './styles';

// Único componente de classe do app: o React só captura erro de renderização em classe.
export default class LimiteDeErro extends React.Component {
  state = { quebrou: false };

  static getDerivedStateFromError() {
    return { quebrou: true };
  }

  tentarDeNovo = () => {
    this.setState({ quebrou: false });
  };

  render() {
    const { children } = this.props;
    const { quebrou } = this.state;

    if (!quebrou) {
      return children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.titulo} accessibilityRole="alert">
          Não deu para abrir esta tela
        </Text>
        <Text style={styles.mensagem}>
          O app travou ao montar o que você pediu. Toque em Tentar de novo para carregar outra vez.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.tentarDeNovo}
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
        >
          <Text style={styles.textoDoBotao}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }
}
