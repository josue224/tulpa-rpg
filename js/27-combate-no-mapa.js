/* ===================================================================
   TULPA · ETAPA 15 — combate dentro do mapa tático
   - Iniciar combate rola o Reflexo de todos com o olho ligado e monta a
     ordem na hora (o aparelho do Mestre rola; todos veem os dados).
   - Token da vez com anel luminoso e etiqueta flutuante; barra da ordem.
   - Economia de ações: 9 m de movimento, Ação Padrão (+1 no Acerto
     Violento), ações livres (talento, saque rápido, combustão, descarte,
     lanterna/porta) e reação (retaliação e rituais de reação).
   - Mira clicando no token: alcance, linha de visão pelas paredes e
     cobertura parcial (+2 na defesa).
   - Arremesso e área: modelo no cursor, DT pela distância, desvio na
     falha, dano em todos na área (Resistência reduz à metade).
   - Rastro do golpe, números flutuantes, empurrão e teleporte.
   As regras (Tabela de Defesa, críticos, estados, proficiência...) são
   as mesmas de antes: este módulo só escolhe alvos e chama o motor.
   =================================================================== */
const CB14={mini:(()=>{try{return localStorage.getItem('tulpa_cb_mini')==='1'}catch(e){return false}})(),mv:{key:'',cid:'',used:0,run:false},quick:'',aim:null,fx:[],hover:null,remote:{},denyAt:0,lastPick:[],hudSig:'',barSig:'',mvCast:0};
T3.cb14=CB14;
const MOVE14=9;                       /* metros por turno */
const STOP14=['agarrado','paralisado','congelado','amarrado','agonia','morto'];
const COVER14=2;                      /* cobertura parcial: +2 na defesa */
const AREA_TALENT_M14=6;              /* raio padrão de habilidades em área */

const d14=ch=>ch?(ch.id===activeCharacterId?data:(ch.data||{})):{};
const inCb14=()=>{const cm=camp3()?.combat;return!!(cm?.active&&cm.phase==='active')};
/* durante uma retaliação, quem tem a ação extra usa o mesmo painel (mover, talentos, itens…) sem tomar a vez de ninguém */
const cur14=()=>{if(CB14.rActor&&retalOn14()){const rc=charById(CB14.rActor);if(rc)return rc}const e=curEntry();return e?charById(e.characterId):null};
const tok14=id=>(M6.state.tokens||[]).find(t=>t.charId===id)||null;
const mpc14=()=>mapCfg7().mpc;
const m2px14=m=>m/mpc14()*mapCfg7().cell;
const px2m14=px=>px/mapCfg7().cell*mpc14();
const fmtM14=m=>(Math.round(Math.max(0,m)*10)/10).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
const clamp14=(v,a,b)=>Math.max(a,Math.min(b,v));
function mapOn14(){if(!MAP7.cv||!MAP7.cv.isConnected||!MAP7.stage)return false;const r=MAP7.stage.getBoundingClientRect();return r.height>60&&r.width>60}
const mapReady14=ch=>!!(ch&&mapOn14()&&tok14(ch.id));
function deny14(msg){const n=Date.now();if(n-CB14.denyAt>2500){CB14.denyAt=n;toast(msg)}}
const myTurn14=()=>{const c=cur14();return!!(c&&controls(c)&&(c._sheetAvailable||c.id===activeCharacterId))};

/* ===================== 1. iniciativa automática ===================== */
function reflex14(ch){
  const d=d14(ch);
  if(d&&d.attributes&&Object.keys(d.attributes).length){
    const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},'Reflexo');
    const r=E.rollTest(d,'Reflexo',SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis});
    return{dice:r.dice,bonus:r.bonus,total:r.total,best:r.best};
  }
  /* ficha não carregada neste aparelho: usa o Reflexo que a própria ficha deixou calculado */
  const cc=d?.combatCache||{},n=clamp14(Number(cc.reflexDice)||1,1,8),b=Number(cc.reflexBonus)||0,dice=Array.from({length:n},()=>E.die(20)),best=Math.max(...dice);
  return{dice,bonus:b,total:best+b,best};
}
async function beginCombat14(){
  if(role3()!=='master'){toast('Somente o Mestre pode iniciar o combate.');return}
  const c=camp3();if(!c)return;
  const list=(c.characters||[]).filter(ch=>ch.inScene!==false&&!isDeadCh(ch));
  if(!list.length){toast('Ligue o olho (na cena) de pelo menos um personagem.');return}
  const rolls=list.map(ch=>({id:ch.id,name:nm(ch),...reflex14(ch)})).sort((a,b)=>b.total-a.total||b.best-a.best||a.name.localeCompare(b.name,'pt-BR'));
  try{
    try{await sb()?.from('campaign_reflex_rolls').delete().eq('campaign_id',c.id)}catch(e){}
    await window.tulpaSaveCombatState({active:true,phase:'active',round:1,turnIndex:0,participants:rolls.map(r=>({characterId:r.id,name:r.name,rolled:true})),order:rolls.map(r=>({characterId:r.id,name:r.name,done:false}))});
  }catch(e){fail3('iniciar combate',e);return}
  try{fx5('start')}catch(e){}
  CB.pending={};CB.log=[];
  const first=charById(rolls[0].id);
  /* a linha "Iniciativa" mostra o resumo para todos; as outras guardam os dados de cada um no histórico */
  insertRow(first,'Iniciativa',{dice:[],bonus:0,total:rolls[0].total,detail:{cmb:'init',rolls:rolls.map(r=>({id:r.id,name:r.name,dice:r.dice,total:r.total}))}}).catch(e=>fail3('iniciativa',e));
  rolls.forEach(r=>{const ch=charById(r.id);if(ch)insertRow(ch,'Iniciativa · Reflexo',{dice:r.dice,bonus:r.bonus,total:r.total,attribute:'Destreza',detail:{cmb:'rollx',sides:20,eyebrow:'INICIATIVA',quiet:true}}).catch(()=>{})});
  initPanel14(rolls);
  setTimeout(()=>{try{renderTable()}catch(e){}hud14(true)},200);
}
function initPanel14(rolls){
  openModal('INICIATIVA','Ordem de combate',`<p class="sub">O Reflexo de todos que estão na cena foi rolado agora. A ordem já vale: a vez é de <b>${esc(rolls[0].name)}</b>.</p><ol class="cb-init">${rolls.map((r,i)=>`<li class="${i===0?'on':''}"><span class="cb-i">${i+1}</span><b>${esc(r.name)}</b><span class="cb-dice">${r.dice.map(x=>`<i class="${x===r.best?'hi':''}">${x}</i>`).join('')}${r.bonus?` <em>${r.bonus>0?'+':''}${r.bonus}</em>`:''}</span><strong>${r.total}</strong></li>`).join('')}</ol>`,'Fechar',()=>closeModal());
}
window.tulpaBeginCombat=beginCombat14;
T3.beginCombat=beginCombat14;

/* ===================== 2. movimento por turno ===================== */
function mvInfo14(ch){
  const d=d14(ch),st=stIds(d),m=E.computeMods(d);
  const stop=STOP14.find(s=>st.includes(s));
  if(stop)return{max:0,base:0,why:(STATUS_BY_ID[stop]?.name||stop),canRun:false};
  if(m.flags.has('semMover'))return{max:0,base:0,why:'um estado impede você de se mover',canRun:false};
  const ci=E.cargaInfo(d,E.hasEffect(d,'Força do Cotidiano'));
  if(ci.level>=3)return{max:0,base:0,why:'Imobilizado pela carga',canRun:false};
  let base=(typeof T3.moveBase==='function'?Number(T3.moveBase())||MOVE14:MOVE14);const why=[];
  const fx=d.activeEffects||[];
  if(E.hasEffect(d,'Gigante Invulnerável')||fx.some(e=>/desloc\w*\s+dobrad|velocidade\s+dobrad|acelera[çc][ãa]o/i.test(e.desc||''))){base*=2;why.push('deslocamento dobrado')}
  if(fx.some(e=>/n[ée]voa da alma/i.test(e.name||'')&&String(e.source||'').startsWith('ext:'))){base/=2;why.push('Névoa da Alma')}
  const canRun=!st.includes('exausto')&&!st.includes('exaurido')&&ci.level<2&&!m.flags.has('semCorrer');
  const mv=mvState14(ch);let max=base*(mv.run?2:1);
  /* depois de atacar, o movimento que sobrou trava (o Acerto Violento dá ação, não movimento) */
  if(CB14.atkKey&&CB14.atkKey===TURN.key&&TURN.actor===ch.id&&mv.used<max){max=mv.used;why.push('você já atacou neste turno')}
  return{max,base,why:why.join(', '),canRun,over:ci.level,locked:CB14.atkKey===TURN.key&&TURN.actor===ch.id};
}
function mvState14(ch){
  const k=TURN.key||'';
  if(CB14.mv.key!==k||CB14.mv.cid!==ch.id){
    let s=null;try{s=JSON.parse(sessionStorage.getItem('tulpa_mv_'+k)||'null')}catch(e){}
    CB14.mv={key:k,cid:ch.id,used:s&&s.cid===ch.id?Number(s.used)||0:0,run:!!(s&&s.cid===ch.id&&s.run)};
  }
  return CB14.mv;
}
function mvSave14(force){
  const mv=CB14.mv;try{sessionStorage.setItem('tulpa_mv_'+mv.key,JSON.stringify(mv))}catch(e){}
  const send=()=>{CB14.mvCast=Date.now();const ch=charById(mv.cid);cast6({t:'cbmv',key:mv.key,cid:mv.cid,used:+mv.used.toFixed(2),max:ch?mvInfo14(ch).max:MOVE14})};
  clearTimeout(CB14.mvT);if(force||Date.now()-CB14.mvCast>250)send();else CB14.mvT=setTimeout(send,300);
  hud14();
}
function rough14(wx,wy){return geo10().rooms.some(r=>r.rough&&inPoly10(wx,wy,r.pts))}
/* chamado pelo mapa a cada passo (teclado/analógico/arrasto): corta o passo no que resta */
T3.cbMove=(t,cx,cy,nx,ny,how)=>{
  if(!inCb14())return[nx,ny];
  const ch=charById(t.charId),cur=cur14();if(!ch)return[nx,ny];
  if(!cur||cur.id!==ch.id){if(isGM6())return[nx,ny];deny14('Não é a sua vez: espere o seu turno para andar.');return[cx,cy]}
  if(!controls(ch))return[nx,ny];                 /* o Mestre reposicionando o token de um jogador */
  const info=mvInfo14(ch),mv=mvState14(ch),left=info.max-mv.used;
  if(left<=1e-3){deny14(info.max?`Sem movimento: os ${fmtM14(info.max)} m deste turno acabaram.`:`Você não pode se mover agora: ${info.why}.`);return[cx,cy]}
  const k=rough14(nx,ny)||rough14(cx,cy)?2:1,cost=px2m14(hyp10(nx-cx,ny-cy))*k;
  if(cost<=left)mv.used+=cost;
  else{const f=left/cost;nx=cx+(nx-cx)*f;ny=cy+(ny-cy)*f;mv.used=info.max}
  mvSave14();return[nx,ny];
};
/* na sua vez o token não "pula" para a grade ao soltar (o encaixe gastaria metros a mais) */
T3.cbNoSnap=t=>inCb14()&&cur14()?.id===t.charId;

