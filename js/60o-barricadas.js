/* ==========================================================================
   TULPA RPG — Onda 4 · Fortificação e barricadas no mapa
   - As regras são do motor (js/10, E.barricade*, E.barAt, E.barPrune). Sem SQL.
   - O "livro" é M6.state.barricades (campaign_store, chave state): só o
     aparelho do Mestre escreve nele; barDone guarda os pedidos já tratados.
   - O jogador pede por linhas em campaign_rolls, como nos itens caídos:
     cmb 'barreq' (op 'set' barrica, op 'break' derruba) e o Mestre responde
     'barres'. DT = base (REGRA barricadaDT) + o efeito "dt" da vertente
     Fortificação & Barricadas (valor editável pela central ⚙️).
   - Porta barricada não abre sem forçar (Força + Atletismo contra a DT);
     inimigos em patrulha não abrem portas barricadas.
   - Em combate, barricar ou forçar gasta a Ação Padrão, só no turno de quem age.
   Carrega ANTES de js/61-init.js. IIFE: só publica T3.barricadas / T3.barricar.
   ========================================================================== */
(()=>{
'use strict';
if(window.__bar60o)return;window.__bar60o=true;
const BR={ready:false,readyAt:0,queue:[],busy:false,pend:{},sig:''};
T3.barricadas=BR;

const list=()=>E.barPrune(M6.state.barricades);
const done=()=>Array.isArray(M6.state.barDone)?M6.state.barDone:[];
const doneWith=id=>[...done().filter(x=>x!==id),id].slice(-200);
const online=()=>!!(camp3()&&sb());
const ready=()=>BR.ready&&!!camp3();
const inCombat=()=>{const cm=camp3()?.combat;return!!(cm?.active&&cm.phase==='active')};
const sheet=ch=>ch?(ch.id===activeCharacterId?data:(ch.data||{})):{};
const who=id=>id===activeCharacterId?(charById(id)||{id,data,vocations,tracks}):charById(id);
const loaded=ch=>!!ch&&(!!ch._sheetAvailable||ch.id===activeCharacterId);
const mine=ch=>!!ch&&controls(ch)&&loaded(ch);
const gmOn=()=>isGM6()||!M6.live||!!M6.present?.[gmUid7()];
const mapKey=()=>geoKey10();
const unable=d=>E.isDying(d)||E.isDead(d)||E.computeMods(d).flags.has('semAgir');
const tokPos=t=>{const l=MAP7.live[t.id];return l&&l.until>Date.now()?{...t,x:l.x,y:l.y}:t};
const logRow=(ch,text)=>{if(online()&&ch)insertRow(ch,'Barricada',{detail:{cmb:'log',text}}).catch(e=>console.warn('[T4] registro',e))};
const KIND={porta:'Porta barricada',cobertura:'Cobertura improvisada'};

/* ---------- geometria ---------- */
const cellOfTok=t=>{const g=mapCfg7(),[cx,cy]=tokCenter10(t,tokPos(t));return{x:Math.floor((cx-g.ox)/g.cell),y:Math.floor((cy-g.oy)/g.cell)}};
const cellMid=(x,y)=>{const g=mapCfg7();return[g.ox+(x+.5)*g.cell,g.oy+(y+.5)*g.cell]};
const wallMid=w=>[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2];
function doorsNear(t,mult){
  const g=mapCfg7(),[cx,cy]=tokCenter10(t,tokPos(t)),reach=g.cell*(mult||1.15);
  return geo10().walls.filter(w=>w.door).map(w=>{const [qx,qy]=closestOnSeg10(cx,cy,w.a[0],w.a[1],w.b[0],w.b[1]);return{w,d:hyp10(qx-cx,qy-cy)}}).filter(o=>o.d<=reach).sort((a,b)=>a.d-b.d).map(o=>o.w);
}
/* célula livre à frente do token (8 direções) */
function frontCell(t){
  const g=mapCfg7(),a=tokAng10(t,tokPos(t)),c=cellOfTok(t);
  const x=Math.max(0,Math.min(g.cols-1,c.x+Math.round(Math.cos(a)))),y=Math.max(0,Math.min(g.rows-1,c.y+Math.round(Math.sin(a))));
  return{x,y,self:x===c.x&&y===c.y};
}
const barOf=(kind,ref)=>E.barAt(list(),mapKey(),kind,ref);
const barAtDoor=w=>w&&E.barAt(list(),mapKey(),'porta',w.id);
const refOf=b=>b.kind==='porta'?b.wall:{x:b.x,y:b.y};
function barsNear(t){
  const g=mapCfg7(),[cx,cy]=tokCenter10(t,tokPos(t)),reach=g.cell*1.6,key=mapKey(),geo=geo10();
  return list().filter(b=>b.map===key).filter(b=>{
    if(b.kind==='porta'){const w=geo.walls.find(q=>q.id===b.wall);if(!w)return false;const [qx,qy]=closestOnSeg10(cx,cy,w.a[0],w.a[1],w.b[0],w.b[1]);return hyp10(qx-cx,qy-cy)<=reach}
    const [mx,my]=cellMid(b.x,b.y);return hyp10(mx-cx,my-cy)<=reach*1.1;
  });
}

/* ---------- Ação Padrão em combate (mesma regra dos itens caídos) ---------- */
function spendAct(ch){
  if(!inCombat())return null;
  const s={key:TURN.key,kind:TURN.actor===ch.id&&!TURN.actionUsed?'std':'extra'};
  spend(ch);return s;
}
function refundAct(p){
  const s=p?.spent;if(!s||TURN.key!==s.key)return;
  if(s.kind==='std')TURN.actionUsed=false;
  else{TURN.extraUsed=false;const ch=who(p.charId);if(ch)mutateChar(ch,d=>{d.combatExtra=1})}
}
function actWhy(ch){
  if(!online()||!charById(ch?.id))return'Abra a campanha para barricar no mapa.';
  if(!(mine(ch)||(isGM6()&&loaded(ch))))return'Você não controla este personagem.';
  if(!tok14(ch.id))return`${nm(ch)} não tem token no mapa.`;
  if(unable(sheet(ch)))return'Neste estado você não pode agir.';
  if(inCombat()&&!(TURN.actor===ch.id&&actionsLeft(ch)>0))return inCombat()&&TURN.actor!==ch.id?`Em combate, só no turno de ${nm(ch)}.`:'A Ação deste turno já foi usada.';
  return'';
}

/* ===================== quem decide: o aparelho do Mestre ===================== */
const sentBy=(row,ch)=>!!row.roller_id&&(row.roller_id===camp3()?.createdBy||row.roller_id===ch.ownerId||row.roller_id===uid3());
const answer=(ch,req,ok,text)=>insertRow(ch,'Barricada',{detail:{cmb:'barres',req,charId:ch.id,ok,text}}).catch(e=>console.warn('[T4] resposta',e));
function mark(id){if(!done().includes(id))setState6({barDone:doneWith(id)})}
async function commit(patchList,reqId){
  setState6({barricades:E.barPrune(patchList),barDone:doneWith(reqId)});
  await flushState6();refresh();
}
function reachOK(ch,kind,ref,e){
  const t=tok14(ch.id);if(!t)return false;
  if(kind==='porta'){const w=geo10().walls.find(q=>q.id===ref&&q.door);return!!w&&doorsNear(t,1.7).some(q=>q.id===w.id)}
  const c=cellOfTok(t);return Math.abs(c.x-ref.x)<=2&&Math.abs(c.y-ref.y)<=2;
}
async function handle({row,live,at}){
  const dt=row.detail,ch=charById(dt.charId);if(!ch||!dt.req||done().includes(dt.req))return;
  const age=live?Date.now()-at:Date.now()-(Date.parse(row.created_at)||0);
  if(age>60000){mark(dt.req);return}
  if(!sentBy(row,ch)){mark(dt.req);return}
  const key=mapKey();
  if(inCombat()&&curEntry()?.characterId!==ch.id){mark(dt.req);await answer(ch,dt.req,false,`${nm(ch)}: fora do turno, a barricada não foi feita.`);return}
  if(dt.op==='set'){
    const e=dt.entry||{},kind=e.kind==='cobertura'?'cobertura':'porta',ref=kind==='porta'?e.wall:{x:Number(e.x),y:Number(e.y)};
    let why='';
    if(!reachOK(ch,kind,ref))why='longe demais do local.';
    else if(E.barAt(list(),key,kind,ref))why='já está barricado.';
    else if(list().length>=E.BAR_MAX)why='há barricadas demais no mapa.';
    if(why){mark(dt.req);await answer(ch,dt.req,false,`${nm(ch)} não barricou: ${why}`);return}
    const d=sheet(ch),dtv=loaded(ch)?E.barricadeDT(d,kind):Math.min(Number(e.dt)||E.regra('barricadaDT'),E.regra('barricadaDT')+20);
    const b={id:'b-'+dt.req,map:key,kind,...(kind==='porta'?{wall:ref}:{x:ref.x,y:ref.y}),dt:dtv,by:ch.id,byName:nm(ch),at:Date.now()};
    await commit([...list(),b],dt.req);
    await answer(ch,dt.req,true,`${nm(ch)} montou ${KIND[kind].toLowerCase()} (DT ${dtv}).`);
    return;
  }
  if(dt.op==='break'){
    const b=list().find(x=>x.id===dt.barId);
    if(!b){mark(dt.req);await answer(ch,dt.req,false,'A barricada já não existe.');return}
    if(!reachOK(ch,b.kind,refOf(b))){mark(dt.req);await answer(ch,dt.req,false,`${nm(ch)} está longe demais da barricada.`);return}
    if(!(Number(dt.total)>=b.dt)){mark(dt.req);await answer(ch,dt.req,false,`${nm(ch)} não venceu a DT ${b.dt}.`);return}
    await commit(list().filter(x=>x.id!==b.id),dt.req);
    await answer(ch,dt.req,true,`${nm(ch)} derrubou ${KIND[b.kind].toLowerCase()} (DT ${b.dt}).`);
  }
}
function enqueue(row,live){
  if(BR.queue.some(q=>q.row.id===row.id))return;
  BR.queue.push({row,live:!!live,at:Date.now(),tries:0});if(BR.queue.length>80)BR.queue.shift();
  setTimeout(pump,60);
}
async function pump(){
  if(BR.busy||!ready()||!isGM6())return;
  BR.busy=true;
  try{
    while(BR.queue.length&&ready()&&isGM6()){
      const q=BR.queue[0],row=q.row;
      if(row.campaign_id&&row.campaign_id!==camp3().id){BR.queue.shift();continue}
      const ch=charById(row.detail.charId);
      if(!ch||!loaded(ch)){if(++q.tries<20)break;BR.queue.shift();continue}
      BR.queue.shift();await handle(q);
    }
  }catch(e){console.warn('[T4] pedido',e)}
  finally{BR.busy=false}
}

/* ===================== ações do jogador ===================== */
async function place(ch,kind,ref){
  const why=actWhy(ch);if(why){toast(why);return false}
  if(E.barAt(list(),mapKey(),kind,ref)){toast('Já está barricado.');return false}
  if(list().length>=E.BAR_MAX){toast('Há barricadas demais neste mapa.');return false}
  const d=sheet(ch),dtv=E.barricadeDT(d,kind),req=rid();
  const entry={kind,...(kind==='porta'?{wall:ref}:{x:ref.x,y:ref.y}),dt:dtv};
  if(isGM6()){
    if(!ready()){toast('A mesa ainda está carregando.');return false}
    const spent=spendAct(ch);
    const b={id:'b-'+req,map:mapKey(),kind,...(kind==='porta'?{wall:ref}:{x:ref.x,y:ref.y}),dt:dtv,by:ch.id,byName:nm(ch),at:Date.now()};
    await commit([...list(),b],req);
    logRow(ch,`${nm(ch)} montou ${KIND[kind].toLowerCase()} (DT ${dtv}).`);
    toast(`${KIND[kind]} montada (DT ${dtv}).`);renderCombatUI();return true;
  }
  if(!gmOn()){toast('O Mestre precisa estar na mesa para registrar a barricada. Sua Ação não foi gasta.');return false}
  BR.pend[req]={req,charId:ch.id,kind,spent:spendAct(ch),t:Date.now()};
  try{await insertRow(ch,'Barricar',{detail:{cmb:'barreq',req,charId:ch.id,op:'set',entry}})}
  catch(err){refundAct(BR.pend[req]);delete BR.pend[req];fail3('barricar',err);return false}
  toast('Pedido enviado: o Mestre confirma a barricada.');renderCombatUI();return true;
}
/* força a barricada: Força + Atletismo contra a DT dela */
async function force(ch,b){
  const why=actWhy(ch);if(why){toast(why);return false}
  if(!reachOK(ch,b.kind,refOf(b))){toast('Chegue mais perto da barricada.');return false}
  const spent=spendAct(ch);
  let r=null;
  try{r=await T3.rollSkillAs(ch,'Atletismo','Força',{})}catch(e){fail3('forçar barricada',e)}
  if(!r){refundAct({spent,charId:ch.id});return false}
  const ok=r.total>=b.dt;
  if(!ok){toast(`A barricada resistiu (${r.total} contra DT ${b.dt}).`);renderCombatUI();return false}
  const req=rid();
  if(isGM6()){await commit(list().filter(x=>x.id!==b.id),req);logRow(ch,`${nm(ch)} derrubou ${KIND[b.kind].toLowerCase()} (DT ${b.dt}).`);toast(`${KIND[b.kind]} derrubada.`);renderCombatUI();return true}
  if(!gmOn()){toast('Você venceu a DT, mas o Mestre precisa estar na mesa para tirar a barricada.');return false}
  BR.pend[req]={req,charId:ch.id,kind:b.kind,t:Date.now(),brk:true};
  try{await insertRow(ch,'Forçar barricada',{detail:{cmb:'barreq',req,charId:ch.id,op:'break',barId:b.id,total:r.total}})}
  catch(err){delete BR.pend[req];fail3('forçar barricada',err);return false}
  renderCombatUI();return true;
}
function finish(req,ok,text){
  const p=BR.pend[req];if(!p)return;delete BR.pend[req];
  if(!ok)refundAct(p);
  toast(ok?text:text+(p.spent?' Sua Ação foi devolvida.':''));
  renderCombatUI();refresh();
}
function settle(){
  Object.values(BR.pend).forEach(p=>{
    if(Date.now()-p.t>60000)finish(p.req,false,'O Mestre não confirmou o pedido.');
    else if(!p.brk&&list().some(b=>b.id==='b-'+p.req))finish(p.req,true,'Barricada montada.');
  });
}
async function removeGM(b){
  if(!isGM6()||!ready())return;
  await commit(list().filter(x=>x.id!==b.id),'g-'+rid());toast(`${KIND[b.kind]} removida.`);
}

/* ===================== menu: barricar / forçar ===================== */
function menu(ch){
  ch=ch||who(activeCharacterId);if(!ch)return;
  const why=actWhy(ch);if(why){toast(why);return}
  const t=tok14(ch.id),d=sheet(ch),opts=[];
  doorsNear(t).forEach(w=>{if(!doorOpenNow(w)&&!barAtDoor(w))opts.push({k:'p',w,txt:`Barricar a porta ao lado`,dt:E.barricadeDT(d,'porta')})});
  const fc=frontCell(t);
  if(!fc.self&&!barOf('cobertura',{x:fc.x,y:fc.y}))opts.push({k:'c',fc,txt:`Montar cobertura improvisada à frente (célula ${fc.x+1}, ${fc.y+1})`,dt:E.barricadeDT(d,'cobertura')});
  const near=barsNear(t);
  const fortify=E.vertSum(d,'dt',{alvo:'barricada'}),bonus=fortify?` (inclui +${fortify} de Fortificação)`:'';
  const html=`<p class="sub">${inCombat()?'Gasta a Ação Padrão. ':''}A DT para forçar ou derrubar é a base da mesa mais o bônus da Fortificação & Barricadas${bonus}.</p>`+
    (opts.length?`<h4 class="rp6-h">Montar</h4><div class="bar-opts">${opts.map((o,i)=>`<button type="button" class="btn primary" data-barset="${i}">🧱 ${esc(o.txt)} · DT ${o.dt}</button>`).join('')}</div>`:'<p class="sub">Nada para barricar aqui: chegue a uma porta fechada ou vire o token para uma célula livre.</p>')+
    (near.length?`<h4 class="rp6-h">Barricadas ao alcance</h4><div class="bar-opts">${near.map((b,i)=>`<div class="bar-row"><span>${esc(KIND[b.kind])} · DT ${b.dt} · ${esc(b.byName||'')}</span><button type="button" class="btn" data-barbrk="${i}">Forçar (Força + Atletismo)</button>${isGM6()?`<button type="button" class="btn" data-barrm="${i}">Remover</button>`:''}</div>`).join('')}</div>`:'');
  openModal('FORTIFICAÇÃO',nm(ch),html,'Fechar',()=>closeModal());
  $$('#modalBody [data-barset]').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.barset];closeModal();o.k==='p'?place(ch,'porta',o.w.id):place(ch,'cobertura',{x:o.fc.x,y:o.fc.y})});
  $$('#modalBody [data-barbrk]').forEach(b=>b.onclick=()=>{const o=near[+b.dataset.barbrk];closeModal();force(ch,o)});
  $$('#modalBody [data-barrm]').forEach(b=>b.onclick=()=>{const o=near[+b.dataset.barrm];closeModal();removeGM(o)});
}
const doorOpenNow=w=>doorOpen10(w);
T3.barricar=menu;

