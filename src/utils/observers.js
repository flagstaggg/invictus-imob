const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
}

export function initCounters() {
  const els = document.querySelectorAll('[data-counter]:not([data-done])');
  if (!els.length) return;
  const run = (el) => {
    el.dataset.done = '1';
    const target = Number(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion()) {
      el.textContent = `${target.toLocaleString('pt-BR')}${suffix}`;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased).toLocaleString('pt-BR')}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) {
    els.forEach(run);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 },
  );
  els.forEach((el) => io.observe(el));
}

export function initParallax() {
  const media = document.querySelector('.hero__media');
  if (!media || reducedMotion()) return;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    media.style.transform = y < window.innerHeight ? `translateY(${y * 0.25}px)` : '';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}