/* ===================== 3. alcance, linha de visão e cobertura ===================== */
const RANGE14=[[/rifle|fuzil|sniper|carabina|precis/i,90],[/escopeta|espingarda/i,15],[/pistola|rev[óo]lver/i,24],[/submetralh|uzi|smg/i,30],[/metralhadora/i,60],[/arco longo/i,45],[/arco|besta/i,30],[/estilingue|zarabatana/i,15],[/taser|choque/i,6],[/lan[çc]a-granadas/i,60],[/bazuca/i,90],[/arp[ãa]o/i,12]];
function weaponRange14(w){
  if(w.cat==='Corpo a corpo'||w.skill==='Briga')return{melee:true,m:2.2};
  for(const [re,m] of RANGE14)if(re.test(w.name||''))return{melee:false,m};
  if(w.skill==='Arremesso')return{melee:false,m:/granada|molotov|bomba|mina/i.test(w.name||'')?24:12};
  return{melee:false,m:30};
}
const aoe14=w=>!!(w&&(w.area||/molotov|granada|bomba|mina terrestre/i.test(w.name||'')));
const aoeR14=w=>/bazuca/i.test(w.name||'')?4.5:/mina/i.test(w.name||'')?3:3;
function los14(ax,ay,bx,by){const d=hyp10(bx-ax,by-ay);if(d<1)return true;return castRay10(ax,ay,(bx-ax)/d,(by-ay)/d,blockers10(),d)>=d-2}
/* três raios (centro e as bordas do alvo): todos livres = limpo; alguns = cobertura parcial; nenhum = sem linha de visão */
function shot14(a,t){
  const [ax,ay]=tokCenter10(a),[bx,by]=tokCenter10(t),d=hyp10(bx-ax,by-ay)||1,ux=(bx-ax)/d,uy=(by-ay)/d,off=tokR10(t)*.85;
  const rays=[los14(ax,ay,bx,by),los14(ax,ay,bx-uy*off,by+ux*off),los14(ax,ay,bx+uy*off,by-ux*off)],n=rays.filter(Boolean).length;
  return{dist:px2m14(d),vis:n>0,cover:n>0&&n<3,ax,ay,bx,by};
}
const ethereal14=ch=>E.hasEffect(d14(ch),'Disparo Etéreo');
function evalAtk14(a,t){
  const at=tok14(a.ch.id);if(!at)return{ok:false,why:'Seu token não está no mapa.'};
  const tc=charById(t.charId);if(!tc)return{ok:false,why:'Token sem personagem.'};
  if(tc.id===a.ch.id)return{ok:false,why:'Escolha outro token.'};
  if(isDeadCh(tc))return{ok:false,why:nm(tc)+' já está morto.'};
  const s=shot14(at,t),reach=a.range+(((at.s||1)+(t.s||1))/2-1)*mpc14();
  if(a.melee&&s.dist>reach+.01)return{ok:false,why:`Fora de alcance: corpo a corpo só em quem está ao lado (${fmtM14(s.dist)} m).`,s};
  if(!a.melee&&s.dist>reach+.01)return{ok:false,why:`Fora de alcance: ${fmtM14(s.dist)} m (alcance ${fmtM14(a.range)} m).`,s};
  const eth=!a.melee&&ethereal14(a.ch);
  if(!s.vis&&!eth)return{ok:false,why:'Sem linha de visão: tem uma parede no caminho.',s};
  const cover=s.cover&&!eth&&!a.melee;
  return{ok:true,cover,s,why:cover?'Cobertura parcial: +'+COVER14+' na defesa do alvo':eth&&!s.vis?'Disparo Etéreo: atravessa a cobertura':''};
}

/* ===================== 4. ataque escolhendo o alvo no mapa ===================== */
const _perf14=performAttack;
performAttack=async function(ch,w,ids,o={}){if(ch&&TURN.actor===ch.id&&!o.retal)CB14.atkKey=TURN.key;if(o&&o.retal){CB14.retal=null;cast6({t:'cbretal',cid:ch.id,done:1})}return _perf14.apply(this,arguments)};
const _startAttack14=startAttack;
startAttack=async function(ch,{retal=false,areaOnly=false}={}){
  if(!mapReady14(ch))return _startAttack14(ch,{retal});
  const d=d14(ch),m=E.computeMods(d);
  if(m.flags.has('semAgir')||m.flags.has('semAtacar')){toast('Neste estado você não pode atacar.');return}
  if(retal){if(retalOf(ch)<=0){toast('Você não tem ação de retaliação.');return}}
  else if(actionsLeft(ch)<=0){toast('Você já usou sua Ação Padrão neste turno.');return}
  let quick=E.quickWeapons(d);const pack=areaOnly||retal?[]:E.packWeapons(d);
  if(areaOnly)quick=quick.filter(i=>aoe14(i.w));
  const card=(w,id,tag)=>{const rg=weaponRange14(w);return`<button class="t3-weapon" data-w="${id}"><b>${esc(w.name)}${d.favWeaponId&&d.favWeaponId===id?' ★':''}</b><span>${esc(w.skill)} · dano <b>${esc(w.dado)}</b> · crítico ${w.critMin>=20?'20':w.critMin+'-20'} · ${aoe14(w)?`💣 área ${fmtM14(aoeR14(w))} m, até ${rg.m} m`:rg.melee?'corpo a corpo':'alcance '+rg.m+' m'}</span><span class="sub">${(w.effects||[]).map(e=>(STATUS_BY_ID[e.status]?.name||e.status)+' ('+(e.when==='crit'?'no crítico':'no acerto')+')').join(' · ')||'sem estado'}${tag?' · '+tag:''}</span></button>`};
  if(areaOnly&&!quick.length){toast('Nenhuma granada, bomba ou arma em área nas mãos, cintura ou bandoleira.');return}
  openModal(areaOnly?'ARREMESSAR':'ATACAR',nm(ch),`<p class="sub">${areaOnly?'Escolha o explosivo. Depois mire no mapa: a DT do Arremesso sobe com a distância.':'Escolha a arma. Depois clique no alvo direto no mapa.'}</p><div class="t3-weapons">${quick.map(i=>card(i.w,i.id,LOCS[i.loc])).join('')}${areaOnly?'':card(UNARMED,'__soco','1d2 · Briga')}</div>${pack.length?`<h4 style="margin-top:12px">Sacar da mochila (gasta a Ação Padrão)</h4><div class="t3-weapons">${pack.map(i=>`<button class="t3-weapon" data-draw="${i.id}"><b>${esc(i.name)}</b><span>${esc(i.w.skill)} · ${esc(i.w.dado)} · crít. ${i.w.critMin>=20?'20':i.w.critMin+'-20'}</span><span class="sub">${LOCS[i.loc]} → mãos</span></button>`).join('')}</div>`:''}${retal?'<div class="notice t3-alert">Contra-ataque de Retaliação: <b>não pode ser esquivado</b>.</div>':''}<label class="t3-check" style="margin-top:10px;${retal||areaOnly?'display:none':''}"><input type="checkbox" id="atkSurprise"> Ataque de surpresa (o alvo está desprevenido e só pode rolar Reflexo)</label>`,'Fechar',closeModal);
  $$('[data-w]').forEach(b=>b.onclick=()=>{
    const surprise=!!$('atkSurprise')?.checked,id=b.dataset.w,it0=quick.find(i=>i.id===id);
    const w=id==='__soco'?UNARMED:(it0?{...it0.w,_itemId:it0.id,_ammo:!!it0.useAmmo}:null);closeModal();_modalResolve=null;if(!w)return;
    const rg=weaponRange14(w);
    if(aoe14(w))startAim14({kind:'aoe',ch,w,max:rg.m,r:aoeR14(w)});
    else startAim14({kind:'atk',ch,w,range:rg.m,melee:rg.melee,surprise,retal,prefer:retal?d.retalTarget:null});
  });
  $$('[data-draw]').forEach(b=>b.onclick=()=>{
    const inv=E.ensureInv(d),it=inv.items.find(i=>i.id===b.dataset.draw);const v=E.validPlacement(d,it,'maos');
    if(!v.ok){toast('Libere as mãos antes: '+v.msg);return}
    closeModal();spend(ch);mutateChar(ch,x=>{const t=E.ensureInv(x).items.find(i=>i.id===it.id);if(t)t.loc='maos'});toast(it.name+' sacada. A Ação Padrão foi gasta.');renderCombatUI();
  });
};

