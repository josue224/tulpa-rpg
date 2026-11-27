/* ===================================================================
   TULPA · ONDA 8 — Catálogo de Perícias e Vertentes (Especializações)
   Só dados. As regras ficam no motor (js/10, E.*).
   PERICIA_DEFS e VERT_DEFS são as listas VIVAS: o js/40 as reconstrói
   com as alterações da campanha (chave "rules": rules.pericia e
   rules.vert), por list29/cur29, como os outros catálogos.
   Os ids são estáveis (ficam salvos nas fichas): nunca os renomeie.

   Formato do efeito tático (lido pelo motor, E.vertEffects/E.vertSum):
     {tipo, quando?, alvo?, acao?, valor?, dado?, atributo?, custo?, limite?, metros?, alcanceMax?}
   Tipos: dados (+Nd20) · dano · danoExtra · danoAtributo · atributoAtaque ·
   atributoManobra · rdBloqueio · cura · dt · alcance · multiplicador ·
   empurrao · mirar · conceder · permite · ignora · bloqueia
   =================================================================== */
const PERICIA_DEFS=(()=>{
  const P=(id,name,grupo,skills)=>({id,name,grupo,skills:skills||[name],desc:''});
  return[
    P('briga','Briga','Combate & Ação Física'),
    P('armasbrancas','Armas Brancas','Combate & Ação Física'),
    P('armasdisparo','Armas de Disparo','Combate & Ação Física'),
    P('atletismo','Atletismo','Combate & Ação Física'),
    P('arremesso','Arremesso','Combate & Ação Física'),
    P('medicina','Medicina','Ciência, Técnica & Campo'),
    P('investigacao','Investigação','Ciência, Técnica & Campo'),
    P('seguranca','Segurança','Ciência, Técnica & Campo'),
    P('conducao','Condução','Ciência, Técnica & Campo'),
    P('sobrevivencia','Sobrevivência','Ciência, Técnica & Campo'),
    P('intimidacao','Intimidação','Social, Mental & Oculto'),
    P('intuicao','Intuição','Social, Mental & Oculto'),
    P('lideranca','Liderança','Social, Mental & Oculto'),
    P('persuasao','Persuasão / Etiqueta','Social, Mental & Oculto',['Persuasão','Etiqueta']),
    P('enganacao','Enganação','Social, Mental & Oculto'),
    P('furtividade','Furtividade','Social, Mental & Oculto'),
    P('resistencia','Resistência','Social, Mental & Oculto'),
    P('teosofia','Teosofia','Social, Mental & Oculto')
  ];
})();

