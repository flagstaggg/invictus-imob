// Fonte única de dados de imóveis para o site público (somente leitura).
let cache = null;

export async function fetchProperties() {
  if (cache) return cache;
  const res = await fetch('/api/public/imoveis');
  if (!res.ok) throw new Error('Não foi possível carregar os imóveis');
  const data = await res.json();
  cache = data.imoveis;
  return cache;
}

export async function fetchProperty(slugOrId) {
  const list = await fetchProperties();
  return list.find((p) => p.slug === slugOrId || p.id === slugOrId) ?? null;
}

export function clearPropertiesCache() { cache = null; }
