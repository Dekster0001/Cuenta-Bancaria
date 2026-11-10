# Sistema de Gestión de Cuenta Bancaria Simplificada

Sistema web full-stack para la gestión de cuentas bancarias de ahorro, desarrollado con fines académicos para la asignatura de **Ingeniería Web**. El sistema permite consultar saldos, realizar depósitos, retiros con validación estricta de saldo y transferencias inmediatas entre cuentas con reversión automática (compensación), manteniendo un historial detallado de movimientos.

---

## 🛠️ Stack Tecnológico

### Backend
- **Entorno de ejecución:** Node.js (v20+ recomendado, compatible con ES Modules `"type": "module"`).
- **Framework web:** Express.js 4.x.
- **Base de datos:** MongoDB Local gestionado mediante **Mongoose ORM**.
- **Configuración y Seguridad:** `dotenv` para variables de entorno, `cors` para habilitar peticiones seguras de origen cruzado.

### Frontend
- **Biblioteca principal:** React 18 (Componentes funcionales, JSX puro, hooks `useState`, `useEffect`, `useCallback`).
- **Empaquetador y Servidor de desarrollo:** Vite con proxy integrado para `/api`.
- **Estilos:** Tailwind CSS v4 integrado con `@tailwindcss/vite` y `@import "tailwindcss";`.
- **Comunicación HTTP:** API nativa `fetch` (sin dependencias adicionales).

---

## 📁 Estructura del Proyecto

```text
CuentaBancaria/
├── .gitignore                      # Reglas de exclusión de Git (node_modules, .env, dist)
├── README.md                       # Documentación principal del sistema
├── procesos.md                     # Guía paso a paso de configuración y pruebas manuales
│
├── server/                         # Backend (API REST Node.js + Express)
│   ├── .env                        # Variables de entorno locales (ignorado por Git)
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── package.json                # Scripts y dependencias del backend
│   └── src/
│       ├── config/
│       │   └── db.js               # Conexión a MongoDB local con Mongoose
│       ├── controllers/
│       │   └── cuentaController.js # Lógica de negocio (saldo, depósito, retiro, transferencia, historial)
│       ├── models/
│       │   ├── Cuenta.js           # Esquema de Cuenta bancaria
│       │   └── Transaccion.js      # Esquema de Transacciones (colección fija 'transacciones')
│       ├── routes/
│       │   └── cuentaRoutes.js     # Definición de rutas fijas y dinámicas
│       ├── utils/
│       │   └── helpers.js          # Sanitización contra NoSQL injection y redondeo de montos
│       ├── index.js                # Punto de entrada del servidor Express
│       └── seed.js                 # Script de inicialización y carga de datos de prueba
│
└── client/                         # Frontend (React 18 + Vite + Tailwind v4)
    ├── index.html                  # Plantilla HTML base
    ├── package.json                # Dependencias del cliente
    ├── vite.config.js              # Configuración de Vite, Tailwind v4 y proxy a localhost:5000
    └── src/
        ├── main.jsx                # Montaje de React en el DOM
        ├── App.jsx                 # Componente raíz y estado global de la aplicación
        ├── index.css               # Estilos globales (@import "tailwindcss";)
        ├── components/
        │   ├── Navbar.jsx          # Barra superior y selector dinámico de cuenta activa
        │   ├── SaldoCard.jsx       # Tarjeta de saldo y titular formateado en Soles (PEN)
        │   ├── FormOperacion.jsx   # Pestañas y formularios de Depósito, Retiro y Transferencia
        │   └── HistorialTransacciones.jsx # Tabla de movimientos con scroll y badges
        └── services/
            └── api.js              # Cliente de consumo de endpoints con fetch nativo
```

---

## 📋 Requisitos Previos

1. **Node.js**: Versión 20.x o superior instalada.
2. **MongoDB Local**: Servicio de base de datos MongoDB ejecutándose localmente en el puerto `27017`.
3. **MongoDB Compass**: Interfaz gráfica para verificar colecciones y documentos.

---

## ⚙️ Instalación y Configuración

### 1. Variables de Entorno del Backend
En la carpeta `/server`, verifica o crea el archivo `.env` basándote en `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/banco_db
```

### 2. Instalación de Dependencias

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

---

## 🌱 Carga de Datos Iniciales (Seed)

Para vaciar la base de datos y cargar las cuentas y movimientos de prueba universitarios:

```bash
cd server
npm run seed
```

### Cuentas creadas por el Seed:
| Número de Cuenta | Titular | Saldo Inicial |
| :---: | :---: | :---: |
| **1001** | Ana Torres | S/ 1,500.00 |
| **1002** | Luis Ramos | S/ 800.00 |
| **1003** | María Quispe | S/ 2,500.00 |
| **1004** | Carlos Huamán | S/ 300.00 |

---

## 🚀 Ejecución del Sistema

