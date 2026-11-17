import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios, sombra } from '../../theme';

export default StyleSheet.create({
  indicador: {
    ...sombra,
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    // Dois indicadores lado a lado ficam da mesma altura mesmo quando um valor quebra em duas linhas.
    minHeight: espacos.xl * 3,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  rotulo: {
    ...fontes.legenda,
    flex: 1,
  },
  valor: {
    ...fontes.titulo,
    fontSize: fontes.subtitulo.fontSize + espacos.xs,
    lineHeight: espacos.lg + espacos.xs,
  },
});
