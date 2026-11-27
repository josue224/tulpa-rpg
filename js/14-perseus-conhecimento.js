/* ===== PERSEUS · base de conhecimento ===== */
const K=[];
const kb=(id,title,kws,a,o={})=>K.push({id,title,kws,a,...o});
const G=(tab,spot)=>({tab,spot});

kb('o-que-e','O que é o Tulpa RPG',['o que e tulpa','o que e esse jogo','sobre o jogo','como funciona o jogo','teosofia','tulpa rpg','regras basicas','resumo do sistema'],
 'Tulpa é um RPG de investigação sobre Teosofia em que você joga um <b>ser humano comum</b>: escolhas, habilidades e limites realistas. Em resumo: você rola <b>d20</b> (um dado por ponto de atributo), pega o maior, soma o bônus e tenta passar a dificuldade. Simples. O difícil é sobreviver.',
 {rel:['rolar-teste','criar-ficha','estagios']});
kb('criar-ficha','Criar a ficha passo a passo',['criar ficha','criar personagem','montar ficha','fazer ficha','nova ficha','comecar','como comeco','primeira ficha','passo a passo ficha','tutorial ficha','como montar'],
 'Montar uma ficha é fácil: nome, <b>7 pontos de atributo</b>, uma <b>vocação</b>, <b>8 perícias extras</b> e pronto. Quer que eu te leve pela mão (ou pela pata) passo a passo?',
 {tour:'criar-ficha',rel:['atributos','vocacao','pericias']});
kb('atributos','Atributos',['atributos','atributo','forca','percepcao','inteligencia','presenca','constituicao','aparencia','destreza','carisma','distribuir pontos','pontos de atributo','quantos pontos','pontos livres'],
 'São 8: <b>Força, Percepção, Inteligência, Presença, Constituição, Aparência, Destreza e Carisma</b>. Cada ponto = <b>1 d20</b> nos testes. No Estágio 1 você distribui <b>7 pontos livres</b> (mínimo 1, máximo 3 por atributo). Do Estágio 2 em diante o máximo sobe para 4, e você ganha +1 ponto nos estágios 2, 4, 7 e 10. Dica: ninguém sobrevive com tudo em 1 e ninguém é bom em tudo.',
 {go:[G('attributes','#attributes')],rel:['rolar-teste','estagios','dica-build']});
kb('pericias','Perícias',['pericias','pericia','aptidoes','extras','perícias extras','8 pericias','escolher pericias','bonus de pericia','mestre','maestria','+5','+10','+15'],
 'Todas as perícias começam em <b>0</b>. A <b>vocação</b> dá +V em 3 delas (+5, +10 ou +15 conforme os anos de serviço). Além disso você escolhe <b>8 perícias extras</b> (+5 cada) que combinem com a história do personagem; ao evoluir ganha mais escolhas. Algumas podem virar <b>Mestre (+10)</b> e, com sorte, <b>Maestria (+15)</b>: use o campo de bônus manual no fim da aba para registrar.',
 {go:[G('skills','#skillGrid')],rel:['vocacao','estagios','rolar-teste']});
kb('rolar-teste','Como rolar um teste',['rolar teste','como rolar','como funciona o teste','rolar dado','d20','como faco um teste','dificuldade','dt','vantagem','desvantagem','bonus','como rolo dado','rolo dado','rolar os dados','jogar dado','como jogar o dado'],
 'Você rola tantos <b>d20</b> quanto o valor do atributo da perícia, fica com o <b>maior</b> e soma o bônus da perícia. Passou da dificuldade (DT), deu certo. <b>Vantagem</b> = rola o conjunto duas vezes e fica com o melhor; <b>Desvantagem</b> = fica com o pior. Na aba <b>Perícias</b> é só clicar no 🎲 da perícia.',
 {go:[G('skills','#skillGrid')],rel:['pericias','atributos']});
kb('vocacao','Vocação',['vocacao','vocacoes','profissao','escolher vocacao','qual vocacao','o que fazia antes','trabalho do personagem'],
 'A vocação é <b>o que seu personagem fazia antes de conhecer a Teosofia</b>. Ela dá <b>+V em 3 perícias</b> e <b>2 talentos</b>. Hoje são 62 vocações (de Atleta Urbano a Biólogo). Escolha pela história do personagem, não pelo bônus. (Eu sei que você vai escolher pelo bônus.)',
 {go:[G('vocation','#vocSelect')],steps:['Abra a aba <b>Vocação</b>.','Use a busca ou a lista e leia o resumo.','Clique em <b>Confirmar vocação</b>.'],rel:['anos-servico','talentos']});
kb('anos-servico','Anos de serviço (o tal do +V)',['anos de servico','+v','valor v','nivel de experiencia','10 anos','40 anos','tempo de servico'],
 'O <b>+V</b> da vocação depende dos <b>anos de serviço</b>: começando na área = <b>+5</b>; após 10 anos = <b>+10</b>; após 40 anos = <b>+15</b>. O campo fica na <b>Visão geral</b>.',
 {go:[G('overview','#serviceYears')],rel:['vocacao']});
kb('arquetipo','Arquétipo',['arquetipo','lutador','genio','ritualista','estagio 3','escolher arquetipo'],
 'No <b>Estágio 3</b> você escolhe um arquétipo: <b>Lutador</b> (linha de frente, armas), <b>Gênio</b> (versátil, resolve problemas) ou <b>Ritualista</b> (domina rituais, mas todo poder tem preço). Cada um tem <b>6 trilhas</b>.',
 {go:[G('track','#archSelect')],rel:['trilha','dica-build']});
kb('trilha','Trilhas e poderes',['trilha','trilhas','poderes','estagio 5','estagio 8','estagio 10','habilidades de trilha'],
 'A trilha é a sua especialização. Ela concede <b>um poder novo nos Estágios 3, 5, 8 e 10</b>, pagos com <b>Essência (ES)</b>. Ela só é liberada depois do <b>✨ Despertar</b> (botão na aba <b>Arquétipo &amp; Trilha</b>, usado quando o Despertar acontece na história). Ao despertar, o personagem recebe na hora os poderes dos estágios que já alcançou.',
 {go:[G('track','#trackSelect')],rel:['arquetipo','talentos','essencia']});
kb('talentos','Talentos e habilidades',['talento','talentos','habilidade','usar talento','ativar talento','bonus de talento','usar habilidade'],
 'Talentos custam <b>Essência</b> e <b>não gastam seu turno</b>, mas só <b>um por turno</b> em combate. Se ele dá bônus em perícia, o bônus some <b>depois da primeira rolagem</b> que o usa. Talentos pessoais valem só para você; os de aliado perguntam quem recebe.',
 {go:[G('talents','#vocationTalents')],rel:['essencia','combustao','turno-combate']});
kb('essencia','Essência (ES)',['essencia','es','energia','pontos de essencia','recuperar essencia','sem essencia'],
 '<b>Essência</b> é a energia dos talentos e rituais. Recupera-se nas <b>Cenas de Trégua</b> (aba Descanso). Acabou? Dá para pagar com sangue: veja <b>Combustão Vital</b>.',
 {go:[G('overview','#stats')],rel:['descanso','combustao']});
kb('combustao','Combustão Vital',['combustao','combustao vital','sem essencia suficiente','faltar essencia','falta de essencia','acabou a essencia','essencia acabou','essencia insuficiente','sem essencia','ultima centelha','pagar com vital','queimar vital'],
 'Faltou ES para uma habilidade? <b>Combustão Vital</b>: cada ES faltante custa <b>2 de Vital</b> (ignora armadura, resistência e VT temporário). O limite por turno é <b>{{comb}}</b> de ES, e você fica com Estigmas até o fim da cena. Em desespero, a <b>Última Centelha</b> zera o seu Vital para +1d20, mas você desaba Morrendo. Dramático. Burro, mas dramático.',
 {go:[G('rest','#restBody')],rel:['essencia','morrendo']});
