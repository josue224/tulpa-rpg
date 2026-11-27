/* ===================================================================
   TULPA · ONDA 12 — Itens caídos no mapa (camada de interface e rede)
   - As regras são do motor (js/10, E.drop*). Sem SQL novo.
   - O "livro" é M6.state.drops (campaign_store, chave state). Só o
     aparelho do Mestre escreve nele; dropsDone guarda o que já foi
     tratado (recarregar não repete nada).
   - O jogador pede por linhas em campaign_rolls, como nas ondas de
     combate: cmb 'dropreq' (largar) e 'pickreq' (pegar); o Mestre
     responde 'pickres'. O desarme usa a linha 'manres' que já existia.
   - Cada ficha é ajustada ao livro por quem a controla; o Mestre
     ajusta as de quem está fora da mesa.
   =================================================================== */
(()=>{
const DI={ready:false,readyAt:0,queue:[],busy:false,pend:{},pin:'',hover:'',barSig:'',tipSig:'',pruneAt:0,
  wait:{fresh:8000,pick:120000,off:4000,on:45000}};
T3.itens=DI;

const drops=()=>Array.isArray(M6.state.drops)?M6.state.drops:[];
const done=()=>Array.isArray(M6.state.dropsDone)?M6.state.dropsDone:[];
const doneWith=id=>[...done().filter(x=>x!==id),id].slice(-300);
const sheet=ch=>ch?(ch.id===activeCharacterId?data:(ch.data||{})):{};
const who=id=>id===activeCharacterId?(charById(id)||{id,data,vocations,tracks}):charById(id);
const loaded=ch=>!!ch&&(!!ch._sheetAvailable||ch.id===activeCharacterId);
const mine=ch=>!!ch&&controls(ch)&&loaded(ch);
const items=ch=>sheet(ch).inventory?.items||[];
const online=()=>!!(camp3()&&sb());
const ready=()=>DI.ready&&!!camp3()&&(!M6.campId||M6.campId===camp3().id);
const inCombat=()=>{const cm=camp3()?.combat;return!!(cm?.active&&cm.phase==='active')};
const gmOn=()=>isGM6()||!M6.live||!!M6.present?.[gmUid7()];
const mapKey=()=>geoKey10();
const tokPos=t=>{const l=MAP7.live[t.id];return l&&l.until>Date.now()?{...t,x:l.x,y:l.y}:t};
const unable=d=>E.isDying(d)||E.isDead(d)||E.computeMods(d).flags.has('semAgir');
const logRow=(ch,text)=>{if(online()&&ch)insertRow(ch,'Item no chão',{detail:{cmb:'log',text}}).catch(e=>console.warn('[T12] registro',e))};

/* ---------- geometria: parede e porta fechada bloqueiam ---------- */
const cellMid=(x,y)=>{const g=mapCfg7();return[g.ox+(x+.5)*g.cell,g.oy+(y+.5)*g.cell]};
function pathClear(t,x,y){const [ax,ay]=tokCenter10(t,t),[bx,by]=cellMid(x,y);return!blockers10().some(s=>E.segCross(ax,ay,bx,by,s))}
function cellClear(t,x,y){const [bx,by]=cellMid(x,y),m=mapCfg7().cell*.12;return pathClear(t,x,y)&&!blockers10().some(s=>E.segDist(bx,by,s)<m)}
const reachable=(t,e,folga)=>E.dropReach(t,e,folga)&&pathClear(t,e.x,e.y);

/* ===================== quem decide: o aparelho do Mestre ===================== */
function mark(id){if(!done().includes(id))setState6({dropsDone:doneWith(id)})}
async function createDrop({id,charId,item,reason='largado'}){
  if(done().includes(id)||drops().some(e=>e.id===id))return false;
  const ch=charById(charId);if(!ch||!item?.id){mark(id);return false}
  const t=tok14(charId);
  if(!t){mark(id);toast(`${nm(ch)} não tem token neste mapa: ${item.name} fica em "Largado" na ficha.`);return false}
  const line=E.dropLineage(drops(),charId,item.id);
  if(!line.ok){mark(id);return false} /* já não está com este personagem: nada a criar */
  if(drops().filter(e=>e.st==='floor').length>=E.DROP_MAX){mark(id);toast(`Há itens demais no chão: ${item.name} fica em "Largado" na ficha.`);return false}
  const g=mapCfg7(),key=mapKey(),T=tokPos(t);
  const cell=E.dropCell({tok:T,cols:g.cols,rows:g.rows,
    tokens:(M6.state.tokens||[]).filter(q=>q.id!==t.id&&charById(q.charId)).map(tokPos),
    drops:drops().filter(e=>e.st==='floor'&&e.map===key),clear:(i,j)=>cellClear(T,i,j)});
  const e=E.dropRecord({id,line:line.line,item,from:charId,fromName:nm(ch),map:key,x:cell.x,y:cell.y,at:Date.now(),reason,feet:cell.fallback});
  setState6({drops:[...drops(),e],dropsDone:doneWith(id)});
  await flushState6();
  logRow(ch,`${nm(ch)} ${reason==='desarme'?'foi desarmado de':'largou'} ${e.name}: ${cell.fallback?'caiu aos próprios pés (sem espaço livre ao redor)':'está no chão ao lado'}.`);
  reconcile();refresh();return true;
}
/* regras de quem pode pegar ('' = pode). Vale nos dois lados; o Mestre usa folga maior (rede) */
function pickRule(ch,e,folga){
  if(!e||e.st!=='floor')return'Esse item não está mais no chão.';
  if(e.map!==mapKey())return'Esse item está em outro mapa.';
  const t=tok14(ch.id);if(!t)return`${nm(ch)} não tem token neste mapa.`;
  if(unable(sheet(ch)))return`${nm(ch)} não pode agir neste estado.`;
  if(!reachable(tokPos(t),e,folga))return'Longe demais (até 1 célula) ou há parede ou porta fechada no caminho.';
  if(inCombat()&&curEntry()?.characterId!==ch.id)return`Em combate, só no turno de ${nm(ch)}.`;
  return'';
}
async function grant(e,ch,req){
  const r=E.dropTake(drops(),e.id,ch.id,{at:Date.now(),req,has:items(ch).some(i=>i.id===e.item.id)});
  if(!r)return false;
  setState6({drops:r.drops,dropsDone:doneWith(req)});
  await flushState6();reconcile();refresh();return true;
}
const answer=(ch,req,e,ok,text)=>insertRow(ch,'Pegar Item',{detail:{cmb:'pickres',req,dropId:e,charId:ch.id,ok,text}}).catch(err=>console.warn('[T12] resposta',err));
const sentBy=(row,ch)=>!!row.roller_id&&(row.roller_id===camp3()?.createdBy||row.roller_id===ch.ownerId||row.roller_id===uid3());
const rowChar=dt=>dt.cmb==='manres'?dt.targetId:dt.charId;
/* "ao vivo" é medido no relógio deste aparelho (o do servidor pode divergir); o resto é histórico */
async function handle({row,live,at}){
  const dt=row.detail,ch=charById(rowChar(dt)),waited=Date.now()-at,age=live?waited:Date.now()-(Date.parse(row.created_at)||0);
  if(dt.cmb==='pickreq'){
    if(!dt.req||done().includes(dt.req))return;
    if(age>DI.wait.pick){mark(dt.req);return}
    const e=drops().find(x=>x.id===dt.dropId);
    const why=!sentBy(row,ch)?'Só quem controla o personagem pode pegar o item.':!e||e.st!=='floor'?'Outra pessoa pegou primeiro.':pickRule(ch,e,.8);
    if(!why&&await grant(e,ch,dt.req))await answer(ch,dt.req,e.id,true,`${nm(ch)} pegou ${e.name} do chão.`);
    else{mark(dt.req);await answer(ch,dt.req,dt.dropId,false,`${nm(ch)} não pegou o item: ${why||'ele não está mais no chão.'}`)}
    return;
  }
  const dis=dt.cmb==='manres',it=dis?dt.drop:dt.item,key=dis?dt.mid:dt.req,id='d-'+key;
  if(!key||!it?.id||done().includes(id)||drops().some(e=>e.id===id))return;
  if(!sentBy(row,ch)){mark(id);return}
  /* linha antiga (Mestre fora da mesa ou recarregou): só vale se a ficha ainda mostra o item largado */
  if(!live||waited>DI.wait.fresh){
    const cur=items(ch).find(i=>i.id===it.id);
    if(!(cur&&cur.loc==='chao'&&(dis?cur.equipped===false:cur.dropPend===key))){mark(id);return}
  }
  await createDrop({id,charId:ch.id,item:it,reason:dis?'desarme':'largado'});
}
function enqueue(row,live){
  if(DI.queue.some(q=>q.row.id===row.id))return;
  DI.queue.push({row,live:!!live,at:Date.now(),tries:0});if(DI.queue.length>150)DI.queue.shift();
  setTimeout(pump,60);
}
async function pump(){
  if(DI.busy||!ready()||!isGM6())return;
  DI.busy=true;
  try{
    while(DI.queue.length&&ready()&&isGM6()){
      const q=DI.queue[0],row=q.row;
      if(row.campaign_id&&row.campaign_id!==camp3().id){DI.queue.shift();continue}
      const ch=charById(rowChar(row.detail));
      if(!ch||!loaded(ch)){if(++q.tries<20)break;DI.queue.shift();continue}
      DI.queue.shift();
      await handle(q);
    }
  }catch(e){console.warn('[T12] pedido',e)}
  finally{DI.busy=false}
}

/* ===================== fichas ajustadas ao livro ===================== */
function reconcile(){
  if(!ready())return;
  const L=drops();if(!L.length)return;
  const ids=new Set();L.forEach(e=>{ids.add(e.from);if(e.by)ids.add(e.by)});
  ids.forEach(cid=>{
    const ch=who(cid);if(!ch||!loaded(ch))return;
    if(!controls(ch)){
      if(!isGM6())return;
      /* dono na mesa ajusta a própria ficha; o Mestre só cobre quem está fora (ou não respondeu) */
      const upd=Math.max(0,...L.filter(e=>e.from===cid||e.by===cid).map(e=>e.upd||0));
      const w=M6.present?.[ch.ownerId]?DI.wait.on:DI.wait.off;
      if(Date.now()-Math.max(upd,DI.readyAt)<w)return;
    }
    try{
      const d=sheet(ch),probe={...d,inventory:JSON.parse(JSON.stringify(d.inventory||{}))};
      if(E.dropReconcile(probe,L,cid))mutateChar(ch,x=>E.dropReconcile(x,L,cid));
    }catch(e){console.warn('[T12] ficha',e)}
  });
}
function prune(){
  if(!isGM6()||!ready()||Date.now()-DI.pruneAt<60000)return;
  DI.pruneAt=Date.now();
  const L=drops(),out=E.dropPrune(L,Date.now(),e=>{const ch=who(e.by);return!ch||(loaded(ch)&&(sheet(ch).dropsIn||[]).includes(e.id))});
  if(out!==L)setState6({drops:out});
}

/* ===================== pegar ===================== */
const pendFor=dropId=>Object.values(DI.pend).find(p=>p.dropId===dropId);
/* quem este aparelho pode usar para pegar */
const mayAct=ch=>loaded(ch)&&(controls(ch)||(isGM6()&&!inCombat()));
function pickWhy(ch,e){
  if(!mayAct(ch))return'Você não controla este personagem agora.';
  const why=pickRule(ch,e,.35);if(why)return why;
  if(inCombat()&&!(TURN.actor===ch.id&&actionsLeft(ch)>0))return'A Ação deste turno já foi usada.';
  const d=sheet(ch),probe={...d,inventory:JSON.parse(JSON.stringify(d.inventory||{}))};
  if(!E.pickPlace(probe,{...e.item},e.home))return'Sem espaço: libere uma mão, a cintura ou a mochila.';
  return'';
}
function spendAction(ch){
  if(!inCombat())return null;
  const s={key:TURN.key,kind:TURN.actor===ch.id&&!TURN.actionUsed?'std':'extra'};
  spend(ch);return s;
}
function refund(p){
  const s=p?.spent;if(!s||TURN.key!==s.key)return;
  if(s.kind==='std')TURN.actionUsed=false;
  else{TURN.extraUsed=false;const ch=who(p.charId);if(ch)mutateChar(ch,d=>{d.combatExtra=1})}
}
function finish(req,ok,text){
  const p=DI.pend[req];if(!p)return;
  delete DI.pend[req];
  if(!ok)refund(p);
  toast(ok?text:text+(p.spent?' Sua Ação foi devolvida.':''));
  renderCombatUI();refresh();
}
async function pick(dropId,charId){
  const ch=who(charId),e=drops().find(x=>x.id===dropId);
  if(!ch)return;
  if(pendFor(dropId)){toast('Já há um pedido para este item: aguarde o Mestre.');return}
  const why=pickWhy(ch,e);if(why){toast(why);refresh();return}
  if(!online()){toast('Abra a campanha para pegar itens.');return}
  const req='p-'+rid();
  if(isGM6()){
    if(!ready()){toast('A mesa ainda está carregando.');return}
    const spent=spendAction(ch);
    if(!await grant(e,ch,req)){refund({spent,charId});toast('Esse item não está mais no chão.');return}
    answer(ch,req,e.id,true,`${nm(ch)} pegou ${e.name} do chão.`);
    toast(`${nm(ch)} pegou ${e.name}.`);renderCombatUI();return;
  }
  if(!gmOn()){toast('O Mestre precisa estar na mesa para confirmar quem fica com o item. Sua Ação não foi gasta.');return}
  DI.pend[req]={req,dropId,charId,name:e.name,spent:spendAction(ch),t:Date.now()};
  refresh();
  try{await insertRow(ch,'Pegar Item',{detail:{cmb:'pickreq',req,dropId,charId,name:e.name}})}
  catch(err){refund(DI.pend[req]);delete DI.pend[req];fail3('pegar item',err)}
  renderCombatUI();refresh();
}
/* se a resposta se perder, o próprio estado da mesa decide o pedido */
function settle(){
  Object.values(DI.pend).forEach(p=>{
    const e=drops().find(x=>x.id===p.dropId),age=Date.now()-p.t;
    if(e&&e.st==='taken'&&e.req===p.req)finish(p.req,true,`Você pegou ${p.name}.`);
    else if(e&&e.st==='taken'&&age>4000)finish(p.req,false,'Outra pessoa pegou primeiro.');
    else if(age>DI.wait.pick)finish(p.req,false,'O Mestre não confirmou o pedido.');
  });
}
/* Mestre: devolve a quem largou (ou apaga, se o personagem não existe mais) */
async function giveBack(dropId){
  const e=drops().find(x=>x.id===dropId);if(!isGM6()||!ready()||!e||e.st!=='floor')return;
  const ch=who(e.from);
  if(!ch){if(!confirm(`Apagar ${e.name} do mapa? Quem largou não existe mais.`))return;setState6({drops:drops().filter(x=>x.id!==dropId)});await flushState6();refresh();return}
  if(await grant(e,ch,'g-'+rid())){logRow(ch,`O Mestre devolveu ${e.name} a ${nm(ch)}.`);toast(`${e.name} voltou para ${nm(ch)}.`)}
}

/* ===================== largar ===================== */
function dropWhy(ch){
  if(!online()||!charById(ch?.id))return'Abra a campanha para largar itens no mapa.';
  if(!(mine(ch)||(isGM6()&&loaded(ch))))return'Você não controla este personagem.';
  if(!tok14(ch.id))return`${nm(ch)} não tem token no mapa.`;
  if(isGM6())return'';
  if(inCombat()&&curEntry()?.characterId!==ch.id)return'Em combate, largar um item é no seu turno.';
  if(unable(sheet(ch)))return'Neste estado você não pode largar itens.';
  return'';
}
async function drop(ch,itemId){
  const why=dropWhy(ch);if(why){toast(why);return false}
  const it=items(ch).find(i=>i.id===itemId);if(!it)return false;
  if(it.loc==='vestido'){toast('Tire a proteção antes de largar.');return false}
  if(pendingDrop(it)){toast('Este item já espera o Mestre colocar no mapa.');return false}
  const req=rid(),copy=E.dropClean(JSON.parse(JSON.stringify(it)));
  copy.from=it.loc;delete copy.loc;delete copy.dropPend;
  if(isGM6()){
    if(!ready()){toast('A mesa ainda está carregando.');return false}
    const ok=await createDrop({id:'d-'+req,charId:ch.id,item:copy});
    if(ok)toast(`${it.name} está no chão.`);return ok;
  }
  const before={loc:it.loc,armaEmUso:sheet(ch).armaEmUso};
  mutateChar(ch,x=>{const t=E.ensureInv(x).items.find(i=>i.id===itemId);if(!t)return;t.loc='chao';t.equipped=false;t.dropPend=req;if(x.armaEmUso===itemId)x.armaEmUso=''});
  try{await insertRow(ch,'Largar item',{detail:{cmb:'dropreq',req,charId:ch.id,item:copy}})}
  catch(err){
    mutateChar(ch,x=>{const t=E.ensureInv(x).items.find(i=>i.id===itemId);if(!t)return;t.loc=before.loc;delete t.dropPend;if(before.armaEmUso)x.armaEmUso=before.armaEmUso});
    fail3('largar item',err);return false;
  }
  toast(gmOn()?`Você largou ${it.name}.`:`${it.name} largado: aparece no mapa quando o Mestre abrir a mesa.`);
  renderCombatUI();return true;
}
const pendingDrop=it=>!!it.dropPend&&it.loc==='chao'&&!done().includes('d-'+it.dropPend);
const droppable=ch=>items(ch).filter(i=>i.loc!=='vestido'&&!pendingDrop(i));
function dropMenu(ch){
  ch=ch||who(activeCharacterId);if(!ch)return;
  const why=dropWhy(ch);if(why){toast(why);return}
  const list=droppable(ch);
  openModal('LARGAR ITEM',nm(ch),`<p class="sub">Ação livre. O item sai do inventário e fica no mapa, na célula livre ao lado do token. Quem estiver a até 1 célula pode pegá-lo (1 Ação).</p>${list.length?`<div class="t3-weapons">${list.map(i=>`<button type="button" class="t3-weapon" data-dropit="${esc(i.id)}"><b>${esc(i.name)}</b><span>${esc(LOCS[i.loc]||i.loc)}${i.w?' · '+esc(i.w.dado):''}</span></button>`).join('')}</div>`:'<div class="empty">Nada para largar.</div>'}`,'Fechar',closeModal);
  $$('#modalBody [data-dropit]').forEach(b=>b.onclick=()=>{closeModal();drop(ch,b.dataset.dropit)});
}

/* ===================== mapa: ícones, ficha do item e botão contextual ===================== */
const SVG={
  pistola:'<path d="M3 7h18v5h-7l-1 2h-3l-2 5H4l2-7H3z"/>',
  rifle:'<path d="M2 14l5-4V8h15v3h-7l-1 3h-3l-1-2-6 5z"/>',
  arco:'<path d="M7 3c9 3 9 15 0 18M7 3v18M3 12h17M17 9l3 3-3 3" fill="none"/>',
  faca:'<path d="M20 3c-6 1-10 5-12 10l3 3c5-2 8-7 9-13zM8 14l-5 5 2 2 5-5"/>',
  espada:'<path d="M20 4v4L10 18l-4-4L16 4zM5 13l6 6M7 17l-4 4"/>',
  machado:'<path d="M4 20L15 9M12 4c5-1 9 3 8 8l-5-1-3-3z"/>',
  porrete:'<path d="M3 21l8-8M10 11l6-8 5 5-8 6z"/>',
  bomba:'<circle cx="10" cy="14" r="7"/><path d="M15 9l3-3c0-2 2-3 3-2" fill="none"/>',
  escudo:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
  protecao:'<path d="M8 3L4 6l2 4v11h12V10l2-4-4-3-2 3h-4z"/>',
  municao:'<path d="M5 21V9l3-6 3 6v12zM13 21V9l3-6 3 6v12z"/>',
  objeto:'<path d="M3 8l9-5 9 5v9l-9 5-9-5zM3 8l9 5 9-5M12 13v9"/>',
};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SVG[k]||SVG.objeto}</svg>`;
const kindText=e=>[e.cat,e.vertName||e.skill].filter(Boolean).join(' · ');
const statText=e=>[e.dado?'Dano '+e.dado:'',e.critMin?'crítico '+(e.critMin>=20?'20':e.critMin+'-20'):'',e.peso?'peso '+e.peso:'',e.qty>1?'quantidade '+e.qty:'',e.ammo?(e.ammo.controlada?'gasta Munição solta':'munição livre'):''].filter(Boolean).join(' · ');
/* o jogador vê o item? mesmas regras dos tokens (névoa, cômodos, escuro) e sempre o que está ao alcance */
function seen(e,isM){
  if(isM)return true;
  if(myToks10().some(t=>reachable(tokPos(t),e,0)))return true;
  const vs=view10(),[x,y]=cellMid(e.x,e.y),cone=vs.mine.some(m=>m.views.some(o=>inPoly10(x,y,o.poly)));
  if(vs.mode==='dark'&&!(cone||litAt10(vs,x,y)||vs.others.some(o=>inPoly10(x,y,o.poly)&&vs.mine.some(m=>m.los&&inPoly10(x,y,m.los)))))return false;
  if(vs.mode==='rooms'&&!cone&&vs.fog.some(r=>inPoly10(x,y,r.pts)))return false;
  if(M6.state.fog?.on&&!mapFog7().has(e.y*mapCfg7().cols+e.x)&&!cone)return false;
  return true;
}
function layer(){
  const st=MAP7.stage,cv=MAP7.cv;if(!st||!cv)return null;
  let l=st.querySelector(':scope>.drop-layer');
  if(!l){
    l=document.createElement('div');l.className='drop-layer';l.setAttribute('role','group');l.setAttribute('aria-label','Itens no chão');
    cv.after(l);
    l.addEventListener('wheel',e=>mapWheel7(e),{passive:false});
    l.addEventListener('contextmenu',e=>e.preventDefault());
    const tip=document.createElement('div');tip.className='drop-tip';tip.id='dropTip';tip.hidden=true;
    const bar=document.createElement('div');bar.className='drop-bar';bar.hidden=true;bar.setAttribute('role','group');bar.setAttribute('aria-label','Itens ao alcance');
    st.append(bar,tip);DI.tipSig=DI.barSig='';
    tip.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();unpin(true)}});
  }
  return l;
}
const icoOf=id=>MAP7.stage?.querySelector(`.drop-ico[data-drop="${CSS.escape(id)}"]`);
function icon(l,e){
  const b=document.createElement('button');b.type='button';b.className='drop-ico';b.dataset.drop=e.id;
  b.setAttribute('aria-describedby','dropTip');b.setAttribute('aria-expanded','false');b.innerHTML=`<span>${svg(e.icon)}</span>`;
  let skip=false;
  b.addEventListener('pointerdown',ev=>{
    /* um token por cima do ícone continua podendo ser arrastado (a trava de turno decide no mapa) */
    const p=mapPt7(ev);if(mapHit7(p.wx,p.wy)){skip=true;ev.preventDefault();mapDown7(ev)}else skip=false;
  });
  b.addEventListener('click',ev=>{
    ev.stopPropagation();if(skip&&ev.detail){skip=false;return}
    if(DI.pin===e.id){unpin();return}
    DI.pin=e.id;DI.tipSig='';tip();bar();
    if(!ev.detail)MAP7.stage.querySelector('#dropTip button')?.focus(); /* teclado: vai para as ações */
  });
  b.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){DI.hover=e.id;tip()}});
  b.addEventListener('pointerleave',()=>{if(DI.hover===e.id){DI.hover='';tip()}});
  b.addEventListener('focus',()=>{DI.hover=e.id;tip()});
  b.addEventListener('blur',()=>{if(DI.hover===e.id){DI.hover='';tip()}});
  b.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.stopPropagation();DI.hover='';unpin()}});
  l.append(b);return b;
}
function unpin(focus){const id=DI.pin;DI.pin='';DI.tipSig='';tip();bar();if(focus)icoOf(id)?.focus()}
/* chamado dentro do desenho do mapa: na visão "Players" a identidade é a do jogador escolhido */
function paintItems(v,g,isM){
  const l=layer();if(!l)return;
  const key=mapKey(),list=drops().filter(e=>e.st==='floor'&&e.map===key&&seen(e,isM)),cs=g.cell*v.s;
  l.classList.toggle('off',MAP7.tool!=='move'||!!CB14.aim||!!TAC10.placing);
  const keep=new Set(list.map(e=>e.id)),stack={};
  [...l.children].forEach(b=>{if(!keep.has(b.dataset.drop))b.remove()});
  const have=new Map([...l.children].map(b=>[b.dataset.drop,b]));
  list.forEach(e=>{
    const b=have.get(e.id)||icon(l,e),k=e.x+','+e.y,n=stack[k]=(stack[k]||0)+1;
    const under=(M6.state.tokens||[]).some(t=>charById(t.charId)&&E.cellTaken(tokPos(t),e.x,e.y));
    const size=under?28:Math.round(Math.max(28,Math.min(44,cs)));
    let [sx,sy]=w2s7(v,...cellMid(e.x,e.y));
    if(under){sx+=cs*.34;sy+=cs*.34}
    sx+=(n-1)*10;sy-=(n-1)*10;
    const css=`left:${sx.toFixed(1)}px;top:${sy.toFixed(1)}px;width:${size}px;height:${size}px;${sx<-size||sy<-size||sx>v.cw+size||sy>v.ch+size?'display:none;':''}`;
    if(b.dataset.css!==css){b.dataset.css=css;b.style.cssText=css}
    const label=`Item no chão: ${e.name}${kindText(e)?', '+kindText(e):''}${e.dado?', dano '+e.dado:''}`;
    if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);
  });
  tip();
}
function actors(){
  const toks=(M6.state.tokens||[]).map(t=>({t,ch:charById(t.charId)})).filter(x=>x.ch);
  if(inCombat()){const ch=charById(curEntry()?.characterId);return ch&&mayAct(who(ch.id))&&TURN.actor===ch.id?[who(ch.id)]:[]}
  const sel=isGM6()&&toks.find(x=>x.t.id===MAP7.sel);
  return(sel?[sel]:toks.filter(x=>controls(x.ch))).map(x=>who(x.ch.id)).filter(mayAct);
}
/* opções "pegar" para um item: [{ch,why,wait}] de quem está ao alcance */
const options=(e,list=actors())=>list.filter(ch=>{const t=tok14(ch.id);return t&&!unable(sheet(ch))&&reachable(tokPos(t),e,.35)})
  .map(ch=>({ch,wait:!!pendFor(e.id),why:pickWhy(ch,e)}));
function pickButton(e,o,many){
  const off=o.wait||!!o.why;
  return`<button type="button" data-pick="${esc(e.id)}" data-by="${esc(o.ch.id)}" ${off?'disabled':''}>✋ Pegar Item (1 Ação): ${esc(e.name)}${many?' · '+esc(nm(o.ch)):''}${off?`<small>${esc(o.wait?'Aguardando o Mestre…':o.why)}</small>`:''}</button>`;
}
const bindPick=root=>$$('[data-pick]',root).forEach(b=>b.onclick=()=>{DI.pin='';DI.tipSig='';pick(b.dataset.pick,b.dataset.by)});
function tip(){
  const el=MAP7.stage?.querySelector('#dropTip');if(!el)return;
  const id=DI.pin||DI.hover,e=id&&drops().find(x=>x.id===id&&x.st==='floor'),b=e&&icoOf(id);
  MAP7.stage.querySelectorAll('.drop-ico').forEach(i=>{const v=String(i.dataset.drop===DI.pin);if(i.getAttribute('aria-expanded')!==v)i.setAttribute('aria-expanded',v)});
  if(!b||b.style.display==='none'){if(!el.hidden){el.hidden=true;DI.tipSig=''}if(DI.pin&&!b)DI.pin='';return}
  const pinned=DI.pin===id,opts=pinned?options(e):[],gm=pinned&&isGM6();
  const html=`<b>${esc(e.name)}</b>${kindText(e)?`<span>${esc(kindText(e))}</span>`:''}${statText(e)?`<span>${esc(statText(e))}</span>`:''}<small>${e.reason==='desarme'?'Desarmado de':'Largado por'} ${esc(e.fromName||'alguém')}${e.feet?' · caiu aos pés':''}</small>`
    +(pinned?`${opts.map(o=>pickButton(e,o,opts.length>1||isGM6())).join('')||'<small>Chegue a até 1 célula para pegar.</small>'}${gm?`<button type="button" data-back="${esc(e.id)}">${charById(e.from)?'↩ Devolver a '+esc(e.fromName):'🗑 Apagar do mapa'}</button>`:''}<button type="button" data-close>Fechar</button>`:'<small>Toque ou Enter para ver as ações.</small>');
  const sig=id+pinned+html;
  if(DI.tipSig!==sig){
    DI.tipSig=sig;el.innerHTML=html;el.classList.toggle('pin',pinned);
    el.setAttribute('role',pinned?'dialog':'tooltip');pinned?el.setAttribute('aria-label','Item no chão: '+e.name):el.removeAttribute('aria-label');
    bindPick(el);
    const c=el.querySelector('[data-close]');if(c)c.onclick=()=>unpin(true);
    const g=el.querySelector('[data-back]');if(g)g.onclick=()=>{DI.pin='';DI.tipSig='';giveBack(g.dataset.back);tip()};
  }
  el.hidden=false;
  const W=MAP7.stage.clientWidth,H=MAP7.stage.clientHeight,x=b.offsetLeft,y=b.offsetTop,r=(b.offsetWidth||32)/2,w=el.offsetWidth,h=el.offsetHeight;
  el.style.left=Math.max(8,Math.min(W-w-8,x-w/2))+'px';
  el.style.top=Math.max(8,y+r+6+h<=H-8?y+r+6:Math.min(H-h-8,y-r-6-h))+'px';
}
function bar(){
  const el=MAP7.stage?.querySelector(':scope>.drop-bar');if(!el)return;
  let list=[];
  if(camp3()&&!DI.pin&&!CB14.aim&&!TAC10.placing&&MAP7.tool==='move'){ /* com o cartão aberto, as ações ficam nele */
    const who_=actors(),key=mapKey();
    drops().filter(e=>e.st==='floor'&&e.map===key).forEach(e=>options(e,who_).forEach(o=>list.push([e,o])));
  }
  list.sort((a,b)=>!!a[1].why-!!b[1].why);
  const many=isGM6()||new Set(list.map(x=>x[1].ch.id)).size>1;
  const html=list.slice(0,innerWidth<=860?2:3).map(([e,o])=>pickButton(e,o,many)).join('');
  if(DI.barSig!==html){DI.barSig=html;el.innerHTML=html;bindPick(el)}
  el.hidden=!html;
}
function refresh(){try{mapDraw7();bar();tip()}catch(e){console.warn('[T12] mapa',e)}}

/* ===================== ligações ===================== */
const _po12=paintOver10;
paintOver10=function(x,v,g,isM){const out=_po12.apply(this,arguments);try{paintItems(v,g,isM)}catch(e){console.warn('[T12] desenho',e)}return out};
const _mm12=mapMenu7;
mapMenu7=function(t,e){
  const out=_mm12.apply(this,arguments);
  try{
    const m=$('mapMenu'),ch=t&&who(t.charId);
    if(m&&!m.hidden&&ch&&!dropWhy(ch)&&droppable(ch).length){
      const row=document.createElement('div');row.className='mm-row';row.innerHTML='<button type="button" class="mt-chip" data-mmdrop>🫳 Largar item</button>';
      m.append(row);row.firstChild.onclick=()=>{mapMenu7(null);dropMenu(ch)};
      m.style.top=Math.max(6,Math.min(m.offsetTop,(MAP7.stage?.clientHeight||0)-m.offsetHeight-6))+'px';
    }
  }catch(err){console.warn('[T12] menu',err)}
  return out;
};
const _ri12=renderInventory;
renderInventory=function(){
  const out=_ri12.apply(this,arguments);
  try{
    const ch=online()&&who(activeCharacterId);
    if(ch&&charById(ch.id))$$('#invBody [data-del-item]').forEach(b=>{
      const it=items(ch).find(i=>i.id===b.dataset.delItem);if(!it||it.loc==='vestido')return;
      if(pendingDrop(it)){b.insertAdjacentHTML('beforebegin','<span class="pill drop-pend">aguardando o Mestre pôr no mapa</span>');return}
      const n=document.createElement('button');n.type='button';n.className='btn small';n.dataset.droplog=it.id;n.textContent='🫳 Largar no mapa';
      n.onclick=()=>drop(who(activeCharacterId),it.id);b.before(n);
    });
  }catch(e){console.warn('[T12] inventário',e)}
  return out;
};
const _pr12=processRow;
processRow=function(row,live=true){
  const dt=row&&row.detail,old=!!(row&&CB.seen.has(row.id));
  const out=_pr12.apply(this,arguments);
  if(dt&&!old){
    try{
      if(dt.cmb==='dropreq'||dt.cmb==='pickreq'||(dt.cmb==='manres'&&dt.m==='desarmar'&&dt.success&&dt.drop))enqueue(row,live);
      else if(dt.cmb==='pickres'){
        if(dt.ok){CB.log.unshift({kind:'log',text:dt.text,at:row.created_at});CB.log=CB.log.slice(0,30)}
        if(DI.pend[dt.req])finish(dt.req,!!dt.ok,dt.text);else if(live)renderCombatUI();
      }
    }catch(e){console.warn('[T12] linha',e)}
  }
  return out;
};
/* o botão contextual acompanha na hora a troca de turno e a Ação gasta */
const _rc12=renderCombatUI;
renderCombatUI=function(){const out=_rc12.apply(this,arguments);try{if(MAP7.cv?.isConnected)bar()}catch(e){console.warn('[T12] botão',e)}return out};
/* a vez não passa sozinha enquanto um pedido meu de pegar item espera o Mestre */
const _pm12=pendingMine14;
pendingMine14=function(ch){return _pm12.apply(this,arguments)||Object.values(DI.pend).some(p=>p.charId===ch.id)};

function tick(){try{pump();reconcile();settle();prune();if(MAP7.cv?.isConnected){bar();tip()}}catch(e){console.warn('[T12] ciclo',e)}}
onState6((st,why)=>{
  /* só depois de ler o estado salvo: antes disso gravar apagaria a mesa */
  if(why==='carga'||why==='remoto'){if(!DI.ready)DI.readyAt=Date.now();DI.ready=true}
  setTimeout(tick,200);
});
M6.hooks.leave.push(()=>{DI.ready=false;DI.pend={};DI.pin=DI.hover='';MAP7.stage?.querySelector(':scope>.drop-layer')?.replaceChildren()});
setInterval(tick,1500);
document.addEventListener('pointerdown',e=>{if(DI.pin&&!e.target.closest?.('.drop-tip,.drop-ico'))unpin()},true);

Object.assign(T3,{itemDrop:drop,itemDropMenu:dropMenu,itemPick:pick});
Object.assign(DI,{tick,pump,reconcile,handle,createDrop,giveBack,seen,options,pickWhy});
})();
