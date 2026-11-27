/* ==========================================================================
   TULPA RPG — Onda 1 (Bancada) · Bancada & Investigação
   Arquivo de Documentos & Pistas (dossiês): recortes, laudos, transcrições,
   manuscritos, fotos, artefatos e perfis. Dois escopos:
   - Bancada da Campanha: compartilhada, sincronizada ao vivo. Fica no registro
     `bancada` (kind `bancada`) do campaign_store. SÓ o Mestre grava (RLS): o
     jogador cria/edita/exclui o que é dele por PEDIDO (linha cmb:'bancadareq' em
     campaign_rolls, como os itens caídos) e o aparelho do Mestre aplica.
     Imagens: URL, ou (só o Mestre) upload comprimido em campaign_blobs
     (chave `bancada:<id>`). Nunca imagem em campaign_store.
   - Caderno Pessoal: privado, só neste aparelho (localStorage por campanha e
     usuário). O Mestre usa como rascunho e pode "Entregar Pista" à Bancada.
   Anotações de margem e favoritos são sempre privados (localStorage).
   Sem SQL novo. Texto rico sempre sanitizado (lista branca de tags, sem
   atributos) e todo texto do usuário é escapado antes de ir ao DOM.
   Ganchos para a Onda 2 (Quadro): evento `tulpa:bancada-pin` e T3.bancada.
   Carrega ANTES de js/61-init.js. IIFE: só publica T3.bancada.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__banc60r)return;
  window.__banc60r=true;

  /* ---------- catálogos ---------- */
  var CATS=[
    {id:'recorte',   label:'Recortes de Jornal',        svg:'<path d="M4 5h13v14H6a2 2 0 01-2-2z"/><path d="M17 8h3v9a2 2 0 01-2 2"/><path d="M7 8h7M7 11h7M7 14h4"/>'},
    {id:'laudo',     label:'Laudos & Relatórios',       svg:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8 10h8M8 14h8M8 18h5"/>'},
    {id:'audio',     label:'Transcrições de Áudio',     svg:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6"/>'},
    {id:'manuscrito',label:'Manuscritos & Diários',     svg:'<path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h10M9 8h5"/>'},
    {id:'foto',      label:'Fotografias & Evidências',  svg:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'},
    {id:'artefato',  label:'Artefatos Ocultos',         svg:'<path d="M12 3l8 9-8 9-8-9z"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v4M12 17v4"/>'},
    {id:'perfil',    label:'Perfis de Suspeitos & NPCs',svg:'<circle cx="12" cy="10" r="3"/><path d="M6 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M3 8V4h4M21 8V4h-4M3 16v4h4M21 16v4h-4"/>'}
  ];
  var STATS=[
    {id:'verificado',   label:'Verificado',   svg:'<path d="M5 12l4 4 10-10"/>'},
    {id:'suspeito',     label:'Suspeito',     svg:'<path d="M12 4v10M12 18v2"/>'},
    {id:'contraditorio',label:'Contraditório',svg:'<path d="M6 6l12 12M18 6L6 18"/>'},
    {id:'sigiloso',     label:'Sigiloso',     svg:'<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/>'}
  ];
  var ICO={
    star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    pin:'<path d="M9 3h6l-1 6 3 3H7l3-3z"/><path d="M12 12v9"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    send:'<path d="M4 12l16-8-6 16-3-7z"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function ic(p,cls){return '<svg viewBox="0 0 24 24" class="bn-ic'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false">'+p+'</svg>'}
  function catOf(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return CATS[1]}
  function statOf(id){for(var i=0;i<STATS.length;i++)if(STATS[i].id===id)return STATS[i];return null}

  var MAXH=20000,MAXTAGS=8,IMGMAX=60000; /* IMGMAX: caracteres do base64 (~45 KB reais, folga sob ~60 KB) */

  /* ---------- utilitários ---------- */
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function say(m){try{toast(m)}catch(e){console.log(m)}}
  function C(){try{return camp3()}catch(e){return null}}
  function cid(){var c=C();return c&&c.id||null}
  function me(){try{return uid3()||'local'}catch(e){return 'local'}}
  function gm(){try{return !!isGM6()}catch(e){return false}}
  function myName(){try{return myLabel()}catch(e){return 'Jogador'}}
  function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
  function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
  function lk(n){return 'tulpa_banc_'+n+'_'+cid()+'_'+me()}
  function rnd(){return 'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function code(pfx,n){return pfx+'-'+(n<10?'0':'')+n}
  function backend(){try{return M6.backend}catch(e){return ''}}
  /* quem grava direto na Bancada: o Mestre; em campanha local (sem nuvem) qualquer um */
  function direct(){return gm()||backend()==='local'}
  function when(t){try{return new Date(t).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}catch(e){return ''}}
  function validUrl(u){return typeof u==='string'&&(/^https?:\/\/[^\s"'<>]{3,1800}$/i.test(u)||(/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(u)&&u.length<=IMGMAX*1.4))}

  /* ---------- texto rico: sanitização por lista branca ---------- */
  var OKT={B:'b',STRONG:'b',I:'i',EM:'i',U:'u',H1:'h3',H2:'h3',H3:'h3',H4:'h4',UL:'ul',OL:'ol',LI:'li',P:'p',DIV:'p',BR:'br',BLOCKQUOTE:'blockquote'};
  var DROP={SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,TEMPLATE:1,NOSCRIPT:1,SVG:1,MATH:1,TEXTAREA:1,SELECT:1,INPUT:1,BUTTON:1,LINK:1,META:1,HEAD:1,TITLE:1,FORM:1,AUDIO:1,VIDEO:1,CANVAS:1};
  function walk(src,dst,depth){
    var kids=src.childNodes;
    for(var i=0;i<kids.length;i++){
      var n=kids[i];
      if(n.nodeType===3){dst.appendChild(document.createTextNode(n.nodeValue));continue}
      if(n.nodeType!==1)continue;
      var t=String(n.tagName).toUpperCase();
      if(DROP[t])continue;
      var m=depth>16?null:OKT[t];
      if(m){var el=document.createElement(m);if(m!=='br')walk(n,el,depth+1);dst.appendChild(el)}
      else walk(n,dst,depth+1);
    }
  }
  function clean(html){
    html=String(html==null?'':html);
    if(html.length>MAXH*3)html=html.slice(0,MAXH*3);
    var d;
    try{d=new DOMParser().parseFromString('<!doctype html><body>'+html,'text/html')}catch(e){return E(html)}
    var out=document.createElement('div');walk(d.body,out,0);
    return out.innerHTML;
  }
  function plain(html){
    var s=clean(html).replace(/<\/(p|li|h3|h4|blockquote)>|<br>/g,' ');
    var d=document.createElement('div');d.innerHTML=s;
    return (d.textContent||'').replace(/\s+/g,' ').trim();
  }

  /* ---------- modelo ---------- */
  function normTags(a){
    if(typeof a==='string')a=a.split(/[,;]/);
    var out=[];(Array.isArray(a)?a:[]).forEach(function(t){
      t=String(t||'').replace(/^#/,'').trim().toLowerCase().slice(0,24);
      if(t&&out.indexOf(t)<0&&out.length<MAXTAGS)out.push(t);
    });
    return out;
  }
  function normImg(i){
    if(!i||typeof i!=='object')return null;
    if(i.u&&validUrl(i.u))return{u:String(i.u)};
    if(i.d&&validUrl(i.d))return{d:String(i.d)};
    if(i.b)return{b:1};
    return null;
  }
  function normDoc(d,keep){
    d=d&&typeof d==='object'?d:{};
    var cat=catOf(d.cat).id,st=statOf(d.status)?d.status:'';
    return{
      id:String(d.id||rnd()).slice(0,40),
      n:Number(d.n)||0,code:String(d.code||'').slice(0,12),
      title:String(d.title||'Sem título').trim().slice(0,120)||'Sem título',
      cat:cat,status:st,tags:normTags(d.tags),
      html:clean(d.html).slice(0,MAXH),
      img:normImg(d.img),
      by:d.by?String(d.by):'',byName:String(d.byName||'').slice(0,60),
      at:Number(d.at)||Date.now(),upd:Number(d.upd)||Number(d.at)||Date.now(),
      lastReq:d.lastReq?String(d.lastReq):'',
      delivered:Number(d.delivered)||0,from:d.from?String(d.from):''
    };
  }

  /* ---------- estado ---------- */
  var S={
    open:false,scope:'shared',q:'',cat:'',status:'',tag:'',fav:false,
    sel:null,mode:'view',draft:null,detail:false,opener:null,busy:false,
    newIds:{},camp:null
  };
  var SH={ver:0,saving:0,docs:[],seq:0,done:[],loaded:false,loading:false,err:null,p:null,q:Promise.resolve(),camp:null};
  var PE={docs:[],seq:0,loaded:false,camp:null};
  var INFL={};

  /* ---------- Caderno Pessoal (localStorage) ---------- */
  function loadPersonal(){
    var c=cid();if(!c){PE.docs=[];PE.seq=0;PE.loaded=false;PE.camp=null;return}
    if(PE.loaded&&PE.camp===c)return;
    var v=lsG(lk('p'),null);
    PE.docs=v&&Array.isArray(v.docs)?v.docs.map(function(d){return normDoc(d)}):[];
    PE.seq=Math.max(Number(v&&v.seq)||0,PE.docs.reduce(function(m,d){return Math.max(m,d.n||0)},0));
    PE.loaded=true;PE.camp=c;
  }
  function savePersonal(){
    if(!lsS(lk('p'),{v:1,seq:PE.seq,docs:PE.docs})){say('O armazenamento deste navegador está cheio. Remova imagens ou documentos do Caderno e tente de novo.');return false}
    return true;
  }
  function notes(){return lsG(lk('n'),{})||{}}
  function noteGet(id){return String(notes()[id]||'')}
  function noteSet(id,t){var n=notes();if(t)n[id]=String(t).slice(0,4000);else delete n[id];lsS(lk('n'),n)}
  function favs(){var a=lsG(lk('f'),[]);return Array.isArray(a)?a:[]}
  function isFav(id){return favs().indexOf(id)>=0}
  function favToggle(id){var a=favs(),i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);lsS(lk('f'),a)}
  function pend(){var a=lsG(lk('r'),[]);return Array.isArray(a)?a:[]}
  function pendSet(a){lsS(lk('r'),a)}

  /* ---------- Bancada da Campanha (campaign_store) ---------- */
  function normShared(v){
    v=v&&typeof v==='object'?v:{};
    SH.docs=(Array.isArray(v.docs)?v.docs:[]).map(function(d){return normDoc(d)});
    SH.seq=Math.max(Number(v.seq)||0,SH.docs.reduce(function(m,d){return Math.max(m,d.n||0)},0));
    SH.done=Array.isArray(v.done)?v.done.slice(-600):[];
  }
  function loadShared(force){
    var c=cid();
    if(!c||typeof stGet6!=='function')return Promise.resolve();
    if(SH.camp!==c){SH.docs=[];SH.seq=0;SH.done=[];SH.loaded=false;SH.err=null;SH.camp=c;SH.p=null;SH.loading=false;S.newIds={}}
    if(SH.loading&&!force&&SH.p)return SH.p;
    SH.loading=true;SH.err=null;
    if(S.open)paintAll();
    var v0=SH.ver;
    SH.p=stGet6('bancada').then(function(v){
      if(cid()!==c)return;
      /* quem grava (Mestre) nunca troca o estado em memória por uma leitura mais velha que a própria gravação */
      if(SH.loaded&&(SH.ver!==v0||SH.saving>0)){SH.err=null;return}
      normShared(v);SH.loaded=true;SH.err=null;
      reconcilePend();
    }).catch(function(e){
      if(cid()!==c)return;
      SH.err=e||new Error('erro');console.warn('[T60r] carregar Bancada',e);
    }).then(function(){
      SH.loading=false;
      if(cid()===c){try{noticeNew()}catch(e){console.warn('[T60r] aviso',e)}if(S.open)paintAll()}
    });
    return SH.p;
  }
  function ensureLoaded(){
    if(SH.loaded)return Promise.resolve(true);
    return loadShared(true).then(function(){return SH.loaded});
  }
  /* só o aparelho que grava chama isto (Mestre, ou campanha local) */
  function saveShared(extra){
    var snap={v:1,seq:SH.seq,docs:SH.docs.slice(),done:SH.done.slice(-600)};
    SH.ver++;SH.saving++;
    SH.q=SH.q.then(function(){return stPut6('bancada','bancada',JSON.parse(JSON.stringify(snap)))}).then(function(){
      try{cast6(Object.assign({t:'bancada',rev:Date.now()},extra||{}))}catch(e){}
      SH.saving--;return true;
    }).catch(function(e){
      SH.saving--;console.warn('[T60r] salvar Bancada',e);
      say('Não consegui salvar a Bancada: '+((e&&e.message)||'erro')+'. Tente de novo.');
      return false;
    });
    return SH.q;
  }

  /* ---------- pedidos do jogador (campaign_rolls) ---------- */
  function sendReq(op,doc,id){
    var c=C();
    if(!c||typeof sb!=='function'||!sb())return Promise.reject(new Error('Abra uma campanha conectada.'));
    var req='q-'+rnd();
    var row={campaign_id:c.id,character_id:null,character_name:myName(),roller_id:me(),roller_label:myName(),
      skill:'Bancada',attribute:null,dice:[],bonus:0,total:0,detail:{cmb:'bancadareq',req:req,op:op,doc:doc||null,id:id||null}};
    return sb().from('campaign_rolls').insert(row).then(function(r){
      if(r&&r.error)throw r.error;
      return req;
    });
  }
  function reconcilePend(){
    var a=pend(),now=Date.now(),keep=a.filter(function(p){
      if(now-p.t>3*864e5)return false;
      var ex=SH.docs.filter(function(d){return d.id===p.id})[0];
      if(p.op==='add')return !ex;
      if(p.op==='edit')return !!ex&&ex.lastReq!==p.req;
      if(p.op==='del')return !!ex;
      return false;
    });
    if(keep.length!==a.length)pendSet(keep);
  }
  function pendFor(id){var a=pend();for(var i=a.length-1;i>=0;i--)if(a[i].id===id)return a[i];return null}

  /* ---- lado do Mestre: aplica pedidos ---- */
  function applyReq(row){
    var dt=row&&row.detail;
    if(!dt||dt.cmb!=='bancadareq'||!gm()||!row.id)return Promise.resolve();
    if(INFL[row.id]||SH.done.indexOf(row.id)>=0)return Promise.resolve();
    if(row.created_at&&Date.now()-Date.parse(row.created_at)>14*864e5)return Promise.resolve();
    INFL[row.id]=1;
    return ensureLoaded().then(function(ok){
      if(!ok)return;
      if(SH.done.indexOf(row.id)>=0)return;
      var by=String(row.roller_id||''),op=dt.op,d=dt.doc,id=String((d&&d.id)||dt.id||''),ex=SH.docs.filter(function(x){return x.id===id})[0],changed=false,fresh=null;
      if(!by||!id)return;
      if(op==='add'&&d&&!ex){
        var nd=normDoc(d);nd.id=id;nd.by=by;nd.byName=String(row.roller_label||'Jogador').slice(0,60);
        nd.n=++SH.seq;nd.code=code('DOC',nd.n);nd.at=nd.upd=Date.now();nd.lastReq=String(dt.req||'');
        nd.img=nd.img&&nd.img.u?{u:nd.img.u}:null;nd.delivered=0;nd.from='';
        SH.docs.push(nd);changed=true;fresh=nd;
      }else if(op==='edit'&&d&&ex&&ex.by===by){
        var ne=normDoc(d);
        ex.title=ne.title;ex.cat=ne.cat;ex.status=ne.status;ex.tags=ne.tags;ex.html=ne.html;
        if(ne.img&&ne.img.u)ex.img={u:ne.img.u};else if(!ne.img&&ex.img&&ex.img.u)ex.img=null;
        ex.upd=Date.now();ex.lastReq=String(dt.req||'');changed=true;fresh=ex;
      }else if(op==='del'&&ex&&ex.by===by){
        SH.docs=SH.docs.filter(function(x){return x.id!==id});changed=true;
        try{if(ex.img&&ex.img.b)blobDel6('bancada:'+id)}catch(e){}
      }
      SH.done.push(row.id);
      return saveShared(fresh&&op==='add'?{new:{id:fresh.id,title:fresh.title}}:null).then(function(){if(changed&&S.open)paintAll()});
    }).catch(function(e){console.warn('[T60r] pedido',e)}).then(function(){delete INFL[row.id]});
  }
  function scanReqs(){
    var c=cid();
    if(!gm()||!c||typeof sb!=='function'||!sb()||typeof cloud6!=='function'||!cloud6())return Promise.resolve();
    return sb().from('campaign_rolls').select('*').eq('campaign_id',c).eq('detail->>cmb','bancadareq').order('created_at',{ascending:false}).limit(300).then(function(r){
      if(!r||r.error||!Array.isArray(r.data))return;
      var rows=r.data.slice().reverse(),p=Promise.resolve();
      rows.forEach(function(row){p=p.then(function(){return applyReq(row)})});
      return p;
    }).catch(function(e){console.warn('[T60r] ler pedidos',e)});
  }

  /* ---------- avisos de pista nova (discretos) ---------- */
  function noticeNew(){
    var c=cid();if(!c||!SH.loaded)return;
    var k=lk('s'),seen=lsG(k,null),ids=SH.docs.map(function(d){return d.id});
    if(!Array.isArray(seen)){lsS(k,ids);return}
    var fresh=SH.docs.filter(function(d){return seen.indexOf(d.id)<0&&d.by!==me()});
    fresh.forEach(function(d){S.newIds[d.id]=1});
    if(fresh.length&&!(S.open&&S.scope==='shared')){
      var key='n'+fresh.map(function(d){return d.id}).join();
      if(noticeNew.last!==key){
        noticeNew.last=key;
        say(fresh.length===1?'Nova pista na Bancada: '+fresh[0].title:fresh.length+' novas pistas na Bancada.');
      }
    }
    badge();
  }
  function markSeen(){
    if(!SH.loaded)return;
    lsS(lk('s'),SH.docs.map(function(d){return d.id}));
    noticeNew.last='';
    badge();
  }
  function unseenCount(){
    var seen=lsG(lk('s'),null);if(!Array.isArray(seen))return 0;
    return SH.docs.filter(function(d){return seen.indexOf(d.id)<0&&d.by!==me()}).length;
  }
  function badge(){
    var n=0;try{n=SH.loaded&&!(S.open&&S.scope==='shared')?unseenCount():0}catch(e){}
    var els=document.querySelectorAll('#appRail60 [data-id="bancada"],#appMore60 [data-mid="bancada"]');
    for(var i=0;i<els.length;i++)els[i].classList.toggle('has-alert',n>0);
  }

  /* ---------- listas e filtros ---------- */
  function viewDocs(){
    if(S.scope==='personal')return PE.docs.map(function(d){return Object.assign({},d,{_scope:'personal'})});
    var list=[],pds=pend();
    SH.docs.forEach(function(d){
      var p=null;for(var i=pds.length-1;i>=0;i--)if(pds[i].id===d.id){p=pds[i];break}
      if(p&&p.op==='del'){list.push(Object.assign({},d,{_scope:'shared',_pend:'del'}));return}
      if(p&&p.op==='edit'&&p.doc){var m=normDoc(Object.assign({},p.doc,{id:d.id}));list.push(Object.assign({},d,{title:m.title,cat:m.cat,status:m.status,tags:m.tags,html:m.html,img:m.img&&m.img.u?m.img:d.img,_scope:'shared',_pend:'edit'}));return}
      list.push(Object.assign({},d,{_scope:'shared'}));
    });
    pds.forEach(function(p){
      if(p.op!=='add'||!p.doc)return;
      if(SH.docs.some(function(d){return d.id===p.id}))return;
      var m=normDoc(Object.assign({},p.doc,{id:p.id}));
      list.push(Object.assign({},m,{code:'—',by:me(),byName:myName(),_scope:'shared',_pend:'add'}));
    });
    return list;
  }
  function allTags(list){var m={};list.forEach(function(d){d.tags.forEach(function(t){m[t]=(m[t]||0)+1})});return Object.keys(m).sort()}
  function matches(d,q,nt){
    if(S.cat&&d.cat!==S.cat)return false;
    if(S.status&&d.status!==S.status)return false;
    if(S.tag&&d.tags.indexOf(S.tag)<0)return false;
    if(S.fav&&!isFav(d.id))return false;
    if(q){
      var hay=(d.title+' '+d.code+' '+d.tags.join(' ')+' '+catOf(d.cat).label+' '+(statOf(d.status)||{label:''}).label+' '+plain(d.html)+' '+(nt[d.id]||'')).toLowerCase();
      var parts=q.toLowerCase().split(/\s+/).filter(Boolean);
      for(var i=0;i<parts.length;i++)if(hay.indexOf(parts[i])<0)return false;
    }
    return true;
  }
  function filtered(){
    var nt=notes(),f=favs(),q=S.q.trim();
    return viewDocs().filter(function(d){return matches(d,q,nt)}).sort(function(a,b){
      var fa=f.indexOf(a.id)>=0?1:0,fb=f.indexOf(b.id)>=0?1:0;
      if(fa!==fb)return fb-fa;
      return (b.upd||0)-(a.upd||0);
    });
  }
  function getDoc(id){var l=viewDocs();for(var i=0;i<l.length;i++)if(l[i].id===id)return l[i];return null}
  function canEdit(d){
    if(!d||d._pend==='add'||d._pend==='del')return false;
    if(d._scope==='personal')return true;
    return gm()||backend()==='local'||(!!d.by&&d.by===me());
  }

  /* ---------- imagens ---------- */
  var IMGC={};
  function imgSrc(d){
    var i=d&&d.img;if(!i)return Promise.resolve(null);
    if(i.u)return Promise.resolve(i.u);
    if(i.d)return Promise.resolve(i.d);
    if(i.b){
      if(IMGC[d.id])return Promise.resolve(IMGC[d.id]);
      if(typeof assetData6!=='function')return Promise.resolve(null);
      return assetData6('bancada:'+d.id).then(function(v){if(v&&validUrl(v))IMGC[d.id]=v;return IMGC[d.id]||null}).catch(function(){return null});
    }
    return Promise.resolve(null);
  }
  /* comprime pelo canvas até caber em ~60 KB */
  function compress(file){
    return new Promise(function(res,rej){
      if(!file||!/^image\//.test(file.type)){rej(new Error('Escolha um arquivo de imagem.'));return}
      var url=URL.createObjectURL(file),im=new Image();
      im.onload=function(){
        try{
          var side=800,q=.82,out='';
          for(var n=0;n<14;n++){
            var k=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight)||1),cv=document.createElement('canvas');
            cv.width=Math.max(1,Math.round(im.naturalWidth*k));cv.height=Math.max(1,Math.round(im.naturalHeight*k));
            var cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(im,0,0,cv.width,cv.height);
            out=cv.toDataURL('image/jpeg',q);
            if(out.length<=IMGMAX)break;
            q-=.1;if(q<.4){q=.7;side=Math.round(side*.78)}
          }
          URL.revokeObjectURL(url);
          if(out.length>IMGMAX)rej(new Error('A imagem ficou grande demais mesmo comprimida. Escolha outra ou use uma URL.'));else res(out);
        }catch(e){URL.revokeObjectURL(url);rej(e)}
      };
      im.onerror=function(){URL.revokeObjectURL(url);rej(new Error('Não consegui abrir essa imagem. Tente outro arquivo.'))};
      im.src=url;
    });
  }

  /* ---------- interface ---------- */
  var root=null,box=null;
  function $r(sel){return root?root.querySelector(sel):null}
  function build(){
    if(root)return;
    root=document.createElement('div');root.id='bn60r';root.className='bn60r hide';
    root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Bancada & Investigação');
    root.innerHTML=
      '<div class="bn-box" id="bn60rBox">'+
        '<header class="bn-top">'+
          '<div class="bn-ttl"><h1>Bancada &amp; Investigação</h1><p class="sub" id="bnSub"></p></div>'+
          '<div class="bn-scope" role="group" aria-label="Onde guardar">'+
            '<button type="button" data-scope="shared" aria-pressed="true">Bancada da Campanha</button>'+
            '<button type="button" data-scope="personal" aria-pressed="false">Caderno Pessoal</button>'+
          '</div>'+
          '<div class="bn-tools">'+
            '<button type="button" class="btn small primary" data-act="new">'+ic(ICO.plus)+'<span>Novo documento</span></button>'+
            '<button type="button" class="btn small" data-act="export" title="Baixar os documentos desta lista em JSON">Exportar JSON</button>'+
            '<button type="button" class="btn small" data-act="print" title="Abrir a visão imprimível">Imprimir</button>'+
            '<button type="button" class="btn small" data-act="close" id="bn60rClose">Fechar</button>'+
          '</div>'+
        '</header>'+
        '<div class="bn-body">'+
          '<section class="bn-left" aria-label="Lista de documentos">'+
            '<div class="bn-filters">'+
              '<label class="bn-lab" for="bnQ">Buscar por palavra ou tag</label>'+
              '<input type="search" id="bnQ" class="search" autocomplete="off" placeholder="Ex.: porto, DOC-03, #cultista">'+
              '<div class="bn-row2">'+
                '<div><label class="bn-lab" for="bnCat">Categoria</label><select id="bnCat"><option value="">Todas</option>'+CATS.map(function(c){return '<option value="'+c.id+'">'+E(c.label)+'</option>'}).join('')+'</select></div>'+
                '<div><label class="bn-lab" for="bnSt">Selo</label><select id="bnSt"><option value="">Todos</option>'+STATS.map(function(c){return '<option value="'+c.id+'">'+E(c.label)+'</option>'}).join('')+'</select></div>'+
              '</div>'+
              '<div class="bn-chips" id="bnTags" role="group" aria-label="Filtrar por tag"></div>'+
              '<button type="button" class="bn-chip" id="bnFavF" aria-pressed="false">'+ic(ICO.star)+'<span>Só favoritos</span></button>'+
              '<p class="sub bn-count" id="bnCount" aria-live="polite"></p>'+
            '</div>'+
            '<div class="bn-list" id="bnList"></div>'+
          '</section>'+
          '<section class="bn-detail" id="bnDetail" aria-label="Documento"></section>'+
        '</div>'+
      '</div>';
    document.body.appendChild(root);
    box=$r('#bn60rBox');

    root.addEventListener('click',onClick);
    var q=$r('#bnQ');q.addEventListener('input',function(){S.q=q.value;paintList()});
    $r('#bnCat').addEventListener('change',function(e){S.cat=e.target.value;paintList()});
    $r('#bnSt').addEventListener('change',function(e){S.status=e.target.value;paintList()});
    $r('#bnFavF').addEventListener('click',function(){S.fav=!S.fav;paintList()});
    root.addEventListener('keydown',onKey);
  }

  function onKey(e){
    if(e.key==='Escape'){
      if(S.mode==='edit')return;
      e.stopPropagation();
      if(S.detail&&window.matchMedia&&window.matchMedia('(max-width:860px)').matches){S.detail=false;paintAll();return}
      close();return;
    }
    if(e.key==='Tab'){
      var f=[].filter.call(root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable="true"],a[href]'),function(x){return x.offsetParent!==null});
      if(!f.length)return;
      var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  }

  function onClick(e){
    var t=e.target.closest?e.target.closest('[data-act],[data-scope],[data-open],[data-tag],[data-fav]'):null;
    if(!t||!root.contains(t))return;
    if(t.dataset.scope){setScope(t.dataset.scope);return}
    if(t.dataset.open){selectDoc(t.dataset.open);return}
    if(t.dataset.tag!==undefined){S.tag=S.tag===t.dataset.tag?'':t.dataset.tag;paintList();return}
    if(t.dataset.fav){favToggle(t.dataset.fav);paintList();paintDetail();return}
    var a=t.dataset.act;
    if(a==='close')close();
    else if(a==='new')newDoc();
    else if(a==='export')exportJson();
    else if(a==='print')printView();
    else if(a==='clear'){S.q='';S.cat='';S.status='';S.tag='';S.fav=false;syncFilters();paintList()}
    else if(a==='retry'){loadShared(true)}
    else if(a==='back'){S.detail=false;paintAll()}
    else if(a==='edit')editDoc();
    else if(a==='del')delDoc();
    else if(a==='pin')pinDoc();
    else if(a==='deliver')deliverDoc();
    else if(a==='save')saveDraft();
    else if(a==='cancel'){S.mode='view';S.draft=null;paintAll()}
    else if(a==='rmimg'){if(S.draft){S.draft.img=null;S.draft.imgChanged=true;paintImgField()}}
    else if(a==='upimg'){var fi=$r('#bnFile');if(fi)fi.click()}
    else if(a==='cmd')docCmd(t.dataset.cmd,t.dataset.val);
    else if(a==='discard')discardPend();
  }

  function setScope(s){
    if(s!=='shared'&&s!=='personal')return;
    if(S.mode==='edit'&&!confirm('Descartar o documento que você está editando?'))return;
    S.mode='view';S.draft=null;S.scope=s;S.sel=null;S.detail=false;
    if(s==='personal')loadPersonal();else{loadShared(false);}
    syncFilters();paintAll();
    if(s==='shared')markSeenSoon();
  }
  function markSeenSoon(){setTimeout(function(){if(S.open&&S.scope==='shared')markSeen()},1500)}

  function syncFilters(){
    $r('#bnQ').value=S.q;$r('#bnCat').value=S.cat;$r('#bnSt').value=S.status;
    $r('#bnFavF').setAttribute('aria-pressed',S.fav?'true':'false');
  }

  function subText(){
    if(S.scope==='personal')return gm()?'Seu Caderno Pessoal: rascunhos e pistas que só você vê, neste aparelho. Use "Entregar aos Jogadores" para levar uma pista à Bancada.':'Seu Caderno Pessoal: ninguém mais vê, e fica salvo só neste aparelho.';
    return gm()?'Documentos e pistas que toda a mesa vê, ao vivo. Só você grava direto; os pedidos dos jogadores chegam aqui.':'Documentos e pistas da campanha, ao vivo. O que você propor aguarda o Mestre confirmar.';
  }

  function paintAll(){
    if(!root||!S.open)return;
    var sc=root.querySelectorAll('.bn-scope button');
    for(var i=0;i<sc.length;i++)sc[i].setAttribute('aria-pressed',sc[i].dataset.scope===S.scope?'true':'false');
    $r('#bnSub').textContent=subText();
    box.classList.toggle('bn-show-detail',!!S.detail);
    paintList();paintDetail();
  }

  function cardHtml(d){
    var c=catOf(d.cat),s=statOf(d.status),fav=isFav(d.id);
    return '<div class="bn-card'+(S.sel===d.id?' on':'')+(d._pend?' pend':'')+'">'+
      '<button type="button" class="bn-open" data-open="'+E(d.id)+'" aria-label="Abrir '+E(d.code+' '+d.title)+'"'+(S.sel===d.id?' aria-current="true"':'')+'>'+
        '<span class="bn-cico">'+ic(c.svg)+'</span>'+
        '<span class="bn-cmain"><span class="bn-ccode">'+E(d.code||'—')+' · '+E(c.label)+(S.newIds[d.id]&&d._scope==='shared'?' <b class="bn-new">Nova</b>':'')+'</span>'+
        '<span class="bn-ctitle">'+E(d.title)+'</span>'+
        '<span class="bn-cmeta">'+(s?'<span class="bn-seal st-'+s.id+'">'+ic(s.svg)+E(s.label)+'</span>':'')+
          (d._pend==='add'?'<span class="bn-pill">Aguardando o Mestre</span>':d._pend==='edit'?'<span class="bn-pill">Alteração aguardando o Mestre</span>':d._pend==='del'?'<span class="bn-pill">Exclusão aguardando o Mestre</span>':'')+
          (d.delivered?'<span class="bn-pill">Entregue</span>':'')+
          d.tags.slice(0,4).map(function(t){return '<span class="bn-tag">#'+E(t)+'</span>'}).join('')+
        '</span></span>'+
      '</button>'+
      '<button type="button" class="bn-fav" data-fav="'+E(d.id)+'" aria-pressed="'+(fav?'true':'false')+'" aria-label="'+(fav?'Remover dos favoritos: ':'Favoritar: ')+E(d.title)+'">'+ic(ICO.star)+'</button>'+
    '</div>';
  }

  function paintList(){
    if(!root||!S.open)return;
    var list=$r('#bnList'),all=viewDocs();
    /* tags */
    var tags=allTags(all),tg=$r('#bnTags');
    if(S.tag&&tags.indexOf(S.tag)<0)S.tag='';
    tg.innerHTML=tags.map(function(t){return '<button type="button" class="bn-chip" data-tag="'+E(t)+'" aria-pressed="'+(S.tag===t?'true':'false')+'">#'+E(t)+'</button>'}).join('');
    tg.hidden=!tags.length;
    $r('#bnFavF').setAttribute('aria-pressed',S.fav?'true':'false');

    if(S.scope==='shared'&&!SH.loaded){
      $r('#bnCount').textContent='';
      list.innerHTML=SH.err
        ?'<div class="bn-empty" role="alert"><p><b>Não consegui carregar a Bancada.</b></p><p class="sub">Verifique a conexão. Seus dados não foram perdidos.</p><button type="button" class="btn small primary" data-act="retry">Tentar de novo</button></div>'
        :'<div class="bn-skel" role="status" aria-live="polite"><span></span><span></span><span></span><p class="sub">Carregando a Bancada…</p></div>';
      return;
    }
    var rows=filtered();
    $r('#bnCount').textContent=all.length?(rows.length===all.length?all.length+(all.length===1?' documento':' documentos'):rows.length+' de '+all.length+' documentos'):'';
    if(!all.length){
      list.innerHTML=S.scope==='personal'
        ?'<div class="bn-empty"><p><b>Seu Caderno está vazio.</b></p><p class="sub">'+(gm()?'Guarde rascunhos de pistas aqui e entregue aos jogadores quando chegar a hora.':'Anote o que descobriu: laudos, suspeitos, trechos de diário. Só você vê.')+'</p><button type="button" class="btn small primary" data-act="new">Criar primeiro documento</button></div>'
        :'<div class="bn-empty"><p><b>A Bancada ainda está vazia.</b></p><p class="sub">'+(gm()?'Crie um documento ou entregue uma pista do seu Caderno Pessoal.':'Quando o Mestre entregar uma pista, ela aparece aqui. Você também pode propor um documento.')+'</p><button type="button" class="btn small primary" data-act="new">'+(gm()?'Criar documento':'Propor documento')+'</button></div>';
      return;
    }
    if(!rows.length){
      list.innerHTML='<div class="bn-empty"><p><b>Nada encontrado.</b></p><p class="sub">Nenhum documento combina com a busca e os filtros.</p><button type="button" class="btn small" data-act="clear">Limpar filtros</button></div>';
      return;
    }
    list.innerHTML=rows.map(cardHtml).join('');
  }

  /* ---------- detalhe ---------- */
  function selectDoc(id){
    if(S.mode==='edit'&&!confirm('Descartar o documento que você está editando?'))return;
    S.mode='view';S.draft=null;S.sel=id;S.detail=true;
    delete S.newIds[id];
    paintAll();
    var h=$r('#bnDetail h2');
    if(h&&window.matchMedia&&window.matchMedia('(max-width:860px)').matches){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
  }
  function paintDetail(){
    if(!root||!S.open)return;
    if(S.mode==='edit')return;
    var el=$r('#bnDetail'),d=S.sel?getDoc(S.sel):null;
    if(S.sel&&!d){S.sel=null}
    if(!d){
      el.innerHTML='<div class="bn-empty bn-pick"><p><b>Selecione um documento</b></p><p class="sub">Abra um item da lista para ler, anotar na margem ou fixar no Quadro.</p></div>';
      return;
    }
    var c=catOf(d.cat),s=statOf(d.status),fav=isFav(d.id),ed=canEdit(d);
    var h='<article class="bn-doc">'+
      '<div class="bn-dtop"><button type="button" class="btn small bn-backbtn" data-act="back">'+ic(ICO.back)+'<span>Voltar à lista</span></button></div>'+
      '<header class="bn-dhead">'+
        '<span class="bn-dico">'+ic(c.svg)+'</span>'+
        '<div class="bn-dtt"><p class="bn-ccode">'+E(d.code||'—')+' · '+E(c.label)+'</p><h2>'+E(d.title)+'</h2>'+
          '<p class="sub">'+(d.byName?'Por '+E(d.byName)+' · ':'')+E(when(d.upd))+(d.from==='caderno'?' · entregue pelo Mestre':'')+'</p></div>'+
        '<button type="button" class="bn-fav big" data-fav="'+E(d.id)+'" aria-pressed="'+(fav?'true':'false')+'" aria-label="'+(fav?'Remover dos favoritos':'Favoritar este documento')+'">'+ic(ICO.star)+'</button>'+
      '</header>'+
      '<div class="bn-dmeta">'+(s?'<span class="bn-seal st-'+s.id+'">'+ic(s.svg)+E(s.label)+'</span>':'')+
        (d._pend?'<span class="bn-pill">'+(d._pend==='add'?'Aguardando o Mestre confirmar':d._pend==='edit'?'Alteração aguardando o Mestre':'Exclusão aguardando o Mestre')+'</span>':'')+
        d.tags.map(function(t){return '<span class="bn-tag">#'+E(t)+'</span>'}).join('')+'</div>'+
      '<div class="bn-fig" id="bnFig" hidden></div>'+
      '<div class="bn-text" id="bnText"></div>'+
      '<div class="bn-acts">'+
        '<button type="button" class="btn small" data-act="pin" title="Levar este documento ao Quadro de Investigação">'+ic(ICO.pin)+'<span>Fixar no Quadro</span></button>'+
        (gm()&&d._scope==='personal'?'<button type="button" class="btn small primary" data-act="deliver">'+ic(ICO.send)+'<span>Entregar aos Jogadores</span></button>':'')+
        (ed?'<button type="button" class="btn small" data-act="edit">'+ic(ICO.edit)+'<span>Editar</span></button>':'')+
        (ed?'<button type="button" class="btn small danger" data-act="del">'+ic(ICO.trash)+'<span>Excluir</span></button>':'')+
        (d._pend==='add'?'<button type="button" class="btn small danger" data-act="discard">Descartar pedido</button>':'')+
      '</div>'+
      '<div class="bn-margin"><label class="bn-lab" for="bnMargin">Anotações de margem <span class="sub">(só você vê, salvas neste aparelho)</span></label>'+
        '<textarea id="bnMargin" rows="4" maxlength="4000" placeholder="Suas suspeitas, ligações com outras pistas…"></textarea><p class="sub" id="bnMarginSt" aria-live="polite"></p></div>'+
    '</article>';
    el.innerHTML=h;
    $r('#bnText').innerHTML=d.html?clean(d.html):'<p class="sub">Este documento não tem texto.</p>';
    var ta=$r('#bnMargin'),tm=null,id=d.id;
    ta.value=noteGet(id);
    ta.addEventListener('input',function(){
      var st=$r('#bnMarginSt');if(st)st.textContent='Salvando…';
      clearTimeout(tm);tm=setTimeout(function(){noteSet(id,ta.value);var s2=$r('#bnMarginSt');if(s2)s2.textContent='Salvo neste aparelho.'},450);
    });
    ta.addEventListener('blur',function(){clearTimeout(tm);noteSet(id,ta.value)});
    if(d.img){
      imgSrc(d).then(function(src){
        var fg=$r('#bnFig');if(!fg||S.sel!==id||S.mode==='edit')return;
        if(!src){if(d.img.b){fg.hidden=false;fg.innerHTML='<p class="sub">Não consegui carregar a imagem deste documento.</p>'}return}
        var im=new Image();im.alt='Imagem anexada a '+(d.code||'documento')+': '+d.title;im.loading='lazy';im.referrerPolicy='no-referrer';
        im.onerror=function(){fg.innerHTML='<p class="sub">A imagem não abriu. O endereço pode ter saído do ar.</p>'};
        im.src=src;fg.hidden=false;fg.textContent='';fg.appendChild(im);
      });
    }
  }

  /* ---------- editor ---------- */
  function newDoc(){
    if(S.mode==='edit'&&!confirm('Descartar o documento que você está editando?'))return;
    S.draft={id:'',cat:'laudo',status:'',title:'',tags:[],html:'',img:null,imgChanged:false,isNew:true};
    S.mode='edit';S.sel=null;S.detail=true;paintAll();paintEditor();
  }
  function editDoc(){
    var d=S.sel?getDoc(S.sel):null;if(!d||!canEdit(d))return;
    S.draft={id:d.id,cat:d.cat,status:d.status,title:d.title,tags:d.tags.slice(),html:d.html,img:d.img?Object.assign({},d.img):null,imgChanged:false,isNew:false,scope:d._scope};
    S.mode='edit';S.detail=true;paintAll();paintEditor();
  }
  function paintEditor(){
    var el=$r('#bnDetail'),d=S.draft;if(!el||!d)return;
    var canUp=S.scope==='personal'||direct();
    el.innerHTML='<form class="bn-form" id="bnForm" novalidate>'+
      '<div class="bn-dtop"><button type="button" class="btn small bn-backbtn" data-act="cancel">'+ic(ICO.back)+'<span>Cancelar</span></button></div>'+
      '<h2 tabindex="-1" id="bnFormH">'+(d.isNew?'Novo documento':'Editar documento')+'</h2>'+
      '<div class="bn-fld"><label class="bn-lab" for="bnT">Título</label><input id="bnT" type="text" maxlength="120" autocomplete="off" value="'+E(d.title)+'" aria-describedby="bnTerr"><p class="bn-err" id="bnTerr" role="alert" hidden></p></div>'+
      '<div class="bn-row2"><div class="bn-fld"><label class="bn-lab" for="bnC">Categoria</label><select id="bnC">'+CATS.map(function(c){return '<option value="'+c.id+'"'+(c.id===d.cat?' selected':'')+'>'+E(c.label)+'</option>'}).join('')+'</select></div>'+
      '<div class="bn-fld"><label class="bn-lab" for="bnS">Selo de status</label><select id="bnS"><option value="">Sem selo</option>'+STATS.map(function(c){return '<option value="'+c.id+'"'+(c.id===d.status?' selected':'')+'>'+E(c.label)+'</option>'}).join('')+'</select></div></div>'+
      '<div class="bn-fld"><label class="bn-lab" for="bnG">Tags <span class="sub">(separe por vírgula, até '+MAXTAGS+')</span></label><input id="bnG" type="text" maxlength="200" autocomplete="off" value="'+E(d.tags.join(', '))+'"></div>'+
      '<div class="bn-fld"><span class="bn-lab" id="bnXl">Texto</span>'+
        '<div class="bn-bar" role="toolbar" aria-label="Formatação do texto">'+
          '<button type="button" data-act="cmd" data-cmd="bold" aria-label="Negrito" title="Negrito"><b>N</b></button>'+
          '<button type="button" data-act="cmd" data-cmd="italic" aria-label="Itálico" title="Itálico"><i>I</i></button>'+
          '<button type="button" data-act="cmd" data-cmd="formatBlock" data-val="h3" aria-label="Título de seção" title="Título de seção">Título</button>'+
          '<button type="button" data-act="cmd" data-cmd="formatBlock" data-val="p" aria-label="Parágrafo normal" title="Parágrafo normal">Texto</button>'+
          '<button type="button" data-act="cmd" data-cmd="insertUnorderedList" aria-label="Lista com marcadores" title="Lista com marcadores">Lista</button>'+
          '<button type="button" data-act="cmd" data-cmd="insertOrderedList" aria-label="Lista numerada" title="Lista numerada">1. 2. 3.</button>'+
          '<button type="button" data-act="cmd" data-cmd="removeFormat" aria-label="Limpar formatação" title="Limpar formatação">Limpar</button>'+
        '</div>'+
        '<div id="bnEd" class="bn-ed" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="bnXl"></div>'+
        '<p class="sub bn-hint" id="bnLen"></p></div>'+
      '<div class="bn-fld"><span class="bn-lab" id="bnIl">Imagem</span><div id="bnImgField"></div>'+
        '<input type="file" id="bnFile" accept="image/*" hidden>'+
        '<p class="sub">'+(canUp?'Cole o endereço (URL) ou envie um arquivo: ele é comprimido para ~60 KB'+(S.scope==='shared'?' e guardado fora do tempo real.':' e fica só neste aparelho.'):'Na Bancada da campanha, cole o endereço (URL) da imagem. Para enviar arquivo, use o Caderno Pessoal.')+'</p>'+
        '<p class="bn-err" id="bnIerr" role="alert" hidden></p></div>'+
      '<div class="bn-acts"><button type="submit" class="btn primary" id="bnSave">'+(S.scope==='shared'&&!direct()?(d.isNew?'Enviar ao Mestre':'Enviar alteração'):'Salvar documento')+'</button>'+
      '<button type="button" class="btn" data-act="cancel">Cancelar</button></div>'+
    '</form>';
    var ed=$r('#bnEd');ed.innerHTML=clean(d.html);
    ed.addEventListener('paste',function(e){
      e.preventDefault();
      var t=(e.clipboardData||window.clipboardData).getData('text/plain')||'';
      try{document.execCommand('insertText',false,t)}catch(x){ed.appendChild(document.createTextNode(t))}
    });
    ed.addEventListener('input',updLen);updLen();
    $r('#bnT').addEventListener('blur',function(){checkTitle()});
    $r('#bnT').addEventListener('input',function(){var er=$r('#bnTerr');if(er&&!er.hidden&&$r('#bnT').value.trim()){er.hidden=true;$r('#bnT').removeAttribute('aria-invalid')}});
    $r('#bnForm').addEventListener('submit',function(e){e.preventDefault();saveDraft()});
    $r('#bnFile').addEventListener('change',function(e){
      var f=e.target.files&&e.target.files[0];e.target.value='';
      if(!f)return;
      var er=$r('#bnIerr');er.hidden=true;
      compress(f).then(function(url){S.draft.img={d:url};S.draft.imgChanged=true;S.draft.upload=true;paintImgField()}).catch(function(x){er.textContent=(x&&x.message)||'Não consegui usar essa imagem.';er.hidden=false});
    });
    $r('#bnForm').addEventListener('mousedown',function(e){if(e.target.closest('.bn-bar button'))e.preventDefault()});
    paintImgField();
    var h=$r('#bnFormH');if(h)h.focus({preventScroll:true});
  }
  function updLen(){
    var ed=$r('#bnEd'),n=$r('#bnLen');if(!ed||!n)return;
    var len=clean(ed.innerHTML).length;
    n.textContent=len+' de '+MAXH+' caracteres'+(len>MAXH?' (reduza o texto para salvar)':'');
    n.classList.toggle('over',len>MAXH);
  }
  function docCmd(cmd,val){
    var ed=$r('#bnEd');if(!ed)return;ed.focus();
    try{document.execCommand(cmd,false,val||null)}catch(e){}
    updLen();
  }
  function paintImgField(){
    var f=$r('#bnImgField');if(!f||!S.draft)return;
    var i=S.draft.img,canUp=S.scope==='personal'||direct();
    f.innerHTML=
      '<div class="bn-imgrow"><input id="bnU" type="url" inputmode="url" autocomplete="off" aria-labelledby="bnIl" placeholder="https://… (endereço da imagem)" value="'+E(i&&i.u?i.u:'')+'">'+
      (canUp?'<button type="button" class="btn small" data-act="upimg">Enviar arquivo</button>':'')+
      (i?'<button type="button" class="btn small" data-act="rmimg">Remover imagem</button>':'')+'</div>'+
      '<div class="bn-prev" id="bnPrev"></div>';
    $r('#bnU').addEventListener('input',function(){
      var v=$r('#bnU').value.trim();
      if(!v){if(S.draft.img&&S.draft.img.u){S.draft.img=null;S.draft.imgChanged=true}return}
      S.draft.img={u:v};S.draft.imgChanged=true;S.draft.upload=false;
    });
    $r('#bnU').addEventListener('blur',function(){
      var v=$r('#bnU').value.trim(),er=$r('#bnIerr');
      if(v&&!validUrl(v)){er.textContent='Esse endereço não parece uma imagem válida. Use um link que comece com http:// ou https://.';er.hidden=false}else er.hidden=true;
    });
    var pv=$r('#bnPrev');
    if(i&&(i.d||i.b)){
      imgSrc({id:S.draft.id,img:i}).then(function(src){if(!src||!$r('#bnPrev'))return;var im=new Image();im.alt='Prévia da imagem anexada';im.src=src;$r('#bnPrev').textContent='';$r('#bnPrev').appendChild(im)});
    }else if(i&&i.u&&validUrl(i.u)){
      var im=new Image();im.alt='Prévia da imagem anexada';im.referrerPolicy='no-referrer';im.onerror=function(){pv.textContent='A prévia não abriu. Confira o endereço.'};im.src=i.u;pv.appendChild(im);
    }
  }
  function checkTitle(){
    var t=$r('#bnT'),er=$r('#bnTerr');if(!t||!er)return true;
    var ok=!!t.value.trim();
    er.hidden=ok;er.textContent=ok?'':'Dê um título ao documento para poder salvar.';
    if(ok)t.removeAttribute('aria-invalid');else t.setAttribute('aria-invalid','true');
    return ok;
  }

  function setBusy(on,label){
    S.busy=on;var b=$r('#bnSave');if(!b)return;
    b.disabled=on;if(on){b.dataset.old=b.textContent;b.textContent=label||'Salvando…'}else if(b.dataset.old){b.textContent=b.dataset.old}
  }

  function saveDraft(){
    var d=S.draft;if(!d||S.busy)return;
    if(!checkTitle()){$r('#bnT').focus();return}
    var html=clean($r('#bnEd').innerHTML);
    if(html.length>MAXH){say('O texto passou do limite. Reduza um pouco e salve de novo.');return}
    var u=($r('#bnU')?$r('#bnU').value.trim():'');
    var img=d.img;
    if(u&&(!img||img.u!==u)){img={u:u}}
    if(img&&img.u&&!validUrl(img.u)){var er=$r('#bnIerr');er.textContent='Corrija o endereço da imagem ou remova-a.';er.hidden=false;$r('#bnU').focus();return}
    var f={title:$r('#bnT').value.trim(),cat:$r('#bnC').value,status:$r('#bnS').value,tags:normTags($r('#bnG').value),html:html,img:img};
    var scope=S.scope;
    setBusy(true);
    var p;
    if(scope==='personal')p=savePersonalDoc(d,f);
    else if(direct())p=saveSharedDoc(d,f);
    else p=requestSharedDoc(d,f);
    p.then(function(id){
      setBusy(false);
      if(!id)return;
      S.mode='view';S.draft=null;S.sel=id;S.detail=true;paintAll();
    }).catch(function(e){setBusy(false);console.warn('[T60r] salvar documento',e);say('Não consegui salvar: '+((e&&e.message)||'erro')+'. Seu texto continua aqui; tente de novo.')});
  }
  function savePersonalDoc(d,f){
    loadPersonal();
    var ex=d.isNew?null:PE.docs.filter(function(x){return x.id===d.id})[0];
    var nd;
    if(ex){nd=ex;nd.title=f.title;nd.cat=f.cat;nd.status=f.status;nd.tags=f.tags;nd.html=f.html;nd.img=normImg(f.img);nd.upd=Date.now()}
    else{
      nd=normDoc({id:rnd(),title:f.title,cat:f.cat,status:f.status,tags:f.tags,html:f.html,img:f.img});
      nd.n=++PE.seq;nd.code=code('PES',nd.n);nd.by=me();nd.byName=myName();nd.at=nd.upd=Date.now();PE.docs.push(nd);
    }
    if(!savePersonal())return Promise.resolve(null);
    return Promise.resolve(nd.id);
  }
  function putImg(id,img,prev){
    /* devolve a imagem a guardar no registro: upload vira blob (fora do campaign_store) */
    if(img&&img.d){
      return blobPut6('bancada:'+id,img.d).then(function(){IMGC[id]=img.d;return{b:1}});
    }
    if((!img||img.u)&&prev&&prev.b){try{blobDel6('bancada:'+id);delete IMGC[id]}catch(e){}}
    return Promise.resolve(img&&img.u?{u:img.u}:(img&&img.b?{b:1}:null));
  }
  function saveSharedDoc(d,f){
    return ensureLoaded().then(function(ok){
      if(!ok)throw new Error('a Bancada não carregou');
      var ex=d.isNew?null:SH.docs.filter(function(x){return x.id===d.id})[0],id=ex?ex.id:rnd();
      return putImg(id,f.img,ex&&ex.img).then(function(img){
        var nd;
        if(ex){nd=ex;nd.title=f.title;nd.cat=f.cat;nd.status=f.status;nd.tags=f.tags;nd.html=f.html;nd.img=img;nd.upd=Date.now()}
        else{
          nd=normDoc({id:id,title:f.title,cat:f.cat,status:f.status,tags:f.tags,html:f.html,img:img});
          nd.n=++SH.seq;nd.code=code('DOC',nd.n);nd.by=me();nd.byName=gm()?'Mestre':myName();nd.at=nd.upd=Date.now();SH.docs.push(nd);
        }
        return saveShared(!ex?{new:{id:nd.id,title:nd.title}}:null).then(function(ok2){return ok2?nd.id:null});
      });
    });
  }
  function requestSharedDoc(d,f){
    if(f.img&&!f.img.u)f.img=null; /* jogador só manda URL para a Bancada */
    var id=d.isNew?rnd():d.id,doc={id:id,title:f.title,cat:f.cat,status:f.status,tags:f.tags,html:f.html,img:f.img};
    return sendReq(d.isNew?'add':'edit',doc).then(function(req){
      var a=pend().filter(function(p){return p.id!==id});
      a.push({req:req,op:d.isNew?'add':'edit',id:id,doc:doc,t:Date.now()});pendSet(a);
      say(d.isNew?'Enviado. O documento aparece para todos quando o Mestre confirmar.':'Alteração enviada ao Mestre.');
      return id;
    }).catch(function(e){throw new Error(e&&e.message?e.message:'não consegui falar com o Mestre')});
  }

  function delDoc(){
    var d=S.sel?getDoc(S.sel):null;if(!d||!canEdit(d))return;
    var shared=d._scope==='shared';
    if(!confirm('Excluir "'+d.title+'"?'+(shared?' Isso tira o documento da Bancada de todos.':' Isso não tem volta.')))return;
    if(!shared){
      PE.docs=PE.docs.filter(function(x){return x.id!==d.id});savePersonal();noteSet(d.id,'');
      S.sel=null;S.detail=false;paintAll();say('Documento excluído do Caderno.');return;
    }
    if(direct()){
      ensureLoaded().then(function(){
        var ex=SH.docs.filter(function(x){return x.id===d.id})[0];
        SH.docs=SH.docs.filter(function(x){return x.id!==d.id});
        try{if(ex&&ex.img&&ex.img.b){blobDel6('bancada:'+d.id);delete IMGC[d.id]}}catch(e){}
        return saveShared();
      }).then(function(){S.sel=null;S.detail=false;paintAll();say('Documento excluído da Bancada.')});
      return;
    }
    sendReq('del',null,d.id).then(function(req){
      var a=pend().filter(function(p){return p.id!==d.id});a.push({req:req,op:'del',id:d.id,t:Date.now()});pendSet(a);
      say('Pedido de exclusão enviado ao Mestre.');paintAll();
    }).catch(function(e){say('Não consegui enviar o pedido: '+((e&&e.message)||'erro')+'. Tente de novo.')});
  }
  function discardPend(){
    var d=S.sel?getDoc(S.sel):null;if(!d||d._pend!=='add')return;
    pendSet(pend().filter(function(p){return p.id!==d.id}));
    S.sel=null;S.detail=false;paintAll();
    say('Pedido descartado neste aparelho. Se o Mestre já recebeu, ele ainda pode aprovar.');
  }

  /* ---------- entregar pista (Mestre) ---------- */
  function deliverDoc(){
    var d=S.sel?getDoc(S.sel):null;
    if(!d||!gm()||d._scope!=='personal'||S.busy)return;
    if(d.delivered&&!confirm('Este documento já foi entregue. Entregar outra cópia?'))return;
    S.busy=true;
    ensureLoaded().then(function(ok){
      if(!ok)throw new Error('a Bancada não carregou');
      var id=rnd();
      return imgSrc(d).then(function(src){
        var img=null,p=Promise.resolve();
        if(d.img&&d.img.u)img={u:d.img.u};
        else if(src){p=blobPut6('bancada:'+id,src).then(function(){IMGC[id]=src});img={b:1}}
        return p.then(function(){
          var nd=normDoc({id:id,title:d.title,cat:d.cat,status:d.status,tags:d.tags,html:d.html,img:img});
          nd.n=++SH.seq;nd.code=code('DOC',nd.n);nd.by=me();nd.byName='Mestre';nd.at=nd.upd=Date.now();nd.from='caderno';
          SH.docs.push(nd);
          return saveShared({new:{id:nd.id,title:nd.title}}).then(function(ok2){
            if(!ok2){SH.docs=SH.docs.filter(function(x){return x.id!==id});SH.seq--;return}
            var pe=PE.docs.filter(function(x){return x.id===d.id})[0];if(pe){pe.delivered=Date.now();savePersonal()}
            say('Pista entregue: '+nd.title+'. Os jogadores foram avisados.');
          });
        });
      });
    }).catch(function(e){say('Não consegui entregar a pista: '+((e&&e.message)||'erro')+'. Tente de novo.')}).then(function(){S.busy=false;paintAll()});
  }

  /* ---------- Quadro (gancho da Onda 2) ---------- */
  function payload(d){
    return{ref:{scope:d._scope||S.scope,id:d.id},id:d.id,scope:d._scope||S.scope,code:d.code,title:d.title,cat:d.cat,catLabel:catOf(d.cat).label,
      status:d.status,tags:d.tags.slice(),text:plain(d.html).slice(0,800),html:clean(d.html),
      img:d.img?(d.img.u?{u:d.img.u}:{d:d.img.d||null,b:!!d.img.b}):null,at:d.at,upd:d.upd};
  }
  function pinDoc(){
    var d=S.sel?getDoc(S.sel):null;if(!d)return;
    if(d._pend==='add'){say('Espere o Mestre confirmar este documento para fixá-lo no Quadro.');return}
    var ev;
    try{ev=new CustomEvent('tulpa:bancada-pin',{detail:{doc:payload(d)},cancelable:true})}catch(e){return}
    window.dispatchEvent(ev);
    if(!ev.defaultPrevented)say('O Quadro de Investigação chega na próxima atualização.');
  }

  /* ---------- exportar e imprimir ---------- */
  function exportList(){return viewDocs().filter(function(d){return !d._pend||d._pend==='edit'})}
  function withImages(list){
    return Promise.all(list.map(function(d){return imgSrc(d).then(function(src){return{d:d,src:src}})}));
  }
  function exportJson(){
    var list=exportList();
    if(!list.length){say('Não há documentos para exportar nesta lista.');return}
    withImages(list).then(function(rows){
      var nt=notes(),c=C();
      var out={app:'tulpa-bancada',v:1,scope:S.scope,campanha:c&&c.name||'',exportadoEm:new Date().toISOString(),
        documentos:rows.map(function(r){var d=r.d;return{codigo:d.code,titulo:d.title,categoria:catOf(d.cat).label,status:(statOf(d.status)||{label:''}).label,tags:d.tags,
          texto:plain(d.html),html:clean(d.html),imagem:r.src||null,autor:d.byName||'',criadoEm:new Date(d.at).toISOString(),atualizadoEm:new Date(d.upd).toISOString(),
          favorito:isFav(d.id),anotacoesDeMargem:nt[d.id]||''}})};
      var blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='bancada-'+(S.scope==='shared'?'campanha':'pessoal')+'-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},60000);
      say('Exportação pronta: '+list.length+(list.length===1?' documento.':' documentos.'));
    }).catch(function(e){say('Não consegui exportar: '+((e&&e.message)||'erro')+'. Tente de novo.')});
  }
  var PCSS='*{box-sizing:border-box}html{font:11pt/1.5 Georgia,"Times New Roman",serif;color:#000;background:#fff}body{margin:0;padding:0}h1{font:700 20pt Arial,sans-serif;margin:0 0 4pt}.sub{font:9pt Arial,sans-serif;margin:0 0 14pt}'+
    'article{break-inside:avoid-page;page-break-inside:avoid;border-top:1.5pt solid #000;padding:10pt 0 14pt;margin:0}article h2{font:700 14pt Arial,sans-serif;margin:2pt 0 4pt}'+
    '.k{font:700 8.5pt Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}.m{font:9pt Arial,sans-serif;margin:0 0 6pt}img{max-width:100%;max-height:90mm;display:block;margin:6pt 0}'+
    '.n{border:1pt dashed #000;padding:6pt;margin-top:8pt;font:9.5pt Arial,sans-serif;white-space:pre-wrap}p,ul,ol{margin:0 0 6pt}h3,h4{font:700 11.5pt Arial,sans-serif;margin:8pt 0 3pt}';
  function printView(){
    var list=exportList();
    if(!list.length){say('Não há documentos para imprimir nesta lista.');return}
    withImages(list).then(function(rows){
      var nt=notes(),c=C();
      var h='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Bancada & Investigação</title><style>'+PCSS+'@page{margin:16mm}</style></head><body>'+
        '<h1>Bancada &amp; Investigação</h1><p class="sub">'+E(c&&c.name||'')+' · '+(S.scope==='shared'?'Bancada da Campanha':'Caderno Pessoal')+' · '+E(new Date().toLocaleDateString('pt-BR'))+'</p>'+
        rows.map(function(r){var d=r.d,s=statOf(d.status);
          return '<article><div class="k">'+E(d.code)+' · '+E(catOf(d.cat).label)+(s?' · '+E(s.label):'')+'</div><h2>'+E(d.title)+'</h2>'+
            '<p class="m">'+(d.tags.length?E(d.tags.map(function(t){return '#'+t}).join(' '))+' · ':'')+E(d.byName||'')+' · '+E(when(d.upd))+'</p>'+
            (r.src&&validUrl(r.src)?'<img alt="" src="'+E(r.src)+'">':'')+clean(d.html)+
            (nt[d.id]?'<div class="n"><b>Anotações de margem:</b> '+E(nt[d.id])+'</div>':'')+'</article>';
        }).join('')+'</body></html>';
      var old=document.getElementById('bn60rFrame');if(old)old.remove();
      var fr=document.createElement('iframe');fr.id='bn60rFrame';fr.title='Bancada para impressão';fr.setAttribute('aria-hidden','true');
      fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
      fr.onload=function(){setTimeout(function(){
        try{var w=fr.contentWindow;w.focus();w.onafterprint=function(){setTimeout(function(){fr.remove()},400)};w.print()}
        catch(e){fr.remove();var u=URL.createObjectURL(new Blob([h],{type:'text/html'}));window.open(u,'_blank');setTimeout(function(){URL.revokeObjectURL(u)},120000)}
      },300)};
      fr.srcdoc=h;document.body.appendChild(fr);
      setTimeout(function(){if(fr.isConnected)fr.remove()},180000);
      say('Preparando a impressão. Escolha "Salvar como PDF" se quiser um arquivo.');
    }).catch(function(e){say('Não consegui montar a impressão: '+((e&&e.message)||'erro')+'. Tente de novo.')});
  }

  /* ---------- abrir e fechar ---------- */
  function open(scope){
    if(!cid()){say('Entre numa campanha primeiro.');return}
    build();
    if(scope==='shared'||scope==='personal')S.scope=scope;
    S.opener=document.activeElement;
    loadPersonal();
    S.open=true;S.mode='view';S.draft=null;S.detail=false;
    root.classList.remove('hide');document.body.classList.add('banc-on');
    syncFilters();paintAll();
    loadShared(false).then(function(){if(S.open&&S.scope==='shared')markSeenSoon()});
    if(gm())scanReqs();
    if(S.scope==='shared'&&SH.loaded)markSeenSoon();
    var q=$r('#bnQ');if(q)try{q.focus({preventScroll:true})}catch(e){}
  }
  function close(){
    if(!root||!S.open)return;
    if(S.mode==='edit'&&!confirm('Descartar o documento que você está editando?'))return;
    S.open=false;S.mode='view';S.draft=null;
    root.classList.add('hide');document.body.classList.remove('banc-on');
    S.newIds={};badge();
    var o=S.opener;S.opener=null;
    try{if(o&&o.isConnected&&o.focus)o.focus()}catch(e){}
  }

  /* ---------- sincronização ---------- */
  function reload(){
    if(!cid())return;
    loadShared(true);
    if(gm())scanReqs();
  }
  /* mudança no registro (tempo real) */
  if(typeof onStoreChange6==='function'){
    var _osc=onStoreChange6;
    onStoreChange6=function(p){
      var out=_osc.apply(this,arguments);
      try{
        var r=p&&p.new&&Object.keys(p.new).length?p.new:null,k=r?(r.key||r.item_key||''):'';
        if(!r||/(^|~)bancada$/.test(String(k)))reload();
      }catch(e){console.warn('[T60r] store',e)}
      return out;
    };
  }
  try{
    M6.hooks.cast.push(function(p){
      if(p&&p.t==='bancada'&&p.from!==me())reload();
    });
  }catch(e){}
  window.addEventListener('tulpa:sync',function(){if(cid()&&(SH.err||!SH.loaded))reload()});

  /* pedido do jogador chega ao Mestre pelo mesmo canal dos demais pedidos */
  if(typeof processRow==='function'){
    var _pr=processRow;
    processRow=function(row,live){
      var out=_pr.apply(this,arguments);
      try{if(row&&row.detail&&row.detail.cmb==='bancadareq'&&gm())applyReq(row)}catch(e){console.warn('[T60r] linha',e)}
      return out;
    };
  }

  /* acompanha troca de campanha; o Mestre confere pedidos de tempos em tempos */
  var lastCamp=null,tick=0;
  function watch(){
    var c=cid();
    if(c!==lastCamp){
      var prevCamp=lastCamp;
      lastCamp=c;S.newIds={};noticeNew.last='';
      if(!c){if(S.open){S.mode='view';S.draft=null;S.open=false;if(root)root.classList.add('hide');document.body.classList.remove('banc-on')}SH.loaded=false;SH.camp=null;badge();return}
      if(prevCamp){S.sel=null;PE.loaded=false;if(S.open)close()}
      loadShared(true).then(function(){if(gm())scanReqs()});
    }else if(c&&gm()&&++tick%12===0)scanReqs();
  }
  setInterval(function(){try{watch()}catch(e){}},4000);
  setTimeout(function(){try{watch()}catch(e){}},1500);

  /* ---------- API pública (Onda 2 e demais camadas) ---------- */
  T3.bancada={
    version:1,
    open:open,close:close,
    isOpen:function(){return !!S.open},
    categories:CATS.map(function(c){return{id:c.id,label:c.label}}),
    statuses:STATS.map(function(c){return{id:c.id,label:c.label}}),
    /* lista os documentos ({scope:'shared'|'personal'}), já normalizados */
    list:function(scope){
      if(scope==='personal'){loadPersonal();return PE.docs.map(function(d){return Object.assign({},d,{_scope:'personal'})})}
      return SH.docs.map(function(d){return Object.assign({},d,{_scope:'shared'})});
    },
    /* get({scope,id}) ou get(id) */
    get:function(ref){
      var id=ref&&ref.id||ref,sc=ref&&ref.scope;
      var a=(sc==='personal'?[]:SH.docs.map(function(d){return Object.assign({},d,{_scope:'shared'})})).concat(sc==='shared'?[]:(loadPersonal(),PE.docs.map(function(d){return Object.assign({},d,{_scope:'personal'})})));
      for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];
      return null;
    },
    /* Promise com o endereço usável da imagem (URL ou data:), ou null */
    imageOf:function(ref){var d=T3.bancada.get(ref);return d?imgSrc(d):Promise.resolve(null)},
    payload:function(ref){var d=T3.bancada.get(ref);return d?payload(d):null},
    sanitize:clean,
    reload:reload
  };
})();
