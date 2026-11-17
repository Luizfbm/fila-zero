import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

export default StyleSheet.create({
  pressionado: {
    opacity: 0.85,
  },
  // Pronto é o status que faz a pessoa ir ao balcão, então o cartão se destaca dos outros.
  pronto: {
    borderColor: cores.sucesso,
  },
  apagado: {
    color: cores.textoSuave,
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
  retirada: {
    ...fontes.subtitulo,
    marginBottom: espacos.xs,
  },
  legenda: {
    ...fontes.legenda,
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
  linhaDoTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    marginTop: espacos.md,
  },
  resumo: {
    ...fontes.corpo,
    color: cores.textoSuave,
    flex: 1,
  },
  totalRotulo: {
    ...fontes.legenda,
    flex: 1,
  },
  totalValor: {
    ...fontes.corpo,
    fontWeight: '600',
  },
});
