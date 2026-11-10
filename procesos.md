# Guía de Procesos Manuales y Ejecución Paso a Paso

Esta guía detalla de manera cronológica y sencilla todos los pasos manuales que debes ejecutar para inicializar, probar, exponer y versionar el sistema de gestión bancaria.

---

## 📑 Índice de Procesos
1. [Verificación del Entorno (Node.js y MongoDB)](#paso-1-verificación-del-entorno)
2. [Creación de Base de Datos y Colecciones en MongoDB Compass](#paso-2-creación-en-mongodb-compass)
3. [Instalación de Dependencias](#paso-3-instalación-de-dependencias)
4. [Ejecución del Seed (Población de Datos)](#paso-4-población-de-datos-seed)
5. [Levantamiento de los Servidores](#paso-5-levantamiento-de-los-servidores)
6. [Pruebas de la API REST (curl y Thunder Client)](#paso-6-pruebas-de-la-api-rest)
7. [Guion de Demostración para la Exposición](#paso-7-guion-de-demostración-para-la-exposición)
8. [Solución de Problemas Frecuentes](#paso-8-solución-de-problemas-frecuentes)
9. [Versionado con Git y Subida a GitHub / GitLab](#paso-9-versionado-con-git)

---

## Paso 1: Verificación del Entorno

Abre una terminal (PowerShell o CMD) y confirma que tienes instalado Node.js:

```bash
node -v
npm -v
```
*(Debe responder Node v20 o superior y npm v9 o superior).*

Asegúrate de que el servicio de **MongoDB** esté corriendo en tu equipo (puerto por defecto `27017`). Puedes abrir **MongoDB Compass** y presionar **Connect** en `mongodb://localhost:27017`.

---

## Paso 2: Creación en MongoDB Compass

1. Abre **MongoDB Compass**.
2. Conéctate a tu instancia local: `mongodb://127.0.0.1:27017` o `mongodb://localhost:27017`.
3. Haz clic en el botón **+ Create database** (o **Add Database**).
4. Configura los nombres:
   - **Database Name:** `banco_db`
   - **Collection Name:** `cuentas`
5. Haz clic en **Create Database**.
6. Dentro de `banco_db`, crea la segunda colección haciendo clic en **Create Collection**:
   - **Collection Name:** `transacciones`

### Documentos de Ejemplo en JSON (Opcional como referencia visual)

Si deseas insertar manualmente un documento de prueba en cada colección para validar la estructura:

> **Nota:** Se recomienda no insertar a mano; usar `npm run seed` en el siguiente paso.

#### En la colección `cuentas`:
```json
{
  "numeroCuenta": "1001",
  "titular": "Ana Torres",
  "saldo": 1500
}
```

#### En la colección `transacciones`:
```json
{
  "tipo": "deposito",
  "monto": 1500,
  "cuentaOrigen": null,
  "cuentaDestino": "1001"
}
```

> **Importante sobre MongoDB Compass:** Compass no se actualiza solo: después de cada operación en la app, vuelve a ejecutar la consulta (Find) o pulsa el botón de refrescar; si aparece un error, cierra y reabre la pestaña de la colección.

---

## Paso 3: Instalación de Dependencias

Abre una terminal en la raíz de la carpeta del proyecto `CuentaBancaria`:

```bash
# 1. Dependencias del Backend
cd server
npm install

# 2. Dependencias del Frontend
cd ../client
npm install
```

---

## Paso 4: Población de Datos (Seed)

Desde la carpeta `/server`, ejecuta el script de siembra para inicializar las cuentas y transacciones base:

> **Nota:** Cada cuenta inicia con un depósito de apertura igual a su saldo inicial, garantizando que el saldo siempre coincida matemáticamente con la suma de sus movimientos en el historial.

```bash
cd server
npm run seed
```

Verás una salida similar a esta:
```text
[Seed] Iniciando proceso de carga inicial de datos...
[Base de Datos] Conexión exitosa a MongoDB: banco_db en 127.0.0.1
[Seed] Vaciando colecciones cuentas y transacciones...
[Seed] Insertando cuentas de prueba...
[Seed] 4 cuentas creadas con éxito.
[Seed] Registrando depósitos de apertura...
[Seed] 4 depósitos de apertura registrados con éxito.

--- RESUMEN Y VERIFICACIÓN DE CUENTAS ---
- Cuenta 1001 | Titular: Ana Torres | Saldo: S/ 1500.00 | Balance Movimientos: S/ 1500.00 -> OK
- Cuenta 1002 | Titular: Luis Ramos | Saldo: S/ 800.00 | Balance Movimientos: S/ 800.00 -> OK
- Cuenta 1003 | Titular: María Quispe | Saldo: S/ 2500.00 | Balance Movimientos: S/ 2500.00 -> OK
- Cuenta 1004 | Titular: Carlos Huamán | Saldo: S/ 300.00 | Balance Movimientos: S/ 300.00 -> OK
-----------------------------------------
[Seed] Proceso completado exitosamente.
```

---

## Paso 5: Levantamiento de los Servidores

Para ejecutar la aplicación se necesitan **dos terminales abiertas simultáneamente**:

### Terminal 1: Backend
```bash
cd server
npm run dev
```
*(Deberás ver: `[Base de Datos] Conexión exitosa a MongoDB` y `[Servidor] Backend bancario corriendo en http://localhost:5000`)*

### Terminal 2: Frontend
```bash
cd client
npm run dev
```
*(Deberás ver: `VITE v6... ready in ... ms` y la URL local `http://localhost:3000`)*

Abre en tu navegador favorito: **`http://localhost:3000`**.

---

## Paso 6: Pruebas de la API REST

> **Nota para usuarios de Windows PowerShell:** En PowerShell, `curl` es un alias de `Invoke-WebRequest`. Debes escribir explícitamente `curl.exe` (por ejemplo `curl.exe -X GET http://localhost:5000/api/cuenta`) o utilizar extensiones gráficas como **Thunder Client** o **Postman**.

Puedes ejecutar estas pruebas en una terminal con `curl.exe` o importarlas en extensiones como **Thunder Client** o **Postman**.

### 1. Consultar lista general de cuentas (200 OK)
```bash
curl -X GET http://localhost:5000/api/cuenta
```

### 2. Consultar datos y saldo de una cuenta (200 OK)
```bash
curl -X GET http://localhost:5000/api/cuenta/1001
```

### 3. Consultar cuenta inexistente (404 Not Found)
```bash
curl -X GET http://localhost:5000/api/cuenta/9999
```
*Respuesta esperada:* `{"mensaje":"Cuenta no encontrada"}`

### 4. Realizar un depósito exitoso (201 Created)
```bash
curl -X POST http://localhost:5000/api/cuenta/deposito \
  -H "Content-Type: application/json" \
  -d "{\"cuentaId\": \"1001\", \"monto\": 250}"
```

### 5. Depósito con monto negativo o inválido (400 Bad Request)
```bash
curl -X POST http://localhost:5000/api/cuenta/deposito \
  -H "Content-Type: application/json" \
  -d "{\"cuentaId\": \"1001\", \"monto\": -50}"
```
*Respuesta esperada:* `{"mensaje":"El monto debe ser un valor positivo mayor a cero"}`

### 6. Realizar un retiro exitoso (201 Created)
```bash
curl -X POST http://localhost:5000/api/cuenta/retiro \
  -H "Content-Type: application/json" \
  -d "{\"cuentaId\": \"1001\", \"monto\": 100}"
```

### 7. Retiro con saldo insuficiente (400 Bad Request)
```bash
curl -X POST http://localhost:5000/api/cuenta/retiro \
  -H "Content-Type: application/json" \
  -d "{\"cuentaId\": \"1004\", \"monto\": 50000}"
```
*Respuesta esperada:* `{"mensaje":"Saldo insuficiente para realizar el retiro"}`

### 8. Realizar una transferencia exitosa (201 Created)
```bash
curl -X POST http://localhost:5000/api/cuenta/transferencia \
  -H "Content-Type: application/json" \
  -d "{\"cuentaOrigen\": \"1001\", \"cuentaDestino\": \"1002\", \"monto\": 150}"
```

### 9. Transferencia a la misma cuenta (400 Bad Request)
```bash
curl -X POST http://localhost:5000/api/cuenta/transferencia \
  -H "Content-Type: application/json" \
  -d "{\"cuentaOrigen\": \"1001\", \"cuentaDestino\": \"1001\", \"monto\": 100}"
```
*Respuesta esperada:* `{"mensaje":"No es posible realizar una transferencia a la misma cuenta"}`

### 10. Consultar historial de transacciones (200 OK)
```bash
curl -X GET "http://localhost:5000/api/cuenta/1001/historial?limit=10"
```

---

## Paso 7: Guion de Demostración para la Exposición

Sigue este guion paso a paso durante tu presentación universitaria para mostrar solvencia técnica:

1. **Introducción (30 seg):**
   - Presenta la aplicación: *"Hemos desarrollado un sistema web bancario full-stack con arquitectura desacoplada: Express con ESM y MongoDB en el backend, y React 18 con Vite y Tailwind CSS v4 en el frontend."*
2. **Explicación del Navbar y Saldo (1 min):**
   - Muestra el selector de cuenta activa en la barra superior.
   - Selecciona la cuenta `1001 - Ana Torres`.
   - Señala la tarjeta de saldo: se formatea en soles peruanos con `Intl.NumberFormat('es-PE', { currency: 'PEN' })`.
3. **Demostración de Depósito (1 min):**
   - En la pestaña *Depósito*, ingresa `S/ 500.00` y haz clic en *Confirmar Depósito*.
   - Muestra cómo el saldo se incrementa de inmediato a `S/ 2,000.00` y en la tabla inferior aparece el nuevo movimiento en color verde (`+ S/ 500.00`) **sin recargar la página**.
4. **Demostración de Retiro y Validación de Saldo Negativo (1.5 min):**
   - Cambia a la pestaña *Retiro*.
   - Intenta retirar un monto superior al disponible (ej: `S/ 99,999.00`).
   - Muestra el mensaje de error devuelto por la API con código HTTP `400`: *"Saldo insuficiente para realizar el retiro"*.
   - Ahora retira un monto válido (ej: `S/ 200.00`) y muestra el débito inmediato.
5. **Demostración de Transferencia y Consistencia (2 min):**
   - Ve a la pestaña *Transferencia*.
   - Selecciona como destino la cuenta `1002 - Luis Ramos` y transfiere `S/ 300.00`.
   - Explica la decisión técnica: *"Implementamos un patrón de débito condicionado y compensación (Saga simple). Si la cuenta de destino o el registro fallaran, el débito se revierte automáticamente, protegiendo los fondos."*
   - Cambia el selector superior a la cuenta `1002 - Luis Ramos`: muestra cómo el saldo de Luis aumentó en `S/ 300.00` y en su historial aparece clasificado como `Transferencia Recibida (+ S/ 300.00)` en color verde.
6. **Diseño Responsivo (30 seg):**
   - Abre las herramientas de desarrollador (`F12`), activa el modo dispositivo móvil y demuestra cómo la tarjeta, el formulario y la tabla de historial se adaptan con scroll horizontal.

---

## Paso 8: Solución de Problemas Frecuentes

### 1. `ECONNREFUSED 127.0.0.1:27017`
- **Causa:** El servicio de MongoDB no está ejecutándose en tu computadora.
- **Solución:**
  - Presiona `Win + R`, escribe `services.msc` y presiona Enter.
  - Busca el servicio llamado **MongoDB Server (MongoDB)**.
  - Haz clic derecho y selecciona **Iniciar** o **Reiniciar**.
  - Confirma la conexión abriendo MongoDB Compass.

### 2. `Error: listen EADDRINUSE: address already in use :::5000`
- **Causa:** Otro proceso está utilizando el puerto 5000 (común si dejaste un proceso de Node anterior o AirPlay en Mac / servicios de Windows).
- **Solución:**
  - En PowerShell, busca qué proceso ocupa el puerto:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
    ```
  - Finaliza el proceso o cambia el puerto en `/server/.env` (por ejemplo `PORT=5001`) y ajusta el proxy en `/client/vite.config.js`.

### 3. Error en el Proxy de Vite (`/api` devuelve 504 o ECONNREFUSED)
- **Causa:** El cliente está corriendo pero el backend en el puerto 5000 está apagado.
- **Solución:**
  - Verifica que la Terminal 1 (Backend) esté activa y sin errores.
  - Asegúrate de que `http://localhost:5000/api/health` responda `{"estado":"ok"}`.

### 4. Estilos de Tailwind no se aplican
- **Causa:** Falta de importación en `index.css` o configuración de plugin.
- **Solución:**
  - Confirma que en `/client/src/index.css` exista la directiva exacta: `@import "tailwindcss";`.
  - Confirma que en `/client/vite.config.js` esté importado `@tailwindcss/vite` dentro del arreglo `plugins: [react(), tailwindcss()]`.

---

## Paso 9: Versionado con Git y Subida a Repositorio

Sigue estos comandos para inicializar Git, hacer tu primer commit y subir el proyecto sin incluir credenciales ni carpetas pesadas:

### 1. Inicializar repositorio local
En la raíz de la carpeta `CuentaBancaria`:
```bash
git init
```

### 2. Comprobar que `.env` y `node_modules` están ignorados
Ejecuta:
```bash
git status
```
> **VERIFICACIÓN CRÍTICA:** Confirma que en la lista de archivos por agregar **NO** aparezcan `node_modules/`, `server/.env` ni `client/dist/`. Sí debe aparecer `.env.example`.

### 3. Agregar los archivos al área de preparación
```bash
git add .
```

### 4. Crear el commit inicial
```bash
git commit -m "feat: implementacion inicial del sistema bancario full-stack (Express + MongoDB + React + Tailwind)"
```

### 5. Vincular a tu repositorio remoto (GitHub o GitLab)
Crea un nuevo repositorio vacío en GitHub o GitLab (sin README ni .gitignore iniciales) y ejecuta:

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```
