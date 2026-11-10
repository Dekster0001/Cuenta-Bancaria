import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import { Cuenta } from './models/Cuenta.js';
import { Transaccion } from './models/Transaccion.js';

// Cargar variables de entorno
dotenv.config();

const cuentasIniciales = [
  { numeroCuenta: '1001', titular: 'Ana Torres', saldo: 1500 },
  { numeroCuenta: '1002', titular: 'Luis Ramos', saldo: 800 },
  { numeroCuenta: '1003', titular: 'María Quispe', saldo: 2500 },
  { numeroCuenta: '1004', titular: 'Carlos Huamán', saldo: 300 },
];

const sembrarDatos = async () => {
  try {
    console.log('[Seed] Iniciando proceso de carga inicial de datos...');
    await conectarDB();

    // 1. Vaciar colecciones existentes
    console.log('[Seed] Vaciando colecciones cuentas y transacciones...');
    await Cuenta.deleteMany({});
    await Transaccion.deleteMany({});

    // 2. Insertar cuentas de prueba
    console.log('[Seed] Insertando cuentas de prueba...');
    const cuentasCreadas = await Cuenta.insertMany(cuentasIniciales);
    console.log(`[Seed] ${cuentasCreadas.length} cuentas creadas con éxito.`);

    // 3. Crear exactamente una transacción por cuenta (depósito de apertura)
    console.log('[Seed] Registrando depósitos de apertura...');
    const fechaApertura = new Date();
    const transaccionesApertura = cuentasIniciales.map((c) => ({
      tipo: 'deposito',
      monto: c.saldo,
      cuentaOrigen: null,
      cuentaDestino: c.numeroCuenta,
      fecha: fechaApertura,
    }));
    const transaccionesCreadas = await Transaccion.insertMany(transaccionesApertura);
    console.log(`[Seed] ${transaccionesCreadas.length} depósitos de apertura registrados con éxito.`);

    console.log('\n--- RESUMEN Y VERIFICACIÓN DE CUENTAS ---');
    for (const c of cuentasIniciales) {
      const movimientos = await Transaccion.find({
        $or: [{ cuentaOrigen: c.numeroCuenta }, { cuentaDestino: c.numeroCuenta }],
      });

      const totalCalculado = movimientos.reduce((acumulado, t) => {
        if (t.tipo === 'deposito' && t.cuentaDestino === c.numeroCuenta) {
          return acumulado + t.monto;
        }
        if (t.tipo === 'transferencia' && t.cuentaDestino === c.numeroCuenta) {
          return acumulado + t.monto;
        }
        if (t.tipo === 'retiro' && t.cuentaOrigen === c.numeroCuenta) {
          return acumulado - t.monto;
        }
        if (t.tipo === 'transferencia' && t.cuentaOrigen === c.numeroCuenta) {
          return acumulado - t.monto;
        }
        return acumulado;
      }, 0);

      const totalRedondeado = Math.round((totalCalculado + Number.EPSILON) * 100) / 100;
      const estado = totalRedondeado === c.saldo ? 'OK' : 'DESCUADRE';

      console.log(
        `- Cuenta ${c.numeroCuenta} | Titular: ${c.titular} | Saldo: S/ ${c.saldo.toFixed(2)} | Balance Movimientos: S/ ${totalRedondeado.toFixed(2)} -> ${estado}`
      );
    }
    console.log('-----------------------------------------\n');

    console.log('[Seed] Proceso completado exitosamente.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error durante la carga inicial de datos:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

sembrarDatos();
