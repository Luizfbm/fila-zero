import { StyleSheet } from 'react-native';
import { cores, espacos, raios, sombra } from '../../theme';

export default StyleSheet.create({
  cartao: {
    ...sombra,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
  },
});
