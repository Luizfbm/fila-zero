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
  rolagem: {
    flex: 1,
  },
  // O aviso fica preso logo acima da barra, para aparecer onde a pessoa acabou de tocar.
  faixaDoAviso: {
    ...coluna,
    paddingHorizontal: espacos.md,
    paddingBottom: espacos.sm,
  },
  // Irmã da lista: fica sempre no pé da tela enquanto os itens rolam por cima.
  barra: {
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  barraConteudo: {
    ...coluna,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
  },
  // flexShrink deixa o total ceder espaço ao botão numa tela estreita.
  barraTotal: {
    flexShrink: 1,
  },
  barraLegenda: {
    ...fontes.legenda,
    fontWeight: '600',
    color: cores.texto,
  },
  barraItens: {
    ...fontes.legenda,
    fontWeight: '400',
  },
  totalValor: {
    ...fontes.titulo,
    color: cores.primariaEscura,
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
  confirmacaoTotal: {
    ...fontes.subtitulo,
    textAlign: 'center',
    marginTop: espacos.md,
  },
  // Os dois botões com a mesma largura, um embaixo do outro.
  confirmacaoAcoes: {
    width: '100%',
    maxWidth: espacos.xl * 10,
    gap: espacos.sm,
    marginTop: espacos.lg,
  },
});
