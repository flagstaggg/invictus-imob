# Invictus Mobi

Site institucional e vitrine de imóveis da **Invictus Mobi**, imobiliária de luxo (fictícia) em Criciúma, Santa Catarina.

## Como rodar

**Site público (Vite):**

```bash
npm install
npm run dev        # ambiente de desenvolvimento (http://localhost:5173)
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
```

**API + banco (PostgreSQL):**

```bash
# 1. Banco (ajuste os comandos abaixo se o Postgres estiver em outro local)
createuser invictus_app --pwprompt        # senha do usuário da aplicação
createdb invictus --owner invictus_app

# 2. Configure a conexão
cp .env.example .env                      # e edite DATABASE_URL

# 3. Migrações, dados iniciais e primeiro admin
npm run migrate
npm run seed                              # importa os imóveis de src/data/properties.js
npm run create-admin -- --email=voce@empresa.com --nome="Seu Nome" --senha="senha-forte-12+"

# 4. Suba a API
npm run dev:api                           # http://localhost:3333
```

O painel fica em `http://localhost:5173/#/admin` (não é linkado no site público).

### Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run migrate` | Aplica as migrações em `server/db/migrations` |
| `npm run seed` | Importa imóveis do arquivo de dados para o banco (idempotente) |
| `npm run create-admin -- ...` | Cria um administrador pela linha de comando |
| `npm run db:export-sqlite` | **Legado:** exporta o banco SQLite para JSON |
| `npm run db:import-sqlite -- server/data/sqlite-export.json` | **Legado:** importa esse JSON no PostgreSQL |

## Tecnologias

- **Front:** Vite 8, JavaScript puro (ES modules), roteamento por hash feito à mão, CSS moderno (variáveis, Grid, Flexbox, `clamp()`), sem frameworks. Fontes do Google Fonts.
- **Back-end:** Node.js + Fastify, validação com zod, `bcryptjs` (custo 12), `sharp` para imagens, `helmet`, rate limiting.
- **Banco:** **PostgreSQL** com o ORM **Drizzle ORM** (`drizzle-orm` + `pg`). Schema declarativo em `server/db/schema.js`; migrações versionadas em SQL (`server/db/migrations`), aplicadas por `npm run migrate` dentro de transação.
- **Imagens:** upload em disco (`server/uploads`), convertidas para WebP em 3 tamanhos e sem metadados EXIF.

## Sanitização de entradas (dupla camada)

1. **Na entrada (servidor):** todo dado passa por `sanitizeText()`/`sanitizeEmail()` em `server/utils/schemas.js` **antes** da validação do zod — remove tags HTML, caracteres de controle, normaliza espaços e aplica limites de tamanho por campo.
2. **Na saída (front):** o front escapa todo texto vindo do banco (`escapeHtml` em `src/utils/format.js`).
3. **No banco:** todas as queries são geradas pelo Drizzle com **parâmetros vinculados** — nunca concatenação de SQL (imune a SQL injection).

Exemplo real: título `  <script>alert(1)</script>Casa Teste ORM  ` é gravado como `alert(1)Casa Teste ORM`; descrição mantém quebras de linha, mas descarta o caractere de controle.

## Como editar os dados

- **Dados da empresa** (telefone, WhatsApp, e-mail, endereço, CRECI, CNPJ, redes sociais, domínio): `src/data/site.js`. Todos os valores são placeholders com `TODO`.
- **Imóveis**: `src/data/properties.js` — cada imóvel tem `id`, `slug`, `titulo`, `finalidade` (`venda`/`locacao`), `tipo`, `bairro`, `cidade`, `preco`, `area`, `quartos`, `suites`, `banheiros`, `vagas`, `descricao`, `diferenciais`, `imagens`, `destaque`, `codigo`, `dataPublicacao`.
- **Imagens**: URLs centralizadas em `properties.js` (via helper `img()`). Troque pelos arquivos definitivos (idealmente em `public/images/`) em um único lugar. Cartões e galerias usam `loading="lazy"`, `width`/`height` e fundo de placeholder enquanto carregam.
- **WhatsApp**: altere `site.whatsappNumber` em `src/data/site.js`. A montagem das mensagens fica isolada em `src/utils/whatsapp.js`.
- **Formulário de contato**: valida no cliente e abre o WhatsApp com a mensagem pronta. Para trocar por uma API real, edite apenas `sendContactRequest()` em `src/components/contactForm.js`.

## Favoritos

O visitante pode marcar imóveis com a **estrela** (disponível apenas na página de detalhe do imóvel) e rever a seleção em `#/favoritos`, acessível pelo link "Favoritos" no header (com contador dourado).

