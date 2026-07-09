// Ponto de entrada: liga cada módulo de comportamento da página.
import { initHero } from './hero.js';
import { initMarquee } from './marquee.js';
import { initReveals } from './reveal.js';
import { initShowcase } from './showcase.js';
import { initGithubCalendar } from './github.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initNav();
initYear();
initHero({ reduced });
initMarquee({ reduced });
initReveals({ reduced });
initShowcase({ reduced });
initGithubCalendar();

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
}

function initYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = new Date().getFullYear();
}
