import { StyleSheet } from 'react-native';
import { cores, espacos, fontes, raios } from '../../theme';

export const aparencia = {
  erro: { icone: 'alert-circle-outline', cor: cores.erro },
  info: { icone: 'information-outline', cor: cores.textoSuave },
  sucesso: { icone: 'check-circle-outline', cor: cores.sucesso },
};

export default StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
  },
  erro: {
    backgroundColor: cores.erroClaro,
    borderColor: cores.erro,
  },
  info: {
    backgroundColor: cores.alertaClaro,
    borderColor: cores.destaque,
  },
  sucesso: {
    backgroundColor: cores.sucessoClaro,
    borderColor: cores.sucesso,
  },
  conteudo: {
    flex: 1,
  },
  mensagem: {
    ...fontes.corpo,
  },
  // O Botao de texto tem um respiro lateral; puxo de volta para o título alinhar com a mensagem.
  acao: {
    alignItems: 'flex-start',
    marginTop: espacos.xs,
    marginLeft: -espacos.sm,
  },
});
