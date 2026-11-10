import mongoose from 'mongoose';

const transaccionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: [true, 'El tipo de transacción es obligatorio'],
      enum: {
        values: ['deposito', 'retiro', 'transferencia'],
        message: 'El tipo debe ser deposito, retiro o transferencia',
      },
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
    },
    cuentaOrigen: {
      type: String,
      default: null,
      trim: true,
    },
    cuentaDestino: {
      type: String,
      default: null,
      trim: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'transacciones',
  }
);

export const Transaccion = mongoose.model('Transaccion', transaccionSchema);
