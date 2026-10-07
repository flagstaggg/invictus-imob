import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { db } from '../db/index.js';
import { imovelSchema } from '../utils/schemas.js';
import { requireAuth } from '../utils/auth.js';
import { audit } from '../utils/audit.js';
import { toPublicProperty } from '../utils/serialize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MAX_FILES = 20;
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const SIZES = [
  { w: 1600, suffix: '-lg' },
  { w: 800, suffix: '-md' },
  { w: 400, suffix: '-sm' },
];

function adminRow(row) {
  return { ...toPublicProperty(row), corretorId: row.corretor_id, deletadoEm: row.deletado_em, criadoEm: row.criado_em, atualizadoEm: row.atualizado_em };
}

export default async function adminImoveisRoutes(app) {
  // listagem com busca, filtros e paginação (inclui rascunhos/vendidos; só admin restaura)
  app.get('/api/admin/imoveis', { preHandler: requireAuth() }, async (req) => {
    const { busca = '', finalidade, status = '', tipo = '', pagina = '1', porPagina = '12', deletados } = req.query;
    const where = [];
    const args = [];
    where.push(deletados === '1' ? 'deletado_em IS NOT NULL' : 'deletado_em IS NULL');
    if (busca) { where.push('(titulo LIKE ? OR codigo LIKE ? OR bairro LIKE ?)'); args.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
    if (finalidade) { where.push('finalidade = ?'); args.push(finalidade); }
    if (status) { where.push('status = ?'); args.push(status); }
    if (tipo) { where.push('tipo = ?'); args.push(tipo); }
    const whereSql = where.join(' AND ');
    const total = db.prepare(`SELECT COUNT(*) AS n FROM imoveis WHERE ${whereSql}`).get(...args).n;
    const p = Math.max(1, parseInt(pagina, 10) || 1);
    const pp = Math.min(50, Math.max(1, parseInt(porPagina, 10) || 12));
    const rows = db.prepare(
      `SELECT * FROM imoveis WHERE ${whereSql} ORDER BY atualizado_em DESC LIMIT ? OFFSET ?`,
    ).all(...args, pp, (p - 1) * pp);
    return { total, pagina: p, porPagina: pp, itens: rows.map(adminRow) };
  });

  app.get('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    return { imovel: adminRow(row) };
  });

  app.post('/api/admin/imoveis', { preHandler: requireAuth() }, async (req, reply) => {
    const parsed = imovelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const d = parsed.data;
    const id = `p${Date.now().toString(36)}`;
    const slug = d.slug || d.titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      db.prepare(`INSERT INTO imoveis (id, slug, titulo, finalidade, tipo, bairro, cidade, preco, condominio, iptu, area, area_construida, quartos, suites, banheiros, vagas, descricao, diferenciais, imagens, destaque, codigo, status, endereco, ocultar_endereco, corretor_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        id, slug, d.titulo, d.finalidade, d.tipo, d.bairro, d.cidade, d.preco, d.condominio ?? null, d.iptu ?? null,
        d.area ?? null, d.areaConstruida ?? null, d.quartos ?? null, d.suites ?? null, d.banheiros ?? null, d.vagas ?? null,
        d.descricao ?? null, JSON.stringify(d.diferenciais), JSON.stringify(d.imagens ?? []), d.destaque ? 1 : 0, d.codigo,
        d.status, d.endereco ? JSON.stringify(d.endereco) : null, d.ocultarEndereco ? 1 : 0, d.corretorId ?? req.user.id,
      );
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) return reply.code(409).send({ erro: 'Código ou slug já existente' });
      throw e;
    }
    audit(req.user.id, 'criou_imovel', id, { titulo: d.titulo });
    return reply.code(201).send({ imovel: adminRow(db.prepare('SELECT * FROM imoveis WHERE id = ?').get(id)) });
  });

  app.put('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    const parsed = imovelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const d = parsed.data;
    const imagens = d.imagens !== undefined ? JSON.stringify(d.imagens) : row.imagens;
    db.prepare(`UPDATE imoveis SET titulo=?, finalidade=?, tipo=?, bairro=?, cidade=?, preco=?, condominio=?, iptu=?, area=?, area_construida=?, quartos=?, suites=?, banheiros=?, vagas=?, descricao=?, diferenciais=?, imagens=?, destaque=?, codigo=?, status=?, endereco=?, ocultar_endereco=?, corretor_id=?, atualizado_em=datetime('now') WHERE id=?`).run(
      d.titulo, d.finalidade, d.tipo, d.bairro, d.cidade, d.preco, d.condominio ?? null, d.iptu ?? null,
      d.area ?? null, d.areaConstruida ?? null, d.quartos ?? null, d.suites ?? null, d.banheiros ?? null, d.vagas ?? null,
      d.descricao ?? null, JSON.stringify(d.diferenciais), imagens, d.destaque ? 1 : 0, d.codigo, d.status,
      d.endereco ? JSON.stringify(d.endereco) : null, d.ocultarEndereco ? 1 : 0, d.corretorId ?? row.corretor_id, req.params.id,
    );
    audit(req.user.id, 'editou_imovel', req.params.id, { titulo: d.titulo });
    return { imovel: adminRow(db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id)) };
  });

  // exclusão lógica (admin restaura)
  app.delete('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    db.prepare(`UPDATE imoveis SET deletado_em = datetime('now'), status = 'rascunho' WHERE id = ?`).run(req.params.id);
    audit(req.user.id, 'excluiu_imovel', req.params.id);
    return { ok: true };
  });

  app.post('/api/admin/imoveis/:id/restaurar', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    db.prepare('UPDATE imoveis SET deletado_em = NULL WHERE id = ?').run(req.params.id);
    audit(req.user.id, 'restaurou_imovel', req.params.id);
    return { ok: true };
  });

  // exclusão definitiva: remove a linha e apaga as fotos do disco (somente arquivos locais)
  app.delete('/api/admin/imoveis/:id/definitivo', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    for (const img of JSON.parse(row.imagens || '[]')) {
      if (typeof img === 'string' && img.startsWith('/uploads/')) {
        const base = path.basename(img).replace(/-(lg|md|sm)\.webp$/, '');
        for (const s of SIZES) {
          const f = path.join(UPLOADS_DIR, `${base}${s.suffix}.webp`);
          if (fs.existsSync(f)) fs.unlinkSync(f);
        }
      }
    }
    db.prepare('DELETE FROM imoveis WHERE id = ?').run(req.params.id);
    audit(req.user.id, 'excluiu_definitivo', req.params.id);
    return { ok: true };
  });

  // upload de fotos: valida pelo conteúdo, converte p/ WebP, 3 tamanhos
  app.post('/api/admin/imoveis/:id/fotos', { preHandler: requireAuth() }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM imoveis WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    const parts = req.files({ limits: { fileSize: MAX_SIZE, files: MAX_FILES } });
    const salvos = [];
    for await (const part of parts) {
      const buf = await part.toBuffer();
      let meta;
      try {
        meta = await sharp(buf).metadata();
      } catch {
        return reply.code(400).send({ erro: `Arquivo "${part.filename}" não é uma imagem válida` });
      }
      if (!['jpeg', 'png', 'webp'].includes(meta.format)) {
        return reply.code(400).send({ erro: `Formato não aceito em "${part.filename}" (use JPEG, PNG ou WebP)` });
      }
      const base = crypto.randomUUID();
      const urls = [];
      for (const s of SIZES) {
        const out = path.join(UPLOADS_DIR, `${base}${s.suffix}.webp`);
        await sharp(buf).rotate().resize({ width: s.w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
        urls.push(`/uploads/${base}${s.suffix}.webp`);
      }
      salvos.push(`/uploads/${base}-lg.webp`);
    }
    if (!salvos.length) return reply.code(400).send({ erro: 'Nenhuma foto enviada' });
    const imagens = [...JSON.parse(row.imagens || '[]'), ...salvos].slice(0, 40);
    db.prepare('UPDATE imoveis SET imagens = ?, atualizado_em = datetime(\'now\') WHERE id = ?').run(JSON.stringify(imagens), req.params.id);
    audit(req.user.id, 'upload_fotos', req.params.id, { qtd: salvos.length });
    return { imagens };
  });
}
