import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios, sombra } from '../../theme';

export default StyleSheet.create({
  // A faixa ocupa a largura da tela; a barra dentro dela para em 720 e fica no meio.
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
    maxWidth: 720,
    alignSelf: 'center',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.md,
    paddingVertical: espacos.sm,
    borderRadius: raios.md,
    backgroundColor: cores.primaria,
  },
  pressionada: {
    backgroundColor: cores.primariaEscura,
  },
  resumo: {
    ...fontes.corpo,
    flex: 1,
    fontWeight: '600',
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
