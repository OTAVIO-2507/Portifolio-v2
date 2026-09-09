// Globo da experiência.
//
// Canvas 2D, sem biblioteca. O site não carrega Three.js (o blob 3D do
// hero virou paisagem em parallax), e trazer ~150 KB de engine para
// desenhar uma esfera contrariaria o argumento da página.
//
// A esfera é PINTADA: duas texturas a óleo desenhadas através de
// RECORTES VETORIAIS. O oceano preenche o disco; a terra é desenhada só
// dentro do contorno de costa real (Natural Earth 110m, simplificada,
// 4,2 KB embutidos aqui), projetado a cada quadro.
//
// Cheguei aqui por eliminação. A primeira versão amostrava pixel a pixel
// com getImageData e quebrava com SecurityError: imagem carregada por
// file:// contamina o canvas. Funcionaria no servidor e falharia no
// disco — e esta página abre do disco de propósito. O recorte vetorial
// não lê pixel nenhum, então não contamina, e ainda troca 166 mil
// operações por quadro em JS por um drawImage acelerado por GPU.
//
// Progressive enhancement: sem JS ou sem canvas, a lista de estratos
// continua sendo o conteúdo. O globo indexa, não guarda.

const TERRA = '-a0.3u b.-5 0.1 5.0 4.-2 -5.-1 -1.-2 -b.3 -3.-2 k0.0 -5.-1 3.-4 -b.-2 -6.-3 -e.0 -3.-4 2.-1 -2.-5 -a.-8 -2.c f.8 2.3 -9.-4 -1.3 -6.-1 -5.-3 2.-2 -q.0 -e.-9 a.-1 3.-4 -7.-b -6.-6 -5.0 -a.-7 4.-6 -1.-4 -5.-1 -1.4 2.1 -5.2 2.3 -9.-1 1.4 -7.-4 2.-3 7.0 -7.-5 6.-7 -1.-7 -b.-a -a.-3 -1.-2 -4.2 -5.-3 7.-d -1.-4 -8.-6 0.3 -a.7 -2.-9 8.-7 2.-8 -5.3 -3.7 -3.3 1.7 -4.b -6.-2 1.4 -6.a -9.-3 -1.-3 -c.-8 -1.-b -5.-5 -8.g -2.b -4.-1 -8.9 -i.0 -2.3 -4.-1 -6.3 -3.4 -4.0 6.-a 1.2 1.-4 4.0 5.5 1.-5 6.-3 -9.-b -o.-9 -2.9 -g.m 1.3 -2.-4 -3.5 9.-g 1.-7 c.-c -2.-2 4.-2 d.3 0.-3 -7.-d -h.-h 4.-k -c.-b 1.-8 -6.-3 -1.-7 -8.-8 -h.-4 -3.2 0.5 -6.9 -1.a -5.8 3.f -3.b -6.8 1.9 -2.3 -5.-1 -3.4 -d.-4 -e.1 -f.e -2.5 3.7 -2.8 5.9 a.7 0.5 7.7 8.-2 7.3 g.2 3.-1 -1.-6 h.-7 5.5 f.-4 a.0 4.b -h.0 -3.6 f.5 a.-2 6.2 -a.6 5.5 -8.-2 3.-3 -5.-1 -3.2 2.1 -6.1 -6.-8 3.-3 -d.-1 3.-6 -2.1 -1.-3 -6.8 0.2 -d.8 -1.-3 c.-8 -3.1 -2.-5 -1.4 -d.9 -c.-3 0.-2 -4.-2 -2.-5 -4.-4 -7.-1 -7.2 -1.c g.2 1.4 -7.5 6.0 -1.3 7.0 6.6 7.1 1.7 4.1 1.-2 -3.-2 3.-3 h.1 4.1 0.5 5.-1 1.3 -2.1 b.2 -c.0 -3.1 0.5 8.4 -7.1 -8.-6 -2.-2 4.-3 -4.-3 -2.-5 -6.-1 -5.8 -4.-2 -6.0 -1.7 2.1 q.f b.2 7.0 7.-1 -3.-1 2.-1 j.-3 1.-2 -2.-1 -e.0 4.-1 0.-3 4.-1 0.2 5.-1 5.4 4.-1 1.2 -2.3 6.-1 1.-1 -3.-1 2.-1 e.5 d.-1 2.1 -1.2 g.-4 1.1 -4.2 -1.3 5.4 7.0 -1.-3 3.-6 -4.-4 2.-1 5.4 -3.3 2.2 -3.2 3.3 4.-4 -1.2 3.1 8.-2 -2.4 d.1 -2.1 2.1 s.3 7.2 j.-3 -9.-4 r.-2 1.1 7.0 9.-5 2.2 f.-1 -2.2 3.1 11.-4 4.-3 e.0 3.-2 3.1 -1.2 g.-1|-51.3v 0.-2 3.2 3.-5 4.6 6.-1 2.-1 0.-3 -9.-2 -3.-3 -b.-6 -3.-6 3.0 1.-4 k.-4 1.-3 4.-5 3.3 -3.4 7.4 -4.5 2.2 -1.5 8.0 9.-3 0.-4 4.-2 6.5 5.-8 9.-4 4.-5 -9.-4 -d.0 -9.-6 c.4 2.-1 -2.-1 1.-4 6.0 2.2 1.-2 -b.-5 -1.2 3.2 -5.-1 -7.-4 1.-3 -7.-1 3.0 -4.0 -2.-4 -1.1 -1.-5 -1.4 -1.-2 3.-5 -c.-8 2.-d -7.a -a.1 -2.-3 -8.1 -5.-2 -3.-c 3.-6 4.-3 5.1 3.5 7.1 -4.-b b.-1 -1.-9 5.-4 4.1 5.-2 4.5 6.3 1.-7 3.6 4.-3 c.0 -1.-1 b.-8 6.0 5.-4 3.-5 -1.-3 b.-3 1.-2 9.-1 9.-4 2.-5 -8.-b -5.-i -d.-6 -3.-7 -a.-c -4.-1 -5.2 3.-6 -4.-3 -7.-1 0.-4 -5.0 3.-3 -8.-6 0.-2 4.-1 -1.-2 -6.-5 2.-4 -6.-1 0.-2 -8.3 -1.8 3.3 -3.1 2.5 3.-1 1.4 -4.-1 2.c 4.9 3.p -3.5 -9.6 -8.f -3.2 3.7 -2.1 0.2 8.a -2.9 -3.1 -3.-4 -9.6 -4.7 -w.a -4.3 -1.6 -g.h -2.1 1.-4 a.-d -1.-1 -4.3 -1.3 -5.3 2.2 -7.9 -6.3 -8.c 0.f 4.-2 -1.4 -9.4 -1.3 -c.b -q.6 -9.-4 2.5 -g.-b -d.-3 f.6 1.3 -a.-1 0.2 -8.4 3.3 7.2 -1.1 1.1 -8.-1 -6.2 d.1 -b.5 l.6 14.-5 h.3 12.-6 2.1 -2.1 2.0 4.1 9.-3 8.2 3.-1 0.-1 4.3 -5.2 3.4|-a0.-4p k.1 o.-3 u.1 -l.3 1.3 -8.2 l.1 -i.3 -5.2 -1.2 e.-1 b.2 0.2 2.1 1q.3 3.-2 o.-2 -6.6 e.-2 f.2 q.-3 e.2 4.2 -3.5 2.5 j.7 -8.-3 0.-2 -7.-4 7.-5 2.-6 -j.-6 -d.0 7.-3 -9.-1 0.-1 14.-8 1n.5 -2.2 -c.0 0.3 10.6 4.1 -2.1 2.2 h.4 e.-1 f.3 7.-2 5.2 r.-1 e.4 9.-3 w.8 e.-4 f.0 1.-2 -3.-3 2.0 -2.-3 4.-1 8.5 s.8 g.-3 7.1 7.3 6.-3 f.2 d.-3 u.3 0.1 5.-3 g.0 7.-3 18.-6 -3.-4 -c.-5 2.-4 5.-2 -a.0 -4.-4 j.-6 i.-1|-1i.4n c.-2 -l.-1 13.-1 -g.-3 5.0 -4.-2 2.-4 -6.-1 3.-1 1.-2 -2.0 2.-1 -8.-2 2.-3 -5.1 6.-4 -7.2 -2.-3 8.0 -z.-9 -6.-6 -1.-5 -a.2 -6.5 -5.7 6.6 -7.-1 0.3 6.-1 -9.2 3.2 -8.6 -k.1 -6.2 9.1 -d.1 g.3 -5.1 b.4 o.1 c.-2 -5.2 7.1|7z.-s 4.-2 2.-8 5.-3 8.-b 0.-a -6.-d -7.-3 -3.2 -3.-2 -6.2 -5.5 0.2 -2.-2 2.5 -4.-4 -3.5 -6.2 -r.-7 -6.2 1.5 -4.b 1.-1 -1.4 1.5 0.-1 e.6 9.b 8.-2 2.5 4.1 0.2 8.-2 -2.-6 9.-5 4.d|-4t.42 1.-1 7.3 3.-4 6.2 c.-3 8.-3 2.-2 -4.-1 e.-3 -4.-4 -8.3 7.-6 -1.-2 -8.2 6.-3 -i.5 -5.-1 -2.1 1.2 8.0 2.4 -c.5 -j.1 -3.3 3.3 5.1|7g.-2 3.-5 6.4 c.-5 6.-4 -1.-3 7.-6 -5.1 -7.5 -4.-4 -a.2 2.2 -1.4 -9.4 -1.-1 -2.2 3.2 -6.2|7u.22 -1.-4 -9.-3 -2.2 -8.-1 2.-2 -1.-3 -3.0 -1.4 6.4 6.0 2.4 6.1 2.6 2.1 1.-3|2q.2b 3.-2 -3.-3 0.-3 a.-1 0.4 -3.2 4.2 -2.2 -1.-2 -1.4 -4.3 5.2 0.3 -8.-1 -5.-4|-6.39 -2.-2 4.0 -2.-3 9.-7 0.-2 -d.-3 3.3 -4.1 3.1 -1.2 3.1 -5.3 -1.3 2.3|-6c.42 8.0 4.-3 -1.3 4.0 4.-4 7.-2 -3.-1 0.-1 -r.0 -3.2 a.1 -b.0 4.2 -7.0|-3t.4m d.-1 -u.-6 3.-2 -a.-5 -i.1 3.1 -1.2 7.-1 -6.2 6.2 -4.2 a.0 -b.0 -8.3|6y.3 -3.-3 -7.0 2.-3 5.2 -4.-3 3.-7 -3.2 -1.4 -1.-6 -2.0 -1.5 2.7|6k.4 2.-2 -2.0 -4.-a -c.2 -2.5 1.5 7.2 7.8 5.-3 -3.-5|2s.-r 1.-4 -7.-j -6.0 -1.6 2.4 0.8 6.3 3.5|-34.2t -2.-1 7.-2 1.-5 -2.3 -3.-2 -8.1 4.6 3.2|-60.48 4.0 -1.-2 -e.-1 3.1 -b.0 4.3 d.-2 -3.2|-t.3p 2.-3 -a.-3 -9.1 2.1 -4.1 4.1 -5.0|-3t.-3y -1.-2 -4.-1 -8.2 6.1 1.3 2.1|9p.-20 5.-4 3.1 -7.-8 -2.4 1.4 -4.6|5w.-c -7.4 -e.j 4.-1 d.-a -1.-1 5.-5|-6p.3z -5.-1 -6.2 4.3 -2.2 f.-1 4.-1|-3s.-30 6.-1 -8.-2 -b.5 7.-2 3.3|37.3x -c.2 8.7 r.3 -l.-4 -6.-4';

