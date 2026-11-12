# Proyecto 02 — Definición funcional

## Problema y objetivo

Centralizar solicitudes internas y su resolución para evitar pérdidas de contexto,
falta de responsables y decisiones sin trazabilidad. Una sola organización
simulada, con usuarios y datos ficticios. Este documento especifica requisitos;
no acredita funcionalidades implementadas.

## Roles y visibilidad

Los roles son separados y no acumulativos. Autor y rol proceden de la sesión.

| Operación | Solicitante | Revisor |
| --- | --- | --- |
| Crear solicitudes | Sí, propias en borrador | No |
| Ver/editar borradores | Solo los propios | No |
| Enviar | Solo borradores propios válidos | No |
| Cancelar | Borradores o pendientes propios | No |
| Consultar tras envío | Solo las propias | Solo las asignadas |
| Aprobar/rechazar | No | Solo pendientes asignadas |

Los borradores solo son visibles para su autor. Un borrador cancelado sin envío
no adquiere responsable ni visibilidad para revisores. Tras el envío, autor y
revisor asignado conservan acceso al expediente, incluso si termina cancelado.
Las solicitudes fuera del ámbito visible responden 404. Los listados y detalles
aplican el mismo aislamiento; conocer un identificador no otorga acceso.

## Tipos y asignación

Tipos iniciales: material, acceso a software y formación. Cada tipo tiene un
revisor configurado mediante datos iniciales. Al enviar, el backend determina y
guarda el responsable según el tipo. El cliente no elige responsables arbitrarios.
No se permite reasignación desde la aplicación. No hay administración de usuarios
ni de esta configuración en la interfaz.

## Estados y transiciones

La creación produce un borrador. Solo se permiten estas transiciones:

| Origen | Destino | Actor y condición |
| --- | --- | --- |
| borrador | pendiente | Autor; envío válido y asignación por backend |
| borrador | cancelada | Autor |
| pendiente | aprobada | Revisor asignado; comentario opcional |
| pendiente | rechazada | Revisor asignado; motivo obligatorio válido |
| pendiente | cancelada | Autor |

Aprobada, rechazada y cancelada son terminales: sin nuevas transiciones ni
reapertura. El contenido es editable exclusivamente en borrador. No hay eliminación
física. La cancelación no concede permiso para editar o reabrir.

## Campos y validaciones

| Campo | Regla |
| --- | --- |
| Título | 3–120 caracteres tras recortar espacios exteriores |
| Tipo | Uno de los configurados |
| Descripción en borrador | 0–3.000 caracteres |
| Descripción al enviar | 10–3.000 caracteres |
| Motivo de rechazo | Obligatorio, 10–1.000 caracteres |
| Comentario de aprobación | Opcional, hasta 1.000 caracteres |
| Autor, responsable, estado, identificadores y fechas | Controlados por el servidor |

Texto plano, sin HTML. El backend valida y rechaza la manipulación de identidad,
rol, responsable y estado. Las acciones autorizadas expresan una intención; no
permiten actualizar libremente campos controlados por el servidor. La interfaz
ayuda a corregir datos, pero no sustituye la validación del backend.

## Historial, persistencia y concurrencia

El historial registra creación y transiciones con actor, fecha, acción, estados y
comentario cuando corresponda. No se modifica desde la aplicación y no contiene
versiones completas de cada edición del borrador.

Una transición y su evento se guardan en la misma transacción. Ante aprobación,
rechazo o cancelación simultáneos sobre una solicitud pendiente, solo puede
confirmarse una transición y su evento; las operaciones perdedoras no generan
cambios parciales. Los fallos deben dejar estado e historial coherentes.

Entidades previstas: usuarios, tipos_solicitud, solicitudes, eventos_solicitud y
almacenamiento de sesiones. Bases de desarrollo y pruebas propias y separadas.

## Pantallas y listados

Acceso, mis solicitudes, formulario, bandeja del revisor y detalle con historial.
Interfaz adaptable y accesible por teclado, con estados de carga, vacío y error.
Listados paginados y filtrables por estado: 20 elementos por defecto, máximo 100,
orden estable por fecha de creación e identificador. Cada filtro conserva el
ámbito visible del usuario. El sentido de orden y el contrato de paginación se
concretarán antes de implementar.

## Seguridad requerida

- Autorización en backend por rol y relación con cada solicitud, en cada operación.
- Autor y rol obtenidos de la sesión; nunca aceptados como autoridad del cliente.
- Cookie HttpOnly, SameSite explícito y Secure bajo HTTPS.
- Protección CSRF, incluido el acceso, y limitación de intentos de acceso.
- Regeneración de sesión al iniciar sesión, caducidad absoluta inicial de ocho
  horas e invalidación al salir; la actividad no prolonga ese límite absoluto.
- Limpieza de caché del frontend al cerrar sesión, caducar o cambiar de usuario,
  impidiendo mostrar datos de la cuenta anterior.
- Contraseñas con Argon2id y sesiones persistentes mediante express-session y
  adaptador PostgreSQL; MemoryStore no es una solución final.
- Sin credenciales en almacenamiento web, respuestas, logs o archivos versionados.
- Errores coherentes, sin detalles internos; 404 fuera del ámbito visible.
- Escrituras sin reintentos automáticos, también desde el frontend.

## Criterios de aceptación futuros

Todos están pendientes de implementación y comprobación.

| ID | Evidencia esperada |
| --- | --- |
| A01 | Crear/editar borrador, enviar, aprobar o rechazar y cancelar en los estados permitidos; impedir edición tras envío y toda salida de estados terminales |
| A02 | Validar límites de campos, título normalizado, envío y motivo obligatorio de rechazo, incluidos casos frontera |
| A03 | Aislar solicitantes y revisores en listados y detalle; ocultar borradores a revisores; mantener acceso tras cancelación de una enviada y 404 fuera de ámbito |
| A04 | Rechazar manipulación de identidad, rol, responsable y estado; asignar el responsable en backend según tipo |
| A05 | Comprobar caducidad absoluta, regeneración, logout, cookies, CSRF incluido login y limitación de intentos |
| A06 | Cambiar de cuenta, salir o caducar sin mostrar datos de la cuenta anterior |
| A07 | Confirmar estado y evento atómicamente; bajo concurrencia real, confirmar una sola resolución y no dejar eventos o cambios parciales |
| A08 | Recorridos por teclado, diseño adaptable y estados de carga, vacío y error en las pantallas previstas |
| A09 | Pruebas de reglas, permisos, PostgreSQL real y recorridos de navegador con herramientas previstas |
| A10 | Instalación limpia reproducible con lockfile único y bases de pruebas aisladas sin limpiar datos ajenos |
| A11 | CI progresiva y documentación fieles a las comprobaciones ejecutadas, vinculadas a su versión |
| A12 | Paginación por defecto 20, máximo 100, filtro por estado y orden estable sin ampliar permisos |
| A13 | Historial de creación/transiciones consultable por usuarios autorizados, sin edición del historial ni borrado físico |

## Exclusiones

Sin registro público, recuperación de contraseña por correo, administración de
usuarios, adjuntos, notificaciones, múltiples organizaciones, aprobaciones
encadenadas, reasignaciones, integraciones externas ni despliegue. Sin importación
CSV ni otras funcionalidades o implementación del Proyecto 01. No se implementa
la aplicación ni se prepara infraestructura durante esta sesión documental.
