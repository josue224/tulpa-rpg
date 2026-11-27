/* ===================================================================
   TULPA · ETAPA 6 — nova Visão de Mesa
   Caixa do Mestre (M), lugares dos jogadores (P) simétricos, estado
   compartilhado da mesa, entrada do jogador (personagem, foto e token),
   rolagem de atributo puro e troca de atributo, imagens pop-up e
   Documentos, música do YouTube, playlist, intervalo, bloco de notas e
   comandos do Mestre para o Perseus.
   O mapa tático está em t7.js e a chamada de voz em t8.js.
   =================================================================== */
const NARR_IMG='data:image/jpeg;base64,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';
const NARRADOR={name:'Narrador',avatar:NARR_IMG,stage:1,vital:999,statuses:[]};
const M6={
  state:null,campId:null,backend:'',ch:null,dbch:null,live:false,
  present:{},joinedAt:0,myChar:null,
  assetCache:{},maps:[],docs:[],gmNotes:[],
  openSeats:new Set(),tab:'',seenDocs:null,saveTimer:null,saving:Promise.resolve(),
  hooks:{state:[],cast:[],layout:[],leave:[]},
};
T3.mesa=M6;
const defState6=()=>({v:1,rev:0,speaker:{mode:'narrator',charId:null},map:null,mapCfg:{},tokens:[],cam:{x:.5,y:.5,z:1},fog:{on:false,open:[]},music:null,playlist:[],pause:{on:false,since:0},call:{on:false,id:'',whisper:null}});
M6.state=defState6();
const isGM6=()=>role3()==='master';
const cloud6=()=>!!(sb()&&window.tulpaCloudUser&&camp3()&&typeof sb().from==='function');
const gmChar6=ch=>{const c=camp3();return !!ch&&(!ch.ownerId||ch.ownerId===c?.createdBy||(isGM6()&&ch.ownerId===uid3()))};
const tableOpen6=()=>{const t=$('tablePanel');return !!t&&!t.classList.contains('hide')&&$('portal')?.style.display!=='none'};
const dOf6=ch=>ch?(ch.id===activeCharacterId?data:ch.data)||{}:{};
const lsGet6=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet6=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};

/* ---------- armazenamento da mesa ----------
   1) tabela campaign_store (tulpa-mesa.sql) quando existir;
   2) sem ela, reserva em campaign_items (chaves com prefixo "mesa~");
   3) fora da nuvem, localStorage. */
const KP6='mesa~';
const noStore6=e=>!!e&&(e.code==='42P01'||e.code==='PGRST205'||e.code==='PGRST202'||/campaign_store/i.test(e.message||''));
async function stDetect6(){
  if(M6.backend)return M6.backend;
  if(!cloud6())return M6.backend='local';
  /* só a tabela inexistente justifica a reserva (campaign_items). Um erro passageiro (rede, token expirando) NÃO pode fixar a reserva para a sessão toda:
     o Player passaria a ler campaign_items enquanto o Mestre grava em campaign_store e nunca mais veria as mudanças. Nesse caso o erro sobe e a detecção é refeita. */
  try{const {error}=await sb().from('campaign_store').select('key').eq('campaign_id',camp3().id).limit(1);if(error)throw error;M6.backend='store'}
  catch(e){if(!noStore6(e))throw e;M6.backend='items'}
  return M6.backend;
}
const lk6=key=>'tulpa_mesa_'+(camp3()?.id||'local')+'_'+key;
async function stGet6(key){
  const b=await stDetect6(),cid=camp3()?.id;
  if(b==='local')return lsGet6(lk6(key),null);
  if(b==='store'){const {data:r,error}=await sb().from('campaign_store').select('value').eq('campaign_id',cid).eq('key',key).limit(1);if(error)throw error;return r&&r[0]?r[0].value:null}
  const {data:r,error}=await sb().from('campaign_items').select('item').eq('campaign_id',cid).eq('item_key',KP6+key).limit(1);if(error)throw error;return r&&r[0]?r[0].item?.value??null:null;
}
/* a imagem (pesada) vai para campaign_blobs, fora do tempo real; o registro leve fica em campaign_store */
async function blobPut6(key,dataUrl,audience=null){
  const b=await stDetect6(),cid=camp3()?.id;
  if(b==='local'){if(!lsSet6(lk6('blob:'+key),dataUrl))M6.assetCache[key]=dataUrl;return}
  if(b==='store'){const {error}=await sb().from('campaign_blobs').upsert({campaign_id:cid,key,data:dataUrl,audience},{onConflict:'campaign_id,key'});if(error)throw error;return}
  const k=KP6+'blob:'+key,{data:r,error:e0}=await sb().from('campaign_items').select('id').eq('campaign_id',cid).eq('item_key',k).limit(1);if(e0)throw e0;
  const item={kind:'blob',value:{data:dataUrl},audience};
  if(r&&r[0]){const {error}=await sb().from('campaign_items').update({item,updated_at:new Date().toISOString()}).eq('id',r[0].id);if(error)throw error}
  else{const {error}=await sb().from('campaign_items').insert({campaign_id:cid,item_key:k,item,creator_label:myLabel()});if(error)throw error}
}
async function blobGet6(key){
  const b=await stDetect6(),cid=camp3()?.id;
  if(b==='local')return lsGet6(lk6('blob:'+key),null);
  if(b==='store'){const {data:r,error}=await sb().from('campaign_blobs').select('data').eq('campaign_id',cid).eq('key',key).limit(1);if(error)throw error;return r&&r[0]?r[0].data:null}
  const {data:r,error}=await sb().from('campaign_items').select('item').eq('campaign_id',cid).eq('item_key',KP6+'blob:'+key).limit(1);if(error)throw error;return r&&r[0]?r[0].item?.value?.data??null:null;
}
async function blobDel6(key){
  const b=await stDetect6(),cid=camp3()?.id;
  try{
    if(b==='local'){localStorage.removeItem(lk6('blob:'+key));return}
    if(b==='store'){await sb().from('campaign_blobs').delete().eq('campaign_id',cid).eq('key',key);return}
    await sb().from('campaign_items').delete().eq('campaign_id',cid).eq('item_key',KP6+'blob:'+key);
  }catch(e){}
}
async function stPut6(key,kind,value,audience=null){
  if(value&&typeof value.data==='string'&&value.data.length>1500){const {data:blob,...rest}=value;await blobPut6(key,blob,audience);value=rest}
  const b=await stDetect6(),cid=camp3()?.id;
  if(b==='local'){lsSet6(lk6(key),value);const ix=lsGet6(lk6('~index'),[]).filter(x=>x.key!==key);ix.push({key,kind,audience,meta:value?.meta||null,created_at:new Date().toISOString(),created_by:uid3()});lsSet6(lk6('~index'),ix);return}
  if(b==='store'){const {error}=await sb().from('campaign_store').upsert({campaign_id:cid,key,kind,value,audience,updated_at:new Date().toISOString()},{onConflict:'campaign_id,key'});if(error)throw error;return}
  const {data:r,error:e0}=await sb().from('campaign_items').select('id').eq('campaign_id',cid).eq('item_key',KP6+key).limit(1);if(e0)throw e0;
  const item={kind,value,audience};
  if(r&&r[0]){const {error}=await sb().from('campaign_items').update({item,updated_at:new Date().toISOString()}).eq('id',r[0].id);if(error)throw error}
  else{const {error}=await sb().from('campaign_items').insert({campaign_id:cid,item_key:KP6+key,item,creator_label:myLabel()});if(error)throw error}
}
async function stDel6(key){
  const b=await stDetect6(),cid=camp3()?.id;
  if(/^(map|doc):/.test(key))await blobDel6(key);
  if(b==='local'){try{localStorage.removeItem(lk6(key))}catch(e){}lsSet6(lk6('~index'),lsGet6(lk6('~index'),[]).filter(x=>x.key!==key));return}
  if(b==='store'){const {error}=await sb().from('campaign_store').delete().eq('campaign_id',cid).eq('key',key);if(error)throw error;return}
  const {error}=await sb().from('campaign_items').delete().eq('campaign_id',cid).eq('item_key',KP6+key);if(error)throw error;
}
async function stList6(kind){
  const b=await stDetect6(),cid=camp3()?.id;
  if(b==='local')return lsGet6(lk6('~index'),[]).filter(x=>x.kind===kind);
  if(b==='store'){const {data:r,error}=await sb().from('campaign_store').select('key,kind,audience,created_by,created_at,meta:value->meta').eq('campaign_id',cid).eq('kind',kind).order('created_at',{ascending:true}).limit(300);if(error)throw error;return r||[]}
  const {data:r,error}=await sb().from('campaign_items').select('item_key,created_by,created_at,kind:item->>kind,audience:item->audience,meta:item->value->meta').eq('campaign_id',cid).like('item_key',KP6+'%').order('created_at',{ascending:true}).limit(300);if(error)throw error;
  return(r||[]).filter(x=>x.kind===kind).map(x=>({...x,key:String(x.item_key).slice(KP6.length)}));
}
/* imagem guardada (mapa ou documento): busca uma vez e mantém em memória */
async function assetData6(key){
  if(M6.assetCache[key])return M6.assetCache[key];
  const v=await blobGet6(key);
  if(v)M6.assetCache[key]=v;
  return v||null;
}

/* ---------- estado compartilhado ---------- */
function onState6(fn){M6.hooks.state.push(fn)}
function applyState6(why){M6.hooks.state.forEach(f=>{try{f(M6.state,why)}catch(e){console.warn('[T6] estado',e)}})}
function acceptState6(st,why='remoto'){
  if(!st||typeof st!=='object')return;
  if((Number(st.rev)||0)<(Number(M6.state.rev)||0)&&isGM6())return; /* eco de uma gravação antiga do próprio Mestre */
  M6.state={...defState6(),...st};applyState6(why);
}
/* só o Mestre altera o estado da mesa */
function setState6(patch,{silent=false}={}){
  if(!isGM6()){console.warn('[T6] só o Mestre altera a mesa');return false}
  /* a revisão acompanha o relógio: o servidor soma +1 a cada token movido e, com um contador simples, esse +1 empatava com a edição ainda não gravada do Mestre (a troca de mapa se perdia) */
  M6.state={...M6.state,...patch,rev:Math.max((Number(M6.state.rev)||0)+1,Date.now())};
  if(!silent)applyState6('local');
  clearTimeout(M6.saveTimer);M6.saveTimer=setTimeout(flushState6,220);
  return true;
}
function flushState6(){
  clearTimeout(M6.saveTimer);M6.saveTimer=null;
  const snap=JSON.parse(JSON.stringify(M6.state));
  M6.saving=M6.saving.then(()=>stPut6('state','state',snap)).then(()=>{cast6({t:'state',rev:snap.rev})}).catch(e=>{console.warn('[T6] salvar mesa',e);if(!M6.warned){M6.warned=true;toast('Não consegui salvar o estado da mesa: '+(e?.message||'erro'))}});
  return M6.saving;
}
T3.mesaSet=setState6;T3.mesaState=()=>M6.state;

