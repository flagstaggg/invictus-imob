// Wordmark tipográfico da marca. Versão inline para fundo escuro.
export function brandMark(compact = false) {
  return `
    <svg class="brand ${compact ? 'brand--compact' : ''}" viewBox="0 0 220 64" role="img" aria-label="Invictus Mobi">
      <rect x="2" y="6" width="2" height="52" fill="#C9A96A" />
      <text x="16" y="36" class="brand__word">INVICTUS</text>
      <text x="18" y="56" class="brand__sub">M O B I</text>
    </svg>`;
}
