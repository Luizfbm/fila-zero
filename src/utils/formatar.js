function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

// Montado na mão porque o Intl se comporta diferente no Hermes e na web.
function paraNumero(valor) {
  if (typeof valor !== 'string') {
    return Number(valor);
  }

  const texto = valor.trim();
  // Com vírgula, o texto está no formato brasileiro: ponto é milhar.
  return Number(texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto);
}

export function formatarMoeda(valor) {
  const numero = paraNumero(valor);
  const centavos = Math.round((Number.isFinite(numero) ? numero : 0) * 100);
  const absoluto = Math.abs(centavos);
  const reais = String(Math.floor(absoluto / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = centavos < 0 ? '-' : '';

  return `${sinal}R$ ${reais},${doisDigitos(absoluto % 100)}`;
}

function paraData(iso) {
  // Data sem hora ("2026-11-17") é lida como UTC pelo Date e voltaria um dia
  // no Brasil, então monto no horário local.
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!soData) {
    return new Date(iso);
  }

  const ano = Number(soData[1]);
  const mes = Number(soData[2]);
  const dia = Number(soData[3]);
  const data = new Date(ano, mes - 1, dia);
  const existe = data.getMonth() === mes - 1 && data.getDate() === dia;

  return existe ? data : new Date(NaN);
}

export function formatarData(iso) {
  if (!iso) {
    return '';
  }

  const data = paraData(iso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }

  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());

  return `${dia}/${mes}/${data.getFullYear()} ${hora}:${minuto}`;
}

export function somenteDigitos(texto) {
  if (texto === undefined || texto === null) {
    return '';
  }

  return String(texto).replace(/\D/g, '');
}

export function mascararCep(texto) {
  // Número perde o zero da frente (01100-000 vira 1100000), então reponho.
  const completo = typeof texto === 'number' ? somenteDigitos(texto).padStart(8, '0') : somenteDigitos(texto);
  const digitos = completo.slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

// Pedido guardado só no aparelho tem id "local-1"; para quem lê, o número é 1.
export function numeroDoPedido(id) {
  if (id === undefined || id === null) {
    return '';
  }

  return String(id).replace(/^local-/, '');
}
