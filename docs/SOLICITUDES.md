# Solicitudes — contrato de fase 05

Contrato escrito antes de implementar. Alcance: catálogo, creación, listado,
detalle/historial y edición de borradores propios. Sin envío, resolución,
cancelación, asignación ni bandeja de revisor.

## HTTP

Todas las rutas requieren sesión vigente y responden Cache-Control: no-store.
POST/PATCH requieren además origen permitido y X-CSRF-Token de la sesión.
Cuerpos JSON de hasta 16 KiB. Error: { error: { code, message } }.

| Operación | Entrada | Éxito |
| --- | --- | --- |
| GET /api/tipos-solicitud | Sin parámetros | 200 { tipos: [{ codigo, nombre }] }, orden codigo |
| POST /api/solicitudes | { titulo, tipo_codigo, descripcion? } | 201 { solicitud }, Location del detalle |
| GET /api/solicitudes | pagina=1, tamano=20 | 200 { solicitudes, paginacion: { pagina, tamano, total, paginas } } |
| GET /api/solicitudes/:id | UUID canónico (mayúsculas admitidas) | 200 { solicitud, historial } |
| PATCH /api/solicitudes/:id | Uno o más de titulo, tipo_codigo, descripcion | 200 { solicitud } |

Objetos estrictos: ningún campo adicional, tampoco en query. Descripción omitida
al crear equivale a ''. PATCH solo modifica campos presentes. UUID inválido: 400.
Paginación por desplazamiento: enteros decimales sin signo ni ceros iniciales;
pagina 1–1.000.000, tamano 1–100. Orden creada_en DESC, id DESC. Página fuera del
total: lista vacía; cero resultados: paginas=0. Una misma consulta SQL obtiene
lista y total bajo la misma instantánea. Nuevas inserciones entre peticiones
pueden desplazar páginas; no se promete una instantánea entre peticiones.
No se implementan filtros en esta fase.

solicitud contiene las columnas públicas del modelo: id, autor_id, tipo_codigo,
titulo, descripcion, estado, responsable_id, creada_en, actualizada_en,
enviada_en, finalizada_en. Fechas ISO UTC; valores ausentes null.
Historial ordenado por id ascendente: id (string decimal), solicitud_id, actor_id,
accion, estado_anterior, estado_posterior, comentario, creada_en.
El catálogo nunca devuelve revisor_id, nombres ni correos de revisores.

## Validación y permisos

Título recortado con trim de ECMAScript; 3–120 puntos de código Unicode.
Descripción no se recorta: 0–3.000 puntos de código. Sin normalización NFC/NFD:
una letra y su acento combinante cuentan por separado. Se rechazan NUL y
surrogates aislados, que PostgreSQL UTF-8 no puede representar. Array.from(texto)
en JS coincide con char_length de PostgreSQL para estos textos. La restricción
btrim publicada de la base sigue intacta; la API entrega el título ya recortado.
Tipo: código exacto configurado, sin normalizar, 1–50 puntos de código.
Texto plano: se rechazan etiquetas con forma <letra...> o </letra...>;
comparaciones como '2 < 3' se admiten. React escapa siempre todo el contenido,
sin interpretar HTML ni markdown. El navegador ayuda; el servidor decide.

Identidad/rol se consultan en servidor. Solo solicitantes crean (revisor: 403).
Identificador, autor, fechas y estado salen del servidor. Nuevo borrador:
responsable_id, enviada_en y finalizada_en null.
Lecturas aplican el ámbito definitivo: solicitante autor; revisor únicamente
responsable de una solicitud enviada, nunca borradores ni canceladas sin envío.
La aplicación solo crea borradores: por ello el revisor no encuentra ninguno.
Se conserva ese predicado también en listado/detalle para no contradecir
PROJECT_BRIEF; no se construye interfaz/bandeja ni acciones para revisores.
Edición busca por id y autor con rol solicitante: ajeno/inexistente/revisor 404.
Propia fuera de borrador: 409. No se revela existencia ajena.

400 entrada inválida (mensaje corregible), 401 sin sesión, 403 creación por rol
o CSRF/origen, 404 fuera de ámbito, 409 estado incompatible, 413 cuerpo excesivo,
503 fallo técnico sin SQL ni datos internos. Fallo técnico no equivale a lista vacía.

## Persistencia y sesión

SQL parametrizado; sin nueva migración ni cambios de migraciones publicadas.
Creación y evento creacion (actor autor, null → borrador) en una transacción.
Si falla el evento se revierte la solicitud. Edición bloquea la fila propia con
FOR UPDATE, comprueba estado y actualiza en la misma transacción; reloj de
modificación clock_timestamp(). No crea eventos ni versiones de contenido.
Dos ediciones se serializan por fila: la última que obtiene el bloqueo aplica
sus campos sobre la versión entonces vigente; en campos comunes prevalece la
última escritura. Sin control optimista de versiones. Una transición concurrente
que gane el bloqueo impediría editar al observar estado distinto de borrador.

El router privado reutiliza sesión, caducidad absoluta, touch fijo, identidad,
parser y errores seguros. No renueva las ocho horas por actividad. Health y
estáticos siguen fuera de ese ciclo. Store/DB ausentes fallan de forma cerrada.

## Cliente y comprobación

Rutas /solicitudes, /solicitudes/nueva, /solicitudes/:id y /solicitudes/:id/editar,
dentro de AuthArea. Claves de consultas: private, usuario, generación, recurso.
AbortSignal en lecturas; invalidación/cancelación y descarte de resultados
tardíos al salir/caducar/cambiar identidad. Formularios desmontados por generación.
Revalidar la misma identidad y vencimiento al foco conserva formulario y caché.
Cambiar cuenta, rol o vencimiento invalida la generación; un error de sesión
oculta y elimina datos privados. Broadcast changed invalida antes de revalidar.
Escrituras sin reintento automático y botón deshabilitado mientras guardan.
Si POST pierde conexión, puede haber quedado guardado: se indica incertidumbre
y se ofrece comprobar el listado antes de repetir. Sin almacenamiento web.

Se comprobarán permisos, límites Unicode, rollback, concurrencia, sesión,
paginación y errores con PostgreSQL en esquemas propios _test; componentes y
recorridos reales en desarrollo/compilado. Resultados efectivos en STATUS.
