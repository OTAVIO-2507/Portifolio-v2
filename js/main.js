// Ponto de entrada: liga cada modulo de comportamento da pagina.
// Scripts classicos, nao modulos ES: assim a pagina tambem abre direto
// do disco (file://), onde o navegador bloqueia modulos por CORS. Os
// arquivos sao carregados com `defer` na ordem do <head>, entao todas
// as funcoes ja existem quando este roda.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initNav();
initYear();
initHero({ reduced });
initMarquee({ reduced });
initReveals({ reduced });
initWordReveal({ reduced });
initShowcase({ reduced });
initXp({ reduced });
initGlobo({ reduced });
initFooter({ reduced });
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

/* A rolagem da página é a nativa, de propósito: interpolar a roda do
   mouse atrasa a resposta ao gesto, e transformar a página (o que o
   ScrollSmoother faz) quebraria os `position: sticky` que sustentam o
   empilhamento de Projetos. A inércia que existe no site é dos EFEITOS,
   não da barra: quem a dá é o criarScrollSuave de js/reveal.js.

   Ficava aqui uma initScrollSuave() vazia — só as guardas e o comentário,
   corpo nenhum — e o main a chamava em toda carga. */
