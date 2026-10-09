// Migração pontual do banco SQLite (legado) para JSON, usado na troca para PostgreSQL.
// Execução única: node server/scripts/export-sqlite.js
// Requer better-sqlite3 instalado (só é usado neste script de migração).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const origem = process.argv[2] || path.join(__dirname, '..', 'data', 'invictus.db');
const destino = process.argv[3] || path.join(__dirname, '..', 'data', 'sqlite-export.json');

if (!fs.existsSync(origem)) {
  console.error('Banco SQLite não encontrado em', origem);
  process.exit(1);
}

const db = new Database(origem, { readonly: true });
const dump = {};
for (const t of ['users', 'imoveis', 'audit_log']) {
  dump[t] = db.prepare(`SELECT * FROM ${t}`).all();
}
db.close();
fs.writeFileSync(destino, JSON.stringify(dump, null, 2));
console.log(`Exportado para ${destino}:`, Object.entries(dump).map(([k, v]) => `${k}=${v.length}`).join(', '));