# Gestión de solicitudes y aprobaciones

Proyecto 02 de CHAMBA DIARIA. Base fullstack para una futura aplicación interna
con cuentas ficticias y solicitudes de material, software y formación.

## Estado actual

React/Vite y Express se comunican por HTTP real. La página inicial permite
comprobar la conexión, muestra carga, éxito o error y ofrece reintento manual.
También existe una vista de página no encontrada.

No hay autenticación, sesiones, roles implementados, solicitudes ni persistencia.
GET /api/health solo acredita que el proceso HTTP responde: no comprueba PostgreSQL
ni la disponibilidad completa del sistema. No hay despliegue.

## Requisitos e instalación

Node.js 24 (>=24.13.0 y <25) y npm 11. Versiones comprobadas localmente: Node.js
24.13.0 y npm 11.6.2. Los paquetes raíz/web/api son privados y comparten un único
package-lock.json. No necesitas PostgreSQL para esta fase.

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
al proceso con `API_PORT=3100 WEB_PORT=5174 npm run dev`. No se necesita .env ni se
ha configurado su carga automática; no hay variables secretas en esta fase.

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
La CI preparada ejecuta instalación, tipos, pruebas y build con Node.js 24 en
push a main y pull requests. Su ejecución remota queda pendiente de que Alex
publique esta entrega; no se da por aprobada por las comprobaciones locales.

La documentación anterior está publicada en `5ef10e5`. Los cambios de esta fase
fullstack quedan locales, sin staging, commit ni push por parte de Codex. Alex
realiza esas operaciones exclusivamente desde GitHub Desktop en el repositorio
[AlexC-0/gestion-solicitudes-aprobaciones](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones).

El proyecto es independiente del Proyecto 01. Bases de datos, migraciones,
autenticación y gestión de solicitudes siguen fuera de esta fase. La revisión
puntual en Chrome no equivale a una suite E2E de Playwright ni a una auditoría
completa de accesibilidad.

- [Definición funcional, sin cambios](docs/PROJECT_BRIEF.md).
- [Decisiones y asuntos pendientes](docs/DECISIONES.md).
- [Estado y comprobaciones reales](docs/STATUS.md).
- [Reglas de trabajo](AGENTS.md).