kb('vital','Vital (vida)',['vital','vida','pv','hp','pontos de vida','quanto de vida','cura','recuperar vida','regenerar','curar vital'],
 '<b>Vital</b> é a integridade do corpo. Ele <b>não cicatriza dormindo</b>: só cura com intervenção médica (<b>Síntese Cirúrgica</b>, rituais de cura, itens). Para segurar o corpo no meio da luta use a <b>Sutura Bruta</b>, que dá Vital Temporário.',
 {rel:['vital-temporario','sutura-bruta','sintese-cirurgica']});
kb('vital-temporario','Vital Temporário',['vital temporario','vt temp','vt temporario','pontos temporarios','sutura'],
 'O <b>VT Temporário</b> vem da Sutura Bruta. Ele <b>absorve o dano primeiro</b>, <b>não acumula</b> (vale o maior) e <b>some no fim da cena</b>. Não é cura de verdade: é um curativo com ambição.',
 {rel:['sutura-bruta']});
kb('lucidez','Lucidez',['lucidez','sanidade','mente','lucidez zero','lucidez zerada','perder lucidez','enlouquecer'],
 '<b>Lucidez</b> é a sua sanidade. Quando chega a <b>0</b> dispara o <b>Protocolo de Colapso</b>: rola 1d6, e 4–6 pode virar <b>Êxtase</b> enquanto 1–3 vira <b>Penalidade</b>. A aba <b>Lucidez &amp; Trauma</b> guarda tudo isso.',
 {go:[G('mind','#mindBody')],rel:['colapso','extase','trauma']});
kb('colapso','Protocolo de Colapso',['colapso','protocolo de colapso','primeiro colapso','segundo colapso','terceiro colapso','penalidade de lucidez','sanidade zera','sanidade zerar','lucidez zera','lucidez chega a zero','perdi toda a lucidez'],
 '<b>1º Colapso:</b> 1d6, 4–6 Êxtase, 1–3 Penalidade nível 1; Lucidez volta para metade do máximo. <b>2º:</b> 4–6 mantém, 1–3 sobe a Penalidade; Lucidez volta para 1/3. <b>3º:</b> Penalidade 2+ vira <b>Trauma Permanente</b>; em Êxtase rola de novo. O app faz as contas e pede o d6. Você só precisa chorar.',
 {go:[G('mind','#mdCollapse')],rel:['extase','trauma','regras-casa']});
kb('extase','Êxtase',['extase','bonus de extase','furia','precisao','sobrevida','desistencia'],
 '<b>Êxtase</b> é uma onda de clareza com <b>um bônus à sua escolha</b> (Fúria, Precisão, Escudo, Reflexo, Desarme, Sobrevida, Visão, Persuasão, Memória, Foco…) até o fim da cena. Cada dano de Lucidez nele pede 1d6: 1–3 acaba o Êxtase. Ou escolha <b>Desistência</b> (incapacitado até o fim da cena, sem Trauma).',
 {go:[G('mind','#mdBonus')],rel:['colapso']});
kb('trauma','Trauma',['trauma','traumas','tremor','paralisia','ira','vinganca','hesitacao','eco','isolamento','hipocondria','culpa','desespero','ceticismo','sombras'],
 '<b>Trauma</b> é consequência de colapsos sucessivos. Cada um tem uma <b>penalidade contínua</b> e uma cena narrada. Quando ocorre, o app abre uma janela para você <b>descrever o trauma</b>; o texto fica salvo nas <b>Anotações</b>. Só some com um arco narrativo (o Mestre cura).',
 {go:[G('mind','#mdAddTrauma')],rel:['colapso']});
kb('estagios','Estágios (evolução)',['estagio','estagios','evoluir','evolucao','subir de nivel','nivel','progressao','tabela de estagios'],
 'O personagem evolui do <b>Estágio 1 ao 10</b>. Cada estágio aumenta Vital, Lucidez e Essência, e dá pontos de atributo (nos estágios 2, 4, 7 e 10), perícias extras e poderes de trilha (3, 5, 8 e 10). É só mudar o estágio na Visão geral: o app atualiza os máximos sozinho.',
 {go:[G('overview','#stageList')],rel:['atributos','trilha']});
kb('defesa','Defesa',['defesa','df','db','defesa base','armadura','proteger','proteção','defesa total','bloqueio'],
 '<b>Defesa Base (DB) = {{r:db}}.</b> Sua <b>DF</b> = {{r:db}} + proteções vestidas + <b>Destreza</b> (se não usar proteção Pesada nem estiver com excesso de carga) + bônus/penalidades. Cobertura parcial +{{r:coberturaParcial}}, pesada +{{r:coberturaPesada}}. Atacante rola ATA; defensor rola RF (Esquiva ou Reflexo). Com proteção vestida, o equipamento pode <b>bloquear</b> o golpe, mas só se seu Reflexo não ficar abaixo de {{r:db}}.',
 {go:[G('combat','#combatTabBody')],rel:['ataque','esquiva-reflexo','protecoes']});
kb('ataque','Ataque',['ataque','atacar','ata','qual pericia ataco','briga','armas brancas','armas de disparo','arremesso','soco','dano da arma'],
 'A perícia do ataque depende da arma: <b>Briga</b> (soco 1d2, soco inglês), <b>Armas Brancas</b> (faca, espada…), <b>Armas de Disparo</b> (pistola, arco…) e <b>Arremesso</b> (granada, shuriken…). Você rola o ataque e o dano da arma na hora; o alvo rola a defesa.',
 {rel:['esquiva-reflexo','critico','turno-combate']});
kb('esquiva-reflexo','Esquiva e Reflexo',['esquiva','reflexo','desprevenido','como defender','defender','rolar defesa','surpresa'],
 'Quando te atacam aparece o aviso: <b>Esquiva</b> se você viu o ataque, <b>Reflexo</b> se foi pego desprevenido. O resultado compara ATA × RF × DF e sai um dos cinco desfechos (esquiva, bloqueio, acerto normal, violento ou retaliação).',
 {rel:['defesa','acerto-violento','retaliacao']});
kb('acerto-violento','Acerto violento',['acerto violento','acao extra','ganha acao','violento'],
 'Se o Reflexo do defensor ficou <b>abaixo de {{r:db}}</b> e o ataque passou de {{r:db}}, é <b>acerto violento</b>: o atacante ganha <b>1 ação adicional</b>. Exceção: contra alvo <b>Morrendo</b> não vale (nada de loop infinito).',
 {rel:['retaliacao']});
kb('retaliacao','Retaliação',['retaliacao','contra ataque','contra-ataque','reagir'],
 'Se seu Reflexo passou de {{r:db}} e o ataque não chegou a {{r:db}}, é <b>retaliação</b>: você ganha uma ação extra para <b>contra-atacar</b>, e esse contra-ataque <b>não pode ser esquivado</b>. O botão aparece no painel de combate.',
 {rel:['acerto-violento','turno-combate']});
kb('20-natural','20 natural',['20 natural','natural 20','vinte natural','critico automatico','20 no dado'],
 'Um <b>20 natural</b> no ataque <b>sempre acerta</b>, não importa quanto bônus o defensor tenha (nem se ele também tirar 20). Justo? Não. Divertido? Muito.',
 {rel:['critico']});
