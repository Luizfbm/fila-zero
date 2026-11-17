import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export const TAMANHO_ICONE = 18;

const ALTURA_BARRA = 8;
// Largura mínima igual em todas as linhas, para os valores ficarem alinhados. Cabe "100%".
const LARGURA_PERCENTUAL = 40;

export default StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
    paddingVertical: espacos.sm,
  },
  // Nome e trilho na mesma coluna, os dois começando depois do ícone.
  coluna: {
    flex: 1,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  nome: {
    ...fontes.corpo,
    flex: 1,
  },
  valor: {
    ...fontes.corpo,
    fontWeight: '600',
  },
  percentual: {
    ...fontes.legenda,
    minWidth: LARGURA_PERCENTUAL,
    textAlign: 'right',
  },
  trilho: {
    height: ALTURA_BARRA,
    borderRadius: raios.pilula,
    backgroundColor: cores.borda,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: raios.pilula,
    backgroundColor: cores.primaria,
  },
});
