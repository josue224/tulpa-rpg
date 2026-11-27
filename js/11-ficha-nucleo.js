/* ===== TULPA · ETAPA 3 — núcleo de interface ===== */
const T3={};window.T3=T3;
const $q=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sb=()=>window.tulpaSupabase,uid3=()=>window.tulpaCloudUser?.id||null,role3=()=>window.tulpaCloudRole||portalRole||'';
const camp3=()=>(typeof currentCampaign==='function'?currentCampaign():null);
const sign=n=>(n>=0?'+':'')+n;
const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const fx3=k=>{try{window.tulpaFx?.(k)}catch(e){}};
const dmax=d=>E.maxStats(d); /* tabela do estágio + CON no Vital e PRE na Essência */
T3.me=()=>({id:uid3(),role:role3()});

/* ---- catálogo: novas vocações, perícia História, correção de arquétipos, rituais completos ---- */
function mergeCatalog(){
  {const hi=BASE_SKILLS.indexOf('História');if(hi>=0){BASE_SKILLS.splice(hi,1);delete SKILL_ATTR['História']}}
  [vocations,ORIGINAL_VOCATIONS].forEach(list=>list.forEach(v=>{if(v.name==='Arqueólogo'&&v.skills.includes('História')){const i=v.skills.indexOf('História');v.skills[i]='Investigação'}}));
  const ac=data.arsenalCost==='p12'?[1,2,4]:[5,10,20];
  [tracks,ORIGINAL_TRACKS].forEach(list=>list.forEach(t=>{if(t.name!=='Arsenal Mental')return;t.stages.forEach(s=>{const k={3:0,5:1,8:2}[s.stage];if(k===undefined)return;s.cost=ac[k];s.desc=s.desc.replace(/\b(?:Gaste |gastando |ao custo de )?\d+ ES[;,]?\s*/i,'')})}));
  [vocations,ORIGINAL_VOCATIONS].forEach(list=>NEW_VOCATIONS.forEach(v=>{if(!list.some(x=>x.name===v.name))list.push(JSON.parse(JSON.stringify(v)))}));
  [tracks,ORIGINAL_TRACKS].forEach(list=>list.forEach(t=>{if(TRACK_ARCH_FIX[t.name])t.archetype=TRACK_ARCH_FIX[t.name]}));
  [tracks,ORIGINAL_TRACKS].forEach(list=>NEW_TRACKS.forEach(t=>{if(!list.some(x=>x.name===t.name))list.push(JSON.parse(JSON.stringify(t)))}));
  /* Manual Oficial (Edição Revisada): Percepção é atributo, a perícia das vocações é Observação; História virou Pesquisa */
  [vocations,ORIGINAL_VOCATIONS,NEW_VOCATIONS].forEach(list=>list.forEach(v=>{if(Array.isArray(v.skills))v.skills=v.skills.map(s=>s==='Percepção'?'Observação':s==='História'?'Pesquisa':s);if(v.name==='Negociador Internacional')(v.talents||[]).forEach(t=>{if(t&&typeof t.desc==='string')t.desc=t.desc.replace(/História/g,'Pesquisa')})}));
  vocations.forEach(v=>{const nv=NEW_VOCATIONS.find(x=>x.name===v.name);if(nv)v.talents.forEach((t,i)=>{if(nv.talents[i]?.effects&&!t.effects)t.effects=nv.talents[i].effects;if(nv.talents[i]?.noBonus)t.noBonus=true})});
  if(data.archetype&&data.track){const t=tracks.find(x=>x.name===data.track);if(t&&t.archetype!==data.archetype)data.archetype=t.archetype}
}
(function(){const keep=RITUALS.filter(r=>String(r.id).startsWith('custom-'));RITUALS.length=0;RITUAL_FULL.forEach(r=>RITUALS.push(r));keep.forEach(r=>RITUALS.push(r))})();

/* ---- núcleo de cálculo: dados, bônus e rolagem unificados (ficha, mesa e combate) ---- */
T3.mods=d=>E.computeMods(d);
window.tulpaDiceFor=(d,skill)=>E.diceFor(d,skill,SKILL_ATTR);
/* Graus de perícia (pág. 2-3): escolhas de +5; Mestre +10 (Estágio 5: 1 · 7: 3 · 8: 4); Maestria +15 (Estágio 9: 1);
   Estágio 10: +1 perícia sobe direto para +10 sem gastar escolha de +5. */
