import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  cartao: {
    marginBottom: espacos.sm,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  // flex: 1 faz o nome comprido quebrar a linha em vez de empurrar a lixeira para fora.
  descricao: {
    flex: 1,
    paddingTop: espacos.xs,
  },
  nome: {
    ...fontes.corpo,
    fontWeight: '600',
  },
  unitario: {
    ...fontes.legenda,
    marginTop: espacos.xs,
  },
  // 48 de lado para o dedo acertar; a margem negativa alinha o ícone com a borda do cartão.
  remover: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    marginTop: -espacos.sm,
    marginRight: -espacos.sm,
  },
  removerPressionado: {
    backgroundColor: cores.erroClaro,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
    marginTop: espacos.sm,
  },
  subtotal: {
    alignItems: 'flex-end',
  },
  rotuloSubtotal: {
    ...fontes.legenda,
  },
  valorSubtotal: {
    ...fontes.corpo,
    fontWeight: '700',
  },
});
