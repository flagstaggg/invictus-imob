import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { db } from '../db/index.js';
import { imoveis } from '../db/schema.js';
import { and, count, desc, eq, ilike, isNull, isNotNull, or } from 'drizzle-orm';
import { imovelSchema } from '../utils/schemas.js';
import { requireAuth } from '../utils/auth.js';
import { audit } from '../utils/audit.js';
import { isUniqueViolation } from '../utils/errors.js';
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
  return {
    ...toPublicProperty(row),
    corretorId: row.corretorId,
    deletadoEm: row.deletadoEm,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

async function findById(id) {
  const [row] = await db.select().from(imoveis).where(eq(imoveis.id, id)).limit(1);
  return row || null;
}

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function adminImoveisRoutes(app) {
  // listagem com busca, filtros e paginação (inclui rascunhos/vendidos; só admin restaura)
  app.get('/api/admin/imoveis', { preHandler: requireAuth() }, async (req) => {
    const { busca = '', finalidade, status = '', tipo = '', pagina = '1', porPagina = '12', deletados } = req.query;

    const filtros = [
      deletados === '1' ? isNotNull(imoveis.deletadoEm) : isNull(imoveis.deletadoEm),
    ];
    if (busca) {
      const termo = `%${String(busca)}%`;
      filtros.push(or(ilike(imoveis.titulo, termo), ilike(imoveis.codigo, termo), ilike(imoveis.bairro, termo)));
    }
    if (finalidade) filtros.push(eq(imoveis.finalidade, String(finalidade)));
    if (status) filtros.push(eq(imoveis.status, String(status)));
    if (tipo) filtros.push(eq(imoveis.tipo, String(tipo)));
    const where = and(...filtros);

    const p = Math.max(1, parseInt(pagina, 10) || 1);
    const pp = Math.min(50, Math.max(1, parseInt(porPagina, 10) || 12));

    const [{ total }] = await db.select({ total: count() }).from(imoveis).where(where);
    const itens = await db.select().from(imoveis).where(where).orderBy(desc(imoveis.atualizadoEm)).limit(pp).offset((p - 1) * pp);

    return { total, pagina: p, porPagina: pp, itens: itens.map(adminRow) };
  });

  app.get('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = await findById(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    return { imovel: adminRow(row) };
  });

  app.post('/api/admin/imoveis', { preHandler: requireAuth() }, async (req, reply) => {
    const parsed = imovelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const d = parsed.data;
    try {
      const [row] = await db.insert(imoveis).values({
        id: `p${Date.now().toString(36)}`,
        slug: d.slug || slugify(d.titulo),
        titulo: d.titulo,
        finalidade: d.finalidade,
        tipo: d.tipo,
        bairro: d.bairro,
        cidade: d.cidade,
        preco: d.preco,
        condominio: d.condominio ?? null,
        iptu: d.iptu ?? null,
        area: d.area ?? null,
        areaConstruida: d.areaConstruida ?? null,
        quartos: d.quartos ?? null,
        suites: d.suites ?? null,
        banheiros: d.banheiros ?? null,
        vagas: d.vagas ?? null,
        descricao: d.descricao ?? null,
        diferenciais: d.diferenciais,
        imagens: d.imagens ?? [],
        destaque: d.destaque,
        codigo: d.codigo,
        dataPublicacao: new Date().toISOString().slice(0, 10),
        status: d.status,
        endereco: d.endereco ?? null,
        ocultarEndereco: d.ocultarEndereco,
        corretorId: d.corretorId ?? req.user.id,
      }).returning();
      await audit(req.user.id, 'criou_imovel', row.id, { titulo: d.titulo });
      return reply.code(201).send({ imovel: adminRow(row) });
    } catch (e) {
      if (isUniqueViolation(e)) return reply.code(409).send({ erro: 'Código ou slug já existente' });
      throw e;
    }
  });

  app.put('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = await findById(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    const parsed = imovelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const d = parsed.data;
    try {
      const [updated] = await db.update(imoveis).set({
        titulo: d.titulo,
        finalidade: d.finalidade,
        tipo: d.tipo,
        bairro: d.bairro,
        cidade: d.cidade,
        preco: d.preco,
        condominio: d.condominio ?? null,
        iptu: d.iptu ?? null,
        area: d.area ?? null,
        areaConstruida: d.areaConstruida ?? null,
        quartos: d.quartos ?? null,
        suites: d.suites ?? null,
        banheiros: d.banheiros ?? null,
        vagas: d.vagas ?? null,
        descricao: d.descricao ?? null,
        diferenciais: d.diferenciais,
        imagens: d.imagens !== undefined ? d.imagens : row.imagens,
        destaque: d.destaque,
        codigo: d.codigo,
        status: d.status,
        endereco: d.endereco ?? null,
        ocultarEndereco: d.ocultarEndereco,
        corretorId: d.corretorId ?? row.corretorId,
        atualizadoEm: new Date(),
      }).where(eq(imoveis.id, req.params.id)).returning();
      await audit(req.user.id, 'editou_imovel', req.params.id, { titulo: d.titulo });
      return { imovel: adminRow(updated) };
    } catch (e) {
      if (isUniqueViolation(e)) return reply.code(409).send({ erro: 'Código já existente em outro imóvel' });
      throw e;
    }
  });

  // exclusão lógica (admin restaura)
  app.delete('/api/admin/imoveis/:id', { preHandler: requireAuth() }, async (req, reply) => {
    const row = await findById(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    await db.update(imoveis)
      .set({ deletadoEm: new Date(), status: 'rascunho', atualizadoEm: new Date() })
      .where(eq(imoveis.id, req.params.id));
    await audit(req.user.id, 'excluiu_imovel', req.params.id);
    return { ok: true };
  });

  app.post('/api/admin/imoveis/:id/restaurar', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = await findById(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    await db.update(imoveis).set({ deletadoEm: null }).where(eq(imoveis.id, req.params.id));
    await audit(req.user.id, 'restaurou_imovel', req.params.id);
    return { ok: true };
  });

  // exclusão definitiva: remove a linha e apaga as fotos do disco (somente arquivos locais)
  app.delete('/api/admin/imoveis/:id/definitivo', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = await findById(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    for (const img of Array.isArray(row.imagens) ? row.imagens : []) {
      const src = typeof img === 'string' ? img : img?.src;
      if (typeof src === 'string' && src.startsWith('/uploads/')) {
        const base = path.basename(src).replace(/-(lg|md|sm)\.webp$/, '');
        for (const s of SIZES) {
          const f = path.join(UPLOADS_DIR, `${base}${s.suffix}.webp`);
          if (fs.existsSync(f)) fs.unlinkSync(f);
        }
      }
    }
    await db.delete(imoveis).where(eq(imoveis.id, req.params.id));
    await audit(req.user.id, 'excluiu_definitivo', req.params.id);
    return { ok: true };
  });

  // upload de fotos: valida pelo conteúdo, converte p/ WebP, 3 tamanhos
  app.post('/api/admin/imoveis/:id/fotos', { preHandler: requireAuth() }, async (req, reply) => {
    const row = await findById(req.params.id);
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
      for (const s of SIZES) {
        const out = path.join(UPLOADS_DIR, `${base}${s.suffix}.webp`);
        await sharp(buf).rotate().resize({ width: s.w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
      }
      salvos.push(`/uploads/${base}-lg.webp`);
    }
    if (!salvos.length) return reply.code(400).send({ erro: 'Nenhuma foto enviada' });
    const atuais = Array.isArray(row.imagens) ? row.imagens : [];
    const imagens = [...atuais, ...salvos].slice(0, 40);
    await db.update(imoveis).set({ imagens, atualizadoEm: new Date() }).where(eq(imoveis.id, req.params.id));
    await audit(req.user.id, 'upload_fotos', req.params.id, { qtd: salvos.length });
    return { imagens };
  });

}