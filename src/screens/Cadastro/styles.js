import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  rolagem: {
    alignItems: 'center',
    paddingHorizontal: espacos.md,
    paddingTop: espacos.lg,
    paddingBottom: espacos.xl,
  },
  // Na web larga o formulário não estica: fica numa coluna no meio da tela.
  conteudo: {
    width: '100%',
    maxWidth: 560,
  },
  abertura: {
    marginBottom: espacos.lg,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  selo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    backgroundColor: cores.primaria,
  },
  nomeDoApp: {
    ...fontes.titulo,
    fontSize: 30,
    color: cores.primariaEscura,
  },
  frase: {
    ...fontes.corpo,
    color: cores.textoSuave,
  },
  aviso: {
    marginBottom: espacos.md,
  },
  secao: {
    marginBottom: espacos.md,
  },
  tituloDaSecao: {
    ...fontes.subtitulo,
  },
  dicaDaSecao: {
    ...fontes.legenda,
    marginTop: espacos.xs,
  },
  campos: {
    marginTop: espacos.md,
  },
  // O Cartao já tem respiro embaixo, então o último campo de cada seção não precisa de margem.
  ultimoCampo: {
    marginBottom: 0,
  },
  grupoDoCep: {
    marginBottom: espacos.md,
  },
  buscando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    marginTop: espacos.sm,
  },
  textoBuscando: {
    ...fontes.legenda,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
  },
  cidade: {
    flex: 1,
  },
  uf: {
    width: 96,
  },
});
