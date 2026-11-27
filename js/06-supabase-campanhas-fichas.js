/* TULPA RPG — Etapa 2: campanhas, personagens, fichas e sincronização Supabase */
(()=>{
 'use strict';
 const sb=window.tulpaSupabase;
 if(!sb){console.error('[Tulpa Cloud] Cliente Supabase indisponível.');return}
 const $id=id=>document.getElementById(id);
 const user=()=>window.tulpaCloudUser;
 const role=()=>window.tulpaCloudRole;
 const uid=()=>user()?.id||null;
 const say=msg=>{if(typeof toast==='function')toast(msg);else console.log(msg)};
 const fail=(where,e)=>{console.error('[Tulpa Cloud] '+where,e);say((e?.message||'Falha ao comunicar com a nuvem.')+' ('+where+')')};
 const makeCode=()=>Math.random().toString(36).slice(2,8).toUpperCase();
 let cloudLoading=false, realtimeChannel=null, dashboardChannel=null, saveTimer=null, saveQueue=Promise.resolve(), combatRollCache=[];
 let lastCloudCampaignId=null;
 let endingCombat=false; // trava o recálculo de rolagens enquanto o combate está sendo encerrado
 const publicSummary=d=>window.tulpaPubSummary?window.tulpaPubSummary(d):({
   name:d?.name||'Personagem sem nome',
   stage:Number(d?.stage)||1,
   vital:Number(d?.vital)||0,
   lucidity:Number(d?.lucidity)||0,
   essence:Number(d?.essence)||0
 });
 const mapCampaign=c=>({
   id:c.id,code:c.invite_code,name:c.name,desc:c.description||'',
   createdBy:c.created_by,characters:[],participants:[]
 });
 const cleanCombatState=state=>({
   active:!!state?.active,
   phase:['rolling','active'].includes(state?.phase)?state.phase:'idle',
   round:Math.max(0,Math.trunc(Number(state?.round)||0)),
   turnIndex:Math.max(0,Math.trunc(Number(state?.turnIndex)||0)),
   participants:(Array.isArray(state?.participants)?state.participants:[]).map(x=>({characterId:String(x.characterId||''),name:String(x.name||'Participante'),rolled:!!x.rolled})).filter(x=>x.characterId),
   order:(Array.isArray(state?.order)?state.order:[]).map(x=>({characterId:String(x.characterId||''),name:String(x.name||'Participante'),done:!!x.done})).filter(x=>x.characterId)
 });
 /* a mesa de combate abre sozinha UMA vez por combate. Antes ela era reaberta a cada atualização em tempo real e tirava o jogador da ficha enquanto ele editava */
 function openCombatView(force){
   if(role()!=='player')return;
   {const cc=currentCampaign();if(cc?.combat?.active&&!force){if(window.__cbOpened===cc.id)return;window.__cbOpened=cc.id}else if(cc&&!cc.combat?.active)window.__cbOpened=''}
   if(activeCharacterId&&typeof syncActiveCharacter==='function')syncActiveCharacter();
   document.body.classList.add('app-locked');$id('portal').classList.remove('hide');$id('portal').style.display='block';$id('portal').setAttribute('aria-hidden','false');
   $id('portalDashboard').classList.add('hide');$id('campaignHub').classList.remove('hide');$id('charactersPanel').classList.add('hide');$id('tablePanel').classList.remove('hide');
   renderTable();
 }
 async function loadCombatState(campaignId){
   const {data,error}=await sb.from('campaign_runtime').select('combat_state').eq('campaign_id',campaignId).maybeSingle();
   if(error)throw error;
   const c=currentCampaign();if(c?.id===campaignId){c.combat=cleanCombatState(data?.combat_state||{});if(!c.combat.active&&window.__cbOpened===c.id)window.__cbOpened=''}
 }
 async function fetchCombatRolls(campaignId){
   const {data,error}=await sb.from('campaign_reflex_rolls').select('character_id,roller_id,dice,bonus,total,created_at').eq('campaign_id',campaignId);
   if(error)throw error;
   combatRollCache=data||[];
   return combatRollCache;
 }
 async function publishCombatState(state){
   if(role()!=='master')throw new Error('Somente o Mestre pode alterar o combate.');
   const c=currentCampaign();if(!c||!uid())throw new Error('Abra uma campanha antes de atualizar o combate.');
   const safeState=cleanCombatState(state);
   const {error}=await sb.rpc('save_campaign_combat_state',{p_campaign_id:c.id,p_combat_state:safeState});
   if(error)throw error;
   c.combat=safeState;renderTable();return safeState;
 }
 async function refreshCombatRolls(campaignId=currentCampaign()?.id){
   if(!campaignId)return [];
   try{
     const rolls=await fetchCombatRolls(campaignId),c=currentCampaign();
     if(c?.id===campaignId&&role()==='master'&&c.combat?.phase==='rolling'&&!endingCombat){
       const byId=new Map(rolls.map(r=>[r.character_id,r]));
       c.combat.participants=(c.combat.participants||[]).map(p=>({...p,rolled:byId.has(p.characterId)}));
       if(rolls.length>=(c.combat.participants||[]).length&&c.combat.participants.length){
         const order=c.combat.participants.map(p=>{const r=byId.get(p.characterId);return {characterId:p.characterId,name:p.name,done:false,_total:Number(r.total)||0,_best:Math.max(...(r.dice||[0]))}}).sort((a,b)=>b._total-a._total||b._best-a._best||a.name.localeCompare(b.name,'pt-BR')).map(({_total,_best,...entry})=>entry);
         await publishCombatState({...c.combat,active:true,phase:'active',round:1,turnIndex:0,order});
       }else await publishCombatState(c.combat);
     }
     if(c?.id===campaignId)renderTable();
     return rolls;
   }catch(e){console.error('[Tulpa Combat] Falha ao atualizar rolagens',e);return []}
 }
 const setCloudBadge=msg=>{
   let n=$id('tulpaCloudStatus');
   if(n)n.textContent=msg;
 };
 const setSheetSaveStatus=msg=>{
   const n=$id('saveStatus');
   if(n)n.textContent=msg;
 };
 const updateCampaignBadge=()=>{
   const n=$id('tulpaCampaignBadge');
   if(n)n.textContent='Campanha: '+(currentCampaign()?.name||'não vinculada');
 };
 async function loadDashboard(){
   if(!uid())return;
   const {data:campaigns,error}=await sb.from('campaigns')
     .select('id,name,description,invite_code,created_by,created_at,updated_at')
     .order('created_at',{ascending:false});
   if(error)throw error;
   /* a lista é refeita a cada aviso do banco (inclusive troca de mapa): a campanha aberta mantém personagens, combate e o resto já carregado */
   const prevCamps=new Map((portalStore.campaigns||[]).map(x=>[x.id,x]));
   portalStore.campaigns=(campaigns||[]).map(row=>{const n=mapCampaign(row),o=prevCamps.get(n.id);return o?{...o,...n,characters:o.characters||[],participants:o.participants||[]}:n});
    await refreshCampaignCharacterCounts();
   for(const c of portalStore.campaigns){
     const {data:members,error:me}=await sb.from('campaign_members')
       .select('user_id,role').eq('campaign_id',c.id);
     if(me)throw me;
     c.participants=(members||[]).map(m=>m.user_id);
     c.members=members||[];
   }
   renderCampaigns();
   subscribeDashboard();
   setCloudBadge('Nuvem sincronizada');
 }
  async function refreshCampaignCharacterCounts(){
    const campaigns=portalStore.campaigns||[];
    campaigns.forEach(c=>{c.characterCount=0});
    if(!campaigns.length)return;
    const ids=campaigns.map(c=>c.id);
    const {data:rows,error}=await sb.from('characters').select('campaign_id').in('campaign_id',ids);
    if(error)throw error;
    const counts=new Map();
    (rows||[]).forEach(row=>counts.set(row.campaign_id,(counts.get(row.campaign_id)||0)+1));
    campaigns.forEach(c=>{c.characterCount=counts.get(c.id)||0});
  }
 async function loadCampaignCharacters(campaignId){
   const {data:rows,error}=await sb.from('characters')
     .select('id,campaign_id,owner_id,owner_label,public_data,in_scene,created_at,updated_at')
     .eq('campaign_id',campaignId).order('created_at',{ascending:true});
   if(error)throw error;
   const ids=(rows||[]).map(r=>r.id);
   let sheets=[];
   if(ids.length){
     const {data,error:se}=await sb.from('character_sheets')
       .select('character_id,sheet_data,vocations,tracks,updated_by,updated_at')
       .in('character_id',ids);
     if(se)throw se;
     sheets=sheets||[];
     sheets=data||[];
   }
   const sheetMap=new Map(sheets.map(x=>[x.character_id,x]));
   const c=currentCampaign();
   if(!c||c.id!==campaignId)return;
   const prevChars=c.characters||[];
   c.characters=(rows||[]).map(r=>{
     const sh=sheetMap.get(r.id);
     const summary=r.public_data||{};
     /* ficha mexida há poucos segundos neste aparelho: o banco ainda pode estar com a cópia anterior, então vale a cópia local */
     const keep=prevChars.find(x=>x.id===r.id&&x._sheetAvailable&&window.__dirty&&Date.now()-(window.__dirty[r.id]||0)<6000);
     if(keep)return{...keep,ownerId:r.owner_id,ownerLabel:(!r.owner_id||r.owner_id===c.createdBy)?'Mestre':r.owner_label,inScene:r.in_scene};
     const characterData=sh?.sheet_data?{...blank(),...sh.sheet_data}:{...blank(),...summary};
     normalizeAgeAndService(characterData);
     /* sem acesso à ficha: os atributos acima são só o padrão; o motor usa a DF e os máximos publicados */
     if(!sh&&role()!=='master'&&r.owner_id!==uid())characterData._publico=true;
     return {
       id:r.id,ownerId:r.owner_id,ownerLabel:(!r.owner_id||r.owner_id===c.createdBy)?'Mestre':r.owner_label,
       inScene:r.in_scene,
       data:characterData,
       teamBonuses:sh?.sheet_data?.teamBonuses||[],
       vocations:sh?.vocations||clone(vocations),
       tracks:sh?.tracks||clone(tracks),
       _sheetAvailable:!!sh
     };
   });
    c.characterCount=c.characters.length;
   await loadCombatState(campaignId);
   await refreshCombatRolls(campaignId);
   renderCharacters();
   if(!$id('tablePanel').classList.contains('hide'))renderTable();
   if(role()==='player'&&c.combat?.active)openCombatView();
 }
 async function cloudOpenCampaign(id){
   window.__cbOpened='';
   portalCampaignId=id;
   updateCampaignBadge();
   const c=portalStore.campaigns.find(x=>x.id===id);
   if(!c){say('Campanha não encontrada ou sem permissão.');return}
   $id('portalDashboard').classList.add('hide');
   $id('campaignHub').classList.remove('hide');
   $id('hubCampaignName').textContent=c.name;
   $id('hubCampaignDesc').textContent=c.desc||'Campanha de Tulpa RPG';
   $id('charactersPanel').classList.remove('hide');
   $id('tablePanel').classList.add('hide');
   try{await loadCampaignCharacters(id);subscribeCampaign(id)}
   catch(e){fail('carregar personagens',e)}
 }
 async function createCloudCampaign(){
   if(role()!=='master'){say('Somente o Mestre pode criar campanhas.');return}
   const name=$id('campaignName').value.trim();
   if(!name){say('Informe o nome da campanha.');return}
   const button=$id('createCampaign');button.disabled=true;
   try{
     const {data,error}=await sb.from('campaigns').insert({
       name,description:$id('campaignDesc').value.trim(),
       invite_code:makeCode(),created_by:uid()
     }).select('id,name,description,invite_code,created_by').single();
     if(error)throw error;
     $id('campaignName').value='';$id('campaignDesc').value='';
     await loadDashboard();
     say('Campanha criada e salva na nuvem!');
   }catch(e){fail('criar campanha',e)}
   finally{button.disabled=false}
 }
 async function deleteCloudCampaign(id){
   if(role()!=='master'||!confirm('Excluir campanha e todos os personagens?'))return;
   try{
     const {error}=await sb.from('campaigns').delete().eq('id',id);
     if(error)throw error;
     if(portalCampaignId===id){portalCampaignId=null;activeCharacterId=null}
     await loadDashboard();say('Campanha excluída da nuvem.');
   }catch(e){fail('excluir campanha',e)}
 }
 async function joinCloudCampaign(){
   if(role()!=='player'){say('Entre como Player para usar um código.');return}
   const code=$id('joinCode').value.trim().toUpperCase();
   if(!code){say('Informe o código da campanha.');return}
   const button=$id('joinCampaign');button.disabled=true;
   try{
     const {data,error}=await sb.rpc('join_campaign_by_code',{p_invite_code:code});
     if(error)throw error;
     $id('joinCode').value='';
     await loadDashboard();say('Você entrou na campanha!');
   }catch(e){fail('entrar na campanha',e)}
   finally{button.disabled=false}
 }
 async function createCloudCharacter(){
   const c=currentCampaign();if(!c||!uid())return;
   let ownerId=uid(),ownerLabel=window.tulpaCloudUser?.user_metadata?.display_name||window.tulpaCloudUser?.email?.split('@')[0]||'Jogador';
   if(role()==='master'){
     try{
       const {data:members,error}=await sb.from('campaign_members').select('user_id').eq('campaign_id',c.id);
       if(error)throw error;
       const ids=(members||[]).map(m=>m.user_id);
       let profiles=[];
       if(ids.length){
         const {data,error:pe}=await sb.from('profiles').select('id,display_name').in('id',ids);
         if(pe)throw pe;profiles=data||[];
       }
       const opts=profiles.filter(p=>p.id!==uid()).map(p=>`<option value="${p.id}">${escapeHtml(p.display_name||'Jogador')}</option>`).join('');
       openModal('NOVO PERSONAGEM','Criar personagem',
         `<div class="field"><label>Quem controla esta ficha</label><select id="cloudNewCharOwner" onchange="var m=this.value==='${uid()}';document.getElementById('cloudNewCharHidden').checked=m;document.getElementById('cloudNewCharBoss').checked=m"><option value="${uid()}">Mestre — NPC, chefe ou personagem do Mestre</option>${opts}</select></div><label class="t3-check"><input type="checkbox" id="cloudNewCharHidden" checked> 👁 Criar com o olho desativado (invisível para os jogadores e fora do combate)</label><label class="t3-check"><input type="checkbox" id="cloudNewCharBoss" checked> 🔒 Ocultar Vital, Lucidez e Essência dos jogadores (inimigo / Boss)</label><p class="sub">Fichas do Mestre são controladas só por você; você decide se ela é um NPC ou um chefe. Escolha um jogador para que ele abra e edite a própria ficha.</p>`,
         'Criar',()=>{
           const selected=$id('cloudNewCharOwner').value;
           ownerId=selected;
           ownerLabel=selected===uid()?'Mestre':(profiles.find(p=>p.id===selected)?.display_name||'Jogador');
           insertCloudCharacter(c,ownerId,ownerLabel,{hidden:!!$id('cloudNewCharHidden')?.checked,boss:!!$id('cloudNewCharBoss')?.checked});
         });
       return;
     }catch(e){fail('listar participantes',e);return}
   }
   insertCloudCharacter(c,ownerId,ownerLabel);
 }
 async function insertCloudCharacter(c,ownerId,ownerLabel,opts={}){
   const button=$id('newCharacter');if(button)button.disabled=true;
   try{
     const initial={...blank(),...(opts.data||{})};if(opts.boss)initial.hideStats=true;
     E.migrateSheet(initial);
     const {data:row,error}=await sb.from('characters').insert({
       campaign_id:c.id,owner_id:ownerId,owner_label:ownerLabel,
       public_data:publicSummary(initial),in_scene:!opts.hidden
     }).select('id,campaign_id,owner_id,owner_label,public_data,in_scene').single();
     if(error)throw error;
     const {error:sheetError}=await sb.from('character_sheets').insert({
       character_id:row.id,sheet_data:initial,vocations,tracks,updated_by:uid()
     });
     if(sheetError)throw sheetError;
     await loadCampaignCharacters(c.id);
     if(ownerId!==uid()&&role()==='master'){say('Personagem criado para '+ownerLabel+'.');return}
     loadCharacter(row.id);
     say('Personagem criado e salvo na nuvem!');
   }catch(e){fail('criar personagem',e)}
   finally{if(button)button.disabled=false}
 }
 /* ids das fichas que este aparelho acabou de gravar: o eco do próprio salvamento não refaz a tela */
 const OWN_WRITE_AT={};
 function persistCloudCharacter(){
   saveTimer=null; /* nada pendente: a gravação começou */
   window.__sheetBusy=Date.now()+8000; /* até a gravação terminar, uma ficha que chega de fora não pode trocar a que está sendo editada */
   const ch=currentCharacter();
   if(!ch||!uid()||!window.tulpaCloudUser)return;
   const snapshot={id:ch.id,campaignId:portalCampaignId,ownerId:ch.ownerId,data:clone(data),vocations:clone(vocations),tracks:clone(tracks)};
   saveQueue=saveQueue.then(async()=>{
     OWN_WRITE_AT[snapshot.id]=Date.now();(window.__dirty=window.__dirty||{})[snapshot.id]=Date.now();
     const {error:ce}=await sb.from('characters').update({
       public_data:publicSummary(snapshot.data),updated_at:new Date().toISOString()
     }).eq('id',snapshot.id);
     if(ce)throw ce;
     const {error:se}=await sb.from('character_sheets').upsert({
       character_id:snapshot.id,sheet_data:snapshot.data,
       vocations:snapshot.vocations,tracks:snapshot.tracks,
       updated_by:uid(),updated_at:new Date().toISOString()
     },{onConflict:'character_id'});
     if(se)throw se;
     window.__sheetBusy=Date.now()+1500;
     setCloudBadge('Salvo na nuvem');
     setSheetSaveStatus('Salvo na nuvem · '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));
   }).catch(e=>{
     window.__sheetBusy=0;
     setCloudBadge('Falha ao salvar');
     setSheetSaveStatus('Erro ao salvar na nuvem');
     fail('salvar ficha',e);
   });
 }
 function scheduleCloudSave(){
   if(!currentCharacter()||!uid())return;
   if(saveTimer)clearTimeout(saveTimer);
   setCloudBadge('Salvando…');
   setSheetSaveStatus('Salvando na nuvem…');
   saveTimer=setTimeout(persistCloudCharacter,450);
 }
 function subscribeDashboard(){
   if(dashboardChannel)return;
   dashboardChannel=sb.channel('tulpa-dashboard-'+uid())
     .on('postgres_changes',{event:'*',schema:'public',table:'campaigns'},()=>{loadDashboard().catch(e=>console.error(e))})
     .on('postgres_changes',{event:'*',schema:'public',table:'campaign_members',filter:'user_id=eq.'+uid()},()=>{loadDashboard().catch(e=>console.error(e))})
      .on('postgres_changes',{event:'*',schema:'public',table:'characters'},()=>{refreshCampaignCharacterCounts().then(renderCampaigns).catch(e=>console.error(e))})
     .on('postgres_changes',{event:'*',schema:'public',table:'campaign_runtime'},async payload=>{
       if(role()!=='player'||!payload.new?.combat_state?.active)return;
       const id=payload.new.campaign_id;
       if(activeCharacterId&&typeof syncActiveCharacter==='function')syncActiveCharacter();
       if(portalCampaignId!==id)await cloudOpenCampaign(id);
       else {const c=currentCampaign();if(c)c.combat=cleanCombatState(payload.new.combat_state);openCombatView()}
     })
     .subscribe();
 }
 function subscribeCampaign(id){
   if(realtimeChannel)sb.removeChannel(realtimeChannel);
   realtimeChannel=sb.channel('tulpa-campaign-'+id)
     .on('postgres_changes',{event:'*',schema:'public',table:'characters',filter:'campaign_id=eq.'+id},async payload=>{if(payload?.new?.id&&Date.now()-(OWN_WRITE_AT[payload.new.id]||0)<3000)return;if(!cloudLoading)try{await loadCampaignCharacters(id)}catch(e){console.error(e)}})
     .on('postgres_changes',{event:'*',schema:'public',table:'campaign_runtime',filter:'campaign_id=eq.'+id},async payload=>{
       const c=currentCampaign();if(!c||c.id!==id)return;
       const nextState=cleanCombatState(payload.new?.combat_state||{}),previousRound=Number(c.combat?.round)||0;
       if(role()==='master'&&nextState.active&&nextState.round>previousRound)window.tulpaExpireRoundEffects?.();
       c.combat=nextState;
       if(!c.combat.active&&window.__cbOpened===c.id)window.__cbOpened='';
       if(c.combat.active&&role()==='player')openCombatView();
       renderTable();
     })
     .on('postgres_changes',{event:'*',schema:'public',table:'campaign_reflex_rolls',filter:'campaign_id=eq.'+id},async()=>{
       if(role()==='master')await refreshCombatRolls(id);
     })
     .on('postgres_changes',{event:'*',schema:'public',table:'character_sheets'},async payload=>{
       if(payload.new?.updated_by&&payload.new.updated_by===uid())return;
       if(payload.new?.character_id&&currentCampaign()?.characters.some(c=>c.id===payload.new.character_id)){
         try{
           await loadCampaignCharacters(id);
           if(activeCharacterId===payload.new.character_id){
             const fresh=currentCampaign()?.characters.find(c=>c.id===activeCharacterId);
             if(fresh?._sheetAvailable){if((saveTimer!==null||Date.now()<(window.__sheetBusy||0))&&window.tulpaMergeSheet){data=window.tulpaMergeSheet(data,clone(fresh.data))}else{data={...blank(),...clone(fresh.data)};vocations=clone(fresh.vocations||vocations);tracks=clone(fresh.tracks||tracks)}render()}
           }
         }catch(e){console.error(e)}
       }
     })
     .on('postgres_changes',{event:'*',schema:'public',table:'campaign_members',filter:'campaign_id=eq.'+id},async()=>{try{await loadDashboard()}catch(e){console.error(e)}})
     .subscribe(status=>{if(status==='SUBSCRIBED')setCloudBadge('Tempo real conectado')});
 }
 // Replace local-only portal operations with cloud-backed versions.
 const localOpenDashboard=openDashboard;
 openDashboard=function(r,playerId=null){
   portalRole=r;window.currentPlayerId=uid();
   $id('portalHome').classList.add('hide');$id('portalLogin').classList.add('hide');$id('campaignHub').classList.add('hide');$id('portalDashboard').classList.remove('hide');
   $id('portalRoleLabel').textContent=r==='master'?'PAINEL DO MESTRE':'ÁREA DO PLAYER';
   $id('portalGreeting').textContent=r==='master'?'Suas campanhas':'Meus personagens';
   $id('masterCreate').classList.toggle('hide',r!=='master');
   loadDashboard().catch(e=>fail('carregar campanhas',e));
 };
 openCampaign=cloudOpenCampaign;
 createCharacter=createCloudCharacter;
 window.tulpaInsertChar=(ownerLabel,opts)=>{const c=currentCampaign();if(!c||!uid())return Promise.resolve();return insertCloudCharacter(c,uid(),ownerLabel||'Mestre',opts||{})};
 loadCharacter=function(id){
   const ch=currentCampaign()?.characters.find(x=>x.id===id);
   if(!ch){say('Personagem não encontrado nesta campanha.');return false}
   if(role()!=='master'&&ch.ownerId!==uid()){say('Acesso negado. Você só pode abrir sua própria ficha.');return false}
   if(role()!=='master'&&!ch._sheetAvailable){say('Sua ficha ainda não foi carregada. Atualize a campanha e tente novamente.');return false}
   activeCharacterId=id;data={...blank(),...clone(ch.data)};
   vocations=clone(ch.vocations||vocations);tracks=clone(ch.tracks||tracks);
   updateCampaignBadge();
   setSheetSaveStatus(ch._sheetAvailable?'Ficha carregada da nuvem':'Resumo carregado · será salvo na nuvem');
   try{localStorage.setItem('tulpa-rpg-character',JSON.stringify(data))}catch(e){}
   render();showApp();say('Ficha carregada: '+(data.name||'Personagem'));return true;
 };
 const localSave=save;
 save=function(){
   localSave();
   const ch=currentCharacter();
   if(ch){ch.data=clone(data);ch.vocations=clone(vocations);ch.tracks=clone(tracks);scheduleCloudSave()}
   render();
 };
 const localPersist=persistOnly;
 persistOnly=function(){
   localPersist();
   const ch=currentCharacter();
   if(ch){ch.data=clone(data);ch.vocations=clone(vocations);ch.tracks=clone(tracks);scheduleCloudSave()}
 };
 syncActiveCharacter=function(){
   const ch=currentCharacter();if(!ch)return;
   ch.data=clone(data);ch.vocations=clone(vocations);ch.tracks=clone(tracks);
   scheduleCloudSave();
 };
 renderCampaigns=function(){
   const list=$id('campaignList');if(!list)return;
   const arr=portalStore.campaigns||[];
   $id('campaignCount').textContent=arr.length+' campanhas';
    list.innerHTML=arr.length?arr.map(c=>`<div class="campaign-item"><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.desc||'Campanha sem descrição')} · ${Number.isFinite(c.characterCount)?c.characterCount:(c.characters||[]).length} personagem(ns)${role()==='master'?' · Código: '+escapeHtml(c.code||'—'):''}</p><button class="btn primary small" data-campaign="${c.id}">Abrir campanha</button> ${role()==='master'?`<button class="btn danger small" data-delete-campaign="${c.id}">Excluir</button>`:''}</div>`).join(''):'<div class="empty" style="grid-column:1/-1">Nenhuma campanha disponível ainda.</div>';
   list.querySelectorAll('[data-campaign]').forEach(b=>b.onclick=()=>cloudOpenCampaign(b.dataset.campaign));
   list.querySelectorAll('[data-delete-campaign]').forEach(b=>b.onclick=()=>deleteCloudCampaign(b.dataset.deleteCampaign));
 };
 renderCharacters=function(){
   const c=currentCampaign(),list=$id('characterList');if(!c||!list)return;
   const chars=c.characters||[];
   const visible=chars.filter(ch=>role()==='master'||ch.ownerId===uid());
   list.innerHTML=visible.length?visible.map(ch=>`<div class="campaign-item"><h3>${escapeHtml(ch.data.name||'Personagem sem nome')}</h3><p>Estágio ${ch.data.stage||1} · ${escapeHtml(ch.ownerLabel||'Jogador')}</p><button class="btn primary small" data-open-char="${ch.id}">Abrir ficha</button> ${canDeleteCharacter(ch)?`<button class="btn danger small" data-delete-char="${ch.id}">Excluir</button>`:''}</div>`).join(''):'<div class="empty" style="grid-column:1/-1">Nenhum personagem seu nesta campanha.</div>';
   list.querySelectorAll('[data-open-char]').forEach(b=>b.onclick=()=>loadCharacter(b.dataset.openChar));
   list.querySelectorAll('[data-delete-char]').forEach(b=>b.onclick=()=>deleteCloudCharacter(b.dataset.deleteChar));
 };
 // Mestre exclui qualquer personagem (inclusive NPCs); Player exclui apenas os próprios.
 const canDeleteCharacter=ch=>!!ch&&(role()==='master'||(!!uid()&&ch.ownerId===uid()));
 async function deleteCloudCharacter(characterId){
   const c=currentCampaign(),ch=c?.characters.find(x=>x.id===characterId);
   if(!c||!ch){say('Personagem não encontrado.');return}
   if(!canDeleteCharacter(ch)){say('Você só pode excluir personagens criados por você.');return}
   const cm=c.combat;
   if(cm?.active&&((cm.participants||[]).some(p=>p.characterId===characterId)||(cm.order||[]).some(p=>p.characterId===characterId))){
     say('Encerre o combate antes de excluir este personagem.');return;
   }
   const label=ch.data?.name||'Personagem sem nome';
   if(!confirm('Excluir "'+label+'" definitivamente? A ficha será apagada da nuvem e não poderá ser recuperada.'))return;
   const tryDelete=()=>sb.from('characters').delete().eq('id',characterId).select('id');
   try{
     let {data:removed,error}=await tryDelete();
     // Sem ON DELETE CASCADE, o banco recusa por chave estrangeira: apaga os dependentes e tenta de novo.
     if(error&&error.code==='23503'){
       await sb.from('campaign_reflex_rolls').delete().eq('character_id',characterId);
       const {error:se}=await sb.from('character_sheets').delete().eq('character_id',characterId);
       if(se)throw se;
       ({data:removed,error}=await tryDelete());
     }
     if(error)throw error;
     if(!removed||!removed.length)throw new Error('O banco recusou a exclusão (falta a política DELETE em characters). Rode o arquivo tulpa-delete-policies.sql no Supabase.');
     if(activeCharacterId===characterId){
       activeCharacterId=null;
       if(saveTimer){clearTimeout(saveTimer);saveTimer=null}
     }
     await loadCampaignCharacters(c.id);
     say('Personagem excluído: '+label);
   }catch(e){fail('excluir personagem',e)}
 }
 // Cloud-backed create/join/delete actions.
 $id('createCampaign').onclick=()=>createCloudCampaign();
 $id('joinCampaign').onclick=()=>joinCloudCampaign();
 $id('newCharacter').onclick=()=>createCloudCharacter();
 // Resource controls on the shared table also persist their updates.
 const oldAdjust=adjustResource;
 adjustResource=function(charId,key,delta){
   const ch=currentCampaign()?.characters.find(x=>x.id===charId);if(!ch)return;
   if(role()!=='master'&&ch.ownerId!==uid()){say('Você só pode alterar seus próprios recursos.');return}
   const max=({vital:stageStatsFor(ch.data).vt,lucidity:stageStatsFor(ch.data).luc,essence:stageStatsFor(ch.data).es})[key];
   ch.data[key]=Math.max(0,Math.min(max,(Number(ch.data[key])||0)+delta));
   const d=ch.data;
   sb.from('characters').update({public_data:publicSummary(d),updated_at:new Date().toISOString()}).eq('id',ch.id)
     .then(({error})=>{if(error)fail('atualizar recursos',error)});
   if(ch.id===activeCharacterId){data[key]=ch.data[key];renderStats();scheduleCloudSave()}
   renderTable();
 };
 // Keep the local export/import functionality, but cloud data remains authoritative.
 $id('portalLogout').onclick=async()=>{
   if(realtimeChannel){await sb.removeChannel(realtimeChannel);realtimeChannel=null}
   if(dashboardChannel){await sb.removeChannel(dashboardChannel);dashboardChannel=null}
   try{await sb.auth.signOut()}catch(e){console.error(e)}
   window.tulpaCloudUser=null;window.tulpaCloudRole=null;window.currentPlayerId=null;portalRole='';portalCampaignId=null;activeCharacterId=null;
   updateCampaignBadge();setSheetSaveStatus('Salvo localmente');
   portalHome();setCloudBadge('Desconectado');
 };
 // Restore the active user and cloud data after a reload.
 sb.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'){window.tulpaCloudUser=null;window.tulpaCloudRole=null;return}
   if(session?.user&&!window.tulpaCloudUser){setTimeout(async()=>{
     try{
       const {data:p,error}=await sb.from('profiles').select('id,display_name,role').eq('id',session.user.id).single();
       if(error)throw error;
       const normalizedRole=window.tulpaNormalizeProfileRole?.(p.role);
       if(!normalizedRole)throw new Error('Função do perfil não reconhecida. Confira o campo profiles.role no Supabase.');
       window.tulpaCloudUser=session.user;window.tulpaCloudRole=normalizedRole;
       openDashboard(normalizedRole,session.user.id);
     }catch(e){fail('restaurar sessão',e)}
   },0)}
 });
 window.tulpaSaveCombatState=state=>publishCombatState(state);
 window.tulpaBeginCombat=async()=>{
   if(role()!=='master'){say('Somente o Mestre pode iniciar o combate.');return}
   const c=currentCampaign();if(!c){say('Abra uma campanha antes de iniciar o combate.');return}
   const participants=(c.characters||[]).filter(ch=>ch.inScene!==false&&!(ch.data?.statuses||[]).some(s=>(s&&s.id||s)==='morto')).map(ch=>({characterId:ch.id,name:ch.data?.name||'Sem nome',rolled:false}));
   if(!participants.length){say('Marque pelo menos um personagem como visível na cena.');return}
   try{
     const {error:de}=await sb.from('campaign_reflex_rolls').delete().eq('campaign_id',c.id);if(de)throw de;
     combatRollCache=[];
     await publishCombatState({active:true,phase:'rolling',round:1,turnIndex:0,participants,order:[]});
     $id('charactersPanel').classList.add('hide');$id('tablePanel').classList.remove('hide');$id('combatPanel')?.classList.remove('hide');
     renderTable();if(typeof tone==='function')tone('start');say('Combate iniciado. Players, rolem o Reflexo dos seus personagens.');
   }catch(e){fail('iniciar combate',e)}
 };
 window.tulpaEndCombat=async()=>{
   if(role()!=='master')return;
   const c=currentCampaign();if(!c)return;
   if(endingCombat)return;
   endingCombat=true;
   try{
     // 1) Desliga o combate primeiro. Antes, apagar as rolagens disparava um evento em tempo real
     //    que republicava o estado "rolling" e desfazia o encerramento.
     await publishCombatState({active:false,phase:'idle',round:0,turnIndex:0,participants:[],order:[]});
     $id('combatPanel')?.classList.add('hide');
     $id('roundPanel')?.classList.add('hide');
     // 2) Limpa as rolagens de Reflexo. Se falhar, o combate já está encerrado: só avisa.
     const {error:re}=await sb.from('campaign_reflex_rolls').delete().eq('campaign_id',c.id);
     if(re){console.error('[Tulpa Combat] limpar rolagens',re);say('Combate encerrado, mas não foi possível limpar as rolagens antigas.')}
     combatRollCache=[];
     // 3) Efeitos que duram "até o fim da cena" terminam junto com o combate.
     for(const ch of c.characters||[]){
       const before=ch.data?.activeEffects||[],after=before.filter(x=>x.type!=='scene');
       if(after.length===before.length)continue;
       ch.data.activeEffects=after;
       ch.data.activeTalents=(ch.data.activeTalents||[]).filter(id=>after.some(x=>x.source===id));
       if(ch.id===activeCharacterId){data.activeEffects=ch.data.activeEffects;data.activeTalents=ch.data.activeTalents}
       const {error:se}=await sb.from('character_sheets').upsert({character_id:ch.id,sheet_data:{...ch.data,teamBonuses:ch.teamBonuses||ch.data?.teamBonuses||[]},vocations:ch.vocations||vocations,tracks:ch.tracks||tracks,updated_by:uid(),updated_at:new Date().toISOString()},{onConflict:'character_id'});
       if(se)console.error('[Tulpa Combat] salvar efeitos de cena',se);
     }
     renderTable();
     if(typeof fx==='function')fx('round');
     say('Combate encerrado.');
   }catch(e){fail('encerrar combate',e)}
   finally{endingCombat=false}
 };
 window.tulpaSetCharacterPresence=async(characterId,visible)=>{
   if(role()!=='master')return;
   try{
     const {error}=await sb.from('characters').update({in_scene:!!visible,updated_at:new Date().toISOString()}).eq('id',characterId);if(error)throw error;
     const ch=currentCampaign()?.characters.find(x=>x.id===characterId);if(ch)ch.inScene=!!visible;
     renderTable();if(typeof tone==='function')tone();
   }catch(e){fail('atualizar presença na cena',e)}
 };
 window.tulpaRollReflexForCharacter=async characterId=>{
   const c=currentCampaign(),ch=c?.characters.find(x=>x.id===characterId);if(!c||!ch)return;
   if(role()==='player'&&ch.ownerId!==uid()){say('Você só pode rolar pelo seu próprio personagem.');return}
   if(role()==='master'&&ch.ownerId&&ch.ownerId!==uid()){say('O Player rola o Reflexo do próprio personagem.');return}
   try{
     const {data,error}=await sb.rpc('roll_campaign_reflex',{p_campaign_id:c.id,p_character_id:characterId});if(error)throw error;
     const p=c.combat?.participants?.find(x=>x.characterId===characterId);if(p)p.rolled=true;
     if(role()==='master')await refreshCombatRolls(c.id);else renderTable();
     if(typeof tone==='function')tone('dice');say('Reflexo registrado. Os dados não são exibidos na tela compartilhada.');
   }catch(e){fail('rolar Reflexo',e)}
 };
 window.tulpaRollNpcReflexes=async()=>{
   if(role()!=='master'){say('Somente o Mestre pode rolar NPCs e chefes.');return}
   const c=currentCampaign();if(!c)return;
   const todo=(c.combat?.participants||[]).filter(p=>{const ch=c.characters.find(x=>x.id===p.characterId);return ch&&(!ch.ownerId||ch.ownerId===uid())&&!p.rolled});
   if(!todo.length){say('Não há NPCs ou chefes aguardando Reflexo.');return}
   for(const p of todo)await window.tulpaRollReflexForCharacter(p.characterId);
 };
 window.tulpaCompletePlayerTurn=async characterId=>{
   const c=currentCampaign();if(!c)return;
   try{
     const {data,error}=await sb.rpc('complete_player_combat_turn',{p_campaign_id:c.id,p_character_id:characterId});if(error)throw error;
     c.combat=cleanCombatState(data);renderTable();if(typeof fx==='function')fx('confirm');
   }catch(e){fail('concluir ação',e)}
 };
 window.tulpaPersistCombatSheets=async()=>{
   if(role()!=='master')return;
   const c=currentCampaign();if(!c)return;
   for(const ch of c.characters||[]){
     const {error}=await sb.from('character_sheets').upsert({character_id:ch.id,sheet_data:ch.data,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks,updated_by:uid(),updated_at:new Date().toISOString()},{onConflict:'character_id'});
     if(error)throw error;
   }
 };
 window.tulpaPersistCharacterData=async ch=>{
   if(role()!=='master'||!ch?.id)return;
   const {error}=await sb.from('character_sheets').upsert({character_id:ch.id,sheet_data:{...ch.data,teamBonuses:ch.teamBonuses||ch.data?.teamBonuses||[]},vocations:ch.vocations||vocations,tracks:ch.tracks||tracks,updated_by:uid(),updated_at:new Date().toISOString()},{onConflict:'character_id'});
   if(error)fail('salvar bônus do personagem',error);
 };
 // Expose a read-only diagnostic for support.
 window.tulpaCloudDiagnostics=()=>({authenticated:!!uid(),role:role(),campaigns:portalStore.campaigns.length,activeCampaign:portalCampaignId,activeCharacter:activeCharacterId});
})();
