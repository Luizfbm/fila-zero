import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  linha: {
    paddingVertical: espacos.sm,
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
    // Largura fixa para os valores ficarem alinhados de uma linha para a outra.
    width: espacos.xl + espacos.sm,
    textAlign: 'right',
  },
  trilho: {
    height: espacos.sm,
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
