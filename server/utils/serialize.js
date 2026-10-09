import { db } from '../db/index.js';
import { imoveis } from '../db/schema.js';
import { and, desc, eq, isNull, or } from 'drizzle-orm';

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
    preco: Number(row.preco),
    condominio: row.condominio === null ? null : Number(row.condominio),
    iptu: row.iptu === null ? null : Number(row.iptu),
    area: row.area === null ? null : Number(row.area),
    areaConstruida: row.areaConstruida === null ? null : Number(row.areaConstruida),
    quartos: row.quartos,
    suites: row.suites,
    banheiros: row.banheiros,
    vagas: row.vagas,
    descricao: row.descricao,
    diferenciais: toArray(row.diferenciais),
    imagens: toArray(row.imagens),
    destaque: !!row.destaque,
    codigo: row.codigo,
    dataPublicacao: toISODate(row.dataPublicacao),
    status: row.status,
    // endereço exato só aparece no site se o corretor autorizar
    endereco: row.ocultarEndereco ? null : (row.endereco || null),
  };
}

export function toISODate(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

// colunas JSONB chegam como objeto/array; aceitamos também string (compatibilidade)
function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return []; } }
  return [];
}

export async function listPublicProperties() {
  const rows = await db
    .select()
    .from(imoveis)
    .where(and(eq(imoveis.status, 'ativo'), isNull(imoveis.deletadoEm)))
    .orderBy(desc(imoveis.destaque), desc(imoveis.dataPublicacao));
  return rows.map(toPublicProperty);
}

export async function getPublicProperty(slugOrId) {
  const rows = await db
    .select()
    .from(imoveis)
    .where(and(
      eq(imoveis.status, 'ativo'),
      isNull(imoveis.deletadoEm),
      or(eq(imoveis.slug, slugOrId), eq(imoveis.id, slugOrId)), // sempre como parâmetro vinculado
    ))
    .limit(1);
  return rows.length ? toPublicProperty(rows[0]) : null;
}