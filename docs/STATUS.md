# Estado del Proyecto 02

Fecha de comprobación: 12 de noviembre de 2026 (Europe/Madrid).

## Estado actual — V1 completada y verificada

V1 aceptada para el alcance funcional y de ejecución local acordado.
La fase de construcción y verificación ha finalizado.

Evidencia final verificada aportada por Alex: commit
[9650ffbfcdd97e1d34f8049362edd1a2c8f802a2](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/commit/9650ffbfcdd97e1d34f8049362edd1a2c8f802a2)
y [CI 43224311688 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43224311688).
Controles correctos: instalación reproducible, tipos, migraciones repetidas,
pruebas, build e instalación/ejecución de Chromium.
**149 pruebas correctas: 14 API + 50 frontend + 80 de integración con PostgreSQL +
5 E2E sobre aplicación compilada y PostgreSQL real.**

La revisión desde ChatGPT comunicada por Alex contrastó el código E2E, su
aislamiento, la documentación A01–A13 y los logs remotos. Matriz en
[ACEPTACION-V1](ACEPTACION-V1.md); reproducción en [PRUEBAS](PRUEBAS.md) y README.
Los resultados técnicos corresponden a 9650ffb y su CI; no se atribuyen al futuro
commit documental ni se presenta una CI de este que todavía no existe.

Límites conservados: Chromium, viewports 1280x900 y 390x844, sin despliegue/TLS
real ni auditorías exhaustivas. Siguen documentados tres avisos moderados
transitivos del tooling de migraciones. Sin despliegue, tag ni release.
Las nuevas funcionalidades o ampliaciones requieren otro encargo.

Los registros siguientes conservan sus resultados locales/remotos originales,
incluidos los pendientes de cada entrega y el fallo corregido de
8733744 / CI 43213467827. Son históricos y no sustituyen este estado vigente.
Alex realizará staging, commit y push de este cierre documental en GitHub Desktop.

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

## Fase 04 — autenticación, 12/11/2026

### Inspección y contrato

Ruta/raíz Git: C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
Inicio main limpio, HEAD/origin/main ff60200f8dbbafbcb10acea2f2293c4fd8584899 y origin
https://github.com/AlexC-0/gestion-solicitudes-aprobaciones.git. Sin avances posteriores
en referencias locales. Documentación vigente y skill security-review leídas.
No se inspeccionó/modificó Proyecto 01. El nuevo encargo autorizó autenticación y
sustituyó las restricciones temporales anteriores; commits/push siguen siendo manuales.

AUTENTICACION.md se escribió antes de implementar. Se incorporaron csrf/login/me/logout,
no-store, validación Zod estricta, regeneración, persistencia confirmada antes de éxito,
CSRF synchronizer token, origen configurado con Referer como fallback y errores seguros.
Sesión previa 15 minutos; autenticada ocho horas absolutas, sin renovación por actividad.
Cookie HttpOnly/Lax/Path=/ sin Domain, Secure para HTTPS y excepción HTTP loopback
explícita. Secreto local aleatorio estable añadido sin sobrescribir variables previas.

Nueva migración 202611120002_sessions.sql según formato connect-pg-simple. La inicial
202611120001_initial.sql y PROJECT_BRIEF.md permanecen intactos. No hay auto-migración,
MemoryStore de respaldo ni negocio de solicitudes. Store, límites y pool se cierran.
Health y frontend siguen fuera del middleware de sesiones.

Cliente: /acceso y /cuenta, recuperación al recargar, logout y estados diferenciados;
solo memoria, cancelación/eliminación de consultas privadas, descarte de respuestas
anteriores, revalidación al foco/visibilidad, BroadcastChannel sin secretos y caducidad.
La página técnica / sigue disponible. Un error técnico no se presenta como credenciales
incorrectas o cierre confirmado. No hay reintentos automáticos de escrituras.

### Herramientas y dependencias

Node local 24.13.0, npm efectivo 11.19.1 mediante npx; CI conserva Node 24.22.2 y
npm fijado. PostgreSQL propio 18.6 en 127.0.0.1:55433. No se ejecutó prepare/reset/initdb.
Chrome instalado utilizado con perfiles temporales exclusivos.

Añadidas versiones exactas: express-session 1.19.0, connect-pg-simple 10.0.0,
csrf-sync 4.2.1, zod 4.6.7, rate-limiter-flexible 11.4.1 y tipos
@types/express-session 1.19.0 / @types/connect-pg-simple 7.0.3. Motivos y fuentes en
DECISIONES. npm ls --depth=0 correcto; un único lockfile versionable.

### Comprobaciones nuevas sobre instalación final

| Control | Resultado |
| --- | --- |
| npx --yes --package=npm@11.19.1 npm ci --no-fund | Correcto: 294 paquetes añadidos, 297 auditados; lockfile conservado |
| npm run typecheck con npm fijado | Correcto, API/frontend estrictos |
| npm test con npm fijado | 29 correctas: 14 API y 15 frontend, siete archivos |
| npm run build con npm fijado | API/frontend correctos |
| db:migrate y db:migrate:test | Una migración nueva aplicada a cada base; repetición final 0 en ambas |
| npm run test:integration con npm fijado | 35 correctas en dos archivos: 16 persistencia + 19 auth |
| HTTP compilado real | csrf/login/me/logout y SID previo rechazado; identidad pública sin secretos |
| Reinicio de proceso API compilada | Recuperación de la misma sesión desde PostgreSQL y mismo secreto |
| PostgreSQL detenido con servidor HTTP activo | Health 200 exacto, frontend 200 y auth 503 seguro |

SHA-256 del lockfile antes/después de npm ci:
`1BCF3F851B4C0878475D0AD4C0EE7D4F02C3FA054B9313F333E67FC3E2BE6C8E`.

64 pruebas distintas en total; no se cuentan repeticiones como pruebas nuevas.
Se conservan las 31 anteriores. La prueba de arranque recibe configuración ficticia
explícita y una base inaccesible para seguir acreditando fallo ante puerto ocupado.
Las pruebas de persistencia solo cambian el número de migraciones esperado y la
numeración de la migración fallida: siguen probando rollback real de DDL y registro.

Las 19 nuevas de integración prueban Argon2 real, correo/contraseña incorrectos
con respuesta equivalente, campos extras, límites de entrada, contraseña sin trim,
CSRF ausente/erróneo/otra sesión/previo al login, Origin/Referer, regeneración/409,
cookie manipulada, expiración absoluta y preautenticación, logout, otra aplicación
con el mismo store/secreto, usuario eliminado/rol actual, fallos del store/guardado/
invalidación/consulta, límites IP y fallos con Retry-After y recuperación, y Secure.
Todas usan PostgreSQL real, credenciales ficticias generadas y esquemas nuevos propios.
Los fallos selectivos de callbacks se inyectan sobre el store real; no se sustituye
por MemoryStore. El reloj inyectado evita esperar horas.

Las cuatro nuevas pruebas API sin base cubren configuración y límites acotados.
Las diez nuevas de frontend cubren formulario/teclado/login/logout, recuperación,
redirección, error técnico, error de credenciales sin reintento, logout no confirmado,
caducidad/caché, respuestas tardías, cambio de usuario y eventos de foco/pestañas.

### Navegador y HTTP

El conector Playwright devolvió Extension connection timeout. Se usó Chrome ya
instalado con CDP, sin instalar extensión/navegador ni cambiar perfiles del usuario.
Comprobador puntual privado .local/auth-browser-check.mjs; credenciales leídas en
memoria desde el archivo privado, nunca impresas. Capturas no contienen contraseñas,
cookies o tokens.

Se completó el recorrido en http://127.0.0.1:5173 (Vite proxy) y
http://127.0.0.1:3000 (Express compilado, mismo origen): acceso por teclado, foco
visible, identidad real, recarga, logout, dos pestañas sincronizadas, cambio a revisor,
fallo de red del logout sin confirmar éxito y recuperación manual. Cookie HttpOnly
no visible mediante document.cookie; localStorage/sessionStorage vacíos. Cero
excepciones JavaScript de aplicación observadas. La página técnica sigue funcionando.