const VERT_DEFS=(()=>{
  const FOR='Força',DES='Destreza',CON='Constituição',INT='Inteligência',PER='Percepção',CAR='Carisma',APA='Aparência',PRE='Presença';
  const dados=(quando,valor=1)=>({tipo:'dados',quando,valor});
  const permite=acao=>({tipo:'permite',acao});
  const ignora=quando=>({tipo:'ignora',quando});
  const mult=(alvo,valor)=>({tipo:'multiplicador',alvo,valor});
  const out=[];
  const V=(pericia,slug,name,attrs,desc,effects,extra)=>{
    const p=PERICIA_DEFS.find(x=>x.id===pericia);
    out.push({id:pericia+'.'+slug,pericia,skill:p.skills[0],name,attrs,desc,effects,requiresTraining:false,...extra});
  };

  /* ---------- Combate & Ação Física ---------- */
  V('briga','rua','Briga de Rua',[FOR],'+1 de dano desarmado; +1d20 com armas improvisadas.',
    [{tipo:'dano',quando:'desarmado',valor:1},dados('armaImprovisada')]);
  V('briga','boxe','Boxe / Muay Thai',[FOR,DES],'+2 de redução de dano ao Bloquear corpo a corpo; +1d20 em Contra-Ataques.',
    [{tipo:'rdBloqueio',valor:2},dados('contraAtaque')]);
  V('briga','karate','Taekwondo / Karatê',[DES],'+1d20 em Desarmar e Empurrar (Empurrar com Destreza); sem penalidade contra armas brancas curtas.',
    [dados('desarmar'),dados('empurrar'),{tipo:'atributoManobra',quando:'empurrar',atributo:DES},ignora('contraArmaBrancaCurta')]);
  V('briga','judo','Judô / Wrestling',[FOR],'+1d20 em Derrubar; ao derrubar, pode gastar a Reação para manter o alvo Agarrado no chão.',
    [dados('derrubar'),{tipo:'permite',acao:'agarrarAoDerrubar',custo:'reacao'}]);
  V('briga','jiujitsu','Jiu-Jitsu / Luta de Chão',[DES],'+1d20 em Agarrar e Escapar; +1d4 de dano contra alvo Agarrado e Caído.',
    [dados('agarrar'),dados('escapar'),{tipo:'danoExtra',quando:'alvoAgarradoCaido',dado:'1d4'}]);

  V('armasbrancas','curtas','Lâminas Curtas / Precisão',[DES],'Destreza no acerto e no dano; +1d20 em ataques Furtivos ou contra Desprevenidos e para ocultar a arma.',
    [{tipo:'atributoAtaque',atributo:DES},{tipo:'danoAtributo',quando:'corpoACorpo',atributo:DES},dados('furtivo'),dados('desprevenido'),dados('ocultarArma')]);
  V('armasbrancas','longas','Lâminas Longas & Impacto',[FOR],'+1d20 em Bloqueio com arma e para quebrar objetos e portas.',
    [dados('bloqueioArma'),dados('quebrarObjetos')]);

  V('armasdisparo','pistolas','Armas Curtas / Pistolas',[DES],'Saca e dispara na mesma ação sem penalidade; anula a desvantagem à queima-roupa (até 1,5 m).',
    [permite('sacarEDisparar'),{tipo:'ignora',quando:'queimaRoupa',alcanceMax:1.5}]);
  V('armasdisparo','espingardas','Espingardas / Escopetas',[FOR,DES],'Alcance curto (até 6 m): Empurrão automático de 1,5 m ao superar a DF; +2 de dano à queima-roupa.',
    [{tipo:'empurrao',quando:'superaDF',metros:1.5,alcanceMax:6},{tipo:'dano',quando:'queimaRoupa',valor:2}]);
  V('armasdisparo','fuzis','Fuzis & Carabinas',[DES],'+1d20 em Fogo de Supressão; sem penalidade em médio e longo alcance.',
    [dados('supressao'),ignora('alcanceMedioLongo')]);
  V('armasdisparo','precisao','Rifles de Precisão / Snipers',[PER,DES],'Gastando 1 Ação de Movimento para Mirar, ignora Cobertura Parcial (+4) e amplia a margem de crítico em 1 ponto.',
    [{tipo:'mirar',custo:'movimento',alvo:'coberturaParcial',valor:1}]);
  V('armasdisparo','arcos','Arcos & Balestras',[DES],'100% silencioso (atirar escondido não revela a posição); recupera a munição intacta após a cena.',
    [permite('disparoSilencioso'),permite('recuperarMunicao')]);

  V('atletismo','explosao','Explosão & Acrobacia',[FOR,DES],'+1d20 para atravessar obstáculos ou levantar; levanta sem movimento extra.',
    [dados('atravessarObstaculo'),dados('levantar'),permite('levantarSemMovimento')]);
  V('atletismo','folego','Fôlego & Resistência Física',[CON],'Dobra o tempo de apneia e reduz à metade as penalidades de Exaustão.',
    [mult('apneia',2),mult('penalidadeExaustao',0.5)]);

  V('arremesso','precisao','Precisão Leve',[DES],'Destreza no dano de armas arremessáveis; dobra o alcance curto.',
    [{tipo:'danoAtributo',quando:'arremesso',atributo:DES},mult('alcanceCurto',2)]);
  V('arremesso','explosivos','Carga & Explosivos',[FOR],'+3 m de alcance máximo; explosivos caem no ponto exato mesmo sob cobertura.',
    [{tipo:'alcance',alvo:'maximo',valor:3},permite('explosivoNoPontoExato')]);

  /* ---------- Ciência, Técnica & Campo ---------- */
  V('medicina','emergencia','Atendimento de Emergência / Trauma',[INT],'Única que estanca Sangramento grave e estabiliza quem está Morrendo em 1 Ação Padrão; +2 de cura na Sutura Bruta.',
    [permite('estancarSangramentoGrave'),permite('estabilizarEmUmaAcao'),{tipo:'cura',alvo:'sutura',valor:2}]);
  V('medicina','cirurgia','Cirurgia & Clínica Avançada',[INT],'Remove projéteis e venenos profundos; na Trégua, trata críticos restaurando +1d4 de Vital sem suprimentos adicionais.',
    [permite('removerProjeteisEVenenos'),{tipo:'cura',alvo:'criticoTregua',dado:'1d4'}],{requiresTraining:true});
  V('medicina','forense','Perícia Forense & Autópsia',[INT,PER],'Determina hora da morte, calibre, substâncias e anomalias em cadáveres sem laboratório completo; +1d20 no laudo (ação Autópsia na ficha).',
    [permite('autopsiaSemLaboratorio'),dados('autopsia')]);
  V('medicina','psiquiatria','Psiquiatria & Apoio Psicológico',[PRE,CAR],'Estabiliza surtos e restaura +2 de Lucidez extra; não cura Vital.',
    [permite('estabilizarSurto'),{tipo:'cura',alvo:'lucidez',valor:2},{tipo:'bloqueia',acao:'curarVital'}]);

  V('investigacao','varredura','Varredura de Cena',[PER],'Encontra pistas físicas e compartimentos na metade do tempo.',
    [mult('tempoBusca',0.5)]);
  V('investigacao','documental','Análise Documental & Arquivo',[INT],'+1d20 para cruzar registros, descobrir fraudes e conexões.',
    [dados('cruzarRegistros'),dados('fraude'),dados('conexoes')]);

  V('seguranca','arrombamento','Arrombamento & Mecânica',[DES,INT],'Abre trancas comuns em silêncio; +1d20 para desarmar armadilhas mecânicas.',
    [permite('trancaSilenciosa'),dados('desarmarArmadilha')]);
  V('seguranca','eletronica','Sistemas Eletrônicos & Vigilância',[INT],'Grampeia, sabota circuitos e invade sistemas dos anos 90 sem acionar alertas; +1d20 em armadilhas e sistemas eletrônicos.',
    [permite('invadirSemAlerta'),permite('grampearESabotar'),dados('armadilhaEletronica')]);
  V('seguranca','fortificacao','Fortificação & Barricadas',[FOR,INT],'+2 de resistência/DT em portas barricadas e coberturas improvisadas.',
    [{tipo:'dt',alvo:'barricada',valor:2},{tipo:'dt',alvo:'coberturaImprovisada',valor:2}]);

  V('conducao','terrestres','Veículos Terrestres',[DES],'+1d20 em manobras evasivas, perseguições e cobertura móvel.',
    [dados('manobraEvasiva'),dados('perseguicao'),dados('coberturaMovel')]);
  V('conducao','embarcacoes','Embarcações',[PER],'Navegação marítima e fluvial, inclusive com mau tempo; +1d20 em manobras evasivas.',
    [permite('navegar'),dados('manobraEvasiva')]);
  V('conducao','aeronaves','Aeronaves',[INT,DES],'Decolagem, pouso e voo por instrumentos; +1d20 em manobras evasivas. Exige treino específico.',
    [permite('pilotarAeronave'),dados('manobraEvasiva')],{requiresTraining:true});
  V('conducao','submersiveis','Veículos Submersíveis / Pesados Especiais',[INT],'Sonar, pressão e maquinário pesado; +1d20 em manobras evasivas. Exige treino específico.',
    [permite('operarSubmersivelPesado'),dados('manobraEvasiva')],{requiresTraining:true});

  V('sobrevivencia','rastreamento','Rastreamento & Caça',[PER],'Pegadas, criaturas, emboscadas naturais, água e comida; +1d20 ao rastrear ou caçar.',
    [permite('rastrearECacar'),dados('rastrear')]);
  V('sobrevivencia','orientacao','Orientação & Abrigo',[INT,PER],'Navegação sem GPS, leitura do clima e acampamento oculto; +1d20 para se orientar ou abrigar.',
    [permite('orientarEAbrigar'),dados('orientar')]);
  V('sobrevivencia','ambiental','Resistência Ambiental',[CON],'Selva, extremos térmicos, doenças e privação sem penalidade severa; +1d20 contra clima ou privação extrema.',
    [ignora('privacaoSevera'),dados('climaExtremo')]);

  /* ---------- Social, Mental & Oculto ---------- */
  V('intimidacao','coercao','Coerção Física',[FOR],'+1d20 estando armado ou em vantagem física.',
    [dados('armadoOuVantagemFisica')]);
  V('intimidacao','pressao','Pressão Psicológica',[PRE],'Frieza, autoridade ou chantagem à distância ou em desvantagem; +1d20 nessas situações.',
    [permite('intimidarEmDesvantagem'),dados('intimidarEmDesvantagem')]);

  V('intuicao','leitura','Leitura Fria & Detecção de Mentiras',[PER],'+1d20 para detectar mentiras, intenções ou armas ocultas.',
    [dados('detectarMentira'),dados('intencaoOuArmaOculta')]);
  V('intuicao','empatia','Empatia & Leitura Emocional',[CAR],'Identifica traumas, motivações e a melhor abordagem; +1d20 para ler emoções.',
    [permite('lerTraumasEMotivacoes'),dados('lerEmocoes')]);

  V('lideranca','comando','Comando Tático',[PRE],'1 vez por cena, com 1 Ação de Movimento, concede +1d20 no próximo teste de um aliado que ouça.',
    [{tipo:'conceder',alvo:'aliado',valor:1,custo:'movimento',limite:'cena'}]);
  V('lideranca','inspiracao','Inspiração & Moral',[CAR],'+1d20 ao grupo em resistência ao medo ou negociação coletiva.',
    [{...dados('resistirMedo'),alvo:'grupo'},{...dados('negociacaoColetiva'),alvo:'grupo'}]);

  V('persuasao','negociacao','Negociação & Submundo',[CAR],'Barganha, suborno e lábia de rua: reduz preços e evita escalada; +1d20 ao barganhar ou subornar.',
    [permite('barganharESubornar'),permite('evitarEscalada'),dados('barganha')]);
  V('persuasao','sociedade','Alta Sociedade & Protocolo',[APA,CAR],'+1d20 com autoridades, políticos, empresários e elite.',
    [dados('elite')],{skill:'Etiqueta'});

  V('enganacao','blefe','Blefe & Improviso',[CAR],'Mentiras rápidas e manipulação verbal; +1d20 em blefes e improvisos.',
    [permite('blefar'),dados('blefe')]);
  V('enganacao','disfarce','Disfarce & Infiltração',[APA,DES],'Muda aparência, postura, sotaque e documentos; +1d20 ao disfarçar-se ou infiltrar-se.',
    [permite('disfarcar'),dados('disfarce')]);

  V('furtividade','urbana','Infiltração Urbana & Sombras',[DES],'Silêncio em prédios, corredores e multidões; +1d20 nessas situações.',
    [permite('silencioUrbano'),dados('silencioUrbano')]);
  V('furtividade','camuflagem','Camuflagem & Emboscada',[PER,DES],'Oculta-se em vegetação ou escombros e prepara surpresas; +1d20 ao se camuflar ou emboscar.',
    [permite('camuflarEEmboscar'),dados('camuflagem')]);

  V('resistencia','vigor','Vigor Físico',[CON],'Venenos, toxinas, doenças, dor, sufocamento e fadiga; +1d20 nessas resistências.',
    [permite('resistirFisico'),dados('resistirFisico')]);
  V('resistencia','firmeza','Firmeza Mental',[PRE],'Medo, terror sobrenatural, controle mental, tortura e Fogo de Supressão; +1d20 contra medo e controle mental.',
    [permite('resistirMental'),permite('resistirSupressao'),dados('resistirMental')]);

  V('teosofia','estudo','Estudo Oculto & Sigilos',[INT],'Textos antigos, idiomas mortos, cultos e teoria das anomalias; +1d20 ao estudar textos ocultos.',
    [permite('estudarOculto'),dados('estudarOculto')]);
  V('teosofia','canalizacao','Sensibilidade & Canalização',[PRE],'Sente Aura e interferências e canaliza Essência; +1d20 ao sentir Aura ou canalizar.',
    [permite('sentirAura'),permite('canalizarEssencia'),dados('canalizar')]);

  return out;
})();

