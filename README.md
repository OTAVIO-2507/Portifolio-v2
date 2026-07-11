<div align="center">

# Portfólio v2

Portfólio pessoal reconstruído do zero como projeto multi-arquivo: HTML semântico, CSS organizado por camadas e JavaScript modular, com hero 3D em Three.js e calendário de contribuições do GitHub em tempo real.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)

[![Demonstração online](https://img.shields.io/badge/demonstra%C3%A7%C3%A3o-online-2EA44F?style=flat-square)](https://otavio-2507.github.io/Portifolio-v2/)

</div>

## Visão geral

Segunda versão do meu portfólio, reescrita sem frameworks com foco em arquitetura, performance e acessibilidade. Todo o conteúdo vive no HTML e o JavaScript apenas adiciona comportamento (progressive enhancement): sem JS a página continua legível e navegável. O visual segue um tema escuro com acento azul, hero 3D interativo e uma vitrine de projetos com efeitos de profundidade controlados por scroll e mouse.

## Funcionalidades

- Hero com blob 3D deformado por ruído (Three.js) que reage ao mouse, sobre grade de pixels cintilantes
- Marquee infinito de habilidades com ícones das tecnologias
- Vitrine de projetos com cards sticky, tilt 3D, brilho dinâmico, botões magnéticos e cursor customizado
- Calendário de contribuições do GitHub em tempo real, com modo jogo (nave que atira nos quadradinhos)
- Animações de entrada na rolagem e navegação mobile com ARIA
- `prefers-reduced-motion` respeitado em todas as animações
- Loops de canvas pausados fora da viewport via `IntersectionObserver`
- Imagens em WebP e Three.js carregado sob demanda via CDN, com fallback gracioso

## Tecnologias

| Tecnologia | Aplicação no projeto |
| --- | --- |
| HTML5 | Conteúdo semântico completo, sem estilos inline |
| CSS3 | Tokens de design, componentes e seções em camadas separadas |
| JavaScript (ES Modules) | Módulos independentes por comportamento |
| Three.js | Blob 3D do hero com shaders customizados (import map + CDN) |
| Canvas API | Grade cintilante, partículas de fundo e modo jogo |
| GitHub Contributions API | Dados reais de contribuições no calendário |

## Como executar

Os módulos ES exigem um servidor HTTP (não funciona via `file://`):

```bash
git clone https://github.com/OTAVIO-2507/Portifolio-v2.git
cd Portifolio-v2
npx serve .
# ou
python -m http.server 8000
```

## Estrutura do projeto

```
Portifolio-v2/
├── index.html          Conteúdo semântico (header, main, sections, footer)
├── css/
│   ├── base.css        Tokens de design, reset, fontes e tipografia base
│   ├── components.css  Botões, marquee, reveals
│   └── sections.css    Hero, sobre, projetos, GitHub, experiência, contato
├── js/
│   ├── main.js         Ponto de entrada; navegação mobile e ano do rodapé
│   ├── hero.js         Título por letra, grade cintilante e blob 3D
│   ├── marquee.js      Fileiras infinitas de habilidades
│   ├── reveal.js       Animações de entrada na rolagem
│   ├── showcase.js     Tilt 3D, botões magnéticos, zoom, partículas, cursor
│   └── github.js       Calendário de contribuições + modo jogo
└── assets/             Ícones SVG, capturas em WebP, fonte Bropella, favicon
```
