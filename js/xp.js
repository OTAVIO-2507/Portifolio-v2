// Experiência: o eixo da linha do tempo.
//
// Duas coisas acontecem na rolagem, e nenhuma delas mexe no texto: o
// trilho se preenche e os pontos que a frente do trilho já passou
// acendem. O cartão mais próximo da linha de leitura fica em foco — o
// equivalente ao hover para quem está no toque, onde hover não existe.
//
// As durações não são escritas à mão: saem das datas em data-dur-from /
// data-dur-to, então "3 meses" no cargo atual continua certo no mês que
// vem. O HTML já traz o valor de hoje como texto, e é ele que aparece se
// o script não rodar.

function initXp({ reduced }) {
  const sec = document.getElementById('experiencia');
  if (!sec) return;

  escreverDuracoes(sec);

  const rail = sec.querySelector('.xp-rail');
  const fill = sec.querySelector('[data-xp-line]');
  const head = sec.querySelector('[data-xp-head]');
  const nodes = [...sec.querySelectorAll('[data-xp-node]')];
  const cards = [...sec.querySelectorAll('.xp-job')];
  if (!rail || !fill) return;

  if (reduced) {
    fill.style.transform = 'scaleY(1)';
    nodes.forEach((n) => n.classList.add('is-lit'));
    return;
  }

  // Todas as MEDIDAS primeiro, todas as ESCRITAS depois. Intercalar as
  // duas forçaria o navegador a recalcular o layout a cada leitura, e
  // isso aconteceria em todo quadro da rolagem.
  const pintar = () => {
    const vh = window.innerHeight;
    const r = rail.getBoundingClientRect();

    if (r.bottom < -200 || r.top > vh + 200) {
      // Sai de cena sem deixar cartão preso em foco nem cabeça acesa.
      cards.forEach((card) => card.classList.remove('is-active'));
      if (head) head.classList.remove('is-on');
      return;
    }

    // -------- leitura --------
    const centros = nodes.map((n) => {
      const nr = n.getBoundingClientRect();
      return nr.top + nr.height / 2;
    });

    // Um cartão em foco por vez: o de centro mais próximo de 45% da tela.
    const mira = vh * 0.45;
    let foco = null;
    let melhor = Infinity;
    cards.forEach((card) => {
      const cr = card.getBoundingClientRect();
      if (cr.bottom < 0 || cr.top > vh) return;
      const dist = Math.abs(cr.top + cr.height / 2 - mira);
      if (dist < melhor) {
        melhor = dist;
        foco = card;
      }
    });

    // -------- escrita --------
    // A frente do trilho persegue uma linha de leitura a 62% da tela:
    // fica um pouco à frente do que está sendo lido, nunca atrás.
    const p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / Math.max(1, r.height)));
    fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';

    // A cabeça anda por transform, no mesmo ponto onde o preenchimento
    // termina. Só acende entre as pontas: parada no topo ou no fim ela
    // viraria enfeite, não indicação de avanço.
    if (head) {
      head.style.transform = 'translateY(' + (r.height * p).toFixed(1) + 'px)';
      head.classList.toggle('is-on', p > 0.002 && p < 0.998);
    }

    const y = r.top + r.height * p;
    nodes.forEach((n, i) => n.classList.toggle('is-lit', centros[i] <= y + 2));
    cards.forEach((card) => card.classList.toggle('is-active', card === foco));
  };

  // criarScrollSuave vem de reveal.js; main.js roda por último.
  criarScrollSuave(pintar);
}

/* Reescreve cada [data-dur-from] com a distância até data-dur-to (ou até
   hoje). Os meses são contados de forma inclusiva: jan a jun de 2023 são
   seis meses, não cinco. */
function escreverDuracoes(raiz) {
  const alvos = raiz.querySelectorAll('[data-dur-from]');
  if (!alvos.length) return;
  const hoje = new Date();

  alvos.forEach((el) => {
    const ini = lerMes(el.dataset.durFrom);
    const fim = el.dataset.durTo ? lerMes(el.dataset.durTo) : hoje;
    if (!ini || !fim) return;
    const meses =
      (fim.getFullYear() - ini.getFullYear()) * 12 +
      (fim.getMonth() - ini.getMonth()) +
      1;
    if (meses > 0) el.textContent = escreverDuracao(meses);
  });
}

function lerMes(valor) {
  const m = /^(\d{4})-(\d{2})$/.exec(valor || '');
  if (!m) return null;
  // Mes fora de 1-12 seria virada de ano silenciosa no Date ("2024-13"
  // viraria jan/2025) e a pagina publicaria um tempo de casa errado. Um
  // erro de digitacao aqui tem que cair no texto escrito no HTML.
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return new Date(Number(m[1]), mes - 1, 1);
}

function escreverDuracao(meses) {
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes = [];
  if (anos) partes.push(anos + (anos === 1 ? ' ano' : ' anos'));
  if (resto) partes.push(resto + (resto === 1 ? ' mês' : ' meses'));
  return partes.join(' e ') || '1 mês';
}
