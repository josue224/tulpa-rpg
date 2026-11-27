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
  V('medicina','forense','Perícia Forense & Autópsia',[INT,PER],'Determina hora da morte, calibre, substâncias e anomalias em cadáveres sem laboratório completo.',
    [permite('autopsiaSemLaboratorio')]);
  V('medicina','psiquiatria','Psiquiatria & Apoio Psicológico',[PRE,CAR],'Estabiliza surtos e restaura +2 de Lucidez extra; não cura Vital.',
    [permite('estabilizarSurto'),{tipo:'cura',alvo:'lucidez',valor:2},{tipo:'bloqueia',acao:'curarVital'}]);

  V('investigacao','varredura','Varredura de Cena',[PER],'Encontra pistas físicas e compartimentos na metade do tempo.',
    [mult('tempoBusca',0.5)]);
  V('investigacao','documental','Análise Documental & Arquivo',[INT],'+1d20 para cruzar registros, descobrir fraudes e conexões.',
    [dados('cruzarRegistros'),dados('fraude'),dados('conexoes')]);

  V('seguranca','arrombamento','Arrombamento & Mecânica',[DES,INT],'Abre trancas comuns em silêncio; +1d20 para desarmar armadilhas mecânicas.',
    [permite('trancaSilenciosa'),dados('desarmarArmadilha')]);
  V('seguranca','eletronica','Sistemas Eletrônicos & Vigilância',[INT],'Grampeia, sabota circuitos e invade sistemas dos anos 90 sem acionar alertas.',
    [permite('invadirSemAlerta'),permite('grampearESabotar')]);
  V('seguranca','fortificacao','Fortificação & Barricadas',[FOR,INT],'+2 de resistência/DT em portas barricadas e coberturas improvisadas.',
    [{tipo:'dt',alvo:'barricada',valor:2},{tipo:'dt',alvo:'coberturaImprovisada',valor:2}]);

  V('conducao','terrestres','Veículos Terrestres',[DES],'+1d20 em manobras evasivas, perseguições e cobertura móvel.',
    [dados('manobraEvasiva'),dados('perseguicao'),dados('coberturaMovel')]);
  V('conducao','embarcacoes','Embarcações',[PER],'Navegação marítima e fluvial, inclusive com mau tempo.',
    [permite('navegar')]);
  V('conducao','aeronaves','Aeronaves',[INT,DES],'Decolagem, pouso e voo por instrumentos.',
    [permite('pilotarAeronave')],{requiresTraining:true});
  V('conducao','submersiveis','Veículos Submersíveis / Pesados Especiais',[INT],'Sonar, pressão e maquinário pesado.',
    [permite('operarSubmersivelPesado')],{requiresTraining:true});

  V('sobrevivencia','rastreamento','Rastreamento & Caça',[PER],'Pegadas, criaturas, emboscadas naturais, água e comida.',
    [permite('rastrearECacar')]);
  V('sobrevivencia','orientacao','Orientação & Abrigo',[INT,PER],'Navegação sem GPS, leitura do clima e acampamento oculto.',
    [permite('orientarEAbrigar')]);
  V('sobrevivencia','ambiental','Resistência Ambiental',[CON],'Selva, extremos térmicos, doenças e privação sem penalidade severa.',
    [ignora('privacaoSevera')]);

  /* ---------- Social, Mental & Oculto ---------- */
  V('intimidacao','coercao','Coerção Física',[FOR],'+1d20 estando armado ou em vantagem física.',
    [dados('armadoOuVantagemFisica')]);
  V('intimidacao','pressao','Pressão Psicológica',[PRE],'Frieza, autoridade ou chantagem à distância ou em desvantagem.',
    [permite('intimidarEmDesvantagem')]);

  V('intuicao','leitura','Leitura Fria & Detecção de Mentiras',[PER],'+1d20 para detectar mentiras, intenções ou armas ocultas.',
    [dados('detectarMentira'),dados('intencaoOuArmaOculta')]);
  V('intuicao','empatia','Empatia & Leitura Emocional',[CAR],'Identifica traumas, motivações e a melhor abordagem.',
    [permite('lerTraumasEMotivacoes')]);

  V('lideranca','comando','Comando Tático',[PRE],'1 vez por cena, com 1 Ação de Movimento, concede +1d20 no próximo teste de um aliado que ouça.',
    [{tipo:'conceder',alvo:'aliado',valor:1,custo:'movimento',limite:'cena'}]);
  V('lideranca','inspiracao','Inspiração & Moral',[CAR],'+1d20 ao grupo em resistência ao medo ou negociação coletiva.',
    [{...dados('resistirMedo'),alvo:'grupo'},{...dados('negociacaoColetiva'),alvo:'grupo'}]);

  V('persuasao','negociacao','Negociação & Submundo',[CAR],'Barganha, suborno e lábia de rua: reduz preços e evita escalada.',
    [permite('barganharESubornar'),permite('evitarEscalada')]);
  V('persuasao','sociedade','Alta Sociedade & Protocolo',[APA,CAR],'+1d20 com autoridades, políticos, empresários e elite.',
    [dados('elite')],{skill:'Etiqueta'});

  V('enganacao','blefe','Blefe & Improviso',[CAR],'Mentiras rápidas e manipulação verbal.',
    [permite('blefar')]);
  V('enganacao','disfarce','Disfarce & Infiltração',[APA,DES],'Muda aparência, postura, sotaque e documentos.',
    [permite('disfarcar')]);

  V('furtividade','urbana','Infiltração Urbana & Sombras',[DES],'Silêncio em prédios, corredores e multidões.',
    [permite('silencioUrbano')]);
  V('furtividade','camuflagem','Camuflagem & Emboscada',[PER,DES],'Oculta-se em vegetação ou escombros e prepara surpresas.',
    [permite('camuflarEEmboscar')]);

  V('resistencia','vigor','Vigor Físico',[CON],'Venenos, toxinas, doenças, dor, sufocamento e fadiga.',
    [permite('resistirFisico')]);
  V('resistencia','firmeza','Firmeza Mental',[PRE],'Medo, terror sobrenatural, controle mental, tortura e Fogo de Supressão.',
    [permite('resistirMental'),permite('resistirSupressao')]);

  V('teosofia','estudo','Estudo Oculto & Sigilos',[INT],'Textos antigos, idiomas mortos, cultos e teoria das anomalias.',
    [permite('estudarOculto')]);
  V('teosofia','canalizacao','Sensibilidade & Canalização',[PRE],'Sente Aura e interferências e canaliza Essência.',
    [permite('sentirAura'),permite('canalizarEssencia')]);

  return out;
})();
