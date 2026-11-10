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

    // 3. Crear transacciones iniciales de depósito para cada cuenta
    console.log('[Seed] Insertando transacciones iniciales de apertura...');
    const ahora = new Date();
    const transaccionesIniciales = [
      {
        tipo: 'deposito',
        monto: 1500,
        cuentaOrigen: null,
        cuentaDestino: '1001',
        fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 24 * 3), // hace 3 días
      },
      {
        tipo: 'deposito',
        monto: 800,
        cuentaOrigen: null,
        cuentaDestino: '1002',
        fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 24 * 2), // hace 2 días
      },
      {
        tipo: 'deposito',
        monto: 2500,
        cuentaOrigen: null,
        cuentaDestino: '1003',
        fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 24 * 1), // hace 1 día
      },
      {
        tipo: 'deposito',
        monto: 300,
        cuentaOrigen: null,
        cuentaDestino: '1004',
        fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 5), // hace 5 horas
      },
      // Movimiento adicional entre cuentas para ilustrar transferencia en el historial
      {
        tipo: 'transferencia',
        monto: 100,
        cuentaOrigen: '1001',
        cuentaDestino: '1002',
        fecha: new Date(ahora.getTime() - 1000 * 60 * 60 * 2), // hace 2 horas
      },
    ];

    await Transaccion.insertMany(transaccionesIniciales);
    console.log(`[Seed] ${transaccionesIniciales.length} transacciones iniciales registradas.`);

    console.log('\n--- RESUMEN DE CUENTAS CREADAS ---');
    cuentasIniciales.forEach((c) => {
      console.log(`- Cuenta ${c.numeroCuenta} | Titular: ${c.titular} | Saldo: S/ ${c.saldo.toFixed(2)}`);
    });
    console.log('----------------------------------\n');

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