/* ===================== porta barricada não abre ===================== */
{const _du=doorUse10;doorUse10=function(w,t){
  try{
    const b=barAtDoor(w);
    if(b&&!doorOpen10(w)){
      const ch=t&&charById(t.charId);
      fx5('doorLocked');toast(`🧱 Porta barricada (DT ${b.dt}).`);
      if(ch)openModal('PORTA BARRICADA',`DT ${b.dt}`,`<p>${esc(b.byName||'Alguém')} barricou esta porta. Força + Atletismo contra a DT ${b.dt}${inCombat()?' (gasta a Ação Padrão)':''}.</p><div class="bar-opts"><button type="button" class="btn primary" id="barForce">Forçar a barricada</button>${isGM6()?'<button type="button" class="btn" id="barRem">Remover a barricada</button>':''}</div>`,'Fechar',()=>closeModal());
      $('barForce')&&($('barForce').onclick=()=>{closeModal();force(ch,b)});
      $('barRem')&&($('barRem').onclick=()=>{closeModal();removeGM(b)});
      return;
    }
  }catch(e){console.warn('[T4] porta',e)}
  return _du.apply(this,arguments);
}}
if(typeof enemyDoor23==='function'){const _ed=enemyDoor23;enemyDoor23=function(w){try{if(barAtDoor(w))return}catch(e){}return _ed.apply(this,arguments)}}

