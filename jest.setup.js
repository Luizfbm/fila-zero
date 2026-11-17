import 'react-native-gesture-handler/jestSetup';

// Só para os testes rodarem rápido, sem carregar fonte: cada ícone vira um Text com o nome dele.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function Icone({ name }) {
    return React.createElement(Text, { accessibilityElementsHidden: true }, name);
  }

  return { MaterialCommunityIcons: Icone, MaterialIcons: Icone, Ionicons: Icone };
});
