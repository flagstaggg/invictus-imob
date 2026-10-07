import { TYPE_LABELS, PRICE_RANGES } from '../utils/format.js';

export function renderFilters(q, bairros = []) {
  return `
    <form class="filters" id="filters" aria-label="Filtrar imóveis">
      <div class="field">
        <label for="f-finalidade">Finalidade</label>
        <select id="f-finalidade" name="finalidade">
          <option value="">Comprar e alugar</option>
          <option value="venda" ${q.finalidade === 'venda' ? 'selected' : ''}>Comprar</option>
          <option value="locacao" ${q.finalidade === 'locacao' ? 'selected' : ''}>Alugar</option>
        </select>
      </div>
      <div class="field">
        <label for="f-tipo">Tipo</label>
        <select id="f-tipo" name="tipo">
          <option value="">Todos</option>
          ${Object.entries(TYPE_LABELS).map(([v, l]) => `<option value="${v}" ${q.tipo === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="f-bairro">Bairro</label>
        <select id="f-bairro" name="bairro">
          <option value="">Todos</option>
          ${bairros.map((b) => `<option value="${b}" ${q.bairro === b ? 'selected' : ''}>${b}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="f-preco">Faixa de preço</label>
        <select id="f-preco" name="preco">
          ${PRICE_RANGES.map((r) => `<option value="${r.value}" ${q.preco === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="f-quartos">Quartos</label>
        <select id="f-quartos" name="quartos">
          <option value="">Qualquer</option>
          ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${q.quartos === String(n) ? 'selected' : ''}>${n}+</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="f-vagas">Vagas</label>
        <select id="f-vagas" name="vagas">
          <option value="">Qualquer</option>
          ${[1, 2, 3, 4].map((n) => `<option value="${n}" ${q.vagas === String(n) ? 'selected' : ''}>${n}+</option>`).join('')}
        </select>
      </div>
      <button type="reset" class="btn btn--outline filters__clear">Limpar filtros</button>
    </form>`;
}

export function initFilters() {
  const form = document.getElementById('filters');
  if (!form) return;
  const apply = () => {
    const data = new FormData(form);
    const params = new URLSearchParams();
    data.forEach((v, k) => { if (v) params.set(k, v); });
    const sortSel = document.getElementById('sort');
    if (sortSel && sortSel.value) params.set('ordem', sortSel.value);
    location.hash = `#/imoveis${params.toString() ? `?${params.toString()}` : ''}`;
  };
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(() => { location.hash = '#/imoveis'; }, 0));
  const sortSel = document.getElementById('sort');
  sortSel?.addEventListener('change', apply);
}
