# Gestión de solicitudes y aprobaciones

Proyecto 02 de CHAMBA DIARIA. Base fullstack para una futura aplicación interna
con cuentas ficticias y solicitudes de material, software y formación.

## Estado actual

React/Vite y Express se comunican por HTTP real. La página inicial permite
comprobar la conexión, muestra carga, éxito o error y ofrece reintento manual.
También existe una vista de página no encontrada.

Hay esquema PostgreSQL, migraciones, pool/transacciones y seed ficticio con roles.
Hay acceso real, sesiones PostgreSQL, CSRF y cierre de sesión. La autorización
por rol y autor permite crear, listar, consultar y editar borradores propios,
enviarlos con asignación automática y cancelarlos. Los revisores consultan únicamente
las solicitudes enviadas que tienen asignadas, también tras su cancelación.
GET /api/health solo acredita que el proceso HTTP responde: no comprueba PostgreSQL
ni la disponibilidad completa del sistema. No hay despliegue.

## Requisitos e instalación

Node.js 24 (>=24.13.0 y <25) y npm 11.19.1 para instalar o modificar dependencias.
Validación local: Node 24.13.0 con npm 11.19.1 temporal. CI fija Node 24.22.2 y
ejecuta npm 11.19.1 explícitamente mediante npx, sin depender del npm incluido. Los paquetes raíz/web/api son privados y comparten un único
package-lock.json. PostgreSQL es necesario para persistencia e integración; la
pantalla inicial, health y npm test funcionan sin él. La autenticación requiere
PostgreSQL disponible; el Backend exige configuración válida aunque health no lo consulte.

El npm global puede conservarse. npx ejecuta temporalmente la versión indicada;
no instala herramientas globales. Usa también ese prefijo para futuras operaciones
npm install sobre dependencias, conservando las versiones directas acordadas.
packageManager documenta la versión y el workflow comprueba que coincide con la
que ejecuta efectivamente. No basta con cambiar ese campo para cambiar la herramienta.

Para la primera configuración de una copia nueva, prepara autenticación y migraciones.
Si ya tienes la fase 04, usa directamente el apartado «Borradores propios» del final:

```powershell
cd C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones
npx --yes --package=npm@11.19.1 npm ci
npx --yes --package=npm@11.19.1 npm run auth:configure
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run db:migrate
npx --yes --package=npm@11.19.1 npm run dev
```

Abre http://127.0.0.1:5173. Vite sirve la interfaz y envía las peticiones relativas
/api a Express en http://127.0.0.1:3000. No se habilita CORS abierto.

El frontend se actualiza al editarlo mediante Vite. Para aplicar cambios del
backend, detén y vuelve a ejecutar npm run dev. Ctrl+C detiene los dos procesos;
si Windows pregunta si deseas terminar un trabajo por lotes, confirma con S.
Si un proceso termina, concurrently detiene el otro.

## Comandos desde la raíz

En las tablas se abrevian los scripts como npm run; ejecútalos siempre con el
prefijo npx --yes --package=npm@11.19.1 npm, como en los ejemplos.

| Comando | Función |
| --- | --- |
| npx --yes --package=npm@11.19.1 npm ci | Instalar el lockfile con la versión de npm fijada |
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
npx --yes --package=npm@11.19.1 npm run dev
```

Abre http://127.0.0.1:5174 en ese caso. En Linux/macOS se pueden pasar las variables
al proceso con `API_PORT=3100 WEB_PORT=5174 npm run dev`. Los scripts HTTP
siguen tomando los puertos del entorno. Los comandos de persistencia e integración
cargan .env raíz mediante Node; variables ya definidas en la terminal tienen prioridad.
DATABASE_URL y TEST_DATABASE_URL son privadas y nunca se exponen con VITE_.

## Ejecución local compilada

Detén primero el desarrollo si vas a reutilizar su puerto API. Desde la raíz:

```powershell
npx --yes --package=npm@11.19.1 npm run typecheck
npx --yes --package=npm@11.19.1 npm test
npx --yes --package=npm@11.19.1 npm run build
npx --yes --package=npm@11.19.1 npm start
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
La persistencia quedó cerrada en ff60200f8dbbafbcb10acea2f2293c4fd8584899 con
[CI 43199015562 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43199015562):
instalación, bootstrap, tipos, migraciones, 15 pruebas existentes, 16 de integración y build.
La fase 04 quedó publicada en 36806c81f5dfcf9990c52e5168bdcb9932d77ad2 con
[CI 43202926347 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43202926347),
según Alex: instalación, tipos, migraciones, build y 64 pruebas.
La fase 05 quedó publicada en 7571f83952103dce1f54a3a94755a661b21fb749, con
[CI 43207099040 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43207099040)
y 88 pruebas según Alex. La fase 06 queda local; su CI está pendiente de publicación manual.

