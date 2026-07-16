// Experiência: preenche o trilho da linha do tempo conforme a rolagem.
// Com menos movimento, o trilho fica cheio e estático.

export function initXp({ reduced }) {
  const sec = document.getElementById('experiencia');
  if (!sec) return;
  const fill = sec.querySelector('[data-xp-line]');
  if (!fill) return;

  if (reduced) {
    fill.style.transform = 'scaleY(1)';
    fill.style.boxShadow = 'none';
    return;
  }

  const list = sec.querySelector('.xp-list');
  let ticking = false;

  const update = () => {
    ticking = false;
    const r = list.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    // O preenchimento acompanha um ponto a ~72% da viewport, como se a
    // leitura "puxasse" a linha para baixo.
    let p = (vh * 0.72 - r.top) / Math.max(1, r.height);
    p = Math.max(0, Math.min(1, p));
    fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
