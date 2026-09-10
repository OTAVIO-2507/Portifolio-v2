/* ============================================================
   Auditoria de contraste — cole no console do navegador
   ============================================================
   Não é carregado pela página. É ferramenta de verificação: o passo de
   remedir os pares toda vez que o chão de uma seção muda, que o
   PRODUCT.md exige, feito com número em vez de olho.

   Uso:  copie este arquivo inteiro, cole no console, rode `auditar()`.
         Repita em cada largura que importa (390, 760, 1440).

   O QUE ELE FAZ
   Percorre a página em passos de 80% da tela, e em cada parada mede todo
   texto visível contra o fundo que de fato está atrás dele. O fundo é
   resolvido subindo a árvore até achar uma cor opaca, compondo as
   camadas semitransparentes no caminho.

   O QUE ELE NÃO FAZ, E POR QUE
   Texto sobre chão pintado ele não mede — devolve na conta de
   `sobrePintura` e para por aí. Duas tentativas anteriores erraram
   exatamente aí e vale registrar como, porque o erro é convidativo:

     1. Amostrar a mediana de pixels DENTRO da caixa do texto. O logo do
        Docker dentro de um <li> devolvia verde-oliva como se fosse o
        chão, e num rótulo curto os próprios glifos ocupam área demais
        para a mediana escapar deles.

     2. Amostrar um anel FORA da caixa. Some o problema dos glifos, mas
        um botão creme sobre o ateliê escuro passa a ser medido contra o
        ateliê, e não contra o próprio botão.

   Fundo pintado só se mede com o olho na captura, um par por vez — e é
   assim que os pares do globo e do pergaminho foram medidos, com o
   número anotado no comentário ao lado da regra em sections.css.

   ARMADILHA QUE CUSTOU UMA RODADA
   `border-image` conta como chão pintado tanto quanto `background-image`.
   É como o pergaminho da experiência e a legenda do globo são
   desenhados. Sem essa checagem a auditoria acusava 24 falhas falsas —
   marrom escuro contra o preto da página — quando o texto estava, na
   verdade, sobre creme. */

function auditar({ passo = 0.8, verboso = false } = {}) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  const parse = (s) => {
    const m = s && s.match(/[\d.]+/g);
    return m ? { rgb: [+m[0], +m[1], +m[2]], a: m.length > 3 ? parseFloat(m[3]) : 1 } : null;
  };
  const compor = (frente, alfa, atras) => [0, 1, 2].map((i) => frente[i] * alfa + atras[i] * (1 - alfa));

  const fundoDe = (el) => {
    let n = el;
    const pilha = [];
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if ((cs.backgroundImage && cs.backgroundImage !== 'none') ||
          (cs.borderImageSource && cs.borderImageSource !== 'none')) return { pintura: true };
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { pilha.push(bg); if (bg.a >= 0.999) break; }
      n = n.parentElement;
    }
    // O chão final é o --bg do body; as camadas voltam de trás para frente.
    let base = [6, 6, 8];
    for (let i = pilha.length - 1; i >= 0; i--) base = compor(pilha[i].rgb, pilha[i].a, base);
    return { rgb: base, pintura: false };
  };

  const se = document.scrollingElement;
  const guardado = se.scrollTop;
  const falhas = [], justos = [];
  let sobrePintura = 0, aprovados = 0;
  const vistos = new Set();

  const varrer = () => {
    document.querySelectorAll('h1,h2,h3,h4,p,a,span,li,strong,button,time,small,label').forEach((e) => {
      // Só elementos que têm texto próprio: sem isso um <div> pai seria
      // medido com a cor dele e o texto do filho.
      if (e.children.length && ![...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) return;
      const t = e.textContent.trim();
      if (!t || t.length < 3) return;

      const r = e.getBoundingClientRect();
      if (r.width < 12 || r.height < 7 || r.top < 0 || r.bottom > innerHeight) return;

      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none') return;
      // Opacidade acumulada: um pai a 0 esconde o filho a 1. Elemento no
      // meio de uma revelação é pulado, não reprovado.
      let p = e, op = 1;
      while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; }
      if (op < 0.9) return;

      const chave = t.slice(0, 40) + '|' + Math.round(r.width);
      if (vistos.has(chave)) return;
      vistos.add(chave);

      const f = fundoDe(e);
      if (f.pintura) { sobrePintura++; return; }

      const c = parse(cs.color);
      if (!c || c.a < 0.05) return;
      const efetiva = c.a < 1 ? compor(c.rgb, c.a, f.rgb) : c.rgb;
      const cr = ratio(efetiva, f.rgb);

      const px = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight) || 400;
      const grande = px >= 24 || (px >= 18.66 && peso >= 700);
      const piso = grande ? 3 : 4.5;

      const reg = { texto: t.slice(0, 56), contraste: +cr.toFixed(2), piso, px: Math.round(px),
                    cor: cs.color, fundo: 'rgb(' + f.rgb.map(Math.round).join(',') + ')',
                    onde: e.className || e.tagName };
      if (cr < piso) falhas.push(reg);
      else { aprovados++; if (cr < piso + 1) justos.push(reg); }
    });
  };

  return (async () => {
    for (let y = 0; y < se.scrollHeight - innerHeight * 0.4; y += Math.round(innerHeight * passo)) {
      se.scrollTop = y;
      await new Promise((r) => setTimeout(r, 450));
      varrer();
    }
    se.scrollTop = guardado;

    falhas.sort((a, b) => a.contraste - b.contraste);
    justos.sort((a, b) => a.contraste - b.contraste);

    console.log('%c contraste em ' + innerWidth + 'px ', 'background:#5b74ff;color:#fff;font-weight:700');
    console.log(aprovados + ' pares acima do piso · ' + falhas.length + ' abaixo · ' +
                sobrePintura + ' sobre pintura (medir na captura, um a um)');
    if (falhas.length) console.table(falhas);
    else console.log('%cnenhum par abaixo do piso', 'color:#39d353');
    if (verboso && justos.length) { console.log('a menos de 1,0 do piso:'); console.table(justos); }

    return { aprovados, falhas, justos, sobrePintura };
  })();
}
