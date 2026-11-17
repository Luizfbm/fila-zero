import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

// No navegador largo o conteúdo para nessa largura e fica no meio da tela.
const LARGURA_MAXIMA = 720;

export default StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  coluna: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    padding: espacos.md,
  },
  lista: {
    flex: 1,
  },
  // A folga no fim deixa o último item respirar acima da barra do carrinho.
  conteudoDaLista: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
    paddingBottom: espacos.xl,
  },
  saudacao: {
    ...fontes.titulo,
  },
  chamada: {
    ...fontes.corpo,
    color: cores.textoSuave,
    marginTop: espacos.xs,
    marginBottom: espacos.md,
  },
  avisoLocal: {
    marginBottom: espacos.md,
    paddingVertical: espacos.sm,
  },
  // Busca em cima e categoria embaixo no celular; lado a lado quando couber.
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: espacos.md,
  },
  filtro: {
    flexGrow: 1,
    flexBasis: 260,
  },
  contador: {
    ...fontes.legenda,
    fontWeight: '600',
    marginBottom: espacos.sm,
  },
  separador: {
    height: espacos.sm,
  },
});
