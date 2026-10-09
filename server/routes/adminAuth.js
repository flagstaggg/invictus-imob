import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { loginSchema, trocarSenhaSchema } from '../utils/schemas.js';
import { createSession, destroySession, requireAuth } from '../utils/auth.js';
import { audit } from '../utils/audit.js';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 12 * 60 * 60,
};

export default async function adminAuthRoutes(app) {
  app.post('/api/admin/login', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: 'Dados inválidos' });
    const { email, senha } = parsed.data;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const ok = user && user.ativo && (await bcrypt.compare(senha, user.senhaHash));
    if (!ok) {
      await audit(null, 'login_falhou', null, { email });
      return reply.code(401).send({ erro: 'E-mail ou senha inválidos' });
    }
    const sid = await createSession(user.id, req.headers['user-agent'] || '');
    reply.setCookie('session', sid, COOKIE_OPTS);
    await audit(user.id, 'login');
    return { ok: true, trocarSenha: user.trocaSenha, role: user.role };
  });

  app.post('/api/admin/logout', async (req, reply) => {
    await destroySession(req.cookies?.session);
    reply.clearCookie('session', { path: '/' });
    return { ok: true };
  });

  app.get('/api/admin/me', { preHandler: requireAuth() }, async (req) => ({ user: req.user }));

  app.post('/api/admin/trocar-senha', { preHandler: requireAuth() }, async (req, reply) => {
    const parsed = trocarSenhaSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ erro: parsed.error.issues[0]?.message || 'Dados inválidos' });
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const ok = await bcrypt.compare(parsed.data.senhaAtual, user.senhaHash);
    if (!ok) return reply.code(400).send({ erro: 'Senha atual incorreta' });
    const hash = await bcrypt.hash(parsed.data.novaSenha, 12);
    await db.update(users).set({ senhaHash: hash, trocaSenha: false }).where(eq(users.id, user.id));
    await audit(user.id, 'trocou_senha');
    return { ok: true };
  });
}