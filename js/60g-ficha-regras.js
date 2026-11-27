/* ==========================================================================
   TULPA RPG — Onda 9 · Ficha: benefícios dos atributos, Blindagem de Lucidez,
   contexto social e Vertentes/Especializações.
   Carrega ANTES de js/61-init.js, depois de js/60e. IIFE: só publica em T3
   (T3.socialTake, T3.renderEspecializacoes). Nenhuma regra mora aqui: todo
   número vem do motor (E.*, js/10) ou de skillCalc3 (js/11).
   ========================================================================== */
(function(){
  'use strict';
  if(window.__fi60g)return;
  window.__fi60g=true;

  var S3=function(a){return a.slice(0,3).toUpperCase()};
  var plus=function(n){return (n>=0?'+':'−')+Math.abs(n)};
  /* algumas fontes de estética desenham ÷ parecido com +: o sinal usa a fonte do sistema */
  var half=function(){return '<span class="vt-div">÷'+E.regra('generalistaDiv')+'</span>'};
  var halfTxt=function(){return '÷'+E.regra('generalistaDiv')};
  var vezes=function(id){var v=E.regra(id);return v===1?'':String(v).replace('.',',')+' × '};
  var me=function(){return{data:data,vocations:vocations,tracks:tracks}};
  /* mesma permissão da ficha: quem abre é o dono ou o Mestre */
  function canSheet(){
    if(!window.tulpaCloudUser)return true;
    var ch=charById(activeCharacterId);
    return !ch||canEdit(ch);
  }

  /* ---------- 1. Benefícios diretos junto aos 8 atributos ---------- */
  function row(label,value,note,tone){
    return '<div class="pv-row"'+(tone?' data-tone="'+tone+'"':'')+'><dt>'+label+(note?'<small>'+note+'</small>':'')+'</dt><dd>'+value+'</dd></div>';
  }
  function shieldBtn(){
    if(!(E.attr(data,'Presença')>0)||E.isCreature(data))return '';
    var ready=!data.lucShieldUsed,pre=E.shieldValue(data);
    return '<button type="button" class="pv-shield" role="switch" data-shield aria-checked="'+ready+'" aria-label="Blindagem de Lucidez disponível nesta cena" '+(canSheet()?'':'disabled')+'>'+
      '<span class="pv-track" aria-hidden="true"><i></i></span><span class="pv-stxt"><b>'+(ready?'Blindagem pronta':'Blindagem usada')+'</b><small>'+
      (ready?'1º dano de Lucidez da cena −'+pre+' (mín. '+E.regra('blindMin')+')':'Volta no fim da cena')+'</small></span></button>';
  }
  var PASSIVE={
    'Força':function(){
      var ci=E.cargaInfo(data,E.hasEffect(data,'Força do Cotidiano'));
      var mel=E.damageBonus(data,{skill:'Armas Brancas',cat:'Corpo a corpo',peso:'Médio'});
      var arr=E.damageBonus(data,{skill:'Arremesso',cat:'Distância',peso:'Leve'});
      return row('Limite de carga',ci.limit,E.regra('cargaBase')+' + '+vezes('cargaPorFor')+'FOR'+(data.inventory&&data.inventory.mochila?' + '+E.regra('cargaMochila')+' da mochila':'')+' · '+ci.carga+' em uso'+(ci.level?' · '+ci.label:''),ci.level?'warn':'')+
        row('Dano corpo a corpo',plus(mel.bonus),'Armas Brancas e Briga')+
        row('Dano de arremesso',plus(arr.bonus),'usa '+S3(arr.attr||'Força'));
    },
    'Destreza':function(){
      var di=E.defenseInfo(data),leve=E.damageBonus(data,{skill:'Armas Brancas',cat:'Corpo a corpo',peso:'Leve'});
      var heavy=E.heavyProtection(data).map(function(i){return esc(i.name)}).join(', ');
      var note=di.dexAllowed?'inclui +'+di.dex+' de DES':di.dexWhy==='protecao-pesada'?'<strong>Proteção pesada ('+heavy+'): DES não soma</strong>':di.dexWhy==='sobrecarga'?'<strong>Excesso de carga: DES não soma</strong>':'sem bônus de DES';
      return row('Defesa total (DF)',di.DF,note,di.dexAllowed?'':'warn')+
        row('Dano com arma leve',plus(leve.bonus),'DES no lugar de FOR se for maior · usa '+S3(leve.attr||'Força'));
    },
    'Constituição':function(){
      var rd=E.blockReduction(data);
      return row('Vital máximo',E.maxStats(data).vt,'já inclui CON')+
        row('Redução no Bloqueio','−'+rd.total,'CON'+(rd.vert?' + '+rd.vert+' da especialização':'')+' · Guarda Fechada +'+E.GUARDA_BONUS)+
        row('Combustão Vital',E.combustionLimit(data)+' ES','limite por turno: '+E.regra('combBase')+' + '+vezes('combPorCon')+'CON');
    },
    'Inteligência':function(){
      return row('Perícias treinadas extras',plus(E.intExtraSkills(data)),'escolhas de +5 por ponto acima de '+E.regra('periciaIntBase'))+
        row('Cura: Sutura e Síntese',plus(E.medicineBonus(data)),'soma na cura');
    },
    'Percepção':function(){
      return row('DT contra furtividade',E.stealthDT(data),E.regra('furtDTBase')+' + '+vezes('furtPorPer')+'PER')+
        row('Lucidez na Trégua',plus(E.restLucBonus(data)),'soma na recuperação');
    },
    'Presença':function(){
      return row('Essência máxima',E.maxStats(data).es,'já inclui PRE')+shieldBtn();
    },
    'Carisma':function(){
      var s=E.socialBonus(data,'Persuasão',{dialogo:true});
      return row('Diálogo contínuo',plus(s.bonus),'acalmar, negociar ou liderar (Persuasão, Liderança) e ancorar aliado na Trégua');
    },
    'Aparência':function(){
      var s=E.socialBonus(data,'Persuasão',{primeira:true});
      return row('Primeira impressão',plus(s.bonus),'só na 1ª rolagem social contra quem acabou de ver você');
    }
  };
  function paintPassives(){
    var cards=document.querySelectorAll('#attributes .attr-card');
    var creature=E.isCreature(data);
    cards.forEach(function(card,i){
      var a=ATTRS[i];if(!a)return;
      var old=card.querySelector('.pv');if(old)old.remove();
      var box=document.createElement('dl');box.className='pv';
      box.innerHTML=creature?row('Criatura','—','sem benefícios de atributo'):PASSIVE[a]();
      var counter=card.querySelector('.counter');
      if(counter){
        counter.after(box);
        var b=counter.querySelectorAll('button');
        if(b[0])b[0].setAttribute('aria-label','Diminuir '+a);
        if(b[1])b[1].setAttribute('aria-label','Aumentar '+a);
      }else card.append(box);
    });
  }
  {var _ra=renderAttributes;renderAttributes=function(){
    _ra.apply(this,arguments);
    try{paintPassives()}catch(e){console.warn('[T9] atributos',e)}
  }}

  /* a blindagem também aparece onde o dano é lançado: Lucidez (visão geral e aba Lucidez) */
  function mountShield(host){
    if(!host)return;
    var old=host.querySelector(':scope>.pv-shield');if(old)old.remove();
    host.insertAdjacentHTML('beforeend',shieldBtn());
  }
  {var _rs=renderStats;renderStats=function(){
    _rs.apply(this,arguments);
    try{
      mountShield(document.querySelector('#stats [data-res-box="lucidity"]'));
      if(document.querySelector('#attributes .pv'))paintPassives();
    }catch(e){console.warn('[T9] blindagem',e)}
  }}
  {var _rm=renderMind;renderMind=function(){
    _rm.apply(this,arguments);
    try{mountShield(document.querySelector('#mindBody>.panel'))}catch(e){console.warn('[T9] blindagem',e)}
  }}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-shield]');
    if(!b||!canSheet())return;
    var host=b.parentElement&&(b.closest('#stats')?'#stats':b.closest('#mindBody')?'#mindBody':'#attributes');
    data.lucShieldUsed=!data.lucShieldUsed;
    save();
    var again=document.querySelector(host+' [data-shield]');if(again)again.focus({preventScroll:true});
    toast(data.lucShieldUsed?'Blindagem de Lucidez marcada como usada nesta cena.':'Blindagem de Lucidez disponível de novo.');
  });

  /* ---------- 2. Contexto social das rolagens da ficha ---------- */
  var social='nenhum',socialFor=null;
  var CTX=[
    ['nenhum','Nenhum',null],
    ['primeira','1ª impressão',{primeira:true}],
    ['dialogo','Diálogo contínuo',{dialogo:true}],
    ['ancorar','Ancorar aliado',{ancorar:true}]
  ];
  function syncSocialOwner(){if(socialFor!==activeCharacterId){socialFor=activeCharacterId;social='nenhum'}}
  /* chamado por rollSkill: devolve o bônus do motor; 1ª impressão e ancorar valem uma rolagem só */
  T3.socialTake=function(skill){
    syncSocialOwner();
    var c=CTX.find(function(x){return x[0]===social});
    if(!c||!c[2])return null;
    var r=E.socialBonus(data,skill,c[2]);
    if(!r.attr)return null;
    if(social!=='dialogo'){social='nenhum';paintSocial()}
    return r;
  };
  function paintSocial(){
    var box=document.getElementById('vtSocial');if(!box)return;
    syncSocialOwner();
    var wrap=box.querySelector('.vt-seg');
    var f=document.activeElement&&wrap.contains(document.activeElement)?document.activeElement.dataset.soc:null;
    wrap.innerHTML=CTX.map(function(c){
      var n=c[2]?E.socialBonus(data,'Persuasão',c[2]):null;
      return '<button type="button" data-soc="'+c[0]+'" aria-pressed="'+(social===c[0])+'">'+c[1]+(n?' <b>'+plus(n.bonus)+' '+S3(n.attr)+'</b>':'')+'</button>';
    }).join('');
    box.querySelector('.vt-note').textContent={
      nenhum:'Nenhum bônus social extra.',
      primeira:'Vale na próxima rolagem social contra quem acabou de ver você. Depois volta para Nenhum.',
      dialogo:'Vale em Persuasão e Liderança enquanto a conversa durar.',
      ancorar:'Vale na próxima rolagem para ancorar um aliado abalado. Depois volta para Nenhum.'
    }[social];
    if(f){var b=wrap.querySelector('[data-soc="'+f+'"]');if(b)b.focus({preventScroll:true})}
  }

  /* ---------- 3. Vertentes / Especializações ---------- */
  var view='gerais',filter='todas',openSet=null,openFor=null;
  var picks={};   /* atributo escolhido por personagem + vertente (só neste aparelho, nesta sessão) */
  var sits={};    /* "a situação se aplica" marcado; desmarca depois de rolar */
  var pickKey=function(id){return (activeCharacterId||'local')+'|'+id};
  var GRADE={0:'Sem treino',5:'Treinado +5',10:'Mestre +10',15:'Maestria +15'};
  var norm=function(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};

  function build(){
    var tab=document.getElementById('tab-skills');
    if(!tab||document.getElementById('vtPanel'))return;
    var bar=document.createElement('div');
    bar.id='vtBar';bar.className='vt-top';
    bar.innerHTML='<div class="vt-seg vt-views" role="group" aria-label="O que mostrar nas perícias">'+
        '<button type="button" data-view="gerais" aria-pressed="true">Perícias gerais</button>'+
        '<button type="button" data-view="esp" aria-pressed="false">Especializações <span id="vtCount" class="vt-count"></span></button>'+
      '</div>'+
      '<div id="vtPendBanner" class="vt-alert" hidden><span></span><button type="button" class="btn small primary" id="vtPendGo">Escolher agora</button></div>';
    var soc=document.createElement('div');
    soc.id='vtSocial';soc.className='panel vt-social';
    soc.innerHTML='<div class="vt-social-row"><span class="field-label" id="vtSocLbl">Contexto social da rolagem</span><div class="vt-seg" role="group" aria-labelledby="vtSocLbl"></div></div><p class="sub vt-note" aria-live="polite"></p>';
    var pan=document.createElement('div');
    pan.id='vtPanel';pan.className='panel';
    pan.innerHTML='<div class="panel-head"><h2>Especializações</h2><span class="pill" id="vtUse"></span></div>'+
      '<p class="sub">Treinar uma perícia já inclui a <b>1ª especialização sem custo extra</b>; cada especialização a mais custa 1 escolha de treinamento. Fora dela você usa o generalista: o grau é dividido (o +V entra inteiro), sem o efeito tático.</p>'+
      '<div class="vt-counters" id="vtCounters"></div>'+
      '<div class="vt-tools"><label class="field vt-search"><span class="field-label">Buscar especialização ou perícia</span><input type="search" class="search" id="vtSearch" autocomplete="off"></label>'+
      '<div class="vt-seg" role="group" aria-label="Filtro de perícias" id="vtFilter"><button type="button" data-filter="todas" aria-pressed="true">Todas</button><button type="button" data-filter="minhas" aria-pressed="false">Treinadas e a escolher</button></div></div>'+
      '<div id="vtList"></div>';
    tab.prepend(bar,soc);
    soc.after(pan);
    tab.dataset.view=view;
    bar.addEventListener('click',function(e){
      var b=e.target.closest('button[data-view]');
      if(b){setView(b.dataset.view);return}
      if(e.target.closest('#vtPendGo')){filter='minhas';var q=document.getElementById('vtSearch');q.value='';setView('esp');renderVerts();var s=document.querySelector('#vtList summary');if(s)s.focus()}
    });
    soc.addEventListener('click',function(e){var b=e.target.closest('[data-soc]');if(b){social=b.dataset.soc;paintSocial()}});
    pan.querySelector('#vtSearch').addEventListener('input',renderVerts);
    pan.querySelector('#vtFilter').addEventListener('click',function(e){var b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;renderVerts()}});
    var list=pan.querySelector('#vtList');
    list.addEventListener('click',onListClick);
    list.addEventListener('change',onListChange);
    /* a busca da lista geral estava presa à versão antiga do desenho das perícias */
    var gs=document.getElementById('skillSearch');if(gs)gs.oninput=function(){renderSkills()};
  }
  function setView(v){
    view=v;
    var tab=document.getElementById('tab-skills');tab.dataset.view=v;
    tab.querySelectorAll('[data-view][aria-pressed]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.view===v))});
    renderBanner();
  }
  function renderBanner(){
    var pend=E.pendingVerts(data),el=document.getElementById('vtPendBanner');if(!el)return;
    el.hidden=!pend.length||view==='esp';
    if(pend.length)el.querySelector('span').textContent=(pend.length===1?'1 treino antigo espera':pend.length+' treinos antigos esperam')+' uma especialização: '+pend.map(function(p){return p.skill+' +'+p.grau}).join(', ')+'. Até lá o bônus continua valendo.';
    var n=E.trainedVerts(data).length,c=document.getElementById('vtCount');
    c.textContent=pend.length?n+' · '+pend.length+' a escolher':String(n);
  }

  function opt(v,l,sel,dis){return '<option value="'+v+'"'+(sel?' selected':'')+(dis?' disabled':'')+'>'+l+'</option>'}

  function vertRow(def,edit){
    var picked=picks[pickKey(def.id)];
    var attr=picked&&def.attrs.indexOf(picked)>=0?picked:undefined;
    var vc=E.vertCalc(data,def.id,{vocList:vocations,attr:attr});
    var c=skillCalc3(me(),def.skill,attr,{vert:def.id});
    var auto=E.vertCalc(data,def.id,{vocList:vocations}).attr;
    var cur=E.vertGrade(data,def.id),pend=!cur&&E.pendingFor(data,def.id);
    var st=vc.status,fk=function(k){return ' data-fk="'+def.id+':'+k+'"'};
    var extra=c.bonus-vc.bonus;
    var calc=st==='bloqueado'?'Sem treino específico não dá para usar.':
      '<b>'+c.n+'d20 '+plus(c.bonus)+'</b><span>'+c.attr+' · '+
      (st==='treinado'?'grau +'+vc.grau:st==='generalista'?'generalista '+half()+': +'+vc.grau:st==='pendente'?'treino antigo +'+vc.grau:'sem treino')+
      (vc.voc?' · vocação +V '+vc.voc:'')+(extra?' · estados e talentos '+plus(extra):'')+(c.dis?' · desvantagem':'')+'</span>';
    var attrCtl=def.attrs.length>1?
      '<label class="field vt-f"><span class="field-label">Atributo</span><select data-attrpick="'+def.id+'"'+fk('attr')+'>'+def.attrs.map(function(a){return opt(a,S3(a)+' · '+E.attr(data,a)+(a===auto?' (auto)':''),a===vc.attr)}).join('')+'</select></label>':
      '<div class="vt-f vt-fixed"><span class="field-label">Atributo</span><b>'+S3(def.attrs[0])+' · '+E.attr(data,def.attrs[0])+'</b></div>';
    var gradeCtl,why='';
    if(pend){
      gradeCtl='<button type="button" class="btn vt-take" data-take="'+def.id+'"'+fk('take')+(edit?'':' disabled')+'>Receber +'+pend.grau+' do treino antigo</button>';
    }else{
      var opts=[0].concat(E.GRAUS).map(function(g){
        var ok=g===0||g===cur||E.checkVertGrade(data,def.id,g).ok;
        return opt(g,GRADE[g],g===cur,!ok);
      }).join('');
      if(!cur){var ch5=E.checkVertGrade(data,def.id,5);if(!ch5.ok)why=ch5.msg}
      gradeCtl='<label class="field vt-f"><span class="field-label">Treino</span><select data-grade="'+def.id+'"'+fk('grade')+(edit?'':' disabled')+'>'+opts+'</select></label>';
    }
    var rollTxt=st==='bloqueado'?'Bloqueada':st==='generalista'?'Rolar '+halfTxt():'Rolar';
    var rollHtml='<span>'+rollTxt.replace(halfTxt(),half())+'</span>';
    var sit=E.situations(data,def.id),gr=E.grant(data,def.id);
    var sitHtml=sit.dice?'<label class="t3-check vt-sit"><input type="checkbox" data-sit="'+def.id+'"'+fk('sit')+(sits[pickKey(def.id)]?' checked':'')+(edit?'':' disabled')+'> <span>Na próxima rolagem: +'+sit.dice+'d20 ('+esc(sit.labels.join(', '))+')</span></label>':'';
    var grHtml=gr?'<button type="button" class="btn vt-grant" data-grant="'+def.id+'"'+fk('grant')+(!edit||(gr.cena&&gr.used)?' disabled':'')+'>'+(gr.cena&&gr.used?'Já usada nesta cena':'Conceder +'+gr.dice+'d20 '+(gr.grupo?'ao grupo':'a um aliado'))+'</button>':'';
    return '<article class="vt-row" data-st="'+st+'">'+
      '<div class="vt-info">'+
        '<h4>'+esc(def.name)+(cur?' <span class="t3-tier t'+cur+'">'+(cur===5?'+5':GRADE[cur])+'</span>':'')+(def.requiresTraining?' <span class="vt-badge vt-req">Exige treino</span>':'')+'</h4>'+
        '<p class="vt-fx"><span class="vt-badge'+(vc.efeitoAtivo?' on':'')+'">'+(vc.efeitoAtivo?'✓ Efeito tático ativo':'Efeito só treinando')+'</span> '+esc(def.desc)+'</p>'+
        '<p class="vt-calc">'+calc+'</p>'+
        (why?'<p class="vt-why">'+esc(why)+'</p>':'')+
        sitHtml+
      '</div>'+
      '<div class="vt-ctl">'+attrCtl+gradeCtl+
        '<button type="button" class="btn primary vt-roll" data-vroll="'+def.id+'"'+fk('roll')+(st==='bloqueado'||!edit?' disabled':'')+' aria-label="'+esc(rollTxt+' '+def.name+(st==='bloqueado'?'':', '+c.n+'d20 '+plus(c.bonus)))+'">'+rollHtml+'</button>'+grHtml+
      '</div></article>';
  }

  function genBar(p,edit){
    var picked=picks[pickKey('g:'+p.id)],std=SKILL_ATTR[p.skills[0]],attr=picked||std;
    var g=E.generalistCalc(data,p.id,{vocList:vocations,attr:attr});
    if(!g)return '';
    var c=skillCalc3(me(),p.skills[0],attr,{generalista:p.id});
    return '<div class="vt-gen"><div class="vt-info"><h4>Outra área de '+esc(p.name)+'</h4><p class="vt-calc"><b>'+c.n+'d20 '+plus(c.bonus)+'</b><span>'+
      (g.status==='pendente'?'treino antigo +'+g.grau:'generalista '+half()+': +'+g.grau+' (de +'+g.melhor+')')+(g.voc?' · vocação +V '+g.voc:'')+' · sem efeito tático; não cobre o que exige treino</span></p></div>'+
      '<div class="vt-ctl"><label class="field vt-f"><span class="field-label">Atributo adequado</span><select data-attrpick="g:'+p.id+'" data-fk="g:'+p.id+':attr">'+ATTRS.map(function(a){return opt(a,S3(a)+' · '+E.attr(data,a)+(a===std?' (padrão)':''),a===attr)}).join('')+'</select></label>'+
      '<button type="button" class="btn primary vt-roll" data-groll="'+p.id+'" data-fk="g:'+p.id+':roll"'+(edit?'':' disabled')+'><span>Rolar generalista '+half()+'</span></button></div></div>';
  }

  function renderVerts(){
    var list=document.getElementById('vtList');if(!list)return;
    var act=document.activeElement,fk=act&&list.contains(act)?act.dataset.fk:null,fp=act&&list.contains(act)&&act.closest('details')?act.closest('details').dataset.p:null;
    var edit=canSheet(),q=norm(document.getElementById('vtSearch').value.trim());
    var L=E.limitsFor(data),U=E.tierUsage(data),free=!!data.freeMode;
    document.getElementById('vtUse').textContent=free?'Modo Livre · '+U.five+' escolhas usadas':U.five+' / '+L.five+' escolhas de treino';
    document.getElementById('vtCounters').innerHTML=[['Mestre +10',U.ten,L.ten,10],['Maestria +15',U.fifteen,L.fifteen,15]].map(function(x){return '<span class="pill"><span class="t3-tier t'+x[3]+'">'+x[0]+'</span> '+x[1]+' / '+(free?'∞':x[2])+'</span>'}).join('')+
      (L.intExtra&&!free?'<span class="pill">+'+L.intExtra+' escolhas por Inteligência</span>':'');
    document.querySelectorAll('#vtFilter [data-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.filter===filter))});
    if(openSet===null||openFor!==activeCharacterId){
      openFor=activeCharacterId;
      openSet=new Set(E.trainedVerts(data).map(function(x){return x.def.pericia}));
    }
    var group='',html='';
    E.periciaDefs().forEach(function(p){
      var all=E.vertsOf(p.id),mine=E.trainedVerts(data,p.id),pend=E.pendingVerts(data).filter(function(x){return x.pericia===p.id});
      if(filter==='minhas'&&!mine.length&&!pend.length)return;
      var hitP=!q||norm(p.name+' '+p.skills.join(' ')).indexOf(q)>=0;
      var defs=hitP?all:all.filter(function(v){return norm(v.name+' '+v.desc).indexOf(q)>=0});
      if(!defs.length)return;
      if(p.grupo!==group){group=p.grupo;html+='<h3 class="vt-group">'+esc(group)+'</h3>'}
      var chips=mine.map(function(x){return '<span class="vt-chip on">'+esc(x.def.name.split(/ [\/&] /)[0])+' +'+x.grau+'</span>'}).join('')+
        pend.map(function(x){return '<span class="vt-chip warn">'+esc(x.skill)+' +'+x.grau+' a escolher</span>'}).join('')||
        '<span class="vt-chip">'+all.length+(all.length===1?' especialização':' especializações')+'</span>';
      var isOpen=!!q||openSet.has(p.id);
      var cost=free?'Modo Livre: sem limite de escolhas.':pend.length?'O treino antigo vira a 1ª especialização sem custo.':mine.length?'Cada especialização a mais custa 1 escolha de treinamento.':'Treinar '+p.name+' usa 1 escolha e já inclui a 1ª especialização.';
      html+='<details class="vt-p" data-p="'+p.id+'"'+(isOpen?' open':'')+'><summary><span class="vt-name">'+esc(p.name)+'</span><span class="vt-chips">'+chips+'</span></summary><div class="vt-body">'+
        (pend.length?'<p class="vt-alert">Treino antigo em '+pend.map(function(x){return '<b>'+esc(x.skill)+' +'+x.grau+'</b>'}).join(' e ')+': escolha qual especialização recebe, sem custo. Enquanto isso o bônus continua valendo.</p>':'')+
        '<p class="sub vt-cost">'+esc(cost)+'</p>'+defs.map(function(v){return vertRow(v,edit)}).join('')+genBar(p,edit)+'</div></details>';
    });
    list.innerHTML=html||'<div class="empty">'+(q?'Nada encontrado para a busca. Apague o texto para ver tudo.':'Nenhuma especialização ainda. Escolha o filtro Todas para treinar a primeira.')+'</div>';
    list.querySelectorAll('summary').forEach(function(s){s.addEventListener('click',function(){var d=s.parentElement;setTimeout(function(){if(d.open)openSet.add(d.dataset.p);else openSet.delete(d.dataset.p)},0)})});
    renderBanner();
    if(fk){
      var back=list.querySelector('[data-fk="'+fk+'"]:not([disabled])')||list.querySelector('[data-fk="'+fk.replace(/:take$/,':grade')+'"]')||list.querySelector('details[data-p="'+fp+'"]>summary');
      if(back)back.focus({preventScroll:true});
    }
  }

  function onListClick(e){
    var t=e.target.closest('button[data-take],button[data-vroll],button[data-groll],button[data-grant]');
    if(!t||t.disabled||!canSheet())return;
    if(t.dataset.grant){T3.vertGrant&&T3.vertGrant(t.dataset.grant);return}
    if(t.dataset.take){
      var r=E.trainVert(data,t.dataset.take);
      if(!r.ok){toast(r.msg);return}
      openSet.add(E.vert(t.dataset.take).pericia);save();toast(r.msg||'Especialização treinada.');return;
    }
    if(t.dataset.vroll){
      var id=t.dataset.vroll,def=E.vert(id),attr=picks[pickKey(id)];
      var vc=E.vertCalc(data,id,{vocList:vocations,attr:def.attrs.indexOf(attr)>=0?attr:undefined});
      var sit=E.situations(data,id),extra=sits[pickKey(id)]?sit.dice:0;delete sits[pickKey(id)];
      rollSkill(vc.skill,vc.attr,{vert:id,extraDice:extra,label:vc.skill+' · '+def.name+(vc.status==='generalista'?' (generalista '+halfTxt()+')':'')});return;
    }
    var p=E.pericia(t.dataset.groll),a=picks[pickKey('g:'+p.id)]||SKILL_ATTR[p.skills[0]];
    rollSkill(p.skills[0],a,{generalista:p.id,label:p.skills[0]+' · generalista '+halfTxt()});
  }
  function onListChange(e){
    var t=e.target;
    if(t.dataset.attrpick){picks[pickKey(t.dataset.attrpick)]=t.value;renderVerts();return}
    if(t.dataset.sit){sits[pickKey(t.dataset.sit)]=t.checked;return}
    if(!t.dataset.grade||!canSheet())return;
    var id=t.dataset.grade,def=E.vert(id),g=Number(t.value),from=data.vertentes&&data.vertentes[id]&&data.vertentes[id].de;
    var r=E.setVertGrade(data,id,g);
    if(!r.ok){toast(r.msg);renderVerts();return}
    openSet.add(def.pericia);
    save();
    toast(g?def.name+': '+GRADE[g]+'.':def.name+' removida.'+(from?' O treino antigo voltou a ficar a escolher.':''));
  }

  function renderAll(){
    build();
    if(!document.getElementById('vtPanel'))return;
    paintSocial();renderVerts();
  }
  T3.renderEspecializacoes=renderAll;
  {var _sk=renderSkills;renderSkills=function(){
    _sk.apply(this,arguments);
    try{renderAll()}catch(e){console.warn('[T9] especializações',e)}
  }}
})();
