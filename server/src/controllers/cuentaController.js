import { Cuenta } from '../models/Cuenta.js';
import { Transaccion } from '../models/Transaccion.js';
import { sanitizarCuentaId, validarMonto } from '../utils/helpers.js';

/**
 * Obtiene la lista completa de cuentas registradas en el sistema.
 * Útil para alimentar selectores y vistas generales del frontend.
 * GET /api/cuenta
 */
export const listarCuentas = async (req, res, next) => {
  try {
    const cuentas = await Cuenta.find().sort({ numeroCuenta: 1 });
    return res.status(200).json(cuentas);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene la información y saldo de una cuenta por su número de cuenta.
 * GET /api/cuenta/:id
 */
export const obtenerCuentaPorId = async (req, res, next) => {
  try {
    const numeroCuenta = sanitizarCuentaId(req.params.id);

    if (!numeroCuenta) {
      return res.status(400).json({ mensaje: 'El número de cuenta es obligatorio' });
    }

    const cuenta = await Cuenta.findOne({ numeroCuenta });

    if (!cuenta) {
      return res.status(404).json({ mensaje: 'Cuenta no encontrada' });
    }

    return res.status(200).json(cuenta);
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza un depósito de fondos en una cuenta existente.
 * POST /api/cuenta/deposito
 * Body: { cuentaId, monto }
 */
export const realizarDeposito = async (req, res, next) => {
  try {
    const { cuentaId, monto } = req.body || {};
    const numeroCuenta = sanitizarCuentaId(cuentaId);

    if (!numeroCuenta) {
      return res.status(400).json({ mensaje: 'El campo cuentaId es obligatorio' });
    }

    const validacionMonto = validarMonto(monto);
    if (!validacionMonto.esValido) {
      return res.status(400).json({ mensaje: validacionMonto.error });
    }

    const montoValido = validacionMonto.valor;

    // Actualizamos el saldo directamente si la cuenta existe
    const cuentaActualizada = await Cuenta.findOneAndUpdate(
      { numeroCuenta },
      { $inc: { saldo: montoValido } },
      { new: true, runValidators: true }
    );

    if (!cuentaActualizada) {
      return res.status(404).json({ mensaje: 'La cuenta indicada no existe' });
    }

    // Registramos la transacción en el historial
    const transaccion = await Transaccion.create({
      tipo: 'deposito',
      monto: montoValido,
      cuentaOrigen: null,
      cuentaDestino: numeroCuenta,
      fecha: new Date(),
    });

    return res.status(201).json({
      mensaje: 'Depósito realizado con éxito',
      cuenta: cuentaActualizada,
      transaccion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza un retiro de fondos de una cuenta, impidiendo saldos negativos.
 * POST /api/cuenta/retiro
 * Body: { cuentaId, monto }
 */
export const realizarRetiro = async (req, res, next) => {
  try {
    const { cuentaId, monto } = req.body || {};
    const numeroCuenta = sanitizarCuentaId(cuentaId);

    if (!numeroCuenta) {
      return res.status(400).json({ mensaje: 'El campo cuentaId es obligatorio' });
    }

    const validacionMonto = validarMonto(monto);
    if (!validacionMonto.esValido) {
      return res.status(400).json({ mensaje: validacionMonto.error });
    }

    const montoValido = validacionMonto.valor;

    // Primero verificamos si la cuenta existe para devolver 404 si corresponde
    const cuentaExistente = await Cuenta.findOne({ numeroCuenta });
    if (!cuentaExistente) {
      return res.status(404).json({ mensaje: 'La cuenta indicada no existe' });
    }

    // Retiro atómico con condición de saldo >= monto (NUNCA permite saldo negativo)
    const cuentaActualizada = await Cuenta.findOneAndUpdate(
      { numeroCuenta, saldo: { $gte: montoValido } },
      { $inc: { saldo: -montoValido } },
      { new: true, runValidators: true }
    );

    if (!cuentaActualizada) {
      return res.status(400).json({ mensaje: 'Saldo insuficiente para realizar el retiro' });
    }

    // Registramos la transacción
    const transaccion = await Transaccion.create({
      tipo: 'retiro',
      monto: montoValido,
      cuentaOrigen: numeroCuenta,
      cuentaDestino: null,
      fecha: new Date(),
    });

    return res.status(201).json({
      mensaje: 'Retiro realizado con éxito',
      cuenta: cuentaActualizada,
      transaccion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Realiza una transferencia entre dos cuentas.
 * Implementa débito condicionado + crédito + registro con compensación (reversión)
 * para garantizar consistencia en MongoDB local standalone (sin transacciones multi-documento).
 * POST /api/cuenta/transferencia
 * Body: { cuentaOrigen, cuentaDestino, monto }
 */
export const realizarTransferencia = async (req, res, next) => {
  try {
    const { cuentaOrigen, cuentaDestino, monto } = req.body || {};
    const origenLimpio = sanitizarCuentaId(cuentaOrigen);
    const destinoLimpio = sanitizarCuentaId(cuentaDestino);

    if (!origenLimpio || !destinoLimpio || monto === undefined || monto === null) {
      return res.status(400).json({
        mensaje: 'Los campos cuentaOrigen, cuentaDestino y monto son obligatorios',
      });
    }

    if (origenLimpio === destinoLimpio) {
      return res.status(400).json({
        mensaje: 'No es posible realizar una transferencia a la misma cuenta',
      });
    }

    const validacionMonto = validarMonto(monto);
    if (!validacionMonto.esValido) {
      return res.status(400).json({ mensaje: validacionMonto.error });
    }

    const montoValido = validacionMonto.valor;

    // Verificamos existencia de la cuenta de origen
    const existeOrigen = await Cuenta.findOne({ numeroCuenta: origenLimpio });
    if (!existeOrigen) {
      return res.status(404).json({ mensaje: 'La cuenta de origen no existe' });
    }

    // Verificamos existencia de la cuenta de destino
    const existeDestino = await Cuenta.findOne({ numeroCuenta: destinoLimpio });
    if (!existeDestino) {
      return res.status(404).json({ mensaje: 'La cuenta de destino no existe' });
    }

    // Paso 1: Débito condicionado en cuenta origen (solo si saldo >= monto)
    const origenDebitado = await Cuenta.findOneAndUpdate(
      { numeroCuenta: origenLimpio, saldo: { $gte: montoValido } },
      { $inc: { saldo: -montoValido } },
      { new: true, runValidators: true }
    );

    if (!origenDebitado) {
      return res.status(400).json({
        mensaje: 'Saldo insuficiente en la cuenta de origen para realizar la transferencia',
      });
    }

    // Paso 2: Acreditar en cuenta destino con compensación si falla
    let destinoAcreditado;
    try {
      destinoAcreditado = await Cuenta.findOneAndUpdate(
        { numeroCuenta: destinoLimpio },
        { $inc: { saldo: montoValido } },
        { new: true, runValidators: true }
      );

      if (!destinoAcreditado) {
        throw new Error('La cuenta de destino no pudo ser acreditada');
      }
    } catch (errorCredito) {
      // Compensación: Revertimos el débito en origen para no perder fondos
      await Cuenta.updateOne(
        { numeroCuenta: origenLimpio },
        { $inc: { saldo: montoValido } }
      );
      console.error('[Compensación] Se revirtió el débito en origen debido a fallo en destino:', errorCredito.message);
      return res.status(500).json({
        mensaje: 'Error al acreditar en la cuenta de destino. Operación revertida exitosamente.',
      });
    }

    // Paso 3: Registrar la transacción con compensación si falla el guardado
    try {
      const transaccion = await Transaccion.create({
        tipo: 'transferencia',
        monto: montoValido,
        cuentaOrigen: origenLimpio,
        cuentaDestino: destinoLimpio,
        fecha: new Date(),
      });

      return res.status(201).json({
        mensaje: 'Transferencia realizada con éxito',
        transaccion,
        cuentaOrigen: origenDebitado,
        cuentaDestino: destinoAcreditado,
      });
    } catch (errorRegistro) {
      // Compensación doble: revertimos crédito en destino y débito en origen
      await Cuenta.updateOne({ numeroCuenta: origenLimpio }, { $inc: { saldo: montoValido } });
      await Cuenta.updateOne({ numeroCuenta: destinoLimpio }, { $inc: { saldo: -montoValido } });
      console.error('[Compensación] Se revirtieron saldos por error al registrar la transacción:', errorRegistro.message);
      return res.status(500).json({
        mensaje: 'Error al registrar el movimiento. Operación revertida para mantener la consistencia.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el historial de movimientos de una cuenta (como origen o como destino).
 * GET /api/cuenta/:id/historial?limit=20
 */
export const obtenerHistorial = async (req, res, next) => {
  try {
    const numeroCuenta = sanitizarCuentaId(req.params.id);

    if (!numeroCuenta) {
      return res.status(400).json({ mensaje: 'El número de cuenta es obligatorio' });
    }

    // Verificamos si la cuenta existe
    const cuentaExistente = await Cuenta.findOne({ numeroCuenta });
    if (!cuentaExistente) {
      return res.status(404).json({ mensaje: 'Cuenta no encontrada' });
    }

    // Validar parámetro limit (por defecto 20)
    let limit = 20;
    if (req.query.limit !== undefined) {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 100);
      }
    }

    const movimientos = await Transaccion.find({
      $or: [{ cuentaOrigen: numeroCuenta }, { cuentaDestino: numeroCuenta }],
    })
      .sort({ fecha: -1 })
      .limit(limit);

    return res.status(200).json(movimientos);
  } catch (error) {
    next(error);
  }
};
