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
css/01…19-*.css            estilos (a ordem importa: é a cascata original)
js/01…61-*.js              scripts clássicos (escopo global compartilhado)
js/09b-catalogo-vertentes.js  18 perícias, vertentes, atributos e números das regras (dados; editáveis pela chave rules)
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
   - Código novo vai num arquivo novo **antes** do 61 (ex.: `js/60l-xxx.js`; CSS novo: `css/20-…`), com uma `<script>` na posição certa.
5. Uma função pode chamar algo de um arquivo **posterior** só depois do carregamento (eventos, timers, cliques). Nunca no topo do arquivo.
6. O padrão de encadeamento continua válido: `const _f=fn; fn=function(){ … _f.apply(this,arguments) … }`.
7. Arquivos novos de camada (`60b`–`60e`, `60g`–`60k`) usam **IIFE**, sem criar nomes globais.
8. **Assets base64:** `js/15`, `js/36`, `js/45` e `js/47`. Não edite e não leia inteiros (~770 KB). Mexa neles só para trocar a arte.

### Carregamento sob demanda do Arcade (`js/60d-arcade-loader.js`)

- Os arquivos `js/29`, `js/30`, `js/31`, `js/34`, `js/50`–`js/60` e `js/60f` (motor gráfico) **não têm `<script>` no `index.html`**. O `60d` os injeta, na ordem exata, na primeira abertura do Arcade.
  - Ele faz isso envolvendo `mgOpen`, `T3.mgOpen` e `T3.arcGo`, e expõe `T3.ensureArcadeLoaded()`.
- Jogo novo do Arcade: crie o arquivo e **acrescente-o à `QUEUE` do `60d`**, não ao `index.html`.
- Enquanto o Arcade não abrir, nada desses arquivos existe (jogos, `prog38`, conquistas do Arcade 2.0).
  - Código que roda fora do Arcade não pode depender deles. Se precisar, chame `await T3.ensureArcadeLoaded()` antes.

### Cache: tokens `?v=…`

- Todo `src`/`href` local leva `?v=TOKEN`, hoje `?v=2026112714`. O `60d` reaproveita o token da própria tag.
- **Em todo deploy que mude qualquer arquivo, troque o token em todas as tags:**
  ```bash
  sed -i 's/?v=[^"]*"/?v=AAAAMMDDNN"/g' index.html
  ```
- Atualize também `<meta name="tulpa-build">`. O `VER` reserva dentro do `60d` (`'2026112714'`) é só um fallback.

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
- **Números editáveis:** os valores abaixo são o **padrão**. Benefícios de atributo, DB, coberturas, bloqueio, manobras, tiroteio, generalismo e DTs de medicina ficam em `REGRA_DEFS`/`REGRA_NUM` (`js/09b`), são lidos por `E.regra(id)` (ou pelos getters `E.DB`, `E.COVER`…) e o Mestre os muda pela chave `rules` (`rules.num`, `rules.attr`). Valor salvo antigo ou inválido cai no padrão. **Nunca escreva um desses números fixo** no motor, na UI ou no texto (no Manual use `{{r:id}}`). Regra nova com número: acrescente a linha em `REGRA_DEFS`.
- **Iniciativa:** o aparelho do Mestre rola o Reflexo de todos e monta a ordem. Todos veem os dados.
- **Economia por turno:**
  - **9 m exatos** de movimento (`MOVE14=9`);
  - 1 Ação Padrão;
  - ações livres;
  - **1 Reação por rodada** (Bloqueio e rituais de reação; a Retaliação/Contra-Ataque é ação extra à parte), que volta no início do turno do dono (`d.reacao` + `E.reactionInfo`; não crie outro contador);
  - **só 1 talento por turno** (talento não gasta a ação).
