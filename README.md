# Invictus Mobi

Site institucional e vitrine de imóveis da **Invictus Mobi**, imobiliária de luxo (fictícia) em Criciúma, Santa Catarina.

## Como rodar

```bash
npm install
npm run dev        # ambiente de desenvolvimento
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
```

## Tecnologias

Vite 8, JavaScript puro (ES modules), roteamento por hash feito à mão, CSS moderno (variáveis, Grid, Flexbox, `clamp()`), sem frameworks nem bibliotecas de componentes. Única dependência externa de runtime: fontes do Google Fonts.

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
