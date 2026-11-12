# Estado del Proyecto 02

Fecha de comprobación: 12 de noviembre de 2026 (Europe/Madrid).

## Estado actual — fase 03 publicada, reparación local y cierre pendiente

La persistencia está publicada en 0850ddc23f7153ed46e3bd32827d33593584d473.
Su primera [CI 43197088648](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43197088648),
job 131110701947, falló durante npm ci con dos entradas @emnapi ausentes.
El contenedor PostgreSQL se inicializó, pero bootstrap SQL, tipos, pruebas,
migraciones, integración y build quedaron omitidos. Las 31 pruebas registradas
para esa entrega eran resultados locales, no de ese run remoto.

El lockfile se ha reparado mediante npm 11.19.1 y validado localmente de nuevo.
La corrección está sin staging/commit/push; falta publicar y comprobar una CI
satisfactoria de su propio commit. La fase 03 todavía no está cerrada.
No se inicia autenticación ni se amplía funcionalidad.

La CI satisfactoria 43191106078 pertenece a b45c3f1 (fase 02), no a fase 03 ni a
esta reparación. Los apartados históricos siguientes conservan las evidencias
de sus respectivas entregas; la corrección actual se documenta al final.

## Preparación documental inicial — histórico

En la preparación inicial se crearon: README.md, AGENTS.md, PROJECT_BRIEF.md,
DECISIONES.md, este STATUS.md y .gitignore. Entonces la aplicación no estaba
implementada y no existían package.json, lockfile, dependencias, apps/, tests/,
migraciones, configuración de bases o workflows.

## Carpeta y Git durante la fase documental — histórico

- Carpeta inicialmente abierta: C:\Users\kaosk\source\repos\importacion-validacion-datos.
  Se inspeccionó en main, sin cambios pendientes y con origin apuntando a
  https://github.com/AlexC-0/importacion-validacion-datos.git.
- Alex confirmó crear C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
  El destino no existía antes de esta sesión. No había trabajo previo que preservar.
- No se encontraron AGENTS.md ni marcadores .git en las carpetas antecesoras;
  git rev-parse --show-toplevel en la carpeta padre confirmó que no es repositorio.
  El Proyecto 02 es hermano del Proyecto 01, no está dentro de él.
- Alex inicializó el repositorio local y publicó la documentación desde GitHub
  Desktop. El intento anterior de creación por Codex falló por autenticación;
  ese bloqueo ya no impide disponer del repositorio.
- Repositorio público verificado:
  [AlexC-0/gestion-solicitudes-aprobaciones](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones).
  Rama local y rama predeterminada remota: main. Origin apunta a
  https://github.com/AlexC-0/gestion-solicitudes-aprobaciones.git.
- En esa inspección, HEAD y la referencia local origin/main coincidían en
  [c79177f0540c05737abd8c56024165e466d65db3](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/commit/c79177f0540c05737abd8c56024165e466d65db3),
  mensaje `Initial commit`. La existencia y el contenido de ese commit también
  se comprobaron mediante la conexión GitHub.
- El árbol estaba limpio al iniciar esta actualización. El commit publicado
  contiene los seis archivos preparados y .gitattributes; se conserva este último.
- Aquella actualización se entregó local y Alex la publicó después en
  `5ef10e52dcaf1c5229eb4cc3fb87fc6a186f25e7`. Ya no está pendiente. No hubo despliegue.

## Herramientas verificadas en la preparación inicial

Resultados históricos de esta conversación. Las versiones y la disponibilidad de
PostgreSQL no se han vuelto a comprobar para esta actualización documental.

| Comprobación ejecutada | Resultado |
| --- | --- |
| node --version | v24.13.0 |
| npm --version | 11.6.2 |
| git --version | 2.56.0.windows.4 |
| Get-Command psql,pg_isready,postgres | No encontrados en PATH |
| Get-Service con nombre *postgres* | No se encontraron servicios con ese nombre |
| postgres.exe --version, binario local del Proyecto 01 | PostgreSQL 18.6 |
| pg_isready -h 127.0.0.1 -p 55432, consulta más reciente | no response |
| Get-Command gh | GitHub CLI no disponible en PATH |