Capturas .local/auth-desktop.png, auth-account-desktop.png, auth-mobile.png y
auth-account-mobile.png; revisión visual 1280x900 y 390x844, sin desbordamiento.
Se inspeccionaron formulario y cuenta. No es una auditoría completa de accesibilidad
ni una suite E2E multi-navegador integrada en CI.

.local/auth-http-check.mjs verificó HTTP real compilado en 3100, con detención y
nuevo proceso API: la cookie autenticada seguía recuperando identidad antes del
logout. El SID previo no autenticaba y la cookie autenticada dejó de servir al salir.
Se cerraron los procesos propios. El cierre normal con Ctrl+C también confirmó
HTTP, sesiones y pool cerrados en desarrollo y compilado.

### Datos, revisión y límites

Comprobación SQL final: desarrollo conserva 4 usuarios, 3 tipos, 0 solicitudes y
0 eventos; app de pruebas no contiene filas de negocio. Cero esquemas p02_test_
residuales en ambas bases. Solo se añade la tabla sesiones y sesiones temporales
reales de los recorridos; su expiración/limpieza pertenece al store. No se borran
sesiones desconocidas ni se regeneran credenciales. Se conserva .local y .env privados.

La revisión aplicó security-review a secretos, validación, SQL parametrizado,
sesiones, CSRF/origen, errores, contadores, XSS por escape React y caché. No se afirma
seguridad absoluta. Los tres avisos moderados de node-pg-migrate/glob/minimatch
continúan; también el aviso allowScripts de argon2/esbuild sin fallo de ejecución.
No se aplican --force, --legacy-peer-deps ni se omiten scripts/pruebas para ocultarlos.

TLS real/proxy de despliegue no probado: Secure se comprueba emulando transporte
HTTPS en Express, y navegación real usa HTTP loopback autorizado. Los límites en
memoria son de un proceso y se reinician con API; las sesiones persisten. La
protección de consultas privadas futuras exige queryKey con prefijo private.
No se implementa autorización de solicitudes, flujos, registro, recuperación,
OAuth, MFA, administración ni despliegue. No se inicia el siguiente hito.

CI incorpora orígenes de prueba y un secreto aleatorio exclusivo por runner. Mantiene
npm ci, tipos, pruebas, migraciones repetidas, integración y build; recoge las nuevas
pruebas automáticamente. El secreto no se imprime ni se toma de desarrollo.
Su ejecución remota está pendiente de publicación manual; SUCCESS 43199015562
acredita únicamente ff60200, anterior a estos cambios.

### Archivos de fase 04 y estado final

Modificados (16): .env.example, .github/workflows/ci.yml, AGENTS.md, README.md,
package.json, package-lock.json, apps/api/package.json, apps/api/src/app.ts,
apps/api/src/server.ts, apps/api/tests/server.test.ts,
apps/api/tests/integration/persistence.test.ts, apps/web/src/App.tsx,
apps/web/src/styles.css, docs/DECISIONES.md, docs/PERSISTENCIA.md y docs/STATUS.md.

Nuevos (12): apps/api/migrations/202611120002_sessions.sql;
apps/api/src/auth/authentication.ts, config.ts y limits.ts;
apps/api/tests/auth-config.test.ts, auth-limits.test.ts e integration/auth.test.ts;
apps/web/src/Auth.tsx y auth-client.ts; apps/web/tests/Auth.test.tsx;
docs/AUTENTICACION.md y scripts/auth-config.mjs.

main y HEAD ff60200 conservados, origin sin cambios. Entrega local sin staging,
commit ni push. PostgreSQL detenido y datos conservados; HTTP/Vite/Chrome propios
cerrados. Alex revisará y publicará desde GitHub Desktop y comprobará su CI.
Siguiente hito recomendado: borradores propios con permisos, sin comenzarlo.

Revisión final posterior al cierre: git diff --check correcto; 58 archivos
versionables revisados, 22 enlaces locales existentes, JSON y bloques Markdown
válidos. Comparación contra contraseñas privadas y SESSION_SECRET: cero coincidencias
en archivos versionables y en el frontend compilado. auth:configure repetido conserva
.env byte a byte. Índice vacío; migración inicial, PROJECT_BRIEF, .gitignore y
.gitattributes idénticos a HEAD. Puertos 3000, 3100, 5173 y 55433 libres; sin procesos
Node/Chrome/PostgreSQL propios de las verificaciones. Al detener PostgreSQL antes de
HTTP se observó el aviso genérico previsto de limpieza de sesiones, sin datos sensibles;
health/frontend siguieron disponibles y el cierre posterior de HTTP/store/pool terminó.


## Fase 05 — borradores propios (12/11/2026)

### Punto de partida y alcance

Ruta y raíz Git: C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
Rama main, origin AlexC-0/gestion-solicitudes-aprobaciones, HEAD
36806c81f5dfcf9990c52e5168bdcb9932d77ad2. Inicio limpio, sin cambios pendientes.
No se inspeccionó ni modificó Proyecto 01. Se leyeron contrato funcional,
decisiones, persistencia, autenticación y estado; SOLICITUDES se escribió antes
del código y AGENTS refleja el nuevo encargo explícito.

La CI histórica de autenticación 43202926347 SUCCESS y sus 64 pruebas fue
aportada por Alex. No se ejecutó CI remota para estos cambios ni se atribuye
a ellos ese éxito. No hubo staging, commit, push ni cambios de remoto.

### Comportamiento y decisiones comprobados

- Catálogo mínimo codigo/nombre; alta solo solicitante con identidad del servidor.
  DTO estricto, título trim, tipo configurado, descripción opcional y Unicode por
  puntos de código; rechazo de campos adicionales, NUL, surrogates y etiquetas.
- Listado 20 por defecto, máximo 100; pagina/tamano validados, orden estable
  creada_en DESC/id DESC y total coherente en una sentencia. Sin filtros.
- Lista/detalle comparten aislamiento del brief. Ajena/inexistente/revisor sobre
  borrador: 404. Creación por revisor: 403. Propia fuera de borrador: PATCH 409.
- Transacción para solicitud/evento; fallo de evento revierte ambos. Edición
  bloquea fila propia, comprueba estado y modifica contenido/fecha sin eventos.
  Prueba concurrente verifica espera real del bloqueo con pg_blocking_pids.
- Router privado reutiliza ciclo completo de sesión, caducidad absoluta, touch
  fijo, identidad, parser y errores. No-store y CSRF/origen en escrituras.
  Rutas API desconocidas conservan 404 fuera de sesiones.
- React: listado/páginas, alta, detalle/historial y edición; carga, vacío, error,
  confirmación, etiquetas, teclado y foco. Sin controles de futuras transiciones.
- Caché private + usuario + generación, AbortSignal y descarte de respuestas
  tardías. Se elimina formulario al cambiar/salir/caducar; mismo usuario/rol/
  vencimiento al foco conserva el trabajo. CSRF tardío no inicia una creación
  de la cuenta anterior. Error de red tras POST reconoce guardado incierto.
- Se conservan dependencias, lockfile, CI, PROJECT_BRIEF y ambas migraciones
  publicadas. No se ejecutó prepare, reset, initdb, seed ni regeneración de claves.

### Comandos y resultados locales nuevos

Node v24.13.0; npm efectivo 11.19.1 comprobado; PostgreSQL 18.6 existente en
127.0.0.1:55433. Todos los comandos npm usan
npx --yes --package=npm@11.19.1 npm como prefijo.

| Comando tras ese prefijo | Resultado |
| --- | --- |
| ci | Correcto, 294 paquetes instalados; lockfile sin cambios |
| run db:local -- status | Instancia existente detenida al comenzar |
| run db:local -- start | Instancia propia arrancada, datos conservados |
| run typecheck | API y frontend correctos |
| test | 14 API + 27 frontend = 41, sin fallos ni omitidas |
| run test:integration | 47 con PostgreSQL real, sin fallos ni omitidas |
| run build | API TypeScript y frontend Vite correctos |
| run dev | API 3000 + Vite 5173, proxy real comprobado |
| start | API y frontend compilados en 3000, mismo origen |
| run db:local -- stop / status | Detenida al finalizar, datos conservados |

