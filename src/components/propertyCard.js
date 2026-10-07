import { formatPrice, formatArea, TYPE_LABELS, imgSrc, imgAlt, escapeHtml } from '../utils/format.js';
import { icons } from '../utils/icons.js';

export function propertyCard(p) {
  return `
    <article class="card reveal">
      <a class="card__link" href="#/imovel/${p.slug}">
        <div class="card__media">
          <img src="${imgSrc(p.imagens[0])}" alt="${imgAlt(p.imagens[0], `${p.titulo} — ${TYPE_LABELS[p.tipo]} em ${p.bairro}`)}" width="1600" height="1067" loading="lazy" />
          ${p.destaque ? '<span class="badge">Exclusivo</span>' : ''}
        </div>
        <div class="card__body">
          <p class="card__type">${TYPE_LABELS[p.tipo]} · ${p.finalidade === 'venda' ? 'Comprar' : 'Alugar'}</p>
          <h3 class="card__title">${escapeHtml(p.titulo)}</h3>
          <p class="card__bairro">${escapeHtml(p.bairro)} · ${escapeHtml(p.cidade)}, SC</p>
          <p class="card__price">${formatPrice(p.preco, p.finalidade)}</p>
          <ul class="card__meta">
            ${p.quartos ? `<li>${icons.quartos}<span>${p.quartos} quartos</span></li>` : ''}
            ${p.suites ? `<li>${icons.suite}<span>${p.suites} suítes</span></li>` : ''}
            <li>${icons.vagas}<span>${p.vagas} vagas</span></li>
            <li>${icons.area}<span>${formatArea(p.area)}</span></li>
          </ul>
        </div>
      </a>
    </article>`;
}
