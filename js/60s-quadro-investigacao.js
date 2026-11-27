/* ==========================================================================
   TULPA RPG — Onda 2 (Bancada) · Quadro de Pesquisa
   Duas camadas num arquivo só, ambas dentro de um IIFE (nenhum global novo):

   1) MOTOR reutilizável  -> T3.quadroEngine.create(host, opts)
      Mural infinito estilo Miro: DOM com transform (translate+scale) para os
      nós, SVG para as conexões, minimapa em canvas, rAF, pan/zoom (mouse,
      roda, pinça), snap, desfazer/refazer, seleção múltipla, templates,
      acessível por teclado. Não conhece Bancada, Supabase nem Mestre: recebe
      tipos de nó, tipos de conexão, templates, um adaptador de persistência
      (load/save/subscribe) e flags (readOnly, masterOnly). A Onda 3 (fluxograma
      do Mestre) cria um segundo quadro só passando outras opções.
      Documento: {v:1, nodes:{id:nó}, conns:{id:conexão}, del:{id:ts}}.
      Mescla por id + upd (o maior vence; del = lápide de exclusão).

   2) QUADRO DE PESQUISA da campanha (aba "Quadro de Pesquisa" da Bancada, js/60r)
      Registro `quadro` (kind `quadro`) no campaign_store. SÓ o Mestre grava
      (RLS). O jogador edita localmente e propõe mudanças em lote por PEDIDO
      (linha cmb:'quadroreq' em campaign_rolls, como a Bancada); o aparelho do
      Mestre aplica (idempotente por `done`). Enquanto o Mestre não aplica, as
      mudanças do jogador ficam "pendentes" (localStorage) e são reaplicadas.
      Nunca imagem no campaign_store: o card de documento guarda só a
      referência {scope,id} e um resumo mínimo; a imagem vem de T3.bancada.
   Sem SQL novo. Carrega ANTES de js/61-init.js.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__qd60s)return;
  window.__qd60s=true;

  var NS='http://www.w3.org/2000/svg',DAY=864e5;
  var SIDES=['n','s','e','w'],DIR={n:{x:0,y:-1},s:{x:0,y:1},e:{x:1,y:0},w:{x:-1,y:0}};
  var SIDE_L={n:'Norte',s:'Sul',e:'Leste',w:'Oeste'};

  /* ---------- utilitários ---------- */
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  function clone(o){return o==null?o:JSON.parse(JSON.stringify(o))}
  function rid(p){return (p||'q')+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
  function num(v,a,b,d){v=Number(v);return isFinite(v)?clamp(v,a,b):d}
  function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
  function ic(p,cls){return '<svg viewBox="0 0 24 24" class="qd-ic'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false">'+p+'</svg>'}
  function svgEl(tag,attrs){var e=document.createElementNS(NS,tag);if(attrs)for(var k in attrs)e.setAttribute(k,attrs[k]);return e}
  function eachObj(o,fn){if(!o||typeof o!=='object')return;Object.keys(o).forEach(function(k){fn(o[k],k)})}
  function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}

  var UI={
    undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
    fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    grid:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16"/>',
    hand:'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
    box:'<path d="M4 4h4M10 4h4M16 4h4v4M20 10v4M20 16v4h-4M14 20h-4M8 20H4v-4M4 14v-4M4 8V4"/>',
    tpl:'<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 13h7v7H4z"/>',
    dup:'<path d="M8 8h11v11H8z"/><path d="M5 16V5h11"/>',
    front:'<path d="M4 8l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
    trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    open:'<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
    link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    tag:'<path d="M4 6h16v9H10l-4 4v-4H4z"/>',
    route:'<path d="M4 18h6V6h10"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>'
  };

  var DEFL={
    undo:'Desfazer',redo:'Refazer',zoomIn:'Aproximar',zoomOut:'Afastar',zoomReset:'Voltar ao zoom de 100%',fit:'Ajustar à tela',
    snapOn:'Alinhar à grade (ligado)',snapOff:'Alinhar à grade (desligado)',pan:'Mover o quadro (arrastar o fundo)',box:'Selecionar com caixa (arrastar o fundo)',
    templates:'Modelos',tplTitle:'Aplicar modelo',connStyle:'Estilo da próxima conexão',elements:'Elementos do quadro',controls:'Controles do quadro',
    area:'Área do quadro. Use Tab para percorrer os itens, setas para mover o item selecionado, Enter para editar, Delete para excluir.',
    dup:'Duplicar',front:'Trazer para a frente',del:'Excluir',edit:'Editar texto',open:'Abrir',color:'Cor',
    connType:'Estilo da conexão',connColor:'Cor da linha',connRoute:'Trocar entre curva e ângulo reto',connLabel:'Rótulo da conexão',connDel:'Excluir conexão',
    loading:'Carregando o quadro…',loadErr:'Não consegui carregar o quadro. Seus dados não foram perdidos.',retry:'Tentar de novo',
    empty:'Quadro vazio. Use os elementos ao lado ou aplique um modelo.',
    tplConfirm:'O quadro já tem itens. Adicionar este modelo ao lado deles?',
    stSaved:'Salvo',stSaving:'Salvando…',stPend:'Alterações a salvar…',stErr:'Não consegui salvar. Tentando de novo…',stRo:'Somente leitura',stLoad:'Carregando…',
    stWait:'Aguardando o Mestre confirmar suas alterações',
    linkHint:'Escolha o nó de destino (Tab e Enter) ou toque nele. Esc cancela.',nodeMax:'O quadro chegou ao limite de itens.',
    linkMade:'Conexão criada.',moved:'Item movido.',deleted:'Itens excluídos.',selAll:'Tudo selecionado.',
    minimap:'Minimapa do quadro. Clique ou arraste para ir a outra região.'
  };
  var CONN_COLORS=[{id:'',label:'Padrão do estilo',v:''},{id:'#d64545',label:'Vermelho',v:'#d64545'},{id:'#d9a21b',label:'Âmbar',v:'#d9a21b'},
    {id:'#3b82c4',label:'Azul',v:'#3b82c4'},{id:'#3fa66b',label:'Verde',v:'#3fa66b'},{id:'#8b5cc8',label:'Violeta',v:'#8b5cc8'}];

  /* ---------- modelo: normalização e mescla ---------- */
  function newDoc(){return{v:1,nodes:{},conns:{},del:{}}}
  function makeNorm(types,ctypes,defConn){
    function nn(n){
      if(!n||typeof n!=='object')return null;
      var ty=types[String(n.t||'')];if(!ty)return null;
      var id=String(n.id||'').slice(0,40);if(!/^[\w-]{1,40}$/.test(id))return null;
      var o={id:id,t:String(n.t),x:num(n.x,-1e5,1e5,0),y:num(n.y,-1e5,1e5,0),
        w:num(n.w,ty.minW||40,2400,ty.w||160),h:num(n.h,ty.minH||24,2400,ty.h||100),z:Math.round(num(n.z,-1e4,1e7,0)),
        text:String(n.text==null?'':n.text).slice(0,2000),upd:Number(n.upd)||0};
      if(ty.colors&&ty.colors.length){
        var c=String(n.color||''),ok=false;ty.colors.forEach(function(k){if(k.id===c)ok=true});
        o.color=ok?c:(ty.color||ty.colors[0].id);
      }
      if(n.ref&&typeof n.ref==='object'&&n.ref.id)o.ref={scope:n.ref.scope==='personal'?'personal':'shared',id:String(n.ref.id).slice(0,40)};
      if(n.snap&&typeof n.snap==='object')o.snap={title:String(n.snap.title||'').slice(0,120),code:String(n.snap.code||'').slice(0,12),cat:String(n.snap.cat||'').slice(0,20),status:String(n.snap.status||'').slice(0,20)};
      if(n.d&&typeof n.d==='object'){try{var sd=JSON.stringify(n.d);if(sd.length<=1500)o.d=JSON.parse(sd)}catch(e){}}
      return o;
    }
    function nc(c){
      if(!c||typeof c!=='object'||!c.from||!c.to)return null;
      var id=String(c.id||'').slice(0,40);if(!/^[\w-]{1,40}$/.test(id))return null;
      var fs=SIDES.indexOf(c.from.s)>=0?c.from.s:'e',ts=SIDES.indexOf(c.to.s)>=0?c.to.s:'w';
      var fn=String(c.from.n||'').slice(0,40),tn=String(c.to.n||'').slice(0,40);
      if(!fn||!tn||fn===tn)return null;
      var col=String(c.color||'');if(!/^#[0-9a-f]{3,8}$/i.test(col))col='';
      return{id:id,from:{n:fn,s:fs},to:{n:tn,s:ts},t:ctypes[c.t]?String(c.t):defConn,color:col,label:String(c.label||'').slice(0,80),
        route:c.route==='ortho'||c.route==='bezier'?c.route:'',upd:Number(c.upd)||0};
    }
    return{n:nn,c:nc};
  }
  /* mescla `r` (documento remoto/ops) em `doc`, no lugar. `skip`: ids que não podem ser trocados agora. */
  function mergeInto(doc,r,norm,skip,maxN){
    var ch={n:[],c:[],r:[]};
    if(!r||typeof r!=='object')return ch;
    eachObj(r.del,function(v,id){
      var ts=Number(v)||0;if(!ts||!/^[\w-]{1,40}$/.test(id))return;
      if(!(doc.del[id]>=ts))doc.del[id]=ts;
      var ln=doc.nodes[id];if(ln&&ln.upd<=ts&&!(skip&&skip[id])){delete doc.nodes[id];ch.r.push(id)}
      var lc=doc.conns[id];if(lc&&lc.upd<=ts){delete doc.conns[id];ch.r.push(id)}
    });
    var count=Object.keys(doc.nodes).length;
    eachObj(r.nodes,function(raw,id){
      if(raw&&typeof raw==='object'&&!raw.id)raw.id=id;
      var n=norm.n(raw);if(!n)return;
      if((doc.del[n.id]||0)>=n.upd&&n.upd)return;
      var l=doc.nodes[n.id];if(l&&l.upd>=n.upd)return;
      if(skip&&skip[n.id])return;
      if(!l&&maxN&&count>=maxN)return;
      if(!l)count++;
      doc.nodes[n.id]=n;ch.n.push(n.id);
    });
    eachObj(r.conns,function(raw,id){
      if(raw&&typeof raw==='object'&&!raw.id)raw.id=id;
      var c=norm.c(raw);if(!c)return;
      if((doc.del[c.id]||0)>=c.upd&&c.upd)return;
      var l=doc.conns[c.id];if(l&&l.upd>=c.upd)return;
      doc.conns[c.id]=c;ch.c.push(c.id);
    });
    return ch;
  }
  /* mescla genérica (sem tipos), usada por adaptadores: devolve um documento novo */
  function mergeRaw(a,b){
    var out={v:1,nodes:{},conns:{},del:{}};
    [a,b].forEach(function(src){
      if(!src)return;
      eachObj(src.nodes,function(n,id){var l=out.nodes[id];if(!l||(Number(n.upd)||0)>=(Number(l.upd)||0))out.nodes[id]=n});
      eachObj(src.conns,function(n,id){var l=out.conns[id];if(!l||(Number(n.upd)||0)>=(Number(l.upd)||0))out.conns[id]=n});
      eachObj(src.del,function(ts,id){if(!(out.del[id]>=ts))out.del[id]=Number(ts)||0});
    });
    Object.keys(out.del).forEach(function(id){
      if(out.nodes[id]&&(Number(out.nodes[id].upd)||0)<=out.del[id])delete out.nodes[id];
      if(out.conns[id]&&(Number(out.conns[id].upd)||0)<=out.del[id])delete out.conns[id];
    });
    return out;
  }

  /* ---------- geometria das conexões ---------- */
  function anchorPt(n,s){
    switch(s){case 'n':return{x:n.x+n.w/2,y:n.y};case 's':return{x:n.x+n.w/2,y:n.y+n.h};case 'e':return{x:n.x+n.w,y:n.y+n.h/2};default:return{x:n.x,y:n.y+n.h/2}}
  }
  function bezGeo(p1,s1,p2,s2){
    var d=Math.hypot(p2.x-p1.x,p2.y-p1.y),off=clamp(d*.45,40,220);
    var c1=s1?{x:p1.x+DIR[s1].x*off,y:p1.y+DIR[s1].y*off}:p1,c2=s2?{x:p2.x+DIR[s2].x*off,y:p2.y+DIR[s2].y*off}:p2;
    var mid={x:(p1.x+3*c1.x+3*c2.x+p2.x)/8,y:(p1.y+3*c1.y+3*c2.y+p2.y)/8};
    return{d:'M'+p1.x+' '+p1.y+'C'+c1.x+' '+c1.y+' '+c2.x+' '+c2.y+' '+p2.x+' '+p2.y,mid:mid,
      t1:unit(c1.x===p1.x&&c1.y===p1.y?c2:c1,p1),t2:unit(p2,c2.x===p2.x&&c2.y===p2.y?c1:c2)};
  }
  function unit(a,b){var dx=a.x-b.x,dy=a.y-b.y,l=Math.hypot(dx,dy)||1;return{x:dx/l,y:dy/l}}
  function orthoGeo(p1,s1,p2,s2){
    var pad=24,a={x:p1.x+DIR[s1].x*pad,y:p1.y+DIR[s1].y*pad},b=s2?{x:p2.x+DIR[s2].x*pad,y:p2.y+DIR[s2].y*pad}:p2;
    var h1=s1==='e'||s1==='w',h2=s2?(s2==='e'||s2==='w'):h1,pts=[p1,a],mx,my;
    if(h1&&h2){mx=(a.x+b.x)/2;pts.push({x:mx,y:a.y},{x:mx,y:b.y})}
    else if(!h1&&!h2){my=(a.y+b.y)/2;pts.push({x:a.x,y:my},{x:b.x,y:my})}
    else if(h1)pts.push({x:b.x,y:a.y});else pts.push({x:a.x,y:b.y});
    if(s2)pts.push(b);pts.push(p2);
    var q=[pts[0]];for(var i=1;i<pts.length;i++){var l=q[q.length-1];if(Math.abs(l.x-pts[i].x)>.01||Math.abs(l.y-pts[i].y)>.01)q.push(pts[i])}
    if(q.length<2)q.push({x:q[0].x+1,y:q[0].y});
    var d='M'+q[0].x+' '+q[0].y,r=10,total=0,segs=[];
    for(i=1;i<q.length;i++){var sl=Math.hypot(q[i].x-q[i-1].x,q[i].y-q[i-1].y);segs.push(sl);total+=sl}
    for(i=1;i<q.length-1;i++){
      var P=q[i],A=q[i-1],B=q[i+1],d1=Math.hypot(P.x-A.x,P.y-A.y),d2=Math.hypot(B.x-P.x,B.y-P.y),rr=Math.min(r,d1/2,d2/2);
      var u1=unit(P,A),u2=unit(B,P);
      d+='L'+(P.x-u1.x*rr)+' '+(P.y-u1.y*rr)+'Q'+P.x+' '+P.y+' '+(P.x+u2.x*rr)+' '+(P.y+u2.y*rr);
    }
    d+='L'+q[q.length-1].x+' '+q[q.length-1].y;
    var half=total/2,mid=q[0];
    for(i=1;i<q.length;i++){if(half<=segs[i-1]){var f=segs[i-1]?half/segs[i-1]:0;mid={x:q[i-1].x+(q[i].x-q[i-1].x)*f,y:q[i-1].y+(q[i].y-q[i-1].y)*f};break}half-=segs[i-1];mid=q[i]}
    return{d:d,mid:mid,t1:unit(q[0],q[1]),t2:unit(q[q.length-1],q[q.length-2])};
  }
  function arrowPath(tip,dir,w){
    var L=9+w*1.4,W=4.5+w*.9,bx=tip.x-dir.x*L,by=tip.y-dir.y*L,px=-dir.y,py=dir.x;
    return'M'+tip.x+' '+tip.y+'L'+(bx+px*W)+' '+(by+py*W)+'L'+(bx-px*W)+' '+(by-py*W)+'Z';
  }

  /* ======================================================================
     MOTOR
     ====================================================================== */
  function create(host,o){
    o=o||{};
    var types=o.nodeTypes||{},ctypes=o.connTypes||{},L=Object.assign({},DEFL,o.labels||{});
    var defConn=o.defaultConn&&ctypes[o.defaultConn]?o.defaultConn:Object.keys(ctypes)[0];
    var GRID=o.grid||20,KMIN=o.minZoom||.25,KMAX=o.maxZoom||2,MAXN=o.maxNodes||600,DEB=o.debounce==null?600:o.debounce;
    var norm=makeNorm(types,ctypes,defConn);
    var doc=newDoc(),V={x:0,y:0,k:1},sel=[],selC=null,snapOn=o.snap!==false,boxMode=false,connType=defConn;
    var forcedRO=false,destroyed=false,ready=false,loadErr=false,ev={},readyP=null,readyRes=null,readyRej=null;
    var nodeEls={},connEls={},labEls={},byNode={},hoverId=null,editing=null,linkPick=null,menuEl=null,menuOff=null;
    var H={u:[],r:[]},rec=null,dirty={n:{},c:{},r:{}},saveT=0,saving=false,forceSave=false,stKind='load',stNote='',retryT=0;
    var need={view:true,all:true,ctx:true,mini:true,conns:{}},raf=0,stageW=0,stageH=0,lastTap={id:'',t:0},moveT=0,viewT=0,anim=0,mmT=null,colC={t:0,v:null};
    var unsub=null,ro$=null,docL=[];
    function emit(n,a,b){(ev[n]||[]).slice().forEach(function(f){try{f(a,b)}catch(e){console.warn('[quadro] evento',n,e)}})}
    function say(m){try{(o.toast||window.toast||function(){})(m)}catch(e){}}
    function live(m){if(liveEl){liveEl.textContent='';setTimeout(function(){if(liveEl)liveEl.textContent=m},30)}}
    function isRO(){var r=typeof o.readOnly==='function'?!!o.readOnly():!!o.readOnly;if(o.masterOnly&&!(typeof o.isMaster==='function'?o.isMaster():false))r=true;return r||forcedRO}
    function confirmFn(m){return typeof o.confirm==='function'?o.confirm(m):window.confirm(m)}

    /* ---------- DOM ---------- */
    var root=document.createElement('div');root.className='qd';root.dataset.qd=o.id||'quadro';
    root.innerHTML=
      '<div class="qd-stage" id="qdStage" tabindex="0" role="application" aria-label="'+esc(o.title||'Quadro')+'. '+esc(L.area)+'">'+
        '<div class="qd-grid"></div>'+
        '<div class="qd-world">'+
          '<div class="qd-layer qd-lf"></div>'+
          '<svg class="qd-svg" width="1" height="1" aria-hidden="true"><g class="qd-gc"></g><g class="qd-gt"></g></svg>'+
          '<div class="qd-layer qd-ln"></div>'+
          '<div class="qd-layer qd-ll"></div>'+
          '<div class="qd-ov" hidden><i class="qd-anc" data-s="n" title="Conectar pelo norte"></i><i class="qd-anc" data-s="s" title="Conectar pelo sul"></i><i class="qd-anc" data-s="e" title="Conectar pelo leste"></i><i class="qd-anc" data-s="w" title="Conectar pelo oeste"></i><i class="qd-rsz" title="Redimensionar"></i></div>'+
        '</div>'+
        '<div class="qd-marq" hidden></div>'+
        '<div class="qd-ctx qd-ui" hidden role="toolbar" aria-label="Ações do item selecionado"></div>'+
        '<p class="qd-emptymsg" aria-hidden="true">'+esc(L.empty)+'</p>'+
        '<div class="qd-load qd-ui" role="status"></div>'+
      '</div>'+
      '<div class="qd-top qd-ui" role="toolbar" aria-label="'+esc(L.controls)+'"></div>'+
      '<div class="qd-bar qd-ui" role="toolbar" aria-label="'+esc(L.elements)+'" aria-orientation="vertical"></div>'+
      '<div class="qd-mini qd-ui"><canvas role="img" aria-label="'+esc(L.minimap)+'"></canvas></div>'+
      '<p class="qd-status qd-ui" aria-hidden="true"></p><p class="qd-sr" role="status" aria-live="polite"></p>';
    var stage=root.querySelector('.qd-stage'),gridEl=root.querySelector('.qd-grid'),world=root.querySelector('.qd-world'),
      layF=root.querySelector('.qd-lf'),layN=root.querySelector('.qd-ln'),layL=root.querySelector('.qd-ll'),gC=root.querySelector('.qd-gc'),gT=root.querySelector('.qd-gt'),
      ov=root.querySelector('.qd-ov'),marq=root.querySelector('.qd-marq'),ctx=root.querySelector('.qd-ctx'),loadEl=root.querySelector('.qd-load'),
      top=root.querySelector('.qd-top'),bar=root.querySelector('.qd-bar'),mini=root.querySelector('.qd-mini canvas'),statusEl=root.querySelector('.qd-status'),liveEl=root.querySelector('.qd-sr');
    var rszEl=ov.querySelector('.qd-rsz');

    /* barra de controles (topo) */
    function tbtn(id,icon,label,extra){return '<button type="button" class="qd-b" data-q="'+id+'" aria-label="'+esc(label)+'" title="'+esc(label)+'"'+(extra||'')+'>'+ic(icon)+'</button>'}
    var connBtns=Object.keys(ctypes).map(function(k){var c=ctypes[k];return '<button type="button" class="qd-b qd-cb" data-q="ctype" data-v="'+k+'" aria-pressed="'+(k===connType?'true':'false')+'" aria-label="'+esc(c.label)+'" title="'+esc(L.connStyle+': '+c.label)+'">'+ic(c.icon||UI.link)+'</button>'}).join('');
    top.innerHTML=
      '<div class="qd-g">'+tbtn('undo',UI.undo,L.undo+' (Ctrl+Z)')+tbtn('redo',UI.redo,L.redo+' (Ctrl+Y)')+'</div>'+
      '<div class="qd-g">'+tbtn('zout',UI.minus,L.zoomOut+' (−)')+'<button type="button" class="qd-b qd-zr" data-q="z100" aria-label="'+esc(L.zoomReset)+'" title="'+esc(L.zoomReset)+'">100%</button>'+tbtn('zin',UI.plus,L.zoomIn+' (+)')+tbtn('fit',UI.fit,L.fit)+'</div>'+
      '<div class="qd-g">'+tbtn('snap',UI.grid,L.snapOn,' aria-pressed="true"')+tbtn('box',UI.box,L.box,' aria-pressed="false"')+'</div>'+
      (o.templates&&o.templates.length?'<div class="qd-g"><button type="button" class="qd-b qd-bt" data-q="tpl" aria-haspopup="menu" aria-label="'+esc(L.templates)+'" title="'+esc(L.templates)+'">'+ic(UI.tpl)+'<span>'+esc(L.templates)+'</span></button></div>':'')+
      (Object.keys(ctypes).length>1?'<div class="qd-g qd-gcn" role="group" aria-label="'+esc(L.connStyle)+'">'+connBtns+'</div>':'');
    function buildBar(){
      var h='',lastG='';
      Object.keys(types).forEach(function(k){
        var ty=types[k];if(ty.palette===false)return;
        if(ty.group&&ty.group!==lastG){h+='<i class="qd-sep" aria-hidden="true"></i>';lastG=ty.group}
        h+='<button type="button" class="qd-b qd-be" data-q="add" data-t="'+esc(k)+'"'+((ty.presets||ty.pick)?' aria-haspopup="menu"':'')+' aria-label="'+esc(ty.addLabel||('Adicionar '+ty.label))+'" title="'+esc(ty.addLabel||('Adicionar '+ty.label))+'">'+ic(ty.icon||UI.plus)+'<span>'+esc(ty.short||ty.label)+'</span></button>';
      });
      bar.innerHTML=h;
    }
    buildBar();
    if(host)host.appendChild(root);

    /* ---------- estado/saída ---------- */
    function setStatus(k,note){
      stKind=k;stNote=note||'';
      var t={load:L.stLoad,saved:L.stSaved,saving:L.stSaving,pend:L.stPend,err:L.stErr,ro:L.stRo,wait:note||L.stWait}[k]||'';
      if(k==='ro'&&note)t=note;
      statusEl.textContent=t;statusEl.dataset.k=k;statusEl.hidden=!t;
      emit('status',k,t);
    }
    function paintLoad(){
      if(ready){loadEl.hidden=true;return}
      loadEl.hidden=false;
      loadEl.innerHTML=loadErr?'<p><b>'+esc(L.loadErr)+'</b></p><button type="button" class="qd-tx" data-q="retry">'+esc(L.retry)+'</button>':'<p>'+esc(L.loading)+'</p>';
    }

    /* ---------- escalonador de quadros (rAF) ---------- */
    function sched(){if(!raf&&!destroyed)raf=requestAnimationFrame(frame)}
    function frame(){
      raf=0;if(destroyed)return;
      if(need.view){
        need.view=false;
        world.style.transform='translate3d('+V.x+'px,'+V.y+'px,0) scale('+V.k+')';
        var step=GRID*(V.k<.4?4:V.k<.7?2:1)*V.k;
        gridEl.style.backgroundSize=step+'px '+step+'px';
        gridEl.style.backgroundPosition=(V.x)+'px '+(V.y)+'px';
        ov.style.setProperty('--ik',String(1/V.k));
        var z=top.querySelector('.qd-zr');if(z)z.textContent=Math.round(V.k*100)+'%';
        need.ctx=true;need.mini=true;
      }
      if(need.all){need.all=false;Object.keys(connEls).forEach(function(id){need.conns[id]=1})}
      var cs=Object.keys(need.conns);need.conns={};
      cs.forEach(function(id){var c=doc.conns[id];if(c)drawConn(c)});
      if(need.ctx){need.ctx=false;placeCtx();placeOv()}
      if(need.mini){need.mini=false;drawMini()}
    }
    function bumpView(){need.view=true;sched();stage.classList.add('moving');clearTimeout(moveT);moveT=setTimeout(function(){stage.classList.remove('moving')},220);saveViewSoon()}
    function saveViewSoon(){if(!o.viewKey)return;clearTimeout(viewT);viewT=setTimeout(function(){lsS(o.viewKey,{x:V.x,y:V.y,k:V.k})},800)}
    function measure(){var r=stage.getBoundingClientRect();stageW=r.width;stageH=r.height;return r}
    function toWorld(cx,cy){var r=stage.getBoundingClientRect();return{x:(cx-r.left-V.x)/V.k,y:(cy-r.top-V.y)/V.k}}
    function centerWorld(){measure();return{x:(stageW/2-V.x)/V.k,y:(stageH/2-V.y)/V.k}}
    function zoomAt(cx,cy,k){
      k=clamp(k,KMIN,KMAX);var r=stage.getBoundingClientRect(),px=cx-r.left,py=cy-r.top;
      V.x=px-(px-V.x)*(k/V.k);V.y=py-(py-V.y)*(k/V.k);V.k=k;bumpView();
    }
    function zoomCenter(k){measure();var r=stage.getBoundingClientRect();zoomAt(r.left+stageW/2,r.top+stageH/2,k)}
    function animateTo(t,ms){
      cancelAnimationFrame(anim);
      if(reduced()||!ms){V.x=t.x;V.y=t.y;V.k=t.k;bumpView();return}
      var s={x:V.x,y:V.y,k:V.k},t0=performance.now();
      (function step(now){
        var p=clamp((now-t0)/ms,0,1),e=1-Math.pow(1-p,3);
        V.x=s.x+(t.x-s.x)*e;V.y=s.y+(t.y-s.y)*e;V.k=s.k+(t.k-s.k)*e;bumpView();
        if(p<1)anim=requestAnimationFrame(step);
      })(t0);
    }
    function bbox(ids){
      var a=1e9,b=1e9,c=-1e9,d=-1e9,any=false;
      (ids||Object.keys(doc.nodes)).forEach(function(id){var n=doc.nodes[id];if(!n)return;any=true;a=Math.min(a,n.x);b=Math.min(b,n.y);c=Math.max(c,n.x+n.w);d=Math.max(d,n.y+n.h)});
      return any?{x:a,y:b,w:c-a,h:d-b}:null;
    }
    function fitTo(box,ms,maxK){
      measure();if(!stageW||!stageH)return;
      if(!box){animateTo({x:stageW/2,y:stageH/2,k:1},ms);return}
      var pad=64,k=clamp(Math.min((stageW-pad*2)/Math.max(box.w,1),(stageH-pad*2)/Math.max(box.h,1)),KMIN,maxK||1);
      animateTo({x:stageW/2-(box.x+box.w/2)*k,y:stageH/2-(box.y+box.h/2)*k,k:k},ms);
    }
    function ensureVisible(id){
      var n=doc.nodes[id];if(!n)return;measure();
      var x1=n.x*V.k+V.x,y1=n.y*V.k+V.y,x2=(n.x+n.w)*V.k+V.x,y2=(n.y+n.h)*V.k+V.y,m=24;
      if(x1<m||y1<m||x2>stageW-m||y2>stageH-m)animateTo({x:stageW/2-(n.x+n.w/2)*V.k,y:stageH/2-(n.y+n.h/2)*V.k,k:V.k},180);
    }

    /* ---------- nós: DOM ---------- */
    function colorOf(n,ty){var c=null;(ty.colors||[]).forEach(function(k){if(k.id===n.color)c=k});return c||(ty.colors&&ty.colors[0])||null}
    function splitText(t){var i=String(t).indexOf('\n');return i<0?{t:t,b:''}:{t:t.slice(0,i),b:t.slice(i+1)}}
    function nodeLabel(n){var ty=types[n.t];return ty.label+': '+(splitText(n.text).t||(n.snap&&n.snap.title)||'vazio')}
    function mkNodeEl(n){
      var d=document.createElement('div');d.className='qd-n';d.dataset.id=n.id;d.dataset.t=n.t;d.tabIndex=0;d.setAttribute('role','group');
      nodeEls[n.id]=d;(types[n.t].container?layF:layN).appendChild(d);return d;
    }
    function defaultContent(n,d,ty){
      var col=colorOf(n,ty);
      if(col){d.style.setProperty('--nbg',col.bg);d.style.setProperty('--nfg',col.fg)}else{d.style.removeProperty('--nbg');d.style.removeProperty('--nfg')}
      var sp=ty.titleLine?splitText(n.text):{t:'',b:n.text},h='<div class="qd-in">';
      if(ty.icon&&ty.showIcon!==false)h+='<span class="qd-ni">'+ic(ty.icon)+'</span>';
      h+='<div class="qd-tx-w">';
      if(ty.titleLine)h+='<div class="qd-nt">'+(esc(sp.t)||'<span class="qd-ph">'+esc(ty.placeholder||ty.label)+'</span>')+'</div>';
      if(sp.b||(!ty.titleLine))h+='<div class="qd-nb">'+(esc(sp.b)||(!ty.titleLine&&!n.text?'<span class="qd-ph">'+esc(ty.placeholder||'')+'</span>':''))+'</div>';
      h+='</div></div>';
      d.innerHTML=h;
    }
    function paintNode(n){
      var d=nodeEls[n.id]||mkNodeEl(n),ty=types[n.t];
      d.style.width=n.w+'px';d.style.height=n.h+'px';d.style.transform='translate3d('+n.x+'px,'+n.y+'px,0)';d.style.zIndex=String(n.z);
      var sig=n.t+'|'+n.text+'|'+n.color+'|'+(n.ref?n.ref.scope+n.ref.id:'')+'|'+(n.snap?JSON.stringify(n.snap):'')+'|'+(n.d?JSON.stringify(n.d):'')+'|'+(ty.sizeInSig?n.w+'x'+n.h:'');
      if(d._sig!==sig&&!(editing&&editing.id===n.id)){
        d._sig=sig;
        if(typeof ty.render==='function')ty.render(n,d,inst);else defaultContent(n,d,ty);
      }
      d.setAttribute('aria-label',nodeLabel(n));
      d.classList.toggle('sel',sel.indexOf(n.id)>=0);
      return d;
    }
    function dropNodeEl(id){var d=nodeEls[id];if(d&&d.parentNode)d.parentNode.removeChild(d);delete nodeEls[id]}

    /* ---------- conexões: DOM ---------- */
    function connLabelOf(c){
      var a=doc.nodes[c.from.n],b=doc.nodes[c.to.n];
      return (ctypes[c.t]?ctypes[c.t].label:'Conexão')+' de '+(a?splitText(a.text).t||types[a.t].label:'?')+' para '+(b?splitText(b.text).t||types[b.t].label:'?')+(c.label?': '+c.label:'');
    }
    function mkConnEl(c){
      var g=svgEl('g',{'class':'qd-c','data-cid':c.id,tabindex:'0',role:'button'});
      g.appendChild(svgEl('path',{'class':'qd-ch'}));g.appendChild(svgEl('path',{'class':'qd-cv'}));g.appendChild(svgEl('path',{'class':'qd-ca'}));g.appendChild(svgEl('path',{'class':'qd-ca2'}));
      g.appendChild(svgEl('circle',{'class':'qd-cp qd-cp1',r:'5'}));g.appendChild(svgEl('circle',{'class':'qd-cp qd-cp2',r:'5'}));
      gC.appendChild(g);connEls[c.id]=g;return g;
    }
    function drawConn(c){
      var g=connEls[c.id]||mkConnEl(c),a=doc.nodes[c.from.n],b=doc.nodes[c.to.n],lab=labEls[c.id];
      if(!a||!b){g.style.display='none';if(lab)lab.style.display='none';return}
      g.style.display='';
      var ct=ctypes[c.t]||ctypes[defConn],route=c.route||ct.route||'bezier',p1=anchorPt(a,c.from.s),p2=anchorPt(b,c.to.s);
      var geo=route==='ortho'?orthoGeo(p1,c.from.s,p2,c.to.s):bezGeo(p1,c.from.s,p2,c.to.s),w=ct.width||2.5;
      g.dataset.t=c.t;
      g.style.setProperty('--cc',c.color||ct.color||'var(--text)');
      g.style.setProperty('--cw',String(w));
      g.style.setProperty('--cd',ct.dash||'none');
      var ps=g.childNodes;ps[0].setAttribute('d',geo.d);ps[1].setAttribute('d',geo.d);
      var ar=ct.arrow||'none';
      ps[2].setAttribute('d',ar==='end'||ar==='both'?arrowPath(p2,geo.t2,w):'');
      ps[3].setAttribute('d',ar==='both'?arrowPath(p1,{x:-geo.t1.x,y:-geo.t1.y},w):'');
      var pins=!!ct.pins;ps[4].style.display=ps[5].style.display=pins?'':'none';
      if(pins){ps[4].setAttribute('cx',p1.x);ps[4].setAttribute('cy',p1.y);ps[5].setAttribute('cx',p2.x);ps[5].setAttribute('cy',p2.y)}
      g.setAttribute('aria-label',connLabelOf(c));g.classList.toggle('sel',selC===c.id);
      g._mid=geo.mid;
      if(c.label||(editingL&&editingL.id===c.id)){
        if(!lab){lab=document.createElement('div');lab.className='qd-cl';lab.dataset.cid=c.id;layL.appendChild(lab);labEls[c.id]=lab}
        lab.style.display='';lab.style.transform='translate3d('+geo.mid.x+'px,'+geo.mid.y+'px,0)';
        if(!(editingL&&editingL.id===c.id)){lab.innerHTML='<span>'+esc(c.label)+'</span>';lab.classList.toggle('sel',selC===c.id)}
      }else if(lab){lab.parentNode.removeChild(lab);delete labEls[c.id]}
    }
    var editingL=null;
    function dropConnEl(id){var g=connEls[id];if(g&&g.parentNode)g.parentNode.removeChild(g);delete connEls[id];var l=labEls[id];if(l&&l.parentNode)l.parentNode.removeChild(l);delete labEls[id]}
    function reindex(){
      byNode={};
      Object.keys(doc.conns).forEach(function(id){var c=doc.conns[id];(byNode[c.from.n]=byNode[c.from.n]||[]).push(id);(byNode[c.to.n]=byNode[c.to.n]||[]).push(id)});
    }
    function dirtyConnsOf(nid){(byNode[nid]||[]).forEach(function(id){need.conns[id]=1});sched()}

    /* ---------- render geral ---------- */
    function renderAll(){
      Object.keys(nodeEls).forEach(dropNodeEl);Object.keys(connEls).forEach(dropConnEl);
      Object.keys(doc.nodes).forEach(function(id){paintNode(doc.nodes[id])});
      reindex();
      Object.keys(doc.conns).forEach(function(id){need.conns[id]=1});
      need.ctx=need.mini=true;sched();paintEmpty();
    }
    function paintEmpty(){stage.classList.toggle('qd-empty',!Object.keys(doc.nodes).length&&ready)}
    function syncIds(ids){
      /* ids: {n:[...],c:[...],r:[...]} após mudança de dados */
      var cc={};
      (ids.n||[]).forEach(function(id){var n=doc.nodes[id];if(n){paintNode(n);(byNode[id]||[]).forEach(function(k){cc[k]=1})}else dropNodeEl(id)});
      (ids.r||[]).forEach(function(id){if(!doc.nodes[id])dropNodeEl(id);if(!doc.conns[id])dropConnEl(id)});
      reindex();
      (ids.n||[]).forEach(function(id){(byNode[id]||[]).forEach(function(k){cc[k]=1})});
      (ids.c||[]).forEach(function(id){if(doc.conns[id])cc[id]=1;else dropConnEl(id)});
      Object.keys(cc).forEach(function(id){need.conns[id]=1});
      /* conexões sem ponta viram invisíveis; limpa do DOM o que não existe mais */
      Object.keys(connEls).forEach(function(id){if(!doc.conns[id])dropConnEl(id)});
      Object.keys(nodeEls).forEach(function(id){if(!doc.nodes[id])dropNodeEl(id)});
      sel=sel.filter(function(id){return !!doc.nodes[id]});if(selC&&!doc.conns[selC])selC=null;
      need.ctx=need.mini=true;sched();paintEmpty();
    }

    /* ---------- seleção ---------- */
    function setSel(ids,c,silent){
      var ns=(ids||[]).filter(function(id){return !!doc.nodes[id]});
      var chg=!same(ns,sel)||c!==selC;
      sel.forEach(function(id){if(ns.indexOf(id)<0&&nodeEls[id])nodeEls[id].classList.remove('sel')});
      var oldC=selC;sel=ns;selC=c&&doc.conns[c]?c:null;
      sel.forEach(function(id){if(nodeEls[id])nodeEls[id].classList.add('sel')});
      if(oldC&&oldC!==selC){need.conns[oldC]=1}
      if(selC)need.conns[selC]=1;
      need.ctx=true;sched();
      if(chg&&!silent)emit('select',sel.slice(),selC);
    }
    function selectAll(){setSel(Object.keys(doc.nodes).filter(function(id){return true}),null);live(L.selAll)}

    /* ---------- edição de dados com histórico ---------- */
    function capN(id){if(rec&&!(id in rec.n))rec.n[id]=doc.nodes[id]?clone(doc.nodes[id]):null}
    function capC(id){if(rec&&!(id in rec.c))rec.c[id]=doc.conns[id]?clone(doc.conns[id]):null}
    var lastUpd=0;
    function stamp(prev){var t=Math.max(Date.now(),lastUpd+1,(prev||0)+1);lastUpd=t;return t}
    function open_(){if(!rec)rec={n:{},c:{}};return rec}
    function close_(opt){
      var r=rec;rec=null;if(!r)return null;
      var ent={n:{},c:{}},ids={n:[],c:[],r:[]},any=false;
      Object.keys(r.n).forEach(function(id){
        var b=r.n[id],a=doc.nodes[id]?clone(doc.nodes[id]):null;
        if(same(b,a))return;
        any=true;
        if(a){doc.nodes[id].upd=stamp(b&&b.upd);a.upd=doc.nodes[id].upd;delete doc.del[id];dirty.n[id]=1;delete dirty.r[id];ids.n.push(id)}
        else{var ts=stamp(b&&b.upd);doc.del[id]=ts;dirty.r[id]=ts;delete dirty.n[id];ids.r.push(id)}
        ent.n[id]=[b,a];
      });
      Object.keys(r.c).forEach(function(id){
        var b=r.c[id],a=doc.conns[id]?clone(doc.conns[id]):null;
        if(same(b,a))return;
        any=true;
        if(a){doc.conns[id].upd=stamp(b&&b.upd);a.upd=doc.conns[id].upd;delete doc.del[id];dirty.c[id]=1;delete dirty.r[id];ids.c.push(id)}
        else{var ts2=stamp(b&&b.upd);doc.del[id]=ts2;dirty.r[id]=ts2;delete dirty.c[id];ids.r.push(id)}
        ent.c[id]=[b,a];
      });
      if(!any)return null;
      if(!(opt&&opt.noHist)){H.u.push(ent);if(H.u.length>100)H.u.shift();H.r=[]}
      syncIds(ids);schedSave();emit('change',ids);updUndo();
      return ent;
    }
    function run(fn,opt){var outer=rec;if(outer){fn();return null}open_();try{fn()}catch(e){rec=null;throw e}return close_(opt)}
    function nextZ(){var z=0;Object.keys(doc.nodes).forEach(function(id){if(doc.nodes[id].z>z)z=doc.nodes[id].z});return z+1}
    function snapV(v){return snapOn?Math.round(v/GRID)*GRID:v}
    function updUndo(){
      var u=top.querySelector('[data-q=undo]'),r=top.querySelector('[data-q=redo]');
      if(u)u.disabled=!H.u.length||isRO();if(r)r.disabled=!H.r.length||isRO();
    }
    function applyEntry(e,idx){
      open_();
      Object.keys(e.n).forEach(function(id){capN(id);var t=e.n[id][idx];if(t){var c=clone(t);doc.nodes[id]=c}else delete doc.nodes[id]});
      Object.keys(e.c).forEach(function(id){capC(id);var t=e.c[id][idx];if(t)doc.conns[id]=clone(t);else delete doc.conns[id]});
      close_({noHist:true});
    }
    function undo(){if(isRO())return;var e=H.u.pop();if(!e)return;applyEntry(e,0);H.r.push(e);updUndo();live(L.undo)}
    function redo(){if(isRO())return;var e=H.r.pop();if(!e)return;applyEntry(e,1);H.u.push(e);updUndo();live(L.redo)}

    /* ---------- CRUD ---------- */
    function addNode(t,props,opt){
      var ty=types[t];if(!ty||isRO())return null;
      if(Object.keys(doc.nodes).length>=MAXN){say(L.nodeMax);return null}
      opt=opt||{};props=props||{};
      var p=opt.at==='center'||!opt.at?centerWorld():opt.at,w=props.w||ty.w||160,h=props.h||ty.h||100;
      var n=norm.n(Object.assign({id:rid('n'),t:t,x:snapV(p.x-w/2),y:snapV(p.y-h/2),w:w,h:h,z:ty.container?-1:nextZ(),text:ty.defaults&&ty.defaults.text||'',color:ty.defaults&&ty.defaults.color},ty.defaults||{},props));
      if(!n)return null;
      if(opt.jitter){n.x+=opt.jitter.x;n.y+=opt.jitter.y}
      if(ty.container)n.z=-1;
      run(function(){capN(n.id);doc.nodes[n.id]=n});
      setSel([n.id],null);
      if(opt.edit&&ty.editable!==false&&!ty.noEdit)setTimeout(function(){edit(n.id)},30);
      return doc.nodes[n.id]||null;
    }
    function addConn(fromId,fs,toId,ts,t,props){
      if(isRO()||fromId===toId||!doc.nodes[fromId]||!doc.nodes[toId])return null;
      var dup=false;Object.keys(doc.conns).forEach(function(id){var c=doc.conns[id];if(c.from.n===fromId&&c.to.n===toId&&c.from.s===fs&&c.to.s===ts&&c.t===(t||connType))dup=true});
      if(dup)return null;
      var c=norm.c(Object.assign({id:rid('k'),from:{n:fromId,s:fs},to:{n:toId,s:ts},t:t||connType},props||{}));
      if(!c)return null;
      run(function(){capC(c.id);doc.conns[c.id]=c});
      return doc.conns[c.id]||null;
    }
    function updNode(id,patch){
      var n=doc.nodes[id];if(!n||isRO())return;
      run(function(){capN(id);Object.assign(n,patch);var nn=norm.n(n);if(nn){nn.upd=n.upd;doc.nodes[id]=nn}});
    }
    function updConn(id,patch){
      var c=doc.conns[id];if(!c||isRO())return;
      run(function(){capC(id);Object.assign(c,patch);var nc=norm.c(c);if(nc){nc.upd=c.upd;doc.conns[id]=nc}});
    }
    function removeIds(ids,cid){
      if(isRO())return;
      ids=(ids||[]).filter(function(id){return !!doc.nodes[id]});
      if(!ids.length&&!cid)return;
      run(function(){
        ids.forEach(function(id){capN(id);delete doc.nodes[id];(byNode[id]||[]).slice().forEach(function(k){capC(k);delete doc.conns[k]})});
        if(cid){capC(cid);delete doc.conns[cid]}
      });
      live(L.deleted);
    }
    function duplicate(ids){
      ids=(ids||sel).filter(function(id){return !!doc.nodes[id]});if(!ids.length||isRO())return;
      if(Object.keys(doc.nodes).length+ids.length>MAXN){say(L.nodeMax);return}
      var map={},out=[];
      run(function(){
        var z=nextZ();
        ids.forEach(function(id){var n=clone(doc.nodes[id]);n.id=rid('n');map[id]=n.id;n.x+=GRID;n.y+=GRID;if(!types[n.t].container)n.z=z++;capN(n.id);doc.nodes[n.id]=n;out.push(n.id)});
        Object.keys(doc.conns).forEach(function(k){var c=doc.conns[k];if(map[c.from.n]&&map[c.to.n]){var d=clone(c);d.id=rid('k');d.from.n=map[c.from.n];d.to.n=map[c.to.n];capC(d.id);doc.conns[d.id]=d}});
      });
      setSel(out,null);
    }
    function toFront(ids){
      ids=(ids||sel).filter(function(id){return doc.nodes[id]&&!types[doc.nodes[id].t].container});if(!ids.length||isRO())return;
      run(function(){var z=nextZ();ids.forEach(function(id){capN(id);doc.nodes[id].z=z++})});
    }

    /* ---------- edição de texto no lugar ---------- */
    function edit(id){
      var n=doc.nodes[id],ty=n&&types[n.t];if(!n||isRO()||ty.noEdit)return;
      commitEdit();
      var d=nodeEls[id];if(!d)return;
      var ta=document.createElement('textarea');ta.className='qd-edit';ta.value=n.text;ta.maxLength=ty.maxText||2000;ta.rows=2;
      ta.setAttribute('aria-label','Editar texto: '+ty.label+(ty.titleLine?' (a primeira linha é o título)':''));
      d.appendChild(ta);d.classList.add('editing');
      editing={id:id,ta:ta};
      ta.addEventListener('keydown',function(e){
        e.stopPropagation();
        if(e.key==='Escape'){e.preventDefault();cancelEdit();stage.focus()}
        else if(e.key==='Enter'&&(ty.multiline===false||e.ctrlKey||e.metaKey)){e.preventDefault();commitEdit();(nodeEls[id]||stage).focus({preventScroll:true})}
      });
      ta.addEventListener('blur',function(){commitEdit()});
      ta.addEventListener('pointerdown',function(e){e.stopPropagation()});
      ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length)}catch(e){}
      ensureVisible(id);
    }
    function closeEditEl(){
      if(!editing)return null;var e=editing;editing=null;
      var d=nodeEls[e.id];if(d){d.classList.remove('editing');if(e.ta.parentNode===d)d.removeChild(e.ta)}
      return e;
    }
    function cancelEdit(){
      var e=closeEditEl();if(!e)return;
      var n=doc.nodes[e.id];if(n&&nodeEls[e.id]){nodeEls[e.id]._sig='';paintNode(n)}
    }
    function commitEdit(){
      var e=editing;if(!e)return;
      var val=e.ta.value;closeEditEl();
      var n=doc.nodes[e.id];if(!n)return;
      var ty=types[n.t];
      if(val!==n.text){
        run(function(){
          capN(n.id);n.text=val.slice(0,ty.maxText||2000);
          var d=nodeEls[n.id];if(d){d._sig='';paintNode(n);
            if(ty.autoH){var inn=d.querySelector('.qd-in');if(inn&&inn.offsetHeight>n.h){n.h=Math.min(640,Math.ceil(inn.offsetHeight/GRID)*GRID)}}}
        });
      }else if(nodeEls[n.id]){nodeEls[n.id]._sig='';paintNode(n)}
    }
    /* rótulo de conexão */
    function editLabel(cid){
      var c=doc.conns[cid];if(!c||isRO())return;
      commitLabel();
      var lab=labEls[cid];
      editingL={id:cid};drawConn(c);lab=labEls[cid];if(!lab){editingL=null;return}
      lab.innerHTML='';var inp=document.createElement('input');inp.type='text';inp.className='qd-li';inp.maxLength=80;inp.value=c.label||'';inp.setAttribute('aria-label',L.connLabel);
      lab.appendChild(inp);lab.classList.add('editing');
      inp.addEventListener('pointerdown',function(e){e.stopPropagation()});
      inp.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'){e.preventDefault();commitLabel();stage.focus()}else if(e.key==='Escape'){e.preventDefault();cancelLabel();stage.focus()}});
      inp.addEventListener('blur',function(){commitLabel()});
      inp.focus();inp.select();editingL.inp=inp;
    }
    function cancelLabel(){var e=editingL;if(!e)return;editingL=null;var c=doc.conns[e.id];if(c){need.conns[e.id]=1;var lab=labEls[e.id];if(lab)lab.classList.remove('editing');drawConn(c)}}
    function commitLabel(){
      var e=editingL;if(!e)return;var v=e.inp?e.inp.value.trim():'';editingL=null;
      var c=doc.conns[e.id];if(!c)return;
      var lab=labEls[e.id];if(lab)lab.classList.remove('editing');
      if(v!==c.label)updConn(e.id,{label:v});else drawConn(c);
    }

    /* ---------- sobreposição (âncoras + redimensionar) ---------- */
    function ovId(){return (sel.length===1&&!selC)?sel[0]:(hoverId&&doc.nodes[hoverId]?hoverId:null)}
    function placeOv(){
      var id=ovId(),n=id&&doc.nodes[id];
      if(!n||isRO()||(G&&G.type==='node'&&G.moved)||editing){ov.hidden=true;return}
      ov.hidden=false;ov.style.width=n.w+'px';ov.style.height=n.h+'px';ov.style.transform='translate3d('+n.x+'px,'+n.y+'px,0)';
      rszEl.style.display=types[n.t].resizable?'':'none';ov.dataset.id=id;
    }

    /* ---------- barra contextual ---------- */
    var ctxSig='';
    function swatch(c,cur,kind){return '<button type="button" class="qd-sw'+(c.id===cur?' on':'')+'" data-ca="'+kind+'" data-v="'+esc(c.id)+'" aria-pressed="'+(c.id===cur?'true':'false')+'" aria-label="'+esc(c.label)+'" title="'+esc(c.label)+'" style="--sw:'+esc(c.bg||c.v||'transparent')+'">'+(c.id===''&&kind==='ccol'?ic(UI.minus):'')+'</button>'}
    function cb(act,icon,label,extra){return '<button type="button" class="qd-b qd-cx" data-ca="'+act+'" aria-label="'+esc(label)+'" title="'+esc(label)+'"'+(extra||'')+'>'+ic(icon)+'</button>'}
    function buildCtx(){
      var h='',sig='';
      if(isRO()&&!(sel.length===1&&types[doc.nodes[sel[0]]&&doc.nodes[sel[0]].t]&&types[doc.nodes[sel[0]].t].onOpen)){return''}
      if(selC&&doc.conns[selC]){
        if(isRO())return'';
        var c=doc.conns[selC];sig='c'+selC+c.t+c.color+c.route+c.label;
        h=Object.keys(ctypes).map(function(k){return '<button type="button" class="qd-b qd-cx'+(k===c.t?' on':'')+'" data-ca="ctype" data-v="'+k+'" aria-pressed="'+(k===c.t?'true':'false')+'" aria-label="'+esc(ctypes[k].label)+'" title="'+esc(ctypes[k].label)+'">'+ic(ctypes[k].icon||UI.link)+'</button>'}).join('')+
          '<i class="qd-sep"></i><span class="qd-sws" role="group" aria-label="'+esc(L.connColor)+'">'+CONN_COLORS.map(function(k){return swatch(k,c.color,'ccol')}).join('')+'</span><i class="qd-sep"></i>'+
          cb('croute',UI.route,L.connRoute)+cb('clabel',UI.tag,L.connLabel)+cb('cdel',UI.trash,L.connDel);
      }else if(sel.length){
        var first=doc.nodes[sel[0]],ty=types[first.t],single=sel.length===1;
        sig='n'+sel.join()+(single?first.color+first.text.length:'');
        if(single&&ty.onOpen)h+=cb('open',UI.open,ty.openLabel||L.open);
        if(!isRO()){
          if(single&&!ty.noEdit)h+=cb('edit',UI.edit,L.edit);
          if(single&&ty.colors&&ty.colors.length>1)h+='<span class="qd-sws" role="group" aria-label="'+esc(L.color)+'">'+ty.colors.map(function(k){return swatch(k,first.color,'color')}).join('')+'</span><i class="qd-sep"></i>';
          h+=cb('dup',UI.dup,L.dup+' (Ctrl+D)')+cb('front',UI.front,L.front)+cb('del',UI.trash,L.del+' (Delete)');
        }
      }
      ctx._sig2=sig;return h;
    }
    function placeCtx(){
      if(editing||(G&&(G.type==='node'&&G.moved||G.type==='pan'||G.type==='pinch'||G.type==='resize'))){ctx.hidden=true;return}
      var h=buildCtx();
      if(!h){ctx.hidden=true;ctxSig='';return}
      if(ctx._sig2!==ctxSig||ctx.hidden){ctxSig=ctx._sig2;ctx.innerHTML=h}
      var bx,by;
      if(selC&&doc.conns[selC]){var g=connEls[selC];if(!g||!g._mid){ctx.hidden=true;return}bx=g._mid.x*V.k+V.x;by=g._mid.y*V.k+V.y-14;}
      else{var bb=bbox(sel);if(!bb){ctx.hidden=true;return}bx=(bb.x+bb.w/2)*V.k+V.x;by=bb.y*V.k+V.y-10}
      ctx.hidden=false;
      var cw=ctx.offsetWidth,ch=ctx.offsetHeight;measure();
      var x=clamp(bx-cw/2,8,Math.max(8,stageW-cw-8)),y=by-ch;
      if(y<64){ /* sem espaço acima: vai abaixo do item */
        var bb2=selC?null:bbox(sel);y=bb2?(bb2.y+bb2.h)*V.k+V.y+10:by+ch+28;
      }
      y=clamp(y,64,Math.max(64,stageH-ch-8));
      ctx.style.transform='translate3d('+Math.round(x)+'px,'+Math.round(y)+'px,0)';
    }

    /* ---------- menus (popover) ---------- */
    function closeMenu(){
      if(!menuEl)return;var m=menuEl,a=m._anchor;menuEl=null;
      if(m.parentNode)m.parentNode.removeChild(m);if(menuOff){menuOff();menuOff=null}
      if(a&&a.isConnected){try{a.setAttribute('aria-expanded','false');a.focus({preventScroll:true})}catch(e){}}
    }
    function menu(anchor,items,title){
      closeMenu();
      var m=document.createElement('div');m.className='qd-menu qd-ui';m.setAttribute('role','menu');if(title)m.setAttribute('aria-label',title);
      m.innerHTML=(title?'<p class="qd-mt">'+esc(title)+'</p>':'')+(items.length?items.map(function(it,i){
        return '<button type="button" role="menuitem" class="qd-mi" data-i="'+i+'">'+(it.icon?ic(it.icon):'')+'<span class="qd-ml"><b>'+esc(it.label)+'</b>'+(it.sub?'<small>'+esc(it.sub)+'</small>':'')+'</span></button>';
      }).join(''):'<p class="qd-mt">Nada por aqui ainda.</p>');
      root.appendChild(m);m._anchor=anchor;menuEl=m;
      try{anchor.setAttribute('aria-expanded','true')}catch(e){}
      var rr=root.getBoundingClientRect(),ar=anchor.getBoundingClientRect(),mw=m.offsetWidth,mh=m.offsetHeight;
      var narrow=rr.width<=860;
      var x=narrow?clamp(ar.left-rr.left,8,Math.max(8,rr.width-mw-8)):ar.right-rr.left+8,y=narrow?ar.top-rr.top-mh-8:ar.top-rr.top;
      if(!narrow)y=clamp(y,8,Math.max(8,rr.height-mh-8));else if(y<8)y=ar.bottom-rr.top+8;
      m.style.left=Math.round(x)+'px';m.style.top=Math.round(y)+'px';
      m.addEventListener('click',function(e){
        var b=e.target.closest('[data-i]');if(!b)return;var it=items[Number(b.dataset.i)];closeMenu();if(it&&it.pick)it.pick();
      });
      m.addEventListener('keydown',function(e){
        var bs=[].slice.call(m.querySelectorAll('.qd-mi')),i=bs.indexOf(document.activeElement);
        if(e.key==='Escape'){e.stopPropagation();closeMenu()}
        else if(e.key==='ArrowDown'){e.preventDefault();(bs[i+1]||bs[0]).focus()}
        else if(e.key==='ArrowUp'){e.preventDefault();(bs[i-1]||bs[bs.length-1]).focus()}
        else if(e.key==='Tab'){e.preventDefault();var j=e.shiftKey?i-1:i+1;(bs[j]||(e.shiftKey?bs[bs.length-1]:bs[0])).focus()}
      });
      var out=function(e){if(menuEl&&!menuEl.contains(e.target)&&e.target!==anchor&&!anchor.contains(e.target))closeMenu()};
      setTimeout(function(){document.addEventListener('pointerdown',out,true)},0);
      menuOff=function(){document.removeEventListener('pointerdown',out,true)};
      var f=m.querySelector('.qd-mi');if(f)f.focus({preventScroll:true});
      return m;
    }
    function addMenu(ty,t,anchor){
      if(ty.pick){ty.pick(inst,anchor);return}
      menu(anchor,ty.presets.map(function(p){return{label:p.label,sub:p.sub,icon:p.icon||ty.icon,pick:function(){addNode(t,Object.assign({},p.props||{}),{edit:ty.presetEdit!==false&&!(p.props&&p.props.noedit),jitter:jit()})}}}),ty.addLabel||('Adicionar '+ty.label));
    }
    var jn=0;function jit(){jn=(jn+1)%6;return{x:jn*GRID,y:jn*GRID}}

    /* ---------- gestos ---------- */
    var P={},G=null,ptrType='mouse';
    function nPtr(){return Object.keys(P).length}
    function nodeOf(t){var e=t&&t.closest?t.closest('.qd-n'):null;return e?e.dataset.id:null}
    function onDown(e){
      if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;
      var t=e.target;
      if(t.closest&&t.closest('.qd-ui,.qd-edit,.qd-li'))return;
      ptrType=e.pointerType||'mouse';
      cancelAnimationFrame(anim);
      if(editing)commitEdit();if(editingL)commitLabel();
      closeMenu();
      P[e.pointerId]={x:e.clientX,y:e.clientY};
      if(nPtr()===2){startPinch();return}
      if(nPtr()>2)return;
      try{stage.setPointerCapture(e.pointerId)}catch(x){}
      var anc=t.closest('.qd-anc'),rsz=t.closest('.qd-rsz'),nid=nodeOf(t),cEl=t.closest('[data-cid]'),w=toWorld(e.clientX,e.clientY);
      var base={pid:e.pointerId,sx:e.clientX,sy:e.clientY,wx:w.x,wy:w.y,moved:false,shift:e.shiftKey||e.ctrlKey||e.metaKey,target:t};
      if(anc&&!isRO()){
        var id=ov.dataset.id;if(!id||!doc.nodes[id])return;
        G=Object.assign(base,{type:'link',from:id,side:anc.dataset.s});stage.classList.add('linking');e.preventDefault();return;
      }
      if(rsz&&!isRO()){
        var rid_=ov.dataset.id,n=doc.nodes[rid_];if(!n)return;
        open_();capN(rid_);
        G=Object.assign(base,{type:'resize',id:rid_,w0:n.w,h0:n.h});e.preventDefault();return;
      }
      if(nid&&doc.nodes[nid]){
        var tap=false;
        if(base.shift){var i=sel.indexOf(nid);var ns=sel.slice();if(i>=0)ns.splice(i,1);else ns.push(nid);setSel(ns,null)}
        else if(sel.indexOf(nid)<0||selC){setSel([nid],null)}
        else tap=true;
        var ids=sel.slice();
        if(ids.indexOf(nid)>=0){
          /* mover um frame leva o que está dentro */
          var extra=[];ids.forEach(function(k){if(types[doc.nodes[k].t].container)extra=extra.concat(inside(k))});
          extra.forEach(function(k){if(ids.indexOf(k)<0)ids.push(k)});
        }
        G=Object.assign(base,{type:'node',id:nid,ids:ids,tapReduce:tap&&!base.shift,orig:{}});
        ids.forEach(function(k){G.orig[k]={x:doc.nodes[k].x,y:doc.nodes[k].y}});
        if(!isRO()){open_();ids.forEach(capN)}
        stage.classList.add('dragging-n');
        return;
      }
      if(cEl&&doc.conns[cEl.dataset.cid]){
        G=Object.assign(base,{type:'conn',id:cEl.dataset.cid});setSel([],cEl.dataset.cid);return;
      }
      /* fundo */
      if(e.button===1){G=Object.assign(base,{type:'pan',vx:V.x,vy:V.y});stage.classList.add('panning');return}
      if(boxMode||base.shift){G=Object.assign(base,{type:'marq',add:base.shift&&!boxMode?true:base.shift});marq.hidden=false;placeMarq(e);return}
      G=Object.assign(base,{type:'pan',vx:V.x,vy:V.y});stage.classList.add('panning');
    }
    function inside(fid){
      var f=doc.nodes[fid],out=[];
      Object.keys(doc.nodes).forEach(function(k){
        if(k===fid)return;var n=doc.nodes[k],cx=n.x+n.w/2,cy=n.y+n.h/2;
        if(types[n.t].container&&n.w*n.h>=f.w*f.h)return;
        if(cx>=f.x&&cx<=f.x+f.w&&cy>=f.y&&cy<=f.y+f.h)out.push(k);
      });
      return out;
    }
    function placeMarq(e){
      var r=stage.getBoundingClientRect(),x1=G.sx-r.left,y1=G.sy-r.top,x2=e.clientX-r.left,y2=e.clientY-r.top;
      marq.style.transform='translate3d('+Math.min(x1,x2)+'px,'+Math.min(y1,y2)+'px,0)';marq.style.width=Math.abs(x2-x1)+'px';marq.style.height=Math.abs(y2-y1)+'px';
    }
    function onMove(e){
      if(P[e.pointerId]){P[e.pointerId].x=e.clientX;P[e.pointerId].y=e.clientY}
      if(!G){
        if(e.pointerType==='mouse'&&!destroyed){
          var t=e.target,id=nodeOf(t);
          if(!id&&t.closest&&t.closest('.qd-ov'))id=hoverId;
          if(id!==hoverId){hoverId=id;need.ctx=true;sched()}
        }
        return;
      }
      if(G.type==='pinch'){doPinch();return}
      if(e.pointerId!==G.pid)return;
      var dx=e.clientX-G.sx,dy=e.clientY-G.sy;
      if(!G.moved&&Math.hypot(dx,dy)>(ptrType==='touch'?8:4))G.moved=true;
      if(!G.moved&&G.type!=='resize')return;
      if(G.type==='pan'){V.x=G.vx+dx;V.y=G.vy+dy;bumpView()}
      else if(G.type==='node'){
        if(isRO()){G.moved=false;return}
        var k=V.k,ddx=dx/k,ddy=dy/k,pr=G.orig[G.id];
        if(snapOn){ddx=snapV(pr.x+ddx)-pr.x;ddy=snapV(pr.y+ddy)-pr.y}
        G.ids.forEach(function(id){var n=doc.nodes[id],o2=G.orig[id];n.x=o2.x+ddx;n.y=o2.y+ddy;var d=nodeEls[id];if(d)d.style.transform='translate3d('+n.x+'px,'+n.y+'px,0)';dirtyConnsOf(id)});
        need.ctx=need.mini=true;sched();ctx.hidden=true;ov.hidden=true;
      }
      else if(G.type==='resize'){
        var n2=doc.nodes[G.id],ty=types[n2.t],w=Math.max(ty.minW||60,G.w0+dx/V.k),h=Math.max(ty.minH||40,G.h0+dy/V.k);
        n2.w=snapOn?Math.max(ty.minW||60,Math.round(w/GRID)*GRID):w;n2.h=snapOn?Math.max(ty.minH||40,Math.round(h/GRID)*GRID):h;
        paintNode(n2);dirtyConnsOf(G.id);need.ctx=need.mini=true;sched();
      }
      else if(G.type==='link'){drawTmpLink(e)}
      else if(G.type==='marq'){placeMarq(e);marqSelect(e)}
    }
    function marqSelect(e){
      var a=toWorld(G.sx,G.sy),b=toWorld(e.clientX,e.clientY),x1=Math.min(a.x,b.x),y1=Math.min(a.y,b.y),x2=Math.max(a.x,b.x),y2=Math.max(a.y,b.y),ids=[];
      Object.keys(doc.nodes).forEach(function(id){var n=doc.nodes[id];if(n.x<x2&&n.x+n.w>x1&&n.y<y2&&n.y+n.h>y1)ids.push(id)});
      if(G.add){G.base=G.base||sel.slice();ids=G.base.concat(ids.filter(function(i){return G.base.indexOf(i)<0}))}
      setSel(ids,null,true);
    }
    function targetSide(n,p){
      var dx=(p.x-(n.x+n.w/2))/(n.w/2),dy=(p.y-(n.y+n.h/2))/(n.h/2);
      return Math.abs(dx)>Math.abs(dy)?(dx>0?'e':'w'):(dy>0?'s':'n');
    }
    var tmpPath=null;
    function drawTmpLink(e){
      var n=doc.nodes[G.from];if(!n)return;
      var p1=anchorPt(n,G.side),w=toWorld(e.clientX,e.clientY),el=document.elementFromPoint(e.clientX,e.clientY),tid=nodeOf(el),ct=ctypes[connType],s2=null;
      if(tid&&tid!==G.from&&doc.nodes[tid]){var tn=doc.nodes[tid];s2=targetSide(tn,w);w=anchorPt(tn,s2)}
      Object.keys(nodeEls).forEach(function(id){nodeEls[id].classList.toggle('drop',id===tid&&tid!==G.from)});
      var route=ct.route||'bezier',geo=route==='ortho'?orthoGeo(p1,G.side,w,s2):bezGeo(p1,G.side,w,s2);
      if(!tmpPath){tmpPath=svgEl('path',{'class':'qd-tmp'});gT.appendChild(tmpPath)}
      tmpPath.setAttribute('d',geo.d);tmpPath.style.setProperty('--cc',ct.color||'var(--text)');tmpPath.style.setProperty('--cd',ct.dash||'6 6');
      G.tid=tid&&tid!==G.from?tid:null;G.ts=s2;
    }
    function onUp(e){
      var had=!!P[e.pointerId];delete P[e.pointerId];
      if(!G){return}
      if(G.type==='pinch'){if(nPtr()<2){G=null;stage.classList.remove('panning')}return}
      if(e.pointerId!==G.pid)return;
      var g=G;G=null;
      try{stage.releasePointerCapture(e.pointerId)}catch(x){}
      stage.classList.remove('panning','linking','dragging-n');marq.hidden=true;
      Object.keys(nodeEls).forEach(function(id){nodeEls[id].classList.remove('drop')});
      if(tmpPath){tmpPath.remove();tmpPath=null}
      if(g.type==='node'){
        if(g.moved){
          g.ids.forEach(function(id){var d=doc.nodes[id];if(d)dirtyConnsOf(id)});
          close_();live(L.moved);
        }else{
          rec=null; /* nada mudou */
          if(g.tapReduce&&!g.shift)setSel([g.id],null);
          handleTap(g,e);
        }
        placeCtxSoon();
      }
      else if(g.type==='resize'){close_();need.ctx=true;sched()}
      else if(g.type==='link'){
        if(g.tid&&g.moved){
          var tn=doc.nodes[g.tid],s2=g.ts||targetSide(tn,toWorld(e.clientX,e.clientY));
          var c=addConn(g.from,g.side,g.tid,s2,connType);
          if(c){setSel([],c.id);live(L.linkMade)}
        }else if(!g.moved){/* toque no ponto: só seleciona o nó */}
      }
      else if(g.type==='conn'){
        var now=Date.now();
        if(!g.moved){if(lastTap.id==='c'+g.id&&now-lastTap.t<340){lastTap={id:'',t:0};editLabel(g.id)}else lastTap={id:'c'+g.id,t:now}}
      }
      else if(g.type==='marq'){setSel(sel.slice(),null)}
      else if(g.type==='pan'){
        if(!g.moved){
          var nowp=Date.now();
          if(lastTap.id==='bg'&&nowp-lastTap.t<340&&!isRO()&&o.dblAdd){lastTap={id:'',t:0};var w=toWorld(e.clientX,e.clientY);addNode(o.dblAdd,{},{at:w,edit:true})}
          else{lastTap={id:'bg',t:nowp};setSel([],null)}
        }
        saveViewSoon();
      }
    }
    function placeCtxSoon(){need.ctx=true;sched()}
    function handleTap(g,e){
      var n=doc.nodes[g.id];if(!n)return;
      var act=g.target.closest&&g.target.closest('[data-qd-act]');
      var ty=types[n.t],now=Date.now();
      if(linkPick){finishLinkPick(g.id);return}
      if(act&&act.dataset.qdAct==='open'&&ty.onOpen){ty.onOpen(n,inst);return}
      if(lastTap.id===g.id&&now-lastTap.t<340){
        lastTap={id:'',t:0};
        if(ty.onOpen&&(ty.noEdit||isRO()))ty.onOpen(n,inst);else if(!isRO()&&!ty.noEdit)edit(g.id);else if(ty.onOpen)ty.onOpen(n,inst);
      }else lastTap={id:g.id,t:now};
      var d=nodeEls[g.id];if(d&&document.activeElement!==d)try{d.focus({preventScroll:true})}catch(x){}
    }
    function onCancel(e){delete P[e.pointerId];if(G&&(G.pid===e.pointerId||G.type==='pinch')){if(G.type==='node'&&rec){var r=rec;Object.keys(r.n).forEach(function(id){if(r.n[id]&&doc.nodes[id]){doc.nodes[id].x=r.n[id].x;doc.nodes[id].y=r.n[id].y;if(nodeEls[id])paintNode(doc.nodes[id])}});rec=null;need.all=true;sched()}G=null;stage.classList.remove('panning','linking','dragging-n');marq.hidden=true;if(tmpPath){tmpPath.remove();tmpPath=null}}}
    /* pinça */
    function startPinch(){
      if(G&&G.type==='node'&&G.moved){G.ids.forEach(function(id){});close_()}else if(rec&&G&&(G.type==='node'||G.type==='resize')){rec=null}
      if(tmpPath){tmpPath.remove();tmpPath=null}marq.hidden=true;
      var ps=Object.keys(P).map(function(k){return P[k]}),a=ps[0],b=ps[1];
      G={type:'pinch',d0:Math.hypot(b.x-a.x,b.y-a.y)||1,c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},V0:{x:V.x,y:V.y,k:V.k}};
      stage.classList.add('panning');
    }
    function doPinch(){
      var ps=Object.keys(P).map(function(k){return P[k]});if(ps.length<2)return;
      var a=ps[0],b=ps[1],d=Math.hypot(b.x-a.x,b.y-a.y)||1,c={x:(a.x+b.x)/2,y:(a.y+b.y)/2},r=stage.getBoundingClientRect();
      var k=clamp(G.V0.k*d/G.d0,KMIN,KMAX),p0x=G.c0.x-r.left,p0y=G.c0.y-r.top,wx=(p0x-G.V0.x)/G.V0.k,wy=(p0y-G.V0.y)/G.V0.k;
      V.k=k;V.x=(c.x-r.left)-wx*k;V.y=(c.y-r.top)-wy*k;bumpView();
    }
    function onWheel(e){
      if(e.target.closest&&e.target.closest('.qd-ui'))return;
      e.preventDefault();
      var dy=e.deltaMode===1?e.deltaY*16:e.deltaY;
      zoomAt(e.clientX,e.clientY,V.k*Math.exp(-dy*(e.ctrlKey?.01:.0016)));
    }
    function onDbl(e){e.preventDefault()}

    /* ---------- ligação por teclado ---------- */
    function startLinkPick(){
      if(isRO()||sel.length!==1)return;
      linkPick={from:sel[0]};stage.classList.add('linkpick');live(L.linkHint);say(L.linkHint);
    }
    function finishLinkPick(toId){
      var lp=linkPick;linkPick=null;stage.classList.remove('linkpick');if(!lp)return;
      if(toId===lp.from||!doc.nodes[toId])return;
      var a=doc.nodes[lp.from],b=doc.nodes[toId],ca={x:a.x+a.w/2,y:a.y+a.h/2},cb2={x:b.x+b.w/2,y:b.y+b.h/2};
      var c=addConn(lp.from,targetSide(a,cb2),toId,targetSide(b,ca),connType);
      if(c){setSel([],c.id);live(L.linkMade)}
    }

    /* ---------- teclado ---------- */
    var arrowT=0,arrowRec=null;
    function onKey(e){
      var tg=e.target,inUI=tg.closest&&tg.closest('.qd-ui');
      if(tg.tagName==='TEXTAREA'||(tg.tagName==='INPUT'&&!inUI))return;
      var mod=e.ctrlKey||e.metaKey,k=e.key;
      if(mod&&(k==='z'||k==='Z')){e.preventDefault();e.shiftKey?redo():undo();return}
      if(mod&&(k==='y'||k==='Y')){e.preventDefault();redo();return}
      if(inUI)return;
      if(mod&&(k==='d'||k==='D')){e.preventDefault();duplicate();return}
      if(mod&&(k==='a'||k==='A')){e.preventDefault();selectAll();return}
      if(mod)return;
      if(k==='Escape'){
        if(linkPick){linkPick=null;stage.classList.remove('linkpick');e.stopPropagation();return}
        if(sel.length||selC){setSel([],null);e.stopPropagation();stage.focus({preventScroll:true})}
        return;
      }
      if(k==='Delete'||k==='Backspace'){
        if(selC||sel.length){e.preventDefault();var i=sel.indexOf(doc.nodes[sel[0]]?sel[0]:'');removeIds(sel.slice(),selC);setSel([],null);stage.focus({preventScroll:true})}
        return;
      }
      if(k==='Enter'){
        if(linkPick&&sel.length===1){e.preventDefault();finishLinkPick(sel[0]);return}
        if(selC){e.preventDefault();editLabel(selC);return}
        if(sel.length===1){var n=doc.nodes[sel[0]],ty=types[n.t];e.preventDefault();if(ty.onOpen&&(ty.noEdit||isRO()))ty.onOpen(n,inst);else if(!isRO()&&!ty.noEdit)edit(n.id);else if(ty.onOpen)ty.onOpen(n,inst)}
        return;
      }
      if(k==='c'||k==='C'){if(sel.length===1){e.preventDefault();startLinkPick()}return}
      if(k==='+'||k==='='){e.preventDefault();zoomCenter(V.k*1.2);return}
      if(k==='-'||k==='_'){e.preventDefault();zoomCenter(V.k/1.2);return}
      if(k==='0'){e.preventDefault();animateTo({x:V.x,y:V.y,k:1},0);return}
      var ar={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
      if(ar){
        if(!sel.length||isRO()){ /* sem seleção: rola o quadro */
          V.x-=ar[0]*60;V.y-=ar[1]*60;bumpView();e.preventDefault();return}
        e.preventDefault();
        var step=e.shiftKey?GRID*5:GRID/2,ids=sel.slice();
        if(!arrowRec){arrowRec=true;open_();ids.forEach(capN)}
        ids.forEach(function(id){var n=doc.nodes[id];n.x+=ar[0]*step;n.y+=ar[1]*step;paintNode(n);dirtyConnsOf(id)});
        need.ctx=need.mini=true;sched();
        clearTimeout(arrowT);arrowT=setTimeout(function(){if(arrowRec){arrowRec=null;close_();live(L.moved)}},500);
      }
    }
    function onFocusIn(e){
      if(G)return;
      var id=nodeOf(e.target);
      if(id&&e.target.classList&&e.target.classList.contains('qd-n')){
        if(linkPick){return}
        if(!(sel.length===1&&sel[0]===id&&!selC))setSel([id],null);
        try{if(e.target.matches(':focus-visible'))ensureVisible(id)}catch(x){}
      }else{
        var cE=e.target.closest&&e.target.closest('.qd-c');
        if(cE&&cE.dataset.cid&&selC!==cE.dataset.cid){setSel([],cE.dataset.cid);try{if(cE._mid){measure();var sx=cE._mid.x*V.k+V.x,sy=cE._mid.y*V.k+V.y;if(sx<24||sy<24||sx>stageW-24||sy>stageH-24)animateTo({x:stageW/2-cE._mid.x*V.k,y:stageH/2-cE._mid.y*V.k,k:V.k},180)}}catch(x){}}
      }
    }

    /* ---------- barra de controles / elementos ---------- */
    function onUI(e){
      var b=e.target.closest('[data-q],[data-ca]');if(!b||!root.contains(b))return;
      if(b.dataset.ca){ctxAct(b);return}
      var q=b.dataset.q;
      switch(q){
        case 'undo':undo();break;case 'redo':redo();break;
        case 'zin':zoomCenter(V.k*1.25);break;case 'zout':zoomCenter(V.k/1.25);break;
        case 'z100':animateTo({x:V.x+(stageW/2-V.x)*(1-1/V.k),y:V.y+(stageH/2-V.y)*(1-1/V.k),k:1},0);break;
        case 'fit':fitTo(bbox(),260);break;
        case 'snap':snapOn=!snapOn;b.setAttribute('aria-pressed',snapOn?'true':'false');var _l=snapOn?L.snapOn:L.snapOff;b.setAttribute('aria-label',_l);b.title=_l;b.classList.toggle('on',snapOn);live(_l);break;
        case 'box':boxMode=!boxMode;b.setAttribute('aria-pressed',boxMode?'true':'false');b.classList.toggle('on',boxMode);stage.classList.toggle('boxmode',boxMode);b.setAttribute('aria-label',boxMode?L.pan:L.box);b.title=boxMode?L.pan:L.box;live(boxMode?L.box:L.pan);break;
        case 'tpl':templatesMenu(b);break;
        case 'ctype':connType=b.dataset.v;[].forEach.call(top.querySelectorAll('.qd-cb'),function(x){x.setAttribute('aria-pressed',x.dataset.v===connType?'true':'false');x.classList.toggle('on',x.dataset.v===connType)});break;
        case 'add':var ty=types[b.dataset.t];if(!ty||isRO())break;if(ty.presets||ty.pick)addMenu(ty,b.dataset.t,b);else addNode(b.dataset.t,{},{edit:true,jitter:jit()});break;
        case 'retry':load();break;
      }
    }
    function ctxAct(b){
      var a=b.dataset.ca,v=b.dataset.v;
      if(a==='del'){removeIds(sel.slice());setSel([],null);stage.focus({preventScroll:true})}
      else if(a==='dup')duplicate();
      else if(a==='front')toFront();
      else if(a==='edit'&&sel[0])edit(sel[0]);
      else if(a==='open'&&sel[0]){var n=doc.nodes[sel[0]];if(n&&types[n.t].onOpen)types[n.t].onOpen(n,inst)}
      else if(a==='color'&&sel.length===1)updNode(sel[0],{color:v});
      else if(a==='ctype'&&selC)updConn(selC,{t:v});
      else if(a==='ccol'&&selC)updConn(selC,{color:v});
      else if(a==='croute'&&selC){var c=doc.conns[selC],ct=ctypes[c.t],cur=c.route||ct.route||'bezier';updConn(selC,{route:cur==='ortho'?'bezier':'ortho'})}
      else if(a==='clabel'&&selC)editLabel(selC);
      else if(a==='cdel'){removeIds([],selC);setSel([],null);stage.focus({preventScroll:true})}
      need.ctx=true;sched();
    }

    /* ---------- templates ---------- */
    function templatesMenu(anchor){
      menu(anchor,(o.templates||[]).map(function(t){return{label:t.label,sub:t.desc,icon:t.icon||UI.tpl,pick:function(){applyTemplate(t.id)}}}),L.tplTitle);
    }
    function applyTemplate(id,opt){
      var tpl=null;(o.templates||[]).forEach(function(t){if(t.id===id)tpl=t});
      if(!tpl||isRO())return false;
      if(Object.keys(doc.nodes).length&&!(opt&&opt.force)&&!confirmFn(L.tplConfirm))return false;
      var b=tpl.build({types:types,conns:ctypes});if(!b||!b.nodes||!b.nodes.length)return false;
      if(Object.keys(doc.nodes).length+b.nodes.length>MAXN){say(L.nodeMax);return false}
      var a=1e9,bb=1e9,c=-1e9,d=-1e9;
      b.nodes.forEach(function(n){var ty=types[n.t]||{};var w=n.w||ty.w||160,h=n.h||ty.h||100;a=Math.min(a,n.x);bb=Math.min(bb,n.y);c=Math.max(c,n.x+w);d=Math.max(d,n.y+h)});
      var ctr=centerWorld(),ox=snapV(ctr.x-(a+c)/2),oy=snapV(ctr.y-(bb+d)/2),map={},ids=[];
      run(function(){
        var z=nextZ();
        b.nodes.forEach(function(n){
          var ty=types[n.t];if(!ty)return;
          var nd=norm.n({id:rid('n'),t:n.t,x:n.x+ox,y:n.y+oy,w:n.w||ty.w,h:n.h||ty.h,z:ty.container?-1:z++,text:n.text||'',color:n.color,d:n.d});
          if(!nd)return;map[n.k]=nd.id;capN(nd.id);doc.nodes[nd.id]=nd;ids.push(nd.id);
        });
        (b.conns||[]).forEach(function(k){
          if(!map[k.a]||!map[k.b])return;
          var cc=norm.c({id:rid('k'),from:{n:map[k.a],s:k.as||'e'},to:{n:map[k.b],s:k.bs||'w'},t:k.t||defConn,label:k.label||'',route:k.route||'',color:k.color||''});
          if(cc){capC(cc.id);doc.conns[cc.id]=cc}
        });
      });
      setSel(ids,null);
      var box=bbox(ids);measure();
      if(box){var x1=box.x*V.k+V.x,y1=box.y*V.k+V.y,x2=(box.x+box.w)*V.k+V.x,y2=(box.y+box.h)*V.k+V.y;if(x1<0||y1<0||x2>stageW||y2>stageH||V.k<.5)fitTo(box,260,1)}
      live('Modelo aplicado: '+tpl.label);
      return true;
    }

    /* ---------- minimapa ---------- */
    function resolveColor(expr,fb){
      var s=root._cs;if(!s){s=document.createElement('span');s.style.cssText='position:absolute;visibility:hidden;pointer-events:none';root.appendChild(s);root._cs=s}
      s.style.color='';s.style.color=expr;var c=getComputedStyle(s).color;return c||fb;
    }
    var mmMap=null;
    function drawMini(){
      if(!mini.offsetWidth)return;
      var dpr=Math.min(2,window.devicePixelRatio||1),cw=mini.clientWidth,ch=mini.clientHeight;
      if(mini.width!==Math.round(cw*dpr)||mini.height!==Math.round(ch*dpr)){mini.width=Math.round(cw*dpr);mini.height=Math.round(ch*dpr)}
      var g=mini.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cw,ch);
      var now=performance.now();
      if(!colC.v||now-colC.t>1500){colC.t=now;colC.v={bg:resolveColor('var(--panel2,#161b24)','#161b24'),node:resolveColor('color-mix(in srgb,var(--text,#fff) 55%,transparent)','#999'),frame:resolveColor('color-mix(in srgb,var(--text,#fff) 40%,transparent)','#888'),view:resolveColor('var(--accent,#b7d7d5)','#b7d7d5')}}
      var cl=colC.v;g.fillStyle=cl.bg;g.fillRect(0,0,cw,ch);
      measure();
      var vx=-V.x/V.k,vy=-V.y/V.k,vw=stageW/V.k,vh=stageH/V.k,bb=bbox()||{x:vx,y:vy,w:vw,h:vh};
      var x1=Math.min(bb.x,vx),y1=Math.min(bb.y,vy),x2=Math.max(bb.x+bb.w,vx+vw),y2=Math.max(bb.y+bb.h,vy+vh),pad=40;
      x1-=pad;y1-=pad;x2+=pad;y2+=pad;
      var s=Math.min(cw/(x2-x1),ch/(y2-y1)),ox=(cw-(x2-x1)*s)/2-x1*s,oy=(ch-(y2-y1)*s)/2-y1*s;
      mmMap={s:s,ox:ox,oy:oy};
      Object.keys(doc.nodes).forEach(function(id){
        var n=doc.nodes[id],ty=types[n.t];
        if(ty.container){g.strokeStyle=cl.frame;g.lineWidth=1;g.strokeRect(n.x*s+ox,n.y*s+oy,Math.max(2,n.w*s),Math.max(2,n.h*s))}
        else{var col=colorOf(n,ty);g.fillStyle=col&&col.bg?col.bg:cl.node;g.fillRect(n.x*s+ox,n.y*s+oy,Math.max(2,n.w*s),Math.max(2,n.h*s))}
      });
      g.strokeStyle=cl.view;g.lineWidth=2;g.strokeRect(vx*s+ox,vy*s+oy,Math.max(4,vw*s),Math.max(4,vh*s));
    }
    var mmDrag=false;
    function mmGo(e){
      if(!mmMap)return;var r=mini.getBoundingClientRect(),wx=(e.clientX-r.left-mmMap.ox)/mmMap.s,wy=(e.clientY-r.top-mmMap.oy)/mmMap.s;
      measure();V.x=stageW/2-wx*V.k;V.y=stageH/2-wy*V.k;bumpView();
    }
    mini.addEventListener('pointerdown',function(e){mmDrag=true;try{mini.setPointerCapture(e.pointerId)}catch(x){}mmGo(e);e.preventDefault()});
    mini.addEventListener('pointermove',function(e){if(mmDrag)mmGo(e)});
    mini.addEventListener('pointerup',function(e){mmDrag=false;try{mini.releasePointerCapture(e.pointerId)}catch(x){}});
    mini.addEventListener('pointercancel',function(){mmDrag=false});
    mini.addEventListener('keydown',function(e){var d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d){e.preventDefault();V.x-=d[0]*80;V.y-=d[1]*80;bumpView()}});
    mini.tabIndex=0;

    /* ---------- persistência ---------- */
    function schedSave(){
      if(!o.adapter||!o.adapter.save||isRO())return;
      clearTimeout(saveT);saveT=setTimeout(flush,DEB);setStatus('pend');
    }
    function takeDelta(){
      var d={nodes:[],conns:[],removed:[]};
      Object.keys(dirty.n).forEach(function(id){if(doc.nodes[id])d.nodes.push(clone(doc.nodes[id]))});
      Object.keys(dirty.c).forEach(function(id){if(doc.conns[id])d.conns.push(clone(doc.conns[id]))});
      Object.keys(dirty.r).forEach(function(id){d.removed.push({id:id,upd:dirty.r[id]})});
      return d;
    }
    function flush(){
      clearTimeout(saveT);saveT=0;
      if(destroyed||!o.adapter||!o.adapter.save||!ready)return Promise.resolve();
      if(saving){saveT=setTimeout(flush,300);return Promise.resolve()}
      var d=takeDelta();
      if(!d.nodes.length&&!d.conns.length&&!d.removed.length&&!forceSave){if(stKind==='pend')setStatus('saved');return Promise.resolve()}
      forceSave=false;
      var snapN=dirty.n,snapC=dirty.c,snapR=dirty.r;dirty={n:{},c:{},r:{}};
      saving=true;setStatus('saving');
      pruneDel();
      return Promise.resolve().then(function(){return o.adapter.save(inst.getDoc(),d,inst)}).then(function(r){
        saving=false;
        var more=Object.keys(dirty.n).length+Object.keys(dirty.c).length+Object.keys(dirty.r).length;
        if(more)schedSave();else if(r&&r.pending)setStatus('wait',r.note);else setStatus('saved');
      }).catch(function(e){
        saving=false;console.warn('[quadro] salvar',e);
        Object.assign(dirty.n,snapN);Object.assign(dirty.c,snapC);Object.keys(snapR).forEach(function(k){if(!(k in dirty.r))dirty.r[k]=snapR[k]});
        setStatus('err');clearTimeout(retryT);retryT=setTimeout(function(){schedSave()},5000);
      });
    }
    function pruneDel(){
      var ks=Object.keys(doc.del),cut=Date.now()-30*DAY;
      ks.forEach(function(k){if(doc.del[k]<cut)delete doc.del[k]});
      ks=Object.keys(doc.del);
      if(ks.length>900){ks.sort(function(a,b){return doc.del[a]-doc.del[b]}).slice(0,ks.length-900).forEach(function(k){delete doc.del[k]})}
    }
    function protectIds(){var s={};if(G&&G.ids)G.ids.forEach(function(i){s[i]=1});if(editing)s[editing.id]=1;if(G&&G.type==='resize')s[G.id]=1;if(arrowRec)sel.forEach(function(i){s[i]=1});return s}
    function mergeRemote(r,opt){
      var ch=mergeInto(doc,r,norm,protectIds(),MAXN);
      /* limpa conexões órfãs */
      Object.keys(doc.conns).forEach(function(id){var c=doc.conns[id];if(!doc.nodes[c.from.n]||!doc.nodes[c.to.n]){if(ready&&opt&&opt.persist){/* mantém: o nó pode chegar no próximo lote */}}});
      if(opt&&opt.persist){ch.n.forEach(function(id){dirty.n[id]=1});ch.c.forEach(function(id){dirty.c[id]=1});ch.r.forEach(function(id){dirty.r[id]=doc.del[id]||Date.now()});schedSave()}
      if(ch.n.length||ch.c.length||ch.r.length){syncIds(ch);if(!(opt&&opt.silent))emit('remote',ch)}
      return ch;
    }
    function setDoc(d){
      doc=newDoc();
      mergeInto(doc,d,norm,null,MAXN*2);
      Object.keys(doc.nodes).forEach(function(id){if(doc.nodes[id].upd>lastUpd)lastUpd=doc.nodes[id].upd});
      H={u:[],r:[]};dirty={n:{},c:{},r:{}};sel=[];selC=null;
      renderAll();updUndo();
    }
    function load(){
      loadErr=false;ready=false;paintLoad();setStatus('load');
      var p=o.adapter&&o.adapter.load?Promise.resolve().then(function(){return o.adapter.load(inst)}):Promise.resolve(null);
      return p.then(function(d){
        if(destroyed)return;
        setDoc(d||newDoc());ready=true;loadErr=false;paintLoad();
        var vk=o.viewKey?lsG(o.viewKey,null):null;
        if(vk&&isFinite(vk.x)&&isFinite(vk.y)&&isFinite(vk.k)){V.x=vk.x;V.y=vk.y;V.k=clamp(vk.k,KMIN,KMAX);bumpView()}
        else initialView();
        setStatus(isRO()?'ro':'saved');paintEmpty();
        if(o.adapter&&o.adapter.subscribe&&!unsub)unsub=o.adapter.subscribe(function(r,opt){mergeRemote(r,opt)},inst);
        emit('ready');if(readyRes){readyRes(inst);readyRes=null}
        flushIfDirty();
      }).catch(function(e){
        if(destroyed)return;
        console.warn('[quadro] carregar',e);loadErr=true;ready=false;paintLoad();setStatus('err');
      });
    }
    function flushIfDirty(){if(Object.keys(dirty.n).length||Object.keys(dirty.c).length||Object.keys(dirty.r).length||forceSave)schedSave()}
    function initialView(){
      measure();
      if(!stageW){need.fit=true;return}
      var b=bbox();if(b)fitTo(b,0,1);else{V.x=stageW/2;V.y=stageH/2;V.k=1;bumpView()}
    }

    /* ---------- ouvintes ---------- */
    stage.addEventListener('pointerdown',onDown);
    stage.addEventListener('pointermove',onMove);
    stage.addEventListener('pointerup',onUp);
    stage.addEventListener('pointercancel',onCancel);
    stage.addEventListener('wheel',onWheel,{passive:false});
    stage.addEventListener('dblclick',onDbl);
    stage.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!G){hoverId=null;need.ctx=true;sched()}});
    root.addEventListener('keydown',onKey);
    root.addEventListener('focusin',onFocusIn);
    root.addEventListener('click',onUI);
    root.addEventListener('contextmenu',function(e){if(G&&G.moved)e.preventDefault()});
    function onVis(){if(document.hidden)flush()}
    document.addEventListener('visibilitychange',onVis);docL.push(['visibilitychange',onVis]);
    if(window.ResizeObserver){
      ro$=new ResizeObserver(function(){
        var w=stage.clientWidth,h=stage.clientHeight;
        if(w&&h){var first=!stageW;measure();if(first&&ready&&need.fit){need.fit=false;initialView()}need.ctx=need.mini=true;sched()}
      });ro$.observe(stage);
    }

    /* ---------- API pública ---------- */
    var inst={
      el:root,stage:stage,
      attach:function(h){if(h&&root.parentNode!==h){h.appendChild(root);measure();need.view=need.all=need.ctx=need.mini=true;sched();setTimeout(function(){measure();if(need.fit&&ready){need.fit=false;initialView()}need.mini=true;sched()},60)}},
      detach:function(){commitEdit();commitLabel();closeMenu();if(root.parentNode)root.parentNode.removeChild(root)},
      focus:function(){try{stage.focus({preventScroll:true})}catch(e){}},
      destroy:function(){
        destroyed=true;clearTimeout(saveT);clearTimeout(retryT);clearTimeout(viewT);cancelAnimationFrame(raf);cancelAnimationFrame(anim);
        try{if(unsub)unsub()}catch(e){}if(ro$)ro$.disconnect();closeMenu();
        docL.forEach(function(p){document.removeEventListener(p[0],p[1])});
        if(root.parentNode)root.parentNode.removeChild(root);
      },
      load:load,whenReady:function(){if(ready)return Promise.resolve(inst);if(!readyP)readyP=new Promise(function(res,rej){readyRes=res;readyRej=rej});return readyP},
      isReady:function(){return ready},
      getDoc:function(){return{v:1,nodes:clone(doc.nodes),conns:clone(doc.conns),del:clone(doc.del)}},
      setDoc:setDoc,mergeRemote:mergeRemote,
      /* ops de jogador: [{k:'n',v:nó}|{k:'c',v:conexão}|{k:'x',id,upd}] aplicadas com persistência */
      applyOps:function(ops){
        var d={nodes:{},conns:{},del:{}};
        (Array.isArray(ops)?ops:[]).slice(0,80).forEach(function(op){
          if(!op||typeof op!=='object')return;
          if(op.k==='n'&&op.v&&op.v.id)d.nodes[op.v.id]=op.v;
          else if(op.k==='c'&&op.v&&op.v.id)d.conns[op.v.id]=op.v;
          else if(op.k==='x'&&op.id)d.del[String(op.id)]=Math.min(Number(op.upd)||Date.now(),Date.now()+60000);
        });
        return mergeRemote(d,{persist:true});
      },
      requestSave:function(){forceSave=true;schedSave();if(!o.adapter||!o.adapter.save)return;if(isRO())return;clearTimeout(saveT);saveT=setTimeout(flush,DEB)},
      flush:flush,
      nodes:function(){return Object.keys(doc.nodes).map(function(k){return clone(doc.nodes[k])})},
      conns:function(){return Object.keys(doc.conns).map(function(k){return clone(doc.conns[k])})},
      node:function(id){return doc.nodes[id]?clone(doc.nodes[id]):null},
      find:function(fn){var out=null;Object.keys(doc.nodes).forEach(function(k){if(!out&&fn(doc.nodes[k]))out=clone(doc.nodes[k])});return out},
      addNode:addNode,addConn:addConn,update:updNode,updateConn:updConn,remove:function(ids){removeIds([].concat(ids))},
      select:function(ids){setSel([].concat(ids||[]),null)},selection:function(){return sel.slice()},
      edit:edit,undo:undo,redo:redo,
      fit:function(ms){fitTo(bbox(),ms==null?260:ms)},
      centerOn:function(id){var n=doc.nodes[id];if(!n)return;measure();animateTo({x:stageW/2-(n.x+n.w/2)*V.k,y:stageH/2-(n.y+n.h/2)*V.k,k:V.k},220)},
      zoom:function(k){if(k==null)return V.k;zoomCenter(k)},view:function(){return{x:V.x,y:V.y,k:V.k}},
      setView:function(v){V.x=v.x;V.y=v.y;V.k=clamp(v.k,KMIN,KMAX);bumpView()},
      panBy:function(dx,dy){V.x+=dx;V.y+=dy;bumpView()},
      viewportCenter:centerWorld,
      applyTemplate:applyTemplate,
      menu:menu,
      refresh:function(pred){Object.keys(doc.nodes).forEach(function(k){var n=doc.nodes[k];if(!pred||pred(n)){var d=nodeEls[k];if(d)d._sig='';paintNode(n)}})},
      setReadOnly:function(v){forcedRO=!!v;root.classList.toggle('qd-ro',isRO());updUndo();need.ctx=true;sched();if(ready)setStatus(isRO()?'ro':stKind==='ro'?'saved':stKind)},
      isReadOnly:isRO,
      setStatusNote:function(k,n){setStatus(k,n)},
      on:function(n,f){(ev[n]=ev[n]||[]).push(f);return function(){ev[n]=(ev[n]||[]).filter(function(x){return x!==f})}},
      stats:function(){return{nodes:Object.keys(doc.nodes).length,conns:Object.keys(doc.conns).length,undo:H.u.length,redo:H.r.length,status:stKind}},
      types:types,connTypes:ctypes
    };
    root.classList.toggle('qd-ro',isRO());updUndo();paintLoad();
    if(o.autoload!==false)load();
    return inst;
  }

  /* API do motor: único nome público desta camada além de T3.quadro */
  T3.quadroEngine={
    version:1,create:create,merge:mergeRaw,newDoc:newDoc,
    icons:UI,connColors:CONN_COLORS,defaultLabels:DEFL
  };

  /* ======================================================================
     QUADRO DE PESQUISA (camada da campanha)
     ====================================================================== */
  function C(){try{return camp3()}catch(e){return null}}
  function cid(){var c=C();return c&&c.id||null}
  function me(){try{return uid3()||'local'}catch(e){return 'local'}}
  function gm(){try{return !!isGM6()}catch(e){return false}}
  function myName(){try{return myLabel()}catch(e){return 'Jogador'}}
  function backend(){try{return M6.backend}catch(e){return ''}}
  /* quem grava direto: o Mestre; em campanha local (sem nuvem) qualquer um */
  function direct(){return gm()||backend()==='local'}
  function toast_(m){try{toast(m)}catch(e){console.log(m)}}

  /* ---- tipos de nó ---- */
  var PI={
    note:'<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>',
    suspect:'<circle cx="12" cy="10" r="3"/><path d="M6 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M3 8V4h4M21 8V4h-4M3 16v4h4M21 16v4h-4"/>',
    entity:'<path d="M12 3l8 9-8 9-8-9z"/><circle cx="12" cy="12" r="2.5"/>',
    place:'<path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
    doc:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8 10h8M8 14h8M8 18h5"/>',
    frame:'<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 3"/><path d="M4 9h16"/>',
    text:'<path d="M5 6h14M12 6v13M9 19h6"/>',
    stamp:'<path d="M7 14h10l1 5H6zM9 14v-3a3 3 0 116 0v3"/><path d="M9 11V8a3 3 0 016 0v3"/>',
    alibi:'<circle cx="12" cy="12" r="8"/><path d="M8 8l8 8M16 8l-8 8"/>',
    oculta:'<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 20L20 4"/>',
    prio:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>'
  };
  var NOTE_COLORS=[
    {id:'ev',label:'Evidência (amarelo)',bg:'#f6e58d',fg:'#1b1d22'},
    {id:'su',label:'Suspeita (rosa)',bg:'#f5b7b1',fg:'#1b1d22'},
    {id:'hi',label:'Hipótese (azul)',bg:'#aed6f1',fg:'#1b1d22'},
    {id:'ok',label:'Confirmado (verde)',bg:'#abebc6',fg:'#1b1d22'},
    {id:'my',label:'Mistério (lilás)',bg:'#d7bde2',fg:'#1b1d22'}
  ];
  var STAMPS=[
    {v:'alibi',label:'Álibi falso',text:'[ÁLIBI FALSO]',icon:PI.alibi},
    {v:'oculta',label:'Conexão oculta',text:'[CONEXÃO OCULTA]',icon:PI.oculta},
    {v:'prio',label:'Prioridade',text:'[PRIORIDADE]',icon:PI.prio}
  ];
  function stampOf(n){var v=n.d&&n.d.v,r=null;STAMPS.forEach(function(s){if(s.v===v)r=s});return r}
  function bn(){return T3.bancada||null}
  function docLive(n){try{return n.ref&&bn()?bn().get(n.ref):null}catch(e){return null}}

  function docRender(n,d,api){
    var live=docLive(n),sn=n.snap||{},title=live?live.title:(sn.title||'Documento'),code=live?live.code:(sn.code||'—'),
      cat=live?live.cat:(sn.cat||'laudo'),st=live?live.status:(sn.status||''),B=bn(),
      catSvg=B&&B.icons.cat[cat]||PI.doc,stSvg=B&&B.icons.status[st]||'',
      cl='',sl='';
    if(B){B.categories.forEach(function(c){if(c.id===cat)cl=c.label});B.statuses.forEach(function(c){if(c.id===st)sl=c.label})}
    d.innerHTML='<div class="qd-in qd-doc">'+
      '<div class="qd-dh"><span class="qd-ni">'+ic(catSvg)+'</span><div class="qd-dm"><p class="qd-dc">'+esc(code)+(cl?' · '+esc(cl):'')+'</p><p class="qd-dt">'+esc(title)+'</p></div></div>'+
      '<div class="qd-thumb" hidden></div>'+
      '<div class="qd-df">'+(st?'<span class="qd-seal st-'+esc(st)+'">'+ic(stSvg)+esc(sl||st)+'</span>':'<span></span>')+
      '<button type="button" class="qd-open" data-qd-act="open" tabindex="-1" aria-label="Abrir o dossiê '+esc(code+' '+title)+'">Abrir dossiê</button></div>'+
      (live?'':'<p class="qd-gone">Documento indisponível para você. Mostrando só o resumo.</p>')+
    '</div>';
    if(live&&n.ref){
      var id=n.id;
      try{B.imageOf(n.ref).then(function(src){
        var th=d.querySelector('.qd-thumb');if(!th||!src||d.dataset.id!==id)return;
        var im=new Image();im.alt='';im.decoding='async';im.referrerPolicy='no-referrer';im.draggable=false;
        im.onload=function(){th.hidden=false};im.onerror=function(){th.hidden=true};
        im.src=src;th.textContent='';th.appendChild(im);
      }).catch(function(){})}catch(e){}
    }
  }
  function openDoc(n){
    var B=bn();if(!B||!n.ref)return;
    if(!B.get(n.ref)){toast_('Esse documento não está disponível para você (pode ser do Caderno de outra pessoa ou ter sido excluído).');return}
    B.show(n.ref);
  }
  function stampRender(n,d){
    var s=stampOf(n),ico=s?s.icon:PI.stamp;
    d.dataset.v=s?s.v:'custom';
    d.innerHTML='<div class="qd-in qd-stamp"><span class="qd-ni">'+ic(ico)+'</span><span class="qd-stt">'+(esc(n.text)||'<span class="qd-ph">CARIMBO</span>')+'</span></div>';
  }
  function docPick(api,anchor){
    var B=bn(),items=[];
    if(B){
      var seen={};
      ['shared','personal'].forEach(function(sc){
        (B.list(sc)||[]).forEach(function(dd){
          if(sc==='personal'&&(dd.by&&dd.by!==me()))return;
          var cat='';B.categories.forEach(function(c){if(c.id===dd.cat)cat=c.label});
          items.push({label:(dd.code||'—')+' · '+dd.title,sub:(sc==='personal'?'Caderno Pessoal':'Bancada da Campanha')+' · '+cat,icon:B.icons.cat[dd.cat]||PI.doc,
            pick:function(){pinRef({ref:{scope:sc,id:dd.id},title:dd.title,code:dd.code,cat:dd.cat,status:dd.status})}});
        });
      });
    }
    api.menu(anchor,items,'Fixar documento da Bancada');
  }
  function pinRef(doc){
    var inst=BQ.inst;if(!inst)return null;
    var ex=inst.find(function(n){return n.t==='doc'&&n.ref&&n.ref.id===doc.ref.id&&n.ref.scope===doc.ref.scope});
    if(ex){inst.select([ex.id]);inst.centerOn(ex.id);toast_('Esse documento já está no Quadro.');return ex}
    var c=inst.viewportCenter(),j=((BQ.pinN=(BQ.pinN||0)+1)%7)*20;
    var n=inst.addNode('doc',{ref:{scope:doc.ref.scope==='personal'?'personal':'shared',id:doc.ref.id},snap:{title:doc.title,code:doc.code,cat:doc.cat,status:doc.status}},{at:{x:c.x+j-60,y:c.y+j-40}});
    if(n)toast_(doc.ref.scope==='personal'?'Fixado no Quadro. É um documento do seu Caderno: os outros veem só o resumo.':'Documento fixado no Quadro.');
    return n;
  }

  var NODE_TYPES={
    note:{label:'Post-it',short:'Post-it',icon:PI.note,group:'Notas',w:180,h:140,minW:100,minH:80,resizable:true,autoH:true,colors:NOTE_COLORS,color:'ev',
      placeholder:'Escreva aqui…',addLabel:'Adicionar post-it (escolha a cor)',showIcon:false,
      presets:NOTE_COLORS.map(function(c){return{label:c.label,props:{color:c.id}}}).map(function(p,i){p.icon=PI.note;return p})},
    suspect:{label:'Suspeito',short:'Suspeito',icon:PI.suspect,group:'Cards',w:220,h:120,minW:140,minH:80,resizable:true,titleLine:true,autoH:true,placeholder:'Nome do suspeito',addLabel:'Adicionar card de suspeito'},
    entity:{label:'Entidade',short:'Entidade',icon:PI.entity,group:'Cards',w:220,h:120,minW:140,minH:80,resizable:true,titleLine:true,autoH:true,placeholder:'Nome da entidade',addLabel:'Adicionar card de entidade'},
    place:{label:'Local',short:'Local',icon:PI.place,group:'Cards',w:220,h:120,minW:140,minH:80,resizable:true,titleLine:true,autoH:true,placeholder:'Nome do local',addLabel:'Adicionar card de local'},
    doc:{label:'Documento',short:'Dossiê',icon:PI.doc,group:'Cards',w:220,h:180,minW:180,minH:120,noEdit:true,sizeInSig:false,render:docRender,pick:docPick,onOpen:function(n){openDoc(n)},openLabel:'Abrir dossiê',addLabel:'Fixar documento ou pista da Bancada'},
    frame:{label:'Zona',short:'Zona',icon:PI.frame,group:'Estrutura',w:480,h:320,minW:160,minH:120,resizable:true,container:true,titleLine:true,placeholder:'Nome da zona',maxText:120,multiline:false,addLabel:'Adicionar zona de agrupamento',
      render:function(n,d){d.innerHTML='<div class="qd-in qd-fr"><div class="qd-frt">'+ic(PI.frame)+'<span>'+(esc(splitFirst(n.text))||'<span class="qd-ph">Zona de agrupamento</span>')+'</span></div></div>'}},
    text:{label:'Texto livre',short:'Texto',icon:PI.text,group:'Estrutura',w:240,h:60,minW:80,minH:40,resizable:true,autoH:true,showIcon:false,placeholder:'Texto livre',addLabel:'Adicionar texto livre'},
    stamp:{label:'Carimbo',short:'Carimbo',icon:PI.stamp,group:'Estrutura',w:220,h:60,minW:120,minH:48,multiline:false,maxText:40,render:stampRender,
      presets:STAMPS.map(function(s){return{label:s.label,sub:s.text,icon:s.icon,props:{text:s.text,d:{v:s.v},noedit:true}}}).concat([{label:'Carimbo personalizado',sub:'Escreva o seu texto',icon:PI.stamp,props:{text:'[ANOTAÇÃO]',d:{v:'custom'}}}]),
      presetEdit:true,addLabel:'Adicionar carimbo'}
  };
  function splitFirst(t){var s=String(t||''),i=s.indexOf('\n');return i<0?s:s.slice(0,i)}

  var CONN_TYPES={
    fio:{label:'Fio Vermelho de Investigação',icon:'<path d="M4 18C9 4 15 20 20 6"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="6" r="1.6"/>',color:'#d64545',width:3,route:'bezier',arrow:'none',pins:true},
    seta:{label:'Seta de Fluxograma',icon:'<path d="M4 12h13M13 7l5 5-5 5"/>',color:'',width:2.5,route:'ortho',arrow:'end'},
    hipotese:{label:'Linha Tracejada de Hipótese',icon:'<path d="M4 18h3M10 14h3M16 10h3M19 6"/>',color:'var(--accent)',width:2.5,dash:'10 8',route:'bezier',arrow:'end'}
  };
  CONN_TYPES.seta.color='var(--text)';

  /* ---- templates ---- */
  function T_(k,t,x,y,text,extra){return Object.assign({k:k,t:t,x:x,y:y,text:text||''},extra||{})}
  function K_(a,as,b,bs,t,extra){return Object.assign({a:a,as:as,b:b,bs:bs,t:t},extra||{})}
  var TEMPLATES=[
    {id:'teia',label:'Teia de Evidências',desc:'Caso no centro, ligado por fios vermelhos a suspeitos, local e provas.',icon:CONN_TYPES.fio.icon,build:function(){return{
      nodes:[T_('c','entity',0,0,'Caso central\nO que une tudo?'),
        T_('a','suspect',-460,-220,'Suspeito A\nMotivo e álibi'),T_('b','suspect',460,-220,'Suspeito B\nMotivo e álibi'),
        T_('p','place',-460,220,'Local do crime\nO que foi encontrado?'),T_('e','note',460,220,'Evidência\nDescreva a pista',{color:'ev'}),
        T_('x','note',0,-300,'Contradição\nO que não fecha?',{color:'su'})],
      conns:[K_('c','w','a','e','fio'),K_('c','e','b','w','fio'),K_('c','s','p','e','fio'),K_('c','s','e','w','fio'),K_('c','n','x','s','fio'),K_('a','s','p','n','fio')]}}},
    {id:'fluxo',label:'Fluxograma de Hipóteses',desc:'Do fato observado às hipóteses, testes e conclusão.',icon:CONN_TYPES.seta.icon,build:function(){return{
      nodes:[T_('f','note',0,0,'Fato observado\nO que sabemos?',{color:'ev'}),
        T_('h1','note',-300,220,'Hipótese A\nO que pode explicar?',{color:'hi'}),T_('h2','note',300,220,'Hipótese B\nOutra explicação?',{color:'hi'}),
        T_('t1','note',-300,440,'Teste de A\nComo verificar?',{color:'my'}),T_('t2','note',300,440,'Teste de B\nComo verificar?',{color:'my'}),
        T_('r','note',0,660,'Conclusão\nO que ficou de pé?',{color:'ok'})],
      conns:[K_('f','s','h1','n','seta'),K_('f','s','h2','n','seta'),K_('h1','s','t1','n','hipotese'),K_('h2','s','t2','n','hipotese'),K_('t1','s','r','n','seta'),K_('t2','s','r','n','seta')]}}},
    {id:'linha',label:'Linha do Tempo Cronológica',desc:'Cinco marcos em sequência para ordenar os fatos.',icon:'<path d="M3 12h18M7 8v8M12 8v8M17 8v8"/>',build:function(){
      var ns=[T_('t','text',0,-140,'Linha do tempo',{w:360})],cs=[];
      for(var i=0;i<5;i++){ns.push(T_('m'+i,'note',i*280,0,'Marco '+(i+1)+'\nQuando? O que aconteceu?',{color:i%2?'hi':'ev'}));if(i)cs.push(K_('m'+(i-1),'e','m'+i,'w','seta',{route:'bezier'}))}
      return{nodes:ns,conns:cs}}},
    {id:'org',label:'Hierarquia / Organograma',desc:'Líder, tenentes e subordinados de uma organização.',icon:'<path d="M12 4v5M5 9h14M5 9v5M19 9v5M12 9v5M5 14v6M19 14v6"/>',build:function(){return{
      nodes:[T_('l','suspect',0,0,'Líder\nNome e papel'),T_('a','suspect',-300,220,'Tenente\nNome e papel'),T_('b','suspect',300,220,'Tenente\nNome e papel'),
        T_('a1','suspect',-520,440,'Subordinado\nNome'),T_('a2','suspect',-80,440,'Subordinado\nNome'),T_('b1','suspect',80,440,'Subordinado\nNome'),T_('b2','suspect',520,440,'Subordinado\nNome')],
      conns:[K_('l','s','a','n','seta'),K_('l','s','b','n','seta'),K_('a','s','a1','n','seta'),K_('a','s','a2','n','seta'),K_('b','s','b1','n','seta'),K_('b','s','b2','n','seta')]}}},
    {id:'mapa',label:'Mapa Mental',desc:'Tema central com quatro ramos e ideias soltas.',icon:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V4M12 14.5V20M9.5 12H4M14.5 12H20"/>',build:function(){
      var ns=[T_('c','entity',0,0,'Tema central\nQual é a ideia?')],cs=[],br=[[-480,-220,'w'],[480,-220,'e'],[-480,220,'w'],[480,220,'e']],cols=['ev','su','hi','ok'];
      br.forEach(function(b,i){
        ns.push(T_('b'+i,'note',b[0],b[1],'Ramo '+(i+1)+'\nIdeia principal',{color:cols[i]}));
        cs.push(K_('c',b[2]==='w'?'w':'e','b'+i,b[2]==='w'?'e':'w','seta',{route:'bezier',color:'#3b82c4'}));
        for(var j=0;j<2;j++){
          var lx=b[2]==='w'?b[0]-300:b[0]+300,ly=b[1]+(j?90:-90);
          ns.push(T_('l'+i+j,'note',lx,ly,'Detalhe\nAnote aqui',{color:cols[i],w:160,h:100}));
          cs.push(K_('b'+i,b[2]==='w'?'w':'e','l'+i+j,b[2]==='w'?'e':'w','seta',{route:'bezier',color:'#3b82c4'}));
        }
      });
      return{nodes:ns,conns:cs}}}
  ];

  /* ---- estado da camada ---- */
  var DAY_=864e5;
  var BQ={inst:null,camp:null,A:null,host:null,pinN:0};
  var INFL={};
  function mkAdapter(){
    var A={done:[],cb:null,pending:0,pt:0};
    function key(){return 'tulpa_quad_r_'+cid()+'_'+me()}
    function ovl(){var v=lsG(key(),null);return{v:1,nodes:v&&v.nodes||{},conns:v&&v.conns||{},del:v&&v.del||{}}}
    function ovlSet(x){lsS(key(),x)}
    /* mescla o registro com o que este jogador ainda espera que o Mestre aplique; limpa o que já foi confirmado */
    A.reconcile=function(remote){
      var ov=ovl(),r=remote&&typeof remote==='object'?remote:{nodes:{},conns:{},del:{}},now=Date.now(),cnt=0;
      ['nodes','conns'].forEach(function(f){
        Object.keys(ov[f]).forEach(function(id){
          var x=ov[f][id],rx=(r[f]||{})[id],tomb=Number((r.del||{})[id])||0,u=Number(x&&x.upd)||0;
          if((rx&&(Number(rx.upd)||0)>=u)||tomb>=u||now-u>3*DAY_)delete ov[f][id];else cnt++;
        });
      });
      Object.keys(ov.del).forEach(function(id){var ts=Number(ov.del[id])||0,tomb=Number((r.del||{})[id])||0;if(tomb>=ts||now-ts>3*DAY_)delete ov.del[id];else cnt++});
      ovlSet(ov);A.pending=cnt;
      return T3.quadroEngine.merge(r,ov);
    };
    A.note=function(){
      var i=BQ.inst;if(!i||!i.isReady())return;
      if(direct())return;
      if(A.pending>0)i.setStatusNote('wait',A.pending+(A.pending===1?' alteração aguardando':' alterações aguardando')+' o Mestre');
      else if(i.stats().status==='wait')i.setStatusNote('saved');
    };
    A.load=function(){
      return stGet6('quadro').then(function(v){
        if(direct()){A.done=v&&Array.isArray(v.done)?v.done.slice(-800):[];return v}
        var m=A.reconcile(v);A.pending=A.pending||0;return m;
      });
    };
    A.save=function(doc,delta,inst){
      if(direct()){
        return stGet6('quadro').catch(function(){return null}).then(function(v){
          if(v&&typeof v==='object')inst.mergeRemote(v,{silent:true});
          var snap=inst.getDoc();snap.done=A.done.slice(-800);
          return stPut6('quadro','quadro',snap);
        }).then(function(){try{cast6({t:'quadro',rev:Date.now()})}catch(e){}return{}});
      }
      var ov=ovl(),ops=[];
      delta.nodes.forEach(function(n){ov.nodes[n.id]=n;delete ov.del[n.id];ops.push({k:'n',v:n})});
      delta.conns.forEach(function(c){ov.conns[c.id]=c;delete ov.del[c.id];ops.push({k:'c',v:c})});
      delta.removed.forEach(function(r){delete ov.nodes[r.id];delete ov.conns[r.id];ov.del[r.id]=r.upd;ops.push({k:'x',id:r.id,upd:r.upd})});
      ovlSet(ov);
      var cnt=Object.keys(ov.nodes).length+Object.keys(ov.conns).length+Object.keys(ov.del).length;A.pending=cnt;
      var p=Promise.resolve();
      for(var i=0;i<ops.length;i+=25){(function(chunk){p=p.then(function(){return sendReq(chunk)})})(ops.slice(i,i+25))}
      return p.then(function(){return{pending:true,note:cnt+(cnt===1?' alteração aguardando':' alterações aguardando')+' o Mestre'}});
    };
    A.subscribe=function(cb){A.cb=cb;return function(){A.cb=null}};
    A.pull=function(){
      clearTimeout(A.pt);
      A.pt=setTimeout(function(){
        if(!A.cb)return;
        stGet6('quadro').then(function(v){
          if(!A.cb||!v)return;
          A.cb(direct()?v:A.reconcile(v));A.note();
        }).catch(function(e){console.warn('[quadro] ler',e)});
      },150);
    };
    return A;
  }
  function sendReq(ops){
    var c=C();
    if(!c||typeof sb!=='function'||!sb())return Promise.reject(new Error('Abra uma campanha conectada.'));
    var row={campaign_id:c.id,character_id:null,character_name:myName(),roller_id:me(),roller_label:myName(),
      skill:'Quadro',attribute:null,dice:[],bonus:0,total:0,detail:{cmb:'quadroreq',req:'q-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ops:ops}};
    return sb().from('campaign_rolls').insert(row).then(function(r){if(r&&r.error)throw r.error;return true});
  }

  function ensure(){
    var c=cid();if(!c||!window.T3||!T3.quadroEngine)return null;
    if(BQ.inst&&BQ.camp===c)return BQ.inst;
    if(BQ.inst){try{BQ.inst.destroy()}catch(e){}BQ.inst=null}
    BQ.camp=c;BQ.A=mkAdapter();
    var A=BQ.A;
    BQ.inst=T3.quadroEngine.create(null,{
      id:'pesquisa',title:'Quadro de Pesquisa',nodeTypes:NODE_TYPES,connTypes:CONN_TYPES,defaultConn:'fio',templates:TEMPLATES,
      adapter:{load:A.load,save:A.save,subscribe:A.subscribe},
      readOnly:function(){return !cid()},dblAdd:'note',viewKey:'tulpa_quad_v_'+c+'_'+me(),maxNodes:600,
      toast:toast_
    });
    BQ.inst.on('ready',function(){A.note()});
    setTimeout(function(){try{BQ.inst&&BQ.inst.refresh(function(n){return n.t==='doc'})}catch(e){}},1500);
    return BQ.inst;
  }
  function mount(host){
    if(!host)return;
    var inst=ensure();if(!inst)return;
    inst.attach(host);
    if(!inst.isReady())inst.load();
    inst.refresh(function(n){return n.t==='doc'});
    setTimeout(function(){inst.focus()},80);
    if(gm())scanReqs();
  }

  /* ---- Mestre aplica os pedidos ---- */
  function applyReq(row){
    var dt=row&&row.detail;
    if(!dt||dt.cmb!=='quadroreq'||!gm()||!row.id)return Promise.resolve();
    if(INFL[row.id])return Promise.resolve();
    if(row.created_at&&Date.now()-Date.parse(row.created_at)>14*DAY_)return Promise.resolve();
    var inst=ensure();if(!inst)return Promise.resolve();
    if(BQ.A.done.indexOf(row.id)>=0&&inst.isReady())return Promise.resolve();
    INFL[row.id]=1;
    var wait=Promise.race([inst.whenReady(),new Promise(function(_,rej){setTimeout(function(){rej(new Error('quadro não carregou'))},15000)})]);
    return wait.then(function(){
      if(BQ.A.done.indexOf(row.id)>=0)return;
      inst.applyOps(dt.ops);
      BQ.A.done.push(row.id);if(BQ.A.done.length>800)BQ.A.done=BQ.A.done.slice(-800);
      inst.requestSave();
    }).catch(function(e){console.warn('[quadro] pedido',e)}).then(function(){delete INFL[row.id]});
  }
  function scanReqs(){
    var c=cid();
    if(!gm()||!c||typeof sb!=='function'||!sb()||typeof cloud6!=='function'||!cloud6())return Promise.resolve();
    return sb().from('campaign_rolls').select('*').eq('campaign_id',c).eq('detail->>cmb','quadroreq').order('created_at',{ascending:false}).limit(300).then(function(r){
      if(!r||r.error||!Array.isArray(r.data))return;
      var p=Promise.resolve();
      r.data.slice().reverse().forEach(function(row){p=p.then(function(){return applyReq(row)})});
      return p;
    }).catch(function(e){console.warn('[quadro] ler pedidos',e)});
  }

  /* ---- ligações com a Bancada e a mesa ---- */
  window.addEventListener('tulpa:bancada-view',function(e){
    var d=e.detail||{};
    if(d.view==='quadro')mount(d.host);
    else if(BQ.inst)BQ.inst.detach();
  });
  window.addEventListener('tulpa:bancada-pin',function(e){
    var d=e.detail&&e.detail.doc;
    if(!d||!d.ref||!cid()||!T3.bancada)return;
    e.preventDefault();
    var inst=ensure();if(!inst)return;
    T3.bancada.open(undefined,'quadro');
    inst.whenReady().then(function(){pinRef(d)}).catch(function(){toast_('O Quadro ainda não carregou. Tente de novo em instantes.')});
  });
  function pull(){if(BQ.A&&BQ.inst)BQ.A.pull()}
  if(typeof onStoreChange6==='function'){
    var _osc=onStoreChange6;
    onStoreChange6=function(p){
      var out=_osc.apply(this,arguments);
      try{var r=p&&p.new&&Object.keys(p.new).length?p.new:null,k=r?(r.key||r.item_key||''):'';if(r&&/(^|~)quadro$/.test(String(k)))pull()}catch(e){console.warn('[quadro] store',e)}
      return out;
    };
  }
  try{M6.hooks.cast.push(function(p){if(p&&p.t==='quadro'&&p.from!==me())pull()})}catch(e){}
  window.addEventListener('tulpa:sync',function(){pull()});
  if(typeof processRow==='function'){
    var _pr=processRow;
    processRow=function(row,live){
      var out=_pr.apply(this,arguments);
      try{if(row&&row.detail&&row.detail.cmb==='quadroreq'&&gm())applyReq(row)}catch(e){console.warn('[quadro] linha',e)}
      return out;
    };
  }
  var lastCamp=null,tick=0;
  function watch(){
    var c=cid();
    if(c!==lastCamp){
      lastCamp=c;
      if(BQ.inst&&BQ.camp!==c){try{BQ.inst.destroy()}catch(e){}BQ.inst=null;BQ.A=null;BQ.camp=null}
    }else if(c&&gm()&&++tick%12===0)scanReqs();
  }
  setInterval(function(){try{watch()}catch(e){}},4000);

  T3.quadro={
    open:function(){if(T3.bancada)T3.bancada.open(undefined,'quadro')},
    instance:function(){return BQ.inst},ensure:ensure,pin:function(doc){var i=ensure();if(i)i.whenReady().then(function(){pinRef(doc)})}
  };
})();
