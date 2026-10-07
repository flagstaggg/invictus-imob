import { icons } from '../utils/icons.js';
import { isFavorite, toggleFavorite, subscribe } from '../utils/favorites.js';

// Estrela de favorito — usada apenas na página de detalhe do imóvel.
export function favoriteButtonHTML(propertyId) {
  const active = isFavorite(propertyId);
  return `
    <button type="button" class="fav-btn" data-fav-id="${propertyId}"
      aria-pressed="${active}"
      aria-label="${active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
      ${icons.star}
    </button>`;
}

let unsubscribe = null;

export function initFavoriteButton(propertyId) {
  unsubscribe?.();
  unsubscribe = null;
  const btn = document.querySelector(`.fav-btn[data-fav-id="${propertyId}"]`);
  if (!btn) return;

  const sync = () => {
    const active = isFavorite(propertyId);
    btn.setAttribute('aria-pressed', String(active));
    btn.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  };

  btn.addEventListener('click', () => {
    const nowActive = toggleFavorite(propertyId);
    sync();
    btn.classList.remove('fav-btn--pop');
    // reinicia a micro-animação a cada clique
    void btn.offsetWidth;
    btn.classList.add('fav-btn--pop');

    const live = document.getElementById('fav-live');
    if (live) live.textContent = nowActive ? 'Imóvel adicionado aos favoritos' : 'Imóvel removido dos favoritos';
  });

  unsubscribe = subscribe(sync);
}
