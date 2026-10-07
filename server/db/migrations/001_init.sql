CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','corretor')),
  ativo INTEGER NOT NULL DEFAULT 1,
  trocar_senha INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_uso TEXT NOT NULL DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL,
  expira_absoluto TEXT NOT NULL,
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
  preco INTEGER NOT NULL,
  condominio INTEGER,
  iptu INTEGER,
  area REAL,
  area_construida REAL,
  quartos INTEGER,
  suites INTEGER,
  banheiros INTEGER,
  vagas INTEGER,
  descricao TEXT,
  diferenciais TEXT NOT NULL DEFAULT '[]',
  imagens TEXT NOT NULL DEFAULT '[]',
  destaque INTEGER NOT NULL DEFAULT 0,
  codigo TEXT NOT NULL UNIQUE,
  data_publicacao TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','ativo','vendido','alugado')),
  endereco TEXT,
  ocultar_endereco INTEGER NOT NULL DEFAULT 1,
  corretor_id INTEGER REFERENCES users(id),
  deletado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  acao TEXT NOT NULL,
  imovel_id TEXT,
  detalhes TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