/* ---------- canal ao vivo (transmissão + presença) ---------- */
function onCast6(fn){M6.hooks.cast.push(fn)}
function cast6(o){try{if(M6.ch&&M6.live&&typeof M6.ch.send==='function')M6.ch.send({type:'broadcast',event:'m',payload:{...o,from:uid3()}})}catch(e){}}
function trackMe6(){
  try{if(M6.ch&&M6.live&&typeof M6.ch.track==='function')M6.ch.track({uid:uid3(),role:role3(),name:myLabel(),charId:M6.myChar||null,at:M6.joinedAt,hand:M6.myHand||0})}catch(e){}
}
function presentUids6(){return Object.keys(M6.present)}
function readPresence6(){
  const out={};
  try{const ps=M6.ch.presenceState();Object.values(ps).forEach(list=>(list||[]).forEach(p=>{if(p&&p.uid&&(!out[p.uid]||p.at<out[p.uid].at))out[p.uid]=p}))}catch(e){}
  M6.present=out;
}
/* aviso leve para o indicador de sincronização (js/60l) */
function sync6(){try{window.dispatchEvent(new CustomEvent('tulpa:sync'))}catch(e){}}
/* canal de transmissão e presença */
function subMesaCh6(id){
  const ch=sb().channel('tulpa-mesa-'+id,{config:{broadcast:{self:false},presence:{key:uid3()||rid()}}});
  ch.on('broadcast',{event:'m'},({payload})=>{if(M6.campId!==id||!payload)return;M6.hooks.cast.forEach(f=>{try{f(payload)}catch(e){console.warn('[T6] transmissão',e)}})});
  ch.on('presence',{event:'sync'},()=>{if(M6.campId!==id)return;readPresence6();layoutMesa6();M6.hooks.layout.forEach(f=>{try{f()}catch(e){}})});
  M6.chSt='JOINING';
  ch.subscribe(st=>{
    if(M6.ch!==ch||M6.campId!==id)return;
    M6.chSt=st;
    if(st==='SUBSCRIBED'){M6.live=true;trackMe6()}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED')M6.live=false;
    sync6();
  });
  M6.ch=ch;
}
/* registros da mesa (campaign_store, ou campaign_items na reserva) em tempo real */
function subDb6(id){
  const tbl=M6.backend==='store'?'campaign_store':'campaign_items';
  const ch=sb().channel('tulpa-store-'+id).on('postgres_changes',{event:'*',schema:'public',table:tbl,filter:'campaign_id=eq.'+id},p=>{if(M6.campId===id)onStoreChange6(p)});
  M6.dbSt='JOINING';
  ch.subscribe(st=>{if(M6.dbch!==ch||M6.campId!==id)return;M6.dbSt=st;sync6()});
  M6.dbch=ch;
}
/* refaz os dois canais (usado pela reconexão com espera do 60l) */
function resubMesa6(){
  const id=M6.campId;if(!id||!cloud6()||typeof sb().channel!=='function')return false;
  const a=M6.ch,b=M6.dbch;M6.ch=M6.dbch=null;M6.live=false;
  try{if(a)sb().removeChannel(a)}catch(e){}
  try{if(b)sb().removeChannel(b)}catch(e){}
  try{subMesaCh6(id);subDb6(id)}catch(e){console.warn('[T6] reconectar canais',e);return false}
  return true;
}
/* relê o que o tempo real pode ter perdido: estado da mesa, documentos e lista de mapas */
async function resyncMesa6(){
  const id=M6.campId;if(!id)return false;
  const st=await stGet6('state');if(M6.campId!==id)return false;
  if(st&&typeof st==='object'&&(Number(st.rev)||0)!==(Number(M6.state.rev)||0))acceptState6(st,'resync');
  refreshDocs6();T3.mapRefreshList?.();
  return true;
}
T3.mesaResub=resubMesa6;T3.mesaResync=resyncMesa6;
async function joinMesa6(){
  const c=camp3();if(!c)return;
  if(M6.campId===c.id)return;
  if(M6.joinFailAt&&Date.now()-M6.joinFailAt<3000)return;
  leaveMesa6();
  M6.campId=c.id;M6.backend='';M6.state=defState6();M6.present={};M6.myChar=null;M6.maps=[];M6.docs=[];M6.live=false;
  const jk='tulpa_join_'+c.id;let at=0;try{at=Number(sessionStorage.getItem(jk))||0}catch(e){}
  if(!at){at=Date.now();try{sessionStorage.setItem(jk,String(at))}catch(e){}}
  M6.joinedAt=at;
  try{M6.myChar=sessionStorage.getItem('tulpa_mychar_'+c.id)||null}catch(e){}
  M6.seenDocs=new Set(lsGet6('tulpa_docs_seen_'+(uid3()||'x'),[]));
  M6.gmNotes=lsGet6('tulpa_bn_gm_'+c.id,[]);
  const id=c.id;
  try{await stDetect6()}catch(e){
    /* sem saber qual armazenamento a campanha usa, não dá para assinar o canal certo: desfaz a entrada e deixa o módulo de sincronização (60l) tentar de novo com espera */
    console.warn('[T6] detectar armazenamento',e);if(M6.campId===id){leaveMesa6();M6.joinFailAt=Date.now()}sync6();return;
  }
  if(M6.campId!==id)return;
  if(cloud6()&&typeof sb().channel==='function'){
    try{subMesaCh6(id);subDb6(id)}catch(e){console.warn('[T6] canal da mesa',e)}
  }
  try{const st=await stGet6('state');if(M6.campId!==id)return;if(st)acceptState6(st,'carga');else applyState6('carga')}catch(e){console.warn('[T6] carregar mesa',e);applyState6('carga')}
  if(isGM6()&&M6.backend==='store'){try{const v=await stGet6('gmnotes:'+uid3());if(v&&Array.isArray(v.list)&&v.list.length>=M6.gmNotes.length){M6.gmNotes=v.list;lsSet6('tulpa_bn_gm_'+id,M6.gmNotes)}}catch(e){}}
  refreshDocs6();T3.mapRefreshList?.();
}
function leaveMesa6(){
  M6.hooks.leave.forEach(f=>{try{f()}catch(e){}});
  const a=M6.ch,b=M6.dbch;M6.ch=M6.dbch=null;M6.live=false;M6.campId=null;M6.chSt=M6.dbSt='';clearTimeout(M6.saveTimer);
  try{if(a)sb()?.removeChannel(a)}catch(e){}
  try{if(b)sb()?.removeChannel(b)}catch(e){}
  sync6();
}
/* junta rajadas de eventos em um só refresh (refreshDocs6 e a lista de mapas são idempotentes) */
const RF6={t:null,docs:false,maps:false,arrived:null};
function refreshSoon6(docs,maps,arrivedKey){
  if(docs)RF6.docs=true;if(maps)RF6.maps=true;if(arrivedKey)RF6.arrived=arrivedKey;
  if(RF6.t)return;
  RF6.t=setTimeout(()=>{
    const d=RF6.docs,m=RF6.maps,k=RF6.arrived;RF6.t=null;RF6.docs=RF6.maps=false;RF6.arrived=null;
    try{if(m)T3.mapRefreshList?.()}catch(e){}
    if(d)Promise.resolve(refreshDocs6()).then(()=>{if(k)docArrived6(k)}).catch(()=>{});
  },250);
}
function onStoreChange6(p){
  const row=p.new&&Object.keys(p.new).length?p.new:null,items=M6.backend!=='store';
  if(!row){refreshSoon6(true,true);return} /* exclusão */
  let key=items?row.item_key:row.key;if(!key)return;
  if(items){if(!String(key).startsWith(KP6))return;key=String(key).slice(KP6.length)}
  if(String(key).startsWith('blob:'))return;
  const kind=items?row.item?.kind:row.kind,val=items?row.item?.value:row.value;
  if(key==='state'){if(val&&typeof val==='object')acceptState6(val);else stGet6('state').then(v=>acceptState6(v)).catch(()=>{});return}
  if(kind==='doc'){refreshSoon6(true,false,p.eventType==='INSERT'?key:null);return}
  if(kind==='map'){refreshSoon6(false,true);return}
  if(!kind)refreshSoon6(true,true)
}
onCast6(p=>{
  if(p.t==='state'&&!isGM6()&&(p.rev||0)>(M6.state.rev||0))stGet6('state').then(v=>acceptState6(v)).catch(()=>{});
  if(p.t==='doc')refreshDocs6().then(()=>docArrived6(p.key));
});
window.addEventListener('beforeunload',()=>{try{if(M6.saveTimer)flushState6()}catch(e){}});

/* ---------- lugares à mesa ---------- */
function seats6(){
  const c=camp3();if(!c)return{players:[],gm:[]};
  const all=chars3(),gm=all.filter(gmChar6),pcs=all.filter(x=>!gmChar6(x));
  const byOwner=new Map();pcs.forEach(ch=>{if(!byOwner.has(ch.ownerId))byOwner.set(ch.ownerId,[]);byOwner.get(ch.ownerId).push(ch)});
  const havePresence=M6.live&&presentUids6().length>0;
  const list=[];
  byOwner.forEach((chs,owner)=>{
    const pr=M6.present[owner],mine=owner===uid3();
    let pick=chs.find(x=>x.id===(mine?M6.myChar:pr?.charId));
    if(!pick)pick=chs.find(inScene)||chs[0];
    list.push({uid:owner,ch:pick,others:chs.filter(x=>x!==pick),present:!havePresence||!!pr||mine,at:(mine?M6.joinedAt:pr?.at)||Number.MAX_SAFE_INTEGER});
  });
  const ix=new Map(all.map((c,i)=>[c.id,i]));
  list.sort((a,b)=>(b.present-a.present)||(a.at-b.at)||(ix.get(a.ch.id)-ix.get(b.ch.id)));
  return{players:list,gm};
}
/* quem está usando qual personagem (para a call, sussurro e pop-ups) */
function charOfUser6(uid){const s=seats6().players.find(x=>x.uid===uid);return s?s.ch:null}
T3.mesaSeats=seats6;T3.mesaCharOfUser=charOfUser6;

