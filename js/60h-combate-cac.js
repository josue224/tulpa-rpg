/* ===================================================================
   TULPA · ONDA 10 — Combate corpo a corpo (camada de interface)
   - Marcador de Reação, Guarda Fechada e as manobras Desarmar, Derrubar,
     Agarrar/Escapar e Empurrar. As regras são do motor (js/10, E.*).
   - Quem decide o quê (sem SQL novo, tudo por campaign_rolls):
       1. o aparelho de quem age rola e grava a linha cmb:'man';
       2. o aparelho de quem controla o ALVO rola a disputa, aplica a
          condição na própria ficha e grava cmb:'manres';
       3. o aparelho de quem agiu aplica o lado dele (segurar, Judô);
       4. o aparelho do Mestre move o token empurrado (deslocamento
          forçado: a trava de turno continua valendo para todo mundo).
   - Gancho da Onda 12 (itens caídos): T3.disarmHooks.push(fn) ou o
     evento window 'tulpa:disarm'. fn({mid,attackerId,targetId,item,isGM})
     roda em todo aparelho que recebe o desarme ao vivo; só o Mestre
     (isGM) deve gravar o item no estado da mesa.
   =================================================================== */
(()=>{
const CAC={pend:{},queue:[],busy:false,offer:'',sig:''};
T3.cac=CAC;
T3.disarmHooks=T3.disarmHooks||[];

const inCombat=()=>{const cm=camp3()?.combat;return!!(cm?.active&&cm.phase==='active')};
const sheet=ch=>ch?(ch.id===activeCharacterId?data:(ch.data||{})):{};
const me=()=>charById(activeCharacterId)||{id:activeCharacterId,data,vocations,tracks};
const who=id=>id===activeCharacterId?me():charById(id);
const mine=ch=>!!ch&&controls(ch)&&(ch._sheetAvailable||ch.id===activeCharacterId);
const calc=(ch,skill,attr)=>skillCalc3({data:sheet(ch),vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},skill,attr);
const online=()=>!!(camp3()&&sb());
const logRow=(ch,label,text)=>{if(online()&&ch&&charById(ch.id))insertRow(ch,label,{detail:{cmb:'log',text}}).catch(e=>console.warn('[T10] registro',e))};
/* a Ação Padrão: em combate só no próprio turno (a Retaliação serve para atacar, não para manobrar) */
const canSpend=ch=>!inCombat()||(TURN.actor===ch.id&&actionsLeft(ch)>0);
const tokNow=t=>{const l=MAP7.live[t.id];return l&&l.until>Date.now()?l:t};
const center=t=>tokCenter10(t,tokNow(t));
/* true / false; null = sem token no mapa (mesa sem mapa: o Mestre confere) */
function adjacent(aId,bId,folga=0){
  const a=tok14(aId),b=tok14(bId);if(!a||!b)return null;
  const [ax,ay]=center(a),[bx,by]=center(b),reach=2.2+(((a.s||1)+(b.s||1))/2-1)*mapCfg7().mpc;
  if(px2m14(hyp10(bx-ax,by-ay))>reach+.01+folga)return false;
  return folga?true:los14(ax,ay,bx,by);
}

/* ---------- Reação e Guarda ---------- */
const rxState=i=>i.forbidden?'x':i.guard?'g':i.reactionAvailable?'on':'off';
const rxText=i=>i.forbidden?'Reação bloqueada':i.guard?`Guarda Fechada: ${i.left} de ${i.cap}`:i.reactionAvailable?'Reação disponível':'Reação usada';
function badge(ch){
  if(!ch||!inCombat())return'';
  const d=sheet(ch);if(d.hideStats&&!isGM6()&&!controls(ch))return'';
  const i=E.reactionInfo(d,turnOf(ch)),edit=canEdit(ch)&&(ch._sheetAvailable||ch.id===activeCharacterId),t=nm(ch)+': '+rxText(i);
  return`<button type="button" class="cac-dot" data-st="${rxState(i)}" data-cacrx="${ch.id}" ${edit?'':'disabled'} aria-label="${esc(t)}" title="${esc(t+(edit?' (toque para alterar)':''))}">${i.guard?'G'+i.left:i.reactionAvailable?'◆':'◇'}</button>`;
}
function toggle(id){
  const ch=who(id);if(!ch||!canEdit(ch)||!(ch._sheetAvailable||ch.id===activeCharacterId))return;
  if(!inCombat()){toast('Fora de combate a Reação está sempre disponível.');return}
  const t=turnOf(ch),i=E.reactionInfo(sheet(ch),t);
  if(i.forbidden){toast('Neste estado não dá para usar reações.');return}
  const used=i.left>0;
  mutateChar(ch,x=>E.setReaction(x,t,used));
  toast(`${nm(ch)}: Reação marcada como ${used?'usada':'disponível'}.`);refresh();
}
function guard(ch){
  ch=ch||me();
  if(!inCombat()){toast('A Guarda Fechada só vale durante o combate.');return}
  if(!canEdit(ch)||!mine(ch))return;
  if(!canSpend(ch)){toast('A Guarda Fechada gasta a Ação Padrão do seu turno.');return}
  const d=sheet(ch),t=turnOf(ch);
  if(E.computeMods(d).flags.has('semAgir')){toast('Neste estado você não pode agir.');return}
  const test=E.closeGuard(JSON.parse(JSON.stringify(d)),t);if(!test.ok){toast(test.msg);return}
  spend(ch);mutateChar(ch,x=>E.closeGuard(x,t));
  logRow(ch,'Guarda Fechada',`${nm(ch)} fechou a guarda (Ação Padrão): até ${E.GUARDA_CAP} Bloqueios nesta rodada, +${E.GUARDA_BONUS} de redução.`);
  toast(`🛡 Guarda Fechada: até ${E.GUARDA_CAP} Bloqueios, +${E.GUARDA_BONUS} de redução, até o seu próximo turno.`);refresh();
}

/* ---------- agarrão: soltar ---------- */
function release(holder,targetId,why=''){
  const t=charById(targetId),n=t?nm(t):'o alvo';
  mutateChar(holder,x=>E.dropHold(x,targetId));
  const text=`${nm(holder)} soltou ${n}${why?' ('+why+')':''}.`;
  if(t&&online())sendFx([targetId],[{t:'release',by:holder.id}],text,holder);
  toast(text);refresh();
}
const _fx10=applyFxLocal;
applyFxLocal=function(ch,fx){
  const list=[].concat(fx),own=list.filter(f=>f&&(f.t==='grapple'||f.t==='release'));
  if(!own.length)return _fx10.apply(this,arguments);
  mutateChar(ch,x=>own.forEach(f=>f.t==='grapple'?E.applyGrapple(x,f.by):E.releaseGrapple(x,f.by)));
  const rest=list.filter(f=>!own.includes(f));if(rest.length)return _fx10(ch,rest);
};

/* ---------- manobras: quem age ---------- */
function skillsFor(d,m){
  return E.MANOBRAS[m].skills.filter(s=>s!=='Armas Brancas'||E.quickWeapons(d).some(i=>E.isMeleeWeapon(i.w)));
}
function menu(ch){
  ch=ch||me();const d=sheet(ch),turn=canSpend(ch),held=E.holding(d);
  const cards=Object.entries(E.MANOBRAS).filter(([k])=>k!=='escapar'||E.hasStatus(d,'agarrado')).flatMap(([k,m])=>skillsFor(d,k).map(sk=>{
    const chk=E.maneuverCheck(d,k),p=E.maneuverPlan(d,k,{skill:sk}),c=calc(ch,p.skill,p.attr),off=!turn||!chk.ok;
    return`<button type="button" class="t3-weapon" data-man="${k}" data-sk="${esc(sk)}" ${off?'disabled':''}><b>${m.name}${m.skills.length>1?' com '+sk:''}</b><span>${esc(p.skill)} ${Math.max(1,c.n+p.extraDice)}d20 ${sign(c.bonus)} · ${esc(m.hint)}</span>${off||p.notes.length?`<span class="sub">${esc(off?(!turn?'Gasta a Ação Padrão do seu turno.':chk.msg):p.notes.join(' · '))}</span>`:''}</button>`}));
  openModal('MANOBRAS CORPO A CORPO',nm(ch),`<p class="sub">1 Ação Padrão, alvo adjacente (até 1,5 m, diagonal conta), sem dano.</p><div class="t3-weapons">${cards.join('')}${held.map(id=>`<button type="button" class="t3-weapon" data-drop="${id}"><b>Soltar ${esc(nm(charById(id)))}</b><span>Ação livre</span></button>`).join('')}</div>`,'Fechar',closeModal);
  $$('#modalBody [data-man]').forEach(b=>b.onclick=()=>{closeModal();_modalResolve=null;start(ch,b.dataset.man,b.dataset.sk)});
  $$('#modalBody [data-drop]').forEach(b=>b.onclick=()=>{closeModal();_modalResolve=null;release(ch,b.dataset.drop)});
}
async function start(ch,m,skill){
  ch=ch||me();const def=E.MANOBRAS[m];if(!def)return;
  let d=sheet(ch);const pre=E.maneuverCheck(d,m);
  if(!pre.ok){toast(pre.msg);return}
  if(!canSpend(ch)){toast(`${def.name} gasta a Ação Padrão do seu turno.`);return}
  if(!online()||!charById(ch.id)){const p=E.maneuverPlan(d,m,{skill});if(ch.id===activeCharacterId)rollSkill(p.skill,p.attr||undefined,{label:def.name+' · '+p.skill});return}
  let tid=m==='escapar'?E.grappledBy(d):'';
  if(!tid||!charById(tid)){
    const cands=chars3().filter(c=>c.id!==ch.id&&inScene(c)&&!isDeadCh(c)&&adjacent(ch.id,c.id)!==false);
    if(!cands.length){toast('Ninguém adjacente para '+def.name+'.');return}
    const p=await pickTargets({title:def.name,multi:false,exclude:[ch.id],only:cands.map(c=>c.id),skipDead:true,hint:m==='escapar'?'Quem está segurando você?':'Escolha o alvo adjacente.'});
    if(!p||!p.ids.length)return;tid=p.ids[0];
  }
  const tc=charById(tid);if(!tc)return;
  if(m!=='escapar'&&adjacent(ch.id,tid)===false){toast(nm(tc)+' não está adjacente.');return}
  d=sheet(ch);const chk=E.maneuverCheck(d,m,tc.data,tid);
  if(!chk.ok){toast(chk.msg);return}
  if(!canSpend(ch)){toast('Sua Ação Padrão não está mais disponível.');return}
  const plan=E.maneuverPlan(d,m,{skill}),c=calc(ch,plan.skill,plan.attr);
  const r=E.rollTest(d,plan.skill,c.SA,{mods:c.mods,bonus:c.bonus+plan.bonus,disadv:c.dis,extraDice:plan.extraDice,consumeDelta:true});fx3('dice');
  if(inCombat()){spend(ch);if(m!=='escapar')CB14.atkKey=TURN.key}
  mutateChar(ch,x=>consumeOnce(x,c));
  showRollPopup({eyebrow:'MANOBRA',title:`${nm(ch)} · ${def.name}`,sub:'Alvo: '+nm(tc),sets:[{label:`${plan.skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max',note:r.mode!=='normal'?r.mode:''}],big:r.total,detail:(plan.notes.map(esc).join(' · ')||'Aguardando o alvo…')});
  const detail={cmb:'man',mid:rid(),m,attackerId:ch.id,attackerName:nm(ch),targetId:tid,targetName:nm(tc),atk:{skill:plan.skill,total:r.total},atkFor:E.attr(d,'Força')};
  try{await insertRow(ch,def.name,{dice:r.dice,bonus:r.bonus,total:r.total,attribute:c.attr,detail})}catch(e){fail3('manobra',e)}
  refresh();
}

/* ---------- manobras: quem sofre ---------- */
const helpless=d=>{const f=E.computeMods(d).flags;return f.has('semAgir')||f.has('semDefender')||E.isDying(d)||E.isDead(d)};
function queue(mid){if(!CAC.queue.includes(mid))CAC.queue.push(mid);setTimeout(next,200)}
function next(){
  if(CAC.busy||!CAC.queue.length)return;
  if($('modalWrap').classList.contains('open')||CB.prompting){clearTimeout(CAC.nt);CAC.nt=setTimeout(next,1000);return}
  const mid=CAC.queue.shift(),p=CAC.pend[mid];
  if(p&&!p.done)prompt10(mid);
  if(CAC.queue.length)setTimeout(next,400);
}
function prompt10(mid){
  const p=CAC.pend[mid],dt=p?.dt,tc=dt&&who(dt.targetId);if(!tc||p.done)return;
  const d=sheet(tc),def=E.MANOBRAS[dt.m];if(!def)return;
  if(dt.m==='empurrar'||helpless(d)){resolve(mid);return}
  const opts=def.def.filter(s=>s!=='Armas Brancas'||E.quickWeapons(d).some(i=>E.isMeleeWeapon(i.w))).map(s=>{const c=calc(tc,s);return{s,n:c.n,bonus:c.bonus}}).sort((a,b)=>b.bonus+b.n*2-a.bonus-a.n*2);
  openModal('MANOBRA CONTRA VOCÊ',nm(tc),`<div class="notice t3-alert"><b>${esc(dt.attackerName)}</b> tenta <b>${def.name}</b> contra <b>${esc(nm(tc))}</b> (${dt.atk.total}).</div><p>Disputa direta: empate favorece quem defende. Não gasta a sua Reação.</p><div class="inline">${opts.map(o=>`<button type="button" class="btn" data-res="${esc(o.s)}">🎲 ${esc(o.s)} ${o.n}d20 ${sign(o.bonus)}</button>`).join('')}</div>`,'Resistir com '+opts[0].s,()=>{closeModal();resolve(mid,opts[0].s)});
  setTimeout(()=>$$('#modalBody [data-res]').forEach(b=>b.onclick=()=>{closeModal();resolve(mid,b.dataset.res)}),0);
}
async function resolve(mid,skill,byMaster=false){
  const p=CAC.pend[mid];if(!p||p.done||p.busy)return;
  const dt=p.dt,tc=who(dt.targetId),def=E.MANOBRAS[dt.m];if(!tc||!def)return;
  p.busy=true;markDefDone(mid,dt.targetId);
  try{
    const d=sheet(tc);let r=null;
    if(dt.m!=='empurrar'&&!helpless(d)){
      const sk=def.def.includes(skill)?skill:def.def[0],c=calc(tc,sk);
      r={skill:sk,...E.rollTest(d,sk,c.SA,{mods:c.mods,bonus:c.bonus,disadv:c.dis,consumeDelta:true})};fx3('dice');
      mutateChar(tc,x=>consumeOnce(x,c));
    }
    const weapon=dt.m==='desarmar'?E.disarmTarget(d):null;
    const res=E.resolveManeuver({m:dt.m,atk:Number(dt.atk.total)||0,def:r?r.total:null,dt:dt.m==='empurrar'?E.pushDT(d):0,atkFor:dt.atkFor,twoHanded:E.isTwoHanded(weapon)});
    let success=res.success,drop=null,note='';const released=[];
    if(dt.m==='desarmar'&&!weapon){success=false;note='o alvo não empunha nenhuma arma'}
    if(success)mutateChar(tc,x=>{
      if(dt.m==='derrubar')E.addStatus(x,'caido');
      else if(dt.m==='agarrar')E.applyGrapple(x,dt.attackerId);
      else if(dt.m==='desarmar')drop=E.disarm(x,weapon.id);
      else if(dt.m==='escapar')E.dropHold(x,dt.attackerId);
      else if(dt.m==='empurrar'){ /* empurrar desfaz os agarrões do alvo */
        const by=E.grappledBy(x);if(by&&E.releaseGrapple(x,by))released.push({holder:by,target:dt.targetId});
        E.holding(x).forEach(h=>released.push({holder:dt.targetId,target:h}));E.dropHold(x);
      }
    });
    const vs=dt.m==='empurrar'?`${res.total} contra DT ${res.dt}`:`${res.total} contra ${r?r.total:'alvo indefeso'}`;
    const done={desarmar:`desarmou ${dt.targetName}: ${drop?.name||'a arma'} caiu no chão`,derrubar:`derrubou ${dt.targetName} (Caído)`,agarrar:`agarrou ${dt.targetName}`,escapar:`escapou de ${dt.targetName}`,empurrar:`empurrou ${dt.targetName} ${fmtM14(res.meters)} m`}[dt.m];
    const text=`${dt.attackerName} ${success?done:`tentou ${def.name} contra ${dt.targetName} e não conseguiu${note?': '+note:''}`} (${vs}).`;
    const detail={cmb:'manres',mid,m:dt.m,attackerId:dt.attackerId,attackerName:dt.attackerName,targetId:dt.targetId,targetName:dt.targetName,success,meters:success?res.meters:0,drop,released,text};
    if(r)showRollPopup({eyebrow:'DISPUTA',title:`${nm(tc)} · ${r.skill}`,sub:def.name,sets:[{label:`${r.skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max'}],big:success?'Falhou em resistir':'Resistiu',tone:success?'hit':'ok'});
    await insertRow(tc,def.name+' · resultado'+(byMaster?' (pelo Mestre)':''),{dice:r?r.dice:[],bonus:r?r.bonus:0,total:r?r.total:0,detail});
  }catch(e){fail3('resolver manobra',e)}
  finally{p.busy=false;refresh()}
}

/* ---------- manobras: depois do resultado ---------- */
function offerHold(att,tid){
  const t=charById(tid);if(!t||!mine(att))return;
  if(!E.canHoldAfterTrip(sheet(att),turnOf(att))||adjacent(att.id,tid)===false)return;
  CAC.offer=att.id;
  const ask=()=>{
    if($('modalWrap').classList.contains('open'))return setTimeout(ask,900);
    if(!E.canHoldAfterTrip(sheet(att),turnOf(att))){CAC.offer='';return}
    openModal('JUDÔ / WRESTLING',nm(att),`<p><b>${esc(nm(t))}</b> caiu. Gaste a sua <b>Reação</b> para mantê-lo <b>Agarrado</b> no chão (ocupa 1 mão, você anda pela metade).</p>`,'Gastar Reação e agarrar',()=>{
      closeModal();CAC.offer='';
      const turn=turnOf(att);if(!E.canHoldAfterTrip(sheet(att),turn))return;
      mutateChar(att,x=>{E.useReaction(x,turn);E.addHold(x,tid)});
      sendFx([tid],[{t:'grapple',by:att.id}],`${nm(att)} gastou a Reação (Judô) e manteve ${nm(t)} Agarrado no chão`,att);refresh();
    });
  };
  setTimeout(ask,600);setTimeout(()=>{if(CAC.offer===att.id)CAC.offer=''},30000);
}
/* empurrão: só o aparelho do Mestre move o token (linha reta, parando em parede, borda ou outro token) */
function pushOnMap(dt){
  const key='tulpa_push_'+dt.mid;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1')}catch(e){}
  const a=tok14(dt.attackerId),t=tok14(dt.targetId),tc=charById(dt.targetId);if(!tc)return;
  if(!a||!t){toast(`Sem os dois tokens no mapa: afaste ${nm(tc)} ${fmtM14(dt.meters)} m na narração.`);return}
  const [ax,ay]=center(a),[bx,by]=center(t),dist=m2px14(dt.meters);
  const segments=blockers10().map(s=>({...s,edge:!s.id}));
  const circles=(M6.state.tokens||[]).filter(q=>{const c=charById(q.charId);return q.id!==t.id&&(!c||!isDeadCh(c))}).map(q=>{const [x,y]=center(q);return{x,y,r:tokR10(q),id:q.charId}});
  const p=E.pushPath({x:bx,y:by,dx:bx-ax,dy:by-ay,dist,radius:tokR10(t),segments,circles,bounds:mapWorld7()});
  const moved=px2m14(p.moved);
  if(p.moved>.5)placeTok14(t,p.x,p.y,'push');
  const txt=p.hit?`COLISÃO! ${fmtM14(moved)} m`:`EMPURRADO ${fmtM14(moved)} m`;
  floatTxt14(dt.targetId,txt,'#ffd36b');cast6({t:'cbf',id:dt.targetId,txt,col:'#ffd36b'});
  if(!p.hit)return;
  const other=p.hit==='token'?nm(charById(p.hitId)):'';
  const what={parede:'bateu na parede',borda:'bateu na borda do mapa (pode ser uma queda)',token:'esbarrou em '+other}[p.hit];
  const text=`${nm(tc)} foi empurrado ${fmtM14(moved)} m de ${fmtM14(dt.meters)} m e ${what}. Colisão ${E.regra('colisaoDado')} ou queda ${E.regra('quedaDado')} de dano, ou teste de Atletismo/Reflexo, a critério do Mestre.`;
  logRow(tc,'Colisão',text);collision(tc,text,E.PUSH_HAZARD[p.hit]);
}
function collision(tc,text,sug){
  if($('modalWrap').classList.contains('open'))return setTimeout(()=>collision(tc,text,sug),1200);
  const b=(expr,label)=>`<button type="button" class="btn ${expr===sug?'primary':''}" data-haz="${expr}" data-lb="${label}">${label}: ${expr}</button>`;
  openModal('COLISÃO NO EMPURRÃO',nm(tc),`<div class="notice t3-alert">${esc(text)}</div><div class="inline">${b(E.regra('colisaoDado'),'Colisão')}${b(E.regra('quedaDado'),'Queda')}</div>`,'Sem dano',closeModal);
  $$('#modalBody [data-haz]').forEach(x=>x.onclick=()=>{closeModal();const n=rollAnn(tc,x.dataset.lb+' · '+x.dataset.haz,x.dataset.haz,'COLISÃO');sendFx([tc.id],[{t:'dmg',n}],`${nm(tc)} sofreu ${n} de dano (${x.dataset.lb.toLowerCase()})`,tc)});
}
function onMan(row,live){
  const dt=row.detail,at=Date.parse(row.created_at)||Date.now();
  if(!dt.mid||!E.MANOBRAS[dt.m]||CAC.pend[dt.mid])return;
  CAC.pend[dt.mid]={dt,t:at,done:false};
  if(!live||Date.now()-at>120000)return;
  const tc=who(dt.targetId);if(mine(tc)&&!defDone(dt.mid,dt.targetId))queue(dt.mid);
}
function onRes(row,live){
  const dt=row.detail,at=Date.parse(row.created_at)||Date.now();
  const p=CAC.pend[dt.mid]||(CAC.pend[dt.mid]={dt,t:at});if(p.done)return;p.done=true;
  CB.log.unshift({kind:'log',text:dt.text,at:row.created_at});CB.log=CB.log.slice(0,30);
  if(!live||Date.now()-at>120000)return;
  toast(dt.text);
  const att=who(dt.attackerId);
  if(dt.success&&mine(att)){
    if(dt.m==='agarrar')mutateChar(att,x=>E.addHold(x,dt.targetId));
    else if(dt.m==='escapar')mutateChar(att,x=>E.releaseGrapple(x,dt.targetId));
    else if(dt.m==='derrubar')offerHold(att,dt.targetId);
  }
  (dt.released||[]).forEach(({holder,target})=>{
    const h=who(holder),t=who(target);
    if(mine(h)&&E.holding(sheet(h)).includes(target))mutateChar(h,x=>E.dropHold(x,target));
    if(mine(t)&&E.grappledBy(sheet(t))===holder)mutateChar(t,x=>E.releaseGrapple(x,holder));
  });
  if(!dt.success)return;
  const label={desarmar:'DESARMADO!',derrubar:'CAÍDO!',agarrar:'AGARRADO!',escapar:'SE SOLTOU!'}[dt.m];
  if(label)floatTxt14(dt.m==='escapar'?dt.attackerId:dt.targetId,label,'#ffd36b');
  if(dt.m==='desarmar'&&dt.drop){
    const ev={mid:dt.mid,attackerId:dt.attackerId,targetId:dt.targetId,item:dt.drop,isGM:isGM6()};
    T3.disarmHooks.forEach(fn=>{try{fn(ev)}catch(e){console.warn('[T10] gancho de desarme',e)}});
    window.dispatchEvent(new CustomEvent('tulpa:disarm',{detail:ev}));
  }
  if(dt.m==='empurrar'&&dt.meters>0&&isGM6())pushOnMap(dt);
}
const _pr10=processRow;
processRow=function(row,live=true){
  const dt=row&&row.detail,seen=!!(row&&CB.seen.has(row.id));
  const out=_pr10.apply(this,arguments);
  if(dt&&!seen){
    try{
      if(dt.cmb==='man'){onMan(row,live);renderCombatUI()}
      else if(dt.cmb==='manres'){onRes(row,live);renderCombatUI()}
      else if(dt.cmb==='mark'){CAC.pend={};CAC.queue=[]}
    }catch(e){console.warn('[T10] manobra',e)}
  }
  return out;
};
/* a vez não passa sozinha enquanto uma manobra minha espera resposta */
const _pm10=pendingMine14;
pendingMine14=function(ch){return _pm10.apply(this,arguments)||CAC.offer===ch.id||Object.values(CAC.pend).some(p=>!p.done&&p.dt.attackerId===ch.id&&Date.now()-p.t<120000)};

/* ---------- painel da Mesa ---------- */
function panel(list){
  let h='';
  if(inCombat())list.forEach(c=>{
    const d=sheet(c),i=E.reactionInfo(d,turnOf(c)),held=E.holding(d),by=E.grappledBy(d);
    h+=`<div class="cac-line">${badge(c)}<span><b>${esc(nm(c))}</b> · ${rxText(i)}${by?' · agarrado por '+esc(nm(charById(by))):''}</span>${held.map(id=>`<button type="button" class="btn small" data-cacdrop="${c.id}|${id}">Soltar ${esc(nm(charById(id)))}</button>`).join('')}</div>`;
  });
  Object.entries(CAC.pend).filter(([,p])=>!p.done&&Date.now()-p.t<900000).forEach(([mid,p])=>{
    const tc=charById(p.dt.targetId),can=mine(tc),gm=!can&&isGM6()&&tc?._sheetAvailable;
    h+=`<div class="t3-pend">🤼 <b>${esc(p.dt.attackerName)}</b> tenta ${E.MANOBRAS[p.dt.m].name} contra <b>${esc(p.dt.targetName)}</b>: aguardando o alvo ${can?`<button type="button" class="btn small primary" data-cacres="${mid}">Resolver</button>`:''}${gm?`<button type="button" class="btn small" data-cacres="${mid}" data-gm="1">Resolver por ${esc(p.dt.targetName)}</button>`:''}</div>`;
  });
  return h;
}
function bind(root){
  if(!root)return;
  $$('[data-cacrx]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();toggle(b.dataset.cacrx)});
  $$('[data-cacdrop]',root).forEach(b=>b.onclick=()=>{const [h,t]=b.dataset.cacdrop.split('|'),c=who(h);if(c&&mine(c))release(c,t)});
  $$('[data-cacres]',root).forEach(b=>b.onclick=()=>{const id=b.dataset.cacres;if(b.dataset.gm)resolve(id,'',true);else prompt10(id)});
}

/* ---------- aba Combate & Defesa da ficha ---------- */
function sheetPanel(){
  const box=$('combatTabBody');if(!box)return;
  box.querySelector('#cacSheet')?.remove();
  const ch=me(),d=data,fight=inCombat()&&!!charById(ch.id),t=fight?turnOf(ch):null,i=E.reactionInfo(d,t),turn=!fight||canSpend(ch);
  const blocks=E.blockStyles(d).map(s=>{const p=E.blockPlan(d,s.id,t),c=calc(ch,p.skill,p.attr);return`<div class="t3-item"><div class="grow"><b>${esc(p.label)}</b><div class="inline"><span class="tag">${Math.max(1,c.n+p.extraDice)}d20 ${sign(c.bonus)}</span><span class="tag t3-chip-good">reduz ${p.reduction} (CON ${p.parts.con}${p.parts.vert?' + Boxe '+p.parts.vert:''}${p.parts.guard?' + Guarda '+p.parts.guard:''})</span></div></div></div>`}).join('');
  const cdice=E.vertSum(d,'dados',{quando:'contraAtaque'}),held=E.holding(d),by=E.grappledBy(d);
  const man=Object.entries(E.MANOBRAS).filter(([k])=>k!=='escapar'||E.hasStatus(d,'agarrado')).map(([k,m])=>`<button type="button" class="btn" data-cacman="${k}" ${turn&&E.maneuverCheck(d,k).ok?'':'disabled'} title="${esc(m.hint)}">${m.name}</button>`).join('');
  const el=document.createElement('div');el.className='panel';el.id='cacSheet';
  el.innerHTML=`<div class="panel-head"><h2>Corpo a corpo</h2>${fight?`<button type="button" class="btn small cac-rx" data-st="${rxState(i)}" data-cacrx="${ch.id}" aria-pressed="${!i.reactionAvailable}">${rxText(i)}</button>`:'<span class="pill">Fora de combate</span>'}</div>
  <p class="sub">1 Reação por rodada (volta no início do seu turno). A <b>Guarda Fechada</b> gasta a Ação Padrão: até ${E.GUARDA_CAP} Bloqueios na rodada e +${E.GUARDA_BONUS} de redução.</p>
  <div class="inline cac-acts"><button type="button" class="btn" id="cacGuardBtn" ${fight&&turn&&!i.guard&&!i.forbidden?'':'disabled'}>🛡 Guarda Fechada</button>${man}${held.map(id=>`<button type="button" class="btn" data-cacdrop="${ch.id}|${id}">Soltar ${esc(nm(charById(id)))}</button>`).join('')}</div>
  ${by||held.length?`<div class="notice t3-alert">${by?'Você está Agarrado por <b>'+esc(nm(charById(by)))+'</b>.':''} ${held.length?'Você segura '+held.map(id=>'<b>'+esc(nm(charById(id)))+'</b>').join(' e ')+': 1 mão ocupada e metade do deslocamento.':''}</div>`:''}
  <h3>Bloquear (Reação)</h3>${blocks}<p class="sub">Dano com Brecha ou Parcial: metade do dano menos a redução (mínimo 1).${cdice?` Contra-Ataque: +${cdice}d20.`:''}</p>
  <div class="t3-table"><div><b>Erro total</b><span>ATA &lt; ${E.DB} e Bloqueio ≥ ${E.DB}: nenhum dano e 1 Contra-Ataque grátis.</span></div><div><b>Brecha</b><span>Bloqueio ≥ ATA com ATA &lt; ${E.DB}, ou folga de ${E.regra('brechaMargem')} ou mais: dano reduzido e 1 Contra-Ataque grátis.</span></div><div><b>Parcial</b><span>Bloqueio ≥ ${E.DB} e ATA maior (ou bloqueio vencendo por menos de ${E.regra('brechaMargem')}): dano reduzido.</span></div><div><b>Guarda quebrada</b><span>Bloqueio &lt; ${E.DB} e ATA ≥ ${E.DB}: dano total.</span></div></div>`;
  box.insertBefore(el,box.children[1]||null);
  bind(el);
  el.querySelector('#cacGuardBtn').onclick=()=>guard(me());
  $$('[data-cacman]',el).forEach(b=>b.onclick=()=>start(me(),b.dataset.cacman));
}
const _rct10=renderCombatTab;
renderCombatTab=function(){const out=_rct10.apply(this,arguments);try{sheetPanel()}catch(e){console.warn('[T10] ficha',e)}return out};
const sigNow=()=>JSON.stringify([activeCharacterId,TURN.key,inCombat(),data.reacao,data.statuses,TURN.actionUsed,data.combatExtra,data.vertentes]);
function refresh(){
  try{renderCombatUI()}catch(e){console.warn('[T10] painel',e)}
  try{if($('cacSheet')?.offsetParent){CAC.sig=sigNow();renderCombatTab()}}catch(e){console.warn('[T10] ficha',e)}
}

/* ---------- reações de ritual contam na mesma Reação ---------- */
const _cr10=castRitual;
castRitual=async function(id){
  const r=RITUALS.find(x=>x.id===id),react=r?.exec==='reação'&&inCombat()&&!!charById(activeCharacterId);
  if(react&&!E.reactionInfo(data,turnOf(me())).reactionAvailable){toast('Sua Reação desta rodada já foi usada.');return}
  const n=(data.ritualHistory||[]).length,out=await _cr10.apply(this,arguments);
  if(react&&(data.ritualHistory||[]).length>n){E.useReaction(data,turnOf(me()));save();refresh()}
  return out;
};

/* ---------- fim do combate ---------- */
const _end10=onCombatEnd;
onCombatEnd=function(){
  const out=_end10.apply(this,arguments);
  CAC.pend={};CAC.queue=[];CAC.offer='';
  chars3().filter(mine).forEach(c=>{const d=sheet(c);
    if(!(d.reacao||d.retalCounter||E.holding(d).length||E.grappledBy(d)))return;
    mutateChar(c,x=>{delete x.reacao;delete x.retalCounter;E.dropHold(x);x.statuses=(x.statuses||[]).filter(s=>!(s&&s.id==='agarrado'&&s.by))});
  });
  return out;
};

/* quem segura solta sozinho se cair, se o alvo escapar ou ficar longe; a aba da ficha acompanha o turno */
setInterval(()=>{
  try{
    if(camp3())chars3().filter(mine).forEach(ch=>{
      const d=sheet(ch),s=(d.statuses||[]).find(x=>x&&x.id==='segurando');if(!s)return;
      const f=E.computeMods(d).flags,out=E.isDying(d)||E.isDead(d)||f.has('semAgir');
      (s.alvos||[]).slice().forEach(a=>{
        const t=charById(a.id),old=Date.now()-(a.at||0)>8000;
        const why=out?'não consegue mais segurar':!t?'o alvo saiu da mesa':old&&!E.hasStatus(t.data,'agarrado')?'o alvo está livre':old&&inCombat()&&!MAP7.drag&&adjacent(ch.id,a.id,.8)===false?'o alvo ficou longe':'';
        if(why)release(ch,a.id,why);
      });
    });
    if($('cacSheet')?.offsetParent&&!$('modalWrap').classList.contains('open')){const s=sigNow();if(s!==CAC.sig){CAC.sig=s;renderCombatTab()}}
  }catch(e){console.warn('[T10] ciclo',e)}
},1500);
M6.hooks.leave.push(()=>{CAC.pend={};CAC.queue=[];CAC.offer=''});

Object.assign(T3,{cacBadge:badge,cacBind:bind,cacPanel:panel,cacMenu:menu,cacGuard:guard,cacStart:start,cacResolve:resolve,cacRelease:release,cacToggle:toggle,cacPush:pushOnMap,cacAdjacent:adjacent});
})();
