CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','corretor')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  trocar_senha BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_uso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  expira_absoluto TIMESTAMPTZ NOT NULL,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS imoveis (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  finalidade TEXT NOT NULL CHECK (finalidade IN ('venda','locacao')),
  tipo TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  preco BIGINT NOT NULL,
  condominio BIGINT,
  iptu BIGINT,
  area NUMERIC(12,2),
  area_construida NUMERIC(12,2),
  quartos INTEGER,
  suites INTEGER,
  banheiros INTEGER,
  vagas INTEGER,
  descricao TEXT,
  diferenciais JSONB NOT NULL DEFAULT '[]'::jsonb,
  imagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  codigo TEXT NOT NULL UNIQUE,
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','ativo','vendido','alugado')),
  endereco JSONB,
  ocultar_endereco BOOLEAN NOT NULL DEFAULT TRUE,
  corretor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  deletado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  imovel_id TEXT,
  detalhes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_destaque ON imoveis(destaque);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);