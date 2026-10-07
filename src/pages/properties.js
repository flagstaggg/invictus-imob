import { renderFilters, initFilters } from '../components/filters.js';
import { propertyCard } from '../components/propertyCard.js';
import { properties } from '../data/properties.js';

const SORTS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor', label: 'Menor preço' },
  { value: 'maior', label: 'Maior preço' },
  { value: 'recentes', label: 'Mais recentes' },
];

function applyFilters(q) {
  let list = [...properties];
  if (q.finalidade) list = list.filter((p) => p.finalidade === q.finalidade);
  if (q.tipo) list = list.filter((p) => p.tipo === q.tipo);
  if (q.bairro) list = list.filter((p) => p.bairro === q.bairro);
  if (q.preco) {
    const [min, max] = q.preco.split('-').map(Number);
    list = list.filter((p) => p.preco >= min && p.preco <= max);
  }
  if (q.quartos) list = list.filter((p) => p.quartos >= Number(q.quartos));
  if (q.vagas) list = list.filter((p) => p.vagas >= Number(q.vagas));

  switch (q.ordem) {
    case 'menor': list.sort((a, b) => a.preco - b.preco); break;
    case 'maior': list.sort((a, b) => b.preco - a.preco); break;
    case 'recentes': list.sort((a, b) => b.dataPublicacao.localeCompare(a.dataPublicacao)); break;
    default: list.sort((a, b) => Number(b.destaque) - Number(a.destaque) || b.dataPublicacao.localeCompare(a.dataPublicacao));
  }
  return list;
}

export function render(_params, q) {
  const list = applyFilters(q);
  return `
    <section class="section page-head">
      <div class="container">
        <p class="eyebrow">Vitrine</p>
        <h1>Imóveis</h1>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container">
        ${renderFilters(q)}
        <div class="properties__head">
          <p class="properties__count" aria-live="polite">${list.length} ${list.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>
          <div class="field field--inline">
            <label for="sort">Ordenar por</label>
            <select id="sort" name="ordem">
              ${SORTS.map((s) => `<option value="${s.value}" ${q.ordem === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          </div>
        </div>
        ${list.length
          ? `<div class="grid-cards">${list.map(propertyCard).join('')}</div>`
          : `<div class="empty-state">
               <h2>Nenhum imóvel encontrado</h2>
               <p>Ajuste ou limpe os filtros para ampliar a busca. Nossos consultores também podem montar um atendimento sob medida.</p>
               <a class="btn btn--gold" href="#/imoveis">Limpar filtros</a>
             </div>`}
      </div>
    </section>`;
}

export function init() {
  initFilters();
}
