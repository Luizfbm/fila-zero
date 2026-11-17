import { Platform, StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export default StyleSheet.create({
  container: {
    marginBottom: espacos.md,
  },
  rotulo: {
    ...fontes.corpo,
    fontWeight: '600',
    marginBottom: espacos.xs,
  },
  // Mesma caixa do CampoTexto. A borda fica aqui, e não no TextInput,
  // para o botão do olho ficar do lado de dentro.
  caixa: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: raios.md,
    padding: 1,
  },
  // A borda engrossa 1 px no foco e o espaço interno some, então a caixa não muda de tamanho.
  caixaFocada: {
    borderWidth: 2,
    borderColor: cores.primaria,
    padding: 0,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  campo: {
    ...fontes.corpo,
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingLeft: espacos.md - 1,
    paddingRight: espacos.xs,
    paddingVertical: espacos.sm - 1,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  botao: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.sm,
  },
  erro: {
    ...fontes.legenda,
    color: cores.erro,
    marginTop: espacos.xs,
  },
});
