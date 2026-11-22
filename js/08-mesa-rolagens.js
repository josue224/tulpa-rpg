/* TULPA RPG — Visão de Mesa: rolagem de perícias compartilhada, pop-up e histórico */
(()=>{
 'use strict';
 const sb=window.tulpaSupabase;
 if(!sb){console.error('[Tulpa Mesa] Supabase indisponível.');return}
 const el=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const role=()=>window.tulpaCloudRole;
 const uid=()=>window.tulpaCloudUser?.id||null;
 const camp=()=>portalStore.campaigns.find(c=>c.id===portalCampaignId);
 const sign=n=>(n>=0?'+':'')+n;
 let rollChannel=null,rollChannelCampaign=null,rollHistory=[],rollsError='',shownRolls=new Set(),popupQueue=[],popupTimer=null,busy=false;
 // Mestre rola por qualquer ficha; jogador somente pela própria.
 const canRollFor=ch=>!!ch&&(role()==='master'||(!!uid()&&ch.ownerId===uid()));
 function d20(){const a=new Uint32Array(1);crypto.getRandomValues(a);return 1+Math.floor(a[0]/4294967296*20)}
 // Mesma regra da ficha: N d20 (N = atributo), mantém o maior e soma o bônus.
 function skillCalc(ch,skill){return window.tulpaSkillCalc(ch,skill)}
 function skillCalcOld(ch,skill){
   const d=ch.data||{},attr=SKILL_ATTR[skill],n=Math.max(1,Number(d.attributes?.[attr])||1);
   const v=(ch.vocations||vocations).find(x=>x.name===d.vocation);
   let voc=0;if(v&&(v.skills||[]).includes(skill)){const y=Number(d.serviceYears)||0;voc=y>=40?15:y>=10?10:5}
   const extra=(d.extraSkills||[]).filter(x=>x===skill).length*5;
   const base=(Number(d.skillOverrides?.[skill])||0)+extra+voc;
   const matches=e=>e.skill===skill||(Array.isArray(e.skills)&&e.skills.includes(skill));
   const effects=d.activeEffects||[];
   const persistent=effects.filter(e=>e.type!=='once'&&matches(e)).reduce((s,e)=>s+(Number(e.value)||0),0);
   const onceList=effects.filter(e=>e.type==='once'&&matches(e));
   const once=onceList.reduce((s,e)=>s+(Number(e.value)||0),0);
   const team=Number(window.tulpaTeamBonus?.(skill))||0;
   return {attr,n,base,persistent,once,onceList,team,bonus:base+persistent+once+team};
 }
 // ---------- Pop-up para toda a mesa ----------
 function ensurePopup(){let p=el('rollPopup');if(!p){p=document.createElement('div');p.id='rollPopup';p.setAttribute('role','status');p.setAttribute('aria-live','polite');p.addEventListener('click',showNextPopup);document.body.appendChild(p)}return p}
 function fillPopup(pop,r){
   const dice=(Array.isArray(r.dice)?r.dice:[]).map(Number),best=dice.length?Math.max(...dice):0;
   const bonus=Number(r.bonus)||0,total=Number(r.total)||0,d=r.detail||{};
   const parts=[['perícia',Number(d.base)||0],['habilidades',(Number(d.persistent)||0)+(Number(d.talent)||0)],['equipe',Number(d.team)||0]].filter(([,v])=>v!==0).map(([k,v])=>k+' '+sign(v));
   const flag=best===20?'nat20':(best===1?'nat1':'');
   pop.innerHTML=`<div class="rp-eyebrow">ROLAGEM NA MESA</div><div class="rp-title">${esc(r.character_name||'Personagem')} · ${esc(r.skill)}</div><div class="rp-sub">${esc(r.attribute||'')} · ${dice.length}d20 · rolado por ${esc(r.roller_label||'—')}</div><div class="dice">${dice.map(x=>`<span class="die ${x===best?'best':'discard'}">${x}</span>`).join('')}</div><div class="bigresult ${flag}">${total}</div><div class="rp-detail">Maior dado ${best} ${bonus>=0?'+':'−'} bônus ${Math.abs(bonus)} = ${total}${parts.length?' ('+parts.join(' · ')+')':''}</div><div class="rp-hint">Toque para fechar</div>`;
 }
 function showNextPopup(){
   clearTimeout(popupTimer);popupTimer=null;
   const pop=ensurePopup(),row=popupQueue.shift();
   if(!row){pop.classList.remove('show');return}
   fillPopup(pop,row);pop.classList.add('show');
   try{window.tulpaRollFx?window.tulpaRollFx(pop,{d20:true,who:[row.character_name]}):window.tulpaFx?.('confirm')}catch(e){}
   popupTimer=setTimeout(showNextPopup,popupQueue.length?3200:8000);
 }
 function queuePopup(r){
   popupQueue.push(r);const pop=ensurePopup();
   if(!pop.classList.contains('show'))showNextPopup();
   else{clearTimeout(popupTimer);popupTimer=setTimeout(showNextPopup,3000)}
 }
 // ---------- Histórico ----------
 function fmtTime(iso){const d=new Date(iso);if(isNaN(d))return '';const same=d.toDateString()===new Date().toDateString();return same?d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
 function renderHistory(){
   const box=el('rollHistoryList');if(!box)return;
   const clear=el('clearRollHistory');if(clear)clear.style.display=role()==='master'?'':'none';
   if(rollsError){box.innerHTML=`<div class="empty">${esc(rollsError)}</div>`;return}
   if(!rollHistory.length){box.innerHTML='<div class="empty">Nenhuma rolagem registrada ainda.</div>';return}
   box.innerHTML=rollHistory.map(r=>{if(r.detail&&r.detail.cmb==='res'&&window.tulpaHistItem)return window.tulpaHistItem(r);
     const dice=(Array.isArray(r.dice)?r.dice:[]).map(Number),best=dice.length?Math.max(...dice):0,bonus=Number(r.bonus)||0;
     return `<div class="roll-hist-item"><div><span class="rh-name">${esc(r.character_name||'Personagem')}</span><span class="rh-skill">${esc(r.skill)}</span></div><div class="rh-dice">${dice.map(x=>`<span class="rh-die ${x===best?'best':''}">${x}</span>`).join('')}<span class="rh-bonus">${sign(bonus)}</span></div><div class="rh-total">${Number(r.total)||0}</div><div class="rh-meta">${esc(fmtTime(r.created_at))} · ${esc(r.attribute||'')} · por ${esc(r.roller_label||'—')}</div></div>`;
   }).join('');
 }
 function ensureHistoryPanel(){
   const tp=el('tablePanel');if(!tp||el('rollHistoryPanel'))return;
   const sec=document.createElement('section');sec.id='rollHistoryPanel';sec.className='roll-history-panel';
   sec.innerHTML='<div class="panel-head"><div><h3>🎲 Histórico de rolagens</h3><p class="sub">Rolagens feitas aqui na Visão de Mesa aparecem para todos. Rolagens feitas dentro da ficha continuam privadas.</p></div><button class="btn small danger" id="clearRollHistory">Limpar histórico</button></div><div id="rollHistoryList" class="roll-history-list"></div>';
   tp.appendChild(sec);
   el('clearRollHistory').onclick=clearHistory;
 }
 async function loadHistory(campaignId){
   const {data:rows,error}=await sb.from('campaign_rolls').select('*').eq('campaign_id',campaignId).order('created_at',{ascending:false}).limit(150);
   if(rollChannelCampaign!==campaignId)return;
   if(error){console.error('[Tulpa Mesa] histórico',error);rollsError='Histórico indisponível: '+(error.message||'erro')+'. Rode o arquivo tulpa-rolls.sql no Supabase.';rollHistory=[]}
   else{rollsError='';rollHistory=(rows||[]).filter(r=>!(r.detail&&r.detail.cmb)||['res','rollx'].includes(r.detail.cmb));(rows||[]).forEach(r=>shownRolls.add(r.id))}
   renderHistory();
 }
 async function clearHistory(){
   const c=camp();if(!c||role()!=='master')return;
   if(!confirm('Apagar todo o histórico de rolagens desta campanha? (A lista de itens criados não é afetada.)'))return;
   try{
     /* os itens criados da campanha não são rolagens: ficam fora da limpeza */const r1=await sb.from('campaign_rolls').delete().eq('campaign_id',c.id).is('detail->>cmb',null);if(r1.error)throw r1.error;const r2=await sb.from('campaign_rolls').delete().eq('campaign_id',c.id).neq('detail->>cmb','item');if(r2.error)throw r2.error;
     await loadHistory(c.id);
     if(rollHistory.length)toast('O banco recusou apagar o histórico (falta a política DELETE em campaign_rolls).');
     else toast('Histórico limpo.');
   }catch(e){console.error(e);toast('Não foi possível limpar o histórico: '+(e?.message||'erro'))}
 }
 function registerRoll(row){
   if(!row||!row.id)return;
   if(row.detail&&row.detail.cmb){shownRolls.add(row.id);window.tulpaOnCombatRow&&window.tulpaOnCombatRow(row);if(!['res','rollx'].includes(row.detail.cmb))return}
   if(!(row.detail&&row.detail.cmb))try{window.tulpaNarrateRoll?.({id:row.id,name:row.character_name,skill:row.skill,dice:row.dice,total:row.total,created_at:row.created_at})}catch(e){}
   if(!rollHistory.some(r=>r.id===row.id)){
     rollHistory.unshift(row);
     rollHistory.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
     rollHistory=rollHistory.slice(0,150);
     renderHistory();
   }
   if(!shownRolls.has(row.id)){shownRolls.add(row.id);queuePopup(row)}
 }
 // ---------- Canal em tempo real ----------
 function teardownRolls(){
   if(rollChannel){try{sb.removeChannel(rollChannel)}catch(e){}}
   rollChannel=null;rollChannelCampaign=null;rollHistory=[];rollsError='';shownRolls=new Set();popupQueue=[];
   clearTimeout(popupTimer);popupTimer=null;el('rollPopup')?.classList.remove('show');
 }
 function ensureRollChannel(){
   const c=camp();
   if(!c||!window.tulpaCloudUser){if(rollChannel)teardownRolls();return}
   if(rollChannel&&rollChannelCampaign===c.id)return;
   teardownRolls();
   const id=c.id;rollChannelCampaign=id;
   loadHistory(id);
   rollChannel=sb.channel('tulpa-rolls-'+id)
     .on('postgres_changes',{event:'INSERT',schema:'public',table:'campaign_rolls',filter:'campaign_id=eq.'+id},p=>{if(rollChannelCampaign===id)registerRoll(p.new)})
     .on('postgres_changes',{event:'DELETE',schema:'public',table:'campaign_rolls',filter:'campaign_id=eq.'+id},()=>{if(rollChannelCampaign===id)loadHistory(id)})
     .subscribe();
 }
 // ---------- Rolagem ----------
 async function rollTableSkill(charId,skill){
   if(busy)return;
   const c=camp(),ch=c?.characters.find(x=>x.id===charId);
   if(!c||!ch)return;
   if(!canRollFor(ch)){toast('Você só pode rolar pelo seu próprio personagem.');return}
   if(!BASE_SKILLS.includes(skill))return;
   busy=true;closeModal();
   try{
     const calc=skillCalc(ch,skill);
     const dice=Array.from({length:calc.n},d20),best=Math.max(...dice),total=best+calc.bonus;
     const user=window.tulpaCloudUser;
     const rollerLabel=role()==='master'?'Mestre':(user?.user_metadata?.display_name||user?.email?.split('@')[0]||'Jogador');
     const row={campaign_id:c.id,character_id:ch.id,character_name:ch.data?.name||'Personagem sem nome',roller_id:uid(),roller_label:rollerLabel,skill,attribute:calc.attr,dice,bonus:calc.bonus,total,detail:{best,base:calc.base,persistent:calc.persistent,talent:calc.once,team:calc.team}};
     const {data:saved,error}=await sb.from('campaign_rolls').insert(row).select('*').single();
     if(error)throw error;
     registerRoll(saved);
     // Habilidades de uso único com bônus nesta perícia são consumidas pela rolagem.
     if(calc.onceList.length){
       const used=new Set(calc.onceList.map(e=>e.id));
       ch.data.activeEffects=(ch.data.activeEffects||[]).filter(e=>!used.has(e.id));
       if(ch.id===activeCharacterId)data.activeEffects=ch.data.activeEffects;
       if(ch._sheetAvailable){
         const {error:se}=await sb.from('character_sheets').upsert({character_id:ch.id,sheet_data:{...ch.data,teamBonuses:ch.teamBonuses||ch.data?.teamBonuses||[]},vocations:ch.vocations||vocations,tracks:ch.tracks||tracks,updated_by:uid(),updated_at:new Date().toISOString()},{onConflict:'character_id'});
         if(se)console.error('[Tulpa Mesa] salvar efeitos consumidos',se);
       }
     }
   }catch(e){
     console.error('[Tulpa Mesa] rolagem',e);
     const missing=e?.code==='42P01'||e?.code==='PGRST205'||/campaign_rolls/i.test(e?.message||'');
     toast('Não foi possível registrar a rolagem: '+(e?.message||'erro')+(missing?' — rode o tulpa-rolls.sql no Supabase.':''));
   }finally{busy=false}
 }
 function openSkillPicker(charId){
   const c=camp(),ch=c?.characters.find(x=>x.id===charId);
   if(!ch||!canRollFor(ch))return;
   const recent=[...new Set(rollHistory.filter(r=>r.character_id===charId).map(r=>r.skill))].slice(0,4);
   openModal('ROLAGEM NA MESA',ch.data?.name||'Personagem',
     `<p class="sub">Escolha a perícia pedida pelo Mestre. O resultado aparece para toda a mesa.</p>${recent.length?`<div class="inline" style="margin:8px 0"><span class="sub">Recentes:</span>${recent.map(s=>`<button class="btn small" data-quick-skill="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}<input class="search" id="mesaSkillSearch" placeholder="Buscar perícia..." style="margin:8px 0 10px"><div class="mesa-skill-grid" id="mesaSkillGrid"></div>`,
     'Fechar',()=>closeModal());
   const grid=el('mesaSkillGrid');
   const draw=()=>{
     const q=(el('mesaSkillSearch').value||'').toLowerCase();
     const list=BASE_SKILLS.slice().sort((a,b)=>a.localeCompare(b,'pt-BR')).filter(s=>s.toLowerCase().includes(q));
     grid.innerHTML=list.map(s=>{const k=skillCalc(ch,s);return `<button class="mesa-skill" data-skill="${esc(s)}"><b>${esc(s)}</b><small>${esc(k.attr)} · ${k.n}d20 · ${sign(k.bonus)}</small></button>`}).join('')||'<div class="empty" style="grid-column:1/-1">Nenhuma perícia encontrada.</div>';
     grid.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>rollTableSkill(ch.id,b.dataset.skill));
   };
   el('mesaSkillSearch').oninput=draw;draw();
   el('modalBody').querySelectorAll('[data-quick-skill]').forEach(b=>b.onclick=()=>rollTableSkill(ch.id,b.dataset.quickSkill));
   setTimeout(()=>el('mesaSkillSearch')?.focus(),50);
 }
 // ---------- Integração com as telas existentes ----------
 const prevTable=window.renderTable;
 window.renderTable=function(){
   prevTable();
   const c=camp();if(!c)return;
   ensureRollChannel();ensureHistoryPanel();renderHistory();
   document.querySelectorAll('#tableCharacters .table-char').forEach(card=>{
     const ch=(c.characters||[]).find(x=>x.id===card.dataset.cid);
     if(!ch||!canRollFor(ch)||card.querySelector('.mesa-roll-btn'))return;
     const b=document.createElement('button');b.className='btn primary small mesa-roll-btn';b.textContent='🎲 Rolar perícia';b.onclick=()=>openSkillPicker(ch.id);
     const row=document.createElement('div');row.className='table-actions';
     const open=card.querySelector('[data-view-char]');
     if(open){card.insertBefore(row,open);row.appendChild(open)}else card.appendChild(row);
     row.insertBefore(b,row.firstChild);
   });
 };
 const prevChars=renderCharacters;
 renderCharacters=function(){prevChars();ensureRollChannel()};
 el('portalLogout')?.addEventListener('click',()=>setTimeout(teardownRolls,0));
 window.tulpaMesaDiagnostics=()=>({channel:!!rollChannel,campaign:rollChannelCampaign,history:rollHistory.length,error:rollsError});
})();
