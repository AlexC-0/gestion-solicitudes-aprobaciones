# Persistencia del Proyecto 02

## Diseño fijado antes de escribir las migraciones

PostgreSQL 18, esquema app en desarrollo. Las pruebas crean esquemas nuevos
p02_test_<UUID sin guiones> exclusivamente en gestion_solicitudes_aprobaciones_test.
La aplicación HTTP no necesita una conexión para servir health o el frontend.

| Tabla | Claves y contenido |
| --- | --- |
| usuarios | UUID, nombre, correo normalizado único, password_hash Argon2id, rol excluyente y creada_en |
| tipos_solicitud | Código estable, nombre y revisor_id con FK a usuarios |
| solicitudes | UUID, autor_id, tipo_codigo, título, descripción, estado, responsable_id nullable y fechas |
| eventos_solicitud | bigint identity, solicitud_id, actor_id, acción, estados anterior/posterior, comentario y creada_en |

Todas las fechas son timestamptz. UUID se genera con gen_random_uuid() de PostgreSQL;
los datos iniciales usan UUID estables. No hay cascadas de borrado. Los tipos serán
material, software y formacion, con nombres castellanos. No se crean tablas de sesiones.

## Integridad SQL

- Correos en minúsculas y sin espacios exteriores, con estructura básica de correo,
  no vacíos y únicos; nombres de 1–120 caracteres y roles solicitante/revisor.
- El hash exige prefijo Argon2id; SQL no certifica por sí solo la validez criptográfica.
- Título de 3–120 caracteres, ya recortado; descripción 0–3000 en borrador y
  cancelación no enviada, 10–3000 si se ha enviado. char_length cuenta caracteres
  Unicode, no bytes; descripción y comentarios no se recortan adicionalmente en SQL.
- borrador: sin responsable, envío o finalización. pendiente: responsable/envío,
  sin finalización. aprobada/rechazada: envío y responsable previos, finalización.
  cancelada: finalización, conservando ambos datos de envío o ninguno.
- Fechas: actualización no anterior a creación; envío entre creación y actualización;
  finalización entre envío (o creación si no se envió) y actualización.
- Historial: creación NULL → borrador; envío borrador → pendiente; aprobación/rechazo
  pendiente → terminal; cancelación desde borrador o pendiente. Rechazo exige motivo
  de 10–1000 caracteres; aprobación admite comentario opcional hasta 1000.
  Creación/envío/cancelación no incluyen comentario en esta fase.
- FK para todos los vínculos, sin CHECK con consultas a otras tablas y sin triggers.
- Índices compuestos por autor/creación/UUID, responsable/creación/UUID (no nulos),
  estado/creación/UUID y solicitud/ID de evento. Cubren listados previstos y orden
  estable del historial; no se añaden índices a cada columna indiscriminadamente.

## Reglas que SQL no implementa

El futuro servicio comprobará rol del autor/revisor, permisos y visibilidad,
asignación por tipo al enviar, prohibición de editar fuera de borrador y de reabrir
terminales, texto plano sin HTML, creación del evento junto a cada cambio y resolución
única ante concurrencia. La tabla de eventos valida cada registro, pero no comprueba
que el estado almacenado en solicitudes coincida con su historial. Tampoco impide
por sí sola editar/borrar eventos mediante SQL autorizado.

En esta fase solo se prueba infraestructura, restricciones y transacciones. No se
acredita autenticación, autorización ni el flujo funcional completo.

## Entorno propio y herramientas

