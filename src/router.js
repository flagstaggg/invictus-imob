import { highlightNav } from './components/header.js';
import { smoothScrollTo, smoothScrollToTop } from './utils/smoothScroll.js';
import { properties } from './data/properties.js';

let path = '/';
let params = {};
let query = {};
let pendingSection = null;

const routes = [
  { pattern: '/', title: 'Invictus Mobi — Imobiliária de luxo em Criciúma SC', load: () => import('./pages/home.js') },
  { pattern: '/imoveis', title: 'Imóveis de alto padrão — Invictus Mobi', load: () => import('./pages/properties.js') },
  { pattern: '/imovel/:id', title: 'Imóvel — Invictus Mobi', load: () => import('./pages/propertyDetail.js') },
  { pattern: '/contato', title: 'Contato — Invictus Mobi', load: () => import('./pages/contact.js') },
  { pattern: '/favoritos', title: 'Favoritos — Invictus Mobi', noindex: true, load: () => import('./pages/favorites.js') },
  { pattern: '/admin', title: 'Painel — Invictus Mobi', noindex: true, load: () => import('./pages/admin/index.js') },
];

export function currentPath() { return path; }
export function currentQuery() { return query; }

export function navigateToSection(id) {
  if (path === '/') {
    smoothScrollTo(`#${id}`);
    return;
  }
  pendingSection = id;
  location.hash = '#/';
}

function parseHash() {
  let raw = location.hash.replace(/^#/, '') || '/';
  if (!raw.startsWith('/')) raw = `/${raw}`;
  const [pathname, search] = raw.split('?');
  query = Object.fromEntries(new URLSearchParams(search || ''));
  return pathname;
}

function match(pathname) {
  for (const route of routes) {
    const a = route.pattern.split('/').filter(Boolean);
    const b = pathname.split('/').filter(Boolean);
    if (a.length !== b.length) continue;
    params = {};
    let ok = true;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
      else if (a[i] !== b[i]) { ok = false; break; }
    }
    if (ok) return route;
  }
  return null;
}

export async function renderRoute() {
  const pathname = parseHash();
  const route = match(pathname);
  path = pathname;
  const main = document.getElementById('conteudo');

  if (!route) {
    document.title = 'Página não encontrada — Invictus Mobi';
    const m = await import('./pages/notFound.js');
    main.innerHTML = m.renderNotFound();
  } else {
    const mod = await route.load();
    document.title = route.title;
    main.innerHTML = '<section class="section page-head"><div class="container"><p class="eyebrow">Carregando…</p></div></section>';
    try {
      main.innerHTML = await Promise.resolve(mod.render(params, query));
      if (mod.init) await Promise.resolve(mod.init(params, query));
    } catch {
      main.innerHTML = '<section class="section page-head"><div class="container"><h1>Não foi possível carregar</h1><p style="color:var(--text-muted)">Verifique sua conexão e tente novamente.</p><p><a class="btn btn--gold" href="#/">Voltar ao início</a></p></div></section>';
    }
    const robots = document.querySelector('meta[name="robots"]');
    if (route.noindex) {
      if (robots) robots.content = 'noindex';
      else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex';
        document.head.appendChild(meta);
      }
    } else if (robots) robots.remove();
    if (params.id) {
      const p = properties.find((x) => x.id === params.id || x.slug === params.id);
      if (p) document.title = `${p.titulo} — Invictus Mobi`;
    }
  }

  smoothScrollToTop();
  highlightNav();

  const { initReveal, initCounters, initParallax } = await import('./utils/observers.js');
  initReveal();
  initCounters();
  initParallax();

  if (pendingSection) {
    const id = pendingSection;
    pendingSection = null;
    requestAnimationFrame(() => smoothScrollTo(`#${id}`));
  }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
