import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';
import type pg from 'pg';
import { schemaName } from './database.js';

export const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url));

export async function migrate(pool: pg.Pool, schema = 'app', directory = migrationsDirectory) {
  const client = await pool.connect();
  let discard = false;
  try {
    return await runner({
      dbClient: client, dir: directory, direction: 'up',
      schema: schemaName(schema), migrationsSchema: schema, migrationsTable: 'pgmigrations',
      createSchema: true, createMigrationsSchema: true,
      singleTransaction: true, checkOrder: true, useGlob: false,
      logger: { info: () => {}, warn: () => {}, error: () => {} },
    });
  } catch (error) { discard = true; throw error; }
  finally { client.release(discard); }
}
