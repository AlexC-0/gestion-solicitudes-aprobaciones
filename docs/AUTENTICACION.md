# Autenticación — contrato previo a la implementación

Fase 04: acceso real entre React y Express. La persistencia quedó publicada en
ff60200f8dbbafbcb10acea2f2293c4fd8584899 con CI 43199015562 SUCCESS, según evidencia
aportada por Alex. Esta fase es nueva y requerirá su propia publicación y CI.

## HTTP y estados

Todas las respuestas bajo /api/auth llevan Cache-Control: no-store. JSON de error:
{ error: { code, message } }, sin detalles internos. Cuerpos JSON: máximo 16 KiB.

| Endpoint | Éxito | Rechazos |
| --- | --- | --- |
| GET /api/auth/csrf | 200 { csrfToken }; sesión previa de 15 minutos o token de sesión autenticada vigente | 503 si store falla |
| POST /api/auth/login | 200 { user: { id, nombre, correo, rol }, expiresAt } tras guardar sesión regenerada | 400 validación, 401 credenciales, 403 origen/CSRF, 409 ya autenticado, 429 límite, 503 técnico |
| GET /api/auth/me | 200 identidad pública y expiresAt; usuario consultado en servidor | 401 sesión ausente/caducada/usuario eliminado; 503 técnico |
| POST /api/auth/logout | 204 después de destruir sesión y limpiar cookie | 401 sin sesión, 403 CSRF/origen, 503 invalidación no confirmada |

Login: correo trim/minúsculas, email válido de hasta 254 caracteres; contraseña
1–1024 sin normalizar, objeto estricto sin identidad/rol extra. Desconocido e
incorrecto comparten 401 y mensaje; el desconocido verifica un hash Argon2id de
coste equivalente. No se registran cuerpos ni secretos.

## Sesiones y configuración

express-session y connect-pg-simple con pool inyectado, esquema app (esquema propio
en cada prueba), tabla sesiones creada únicamente por una nueva migración.
createTableIfMissing:false, resave:false, saveUninitialized:false, rolling:false,
disableTouch:true. La sesión contiene userId (si autenticada), expiresAt absoluto y
CSRF. Identidad y rol se recuperan desde usuarios; no se confía en el cliente.

Cookie chamba.sid: HttpOnly, SameSite=Lax, Path=/, sin Domain. Secure para HTTPS;
HTTP se admite únicamente con configuración explícita de desarrollo loopback.
Sin trust proxy. SESSION_SECRET hexadecimal de al menos 32 bytes aleatorios, estable,
privado; nunca valor predeterminado. AUTH_ORIGIN_DEV y AUTH_ORIGIN_COMPILED son
orígenes explícitos; el proceso selecciona uno según --serve-web. SESSION_ALLOW_HTTP
solo puede activarse para loopback fuera de producción. Backend carga .env; Vite no.

Preautenticación: 15 minutos absolutos. Login regenera el SID y token; autenticación:
ocho horas absolutas desde login. Cookie y store conservan el vencimiento, sin
renovación por consultas. Se comprueba expiresAt en servidor en cada petición de
auth. Store limpia caducadas periódicamente; close detiene sus temporizadores.
El login espera save y el logout espera destroy. Fallos SQL no conceden acceso ni
usan MemoryStore. Health y archivos estáticos quedan fuera de sesiones.

## CSRF y origen

Synchronizer token mediante csrf-sync, aleatorio criptográfico ligado a sesión;
JSON de entrega y X-CSRF-Token de entrada, solo en memoria del frontend. Regenerar
sesión rota token; tokens ausentes, de otra sesión o anteriores al login dan 403.
Login/logout exigen origen exacto configurado. Origin presente tiene prioridad;
si falta se analiza el origen de Referer; si falta o es inválido se rechaza. Nunca
se deduce del Host ni se habilita CORS abierto.

## Límites y cliente

rate-limiter-flexible: 60 peticiones login/IP y 10 fallos/IP+correo normalizado en
ventanas de 15 minutos. Contadores independientes de SID; 429 con Retry-After.
Registro acotado a 20.000 claves, con expiración y rechazo temporal de nuevas claves
si se alcanza capacidad, sin expulsar contadores activos para eludir límites.
Se reinician al reiniciar el único proceso API; las sesiones sí persisten.

/ sigue siendo página técnica; /acceso muestra formulario y /cuenta identidad real.
Estados diferenciados: comprobando, autenticado, anónimo y error técnico. El cliente
recupera sesión, respeta expiresAt, revalida al foco y entre pestañas mediante mensajes
sin secretos. Cancela consultas privadas, borra caché/estado y descarta respuestas
de generaciones anteriores al salir/caducar/cambiar de cuenta. No hay reintentos
automáticos de escrituras ni almacenamiento web de credenciales/tokens. Un fallo
remoto de logout no se presenta como cierre confirmado. Tras login se obtiene otro
CSRF; el formulario borra la contraseña al completar el acceso.

