import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { usuarioSchema } from '../utils/schemas.js';
import { requireAuth } from '../utils/auth.js';
import { audit } from '../utils/audit.js';

export default async function adminUsuariosRoutes(app) {
  app.get('/api/admin/usuarios', { preHandler: requireAuth('admin') }, async () => {
    const rows = db.prepare('SELECT id, email, nome, role, ativo, trocar_senha, criado_em FROM users ORDER BY nome').all();
    return { usuarios: rows };
  });

  app.get('/api/admin/usuarios/options', { preHandler: requireAuth() }, async () => {
    // lista simples para o select de "corretor responsável" no formulário de imóvel
    const rows = db.prepare(`SELECT id, nome FROM users WHERE ativo = 1 ORDER BY nome`).all();
    return { usuarios: rows };
  });

  app.post('/api/admin/usuarios', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const parsed = usuarioSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const hash = await bcrypt.hash(parsed.data.senha, 12);
    try {
      const r = db.prepare('INSERT INTO users (email, nome, senha_hash, role, trocar_senha) VALUES (?, ?, ?, ?, 1)')
        .run(parsed.data.email, parsed.data.nome, hash, parsed.data.role);
      audit(req.user.id, 'criou_usuario', null, { email: parsed.data.email, role: parsed.data.role });
      return reply.code(201).send({ id: r.lastInsertRowid });
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) return reply.code(409).send({ erro: 'E-mail já cadastrado' });
      throw e;
    }
  });

  app.post('/api/admin/usuarios/:id/resetar-senha', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Usuário não encontrado' });
    const senha = crypto.randomBytes(9).toString('base64url'); // senha temporária
    const hash = await bcrypt.hash(senha, 12);
    db.prepare('UPDATE users SET senha_hash = ?, trocar_senha = 1 WHERE id = ?').run(hash, row.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id); // derruba sessões ativas
    audit(req.user.id, 'resetou_senha', null, { email: row.email });
    return { senhaTemporaria: senha };
  });

  app.post('/api/admin/usuarios/:id/desativar', { preHandler: requireAuth('admin') }, async (req, reply) => {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!row) return reply.code(404).send({ erro: 'Usuário não encontrado' });
    if (row.id === req.user.id) return reply.code(400).send({ erro: 'Você não pode desativar a si mesmo' });
    db.prepare('UPDATE users SET ativo = CASE WHEN ativo = 1 THEN 0 ELSE 1 END WHERE id = ?').run(row.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(row.id);
    audit(req.user.id, row.ativo ? 'desativou_usuario' : 'reativou_usuario', null, { email: row.email });
    return { ok: true, ativo: !row.ativo };
  });
}