- **Corpo a corpo (`E.*`, UI em `js/13`, `js/27`, `js/60h`):** **Guarda Fechada** (Ação Padrão) dá até 2 Bloqueios na rodada e +2 de redução. **Bloqueio** (`E.resolveBlock`), testado nesta ordem: Erro Total (ATA<10 e Bloqueio≥10: 0 dano + Contra-Ataque; 20 natural vira Parcial) → Brecha (Bloqueio≥ATA com ATA<10, ou folga ≥5: dano ÷2 − CON − bônus, mín. 1, + Contra-Ataque) → Parcial (Bloqueio≥10 e ATA maior) → Guarda Quebrada (Bloqueio<10 e ATA≥10: dano total). Casos não cobertos viram Parcial. O Contra-Ataque é grátis, só corpo a corpo e sem defesa.
- **Manobras** (Desarmar, Derrubar, Agarrar/Escapar, Empurrar): 1 Ação Padrão, adjacente, sem dano; empate favorece quem defende. Quem controla o alvo resolve (linhas `man`/`manres` em `campaign_rolls`); o **aparelho do Mestre** move o empurrado (`E.pushPath`, para em parede, borda ou token). Deslocamento forçado não libera movimento manual de ninguém.
- **Cobertura:** parcial **+4** e pesada **+6** (`E.COVER`), somadas na **DF**. No mapa: 2 de 3 linhas de visão = parcial, 1 = pesada, 0 = total (bloqueia). Mira com alcance e linha de visão pelas paredes.
- **Tiroteio (Armas de Disparo; `E.resolveShot`/`E.shotOptions`/`E.shotEffects`, UI em `js/60i`):** à distância não há Esquiva nem Bloqueio (só **queima-roupa ≤1,5 m** com alvo ciente, que dá desvantagem a quem atira sem Pistolas). O alvo ciente pode gastar a Reação no **Mergulho** (DES + Reflexo, até 3 m) contra a Defesa Base 10, ou ficar firme (ATA ≥ DF). Ordem: **20 natural** = crítico, ignora o Mergulho → ATA<10 e RF≥10 Erro e Recuperação → ambos ≥10 Mergulho (Caído ou abrigado) → ATA≥10 e RF<10 **Acerto Violento** (acerta, Caído, **2º Disparo** imediato ATA×DF no mesmo alvo, gasta munição) → ambos <10 Erro e Queda. Desprevenido, 2º Disparo, Tiro Livre e sem Reação: direto ATA×DF. Disparada +2 e Caído +2 na DF. **Crítico balístico** dobra só os dados da arma e aplica **Sangrando** (1 VT/rodada, não acumula, um tique por turno). Disparar trava o movimento restante.
- **Fogo de Supressão** (Ação Padrão, alvo em cobertura): Resistência [PRE] (Firmeza Mental) contra o ATA, empate favorece o alvo; falha = `suprimido` até o próximo turno do atirador, e sair da cobertura (>0,75 m) ou atacar dá 1 **Tiro Livre** (ATA×DF). A detecção é passiva: nunca bloqueia nem libera movimento.
- **Especializações de disparo:** Pistolas (saca e dispara, sem desvantagem à queima-roupa), Espingardas (+2 dano à queima-roupa, empurra 1,5 m até 6 m se ATA ≥ DF), Fuzis (+1d20 na supressão, ignora a penalidade opcional de −1d20 de médio/longo alcance), Precisão (Mirar gasta o movimento, ignora Cobertura Parcial, crítico +1), Arcos (silencioso, recupera a munição no fim da cena). Fora da especialização: metade do grau.
- **Mergulho** move o token só pelo aparelho do Mestre (linhas `dive`), como o empurrão.
- **Itens no chão (`E.drop*`, UI em `js/60j`):** desarme vencido ou **largar** (ação livre, no próprio turno em combate) põe o item no mapa, na célula livre a até 1 célula sem parede nem porta fechada no caminho (sem nenhuma: aos pés; sem token: fica em "Largado" na ficha). **Pegar** = 1 Ação, a até 1 célula, só no próprio turno. O livro é `M6.state.drops` (**só o Mestre escreve**; o jogador pede por `dropreq`/`pickreq` em `campaign_rolls` e o primeiro pedido leva). O inventário é **derivado do livro** (`E.dropReconcile`): nunca mova um item caído mexendo só na ficha, e nunca ponha imagem no estado.
- **Defesa:** DF = 10 + proteções + estados + **DES** (sem proteção Pesada vestida nem excesso de carga). A DES sozinha não conta como "bloqueio" (`armored`).
- **Atributos (`js/10`, nunca somar de novo na UI):** FOR carga 3+FOR e dano CaC/arremesso (DES em armas Leves e Briga ágil, `E.damageBonus`); CON +VT máximo, redução de bloqueio e Combustão CON+2; PRE +ES máxima e blindagem do 1º dano de Lucidez por cena; INT perícias extras INT−1 e cura médica; PER DT furtiva 10+PER e Lucidez na Trégua; CAR/APA bônus sociais. Máximos sempre por `E.maxStats`/`dmax`, nunca direto de `STAGES`. Criaturas (`beastId`) não somam esses benefícios.
- **Efeitos fora do combate:** `E.situations` (+d20 que o jogador marca na ficha ou na Mesa; os de `QUANDO_AUTO` o combate aplica sozinho), `E.grant`/`T3.vertGrant` (Comando Tático 1×/cena com Ação de Movimento; Inspiração ao grupo), `E.healBonus`/`E.healDice`/`E.supportBonus` (Sutura, Síntese e Trégua).
- **Vertentes:** treino em `d.vertentes`; o treino antigo (`extraSkills`/`skillUpgrades`) nunca é apagado e vale cheio até virar vertente. Fora da especialização: metade do grau (`E.generalist`) mais o +V inteiro, sem efeito tático; `requiresTraining` bloqueia. Dados só em `PERICIA_DEFS`/`VERT_DEFS` (`rules.pericia`/`rules.vert`).
- **Dano de Lucidez:** todo lançamento passa por `E.lucidityShield`/`E.applyLucidityDamage` (PRE reduz o 1º da cena; uso em `d.lucShieldUsed`, interruptor na ficha, zera no fim da cena). Nunca subtraia `lucidity` direto em código novo.
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
- Uma mudança avisa **só os jogadores afetados**, pelo alerta "!" do Perseus (`hits29`: quem tem a vertente ou a perícia; valores de tiro só para quem tem arma ou treino; medicina só para quem tem Medicina).
- Seções da central: `attr` (benefícios), `pericia` (nome e descrição), `vert` (criar, editar, excluir; efeitos estruturados), `num` (valores de combate). `attr`, `pericia` e `num` não criam nem excluem: só editam e voltam ao padrão.
- Textos do Manual ficam na chave `manual`; números e catálogos, na chave `rules`. As duas atualizam ao vivo, sem SQL.
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

