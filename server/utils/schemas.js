import { z } from 'zod';

// Todos os textos vindos do painel passam por trim + remoção de tags HTML
// antes de chegar ao banco (o front também escapa na renderização).
export const sanitizeText = (v) =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim() : v;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  senha: z.string().min(1).max(200),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres').max(200),
});

export const usuarioSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  nome: z.string().transform(sanitizeText).pipe(z.string().min(2).max(120)),
  senha: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres').max(200),
  role: z.enum(['admin', 'corretor']),
});

export const enderecoSchema = z.object({
  rua: z.string().transform(sanitizeText).pipe(z.string().max(160)).optional().nullable(),
  numero: z.string().transform(sanitizeText).pipe(z.string().max(20)).optional().nullable(),
  bairro: z.string().transform(sanitizeText).pipe(z.string().max(80)).optional().nullable(),
  cidade: z.string().transform(sanitizeText).pipe(z.string().max(80)).optional().nullable(),
  estado: z.string().transform(sanitizeText).pipe(z.string().max(2)).optional().nullable(),
  cep: z.string().transform(sanitizeText).pipe(z.string().max(10)).optional().nullable(),
}).partial().nullable().optional();

export const imovelSchema = z.object({
  titulo: z.string().transform(sanitizeText).pipe(z.string().min(3).max(160)),
  codigo: z.string().transform(sanitizeText).pipe(z.string().min(2).max(30)),
  finalidade: z.enum(['venda', 'locacao']),
  tipo: z.string().transform(sanitizeText).pipe(z.string().min(2).max(40)),
  bairro: z.string().transform(sanitizeText).pipe(z.string().min(2).max(80)),
  cidade: z.string().transform(sanitizeText).pipe(z.string().min(2).max(80)),
  preco: z.coerce.number().int().min(0).max(1e12),
  condominio: z.coerce.number().int().min(0).max(1e9).nullable().optional(),
  iptu: z.coerce.number().int().min(0).max(1e9).nullable().optional(),
  area: z.coerce.number().min(0).max(1e9).nullable().optional(),
  areaConstruida: z.coerce.number().min(0).max(1e9).nullable().optional(),
  quartos: z.coerce.number().int().min(0).max(100).nullable().optional(),
  suites: z.coerce.number().int().min(0).max(100).nullable().optional(),
  banheiros: z.coerce.number().int().min(0).max(100).nullable().optional(),
  vagas: z.coerce.number().int().min(0).max(100).nullable().optional(),
  descricao: z.string().transform(sanitizeText).pipe(z.string().max(5000)).nullable().optional(),
  diferenciais: z.array(z.string().transform(sanitizeText).pipe(z.string().min(1).max(120))).max(30).default([]),
  destaque: z.boolean().default(false),
  status: z.enum(['rascunho', 'ativo', 'vendido', 'alugado']).default('rascunho'),
  ocultarEndereco: z.boolean().default(true),
  endereco: enderecoSchema,
  corretorId: z.coerce.number().int().nullable().optional(),
  imagens: z.array(z.string().max(500)).max(40).optional(),
  slug: z.string().transform(sanitizeText).pipe(z.string().min(2).max(160).regex(/^[a-z0-9-]+$/, 'slug inválido')).optional(),
});
