import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  titulo: { ...fontes.titulo },
});