E.tierLimits=st=>{st=Number(st)||1;return{five:(STAGES[st]||STAGES[1]).extra,ten:st>=8?4:st>=7?3:st>=5?1:0,fifteen:st>=9?1:0,free10:st>=10?1:0}};
/* E.skillTier, E.tierUsage, E.limitsFor e as vertentes ficam no motor (js/10) */
E.baseSkill=()=>0; /* todas as perícias começam em 0 */
/* attrOv: atributo escolhido para este teste (o padrão da perícia continua sendo o SKILL_ATTR) */
/* opts.vert (id da vertente): perícia, grau, atributo e generalismo vêm de E.vertCalc.
   opts.generalista (id da perícia): "outra área" dela, via E.generalistCalc */
function skillCalc3(ch,skill,attrOv,opts){
  const vo={vocList:ch.vocations||vocations,attr:attrOv};
  const vc=opts?.vert?E.vertCalc(ch.data||{},opts.vert,vo):opts?.generalista?E.generalistCalc(ch.data||{},opts.generalista,{...vo,skill}):null;
  if(vc){skill=vc.skill;attrOv=vc.attr||attrOv}
  const d=ch.data||{},std=SKILL_ATTR[skill],attr=attrOv&&ATTRS.includes(attrOv)?attrOv:std,SA=attr===std?SKILL_ATTR:{...SKILL_ATTR,[skill]:attr},m=E.computeMods(d),n=E.diceFor(d,skill,SA,m);
  const vlist=(ch.vocations||vocations),v=vlist.find(x=>x.name===d.vocation);
  let voc=0;if(v&&(v.skills||[]).map(s=>s==='Percepção'?'Observação':s).includes(skill)){const y=Number(d.serviceYears)||0;voc=y>=40?15:y>=10?10:5}
  if(vc)voc=vc.voc;
  const extra=vc?vc.grau:E.skillTier(d,skill),start=E.baseSkill(skill);
  const base=start+(Number(d.skillOverrides?.[skill])||0)+extra+voc+E.flatFor(d,skill,m);
  const matches=e=>e.skill===skill||(Array.isArray(e.skills)&&e.skills.includes(skill));
  const effects=d.activeEffects||[];
  /* bônus de perícia de talentos são consumidos pela primeira rolagem que os usa */
  const isConsume=e=>matches(e)&&Number(e.value)&&(e.type==='once'||e.consume);
  const persistent=effects.filter(e=>!isConsume(e)&&e.type!=='once'&&matches(e)).reduce((s,e)=>s+(Number(e.value)||0),0);
  const onceList=effects.filter(isConsume);
  const once=onceList.reduce((s,e)=>s+(Number(e.value)||0),0);
  const team=Number(window.tulpaTeamBonus?.(skill))||0;
  const isAtk=ATTACK_SKILLS.includes(skill),isDodge=skill==='Esquiva'||skill==='Reflexo';
  const combatFlat=(isAtk?m.atk:0)+(isDodge?m.dodge:0);
  const dis=m.disadv.has('ataque')&&isAtk||m.disadvSkills.has(skill)||(m.disadv.has('ataqueDistancia')&&['Armas de Disparo','Arremesso'].includes(skill));
  return{skill,vert:vc,blocked:!!vc&&!vc.permitido,attr,std,SA,n,base,start,tier:extra,voc,persistent,once,onceList,team,combatFlat,dis,mods:m,bonus:base+persistent+once+team+combatFlat};
}
window.tulpaSkillCalc=skillCalc3;
/* a ficha usa os mesmos cálculos */
currentAttr=skill=>E.diceFor(data,skill,SKILL_ATTR);
skillBonus=skill=>{const c=skillCalc3({data,vocations,tracks},skill);return c.base+c.persistent+c.combatFlat};
pendingTalentBonus=skill=>skillCalc3({data,vocations,tracks},skill).once;
function doRoll(ch,skill,{label,extraBonus=0,forceDis=false,adv=false,attr,vert,generalista}={}){
  const c=skillCalc3(ch,skill,attr,{vert,generalista}),d=ch.data;
  const r=E.rollTest(d,c.skill,c.SA,{mods:c.mods,bonus:c.bonus+extraBonus,disadv:c.dis||forceDis,adv,consumeDelta:true});
  r.calc=c;return r;
}
/* consome efeitos "uso único" e dado extra ao rolar */
function consumeOnce(d,calc,{attack=false}={}){
  const used=new Set((calc.onceList||[]).map(e=>e.id));
  d.activeEffects=(d.activeEffects||[]).filter(e=>{
    if(used.has(e.id))return false;
    if(e.type==='once'&&e.dieDelta)return false;
    if(attack&&e.type==='once'&&(e.atk||e.dmg||e.dmgDice||e.dmgExtra))return false;
    return true;});
  d.statuses=(d.statuses||[]).filter(s=>!(STATUS_BY_ID[s.id]?.once));
  d.activeTalents=(d.activeTalents||[]).filter(id=>d.activeEffects.some(e=>e.source===id));
}
function rollModal(skill,r,extra){
  const sg=n=>(n>=0?'+':'')+n,c=r.calc,swap=c.attr!==c.std&&!c.vert;
  openModal('ROLAGEM DE APTIDÃO',`${skill}${c.attr!==c.std||c.vert?' ('+c.attr+')':''} · ${r.n}d20 ${sg(r.bonus)}`,`<div class="roll-result">${swap?`<div class="sub">Atributo trocado: <b>${esc(c.attr)}</b> no lugar de ${esc(c.std)}</div>`:''}${extra?`<div class="sub">${esc(extra)}</div>`:''}<div class="sub">${r.mode==='normal'?'Maior resultado mantido':'<b>'+r.mode.toUpperCase()+'</b> — duas rolagens, vale a '+(r.mode==='desvantagem'?'pior':'melhor')}${r.delta?' · dado extra/penalidade '+sg(r.delta):''}</div><div class="dice">${r.dice.map(x=>`<span class="die ${x===r.best?'best':'discard'}">${x}</span>`).join('')}${r.alt?'<span class="sub"> | </span>'+r.alt.map(x=>`<span class="die discard">${x}</span>`).join(''):''}</div><div class="bigresult">${r.total}</div><div class="sub">Dado ${r.best} ${sg(r.bonus)} = ${r.total}</div>${c.mods.sources.length?`<div class="sub" style="margin-top:6px">Modificadores: ${c.mods.sources.map(esc).join(' · ')}</div>`:''}</div>`,'Fechar',()=>closeModal());
}
/* opts: {vert} especialização · {generalista} "outra área" da perícia · {label} nome no resultado e no log.
   O contexto social escolhido na ficha (T3.socialTake) entra como bônus. */