kb('critico','Crítico',['critico','margem de ameaca','19-20','dobrar dano','sangramento','dano critico'],
 'Cada arma tem uma <b>margem de crítico</b> (20 ou 19–20). No crítico que acerta, os <b>dados de dano são rolados em dobro</b> e armas cortantes ou de disparo causam <b>Sangramento</b> (outras têm efeitos próprios, como a zarabatana que envenena).',
 {rel:['ataque','estados']});
kb('iniciativa','Iniciativa',['iniciativa','ordem de acao','ordem dos turnos','quem joga primeiro','reflexo da iniciativa'],
 'Ao iniciar o combate cada participante rola <b>Reflexo</b>: jogadores rolam o seu e o Mestre rola pelos NPCs. A ordem sai do maior para o menor, e os dados aparecem num pop-up. Quem está com o <b>olhinho desativado</b> só assiste.',
 {rel:['turno-combate','olhinho']});
kb('turno-combate','O seu turno em combate',['turno','combate','como funciona o combate','minha vez','menu de combate','acoes','acao padrao','o que posso fazer no turno','concluir turno'],
 'No seu turno: <b>⚔ Atacar</b> (escolhe arma e alvo), <b>👁 Alerta</b> (+1 Esquiva/Reflexo), <b>✦ Talentos</b> (não gastam ação), <b>⌖ Outra ação</b> (qualquer perícia, mas fica Vulnerável), <b>🩹 Sutura Bruta</b>, <b>🧵 Síntese</b> (se tiver Medicina) e <b>✔ Concluir turno</b>. Uma ação padrão por turno.',
 {tour:'combate',rel:['alerta','morrendo','retaliacao']});
kb('alerta','Alerta e Vulnerável',['alerta','estado de alerta','vulneravel','vulnerabilidade'],
 '<b>Alerta:</b> em vez de atacar você foca os sentidos: +1 em <b>Esquiva e Reflexo</b>, e termina quando você é atacado ou no início do próximo turno. <b>Vulnerável:</b> −1 em Destreza até o próximo turno; é o preço de usar a ação em perícia fora de ataque ou de operar alguém.',
 {rel:['turno-combate']});
kb('morrendo','Morrendo',['morrendo','agonia','zerar vital','vital zero','0 vital','morrer','morte','finalizado','3 turnos','curar morrendo','curar alguem morrendo','salvar morrendo','salvar alguem','tirar de morrendo','alguem morrendo','reanimar','ressuscitar','quando morro','estou morrendo','turno pulado','pulou meu turno','pular turno','turno de quem esta morrendo','morto joga','morto no turno'],
 'Com <b>0 de Vital</b> você fica <b>Morrendo</b>: não age e tem <b>3 turnos</b> para ser estabilizado. Cada golpe que te acerta tira <b>1 turno</b>, e dano de <b>metade do Vital máximo ou mais</b> finaliza na hora. Quem está Morrendo ou Morto <b>tem o turno pulado automaticamente</b> (e cada vez pulada conta 1 dos 3 turnos) e não sofre mais veneno ou sangramento. Aliados salvam com <b>Sutura Bruta</b> ou <b>Síntese Cirúrgica</b>; revivido, volta a jogar na próxima vez.',
 {rel:['sutura-bruta','sintese-cirurgica']});
kb('sutura-bruta','Sutura Bruta',['sutura bruta','sutura','estabilizar','primeiros socorros','curativo','suprimento de emergencia','atadura'],
 '<b>1 ação, adjacente, 1 Suprimento de Emergência, DT {{r:suturaDT}}.</b> Qualquer um pode: rola Inteligência + Medicina, Inteligência pura ou Destreza pura. Sucesso: <b>2d6 + {{x:curaPorInt}}INT de Vital Temporário</b> (+1d6 com 20+) e sangramento suspenso; falha: 1d4. Tira o alvo do estado Morrendo. Um crítico rasga os grampos e deixa Ferida Exposta no fim da cena.',
 {steps:['No seu turno, clique em <b>🩹 Sutura Bruta</b> no painel de combate.','Escolha quem será tratado.','Escolha o teste e confirme: tudo é aplicado sozinho.'],go:[G('rest','#medSutura')],rel:['sintese-cirurgica','vital-temporario','morrendo']});
kb('sintese-cirurgica','Síntese Cirúrgica',['sintese cirurgica','sintese','cirurgia','operar','kit cirurgico','curar vital permanente','medicina'],
 'Exige a perícia <b>Medicina</b> e 1 carga de <b>Kit Cirúrgico/Médico</b>. DT {{r:sinteseDT}} (<b>{{r:sinteseDTGrave}}</b> se o paciente tem Ferida Exposta ou caiu a 0 VT). Sucesso: <b>2d8 + {{x:curaPorInt}}INT + Estágio</b> de Vital permanente e remove uma condição grave; falha: 1d6 + INT e <b>Infecção</b>. Ambiente seguro ajuda, sujo atrapalha. Quem opera <b>fica Vulnerável</b>.',
 {go:[G('rest','#medSintese')],rel:['sutura-bruta','morrendo','descanso']});
kb('estados','Estados (condições)',['estado','estados','condicao','envenenado','envenenamento','sangrando','queimando','atordoado','cego','confuso','paralisado','aplicar estado','remover estado','buff','debuff','meu personagem esta'],
 'Estados são as condições do manual (Envenenado, Sangrando, Atordoado, Cego…). Na aba <b>Estados</b> você escolhe na lista e o app aplica <b>automaticamente</b> bônus e penalidades até você remover. Os que causam dano (veneno, sangramento, fogo, afogamento) descontam sozinhos no <b>início do seu turno</b>.',
 {go:[G('states','#stList')],rel:['morrendo','critico']});
kb('carga','Carga e peso',['carga','peso','sobrecarregado','limite de carga','pesado','imobilizado','mochila'],
 'Limite de carga = <b>{{carga}}</b>. Itens: Leve 1, Médio 2, Pesado 3; minúsculos custam 0 (a cada 5, 1 de carga). Passou do limite: <b>Pesado</b> (−1 dado de agilidade, −2 Defesa), <b>Sobrecarregado</b> (−2 dados em Esquiva/Reflexo, −5 Defesa, não corre) ou <b>Imobilizado</b>.',
 {go:[G('inventory','#invBody')],rel:['equipar','protecoes']});
kb('equipar','Equipar armas e itens',['equipar','arma','armas','como equipo','inventario','coldre','saque rapido','bandoleira','mochila','maos','cintura','bolso'],
 'No <b>Inventário</b> adicione a arma e escolha onde ela fica: <b>mãos</b> (2), <b>cintura/coldre</b> (até 2 itens Leves/Médios), <b>bandoleira</b> (1 arma Pesada), <b>bolsos</b> ou <b>mochila</b>. Armas nas mãos, cintura e bandoleira são de <b>saque rápido</b>; da mochila, sacar gasta a ação.',
 {steps:['Abra <b>Inventário &amp; Carga</b>.','No painel <b>Adicionar item</b> escolha Armas e clique em ＋.','Mude o local do item, se quiser (mãos, cintura…).'],go:[G('inventory','#addList')],rel:['carga','criar-item']});
kb('protecoes','Proteções e Defesa',['protecao','protecoes','colete','capacete','escudo','armadura','vestir','vestido','protecoes e defesa','vestir protecao','usar colete','equipar armadura','equipar escudo'],
 'Vista proteções na zona <b>Vestido</b>: 1 roupa, 1 colete/armadura, 1 capacete e 1 escudo (que ocupa uma mão). Cada uma soma na sua <b>DF</b>.',
 {go:[G('inventory','#invBody')],rel:['defesa']});