Total final: 88 pruebas. Se conservan las 64 anteriores y se añaden 12 de
integración y 12 de frontend. Integración cubre Unicode frontera, campos extra,
catálogo, transacciones, aislamiento, concurrencia, orden/páginas, caducidad y
CSRF/origen, errores de SQL/store e independencia de health/404. Frontend cubre
crear/leer/editar, errores, validación, páginas, conservación al foco, limpieza
de sesión y respuestas/CSRF tardíos. Última integración: 47/47 en 81,96 s.

Durante desarrollo, typecheck detectó isWellFormed fuera de la lib TS configurada:
se sustituyó por validación Unicode compatible y volvieron a pasar los controles.
Una consulta de versión npm sin elevación falló por permiso de caché (EPERM);
repetida en el contexto autorizado devolvió 11.19.1. No se cambió npm global.
npm ci conserva tres avisos moderados conocidos y avisos allowScripts de
argon2/esbuild; no se usaron --force ni omisión de scripts/pruebas.

### Navegador y HTTP reales

.local/solicitudes-browser-check.mjs ejecutado contra 5173 y 3000:
login, creación por teclado (Tab/select/textarea/Enter), comprobación al foco
sin perder formulario, detalle, recarga con persistencia, edición y un único
evento de creación, vuelta al listado y logout. Segunda cuenta: detalle/PATCH
404 y listado sin datos de la primera. Revisor: creación 403, detalle 404 y
ningún borrador en lista. Health correcto, cero excepciones JavaScript.
Cookie HttpOnly no accesible y almacenamiento web vacío.

Capturas privadas .local/solicitudes-form/detail/mobile/list-dev/build.png;
inspeccionados formulario de escritorio y detalle móvil en ambos entornos.
1280x900 y 390x844, sin desbordamiento; foco visible y campos etiquetados.
No es una auditoría completa de accesibilidad, un dispositivo móvil físico
ni una suite E2E multi-navegador incorporada a CI.

.local/solicitudes-http-check.mjs contra el compilado final comprobó listado y
detalle persistentes, historial, no-store, CSRF ausente y origen ajeno 403,
HTML/assets 200 y recursos/API desconocidos 404. No creó más solicitudes.

.local/phase05-outage.mjs detuvo PostgreSQL mientras HTTP seguía activo:
con cookie autenticada, catálogo/lista/me devolvieron 503 genérico y no-store;
health/HTML siguieron en 200 y API desconocida en 404. Primer intento del
harness agotó su keep-alive mientras ejecutaba síncronamente la parada y recibió
ECONNRESET; repetido con conexiones nuevas pasó. No se reintentaron escrituras.
Después se cerraron HTTP/store/pool. Ctrl+C produjo el mensaje de cierre ordenado;
el wrapper npm de Windows termina con código 1 por interrupción, no por fallo de API.

### Conservación de datos, revisión y límites

Consulta real a ambas bases, tras todas las suites:
desarrollo 4 usuarios, 3 tipos, 2 solicitudes y 2 eventos; app de pruebas cero
filas en esas tablas. Cero esquemas p02_test_ residuales en ambas bases.
Los dos borradores ficticios de Chrome se conservan:
87ab33fa-7f33-4ddc-a6a3-29ee35ea71fd (desarrollo) y
d5a727e6-0a97-48f8-9dd6-80be31b5dc6e (compilado), títulos «Prueba fase 05 … editada».
Las sesiones temporales reales quedan sujetas a su caducidad; no se borraron
sesiones desconocidas. Credenciales, .env y cluster conservados.

Revisión de SQL parametrizado, permisos, errores, no-store, escape React y
respuestas tardías. Comparación en memoria contra contraseñas locales y
SESSION_SECRET: cero coincidencias en archivos versionables y assets compilados.
Enlaces locales verificados y diff revisado. Sin secretos o capturas en Git.
PostgreSQL detenido y puertos 3000, 5173, 55433 sin listeners al terminar;
Chrome de verificación cerrado y perfiles propios eliminados.

Límites: sin filtros de estado, idempotencia de creación ni versiones optimistas;
páginas pueden desplazarse ante inserciones concurrentes y última escritura gana
en campos editados simultáneamente. TLS real/proxy y otros navegadores no probados.
Continúan los avisos moderados de herramientas ya documentados. Sin envío,
asignación, cancelación, resolución, bandeja de revisores, administración ni despliegue.
No se avanza al siguiente hito.

### Archivos y entrega manual

Modificados (13):
- AGENTS.md y README.md.
- apps/api/src/app.ts, apps/api/src/server.ts y apps/api/src/auth/authentication.ts.
- apps/web/src/App.tsx, apps/web/src/Auth.tsx, apps/web/src/auth-client.ts y apps/web/src/styles.css.
- docs/AUTENTICACION.md, docs/DECISIONES.md, docs/PERSISTENCIA.md y docs/STATUS.md.

Nuevos (5):
- apps/api/src/solicitudes.ts.
- apps/api/tests/integration/solicitudes.test.ts.
- apps/web/src/Solicitudes.tsx.
- apps/web/tests/Solicitudes.test.tsx.
- docs/SOLICITUDES.md.

main/HEAD/origin conservados; 18 archivos locales sin staging. Alex revisará,
seleccionará, hará commit y push desde GitHub Desktop y comprobará la CI de ese
nuevo commit. No se publicaron cambios automáticamente.

Summary propuesto: feat: gestionar borradores propios con permisos y persistencia

Description propuesta:
Añade catálogo y creación, listado paginado, detalle/historial y edición de
borradores propios en Express y React. Aplica permisos por rol/autor, evento
inicial atómico, bloqueo de edición, validación Unicode y ciclo completo de sesión.
Conserva formularios al revalidar la misma sesión y descarta datos/respuestas de
cuentas anteriores. Actualiza contrato y documentación de fase 05.
Verificado con tipos, 88 pruebas, build, HTTP y Chrome en desarrollo y compilado.
Sin nuevas dependencias ni migraciones; CI pendiente de esta publicación.


## Fase 06 — envío, cancelación y bandeja (12/11/2026)

### Origen y alcance

Ruta/raíz Git C:\Users\kaosk\source\repos\gestion-solicitudes-aprobaciones.
main limpio al empezar, HEAD 7571f83952103dce1f54a3a94755a661b21fb749, origin
AlexC-0/gestion-solicitudes-aprobaciones. Sin trabajo posterior que sobrescribir.
Proyecto 01 no inspeccionado ni modificado. Lectura de AGENTS, README, brief,
decisiones, estado, persistencia, autenticación y solicitudes antes de implementar.
Contrato ampliado primero; AGENTS actualizado al nuevo encargo explícito.

Cierre remoto de fase 05: CI 43207099040 SUCCESS y 88 pruebas, aportado por Alex.
Esta entrega no se ha publicado ni tiene CI remota verificada. No se atribuye
el resultado anterior a los cambios nuevos.

### Implementación y decisiones

- POST /api/solicitudes/:id/enviar y /cancelar, con {} o sin cuerpo; sin query ni
  campos adicionales. Solo autor solicitante; ajeno/inexistente/revisor 404.
  Sesión 401, CSRF/origen 403, entrada 400/413 y estados incompatibles/repetidos 409.
- Envío bloquea la fila, valida contenido guardado y descripción 10–3000 puntos de
  código; asigna según el tipo guardado. Configuración/revisor protegidos por
  FOR SHARE; rol incorrecto devuelve 409 ASSIGNMENT_UNAVAILABLE y no modifica nada.
- Cancelación desde borrador conserva responsable/envío null; desde pendiente
  conserva responsable/envío. Registra finalización. Aprobada/rechazada/cancelada
  no admiten cancelación, envío ni edición; no hay reapertura ni borrado.
- Estado, metadatos y evento se confirman juntos. Fecha generada después del
  bloqueo; evento copia la fecha SQL exacta. Fallo del evento revierte todo.
- Lectura de expediente/historial/nombres mínimos en una sola sentencia MVCC.
  Nombres del autor, responsable y actores solo dentro del expediente autorizado;
  no se añaden directorio ni correos. El historial conserva orden y estados.
