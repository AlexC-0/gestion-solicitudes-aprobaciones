import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type pg from 'pg';
import { ConfigurationError, transaction } from './database.js';

export const seedAccounts = [
  { id: '00000000-0000-4000-8000-000000000001', nombre: 'Solicitante Uno', correo: 'solicitante1@example.com', rol: 'solicitante' },
  { id: '00000000-0000-4000-8000-000000000002', nombre: 'Solicitante Dos', correo: 'solicitante2@example.com', rol: 'solicitante' },
  { id: '00000000-0000-4000-8000-000000000003', nombre: 'Revisor Uno', correo: 'revisor1@example.com', rol: 'revisor' },
  { id: '00000000-0000-4000-8000-000000000004', nombre: 'Revisor Dos', correo: 'revisor2@example.com', rol: 'revisor' },
] as const;
const types = [
  { codigo: 'material', nombre: 'Material', revisor: seedAccounts[2].id },
  { codigo: 'software', nombre: 'Acceso a software', revisor: seedAccounts[2].id },
  { codigo: 'formacion', nombre: 'Formación', revisor: seedAccounts[3].id },
];
export type SeedCredentials = { correo: string; password: string }[];
export function generateCredentials(): SeedCredentials {
  return seedAccounts.map(({ correo }) => ({ correo, password: randomBytes(24).toString('base64url') }));
}
export function validateCredentials(value: unknown): SeedCredentials {
  if (!Array.isArray(value) || value.length !== seedAccounts.length || !seedAccounts.every(account =>
    value.filter((v: unknown) => typeof v === 'object' && v !== null && 'correo' in v && v.correo === account.correo &&
      'password' in v && typeof v.password === 'string' && v.password.length >= 24).length === 1)) {
    throw new ConfigurationError('Archivo privado de seed no válido; no se cambian datos.');
  }
  return value as SeedCredentials;
}
export async function seed(pool: pg.Pool, credentials: SeedCredentials): Promise<void> {
  validateCredentials(credentials);
  await transaction(pool, async client => {
    await client.query('LOCK TABLE usuarios, tipos_solicitud IN SHARE ROW EXCLUSIVE MODE');
    for (const account of seedAccounts) {
      const password = credentials.find(c => c.correo === account.correo)!.password;
      const existing = await client.query('SELECT id, nombre, correo, rol, password_hash FROM usuarios WHERE id=$1 OR correo=$2', [account.id, account.correo]);
      if (existing.rowCount) {
        const row = existing.rows[0];
        if (existing.rowCount !== 1 || row.id !== account.id || row.correo !== account.correo || row.nombre !== account.nombre || row.rol !== account.rol ||
          !await argon2.verify(row.password_hash as string, password)) {
          throw new ConfigurationError('Conflicto con usuario existente; seed revertido sin sobrescribir datos.');
        }
      } else {
        const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1, hashLength: 32 });
        await client.query('INSERT INTO usuarios(id,nombre,correo,rol,password_hash) VALUES($1,$2,$3,$4,$5)', [account.id,account.nombre,account.correo,account.rol,hash]);
      }
    }
    for (const type of types) {
      const existing = await client.query('SELECT nombre,revisor_id FROM tipos_solicitud WHERE codigo=$1', [type.codigo]);
      if (existing.rowCount) {
        if (existing.rows[0].nombre !== type.nombre || existing.rows[0].revisor_id !== type.revisor) {
          throw new ConfigurationError('Conflicto con tipo existente; seed revertido sin reasignar.');
        }
      } else {
        await client.query('INSERT INTO tipos_solicitud(codigo,nombre,revisor_id) VALUES($1,$2,$3)', [type.codigo,type.nombre,type.revisor]);
      }
    }
  });
}
