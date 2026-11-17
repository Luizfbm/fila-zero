import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export const corDoConteudo = {
  primario: cores.textoSobrePrimaria,
  secundario: cores.primariaEscura,
  texto: cores.primariaEscura,
};

export default StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  primario: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  secundario: {
    backgroundColor: 'transparent',
    borderColor: cores.primaria,
  },
  texto: {
    backgroundColor: 'transparent',
    paddingHorizontal: espacos.sm,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.5,
  },
  titulo: {
    ...fontes.corpo,
    fontWeight: '600',
    textAlign: 'center',
  },
});
