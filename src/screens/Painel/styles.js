import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  rolagem: {
    paddingBottom: espacos.xl,
  },
  centro: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Em tela larga (web) o resumo fica numa coluna de até 720 px no meio.
  conteudo: {
    width: '100%',
    maxWidth: espacos.lg * 30,
    alignSelf: 'center',
    padding: espacos.md,
  },
  aviso: {
    marginBottom: espacos.md,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  // Duas colunas: cada célula parte de pouco menos da metade e cresce até encostar no vão.
  celula: {
    flexBasis: '45%',
    flexGrow: 1,
  },
  secao: {
    marginTop: espacos.lg,
  },
  tituloSecao: {
    ...fontes.subtitulo,
    marginBottom: espacos.sm,
  },
  semPeriodo: {
    alignItems: 'center',
    paddingVertical: espacos.lg,
  },
  semPeriodoTitulo: {
    ...fontes.corpo,
    fontWeight: '600',
    textAlign: 'center',
  },
  semPeriodoTexto: {
    ...fontes.legenda,
    textAlign: 'center',
    marginTop: espacos.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    paddingVertical: espacos.sm,
  },
  itemComDivisor: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  posicao: {
    ...fontes.legenda,
    fontWeight: '700',
    color: cores.primariaEscura,
    backgroundColor: cores.primariaClara,
    width: espacos.lg,
    height: espacos.lg,
    lineHeight: espacos.lg,
    borderRadius: raios.pilula,
    textAlign: 'center',
    overflow: 'hidden',
  },
  itemNome: {
    ...fontes.corpo,
    flex: 1,
  },
  itemQuantidade: {
    ...fontes.legenda,
  },
  itemValor: {
    ...fontes.corpo,
    fontWeight: '600',
    minWidth: espacos.xl * 2 + espacos.sm,
    textAlign: 'right',
  },
});
