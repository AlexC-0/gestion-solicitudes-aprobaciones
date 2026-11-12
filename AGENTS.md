# Instrucciones para Codex — Proyecto 02

## Alcance y preparación

- Trabaja exclusivamente en gestion-solicitudes-aprobaciones. No modifiques
  otros proyectos ni copies la implementación del Proyecto 01.
- Antes de modificar, comprueba ruta, archivos e instrucciones aplicables.
  Si existe Git, inspecciona raíz, git status --short --branch, rama y remotos.
  Conserva cualquier trabajo previo; no sobrescribas ni reinicialices repositorios.
- Lee README.md, docs/PROJECT_BRIEF.md, docs/DECISIONES.md y docs/STATUS.md.
- Esta sesión autoriza solo README.md, AGENTS.md, docs/PROJECT_BRIEF.md,
  docs/DECISIONES.md, docs/STATUS.md y .gitignore. No generes carpetas vacías,
  package.json, scaffolding, endpoints, pantallas, pruebas ni workflows.
- No instales dependencias ni herramientas globales, no cambies servicios,
  no crees bases y no ejecutes migraciones durante esta sesión.
- Documentar reglas y tecnologías no autoriza su implementación. No amplíes el
  alcance. Explica incompatibilidades antes de sustituir decisiones relevantes.
- Redacta principalmente en castellano, conservando términos técnicos habituales.
- No existe sincronización automática con conversaciones del navegador.

## Git y publicación

- Alex realiza exclusivamente la inicialización local, el staging, los commits
  y el push desde GitHub Desktop. Mantén main como rama principal cuando exista.
- Codex no ejecutará git init, staging, commit, push, reescritura de historial,
  tags, releases, publicación de contenido ni equivalentes por herramientas o API.
- El repositorio público AlexC-0/gestion-solicitudes-aprobaciones ya fue creado
  y publicado manualmente por Alex. La autorización puntual para crear el remoto
  queda satisfecha; no crees otro repositorio ni cambies su visibilidad.
- Comprueba que origin corresponde a AlexC-0/gestion-solicitudes-aprobaciones.
  Codex no configurará ni cambiará remotos locales como parte de esta entrega.
- Una petición genérica de terminar, guardar o publicar no modifica estas reglas.
- Deja los archivos locales para revisión manual. Nunca despliegues la aplicación
  como parte de este alcance.

## Reglas para futuras sesiones autorizadas

- Conserva los roles excluyentes, permisos por relación, transiciones, límites
  y requisitos de seguridad de docs/PROJECT_BRIEF.md.
- Mantén TypeScript estricto, capas sencillas y aplicación separada del arranque
  HTTP. En backend NodeNext usa extensión .js para imports internos compilados.
- Usa SQL parametrizado y migraciones versionadas. Una transición y su evento
  deben confirmarse atómicamente; evita resoluciones simultáneas incompatibles.
- Prepara bases propias y separadas para desarrollo y pruebas. La base de pruebas
  debe terminar en _test; crea y limpia solo esquemas identificados como propios.
  No reutilices bases, configuración o scripts operativos del Proyecto 01.
- Comprueba instalaciones y estado antes de proponer cambios. Solicita autorización
  antes de instalar software o iniciar nuevos servicios; no reinicialices clusters.
- Un repositorio y un lockfile: conserva el futuro package-lock.json y usa npm ci
  cuando corresponda instalar las versiones bloqueadas.
- No guardes secretos en Git, documentación, pruebas, respuestas o logs. No leas
  credenciales para mostrarlas en consola. Los ejemplos futuros serán sin secretos.
- Excluye dependencias, variables locales, builds y resultados de pruebas.

## Comprobaciones y entrega

- Para documentación: revisa contenido, diff cuando exista Git, enlaces, ejemplos,
  coherencia de permisos/estados y ausencia de secretos. No hacen falta pruebas
  automatizadas en esta sesión documental.
- Para código futuro: ejecuta los controles de tipos, pruebas y build que estén
  definidos entonces. No inventes scripts ni afirmes haber ejecutado controles.
  Comprueba HTTP real cuando cambie el arranque; añade pruebas de comportamiento.
- Planifica pruebas de reglas, permisos, PostgreSQL real y navegador; registra
  resultados y limitaciones sin atribuir CI histórica a nuevos commits.
- Actualiza docs/STATUS.md con evidencia real, bloqueos y siguiente paso.
- Entrega ruta y Git, versiones comprobadas, archivos creados/modificados,
  comprobaciones y resultados, decisiones pendientes, Summary y Description en
  castellano para GitHub Desktop y siguiente paso sin iniciarlo automáticamente.
- Distingue documentación, herramientas verificadas y funcionalidad implementada.
  Indica siempre que commit y push quedan pendientes de Alex en GitHub Desktop.
