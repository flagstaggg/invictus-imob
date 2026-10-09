// Store isolado de favoritos: único ponto que toca localStorage.
// Chave pública: 'invictus-mobi:favorites' (array de IDs, nunca objetos completos).
// Os dados vêm do banco via API pública (src/utils/api.js) através das páginas.

const KEY = 'invictus-mobi:favorites';
const listeners = new Set();
let memoryFallback = null; // usado quando localStorage falha (modo anônimo, quota cheia etc.)
let storageListenerReady = false;

function validIds(list) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id) => typeof id === 'string' && id.length > 0))];
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    memoryFallback = null;
  } catch {
    memoryFallback = [...list];
  }
}

function notify() {
  const favs = getFavorites();
  listeners.forEach((cb) => {
    try { cb(favs); } catch { /* listener com erro não deve quebrar o store */ }
  });
}

export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    const list = validIds(parsed);
    // normaliza: JSON inválido/array com IDs órfãos ou duplicados é reescrito limpo
    if (!Array.isArray(parsed) || parsed.length !== list.length) write(list);
    return list;
  } catch {
    // JSON corrompido ou armazenamento indisponível: zera com segurança e notifica
    const list = validIds(memoryFallback ?? []);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      memoryFallback = null;
    } catch {
      memoryFallback = [...list];
    }
    return list;
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function addFavorite(id) {
  const list = getFavorites();
  if (!list.includes(id) && typeof id === 'string' && id) {
    list.push(id);
    write(list);
    notify();
  }
}

export function removeFavorite(id) {
  const list = getFavorites().filter((x) => x !== id);
  if (list.length !== getFavorites().length) {
    write(list);
    notify();
  }
}

export function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return true;
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Sincroniza entre abas: se outra aba alterar a chave, notifica os inscritos.
export function initFavoritesSync() {
  if (storageListenerReady) return;
  storageListenerReady = true;
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) notify();
  });
}
