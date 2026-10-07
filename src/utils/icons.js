// Ícones SVG inline de traço fino (stroke atual via currentColor).
const wrap = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

export const icons = {
  quartos: wrap('<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>'),
  suite: wrap('<path d="M4 12V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 12h4a2 2 0 0 1 2 2v7"/><circle cx="13" cy="10" r="1"/>'),
  vagas: wrap('<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="1.5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>'),
  area: wrap('<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M9 4v16"/>'),
  whatsapp: wrap('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/>'),
  pin: wrap('<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  chevronLeft: wrap('<path d="M15 18l-6-6 6-6"/>'),
  chevronRight: wrap('<path d="M9 6l6 6-6 6"/>'),
  arrowRight: wrap('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  star: wrap('<path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.65 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z"/>'),
  close: wrap('<path d="M6 6l12 12M18 6L6 18"/>'),
};