- **Arcade visual, Onda 1 · Motor gráfico (`?v=2026112702`)**: novo `js/60f-arcade-gfx.js` (`GFX60`) no início da `QUEUE` do `60d`, com sprites/tilesets procedurais em cache, paralaxe, luz, sombras, partículas, hit-stop só visual e HUD (estilos no fim do `css/13`). Os jogos passam a usá-la a partir da Onda 2; a única diferença visível é que, com movimento reduzido, o tremor de tela some e o clarão fica fraco.
- **Arcade visual, Onda 2 · Lote 1 (`?v=2026112703`)**: Corredor do Vazio (palco em paralaxe por bioma, dia e noite, mini-chefes desenhados), Salto Astral (um céu e um tipo de plataforma por Torre, mais o Infinito) e Block Blast Astral (relicário de latão, blocos de esmalte, gelo, trancas e gemas desenhados) usam o `GFX60`, com HUD em chips e contagem regressiva própria. Só visual: regras, pontuação, semente e rede iguais. A arte de cada jogo fica no próprio arquivo (`rnArt40`, `saArt56`, `bbArt47`). **Teste manual:** uma partida de cada no celular, a Mesa com fantasmas no Corredor e no Salto, e `prefers-reduced-motion` ligado.
- **Arcade visual, Onda 3 · Lote 2 (`?v=2026112704`)**: Rhythm (um santuário por Semana, notas e receptores desenhados), Fuga (cenário e ladrilhos por fase, também no Infinito), Salto Vazio (tileset por capítulo, serras, chaves, porta e medalhas desenhadas) e Corrida (maquete por pista, karts, marcas de pneu e ícones dos rituais) usam o `GFX60`, com HUD em chips e contagem regressiva. Só visual: janelas, física, pontuação, semente e rede iguais; no Rhythm os Perseus passaram para trás das notas. Arte em `rhArt38`/`fuArt38` (`js/50`), `svArt41` (`js/51`) e `ktArt42` (`js/52`). **Teste manual:** uma partida de cada no celular, Rhythm 1v1, Mesa com fantasmas na Fuga, no Salto e na Corrida, e `prefers-reduced-motion` ligado.
- **Arcade visual, Onda 4 · Lote 3 (`?v=2026112705`)**: UNO (mesa de feltro, cartas desenhadas com um símbolo por Elemento, relógio e diário da mesa), Defesa do Santuário (um terreno por mapa, totens por Elemento e nível, Traumas e chefes animados), Trono do Mestre (salão do trono, medidores em vitral, retratos pintados nas cartas) e Sudoku (grimório, pistas em serifa, erro marcado também com X, ferramentas com ícone) usam o `GFX60`, com HUD em chips e contagem regressiva. Só visual: regras, áreas de clique, pontuação, semente, rede e cartas ocultas iguais. No UNO, a mão revelada pela Carta de Poder agora aparece por cima do descarte. Arte em `unoArt43` (`js/52`), `sdArt44` e `trArt45` (`js/53`) e `skArt46` (`js/54`). **Teste manual:** uma partida de cada no celular, UNO em Mesa com convidado (Revelar, Troca e Delatar) e `prefers-reduced-motion` ligado.
- **Arcade visual, Onda 5 · Lote 4 (`?v=2026112706`)**: DOOM (paredes, chão e teto texturizados por andar, Perseus corrompidos, itens e armas desenhados, HUD diegético; no aparelho lento o raycast desenha metade das colunas), Julgamento (um palco e um réu por chefe, balas e almas desenhadas, também no PvP), Rinha (uma arena por rival, lutadores animados com golpes, defesa, K.O. e Supremo) e Abismo (salas, portas, inimigos, chefes, relíquias e luz por andar) usam o `GFX60`, com HUD em chips e contagem regressiva. Só visual: regras, hitboxes, pontuação, semente, rede, predição do convidado e energia oculta do Arquiteto iguais. Arte em `dmArt48` e `juArt49` (`js/55`), `riArt50` e `abArt51` (`js/56`). **Teste manual:** uma partida de cada no celular (fluidez do DOOM), Julgamento, Rinha e Abismo em Mesa com convidado, e `prefers-reduced-motion` ligado.
- **Arcade visual, Onda 6 · Lote 5 (`?v=2026112707`)**: Poço das Almas (poço de pedra com água espectral, pinos de alma com um desenho por tipo, lançador de bronze, balde em cálice e HUD de almas, multiplicador e poder), Teosofia Clicker (biblioteca à luz de velas, grimório animado, ícones próprios para os 14 geradores e as melhorias, placas, orbe, fenda e árvore de prestígio desenhados), Volley (quatro quadras: praia, cais em ventania, Lua e forja, com rede, torcida, bola de gomos, sombras e placar) e Voo (um céu em paralaxe, colunas, chão e clima por Céu e no Infinito, asas, morcegos, anéis e poderes desenhados). Somente visual: a predição do convidado no Volley não mudou.
- **Arcade visual, Onda 7 · Lote 6 (`?v=2026112708`)**: Coleta de Essência (oficina alquímica com frascos, perigos, poderes e Colosso desenhados, Caldeirão e Impulso diegéticos), Eco da Memória (uma Câmara por regra, medalhões apagado/aceso/falso e painel de "observe / sua vez") e Jogo da Velha (mesa ritual, marcas talhadas, fichas dos jogadores). Botões de toque de todos os jogos com ícones SVG, ≥ 44 px e sem sobreposição (`GFX60.dressPad` envolve o `padBind`; o `data-k` não muda; estilos `.pad60` no `css/13`). Com isso os 22 jogos estão com o visual novo. Somente visual.
- **Regras, Onda 8 · Motor e catálogo (`?v=2026112709`)**: benefícios diretos dos 8 atributos no motor (Vital +CON, Essência +PRE, DES na Defesa, FOR/DES no dano, perícias extras INT−1), 18 perícias e 48 vertentes (a especificação cita 49, mas lista 48) em `js/09b`, generalismo, migração idempotente das fichas e cobertura +4/+6. A interface de vertentes, Bloqueio/Manobras, Tiroteio, itens caídos e Manual vêm nas Ondas 9–13. API no `ARQUITETURA.md`. **Teste manual:** ficha antiga logada (Vital/Essência cheios sobem, bônus iguais), ataque corpo a corpo com dano +FOR, DF na Mesa para jogador e Mestre.
- **Regras, Onda 9 · Ficha (`?v=2026112710`)**: benefícios dos 8 atributos junto de cada um (`js/60g` + `css/15`), alerta de proteção pesada/sobrecarga, Blindagem de Lucidez ligada a todos os lançamentos de dano, contexto social (CAR/APA) nas rolagens da ficha e aba Especializações (treinar, escolher a vertente do treino antigo, rolar, generalista ÷2). Testado só com ficha local falsa. **Teste manual:** logado, jogador e Mestre treinam uma especialização, rolam com o histórico da mesa ligado e tiram Lucidez pela ficha e pela Mesa.
- **Regras, Onda 10 · Corpo a corpo (`?v=2026112711`)**: marcador de Reação (barra da ordem, HUD, Mesa e ficha), Guarda Fechada, Bloqueio com os 4 desfechos e Contra-Ataque, Desarmar, Derrubar, Agarrar/Escapar/Soltar e Empurrar no mapa com alerta de colisão, condições Agarrado/Segurando e efeitos das vertentes corpo a corpo e de arremesso. Sem SQL novo. Testado só com campanha falsa (Mestre controlando os dois lados). O desarme deixa a arma em "Largado" (`equipped:false`) e dispara `T3.disarmHooks` / `tulpa:disarm` para a Onda 12. **Teste manual:** Mestre e jogador logados em aparelhos separados: bloqueio, contra-ataque, cada manobra nos dois sentidos, empurrão contra parede (o Mestre precisa estar online) e a barra de combate no celular.
- **Regras, Onda 11 · Tiroteio Tático (`?v=2026112712`)**: seletor de contexto do tiro (detectado pelo mapa e ajustável), Mergulho com os 5 desfechos e deslocamento, 2º Disparo, Fogo de Supressão com Suprimido e Tiro Livre, Mirar, trava de movimento que sobrevive ao F5, crítico balístico com Sangrando, as 5 especializações, barulho do disparo para a IA e painel Tiroteio na ficha. Sem SQL novo. Testado só com campanha falsa (Mestre nos dois lados). **Teste manual:** Mestre e jogador em aparelhos separados com mapa: os dois lados do Mergulho (o Mestre online move o token), supressão com o alvo andando, queima-roupa com bloqueio, escopeta empurrando, arco silencioso contra inimigo em patrulha e o seletor no celular.
- **Regras, Onda 12 · Itens caídos no mapa (`?v=2026112713`)**: desarmar e "Largar no mapa" (inventário, menu do token e HUD do combate) criam o item no chão, com ícone, ficha do item (hover, foco ou toque), névoa e visões do Mestre, botão "Pegar Item (1 Ação)" e "Devolver" para o Mestre. Sem SQL novo. Testado só com campanha falsa. **Teste manual:** Mestre e dois jogadores em aparelhos separados: desarmar um jogador, os dois pegarem juntos, largar com o Mestre fora da mesa, F5 no Mestre e conferir que nada duplicou nas fichas.
- **Regras, Onda 13 · Manual Vivo e edição pelo Mestre (`?v=2026112714`)**: Manual com os 8 atributos, 18 perícias e 48 vertentes (1.7 a 1.10), Bloqueio, Manobras, Tiroteio, Coberturas, Condições e itens caídos (5.12 a 5.17), tudo lido dos dados do motor; textos antigos atualizados; central ⚙️ e lápis no Manual editam benefícios, números, perícias e vertentes (criar/excluir, com editor de efeitos); situações de vertente, +d20 concedido, curas de especialização e seletor da Mesa com vertentes e contexto CAR/APA (`js/60k` + `css/19`). Sem SQL.

