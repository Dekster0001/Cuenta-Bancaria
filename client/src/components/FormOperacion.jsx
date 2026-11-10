import React, { useState, useEffect } from 'react';
import {
  realizarDeposito,
  realizarRetiro,
  realizarTransferencia,
} from '../services/api.js';

/**
 * Componente con pestañas y formulario controlado para realizar
 * operaciones bancarias (Depósito, Retiro y Transferencia).
 * 
 * @param {Object} props
 * @param {string} props.cuentaActivaId - Número de la cuenta activa que realiza la operación
 * @param {Array} props.cuentas - Lista de cuentas para selector de destino
 * @param {Function} props.onOperacionExitosa - Callback para refrescar datos tras operación exitosa
 */
export const FormOperacion = ({
  cuentaActivaId,
  cuentas = [],
  onOperacionExitosa,
}) => {
  // Pestaña actual: 'deposito' | 'retiro' | 'transferencia'
  const [tipoOperacion, setTipoOperacion] = useState('deposito');
  const [monto, setMonto] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito' | 'error', texto: string }

  // Limpiar mensajes al cambiar de cuenta activa
  useEffect(() => {
    setMensaje(null);
  }, [cuentaActivaId]);

  // Desaparecer el mensaje de éxito automáticamente después de 4 segundos
  useEffect(() => {
    if (mensaje && mensaje.tipo === 'exito') {
      const temporizador = setTimeout(() => {
        setMensaje(null);
      }, 4000);
      return () => clearTimeout(temporizador);
    }
  }, [mensaje]);

  // Cambiar pestaña y limpiar estados
  const cambiarPestana = (tipo) => {
    setTipoOperacion(tipo);
    setMonto('');
    setCuentaDestino('');
    setMensaje(null);
  };

  // Cuentas disponibles para transferir (excluyendo la cuenta activa)
  const cuentasDestinoDisponibles = cuentas.filter(
    (c) => c.numeroCuenta !== cuentaActivaId
  );

  // Procesar envío del formulario
  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje(null);

    // Validación básica en cliente
    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor, ingrese un monto válido mayor a cero.',
      });
      return;
    }

    if (tipoOperacion === 'transferencia') {
      if (!cuentaDestino.trim()) {
        setMensaje({
          tipo: 'error',
          texto: 'Debe seleccionar o indicar una cuenta de destino.',
        });
        return;
      }
      if (cuentaDestino.trim() === cuentaActivaId) {
        setMensaje({
          tipo: 'error',
          texto: 'No puede realizar una transferencia a la misma cuenta activa.',
        });
        return;
      }
    }

    setEnviando(true);

    try {
      let respuesta = null;

      if (tipoOperacion === 'deposito') {
        respuesta = await realizarDeposito({
          cuentaId: cuentaActivaId,
          monto: montoNumerico,
        });
      } else if (tipoOperacion === 'retiro') {
        respuesta = await realizarRetiro({
          cuentaId: cuentaActivaId,
          monto: montoNumerico,
        });
      } else if (tipoOperacion === 'transferencia') {
        respuesta = await realizarTransferencia({
          cuentaOrigen: cuentaActivaId,
          cuentaDestino: cuentaDestino.trim(),
          monto: montoNumerico,
        });
      }

      // Mensaje de éxito devuelto por la API
      setMensaje({
        tipo: 'exito',
        texto: respuesta?.mensaje || 'Operación completada con éxito.',
      });

      // Limpiar inputs
      setMonto('');
      setCuentaDestino('');

      // Notificar al componente padre para actualizar saldo e historial esperando su finalización
      if (typeof onOperacionExitosa === 'function') {
        await onOperacionExitosa();
      }
    } catch (error) {
      // Capturar y mostrar el mensaje devuelto por la API
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Ocurrió un error al procesar la operación.',
      });
    } finally {
      setEnviando(false);
    }
  };

  // Configuración de estilo y texto según la pestaña
  const obtenerConfigPestana = () => {
    switch (tipoOperacion) {
      case 'deposito':
        return {
          tituloBoton: 'Confirmar Depósito',
          colorBoton: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
          descripcion: 'El dinero se acreditará de forma inmediata al saldo disponible.',
        };
      case 'retiro':
        return {
          tituloBoton: 'Confirmar Retiro',
          colorBoton: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
          descripcion: 'El saldo se debitará si existen fondos suficientes en la cuenta.',
        };
      case 'transferencia':
        return {
          tituloBoton: 'Confirmar Transferencia',
          colorBoton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          descripcion: 'Transferencia inmediata y segura entre cuentas bancarias.',
        };
      default:
        return {
          tituloBoton: 'Procesar',
          colorBoton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          descripcion: '',
        };
    }
  };

  const config = obtenerConfigPestana();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => cambiarPestana('deposito')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 ${
            tipoOperacion === 'deposito'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Depósito
        </button>
        <button
          type="button"
          onClick={() => cambiarPestana('retiro')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 ${
            tipoOperacion === 'retiro'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Retiro
        </button>
        <button
          type="button"
          onClick={() => cambiarPestana('transferencia')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 ${
            tipoOperacion === 'transferencia'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Transferencia
        </button>
      </div>

      {/* Cuerpo del Formulario */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800 capitalize">
            Operación de {tipoOperacion}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.descripcion}
          </p>
        </div>

        {/* Mensajes de Alerta (Éxito / Error) */}
        {mensaje && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-sm font-medium flex items-start space-x-2.5 border ${
              mensaje.tipo === 'exito'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span className="font-bold text-base leading-none">
              {mensaje.tipo === 'exito' ? '✓' : '✕'}
            </span>
            <div className="flex-1">{mensaje.texto}</div>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          
          {/* Campo de Cuenta Destino (solo en Transferencia) */}
          {tipoOperacion === 'transferencia' && (
            <div>
              <label
                htmlFor="cuenta-destino"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Cuenta Destino <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <select
                  id="cuenta-destino"
                  value={cuentaDestino}
                  onChange={(e) => setCuentaDestino(e.target.value)}
                  disabled={enviando}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-2xs disabled:opacity-50"
                >
                  <option value="">-- Seleccionar cuenta beneficiaria --</option>
                  {cuentasDestinoDisponibles.map((c) => (
                    <option key={c.numeroCuenta} value={c.numeroCuenta}>
                      {c.numeroCuenta} - {c.titular}
                    </option>
                  ))}
                </select>
                <div className="flex items-center text-xs text-slate-500">
                  <span>O ingresar manualmente número de cuenta:</span>
                </div>
                <input
                  type="text"
                  placeholder="Ej: 1003"
                  value={cuentaDestino}
                  onChange={(e) => setCuentaDestino(e.target.value)}
                  disabled={enviando}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-2xs font-mono disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Campo de Monto */}
          <div>
            <label
              htmlFor="monto-operacion"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Monto a operar (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold text-sm">
                S/
              </div>
              <input
                id="monto-operacion"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={enviando}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-base font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 shadow-2xs disabled:opacity-50"
              />
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              Ingrese un monto con hasta dos decimales (ej: 150.50).
            </p>
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={enviando || !cuentaActivaId}
            className={`w-full text-white font-semibold rounded-xl text-sm px-5 py-3 text-center transition-all duration-150 shadow-sm focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${config.colorBoton}`}
          >
            {enviando ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Procesando operación...</span>
              </span>
            ) : (
              config.tituloBoton
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
