/**
 * Limpia y convierte un identificador de cuenta a String plano para prevenir
 * inyecciones de operadores NoSQL de MongoDB (como {$ne: null}, {$gt: ''}, etc.).
 * @param {any} valor
 * @returns {string} Cadena de texto limpia
 */
export const sanitizarCuentaId = (valor) => {
  if (valor === undefined || valor === null) {
    return '';
  }
  return String(valor).trim();
};

/**
 * Redondea un número a 2 decimales con precisión monetaria.
 * @param {number} monto
 * @returns {number}
 */
export const redondearMonto = (monto) => {
  return Math.round((Number(monto) + Number.EPSILON) * 100) / 100;
};

/**
 * Valida si un valor corresponde a un monto válido (numérico, finito y estrictamente positivo).
 * @param {any} monto
 * @returns {{ esValido: boolean, error?: string, valor?: number }}
 */
export const validarMonto = (monto) => {
  if (monto === undefined || monto === null || monto === '') {
    return { esValido: false, error: 'El monto es obligatorio' };
  }

  const numero = Number(monto);

  if (typeof numero !== 'number' || Number.isNaN(numero) || !Number.isFinite(numero)) {
    return { esValido: false, error: 'El monto debe ser un valor numérico válido' };
  }

  if (numero <= 0) {
    return { esValido: false, error: 'El monto debe ser un valor positivo mayor a cero' };
  }

  return { esValido: true, valor: redondearMonto(numero) };
};