kb('criar-item','Criar e dar itens',['criar item','novo item','item personalizado','adicionar item','dar item','dar item pro amigo','entregar item','passar item','item da campanha','criar arma','criar protecao'],
 'Em <b>Inventário › Adicionar item › ＋ Criar item novo</b> qualquer pessoa (jogador ou Mestre) cria arma, proteção ou objeto, com nome, peso e efeitos. O item entra na lista <b>★ Meus itens e da campanha</b>. Com o botão <b>🎁 Dar</b> você entrega um item a outro personagem.',
 {go:[G('inventory','#addKind')],rel:['equipar']});
kb('descanso','Descanso (Cena de Trégua)',['descanso','tregua','cena de tregua','dormir','patamar','recuperar lucidez','recuperar essencia','descansar'],
 'A <b>Trégua</b> (1 a 4 horas sem combate) recupera só <b>Essência e Lucidez</b>, nunca Vital. O Mestre define o <b>Patamar</b> do ambiente (1 a 3); dor, mente turva e ações preparatórias ajustam o patamar final. É só marcar as opções e clicar em <b>Realizar o descanso</b>.',
 {go:[G('rest','#restBody')],rel:['acoes-preparatorias','sintese-cirurgica']});
kb('acoes-preparatorias','Ações preparatórias',['acoes preparatorias','fortificar','ancorar aliado','vigilia','sedacao quimica','montar vigilia'],
 'Antes de dormir cada um faz <b>1 ação preparatória</b>: <b>Fortificar Perímetro</b> (sobe o ambiente de 1 para 2), <b>Ancorar Aliado</b> (anula 1 ponto de penalidade de Lucidez), <b>Montar Vigília</b> (evita emboscada, mas você descansa pior), <b>Sedação Química</b> (ignora penalidade de Lucidez, deixa Torpor) ou <b>Síntese Cirúrgica</b>.',
 {go:[G('rest','#restBody')],rel:['descanso']});
kb('rituais','Rituais',['ritual','rituais','elemento','elementos','fe','natureza','inexistencia','ilusao','verdade','conjurar','aprender ritual','sub elementos'],
 'Rituais custam <b>5 / 10 / 20 ES</b> (Base, Avançada, Próspera) e se dividem em 5 elementos: <b>Fé, Natureza, Inexistência, Ilusão e Verdade</b>. Na aba <b>Registros</b>: <b>Aprender</b> o ritual e depois <b>Conjurar</b>. Curas e estados nos alvos são aplicados automaticamente.',
 {steps:['Abra <b>Registros</b> e procure o ritual.','Clique em <b>Aprender</b>.','Use <b>Conjurar</b>, escolha a potência e os alvos.'],go:[G('records','#ritualCatalog')],rel:['essencia']});
kb('olhinho','O olhinho (cena)',['olhinho','olho','olho desativado','visivel','invisivel','fora da cena','cena','esconder personagem'],
 'O <b>olhinho</b> (Mestre) liga e desliga a presença do personagem na cena: com o olho <b>desativado</b> ele some para os jogadores, não entra na ordem de combate, não pode ser alvo nem rolar nada. Você ainda pode <b>criar o personagem já com o olho desativado</b> na hora de criar.',
 {rel:['ocultar-status','criar-oculto']});
kb('ocultar-status','Ocultar status (inimigos e chefes)',['ocultar status','esconder vida','esconder vital','boss','chefe','esconder status','status oculto','mostrar status'],
 'Mestre: em cada cartão da <b>Visão de Mesa</b> há o botão <b>🙈 Ocultar status</b>. Os jogadores deixam de ver Vital, Lucidez, Essência (e a Defesa) daquele personagem, mas você continua vendo tudo. Ideal para Boss.',
 {rel:['olhinho','criar-oculto']});
kb('criar-oculto','Criar personagem já oculto',['criar oculto','criar npc','criar inimigo','novo npc','criar boss','personagem do mestre','esconder inimigo','esconder inimigo dos jogadores'],
 'Mestre: ao criar um personagem aparecem duas caixas: <b>criar com o olho desativado</b> e <b>ocultar Vital/Lucidez/Essência</b>. Já vêm marcadas quando o dono é você (NPC) e desmarcadas quando é um jogador. Depois liga o olhinho quando quiser revelar.',
 {rel:['olhinho','ocultar-status']});
kb('campanha','Entrar e criar campanhas',['campanha','entrar na campanha','codigo da campanha','criar campanha','login','pin','entrar como player','entrar como mestre','convidar jogadores','como jogo online'],
 'Na tela inicial escolha <b>Entrar como Player</b> (seu PIN de 4 dígitos) ou <b>Entrar como Mestre</b>. O Mestre cria a campanha; o jogador entra com o <b>código</b> que o Mestre passar. Depois: <b>Personagens</b> para criar/abrir fichas e <b>Visão de Mesa</b> para jogar junto.',
 {go:[{view:'home'}],rel:['visao-mesa']});
kb('visao-mesa','Visão de Mesa',['visao de mesa','mesa','tabela da mesa','recursos de todos','historico da mesa','mesa de jogo'],
 'A <b>Visão de Mesa</b> mostra Vital, Lucidez e Essência de todo mundo em tempo real, o <b>histórico de rolagens</b> e, em combate, o painel de ação. Jogadores mexem só nos próprios recursos; o Mestre, em qualquer um.',
 {go:[{view:'hub:table'}],rel:['historico','turno-combate']});
kb('historico','Histórico e rolagens na tela',['historico','rolagens','rolagem compartilhada','mostrar rolagem','popup de rolagem','ver dados'],
 'Rolagens da <b>mesa</b> e do <b>combate</b> aparecem na tela de todos e no histórico (com os dados de ataque, defesa e dano). As feitas dentro da ficha são <b>privadas</b> por padrão: dá para mostrar na mesa em <b>⚙ Aparência › Rolagens da ficha</b>.',
 {go:[{settings:true}],rel:['visao-mesa']});
kb('tema','Tema escuro e celular',['tema escuro','modo escuro','escuro','claro','celular','mobile','funciona no celular','mudar de tema','mudo de tema','tamanho do texto','fonte grande','letra grande','aparencia'],
 'Em <b>⚙ Aparência</b> você escolhe a <b>estética</b> da galeria (ou a <b>Estrutura Clássica</b>, que tem claro e escuro) e o <b>tamanho do texto</b>. Celular e computador se ajustam sozinhos ao tamanho da tela.',
 {go:[{settings:true}]});
kb('voltar','Botão Voltar',['voltar','tela anterior','botao voltar','como volto'],
 'O botão <b>← Voltar</b> (topo da tela) leva à tela anterior, inclusive entre as abas da ficha. O botão <b>Central</b> volta ao início.');
kb('salvar','Salvar, exportar e importar',['salvar','exportar','importar','backup','perdi a ficha','salva sozinho','nuvem','perdi minha ficha','perdi a ficha','ficha sumiu','sumiu minha ficha','recuperar ficha'],
 'Dentro de uma campanha a ficha <b>salva sozinha na nuvem</b>. O botão <b>Exportar</b> baixa um arquivo de segurança e <b>Importar</b> restaura. Faça um backup antes de mexer em coisas grandes. (Sim, eu sou o gato que fala de backup.)');
kb('seu-personagem-teria','Criação livre (“Seu Personagem Teria”)',['criacao livre','seu personagem teria','sem regras','liberdade','criar do zero','custom'],
 'O manual permite criar sem seguir os limites: você define atributos, perícias e talentos que <b>um humano daquele personagem teria</b>, desde que faça sentido. Combine com o Mestre; o app aceita bônus manuais nas perícias e talentos personalizados.',
 {go:[G('talents','#customTalent')]});
