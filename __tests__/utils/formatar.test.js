import {
  formatarMoeda,
  formatarData,
  somenteDigitos,
  mascararCep,
  numeroDoPedido,
} from '../../src/utils/formatar';

describe('formatarMoeda', () => {
  it('escreve o valor em reais com vírgula e duas casas', () => {
    expect(formatarMoeda(12.5)).toBe('R$ 12,50');
    expect(formatarMoeda(0)).toBe('R$ 0,00');
    expect(formatarMoeda(7)).toBe('R$ 7,00');
  });

  it('separa os milhares com ponto', () => {
    expect(formatarMoeda(1234.5)).toBe('R$ 1.234,50');
    expect(formatarMoeda(1234567.89)).toBe('R$ 1.234.567,89');
  });

  it('arredonda para centavos', () => {
    expect(formatarMoeda(9.999)).toBe('R$ 10,00');
    expect(formatarMoeda(0.1 + 0.2)).toBe('R$ 0,30');
  });

  it('põe o sinal antes do símbolo quando o valor é negativo', () => {
    expect(formatarMoeda(-4.5)).toBe('-R$ 4,50');
  });

  it('trata valor ausente ou inválido como zero', () => {
    expect(formatarMoeda(undefined)).toBe('R$ 0,00');
    expect(formatarMoeda('abc')).toBe('R$ 0,00');
  });

  it('aceita número em texto', () => {
    expect(formatarMoeda('8.5')).toBe('R$ 8,50');
  });

  it('aceita número em texto escrito com vírgula', () => {
    expect(formatarMoeda('12,50')).toBe('R$ 12,50');
    expect(formatarMoeda('1.234,5')).toBe('R$ 1.234,50');
    expect(formatarMoeda(' 7,5 ')).toBe('R$ 7,50');
  });
});

describe('formatarData', () => {
  it('mostra dia, mês, ano, hora e minuto no horário local', () => {
    const iso = new Date(2026, 10, 17, 8, 30).toISOString();
    expect(formatarData(iso)).toBe('17/11/2026 08:30');
  });

  it('completa com zero dia, mês, hora e minuto de um dígito', () => {
    const iso = new Date(2026, 0, 5, 7, 4).toISOString();
    expect(formatarData(iso)).toBe('05/01/2026 07:04');
  });

  it('não volta um dia quando a data vem sem hora', () => {
    expect(formatarData('2026-11-17')).toBe('17/11/2026 00:00');
    expect(formatarData('2026-01-01')).toBe('01/01/2026 00:00');
  });

  it('recusa data sem hora que não existe', () => {
    expect(formatarData('2026-02-31')).toBe('');
    expect(formatarData('2026-13-01')).toBe('');
  });

  it('devolve texto vazio quando a data não é válida', () => {
    expect(formatarData('ontem')).toBe('');
    expect(formatarData('')).toBe('');
    expect(formatarData(undefined)).toBe('');
    expect(formatarData(null)).toBe('');
  });
});

describe('somenteDigitos', () => {
  it('tira tudo que não é número', () => {
    expect(somenteDigitos('29.100-000')).toBe('29100000');
    expect(somenteDigitos('abc')).toBe('');
  });

  it('aceita número e valor ausente', () => {
    expect(somenteDigitos(29100000)).toBe('29100000');
    expect(somenteDigitos(undefined)).toBe('');
    expect(somenteDigitos(null)).toBe('');
  });
});

describe('mascararCep', () => {
  it('coloca o hífen depois do quinto dígito', () => {
    expect(mascararCep('29100000')).toBe('29100-000');
  });

  it('não mexe em CEP que já está com máscara', () => {
    expect(mascararCep('29100-000')).toBe('29100-000');
  });

  it('acompanha a digitação sem pôr hífen antes da hora', () => {
    expect(mascararCep('291')).toBe('291');
    expect(mascararCep('29100')).toBe('29100');
    expect(mascararCep('291000')).toBe('29100-0');
  });

  it('corta o que passar de oito dígitos', () => {
    expect(mascararCep('291000001234')).toBe('29100-000');
  });

  it('aceita CEP em número, repondo o zero da frente', () => {
    expect(mascararCep(29100000)).toBe('29100-000');
    expect(mascararCep(1100000)).toBe('01100-000');
  });

  it('devolve texto vazio para valor ausente', () => {
    expect(mascararCep(undefined)).toBe('');
  });
});

describe('numeroDoPedido', () => {
  it('tira o prefixo do pedido guardado só no aparelho', () => {
    expect(numeroDoPedido('local-3')).toBe('3');
  });

  it('devolve o id da API como texto', () => {
    expect(numeroDoPedido('12')).toBe('12');
    expect(numeroDoPedido(12)).toBe('12');
  });

  it('só tira o prefixo quando ele está no começo', () => {
    expect(numeroDoPedido('a-local-3')).toBe('a-local-3');
  });

  it('devolve texto vazio para valor ausente', () => {
    expect(numeroDoPedido(undefined)).toBe('');
    expect(numeroDoPedido(null)).toBe('');
    expect(numeroDoPedido('')).toBe('');
  });
});
