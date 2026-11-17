import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espacos.xs,
  },
  botao: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.superficie,
  },
  pressionado: {
    backgroundColor: cores.primariaClara,
  },
  valor: {
    ...fontes.corpo,
    fontWeight: '600',
    minWidth: espacos.xl,
    textAlign: 'center',
  },
});
