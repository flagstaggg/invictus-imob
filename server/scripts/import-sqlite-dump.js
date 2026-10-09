// Importa o dump JSON do SQLite legado para o PostgreSQL (uso único na migração).
// Uso: node server/scripts/import-sqlite-dump.js server/data/sqlite-export.json
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { db, pool, migrate } from '../db/index.js';
import { users, imoveis, auditLog } from '../db/schema.js';
import { sql } from 'drizzle-orm';

const file = process.argv[2] || path.join(process.cwd(), 'server', 'data', 'sqlite-export.json');
if (!fs.existsSync(file)) {
  console.error('Arquivo não encontrado:', file);
  process.exit(1);
}
const dump = JSON.parse(fs.readFileSync(file, 'utf8'));
await migrate();

let nUsers = 0;
for (const u of dump.users || []) {
  const r = await db.insert(users).values({
    id: u.id,
    email: u.email,
    nome: u.nome,
    senhaHash: u.senha_hash,
    role: u.role,
    ativo: !!u.ativo,
    trocarSenha: !!u.trocar_senha,
    criadoEm: u.criado_em ? new Date(`${u.criado_em.replace(' ', 'T')}Z`) : new Date(),
  }).onConflictDoNothing();
  if (r.rowCount) nUsers += 1;
}
await db.execute(sql`SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1))`);

let nImoveis = 0;
for (const p of dump.imoveis || []) {
  const r = await db.insert(imoveis).values({
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    finalidade: p.finalidade,
    tipo: p.tipo,
    bairro: p.bairro,
    cidade: p.cidade,
    preco: p.preco,
    condominio: p.condominio ?? null,
    iptu: p.iptu ?? null,
    area: p.area ?? null,
    areaConstruida: p.area_construida ?? null,
    quartos: p.quartos ?? null,
    suites: p.suites ?? null,
    banheiros: p.banheiros ?? null,
    vagas: p.vagas ?? null,
    descricao: p.descricao ?? null,
    diferenciais: JSON.parse(p.diferencias || '[]'),
    imagens: JSON.parse(p.imagens || '[]'),
    destaque: !!p.destaque,
    codigo: p.codigo,
    dataPublicacao: p.data_publicacao,
    status: p.status,
    endereco: p.endereco ? JSON.parse(p.endereco) : null,
    ocultarEndereco: !!p.ocultar_endereco,
    corretorId: p.corretor_id ?? null,
    deletadoEm: p.deletado_em ? new Date(`${p.deletado_em.replace(' ', 'T')}Z`) : null,
    criadoEm: p.criado_em ? new Date(`${p.criado_em.replace(' ', 'T')}Z`) : new Date(),
    atualizadoEm: p.atualizado_em ? new Date(`${p.atualizado_em.replace(' ', 'T')}Z`) : new Date(),
  }).onConflictDoNothing();
  if (r.rowCount) nImoveis += 1;
}

let nLogs = 0;
for (const a of dump.audit_log || []) {
  const r = await db.insert(auditLog).values({
    userId: a.user_id ?? null,
    acao: a.acao,
    imovelId: a.imovel_id ?? null,
    detalhes: a.detalhes ?? null,
    criadoEm: a.criado_em ? new Date(`${a.criado_em.replace(' ', 'T')}Z`) : new Date(),
  });
  if (r.rowCount) nLogs += 1;
}

console.log(`Importação concluída: ${nUsers} usuário(s), ${nImoveis} imóvel(is), ${nLogs} registro(s) de auditoria.`);
await pool.end();