function paneEl6(id){return $q(`#mesaDock [data-pane="${id}"]`)}
function ensureMesaDom6(){
  const tp=$('tablePanel'),box=$('tableCharacters');if(!tp||!box)return null;
  let w=$('mesaWrap');
  if(w)return w;
  /* outros módulos inserem painéis "antes de #tableCharacters": continuam funcionando depois que ele muda de lugar */
  const _ib=tp.insertBefore.bind(tp);
  tp.insertBefore=function(n,ref){if(ref&&ref.parentNode!==tp)ref=$('mesaWrap')&&$('mesaWrap').parentNode===tp?$('mesaWrap'):null;return _ib(n,ref)};
  const bar=document.createElement('div');bar.id='mesaBar';bar.className='mesa-bar';
  bar.innerHTML=`<div class="mb-group" id="mbCall"></div><div class="mb-group mb-right"><div class="mb-vol" id="mbMusic"></div><span id="mbGm"></span></div>`;
  w=document.createElement('div');w.id='mesaWrap';
  const center=document.createElement('div');center.id='mesaCenter';
  center.innerHTML=`<section id="mesaM" class="mesa-m" aria-label="Mestre"></section>
   <section id="mapStage" class="map-stage" aria-label="Mesa: mapa tático"><div class="map-empty"><b>MESA</b><span>O mapa aparece aqui.</span></div></section>
   <section id="mesaDock" class="mesa-dock"><div class="dock-tabs" role="tablist">${[['combate','⚔ Combate'],['rolagens','🎲 Rolagens'],['chat','💬 Chat'],['docs','📂 Documentos'],['musica','🎵 Música'],['notas','📝 Notas']].map(([id,l])=>`<button type="button" role="tab" data-dock="${id}">${l}</button>`).join('')}</div>${['combate','rolagens','chat','docs','musica','notas'].map(id=>`<div class="dock-pane" data-pane="${id}" hidden></div>`).join('')}</section>`;
  tp.insertBefore(bar,box);tp.insertBefore(w,box);w.append(center,box);
  const gate=document.createElement('div');gate.id='mesaGate';gate.hidden=true;w.append(gate);
  $$('[data-dock]',center).forEach(b=>b.onclick=()=>setDock6(b.dataset.dock,true));
  paneEl6('rolagens').innerHTML='<div id="mesaQuick" class="mesa-quick"></div>';
  paneEl6('chat').innerHTML='<div id="mesaChat"></div>';
  paneEl6('docs').innerHTML='<div id="mesaDocs"></div>';
  paneEl6('musica').innerHTML='<div id="mesaMusic"></div>';
  paneEl6('notas').innerHTML='<div id="mesaNotes"></div>';
  setDock6(M6.tab||'rolagens');
  return w;
}
function setDock6(id,user=false){
  M6.tab=id;if(user)M6.tabUser=Date.now();
  $$('#mesaDock [data-dock]').forEach(b=>{const on=b.dataset.dock===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
  $$('#mesaDock [data-pane]').forEach(p=>{p.hidden=p.dataset.pane!==id});
  if(id==='chat'&&typeof renderChat9==='function')renderChat9();if(id==='docs')renderDocs6();if(id==='musica')renderMusic6();if(id==='notas')renderNotes6();if(id==='rolagens')renderQuick6();
}
/* o painel de ação em combate passa a morar na aba Combate */
ensureCombatPanel=function(){
  const tp=$('tablePanel');if(!tp)return null;let p=$('t3Combat');
  if(!p){p=document.createElement('section');p.id='t3Combat';p.className='combat-panel hide';(paneEl6('combate')||tp).append(p)}
  return p;
};
function layoutMesa6(){
  if(!camp3())return;
  const w=ensureMesaDom6();if(!w)return;
  const pc=paneEl6('combate'),pr=paneEl6('rolagens');
  ['sceneTools','combatPanel','roundPanel','t3Combat'].forEach(id=>{const e=$(id);if(e&&e.parentNode!==pc)pc.append(e)});
  {const h=$('rollHistoryPanel');if(h&&h.parentNode!==pr)pr.append(h)}
  const {players,gm}=seats6(),isM=isGM6();
  const cards=new Map($$('#tableCharacters .table-char').map(c=>[c.dataset.cid,c]));
  const seated=new Set();let L=0,R=0,n=0;
  players.forEach(s=>{
    const card=cards.get(s.ch.id);if(!card)return;
    if(!isM&&!inScene(s.ch)&&s.uid!==uid3())return;
    const left=n%2===0;n++;seated.add(s.ch.id);
    card.classList.add('seat');card.classList.toggle('absent',!s.present);card.classList.toggle('mine',s.uid===uid3());
    card.style.setProperty('--col',left?1:3);card.style.setProperty('--row',left?++L:++R);
    card.dataset.uid=s.uid;seatCard6(card,s);
  });
  cards.forEach((card,id)=>{if(!seated.has(id)){card.classList.add('off-seat');card.classList.remove('seat')}});
  const rows=Math.max(L,R,1);
  w.style.setProperty('--tpl',`repeat(${rows},auto) 1fr`);w.style.setProperty('--rows',rows+1);
  w.classList.toggle('no-seats',n===0);
  renderM6(gm);renderBar6();
  /* combate ativo abre a aba Combate (a não ser que a pessoa acabou de escolher outra) */
  const act=!!camp3()?.combat?.active;
  if(act&&!M6.wasCombat&&Date.now()-(M6.tabUser||0)>4000)setDock6('combate');
  M6.wasCombat=act;
  const tb=$q('#mesaDock [data-dock="combate"]');if(tb)tb.classList.toggle('alert',act);
  if(M6.tab==='rolagens')renderQuick6();
  checkPrivateDocs6();entryFlow6();
}
/* cartão compacto de cada lugar "P": foto, nome, Vital, Essência, Lucidez, DF e estados */
function seatCard6(card,s){
  const ch=s.ch;
  $$('.resource-row',card).forEach(r=>{const b=r.querySelector('.resource-bar');if(!b)return;const k=b.classList.contains('vt')?'VT':b.classList.contains('es')?'ES':'LU';r.dataset.k=k;const lab=r.querySelector('label');if(lab){lab.dataset.k=k;lab.title=lab.textContent}});
  if(!card.querySelector('.seat-more')){
    const b=document.createElement('button');b.type='button';b.className='seat-more';b.title='Mostrar ou esconder os controles';b.setAttribute('aria-label','Controles de '+nm(ch));b.textContent='⋯';
    b.onclick=()=>{const o=!M6.openSeats.has(ch.id);o?M6.openSeats.add(ch.id):M6.openSeats.delete(ch.id);card.classList.toggle('open',o)};
    (card.querySelector('.tc-head')||card).append(b);
  }
  card.classList.toggle('open',M6.openSeats.has(ch.id));
  let tag=card.querySelector('.seat-tag');
  const txt=!s.present?'ausente':'';
  if(txt){if(!tag){tag=document.createElement('span');tag.className='seat-tag';card.querySelector('.tc-id')?.append(tag)}tag.textContent=txt}else tag?.remove();
  /* rolagem pela mesa com escolha de atributo */
  let rb=card.querySelector('.mesa-roll-btn');
  if(!rb&&(isGM6()||s.uid===uid3())){rb=document.createElement('button');rb.type='button';rb.className='btn primary small mesa-roll-btn';let row=card.querySelector('.table-actions');if(!row){row=document.createElement('div');row.className='table-actions';card.append(row)}row.prepend(rb)}
  if(rb){rb.textContent='🎲 Rolar';rb.onclick=()=>openRollPicker6(ch)}
  if(s.uid===uid3()&&!isGM6()&&(s.others.length)&&!card.querySelector('.seat-swap')){
    const sw=document.createElement('button');sw.type='button';sw.className='btn small seat-swap';sw.textContent='⇄ Trocar personagem';sw.onclick=()=>{M6.myChar=null;try{sessionStorage.removeItem('tulpa_mychar_'+camp3().id)}catch(e){}entryFlow6(true)};
    card.append(sw);
  }
}

/* ---------- caixa "M": Mestre, narrador e NPCs ---------- */
function speaker6(){
  const sp=M6.state.speaker||{},ch=sp.mode==='char'?charById(sp.charId):null;
  return ch&&gmChar6(ch)?{mode:'char',ch}:{mode:'narrator',ch:null};
}
function renderM6(gm){
  const box=$('mesaM');if(!box)return;
  gm=gm||seats6().gm;const isM=isGM6(),sp=speaker6();
  const vis=gm.filter(ch=>isM||inScene(ch));
  const d=sp.ch?dOf6(sp.ch):NARRADOR;
  const hiddenStats=ch=>!!ch.data?.hideStats&&!isM;
  const mini=ch=>{const x=dOf6(ch),mx=dmax(x);if(hiddenStats(ch))return '<span class="sub">🔒 status ocultos</span>';return [['VT','vital',mx.vt,'vt'],['ES','essence',mx.es,'es'],['LU','lucidity',mx.luc,'luc']].map(([l,k,m,c])=>{const v=Math.max(0,Math.min(m,Number(x[k])||0));return `<div class="m-res" data-k="${l}"><span>${l}</span><div class="resource-bar ${c}"><span style="width:${m?v/m*100:0}%"></span></div><b>${v}/${m}</b>${isM?`<span class="m-pm"><button type="button" data-mres="${ch.id}|${k}|-5">−5</button><button type="button" data-mres="${ch.id}|${k}|-1">−</button><button type="button" data-mres="${ch.id}|${k}|1">+</button><button type="button" data-mres="${ch.id}|${k}|5">+5</button></span>`:''}</div>`}).join('')};
  const sig=JSON.stringify([isM,sp.mode,sp.ch?.id,sp.ch?[nm(sp.ch),d.vital,d.essence,d.lucidity,d.stage,stIds(d),d.hideStats,inScene(sp.ch)]:0,vis.map(c=>[c.id,nm(c),inScene(c)])]);
  if(box.dataset.sig!==sig){
    box.dataset.sig=sig;
    box.innerHTML=`<div class="m-main"><div class="m-av" id="mAv"></div><div class="m-id"><small>${sp.ch?'Mestre · falando como':'Mestre · narrando'}</small><b>${esc(sp.ch?nm(sp.ch):'Narrador')}</b>${sp.ch?`<div class="m-chips">${statusChips(d)||''}${hiddenStats(sp.ch)?'':`<span class="pill">DF ${E.defenseInfo(d).DF}</span>`}</div>`:''}</div></div>
    ${sp.ch?`<div class="m-bars">${mini(sp.ch)}</div>`:''}
    ${isM&&sp.ch?`<div class="m-act"><button type="button" class="btn small primary" data-mact="roll">🎲 Rolar</button><button type="button" class="btn small" data-mact="sheet">Abrir ficha</button><button type="button" class="btn small" data-mact="st">☠ Estados</button><button type="button" class="btn small" data-mact="hide">${sp.ch.data?.hideStats?'👁 Mostrar status':'🙈 Ocultar status'}</button><button type="button" class="btn small" data-mact="scene">${inScene(sp.ch)?'◉ Na cena':'◌ Fora da cena'}</button></div>`:''}
    ${isM?`<div class="m-cast" role="group" aria-label="Quem está falando"><button type="button" class="m-chip ${sp.mode==='narrator'?'on':''}" data-speak=""><span class="m-chip-av" data-av="narr"></span>Narrador</button>${vis.map(ch=>`<button type="button" class="m-chip ${sp.ch?.id===ch.id?'on':''} ${inScene(ch)?'':'out'}" data-speak="${ch.id}" title="Falar como ${esc(nm(ch))}"><span class="m-chip-av" data-av="${ch.id}"></span>${esc(nm(ch))}</button>`).join('')}${vis.length?'':'<span class="sub">Crie NPCs e chefes em Personagens para falar por eles.</span>'}</div>`
      :vis.length?`<div class="m-cast">${vis.map(ch=>`<span class="m-chip ro ${sp.ch?.id===ch.id?'on':''}"><span class="m-chip-av" data-av="${ch.id}"></span>${esc(nm(ch))}</span>`).join('')}</div>`:''}`;
    $$('[data-speak]',box).forEach(b=>b.onclick=()=>{const id=b.dataset.speak;setState6({speaker:id?{mode:'char',charId:id}:{mode:'narrator',charId:null}});fx5('click')});
    $$('[data-mres]',box).forEach(b=>b.onclick=()=>{const [id,k,dl]=b.dataset.mres.split('|');const real=$q(`#tableCharacters .table-char[data-cid="${id}"] [data-res="${id}|${k}|${dl}"]`);if(real)real.click();else mutateChar(charById(id),x=>{const mx=dmax(x),m={vital:mx.vt,essence:mx.es,lucidity:mx.luc}[k];if(k==='lucidity'&&Number(dl)<0){E.applyLucidityDamage(x,-Number(dl));return}x[k]=Math.max(0,Math.min(m,(Number(x[k])||0)+Number(dl)))})});
    $$('[data-mact]',box).forEach(b=>b.onclick=()=>{const ch=speaker6().ch;if(!ch)return;const a=b.dataset.mact;
      if(a==='roll')openRollPicker6(ch);else if(a==='sheet')loadCharacter(ch.id);else if(a==='st')masterStatuses(ch);else if(a==='hide')toggleHideStats(ch);
      else if(a==='scene'){const eye=$q(`#tableCharacters .table-char[data-cid="${ch.id}"] .scene-eye`);if(eye&&!eye.disabled)eye.click();else toast('A cena fica travada durante o combate.')}});
  }
  /* as fotos são nós guardados: não piscam quando a caixa é redesenhada */
  const av=$('mAv');if(av){const n=sp.ch?avNode('m:'+sp.ch.id,d,'xl'):avNode('m:narr',NARRADOR,'xl narr');if(av.firstElementChild!==n)av.replaceChildren(n)}
  $$('.m-chip-av',box).forEach(h=>{const id=h.dataset.av,n=id==='narr'?avNode('mc:narr',NARRADOR,'sm narr'):avNode('mc:'+id,dOf6(charById(id)),'sm');if(h.firstElementChild!==n)h.replaceChildren(n)});
  T3.voicePaint?.();
}
onState6(()=>{if(tableOpen6()){renderM6();renderBar6()}});

/* ---------- barra de ferramentas da mesa ---------- */
function renderBar6(){
  const g=$('mbGm');if(!g)return;
  const isM=isGM6(),p=M6.state.pause?.on;
  const sig=[isM,p].join();
  if(g.dataset.sig!==sig){
    g.dataset.sig=sig;
    g.innerHTML=isM?`<button type="button" class="btn small" id="mbImg">🖼 Enviar imagem</button><button type="button" class="btn small ${p?'primary':''}" id="mbPause">${p?'▶ Retomar sessão':'⏸ Intervalo'}</button>`:'';
    if(isM){$('mbImg').onclick=openSendDoc6;$('mbPause').onclick=()=>togglePause6()}
  }
  renderVol6();T3.voiceBar?.();
}

/* ---------- entrada do jogador: personagem, foto e token ---------- */
const tokOk6=d=>avOk(d?.tokenAvatar);
async function imgSquare6(file,S=192){
  if(!file||!/^image\//.test(file.type))throw new Error('escolha um arquivo de imagem (JPG, PNG ou WEBP)');
  if(file.size>20e6)throw new Error('a imagem passa de 20 MB');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('imagem inválida'));i.src=url});
    const cv=document.createElement('canvas');cv.width=cv.height=S;const w=img.naturalWidth,h=img.naturalHeight,m=Math.min(w,h),x=cv.getContext('2d');
    x.fillStyle='#2b211b';x.fillRect(0,0,S,S);x.imageSmoothingQuality='high';x.drawImage(img,(w-m)/2,(h-m)*.3,m,m,0,0,S,S);
    let q=.86,out=cv.toDataURL('image/jpeg',q);while(out.length>30000&&q>.4){q-=.08;out=cv.toDataURL('image/jpeg',q)}
    if(!avOk(out))throw new Error('não consegui converter a imagem');
    return out;
  }finally{URL.revokeObjectURL(url)}
}
/* imagem grande (mapa, documento): reduz o lado maior e a qualidade até caber no limite */
async function imgFit6(file,max=1600,limit=700000){
  if(!file||!/^image\//.test(file.type))throw new Error('escolha um arquivo de imagem (JPG, PNG ou WEBP)');
  if(file.size>40e6)throw new Error('a imagem passa de 40 MB');
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('imagem inválida'));i.src=url});
    let side=max,out='',w=0,h=0;
    for(let step=0;step<7;step++){
      const k=Math.min(1,side/Math.max(img.naturalWidth,img.naturalHeight));w=Math.max(1,Math.round(img.naturalWidth*k));h=Math.max(1,Math.round(img.naturalHeight*k));
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.fillStyle='#1b1612';x.fillRect(0,0,w,h);x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);
      let q=.86;out=cv.toDataURL('image/jpeg',q);while(out.length>limit&&q>.5){q-=.08;out=cv.toDataURL('image/jpeg',q)}
      if(out.length<=limit)break;side=Math.round(side*.8);
    }
    return{data:out,w,h};
  }finally{URL.revokeObjectURL(url)}
}
T3._imgFit=imgFit6;T3._imgSquare=imgSquare6;
function myChars6(){const u=uid3();return u?chars3().filter(c=>c.ownerId===u&&!gmChar6(c)):[]}
function chooseChar6(id){
  M6.myChar=id;try{sessionStorage.setItem('tulpa_mychar_'+camp3().id,id)}catch(e){}
  trackMe6();layoutMesa6();
}
function entryFlow6(force=false){
  const gate=$('mesaGate');if(!gate)return;
  if(isGM6()||!cloud6()||!tableOpen6()){gate.hidden=true;return}
  const mine=myChars6();if(!mine.length){gate.hidden=true;return}
  let ch=mine.find(c=>c.id===M6.myChar);
  if(!ch&&mine.length===1){chooseChar6(mine[0].id);return}
  if(!ch){
    const sig='pick:'+mine.map(c=>c.id).join();
    if(gate.dataset.sig!==sig||force){
      gate.dataset.sig=sig;
      gate.innerHTML=`<div class="gate-card" role="dialog" aria-label="Escolha do personagem"><h3>Com qual personagem você entra na mesa?</h3><p class="sub">Você tem ${mine.length} personagens nesta campanha. Dá para trocar depois, no seu lugar à mesa.</p><div class="gate-pick">${mine.map(c=>`<button type="button" class="gate-opt" data-pick="${c.id}">${av5(c.data,'lg')}<b>${esc(nm(c))}</b><small>Estágio ${Number(c.data?.stage)||1}</small></button>`).join('')}</div></div>`;
      $$('[data-pick]',gate).forEach(b=>b.onclick=()=>{gate.dataset.sig='';chooseChar6(b.dataset.pick)});
    }
    gate.hidden=false;return;
  }
  const d=dOf6(ch),hasA=avOk(d.avatar),hasT=tokOk6(d);
  if(hasA&&hasT){gate.hidden=true;gate.dataset.sig='';return}
  const sig='img:'+ch.id+hasA+hasT;
  if(gate.dataset.sig!==sig){
    gate.dataset.sig=sig;
    gate.innerHTML=`<div class="gate-card" role="dialog" aria-label="Foto e token do personagem"><h3>${esc(nm(ch))} precisa de foto e de token</h3><p class="sub">A foto aparece no seu lugar à mesa e na chamada. O token é a peça que você move no mapa.</p>
     <div class="gate-imgs">
      <div class="gate-slot ${hasA?'ok':''}"><div class="gate-prev">${hasA?`<img src="${d.avatar}" alt="">`:'<span>?</span>'}</div><b>Foto de perfil</b><button type="button" class="btn small ${hasA?'':'primary'}" data-up="avatar">${hasA?'Trocar foto':'Escolher foto'}</button></div>
      <div class="gate-slot round ${hasT?'ok':''}"><div class="gate-prev">${hasT?`<img src="${d.tokenAvatar}" alt="">`:'<span>?</span>'}</div><b>Token do mapa</b><button type="button" class="btn small ${hasT?'':'primary'}" data-up="tokenAvatar">${hasT?'Trocar token':'Escolher token'}</button>${hasA&&!hasT?'<button type="button" class="btn small" data-same>Usar a mesma foto</button>':''}</div>
     </div><input type="file" accept="image/*" id="gateFile" hidden>${mine.length>1?'<button type="button" class="btn small" data-back>← Escolher outro personagem</button>':''}</div>`;
    let field='avatar';
    $$('[data-up]',gate).forEach(b=>b.onclick=()=>{field=b.dataset.up;$('gateFile').click()});
    $('gateFile').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{const img=await imgSquare6(f);mutateChar(ch,x=>{x[field]=img});fx5('confirm');layoutMesa6()}catch(err){toast('Não consegui usar essa imagem: '+(err.message||'erro')+'.')}};
    const same=$q('[data-same]',gate);if(same)same.onclick=()=>{mutateChar(ch,x=>{x.tokenAvatar=x.avatar});fx5('confirm');layoutMesa6()};
    const back=$q('[data-back]',gate);if(back)back.onclick=()=>{M6.myChar=null;gate.dataset.sig='';entryFlow6(true)};
  }
  gate.hidden=false;
}
/* a ficha também permite trocar o token */
{const _av6=avEditor;avEditor=function(){
  _av6.apply(this,arguments);
  const w=$('avEdit');if(!w)return;
  if(!$('tokEdit')){
    const t=document.createElement('div');t.id='tokEdit';t.className='av-edit tok-edit';
    t.innerHTML=`<button type="button" class="av-btn round" id="tokBtn" aria-label="Trocar o token do mapa"></button><div class="av-txt"><b>Token do mapa</b><span class="sub">A peça redonda que representa o personagem no mapa da Visão de Mesa.</span><div class="inline"><button type="button" class="btn small" id="tokPick">Escolher token</button><button type="button" class="btn small" id="tokSame">Usar a foto</button><button type="button" class="btn small" id="tokDel">Remover</button></div></div><input type="file" id="tokFile" accept="image/*" hidden>`;
    w.after(t);
    const pick=()=>$('tokFile').click();$('tokBtn').onclick=pick;$('tokPick').onclick=pick;
    $('tokFile').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{data.tokenAvatar=await imgSquare6(f);save();fx5('confirm');toast('Token atualizado.')}catch(err){toast('Não consegui usar essa imagem: '+(err.message||'erro')+'.')}};
    $('tokSame').onclick=()=>{if(!avOk(data.avatar)){toast('Escolha primeiro a foto do personagem.');return}data.tokenAvatar=data.avatar;save();toast('O token agora usa a foto do personagem.')};
    $('tokDel').onclick=()=>{if(!data.tokenAvatar)return;delete data.tokenAvatar;save();toast('Token removido.')};
  }
  $('tokBtn').innerHTML=av5({...data,avatar:tokOk6(data)?data.tokenAvatar:null},'xl');
  $('tokDel').style.display=data.tokenAvatar?'':'none';$('tokSame').style.display=avOk(data.avatar)?'':'none';
}}

