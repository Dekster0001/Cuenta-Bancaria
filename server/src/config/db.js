import mongoose from 'mongoose';

/**
 * Establece la conexión con la base de datos MongoDB local.
 */
export const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/banco_db';
    const conn = await mongoose.connect(uri);
    console.log(`[Base de Datos] Conexión exitosa a MongoDB: ${conn.connection.name} en ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Base de Datos] Error al conectar a MongoDB: ${error.message}`);
    // No detenemos forzosamente el proceso para permitir reintentos o manejo según entorno,
    // pero arrojamos el error para que index.js decida.
    throw error;
  }
};