- Listado con filtro estado validado y ámbito común a filas/total. Orden y
  paginación anteriores conservados; filtro cambia a página 1 en React.
- /solicitudes se adapta al rol. Bandeja del revisor inicialmente pendiente,
  acceso al resto de asignadas mediante filtro, sin controles de escritura.
  Autor puede enviar o cancelar según estado; confirmación explícita de cancelación.
- Tras acción, se invalidan detalle/listados y se muestra confirmación específica.
  409 o red permiten actualizar detalle antes de repetir. Sin reintentos automáticos.
  Usuario/generación/filtro forman claves privadas; se descartan acciones tardías
  y se elimina la confirmación al cambiar de cuenta.
- Esquema, migraciones, dependencias, lockfile, CI, PROJECT_BRIEF, motor de
  autenticación y auth-client conservados. No se usó prepare/reset/initdb/seed,
  ni se regeneraron secretos. Sin aprobación/rechazo o infraestructura adicional.

### Pruebas y comandos ejecutados

Node v24.13.0; npm efectivo 11.19.1; PostgreSQL 18.6 en 127.0.0.1:55433.
Todos los comandos npm se ejecutaron con el prefijo
npx --yes --package=npm@11.19.1 npm.

| Comando tras el prefijo | Resultado real |
| --- | --- |
| ci | Correcto, 294 paquetes; lockfile conservado |
| run db:local -- status / start | Instancia existente detenida al inicio; arranque correcto |
| run typecheck | API/frontend y pruebas correctos |
| test | 14 API y 38 frontend correctas, sin omitidas |
| run test:integration | 63 con PostgreSQL real correctas, sin omitidas |
| run build | API TypeScript y frontend Vite correctos |
| run dev | API 3000 y Vite 5173; proxy real correcto |
| start | API/frontend compilados en 3000; mismo origen |
| run db:local -- stop / status | Detenida al finalizar, datos conservados |

115 pruebas: las 88 anteriores se conservan sin modificar sus archivos;
16 nuevas de integración y 11 nuevas de frontend. Sin cifra artificial.

Integración añade envío/validación/asignación, configuración inválida, cancelación
antes/después de envío, dos solicitantes/dos revisores, terminales, filtros y
paginación, cuerpos/UUID/query, sesión/CSRF/origen/caducidad, rollback de todos
los metadatos y detalle coherente bajo transición concurrente.

Concurrencia: una conexión retiene la fila y las dos peticiones se ponen en cola.
El helper recorre pg_blocking_pids desde esa conexión hasta sus esperas indirectas
antes de liberarla: no depende de sleeps ni cuenta bloqueos de otra procedencia.
Verifica dos envíos, dos cancelaciones, edición/envío en ambos órdenes,
envío/cancelación en ambos órdenes y lectura/transición solapadas. Histórico
coherente y fechas posteriores a cambios confirmados. Sin escrituras parciales.

Frontend añade flujo de envío, confirmación de cancelación por teclado, filtros/
páginas, bandeja sin acciones, recuperación tras 409, incertidumbre de red,
validación, terminales, error técnico y cambio de sesión durante confirmación/POST.
La primera ejecución detectó pérdida de foco al cerrar con Escape: el botón aún
estaba deshabilitado durante la llamada focus. Se corrigió esperando al render
de cierre y la suite final pasó, sin debilitar la aserción.

npm ci mantiene los tres avisos moderados conocidos y avisos allowScripts de
argon2/esbuild. No se aplicó --force, actualización masiva ni omisión de scripts.
No se han instalado herramientas globales ni modificado servicios del sistema.

### Chrome y HTTP reales

.local/workflow-browser-check.mjs pasó contra 5173 y 3000:
creación por teclado (Tab/select/textarea/Enter), envío, asignación a Revisor Uno,
recarga, login del revisor y bandeja pendiente, detalle con nombre de autor e
historial, regreso del autor, confirmación de cancelación, Escape con foco
restaurado, aceptación por teclado, estado terminal/historial y conservación de
acceso del revisor mediante filtro cancelada. Revisor Dos ajeno: GET/acción 404.
Sin controles de aprobación/rechazo; cero excepciones JavaScript y almacenamiento
web vacío. Credenciales privadas únicamente en memoria, nunca en la salida.

Capturas privadas .local/workflow-*-dev.png y .local/workflow-*-build.png.
Revisados detalle de escritorio, detalle del revisor, confirmación móvil y bandeja.
Viewport 1280x900 y 390x844, sin desbordamiento horizontal, etiquetas y foco
visibles. No es prueba en dispositivo físico, auditoría completa de accesibilidad
ni suite E2E multi-navegador de CI.

.local/workflow-http-check.mjs sobre el compilado verificó filtro/detalle/historial,
nombres mínimos, no-store, sesión ausente 401, CSRF/origen 403 en ambas acciones,
repetición 409, campos manipulados 400, HTML/health 200 y API desconocida 404.
No creó datos adicionales ni alteró solicitudes terminales.

### Datos, revisión y cierre

Tras suites y navegador: desarrollo conserva 4 usuarios, 3 tipos, 4 solicitudes
y 8 eventos. app de pruebas: cero usuarios/tipos/solicitudes/eventos. Cero esquemas
p02_test_ residuales. Se conservan los dos borradores de fase 05 y se añaden dos
solicitudes ficticias enviadas/canceladas con tres eventos cada una:
1f8a7e52-a37d-42df-947b-cdd7f26b69fb (dev) y
c651b0de-581b-4f75-af3c-5d9e7619b296 (compilado).
Sesiones temporales sujetas a caducidad normal; no se limpiaron sesiones ajenas.

Revisión de SQL parametrizado, ámbito de permisos, transacciones, instantánea,
CSRF/caducidad, errores, nombres mínimos, escape React y respuestas antiguas.
Comparación en memoria con contraseñas y SESSION_SECRET: cero coincidencias
en archivos versionables y assets compilados. Enlaces y diff correctos.
No se versionan scripts privados de verificación ni capturas.

HTTP/Vite y Chrome propios cerrados; store/pool liberados; PostgreSQL detenido
con datos conservados y puertos 3000/5173/55433 sin listeners. Los wrappers npm
de Windows terminan con código 1 al recibir Ctrl+C, con mensaje de cierre ordenado.

Límites: sin idempotencia general, aprobaciones/rechazos, administración, adjuntos,
notificaciones o despliegue. Repetir acciones finalizadas da 409; un fallo de red
exige comprobar detalle. Paginación por desplazamiento puede variar ante nuevas
inserciones; no hay versión optimista de contenido. Otros navegadores, TLS/proxy
real y dispositivo móvil físico no comprobados. No se inicia el siguiente hito.

### Manifiesto y publicación manual

Modificados (12):

- AGENTS.md y README.md.
- apps/api/src/solicitudes.ts.
- apps/web/src/App.tsx, Auth.tsx, Solicitudes.tsx y styles.css.
- docs/AUTENTICACION.md, DECISIONES.md, PERSISTENCIA.md, SOLICITUDES.md y STATUS.md.

Nuevos (4):

- apps/api/tests/integration/workflow-fixture.ts.
- apps/api/tests/integration/workflow.test.ts.
- apps/web/src/SolicitudActions.tsx.
- apps/web/tests/Workflow.test.tsx.

main/HEAD/origin conservados; 16 archivos locales sin staging. Commit y push
pendientes de Alex desde GitHub Desktop, seguidos de CI del nuevo commit.

Summary: feat: enviar y cancelar solicitudes con bandeja del revisor

Description:
Añade envío con asignación automática por tipo, cancelación por autor y eventos
atómicos. Incorpora filtros de estado, bandeja de consulta del revisor y detalle/
historial coherentes con nombres mínimos. Protege permisos, concurrencia, sesión
y respuestas tardías; exige confirmación de cancelación y permite recuperar
el detalle ante conflictos o incertidumbre de red.
Verificado con 115 pruebas, tipos, build, HTTP y Chrome en desarrollo y compilado.
Actualiza contrato y documentación; conserva migraciones y dependencias.

