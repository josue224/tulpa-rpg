# CLAUDE.md — TULPA RPG

Site da campanha de **Tulpa RPG**: fichas, Visão de Mesa, mapa tático com combate, chamada de voz, Manual Vivo, Perseus (assistente gato) e Tulpa Arcade.
Hospedado no **GitHub Pages** (`josue224/tulpa-rpg`, branch `main`), backend **Supabase**. Sem bundler, sem build, sem framework.

- Fale com o usuário em **português do Brasil**. Ele é o Mestre da campanha.
- Detalhes por arquivo: veja `ARQUITETURA.md`. Este arquivo traz só as regras e o estado atual.

---

## 1. Arquitetura

### Estrutura

```
index.html                 markup + <link>/<script> na ordem de execução
css/01…14-*.css            estilos (a ordem importa: é a cascata original)
js/01…61-*.js              scripts clássicos (escopo global compartilhado)
supabase/functions/perseus-ai/index.ts   Edge Function da IA do Perseus (Gemini)
supabase/migrations/tulpa-mesa.sql        campaign_store, campaign_blobs, RLS, move_campaign_token
supabase/migrations/tulpa-mapa-tatico.sql move_campaign_token_v2, use_campaign_door, set_campaign_light
tulpa-mapa-tatico.sql      cópia na raiz (manter)
.nojekyll                  manter
ARQUITETURA.md             mapa detalhado de cada arquivo
```

Ao publicar, **nunca apague** `supabase/`, `.nojekyll` nem `tulpa-mapa-tatico.sql`.

### Scripts clássicos (sem `type="module"`)

1. **A ordem das tags no `index.html` é a ordem de execução.** Não reordene. Não pule arquivos. Não use `defer`, `async` nem `type="module"`.
2. **`js/01`–`js/08`** eram scripts separados no original, e a maioria é IIFE.
3. **`js/09`–`js/61`** são fatias de um antigo IIFE gigante.
   - Tudo neles (`E`, `T3`, `CB`, `ACH`, `M6`, `MAP7`, `data`, `prefs`…) está no **escopo global compartilhado**.
   - Antes de criar um nome de topo: `grep -rn "const NOME\b\|let NOME\b\|function NOME\b\|class NOME\b" js/`.
   - Um `const` repetido derruba o arquivo inteiro, com o erro `Identifier already declared`.
4. **`js/61-init.js` é sempre o ÚLTIMO.** Ele completa o `T3` e dispara `initTheme`, `renderSheetTabs`, `initNav`, `initPerseus` e `render`.
   - Código novo vai num arquivo novo **antes** do 61 (ex.: `js/60g-xxx.js`), com uma `<script>` na posição certa.
5. Uma função pode chamar algo de um arquivo **posterior** só depois do carregamento (eventos, timers, cliques). Nunca no topo do arquivo.
6. O padrão de encadeamento continua válido: `const _f=fn; fn=function(){ … _f.apply(this,arguments) … }`.
7. Arquivos novos de camada (`60b`, `60c`, `60d`, `60e`) usam **IIFE**, sem criar nomes globais.
8. **Assets base64:** `js/15`, `js/36`, `js/45` e `js/47`. Não edite e não leia inteiros (~770 KB). Mexa neles só para trocar a arte.

### Carregamento sob demanda do Arcade (`js/60d-arcade-loader.js`)

- Os arquivos `js/29`, `js/30`, `js/31`, `js/34`, `js/50`–`js/60` e `js/60f` (motor gráfico) **não têm `<script>` no `index.html`**. O `60d` os injeta, na ordem exata, na primeira abertura do Arcade.
  - Ele faz isso envolvendo `mgOpen`, `T3.mgOpen` e `T3.arcGo`, e expõe `T3.ensureArcadeLoaded()`.
- Jogo novo do Arcade: crie o arquivo e **acrescente-o à `QUEUE` do `60d`**, não ao `index.html`.
- Enquanto o Arcade não abrir, nada desses arquivos existe (jogos, `prog38`, conquistas do Arcade 2.0).
  - Código que roda fora do Arcade não pode depender deles. Se precisar, chame `await T3.ensureArcadeLoaded()` antes.

### Cache: tokens `?v=…`

- Todo `src`/`href` local leva `?v=TOKEN`, hoje `?v=2026112702`. O `60d` reaproveita o token da própria tag.
- **Em todo deploy que mude qualquer arquivo, troque o token em todas as tags:**
  ```bash
  sed -i 's/?v=[^"]*"/?v=AAAAMMDDNN"/g' index.html
  ```
