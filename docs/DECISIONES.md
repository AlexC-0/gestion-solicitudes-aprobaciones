# Decisiones del Proyecto 02

Las reglas funcionales del [PROJECT_BRIEF](PROJECT_BRIEF.md) se conservan.
La sesión inicial fue documental; su actualización está publicada en `5ef10e5`.
El nuevo encargo autoriza la base fullstack ejecutable, dependencias locales y CI,
sin autenticación, solicitudes o persistencia. Los nuevos cambios siguen locales.

## Definido

| Decisión | Motivo | Límite |
| --- | --- | --- |
| Proyecto independiente, una organización ficticia | Separar alcance y datos del Proyecto 01 | Sin copiar código, bases, configuración ni scripts operativos |
| Roles excluyentes y permisos por relación | Separar solicitud y revisión | Sin administración de usuarios ni roles acumulados |
| Revisor por tipo, fijado al enviar | Asignación determinista controlada por backend | Sin elección arbitraria ni reasignación |
| Cinco estados y transiciones explícitas | Evitar resoluciones ambiguas | Terminales sin reapertura; contenido editable solo en borrador |
| Historial de creación y transiciones | Trazabilidad de decisiones | Sin versiones completas de ediciones ni modificación desde la aplicación |
| Transición y evento en una transacción | Consistencia y una resolución bajo concurrencia | El mecanismo SQL concreto queda pendiente |
| Sesión de ocho horas absolutas | Acotar la duración de acceso | Invalidación al salir y regeneración al acceder |
| Backend como autoridad | Evitar manipulación e impedir acceso ajeno | Sesión para identidad/rol; 404 fuera de ámbito |
| Sin reintentos automáticos de escrituras | Evitar repetir acciones sin confirmación | No se promete idempotencia no definida |

## Base fullstack: decisiones implementadas

- npm workspaces con @chamba/api y @chamba/web; raíz y workspaces privados.
  Un único lockfile raíz. .npmrc exige engines y guarda versiones exactas.
- Node.js >=24.13.0 <25 y npm >=11 <12. La API usa TypeScript estricto con NodeNext,
  imports .js y aplicación separada del arranque. Vite usa Bundler y JSX de React;
  no se fuerza la misma resolución de módulos en ambos workspaces.
- API_PORT=3000 y WEB_PORT=5173 por defecto; valores configurables por entorno,
  solo loopback. Vite rechaza puertos ocupados con strictPort.
- En desarrollo, /api se envía por proxy de Vite a Express. El frontend usa URLs
  relativas; no hay CORS abierto ni configuración con secretos.
- En compilado, npm start activa --serve-web y Express sirve apps/web/dist,
  resuelto respecto al módulo del servidor, no al directorio de trabajo.
  La API se resuelve antes de estáticos/fallback. /assets y archivos inexistentes
  son 404 JSON; el fallback solo admite navegación GET/HEAD que acepte HTML,
  sin extensión ni segmentos ocultos. Sintaxis Express 5: /{*path}.
- createServer(app) abre el puerto y registra disponibilidad solo si escucha.
  SIGINT/SIGTERM cierran el servidor y dan hasta cinco segundos a las conexiones;
  agotado el plazo se cierran las restantes y se indica fallo.
- concurrently coordina dev con --kill-others y comandos Node directos, evitando
  procesos npm por lotes anidados en Windows. Vite y tsx son herramientas de raíz.
  La API se ejecuta con tsx sin watch:
  la prueba con puerto ocupado mostró que el watcher mantenía vivo el proceso
  pese al fallo. Se prioriza un fallo claro y cierre conjunto; para editar backend
  se reinicia dev. Vite mantiene su recarga del frontend.
- TanStack Query realiza la consulta health con retry=false, sin refetch por foco
  o reconexión, y botón explícito. Se valida el JSON recibido; ni HTTP no exitoso
  ni contrato incorrecto se presentan como conexión correcta.
- Router tiene solo inicio y página no encontrada. Texto castellano, estados
  accesibles, foco visible y CSS adaptable. Health no significa disponibilidad total.
- CI mínima en ubuntu-latest/Node.js 24: npm ci, typecheck, test y build.
  contents: read, credenciales de checkout no persistidas y acciones fijadas por SHA.
  No hay bases, secretos, despliegues o jobs vacíos.

