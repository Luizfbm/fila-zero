import { validarCadastro } from '../../src/utils/validacoes';

const validos = {
  nome: 'Marina Souza',
  email: 'marina.souza@aluno.edu.br',
  matricula: '20261234',
  curso: 'Sistemas de Informação',
  cep: '29100-000',
  logradouro: 'Rua das Palmeiras',
  bairro: 'Centro',
  cidade: 'Vila Velha',
  uf: 'ES',
  senha: 'cantina26',
  confirmarSenha: 'cantina26',
};

function erros(alteracoes) {
  return validarCadastro({ ...validos, ...alteracoes });
}

describe('validarCadastro', () => {
  it('devolve objeto vazio quando está tudo certo', () => {
    expect(validarCadastro(validos)).toEqual({});
  });

  it('não quebra com formulário vazio e aponta os campos obrigatórios', () => {
    expect(Object.keys(validarCadastro({})).sort()).toEqual(
      ['cep', 'cidade', 'curso', 'email', 'matricula', 'nome', 'senha', 'uf'].sort()
    );
    expect(Object.keys(validarCadastro()).length).toBe(8);
  });

  it('não exige logradouro nem bairro', () => {
    expect(erros({ logradouro: '', bairro: '' })).toEqual({});
  });

  describe('nome', () => {
    it('pede nome e sobrenome', () => {
      expect(erros({ nome: '' }).nome).toBe('Informe nome e sobrenome');
      expect(erros({ nome: 'Marina' }).nome).toBe('Informe nome e sobrenome');
      expect(erros({ nome: '  Marina   ' }).nome).toBe('Informe nome e sobrenome');
    });

    it('aceita nome composto e espaços sobrando', () => {
      expect(erros({ nome: '  Ana Clara de Sá ' }).nome).toBeUndefined();
    });
  });

  describe('e-mail', () => {
    it('pede o e-mail quando está vazio', () => {
      expect(erros({ email: '' }).email).toBe('Informe seu e-mail');
    });

    it('recusa formato errado', () => {
      ['marina', 'marina@', 'marina@aluno', '@aluno.edu.br', 'ma rina@aluno.edu.br'].forEach(
        (email) => {
          expect(erros({ email }).email).toBe('Confira o e-mail, ele precisa ser no formato nome@exemplo.com');
        }
      );
    });

    it('ignora espaço no começo e no fim', () => {
      expect(erros({ email: ' marina@aluno.edu.br ' }).email).toBeUndefined();
    });
  });

  describe('matrícula', () => {
    it('pede a matrícula quando está vazia', () => {
      expect(erros({ matricula: '' }).matricula).toBe('Informe sua matrícula');
    });

    it('aceita só números', () => {
      expect(erros({ matricula: '2026-1234' }).matricula).toBe('Digite só os números da matrícula');
      expect(erros({ matricula: 'A2026123' }).matricula).toBe('Digite só os números da matrícula');
    });

    it('exige de 6 a 10 dígitos', () => {
      expect(erros({ matricula: '12345' }).matricula).toBe('A matrícula precisa ter de 6 a 10 números');
      expect(erros({ matricula: '12345678901' }).matricula).toBe(
        'A matrícula precisa ter de 6 a 10 números'
      );
      expect(erros({ matricula: '123456' }).matricula).toBeUndefined();
      expect(erros({ matricula: '1234567890' }).matricula).toBeUndefined();
    });
  });

  it('pede o curso', () => {
    expect(erros({ curso: '' }).curso).toBe('Escolha seu curso');
    expect(erros({ curso: undefined }).curso).toBe('Escolha seu curso');
  });

  describe('CEP', () => {
    it('pede o CEP quando está vazio', () => {
      expect(erros({ cep: '' }).cep).toBe('Informe o CEP');
    });

    it('exige 8 dígitos, com ou sem máscara', () => {
      expect(erros({ cep: '29100-00' }).cep).toBe('O CEP precisa ter 8 números');
      expect(erros({ cep: '291000001' }).cep).toBe('O CEP precisa ter 8 números');
      expect(erros({ cep: '29100000' }).cep).toBeUndefined();
      expect(erros({ cep: '29.100-000' }).cep).toBeUndefined();
    });
  });

  it('pede cidade e UF', () => {
    expect(erros({ cidade: '  ' }).cidade).toBe('Informe a cidade');
    expect(erros({ uf: '' }).uf).toBe('Informe a UF');
  });

  it('não termina mensagem de uma frase só com ponto', () => {
    const todas = [
      ...Object.values(validarCadastro({})),
      ...Object.values(erros({ email: 'x', matricula: 'a', cep: '1', senha: 'abcdefg' })),
      ...Object.values(erros({ matricula: '1', senha: 'a1', confirmarSenha: 'b' })),
      ...Object.values(erros({ confirmarSenha: '' })),
    ];
    todas.forEach((mensagem) => {
      expect(mensagem.endsWith('.')).toBe(false);
    });
  });

  describe('senha', () => {
    it('pede a senha quando está vazia', () => {
      expect(erros({ senha: '', confirmarSenha: '' }).senha).toBe('Crie uma senha');
    });

    it('exige 6 caracteres ou mais', () => {
      expect(erros({ senha: 'ab12', confirmarSenha: 'ab12' }).senha).toBe(
        'A senha precisa ter pelo menos 6 caracteres'
      );
    });

    it('exige letra e número', () => {
      expect(erros({ senha: 'cantina', confirmarSenha: 'cantina' }).senha).toBe(
        'A senha precisa ter pelo menos uma letra e um número'
      );
      expect(erros({ senha: '12345678', confirmarSenha: '12345678' }).senha).toBe(
        'A senha precisa ter pelo menos uma letra e um número'
      );
    });

    it('cobra a confirmação igual à senha', () => {
      expect(erros({ confirmarSenha: 'cantina27' }).confirmarSenha).toBe(
        'As senhas não são iguais'
      );
      expect(erros({ confirmarSenha: '' }).confirmarSenha).toBe('Repita a senha');
    });

    it('não reclama da confirmação enquanto a senha está vazia', () => {
      expect(erros({ senha: '', confirmarSenha: '' }).confirmarSenha).toBeUndefined();
    });
  });
});