- Atualize também `<meta name="tulpa-build">`. O `VER` reserva dentro do `60d` (`'2026112702'`) é só um fallback.

### Como verificar antes de commitar

- Sintaxe de cada arquivo: `for f in js/*.js; do node --check "$f" || echo "ERRO $f"; done`.
- Rodar local: `python3 -m http.server 8000` e abrir `http://localhost:8000/`.
  - O console (F12) não pode mostrar `ReferenceError`, `is not defined` nem `already declared`.
- Testar em **1440×900 e 390×844**, com algumas estéticas: sem rolagem horizontal, foco de teclado visível e contraste ≥ 4,5:1.
- Fluxos pós-login (Supabase real, mesa, mapa, call, Arcade) **não têm teste automático no repo**. Descreva ao usuário o que testar manualmente.

---

## 2. Design System — regras de ouro

1. **Escala 4/8 px.** Espaçamento só com `--sp-1`…`--sp-7` (4, 8, 12, 16, 24, 32, 48 px), definidos em `:root` no `css/10-app-shell.css`.
   - Tipografia: `--fs-2xs`…`--fs-xl` e `--lh-tight`/`--lh-body`.
   - Alvo de toque: `--touch` (44 px).
   - Medidas do shell: `--rail-w`, `--bar-h`, `--mesa-bar-h`.
2. **Layout desacoplado das estéticas.**
   - Há 36 estéticas na galeria mais a "Personalizada", via `body[data-aesthetic]`. São montadas pelo `js/38-esteticas.js`, e a camada estrutural está no `css/08-esteticas.css`.
   - Elas só "vestem" a estrutura. O CSS de layout **nunca fixa cor, fonte nem raio**.
   - Use apenas `--bg --panel --panel2 --line --text --accent --ae-brad --ae-rad --f-ui --f-display`.
3. **Variáveis semânticas ficam em `body`, não em `:root`.**
   - São elas: `--surf-1`, `--surf-2`, `--surf-hover`, `--surf-active`, `--border-subtle`, `--border-strong`, `--ink-dim`, `--shell-r` e `--surface-r`.
   - Motivo: o `js/38` injeta a estética no `body`. Declaradas em `:root`, elas herdariam o tema Pergaminho.
4. **Modo vidro.**
   - Só existe com a estética ativa: `body.t3-pal[data-ae-glass="1"]`. Ele aplica `backdrop-filter` e `--ae-fill` (com `color-mix`) aos painéis.
   - Para um componente novo ganhar vidro, adicione-o aos seletores com esse prefixo (ver `css/08` e `css/10`). Nunca aplique blur incondicional.
   - Classes do tema: `body.t3-pal` (paleta ativa) e `body.t3-dark`.
5. **Proibido:**
   - botão global claro/escuro (só existe dentro da "Estrutura Clássica");
   - seletor manual celular/desktop.
6. **Breakpoint único de celular: `max-width:860px`.**
   - Abaixo dele, o rail vira barra inferior de 60 px com a gaveta "Mais".
   - Classes do `60b` no `body`: `has-shell`, `mesa-view`, `mesa-dock-on`, `mesa-seats-off`, `sheet-view`, `doc-open`.
7. **Manual Vivo e Alterações do Sistema abrem como aba** (`body.doc-open`), nunca sobrepostos a outra tela. O Arcade tem tela cheia própria.
8. **Acessibilidade sempre:**
   - contraste ≥ 4,5:1;
   - foco visível;
   - `aria-label` em botão só com ícone;
   - sem rolagem horizontal em 390 px.
9. Novo destino na navegação: item no array `ITEMS` e ícone em `IC`, no `js/60b-app-shell.js`.

---

## 3. Regras invioláveis do sistema TULPA

### Combate (`js/10` motor puro, `js/13` ficha, `js/27` mapa, `js/39` trava)
- O motor de regras (`E.*` em `js/10`) é **lógica pura, sem DOM**. A UI só escolhe alvos e chama o motor. Não duplique regra na UI.
- **Iniciativa:** o aparelho do Mestre rola o Reflexo de todos e monta a ordem. Todos veem os dados.
- **Economia por turno:**
  - **9 m exatos** de movimento (`MOVE14=9`);
  - 1 Ação Padrão;
  - ações livres;
  - 1 reação (retaliação e rituais de reação);
  - **só 1 talento por turno** (talento não gasta a ação).