- **Como funciona:** os IDs dos imóveis salvos ficam em `localStorage`, na chave `invictus-mobi:favorites` (ex.: `["p01","p12"]`). Nenhum dado sai do navegador.
- **Robustez:** leituras/escritas têm `try/catch` — se o armazenamento estiver bloqueado ou cheio, os favoritos valem apenas na sessão (memória); JSON corrompido é tratado como lista vazia e regravado; IDs inexistentes no catálogo e duplicatas são removidos automaticamente; mudanças feitas em outra aba são refletidas em tempo real (evento `storage`).
- **Privacidade:** os favoritos ficam apenas no navegador/dispositivo do visitante.
- **Compartilhar:** na página de favoritos, o botão "Enviar meus favoritos ao consultor" abre o WhatsApp com a lista (código e título) pré-preenchida.
- **Para limpar os dados:** no console do navegador, rode `localStorage.removeItem('invictus-mobi:favorites')`.

## Área administrativa (/admin)

O projeto inclui uma API (Node.js + Fastify), banco **PostgreSQL** e um painel em `/admin` (carregado sob demanda). O banco já é criado pelas migrações — veja "API + banco (PostgreSQL)" no topo. Resumo rápido:

```bash
npm install
cp .env.example .env    # ajuste DATABASE_URL
npm run migrate
npm run seed
npm run create-admin -- --email=voce@empresa.com --nome="Seu Nome" --senha="senha-forte-12+"
npm run dev:api         # API em http://localhost:3333
npm run dev             # front em http://localhost:5173 (proxy /api e /uploads → 3333)
```

- O painel existe em `#/admin`, mas **não é linkado** no site público.
- Sem login, qualquer rota `/api/admin/*` retorna 401.
- Segurança: senhas com bcrypt (custo 12), sessão em cookie httpOnly/Secure/SameSite=Strict com expiração por inatividade (30 min) e absoluta (12 h), rate limit no login, validação com zod + sanitização, helmet, CORS restrito, upload validado por conteúdo (WebP via sharp), auditoria em `audit_log`.
- O site público lê os imóveis de `GET /api/public/imoveis` (somente status `ativo`), com estados de carregamento/erro no estilo do site.
- O usuário do banco (`invictus_app`) é criado sem privilégios administrativos; o acesso do Postgres fica restrito à rede interna.

## Deploy

Veja `DEPLOY.md` (Debian + Docker + Nginx + PostgreSQL + Let's Encrypt) e o `Dockerfile`/`docker-compose.yml` prontos para uso (o compose já sobe o Postgres em container sem portas publicadas). Backups com `server/scripts/backup.sh` (`pg_dump` + fotos, retenção de 14 dias).

## TODOs pendentes

- [ ] Substituir todos os placeholders de `src/data/site.js` pelos dados reais da empresa (CRECI, CNPJ, endereço, telefone, e-mail, redes, domínio).
- [ ] Atualizar JSON-LD em `index.html` com os dados reais.
- [ ] Substituir as fotos dos imóveis por fotos reais (`src/data/properties.js`).
- [ ] Substituir depoimentos placeholder por depoimentos reais (`src/pages/home.js`).
- [ ] Substituir contadores "fictícios" da seção Sobre por números reais (`src/pages/home.js`).
- [ ] Integrar mapa real na página do imóvel (`src/pages/propertyDetail.js`).
- [ ] Integrar envio do formulário a uma API/CRM real (`src/components/contactForm.js`).
- [ ] Confirmar `sitemap.xml` e `robots.txt` com o domínio definitivo.

## Estrutura

```
index.html              # shell + meta tags, Open Graph, JSON-LD
public/                 # favicon.svg, robots.txt, sitemap.xml
src/
  main.js               # bootstrap
  router.js             # roteamento por hash
  styles/               # tokens.css, base.css, components.css, pages.css
  components/           # header, footer, brand, hero, propertyCard, carousel, lightbox, filters, contactForm
  pages/                # home, properties, propertyDetail, contact, notFound
  data/                 # site.js (empresa), properties.js (imóveis)
  utils/                # format.js, whatsapp.js, icons.js, observers.js
```

## Acessibilidade e SEO

- `lang="pt-BR"`, link "Pular para o conteúdo", foco visível em dourado, navegação completa por teclado (menu, carrosséis, lightbox com Esc e setas, formulários com erros acessíveis).
- `title` atualizado a cada rota, meta description, Open Graph, Twitter Card, favicon, `robots.txt`, `sitemap.xml` e JSON-LD `RealEstateAgent`.
- Animações respeitam `prefers-reduced-motion`.