## Fase 07 — aprobación, rechazo y consulta del resultado

### Punto de partida y alcance

Inspeccionados carpeta/raíz Git del Proyecto 02, main, origin y árbol inicialmente
limpio sobre f1a10a764d72c6622ccc910b247152ad36b2ec66. No se inspeccionó ni
modificó el Proyecto 01. Leídos AGENTS, README, PROJECT_BRIEF, DECISIONES, STATUS,
PERSISTENCIA, AUTENTICACION y SOLICITUDES. Contrato de decisiones ampliado antes
de implementar. AGENTS refleja la autorización expresa y conserva las reglas
permanentes, especialmente staging/commit/push manuales.

POST aprobar/rechazar valida JSON estricto, Unicode y texto plano. Solo el
revisor asignado resuelve una pendiente; fuera de ámbito 404 y terminales 409.
Comentario opcional recortado/vacío a null; motivo obligatorio recortado de
10–1000 puntos de código, guardado exclusivamente en el evento.
Bloqueo por fila, comprobación del estado, timestamp posterior al bloqueo,
UPDATE e INSERT en la misma transacción. Respuesta 200 después de COMMIT.
Fallo del evento revierte todos los cambios; no hay reasignación ni reapertura.

ReviewActions incorpora formularios, aviso definitivo, confirmación explícita,
validación asociada, foco/retorno, controles deshabilitados durante escritura,
limpieza por generación y recuperación del detalle. Historial con etiquetas
legibles y comentarios escapados que conservan saltos de línea. Se mantienen
filtros, paginación, acciones del autor y las garantías de sesión existentes.

No se modifican migraciones publicadas, dependencias, lockfile, CI, AuthClient,
infraestructura, datos anteriores o credenciales. Sin nuevas funcionalidades
fuera de aprobación/rechazo. Sin preparación/reset/initdb/seed ni despliegue.

### Comandos y resultados locales

Windows; Node.js 24.13.0, npm 11.19.1 temporal y PostgreSQL 18.6.
Todos los comandos npm se ejecutaron con el prefijo
npx --yes --package=npm@11.19.1 npm.

| Comando tras el prefijo | Resultado |
| --- | --- |
| ci | Correcto, 294 paquetes, lockfile intacto |
| run db:local -- status / start | Instancia existente comprobada y arrancada en 127.0.0.1:55433 |
| run typecheck | API y web correctos |
| test | 14 API + 50 frontend correctas |
| run test:integration | 80 correctas con PostgreSQL real, ninguna omitida |
| run test:integration -- apps/api/tests/integration/decisions.test.ts | 17 correctas tras reforzar la igualdad de fechas en SQL |
| run db:local -- stop / status | Instancia detenida al terminar; datos conservados |
| run build | API y web correctos; Vite 144 módulos |
| run dev | API 3000 y proxy Vite 5173 verificados |
| start | Compilado/API/HTML/assets en 3000 verificados |

Total: 144 pruebas; 17 nuevas de integración y 12 de frontend. Se conservan los
casos anteriores. Workflow.test.ts solo extrae los helpers existentes de espera
y carrera a workflow-fixture.ts; en frontend se actualiza la expectativa del
revisor pendiente para admitir decisiones, conservando la prohibición de acciones
del autor y la ausencia de acciones en terminales.

Integración comprueba comentario omitido/vacío/normalizado, motivo, límites
Unicode (emoji, combinantes, NUL/surrogates/etiquetas), JSON/query/UUID/tamaño,
campos controlados, dos autores/dos revisores, lecturas aisladas, repetición sin
cambios, 401/403/caducidad, rollback y todos los enfrentamientos terminales.
Las carreras retienen la fila con una conexión propia y observan ambas esperas
directas/indirectas mediante pg_blocking_pids antes de liberar el bloqueo.
Doble aprobación, doble rechazo, aprobar/rechazar y resolución/cancelación en
ambos órdenes producen 200/409, un solo evento terminal y comentario ganador.
La igualdad de fechas se comprueba también en SQL para conservar microsegundos,
sin depender de la precisión de Date/JSON.

Frontend comprueba confirmaciones, campos opcionales/obligatorios, límites,
foco y Escape/volver, texto plano, actualización de historial, filtros, 409,
red incierta sin reintento, error técnico, escritura deshabilitada, caducidad
y respuesta tardía al cambiar cuenta. El foco de la misma sesión conserva texto;
el estado terminal actualizado elimina el formulario.

La primera comprobación de tipos detectó que useRef requería valor inicial:
se corrigió. Una primera ejecución de la nueva suite web necesitó esperar la
notificación asíncrona de QueryClient antes de comprobar el desmontaje; se añadió
waitFor sin debilitar la aserción. Las ejecuciones finales anteriores pasaron.
npm ci conserva los tres avisos moderados conocidos y allowScripts de
argon2/esbuild. No se aplicó force ni actualización masiva.

### Navegador y HTTP reales

.local/decisions-browser-check.mjs completó sobre 5173 y 3000:

- Crear por teclado → enviar → aprobar con comentario → recargar → consultar
  decisión/comentario como autor y encontrarla mediante filtro Aprobada.
- Crear → enviar → rechazar con motivo multilínea → recargar → consultar
  decisión/motivo como autor y encontrarla mediante filtro Rechazada.
- Revisor con motivo en edición mientras el autor cancela desde otro contexto
  independiente de Chrome; confirmar rechazo devuelve 409, muestra el conflicto
  y Actualizar detalle recupera cancelada/historial, elimina texto y acciones.

Se verificó foco de campo, conservación del texto al revalidar la misma sesión,
Tab/Enter para confirmar, formularios/lecturas con 1280x900 y 390x844, sin
desbordamiento horizontal. Cero excepciones JavaScript y almacenamiento web vacío.
Capturas privadas .local/decisions-*-dev.png y .local/decisions-*-build.png;
inspección visual del formulario de aprobación, rechazo móvil, historial del
autor y conflicto. No constituyen auditoría completa de accesibilidad, prueba
en dispositivo físico ni suite E2E multibrowser en CI.

Una primera ejecución parcial dejó dos solicitudes resueltas de desarrollo.
La validación completa se repitió con el script esperando el render entre cambios
del select por teclado; las dos ejecuciones finales dev/compilado completaron
los tres recorridos. Se conservaron también los datos de la ejecución parcial.

.local/decisions-http-check.mjs sobre el compilado confirmó filtros de decisiones,
detalle/historial y comentarios, no-store, 401 sin sesión, 403 CSRF/origen,
409 al repetir ambas decisiones y 400 por campos manipulados. Las solicitudes
terminales permanecieron idénticas después de los intentos. HTML/assets/health
correctos y 404 para API/asset desconocidos; sin datos nuevos en esta comprobación.
Credenciales solo en memoria; no se imprimieron ni incorporaron a capturas.

### Relación con A01–A13 y límites

PROJECT_BRIEF conserva los requisitos originales. Esta tabla relaciona evidencias
actuales; no sustituye la revisión final de V1 ni declara su aceptación definitiva.

