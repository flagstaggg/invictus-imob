// Lightbox próprio: foco no fechar, Esc fecha, setas navegam, clique no fundo fecha.
export function openLightbox(images, startIndex = 0, title = '') {
  const root = document.getElementById('lightbox-root');
  let index = startIndex;
  const lastFocused = document.activeElement;

  root.innerHTML = `
    <div class="lightbox" role="dialog" aria-modal="true" aria-label="Galeria de fotos${title ? ` — ${title}` : ''}">
      <button class="lightbox__close" data-close aria-label="Fechar galeria">×</button>
      <button class="lightbox__nav lightbox__nav--prev" data-prev aria-label="Foto anterior">‹</button>
      <figure class="lightbox__figure">
        <img class="lightbox__img" alt="${title} — foto ${index + 1} de ${images.length}" />
        <figcaption class="lightbox__caption"></figcaption>
      </figure>
      <button class="lightbox__nav lightbox__nav--next" data-next aria-label="Próxima foto">›</button>
    </div>`;

  const img = root.querySelector('.lightbox__img');
  const caption = root.querySelector('.lightbox__caption');
  const closeBtn = root.querySelector('[data-close]');

  const show = () => {
    img.src = images[index];
    img.alt = `${title} — foto ${index + 1} de ${images.length}`;
    caption.textContent = `${title ? `${title} · ` : ''}${index + 1} / ${images.length}`;
  };

  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') { index = (index + 1) % images.length; show(); }
    if (e.key === 'ArrowLeft') { index = (index - 1 + images.length) % images.length; show(); }
    if (e.key === 'Tab') {
      const focusables = root.querySelectorAll('button');
      const list = [...focusables];
      const i = list.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === list.length - 1 ? 0 : i + 1);
      list[next].focus();
    }
  };

  root.querySelector('[data-prev]').addEventListener('click', () => { index = (index - 1 + images.length) % images.length; show(); });
  root.querySelector('[data-next]').addEventListener('click', () => { index = (index + 1) % images.length; show(); });
  closeBtn.addEventListener('click', close);
  root.querySelector('.lightbox').addEventListener('click', (e) => { if (e.target.classList.contains('lightbox')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  show();
  closeBtn.focus();
}
