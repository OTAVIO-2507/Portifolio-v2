// Calendário de contribuições do GitHub (via API pública jogruber.de)
// com o MODO ARTE: a espátula repinta o ano a óleo.

const USER = 'OTAVIO-2507';
const API = 'https://github-contributions-api.jogruber.de/v4/';

const CS = 13, GAP = 3, STEP = CS + GAP, MLH = 22;
const COLORS = ['#161b26', '#0e4429', '#006d32', '#26a641', '#39d353'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const NS = 'http://www.w3.org/2000/svg';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parseDate = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };

function initGithubCalendar() {
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

  // O <section class="github">: e nele que a trama do linho mora, e e
  // ela que precisa aparecer quando a tinta entra.
  const painel = card.closest('.github');

  const rects = new Map();
  const levels = new Map();
  const state = { on: false, raf: null, telas: [] };

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
        /* Sem guarda de modo. O modo jogo suprimia isto porque lá o
           quadradinho era alvo e o dado estava sendo destruido; aqui a
           pincelada É o dado, e continuar dizendo a data e a contagem no
           hover e' justamente o que separa uma releitura de um enfeite.
           Os <rect> ficam com opacidade zero por baixo da tinta, e
           opacidade zero ainda recebe ponteiro. */
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

  // Rodapé: legenda + chave do modo arte + estatística
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
  // Guardadas: a legenda tem de trocar de paleta junto com a grade,
  // senao ela continua explicando um verde que saiu de cena.
  const amostras = [];
  for (let i = 0; i < 5; i++) {
    const sq = document.createElement('i');
    sq.style.background = COLORS[i];
    legend.appendChild(sq);
    amostras.push(sq);
  }
  const more = document.createElement('span');
  more.textContent = 'Mais';
  legend.appendChild(more);
  left.appendChild(legend);

  const tg = document.createElement('div');
  tg.className = 'gh-arte-toggle';
  const tgLabel = document.createElement('span');
  tgLabel.className = 'gh-arte-label';
  tgLabel.textContent = 'MODO ARTE';
  const btn = document.createElement('button');
  btn.className = 'gh-switch';
  // O rotulo nao muda com o estado: quem carrega o estado e aria-pressed,
  // e um nome que se inverte a cada clique confunde quem le por audio.
  btn.setAttribute('aria-label', 'Modo arte');
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

  const restaurar = () => {
    rects.forEach((r, date) => {
      const lv = data[date] ? data[date].level : 0;
      levels.set(date, lv);
      r.setAttribute('fill', COLORS[lv]);
      r.style.transition = 'opacity 0.45s ease';
      r.style.opacity = '1';
    });
    amostras.forEach((sq, i) => { sq.style.background = COLORS[i]; });
  };

  const setArte = (on) => {
    state.on = on;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    card.classList.toggle('is-arte', on);
    if (painel) painel.classList.toggle('is-arte', on);
    labelG.style.opacity = on ? '0.4' : '1';
    tip.style.opacity = '0';

    if (state.raf) { cancelAnimationFrame(state.raf); state.raf = null; }
    state.telas.forEach((c) => c.remove());
    state.telas = [];

    if (!on) { restaurar(); return; }

    /* Duas telas, não uma. A tinta é PERMANENTE: uma pincelada assentada
       não sai mais, então aquela camada nunca é limpa. O brilho da
       espátula é transitório e precisa sumir a cada quadro — desenhado na
       mesma tela, ele viraria um borrão acumulado atravessando o ano.

       As duas ficam ACIMA da grade sem receber ponteiro: os <rect>
       continuam embaixo, invisíveis e clicáveis, então passar o mouse
       sobre uma pincelada ainda diz a data e a contagem. O modo jogo
       apagava o dado; este só troca a representação dele. */
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const novaTela = (z) => {
      const c = document.createElement('canvas');
      c.width = Math.round(svgW * dpr);
      c.height = Math.round(svgH * dpr);
      c.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:' + z +
        ';width:' + svgW + 'px;height:' + svgH + 'px';
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      wrap.appendChild(c);
      state.telas.push(c);
      return c;
    };

    amostras.forEach((sq, i) => {
      sq.style.background = i === 0 ? 'rgba(255,255,255,0.06)' : OLEO[i].face;
    });
    pintarOAno(novaTela(5), novaTela(6), { weeks, levels, rects, state });
  };

  btn.addEventListener('click', () => setArte(!state.on));
}

/* ============================================================
   O ano em tinta
   ============================================================
   O modo antigo era uma navinha atirando nos quadradinhos. Divertido,
   mas Space Invaders não tem nada a ver com um ateliê à hora azul — e o
   tiro APAGAVA o registro de commits, inventando um estado que nunca
   existiu.

   Aqui a espátula atravessa a grade semana a semana e assenta uma
   pincelada por dia com commit. O número não muda: muda a
   representação. O verde do GitHub é raspado pela própria espátula, uma
   coluna por vez, e no lugar dele entra a paleta da pintura que serve de
   chão à seção.

   Frio e fino para poucos commits, quente e grosso para muitos: a escala
   de intensidade vira escala de TEMPERATURA e MASSA, que é como um
   pintor a leria. Dia sem commit é tela nua, e ali aparece a trama do
   linho do próprio painel.

   Não há laço de repouso. Quando o ano termina de ser pintado é um
   quadro parado, e quadro parado não gasta quadro de animação. */

/* Os tons saíram por percentil de luminância da própria pintura do
   ateliê (assets/Projetos/cenario.webp): o teal da parede nos níveis
   baixos, o ocre das telas encostadas no meio, o âmbar da lâmpada no
   alto. `massa` é a espessura da pincelada. */