| Criterio | Evidencia local actual | Comprobación final pendiente |
| --- | --- | --- |
| A01 | Suites de borradores/workflow/decisions; flujos completos de resolución en Chrome y terminales inmutables | Revisión conjunta del alcance V1 tras publicación |
| A02 | Límites de título/descripción y envío anteriores; motivo/comentario Unicode, trim, fronteras y texto plano nuevos | Revisión final del contrato y casos de aceptación |
| A03 | Dos autores/dos revisores, ámbito SQL en acciones/lecturas, borradores ocultos y acceso terminal | Validación conjunta de la matriz de permisos |
| A04 | JSON estricto, campos manipulados rechazados, asignación del servidor conservada | Revisión final de campos controlados y asignación |
| A05 | Suites de autenticación conservadas; nuevas acciones verifican CSRF/origen, 401, no-store y vigencia absoluta | Revisión final de seguridad; TLS/proxy real no comprobado |
| A06 | Generaciones, limpieza y respuestas antiguas; formularios de decisión eliminados al cambiar sesión/caducar | Recorrido manual final entre cuentas y salida en todas las pantallas |
| A07 | PostgreSQL real, rollback y carreras con espera real; una terminal/evento, comentario ganador y fechas SQL iguales | Revisión final de todas las garantías de persistencia |
| A08 | Componentes con carga/error/validación, foco/retorno; Chrome por teclado y vista móvil | Auditoría completa de accesibilidad y dispositivo físico no realizadas |
| A09 | 14 API + 50 frontend + 80 integración; HTTP y recorridos Chrome dev/compilado | Otros navegadores y E2E multibrowser en CI no comprobados |
| A10 | npm ci con lockfile intacto; _test comprobada y esquemas propios, datos app conservados | Revisión reproducible final sobre el commit publicado |
| A11 | CI de fase 06 vinculada a f1a10a7; evidencia local de fase 07 separada | Commit/push manual y CI del nuevo commit; cierre documental V1 no iniciado |
| A12 | Suites existentes de página 20/máximo 100/orden/filtro; aprobación/rechazo filtrables en HTTP y Chrome | Revisión final de paginación y permisos en todos los estados |
| A13 | Autor/responsable consultan historial y comentario; repetición/rollback sin eventos extra | Revisión final de trazabilidad y ausencia de edición/borrado |

Las comprobaciones técnicas de esta fase están relacionadas con todos los
criterios, pero A08/A09 conservan los límites anteriores y A11 necesita evidencia
remota nueva. La revisión global A01–A13 requiere un encargo posterior: no se
inicia automáticamente. Se mantiene paginación por desplazamiento, sin promesa
de instantánea entre peticiones ni infraestructura general de idempotencia.

### Datos conservados y revisión de entrega

Auditoría local: desarrollo con 4 usuarios, 3 tipos, 12 solicitudes y 32 eventos;
incluye los datos anteriores y ocho solicitudes ficticias de esta fase (dos de
la ejecución parcial y tres por cada recorrido completo). app de pruebas vacío,
cero esquemas p02_test_ residuales. No se eliminaron datos o sesiones ajenos.
Las sesiones temporales siguen su caducidad normal.

Recorridos completos conservados, en orden aprobación/rechazo/cancelación:

- Desarrollo: 3606a45e-ebf1-4741-9804-e651c8e6c60d,
  b8b9090e-ddf5-402b-8e63-ae88e486b526,
  5de549ea-fb3c-4b5c-ac77-431cf8c9d8a8.
- Compilado: 500b6d48-6a25-4c2c-87c9-baa38160bcee,
  db421d9c-d7cd-45f9-84c8-3cee456af06e,
  719c771d-12aa-4630-9e54-a6b1df69ffe2.

Revisados SQL parametrizado, ámbito, COMMIT, rollback, comentarios, sesión,
generaciones y diff. Scripts/capturas permanecen ignorados en .local.
Auditoría final: 70 archivos versionables, 27 enlaces locales válidos, cero
coincidencias con las contraseñas privadas y SESSION_SECRET en archivos o assets.
git diff --check correcto. Typecheck repetido tras la última aserción SQL: correcto.
Chrome y sus perfiles temporales cerrados; API/store/pool cerrados ordenadamente,
Vite cerrado y PostgreSQL detenido con datos conservados. Cero listeners en
3000/5173/55433 y cero perfiles temporales auth-browser-. El wrapper npm de
Windows devuelve código 1 al recibir Ctrl+C pese al cierre ordenado del servidor.

### Manifiesto y publicación manual

Modificados (14):

- AGENTS.md y README.md.
- apps/api/src/solicitudes.ts.
- apps/api/tests/integration/workflow-fixture.ts y workflow.test.ts.
- apps/web/src/App.tsx, Solicitudes.tsx y styles.css.
- apps/web/tests/Workflow.test.tsx.
- docs/AUTENTICACION.md, DECISIONES.md, PERSISTENCIA.md, SOLICITUDES.md y STATUS.md.

Nuevos (3):

- apps/api/tests/integration/decisions.test.ts.
- apps/web/src/ReviewActions.tsx.
- apps/web/tests/Decisions.test.tsx.

main y HEAD f1a10a764d72c6622ccc910b247152ad36b2ec66 conservados; origin sigue
apuntando a AlexC-0/gestion-solicitudes-aprobaciones. Los 17 archivos quedan sin
staging. Commit y push pendientes exclusivamente de Alex desde GitHub Desktop,
seguidos de la CI del nuevo commit. No se atribuye la CI anterior a estos cambios.

Summary: feat: aprobar y rechazar solicitudes con decisiones trazables

Description:
Añade aprobación con comentario opcional y rechazo con motivo obligatorio para
el revisor asignado. Guarda estado, fechas y evento en una transacción, valida
permisos y Unicode y protege la resolución frente a decisiones/cancelaciones
concurrentes. Incorpora formularios accesibles, comentarios en historial y
recuperación ante conflictos o red incierta. Conserva sesiones, borradores,
envío, cancelación, filtros, dependencias y migraciones.
Verificado con 144 pruebas, tipos, build, HTTP y Chrome en desarrollo y compilado.
Actualiza contrato, documentación y evidencias A01–A13, sin declarar cerrada V1.

## Corrección de CI — fecha única en preparación concurrente

### Evidencia remota y causa

Ejecución [43213467827](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43213467827)
del commit 873374440af302da8a398145e37fb42aa547fb00, según la evidencia
verificada aportada por Alex: instalación, tipos y migraciones correctos,
14 API + 50 frontend correctas; integración 79 correctas y una fallida.
Las 17 de decisions.test.ts pasaron; build omitido por el fallo de integración.

La prueba «estado concurrente confirmado antes del bloqueo impide una edición
desfasada», en solicitudes.test.ts, preparaba cancelada usando dos evaluaciones
independientes de clock_timestamp(). En el runner quedaron:

- actualizada_en: 2026-11-12 11:57:49.175024+00.
- finalizada_en: 2026-11-12 11:57:49.175025+00.

La diferencia de un microsegundo infringió finalizada_en <= actualizada_en:
SQLSTATE 23514, solicitudes_check2. Ocurrió en el UPDATE de preparación, antes
de lanzar el PATCH, no en la resolución de negocio. Las comprobaciones locales
históricas no garantizaban que ambas llamadas produjeran siempre la misma fecha.

### Corrección y búsqueda de casos equivalentes

La preparación usa WITH momento AS MATERIALIZED con una única evaluación de
clock_timestamp(), reutilizada en finalizada_en y actualizada_en. Se mantienen
BEGIN/COMMIT/ROLLBACK, la conexión que bloquea la fila, el PATCH concurrente,
la comprobación de espera real con pg_blocking_pids, el 409 y el título original.

Tras confirmar la transacción y recibir el PATCH se comprueba en PostgreSQL
finalizada_en=actualizada_en, exigiendo una fila con true. La igualdad usa toda
la precisión almacenada; no depende de conversiones a Date o JSON.
No se añaden esperas, tolerancias, reintentos ni omisiones para ocultar errores.

Búsqueda de relojes y campos temporales en pruebas/fixtures de API y frontend,
además de scripts: no hay otro caso con varias evaluaciones de clock_timestamp
para estas fechas. persistence.test.ts usa now() repetido en un INSERT, junto
con los valores predeterminados de la misma transacción; now() mantiene el
instante de inicio de transacción y no presenta este riesgo. Los otros UPDATE
de ese archivo son casos que deliberadamente esperan 23514. workflow.test.ts
usa una sola llamada a now() o copia fechas existentes; no requiere cambios.
Los mocks web no preparan filas PostgreSQL ni reproducen esta restricción.
Se modifica únicamente solicitudes.test.ts, además de este registro.

No se cambian código de negocio, restricciones SQL, migraciones, dependencias,
lockfile o configuración de CI. No se amplía el alcance ni se inicia cierre V1.

### Verificación nueva y publicación

Inspección inicial: raíz exclusiva del Proyecto 02, main limpio,
HEAD 873374440af302da8a398145e37fb42aa547fb00 y origin
https://github.com/AlexC-0/gestion-solicitudes-aprobaciones.git.
Se conserva el estado del repositorio y se dejan los cambios sin staging.

