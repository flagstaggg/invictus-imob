import { getFavorites, subscribe } from '../utils/favorites.js';
import { fetchProperties } from '../utils/api.js';
import { propertyCard } from '../components/propertyCard.js';
import { buildWhatsAppUrl, favoritesMessage } from '../utils/whatsapp.js';

let unsubscribe = null;

async function favoriteProperties() {
  const ids = getFavorites();
  const list = await fetchProperties();
  return ids.map((id) => list.find((p) => p.id === id)).filter(Boolean);
}

export async function render() {
  const list = await favoriteProperties();
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
  unsubscribe = subscribe(async () => {
    const container = document.getElementById('favorites-results');
    if (container) container.innerHTML = renderResults(await favoriteProperties());
    import('../utils/observers.js').then((m) => m.initReveal());
  });
}
