import 'react-native-gesture-handler/jestSetup';

// Os ícones carregam fonte pelo expo-font, que não roda no Jest. Nos testes viram um Text com o nome do ícone.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  function MaterialCommunityIcons({ name }) {
    return React.createElement(Text, { accessibilityElementsHidden: true }, name);
  }

  return { MaterialCommunityIcons };
});
