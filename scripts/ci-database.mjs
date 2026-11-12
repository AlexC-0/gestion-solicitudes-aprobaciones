import { createRequire } from 'node:module';
const { Client, escapeLiteral } = createRequire(new URL('../apps/api/package.json', import.meta.url))('pg');
// Solo el servicio efímero del runner; nunca carga .env ni usa credenciales locales.
if (process.env.CI !== 'true' || !process.env.CI_ADMIN_URL || !process.env.CI_DATABASE_PASSWORD) {
  throw new Error('La preparación requiere el entorno CI explícito.');
}
const client = new Client({ connectionString: process.env.CI_ADMIN_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  const password = escapeLiteral(process.env.CI_DATABASE_PASSWORD);
  for (const [role, database] of [
    ['p02_ci_dev', 'gestion_solicitudes_aprobaciones'],
    ['p02_ci_test', 'gestion_solicitudes_aprobaciones_test'],
  ]) {
    await client.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD ${password}`);
    await client.query(`CREATE DATABASE ${database} OWNER ${role}`);
    await client.query(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC`);
  }
  console.log('Bases y roles exclusivos de CI preparados.');
} catch {
  console.error('No se pudo preparar la base efímera de CI.');
  process.exitCode = 1;
} finally { await client.end(); }