/* Os dois endereços reais. Não há terceiro: inventar pino seria
   inventar experiência. */
const LUGARES = [
  { id: 'bravend',    nome: 'Bravend',    cidade: 'Tatuapé, São Paulo',  lat: -23.5405, lon: -46.5760 },
  { id: 'zincoligas', nome: 'Zincoligas', cidade: 'Itaquaquecetuba, SP', lat: -23.4863, lon: -46.3486 },
];

function initGlobo({ reduced }) {
  const raiz = document.querySelector('[data-globo]');
  const lista = document.querySelector('.xp-estratos');
  if (!raiz || !lista) return;

  const cv = raiz.querySelector('canvas');
  const ctx = cv && cv.getContext && cv.getContext('2d');
  if (!ctx) return;

  const titulo = raiz.querySelector('[data-globo-titulo]');
  const onde = raiz.querySelector('[data-globo-onde]');
  const abas = [...raiz.querySelectorAll('[data-globo-aba]')];
  const folhear = raiz.querySelector('[data-folhear]');
  const contaFolha = raiz.querySelector('[data-folhear-conta]');
  const botoesFolha = [...raiz.querySelectorAll('[data-folhear-passo]')];

  /* ---------- a carta guarda os cargos ----------
     Os cargos são MOVIDOS para dentro do pergaminho, não copiados: uma
     cópia faria o leitor de tela anunciar tudo duas vezes.

     Isso já quebrou uma vez. Ao esvaziar a lista, a seção encolheu e
     passou a caber inteira dentro da faixa que o rodapé em sobreposição
     cobre ao subir — o globo ficava com zero pixel visível no fim da
     rolagem. A correção não está aqui e sim no CSS: a seção reserva
     altura de sobra e essa altura é PINTURA, não vão vazio, então o
     rodapé sobe por cima da mesa em vez de por cima do conteúdo. */
  const legenda = raiz.querySelector('.globo-legenda');
  const carta = raiz.querySelector('[data-globo-carta]');
  const cargos = {};
  LUGARES.forEach((l) => {
    /* ul e não div: os cargos são <li> e vieram de uma <ol>. Soltos num
       div viram itens de lista órfãos — o navegador desenha o marcador
       padrão e a árvore de acessibilidade perde a lista. */
    cargos[l.id] = document.createElement('ul');
    cargos[l.id].className = 'globo-cargos';
    cargos[l.id].setAttribute('role', 'list');
    cargos[l.id].hidden = true;
    carta.appendChild(cargos[l.id]);
  });
  [...lista.querySelectorAll('.xp-job')].forEach((job) => {
    const emp = (job.querySelector('.xp-company') || {}).textContent || '';
    cargos[emp.trim().toLowerCase().startsWith('brav') ? 'bravend' : 'zincoligas'].appendChild(job);
  });

  lista.hidden = true;
  raiz.hidden = false;
  /* A seção só vira cena quando o globo realmente subiu. Todo o CSS de
     palco preso, pintura de borda a borda e pista de rolagem pende desta
     classe — sem JS nada disso existe e a lista continua uma seção
     comum, com o fundo escuro de sempre. */
  const secao = raiz.closest('#experiencia');
  if (secao) secao.classList.add('xp-cena');

  /* ---------- a malha ---------- */
  const aneis = TERRA.split('|').map((anel) => {
    let x = 0, y = 0;
    return anel.split(' ').map((par) => {
      const [dx, dy] = par.split('.');
      x += parseInt(dx, 36); y += parseInt(dy, 36);
      return [x / 2, y / 2];
    });
  });

  const rad = Math.PI / 180;

  /* ---------- as duas tintas ---------- */
  const texOce = new Image(), texTer = new Image();
  texOce.src = 'assets/globo/oceano.webp';
  texTer.src = 'assets/globo/terra.webp';
  const pronta = (im) => im.complete && im.naturalWidth > 0;

  /* ---------- sentido dos anéis ----------
     A malha vem com sentidos misturados e o preenchimento do canvas usa
     a regra nonzero, onde dois anéis sobrepostos de sentidos opostos se
     cancelam. Uma passada de área esférica com sinal põe todos no mesmo
     sentido. Ganho pequeno e medido (IoU 0,9419 para 0,9442), mas é o
     tipo de coisa que só aparece numa vista específica. */
  function areaAnel(anel) {
    let s = 0;
    for (let i = 0, n = anel.length; i < n; i++) {
      const a = anel[i], b = anel[(i + 1) % n];
      let dl = (b[0] - a[0]) * rad;
      while (dl > Math.PI) dl -= Math.PI * 2;
      while (dl < -Math.PI) dl += Math.PI * 2;
      s += dl * (2 + Math.sin(a[1] * rad) + Math.sin(b[1] * rad));
    }
    return s / 2;
  }
  for (const anel of aneis) if (areaAnel(anel) < 0) anel.reverse();

  /* ---------- câmera ----------
     Só rotação. O zoom saiu: as duas cidades ficam a 25 km uma da outra,
     o que na esfera inteira dá meio pixel, e nem no zoom máximo elas se
     separavam de um jeito que valesse a roda do mouse. Quem escolhe a
     empresa são as abas, que funcionam no teclado e no toque. */
  /* ---------- orientação ----------
     Era um par lon/lat de câmera, com a latitude travada em ±85. A trava
     não era capricho: em ângulos de Euler, passando de 90 graus o mundo
     vira de cabeça para baixo e o arrasto horizontal passa a girar ao
     contrário — o clássico bloqueio de eixo. Destravar sem trocar a
     representação daria um globo que gira errado metade do tempo.

     Agora a orientação é uma MATRIZ 3x3 (mundo -> câmera) e o arrasto
     aplica uma rotação incremental em torno dos eixos da TELA: horizontal
     em torno do Y da tela, vertical em torno do X. Não há eixo
     privilegiado, não há polo, não há trava — o globo rola para qualquer
     lado e continua obedecendo à direção do gesto em qualquer posição.

     Nove números em linha, o suficiente para o que se faz aqui e sem a
     álgebra de quaternion que não seria usada. */
  const eixoX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  const eixoY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };

  function mul(A, B) {
    const R = new Array(9);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        R[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
      }
    }
    return R;
  }

  /* Multiplicar matriz milhares de vezes acumula erro e as linhas deixam
     de ser ortonormais — o globo iria entortando devagar. Gram-Schmidt
     nas duas primeiras linhas, terceira pelo produto vetorial: uma dúzia
     de operações por quadro e o problema não existe. */
  function ortonormaliza(M) {
    let ax = M[0], ay = M[1], az = M[2];
    let m = Math.hypot(ax, ay, az) || 1;
    ax /= m; ay /= m; az /= m;
    let bx = M[3], by = M[4], bz = M[5];
    const d = ax * bx + ay * by + az * bz;
    bx -= ax * d; by -= ay * d; bz -= az * d;
    m = Math.hypot(bx, by, bz) || 1;
    bx /= m; by /= m; bz /= m;
    return [
      ax, ay, az,
      bx, by, bz,
      ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx,
    ];
  }

  function gira(M, angX, angY) {
    return ortonormaliza(mul(mul(eixoX(angY), eixoY(angX)), M));
  }

  // O ponto (-46,5, -18) no centro: Rx(lat) . Ry(-lon) leva ele a (0,0,1).
  let M = mul(eixoX(-18 * Math.PI / 180), eixoY(46.5 * Math.PI / 180));
  let sel = null, hover = null;

  /* ---------- as medidas do aro ----------
     Tiradas do arquivo, não de tentativa e erro. O círculo interno tem
     raio = altura/3,503 e seu centro fica a 39,33% da altura, então o
     conjunto ocupa 1,378 raio ACIMA do centro da esfera e 2,125 ABAIXO
     (a base é o que desce). Em largura são 2,799 raios (760x951). */
  const ARO_ALT = 3.503, ARO_LARG = 2.799, ARO_ACIMA = 1.378, ARO_ABAIXO = 2.125;
  const RESPIRO = 6;

  /* O raio da esfera, que é também o raio de projeção agora que não há
     zoom. Sai das DUAS dimensões da caixa, não de min(w,h) vezes uma
     constante: com a constante o conjunto usava 91% da altura e só 73%
     da largura, e ainda por cima o pé da base era cortado — com a esfera
     centrada em h/2 a base precisava de 2,125 raios abaixo, mais do que
     a metade disponível. Agora o conjunto é ancorado pelo pé. */
  function raio() {
    return Math.max(10, Math.min(
      (cv.height - RESPIRO * 2) / ARO_ALT,
      (cv.width - RESPIRO * 2) / ARO_LARG
    ));
  }

  /* O centro da ESFERA, que não é o centro do canvas: o conjunto se
     apoia pelo pé, como um globo de mesa apoia. */
  function centroY() { return cv.height - RESPIRO - ARO_ABAIXO * raio(); }

  /* Direção do ponto no espaço da câmera, com |(x,y,z)| = 1. z > 0 é o
     hemisfério virado para quem olha. Separada da projeção porque o
     recorte da terra precisa do vetor, não só do ponto na tela. */
  function dir(lon, lat) {
    const p = lat * rad, l = lon * rad;
    const cp = Math.cos(p);
    // o ponto no espaço do MUNDO, eixo polar em Y
    const wx = cp * Math.sin(l), wy = Math.sin(p), wz = cp * Math.cos(l);
    return [
      M[0] * wx + M[1] * wy + M[2] * wz,
      M[3] * wx + M[4] * wy + M[5] * wz,
      M[6] * wx + M[7] * wy + M[8] * wz,
    ];
  }

  function proj(lon, lat) {
    const [x, y, z] = dir(lon, lat);
    if (z < 0) return null;
    const R = raio();
    return [cv.width / 2 + R * x, centroY() - R * y, z];
  }

  /* ---------- a tinta, através do recorte ----------
     A textura é um retalho, não um mapa: ela cobre o disco e desliza um
     pouco com a rotação para parecer presa à esfera. O que carrega a
     geografia é o recorte, não a imagem. */
  /* Um retalho só, nunca ladrilhado — e é por isso que não há emenda.

     O caminho até aqui: o deslizamento antigo era linear na longitude e
     percorria um lado inteiro do retalho a cada volta, então precisava de
     cópias vizinhas para não abrir buraco. Ladrilhar uma textura que não
     é sem-costura põe a borda direita encostada na esquerda, e as
     pinceladas ficam cortadas numa linha vertical — a faixa que aparecia
     no meio do oceano. Espelhar ladrilho sim, ladrilho não fazia as
     bordas casarem, mas trocava o corte por um eixo de simetria bem
     visível, com pinceladas em borboleta.

     A saída é não precisar de vizinho. O retalho tem 2,9 raios de lado e
     o disco tem 2, então sobram 0,45 raio de folga de cada lado: se o
     deslizamento ficar dentro dessa folga, um único desenho cobre o disco
     em qualquer posição. Por isso ele é um seno da rotação com amplitude
     de 0,38 raio em vez de uma rampa sem fim — a tinta continua andando
     com o giro, agora sem emenda possível. */
  function tinta(im, cx, cy, R, desliza) {
    const lado = R * 2.9;
    const amp = R * 0.38 * desliza;
    /* O deslize saía de sen(lon) e sen(lat) da câmera, que não existem
       mais. Sai agora de onde o polo norte do mundo caiu na tela: são as
       duas primeiras coordenadas de (0,1,0) depois da matriz, já dentro
       de [-1,1], então o retalho continua sem descobrir o disco. */
    const dx = -M[1] * amp;
    const dy = M[4] * amp * 0.6;
    ctx.drawImage(im, cx + dx - lado / 2, cy + dy - lado / 2, lado, lado);
  }

  /* ---------- o recorte da terra ----------
     Um continente que passa por trás do globo dá um anel ABERTO, e é daí
     que vinham os cortes. Duas tentativas erradas, nesta ordem:

     1. Pular os pontos de z < 0 e fechar o que sobrou. Fechar anel aberto
        liga a última costa visível à primeira em LINHA RETA: dava a fatia
        reta na borda e, em anel grande, uma cunha atravessando o disco.

     2. Projetar o ponto de trás no limbo, normalizando (x, y). Contínuo,
        mas pior: dois pontos escondidos consecutivos podem cair em
        ângulos distantes do limbo, e a reta entre eles corta o disco
        inteiro — virou uma faixa diagonal de terra em metade da esfera.

     O certo é fechar pelo ARCO do limbo, não por reta. Cada anel vira um
     ou mais trechos visíveis, cada um começando e terminando num ponto de
     cruzamento (interpolação onde z = 0, que cai exatamente sobre o
     círculo); o fecho entre a saída de um trecho e a entrada do próximo é
     um arco do próprio limbo.

     O fecho é sempre o arco CURTO entre a saída de um trecho e a entrada
     do seguinte. Isso não é palpite: comparei as três hipóteses (sempre
     horário, sempre anti-horário, curto) contra a verdade — os anéis
     rasterizados em equiretangular e projetados de volta no disco — em
     sete câmeras. Interseção sobre união:

       fecho por corda (o jeito antigo)   média 0,76   pior 0,31
       arco sempre num sentido só         média 0,50   pior —
       arco curto                         média 0,94   pior 0,90

     O pior caso do jeito antigo, 0,31, cai justamente na vista sobre o
     Pacífico norte, que era onde a cunha aparecia. */
  function cruzaLimbo(a, b) {
    // a e b em lados opostos: o t onde z zera dá um vetor de z exatamente
    // zero, e normalizado ele cai sobre o círculo do limbo.
    const t = a[2] / (a[2] - b[2]);
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const m = Math.hypot(x, y) || 1;
    return [x / m, y / m];
  }

  function caminhoTerra(cx, cy) {
    const E = raio();
    // ângulo no sistema do canvas, que tem o y para baixo
    const ang = (v) => Math.atan2(-v[1], v[0]);

    ctx.beginPath();
    for (const anel of aneis) {
      const n = anel.length;
      const d = new Array(n);
      let vis = 0;
      for (let i = 0; i < n; i++) {
        d[i] = dir(anel[i][0], anel[i][1]);
        if (d[i][2] >= 0) vis++;
      }
      if (!vis) continue;

      if (vis === n) {
        ctx.moveTo(cx + E * d[0][0], cy - E * d[0][1]);
        for (let i = 1; i < n; i++) ctx.lineTo(cx + E * d[i][0], cy - E * d[i][1]);
        ctx.closePath();
        continue;
      }

      const trechos = [];
      for (let i = 0; i < n; i++) {
        const j0 = (i + 1) % n;
        if (!(d[i][2] < 0 && d[j0][2] >= 0)) continue;
        const entrada = cruzaLimbo(d[i], d[j0]);
        const pontos = [];
        let j = j0;
        while (d[j][2] >= 0) { pontos.push(d[j]); j = (j + 1) % n; }
        trechos.push({ entrada, pontos, saida: cruzaLimbo(d[(j - 1 + n) % n], d[j]) });
      }
      if (!trechos.length) continue;

      ctx.moveTo(cx + E * trechos[0].entrada[0], cy - E * trechos[0].entrada[1]);
      for (let r = 0; r < trechos.length; r++) {
        const tr = trechos[r];
        for (const q of tr.pontos) ctx.lineTo(cx + E * q[0], cy - E * q[1]);
        ctx.lineTo(cx + E * tr.saida[0], cy - E * tr.saida[1]);

        // O arco CURTO entre a saída e a próxima entrada. Direção fixa
        // não serve: um anel só (a massa Eurásia-África) chega a ter seis
        // trechos visíveis numa vista, e o fecho certo alterna de lado
        // entre eles — medindo, quatro pediam ~2° para um lado e dois
        // ~35° para o outro.
        const a0 = ang(tr.saida);
        const a1 = ang(trechos[(r + 1) % trechos.length].entrada);
        let volta = a1 - a0;
        while (volta > Math.PI) volta -= Math.PI * 2;
        while (volta < -Math.PI) volta += Math.PI * 2;
        ctx.arc(cx, cy, E, a0, a1, volta < 0);
      }
      ctx.closePath();
    }
  }

  /* O fio de costa é outro caminho: aqui o ponto escondido tem de sumir
     mesmo, senão o traço desenharia a borda inteira do disco toda vez que
     um continente passasse por trás. Traço aberto não inventa corda. */
  function contornoTerra(cx, cy) {
    const E = raio();
    ctx.beginPath();
    for (const anel of aneis) {
      let abriu = false;
      for (const [lon, lat] of anel) {
        const [x, y, z] = dir(lon, lat);
        if (z < 0) { abriu = false; continue; }
        const px = cx + E * x, py = cy - E * y;
        if (!abriu) { ctx.moveTo(px, py); abriu = true; } else ctx.lineTo(px, py);
      }
    }
  }

  /* ---------- o quadro ---------- */
  const aro = new Image();
  aro.src = 'assets/globo/aro.webp';

  function desenha() {
    const W = cv.width, H = cv.height, R = raio();
    const cx = W / 2, cy = centroY();
    ctx.clearRect(0, 0, W, H);

    // halo de atmosfera, por fora do disco
    const ar = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.14);
    ar.addColorStop(0, 'rgba(140, 190, 232, 0.26)');
    ar.addColorStop(1, 'rgba(140, 190, 232, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.14, 0, Math.PI * 2);
    ctx.fillStyle = ar;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    if (pronta(texOce)) {
      tinta(texOce, cx, cy, R, 1);
    } else {
      // enquanto a tinta não chega, a esfera lisa segura o lugar
      const oce = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      oce.addColorStop(0, '#2f7fb8');
      oce.addColorStop(1, '#0d3055');
      ctx.fillStyle = oce;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    }

    // a terra: mesmo recorte de sempre, mas preenchido com tinta
    caminhoTerra(cx, cy);
    if (pronta(texTer)) {
      ctx.save();
      ctx.clip();
      tinta(texTer, cx, cy, R, 1);
      ctx.restore();
      // fio de costa, para a terra não flutuar sobre o mar
      contornoTerra(cx, cy);
      ctx.strokeStyle = 'rgba(34, 46, 16, 0.45)';
      ctx.lineWidth = Math.max(1, R * 0.005);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#5d7a2e';
      ctx.fill();
    }
    ctx.restore();

    // sombra de volume na borda
    const lim = ctx.createRadialGradient(cx, cy, R * 0.66, cx, cy, R);
    lim.addColorStop(0, 'rgba(0,0,0,0)');
    lim.addColorStop(1, 'rgba(4, 12, 22, 0.5)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = lim;
    ctx.fill();

    // O aro e a base, por cima. As três constantes saíram de medir o
    // próprio arquivo, não de tentativa e erro: o círculo interno do aro
    // tem raio = altura/3.503, e seu centro fica a 39,33% da altura e a
    // 50,07% da largura. Com isso a esfera encaixa no vão exatamente.
    if (aro.complete && aro.naturalWidth) {
      const ah = R * ARO_ALT;
      const aw = ah * (aro.naturalWidth / aro.naturalHeight);
      ctx.drawImage(aro, cx - aw * 0.5007, cy - ah * 0.3933, aw, ah);
    }

    /* Os pinos, com o selecionado por último.

       Sem zoom os dois endereços viraram definitivamente o mesmo ponto —
       25 km num globo de 155px de raio dão meio pixel. Desenhando na
       ordem do array, o segundo cobria o primeiro e o realce do
       selecionado ficava invisível metade das vezes. */
    const ordem = [...LUGARES].sort((a, b) => (a.id === sel ? 1 : 0) - (b.id === sel ? 1 : 0));
    ordem.forEach((l) => {
      const p = proj(l.lon, l.lat);
      // O ponto pode cair fora do disco: ali ele está atrás do aro, não
      // deve ser desenhado nem clicado.
      l._xy = p && Math.hypot(p[0] - cx, p[1] - cy) <= R ? p : null;
      if (!l._xy) return;
      const ativo = sel === l.id, sob = hover === l.id;
      const r = ativo ? 8 : sob ? 7 : 5.5;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r + 5, 0, Math.PI * 2);
      ctx.fillStyle = ativo ? 'rgba(255, 236, 170, 0.34)' : 'rgba(255,255,255,0.16)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      ctx.fillStyle = ativo ? '#ffe9a3' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(28, 16, 8, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  /* ---------- seleção ---------- */
  function seleciona(id) {
    sel = id;
    const l = LUGARES.find((x) => x.id === id);
    if (l) {
      titulo.textContent = l.nome;
      // Lugar e contagem na mesma linha: a folha encolheu e cada linha
      // que some é uma linha de cargo que aparece sem rolar.
      const n = cargos[id].childElementCount;
      onde.textContent = l.cidade + ' · ' + n + (n === 1 ? ' cargo' : ' cargos');
    }
    abas.forEach((b) => {
      const on = b.dataset.globoAba === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
    });
    Object.keys(cargos).forEach((k) => { cargos[k].hidden = k !== id; });
    legenda.scrollTop = 0;
    mostraPagina(0, 0);
    desenha();
  }

  /* ---------- folhear ----------
     A empresa com três cargos rolava por dentro da folha. Rolagem dentro
     de um cartão que já está dentro de um palco preso é a terceira caixa
     de rolagem da mesma tela, e ninguém acha a barra num papel.

     Vira página: um cargo por vez, com as setas no pé como numeração. O
     que sobra de rolagem interna é só a rede de segurança de tela baixa,
     onde nem um cargo sozinho cabe — ali o esmaecido do pé continua
     valendo.

     Página escondida sai da árvore de acessibilidade junto (hidden, não
     opacidade): quem usa leitor de tela navega pelas setas, que são
     botões de verdade, e não tropeça em texto que não está na tela. */
  let pagina = 0;

  function paginasDe(id) {
    return [...cargos[id].children];
  }

  function mostraPagina(i, passo) {
    const pgs = paginasDe(sel);
    if (!pgs.length) return;
    pagina = Math.max(0, Math.min(pgs.length - 1, i));

    pgs.forEach((p, n) => {
      const atual = n === pagina;
      p.hidden = !atual;
      p.classList.remove('folheia-frente', 'folheia-tras');
      if (atual && passo && !reduced) {
        p.classList.add(passo > 0 ? 'folheia-frente' : 'folheia-tras');
      }
    });

    folhear.hidden = pgs.length < 2;
    contaFolha.textContent = (pagina + 1) + ' de ' + pgs.length;
    botoesFolha.forEach((b) => {
      const p = Number(b.dataset.folhearPasso);
      b.disabled = p < 0 ? pagina === 0 : pagina === pgs.length - 1;
    });
    marcaSobra();
  }

  botoesFolha.forEach((b) => b.addEventListener('click', () => {
    const p = Number(b.dataset.folhearPasso);
    mostraPagina(pagina + p, p);
  }));

  /* Setas do teclado com o foco na folha: é o gesto que a pessoa tenta
     antes de procurar o botão. */
  legenda.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (paginasDe(sel).length < 2) return;
    e.preventDefault();
    const p = e.key === 'ArrowRight' ? 1 : -1;
    mostraPagina(pagina + p, p);
  });

  /* ---------- a folha tem um tamanho só ----------
     O papel não pode mudar de tamanho ao trocar de empresa: a Bravend tem
     um cargo e a Zincoligas três, e a folha saltava de altura a cada
     clique na aba. Então ela é travada na altura do grupo de referência —
     o primeiro — e quem não couber rola por dentro, que é o que já
     acontecia com a Zincoligas.

     A altura é MEDIDA, não escrita à mão: depende da largura do cartão,
     do tamanho da fonte e de quantas linhas o texto quebra, e nada disso
     é constante entre 1024 e 1920. Mede-se mostrando o grupo de
     referência por um instante, dentro do mesmo quadro, e devolvendo o
     grupo que estava. O max-height do CSS continua valendo como teto: em
     tela baixa a folha para nele e aí nem a referência cabe inteira.

     Só no palco largo. No telefone a folha está no fluxo normal e travar
     altura ali criaria rolagem aninhada dentro da página. */
  const REF = LUGARES[0].id;
  const telaLarga = window.matchMedia('(min-width: 1000px)');

  function fixaAltura() {
    legenda.style.height = '';
    if (!telaLarga.matches) { marcaSobra(); return; }

    /* O pior caso é MEDIDO, não deduzido: percorre cada empresa e cada
       página e fica com a maior. Deduzir dava errado — o cargo mais alto
       é o da empresa de uma página só, que não mostra o rodapé de
       folhear, então a conta "mais alto + rodapé" não corresponde a
       nenhum estado real e sobrava papel em branco. */
    const estavaEmpresa = sel;
    const estavaPagina = pagina;
    let alvo = 0;
    for (const id of Object.keys(cargos)) {
      Object.keys(cargos).forEach((c) => { cargos[c].hidden = c !== id; });
      const pgs = [...cargos[id].children];
      folhear.hidden = pgs.length < 2;
      for (let i = 0; i < pgs.length; i++) {
        pgs.forEach((p, n) => { p.hidden = n !== i; });
        alvo = Math.max(alvo, legenda.offsetHeight);
      }
    }
    Object.keys(cargos).forEach((c) => { cargos[c].hidden = c !== estavaEmpresa; });
    pagina = estavaPagina;
    mostraPagina(pagina, 0);

    legenda.style.height = alvo + 'px';
    marcaSobra();
  }

  /* A folha rola por dentro quando a empresa tem três cargos. Sem aviso
     ela termina numa borda de papel e parece completa — daí a classe, que
     acende o esmaecido no pé. Sai quando chega ao fim, senão o aviso
     mente. */
  function marcaSobra() {
    const sobra = legenda.scrollHeight - legenda.clientHeight;
    const fim = legenda.scrollTop >= sobra - 2;
    /* 28 e não 0: medindo, a folha da Bravend sobra 12px de padding do
       pé mesmo cabendo inteira, e o aviso acendia mentindo que havia
       mais cargo embaixo. Abaixo de uma linha de texto não há o que
       avisar. */
    const rola = sobra > 28;
    legenda.classList.toggle('tem-mais', rola && !fim);
    /* Os únicos focáveis da folha são as duas abas, e elas ficam ACIMA
       da parte que rola: sem isto, os outros dois cargos da Zincoligas
       são inalcançáveis por teclado. Com tabindex a própria folha vira
       parada de foco e as setas rolam. Sai quando cabe inteira, para não
       inventar uma parada de foco sem função. */
    if (rola) legenda.setAttribute('tabindex', '0');
    else legenda.removeAttribute('tabindex');
  }

  function achaPino(mx, my) {
    for (const l of LUGARES) {
      if (!l._xy) continue;
      if (Math.hypot(mx - l._xy[0], my - l._xy[1]) < 18) return l.id;
    }
    return null;
  }

  /* ---------- interação ----------
     Soltar o globo depois de um arrasto não para o giro: a velocidade do
     gesto vira velocidade angular e vai morrendo no atrito, como um globo
     de mesa de verdade.

     ATRITO é por quadro de 16,7ms, e o expoente dt/16,7 na hora de
     aplicar torna isso independente da taxa de quadros — em 120Hz o
     globo tem de parar no mesmo tempo que em 60Hz, não no dobro.

     Com 0,975 a constante de tempo é 16,7 / -ln(0,975) = 660ms, então um
     empurrão forte (0,4 grau/ms) percorre ~264 graus antes de parar:
     quase uma volta, que é o que dá a sensação de peso sem virar
     roleta. */
  let arrastando = false, ax = 0, ay = 0, moveu = 0;
  let vLon = 0, vLat = 0, tMov = 0;
  const ATRITO = 0.975;
  const V_MAX = 0.5;     // graus por ms
  const V_PARA = 0.0006; // abaixo disto o movimento não se vê
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)];
  };

  cv.addEventListener('pointerdown', (e) => {
    arrastando = true; moveu = 0;
    // pegar o globo no meio do giro para ele na hora, como a mão faria
    vLon = 0; vLat = 0;
    tMov = 0;
    [ax, ay] = pos(e);
    cv.setPointerCapture(e.pointerId);
  });

  cv.addEventListener('pointermove', (e) => {
    const [mx, my] = pos(e);
    if (arrastando) {
      const dx = mx - ax, dy = my - ay;
      moveu += Math.abs(dx) + Math.abs(dy);
      const k = 0.2;
      const dLon = dx * k, dLat = dy * k;
      M = gira(M, dLon * rad, dLat * rad);

      /* Velocidade suavizada, não a do último evento: um único
         pointermove trêmulo no fim do gesto mandaria o globo para
         qualquer lado. 0,65 de memória contra 0,35 do instante segue o
         gesto sem copiar o tremor. */
      const agora = e.timeStamp || performance.now();
      const dt = tMov ? Math.min(64, Math.max(4, agora - tMov)) : 16.7;
      tMov = agora;
      vLon = vLon * 0.65 + (dLon / dt) * 0.35;
      vLat = vLat * 0.65 + (dLat / dt) * 0.35;

      ax = mx; ay = my;
      desenha();
      return;
    }
    const h = achaPino(mx, my);
    if (h !== hover) { hover = h; cv.style.cursor = h ? 'pointer' : 'grab'; desenha(); }
  });

  cv.addEventListener('pointerup', (e) => {
    if (!arrastando) return;
    arrastando = false;

    /* Segurar parado e soltar não pode lançar. Sem move não chega evento,
       então a velocidade fica congelada no último gesto — bastava parar a
       mão um instante antes de soltar para o globo sair voando sozinho.
       Passados 90ms sem movimento, o gesto acabou. */
    const agora = e.timeStamp || performance.now();
    if (!tMov || agora - tMov > 90) { vLon = 0; vLat = 0; }

    // teto para o empurrão violento não virar roleta
    const v = Math.hypot(vLon, vLat);
    if (v > V_MAX) { vLon *= V_MAX / v; vLat *= V_MAX / v; }

    if (moveu < 6) {
      vLon = 0; vLat = 0;
      const [mx, my] = pos(e);
      const id = achaPino(mx, my);
      if (id) seleciona(id);
    }
  });
  cv.addEventListener('pointercancel', () => {
    // gesto cancelado pelo navegador não é arremesso
    arrastando = false; vLon = 0; vLat = 0;
  });

  // As abas são botões de verdade: trocar de empresa não pode depender
  // de ponteiro nem de acertar um alvo de 16px numa esfera girando.
  abas.forEach((b) => b.addEventListener('click', () => seleciona(b.dataset.globoAba)));
  legenda.addEventListener('scroll', marcaSobra, { passive: true });
  /* Remedir, não só reavaliar: mudando a largura o texto rewrapa e a
     altura de referência muda junto. */
  window.addEventListener('resize', fixaAltura, { passive: true });
  telaLarga.addEventListener('change', fixaAltura);
  /* A medição do init sai errada e continua errada: no primeiro quadro a
     folha ainda não tem a fonte final nem a moldura de pergaminho, e a
     altura muda depois. Escutar 'load' não bastou — media certo e o
     esmaecido continuava aceso no telefone. ResizeObserver mede quando a
     caixa muda de verdade, seja por fonte, imagem, giro de tela ou troca
     de empresa, que é exatamente a pergunta aqui. */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(marcaSobra);
    ro.observe(legenda);
    ro.observe(carta);
  } else {
    window.addEventListener('load', marcaSobra);
  }

  /* ---------- tamanho ---------- */
  function redimensiona() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    // Só reescreve quando muda: escrever cv.width limpa o canvas e muda o
    // tamanho intrínseco do elemento, e sem a guarda o ResizeObserver
    // abaixo se realimentaria.
    if (w === cv.width && h === cv.height) return;
    cv.width = w;
    cv.height = h;
    desenha();
  }
  window.addEventListener('resize', redimensiona, { passive: true });

  /* A caixa do globo não muda só quando a janela muda: ela é o que sobra
     depois do cabeçalho, e o cabeçalho reflui quando a fonte carrega. Sem
     isto o globo ficava desenhado no tamanho do primeiro quadro. */
  if (window.ResizeObserver) new ResizeObserver(redimensiona).observe(cv);

  aro.onload = desenha;
  texOce.onload = desenha;
  texTer.onload = desenha;

  redimensiona();
  seleciona('bravend');
  fixaAltura();
  /* A primeira medição sai errada e continua errada se ninguém remedir: no
     primeiro quadro a folha ainda está com a fonte de sistema. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fixaAltura);

  /* O laço faz duas coisas, nesta ordem de prioridade: gastar a inércia
     de um arremesso e, quando não há arremesso nenhum e ninguém tocou no
     globo ainda, manter o giro de repouso.

     Um laço só e não dois: são o mesmo recurso — girar a matriz e
     redesenhar — e com dois rAF concorrentes o repouso somaria ao
     arremesso, deixando o globo com uma velocidade de fundo que nunca
     chega a zero.

     Nada disso existe para quem pediu menos movimento: sem repouso e sem
     inércia, o globo só anda enquanto o dedo anda. */
  if (!reduced) {
    let parado = false, ultimo = 0;
    cv.addEventListener('pointerdown', () => { parado = true; }, { once: true });
    const girar = (t) => {
      const dt = ultimo ? Math.min(64, t - ultimo) : 16.7;
      ultimo = t;
      if (!arrastando) {
        if (Math.abs(vLon) > V_PARA || Math.abs(vLat) > V_PARA) {
          // sem polo não há mais parede em que a componente vertical
          // possa bater: o arremesso corre até o atrito gastá-lo
          M = gira(M, vLon * dt * rad, vLat * dt * rad);
          const f = Math.pow(ATRITO, dt / 16.7);
          vLon *= f;
          vLat *= f;
          desenha();
        } else if (vLon || vLat) {
          vLon = 0; vLat = 0;
        } else if (!parado) {
          /* O repouso gira o MUNDO no próprio eixo, não a câmera: é a
             Terra rodando, então multiplica pela direita. */
          M = ortonormaliza(mul(M, eixoY(0.05 * (dt / 16.7) * rad)));
          desenha();
        }
      }
      requestAnimationFrame(girar);
    };
    requestAnimationFrame(girar);
  }
}
