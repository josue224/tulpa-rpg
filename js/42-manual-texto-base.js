/* ===================================================================
   TULPA · ETAPA 31 — Manual Vivo: texto base do Manual Oficial
   (Edição Revisada & Consolidada). Cada bloco tem id fixo: as edições
   do Mestre ficam por campanha em campaign_store, chave "manual".
   Marcação simples: **negrito**, *itálico*, linhas "- " viram lista.
   {live:'x'} = componente vivo lido dos mesmos dados do sistema.
   {tb:[...]} = tabela de referência; {f:'...'} = fórmula; {box:t,t:'...'} = quadro.
   =================================================================== */
const MAN31_TITLE='TULPA RPG — Manual Oficial';
const MAN31_SUB='Edição Revisada & Consolidada · Regras Base, Combate Tático, Exploração e Catálogos Completos';
const MAN31=[
{id:'intro',h:'Apresentação',secs:[
 {id:'intro.0',h:'',b:[
  ['intro.p1','A ideia deste manual é servir de apoio sólido e flexível para a sua mesa. Não é obrigatório seguir todas as mecânicas à risca: você pode simplificar regras, adaptar procedimentos ou acrescentar elementos próprios, desde que preserve a coerência e a essência da proposta.'],
  ['intro.p2','O objetivo do **TULPA RPG** é simular, da forma mais próxima possível, a experiência de ser um ser humano em qualquer universo — medieval, contemporâneo ou futurístico. Escolhas, habilidades, vulnerabilidades e limites refletem a complexidade da vida e da consciência humana, abrindo caminho para o estudo das *tulpas* e dos mistérios fundamentados na Teosofia.']
 ]}
]},
{id:'c1',h:'1. Criação de Personagem e Regras Base',secs:[
 {id:'c1.1',h:'1.1 Atributos Primordiais',b:[
  ['c1.1.p1','Os oito atributos primordiais representam o potencial bruto do personagem: **Força**, **Destreza**, **Constituição**, **Inteligência**, **Percepção**, **Carisma**, **Aparência** e **Presença**. Cada ponto em um atributo equivale a **1d20** rolado em testes ligados a ele.'],
  {live:'attrs'},
  ['c1.1.l1','- **Distribuição inicial (Estágio 1):** todos os atributos começam em **1**. O jogador distribui **7 pontos livres**, respeitando o mínimo de 1 e o máximo de **3** por atributo.\n- **Evolução:** a partir do Estágio 2, o limite sobe para **4** por atributo. Pontos extras acumulados são concedidos nos Estágios 2 (+1), 4 (+2), 7 (+3) e 10 (+4).\n- **Equivalência de termos:** sempre que uma regra ou fórmula mencionar *Agilidade (AGI)*, utiliza-se **Destreza**; sempre que mencionar *Vigor*, utiliza-se **Constituição**.\n- **Troca de atributo por teste:** o Mestre pode autorizar ou exigir a rolagem de uma perícia com outro atributo (ou um teste de atributo puro) conforme a situação narrativa — como usar Constituição em vez de Força em Escalada no talento *É Logo Ali*.']
 ]},
 {id:'c1.2',h:'1.2 Perícias e Aptidões',b:[
  ['c1.2.p1','**Todas as 39 perícias começam em 0.** O bônus total de uma perícia é a soma do grau de treinamento (+5, +10 Mestre ou +15 Maestria), do bônus **+V da Vocação**, de bônus fixos (como Êxtase ou ajustes de campanha) e de talentos ou efeitos ativos em cena. Dezoito dessas perícias se dividem em **especializações (vertentes)**: veja a seção 1.7.'],
  ['c1.2.l1','- **+V da Vocação (anos de serviço):** 0 a 9 anos = **+5** · 10 a 39 anos = **+10** · 40 anos ou mais = **+15**.\n- **Grupos de perícias:** *Sociais* (Empatia, Enganação, Etiqueta, Intimidação, Liderança, Persuasão, Sedução); *Agilidade e Movimento* (Acrobacia, Atletismo, Escalada, Esquiva, Furtividade, Natação, Reflexo); *Ataque* (Briga, Armas Brancas, Armas de Disparo, Arremesso); *Testes Físicos* (perícias de Força, Destreza ou Constituição); *Atributos Mentais* (Inteligência, Percepção, Presença, Carisma, Aparência).'],
  {live:'skills'},
  ['c1.2.p2','Cada perícia evolui na ordem **+5 → +10 (Mestre) → +15 (Maestria)** e só pode receber uma escolha de +5. A tabela abaixo resume os limites acumulados por estágio:'],
  {live:'tiers'}
 ]},
 {id:'c1.3',h:'1.3 Estatísticas Vitais e Evolução por Estágios',b:[
  ['c1.3.p1','As três reservas do personagem são **Vital (VT)** (integridade física), **Lucidez** (sanidade e clareza mental) e **Essência (ES)** (energia usada para ativar talentos e rituais). Ao subir de estágio, soma-se a diferença dos novos máximos aos valores atuais; ao descer de estágio, os valores atuais são apenas limitados ao novo máximo.'],
  {live:'stages'}
 ]},
 {id:'c1.4',h:'1.4 O Despertar e a Liberação de Trilhas',b:[
  ['c1.4.p1','O Arquétipo e a Trilha **não são concedidos automaticamente ao atingir o Estágio 3**. O personagem continua evoluindo normalmente seus atributos, perícias e estatísticas vitais, porém sem Trilha, até vivenciar o **Despertar** na narrativa.'],
  ['c1.4.p2','Quando o Despertar ocorre (registrado pelo Mestre ou jogador com o estágio em que aconteceu), a escolha de Arquétipo e Trilha é liberada. O personagem recebe imediatamente os poderes de todos os marcos de Trilha já alcançados (Estágios 3, 5, 8 e 10) e desbloqueia os seguintes conforme progredir.']
 ]},
 {id:'c1.5',h:'1.5 Modo Criação Livre ("Seu Personagem Teria")',b:[
  ['c1.5.p1','Para mesas que desejam liberdade total mantendo apenas a coerência humana, o modo "Seu Personagem Teria" remove os limites estruturais de progressão: permite pontos de atributo ilimitados (até o teto de 10 por atributo), quantas perícias +5/+10/+15 forem coerentes com a história e escolha imediata de Arquétipo e Trilha em qualquer estágio (o personagem já conta como Desperto).']
 ]},
 {id:'c1.6',h:'1.6 Testes de Perícia e Uso de Talentos',b:[
  {f:'Dados rolados = Valor do Atributo da perícia + modificadores em dados (mínimo 1d20)\nResultado = Maior d20 rolado + Bônus total da perícia\nVantagem = Rola o conjunto duas vezes e fica com o maior resultado\nDesvantagem = Rola o conjunto duas vezes e fica com o pior resultado (anula Vantagem)'},
  ['c1.6.l1','- **Modificadores em testes:** sempre que uma regra, estado ou trauma indicar −1 ou +1 em testes de um atributo ou perícia, aplica-se **−1 ou +1 dado (d20)** na rolagem.\n- **Talentos em combate:** ativar um talento de Vocação ou Trilha **não consome a Ação Padrão**, mas cada personagem só pode usar **1 talento por turno** em combate.\n- **Consumo de bônus:** bônus de perícia concedidos por talento (ex.: "+5 em Medicina") são consumidos na primeira rolagem daquela perícia.\n- **Durações roladas (1d4):** estados com duração em 1d4 turnos (como Tempero Enjoativo, Briga Tremenda e Corte Preciso do Lenhador) têm sua contagem reduzida em 1 no início de cada turno do alvo afetado.']
 ]},
 {id:'c1.7',h:'1.7 Especializações (Vertentes) e Generalismo',b:[
  ['c1.7.p1','Cada **vertente** treinada evolui sozinha (**+5** Treinado, **+10** Mestre, **+15** Maestria, mais o **+V** da Vocação) e traz um **efeito tático exclusivo**.'],
  ['c1.7.l1','- **Primeira especialização:** ao treinar uma perícia pela 1ª vez, escolha 1 especialização sem custo extra. Cada especialização a mais na mesma perícia custa 1 escolha de treinamento (ex.: *Briga: Judô +5* e *Briga: Boxe +5*).\n- **Generalismo realista:** com ao menos 1 vertente treinada, usar outra área da mesma perícia vale o grau dividido por {{r:generalistaDiv}} (arredondado para baixo), com o atributo adequado, **sem** o efeito tático. O +V entra inteiro.\n- **Treino específico:** o que está marcado como *Exige treino* (cirurgia, aeronaves, submersíveis e afins) não pode ser usado sem aquela vertente.\n- **Situações:** quando o benefício dá +d20 numa situação fora do combate, marque a opção da situação antes de rolar (na ficha ou na Mesa). Bônus da mesma vertente não se acumulam.\n- **Treino antigo:** fichas antigas escolhem a vertente que recebe o grau já treinado; até lá o bônus continua valendo.']
 ]},
 {id:'c1.8',h:'1.8 Vertentes: Combate & Ação Física',b:[{live:'verts',grupo:'Combate & Ação Física'}]},
 {id:'c1.9',h:'1.9 Vertentes: Ciência, Técnica & Campo',b:[{live:'verts',grupo:'Ciência, Técnica & Campo'}]},
 {id:'c1.10',h:'1.10 Vertentes: Social, Mental & Oculto',b:[{live:'verts',grupo:'Social, Mental & Oculto'}]}
]},
{id:'c2',h:'2. Catálogo de Vocações',secs:[
 {id:'c2.0',h:'',b:[
  ['c2.p1','A vocação representa a vida pregressa do personagem antes de se envolver com a Teosofia. Ao escolher uma vocação, o jogador recebe **+V em três perícias** e acesso a **dois talentos exclusivos**. Cada conceito é intencionalmente aberto para ser adaptado ao histórico do agente.'],
  {live:'voc'}
 ]}
]},
{id:'c3',h:'3. Arquétipos e Trilhas',secs:[
 {id:'c3.0',h:'',b:[
  ['c3.p1','O Arquétipo define o treinamento e o papel principal do agente após o Despertar. Cada um dos três arquétipos — **Lutador** (linha de frente e combate direto), **Gênio** (estratégia, análise e versatilidade) e **Ritualista** (domínio dos elementos e forças paranormais) — possui exatamente **6 Trilhas**, com poderes nos Estágios 3, 5, 8 e 10. Talentos em área sem raio explícito utilizam **6 m** como padrão.'],
  ['c3.p2','*Arsenal Mental:* o custo padrão é 5 / 10 / 20 ES; o Mestre pode autorizar a variante reduzida (1 / 2 / 4 ES) por ficha. A **Arma Favorita** (Estágio 10 de Arsenal Mental e de Lâmina Psíquica) ganha +1 dado de dano e reduz a margem de crítico em 2 permanentemente (ex.: 19–20 torna-se 17–20).']
 ]},
 {id:'c3.1',h:'3.1 Trilhas de Lutador',b:[{live:'track',arch:'Lutador'}]},
 {id:'c3.2',h:'3.2 Trilhas de Gênio',b:[{live:'track',arch:'Gênio'}]},
 {id:'c3.3',h:'3.3 Trilhas de Ritualista',b:[{live:'track',arch:'Ritualista'}]}
]},
{id:'c4',h:'4. Lucidez, Colapso, Êxtase e Traumas',secs:[
 {id:'c4.1',h:'4.1 Protocolo de Colapso',b:[
  ['c4.1.p1','Quando a Lucidez de um personagem chega a 0, dispara-se o **Protocolo de Colapso**:'],
  ['c4.1.l1','- **1º Colapso:** role 1d6. Em 4–6, entra em Êxtase; em 1–3, recebe Penalidade Nível 1. A Lucidez é restaurada para ⌊Máx ÷ 2⌋.\n- **2º Colapso:** role 1d6. Em 4–6, mantém o Êxtase (ou resiste sem aumentar a Penalidade); em 1–3, encerra o Êxtase e a Penalidade sobe +1. A Lucidez é restaurada para ⌊Máx ÷ 3⌋.\n- **3º Colapso:** se estiver em Penalidade Nível 2 ou superior (sem Êxtase), adquire um Trauma Permanente imediatamente. Caso esteja em Êxtase, role 1d6: 4–6 mantém o Êxtase; 1–3 converte em Trauma Permanente. A Lucidez permanece em 0.'],
  ['c4.1.p2','**Efeito da Penalidade de Lucidez (Nível N):** impõe −N dados (d20) em todos os testes ligados aos atributos mentais (Inteligência, Percepção, Presença, Carisma e Aparência).'],
  ['c4.1.p3','**Manutenção do Êxtase e Desistência:** enquanto estiver em Êxtase, todo novo dano de Lucidez exige 1d6 (1–3 encerra o Êxtase). O jogador pode optar por Desistência: encerra o Êxtase, mantém Lucidez em 0 sem adquirir Trauma e entra no estado Desistente (incapacitado até o fim da cena).']
 ]},
 {id:'c4.2',h:'4.2 Bônus de Êxtase',b:[
  ['c4.2.p1','O Êxtase é uma breve onda de clareza e adrenalina que dura até o fim da cena ou até o próximo Colapso.'],
  {live:'extase'}
 ]},
 {id:'c4.3',h:'4.3 Traumas Permanentes',b:[
  ['c4.3.p1','Resultado de colapsos sucessivos, cada Trauma impõe uma penalidade contínua e deve ser acompanhado de uma cena narrada registrada na ficha até que um arco narrativo permita sua superação.'],
  {live:'trauma'}
 ]}
]},
{id:'c5',h:'5. Economia de Turno e Combate Tático',secs:[
 {id:'c5.1',h:'5.1 Mapa e Iniciativa',b:[
  ['c5.1.p1','A unidade padrão do mapa tático é **1 quadrado = 1,5 m** (configurável pelo Mestre). Ao iniciar o combate, todos os participantes da cena rolam **Reflexo**. A ordem vai do maior total para o menor; em caso de empate, vence quem obteve o maior dado individual (persistindo o empate, segue-se a ordem alfabética).']
 ]},
 {id:'c5.2',h:'5.2 Economia do Turno',b:[{live:'turn'}]},
 {id:'c5.3',h:'5.3 Movimento e Restrições',b:[
  ['c5.3.l1','- **Trava pós-ataque:** após realizar um ataque no seu turno, o movimento restante é travado. Ganhar uma ação extra via Acerto Violento não restaura movimento.\n- **Terreno difícil:** cada 1 m percorrido custa 2 m de deslocamento.\n- **Disparada (Correr):** consome a Ação Padrão para dobrar o movimento do turno. Indisponível sob Exausto, Exaurido, Sobrecarregado ou efeitos que impeçam correr.\n- **Movimento 0:** aplica-se sob Agarrado, Paralisado, Congelado, Amarrado, Morrendo, Morto ou Imobilizado pela carga.\n- **Modificadores especiais:** Gigante Invulnerável e efeitos de aceleração dobram o deslocamento; inimigos dentro de Névoa da Alma têm o deslocamento reduzido à metade.']
 ]},
 {id:'c5.4',h:'5.4 Sistema de Ataque e Defesa',b:[
  {f:'Ataque (ATA) = (Atributo da perícia ou da vertente)d20 + bônus\n  • Briga e Armas Brancas = Força | Armas de Disparo e Arremesso = Destreza (a vertente pode trocar)\nDefesa Base (DB) = {{r:db}}\nDefesa (DF) = {{r:db}} + melhor proteção vestida por encaixe (Roupa, Tronco, Cabeça, Escudo) + modificadores\n  + Destreza (sem proteção Pesada nem excesso de carga) + cobertura e posição\nDefesa Ativa (RF) = (Destreza)d20 + Esquiva (viu o ataque) ou Reflexo (surpreendido)\nDano corpo a corpo e arremesso = dados da arma + Força (ou Destreza em armas Leves, Briga ágil ou pela vertente)'},
  ['c5.4.p1','**Ordem fixa de resolução de cada ataque:**'],
  ['c5.4.l1','- **1. Alvo Morrendo ou Morto:** acerta automaticamente, sem conceder ação extra ao atacante.\n- **2. 20 Natural no ataque:** sempre acerta, independentemente da defesa.\n- **3. RF < {{r:db}} (falha contra a DB):** o ataque acerta. Se ATA > {{r:db}}, ocorre um **Acerto Violento** (+1 Ação Padrão para o atacante).\n- **4. ATA < {{r:db}} e RF > {{r:db}} (sem proficiência):** se o defensor possui DF > {{r:db}}, não tem proficiência na proteção e obteve RF ≤ DF, ocorre **Defesa Completa** (golpe bloqueado, sem Retaliação).\n- **5. ATA < {{r:db}} e RF > {{r:db}} (demais casos):** ocorre **Retaliação** (o defensor ganha 1 ação extra imediata).\n- **6. Confronto direto:** compara-se ATA com o maior valor entre RF e DF. Se ATA ≥ maior valor, é **Acerto Normal**. Caso contrário, resulta em **Bloqueio Perfeito** (se DF > RF e DF > {{r:db}}) ou **Esquiva Perfeita**.\n- Corpo a corpo também pode ser respondido com **Bloqueio** (seção 5.12). Armas de disparo seguem o **Tiroteio Tático** (seção 5.14).']
 ]},
 {id:'c5.5',h:'5.5 Retaliação, Críticos e Absorção de Dano',b:[
  ['c5.5.l1','- **Retaliação:** concede 1 ação extra fora do turno (a ordem do combate pausa até o uso ou renúncia). Um ataque feito em Retaliação **não pode ser esquivado**. Limite de **1 Retaliação por personagem por turno**.\n- **Acertos Críticos:** ocorrem quando o maior d20 do ataque cai na margem da arma (20 ou 19–20). Os dados de dano da arma são rolados novamente e somados (bônus fixos não dobram). Em críticos que acertam: armas cortantes, perfurantes e balísticas aplicam Sangrando; armas contundentes e bastão elétrico aplicam Atordoado. Nas armas de disparo balísticas e perfurantes o crítico dobra **só os dados da arma**.\n- **Efeitos automáticos no acerto:** Zarabatana aplica Envenenado; Coquetel molotov e Lança-chamas aplicam Queimando.\n- **Ordem de absorção de dano:** Escudo de Êxtase (anula 1 dano físico) → Resistência a dano (redução fixa) → VT Temporário → Vital.']
 ]},
 {id:'c5.6',h:'5.6 Início do Turno, Estado de Alerta e Vulnerável',b:[
  ['c5.6.p1','No início do turno de cada personagem, resolvem-se nesta ordem: (1) contagem de turnos em Morrendo; (2) dano contínuo (Envenenado 1, Sangrando 1, Queimando 1d4, Afogado 1d4); (3) perda de ação por Atordoado; (4) redução de estados com duração rolada e de rodadas de invocações; (5) impedimento de ação por Paralisado, Morrendo, Desistente ou Morto; (6) teste do trauma Paralisia na 1ª rodada; (7) encerramento de efeitos que duram "até o início do próximo turno".'],
  ['c5.6.l1','- **Estado de Alerta (Ação Padrão):** concede +1 dado exclusivamente em Reflexo e Esquiva. Encerra-se ao ser atacado ou no início do seu próximo turno.\n- **Vulnerável:** usar a Ação Padrão em uma perícia fora de ataque ("Outra ação") ou realizar Síntese Cirúrgica em combate impõe −1 dado em Destreza até o início do próximo turno.']
 ]},
 {id:'c5.7',h:'5.7 Alcances, Linha de Visão e Cobertura',b:[
  {tb:[['Categoria de Arma','Alcance Máximo'],['Corpo a corpo e Briga','Adjacente (~2,2 m)'],['Rifle de precisão, fuzis de assalto, bazuca','90 m'],['Metralhadora leve, lança-granadas','60 m'],['Arco longo','45 m'],['Arcos, bestas, submetralhadora e demais armas de disparo','30 m'],['Pistolas, revólver, pistola de pregos, explosivos de arremesso','24 m'],['Escopetas, espingardas, estilingue, zarabatana','15 m'],['Arpões e armas leves de arremesso (shuriken, kunai, dardo, chakram, bumerangue)','12 m']]},
  ['c5.7.p1','Paredes e portas fechadas bloqueiam linha de visão e ataques à distância. Em **cobertura parcial** (parte das linhas de visão bloqueadas), o alvo recebe **+{{r:coberturaParcial}} na Defesa** (cobertura **pesada**, quando só uma pequena parte do alvo aparece: **+{{r:coberturaPesada}}**). Em **cobertura total**, o ataque à distância não pode ser feito (exceto com Disparo Etéreo). Ataques corpo a corpo ignoram cobertura e têm **Vantagem contra alvos Caídos**.']
 ]},
 {id:'c5.8',h:'5.8 Arremesso, Explosivos e Área',b:[
  {live:'dt'},
  ['c5.8.l1','- **Desvio na falha (Scatter):** o explosivo cai a 1,5 m + 0,5 m por ponto de falha (mínimo 1,5 m, máximo 9 m) em direção aleatória, parando ao atingir uma parede.\n- **Impacto em área:** raio padrão de 3 m (bazuca: 4,5 m), afetando todos com linha de visão ao ponto de impacto. Cada atingido rola **Resistência DT 12** (sucesso reduz o dano à metade e evita estados de acerto; Coquetel molotov não permite teste e aplica Queimando). Explosivos de arremesso são consumidos no uso e críticos dobram os dados de dano.']
 ]},
 {id:'c5.9',h:'5.9 Reações Instantâneas',b:[
  ['c5.9.p1','Disponíveis na janela de defesa (não funcionam sob Apatia ou estados incapacitantes). Rituais de reação gastam a **mesma Reação** da rodada usada no Bloqueio e no Mergulho:'],
  {tb:[['Reação','Custo','Requisito','Efeito'],['Desvio Improvável','5 ES','Manipulador de Probabilidades (Est. 3+)','Obriga o atacante a repetir a rolagem de ataque.'],['Brecha Rápida','5 ES','Ritual conhecido','Teleporta até 5 m para ponto visível e vazio, negando o ataque.'],['Duplica Efêmera','5 ES','Ritual conhecido','Role 1d2: em 1, o golpe atinge a ilusão e erra.'],['Intervenção Divina Menor','5 ES','Ritual conhecido','Reduz o dano recebido em 2d6.']]}
 ]},
 {id:'c5.10',h:'5.10 Invocações em Combate',b:[
  {tb:[['Invocação','Vital','Dano','Duração'],['Fragmento Sombrio','4','1d6 (Ilusão)','3 rodadas'],['Lacaio da Inexistência','Metade do VT atual do invocador','Dado da arma pronta do invocador','3 rodadas'],['Avatar do Abismo','Metade do VT atual do invocador','4d10 (Ilusão/Físico)','3 rodadas'],['Tulpa / Criatura Livre','Definido pelo Mestre (padrão 8)','Definido (padrão 1d6)','Definido (padrão 3)']]},
  ['c5.10.p1','**Cada invocação ataca 1× por turno, no turno do invocador, sem gastar a ação dele**, utilizando a perícia de ataque do invocador. Sua duração decai no início do turno do invocador, desaparecendo ao atingir 0 VT ou 0 rodadas.']
 ]},
 {id:'c5.11',h:'5.11 Morrendo e Morto',b:[
  ['c5.11.p1','Ao chegar a 0 VT, o personagem entra em **Agonia / Morrendo**: não age, tem movimento 0, não sofre mais dano contínuo de veneno ou sangramento e dispõe de **3 turnos** para ser estabilizado por Sutura Bruta ou Síntese Cirúrgica. Seu turno é pulado automaticamente (contando 1 dos 3). Cada golpe sofrido enquanto Morrendo reduz 1 turno restante; um golpe com dano **≥ metade do Vital máximo** (arredondado para cima) finaliza o personagem na hora. Esgotados os 3 turnos, o personagem fica **Morto** (fora de combate definitivamente).']
 ]},
 {id:'c5.12',h:'5.12 Reação, Bloqueio e Guarda Fechada',b:[
  ['c5.12.l1','- **Reação:** cada combatente tem **1 Reação por rodada**, que volta sozinha no início do próprio turno (Bloqueio, Mergulho ou ritual de reação).\n- **Bloqueio (Reação):** role **(CON)d20 + Briga**, ou **(FOR)d20 + Armas Brancas** com arma branca ou escudo, e compare com o ataque e com a Defesa Base {{r:db}}. O dano que passa pelo bloqueio é dividido por {{r:bloqueioDivisor}}, menos a redução (mínimo {{r:bloqueioMinimo}}).\n- **Guarda Fechada (Ação Padrão):** permite até **{{r:guardaUsos}} Bloqueios** na rodada e soma **+{{r:guardaBonus}}** à redução.\n- **Contra-Ataque:** 1 ataque corpo a corpo gratuito, quando o desfecho o concede.'],
  {live:'bloqueio'}
 ]},
 {id:'c5.13',h:'5.13 Manobras Corpo a Corpo',b:[
  ['c5.13.p1','Cada manobra gasta **1 Ação Padrão**, exige alvo adjacente (até 1,5 m, diagonal conta) e **não causa dano direto**.'],
  {live:'manobras'},
  ['c5.13.l1','- **Agarrado:** deslocamento 0, sem armas de duas mãos e −1d20 em testes físicos. Quem segura anda pela metade e ocupa 1 mão; soltar é livre. O Agarrado não é arrastado: quem se afasta, solta.\n- **Empurrão no mapa:** o token anda em linha reta e para em parede, borda ou outro token. Batida: {{r:colisaoDado}} (colisão) ou {{r:quedaDado}} (queda) de dano, ou teste de Atletismo/Reflexo, a critério do Mestre.\n- **Desarmar:** a arma cai no chão como item que pode ser pego (seção 5.17).']
 ]},
 {id:'c5.14',h:'5.14 Tiroteio Tático (Armas de Disparo)',b:[
  {f:'ATA = (Atributo da vertente)d20 + Armas de Disparo   (fora da especialização: grau dividido por {{r:generalistaDiv}})\nDF = {{r:db}} + proteções + cobertura/posição (+ DES se permitido)\nRF (Mergulho, gasta a Reação, até {{r:mergulhoM}} m) = (Destreza)d20 + Reflexo'},
  ['c5.14.p1','Não há Esquiva nem Bloqueio contra tiros, exceto à **queima-roupa (até {{r:queimaRoupa}} m)**, quando o alvo ciente pode Esquivar ou Bloquear.'],
  {live:'tiro'},
  ['c5.14.l1','- **Tiro desprevenido (emboscada):** sem Mergulho; direto ATA × DF. No corpo a corpo e no arremesso contra desprevenido, o alvo rola Reflexo como defesa ativa.\n- **2º Disparo (Acerto Violento):** +1 Ação Padrão imediata, direto ATA × DF, sem Mergulho nem Esquiva; o alvo Caído já soma +{{r:caidoDF}}.\n- **Queima-roupa:** desvantagem no ataque, a menos que a especialização anule (Pistolas).\n- **Médio e longo alcance:** penalidade opcional de −1d20, marcada no seletor (desligada por padrão; Fuzis ignoram).\n- **Fogo de Supressão (1 Ação Padrão):** contra alvo em cobertura, que testa Resistência (Firmeza Mental, PRE) contra o ataque; empate favorece o alvo. Falhando fica **Suprimido** até o começo do próximo turno do atirador: sair da cobertura ou se expor dá um **Tiro Livre** contra a DF.\n- **Trava pós-disparo:** depois de atirar, o movimento que sobrou no turno é perdido.\n- **Crítico balístico ou perfurante:** dobra só os dados da arma e aplica **Sangrando**.\n- **Arremesso:** segue a regra própria da seção 5.8.']
 ]},
 {id:'c5.15',h:'5.15 Coberturas e Posição',b:[
  {live:'cobertura'},
  ['c5.15.p1','No mapa, três linhas de visão decidem: as 3 livres = sem cobertura; 2 = parcial; 1 = pesada; nenhuma = total. O Mestre e o atirador podem ajustar no seletor do tiro.']
 ]},
 {id:'c5.16',h:'5.16 Condições de Combate',b:[{live:'condicoes'}]},
 {id:'c5.17',h:'5.17 Itens Caídos no Mapa',b:[
  ['c5.17.l1','- **Cair:** quem é desarmado solta a arma na célula livre adjacente mais próxima (até 1,5 m); sem célula livre, ela cai aos pés. Sem token no mapa, o item fica **Largado** na ficha.\n- **Largar:** ação livre no próprio turno.\n- **Pegar Item (1 Ação):** qualquer personagem a até 1 célula (1,5 m) pode pegar; o item vai para o inventário dele, com dano e munição preservados.\n- O Mestre pode devolver o item ao dono.']
 ]}
]},
{id:'c6',h:'6. Sobrevivência, Medicina e Cenas de Trégua',secs:[
 {id:'c6.1',h:'6.1 Combustão Vital',b:[
  ['c6.1.p1','Quando não houver Essência suficiente para pagar uma habilidade ou ritual, o personagem pode declarar **Combustão Vital (ação livre)**: sacrifica **2 pontos de Vital real por cada 1 ES faltante**. Esse dano ignora armadura, resistência e VT Temporário.'],
  ['c6.1.l1','- **Limite por turno:** no máximo {{comb}} pontos de ES gerados por turno.\n- **Estigmas de Sobrecarga:** até o fim da cena, vasos rompidos e sangramento nasal impõem −1d20 em Furtividade e em interações sociais para ocultar o estado físico.\n- **A Última Centelha:** permite zerar deliberadamente o próprio Vital para pagar uma habilidade, concedendo +1d20 no teste (ou +1 dado de efeito/dano). Logo após a resolução, o personagem entra em Agonia / Morrendo.']
 ]},
 {id:'c6.2',h:'6.2 Sutura Bruta e Síntese Cirúrgica',b:[
  ['c6.2.p1','O Vital representa a integridade anatômica real e não se recupera apenas dormindo. A medicina divide-se em estabilização emergencial e reconstrução definitiva:'],
  ['c6.2.l1','- **Sutura Bruta (Ação Padrão):** alcance adjacente, consome 1 carga de Suprimento de Emergência, DT {{r:suturaDT}}. Qualquer personagem pode executar usando Inteligência + Medicina, Inteligência pura ou Destreza pura. **Sucesso:** concede 2d6 + Inteligência de VT Temporário (+1d6 se tirar 20+) e suspende Sangrando até o fim da cena. **Falha:** 1d4 de VT Temporário. Estabiliza alvos em Morrendo. Pontos de VT Temporário não acumulam (vale o maior) e somem ao fim da cena; sofrer um crítico ou esforço extremo rasga os pontos, deixando Ferida Exposta (+3 na DT cirúrgica).\n- **Síntese Cirúrgica (Ação Preparatória de Trégua ou Ação Padrão em Combate):** exige treino em Medicina e 1 carga de Kit Cirúrgico/Médico. Em combate, deixa o operador Vulnerável. DT {{r:sinteseDT}} (ou DT {{r:sinteseDTGrave}} se houver Ferida Exposta ou se o paciente estiver Morrendo). Patamar 0–1 impõe −1d20; Patamar 3 concede +1d20; autocirurgia impõe −1d20. **Sucesso:** restaura 2d8 + Inteligência + Estágio de VT Permanente e remove Sangrando ou Ferida Exposta. **Sucesso Cirúrgico (DT +5):** restaura 3d8 + Inteligência + Estágio e anula Agonia Física naquela Trégua. **Falha:** restaura 1d6 + Inteligência e instala Infecção Tecidual (−1d20 em Constituição e Força). Estabiliza alvos em Morrendo. Na Trégua, operar reduz a recuperação de ES e Lucidez do médico em −1 Patamar. As especializações de Medicina somam suas curas (seção 1.9).']
 ]},
 {id:'c6.3',h:'6.3 Repouso e Recuperação: Cenas de Trégua',b:[
  ['c6.3.p1','Uma Cena de Trégua dura de 1 a 4 horas sem combate e recupera exclusivamente **Essência e Lucidez**. Calcula-se o **Patamar Final** (limitado entre 0 e 3) somando o Patamar Base do Ambiente (1 Hostil/Precário · 2 Protegido/Improvisado · 3 Refúgio Seguro) aos modificadores individuais:'],
  ['c6.3.l1','- **Agonia Física (−1 Patamar):** Vital ≤ 10 ou estar sob Sangrando, Infecção Tecidual ou Ferida Exposta (anulado por Sucesso Cirúrgico).\n- **Mente Turva (−1 Patamar):** Lucidez entre 9 e 15, ou já ter sofrido algum Colapso.\n- **Mente Estilhaçada (−2 Patamares):** Lucidez ≤ 8. Exige teste de Intuição DT 15; na falha, recupera 0 de Lucidez, 1 ES e faz barulho ao despertar.'],
  {tb:[['Patamar Final','Classificação','Essência (ES)','Lucidez (Intuição = Percepção)','Consequência ao Despertar'],['0','Insatisfatório','1d4','1 ponto fixo','Recebe estado Exaurido (−1d20 no 1º teste).'],['1','Raso','1d6 + Estágio','1d4 + Percepção','Mantém condições atuais.'],['2','Reparador','2d6 + Estágio','2d6 + Percepção','Remove condições passageiras*.'],['3','Pleno','3d8 + Estágio','2d8 + Percepção','Remove condições passageiras* e concede +1d20 no 1º teste.']]},
  ['c6.3.p2','*Condições passageiras removidas nos Patamares 2 e 3: Ansioso, Tenso, Enjoado, Sonolento, Exausto, Exaurido, Torpor, Estigmas de Sobrecarga, Emotivo, Eufórico, Apatia, Confuso e Amedrontado.'],
  ['c6.3.p3','**Ações Preparatórias de Trégua (1 por personagem):** Fortificar Perímetro (Inteligência ou Força DT 15 eleva ambiente de 1 para 2); Ancorar Aliado (Intuição ou Arte DT 15 anula 1 ponto de penalidade de Lucidez); Montar Vigília (evita emboscadas; vigia sofre −1 Patamar de ES e 0 Lucidez); Sedação Química (ignora penalidades de Lucidez, mas aplica Torpor na cena seguinte); Síntese Cirúrgica (opera ferimentos).'],
  {box:'Exemplo prático de Cena de Trégua',id:'c6.3.ex',t:'Um agente de Estágio 3 (Percepção 2) descansa em um quarto escuro e destrancado (Patamar Base 1) com 12 de Lucidez (Mente Turva: −1) e 18 VT (sem Agonia). Seu Patamar Final cairia para 0. Com um aliado usando Fortificar Perímetro (elevando a sala para Patamar 2) e outro usando Ancorar Aliado (anulando o −1), o agente descansa no Patamar 2 (Reparador), recuperando 2d6 + 3 ES e 2d6 + 2 Lucidez.'}
 ]}
]},
{id:'c7',h:'7. Furtividade, Exploração, Portas e Acústica',secs:[
 {id:'c7.1',h:'7.1 Visão, Neblina e Iluminação',b:[
  ['c7.1.l1','- **Cone de visão:** cada personagem enxerga um cone de 120° à frente. Paredes e portas fechadas bloqueiam visão, luz e passagem.\n- **Neblina por cômodo:** o jogador visualiza apenas o cômodo atual (sem memória visual ao sair) e, por portas abertas, apenas o recorte dentro do seu cone. No escuro absoluto, vê apenas um círculo curto ao redor.\n- **Lanternas e fontes portáteis:** qualquer item de luz no inventário (lanterna, tocha, lampião, vela, isqueiro, sinalizador, celular) é ligado/desligado como ação livre e projeta um facho de 60° com alcance de 8 quadrados (12 m).\n- **Lâmpadas e interruptores:** iluminam o cômodo inteiro (ou raio de 6 quadrados / 9 m em área aberta). Interruptores controlam as lâmpadas do mesmo cômodo; o Mestre pode acionar quedas de energia.']
 ]},
 {id:'c7.2',h:'7.2 Portas, Cadeados e Abertura Furtiva',b:[
  ['c7.2.p1','Portas destrancadas são abertas ou fechadas como ação livre. Portas trancadas só podem ser destrancadas pelo Mestre (tentar abrir gera som de maçaneta forçada). Quando há inimigos do lado oposto a até **12 quadrados (18 m)** da porta, escolhe-se o modo de abertura:'],
  {live:'doors'}
 ]},
 {id:'c7.3',h:'7.3 Furtividade por Proximidade e Propagação Sonora',b:[
  ['c7.3.l1','- **Teste de proximidade:** ao entrar no raio de audição de um inimigo hostil fora do cone de visão dele, rola-se Furtividade contra {{stealthDT}}. O raio de audição equivale a (alcance de visão ÷ 1,5 m) × 0,45, limitado entre 2 e 5 quadrados (3 a 7,5 m). Um novo teste contra o mesmo inimigo só ocorre após andar 1,5 quadrado e passarem 4 segundos.\n- **Falha e abafamento:** falhar gera onda sonora de raio 3 + (0,5 × margem) quadrados (máx. 7 quadrados / 10,5 m). Paredes abafam o som: através de paredes, inimigos só ouvem se estiverem nos 65% mais próximos do raio.\n- **Investigação:** inimigos que ouvem barulhos entram em estado de Investigação ("?"), deslocam-se até a origem e desistem após 12 segundos sem encontrar alvos. Inimigos já em combate ignoram novos ruídos.']
 ]},
 {id:'c7.4',h:'7.4 Inimigos Hostis, Engajamento e Modo Espectador',b:[
  ['c7.4.p1','Inimigos possuem cone de visão padrão de 90° e alcance de 10 m (configuráveis) e podem atuar em vigia fixa, patrulha ou rota definida. Ao avistarem um alvo (jogador ou NPC aliado/neutro), entram em Alerta ("!") e iniciam combate apenas para os envolvidos no mesmo cômodo (ou até 6 quadrados / 9 m em mapas abertos). **Sem contato por 5 segundos, o personagem desengaja.** Se o Mestre encerrar o combate com inimigos vivos, eles se tornam **Rendidos / Neutros**. Personagens posicionados em mapas secundários acompanham a cena principal em **Modo Espectador**.']
 ]}
]},
{id:'c8',h:'8. Teosofia, Tulpas e Catálogo de Rituais',secs:[
 {id:'c8.0',h:'',b:[
  ['c8.p1','Rituais são atos de projeção da consciência que rompem os limites da realidade comum e alcançam planos mais sutis da existência, como ensina a Teosofia. Eles se fundamentam em cinco **Elementos Primários** e suas combinações, os **Sub-Elementos**:'],
  ['c8.l1','- **Fé:** crença, convicção e ligação com o invisível; conecta o praticante a forças espirituais ou divinas.\n- **Natureza:** forças orgânicas, vitais e primitivas; ancora o ritual no mundo físico, flora, fauna e energia vital.\n- **Inexistência:** o vazio, ausência ou negação; dissolve formas e acessa planos onde nada se sustenta.\n- **Ilusão:** percepções distorcidas e enganos; manipula sentidos e oculta a realidade.\n- **Verdade:** realidade absoluta e essência das coisas; revela o oculto além das aparências.'],
  ['c8.p2','**Sub-Elementos:** Sol (Fé + Natureza — energia vital e purificação); Desrealização (Natureza + Inexistência — dissolução da realidade física); Pofenia (Inexistência + Ilusão — padrões falsos e realidades alternativas); Confabulação (Ilusão + Verdade — memórias falsas que parecem reais); Metáfora (Verdade + Fé — revelações expressas simbolicamente).'],
  {live:'subel'},
  {box:'Aprofundamento opcional: Rituais, Teosofia e Tulpas',id:'c8.box',t:'Na Teosofia, rituais harmonizam mente, energia, intenção e símbolos para alinhar a consciência a verdades universais, explorando a correspondência entre microcosmo e macrocosmo. Nesse contexto, as tulpas — entidades ou formas de consciência criadas pela mente através de intenção e concentração — são uma extensão prática desses princípios: enquanto rituais se estruturam como cerimônias simbólicas, tulpas manifestam-se como projeções vivas da mente.'},
  {glitch:'c8.glitch',t:'"VOCES N@O ENT3ND3M... O M3$TR3... 3L3 $@B3... 3 O @MIGO? AH... O @M1GO N@O POD3 $3R CONF1@DO! VOCE$ @CH@M QU3 TULP@$ $@O BRINQU3DO$? QU3 RITU@1$ $@O T3@TRO? N@O! O M3$TR3 OB$3RV@ C@D@ P3N$@M3NTO $3U... C@D@ $OMBR@... QU3M VOCÊ CH@M@ D3 \'@MIGO\' $ORR1 POR D3NTRO... 3L3$ R3$P1R@M D3NTRO D@ $U@ C@B3Ç@... COM3M O $3U T3MPO... @ $U@ M3MOR1@... 3$CUT3M-M3... @NT3$ QU3 O M3$TR3 CH@M3..."'}
 ]},
 {id:'c8.1',h:'8.1 Regras de Conjuração',b:[
  ['c8.1.p1','Conjurar um ritual exige o gasto da Essência correspondente à potência escolhida (ou o uso de Combustão Vital), **sem necessidade de teste de conjuração**: **Base = 5 ES · Avançada = 10 ES · Próspera = 20 ES**. Rituais com execução *Reação* podem ser disparados fora do turno.']
 ]},
 {id:'c8.2',h:'8.2 Rituais de Natureza',b:[{live:'ritual',el:'Natureza'}]},
 {id:'c8.3',h:'8.3 Rituais de Inexistência',b:[{live:'ritual',el:'Inexistência'}]},
 {id:'c8.4',h:'8.4 Rituais de Ilusão',b:[{live:'ritual',el:'Ilusão'}]},
 {id:'c8.5',h:'8.5 Rituais de Verdade',b:[{live:'ritual',el:'Verdade'}]},
 {id:'c8.6',h:'8.6 Rituais de Fé',b:[{live:'ritual',el:'Fé'}]},
 {id:'c8.7',h:'8.7 Rituais de outros elementos',b:[{live:'ritual',el:'*'}],auto:1}
]},
{id:'c9',h:'9. Carga, Inventário, Armamentos e Proteções',secs:[
 {id:'c9.1',h:'9.1 Carga, Encaixes e Proficiência',b:[
  {f:'Limite de Carga = {{carga}}\nPeso por item = Bolso: 0 (cada 5 itens de bolso = 1 de Carga) · Leve: 1 · Médio: 2 · Pesado: 3'},
  {tb:[['Excesso de Carga','Nível','Penalidade Automática'],['1 a 2 acima','Pesado','−1 dado em Acrobacia, Atletismo, Escalada, Esquiva, Furtividade, Natação e Reflexo; −2 na Defesa.'],['3 a 4 acima','Sobrecarregado','Estado Exausto (−1 dado em testes físicos, não corre/salta); −2 dados em Esquiva e Reflexo; −5 na Defesa.'],['Mais de 4 acima','Imobilizado','−5 na Defesa; movimento 0; não ataca e não esquiva.']]},
  ['c9.1.l1','- **Regras de peso vestido:** roupas comuns vestidas pesam 0; escudos vestidos pesam o valor cheio; **todas as demais proteções vestidas pesam −1 de Carga (mínimo 1)**. Itens largados no chão pesam 0.\n- **Encaixes no corpo:** 2 mãos (arma Pesada ocupa 2; escudo ocupa 1); cintura/coldre até 2 itens Leves ou Médios (nada Pesado); bolsos até 2 itens Leves + itens de Bolso; bandoleira 1 arma Pesada (exige possuir bandoleira); mochila sem limite de encaixe.\n- **Proficiência em proteções:** o arquétipo Lutador e as vocações Militar e Seguranças são proficientes em todas as proteções; os demais personagens registram proficiência item a item.\n- **Manuseio:** Saque Rápido (livre, 1×/turno, da cintura/bandoleira para as mãos); Saque de Mochila (Ação Padrão); Descarte de Emergência (livre, solta a mochila no chão).\n- O talento *Força do Cotidiano* (Lixeiro) ignora todas as penalidades de carga enquanto ativo.']
 ]},
 {id:'c9.2',h:'9.2 Tabela Completa de Armamentos',b:[{live:'weapons'}]},
 {id:'c9.3',h:'9.3 Tabela Completa de Proteções',b:[
  ['c9.3.p1','A Defesa total soma {{r:db}} + a melhor proteção vestida de cada encaixe (Roupa, Tronco, Cabeça e Escudo) + a Destreza, esta só sem proteção Pesada e sem excesso de carga.'],
  {live:'prot'}
 ]},
 {id:'c9.4',h:'9.4 Equipamentos Gerais',b:[{live:'gear'}]}
]},
{id:'c10',h:'10. Estados, Condições e Personalização',secs:[
 {id:'c10.1',h:'10.1 Tabela Consolidada de Estados e Condições',b:[{live:'status'}]},
 {id:'c10.2',h:'10.2 Personalização de Campanha e Bestiário',b:[
  ['c10.2.p1','O Mestre pode ajustar o sistema por campanha criando, editando ou restaurando Vocações, Trilhas, Rituais, Itens, Estados, Traumas, Sub-Elementos e Regras da Mesa. Toda alteração feita aqui ou na central ⚙️ Alterações do Sistema chega às fichas e ao combate na hora.'],
  ['c10.2.l1','- **Bestiário (modelo padrão):** criaturas classificadas em Inimigo, Elite, Chefe ou Entidade, com base editável de Vitalidade (padrão 20), Defesa (padrão 12), Ataque (padrão +3), Dano (padrão 1d6), perícias e notas táticas.\n- **Regras da Mesa configuráveis:** deslocamento base por turno (padrão 9 m), DT base de Arremesso até 6 m (padrão 12, deslocando toda a tabela proporcionalmente) e DT de Furtividade dos inimigos (padrão {{r:furtDTBase}} + Percepção, ou valor fixo).'],
  {live:'table'},
  {live:'beast'}
 ]}
]}
];

