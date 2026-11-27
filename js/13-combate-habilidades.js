/* ===== TULPA · ETAPA 3 — habilidades, rituais, efeitos e combate ===== */
const CB={pending:{},seen:new Set(),log:[],promptQueue:[],prompting:false,loadedFor:null,popupQ:[],popupTimer:null};
const TURN={key:'',actionUsed:false,talentUsed:false};
window.T3.CB=CB;
const chars3=()=>camp3()?.characters||[];
const charById=id=>chars3().find(c=>c.id===id);
const nm=ch=>ch?.data?.name||'Personagem';
const myLabel=()=>role3()==='master'?'Mestre':(window.tulpaCloudUser?.user_metadata?.display_name||window.tulpaCloudUser?.email?.split('@')[0]||'Jogador');

/* ---------- modal com promessa e cancelamento ---------- */
let _modalResolve=null;
function askModal(eyebrow,title,body,confirmText){
  return new Promise(res=>{_modalResolve=res;openModal(eyebrow,title,body,confirmText,()=>{closeModal();const r=_modalResolve;_modalResolve=null;r&&r(true)})});
}
function _cancelModal(){closeModal();if(_modalResolve){const r=_modalResolve;_modalResolve=null;r(false)}}
['modalX','modalCancel'].forEach(id=>$(id).onclick=_cancelModal);
$('modalWrap').onclick=e=>{if(e.target===$('modalWrap'))_cancelModal()};

/* ---------- inserção de linhas (transporte via campaign_rolls) ---------- */
async function insertRow(ch,skill,{dice=[],bonus=0,total=0,attribute=null,detail={}}={}){
  const c=camp3();if(!c||!sb())throw new Error('Abra uma campanha antes.');
  const row={campaign_id:c.id,character_id:ch?.id||null,character_name:nm(ch),roller_id:uid3(),roller_label:myLabel(),skill,attribute,dice,bonus,total,detail};
  const {data:saved,error}=await sb().from('campaign_rolls').insert(row).select('*').single();
  if(error)throw error;
  processRow(saved,true);return saved;
}
const fail3=(w,e)=>{console.error('[T3] '+w,e);toast((e?.message||'erro')+' ('+w+')')};

/* ---------- alvos ---------- */
function statusChips(d){return(d?.statuses||[]).map(s=>{const id=typeof s==='string'?s:s.id;const t=id==='agonia'?(typeof s==='object'?(s.turns??3):(d.dying??3)):null;const tl=s&&s.turnsLeft?' · '+s.turnsLeft+' turno(s)':'',sn=id==='sonolento'?' ('+(Number(s?.fails)||0)+'/3)':'';return `<span class="tag t3-chip-bad">${esc(STATUS_BY_ID[id]?.name||id)}${t!==null?' · '+t+' turno(s)':''}${tl}${sn}${s&&s.suspended?' (suspenso)':''}</span>`}).join('')}
function pickTargets({title='Escolher alvos',hint='',multi=true,preset=[],exclude=[],onlyScene=true,statusSelect=false,suggest='',dmgInfo=null,only=null,skipDead=false}={}){
  const list=chars3().filter(c=>!exclude.includes(c.id)&&(!onlyScene||inScene(c))&&(!only||only.includes(c.id))&&!(skipDead&&isDeadCh(c)));
  if(!list.length){toast('Não há personagens na cena.');return Promise.resolve(null)}
  const body=`${hint?`<p class="sub">${hint}</p>`:''}<div class="t3-pick">${list.map(c=>`<label class="t3-pickrow"><input type="${multi?'checkbox':'radio'}" name="t3pick" value="${c.id}" ${preset.includes(c.id)?'checked':''}><span><b>${esc(nm(c))}</b> ${c.id===activeCharacterId?'<span class="pill">você</span>':''} <span class="sub">${esc(c.ownerLabel||'')}${controls(c)&&role3()==='master'&&(!c.ownerId||c.ownerId===uid3())?' · NPC':''}</span><div class="inline">${statusChips(c.data)}</div></span><span class="pill">VT ${(c.data?.hideStats&&role3()!=='master'&&c.ownerId!==uid3())?'??':(c.data?.vital??'?')}</span></label>`).join('')}</div>${statusSelect?`<div class="field" style="margin-top:10px"><label>Aplicar estado aos alvos (opcional)</label><select id="t3pickStatus"><option value="">Nenhum</option>${STATUS_DEFS.map(s=>`<option value="${s.id}" ${s.id===suggest?'selected':''}>${s.name}</option>`).join('')}</select></div>`:''}${dmgInfo?`<div class="field" style="margin-top:10px"><label>Dano rolado: ${dmgInfo.expr} = <b>${dmgInfo.total}</b></label><select id="t3pickDmg"><option value="full">Aplicar o dano total (${dmgInfo.total})</option>${dmgInfo.save?`<option value="half">Metade — alvo passou na Resistência (${Math.floor(dmgInfo.total/2)})</option>`:''}<option value="none">Não aplicar (o Mestre decide)</option></select></div>`:''}`;
  return askModal('ALVOS',title,body,'Confirmar').then(ok=>{
    if(!ok)return null;
    const ids=$$('input[name="t3pick"]:checked').map(i=>i.value);
    return{ids,status:$('t3pickStatus')?.value||'',dmgMode:$('t3pickDmg')?.value||'none'};
  });
}

/* ---------- efeitos entre personagens (fx) ---------- */
function applyFxLocal(ch,fx){
  mutateChar(ch,d=>{
    const s=dmax(d);d.statuses=d.statuses||[];d.activeEffects=d.activeEffects||[];
    (Array.isArray(fx)?fx:[fx]).forEach(f=>{
      if(f.t==='effect')d.activeEffects.push({...f.effect,id:'eff-'+rid()});
      else if(f.t==='heal')d.vital=Math.min(s.vt,(Number(d.vital)||0)+(f.n||0));
      else if(f.t==='dmg'){const wd=E.isDying(d);const r=E.applyDamageToSheet(d,f.n||0,{});if(wd&&r.final>=Math.ceil(s.vt/2))E.kill(d);else if(d.vital<=0)E.startDying(d)}
      else if(f.t==='bleedSuspend'){d.statuses.forEach(x=>{if(x.id==='sangrando')x.suspended=true})}
      else if(f.t==='flag'){d[f.k]=f.v}
      else if(f.t==='item'){E.autoPlace(d,{...f.item,id:rid()})}
      else if(f.t==='temp')d.vitalTemp=Math.max(Number(d.vitalTemp)||0,f.n||0);
      else if(f.t==='es')d.essence=Math.min(s.es,(Number(d.essence)||0)+(f.n||0));
      else if(f.t==='luc'){if(f.n<0){const r=E.applyLucidityDamage(d,-f.n);if(r.before>0&&r.after<=0)d.collapsePending=true}else d.lucidity=Math.min(s.luc,(Number(d.lucidity)||0)+(f.n||0))}
      else if(f.t==='status'){const has=d.statuses.find(x=>x.id===f.id);if(f.on&&!has)d.statuses.push({id:f.id,at:Date.now(),...(f.turns?{turnsLeft:f.turns}:{})});else if(f.on&&has&&f.turns)has.turnsLeft=Math.max(Number(has.turnsLeft)||0,f.turns);if(!f.on&&has)d.statuses=d.statuses.filter(x=>x.id!==f.id)}
    });
    if(((Number(d.vital)||0)>0||(Number(d.vitalTemp)||0)>0)&&!E.isDead(d))d.statuses=d.statuses.filter(x=>x.id!=='agonia');
  });
}
async function sendFx(ids,fx,label,ch){
  const local=[],remote=[];
  ids.forEach(id=>{const c=charById(id);if(!c)return;(controls(c)?local:remote).push(id)});
  local.forEach(id=>applyFxLocal(charById(id),fx));
  if(camp3()&&sb()){try{await insertRow(ch||charById(local[0])||charById(ids[0])||chars3()[0],'Efeito',{detail:{cmb:'fx',targets:ids,applied:local,fx,label,by:nm(ch)}})}catch(e){fail3('enviar efeito',e)}}
  if(remote.length)toast('Efeito enviado para '+remote.map(i=>nm(charById(i))).join(', ')+'.');
}
T3.sendFx=sendFx;
function onFx(row,live){
  const dt=row.detail;if(!live)return;
  if(Date.now()-Date.parse(row.created_at)>120000)return;
  (dt.targets||[]).forEach(id=>{if((dt.applied||[]).includes(id))return;const c=charById(id);if(c&&controls(c)&&(c._sheetAvailable||c.id===activeCharacterId))applyFxLocal(c,dt.fx)});
  CB.log.unshift({kind:'fx',text:dt.label||'Efeito aplicado',at:row.created_at});renderCombatUI();
}

