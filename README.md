# Gestión de solicitudes y aprobaciones

Proyecto 02 de CHAMBA DIARIA: aplicación interna para solicitudes de material,
software y formación, con usuarios ficticios y roles separados.

El solicitante crea y edita borradores propios, los envía y puede cancelarlos.
El servidor asigna el responsable según el tipo. El revisor asignado aprueba con
comentario opcional o rechaza con motivo obligatorio. Autor y responsable consultan
el expediente y su historial; aprobada, rechazada y cancelada son terminales.
Filtros por estado, paginación y permisos se aplican también en el backend.

React/Vite, Express, TypeScript estricto, PostgreSQL 18 y sesiones PostgreSQL.
Sin registro público, administración, adjuntos, notificaciones, reasignación ni
despliegue. Alcance en [PROJECT_BRIEF](docs/PROJECT_BRIEF.md), aceptación en
[ACEPTACION-V1](docs/ACEPTACION-V1.md) y evidencias históricas/remotas en
[STATUS](docs/STATUS.md).

**V1 completada y verificada para el alcance funcional y de ejecución local
acordado**, sobre el commit
[9650ffbfcdd97e1d34f8049362edd1a2c8f802a2](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/commit/9650ffbfcdd97e1d34f8049362edd1a2c8f802a2)
y su [CI 43224311688 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43224311688).
149 pruebas correctas: 14 API, 50 frontend, 80 de integración con PostgreSQL y
5 E2E con Chromium sobre aplicación compilada y PostgreSQL real.
La aceptación y la evidencia remota verificadas fueron aportadas por Alex;
estos resultados corresponden a ese commit, no a la actualización documental posterior.
Sin despliegue, tag ni release. Las nuevas funcionalidades o ampliaciones requieren
otro encargo.

## Herramientas y comandos

Node.js 24 (>=24.13.0 y <25). Todas las operaciones npm usan 11.19.1 mediante
npx, sin modificar npm global. Un único package-lock.json para raíz y workspaces.
Playwright Test 1.65.0 requiere Node >=20 y se ejecuta con Node 24.

Los comandos siguientes parten de:

~~~powershell
cd C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones
~~~

## Primera preparación de un entorno nuevo — Windows

Solo para una copia que todavía NO tenga instancia propia ni .env. No uses esta
secuencia para reinicializar un entorno existente.

~~~powershell
npx --yes --package=npm@11.19.1 npm ci
npx --yes --package=npm@11.19.1 npm run db:local -- prepare
npx --yes --package=npm@11.19.1 npm run auth:configure
npx --yes --package=npm@11.19.1 npm run db:check
npx --yes --package=npm@11.19.1 npm run db:migrate
npx --yes --package=npm@11.19.1 npm run db:seed
~~~

Orden y efectos:

1. ci instala exactamente el lockfile.
2. prepare descarga PostgreSQL 18.6 en .local/postgres, prepara un cluster aislado
   sin servicio Windows, lo arranca en 127.0.0.1:55433 y crea roles ordinarios y
   bases separadas de desarrollo/pruebas. Genera .env privado con ambas URLs.
   No copies .env.example antes: prepare conserva y rechaza un .env preexistente.
3. auth:configure requiere ese .env y añade un secreto aleatorio estable y los
   orígenes de autenticación; conserva las variables existentes.
4. db:check comprueba la base de desarrollo y db:migrate aplica sus migraciones.
   Migraciones/seed no se ejecutan al arrancar HTTP.
5. db:seed crea usuarios/tipos ficticios y .local/seed-credentials.json privado.
   Si ya existen, verifica coincidencia sin sustituir contraseñas o asignaciones.

Si dispones de PostgreSQL externo, prepara previamente dos bases y roles propios
como describe [PERSISTENCIA](docs/PERSISTENCIA.md), configura las URLs privadas
usando .env.example como referencia y continúa con auth:configure, check, migrate
y seed. No apuntes pruebas a desarrollo: se exige el nombre exacto
gestion_solicitudes_aprobaciones_test.

La fase 08 verificó npm ci y migraciones repetidas sobre esquemas vacíos propios;
no repitió la instalación del cluster desde cero ni regeneró credenciales.

## Entorno ya preparado — desarrollo

~~~powershell
npx --yes --package=npm@11.19.1 npm run db:local -- status
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run dev
~~~

Abre http://127.0.0.1:5173/acceso. Vite envía /api a Express en 127.0.0.1:3000.
start conserva datos y no reinicializa. Si cambió el lockfile, ejecuta primero ci.
Tras cambios de backend, reinicia dev; el frontend mantiene recarga de Vite.

Consulta tus credenciales en el editor local, sin pegarlas en consola, capturas,
issues o Git:

~~~powershell
notepad.exe .local/seed-credentials.json
~~~

Solicitante Uno/Dos crean sus propios borradores. Material/software se asignan
a Revisor Uno y formación a Revisor Dos. Cierra sesión antes de cambiar de cuenta.
Un revisor ajeno no ve el expediente. Cancelar un borrador no lo hace visible;
cancelar una enviada conserva el acceso del responsable.

