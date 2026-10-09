import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { and, eq } from 'drizzle-orm';

const INATIVIDADE_MS = 30 * 60 * 1000;        // 30 min
const ABSOLUTA_MS = 12 * 60 * 60 * 1000;      // 12 h

export async function createSession(userId, userAgent = '') {
  const id = crypto.randomBytes(32).toString('hex');
  const agora = Date.now();
  await db.insert(sessions).values({
    id,
    userId,
    expiraEm: new Date(agora + INATIVIDADE_MS),
    expiraAbsoluto: new Date(agora + ABSOLUTA_MS),
    userAgent: String(userAgent).slice(0, 200),
  });
  return id;
}

export async function getSessionUser(sessionId) {
  if (!sessionId) return null;
  const [row] = await db
    .select({
      expiraEm: sessions.expiraEm,
      expiraAbsoluto: sessions.expiraAbsoluto,
      id: users.id,
      email: users.email,
      nome: users.nome,
      role: users.role,
      ativo: users.ativo,
      trocaSenha: users.trocaSenha,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  if (!row || !row.ativo) return null;
  const agora = Date.now();
  if (row.expiraEm.getTime() < agora) return null;
  if (row.expiraAbsoluto.getTime() < agora) return null;
  // renovação por inatividade
  await db.update(sessions)
    .set({ ultimoUso: new Date(), expiraEm: new Date(agora + INATIVIDADE_MS) })
    .where(eq(sessions.id, sessionId));
  return { id: row.id, email: row.email, nome: row.nome, role: row.role, trocarSenha: !!row.trocaSenha };
}

export async function destroySession(sessionId) {
  if (sessionId) await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// middleware: exige sessão; opcionalmente exige perfil
export function requireAuth(role = null) {
  return async (req, reply) => {
    const user = await getSessionUser(req.cookies?.session);
    if (!user) return reply.code(401).send({ erro: 'Não autenticado' });
    if (role && user.role !== role) return reply.code(403).send({ erro: 'Sem permissão' });
    req.user = user;
  };
}