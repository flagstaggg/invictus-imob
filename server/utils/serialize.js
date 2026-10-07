import { db } from '../db/index.js';

// Sanitiza uma linha do banco para o formato público esperado pelo front.
// Nunca expõe campos internos (corretor, notas, logs).
export function toPublicProperty(row) {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    finalidade: row.finalidade,
    tipo: row.tipo,
    bairro: row.bairro,
    cidade: row.cidade,
    preco: row.preco,
    condominio: row.condominio,
    iptu: row.iptu,
    area: row.area,
    areaConstruida: row.area_construida,
    quartos: row.quartos,
    suites: row.suites,
    banheiros: row.banheiros,
    vagas: row.vagas,
    descricao: row.descricao,
    diferenciais: JSON.parse(row.diferenciais || '[]'),
    imagens: JSON.parse(row.imagens || '[]'),
    destaque: !!row.destaque,
    codigo: row.codigo,
    dataPublicacao: row.data_publicacao,
    status: row.status,
    // endereço exato só aparece no site se o corretor autorizar
    endereco: row.ocultar_endereco ? null : safeParseEndereco(row.endereco),
  };
}

function safeParseEndereco(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

export function listPublicProperties() {
  const rows = db.prepare(
    `SELECT * FROM imoveis WHERE status = 'ativo' AND deletado_em IS NULL ORDER BY destaque DESC, data_publicacao DESC`,
  ).all();
  return rows.map(toPublicProperty);
}

export function getPublicProperty(slugOrId) {
  const row = db.prepare(
    `SELECT * FROM imoveis WHERE (slug = ? OR id = ?) AND status = 'ativo' AND deletado_em IS NULL`,
  ).get(slugOrId, slugOrId);
  return row ? toPublicProperty(row) : null;
}
