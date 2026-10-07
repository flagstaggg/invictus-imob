import 'dotenv/config';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrate } from './db/index.js';
import { UPLOADS_DIR } from './routes/adminImoveis.js';
import publicRoutes from './routes/public.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminImoveisRoutes from './routes/adminImoveis.js';
import adminUsuariosRoutes from './routes/adminUsuarios.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3333);

const app = Fastify({ logger: { level: 'info', redact: ['req.headers.authorization', 'req.headers.cookie'] } });

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
});

// CORS restrito: mesmo domínio em produção; localhost no dev
const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
await app.register(cors, { origin: allowed, credentials: true });

await app.register(cookie, { secret: process.env.COOKIE_SECRET || 'dev-secret-trocar-em-producao-0123456789' });
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024, files: 20 } });

// Em produção, a API também serve o build do front (SPA com hash routing)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  await app.register(staticPlugin, { root: distDir, prefix: '/', decorateReply: true });
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
      return reply.code(404).send({ erro: 'Não encontrado' });
    }
    return reply.sendFile('index.html');
  });
}

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
await app.register(staticPlugin, {
  root: UPLOADS_DIR,
  prefix: '/uploads/',
  decorateReply: false,
});

// CSRF leve: toda mutação deve vir do mesmo origin do host
app.addHook('onRequest', async (req, reply) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.url.startsWith('/api/admin')) {
    const origin = req.headers.origin;
    if (origin && !allowed.some((o) => origin.startsWith(o))) {
      return reply.code(403).send({ erro: 'Origem não permitida' });
    }
  }
});

// noindex em tudo que é admin (rotas API)
app.addHook('onSend', async (req, reply) => {
  if (req.url.startsWith('/api/admin')) reply.header('X-Robots-Tag', 'noindex, nofollow');
});

migrate();

await app.register(publicRoutes);
await app.register(adminAuthRoutes);
await app.register(adminImoveisRoutes);
await app.register(adminUsuariosRoutes);

app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  if (err.statusCode === 429) return reply.code(429).send({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  reply.code(err.statusCode || 500).send({ erro: err.statusCode ? err.message : 'Erro interno' });
});

app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
