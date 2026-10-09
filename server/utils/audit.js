import { db } from '../db/index.js';
import { auditLog } from '../db/schema.js';

export async function audit(userId, acao, imovelId = null, detalhes = null) {
  try {
    await db.insert(auditLog).values({
      userId,
      acao,
      imovelId,
      detalhes: detalhes ? JSON.stringify(detalhes).slice(0, 500) : null,
    });
  } catch { /* auditoria nunca deve quebrar a operação */ }
}