- **Cobertura parcial:** +2 na defesa (`COVER14`). Mira com alcance e linha de visão pelas paredes.
- **Área e arremesso:** DT pela distância, desvio na falha, Resistência reduz o dano à metade.
- Rituais em 3 níveis: **Base 5 ES · Avançada 10 ES · Próspera 20 ES**.
- Ciclo Elemental: **Fé → Natureza → Inexistência → Ilusão → Verdade → Fé**. 5 Sub-Elementos: Sol, Desrealização, Pofenia, Confabulação, Metáfora.
- Todas as perícias começam em 0. **Não existe a perícia História** (o Arqueólogo fica com Investigação).
- Trilhas só liberam depois que o personagem ativa o **Despertar**, não automaticamente no Estágio 3.

### Trava de turno (`js/39`, `canMove7`)
- Em combate **só o token da vez se move**. Isso vale **também para o Mestre**: na vez de um jogador, o Mestre fica travado.
- A única exceção é o botão de emergência do Mestre "🔓 Destravar Posição Manual" (`CB26.unlock`). Ele vem desligado, não gasta metros e é desligado ao fim do combate.
- Nunca afrouxe essa trava em código novo. Toda movimentação passa por `canMove7`/`T3.canMove`.

### Furtividade e IA de inimigos (`js/35`)
- **Inimigos:**
  - Cone de visão bloqueado por paredes e portas fechadas.
  - Ver um jogador inicia combate só para os envolvidos e o cômodo.
  - Sem contato por 5 s, sai do combate.
- **Furtividade por proximidade:** perto de um inimigo e fora do cone, o jogador rola Furtividade contra a Percepção do inimigo.
- **Porta furtiva:** Destreza + Furtividade, **DT 12**. Na falha há um rangido proporcional à margem e uma onda sonora; os inimigos mostram "?" e vão investigar.
- **Rolagens de furtividade são privadas:** só quem rolou vê. O Mestre vê as dos NPCs.
- O Mestre tem 3 visões: **Edição, Limpa e Players**, guardadas no aparelho dele (`localStorage tulpa_gmview`).

### WebRTC (`js/22` call, `js/39` transmissão)
- **Malha P2P.** A sinalização usa o **Supabase Realtime Broadcast** no canal `tulpa-voice-<campanha>`.
- **ICE:** STUN público do Google e da Cloudflare. TURN é opcional: o Mestre cola as credenciais uma vez e elas vão no estado da mesa (`M6.state.call.ice`).
- **Só o Mestre inicia e encerra a call.** Os jogadores podem sair e voltar.
- Sussurro: o Mestre isola o áudio com alguns jogadores (`call.whisper`).
- **Transmitir tela** usa `getDisplayMedia` e precisa de **permissão do Mestre**. Não funciona no celular, mas assistir funciona.
- Sem servidor de mídia e sem custo. Não introduza um.

### Supabase
- **Produção: nada destrutivo sem aprovação do usuário.** Nada de `drop`, `alter` em tabela existente ou apagar dados.
- Tabela ou coluna nova = **arquivo `.sql` separado em `supabase/migrations/`, com RLS**, que o usuário roda à mão. O site precisa continuar funcionando **sem** a migração, com fallback em `campaign_items` ou no estado atual.
- **`campaign_store`**: registros leves, com tempo real.
  - Colunas: `campaign_id`, `key`, `kind`, `value jsonb`, `audience uuid[]`; `unique(campaign_id,key)`.
  - Só o Mestre escreve. O jogador lê o que é público ou o que tem o `uid` dele em `audience`.
  - Chaves em uso: `state` (mesa, mapa, tokens, call, música), `rules` (Alterações do Sistema), `manual` (Manual Vivo), além de mapas, docs e notas.
- **`campaign_blobs`**: imagens pesadas (mapas, documentos). **Fica fora do Realtime de propósito.** Nunca ponha imagem em `campaign_store`.
- **Movimento de token e portas passam por RPC** `security definer`: `move_campaign_token(_v2)`, `use_campaign_door` e `set_campaign_light`. O jogador só move o próprio token; a checagem é **no banco**.
  - Sem a RPC, o fallback é o aparelho do Mestre conferir o movimento.
- O cliente (`js/05`) usa só a **chave publicável**. Segredos ficam em Edge Function Secrets.

### Manual Vivo (`js/42`–`js/44`) e Alterações do Sistema (`js/40`)
- O **Manual Vivo é a fonte única da verdade.** Vocações, trilhas, rituais, itens, estados, traumas, bestiário e regras da mesa vêm de `list29`/`cur29`, os **mesmos dados** das fichas e do combate (chave `rules`).
- O Mestre edita inline (central ⚙️ ou o próprio Manual, que usam o mesmo editor validado). Para jogadores é somente leitura.
- Uma mudança avisa **só os jogadores afetados**, pelo alerta "!" do Perseus.
- Nunca crie uma segunda cópia de regra ou catálogo fora desse fluxo.

