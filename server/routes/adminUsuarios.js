import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { asc, eq, not } from 'drizzle-orm';
import { usuarioSchema } from '../utils/schemas.js';
import { requireAuth } from '../utils/auth.js';
import { audit } from '../utils/audit.js';
import { isUniqueViolation } from '../utils/errors.js';

export default async function adminUsuariosRoutes(app) {
  app.get('/api/admin/usuarios', { preHandler: requireAuth('admin') }, async () => {
    const usuarios = await db.select({
      id: users.id, email: users.email, nome: users.nome, role: users.role,
      ativo: users.ativo, trocarSenha: users.trocaSenha, criadoEm: users.criadoEm,
    }).from(users).orderBy(asc(users.nome));
    return { usuarios };
  });

  app.get('/api/admin/usuarios/options', { preHandler: requireAuth() }, async () => {
    // lista simples para o select de "corretor responsável" no formulário de imóvel
    const usuarios = await db.select({ id: users.id, nome: users.nome }).from(users)
      .where(eq(users.ativo, true)).orderBy(asc(users.nome));
    return { usuarios };
  });

  app.post('/api/admin/usuarios', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const parsed = usuarioSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    try {
      const [row] = await db.insert(users).values({
        email: parsed.data.email,
        nome: parsed.data.nome,
        senhaHash: await bcrypt.hash(parsed.data.senha, 12),
        role: parsed.data.role,
        trocaSenha: true,
      }).returning({ id: users.id });
      await audit(req.user.id, 'criou_usuario', null, { email: parsed.data.email, role: parsed.data.role });
      return reply.code(201).send({ id: row.id });
    } catch (e) {
      if (isUniqueViolation(e)) return reply.code(409).send({ erro: 'E-mail já cadastrado' });
      throw e;
    }
  });

  app.post('/api/admin/usuarios/:id/resetar-senha', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const [row] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!row) return reply.code(404).send({ erro: 'Usuário não encontrado' });
    const senha = crypto.randomBytes(9).toString('base64url'); // senha temporária
    await db.update(users).set({ senhaHash: await bcrypt.hash(senha, 12), trocaSenha: true }).where(eq(users.id, row.id));
    await db.delete(sessions).where(eq(sessions.userId, row.id)); // derruba sessões ativas
    await audit(req.user.id, 'resetou_senha', null, { email: row.email });
    return { senhaTemporaria: senha };
  });

  app.post('/api/admin/usuarios/:id/desativar', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const [row] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!row) return reply.code(404).send({ erro: 'Usuário não encontrado' });
    if (row.id === req.user.id) return reply.code(400).send({ erro: 'Você não pode desativar a si mesmo' });
    await db.update(users).set({ ativo: !row.ativo }).where(eq(users.id, row.id));
    await db.delete(sessions).where(eq(sessions.userId, row.id));
    await audit(req.user.id, row.ativo ? 'desativou_usuario' : 'reativou_usuario', null, { email: row.email });
    return { ok: true, ativo: !row.ativo };
  });
}