# Gestión de solicitudes y aprobaciones

Proyecto 02 de CHAMBA DIARIA. Base fullstack para una futura aplicación interna
con cuentas ficticias y solicitudes de material, software y formación.

## Estado actual

React/Vite y Express se comunican por HTTP real. La página inicial permite
comprobar la conexión, muestra carga, éxito o error y ofrece reintento manual.
También existe una vista de página no encontrada.

Hay esquema PostgreSQL, migraciones, pool/transacciones y seed ficticio con roles.
No hay autenticación, sesiones, autorización ni gestión funcional de solicitudes.
GET /api/health solo acredita que el proceso HTTP responde: no comprueba PostgreSQL
ni la disponibilidad completa del sistema. No hay despliegue.

## Requisitos e instalación

Node.js 24 (>=24.13.0 y <25) y npm 11. Versiones comprobadas localmente: Node.js
24.13.0 y npm 11.6.2. Los paquetes raíz/web/api son privados y comparten un único
package-lock.json. PostgreSQL es necesario para persistencia e integración; la
pantalla inicial, health y npm test funcionan sin él.

Desde PowerShell, en la carpeta del proyecto:

```powershell
cd C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. Vite sirve la interfaz y envía las peticiones relativas
/api a Express en http://127.0.0.1:3000. No se habilita CORS abierto.

El frontend se actualiza al editarlo mediante Vite. Para aplicar cambios del
backend, detén y vuelve a ejecutar npm run dev. Ctrl+C detiene los dos procesos;
si Windows pregunta si deseas terminar un trabajo por lotes, confirma con S.
Si un proceso termina, concurrently detiene el otro.

## Comandos desde la raíz

| Comando | Función |
| --- | --- |
| npm ci | Instalar las versiones del lockfile |
| npm run dev | Arrancar API y Vite conjuntamente |
| npm run typecheck | Comprobar tipos estrictos de código, configuración y pruebas |
| npm test | Ejecutar y finalizar las pruebas de ambos workspaces, sin watch |
| npm run build | Compilar API y generar el frontend estático |
| npm start | Ejecutar la API compilada y servir el frontend compilado |

## Puertos y configuración

| Variable de entorno | Valor predeterminado | Uso |
| --- | --- | --- |
| API_PORT | 3000 | Puerto de Express en desarrollo/compilado y destino del proxy Vite |
| WEB_PORT | 5173 | Puerto de Vite, solo en desarrollo |

Ambos procesos escuchan únicamente en 127.0.0.1. Los puertos deben ser enteros
entre 1 y 65535. Vite usa strictPort: no elige otro puerto silenciosamente.
Si un puerto está ocupado, cambia la variable o detén tu propio proceso anterior;
no es necesario cerrar procesos ajenos.

Ejemplo con otros puertos, en la misma terminal desde la raíz:

```powershell
$env:API_PORT = '3100'
$env:WEB_PORT = '5174'
npm run dev
```

Abre http://127.0.0.1:5174 en ese caso. En Linux/macOS se pueden pasar las variables
al proceso con `API_PORT=3100 WEB_PORT=5174 npm run dev`. Los scripts HTTP
siguen tomando los puertos del entorno. Los comandos de persistencia e integración
cargan .env raíz mediante Node; variables ya definidas en la terminal tienen prioridad.
DATABASE_URL y TEST_DATABASE_URL son privadas y nunca se exponen con VITE_.

## Ejecución local compilada

Detén primero el desarrollo si vas a reutilizar su puerto API. Desde la raíz:

```powershell
npm run typecheck
npm test
npm run build
npm start
```

Abre http://127.0.0.1:3000, o el puerto que hayas conservado en API_PORT. Ahora el
navegador recibe HTML, CSS, JavaScript y /api desde Express bajo el mismo origen;
Vite no interviene. Esto es ejecución local compilada, no un despliegue.

Puedes comprobar la respuesta HTTP real con:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/health
```

El contrato es HTTP 200 y JSON `{"status":"ok"}`. Las rutas /api desconocidas
responden 404 JSON; nunca devuelven el index.html del frontend. Los assets o
archivos inexistentes también responden 404. Una navegación HTML a una ruta sin
extensión recibe el frontend y React Router muestra su vista de ruta no encontrada.
Los errores inesperados devuelven JSON genérico sin stack ni detalles internos.

