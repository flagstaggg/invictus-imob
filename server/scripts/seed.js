// Importa os imóveis fixos de src/data/properties.js para o banco PostgreSQL.
// Preserva títulos, valores, fotos (URLs) e demais campos. Seguro para rodar de novo (ON CONFLICT).
import 'dotenv/config';
import { db, pool, migrate } from '../db/index.js';
import { imoveis } from '../db/schema.js';
import { count } from 'drizzle-orm';
import { properties } from '../../src/data/properties.js';

await migrate();

let qtd = 0;
for (const p of properties) {
  const inserted = await db.insert(imoveis).values({
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    finalidade: p.finalidade,
    tipo: p.tipo,
    bairro: p.bairro,
    cidade: p.cidade,
    preco: p.preco,
    area: p.area,
    quartos: p.quartos,
    suites: p.suites,
    banheiros: p.banheiros,
    vagas: p.vagas,
    descricao: p.descricao,
    diferenciais: p.diferenciais,
    imagens: p.imagens,
    destaque: !!p.destaque,
    codigo: p.codigo,
    dataPublicacao: p.dataPublicacao,
    status: 'ativo',
    ocultarEndereco: true,
  }).onConflictDoNothing();
  if (inserted.rowCount) qtd += 1;
}
const [{ total }] = await db.select({ total: count() }).from(imoveis);
console.log(`Seed concluído: ${qtd} imóveis importados (total no banco: ${total}).`);
await pool.end();