PostgreSQL se comprobó mediante el binario existente en
C:\Users\kaosk\source\repos\importacion-validacion-datos\.local\postgresql\pgsql\bin.
En la primera inspección de esta conversación aceptaba conexiones; al repetir
la comprobación después de confirmar el destino ya no respondió. Esto no permite
atribuir una causa. No se arrancó, detuvo, reinstaló ni modificó la instancia.
No se consultaron credenciales ni se crearon bases. El Proyecto 02 aún no dispone
de configuración o bases propias. Estas observaciones no acreditan conectividad
SQL autenticada ni disponibilidad de una base para el nuevo proyecto.

## Comprobaciones de la preparación inicial

Revisión documental de coherencia: roles excluyentes, visibilidad, transiciones,
validaciones, seguridad, exclusiones y criterios de aceptación contrastados con
el encargo. Decisiones definidas separadas de los aspectos pendientes.
Revisión mecánica ejecutada: exactamente seis archivos autorizados, ocho enlaces
locales existentes, bloques Markdown cerrados y sin espacios finales. Búsqueda de
patrones de tokens, claves privadas y URLs PostgreSQL con credenciales: sin
coincidencias. Revisión manual de .gitignore: dependencias, builds, resultados,
variables y secretos excluidos; ejemplos .env sin secretos y futuro lockfile
conservados. Estas comprobaciones no constituyen una auditoría de seguridad.

En aquella preparación el Proyecto 02 todavía no tenía Git, por lo que no existía
diff de trabajo contra un commit; se revisaron los seis archivos nuevos.
Se volvió a comprobar el Proyecto 01: git status --short --branch limpio y git diff --check sin incidencias.
No se modificó ningún archivo de ese proyecto.

En la fase documental no se ejecutaron pruebas automatizadas, typecheck, build
ni instalación: todavía no existían scripts ni CI del Proyecto 02. Esos registros
no se presentan como comprobaciones nuevas de la base fullstack.

## Actualización documental publicada en 5ef10e5 — histórico

Alex confirmó la publicación y autorizó actualizar la documentación. Se inspeccionó
la carpeta del Proyecto 02, las instrucciones, el estado Git, la rama, origin y
las referencias locales. Se consultaron en GitHub la visibilidad pública, la rama
predeterminada y el commit inicial; no se ejecutó fetch ni se modificaron referencias.

Cambios limitados a README.md, AGENTS.md, DECISIONES.md y STATUS.md: registrar la
publicación, dar por satisfecha la autorización puntual de creación y conservar
como históricos los bloqueos del intento de Codex. La aplicación sigue sin
implementar; alcance funcional, dependencias e infraestructura no cambian.

Revisión ejecutada: git diff --check correcto, diff de los cuatro documentos
revisado, nueve enlaces locales válidos y bloques Markdown cerrados. Búsqueda de
patrones de tokens, claves privadas y URLs con credenciales sin coincidencias.
Las referencias públicas al repositorio y al commit se contrastaron con GitHub.
En aquella entrega, el índice seguía vacío de cambios; Codex no hizo staging,
commit ni push. Alex publicó posteriormente esa documentación en `5ef10e5`.
No procede ejecutar pruebas automatizadas, typecheck o build para estos cambios
documentales. No se atribuye ninguna ejecución de CI a este commit o a la entrega.

## Fase de base fullstack ejecutable — 12/11/2026

### Inspección y alcance

Ruta de trabajo: C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
Raíz Git confirmada, rama main y origin correcto. HEAD y la referencia local
origin/main coincidían en `5ef10e52dcaf1c5229eb4cc3fb87fc6a186f25e7`, el commit
publicado indicado por Alex. No había cambios pendientes ni commits posteriores.

