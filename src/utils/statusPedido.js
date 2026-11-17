const MINUTO = 60 * 1000;

export const STATUS = ['recebido', 'em preparo', 'pronto', 'retirado'];

const ROTULOS = {
  recebido: 'Recebido',
  'em preparo': 'Em preparo',
  pronto: 'Pronto para retirar',
  retirado: 'Retirado',
};

const TONS = {
  recebido: 'neutro',
  'em preparo': 'alerta',
  pronto: 'sucesso',
  retirado: 'neutro',
};

// Simulação: a API de exemplo não tem cozinha de verdade, então o pedido recebido anda sozinho pelo tempo.
export function statusAtual(pedido, agora) {
  const status = pedido.status || 'recebido';
  if (status !== 'recebido') {
    return status;
  }

  const decorrido = new Date(agora).getTime() - new Date(pedido.criadoEm).getTime();
  if (Number.isNaN(decorrido) || decorrido < MINUTO) {
    return 'recebido';
  }

  return decorrido <= 3 * MINUTO ? 'em preparo' : 'pronto';
}

export function rotuloStatus(status) {
  return ROTULOS[status] || status;
}

export function tomStatus(status) {
  return TONS[status] || 'neutro';
}