### Perseus (`js/14`, `js/16`, `js/18`, `js/33`, `js/37`)
- O Perseus padrão **não usa gravata** e é **arrastável** no PC e no celular.
- A IA roda pela Edge Function `perseus-ai` (Gemini).
  - A chave fica no segredo `GEMINI_API_KEY` e **nunca vai ao navegador**.
  - Limite de 10 perguntas por minuto por usuário.
  - Provedores alternativos são opcionais e escolhidos pelo usuário.
- Com Lucidez ≤ 8, o Perseus entra no modo "AMIGO" (texto leet). Isso é intencional.

### Tulpa Arcade (`js/25`, `js/26`, `js/28` base; `js/29`–`js/31`, `js/34`, `js/50`–`js/60` sob demanda)
- **Visibilidade:** Arcade e "Visitar o Perseus" só aparecem com a **call inativa, no Modo Intervalo ou fora do mapa principal**.
- **Contrato de jogo:**
  ```
  defineArcadeGame(id, {...GAMES12.id, make, setup, pad, modes, desc, rule, keys, touch})
  ```
  - `make(C)` devolve `st, step, draw, key, ptr, msg, left, reward, next`.
  - `C` traz `room.opt, gd, diff, seed, t0, me, host, net, players, send, say, hud, finish, achieve, fx`.
- **Rede:** o host é autoritativo. **Só o host chama `C.finish`**: o `mgFinish` transmite "over" e os convidados nunca chamam `finish`.
- Toda partida precisa **terminar com `C.finish({title, rows:[{u,n,c,s,w}], unit, html})`**. Apostas e missões dependem disso.
- **Progresso do Arcade 2.0:** `prog38()`/`progPut38(fn)` em `localStorage tulpa_arc2_<uid>`. Multiplicador de dificuldade: `gdMul38(gd)`. Salas `ai` abrem antes o seletor de dificuldade.
- **Conquistas:** 125 no total, 27 secretas. Atualize a contagem ao criar novas.
- **Óbolos** (`js/41`) são moeda fora das regras do RPG. A **aposta amistosa começa em 0**.
- Jogo novo ou nova versão também ganha uma entrada no guia de novidades (`js/24`).
- **Visual dos jogos:** use o motor `GFX60` (`js/60f`, documentado no `ARQUITETURA.md`). Ele é **somente visual**: hit-stop, partículas e cenário nunca mudam `step`, timers, rede, RNG, pontuação ou `C.finish`, e respeitam `prefers-reduced-motion`. É o único arquivo de camada que expõe um global.

---

## 4. Estado do projeto

### Concluído
- **Sistema:** fichas completas (Etapa 3), motor de regras, combate na ficha e no mapa, Visão de Mesa, mapa tático com paredes, portas, névoa, luz e FOV, visões do Mestre, IA de inimigos e furtividade, call de voz, chat e transmissão de tela, Despertar e Trilhas, Óbolos, Manual Vivo com tabelas editáveis, Alterações do Sistema, símbolos SVG dos rituais, Ciclo Elemental, Sub-Elementos, itens vivos, bestiário com IA e fases.
- **Galeria de Estéticas:** 36 temas mais o Personalizado.
- **Arcade 2.0, Ondas 1–11.** Os 22 jogos receberam modos, campanhas, conquistas e recompensas:
  - Rhythm, Fuga, Corredor, Salto Vazio, Corrida, UNO, Defesa, Trono, Sudoku, Blast, DOOM, Julgamento, Rinha, Abismo, Poço, Clicker;
  - Volley, Voo, Salto Astral, Coleta, Eco, Velha.
- Ficha: rituais aprendidos podem ser **esquecidos** (botão com confirmação em dois toques).
- Modularização do `index.html` em `css/` e `js/`, mais a reestruturação de layout:
  - **Onda 1:** App Shell e Mesa VTT;
  - **Onda 2:** Fichas;
  - **Onda 3:** Manual e Alterações como aba;
  - **Onda 4:** Arcade e mapa;
  - **Onda 5:** polimento.
