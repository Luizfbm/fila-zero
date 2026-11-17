import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFormik } from 'formik';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Aviso from '../../components/Aviso';
import Botao from '../../components/Botao';
import CampoSenha from '../../components/CampoSenha';
import CampoTexto from '../../components/CampoTexto';
import Cartao from '../../components/Cartao';
import Seletor from '../../components/Seletor';
import { useUsuario } from '../../contexts/UsuarioContext';
import cursos from '../../data/cursos.json';
import { buscarCep } from '../../services/cep';
import { cadastrarUsuario } from '../../services/usuarios';
import { cores } from '../../theme';
import { mascararCep, somenteDigitos } from '../../utils/formatar';
import { validarCadastro } from '../../utils/validacoes';
import styles from './styles';

const VALORES_INICIAIS = {
  nome: '',
  email: '',
  matricula: '',
  curso: '',
  cep: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  uf: '',
  senha: '',
  confirmarSenha: '',
};

// O curso é guardado pelo nome, que é o que as outras telas mostram.
const OPCOES_DE_CURSO = [
  { rotulo: 'Escolha seu curso', valor: '' },
  ...cursos.map((curso) => ({ rotulo: curso.nome, valor: curso.nome })),
];

const FALHA_NO_ENVIO = 'Não deu para criar sua conta agora. Tente de novo daqui a pouco.';

function Secao({ titulo, dica, children }) {
  return (
    <Cartao style={styles.secao}>
      <Text style={styles.tituloDaSecao} accessibilityRole="header">
        {titulo}
      </Text>
      {dica ? <Text style={styles.dicaDaSecao}>{dica}</Text> : null}
      <View style={styles.campos}>{children}</View>
    </Cartao>
  );
}