Se requiere ejecutar tanto el backend como el frontend en terminales separadas:

### Terminal 1 - Backend (Puerto 5000)
```bash
cd server
npm run dev
```
> Utiliza `node --watch` para recargar automáticamente ante cualquier cambio de código.

### Terminal 2 - Frontend (Puerto 3000)
```bash
cd client
npm run dev
```
Abre tu navegador en: [http://localhost:3000](http://localhost:3000).

---

## 📡 Especificación de la API REST

Base URL: `http://localhost:5000/api/cuenta`

| Método | Endpoint | Descripción | Body (JSON) | Código Exitoso |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/cuenta` | Lista todas las cuentas disponibles | Ninguno | `200 OK` |
| `GET` | `/api/cuenta/:id` | Datos y saldo de una cuenta (`:id` es el número) | Ninguno | `200 OK` |
| `POST` | `/api/cuenta/deposito` | Deposita fondos a la cuenta indicada | `{"cuentaId": "1001", "monto": 200}` | `201 Created` |
| `POST` | `/api/cuenta/retiro` | Retira fondos impidiendo saldo negativo | `{"cuentaId": "1001", "monto": 100}` | `201 Created` |
| `POST` | `/api/cuenta/transferencia` | Transfiere entre dos cuentas con reversión | `{"cuentaOrigen": "1001", "cuentaDestino": "1002", "monto": 150}` | `201 Created` |
| `GET` | `/api/cuenta/:id/historial` | Últimos movimientos de la cuenta (`?limit=20`) | Ninguno | `200 OK` |

### Formato de Respuestas de Error
Todas las respuestas de error siguen el estándar:
```json
{
  "mensaje": "Descripción legible del motivo del error"
}
```

---

## 🚦 Códigos de Estado HTTP y Reglas de Negocio

| Código | Significado | Escenarios de Aplicación |
| :---: | :--- | :--- |
| **200** | OK | Consulta exitosa de lista de cuentas, cuenta individual o historial. |
| **201** | Created | Depósito, retiro o transferencia registrados exitosamente en la base de datos. |
| **400** | Bad Request | - Monto no numérico, cero, negativo o ausente.<br>- Campos obligatorios ausentes en el body.<br>- Intento de transferir a la misma cuenta.<br>- **Saldo insuficiente** para retiro o transferencia.<br>- Formato JSON malformado o inválido. |
| **404** | Not Found | - Cuenta consultada inexistente.<br>- Cuenta de origen o destino inexistente en una transferencia.<br>- Endpoint de la API no reconocido. |
| **500** | Internal Server Error | Falla no controlada del servidor o fallo de persistencia. El servidor captura el error y responde con mensaje genérico sin exponer detalles internos o de infraestructura al cliente. |

---

## 💡 Decisiones Técnicas y Arquitectura

### 1. Transferencia Atómica mediante Compensación (Saga Pattern)
- **Contexto:** En instalaciones estándar locales de MongoDB (Standalone), las transacciones multi-documento (`session.startTransaction()`) **no están habilitadas**, ya que MongoDB exige por diseño que el servidor pertenezca a un *Replica Set*.
- **Solución implementada:** Se diseñó un flujo de débito condicionado + crédito + registro con mecanismo de compensación:
  1. Se debita la cuenta de origen usando la operación atómica `findOneAndUpdate` filtrando con `{ saldo: { $gte: monto } }`. Si el saldo no alcanza, la operación se cancela de inmediato.
  2. Se acredita la cuenta de destino con `$inc`. Si este paso llegara a fallar, el bloque de compensación revierte el débito en la cuenta de origen.
  3. Se registra el documento en la colección `transacciones`. Si ocurre un fallo en el guardado, se revierten ambos saldos.
  4. Esto asegura la consistencia de los saldos incluso ante desconexiones o fallos imprevistos.

### 2. Prevención de Inyección de Operadores NoSQL
- Para evitar que un usuario malintencionado envíe objetos de consulta en lugar de cadenas de texto (como `{"cuentaId": {"$ne": null}}`), todos los identificadores son limpiados y convertidos forzosamente a tipo primitivo `String` plano mediante la función de utilidad `sanitizarCuentaId()` antes de interactuar con Mongoose.

### 3. Precisión Monetaria
- Para prevenir los clásicos errores de coma flotante de JavaScript (por ejemplo `0.1 + 0.2 = 0.30000000000000004`), todos los montos recibidos son normalizados y redondeados a 2 decimales usando `Math.round((monto + Number.EPSILON) * 100) / 100`.

### 4. React Reactivo sin Recargas de Página
- La aplicación gestiona su estado mediante hooks de React (`useState`, `useEffect`, `useCallback`). Cuando se ejecuta una transacción exitosa en `FormOperacion`, se dispara el callback `refrescarDatos()` que actualiza el estado de la cuenta, del historial y del selector sin provocar un refresco completo del navegador (`window.location.reload()`).
