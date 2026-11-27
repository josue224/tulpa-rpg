/* TULPA · Tokens de NPC interativos, sem ficha
   O Mestre cria um token em segundos (nome, foto recortada, papel, tamanho, VT/DF/Reflexo opcionais, nota pública e
   secreta, visível ou oculto). O token vive em M6.state.tokens com charId "npc:<id>" e um objeto leve `npc`
   (sem imagem). A foto 256×256 vai para campaign_blobs ("npcimg:<id>"); a nota secreta fica num registro
   `npcsec` do campaign_store com audience = [uid do Mestre] (sem a tabela nova, só neste aparelho).
   `charById` (js/13) devolve um personagem virtual (T3.npcLiteChar), então trava de turno, névoa, HUD, iniciativa e
   tempo real funcionam sem mexer nas regras. */
(function(){
  'use strict';
  var ROLES={
    ally:{l:'Aliado',c:'#4cae6a',i:'🛡'},
    neutral:{l:'Neutro/Civil',c:'#b9b3a7',i:'🙂'},
    suspect:{l:'Suspeito',c:'#e0a42b',i:'❓'},
    hostile:{l:'Hostil/Criatura',c:'#c2493d',i:'⚔'},
    informant:{l:'Informante',c:'#4aa3d6',i:'🗣'}
  };
  var COLORS=['#7a4fa3','#2f7d8c','#a8553a','#4f7a3f','#8a6d2f','#3b5b9a','#9a3b5b','#555b66'];
  var IMG={},GEN={},PEND={},CH={},SEC={},LIB={},secLoaded='',card=null,cardId=null,secT=0,libT=0;
  function $(s,r){return (r||document).querySelector(s)}
  function esc2(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function toks(){return (M6.state&&M6.state.tokens)||[]}
  function nidOf(cid){return String(cid).slice(4)}
  function isNpc(t){return !!(t&&t.npc&&typeof t.charId==='string'&&t.charId.slice(0,4)==='npc:')}
  function clampN(v,a,b,d){v=Number(v);if(!isFinite(v))v=d;return Math.max(a,Math.min(b,Math.round(v)))}

  /* ---------- avatar gerado (cor + sigla): nada vai para o banco ---------- */
  function lumOf(hex){var n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return (.2126*r+.7152*g+.0722*b)/255}
  function genAvatar(n){
    var key=(n.c||'')+'|'+(n.g||'')+'|'+(n.n||'');if(GEN[key])return GEN[key];
    var c=document.createElement('canvas');c.width=c.height=96;var x=c.getContext('2d');
    var col=/^#[0-9a-f]{6}$/i.test(n.c||'')?n.c:COLORS[(n.n||'?').length%COLORS.length];
    x.fillStyle=col;x.fillRect(0,0,96,96);
    var txt=(n.g||(String(n.n||'?').trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0)}).join('')||'?')).toUpperCase().slice(0,2);
    x.fillStyle=lumOf(col)>.55?'#111':'#fff';x.font='700 44px "Cormorant Garamond",Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,48,52);
    return GEN[key]=c.toDataURL('image/jpeg',.8);
  }
  function imgFor(nid,n){
    if(IMG[nid])return IMG[nid];
    if(n.im&&!PEND[nid]){
      PEND[nid]={tries:0};
      (function get(){
        PEND[nid].tries++;
        Promise.resolve(assetData6('npcimg:'+nid)).then(function(v){
          if(v&&avOk(v)){IMG[nid]=v;delete CH['npc:'+nid];try{mapDraw7()}catch(e){}if(card)renderCard()}
          else if(PEND[nid]&&PEND[nid].tries<6)setTimeout(get,2500*PEND[nid].tries);
        }).catch(function(){if(PEND[nid]&&PEND[nid].tries<6)setTimeout(get,2500*PEND[nid].tries)});
      })();
    }
    return genAvatar(n);
  }

  /* ---------- personagem virtual (charById) ---------- */
  T3.npcLiteChar=function(id){
    if(typeof id!=='string'||id.slice(0,4)!=='npc:')return undefined;
    var t=null,a=toks();for(var i=0;i<a.length;i++)if(a[i].charId===id){t=a[i];break}
    if(!t||!t.npc){delete CH[id];return undefined}
    var n=t.npc,av=imgFor(nidOf(id),n);
    var sig=[n.n,n.vt,n.vm,n.df,n.rf,n.r,n.hid,n.im,n.c,n.g,av.length,IMG[nidOf(id)]?1:0].join('|'),c=CH[id];
    if(c&&c.sig===sig)return c.ch;
    var role=ROLES[n.r]||ROLES.neutral,dd=0;try{dd=Number(E.regra('dfPorDes'))||0}catch(e){}
    var d=Object.assign(blank(),{name:n.n||'NPC',vital:clampN(n.vt,0,999,1),vtMax:clampN(n.vm,1,999,1),essence:0,esMax:1,lucidity:20,
      baseDefense:Math.max(0,clampN(n.df,0,99,10)-dd),defense:0,avatar:av,tokenAvatar:av,_publico:true,combatCache:{reflexDice:1,reflexBonus:clampN(n.rf,-20,40,0)}});
    var ch={id:id,ownerId:null,inScene:true,data:d,vocations:[],tracks:[],npcLite:{role:n.r,ring:role.c,tid:t.id,rf:clampN(n.rf,-20,40,0)}};
    CH[id]={sig:sig,ch:ch};return ch;
  };

  /* ---------- nota secreta (só o Mestre) ---------- */
  function secKey(){var c=camp3();return 'tulpa_npcsec_'+(c&&c.id)+'_'+uid3()}
  function loadSec(){
    if(!isGM6()||!camp3())return;var k=secKey();if(secLoaded===k)return;secLoaded=k;
    try{SEC=JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){SEC={}}
    try{LIB=JSON.parse(localStorage.getItem(libKey())||'{}')||{}}catch(e){LIB={}}
    if(M6.backend==='store')Promise.resolve(stGet6('npclib')).then(function(v){if(v&&typeof v==='object'){LIB=Object.assign({},v,LIB);refreshLib()}}).catch(function(){});
    if(M6.backend==='store')Promise.resolve(stGet6('npcsec')).then(function(v){if(v&&typeof v==='object'){SEC=Object.assign({},v,SEC);if(card)renderCard()}}).catch(function(){});
  }
  function libKey(){var c=camp3();return 'tulpa_npclib_'+(c&&c.id)+'_'+uid3()}
  function saveLib(){
    try{localStorage.setItem(libKey(),JSON.stringify(LIB))}catch(e){}
    if(M6.backend!=='store')return;
    clearTimeout(libT);libT=setTimeout(function(){stPut6('npclib','npclib',Object.assign({},LIB),[uid3()]).catch(function(e){console.warn('[npc] biblioteca',e)})},800);
  }
  function saveSec(){
    try{localStorage.setItem(secKey(),JSON.stringify(SEC))}catch(e){}
    if(M6.backend!=='store')return;
    clearTimeout(secT);secT=setTimeout(function(){
      /* audience SEMPRE [uid do Mestre]: nulo seria público */
      stPut6('npcsec','npcsec',Object.assign({},SEC),[uid3()]).catch(function(e){console.warn('[npc] nota secreta',e)});
    },800);
  }

  /* ---------- criar / editar ---------- */
  function freeCell(){
    var g=mapCfg7(),W=mapWorld7(),cx=Math.round((MAP7.cam.x*W.W-g.ox)/g.cell),cy=Math.round((MAP7.cam.y*W.H-g.oy)/g.cell),used=new Set(toks().map(function(t){return Math.round(t.x)+','+Math.round(t.y)}));
    var x=cx,y=cy;for(var i=0;i<60&&used.has(x+','+y);i++){x=cx+(i%6)-2;y=cy+Math.floor(i/6)}
    return{x:Math.max(0,Math.min(g.cols-1,x)),y:Math.max(0,Math.min(g.rows-1,y))};
  }
  function openForm(t){
    if(!isGM6())return;loadSec();
    var edit=isNpc(t)?t:null,n=edit?edit.npc:{},nid=edit?nidOf(edit.charId):'n'+rid();
    var f={n:n.n||'',g:n.g||'',c:n.c||COLORS[0],r:n.r||'neutral',s:edit?(edit.s||1):1,vm:n.vm||10,vt:edit?n.vt:10,df:n.df!=null?n.df:10,rf:n.rf||0,pub:n.pub||'',hid:!!n.hid,photo:edit?(IMG[nid]||(n.im?(imgFor(nid,n),IMG[nid]||null):null)):null,photoChanged:false,sec:edit?(SEC[nid]||''):''};
    var wrap=document.createElement('div');wrap.className='npc-wrap';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-label',edit?'Editar token NPC':'Novo token NPC');
    var chips=function(name,items,cur){return items.map(function(it){return '<label class="npc-chip'+(String(cur)===String(it[0])?' on':'')+'"><input type="radio" name="'+name+'" value="'+it[0]+'"'+(String(cur)===String(it[0])?' checked':'')+'>'+it[1]+'</label>'}).join('')};
    wrap.innerHTML='<form class="npc-box" novalidate><h3 class="npc-t">'+(edit?'Editar token NPC':'＋ Novo Token NPC')+'</h3>'+
      '<div class="field"><label for="npName">Nome</label><input type="text" id="npName" maxlength="40" required autocomplete="off" value="'+esc2(f.n)+'"></div>'+
      '<div class="field"><label>Foto ou ícone</label><div class="npc-photo"><img class="npc-prev" id="npPrev" alt="Prévia do token"><button type="button" class="btn small" id="npPhoto">Escolher foto…</button><button type="button" class="btn small" id="npPhotoX">Usar cor e sigla</button><input type="file" id="npFile" accept="image/*" hidden></div></div>'+
      '<div class="npc-grid" id="npColorRow"><div class="field" style="grid-column:span 2"><label for="npSigla">Sigla (até 2 letras)</label><input type="text" id="npSigla" maxlength="2" autocomplete="off" value="'+esc2(f.g)+'"></div><div class="field"><label for="npColor">Cor</label><select id="npColor">'+COLORS.map(function(c,i){return '<option value="'+c+'"'+(c===f.c?' selected':'')+'>Cor '+(i+1)+'</option>'}).join('')+'</select></div></div>'+
      '<fieldset><legend>Papel / atitude (cor do anel)</legend>'+Object.keys(ROLES).map(function(k){var r=ROLES[k];return '<label class="npc-chip'+(f.r===k?' on':'')+'"><input type="radio" name="npRole" value="'+k+'"'+(f.r===k?' checked':'')+'><span class="npc-dot" style="background:'+r.c+'"></span>'+r.l+'</label>'}).join('')+'</fieldset>'+
      '<fieldset><legend>Tamanho</legend>'+chips('npSize',[[1,'1×1'],[2,'2×2'],[3,'3×3']],f.s)+'</fieldset>'+
      '<div class="npc-grid"><div class="field"><label for="npVt">VT atual</label><input type="number" id="npVt" min="0" max="999" inputmode="numeric" value="'+f.vt+'"></div><div class="field"><label for="npVm">VT máx.</label><input type="number" id="npVm" min="1" max="999" inputmode="numeric" value="'+f.vm+'"></div><div class="field"><label for="npDf">DF</label><input type="number" id="npDf" min="0" max="99" inputmode="numeric" value="'+f.df+'"></div></div>'+
      '<div class="field"><label for="npRf">Iniciativa (bônus de Reflexo)</label><input type="number" id="npRf" min="-20" max="40" inputmode="numeric" value="'+f.rf+'"></div>'+
      '<div class="field"><label for="npPub">Nota pública (os jogadores veem)</label><textarea id="npPub" maxlength="400">'+esc2(f.pub)+'</textarea></div>'+
      '<div class="field"><label for="npSec">Nota secreta do Mestre (só você vê)</label><textarea id="npSec" maxlength="800">'+esc2(f.sec)+'</textarea></div>'+
      '<fieldset><legend>Visibilidade</legend>'+chips('npVis',[['0','Visível no mapa'],['1','Oculto dos jogadores']],f.hid?'1':'0')+'</fieldset>'+
      '<div class="cr-row cr-end"><button type="button" class="btn" id="npCancel">Cancelar</button><button type="submit" class="btn primary" id="npOk">'+(edit?'Salvar':'Criar Token')+'</button></div></form>';
    document.body.appendChild(wrap);
    var prev=$('#npPrev',wrap),form=$('form',wrap);
    function repaint(){
      var col=$('#npColor',wrap).value,g=$('#npSigla',wrap).value,nm=$('#npName',wrap).value;
      prev.src=f.photo||genAvatar({c:col,g:g,n:nm});
      prev.style.borderColor=(ROLES[(wrap.querySelector('input[name=npRole]:checked')||{}).value]||ROLES.neutral).c;
      $('#npColorRow',wrap).style.display=f.photo?'none':'';
    }
    ['npColor','npSigla','npName'].forEach(function(id){$('#'+id,wrap).addEventListener('input',repaint)});
    wrap.addEventListener('change',function(e){
      if(e.target.type==='radio'){var grp=wrap.querySelectorAll('input[name="'+e.target.name+'"]');Array.prototype.forEach.call(grp,function(r){r.closest('.npc-chip').classList.toggle('on',r.checked)});repaint()}
    });
    $('#npPhoto',wrap).onclick=function(){$('#npFile',wrap).click()};
    $('#npFile',wrap).onchange=function(e){var file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;
      T3.cropImage(file,{title:'Enquadrar o retrato do NPC'}).then(function(out){if(out){f.photo=out;f.photoChanged=true;repaint()}})};
    $('#npPhotoX',wrap).onclick=function(){f.photo=null;f.photoChanged=true;repaint()};
    repaint();
    var done=false;function close(){if(done)return;done=true;document.removeEventListener('keydown',key,true);wrap.remove()}
    function key(e){
      if(document.querySelector('.cr-wrap'))return;
      if(e.key==='Escape'){e.preventDefault();close()}
      else if(e.key==='Tab'){var fs=wrap.querySelectorAll('button:not([hidden]),input:not([type=hidden]):not([hidden]),textarea,select');var vis=Array.prototype.filter.call(fs,function(x){return x.offsetParent!==null});if(!vis.length)return;var a=vis[0],b=vis[vis.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}
    }
    document.addEventListener('keydown',key,true);
    $('#npCancel',wrap).onclick=close;
    setTimeout(function(){$('#npName',wrap).focus()},30);
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=$('#npName',wrap).value.trim();if(!name){toast('Dê um nome ao NPC.');$('#npName',wrap).focus();return}
      var vm=clampN($('#npVm',wrap).value,1,999,10),vt=Math.min(vm,clampN($('#npVt',wrap).value,0,999,vm));
      var role=(wrap.querySelector('input[name=npRole]:checked')||{}).value||'neutral',size=clampN((wrap.querySelector('input[name=npSize]:checked')||{}).value,1,3,1);
      var npc={n:name.slice(0,40),r:ROLES[role]?role:'neutral',c:$('#npColor',wrap).value,g:$('#npSigla',wrap).value.trim().slice(0,2),vt:vt,vm:vm,df:clampN($('#npDf',wrap).value,0,99,10),rf:clampN($('#npRf',wrap).value,-20,40,0),
        pub:$('#npPub',wrap).value.trim().slice(0,400),hid:(wrap.querySelector('input[name=npVis]:checked')||{}).value==='1',im:f.photo?1:0};
      var secret=$('#npSec',wrap).value.trim().slice(0,800);
      var btn=$('#npOk',wrap);btn.disabled=true;
      var pr=Promise.resolve();
      if(f.photo&&(f.photoChanged||!edit)){IMG[nid]=f.photo;pr=blobPut6('npcimg:'+nid,f.photo)}
      else if(!f.photo&&edit&&f.photoChanged){delete IMG[nid];delete PEND[nid];pr=blobDel6('npcimg:'+nid)}
      pr.then(function(){
        if(secret)SEC[nid]=secret;else delete SEC[nid];saveSec();
        delete CH['npc:'+nid];
        LIB[nid]=Object.assign({},npc,{s:size});saveLib();
        var tk=toks().find(function(q){return q.charId==='npc:'+nid});
        if(tk){setState6({tokens:toks().map(function(q){return q.id===tk.id?Object.assign({},q,{s:size,npc:Object.assign({},npc,{vt:edit&&!edit.lib?npc.vt:tk.npc.vt})}):q})})}
        else if(!edit){var c=freeCell();setState6({tokens:toks().concat([{id:'k'+rid(),charId:'npc:'+nid,x:c.x,y:c.y,s:size,a:Math.PI/2,npc:npc}])})}
        fx5('confirm');toast(edit?'NPC atualizado.':'Token de '+npc.n+' criado no mapa e salvo na biblioteca.');close();try{mapDraw7()}catch(e2){}refreshLib();
      }).catch(function(err){btn.disabled=false;toast('Não consegui salvar a foto do NPC: '+(err&&err.message||'erro')+'.')});
    });
  }

  /* ---------- ações do Mestre ---------- */
  function patchNpc(t,p){setState6({tokens:toks().map(function(q){return q.id===t.id?Object.assign({},q,{npc:Object.assign({},q.npc,p)}):q})})}
  function addInit(t){
    var c=camp3();
    if(!c||!c.combat||!c.combat.active){toast('Inicie o combate primeiro; depois adicione o NPC à ordem.');return}
    if((c.combat.order||[]).some(function(o){return o.characterId===t.charId})){toast(t.npc.n+' já está na ordem de iniciativa.');return}
    if(typeof cbAdd22==='function')cbAdd22([t.charId]);
  }
  function removeTok(t){
    var c=camp3(),cm=c&&c.combat;
    setState6({tokens:toks().filter(function(q){return q.id!==t.id})});
    if(cm&&cm.active&&(cm.order||[]).some(function(o){return o.characterId===t.charId})&&window.tulpaSaveCombatState){
      var idx=cm.order.findIndex(function(o){return o.characterId===t.charId}),order=cm.order.filter(function(o){return o.characterId!==t.charId});
      var ti=Number(cm.turnIndex)||0;if(idx<ti)ti--;ti=Math.max(0,Math.min(ti,Math.max(0,order.length-1)));
      Promise.resolve(window.tulpaSaveCombatState(Object.assign({},cm,{order:order,participants:(cm.participants||[]).filter(function(p){return p.characterId!==t.charId}),turnIndex:ti}))).catch(function(){});
    }
    delete CH[t.charId];
    MAP7.sel=null;closeCard();try{mapDraw7()}catch(e){}refreshLib();toast('Tirado do mapa. O NPC continua salvo em Tokens.');
  }

  /* ---------- biblioteca de NPCs (janela Tokens) ---------- */
  function addFromLib(nid){
    var e=LIB[nid];if(!e)return;
    if(toks().some(function(t){return t.charId==='npc:'+nid})){toast(e.n+' já está no mapa.');return}
    var c=freeCell(),npc=Object.assign({},e);delete npc.s;npc.vt=npc.vm;
    setState6({tokens:toks().concat([{id:'k'+rid(),charId:'npc:'+nid,x:c.x,y:c.y,s:e.s||1,a:Math.PI/2,npc:npc}])});delete CH['npc:'+nid];
    toast(e.n+' entrou no mapa.');refreshLib();try{mapDraw7()}catch(x){}
  }
  function dupLib(nid){
    var e=LIB[nid];if(!e)return;var id2='n'+rid();LIB[id2]=Object.assign({},e,{n:(e.n+' (cópia)').slice(0,40)});
    if(SEC[nid])SEC[id2]=SEC[nid];if(IMG[nid]&&e.im)IMG[id2]=IMG[nid],blobPut6('npcimg:'+id2,IMG[nid]).catch(function(){});
    saveLib();saveSec();refreshLib();
  }
  function deleteNpc(nid){
    var tk=toks().find(function(t){return t.charId==='npc:'+nid});if(tk)removeTok(tk);
    delete LIB[nid];delete SEC[nid];delete IMG[nid];delete PEND[nid];delete CH['npc:'+nid];blobDel6('npcimg:'+nid);saveLib();saveSec();refreshLib();
  }
  function refreshLib(){
    var box=$('#npcLibBox');if(!box)return;
    var ids=Object.keys(LIB),on=new Set(toks().map(function(t){return t.charId}));
    box.innerHTML='<h4>NPCs salvos <small class="sub">(sem ficha)</small></h4><div class="inline"><button type="button" class="btn small primary" id="npcNew">＋ Novo Token NPC</button></div>'+
      (ids.length?'<ul class="mu-list tk-list">'+ids.map(function(id){var e=LIB[id],r=ROLES[e.r]||ROLES.neutral,inMap=on.has('npc:'+id);
        return '<li><img class="npc-prev" style="width:36px;height:36px" alt="" src="'+imgFor(id,e)+'"><span class="mu-t">'+esc2(e.n)+' <small>'+r.l+' · '+(e.s||1)+'×'+(e.s||1)+(e.hid?' · oculto':'')+'</small></span>'+
          (inMap?'<span class="sub">no mapa</span>':'<button type="button" class="btn small" data-lib="add" data-id="'+id+'">Adicionar ao mapa</button>')+
          '<button type="button" class="btn small" data-lib="edit" data-id="'+id+'">Editar</button><button type="button" class="btn small" data-lib="dup" data-id="'+id+'">Duplicar</button><button type="button" class="btn small danger" data-lib="del" data-id="'+id+'">Excluir</button></li>'}).join('')+'</ul>':'<p class="sub">Nenhum NPC salvo ainda. Crie um: ele fica guardado aqui para você colocar no mapa quando quiser.</p>');
    $('#npcNew',box).onclick=function(){openForm()};
    Array.prototype.forEach.call(box.querySelectorAll('[data-lib]'),function(b){var armed=false;b.onclick=function(){
      var id=b.dataset.id,a=b.dataset.lib;
      if(a==='add')addFromLib(id);else if(a==='dup')dupLib(id);
      else if(a==='edit'){var e=LIB[id];openForm({id:null,lib:true,charId:'npc:'+id,s:e.s||1,npc:e})}
      else if(a==='del'){if(!armed){armed=true;b.textContent='Excluir mesmo?';setTimeout(function(){armed=false;if(b.isConnected)b.textContent='Excluir'},3000)}else deleteNpc(id)}
    }});
  }
  var _tm=mapTokensModal7;
  mapTokensModal7=function(){
    _tm.apply(this,arguments);
    try{loadSec();var l=$('#tkList');if(l&&!$('#npcLibBox')){var b=document.createElement('div');b.id='npcLibBox';l.after(b);refreshLib()}}catch(e){console.warn('[npc] biblioteca',e)}
  };

  /* ---------- card flutuante ---------- */
  function closeCard(){if(card){card.remove();card=null}cardId=null}
  function openCard(t){cardId=t.id;try{if(isGM6()&&!LIB[nidOf(t.charId)]){loadSec();LIB[nidOf(t.charId)]=Object.assign({},t.npc,{s:t.s||1});saveLib()}}catch(e){}renderCard()}
  function renderCard(){
    var t=toks().find(function(q){return q.id===cardId});
    if(!t||!isNpc(t)||!MAP7.stage||(t.npc.hid&&!isGM6())){closeCard();return}
    var n=t.npc,nid=nidOf(t.charId),role=ROLES[n.r]||ROLES.neutral,gm=isGM6(),av=imgFor(nid,n);
    if(gm)loadSec();
    var keepSec=card&&card.querySelector('#npcSec')===document.activeElement;
    if(keepSec)return; /* não apaga o que o Mestre está digitando */
    if(!card||!card.isConnected){card=document.createElement('div');card.className='npc-card';card.setAttribute('role','dialog');MAP7.stage.appendChild(card)}
    card.setAttribute('aria-label','Token '+n.n);
    var inCb=false;try{var cm=camp3().combat;inCb=!!(cm&&cm.active&&(cm.order||[]).some(function(o){return o.characterId===t.charId}))}catch(e){}
    card.innerHTML='<button type="button" class="npc-x" aria-label="Fechar">✕</button>'+
      '<div class="npc-head"><img alt="" src="'+av+'"><div><b>'+esc2(n.n)+'</b><span class="npc-role"><span class="npc-dot" style="background:'+role.c+'"></span><span aria-hidden="true">'+role.i+'</span> '+role.l+(gm&&n.hid?' · oculto':'')+'</span></div></div>'+
      (n.pub?'<p class="npc-note">'+esc2(n.pub)+'</p>':(gm?'':'<p class="npc-note sub">Sem anotações públicas.</p>'))+
      (gm?'<div class="npc-vt"><button type="button" class="btn small" data-vt="-1" aria-label="Menos 1 VT">−</button><b aria-live="polite">VT '+n.vt+'/'+n.vm+'</b><button type="button" class="btn small" data-vt="1" aria-label="Mais 1 VT">+</button><span class="sub">DF '+n.df+' · Ref '+(n.rf>=0?'+':'')+n.rf+'</span></div>'+
        '<div class="npc-sec"><label for="npcSec" class="sub">Nota secreta (só você vê)</label><textarea id="npcSec" maxlength="800">'+esc2(SEC[nid]||'')+'</textarea></div>'+
        '<div class="npc-act"><button type="button" class="btn small" data-act="vis">'+(n.hid?'👁 Revelar no mapa':'🙈 Ocultar dos players')+'</button>'+
        '<button type="button" class="btn small" data-act="init"'+(inCb?' disabled':'')+'>'+(inCb?'Na ordem de iniciativa':'⚔ Adicionar à Ordem de Iniciativa')+'</button>'+
        '<button type="button" class="btn small" data-act="edit">✎ Editar</button><button type="button" class="btn small danger" data-act="rm">Remover do Mapa</button></div>':'');
    $('.npc-x',card).onclick=function(){closeCard();MAP7.sel=null;mapDraw7()};
    if(gm){
      Array.prototype.forEach.call(card.querySelectorAll('[data-vt]'),function(b){b.onclick=function(){patchNpc(t,{vt:Math.max(0,Math.min(n.vm,n.vt+Number(b.dataset.vt)))})}});
      $('#npcSec',card).onchange=function(e){var v=e.target.value.trim().slice(0,800);if(v)SEC[nid]=v;else delete SEC[nid];saveSec();toast('Nota secreta salva.')};
      var rm=$('[data-act=rm]',card),armed=false;
      Array.prototype.forEach.call(card.querySelectorAll('[data-act]'),function(b){b.onclick=function(){
        var a=b.dataset.act;
        if(a==='vis')patchNpc(t,{hid:!n.hid});
        else if(a==='init')addInit(t);
        else if(a==='edit'){closeCard();openForm(t)}
        else if(a==='rm'){if(!armed){armed=true;b.textContent='Toque de novo para remover';setTimeout(function(){armed=false;if(rm&&rm.isConnected)rm.textContent='Remover do Mapa'},3000)}else removeTok(t)}
      }});
    }
    /* posição junto ao token, dentro do palco */
    try{
      var v=mapView7(),g=mapCfg7(),p=tokPos7(t),pt=w2s7(v,g.ox+(p.x+(t.s||1))*g.cell,g.oy+p.y*g.cell),sw=MAP7.stage.clientWidth,sh=MAP7.stage.clientHeight;
      card.style.left=Math.max(8,Math.min(sw-card.offsetWidth-8,pt[0]+8))+'px';card.style.top=Math.max(8,Math.min(sh-card.offsetHeight-8,pt[1]))+'px';
    }catch(e){}
  }
  /* clique curto no token abre o card; clicar fora (ou o início de um arrasto) fecha */
  var dn=null;
  document.addEventListener('pointerdown',function(e){
    if(e.target&&e.target.id==='mapCanvas')dn={x:e.clientX,y:e.clientY,t:Date.now(),id:e.pointerId};else dn=null;
  },true);
  document.addEventListener('pointerup',function(e){
    if(!dn||!e.target||e.target.id!=='mapCanvas'||e.pointerId!==dn.id)return;
    var d=dn;dn=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>6||Date.now()-d.t>600)return;
    try{var p=mapPt7(e),t=mapHit7(p.wx,p.wy);if(t&&MAP7.tool==='move'){MAP7.menuAt=Date.now();mapMenu7(t,e)}else if(card&&(!t||!isNpc(t)))closeCard()}catch(x){}
  },true);
  /* o menu antigo (toque duplo) abre o card no lugar */
  var _menu=mapMenu7;
  mapMenu7=function(t,e){
    if(t&&isNpc(t)){var m=$('#mapMenu');if(m)m.hidden=true;openCard(t);return}
    return _menu.apply(this,arguments);
  };
  onState6(function(){if(card)renderCard()});
  M6.hooks.leave.push(function(){closeCard();CH={};secLoaded=''});

  /* ---------- botões: mapa e barra da Visão de Mesa ---------- */
  function ensureUi(){
    try{
      var gm=isGM6()&&camp3();
      var st=MAP7&&MAP7.stage,fab=st&&st.querySelector('.npc-fab');
      if(st&&gm&&!fab){var b=document.createElement('button');b.type='button';b.className='btn small primary npc-fab';b.textContent='＋ Novo Token NPC';b.setAttribute('aria-label','Criar um novo token de NPC sem ficha');b.onclick=function(){openForm()};st.appendChild(b)}
      else if(fab&&!gm)fab.remove();
      var bar=$('#mbImg'),nb=$('#mbNpc');
      if(bar&&gm&&!nb){var b2=document.createElement('button');b2.type='button';b2.className='btn small';b2.id='mbNpc';b2.textContent='＋ Novo Token NPC';b2.onclick=function(){openForm()};bar.after(b2)}
      else if(nb&&!gm)nb.remove();
    }catch(e){}
  }
  setInterval(function(){if(!document.hidden)ensureUi()},1500);
  window.addEventListener('tulpa:sync',ensureUi);

  /* mapa: marca "oculto" para o Mestre */
  var _hud=T3.tokHud;
  T3.tokHud=function(x,t,ch,d,cx,cy,r,sz){
    if(_hud)_hud.apply(this,arguments);
    if(t&&t.npc&&t.npc.hid&&isGM6()){x.save();x.font='700 '+Math.max(11,r*.6)+'px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.7)';x.beginPath();x.arc(cx+r*.75,cy-r*.75,Math.max(8,r*.32),0,Math.PI*2);x.fill();x.fillStyle='#fff';x.fillText('🙈',cx+r*.75,cy-r*.75+1);x.restore()}
  };

  T3.npc={create:openForm,roles:ROLES,isNpc:isNpc,openCard:function(id){var t=toks().find(function(q){return q.id===id});if(t)openCard(t)}};
})();
