# Estado del Proyecto 02

Fecha de comprobación: 12 de noviembre de 2026 (Europe/Madrid).

## Estado actual — base fullstack

API Express y frontend React/Vite implementados para esta fase mínima, con
workspaces, lockfile, TypeScript estricto, pruebas y workflow inicial. No hay
autenticación, solicitudes, persistencia ni despliegue. El alcance funcional de
PROJECT_BRIEF.md se conserva sin cambios.

La documentación anterior está publicada en `5ef10e5`. Esta base fullstack es una
entrega nueva local, pendiente de revisión, commit y push manuales de Alex.
Los apartados de preparación/publicación siguientes son registros históricos;
la evidencia de esta fase se recoge al final del documento.

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
