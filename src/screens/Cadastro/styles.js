import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

export default StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  rolagem: {
    alignItems: 'center',
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
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
  nomeDoApp: {
    ...fontes.titulo,
    color: cores.primariaEscura,
  },
  frase: {
    ...fontes.corpo,
    color: cores.textoSuave,
    marginTop: espacos.xs,
  },
  aviso: {
    marginBottom: espacos.md,
  },
  secao: {
    paddingBottom: espacos.lg,
  },
  secaoComDivisor: {
    paddingTop: espacos.lg,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
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
  // A seção já tem respiro embaixo, então o último campo dela não precisa de margem.
  ultimoCampo: {
    marginBottom: 0,
  },
  grupoDoCep: {
    marginBottom: espacos.md,
  },
  // Altura fixa: cabe o indicador de busca sem a linha crescer quando ele aparece.
  dicaDoCep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    minHeight: 20,
    marginTop: espacos.xs,
  },
  textoDaDica: {
    ...fontes.legenda,
    flex: 1,
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
