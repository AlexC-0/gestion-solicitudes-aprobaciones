import pg from 'pg';

export const developmentDatabase = 'gestion_solicitudes_aprobaciones';
export const testDatabase = 'gestion_solicitudes_aprobaciones_test';
export class ConfigurationError extends Error {}

export function requireUrl(name: 'DATABASE_URL' | 'TEST_DATABASE_URL'): string {
  const value = process.env[name];
  if (!value) throw new ConfigurationError(`Falta ${name} explícita.`);
  return value;
}

export function schemaName(schema: string): string {
  if (schema !== 'app' && !/^p02_test_[a-f0-9]{32}$/.test(schema)) {
    throw new ConfigurationError('Esquema fuera del ámbito propio.');
  }
  return schema;
}

export function createPool(connectionString: string, schema = 'app'): pg.Pool {
  let url: URL;
  try { url = new URL(connectionString); } catch { throw new ConfigurationError('URL PostgreSQL no válida.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.searchParams.has('options')) {
    throw new ConfigurationError('Configuración PostgreSQL no admitida.');
  }
  const pool = new pg.Pool({
    connectionString, max: 5, connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000, statement_timeout: 10000,
    options: `-c search_path=${schemaName(schema)},pg_catalog`,
  });
  pool.on('error', () => { console.error('Conexión PostgreSQL inactiva cerrada por un error.'); });
  return pool;
}

export async function assertDatabase(pool: pg.Pool, expected: string): Promise<void> {
  const result = await pool.query<{ name: string }>('SELECT current_database() AS name');
  if (result.rows[0]?.name !== expected) {
    throw new ConfigurationError(`Destino rechazado: se exige la base ${expected}.`);
  }
}

export async function transaction<T>(pool: pg.Pool, operation: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { discard = true; }
    throw error;
  } finally { client.release(discard); }
}
