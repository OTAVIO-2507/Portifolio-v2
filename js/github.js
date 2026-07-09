// Calendário de contribuições do GitHub (via API pública jogruber.de)
// com o easter egg "MODO JOGO": uma navinha atira nos quadradinhos.

const USER = 'OTAVIO-2507';
const API = 'https://github-contributions-api.jogruber.de/v4/';

const CS = 13, GAP = 3, STEP = CS + GAP, MLH = 22, EXTRA = 80;
const COLORS = ['#161b26', '#0e4429', '#006d32', '#26a641', '#39d353'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const NS = 'http://www.w3.org/2000/svg';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parseDate = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };

export function initGithubCalendar() {
  const host = document.querySelector('[data-gh-cal]');
  if (!host || !('fetch' in window)) return;

  host.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'gh-card';
  const status = document.createElement('div');
  status.className = 'gh-status';
  status.textContent = 'Carregando contribuições…';
  card.appendChild(status);
  host.appendChild(card);

  fetch(API + USER + '?y=last')
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((json) => {
      const data = {};
      (json.contributions || []).forEach((c) => {
        data[c.date] = { level: Math.min(4, Math.max(0, c.level)), count: c.count || 0 };
      });
      build(card, data);
    })
    .catch(() => {
      status.textContent = 'Não foi possível carregar as contribuições do GitHub agora.';
    });
}

