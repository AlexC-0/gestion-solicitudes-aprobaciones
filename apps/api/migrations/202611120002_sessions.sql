-- Up Migration
-- Formato connect-pg-simple; timestamp sin zona exigido por el adaptador.
CREATE TABLE sesiones (
 sid varchar NOT NULL PRIMARY KEY,
 sess json NOT NULL,
 expire timestamp(6) NOT NULL
);
CREATE INDEX sesiones_expire ON sesiones(expire);

-- Down Migration
-- Las migraciones publicadas se conservan; no se ofrece reset destructivo.