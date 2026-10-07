const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function formatPrice(value, finalidade) {
  const base = BRL.format(value);
  return finalidade === 'locacao' ? `${base}/mês` : base;
}

export function formatArea(value) {
  return `${new Intl.NumberFormat('pt-BR').format(value)} m²`;
}

export const TYPE_LABELS = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  terreno: 'Terreno',
  'sala-comercial': 'Sala comercial',
};

export const PRICE_RANGES = [
  { value: '', label: 'Qualquer faixa' },
  { value: '0-1500000', label: 'Até R$ 1,5 mi' },
  { value: '1500000-3000000', label: 'R$ 1,5 mi a R$ 3 mi' },
  { value: '3000000-6000000', label: 'R$ 3 mi a R$ 6 mi' },
  { value: '6000000-999999999', label: 'Acima de R$ 6 mi' },
];
