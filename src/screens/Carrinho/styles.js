import { StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../../theme';

// Num navegador largo o conteúdo fica numa coluna no meio, em vez de esticar até as bordas.
const LARGURA_MAXIMA = 720;

const coluna = {
  width: '100%',
  maxWidth: LARGURA_MAXIMA,
  alignSelf: 'center',
};

export default StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  lista: {
    ...coluna,
    padding: espacos.md,
    paddingBottom: espacos.xl,
  },
  centro: {
    ...coluna,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.md,
  },
  rodape: {
    marginTop: espacos.md,
  },
  secao: {
    ...fontes.subtitulo,
    marginBottom: espacos.sm,
  },
  // O contador fica colado no campo, então a margem de baixo passa para ele.
  observacao: {
    marginBottom: espacos.xs,
  },
  contador: {
    ...fontes.legenda,
    textAlign: 'right',
    marginBottom: espacos.md,
  },
  resumo: {
    marginBottom: espacos.md,
  },
  linhaDoResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  linhaDoTotal: {
    marginTop: espacos.sm,
    paddingTop: espacos.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  resumoRotulo: {
    ...fontes.corpo,
    color: cores.textoSuave,
  },
  resumoValor: {
    ...fontes.corpo,
  },
  totalRotulo: {
    ...fontes.subtitulo,
  },
  totalValor: {
    ...fontes.titulo,
    color: cores.primariaEscura,
  },
  aviso: {
    marginBottom: espacos.md,
  },
  confirmacaoTitulo: {
    ...fontes.titulo,
    textAlign: 'center',
    marginTop: espacos.md,
  },
  confirmacaoTexto: {
    ...fontes.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: espacos.sm,
  },
  // Os dois botões com a mesma largura, um embaixo do outro.
  confirmacaoAcoes: {
    width: '100%',
    maxWidth: espacos.xl * 10,
    gap: espacos.sm,
    marginTop: espacos.lg,
  },
});
