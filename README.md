# Gestión de solicitudes y aprobaciones

Proyecto 02 de CHAMBA DIARIA. Aplicación interna prevista para una organización
simulada, con cuentas y datos ficticios: los solicitantes preparan y envían
solicitudes de material, acceso a software o formación; los revisores asignados
las aprueban o rechazan, con un historial de creación y transiciones.

## Estado inicial

Solo documentación inicial. La aplicación todavía no está implementada.
No hay dependencias instaladas, configuración ejecutable, bases propias,
migraciones, pruebas ni CI. No existen comandos de instalación o arranque del
proyecto que puedan presentarse como funcionales.

Proyecto independiente de Importación y validación de datos: no se incorporan
su código, funcionalidades, bases, configuración ni scripts operativos.

## Diseño previsto

- TypeScript; React, Vite, React Router, TanStack Query y CSS en el frontend.
- Node.js 24 LTS, Express y Zod en el backend.
- PostgreSQL 18, driver pg, SQL parametrizado y migraciones versionadas.
- express-session con almacenamiento PostgreSQL y contraseñas con Argon2id.
- Vitest, Supertest, React Testing Library y Playwright.
- npm workspaces, un repositorio, un futuro package-lock.json y CI progresiva.

Separación entre recepción HTTP, reglas de negocio y acceso a datos. Vite usará
un proxy para /api en desarrollo; Express podrá servir la versión compilada
bajo un mismo origen. Son decisiones de diseño, no capacidades implementadas.

Estructura prevista; solo docs/ se crea en esta sesión:

```text
apps/web/              Frontend
apps/api/              Backend
apps/api/migrations/   Migraciones SQL versionadas
tests/e2e/            Recorridos de navegador
docs/                 Documentación
```

## Documentación

- [Alcance y criterios de aceptación](docs/PROJECT_BRIEF.md).
- [Decisiones y asuntos pendientes](docs/DECISIONES.md).
- [Estado y comprobaciones reales](docs/STATUS.md).
- [Reglas de trabajo](AGENTS.md).

Alex creó y publicó el repositorio público
[AlexC-0/gestion-solicitudes-aprobaciones](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones)
desde GitHub Desktop. La documentación inicial está publicada en el commit
`c79177f` (`Initial commit`); esta actualización documental queda pendiente de
commit y push manuales. Las evidencias se registran en [STATUS](docs/STATUS.md).
Todos los commits y push siguen siendo exclusivos de Alex. No hay despliegue.