/* ===================================================================
   ONDA 13 — Números das regras e textos dos atributos (só dados).
   O Mestre ajusta pela chave "rules" (rules.num e rules.attr); o js/40
   reaplica em REGRA_NUM e ATTR_DEFS. O motor lê por E.regra(id) e cai no
   padrão (d) quando o valor salvo é antigo ou inválido.
   =================================================================== */
const ATTR_DEFS=[
  ['Força','FOR','Potência física: carga e golpes.'],
  ['Destreza','DES','Agilidade e precisão: esquiva, Defesa e armas leves.'],
  ['Constituição','CON','Vigor do corpo: Vital, bloqueio e Combustão Vital.'],
  ['Inteligência','INT','Estudo e raciocínio: perícias e medicina.'],
  ['Percepção','PER','Atenção: notar quem se aproxima e se recompor na Trégua.'],
  ['Presença','PRE','Força de espírito: Essência e blindagem da mente.'],
  ['Carisma','CAR','Condução de conversas e liderança.'],
  ['Aparência','APA','A primeira impressão.']
].map(([id,sigla,desc])=>({id,name:id,sigla,desc}));

/* g = nome do atributo ou área. who = quem recebe o aviso quando muda ('' = todos) */
const REGRA_DEFS=(()=>{
  const out=[];
  const R=(id,g,l,d,min,max,extra)=>out.push({id,g,l,d,min,max,step:1,...extra});
  R('cargaBase','Força','Limite de carga: base',3,0,20);
  R('cargaPorFor','Força','Limite de carga: por ponto de FOR',1,0,5);
  R('cargaMochila','Força','Limite de carga: extra com mochila ou maleta',2,0,10);
  R('danoPorFor','Força','Dano corpo a corpo e arremesso: por ponto de FOR',1,0,5);
  R('danoPorDes','Destreza','Dano com arma leve ou ágil: por ponto de DES',1,0,5);
  R('dfPorDes','Destreza','Defesa (DF): por ponto de DES (sem proteção Pesada nem excesso de carga)',1,0,5);
  R('vtPorCon','Constituição','Vital máximo: por ponto de CON',1,0,10);
  R('bloqPorCon','Constituição','Redução de dano no Bloqueio: por ponto de CON',1,0,5);
  R('combBase','Constituição','Combustão Vital: ES por turno, base',2,0,20);
  R('combPorCon','Constituição','Combustão Vital: ES por turno por ponto de CON',1,0,5);
  R('periciaIntBase','Inteligência','Perícias extras: contam os pontos de INT acima de',1,0,10);
  R('periciaPorInt','Inteligência','Perícias extras (+5) por ponto acima disso',1,0,5);
  R('curaPorInt','Inteligência','Cura de Sutura Bruta e Síntese: por ponto de INT',1,0,5);
  R('furtDTBase','Percepção','DT contra aproximação furtiva: base',10,0,30);
  R('furtPorPer','Percepção','DT contra aproximação furtiva: por ponto de PER',1,0,5);
  R('treguaPorPer','Percepção','Lucidez recuperada na Trégua: por ponto de PER',1,0,5);
  R('esPorPre','Presença','Essência máxima: por ponto de PRE',1,0,10);
  R('blindPorPre','Presença','1º dano de Lucidez da cena: redução por ponto de PRE',1,0,5);
  R('blindMin','Presença','Dano de Lucidez que sempre passa pela blindagem',1,0,10);
  R('socialPorCar','Carisma','Diálogo contínuo: bônus por ponto de CAR',1,0,10);
  R('socialPorApa','Aparência','1ª rolagem social: bônus por ponto de APA',1,0,10);

  R('db','Defesa e Coberturas','Defesa Base (DB)',10,1,30);
  R('coberturaParcial','Defesa e Coberturas','Cobertura Parcial: bônus na DF',4,0,20);
  R('coberturaPesada','Defesa e Coberturas','Cobertura Pesada: bônus na DF',6,0,30);
  R('disparadaDF','Defesa e Coberturas','Alvo em Disparada: bônus na DF contra tiros',2,0,20);
  R('caidoDF','Defesa e Coberturas','Alvo Caído: bônus na DF contra disparos',2,0,20);

  R('bloqueioDivisor','Bloqueio e Reação','Dano bloqueado é dividido por',2,1,10);
  R('bloqueioMinimo','Bloqueio e Reação','Dano mínimo que passa no Bloqueio',1,0,10);
  R('brechaMargem','Bloqueio e Reação','Brecha: folga do Bloqueio sobre o ataque',5,1,30);
  R('guardaBonus','Bloqueio e Reação','Guarda Fechada: redução extra',2,0,20);
  R('guardaUsos','Bloqueio e Reação','Guarda Fechada: Bloqueios por rodada',2,1,6);

  R('empurraoDT','Manobras','Empurrar: DT base (soma o maior entre FOR e CON do alvo)',10,0,30);
  R('empurraoPasso','Manobras','Empurrar: metros por faixa de margem',1.5,0.5,6,{step:0.5});
  R('empurraoMargem2','Manobras','Empurrar: margem para 2 faixas',5,1,30);
  R('empurraoMargem3','Manobras','Empurrar: margem para 3 faixas',10,2,40);
  R('empurraoTeto','Manobras','Empurrar: teto em metros por ponto de FOR do atacante',1.5,0.5,6,{step:0.5});
  R('desarmeDuasMaos','Manobras','Desarmar arma de duas mãos: penalidade do atacante',2,0,20);
  R('colisaoDado','Manobras','Dano de colisão no empurrão','1d4',0,0,{t:'dado'});
  R('quedaDado','Manobras','Dano de queda no empurrão','1d6',0,0,{t:'dado'});

  R('queimaRoupa','Tiroteio Tático','Queima-roupa: distância máxima (m)',1.5,0.5,6,{step:0.5,who:'disparo'});
  R('espingardaAlcance','Tiroteio Tático','Espingardas: alcance curto (m) quando a especialização não define outro',6,1.5,30,{step:0.5,who:'disparo'});
  R('mergulhoM','Tiroteio Tático','Mergulho: deslocamento máximo (m)',3,0,12,{step:0.5});

  R('generalistaDiv','Perícias','Generalista (fora da especialização): o grau é dividido por',2,1,5,{who:'vertente'});
  R('rodadaSeg','Perícias','Duração de uma rodada (segundos), para o cronômetro de apneia',6,1,60,{who:'vertente'});
  R('apneiaBase','Perícias','Apneia: rodadas sem respirar, base',3,0,60,{who:'vertente'});
  R('apneiaPorCon','Perícias','Apneia: rodadas a mais por ponto de CON',1,0,10,{who:'vertente'});
  R('barricadaDT','Perícias','Barricada (porta ou cobertura): DT base para forçar ou derrubar',10,1,40);
  R('autopsiaDT','Perícias','Autópsia: DT para o 1º achado',12,1,40,{who:'medicina'});
  R('autopsiaPasso','Perícias','Autópsia: margem acima da DT para cada achado a mais',4,1,20,{who:'medicina'});
  R('psiquiatriaDT','Perícias','Psiquiatria: DT para estabilizar um surto',12,1,40,{who:'medicina'});

  R('suturaDT','Medicina de Campo','Sutura Bruta: DT',15,1,40,{who:'medicina'});
  R('sinteseDT','Medicina de Campo','Síntese Cirúrgica: DT',15,1,40,{who:'medicina'});
  R('sinteseDTGrave','Medicina de Campo','Síntese em Ferida Exposta ou caído a 0 VT: DT',18,1,40,{who:'medicina'});
  return out;
})();
const REGRA_NUM=Object.fromEntries(REGRA_DEFS.map(r=>[r.id,r.d]));

