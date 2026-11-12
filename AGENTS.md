# Instrucciones para Codex — Proyecto 02

## Preparación y reglas permanentes

- Trabaja exclusivamente en gestion-solicitudes-aprobaciones. No inspecciones ni
  modifiques el Proyecto 01; no copies su implementación, configuración o scripts.
- Antes de modificar, comprueba ruta, raíz Git, git status --short --branch, rama
  y remotos. Conserva los cambios del usuario; no sobrescribas trabajo posterior.
- Lee README.md, docs/PROJECT_BRIEF.md, docs/DECISIONES.md y docs/STATUS.md.
- Conserva el alcance funcional de PROJECT_BRIEF.md. Documentar reglas o tecnologías
  futuras no autoriza implementarlas. Explica incompatibilidades antes de sustituir
  decisiones relevantes.
- Redacta principalmente en castellano. No existe sincronización automática con
  conversaciones del navegador.

## Alcance vigente: fase 04, autenticación

El encargo actual sustituye la prohibición temporal de autenticación. Autoriza
express-session/connect-pg-simple, nueva migración de sesiones, CSRF, Zod, límites
de acceso, interfaz React y pruebas/documentación. Lee docs/AUTENTICACION.md antes
de modificar estos controles. La persistencia está cerrada en ff60200 y CI
43199015562 SUCCESS; no atribuyas esa evidencia a la autenticación nueva.
Conserva migraciones publicadas, datos y credenciales. Usa status/start/stop sobre
la instancia existente; no prepare, reset ni reinicialización en esta fase.

Se autoriza crear código/configuración, instalar dependencias locales, ejecutar
pruebas y compilaciones, arrancar temporalmente procesos locales y preparar CI.
No es necesario pedir otra autorización para estas tareas ordinarias.

- Dos workspaces privados: apps/web (React/Vite) y apps/api (Express), con raíz
  privada, Node.js 24, TypeScript estricto y un único package-lock.json raíz.
- Solo dependencias usadas. Comprueba engines y peers; no uses --force ni
  --legacy-peer-deps para ocultar incompatibilidades. Instala con
  npx --yes --package=npm@11.19.1 npm ci; usa esa versión también al modificar
  dependencias. Conserva packageManager y la versión efectiva de CI sincronizados.
  No añadas dependencias directas artificiales para completar peers transitivos.
- API mínima: GET /api/health con 200 y {"status":"ok"}, 404 JSON y errores
  centralizados seguros. Health no comprueba base de datos ni disponibilidad total.
- Separa aplicación y arranque; escucha en loopback y permite cierre ordenado.
- Frontend en castellano, Router, TanStack Query, carga/éxito/error y reintento
  manual. Accesibilidad por teclado, foco visible y diseño adaptable.
- Proxy /api en desarrollo y mismo origen al servir compilados con Express.
  API/archivos inexistentes no deben caer en el fallback HTML.
- Lee docs/PERSISTENCIA.md antes de cambiar esquema, migraciones o seed.
- Se autorizan PostgreSQL 18 propio en .local/, roles/bases exclusivos, migraciones,
  pool pg, transacciones, seed ficticio Argon2id e integración real. No se necesita
  otra confirmación para preparar/arrancar esta instancia local autorizada.
- Usa 127.0.0.1:55433 o un puerto libre explícito, SCRAM y roles ordinarios separados.
  No reinicialices datos, uses trust persistente ni instales un servicio Windows.
- Antes de preparar/limpiar pruebas, exige TEST_DATABASE_URL y consulta
  current_database(): debe ser gestion_solicitudes_aprobaciones_test. Crea esquemas
  nuevos propios y elimina solo los creados por esa ejecución; nunca el esquema app.
- Migraciones/seed explícitos; no se ejecutan al arrancar HTTP. No cambies en silencio
  contraseñas, roles o asignaciones existentes. No muestres credenciales.
- CI: PostgreSQL 18 efímero del runner con roles propios, readiness, migraciones,
  integración y controles existentes; no necesita Docker local ni credenciales locales.
