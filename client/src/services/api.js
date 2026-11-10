/**
 * Servicio de comunicación HTTP con la API REST del backend bancario.
 * Utiliza fetch nativo y gestiona las respuestas de error lanzando excepciones
 * con el mensaje devuelto por el servidor.
 */

const API_BASE = '/api';

/**
 * Función auxiliar para procesar las respuestas de fetch y arrojar errores consistentes.
 * @param {Response} respuesta
 * @returns {Promise<any>}
 */
const manejarRespuesta = async (respuesta) => {
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (err) {
    // Si la respuesta no es un JSON válido
    datos = null;
  }

  if (!respuesta.ok) {
    const mensajeError =
      (datos && datos.mensaje) ||
      `Error HTTP ${respuesta.status}: ${respuesta.statusText || 'Operación fallida'}`;
    throw new Error(mensajeError);
  }

  return datos;
};

/**
 * Obtiene la lista de todas las cuentas registradas.
 * GET /api/cuenta
 */
export const obtenerCuentas = async () => {
  const res = await fetch(`${API_BASE}/cuenta`, { cache: 'no-store' });
  return manejarRespuesta(res);
};

/**
 * Obtiene los datos detallados y saldo de una cuenta por su número.
 * GET /api/cuenta/:id
 * @param {string} cuentaId
 */
export const obtenerCuentaPorId = async (cuentaId) => {
  const res = await fetch(`${API_BASE}/cuenta/${encodeURIComponent(cuentaId)}`, {
    cache: 'no-store',
  });
  return manejarRespuesta(res);
};

/**
 * Realiza un depósito en una cuenta bancaria.
 * POST /api/cuenta/deposito
 * @param {Object} datos
 * @param {string} datos.cuentaId
 * @param {number} datos.monto
 */
export const realizarDeposito = async ({ cuentaId, monto }) => {
  const res = await fetch(`${API_BASE}/cuenta/deposito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cuentaId, monto: Number(monto) }),
    cache: 'no-store',
  });
  return manejarRespuesta(res);
};

/**
 * Realiza un retiro de una cuenta bancaria.
 * POST /api/cuenta/retiro
 * @param {Object} datos
 * @param {string} datos.cuentaId
 * @param {number} datos.monto
 */
export const realizarRetiro = async ({ cuentaId, monto }) => {
  const res = await fetch(`${API_BASE}/cuenta/retiro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cuentaId, monto: Number(monto) }),
    cache: 'no-store',
  });
  return manejarRespuesta(res);
};

/**
 * Realiza una transferencia de fondos entre dos cuentas bancarias.
 * POST /api/cuenta/transferencia
 * @param {Object} datos
 * @param {string} datos.cuentaOrigen
 * @param {string} datos.cuentaDestino
 * @param {number} datos.monto
 */
export const realizarTransferencia = async ({ cuentaOrigen, cuentaDestino, monto }) => {
  const res = await fetch(`${API_BASE}/cuenta/transferencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cuentaOrigen, cuentaDestino, monto: Number(monto) }),
    cache: 'no-store',
  });
  return manejarRespuesta(res);
};

/**
 * Obtiene el historial de movimientos de una cuenta (origen o destino).
 * GET /api/cuenta/:id/historial?limit=20
 * @param {string} cuentaId
 * @param {number} [limit=20]
 */
export const obtenerHistorial = async (cuentaId, limit = 20) => {
  const res = await fetch(
    `${API_BASE}/cuenta/${encodeURIComponent(cuentaId)}/historial?limit=${limit}`,
    { cache: 'no-store' }
  );
  return manejarRespuesta(res);
};
