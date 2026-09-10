# Product

## Register

brand

## Users

Recrutadores, tech leads e clientes em potencial avaliando o Otávio para
vagas de estágio/júnior full stack ou projetos. Chegam pelo GitHub,
LinkedIn ou indicação, gastam 1–3 minutos e decidem se abrem o currículo
ou mandam mensagem. Muitos olham pelo celular.

## Product Purpose

Portfólio pessoal de página única (HTML/CSS/JS puros, sem frameworks).
O site É a prova de competência: arquitetura, performance, acessibilidade
e acabamento contam como demonstração técnica. Sucesso = contato por
e-mail/LinkedIn e recrutador convencido de que o código dele entrega.

## Brand Personality

Preciso, técnico, artesanal. Sóbrio e denso em detalhe — engenheiro que
domina o ofício e mostra isso no acabamento, não em adjetivos. O toque
humano vem dos textos em primeira pessoa, diretos, em PT-BR, e da tinta
a óleo que serve de chão às seções: a mão aparece na pintura, não numa
fonte que imita caligrafia.

## Anti-references

- Cara de "site feito por IA": rótulo em caixa alta genérico repetido em
  toda seção (o problema é o rótulo que não diz nada, não a caixa alta em
  si — um kicker que nomeia a empresa é informação), cartão de CTA
  centrado com gradiente radial e grade de pontos, rodapé SaaS de 4
  colunas com links falsos, copy genérica tipo "Vamos construir juntos".
- Tipografia gigante em caixa alta sobre fundo escuro com um acento só,
  metadados em monoespaçada e réguas de 1px por toda parte: é o preset
  de "portfólio dev" e tem nome de catálogo (exaggerated-minimalism).
- Template de portfólio dev: chips de skills infinitos, gradient text,
  glassmorphism decorativo.
- Nada de prometer o que não existe (links mortos, PDF fantasma).

## Design Principles

1. **O site é a prova.** Cada detalhe de acabamento é argumento de
   contratação; bug visual é bug de currículo.
2. **Preciso > enfeitado.** Efeito só quando comunica (profundidade,
   hierarquia); zero ornamento gratuito.
3. **Voz própria, não gramática de template.** Padrões repetidos por
   reflexo (eyebrow, CTA-card, footer-grid) são substituídos por
   composições específicas deste site.
4. **Conteúdo verdadeiro.** Datas, links e textos reais; nunca inventar
   empresa, número ou promessa.
5. **Acessível por padrão.** prefers-reduced-motion respeitado, contraste
   AA, navegação por teclado íntegra. Piso de contraste é relativo ao
   fundo: toda vez que o chão de uma seção muda, os pares se remedem.
6. **A página é uma sequência de ambientes.** Seções podem ter chão
   próprio, sangrando de borda a borda, em vez de tudo correr sobre a
   mesma superfície preta. Dentro delas o desenho é de painel — massa,
   raio generoso, peso tipográfico — e não de régua de 1px.

## Referência visual

[wishlabs.ai](https://www.wishlabs.ai) é a referência de linguagem, e não
só do hero: a paisagem em camadas de `assets/Parallax` vem de lá, o acento
`#5b74ff` é vizinho do periwinkle `#728BF3` deles, e a seção de
experiência segue a gramática de ambiente + painel + peso misturado
dentro da frase. O que **não** se importa de lá: o chão creme `#FAF7F0`.
Aqui o site é escuro; os ambientes se distinguem por matiz, não por
claridade.

## Accessibility & Inclusion

WCAG AA como piso: contraste 4.5:1 em texto corrente, foco visível,
ARIA na navegação mobile, `prefers-reduced-motion` com alternativas de
fade sem deslocamento. Canvas/efeitos pausam fora da viewport.