Se leyeron las instrucciones y los cuatro documentos requeridos antes de modificar.
Versiones comprobadas de nuevo: Node.js v24.13.0, npm 11.6.2 y Git
2.56.0.windows.4. No se inspeccionó ni modificó el Proyecto 01 en esta fase.
No se comprobó, arrancó o modificó PostgreSQL; no era necesario para este encargo.

### Componentes entregados

- Raíz privada con workspaces privados @chamba/api y @chamba/web, un único
  package-lock.json, engines estrictos y scripts dev/typecheck/test/build/start.
- API con GET /api/health (200, JSON {"status":"ok"}), 404 JSON, errores genéricos,
  puerto validado, loopback y cierre ordenado. App y arranque están separados.
- Página React en castellano, Router, Query con reintentos automáticos desactivados,
  carga/éxito/error y reintento manual. Vista de página no encontrada, CSS adaptable
  y foco visible. No hay datos simulados ni pantallas de negocio ficticias.
- Proxy /api en Vite; Express sirve el frontend compilado bajo el mismo origen,
  manteniendo la API y los assets inexistentes fuera del fallback HTML.
- Pruebas de API/configuración/proceso y componentes; workflow inicial con permisos
  mínimos para push a main y pull requests. No se añade una base de datos a CI.
- README, AGENTS, DECISIONES y STATUS actualizados. PROJECT_BRIEF.md,
  .gitattributes y .gitignore se conservan sin cambios.

### Compatibilidad y correcciones comprobadas

Las versiones exactas se registran en [DECISIONES](DECISIONES.md) y el lockfile.
Se consultaron engines y peers en npm antes de instalar; no se usó --force ni
--legacy-peer-deps y no se modificó la instalación de Node.js.

- jsdom 29.1.1 se eligió por compatibilidad con Node 24.13.0; jsdom 30/31 exige
  una revisión posterior de Node dentro de la línea 24.
- Vitest 5 con jest-dom produjo TS2428. Con Vitest 4.1.12 pasan los tipos estrictos
  sin ocultar comprobaciones de librerías. El lockfile se regeneró desde los
  manifiestos finales para eliminar una entrada opcional sobrante del ajuste.
- Con un puerto ocupado, tsx watch conservaba vivo el proceso fallido. Se cambió
  a ejecución sin watch de la API y se añadió una prueba de regresión. El arranque
  usa createServer(app) y no anuncia disponibilidad cuando no consigue escuchar.
- Se evitaron comandos npm anidados en dev para que el coordinador no quedara
  esperando procesos por lotes de Windows tras Ctrl+C. Los comandos de desarrollo
  ejecutan Node directamente y Vite conserva la recarga del frontend.

### Pruebas y comandos

| Comprobación | Resultado |
| --- | --- |
| npm install | Dependencias locales instaladas, sin conflictos de peers |
| npm ci --no-fund | Instalación reproducible; SHA-256 del lockfile igual antes/después |
| npm run typecheck | Correcto en ambos workspaces, sin skipLibCheck |
| npm test | 15 pruebas correctas: 10 API y 5 frontend, en 4 archivos |
| npm run build | API y frontend compilados correctamente |
| npm start | Arranque local compilado y respuesta HTTP real |
| npm run dev | API y Vite coordinados; proxy real comprobado |

Las 10 pruebas API verifican health, 404 JSON, ocultación de detalles internos,
HTML de navegación, asset válido, API/assets/archivos ausentes, métodos sin
fallback, puertos válidos/inválidos y fallo del proceso ante un puerto ocupado.
Las cinco pruebas de frontend usan fetch controlado para carga/éxito, error y
reintento por teclado, fallo después de éxito, contrato incorrecto y ruta desconocida.
No son pruebas de navegador ni de PostgreSQL. Las repeticiones de una suite no
se contabilizan como pruebas adicionales.

### HTTP real y procesos

Con el servidor compilado se verificaron health 200 y su JSON exacto, index.html
200 en castellano y ambos assets generados (CSS/JavaScript) con 200 y MIME correcto.
/api, /api/no-existe, assets ausentes con/sin extensión, un CSS ausente y /.env
respondieron 404 JSON incluso solicitando HTML. La navegación sin extensión recibió
el index para Router y un POST desconocido devolvió 404.

