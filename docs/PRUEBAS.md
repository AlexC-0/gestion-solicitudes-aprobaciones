# Pruebas reproducibles

Todos los comandos se ejecutan desde la raíz con
npx --yes --package=npm@11.19.1 npm. Preparación y detención en [README](../README.md).
La referencia de alcance es [PROJECT_BRIEF](PROJECT_BRIEF.md); resultados observados
por versión en [STATUS](STATUS.md) y revisión en [ACEPTACION-V1](ACEPTACION-V1.md).

| Comando tras el prefijo | Qué comprueba |
| --- | --- |
| ci | Instalación exacta del lockfile |
| run typecheck | API, web y configuración/fixtures/casos E2E en TypeScript estricto |
| test | API sin DB y componentes/cliente de sesión |
| run test:integration | PostgreSQL real, aislamiento, autenticación y reglas/concurrencia |
| run build | API y web compiladas |
| run e2e:install | Chromium propio de Playwright; Linux/CI añade -- --with-deps |
| run test:e2e | Cinco recorridos sobre API compilada, web compilada y PostgreSQL real |

## Playwright

Playwright Test 1.65.0 fijado en devDependencies y lockfile, engines >=20, compatible
con Node 24 del proyecto. Se consultaron las guías oficiales de
[CI](https://playwright.dev/docs/ci) y [autenticación](https://playwright.dev/docs/auth).
Un worker, retries=0, forbidOnly, 60 s por caso y 240 s global. No hay skip,
continue-on-error ni reutilización silenciosa de servidores.

tests/e2e/fixtures.ts importa las factorías de apps/api/dist y sirve apps/web/dist.
Solo reutiliza el helper existente withTestSchema para el aislamiento; no monta
una API alternativa, ni endpoints de pruebas, ni mocks de red. El login, CSRF,
origen, sesión y permisos son los reales.

Cada caso:

1. Exige TEST_DATABASE_URL y current_database() igual a
   gestion_solicitudes_aprobaciones_test antes de crear un esquema p02_test_ nuevo.
2. Migra el esquema vacío con migraciones publicadas y repite migrate comprobando
   cero nuevas. Prepara cuatro usuarios ficticios, contraseñas y secreto aleatorios.
3. Configura search_path del pool y schema de sesiones explícitamente. No lee
   credenciales de desarrollo ni usa el esquema app.
4. Abre un HTTP propio en 127.0.0.1, puerto efímero reservado por el SO y origen
   correspondiente; no acepta un servicio existente.
5. Abre Chromium y contextos separados para identidades simultáneas. Las acciones
   principales son UI con etiquetas/roles y autoespera por estados observables.
6. Finalmente cierra navegador/contextos, HTTP/conexiones, auth/store/temporizadores,
   pool y elimina exclusivamente su esquema, tras comprobar otra vez la base.
   Los finally también se ejecutan ante errores de preparación o prueba.

Una base incorrecta/ausente o falta de Chromium falla; no se omiten pruebas.
Los fallos se informan mediante reporter seguro: nombre del caso y estado,
sin cuerpos de petición, valores de fill, cookies o contraseñas. El reporter sustituye
el error-context.md automático por caso/estado sin detalles privados. No se guardan
storageState, trazas, vídeos ni capturas automáticas al fallar un login.
Las capturas explícitas de aceptación muestran solo solicitudes ficticias después
del login y se guardan en test-results/e2e, ignorado por Git. No se suben artefactos
de autenticación a CI. Para investigar, usa los casos y sus aserciones; no habilites
informes con secretos sin revisar previamente su contenido.

## Recorridos

- Crear/editar borrador → enviar → aprobar por teclado → consulta del autor y filtro.
- Rechazar en viewport móvil, validar motivo, comprobar historial de autor/revisor.
- Cancelar antes/después de envío, distinta visibilidad y aislamiento de dos ajenos.
- Autor cancela en otro contexto mientras el responsable prepara rechazo:
  409 y recuperación del detalle vigente.
- Logout, navegación atrás y cambio de cuenta sin recuperar datos de la anterior.

No se duplica la matriz completa de permisos/Unicode en navegador. Las carreras
precisas siguen en integración con pg_blocking_pids; cero esperas fijas en E2E.
Los viewports 1280x900 y 390x844 comprueban ausencia de desbordamiento, etiquetas,
mensajes, foco y teclado. No acreditan todos los navegadores, dispositivo físico,
TLS desplegado ni auditoría exhaustiva de accesibilidad.

## Dependencias

La revisión npm audit mantiene tres avisos moderados: node-pg-migrate → glob
(cancelación AbortSignal) → minimatch (amplificación globparts/DoS).
node-pg-migrate 9.0.0 requiere glob ~13.0.0; las correcciones señaladas no caben
en esa línea compatible. npm propone bajar node-pg-migrate a 7.6.1, cambio mayor
que no se aplica para silenciar el informe. No hay actualizaciones masivas ni
overrides que fuercen un major transitivo.

Es tooling de migraciones con rutas locales controladas; no se aceptan patrones
glob del usuario HTTP. Esto acota la exposición, no elimina los avisos.
npm ci también informa allowScripts de argon2/esbuild; instalación, hashes y build
se comprueban sin --force ni desactivar scripts. Pendiente revisar una actualización
compatible cuando exista. La adición de Playwright solo incorpora sus tres paquetes.

## CI y alcance de evidencia

Workflow: instalación, tipos, pruebas, preparación/migraciones repetidas en
PostgreSQL efímero, integración, build, instalación de Chromium y E2E.
Se conservan npm 11.19.1, Node 24, permisos contents: read y timeout de 10 minutos.
Sin servicios externos o Docker local. La ejecución local no acredita la ejecución
del workflow modificado: la aceptación remota requiere el commit publicado y su CI.
