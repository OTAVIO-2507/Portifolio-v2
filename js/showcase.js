// Vitrine de projetos: tilt 3D com brilho e sombra dinâmica, botões
// magnéticos, sheen, zoom das capturas conforme a rolagem, fundo de
// partículas com holofote e cursor customizado "Ver Projeto".

function initShowcase({ reduced }) {
  const sec = document.getElementById('projetos');
  if (!sec) return;

  const canHover = window.matchMedia('(hover: hover)').matches;

  initScrollZoom(sec, reduced);
  if (canHover && !reduced) {
    initTilt(sec);
    initSheen(sec);
  }
  if (!reduced) initParticles(sec, canHover);
  if (canHover) initCursor(sec);
}

/* As capturas começam com scale(1.14) e assentam em 1 conforme o card
   sobe. Também recua e esconde o card pinado conforme o próximo o
   cobre, porque as alturas dos cards diferem, então sem isso as bordas do
   anterior ficariam aparecendo por trás do novo. */
function initScrollZoom(sec, reduced) {
  const zoomEls = Array.from(sec.querySelectorAll('[data-zoom]'));
  const arts = Array.from(sec.querySelectorAll('.proj'));
  const head = sec.querySelector('.showcase-head');
  if (!zoomEls.length) return;

  // Com preferência por menos movimento, o zoom e os deslocamentos
  // saem de cena, mas os fades de cobertura continuam: sem eles o
  // card anterior vaza nas bordas e o título flutua no fim da seção.
  if (reduced) {
    zoomEls.forEach((img) => { img.style.transform = 'none'; });
  }

  // getComputedStyle dentro do laco de scroll forcava recalculo de
  // estilo a cada quadro. O modo (empilhado ou em fluxo) so muda com o
  // breakpoint, entao e medido uma vez e no resize.
  let empilhado = [];
  const medirModo = () => {
    empilhado = arts.map((a) => getComputedStyle(a).position === 'sticky');
  };
  medirModo();

  const update = (desloc) => {
    const vh = window.innerHeight;
    if (!reduced) {
      zoomEls.forEach((img) => {
        const art = img.closest('.proj');
        if (!art) return;
        const r = art.getBoundingClientRect();
        const topo = r.top + desloc;
        if (r.bottom < 0 || topo > vh) return;
        let p = (vh - topo) / Math.max(1, vh - 112);
        p = Math.max(0, Math.min(1, p));
        const e = 1 - Math.pow(1 - p, 3);
        img.style.transform = 'scale(' + (1.14 - 0.14 * e).toFixed(4) + ')';
      });
    }

    for (let i = 0; i < arts.length - 1; i++) {
      const frame = arts[i].querySelector('.proj-frame');
      if (!frame) continue;
      // Só quando os cards estão empilhados (sticky); no mobile eles
      // rolam em fluxo e o anterior não deve sumir.
      if (!empilhado[i]) {
        frame.style.transform = '';
        frame.style.opacity = '';
        frame.style.visibility = '';
        frame.style.pointerEvents = '';
        continue;
      }
      const r = arts[i + 1].getBoundingClientRect();
      let p = (vh - (r.top + desloc)) / Math.max(1, vh - 112);
      p = Math.max(0, Math.min(1, p));
      const e = p * p * (3 - 2 * p);
      if (!reduced) {
        frame.style.transform = 'translateY(' + (-16 * e).toFixed(1) + 'px) scale(' + (1 - 0.05 * e).toFixed(4) + ')';
      }
      frame.style.opacity = (1 - e).toFixed(3);
      // Um card apagado não pode continuar clicável/tabulável por
      // baixo do card que o cobriu.
      frame.style.visibility = e >= 1 ? 'hidden' : '';
      frame.style.pointerEvents = e > 0.5 ? 'none' : '';
    }

    // O título pinado sai de cena junto com o último card: quando o
    // artigo dele é empurrado acima do ponto de fixação (top < 112),
    // o head desvanece em vez de ficar flutuando até o fim da seção.
    if (head && arts.length) {
      const last = arts[arts.length - 1];
      if (empilhado[arts.length - 1]) {
        let p = (112 - (last.getBoundingClientRect().top + desloc)) / 200;
        p = Math.max(0, Math.min(1, p));
        head.style.opacity = (1 - p).toFixed(3);
        head.style.visibility = p >= 1 ? 'hidden' : '';
      } else {
        head.style.opacity = '';
        head.style.visibility = '';
      }
    }
  };
  // criarScrollSuave (reveal.js) da a esta secao a mesma inercia do
  // hero: os cards deslizam ate o valor novo em vez de colar nele.
  const acordar = criarScrollSuave(update);
  window.addEventListener('resize', () => { medirModo(); acordar(); }, { passive: true });
}