En desarrollo se comprobó que health directo y health a través de Vite devuelven
el mismo JSON, y que una API desconocida conserva el 404 JSON por el proxy.
Se probaron los valores predeterminados 3000/5173 y puertos alternativos:
compilado en 3100, API de desarrollo en 3101 y Vite en 5174.

Una comprobación con listener temporal propio ocupando API_PORT confirmó fallo
controlado, salida no exitosa de dev, cierre de Vite y conservación del listener
que ocupaba el puerto. No se cerraron procesos ajenos.

### Navegador y revisión visual

El conector Playwright no pudo conectar con su extensión. Se usó el Chrome ya
instalado (157.0.8103.51) en headless, con perfil temporal aislado y Chrome DevTools
Protocol, sin instalar dependencias o extensiones.

- Petición real del navegador a /api/health a través de Vite, con HTTP 200.
- Vistas 1280x900 y 390x844 sin desbordamiento horizontal; capturas inspeccionadas.
- Foco en enlace de salto/botón, outline visible y reintento mediante Enter.
- Consulta retenida temporalmente para comprobar carga y botón deshabilitado.
- Fallo de red simulado bloqueando health, mensaje de error y recuperación al
  desbloquear y reintentar. Ningún éxito se presenta como procedente de datos ficticios.
- Ruta no encontrada y regreso al inicio; sin excepciones JavaScript de aplicación.

Capturas y comprobador puntual permanecen en .local/, excluidos de Git. El perfil
Chrome se eliminó tras cerrar el proceso propio. No es una suite E2E de Playwright
ni una auditoría completa con lectores de pantalla u otros navegadores.

### Cierre y revisión final

Revisión final: git diff --check correcto, diff y archivos nuevos revisados,
33 archivos versionables (5 Markdown y 7 JSON), nueve enlaces locales válidos,
bloques Markdown cerrados y búsqueda de patrones de secretos sin coincidencias.
Un solo lockfile y los tres paquetes privados comprobados. .gitattributes,
.gitignore y PROJECT_BRIEF.md permanecen idénticos a HEAD.

La última instalación añadió 245 paquetes y auditó 248 sin vulnerabilidades
notificadas. npm ls --depth=0 no muestra peers inválidos ni paquetes sobrantes.
SHA-256 del lockfile antes y después de npm ci:
`A1A2250FB8A56D9433FE304A45835BAE6AA765023065EB5524D843F606B42BF7`.
Tipos, las 15 pruebas y build se repitieron sobre esa instalación final y pasaron.

Ctrl+C produjo el mensaje de cierre del servidor; en el comando dev definitivo
la API terminó con código 0 y Vite con el código de interrupción de Windows.
El wrapper de terminal terminó con código 1 por la interrupción, no por un fallo
HTTP. Después se pudo escuchar de nuevo en 3000, 5173, 3100, 3101 y 5174;
no quedaron procesos Node/Chrome/cmd con la ruta del proyecto.
El coordinador residual observado durante la comprobación anterior se identificó
y detuvo antes de corregir el comando de desarrollo. Solo se detuvieron procesos
propios de estas comprobaciones.

Estado final: main conserva HEAD 5ef10e5 y origin sin cambios. Cuatro documentos
modificados y 26 archivos nuevos, todos sin staging. node_modules, los dist y
.local (capturas/comprobador) están excluidos de Git. No se ejecutaron commits,
push, cambios de remotos, tags, releases ni publicaciones por parte de Codex.

### Archivos de la entrega

Modificados: README.md, AGENTS.md, docs/DECISIONES.md y docs/STATUS.md.
Nuevos, agrupados por directorio:

