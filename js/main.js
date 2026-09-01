// Ponto de entrada: liga cada modulo de comportamento da pagina.
// Scripts classicos, nao modulos ES: assim a pagina tambem abre direto
// do disco (file://), onde o navegador bloqueia modulos por CORS. Os
// arquivos sao carregados com `defer` na ordem do <head>, entao todas
// as funcoes ja existem quando este roda.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initScrollSuave();
initNav();
initYear();
initHero({ reduced });
initMarquee({ reduced });
initReveals({ reduced });
initWordReveal({ reduced });
initShowcase({ reduced });
initXp({ reduced });
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

/* Rolagem suave: em vez de transformar a página (o que o ScrollSmoother
   faz, e que quebraria os `position: sticky` que sustentam o
   empilhamento de Projetos), anima a POSIÇÃO REAL de rolagem. O
   navegador continua rolando de verdade, então sticky, âncoras e barra
   de rolagem seguem funcionando — só que o movimento ganha inércia.

   Só no ponteiro fino: no toque a rolagem nativa já tem inércia própria
   e interceptá-la piora. */
function initScrollSuave() {
  if (reduced) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // A rolagem precisa responder no mesmo instante da ação do usuário.
  // Por isso mantemos a navegação nativa do navegador e evitamos qualquer
  // interpolação artificial no mousewheel / trackpad.
}
