import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

const LADO_DO_ICONE = 48;

export default StyleSheet.create({
  cartao: {
    gap: espacos.sm,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
  },
  // No esgotado só o ícone e o preço perdem força; nome e descrição
  // ficam na cor suave para continuarem fáceis de ler.
  esmaecido: {
    opacity: 0.55,
  },
  textoEsgotado: {
    color: cores.textoSuave,
  },
  icone: {
    width: LADO_DO_ICONE,
    height: LADO_DO_ICONE,
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
  },
  // Preço de um lado e ação do outro, numa linha só: no celular estreito
  // o nome e a descrição ficam com a largura toda do cartão.
  // O recuo põe o preço na mesma margem do nome.
  rodape: {
    paddingLeft: LADO_DO_ICONE + espacos.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.md,
    minHeight: 48,
  },
  preco: {
    ...fontes.corpo,
    fontWeight: '700',
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
    fontWeight: '600',
    color: cores.primariaEscura,
  },
});