/* ---------- rolagens: atributo puro e troca de atributo ---------- */
const ATTR8=['Força','Destreza','Constituição','Inteligência','Percepção','Carisma','Aparência','Presença'];
const attrDice6=(d,attr,m=E.computeMods(d))=>Math.max(1,(Number(d.attributes?.[attr])||1)+(m.attrDice[attr]||0)+m.allDice+(E.isPhysAttr(attr)?m.physDice:0));
async function rollAttr6(ch,attr){
  const d=ch?dOf6(ch):data,m=E.computeMods(d),r=attrRoll(d,attr,m);
  const who=ch||{id:null,data:d};
  await announceRoll(who,'Teste de '+attr,{dice:r.dice,sides:20,bonus:0,total:r.total,eyebrow:'ATRIBUTO PURO',note:`${r.n}d20, vale o maior dado. Sem perícia: só o atributo e os modificadores de carga e estado.`,share:!!(ch&&ch.id&&camp3()&&sb()&&(tableOpen6()||prefs.shareSheet))});
  T3.narrateRoll?.({name:nm(who),skill:attr,dice:r.dice,total:r.total});
  return r;
}
/* opts: {vert} especialização · {generalista} "outra área" · {extraDice} situação · {social} contexto CAR/APA */
async function rollSkillAs6(ch,skill,attr,{vert,generalista,extraDice=0,social=null,silent=false}={}){
  const d=dOf6(ch),src={data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},spec=!!(vert||generalista);
  const pick=attr&&ATTR8.includes(attr)?attr:undefined,c=skillCalc3(src,skill,spec?pick:pick||SKILL_ATTR[skill],{vert,generalista});
  if(c.blocked){toast('Essa especialização exige treino específico.');return null}
  skill=c.skill;const base=SKILL_ATTR[skill],use=c.attr,soc=social?E.socialBonus(d,skill,social):null;
  const r=E.rollTest(d,skill,c.SA,{mods:c.mods,bonus:c.bonus+(soc?.bonus||0),extraDice,disadv:c.dis,consumeDelta:true});
  mutateChar(ch,x=>consumeOnce(x,c));
  const name=vert?E.vert(vert)?.name:generalista?'generalista ÷'+E.regra('generalistaDiv'):'';
  const notes=[];if(use!==base&&!vert)notes.push(`Atributo trocado: ${use} no lugar de ${base}`);if(extraDice)notes.push(`situação da especialização: +${extraDice}d20`);if(soc?.bonus)notes.push(`${soc.motivo}: +${soc.bonus} ${soc.attr}`);if(r.mode!=='normal')notes.push(r.mode);
  if(silent)notes.push('rolagem silenciosa: só você vê');
  const label=skill+(name?' · '+name:'')+(use!==base?` (${use})`:'');
  await announceRoll(ch,label,{dice:r.dice,sides:20,bonus:r.bonus,total:r.total,note:notes.join(' · '),share:!silent});
  if(!silent)T3.narrateRoll?.({name:nm(ch),skill:label,dice:r.dice,total:r.total});
  return r;
}
T3.rollAttr=rollAttr6;T3.rollSkillAs=rollSkillAs6;
const SOC6={primeira:{primeira:true},dialogo:{dialogo:true},ancorar:{ancorar:true}};
function openRollPicker6(ch){
  if(!ch||!(isGM6()||ch.ownerId===uid3())){toast('Você só pode rolar pelo seu próprio personagem.');return}
  const d=dOf6(ch),m=E.computeMods(d),src={data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},div=E.regra('generalistaDiv');
  openModal('ROLAGEM NA MESA',nm(ch),`<h4 class="rp6-h">Atributo puro</h4><p class="sub">Rola só o atributo, sem perícia: vale o maior dado.</p><div class="rp6-attrs">${ATTR8.map(a=>`<button type="button" class="mesa-skill" data-pure="${a}"><b>${a}</b><small>${attrDice6(d,a,m)}d20</small></button>`).join('')}</div>
   <h4 class="rp6-h">Perícia ou especialização</h4><div class="rp6-row"><div class="field"><label for="rp6Attr">Rolar com qual atributo?</label><select id="rp6Attr"><option value="">O atributo padrão (ou o melhor da especialização)</option>${ATTR8.map(a=>`<option>${a}</option>`).join('')}</select></div><div class="field"><label for="rp6Soc">Contexto social</label><select id="rp6Soc"><option value="">Nenhum</option><option value="primeira">1ª impressão (Aparência)</option><option value="dialogo">Diálogo contínuo (Carisma)</option><option value="ancorar">Ancorar aliado (Carisma)</option></select></div><div class="field"><label for="rp6Search">Buscar</label><input class="search" id="rp6Search" placeholder="Perícia ou especialização"></div></div>
   <label class="t3-check rp6-sit"><input type="checkbox" id="rp6Sit"> A situação da especialização se aplica (o botão mostra qual e quantos d20)</label>
   <label class="t3-check rp6-silent" hidden><input type="checkbox" id="rp6Silent"> Rolagem silenciosa: sem aviso no histórico da mesa (só vale nas especializações de trancas e sistemas)</label>
   <div id="rp6VBox"><h4 class="rp6-h">Especializações treinadas</h4><div class="mesa-skill-grid" id="rp6Verts"></div></div><h4 class="rp6-h">Perícias</h4><div class="mesa-skill-grid" id="rp6Grid"></div>`,'Fechar',()=>closeModal());
  const draw=()=>{
    const q=normTxt($('rp6Search').value||''),at=$('rp6Attr').value,soc=SOC6[$('rp6Soc').value]||null,sit=$('rp6Sit').checked;
    const sb6=s=>soc?E.socialBonus(d,s,soc).bonus:0;
    const verts=E.trainedVerts(d).map(x=>{const k=skillCalc3(src,x.def.skill,at||undefined,{vert:x.id}),s=E.situations(d,x.id),on=sit&&s.dice;
      return{key:k.skill+' '+x.def.name,html:`<button type="button" class="mesa-skill" data-vert="${esc(x.id)}" data-skill="${esc(k.skill)}" data-dice="${on?s.dice:0}" data-silent="${E.silentVert(d,x.id)?1:0}"><b>${esc(x.def.name)}</b><small>${esc(k.skill)} · ${esc(k.attr)} · ${k.n+(on?s.dice:0)}d20 · ${sign(k.bonus+sb6(k.skill))}${s.dice?` · +${s.dice}d20 se: ${esc(s.labels.join(', '))}`:''}</small></button>`}});
    const gens=[...new Set(E.trainedVerts(d).map(x=>x.def.pericia))].map(pid=>{const p=E.pericia(pid),sk=p.skills[0],k=skillCalc3(src,sk,at||undefined,{generalista:pid});
      return{key:p.name+' generalista outra área',html:`<button type="button" class="mesa-skill" data-gen="${esc(pid)}" data-skill="${esc(sk)}"><b>Outra área de ${esc(p.name)}</b><small>generalista ÷${div} · ${esc(k.attr)} · ${k.n}d20 · ${sign(k.bonus+sb6(sk))}</small></button>`}});
    const spec=verts.concat(gens);
    $('rp6VBox').hidden=!spec.length;$q('.rp6-sit').hidden=!E.trainedVerts(d).some(x=>E.situations(d,x.id).dice);$q('.rp6-silent').hidden=!E.trainedVerts(d).some(x=>E.silentVert(d,x.id));
    $('rp6Verts').innerHTML=spec.filter(x=>normTxt(x.key).includes(q)).map(x=>x.html).join('')||'<div class="empty" style="grid-column:1/-1">Nenhuma especialização encontrada.</div>';
    const list=BASE_SKILLS.slice().sort((a,b)=>a.localeCompare(b,'pt-BR')).filter(s=>normTxt(s).includes(q));
    $('rp6Grid').innerHTML=list.map(s=>{const k=skillCalc3(src,s,at||undefined);return `<button type="button" class="mesa-skill" data-skill="${esc(s)}"><b>${esc(s)}</b><small>${esc(at||k.attr)} · ${k.n}d20 · ${sign(k.bonus+sb6(s))}</small></button>`}).join('')||'<div class="empty" style="grid-column:1/-1">Nenhuma perícia encontrada.</div>';
    $$('#rp6Grid [data-skill],#rp6Verts [data-skill]').forEach(b=>b.onclick=()=>{closeModal();rollSkillAs6(ch,b.dataset.skill,at,{vert:b.dataset.vert,generalista:b.dataset.gen,extraDice:Number(b.dataset.dice)||0,social:soc,silent:b.dataset.silent==='1'&&!!$('rp6Silent')?.checked}).catch(e=>fail3('rolagem',e))});
  };
  $('rp6Search').oninput=draw;$('rp6Attr').onchange=$('rp6Soc').onchange=$('rp6Sit').onchange=draw;draw();
  $$('#modalBody [data-pure]').forEach(b=>b.onclick=()=>{closeModal();rollAttr6(ch,b.dataset.pure).catch(e=>fail3('rolagem',e))});
}
T3.openRollPicker=openRollPicker6;
/* atalhos na aba Rolagens: um botão por personagem que eu controlo */
function renderQuick6(){
  const box=$('mesaQuick');if(!box)return;
  const mine=chars3().filter(c=>isGM6()||(!!uid3()&&c.ownerId===uid3()));
  const mineFirst=isGM6()?mine.filter(gmChar6).concat(mine.filter(c=>!gmChar6(c))):mine;
  const sig=mineFirst.map(c=>c.id+nm(c)).join('|');
  if(box.dataset.sig===sig)return;box.dataset.sig=sig;
  box.innerHTML=mineFirst.length?`<span class="sub">Rolar por:</span>${mineFirst.map(c=>`<button type="button" class="btn small" data-qroll="${c.id}">🎲 ${esc(nm(c))}</button>`).join('')}`:'<span class="sub">Crie um personagem para rolar pela mesa.</span>';
  $$('[data-qroll]',box).forEach(b=>b.onclick=()=>openRollPicker6(charById(b.dataset.qroll)));
}
/* na ficha: escolher o atributo de cada perícia e rolar atributo puro */
M6.skAttr={};
{const _rs6=renderSkills;renderSkills=function(){
  _rs6.apply(this,arguments);
  try{
    $$('#skillGrid .skill').forEach(row=>{
      const btn=row.querySelector('[data-roll]');if(!btn)return;const s=btn.dataset.roll,base=SKILL_ATTR[s],cur=M6.skAttr[s]||base;
      const sel=document.createElement('select');sel.className='skill-attr-sel';sel.title='Atributo usado nesta rolagem';sel.setAttribute('aria-label','Atributo para rolar '+s);
      sel.innerHTML=ATTR8.map(a=>`<option value="${a}" ${a===cur?'selected':''}>${a.slice(0,3).toUpperCase()}${a===base?' •':''}</option>`).join('');
      btn.before(sel);
      const info=row.querySelector('.skill-attr');
      const paint=()=>{const a=sel.value;if(a===base)delete M6.skAttr[s];else M6.skAttr[s]=a;sel.classList.toggle('alt',a!==base);if(info){const k=skillCalc3({data,vocations,tracks},s,a);info.textContent=`${a}${a!==base?' (padrão: '+base+')':''} · ${k.n}d20 · vocação +${vocBonus(s)}`}};
      sel.onchange=paint;if(cur!==base)paint();
      btn.onclick=()=>rollSkill(s,sel.value);
    });
  }catch(e){console.warn('[T6] perícias',e)}
}}
{const _ra6=renderAttributes;renderAttributes=function(){
  _ra6.apply(this,arguments);
  try{
    const m=E.computeMods(data);
    $$('#attributes .attr-card').forEach((card,i)=>{
      const a=ATTRS[i];if(!a||card.querySelector('.attr-roll'))return;
      const b=document.createElement('button');b.type='button';b.className='roll attr-roll';b.textContent='🎲 '+attrDice6(data,a,m)+'d20';b.title='Rolar '+a+' puro, sem perícia';
      b.onclick=()=>rollAttr6(charById(activeCharacterId)||null,a).catch(e=>fail3('rolagem',e));
      card.append(b);
    });
  }catch(e){console.warn('[T6] atributos',e)}
}}

/* ---------- Perseus: balões que dão tempo de ler ---------- */
const BUB_MIN=13000;
function bubStack6(){let s=$('t3BubStack');if(!s){s=document.createElement('div');s.id='t3BubStack';s.setAttribute('aria-hidden','true');($('t3PerseusRoot')||document.body).append(s)}return s}
function bubOld6(html,left){
  const s=bubStack6(),o=document.createElement('div');o.className='t3-bubold';o.innerHTML=html;o.title='Clique para fechar';s.append(o);
  while(s.children.length>2)s.firstElementChild.remove();
  let t=setTimeout(()=>o.remove(),Math.max(6000,left));
  o.onmouseenter=()=>clearTimeout(t);o.onmouseleave=()=>{t=setTimeout(()=>o.remove(),4000)};o.onclick=()=>o.remove();
}
say=function(html,ms){
  const b=$('t3CatBubble');if(!b||!prefs.perseus)return;
  const len=String(html).replace(/<[^>]+>/g,'').length,dur=Math.max(BUB_MIN,Number(ms)||0,6000+len*80);
  /* a fala anterior não some: sobe e continua na tela até dar o tempo dela */
  if(b.classList.contains('show')&&b.innerHTML&&b.innerHTML!==html&&(PS.bubbleEnd||0)-Date.now()>1200)bubOld6(b.innerHTML,PS.bubbleEnd-Date.now());
  clearTimeout(PS.bubbleTimer);b.innerHTML=html;b.classList.add('show');b.title='Clique para fechar';
  const hide=()=>{b.classList.remove('show');PS.bubbleEnd=0};
  PS.bubbleEnd=Date.now()+dur;PS.bubbleTimer=setTimeout(hide,dur);
  b.onmouseenter=()=>{clearTimeout(PS.bubbleTimer);PS.bubbleEnd=Date.now()+600000};
  b.onmouseleave=()=>{PS.bubbleEnd=Date.now()+4500;PS.bubbleTimer=setTimeout(hide,4500)};
  b.onclick=e=>{if(e.target.closest('[data-pact],a,button'))return;clearTimeout(PS.bubbleTimer);hide()};
  const st=bubStack6();st.style.bottom=(window.innerHeight-b.getBoundingClientRect().top+8)+'px';
};
T3.say=say;
/* avisos rápidos também ficam mais tempo quando o texto é longo */
{let _tt6=null;toast=function(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(_tt6);_tt6=setTimeout(()=>t.classList.remove('show'),Math.max(3200,1800+String(msg).length*55))}}