Todos los comandos npm de esta corrección se ejecutaron con
npx --yes --package=npm@11.19.1 npm. Resultados nuevos:

| Comando tras el prefijo | Resultado |
| --- | --- |
| ci | Correcto: 294 paquetes; package-lock.json conservado sin diff |
| run db:local -- status / start | Instancia existente inicialmente detenida, arrancada en 127.0.0.1:55433 |
| run test:integration -- apps/api/tests/integration/solicitudes.test.ts -t 'estado concurrente confirmado antes del bloqueo impide una edición desfasada' | Cinco ejecuciones acotadas: 5/5 correctas |
| run typecheck | API y frontend correctos |
| test | 14 API y 50 frontend correctas |
| run test:integration | 80 correctas, ninguna omitida; incluye las 17 de decisions.test.ts |
| run build | API y frontend correctos; Vite 144 módulos |
| run db:local -- stop / status | Detenida al terminar, datos conservados |

En cada ejecución filtrada se ejecutó una prueba y las otras once del archivo
quedaron fuera por el filtro -t. No se modificó ninguna prueba para omitirla;
la ejecución completa posterior pasó las 80. Las repeticiones no se cuentan
como pruebas distintas: total final 144 (14 + 50 + 80), sin casos nuevos.

La instalación conserva los tres avisos moderados y los avisos allowScripts
de argon2/esbuild ya conocidos; no se hicieron cambios de dependencias.
No se repitieron recorridos visuales ni se arrancó HTTP: el diff se limita a
pruebas y documentación, conforme al encargo.

Se conservan las comprobaciones current_database antes de crear y eliminar
esquemas propios nuevos de gestion_solicitudes_aprobaciones_test. Auditoría antes
y después: desarrollo con 4 usuarios, 3 tipos, 12 solicitudes y 32 eventos;
app de pruebas vacío y cero esquemas p02_test_ residuales. No se ejecutaron
prepare, reset, initdb ni regeneración de credenciales.

Revisión final: diff correcto, 27 enlaces locales válidos y cero coincidencias
con secretos privados en los 70 archivos versionables y assets. PostgreSQL
propio detenido; datos conservados. No quedan procesos temporales iniciados
por esta corrección.

Archivos modificados, ambos sin staging:

- apps/api/tests/integration/solicitudes.test.ts.
- docs/STATUS.md.

Rama main, HEAD 873374440af302da8a398145e37fb42aa547fb00 y origin conservados.
Staging, commit y push quedan exclusivamente a cargo de Alex en GitHub Desktop.
La CI del arreglo sigue pendiente de publicación y comprobación; estos resultados
son locales. La verificación final de V1 solo comenzará después de comprobar
la nueva CI y recibir el encargo correspondiente.

Summary: test: usar una fecha única en la preparación de concurrencia

Description:
Corrige la preparación del estado cancelado con una única fecha SQL reutilizada
en finalizada_en y actualizada_en. Añade igualdad exacta en PostgreSQL y conserva
la espera real del bloqueo, la respuesta 409 y el título original.
Revisa preparaciones equivalentes sin encontrar otros casos con el mismo riesgo.
Verificado con cinco ejecuciones de la prueba afectada, instalación reproducible,
tipos, 144 pruebas y build. Documenta la CI fallida y deja pendiente la del arreglo.

## Fase 08 — verificación final local y E2E reproducibles

### Inspección y alcance

Raíz exclusiva gestion-solicitudes-aprobaciones, main inicialmente limpio,
HEAD 78404615d5ecb87c14ec20e43caf4c033e08970b y origin correcto.
No se inspeccionó ni modificó el Proyecto 01. Leídos los contratos e instrucciones,
incluida la relación histórica A01–A13. AGENTS actualiza la autorización temporal
a fase 08 y conserva las reglas de Git manual y protección de datos.

Revisión de rutas/permisos, transiciones, validaciones, campos controlados,
asignación, atomicidad, sesiones, CSRF, caché, filtros, errores e historial.
No se identificaron defectos de producto que exigieran cambiar su código.
No se alteran PROJECT_BRIEF, migraciones publicadas, restricciones SQL ni negocio.
Aceptación concreta por criterio, evidencia y límites en ACEPTACION-V1.

### Suite versionada y decisiones

Playwright Test 1.65.0, engines >=20 verificado en el registro npm, compatible
con Node 24.13.0 local y Node 24.22.2 fijado en CI. Añade únicamente tres paquetes:
@playwright/test, playwright y playwright-core, todos fijados por lockfile.
Skill aplicada: ecc:e2e-testing; se priorizan las reglas del encargo sobre los
ejemplos de retries, cuarentena y artefactos de la skill.
Consultadas las guías oficiales de CI y autenticación enlazadas en PRUEBAS.

Un worker, retries=0, forbidOnly, 60 s por caso, 240 s global.
Las factorías se importan de apps/api/dist y sirven apps/web/dist. Se reutiliza
withTestSchema para exigir la base exacta antes de crear/eliminar esquemas nuevos.
Migrate sobre vacío y segunda ejecución sin cambios en cada caso. Pool de negocio
y store de sesiones usan explícitamente el mismo esquema exclusivo.

HTTP propio por caso en loopback y puerto efímero asignado por el SO, sin aceptar
servidores ya abiertos. Credenciales/secreto efímeros; no se usan usuarios de app
ni el archivo privado de desarrollo. Acciones principales por interfaz, sin
endpoints alternativos ni mocks. Navegador/contextos cierran antes de HTTP,
store/temporizadores, pool y esquema, incluso ante fallos.

Cinco casos:
1. Crear/editar/enviar/aprobar por teclado, consulta del autor y filtro.
2. Rechazar en móvil, motivo validado e historial desde autor y revisor.
3. Cancelación antes/después del envío, visibilidad distinta y acceso ajeno denegado.
4. Cancelación del autor en otro contexto mientras se prepara rechazo: 409 y recuperación.
5. Logout, atrás y cambio de cuenta sin recuperar datos privados anteriores.

El reporter solo imprime caso/estado y ubicaciones, sin argumentos privados.
Sanea el error-context.md automático; sin storageState, trazas de login o vídeos.
Capturas explícitas después del login en test-results/e2e, ignoradas y no subidas
a CI. La configuración no publica artefactos de autenticación.

### Verificación nueva

Todos los comandos npm usaron npx --yes --package=npm@11.19.1 npm:

| Comando tras el prefijo | Resultado real |
| --- | --- |
| view @playwright/test version engines peerDependencies --json | 1.65.0, engines >=20, sin conflictos de peers declarados |
| audit --json | Tres avisos moderados conocidos; alcance detallado abajo |
| install --save-dev --save-exact @playwright/test@1.65.0 | Dependencia y lockfile actualizados de forma acotada |
| exec -- playwright install chromium | Chromium 158.0.8127.18, revisión 1254, descargado en caché Playwright |
| ci | Instalación limpia correcta: 297 paquetes; conserva el lockfile actualizado |
| run db:local -- status / start | Instancia existente inicialmente detenida; arranque en 127.0.0.1:55433 |
| run typecheck | API/web y nuevos archivos E2E correctos |
| test | 14 API + 50 frontend correctas |
| run test:integration | 80 correctas, ninguna omitida; 149,70 s |
| run build | API y web correctos; 144 módulos Vite |
| run test:e2e | Cinco correctas, cero retries y sin omisiones |
| run dev | Proxy real comprobado en 5173 |
| start | Arranque compilado real y comprobaciones HTTP en 3000 |

Total: 149 casos distintos. No se cuentan repeticiones de diagnóstico ni controles
de fallo provocado como nuevos casos de aceptación. Las suites existentes no se
han modificado ni debilitado.

La primera ejecución de E2E pasó aprobación y logout, pero detuvo tres casos al
navegar inmediatamente después de ver el encabezado Tu cuenta. Se comprobó que
ese encabezado existe durante el estado de comprobación de sesión; el fixture
todavía no había esperado la identidad. Se corrigió esperando el correo visible
de la cuenta autenticada y la URL de detalle. Los cinco casos completos pasaron
después, también en la ejecución posterior a tipos/pruebas/integración/build.
No se añadieron pausas fijas, retries ni timeouts mayores.

