import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  cartao: {
    gap: espacos.sm,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
  },
  // O esgotado continua legível, só perde força perto dos outros.
  esmaecido: {
    opacity: 0.55,
  },
  icone: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.pilula,
    backgroundColor: cores.primariaClara,
  },
  textos: {
    flex: 1,
    gap: espacos.xs,
  },
  nome: {
    ...fontes.subtitulo,
  },
  descricao: {
    ...fontes.legenda,
    fontSize: 14,
    lineHeight: 20,
  },
  // Preço de um lado e ação do outro, numa linha só: no celular estreito
  // o nome e a descrição ficam com a largura toda do cartão.
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.md,
    minHeight: 48,
  },
  preco: {
    ...fontes.subtitulo,
    color: cores.primariaEscura,
  },
  adicionar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.superficie,
  },
  adicionarPressionado: {
    backgroundColor: cores.primariaClara,
  },
  adicionarTexto: {
    ...fontes.corpo,
    fontSize: 15,
    fontWeight: '600',
    color: cores.primariaEscura,
  },
});
