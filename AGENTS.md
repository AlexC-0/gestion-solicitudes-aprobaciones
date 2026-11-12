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

## Alcance vigente: base fullstack ejecutable

El nuevo encargo sustituye las restricciones temporales de la sesión documental.
Se autoriza crear código/configuración, instalar dependencias locales, ejecutar
pruebas y compilaciones, arrancar temporalmente procesos locales y preparar CI.
No es necesario pedir otra autorización para estas tareas ordinarias.

- Dos workspaces privados: apps/web (React/Vite) y apps/api (Express), con raíz
  privada, Node.js 24, TypeScript estricto y un único package-lock.json raíz.
- Solo dependencias usadas. Comprueba engines y peers; no uses --force ni
  --legacy-peer-deps para ocultar incompatibilidades. Usa npm ci para reproducir.
- API mínima: GET /api/health con 200 y {"status":"ok"}, 404 JSON y errores
  centralizados seguros. Health no comprueba base de datos ni disponibilidad total.
- Separa aplicación y arranque; escucha en loopback y permite cierre ordenado.
- Frontend en castellano, Router, TanStack Query, carga/éxito/error y reintento
  manual. Accesibilidad por teclado, foco visible y diseño adaptable.
- Proxy /api en desarrollo y mismo origen al servir compilados con Express.
  API/archivos inexistentes no deben caer en el fallback HTML.
- CI inicial: instalación, tipos, pruebas y build; sin bases, secretos o despliegue.
- No implementes autenticación, sesiones, roles, CSRF, solicitudes o persistencia.
  No crees bases, migraciones, tablas o datos iniciales. No inicies PostgreSQL.
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
- Cuando se autorice persistencia: SQL parametrizado, migraciones versionadas,
  transición/evento atómicos y bases propias separadas. La de pruebas terminará
  en _test; limpia solo esquemas identificados como propios, nunca datos ajenos.
- Antes de instalar software global o preparar servicios nuevos fuera de este
  alcance, solicita autorización. No reinicialices clusters existentes.

## Comprobaciones y entrega

- Ante código: npm run typecheck, npm test y npm run build. Verifica npm ci sin
  cambios de lockfile y prueba comportamiento observable, sin casos artificiales.
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
