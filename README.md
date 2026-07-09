# Portfólio v2 — Otávio Oliveira

Portfólio pessoal reconstruído do zero como projeto multi-arquivo: HTML semântico, CSS organizado por camadas e JavaScript modular (ES Modules), sem frameworks.

**Ao vivo:** https://otavio-2507.github.io/Portifolio-v2/

## Estrutura

```
├── index.html          Conteúdo semântico (header, main, sections, footer)
├── css/
│   ├── base.css        Tokens de design, reset, fontes e tipografia base
│   ├── components.css  Botões, marquee, moldura de navegador, reveals
│   └── sections.css    Hero, sobre, projetos, GitHub, experiência, contato, rodapé
├── js/
│   ├── main.js         Ponto de entrada; navegação mobile e ano do rodapé
│   ├── hero.js         Título por letra, grade cintilante e blob 3D (Three.js)
│   ├── marquee.js      Fileiras infinitas de habilidades
│   ├── reveal.js       Animações de entrada na rolagem
│   ├── showcase.js     Tilt 3D, botões magnéticos, zoom, partículas, cursor
│   └── github.js       Calendário de contribuições + MODO JOGO
└── assets/             Ícones SVG, capturas em WebP, fonte Bropella, favicon
```

## Destaques técnicos

- **Progressive enhancement** — todo o conteúdo vive no HTML; o JavaScript só adiciona comportamento. Sem JS a página continua legível e navegável.
- **Three.js via ES Modules + import map** — o blob do hero é carregado dinamicamente da CDN; se falhar, o restante da página não é afetado.
- **Performance** — capturas em WebP (5,4 MB → ~0,2 MB), loops de canvas pausados fora da viewport via `IntersectionObserver`, animações somente com `transform`/`opacity`.
- **Acessibilidade** — HTML semântico, `prefers-reduced-motion` respeitado em todas as animações, foco visível, skip link e navegação mobile com ARIA.
- **Dados dinâmicos** — as contribuições do GitHub são buscadas em tempo real; ligue o **MODO JOGO** e atire nos quadradinhos.

## Rodando localmente

Os módulos ES exigem um servidor HTTP (não funciona via `file://`):

```bash
npx serve .
# ou
python -m http.server 8000
```

## Stack

HTML5 · CSS3 · JavaScript (ES2022) · Three.js · GitHub Contributions API