rollSkill=function(skill,attr,opts={}){
  const ch={data,vocations,tracks},pre=skillCalc3(ch,skill,attr,opts);
  if(pre.blocked){toast('Essa especialização exige treino específico.');return null}
  const soc=T3.socialTake?.(pre.skill),r=doRoll(ch,skill,{attr,vert:opts.vert,generalista:opts.generalista,extraBonus:soc?.bonus||0});
  const label=opts.label||r.calc.skill;
  consumeOnce(data,r.calc);save();renderTalents();renderSkills();rollModal(label,r,soc?.bonus?`Bônus social: +${soc.bonus} ${soc.attr} (${soc.motivo})`:'');
  window.tulpaRollFx?window.tulpaRollFx($('modalBody'),{d20:true,crit:r.best===20,fumble:r.best===1,who:[data.name]}):fx3('dice');
  T3.shareSheetRoll?.(label,r);
  T3.narrateRoll?T3.narrateRoll({name:data.name,skill:label,dice:[r.best],total:r.total}):T3.perseusReact?.(r.best===20?'nat20':(r.best===1?'nat1':''));
  return r;
};

/* ---- persistência de qualquer ficha que eu controle ---- */
const pubSummary=d=>{const h=!!d?.hideStats;return{name:d?.name||'Personagem sem nome',stage:Number(d?.stage)||1,vital:h?0:Number(d?.vital)||0,lucidity:h?0:Number(d?.lucidity)||0,essence:h?0:Number(d?.essence)||0,statuses:(d?.statuses||[]).map(s=>typeof s==='string'?s:s.id),df:Number(E.defenseInfo(d||{attributes:{}}).DF)||10,vtMax:h?0:E.maxStats(d||{}).vt,esMax:h?0:E.maxStats(d||{}).es,hideStats:h,temp:h?0:Number(d?.vitalTemp)||0,...(!h&&d?.reacao?{reacao:d.reacao}:{}),dying:((d?.statuses||[]).find(s=>(s.id||s)==='agonia')||{}).turns??null,...(avOk(d?.avatar)?{avatar:d.avatar}:{}),...(avOk(d?.tokenAvatar)?{tokenAvatar:d.tokenAvatar}:{})}};
function combatCache(d,voc,trk){
  try{const c=skillCalc3({data:d,vocations:voc||vocations,tracks:trk||tracks},'Reflexo');d.combatCache={reflexDice:Math.max(1,Math.min(8,c.n)),reflexBonus:Math.max(-30,Math.min(60,c.bonus)),at:Date.now()}}catch(e){}
}
T3.combatCache=combatCache;
async function persistRemote(ch){
  combatCache(ch.data,ch.vocations,ch.tracks);
  const c=sb();if(!c||!ch?.id)return;
  const {error:e1}=await c.from('character_sheets').upsert({character_id:ch.id,sheet_data:{...ch.data,teamBonuses:ch.teamBonuses||ch.data?.teamBonuses||[]},vocations:ch.vocations||vocations,tracks:ch.tracks||tracks,updated_by:uid3(),updated_at:new Date().toISOString()},{onConflict:'character_id'});
  if(e1)throw e1;
  const {error:e2}=await c.from('characters').update({public_data:pubSummary(ch.data),updated_at:new Date().toISOString()}).eq('id',ch.id);
  if(e2)throw e2;
}
function mutateChar(ch,fn){
  if(!ch)return;
  (window.__dirty=window.__dirty||{})[ch.id]=Date.now();
  if(ch.id===activeCharacterId){fn(data);save()}
  else{E.migrateSheet(ch.data);fn(ch.data);persistRemote(ch).then(()=>{window.__dirty[ch.id]=Date.now()}).catch(e=>{console.error(e);toast('Falha ao salvar '+(ch.data?.name||'personagem'))})}
  try{if(!$('tablePanel').classList.contains('hide'))renderTable()}catch(e){}
}
const controls=ch=>!!ch&&(role3()==='master'?(!ch.ownerId||ch.ownerId===uid3()):ch.ownerId===uid3());
const canEdit=ch=>!!ch&&(role3()==='master'||ch.ownerId===uid3());
const inScene=ch=>ch&&ch.inScene!==false;

