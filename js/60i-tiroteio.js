/* ===================================================================
   TULPA · ONDA 11 — Tiroteio Tático (camada de interface)
   - Seletor de contexto do tiro (detectado pelo mapa e ajustável),
     Mergulho (RF) com deslocamento, 2º Disparo, Fogo de Supressão,
     Tiro Livre, Mirar, barulho do disparo. As regras são do motor
     (js/10, E.*): aqui só se escolhe contexto e alvo.
   - Quem decide o quê (sem SQL novo, tudo por campaign_rolls):
       atk / def / res  ataque, resposta do alvo e resultado (js/13);
       dive             o alvo pede o novo lugar: o Mestre move o token
                        (deslocamento da regra, como o empurrão; a trava
                        de turno continua igual para todo mundo);
       sup / supres     rajada do atirador, teste do alvo;
       supx             o alvo saiu da cobertura ou se expôs: o aparelho
                        que abriu a supressão dá o Tiro Livre sozinho.
   =================================================================== */
(()=>{
const load=(k,d)=>{try{return JSON.parse(sessionStorage.getItem(k))||d}catch(e){return d}};
const TI={sup:{},sec:load('tulpa_t2s',{}),free:{},queue:[],busy:false};
T3.tiro=TI;
const saveSec=()=>{try{sessionStorage.setItem('tulpa_t2s',JSON.stringify(TI.sec))}catch(e){}};
const flag=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const setFlag=k=>{try{localStorage.setItem(k,'1')}catch(e){}};

const inCombat=()=>{const cm=camp3()?.combat;return!!(cm?.active&&cm.phase==='active')};
const sheet=ch=>ch?(ch.id===activeCharacterId?data:(ch.data||{})):{};
const who=id=>id===activeCharacterId?(charById(id)||{id,data,vocations,tracks}):charById(id);
const mine=ch=>!!ch&&controls(ch)&&(ch._sheetAvailable||ch.id===activeCharacterId);
const calc=(ch,skill,attr,opts)=>skillCalc3({data:sheet(ch),vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},skill,attr,opts);
const online=()=>!!(camp3()&&sb());
const modalOpen=()=>$('modalWrap').classList.contains('open');
const fm=m=>fmtM14(m);
const mapKey=()=>{try{return geoKey10()}catch(e){return''}};
const hostile=id=>{const c=M6.state?.ai?.[id];return!!(c&&c.h&&c.st!=='surr')};
const canAct=d=>{const f=E.computeMods(d).flags;return!(E.isDying(d)||E.isDead(d)||f.has('semAgir')||f.has('semAtacar'))};
const ammoOf=d=>E.ensureInv(d).items.find(i=>/muni[çc][ãa]o/i.test(i.name)&&i.loc!=='chao'&&(Number(i.qty)||0)>0);
/* posição real do token (a da tela ainda pode estar deslizando) */
const fresh=t=>{const l=MAP7.live[t.id];return l&&l.until>Date.now()?l:t};
const shotLine=(a,t,tp)=>shot14(a,t,tp||fresh(t),fresh(a));
/* o alvo enxerga quem atira? só vale para inimigo hostil (cone de visão da IA) */
function sees(a,t,tid){
  try{const f=T3.aiDbg,c=f.aiCfg22(M6.state.ai[tid]),R=(isGM6()&&T3.ai22.run[tid])||{x:t.x,y:t.y,a:t.a!=null?t.a:Math.PI/2};return!!f.sees22(t,c,R,a)}catch(e){return false}
}

/* ---------- contexto detectado: distância, cobertura, linha de visão, furtividade, Disparada ---------- */
function autoCtx(ch,tid,{surprise=false}={}){
  const tc=charById(tid),td=sheet(tc),cm=camp3()?.combat,a=tok14(ch.id),t=tok14(tid),map=!!(a&&t);
  let dist=null,cover='',pointBlank=false,blocked=false;
  if(map){
    const s=shotLine(a,t);dist=+s.dist.toFixed(2);cover=E.coverFromRays(s.rays);
    if(ethereal14(ch))cover='';
    if(cover==='total'){blocked=true;cover=''}
    pointBlank=T3.cacAdjacent(ch.id,tid)===true;
  }
  const aware=E.autoAware({inCombat:inCombat(),targetInCombat:!!(cm?.order||[]).some(o=>o.characterId===tid),
    surprised:surprise||!!td.combatSurprised,hostile:hostile(tid),sees:map&&hostile(tid)?sees(a,t,tid):false});
  return{ctx:{aware,pointBlank,short:pointBlank||(dist!=null&&dist<=E.SHOTGUN_RANGE),cover,sprint:E.isSprinting(td,E.turnCtx(cm,tid)),aimed:false,rangePenalty:false,dist,targetId:tid},map,blocked};
}
const cleanCtx=(c,extra)=>({aware:!!c.aware,pointBlank:!!c.pointBlank,short:!!c.short,cover:c.cover||'',sprint:!!c.sprint,aimed:!!c.aimed,rangePenalty:!!c.rangePenalty,dist:c.dist??null,targetId:c.targetId,...(c.free?{free:true}:{}),...(c.second?{second:true}:{}),...(c.from?{from:c.from}:{}),...extra});
/* chamado pelo performAttack: contexto final e efeitos da arma */
function shotPlan(ch,w,tid,shot){
  let ctx=shot||null;
  /* Confuso/Enlouquecido podem trocar o alvo depois do seletor */
  if(ctx&&ctx.targetId&&ctx.targetId!==tid)ctx={...autoCtx(ch,tid).ctx,rangePenalty:ctx.rangePenalty};
  return{ctx:ctx?cleanCtx(ctx,{targetId:tid}):null,fx:E.shotEffects(sheet(ch),w,ctx||{})};
}
const quickDraws=(d,i)=>!!(i?.w&&E.isGun(i.w)&&E.shotEffects(d,i.w).quickDraw);
/* o disparo faz barulho (os inimigos vão investigar); arco de especialista é silencioso */
function shotAfter(ch,w,detail){
  const t=tok14(ch.id);if(!t||!E.isGun(w))return;
  const rc=E.shotNoise(sheet(ch),w),hidden=detail.shot&&!detail.shot.aware;
  if(!rc){if(hidden)toast('🏹 Disparo silencioso: sua posição não foi revelada.');return}
  try{const [x,y]=tokCenter10(t);T3.ai23f.noiseAt23(x,y,{m:8,rc,src:hostile(ch.id)?'foe':'ally'});if(hidden)toast('🔊 O disparo fez barulho e revelou a sua posição.')}catch(e){console.warn('[T11] barulho',e)}
}
/* a arma como está agora no inventário (a margem de crítico guardada pode já ter a mira) */
function weaponFrom(ch,itemId,saved){
  const it=itemId&&E.ensureInv(sheet(ch)).items.find(i=>i.id===itemId);
  return it?.w?{peso:it.peso,...it.w,_itemId:it.id,_ammo:!!it.useAmmo}:saved?{...saved}:null;
}
function ready(ch,w){
  const d=sheet(ch);
  if(!canAct(d))return{ok:false,msg:'Neste estado você não pode atacar.'};
  if(w._ammo&&!ammoOf(d))return{ok:false,msg:'Sem munição! Adicione "Munição solta" no inventário para recarregar.'};
  const wa=E.weaponAllowed(d,w);if(!wa.ok)return wa;
  if(w._draw){const it=E.ensureInv(d).items.find(i=>i.id===w._itemId),v=it&&E.validPlacement(d,it,'maos');if(!v||!v.ok)return{ok:false,msg:'Libere as mãos antes: '+(v?v.msg:'item não encontrado.')}}
  return{ok:true};
}

/* ---------- seletor de contexto ---------- */
const covers=()=>[['','Sem cobertura'],['parcial','Parcial +'+E.COVER.parcial],['pesada','Pesada +'+E.COVER.pesada]];
function selector(ch,w,tid,o){
  const tc=charById(tid),det=autoCtx(ch,tid,{surprise:o.surprise}),ctx=det.ctx,d=sheet(ch);
  const onTurn=inCombat()&&TURN.actor===ch.id,mv=onTurn?mvState14(ch):{used:0,run:false};
  const base=E.shotEffects(d,w,{}),aim=E.canAim(d,w,{moved:mv.used,ran:mv.run});
  const seeDF=isGM6()||!tc.data?.hideStats||tc.ownerId===uid3();
  const opt=(type,name,val,label,on,off)=>`<label class="tiro-chip"><input type="${type}" name="${name}" value="${val}" ${on?'checked':''} ${off?'disabled':''}><span>${label}</span></label>`;
  const shotgun=base.spec.cls==='espingardas'&&base.spec.trained;
  openModal('TIRO TÁTICO',`${w.name} → ${nm(tc)}`,`<div class="tiro">
    <p class="sub">${det.map?`Detectado pelo mapa: <b>${fm(ctx.dist)} m</b>${det.blocked?' · <b>sem linha de visão</b>':''}. Ajuste se a mesa decidir diferente.`:'Sem os dois tokens no mapa: marque o contexto à mão.'}</p>
    <fieldset><legend>O alvo</legend><div class="tiro-row">${opt('radio','tAw','1','Ciente',ctx.aware)}${opt('radio','tAw','0','Desprevenido',!ctx.aware)}</div></fieldset>
    <fieldset><legend>Cobertura</legend><div class="tiro-row">${covers().map(([v,l])=>opt('radio','tCov',v,l,ctx.cover===v)).join('')}</div></fieldset>
    <fieldset><legend>Situação</legend><div class="tiro-row">${opt('checkbox','tPb','1',`Queima-Roupa ≤ ${fm(E.POINT_BLANK)} m`,ctx.pointBlank)}${opt('checkbox','tRun','1',`Em Disparada +${E.SPRINT_DF}`,ctx.sprint)}${opt('checkbox','tAim','1','Mirar (gasta o movimento)',false,!aim.ok)}${shotgun?opt('checkbox','tShort','1',`Alcance curto ≤ ${fm(E.SHOTGUN_RANGE)} m`,ctx.short):''}${opt('checkbox','tFar','1','Penalidade de médio/longo alcance −1d20',false)}</div>${!aim.ok&&base.canAim?`<p class="sub">${esc(aim.msg)}</p>`:''}</fieldset>
    <div class="notice tiro-sum" id="tiroSum" role="status" aria-live="polite"></div>
    <button type="button" class="btn tiro-sup" id="tiroSup">▥ Fogo de Supressão (1 Ação Padrão)</button><p class="sub" id="tiroSupWhy"></p></div>`,'Disparar',()=>{const c=read();closeModal();fire(ch,w,tid,o,c)});
  const val=n=>$q(`#modalBody input[name="${n}"]:checked`)?.value,on=n=>!!$q(`#modalBody input[name="${n}"]:checked`);
  function read(){
    const pb=on('tPb');
    return cleanCtx({targetId:tid,dist:ctx.dist,aware:val('tAw')==='1',cover:val('tCov')||'',pointBlank:pb,sprint:on('tRun'),aimed:on('tAim'),rangePenalty:on('tFar'),short:shotgun?on('tShort')||pb:pb||ctx.short});
  }
  function preview(){
    if(!$('tiroSum'))return;
    const c=read(),fx=E.shotEffects(sheet(ch),w,c),k=calc(ch,w.skill,undefined,fx.spec.calc||undefined),n=Math.max(1,k.n+fx.extraDice);
    const td=sheet(tc),df=E.shotDF(td,c),opts=c.aware?E.shotOptions(td,c,{turn:turnOf(tc),weapon:w}):null;
    const how=fx.spec.status==='generalista'?'fora da especialização (metade)':fx.spec.trained?fx.spec.name:fx.spec.status==='pendente'?'treino antigo (escolha a vertente)':'';
    const resp=!c.aware?'Desprevenido: tiro direto ATA × DF, sem Mergulho.':opts.direct?'O alvo não pode reagir agora: ATA × DF.':`O alvo pode ${[opts.dive.ok?`mergulhar (RF contra a Defesa Base ${E.DB})`:'',opts.dodge?'esquivar':'',opts.block?'bloquear':''].filter(Boolean).join(', ')} ou ficar firme (ATA × DF).`;
    $('tiroSum').innerHTML=`<div><b>Ataque</b> ${n}d20 ${sign(k.bonus)}${fx.disadv||k.dis?' · desvantagem':''} · crítico ${fx.critMin>=20?'20':fx.critMin+'–20'}${how?' · '+esc(how):''}</div>
      <div><b>Defesa do alvo</b> ${seeDF?`DF ${df.DF}${df.parts.length?` (${df.base}${df.parts.map(p=>` + ${p.v} ${p.label.toLowerCase()}`).join('')})`:''}`:'oculta pelo Mestre'}${df.ignored?' · a mira ignora a Cobertura Parcial':''}</div>
      <div>${resp}</div>${fx.notes.length?`<div class="sub">${fx.notes.map(esc).join(' · ')}</div>`:''}`;
    const s=E.canSuppress(sheet(ch),w,c),turnOk=onTurn&&actionsLeft(ch)>0;
    $('tiroSup').disabled=!s.ok||!turnOk||!!o.noSpend;
    $('tiroSupWhy').textContent=!inCombat()?'A supressão só vale em combate.':!turnOk?'A supressão gasta a Ação Padrão do seu turno.':s.ok?'Em vez de acertar: o alvo testa Resistência (Firmeza Mental) ou fica Suprimido.':s.msg;
  }
  $$('#modalBody input').forEach(i=>i.onchange=preview);
  $('tiroSup').onclick=()=>{const c=read();closeModal();suppress(ch,w,tid,c,det)};
  preview();
}
const $q=s=>document.querySelector(s);
async function fire(ch,w,tid,o,ctx){
  const ok=ready(ch,w);if(!ok.ok){toast(ok.msg);return}
  if(inCombat()&&!o.noSpend&&actionsLeft(ch)<=0){toast('Sua Ação Padrão não está mais disponível.');return}
  if(ctx.aimed){
    const mv=TURN.actor===ch.id&&inCombat()?mvState14(ch):{used:0,run:false},a=E.canAim(sheet(ch),w,{moved:mv.used,ran:mv.run});
    if(!a.ok){toast(a.msg);return}
    lockMove14(ch,{aim:true});
  }
  traceFx14(ch.id,tid,'shot',true);
  await performAttack(ch,w,[tid],{...o,extra:null,shot:ctx});
}
const _pa11=performAttack;
performAttack=async function(ch,w,ids,o={}){
  if(w&&E.isGun(w)&&!o.shot&&!o.retal&&ids?.length===1&&online()&&charById(ids[0])){
    if(!TI.skipSel){selector(ch,w,ids[0],o);return}
  }
  /* quem está Suprimido e ataca se expõe */
  if(ch&&!o.shot?.free)shotExpose(ch,'se expôs para atacar');
  return _pa11.call(this,ch,w,ids,o);
};

/* ---------- alvo: resposta ao tiro ---------- */
const _qp11=queuePrompt;
queuePrompt=function(aid,tid){
  const p=CB.pending[aid],sh=p?.dt?.shot,tc=sh&&who(tid);
  if(sh&&tc){
    const d=sheet(tc),turn=turnOf(tc),o=E.shotOptions(d,sh,{turn,nat20:p.dt.best===20,weapon:p.dt.weapon});
    const ritual=sh.aware&&!sh.second&&!sh.free&&E.reactionInfo(d,turn).reactionAvailable&&!!reactionsFor(tc,d).length;
    if(o.direct&&!ritual){doDefense(aid,tid,'tiro',!controls(tc));return}
  }
  return _qp11.apply(this,arguments);
};
const _dp11=defendPrompt;
defendPrompt=async function(aid,tid){
  const p=CB.pending[aid];if(!p?.dt?.shot)return _dp11.apply(this,arguments);
  const ch=who(tid),a=p.dt,sh=a.shot;if(!ch||p.targets[tid]?.def||p.targets[tid]?.res)return;
  const d=sheet(ch),turn=turnOf(ch),o=E.shotOptions(d,sh,{turn,nat20:a.best===20,weapon:a.weapon}),df=E.shotDF(d,sh),byMaster=!controls(ch);
  const react=sh.aware&&!sh.second&&!sh.free&&E.reactionInfo(d,turn).reactionAvailable?reactionsFor(ch,d):[];
  const rf=calc(ch,'Reflexo','Destreza');
  const blocks=o.block?E.blockStyles(d).map(s=>{const pl=E.blockPlan(d,s.id,turn),k=calc(ch,pl.skill,pl.attr);return{pl,n:Math.max(1,k.n+pl.extraDice),bonus:k.bonus}}):[];
  const tags=[sh.pointBlank?'Queima-roupa':'',sh.cover?(sh.cover==='pesada'?'Cobertura pesada':'Cobertura parcial'):'',sh.sprint?'Em Disparada':'',sh.aimed?'Atirador mirando':''].filter(Boolean);
  const body=`<div class="notice t3-alert"><b>${esc(a.attackerName)}</b> dispara contra <b>${esc(nm(ch))}</b> com <b>${esc(a.weapon.name)}</b>!</div>
    ${tags.length?`<div class="inline">${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
    <p class="sub">Defesa contra este tiro: <b>DF ${df.DF}</b>${df.parts.length?` (${df.base}${df.parts.map(p=>` + ${p.v} ${p.label.toLowerCase()}`).join('')})`:''}.${sh.pointBlank?'':' À distância não há Esquiva nem Bloqueio.'}</p>
    <div class="tiro-acts">
      ${o.dive.ok?`<button type="button" class="btn primary" id="tiroDive">🤸 Mergulhar · Reflexo ${rf.n}d20 ${sign(rf.bonus)} (gasta a Reação, até ${fm(E.DIVE_M)} m)</button>`:`<p class="sub">🤸 Mergulho indisponível: ${esc(o.dive.msg)}</p>`}
      ${o.dodge?'<button type="button" class="btn" id="tiroDodge">🎲 Esquiva (queima-roupa)</button>':''}
      ${blocks.map(b=>`<button type="button" class="btn" data-tblk="${b.pl.id}">🛡 ${esc(b.pl.label)} · ${b.n}d20 ${sign(b.bonus)} · reduz ${b.pl.reduction}</button>`).join('')}
    </div>
    <p class="sub">Mergulho: RF contra a Defesa Base ${E.DB}. Passando, nenhum dano. Falhando, você cai; se o ataque também chegou a 10, é Acerto Violento e vem um 2º Disparo.</p>
    ${react.length?`<div class="field"><label for="defReact">Reação ritual (opcional, no lugar do Mergulho)</label><select id="defReact"><option value="">Nenhuma</option>${react.map(x=>`<option value="${x.id}">${esc(x.name)} — ${x.cost} ES · ${esc(x.hint)}</option>`).join('')}</select></div>`:''}`;
  const rv=()=>$('defReact')?.value||'';
  const go=mode=>{const x=rv();closeModal();doDefense(aid,tid,mode,byMaster,mode.startsWith('block:')?'':x)};
  openModal('VOCÊ ESTÁ NA MIRA',nm(ch),body,`Ficar firme (ATA × DF ${df.DF})`,()=>go('tiro'));
  {const v=$('tiroDive'),e=$('tiroDodge');if(v)v.onclick=()=>go('mergulho');if(e)e.onclick=()=>go('esquiva');$$('#modalBody [data-tblk]').forEach(b=>b.onclick=()=>go('block:'+b.dataset.tblk))}
};

/* ---------- fila de janelas (espera a anterior fechar) ---------- */
function ask(key,fn){if(!TI.queue.some(q=>q.key===key))TI.queue.push({key,fn});setTimeout(pump,250)}
function pump(){
  if(!TI.queue.length)return;
  if(modalOpen()||CB.prompting||CB14.aim){clearTimeout(TI.pt);TI.pt=setTimeout(pump,800);return}
  const q=TI.queue.shift();try{q.fn()}catch(e){console.warn('[T11] janela',e)}
  if(TI.queue.length)setTimeout(pump,500);
}

/* ---------- Mergulho: para onde o alvo vai ---------- */
function diveStart(dt){
  const tc=who(dt.targetId);if(!tc||!mine(tc))return;
  if(tok14(tc.id)&&tok14(dt.attackerId)&&mapReady14(tc)&&canAct(sheet(tc))){
    toast(`🤸 Mergulho: escolha no mapa onde parar (até ${fm(E.DIVE_M)} m).`);
    startAim14({kind:'dive',ch:tc,m:E.DIVE_M,done:pt=>diveChoose(dt,pt)});
  }else diveChoose(dt,null);
}
function coverAt(attackerId,targetId,pt){
  const a=tok14(attackerId),t=tok14(targetId);if(!a||!t||!pt)return null;
  const g=mapCfg7(),s=t.s||1;
  return E.coverFromRays(shotLine(a,t,{x:(pt[0]-g.ox)/g.cell-s/2,y:(pt[1]-g.oy)/g.cell-s/2}).rays);
}
function diveChoose(dt,pt){
  const fell=dt.shot?.outcome==='mergulho'&&dt.shot.fellNew;
  if(!fell){if(pt)diveSend(dt,pt,false);return}
  ask('dive'+dt.aid,()=>{
    const tc=who(dt.targetId),t=tok14(dt.targetId);
    const cov=pt?coverAt(dt.attackerId,dt.targetId,pt):t?coverAt(dt.attackerId,dt.targetId,tokCenter10(t)):null;
    const info=cov===null?'Sem mapa: a mesa confirma se há abrigo.':cov?`O mapa vê ${cov==='total'?'cobertura total':'cobertura '+cov} nesse lugar.`:'O mapa não vê cobertura nesse lugar: o Mestre confere.';
    openModal('MERGULHO BEM-SUCEDIDO',nm(tc),`<p>Nenhum dano. Como você termina?</p><p class="sub">${info}</p><div class="tiro-acts"><button type="button" class="btn" id="tiroCover">🧱 Abrigado atrás de cobertura (de pé)</button></div>`,'Cair no chão (Caído)',()=>{closeModal();diveSend(dt,pt,false)});
    $('tiroCover').onclick=()=>{closeModal();diveSend(dt,pt,true)};
  });
}
function diveSend(dt,pt,sheltered){
  const tc=who(dt.targetId);if(!tc)return;
  if(sheltered)mutateChar(tc,x=>{x.statuses=(x.statuses||[]).filter(s=>E.statusId(s)!=='caido')});
  if(!online()||(!pt&&!sheltered))return;
  const text=`${nm(tc)} terminou o Mergulho ${sheltered?'abrigado, de pé':dt.shot?.fellNew?'no chão (Caído)':'de pé'}.`;
  insertRow(tc,'Mergulho',{detail:{cmb:'dive',aid:dt.aid,targetId:tc.id,to:pt,map:mapKey(),sheltered,text}}).catch(e=>fail3('mergulho',e));
}
/* só o aparelho do Mestre move o token: até 3 m em linha reta, parando em parede, borda ou outro token */
function diveMove(dt){
  if(!isGM6()||!dt.to||dt.map!==mapKey())return;
  const k='tulpa_dive_'+dt.aid;if(flag(k))return;setFlag(k);
  const t=tok14(dt.targetId);if(!t)return;
  const [cx,cy]=center11(t),dx=dt.to[0]-cx,dy=dt.to[1]-cy,len=Math.hypot(dx,dy),m=px2m14(len);
  if(!(m>.05))return;
  if(m>E.DIVE_M+.15){toast(`Mergulho recusado: ${fm(m)} m passa dos ${fm(E.DIVE_M)} m.`);return}
  const segments=blockers10().map(s=>({...s,edge:!s.id}));
  const circles=(M6.state.tokens||[]).filter(q=>{const c=charById(q.charId);return q.id!==t.id&&(!c||!isDeadCh(c))}).map(q=>{const [x,y]=center11(q);return{x,y,r:tokR10(q),id:q.charId}});
  const p=E.pushPath({x:cx,y:cy,dx,dy,dist:len,radius:tokR10(t),segments,circles,bounds:mapWorld7()});
  if(p.moved>.5)placeTok14(t,p.x,p.y,'push');
  floatTxt14(dt.targetId,'MERGULHO '+fm(px2m14(p.moved))+' m','#7fe3ff');cast6({t:'cbf',id:dt.targetId,txt:'MERGULHO','col':'#7fe3ff'});
}
const center11=t=>{const l=MAP7.live[t.id];return tokCenter10(t,l&&l.until>Date.now()?l:t)};

/* ---------- 2º Disparo (Acerto Violento) ---------- */
function secondOffer(dt){
  const att=who(dt.attackerId);if(!att||!mine(att)||flag('tulpa_t2_'+dt.aid))return;
  TI.sec[dt.aid]={aid:dt.aid,att:att.id,tid:dt.targetId,itemId:dt.shot.itemId,w:dt.shot.w,aimed:dt.shot.aimed,key:TURN.key,at:Date.now()};saveSec();
  secondAsk(dt.aid);
}
function secondAsk(aid){
  ask('t2'+aid,()=>{
    const s=TI.sec[aid];if(!s)return;const att=who(s.att),tc=charById(s.tid);if(!att||!tc)return secondDrop(aid);
    openModal('ACERTO VIOLENTO',`2º Disparo · ${nm(att)}`,`<p><b>${esc(nm(tc))}</b> caiu. Você ganhou <b>+1 Ação Padrão</b> para um 2º Disparo imediato: <b>ATA × DF</b>, sem Mergulho nem Esquiva (gasta munição).</p><div class="tiro-acts"><button type="button" class="btn" id="tiroNo">Abrir mão</button></div>`,'Disparar agora',()=>{closeModal();secondFire(aid)});
    $('tiroNo').onclick=()=>{closeModal();secondDrop(aid)};
  });
}
function secondDrop(aid){delete TI.sec[aid];saveSec();setFlag('tulpa_t2_'+aid);refresh()}
async function secondFire(aid){
  const s=TI.sec[aid];if(!s||flag('tulpa_t2_'+aid))return;
  const att=who(s.att),tc=charById(s.tid),w=att&&weaponFrom(att,s.itemId,s.w);
  if(!att||!tc||!w||isDeadCh(tc)){secondDrop(aid);return}
  const ok=ready(att,w);if(!ok.ok){toast(ok.msg);refresh();return}
  const c=autoCtx(att,s.tid).ctx;
  secondDrop(aid);
  traceFx14(att.id,s.tid,'shot',true);
  await performAttack(att,w,[s.tid],{noSpend:true,shot:cleanCtx(c,{second:true,aware:true,aimed:s.aimed,from:aid})});
}

/* ---------- Fogo de Supressão ---------- */
async function suppress(ch,w,tid,ctx,det){
  const tc=charById(tid);if(!tc||!inCombat())return;
  const chk=E.canSuppress(sheet(ch),w,ctx);if(!chk.ok){toast(chk.msg);return}
  if(TURN.actor!==ch.id||actionsLeft(ch)<=0){toast('A supressão gasta a Ação Padrão do seu turno.');return}
  const ok=ready(ch,w);if(!ok.ok){toast(ok.msg);return}
  shotExpose(ch,'se expôs para atirar');
  const d=sheet(ch),fx=E.shotEffects(d,w,{...ctx,suppress:true}),c=calc(ch,w.skill,undefined,fx.spec.calc||undefined);
  const r=E.rollTest(d,w.skill,c.SA,{mods:c.mods,bonus:c.bonus,disadv:c.dis,extraDice:fx.extraDice,consumeDelta:true});fx3('dice');
  spend(ch);lockMove14(ch);
  mutateChar(ch,x=>{consumeOnce(x,c,{attack:true});if(w._draw){const it=E.ensureInv(x).items.find(i=>i.id===w._itemId);if(it)it.loc='maos'}if(w._ammo){const am=ammoOf(x);if(am){if(fx.recover)E.registerRecovery(x,am);am.qty=(Number(am.qty)||1)-1;if(am.qty<=0)x.inventory.items=x.inventory.items.filter(i=>i!==am)}}});
  showRollPopup({eyebrow:'FOGO DE SUPRESSÃO',title:`${nm(ch)} · ${w.name}`,sub:'Alvo: '+nm(tc),sets:[{label:`${w.skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max',note:r.mode!=='normal'?r.mode:''}],big:r.total,detail:(fx.notes.map(esc).join(' · ')||'Aguardando a Resistência do alvo…')});
  traceFx14(ch.id,tid,'shot',true);shotAfter(ch,w,{shot:ctx});
  const t=tok14(tid),round=camp3().combat.round||1,turnIndex=camp3().combat.turnIndex||0,sid=rid();
  setFlag('tulpa_sup_'+sid); /* este aparelho dispara o Tiro Livre sozinho */
  const detail={cmb:'sup',sid,attackerId:ch.id,attackerName:nm(ch),targetId:tid,targetName:nm(tc),ATA:r.total,cover:ctx.cover,autoCover:!!(det.map&&det.ctx.cover),
    anchor:t?center11(t).map(v=>+v.toFixed(1)):null,map:mapKey(),itemId:w._itemId||'',w,round,turnIndex};
  try{await insertRow(ch,'Fogo de Supressão · '+w.name,{dice:r.dice,bonus:r.bonus,total:r.total,attribute:c.attr,detail})}catch(e){fail3('supressão',e)}
  refresh();
}
function resistAsk(sid){
  ask('sup'+sid,()=>{
    const p=TI.sup[sid];if(!p||p.done)return;const tc=who(p.dt.targetId);if(!tc)return;
    if(!canAct(sheet(tc))){resist(sid);return}
    const c=resistCalc(tc);
    openModal('FOGO DE SUPRESSÃO',nm(tc),`<div class="notice t3-alert"><b>${esc(p.dt.attackerName)}</b> varre a sua cobertura (${p.dt.ATA}).</div><p>Teste <b>Resistência [Presença] · Firmeza Mental</b>: ${c.n}d20 ${sign(c.bonus)}. Falhando, você fica <b>Suprimido</b>: sair ou se expor dá ao atirador um Tiro Livre. Não gasta a Reação.</p>`,'🎲 Resistir',()=>{closeModal();resist(sid)});
  });
}
const resistCalc=ch=>calc(ch,'Resistência','Presença',E.isCreature(sheet(ch))?undefined:{vert:'resistencia.firmeza'});
async function resist(sid,byMaster=false){
  const p=TI.sup[sid];if(!p||p.done||p.busy)return;const dt=p.dt,tc=who(dt.targetId);if(!tc)return;
  p.busy=true;markDefDone(sid,dt.targetId);
  try{
    const d=sheet(tc);let r=null;
    if(canAct(d)){const c=resistCalc(tc);r=E.rollTest(d,'Resistência',c.SA,{mods:c.mods,bonus:c.bonus,disadv:c.dis,consumeDelta:true});fx3('dice');mutateChar(tc,x=>consumeOnce(x,c))}
    const res=E.resolveSuppression({ATA:dt.ATA,resist:r?r.total:null});
    if(res.suppressed)mutateChar(tc,x=>E.applySuppressed(x,{sid,by:dt.attackerId,r:dt.round,i:dt.turnIndex,autoCover:dt.autoCover,anchor:dt.anchor,map:dt.map,itemId:dt.itemId,w:dt.w}));
    const text=`${dt.targetName} ${res.suppressed?'ficou Suprimido':'aguentou o fogo'} (Resistência ${r?r.total:'impossível'} contra ${dt.ATA} de ${dt.attackerName}).`;
    if(r)showRollPopup({eyebrow:'RESISTÊNCIA',title:`${nm(tc)} · Firmeza Mental`,sets:[{label:`Resistência ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max'}],big:res.suppressed?'SUPRIMIDO':'Resistiu',tone:res.suppressed?'hit':'ok'});
    await insertRow(tc,'Resistência à supressão'+(byMaster?' (pelo Mestre)':''),{dice:r?r.dice:[],bonus:r?r.bonus:0,total:r?r.total:0,attribute:'Presença',detail:{cmb:'supres',sid,attackerId:dt.attackerId,targetId:dt.targetId,suppressed:res.suppressed,text}});
  }catch(e){fail3('resistir à supressão',e)}
  finally{p.busy=false;refresh()}
}
/* o Suprimido saiu da cobertura ou se expôs: avisa quem atirou (uma vez só) */
function shotExpose(ch,why){
  const s=ch&&E.suppressionOf(sheet(ch));if(!s||!s.sid||!mine(ch))return false;
  mutateChar(ch,x=>E.clearSuppressed(x,s.sid));
  const text=`${nm(ch)} ${why}: ${nm(charById(s.by))} tem um Tiro Livre.`;
  toast(text);
  if(online())insertRow(ch,'Exposto ao fogo',{detail:{cmb:'supx',sid:s.sid,attackerId:s.by,targetId:ch.id,itemId:s.itemId,w:s.w,text}}).catch(e=>fail3('tiro livre',e));
  refresh();return true;
}
async function freeFire(sid){
  const dt=TI.free[sid];if(!dt||flag('tulpa_supf_'+sid))return;
  const att=who(dt.attackerId),tc=charById(dt.targetId),w=att&&weaponFrom(att,dt.itemId,dt.w);
  const drop=msg=>{delete TI.free[sid];setFlag('tulpa_supf_'+sid);if(msg)toast(msg);refresh()};
  if(!att||!tc||!w||isDeadCh(tc))return drop('');
  if(!mine(att))return;
  const ok=ready(att,w);if(!ok.ok)return drop('Sem Tiro Livre: '+ok.msg);
  const det=autoCtx(att,dt.targetId);
  if(det.map&&det.blocked)return drop('Sem Tiro Livre: o alvo saiu da linha de visão.');
  if(det.map&&det.ctx.dist>weaponRange14(w).m+.1)return drop('Sem Tiro Livre: o alvo está fora do alcance.');
  drop('');
  traceFx14(att.id,dt.targetId,'shot',true);
  /* exposto: a cobertura que ele deixou não conta */
  await performAttack(att,w,[dt.targetId],{noSpend:true,shot:cleanCtx(det.ctx,{free:true,aware:true,cover:''})});
}
/* quem controla o Suprimido vigia o token e a duração */
function watch(){
  if(!camp3())return;
  chars3().forEach(c=>{
    if(!mine(c))return;const s=E.suppressionOf(sheet(c));if(!s||!s.sid)return;
    const by=charById(s.by),end=!inCombat()||E.suppressionExpired(s,E.turnCtx(camp3().combat,s.by))||!by||isDeadCh(by)||isDyingCh(by);
    if(end){mutateChar(c,x=>E.clearSuppressed(x,s.sid));toast(nm(c)+' não está mais Suprimido.');refresh();return}
    const t=tok14(c.id);if(!t||!s.anchor||s.map!==mapKey()||MAP7.drag)return;
    const [x,y]=center11(t),moved=px2m14(Math.hypot(x-s.anchor[0],y-s.anchor[1]));
    if(moved<=E.EXPOSE_M)return;
    const a=tok14(s.by),cover=a?E.coverFromRays(shotLine(a,t).rays):'';
    if(E.exposes({moved,autoCover:s.autoCover,cover}))shotExpose(c,'saiu da cobertura');
    else if(cover&&cover!=='total')mutateChar(c,d=>{const q=E.suppressionOf(d);if(q)q.anchor=[+x.toFixed(1),+y.toFixed(1)]});
  });
  let dirty=false;
  Object.values(TI.sec).forEach(s=>{if(s.key!==TURN.key||Date.now()-s.at>600000){delete TI.sec[s.aid];dirty=true}});
  if(dirty){saveSec();refresh()}
}
setInterval(()=>{try{watch()}catch(e){console.warn('[T11] ciclo',e)}},700);

/* ---------- linhas do combate ---------- */
const logRow=(dt,row)=>{CB.log.unshift({kind:'log',text:dt.text,at:row.created_at});CB.log=CB.log.slice(0,30)};
function onRow(row,live){
  const dt=row.detail,at=Date.parse(row.created_at)||Date.now(),fresh=live&&Date.now()-at<120000;
  if(dt.cmb==='atk'&&dt.shot?.second&&dt.shot.from&&TI.sec[dt.shot.from]){delete TI.sec[dt.shot.from];saveSec();setFlag('tulpa_t2_'+dt.shot.from)}
  else if(dt.cmb==='res'&&dt.shot&&fresh){
    if(dt.shot.shot2)secondOffer(dt);
    if(dt.mode==='mergulho'&&['mergulho','recuperacao'].includes(dt.shot.outcome))setTimeout(()=>diveStart(dt),350);
    if(dt.push&&isGM6())setTimeout(()=>T3.cacPush?.({mid:'sg'+dt.aid,attackerId:dt.attackerId,targetId:dt.targetId,meters:dt.push.meters}),dt.mode==='mergulho'?1500:450);
  }else if(dt.cmb==='sup'&&dt.sid&&!TI.sup[dt.sid]){
    TI.sup[dt.sid]={dt,t:at,done:false};
    if(fresh){toast(`▥ ${dt.attackerName} abriu Fogo de Supressão contra ${dt.targetName}.`);if(mine(who(dt.targetId))&&!defDone(dt.sid,dt.targetId))resistAsk(dt.sid)}
  }else if(dt.cmb==='supres'){
    const p=TI.sup[dt.sid]||(TI.sup[dt.sid]={dt,t:at});if(p.done)return;p.done=true;logRow(dt,row);
    if(fresh){toast(dt.text);floatTxt14(dt.targetId,dt.suppressed?'SUPRIMIDO!':'RESISTIU!','#ffd36b')}
  }else if(dt.cmb==='supx'){
    logRow(dt,row);
    if(!fresh||flag('tulpa_supf_'+dt.sid))return;
    const att=who(dt.attackerId);if(!att||!mine(att))return;
    TI.free[dt.sid]={...dt,at};
    if(flag('tulpa_sup_'+dt.sid))setTimeout(()=>freeFire(dt.sid),400);
    else toast(`${nm(att)} tem um Tiro Livre: use o painel de combate.`);
  }else if(dt.cmb==='dive'){logRow(dt,row);if(fresh)diveMove(dt)}
  else if(dt.cmb==='mark')clearAll();
}
function clearAll(){TI.sup={};TI.sec={};TI.free={};TI.queue=[];saveSec()}
const _pr11=processRow;
processRow=function(row,live=true){
  const dt=row&&row.detail,seen=!!(row&&CB.seen.has(row.id));
  const out=_pr11.apply(this,arguments);
  if(dt?.cmb&&!seen){try{onRow(row,live);if(['sup','supres','supx','dive'].includes(dt.cmb))renderCombatUI()}catch(e){console.warn('[T11] linha',e)}}
  return out;
};
/* a vez não passa sozinha enquanto há 2º Disparo ou supressão minha em aberto */
const _pm11=pendingMine14;
pendingMine14=function(ch){return _pm11.apply(this,arguments)||Object.values(TI.sec).some(s=>s.att===ch.id)||Object.values(TI.sup).some(p=>!p.done&&p.dt.attackerId===ch.id&&Date.now()-p.t<120000)};

/* ---------- painel de combate ---------- */
const btn=(attr,val,label,primary)=>`<button type="button" class="btn small${primary?' primary':''}" ${attr}="${val}">${label}</button>`;
function panel(){
  let h='';
  Object.values(TI.sec).forEach(s=>{const att=who(s.att);if(!att||!mine(att))return;h+=`<div class="t3-pend">⚔ <b>${esc(nm(att))}</b>: 2º Disparo contra <b>${esc(nm(charById(s.tid)))}</b> ${btn('data-t2',s.aid,'Disparar',true)}${btn('data-t2no',s.aid,'Abrir mão')}</div>`});
  Object.entries(TI.sup).filter(([,p])=>!p.done&&Date.now()-p.t<900000).forEach(([sid,p])=>{
    const tc=charById(p.dt.targetId),can=mine(tc),gm=!can&&isGM6()&&tc?._sheetAvailable;
    h+=`<div class="t3-pend">▥ <b>${esc(p.dt.attackerName)}</b> suprime <b>${esc(p.dt.targetName)}</b> (${p.dt.ATA}): aguardando a Resistência ${can?btn('data-tsr',sid,'Resistir',true):''}${gm?`<button type="button" class="btn small" data-tsr="${sid}" data-gm="1">Rolar por ${esc(p.dt.targetName)}</button>`:''}</div>`;
  });
  chars3().filter(inScene).forEach(c=>{
    const own=mine(c),d=sheet(c),s=E.suppressionOf(d),sup=!!s||E.hasStatus(d,'suprimido');if(!sup||!(own||(isGM6()&&c._sheetAvailable)))return;
    h+=`<div class="notice t3-alert">▥ <b>${esc(nm(c))}</b> está <b>Suprimido</b>${s?.by?' por '+esc(nm(charById(s.by))):''}: sair da cobertura ou se expor dá um Tiro Livre. ${s?.sid?btn(own?'data-texp':'data-tgm',c.id,own?'Expor-se / sair da cobertura':'Declarar exposição'):''}</div>`;
  });
  Object.entries(TI.free).filter(([sid,f])=>!flag('tulpa_supf_'+sid)&&Date.now()-f.at<300000).forEach(([sid,f])=>{h+=`<div class="t3-pend">🎯 Tiro Livre de <b>${esc(nm(charById(f.attackerId)))}</b> contra <b>${esc(nm(charById(f.targetId)))}</b> ${btn('data-tfree',sid,'Disparar',true)}</div>`});
  return h;
}
/* o Mestre declara a exposição de um personagem que não controla (ex.: narração sem mapa) */
function gmExpose(c){
  const s=c&&E.suppressionOf(c.data||{});if(!isGM6()||!s?.sid)return;
  mutateChar(c,x=>E.clearSuppressed(x,s.sid));
  if(online())insertRow(c,'Exposto ao fogo',{detail:{cmb:'supx',sid:s.sid,attackerId:s.by,targetId:c.id,itemId:s.itemId,w:s.w,text:`${nm(c)} se expôs (Mestre): ${nm(charById(s.by))} tem um Tiro Livre.`}}).catch(e=>fail3('tiro livre',e));
  refresh();
}
function bind(root){
  if(!root)return;
  const on=(sel,fn)=>$$(sel,root).forEach(b=>b.onclick=()=>fn(b));
  on('[data-t2]',b=>secondFire(b.dataset.t2));on('[data-t2no]',b=>secondDrop(b.dataset.t2no));
  on('[data-tsr]',b=>resist(b.dataset.tsr,!!b.dataset.gm));on('[data-tfree]',b=>freeFire(b.dataset.tfree));
  on('[data-texp]',b=>shotExpose(who(b.dataset.texp),'saiu da cobertura'));on('[data-tgm]',b=>gmExpose(charById(b.dataset.tgm)));
}
const _cp11=T3.cacPanel;T3.cacPanel=function(list){return(_cp11?_cp11(list):'')+panel()};
const _cb11=T3.cacBind;T3.cacBind=function(root){_cb11?.(root);bind(root)};

/* ---------- aba Combate & Defesa da ficha ---------- */
function sheetPanel(){
  const box=$('combatTabBody');if(!box)return;
  box.querySelector('#tiroSheet')?.remove();
  const d=data,ch=charById(activeCharacterId)||{id:activeCharacterId,data,vocations,tracks};
  const guns=E.ensureInv(d).items.filter(i=>i.w&&E.isGun(i.w)&&i.loc!=='chao');
  const rows=guns.map(i=>{
    const fx=E.shotEffects(d,i.w),k=calc(ch,i.w.skill,undefined,fx.spec.calc||undefined),pb=E.shotEffects(d,i.w,{pointBlank:true});
    const tags=[fx.spec.trained?fx.spec.name:fx.spec.status==='generalista'?'Fora da especialização: metade':fx.spec.status==='pendente'?'Escolha a vertente':'',fx.quickDraw?'Saca e dispara':'',fx.canAim?'Pode mirar':'',fx.silent?'Silencioso':'',fx.recover?'Recupera munição':'',E.isBallistic(i.w)?'Crítico faz sangrar':'',pb.disadv?'Queima-roupa: desvantagem':'',pb.flat?`Queima-roupa: +${pb.flat} de dano`:''].filter(Boolean);
    return`<div class="t3-item"><div class="grow"><b>${esc(i.name)}</b><div class="inline"><span class="tag">${Math.max(1,k.n)}d20 ${sign(k.bonus)} (${esc(k.attr)})</span><span class="tag">dano ${esc(i.w.dado)}</span>${tags.map(t=>`<span class="tag t3-chip-good">${esc(t)}</span>`).join('')}</div></div></div>`;
  }).join('');
  const rf=calc(ch,'Reflexo','Destreza'),el=document.createElement('div');el.className='panel';el.id='tiroSheet';
  el.innerHTML=`<div class="panel-head"><h2>Tiroteio</h2><span class="pill">Mergulho ${rf.n}d20 ${sign(rf.bonus)}</span></div>
  ${rows||'<p class="sub">Nenhuma arma de disparo no inventário.</p>'}
  <details><summary>Como o tiro é resolvido</summary><div class="t3-table"><div><b>20 natural</b><span>Crítico garantido: o Mergulho não adianta.</span></div><div><b>Erro e recuperação</b><span>ATA &lt; ${E.DB} e Mergulho ≥ ${E.DB}: sem dano, de pé.</span></div><div><b>Mergulho</b><span>ATA ≥ ${E.DB} e Mergulho ≥ ${E.DB}: sem dano, Caído ou abrigado.</span></div><div><b>Acerto violento</b><span>ATA ≥ ${E.DB} e Mergulho &lt; ${E.DB}: acerta, o alvo cai e há um 2º Disparo (ATA × DF).</span></div><div><b>Erro e queda</b><span>ATA &lt; ${E.DB} e Mergulho &lt; ${E.DB}: sem dano, Caído.</span></div><div><b>Sem Mergulho</b><span>Desprevenido, sem Reação ou ficando firme: ATA ≥ DF acerta. Cobertura +${E.COVER.parcial} ou +${E.COVER.pesada}, Disparada +${E.SPRINT_DF}, Caído +${E.PRONE_DF}.</span></div></div></details>`;
  box.insertBefore(el,box.querySelector('#cacSheet')?.nextSibling||box.children[1]||null);
}
const _rct11=renderCombatTab;
renderCombatTab=function(){const out=_rct11.apply(this,arguments);try{sheetPanel()}catch(e){console.warn('[T11] ficha',e)}return out};
function refresh(){try{renderCombatUI()}catch(e){console.warn('[T11] painel',e)}}

/* ---------- fim do combate ---------- */
const _end11=onCombatEnd;
onCombatEnd=function(){
  const out=_end11.apply(this,arguments);
  clearAll();
  try{Object.keys(sessionStorage).filter(k=>k.startsWith('tulpa_mv_')).forEach(k=>sessionStorage.setItem(k,'null'))}catch(e){}
  CB14.mv={key:'',cid:'',used:0,run:false};CB14.atkKey='';
  chars3().filter(mine).forEach(c=>{const d=sheet(c);
    if(!(d.disparada||(d.statuses||[]).some(s=>s&&((s.id==='suprimido'&&s.sid)||s.tick))))return;
    mutateChar(c,x=>{delete x.disparada;x.statuses=(x.statuses||[]).filter(s=>!(s&&s.id==='suprimido'&&s.sid));x.statuses.forEach(s=>{if(s)delete s.tick})});
  });
  return out;
};
M6.hooks.leave.push(clearAll);

Object.assign(T3,{shotPlan,shotAfter,quickDraws,shotExpose,shotAuto:autoCtx,shotSelector:selector,shotSuppress:suppress,shotResist:resist,shotSecond:secondFire,shotFree:freeFire,shotDiveMove:diveMove,shotWatch:watch});
})();