- Carregamento sob demanda do Arcade (`60d`, ~686 KB a menos na abertura) e filtros do Arcade (`60e`).
- **Onda de estabilidade (26/11/2026)**, só bugs, sem redesign:
  - **Névoa de guerra em grade** (`js/21`): agora é pintada numa camada própria e a visão dos tokens do jogador (cone, luz e um halo em volta do próprio token) dissipa a névoa ao vivo, sem memória. Aliados dentro do cone aparecem mesmo sob névoa. Para o Mestre, a área vista pelos jogadores aparece mais clara. O `mapFog7` compara a referência da lista `open`.
  - **Música** (`js/20`): o domínio alternativo (`youtube-nocookie`) é tentado **por vídeo** e não fica mais preso para a sessão. O vigia (`ytWatch6`) só silencia quando o navegador realmente bloqueou o som. Erros 101/150/153 avisam qualquer pessoa (`ytFail6`), inclusive jogadores, com "⚠ não toca neste navegador" na barra. Adicionado `widget_referrer`.
  - **Arcade multiplayer** (`js/25`): tráfego rápido (`MG_FAST`: snap, in, pos, rs, ri, as, ain, rh, rhs, pss, pam) vai por um **canal só da sala** (`tulpa-mg-<campanha>-<sala>`, handshake `rj`), com volta ao canal geral enquanto alguém não entrou nele.
  - **Predição local do convidado:** Volley (`js/58`) e Abismo (`js/56`) movem o próprio boneco na hora e mandam a posição (contador `tp` para reposicionamentos do host); Rinha (`js/56`) prevê o andar e interpola os lutadores; Coleta (`js/59`) limita os snapshots a ~30/s. O host continua autoritativo e dono do `C.finish`.
- **Reforma visual da interface (27/11/2026)**, só `css/10`–`14`, sem mudança de JS:
  - auditada com Playwright e Supabase falso: 36 estéticas em 1440 e 390 px nas telas principais; Cyberpunk, Frutiger Aero, Dark Academia, Webcore e os temas clássicos em todas as telas;
  - corrigidos: vidro borrando o mapa no celular, barra de combate sobre a navegação, rótulos de rituais embaralhados no Manual, índice do Manual ausente entre 861 e 900 px, Pergaminho com topo da ficha, Arcade e Quarto do Perseus ilegíveis, campos ilegíveis no Webcore, Perseus sobre o painel da Mesa;
  - `--ink-bg` (em `body`) é a cor do texto escrito direto sobre o fundo da página; as regras de contraste por estética ficam no `css/14`.

- **Arcade visual, Onda 1 · Motor gráfico (`?v=2026112702`)**: novo `js/60f-arcade-gfx.js` (`GFX60`) no início da `QUEUE` do `60d`, com sprites/tilesets procedurais em cache, paralaxe, luz, sombras, partículas, hit-stop só visual e HUD (estilos no fim do `css/13`). Nenhum jogo usa a camada ainda (Ondas 2–7); a única diferença visível é que, com movimento reduzido, o tremor de tela some e o clarão fica fraco.

### Pendente / próximos passos
0. **Teste manual pós-login da Onda de estabilidade:** névoa nas 3 visões do Mestre e no jogador, música no aparelho do Mestre com um vídeo que dava erro 150, e Volley, Rinha e Abismo com convidado em outra rede.
1. **Atualizar o `ARQUITETURA.md`.** Ele cita o token `?v=20261122p` (o real é `2026112701`) e ainda lista `js/29–31`, `34` e `50–60` como tags do `index.html` (hoje vêm do `60d`).
2. **Teste manual pós-login** de tudo que o teste automático não cobre: login real, mesa, mapa, call, transmissão e Arcade com carregamento sob demanda (inclusive em sala multijogador, com convidado entrando antes de o Arcade carregar).
3. **Atualizar o Manual em PDF:** perícias começam em 0 e não existe História.
4. **Balancear a Coleta de Essência.** A Receita 7, "Destilado do Vazio", foi a mais difícil para o bot (6 de 8 tentativas). Ajuste se os jogadores reclamarem.
5. **Criar uma suíte de testes no repo** (Playwright + Supabase falso) para os fluxos críticos: combate e trava de turno, Manual Vivo e Arcade.
6. Avaliar a cópia duplicada de `tulpa-mapa-tatico.sql` na raiz. **Só remova com aprovação do usuário.**

---

## 5. Como trabalhar neste repo
- **Divida tarefas grandes em "Ondas"** completas e seguras. Ao fim de cada uma, diga o que entrou e qual é a próxima.
- **Nunca trunque código** nem entregue arquivo parcial. Não quebre o que já funciona.
- O usuário costuma trazer listas de melhorias avaliadas por outra IA. Confira cada item contra o código antes de aplicar.
- Mensagens de commit em português, descrevendo o que mudou para o jogador ou o Mestre.
- Antes de commitar:
  - troque o token `?v=`;
  - rode `node --check` em todos os arquivos `js/`;
  - teste em desktop e celular.
