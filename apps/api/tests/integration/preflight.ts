import { assertDatabase, createPool, requireUrl, testDatabase } from '../../src/persistence/database.js';
export default async function setup() {
  const pool = createPool(requireUrl('TEST_DATABASE_URL'));
  try { await assertDatabase(pool, testDatabase); }
  catch { throw new Error('Integración rechazada: comprueba TEST_DATABASE_URL y la base gestion_solicitudes_aprobaciones_test. No se han preparado esquemas.'); }
  finally { await pool.end(); }
}
