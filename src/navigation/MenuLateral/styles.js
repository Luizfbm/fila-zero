import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

const TAMANHO_DO_AVATAR = 56;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.superficie,
  },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingTop: espacos.lg,
    paddingBottom: espacos.md,
    paddingHorizontal: espacos.md,
  },
  avatar: {
    width: TAMANHO_DO_AVATAR,
    height: TAMANHO_DO_AVATAR,
    borderRadius: raios.pilula,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacos.sm,
  },
  iniciais: {
    ...fontes.subtitulo,
    color: cores.primariaEscura,
  },
  nome: {
    ...fontes.subtitulo,
    color: cores.textoSobrePrimaria,
  },
  curso: {
    ...fontes.legenda,
    color: cores.textoSobrePrimaria,
  },
  lista: {
    paddingTop: espacos.sm,
    paddingBottom: espacos.sm,
    paddingStart: espacos.sm,
    paddingEnd: espacos.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacos.md - espacos.xs,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    marginBottom: espacos.xs,
  },
  itemAtivo: {
    backgroundColor: cores.primariaClara,
  },
  textoDoItem: {
    ...fontes.corpo,
    flex: 1,
    marginLeft: espacos.md,
  },
  textoDoItemAtivo: {
    color: cores.primariaEscura,
    fontWeight: '600',
  },
  contador: {
    minWidth: espacos.lg,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs / 2,
    borderRadius: raios.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
  },
  textoDoContador: {
    ...fontes.legenda,
    fontWeight: '700',
    color: cores.textoSobrePrimaria,
  },
  rodape: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
    paddingTop: espacos.sm,
    paddingBottom: espacos.sm,
    paddingHorizontal: espacos.sm,
  },
});
