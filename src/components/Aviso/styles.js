import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export const aparencia = {
  erro: { icone: 'alert-circle-outline', cor: cores.erro },
  info: { icone: 'information-outline', cor: cores.textoSuave },
  sucesso: { icone: 'check-circle-outline', cor: cores.sucesso },
};

export default StyleSheet.create({
  aviso: {
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    marginBottom: espacos.md,
  },
  erro: {
    backgroundColor: cores.erroClaro,
    borderColor: cores.erro,
  },
  info: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
  },
  sucesso: {
    backgroundColor: cores.sucessoClaro,
    borderColor: cores.sucesso,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  mensagem: {
    ...fontes.corpo,
    flex: 1,
  },
  acao: {
    alignItems: 'flex-start',
    marginTop: espacos.xs,
  },
});
