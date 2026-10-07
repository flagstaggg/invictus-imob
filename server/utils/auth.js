import crypto from 'node:crypto';
import { db } from '../db/index.js';

const INATIVIDADE_MS = 30 * 60 * 1000;        // 30 min
const ABSOLUTA_MS = 12 * 60 * 60 * 1000;      // 12 h

export function createSession(userId, userAgent = '') {
  const id = crypto.randomBytes(32).toString('hex');
  const agora = Date.now();
  db.prepare(
    `INSERT INTO sessions (id, user_id, expira_em, expira_absoluto, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, userId, new Date(agora + INATIVIDADE_MS).toISOString(), new Date(agora + ABSOLUTA_MS).toISOString(), userAgent.slice(0, 200));
  return id;
}

export function getSessionUser(sessionId) {
  if (!sessionId) return null;
  const row = db.prepare(
    `SELECT s.*, u.id AS uid, u.email, u.nome, u.role, u.ativo, u.trocar_senha
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
  ).get(sessionId);
  if (!row || !row.ativo) return null;
  const agora = Date.now();
  if (new Date(row.expira_em).getTime() < agora) return null;
  if (new Date(row.expira_absoluto).getTime() < agora) return null;
  // renovação por inatividade
  db.prepare(`UPDATE sessions SET ultimo_uso = datetime('now'), expira_em = ? WHERE id = ?`)
    .run(new Date(agora + INATIVIDADE_MS).toISOString(), sessionId);
  return { id: row.uid, email: row.email, nome: row.nome, role: row.role, trocarSenha: !!row.trocar_senha };
}

export function destroySession(sessionId) {
  if (sessionId) db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// middleware: exige sessão; opcionalmente exige perfil
export function requireAuth(role = null) {
  return async (req, reply) => {
    const sid = req.cookies?.session;
    const user = getSessionUser(sid);
    if (!user) {
      return reply.code(401).send({ erro: 'Não autenticado' });
    }
    if (role && user.role !== role) {
      return reply.code(403).send({ erro: 'Sem permissão' });
    }
    req.user = user;
  };
}
