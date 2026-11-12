# Decisiones iniciales

Las reglas funcionales del [PROJECT_BRIEF](PROJECT_BRIEF.md) están definidas por
el encargo. La selección técnica es el alcance propuesto para implementaciones
posteriores: documentarla no instala dependencias ni acredita compatibilidad
entre versiones concretas de paquetes.

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

## Diseño técnico propuesto

| Elección | Motivo y límites |
| --- | --- |
| TypeScript | Tipado común y modo estricto; no sustituye validación de entradas |
| React, Vite, React Router, TanStack Query y CSS | Pantallas, navegación y datos remotos; limpiar caché al cambiar sesión y desactivar reintentos en escrituras |
| Node.js 24 LTS, Express y Zod | Backend HTTP y validación; separar aplicación del arranque |
| PostgreSQL 18, pg, SQL parametrizado, migraciones versionadas | Persistencia relacional, restricciones y transacciones sin ORM anticipado |
| express-session y adaptador PostgreSQL | Sesiones persistentes; proveedor concreto pendiente, MemoryStore no definitivo |
| Argon2id | Almacenamiento de contraseñas mediante hash; paquete y parámetros por concretar |
| Vitest, Supertest, React Testing Library y Playwright | Reglas, HTTP, componentes y recorridos de navegador |
| npm workspaces y un lockfile | Coordinar web/api con instalación reproducible en un repositorio |
| GitHub Actions progresivo | Automatizar controles reales cuando existan; sin workflow esta sesión |

Arquitectura: recepción HTTP, reglas de negocio y acceso a datos. Evitar
microservicios y abstracciones sin necesidad demostrada. Proxy Vite para /api en
desarrollo; Express podrá servir el frontend compilado bajo un mismo origen.

Estructura futura: apps/web/, apps/api/, apps/api/migrations/, tests/e2e/ y docs/.
Entidades: usuarios, tipos_solicitud, solicitudes, eventos_solicitud y sesiones.
La estructura no se genera salvo docs/ y los archivos documentales autorizados.

## Pendiente antes de la implementación correspondiente

- Fijar versiones compatibles de dependencias, requisitos de instalación y scripts
  reales. La compatibilidad completa del conjunto aún no se ha comprobado.
- Elegir adaptador de sesiones, paquete/parámetros de Argon2id, estrategia CSRF
  incluido login, valor SameSite, límites de intentos y limpieza de sesiones.
- Concretar contratos HTTP, errores y respuesta ante transición ya resuelta;
  conservar el 404 fuera del ámbito visible y la prohibición de reintentos automáticos.
- Definir IDs, esquema, restricciones, representación del evento de creación y
  mecanismo transaccional frente a concurrencia, sin cambiar el modelo funcional.
- Precisar conteo de caracteres Unicode, espacios en descripción/comentarios y
  tratamiento de HTML; no cambiar los límites ni admitir contenido HTML.
- Elegir sentido del orden y contrato de paginación; preservar fecha/identificador,
  20 por defecto y máximo 100.
- Definir datos iniciales ficticios y cómo proporcionar credenciales de prueba sin
  versionarlas; concretar el error ante ausencia de revisor válido para un tipo.
- Preparar, con autorización posterior, bases propias de desarrollo/pruebas y su
  operación aislada. La instalación local del Proyecto 01 no configura este proyecto.
- Desarrollar accesibilidad, pruebas y CI gradualmente con evidencia observable.

## Git y autorización posterior al encargo inicial

Alex indicó crear una carpeta nueva en C:\Users\kaosk\source\repos con el
nombre del proyecto y autorizó después crear un repositorio GitHub nuevo y público:
AlexC-0/gestion-solicitudes-aprobaciones. El intento de creación por Codex falló
por autenticación. Alex creó después el repositorio local y publicó manualmente
la documentación inicial desde GitHub Desktop. El commit `c79177f` y la visibilidad
pública se verificaron en GitHub; las evidencias se registran en [STATUS](STATUS.md).
La autorización puntual de creación queda satisfecha; no se creará otro remoto.

Codex no inicializó Git local, configuró origin, hizo staging, commits ni push.
Estas operaciones siguen reservadas a Alex desde GitHub Desktop. Esta actualización
documental queda local para su revisión y publicación manual. No se cambia ningún
remoto o archivo del Proyecto 01 ni se despliega la aplicación.