/* ---------- bloco de notas (BN) ---------- */
function bnWhere6(){
  if(camp3()&&isGM6())return{kind:'gm'};
  const ch=camp3()?(charById(M6.myChar)||charById(activeCharacterId)||myChars6()[0]):null;
  if(ch)return{kind:'ch',ch};
  return{kind:'sheet'};
}
function bnList6(){const w=bnWhere6();if(w.kind==='gm')return M6.gmNotes||[];if(w.kind==='ch')return dOf6(w.ch).notepad||[];return data.notepad||[]}
function bnSave6(list){
  const w=bnWhere6();
  if(w.kind==='gm'){M6.gmNotes=list;lsSet6('tulpa_bn_gm_'+camp3().id,list);if(M6.backend==='store')stPut6('gmnotes:'+uid3(),'note',{list},[uid3()]).catch(e=>console.warn('[T6] notas do Mestre',e))}
  else if(w.kind==='ch')mutateChar(w.ch,d=>{d.notepad=list});
  else{data.notepad=list;save()}
  if(M6.tab==='notas')renderNotes6();renderSheetDocs6();
}
function bnAdd6(text){const t=String(text||'').trim().slice(0,1200);if(!t)return null;const n={id:rid(),t,at:Date.now()};bnSave6([...bnList6(),n].slice(-200));return n}
function bnDel6(id){bnSave6(bnList6().filter(n=>n.id!==id))}
T3.bn={list:bnList6,add:bnAdd6,del:bnDel6,where:bnWhere6};
const bnDate6=at=>{try{return new Date(at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
function bnHtml6(list,{del=true}={}){
  return list.length?`<ol class="bn-list">${list.map(n=>`<li><span class="bn-t">${esc(n.t)}</span><small>${bnDate6(n.at)}</small>${del?`<button type="button" class="bn-x" data-bndel="${n.id}" title="Apagar esta nota" aria-label="Apagar esta nota">✕</button>`:''}</li>`).join('')}</ol>`:'<p class="sub">Nenhuma nota ainda.</p>';
}
function bnPanel6(box){
  if(!box)return;const w=bnWhere6();
  const who=w.kind==='gm'?'Bloco de notas do Mestre. Só você vê.':w.kind==='ch'?`Bloco de notas de ${esc(nm(w.ch))}. É particular: os outros jogadores não veem.`:'Bloco de notas desta ficha.';
  box.innerHTML=`<p class="sub">${who} Você também pode pedir ao Perseus: “adiciona no BN: …” e “o que tem no meu BN?”.</p><form class="bn-form"><input class="search" name="t" maxlength="1200" placeholder="Escreva uma nota" aria-label="Nova nota"><button class="btn primary small">Anotar</button></form>${bnHtml6(bnList6())}`;
  box.querySelector('form').onsubmit=e=>{e.preventDefault();const i=e.target.elements.t;if(bnAdd6(i.value)){fx5('confirm')}};
  $$('[data-bndel]',box).forEach(b=>b.onclick=()=>bnDel6(b.dataset.bndel));
}
function renderNotes6(){bnPanel6($('mesaNotes'))}

/* ---------- documentos e imagens pop-up ---------- */
const docSeen6=id=>{M6.seenDocs=M6.seenDocs||new Set();if(M6.seenDocs.has(id))return true;M6.seenDocs.add(id);lsSet6('tulpa_docs_seen_'+(uid3()||'x'),[...M6.seenDocs].slice(-300));return false};
function showDoc6(title,src){
  let p=$('docPop');
  if(!p){p=document.createElement('div');p.id='docPop';p.innerHTML='<div class="doc-card" role="dialog" aria-modal="true" aria-label="Imagem enviada pelo Mestre"><button type="button" class="doc-x" aria-label="Fechar">✕</button><div class="doc-title"></div><div class="doc-img"><img alt=""></div></div>';document.body.append(p);
    const close=()=>p.classList.remove('show');p.querySelector('.doc-x').onclick=close;p.onclick=e=>{if(e.target===p)close()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&p.classList.contains('show'))close()})}
  p.querySelector('.doc-title').textContent=title||'Imagem do Mestre';p.querySelector('img').src=src;p.querySelector('img').alt=title||'';
  p.classList.add('show');p.querySelector('.doc-x').focus({preventScroll:true});
}
async function openDoc6(key,title,inline){
  try{const src=inline||await assetData6(key);if(!src){toast('Essa imagem não está mais disponível.');return}showDoc6(title,src)}
  catch(e){toast('Não consegui abrir a imagem: '+(e?.message||'erro'))}
}
async function refreshDocs6(){
  try{M6.docs=(await stList6('doc')).map(x=>({key:x.key,title:x.meta?.title||'Imagem',at:x.meta?.at||Date.parse(x.created_at)||0,audience:Array.isArray(x.audience)&&x.audience.length?x.audience:null})).sort((a,b)=>b.at-a.at)}catch(e){console.warn('[T6] documentos',e)}
  if(M6.tab==='docs')renderDocs6();
}
/* chegou um documento para todos: abre o pop-up uma única vez */
function docArrived6(key){
  const d=M6.docs.find(x=>x.key===key);if(!d||d.audience)return;
  if(Date.now()-d.at>180000){docSeen6(key);return}
  if(docSeen6(key))return;
  fx5('activate');openDoc6(key,d.title);
}
/* documentos enviados só para mim ficam na minha ficha */
function checkPrivateDocs6(){
  if(isGM6()||!uid3())return;
  myChars6().forEach(ch=>(dOf6(ch).docs||[]).forEach(x=>{
    if(!x||!x.id)return;const fresh=Date.now()-(x.at||0)<180000;
    if(docSeen6(x.id)||!fresh)return;
    fx5('activate');openDoc6('doc:'+x.id,x.title,x.img);say(`📂 O Mestre mandou uma imagem só para você: <b>${esc(x.title||'sem título')}</b>. Ela fica guardada na sua ficha, em Documentos / Pistas.`);
  }));
}
function privDocs6(){const out=[];myChars6().forEach(ch=>(dOf6(ch).docs||[]).forEach(x=>{if(x&&x.id)out.push({...x,ch})}));return out.sort((a,b)=>(b.at||0)-(a.at||0))}
function removePrivDoc6(ch,id){
  mutateChar(ch,d=>{d.docs=(d.docs||[]).filter(x=>x.id!==id)});
  if(M6.backend==='store')stDel6('doc:'+id).catch(()=>{});
  renderDocs6();renderSheetDocs6();
}
function docRows6(list,{del}={}){
  return list.map(x=>`<li><button type="button" class="doc-open" data-dopen="${esc(x.key||'doc:'+x.id)}" data-dtitle="${esc(x.title||'Imagem')}">🖼 ${esc(x.title||'Imagem')}</button><small>${bnDate6(x.at)}${x.who?' · '+esc(x.who):''}</small>${del?`<button type="button" class="bn-x" data-ddel="${esc(x.key||x.id)}" title="Apagar" aria-label="Apagar ${esc(x.title||'imagem')}">✕</button>`:''}</li>`).join('');
}
function renderDocs6(){
  const box=$('mesaDocs');if(!box)return;const isM=isGM6();
  const pub=M6.docs.filter(d=>!d.audience),prv=isM?M6.docs.filter(d=>d.audience).map(d=>({...d,who:'só para '+d.audience.map(u=>nm(charOfUser6(u))||'jogador').join(', ')})):privDocs6();
  box.innerHTML=`${isM?'<div class="inline"><button type="button" class="btn primary small" id="docSend">🖼 Enviar imagem</button><span class="sub">Abre como pop-up na tela de quem você escolher.</span></div>':''}
   <h4>Para todos na mesa</h4>${pub.length?`<ul class="doc-list">${docRows6(pub,{del:isM})}</ul>`:'<p class="sub">O Mestre ainda não enviou nenhuma imagem para a mesa.</p>'}
   <h4>${isM?'Enviadas em particular':'Só para você'}</h4>${prv.length?`<ul class="doc-list">${docRows6(prv,{del:true})}</ul>`:`<p class="sub">${isM?'Nenhuma imagem particular enviada.':'Nenhuma pista particular. Quando o Mestre mandar, ela aparece aqui e na sua ficha.'}</p>`}`;
  const s=$('docSend');if(s)s.onclick=openSendDoc6;
  bindDocs6(box);
}
function bindDocs6(box){
  const prv=isGM6()?[]:privDocs6();
  $$('[data-dopen]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.dopen,p=prv.find(x=>'doc:'+x.id===k);openDoc6(k,b.dataset.dtitle,p?.img)});
  $$('[data-ddel]',box).forEach(b=>b.onclick=async()=>{
    const k=b.dataset.ddel,p=prv.find(x=>x.id===k);
    if(p){if(confirm('Apagar esta pista da sua ficha?'))removePrivDoc6(p.ch,p.id);return}
    if(!isGM6())return;if(!confirm('Apagar esta imagem dos Documentos? Ela some para todos.'))return;
    try{const d=M6.docs.find(x=>x.key===k);await stDel6(k);if(d?.audience){const id=k.replace(/^doc:/,'');d.audience.forEach(u=>chars3().filter(c=>c.ownerId===u).forEach(c=>{if((c.data?.docs||[]).some(x=>x.id===id))mutateChar(c,x=>{x.docs=(x.docs||[]).filter(y=>y.id!==id)})}))}delete M6.assetCache[k];await refreshDocs6();cast6({t:'doc',key:k})}catch(e){toast('Não consegui apagar: '+(e?.message||'erro'))}
  });
}
function openSendDoc6(){
  if(!isGM6())return;
  const players=seats6().players;
  openModal('ENVIAR IMAGEM','Pop-up para a mesa',`<div class="field"><label for="sdFile">Imagem (pista, carta, foto)</label><input type="file" id="sdFile" accept="image/*"></div><div class="field"><label for="sdTitle">Título</label><input id="sdTitle" maxlength="80" placeholder="Ex.: Carta encontrada na gaveta"></div>
   <fieldset class="sd-aud"><legend>Quem recebe</legend><label class="t3-check"><input type="radio" name="sdAud" value="all" checked> Todos na mesa (fica salva em Documentos)</label><label class="t3-check"><input type="radio" name="sdAud" value="some"> Só os jogadores marcados (fica salva na ficha de cada um)</label>
   <div class="sd-players" id="sdPlayers">${players.length?players.map(s=>`<label class="t3-check"><input type="checkbox" value="${s.uid}" disabled> ${esc(nm(s.ch))}${s.present?'':' <span class="sub">(ausente)</span>'}</label>`).join(''):'<span class="sub">Nenhum jogador na campanha ainda.</span>'}</div></fieldset>`,'Enviar',async()=>{
    const f=$('sdFile').files&&$('sdFile').files[0],title=($('sdTitle').value||'').trim()||'Imagem do Mestre';
    if(!f){toast('Escolha a imagem primeiro.');return}
    const some=$q('[name="sdAud"]:checked').value==='some',targets=some?$$('#sdPlayers input:checked').map(i=>i.value):null;
    if(some&&!targets.length){toast('Marque pelo menos um jogador.');return}
    closeModal();
    try{await sendDoc6(f,title,targets);toast(targets?'Imagem enviada em particular.':'Imagem enviada para a mesa.')}catch(e){toast('Não consegui enviar: '+(e?.message||'erro'))}
  });
  $$('[name="sdAud"]').forEach(r=>r.onchange=()=>{const on=$q('[name="sdAud"]:checked').value==='some';$$('#sdPlayers input').forEach(i=>{i.disabled=!on})});
}
async function sendDoc6(file,title,targets){
  const id='d'+rid(),at=Date.now(),store=(await stDetect6())==='store';
  if(!targets){
    const im=await imgFit6(file,1600,700000);
    await stPut6('doc:'+id,'doc',{meta:{title,at},data:im.data},null);M6.assetCache['doc:'+id]=im.data;
    docSeen6('doc:'+id);await refreshDocs6();cast6({t:'doc',key:'doc:'+id});showDoc6(title,im.data);return id;
  }
  /* particular: a referência vai para a ficha de cada jogador marcado.
     Com a tabela campaign_store, a imagem fica lá, visível só para o destinatário (RLS);
     na reserva, uma versão menor vai dentro da própria ficha. */
  const im=await imgFit6(file,store?1600:1000,store?700000:170000);
  if(store)await stPut6('doc:'+id,'doc',{meta:{title,at,priv:true},data:im.data},targets);
  let n=0;
  targets.forEach(u=>{const ch=charOfUser6(u);if(!ch||!ch._sheetAvailable)return;n++;mutateChar(ch,d=>{d.docs=[...(d.docs||[]),{id,title,at,...(store?{}:{img:im.data})}].slice(-(store?60:12))})});
  if(!n)throw new Error('a ficha do jogador não está disponível');
  await refreshDocs6();return id;
}
T3.sendDoc=sendDoc6;T3.showDoc=showDoc6;T3._asset=assetData6;T3._refreshDocs=refreshDocs6;

/* aba "Documentos / Pistas" dentro da ficha */
function renderSheetDocs6(){
  if(!$('tab-inventory'))return;
  let sec=$('tab-docs');
  if(!sec){
    const main=$q('.main'),side=$q('.side'),before=$q('[data-tab="records"]');if(!main||!side)return;
    sec=document.createElement('section');sec.className='tab';sec.id='tab-docs';main.insertBefore(sec,$('tab-records'));
    const b=document.createElement('button');b.className='navbtn';b.dataset.tab='docs';b.innerHTML='<span class="ico">📂</span> Documentos / Pistas';side.insertBefore(b,before);
    b.onclick=()=>{$$('.navbtn').forEach(x=>x.classList.toggle('active',x===b));$$('.tab').forEach(x=>x.classList.toggle('active',x.id==='tab-docs'))};
    try{NAV.mo&&NAV.mo.observe(sec,{attributes:true,attributeFilter:['class']})}catch(e){}
  }
  const list=(data.docs||[]).filter(x=>x&&x.id).slice().sort((a,b)=>(b.at||0)-(a.at||0));
  const sig=JSON.stringify([list.map(x=>x.id),(data.notepad||[]).map(n=>n.id),activeCharacterId,M6.gmNotes?.length]);
  if(sec.dataset.sig===sig)return;sec.dataset.sig=sig;
  sec.innerHTML=`<div class="panel"><div class="panel-head"><h2>Documentos / Pistas</h2><span class="pill">${list.length} ${list.length===1?'imagem':'imagens'}</span></div><p class="sub">Imagens que o Mestre mandou só para este personagem. Você pode ver de novo ou apagar.</p>${list.length?`<ul class="doc-list">${list.map(x=>`<li><button type="button" class="doc-open" data-sdoc="${esc(x.id)}">🖼 ${esc(x.title||'Imagem')}</button><small>${bnDate6(x.at)}</small><button type="button" class="bn-x" data-sdel="${esc(x.id)}" title="Apagar" aria-label="Apagar ${esc(x.title||'imagem')}">✕</button></li>`).join('')}</ul>`:'<p class="sub">Nenhuma pista por enquanto.</p>'}</div><div class="panel"><div class="panel-head"><h2>Bloco de notas</h2></div><div id="sheetNotes"></div></div>`;
  $$('[data-sdoc]',sec).forEach(b=>b.onclick=()=>{const x=list.find(y=>y.id===b.dataset.sdoc);openDoc6('doc:'+x.id,x.title,x.img)});
  $$('[data-sdel]',sec).forEach(b=>b.onclick=()=>{if(!confirm('Apagar esta pista da ficha?'))return;const id=b.dataset.sdel;data.docs=(data.docs||[]).filter(x=>x.id!==id);save();if(M6.backend==='store')stDel6('doc:'+id).catch(()=>{})});
  /* dentro da ficha, o bloco é sempre o deste personagem */
  const box=$('sheetNotes'),notes=data.notepad||[];
  box.innerHTML=`<p class="sub">Notas particulares deste personagem. Peça ao Perseus: “adiciona no BN: …”.</p><form class="bn-form"><input class="search" name="t" maxlength="1200" placeholder="Escreva uma nota" aria-label="Nova nota"><button class="btn primary small">Anotar</button></form>${bnHtml6(notes)}`;
  box.querySelector('form').onsubmit=e=>{e.preventDefault();const t=e.target.elements.t.value.trim();if(!t)return;data.notepad=[...(data.notepad||[]),{id:rid(),t:t.slice(0,1200),at:Date.now()}].slice(-200);save()};
  $$('[data-bndel]',box).forEach(b=>b.onclick=()=>{data.notepad=(data.notepad||[]).filter(n=>n.id!==b.dataset.bndel);save()});
}
{const _rst6=T3.renderSheetTabs;T3.renderSheetTabs=function(){_rst6.apply(this,arguments);try{renderSheetDocs6()}catch(e){console.warn('[T6] documentos da ficha',e)}}}

/* ---------- música (YouTube), playlist por momento e intervalo ---------- */
const YT6={api:null,player:null,ready:null,sig:'',synth:null,blocked:false,muted:false,retried:false,alt:false,tried:{},err:null,warned:'',chain:{},audio:null,lamb:false};
/* o vídeo não pôde tocar neste aparelho: avisa quem quer que seja (Mestre ou jogador), uma vez por vídeo */
function ytFail6(vid,msg){
  YT6.err={vid,msg};renderVol6();
  const k=vid+'|'+msg;if(YT6.warned===k)return;YT6.warned=k;toast('🎵 '+msg);
}
if(prefs.musicVol===undefined)prefs.musicVol=60;
const MOMENTS6=['Revelação da Sala','Investigação','Combate','Chefe','Calmaria','Tensão','Intervalo'];
function ytId6(url){
  const s=String(url||'').trim();if(/^[\w-]{11}$/.test(s))return s;
  const m=s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/);return m?m[1]:null;
}
/* confere o vídeo antes de entrar na playlist: título e se o dono deixa tocar fora do YouTube */
async function ytInfo6(vid){
  try{
    const c=new AbortController(),tm=setTimeout(()=>c.abort(),6000);
    const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+vid),{signal:c.signal});clearTimeout(tm);
    if(r.ok){const j=await r.json();return{ok:true,title:String(j.title||'').slice(0,90)}}
    if(r.status===401||r.status===403)return{ok:false,why:'embed'};
    if(r.status===400||r.status===404)return{ok:false,why:'nf'};
  }catch(e){}
  return{ok:true,title:''}; /* não deu para conferir: deixa adicionar */
}
function applyVol6(){
  try{if(YT6.audio){YT6.audio.volume=Math.max(0,Math.min(1,(prefs.musicVol||0)/100));YT6.audio.muted=(prefs.musicVol||0)<=0}T3.ambient?.vol()}catch(e){}
  const p=YT6.player;if(!p||typeof p.setVolume!=='function')return;
  try{p.setVolume(prefs.musicVol);if(prefs.musicVol<=0)p.mute();else if(!YT6.muted&&p.isMuted&&p.isMuted())p.unMute()}catch(e){}
}
/* primeiro toque na tela: liga o som da música (o navegador só deixa tocar com som depois de um toque) */
function unlockMusic6(){
  try{actx()}catch(e){}
  YT6.muted=false;YT6.blocked=false;const p=YT6.player;
  try{if(YT6.audio&&wantMusic6()?.url&&YT6.audio.paused)YT6.audio.play().catch(()=>{})}catch(e){}
  if(p&&typeof p.unMute==='function'){try{p.unMute();applyVol6();if(p.getPlayerState()!==1&&wantMusic6()?.playing)p.playVideo()}catch(e){}}
  renderVol6();
}
T3._ytId=ytId6;
function ytApi6(){
  if(YT6.api)return YT6.api;
  YT6.api=new Promise((ok,no)=>{
    if(window.YT&&window.YT.Player)return ok();
    const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(e){}ok()};
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{YT6.api=null;no(new Error('não consegui falar com o YouTube'))};document.head.append(s);
    setTimeout(()=>{if(!(window.YT&&window.YT.Player)){YT6.api=null;no(new Error('o YouTube demorou demais para responder'))}},15000);
  });
  return YT6.api;
}
function ytPlayer6(){
  if(YT6.ready)return YT6.ready;
  YT6.ready=ytApi6().then(()=>new Promise(ok=>{
    let host=$('mesaYTBox');if(!host){host=document.createElement('div');host.id='mesaYTBox';host.innerHTML='<div id="mesaYT"></div>';document.body.append(host)}
    const pv={autoplay:1,controls:0,disablekb:1,playsinline:1,rel:0,modestbranding:1};
    /* origin + widget_referrer: sem a identificação da página o YouTube responde erro 153 */
    if(/^https?:$/.test(location.protocol)){pv.origin=location.origin;pv.widget_referrer=location.origin+location.pathname}
    const cfg={width:220,height:220,playerVars:pv,events:{
      onReady:()=>{applyVol6();ok(YT6.player)},
      onStateChange:e=>{
        if(e.data===0){try{YT6.player.seekTo(0,true);YT6.player.playVideo()}catch(x){}} /* repete enquanto o Mestre não trocar */
        if(e.data===1){YT6.retried=false;YT6.chain={};if(YT6.err){YT6.err=null;YT6.warned=''}try{const vd=YT6.player.getVideoData?.().video_id;if(vd)delete YT6.tried[vd]}catch(x){}if(isGM6()){const vv=wantMusic6()?.vid,pl0=M6.state.playlist||[];if(vv&&pl0.some(x=>x.vid===vv&&x.bad))setState6({playlist:pl0.map(x=>x.vid===vv?{...x,bad:false}:x)},{silent:true})}if(!YT6.muted)YT6.blocked=false;applyVol6();const t=YT6.player.getVideoData?.().title,m=M6.state.music;if(isGM6()&&t&&m&&m.vid===YT6.player.getVideoData().video_id){const pl=(M6.state.playlist||[]);const it=pl.find(x=>x.vid===m.vid&&!x.title);if(it){it.title=t;setState6({playlist:[...pl],music:{...m,title:m.title||t}},{silent:true});renderMusic6()}}renderVol6()}
      },
      onError:e=>{
        const c=e&&e.data,m=wantMusic6(),vid=m&&m.vid;YT6.lastErr=c;
        if(c===5&&!YT6.retried&&vid){YT6.retried=true;setTimeout(()=>{try{YT6.player.loadVideoById(vid)}catch(x){}},900);return} /* falha momentânea do player: tenta uma vez de novo */
        /* recusa só neste navegador (comum com bloqueador de rastreio): tenta o OUTRO domínio do YouTube para ESTE vídeo.
           Antes o domínio alternativo ficava preso para a sessão toda e as músicas seguintes falhavam só neste aparelho. */
        if([101,150,153].includes(c)&&vid){
          const tried=YT6.tried[vid]||(YT6.tried[vid]={});tried[YT6.alt?'alt':'std']=1;
          const other=YT6.alt?'std':'alt';
          if(!tried[other]){YT6.alt=other==='alt';YT6.ready=null;YT6.sig='';try{YT6.player.destroy()}catch(x){}YT6.player=null;const h=$('mesaYTBox');if(h)h.innerHTML='<div id="mesaYT"></div>';setTimeout(syncMusic6,200);return}
        }
        const why={2:'O link dessa música parece inválido.',100:'Esse vídeo foi removido ou está privado.',153:'O YouTube não reconheceu este site (erro 153). Desative o bloqueador de rastreio ou de “referer” para esta página.'}[c]||'O YouTube recusou tocar esse vídeo neste navegador (erro '+c+').'+(isGM6()?' Os jogadores podem estar ouvindo normalmente.':' Avise o Mestre.');
        if(vid)ytFail6(vid,why);else if(isGM6())toast(why);
        if([100,2,101,150,153].includes(c)&&vid)ytSkip6(vid);
        if(!isGM6())return;
        if(c===100||c===2){const pl=M6.state.playlist||[];if(vid&&pl.some(x=>x.vid===vid&&!x.bad))setState6({playlist:pl.map(x=>x.vid===vid?{...x,bad:true}:x)})}
      }
    }};
    if(YT6.alt)cfg.host='https://www.youtube-nocookie.com';
    YT6.player=new window.YT.Player('mesaYT',cfg);
  })).catch(e=>{YT6.ready=null;throw e});
  return YT6.ready;
}
/* a música que deve estar tocando agora: no intervalo, a de espera */
function wantMusic6(){
  const st=M6.state;
  if(st.pause?.on){const w=(st.playlist||[]).find(x=>/intervalo|espera|pausa/.test(normTxt(x.moment||'')));return w?{vid:w.vid,title:w.title,playing:true,pos:0,ts:st.pause.since||Date.now(),wait:true}:{synth:true,playing:true,ts:st.pause.since||0,wait:true}}
  return st.music&&(st.music.vid||st.music.url||st.music.amb)?st.music:null;
}
async function syncMusic6(){
  const m=wantMusic6(),sig=m?[m.vid||m.url||m.amb||'synth',m.ts,m.playing,m.pos].join('|'):'';
  if(sig===YT6.sig)return;YT6.sig=sig;
  if(!m||!m.playing||!m.synth)stopWait6();
  if(m&&m.playing)stopLocalAmb6();
  if(!m||!m.playing||!m.amb)try{T3.ambient?.stop('state')}catch(e){}
  if(!m||!m.playing||!m.url)audStop6();
  if(!m||!m.playing){try{YT6.player&&YT6.player.pauseVideo()}catch(e){}renderVol6();return}
  if(m.amb){try{YT6.player&&YT6.player.pauseVideo()}catch(e){}try{T3.ambient?.start(m.amb,'state')}catch(e){console.warn('[T6] ambiente',e)}renderVol6();return}
  if(m.url){try{YT6.player&&YT6.player.pauseVideo()}catch(e){}audPlay6(m);renderVol6();return}
  if(m.synth){try{YT6.player&&YT6.player.pauseVideo()}catch(e){}startWait6();renderVol6();return}
  try{
    if(YT6.err&&YT6.err.vid!==m.vid){YT6.err=null;YT6.warned=''}
    const p=await ytPlayer6();if(YT6.sig!==sig)return;
    /* sem nenhum toque na página o navegador só deixa tocar mudo: começa mudo e liga o som no primeiro toque */
    const act=!!(navigator.userActivation&&navigator.userActivation.hasBeenActive);
    YT6.muted=!act;YT6.blocked=!act;YT6.retried=false;
    try{if(act)p.unMute();else p.mute()}catch(e){}
    applyVol6();p.loadVideoById({videoId:m.vid,startSeconds:Math.max(0,(Number(m.pos)||0)+(Date.now()-(m.ts||Date.now()))/1000)});
    setTimeout(()=>ytWatch6(sig,p,act,1),3500);
  }catch(e){console.warn('[T6] música',e);if(m&&m.vid)ytFail6(m.vid,'Música: '+(e.message||'erro')+'. Recarregue a página ou libere o YouTube no bloqueador.');else if(isGM6())toast('Música: '+(e.message||'erro')+'.')}
  renderVol6();
}
/* ---- áudio direto (.mp3/.ogg/.wav/stream) por <audio>, sincronizado pelo estado da mesa; imune aos erros 101/150/153 ---- */
const AUDIO_EXT6=/\.(mp3|ogg|oga|opus|wav|m4a|aac|flac|weba|webm)(\?|#|$)/i;
function isAudioUrl6(u){
  u=String(u||'').trim();if(!/^https?:\/\/[^\s]+$/i.test(u))return false;
  if(/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(u.replace(/^https?:\/\//i,'')))return false;
  return true;
}
function audPlay6(m){
  let a=YT6.audio;
  if(!a){a=YT6.audio=new Audio();a.preload='auto';
    a.addEventListener('error',()=>{const mm=wantMusic6();if(mm&&mm.url&&a.dataset.src===mm.url){YT6.err={vid:mm.url,msg:'O link de áudio não pôde ser tocado (formato, bloqueio do servidor ou link vencido).'};renderVol6();if(isGM6())toast('🎵 '+YT6.err.msg)}})}
  const url=m.url;if(a.dataset.src!==url){a.src=url;a.dataset.src=url}
  YT6.err=null;YT6.warned='';a.loop=m.loop!==false;a.volume=Math.max(0,Math.min(1,(prefs.musicVol||0)/100));a.muted=(prefs.musicVol||0)<=0;
  const el=Math.max(0,(Number(m.pos)||0)+(Date.now()-(m.ts||Date.now()))/1000);
  const seek=()=>{try{if(isFinite(a.duration)&&a.duration>0&&el>1)a.currentTime=a.loop?el%a.duration:Math.min(el,a.duration-.1)}catch(e){}};
  if(a.readyState>=1)seek();else a.addEventListener('loadedmetadata',seek,{once:true});
  const pr=a.play();if(pr&&pr.then)pr.then(()=>{YT6.blocked=false;renderVol6()}).catch(err=>{if(err&&err.name==='NotAllowedError'){YT6.blocked=true;renderVol6()}});
}
function audStop6(){try{YT6.audio&&!YT6.audio.paused&&YT6.audio.pause()}catch(e){}}
/* erro 101/150/153/100/2 persistente: o Mestre pula sozinho para a próxima faixa da playlist (sem loop se todas falharem) */
function ytSkip6(vid){
  if(!isGM6())return false;
  YT6.chain[vid]=1;
  const pl=(M6.state.playlist||[]).filter(x=>x.vid||x.url);if(pl.length<2)return false;
  const i=Math.max(0,pl.findIndex(x=>x.vid===vid)),order=pl.slice(i+1).concat(pl.slice(0,i));
  const nx=order.find(x=>!x.bad&&!(x.vid&&YT6.chain[x.vid]));
  if(!nx){toast('🎵 Nenhuma faixa da playlist toca neste navegador. Use “Ativar Ambiente” ou cole um link direto de áudio.');return false}
  toast('🎵 Essa faixa não toca aqui. Pulando para: '+(nx.title||'próxima música')+'.');
  setTimeout(()=>playTrack6(nx.id,true),400);return true;
}
function stopLocalAmb6(){if(YT6.lamb){YT6.lamb=false;try{T3.ambient?.stop('local')}catch(e){}renderVol6()}}
function toggleLocalAmb6(){
  if(YT6.lamb){stopLocalAmb6();return}
  try{actx()}catch(e){}
  const id=prefs.ambLast||'sanct';YT6.lamb=true;try{T3.ambient?.start(id,'local')}catch(e){YT6.lamb=false}renderVol6();
}
function playAmbient6(id){
  if(!isGM6())return false;const it=(T3.ambient?.list||[]).find(x=>x[0]===id);if(!it)return false;
  try{actx()}catch(e){}prefs.ambLast=id;try{savePrefs()}catch(e){}
  setState6({music:{amb:id,title:it[1],moment:'Ambiente',playing:true,pos:0,ts:Date.now()}});return true;
}
/* vigia: o vídeo não começou. Com permissão de som (já houve toque na página) só insiste; o modo mudo + "Ativar som"
   fica para quando o navegador realmente bloqueou. Antes ele silenciava o player de quem tinha permissão só porque o vídeo demorou a carregar. */
function ytWatch6(sig,p,act,n){
  try{
    if(YT6.sig!==sig)return;const s=p.getPlayerState(),m=wantMusic6();
    if([1,3].includes(s)||!m||!m.playing)return;
    if(YT6.err&&YT6.err.vid===m.vid)return; /* erro do YouTube já avisado: não é bloqueio de som */
    if(n<3&&act){try{p.playVideo()}catch(e){}setTimeout(()=>ytWatch6(sig,p,act,n+1),3000);return}
    YT6.muted=true;YT6.blocked=true;p.mute();p.playVideo();renderVol6();
  }catch(e){}
}
onState6(()=>{syncMusic6();if(M6.tab==='musica')renderMusic6();renderPause6()});
M6.hooks.leave.push(()=>{YT6.sig='';stopWait6();audStop6();YT6.lamb=false;try{T3.ambient?.stop()}catch(e){}try{YT6.player&&YT6.player.stopVideo()}catch(e){}$('mesaPause')?.classList.remove('show')});
/* musiquinha de espera feita na hora (caixinha de música), quando a playlist não tem uma faixa "Intervalo" */
function startWait6(){
  if(YT6.synth)return;const c=actx();if(!c)return;
  const scale=[523.25,587.33,659.25,783.99,880,1046.5],bass=[130.81,174.61,146.83,196];let i=0;
  const tick=()=>{
    const v=(prefs.musicVol||0)/100;if(!v||!A5.ctx)return;const t=A5.ctx.currentTime+.03,bar=Math.floor(i/8)%4;
    if(i%8===0)o5('sine',bass[bar],t,2.4,{gain:.05*v,attack:.05,wet:.7});
    const n=scale[(i*3+bar*2+(i%3===0?2:0))%scale.length];
    if(i%2===0||Math.random()<.35){o5('triangle',n,t,.9,{gain:.035*v,wet:.8});o5('sine',n*2,t,.6,{gain:.012*v,wet:.8})}
    i++;
  };
  YT6.synth=setInterval(tick,330);tick();
}
function stopWait6(){if(YT6.synth){clearInterval(YT6.synth);YT6.synth=null}}
function setVol6(v){prefs.musicVol=Math.max(0,Math.min(100,Number(v)||0));savePrefs();applyVol6()}
function renderVol6(){
  const b=$('mbMusic');if(!b)return;const m=wantMusic6(),on=!!(m&&m.playing);
  const label=on?(m.synth?'Música de espera':(m.title||'Música da mesa')):'Sem música';
  if(!b.firstChild){
    b.innerHTML=`<button type="button" class="mb-ico" id="mbMute" aria-label="Silenciar a música"></button><input type="range" id="mbVol" min="0" max="100" step="1" aria-label="Volume da música"><span class="mb-now" id="mbNow"></span><button type="button" class="btn small primary hide" id="mbUnlock">▶ Ativar som</button><a class="btn small hide" id="mbYt" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a><button type="button" class="btn small hide" id="mbAmbLocal">Ativar Ambiente</button><select id="mbAmb" class="mb-amb hide" aria-label="Ambiente sintetizado para a mesa"><option value="">♬ Ambiente…</option>${(T3.ambient?.list||[]).map(a=>`<option value="${a[0]}">${a[1]}</option>`).join('')}<option value="__stop">⏹ Parar ambiente</option></select>`;
    $('mbAmbLocal').onclick=toggleLocalAmb6;
    $('mbAmb').onchange=e=>{const v=e.target.value;if(v==='__stop'){if(M6.state.music?.amb)stopMusic6()}else if(v)playAmbient6(v);e.target.value=''};
    $('mbVol').oninput=e=>{setVol6(e.target.value);renderVol6()};
    $('mbMute').onclick=()=>{if(prefs.musicVol>0){M6.volBack=prefs.musicVol;setVol6(0)}else setVol6(M6.volBack||60);renderVol6()};
    $('mbUnlock').onclick=()=>unlockMusic6();
  }
  $('mbVol').value=prefs.musicVol;$('mbMute').textContent=prefs.musicVol>0?'🔊':'🔇';$('mbMute').title=prefs.musicVol>0?'Silenciar a música (só para você)':'Ligar a música';
  const bad=!!(on&&!m.synth&&YT6.err&&YT6.err.vid===(m.vid||m.url));
  $('mbNow').textContent=(bad?'⚠ ':on?'♪ ':'')+label+(bad?' · não toca neste navegador':'');$('mbNow').classList.toggle('on',on&&!bad);$('mbNow').title=bad?YT6.err.msg:'';
  $('mbUnlock').classList.toggle('hide',!(on&&YT6.blocked));
  const yt=$('mbYt');if(yt){const sh=!!(bad&&m.vid);yt.classList.toggle('hide',!sh);if(sh)yt.href='https://www.youtube.com/watch?v='+encodeURIComponent(m.vid)}
  const al=$('mbAmbLocal');if(al){al.classList.toggle('hide',!(bad||YT6.lamb));al.textContent=YT6.lamb?'Parar Ambiente':'Ativar Ambiente';al.setAttribute('aria-pressed',String(!!YT6.lamb))}
  const sa=$('mbAmb');if(sa)sa.classList.toggle('hide',!isGM6());
  const pv=$('pauseVol');if(pv)pv.value=prefs.musicVol;
}
/* comandos do Mestre */
function curPos6(){try{if(YT6.audio&&!YT6.audio.paused&&wantMusic6()?.url)return YT6.audio.currentTime;return YT6.player&&YT6.player.getCurrentTime?YT6.player.getCurrentTime():0}catch(e){return 0}}
function playTrack6(id,auto){const t=(M6.state.playlist||[]).find(x=>x.id===id);if(!t||!isGM6())return false;if(!auto)YT6.chain={};setState6({music:t.url&&!t.vid?{url:t.url,loop:true,title:t.title||'',moment:t.moment||'',playing:true,pos:0,ts:Date.now()}:{vid:t.vid,title:t.title||'',moment:t.moment||'',playing:true,pos:0,ts:Date.now()}});return true}
function pauseMusic6(){const m=M6.state.music;if(!m||!isGM6())return;setState6({music:{...m,playing:false,pos:curPos6(),ts:Date.now()}})}
function resumeMusic6(){const m=M6.state.music;if(!m||!isGM6())return;setState6({music:{...m,playing:true,ts:Date.now()}})}
function stopMusic6(){if(isGM6())setState6({music:null})}
function addTrack6(url,title,moment){
  const vid=ytId6(url);if(!vid&&!isAudioUrl6(url))return null;
  const u=String(url).trim().slice(0,600),t={id:'t'+rid(),title:String(title||'').trim().slice(0,90),moment:String(moment||'').trim().slice(0,40)};
  if(vid)t.vid=vid;else{t.url=u;if(!t.title){try{t.title=decodeURIComponent(new URL(u).pathname.split('/').pop()||'').replace(AUDIO_EXT6,'').slice(0,90)}catch(e){}}}
  setState6({playlist:[...(M6.state.playlist||[]),t].slice(-80)});return t;
}
function findTrack6(q){
  const n=normTxt(q).replace(/\b(a|o|as|os|da|do|de|para|pra|musica|trilha|som|momento|tema)\b/g,' ').replace(/\s+/g,' ').trim();if(!n)return null;
  const pl=M6.state.playlist||[],words=n.split(' ');
  let best=null,bs=0;
  pl.forEach(t=>{const hay=normTxt((t.moment||'')+' '+(t.title||''));let s=0;if(normTxt(t.moment||'')===n)s+=10;if(hay.includes(n))s+=5;words.forEach(w=>{if(w.length>2&&hay.includes(w))s+=1});if(s>bs){bs=s;best=t}});
  return bs>=1?best:null;
}
T3.music={ambient:playAmbient6,add:addTrack6,play:playTrack6,pause:pauseMusic6,stop:stopMusic6,find:findTrack6,vol:setVol6};
const sameTrk6=(m,t)=>!!(m&&((t.vid&&m.vid===t.vid)||(t.url&&m.url===t.url)));
function renderMusic6(){
  const box=$('mesaMusic');if(!box)return;const isM=isGM6(),st=M6.state,pl=st.playlist||[],m=st.music;
  const act=document.activeElement&&box.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName);
  if(act)return; /* não apaga o que o Mestre está digitando */
  const groups={};pl.forEach(t=>{const k=t.moment||'Sem momento';(groups[k]=groups[k]||[]).push(t)});
  box.innerHTML=`<div class="mu-now ${m&&m.playing?'on':''}"><div><small>${m?(m.playing?'Tocando agora':'Pausada'):'Nada tocando'}</small><b>${m?esc(m.title||(m.url?'Áudio direto':m.amb?'Ambiente':'Música do YouTube')):'Escolha uma música da playlist'}</b>${m&&m.moment?`<span class="pill">${esc(m.moment)}</span>`:''}</div>${isM&&m?`<div class="inline">${m.playing?'<button type="button" class="btn small" id="muPause">⏸ Pausar</button>':'<button type="button" class="btn small primary" id="muResume">▶ Retomar</button>'}<button type="button" class="btn small" id="muStop">⏹ Parar</button></div>`:''}</div>
   ${isM?`<form class="mu-form" id="muForm"><div class="field"><label for="muUrl">Link do YouTube ou de áudio (.mp3, .ogg, .wav, stream)</label><input id="muUrl" placeholder="https://… (YouTube ou arquivo de áudio)" inputmode="url"></div><div class="field"><label for="muTitle">Nome (opcional)</label><input id="muTitle" maxlength="90" placeholder="Ex.: Tema do porão"></div><div class="field"><label for="muMoment">Momento</label><input id="muMoment" list="muMoments" maxlength="40" placeholder="Ex.: Revelação da Sala"><datalist id="muMoments">${MOMENTS6.map(x=>`<option value="${x}">`).join('')}</datalist></div><button class="btn primary small">＋ Adicionar à playlist</button></form><h4>Ambientes sintetizados</h4><div class="inline mu-amb">${(T3.ambient?.list||[]).map(a=>`<button type="button" class="btn small ${m&&m.amb===a[0]&&m.playing?'primary':''}" data-amb="${a[0]}">${a[1]}</button>`).join('')}</div><p class="sub">Link direto de áudio e ambientes tocam em qualquer navegador (sem YouTube, sem erro 150).</p><p class="sub">Uma música com o momento <b>Intervalo</b> vira a música de espera do botão ⏸ Intervalo. Você também pode pedir ao Perseus: “toca a música para revelação da sala”.</p>`:'<p class="sub">O Mestre escolhe a música. O volume é só seu: use o controle no topo da mesa.</p>'}
   ${pl.length?Object.entries(groups).map(([k,list])=>`<h4>${esc(k)}</h4><ul class="mu-list">${list.map(t=>`<li class="${sameTrk6(m,t)?'cur':''}">${isM?`<button type="button" class="btn small ${sameTrk6(m,t)&&m.playing?'':'primary'}" data-mplay="${t.id}" aria-label="Tocar ${esc(t.title||'música')}">▶</button>`:''}<span class="mu-t">${t.bad?'<span title="O YouTube não deixa tocar esse vídeo aqui. Tire e procure outra versão." aria-label="Não toca aqui">⚠ </span>':''}${esc(t.title||(t.url?'Áudio direto':'Música do YouTube ('+t.vid+')'))}</span>${isM?`<button type="button" class="bn-x" data-mdel="${t.id}" title="Tirar da playlist" aria-label="Tirar da playlist">✕</button>`:''}</li>`).join('')}</ul>`).join(''):(isM?'':'<p class="sub">A playlist ainda está vazia.</p>')}`;
  const on=(id,f)=>{const e=$(id);if(e)e.onclick=f};
  on('muPause',pauseMusic6);on('muResume',resumeMusic6);on('muStop',stopMusic6);
  const f=$('muForm');if(f)f.onsubmit=async e=>{e.preventDefault();
    const url=$('muUrl').value,ttl=$('muTitle').value,mom=$('muMoment').value,vid=ytId6(url),btn=f.querySelector('button');
    if(!vid&&isAudioUrl6(url)){const t=addTrack6(url,ttl,mom);if(t){try{f.reset()}catch(x){}fx5('confirm');toast('Áudio direto adicionado: '+(t.title||'sem nome')+'.');return}}
    if(!vid){toast(/[?&]list=/.test(url)&&!/[?&]v=/.test(url)?'Esse é o link de uma playlist inteira. Abra um vídeo dela e copie o link do vídeo.':'Não reconheci esse link. Copie o endereço do vídeo na barra do navegador ou no botão Compartilhar do YouTube.');return}
    if(btn)btn.disabled=true;
    const info=await ytInfo6(vid);
    if(!info.ok){if(btn)btn.disabled=false;toast(info.why==='embed'?'O dono desse vídeo não deixa tocar fora do YouTube. Procure outra versão da música (por exemplo, “lyric video” ou o canal “Tópico”).':'Não encontrei esse vídeo. Ele pode estar privado ou ter sido removido.');return}
    const t=addTrack6(url,ttl||info.title,mom);if(btn)btn.disabled=false;if(!t){toast('Não reconheci esse link do YouTube.');return}
    try{f.reset()}catch(x){}fx5('confirm');toast('Música adicionada: '+(t.title||'sem nome')+'.')};
  $$('[data-amb]',box).forEach(b=>b.onclick=()=>playAmbient6(b.dataset.amb));
  $$('[data-mplay]',box).forEach(b=>b.onclick=()=>{actx();playTrack6(b.dataset.mplay)});
  $$('[data-mdel]',box).forEach(b=>b.onclick=()=>setState6({playlist:(M6.state.playlist||[]).filter(t=>t.id!==b.dataset.mdel)}));
}
/* intervalo: pausa a mesa para todos e toca a música de espera */
function togglePause6(on){
  if(!isGM6())return false;const cur=!!M6.state.pause?.on;on=on===undefined?!cur:!!on;if(on===cur)return on;
  setState6({pause:on?{on:true,since:Date.now()}:{on:false,since:0}});return on;
}
T3.pause=togglePause6;
function renderPause6(){
  const p=M6.state.pause||{},isM=isGM6();
  let o=$('mesaPause');
  if(!p.on||!camp3()){if(o){o.classList.remove('show','mini');clearInterval(M6.pauseTick)}M6.pauseShown=false;return}
  if(!o){
    o=document.createElement('div');o.id='mesaPause';
    o.innerHTML=`<div class="pause-card" role="dialog" aria-label="Intervalo"><div class="pause-ico" aria-hidden="true">⏸</div><h2>Intervalo</h2><p id="pauseMsg"></p><div class="pause-time" id="pauseTime">00:00</div><label class="pause-vol"><span>🔊 Volume da música de espera</span><input type="range" id="pauseVol" min="0" max="100" step="1"></label><div class="inline pause-act"><button type="button" class="btn primary" id="pauseResume">▶ Retomar a sessão</button><button type="button" class="btn small" id="pauseMin">Minimizar</button></div></div><button type="button" class="pause-pill" id="pausePill">⏸ Intervalo · toque para abrir</button>`;
    document.body.append(o);
    $('pauseVol').oninput=e=>{setVol6(e.target.value);renderVol6()};
    $('pauseResume').onclick=()=>togglePause6(false);
    $('pauseMin').onclick=()=>{if(isGM6())o.classList.add('mini')};$('pausePill').onclick=()=>o.classList.remove('mini');
  }
  $('pauseMsg').textContent=isM?'A mesa está em pausa para todos. A música de espera está tocando.':'O Mestre pausou a sessão. Pegue uma água: a mesa volta já.';
  $('pauseResume').style.display=isM?'':'none';$('pauseVol').value=prefs.musicVol;
  /* jogadores não minimizam nem fecham o intervalo: só o Mestre encerra */
  $('pauseMin').hidden=!isM;$('pauseMin').style.display=isM?'':'none';o.classList.toggle('locked',!isM);if(!isM)o.classList.remove('mini');
  if(!M6.pauseShown){M6.pauseShown=true;o.classList.remove('mini');fx5('round')}
  o.classList.add('show');
  clearInterval(M6.pauseTick);
  const tick=()=>{const s=Math.max(0,Math.floor((Date.now()-(p.since||Date.now()))/1000));const e=$('pauseTime');if(e)e.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  tick();M6.pauseTick=setInterval(tick,1000);
}

/* ---------- Perseus: bloco de notas e comandos do Mestre ---------- */
const RX_ADD6=/^\s*(?:perseus[,:!]?\s*)?(?:por favor[,]?\s*)?(?:adiciona|adicione|adicionar|anota|anote|anotar|salva|salve|salvar|guarda|guarde|guardar|coloca|coloque|colocar|bota|bote|botar|escreve|escreva|escrever|registra|registre|registrar|poe|põe|ponha)\b(.*?)\b(?:n[oa]s?|a[os]?|em|pr[oa]|para [oa])\s+(?:meu\s+|minha\s+|minhas\s+|meus\s+)?(?:b\.?n\.?|bloco de notas|bloco|notas|anota[cç][oõ]es)(?![\wÀ-ÿ])\s*(?:que\b|[:\-–—,])?\s*(.*)$/i;
const RX_ADD6B=/^\s*(?:b\.?n\.?|nota|anota[cç][aã]o)\s*[:\-–—]\s*(.+)$/i;
async function mesaCommand6(q){
  const raw=String(q||'').trim(),nq=normP(raw);if(!nq)return null;
  const hasBN=/\b(bn|bloco de notas|bloco|minhas notas|minhas anotacoes|anotacoes)\b/.test(nq);
  /* --- bloco de notas: qualquer pessoa, cada um no seu --- */
  let m=raw.match(RX_ADD6),text='';
  if(m)text=(m[2]||'').trim()||(m[1]||'').trim().replace(/^(a nota|uma nota|isso|que)\b[:,]?\s*/i,'');
  else if((m=raw.match(RX_ADD6B)))text=m[1].trim();
  if(text){
    const n=bnAdd6(text);if(!n)return null;
    const w=bnWhere6();
    return{m:'smug',html:`📝 Anotado no ${w.kind==='gm'?'<b>BN do Mestre</b>':w.kind==='ch'?`<b>BN de ${esc(nm(w.ch))}</b>`:'<b>bloco de notas</b>'}:<br><i>${esc(n.t)}</i><br><span class="sub">Tenho ${bnList6().length} nota(s) guardada(s). Só você vê.</span>`};
  }
  if(hasBN&&/\b(limpa|limpar|esvazia|zera|apaga tudo|apagar tudo)\b/.test(nq)){
    const k=bnList6().length;if(!k)return{html:'Seu BN já está vazio. Mais vazio que isso, só a minha paciência.'};
    bnSave6([]);return{html:`🧹 Apaguei as ${k} nota(s) do seu BN.`};
  }
  const del=hasBN&&nq.match(/\b(apaga|apagar|remove|remover|exclui|excluir|deleta|tira|tirar)\b.*?\b(\d+)\b/);
  if(del){const list=bnList6(),i=Number(del[2])-1;if(!list[i])return{m:'think',html:`Não existe a nota ${del[2]}. O seu BN tem ${list.length} nota(s).`};const t=list[i].t;bnDel6(list[i].id);return{html:`🗑 Apaguei a nota ${del[2]}: <i>${esc(t)}</i>`}}
  if(hasBN&&/\b(o que|oque|quais|qual|mostra|mostre|mostrar|lista|listar|le|ler|leia|ve|ver|abre|abrir|consulta|consultar|tem|busca|buscar|procura|procurar|pesquisa|pesquisar|acha|achar|sobre|lembra)\b/.test(nq)){
    const list=bnList6();
    const sm=nq.match(/\b(?:sobre|por|com|que fal[ae] d[eoa]s?|a respeito d[eoa]s?)\s+(?:a |o |as |os |um |uma )?(.+)$/);
    let term=sm?sm[1].replace(/\b(no|na|do|da|meu|minha|bn|bloco de notas|bloco|notas)\b/g,' ').replace(/\s+/g,' ').trim():'';
    if(!list.length)return{html:'Seu BN está vazio. Diga <b>“adiciona no BN: …”</b> e eu guardo.'};
    if(term){
      const words=term.split(' ').filter(w=>w.length>2);
      const hits=list.map((n,i)=>({n,i,s:words.reduce((s,w)=>s+(normP(n.t).includes(w)?1:0),0)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
      if(!hits.length)return{m:'think',html:`Procurei <b>${esc(term)}</b> no seu BN e não achei nada. Tenho ${list.length} nota(s) sobre outras coisas.`};
      return{html:`🔎 No seu BN, sobre <b>${esc(term)}</b>:<ol class="bn-list">${hits.slice(0,8).map(x=>`<li value="${x.i+1}"><span class="bn-t">${esc(x.n.t)}</span><small>${bnDate6(x.n.at)}</small></li>`).join('')}</ol>`};
    }
    return{html:`📝 Seu BN tem ${list.length} nota(s):<ol class="bn-list">${list.slice(-12).map((n,i)=>`<li value="${Math.max(0,list.length-12)+i+1}"><span class="bn-t">${esc(n.t)}</span><small>${bnDate6(n.at)}</small></li>`).join('')}</ol>${list.length>12?'<span class="sub">Mostrei as 12 mais recentes. O resto está na aba 📝 Notas.</span>':''}`};
  }
  /* --- automação da mesa: só o Mestre --- */
  const wantsMusic=/\b(toca|tocar|toque|solta|soltar)\b/.test(nq)||(/\b(coloca|colocar|bota|botar|poe|inicia|iniciar|comeca)\b/.test(nq)&&/\b(musica|trilha|som|playlist|tema)\b/.test(nq));
  const stopsMusic=/\b(para|parar|pare|pausa|pausar|pause|desliga|desligar|tira|tirar|corta|cortar|silencia)\b.*\b(musica|trilha|som)\b/.test(nq);
  const wantsMap=/\bmapa\b/.test(nq)&&/\b(muda|mudar|mude|troca|trocar|troque|coloca|colocar|coloque|abre|abrir|abra|carrega|carregar|mostra|mostrar|mostre|poe|bota|usa|usar)\b/.test(nq);
  const wantsPause=/\b(intervalo)\b/.test(nq)&&/\b(inicia|iniciar|comeca|comecar|faz|fazer|chama|chamar|abre|abrir|pausa|pausar|encerra|encerrar|termina|terminar|acaba|acabar|retoma|retomar|volta|voltar)\b/.test(nq);
  if(!(wantsMusic||stopsMusic||wantsMap||wantsPause))return null;
  if(!camp3())return{m:'think',html:'Isso é coisa da <b>Visão de Mesa</b>. Abra uma campanha primeiro.'};
  if(!isGM6())return{m:'smug',html:'Boa tentativa. 😼 Trocar o mapa, a música e o ritmo da mesa é trabalho do <b>Mestre</b>. Eu só obedeço a quem segura o escudo.'};
  if(wantsPause){const off=/\b(encerra|encerrar|termina|terminar|acaba|acabar|retoma|retomar|volta|voltar)\b/.test(nq);togglePause6(!off);return{html:off?'▶ Intervalo encerrado. De volta ao sofrimento.':'⏸ Intervalo no ar. Coloquei a música de espera para todo mundo.'}}
  if(stopsMusic&&!wantsMusic){if(!M6.state.music)return{html:'Não tem música tocando. Esse silêncio constrangedor é natural.'};pauseMusic6();return{html:'⏸ Música pausada para a mesa toda.'}}
  if(wantsMusic){
    const pl=M6.state.playlist||[];if(!pl.length)return{m:'think',html:'Sua playlist está vazia. Adicione músicas na aba <b>🎵 Música</b> e diga em que momento cada uma toca.'};
    const what=nq.replace(/^.*?\b(toca|tocar|toque|solta|soltar|coloca|colocar|bota|botar|poe|inicia|iniciar|comeca)\b/,'');
    const t=findTrack6(what);
    if(!t)return{m:'think',html:`Não achei na playlist nada para <b>${esc(what.trim()||'isso')}</b>. Os momentos que eu conheço: ${[...new Set(pl.map(x=>x.moment||x.title||'sem nome'))].map(esc).join(', ')}.`};
    actx();playTrack6(t.id);
    return{m:'hype',html:`🎵 Tocando para a mesa: <b>${esc(t.title||'música do YouTube')}</b>${t.moment?` <span class="sub">(${esc(t.moment)})</span>`:''}.`};
  }
  if(wantsMap){
    const what=nq.replace(/^.*\bmapa\b/,'').replace(/^\s*(da mesa|ativo|atual)?\s*(para|pro|pra|por|do|da|de|:)?\s*(o |a |os |as )?/,'').trim();
    if(!T3.mapFind)return{m:'think',html:'O mapa ainda não carregou. Abra a Visão de Mesa e tente de novo.'};
    const mp=T3.mapFind(what);
    if(!mp)return{m:'think',html:`Não achei um mapa chamado <b>${esc(what||'?')}</b>. Mapas guardados: ${M6.maps.length?M6.maps.map(x=>esc(x.name)).join(', '):'nenhum ainda (envie um em 🗺 Mapas)'}.`};
    T3.mapUse(mp.key);return{m:'hype',html:`🗺 Mapa trocado para <b>${esc(mp.name)}</b>. Todo mundo já está vendo.`};
  }
  return null;
}
T3.mesaCommand=mesaCommand6;
{const _r6=respond;respond=async function(q){
  let out=null;try{out=await mesaCommand6(q)}catch(e){console.warn('[T6] comando',e)}
  if(out)return pReply(out.html,{m:out.m||'smug'});
  return _r6(q);
};T3.perseus.respond=respond}

/* o Perseus sabe explicar as novidades */
[
 ['mesa-layout','Lugares na Visão de Mesa',['lugar','lugares','caixa m','caixa p','mestre no topo','ordem de chegada','narrador','falando como'],'Na <b>Visão de Mesa</b>, o Mestre fica na caixa do topo e os jogadores ocupam os lados na ordem em que chegaram, sempre equilibrados (com seis, três de cada lado). Embaixo de cada foto ficam Vital, Essência, Lucidez, a DF e os estados. O botão <b>⋯</b> abre os controles. O Mestre escolhe com um clique se está <b>narrando</b> (a máscara) ou falando como um NPC ou chefe.'],
 ['mesa-mapa','Mapa tático e tokens',['mapa','token','tokens','grade','nevoa','névoa','regua','régua','camera','câmera','zoom','mover token'],'O centro da mesa é o <b>mapa</b>. O Mestre envia mapas em 🗺 <b>Mapas</b>, ajusta a grade e coloca os tokens. Cada jogador move só o <b>próprio token</b>; a câmera e o zoom são do Mestre e todo mundo acompanha. A <b>régua</b> mede em metros e a <b>névoa</b> esconde o que ainda não foi revelado.'],
 ['mesa-call','Chamada de voz',['call','chamada','voz','microfone','mutar','mudo','sussurro','falar em particular','discord'],'O Mestre clica em <b>📞 Iniciar call</b> e todos na Visão de Mesa entram na hora. Quem fala fica com o <b>contorno verde</b> na foto. Use 🎙 para mutar. No <b>🤫 Sussurro</b>, o Mestre marca um ou mais jogadores e só eles se ouvem até ele voltar ao áudio geral.'],
 ['mesa-musica','Música e intervalo',['musica','música','youtube','playlist','trilha','intervalo','pausa','volume da musica'],'Na aba <b>🎵 Música</b> o Mestre cola links do YouTube e diz o <b>momento</b> de cada música. Tocou, toca para todos; o volume é de cada um, no topo da mesa. O botão <b>⏸ Intervalo</b> pausa a sessão e põe a música de espera. O Mestre também pode me pedir: “toca a música para revelação da sala”.'],
 ['mesa-docs','Imagens e documentos',['imagem','pop-up','popup','pista','pistas','documento','documentos','carta','enviar imagem'],'O Mestre usa <b>🖼 Enviar imagem</b> e escolhe: <b>todos</b> (fica na aba 📂 Documentos da mesa, e só ele apaga) ou <b>jogadores marcados</b> (aparece só para eles e fica na ficha, em Documentos / Pistas).'],
 ['bn','Bloco de notas (BN)',['bn','bloco de notas','anotar','anotacao','anotação','notas','minhas notas'],'Me diga <b>“adiciona no BN: a senha da porta é 1904”</b> e eu guardo. Depois pergunte <b>“o que tem no meu BN?”</b> ou <b>“busca no BN sobre a porta”</b>. Cada jogador tem o seu, guardado na própria ficha, e o Mestre tem o dele. As notas também ficam na aba 📝 Notas.'],
 ['rolar-atributo','Rolar atributo puro ou trocar o atributo',['atributo puro','rolar atributo','trocar atributo','outro atributo','rolar forca','teste de atributo'],'Na ficha, cada atributo tem um botão <b>🎲</b> para rolar o atributo puro (sem perícia, vale o maior dado). Em cada perícia há um seletor para escolher <b>com qual atributo</b> rolar aquele teste; o padrão já vem marcado. Na Visão de Mesa, o botão <b>🎲 Rolar</b> oferece as duas coisas.'],
].forEach(([id,title,kws,a])=>{if(K.some(x=>x.id===id))return;const e={id,title,kws,a};e.nk=kws.map(normP);e.nt=normP(title).split(' ').filter(w=>!STOP.has(w)&&w.length>2);K.push(e)});

/* ---------- liga tudo à Visão de Mesa ---------- */
{const _rt6=window.renderTable;window.renderTable=function(){
  _rt6.apply(this,arguments);
  try{if(camp3()){joinMesa6();layoutMesa6()}}catch(e){console.error('[T6] mesa',e)}
}}
{const _rc6=renderCombatUI;renderCombatUI=function(){_rc6.apply(this,arguments);try{const t=$q('#mesaDock [data-dock="combate"]');if(t)t.classList.toggle('alert',!!camp3()?.combat?.active)}catch(e){}}}
T3.mesaLayout=layoutMesa6;T3.mesaJoin=joinMesa6;T3.mesaLeave=leaveMesa6;
/* sair da campanha encerra a call, a música e os canais da mesa */
['backDashboard','portalLogout'].forEach(id=>$(id)?.addEventListener('click',()=>setTimeout(leaveMesa6,0)));
/* ao abrir a campanha o jogador já fica ligado à mesa: a call, a música, o intervalo e as imagens
   chegam mesmo que ele esteja com a ficha aberta */
{const _rch6=renderCharacters;renderCharacters=function(){_rch6.apply(this,arguments);try{if(camp3()&&cloud6())joinMesa6()}catch(e){console.warn('[T6] entrar na mesa',e)}}}
{const _rn6=render;render=function(){_rn6.apply(this,arguments);try{if(M6.campId)checkPrivateDocs6()}catch(e){}}}


