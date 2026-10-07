import { db } from '../db/index.js';

export function audit(userId, acao, imovelId = null, detalhes = null) {
  try {
    db.prepare('INSERT INTO audit_log (user_id, acao, imovel_id, detalhes) VALUES (?, ?, ?, ?)')
      .run(userId, acao, imovelId, detalhes ? JSON.stringify(detalhes).slice(0, 500) : null);
  } catch { /* auditoria nunca deve quebrar a operação */ }
}