El proyecto tiene entorno PostgreSQL propio e independiente del Proyecto 01.
Borradores, envío, cancelación y consulta del revisor están implementados; aprobación y rechazo siguen pendientes. No hay despliegue.

## Primera preparación de una copia nueva — Windows

Solo para un entorno nuevo. No ejecutes prepare ni regeneres credenciales en la instancia existente.
Desde la raíz, después de la instalación con npm 11.19.1:

```powershell
npx --yes --package=npm@11.19.1 npm run db:local -- status
npx --yes --package=npm@11.19.1 npm run db:local -- prepare
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run db:check
npx --yes --package=npm@11.19.1 npm run db:migrate
npx --yes --package=npm@11.19.1 npm run db:seed
npx --yes --package=npm@11.19.1 npm run db:check:test
npx --yes --package=npm@11.19.1 npm run db:migrate:test
npx --yes --package=npm@11.19.1 npm run test:integration
npx --yes --package=npm@11.19.1 npm run db:local -- stop
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
| npm run test:integration | Persistencia, autenticación y borradores con PostgreSQL real y esquemas exclusivos |
| npm run db:local -- status/start/stop | Consulta/inicia/detiene solo la instancia propia |

Contraseñas ficticias iniciales: `.local/seed-credentials.json`, archivo privado.
No se imprimen ni versionan. Repetir seed conserva hashes, roles y asignaciones;
si detecta conflictos falla sin sobrescribirlos. No borres ese archivo para regenerarlas.
La integración exige TEST_DATABASE_URL; también usa DATABASE_URL para verificar
que el destino de desarrollo se rechaza antes de crear esquemas. Ambas están en .env.
No se ejecutan migraciones ni seed automáticamente desde la API.
La nueva tabla sesiones se prepara mediante db:migrate; no se modifica la migración inicial.

Consulta [PERSISTENCIA](docs/PERSISTENCIA.md) para esquema, límites SQL, configuración,
auth SCRAM, permisos, procedimientos y alcance de las pruebas.

- [Definición funcional, sin cambios](docs/PROJECT_BRIEF.md).
- [Decisiones y asuntos pendientes](docs/DECISIONES.md).
- [Estado y comprobaciones reales](docs/STATUS.md).
- [Reglas de trabajo](AGENTS.md).

## Autenticación — entorno ya preparado

Desde la raíz; no vuelvas a preparar ni reinicializar el cluster existente:

```powershell
npx --yes --package=npm@11.19.1 npm ci
npx --yes --package=npm@11.19.1 npm run auth:configure
npx --yes --package=npm@11.19.1 npm run db:local -- status
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run db:migrate
npx --yes --package=npm@11.19.1 npm run dev
```

Abre http://127.0.0.1:5173/acceso. Usa una cuenta ficticia de tu archivo privado
.local/seed-credentials.json; no copies sus contraseñas a capturas o incidencias.
/ conserva la página técnica y /cuenta muestra nombre/rol reales. La gestión de
solicitudes no forma parte de esta pantalla.

auth:configure añade a .env existente únicamente variables ausentes, incluido un
SESSION_SECRET aleatorio, y nunca imprime valores. No sustituye un valor existente
inválido. Conserva los permisos privados del archivo; no copies placeholders como
secretos. AUTH_ORIGIN_DEV=http://127.0.0.1:5173 y AUTH_ORIGIN_COMPILED=http://127.0.0.1:3000
son distintos. Si cambias puertos, actualiza también el origen correspondiente.
SESSION_ALLOW_HTTP=true permite solo desarrollo loopback; bajo HTTPS la cookie es
Secure. No se confía en proxies ni en Host para decidir orígenes permitidos.

Para servir compilados, detén dev con Ctrl+C y ejecuta npm run build y npm start;
abre http://127.0.0.1:3000/acceso. El Backend carga .env y sirve interfaz/API bajo
el mismo origen; Vite no carga ese archivo privado. El secreto debe permanecer
estable para recuperar sesiones tras reiniciar API.

Para comprobar la fase:

```powershell
npx --yes --package=npm@11.19.1 npm run typecheck
npx --yes --package=npm@11.19.1 npm test
npx --yes --package=npm@11.19.1 npm run build
npx --yes --package=npm@11.19.1 npm run db:check
npx --yes --package=npm@11.19.1 npm run db:check:test
npx --yes --package=npm@11.19.1 npm run db:migrate:test
npx --yes --package=npm@11.19.1 npm run test:integration
npx --yes --package=npm@11.19.1 npm run db:local -- stop
```

Contrato, cookies, CSRF, caducidad, límites y condiciones de error en
[AUTENTICACION](docs/AUTENTICACION.md). Los resultados reales y las limitaciones
siguen en [STATUS](docs/STATUS.md); no son una auditoría exhaustiva de seguridad.

## Borradores propios — fase 05

Con el entorno existente no vuelvas a preparar el cluster, migrar de nuevo ni
generar credenciales para esta fase: no se añade ninguna migración ni dependencia.
Desde la raíz, usando npm 11.19.1 también para scripts:

~~~powershell
npx --yes --package=npm@11.19.1 npm run db:local -- status
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run dev
~~~

Abre http://127.0.0.1:5173/acceso con una cuenta ficticia solicitante existente.
Desde Mi cuenta → Mis solicitudes puedes crear un borrador, abrirlo, recargar y
editar título, tipo y descripción. Tiene historial de creación; editar no genera
transiciones. Los otros solicitantes y revisores no ven ni modifican ese borrador.
El listado pagina de 20 en 20 y permite filtrar por estado. La fase 06 añade envío y cancelación; aprobación y rechazo siguen pendientes.

Credenciales locales ya existentes en .local/seed-credentials.json, excluidas de Git.
No las pegues en documentación ni consola. Los recorridos de verificación conservan
sus borradores, identificados con el título «Prueba fase 05 …».

Para probar el compilado, detén desarrollo con Ctrl+C y ejecuta:

~~~powershell
npx --yes --package=npm@11.19.1 npm run build
npx --yes --package=npm@11.19.1 npm start
~~~

Abre http://127.0.0.1:3000/acceso. Al terminar cierra HTTP con Ctrl+C y detén la
instancia propia con npx --yes --package=npm@11.19.1 npm run db:local -- stop.
Los datos quedan guardados. Un error de red al crear puede haber ocurrido después
del guardado: comprueba Mis solicitudes antes de repetir, para evitar duplicados.

Contrato de API, Unicode, permisos y concurrencia: [SOLICITUDES](docs/SOLICITUDES.md).
Resultados actuales y publicación pendiente: [STATUS](docs/STATUS.md).
## Envío, cancelación y bandeja — fase 06

En el entorno existente basta con status/start y dev (o start después de build);
no hay dependencias ni migraciones nuevas. Usa siempre npm 11.19.1:

~~~powershell
npx --yes --package=npm@11.19.1 npm run db:local -- status
npx --yes --package=npm@11.19.1 npm run db:local -- start
npx --yes --package=npm@11.19.1 npm run dev
~~~

1. Accede en http://127.0.0.1:5173/acceso con Solicitante Uno, usando las
   credenciales privadas existentes.
2. Crea un borrador con descripción de 10–3000 caracteres y abre su detalle.
   Enviar borrador valida el contenido guardado y asigna el responsable por tipo.
3. Cierra sesión y entra con el revisor correspondiente: material/software se
   asignan a Revisor Uno y formación a Revisor Dos en el seed original.
   Mi cuenta → Bandeja de revisión empieza por pendientes; puedes cambiar el filtro.
4. Vuelve a la cuenta del autor para Cancelar solicitud. La confirmación advierte
   que no podrá reabrirse. Autor y revisor conservan expediente e historial tras
   cancelar una enviada. Si se cancela un borrador, solo lo ve el autor.

Tras un conflicto o una conexión interrumpida, Actualizar detalle permite comprobar
el estado antes de repetir. No hay reintentos automáticos ni controles de aprobación
o rechazo. La asignación no se cambia después del envío.

Compilado: detén dev, ejecuta npx --yes --package=npm@11.19.1 npm run build y
npx --yes --package=npm@11.19.1 npm start; abre http://127.0.0.1:3000/acceso.
Al terminar, Ctrl+C y npx --yes --package=npm@11.19.1 npm run db:local -- stop.
Datos conservados. Los recorridos de esta fase dejan dos solicitudes ficticias
«Prueba fase 06 …», enviadas y después canceladas, con tres eventos cada una.