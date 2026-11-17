import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios, sombra } from '../../theme';

export const TAMANHO_ICONE = 18;

// Dois indicadores lado a lado ficam da mesma altura mesmo quando um deles tem duas linhas.
const ALTURA_MINIMA = 96;

export default StyleSheet.create({
  indicador: {
    ...sombra,
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    minHeight: ALTURA_MINIMA,
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
    ...fontes.subtitulo,
  },
  valorEmTexto: {
    ...fontes.corpo,
    fontWeight: '600',
  },
  detalhe: {
    ...fontes.legenda,
    marginTop: espacos.xs,
  },
});
