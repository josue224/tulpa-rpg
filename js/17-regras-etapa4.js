/* ===== TULPA · ETAPA 4 — regras do Manual V1.2, Modo Livre, invocações, reações ===== */

/* ---------- Sonolento: 3 falhas em Concentração = adormece (Paralisado) ---------- */
function sonoFail(d,ch){
  const s=(d.statuses||[]).find(x=>x.id==='sonolento');if(!s)return;
  const apply=x=>{const t=(x.statuses||[]).find(y=>y.id==='sonolento');if(!t)return;t.fails=(Number(t.fails)||0)+1;
    if(t.fails>=3){x.statuses=x.statuses.filter(y=>y.id!=='sonolento');if(!x.statuses.some(y=>y.id==='paralisado'))x.statuses.push({id:'paralisado',at:Date.now(),asleep:true})}};
  const willSleep=(Number(s.fails)||0)+1>=3;
  if(ch&&ch.id!==activeCharacterId)mutateChar(ch,apply);else{apply(data);save()}
  toast(willSleep?'Três falhas: adormeceu! (Paralisado até acordar)':'Sonolento: falha registrada ('+((Number(s.fails)||0))+'/3).');
}
T3.sonoFail=sonoFail;

/* ---------- reações instantâneas na defesa ---------- */
const RX=[
  {id:'desvio',name:'Desvio Improvável',cost:5,hint:'se te acertar, o atacante repete o ataque',ok:d=>d.track==='Manipulador de Probabilidades'&&(Number(d.stage)||1)>=3},
  {id:'brecha',name:'Brecha Rápida',cost:5,el:'Inexistência',hint:'teleporta até 5 m e nega o ataque',ritual:'Brecha Rápida'},
  {id:'duplica',name:'Duplica Efêmera',cost:5,el:'Ilusão',hint:'1d2: o golpe pode pegar a ilusão',ritual:'Duplica Efêmera'},
  {id:'intervencao',name:'Intervenção Divina Menor',cost:5,el:'Fé',hint:'reduz o dano em 2d6',ritual:'Intervenção Divina Menor'}
];
function reactionsFor(ch,d){
  d=d||dOf(ch);const m=E.computeMods(d);if(m.flags.has('semReacao')||m.flags.has('semAgir'))return[];
  const known=d.knownRituals||[];
  return RX.filter(x=>(x.ok?x.ok(d):known.includes(RITUALS.find(r=>r.name===x.ritual)?.id))&&(Number(d.essence)||0)>=x.cost);
}
T3.reactionsFor=reactionsFor;

