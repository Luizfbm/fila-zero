import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios, sombra } from '../../theme';

export default StyleSheet.create({
  // A faixa ocupa a largura da tela; a barra dentro dela para na largura que a tela mandar e fica no meio.
  faixa: {
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    backgroundColor: cores.fundo,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  barra: {
    ...sombra,
    width: '100%',
    alignSelf: 'center',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.md,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    borderRadius: raios.md,
    backgroundColor: cores.primaria,
  },
  pressionada: {
    backgroundColor: cores.primariaEscura,
  },
  resumo: {
    flexShrink: 1,
  },
  itens: {
    ...fontes.legenda,
    color: cores.textoSobrePrimaria,
  },
  total: {
    ...fontes.subtitulo,
    fontWeight: '700',
    color: cores.textoSobrePrimaria,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acaoTexto: {
    ...fontes.corpo,
    fontWeight: '700',
    color: cores.textoSobrePrimaria,
  },
});
