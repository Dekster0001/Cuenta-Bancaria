import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { SaldoCard } from './components/SaldoCard.jsx';
import { FormOperacion } from './components/FormOperacion.jsx';
import { HistorialTransacciones } from './components/HistorialTransacciones.jsx';
import {
  obtenerCuentas,
  obtenerCuentaPorId,
  obtenerHistorial,
} from './services/api.js';

export function App() {
  // Estados principales de la aplicación
  const [cuentas, setCuentas] = useState([]);
  const [cuentaId, setCuentaId] = useState('');
  const [cuenta, setCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);

  /**
   * Carga la lista inicial de cuentas bancarias.
   */
  const cargarListaCuentas = useCallback(async () => {
    try {
      setErrorGlobal(null);
      const lista = await obtenerCuentas();
      setCuentas(lista || []);
      return lista;
    } catch (err) {
      console.error('Error al cargar lista de cuentas:', err);
      setErrorGlobal(err.message || 'No se pudo conectar con el servidor bancario.');
      return [];
    }
  }, []);

  /**
   * Carga los datos de saldo y el historial de transacciones de la cuenta activa.
   */
  const cargarDatosCuenta = useCallback(async (id) => {
    if (!id) return;
    setCargandoDetalle(true);
    try {
      setErrorGlobal(null);
      // Solicitamos en paralelo la información de la cuenta y el historial
      const [datosCuenta, datosHistorial] = await Promise.all([
        obtenerCuentaPorId(id),
        obtenerHistorial(id, 20),
      ]);
      setCuenta(datosCuenta);
      setHistorial(datosHistorial || []);
    } catch (err) {
      console.error('Error al cargar datos de la cuenta:', err);
      setErrorGlobal(err.message || 'Error al obtener información de la cuenta.');
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  /**
   * Refresco total de datos sin recargar la página.
   * Se ejecuta tras cada operación exitosa (depósito, retiro o transferencia).
   */
  const refrescarDatos = useCallback(async () => {
    if (!cuentaId) return;
    try {
      // Refrescamos en paralelo la cuenta activa, el historial y la lista de cuentas
      const [datosCuenta, datosHistorial, listaCuentas] = await Promise.all([
        obtenerCuentaPorId(cuentaId),
        obtenerHistorial(cuentaId, 20),
        obtenerCuentas(),
      ]);
      setCuenta(datosCuenta);
      setHistorial(datosHistorial || []);
      if (Array.isArray(listaCuentas)) {
        setCuentas(listaCuentas);
      }
    } catch (err) {
      console.error('Error al refrescar información:', err);
      setErrorGlobal(err.message || 'Error al refrescar los datos.');
    }
  }, [cuentaId]);

  // Cargar cuentas al montar el componente
  useEffect(() => {
    let montado = true;
    (async () => {
      setCargando(true);
      const lista = await cargarListaCuentas();
      if (montado && lista && lista.length > 0) {
        // Seleccionamos la primera cuenta por defecto (ej. 1001)
        setCuentaId(lista[0].numeroCuenta);
      }
      if (montado) {
        setCargando(false);
      }
    })();

    return () => {
      montado = false;
    };
  }, [cargarListaCuentas]);

  // Recargar saldo e historial al cambiar de cuenta activa
  useEffect(() => {
    if (cuentaId) {
      cargarDatosCuenta(cuentaId);
    }
  }, [cuentaId, cargarDatosCuenta]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Barra de navegación con selector de cuenta */}
      <Navbar
        cuentas={cuentas}
        cuentaSeleccionadaId={cuentaId}
        alCambiarCuenta={(nuevoId) => setCuentaId(nuevoId)}
        cargando={cargando}
      />

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Banner de error global si el backend no responde */}
        {errorGlobal && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3 shadow-xs">
            <span className="font-bold text-lg leading-none mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="font-semibold">Problema de comunicación con el backend</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorGlobal}</p>
            </div>
            <button
              onClick={() => {
                if (cuentaId) {
                  cargarDatosCuenta(cuentaId);
                } else {
                  cargarListaCuentas();
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid principal de la aplicación */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Columna Izquierda: Tarjeta de Saldo y Formulario de Operaciones (5 columnas) */}
          <section className="lg:col-span-5 space-y-6">
            <SaldoCard
              cuenta={cuenta}
              cargando={cargando || cargandoDetalle}
            />

            <FormOperacion
              cuentaActivaId={cuentaId}
              cuentas={cuentas}
              onOperacionExitosa={refrescarDatos}
            />
          </section>

          {/* Columna Derecha: Historial de Transacciones (7 columnas) */}
          <section className="lg:col-span-7">
            <HistorialTransacciones
              transacciones={historial}
              cuentaActivaId={cuentaId}
              cargando={cargandoDetalle}
            />
          </section>

        </div>
      </main>

      {/* Pie de página informativo */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Sistema Web de Gestión Bancaria — Ingeniería Web</span>
          <span>Node.js • Express • MongoDB • React • Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
