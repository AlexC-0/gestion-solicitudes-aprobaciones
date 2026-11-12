# Aceptación de la V1

Fecha: 12 de noviembre de 2026. Alcance inalterado de [PROJECT_BRIEF](PROJECT_BRIEF.md).
**V1 completada y verificada para el alcance funcional y de ejecución local acordado.**
La fase de construcción y verificación ha finalizado.

Evidencia final verificada aportada por Alex: commit
[9650ffbfcdd97e1d34f8049362edd1a2c8f802a2](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/commit/9650ffbfcdd97e1d34f8049362edd1a2c8f802a2)
y [CI 43224311688 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43224311688).
Controles correctos: instalación reproducible, tipos, migraciones repetidas, pruebas,
build e instalación/ejecución de Chromium. **149 pruebas correctas: 14 API,
50 frontend, 80 de integración con PostgreSQL y 5 E2E sobre aplicación compilada
y PostgreSQL real.** Los resultados técnicos se atribuyen a ese commit y su CI,
no al futuro commit documental.

La revisión desde ChatGPT, comunicada por Alex, contrastó el código E2E, su
aislamiento, la documentación A01–A13 y los logs remotos. La evidencia remota
completa la matriz siguiente; las revisiones visuales locales conservan su origen.
El brief conserva la definición y los pendientes de la preparación inicial;
el estado vigente de aceptación se registra aquí y en STATUS.