/* Tilt 3D por painel + glare + sombra + botões magnéticos, tudo num
   único rAF por painel que dorme quando os valores assentam. */
function initTilt(sec) {
  sec.querySelectorAll('[data-tilt]').forEach((panel) => {
    const glare = panel.parentElement.querySelector('[data-glare-dot]') || panel.querySelector('[data-glare-dot]');
    const shadow = panel.parentElement.querySelector('[data-shadow]');
    const mags = Array.from(panel.querySelectorAll('[data-mag]'));
    const st = {
      rx: 0, ry: 0, trx: 0, try_: 0,
      gx: 50, gy: 50, tgx: 50, tgy: 50,
      go: 0, tgo: 0,
      raf: null, on: false,
      m: mags.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 })),
    };

    const loop = () => {
      st.rx += (st.trx - st.rx) * 0.12;
      st.ry += (st.try_ - st.ry) * 0.12;
      st.gx += (st.tgx - st.gx) * 0.18;
      st.gy += (st.tgy - st.gy) * 0.18;
      st.go += (st.tgo - st.go) * 0.14;

      panel.style.transform = 'rotateX(' + st.rx.toFixed(3) + 'deg) rotateY(' + st.ry.toFixed(3) + 'deg)';
      if (glare) {
        glare.style.left = st.gx + '%';
        glare.style.top = st.gy + '%';
        glare.style.opacity = st.go.toFixed(3);
      }
      if (shadow) {
        shadow.style.transform = 'translate(' + (-st.ry * 4.4).toFixed(1) + 'px,' + (st.rx * 2.6).toFixed(1) + 'px)';
      }
      st.m.forEach((mm, i) => {
        mm.x += (mm.tx - mm.x) * 0.16;
        mm.y += (mm.ty - mm.y) * 0.16;
        mags[i].style.transform = 'translate(' + mm.x.toFixed(2) + 'px,' + mm.y.toFixed(2) + 'px)';
      });

      const settled = !st.on && Math.abs(st.rx) < 0.01 && Math.abs(st.ry) < 0.01 && st.go < 0.01 &&
        st.m.every((mm) => Math.abs(mm.x) < 0.05 && Math.abs(mm.y) < 0.05);
      if (settled) { st.raf = null; return; }
      st.raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (st.raf == null) st.raf = requestAnimationFrame(loop); };

    panel.addEventListener('mouseenter', () => { st.on = true; st.tgo = 1; kick(); });
    panel.addEventListener('mousemove', (ev) => {
      const r = panel.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width;
      const py = (ev.clientY - r.top) / r.height;
      st.try_ = (px * 2 - 1) * 5;
      st.trx = -(py * 2 - 1) * 4;
      st.tgx = px * 100;
      st.tgy = py * 100;
      mags.forEach((mg, i) => {
        const mr = mg.getBoundingClientRect();
        const dx = ev.clientX - (mr.left + mr.width / 2);
        const dy = ev.clientY - (mr.top + mr.height / 2);
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          const f = (1 - d / 130) * 0.34;
          st.m[i].tx = dx * f;
          st.m[i].ty = dy * f;
        } else {
          st.m[i].tx = 0;
          st.m[i].ty = 0;
        }
      });
      kick();
    });
    panel.addEventListener('mouseleave', () => {
      st.on = false;
      st.trx = 0;
      st.try_ = 0;
      st.tgo = 0;
      st.m.forEach((mm) => { mm.tx = 0; mm.ty = 0; });
      kick();
    });
  });
}

