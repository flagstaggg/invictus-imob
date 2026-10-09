import { listPublicProperties, getPublicProperty } from '../utils/serialize.js';

export default async function publicRoutes(app) {
  app.get('/api/public/imoveis', async () => ({ imoveis: await listPublicProperties() }));
  app.get('/api/public/imoveis/:id', async (req, reply) => {
    const p = await getPublicProperty(req.params.id);
    if (!p) return reply.code(404).send({ erro: 'Imóvel não encontrado' });
    return { imovel: p };
  });
}