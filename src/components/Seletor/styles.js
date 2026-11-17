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
  // Mesma caixa do CampoTexto: altura, borda, raio e fundo iguais.
  caixa: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    overflow: 'hidden',
  },
  caixaFocada: {
    borderColor: cores.primaria,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  seletor: {
    ...fontes.corpo,
    ...Platform.select({
      // O <select> da web traz borda e fundo próprios; tiro para sobrar só a caixa.
      web: {
        height: 45,
        paddingHorizontal: espacos.md,
        borderWidth: 0,
        backgroundColor: 'transparent',
        outlineStyle: 'none',
      },
      android: {
        height: 45,
      },
      default: {},
    }),
  },
  erro: {
    ...fontes.legenda,
    color: cores.erro,
    marginTop: espacos.xs,
  },
});