/* ---------- habilidades ---------- */
const normTxt=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const SKILL_ALIAS={artes:'Arte',ciencia:'Ciências',mecanico:'Mecânica','resistencia mental':'Resistência'};
function parseSkillBonuses(desc){
  const out=[],re=/\+(\d+)\s+(?:temporários?\s+)?(?:em um teste de|no teste de|na perícia|em|para)\s+([^.;+]+)/gi;let m;
  while((m=re.exec(desc||''))){
    let phrase=m[2].split(/\s+(?:por|durante|até|no|na|contra|conforme|para|e\s+\+)(?=\s|$)/i)[0];
    phrase=phrase.replace(/^um teste de\s+/i,'').replace(/[\s,]+e\s*$/i,'').trim();
    phrase.split(/\s+(?:ou|e)\s+|\s*\/\s*|\s*,\s*/i).map(normTxt).forEach(p=>{
      const sk=BASE_SKILLS.find(s=>normTxt(s)===p)||SKILL_ALIAS[p];if(sk&&!out.some(o=>o.skill===sk))out.push({skill:sk,value:+m[1]})});
  }
  return out;
}
function durationOf(item){const d=(item.desc||'').toLowerCase();let m=d.match(/(?:por|durante)\s+(\d+)\s+rodadas?/);if(m)return{type:'rounds',left:+m[1]};if(/por uma rodada|por 1 rodada|no próximo turno|próximo turno/.test(d))return{type:'rounds',left:1};if(/por uma cena|durante a cena|na cena|até o fim da cena/.test(d))return{type:'scene',left:0};return{type:'once',left:0}}
function findAbility(id,d=data){const [src,i]=id.split(':');if(src==='voc')return vocations.find(v=>v.name===d.vocation)?.talents[+i];const t=tracks.find(x=>x.name===d.track&&x.archetype===d.archetype);return(t?.stages.filter(s=>s.stage<=d.stage)||[])[+i]}
function listAbilities(){
  const v=vocations.find(x=>x.name===data.vocation),t=tracks.find(x=>x.name===data.track&&x.archetype===data.archetype);
  return[...(v?v.talents.map((x,i)=>({id:'voc:'+i,item:x,src:'Vocação · '+v.name})):[]),...(t?t.stages.filter(s=>s.stage<=data.stage).map((x,i)=>({id:'track:'+i,item:x,src:'Trilha · '+t.name})):[])];
}
/* Essência + Combustão Vital */
function payEssence(cost,label){
  return new Promise(resolve=>{
    cost=Number(cost)||0;if(cost<=0||data.essence>=cost){data.essence=Math.max(0,data.essence-cost);resolve({ok:true});return}
    const missing=cost-data.essence,vigor=Number(data.attributes['Constituição'])||1,cb=E.combustao(missing,vigor);
    const usedNow=Number(data.combustaoGerada&&data.combustaoGerada.key===TURN.key?data.combustaoGerada.n:0);
    const vtCost=cb.vtCost,ok=data.vital-vtCost>0,lim=usedNow+missing<=cb.maxEsTurno;
    _modalResolve=()=>resolve({ok:false});
    openModal('ESSÊNCIA INSUFICIENTE',label,`<p>Custo: <b>${cost} ES</b> · você tem <b>${data.essence}</b>. Faltam <b>${missing} ES</b>.</p><div class="notice"><b>Combustão Vital:</b> sacrifique <b>${vtCost} VT</b> (2 por ES faltante). Ignora armadura, resistência e VT Temporário. Limite por turno: ${cb.maxEsTurno} ES (já gerou ${usedNow}). Deixa Estigmas de Sobrecarga na cena.</div>${!lim?'<p class="sub" style="color:#a33">Acima do limite fisiológico deste turno.</p>':''}${!ok?`<div class="notice t3-alert"><b>A Última Centelha:</b> pagar com o último fio de vida zera seu Vital: a ação recebe +1d20, mas você desaba Morrendo logo após. Seu VT atual é ${data.vital}.<br><button class="btn danger" id="lastSpark">Zerar meu Vital (Última Centelha)</button></div>`:''}`,ok&&lim?`Combustão (−${vtCost} VT)`:'Cancelar',()=>{
      if(!(ok&&lim)){_modalResolve=null;closeModal();resolve({ok:false});return}
      data.essence=0;data.vital-=vtCost;data.combustaoGerada={key:TURN.key,n:usedNow+missing};if(!data.statuses.some(s=>s.id==='estigmas'))data.statuses.push({id:'estigmas',at:Date.now()});
      _modalResolve=null;closeModal();save();toast('Combustão Vital: −'+vtCost+' VT');resolve({ok:true,burn:true});
    });
    setTimeout(()=>{const b=$('lastSpark');if(b)b.onclick=()=>{data.essence=0;data.vital=0;E.startDying(data);data.activeEffects.push({id:'once-'+rid(),name:'A Última Centelha',type:'once',dieDelta:1,left:0,desc:'+1d20 no teste.'});_modalResolve=null;closeModal();save();toast('A Última Centelha! Você desaba Morrendo após a ação.');resolve({ok:true,burn:true,spark:true})}},0);
  });
}
T3.payEssence=payEssence;
/* usar habilidade (substitui a ativação antiga) */
activateTalent=async function(id){
  const item=findAbility(id);if(!item)return;
  const cm=camp3()?.combat;
  if(cm?.active&&cm.phase==='active'&&TURN.key&&TURN.actor===activeCharacterId&&TURN.talentUsed){toast('Só um talento por turno.');return}
  const cost=Number(item.cost)||0,dur=durationOf(item),bon=item.effects?item.effects:parseSkillBonuses(item.desc),extras=E.parseExtras(item.desc);
  const hasFx=bon.length||extras.defense||extras.atk||extras.dodge||extras.dmg||extras.dmgDice||extras.dmgExtra||extras.resist;
  const ok=await askModal('USAR HABILIDADE',item.name,`<p>${esc(item.desc)}</p><div class="notice">Custo: <b>${cost} ES</b> · Duração: <b>${dur.type==='rounds'?dur.left+' rodada(s)':dur.type==='scene'?'até o fim da cena':'uso único / próxima aplicação'}</b>. Talentos não gastam turno.</div>${hasFx?`<div class="sub">Efeito reconhecido: ${[...bon.map(b=>b.skill+' '+sign(b.value)),extras.defense?'Defesa '+sign(extras.defense):'',extras.atk?'Ataque '+sign(extras.atk):'',extras.dodge?'Esquiva '+sign(extras.dodge):'',extras.dmg?'Dano '+sign(extras.dmg):'',extras.dmgDice?'+'+extras.dmgDice+' dado de dano':'',extras.resist?'Resistência '+extras.resist:''].filter(Boolean).join(' · ')}</div>`:'<div class="sub">Efeito narrativo: o Mestre aplica o resultado.</div>'}`,'Usar habilidade');
  if(!ok)return;
  const paid=await payEssence(cost,item.name);if(!paid.ok)return;
  const me=activeCharacterId,info=TALENT_TARGETS[`${data.vocation}::${item.name}`]||TALENT_TARGETS[item.name]||null;
  const mk=(extra)=>({id:'eff-'+rid(),name:item.name,source:id,type:dur.type,left:dur.left,desc:item.desc,...extra});
  const effects=[];
  /* bônus de perícia: consumido (e o talento desativado) assim que a rolagem usa */
  bon.forEach(b=>effects.push(mk({skill:b.skill,skills:[b.skill],value:b.value,consume:true})));
  if(extras.defense||extras.atk||extras.dodge||extras.dmg||extras.dmgDice||extras.dmgExtra||extras.resist||extras.ignoreResist)effects.push(mk({defense:extras.defense||0,atk:extras.atk||0,dodge:extras.dodge||0,dmg:extras.dmg||0,dmgDice:extras.dmgDice||0,dmgExtra:extras.dmgExtra||'',resist:extras.resist||0,ignoreResist:extras.ignoreResist||0}));
  const dmgRoll=info?.dmg?{total:rollAnn(charById(me)||{id:null,data},`${item.name} · dano ${info.dmg}`,info.dmg,'DANO')}:null;
  const heal=info&&(info.heal||info.luc)?{vital:info.heal||0,luc:info.luc?rollAnn(charById(me)||{id:null,data},`${item.name} · Lucidez ${info.luc}`,info.luc,'CURA'):0}:null;
  const others=chars3().filter(c=>inScene(c)&&c.id!==me);
  let chosen=info?(info.mode==='enemy'?[]:[me]):[me],status='',dmgMode='none';
  /* Habilidades pessoais (fora da tabela) nunca abrem a escolha de alvos. */
  if(info&&info.mode!=='self'&&camp3()&&others.length){
    const pick=await pickTargets({title:item.name,hint:(info.mode==='enemy'?'Quem é atingido? ':info.mode==='any'?'Quem é afetado? ':'Quem recebe? ')+(info.area?'Efeito em área: marque quem está narrativamente próximo.':''),multi:true,preset:info.mode==='enemy'?[]:[me],exclude:info.mode==='enemy'?[me]:[],statusSelect:!!info.status||info.mode!=='ally',suggest:info.status||'',dmgInfo:dmgRoll?{expr:info.dmg,total:dmgRoll.total,save:!!info.save}:null});
    if(pick===null){data.essence+=cost;save();toast('Uso cancelado (Essência devolvida).');return}
    chosen=pick.ids;status=pick.status;dmgMode=pick.dmgMode;
  }
  const names=ids=>ids.map(t=>nm(charById(t))).join(', ');
  const buffR=(!info||info.mode==='enemy')?[me]:(chosen.length?chosen:[me]);
  let did=false;
  if(buffR.includes(me)&&effects.length){
    data.activeEffects=data.activeEffects||[];data.activeTalents=(data.activeTalents||[]).filter(x=>x!==id);
    effects.forEach(e=>data.activeEffects.push({...e,id:'eff-'+rid()}));data.activeTalents.push(id);save();did=true;
  }
  const outros=buffR.filter(x=>x!==me);
  if(outros.length&&effects.length){await sendFx(outros,effects.map(e=>({t:'effect',effect:{...e,source:'ext:'+id}})),`${nm(charById(me))} usou ${item.name} em ${names(outros)}`,charById(me));did=true}
  if(heal&&chosen.length){const f=[];if(heal.vital)f.push({t:'heal',n:heal.vital});if(heal.luc)f.push({t:'luc',n:heal.luc});await sendFx(chosen,f,`${nm(charById(me))} usou ${item.name} em ${names(chosen)}${heal.luc?` (+${heal.luc} Lucidez)`:` (+${heal.vital} VT)`}`,charById(me));did=true}
  if(status&&chosen.length){
    /* estados que duram 1d4 turnos (Briga Tremenda, Tempero Enjoativo, Corte Preciso...) */
    const dd=info?.durDice||(/\b1d4\s+(?:turnos?|rodadas?)/i.test(item.desc||'')?'1d4':'');
    const turns=dd&&status===info?.status?rollAnn(charById(me)||{id:null,data},`${item.name} · duração ${dd}`,dd,'DURAÇÃO'):0;
    await sendFx(chosen,[{t:'status',id:status,on:true,turns}],`${nm(charById(me))} usou ${item.name}: ${STATUS_BY_ID[status].name}${turns?' por '+turns+' turno(s)':''} em ${names(chosen)}`,charById(me));did=true}
  if(info?.tempSelf){data.vitalTemp=(Number(data.vitalTemp)||0)+info.tempSelf;save();did=true;toast(item.name+': +'+info.tempSelf+' de Vital Temporário (barreira de Fé).');if(camp3())insertRow(charById(me),'Habilidade',{detail:{cmb:'log',text:`${nm(charById(me))} ergueu ${item.name}: +${info.tempSelf} VT temporário.`}}).catch(()=>{})}
  if(info?.summon){did=true;await T3.offerSummon?.(info.summon,item)}
  if(dmgRoll&&dmgMode!=='none'&&chosen.length){const n=dmgMode==='half'?Math.floor(dmgRoll.total/2):dmgRoll.total;await sendFx(chosen,[{t:'dmg',n}],`${nm(charById(me))} usou ${item.name}: ${n} de dano em ${names(chosen)}`,charById(me));did=true}
  if(!did){
    if(chosen.length&&camp3()&&info)insertRow(charById(me),'Habilidade',{detail:{cmb:'log',text:`${nm(charById(me))} usou ${item.name} em ${names(chosen)}.`}}).catch(()=>{});
    else{data.lastOneShot={name:item.name,desc:item.desc,at:Date.now()};save();if(camp3())insertRow(charById(me),'Habilidade',{detail:{cmb:'log',text:`${nm(charById(me))} usou ${item.name}.`}}).catch(()=>{})}
  }
  if(TURN.actor===activeCharacterId)TURN.talentUsed=true;
  renderTalents();renderSkills();fx3('activate');toast(item.name+' usado. −'+cost+' ES');renderCombatUI();
};

/* ---------- rituais ---------- */
renderRituals=function(){
  (data.customRituals||[]).forEach(r=>{if(!RITUALS.some(x=>x.id===r.id))RITUALS.push(r)});
  const q=($('ritualSearch')?.value||'').toLowerCase(),el=$('ritualElement')?.value||'',known=data.knownRituals||[];
  const list=RITUALS.filter(r=>(!knownOnly||known.includes(r.id))&&(!el||r.element===el)&&(!q||(r.name+' '+r.element+' '+(r.levels||[r.desc]).join(' ')).toLowerCase().includes(q)));
  $('ritualCount').textContent=known.length+' rituais conhecidos';
  $('ritualCatalog').innerHTML=list.length?list.map(r=>`<article class="ritual-card"><div class="inline" style="justify-content:space-between"><h4>${esc(r.name)}</h4><span class="pill">${r.element}</span></div><div class="inline">${r.exec?`<span class="tag">${r.exec}</span><span class="tag">alcance ${esc(r.alcance)}</span><span class="tag">alvo ${esc(r.alvo)}</span><span class="tag">${esc(r.dur)}</span>`:''}</div><p>${esc(r.levels?r.levels[0]:r.desc)}</p>${r.levels?`<details><summary class="sub">Avançada (10 ES) e Próspera (20 ES)</summary><p><b>Avançada:</b> ${esc(r.levels[1])}</p><p><b>Próspera:</b> ${esc(r.levels[2])}</p></details>`:''}<div class="inline"><button class="btn small ${known.includes(r.id)?'':'primary'}" data-learn="${r.id}">${known.includes(r.id)?'Conhecido ✓':'Aprender'}</button>${known.includes(r.id)?'<button class="btn small" data-cast="'+r.id+'">Conjurar</button><button class="btn small" data-forget="'+r.id+'" title="Remover este ritual da ficha">Esquecer</button>':''}</div></article>`).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum ritual encontrado.</div>';
  $('ritualCatalog').querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>{const id=b.dataset.learn;data.knownRituals=data.knownRituals||[];if(!data.knownRituals.includes(id))data.knownRituals.push(id);save();renderRituals()});
  $('ritualCatalog').querySelectorAll('[data-forget]').forEach(b=>b.onclick=()=>{
    if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Toque de novo para esquecer';b.style.borderColor='#c0602a';b.style.color='#b3501f';b.style.fontWeight='700';setTimeout(()=>{if(b.isConnected&&b.dataset.arm){delete b.dataset.arm;b.textContent='Esquecer';b.style.borderColor='';b.style.color='';b.style.fontWeight=''}},3500);return}
    const id=b.dataset.forget,r=RITUALS.find(x=>x.id===id);data.knownRituals=(data.knownRituals||[]).filter(x=>x!==id);save();renderRituals();try{toast(`Ritual esquecido: ${r?r.name:id}`)}catch(e){}});
  $('ritualCatalog').querySelectorAll('[data-cast]').forEach(b=>b.onclick=()=>castRitual(b.dataset.cast));
};
castRitual=async function(id){
  const r=RITUALS.find(x=>x.id===id);if(!r)return;
  if(E.computeMods(data).flags.has('semFala')&&r.exec!=='reação'){toast('Silenciado: você não consegue conjurar rituais que exijam fala.');return}
  const lv=r.levels||[r.desc,r.desc,r.desc];
  setTimeout(()=>{const t=$('ritualTier');if(t)t.textContent=lv[0]},0);
  const ok=await askModal('CONJURAÇÃO RITUALÍSTICA',r.name,`<div class="inline"><span class="tag">${esc(r.exec||'')}</span><span class="tag">${esc(r.alcance||'')}</span><span class="tag">${esc(r.dur||'')}</span></div><div class="field"><label>Potência</label><select id="ritualPower"><option value="0">Base — 5 ES</option><option value="1">Avançada — 10 ES</option><option value="2">Próspera — 20 ES</option></select></div><div id="ritualTier" class="notice"></div><p class="sub">Essência: <b>${data.essence} ES</b>.</p>`,'Conjurar');
  const power=Number(document.getElementById('ritualPower')?.value||0);
  if(!ok)return;
  const cost=[5,10,20][power],paid=await payEssence(cost,r.name);if(!paid.ok)return;
  let targets=[activeCharacterId],chosenStatus='';const au=r.auto;
  if(camp3()&&chars3().length>1&&(au||/alvo|diversos|área|aliado|grupo/i.test(r.alvo||''))){
    const max=au?.targets?.[power];
    const sug=au?.status?(power>=1&&au.statusAdv?au.statusAdv:au.status):'';
    const p=await pickTargets({title:r.name,hint:'Quem é afetado? '+(max?`(até ${max})`:'')+' Curas e estados são aplicados automaticamente.',multi:true,preset:[activeCharacterId],statusSelect:true,suggest:sug});
    if(p){targets=p.ids.length?p.ids:[activeCharacterId];chosenStatus=p.status}
  }
  const perTarget={};
  targets.forEach(t=>{perTarget[t]=[];
    if(au?.heal&&au.heal[power]&&au.heal[power]!=='0')perTarget[t].push({t:'heal',n:rollAnn(charById(activeCharacterId)||{id:null,data},`${r.name} · cura ${au.heal[power]}`,au.heal[power],'CURA')});
    if(au?.temp&&au.temp[power]&&au.temp[power]!=='0')perTarget[t].push({t:'temp',n:rollAnn(charById(activeCharacterId)||{id:null,data},`${r.name} · VT temporário ${au.temp[power]}`,au.temp[power],'CURA')});
    if(chosenStatus)perTarget[t].push({t:'status',id:chosenStatus,on:true});
  });
  for(const t of targets){if(perTarget[t].length)await sendFx([t],perTarget[t],`${nm(charById(activeCharacterId))} conjurou ${r.name} (${['Base','Avançada','Próspera'][power]}) em ${nm(charById(t))}`,charById(activeCharacterId))}
  data.ritualHistory=data.ritualHistory||[];data.ritualHistory.unshift({name:r.name,element:r.element,cost,date:new Date().toLocaleString('pt-BR')});
  save();renderRituals();fx3('cast');setTimeout(()=>{try{window.tulpaFx('cast',r.element)}catch(e){}},50);
  toast(r.name+' conjurado. −'+cost+' ES');
  if(!Object.values(perTarget).some(a=>a.length)&&camp3())insertRow(charById(activeCharacterId),'Ritual',{detail:{cmb:'log',text:`${nm(charById(activeCharacterId))} conjurou ${r.name} (${['Base','Avançada','Próspera'][power]}).`}}).catch(()=>{});
};
document.addEventListener('change',e=>{if(e.target.id==='ritualPower'){const r=RITUALS.find(x=>x.name===$('modalTitle').textContent);const t=$('ritualTier');if(r&&t)t.textContent=(r.levels||[r.desc,r.desc,r.desc])[+e.target.value]}});

