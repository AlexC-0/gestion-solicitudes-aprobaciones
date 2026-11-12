# Solicitudes — contrato vigente, fase 06

Contrato base escrito en fase 05 y ampliado antes del código de fase 06.
Alcance vigente: borradores propios, envío con asignación por tipo, cancelación
por autor y bandeja de consulta del revisor. Sin aprobación ni rechazo.

## HTTP

Todas las rutas requieren sesión vigente y responden Cache-Control: no-store.
POST/PATCH requieren además origen permitido y X-CSRF-Token de la sesión.
Cuerpos JSON de hasta 16 KiB. Error: { error: { code, message } }.

| Operación | Entrada | Éxito |
| --- | --- | --- |
| GET /api/tipos-solicitud | Sin parámetros | 200 { tipos: [{ codigo, nombre }] }, orden codigo |
| POST /api/solicitudes | { titulo, tipo_codigo, descripcion? } | 201 { solicitud }, Location del detalle |
| GET /api/solicitudes | pagina=1, tamano=20, estado opcional | 200 { solicitudes, paginacion: { pagina, tamano, total, paginas } } |
| GET /api/solicitudes/:id | UUID canónico (mayúsculas admitidas) | 200 { solicitud, historial } |
| PATCH /api/solicitudes/:id | Uno o más de titulo, tipo_codigo, descripcion | 200 { solicitud } |
| POST /api/solicitudes/:id/enviar | Sin cuerpo o {} | 200 { solicitud }, asignación y evento atómicos |
| POST /api/solicitudes/:id/cancelar | Sin cuerpo o {} | 200 { solicitud }, finalización y evento atómicos |

Objetos estrictos: ningún campo adicional, tampoco en query. Descripción omitida
al crear equivale a ''. PATCH solo modifica campos presentes. UUID inválido: 400.
Paginación por desplazamiento: enteros decimales sin signo ni ceros iniciales;
pagina 1–1.000.000, tamano 1–100. Orden creada_en DESC, id DESC. Página fuera del
total: lista vacía; cero resultados: paginas=0. Una misma consulta SQL obtiene
lista y total bajo la misma instantánea. Nuevas inserciones entre peticiones
pueden desplazar páginas; no se promete una instantánea entre peticiones.
Filtro estado opcional: borrador, pendiente, aprobada, rechazada o cancelada;
se aplica a filas y total sin ampliar el ámbito. Detalles de fase 06 al final.

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
La creación siempre produce borrador; el envío lo hace visible al responsable.
El mismo predicado protege listado/detalle y la bandeja de consulta del revisor.
Los revisores no tienen acciones de escritura en esta fase.
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

Se comprueban permisos, límites Unicode, rollback, concurrencia, sesión,
paginación y errores con PostgreSQL en esquemas propios _test; componentes y
recorridos reales en desarrollo/compilado. Resultados efectivos en STATUS.

## Fase 06 — acciones y ampliaciones (documentadas antes del código)

La fase 05 está publicada en 7571f83952103dce1f54a3a94755a661b21fb749:
CI 43207099040 SUCCESS y 88 pruebas según Alex. Las reglas base anteriores se
conservan salvo las ampliaciones expresas de este apartado. Sin aprobación/rechazo.

### Acciones y errores

POST /api/solicitudes/:id/enviar y POST /api/solicitudes/:id/cancelar:
admiten ausencia de cuerpo o un objeto JSON vacío {}. No admiten ningún campo,
query, array, null, texto ni cuerpo de otro formato. Reutilizan UUID, límite 16 KiB,
sesión, CSRF, origen y no-store. Éxito 200 { solicitud } después de COMMIT.

Solo el autor con rol solicitante puede actuar. Se busca por id/autor/rol antes
de comprobar estado: ajeno, inexistente o revisor devuelven el mismo 404, también
si ese revisor puede leer una enviada asignada. Es el ámbito de la acción,
coherente con PATCH; no se revela el estado de borradores ajenos.
400 entrada/contenido inválido; 401 sesión; 403 CSRF/origen; 404 fuera de ámbito;
409 INVALID_STATE por transición incompatible o repetida; 409 ASSIGNMENT_UNAVAILABLE
si no puede asignarse un revisor válido. 503 fallo técnico seguro. Nada se guarda
parcialmente. Repeticiones no producen eventos ni reasignación.

Enviar: borrador → pendiente. Bloquea la fila propia, comprueba título/tipo/texto
guardados conforme al contrato y descripción de 10–3000 puntos de código (sin trim).
Resuelve tipo guardado → revisor configurado, verifica rol revisor y bloquea esa
configuración/persona con FOR SHARE hasta confirmar. Guarda responsable_id,
enviada_en, actualizada_en y evento envio con actor autor y estados borrador/pendiente.
No recibe responsable del cliente. No modifica contenido ni reasigna enviadas.

Cancelar: borrador/pendiente → cancelada. Registra finalizada_en, actualizada_en
y evento cancelacion. En borrador conserva responsable/envío null; en pendiente
conserva ambos. Autor conserva acceso; revisor asignado conserva acceso únicamente
si hubo envío. Aprobada/rechazada/cancelada no permiten acciones ni edición.

### Integridad, lecturas y filtros

Transición y evento en la misma transacción, con bloqueo FOR UPDATE antes de
validar y generar una única fecha mediante clock_timestamp. Evento copia esa
fecha desde SQL para conservar precisión y no usar el now anterior al bloqueo.
Dos envíos o dos cancelaciones: un éxito y un 409. Edición/envío se serializan:
si edita primero se valida el contenido actualizado; si envía primero PATCH 409.
Si cancela primero un borrador, envío 409; si envía primero, puede cancelarse la
pendiente y quedan ambos eventos en orden. Fallar evento revierte todos los campos.

Detalle e historial pasan a obtenerse en una sola sentencia SQL, con la misma
instantánea MVCC y ámbito autorizado. GET detalle añade autor_nombre y
responsable_nombre (null sin responsable) a solicitud y actor_nombre a cada
evento. Solo nombres necesarios del expediente, sin correos ni directorio.
El historial conserva ids, fechas, estados y orden; nombres reflejan el usuario actual.

GET /api/solicitudes admite estado opcional: borrador, pendiente, aprobada,
rechazada o cancelada. Omitido devuelve todos los estados visibles; vacío, desconocido,
repetido u otros parámetros: 400. Total/filas comparten filtro y permisos.
Se conserva pagina/tamano, orden y límites anteriores; no admite autor/responsable.

### Interfaz y comprobaciones previstas

/solicitudes se adapta al rol: Mis solicitudes para autor y Bandeja de revisión
para revisor. La bandeja empieza en pendiente; «Todos los estados» permite
consultar las demás asignadas. Cambiar filtro vuelve a página 1 y paginar lo conserva.
Claves private + usuario + generación + página/filtro; misma API y detalle.

Detalle propio: Enviar borrador y Cancelar solicitud según estado; cancelar exige
confirmación explícita que advierte que no se puede reabrir. Revisor solo consulta.
Historial con nombres legibles de creación/envío/cancelación, actor, fecha y estados.
Acción correcta invalida detalle/listas y muestra confirmación específica. 409
permite actualizar detalle; fallo de red reconoce resultado incierto y permite
comprobar antes de repetir. Sin reintentos, respuestas tardías ni controles de aprobación/rechazo.
Pruebas PostgreSQL demostrarán espera real de bloqueos y rollback; resultados
efectivos y límites de HTTP/Chrome se registrarán en STATUS.