/* ===================== desenho no mapa ===================== */
function paintBars(x,v,g,isM){
  const L=list().filter(b=>b.map===mapKey());if(!L.length)return;
  const geo=geo10(),cell=mapCfg7().cell*v.s,fs=Math.max(9,Math.min(14,cell*.26));
  L.forEach(b=>{
    let wx,wy;
    if(b.kind==='porta'){const w=geo.walls.find(q=>q.id===b.wall);if(!w)return;[wx,wy]=wallMid(w)}
    else[wx,wy]=cellMid(b.x,b.y);
    const [sx,sy]=w2s7(v,wx,wy);if(sx<-40||sy<-40||sx>v.cw+40||sy>v.ch+40)return;
    const r=Math.max(9,Math.min(26,cell*(b.kind==='porta'?.34:.42)));
    x.save();x.translate(sx,sy);
    x.fillStyle='rgba(92,58,28,.92)';x.strokeStyle='rgba(20,12,6,.95)';x.lineWidth=1.5;
    if(b.kind==='porta'){x.beginPath();x.rect(-r,-r*.55,r*2,r*1.1);x.fill();x.stroke();
      x.strokeStyle='rgba(210,170,110,.9)';x.lineWidth=2;x.beginPath();x.moveTo(-r*.8,-r*.4);x.lineTo(r*.8,r*.4);x.moveTo(-r*.8,r*.4);x.lineTo(r*.8,-r*.4);x.stroke()}
    else{x.beginPath();x.rect(-r,-r,r*2,r*2);x.fill();x.stroke();
      x.strokeStyle='rgba(210,170,110,.9)';x.lineWidth=2;x.beginPath();x.moveTo(-r,-r*.33);x.lineTo(r,-r*.33);x.moveTo(-r,r*.33);x.lineTo(r,r*.33);x.stroke()}
    x.font='700 '+fs+'px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';
    const tx='DT '+b.dt,w=x.measureText(tx).width+8;
    x.fillStyle='rgba(8,6,4,.88)';x.fillRect(-w/2,r+3,w,fs+4);x.fillStyle='#f4ead6';x.fillText(tx,0,r+3+(fs+4)/2);
    x.restore();
  });
}
const _po60=paintOver10;
paintOver10=function(x,v,g,isM){const out=_po60.apply(this,arguments);try{paintBars(x,v,g,isM)}catch(e){console.warn('[T4] desenho',e)}return out};
function refresh(){try{mapDraw7()}catch(e){}}