## Organización

```text
apps/api/src/          Aplicación Express, errores, configuración y arranque
apps/api/tests/        Pruebas HTTP, configuración y fallo de arranque
apps/web/src/          Interfaz, consulta HTTP y estilos
apps/web/tests/        Pruebas de estados, reintento y navegación
.github/workflows/     CI inicial
docs/                 Alcance, decisiones y resultados
```

Backend: Express, TypeScript estricto/NodeNext e imports internos .js. Frontend:
React, React Router, TanStack Query, Vite y configuración TypeScript Bundler.
La consulta no reintenta automáticamente ni al cambiar el foco o reconectar;
el usuario puede volver a comprobar con el botón. No se muestran datos simulados.
Versiones concretas y motivos en [DECISIONES](docs/DECISIONES.md).

## Validación, publicación y límites

Las comprobaciones locales y su alcance están en [STATUS](docs/STATUS.md).
La fase fullstack está publicada en b45c3f12998a76e00263e27de054ef7962ced9a7;
Alex verificó su [CI 43191106078](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43191106078)
con SUCCESS y 15 pruebas. Ese resultado pertenece solo a ese commit.
La CI ampliada con PostgreSQL requiere publicación manual y su propia ejecución.
Todos los cambios de persistencia quedan locales, sin staging, commit ni push por
Codex. Alex realiza esas operaciones desde GitHub Desktop.

El proyecto tiene entorno PostgreSQL propio e independiente del Proyecto 01.
Autenticación, permisos y gestión de solicitudes siguen pendientes. No hay despliegue.

## Persistencia local — Windows

Desde la raíz, después de npm ci:

```powershell
npm run db:local -- status
npm run db:local -- prepare
npm run db:local -- start
npm run db:check
npm run db:migrate
npm run db:seed
npm run db:check:test
npm run db:migrate:test
npm run test:integration
npm run db:local -- stop
```

prepare descarga PostgreSQL 18.6 de EDB si hace falta, crea el entorno exclusivamente
en .local/postgres y genera .env privado. La primera preparación arranca el servidor;
start es repetible. Un entorno preparado no se reinicializa. Si 55433 está ocupado,
usa `npm run db:local -- prepare --port=55434` antes de crear el entorno.
No altera servicios globales ni PATH. Conserva los datos al detenerlo.

| Comando | Destino y resultado |
| --- | --- |
| npm run db:check | Comprueba conexión e identidad de la base de desarrollo |
| npm run db:migrate | Aplica migraciones pendientes en desarrollo |
| npm run db:seed | Prepara 2 solicitantes, 2 revisores y 3 tipos; no crea solicitudes |
| npm run db:check:test | Comprueba identidad de la base de pruebas |
| npm run db:migrate:test | Aplica migraciones en app de la base de pruebas |
| npm run test:integration | 16 pruebas con esquemas nuevos propios y PostgreSQL real |
| npm run db:local -- status/start/stop | Consulta/inicia/detiene solo la instancia propia |

Contraseñas ficticias iniciales: `.local/seed-credentials.json`, archivo privado.
No se imprimen ni versionan. Repetir seed conserva hashes, roles y asignaciones;
si detecta conflictos falla sin sobrescribirlos. No borres ese archivo para regenerarlas.
La integración exige TEST_DATABASE_URL; también usa DATABASE_URL para verificar
que el destino de desarrollo se rechaza antes de crear esquemas. Ambas están en .env.
No se ejecutan migraciones ni seed automáticamente desde la API.

Consulta [PERSISTENCIA](docs/PERSISTENCIA.md) para esquema, límites SQL, configuración,
auth SCRAM, permisos, procedimientos y alcance de las pruebas.

- [Definición funcional, sin cambios](docs/PROJECT_BRIEF.md).
- [Decisiones y asuntos pendientes](docs/DECISIONES.md).
- [Estado y comprobaciones reales](docs/STATUS.md).
- [Reglas de trabajo](AGENTS.md).
