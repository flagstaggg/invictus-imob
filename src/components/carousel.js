// Carrossel simples com scroll-snap nativo (toque incluso), botões e dots.
export function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  if (!track) return;
  const slides = [...track.children];
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const dotsWrap = root.querySelector('.carousel__dots');

  const perView = () => {
    if (root.dataset.perview === '1') return 1;
    if (window.innerWidth >= 1024) return root.dataset.perview === '2' ? 2 : 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  let pages = 1;
  const renderDots = () => {
    pages = Math.max(1, Math.ceil(slides.length / perView()));
    if (dotsWrap) {
      dotsWrap.innerHTML = Array.from({ length: pages }, (_, i) =>
        `<button type="button" aria-label="Ir para grupo ${i + 1}" ${i === 0 ? 'aria-current="true"' : ''}></button>`,
      ).join('');
      [...dotsWrap.children].forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    }
    update();
  };

  const pageWidth = () => track.clientWidth;
  const goTo = (i) => track.scrollTo({ left: i * pageWidth(), behavior: 'smooth' });
  const current = () => Math.round(track.scrollLeft / pageWidth());

  const update = () => {
    const idx = Math.min(current(), pages - 1);
    if (dotsWrap) [...dotsWrap.children].forEach((d, i) => (i === idx ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    if (prev) prev.disabled = track.scrollLeft <= 8;
    if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
  };

  prev?.addEventListener('click', () => goTo(Math.max(0, current() - 1)));
  next?.addEventListener('click', () => goTo(Math.min(pages - 1, current() + 1)));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.tabIndex = 0;
  track.setAttribute('data-lenis-prevent', '');
  track.setAttribute('role', 'region');
  track.setAttribute('aria-roledescription', 'carousel');
  track.setAttribute('aria-label', root.dataset.label || 'Lista de itens');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(pages - 1, current() + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, current() - 1)); }
  });
  window.addEventListener('resize', renderDots);
  renderDots();
}