/* ficha antiga ganha os campos das vertentes e os novos máximos antes de desenhar (idempotente) */
{const _r8=render;render=function(){try{E.migrateSheet(data)}catch(e){console.warn('[T8] migrar ficha',e)}return _r8.apply(this,arguments)}}

/* ---- recursos com +/− (corrige o bug dos sliders) ---- */
function setResource(key,value,{silent=false}={}){
  const s=dmax(data),max={vital:s.vt,lucidity:s.luc,essence:s.es}[key];
  const old=Number(data[key])||0;let nv=Math.max(0,Math.min(max,Math.trunc(Number(value)||0)));
  if(nv===old)return;
  /* PRE: a blindagem reduz o 1º dano de Lucidez da cena */
  if(key==='lucidity'&&nv<old){const sh=E.lucidityShield(data,old-nv);if(sh.applied){nv=old-sh.final;if(!silent)toast(`Blindagem de Lucidez: dano ${sh.raw} → ${sh.final}. Usada nesta cena.`)}}
  data[key]=nv;
  if(key==='lucidity'&&nv<old){
    if(data.extase?.on&&!data.collapsePending){save();T3.extaseTest?.(old-nv);return}
    if(nv<=0&&old>0){data.collapsePending=true;save();T3.collapseModal?.();return}
  }
  if(key==='vital'&&nv<=0&&old>0)T3.onZeroVital?.(data);
  if(key==='vital'&&nv>0&&old<=0&&(data.statuses||[]).some(x=>x.id==='agonia'))data.statuses=data.statuses.filter(x=>x.id!=='agonia');
  persistOnly();renderStats();T3.renderOverviewExtra?.();
}
renderStats=function(){
  const s=dmax(data);
  const row=(label,key,max,cls)=>{const v=Math.max(0,Math.min(max,Number(data[key])||0));
    return `<div class="stat" data-res-box="${key}"><div class="name">${label}</div><div class="value">${v}<span class="max"> / ${max}</span>${key==='vital'&&data.vitalTemp?`<span class="pill" style="margin-left:8px">+${data.vitalTemp} temp</span>`:''}</div><div class="resctl"><button class="btn small" data-res-d="${key}|-5">−5</button><button class="btn small" data-res-d="${key}|-1">−1</button><input type="number" class="resnum" data-res-n="${key}" min="0" max="${max}" value="${v}"><button class="btn small" data-res-d="${key}|1">+1</button><button class="btn small" data-res-d="${key}|5">+5</button><button class="btn small ghost" data-res-d="${key}|max" title="Máximo">Máx</button></div><div class="bar"><span style="width:${max?v/max*100:0}%"></span></div></div>`};
  $('stats').innerHTML=row('VITAL','vital',s.vt)+row('LUCIDEZ','lucidity',s.luc)+row('ESSÊNCIA','essence',s.es);
  $$('[data-res-d]').forEach(b=>b.onclick=()=>{const [k,dl]=b.dataset.resD.split('|');const cur=Number(data[k])||0;setResource(k,dl==='max'?9999:cur+Number(dl))});
  $$('[data-res-n]').forEach(i=>i.onchange=()=>setResource(i.dataset.resN,i.value));
  $('essenceNow').textContent=`ES ${data.essence} / ${s.es}`;
};

