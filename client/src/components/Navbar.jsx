import React from 'react';

/**
 * Componente de barra superior de navegación.
 * Incluye el título del sistema y el selector de cuenta activa.
 * 
 * @param {Object} props
 * @param {Array} props.cuentas - Lista de cuentas disponibles
 * @param {string} props.cuentaSeleccionadaId - Número de cuenta activa
 * @param {Function} props.alCambiarCuenta - Callback cuando el usuario cambia de cuenta
 * @param {boolean} props.cargando - Estado de carga de la aplicación
 */
export const Navbar = ({
  cuentas = [],
  cuentaSeleccionadaId = '',
  alCambiarCuenta,
  cargando = false,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:h-16 gap-3">
          
          {/* Marca / Logotipo */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Banco Universitario
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Gestión de Cuentas Web
                </p>
              </div>
            </div>

            {/* Badge de estado en móvil */}
            <span className="sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              En línea
            </span>
          </div>

          {/* Selector de Cuenta Activa */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <label
              htmlFor="selector-cuenta"
              className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap"
            >
              Cuenta Activa:
            </label>
            <div className="relative w-full sm:w-64">
              <select
                id="selector-cuenta"
                value={cuentaSeleccionadaId}
                onChange={(e) => alCambiarCuenta(e.target.value)}
                disabled={cargando || cuentas.length === 0}
                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {cuentas.length === 0 ? (
                  <option value="">Cargando cuentas...</option>
                ) : (
                  cuentas.map((c) => (
                    <option key={c.numeroCuenta} value={c.numeroCuenta}>
                      {c.numeroCuenta} - {c.titular}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Badge de estado en escritorio */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Operativo
            </span>
          </div>

        </div>
      </div>
    </header>
  );
};