/* Brilho que atravessa o botão primário a cada hover. */
function initSheen(sec) {
  sec.querySelectorAll('[data-sheen-host]').forEach((btn) => {
    const sheen = btn.querySelector('[data-sheen]');
    if (!sheen) return;
    btn.addEventListener('mouseenter', () => {
      sheen.style.transition = 'none';
      sheen.style.transform = 'translateX(-180%) skewX(-18deg)';
      void sheen.offsetWidth;
      sheen.style.transition = 'transform 0.75s cubic-bezier(0.25, 0.6, 0.3, 1)';
      sheen.style.transform = 'translateX(300%) skewX(-18deg)';
    });
  });
}

/* Registra o segmento entre dois pontos na faixa de opacidade certa,
   se estiverem perto o bastante. */
function ligar(a, b, faixas) {
  const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
  if (d2 >= 12100) return;
  const t = 1 - Math.sqrt(d2) / 110;
  const f = t > 0.66 ? 2 : t > 0.33 ? 1 : 0;
  faixas[f].push(a.x, a.y, b.x, b.y);
}

/* Fundo vivo: constelação de partículas + holofote que segue o mouse. */
function initParticles(sec, canHover) {
  const cv = sec.querySelector('[data-fx]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const spot = sec.querySelector('[data-spot]');
  const RAIO = 110;
  const ALFAS = [0.017, 0.033, 0.05];
  // O canvas cobre a viewport inteira; rasterizar isso a cada quadro era
  // o gargalo da secao. Metade da resolucao (a CSS reescala de volta) e
  // 30fps derrubam a pintura para ~1/8, sem diferenca visivel numa
  // constelacao de pontos e linhas quase transparentes.
  const ESCALA = 0.5, FPS = 30, INTERVALO = 1000 / FPS;
  let ultimo = 0;
  let W = 0, H = 0, pts = [], visible = false, raf = null, lastY = window.scrollY;
  let cols = 1, linhas = 1;
  let sx = -800, sy = -800, tsx = -800, tsy = -800, so = 0, tso = 0;

  const size = () => {
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = Math.max(1, Math.round(W * ESCALA));
    cv.height = Math.max(1, Math.round(H * ESCALA));
    // Desenha em coordenadas CSS; o contexto reduz na hora de pintar.
    ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
    const n = Math.round(Math.min(54, Math.max(28, W * H / 34000)));
    if (pts.length !== n) {
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        // z em tres degraus: permite pintar todos os pontos de um mesmo
        // degrau num unico fill em vez de um por ponto.
        z: 0.3 + ((Math.random() * 3) | 0) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }));
    }
    cols = Math.max(1, Math.ceil(W / RAIO));
    linhas = Math.max(1, Math.ceil(H / RAIO));
  };
  size();

  const step = (t) => {
    if (!visible) { raf = null; return; }
    raf = requestAnimationFrame(step);
    if (t - ultimo < INTERVALO) return;
    ultimo = t;

    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    ctx.clearRect(0, 0, W, H);

    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy - dy * 0.06 * p.z;
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;
    }

    ctx.lineWidth = 1;

    // Grade espacial: cada ponto so e comparado com os das celulas
    // vizinhas, no lugar da varredura O(n^2) de todos contra todos.
    const grade = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const cx = Math.min(cols - 1, Math.max(0, (p.x / RAIO) | 0));
      const cy = Math.min(linhas - 1, Math.max(0, (p.y / RAIO) | 0));
      const k = cy * cols + cx;
      (grade[k] || (grade[k] = [])).push(i);
    }

    // Segmentos agrupados por faixa de opacidade: tres stroke() no
    // total, em vez de um por linha.
    const faixas = [[], [], []];
    const vizinhas = [[1, 0], [-1, 1], [0, 1], [1, 1]];
    for (let cy = 0; cy < linhas; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const celula = grade[cy * cols + cx];
        if (!celula) continue;
        for (let ii = 0; ii < celula.length; ii++) {
          const a = pts[celula[ii]];
          for (let jj = ii + 1; jj < celula.length; jj++) ligar(a, pts[celula[jj]], faixas);
          for (const [ox, oy] of vizinhas) {
            const nx = cx + ox, ny = cy + oy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= linhas) continue;
            const outra = grade[ny * cols + nx];
            if (!outra) continue;
            for (let jj = 0; jj < outra.length; jj++) ligar(a, pts[outra[jj]], faixas);
          }
        }
      }
    }

    for (let f = 0; f < 3; f++) {
      const seg = faixas[f];
      if (!seg.length) continue;
      ctx.strokeStyle = 'rgba(139,157,255,' + ALFAS[f] + ')';
      ctx.beginPath();
      for (let i = 0; i < seg.length; i += 4) {
        ctx.moveTo(seg[i], seg[i + 1]);
        ctx.lineTo(seg[i + 2], seg[i + 3]);
      }
      ctx.stroke();
    }

    // Pontos: um fill por degrau de z, nao um por ponto.
    for (let d = 0; d < 3; d++) {
      const z = 0.3 + d * 0.25;
      let abriu = false;
      for (const p of pts) {
        if (p.z !== z) continue;
        if (!abriu) { ctx.beginPath(); abriu = true; }
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      }
      if (abriu) {
        ctx.fillStyle = 'rgba(160,173,255,' + (z * 0.3).toFixed(3) + ')';
        ctx.fill();
      }
    }

    if (spot) {
      sx += (tsx - sx) * 0.1;
      sy += (tsy - sy) * 0.1;
      so += (tso - so) * 0.08;
      spot.style.transform = 'translate(' + (sx - 360).toFixed(1) + 'px,' + (sy - 360).toFixed(1) + 'px)';
      spot.style.opacity = so.toFixed(3);
    }
  };

  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && raf == null) {
      lastY = window.scrollY;
      raf = requestAnimationFrame(step);
    }
  });
  io.observe(sec);
  window.addEventListener('resize', size, { passive: true });

  if (canHover) {
    sec.addEventListener('mousemove', (ev) => { tsx = ev.clientX; tsy = ev.clientY; tso = 1; });
    sec.addEventListener('mouseleave', () => { tso = 0; });
  }
}