/* ---------- Sutura Bruta e Síntese Cirúrgica (automatizadas) ---------- */
const dOf=ch=>(ch.id===activeCharacterId?data:ch.data);
const stIds=d=>(d?.statuses||[]).map(s=>typeof s==='string'?s:s.id);
const isDyingCh=c=>stIds(c.data).includes('agonia');
const isDeadCh=c=>stIds(c.data).includes('morto');
const dyingTurns=c=>{const st=(c.data?.statuses||[]).find(x=>(x.id||x)==='agonia');return (typeof st==='object'?st.turns:c.data?.dying)??3};
const hasTraining=(ch,skill)=>skillCalc3({data:dOf(ch),vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},skill).base>0;
const SUP_RE=/Suprimento/i,KIT_RE=/Kit (cir[úu]rgico|m[ée]dico)/i;
const findSupply=(d,re)=>E.ensureInv(d).items.find(i=>re.test(i.name)&&i.loc!=='chao'&&(Number(i.qty)||1)>0);
function attrRoll(d,attr,m){
  const n=Math.max(1,(Number(d.attributes?.[attr])||1)+(m.attrDice[attr]||0)+m.allDice+(E.isPhysAttr(attr)?m.physDice:0));
  const dice=Array.from({length:n},()=>E.die(20)),best=Math.max(...dice);
  return{n,dice,best,bonus:0,total:best,mode:'normal'};
}
async function rescueAction(ch,kind,{spendAction=false}={}){
  const d=dOf(ch),m=E.computeMods(d),master=role3()==='master';
  const label=kind==='sutura'?'Sutura Bruta':'Síntese Cirúrgica';
  if(m.flags.has('semAgir')){toast('Neste estado você não pode agir.');return}
  if(spendAction&&actionsLeft(ch)<=0){toast('Você já usou sua ação neste turno.');return}
  if(kind==='sintese'&&!hasTraining(ch,'Medicina')){toast('A Síntese Cirúrgica exige a perícia Medicina.');return}
  const re=kind==='sutura'?SUP_RE:KIT_RE,supply=findSupply(d,re);
  if(!supply&&!master){toast(kind==='sutura'?'Falta 1 Suprimento de Emergência: adicione em Inventário › Equipamentos.':'Falta um Kit Cirúrgico ou Médico: adicione em Inventário › Equipamentos.');return}
  let tid=ch.id;
  const cands=chars3().filter(c=>!isDeadCh(c)&&(inScene(c)||c.id===ch.id));
  if(camp3()&&cands.length>1){
    const dying=cands.filter(isDyingCh).map(c=>c.id);
    const p=await pickTargets({title:label,multi:false,preset:[dying.length?dying[0]:ch.id],only:cands.map(c=>c.id),hint:'Quem será tratado? (alcance adjacente)'+(dying.length?' ☠ Há alguém Morrendo.':'')});
    if(!p||!p.ids.length)return;tid=p.ids[0];
  }
  const tc=charById(tid)||ch,self=tid===ch.id,tIds=stIds(tc.data),hard=tIds.includes('agonia')||tIds.includes('feridaexposta');
  const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},'Medicina'),medOk=hasTraining(ch,'Medicina');
  const body=kind==='sutura'
   ?`<p>Gasta 1 Suprimento de Emergência${supply?` (restam ${Number(supply.qty)||1})`:' (Mestre: sem consumo)'}. Teste <b>DT 15</b>. Não precisa de treino em Medicina.</p><div class="field"><label>Qual teste rolar</label><select id="rsTest"><option value="med" ${medOk?'selected':''}>Inteligência + Medicina (${cal.n}d20 ${sign(cal.bonus)})</option><option value="int" ${medOk?'':'selected'}>Inteligência pura (sem perícia)</option><option value="des">Destreza pura (sem perícia)</option></select></div><p class="sub">Sucesso: 2d6 + Inteligência de Vital Temporário e Sangramento suspenso até o fim da cena (+1d6 se 20+). Falha: 1d4. ${tIds.includes('agonia')?'<b>O alvo está Morrendo: o VT Temporário o tira desse estado.</b>':''}</p>`
   :`<p>Consome 1 carga de Kit Cirúrgico/Médico${supply?` (restam ${Number(supply.qty)||1})`:''}. Teste de Inteligência (Medicina).</p><div class="field"><label>Ambiente (Patamar)</label><select id="rsPat"><option value="0">Patamar 0–1 (sujo/úmido): −1d20</option><option value="2" selected>Patamar 2: sem modificador</option><option value="3">Patamar 3 (seguro): +1d20</option></select></div><label class="t3-check"><input type="checkbox" id="rsExp" ${hard?'checked':''}> Paciente com Ferida Exposta ou que caiu a 0 VT (DT 18)</label>${self?'<p class="sub">Autocirurgia: −1d20 no teste.</p>':''}<p class="sub">Quem opera fica <b>Vulnerável</b> (−1 em Destreza) e sua recuperação na próxima Trégua sofre −1 Patamar.</p>`;
  const ok=await askModal('MEDICINA DE CAMPO',`${label} · ${nm(tc)}`,body,'Realizar');
  if(!ok)return;
  const test=$('rsTest')?.value||'med',pat=Number($('rsPat')?.value||2),exp=!!$('rsExp')?.checked;
  const dt=kind==='sutura'?15:(exp?18:15);
  let r;
  if(kind==='sintese'||test==='med')r=E.rollTest(d,'Medicina',SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,extraDice:kind==='sintese'?((pat<=1?-1:pat>=3?1:0)+(self?-1:0)):0,disadv:cal.dis});
  else r=attrRoll(d,test==='int'?'Inteligência':'Destreza',cal.mods);
  const how=(kind==='sintese'||test==='med')?'Inteligência + Medicina':test==='int'?'Inteligência pura':'Destreza pura';
  const success=r.total>=dt,big=r.total>=dt+5,intel=Number(d.attributes?.['Inteligência'])||1,stage=Number(d.stage)||1;
  showRollPopup({eyebrow:'MEDICINA',title:`${nm(ch)} · ${label}`,sub:`${how} · DT ${dt}`,sets:[{label:`${how} ${r.n||r.dice.length}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max'}],big:success?(big?'SUCESSO CRÍTICO':'SUCESSO'):'FALHA',tone:success?'ok':'hit'});
  announceRoll(ch,`${label} (${how})`,{dice:r.dice,sides:20,bonus:r.bonus,total:r.total,popup:false,eyebrow:'MEDICINA'});
  const fx=[];let txt='';
  if(kind==='sutura'){
    const t=success?rollAnn(ch,'Sutura Bruta · 2d6','2d6','CURA')+intel+(big?rollAnn(ch,'Sutura Bruta · +1d6','1d6','CURA'):0):rollAnn(ch,'Sutura Bruta · 1d4','1d4','CURA');
    fx.push({t:'temp',n:t},{t:'flag',k:'suturaAtiva',v:true});if(success)fx.push({t:'bleedSuspend'});
    txt=`${success?(big?'Sucesso (20+)':'Sucesso'):'Falha'}: +${t} de Vital Temporário${success?' e o Sangramento ficou suspenso até o fim da cena':''}.${tIds.includes('agonia')?' O alvo saiu do estado Morrendo.':''} O VT Temporário não acumula (vale o maior), absorve dano primeiro e some no fim da cena; um acerto crítico rasga os grampos.`;
  }else{
    const h=success?(big?rollAnn(ch,'Síntese · 3d8','3d8','CURA'):rollAnn(ch,'Síntese · 2d8','2d8','CURA'))+intel+stage:rollAnn(ch,'Síntese · 1d6','1d6','CURA')+intel;
    fx.push({t:'heal',n:h},{t:'flag',k:'suturaAtiva',v:false},{t:'flag',k:'suturaRompe',v:false});
    if(success){const rm=['sangrando','feridaexposta'].find(x=>tIds.includes(x));if(rm)fx.push({t:'status',id:rm,on:false});if(big)fx.push({t:'flag',k:'agoniaAnulada',v:true})}else fx.push({t:'status',id:'infeccao',on:true});
    txt=`${success?(big?'Sucesso Cirúrgico':'Sucesso Padrão'):'Falha'}: +${h} de Vital permanente${success?'':' e Infecção Tecidual (−1d20 em Constituição e Força até tratar)'}.${tIds.includes('agonia')?' O alvo saiu do estado Morrendo.':''}${big?' A Agonia Física do paciente foi anulada nesta Trégua.':''}`;
  }
  if(spendAction)spend(ch);
  const inCombat=!!(camp3()?.combat?.active&&camp3().combat.phase==='active');
  mutateChar(ch,x=>{
    const it=findSupply(x,re);if(it){it.qty=(Number(it.qty)||1)-1;if(it.qty<=0)x.inventory.items=x.inventory.items.filter(i=>i!==it)}
    if(kind==='sintese'){x.operou=true;if(inCombat&&!x.statuses.some(s=>s.id==='vulneravel'))x.statuses.push({id:'vulneravel',at:Date.now()});x.statuses=x.statuses.filter(s=>s.id!=='alerta')}
  });
  await sendFx([tid],fx,`${nm(ch)} realizou ${label} em ${nm(tc)}`,ch);
  renderCombatUI();
  openModal('RESULTADO',`${label} · ${nm(tc)}`,`<div class="roll-result"><div class="dice">${r.dice.map(x=>`<span class="die ${x===r.best?'best':'discard'}">${x}</span>`).join('')}</div><div class="bigresult">${r.total}</div><div class="sub">${how} · DT ${dt} — ${success?'sucesso':'falha'}</div><p>${esc(txt)}</p>${kind==='sintese'&&inCombat?'<p class="sub">Você ficou Vulnerável até o início do seu próximo turno.</p>':''}</div>`,'Fechar',closeModal);
}
T3.rescueAction=rescueAction;
T3.fieldMedicine=kind=>rescueAction(charById(activeCharacterId)||{id:activeCharacterId,data,vocations,tracks},kind,{});

/* ---------- processamento de linhas de combate ---------- */
function processRow(row,live=true){
  const dt=row?.detail;if(!dt?.cmb||CB.seen.has(row.id))return;CB.seen.add(row.id);
  if(dt.cmb==='atk'){
    CB.pending[dt.aid]={row,dt,targets:Object.fromEntries((dt.targets||[]).map(t=>[t.id,{}])),t:Date.parse(row.created_at)||Date.now()};
    /* só uma linha que chegou AGORA dispara a defesa. As linhas antigas (recarregar a página)
       são conferidas em loadCombatRows, depois de lidas todas as defesas e resultados. */
    if(live)(dt.targets||[]).forEach(t=>{if(defDone(dt.aid,t.id))return;const c=charById(t.id);if(c&&controls(c)&&(c._sheetAvailable||c.id===activeCharacterId)){if(dt.noDefense)doDefense(dt.aid,t.id,'none');else queuePrompt(dt.aid,t.id)}});
  }else if(dt.cmb==='def'){const p=CB.pending[dt.aid];if(p&&p.targets[dt.targetId])p.targets[dt.targetId].def=row}
  else if(dt.cmb==='res'){
    const p=CB.pending[dt.aid];if(p&&p.targets[dt.targetId])p.targets[dt.targetId].res=row;
    CB.log.unshift({kind:'res',dt,at:row.created_at});CB.log=CB.log.slice(0,30);
    if(live)T3.narrateRes?.(dt);
    if(live&&(dt.statuses||[]).includes('agonia'))toast('☠ '+dt.targetName+' está Morrendo! Sutura Bruta ou Síntese Cirúrgica podem salvá-lo.');
    if(live&&(dt.statuses||[]).includes('morto'))toast('☠ '+dt.targetName+' morreu.');
    if(live){queuePopup(dt);const att=charById(dt.attackerId);if(att&&controls(att)){if(dt.extraAtk&&TURN.actor===att.id){const dd=att.id===activeCharacterId?data:att.data;if(dd.violentKey!==TURN.key&&dd.violentRow!==row.id&&!TURN.violentGiven){TURN.violentGiven=true;mutateChar(att,d=>{d.violentKey=TURN.key;d.violentRow=row.id;d.combatExtra=1});toast('⚔ Acerto Violento: +1 Ação Padrão neste turno (só uma vez por turno).')}}}}
  }else if(dt.cmb==='mark'){CB.pending={};CB.log=[];CB.promptQueue=[]
  }else if(dt.cmb==='fx')onFx(row,live);
  else if(dt.cmb==='init'){if(live&&Date.now()-Date.parse(row.created_at)<60000){const top=(dt.rolls||[]).slice().sort((a,b)=>(b.total||0)-(a.total||0))[0];if(top)setTimeout(()=>T3.narrate?.('init',{n:top.name}),900)}if(live&&Date.now()-Date.parse(row.created_at)<60000)showRollPopup({eyebrow:'INICIATIVA',title:'Ordem de ação',sub:'Reflexo de cada participante',sets:(dt.rolls||[]).slice(0,14).map(x=>({label:x.name,dice:x.dice||[],bonus:(x.total||0)-Math.max(0,...(x.dice||[0])),total:x.total,hi:'max'}))})}
  else if(dt.cmb==='rollx'){if(live&&!dt.quiet)T3.narrateRoll?.({id:row.id,name:row.character_name,skill:row.skill,dice:row.dice,total:row.total,sides:dt.sides||20,created_at:row.created_at});if(live&&!dt.quiet&&row.roller_id!==uid3()&&Date.now()-Date.parse(row.created_at)<60000)showRollPopup({d20:(dt.sides||20)===20,eyebrow:dt.eyebrow||'ROLAGEM',title:`${row.character_name} · ${row.skill}`,sets:[{label:`${(row.dice||[]).length}d${dt.sides||20}`,dice:row.dice||[],bonus:row.bonus,total:row.total,hi:(dt.sides||20)===20?'max':null}],big:row.total,detail:dt.note?esc(dt.note):''})}
  else if(dt.cmb==='item')applyItemRow(dt);
  else if(dt.cmb==='log'){CB.log.unshift({kind:'log',text:dt.text,at:row.created_at});CB.log=CB.log.slice(0,30)}
  renderCombatUI();
}
window.tulpaOnCombatRow=row=>processRow(row,true);
function applyItemRow(dt){
  if(dt.op==='add'&&dt.item&&!T3.items.campaign.some(x=>x.id===dt.item.id))T3.items.campaign.push(dt.item);
  if(dt.op==='del'&&dt.item)T3.items.campaign=T3.items.campaign.filter(x=>x.id!==dt.item.id);
  try{if($('addList'))renderAddList()}catch(e){}
}
/* Itens da campanha: tabela própria campaign_items (só quem criou ou o Mestre apagam).
   Se o banco ainda não tiver a tabela, usa o jeito antigo (linhas no histórico de rolagens). */
const noTable=e=>e&&(e.code==='42P01'||e.code==='PGRST205'||e.code==='PGRST202'||/campaign_items/i.test(e.message||''));
const notMesaRow=r=>!String(r?.item_key||'').startsWith('mesa~');
const rowToItem=r=>({...(r.item||{}),id:r.item_key,byId:r.created_by,by:(r.item&&r.item.by)||r.creator_label||'—'});
async function loadItemRows(force=false){
  const c=camp3();if(!c||!sb()||(!force&&T3.items.loadedFor===c.id))return;T3.items.loadedFor=c.id;
  try{
    const {data:rows,error}=await sb().from('campaign_items').select('*').eq('campaign_id',c.id).not('item_key','like','mesa~%').order('created_at',{ascending:true}).limit(1000);
    if(error)throw error;
    T3.items.mode='table';T3.items.campaign=(rows||[]).filter(notMesaRow).map(rowToItem);
    if(T3.items.chFor!==c.id){
      try{if(T3.items.ch)sb().removeChannel(T3.items.ch)}catch(e){}
      T3.items.chFor=c.id;
      T3.items.ch=sb().channel('tulpa-items-'+c.id).on('postgres_changes',{event:'*',schema:'public',table:'campaign_items',filter:'campaign_id=eq.'+c.id},p=>{
        if(String(p.new?.item_key||p.old?.item_key||'').startsWith('mesa~'))return; /* estado da Visão de Mesa (reserva), não é item */
        if(p.eventType==='DELETE'){const k=p.old?.item_key;if(k)T3.items.campaign=T3.items.campaign.filter(x=>x.id!==k);else{loadItemRows(true);return}}
        else if(p.new){const it=rowToItem(p.new);T3.items.campaign=T3.items.campaign.filter(x=>x.id!==it.id).concat(it)}
        try{if($('addList'))renderAddList()}catch(e){}
      }).subscribe();
    }
  }catch(e){
    if(!noTable(e)){console.warn('[T3] itens da campanha',e);return}
    T3.items.mode='legacy';T3.items.campaign=[];
    try{const {data:rows,error}=await sb().from('campaign_rolls').select('*').eq('campaign_id',c.id).eq('detail->>cmb','item').order('created_at',{ascending:true}).limit(500);
      if(error)throw error;(rows||[]).forEach(r=>{CB.seen.add(r.id);applyItemRow({...r.detail,item:r.detail.item&&{...r.detail.item,byId:r.detail.item.byId||r.roller_id}})})}catch(e2){console.warn('[T3] itens da campanha (antigo)',e2)}
  }
  try{if($('addList'))renderAddList()}catch(e){}
}
T3.loadItemRows=loadItemRows;
T3.shareItem=async(op,item)=>{
  const c=camp3();if(!c||!sb())return true;
  if(T3.items.mode!=='legacy'){
    if(op==='add'){
      const {error}=await sb().from('campaign_items').insert({campaign_id:c.id,item_key:item.id,item,creator_label:myLabel()});
      if(!error)return true;
      if(!noTable(error)){fail3('salvar item na campanha',error);return false}
      T3.items.mode='legacy';
    }else{
      const {data:gone,error}=await sb().from('campaign_items').delete().eq('campaign_id',c.id).eq('item_key',item.id).select('id');
      if(!error){if(!(gone||[]).length){toast('Só quem criou o item ou o Mestre pode apagá-lo.');loadItemRows(true);return false}return true}
      if(!noTable(error)){fail3('apagar item',error);loadItemRows(true);return false}
      T3.items.mode='legacy';
    }
  }
  const ch=chars3().find(x=>x.id===activeCharacterId)||chars3().find(controls);if(!ch)return false;
  try{await insertRow(ch,'Item',{detail:{cmb:'item',op,item}});return true}catch(e){console.warn('[T3] compartilhar item',e);return false}
};
T3.shareSheetRoll=async(skill,r)=>{
  if(!T3.prefs.shareSheet||!camp3()||!sb())return;const ch=charById(activeCharacterId);if(!ch)return;
  try{await sb().from('campaign_rolls').insert({campaign_id:camp3().id,character_id:ch.id,character_name:nm(ch),roller_id:uid3(),roller_label:myLabel(),skill:skill+(r.calc.attr!==r.calc.std?' ('+r.calc.attr+')':''),attribute:r.calc.attr||SKILL_ATTR[skill],dice:r.dice,bonus:r.bonus,total:r.total,detail:{best:r.best,base:r.calc.base,persistent:r.calc.persistent,talent:r.calc.once,team:r.calc.team}})}catch(e){console.warn('[T3] compartilhar rolagem',e)}
};
async function loadCombatRows(){
  const c=camp3();if(!c||!sb()||CB.loadedFor===c.id)return;CB.loadedFor=c.id;
  CB.pending={};CB.log=[];
  const since=new Date(Date.now()-4*3600e3).toISOString();
  try{
    const {data:rows,error}=await sb().from('campaign_rolls').select('*').eq('campaign_id',c.id).gte('created_at',since).not('detail->>cmb','is',null).order('created_at',{ascending:true}).limit(300);
    if(error)throw error;
    (rows||[]).forEach(r=>processRow(r,false));
    resumePending();renderCombatUI();
  }catch(e){console.error('[T3] carregar combate',e)}
}
/* Defesas já respondidas neste aparelho (sobrevive ao F5, mesmo que a linha ainda não tenha chegado ao banco) */
const DEFKEY=()=>'tulpa_def_'+(camp3()?.id||'x');
function defDoneSet(){try{return new Set(JSON.parse(localStorage.getItem(DEFKEY())||'[]'))}catch(e){return new Set()}}
const defDone=(aid,tid)=>defDoneSet().has(aid+'|'+tid);
function markDefDone(aid,tid){try{const s=[...defDoneSet(),aid+'|'+tid].slice(-80);localStorage.setItem(DEFKEY(),JSON.stringify(s))}catch(e){}}
/* Depois de reler o histórico: só reabre a defesa de um ataque do combate ATUAL que ainda não
   tem nenhuma linha de defesa ou de resultado e que este aparelho ainda não respondeu. */
function resumePending(){
  const cm=camp3()?.combat;if(!cm?.active||cm.phase!=='active')return;
  Object.entries(CB.pending).forEach(([aid,p])=>{
    if(Date.now()-p.t>600000)return;
    (p.dt.targets||[]).forEach(t=>{
      const st=p.targets[t.id]||{};if(st.def||st.res||defDone(aid,t.id))return;
      const c=charById(t.id);if(!c||!controls(c)||!(c._sheetAvailable||c.id===activeCharacterId))return;
      if(p.dt.noDefense)doDefense(aid,t.id,'none');else queuePrompt(aid,t.id);
    });
  });
}
T3._resumePending=resumePending;T3._defDone=defDone;

/* ---------- popup de resultado ---------- */
const RQ={q:[],timer:null};
const diceHtml=(dice,hi)=>{const a=(dice||[]).map(Number),best=hi==='max'&&a.length?Math.max(...a):null;return a.map(x=>`<span class="die ${hi==='max'?(x===best?'best':'discard'):''}">${x}</span>`).join('')};
const setHtml=o=>`<div class="t3-set"><div class="t3-setlabel">${esc(o.label)}</div><div class="dice">${diceHtml(o.dice,o.hi)}${o.bonus?`<span class="rh-bonus" style="font-weight:800">${sign(o.bonus)}</span>`:''}</div><div class="t3-settotal">${o.total}</div>${o.note?`<div class="rp-detail">${esc(o.note)}</div>`:''}</div>`;
function showRollPopup(o){RQ.q.push(o);if(!$('t3Roll')?.classList.contains('show'))nextRoll()}
function nextRoll(){
  clearTimeout(RQ.timer);let p=$('t3Roll');
  if(!p){p=document.createElement('div');p.id='t3Roll';p.onclick=nextRoll;document.body.appendChild(p)}
  const o=RQ.q.shift();if(!o){p.classList.remove('show');return}
  p.className='show '+(o.tone||'');
  p.innerHTML=`<div class="rp-eyebrow">${esc(o.eyebrow||'ROLAGEM')}</div><div class="rp-title">${esc(o.title||'')}</div>${o.sub?`<div class="rp-sub">${esc(o.sub)}</div>`:''}${(o.sets||[]).map(setHtml).join('')}${o.big!=null?`<div class="bigresult">${esc(o.big)}</div>`:''}${o.detail?`<div class="rp-detail">${o.detail}</div>`:''}<div class="rp-hint">Toque para fechar</div>`;
  if(window.tulpaRollFx)window.tulpaRollFx(p,{d20:!!o.d20,crit:o.crit,fumble:o.fumble,tone:{bad:'violent',hit:'hit',ok:o.block?'block':'dodge'}[o.tone]||'',who:String(o.title||'').split(/ · | ⚔ /)});else fx3(o.tone==='bad'||o.tone==='hit'?'error':'confirm');
  try{navigator.vibrate&&navigator.vibrate(o.tone==='bad'?[80,40,80]:35)}catch(e){}
  RQ.timer=setTimeout(nextRoll,RQ.q.length?3800:10000);
}
/* mostra a rolagem na tela e a registra no histórico da mesa */
async function announceRoll(ch,label,{dice=[],sides=20,bonus=0,total=0,note='',share=true,popup=true,eyebrow='ROLAGEM'}={}){
  const c=ch||{id:null,data};
  if(popup)showRollPopup({d20:sides===20,eyebrow,title:`${nm(c)} · ${label}`,sets:[{label:`${dice.length}d${sides}`,dice,bonus,total,hi:sides===20?'max':null}],big:total,detail:note?esc(note):''});
  if(share&&camp3()&&sb()&&c.id){try{await insertRow(c,label,{dice,bonus,total,detail:{cmb:'rollx',sides,note,eyebrow}})}catch(e){console.warn('[T3] histórico',e)}}
}
function rollAnn(ch,label,expr,eyebrow='ROLAGEM'){const pd=E.parseDice(expr),rr=E.rollExpr(expr);announceRoll(ch,label,{dice:rr.rolls,sides:pd.s,bonus:rr.mod,total:rr.total,eyebrow});return rr.total}
T3.announceRoll=announceRoll;
function queuePopup(dt){
  const sets=[{label:`Ataque · ${dt.atk?.skill||''}`,dice:dt.atk?.dice||[],bonus:dt.atk?.bonus||0,total:dt.ATA,hi:'max'},{label:`${dt.def?.skill||'Defesa'}${dt.DF>10?' · DF '+dt.DF:''}`,dice:dt.def?.dice||[],bonus:dt.def?.bonus||0,total:dt.RF,hi:'max'}];
  const di=dt.dmgInfo;
  if(dt.hit&&di)sets.push({label:`Dano ${di.dado}${di.usedCrit?' (crítico: dados rolados 2×)':''}`,dice:[...di.normal,...(di.usedCrit?di.crit:[])],bonus:di.flat,total:di.total,note:dt.dmg.final!==di.total?`Após absorção/resistência: ${dt.dmg.final}`:''});
  showRollPopup({crit:!!(dt.crit&&dt.hit),fumble:false,block:dt.outcome==='defesa',eyebrow:'CONFRONTO',title:`${dt.attackerName} ⚔ ${dt.targetName}`,sub:dt.weapon,sets,big:dt.label+(dt.crit?' · CRÍTICO':''),tone:{esquiva:'ok',defesa:'ok',retaliacao:'ok',normal:'hit',violento:'bad'}[dt.outcome],
    detail:esc(dt.text)+(dt.hit?`<br><b>${dt.dmg.final} de dano</b>${dt.statuses?.length?' · '+dt.statuses.map(x=>esc(STATUS_BY_ID[x]?.name||x)).join(', '):''}`:'')+(dt.notes||[]).map(n=>`<br><span class="sub">${esc(n)}</span>`).join('')});
}
const miniDice=(dice,hi)=>{const a=(dice||[]).map(Number),b=hi&&a.length?Math.max(...a):null;return `<span class="t3-mini">${a.map(x=>`<i class="${hi&&x===b?'best':''}">${x}</i>`).join('')}</span>`};
window.tulpaHistItem=r=>{
  const d=r.detail||{},hh=new Date(r.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),di=d.dmgInfo;
  return `<div class="roll-hist-item t3-hist"><div><span class="rh-name">⚔ ${esc(d.attackerName)} → ${esc(d.targetName)}</span> <span class="rh-skill">${esc(d.weapon)} · ${esc(d.label)}${d.crit?' · CRÍTICO':''}</span></div><div class="t3-histdice"><div><small>ATAQUE ${esc(d.atk?.skill||'')}</small>${miniDice(d.atk?.dice,true)}<b>${d.ATA}</b></div><div><small>${esc((d.def?.skill||'DEFESA').toUpperCase())}${d.DF>10?' · DF '+d.DF:''}</small>${miniDice(d.def?.dice,true)}<b>${d.RF}</b></div>${d.hit&&di?`<div><small>DANO ${esc(di.dado)}${di.usedCrit?' ×2':''}</small>${miniDice([...di.normal,...(di.usedCrit?di.crit:[])],false)}${di.flat?`<span class="rh-bonus">${sign(di.flat)}</span>`:''}<b>${d.dmg.final}</b></div>`:''}</div><div class="rh-meta">${hh} · ${esc(d.text||'')}</div></div>`;
};

/* ---------- defesa ---------- */
function queuePrompt(aid,tid){if(CB.promptQueue.some(x=>x.aid===aid&&x.tid===tid))return;CB.promptQueue.push({aid,tid});setTimeout(nextPrompt,150)}
async function nextPrompt(){
  if(CB.prompting||!CB.promptQueue.length)return;
  if($('modalWrap').classList.contains('open'))return setTimeout(nextPrompt,1200);
  const {aid,tid}=CB.promptQueue.shift();CB.prompting=true;
  try{await defendPrompt(aid,tid)}catch(e){fail3('defesa',e)}
  CB.prompting=false;setTimeout(nextPrompt,300);
}
async function defendPrompt(aid,tid){
  const p=CB.pending[aid],ch=charById(tid);if(!p||!ch||p.targets[tid]?.def||p.targets[tid]?.res)return;
  const d=ch.id===activeCharacterId?data:ch.data,m=E.computeMods(d);
  const forced=m.flags.has('semDefender')||m.flags.has('semAgir')||m.flags.has('semEsquivar');
  const reflexOnly=p.dt.surprise||d.combatSurprised;
  const di=E.defenseInfo(d);
  const rx=forced?[]:reactionsFor(ch,d);
  const rxHtml=rx.length?`<div class="field" style="margin-top:8px"><label>Reação instantânea (opcional, paga Essência)</label><select id="defReact"><option value="">Nenhuma</option>${rx.map(x=>`<option value="${x.id}">${esc(x.name)} — ${x.cost} ES · ${esc(x.hint)}</option>`).join('')}</select></div>`:'';
  const body=`<div class="notice t3-alert"><b>${esc(p.dt.attackerName)}</b> ataca <b>${esc(nm(ch))}</b> com <b>${esc(p.dt.weapon.name)}</b>!</div><p>${forced?'Você <b>não pode se defender</b> neste estado.':reflexOnly?'Você foi pego desprevenido: role <b>Reflexo</b>.':'Se você está vendo o ataque role <b>Esquiva</b>; se foi pego desprevenido role <b>Reflexo</b>.'}</p><p class="sub">Sua Defesa (DF): ${di.DF} · Defesa Base 10${di.hasDefense?' · o equipamento pode bloquear o golpe':''}. ${m.disadv.size||m.disadvSkills.size?'Há desvantagens em vigor.':''}</p>${forced?'':`<div class="inline">${reflexOnly?'':'<button class="btn primary" id="defEsq">🎲 Esquiva (estou vendo)</button>'}<button class="btn ${reflexOnly?'primary':''}" id="defRef">🎲 Reflexo (desprevenido)</button></div>`}${rxHtml}${di.hasDefense?`<p class="sub">${E.protProficient(d)?'Proficiente nas proteções vestidas.':'Sem proficiência na proteção: a retaliação só vem se a rolagem superar a sua DF.'}</p>`:''}`;
  const label=forced?'Sofrer o ataque':(reflexOnly?'Rolar Reflexo':'Rolar Esquiva');
  const dflt=forced?'none':reflexOnly?'reflexo':'esquiva';
  const rv=()=>$('defReact')?.value||'';
  openModal('VOCÊ ESTÁ SENDO ATACADO',nm(ch),body,label,()=>{const x=rv();closeModal();doDefense(aid,tid,x==='brecha'?'none':dflt,false,x)});
  setTimeout(()=>{const e=$('defEsq'),r=$('defRef');if(e)e.onclick=()=>{const x=rv();closeModal();doDefense(aid,tid,x==='brecha'?'none':'esquiva',false,x)};if(r)r.onclick=()=>{const x=rv();closeModal();doDefense(aid,tid,x==='brecha'?'none':'reflexo',false,x)}},0);
}
/* uma defesa por ataque e por alvo: nunca roda duas vezes, nem em paralelo, nem depois do resultado */
async function doDefense(aid,tid,mode,byMaster=false,react=''){
  const p=CB.pending[aid],t=p&&(p.targets[tid]=p.targets[tid]||{});
  if(!p||!charById(tid)||t.def||t.res||t.busy)return;
  t.busy=true;markDefDone(aid,tid);
  try{return await doDefenseNow(aid,tid,mode,byMaster,react)}finally{t.busy=false}
}
async function doDefenseNow(aid,tid,mode,byMaster=false,react=''){
  const p=CB.pending[aid],ch=charById(tid);if(!p||!ch||p.targets[tid]?.def||p.targets[tid]?.res)return;
  const d=ch.id===activeCharacterId?data:ch.data,m=E.computeMods(d),di=E.defenseInfo(d);
  let rxDef=react?reactionsFor(ch,d).find(x=>x.id===react):null;
  if(rxDef){mutateChar(ch,x=>{x.essence=Math.max(0,(Number(x.essence)||0)-rxDef.cost)});toast(rxDef.name+'! −'+rxDef.cost+' ES');fx3('activate');if(rxDef.el)setTimeout(()=>{try{window.tulpaFx('cast',rxDef.el)}catch(e){}},40)}
  let r=null,detail={cmb:'def',aid,targetId:tid,mode,df:di.DF,armored:di.armored,prof:E.protProficient(d),react:rxDef?rxDef.id:'',canDefend:mode!=='none'||!!rxDef};
  if(mode==='none')return insertRow(ch,'Sem defesa',{dice:[],bonus:0,total:0,detail}).then(row=>resolveFor(aid,tid,row)).catch(e=>fail3('defesa',e));
  const skill=mode==='reflexo'?'Reflexo':'Esquiva';
  const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},skill);
  r=E.rollTest(d,skill,SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis,consumeDelta:true});fx3('dice');
  mutateChar(ch,x=>consumeOnce(x,cal));
  showRollPopup({eyebrow:'DEFESA',title:`${nm(ch)} · ${skill}`,sub:`DF ${di.DF}`,sets:[{label:`${skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max',note:r.mode!=='normal'?r.mode:''}],big:r.total,detail:'Aguardando o resultado do confronto…'});
  const row=await insertRow(ch,skill+(byMaster?' (pelo Mestre)':''),{dice:r.dice,bonus:r.bonus,total:r.total,attribute:'Destreza',detail:{...detail,best:r.best}});
  await resolveFor(aid,tid,row);
}
async function resolveFor(aid,tid,defRow){
  const p=CB.pending[aid],ch=charById(tid);if(!p||!ch)return;
  const a=p.dt,dd=defRow.detail,canDefend=dd.canDefend!==false;
  const crit=(a.best>=a.weapon.critMin);
  const sumN=a.dmg.normal.reduce((x,y)=>x+y,0),dmgInfo={dado:a.weapon.dado,normal:a.dmg.normal,crit:a.dmg.crit,usedCrit:false,flat:a.dmg.total-sumN,total:a.dmg.total};
  const dT=ch.id===activeCharacterId?data:ch.data,targetDown=E.isDying(dT)||E.isDead(dT),nat20=a.best===20;
  /* cobertura parcial (mapa tático): +N na defesa de quem está atrás de uma quina */
  const cov=Math.max(0,Number(a.cover)||0),RFc=canDefend?defRow.total+cov:0;
  let res=E.resolveAttack({ATA:p.row.total,RF:RFc,DB:10,DF:dd.df,canDefend:canDefend&&!targetDown,crit:crit||nat20,nat20,targetDown,proficient:dd.prof!==false,armored:dd.armored});
  const out={final:0,absorbed:0,resisted:0,notes:[]},stAdd=[];
  /* reações instantâneas do defensor */
  const atkView={skill:a.weapon.skill,dice:p.row.dice||[],bonus:p.row.bonus||0,total:p.row.total};let critNow=crit;
  if(dd.react==='brecha'&&!targetDown){res={...res,outcome:'esquiva',hit:false,crit:false,forced:false,extraAtk:0,extraDef:0,label:'Brecha Rápida',text:'Uma brecha na realidade se abre: o defensor se teleporta até 5 m e a ameaça é negada.'};out.notes.push('Reação: Brecha Rápida (Inexistência).')}
  if(dd.react==='duplica'&&res.hit&&!targetDown){const c2=E.die(2);announceRoll(ch,'Duplica Efêmera (1d2)',{dice:[c2],sides:2,total:c2,eyebrow:'REAÇÃO',note:c2===1?'O atacante acertou a ilusão':'O atacante achou o verdadeiro'});if(c2===1){res={...res,outcome:'esquiva',hit:false,crit:false,forced:false,extraAtk:0,label:'Duplica Efêmera',text:'O golpe atravessou a duplicata ilusória. O Mestre pode pedir Percepção ao atacante para discernir.'}}out.notes.push(`Reação: Duplica Efêmera (1d2 = ${c2}).`)}
  if(dd.react==='desvio'&&res.hit){
    const n=Math.max(1,(p.row.dice||[]).length),dice2=Array.from({length:n},()=>E.die(20)),best2=Math.max(...dice2),ATA2=best2+(p.row.bonus||0);
    announceRoll(ch,'Desvio Improvável · ataque repetido',{dice:dice2,sides:20,bonus:p.row.bonus||0,total:ATA2,eyebrow:'REAÇÃO'});
    critNow=best2>=a.weapon.critMin;
    res=E.resolveAttack({ATA:ATA2,RF:RFc,DB:10,DF:dd.df,canDefend:canDefend&&!targetDown,crit:critNow||best2===20,nat20:best2===20,targetDown,proficient:dd.prof!==false,armored:dd.armored});
    Object.assign(atkView,{dice:dice2,total:ATA2});out.notes.push(`Reação: Desvio Improvável — o atacante repetiu o ataque (${p.row.total} → ${ATA2}).`);
  }
  if(res.forced)out.notes.push('20 natural: o ataque sempre acerta, independentemente de bônus ou defesa.');
  const hadAlert=(dT.statuses||[]).some(x=>(x.id||x)==='alerta');
  if(res.hit||hadAlert){
    let base=critNow?a.dmg.critTotal:a.dmg.total;
    if(res.hit&&dd.react==='intervencao'){const rr=E.rollExpr('2d6');announceRoll(ch,'Intervenção Divina Menor · redução 2d6',{dice:rr.rolls,sides:6,total:rr.total,eyebrow:'REAÇÃO'});base=Math.max(0,base-rr.total);out.notes.push(`Reação: Intervenção Divina Menor reduziu o dano em ${rr.total}.`)}
    if(res.hit){dmgInfo.usedCrit=critNow;dmgInfo.total=base}
    mutateChar(ch,d=>{
      d.statuses=d.statuses||[];d.activeEffects=d.activeEffects||[];
      /* o Estado de Alerta termina assim que o personagem é atacado */
      if(d.statuses.some(x=>x.id==='alerta')){d.statuses=d.statuses.filter(x=>x.id!=='alerta');out.notes.push('O Estado de Alerta terminou (você foi atacado).')}
      if(!res.hit)return;
      if(E.isDead(d)){out.notes.push('O alvo já está morto.');return}
      const wasDying=E.isDying(d);
      const r=E.applyDamageToSheet(d,base,{ignoreResist:!!a.ignoreResist});const pre=out.notes;Object.assign(out,r);out.notes=[...pre,...(r.notes||[])];
      if(critNow&&d.suturaAtiva)d.suturaRompe=true;
      (a.weapon.effects||[]).forEach(e=>{if(e.when==='hit'||(e.when==='crit'&&critNow)){if(!d.statuses.some(s=>s.id===e.status)){d.statuses.push({id:e.status,at:Date.now()});stAdd.push(e.status)}}});
      if(a.desarme){d.activeEffects.push({id:'once-'+rid(),name:'Desarmado',type:'once',dieDelta:-1,left:0,desc:'−1 dado na próxima jogada de ataque.'});out.notes.push('Desarme: −1 dado no próximo ataque.')}
      if(wasDying){
        /* Morrendo: golpe < metade do Vital máximo tira 1 turno na hora; ≥ metade finaliza */
        const dh=E.dyingHit(d,out.final,dmax(d).vt);
        if(dh){if(dh.dead){stAdd.push('morto');out.notes.push(dh.reason==='half'?'Já estava Morrendo e o golpe tirou metade ou mais do Vital máximo: FINALIZADO.':'O golpe tirou o último turno de quem estava Morrendo: FINALIZADO.')}else out.notes.push(`Morrendo: o golpe tira 1 turno imediatamente (restam ${dh.left}).`)}
      }else if(d.vital<=0){
        if(d.extase?.on&&d.extase.bonus==='sobrevida'&&!d.extase.sobrevidaUsada){const rr=E.die(6);d.extase.sobrevidaUsada=true;if(rr>=4){d.vital=1;out.notes.push(`Sobrevida de Êxtase (1d6=${rr}): permanece de pé com 1 VT.`)}else out.notes.push(`Sobrevida falhou (1d6=${rr}).`)}
        if(d.vital<=0&&E.startDying(d)){stAdd.push('agonia');out.notes.push('Caiu a 0 VT: Morrendo — 3 turnos para ser estabilizado (Sutura Bruta ou Síntese Cirúrgica).')}
      }
    });
  }
  if(a.noDefense)res={...res,extraAtk:0};
  if(res.extraDef){const dk=TURN.key||('r'+(camp3()?.combat?.round||0));const rg=(CB.retalGiven=CB.retalGiven||{}),rk=ch.id+'|'+dk;if(dT.retalKey!==dk&&!rg[rk]&&!(Number(dT.retalExtra)>0)){rg[rk]=1;mutateChar(ch,d=>{d.retalKey=dk;d.retalExtra=1;d.retalTarget=a.attackerId})}else{res={...res,extraDef:0};out.notes.push('Retaliação já usada neste turno: sem nova ação extra.')}}
  if(cov&&canDefend)out.notes.push(`Cobertura parcial: +${cov} na defesa.`);
  const detail={cmb:'res',cover:cov,aid,targetId:tid,targetName:nm(ch),attackerId:a.attackerId,attackerName:a.attackerName,weapon:a.weapon.name,mode:dd.mode,outcome:res.outcome,label:res.label,text:res.text,hit:res.hit,crit:res.crit,ATA:res.ATA,RF:res.RF,DB:10,DF:dd.df,dmg:{final:out.final,absorbed:out.absorbed,resisted:out.resisted},statuses:stAdd,notes:out.notes,forced:!!res.forced,extraAtk:res.extraAtk,extraDef:res.extraDef,atk:atkView,react:dd.react||'',def:{skill:dd.mode==='reflexo'?'Reflexo':dd.mode==='none'?'Sem defesa':'Esquiva',dice:defRow.dice||[],bonus:defRow.bonus||0,total:defRow.total},dmgInfo};
  try{await insertRow(ch,'Resultado do confronto',{dice:[],bonus:0,total:out.final,detail})}catch(e){fail3('registrar resultado',e)}
}

/* ---------- turno ---------- */
function curEntry(){const cm=camp3()?.combat;if(!cm?.active||cm.phase!=='active')return null;const o=cm.order||[];return o[Math.min(cm.turnIndex||0,o.length-1)]||null}
function processTurnStart(ch){
  if(isDyingCh(ch)||isDeadCh(ch))return;
  const log=[],annos=[];
  mutateChar(ch,d=>{
    d.combatExtra=0;d.retalExtra=0;d.retalTarget=null;d.statuses=d.statuses||[];
    const dy=E.dyingTick(d);if(dy)log.push(dy.dead?'☠ MORREU: não foi estabilizado a tempo.':`Morrendo: restam ${dy.left} turno(s) para ser estabilizado.`);
    d.statuses.slice().forEach(s=>{
      const def=STATUS_BY_ID[s.id];if(!def)return;
      if(def.dot&&!E.isDead(d)&&!E.isDying(d)&&!s.suspended){let rr=null;const amt=def.dot.fixed??(rr=E.rollExpr(def.dot.dice)).total;if(rr)annos.push([def.dot.label,rr]);const r=E.applyDamageToSheet(d,amt,{ignoreResist:true,ignoreTemp:false});log.push(`${def.dot.label}: −${amt} VT`);if(d.vital<=0&&!d.statuses.some(x=>x.id==='agonia')){E.startDying(d);log.push('Caiu a 0 VT: Morrendo')}}
      if(def.untilTurn)d.statuses=d.statuses.filter(x=>x.id!==s.id);
    });
    if(d.statuses.some(s=>s.id==='atordoado')){const at=d.statuses.find(s=>s.id==='atordoado');if(!(Number(at.turnsLeft)>0))d.statuses=d.statuses.filter(s=>s.id!=='atordoado');TURN.actionUsed=true;log.push('Atordoado: perde esta ação')}
    /* estados com duração rolada (1d4): contam no início de cada turno e somem sozinhos */
    d.statuses.slice().forEach(s=>{if(Number(s.turnsLeft)>0){s.turnsLeft-=1;if(s.turnsLeft<=0){d.statuses=d.statuses.filter(x=>x!==s);log.push((STATUS_BY_ID[s.id]?.name||s.id)+' terminou')}else log.push((STATUS_BY_ID[s.id]?.name||s.id)+': resta(m) '+s.turnsLeft+' turno(s)')}});
    /* invocações duram rodadas contadas no turno de quem invocou */
    if((d.summons||[]).length){d.summons.forEach(x=>{x.roundsLeft=(Number(x.roundsLeft)||0)-1});const gone=d.summons.filter(x=>x.roundsLeft<=0||x.vt<=0);if(gone.length)log.push('Invocação dissipada: '+gone.map(x=>x.name).join(', '));d.summons=d.summons.filter(x=>x.roundsLeft>0&&x.vt>0)}
    if(d.statuses.some(s=>['paralisado','agonia','desistente','morto'].includes(s.id))){TURN.actionUsed=true;log.push('Sem condições de agir')}
    if((d.traumas||[]).some(t=>t.id==='paralisia')&&camp3()?.combat?.round===1){log.push('Trauma Paralisia: role Resistência ou perde a ação')}
    if(d.statuses.some(s=>s.id==='confuso'))log.push('Confuso: 50% de chance de agir errado');
    if(d.statuses.some(s=>s.id==='enlouquecido'))log.push('Enlouquecido: ataca alvos aleatórios');
  });
  annos.forEach(([l,rr])=>announceRoll(ch,l+' (início do turno)',{dice:rr.rolls,sides:E.parseDice(rr.expr).s,total:rr.total,eyebrow:'DANO POR TURNO'}));
  if(log.length){toast(nm(ch)+': '+log.join(' · '));insertRow(ch,'Início do turno',{detail:{cmb:'log',text:`${nm(ch)} — ${log.join(' · ')}`}}).catch(()=>{})}
}
const isDown=c=>!!c&&(isDyingCh(c)||isDeadCh(c));
function allDown(){const o=camp3()?.combat?.order||[];return o.length>0&&o.every(x=>{const c=charById(x.characterId);return !c||isDown(c)})}
function autoSkip(){
  if(role3()!=='master')return;
  const cm=camp3()?.combat,e=curEntry();if(!e||!cm)return;
  const ch=charById(e.characterId);if(!isDown(ch))return;
  const key=`${cm.round}:${cm.turnIndex}:${e.characterId}`;
  if(CB.skipKey===key||CB.skipBusy)return;
  /* ninguém de pé: não roda as rodadas sozinho (senão quem está Morrendo morreria em segundos) */
  if(allDown()){if(CB.allDownKey!==key){CB.allDownKey=key;toast('Ninguém na ordem consegue agir. Estabilize alguém ou encerre o combate.')}return}
  CB.skipKey=key;CB.skipBusy=true;
  setTimeout(async()=>{
    try{
      const cm2=camp3()?.combat,e2=curEntry();
      if(!e2||!cm2||`${cm2.round}:${cm2.turnIndex}:${e2.characterId}`!==key)return;
      const c2=charById(e2.characterId);if(!isDown(c2))return; /* foi revivido a tempo: o turno segue normal */
      const dead=isDeadCh(c2);let note='';
      if(!dead)mutateChar(c2,d=>{const dy=E.dyingTick(d);if(dy)note=dy.dead?'☠ morreu: não foi estabilizado a tempo.':`restam ${dy.left} turno(s) para ser estabilizado.`});
      const text=`⏭ Turno de ${nm(c2)} pulado (${dead?'Morto':'Morrendo'})${note?' — '+note:''}`;
      CB.log.unshift({kind:'log',text,at:new Date().toISOString()});
      insertRow(c2,'Turno pulado',{detail:{cmb:'log',text}}).catch(()=>{});
      if(note.startsWith('☠'))T3.perseusReact?.('dead');
      await window.tulpaAdvanceTurn?.(true,true);
    }catch(err){console.warn('[T3] pular turno',err)}
    finally{CB.skipBusy=false;setTimeout(()=>{try{renderCombatUI()}catch(e){}},150)}
  },1100);
}
T3.autoSkip=autoSkip;
function syncTurn(){
  const e=curEntry(),cm=camp3()?.combat;if(!e){TURN.key='';return}
  const key=`${cm.round}:${cm.turnIndex}:${e.characterId}`;
  if(key===TURN.key)return;
  TURN.key=key;TURN.actor=e.characterId;TURN.actionUsed=false;TURN.talentUsed=false;TURN.summonUsed=[];TURN.extraUsed=false;TURN.violentGiven=false;
  const ch=charById(e.characterId);
  const down=ch&&(isDyingCh(ch)||isDeadCh(ch));
  if(down){TURN.actionUsed=true;if(controls(ch))toast('⏭ Turno de '+nm(ch)+' pulado ('+(isDeadCh(ch)?'Morto':'Morrendo')+').');autoSkip();return}
  if(ch&&controls(ch)&&role3()==='player'){toast('⚔ É a sua vez, '+nm(ch)+'!');try{navigator.vibrate&&navigator.vibrate([160,70,160])}catch(e){}}
  if(ch&&controls(ch)&&(ch._sheetAvailable||ch.id===activeCharacterId))setTimeout(()=>{processTurnStart(ch);renderCombatUI()},200);
}
const retalOf=ch=>Number((ch.id===activeCharacterId?data:ch.data).retalExtra)||0;
/* quem não tem a vez só age com a Retaliação (a ação extra de defesa) */
const actionsLeft=ch=>{const isTurn=TURN.actor===ch.id;return(isTurn&&!TURN.actionUsed?1:0)+((isTurn&&TURN.extraUsed)?0:Math.min(1,Number((ch.id===activeCharacterId?data:ch.data).combatExtra)||0))+(isTurn?0:retalOf(ch))};
function spend(ch,kind='std'){
  if(kind==='retal'){mutateChar(ch,d=>{d.retalExtra=Math.max(0,(Number(d.retalExtra)||0)-1);if(!d.retalExtra)d.retalTarget=null});return}
  if(TURN.actor===ch.id&&!TURN.actionUsed){TURN.actionUsed=true;return}
  if(TURN.actor!==ch.id&&retalOf(ch)>0){spend(ch,'retal');return}
  if(TURN.actor===ch.id)TURN.extraUsed=true;
  mutateChar(ch,d=>{d.combatExtra=0});
}

/* ---------- ataque ---------- */
async function startAttack(ch,{retal=false}={}){
  const d=ch.id===activeCharacterId?data:ch.data,m=E.computeMods(d);
  if(m.flags.has('semAgir')||m.flags.has('semAtacar')){toast('Neste estado você não pode atacar.');return}
  if(retal){if(retalOf(ch)<=0){toast('Você não tem ação de retaliação.');return}}
  else if(actionsLeft(ch)<=0){toast('Você já usou sua ação neste turno.');return}
  const quick=E.quickWeapons(d),pack=E.packWeapons(d);
  const card=(w,id,tag)=>`<button class="t3-weapon" data-w="${id}"><b>${esc(w.name)}${d.favWeaponId&&d.favWeaponId===id?' ★':''}</b><span>${esc(w.skill)} · dano <b>${esc(w.dado)}</b> · crítico ${w.critMin>=20?'20':w.critMin+'-20'}${w.area?' · área':''}</span><span class="sub">${(w.effects||[]).map(e=>(STATUS_BY_ID[e.status]?.name||e.status)+' ('+(e.when==='crit'?'no crítico':'no acerto')+')').join(' · ')||'sem estado'}${tag?' · '+tag:''}</span></button>`;
  openModal('ATACAR',nm(ch),`<p class="sub">Escolha a arma do saque rápido (mãos, cintura/coldre, bandoleira) ou ataque desarmado.</p><div class="t3-weapons">${quick.map(i=>card(i.w,i.id,LOCS[i.loc])).join('')}${card(UNARMED,'__soco','1d2 · Briga')}</div>${pack.length&&!retal?`<h4 style="margin-top:12px">Sacar da mochila (gasta a ação)</h4><div class="t3-weapons">${pack.map(i=>`<button class="t3-weapon" data-draw="${i.id}"><b>${esc(i.name)}</b><span>${esc(i.w.skill)} · ${esc(i.w.dado)} · crít. ${i.w.critMin>=20?'20':i.w.critMin+'-20'}</span><span class="sub">${LOCS[i.loc]} → mãos</span></button>`).join('')}</div>`:''}${retal?'<div class="notice t3-alert">Contra-ataque de Retaliação: <b>não pode ser esquivado</b>.</div>':''}<label class="t3-check" style="margin-top:10px;${retal?'display:none':''}"><input type="checkbox" id="atkSurprise"> Ataque de surpresa (o alvo está desprevenido e só pode rolar Reflexo)</label>`,'Fechar',closeModal);
  $$('[data-w]').forEach(b=>b.onclick=async()=>{
    const surprise=!!$('atkSurprise')?.checked,id=b.dataset.w;const it0=quick.find(i=>i.id===id);const w=id==='__soco'?UNARMED:(it0?{peso:it0.peso,...it0.w,_itemId:it0.id,_ammo:!!it0.useAmmo}:null);closeModal();_modalResolve=null;
    if(!w)return;
    const area=w.area;
    const p=await pickTargets({title:'Alvo do ataque · '+w.name,hint:area?'Arma em área: marque todos os atingidos.':'Escolha o alvo (jogador ou NPC).',multi:area,exclude:[ch.id],skipDead:true,preset:retal&&d.retalTarget?[d.retalTarget]:[]});
    if(!p||!p.ids.length)return;
    await performAttack(ch,w,p.ids,{surprise,retal});
  });
  $$('[data-draw]').forEach(b=>b.onclick=()=>{
    const inv=E.ensureInv(d),it=inv.items.find(i=>i.id===b.dataset.draw);const v=E.validPlacement(d,it,'maos');
    if(!v.ok){toast('Libere as mãos antes: '+v.msg);return}
    closeModal();spend(ch);mutateChar(ch,x=>{const t=E.ensureInv(x).items.find(i=>i.id===it.id);if(t)t.loc='maos'});toast(it.name+' sacada. A ação foi gasta.');renderCombatUI();
  });
}
async function performAttack(ch,w,targetIds,{surprise=false,retal=false,noSpend=false,extra=null}={}){
  const d=ch.id===activeCharacterId?data:ch.data;
  /* munição opcional: armas de Distância marcadas gastam 1 "Munição solta" por ataque */
  if(w._ammo){const am=E.ensureInv(d).items.find(i=>/muni[çc][ãa]o/i.test(i.name)&&i.loc!=='chao'&&(Number(i.qty)||0)>0);if(!am){toast('Sem munição! Adicione "Munição solta" no inventário (Equipamentos) para recarregar.');return}}
  /* Arma Favorita (Devastador Mental / Espada do Pensamento, Estágio 10): +1 dado de dano e +2 na margem de ameaça */
  const favOn=!!w._itemId&&d.favWeaponId===w._itemId&&(Number(d.stage)||1)>=10&&['Arsenal Mental','Lâmina Psíquica'].includes(d.track);
  if(favOn)w={...w,critMin:Math.max(2,(Number(w.critMin)||20)-2)};
  let ids=targetIds.slice();const m0=E.computeMods(d),others=chars3().filter(c=>inScene(c)&&c.id!==ch.id&&!isDeadCh(c)).map(c=>c.id);
  if(m0.flags.has('alvoAleatorio')&&others.length){ids=[others[Math.floor(E.rng()*others.length)]];toast('Enlouquecido: o ataque vai para um alvo aleatório!')}
  else if(m0.flags.has('confuso')&&others.length&&(()=>{const c2=E.die(2);announceRoll(ch,'Confuso (1d2)',{dice:[c2],sides:2,total:c2,eyebrow:'ESTADO',note:c2===1?'Errou o alvo!':'Mantém o alvo'});return c2===1})()){ids=[others[Math.floor(E.rng()*others.length)]];toast('Confuso: você errou o alvo!')}
  if(m0.flags.has('soCorpoACorpo')&&w.cat!=='Corpo a corpo'&&w.skill!=='Briga'){toast('Trauma Ira: só ataques corpo a corpo.');return}
  const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},w.skill);
  /* alvo Caído: vantagem em ataques corpo a corpo */
  const melee=w.cat==='Corpo a corpo'||w.skill==='Briga',downAdv=melee&&ids.length>0&&ids.every(i=>stIds(charById(i)?.data).includes('caido'));
  const r=E.rollTest(d,w.skill,SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis,adv:downAdv,consumeDelta:true});fx3('dice');
  if(downAdv)toast('Alvo Caído: vantagem no ataque corpo a corpo.');
  /* FOR (ou DES em armas Leves e Briga) soma no dano corpo a corpo e de arremesso */
  const attrDmg=E.damageBonus(d,w);
  let flat=cal.mods.dmg+attrDmg.bonus;(d.activeEffects||[]).forEach(e=>{if(e.dmgExtra)flat+=E.rollExpr(e.dmgExtra).total});
  const ignore=(d.activeEffects||[]).some(e=>e.ignoreResist);
  const dmg=E.rollDamage(w,{extraDice:cal.mods.dmgDice+(favOn?1:0),flat});
  const aid=rid(),cm=camp3()?.combat;
  const des=d.extase?.on&&d.extase.bonus==='desarme';
  const detail={cmb:'atk',aid,round:cm?.round||0,attackerId:ch.id,attackerName:nm(ch),targets:ids.map(i=>({id:i,name:nm(charById(i))})),weapon:{name:w.name,dado:w.dado,critMin:w.critMin,skill:w.skill,cat:w.cat,area:!!w.area,effects:w.effects||[]},best:r.best,dmg:{total:dmg.total,critTotal:dmg.critTotal,normal:dmg.normal,crit:dmg.crit},surprise,ignoreResist:ignore,desarme:!!des,noDefense:!!retal,...(extra||{})};
  mutateChar(ch,x=>{consumeOnce(x,cal,{attack:true});(x.activeEffects||[]).forEach(e=>{if(e.ignoreResist&&e.type==='once')e._used=1});if(w._ammo){const am=E.ensureInv(x).items.find(i=>/muni[çc][ãa]o/i.test(i.name)&&i.loc!=='chao'&&(Number(i.qty)||0)>0);if(am){am.qty=(Number(am.qty)||1)-1;if(am.qty<=0)x.inventory.items=x.inventory.items.filter(i=>i!==am)}}});
  showRollPopup({eyebrow:retal?'RETALIAÇÃO':'ATAQUE',title:`${nm(ch)} · ${w.name}`,sub:`${w.skill} → ${detail.targets.map(t=>t.name).join(', ')}`,
    sets:[{label:`${w.skill} ${r.n}d20`,dice:r.dice,bonus:r.bonus,total:r.total,hi:'max',note:r.mode!=='normal'?r.mode:''},
          {label:`Dano ${w.dado}${flat?' '+sign(flat):''}`,dice:dmg.normal,bonus:dmg.mod+flat,total:dmg.total,note:r.best>=w.critMin?`CRÍTICO (${r.best})! Se acertar, rola de novo: [${dmg.crit.join(', ')}] → ${dmg.critTotal}`:''}],
    big:r.total,tone:r.best>=w.critMin?'hit':'',detail:(retal?'Retaliação: não pode ser esquivada.':'Aguardando a defesa…')+(downAdv?' · vantagem (alvo Caído)':'')+(favOn?' · ★ Arma Favorita':'')+(attrDmg.bonus?` · dano inclui +${attrDmg.bonus} de ${attrDmg.attr}`:'')});
  if(!noSpend)spend(ch,retal?'retal':'std');
  try{await insertRow(ch,(retal?'Retaliação · ':'Ataque · ')+w.name,{dice:r.dice,bonus:r.bonus,total:r.total,attribute:SKILL_ATTR[w.skill],detail});toast('Ataque lançado! Aguardando a defesa de '+detail.targets.map(t=>t.name).join(', ')+'.')}catch(e){fail3('atacar',e)}
  renderCombatUI();
}

/* ---------- outras ações ---------- */
async function sharedRoll(ch,skill){
  const d=ch.id===activeCharacterId?data:ch.data;
  const cal=skillCalc3({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},skill);
  const r=E.rollTest(d,skill,SKILL_ATTR,{mods:cal.mods,bonus:cal.bonus,disadv:cal.dis,consumeDelta:true});fx3('dice');
  mutateChar(ch,x=>consumeOnce(x,cal));
  try{await insertRow(ch,skill,{dice:r.dice,bonus:r.bonus,total:r.total,attribute:SKILL_ATTR[skill],detail:{best:r.best,base:cal.base,persistent:cal.persistent,talent:cal.once,team:cal.team}})}catch(e){fail3('rolar',e)}
}
function otherAction(ch){
  if(actionsLeft(ch)<=0){toast('Você já usou sua ação neste turno.');return}
  const d=ch.id===activeCharacterId?data:ch.data;
  openModal('OUTRA AÇÃO',nm(ch),`<div class="notice">Ao usar sua ação em uma perícia você fica <b>Vulnerável</b>: −1 em Destreza até o início do seu próximo turno.</div><input class="search" id="oaSearch" placeholder="Buscar perícia..." style="margin:8px 0"><div class="mesa-skill-grid" id="oaGrid"></div><div class="inline" style="margin-top:10px"><button class="btn" id="oaSheet">Abrir minha ficha</button></div>`,'Fechar',closeModal);
  const draw=()=>{const q=($('oaSearch').value||'').toLowerCase();$('oaGrid').innerHTML=BASE_SKILLS.slice().sort((a,b)=>a.localeCompare(b,'pt-BR')).filter(s=>s.toLowerCase().includes(q)).map(s=>{const k=skillCalc3({data:d,vocations,tracks},s);return `<button class="mesa-skill" data-sk="${esc(s)}"><b>${esc(s)}</b><small>${k.n}d20 ${sign(k.bonus)}</small></button>`}).join('');$$('[data-sk]',$('oaGrid')).forEach(b=>b.onclick=()=>{closeModal();_modalResolve=null;spend(ch);mutateChar(ch,x=>{if(!x.statuses.some(s=>s.id==='vulneravel'))x.statuses.push({id:'vulneravel',at:Date.now()});x.statuses=x.statuses.filter(s=>s.id!=='alerta')});sharedRoll(ch,b.dataset.sk);renderCombatUI()})};
  $('oaSearch').oninput=draw;draw();
  $('oaSheet').onclick=()=>{closeModal();spend(ch);mutateChar(ch,x=>{if(!x.statuses.some(s=>s.id==='vulneravel'))x.statuses.push({id:'vulneravel',at:Date.now()})});ensureActive(ch);showApp()};
}
function alertAction(ch){
  if(actionsLeft(ch)<=0){toast('Você já usou sua ação neste turno.');return}
  spend(ch);mutateChar(ch,d=>{if(!d.statuses.some(s=>s.id==='alerta'))d.statuses.push({id:'alerta',at:Date.now()});d.statuses=d.statuses.filter(s=>s.id!=='vulneravel')});
  toast('Estado de Alerta: +1 em Destreza até o início do seu próximo turno.');renderCombatUI();
}
function ensureActive(ch){
  if(activeCharacterId===ch.id)return true;
  if(!controls(ch)||!ch._sheetAvailable){return false}
  try{syncActiveCharacter()}catch(e){}
  activeCharacterId=ch.id;data={...blank(),...clone(ch.data)};vocations=clone(ch.vocations||vocations);tracks=clone(ch.tracks||tracks);render();return true;
}
function abilitiesMenu(ch){
  if(!ensureActive(ch)){toast('Abra a sua ficha para usar habilidades.');return}
  const list=listAbilities();
  openModal('TALENTOS E HABILIDADES',nm(ch),`<div class="notice">Talentos não gastam a ação: ao usar um você ganha o bônus e ainda pode agir, mas só <b>um talento por turno</b>. ES atual: ${data.essence}.${TURN.talentUsed&&TURN.actor===ch.id?' <b>Talento deste turno já usado.</b>':''}</div>${list.map(a=>`<div class="talent"><div class="grow"><h4>${esc(a.item.name)} <span class="pill">${a.item.cost} ES</span></h4><p class="sub">${esc(a.src)}</p><p>${esc(a.item.desc)}</p></div><button class="btn small primary" data-ab="${a.id}">Usar</button></div>`).join('')||'<div class="empty">Sem vocação/trilha com habilidades liberadas.</div>'}<h4 style="margin-top:12px">Rituais conhecidos</h4>${(data.knownRituals||[]).map(id=>RITUALS.find(r=>r.id===id)).filter(Boolean).map(r=>`<div class="inline" style="margin:4px 0"><b>${esc(r.name)}</b><span class="pill">${r.element}</span><button class="btn small" data-rit="${r.id}">Conjurar</button></div>`).join('')||'<span class="sub">Nenhum.</span>'}`,'Fechar',closeModal);
  $$('[data-ab]').forEach(b=>b.onclick=()=>{closeModal();_modalResolve=null;activateTalent(b.dataset.ab)});
  $$('[data-rit]').forEach(b=>b.onclick=()=>{closeModal();_modalResolve=null;castRitual(b.dataset.rit)});
}
function endTurn(ch){
  if(role3()==='master'){window.tulpaAdvanceTurn?.(true,!(ch.ownerId===uid3()||!ch.ownerId))}
  else window.tulpaCompletePlayerTurn?.(ch.id);
}

/* ---------- painel de combate na Visão de Mesa ---------- */
function ensureCombatPanel(){
  const tp=$('tablePanel');if(!tp)return null;let p=$('t3Combat');
  if(!p){p=document.createElement('section');p.id='t3Combat';p.className='combat-panel hide';tp.insertBefore(p,$('tableCharacters'))}
  /* no celular a ação de combate fica no topo da Visão de Mesa, sem flutuar sobre o conteúdo */
  const wantTop=document.body.classList.contains('t3-mobile');
  if(wantTop&&tp.firstElementChild!==p)tp.insertBefore(p,tp.firstElementChild);
  if(!wantTop&&p.nextElementSibling!==$('tableCharacters')&&$('tableCharacters'))tp.insertBefore(p,$('tableCharacters'));
  return p;
}
function resetLeftovers(act){
  if(!act&&Object.keys(CB.pending).length){CB.pending={};CB.promptQueue=[]}
  chars3().filter(c=>controls(c)&&(c._sheetAvailable||c.id===activeCharacterId)).forEach(c=>{const d=c.id===activeCharacterId?data:c.data;if((Number(d.combatExtra)||0)||(Number(d.retalExtra)||0)||d.retalTarget)mutateChar(c,x=>{x.combatExtra=0;x.retalExtra=0;x.retalTarget=null})});
}
function onCombatEnd(){
  TURN.key='';TURN.actor=null;TURN.actionUsed=false;TURN.talentUsed=false;TURN.extraUsed=false;TURN.violentGiven=false;CB.pending={};CB.promptQueue=[];
  chars3().filter(c=>controls(c)&&(c._sheetAvailable||c.id===activeCharacterId)).forEach(c=>mutateChar(c,x=>{x.statuses=(x.statuses||[]).filter(s=>!STATUS_BY_ID[s.id]?.untilTurn);x.combatExtra=0;x.retalExtra=0;x.retalTarget=null;const n=endSceneEffects(x);if(n.length)setTimeout(()=>toast(nm(c)+': '+n.join(' ')),300)}));
  if(role3()==='master'){const any=chars3()[0];if(any)insertRow(any,'Combate encerrado',{detail:{cmb:'mark',kind:'end'}}).catch(()=>{})}
}
function renderCombatUI(){
  const p=ensureCombatPanel();if(!p)return;
  const c=camp3(),cm=c?.combat;
  const act=!!(c&&cm?.active),was=CB.wasActive;CB.wasActive=act;
  if(was===true&&!act)onCombatEnd();
  if(!c||!act||cm.phase!=='active'){if(c)resetLeftovers(act);p.classList.add('hide');return}
  syncTurn();
  p.classList.remove('hide');
  const e=curEntry(),cur=e&&charById(e.characterId),mine=chars3().filter(controls);
  const spectator=role3()==='player'&&!mine.some(x=>inScene(x));
  const myTurn=cur&&controls(cur)&&(cur._sheetAvailable||cur.id===activeCharacterId);
  const left=cur?actionsLeft(cur):0;
  const pend=Object.entries(CB.pending).filter(([,v])=>Date.now()-v.t<900000&&Object.values(v.targets).some(t=>!t.res));
  const extraChars=mine.filter(x=>inScene(x)&&retalOf(x)>0);
  let h=`<div class="panel-head"><div><h3>⚔ Ação em combate</h3><p class="sub">${spectator?'Modo espectador: seu personagem está fora da cena (olho desativado) e não participa.':cur?`Vez de <b>${esc(nm(cur))}</b> · Rodada ${cm.round}`:'—'}</p></div>${cur?`<span class="pill">${statusChips(cur.data)||'sem estados'}</span>`:''}</div>`;
  const skipCur=isDown(cur);
  if(skipCur)h+=`<div class="notice t3-alert">⏭ A vez é de <b>${esc(nm(cur))}</b>, mas ele está <b>${isDeadCh(cur)?'Morto':'Morrendo'}</b>: o turno é pulado automaticamente${isDeadCh(cur)?'':' (e conta 1 dos turnos para ser estabilizado)'}. Se for revivido, volta a jogar na próxima vez.</div>${role3()==='master'&&allDown()?'<div class="notice">Ninguém na ordem consegue agir: estabilize alguém ou encerre o combate.</div>':''}`;
  if(myTurn&&!spectator&&!skipCur){
    const d=cur.id===activeCharacterId?data:cur.data;const m=E.computeMods(d);
    const blocked=m.flags.has('semAgir');
    h+=`<div class="t3-menu"><button class="btn primary" id="cbAtk" ${blocked||left<=0?'disabled':''}>⚔ Atacar</button><button class="btn" id="cbAlert" ${blocked||left<=0?'disabled':''}>👁 Alerta (+1 Esquiva/Reflexo)</button><button class="btn" id="cbAbil" ${blocked?'disabled':''}>✦ Talentos / Habilidades${TURN.talentUsed?' ✓':''}</button><button class="btn" id="cbOther" ${blocked||left<=0?'disabled':''}>⌖ Outra ação (−1 DES)</button><button class="btn" id="cbSut" ${blocked||left<=0?'disabled':''}>🩹 Sutura Bruta</button>${hasTraining(cur,'Medicina')?`<button class="btn" id="cbSin" ${blocked||left<=0?'disabled':''}>🧵 Síntese Cirúrgica</button>`:''}${stIds(d).includes('caido')?`<button class="btn" id="cbUp" ${blocked||left<=0?'disabled':''}>⬆ Levantar (1 ação)</button>`:''}<button class="btn" id="cbSummon" title="Criar uma invocação ou Tulpa manualmente">🜏 Invocação</button><button class="btn danger" id="cbEnd">✔ Concluir turno</button></div><div class="sub" style="margin-top:6px">Ações disponíveis: <b>${left}</b>${Number(d.combatExtra)?` (inclui ${d.combatExtra} extra)`:''} · Talento no turno: ${TURN.talentUsed?'usado':'livre'}${blocked?' · <b style="color:#a33">Você não pode agir neste estado.</b>':''}</div>`;
  }else if(role3()==='master'&&cur&&!myTurn&&!skipCur){
    h+=`<div class="inline"><button class="btn danger" id="cbEndForce">Forçar fim do turno de ${esc(nm(cur))}</button></div>`;
  }
  chars3().filter(c=>inScene(c)&&isDyingCh(c)).forEach(c=>{h+=`<div class="notice t3-alert">☠ <b>${esc(nm(c))}</b> está <b>Morrendo</b> — restam <b>${dyingTurns(c)}</b> turno(s). ${myTurn&&!spectator?'Use <b>Sutura Bruta</b> ou <b>Síntese Cirúrgica</b> (Medicina) na sua ação para estabilizar.':'Aliados podem estabilizar com Sutura Bruta ou Síntese Cirúrgica.'} Um golpe tira 1 turno; dano igual ou maior que metade do Vital máximo finaliza.</div>`});
  h+=T3.summonCards?.(mine.filter(x=>inScene(x)&&(x._sheetAvailable||x.id===activeCharacterId)),{myTurn,cur})||'';
  extraChars.forEach(x=>{h+=`<div class="notice t3-alert">⚡ <b>${esc(nm(x))}</b> desviou com folga e tem ${retalOf(x)} ação de <b>Retaliação</b>. O contra-ataque <b>não pode ser esquivado</b>. <button class="btn small primary" data-extra="${x.id}">Contra-atacar</button></div>`});
  if(pend.length){h+='<h4 style="margin-top:12px">Confrontos em andamento</h4>'+pend.map(([aid,v])=>Object.entries(v.targets).filter(([,t])=>!t.res).map(([tid,t])=>{const tc=charById(tid);const can=tc&&controls(tc);return `<div class="t3-pend">⚔ <b>${esc(v.dt.attackerName)}</b> ataca <b>${esc(nm(tc)||'?')}</b> (${esc(v.dt.weapon.name)}) — ${t.def?'defesa rolada, resolvendo…':(v.dt.noDefense?'retaliação: não pode ser esquivada':'aguardando defesa')} ${can&&!t.def&&!v.dt.noDefense?`<button class="btn small primary" data-defend="${aid}|${tid}">Defender</button>`:''}${role3()==='master'&&!t.def&&!can?`<button class="btn small" data-mdef="${aid}|${tid}">Rolar defesa por ${esc(nm(tc))}</button>`:''}</div>`}).join('')).join('')}
  if(CB.log.length){h+=`<details class="t3-logbox" ${CB.logOpen?'open':''}><summary>Registro do combate (${Math.min(CB.log.length,8)})</summary><div class="t3-log">`+CB.log.slice(0,8).map(l=>l.kind==='res'?`<div class="t3-logline ${l.dt.hit?'hit':'miss'}"><b>${esc(l.dt.attackerName)}</b> → <b>${esc(l.dt.targetName)}</b> (${esc(l.dt.weapon)}): ${esc(l.dt.label)}${l.dt.crit?' · CRÍTICO':''}${l.dt.hit?` · ${l.dt.dmg.final} de dano`:''} <span class="sub">ATA ${l.dt.ATA} × RF ${l.dt.RF} · DF ${l.dt.DF}</span></div>`:`<div class="t3-logline">${esc(l.text)}</div>`).join('')+'</div></details>'}
  p.innerHTML=h;
  const lb=p.querySelector('.t3-logbox');if(lb)lb.ontoggle=()=>{CB.logOpen=lb.open};
  const on=(id,fn)=>{const b=$(id);if(b)b.onclick=fn};
  on('cbSut',()=>rescueAction(cur,'sutura',{spendAction:true}));on('cbSin',()=>rescueAction(cur,'sintese',{spendAction:true}));
  if(role3()==='master')postInitiative(c);
  if(skipCur)autoSkip();
  on('cbUp',()=>{if(actionsLeft(cur)<=0){toast('Você já usou sua ação neste turno.');return}spend(cur);mutateChar(cur,x=>{x.statuses=(x.statuses||[]).filter(s=>s.id!=='caido')});insertRow(cur,'Levantar',{detail:{cmb:'log',text:`${nm(cur)} se levantou (1 ação).`}}).catch(()=>{});toast('Você se levantou.');renderCombatUI()});
  on('cbSummon',()=>T3.offerSummon?.(null,null,cur));
  T3.bindSummons?.(p);
  on('cbAtk',()=>startAttack(cur));on('cbAlert',()=>alertAction(cur));on('cbAbil',()=>abilitiesMenu(cur));on('cbOther',()=>otherAction(cur));on('cbEnd',()=>endTurn(cur));on('cbEndForce',()=>window.tulpaAdvanceTurn?.(true,true));
  $$('[data-extra]',p).forEach(b=>b.onclick=()=>startAttack(charById(b.dataset.extra),{retal:true}));
  $$('[data-defend]',p).forEach(b=>b.onclick=()=>{const [a,t]=b.dataset.defend.split('|');queuePrompt(a,t)});
  $$('[data-mdef]',p).forEach(b=>b.onclick=async()=>{const [a,t]=b.dataset.mdef.split('|'),tc=charById(t);if(!tc?._sheetAvailable){toast('Ficha do jogador indisponível para o Mestre.');return}const d=tc.data,m=E.computeMods(d);await doDefense(a,t,(CB.pending[a].dt.noDefense||m.flags.has('semDefender')||m.flags.has('semAgir'))?'none':(CB.pending[a].dt.surprise?'reflexo':'esquiva'),true)});
}
T3.renderCombatUI=renderCombatUI;
/* Iniciativa: o servidor rola o Reflexo; aqui os dados passam a aparecer na tela e no histórico */
const _rollReflex=window.tulpaRollReflexForCharacter;
if(_rollReflex)window.tulpaRollReflexForCharacter=async function(id){
  const out=await _rollReflex.apply(this,arguments);
  try{
    const c=camp3(),ch=charById(id);
    if(c&&ch&&sb()){
      const {data:rows}=await sb().from('campaign_reflex_rolls').select('character_id,dice,total').eq('campaign_id',c.id).eq('character_id',id).limit(1);
      const r=rows&&rows[0];
      if(r&&Array.isArray(r.dice)){const best=Math.max(0,...r.dice);showRollPopup({eyebrow:'INICIATIVA',title:`${nm(ch)} · Reflexo`,sets:[{label:`Reflexo ${r.dice.length}d20`,dice:r.dice,bonus:Number(r.total)-best,total:Number(r.total),hi:'max'}],big:r.total})}
    }
  }catch(e){console.warn('[T3] dados da iniciativa',e)}
  return out;
};
async function postInitiative(c){
  if(!sb()||CB.initBusy)return;
  const ck=c.id+':'+((c.combat?.order||[]).map(o=>o.characterId).join(','));
  if(!c.combat?.order?.length||CB.initChecked===ck)return;
  CB.initChecked=ck;CB.initBusy=true;
  try{
    const {data:rows,error}=await sb().from('campaign_reflex_rolls').select('character_id,dice,total').eq('campaign_id',c.id);
    if(error||!rows||!rows.length)return;
    const sig=rows.map(r=>r.character_id+':'+r.total+':'+(r.dice||[]).join('.')).sort().join('|'),key='tulpa_init_'+c.id;
    let seen=null;try{seen=localStorage.getItem(key)}catch(e){}
    if(seen===sig||CB.initSig===sig)return;
    CB.initSig=sig;try{localStorage.setItem(key,sig)}catch(e){}
    const list=rows.map(r=>({id:r.character_id,name:nm(charById(r.character_id)),dice:r.dice||[],total:Number(r.total)||0})).sort((a,b)=>b.total-a.total);
    const first=charById(list[0].id);if(!first)return;
    await insertRow(first,'Iniciativa',{dice:[],bonus:0,total:list[0].total,detail:{cmb:'init',rolls:list}});
    for(const x of list){const ch=charById(x.id);if(!ch)continue;const best=Math.max(0,...x.dice);await insertRow(ch,'Iniciativa · Reflexo',{dice:x.dice,bonus:x.total-best,total:x.total,detail:{cmb:'rollx',sides:20,eyebrow:'INICIATIVA',quiet:true}})}
  }catch(e){console.warn('[T3] iniciativa',e)}
  finally{CB.initBusy=false}
}

/* ---------- integração com a mesa ---------- */
function markRoster(){
  const cm=camp3()?.combat;if(!cm?.active||cm.phase!=='active')return;
  const items=document.querySelectorAll('#roundRoster .combatant');
  (cm.order||[]).forEach((o,i)=>{const el=items[i],c=charById(o.characterId);if(!el||el.querySelector('.t3-skipmark'))return;
    if(isDown(c)){el.classList.add('t3-down');el.insertAdjacentHTML('beforeend',`<span class="tag t3-chip-bad t3-skipmark">☠ ${isDeadCh(c)?'Morto':'Morrendo · '+dyingTurns(c)+' turno(s)'} · turno pulado</span>`)}});
}
const _rt=window.renderTable;
window.renderTable=function(){
  _rt();
  try{
    loadCombatRows();renderCombatUI();markRoster();
    loadItemRows();
    $$('#tableCharacters .table-char').forEach(card=>{
      const ch=charById(card.dataset.cid);if(!ch||card.querySelector('.t3-chips'))return;
      const d=ch.data||{},hid=!!d.hideStats,isM=role3()==='master',seeAll=isM||ch.ownerId===uid3();
      const box=document.createElement('div');box.className='t3-chips inline';
      box.innerHTML=`${statusChips(d)||'<span class="sub">Sem estados</span>'}${(seeAll||!hid)?`<span class="pill">DF ${E.defenseInfo(ch.id===activeCharacterId?data:d).DF}</span>`:''}${(seeAll||!hid)&&Number(d.vitalTemp??d.temp)?`<span class="pill">+${Number(d.vitalTemp??d.temp)} VT temp.</span>`:''}${hid&&isM?'<span class="pill">🔒 status ocultos aos jogadores</span>':''}`;
      card.querySelector('.owner')?.after(box);
      if(hid&&!seeAll){card.querySelectorAll('.resource-row').forEach(n=>n.remove());const n=document.createElement('div');n.className='notice';n.textContent='🔒 Vital, Lucidez e Essência ocultos pelo Mestre.';box.after(n)}
      if(isM){const row=document.createElement('div');row.className='inline';row.style.marginTop='8px';
        row.innerHTML=`<button class="btn small" data-mst>☠ Estados</button><button class="btn small" data-hide>${hid?'👁 Mostrar status':'🙈 Ocultar status'}</button>`;card.appendChild(row);
        row.querySelector('[data-mst]').onclick=()=>masterStatuses(ch);row.querySelector('[data-hide]').onclick=()=>toggleHideStats(ch)}
    });
  }catch(e){console.error('[T3] mesa',e)}
};
function toggleHideStats(ch){
  const will=!ch.data.hideStats;
  mutateChar(ch,d=>{d.hideStats=will});
  toast(will?'Status ocultos para os jogadores: '+nm(ch):'Status visíveis: '+nm(ch));
}
async function masterStatuses(ch){
  const act=(ch.data.statuses||[]).map(s=>typeof s==='string'?s:s.id);
  const ok=await askModal('ESTADOS',nm(ch),`<div class="t3-pick">${STATUS_DEFS.filter(s=>s.group==='manual').map(s=>`<label class="t3-pickrow"><input type="checkbox" name="mst" value="${s.id}" ${act.includes(s.id)?'checked':''}><span><b>${esc(s.name)}</b><div class="sub">${esc(s.text)}</div></span></label>`).join('')}</div>`,'Aplicar');
  if(!ok)return;const sel=$$('input[name="mst"]:checked').map(i=>i.value),fx=[];
  STATUS_DEFS.filter(s=>s.group==='manual').forEach(s=>{const was=act.includes(s.id),is=sel.includes(s.id);if(was!==is)fx.push({t:'status',id:s.id,on:is})});
  if(fx.length)await sendFx([ch.id],fx,`Estados de ${nm(ch)} atualizados pelo Mestre`,chars3().find(controls)||ch);
}
/* recursos na mesa: respeita Colapso/Êxtase */
adjustResource=function(charId,key,delta){
  const ch=charById(charId);if(!ch)return;
  if(!canEdit(ch)){toast('Você só pode alterar seus próprios recursos.');return}
  if(controls(ch)&&ensureActive(ch)){setResource(key,(Number(data[key])||0)+delta);renderTable();return}
  const s=dmax(ch.data),max={vital:s.vt,lucidity:s.luc,essence:s.es}[key],old=Number(ch.data[key])||0;
  if(key==='lucidity'&&delta<0){const r=E.applyLucidityDamage(ch.data,-delta);if(r.applied)toast(`Blindagem de Lucidez de ${nm(ch)}: dano ${r.raw} → ${r.final}.`)}
  else ch.data[key]=Math.max(0,Math.min(max,old+delta));
  if(key==='lucidity'&&ch.data[key]<=0&&old>0)ch.data.collapsePending=true;
  if(key==='vital'&&ch.data.vital<=0&&old>0&&!(ch.data.statuses||[]).some(x=>(x.id||x)==='agonia'))E.startDying(ch.data);
  persistRemote(ch).catch(e=>fail3('atualizar recursos',e));renderTable();
};
T3.onZeroVital=d=>{if(E.startDying(d))toast('Vital em 0: Morrendo — 3 turnos para ser estabilizado.')};
/* abre o Protocolo de Colapso pendente ao carregar a ficha */
let _shownCollapse=null;
const _r2=render;render=function(){_r2();if(data.collapsePending&&_shownCollapse!==activeCharacterId&&activeCharacterId&&!$('modalWrap').classList.contains('open')){_shownCollapse=activeCharacterId;setTimeout(()=>T3.collapseModal(),400)}};