| Directorio | Archivos |
| --- | --- |
| Raíz | package.json, package-lock.json, .npmrc |
| .github/workflows | ci.yml |
| apps/api | package.json, tsconfig.json, tsconfig.build.json, vitest.config.ts |
| apps/api/src | app.ts, config.ts, errors.ts, server.ts |
| apps/api/tests | app.test.ts, config.test.ts, server.test.ts |
| apps/web | package.json, tsconfig.json, vite.config.ts, vitest.config.ts, index.html |
| apps/web/src | App.tsx, health.ts, main.tsx, styles.css |
| apps/web/tests | App.test.tsx, setup.ts |

La CI solo está preparada. Su resultado remoto se comprobará después del commit
y push manuales de Alex; no se atribuyen resultados históricos a estos cambios.

### Límites y siguiente paso

No se implementaron autenticación, sesiones, roles, CSRF, gestión de solicitudes,
SQL, migraciones o datos iniciales. No se instalaron herramientas globales ni se
modificaron servicios o PostgreSQL. No hay despliegue ni otro repositorio.

La API requiere reiniciar dev al editar su código. El alcance visual comprobado
es Chrome y dos tamaños de pantalla; falta CI Linux remota tras publicar.

Tras revisión, commit y push manuales y comprobación de su CI, el siguiente hito
recomendado es el modelo de datos y la persistencia propia. No se comienza ahora.

## Fase 03 — persistencia PostgreSQL propia, 12/11/2026

### Inspección y alcance

Ruta/raíz Git: C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
Inicio en main, árbol limpio, HEAD y origin/main en b45c3f1, sin avances posteriores
en las referencias locales. Origin: https://github.com/AlexC-0/gestion-solicitudes-aprobaciones.git.
Lectura previa de AGENTS, README, PROJECT_BRIEF, DECISIONES y STATUS. Se tomó como
evidencia histórica la comprobación de CI aportada expresamente por Alex; no se
atribuye esa ejecución a estos cambios ni se afirma otra consulta remota nueva.

No existían .env ni cluster/configuración PostgreSQL propios. Se preparó el entorno
autorizado exclusivamente en Proyecto 02. No se inspeccionó, copió ni modificó
ningún archivo, credencial, cluster o servicio del Proyecto 01.

### Entrega y decisiones

Cuatro tablas: usuarios, tipos_solicitud, solicitudes y eventos_solicitud; UUID,
timestamptz, evento inicial NULL → borrador, relaciones sin cascadas, cinco estados,
coherencia de fechas/envío/responsable/finalización, longitudes e índices justificados.
El diseño se escribió en PERSISTENCIA antes de la migración. No hay tablas de sesiones.
SQL no implementa permisos, sincronización de estado e historial ni concurrencia del
flujo funcional: corresponden a servicios posteriores. PROJECT_BRIEF no se modificó.

pg 8.23.1, @types/pg 8.23.1, node-pg-migrate 9.0.0 y argon2 0.45.2, versiones exactas.
Node 24.13.0/npm 11.6.2 y TypeScript estricto conservados. Pool máximo 5, tiempos
limitados, transacción con el mismo cliente, errores seguros y cierre explícito.
Migraciones/seed manuales, sin dependencia de PostgreSQL desde health o frontend.

### Entorno realmente preparado

PostgreSQL 18.6 x64 EDB, procedencia y SHA-256 en [PERSISTENCIA](PERSISTENCIA.md).
Binarios/cluster/logs/configuración privada: .local/postgres. Escucha 127.0.0.1:55433,
auth SCRAM desde initdb, sin servicio Windows, PATH global o Docker local.
Roles p02_dev/p02_test ordinarios, cada uno propietario de su base exclusiva; SQL
confirmó rolsuper=false, rolcreatedb=false y rolcreaterole=false para ambos.
p02_admin se utilizó únicamente para preparación, nunca como credencial habitual.
ACL privadas aplicadas; secretos excluidos y nunca impresos.

Durante el primer prepare, capturar pipes de pg_ctl bloqueó el proceso Node tras
arrancar PostgreSQL. Se detuvo exclusivamente ese cluster, se corrigió pg_ctl a
stdio ignore y se completaron roles/configuración conservando los datos, sin initdb
adicional. start/stop y prepare repetido quedaron verificados con el script corregido.
No se afirma una segunda preparación desde cero: no se reinicializó el cluster.

