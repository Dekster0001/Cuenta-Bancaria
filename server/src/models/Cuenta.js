import mongoose from 'mongoose';

const cuentaSchema = new mongoose.Schema(
  {
    numeroCuenta: {
      type: String,
      required: [true, 'El número de cuenta es obligatorio'],
      unique: true,
      trim: true,
    },
    titular: {
      type: String,
      required: [true, 'El titular de la cuenta es obligatorio'],
      trim: true,
    },
    saldo: {
      type: Number,
      required: [true, 'El saldo inicial es obligatorio'],
      min: [0, 'El saldo no puede ser negativo'],
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'cuentas',
  }
);

export const Cuenta = mongoose.model('Cuenta', cuentaSchema);