/* menu do token */
const _mm60=mapMenu7;
mapMenu7=function(t,e){
  const out=_mm60.apply(this,arguments);
  try{
    const m=$('mapMenu'),ch=t&&who(t.charId);
    if(m&&!m.hidden&&ch&&!m.querySelector('[data-mmbar]')&&online()&&(mine(ch)||(isGM6()&&loaded(ch)))){
      const row=document.createElement('div');row.className='mm-row';row.innerHTML='<button type="button" class="mt-chip" data-mmbar>🧱 Barricar ou forçar</button>';
      m.append(row);row.firstChild.onclick=()=>{mapMenu7(null);menu(ch)};
      m.style.top=Math.max(6,Math.min(m.offsetTop,(MAP7.stage?.clientHeight||0)-m.offsetHeight-6))+'px';
    }
  }catch(err){console.warn('[T4] menu',err)}
  return out;
};

/* respostas do Mestre chegam como linhas */
const _pr60=processRow;
processRow=function(row,live=true){
  const dt=row&&row.detail,old=!!(row&&CB.seen.has(row.id));
  const out=_pr60.apply(this,arguments);
  if(dt&&!old){
    try{
      if(dt.cmb==='barreq')enqueue(row,live);
      else if(dt.cmb==='barres'){
        if(dt.ok){CB.log.unshift({kind:'log',text:dt.text,at:row.created_at});CB.log=CB.log.slice(0,30)}
        if(BR.pend[dt.req])finish(dt.req,!!dt.ok,dt.text);else if(live)renderCombatUI();
      }
    }catch(e){console.warn('[T4] linha',e)}
  }
  return out;
};

function prune(){
  if(!isGM6()||!ready()||Date.now()-(BR.pruneAt||0)<60000)return;
  BR.pruneAt=Date.now();
  const key=mapKey(),geo=geo10(),L=list(),out=L.filter(b=>b.map!==key||b.kind!=='porta'||geo.walls.some(w=>w.id===b.wall));
  if(out.length!==L.length||(Array.isArray(M6.state.barricades)&&M6.state.barricades.length!==L.length))setState6({barricades:out});
}
function tick(){try{pump();settle();prune()}catch(e){console.warn('[T4] ciclo',e)}}
onState6((st,why)=>{
  if(why==='carga'||why==='remoto'){if(!BR.ready)BR.readyAt=Date.now();BR.ready=true}
  setTimeout(tick,200);
});
M6.hooks.leave.push(()=>{BR.ready=false;BR.pend={}});
setInterval(tick,1500);

Object.assign(BR,{place,force,menu,handle,list,tick});
})();