La descarga de Chromium tuvo avisos de cadena de certificado en algunos mirrors;
el instalador completó la descarga por sus alternativas. No se desactivó TLS ni
se cambió Chrome o perfiles personales.

Revisión de capturas: detalle aprobado de escritorio y formulario/expediente
rechazado móvil. Viewports 1280x900 y 390x844 sin overflow, foco visible, etiquetas,
aviso definitivo, mensaje de validación y saltos de línea legibles. Escape devuelve
foco; Tab/Enter confirma. Se reutilizan pruebas web de cancelación y formularios.
No constituye auditoría exhaustiva, multibrowser, dispositivo físico o TLS desplegado.

.local/phase08-http-check.mjs comprobó HTML de acceso, API/health, auth/me 401 y
API desconocida 404 con JSON a través de Vite; en compilado verificó además assets
200 y asset inexistente 404. No creó solicitudes ni usó credenciales.

### Instalación, CI y dependencias

README consolidado: nuevo entorno (ci → prepare crea .env/bases → auth:configure
→ check/migrate → seed crea credenciales), entorno preparado, compilado, pruebas,
puertos junto con sus orígenes y detención conservando datos.
La preparación completa desde cero queda documentada, pero NO se ejecutó prepare,
reset, initdb o regeneración de credenciales en esta fase. Sí se verificó instalación
limpia de dependencias y migración repetida sobre esquemas vacíos de prueba.

Audit conserva tres moderados: node-pg-migrate/glob/minimatch. Glob ~13.0.0 no admite
el major corregido sin forzar rangos; npm propone downgrade mayor a node-pg-migrate
7.6.1. Se mantienen explícitos, sin force, overrides incompatibles ni cambios masivos.
Su uso es tooling con rutas de migración locales controladas, no patrones HTTP
aportados por usuarios; no se declara riesgo nulo. Avisos allowScripts de argon2/
esbuild presentes; instalación, Argon2 real y build correctos.

Workflow conserva instalación, tipos, pruebas, migraciones repetidas, integración
y build; añade instalación de Chromium con --with-deps y E2E después del build.
Npm 11.19.1, permisos mínimos, PostgreSQL efímero y timeout de diez minutos
conservados. No hay medición que justifique ampliar ese límite.
Workflow preparado y ejecución local correcta; CI remota de fase 08 pendiente.

### Entrega local

Archivos modificados:
- .github/workflows/ci.yml.
- AGENTS.md y README.md.
- package.json y package-lock.json.
- docs/DECISIONES.md y docs/STATUS.md.

Archivos nuevos:
- playwright.config.ts.
- tests/e2e/fixtures.ts, workflows.spec.ts, reporter.ts y tsconfig.json.
- docs/PRUEBAS.md y docs/ACEPTACION-V1.md.

Rama main/HEAD 78404615d5ecb87c14ec20e43caf4c033e08970b y origin conservados.
Los 14 archivos quedan sin staging. Alex realiza staging, commit y push desde
GitHub Desktop. Candidata V1 verificada localmente; pendiente de publicación
manual y CI final. No tags, releases, despliegue, CV, LinkedIn o portfolio.

Summary: test: verificar la candidata V1 con E2E reproducibles

Description:
Añade cinco recorridos Playwright con Chromium, aplicación compilada y PostgreSQL
real, esquemas exclusivos, credenciales efímeras y limpieza de recursos.
Integra E2E después del build en CI y conserva permisos, controles y npm 11.19.1.
Consolida la guía de instalación/arranque/pruebas y documenta aceptación A01–A13.
Verificado localmente con 149 pruebas, tipos, build, proxy y HTTP compilado.
La aceptación remota final queda pendiente de publicación manual y nueva CI.

### Controles negativos, aislamiento y revisión final

Tres comprobaciones locales de la infraestructura E2E, no sumadas a los 149 casos:

- Caso temporal en .local que accede y provoca un fallo: código 1 esperado,
  navegador/HTTP/store/pool/esquema cerrados. Se inyectó un marcador ficticio
  en el error y se comprobó que el error-context.md saneado no lo conserva.
- TEST_DATABASE_URL temporal apuntando a un puerto sin PostgreSQL: código 1
  y mensaje claro de base requerida, sin esquemas preparados.
- PLAYWRIGHT_BROWSERS_PATH temporal sin Chromium: código 1 y mensaje de instalación
  requerida; el esquema preparado se elimina igualmente.

Las variables se restauraron al terminar. No se modificó .env ni se usaron
credenciales de desarrollo para las E2E. Se verificó también el mensaje seguro
de base ausente después de ajustar el reporter para el prefijo Error: de Playwright.
Typecheck final correcto. Los tres informes negativos conservan solo caso/estado,
sin detalles privados; son controles esperados de fallo, no fallos de aceptación.

Auditoría: desarrollo conserva 4 usuarios, 3 tipos, 12 solicitudes y 32 eventos;
app de pruebas vacío y cero esquemas p02_test_ residuales. 77 archivos versionables,
34 enlaces locales válidos y cero coincidencias con credenciales privadas o
SESSION_SECRET en archivos/compilados. Diff revisado y sin errores.

HTTP/Vite propios cerrados ordenadamente y PostgreSQL detenido con datos
conservados; cero listeners en 3000/5173/55433 y cero Chromium headless propios
activos. Los wrappers npm de Windows devuelven código 1 al recibir Ctrl+C,
con mensaje de cierre correcto de HTTP/sesiones/pool. No hay procesos temporales
pendientes de esta fase.

## Cierre verificado de V1 — registro documental

12 de noviembre de 2026. Aceptación y evidencia final verificadas aportadas por Alex:
[9650ffbfcdd97e1d34f8049362edd1a2c8f802a2](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/commit/9650ffbfcdd97e1d34f8049362edd1a2c8f802a2),
[CI 43224311688 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43224311688).
149 pruebas correctas: 14 API, 50 frontend, 80 de integración con PostgreSQL y
5 E2E con Chromium, aplicación compilada y PostgreSQL real. Instalación reproducible,
tipos, migraciones repetidas, build e instalación/ejecución del navegador correctos.
La revisión desde ChatGPT contrastó E2E, aislamiento, A01–A13 y logs remotos.

Se actualizan README, STATUS, ACEPTACION-V1, PRUEBAS y AGENTS para registrar
la V1 completada y verificada en el alcance acordado. A01, A09 y A11 dejan de tener
pendientes de publicación/CI resueltos por esta ejecución; se conservan A01–A13,
los límites reales y todos los registros históricos anteriores.
Chromium y viewports 1280x900/390x844; sin despliegue/TLS real ni auditorías
exhaustivas. Persisten tres avisos moderados transitivos del tooling de migraciones.
Sin despliegue, tag ni release; cualquier ampliación requiere otro encargo.

Inspección inicial: ruta y raíz Git del Proyecto 02 correctas, rama main limpia,
HEAD 9650ffbfcdd97e1d34f8049362edd1a2c8f802a2 y origin
https://github.com/AlexC-0/gestion-solicitudes-aprobaciones.git.
Esta sesión solo cambia documentación: no modifica código, pruebas, dependencias,
lockfile, CI, migraciones, configuración o datos. No se ejecutan suites ni se
arrancan PostgreSQL o servidores; no se crean procesos temporales propios.

Comprobaciones documentales: revisión del diff, 23 enlaces locales válidos y destinos de
commit/CI, desglose 14 + 50 + 80 + 5 = 149, matriz completa A01–A13 y conservación
del histórico. git diff --check sin errores. Los cinco documentos quedan
modificados sin staging, con HEAD y rama conservados.
Estos controles documentales no son una nueva ejecución técnica ni una consulta
independiente de logs remotos: la evidencia final procede de la aportada por Alex.

Staging, commit y push documentales pendientes exclusivamente de Alex mediante
GitHub Desktop. No se atribuye resultado remoto al futuro commit documental.
Summary propuesto: docs: registrar el cierre verificado de la V1.
