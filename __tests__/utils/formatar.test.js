import {
  formatarMoeda,
  formatarData,
  somenteDigitos,
  mascararCep,
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

  it('devolve texto vazio para valor ausente', () => {
    expect(mascararCep(undefined)).toBe('');
  });
});