**Bloco A (visual do Arcade, Ondas 1–7) e Bloco B (regras novas, Ondas 8–13) concluídos.** Testado só no Edge headless com campanha e Supabase falsos.

### Decisões tomadas na implementação (o Mestre ainda precisa confirmar)
- A especificação cita **49 vertentes**, mas lista 48: nenhuma foi inventada (dá para criar pela central).
- Generalista: metade do grau + **+V inteiro**. Treino antigo ainda sem vertente vale cheio (menos no que exige treino). Rolagem comum da perícia usa o maior grau.
- Bloqueio: casos que as 4 condições não cobrem viram **Parcial**; 20 natural nunca vira Erro Total.
- Agarrado: −1d20 físico (sem desvantagem extra); quem segura fica em "Segurando"; o Agarrado não é arrastado (quem se afasta solta). Retaliação e Contra-Ataque não gastam a Reação.
- Tiro: queima-roupa dá desvantagem sem Pistolas; penalidade de médio/longo alcance é opcional (−1d20, desligada); 20 natural não derruba nem dá 2º Disparo; Caído +2 vale no 2º tiro; supressão acaba no começo do próximo turno do atirador; no mapa, 2 de 3 linhas = parcial e 1 = pesada. **Arremesso** continua somando cobertura na defesa ativa (RF), não na DF.
- Itens: largar é ação livre; pegar custa 1 Ação a até 1 célula; sem célula livre cai aos pés; sem token fica "Largado"; o Mestre pode devolver ao dono.
- Medicina: Sutura e Síntese continuam rolando com o maior grau de Medicina e **qualquer um** pode fazer Sutura (a exclusividade do Atendimento de Emergência não é imposta). O +2 da especialização entra só no sucesso; o +1d4 de Cirurgia (fora de combate) e o apoio psicológico na Trégua são marcados à mão.
- +d20 de situação é marcado pelo jogador e não se acumula na mesma vertente. Comando Tático volta no fim da cena (descanso); a concessão "ao grupo" não tem limite de uso.
- Perícias: o Mestre edita nome e descrição, mas não cria nem exclui perícia.
- **Só texto, sem automação:** apneia e Exaustão (Fôlego), levantar sem movimento extra, +2 em barricadas, tempo de busca pela metade, trancas silenciosas, veículos, forense, "não cura Vital" da Psiquiatria e a ausência de penalidade do Karatê contra lâminas curtas.

