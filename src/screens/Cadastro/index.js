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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Aviso from '../../components/Aviso';
import Botao from '../../components/Botao';
import CampoSenha from '../../components/CampoSenha';
import CampoTexto from '../../components/CampoTexto';
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
  { rotulo: 'Selecione', valor: '' },
  ...cursos.map((curso) => ({ rotulo: curso.nome, valor: curso.nome })),
];

const FALHA_NO_ENVIO = 'Não deu para criar sua conta agora. Tente de novo daqui a pouco.';

const DICA_DO_CEP = 'Com o CEP, a gente preenche rua, bairro, cidade e UF.';

// Altura padrão do cabeçalho do React Navigation, que fica acima desta tela.
const ALTURA_DO_CABECALHO = Platform.OS === 'ios' ? 44 : 64;

function Secao({ titulo, dica, primeira = false, children }) {
  return (
    <View style={[styles.secao, primeira ? null : styles.secaoComDivisor]}>
      <Text style={styles.tituloDaSecao} accessibilityRole="header">
        {titulo}
      </Text>
      {dica ? <Text style={styles.dicaDaSecao}>{dica}</Text> : null}
      <View style={styles.campos}>{children}</View>
    </View>
  );
}

export default function Cadastro() {
  const { entrar } = useUsuario();
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroDoCep, setErroDoCep] = useState('');
  // Dígitos do CEP que o ViaCEP disse que não existe. Enquanto o campo tiver esse CEP, não envio.
  const [cepInexistente, setCepInexistente] = useState('');
  const [erroDoEnvio, setErroDoEnvio] = useState('');
  const margens = useSafeAreaInsets();

  function validar(valores) {
    const erros = validarCadastro(valores);
    if (cepInexistente && somenteDigitos(valores.cep) === cepInexistente) {
      erros.cep = erroDoCep;
    }
    return erros;
  }

  const formik = useFormik({
    initialValues: VALORES_INICIAIS,
    validate: validar,
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
        // CEP de cidade pequena vem sem rua e sem bairro. Só preencho o que veio,
        // para não apagar o que a pessoa já digitou.
        const preenchidos = {};
        ['logradouro', 'bairro', 'cidade', 'uf'].forEach((campo) => {
          if (endereco[campo]) preenchidos[campo] = endereco[campo];
        });
        // Tudo de uma vez: com um setFieldValue por campo, cada validação enxergava
        // só o próprio campo e o erro da cidade continuava na tela.
        formik.setValues((atuais) => ({ ...atuais, ...preenchidos }));
      } catch (erro) {
        if (valendo) {
          setErroDoCep(erro.message);
          // O serviço só entrega a mensagem, então é por ela que separo CEP que não existe de falha de rede.
          if (/não encontrado/i.test(erro.message)) setCepInexistente(digitosDoCep);
        }
      }
      if (valendo) setBuscandoCep(false);
    }

    consultar();

    return () => {
      valendo = false;
    };
  }, [digitosDoCep]);

  // Revalido quando descubro que o CEP não existe, para ele entrar na conta dos campos com erro.
  useEffect(() => {
    if (cepInexistente) formik.validateForm();
  }, [cepInexistente]);

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

  // O Enter do último campo passa por aqui, então seguro o segundo envio enquanto o primeiro não volta.
  function aoEnviar() {
    if (formik.isSubmitting) return;
    formik.handleSubmit();
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior="padding"
      keyboardVerticalOffset={margens.top + ALTURA_DO_CABECALHO}
    >
      <ScrollView
        style={styles.tela}
        contentContainerStyle={styles.rolagem}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
          <View style={styles.abertura}>
            <Text style={styles.nomeDoApp} accessibilityRole="header">
              Fila Zero
            </Text>
            <Text style={styles.frase}>
              Peça na cantina pelo celular e retire no balcão sem pegar fila.
            </Text>
          </View>

          <Secao titulo="Seus dados" primeira>
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

          <Secao titulo="Endereço">
            <View style={styles.grupoDoCep}>
              <CampoTexto
                rotulo="CEP"
                value={formik.values.cep}
                onChangeText={(texto) => formik.setFieldValue('cep', mascararCep(texto))}
                onBlur={() => formik.setFieldTouched('cep')}
                erro={erroDe('cep') || erroDoCep}
                placeholder="00000-000"
                keyboardType="numeric"
                autoComplete="postal-code"
                style={styles.ultimoCampo}
              />
              {/* A dica e o aviso de busca dividem a mesma linha, então nada sai do lugar. */}
              <View style={styles.dicaDoCep}>
                {buscandoCep ? <ActivityIndicator size="small" color={cores.primaria} /> : null}
                <Text style={styles.textoDaDica} accessibilityLiveRegion="polite">
                  {buscandoCep ? 'Buscando endereço' : DICA_DO_CEP}
                </Text>
              </View>
            </View>
            <CampoTexto
              rotulo="Rua (opcional)"
              value={formik.values.logradouro}
              onChangeText={formik.handleChange('logradouro')}
              onBlur={() => formik.setFieldTouched('logradouro')}
              erro={erroDe('logradouro')}
              autoCapitalize="words"
            />
            <CampoTexto
              rotulo="Bairro (opcional)"
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

          <Secao titulo="Acesso" dica="Use pelo menos 6 caracteres, com letras e números.">
            <CampoSenha
              rotulo="Senha"
              value={formik.values.senha}
              onChangeText={formik.handleChange('senha')}
              onBlur={() => formik.setFieldTouched('senha')}
              erro={erroDe('senha')}
              autoComplete="new-password"
            />
            <CampoSenha
              rotulo="Repita a senha"
              value={formik.values.confirmarSenha}
              onChangeText={formik.handleChange('confirmarSenha')}
              onBlur={() => formik.setFieldTouched('confirmarSenha')}
              erro={erroDe('confirmarSenha')}
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={aoEnviar}
              style={styles.ultimoCampo}
            />
          </Secao>

          {tentouEnviar && camposComErro > 0 ? (
            <Aviso
              tipo="erro"
              style={styles.aviso}
              mensagem={
                camposComErro === 1
                  ? 'Corrija o campo marcado em vermelho.'
                  : `Corrija os ${camposComErro} campos marcados em vermelho.`
              }
            />
          ) : null}
          {erroDoEnvio ? <Aviso tipo="erro" mensagem={erroDoEnvio} style={styles.aviso} /> : null}

          <Botao titulo="Criar conta" onPress={aoEnviar} carregando={formik.isSubmitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
