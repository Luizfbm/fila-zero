import { rotuloStatus, statusAtual, tomStatus } from '../../src/utils/statusPedido';

const CRIADO_EM = '2026-11-17T12:00:00.000Z';
const INICIO = new Date(CRIADO_EM).getTime();
const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;

function pedido(status) {
  return { id: 1, status, criadoEm: CRIADO_EM };
}

describe('statusAtual', () => {
  it('fica em recebido no primeiro minuto', () => {
    expect(statusAtual(pedido('recebido'), INICIO)).toBe('recebido');
    expect(statusAtual(pedido('recebido'), INICIO + 59 * SEGUNDO)).toBe('recebido');
  });

  it('passa para em preparo quando completa 1 minuto', () => {
    expect(statusAtual(pedido('recebido'), INICIO + MINUTO)).toBe('em preparo');
  });

  it('continua em preparo até 3 minutos', () => {
    expect(statusAtual(pedido('recebido'), INICIO + 3 * MINUTO)).toBe('em preparo');
  });

  it('fica pronto depois de 3 minutos', () => {
    expect(statusAtual(pedido('recebido'), INICIO + 3 * MINUTO + SEGUNDO)).toBe('pronto');
    expect(statusAtual(pedido('recebido'), INICIO + 60 * MINUTO)).toBe('pronto');
  });

  it('aceita o agora como Date', () => {
    expect(statusAtual(pedido('recebido'), new Date(INICIO + 2 * MINUTO))).toBe('em preparo');
  });

  it('respeita o status que veio da API quando não é recebido', () => {
    expect(statusAtual(pedido('em preparo'), INICIO)).toBe('em preparo');
    expect(statusAtual(pedido('pronto'), INICIO)).toBe('pronto');
    expect(statusAtual(pedido('retirado'), INICIO + 60 * MINUTO)).toBe('retirado');
  });

  it('trata pedido sem status como recebido', () => {
    expect(statusAtual({ id: 2, criadoEm: CRIADO_EM }, INICIO)).toBe('recebido');
  });

  it('não avança quando a data do pedido não dá para ler', () => {
    expect(statusAtual({ id: 3, status: 'recebido', criadoEm: 'ontem' }, INICIO)).toBe('recebido');
    expect(statusAtual({ id: 4, status: 'recebido' }, INICIO)).toBe('recebido');
  });

  it('não avança se o relógio do aparelho estiver atrás da data do pedido', () => {
    expect(statusAtual(pedido('recebido'), INICIO - 10 * MINUTO)).toBe('recebido');
  });
});

describe('rotuloStatus', () => {
  it('devolve o texto de cada status', () => {
    expect(rotuloStatus('recebido')).toBe('Recebido');
    expect(rotuloStatus('em preparo')).toBe('Em preparo');
    expect(rotuloStatus('pronto')).toBe('Pronto para retirar');
    expect(rotuloStatus('retirado')).toBe('Retirado');
  });

  it('devolve o próprio valor quando não conhece o status', () => {
    expect(rotuloStatus('cancelado')).toBe('cancelado');
  });
});

describe('tomStatus', () => {
  it('devolve o tom da etiqueta de cada status', () => {
    expect(tomStatus('recebido')).toBe('neutro');
    expect(tomStatus('em preparo')).toBe('alerta');
    expect(tomStatus('pronto')).toBe('sucesso');
    expect(tomStatus('retirado')).toBe('neutro');
  });

  it('usa neutro para status desconhecido', () => {
    expect(tomStatus('cancelado')).toBe('neutro');
  });
});