kb('dica-build','Dicas de build',['build','dica de build','qual escolher','sugestao','recomendacao','melhor build','o que escolher','personagem forte','primeiro personagem','personagem iniciante','dicas de personagem','dica para iniciante','sou iniciante','primeira vez jogando'],
 '<b>Lutador:</b> Força/Destreza/Constituição altas; arma boa e proteção. <b>Gênio:</b> Inteligência, Percepção e Carisma; vocação com várias perícias úteis. <b>Ritualista:</b> Presença/Inteligência e bastante Essência. Regra de ouro: <b>nunca deixe Destreza em 1</b>, ela define Esquiva, Reflexo e iniciativa. (De nada.)',
 {rel:['atributos','arquetipo']});
kb('regras-casa','O que é regra da casa',['regra da casa','regras da casa','o que voce inventou','nao esta no manual','interpretacao'],
 'Onde o manual é vago o app usou uma interpretação: <b>DF = {{r:db}} + equipamento + Destreza</b>; cada nível de Penalidade de Lucidez tira <b>1 dado</b> de atributos mentais; crítico <b>dobra os dados</b> de dano; armas contundentes atordoam no crítico; Alerta termina ao ser atacado; Vital Temporário some no fim da cena. Se o seu Mestre pensar diferente, o Mestre ganha.');
kb('nao-ataca','Não consigo atacar',['nao consigo atacar','nao posso atacar','botao atacar apagado','atacar desativado','nao aparece atacar','nao e minha vez'],
 'Checklist rápido: 1) é a <b>sua vez</b> no painel de combate? 2) seu olhinho está ligado? 3) você já usou a ação do turno? 4) um estado te impede (Atordoado, Paralisado, Morrendo)? 5) tem arma nas <b>mãos/cintura/bandoleira</b>? Sem arma você ataca no <b>Soco</b>.',
 {rel:['turno-combate','olhinho']});
kb('nao-vejo','Não aparece meu personagem',['nao aparece meu personagem','nao vejo meu personagem','sumiu personagem','personagem escondido','nao vejo o inimigo'],
 'Se um personagem não aparece para os jogadores, provavelmente está com o <b>olhinho desativado</b> (Mestre). Se é o <b>seu</b> que sumiu, peça ao Mestre para reativar o olho.',
 {rel:['olhinho']});
kb('perseus','Quem é o Perseus',['perseus','quem e voce','voce e uma ia','voces e uma ia','ia de verdade','ia real','e uma ia','voce e real','quem te criou','inteligencia artificial','chatgpt','bot','gato','gravata'],
 'Sou o <b>Perseus</b>, gato azul e funcionário não remunerado deste site. Honestidade: não sou uma IA de verdade, sou um gato com um <b>manual decorado</b> e opiniões. Se o Mestre conectar um cérebro externo em ⚙ (modo IA), fico bem mais esperto.',
 {rel:['ia-modo']});
kb('ia-modo','Conectar uma IA externa',['modo ia','conectar ia','api','endpoint','ia real','cerebro externo'],
 'Para eu conversar de verdade, clique em <b>⚙</b> aqui no chat e informe o endereço (URL) de um serviço seu que receba <code>{question, history, context, knowledge}</code> e devolva <code>{reply}</code>. Sem isso eu respondo só pelo manual, e continuo fofo.',
 {});

const TOURS={
 'criar-ficha':{title:'Criar a ficha',steps:[
  {h:'Identidade',t:'Dê <b>nome, idade e naturalidade</b> ao seu agente. Comece no <b>Estágio 1 (Iniciante)</b>: Vital 20, Lucidez 20, Essência 10.',go:G('overview','#charName')},
  {h:'Atributos',t:'Distribua <b>7 pontos</b> entre os 8 atributos (mínimo 1, máximo 3). Cada ponto = 1 d20. Dica: não deixe Destreza no 1.',go:G('attributes','#attributes')},
  {h:'Vocação',t:'Escolha o que ele fazia antes da Teosofia e clique em <b>Confirmar vocação</b>. Dá <b>+V em 3 perícias</b> e 2 talentos.',go:G('vocation','#vocSelect')},
  {h:'Perícias extras',t:'Escolha as <b>8 perícias extras</b> (+5 cada) que combinam com a história do personagem. Todas as outras começam em 0.',go:G('skills','#extraSkillsLabel')},
  {h:'Arquétipo e trilha',t:'A Trilha só chega com o <b>✨ Despertar</b>, quando ele acontece na história. Até lá o personagem sobe de Estágio normalmente. Depois de despertar, escolha Lutador, Gênio ou Ritualista e uma trilha.',go:G('track','#archSelect')},
  {h:'Talentos',t:'Veja os talentos da vocação e da trilha. Eles gastam <b>Essência</b>, mas não gastam turno.',go:G('talents','#vocationTalents')},
  {h:'Equipamento',t:'Adicione uma <b>arma</b>, uma <b>proteção</b> (vista no corpo) e, se quiser, uma mochila. Isso define sua Defesa e seus ataques.',go:G('inventory','#addList')},
  {h:'Toques finais',t:'Escreva a <b>crônica, conexões e anotações</b> no fim de Registros. Pronto! Peça <i>“revisar minha ficha”</i> e eu confiro se esqueceu algo.',go:G('records','#notes')}]},
 'combate':{title:'Como funciona o combate',steps:[
  {h:'Prepare o equipamento',t:'Antes da luta, deixe a arma nas <b>mãos, cintura ou bandoleira</b> (saque rápido) e vista suas proteções.',go:G('inventory','#invBody')},
  {h:'Sua Defesa',t:'Defesa Base {{r:db}} + equipamento + Destreza. Aqui você vê a <b>DF</b> e a tabela de resultados do confronto.',go:G('combat','#combatTabBody')},
  {h:'Iniciativa',t:'Cada participante rola <b>Reflexo</b> e a ordem sai do maior para o menor. Jogadores rolam o seu; o Mestre rola pelos NPCs.',go:{view:'hub:table'}},
  {h:'No seu turno',t:'Escolha: <b>Atacar</b>, <b>Alerta</b>, <b>Talentos</b>, <b>Outra ação</b>, <b>Sutura Bruta</b> ou <b>Síntese</b>. Depois <b>Concluir turno</b>.',go:{view:'hub:table'}},
  {h:'Defendendo',t:'Quando atacarem você, role <b>Esquiva</b> (se viu) ou <b>Reflexo</b> (desprevenido). Os dados aparecem na tela de todos.',go:null},
  {h:'Cair e salvar',t:'Em 0 de Vital você fica <b>Morrendo</b> (3 turnos). Aliados usam <b>Sutura Bruta</b> ou <b>Síntese Cirúrgica</b> para salvar.',go:G('rest','#restBody')}]},
 'lucidez-trauma':{title:'Lucidez, Êxtase e Trauma',steps:[
  {h:'Lucidez',t:'Sua Lucidez é a sanidade. Perdeu tudo? Dispara o <b>Protocolo de Colapso</b>.',go:G('mind','#mindBody')},
  {h:'Colapso',t:'Role 1d6: <b>4–6 Êxtase</b>, <b>1–3 Penalidade</b>. Cada colapso devolve menos Lucidez que o anterior.',go:G('mind','#mdCollapse')},
  {h:'Êxtase',t:'Escolha um bônus até o fim da cena. Danos de Lucidez em Êxtase pedem 1d6; ou escolha <b>Desistência</b>.',go:G('mind','#mdBonus')},
  {h:'Trauma',t:'No terceiro colapso (ou Penalidade 2+) vira <b>Trauma Permanente</b>: descreva a cena e ela fica salva nas Anotações.',go:G('mind','#mdAddTrauma')}]},
 'mestre':{title:'Dicas para o Mestre',steps:[
  {h:'Criar o chefe',t:'Em <b>Personagens › Novo</b>, marque <b>criar com olho desativado</b> e <b>ocultar status</b> para o Boss não aparecer antes da hora.',go:{view:'hub:chars'}},
  {h:'Revelar',t:'Na <b>Visão de Mesa</b>, ligue o <b>olhinho</b> quando o inimigo entrar em cena e use <b>🙈/👁 Status</b> para esconder ou mostrar a vida dele.',go:{view:'hub:table'}},
  {h:'Estados',t:'O botão <b>☠ Estados</b> em cada cartão aplica condições em qualquer personagem. Veneno e sangramento descontam sozinhos nos turnos.',go:{view:'hub:table'}},
  {h:'Combate',t:'Inicie o combate no painel de rodadas: os jogadores rolam Reflexo e você rola pelos NPCs. Você joga os turnos dos NPCs com o mesmo menu.',go:{view:'hub:table'}},
  {h:'Descanso',t:'Defina o <b>Patamar</b> do ambiente e deixe cada jogador fazer a Trégua na própria ficha.',go:G('rest','#restBase')}]}
};