/* ===================== 5. mira: atacar, área, escolher, teleporte, empurrão ===================== */
function startAim14(a){
  if(CB14.aim&&CB14.aim.done)try{CB14.aim.done(null)}catch(e){}
  CB14.aim=a;CB14.hover=null;MAP7.tool='move';document.body.classList.add('cb-aiming');
  try{MAP7.stage.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}
  if(MAP7.cv)MAP7.cv.style.cursor='crosshair';
  const at=tok14(a.ch.id);if(at){const [x,y]=tokCenter10(at),v=mapView7();const [sx,sy]=w2s7(v,x,y);if(sx<0||sy<0||sx>v.cw||sy>v.ch)mapCam7({...MAP7.cam,x:x/v.W,y:y/v.H})}
  if(a.kind==='atk'&&a.prefer){const t=tok14(a.prefer);if(t){const ev=evalAtk14(a,t);if(ev.ok){toast('Alvo da retaliação marcado. Clique nele para contra-atacar.')}}}
  hud14(true);mapDraw7();
}
function endAim14(){document.body.classList.remove('cb-aiming');CB14.aim=null;CB14.hover=null;if(MAP7.cv)MAP7.cv.style.cursor='';hud14(true);mapDraw7()}
function aimCancel14(){const a=CB14.aim;endAim14();if(a&&a.done)try{a.done(null)}catch(e){}if(a&&a.kind==='pick'&&a.refund)a.refund()}
function aimList14(){
  const a=CB14.aim;if(!a)return;endAim14();
  if(a.kind==='atk'){const d=d14(a.ch);pickTargets.orig({title:'Alvo do ataque · '+a.w.name,hint:'Escolha o alvo (jogador ou NPC).',multi:false,exclude:[a.ch.id],skipDead:true,preset:a.retal&&d.retalTarget?[d.retalTarget]:[]}).then(p=>{if(p&&p.ids.length)performAttack(a.ch,a.w,p.ids,{surprise:a.surprise,retal:a.retal})})}
  else if(a.kind==='aoe')pickTargets.orig({title:'Atingidos · '+a.w.name,hint:'Marque quem está na área.',multi:true,exclude:[],skipDead:true}).then(p=>{if(p&&p.ids.length)performAttack(a.ch,a.w,p.ids,{})});
  else if(a.kind==='pick'&&a.done)a.done('list');
}
function dtFor14(m){if(m<=6)return 12;if(m<=12)return 15;if(m<=18)return 18;return 20+2*Math.ceil(Math.max(0,m-24)/6)}
function aimPoint14(a){
  const h=CB14.hover,at=tok14(a.ch.id);if(!h||!at)return null;
  const [ax,ay]=tokCenter10(at);let px=h.wx,py=h.wy;const d=hyp10(px-ax,py-ay),mx=m2px14(a.max||a.m||0);
  if(mx&&d>mx){px=ax+(px-ax)*mx/d;py=ay+(py-ay)*mx/d}
  return[px,py,ax,ay];
}
const tokAtPt14=(wx,wy)=>mapHit7(wx,wy);
function pickAllowed14(a,ch){const o=a.opts||{};if(!ch)return false;if((o.exclude||[]).includes(ch.id))return false;if(o.onlyScene!==false&&!inScene(ch))return false;if(o.only&&!o.only.includes(ch.id))return false;if(o.skipDead&&isDeadCh(ch))return false;return true}
T3.cbDown=(e,p)=>{
  const a=CB14.aim;if(!a)return false;
  CB14.hover={wx:p.wx,wy:p.wy};
  if(e.button===2){aimCancel14();return true}
  if(a.kind==='atk'){
    const t=tokAtPt14(p.wx,p.wy);if(!t){toast('Clique em cima de um token para atacar.');return true}
    const ev=evalAtk14(a,t);if(!ev.ok){toast('⛔ '+ev.why);fx5('error');return true}
    endAim14();
    traceFx14(a.ch.id,t.charId,a.melee?'melee':'shot',true);
    performAttack(a.ch,a.w,[t.charId],{surprise:a.surprise,retal:a.retal,extra:ev.cover?{cover:COVER14}:null});
    if(ev.cover)toast('🧱 '+nm(charById(t.charId))+' tem cobertura parcial: +'+COVER14+' na defesa.');
    return true;
  }
  if(a.kind==='aoe'){const pt=aimPoint14(a);if(!pt)return true;endAim14();throw14(a.ch,a.w,[pt[0],pt[1]]);return true}
  if(a.kind==='pick'){
    const t=tokAtPt14(p.wx,p.wy),ch=t&&charById(t.charId);
    if(a.area&&!t){/* área: marca quem está no círculo em volta do ponto clicado */
      const R=m2px14(a.r||AREA_TALENT_M14);(M6.state.tokens||[]).forEach(q=>{const c=charById(q.charId);if(!pickAllowed14(a,c))return;const [x,y]=tokCenter10(q);if(hyp10(x-p.wx,y-p.wy)<=R+tokR10(q)*.6&&los14(p.wx,p.wy,x,y))a.sel.add(c.id)});
      addFx14({kind:'boom',x:p.wx,y:p.wy,r:R,col:'120,200,255',dur:500});hud14(true);mapDraw7();return true}
    if(!t||!pickAllowed14(a,ch)){toast(t?'Esse personagem não pode ser escolhido aqui.':'Clique em um token.');return true}
    if(!a.multi){endAim14();a.done([ch.id]);return true}
    a.sel.has(ch.id)?a.sel.delete(ch.id):a.sel.add(ch.id);hud14(true);mapDraw7();return true;
  }
  if(a.kind==='tp'||a.kind==='plano'&&a.step==='dest'){
    const who=a.kind==='tp'?tok14(a.ch.id):a.tok;if(!who){endAim14();return true}
    const [ox,oy]=a.kind==='tp'?tokCenter10(who):a.from,d=hyp10(p.wx-ox,p.wy-oy);
    if(d>m2px14(a.m)+1){toast(`Longe demais: até ${fmtM14(a.m)} m.`);return true}
    if(!los14(ox,oy,p.wx,p.wy)){toast('Precisa ser um lugar visível, sem parede no meio.');return true}
    const hit=tokAtPt14(p.wx,p.wy);if(hit&&hit.id!==who.id){toast('Esse lugar está ocupado.');return true}
    placeTok14(who,p.wx,p.wy,a.kind==='tp'?'tp':'plano');
    if(a.kind==='tp'){endAim14();toast('✨ Teleporte feito.');return true}
    a.left--;a.step='tok';a.tok=null;if(a.left<=0){endAim14();toast('Plano Superior concluído.')}else{hud14(true);mapDraw7()}
    return true;
  }
  if(a.kind==='plano'){
    const t=tokAtPt14(p.wx,p.wy);if(!t){toast('Clique no token que vai ser reposicionado.');return true}
    a.tok=t;a.from=tokCenter10(t);a.step='dest';hud14(true);mapDraw7();return true;
  }
  if(a.kind==='push'){
    const t=tokAtPt14(p.wx,p.wy);if(!t||t.charId===a.ch.id){toast('Clique no alvo que vai ser empurrado.');return true}
    endAim14();push14(a.ch,t,a.m);return true;
  }
  return true;
};
T3.cbHover=(e,p)=>{if(!CB14.aim)return;CB14.hover={wx:p.wx,wy:p.wy};mapDraw7()};
document.addEventListener('keydown',e=>{if(e.code==='Escape'&&CB14.aim){e.preventDefault();e.stopPropagation();aimCancel14()}},true);
document.addEventListener('contextmenu',e=>{if(CB14.aim&&MAP7.cv&&e.target===MAP7.cv){e.preventDefault()}},true);

/* mover token alheio: o Mestre grava; o jogador pede ao aparelho do Mestre */
function placeTok14(t,wx,wy,why){
  const g=mapCfg7(),s=t.s||1,x=+((wx-g.ox)/g.cell-s/2).toFixed(3),y=+((wy-g.oy)/g.cell-s/2).toFixed(3);
  const [ox,oy]=tokCenter10(t);addFx14({kind:why==='push'?'push':'tp',x:ox,y:oy,x2:wx,y2:wy,dur:600});cast6({t:'cbfx',f:{kind:why==='push'?'push':'tp',x:ox,y:oy,x2:wx,y2:wy,dur:600}});
  moveCancel10(t.id);TAC10.disp[t.id]={x,y,a:t.a,tx:x,ty:y,ta:t.a};
  MAP7.live[t.id]={x,y,a:t.a,until:Date.now()+5000};
  if(isGM6())setState6({tokens:(M6.state.tokens||[]).map(q=>q.id===t.id?{...q,x,y}:q)});
  else if(canMove7(t))mapCommitMove7(t.id,x,y,t.a);
  else{cast6({t:'tok',id:t.id,x,y,a:t.a});cast6({t:'cbreq',id:t.id,x,y,why})}
  mapDraw7();
}
function push14(ch,t,m){
  const at=tok14(ch.id);if(!at)return;
  const [ax,ay]=tokCenter10(at),[bx,by]=tokCenter10(t),d=hyp10(bx-ax,by-ay)||1,ux=(bx-ax)/d,uy=(by-ay)/d;
  const [nx,ny]=collide10(bx,by,bx+ux*m2px14(m),by+uy*m2px14(m),tokR10(t),blockers10());
  const moved=px2m14(hyp10(nx-bx,ny-by));
  placeTok14(t,nx,ny,'push');
  const tc=charById(t.charId),txt=moved<m-.2?`EMPURRADO ${fmtM14(moved)} m (parede)`:`EMPURRADO ${fmtM14(m)} m`;
  floatTxt14(t.charId,txt,'#ffd36b');cast6({t:'cbf',id:t.charId,txt,col:'#ffd36b'});
  insertRow(ch,'Golpe Repulsor',{detail:{cmb:'log',text:`${nm(ch)} empurrou ${nm(tc)} ${fmtM14(moved)} m${moved<m-.2?' até bater na parede':''}.`}}).catch(()=>{});
}
onCast6(p=>{
  if(p.t==='cbreq'&&isGM6()&&p.id&&isFinite(p.x)&&isFinite(p.y)){
    const t=(M6.state.tokens||[]).find(q=>q.id===p.id);if(!t)return;
    setState6({tokens:(M6.state.tokens||[]).map(q=>q.id===t.id?{...q,x:+Number(p.x).toFixed(3),y:+Number(p.y).toFixed(3)}:q)});
  }
  if(p.t==='cbmv'&&p.key){CB14.remote[p.key]={cid:p.cid,used:Number(p.used)||0,max:Number(p.max)||0};hud14();mapDraw7()}
  if(p.t==='cbf'&&p.id&&p.from!==uid3())floatTxt14(String(p.id),String(p.txt||'').slice(0,40),String(p.col||'#fff').slice(0,20));
  if(p.t==='cbfx'&&p.f&&p.from!==uid3())addFx14({...p.f,dur:Math.min(2000,Number(p.f.dur)||600)});
});

