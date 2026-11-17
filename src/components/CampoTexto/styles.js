import { Platform, StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  container: {
    marginBottom: espacos.md,
  },
  rotulo: {
    ...fontes.corpo,
    fontWeight: '600',
    marginBottom: espacos.xs,
  },
  campo: {
    ...fontes.corpo,
    minHeight: 48,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    // Na web o navegador desenha um contorno próprio no foco; a borda já faz esse papel.
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  campoFocado: {
    borderColor: cores.primaria,
  },
  campoComErro: {
    borderColor: cores.erro,
  },
  erro: {
    ...fontes.legenda,
    color: cores.erro,
    marginTop: espacos.xs,
  },
});
