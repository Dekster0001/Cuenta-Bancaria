import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import cuentaRoutes from './routes/cuentaRoutes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Manejador específico para solicitudes con cuerpo JSON malformado (400)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ mensaje: 'Formato JSON inválido en el cuerpo de la solicitud' });
  }
  next(err);
});

// Ruta de comprobación de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({ estado: 'ok', mensaje: 'Servidor bancario operativo' });
});

// Rutas de la API de Cuentas
app.use('/api/cuenta', cuentaRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada en el servidor' });
});

// Manejador global de errores (500) - No filtra detalles internos al cliente
app.use((err, req, res, next) => {
  console.error('[Error no controlado en el servidor]:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Inicialización de la base de datos y escucha del servidor
const iniciarServidor = async () => {
  try {
    await conectarDB();
    app.listen(PORT, () => {
      console.log(`[Servidor] Backend bancario corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Servidor] No se pudo inicializar la base de datos:', error.message);
    // Iniciamos el servidor de todos modos para que responda errores claros o reciba reintentos
    app.listen(PORT, () => {
      console.log(`[Servidor] Servidor iniciado en http://localhost:${PORT} (esperando conexión a MongoDB)`);
    });
  }
};

iniciarServidor();
