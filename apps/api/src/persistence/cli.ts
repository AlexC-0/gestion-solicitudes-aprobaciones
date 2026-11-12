import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { assertDatabase, ConfigurationError, createPool, developmentDatabase, requireUrl, testDatabase } from './database.js';
import { migrate } from './migrate.js';
import { generateCredentials, seed, validateCredentials } from './seed.js';

const command = process.argv[2];
const testing = process.argv.includes('--test');
let pool: ReturnType<typeof createPool> | undefined;
try {
  if (!['check', 'migrate', 'seed'].includes(command ?? '') || (testing && command === 'seed')) {
    throw new ConfigurationError('Comando no admitido; seed solo está disponible para desarrollo.');
  }
  pool = createPool(requireUrl(testing ? 'TEST_DATABASE_URL' : 'DATABASE_URL'));
  await assertDatabase(pool, testing ? testDatabase : developmentDatabase);
  if (command === 'check') console.log('Conexión y nombre de base comprobados.');
  if (command === 'migrate') console.log(`Migraciones aplicadas: ${(await migrate(pool)).length}.`);
  if (command === 'seed') {
    const path = resolve('.local/seed-credentials.json');
    if (!existsSync(path)) {
      const existing = await pool.query('SELECT count(*)::int AS total FROM usuarios');
      if (existing.rows[0].total !== 0) throw new ConfigurationError('Hay usuarios pero no archivo privado de seed; no se generan contraseñas nuevas.');
      await mkdir(resolve('.local'), { recursive: true });
      await writeFile(path, '', { flag: 'wx', mode: 0o600 });
      if (process.platform === 'win32') {
        const user = execFileSync('whoami', [], { encoding: 'utf8', windowsHide: true }).trim();
        execFileSync('icacls', [path, '/inheritance:r', '/grant:r', `${user}:F`, 'SYSTEM:F'], { windowsHide: true, stdio: 'ignore' });
      }
      await writeFile(path, JSON.stringify(generateCredentials(), null, 2));
    }
    const credentials = validateCredentials(JSON.parse(await readFile(path, 'utf8')));
    await seed(pool, credentials);
    console.log(`Seed comprobado. Credenciales privadas: ${path}`);
  }
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : 'Operación PostgreSQL fallida. Revisa la instancia, la configuración privada y las migraciones.');
  process.exitCode = 1;
} finally { await pool?.end(); }