### Pruebas y evidencia

| Comando o comprobación | Resultado local |
| --- | --- |
| npm ci --no-fund | Correcto; 281 paquetes añadidos, 284 auditados; lockfile conservado |
| npm run typecheck | Correcto en API y frontend |
| npm test | 15 correctas: 10 API y 5 frontend, sin PostgreSQL |
| npm run build | Correcto en ambos workspaces |
| npm run db:check / db:check:test | Conexión autenticada y nombre real de ambas bases correctos |
| npm run db:migrate / db:migrate:test | Primera ejecución 1 migración; segunda 0, en ambas bases |
| npm run db:seed repetido | Correcto, cuatro usuarios y tres tipos, sin duplicados ni solicitudes |
| npm run test:integration con PostgreSQL | 16 correctas en un archivo; 31 pruebas distintas contando las existentes |
| test:integration con PostgreSQL detenido | Fallo esperado, código 1, preflight sin preparar esquemas; no se contabiliza como suite aprobada |
| node --check de ambos scripts mjs | Correcto |
| npm start y peticiones HTTP reales sin PostgreSQL | Health 200 con JSON exacto, HTML castellano 200, JS/CSS 200, API desconocida/.env/asset ausente 404 JSON |

Hash SHA-256 final del lockfile antes y después de npm ci:
`8DAD081EE634096D00EF65BBFD99FCB50E9528AF9B1A73A06CB54BE9E5EFC7F7`.

Las pruebas nuevas acreditan rollback real de DDL fallido (división por cero),
registro único de migración, restricciones SQL, lectura, dos escrituras confirmadas,
rollback si falla la segunda, liberación de conexión y rollback por error de aplicación.
Seed repetido conserva filas completas, hashes, IDs, fechas y asignaciones; conflictos
se rechazan. Una URL distinta hacia desarrollo es rechazada tras current_database;
no se ejecuta preparación. La prueba de esquemas anidados acredita que limpiar uno
no borra otro. También se exige TEST_DATABASE_URL explícita sin fallback.

La primera integración obtuvo 15/16: el test esperaba 23503 al borrar relaciones
ON DELETE RESTRICT, cuyo código real fue 23001. Se ajustó la expectativa y se verificó
además el FK de responsable con una fila válida en los demás campos. La versión
corregida pasó las 16 pruebas; no se debilitaron las restricciones SQL.

Estado SQL tras comprobar: desarrollo 4 usuarios/3 tipos/0 solicitudes/0 eventos;
app de prueba 0 filas de negocio. Cero esquemas p02_test_ residuales en ambas bases.
La semilla no inventa solicitudes. Credenciales: .local/seed-credentials.json privado.

### Limitaciones y cierre

npm audit informa 3 avisos moderados en la cadena node-pg-migrate/glob/minimatch;
se conserva la herramienta con useGlob:false y directorio fijo. No se aplicó fix --force.
npm ls identifica @emnapi/wasi-threads como extraneous, aunque npm ci exige su entrada
opcional en el lockfile. npm prune no la eliminó; retirarla produjo EUSAGE. npm
restauró la entrada requerida y la instalación reproducible final conserva exactamente
el hash anterior. Se registra esta inconsistencia de npm, sin añadir una dependencia
directa artificial ni afirmar un árbol libre de avisos. No impide tipos, pruebas o build.

CI ampliada con servicio postgres:18.6, readiness mediante pg_isready del contenedor,
roles ordinarios de CI, migraciones repetidas e integración. El bootstrap de CI y el
workflow Linux requieren su ejecución remota; no se declaran probados en el runner.
La CI satisfactoria 43191106078 pertenece únicamente al commit anterior b45c3f1.

Frontend y arranque funcional no cambiaron; no se repitió revisión visual ni E2E.
No se implementaron login, sesiones, CSRF, permisos, endpoints de solicitudes ni
resolución concurrente. No hay servicios cloud, ORM o despliegue.

