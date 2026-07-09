// Reveals de rolagem. O conteúdo é visível por padrão; só depois que o JS
// roda é que os alvos são escondidos (.will-reveal) e observados — assim
// nada some se o script falhar ou se o usuário preferir menos movimento.

export function initReveals({ reduced }) {
  if (reduced || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('[data-reveal], .proj-info, .proj-shot');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const vh = window.innerHeight;
  targets.forEach((el) => {
    // O que já está na viewport (carga inicial ou entrada por âncora)
    // permanece visível; só o que está abaixo da dobra anima ao entrar.
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) return;
    el.classList.add('will-reveal');
    io.observe(el);
  });
}