## Alcance de verificación

Pruebas HTTP con sesiones PostgreSQL reales, esquemas exclusivos _test, reloj
inyectable, datos ficticios propios y cierre del store antes de limpiar esquema.
Comprobar regeneración, persistencia entre aplicaciones, caducidad absoluta, usuario
eliminado, fallos técnicos, CSRF/origen, límites, cookies, UI/caché y respuestas tardías.
Recorrido real navegador y HTTP en desarrollo/compilado se documentará con resultados.
Autenticación identifica al usuario; autorización de solicitudes por rol/relación
queda para el siguiente hito. Sin registro público, OAuth, MFA o gestión de solicitudes.

## Implementación y reproducción verificadas

Dependencias exactas en DECISIONES. npm run auth:configure añade valores ausentes
a .env existente y respeta ACL; no reemplaza valores existentes, ni siquiera inválidos.
SESSION_SECRET generado: 32 bytes aleatorios en hexadecimal. No se regenera en cada
arranque. El comando y la API devuelven errores genéricos sin valores privados.

Backend expone createAuthentication con router, sessionMiddleware,
requireAuthentication, protectWrite y close para inyección/reutilización posterior;
no se montan endpoints ficticios. Las rutas /api/auth aplican el ciclo completo de
sesión y el manejador de errores. La factoría de aplicación sigue independiente del
arranque y permite inyectar el router. El pool se crea sin abrir conexión al arrancar;
una caída posterior de PostgreSQL afecta auth, no health ni los archivos estáticos.

En React, AuthClient vive en memoria dentro de /acceso y /cuenta. Las consultas
privadas futuras deben empezar su queryKey por private. Cancela y elimina esas
consultas al cambiar sesión, sin eliminar health. La fase 05 conserva caché y formulario
cuando la revalidación al foco devuelve la misma identidad, rol y vencimiento. Un contador de generación
impide que una respuesta atrasada reponga identidad anterior aunque ignore abort.
El evento changed de BroadcastChannel no contiene identidad, cookies o tokens.
Si BroadcastChannel no existe, sigue disponible la revalidación al recuperar foco.
El cliente oculta identidad durante errores técnicos y no confirma logout hasta
204 o 401. Tras un fallo del CSRF posterior al login, ofrece comprobar sesión: no
reintenta el login automáticamente porque podría haberse guardado correctamente.

Las pruebas de cookies Secure emulan el transporte HTTPS en Express; no constituyen
un despliegue TLS real. Desarrollo y compilado se probaron por HTTP loopback. No hay
trust proxy; habilitar un proxy/TLS requiere configuración específica de un futuro
encargo, sin habilitar confianza global en cabeceras reenviadas.

Resultados: 29 pruebas sin base (14 API/15 frontend), 35 con PostgreSQL (16 persistencia
conservadas/19 auth). HTTP compilado comprobó recuperación después de detener y
arrancar otro proceso API con el mismo secreto. Chrome real verificó login por teclado,
recarga, logout, cambio de cuenta, dos pestañas y error de red en desarrollo y compilado;
vistas 1280x900/390x844 inspeccionadas. Evidencia completa en [STATUS](STATUS.md).

El hito de borradores está implementado en fase 05; contrato y alcance en [SOLICITUDES](SOLICITUDES.md).

## Ampliación de fase 05

La evidencia remota de fase 04 corresponde a 36806c8 / CI 43202926347 SUCCESS,
con 64 pruebas; se conserva arriba el relato de implementación como histórico.
createPrivateRouter comparte sesión, lifecycle (caducidad/touch fijo), identidad,
JSON y no-store; las rutas de negocio terminan con handleError. Nunca basta con
montar sessionMiddleware. Ninguna actividad de borradores renueva el vencimiento.

AuthClient distingue revisiones de comprobación y generaciones de datos privados.
El foco no desmonta ni limpia un formulario si identidad, rol y vencimiento siguen
iguales. Cambiar esos datos, logout, caducidad, error técnico o mensaje changed
invalida la generación, aborta lecturas/escrituras y elimina las consultas private.
Abortar una petición no deshace una escritura que el servidor ya haya confirmado.
Las respuestas tardías tampoco pueden guardar token, navegar ni confirmar en otra
cuenta. Un 401 leyendo datos u obteniendo CSRF para guardarlos invalida la sesión.
Los formularios son memoria del componente, desmontada al cambiar generación.
Sin almacenamiento web ni reintentos automáticos.