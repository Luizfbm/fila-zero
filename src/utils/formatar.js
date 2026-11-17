function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

// Montado na mão porque o Intl se comporta diferente no Hermes e na web.
export function formatarMoeda(valor) {
  const numero = Number(valor);
  const centavos = Math.round((Number.isFinite(numero) ? numero : 0) * 100);
  const absoluto = Math.abs(centavos);
  const reais = String(Math.floor(absoluto / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = centavos < 0 ? '-' : '';

  return `${sinal}R$ ${reais},${doisDigitos(absoluto % 100)}`;
}

export function formatarData(iso) {
  if (!iso) {
    return '';
  }

  const data = new Date(iso);
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
  const digitos = somenteDigitos(texto).slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}
