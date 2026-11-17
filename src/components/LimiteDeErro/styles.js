import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.lg,
    backgroundColor: cores.fundo,
  },
  titulo: {
    ...fontes.subtitulo,
    textAlign: 'center',
    marginBottom: espacos.sm,
  },
  mensagem: {
    ...fontes.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
    marginBottom: espacos.lg,
  },
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: raios.md,
    paddingVertical: espacos.md,
    paddingHorizontal: espacos.lg,
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  textoDoBotao: {
    ...fontes.corpo,
    fontWeight: '600',
    color: cores.textoSobrePrimaria,
  },
});