/* ---------- invocações (Chamado do Abismo) e Tulpas ---------- */
const attackSkillOf=d=>{const q=E.quickWeapons(d)[0];return q?.w?.skill||'Briga'};
T3.offerSummon=async function(def,item,chOverride){
  const ch=chOverride||charById(activeCharacterId)||{id:activeCharacterId,data,vocations,tracks};
  const d=dOf(ch);
  let sm;
  if(def){
    const vt=def.vt==='half'?Math.max(1,Math.floor((Number(d.vital)||0)/2)):Number(def.vt)||4;
    const dmg=def.dmg==='weapon'?(E.quickWeapons(d)[0]?.w?.dado||'1d6'):def.dmg;
    sm={id:'sm-'+rid(),name:def.name,vt,vtMax:vt,dmg,roundsLeft:def.rounds||3,el:def.el||'',skill:attackSkillOf(d)};
    const ok=await askModal('INVOCAÇÃO',def.name,`<p>Criar o card da criatura no combate?</p><div class="t3-grid3"><div class="stat"><div class="name">VITAL</div><div class="value">${vt}</div></div><div class="stat"><div class="name">DANO</div><div class="value">${esc(dmg)}</div></div><div class="stat"><div class="name">DURAÇÃO</div><div class="value">${sm.roundsLeft}<span class="max"> rodadas</span></div></div></div><p class="sub">A criatura ataca usando a sua perícia de ataque (${esc(sm.skill)}), uma vez por turno, sem gastar a sua ação. Ela some quando o Vital chega a 0 ou quando as rodadas acabam (contadas no início do seu turno).</p>`,'Criar invocação');
    if(!ok)return;
  }else{
    const ok=await askModal('INVOCAÇÃO / TULPA','Nova criatura aliada',`<div class="t3-form"><div class="field"><label>Nome</label><input id="smName" value="Tulpa"></div><div class="field"><label>Vital</label><input id="smVt" type="number" min="1" value="8"></div><div class="field"><label>Dano (ex.: 1d6, 2d8+1)</label><input id="smDmg" value="1d6"></div><div class="field"><label>Duração (rodadas)</label><input id="smRounds" type="number" min="1" value="3"></div><div class="field"><label>Perícia de ataque</label><select id="smSkill">${ATTACK_SKILLS.map(s=>`<option ${s===attackSkillOf(d)?'selected':''}>${s}</option>`).join('')}</select></div></div>`,'Criar');
    if(!ok)return;
    const dmg=($('smDmg')?.value||'1d6').trim();if(!/^\d+d\d+([+-]\d+)?$/i.test(dmg)){toast('Dano inválido. Use algo como 1d6.');return}
    const vt=Math.max(1,Number($('smVt')?.value)||1);
    sm={id:'sm-'+rid(),name:($('smName')?.value||'Tulpa').trim()||'Tulpa',vt,vtMax:vt,dmg,roundsLeft:Math.max(1,Number($('smRounds')?.value)||3),el:'',skill:$('smSkill')?.value||'Briga'};
  }
  mutateChar(ch,x=>{x.summons=(x.summons||[]).concat(sm)});
  if(sm.el)setTimeout(()=>{try{window.tulpaFx('cast',sm.el)}catch(e){}},40);
  if(camp3())insertRow(charById(ch.id)||ch,'Invocação',{detail:{cmb:'log',text:`${nm(ch)} invocou ${sm.name} (VT ${sm.vt}, dano ${sm.dmg}, ${sm.roundsLeft} rodadas).`}}).catch(()=>{});
  toast(sm.name+' invocado.');renderCombatUI();
};
T3.summonCards=function(list,{myTurn,cur}={}){
  const rows=[];
  list.forEach(c=>{const d=dOf(c);(d.summons||[]).forEach(sm=>{
    const can=myTurn&&cur&&cur.id===c.id,used=(TURN.summonUsed||[]).includes(sm.id)&&TURN.actor===c.id;
    rows.push(`<div class="t3-summon"><div class="grow"><b>🜏 ${esc(sm.name)}</b> <span class="sub">de ${esc(nm(c))}</span><div class="inline"><span class="tag">VT ${sm.vt}/${sm.vtMax}</span><span class="tag">dano ${esc(sm.dmg)}</span><span class="tag">${esc(sm.skill)}</span><span class="tag">${sm.roundsLeft} rodada(s)</span></div></div><div class="inline"><button class="btn small" data-sm-vt="${c.id}|${sm.id}|-1">−VT</button><button class="btn small" data-sm-vt="${c.id}|${sm.id}|1">+VT</button><button class="btn small primary" data-sm-atk="${c.id}|${sm.id}" ${can&&!used?'':'disabled'} title="${can?'':'Só no turno de quem invocou'}">🎲 Atacar${used?' ✓':''}</button><button class="btn small danger" data-sm-del="${c.id}|${sm.id}">✕</button></div></div>`)})});
  return rows.length?`<h4 style="margin-top:12px">Invocações</h4>${rows.join('')}`:'';
};
T3.bindSummons=function(p){
  const find=k=>{const [cid,sid]=k.split('|');const c=charById(cid)||(cid===activeCharacterId?{id:cid,data}:null);return{c,sid,sm:c&&(dOf(c).summons||[]).find(x=>x.id===sid)}};
  $$('[data-sm-vt]',p).forEach(b=>b.onclick=()=>{const [cid,sid,dl]=b.dataset.smVt.split('|');const {c}=find(cid+'|'+sid);if(!c)return;
    mutateChar(c,x=>{const t=(x.summons||[]).find(y=>y.id===sid);if(!t)return;t.vt=Math.max(0,Math.min(t.vtMax,t.vt+Number(dl)));if(t.vt<=0){x.summons=x.summons.filter(y=>y!==t);toast(t.name+' foi destruído.')}});renderCombatUI()});
  $$('[data-sm-del]',p).forEach(b=>b.onclick=()=>{const {c,sid}=find(b.dataset.smDel);if(!c)return;mutateChar(c,x=>{x.summons=(x.summons||[]).filter(y=>y.id!==sid)});renderCombatUI()});
  $$('[data-sm-atk]',p).forEach(b=>b.onclick=async()=>{
    const {c,sm}=find(b.dataset.smAtk);if(!c||!sm)return;
    const w={name:sm.name,cat:'Corpo a corpo',peso:'Bolso',dado:sm.dmg,critMin:20,skill:sm.skill||'Briga',area:false,effects:[],note:'invocação'};
    const pk=await pickTargets({title:sm.name+' ataca',multi:false,exclude:[c.id],skipDead:true,hint:'Alvo do ataque da criatura.'});
    if(!pk||!pk.ids.length)return;
    TURN.summonUsed=(TURN.actor===c.id?(TURN.summonUsed||[]):[]).concat(sm.id);
    await performAttack(c,w,pk.ids,{noSpend:true});
  });
};

