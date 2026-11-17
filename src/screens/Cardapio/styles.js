import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

// No navegador largo o conteúdo para nessa largura e fica no meio da tela.
export const LARGURA_MAXIMA = 720;

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
    marginBottom: espacos.sm,
  },
  avisoLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    marginBottom: espacos.sm,
  },
  avisoLocalTexto: {
    ...fontes.legenda,
    flex: 1,
  },
  // Com essa base os dois campos só cabem lado a lado em tela de 480 para cima;
  // abaixo disso a categoria desce para a linha seguinte.
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: espacos.md,
    marginTop: espacos.sm,
  },
  filtro: {
    flexGrow: 1,
    flexBasis: 216,
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