/* ---- ganchos de render ---- */
const _render=render;
render=function(){
  mergeCatalog();
  const eq=E.equipDefense(data);data.defense=eq;data.baseDefense=10;data.collapse=Number(data.collapseCount)||0;
  data.state=data.extase?.on?'Êxtase':(data.traumas||[]).length?'Trauma':(data.penaltyLevel?'Penalidade '+data.penaltyLevel:((data.statuses||[]).map(s=>STATUS_BY_ID[s.id]?.name).filter(Boolean).join(', ')||'Normal'));
  E.ensureInv(data);data.statuses=data.statuses||[];data.traumas=data.traumas||[];data.activeEffects=data.activeEffects||[];
  data.activeTalents=(data.activeTalents||[]).filter(id=>data.activeEffects.some(e=>e.source===id));
  _render();
  T3.renderSheetTabs?.();
};
T3.refresh=()=>{try{render()}catch(e){console.error(e)}};
/* toda gravação da ficha leva junto o Reflexo calculado, usado pelo servidor na iniciativa */
{const _sv=save,_po=persistOnly;
 save=function(){combatCache(data);return _sv.apply(this,arguments)};
 persistOnly=function(){combatCache(data);return _po.apply(this,arguments)};}

/* ---- navegação "Voltar" ---- */
const NAV={stack:[],restoring:false};
function viewKey(){
  if(document.body.classList.contains('app-locked')){
    if(!$('portalHome').classList.contains('hide'))return'home';
    if(!$('portalLogin').classList.contains('hide'))return'login';
    if(!$('portalDashboard').classList.contains('hide'))return'dash';
    if(!$('campaignHub').classList.contains('hide'))return $('tablePanel').classList.contains('hide')?'hub:chars':'hub:table';
    return'home';
  }
  const a=$q('.tab.active');return'sheet:'+(a?a.id.replace('tab-',''):'overview');
}
function navObserve(){
  if(NAV.restoring)return;
  const k=viewKey(),top=NAV.stack[NAV.stack.length-1];
  if(k===top)return;
  const at=NAV.stack.lastIndexOf(k);
  if(at>=0&&at<NAV.stack.length-1&&at>=NAV.stack.length-3){NAV.stack.length=at+1}else NAV.stack.push(k);
  if(NAV.stack.length>60)NAV.stack.shift();
  navButtons();
}
function showPortalPart(part){
  document.body.classList.add('app-locked');const p=$('portal');p.classList.remove('hide');p.style.display='block';p.setAttribute('aria-hidden','false');
  ['portalHome','portalLogin','portalDashboard','campaignHub'].forEach(x=>$(x).classList.add('hide'));
  $(part).classList.remove('hide');
}
function restoreView(k){
  NAV.restoring=true;
  try{
    if(k==='home')portalHome();
    else if(k==='login')loginScreen(portalRole||'player');
    else if(k==='dash'){showPortalPart('portalDashboard')}
    else if(k.startsWith('hub:')){showPortalPart('campaignHub');const t=k==='hub:table';$('charactersPanel').classList.toggle('hide',t);$('tablePanel').classList.toggle('hide',!t);t?renderTable():renderCharacters()}
    else if(k.startsWith('sheet:')){
      if(document.body.classList.contains('app-locked'))showApp();
      const tab=k.slice(6);$$('.navbtn').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));$$('.tab').forEach(x=>x.classList.toggle('active',x.id==='tab-'+tab));
    }
  }finally{setTimeout(()=>{NAV.restoring=false;navButtons()},60)}
}
T3.back=()=>{
  if(NAV.stack.length<2){toast('Você já está na primeira tela.');return}
  NAV.stack.pop();let k=NAV.stack[NAV.stack.length-1];
  if(k.startsWith('sheet:')&&!document.body.classList.contains('app-locked')&&viewKey().startsWith('sheet:')&&k===viewKey()){NAV.stack.pop();k=NAV.stack[NAV.stack.length-1]||'dash'}
  if(!document.body.classList.contains('app-locked')&&!k.startsWith('sheet:'))try{syncActiveCharacter()}catch(e){}
  restoreView(k);
};
function navButtons(){
  const show=NAV.stack.length>1;
  $$('.t3-back').forEach(b=>{b.style.visibility=show?'visible':'hidden'});
}
function initNav(){
  const mk=cls=>{const b=document.createElement('button');b.className='btn small t3-back '+cls;b.textContent='← Voltar';b.title='Voltar para a tela anterior';b.onclick=T3.back;return b};
  $q('.top-actions').prepend(mk('ghost'));
  const wrap=$q('.portal-wrap');wrap.insertBefore(mk('t3-back-portal'),wrap.firstChild);
  const mo=new MutationObserver(()=>requestAnimationFrame(navObserve));
  ['portalHome','portalLogin','portalDashboard','campaignHub','charactersPanel','tablePanel'].forEach(id=>mo.observe($(id),{attributes:true,attributeFilter:['class']}));
  $$('.tab').forEach(t=>mo.observe(t,{attributes:true,attributeFilter:['class']}));
  mo.observe(document.body,{attributes:true,attributeFilter:['class']});
  NAV.mo=mo;NAV.stack=[viewKey()];navButtons();
}
T3.initNav=initNav;

