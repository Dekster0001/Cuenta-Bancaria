import { Router } from 'express';
import {
  listarCuentas,
  obtenerCuentaPorId,
  realizarDeposito,
  realizarRetiro,
  realizarTransferencia,
  obtenerHistorial,
} from '../controllers/cuentaController.js';

const router = Router();

// Rutas fijas (declaradas antes de los parámetros dinámicos para evitar conflictos)
router.get('/', listarCuentas);
router.post('/deposito', realizarDeposito);
router.post('/retiro', realizarRetiro);
router.post('/transferencia', realizarTransferencia);

// Rutas con parámetro dinámico :id
router.get('/:id/historial', obtenerHistorial);
router.get('/:id', obtenerCuentaPorId);

export default router;
