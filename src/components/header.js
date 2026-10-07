import { brandMark } from './brand.js';
import { site } from '../data/site.js';
import { navigateToSection, currentPath } from '../router.js';
import { icons } from '../utils/icons.js';
import { getFavorites, subscribe } from '../utils/favorites.js';

const NAV = [
  { label: 'Início', route: '/' },
  { label: 'Imóveis', route: '/imoveis' },
  { label: 'Sobre', section: 'sobre' },
  { label: 'Serviços', section: 'servicos' },
  { label: 'Bairros', section: 'bairros' },
  { label: 'Contato', route: '/contato' },
  { label: 'Favoritos', route: '/favoritos', favorites: true },
];

export function renderHeader() {
  const header = document.getElementById('site-header');
  header.innerHTML = `
    <div class="header__inner container">
      <a class="header__brand" href="#/" aria-label="Invictus Mobi — Início">${brandMark()}</a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" id="main-nav" aria-label="Navegação principal">
        <ul>
          ${NAV.map((item) => `
            <li><a href="${item.section ? '#/' : `#${item.route === '/' ? '/' : item.route}`}" data-section="${item.section || ''}" data-route="${item.route || ''}">${item.favorites ? icons.star : ''}${item.label}${item.favorites ? ' <span class="nav__badge" id="nav-fav-count" hidden></span>' : ''}</a></li>`).join('')}
        </ul>
        <a class="btn btn--gold nav__cta" href="https://wa.me/${site.whatsappNumber}" target="_blank" rel="noopener">Fale com um consultor</a>
      </nav>
    </div>`;

  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  nav.querySelectorAll('a[data-section]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const section = a.dataset.section;
      const route = a.dataset.route;
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      if (section) {
        e.preventDefault();
        navigateToSection(section);
      } else if (route) {
        // rota normal via hash
      }
    });
  });

  window.addEventListener('scroll', () => {
    header.classList.toggle('header--solid', window.scrollY > 24);
  }, { passive: true });

  highlightNav();

  const badge = document.getElementById('nav-fav-count');
  const syncBadge = (favs = getFavorites()) => {
    badge.hidden = favs.length === 0;
    badge.textContent = favs.length;
  };
  syncBadge();
  subscribe(syncBadge);
}

export function highlightNav() {
  const path = currentPath();
  document.querySelectorAll('#main-nav a[data-route]').forEach((a) => {
    if (a.dataset.route && a.dataset.route === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
