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

function diaLocal(data) {
  return data.getFullYear() * 10000 + data.getMonth() * 100 + data.getDate();
}

// Simulação: a API de exemplo não tem cozinha de verdade, então o pedido recebido anda sozinho pelo tempo e o de outro dia conta como retirado.
export function statusAtual(pedido, agora) {
  const status = pedido.status || 'recebido';
  if (status !== 'recebido') {
    return status;
  }

  const criado = new Date(pedido.criadoEm);
  const momento = new Date(agora);
  const decorrido = momento.getTime() - criado.getTime();
  if (Number.isNaN(decorrido)) {
    return 'recebido';
  }

  if (diaLocal(criado) < diaLocal(momento)) {
    return 'retirado';
  }

  if (decorrido < MINUTO) {
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
