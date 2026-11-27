/* ===================================================================
   TULPA · ETAPA 11 — Notas de atualização & guia completo
   Abre pelo botão em destaque do menu ⚙ Aparência. Mostra a versão do
   site (meta tulpa-build), avisa quando há novidade (ponto no ⚙ e aviso
   rápido) e reúne, em abas com busca, tudo o que o sistema faz.
   Cada tópico leva uma etiqueta: Exclusivo do Mestre, Jogadores ou Todos.
   =================================================================== */
const G11={tab:'new',q:'',who:'all'};
const SEEN11='tulpa_seen_version';
const build11=()=>{const m=document.querySelector('meta[name="tulpa-build"]');return(m&&m.content&&m.content.trim())||T3.build||'desconhecida'};
const seen11=()=>{try{return localStorage.getItem(SEEN11)||''}catch(e){return''}};
const isNew11=()=>seen11()!==build11();
function news11(){document.body.dataset.news=isNew11()?'1':'0'}
T3.guideNews=isNew11;
const TM='<span class="gd-tag m">👑 Mestre</span>',TP='<span class="gd-tag p">🎲 Jogador</span>',TA='<span class="gd-tag a">👥 Todos</span>';
const KB11=(...k)=>`<span class="gd-keys">${k.map(x=>`<kbd>${x}</kbd>`).join('')}</span>`;
const GW11={m:['gd-tag m','👑 Exclusivo do Mestre'],p:['gd-tag p','🎲 Jogadores'],a:['gd-tag a','👥 Todos']};

