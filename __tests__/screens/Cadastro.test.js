import React from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Cadastro from '../../src/screens/Cadastro';
import { buscarCep } from '../../src/services/cep';
import { cadastrarUsuario } from '../../src/services/usuarios';
import { useUsuario } from '../../src/contexts/UsuarioContext';

jest.mock('../../src/services/cep', () => ({ buscarCep: jest.fn() }));
jest.mock('../../src/services/usuarios', () => ({ cadastrarUsuario: jest.fn() }));
jest.mock('../../src/contexts/UsuarioContext', () => ({ useUsuario: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }),
}));

const ENDERECO = {
  logradouro: 'Rua Sete de Setembro',
  bairro: 'Centro',
  cidade: 'Vila Velha',
  uf: 'ES',
};

const CURSO = 'Sistemas de Informação';

let entrar;

// Promessa que o teste resolve quando quiser, para olhar a tela no meio da espera.
function promessaPendente() {
  let resolver;
  let rejeitar;
  const promessa = new Promise((resolve, reject) => {
    resolver = resolve;
    rejeitar = reject;
  });
  return { promessa, resolver, rejeitar };
}

function digitar(rotulo, texto) {
  fireEvent.changeText(screen.getByLabelText(rotulo), texto);
}

function enviar() {
  fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
}

async function preencherTudo() {
  digitar('Nome completo', 'Luiz Miranda');
  digitar('E-mail', 'luiz@faculdade.br');
  digitar('Matrícula', '20261234');
  fireEvent(screen.getByLabelText('Curso'), 'valueChange', CURSO, 1);
  digitar('CEP', '29100000');
  await waitFor(() => expect(screen.getByLabelText('Cidade').props.value).toBe('Vila Velha'));
  digitar('Senha', 'abc123');
  digitar('Repita a senha', 'abc123');
}

beforeEach(() => {
  entrar = jest.fn();
  useUsuario.mockReturnValue({ usuario: null, entrar, sair: jest.fn() });
  buscarCep.mockResolvedValue(ENDERECO);
  cadastrarUsuario.mockImplementation(async (dados) => ({
    dados: { id: '1', nome: dados.nome, email: dados.email },
    origem: 'local',
  }));
});

