import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'invictus.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// aplica migrações em ordem (000_meta + diretório migrations/)
export function migrate() {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (nome TEXT PRIMARY KEY, aplicada_em TEXT NOT NULL DEFAULT (datetime('now')))`);
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const ja = db.prepare('SELECT 1 FROM _migrations WHERE nome = ?').get(f);
    if (ja) continue;
    db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
    db.prepare('INSERT INTO _migrations (nome) VALUES (?)').run(f);
    console.log(`migração aplicada: ${f}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  migrate();
  console.log('Banco pronto em', path.join(dataDir, 'invictus.db'));
}
