import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

// Em tela larga (web) o resumo fica numa coluna no meio.
const LARGURA_MAXIMA = 720;
const TAMANHO_POSICAO = 24;
// Cabe "R$ 1.234,56" sem empurrar o nome do item.
const LARGURA_VALOR = 88;

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
  conteudo: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
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
    width: TAMANHO_POSICAO,
    height: TAMANHO_POSICAO,
    lineHeight: TAMANHO_POSICAO,
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
    minWidth: LARGURA_VALOR,
    textAlign: 'right',
  },
});
