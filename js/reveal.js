// Reveals de rolagem. O conteúdo é visível por padrão; só depois que o JS
// roda é que os alvos são escondidos (.will-reveal) e observados, assim
// nada some se o script falhar ou se o usuário preferir menos movimento.

function initReveals({ reduced }) {
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

/* Divide um elemento em palavras, cada uma num span próprio, e devolve
   os spans. O espaço fica FORA do span: dentro dele viraria um recuo
   visível sempre que a palavra caísse no começo de uma linha.
   Usado aqui e pelo bloco da segunda tela do hero (hero.js). */
function dividirEmPalavras(el) {
  const spans = [];
  // Percorre os nós de texto em profundidade: assim funciona tanto num
  // parágrafo simples quanto num contêiner (um princípio do Sobre, por
  // exemplo, tem só h3 + p dentro). Elementos como <br> ficam intactos.
  const caminhante = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nos = [];
  let no;
  while ((no = caminhante.nextNode())) {
    if (no.nodeValue.trim()) nos.push(no);
  }

  nos.forEach((texto) => {
    const partes = texto.nodeValue.split(/(\s+)/).filter((t) => t !== '');
    const frag = document.createDocumentFragment();
    partes.forEach((parte) => {
      if (/^\s+$/.test(parte)) {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      const span = document.createElement('span');
      span.className = 'palavra';
      span.textContent = parte;
      frag.appendChild(span);
      spans.push(span);
    });
    texto.parentNode.replaceChild(frag, texto);
  });
  return spans;
}

/* Texto que se escreve conforme a rolagem: cada palavra entra em
   sequência, com o progresso amarrado ao scroll em vez de a um tempo
   fixo. Só opacidade, sem transform, para não encarecer a pintura em
   blocos longos. Sem GSAP ou com motion reduzido, o texto simplesmente
   fica visível. */
function initWordReveal({ reduced }) {
  if (reduced) return;

  const alvos = document.querySelectorAll('[data-words]');
  if (!alvos.length) return;

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  alvos.forEach((el) => {
    const palavras = dividirEmPalavras(el);
    if (!palavras.length) return;
    gsap.set(palavras, { opacity: 0 });
    gsap.to(palavras, {
      opacity: 1,
      ease: 'none',
      stagger: { each: 0.4 },
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: 'bottom 55%',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
  });
}

/* Leitor de rolagem com inércia, o mesmo princípio do `scrub` que o
   GSAP usa no hero: um valor suave persegue a posição real em vez de
   colar nela. Quem desenha recebe `desloc` — o quanto a animação está
   atrás da rolagem — e soma às coordenadas lidas do layout, de modo que
   tudo chega ao lugar deslizando em vez de saltar.
   Usado por showcase.js e xp.js. */
function criarScrollSuave(desenhar, atrito) {
  const forca = atrito || 0.06;
  let suave = window.scrollY;
  let raf = null;

  const passo = () => {
    const real = window.scrollY;
    suave += (real - suave) * forca;
    const desloc = real - suave;
    if (Math.abs(desloc) > 0.3) {
      desenhar(desloc);
      raf = requestAnimationFrame(passo);
    } else {
      // Assentou: desenha na posição exata e dorme até a próxima rolagem.
      suave = real;
      desenhar(0);
      raf = null;
    }
  };

  const acordar = () => { if (raf == null) raf = requestAnimationFrame(passo); };
  window.addEventListener('scroll', acordar, { passive: true });
  window.addEventListener('resize', acordar, { passive: true });
  desenhar(0);
  return acordar;
}
