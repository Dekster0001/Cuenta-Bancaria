import React from 'react';

/**
 * Tarjeta de presentación de la cuenta bancaria activa y su saldo actual.
 * Formatea el valor numérico en soles peruanos (PEN).
 * 
 * @param {Object} props
 * @param {Object|null} props.cuenta - Objeto con datos de la cuenta activa
 * @param {boolean} props.cargando - Indica si se están cargando los datos
 */
export const SaldoCard = ({ cuenta, cargando = false }) => {
  // Formateador de moneda en Soles Peruanos (PEN)
  const formatearSoles = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  };

  if (cargando && !cuenta) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-sm w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded-sm w-1/2 mb-6"></div>
        <div className="h-4 bg-slate-200 rounded-sm w-2/3"></div>
      </div>
    );
  }

  if (!cuenta) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center py-8">
        <p className="text-slate-500 font-medium">
          Seleccione una cuenta para consultar su saldo y movimientos.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
      {/* Fondo decorativo con círculos difuminados */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-36 h-36 rounded-full bg-blue-500/20 blur-lg pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        
        {/* Encabezado de la tarjeta */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider block">
              Cuenta de Ahorros
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {cuenta.titular}
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium text-blue-100 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Activa</span>
          </div>
        </div>

        {/* Sección de Saldo Principal */}
        <div className="py-1">
          <p className="text-xs text-blue-200 font-medium">Saldo Disponible</p>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            {formatearSoles(cuenta.saldo)}
          </div>
        </div>

        {/* Pie de la tarjeta */}
        <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-200">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Nº de Cuenta:</span>
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-semibold tracking-wider">
              {cuenta.numeroCuenta}
            </span>
          </div>
          <div>
            <span>Moneda: Soles Peruanos (PEN)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