Distribución Windows de EDB enlazada desde
[PostgreSQL oficial](https://www.postgresql.org/download/windows/), archivo
[PostgreSQL 18.6-1 x64](https://get.enterprisedb.com/postgresql/postgresql-18.6-1-windows-x64-binaries.zip).
Binarios, cluster, logs y metadatos privados bajo .local/postgres; puerto inicial
55433 y escucha exclusiva 127.0.0.1. Sin servicio Windows ni cambios de PATH.
SCRAM-SHA-256 desde initdb, nunca trust persistente. Los comandos no reinicializan datos.

Roles propios: p02_admin solo para preparar el entorno; p02_dev y p02_test sin
superusuario, CREATEDB o CREATEROLE, propietarios únicamente de sus respectivas
bases. Se revoca CONNECT de PUBLIC y se limita pg_hba por rol/base/loopback.
La credencial administrativa no se usa en DATABASE_URL o TEST_DATABASE_URL.

pg 8.23.1 aporta Pool y SQL parametrizado. node-pg-migrate 9.0.0 registra migraciones
SQL en pgmigrations, usa advisory lock y transacción; se elige una herramienta
mantenida en lugar de crear un framework propio. argon2 0.45.2 genera hashes
Argon2id con memoria 65536 KiB, tiempo 3, paralelismo 1 y salida de 32 bytes,
con salt aleatorio por hash. No se implementa login.

Las migraciones y seed son comandos explícitos, nunca parte del arranque HTTP.

## Preparación y configuración

Requisitos: Windows, Node 24 (probado 24.13.0), npm 11 (11.6.2), PowerShell,
icacls y salida HTTPS a EDB/npm para la primera instalación. Desde la raíz:

```powershell
npm ci
npm run db:local -- status
npm run db:local -- prepare
npm run db:local -- start
npm run db:check
npm run db:migrate
npm run db:seed
npm run db:check:test
npm run db:migrate:test
npm run test:integration
npm run db:local -- stop
npm run db:local -- status
```

prepare arranca tras crear el cluster; repetirlo no cambia datos ni contraseñas.
start y stop son repetibles. Si todavía no está preparado y 55433 está ocupado,
puede elegirse `npm run db:local -- prepare --port=55434`. No se detiene al ocupante.
Si ya existe .env, datos o una preparación incompleta, el comando conserva todo y
pide revisar el estado: no borres metadatos ni reinicialices para sortear el aviso.
Una interrupción de preparación requiere diagnóstico; no hay reset automático.

La descarga y extracción inicial pueden tardar varios minutos. El ZIP EDB incluye
herramientas adicionales que no se arrancan ni instalan como servicios. Hash SHA-256
observado del ZIP usado (registro local, no firma ni checksum publicado por EDB):
`fbe23da234ee31547bf8a36d29dfd81e82b849df2d2b78d2eecb43d360252f8c`.
Procedencia, versión y puerto también se registran en instance.json privado.

Archivos privados excluidos: .env; .local/postgres/ con binarios, cluster,
postgresql.log, instance.json y admin-password; .local/seed-credentials.json.
Los archivos con secretos restringen ACL al usuario actual y SYSTEM en Windows;
.local/postgres restringe herencia. En otros sistemas el seed usa modo 0600;
el comando de preparar PostgreSQL es exclusivamente Windows. No muestres estos
archivos ni copies sus contenidos a incidencias, capturas o documentación.

.env.example solo ofrece placeholders. DATABASE_URL apunta a desarrollo con p02_dev;
TEST_DATABASE_URL a la base terminada en _test con p02_test. Los scripts raíz de
persistencia/integración cargan .env mediante Node; las variables del entorno tienen
prioridad. La API y Vite no cargan credenciales ni dependen de esos comandos.

El pool tiene máximo 5 conexiones, 5 s para conectar, 10 s de inactividad y 10 s por
sentencia. Search path controlado: app (o esquema de prueba) y pg_catalog; no se
admiten options en la URL que alteren ese ámbito. Los errores de scripts y conexiones
inactivas son genéricos, sin URLs, SQL sensible ni contraseñas.

## Migraciones, seed e integración

La migración 202611120001_initial.sql crea las cuatro tablas y sus índices.
node-pg-migrate registra su ejecución en app.pgmigrations; volver a ejecutar aplica
cero cambios. La migración transaccional fallida revierte DDL y registro. No se ofrece
comando down ni reset destructivo de desarrollo. Las siguientes evoluciones deberán
ser nuevas migraciones, no edición de las ya publicadas.

Seed genera credenciales aleatorias de 24 bytes por usuario en el archivo privado.
Crea dos solicitantes y dos revisores con correos example.com y UUID estables.
material y software corresponden al primer revisor; formacion al segundo.
Verifica hash/contraseña, identidad, nombre, rol y asignaciones ya existentes.
Un conflicto aborta toda la transacción; no modifica o borra filas existentes.
Si se pierde el archivo privado teniendo usuarios, se detiene en lugar de regenerarlo.
El bloqueo de tablas serializa seeds; no es una solución de concurrencia de solicitudes.

npm test sigue ejecutando 15 pruebas sin base: 10 API y 5 frontend.
Las 16 pruebas de test:integration crean cada vez esquemas p02_test_<UUID> propios,
conectadas como p02_test. Se consulta current_database antes de preparación/limpieza;
solo se elimina el esquema cuya creación confirmó esa ejecución. El app de prueba
creado por db:migrate:test se conserva. DATABASE_URL se requiere además para probar
que una URL alternativa de desarrollo se rechaza sin crear esquemas.

Las pruebas cubren migraciones y rollback de DDL, estados/campos/longitudes, correo,
roles, FKs sin cascadas, eventos, lectura, transacción de dos escrituras, rollback
SQL y de aplicación, repetición/conflictos del seed y protección de esquemas ajenos.
No equivalen a autorización, negocio completo ni resolución concurrente.

Con PostgreSQL detenido o TEST_DATABASE_URL ausente/incorrecta, integración debe
salir con error. Vitest puede añadir «No test files found» al fallo de globalSetup;
el mensaje de preflight explica que no se prepararon esquemas. No es un éxito ni
una suite que haya pasado con casos omitidos.

## CI y comprobaciones

GitHub Actions prepara postgres:18.6 en el runner, espera pg_isready y crea dos
bases con roles ordinarios mediante scripts/ci-database.mjs. No lee .env local.
El script exige CI=true y configuración CI explícita. Credenciales desechables
exclusivas del runner; administrador solo para bootstrap. Ejecuta migraciones dos
veces, integración y los controles existentes. No se ha ejecutado remotamente esta
nueva versión: requiere commit/push manuales de Alex y comprobar su propio run.

Resultados locales y limitación de tres avisos moderados en la cadena de herramientas
de migración: [STATUS](STATUS.md) y [DECISIONES](DECISIONES.md). No se ha repetido una
revisión visual completa porque no cambió el frontend. Al terminar, PostgreSQL y
HTTP temporales quedan detenidos y los datos se conservan.
