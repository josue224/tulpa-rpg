/* ==========================================================================
   TULPA RPG — Onda 3 (Bancada) · Guia da Campanha (Apoio do Mestre)
   Terceira visão da aba Bancada & Investigação, EXCLUSIVA do Mestre:
   (1) Pinboard Executivo (premissa, segredos, pistas obrigatórias com a Regra
       das 3 Pistas, fraquezas, lembretes; etiquetas de prioridade);
   (2) Relógios de Ameaça & Tensão (4/6/8 fatias);
   (3) Checklist rápido de sessão + anotações;
   (4) Fluxograma de Campanha (motor T3.quadroEngine, sem copiar código);
   (5) Revelação Seletiva: copia SÓ os campos públicos para a Bancada
       compartilhada (T3.bancada.deliver) ou para o Quadro de Pesquisa.

   PRIVACIDADE (regra de ouro): o Guia nunca vai para chave pública.
   - Registro `guia` (kind `guia`) no campaign_store com audience = [uid do
     Mestre]. A RLS de tulpa-mesa.sql só deixa ler quem é Mestre ou está no
     audience, e só o Mestre grava. Sem SQL novo.
   - Backend 'items' (campaign_items, sem o campaign_store/RLS): NÃO grava na
     nuvem; fica só no localStorage deste aparelho (aviso na tela).
   - Espelho local `tulpa_guia_<campanha>_<uid>` sempre (fallback se a gravação
     falhar). Jogador: o módulo não monta botão, DOM nem lê o dado.
   Carrega ANTES de js/61-init.js. IIFE: não cria nomes globais.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__guia60t)return;
  window.__guia60t=true;

  /* ---------- utilitários ---------- */
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function say(m){try{toast(m)}catch(e){console.log(m)}}
  function C(){try{return camp3()}catch(e){return null}}
  function cid(){var c=C();return c&&c.id||null}
  function me(){try{return uid3()||'local'}catch(e){return 'local'}}
  function gm(){try{return !!isGM6()}catch(e){return false}}
  function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
  function rid(p){return (p||'g')+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function arr(a){return Array.isArray(a)?a:[]}
  function clone(o){return o==null?o:JSON.parse(JSON.stringify(o))}
  function lsKey(){return 'tulpa_guia_'+cid()+'_'+me()}
  function uiKey(){return 'tulpa_guia_ui_'+cid()+'_'+me()}
  function detect(){try{return Promise.resolve(stDetect6()).catch(function(){return ''})}catch(e){return Promise.resolve('')}}
  function ic(p,cls){return '<svg viewBox="0 0 24 24" class="gm-ic'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false">'+p+'</svg>'}
  function when(t){try{return new Date(t).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}catch(e){return ''}}

  var IC={
    lock:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/>',
    pin:'<path d="M9 3h6l-1 6 3 3H7l3-3z"/><path d="M12 12v9"/>',
    up:'<path d="M6 15l6-6 6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',
    trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
    eye:'<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
    reset:'<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 101.6-7.3L4 10"/>',
    check:'<path d="M5 12l4 4 10-10"/>',
    book:'<path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M9 8h5"/>',
    search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    shield:'<path d="M12 3l8 4v5c0 4-3.5 7.5-8 9-4.5-1.5-8-5-8-9V7z"/><path d="M12 8v5M12 16v1"/>',
    flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
    bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    turn:'<path d="M5 18c0-6 4-10 12-10M13 4l4 4-4 4"/>',
    hook:'<path d="M12 3v10a4 4 0 11-4-4"/>',
    person:'<circle cx="12" cy="10" r="3"/><path d="M6 19c0-3 2.7-5 6-5s6 2 6 5"/>',
    note:'<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>'
  };

  /* ---------- catálogos ---------- */
  var CATS=[
    {id:'premissa',label:'Premissa & Tom da Campanha',short:'Premissa',svg:IC.book},
    {id:'segredo', label:'Segredos Centrais',        short:'Segredo',  svg:IC.lock},
    {id:'pista',   label:'Pistas Obrigatórias',      short:'Pista',    svg:IC.search},
    {id:'fraqueza',label:'Fraquezas de Criaturas e Antagonistas',short:'Fraqueza',svg:IC.shield},
    {id:'lembrete',label:'Lembretes Críticos',       short:'Lembrete', svg:IC.flag}
  ];
  var PRIOS=[
    {id:'crit',label:'Crítico',svg:IC.flag},
    {id:'gat', label:'Gatilho de Cena',svg:IC.bolt},
    {id:'seg', label:'Segredo',svg:IC.lock},
    {id:'npc', label:'NPC Chave',svg:IC.person}
  ];
  var COLORS=[
    {id:'verm',label:'Vermelho',hex:'#d64545'},{id:'amb',label:'Âmbar',hex:'#d9a21b'},
    {id:'azul',label:'Azul',hex:'#3b82c4'},{id:'verd',label:'Verde',hex:'#3fa66b'},{id:'viol',label:'Violeta',hex:'#8b5cc8'}
  ];
  var STATUS=[{id:'p',label:'Pendente'},{id:'j',label:'Em jogo'},{id:'c',label:'Concluída'}];
  function byId(list,id,def){for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return def||list[0]}

  /* ---------- modelo ---------- */
  function nCard(c){
    if(!c||typeof c!=='object')return null;
    var prio=[];arr(c.prio).forEach(function(p){if(byId(PRIOS,p,null)&&prio.indexOf(p)<0)prio.push(p)});
    var paths=arr(c.paths).slice(0,3).map(function(x){return String(x||'').slice(0,200)});while(paths.length<3)paths.push('');
    return{id:String(c.id||rid('c')).slice(0,40),cat:byId(CATS,c.cat).id,title:String(c.title||'').slice(0,120),text:String(c.text||'').slice(0,1200),
      secret:String(c.secret||'').slice(0,1500),prio:prio,pinned:!!c.pinned,col:!!c.col,paths:paths,revealed:Number(c.revealed)||0};
  }
  function nClock(k){
    if(!k||typeof k!=='object')return null;
    var n=[4,6,8].indexOf(Number(k.n))>=0?Number(k.n):6,v=Math.max(0,Math.min(n,Math.round(Number(k.v)||0)));
    return{id:String(k.id||rid('k')).slice(0,40),name:String(k.name||'').slice(0,60),color:byId(COLORS,k.color).id,n:n,v:v,when:String(k.when||'').slice(0,200)};
  }
  function nItem(i){
    if(!i||typeof i!=='object')return null;
    return{id:String(i.id||rid('i')).slice(0,40),text:String(i.text||'').slice(0,300),done:!!i.done,revealed:Number(i.revealed)||0};
  }
  function normDoc(v){
    v=v&&typeof v==='object'?v:{};
    var f=v.flow&&typeof v.flow==='object'?v.flow:{};
    return{v:1,rev:Number(v.rev)||0,
      cards:arr(v.cards).map(nCard).filter(Boolean).slice(0,200),
      clocks:arr(v.clocks).map(nClock).filter(Boolean).slice(0,40),
      check:arr(v.check).map(nItem).filter(Boolean).slice(0,200),
      notes:String(v.notes||'').slice(0,4000),
      flow:{v:1,nodes:f.nodes&&typeof f.nodes==='object'?f.nodes:{},conns:f.conns&&typeof f.conns==='object'?f.conns:{},del:f.del&&typeof f.del==='object'?f.del:{}}};
  }

  /* ---------- estado e persistência (privada) ---------- */
  var G=null;
  var ST={camp:null,p:null,backend:'',mode:'',saving:0,t:0,host:null,ui:null,fp:'',fc:'',flow:null,flowCb:null,flowCamp:null,dlg:null,built:null};
  function reset(){
    clearTimeout(ST.t);
    if(ST.flow){try{ST.flow.destroy()}catch(e){}}
    G=null;ST.p=null;ST.flow=null;ST.flowCb=null;ST.flowCamp=null;ST.mode='';ST.backend='';ST.built=null;ST.ui=null;ST.fp='';ST.fc='';closeDlg(true);
  }
  function canRemote(){var b=ST.backend;return gm()&&((b==='store'&&me()!=='local')||b==='local')}
  function uiGet(){if(!ST.ui)ST.ui=lsG(uiKey(),null)||{};return ST.ui}
  function uiSet(k,v){uiGet()[k]=v;lsS(uiKey(),ST.ui)}
  function load(){
    var c=cid();
    if(ST.camp!==c){reset();ST.camp=c}
    if(ST.p)return ST.p;
    var loc=normDoc(lsG(lsKey(),null));
    ST.p=detect().then(function(b){
      ST.backend=b;
      if(canRemote())return stGet6('guia').catch(function(e){console.warn('[guia] ler',e);return null});
      return null;
    }).then(function(remote){
      var r=remote?normDoc(remote):null;
      G=(r&&r.rev>=loc.rev)?r:loc;
      ST.mode=canRemote()?'priv':'local';
      return G;
    }).catch(function(e){console.warn('[guia] carregar',e);G=loc;ST.mode='local';return G});
    return ST.p;
  }
  function setStat(t){var e=ST.host&&ST.host.querySelector('#gmStat');if(e)e.textContent=t}
  function statText(){
    if(ST.mode==='priv')return 'Salvo na nuvem, visível só para você (Mestre).';
    if(ST.backend==='items')return 'Salvo só neste aparelho: o banco privado do Guia não está disponível nesta campanha.';
    return 'Salvo só neste aparelho.';
  }
  function touch(){
    if(!G)return;
    G.rev=Date.now();clearTimeout(ST.t);setStat('Salvando…');
    ST.t=setTimeout(flush,500);
  }
  function flush(){
    clearTimeout(ST.t);
    if(!G||!gm())return Promise.resolve();
    var snap=clone(G);
    lsS(lsKey(),snap); /* espelho local: fallback se a nuvem falhar */
    if(!canRemote()){setStat(statText());return Promise.resolve()}
    ST.saving++;
    /* audience SEMPRE [uid do Mestre]: nunca nulo (nulo = público para a campanha) */
    var aud=ST.backend==='store'?[me()]:null;
    return stPut6('guia','guia',snap,aud).then(function(){ST.mode='priv';setStat(statText())}).catch(function(e){
      console.warn('[guia] salvar',e);ST.mode='local';setStat('Não consegui salvar na nuvem. Salvo neste aparelho; tentando de novo ao editar.');
    }).then(function(){ST.saving--});
  }
  window.addEventListener('beforeunload',function(){try{if(ST.t&&G)flush()}catch(e){}});

  /* ---------- cálculos ---------- */
  function covOf(c){return c.paths.filter(function(p){return p.trim()}).length}
  function sortedCards(){
    var l=G.cards.filter(function(c){return(!ST.fp||c.prio.indexOf(ST.fp)>=0)&&(!ST.fc||c.cat===ST.fc)});
    return l.filter(function(c){return c.pinned}).concat(l.filter(function(c){return !c.pinned}));
  }
  function cardById(id){for(var i=0;i<G.cards.length;i++)if(G.cards[i].id===id)return G.cards[i];return null}
  function clockById(id){for(var i=0;i<G.clocks.length;i++)if(G.clocks[i].id===id)return G.clocks[i];return null}
  function itemById(id){for(var i=0;i<G.check.length;i++)if(G.check[i].id===id)return G.check[i];return null}
  function moveIn(list,id,dir,sameKey){
    var i=-1;list.forEach(function(x,k){if(x.id===id)i=k});if(i<0)return false;
    var j=i+dir;
    while(j>=0&&j<list.length&&sameKey&&sameKey(list[j])!==sameKey(list[i]))j+=dir;
    if(j<0||j>=list.length)return false;
    var t=list[i];list[i]=list[j];list[j]=t;return true;
  }

  /* ---------- esqueleto e renderização ---------- */
  function secHtml(id,title,body,extra){
    var open=uiGet()['s_'+id]!==false;
    return '<section class="gm-sec" data-sec="'+id+'" aria-labelledby="gmH_'+id+'">'+
      '<header class="gm-sh"><h2 id="gmH_'+id+'">'+E(title)+'</h2>'+(extra||'')+
      '<button type="button" class="gm-ib" data-g="sec" data-sec="'+id+'" aria-expanded="'+(open?'true':'false')+'" aria-controls="gmB_'+id+'" aria-label="'+(open?'Recolher':'Abrir')+' a seção '+E(title)+'">'+ic(open?IC.up:IC.down)+'</button></header>'+
      '<div class="gm-sb" id="gmB_'+id+'"'+(open?'':' hidden')+'>'+body+'</div></section>';
  }
  function skeleton(){
    return '<div class="gm" id="gmRoot">'+
      '<div class="gm-top"><p class="gm-priv">'+ic(IC.lock)+'<span>Só o Mestre vê este guia. Os jogadores só recebem o que você usar em "Revelar para os Jogadores".</span></p><p class="gm-stat" id="gmStat" role="status" aria-live="polite"></p></div>'+
      secHtml('pin','Pinboard Executivo','<div id="gmPin"></div>')+
      secHtml('clk','Relógios de Ameaça & Tensão','<div id="gmClk"></div>')+
      secHtml('chk','Checklist da Sessão','<div id="gmChk"></div>')+
      secHtml('flow','Fluxograma de Campanha','<p class="gm-help">Nós: Ato, Cena de Investigação, Encontro, Ponto de Virada, Segredo Oculto, Gancho e NPC/Facção. Abra um nó (botão "Detalhes") para texto público, notas secretas, status e revelar. Use "Modelos" para começar.</p><div class="gm-flow" id="gmFlow"></div>')+
    '</div>';
  }

  /* --- Pinboard --- */
  function cardHtml(c,idx,list){
    var cat=byId(CATS,c.cat),isP=c.cat==='pista',cov=covOf(c),sameP=list.filter(function(x){return x.pinned===c.pinned});
    var pos=sameP.indexOf(c);
    var h='<article class="gm-card'+(c.pinned?' pinned':'')+'" data-id="'+E(c.id)+'" data-cat="'+c.cat+'" aria-label="Card: '+E(c.title||'sem título')+'">'+
      '<header class="gm-ch"><span class="gm-cat">'+ic(cat.svg)+'<span>'+E(cat.short)+'</span></span>'+
      '<div class="gm-ca" role="group" aria-label="Ações do card">'+
        '<button type="button" class="gm-ib" data-g="cpin" data-id="'+E(c.id)+'" aria-pressed="'+(c.pinned?'true':'false')+'" aria-label="'+(c.pinned?'Desafixar':'Fixar no topo')+' o card" title="'+(c.pinned?'Desafixar':'Fixar no topo')+'">'+ic(IC.pin)+'</button>'+
        '<button type="button" class="gm-ib" data-g="cup" data-id="'+E(c.id)+'" aria-label="Mover o card para cima"'+(pos<=0?' disabled':'')+'>'+ic(IC.up)+'</button>'+
        '<button type="button" class="gm-ib" data-g="cdn" data-id="'+E(c.id)+'" aria-label="Mover o card para baixo"'+(pos>=sameP.length-1?' disabled':'')+'>'+ic(IC.down)+'</button>'+
        '<button type="button" class="gm-ib" data-g="ccol" data-id="'+E(c.id)+'" aria-expanded="'+(c.col?'false':'true')+'" aria-label="'+(c.col?'Expandir':'Recolher')+' o card" title="'+(c.col?'Expandir':'Recolher')+'">'+ic(c.col?IC.plus:IC.minus)+'</button>'+
        '<button type="button" class="gm-ib" data-g="cdel" data-id="'+E(c.id)+'" aria-label="Excluir o card">'+ic(IC.trash)+'</button>'+
      '</div></header>'+
      '<div class="gm-pr">'+PRIOS.map(function(p){var on=c.prio.indexOf(p.id)>=0;
        return '<button type="button" class="gm-tag'+(on?' on':'')+'" data-g="cprio" data-id="'+E(c.id)+'" data-p="'+p.id+'" aria-pressed="'+(on?'true':'false')+'">'+ic(p.svg)+'<span>'+E(p.label)+'</span></button>'}).join('')+'</div>'+
      '<label class="gm-lab" for="gmT_'+E(c.id)+'">Título</label>'+
      '<input type="text" class="gm-in" id="gmT_'+E(c.id)+'" maxlength="120" value="'+E(c.title)+'" data-t="c" data-k="title" data-id="'+E(c.id)+'" autocomplete="off">';
    if(!c.col){
      h+='<label class="gm-lab" for="gmX_'+E(c.id)+'">Texto público (o que pode ser revelado)</label>'+
        '<textarea class="gm-in" id="gmX_'+E(c.id)+'" rows="3" maxlength="1200" data-t="c" data-k="text" data-id="'+E(c.id)+'">'+E(c.text)+'</textarea>'+
        '<label class="gm-lab gm-lab-s" for="gmS_'+E(c.id)+'">'+ic(IC.lock)+'<span>Notas secretas (só você; nunca são reveladas)</span></label>'+
        '<textarea class="gm-in gm-secret" id="gmS_'+E(c.id)+'" rows="3" maxlength="1500" data-t="c" data-k="secret" data-id="'+E(c.id)+'">'+E(c.secret)+'</textarea>';
      if(isP){
        h+='<fieldset class="gm-paths"><legend>Regra das 3 Pistas: três caminhos de descoberta (só você vê)</legend>';
        for(var i=0;i<3;i++)h+='<label class="gm-lab" for="gmP'+i+'_'+E(c.id)+'">Caminho '+(i+1)+'</label><input type="text" class="gm-in" id="gmP'+i+'_'+E(c.id)+'" maxlength="200" value="'+E(c.paths[i])+'" data-t="c" data-k="path" data-i="'+i+'" data-id="'+E(c.id)+'" autocomplete="off" placeholder="Como os jogadores podem descobrir isto?">';
        h+='<p class="gm-cov'+(cov>=3?' ok':' warn')+'" data-cov="'+E(c.id)+'">'+covText(cov)+'</p></fieldset>';
      }
    }
    h+='<footer class="gm-cf"><button type="button" class="btn small gm-rev" data-g="crev" data-id="'+E(c.id)+'">'+ic(IC.eye)+'<span>Revelar para os Jogadores</span></button>'+
      (c.revealed?'<span class="gm-pill">Revelado em '+E(when(c.revealed))+'</span>':'')+'</footer></article>';
    return h;
  }
  function covText(n){return n>=3?'Cobertura completa: 3 de 3 caminhos.':'Cobertura incompleta: '+n+' de 3 caminhos. Faltam '+(3-n)+'.'}
  function renderPin(){
    var host=ST.host&&ST.host.querySelector('#gmPin');if(!host||!G)return;
    var list=sortedCards(),pistas=G.cards.filter(function(c){return c.cat==='pista'}),ok=pistas.filter(function(c){return covOf(c)>=3}).length;
    var h='<div class="gm-bar">'+
      '<div class="gm-fld"><label class="gm-lab" for="gmNewCat">Nova categoria de card</label><select class="gm-in" id="gmNewCat">'+CATS.map(function(c){return '<option value="'+c.id+'">'+E(c.label)+'</option>'}).join('')+'</select></div>'+
      '<button type="button" class="btn small primary" data-g="cadd">'+ic(IC.plus)+'<span>Adicionar card</span></button></div>'+
      '<div class="gm-bar gm-filt" role="group" aria-label="Filtrar cards">'+
        '<button type="button" class="gm-tag'+(!ST.fp?' on':'')+'" data-g="cfilt" data-p="" aria-pressed="'+(!ST.fp?'true':'false')+'"><span>Todas as etiquetas</span></button>'+
        PRIOS.map(function(p){return '<button type="button" class="gm-tag'+(ST.fp===p.id?' on':'')+'" data-g="cfilt" data-p="'+p.id+'" aria-pressed="'+(ST.fp===p.id?'true':'false')+'">'+ic(p.svg)+'<span>'+E(p.label)+'</span></button>'}).join('')+
        '<div class="gm-fld"><label class="gm-lab" for="gmFc">Categoria</label><select class="gm-in" id="gmFc"><option value="">Todas</option>'+CATS.map(function(c){return '<option value="'+c.id+'"'+(ST.fc===c.id?' selected':'')+'>'+E(c.label)+'</option>'}).join('')+'</select></div>'+
      '</div>'+
      '<p class="gm-help" aria-live="polite">'+(pistas.length?'Regra das 3 Pistas: '+ok+' de '+pistas.length+(pistas.length===1?' pista obrigatória coberta':' pistas obrigatórias cobertas')+' (3 caminhos cada).':'Regra das 3 Pistas: crie cards de "Pistas Obrigatórias" e preencha 3 caminhos de descoberta para cada.')+' Mostrando '+list.length+' de '+G.cards.length+' cards.</p>';
    h+=list.length?'<div class="gm-grid">'+list.map(function(c,i){return cardHtml(c,i,list)}).join('')+'</div>'
      :'<p class="gm-empty">'+(G.cards.length?'Nenhum card com esse filtro.':'Nenhum card ainda. Escolha uma categoria e use "Adicionar card" para fixar premissa, segredos, pistas, fraquezas e lembretes.')+'</p>';
    host.innerHTML=h;
  }

  /* --- Relógios --- */
  function clockSvg(k){
    var col=byId(COLORS,k.color).hex,n=k.n,h='<svg viewBox="0 0 100 100" class="gm-clk-svg" role="img" aria-label="'+E((k.name||'Relógio')+': '+k.v+' de '+n+' fatias')+'">';
    for(var i=0;i<n;i++){
      var a0=(-90+i*360/n)*Math.PI/180,a1=(-90+(i+1)*360/n)*Math.PI/180,r=44,x0=50+r*Math.cos(a0),y0=50+r*Math.sin(a0),x1=50+r*Math.cos(a1),y1=50+r*Math.sin(a1);
      h+='<path class="gm-seg'+(i<k.v?' on':'')+'" data-g="kseg" data-id="'+E(k.id)+'" data-i="'+i+'" d="M50 50 L'+x0.toFixed(2)+' '+y0.toFixed(2)+' A'+r+' '+r+' 0 0 1 '+x1.toFixed(2)+' '+y1.toFixed(2)+' Z"'+(i<k.v?' style="fill:'+col+'"':'')+'/>';
    }
    return h+'<text x="50" y="55" class="gm-clk-n" text-anchor="middle">'+k.v+'/'+n+'</text></svg>';
  }
  function renderClocks(){
    var host=ST.host&&ST.host.querySelector('#gmClk');if(!host||!G)return;
    var h='<div class="gm-bar"><div class="gm-fld"><label class="gm-lab" for="gmNewN">Fatias do novo relógio</label><select class="gm-in" id="gmNewN"><option value="4">4 fatias</option><option value="6" selected>6 fatias</option><option value="8">8 fatias</option></select></div>'+
      '<button type="button" class="btn small primary" data-g="kadd">'+ic(IC.plus)+'<span>Novo relógio</span></button></div>';
    h+=G.clocks.length?'<div class="gm-grid gm-clks">'+G.clocks.map(function(k){
      var full=k.v>=k.n;
      return '<article class="gm-clk'+(full?' full':'')+'" data-id="'+E(k.id)+'" aria-label="Relógio: '+E(k.name||'sem nome')+'">'+
        '<div class="gm-clk-t">'+clockSvg(k)+'<div class="gm-clk-c">'+
          '<label class="gm-lab" for="gmKN_'+E(k.id)+'">Nome</label><input type="text" class="gm-in" id="gmKN_'+E(k.id)+'" maxlength="60" value="'+E(k.name)+'" data-t="k" data-k="name" data-id="'+E(k.id)+'" autocomplete="off">'+
          '<div class="gm-clk-b" role="group" aria-label="Avançar ou recuar">'+
            '<button type="button" class="gm-ib" data-g="kmin" data-id="'+E(k.id)+'" aria-label="Recuar uma fatia"'+(k.v<=0?' disabled':'')+'>'+ic(IC.minus)+'</button>'+
            '<span class="gm-clk-v" aria-live="polite">'+k.v+' de '+k.n+(full?' · Completo':'')+'</span>'+
            '<button type="button" class="gm-ib" data-g="kplus" data-id="'+E(k.id)+'" aria-label="Avançar uma fatia"'+(full?' disabled':'')+'>'+ic(IC.plus)+'</button>'+
            '<button type="button" class="gm-ib" data-g="kreset" data-id="'+E(k.id)+'" aria-label="Resetar o relógio" title="Resetar">'+ic(IC.reset)+'</button>'+
            '<button type="button" class="gm-ib" data-g="kdel" data-id="'+E(k.id)+'" aria-label="Excluir o relógio">'+ic(IC.trash)+'</button>'+
          '</div></div></div>'+
        '<div class="gm-row"><div class="gm-fld"><label class="gm-lab" for="gmKS_'+E(k.id)+'">Fatias</label><select class="gm-in" id="gmKS_'+E(k.id)+'" data-t="k" data-k="n" data-id="'+E(k.id)+'">'+[4,6,8].map(function(n){return '<option value="'+n+'"'+(k.n===n?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div>'+
        '<div class="gm-fld"><span class="gm-lab" id="gmKCl_'+E(k.id)+'">Cor</span><div class="gm-sws" role="group" aria-labelledby="gmKCl_'+E(k.id)+'">'+COLORS.map(function(c){return '<button type="button" class="gm-sw'+(c.id===k.color?' on':'')+'" data-g="kcol" data-id="'+E(k.id)+'" data-c="'+c.id+'" aria-pressed="'+(c.id===k.color?'true':'false')+'" aria-label="'+c.label+'" title="'+c.label+'" style="--sw:'+c.hex+'"></button>'}).join('')+'</div></div></div>'+
        '<label class="gm-lab" for="gmKW_'+E(k.id)+'">Quando completo (gatilho)</label><input type="text" class="gm-in" id="gmKW_'+E(k.id)+'" maxlength="200" value="'+E(k.when)+'" data-t="k" data-k="when" data-id="'+E(k.id)+'" autocomplete="off" placeholder="O que acontece quando o relógio fecha?">'+
        (full?'<p class="gm-trig" role="status"><b>Gatilho:</b> '+(E(k.when)||'defina o gatilho acima')+'</p>':'')+
      '</article>'}).join('')+'</div>':'<p class="gm-empty">Nenhum relógio. Crie um para acompanhar uma ameaça ou tensão que cresce a cada cena.</p>';
    host.innerHTML=h;
  }

  /* --- Checklist --- */
  function renderCheck(){
    var host=ST.host&&ST.host.querySelector('#gmChk');if(!host||!G)return;
    var done=G.check.filter(function(i){return i.done}).length;
    var h='<form class="gm-bar gm-add" id="gmAddItem" autocomplete="off"><div class="gm-fld gm-grow"><label class="gm-lab" for="gmNewItem">Nova cena ou objetivo</label><input type="text" class="gm-in" id="gmNewItem" maxlength="300" placeholder="Ex.: Cena do porto"></div>'+
      '<button type="submit" class="btn small primary">'+ic(IC.plus)+'<span>Adicionar</span></button>'+
      '<button type="button" class="btn small" data-g="iclear"'+(done?'':' disabled')+'>Limpar concluídos'+(done?' ('+done+')':'')+'</button></form>';
    h+=G.check.length?'<ul class="gm-list">'+G.check.map(function(i,ix){
      return '<li class="gm-item'+(i.done?' done':'')+'" data-id="'+E(i.id)+'">'+
        '<input type="checkbox" class="gm-cb" id="gmCb_'+E(i.id)+'" data-g="itog" data-id="'+E(i.id)+'"'+(i.done?' checked':'')+' aria-label="Concluída: '+E(i.text||'item')+'">'+
        '<div class="gm-grow"><label class="gm-lab gm-sr" for="gmIt_'+E(i.id)+'">Texto do item</label><input type="text" class="gm-in" id="gmIt_'+E(i.id)+'" maxlength="300" value="'+E(i.text)+'" data-t="i" data-k="text" data-id="'+E(i.id)+'" autocomplete="off"></div>'+
        (i.done?'<button type="button" class="btn small gm-rev" data-g="irev" data-id="'+E(i.id)+'">'+ic(IC.eye)+'<span>Revelar para os Jogadores</span></button>':'')+
        (i.revealed?'<span class="gm-pill">Revelado</span>':'')+
        '<span class="gm-ca"><button type="button" class="gm-ib" data-g="iup" data-id="'+E(i.id)+'" aria-label="Mover o item para cima"'+(ix===0?' disabled':'')+'>'+ic(IC.up)+'</button>'+
        '<button type="button" class="gm-ib" data-g="idn" data-id="'+E(i.id)+'" aria-label="Mover o item para baixo"'+(ix===G.check.length-1?' disabled':'')+'>'+ic(IC.down)+'</button>'+
        '<button type="button" class="gm-ib" data-g="idel" data-id="'+E(i.id)+'" aria-label="Excluir o item">'+ic(IC.trash)+'</button></span></li>'}).join('')+'</ul>'
      :'<p class="gm-empty">Nenhuma cena ainda. Liste as cenas e objetivos da sessão e marque ao concluir.</p>';
    h+='<label class="gm-lab" for="gmNotes">Anotações rápidas do Mestre (nunca reveladas)</label><textarea class="gm-in gm-secret" id="gmNotes" rows="4" maxlength="4000" data-t="n" data-k="notes">'+E(G.notes)+'</textarea>';
    host.innerHTML=h;
  }
  function renderAll(){renderPin();renderClocks();renderCheck()}

  /* foco: depois de re-renderizar, devolve o foco ao mesmo controle */
  function keep(fn){
    var a=document.activeElement,key=null;
    if(a&&a.dataset&&a.dataset.g&&ST.host&&ST.host.contains(a))key={g:a.dataset.g,id:a.dataset.id||'',p:a.dataset.p||'',c:a.dataset.c||''};
    fn();
    if(key){
      var sel='[data-g="'+key.g+'"]'+(key.id?'[data-id="'+key.id+'"]':'')+(key.p!==''?'[data-p="'+key.p+'"]':'')+(key.c?'[data-c="'+key.c+'"]':'');
      var el=null;try{el=ST.host.querySelector(sel)}catch(e){}
      if(el&&!el.disabled)try{el.focus({preventScroll:true})}catch(e){}
    }
  }

  /* ---------- Revelação Seletiva ---------- */
  /* Monta o payload de um item. SÓ os campos públicos entram em `pub`; o que fica oculto vai em `hid`
     (apenas para destacar na prévia: nunca é copiado). */
  function revealOf(kind,id){
    if(kind==='card'){
      var c=cardById(id);if(!c)return null;
      var hid=[];if(c.secret.trim())hid.push({label:'Notas secretas',text:c.secret});
      var ps=c.paths.filter(function(p){return p.trim()});if(ps.length)hid.push({label:'Caminhos de descoberta',text:ps.join(' · ')});
      return{kind:kind,id:id,pub:{title:c.title.trim()||byId(CATS,c.cat).short,text:c.text.trim()},hid:hid,cat:c.cat==='pista'?'recorte':'manuscrito'};
    }
    if(kind==='item'){
      var i=itemById(id);if(!i)return null;
      return{kind:kind,id:id,pub:{title:i.text.trim()||'Cena concluída',text:''},hid:[],cat:'manuscrito'};
    }
    if(kind==='node'){
      var inst=ST.flow,n=inst&&inst.node(id);if(!n)return null;
      var sp=splitNode(n.text),d=n.d||{},hid2=[];
      if(d.x&&String(d.x).trim())hid2.push({label:'Notas secretas',text:String(d.x)});
      return{kind:kind,id:id,pub:{title:sp.t.trim()||ntLabel(n.t),text:sp.b.trim()},hid:hid2,cat:'manuscrito'};
    }
    return null;
  }
  function markRevealed(kind,id){
    var now=Date.now();
    if(kind==='card'){var c=cardById(id);if(c){c.revealed=now;touch();keep(renderPin)}}
    else if(kind==='item'){var i=itemById(id);if(i){i.revealed=now;touch();keep(renderCheck)}}
    else if(kind==='node'&&ST.flow){var n=ST.flow.node(id);if(n)ST.flow.update(id,{d:Object.assign({},n.d||{},{r:now})})}
  }
  /* destinos: recebem apenas {title,text} */
  function sendBancada(pl,cat){
    if(!window.T3||!T3.bancada||typeof T3.bancada.deliver!=='function')return Promise.reject(new Error('a Bancada não está disponível'));
    return T3.bancada.deliver({title:pl.title,text:pl.text,cat:cat});
  }
  function sendQuadro(pl){
    if(!window.T3||!T3.quadro||typeof T3.quadro.ensure!=='function')return Promise.reject(new Error('o Quadro não está disponível'));
    var inst=T3.quadro.ensure();if(!inst)return Promise.reject(new Error('o Quadro não está disponível'));
    if(!inst.isReady())try{inst.load()}catch(e){}
    var wait=Promise.race([inst.whenReady(),new Promise(function(_,rej){setTimeout(function(){rej(new Error('o Quadro não carregou'))},15000)})]);
    return wait.then(function(){
      var c=inst.viewportCenter(),j=(inst.nodes().length%6)*24;
      var n=inst.addNode('note',{text:(pl.title+(pl.text?'\n'+pl.text:'')).slice(0,1800),color:'ev'},{at:{x:c.x+j,y:c.y+j}});
      if(!n)throw new Error('não consegui criar o post-it');
      try{inst.flush()}catch(e){}
      return{id:n.id};
    });
  }
  function revealDialog(kind,id,opener){
    var r=revealOf(kind,id);if(!r)return;
    var B=window.T3&&T3.bancada,cats=B&&B.categories||[];
    var h='<p class="gm-help">Confira o que será copiado. Só o texto público vai para os jogadores; o que está em "Fica só com você" nunca é enviado.</p>'+
      '<div class="gm-pv" aria-label="O que os jogadores vão ver"><p class="gm-pvl">'+ic(IC.eye)+'<span>Os jogadores vão ver</span></p>'+
        '<h4 class="gm-pvt" id="gmPvT">'+E(r.pub.title)+'</h4>'+(r.pub.text?'<p class="gm-pvx" id="gmPvX">'+E(r.pub.text)+'</p>':'<p class="gm-pvx dim">(sem texto, só o título)</p>')+'</div>'+
      '<div class="gm-hid" aria-label="O que fica oculto"><p class="gm-pvl">'+ic(IC.lock)+'<span>Fica só com você (não será enviado)</span></p>'+
        (r.hid.length?'<ul>'+r.hid.map(function(x){return '<li><b>'+E(x.label)+':</b> <span class="gm-hidtx">'+E(x.text)+'</span></li>'}).join('')+'</ul>':'<p class="dim">Nada oculto neste item.</p>')+'</div>'+
      '<fieldset class="gm-dest"><legend>Destino</legend>'+
        '<label class="gm-radio"><input type="radio" name="gmDest" value="banc" checked><span>Bancada Compartilhada (cria um documento que todos veem)</span></label>'+
        '<div class="gm-fld gm-catsel"><label class="gm-lab" for="gmDCat">Categoria do documento</label><select class="gm-in" id="gmDCat">'+cats.map(function(c){return '<option value="'+c.id+'"'+(c.id===r.cat?' selected':'')+'>'+E(c.label)+'</option>'}).join('')+'</select></div>'+
        '<label class="gm-radio"><input type="radio" name="gmDest" value="quad"><span>Quadro de Investigação (cria um post-it no quadro da mesa)</span></label>'+
      '</fieldset>';
    dlg({title:'Revelar para os Jogadores',html:h,opener:opener,
      actions:[{label:'Cancelar',cls:'btn small',act:'x'},{label:'Revelar agora',cls:'btn small primary',act:'ok'}],
      onAct:function(a,el,close){
        if(a!=='ok')return close();
        var dest=(el.querySelector('input[name="gmDest"]:checked')||{}).value||'banc',cat=(el.querySelector('#gmDCat')||{}).value;
        var pl={title:r.pub.title,text:r.pub.text},btn=el.querySelector('[data-a="ok"]');
        if(btn){btn.disabled=true;btn.textContent='Revelando…'}
        (dest==='quad'?sendQuadro(pl):sendBancada(pl,cat)).then(function(){
          markRevealed(kind,id);close();
          say(dest==='quad'?'Revelado no Quadro de Investigação: '+pl.title:'Revelado na Bancada: '+pl.title+'. Os jogadores foram avisados.');
        }).catch(function(e){
          if(btn){btn.disabled=false;btn.textContent='Revelar agora'}
          say('Não consegui revelar: '+((e&&e.message)||'erro')+'. Nada foi marcado como revelado.');
        });
      }});
  }

  /* ---------- diálogo genérico (dentro da Bancada, com foco preso) ---------- */
  function closeDlg(silent){
    var d=ST.dlg;if(!d)return;
    ST.dlg=null;
    try{d.ov.remove()}catch(e){}
    if(!silent&&d.opener&&d.opener.isConnected)try{d.opener.focus({preventScroll:true})}catch(e){}
  }
  function dlg(o){
    closeDlg(true);
    var host=ST.host;if(!host)return;
    var ov=document.createElement('div');ov.className='gm-ov';
    ov.innerHTML='<div class="gm-dlg" role="dialog" aria-modal="true" aria-labelledby="gmDT"><h3 id="gmDT">'+E(o.title)+'</h3><div class="gm-db">'+o.html+'</div><div class="gm-da">'+
      o.actions.map(function(a){return '<button type="button" class="'+a.cls+'" data-a="'+a.act+'">'+E(a.label)+'</button>'}).join('')+'</div></div>';
    host.appendChild(ov);
    var d={ov:ov,opener:o.opener||document.activeElement};ST.dlg=d;
    function close(){closeDlg()}
    ov.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-a]');
      if(b&&ov.contains(b)){e.stopPropagation();o.onAct(b.dataset.a,ov,close);return}
      if(e.target===ov)close();
    });
    ov.addEventListener('keydown',function(e){
      if(e.key==='Escape'){e.stopPropagation();e.preventDefault();close();return}
      if(e.key==='Tab'){
        var f=[].filter.call(ov.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'),function(x){return x.offsetParent!==null});
        if(!f.length)return;var a=f[0],z=f[f.length-1];
        if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
        else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
      }
    });
    ov.addEventListener('input',function(e){e.stopPropagation()});
    ov.addEventListener('change',function(e){e.stopPropagation()});
    var first=ov.querySelector('input:not([type="radio"]),textarea,select,[data-a="ok"],[data-a]');
    try{(first||ov).focus({preventScroll:true})}catch(e){}
  }

  /* ---------- fluxograma (motor T3.quadroEngine) ---------- */
  function splitNode(t){var s=String(t==null?'':t),i=s.indexOf('\n');return i<0?{t:s,b:''}:{t:s.slice(0,i),b:s.slice(i+1)}}
  var NT={
    ato:    {label:'Ato / Capítulo',short:'Ato',icon:IC.book,w:260,h:150},
    cena:   {label:'Cena de Investigação',short:'Cena',icon:IC.search,w:240,h:150},
    enc:    {label:'Encontro / Emboscada',short:'Encontro',icon:IC.bolt,w:240,h:150},
    virada: {label:'Ponto de Virada (Plot Twist)',short:'Virada',icon:IC.turn,w:240,h:150},
    segredo:{label:'Segredo Oculto',short:'Segredo',icon:IC.lock,w:240,h:150},
    gancho: {label:'Gancho de Trama',short:'Gancho',icon:IC.hook,w:240,h:150},
    npc:    {label:'NPC / Facção',short:'NPC',icon:IC.person,w:240,h:150}
  };
  function ntLabel(t){return NT[t]?NT[t].label:'Nó'}
  function stOfNode(n){var s=n.d&&n.d.s;return byId(STATUS,s,STATUS[0])}
  function nodeRender(n,el){
    var ty=NT[n.t]||NT.cena,sp=splitNode(n.text),st=stOfNode(n),d=n.d||{};
    el.dataset.st=st.id;
    el.innerHTML='<div class="qd-in gm-nd"><div class="gm-nh"><span class="qd-ni">'+ic(ty.icon).replace('gm-ic','qd-ic gm-ic')+'</span><span class="gm-nk">'+E(ty.label)+'</span>'+
      (d.x&&String(d.x).trim()?'<span class="gm-nlk" title="Tem notas secretas" role="img" aria-label="Tem notas secretas">'+ic(IC.lock)+'</span>':'')+'</div>'+
      '<div class="qd-nt">'+(E(sp.t)||'<span class="qd-ph">Sem título</span>')+'</div>'+(sp.b?'<div class="qd-nb">'+E(sp.b)+'</div>':'')+
      '<div class="gm-nf"><span class="gm-nst st-'+st.id+'">'+E(st.label)+'</span>'+(d.r?'<span class="gm-pill">Revelado</span>':'')+
      '<button type="button" class="qd-open" data-qd-act="open" tabindex="-1" aria-label="Detalhes do nó '+E(sp.t||ty.label)+'">Detalhes</button></div></div>';
  }
  function nodeDialog(n){
    var inst=ST.flow;if(!inst)return;
    var sp=splitNode(n.text),d=n.d||{},id=n.id,ty=NT[n.t]||NT.cena;
    var h='<p class="gm-help">'+E(ty.label)+'. O título e o texto público podem ser revelados; as notas secretas nunca.</p>'+
      '<label class="gm-lab" for="gmNT">Título</label><input type="text" class="gm-in" id="gmNT" maxlength="120" value="'+E(sp.t)+'" autocomplete="off">'+
      '<label class="gm-lab" for="gmNX">Texto público (o que pode ser revelado)</label><textarea class="gm-in" id="gmNX" rows="4" maxlength="900">'+E(sp.b)+'</textarea>'+
      '<label class="gm-lab gm-lab-s" for="gmNS">'+ic(IC.lock)+'<span>Notas secretas do Mestre</span></label><textarea class="gm-in gm-secret" id="gmNS" rows="4" maxlength="700">'+E(d.x||'')+'</textarea>'+
      '<label class="gm-lab" for="gmNSt">Status</label><select class="gm-in" id="gmNSt">'+STATUS.map(function(s){return '<option value="'+s.id+'"'+(s.id===stOfNode(n).id?' selected':'')+'>'+s.label+'</option>'}).join('')+'</select>';
    function collect(){
      var t=(document.getElementById('gmNT').value||'').replace(/\n/g,' ').trim(),x=document.getElementById('gmNX').value||'';
      var nd=Object.assign({},n.d||{},{s:document.getElementById('gmNSt').value,x:(document.getElementById('gmNS').value||'').slice(0,700)});
      if(!nd.x)delete nd.x;
      inst.update(id,{text:t+(x?'\n'+x:''),d:nd});
    }
    dlg({title:'Detalhes do nó',html:h,
      actions:[{label:'Fechar',cls:'btn small',act:'x'},{label:'Salvar',cls:'btn small primary',act:'save'},{label:'Revelar para os Jogadores…',cls:'btn small gm-rev',act:'rev'}],
      onAct:function(a,el,close){
        if(a==='x')return close();
        collect();
        if(a==='save'){close();say('Nó salvo.');return}
        var op=ST.dlg&&ST.dlg.opener;close();setTimeout(function(){revealDialog('node',id,op)},0);
      }});
  }
  NT.ato.onOpen=NT.cena.onOpen=NT.enc.onOpen=NT.virada.onOpen=NT.segredo.onOpen=NT.gancho.onOpen=NT.npc.onOpen=function(n){nodeDialog(n)};
  Object.keys(NT).forEach(function(k){
    var t=NT[k];t.group='Fluxograma';t.minW=170;t.minH=110;t.resizable=true;t.titleLine=true;t.maxText=1000;t.render=nodeRender;
    t.openLabel='Detalhes, status e revelar';t.addLabel='Adicionar '+t.label;t.placeholder='Título do nó';
  });
  var CT={
    principal:{label:'Caminho Principal',icon:'<path d="M4 12h13M13 7l5 5-5 5"/>',color:'var(--text)',width:3,route:'ortho',arrow:'end'},
    alt:{label:'Rota Alternativa',icon:'<path d="M4 12h3M10 12h3M16 12h3M15 8l4 4-4 4"/>',color:'var(--accent)',width:2.5,dash:'10 8',route:'bezier',arrow:'end'},
    falha:{label:'Gatilho de Falha / Consequência',icon:'<path d="M4 12h13M13 7l5 5-5 5"/><path d="M8 8l3 3M11 8l-3 3"/>',color:'#d64545',width:2.5,route:'bezier',arrow:'end'},
    oculta:{label:'Conexão Oculta',icon:'<path d="M4 12h1M8 12h1M12 12h1M16 12h1M20 12h0"/>',color:'var(--ink-dim,var(--text))',width:2,dash:'2 7',route:'bezier',arrow:'none'}
  };
  function T_(k,t,x,y,text,s){return{k:k,t:t,x:x,y:y,text:text||'',d:{s:s||'p'}}}
  function K_(a,as,b,bs,t,label){return{a:a,as:as,b:b,bs:bs,t:t,label:label||''}}
  var TPL=[
    {id:'atos',label:'Investigação em 3 Atos',desc:'Chamado, teia e confronto, com virada, segredo e rota alternativa.',icon:CT.principal.icon,build:function(){return{
      nodes:[T_('a1','ato',0,0,'Ato I: O Chamado\nO que traz o grupo ao caso?','j'),T_('c1','cena',0,240,'Cena: local do crime\nO que há para achar?'),T_('g1','gancho',-320,240,'Gancho\nPor que investigar agora?'),
        T_('a2','ato',420,0,'Ato II: A Teia\nSuspeitos e mentiras'),T_('e2','enc',420,240,'Encontro: emboscada\nQuem não quer que descubram?'),T_('v2','virada',840,240,'Ponto de Virada\nA verdade muda o caso'),
        T_('s2','segredo',420,480,'Segredo oculto\nO que ninguém sabe'),T_('a3','ato',840,0,'Ato III: O Confronto\nA revelação e o preço'),T_('f3','cena',840,480,'Cena final\nDesfecho e consequências')],
      conns:[K_('a1','e','a2','w','principal'),K_('a2','e','a3','w','principal'),K_('a1','s','c1','n','principal'),K_('g1','e','c1','w','principal'),K_('a2','s','e2','n','principal'),K_('e2','e','v2','w','principal'),
        K_('c1','e','e2','w','alt'),K_('e2','s','s2','n','oculta'),K_('v2','s','f3','n','principal'),K_('e2','e','f3','w','falha','Se fugirem')]}}},
    {id:'teia',label:'Teia de Conspiração & Facções',desc:'Conspiração no centro, facções, aliados ocultos e segredos.',icon:CT.oculta.icon,build:function(){return{
      nodes:[T_('c','npc',0,0,'A Conspiração\nObjetivo declarado'),T_('f1','npc',-460,-240,'Facção A\nQuem são e o que querem'),T_('f2','npc',460,-240,'Facção B\nQuem são e o que querem'),
        T_('n1','npc',-460,240,'NPC chave\nPapel e lealdade'),T_('s1','segredo',460,240,'Segredo oculto\nO elo que ninguém vê'),T_('g','gancho',0,-300,'Gancho\nPor onde os jogadores entram')],
      conns:[K_('c','w','f1','e','principal'),K_('c','e','f2','w','principal'),K_('c','s','n1','e','oculta'),K_('c','s','s1','w','oculta'),K_('g','s','c','n','principal'),K_('f1','s','n1','n','alt','Aliança'),K_('f1','e','f2','w','falha','Rivalidade')]}}},
    {id:'arvore',label:'Árvore de Decisões e Consequências',desc:'Uma decisão dos jogadores e o que cada escolha desencadeia.',icon:CT.falha.icon,build:function(){return{
      nodes:[T_('r','cena',0,0,'Decisão dos jogadores\nQual é a escolha?','j'),T_('a','cena',-340,240,'Escolha A\nO que muda?'),T_('b','cena',340,240,'Escolha B\nO que muda?'),
        T_('ca','enc',-340,480,'Consequência de A\nCusto e reação'),T_('cb','virada',340,480,'Consequência de B\nCusto e reação'),T_('x','segredo',0,480,'Se ignorarem\nO que acontece sozinho?')],
      conns:[K_('r','s','a','n','principal'),K_('r','s','b','n','principal'),K_('a','s','ca','n','falha'),K_('b','s','cb','n','falha'),K_('r','s','x','n','oculta'),K_('a','e','b','w','alt')]}}},
    {id:'cronograma',label:'Cronograma de Eventos',desc:'Cinco marcos em sequência, do primeiro sinal ao desfecho.',icon:'<path d="M3 12h18M7 8v8M12 8v8M17 8v8"/>',build:function(){
      var ns=[],cs=[],ty=['gancho','cena','enc','virada','ato'];
      for(var i=0;i<5;i++){ns.push(T_('m'+i,ty[i],i*300,0,'Dia '+(i+1)+'\nO que acontece e quem percebe?',i===0?'j':'p'));if(i)cs.push(K_('m'+(i-1),'e','m'+i,'w','principal'))}
      return{nodes:ns,conns:cs}}}
  ];
  function ensureFlow(){
    var c=cid();if(!c||!G||!window.T3||!T3.quadroEngine)return null;
    if(ST.flow&&ST.flowCamp===c)return ST.flow;
    if(ST.flow){try{ST.flow.destroy()}catch(e){}ST.flow=null}
    ST.flowCamp=c;
    ST.flow=T3.quadroEngine.create(null,{
      id:'guia-fluxo',title:'Fluxograma de Campanha (só o Mestre)',nodeTypes:NT,connTypes:CT,defaultConn:'principal',templates:TPL,
      masterOnly:true,isMaster:gm,readOnly:function(){return !cid()},dblAdd:'cena',maxNodes:300,
      viewKey:'tulpa_guia_v_'+c+'_'+me(),toast:say,
      adapter:{
        load:function(){return Promise.resolve(G?G.flow:null)},
        save:function(doc,delta,inst){if(G){G.flow=clone(inst.getDoc());touch()}return Promise.resolve({})},
        subscribe:function(cb){ST.flowCb=cb;return function(){ST.flowCb=null}}
      }
    });
    return ST.flow;
  }

  /* ---------- eventos da interface ---------- */
  function onClick(e){
    var t=e.target.closest?e.target.closest('[data-g]'):null;if(!t||!ST.host||!ST.host.contains(t)||!G)return;
    if(ST.dlg&&ST.dlg.ov.contains(t))return;
    var a=t.dataset.g,id=t.dataset.id;
    if(a==='sec'){var s=t.dataset.sec,open=uiGet()['s_'+s]!==false;uiSet('s_'+s,!open);
      var body=ST.host.querySelector('#gmB_'+s);if(body)body.hidden=open;
      t.setAttribute('aria-expanded',open?'false':'true');t.innerHTML=ic(open?IC.down:IC.up);
      t.setAttribute('aria-label',(open?'Abrir':'Recolher')+' a seção '+(t.closest('.gm-sec').querySelector('h2')||{}).textContent);
      if(!open&&s==='flow')attachFlow();return}
    if(a==='cadd'){var sel=ST.host.querySelector('#gmNewCat'),cat=sel?sel.value:'premissa';
      var c=nCard({id:rid('c'),cat:cat,title:'',prio:[],pinned:false});G.cards.unshift(c);touch();ST.fp='';ST.fc='';renderPin();
      var ti=ST.host.querySelector('#gmT_'+c.id);if(ti)ti.focus();return}
    if(a==='cpin'){var c1=cardById(id);if(c1){c1.pinned=!c1.pinned;touch();keep(renderPin)}return}
    if(a==='cup'||a==='cdn'){var l=sortedCards();if(moveIn(G.cards,id,a==='cup'?-1:1,function(x){return x.pinned})){touch();keep(renderPin)}void l;return}
    if(a==='ccol'){var c2=cardById(id);if(c2){c2.col=!c2.col;touch();keep(renderPin)}return}
    if(a==='cdel'){var c3=cardById(id);if(c3&&confirm('Excluir o card "'+(c3.title||'sem título')+'"?')){G.cards=G.cards.filter(function(x){return x.id!==id});touch();renderPin()}return}
    if(a==='cprio'){var c4=cardById(id);if(c4){var p=t.dataset.p,ix=c4.prio.indexOf(p);if(ix>=0)c4.prio.splice(ix,1);else c4.prio.push(p);touch();keep(renderPin)}return}
    if(a==='cfilt'){ST.fp=t.dataset.p||'';keep(renderPin);return}
    if(a==='crev'){revealDialog('card',id,t);return}
    if(a==='kadd'){var ns=ST.host.querySelector('#gmNewN'),k=nClock({id:rid('k'),name:'Nova ameaça',n:ns?ns.value:6,v:0,color:'verm'});G.clocks.push(k);touch();renderClocks();
      var ki=ST.host.querySelector('#gmKN_'+k.id);if(ki){ki.focus();ki.select()}return}
    if(a==='kplus'||a==='kmin'||a==='kreset'||a==='kseg'||a==='kcol'){
      var k1=clockById(id);if(!k1)return;
      if(a==='kplus')k1.v=Math.min(k1.n,k1.v+1);
      else if(a==='kmin')k1.v=Math.max(0,k1.v-1);
      else if(a==='kreset')k1.v=0;
      else if(a==='kseg'){var i=Number(t.dataset.i);k1.v=(k1.v===i+1)?i:i+1}
      else if(a==='kcol')k1.color=byId(COLORS,t.dataset.c).id;
      touch();keep(renderClocks);return}
    if(a==='kdel'){var k2=clockById(id);if(k2&&confirm('Excluir o relógio "'+(k2.name||'sem nome')+'"?')){G.clocks=G.clocks.filter(function(x){return x.id!==id});touch();renderClocks()}return}
    if(a==='iup'||a==='idn'){if(moveIn(G.check,id,a==='iup'?-1:1)){touch();keep(renderCheck)}return}
    if(a==='idel'){G.check=G.check.filter(function(x){return x.id!==id});touch();renderCheck();return}
    if(a==='iclear'){var n=G.check.filter(function(x){return x.done}).length;if(n&&confirm('Remover '+n+(n===1?' item concluído?':' itens concluídos?'))){G.check=G.check.filter(function(x){return !x.done});touch();renderCheck()}return}
    if(a==='irev'){revealDialog('item',id,t);return}
  }
  function onChange(e){
    var t=e.target;if(!ST.host||!G||!t)return;
    if(t.dataset&&t.dataset.g==='itog'){var i=itemById(t.dataset.id);if(i){i.done=t.checked;touch();keep(renderCheck)}return}
    if(t.id==='gmFc'){ST.fc=t.value;renderPin();return}
    if(t.dataset&&t.dataset.t==='k'&&t.dataset.k==='n'){var k=clockById(t.dataset.id);if(k){k.n=Number(t.value);k.v=Math.min(k.v,k.n);touch();renderClocks()}}
  }
  function onInput(e){
    var t=e.target;if(!ST.host||!G||!t||!t.dataset)return;
    var ty=t.dataset.t;if(!ty)return;
    var v=t.value;
    if(ty==='c'){var c=cardById(t.dataset.id);if(!c)return;
      if(t.dataset.k==='path'){c.paths[Number(t.dataset.i)]=v.slice(0,200);var cv=ST.host.querySelector('[data-cov="'+c.id+'"]');if(cv){var n=covOf(c);cv.textContent=covText(n);cv.className='gm-cov '+(n>=3?'ok':'warn')}}
      else c[t.dataset.k]=v}
    else if(ty==='k'){var k=clockById(t.dataset.id);if(!k||t.dataset.k==='n')return;k[t.dataset.k]=v}
    else if(ty==='i'){var i=itemById(t.dataset.id);if(!i)return;i.text=v}
    else if(ty==='n'){G.notes=v}
    touch();
  }
  function onSubmit(e){
    if(e.target&&e.target.id==='gmAddItem'){
      e.preventDefault();
      var inp=ST.host.querySelector('#gmNewItem'),v=(inp&&inp.value||'').trim();if(!v||!G)return;
      G.check.push(nItem({id:rid('i'),text:v}));touch();renderCheck();
      var n=ST.host.querySelector('#gmNewItem');if(n)n.focus();
    }
  }
  function attachFlow(){
    var host=ST.host&&ST.host.querySelector('#gmFlow');if(!host||!G)return;
    var body=ST.host.querySelector('#gmB_flow');if(body&&body.hidden)return;
    var inst=ensureFlow();if(!inst)return;
    inst.attach(host);
    if(!inst.isReady())inst.load();
    setTimeout(function(){try{inst.fit(0)}catch(e){}},120);
  }

  /* ---------- montar / desmontar (só Mestre) ---------- */
  function unmountFlow(){if(ST.flow){try{ST.flow.detach()}catch(e){}}}
  function mount(host){
    if(!gm()||!cid()||!host)return;
    if(!window.T3||!T3.quadroEngine){host.innerHTML='<div class="gm"><p class="gm-empty">O motor de quadros não carregou. Recarregue a página.</p></div>';return}
    load().then(function(){
      if(!G||!gm()||!host.isConnected)return;
      var sig=cid()+'|'+me();
      if(ST.host!==host||ST.built!==sig||!host.querySelector('#gmRoot')){
        ST.host=host;ST.built=sig;ST.ui=null;
        host.innerHTML=skeleton();
        if(!host.__gm){host.__gm=true;
          host.addEventListener('click',onClick);host.addEventListener('change',onChange);host.addEventListener('input',onInput);host.addEventListener('submit',onSubmit);
          host.addEventListener('keydown',function(e){if(e.key==='Escape'&&ST.dlg){e.stopPropagation();e.preventDefault();closeDlg()}});
        }
        renderAll();
      }
      setStat(statText());
      attachFlow();
    });
  }
  function unmount(){
    unmountFlow();closeDlg(true);
    if(G&&ST.t)flush();
  }
  window.addEventListener('tulpa:bancada-view',function(e){
    var d=e.detail||{};
    try{
      if(d.view==='guia'){if(gm())mount(d.host);else unmount()}
      else unmount();
    }catch(err){console.warn('[guia]',err)}
  });

  /* mudança vinda de outro aparelho do Mestre (a RLS já impede qualquer jogador de receber a linha) */
  if(typeof onStoreChange6==='function'){
    var _osc=onStoreChange6;
    onStoreChange6=function(p){
      var out=_osc.apply(this,arguments);
      try{
        if(!gm()||!G||ST.saving||ST.t)return out;
        var r=p&&p.new&&Object.keys(p.new).length?p.new:null;
        if(!r||String(r.key||'')!=='guia'||!r.value)return out;
        var nv=normDoc(r.value);
        if(nv.rev>G.rev){G=nv;if(ST.host&&ST.host.querySelector('#gmRoot')){renderAll();if(ST.flowCb)try{ST.flowCb(clone(G.flow),{silent:true})}catch(e){}}}
      }catch(err){console.warn('[guia] store',err)}
      return out;
    };
  }
  /* trocou de campanha ou perdeu a função de Mestre: solta tudo da memória */
  var lastCamp=null,lastGm=null;
  setInterval(function(){
    try{
      var c=cid(),g=gm();
      if(c!==lastCamp||g!==lastGm){
        var drop=(lastCamp!==null&&c!==lastCamp)||(lastGm===true&&!g);
        lastCamp=c;lastGm=g;
        if(drop){reset();ST.camp=c;if(ST.host){try{ST.host.innerHTML=''}catch(e){}ST.host=null}}
      }
    }catch(e){}
  },3000);
})();