## Versiones seleccionadas y resueltas

Consulta al registro oficial npm, instalación y npm ls sin conflictos de peers.
Node.js 24.13.0 y npm 11.6.2 se comprobaron de nuevo en esta fase. El lockfile fija
también las versiones transitivas; no se usan --force o --legacy-peer-deps.

| Paquete | Versión |
| --- | --- |
| React / React DOM | 19.3.1 |
| React Router | 8.5.1 |
| TanStack React Query | 5.107.1 |
| Express | 5.3.0 |
| Vite / plugin React | 8.3.8 / 6.3.0 |
| TypeScript | 7.0.2 |
| Vitest | 4.1.12 |
| Supertest | 7.3.2 |
| Testing Library React / DOM | 16.3.3 / 10.4.2 |
| jest-dom / user-event | 7.0.1 / 14.6.10 |
| jsdom | 29.1.1 |
| tsx / concurrently | 4.23.15 / 10.0.7 |
| @types/node / @types/express | 24.19.2 / 5.0.6 |
| @types/react / @types/react-dom | 19.3.0 / 19.3.0 |
| @types/supertest | 7.2.1 |

Compatibilidad demostrada y ajustes:

- jsdom 30/31 exige Node 24.15 o superior dentro de la línea 24; se seleccionó
  jsdom 29.1.1, cuyo engine acepta 24.13.0. No se modifica Node.js del sistema.
- Vitest 5.1.0 y jest-dom 7.0.1 declaraban peers instalables pero chocaron en la
  extensión de tipos Assertion (TS2428). Se seleccionó Vitest 4.1.12, compatible
  con Vite 8 y Node 24; typecheck y pruebas pasan sin skipLibCheck ni parches de tipos.
- No se instalan pg, adaptador de sesiones, Argon2id, Zod ni Playwright: todavía no
  tienen uso en esta fase. PostgreSQL y demás decisiones funcionales siguen pendientes.

Acciones verificadas en sus releases oficiales:

- [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1):
  `3d3c42e5aac5ba805825da76410c181273ba90b1`.
- [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0):
  `949feb2413d6458794dcd2491c4babbbce0c15c1`.

Referencias técnicas consultadas: [rutas Express 5](https://expressjs.com/en/guide/migrating-5/),
[proxy y strictPort de Vite](https://vite.dev/config/server-options) y
[opciones predeterminadas de Query](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).
Las declaraciones de engines y peers se consultaron en el registro oficial npm;
la instalación estricta y la compilación validan la combinación elegida localmente.

## Pendiente antes de implementar el negocio

- Modelo de datos, IDs, restricciones, migraciones y bases propias separadas de
  desarrollo/pruebas; concretar representación del evento inicial y concurrencia.
- Adaptador de sesiones, paquete/parámetros Argon2id, estrategia CSRF incluido login,
  SameSite, límite de intentos y limpieza de sesiones/caché al cambiar de cuenta.
- Contratos HTTP de negocio y errores de transiciones, conservando el 404 fuera
  del ámbito visible y la prohibición de reintentos automáticos de escrituras.
- Conteo Unicode y tratamiento de espacios/HTML sin cambiar los límites definidos.
- Sentido de orden y contrato de paginación, conservando fecha/identificador,
  20 por defecto y máximo 100.
- Datos iniciales ficticios y provisión de credenciales sin versionarlas;
  respuesta ante ausencia de revisor válido para un tipo.
- Pruebas de persistencia, permisos y recorridos E2E cuando existan esas funciones.

Estas decisiones pendientes no autorizan su implementación en esta sesión.

## Git y publicaciones

Alex creó y publicó el repositorio público y su documentación inicial en
`c79177f`; la actualización documental posterior está publicada en
`5ef10e52dcaf1c5229eb4cc3fb87fc6a186f25e7`. El intento fallido de crear el remoto
por Codex es histórico y no representa un bloqueo actual.

La base fullstack de esta fase queda local, sin staging, commit o push. Esas
operaciones siguen reservadas a Alex desde GitHub Desktop. No se crea otro
repositorio ni se cambia origin. No hay despliegue. Resultados en [STATUS](STATUS.md).
