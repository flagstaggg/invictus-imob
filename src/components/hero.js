import { neighborhoods } from '../data/properties.js';
import { TYPE_LABELS, PRICE_RANGES } from '../utils/format.js';
import { site } from '../data/site.js';

export function renderHero() {
  return `
    <section class="hero" id="hero">
      <div class="hero__media" style="background-image:url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80')" role="img" aria-label="Casa de alto padrão em Criciúma"></div>
      <div class="hero__overlay"></div>
      <div class="hero__content container">
        <p class="eyebrow">Criciúma · Santa Catarina</p>
        <h1>Onde o extraordinário encontra o seu lar.</h1>
        <p class="hero__sub">Curadoria exclusiva de imóveis de alto padrão em Criciúma e região, com discrição e atendimento sob medida.</p>
        <div class="hero__ctas">
          <a class="btn btn--gold" href="#/imoveis">Ver imóveis</a>
          <a class="btn btn--ghost" href="https://wa.me/${site.whatsappNumber}" target="_blank" rel="noopener">Falar no WhatsApp</a>
        </div>
        <form class="quick-search" id="quick-search" aria-label="Busca rápida de imóveis">
          <div class="field">
            <label for="q-finalidade">Finalidade</label>
            <select id="q-finalidade" name="finalidade">
              <option value="venda">Comprar</option>
              <option value="locacao">Alugar</option>
            </select>
          </div>
          <div class="field">
            <label for="q-tipo">Tipo</label>
            <select id="q-tipo" name="tipo">
              <option value="">Todos</option>
              ${Object.entries(TYPE_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="q-bairro">Bairro</label>
            <select id="q-bairro" name="bairro">
              <option value="">Todos</option>
              ${neighborhoods.map((n) => `<option value="${n.nome}">${n.nome}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="q-preco">Faixa de preço</label>
            <select id="q-preco" name="preco">
              ${PRICE_RANGES.map((r) => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn--gold" type="submit">Buscar</button>
        </form>
      </div>
    </section>`;
}

export function initHero() {
  const form = document.getElementById('quick-search');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => { if (v) params.set(k, v); });
    location.hash = `#/imoveis${params.toString() ? `?${params.toString()}` : ''}`;
  });
}
