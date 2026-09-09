// Rodapé: a subida.
//
// O painel fica sobreposto ao fim do conteúdo por uma margem negativa e é
// empurrado de volta para baixo por --rise. Em 1 ele está fora da tela e
// os últimos cargos aparecem inteiros; em 0 subiu por cima deles.
//
// Por que o deslocamento é diferencial: na referência o fundo fica preso
// e o painel anda 1:1, então existe movimento relativo. Reproduzir aquilo
// aqui exigia inserir uma tela só para servir de fundo, e isso virava um
// vão morto de rolagem antes do rodapé. Sem nada congelado, o painel
// precisa andar mais rápido que a página para que a subida se leia.
//
// Laço próprio em vez do criarScrollSuave: aquele interpola para os
// efeitos que precisam de atraso, e aqui o valor tem de acompanhar a
// rolagem sem defasagem.
//
// Sem este script --rise fica em 0 e o rodapé aparece no lugar certo,
// inteiro: a subida é enriquecimento, nunca requisito.

function initFooter({ reduced }) {
  const footer = document.querySelector('.footer');
  if (!footer || reduced) return;

  let raf = null;
  let ultimo = -1;

  const pintar = () => {
    raf = null;
    const eixo = document.scrollingElement || document.documentElement;
    const vh = window.innerHeight;

    // O curso é o que falta para o fim da página: uma tela cheia antes do
    // fim o painel está todo fora, no fim está assentado.
    const restante = eixo.scrollHeight - eixo.clientHeight - eixo.scrollTop;
    const curso = vh * 1.35;
    const p = Math.max(0, Math.min(1, restante / Math.max(1, curso)));

    // Só escreve quando muda de verdade: setProperty em elemento com
    // subárvore recalcula estilo dos filhos, e isto roda na rolagem.
    const v = Math.round(p * 1000) / 1000;
    if (v === ultimo) return;
    ultimo = v;
    footer.style.setProperty('--rise', v);
  };

  const agendar = () => {
    if (raf == null) raf = requestAnimationFrame(pintar);
  };

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  pintar();
}