export default function Cadastro() {
  const { entrar } = useUsuario();
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroDoCep, setErroDoCep] = useState('');
  const [erroDoEnvio, setErroDoEnvio] = useState('');
  // Guardo a ScrollView no estado para conseguir voltar ao topo quando o envio tem erro.
  const [rolagem, setRolagem] = useState(null);

  const formik = useFormik({
    initialValues: VALORES_INICIAIS,
    validate: validarCadastro,
    onSubmit: async (valores) => {
      setErroDoEnvio('');
      try {
        const resposta = await cadastrarUsuario({
          ...valores,
          nome: valores.nome.trim(),
          email: valores.email.trim(),
        });
        entrar(resposta.dados);
      } catch (erro) {
        setErroDoEnvio(FALHA_NO_ENVIO);
      }
    },
  });

  const digitosDoCep = somenteDigitos(formik.values.cep);

  // Roda a cada mudança nos dígitos, então cada CEP completo é consultado uma vez só.
  useEffect(() => {
    setErroDoCep('');

    if (digitosDoCep.length !== 8) {
      setBuscandoCep(false);
      return undefined;
    }

    // Se a pessoa mudar o CEP antes de a resposta chegar, a resposta antiga é ignorada.
    let valendo = true;

    async function consultar() {
      setBuscandoCep(true);
      try {
        const endereco = await buscarCep(digitosDoCep);
        if (!valendo) return;
        formik.setFieldValue('logradouro', endereco.logradouro);
        formik.setFieldValue('bairro', endereco.bairro);
        formik.setFieldValue('cidade', endereco.cidade);
        formik.setFieldValue('uf', endereco.uf);
      } catch (erro) {
        if (valendo) setErroDoCep(erro.message);
      }
      if (valendo) setBuscandoCep(false);
    }

    consultar();

    return () => {
      valendo = false;
    };
  }, [digitosDoCep]);

  const tentouEnviar = formik.submitCount > 0;
  const camposComErro = Object.keys(formik.errors).length;

  function erroDe(campo) {
    return formik.touched[campo] || tentouEnviar ? formik.errors[campo] : undefined;
  }

  function aoEscolherCurso(curso) {
    formik.setFieldValue('curso', curso);
    formik.setFieldTouched('curso', true, false);
  }

  function aoDigitarUf(texto) {
    formik.setFieldValue('uf', texto.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase());
  }

  function aoEnviar() {
    const temErro = Object.keys(validarCadastro(formik.values)).length > 0;
    if (temErro && rolagem && rolagem.scrollTo) {
      rolagem.scrollTo({ y: 0, animated: true });
    }
    formik.handleSubmit();
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={setRolagem}
        style={styles.tela}
        contentContainerStyle={styles.rolagem}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
          <View style={styles.abertura}>
            <View style={styles.marca}>
              <View style={styles.selo}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={22}
                  color={cores.textoSobrePrimaria}
                />
              </View>
              <Text style={styles.nomeDoApp} accessibilityRole="header">
                Fila Zero
              </Text>
            </View>
            <Text style={styles.frase}>
              Peça na cantina pelo celular e retire no balcão sem pegar fila.
            </Text>
          </View>

          {tentouEnviar && camposComErro > 0 ? (
            <Aviso
              tipo="erro"
              style={styles.aviso}
              mensagem={
                camposComErro === 1
                  ? 'Falta 1 campo para corrigir.'
                  : `Faltam ${camposComErro} campos para corrigir.`
              }
            />
          ) : null}

          <Secao titulo="Seus dados">
            <CampoTexto
              rotulo="Nome completo"
              value={formik.values.nome}
              onChangeText={formik.handleChange('nome')}
              onBlur={() => formik.setFieldTouched('nome')}
              erro={erroDe('nome')}
              autoCapitalize="words"
              autoComplete="name"
            />
            <CampoTexto
              rotulo="E-mail"
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              onBlur={() => formik.setFieldTouched('email')}
              erro={erroDe('email')}
              placeholder="nome@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            <CampoTexto
              rotulo="Matrícula"
              value={formik.values.matricula}
              onChangeText={formik.handleChange('matricula')}
              onBlur={() => formik.setFieldTouched('matricula')}
              erro={erroDe('matricula')}
              keyboardType="numeric"
              maxLength={10}
            />
            <Seletor
              rotulo="Curso"
              valor={formik.values.curso}
              aoMudar={aoEscolherCurso}
              opcoes={OPCOES_DE_CURSO}
              erro={erroDe('curso')}
              style={styles.ultimoCampo}
            />
          </Secao>

          <Secao titulo="Endereço" dica="Digite o CEP que o resto a gente preenche.">
            <View style={styles.grupoDoCep}>
              <CampoTexto
                rotulo="CEP"
                value={formik.values.cep}
                onChangeText={(texto) => formik.setFieldValue('cep', mascararCep(texto))}
                onBlur={() => formik.setFieldTouched('cep')}
                erro={erroDe('cep') || erroDoCep}
                placeholder="00000-000"
                keyboardType="numeric"
                maxLength={9}
                autoComplete="postal-code"
                style={styles.ultimoCampo}
              />
              {buscandoCep ? (
                <View style={styles.buscando}>
                  <ActivityIndicator size="small" color={cores.primaria} />
                  <Text style={styles.textoBuscando} accessibilityLiveRegion="polite">
                    Buscando endereço
                  </Text>
                </View>
              ) : null}
            </View>
            <CampoTexto
              rotulo="Logradouro"
              value={formik.values.logradouro}
              onChangeText={formik.handleChange('logradouro')}
              onBlur={() => formik.setFieldTouched('logradouro')}
              erro={erroDe('logradouro')}
              autoCapitalize="words"
            />
            <CampoTexto
              rotulo="Bairro"
              value={formik.values.bairro}
              onChangeText={formik.handleChange('bairro')}
              onBlur={() => formik.setFieldTouched('bairro')}
              erro={erroDe('bairro')}
              autoCapitalize="words"
            />
            <View style={styles.linha}>
              <CampoTexto
                rotulo="Cidade"
                value={formik.values.cidade}
                onChangeText={formik.handleChange('cidade')}
                onBlur={() => formik.setFieldTouched('cidade')}
                erro={erroDe('cidade')}
                autoCapitalize="words"
                style={[styles.cidade, styles.ultimoCampo]}
              />
              <CampoTexto
                rotulo="UF"
                value={formik.values.uf}
                onChangeText={aoDigitarUf}
                onBlur={() => formik.setFieldTouched('uf')}
                erro={erroDe('uf')}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={2}
                style={[styles.uf, styles.ultimoCampo]}
              />
            </View>
          </Secao>

          <Secao titulo="Senha" dica="Pelo menos 6 caracteres, com letra e número.">
            <CampoSenha
              rotulo="Senha"
              value={formik.values.senha}
              onChangeText={formik.handleChange('senha')}
              onBlur={() => formik.setFieldTouched('senha')}
              erro={erroDe('senha')}
              autoComplete="new-password"
            />
            <CampoSenha
              rotulo="Confirmar senha"
              value={formik.values.confirmarSenha}
              onChangeText={formik.handleChange('confirmarSenha')}
              onBlur={() => formik.setFieldTouched('confirmarSenha')}
              erro={erroDe('confirmarSenha')}
              autoComplete="new-password"
              onSubmitEditing={aoEnviar}
              style={styles.ultimoCampo}
            />
          </Secao>

          {erroDoEnvio ? <Aviso tipo="erro" mensagem={erroDoEnvio} style={styles.aviso} /> : null}

          <Botao titulo="Criar conta" onPress={aoEnviar} carregando={formik.isSubmitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