function build(card, data) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = addDays(end, 1);
  start.setFullYear(start.getFullYear() - 1);
  const gridStart = addDays(start, -start.getDay());

  const weeks = [];
  const monthLabels = [];
  let cur = new Date(gridStart);
  let lastMonth = -1;
  let wi = 0;
  while (cur <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (cur >= start && cur <= end) {
        week.push(fmt(cur));
        if (cur.getMonth() !== lastMonth) {
          lastMonth = cur.getMonth();
          monthLabels.push({ label: MONTHS[cur.getMonth()], wi });
        }
      } else {
        week.push(null);
      }
      cur = addDays(cur, 1);
    }
    weeks.push(week);
    wi++;
  }

  const svgW = weeks.length * STEP - GAP;
  const svgH = MLH + 7 * STEP - GAP;
  let total = 0;
  weeks.forEach((w) => w.forEach((d) => { if (d && data[d]) total += data[d].count; }));

  card.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'gh-scroll';
  card.appendChild(wrap);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', svgW);
  svg.setAttribute('height', svgH);
  svg.style.display = 'block';
  svg.style.overflow = 'visible';
  wrap.appendChild(svg);

  // Rótulos dos meses (pula os que ficariam colados)
  const labelG = document.createElementNS(NS, 'g');
  labelG.style.transition = 'opacity 0.4s ease';
  const valid = [];
  monthLabels.forEach((m) => {
    const last = valid[valid.length - 1];
    if (valid.length === 0 && monthLabels[1] && monthLabels[1].wi - m.wi < 3) return;
    if (last && m.wi - last.wi < 3) return;
    valid.push(m);
  });
  valid.forEach((m) => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', m.wi * STEP);
    t.setAttribute('y', 11);
    t.setAttribute('font-size', '11');
    t.setAttribute('fill', 'rgba(255,255,255,.5)');
    t.setAttribute('font-family', "'Spline Sans Mono',monospace");
    t.textContent = m.label;
    labelG.appendChild(t);
  });
  svg.appendChild(labelG);

  const tip = document.createElement('div');
  tip.className = 'gh-tip';
  wrap.appendChild(tip);

  const rects = new Map();
  const levels = new Map();
  const state = { on: false, raf: null, canvas: null };

  weeks.forEach((week, wx) => {
    week.forEach((date, dy) => {
      if (!date) return;
      const lv = data[date] ? data[date].level : 0;
      levels.set(date, lv);
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', wx * STEP);
      r.setAttribute('y', MLH + dy * STEP);
      r.setAttribute('width', CS);
      r.setAttribute('height', CS);
      r.setAttribute('rx', 3);
      r.setAttribute('fill', COLORS[lv]);
      r.style.transition = 'opacity 0.1s';
      r.addEventListener('mouseenter', () => {
        if (state.on) return;
        const c = data[date] ? data[date].count : 0;
        const dd = parseDate(date);
        tip.textContent = (c === 0 ? 'Sem contribuições' : c === 1 ? '1 contribuição' : c + ' contribuições') +
          ' em ' + dd.getDate() + ' de ' + MONTHS_FULL[dd.getMonth()];
        tip.style.left = (wx * STEP + CS / 2) + 'px';
        tip.style.top = (MLH + dy * STEP) + 'px';
        tip.style.opacity = '1';
      });
      r.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
      svg.appendChild(r);
      rects.set(date, r);
    });
  });

  // Rodapé: legenda + toggle do modo jogo + estatística
  const foot = document.createElement('div');
  foot.className = 'gh-foot';
  card.appendChild(foot);

  const left = document.createElement('div');
  left.className = 'gh-foot-left';

  const legend = document.createElement('div');
  legend.className = 'gh-legend';
  const less = document.createElement('span');
  less.textContent = 'Menos';
  legend.appendChild(less);
  for (let i = 0; i < 5; i++) {
    const sq = document.createElement('i');
    sq.style.background = COLORS[i];
    legend.appendChild(sq);
  }
  const more = document.createElement('span');
  more.textContent = 'Mais';
  legend.appendChild(more);
  left.appendChild(legend);

  const tg = document.createElement('div');
  tg.className = 'gh-game-toggle';
  const tgLabel = document.createElement('span');
  tgLabel.className = 'gh-game-label';
  tgLabel.textContent = 'MODO JOGO';
  const btn = document.createElement('button');
  btn.className = 'gh-switch';
  btn.setAttribute('aria-label', 'Ativar modo jogo');
  btn.setAttribute('aria-pressed', 'false');
  const knob = document.createElement('i');
  btn.appendChild(knob);
  tg.appendChild(tgLabel);
  tg.appendChild(btn);
  left.appendChild(tg);
  foot.appendChild(left);

  const stats = document.createElement('a');
  stats.className = 'gh-stats';
  stats.href = 'https://github.com/' + USER;
  stats.target = '_blank';
  stats.rel = 'noopener';
  stats.innerHTML = '<strong>' + USER + '</strong> contribuiu <strong class="gh-total">' +
    total.toLocaleString('pt-BR') + '</strong> vezes no último ano no <strong class="gh-link">GitHub</strong>';
  foot.appendChild(stats);

  const restore = () => {
    rects.forEach((r, date) => {
      const lv = data[date] ? data[date].level : 0;
      levels.set(date, lv);
      r.setAttribute('fill', COLORS[lv]);
      r.style.opacity = '1';
    });
  };

  const setGame = (on) => {
    state.on = on;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    card.classList.toggle('is-game', on);
    labelG.style.opacity = on ? '0.14' : '1';
    tip.style.opacity = '0';
    wrap.style.paddingBottom = on ? EXTRA + 'px' : '0';
    if (on) {
      rects.forEach((r, date) => { if ((levels.get(date) || 0) === 0) r.style.opacity = '0'; });
      const cv = document.createElement('canvas');
      cv.width = svgW;
      cv.height = svgH + EXTRA;
      cv.style.cssText = 'position:absolute;left:0;top:0;width:' + svgW + 'px;height:' + (svgH + EXTRA) + 'px;z-index:10';
      wrap.appendChild(cv);
      state.canvas = cv;
      runGame(cv, { weeks, data, rects, levels, state });
    } else {
      if (state.raf) { cancelAnimationFrame(state.raf); state.raf = null; }
      if (state.canvas) { state.canvas.remove(); state.canvas = null; }
      restore();
    }
  };
  btn.addEventListener('click', () => setGame(!state.on));
}