/* Conteúdo. w = quem usa: m (só o Mestre), p (jogadores), a (todos). */
const GUIDE11=[
 {id:'new',ico:'🆕',name:'Últimas atualizações',items:[
  {t:'🕹 Arcade 2.0 · Onda 11: Eco da Memória e Jogo da Velha',w:'a',open:1,b:`<ul>
<li><b>🧠 Eco · Jornada.</b> 6 Câmaras com regras próprias: Clara, Veloz, Espelho (repita de trás para frente), Giratória (os Elementos trocam de lugar depois de mostrar), Intruso (luzes cinzentas falsas que você deve ignorar) e Verdade (tudo junto). Você tem 3 Ecos: errar gasta um e repete a rodada.</li>
<li><b>Revelação e Relâmpago.</b> 👁 (ou H) mostra a sequência de novo; ganhe mais uma a cada 5 rodadas. Tocar rápido rende bônus Relâmpago. Agora dá para jogar só pelo teclado: teclas 1 a 5 a partir do topo, no sentido do relógio.</li>
<li><b>Eco na mesa.</b> O anfitrião escolhe a regra (Clássico, Espelho, Giratório ou Intruso) e vale para todos.</li>
<li><b>❌ Velha · 3 variantes.</b> Clássica; <b>Suprema</b>, com 9 tabuleiros (a casa onde você joga manda o rival para o tabuleiro correspondente; quem conquista 3 tabuleiros em linha vence); e <b>Evanescente</b>, onde cada um tem no máximo 3 marcas e a 4ª apaga a mais antiga (⌛).</li>
<li><b>Séries.</b> Partida única, melhor de 3 ou melhor de 5, com o Perseus jogando cada variante em 4 dificuldades. A série termina com resultado, então apostas e missões da Velha agora contam.</li>
<li><b>Conquistas novas:</b> Seis Câmaras, Memória de Elefante, Mente Suprema, Memória Evanescente e 2 secretas.</li></ul>`},
  {t:'🕹 Arcade 2.0 · Onda 10: Salto Astral e Coleta de Essência',w:'a',b:`<ul>
<li><b>⬆️ Salto Astral · Escalada.</b> 5 Torres, cada uma com sua regra: Jardim Astral, Torre de Gelo (as patas escorregam), Ventania (o vento empurra), Mar de Nuvens (nuvens somem depois de um pulo) e Véu Ascendente (a Inexistência sobe atrás de você). Vencer uma Torre abre a próxima; até 3 estrelas por Torre.</li>
<li><b>Inimigos e estrelas.</b> Morcegos e Olhos Corrompidos: pise neles por cima para quicar ou atire uma estrela para cima (Espaço, K ou ✦). Novos poderes: Asas (planar) e Mola de Bolso (super pulo), além de Escudo, Ímã e Foguete. O Infinito mistura vento e a Inexistência depois de 2000.</li>
<li><b>🧪 Coleta · Caldeirão.</b> As Essências agora têm Elemento. Três iguais seguidas fazem uma <b>Trinca</b> (+60 e um efeito: Natureza dá vida, Inexistência devora os perigos, Ilusão é Ímã, Verdade é câmera lenta, Fé é Escudo). Cinco diferentes seguidas fazem um <b>Pentáculo</b> (+200 e Chuva Dourada).</li>
<li><b>Perigos e Impulso.</b> Crânio tira vida, Bomba de Vazio explode onde cai (veja a sombra no chão) e Gelo congela por um instante. Shift, S ou ⚡ dão um Impulso rápido. Poderes novos: Caldeirão Grande e Chuva Dourada.</li>
<li><b>Ondas e Colosso.</b> A cada 25 s vem uma Onda nova; na 5ª, 10ª… desce o <b>Colosso do Vazio</b>. Cada Essência fere o Colosso, Trincas e Pentáculos ferem mais. Derrubá-lo dá +300 e uma vida. Na mesa, todos lutam juntos.</li>
<li><b>Receitas.</b> Campanha de 8 Receitas com meta e tempo, da Poção Verde até A Grande Obra.</li>
<li><b>Conquistas novas:</b> Cinco Torres, Pisão Astral, Mestre Alquimista, Pentáculo, Colosso Caído e 2 secretas.</li></ul>`},
  {t:'🕹 Arcade 2.0 · Onda 9: Tulpa Volley e Voo Além do Véu',w:'a',b:`<ul>
<li><b>🏐 Tulpa Volley.</b> Agora com regra de verdade: no máximo 3 toques por lado (o 4º dá ponto ao rival). Sets de 7, 11 ou 15 pontos (11 e 15 com 2 de vantagem), em set único ou melhor de 3.</li>
<li><b>Ação (S, ↓ ou K).</b> No ar perto da rede: <b>cortada</b> forte para baixo ou <b>bloqueio</b>. No chão: <b>mergulho</b> para salvar bolas baixas.</li>
<li><b>Poder Elemental (E ou L).</b> A barra enche a cada toque e ponto: Cortada Solar (bola de fogo que queima quem devolve), Muralha de Raízes (salva a próxima bola no seu chão), Passo do Vazio (teleporta para baixo da bola), Bola Fantasma (some e confunde o rival) e Olho da Verdade (mostra onde a bola cai e mira no buraco). Na mesa, o Elemento vem da cor do seu Perseus.</li>
<li><b>Arenas e Copa.</b> Clássica, Ventos do Véu, Gravidade Lunar e Bola Pesada. A Copa do Véu tem 4 rivais, até o Perseus Supremo.</li>
<li><b>🦇 Voo Além do Véu.</b> Jornada de 6 Céus de 25 colunas: Crepúsculo, Tempestade (rajadas), Espelho (anéis invertem a gravidade), Abismo (morcegos entre as colunas), Fé (passe por 15 anéis dourados) e Véu (escuridão, só a lanterna ilumina). Cada Céu vale até 3 estrelas. Infinito continua com fases.</li>
<li><b>Óbolos e Rastros.</b> Os Óbolos do caminho ficam guardados e compram 5 Rastros (Fé, Natureza, Ilusão, Vazio e Verdade). Poderes: Escudo, Câmera Lenta, Ímã, Mini e Turbo.</li>
<li><b>Conquistas novas:</b> Copa do Véu, Rali Infinito, Ace, Paredão, Pneu (secreta), Seis Céus, Cem Colunas, Colecionador de Rastros e Céu Estrelado (secreta).</li>
</ul>`},
  {t:'🕹 Arcade 2.0 · Onda 8: Poço das Almas e Teosofia Clicker',w:'a',b:`<ul>
<li><b>🔵 Poço das Almas.</b> Campanha de 15 tabuleiros com pinos móveis, hastes giratórias, portais, rampas, para-choques e pinos blindados (2 acertos). Cada tabuleiro vencido abre o próximo e dá até 3 estrelas.</li>
<li><b>Mestres.</b> Antes de jogar, escolha um poder que os pinos verdes ativam: Multibola (+2 esferas), Bola de Sol (atravessa os pinos), Mira da Verdade (mostra o caminho inteiro), Balde da Natureza (balde gigante) ou Segunda Chance.</li>
<li><b>Êxtase e estilo.</b> O último laranja dispara câmera lenta e zoom, e a esfera cai em baldes de 10 a 100 mil. Bônus: Tiro Longo, Quique Múltiplo (10+ pinos) e Rebote Livre (25 mil num tiro devolve a esfera). O pino roxo vale 500 e muda de lugar a cada tiro. PvP: tiros alternados no mesmo tabuleiro.</li>
<li><b>📖 Teosofia Clicker.</b> 14 geradores, de Suturas ao Olho do Absoluto, e cerca de 90 melhorias: Bênçãos por gerador, melhorias de clique e sinergias (por exemplo, Tulpas dobram as Suturas). Compre ×1, ×10 ou o máximo.</li>
<li><b>Eventos.</b> Orbes Dourados da Fé dão Frenesi ×7, Tempestade de Cliques (×77) ou Chuva de Essência. Fendas de Inexistência dão uma colheita enorme… ou um Colapso que corta a produção pela metade.</li>
<li><b>Despertar Cósmico.</b> Com Essência suficiente, reinicie a run em troca de Fragmentos Celestiais (+3% de produção cada) e compre nós da Árvore de Prestígio: multiplicadores, começo acelerado, ganho fora de jogo até 72 h e mais Óbolos.</li>
<li><b>Óbolos.</b> Registrar no placar converte cada novo marco de Essência (10 mil, 100 mil, 1 milhão…) e cada Despertar em Óbolos do Arcade, sem pagar duas vezes o mesmo marco.</li>
<li><b>Conquistas novas:</b> Fundo do Poço, Êxtase Máximo, Tiro Longo, Quique Múltiplo, Todos os Mestres (secreta), Despertar Cósmico, Caçador de Orbes, Colheita do Vazio, Motor de Realidade e Árvore Desperta (secreta).</li>
</ul>`},
  {t:'🕹 Arcade 2.0 · Onda 7: Rinha de Tulpas e Labirinto do Abismo',w:'a',b:`<ul>
<li><b>🥊 Rinha de Tulpas.</b> 5 lutadores, um por Elemento: Paladino da Fé (lanças de luz), Guardiã da Natureza (chicote de raiz, a mais resistente), Vazio Errante (teleporta pelas costas), Ilusionista (clones) e Oráculo da Verdade (raios rápidos).</li>
<li><b>Golpes.</b> J Leve (rápido, abre combos), K Pesado, L Especial, H Agarrão (quebra a defesa), Espaço Dash (invencível no começo) e S defende. Defender no instante exato do golpe é uma <b>Defesa Perfeita</b>: atordoa o rival e enche a Essência.</li>
<li><b>Combos e Essência.</b> Leve cancela em Leve, Pesado e Especial. A barra tem 3 níveis: U gasta 1 no Especial EX; I gasta as 3 no <b>Supremo</b>, que congela a tela.</li>
<li><b>Modos.</b> Melhor de 3, Torneio (5 lutas até o Perseus Supremo), Treino (boneco, hitboxes com T e dano do combo; Q encerra) e PvP, em que cada um escolhe o seu lutador.</li>
<li><b>🗝 Labirinto do Abismo.</b> Roguelike em 4 andares: Porão, Catacumbas, Plano Astral e Núcleo do Véu. Salas de Combate, Tesouro (1 mutação garantida; trancado a partir do 2º andar), Loja (pise no item para comprar com os Óbolos da run), Pacto (troque 1 coração máximo por poder) e Sala do Chefe, com um alçapão para descer.</li>
<li><b>Sala Secreta.</b> Uma parede rachada esconde a sala: solte uma bomba (E) perto dela.</li>
<li><b>35 Mutações que se combinam:</b> Tiro Triplo, Teleguiado, Perfurante, Explosivo, Raio Contínuo, Orbitais, Bumerangue, Tiro que Divide, Veneno, Gelo, Corrente Elétrica e muito mais. Itens Ativos (Espaço) recarregam a cada sala limpa.</li>
<li><b>Co-op 2.</b> A masmorra é a mesma para os dois, e o pedestal fica com quem pegar primeiro. Caiu? O colega revive você segurando F por perto. Os chefes têm mais vida.</li>
<li><b>Conquistas novas:</b> Defesa Perfeita, Supremo!, Corrente Elemental, Campeão do Torneio, Round Perfeito (secreta), Sinergia, Pactário, Explorador do Abismo, Freguês do Abismo e Ninguém Fica Para Trás (secreta).</li>
</ul>`},
  {t:'🕹 Arcade 2.0 · Onda 6: DOOM e Julgamento da Essência',w:'a',b:`<ul>
<li><b>💀 DOOM: Colapso Mental.</b> Campanha de 8 andares (ou Infinito). Cada andar é um labirinto maior: ache a 🔑 Chave Dourada e a Azul, abra as portas e chegue ao Portal. No 4º e no 8º, o Chefe de Andar sela o Portal e entra em fúria na metade da vida.</li>
<li><b>Exploração.</b> Paredes secretas guardam suprimentos: encare uma parede rachada e aperte <b>E</b> (✋ Usar). O minimapa se revela conforme você olha; <b>M</b> abre o mapa grande.</li>
<li><b>Arsenal.</b> 🗡 Lâmina Astral (infinita), 🔫 Pistola de Luz, 💥 Escopeta de Essência (forte de perto) e ☀ Canhão de Sol (explode; cuidado com a própria explosão). Troque com Q ou 1–4.</li>
<li><b>Recursos e inimigos.</b> ❤ Vital, 🛡 Armadura (absorve parte do dano) e 🧠 Lucidez: orbes roxos a roubam, e sem Lucidez o dano vem 50% maior. Perseguidor Veloz, Atirador de Orbes, Tanque Blindado (resiste a tudo menos explosões) e o Chefe. Um arco vermelho mostra de onde veio o tiro. A/D andam de lado, ←/→ viram.</li>
<li><b>❤️ Julgamento da Essência.</b> Batalha por turnos: <b>LUTAR</b> (pare a barra no centro dourado para um crítico), <b>AGIR</b> (Analisar revela a fraqueza do chefe), <b>ITEM</b> (cura Vital e Lucidez) e <b>POUPAR</b> (quando o nome fica amarelo). Dá para vencer sem ferir ninguém.</li>
<li><b>Chefes e Almas.</b> Cultista da Fé, Tulpa da Natureza e Sombra da Inexistência, cada um com padrões próprios e Fúria; vença os três para enfrentar Perseus, o Juiz. A alma muda no meio da luta: ❤ livre, 💙 com gravidade (pule com W/↑) e 💚 com escudo (as setas viram o escudo; a lança amarela troca de lado). Branco: desvie · AZUL: fique parado · LARANJA: continue se mexendo · roxo rouba Lucidez.</li>
<li><b>PvP: Duelo de Almas.</b> Um é o Arquiteto e gasta Energia em cartas de ataque (teclas 1–7); o outro é a Alma, desvia e contra-ataca na barra. Os papéis invertem a cada rodada.</li>
<li><b>Conquistas novas:</b> Colapso Contido, Caçador de Segredos, Arsenal Completo, Corte Final (secreta), Rota Pacifista, Rota da Lâmina, Absolvido e Mão Firme (secreta).</li>
</ul>`},
  {t:'🕹 Arcade 2.0 · Onda 5: Sudoku Teosófico e Block Blast Astral',w:'a',b:`<ul>
<li><b>🔢 Sudoku Teosófico.</b> Quatro modos: Clássico (Fácil a Pesadelo), Diagonal (as duas diagonais também têm 1 a 9), Relâmpago (contra o relógio; cada acerto dá +4 s) e Série de 12 fases que ficam mais difíceis.</li>
<li><b>Ferramentas.</b> Lápis com auto-limpeza, <b>Anotar</b> (preenche todas as anotações), Dica Inteligente (o 1º toque destaca o grupo e explica a lógica; o 2º aplica) e desfazer/refazer sem limite (Z e Y).</li>
<li><b>Lucidez e sequência.</b> No Difícil, no Pesadelo e nas fases finais da Série, 3 erros encerram a partida. Acertos seguidos sem erro sobem o multiplicador de pontos (até x3).</li>
<li><b>🧱 Block Blast Astral.</b> Clássico Infinito e Aventura com 15 fases: gemas presas, gelo (o duplo pede 2 limpezas), trancas e metas de pontos em jogadas contadas. Cada fase dá até 3 estrelas.</li>
<li><b>Reserva e blocos especiais.</b> Solte uma peça na Reserva para guardá-la; ela recarrega quando você limpa uma linha. ☀ Bomba de Sol explode 3×3 (e reage em cadeia; é a única que abre trancas). 🪙 Cristal de Óbolos rende moedas no fim.</li>
<li><b>Combo contínuo.</b> Cada jogada que limpa sobe o multiplicador; no combo 5 entra o <b>Fervor</b> (x1,5 a mais). Três jogadas sem limpar apagam o combo.</li>
<li><b>Conquistas novas:</b> Olho em X, Relâmpago, Série Completa, Mente Clara (secreta), Reação Solar, Garimpeiro Astral, Fervor Infinito (secreta) e Mapa Completo.</li>
</ul>`},
  {t:'🕹 Arcade 2.0 · Onda 4: Defesa do Santuário e O Trono do Mestre',w:'a',b:`<ul>
    <li><b>🏛 Defesa do Santuário:</b> são 4 mapas com caminhos curvos e bifurcações: Trilha da Fé, Bifurcação das Raízes, Espiral do Vazio e Encruzilhada dos Espelhos. Há uma <b>Campanha de 30 ondas</b>, e vencê-la abre o próximo mapa. Há também o <b>Infinito</b>.</li>
    <li><b>Chefes:</b> um mini-chefe a cada 5 ondas (Arauto Curandeiro, Carcereiro, Matriarca do Enxame) e um Chefe a cada 10 (Colapso, Juiz de Cera, Santo Sem Nome). Eles curam aliados, prendem totens e invocam lacaios.</li>
    <li><b>Totens:</b> sobem até o nível 3 e depois escolhem 1 de 2 especializações, como Coro ou Lança Sagrada na Fé e Buraco Negro ou Apagamento na Inexistência.</li>
    <li><b>Sinergias:</b> dois totens vizinhos no Ciclo ativam um Sub-Elemento. São ☉ Sol (queima), ◌ Desrealização (vulnerável), ⁂ Pofenia (o golpe salta), ✎ Confabulação (revela e confunde) e ✦ Metáfora (alcance e dano). Novos inimigos: rápidos, blindados, invisíveis, regeneradores e divisores. Poderes: 🧱 Muralha de Fé (M) e 🌧 Chuva de Essência (C).</li>
    <li><b>👑 O Trono do Mestre:</b> 5 arcos com elenco fixo (O Combeiro, O Cultista, O Detetive, Perseus Conselheiro e O Monstro). Suas escolhas voltam como <b>consequência</b> 5 a 15 sessões depois.</li>
    <li><b>Bênçãos e maldições:</b> ficam no topo e mudam as barras, como o Café Infinito, a Maldição do Tédio e as Sete Vidas do Perseus. Há uma <b>Crise</b> a cada ano (12 sessões) e <b>duelos no dado</b>, em que a barra é a chance.</li>
    <li><b>Galeria:</b> 18 finais para colecionar. Sobreviver 10 anos dá a Campanha Lendária.</li>
  </ul>`},
  {t:'🕹 Arcade 2.0 · Onda 3: Corrida do Véu e UNO Teosófico',w:'a',b:`<ul>
    <li><b>🏎 Corrida do Véu:</b> são 4 pistas: Anel da Fé, Bosque das Raízes (com lama), Lago Congelado (com gelo, que tira a tração) e Labirinto de Espelhos. Todas têm rampas de turbo e atalhos secretos. Dá para jogar uma <b>Corrida única</b> ou uma <b>Copa de 3 pistas</b> com tabela de pontos (10, 7, 5, 3…).</li>
    <li><b>Drift e mini-turbo:</b> segure Shift ou K numa curva. As faíscas passam de Azul a Laranja e depois a Roxo; ao soltar, você ganha um impulso maior quanto mais longo foi o drift.</li>
    <li><b>Caixas de Ritual balanceadas:</b> quem está atrás ganha itens mais fortes. Os itens são 🌫 Fumaça de Ilusão, 🌿 Raízes da Natureza, ☀ Turbo de Sol (anda na grama sem perder velocidade), 🛡 Escudo de Verdade, ✶ Orbe Perseguidor de Fé e ◐ Pulso de Inexistência, que acerta o 1º lugar. Na volta final, tudo acelera.</li>
    <li><b>🃏 UNO Teosófico:</b> ganhou uma Carta de Poder por Elemento: 👁 Revelar, 🌀 Troca, 🌿 Cura, ◐ Vazio e ✶ Escudo. O Escudo reflete a pilha de +2 ou +4 de volta para quem jogou.</li>
    <li><b>Regras novas:</b> +2 vai em cima de +2, e +4 em cima de +4. Quem zera a Lucidez entra em <b>Colapso</b>: compra 3 e a barra volta cheia, sem sair do jogo. Com 1 carta, aperte <b>TULPA!</b> (ou T); se esquecer e alguém delatar, compra 2.</li>
    <li><b>Formatos:</b> Rodada única, Melhor de 3 ou Pontos até 200. Na Mesa, a aposta da Corrida e do UNO vira pódio quando há 3 ou mais apostadores.</li>
  </ul>`},
  {t:'🕹 Arcade 2.0 · Onda 2: Corredor do Vazio e Salto para o Vazio',w:'a',b:`<ul>
    <li><b>🦖 Corredor do Vazio:</b> a pista atravessa 5 biomas de 1000 m cada: Planície da Fé, Floresta da Natureza, Abismo da Inexistência, Espelho de Ilusão e Salão da Verdade. Cada bioma tem cenário, clima e obstáculos próprios, além do dia e da noite.</li>
    <li><b>Movimentos novos:</b> pulo com altura variável (solte cedo para um pulo curto), pulo duplo no ar, agachar com queda rápida e um <b>Dash</b> com recarga (Shift, E ou →) que atravessa cristais pequenos, voadores e tiros.</li>
    <li><b>Na pista:</b> fendas no chão, plataformas elevadas e voadores em duas alturas. Os poderes são 🛡 Escudo de Fé (salva até de uma fenda), 🧲 Ímã de Óbolos e ⏳ Câmera Lenta de Verdade.</li>
    <li><b>👹 Mini-chefes:</b> na entrada de cada bioma, o chefe dele persegue você por 450 m disparando tiros baixos, altos e ondas no chão. Sobreviver vale +150 pontos. Chegou num bioma, pode começar nele da próxima vez.</li>
    <li><b>🧱 Salto para o Vazio:</b> são 34 fases em 5 Capítulos: Primeiros Passos (as 10 clássicas), Raízes e Molas, Dash do Vazio, Serras e Ritmo, e Chaves da Verdade. Cada capítulo apresenta uma mecânica nova.</li>
    <li><b>Mecânicas:</b> molas, blocos que desmoronam, <b>Dash em 8 direções</b> a partir do Capítulo 3 (J, X ou Shift, mirando com as setas; recarrega no chão e nos cristais ✦), serras que se movem, espinhos que alternam no ritmo e 🔑 chaves que destrancam a saída.</li>
    <li><b>Speedrun:</b> cada fase tem cronômetro e medalha 🥇 🥈 🥉, contador de quedas e o fantasma do seu recorde correndo junto. Na Mesa, todos jogam o mesmo capítulo, com fantasmas e aposta com pódio.</li>
  </ul>`},
  {t:'🕹 Arcade 2.0 · Onda 1: Ritual Rhythm e Fuga Além do Véu',w:'a',b:`<ul>
    <li><b>Tela de preparação:</b> antes de jogar sozinho você escolhe modo, semana, faixa ou fase. Na sala multiplayer quem escolhe é o anfitrião, e todos veem a escolha.</li>
    <li><b>🎵 Ritual Rhythm:</b> campanha de 5 Semanas (Fé, Natureza, Inexistência, Ilusão e Verdade), com 3 faixas de 2 a 2,5 minutos cada. O BPM sobe no refrão e no clímax. Terminar as 3 faixas abre a próxima semana. O modo <b>Semana completa</b> toca as 3 seguidas, e a Lucidez passa de uma faixa para a outra.</li>
    <li><b>Notas novas:</b> longas (segure até o fim, drenam Essência), <b>corrompidas</b> com ✕ (não aperte: tira Lucidez e quebra o combo) e <b>douradas</b> de Sub-Elemento (Essência em dobro e +6 de Lucidez).</li>
    <li><b>✨ Despertar:</b> com a barra dourada cheia, aperte Espaço e os pontos dobram por 8 segundos. <b>Sabotagens</b> (1, 2 e 3) custam 2000 ⚗ e atrapalham o rival por 3 s: 🌫 Neblina de Ilusão, 🕳 Distorção do Vazio e 🌿 Raízes Trêmulas. O Perseus também sabota no Difícil e no Pesadelo.</li>
    <li><b>Avaliação:</b> Perfeito, Ótimo, Bom e Erro, combo, precisão e rank de S+ a D, com a tabela no fim da partida.</li>
    <li><b>🌀 Fuga Além do Véu:</b> 6 fases com música própria, de 1 a 1,5 minuto. Portais de <b>Nave Astral</b> (segure para subir), <b>Gravidade</b>, <b>Velocidade</b> (0.5x a 3x) e <b>Mini-Perseus</b>, além de orbes e rampas. Morreu, recomeça na hora.</li>
    <li><b>🪙 3 Moedas Astrais</b> por fase, em rotas arriscadas. Elas só contam se você terminar a fase. O <b>Modo Prática</b> tem checkpoints manuais (C marca, X apaga), e o <b>Infinito clássico</b> continua lá.</li>
    <li><b>Mesa:</b> corrida até a linha de chegada com os fantasmas dos colegas. Com aposta e 3 ou mais apostadores, o pote vira pódio: 60%, 30% e 10%.</li>
    <li><b>Recompensas:</b> Óbolos extras e XP do Perseus crescem com o rank, a dificuldade, as fases novas e as moedas. Há 10 conquistas novas.</li>
  </ul>`},
  {t:'🌊 Expansão · Onda 3: bestiário, IA, chefes e sinergias',w:'a',b:`<ul>
    <li><b>Bestiário oficial com 18 criaturas</b>, de Capangas a Chefes, com elemento, habilidades e um <b>comportamento de IA</b>: Agressivo, Caçador, Covarde, Protetor, Conjurador, Emboscador ou Chefe. Está no 📖 Manual e na ⚙️ central, e o Mestre pode editar.</li>
    <li><b>Conselho do turno</b> (só o Mestre vê): no turno de um inimigo do bestiário, aparece o alvo sugerido e o motivo, e um toque ataca. A decisão final continua sendo do Mestre.</li>
    <li><b>Chefes com fases</b>: A Mãe das Mariposas, O Relojoeiro Invertido e o Santo Sem Nome mudam de fase sozinhos ao cair para 66% e 33% do Vital, com aviso para a mesa.</li>
    <li><b>Mestre</b>: botão ➕ Criar NPC em cada criatura (a ficha já vem com Vital, Defesa, ataque e efeitos) e uma <b>calculadora de encontro</b> que diz se a luta vai ser Fácil, Equilibrada, Difícil ou Mortal para o grupo.</li>
    <li><b>10 sinergias de estados</b>: combinações como Iluminado + Exposto (Revelado) ou Ofuscado + Iluminado (Cegueira Branca) somam efeitos extras sozinhas.</li>
    <li><b>7 traumas novos</b>, como Despersonalização, Hipervigilância, Pareidolia Crônica e Claustrofobia.</li>
    <li>As tabelas de Aprimoramentos, Ferramentas e Artefatos e Consumíveis agora são <b>editáveis pelo Mestre</b> no Manual, e as mudanças valem no jogo.</li>
  </ul>`},
  {t:'🌊 Expansão · Onda 2: trilhas, itens e aprimoramentos',w:'a',b:`<ul>
    <li><b>6 trilhas novas de Despertar</b>: Corpo Votivo e Caçador do Véu (Lutador), Arquivista do Impossível e Engenheiro de Ruído (Gênio), Liturgista do Sol e Cartógrafo do Nada (Ritualista). Os poderes aplicam bônus, estados, curas e dano sozinhos.</li>
    <li><b>15 armas novas</b>, incluindo arremessáveis táticos (bomba de fumaça, flashbang, água benta, coquetel de ácido, boleadeira), e <b>5 proteções novas</b>.</li>
    <li><b>Ferramentas e artefatos</b> que valem enquanto estão nas mãos, na cintura ou no bolso. Alguns artefatos são amaldiçoados e cobram um preço.</li>
    <li><b>8 consumíveis</b> com botão <b>Usar</b> no inventário: Morfina, Adrenalina, Ansiolítico, Antídoto, Bandagem hemostática, Café extraforte, Sais aromáticos e Pomada para queimaduras.</li>
    <li><b>🔧 Aprimoramentos de armas</b>: até 2 por arma (Fio Afiado, Contrapeso, Serrilha, Bobina Elétrica, Banho de Veneno, Mira Telescópica, Cano Longo, Munição Incendiária, Carga de Sal Grosso e Sigilo Gravado). Eles mudam o dado, o crítico, o peso e os estados da própria arma.</li>
    <li>Corrigido: bônus de talentos com a palavra "até" (como "+10 em Pesquisa e Investigação até o fim da cena") agora valem para todas as perícias citadas.</li>
  </ul>`},
  {t:'🌊 Expansão · Onda 1: rituais, estados e vocações',w:'a',b:`<ul>
    <li><b>15 rituais novos</b>, todos com sigilo próprio: Pele de Casca, Esporos do Sono, Mão do Vazio, Véu da Ausência, Porta que Não Estava Lá, Fantoche de Sombra, Luz da Evidência, Sentença Exposta, Bênção do Limiar, Chama da Devoção, Fotossíntese Sagrada (Sol), Gravidade Esquecida (Desrealização), Profecia Estatística (Pofenia), Álibi Perfeito (Confabulação) e Fábula do Inimigo (Metáfora). O grimório agora tem 70 rituais.</li>
    <li><b>11 estados novos</b> que mexem de verdade no combate: Abençoado, Enraizado, Iluminado, Velado, Exposto, Inspirado, Vaticinado, Desrealizado, Ecoado, Fragmentado e Corroído (dano por turno). Os rituais novos aplicam esses estados nos alvos.</li>
    <li><b>12 vocações novas</b>: Perito Criminal, Enfermeiro de UTI, Legista, Bibliotecário de Acervo Restrito, Médium de Feira, Batedor de Carteira, Chaveiro, Agente Penitenciário, Ator de Teatro, Operador de Drone, Restaurador de Arte e Contrabandista.</li>
    <li>Tudo isso já está no 📖 Manual e na ⚙️ central, e o Mestre pode editar.</li>
  </ul>`},
  {t:'✴️ Grimório redesenhado',w:'a',b:`<ul>
    <li>Os <b>40 rituais</b> de Fé, Natureza, Inexistência, Ilusão e Verdade ganharam <b>sigilos novos</b>, no mesmo estilo dos rituais dos Sub-Elementos. Agora o grimório inteiro tem o mesmo traço.</li>
    <li>Cada desenho mostra o que o ritual faz, usando a linguagem do seu elemento: folhas e raízes na Natureza, luas e vazios na Inexistência, espelhos e duplos na Ilusão, olhos e balanças na Verdade, estrelas e halos na Fé.</li>
    <li>Regras, textos e edições do Mestre continuam iguais. Só a arte mudou.</li>
  </ul>`},
  {t:'✧ Sub-Elementos e 15 rituais novos',w:'a',b:`<ul>
    <li><b>Sol</b> (Fé + Natureza), <b>Desrealização</b> (Natureza + Inexistência), <b>Pofenia</b> (Inexistência + Ilusão), <b>Confabulação</b> (Ilusão + Verdade) e <b>Metáfora</b> (Verdade + Fé) agora são elementos oficiais, com <b>3 rituais inéditos cada</b>: Coroa do Meio-Dia, Lança de Aurora, Jardim Solar, Passo Através da Matéria, Erosão do Real, Chão que Não Existe, Constelação Falsa, Rosto na Parede, Coincidência Fatal, Lembrança Emprestada, Déjà Vu, Testemunha Fabricada, Parábola Viva, Selo do Significado e Oráculo das Imagens.</li>
    <li>Cada ritual e cada sub-elemento tem um <b>sigilo próprio</b>, com as cores dos dois elementos de origem misturadas.</li>
    <li>O <b>Ciclo Elemental</b> agora mostra o fluxo Fé → Natureza → Inexistência → Ilusão → Verdade → Fé, com os sub-elementos entre eles. Tocar num sub-elemento leva aos rituais dele.</li>
    <li>No <b>📖 Manual</b>, capítulo 8, cada sub-elemento tem a sua seção. <b>Mestre:</b> o conceito de cada um é editável (✏️ no Manual ou ⚙️ → Sub-Elementos), e os rituais novos são editáveis como os outros.</li>
  </ul>`},
  {t:'⟡ Diagrama do Ciclo Elemental',w:'a',b:`<ul>
    <li>Os cinco elementos e os sub-elementos que nascem entre eles (Sol, Desrealização, Pofenia, Confabulação e Metáfora) num diagrama só.</li>
    <li>No <b>📖 Manual</b>, capítulo 8: toque num elemento para ir direto aos rituais dele.</li>
    <li>Na ficha, em <b>Registros → Repertório ritualístico</b>, abra "Ciclo Elemental": tocar num elemento filtra os rituais daquele elemento.</li>
    <li>Passar o mouse num elemento acende os dois sub-elementos ligados a ele.</li>
  </ul>`},
  {t:'✴️ Símbolos dos Rituais',w:'a',b:`<ul>
    <li>Os <b>40 símbolos</b> do livro de regras (V1.2) foram redesenhados em vetor, com traço limpo e anel perfeito, mantendo o desenho original de cada um.</li>
    <li>Aparecem nos <b>cartões de ritual da ficha</b>, no <b>menu de combate</b>, na janela de <b>conjuração</b>, no <b>Manual</b>, no resumo rápido e na central ⚙️. Cada elemento tem a sua cor, ajustada para ter boa leitura em todas as estéticas.</li>
    <li>Ao conjurar, o símbolo do ritual brilha na tela por um instante.</li>
    <li><b>Mestre:</b> em ⚙️ Alterações do Sistema → Rituais, dá para enviar um símbolo próprio, voltar ao oficial ou deixar sem símbolo. Rituais novos ganham um selo com a inicial até receberem um desenho.</li>
  </ul>`},
  {t:'📝 Manual com todas as tabelas editáveis',w:'a',b:`<ul>
    <li><b>Mestre:</b> perícias, escolhas por estágio, estágios (Vital, Lucidez e Essência), bônus de Êxtase, economia do turno, portas e as demais tabelas do Manual têm o botão <b>✏️ Editar tabela</b>. Dá para mudar células, adicionar e remover linhas e colunas, e <b>↺ Restaurar original</b> quando quiser.</li>
    <li><b>Vale no jogo:</b> o que muda nas tabelas de perícias, estágios, graus e Êxtase entra direto nas fichas e na mesa de todos, em tempo real. Fórmulas e textos do Manual também podem ser editados.</li>
    <li><b>Jogadores</b> só leem. Os números novos aparecem sozinhos, sem recarregar.</li>
  </ul>`},
  {t:'📖 Manual Vivo: o Manual Oficial dentro do site',w:'a',b:`<ul>
    <li><b>📖 Manual</b> no topo e na Central da campanha: o Manual Oficial (Edição Revisada) inteiro, com sumário, busca instantânea e resumo de Estados e Rituais ao passar o mouse ou tocar no nome.</li>
    <li><b>Sempre igual ao sistema:</b> vocações, trilhas, rituais, itens, estados, traumas, bestiário e regras da mesa vêm dos mesmos dados das fichas e do combate. Mudou na ⚙️ Alterações do Sistema, muda no Manual na hora (e vice-versa).</li>
    <li><b>Mestre:</b> ✏️ ＋ 🗑️ nos textos e nos catálogos, com os mesmos campos validados da central. 👁️ Pré-visualizar como Player esconde os botões. Jogadores só leem.</li>
    <li><b>📥 Baixar PDF Atualizado:</b> gera o PDF do manual com tudo o que vale na sua mesa agora.</li>
    <li><b>Ajustes do Manual Oficial:</b> as vocações com "Percepção" passam a dar +V em <b>Observação</b>, e o talento do Negociador usa <b>Pesquisa</b> no lugar de História.</li>
  </ul>`},
  {t:'📞 Call mais firme, Arcade por regra e tela flexível',w:'a',b:`<ul>
    <li><b>Arcade e Perseus:</b> livres enquanto não há call. Com a call ativa os botões somem; voltam no ⏸ Intervalo ou quando seu personagem está fora do mapa principal. Se a call começar com você jogando, a mesa te chama de volta.</li>
    <li><b>Sair da Call / Entrar na Call:</b> o jogador sai quando quiser (o microfone desliga) e volta pelo botão verde. Sair não libera os jogos.</li>
    <li><b>Em segundo plano:</b> a call continua com a aba em segundo plano, aparece nos controles do sistema e reconecta sozinha ao voltar.</li>
    <li><b>Transmitir Tela:</b> escolha tela inteira, janela ou aba, com áudio opcional. No celular só dá para assistir.</li>
  </ul>`},
  {t:'⚙️ Alterações do Sistema e novos motivos para juntar Óbolos',w:'a',b:`<ul>
   <li><b>⚙️ Alterações do Sistema</b> (só o Mestre, na Central da campanha): crie, edite ou exclua Vocações, Trilhas, Rituais, Itens do manual, Estados (dano por turno, Defesa, não pode se mover, desvantagem…), Traumas, Bestiário, Sub-Elementos e as Regras da Mesa (deslocamento base, DT do Arremesso e de Furtividade). Conteúdo do manual tem ↺ para voltar ao original.</li>
   <li><b>Edição direto na ficha:</b> o Mestre vê ✏️ 🗑️ ＋ nas listas normais (vocação, trilha, rituais, itens e estados). O antigo Painel do Mestre saiu. Para os jogadores a ficha continua limpa.</li>
   <li><b>Na hora, para todos:</b> a mudança chega às fichas e ao combate sem recarregar. Só quem é afetado recebe o aviso: <b>!</b> no card e na aba, um quadro com <i>Antes → Depois</i> e o Perseus contando o que mudou.</li>
   <li><b>🐱 Perseus com mais coisas para comprar</b> (nada muda as regras do RPG): 🪑 decorar o quarto e 🏘️ visitar o quarto dos amigos com 💜 carinho; 🃏 cápsulas com Álbum de 30 figurinhas (Comum, Raro, Épico e Mítico holográfico); ✨ molduras animadas, títulos e efeitos de dado que a mesa vê; 🎯 três missões por dia.</li>
   <li><b>🎰 Apostas amigáveis</b> nas salas multiplayer de Vôlei, Ritual Rhythm, UNO, Rinha e Jogo da Velha: o anfitrião escolhe o valor, quem vencer leva o pote e empate devolve.</li>
  </ul>`},
  {t:'🕹 Arcade a qualquer hora, ✨ Despertar, 🖥️ Transmitir Tela e turno travado',w:'a',b:`<ul>
   <li><b>🕹 Arcade e 🐱 Visitar o Perseus</b> abrem a qualquer momento, pelo topo ou pela barra da mesa. Não precisa de chamada nem de Intervalo. No ⏸ Intervalo continua igual: fecha quando o Mestre retoma.</li>
   <li><b>Perseus arrastável:</b> segure e arraste o gato (mouse ou dedo) para qualquer canto. Clique simples continua abrindo a conversa. Ele lembra o lugar. Para voltar ao canto: ⚙ Aparência › Perseus.</li>
   <li><b>⚙ Aparência mais limpa:</b> o botão ☾/☀ do topo saiu (ele bagunçava as estéticas). Claro e escuro ficam na <b>Estrutura Clássica</b>. Celular e computador agora se ajustam sozinhos.</li>
   <li><b>✨ Despertar:</b> a Trilha não aparece mais sozinha no Estágio 3. O personagem sobe de Estágio sem Trilha até o Despertar acontecer na história. Aí o jogador ou o Mestre toca em <b>✨ Despertar</b> (aba Arquétipo &amp; Trilha) e ele recebe os poderes dos estágios que já alcançou. Fichas que já tinham Trilha continuam como estão.</li>
   <li><b>Combate com turno travado:</b> no mapa só o token da vez se move, inclusive para o Mestre. Na vez de um NPC, o Mestre move só aquele NPC. Na vez de um jogador, o Mestre fica sem mover tokens (menus e fichas continuam livres). Para emergências existe <b>🔓 Destravar Posição Manual</b> no canto do mapa, desligado por padrão.</li>
   <li><b>🖥️ Transmitir Tela</b> na barra da mesa: o Mestre transmite direto para todos. O jogador pede e o Mestre vê <i>“[Nome] quer transmitir a tela — Permitir / Recusar”</i>. A tela abre numa janela que dá para redimensionar, minimizar e pôr em tela cheia, sem mexer no áudio da call (o som da tela começa mudo: 🔇/🔊). O Mestre encerra qualquer transmissão no ⛔.</li>
   <li><b>Metros contados sempre:</b> o arrasto do Mestre com o token do NPC também gasta os 9 m, e o token não "pula" para a grade no fim. Teclado, setas, analógico e arrasto usam a mesma conta.</li>
  </ul>`},
  {t:'🎨 Galeria de Estéticas, Perseus animado e furtividade de verdade',w:'a',b:`<ul>
   <li><b>🎨 Galeria de Estéticas:</b> em ⚙ Aparência, 36 estéticas em 4 categorias (Frutiger, Retrô-Futurismo, Surreais e Liminares, Natureza e Fantasia). Cada uma muda cores, letras, cantos, vidro, sombras, ornamentos, botões e textura da tela. Na aba Clássicas ficam as paletas antigas e a 🎨 Personalizada, que agora também escolhe botões, textura, ornamento, sombra, letras e cantos.</li>
   <li><b>🐱 Perseus sem gravata:</b> visual novo em todo o site (assistente, Arcade, Intervalo e skins). Ele reage com animações ao 20 e ao 1 natural, início de combate, golpes fortes, Morrendo, perda de Lucidez e Colapso, música na mesa, Intervalo, barulhos e conquistas. Dá para desligar em ⚙ do Perseus.</li>
   <li><b>Mapa limpo:</b> nome e barras do token aparecem só no token selecionado, sob o cursor ou na vez dele. Os broches de conquista em volta do avatar só aparecem ao passar o cursor no card.</li>
   <li><b>Furtividade por proximidade:</b> chegar perto de um inimigo, fora do cone dele e andando, rola Destreza + Furtividade (DT 10 + Percepção do inimigo). Falhou: aparece um <b>!</b> no local e os inimigos vão investigar.</li>
   <li><b>Rolagens privadas:</b> Furtividade e portas furtivas mostram o resultado só para quem rolou (e só para o Mestre nas rolagens de NPCs e inimigos).</li>
   <li><b>Mestre com as mesmas opções:</b> NPCs e inimigos também abrem portas normal ou furtivamente e têm 🤫 Rolar Furtividade no menu do token. Inimigos em patrulha ou investigando abrem portas destrancadas no caminho.</li>
   <li><b>Seta de som:</b> quando um inimigo faz barulho perto de você, aparece um <b>!</b> com uma seta apontando a direção (na borda da tela, se estiver fora de vista).</li>
  </ul>`},
  {t:'☠ Inimigos com IA, portas furtivas e 3 visões do Mestre',w:'a',b:`<ul>
   <li><b>3 visões do mapa (Mestre):</b> 🛠️ Edição (paredes, portas, cadeados, cômodos, lâmpadas e rotas dos inimigos), 👁️ Mestre (só a arte, todos os tokens e para onde cada jogador olha) e 🎭 Players (a tela exata de um jogador escolhido).</li>
   <li><b>Inimigo hostil:</b> no menu do token do Mestre, ☠ Tornar inimigo hostil. Comportamento fixo (com giro entre ângulos), patrulha livre no cômodo ou rota traçada clicando no mapa. O cone vermelho/âmbar é bloqueado por paredes e portas fechadas.</li>
   <li><b>Combate híbrido:</b> quem entra no cone começa o combate (Reflexo rolado) junto com os aliados do mesmo cômodo; quem está longe continua em tempo real e pode entrar depois. Sem contato por 5 s, o combate acaba sozinho. Encerrar na mão com inimigos vivos deixa eles 🏳 Rendidos.</li>
   <li><b>Portas furtivas:</b> perto de inimigos, abrir normal ou 🤫 furtivamente (Destreza + Furtividade, DT 12). A falha range mais alto quanto maior a margem, desenha a onda sonora no mapa e os inimigos no alcance vão investigar com “?”.</li>
  </ul>`},
  {t:'🐱 Visitar o Perseus, Loja de Visual e 3 jogos novos',w:'a',b:`<ul>
   <li><b>🐱 Visitar o Perseus:</b> no ⏸ Intervalo, cada jogador cuida do seu Perseus. Barras de 🍖 Fome, 🧼 Higiene, 🧶 Diversão e 💤 Energia caem com o tempo. Dê comida da Cozinha (arraste até a boca), banho com sabonete, esponja e chuveiro, carinho passando o dedo e apague o abajur para ele cochilar. Ele fala frases da lore e muda de cara conforme as barras.</li>
   <li><b>🪙 Óbolos:</b> partidas do Arcade, cuidados e conquistas pagam. Gaste na <b>🛍️ Loja de Visual</b>: pelagens (Cósmico, Esqueleto, Fantasma, Dourado, Cibernético), chapéus, acessórios e cenários do quarto. A pelagem e o chapéu aparecem no seu gato dentro dos mini-games.</li>
   <li><b>🏆 Conquistas e 📊 Ranking</b> agora ficam em abas dentro do Perseus: cards com barra de progresso e recompensa, e o placar da mesa com pontos do Arcade, nível de cuidado e conquistas.</li>
   <li><b>Jogos novos:</b> 🔢 Sudoku Teosófico (lápis, destaques, erros e relógio), 🦖 Corredor do Vazio (pula e agacha, dia e noite, fantasmas da mesa) e 🧱 Block Blast Astral (3 peças, combos e PERFEITO!).</li>
   <li><b>Jogos mais longos e com mais impacto:</b> Voo ganhou fases e poderes (🛡 escudo, ⏳ câmera lenta); Salto Astral ganhou 🛡 escudo, 🧲 ímã e 🚀 foguete; Coleta ganhou ondas, combos e poderes; Tulpa Volley vai a 7 pontos com match point. Todos tremem a tela, soltam partículas e mostram combos flutuantes.</li>
  </ul>`},
  {t:'🗺 Mapa: HUD nos tokens, Ctrl+C / Ctrl+V e vários mapas',w:'a',b:`<ul>
   <li><b>HUD nos tokens:</b> acima de cada token aparecem a barra de Vital e os números ❤ Vital, 🧠 Lucidez e 🌀 Essência. O <b>Vital Temporário</b> aparece em azul-claro listrado no fim da barra (ex.: ❤ 20+6). Os jogadores não veem os números dos inimigos do Mestre nem das fichas escondidas.</li>
   <li><b>Selecionar vários (Mestre):</b> ${KB11('Ctrl')} + clique nos tokens, ou arraste no fundo do mapa para desenhar uma caixa. Arrastar um token do grupo move todos juntos. ${KB11('Ctrl')}+${KB11('A')} seleciona todos.</li>
   <li><b>Copiar, recortar e colar:</b> ${KB11('Ctrl')}+${KB11('C')} copia, ${KB11('Ctrl')}+${KB11('X')} recorta (o token sai do mapa). ${KB11('Ctrl')}+${KB11('V')} mostra o grupo em transparência: clique no destino e ele aparece na mesma formação. ${KB11('Esc')} cancela. Os atalhos valem com o ponteiro sobre o mapa.</li>
   <li><b>Vários mapas:</b> ao trocar de mapa, os tokens <b>não vão junto</b>. Eles ficam guardados no mapa antigo, com a névoa, e voltam quando você retorna. Para levar o grupo: ${KB11('Ctrl')}+${KB11('X')} no mapa antigo, troque de mapa e ${KB11('Ctrl')}+${KB11('V')} no novo. A lista de 🗺 Mapas mostra quantos tokens ficaram em cada um.</li>
   <li><b>Modo Espectador:</b> se o personagem de um jogador ficou em outro mapa, a tela dele escurece, com o aviso de onde ele está e o botão para jogar no 🕹 Tulpa Arcade enquanto espera. No painel, o assento dele ganha um olho riscado. Ele volta a jogar quando o Mestre retorna àquele mapa ou cola o token dele no mapa atual.</li>
   <li>Para mover o mapa no computador, segure o botão direito e arraste (o arrasto com o esquerdo no fundo agora seleciona). No celular, arrastar com o dedo continua movendo o mapa.</li></ul>`},
  {t:'🕹 Tulpa Arcade completo: mais 11 jogos',w:'a',b:`<ul>
   <li><b>🌀 Fuga Além do Véu</b> (Solo, Mesa): corre sozinho no ritmo da música. Toque ou ${KB11('Espaço')} para pular. Depois do portal roxo, o toque inverte a gravidade.</li>
   <li><b>❤️ Julgamento da Essência</b> (Solo, PvP): guie o coração com ${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')} ou arrastando o dedo. Sobreviva às 12 investidas. Ataque <b>azul</b> só fere quem se mexe.</li>
   <li><b>🔵 Poço das Almas</b> (Solo, PvP): mire e solte a esfera. Limpe os pinos laranja. A cesta no fundo devolve a esfera.</li>
   <li><b>👑 O Trono do Mestre</b> (Solo): arraste a carta para um lado. Nenhuma das 4 barras pode zerar nem lotar.</li>
   <li><b>🃏 UNO Teosófico</b> (Solo contra 3 Perseus, Mesa até 6): cartas dos 5 Elementos. <b>+2</b> e <b>+4</b> também tiram Lucidez. Quem zera a Lucidez colapsa e sai.</li>
   <li><b>📖 Teosofia Clicker</b> (Solo): clique no tomo e compre geradores. O progresso fica salvo e rende até 8 h fora. O <b>Lampejo</b> dourado multiplica a produção por 7.</li>
   <li><b>🥊 Rinha de Tulpas</b> (Contra o Perseus, PvP): ${KB11('A')}${KB11('D')} andam, ${KB11('W')} pula, ${KB11('S')} defende, ${KB11('J')} golpe e ${KB11('K')} especial quando a barra enche. Melhor de 3.</li>
   <li><b>🏎 Corrida do Véu</b> (Solo, Mesa): 3 voltas. ${KB11('W')} acelera, ${KB11('A')}${KB11('D')} viram, ${KB11('E')} usa o item (Fumaça, Raízes ou Impulso).</li>
   <li><b>💀 DOOM: Colapso Mental</b> (Solo): ${KB11('W')}${KB11('S')} andam, ${KB11('A')}${KB11('D')} ou arrastar viram, ${KB11('Espaço')} atira. A cada 5 hordas vem um Perseus Colossal.</li>
   <li><b>🧱 Salto para o Vazio</b> (Solo, Mesa): 10 fases feitas à mão, com wall-jump: encoste na parede e pule. ${KB11('R')} recomeça a fase.</li>
   <li><b>🗝 O Labirinto do Abismo</b> (Solo, Co-op 2): ${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')} anda; as setas ou o mouse atiram. Limpe as salas, pegue Mutações ✦ e derrote o Perseus Abissal 💀.</li>
   <li>Agora são <b>24 conquistas</b>, 5 delas secretas.</li></ul>`},
  {t:'🕹 Tulpa Arcade: Ritual Rhythm, Defesa do Santuário e Conquistas',w:'a',b:`<ul>
   <li>No ⏸ Intervalo, o botão <b>🕹 Tulpa Arcade</b> abre o hub. Cada jogo mostra os modos que tem: <b>Solo</b>, <b>Contra o Perseus</b>, <b>PvP 1v1</b> ou <b>Mesa até 6</b> (com fantasmas). Os convites chegam empilhados, até 3 de uma vez.</li>
   <li><b>🎵 Ritual Rhythm</b>: batalha de ritmo. O Perseus (ou o seu rival no PvP) canta uma frase e depois é a sua vez. Aperte ${KB11('←')}${KB11('↓')}${KB11('↑')}${KB11('→')} (ou ${KB11('A')}${KB11('S')}${KB11('W')}${KB11('D')}) quando a seta encostar no alvo. No celular aparecem 4 setas grandes. Acerto dá Essência, erro tira Lucidez. Se a Lucidez zerar, você colapsa. A música é gerada na hora e muda com a dificuldade.</li>
   <li><b>🏛 Defesa do Santuário</b>: escolha um Totem na barra de baixo (ou ${KB11('1')}–${KB11('5')}) e clique no mapa. <b>Fé</b> dá dano; <b>Natureza</b> deixa lento; <b>Verdade</b> revela os Vazios invisíveis; <b>Ilusão</b> faz o inimigo voltar; <b>Inexistência</b> acerta forte e de longe. Clique num totem para melhorar (até o nível 3) ou vender. ▶ chama a onda; ⏩ acelera.</li>
   <li><b>🏆 Conquistas</b>: 13 no total, 4 delas secretas. Ao desbloquear uma, aparece um banner dourado. Elas ficam guardadas na sua ficha e aparecem como broches em volta do seu avatar na mesa.</li>
</ul>`},
  {t:'🔧 Ajustes: menu do token, turno automático, retaliação e mini-games',w:'a',b:`<ul>
   <li><b>Menu do token só com dois cliques</b> (ou toque duplo). Um clique só seleciona ou move. O ✕ fecha o menu.</li>
   <li><b>No celular</b>, a barra de ações fica fina no rodapé (no máximo 20% da tela). O <b>▾</b> recolhe a barra para uma linha só.</li>
   <li><b>Depois de atacar, o movimento trava</b> (🔒). Sem ações sobrando, a vez passa sozinha assim que o ataque se resolve. O aparelho do Mestre avança a ordem sem clique.</li>
   <li><b>Retaliação</b>: a ordem pausa, quem ganhou a retaliação recebe na hora a escolha da arma (ou <b>Abrir mão</b>) e depois tudo volta de onde parou.</li>
   <li><b>Mini-games</b>: <b>🎚 Dificuldade do jogo</b> no hub (física e desafios; numa sala vale a do anfitrião). No vôlei a bola passa do teto e uma seta mostra onde ela vai cair. O Salto Astral sempre gera degraus alcançáveis. Os colegas aparecem como fantasmas em todos os jogos.</li></ul>`},
  {t:'⚔ Combate dentro do mapa tático',w:'a',b:`<ul>
   <li><b>⚔ Iniciar Combate</b> ${TM} (botão em cima do mapa): rola na hora o Reflexo de todos com o olho ligado, mostra os dados e monta a ordem. Ninguém precisa clicar para rolar.</li>
   <li>A vez de cada um aparece no mapa: <b>anel dourado</b> e a etiqueta <b>⚡ SEU TURNO</b> em cima do token. A barra acima do mapa mostra a ordem da rodada.</li>
   <li>Embaixo do mapa fica o painel do turno: <b>👣 Movimento</b> (9 m), <b>⚔ Ação Padrão</b> (1, +1 no Acerto Violento), <b>⚡ Talento</b> e <b>🔁 Saque rápido</b> (livres, 1 por turno) e <b>🛡 Reação</b>.</li>
   <li><b>Atacar</b>: escolha a arma e <b>clique no token</b> do alvo. Corpo a corpo só em quem está ao lado; à distância, a parede bloqueia e a quina dá <b>cobertura</b> (+4 na defesa).</li>
   <li><b>💣 Arremessar</b>: mire o explosivo no mapa. A DT do Arremesso sobe com a distância; se falhar, desvia. Todos no raio levam o dano (Resistência DT 12 reduz à metade).</li><li>Quando a Ação Padrão acaba, a vez <b>passa sozinha</b> (1,5 s, ou 6 s se ainda dá para andar). <b>Segurar a vez</b> cancela.</li><li>O <b>Acerto Violento</b> dá +1 ação só uma vez por turno, e a <b>Retaliação</b> acontece uma vez por turno (contra-ataque não gera outro).</li><li>Com o mapa em <b>⛶ tela cheia</b>, a barra de ações aparece por cima dele na sua vez, junto com as janelas de arma, defesa e rolagem.</li></ul>`},
  {t:'✋ Levantar a mão, dificuldade do Perseus e tela cheia',w:'a',b:`<ul>
   <li><b>✋ Levantar a Mão</b> ${TP}: botão na barra da mesa, ao lado da call. O card ganha um ✋ dourado que todos veem e o Mestre ouve um aviso discreto.</li>
   <li><b>✓ Baixar Mão</b> ${TM}: clique no nome na barra (ou no ✋ do card) quando der a palavra. Com várias mãos, use <b>Baixar Todas as Mãos</b>. A lista segue a ordem em que levantaram.</li>
   <li><b>Dificuldade do Perseus</b> no Tulpa Volley e no Jogo da Velha: 🌱 Fácil, ⚖️ Médio, 🔥 Difícil e 💀 Pesadelo. No Pesadelo do Jogo da Velha, o melhor resultado possível é empatar.</li>
   <li><b>⛶ Tela Cheia</b> nos jogos. No celular deitado, o jogo ocupa a tela toda e os botões ficam translúcidos por cima.</li>
   <li><b>Intervalo travado</b> para jogadores: só o Mestre encerra. Dá para ir e voltar entre a espera e os mini-games.</li></ul>`},
  {t:'🎮 Mini-games de intervalo',w:'a',b:`Durante o ⏸ Intervalo aparece o botão <b>🎮 Mini-Games de Intervalo</b> e o <b>Placar da Pausa</b>. São 6 jogos inspirados no Pou, com até 6 pessoas por sala, cada uma com um Perseus de cor diferente. Quando o Mestre retoma a sessão, os jogos fecham sozinhos na tela de todos.`},
  {t:'Etapa 11 · Neblina só no cômodo atual, portas, luzes e lanterna',w:'a',b:`<ul>
   <li><b>Neblina sem memória:</b> um cômodo só fica limpo enquanto o seu token está dentro. Ao sair, a névoa volta em cerca de 0,2 s. Pela porta aberta você vê só o feixe do vão; porta fechada bloqueia tudo.</li>
   <li><b>Fechar portas:</b> qualquer um abre e fecha uma porta destrancada. O cadeado é só do Mestre.</li>
   <li><b>Lâmpadas e interruptores</b> para o ambiente escuro. O ícone 💡 do interruptor só aparece quando a sua luz passa por cima dele.</li>
   <li><b>⚡ Queda de energia</b> ${TM}: as luzes piscam e apagam para todos.</li>
   <li><b>🔦 Lanterna liga/desliga</b> ${TP} pelo botão ou pela tecla ${KB11('F')}.</li>
   <li><b>Este guia</b>, com busca, abas e a versão do site.</li></ul>`},
  {t:'Etapa 10 · Paletas, câmera particular e mapa tático',w:'a',b:`<ul>
   <li>5 paletas de cores, mais <b>Personalizado</b> (5 seletores de cor) e <b>Automático</b>.</li>
   <li><b>Câmera particular:</b> cada pessoa move e aproxima só a própria tela.</li>
   <li><b>Ponto de destaque</b> ${TM}: o laser 🔴 aparece pulsando para todos.</li>
   <li><b>Andar com ${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')} ou analógico</b>, com o triângulo dourado marcando a frente do token.</li>
   <li><b>Editor do Mestre:</b> paredes com colisão, portas com cadeado e som, cômodos com névoa individual.</li>
   <li><b>Ambiente escuro</b> ${TM} com visão por raycasting: paredes bloqueiam a luz.</li></ul>`},
  {t:'Chat da mesa',w:'a',b:'Mensagens para <b>Todos</b>, só para o <b>Mestre</b> ou em <b>particular</b> com outro jogador. O histórico fica neste aparelho e a aba mostra um selo de mensagens não lidas.'},
  {t:'Call de voz mais estável',w:'a',b:'A conexão passou a usar servidor TURN (funciona atrás de redes difíceis), reconecta ao sair e entrar e avisa quando o navegador bloqueou o som. O botão <b>🔎</b> mostra a versão do site de cada pessoa e o tipo de rota, para descobrir quem está com a versão antiga.'},
  {t:'Música do YouTube',w:'a',b:`${TM} adiciona links à playlist; o site confere o vídeo antes. ⚠ só aparece quando o YouTube recusa o vídeo de verdade. O volume da música é individual.`},
 ]},
 {id:'map',ico:'🗺',name:'Mapa tático & iluminação',items:[
  {t:'Câmera, zoom e ferramentas da barra',w:'a',b:'A câmera é <b>só sua</b>: arraste o mapa vazio, use a roda do mouse ou a pinça no celular, ou os botões − ＋ e ⤢ (enquadrar tudo). O botão <b>🎯</b> mantém o seu token na tela enquanto você anda. Clique duplo no mapa centraliza naquele ponto. O botão ⛶ abre em tela cheia. A barra também tem a <b>📏 régua</b>, que mede em metros.'},
  {t:'Andar, correr e virar o token',w:'p',b:`<ul><li>${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')} ou setas andam. ${KB11('Shift')} corre.</li><li>O <b>mouse</b> aponta a direção; ${KB11('Q')} e ${KB11('E')} giram.</li><li>No celular aparece o <b>analógico</b> no canto da tela.</li><li>Arrastar o token também funciona, mas ele não atravessa paredes nem portas fechadas.</li><li>O <b>triângulo dourado</b> na borda do token é a frente do personagem.</li></ul>O Mestre move qualquer token livremente. O teclado só vale depois de você clicar no mapa e fora dos campos de texto.`},
  {t:'Interagir: portas e interruptores',w:'a',b:`Fique perto e <b>de frente</b> para uma porta ou um interruptor e use ${KB11('Espaço')}, um toque rápido em ${KB11('E')} ou o botão <b>✋</b> (no celular ele fica sempre na tela). O texto do botão diz o que vai acontecer: Abrir porta, Fechar porta, Tentar abrir, Acender a luz ou Apagar a luz.`},
  {t:'Portas e cadeado',w:'a',b:`<ul><li><b>Destrancada 🔓:</b> qualquer um abre ou fecha, com som de rangido ou batida. Aberta, deixa passar corpo, visão e luz. Fechada, bloqueia os três.</li><li><b>Trancada 🔒:</b> ninguém abre nem fecha. Quem tenta ouve a maçaneta sendo forçada, e o Mestre recebe um aviso.</li><li>${TM} Só o Mestre vê os cadeados. Clique no cadeado para trancar ou destrancar; clique na porta para abrir ou fechar.</li></ul>`},
  {t:'Neblina por cômodo',w:'a',b:`Quando o Mestre desenha cômodos, cada jogador vê <b>só o cômodo onde o seu token está</b>. Saiu? A névoa volta (sem memória do que já viu). Com a porta aberta você enxerga do outro cômodo apenas o recorte permitido pelo vão e pelo ângulo para onde o personagem olha (cone de 120°). ${TM} Cômodos marcados como <b>revelados</b> (🌫) ficam visíveis para todos.`},
  {t:'Ambiente escuro',w:'a',b:`${TM} liga e desliga no botão <b>🌑</b>. No escuro, o jogador sem luz só enxerga um círculo curto em volta do token. Para ver além: lanterna ligada, ou uma lâmpada acesa no cômodo. As paredes e as portas fechadas bloqueiam a luz.`},
  {t:'Lanterna',w:'p',b:`Vale para quem tem no inventário Lanterna, Tocha, Lampião, Vela, Isqueiro, Sinalizador e similares (itens "no chão" não contam). O botão <b>🔦</b> da barra e a tecla ${KB11('F')} ligam e desligam, com clique metálico. Ela começa <b>desligada</b>. Ligada, projeta um facho de 60° e 8 quadrados pela frente do token e revela interruptores no escuro. Aliados com linha de visão para a área também enxergam o feixe.`},
  {t:'Lâmpadas e interruptores',w:'a',b:`<ul><li>${TM} No editor, <b>🔆 Lâmpada</b>: clique dentro de um cômodo. <b>💡 Interruptor</b>: clique perto de uma parede. Ele liga e apaga as lâmpadas do mesmo cômodo. Sem cômodo, a lâmpada ilumina um raio de 6 quadrados.</li><li>Lâmpada acesa ilumina o cômodo todo para quem está dentro. Por uma porta aberta, só a parte que o seu cone alcança.</li><li>${TP} No escuro, o ícone 💡 só aparece quando o facho, o círculo de tato ou uma área acesa passa por cima dele.</li><li>${TM} Clique numa lâmpada para ligar ou apagar à distância. O editor tem "Ligar todas" e "Apagar todas as luzes".</li></ul>`},
  {t:'⚡ Queda de energia',w:'m',b:'O botão <b>⚡</b> da barra faz as luzes piscarem por cerca de 1,4 s para todos e deixa todas as lâmpadas do mapa apagadas. Para religar, clique nas lâmpadas ou use "Ligar todas as luzes" no editor.'},
  {t:'Editor de mapa',w:'m',b:`Botão <b>✏️</b>:<ul><li><b>🧱 Parede:</b> clique pontos; clique duplo (ou ${KB11('Enter')}) termina. Em qualquer ferramenta, <b>segure o botão direito</b> e arraste para mover o mapa.</li><li><b>🚪 Porta:</b> clique numa parede para virar porta, ou dois pontos para criar uma.</li><li><b>▢ Cômodo:</b> clique os cantos; clique duplo (ou ${KB11('Enter')}) confirma.</li><li><b>🌫 Névoa do cômodo:</b> revela ou recobre para todos.</li><li><b>🔆 Lâmpada</b> e <b>💡 Interruptor</b> (veja acima).</li><li><b>✂ Apagar</b> paredes, portas, lâmpadas, interruptores ou cômodos.</li><li><b>🧲 Ímã</b> encaixa nos meios-quadrados e nas pontas existentes. ${KB11('Ctrl')}${KB11('Z')} ou ⤺ desfaz.</li><li>Em mapa com desenho próprio, trace as paredes por cima: o site não detecta paredes na imagem.</li></ul>`},
  {t:'Ponto de destaque (laser)',w:'m',b:`O botão <b>🔴</b> (ou segurar ${KB11('L')}) mostra um ponto pulsando para todos, com uma onda a cada clique. Bom para apontar um detalhe do mapa durante a narração.`},
  {t:'Mapas, grade e tokens',w:'m',b:'<b>🗺 Mapas</b> envia e escolhe imagens; <b>#</b> ajusta a grade (colunas e metros por quadrado). <b>♟ Tokens</b> coloca e tira personagens: "＋ Adicionar token" fecha a janela e o token nasce onde você clicar; "Mudar de lugar" funciona igual. Clicar num token abre o menu: alcance (3, 6, 9 ou 15 m), tamanho (1×, 2× ou 3×), centralizar na sua tela e tirar do mapa.'},
  {t:'Névoa por quadrado (pincel)',w:'m',b:'O botão <b>▦</b> abre o pincel de 1×1, 3×3 ou 5×5 para revelar ou cobrir quadrados da grade, com "Cobrir tudo" e "Desligar névoa". É independente da névoa por cômodo.'},
  {t:'A visão do Mestre',w:'m',b:'Você vê tudo nítido, com névoa e escuro translúcidos, mais o cone (ou a luz) de cada jogador em uma cor diferente, os cadeados e todas as lâmpadas e interruptores.'},
  {t:'Limites que valem a pena saber',w:'a',b:'A visão escondida vale na tela de cada jogador, não no banco de dados. Quem abrir as ferramentas do navegador consegue ler o estado do mapa. A memória de câmera fica no aparelho.'},
 ]},
 {id:'mesa',ico:'🎙',name:'Mesa, voz & música',items:[
  {t:'Visão de Mesa',w:'a',b:'O Mestre fica na caixa do topo e os jogadores ocupam os lados, na ordem de chegada, sempre equilibrados. Embaixo de cada foto ficam Vital, Essência, Lucidez, a DF e os estados. O botão <b>⋯</b> abre os controles. O mapa fica no centro.'},
  {t:'Falando como…',w:'m',b:'Escolha com um clique se você está <b>narrando</b> (a máscara) ou falando como um NPC ou chefe. A caixa do topo muda junto.'},
  {t:'Chamada de voz',w:'a',b:`${TM} clica em <b>📞 Iniciar call</b> e todos na Visão de Mesa entram. Quem fala ganha o <b>contorno verde</b> na foto. 🎙 muta o seu microfone. ${TM} O <b>🤫 Sussurro</b> marca jogadores que se ouvem em particular. Se você não escuta ninguém, toque na tela: o navegador bloqueia o som até o primeiro toque. O botão <b>🔎</b> mostra a versão e a rota de cada pessoa; versões diferentes pedem Ctrl+F5.`},
  {t:'Chat',w:'a',b:'Aba <b>💬 Chat</b> do dock da mesa. Escolha para quem enviar: <b>Todos</b>, o <b>Mestre</b> ou um jogador (particular). O histórico fica neste aparelho; o selo vermelho mostra mensagens novas.'},
  {t:'Música e Intervalo',w:'m',b:`Aba <b>🎵 Música</b>: cole links do YouTube e dê um <b>momento</b> a cada um (ex.: Revelação da Sala). Uma música com o momento <b>Intervalo</b> vira a música de espera do botão <b>⏸ Intervalo</b>, que pausa a sessão. Também dá para pedir ao Perseus: “toca a música para revelação da sala”.`},
  {t:'🎮 Mini-games de intervalo',w:'a',b:`<ul><li>Só durante o <b>⏸ Intervalo</b>: o botão fica no centro da tela de pausa, junto do <b>🏆 Placar da Pausa</b> (recordes e vitórias do dia).</li><li><b>Solo / Contra o Perseus</b> ou <b>👥 Sala até 6</b>. Na sala, o anfitrião usa <b>✉ Convidar Jogadores</b> (pessoas marcadas ou chamado aberto); quem recebe vê <b>Aceitar Desafio</b>. Salas abertas também aparecem na lista do hub.</li><li>Cada jogador entra com um Perseus de uma cor (Roxo Místico, Carmesim, Esmeralda, Dourado, Ciano, Prata). O Perseus original é a IA.</li><li><b>🏐 Tulpa Volley</b> (até 3×3, 5 pontos), <b>🦇 Voo Além do Véu</b> e <b>⬆️ Salto Astral</b> (os outros aparecem como fantasmas), <b>🧪 Coleta de Essência</b> (3 vidas, mesma arena), <b>🧠 Eco da Memória</b> (eliminação) e <b>❌ Jogo da Velha Teosófico</b> (quem vence fica).</li><li>Controles: ${KB11('A')}${KB11('D')} ou setas, ${KB11('W')}/${KB11('Espaço')} para pular ou bater as asas, clique. No celular aparecem botões grandes ou basta tocar.</li><li><b>Dificuldade</b> (Volley e Jogo da Velha contra o Perseus): 🌱 Fácil, ⚖️ Médio, 🔥 Difícil, 💀 Pesadelo. A última escolha fica guardada. Numa sala de Volley, o anfitrião escolhe o nível do Perseus que completa o time menor.</li><li><b>⛶ Tela Cheia</b> no topo do jogo. Com o celular deitado, o jogo ocupa a tela inteira e os botões ficam translúcidos (mais visíveis só enquanto você aperta). O primeiro toque já pede a tela cheia do navegador.</li><li>Jogadores não fecham nem minimizam o intervalo. O ✕ dos mini-games volta para a tela de espera.</li><li>${TM} Ao clicar em ▶ Retomar a sessão, os jogos fecham na tela de todos.</li></ul>`},
  {t:'✋ Levantar a mão',w:'a',b:`${TP} <b>✋ Levantar a Mão</b> fica na barra da mesa. Clique de novo para abaixar. A mão continua levantada se você recarregar a página e some se você sair da mesa. ${TM} vê quem levantou, em ordem de chegada, com o ✋ dourado no card. <b>✓ Baixar Mão</b> baixa a de um jogador e <b>Baixar Todas as Mãos</b> baixa todas. O aviso sonoro toca só para o Mestre.`},
  {t:'Volume da música',w:'p',b:'O volume é de cada um e fica no topo da mesa. Mudar o seu não muda o que os outros ouvem. Se aparecer um aviso de áudio bloqueado, toque na tela uma vez.'},
  {t:'Imagens, pistas e documentos',w:'m',b:'<b>🖼 Enviar imagem</b>: para <b>todos</b> (fica na aba 📂 Documentos da mesa e só você apaga) ou para <b>jogadores marcados</b> (aparece só para eles e fica na ficha, em Documentos / Pistas).'},
 ]},
 {id:'sheet',ico:'📜',name:'Ficha & combate',items:[
  {t:'Abas da ficha',w:'p',b:'A ficha tem abas para <b>Inventário & Carga</b>, <b>Estados</b>, <b>Lucidez & Trauma</b>, <b>Combate & Defesa</b>, <b>Descanso & Cura</b>, além dos registros, das notas (BN) e dos documentos e pistas recebidos.'},
  {t:'Inventário e lanterna',w:'p',b:'Os itens ficam no inventário e contam para a carga. Para ter o botão 🔦 no mapa, o personagem precisa ter um item de luz (Lanterna, Tocha, Lampião, Vela, Isqueiro…) fora do chão.'},
  {t:'Rolagens: atributo puro e perícia',w:'a',b:'Cada atributo tem um botão <b>🎲</b> para rolar o atributo puro (sem perícia; vale o maior dado). Em cada perícia há um seletor para escolher <b>com qual atributo</b> rolar o teste; o padrão já vem marcado. Na Visão de Mesa, o botão <b>🎲 Rolar</b> oferece as duas coisas.'},
  {t:'Privacidade das rolagens',w:'p',b:'Em ⚙ Aparência, "Rolagens feitas dentro da ficha": <b>🔒 Privadas</b> (só você vê) ou <b>🎲 Mostrar na mesa</b> (aparecem na tela de todos e no histórico, como as da Visão de Mesa).'},
  {t:'Combate',w:'a',b:`${TM} inicia e conduz o combate: ordem de turnos, rodadas e participantes. Todos acompanham pela aba <b>⚔ Combate</b> do dock da mesa, que pisca quando há combate ativo. Os sons de turno seguem a configuração de Sons.`},
  {t:'⚔ Combate no mapa: iniciativa e turno',w:'a',b:`${TM} clica em <b>⚔ Iniciar Combate</b> em cima do mapa. O Reflexo de todos com o olho ligado é rolado na hora e a janela mostra os dados e a ordem (todos veem na mesa e no histórico). O token da vez ganha um <b>anel dourado</b> e a etiqueta <b>⚡ SEU TURNO</b> (para os outros, o nome). A barra acima do mapa mostra a rodada e a ordem; ${TM} tem <b>Próximo ⏭</b> nela.`},
  {t:'⚔ Economia de ações no seu turno',w:'p',b:`<ul><li><b>👣 Movimento: 9 m por turno.</b> Ande com ${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')}, setas, arrastando ou com o analógico. O círculo verde mostra o que resta e o token para no 0. Fora da sua vez você não anda.</li><li><b>0 m</b> se estiver Agarrado, Paralisado, Congelado, Amarrado, Morrendo ou Imobilizado pela carga. <b>Terreno difícil</b> (marcado pelo Mestre) e Névoa da Alma custam o dobro. Gigante Invulnerável dobra.</li><li><b>🏃 Disparada</b>: gasta a Ação Padrão e dobra o movimento (não vale Exausto ou Sobrecarregado).</li><li><b>⚔ Ação Padrão (1)</b>: atacar, curar/Sutura, conjurar, usar perícia, Alerta, levantar-se ou sacar da mochila. O <b>Acerto Violento</b> dá +1.</li><li><b>⚡ Livres</b>: 1 talento por turno, 1 <b>🔁 Saque rápido</b> (cintura/coldre ou bandoleira → mãos), Combustão Vital ao pagar Essência, <b>🎒 Soltar mochila</b>, lanterna ${KB11('F')}, porta e interruptor.</li><li><b>🛡 Reação</b> (fora do turno): a Retaliação aparece com o botão <b>Contra-atacar</b>; rituais de reação aparecem na janela de defesa.</li></ul>`},
  {t:'⚔ Mirar, arremessar e efeitos no mapa',w:'a',b:`<ul><li><b>Atacar</b>: depois da arma, o cursor vira mira e aparece o alcance. Clique no token. Corpo a corpo: só ao lado (até ~2 m). Armas de fogo, arcos e arremesso: alcance da arma e <b>linha de visão</b> (parede bloqueia; Disparo Etéreo atravessa). Quina no caminho: <b>cobertura parcial, +4 na defesa</b>. Se o alvo não estiver no mapa, use <b>Escolher pela lista</b>.</li><li><b>💣 Arremessar</b> (granada, molotov, bomba, mina, lança-granadas, bazuca): o círculo da área segue o cursor e mostra quem será atingido. DT do teste: até 6 m <b>12</b>, até 12 m <b>15</b>, até 18 m <b>18</b>, mais longe <b>20+</b>. Falhou: a explosão desvia alguns metros. Todos na área levam o dano; quem passar na Resistência (DT 12) leva metade. O Molotov deixa Queimando.</li><li><b>Talentos e rituais com alvo</b>: em combate, você clica nos tokens (em área, clique num ponto para pegar todos no raio de 6 m) e confirma.</li><li>Efeitos: rastro do golpe, números flutuantes (−14 VT, CRÍTICO!, ESQUIVOU!, RETALIAÇÃO!). <b>Golpe Repulsor</b> empurra 3 m e para na parede; <b>Brecha Rápida</b> deixa você clicar onde reaparecer (até 5 m); <b>Plano Superior</b> reposiciona até 4 tokens em 6 m.</li><li>${TM}: no editor de paredes, <b>🪨 Terreno difícil</b> marca um cômodo onde andar custa o dobro.</li></ul>`},
  {t:'Bloco de notas (BN)',w:'a',b:'Cada pessoa tem o seu, guardado na ficha (o Mestre tem o dele). Escreva na aba 📝 Notas ou peça ao Perseus: “adiciona no BN: a senha da porta é 1904”.'},
 ]},
 {id:'perseus',ico:'🐱',name:'Perseus & comandos',items:[
  {t:'Quem é o Perseus',w:'a',b:'O gato assistente. Explica regras, dá dicas e guias passo a passo e responde em linguagem natural. Dá para esconder em ⚙ Aparência → Perseus.'},
  {t:'Comandos úteis',w:'a',b:`<ul><li><b>“adiciona no BN: …”</b> guarda uma nota.</li><li><b>“o que tem no meu BN?”</b> ou <b>“busca no BN sobre a porta”</b> lê as notas.</li><li>${TM} <b>“toca a música para revelação da sala”</b> escolhe pelo momento da playlist.</li><li>Pergunte coisas como <b>“como funciona a névoa?”</b>, <b>“como rolar atributo puro?”</b> ou <b>“como funciona a call?”</b>.</li></ul>`},
  {t:'Quando ele não sabe',w:'a',b:'Reformule com outras palavras. Ele reconhece muitos termos (mapa, token, call, sussurro, intervalo, imagem, BN). Este guia tem a busca rápida no topo para o resto.'},
 ]},
 {id:'cfg',ico:'⚙',name:'Configurações & atalhos',items:[
  {t:'Paleta de cores',w:'a',b:'Em ⚙ Aparência: <b>Pergaminho Clássico</b> (claro), <b>Abismo / Noturno</b>, <b>Sombra & Obsidiana</b>, <b>Sangue & Cinzas</b>, <b>Terminal Operacional</b>, <b>Personalizado</b> e <b>Automático</b> (segue o claro/escuro do sistema). A escolha vale na hora e fica neste navegador. O botão ☾/☀ no topo alterna claro e escuro.'},
  {t:'Tema personalizado',w:'a',b:'Escolha <b>🎨 Personalizado</b> e ajuste 5 cores: fundo, painéis, texto, destaque e secundária/bordas. A janela avisa quando o contraste entre texto e fundo é baixo. "Voltar às cores iniciais" desfaz.'},
  {t:'Visualização: celular ou computador',w:'a',b:'<b>Automática</b> se ajusta sozinha ao girar a tela; <b>📱 Celular</b> e <b>🖥 Computador</b> forçam um layout. A janela mostra o que foi detectado e o tamanho da tela.'},
  {t:'Tamanho do texto',w:'a',b:'<b>Normal</b>, <b>Grande</b> ou <b>Extra grande</b>, para a ficha, a mesa e as janelas.'},
  {t:'Privacidade das rolagens',w:'p',b:'<b>🔒 Privadas</b> ou <b>🎲 Mostrar na mesa</b> para rolagens feitas dentro da ficha.'},
  {t:'Perseus',w:'a',b:'<b>🐱 Mostrar</b> ou <b>Esconder</b> o gato assistente.'},
  {t:'Sons e volume',w:'a',b:'<b>Sons</b>: 🔊 Ligados, 🔉 Baixos ou 🔇 Desligados (dados, acertos, críticos, turnos, rituais, portas, interruptores). O <b>volume da música</b> é um controle à parte, no topo da mesa. O microfone se muta no 🎙 da call.'},
  {t:'Atalhos de teclado (mapa)',w:'a',b:`<ul class="gd-list"><li>${KB11('W')}${KB11('A')}${KB11('S')}${KB11('D')} / setas — andar</li><li>${KB11('Shift')} — correr</li><li>${KB11('Q')} ${KB11('E')} — girar o token (mouse também aponta)</li><li>${KB11('Espaço')} ou toque rápido em ${KB11('E')} — interagir com porta ou interruptor</li><li>${KB11('F')} — ligar ou desligar a lanterna</li><li>${KB11('L')} segurado — laser do Mestre ${TM}</li><li>${KB11('Enter')} — terminar linha ou cômodo no editor ${TM}</li><li>${KB11('Esc')} — cancelar o que está sendo desenhado ou posicionado</li><li>${KB11('Ctrl')}${KB11('Z')} — desfazer no editor ${TM}</li><li>${KB11('Ctrl')}${KB11('F5')} — recarregar o site com a versão nova</li></ul>`},
  {t:'Gestos e toque (celular)',w:'a',b:'Arraste o mapa vazio para mover a câmera, use a <b>pinça</b> para aproximar, o <b>analógico</b> para andar e o botão <b>✋</b> para interagir. Toque num token para abrir o menu dele. Os botões do mapa têm o tamanho certo para o dedo.'},
  {t:'Atualizações do site e a versão',w:'a',b:'O site se atualiza no GitHub Pages. Quando há versão nova, aparece um aviso e um <b>ponto brilhante no ⚙</b>. Recarregue com Ctrl+F5 (ou puxe a página no celular). Na call, o 🔎 mostra a versão de cada pessoa: todos precisam estar na mesma.'},
 ]},
];