describe('Cadastro', () => {
  it('abre com o nome do app, o que ele faz e as seções do formulário', () => {
    render(<Cadastro />);

    expect(screen.getByText('Fila Zero')).toBeOnTheScreen();
    expect(
      screen.getByText('Peça na cantina pelo celular e retire no balcão sem pegar fila.')
    ).toBeOnTheScreen();
    expect(screen.getByText('Seus dados')).toBeOnTheScreen();
    expect(screen.getByText('Endereço')).toBeOnTheScreen();
    expect(screen.getByText('Acesso')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeOnTheScreen();
  });

  it('não mostra erro nenhum antes de a pessoa mexer no formulário', () => {
    render(<Cadastro />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('mostra os campos obrigatórios e quantos faltam ao enviar vazio', async () => {
    render(<Cadastro />);

    enviar();

    expect(await screen.findByText('Informe nome e sobrenome')).toBeOnTheScreen();
    expect(screen.getByText('Informe seu e-mail')).toBeOnTheScreen();
    expect(screen.getByText('Informe sua matrícula')).toBeOnTheScreen();
    expect(screen.getByText('Escolha seu curso')).toBeOnTheScreen();
    expect(screen.getByText('Informe o CEP')).toBeOnTheScreen();
    expect(screen.getByText('Informe a cidade')).toBeOnTheScreen();
    expect(screen.getByText('Informe a UF')).toBeOnTheScreen();
    expect(screen.getByText('Crie uma senha')).toBeOnTheScreen();
    expect(screen.getByText('Corrija os 8 campos marcados em vermelho.')).toBeOnTheScreen();
    expect(cadastrarUsuario).not.toHaveBeenCalled();
  });

  it('ao sair de um campo mostra só o erro dele', async () => {
    render(<Cadastro />);

    fireEvent(screen.getByLabelText('E-mail'), 'blur');

    expect(await screen.findByText('Informe seu e-mail')).toBeOnTheScreen();
    expect(screen.queryByText('Informe nome e sobrenome')).toBeNull();
    expect(screen.queryByText(/em vermelho/)).toBeNull();
  });

  it('o erro some quando a pessoa corrige o campo', async () => {
    render(<Cadastro />);
    enviar();
    await screen.findByText('Informe nome e sobrenome');

    // O formik valida fora do evento, então espero dentro do act em vez de contar tempo.
    await act(async () => {
      digitar('Nome completo', 'Luiz Miranda');
    });

    expect(await screen.findByText('Corrija os 7 campos marcados em vermelho.')).toBeOnTheScreen();
    expect(screen.queryByText('Informe nome e sobrenome')).toBeNull();
  });

  it('avisa no singular quando falta um campo só', async () => {
    render(<Cadastro />);
    await preencherTudo();
    digitar('E-mail', 'luiz');

    enviar();

    expect(await screen.findByText('Corrija o campo marcado em vermelho.')).toBeOnTheScreen();
  });

  it('coloca a máscara no CEP enquanto a pessoa digita', async () => {
    render(<Cadastro />);

    digitar('CEP', '291000');

    await waitFor(() => expect(screen.getByLabelText('CEP').props.value).toBe('29100-0'));
    expect(buscarCep).not.toHaveBeenCalled();
  });

  it('com o CEP completo busca o endereço uma vez e preenche os campos', async () => {
    const busca = promessaPendente();
    buscarCep.mockReturnValue(busca.promessa);
    render(<Cadastro />);

    digitar('CEP', '29100000');

    expect(await screen.findByText('Buscando endereço')).toBeOnTheScreen();
    expect(screen.getByLabelText('CEP').props.value).toBe('29100-000');

    await act(async () => busca.resolver(ENDERECO));

    await waitFor(() =>
      expect(screen.getByLabelText('Rua (opcional)').props.value).toBe('Rua Sete de Setembro')
    );
    expect(screen.getByLabelText('Bairro (opcional)').props.value).toBe('Centro');
    expect(screen.getByLabelText('Cidade').props.value).toBe('Vila Velha');
    expect(screen.getByLabelText('UF').props.value).toBe('ES');
    expect(screen.queryByText('Buscando endereço')).toBeNull();
    expect(buscarCep).toHaveBeenCalledTimes(1);
    expect(buscarCep).toHaveBeenCalledWith('29100000');
  });

  it('os erros de CEP, cidade e UF somem assim que o CEP preenche o endereço', async () => {
    render(<Cadastro />);
    enviar();
    await screen.findByText('Informe a cidade');

    digitar('CEP', '29100000');
    await waitFor(() => expect(screen.getByLabelText('Cidade').props.value).toBe('Vila Velha'));

    expect(await screen.findByText('Corrija os 5 campos marcados em vermelho.')).toBeOnTheScreen();
    expect(screen.queryByText('Informe o CEP')).toBeNull();
    expect(screen.queryByText('Informe a cidade')).toBeNull();
    expect(screen.queryByText('Informe a UF')).toBeNull();
  });

  it('deixa a pessoa editar o endereço que veio do CEP', async () => {
    render(<Cadastro />);
    digitar('CEP', '29100000');
    await waitFor(() => expect(screen.getByLabelText('Bairro (opcional)').props.value).toBe('Centro'));

    digitar('Bairro (opcional)', 'Praia da Costa');

    await waitFor(() => expect(screen.getByLabelText('Bairro (opcional)').props.value).toBe('Praia da Costa'));
    expect(buscarCep).toHaveBeenCalledTimes(1);
  });

  it('mostra a mensagem do serviço quando o CEP não existe e não trava o formulário', async () => {
    buscarCep.mockRejectedValue(new Error('CEP não encontrado. Confira os números.'));
    render(<Cadastro />);

    digitar('CEP', '99999999');

    expect(await screen.findByText('CEP não encontrado. Confira os números.')).toBeOnTheScreen();
    expect(screen.queryByText('Buscando endereço')).toBeNull();

    digitar('Cidade', 'Vila Velha');
    await waitFor(() => expect(screen.getByLabelText('Cidade').props.value).toBe('Vila Velha'));
  });

  it('a mensagem do CEP some quando a pessoa volta a digitar', async () => {
    buscarCep.mockRejectedValue(new Error('CEP não encontrado. Confira os números.'));
    render(<Cadastro />);
    digitar('CEP', '99999999');
    await screen.findByText('CEP não encontrado. Confira os números.');

    digitar('CEP', '9999999');

    await waitFor(() =>
      expect(screen.queryByText('CEP não encontrado. Confira os números.')).toBeNull()
    );
  });

  it('guarda a UF em maiúsculas e com duas letras', async () => {
    render(<Cadastro />);

    digitar('UF', 'esp');

    await waitFor(() => expect(screen.getByLabelText('UF').props.value).toBe('ES'));
  });

  it('usa o teclado certo em cada campo', () => {
    render(<Cadastro />);

    expect(screen.getByLabelText('E-mail').props.keyboardType).toBe('email-address');
    expect(screen.getByLabelText('E-mail').props.autoCapitalize).toBe('none');
    expect(screen.getByLabelText('Matrícula').props.keyboardType).toBe('numeric');
    expect(screen.getByLabelText('CEP').props.keyboardType).toBe('numeric');
    expect(screen.getByLabelText('UF').props.autoCapitalize).toBe('characters');
  });

  it('esconde a senha e mostra quando a pessoa pede', () => {
    render(<Cadastro />);

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    expect(screen.getByLabelText('Repita a senha').props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getAllByRole('button', { name: 'Mostrar senha' })[0]);

    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
  });

  it('com tudo certo cadastra e entra com o usuário devolvido', async () => {
    render(<Cadastro />);
    await preencherTudo();

    enviar();

    await waitFor(() => expect(entrar).toHaveBeenCalledTimes(1));
    expect(cadastrarUsuario).toHaveBeenCalledTimes(1);
    expect(cadastrarUsuario).toHaveBeenCalledWith({
      nome: 'Luiz Miranda',
      email: 'luiz@faculdade.br',
      matricula: '20261234',
      curso: CURSO,
      cep: '29100-000',
      logradouro: 'Rua Sete de Setembro',
      bairro: 'Centro',
      cidade: 'Vila Velha',
      uf: 'ES',
      senha: 'abc123',
      confirmarSenha: 'abc123',
    });
    expect(entrar).toHaveBeenCalledWith({
      id: '1',
      nome: 'Luiz Miranda',
      email: 'luiz@faculdade.br',
    });
    expect(screen.queryByText(/em vermelho/)).toBeNull();
  });

  it('deixa o botão em carregando enquanto o cadastro é enviado', async () => {
    const envio = promessaPendente();
    cadastrarUsuario.mockReturnValue(envio.promessa);
    render(<Cadastro />);
    await preencherTudo();

    enviar();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' })).toBeBusy()
    );
    expect(entrar).not.toHaveBeenCalled();

    await act(async () => envio.resolver({ dados: { id: '1' }, origem: 'local' }));

    await waitFor(() => expect(entrar).toHaveBeenCalledWith({ id: '1' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' })).not.toBeBusy()
    );
  });

  it('avisa na tela se o cadastro falhar de um jeito inesperado', async () => {
    cadastrarUsuario.mockRejectedValue(new Error('falhou'));
    render(<Cadastro />);
    await preencherTudo();

    enviar();

    expect(
      await screen.findByText('Não deu para criar sua conta agora. Tente de novo daqui a pouco.')
    ).toBeOnTheScreen();
    expect(entrar).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' })).not.toBeBusy()
    );
  });
  it('aceita CEP colado com ponto e traço', async () => {
    render(<Cadastro />);
    // Com limite de caracteres o campo cortaria o texto colado antes de a máscara agir.
    expect(screen.getByLabelText('CEP').props.maxLength).toBeUndefined();

    digitar('CEP', '29.100-000');

    await waitFor(() => expect(screen.getByLabelText('Cidade').props.value).toBe('Vila Velha'));
    expect(screen.getByLabelText('CEP').props.value).toBe('29100-000');
    expect(buscarCep).toHaveBeenCalledWith('29100000');
  });

  it('troca a dica do CEP pelo aviso de busca sem criar uma linha nova', async () => {
    const busca = promessaPendente();
    buscarCep.mockReturnValue(busca.promessa);
    render(<Cadastro />);
    const dica = 'Com o CEP, a gente preenche rua, bairro, cidade e UF.';
    expect(screen.getByText(dica)).toBeOnTheScreen();

    digitar('CEP', '29100000');

    expect(await screen.findByText('Buscando endereço')).toBeOnTheScreen();
    expect(screen.queryByText(dica)).toBeNull();

    await act(async () => busca.resolver(ENDERECO));

    expect(await screen.findByText(dica)).toBeOnTheScreen();
  });

  it('não apaga a rua e o bairro digitados quando o CEP vem sem eles', async () => {
    buscarCep.mockResolvedValue({ logradouro: '', bairro: '', cidade: 'Marechal Floriano', uf: 'ES' });
    render(<Cadastro />);
    digitar('Rua (opcional)', 'Rua das Flores');
    digitar('Bairro (opcional)', 'Centro');

    digitar('CEP', '29255000');

    await waitFor(() =>
      expect(screen.getByLabelText('Cidade').props.value).toBe('Marechal Floriano')
    );
    expect(screen.getByLabelText('Rua (opcional)').props.value).toBe('Rua das Flores');
    expect(screen.getByLabelText('Bairro (opcional)').props.value).toBe('Centro');
  });

  it('ignora a resposta de um CEP que a pessoa já trocou', async () => {
    const antiga = promessaPendente();
    buscarCep.mockImplementation((cep) =>
      cep === '29100000'
        ? antiga.promessa
        : Promise.resolve({ logradouro: 'Praça da Sé', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP' })
    );
    render(<Cadastro />);

    digitar('CEP', '29100000');
    await screen.findByText('Buscando endereço');
    digitar('CEP', '01001000');
    await waitFor(() => expect(screen.getByLabelText('Cidade').props.value).toBe('São Paulo'));

    await act(async () => antiga.resolver(ENDERECO));

    expect(screen.getByLabelText('Cidade').props.value).toBe('São Paulo');
    expect(screen.getByLabelText('UF').props.value).toBe('SP');
    expect(screen.getByLabelText('Rua (opcional)').props.value).toBe('Praça da Sé');
    expect(screen.queryByText('Buscando endereço')).toBeNull();
    expect(buscarCep).toHaveBeenCalledTimes(2);
  });

  it('não envia enquanto o CEP for um que não existe', async () => {
    render(<Cadastro />);
    await preencherTudo();
    buscarCep.mockRejectedValue(new Error('CEP não encontrado. Confira os números.'));
    digitar('CEP', '99999999');
    await screen.findByText('CEP não encontrado. Confira os números.');

    enviar();

    expect(await screen.findByText('Corrija o campo marcado em vermelho.')).toBeOnTheScreen();
    expect(screen.getByText('CEP não encontrado. Confira os números.')).toBeOnTheScreen();
    expect(cadastrarUsuario).not.toHaveBeenCalled();

    buscarCep.mockResolvedValue(ENDERECO);
    await act(async () => {
      digitar('CEP', '29100000');
    });
    await waitFor(() => expect(screen.queryByText(/em vermelho/)).toBeNull());
    enviar();

    await waitFor(() => expect(entrar).toHaveBeenCalledTimes(1));
  });

  it('deixa enviar quando a consulta do CEP falha por causa da rede', async () => {
    const semRede = 'Não deu para consultar o CEP agora. Verifique a conexão e tente de novo.';
    render(<Cadastro />);
    await preencherTudo();
    buscarCep.mockRejectedValue(new Error(semRede));
    digitar('CEP', '29101000');
    await screen.findByText(semRede);

    enviar();

    await waitFor(() => expect(entrar).toHaveBeenCalledTimes(1));
    expect(cadastrarUsuario).toHaveBeenCalledWith(expect.objectContaining({ cep: '29101-000' }));
  });

  it('envia pelo Enter do último campo, uma vez só', async () => {
    const envio = promessaPendente();
    cadastrarUsuario.mockReturnValue(envio.promessa);
    render(<Cadastro />);
    await preencherTudo();
    const ultimo = screen.getByLabelText('Repita a senha');
    expect(ultimo.props.returnKeyType).toBe('done');

    fireEvent(ultimo, 'submitEditing');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Criar conta' })).toBeBusy()
    );
    fireEvent(ultimo, 'submitEditing');

    await act(async () => envio.resolver({ dados: { id: '1' }, origem: 'local' }));

    await waitFor(() => expect(entrar).toHaveBeenCalledTimes(1));
    expect(cadastrarUsuario).toHaveBeenCalledTimes(1);
  });

  it('abre espaço para o teclado nas duas plataformas, descontando o cabeçalho', () => {
    render(<Cadastro />);

    const { behavior, keyboardVerticalOffset } = screen.UNSAFE_getByType(KeyboardAvoidingView).props;

    expect(behavior).toBe('padding');
    expect(keyboardVerticalOffset).toBeGreaterThan(24);
  });

  it('o seletor de curso começa em "Selecione"', () => {
    render(<Cadastro />);

    const opcoes = screen.getByLabelText('Curso').props.items.map((item) => item.label);

    expect(opcoes[0]).toBe('Selecione');
    expect(opcoes).not.toContain('Escolha seu curso');
  });
});