function runGame(cv, { weeks, data, rects, levels, state }) {
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const player = { x: W / 2 - 15, y: H - 25, w: 30, h: 20, speed: 4, dir: 1 };
  let bullets = [];
  let particles = [];
  let lastShot = 0;
  const stars = Array.from({ length: 140 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    sp: Math.random() * 0.4 + 0.1,
    sz: Math.random() * 1.2 + 0.5,
    a: Math.random() * 0.5 + 0.1,
  }));

  const explode = (x, y, color) => {
    for (let i = 0; i < 12; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = Math.random() * 2.5 + 1.2;
      particles.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, color, sz: Math.random() * 2 + 1, life: 0, max: Math.random() * 15 + 15 });
    }
  };

  const resetLevels = () => {
    rects.forEach((r, date) => {
      const lv = data[date] ? data[date].level : 0;
      levels.set(date, lv);
      r.setAttribute('fill', COLORS[lv]);
      r.style.opacity = lv === 0 ? '0' : '1';
    });
  };

  const update = () => {
    // A nave patrulha só o trecho que ainda tem quadradinhos vivos
    let minWi = -1, maxWi = -1;
    weeks.forEach((week, wx) => {
      week.forEach((date) => {
        if (date && (levels.get(date) || 0) > 0) {
          if (minWi === -1) minWi = wx;
          minWi = Math.min(minWi, wx);
          maxWi = Math.max(maxWi, wx);
        }
      });
    });
    let minX = 0, maxX = W - player.w;
    if (minWi !== -1) {
      minX = minWi * STEP;
      maxX = Math.max(minX, Math.min(W - player.w, (maxWi + 1) * STEP - player.w));
    }
    player.x = Math.max(minX, Math.min(maxX, player.x)) + player.speed * player.dir;
    if (player.x >= maxX) { player.x = maxX; player.dir = -1; }
    else if (player.x <= minX) { player.x = minX; player.dir = 1; }

    const now = Date.now();
    if (now - lastShot >= 140) {
      bullets.push({ x: player.x + player.w / 2 - 1.5, y: player.y - 4, vy: -6, w: 3, h: 8 });
      lastShot = now;
    }

    let any = false;
    levels.forEach((lv) => { if (lv > 0) any = true; });
    if (!any) resetLevels();

    stars.forEach((s) => { s.y += s.sp; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
    bullets = bullets.filter((b) => { b.y += b.vy; return b.y > 0; });
    particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life++; });
    particles = particles.filter((p) => p.life < p.max);

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      let hit = false;
      for (let wx = 0; wx < weeks.length && !hit; wx++) {
        for (let dy = 0; dy < 7 && !hit; dy++) {
          const date = weeks[wx][dy];
          if (!date) continue;
          const lv = levels.get(date) || 0;
          if (lv === 0) continue;
          const cx = wx * STEP, cy = MLH + dy * STEP;
          if (b.x < cx + CS && b.x + b.w > cx && b.y < cy + CS && b.y + b.h > cy) {
            bullets.splice(bi, 1);
            hit = true;
            const nl = lv - 1;
            levels.set(date, nl);
            const r = rects.get(date);
            if (r) {
              if (nl === 0) r.style.opacity = '0';
              else r.setAttribute('fill', COLORS[nl]);
            }
            explode(cx + CS / 2, cy + CS / 2, COLORS[lv]);
          }
        }
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    stars.forEach((s) => { ctx.globalAlpha = s.a; ctx.fillRect(s.x, s.y, s.sz, s.sz); });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fbbf24';
    bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
    particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.fillRect(p.x, p.y, p.sz, p.sz);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(player.x + player.w / 2, player.y);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.lineTo(player.x + player.w * 0.7, player.y + player.h * 0.75);
    ctx.lineTo(player.x + player.w * 0.3, player.y + player.h * 0.75);
    ctx.lineTo(player.x, player.y + player.h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const loop = () => {
    if (!state.on) return;
    update();
    draw();
    state.raf = requestAnimationFrame(loop);
  };
  loop();
}
