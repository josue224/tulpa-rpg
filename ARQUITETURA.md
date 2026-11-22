# ARQUITETURA — TULPA RPG (modular)

O antigo `index.html` (um arquivo de ~3,2 MB / 23.611 linhas) foi **fatiado sem alterar uma linha de código**: cada arquivo abaixo é um trecho contíguo e exato do original. A coluna "Linhas orig." diz de onde cada trecho veio (útil para localizar referências antigas como "linha 7745").

Roda direto no GitHub Pages (`usuario.github.io/tulpa-rpg/`): sem bundler, sem build, sem `type="module"`, caminhos relativos (`css/…`, `js/…`).

## Regras que NÃO podem ser quebradas

1. **A ordem das tags `<script>` e `<link>` no `index.html` é a ordem de execução original.** Não reordene, não pule arquivo, não adicione `defer`/`async`/`type="module"`.
2. **`js/09` até `js/61` são pedaços consecutivos do antigo script único `<script id="tulpa-etapa3">`**, que era um IIFE gigante `(()=>{ … })();`. O invólucro `(()=>{` / `})();` foi removido (era o que impedia dividir). Consequência: tudo que antes era privado desse closure (`const E`, `T3`, `CB`, `ACH`, `function performAttack…`) agora é **escopo global compartilhado** entre esses arquivos — exatamente como era entre as "Etapas" dentro do closure.
3. **Não declare no topo de um arquivo um nome que já exista em outro** (`const`/`let`/`class` repetido dá `SyntaxError: Identifier … has already been declared` e derruba o arquivo inteiro). Antes de criar um nome de topo novo: `grep -rn "const NOME\b\|function NOME\b" js/`.
4. **`js/61-init.js` tem que ser o ÚLTIMO.** Ele completa `T3` e dispara `initTheme / renderSheetTabs / initNav / initPerseus / render`. Código novo de Etapa entra num arquivo novo **antes** dele (ex.: `js/60b-etapa60-xxx.js`) e ganha uma `<script>` na posição certa.
5. Funções de um arquivo podem chamar funções de arquivos **posteriores** (eram içadas dentro do closure), mas **só depois que tudo carregou** (eventos, timers, cliques). Não execute isso no topo do arquivo, no momento do carregamento.
6. O padrão do projeto de "encadear" funções (`const _x=fn; fn=function(){…_x()…}`) continua válido: ele reatribui o binding global.

## Cache (importante no GitHub Pages)

O Pages manda os arquivos com cache de ~10 min. Como os arquivos agora dependem uns dos outros, um visitante poderia receber um `js/20` novo com um `js/22` antigo. Por isso todo `src`/`href` local leva `?v=20261122p`. **A cada deploy que mude qualquer arquivo, troque o token em todas as tags:**

```bash
sed -i 's/?v=[^"]*"/?v=NOVO_TOKEN"/g' index.html   # ex.: NOVO_TOKEN = 20261123a
```

(O `<meta name="tulpa-build">` do `<head>` continua como estava; atualize-o à parte, se quiser.)

## Ordem de carregamento (resumo)

```
<head>   css/01-base-layout.css  →  supabase-js (CDN)
<body>   markup (portal, app, modais)  →  scripts/CSS intercalados na MESMA posição dos blocos originais:
         js/01 → js/02 → css/02 → js/03 → css/03 → js/04 → js/05 → js/06 → css/04 → js/07 → css/05 → js/08 → css/06
         → css/07 → css/08 → css/09 → css/10 (App Shell) → css/11 (Fichas) → css/12 (Manual/Alterações) → css/13 (Arcade/mapa) → css/14 (Polimento)
         → js/09 … js/60 → js/60b (App Shell) → js/60c (Fichas) → js/60d → js/60e (filtros Arcade) → js/61   (antigo closure; 61 = inicialização, sempre por último)
```

Os `<link rel="stylesheet">` ficam no `<body>`, na posição de cada `<style>` original, para manter a cascata idêntica (inclusive em relação a estilos que o JS injeta no `<head>`).

## CSS (`css/`)

