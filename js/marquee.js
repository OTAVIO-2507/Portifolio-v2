// Marquee de habilidades: duplica o conteúdo de cada fila para o loop
// contínuo (o deslocamento de -50% exige duplicação exata) e liga a animação.
// Com motion reduzido a fila fica estática.

export function initMarquee({ reduced }) {
  if (reduced) return;

  document.querySelectorAll('[data-marquee-row]').forEach((row) => {
    const items = Array.from(row.children);
    for (const item of items) {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    }
    row.classList.add('is-on');
  });
}