/* situações dos efeitos "+dados": nome para a tela. As de QUANDO_AUTO o combate aplica sozinho;
   as outras (e as que o Mestre criar) viram a opção "a situação da especialização se aplica". */
const QUANDO_LABEL={
  contraAtaque:'Contra-Ataque',desarmar:'Desarmar',empurrar:'Empurrar',derrubar:'Derrubar',agarrar:'Agarrar',escapar:'Escapar',
  furtivo:'ataque furtivo',desprevenido:'alvo desprevenido',supressao:'Fogo de Supressão',armaImprovisada:'arma improvisada',
  bloqueioArma:'Bloqueio com arma',ocultarArma:'ocultar a arma',quebrarObjetos:'quebrar objetos ou portas',
  atravessarObstaculo:'atravessar obstáculo',levantar:'levantar-se',cruzarRegistros:'cruzar registros',fraude:'achar fraude',
  conexoes:'ligar conexões',desarmarArmadilha:'desarmar armadilha mecânica',manobraEvasiva:'manobra evasiva',
  perseguicao:'perseguição',coberturaMovel:'cobertura móvel',armadoOuVantagemFisica:'armado ou em vantagem física',
  detectarMentira:'detectar mentira',intencaoOuArmaOculta:'intenção ou arma oculta',resistirMedo:'resistir ao medo',
  negociacaoColetiva:'negociação coletiva',elite:'autoridades e elite',
  desarmado:'desarmado',queimaRoupa:'queima-roupa',alcanceMedioLongo:'médio e longo alcance',superaDF:'ao superar a DF',
  corpoACorpo:'corpo a corpo',arremesso:'arremesso',alvoAgarradoCaido:'alvo Agarrado e Caído',
  contraArmaBrancaCurta:'contra armas brancas curtas',privacaoSevera:'privação severa',
  armadilhaEletronica:'armadilha ou sistema eletrônico',rastrear:'rastrear ou caçar',orientar:'orientar-se ou abrigar-se',climaExtremo:'clima ou privação extrema',
  intimidarEmDesvantagem:'intimidar à distância ou em desvantagem',lerEmocoes:'ler emoções ou traumas',barganha:'barganhar ou subornar',blefe:'blefe ou improviso',
  disfarce:'disfarce ou infiltração',silencioUrbano:'silêncio em prédios e multidões',camuflagem:'camuflagem ou emboscada',resistirFisico:'resistir a veneno, dor ou fadiga',
  resistirMental:'resistir a medo ou controle mental',estudarOculto:'estudar textos ocultos',canalizar:'sentir Aura ou canalizar',autopsia:'laudo de autópsia'
};
const QUANDO_AUTO=['contraAtaque','desarmar','empurrar','derrubar','agarrar','escapar','supressao','armaImprovisada','bloqueioArma'];
