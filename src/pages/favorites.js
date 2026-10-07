import { properties } from '../data/properties.js';
import { getFavorites, subscribe } from '../utils/favorites.js';
import { propertyCard } from '../components/propertyCard.js';
import { buildWhatsAppUrl, favoritesMessage } from '../utils/whatsapp.js';

let unsubscribe = null;

function favoriteProperties() {
  const ids = getFavorites();
  return ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean);
}

export function render() {
  const list = favoriteProperties();
  return `
    <section class="section page-head">
      <div class="container">
        <p class="eyebrow">Sua seleção</p>
        <h1>Favoritos</h1>
        <p class="favorites__note">Seus favoritos ficam salvos apenas neste navegador e dispositivo.</p>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container" id="favorites-results">
        ${renderResults(list)}
      </div>
    </section>`;
}

function renderResults(list) {
  if (!list.length) {
    return `
      <div class="empty-state">
        <h2>Você ainda não salvou nenhum imóvel</h2>
        <p>Toque na estrela na página de um imóvel para guardá-lo aqui.</p>
        <a class="btn btn--gold" href="#/imoveis">Ver imóveis</a>
      </div>`;
  }
  return `
    <p class="properties__count" aria-live="polite">${list.length} ${list.length === 1 ? 'imóvel salvo' : 'imóveis salvos'}</p>
    <div class="grid-cards">${list.map(propertyCard).join('')}</div>
    <p class="favorites__share">
      <a class="btn btn--outline" href="${buildWhatsAppUrl(favoritesMessage(list))}" target="_blank" rel="noopener">Enviar meus favoritos ao consultor</a>
    </p>`;
}

export function init() {
  unsubscribe?.();
  unsubscribe = subscribe(() => {
    const container = document.getElementById('favorites-results');
    if (container) container.innerHTML = renderResults(favoriteProperties());
    // re-observa os cards re-renderizados para o efeito reveal
    import('../utils/observers.js').then((m) => m.initReveal());
  });
}
