import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_URL = 'postgres://invictus_app:invictus_local_dev@127.0.0.1:5433/invictus';

const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DEFAULT_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Cliente do ORM: todas as consultas da aplicação usam o Drizzle (parâmetros sempre vinculados)
export const db = drizzle(pool, { schema });

pool.on('error', (err) => console.error('Erro inesperado no pool do Postgres:', err.message));

export const query = (text, params) => pool.query(text, params);

// Aplica migrações em ordem; cada arquivo roda dentro de uma transação.
export async function migrate() {
  await query('CREATE TABLE IF NOT EXISTS _migrations (nome TEXT PRIMARY KEY, aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const ja = await query('SELECT 1 FROM _migrations WHERE nome = $1', [f]);
    if (ja.rowCount) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (nome) VALUES ($1)', [f]);
      await client.query('COMMIT');
      console.log(`migração aplicada: ${f}`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await migrate();
  console.log('Banco PostgreSQL pronto.');
  await pool.end();
}