- No implementes gestión de solicitudes, registro público, recuperación, OAuth, MFA o administración. No añadas ORM ni servicios externos.
- No instales herramientas globales ni cambies Node.js o servicios del sistema.
  No cierres procesos ajenos; usa otros puertos si los previstos están ocupados.
- Cierra los procesos temporales propios. No avances automáticamente al siguiente hito.

## Git y publicación manual

- main es la rama principal. Origin debe corresponder exclusivamente a
  AlexC-0/gestion-solicitudes-aprobaciones. El repositorio público ya existe.
- Alex realiza exclusivamente staging, commits y push desde GitHub Desktop.
- Codex no ejecutará git init, staging, commit, push, reescritura de historial,
  cambios de remoto, tags, releases, publicación ni equivalentes por herramientas/API.
- No crees otro repositorio ni cambies su visibilidad. No despliegues.
- Una petición genérica de terminar, guardar o publicar no modifica estas reglas.
- Deja todos los cambios locales sin staging para revisión y publicación manual.

## Criterios técnicos y trabajo futuro

- Backend con NodeNext e imports internos .js compatibles con JavaScript compilado.
  Frontend con configuración apropiada para Vite. Mantén capas sencillas.
- Conserva .gitattributes y el lockfile. Excluye dependencias, builds, logs,
  variables locales y resultados de pruebas. No versiones ni muestres secretos.
- Persistencia: SQL parametrizado, migraciones versionadas,
  transición/evento atómicos y bases propias separadas. La de pruebas terminará
  en _test; limpia solo esquemas identificados como propios, nunca datos ajenos.
- Antes de instalar software global o preparar servicios nuevos fuera de este
  alcance, solicita autorización. No reinicialices clusters existentes.

## Comprobaciones y entrega

- Ante código: npm run typecheck, npm test y npm run build. Verifica npm ci sin
  cambios de lockfile y prueba comportamiento observable, sin casos artificiales.
- Ejecuta npm run test:integration con PostgreSQL real; una base ausente debe fallar,
  nunca omitir pruebas. Detén la instancia propia tras verificar y conserva sus datos.
- Comprueba HTTP real al cambiar el arranque, el servicio compilado de HTML/assets,
  los 404 API y la comunicación mediante proxy. Si hay navegador, revisa la interfaz;
  si no, diferencia HTTP/componentes de la revisión visual pendiente.
- Revisa git diff --check, diff, enlaces y coherencia. Para cambios solo documentales
  no presentes pruebas históricas como nuevas ni ejecutes suites sin motivo.
- Actualiza STATUS con comandos/resultados reales, limitaciones y siguiente paso.
  Preparar CI no significa que ya se haya ejecutado remotamente.
- Entrega ruta/rama/estado Git inicial y final, archivos cambiados, versiones usadas,
  pruebas y su número real, comprobaciones HTTP/navegador e instrucciones de arranque.
- Propón Summary y Description en castellano fieles al diff. Declara que commit y
  push quedan pendientes de Alex desde GitHub Desktop y no inicies el siguiente hito.

## Garantías de autenticación

- Sesiones solo en PostgreSQL; sin MemoryStore de respaldo. Login espera save,
  logout espera destroy. Vigencia absoluta 15 minutos previa / ocho horas autenticada.
- No desactives CSRF/origen ni límites para facilitar pruebas. Identidad y rol salen
  del servidor. Health y archivos estáticos no pasan por sesiones.
- Secretos/cookies/tokens/cuerpos de login nunca se imprimen ni versionan. Solo Backend
  carga .env. SESSION_SECRET estable, generado localmente sin sobrescribir variables.
- Las pruebas de auth usan PostgreSQL _test y un esquema nuevo propio; cierra store,
  temporizadores y pool antes de limpiar. No uses credenciales de desarrollo en CI.
- Frontend: cancela consultas privadas, elimina caché y descarta respuestas tardías
  al cambiar sesión; sin localStorage/sessionStorage para autenticación ni reintentos
  automáticos de login/logout. Un error de red no acredita logout remoto.
- No avances al siguiente hito de borradores propios sin un nuevo encargo.