const TAB_TIPS={
 overview:['Aqui ficam nome, <b>Estágio</b> e recursos. Subir o estágio atualiza Vital, Lucidez e Essência sozinho.','Os botões −5, −1, +1, +5 mexem nos recursos sem bug. Prometo.'],
 attributes:['Cada ponto de atributo é <b>1 d20</b>. Não deixe a Destreza em 1.','No Estágio 1 o máximo por atributo é 3.'],
 skills:['Clique no 🎲 para rolar. Perícia treinada = vocação ou extra (+5).','Não escolha perícia só pelo bônus. (Vai escolher.)'],
 vocation:['A vocação dá +V em 3 perícias e 2 talentos. Escolha pela história.','Anos de serviço mudam o +V (5/10/15).'],
 track:['Arquétipo vem no Estágio 3; a trilha dá poder nos estágios 3, 5, 8 e 10.'],
 talents:['Talento não gasta turno, mas gasta <b>Essência</b>. Um por turno em combate.','Bônus de perícia some depois da primeira rolagem.'],
 inventory:['Arma nas mãos, cintura ou bandoleira = saque rápido. Vista proteções para subir a DF.','Falta item? Use <b>＋ Criar item novo</b>.'],
 states:['Aplique o estado e o app faz o resto. Remova com o ×.'],
 mind:['Lucidez 0 = Protocolo de Colapso. O app cuida das contas.'],
 combat:['DF = {{r:db}} + proteções vestidas + Destreza (sem proteção Pesada). Resultados: esquiva, bloqueio, normal, violento e retaliação.'],
 rest:['Trégua recupera ES e Lucidez, nunca Vital. Para Vital: Sutura Bruta ou Síntese Cirúrgica.'],
 records:['Rituais: <b>Aprender</b> primeiro, depois <b>Conjurar</b>. Anote a crônica no fim da página.']
};
const CHIPS={
 overview:['Como criar minha ficha?','O que é Estágio?','Revisar minha ficha'],
 attributes:['Como distribuir atributos?','Como rolar um teste?','Revisar minha ficha'],
 skills:['Como escolho as perícias extras?','O que é Mestre e Maestria?','Como rolar um teste?'],
 vocation:['O que é vocação?','Anos de serviço','Qual build escolher?'],
 track:['O que é arquétipo?','O que é trilha?','Qual build escolher?'],
 talents:['Como usar talento?','O que é Essência?','E se faltar Essência?'],
 inventory:['Como equipar uma arma?','Como funciona a carga?','Como criar um item?'],
 states:['O que são estados?','O que é Morrendo?'],
 mind:['O que é Colapso?','O que é Êxtase?','O que é Trauma?'],
 combat:['Como funciona a defesa?','Como funciona o combate?','O que é acerto violento?'],
 rest:['Como funciona a Trégua?','Como usar Sutura Bruta?','O que é Combustão Vital?'],
 records:['Como aprender rituais?','Como conjurar?','Revisar minha ficha'],
 home:['Como entrar numa campanha?','O que é o olhinho?','Quem é você?'],
 hub:['O que é a Visão de Mesa?','Como funciona o combate?','Como ocultar status?']
};


/* ===== PERSEUS · conhecimento vivo (Onda 4) =====
   Nenhum número de regra mora nos textos: eles usam {{r:id}} (valor em vigor, E.regra), {{x:id}} (multiplicador, some se for 1),
   {{carga}} e {{comb}} (fórmulas). O resolvedor roda na hora de responder, então uma regra editada pelo Mestre (chave "rules")
   muda a resposta sem recarregar. As entradas dinâmicas (atributos, perícias, especializações, coberturas, bloqueio, manobras,
   tiroteio e alterações do Mestre) são montadas dos mesmos dados do sistema; os textos do Manual (chave "manual") entram pela
   busca de blocos (manualHits14). */
