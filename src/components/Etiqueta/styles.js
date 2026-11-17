import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

// O texto fica sempre em cores.texto: é o que dá contraste AA em cima dos quatro fundos.
export default StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
    borderRadius: raios.pilula,
  },
  neutro: {
    backgroundColor: cores.borda,
  },
  sucesso: {
    backgroundColor: cores.sucessoClaro,
  },
  alerta: {
    backgroundColor: cores.alertaClaro,
  },
  erro: {
    backgroundColor: cores.erroClaro,
  },
  texto: {
    ...fontes.legenda,
    color: cores.texto,
    fontWeight: '600',
  },
});
