import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

// Num navegador largo o conteúdo fica numa coluna no meio, em vez de esticar de ponta a ponta.
const LARGURA_MAXIMA = 720;

const coluna = {
  width: '100%',
  maxWidth: LARGURA_MAXIMA,
  alignSelf: 'center',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  topo: {
    ...coluna,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
  },
  aviso: {
    marginBottom: espacos.md,
  },
  seletor: {
    marginBottom: espacos.sm,
  },
  contador: {
    ...fontes.legenda,
  },
  lista: {
    flex: 1,
  },
  conteudoDaLista: {
    ...coluna,
    padding: espacos.md,
    paddingBottom: espacos.xl,
  },
  separador: {
    height: espacos.md,
  },
});