Revisión de archivos versionables: 46 archivos, JSON válidos, bloques Markdown
cerrados y enlaces locales existentes; comparación contra secretos privados sin
coincidencias. .env, .local, node_modules y builds excluidos. git diff --check sin
errores; avisos LF/CRLF respetan .gitattributes existente. PROJECT_BRIEF.md, .gitignore,
.gitattributes y frontend permanecen idénticos a HEAD.

HTTP cerró mediante Ctrl+C. La instancia propia queda detenida, con datos conservados.
Rama main, HEAD b45c3f1 y origin sin cambios; 10 archivos modificados y 13 nuevos,
sin staging. No hubo commits, push, tags, releases, cambios de remoto ni publicación.

### Archivos de fase 03

Modificados:

- README.md, AGENTS.md, docs/DECISIONES.md y docs/STATUS.md.
- package.json y package-lock.json.
- apps/api/package.json, apps/api/tsconfig.json y apps/api/vitest.config.ts.
- .github/workflows/ci.yml.

Nuevos:

- .env.example y docs/PERSISTENCIA.md.
- apps/api/migrations/202611120001_initial.sql.
- apps/api/src/persistence/database.ts, migrate.ts, seed.ts y cli.ts.
- apps/api/tests/integration/preflight.ts, isolation.ts y persistence.test.ts.
- apps/api/vitest.integration.config.ts.
- scripts/postgres-local.mjs y scripts/ci-database.mjs.

Comandos de reproducción desde la raíz: [README](../README.md) y
[PERSISTENCIA](PERSISTENCIA.md). Próximo paso recomendado, tras revisión y publicación
manual con su CI propia: autenticación y sesión de usuario. No se comienza en esta fase.

## Corrección del EUSAGE posterior a 0850ddc — 12/11/2026

### Inspección y reproducción

Ruta/raíz: C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones; main limpio,
HEAD y origin/main en 0850ddc23f7153ed46e3bd32827d33593584d473; origin correcto y
sin cambios posteriores en las referencias locales. Se leyeron instrucciones y
documentos requeridos, manifiestos, .npmrc, lockfile y workflow. No se tocó Proyecto 01.
El fallo remoto y sus versiones se toman de la evidencia verificada aportada por Alex.

Node local v24.13.0 y npm global 11.6.2. Se ejecutó npm 11.19.1 temporal mediante
npx, sin sustituir herramientas globales. Dos copias independientes en .local/lock-repair
contenían solo manifiestos, .npmrc y lockfile, inicialmente sin node_modules ni secretos.

| Escenario Windows / Node 24.13.0 | Resultado |
| --- | --- |
| Lockfile publicado + npm 11.19.1 ci en copia limpia | EUSAGE: Missing @emnapi/core y @emnapi/runtime 2.0.0-beta.2; coincide con CI |
| Mismo lockfile + npm 11.6.2 ci en copia limpia | Correcto; SHA-256 original conservado |
| Copia reparada por npm 11.19.1 install --package-lock-only | Dos entradas añadidas y metadatos peer normalizados |
| Copia reparada + npm 11.19.1 ci | Correcto, con scripts de instalación habilitados |
| Argon2id real en esa copia | Hash y verify correctos, sin imprimir contraseña ni hash |

Causa confirmada: lockfile incompleto en la rama opcional wasm32 de rolldown;
faltaban core/runtime exigidos también como peers por @napi-rs/wasm-runtime.
El mismo entorno Windows cambia de aceptación a EUSAGE al cambiar solo npm.
La validación anterior con 11.6.2 era insuficiente para la versión efectiva del runner.
@emnapi/wasi-threads no debía eliminarse: core depende de él. Se corrige la lectura
anterior del aviso extraneous; era evidencia del árbol incompleto. Detalle del
contraste de código npm y de dependencias en [DECISIONES](DECISIONES.md).

### Corrección mínima

