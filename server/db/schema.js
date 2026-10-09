// Schema declarativo (Drizzle ORM) — espelha as tabelas criadas por
// server/db/migrations/*.sql. Todas as queries da aplicação passam por aqui,
// o que garante parâmetros vinculados automaticamente (proteção contra SQL injection).
import { pgTable, serial, text, integer, bigint, numeric, boolean, date, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  nome: text('nome').notNull(),
  senhaHash: text('senha_hash').notNull(),
  role: text('role').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  trocaSenha: boolean('trocar_senha').notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  ultimoUso: timestamp('ultimo_uso', { withTimezone: true }).notNull().defaultNow(),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  expiraAbsoluto: timestamp('expira_absoluto', { withTimezone: true }).notNull(),
  userAgent: text('user_agent'),
}, (t) => [index('idx_sessions_user').on(t.userId)]);

// Colunas JSONB: sem anotações de tipo (projeto em JS puro); os valores chegam
// já convertidos pelo driver e são normalizados em utils/serialize.js
export const imoveis = pgTable('imoveis', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titulo: text('titulo').notNull(),
  finalidade: text('finalidade').notNull(),
  tipo: text('tipo').notNull(),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  preco: bigint('preco', { mode: 'number' }).notNull(),
  condominio: bigint('condominio', { mode: 'number' }),
  iptu: bigint('iptu', { mode: 'number' }),
  area: numeric('area', { precision: 12, scale: 2, mode: 'number' }),
  areaConstruida: numeric('area_construida', { precision: 12, scale: 2, mode: 'number' }),
  quartos: integer('quartos'),
  suites: integer('suites'),
  banheiros: integer('banheiros'),
  vagas: integer('vagas'),
  descricao: text('descricao'),
  diferenciais: jsonb('diferenciais').notNull(),
  imagens: jsonb('imagens').notNull(),
  destaque: boolean('destaque').notNull().default(false),
  codigo: text('codigo').notNull().unique(),
  dataPublicacao: date('data_publicacao').notNull(),
  status: text('status').notNull().default('rascunho'),
  endereco: jsonb('endereco'),
  ocultarEndereco: boolean('ocultar_endereco').notNull().default(true),
  corretorId: integer('corretor_id').references(() => users.id, { onDelete: 'set null' }),
  deletadoEm: timestamp('deletado_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('idx_imoveis_status').on(t.status)]);

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  acao: text('acao').notNull(),
  imovelId: text('imovel_id'),
  detalhes: text('detalhes'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});