/* ===== TULPA · aparência: tema escuro, detecção de celular/computador, tamanho do texto ===== */
const PREF_KEY='tulpa_prefs_v2';
const prefs=Object.assign({theme:'light',view:'auto',text:'normal',shareSheet:false,perseus:true,perseusReacts:true,aiEndpoint:''},(()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}catch(e){return{}}})());
T3.prefs=prefs;
const savePrefs=()=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs))}catch(e){}};
function detectMobile(){
  const ua=/Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent||'');
  const coarse=window.matchMedia?.('(pointer:coarse)').matches;
  const w=Math.min(window.innerWidth||999,screen.width||999);
  return w<=820||(ua&&(window.innerWidth||999)<1100)||(coarse&&w<=1024);
}
T3.isMobile=()=>document.body.classList.contains('t3-mobile');
/* paletas: Pergaminho (claro), Abismo (escuro), Obsidiana, Sangue & Cinzas, Terminal e Personalizada */
const PALETTES=[
  {id:'light',name:'Pergaminho Clássico',sw:['#d8c8a8','#f2e8d4','#261d16','#8e3e34','#a98447']},
  {id:'dark',name:'Abismo / Noturno',sw:['#0d1015','#171c24','#eef2f7','#e59a8c','#d8b878']},
  {id:'obsidian',name:'Sombra & Obsidiana',sw:['#050508','#10111a','#ece8f6','#b388ff','#8a4fff'],dark:true},
  {id:'blood',name:'Sangue & Cinzas',sw:['#0c0908','#181210','#efe4d6','#e2493f','#b98d5c'],dark:true},
  {id:'terminal',name:'Terminal Operacional',sw:['#030805','#08130c','#c6f6d2','#ffb000','#1d4a2b'],dark:true},
  {id:'custom',name:'🎨 Personalizado'},
  {id:'auto',name:'Automático (segue o sistema)',sw:['#d8c8a8','#0d1015','#261d16','#eef2f7','#8e3e34']}
];
const CUSTOM_DEF={bg:'#101418',panel:'#1a2027',text:'#eef2f7',accent:'#e59a8c',second:'#c8a66a'};
const hexOk=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rgbHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const hexMix=(a,b,t)=>{const x=hexRgb(a),y=hexRgb(b);return rgbHex(x.map((v,i)=>v*(1-t)+y[i]*t))};
const hexLum=h=>{const [r,g,b]=hexRgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
function customPal(){const c=Object.assign({},CUSTOM_DEF,prefs.customPalette||{});Object.keys(CUSTOM_DEF).forEach(k=>{if(!hexOk(c[k]))c[k]=CUSTOM_DEF[k]});return c}
function customVars(c){
  const acc2=hexMix(c.accent,hexLum(c.bg)<.5?'#000000':'#000000',.22);
  return{'--bg':c.bg,'--panel':c.panel,'--panel2':hexMix(c.panel,c.text,.06),'--text':c.text,'--muted':hexMix(c.text,c.bg,.38),
    '--accent':c.accent,'--accent2':acc2,'--line':hexMix(c.second,c.panel,.45),'--gold':c.second,'--on-accent2':hexLum(acc2)>.38?'#111111':'#ffffff'};
}
T3.palettes=PALETTES;T3.customVars=customVars;
function applyPrefs(){
  const mq=window.matchMedia?.('(prefers-color-scheme: dark)');
  const th=prefs.theme,palDef=PALETTES.find(p=>p.id===th);
  let pal='',dark;
  if(th==='custom'){pal='custom';dark=hexLum(customPal().bg)<.36}
  else if(palDef&&palDef.dark){pal=th;dark=true}
  else dark=th==='dark'||(th==='auto'&&!!mq?.matches);
  const mobile=prefs.view==='mobile'||(prefs.view==='auto'&&detectMobile());
  const b=document.body;
  b.classList.toggle('t3-dark',dark);b.classList.toggle('t3-mobile',mobile);b.classList.toggle('t3-desktop',!mobile);
  b.classList.toggle('t3-pal',!!pal);if(pal)b.dataset.pal=pal;else delete b.dataset.pal;
  const vk=['--bg','--panel','--panel2','--text','--muted','--accent','--accent2','--line','--gold','--on-accent2'];
  if(pal==='custom'){const v=customVars(customPal());vk.forEach(k=>b.style.setProperty(k,v[k]))}else vk.forEach(k=>b.style.removeProperty(k));
  document.documentElement.dataset.text=prefs.text;
  document.documentElement.dataset.theme=dark?'dark':'light';
  let m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}
  m.content=pal==='custom'?customPal().bg:pal?(PALETTES.find(p=>p.id===pal).sw[0]):dark?'#0f1319':'#2b211b';
  $$('.t3-themebtn').forEach(x=>{x.textContent=dark?'☀':'☾';x.title=dark?'Mudar para o tema claro':'Mudar para o tema escuro';x.setAttribute('aria-label',x.title)});
}
T3.applyPrefs=applyPrefs;
function seg(key,opts){return `<div class="t3-seg" data-pref="${key}">${opts.map(([v,l])=>`<button type="button" class="${String(prefs[key])===String(v)?'on':''}" data-v="${v}">${l}</button>`).join('')}</div>`}
function openSettings(){
  const now=detectMobile()?'celular':'computador';
  openModal('APARÊNCIA','Tema e visualização',`<button type="button" class="btn guide-btn" id="guideBtn"><span>📜 Notas de Atualização & Guia Completo</span>${T3.guideNews?.()?'<span class="gd-pill">Novo</span>':''}</button><div class="field"><label>Paleta de cores</label><div class="pal-grid" role="radiogroup" aria-label="Paleta de cores">${PALETTES.map(p=>{const sw=p.id==='custom'?Object.values(customPal()):p.sw;return `<button type="button" class="pal-card ${prefs.theme===p.id?'on':''}" data-pal="${p.id}" role="radio" aria-checked="${prefs.theme===p.id}"><span class="pal-sw" aria-hidden="true">${sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span class="pal-name">${p.name}</span></button>`}).join('')}</div>
    <div class="pal-custom ${prefs.theme==='custom'?'':'hide'}" id="palCustom"><p class="sub">Escolha as cores. A mudança aparece na hora e fica guardada neste navegador.</p><div class="pal-pickers">${[['bg','Cor de fundo'],['panel','Cor dos painéis'],['text','Cor do texto principal'],['accent','Cor de destaque'],['second','Cor secundária e bordas']].map(([k,l])=>`<label class="pal-pick"><input type="color" data-cp="${k}" value="${customPal()[k]}"><span>${l}</span></label>`).join('')}</div><div class="inline"><button type="button" class="btn small" id="palReset">Voltar às cores iniciais</button><span class="sub" id="palWarn" aria-live="polite"></span></div></div></div><div class="field" style="margin-top:12px"><label>Visualização</label>${seg('view',[['auto','Automática'],['mobile','📱 Celular'],['desktop','🖥 Computador']])}<span class="sub">Detectado agora: <b>${now}</b> (${window.innerWidth}×${window.innerHeight}). “Automática” se ajusta sozinha ao girar a tela.</span></div><div class="field" style="margin-top:12px"><label>Tamanho do texto</label>${seg('text',[['normal','Normal'],['large','Grande'],['xl','Extra grande']])}</div><div class="field" style="margin-top:12px"><label>Rolagens feitas dentro da ficha</label>${seg('shareSheet',[[false,'🔒 Privadas'],[true,'🎲 Mostrar na mesa']])}<span class="sub">Em “Mostrar na mesa” elas aparecem na tela de todos e no histórico, como as da Visão de Mesa.</span></div><div class="field" style="margin-top:12px"><label>Perseus (gato assistente)</label>${seg('perseus',[[true,'🐱 Mostrar'],[false,'Esconder']])}<span class="sub">Dicas, explicações das regras e guias passo a passo.</span></div><div class="field" style="margin-top:12px"><label>Sons</label>${seg('sound',[['on','🔊 Ligados'],['low','🔉 Baixos'],['off','🔇 Desligados']])}<span class="sub">Dados, acertos, críticos, turnos e rituais.</span></div>`,'Pronto',closeModal);
  const contrast=()=>{const c=customPal(),a=hexLum(c.text),b2=hexLum(c.bg),r=(Math.max(a,b2)+.05)/(Math.min(a,b2)+.05),w=$('palWarn');if(w)w.textContent=r<4.5?'⚠ Pouco contraste entre texto e fundo: a leitura pode ficar difícil.':''};
  $$('.pal-card',$('modalBody')).forEach(b=>b.onclick=()=>{prefs.theme=b.dataset.pal;savePrefs();applyPrefs();$$('.pal-card',$('modalBody')).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',x===b)});$('palCustom').classList.toggle('hide',prefs.theme!=='custom');contrast();T3.fx?.('click')});
  $$('[data-cp]',$('modalBody')).forEach(inp=>inp.oninput=()=>{prefs.customPalette={...customPal(),[inp.dataset.cp]:inp.value};prefs.theme='custom';savePrefs();applyPrefs();contrast();const card=$q('.pal-card[data-pal="custom"] .pal-sw',$('modalBody'));if(card)card.innerHTML=Object.values(customPal()).map(c=>`<i style="background:${c}"></i>`).join('')});
  const pr=$('palReset');if(pr)pr.onclick=()=>{prefs.customPalette={...CUSTOM_DEF};savePrefs();applyPrefs();$$('[data-cp]',$('modalBody')).forEach(i=>i.value=CUSTOM_DEF[i.dataset.cp]);contrast()};
  contrast();
  const gb=$('guideBtn');if(gb)gb.onclick=()=>T3.openGuide?.();
  $$('.t3-seg button',$('modalBody')).forEach(b=>b.onclick=()=>{
    const key=b.parentElement.dataset.pref;let v=b.dataset.v;if(v==='true')v=true;if(v==='false')v=false;
    prefs[key]=v;savePrefs();applyPrefs();T3.perseusApply?.();if(key==='sound')T3.fx?.('confirm');
    $$('button',b.parentElement).forEach(x=>x.classList.toggle('on',x===b));
  });
}
T3.openSettings=openSettings;
function initTheme(){
  const mk=(cls)=>{const w=document.createElement('span');w.className='t3-themewrap '+cls;
    const t=document.createElement('button');t.className='btn small ghost t3-themebtn';t.onclick=()=>{prefs.theme=document.body.classList.contains('t3-dark')?'light':'dark';savePrefs();applyPrefs()};
    const s=document.createElement('button');s.className='btn small ghost t3-setbtn';s.textContent='⚙ Aparência';s.onclick=openSettings;
    w.append(t,s);return w};
  $q('.top-actions').prepend(mk('in-top'));
  const brand=$q('.portal-brand');if(brand)brand.appendChild(mk('in-portal'));
  applyPrefs();
  window.addEventListener('resize',()=>{clearTimeout(initTheme.t);initTheme.t=setTimeout(applyPrefs,120)});
  window.addEventListener('orientationchange',()=>setTimeout(applyPrefs,200));
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(prefs.theme==='auto')applyPrefs()});
}
T3.initTheme=initTheme;

