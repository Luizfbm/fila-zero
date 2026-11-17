import { somenteDigitos } from './formatar';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor) {
  return valor === undefined || valor === null ? '' : String(valor).trim();
}

function validarNome(nome) {
  return nome.split(/\s+/).filter(Boolean).length < 2 ? 'Informe nome e sobrenome' : null;
}

function validarEmail(email) {
  if (!email) {
    return 'Informe seu e-mail';
  }
  return FORMATO_EMAIL.test(email) ? null : 'Esse e-mail não parece válido';
}

function validarMatricula(matricula) {
  if (!matricula) {
    return 'Informe sua matrícula';
  }
  if (!/^\d+$/.test(matricula)) {
    return 'A matrícula só tem números';
  }
  return matricula.length < 6 || matricula.length > 10 ? 'A matrícula tem de 6 a 10 dígitos' : null;
}

function validarCep(cep) {
  if (!cep) {
    return 'Informe o CEP';
  }
  return somenteDigitos(cep).length === 8 ? null : 'O CEP tem 8 dígitos';
}

function validarSenha(senha) {
  if (!senha) {
    return 'Crie uma senha';
  }
  if (senha.length < 6) {
    return 'A senha precisa ter pelo menos 6 caracteres';
  }
  return /[a-zA-ZÀ-ÿ]/.test(senha) && /\d/.test(senha) ? null : 'A senha precisa ter letra e número';
}

function validarConfirmacao(senha, confirmarSenha) {
  if (!senha) {
    return null;
  }
  if (!confirmarSenha) {
    return 'Repita a senha';
  }
  return confirmarSenha === senha ? null : 'As senhas não são iguais';
}

export function validarCadastro(valores = {}) {
  const campos = valores || {};
  // Senha não passa por trim: espaço também é caractere dela.
  const senha = campos.senha ? String(campos.senha) : '';
  const confirmarSenha = campos.confirmarSenha ? String(campos.confirmarSenha) : '';

  const resultado = {
    nome: validarNome(texto(campos.nome)),
    email: validarEmail(texto(campos.email)),
    matricula: validarMatricula(texto(campos.matricula)),
    curso: texto(campos.curso) ? null : 'Escolha seu curso',
    cep: validarCep(texto(campos.cep)),
    cidade: texto(campos.cidade) ? null : 'Informe a cidade',
    uf: texto(campos.uf) ? null : 'Informe a UF',
    senha: validarSenha(senha),
    confirmarSenha: validarConfirmacao(senha, confirmarSenha),
  };

  const erros = {};
  Object.keys(resultado).forEach((campo) => {
    if (resultado[campo]) {
      erros[campo] = resultado[campo];
    }
  });

  return erros;
}
