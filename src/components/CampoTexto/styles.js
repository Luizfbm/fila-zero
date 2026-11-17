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
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: raios.md,
    // Na web o navegador desenha um contorno próprio no foco; a borda já faz esse papel.
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  // A borda engrossa 1 px no foco e o espaço interno encolhe 1 px, então nada sai do lugar.
  campoFocado: {
    borderWidth: 2,
    borderColor: cores.texto,
    paddingHorizontal: espacos.md - 1,
    paddingVertical: espacos.sm - 1,
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