Lockfile reparado por npm 11.19.1 en copia limpia, sin borrar el lockfile original
para resolver de nuevo todo el árbol. Comparación completa: ninguna versión ni
integridad preexistente cambia. Se añaden core/runtime 2.0.0-beta.2 y npm retira
12 flags peer redundantes; sin dependencias directas @emnapi, overrides ni omisiones.
Manifiestos de API/frontend, fuentes, tests y migraciones publicadas no cambian.

package.json añade packageManager npm@11.19.1. CI fija Node 24.22.2 y NPM_VERSION
11.19.1, comprueba concordancia y usa npx con esa versión en instalación y controles.
Conserva npm ci, bootstrap, readiness, tipos, pruebas, migraciones, integración y build.
No hay continue-on-error, scripts desactivados, exclusión de opcionales ni instalación
global. README/AGENTS explican cómo usar la misma versión localmente.

### Validación final del arreglo

Todos los comandos npm de esta validación se ejecutaron con el prefijo
`npx --yes --package=npm@11.19.1 npm`, sobre Windows y Node 24.13.0.

| Comando / comprobación | Resultado nuevo |
| --- | --- |
| ci --no-fund en raíz | Correcto: 280 paquetes añadidos, 283 auditados; lockfile sin cambios |
| run typecheck | API y frontend correctos |
| test | 15 aprobadas: 10 API y 5 frontend |
| run build | API y frontend correctos |
| run db:local -- status / start | Instancia existente inicialmente detenida; arranque correcto |
| run db:check / db:check:test | Ambas conexiones e identidad de base correctas |
| run db:migrate / db:migrate:test | 0 migraciones aplicadas en cada base |
| run test:integration | 16 aprobadas; total 31 pruebas distintas, sin modificar pruebas |
| run db:local -- stop | Instancia propia detenida, datos conservados |
| Comparación de archivos privados antes/después | .env, seed-credentials.json, instance.json y admin-password idénticos byte a byte |

SHA-256 final, igual antes/después de npm ci:
`9A76125FC549CD336126F000B7423A188C09271F9B135C318A545D31F226960E`.
El anterior era `8DAD081EE634096D00EF65BBFD99FCB50E9528AF9B1A73A06CB54BE9E5EFC7F7`.
No se ejecutó prepare, seed de desarrollo, reset o reinicialización. La integración
sigue creando y limpiando únicamente sus esquemas exclusivos de prueba.

### Límites, revisión y entrega

Los tres avisos moderados de node-pg-migrate/glob/minimatch siguen pendientes:
no son la causa del EUSAGE ni se declaran corregidos. npm 11.19.1 avisa sobre
allowScripts de argon2/esbuild; se ejecutaron instalación, hash/verify y build sin
fallos nativos. No se ocultaron errores ni se rebajaron controles.

No se pudo ejecutar Linux: wsl informó servicio deshabilitado y Docker no tenía
daemon accesible. No se habilitó/instaló infraestructura. Node 24.22.2 del runner no
se ejecutó localmente: el contraste controlado mantuvo Node 24.13.0 y cambió npm.
La ejecución remota Linux y bootstrap SQL siguen pendientes del commit de arreglo.
No se repitió revisión visual ni HTTP: frontend y arranque no cambian.

Diff revisado, sin modificaciones funcionales ni de migraciones; git diff --check
sin errores. Archivos modificados: package-lock.json, package.json,
.github/workflows/ci.yml, README.md, AGENTS.md, docs/DECISIONES.md,
docs/PERSISTENCIA.md y docs/STATUS.md. Ningún archivo nuevo versionable.
Las copias diagnósticas permanecen privadas bajo .local/, excluidas de Git;
solo hay un lockfile versionable raíz. No se copiaron bases ni credenciales allí.

Estado final: main/HEAD 0850ddc y origin conservados; ocho archivos modificados,
sin staging. Sin procesos temporales de validación; PostgreSQL 18.6 en 55433 detenido.
Alex debe revisar y realizar commit/push desde GitHub Desktop; comprobar después
la CI de ese commit antes de cerrar fase 03 o autorizar el siguiente hito.