/* ===================== 6. arremesso e dano em área ===================== */
async function throw14(ch,w,pt){
  const at=tok14(ch.id);if(!at)return;
  if(actionsLeft(ch)<=0){toast('Você já usou sua Ação Padrão neste turno.');return}
  const [ax,ay]=tokCenter10(at),dist=px2m14(hyp10(pt[0]-ax,pt[1]-ay)),DT=dtFor14(dist),d=d14(ch);
  const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},w.skill);
  const r=E.rollTest(d,w.skill,SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis,consumeDelta:true});fx3('dice');
  mutateChar(ch,x=>consumeOnce(x,cal,{attack:true}));
  const ok=r.total>=DT;let ip=[pt[0],pt[1]],sc=0;
  if(!ok){sc=clamp14(1.5+(DT-r.total)*.5,1.5,9);const ang=E.rng()*TAU10,ux=Math.cos(ang),uy=Math.sin(ang),tt=castRay10(pt[0],pt[1],ux,uy,blockers10(),m2px14(sc));ip=[pt[0]+ux*Math.max(0,tt-4),pt[1]+uy*Math.max(0,tt-4)];sc=px2m14(Math.max(0,tt-4))}
  const R=m2px14(aoeR14(w));
  const hits=(M6.state.tokens||[]).filter(t=>{const c=charById(t.charId);if(!c||!inScene(c)||isDeadCh(c))return false;const [x,y]=tokCenter10(t);return hyp10(x-ip[0],y-ip[1])<=R+tokR10(t)*.6&&los14(ip[0],ip[1],x,y)});
  const crit=r.best>=w.critMin,dm=E.rollDamage(w,{extraDice:cal.mods.dmgDice,flat:cal.mods.dmg}),n=crit?dm.critTotal:dm.total;
  const molotov=/molotov/i.test(w.name||''),st=(w.effects||[]).filter(e=>e.when==='hit'||(e.when==='crit'&&crit)).map(e=>e.status);
  showRollPopup({eyebrow:'ARREMESSO',title:`${nm(ch)} · ${w.name}`,sub:`${fmtM14(dist)} m → DT ${DT}`,sets:[{label:`${w.skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max'},{label:`Dano ${w.dado}`,dice:crit?[...dm.normal,...dm.crit]:dm.normal,bonus:dm.mod+(dm.flat||0),total:n,note:crit?'CRÍTICO!':''}],big:r.total,tone:ok?'hit':'',detail:ok?`Caiu no ponto certo. ${hits.length?'Atingidos: '+hits.map(t=>nm(charById(t.charId))).join(', '):'Ninguém na área.'}`:`Errou a DT: desviou ${fmtM14(sc)} m. ${hits.length?'Atingidos: '+hits.map(t=>nm(charById(t.charId))).join(', '):'Ninguém na área.'}`});
  if(TURN.actor===ch.id)CB14.atkKey=TURN.key;
  spend(ch);
  /* explosivos de arremesso são gastos ao lançar */
  if(w._itemId&&w.skill==='Arremesso'&&w.cat==='Especial')mutateChar(ch,x=>{const it=E.ensureInv(x).items.find(i=>i.id===w._itemId);if(!it)return;it.qty=(Number(it.qty)||1)-1;if(it.qty<=0)x.inventory.items=x.inventory.items.filter(i=>i!==it)});
  const f={kind:'boom',x:ip[0],y:ip[1],r:R,col:molotov?'255,120,40':'255,200,80',dur:900,ax,ay,px:pt[0],py:pt[1]};addFx14(f);cast6({t:'cbfx',f});
  try{fx5(molotov?'burn':'hit')}catch(e){}
  const label=`${nm(ch)} arremessou ${w.name} (${fmtM14(dist)} m, DT ${DT}, ${r.total}: ${ok?'acertou o ponto':'desviou '+fmtM14(sc)+' m'})`;
  if(hits.length)await sendFx(hits.map(t=>t.charId),[{t:'aoe',n,save:molotov?'':'Resistência',dt:12,st,w:w.name,by:nm(ch),crit}],label,ch);
  else insertRow(ch,'Arremesso · '+w.name,{dice:r.dice,bonus:r.bonus,total:r.total,detail:{cmb:'log',text:label+': ninguém atingido.'}}).catch(()=>{});
  renderCombatUI();
}
T3.throwAt=throw14;
/* o efeito de área chega no aparelho de quem controla cada alvo: ele rola a própria Resistência */
const _afl14=applyFxLocal;
applyFxLocal=function(ch,fx){
  const out=[];
  (Array.isArray(fx)?fx:[fx]).forEach(f=>{
    if(!f||f.t!=='aoe'){out.push(f);return}
    const d=d14(ch);let n=Math.max(0,Number(f.n)||0),saved=false;
    if(f.save){
      const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},f.save);
      const r=E.rollTest(d,f.save,SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis});saved=r.total>=(Number(f.dt)||12);
      if(saved)n=Math.floor(n/2);
      announceRoll(ch,`${f.save} contra ${f.w||'a explosão'} (DT ${f.dt||12})`,{dice:r.dice,sides:20,bonus:r.bonus,total:r.total,eyebrow:'ÁREA',note:saved?'Resistiu: metade do dano':'Dano total'}).catch?.(()=>{});
    }
    out.push({t:'dmg',n});
    (f.st||[]).forEach(s=>{if(STATUS_BY_ID[s]&&!saved)out.push({t:'status',id:s,on:true})});
    const txt=`−${n} VT${f.crit?' · CRÍTICO!':''}${saved?' · ½':''}`;
    setTimeout(()=>{floatTxt14(ch.id,txt,'#ff6b5b');cast6({t:'cbf',id:ch.id,txt,col:'#ff6b5b'})},350);
  });
  return _afl14(ch,out);
};

/* ===================== 7. escolher alvos de habilidades no mapa ===================== */
const _pick14=pickTargets;
pickTargets=function(o={}){
  const me=charById(activeCharacterId);
  if(CB14.noMap||!inCb14()||!o||!mapReady14(me))return _pick14(o);
  return new Promise(res=>{
    const area=/área/i.test(o.hint||'');
    startAim14({kind:'pick',ch:me,multi:o.multi!==false,area,r:AREA_TALENT_M14,opts:o,title:o.title||'Escolher alvos',sel:new Set(o.preset||[]),done:ids=>{
      if(ids===null){res(null);return}
      if(ids==='list'){res(_pick14(o));return}
      CB14.lastPick=ids.slice();
      if(o.statusSelect||o.dmgInfo)res(_pick14({...o,preset:ids}));else res({ids,status:'',dmgMode:'none'});
    }});
  });
};
pickTargets.orig=_pick14;
/* talentos que mexem no mapa: Golpe Repulsor (empurra 3 m) e Plano Superior (reposiciona até 4 em 6 m) */
const _act14=activateTalent;
activateTalent=async function(id){
  const item=findAbility(id),es0=Number(data.essence)||0,t0=TURN.talentUsed,os=data.lastOneShot?.at;CB14.lastPick=[];
  const out=await _act14.apply(this,arguments);
  const used=(Number(data.essence)||0)<es0||(!t0&&TURN.talentUsed)||data.lastOneShot?.at!==os;
  const me=charById(activeCharacterId);
  if(!used||!item||!mapReady14(me))return out;
  if(item.name==='Golpe Repulsor'){const tid=CB14.lastPick[0],t=tid&&tok14(tid);if(t)push14(me,t,3);else startAim14({kind:'push',ch:me,m:3})}
  if(item.name==='Plano Superior')startAim14({kind:'plano',ch:me,m:6,left:4,step:'tok'});
  return out;
};

/* ===================== 8. efeitos visuais ===================== */
function addFx14(f){CB14.fx.push({...f,t0:performance.now()});if(CB14.fx.length>60)CB14.fx.splice(0,20);mapDraw7()}
function floatTxt14(cid,txt,col='#fff'){addFx14({kind:'txt',cid,txt,col,dur:1600})}
function traceFx14(aId,tId,kind,net){
  const a=tok14(aId),t=tok14(tId);if(!a||!t)return;const [ax,ay]=tokCenter10(a),[bx,by]=tokCenter10(t);
  const f={kind:'trace',style:kind,ax,ay,bx,by,dur:kind==='melee'?380:520};addFx14(f);if(net)cast6({t:'cbfx',f});
}
const _pr14=processRow;
processRow=function(row,live=true){
  const dt=row&&row.detail,seen=!!(row&&CB.seen.has(row.id));
  const out=_pr14.apply(this,arguments);
  if(live&&dt&&!seen&&Date.now()-(Date.parse(row.created_at)||Date.now())<30000){try{rowFx14(dt)}catch(e){console.warn('[T14] efeito',e)}}
  return out;
};
function retalOn14(){const r=CB14.retal;if(!r)return false;if(Date.now()-r.at>75000){CB14.retal=null;return false}return true}
function retalStart14(dt){
  CB14.retal={cid:dt.targetId,from:dt.attackerId,aid:dt.aid,at:Date.now()};
  const tc=charById(dt.targetId);hud14(true);mapDraw7();
  if(tc&&controls(tc)&&(tc._sheetAvailable||tc.id===activeCharacterId)){
    fx5('activate');toast('↩ RETALIAÇÃO! '+nm(tc)+' pode contra-atacar agora.');
    setTimeout(()=>{if(!retalOn14()||CB14.retal.cid!==tc.id||CB14.aim)return;if($('modalWrap')?.classList.contains('open'))return;if(retalOf(tc)>0)startAttack(tc,{retal:true})},900);
  }
}
function retalSkip14(cid){
  const ch=charById(cid);if(ch&&controls(ch)&&retalOf(ch)>0)spend(ch,'retal');
  CB14.retal=null;cast6({t:'cbretal',cid,done:1});endAim14();renderCombatUI();
}
onCast6(p=>{if(p.t==='cbretal'&&p.done&&CB14.retal&&CB14.retal.cid===p.cid){CB14.retal=null;hud14(true);mapDraw7()}});
function rowFx14(dt){
  if(dt.cmb==='res'&&Number(dt.extraDef)>0&&dt.targetId)retalStart14(dt);
  if(dt.cmb==='atk'&&dt.noDefense&&CB14.retal&&dt.attackerId===CB14.retal.cid){CB14.retal=null;hud14(true)}
  if(dt.cmb==='atk'&&dt.attackerId){const melee=dt.weapon&&(dt.weapon.cat==='Corpo a corpo'||dt.weapon.skill==='Briga');(dt.targets||[]).forEach(t=>{if(!CB14.fx.some(f=>f.kind==='trace'&&performance.now()-f.t0<700))traceFx14(dt.attackerId,t.id,melee?'melee':'shot',false)})}
  if(dt.cmb==='res'&&dt.targetId){
    const o=dt.outcome,id=dt.targetId;
    if(dt.hit){const n=dt.dmg?.final||0;floatTxt14(id,n?`−${n} VT`:'ABSORVIDO','#ff6b5b');if(dt.crit)setTimeout(()=>floatTxt14(id,'CRÍTICO!','#ffb020'),220);if(o==='violento')setTimeout(()=>floatTxt14(id,'ACERTO VIOLENTO!','#ff8a3d'),440)}
    else floatTxt14(id,o==='retaliacao'?'RETALIAÇÃO!':o==='defesa'?'BLOQUEOU!':dt.label==='Brecha Rápida'?'BRECHA!':'ESQUIVOU!',o==='retaliacao'?'#ffd36b':'#7fe3ff');
    /* Brecha Rápida: quem defendeu escolhe para onde se teleporta (até 5 m) */
    const tc=charById(id);if(dt.label==='Brecha Rápida'&&tc&&controls(tc)&&mapReady14(tc))setTimeout(()=>startAim14({kind:'tp',ch:tc,m:5}),600);
  }
}
/* desenho por cima do mapa */
function pill14(x,txt,cx,cy,bg,fg,size=13){
  x.font=`800 ${size}px "IBM Plex Sans",system-ui,sans-serif`;const tw=x.measureText(txt).width+18,h=size+12;
  x.fillStyle=bg;x.beginPath();x.roundRect?x.roundRect(cx-tw/2,cy-h,tw,h,h/2):x.rect(cx-tw/2,cy-h,tw,h);x.fill();
  x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,cx,cy-h/2+1);
}
T3.cbPaint=(x,v,g)=>{
  let again=false;const now=performance.now(),cs=g.cell*v.s,sc=(wx,wy)=>w2s7(v,wx,wy),isM=isGM6();
  /* terreno difícil: hachura (Mestre sempre; jogador só onde o próprio token está) */
  const rough=geo10().rooms.filter(r=>r.rough);
  if(rough.length){const mine=myToks10().map(t=>tokCenter10(t));rough.forEach(r=>{if(!isM&&!mine.some(([px,py])=>inPoly10(px,py,r.pts)))return;x.save();x.beginPath();path10(x,v,r.pts);x.clip();x.strokeStyle='rgba(160,110,60,.35)';x.lineWidth=2;const [x0,y0]=sc(Math.min(...r.pts.map(p=>p[0])),Math.min(...r.pts.map(p=>p[1]))),[x1,y1]=sc(Math.max(...r.pts.map(p=>p[0])),Math.max(...r.pts.map(p=>p[1])));x.beginPath();for(let k=x0-(y1-y0);k<x1;k+=12){x.moveTo(k,y1);x.lineTo(k+(y1-y0),y0)}x.stroke();x.restore()})}
  if(inCb14()){
    const cur=cur14(),t=cur&&tok14(cur.id);
    if(t&&mapTokVisible7(t)){
      const [wx,wy]=tokCenter10(t),[sx,sy]=sc(wx,wy),r=(t.s||1)*cs/2;
      /* área que ainda dá para andar */
      const mine=controls(cur),rem=mine?(()=>{const i=mvInfo14(cur);return{used:mvState14(cur).used,max:i.max}})():CB14.remote[TURN.key];
      if(rem&&rem.max>0&&(mine||isM)){const left=Math.max(0,rem.max-rem.used),rr=m2px14(left)*v.s+r;
        x.save();x.beginPath();x.arc(sx,sy,rr,0,TAU10);x.fillStyle='rgba(120,220,160,.08)';x.fill();x.setLineDash([6,6]);x.lineWidth=2;x.strokeStyle=left>0?'rgba(120,220,160,.85)':'rgba(220,90,90,.8)';x.stroke();x.setLineDash([]);x.restore();
        pill14(x,`👣 ${fmtM14(left)} m / ${fmtM14(rem.max)} m`,sx,sy+rr+24,'rgba(16,30,22,.85)',left>0?'#bff5d2':'#ffb3a8',12)}
      /* anel luminoso e etiqueta da vez */
      const pul=(Math.sin(now/240)+1)/2;
      x.save();const gr=x.createRadialGradient(sx,sy,r*.9,sx,sy,r*1.9);gr.addColorStop(0,`rgba(255,211,107,${.45+pul*.25})`);gr.addColorStop(1,'rgba(255,211,107,0)');x.fillStyle=gr;x.beginPath();x.arc(sx,sy,r*1.9,0,TAU10);x.fill();
      x.beginPath();x.arc(sx,sy,r+6+pul*3,0,TAU10);x.lineWidth=3;x.strokeStyle='#ffd36b';x.shadowColor='#ffd36b';x.shadowBlur=14;x.stroke();x.restore();
      const label=!isM&&mine?'⚡ SEU TURNO':'⚡ '+nm(cur),bob=Math.sin(now/300)*3;
      if(!(CB14.aim&&CB14.aim.ch.id===cur.id)&&!retalOn14())pill14(x,label,sx,sy-r-14+bob,!isM&&mine?'#ffd36b':'rgba(30,20,8,.88)',!isM&&mine?'#2a1a00':'#ffd36b',13);
      again=true;
    }
  }
  if(retalOn14()){const rt=tok14(CB14.retal.cid);if(rt&&mapTokVisible7(rt)){const [wx,wy]=tokCenter10(rt),[sx,sy]=sc(wx,wy),r=(rt.s||1)*cs/2,pul=(Math.sin(now/180)+1)/2;
    x.save();x.beginPath();x.arc(sx,sy,r+7+pul*4,0,TAU10);x.lineWidth=3.5;x.strokeStyle='#c39bff';x.shadowColor='#c39bff';x.shadowBlur=16;x.stroke();x.restore();
    pill14(x,'↩ RETALIAÇÃO',sx,sy-r-14+Math.sin(now/300)*3,'#c39bff','#1d0b3a',13);again=true}}
  const a=CB14.aim;
  if(a){
    const at=tok14(a.ch.id);
    if(at){
      const [ax,ay]=tokCenter10(at),[sx,sy]=sc(ax,ay),r0=(at.s||1)*cs/2;
      const ringM=a.kind==='atk'?a.range+(a.melee?0:0):a.kind==='aoe'?a.max:a.kind==='tp'?a.m:a.kind==='push'?2.2:a.kind==='plano'&&a.step==='dest'?a.m:0;
      if(ringM&&a.kind!=='plano'){const rr=m2px14(ringM)*v.s+(a.melee?r0:0);x.save();x.beginPath();x.arc(sx,sy,rr,0,TAU10);x.fillStyle=a.kind==='aoe'?'rgba(255,150,60,.06)':'rgba(255,90,90,.06)';x.fill();x.setLineDash([8,6]);x.lineWidth=2;x.strokeStyle=a.kind==='tp'?'rgba(170,140,255,.9)':'rgba(255,110,90,.85)';x.stroke();x.setLineDash([]);x.restore();
        if(!a.melee)pill14(x,(a.kind==='atk'?('Alcance '+fmtM14(ringM)+' m'):a.kind==='aoe'?'Arremesso até '+fmtM14(ringM)+' m':'Até '+fmtM14(ringM)+' m'),sx,sy-rr-6,'rgba(30,10,8,.85)','#ffd2c8',11)}
      const h=CB14.hover;
      if(a.kind==='atk'&&h){
        const t=tokAtPt14(h.wx,h.wy);
        if(t&&t.charId!==a.ch.id){const ev=evalAtk14(a,t),[bx,by]=tokCenter10(t),[tx,ty]=sc(bx,by),tr=(t.s||1)*cs/2;
          x.save();x.beginPath();x.moveTo(sx,sy);x.lineTo(tx,ty);x.lineWidth=2.5;x.setLineDash(ev.ok?[]:[6,5]);x.strokeStyle=ev.ok?(ev.cover?'#ffd36b':'#7dffa8'):'#ff6b5b';x.stroke();x.setLineDash([]);
          x.beginPath();x.arc(tx,ty,tr+5,0,TAU10);x.lineWidth=2.5;x.stroke();x.beginPath();x.moveTo(tx-tr-10,ty);x.lineTo(tx-tr+2,ty);x.moveTo(tx+tr-2,ty);x.lineTo(tx+tr+10,ty);x.moveTo(tx,ty-tr-10);x.lineTo(tx,ty-tr+2);x.moveTo(tx,ty+tr-2);x.lineTo(tx,ty+tr+10);x.stroke();x.restore();
          pill14(x,ev.ok?(ev.cover?'🧱 Cobertura · ':'🎯 ')+fmtM14(ev.s.dist)+' m':'⛔ '+(ev.s&&!ev.s.vis?'sem visão':'fora de alcance'),tx,ty-tr-12,ev.ok?'rgba(10,30,18,.88)':'rgba(40,8,8,.9)',ev.ok?(ev.cover?'#ffd36b':'#7dffa8'):'#ffb3a8',12)}
      }
      if(a.kind==='aoe'&&h){
        const pt=aimPoint14(a);if(pt){const [px,py]=pt,[qx,qy]=sc(px,py),R=m2px14(a.r),d=px2m14(hyp10(px-ax,py-ay)),DT=dtFor14(d);
          (M6.state.tokens||[]).forEach(t=>{const c=charById(t.charId);if(!c||!inScene(c)||!mapTokVisible7(t))return;const [x2,y2]=tokCenter10(t);if(hyp10(x2-px,y2-py)<=R+tokR10(t)*.6&&los14(px,py,x2,y2)){const [s2,t2]=sc(x2,y2);x.beginPath();x.arc(s2,t2,(t.s||1)*cs/2+4,0,TAU10);x.lineWidth=3;x.strokeStyle='#ff8a3d';x.stroke()}});
          x.save();x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo((sx+qx)/2,Math.min(sy,qy)-60,qx,qy);x.setLineDash([4,6]);x.lineWidth=2;x.strokeStyle='rgba(255,200,120,.9)';x.stroke();x.setLineDash([]);
          x.beginPath();x.arc(qx,qy,R*v.s,0,TAU10);x.fillStyle='rgba(255,120,40,.18)';x.fill();x.lineWidth=2;x.strokeStyle='rgba(255,150,60,.95)';x.stroke();x.restore();
          pill14(x,`💣 ${fmtM14(d)} m · DT ${DT} · raio ${fmtM14(a.r)} m`,qx,qy-R*v.s-6,'rgba(40,16,4,.9)','#ffd2a8',12)}
      }
      if(a.kind==='pick'){
        (M6.state.tokens||[]).forEach(t=>{if(!a.sel.has(t.charId))return;const [x2,y2]=tokCenter10(t),[s2,t2]=sc(x2,y2);x.beginPath();x.arc(s2,t2,(t.s||1)*cs/2+5,0,TAU10);x.lineWidth=3;x.strokeStyle='#7fe3ff';x.stroke()});
        if(a.area&&h){x.save();x.beginPath();x.arc(...sc(h.wx,h.wy),m2px14(a.r)*v.s,0,TAU10);x.fillStyle='rgba(127,227,255,.1)';x.fill();x.setLineDash([6,5]);x.strokeStyle='rgba(127,227,255,.9)';x.lineWidth=2;x.stroke();x.restore()}
      }
      if((a.kind==='tp'||a.kind==='plano'&&a.step==='dest')&&h){const o=a.kind==='tp'?[ax,ay]:a.from,okd=hyp10(h.wx-o[0],h.wy-o[1])<=m2px14(a.m)&&los14(o[0],o[1],h.wx,h.wy),[qx,qy]=sc(h.wx,h.wy);
        if(a.kind==='plano'){const [ox,oy]=sc(o[0],o[1]);x.save();x.beginPath();x.arc(ox,oy,m2px14(a.m)*v.s,0,TAU10);x.setLineDash([8,6]);x.lineWidth=2;x.strokeStyle='rgba(170,140,255,.9)';x.stroke();x.restore()}
        x.beginPath();x.arc(qx,qy,r0,0,TAU10);x.fillStyle=okd?'rgba(170,140,255,.35)':'rgba(255,90,90,.3)';x.fill()}
    }
  }
  /* efeitos (rastros, explosões, números) */
  CB14.fx=CB14.fx.filter(f=>now-f.t0<f.dur);
  CB14.fx.forEach(f=>{
    const k=(now-f.t0)/f.dur;again=true;
    if(f.kind==='trace'){const [ax,ay]=sc(f.ax,f.ay),[bx,by]=sc(f.bx,f.by);x.save();x.globalAlpha=1-k;
      if(f.style==='melee'){const an=Math.atan2(by-ay,bx-ax),r=Math.max(18,cs*.7);x.beginPath();x.arc(bx,by,r,an-Math.PI*.9+k*1.2,an-Math.PI*.2+k*1.2);x.lineWidth=5;x.strokeStyle='#fff';x.shadowColor='#ff6b5b';x.shadowBlur=12;x.stroke()}
      else{const p=Math.min(1,k*1.6),cx=ax+(bx-ax)*p,cy=ay+(by-ay)*p;x.beginPath();x.moveTo(ax+(bx-ax)*Math.max(0,p-.35),ay+(by-ay)*Math.max(0,p-.35));x.lineTo(cx,cy);x.lineWidth=3;x.strokeStyle='#ffe6a8';x.shadowColor='#ffb020';x.shadowBlur=10;x.stroke();x.beginPath();x.arc(cx,cy,3.5,0,TAU10);x.fillStyle='#fff';x.fill()}
      x.restore()}
    else if(f.kind==='boom'){const [bx,by]=sc(f.x,f.y),R=(f.r||m2px14(3))*v.s;x.save();
      if(f.ax!=null&&k<.3){const [ax,ay]=sc(f.ax,f.ay),p=k/.3;x.beginPath();x.arc(ax+(bx-ax)*p,ay+(by-ay)*p-Math.sin(p*Math.PI)*60,5,0,TAU10);x.fillStyle='#ffd36b';x.fill()}
      else{const p=Math.min(1,(k-.3)/.7);x.globalAlpha=1-p;const gr=x.createRadialGradient(bx,by,0,bx,by,R*(.4+p*.7));gr.addColorStop(0,`rgba(255,255,220,.95)`);gr.addColorStop(.45,`rgba(${f.col||'255,200,80'},.75)`);gr.addColorStop(1,`rgba(${f.col||'255,200,80'},0)`);x.fillStyle=gr;x.beginPath();x.arc(bx,by,R*(.4+p*.7),0,TAU10);x.fill();x.beginPath();x.arc(bx,by,R,0,TAU10);x.lineWidth=2;x.strokeStyle=`rgba(${f.col||'255,200,80'},.8)`;x.stroke()}
      x.restore()}
    else if(f.kind==='push'||f.kind==='tp'){const [ax,ay]=sc(f.x,f.y),[bx,by]=sc(f.x2,f.y2);x.save();x.globalAlpha=1-k;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=f.kind==='push'?6:3;x.setLineDash(f.kind==='tp'?[3,6]:[]);x.strokeStyle=f.kind==='push'?'rgba(255,211,107,.8)':'rgba(170,140,255,.9)';x.stroke();if(f.kind==='tp'){x.beginPath();x.arc(ax,ay,cs*.5*(1-k)+2,0,TAU10);x.arc(bx,by,cs*.5*k+2,0,TAU10);x.fillStyle='rgba(170,140,255,.35)';x.fill()}x.restore()}
    else if(f.kind==='txt'){const t=tok14(f.cid);if(!t||!mapTokVisible7(t))return;const [wx,wy]=tokCenter10(t),[tx,ty]=sc(wx,wy),r=(t.s||1)*cs/2;
      const same=CB14.fx.filter(q=>q.kind==='txt'&&q.cid===f.cid),idx=same.indexOf(f);
      x.save();x.globalAlpha=k<.15?k/.15:1-Math.max(0,(k-.6)/.4);x.font=`900 ${Math.round(16+Math.min(6,cs*.08))}px "IBM Plex Sans",system-ui,sans-serif`;x.textAlign='center';x.textBaseline='bottom';x.lineWidth=4;x.strokeStyle='rgba(0,0,0,.8)';
      const yy=ty-r-6-k*34-idx*20;x.strokeText(f.txt,tx,yy);x.fillStyle=f.col||'#fff';x.fillText(f.txt,tx,yy);x.restore()}
  });
  return again;
};

/* ===================== 9. barra da ordem e HUD do turno ===================== */
function mount14(){
  const st=MAP7.stage;if(!st||!st.isConnected)return false;
  let b=$('cbBar'),h=$('cbHud');
  if(!b){b=document.createElement('div');b.id='cbBar';b.className='cb-bar';b.hidden=true}
  if(!h){h=document.createElement('div');h.id='cbHud';h.className='cb-hud';h.hidden=true;h.setAttribute('role','region');h.setAttribute('aria-label','Ações do turno')}
  const full=document.fullscreenElement===st;
  if(full){if(b.parentNode!==st)st.append(b);if(h.parentNode!==st)st.append(h)}
  else{if(b.nextElementSibling!==st)st.before(b);if(st.nextElementSibling!==h)st.after(h)}
  b.classList.toggle('in-full',full);h.classList.toggle('in-full',full);st.classList.toggle('cb-full',full);
  return true;
}
function bar14(){
  const b=$('cbBar');if(!b)return;const c=camp3(),cm=c?.combat,isM=isGM6();
  if(!inCb14()){
    const sig=isM&&c?'start':'';if(CB14.barSig===sig)return;CB14.barSig=sig;
    if(!sig){b.hidden=true;b.innerHTML='';return}
    b.hidden=false;b.innerHTML='<button type="button" class="cb-start" id="cbStart">⚔ Iniciar Combate</button>';$('cbStart').onclick=beginCombat14;return;
  }
  const order=cm.order||[],ti=Math.min(cm.turnIndex||0,order.length-1);
  const sig=JSON.stringify([retalOn14()?CB14.retal.cid:'',cm.round,ti,order.map(o=>[o.characterId,isDeadCh(charById(o.characterId)),isDyingCh(charById(o.characterId))]),isM]);
  if(CB14.barSig===sig)return;CB14.barSig=sig;b.hidden=false;
  b.innerHTML=`<span class="cb-round">⚔ Rodada ${cm.round}</span><ol class="cb-ord">${order.map((o,i)=>{const ch=charById(o.characterId),dead=isDeadCh(ch),dy=isDyingCh(ch);return`<li class="${i===ti?'on':''} ${i<ti?'past':''} ${dead||dy?'down':''} ${ch&&gmChar6(ch)?'npc':''}" title="${esc(nm(ch)||o.name)}">${i===ti?'⚡ ':''}${esc(nm(ch)||o.name)}${dead?' ☠':dy?' ✚':''}</li>`}).join('')}</ol>${retalOn14()?`<span class="cb-retal">↩ Retaliação: ${esc(nm(charById(CB14.retal.cid)))}</span>`:''}${isM?'<button type="button" class="cb-next" id="cbNext" title="Passar para o próximo da ordem">Próximo ⏭</button>':''}`;
  const n=$('cbNext');if(n)n.onclick=()=>window.tulpaAdvanceTurn?.(true,true);
  b.querySelector('li.on')?.scrollIntoView?.({block:'nearest',inline:'center'});
}
function hud14(force){
  if(!mount14())return;bar14();
  const h=$('cbHud');if(!h)return;
  const a=CB14.aim,isM=isGM6(),mineAll=chars3().filter(controls);
  /* retaliação de um personagem meu enquanto a vez é de outro: ele age com o painel completo */
  {const ce=curEntry(),ct=ce?charById(ce.characterId):null;const rx=(!a&&inCb14()&&retalOn14())?mineAll.find(x=>inScene(x)&&retalOf(x)>0&&(!isM||!x.ownerId)&&x!==ct):null;CB14.rActor=rx?rx.id:null}
  const cur=cur14();
  let sig,html='';
  if(a){
    const n=a.kind==='pick'?a.sel.size:0;
    sig='aim|'+a.kind+'|'+n+'|'+(a.step||'')+'|'+(a.left||'');
    const msg=a.kind==='atk'?`🎯 <b>${esc(a.w.name)}</b>: clique no alvo no mapa. ${a.melee?'Corpo a corpo: só quem está ao lado.':'Alcance '+fmtM14(a.range)+' m, precisa de linha de visão.'}`
      :a.kind==='aoe'?`💣 <b>${esc(a.w.name)}</b>: mire no mapa e clique. Até 6 m DT 12 · 12 m DT 15 · 18 m DT 18 · mais longe DT 20+. Se falhar, desvia.`
      :a.kind==='pick'?`✦ <b>${esc(a.title)}</b>: ${a.multi?(a.area?'clique num ponto para pegar todos no raio de '+fmtM14(a.r)+' m, ou clique nos tokens':'clique nos tokens para marcar'):'clique no token'}.${a.multi?` <b>${n}</b> marcado(s).`:''}`
      :a.kind==='tp'?`✨ <b>Teleporte</b>: clique num lugar vazio e visível a até ${fmtM14(a.m)} m.`
      :a.kind==='push'?'💥 <b>Golpe Repulsor</b>: clique no alvo para empurrá-lo 3 m.'
      :`🜂 <b>Plano Superior</b>: ${a.step==='dest'?'clique no novo lugar (até 6 m).':'clique no token a reposicionar.'} Restam ${a.left}.`;
    html=`<div class="cbh-aim"><span>${msg}</span><span class="cbh-btns">${a.kind==='pick'&&a.multi?`<button type="button" class="btn small primary" data-cba="ok" ${n?'':'disabled'}>✓ Confirmar</button>`:''}${['atk','aoe','pick'].includes(a.kind)?'<button type="button" class="btn small" data-cba="list">Escolher pela lista</button>':''}<button type="button" class="btn small" data-cba="x">${a.kind==='plano'?'Concluir':'Cancelar'} (Esc)</button></span></div>`;
  }else if(inCb14()&&cur){
    const myT=myTurn14()&&!(isM&&cur.ownerId&&cur.ownerId!==uid3());
    if(myT&&!isDown(cur)&&retalOn14()&&CB14.retal.cid!==cur.id){const rw=charById(CB14.retal.cid);sig='rwme|'+CB14.retal.cid;html=`<div class="cbh-aim"><span>⏸ <b>${esc(nm(rw))}</b> ganhou uma Retaliação e age agora. Sua vez continua logo depois.</span></div>`}
    else if(myT&&!isDown(cur)){
      const d=d14(cur),m=E.computeMods(d),blocked=m.flags.has('semAgir'),left=actionsLeft(cur),extra=(TURN.extraUsed&&TURN.actor===cur.id)?0:Math.min(1,Number(d.combatExtra)||0),info=mvInfo14(cur),mv=mvState14(cur),mleft=Math.max(0,info.max-mv.used);
      const quickUsed=CB14.quick===TURN.key,st=stIds(d),inv=E.ensureInv(d),quickItems=inv.items.filter(i=>['cintura','bandoleira'].includes(i.loc)),hasAoe=E.quickWeapons(d).some(i=>aoe14(i.w)),re=retalOf(cur);
      sig=JSON.stringify(['me',cur.id,TURN.key,left,extra,fmtM14(mleft),info.max,mv.run,TURN.talentUsed,quickUsed,re,blocked,st.join(),inv.mochila,quickItems.length,hasAoe,info.canRun]);
      const pct=info.max?mleft/info.max*100:0;
      const ra=CB14.rActor===cur.id;
      const raBan=ra?`<div class="cbh-aim"><span>↩ <b>${esc(nm(cur))}</b> tem a <b>Retaliação</b> (não pode ser esquivada). Pode contra-atacar ou usar outra opção; a vez de quem está jogando continua.</span><span class="cbh-btns"><button type="button" class="btn small primary" data-cbre="${cur.id}">⚔ Contra-atacar</button><button type="button" class="btn small" data-cbskip="${cur.id}">Abrir mão</button></span></div>`:'';
      html=`${raBan}<div class="cbh-pills">
        <span class="cbp mv ${mleft<=0?'off':''}" title="${info.why?esc(info.why):'9 m por turno'}"><b><i>👣</i><span>Movimento</span></b><span class="mvbar"><s style="width:${pct.toFixed(1)}%"></s></span><em>${info.locked&&mleft<=.05?'🔒 ':''}${fmtM14(mleft)} / ${fmtM14(info.max)} m${mv.run?' · disparada':''}</em></span>
        <span class="cbp ${left>0?'':'off'}" title="Atacar, curar, conjurar, perícia, alerta, levantar, sacar da mochila"><b><i>⚔</i><span>Ação Padrão</span></b><em>${left} / ${1+extra}${extra?' (+1 violento)':''}</em></span>
        <span class="cbp free ${TURN.talentUsed?'off':''}" title="1 talento por turno sem gastar a Ação Padrão"><b><i>⚡</i><span>Talento</span></b><em>${TURN.talentUsed?'usado':'livre'}</em></span>
        <span class="cbp free ${quickUsed?'off':''}" title="1 vez por turno: cintura/coldre ou bandoleira → mãos"><b><i>🔁</i><span>Saque rápido</span></b><em>${quickUsed?'usado':'livre'}</em></span>
        <span class="cbp ${re?'':'off'}" title="Retaliação e rituais de reação acontecem fora do seu turno"><b><i>🛡</i><span>Reação</span></b><em>${re?re+' disponível':'fora do turno'}</em></span>
      </div><div class="cbh-acts">
        <button type="button" class="btn small primary" data-cb="atk" ${blocked||left<=0?'disabled':''}><i>⚔</i><span class="l">Atacar</span><span class="s">Atacar</span></button>
        ${hasAoe?`<button type="button" class="btn small" data-cb="throw" ${blocked||left<=0?'disabled':''}><i>💣</i><span class="l">Arremessar</span><span class="s">Granada</span></button>`:''}
        <button type="button" class="btn small" data-cb="run" ${blocked||left<=0||mv.run||!info.canRun||!info.base?'disabled':''} title="Gasta a Ação Padrão e dobra o movimento deste turno"><i>🏃</i><span class="l">Disparada</span><span class="s">Correr</span></button>
        <button type="button" class="btn small" data-cb="abil" ${blocked?'disabled':''}><i>✦</i><span class="l">Talentos / Rituais</span><span class="s">Talentos</span></button>
        <button type="button" class="btn small" data-cb="quick" ${blocked||quickUsed||!quickItems.length?'disabled':''}><i>🔁</i><span class="l">Saque rápido</span><span class="s">Sacar</span></button>
        <button type="button" class="btn small" data-cb="alert" ${blocked||left<=0?'disabled':''}><i>👁</i><span class="l">Alerta</span><span class="s">Alerta</span></button>
        ${st.includes('caido')?`<button type="button" class="btn small" data-cb="up" ${blocked||left<=0?'disabled':''}><i>⬆</i><span class="l">Levantar</span><span class="s">Levantar</span></button>`:''}
        <button type="button" class="btn small" data-cb="sut" ${blocked||left<=0?'disabled':''}><i>🩹</i><span class="l">Sutura</span><span class="s">Sutura</span></button>
        <button type="button" class="btn small" data-cb="other" ${blocked||left<=0?'disabled':''}><i>⌖</i><span class="l">Perícia</span><span class="s">Perícia</span></button>
        ${inv.mochila?'<button type="button" class="btn small" data-cb="drop" title="Ação livre: solta a mochila no chão"><i>🎒</i><span class="l">Soltar mochila</span><span class="s">Mochila</span></button>':''}
        ${ra?'':'<button type="button" class="btn small danger" data-cb="end"><i>✔</i><span class="l">Concluir turno</span><span class="s">Passar</span></button>'}
      </div>${info.max===0?`<p class="cbh-note">🚫 Sem movimento: ${esc(info.why)}.</p>`:''}${blocked?'<p class="cbh-note">🚫 Você não pode agir neste estado.</p>':''}`;
    }else{
      const reCh=mineAll.find(x=>inScene(x)&&retalOf(x)>0);const rw=retalOn14()&&!(reCh&&CB14.retal.cid===reCh.id)?charById(CB14.retal.cid):null;
      if(reCh&&(!isM||!reCh.ownerId)){sig='re|'+reCh.id+'|'+retalOf(reCh);html=`<div class="cbh-aim"><span>↩ <b>${esc(nm(reCh))}</b> desviou com folga: <b>Retaliação agora</b> (não pode ser esquivada). Depois a ordem continua de onde parou.</span><span class="cbh-btns"><button type="button" class="btn small primary" data-cbre="${reCh.id}">⚔ Contra-atacar</button><button type="button" class="btn small" data-cbskip="${reCh.id}">Abrir mão</button></span></div>`}
      else if(rw){sig='rw|'+rw.id;html=`<div class="cbh-aim"><span>⏸ Retaliação de <b>${esc(nm(rw))}</b> em andamento. A ordem continua logo depois.</span></div>`}
      else if(isM){const r=CB14.remote[TURN.key],mi=controls(cur)?null:r;
        sig='gm|'+TURN.key+'|'+(mi?fmtM14(mi.max-mi.used):'')+'|'+isDown(cur);
        html=`<div class="cbh-aim"><span>⏳ Vez de <b>${esc(nm(cur))}</b>${mi?` · 👣 ${fmtM14(Math.max(0,mi.max-mi.used))} / ${fmtM14(mi.max)} m`:''}${isDown(cur)?' · turno pulado':''}</span><span class="cbh-btns"><button type="button" class="btn small" data-cb="force">Forçar fim do turno</button></span></div>`}
      else{sig='wait|'+TURN.key;html=''}
    }
  }else{sig='';html=''}
  if(document.fullscreenElement===MAP7.stage&&!a&&!(sig||'').startsWith('["me"')&&!(sig||'').startsWith('re|')){sig='full-hide';html=''}
  if(!force&&CB14.hudSig===sig)return;CB14.hudSig=sig;
  if(html&&(sig||'').startsWith('["me"'))html=`<button type="button" class="cbh-min" id="cbMin" aria-expanded="${!CB14.mini}" title="${CB14.mini?'Mostrar ações':'Recolher'}">${CB14.mini?'▴':'▾'}</button>`+html;
  document.body.classList.toggle('cb-hud-on',!!html);
  h.hidden=!html;h.innerHTML=html;h.classList.toggle('aim',!!a);h.classList.toggle('mini',!!CB14.mini&&(sig||'').startsWith('["me"'));
  {const mb=$('cbMin');if(mb)mb.onclick=()=>{CB14.mini=!CB14.mini;try{localStorage.setItem('tulpa_cb_mini',CB14.mini?'1':'')}catch(e){}hud14(true)}}
  const on=(sel,fn)=>$$(sel,h).forEach(b=>b.onclick=fn);
  on('[data-cba]',e=>{const k=e.currentTarget.dataset.cba,a2=CB14.aim;if(k==='x'){aimCancel14()}else if(k==='list')aimList14();else if(k==='ok'&&a2&&a2.kind==='pick'){const ids=[...a2.sel];endAim14();a2.done(ids)}});
  on('[data-cbre]',e=>startAttack(charById(e.currentTarget.dataset.cbre),{retal:true}));
  on('[data-cbskip]',e=>retalSkip14(e.currentTarget.dataset.cbskip));
  on('[data-cb]',e=>act14(e.currentTarget.dataset.cb));
}
T3.cbHud=hud14;T3.retalStart14=dt=>retalStart14(dt);T3.setRetal14=(id,n)=>mutateChar(charById(id),d=>{d.retalExtra=n});
/* na tela cheia só aparece o que está dentro do mapa: janelas, rolagens e avisos vão junto e voltam depois */
const FLOAT14=['modalWrap','t3Roll','toast','mgInv'];
function floatHome14(){
  const st=MAP7.stage,full=!!st&&document.fullscreenElement===st;
  FLOAT14.forEach(id=>{const e=$(id);if(!e)return;if(full){if(e.parentNode!==st){e.dataset.cbHome='1';st.append(e)}}else if(e.dataset.cbHome){delete e.dataset.cbHome;document.body.append(e)}});
}
document.addEventListener('fullscreenchange',()=>{CB14.hudSig='';CB14.barSig='';floatHome14();setTimeout(()=>{hud14(true);mapDraw7()},60)});
/* o #t3Roll é criado na primeira rolagem: confere de vez em quando */
setInterval(()=>{if(document.fullscreenElement&&document.fullscreenElement===MAP7.stage)floatHome14()},700);
function act14(k){
  const cur=cur14();if(!cur)return;
  if(k==='force'){window.tulpaAdvanceTurn?.(true,true);return}
  if(!myTurn14()){toast('Não é a sua vez.');return}
  if(k==='atk'){if(CB14.rActor===cur.id&&retalOf(cur)>0)return startAttack(cur,{retal:true});return startAttack(cur)}
  if(k==='throw')return startAttack(cur,{areaOnly:true});
  if(k==='abil')return abilitiesMenu(cur);
  if(k==='alert')return alertAction(cur);
  if(k==='other')return otherAction(cur);
  if(k==='sut')return rescueAction(cur,'sutura',{spendAction:true});
  if(k==='end'){endAim14();return endTurn(cur)}
  if(k==='up'){if(actionsLeft(cur)<=0){toast('Você já usou sua Ação Padrão neste turno.');return}spend(cur);mutateChar(cur,x=>{x.statuses=(x.statuses||[]).filter(s=>s.id!=='caido')});insertRow(cur,'Levantar',{detail:{cmb:'log',text:`${nm(cur)} se levantou (Ação Padrão).`}}).catch(()=>{});toast('Você se levantou.');renderCombatUI();return}
  if(k==='run'){
    const info=mvInfo14(cur);if(!info.canRun){toast('Exausto ou sobrecarregado: não dá para disparar.');return}
    if(actionsLeft(cur)<=0){toast('Disparada gasta a Ação Padrão, e ela já foi usada.');return}
    spend(cur);const mv=mvState14(cur);mv.run=true;mvSave14(true);fx5('activate');
    insertRow(cur,'Disparada',{detail:{cmb:'log',text:`${nm(cur)} disparou: ${fmtM14(info.base*2)} m de movimento neste turno (Ação Padrão).`}}).catch(()=>{});
    toast(`🏃 Disparada: ${fmtM14(info.base*2)} m neste turno.`);renderCombatUI();mapDraw7();return;
  }
  if(k==='quick')return quickDraw14(cur);
  if(k==='drop'){
    askModal('AÇÃO LIVRE','Soltar a mochila',`<p>A mochila e tudo o que está nela ficam no chão, aqui. A carga cai na hora. Não gasta a Ação Padrão nem movimento.</p>`,'Soltar').then(ok=>{if(!ok)return;
      mutateChar(cur,x=>{const inv=E.ensureInv(x);inv.items.forEach(i=>{if(i.loc==='mochila')i.loc='chao'});inv.mochila=false});
      insertRow(cur,'Descarte de emergência',{detail:{cmb:'log',text:`${nm(cur)} soltou a mochila no chão (ação livre).`}}).catch(()=>{});toast('🎒 Mochila no chão.');renderCombatUI()});
  }
}
/* Saque Rápido: 1 por turno, cintura/coldre ou bandoleira → mãos, sem gastar a Ação Padrão */
function quickDraw14(ch){
  if(CB14.quick===TURN.key){toast('O Saque Rápido deste turno já foi usado.');return}
  const d=d14(ch),inv=E.ensureInv(d),list=inv.items.filter(i=>['cintura','bandoleira'].includes(i.loc));
  if(!list.length){toast('Nada na cintura/coldre ou na bandoleira.');return}
  const hands=inv.items.filter(i=>i.loc==='maos');
  openModal('AÇÃO LIVRE','Saque Rápido',`<p class="sub">Puxe um item da cintura/coldre ou da bandoleira para as mãos. Uma vez por turno, sem gastar a Ação Padrão.</p><div class="t3-weapons">${list.map(i=>`<button class="t3-weapon" data-qd="${i.id}"><b>${esc(i.name)}</b><span>${LOCS[i.loc]} → mãos</span></button>`).join('')}</div>${hands.length?`<p class="sub" style="margin-top:8px">Nas mãos agora: ${hands.map(i=>esc(i.name)).join(', ')}. Se não couber, o que está na mão vai para onde o novo estava.</p>`:''}`,'Fechar',closeModal);
  $$('[data-qd]').forEach(b=>b.onclick=()=>{
    const it=inv.items.find(i=>i.id===b.dataset.qd);if(!it)return;let v=E.validPlacement(d,it,'maos'),swap=null;
    if(!v.ok&&hands.length){swap=hands[hands.length-1]}
    closeModal();
    mutateChar(ch,x=>{const items=E.ensureInv(x).items,t=items.find(i=>i.id===it.id);if(!t)return;const from=t.loc;if(swap){const s=items.find(i=>i.id===swap.id);if(s)s.loc=from}t.loc='maos'});
    const d2=d14(ch);if(E.handsUsed(d2)>2){mutateChar(ch,x=>{const items=E.ensureInv(x).items,t=items.find(i=>i.id===it.id);if(t)t.loc=it.loc;if(swap){const s=items.find(i=>i.id===swap.id);if(s)s.loc='maos'}});toast('Não cabe nas mãos: '+(v.msg||'mãos ocupadas'));return}
    CB14.quick=TURN.key;fx5('click');toast(`🔁 ${it.name} na mão${swap?` (${swap.name} foi para ${LOCS[it.loc]})`:''}.`);
    insertRow(ch,'Saque rápido',{detail:{cmb:'log',text:`${nm(ch)} sacou ${it.name} (ação livre).`}}).catch(()=>{});renderCombatUI();
  });
}

/* ---------- passa a vez sozinho quando as ações acabam ----------
   Ação Padrão em 0, nenhum ataque seu esperando resultado (o Acerto Violento pode dar +1),
   nenhuma retaliação pendente: 1,5 s se o movimento também acabou; 6 s se ainda dá para andar
   (andar reinicia a contagem). "Segurar a vez" cancela neste turno. */
const AUTO14={key:'',at:0,used:-1,hold:''};
function pendingMine14(ch){return Object.values(CB.pending||{}).some(v=>v&&v.dt&&v.dt.attackerId===ch.id&&Date.now()-v.t<120000&&Object.values(v.targets||{}).some(t=>!t.res))}
function auto14(){
  const cur=cur14();
  if(!inCb14()||!cur||!myTurn14()||isDown(cur)||(isGM6()&&cur.ownerId&&cur.ownerId!==uid3())){AUTO14.at=0;return}
  if(AUTO14.hold===TURN.key||window.__cbNoAuto){AUTO14.at=0;return}
  const left=actionsLeft(cur),info=mvInfo14(cur),mv=mvState14(cur),mleft=Math.max(0,info.max-mv.used);
  const busy=!!CB14.aim||retalOn14()||pendingMine14(cur)||$('modalWrap')?.classList.contains('open')||CB.prompting||(CB.promptQueue||[]).length;
  if(left>0||busy){AUTO14.at=0;AUTO14.key='';return}
  const now=Date.now();
  if(AUTO14.key!==TURN.key||!AUTO14.at||Math.abs(mv.used-AUTO14.used)>.01){AUTO14.key=TURN.key;AUTO14.used=mv.used;AUTO14.at=now+(CB14.atkKey===TURN.key?1200:mleft>.05?6000:1500)}
  if(now>=AUTO14.at){AUTO14.at=0;AUTO14.hold=TURN.key;toast('⏭ Ações usadas: a vez passa para o próximo.');endAim14();endTurn(cur);return}
  const n=Math.ceil((AUTO14.at-now)/1000),h=$('cbHud');
  if(h){let e=h.querySelector('.cbh-auto');if(!e){e=document.createElement('p');e.className='cbh-auto';h.append(e)}
    const txt=`⏭ Ações usadas. A vez passa em ${n} s${mleft>.05?` (ainda dá para andar ${fmtM14(mleft)} m)`:''}.`;
    if(e.dataset.t!==txt){e.dataset.t=txt;e.innerHTML=`${txt} <button type="button" class="btn small" id="cbHold">Segurar a vez</button>`;$('cbHold').onclick=()=>{AUTO14.hold=TURN.key;AUTO14.at=0;e.remove();toast('Ok, a vez fica com você. Use ✔ Concluir turno quando terminar.')}}}
}
setInterval(()=>{try{auto14()}catch(e){console.warn('[T14] vez',e)}},400);
T3.cbAuto=AUTO14;
/* o banco só marca "concluído"; o aparelho do Mestre passa a vez na hora */
let gmAdvKey14='';
setInterval(()=>{
  try{if(!isGM6()||!inCb14()||window.__cbNoAuto)return;const cm=camp3().combat,o=cm.order||[],ti=Math.min(cm.turnIndex||0,o.length-1),e=o[ti];
    if(!e||!e.done||retalOn14())return;const k=cm.round+':'+ti+':'+e.characterId;if(gmAdvKey14===k)return;gmAdvKey14=k;
    setTimeout(()=>{const cm2=camp3()?.combat,e2=cm2&&(cm2.order||[])[Math.min(cm2.turnIndex||0,(cm2.order||[]).length-1)];if(e2&&e2.done&&e2.characterId===e.characterId)window.tulpaAdvanceTurn?.(true,true)},500);
  }catch(e){console.warn('[T14] avançar',e)}
},500);

/* ---------- ciclo ---------- */
const _rc14=renderCombatUI;
renderCombatUI=function(){const r=_rc14.apply(this,arguments);try{if(!inCb14()&&CB14.aim&&CB14.aim.kind!=='tp')endAim14();hud14()}catch(e){console.warn('[T14] hud',e)}return r};
T3.renderCombatUI=renderCombatUI;
setInterval(()=>{try{if(MAP7.cv&&MAP7.cv.isConnected&&!document.hidden){hud14();if(inCb14())mapDraw7()}}catch(e){console.warn('[T14] hud',e)}},500);
M6.hooks.leave.push(()=>{CB14.aim=null;CB14.fx=[];CB14.remote={};CB14.hudSig='';CB14.barSig=''});
T3.cbDbg={evalAtk14,shot14,mvInfo14,mvState14,dtFor14,weaponRange14,startAim14,endAim14};


