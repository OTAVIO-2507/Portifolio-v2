// Hero: paisagem em quatro camadas com parallax de rolagem e título
// animado por letra. As camadas vivem numa única caixa absoluta
// (.hero-scene) e se deslocam em frações diferentes da altura do hero:
// o fundo fica para trás, o primeiro plano escapa por cima.

function initHero({ reduced }) {
  splitHeadline(reduced);
  if (!reduced) {
    initParallax();
    initHeroNote();
  }
}

/* Divide o h1 em letras para a entrada em cascata.
   Sem JS (ou com motion reduzido) o título simplesmente aparece.

   Uma letra por span é desenho, não conteúdo: para o leitor de tela isso
   vira "O, t, á, v, i, o" — o nome soletrado, no h1 mais importante da
   página. Então o texto inteiro vai no aria-label ANTES do corte e os
   pedaços saem da árvore de acessibilidade. */
function splitHeadline(reduced) {
  const el = document.querySelector('[data-split]');
  if (!el || reduced) return;

  const texto = el.textContent.trim();
  const words = texto.split(' ');
  el.setAttribute('aria-label', texto);
  el.textContent = '';
  let i = 0;
  words.forEach((word, wi) => {
    const w = document.createElement('span');
    w.className = 'word';
    w.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'hero-char';
      span.style.animationDelay = (i * 0.06 + 0.9) + 's';
      span.textContent = ch;
      w.appendChild(span);
      i++;
    }
    el.appendChild(w);
    if (wi < words.length - 1) {
      el.appendChild(document.createTextNode(' '));
      i++;
    }
  });
}

/* A frase da segunda tela é escrita conforme a rolagem: cada palavra
   vira um span e entra em sequência, com o progresso amarrado ao scroll
   em vez de a um tempo fixo. Subindo a página, ela se desescreve. */
function initHeroNote() {
  const paragrafos = document.querySelectorAll('[data-hero-note]');
  if (!paragrafos.length) return;

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  // dividirEmPalavras vem de reveal.js; main.js roda por último, então
  // todos os scripts já foram avaliados quando isto executa.
  const palavras = [];
  paragrafos.forEach((p) => palavras.push(...dividirEmPalavras(p)));

  // Só acima de 3:2, que é onde a frase ocupa a segunda tela. Abaixo
  // disso ela volta para o fluxo, logo abaixo do nome, e revelar por
  // rolagem a deixaria meio transparente já em repouso. O matchMedia do
  // GSAP desfaz o efeito sozinho quando a consulta deixa de valer.
  gsap.matchMedia().add('(min-aspect-ratio: 3/2)', () => {
    // `set` + `to` em vez de `fromTo`: com stagger e scrub, o fromTo nao
    // chega a fixar o estado inicial das palavras seguintes e todas
    // aparecem de cara.
    gsap.set(palavras, { opacity: 0, y: 14 });
    gsap.to(palavras, {
      opacity: 1,
      y: 0,
      ease: 'none',
      stagger: { each: 0.5 },
      scrollTrigger: {
        trigger: paragrafos[0],
        start: 'top 95%',
        end: 'bottom 45%',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  });
}

/* Parallax das camadas. GSAP chega por CDN como script clássico; se o
   CDN estiver fora, a cena continua idêntica ao layout, só sem
   movimento. */
function initParallax() {
  const hero = document.getElementById('inicio');
  const layers = hero ? hero.querySelectorAll('[data-parallax]') : [];
  if (!layers.length) return;

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Uma trigger só para as quatro camadas. O scrub com inércia (0.6)
  // devolve parte da suavidade da rolagem sem transformar a página
  // inteira, que quebraria os cards sticky de Projetos.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  // O deslocamento é recalculado a cada refresh (resize/rotação), por
  // isso vai como função em vez de número fixo.
  layers.forEach((layer) => {
    const depth = parseFloat(layer.dataset.parallax);
    if (!depth) return;
    tl.to(layer, {
      // O curso e uma fracao da rolagem: com a trigger indo de
      // `top top` a `bottom top`, o progresso e scroll/altura do hero,
      // entao y = depth x altura x progresso = depth x scroll.
      y: () => hero.offsetHeight * depth,
      ease: 'none',
    }, 0);
  });
}