/* ---------- perícias: base +1, graus +5 / +10 (Mestre) / +15 (Maestria) ---------- */
const TIER_LBL={5:'+5',10:'Mestre +10',15:'Maestria +15'};
/* só o treino por perícia; o que já virou vertente fica na lista de vertentes */
function tierSkills(d){const set=new Set([...(d.extraSkills||[]),...Object.keys(d.skillUpgrades||{}),...(d.free10?[d.free10]:[])]);return [...set].filter(s=>E.legacyTier(d,s)>0).sort((a,b)=>a.localeCompare(b,'pt-BR'))}
function tierUp(skill){
  const L=E.limitsFor(data),U=E.tierUsage(data),free=!!data.freeMode,t=E.legacyTier(data,skill);data.skillUpgrades=data.skillUpgrades||{};
  if(t===5){if(!free&&U.ten>=L.ten){toast(L.ten?`Limite de perícias Mestre (+10) no Estágio ${data.stage}: ${L.ten}.`:'Perícias +10 (Mestre) liberam no Estágio 5.');return}data.skillUpgrades[skill]=10}
  else if(t===10){if(!free&&U.fifteen>=L.fifteen){toast(L.fifteen?'Você já tem a sua perícia de Maestria (+15).':'Maestria (+15) libera no Estágio 9.');return}data.skillUpgrades[skill]=15}
  else return;
  save();toast(skill+': '+TIER_LBL[E.legacyTier(data,skill)]);
}
function tierDown(skill){
  const ups=data.skillUpgrades=data.skillUpgrades||{},t=E.legacyTier(data,skill);
  if(t===15)ups[skill]=10;
  else if(t===10){if(data.free10===skill&&!ups[skill])data.free10='';else delete ups[skill]}
  else if(t===5){const i=data.extraSkills.lastIndexOf(skill);if(i>=0)data.extraSkills.splice(i,1)}
  if(ups[skill]===10&&data.free10===skill)delete ups[skill];
  save();
}
renderSkills=function(){
  const q=($('skillSearch').value||'').toLowerCase(),ch={data,vocations,tracks};
  data.extraSkills=data.extraSkills||[];data.skillUpgrades=data.skillUpgrades||{};
  $('skillGrid').innerHTML=BASE_SKILLS.filter(s=>s.toLowerCase().includes(q)).map(s=>{const c=skillCalc3(ch,s);
    return `<div class="skill"><div class="skill-info"><div class="skill-name">${esc(s)}${c.tier?` <span class="t3-tier t${c.tier}">${TIER_LBL[c.tier]}</span>`:''}</div><div class="skill-attr">${esc(SKILL_ATTR[s])} · ${c.n}d20 · base +${c.start}${c.voc?' · vocação +'+c.voc:''}${c.tier?' · extra +'+c.tier:''}${c.persistent+c.once?' · talento '+sign(c.persistent+c.once):''}</div></div><div class="skill-right"><span class="skill-val">${sign(c.bonus)}</span><button class="roll" data-roll="${esc(s)}">D20</button></div></div>`}).join('');
  $$('[data-roll]',$('skillGrid')).forEach(b=>b.onclick=()=>rollSkill(b.dataset.roll));
  const L=E.limitsFor(data),U=E.tierUsage(data),free=!!data.freeMode;
  $('extraSkillsLabel').textContent=free?`Modo Livre · ${U.five} escolhas +5`:`${U.five} / ${L.five} escolhas +5${L.intExtra?` (+${L.intExtra} por Inteligência)`:''}`;
  $('skillSlots').textContent=free?'Sem limites (Modo Livre)':`${Math.max(0,L.five-U.five)} escolhas +5 restantes`;
  const keep=$('addSkillSelect').value;
  $('addSkillSelect').innerHTML=BASE_SKILLS.map(s=>{const t=E.skillTier(data,s);return `<option value="${esc(s)}">${esc(s)}${t?' ('+TIER_LBL[t]+')':''}</option>`}).join('');
  if(keep)$('addSkillSelect').value=keep;
  const list=tierSkills(data);
  $('extraSkillList').innerHTML=list.map(s=>{const t=E.legacyTier(data,s),canUp=(t===5&&(free||U.ten<L.ten))||(t===10&&(free||U.fifteen<L.fifteen));
    return `<span class="pill t3-tierpill">${esc(s)} <b class="t3-tier t${t}">${TIER_LBL[t]}</b>${data.free10===s?' <small>(Estágio 10)</small>':''}${t<15?`<button class="t3-x" data-tup="${esc(s)}" ${canUp?'':'disabled'} title="${t===5?'Subir para Mestre +10':'Subir para Maestria +15'}">▲</button>`:''}<button class="t3-x" data-tdown="${esc(s)}" title="Baixar um grau">▼</button></span>`}).join('')||'<span class="sub">Nenhum bônus extra aplicado.</span>';
  let box=$('t3TierBox');if(!box){box=document.createElement('div');box.id='t3TierBox';$('extraSkillList').after(box)}
  const cnt=(a,b,l,t)=>`<span class="pill"><b class="t3-tier t${t}">${l}</b> ${a} / ${free?'∞':b}</span>`;
  box.innerHTML=`<div class="inline" style="margin-top:12px;gap:6px">${cnt(U.five,L.five,'+5',5)}${cnt(U.ten,L.ten,'Mestre +10',10)}${cnt(U.fifteen,L.fifteen,'Maestria +15',15)}</div>${(L.free10||free)?`<div class="field" style="margin-top:10px;max-width:420px"><label>Estágio 10 · perícia que sobe direto para +10 (sem gastar escolha de +5)</label><select id="t3Free10"><option value="">— escolher —</option>${BASE_SKILLS.map(s=>`<option ${data.free10===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`:''}<p class="sub" style="margin-top:8px">Toda perícia começa em <b>0</b> (Manual Oficial, Edição Revisada). Estágio 5 libera 1 perícia +5 → +10 (Mestre); Estágio 7, mais 2; Estágio 8, mais 1; Estágio 9, 1 perícia +10 → +15 (Maestria); Estágio 10, +1 perícia direto para +10. Use ▲ e ▼ nas perícias acima.</p>`;
  const f10=$('t3Free10');if(f10)f10.onchange=()=>{const v=f10.value;if(v&&E.skillTier(data,v)>=10&&data.free10!==v){toast('Essa perícia já está em +10 ou mais.');f10.value=data.free10||'';return}data.free10=v;save()};
  $$('[data-tup]').forEach(b=>b.onclick=()=>tierUp(b.dataset.tup));
  $$('[data-tdown]').forEach(b=>b.onclick=()=>tierDown(b.dataset.tdown));
};
$('addSkillBonus').onclick=()=>{
  const s=$('addSkillSelect').value,L=E.limitsFor(data),U=E.tierUsage(data);data.extraSkills=data.extraSkills||[];
  if(!data.freeMode&&U.five>=L.five){toast('Você já usou todas as escolhas de +5 deste estágio.');return}
  if(E.skillTier(data,s)>=5){toast(s+' já tem bônus extra. Use ▲ para subir de grau.');return}
  data.extraSkills.push(s);save();
};
$('removeSkillBonus').onclick=()=>{const s=$('addSkillSelect').value;if(!E.skillTier(data,s)){toast('Essa perícia não tem bônus extra.');return}
  const ups=data.skillUpgrades||{};delete ups[s];if(data.free10===s)data.free10='';const i=(data.extraSkills||[]).lastIndexOf(s);if(i>=0)data.extraSkills.splice(i,1);save()};

/* ---------- Modo Criação Livre ("Seu Personagem Teria", pág. 3) ---------- */
{const _apl=attrPointsLeft,_amx=attrMax;
 attrPointsLeft=function(){return data.freeMode?99:_apl()};
 attrMax=function(){return data.freeMode?10:_amx()};}
{const _pt=previewTrack;previewTrack=function(){_pt();if(data.freeMode&&pendingTrack)$('confirmTrack').disabled=false}}
$('confirmTrack').onclick=()=>{if(!pendingTrack||(data.stage<3&&!data.freeMode))return;openModal('CONFIRMAR TRILHA',pendingTrack.name,`<p>${escapeHtml(pendingTrack.desc)}</p><div class="notice">Arquétipo: <b>${pendingTrack.archetype}</b>. As habilidades são liberadas nos estágios 3, 5, 8 e 10.${data.freeMode?' (Modo Livre: escolha permitida em qualquer estágio.)':''}</div>`,'Confirmar escolha',()=>{data.archetype=pendingTrack.archetype;data.track=pendingTrack.name;data.activeTalents=data.activeTalents.filter(x=>!x.startsWith('track:'));closeModal();save();toast('Trilha confirmada.')})};
{const _ov=T3.renderOverviewExtra;T3.renderOverviewExtra=function(){
  _ov();const box=$('overviewExtra');if(!box)return;
  const el=document.createElement('div');el.className='panel';
  el.innerHTML=`<div class="panel-head"><h2>Modo Criação Livre</h2><label class="t3-switch"><input type="checkbox" id="ovFree" ${data.freeMode?'checked':''}><span>“Seu Personagem Teria”</span></label></div><p class="sub">${data.freeMode?'<b>Ligado:</b> atributos sem limite de pontos, quantas perícias +5/+10/+15 quiser e qualquer Arquétipo/Trilha em qualquer estágio. Mantenha a lógica de um ser humano.':'Para jogadores que querem liberdade total (pág. 3 do manual): ignora os limites de pontos, de perícias e de estágio da ficha.'}</p>`;
  box.appendChild(el);
  $('ovFree').onchange=e=>{if(e.target.checked&&!confirm('Ligar o Modo Criação Livre? Os limites do manual deixam de valer nesta ficha (combine com o Mestre).')){e.target.checked=false;return}data.freeMode=e.target.checked;save();toast(data.freeMode?'Modo Criação Livre ligado.':'Modo Criação Livre desligado.')};
}}

/* ---------- Arsenal Mental: custo (pág. 2 x pág. 12) ---------- */
{const _rts=renderTrackStages;renderTrackStages=function(){
  _rts();if(data.track!=='Arsenal Mental')return;
  const el=document.createElement('div');el.className='choice';
  el.innerHTML=`<div class="field"><label>Custo do Arsenal Mental</label><select id="arsCost"><option value="p2" ${data.arsenalCost!=='p12'?'selected':''}>5 / 10 / 20 ES — pág. 2 (igual às outras trilhas, padrão)</option><option value="p12" ${data.arsenalCost==='p12'?'selected':''}>1 / 2 / 4 ES — pág. 12</option></select></div><p class="sub">O manual traz dois valores; combine com o Mestre. No Estágio 10 (Devastador Mental), marque a <b>Arma Favorita</b> no Inventário: ela ganha +1 dado de dano e +2 na margem de ameaça.</p>`;
  $('trackStages').prepend(el);
  $('arsCost').onchange=e=>{data.arsenalCost=e.target.value;save()};
}}

/* ---------- botão do Mestre sem senha ---------- */
function syncMasterBtn(){
  const b=$('masterBtn');if(!b)return;
  const logged=!!window.tulpaCloudUser,isM=(window.tulpaCloudRole||'')==='master';
  b.classList.toggle('hide',logged&&!isM);
}
$('masterBtn').onclick=()=>{
  const logged=!!window.tulpaCloudUser,isM=(window.tulpaCloudRole||'')==='master';
  if(logged&&!isM){toast('Somente o Mestre pode abrir o painel.');syncMasterBtn();return}
  $('masterPanel').classList.add('open');
};
setInterval(syncMasterBtn,1500);
{const _r4=render;render=function(){_r4();try{syncMasterBtn()}catch(e){}}}

/* ---------- merge: atualização externa (Mestre) chegando com edição local pendente ---------- */
const MERGE_REMOTE=['vital','vitalTemp','lucidity','essence','statuses','activeEffects','combatExtra','violentKey','violentRow','retalExtra','retalTarget','hideStats','suturaAtiva','suturaRompe','collapsePending','dying','lucShieldUsed'];
window.tulpaMergeSheet=function(local,remote){
  const out={...blank(),...local};
  MERGE_REMOTE.forEach(k=>{if(k in remote)out[k]=remote[k];else delete out[k]});
  /* ação extra já gasta não volta por uma cópia remota antiga */
  if('combatExtra' in local&&'combatExtra' in remote)out.combatExtra=Math.min(Number(local.combatExtra)||0,Number(remote.combatExtra)||0);
  return out;
};