Antecedente histórico: 78404615d5ecb87c14ec20e43caf4c033e08970b,
[CI 43215189948 SUCCESS](https://github.com/AlexC-0/gestion-solicitudes-aprobaciones/actions/runs/43215189948),
con 144 pruebas, verificó la corrección de fecha única. El fallo de
8733744/43213467827 permanece como histórico corregido, no como bloqueo actual.

Las rutas siguientes son relativas a la raíz. «Integración» significa
apps/api/tests/integration; «web» significa apps/web/tests.
Se reutiliza la evidencia histórica válida; resultados nuevos y comandos exactos
están en [STATUS](STATUS.md) y reproducción en [PRUEBAS](PRUEBAS.md).

| ID | Requisito concreto | Implementación o prueba | Resultado observado | Límite o pendiente |
| --- | --- | --- | --- | --- |
| A01 | Crear/editar borrador, enviar, aprobar, rechazar y cancelar solo en estados permitidos; terminales inmutables | API solicitudes.ts; integración solicitudes/workflow/decisions; E2E workflows.spec.ts | Flujos de ambas resoluciones y cancelaciones completados; edición tardía y repetición 409, sin cambios extra | Verificado en CI 43224311688; sin pendiente dentro del alcance acordado |
| A02 | Límites y normalización de título/descripción/comentario; motivo obligatorio | Esquemas estrictos de API; integración solicitudes/decisions; web Decisions; E2E rechazo móvil | Fronteras Unicode, trim, NUL/surrogates/HTML y motivo vacío/corto/largo verificados; error asociado y corrección por UI | Sin normalización NFC/NFD: regla contractual |
| A03 | Visibilidad por autor/responsable; borradores ocultos, 404 ajenos y acceso tras cancelar enviada | Predicados de lista/detalle/acciones; integración con dos autores/dos revisores; E2E cancelación/aislamiento | Ajeno y revisor no asignado reciben 404; borrador cancelado oculto, enviada cancelada visible solo a participantes | Roles excluyentes, sin administración o reasignación |
| A04 | Rechazar campos controlados y asignar responsable por tipo en servidor | API solicita identidad de sesión y tipo guardado; integración solicitudes/workflow/decisions | Manipulación rechazada; configuración inválida revierte envío; material/software/formación según contrato | Catálogo configurado por seed, sin edición desde UI |
| A05 | Caducidad absoluta, regeneración/logout/cookies, CSRF/login y límites | auth/authentication.ts, auth-client.ts; auth.test.ts, auth-limits.test.ts, pruebas de rutas nuevas | SID/token regenerados, caducidad fija, cookies/no-store, origen/CSRF y límites correctos; login/logout reales en E2E | HTTPS/proxy desplegados no probados; HTTP solo loopback explícito |
| A06 | Salir, caducar o cambiar cuenta sin datos privados anteriores | AuthClient por generación y cancelación; web Auth/Solicitudes/Workflow/Decisions; E2E logout | Caché/formularios eliminados y respuestas tardías descartadas; atrás y acceso ajeno no recuperan datos | No se guardan credenciales o tokens en Web Storage |
| A07 | Atomicidad y una sola terminal bajo concurrencia; historial coherente | transaction y FOR UPDATE; integración workflow/decisions y preparación corregida de solicitudes | Rollback del evento revierte estado/fechas; carreras reales 200/409, comentario ganador y precisión SQL; lectura de una instantánea | No hay idempotencia general; conflicto requiere recuperar detalle |
| A08 | Teclado, foco, etiquetas, mensajes y adaptación en pantallas previstas | CSS/componentes; suites web; E2E Tab/Enter/Escape, foco/aria-invalid y viewports; revisión de capturas | Formularios y expediente legibles, foco visible/retorno, mensajes asociados, sin overflow en 1280x900 y 390x844 | No auditoría exhaustiva, dispositivo físico ni todos los navegadores |
| A09 | Reglas, permisos, PostgreSQL real y recorridos reproducibles | 14 API, 50 web, 80 integración y 5 E2E versionadas con Chromium | 149 casos distintos correctos en local y en CI 43224311688; sin retries ni pruebas omitidas en suites completas | E2E remotas verificadas con Chromium; no otros navegadores |
| A10 | Instalación reproducible y pruebas aisladas sin limpiar datos ajenos | npm ci/lockfile; withTestSchema/current_database; fixture E2E con migración repetida y credenciales efímeras | Dependencias limpias; esquemas vacíos migrados dos veces, segunda sin cambios; datos de desarrollo conservados | No se reinstaló PostgreSQL desde cero; avisos transitivos documentados |
| A11 | CI y documentación fieles a cada versión | Workflow mantiene controles y añade Chromium/E2E después del build; README/STATUS/PRUEBAS | 9650ffb con CI 43224311688 SUCCESS y 149 pruebas; resultados históricos conservados | La evidencia técnica verifica 9650ffb; no acredita commits documentales posteriores |
| A12 | Página 20, máximo 100, filtro de estado y orden estable sin ampliar permisos | API listado; integración solicitudes/workflow; web Workflow y E2E filtros | Límites, desempate, página vacía y ámbito de filas/total comprobados; aprobadas/canceladas encontrables por UI | Desplazamiento puede variar con nuevas inserciones; sin snapshot entre peticiones |
| A13 | Historial consultable sin editarlo ni borrar físicamente | API solo expone creación/lecturas/edición de borrador y acciones; eventos transaccionales; integración y E2E | Actor/estado/fecha/comentario visibles a participantes, saltos preservados, sin rutas de edición de eventos o DELETE | SQL autorizado por un administrador externo no equivale a permisos de aplicación |

## Revisión del alcance y evidencias

Revisadas rutas GET/POST/PATCH, predicados por rol/relación, validación estricta,
asignación, bloqueos, fechas SQL y relación evento/estado. No existen rutas de
borrado o edición de historial. La revisión no ha requerido cambios de producto
ni de migraciones. Los ajustes del comprobador E2E esperan identidad autenticada
visible y URL de detalle, sin pausas fijas ni ampliar timeouts.

Capturas de aceptación bajo test-results/e2e, ignoradas por Git: detalle aprobado
en escritorio, formulario de rechazo y expediente rechazado en móvil. Se verifican
etiquetas, aviso definitivo, contador, saltos de línea, foco y ausencia de overflow.
El test de teclado comprueba Escape/retorno y Tab/Enter en aprobación; las suites
web conservan las comprobaciones de cancelación y otros formularios.

No se añaden como requisitos nuevos multibrowser, dispositivos físicos, despliegue
TLS o auditoría exhaustiva de accesibilidad. Los tres avisos moderados de tooling
de migración siguen explícitos; no se ha aplicado una actualización incompatible.

## Cierre y trabajo posterior

V1 aceptada dentro del alcance acordado. No quedan pendientes de publicación o CI
para aceptar la implementación de 9650ffb. Sin despliegue, tag ni release.
Las nuevas funcionalidades o ampliaciones requieren otro encargo.

Alex revisará esta actualización documental y realizará exclusivamente staging,
commit y push desde GitHub Desktop. Esa publicación documental queda pendiente;
no se atribuye ningún resultado remoto al futuro commit documental.