### Testes manuais pós-login (Bloco B)
1. Ficha antiga logada: Vital/Essência cheios sobem, bônus iguais; treinar vertente e escolher a do treino antigo.
2. Mestre e jogador em aparelhos separados: o Mestre muda um valor (ex.: Cobertura Parcial) e uma vertente; a ficha, o combate e o Manual do jogador mudam sem F5 e o "!" aparece só para quem é afetado. Conferir que o jogador não vê lápis nem a central.
3. Criar e excluir uma especialização com efeito; o jogador treina e rola.
4. Mesa: rolar especialização com situação e contexto social; Comando Tático em combate (gasta o movimento) e o +1d20 no próximo teste do aliado.
5. Sutura com Atendimento de Emergência, Síntese na Trégua com Cirurgia e descanso com apoio psicológico.
6. Corpo a corpo: Bloqueio, Contra-Ataque, cada manobra nos dois sentidos e empurrão contra parede (Mestre online).
7. Tiroteio com mapa: os dois lados do Mergulho, supressão com o alvo andando, queima-roupa, escopeta, arco silencioso contra inimigo em patrulha e o seletor no celular.
8. Itens no chão: dois jogadores pegando juntos, largar com o Mestre fora, F5 no Mestre sem duplicar.
9. RLS real: jogador não consegue gravar `rules`, `manual` nem o estado da mesa.

### Pendente / próximos passos
0. **Teste manual pós-login da Onda de estabilidade:** névoa nas 3 visões do Mestre e no jogador, música no aparelho do Mestre com um vídeo que dava erro 150, e Volley, Rinha e Abismo com convidado em outra rede.
1. **Confirmar as decisões** listadas acima e rodar os testes manuais do Bloco B.
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
