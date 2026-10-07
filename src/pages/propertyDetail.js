import { properties } from '../data/properties.js';
import { formatPrice, formatArea, TYPE_LABELS } from '../utils/format.js';
import { propertyCard } from '../components/propertyCard.js';
import { openLightbox } from '../components/lightbox.js';
import { buildWhatsAppUrl, propertyMessage } from '../utils/whatsapp.js';
import { site } from '../data/site.js';
import { favoriteButtonHTML, initFavoriteButton } from '../components/favoriteButton.js';

export function render(params) {
  const p = properties.find((x) => x.id === params.id || x.slug === params.id);
  if (!p) {
    return `<section class="section page-head container"><h1>Imóvel não encontrado</h1><p><a class="btn btn--gold" href="#/imoveis">Voltar aos imóveis</a></p></section>`;
  }
  const similares = properties.filter((x) => x.id !== p.id && (x.tipo === p.tipo || x.bairro === p.bairro)).slice(0, 3);
  return `
    <section class="section page-head">
      <div class="container">
        <p class="eyebrow">${TYPE_LABELS[p.tipo]} · ${p.bairro}</p>
        <div class="detail__title-row">
          <h1>${p.titulo}</h1>
          ${favoriteButtonHTML(p.id)}
        </div>
        <p class="detail__code">Código ${p.codigo} · ${p.bairro}, ${p.cidade} — SC</p>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container detail__grid">
        <div class="detail__main">
          <div class="gallery">
            <button class="gallery__main" data-lightbox="0">
              <img src="${p.imagens[0]}" alt="${p.titulo} — foto principal" width="1600" height="1067" fetchpriority="high" />
            </button>
            <div class="gallery__thumbs">
              ${p.imagens.map((src, i) => `
                <button data-lightbox="${i}" aria-label="Ampliar foto ${i + 1}">
                  <img src="${src.replace('w=1600', 'w=400')}" alt="${p.titulo} — miniatura ${i + 1}" width="400" height="267" loading="lazy" />
                </button>`).join('')}
            </div>
          </div>

          <h2>Sobre este imóvel</h2>
          <p>${p.descricao}</p>

          <h2>Características</h2>
          <ul class="specs">
            <li><strong>${formatArea(p.area)}</strong><span>Área</span></li>
            ${p.quartos ? `<li><strong>${p.quartos}</strong><span>Quartos</span></li>` : ''}
            ${p.suites ? `<li><strong>${p.suites}</strong><span>Suítes</span></li>` : ''}
            <li><strong>${p.banheiros}</strong><span>Banheiros</span></li>
            <li><strong>${p.vagas}</strong><span>Vagas</span></li>
          </ul>

          <h2>Diferenciais</h2>
          <ul class="diferenciais">
            ${p.diferenciais.map((d) => `<li>${d}</li>`).join('')}
          </ul>

          <h2>Localização aproximada</h2>
          <div class="map-placeholder" role="img" aria-label="Mapa aproximado da região de ${p.bairro}">
            <!-- TODO: integrar mapa real (ex.: embed do Google Maps com marcador aproximado) -->
            <p>Região de ${p.bairro} — ${p.cidade}/SC. Endereço exato informado após agendamento.</p>
          </div>
        </div>

        <aside class="detail-card" aria-label="Contato sobre este imóvel">
          <p class="detail-card__price">${formatPrice(p.preco, p.finalidade)}</p>
          <p class="detail-card__code">${p.codigo}</p>
          <a class="btn btn--gold" href="https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(propertyMessage(p))}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn--outline" href="#/contato">Agendar visita</a>
          <p class="detail-card__note">Atendimento discreto e personalizado.</p>
        </aside>
      </div>
    </section>
    <section class="section">
      <div class="container section__head">
        <p class="eyebrow">Continue explorando</p>
        <h2>Imóveis semelhantes</h2>
      </div>
      <div class="container grid-cards">
        ${similares.map(propertyCard).join('') || '<p>Nenhum imóvel semelhante no momento.</p>'}
      </div>
    </section>`;
}

export function init(params) {
  const p = properties.find((x) => x.id === params.id || x.slug === params.id);
  if (!p) return;
  document.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(p.imagens, Number(btn.dataset.lightbox), p.titulo));
  });
  initFavoriteButton(p.id);
}
