import { z } from 'zod';

// ---------------------------------------------------------------------------
// Sanitização centralizada de entradas (roda ANTES da validação do zod).
// Regras: remove tags HTML, caracteres de controle, normaliza espaços extras
// e limita o tamanho — assim, o dado que chega ao banco já vem limpo.
// ---------------------------------------------------------------------------
export function sanitizeText(v, { allowNewlines = false } = {}) {
  if (typeof v !== 'string') return v;
  const semControlos = allowNewlines ? /[^\S\n]|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  let out = v
    .replace(/<[^>]*>/g, '')        // remove tags HTML
    .replace(semControlos, ' ');   // remove caracteres de controle (preserva \n quando permitido)
  out = out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

export const sanitizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

// texto de uma linha, já sanitizado, com tamanho máximo
const linha = (max) => z.string().transform((v) => sanitizeText(v)).pipe(z.string().max(max));
// texto longo (aceita quebras de linha, como a descrição)
const texto = (max) => z.string().transform((v) => sanitizeText(v, { allowNewlines: true })).pipe(z.string().max(max));

export const loginSchema = z.object({
  email: z.string().transform(sanitizeEmail).pipe(z.string().email().max(160)),
  senha: z.string().min(1).max(200),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1).max(200),
  novaSenha: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres').max(200),
});

export const usuarioSchema = z.object({
  email: z.string().transform(sanitizeEmail).pipe(z.string().email().max(160)),
  nome: z.string().transform((v) => sanitizeText(v)).pipe(z.string().min(2).max(120)),
  senha: z.string().min(12, 'A senha deve ter pelo menos 12 caracteres').max(200),
  role: z.enum(['admin', 'corretor']),
});

export const enderecoSchema = z.object({
  rua: linha(160).optional().nullable(),
  numero: linha(20).optional().nullable(),
  bairro: linha(80).optional().nullable(),
  cidade: linha(80).optional().nullable(),
  estado: linha(2).optional().nullable(),
  cep: linha(10).optional().nullable(),
}).partial().nullable().optional();

export const imovelSchema = z.object({
  titulo: linha(160).pipe(z.string().min(3, 'Título muito curto')),
  codigo: linha(30).pipe(z.string().min(2, 'Código obrigatório')),
  finalidade: z.enum(['venda', 'locacao']),
  tipo: linha(40).pipe(z.string().min(2)),
  bairro: linha(80).pipe(z.string().min(2)),
  cidade: linha(80).pipe(z.string().min(2)),
  preco: z.coerce.number().int().min(0).max(1e12),
  condominio: z.coerce.number().int().min(0).max(1e9).nullable().optional(),
  iptu: z.coerce.number().int().min(0).max(1e9).nullable().optional(),
  area: z.coerce.number().min(0).max(1e9).nullable().optional(),
  areaConstruida: z.coerce.number().min(0).max(1e9).nullable().optional(),
  quartos: z.coerce.number().int().min(0).max(100).nullable().optional(),
  suites: z.coerce.number().int().min(0).max(100).nullable().optional(),
  banheiros: z.coerce.number().int().min(0).max(100).nullable().optional(),
  vagas: z.coerce.number().int().min(0).max(100).nullable().optional(),
  descricao: texto(5000).nullable().optional(),
  diferenciais: z.array(linha(120)).max(30).default([]),
  destaque: z.boolean().default(false),
  status: z.enum(['rascunho', 'ativo', 'vendido', 'alugado']).default('rascunho'),
  ocultarEndereco: z.boolean().default(true),
  endereco: enderecoSchema,
  corretorId: z.coerce.number().int().nullable().optional(),
  imagens: z.array(z.string().max(500)).max(40).optional(),
  slug: z.string().transform((v) => sanitizeText(v)).pipe(
    z.string().min(2).max(160).regex(/^[a-z0-9-]+$/, 'slug inválido'),
  ).optional(),
});