Para aprobar o rechazar: abre una pendiente en Bandeja de revisión, completa el
comentario opcional o motivo obligatorio y pulsa la confirmación explícita.
Escape o Volver sin resolver descarta la edición. Motivo: 10–1000 puntos de código;
comentario: hasta 1000, tras recorte exterior. Las decisiones no se reabren.
Ante 409 o red incierta, Actualizar detalle permite comprobar el resultado antes
de repetir; no hay reintentos automáticos de escrituras.

## Ejecución compilada

Detén dev antes de reutilizar el puerto 3000 y conserva PostgreSQL iniciado:

~~~powershell
npx --yes --package=npm@11.19.1 npm run build
npx --yes --package=npm@11.19.1 npm start
~~~

Abre http://127.0.0.1:3000/acceso. Express sirve HTML, assets y API en el mismo
origen. Las rutas API/assets desconocidas responden 404; el fallback HTML solo
atiende navegación. GET /api/health devuelve {"status":"ok"} y acredita únicamente
el proceso HTTP, no la disponibilidad de PostgreSQL ni del sistema completo.

## Puertos y autenticación

| Uso | Puerto | Origen que debe coincidir |
| --- | --- | --- |
| API en desarrollo | API_PORT=3000 | El navegador usa el origen Vite |
| Vite | WEB_PORT=5173 | AUTH_ORIGIN_DEV=http://127.0.0.1:5173 |
| Compilado | API_PORT=3000 | AUTH_ORIGIN_COMPILED=http://127.0.0.1:3000 |

Ejemplo alternativo en la misma terminal PowerShell:

~~~powershell
$env:API_PORT = '3100'
$env:WEB_PORT = '5174'
$env:AUTH_ORIGIN_DEV = 'http://127.0.0.1:5174'
$env:AUTH_ORIGIN_COMPILED = 'http://127.0.0.1:3100'
npx --yes --package=npm@11.19.1 npm run dev
~~~

Abre 127.0.0.1:5174; para el compilado, detén dev y ejecuta start en esa terminal,
abriendo 127.0.0.1:3100. Las variables del proceso prevalecen sobre .env.
SESSION_ALLOW_HTTP=true solo admite el uso local explícito fuera de producción.
SESSION_SECRET permanece privado y estable; no lo cambies para mover puertos.
No hay CORS abierto ni trust proxy. Vite no recibe las URLs de base ni el secreto.

## Pruebas y E2E

Con PostgreSQL propio iniciado:

~~~powershell
npx --yes --package=npm@11.19.1 npm ci
npx --yes --package=npm@11.19.1 npm run typecheck
npx --yes --package=npm@11.19.1 npm test
npx --yes --package=npm@11.19.1 npm run test:integration
npx --yes --package=npm@11.19.1 npm run build
npx --yes --package=npm@11.19.1 npm run e2e:install
npx --yes --package=npm@11.19.1 npm run test:e2e
~~~

e2e:install descarga Chromium de Playwright (no modifica Chrome personal).
En Linux/CI añade -- --with-deps para sus bibliotecas de sistema.
Integración y E2E crean/migran esquemas vacíos propios y los eliminan al terminar,
con current_database verificado antes de crear/limpiar. No necesitan db:seed,
db:migrate:test ni un servidor HTTP arrancado manualmente. No utilizan app,
usuarios ni contraseñas de desarrollo. E2E exige build previo, TEST_DATABASE_URL
y Chromium: su ausencia falla expresamente. Un worker, cero reintentos.

La CI conserva migraciones repetidas del runner, tipos, pruebas, integración y
build; después instala Chromium y ejecuta E2E. Configuración, cinco recorridos,
aislamiento y límites en [PRUEBAS](docs/PRUEBAS.md).

## Detener conservando datos

Ctrl+C detiene dev o start y libera HTTP/store/pool. Después:

~~~powershell
npx --yes --package=npm@11.19.1 npm run db:local -- stop
npx --yes --package=npm@11.19.1 npm run db:local -- status
~~~

No borres .local, .env ni el archivo de credenciales. No uses prepare/reset/initdb
en el entorno existente. No cierres procesos ajenos para liberar puertos.

## Organización y referencias

- apps/api/src y apps/web/src: aplicación y frontend.
- apps/api/tests y apps/web/tests: pruebas de API, componentes e integración.
- tests/e2e y playwright.config.ts: recorridos reproducibles con compilado.
- .github/workflows/ci.yml: controles de integración continua.
- [SOLICITUDES](docs/SOLICITUDES.md), [AUTENTICACION](docs/AUTENTICACION.md),
  [PERSISTENCIA](docs/PERSISTENCIA.md) y [DECISIONES](docs/DECISIONES.md): contratos.

Los tres avisos moderados transitivos de node-pg-migrate/glob/minimatch siguen
documentados en PRUEBAS/STATUS; no se aplicó audit fix --force. No se versionan
dependencias, compilados, .env, credenciales, informes, cookies ni estados del navegador.
Staging, commits y push corresponden exclusivamente a Alex desde GitHub Desktop.