const norm11=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const plain11=h=>String(h).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ');
GUIDE11.forEach(c=>c.items.forEach(i=>{i.s=norm11(i.t+' '+plain11(i.b)+' '+(GW11[i.w][1]))}));

function item11(c,i,forceOpen){
  const [cls,label]=GW11[i.w];
  return`<details class="gd-item" ${forceOpen||i.open?'open':''}><summary><span class="gd-t">${i.t}</span><span class="${cls}">${label}</span></summary><div class="gd-body">${i.b}</div></details>`;
}
function guideList11(){
  const q=norm11(G11.q.trim()),who=G11.who,out=[];
  const okWho=i=>who==='all'||i.w===who||i.w==='a';
  if(q){
    const terms=q.split(/\s+/).filter(Boolean);let n=0;
    GUIDE11.forEach(c=>{const hits=c.items.filter(i=>okWho(i)&&terms.every(t=>i.s.includes(t)));if(!hits.length)return;n+=hits.length;
      out.push(`<div class="gd-cat">${c.ico} ${c.name}</div>`+hits.map(i=>item11(c,i,true)).join(''))});
    if(!n)return{html:`<p class="gd-empty">Nada encontrado para “${esc(G11.q)}”. Tente outra palavra, como <b>lâmpada</b>, <b>volume</b>, <b>lanterna</b>, <b>porta</b> ou <b>sussurro</b>.</p>`,n:0};
    return{html:out.join(''),n};
  }
  const c=GUIDE11.find(x=>x.id===G11.tab)||GUIDE11[0],items=c.items.filter(okWho);
  return{html:items.map(i=>item11(c,i)).join('')||'<p class="gd-empty">Nada nesta aba para esse filtro.</p>',n:items.length};
}
function guideRender11(){
  const box=$('gdList');if(!box)return;const r=guideList11();box.innerHTML=r.html;
  const st=$('gdCount');if(st)st.textContent=G11.q.trim()?`${r.n} resultado${r.n===1?'':'s'} em todas as abas`:'';
  $$('.gd-tab',$('modalBody')).forEach(b=>{const on=!G11.q.trim()&&b.dataset.tab===G11.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  $$('.gd-who button',$('modalBody')).forEach(b=>b.classList.toggle('on',b.dataset.who===G11.who));
}
function openGuide11(tab){
  const cur=build11(),fresh=isNew11(),was=seen11();
  if(tab)G11.tab=tab;else G11.tab=fresh?'new':G11.tab;G11.q='';
  const head=`<div class="gd-head"><span class="gd-ver" title="Versão do site carregada neste aparelho">Versão <b>${esc(cur)}</b></span>${fresh?`<span class="gd-new">🆕 ${was?'Novidades desde a sua última visita':'Bem-vindo! Comece pelas novidades'}</span>`:'<span class="gd-ok">✓ Você já viu esta versão</span>'}</div>`;
  const search=`<div class="gd-search"><input type="search" id="gdQ" placeholder="Buscar: lâmpada, volume, sussurro, atalhos…" aria-label="Buscar no guia" autocomplete="off" enterkeyhint="search"><span class="sub" id="gdCount" aria-live="polite"></span></div>`;
  const who=`<div class="gd-who" role="group" aria-label="Filtrar por quem usa">${[['all','Tudo'],['m','👑 Só Mestre'],['p','🎲 Só jogadores']].map(([v,l])=>`<button type="button" data-who="${v}">${l}</button>`).join('')}</div>`;
  const tabs=`<div class="gd-tabs" role="tablist" aria-label="Categorias">${GUIDE11.map(c=>`<button type="button" class="gd-tab" role="tab" data-tab="${c.id}">${c.ico} ${c.name}</button>`).join('')}</div>`;
  openModal('NOTAS DE ATUALIZAÇÃO','Guia completo do Tulpa',`${head}${search}${who}${tabs}<div id="gdList" role="tabpanel"></div>`,'Fechar',closeModal);
  const md=document.querySelector('#modalWrap .modal');if(md)md.classList.add('gd');
  guideRender11();
  try{localStorage.setItem(SEEN11,cur)}catch(e){}
  news11();
  const q=$('gdQ');
  q.oninput=()=>{G11.q=q.value;guideRender11()};
  $$('.gd-tab',$('modalBody')).forEach(b=>b.onclick=()=>{G11.tab=b.dataset.tab;G11.q='';q.value='';guideRender11();T3.fx?.('click');$('gdList').scrollIntoView?.({block:'nearest'})});
  $$('.gd-who button',$('modalBody')).forEach(b=>b.onclick=()=>{G11.who=b.dataset.who;guideRender11()});
}
T3.openGuide=openGuide11;
/* tira a largura extra do guia quando qualquer janela fecha */
try{const w=$('modalWrap');if(w)new MutationObserver(()=>{if(!w.classList.contains('open'))document.querySelector('#modalWrap .modal')?.classList.remove('gd')}).observe(w,{attributes:true,attributeFilter:['class']})}catch(e){}
/* ponto de novidade no ⚙ e aviso rápido (só para quem já tinha visitado antes) */
news11();
setTimeout(()=>{try{if(seen11()&&isNew11()&&!sessionStorage.getItem('tulpa_news_toast')){sessionStorage.setItem('tulpa_news_toast','1');toast('✨ O site foi atualizado. Veja as novidades em ⚙ → 📜 Notas de Atualização.')}}catch(e){}},2600);


