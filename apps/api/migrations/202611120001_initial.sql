-- Up Migration
CREATE TABLE usuarios (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nombre text NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 120),
 correo text NOT NULL UNIQUE CHECK (correo = lower(btrim(correo)) AND char_length(correo) <= 254 AND correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 password_hash text NOT NULL CHECK (password_hash LIKE '$argon2id$%' AND char_length(password_hash) BETWEEN 40 AND 4096),
 rol text NOT NULL CHECK (rol IN ('solicitante','revisor')),
 creada_en timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tipos_solicitud (
 codigo text PRIMARY KEY CHECK (char_length(codigo) BETWEEN 1 AND 50),
 nombre text NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 120),
 revisor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT
);
CREATE TABLE solicitudes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 autor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
 tipo_codigo text NOT NULL REFERENCES tipos_solicitud(codigo) ON DELETE RESTRICT,
 titulo text NOT NULL CHECK (titulo = btrim(titulo) AND char_length(titulo) BETWEEN 3 AND 120),
 descripcion text NOT NULL DEFAULT '' CHECK (char_length(descripcion) <= 3000),
 estado text NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador','pendiente','aprobada','rechazada','cancelada')),
 responsable_id uuid REFERENCES usuarios(id) ON DELETE RESTRICT,
 creada_en timestamptz NOT NULL DEFAULT now(),
 actualizada_en timestamptz NOT NULL DEFAULT now(),
 enviada_en timestamptz,
 finalizada_en timestamptz,
 CHECK (actualizada_en >= creada_en),
 CHECK (enviada_en IS NULL OR (enviada_en >= creada_en AND enviada_en <= actualizada_en AND char_length(descripcion) >= 10)),
 CHECK (finalizada_en IS NULL OR (finalizada_en >= coalesce(enviada_en,creada_en) AND finalizada_en <= actualizada_en)),
 CHECK (
  (estado='borrador' AND responsable_id IS NULL AND enviada_en IS NULL AND finalizada_en IS NULL) OR
  (estado='pendiente' AND responsable_id IS NOT NULL AND enviada_en IS NOT NULL AND finalizada_en IS NULL) OR
  (estado IN ('aprobada','rechazada') AND responsable_id IS NOT NULL AND enviada_en IS NOT NULL AND finalizada_en IS NOT NULL) OR
  (estado='cancelada' AND finalizada_en IS NOT NULL AND
    ((responsable_id IS NULL AND enviada_en IS NULL) OR (responsable_id IS NOT NULL AND enviada_en IS NOT NULL)))
 )
);
CREATE TABLE eventos_solicitud (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 solicitud_id uuid NOT NULL REFERENCES solicitudes(id) ON DELETE RESTRICT,
 actor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
 accion text NOT NULL,
 estado_anterior text,
 estado_posterior text NOT NULL,
 comentario text,
 creada_en timestamptz NOT NULL DEFAULT now(),
 CHECK (
  (accion='creacion' AND estado_anterior IS NULL AND estado_posterior='borrador') OR
  (accion='envio' AND estado_anterior IS NOT NULL AND estado_anterior='borrador' AND estado_posterior='pendiente') OR
  (accion='aprobacion' AND estado_anterior IS NOT NULL AND estado_anterior='pendiente' AND estado_posterior='aprobada') OR
  (accion='rechazo' AND estado_anterior IS NOT NULL AND estado_anterior='pendiente' AND estado_posterior='rechazada') OR
  (accion='cancelacion' AND estado_anterior IS NOT NULL AND estado_anterior IN ('borrador','pendiente') AND estado_posterior='cancelada')
 ),
 CHECK (
  (accion='rechazo' AND comentario IS NOT NULL AND char_length(comentario) BETWEEN 10 AND 1000) OR
  (accion='aprobacion' AND (comentario IS NULL OR char_length(comentario) <= 1000)) OR
  (accion IN ('creacion','envio','cancelacion') AND comentario IS NULL)
 )
);
CREATE INDEX solicitudes_autor_orden ON solicitudes(autor_id, creada_en DESC, id DESC);
CREATE INDEX solicitudes_responsable_orden ON solicitudes(responsable_id, creada_en DESC, id DESC) WHERE responsable_id IS NOT NULL;
CREATE INDEX solicitudes_estado_orden ON solicitudes(estado, creada_en DESC, id DESC);
CREATE INDEX eventos_solicitud_orden ON eventos_solicitud(solicitud_id, id);

-- Down Migration
-- No se ofrece un comando down/reset: la reversión destructiva exige otro encargo.
