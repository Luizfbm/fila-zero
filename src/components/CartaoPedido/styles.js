import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

export default StyleSheet.create({
  pressionado: {
    opacity: 0.85,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  identificacao: {
    flex: 1,
  },
  numero: {
    ...fontes.subtitulo,
  },
  data: {
    ...fontes.legenda,
    marginTop: espacos.xs,
  },
  retirada: {
    ...fontes.corpo,
    marginTop: espacos.md,
  },
  resumo: {
    ...fontes.corpo,
    color: cores.textoSuave,
    marginTop: espacos.xs,
  },
  detalhe: {
    marginTop: espacos.md,
    paddingTop: espacos.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: espacos.sm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.md,
  },
  itemNome: {
    ...fontes.corpo,
    flex: 1,
  },
  itemSubtotal: {
    ...fontes.corpo,
  },
  observacao: {
    marginTop: espacos.sm,
  },
  observacaoTitulo: {
    ...fontes.legenda,
    fontWeight: '600',
  },
  observacaoTexto: {
    ...fontes.corpo,
    marginTop: espacos.xs,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacos.md,
    paddingTop: espacos.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: espacos.sm,
  },
  totalRotulo: {
    ...fontes.legenda,
  },
  totalValor: {
    ...fontes.subtitulo,
  },
});
