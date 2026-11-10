import React from 'react';

/**
 * Componente que muestra la tabla con el historial de transacciones
 * asociadas a la cuenta bancaria activa.
 * 
 * @param {Object} props
 * @param {Array} props.transacciones - Lista de transacciones
 * @param {string} props.cuentaActivaId - Número de la cuenta activa para determinar sentido del flujo
 * @param {boolean} props.cargando - Estado de carga del historial
 */
export const HistorialTransacciones = ({
  transacciones = [],
  cuentaActivaId = '',
  cargando = false,
}) => {
  // Formateador de moneda en Soles
  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(valor || 0);
  };

  // Formateador de fecha y hora en español
  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '-';
    const f = new Date(fechaIso);
    return f.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Determina la dirección, color e insignia según el tipo y la cuenta activa.
   */
  const clasificarMovimiento = (tx) => {
    if (tx.tipo === 'deposito') {
      return {
        etiqueta: 'Depósito',
        esIngreso: true,
        insigniaColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        signo: '+',
        montoColor: 'text-emerald-600',
        origen: tx.cuentaOrigen || 'Taquilla / Depósito',
        destino: tx.cuentaDestino || cuentaActivaId,
      };
    }

    if (tx.tipo === 'retiro') {
      return {
        etiqueta: 'Retiro',
        esIngreso: false,
        insigniaColor: 'bg-rose-100 text-rose-800 border-rose-200',
        signo: '-',
        montoColor: 'text-rose-600',
        origen: tx.cuentaOrigen || cuentaActivaId,
        destino: 'Cajero / Ventanilla',
      };
    }

    if (tx.tipo === 'transferencia') {
      const esEnviada = tx.cuentaOrigen === cuentaActivaId;
      if (esEnviada) {
        return {
          etiqueta: 'Transferencia Enviada',
          esIngreso: false,
          insigniaColor: 'bg-amber-100 text-amber-800 border-amber-200',
          signo: '-',
          montoColor: 'text-rose-600',
          origen: `Esta cuenta (${tx.cuentaOrigen})`,
          destino: `Cuenta ${tx.cuentaDestino}`,
        };
      } else {
        return {
          etiqueta: 'Transferencia Recibida',
          esIngreso: true,
          insigniaColor: 'bg-blue-100 text-blue-800 border-blue-200',
          signo: '+',
          montoColor: 'text-emerald-600',
          origen: `Cuenta ${tx.cuentaOrigen}`,
          destino: `Esta cuenta (${tx.cuentaDestino})`,
        };
      }
    }

    return {
      etiqueta: tx.tipo,
      esIngreso: true,
      insigniaColor: 'bg-slate-100 text-slate-800 border-slate-200',
      signo: '',
      montoColor: 'text-slate-800',
      origen: tx.cuentaOrigen || '-',
      destino: tx.cuentaDestino || '-',
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Encabezado */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Historial de Movimientos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Últimas transacciones registradas para la cuenta {cuentaActivaId}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 self-start sm:self-auto">
          {transacciones.length} movimiento{transacciones.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Tabla con scroll horizontal en móvil */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/75 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">Fecha y Hora</th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">Tipo</th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">Origen</th>
              <th scope="col" className="px-5 py-3.5 whitespace-nowrap">Destino</th>
              <th scope="col" className="px-5 py-3.5 text-right whitespace-nowrap">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    <span className="text-sm font-medium">Cargando movimientos...</span>
                  </div>
                </td>
              </tr>
            ) : transacciones.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                      ∅
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      No hay movimientos registrados
                    </p>
                    <p className="text-xs text-slate-400">
                      Realice un depósito, retiro o transferencia para visualizar el historial.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transacciones.map((tx) => {
                const info = clasificarMovimiento(tx);
                return (
                  <tr
                    key={tx._id || `${tx.fecha}-${tx.monto}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Fecha */}
                    <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap text-xs sm:text-sm">
                      {formatearFecha(tx.fecha)}
                    </td>

                    {/* Tipo / Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.insigniaColor}`}
                      >
                        {info.etiqueta}
                      </span>
                    </td>

                    {/* Origen */}
                    <td className="px-5 py-3.5 text-slate-700 text-xs sm:text-sm whitespace-nowrap">
                      {info.origen}
                    </td>

                    {/* Destino */}
                    <td className="px-5 py-3.5 text-slate-700 text-xs sm:text-sm whitespace-nowrap">
                      {info.destino}
                    </td>

                    {/* Monto */}
                    <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap text-sm sm:text-base ${info.montoColor}`}>
                      {info.signo} {formatearMonto(tx.monto)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