| Ordem | Arquivo | Linhas orig. | Tamanho | Conteúdo |
|---|---|---|---|---|
| 1 | `01-base-layout.css` | 14–34 + 38–41 | 13 KB | Variáveis (:root), reset, topbar, painéis, botões, modais, toast, grids, responsivo; portal (#portal) e estado app-locked. |
| 2 | `02-cena-ferramentas.css` | 266 | 0.7 KB | Estilo de .scene-tools / .scene-eye. |
| 3 | `03-cena-visibilidade.css` | 311–312 | 0.7 KB | Atualização de visibilidade da cena e combate. |
| 4 | `04-tema-pergaminho.css` | 1108–1119 | 3.7 KB | Paleta clara de pergaminho que sobrepõe a base escura. |
| 5 | `05-mesa-legivel.css` | 1125–1184 | 4.9 KB | Fundo claro / texto escuro na Visão de Mesa, histórico de rolagens. |
| 6 | `06-ficha-etapa3.css` | 1380–1673 | 28 KB | Recursos +/-, abas da ficha, inventário, estados, combate. |
| 7 | `07-visual-etapas-5-24.css` | 1676–2796 | 100 KB | Acabamento visual, paletas, Visão de Mesa, chat, mini-games, combate no mapa, Arcade, Perseus (Etapa 20/22/23/24), conquistas. |
| 8 | `08-esteticas.css` | 2797–2916 | 16 KB | Camada estrutural da Galeria de Estéticas: [data-aesthetic], botões gloss/gel, textura da tela, galeria. |
| 9 | `09-visual-etapas-26-39.css` | 2917–3424 | 43 KB | Arcade pelo menu, Despertar, transmissão de tela, Alterações do Sistema, Óbolos, Manual Vivo, símbolos, ciclo elemental, Sub-Elementos, bestiário, Arcade 2.0. |
| 10 | `10-app-shell.css` | novo | 27 KB | **Onda 1 · App Shell + Mesa VTT (v2)**: tokens estruturais (escala 4/8 px), rail/barra inferior e a Mesa como estação de trabalho de janela inteira (barra única de 44 px, roster 216 px, mapa protagonista, dock 3×2 retrátil, ferramentas e visão do Mestre flutuando sobre o mapa). Só estrutura: cores e fontes vêm das variáveis das estéticas. |
| 11 | `11-fichas.css` | novo | 15 KB | **Onda 2 · Fichas (v2)**: topbar sem botões repetidos do rail, cabeçalho fixo (Vital/Lucidez/Essência sempre visíveis), coluna lateral de abas ≥1180 px (faixa rolável com esmaecido abaixo disso), identificação compacta, grade editorial. Só vale em `body.sheet-view`. |
| 12 | `12-docs.css` | novo | 3 KB | **Onda 3 · Manual Vivo e Alterações do Sistema**: no desktop viram área de trabalho ao lado do rail (índice lateral fixo, coluna de leitura de 76ch, busca em destaque, lista alinhada). No celular mantém a tela cheia de antes. Busca com ícone e contagem de resultados, campos de 44px, placeholder com contraste ≥ 5:1 nos 4 temas testados, cabeçalho do Manual em duas linhas no celular, Alterações em 2 colunas alinhadas no desktop. Sem JS novo. |
| 13 | `13-arcade-mapa.css` | novo | 3 KB | **Onda 4 · Tulpa Arcade e mapa**: vitrine do Arcade com faixa de filtros limpa, cards de mesma altura com botões alinhados, ordem mobile (filtros → salas → jogos); no celular a barra de ferramentas do mapa vira uma faixa única rolável. Não mexe nos jogos em tela cheia. **v2:** vitrine e Quarto do Perseus herdam fundo e texto da estética (antes o fundo era fixo escuro e quebrava nos temas claros), chips de dificuldade e botão voltar com cores do tema, abas do Perseus em linha própria, no celular os jogos vêm antes de Salas e Placar, estilos da barra de filtros do `js/60e`. |
| 14 | `14-polish.css` | novo | 2 KB | **Onda 5 · Polimento**: com estética/paleta ativa (`body.t3-pal`), o texto das abas da ficha e do topbar passa a seguir `--text` (antes usava cores fixas do tema clássico e ficava ilegível em estéticas claras); foco de teclado visível nos controles novos. |

> `08-esteticas.css` é a camada estrutural da Galeria de Estéticas (`[data-aesthetic]`, botões gloss/gel, textura). As paletas/temas em si são montados pelo JS (`js/38-esteticas.js`).

## JavaScript (`js/`)

Arquivos `01`–`08` são os scripts que já eram separados no original (cada um com seu próprio isolamento de erro). Arquivos `09`–`61` são as fatias do antigo closure.

| Ordem | Arquivo | Linhas orig. | Tamanho | Conteúdo |
|---|---|---|---|---|
| 1 | `01-dados-base.js` | 142–196 | 57 KB | Dados base do sistema: BASE_SKILLS, vocações, trilhas, ficha em branco (blank) e dados originais. |
| 2 | `02-portal-campanhas.js` | 200–263 | 23 KB | Portal · campanhas e perfis: Camada de campanhas, perfis, mesa compartilhada local, barreira de fichas e catálogo de rituais. |
| 3 | `03-cena-visibilidade.js` | 269–307 | 8.3 KB | Cena · visibilidade e som das rolagens: IIFE: som nas rolagens, visibilidade da cena (só Mestre), bônus de equipe. |
| 4 | `04-sons-efeitos.js` | 317–363 | 17 KB | Sons sintetizados e efeitos temporários: IIFE: sons sintetizados, persistência de efeitos temporários, habilidade de vocação consumida na rolagem. |
| 5 | `05-supabase-auth.js` | 368–525 | 10 KB | Supabase · autenticação: IIFE: cliente Supabase (URL + chave publicável), login, recuperação de senha, window.tulpaSupabase. |
| 6 | `06-supabase-campanhas-fichas.js` | 530–1104 | 35 KB | Supabase · campanhas, personagens e fichas (Etapa 2): IIFE: campanhas, personagens, fichas e sincronização em tempo real. |
| 7 | `07-combate-entrypoints.js` | 1122 | 0.3 KB | Combate · pontos de entrada: Listener de clique para #beginCombat e #rollNpcReflexes. |
| 8 | `08-mesa-rolagens.js` | 1187–1377 | 14 KB | Mesa · rolagem de perícias compartilhada: IIFE: rolagem de perícias na mesa, pop-up e histórico. |
| 9 | `09-catalogos-manual.js` | 3428–3864 | 90 KB | Catálogos do Manual V1.2: Armas, proteções, equipamentos, vocações, trilhas, rituais e sub-elementos (dados puros). |
| 10 | `10-motor-regras.js` | 3865–4163 | 20 KB | Motor de regras: Lógica pura sem DOM: carga, modificadores, rolagem, dano, defesa, morrendo, lucidez, descanso. |
| 11 | `11-ficha-nucleo.js` | 4164–4472 | 26 KB | Núcleo da ficha: Etapa 3: T3, cálculo unificado, persistência, recursos, navegação; aparência/tema/preferências. |
| 12 | `12-ficha-abas.js` | 4473–4757 | 43 KB | Abas da ficha: Visão geral, inventário, estados, lucidez/êxtase/trauma, combate & defesa, descanso. |
| 13 | `13-combate-habilidades.js` | 4758–5603 | 87 KB | Habilidades, rituais e combate (fichas): Modal de rolagem, efeitos entre personagens (fx), habilidades, rituais, processamento de linhas, defesa, turno, ataque, painel de combate na mesa. |
| 14 | `14-perseus-conhecimento.js` | 5604–5835 | 34 KB | Perseus · base de conhecimento: Base K de conhecimento do assistente Perseus. |
| 15 | `15-assets-perseus-img.js` | 5836–5837 | 49 KB | **Asset base64 — não editar.** Asset · PERSEUS_IMG (base64): Imagem do Perseus em base64 (49 KB). Não precisa ser editado. |
| 16 | `16-perseus-motor.js` | 5838–6101 | 22 KB | Perseus · motor e interface: Personalidade, navegação, busca, mensagens, revisão da ficha, tours, interface. |
| 17 | `17-regras-etapa4.js` | 6102–6270 | 17 KB | Etapa 4 · regras do Manual V1.2: Sonolento, reações, invocações, perícias, Modo Criação Livre, Arsenal Mental, botão do Mestre. |
| 18 | `18-perseus-ia.js` | 6271–6478 | 27 KB | Perseus · IA: Provedores de IA (Pollinations, Gemini, Groq) + base local; conhecimento das novidades. |
| 19 | `19-som-foto-narrador.js` | 6479–6773 | 24 KB | Etapa 5 · som, foto e narrador: Motor de som, foto de perfil, efeitos de rolagem, Perseus narrador. |
| 20 | `20-visao-mesa.js` | 6774–7753 | 88 KB | Etapa 6 · Visão de Mesa: Armazenamento da mesa, canal ao vivo/presença, lugares, caixa do Mestre, rolagens, notas, documentos, música, comandos do Mestre. |
| 21 | `21-mapa-tatico-base.js` | 7754–8140 | 34 KB | Etapa 7 · mapa tático (base): Montagem do mapa, câmera, ponteiro, menu do token, desenho, mapas guardados. |
| 22 | `22-call-voz-chat.js` | 8141–8715 | 43 KB | Etapas 8–9 · call de voz e chat: Chamada de voz estilo Discord (entrar/sair, segundo plano, recuperação de voz) e chat da mesa. |
| 23 | `23-mapa-motor-tatico.js` | 8716–9603 | 63 KB | Etapa 10 · motor tático: Geometria, colisão, campo de visão, névoa, editor do Mestre, portas, luz, movimento, rede. |
| 24 | `24-notas-guia.js` | 9604–10000 | 72 KB | Etapa 11 · notas de atualização e guia: Notas de atualização & guia completo. |
| 25 | `25-minigames-intervalo.js` | 10001–10430 | 34 KB | Mini-games de intervalo (motor): Janela, salas, partida, placar, tela cheia e ligação com o intervalo. |
| 26 | `26-minigames-jogos-mao.js` | 10431–11143 | 59 KB | Mini-games (os 6 jogos) e Levantar a Mão: Volley, Voo Além do Véu, Salto Astral, Coleta de Essência, Eco da Memória, Velha; Levantar a Mão. |
| 27 | `27-combate-no-mapa.js` | 11144–11826 | 60 KB | Etapa 15 · combate no mapa tático: Iniciativa, movimento por turno, alcance/linha de visão, ataque no mapa, mira, arremesso, efeitos, barra da ordem. |
| 28 | `28-arcade-base.js` | 11827–12349 | 44 KB | Etapa 17 · Arcade (base e 3 jogos): Hub do Arcade, conquistas, Ritual Rhythm, Defesa do Santuário. |
| 29 | `29-arcade-jogos-a.js` | 12350–12715 | 32 KB | Arcade · Fuga, Julgamento, Poço, Trono: Fuga Além do Véu, Julgamento da Essência, Poço das Almas, O Trono do Mestre. |
| 30 | `30-arcade-jogos-b.js` | 12716–13088 | 36 KB | Arcade · UNO, Clicker, Rinha, Corrida: UNO Teosófico, Teosofia Clicker, Rinha de Tulpas, Corrida do Véu. |
| 31 | `31-arcade-jogos-c.js` | 13089–13540 | 34 KB | Arcade · DOOM, Salto, Labirinto: DOOM: Colapso Mental, Salto para o Vazio, O Labirinto do Abismo. |
| 32 | `32-mapa-hud-selecao.js` | 13541–13825 | 20 KB | Mapa · HUD, seleção e Espectador: HUD nos tokens, seleção múltipla/área de transferência, vários mapas, Modo Espectador. |
| 33 | `33-perseus-visita-loja.js` | 13826–14452 | 60 KB | Etapa 20 · Visitar o Perseus: Quarto do Perseus, loja de visual, conquistas, ranking da mesa. |
| 34 | `34-arcade-3-jogos.js` | 14453–14772 | 29 KB | Etapa 21 · três jogos do Arcade: Sudoku Teosófico, Corredor do Vazio, Block Blast Astral. |
| 35 | `35-mestre-visoes-ia-inimigos.js` | 14773–15400 | 51 KB | Etapas 22–23 · visões do Mestre, IA de inimigos, furtividade: Visões do Mestre, cones/rotas, IA dos inimigos, portas furtivas e som, mapa limpo, rolagens privadas. |
| 36 | `36-assets-perseus-gif.js` | 15401–15405 | 513 KB | **Asset base64 — não editar.** Asset · PGIF24 (base64): GIFs/WebP do Perseus em base64 (524 KB). Não precisa ser editado. |
| 37 | `37-perseus-animator.js` | 15406–15492 | 6.1 KB | Etapa 24 · PerseusAnimator: Animações do Perseus (sem gravata). |
| 38 | `38-esteticas.js` | 15493–15691 | 26 KB | Etapa 25 · Galeria de Estéticas: Estéticas (data-aesthetic), galeria e aplicação dos temas. |
| 39 | `39-menu-despertar-transmissao.js` | 15692–16046 | 25 KB | Etapas 26–28 · menu do Arcade, Despertar, Transmitir Tela: Arcade pelo menu, configurações limpas, Despertar (Trilha), Transmitir Tela (getDisplayMedia + WebRTC). |
| 40 | `40-alteracoes-sistema.js` | 16047–16636 | 52 KB | Etapa 29 · Alterações do Sistema: Central do Mestre: edição inline, avisos por Perseus "!". |
| 41 | `41-obolos.js` | 16637–16954 | 28 KB | Etapa 30 · Óbolos: Quarto, visitas, cápsulas, missões, apostas (fora das regras). |
| 42 | `42-manual-texto-base.js` | 16955–17146 | 31 KB | Etapa 31 · Manual Vivo (texto base): Texto base do Manual Oficial. |
| 43 | `43-manual-vivo.js` | 17147–17532 | 37 KB | Etapa 31 · Manual Vivo (motor): Manual Vivo: fonte única da verdade, sincronizado com fichas, combate e alterações. |
| 44 | `44-manual-tabelas.js` | 17533–17750 | 20 KB | Etapa 31b · tabelas editáveis: Tabelas editáveis do Manual Vivo. |
| 45 | `45-assets-simbolos-rituais.js` | 17751–17752 | 176 KB | **Asset base64 — não editar.** Asset · RSYM32 (SVG dos rituais): Símbolos SVG dos rituais (180 KB). Não precisa ser editado. |
| 46 | `46-simbolos-rituais.js` | 17753–17894 | 9.0 KB | Etapa 32 · símbolos dos rituais: Renderização dos símbolos dos rituais. |
| 47 | `47-assets-rituais-sub.js` | 17895–17896 | 35 KB | **Asset base64 — não editar.** Asset · RART34 (SVG): Arte SVG dos rituais/sub-elementos (35 KB). Não precisa ser editado. |
| 48 | `48-ciclo-elemental.js` | 17897–18036 | 13 KB | Etapa 33 · Ciclo Elemental: Diagrama do Ciclo Elemental (Fé → Natureza → Inexistência → Ilusão → Verdade). |
| 49 | `49-expansao-subelementos.js` | 18037–18478 | 40 KB | Etapas 34–37 · Sub-Elementos e Expansão (Ondas 2–3): Sub-Elementos, itens vivos e aprimoramentos, bestiário/IA/fases/sinergias, catálogos editáveis. |
| 50 | `50-arcade2-onda1.js` | 18479–19266 | 72 KB | Etapas 38–39 · Arcade 2.0 Onda 1: Preparação/avaliação, Fuga, Ritual Rhythm 2.0. |
| 51 | `51-arcade2-onda2.js` | 19267–19751 | 48 KB | Etapas 40–41 · Arcade 2.0 Onda 2: Arcade 2.0 Onda 2. |
| 52 | `52-arcade2-onda3.js` | 19752–20235 | 51 KB | Etapas 42–43 · Arcade 2.0 Onda 3: Arcade 2.0 Onda 3. |
| 53 | `53-arcade2-onda4.js` | 20236–20674 | 51 KB | Etapas 44–45 · Arcade 2.0 Onda 4: Arcade 2.0 Onda 4. |
| 54 | `54-arcade2-onda5.js` | 20675–21044 | 40 KB | Etapas 46–47 · Arcade 2.0 Onda 5: Arcade 2.0 Onda 5. |
| 55 | `55-arcade2-onda6.js` | 21045–21697 | 73 KB | Etapas 48–49 · Arcade 2.0 Onda 6: Arcade 2.0 Onda 6. |
| 56 | `56-arcade2-onda7.js` | 21698–22284 | 70 KB | Etapas 50–51 · Arcade 2.0 Onda 7: Arcade 2.0 Onda 7. |
| 57 | `57-arcade2-onda8.js` | 22285–22659 | 47 KB | Etapas 52–53 · Arcade 2.0 Onda 8: Arcade 2.0 Onda 8. |
| 58 | `58-arcade2-onda9.js` | 22660–22989 | 41 KB | Etapas 54–55 · Arcade 2.0 Onda 9: Arcade 2.0 Onda 9. |
| 59 | `59-arcade2-onda10.js` | 22990–23320 | 39 KB | Etapas 56–57 · Arcade 2.0 Onda 10: Arcade 2.0 Onda 10. |
| 60 | `60-arcade2-onda11.js` | 23321–23604 | 31 KB | Etapas 58–59 · Arcade 2.0 Onda 11: Arcade 2.0 Onda 11 (inclui Jogo da Velha 2.0). |
| 60b | `60b-app-shell.js` | novo | 9 KB | **Onda 1 · App Shell**: monta o rail (desktop) / barra inferior (celular), destaca a tela atual e cria os botões Jogadores/Painel da Mesa. Só aciona o que já existe (`#openTable`, `T3.manualOpen`, `T3.arcGo`, `T3.petOpen`, `T3.sysOpen`, `T3.openSettings`, `T3.back`). Usa IIFE: não cria nomes globais. Roda ANTES do `61`. **v2:** `adoptMore()` move (não recria) `.mb-right`, `#mbArc26` e `#mbScr28` da barra da Mesa para o popover `#mbMore60` (botão `#mbMoreBtn60`); IDs e handlers dos outros arquivos seguem valendo. |
| 60c | `60c-fichas.js` | novo | 4 KB | **Onda 2 · Fichas**: cria o cabeçalho `#sheetHead60` (Vital/Lucidez/Essência) como espelho SOMENTE LEITURA de `#stats`, mede o topbar (`--tb-h`) e o cabeçalho fixo (`--sh-h`), marca o botão “← Central” (`.tb-central60`) e mantém a aba ativa visível. IIFE; roda ANTES do `61`. |
| 60e | `60e-arcade-filtros.js` | novo | 4 KB | **Onda 4 · Filtros do Arcade**: barra com busca e filtros por modo (Solo, Contra o Perseus, Mesa, PvP 1v1) acima da grade de jogos. Lê o modo dos botões de cada cartão e é recriada por um `MutationObserver` a cada volta à vitrine. Filtro lembrado em `localStorage t60e.arcFilter`. |
| 61 | `61-init.js` | 23605–23608 | 0.5 KB | Inicialização final: Exporta tulpaPubSummary, completa T3 com Object.assign e dispara initTheme/renderSheetTabs/initNav/initPerseus/render. |

## App Shell (Onda 1)

- `css/10-app-shell.css` + `js/60b-app-shell.js` formam a camada de navegação e de layout estrutural. As estéticas (`[data-aesthetic]`) só "vestem" essa estrutura via variáveis (`--panel`, `--line`, `--text`, `--accent`, `--ae-brad`, `--f-ui`); nenhuma cor é fixa no `css/10`.
- Classes que o `60b` coloca no `<body>`: `has-shell` (rail visível: Mesa/Fichas), `mesa-view` (tela da Mesa), `mesa-seats-off` (cartões dos jogadores recolhidos), `mesa-dock-on` (painel de combate/rolagens/chat aberto), `sheet-view` (qualquer aba da ficha). Preferências guardadas em `localStorage` (`t60b.rail`, `t60b.seats`, `t60b.dock`).
- Breakpoint único de celular: `max-width:860px` (o mesmo do `css/07`). Abaixo dele o rail vira barra inferior de 60 px + gaveta "Mais".
- **Manual e Alterações como aba:** enquanto `#man31` ou `#sys29` estiver aberto, o `60b` põe `body.doc-open` e o `css/12-docs.css` esconde `#portal`, `.topbar` e `.shell` (a tela de baixo some e volta igual ao fechar). O rail marca o item ativo e, ao clicar em outro destino, fecha a aba aberta (`#m31x` / `#sys29x`). O Arcade continua em tela cheia própria.
- Para adicionar um destino novo na navegação, inclua um item no array `ITEMS` do `js/60b-app-shell.js` e um ícone em `IC`.

## Checklist de validação (usado nas Ondas 1–5)

- Rodar a Mesa, a ficha, o Manual, as Alterações e o Arcade em desktop (1440×900) e celular (390×844), com várias estéticas (`prefs.theme='ae:<id>'`), e confirmar: sem rolagem horizontal, sem erro no console, contraste ≥ 4,5:1 no texto da navegação e do cabeçalho, foco de teclado visível.
- Na última auditoria passaram as 36 estéticas da galeria (desktop e celular).
- Ao criar um estilo novo, use só variáveis do tema (`--panel --line --text --accent --ae-brad --f-ui --f-display`). Nunca fixe cor.

## Guia rápido: qual arquivo abrir

| Quero mexer em… | Arquivo(s) |
|---|---|
| Login, cliente Supabase, chaves | `js/05-supabase-auth.js` |
| Campanhas, personagens, sincronização das fichas | `js/06-supabase-campanhas-fichas.js`, `js/02-portal-campanhas.js` |
| Dados do sistema (armas, itens, vocações, trilhas, rituais) | `js/01-dados-base.js`, `js/09-catalogos-manual.js` |
| Regras puras (rolagem, dano, defesa, descanso) | `js/10-motor-regras.js`, `js/17-regras-etapa4.js` |
| Ficha: abas, inventário, estados, lucidez | `js/11-ficha-nucleo.js`, `js/12-ficha-abas.js` |
| Habilidades, rituais, efeitos e combate da ficha | `js/13-combate-habilidades.js` |
| Perseus (conhecimento, motor, IA, animações, visita) | `js/14`, `js/16`, `js/18`, `js/37`, `js/33` |
| Visão de Mesa, presença, música, documentos | `js/20-visao-mesa.js`, `js/19-som-foto-narrador.js` |
| Mapa tático (base, motor, HUD/seleção, combate no mapa) | `js/21`, `js/23`, `js/32`, `js/27`, `js/35` |
| Chamada de voz e chat | `js/22-call-voz-chat.js` |
| Manual Vivo e tabelas editáveis | `js/42`, `js/43`, `js/44` (+ símbolos `js/46`, ciclo `js/48`, sub-elementos `js/49`) |
| Alterações do Sistema (central do Mestre) | `js/40-alteracoes-sistema.js` |
| Óbolos | `js/41-obolos.js` |
| Estéticas / temas | `js/38-esteticas.js` + `css/08-esteticas.css` |
| Arcade (hub, jogos, Arcade 2.0) | `js/28`–`js/31`, `js/34`, `js/50`–`js/60` |
| Mini-games de intervalo, Levantar a Mão | `js/25`, `js/26` |

**Nunca precisa sincronizar (assets gigantes em base64):** `js/15`, `js/36`, `js/45`, `js/47` (~770 KB somados) — a menos que seja para trocar a imagem/arte.

## O que muda na prática em relação ao arquivo único

- Nomes que eram privados do closure agora existem em `window` (`function`/`var`) ou no escopo global léxico (`const`/`let`/`class`). Por análise de escopo (parser + eslint-scope) foi conferido que **nenhum** desses nomes colide com os scripts anteriores nem com as propriedades padrão do `window` (checado contra o `window` do jsdom).
- Um erro de sintaxe/execução em um arquivo de `js/09`–`js/61` agora derruba **só aquele arquivo** (antes derrubava o closure inteiro); os seguintes continuam rodando e podem acusar `ReferenceError`. Se o console mostrar `X is not defined`, procure o arquivo que declara `X` e veja se ele falhou antes.
- Verificações aplicadas na geração: (1) a junção dos arquivos reproduz byte a byte cada bloco do original (23.454 linhas, nenhuma perdida ou repetida); (2) cada arquivo parseia sozinho e o conjunto parseia na ordem de carga; (3) o app carrega no jsdom, com e sem sessão simulada e com latência aleatória (0–500 ms) entre arquivos, com o mesmo DOM, as mesmas 288 chaves de `T3` e sem erros.
- **Não coberto pelos testes automáticos:** fluxos pós-login reais (Supabase de verdade, mesa, mapa, call de voz, Arcade), que dependem de rede e do navegador.

## Teste manual sugerido após publicar

Abra o site com o console aberto (F12) e confira que **não aparece** nenhum `ReferenceError` / `is not defined` / `Identifier … already declared`. Depois: entrar, abrir uma campanha, abrir uma ficha (trocar de aba), rolar um dado, abrir a Visão de Mesa e o mapa, abrir o Manual, abrir o Arcade e a Galeria de Estéticas.