/* Cursor "Ver Projeto" que segue o mouse sobre os mockups. */
function initCursor(sec) {
  const links = sec.querySelectorAll('.proj-shot');
  if (!links.length) return;

  const cur = document.createElement('div');
  cur.className = 'proj-cursor';
  cur.textContent = 'Ver Projeto';
  document.body.appendChild(cur);

  let tx = 0, ty = 0, x = 0, y = 0, active = false, raf = null;
  // Ultima posicao conhecida do ponteiro, para saber o que esta sob ele
  // quando quem se move e a pagina, nao o mouse.
  let px = -1, py = -1;

  const desativar = () => {
    active = false;
    cur.classList.remove('is-active');
  };
  const loop = () => {
    x += (tx - x) * 0.24;
    y += (ty - y) * 0.24;
    cur.style.left = x + 'px';
    cur.style.top = y + 'px';
    if (active || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  };

  window.addEventListener('pointermove', (ev) => {
    px = ev.clientX;
    py = ev.clientY;
  }, { passive: true });

  // Rolar nao dispara mouseleave: o ponteiro fica parado e e o card que
  // sai de baixo dele. Sem esta checagem o balao continuava aceso sobre
  // outras secoes. Só custa um hit-test por quadro, e só enquanto aceso.
  let checando = false;
  window.addEventListener('scroll', () => {
    if (!active || checando) return;
    checando = true;
    requestAnimationFrame(() => {
      checando = false;
      if (!active || px < 0) return;
      const sob = document.elementFromPoint(px, py);
      if (!sob || !sob.closest('.proj-shot')) desativar();
    });
  }, { passive: true });

  // Ponteiro saindo da janela (ou trocando de aba) tambem apaga.
  document.addEventListener('mouseleave', desativar);
  window.addEventListener('blur', desativar);

  links.forEach((a) => {
    a.style.cursor = 'none';
    a.addEventListener('mouseenter', (ev) => {
      tx = x = ev.clientX;
      ty = y = ev.clientY;
      px = ev.clientX;
      py = ev.clientY;
      active = true;
      cur.classList.add('is-active');
      if (raf == null) raf = requestAnimationFrame(loop);
    });
    a.addEventListener('mousemove', (ev) => {
      tx = ev.clientX;
      ty = ev.clientY;
      if (raf == null) raf = requestAnimationFrame(loop);
    });
    a.addEventListener('mouseleave', desativar);
  });
}
