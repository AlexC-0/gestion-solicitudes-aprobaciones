import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { assertDatabase, createPool, requireUrl, schemaName, testDatabase } from '../../src/persistence/database.js';

export async function withTestSchema<T>(operation: (pool: pg.Pool, schema: string) => Promise<T>, url = requireUrl('TEST_DATABASE_URL')): Promise<T> {
  const control = createPool(url);
  const schema = schemaName(`p02_test_${randomUUID().replaceAll('-', '')}`);
  let created = false;
  let pool: pg.Pool | undefined;
  try {
    await assertDatabase(control, testDatabase);
    await control.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    pool = createPool(url, schema);
    return await operation(pool, schema);
  } finally {
    await pool?.end();
    try {
      if (created) {
        await assertDatabase(control, testDatabase);
        await control.query(`DROP SCHEMA "${schema}" CASCADE`);
      }
    } finally { await control.end(); }
  }
}
