// Importa os imóveis fixos de src/data/properties.js para o banco.
// Preserva títulos, valores, fotos (URLs) e demais campos.
import 'dotenv/config';
import { db, migrate } from '../db/index.js';
import { properties } from '../../src/data/properties.js';

migrate();

const insert = db.prepare(`INSERT OR IGNORE INTO imoveis
  (id, slug, titulo, finalidade, tipo, bairro, cidade, preco, area, quartos, suites, banheiros, vagas, descricao, diferenciais, imagens, destaque, codigo, data_publicacao, status, ocultar_endereco)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo', 1)`);

let qtd = 0;
for (const p of properties) {
  const r = insert.run(
    p.id, p.slug, p.titulo, p.finalidade, p.tipo, p.bairro, p.cidade, p.preco,
    p.area, p.quartos, p.suites, p.banheiros, p.vagas, p.descricao,
    JSON.stringify(p.diferenciais), JSON.stringify(p.imagens), p.destaque ? 1 : 0,
    p.codigo, p.dataPublicacao,
  );
  if (r.changes) qtd += 1;
}
console.log(`Seed concluído: ${qtd} imóveis importados (${properties.length} no total).`);
