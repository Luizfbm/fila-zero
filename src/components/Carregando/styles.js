import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.xl,
  },
  mensagem: {
    ...fontes.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: espacos.md,
  },
});
