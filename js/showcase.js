// Vitrine de projetos: tilt 3D com brilho e sombra dinâmica, botões
// magnéticos, sheen, zoom das capturas conforme a rolagem, fundo de
// partículas com holofote e cursor customizado "Ver Projeto".

export function initShowcase({ reduced }) {
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
   cobre — as alturas dos cards diferem, então sem isso as bordas do
   anterior ficariam aparecendo por trás do novo. */
function initScrollZoom(sec, reduced) {
  const zoomEls = Array.from(sec.querySelectorAll('[data-zoom]'));
  const arts = Array.from(sec.querySelectorAll('.proj'));
  const head = sec.querySelector('.showcase-head');
  if (!zoomEls.length) return;

  if (reduced) {
    zoomEls.forEach((img) => { img.style.transform = 'none'; });
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    zoomEls.forEach((img) => {
      const art = img.closest('.proj');
      if (!art) return;
      const r = art.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      let p = (vh - r.top) / Math.max(1, vh - 112);
      p = Math.max(0, Math.min(1, p));
      const e = 1 - Math.pow(1 - p, 3);
      img.style.transform = 'scale(' + (1.14 - 0.14 * e).toFixed(4) + ')';
    });

    for (let i = 0; i < arts.length - 1; i++) {
      const frame = arts[i].querySelector('.proj-frame');
      if (!frame) continue;
      // Só quando os cards estão empilhados (sticky); no mobile eles
      // rolam em fluxo e o anterior não deve sumir.
      if (getComputedStyle(arts[i]).position !== 'sticky') {
        frame.style.transform = '';
        frame.style.opacity = '';
        frame.style.visibility = '';
        frame.style.pointerEvents = '';
        continue;
      }
      const r = arts[i + 1].getBoundingClientRect();
      let p = (vh - r.top) / Math.max(1, vh - 112);
      p = Math.max(0, Math.min(1, p));
      const e = p * p * (3 - 2 * p);
      frame.style.transform = 'translateY(' + (-16 * e).toFixed(1) + 'px) scale(' + (1 - 0.05 * e).toFixed(4) + ')';
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
      if (getComputedStyle(last).position === 'sticky') {
        let p = (112 - last.getBoundingClientRect().top) / 200;
        p = Math.max(0, Math.min(1, p));
        head.style.opacity = (1 - p).toFixed(3);
        head.style.visibility = p >= 1 ? 'hidden' : '';
      } else {
        head.style.opacity = '';
        head.style.visibility = '';
      }
    }
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
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

/* Fundo vivo: constelação de partículas + holofote que segue o mouse. */
function initParticles(sec, canHover) {
  const cv = sec.querySelector('[data-fx]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const spot = sec.querySelector('[data-spot]');
  let W = 0, H = 0, pts = [], visible = false, raf = null, lastY = window.scrollY;
  let sx = -800, sy = -800, tsx = -800, tsy = -800, so = 0, tso = 0;

  const size = () => {
    W = cv.width = cv.clientWidth;
    H = cv.height = cv.clientHeight;
    const n = Math.round(Math.min(72, Math.max(36, W * H / 27000)));
    if (pts.length !== n) {
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        z: Math.random() * 0.7 + 0.3,
        r: Math.random() * 1.4 + 0.6,
      }));
    }
  };
  size();

  const step = () => {
    if (!visible) { raf = null; return; }
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
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dyy = a.y - b.y, d2 = dx * dx + dyy * dyy;
        if (d2 < 12100) {
          ctx.strokeStyle = 'rgba(139,157,255,' + ((1 - Math.sqrt(d2) / 110) * 0.05).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.fillStyle = 'rgba(160,173,255,' + (p.z * 0.3).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }

    if (spot) {
      sx += (tsx - sx) * 0.1;
      sy += (tsy - sy) * 0.1;
      so += (tso - so) * 0.08;
      spot.style.transform = 'translate(' + (sx - 360).toFixed(1) + 'px,' + (sy - 360).toFixed(1) + 'px)';
      spot.style.opacity = so.toFixed(3);
    }
    raf = requestAnimationFrame(step);
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

  links.forEach((a) => {
    a.style.cursor = 'none';
    a.addEventListener('mouseenter', (ev) => {
      tx = x = ev.clientX;
      ty = y = ev.clientY;
      active = true;
      cur.classList.add('is-active');
      if (raf == null) raf = requestAnimationFrame(loop);
    });
    a.addEventListener('mousemove', (ev) => {
      tx = ev.clientX;
      ty = ev.clientY;
      if (raf == null) raf = requestAnimationFrame(loop);
    });
    a.addEventListener('mouseleave', () => {
      active = false;
      cur.classList.remove('is-active');
    });
  });
}
