import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.xl,
  },
  icone: {
    padding: espacos.md,
    borderRadius: raios.pilula,
    backgroundColor: cores.primariaClara,
    marginBottom: espacos.md,
  },
  titulo: {
    ...fontes.subtitulo,
    textAlign: 'center',
  },
  mensagem: {
    ...fontes.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: espacos.sm,
  },
  acao: {
    marginTop: espacos.lg,
  },
});