const OLEO = [
  null,
  { face: '#33565c', luz: '#547e86', sombra: '#16292d', massa: 0.42 },
  { face: '#5a7d6a', luz: '#83a68c', sombra: '#2c4436', massa: 0.62 },
  { face: '#9a7a3e', luz: '#c9a45f', sombra: '#4f3a17', massa: 0.82 },
  { face: '#d9903a', luz: '#f6c877', sombra: '#7d4d12', massa: 1.00 },
];

const DURACAO_PINTURA = 2600;

function pintarOAno(telaTinta, telaFerramenta, { weeks, levels, rects, state }) {
  const ctx = telaTinta.getContext('2d');
  const fer = telaFerramenta.getContext('2d');
  const larguraCss = parseFloat(telaTinta.style.width);
  const alturaCss = parseFloat(telaTinta.style.height);
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ruído estável por dia: a mesma pincelada sai igual toda vez que o
     modo é ligado. Aleatório de verdade faria o quadro mudar a cada
     clique, e quadro que muda sozinho não é quadro. */
  const ruido = (semente, n) => {
    const s = Math.sin(semente * 127.1 + n * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  /* Uma pincelada de espátula: quadrilátero irregular de cantos moles,
     pegando luz em cima e à direita — a mesma direção da lâmpada da
     cena — e com a sombra caindo embaixo e à esquerda. */
  function pincelada(x, y, lado, tinta, semente) {
    const r = (n) => ruido(semente, n);
    const folga = lado * 0.16;
    const d = (n) => (r(n) - 0.5) * 2 * folga;
    const p = [
      [x + d(1), y + d(2)],
      [x + lado + d(3), y + d(4)],
      [x + lado + d(5), y + lado + d(6)],
      [x + d(7), y + lado + d(8)],
    ];

    /* arcTo e não quadraticCurveTo pelos meios: interpolar pelos pontos
       médios arredonda o quadrilátero inteiro e a pincelada vira bala.
       Aqui os lados ficam RETOS e só os cantos amolecem, que é o que a
       espátula deixa — aresta de lâmina, canto de massa. */
    const raio = lado * 0.3;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2);
    for (let i = 1; i <= 4; i++) {
      const a = p[i % 4], b = p[(i + 1) % 4];
      ctx.arcTo(a[0], a[1], b[0], b[1], raio);
    }
    ctx.closePath();

    // a massa levanta do painel: sombra para baixo e à esquerda
    ctx.shadowColor = 'rgba(0, 0, 0, ' + (0.5 * tinta.massa).toFixed(2) + ')';
    ctx.shadowOffsetX = -1.1 * tinta.massa;
    ctx.shadowOffsetY = 1.8 * tinta.massa;
    ctx.shadowBlur = 2.6 * tinta.massa;

    const g = ctx.createLinearGradient(x, y + lado, x + lado, y);
    g.addColorStop(0, tinta.sombra);
    g.addColorStop(0.52, tinta.face);
    g.addColorStop(1, tinta.luz);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    // o fio de luz na crista, onde a espátula deixou a tinta mais alta
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p[0][0] + lado * 0.16, p[0][1] + lado * 0.22);
    ctx.quadraticCurveTo(
      x + lado * (0.4 + r(9) * 0.3), y + lado * (0.1 + r(10) * 0.2),
      p[1][0] - lado * 0.14, p[1][1] + lado * 0.28
    );
    ctx.strokeStyle = 'rgba(255, 246, 228, ' + (0.34 * tinta.massa).toFixed(2) + ')';
    ctx.lineWidth = Math.max(0.7, lado * 0.09 * tinta.massa);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  let pintadas = 0;
  const inicio = performance.now();

  const pintarColuna = (wx) => {
    const week = weeks[wx];
    if (!week) return;
    week.forEach((date, dy) => {
      if (!date) return;
      // a espátula raspa o verde desta coluna ao passar
      const r = rects.get(date);
      if (r) { r.style.transition = 'opacity 0.35s ease'; r.style.opacity = '0'; }
      const lv = levels.get(date) || 0;
      if (lv === 0) return;
      // 2px além da célula: massa de tinta encosta na vizinha em vez
      // de respeitar a grade, e é o encosto que faz o quadro parecer
      // pintado em vez de tabelado.
      pincelada(wx * STEP - 1, MLH + dy * STEP - 1, CS + 2, OLEO[lv], wx * 7 + dy);
    });
  };

  const passo = (t) => {
    const p = Math.min(1, (t - inicio) / DURACAO_PINTURA);
    const ate = Math.ceil(p * weeks.length);
    while (pintadas < ate) pintarColuna(pintadas++);

    // a ferramenta: um brilho estreito onde a tinta está sendo posta
    fer.clearRect(0, 0, larguraCss, alturaCss);
    if (p < 1) {
      const cx = p * weeks.length * STEP;
      const g = fer.createLinearGradient(cx - STEP * 2, 0, cx + STEP * 0.8, 0);
      g.addColorStop(0, 'rgba(246, 231, 200, 0)');
      g.addColorStop(0.74, 'rgba(246, 231, 200, 0.17)');
      g.addColorStop(1, 'rgba(246, 231, 200, 0)');
      fer.fillStyle = g;
      fer.fillRect(cx - STEP * 2, MLH - 3, STEP * 2.8, 7 * STEP + 2);
      state.raf = requestAnimationFrame(passo);
    } else {
      state.raf = null;
    }
  };

  if (reduzido) {
    /* Sem movimento: o quadro aparece pronto. É a alternativa em fade
       sem deslocamento que o PRODUCT.md pede, e a espátula — que só
       existe para mostrar o gesto — não chega a entrar em cena. */
    while (pintadas < weeks.length) pintarColuna(pintadas++);
    state.raf = null;
  } else {
    state.raf = requestAnimationFrame(passo);
  }
}