const pf14=v=>String(v).replace('.',',');
function rules14(s){
  s=String(s==null?'':s);if(s.indexOf('{{')<0)return s;
  const x=v=>v===1?'':pf14(v)+' × ';
  return s.replace(/\{\{r:(\w+)\}\}/g,(m,id)=>{const v=E.regra(id);return v===undefined?m:pf14(v)})
    .replace(/\{\{x:(\w+)\}\}/g,(m,id)=>{const v=E.regra(id);return v===undefined?m:x(v)})
    .replace(/\{\{carga\}\}/g,()=>`${pf14(E.regra('cargaBase'))} + ${x(E.regra('cargaPorFor'))}Força (+${pf14(E.regra('cargaMochila'))} com mochila)`)
    .replace(/\{\{comb\}\}/g,()=>`${pf14(E.regra('combBase'))} + ${x(E.regra('combPorCon'))}Constituição`)
    .replace(/\{\{attr:([^}]+)\}\}/g,(m,n)=>E.attrBenefits(n.trim()).join(' '));
}
const plain14=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const cap14=t=>t.charAt(0).toUpperCase()+t.slice(1);
function effLines14(v){
  try{return(v.effects||[]).map(e=>typeof effText29==='function'?effText29(e):'').filter(Boolean)}catch(e){return[]}
}
function buildDyn14(){
  const out=[],r=k=>pf14(E.regra(k)),add=(id,title,kws,a,o={})=>out.push({id:'dyn-'+id,title,kws,a,dyn:1,...o});
  const DB=r('db'),mestre=()=>{try{return T3.rulesLog29(6)}catch(e){return[]}};
  add('cobertura','Coberturas e posição (valores em vigor)',['cobertura','cobertura parcial','cobertura pesada','cobertura total','abrigo','se esconder atras','parede e tiro','disparada','caido tiro','bonus de cobertura','quanto vale a cobertura'],
    `A <b>cobertura parcial</b> soma <b>+${r('coberturaParcial')}</b> na DF e a <b>pesada +${r('coberturaPesada')}</b>; a total bloqueia a linha de visão (não há tiro). No mapa: 2 de 3 linhas de visão = parcial, 1 = pesada, 0 = total. Contra disparos, alvo em Disparada ganha <b>+${r('disparadaDF')}</b> na DF e alvo Caído <b>+${r('caidoDF')}</b>. A Defesa Base é <b>${DB}</b>.`,
    {rel:['defesa','dyn-tiroteio']});
  add('bloqueio','Bloqueio, Guarda Fechada e Reação (valores em vigor)',['bloqueio','bloquear','guarda fechada','brecha','erro total','guarda quebrada','contra ataque corpo a corpo','reducao de dano no bloqueio','reacao por rodada','parcial bloqueio'],
    `Você tem <b>1 Reação por rodada</b> (volta no início do seu turno). Bloquear: (CON)d20 + Briga contra o ataque. Redução = <b>${r('bloqPorCon')} × CON</b> + especialização + <b>${r('guardaBonus')}</b> com a Guarda Fechada (Ação Padrão, até <b>${r('guardaUsos')}</b> Bloqueios na rodada). Dano bloqueado = dano ÷ <b>${r('bloqueioDivisor')}</b> − redução, mínimo <b>${r('bloqueioMinimo')}</b>. <b>Erro total</b>: ataque &lt; ${DB} e Bloqueio ≥ ${DB} = 0 de dano e Contra-Ataque grátis. <b>Brecha</b>: Bloqueio ≥ ataque com ataque &lt; ${DB}, ou folga de <b>${r('brechaMargem')}</b>: dano reduzido e Contra-Ataque. <b>Guarda quebrada</b>: Bloqueio &lt; ${DB} e ataque ≥ ${DB} = dano total.`,
    {rel:['dyn-manobras','dyn-cobertura']});
  add('manobras','Manobras: Desarmar, Derrubar, Agarrar e Empurrar (valores em vigor)',['manobra','manobras','desarmar','derrubar','agarrar','escapar','empurrar','empurrao','colisao','queda no empurrao','arma de duas maos desarmar'],
    `Cada manobra é <b>1 Ação Padrão</b>, adjacente, sem dano, e o empate favorece quem defende. <b>Empurrar</b>: DT <b>${r('empurraoDT')}</b> + o maior entre FOR e CON do alvo; ${r('empurraoPasso')} m por faixa de margem (2 faixas a partir de ${r('empurraoMargem2')}, 3 a partir de ${r('empurraoMargem3')}); teto de ${r('empurraoTeto')} m por ponto de FOR do atacante. Colisão causa <b>${E.regra('colisaoDado')}</b> e queda <b>${E.regra('quedaDado')}</b>. <b>Desarmar</b> arma de duas mãos: −${r('desarmeDuasMaos')} para o atacante.`,
    {rel:['dyn-bloqueio']});
  add('tiroteio','Tiroteio: queima-roupa, Mergulho e supressão (valores em vigor)',['tiroteio','tiro','disparo','queima roupa','mergulho','segundo disparo','acerto violento tiro','fogo de supressao','supressao','suprimido','tiro livre','espingarda alcance','mirar','armas de fogo'],
    `Contra tiros não há Esquiva nem Bloqueio, exceto à <b>queima-roupa (até ${r('queimaRoupa')} m)</b>. O alvo ciente gasta a Reação no <b>Mergulho</b> (até <b>${r('mergulhoM')} m</b>) contra a Defesa Base <b>${DB}</b>. Espingardas empurram até <b>${r('espingardaAlcance')} m</b> (alcance curto padrão). Disparada +${r('disparadaDF')} e Caído +${r('caidoDF')} na DF. Fogo de Supressão: Resistência (Firmeza Mental) contra o ataque; quem sai da cobertura leva um Tiro Livre.`,
    {rel:['dyn-cobertura']});
  add('mesa-regras','Deslocamento, arremesso e furtividade (regras da mesa em vigor)',['deslocamento','quantos metros eu ando','metros por turno','movimento por turno','correr','dt do arremesso','dt de arremesso','dt da furtividade','furtividade dos inimigos','porta furtiva','dt da porta','alcance do arremesso'],
    (()=>{let t={move:9,dtThrow:12,dtStealth:0};try{t=T3.rulesTable29()}catch(e){}
      const door=typeof dtDoor22==='function'?dtDoor22():null;
      return `Deslocamento base: <b>${pf14(t.move)} m</b> por turno (correr dobra). Arremesso: DT <b>${t.dtThrow}</b> até 6 m, <b>${t.dtThrow+3}</b> até 12 m, <b>${t.dtThrow+6}</b> até 18 m e +2 a cada 6 m depois. Furtividade contra inimigos: ${t.dtStealth?`DT fixa <b>${t.dtStealth}</b>`:`DT = <b>${r('furtDTBase')} + Percepção do inimigo</b>`}${door?`; porta furtiva: Destreza + Furtividade, DT <b>${door}</b>`:''}.`})(),
    {rel:['turno-combate']});
  add('medicina-campo','Medicina de campo (valores em vigor)',['medicina de campo','dt da sutura','dt da sintese','dt medicina','curar com intervencao','sutura dt','sintese dt','quanto de dt'],
    `<b>Sutura Bruta</b>: DT <b>${r('suturaDT')}</b>. <b>Síntese Cirúrgica</b>: DT <b>${r('sinteseDT')}</b> (<b>${r('sinteseDTGrave')}</b> com Ferida Exposta ou paciente que caiu a 0 VT). A cura soma <b>${r('curaPorInt')}</b> por ponto de INT. A especialização de Medicina soma o bônus dela só no sucesso.`,
    {rel:['sutura-bruta','sintese-cirurgica']});
  add('atributos-beneficios','Benefícios dos 8 atributos (texto em vigor)',['beneficio de atributo','beneficios dos atributos','o que cada atributo faz','para que serve cada atributo','efeito dos atributos','atributo da bonus','o que o atributo da'],
    ATTR_DEFS.map(a=>`<b>${esc(a.name)} (${a.sigla})</b>: ${esc(a.desc)} ${E.attrBenefits(a.name).map(esc).join(' ')}`).join('<br>'),{rel:['atributos']});
  ATTR_DEFS.forEach(a=>{
    const nm=normP(a.name);
    add('attr-'+a.sigla.toLowerCase(),'Atributo: '+a.name,[`o que ${nm} faz`,`para que serve ${nm}`,`beneficio de ${nm}`,`${nm} da`,`${nm} beneficio`,a.sigla.toLowerCase()+' atributo'],
      `<b>${esc(a.desc)}</b> ${E.attrBenefits(a.name).map(esc).join(' ')}`,{rel:['dyn-atributos-beneficios','atributos']});
  });
  /* perícias e especializações (inclui as editadas ou criadas pelo Mestre) */
  const per=E.periciaDefs(),verts=E.vertDefs();
  add('vertentes','Especializações (vertentes) de perícia',['especializacao','especializacoes','vertente','vertentes','generalista','outra area','treinar especializacao','lista de especializacoes','todas as vertentes','quais especializacoes'],
    `Treinar uma perícia inclui a 1ª especialização; cada uma a mais custa 1 escolha. Fora da especialização você usa o <b>generalista</b>: grau ÷ <b>${r('generalistaDiv')}</b> mais o +V inteiro, sem efeito tático (e nada do que exige treino específico). Hoje são <b>${per.length} perícias</b> e <b>${verts.length} especializações</b>:<br>`+
      per.map(p=>`<b>${esc(p.name)}</b>: ${esc(E.vertsOf(p.id).map(v=>v.name).join('; ')||'nenhuma')}`).join('<br>'),{rel:['pericias','dyn-ferramentas']});
  per.forEach(p=>{
    const vs=E.vertsOf(p.id);
    add('pericia-'+p.id,'Perícia: '+p.name,[p.name,...(p.skills||[]),`o que e ${p.name}`,`especializacoes de ${p.name}`,`${p.name} especializacao`],
      `<b>${esc(p.name)}</b> (${esc(p.grupo||'')}). ${esc(p.desc||'')}${vs.length?'<br>Especializações: '+vs.map(v=>`<b>${esc(v.name)}</b> (${v.attrs.map(a=>a.slice(0,3).toUpperCase()).join('/')}): ${esc(v.desc||'')}`).join('<br>'):''}<br>Fora da especialização: grau ÷ ${r('generalistaDiv')}.`,{rel:['dyn-vertentes']});
  });
  verts.forEach(v=>{
    const parts=String(v.name).split(/\s*[\/&,]\s*/).filter(x=>x.length>3),fx=effLines14(v);
    add('vert-'+v.id,v.name+' ('+(E.pericia(v.pericia)?.name||v.pericia)+')',[v.name,...parts],
      `<b>${esc(v.desc||'')}</b> Atributos: ${v.attrs.map(esc).join(' ou ')}.${v.requiresTraining?' <b>Exige treino específico</b>: o generalista não vale.':''}${fx.length?'<br>No sistema: '+fx.map(esc).join('; ')+'.':''}`,{rel:['dyn-vertentes']});
  });
  add('ferramentas','Ações das especializações na ficha (valores em vigor)',['apneia','folego','exaustao','varredura de cena','barricada','barricar','fortificacao','autopsia','forense','psiquiatria','estabilizar surto','arrombamento','tranca silenciosa','rolagem silenciosa','conducao veiculo','pilotar','cirurgia na tregua','acoes das especializacoes'],
    `Na aba <b>Perícias › Especializações</b>: <b>Fôlego</b> dá apneia de ${r('apneiaBase')} + ${r('apneiaPorCon')} × CON rodadas (× multiplicador da vertente; cada rodada = ${r('rodadaSeg')} s) e reduz as penalidades de Exaustão; <b>Varredura de Cena</b> reduz o tempo da busca; <b>Segurança</b> dá +d20 em armadilhas e rolagem silenciosa em trancas e sistemas; <b>Condução</b> checa o treino (aeronaves e submersíveis exigem treino específico); <b>Perícia Forense</b> faz a autópsia (DT ${r('autopsiaDT')}, +1 achado a cada ${r('autopsiaPasso')} de margem); <b>Psiquiatria</b> estabiliza surto (DT ${r('psiquiatriaDT')}, devolve Lucidez, nunca Vital). No mapa, <b>Fortificação & Barricadas</b> monta barricada com DT <b>${r('barricadaDT')}</b> + o bônus da vertente.`,{rel:['dyn-vertentes']});
  const L=mestre();
  add('alteracoes','O que o Mestre mudou nas regras',['o que mudou','alteracoes do sistema','mudancas de regra','o mestre mudou','regras alteradas','regra da campanha','historico de alteracoes','mudou alguma regra'],
    L.length?'Últimas alterações do Mestre nesta campanha:<br>'+L.map(e=>`• <b>${esc(e.kind)}: ${esc(e.label)}</b> ${e.del?'(removido)':e.add?'(novo)':''}${e.changes.length?' — '+e.changes.map(esc).join('; '):''}`).join('<br>'):'O Mestre ainda não alterou nenhuma regra nesta campanha: valem os números padrão do Manual.',{rel:['dyn-vertentes']});
  return out;
}
let DYN14={sig:'',list:[]};
function dynSig14(){
  let a=0,b=0,n=0;
  try{a=T3.rulesRev29?T3.rulesRev29():0}catch(e){}
  try{b=T3.man31?.data?.rev||0}catch(e){}
  try{n=JSON.stringify(VERT_DEFS).length+JSON.stringify(PERICIA_DEFS).length+ATTR_DEFS.map(x=>x.desc).join('').length}catch(e){}
  return[a,b,n,JSON.stringify(REGRA_NUM)].join('|');
}
/* base estática + entradas vivas (reconstruídas só quando as regras mudam) */
function allK14(){
  const sig=dynSig14();
  if(DYN14.sig!==sig){
    let list=[];
    try{list=buildDyn14();list.forEach(e=>{e.nk=e.kws.map(normP);e.nt=normP(e.title).split(' ').filter(w=>!STOP.has(w)&&w.length>2)})}catch(err){console.warn('[Perseus] conhecimento vivo',err);list=[]}
    DYN14={sig,list};
  }
  return K.concat(DYN14.list);
}

/* ---------- textos do Manual (chave "manual", com as edições do Mestre) ---------- */
let MAN14={sig:'',blocks:[]};
function manualBlocks14(){
  if(typeof chapters31!=='function')return[];
  const D=(typeof man31==='function'?man31():null)||{},sig=[D.rev||0,JSON.stringify(REGRA_NUM)].join('|');
  if(MAN14.sig===sig)return MAN14.blocks;
  const out=[],tx=t=>{try{return typeof tokens31==='function'?tokens31(t):rules14(t)}catch(e){return rules14(t)}};
  const clean=t=>tx(String(t||'')).replace(/\*\*|\*/g,'').replace(/\n- /g,'\n• ').trim();
  try{
    chapters31().forEach(c=>(c.secs||[]).forEach(s=>{
      const head=((D.ttl&&D.ttl[s.id])||s.h||''),ch=(D.ttl&&D.ttl[c.id])||c.h||'';
      const push=(id,t)=>{const ed=D.ed&&D.ed[id];if(ed&&ed.del)return;const raw=ed&&ed.t!=null?ed.t:t;if(!raw||typeof raw!=='string'||raw.length<30)return;
        const text=clean(raw);out.push({id,title:head||ch,text,n:normP(head+' '+ch+' '+text)})};
      (s.b||[]).forEach(b=>{if(!b||b.live||b.tb||b.f)return;const id=Array.isArray(b)?b[0]:(b.id||b.glitch),t=Array.isArray(b)?b[1]:b.t;if(id&&t)push(id,t)});
    }));
    (D.add||[]).forEach(a=>{const ed=D.ed&&D.ed[a.id];if(ed&&ed.del)return;const raw=ed&&ed.t!=null?ed.t:a.t;if(raw&&raw.length>=30){const text=clean(raw);out.push({id:a.id,title:'Nota do Mestre',text,n:normP(text)})}});
  }catch(e){console.warn('[Perseus] manual',e)}
  MAN14={sig,blocks:out};return out;
}
/* até 2 blocos do Manual cujos termos casam com a pergunta (pontuação abaixo da base de conhecimento) */
function manualHits14(nq,qt){
  const terms=qt.filter(w=>w.length>=4);if(!terms.length)return[];
  const need=terms.length>=3?2:1;
  return manualBlocks14().map(b=>{
    let hit=0;terms.forEach(w=>{if(b.n.includes(w))hit++});
    const tn=normP(b.title);let tb=0;terms.forEach(w=>{if(tn.includes(w))tb++});
    return{b,hit,tb};
  }).filter(x=>x.hit>=need&&x.hit>=Math.ceil(terms.length*.6)).map(x=>({b:x.b,sc:Math.min(5.5,1.5+x.hit*1.1+x.tb*1.2)})).sort((a,b)=>b.sc-a.sc).slice(0,2).map(x=>{
    const t=x.b.text.length>700?x.b.text.slice(0,700).replace(/\s+\S*$/,'')+'…':x.b.text;
    return{e:{id:'man-'+x.b.id,title:'Manual · '+x.b.title,a:esc(t).replace(/\n/g,'<br>'),kws:[],nk:[],nt:[],manual:1},sc:x.sc};
  });
}
