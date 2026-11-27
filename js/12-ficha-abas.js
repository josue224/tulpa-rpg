/* ===== TULPA · ETAPA 3 — abas da ficha ===== */
const TABS=[['inventory','▣','Inventário & Carga'],['states','☠','Estados'],['mind','☾','Lucidez & Trauma'],['combat','⚔','Combate & Defesa'],['rest','☕','Descanso & Cura']];
function ensureTabs(){
  if($('tab-inventory'))return;
  const main=$q('.main'),side=$q('.side'),before=$q('[data-tab="records"]');
  TABS.forEach(([id,ico,label])=>{
    const sec=document.createElement('section');sec.className='tab';sec.id='tab-'+id;main.insertBefore(sec,$('tab-records'));
    const b=document.createElement('button');b.className='navbtn';b.dataset.tab=id;b.innerHTML=`<span class="ico">${ico}</span> ${label}`;side.insertBefore(b,before);
    b.onclick=()=>{$$('.navbtn').forEach(x=>x.classList.toggle('active',x===b));$$('.tab').forEach(x=>x.classList.toggle('active',x.id==='tab-'+id))};
  });
  const ov=$('tab-overview');const extra=document.createElement('div');extra.id='overviewExtra';ov.insertBefore(extra,ov.children[1]);
  sec('inventory','<div id="invBody"></div><div class="panel"><div class="panel-head"><h2>Adicionar item</h2><select id="addKind" class="search" style="max-width:190px"><option value="weapon">Armas (manual)</option><option value="prot">Proteções (manual)</option><option value="gear">Equipamentos / bolso</option><option value="mine">★ Meus itens e da campanha</option><option value="custom">＋ Criar item novo</option></select></div><input class="search" id="addSearch" placeholder="Buscar..." style="margin:10px 0"><div id="addList" class="skill-grid t3-scroll"></div></div>');
  sec('states','<div id="stActive"></div><div class="panel"><div class="panel-head"><h2>Aplicar estado</h2><span class="pill" id="stCount"></span></div><p class="sub">Escolha um estado na lista: os bônus e penalidades entram automaticamente nas rolagens, na Defesa e no combate, e ficam até você remover. Estados que causam dano (veneno, sangramento, fogo, afogamento) são descontados sozinhos no início do seu turno em combate.</p><div class="inline" style="margin:10px 0"><input class="search" id="stSearch" placeholder="Buscar estado..." style="flex:1"><select id="stGroup" class="search" style="max-width:170px"><option value="">Todos</option><option value="manual">Tabela de Estado</option><option value="sistema">Sistema</option></select></div><div id="stList" class="t3-scroll t3-list"></div></div>');
  sec('mind','<div id="mindBody"></div>');
  sec('combat','<div id="combatTabBody"></div>');
  sec('rest','<div id="restBody"></div>');
  $('addKind').onchange=renderAddList;$('addSearch').oninput=renderAddList;$('stSearch').oninput=renderStatesList;$('stGroup').onchange=renderStatesList;
  function sec(id,html){$('tab-'+id).innerHTML=html}
  NAV.mo&&$$('.tab').forEach(t=>NAV.mo.observe(t,{attributes:true,attributeFilter:['class']}));
}
T3.renderSheetTabs=function(){
  ensureTabs();T3.loadItemRows?.();
  try{renderInventory();renderAddList();renderStatesTab();renderMind();renderCombatTab();renderRest();T3.renderOverviewExtra()}catch(e){console.error('[T3] render abas',e)}
};

/* ---------- visão geral ---------- */
T3.renderOverviewExtra=function(){
  const box=$('overviewExtra');if(!box)return;
  const m=E.computeMods(data),di=E.defenseInfo(data),ci=E.cargaInfo(data,E.hasEffect(data,'Força do Cotidiano'));
  const chips=(data.statuses||[]).map(s=>`<span class="tag t3-chip-bad">${esc(STATUS_BY_ID[s.id]?.name||s.id)}${s.id==='agonia'?' · '+(s.turns??3)+' turno(s)':''}</span>`).join('')||'<span class="sub">Nenhum estado ativo.</span>';
  const eff=(data.activeEffects||[]).map(e=>`<span class="tag t3-chip-good">${esc(e.name)}</span>`).join('');
  box.innerHTML=`${data.collapsePending?`<div class="notice t3-alert">⚠ Lucidez em 0 — o <b>Protocolo de Colapso</b> ainda não foi resolvido. <button class="btn primary small" id="ovCollapse">Rolar agora</button></div>`:''}<div class="panel"><div class="panel-head"><h2>Situação atual</h2><span class="pill">Defesa ${di.DF} (base ${di.DB} ${sign(di.DF-di.DB)})</span></div><div class="t3-grid3"><div><div class="sub">Estados</div><div class="inline">${chips}</div></div><div><div class="sub">Habilidades ativas</div><div class="inline">${eff||'<span class="sub">Nenhuma.</span>'}</div></div><div><div class="sub">Carga</div><b>${ci.carga} / ${ci.limit}</b> <span class="sub">${ci.label}</span></div></div>${m.sources.length?`<div class="sub" style="margin-top:8px">Modificadores em vigor: ${m.sources.map(esc).join(' · ')}</div>`:''}${data.extase?.on?`<div class="sub" style="margin-top:6px">✦ Êxtase: ${esc(EXTASE_BY_ID[data.extase.bonus]?.name||'escolha um bônus na aba Lucidez')}</div>`:''}</div>`;
  $('ovCollapse')&&($('ovCollapse').onclick=()=>T3.collapseModal());
};

/* ---------- inventário ---------- */
const LOCS={maos:'Mãos',cintura:'Cintura / Coldre (saque rápido)',bandoleira:'Bandoleira (saque rápido)',bolso:'Bolsos',mochila:'Mochila / Maleta',vestido:'Vestido (no corpo)',chao:'Largado / fora do corpo'};
/* bônus de FOR/DES no dano, calculado pelo motor */
function wDmgTag(w,peso){const b=E.damageBonus(data,{...w,peso:w.peso||peso});return b.bonus?`<span class="tag t3-chip-good" title="Bônus de ${b.attr} no dano">dano ${sign(b.bonus)} ${b.attr.slice(0,3).toUpperCase()}</span>`:''}
function itemLine(it){
  let info='';
  if(it.kind==='weapon'){const w=it.w||{};info=`<span class="tag">${esc(w.skill||'—')}</span><span class="tag">${esc(w.dado)}</span>${wDmgTag(w,it.peso)}<span class="tag">crít. ${w.critMin>=20?'20':w.critMin+'-20'}</span>${w.area?'<span class="tag">área</span>':''}${(w.effects||[]).map(e=>`<span class="tag t3-chip-bad">${STATUS_BY_ID[e.status]?.name||e.status} (${e.when==='crit'?'crítico':'acerto'})</span>`).join('')}${w.note?`<span class="sub">${esc(w.note)}</span>`:''}`}
  if(it.kind==='weapon'){
    const favTrack=['Arsenal Mental','Lâmina Psíquica'].includes(data.track);
    if(favTrack)info+=`<button class="btn small ${data.favWeaponId===it.id?'primary':''}" data-fav="${it.id}" title="Devastador Mental / Espada do Pensamento: no Estágio 10 a Arma Favorita ganha +1 dado de dano e +2 na margem de ameaça">${data.favWeaponId===it.id?'★ Favorita':'☆ Marcar favorita'}${data.favWeaponId===it.id&&(Number(data.stage)||1)<10?' (ativa no Estágio 10)':''}</button>`;
    if(it.w?.cat==='Distância'&&it.w?.skill==='Armas de Disparo')info+=`<label class="t3-check" title="Cada ataque gasta 1 Munição solta do inventário"><input type="checkbox" data-ammo="${it.id}" ${it.useAmmo?'checked':''}> controlar munição</label>`;
  }
  if(it.kind==='prot')info=`<span class="tag">Defesa +${it.p.def}</span><span class="tag">${esc(SLOT_LABEL[it.p.slot])}</span>${it.loc==='vestido'&&it.p.def>0?(E.autoProficient(data)?'<span class="tag t3-chip-good">proficiente (arquétipo/vocação)</span>':`<label class="t3-check" title="Sem proficiência, a retaliação só acontece se a Esquiva/Reflexo superar a sua DF"><input type="checkbox" data-prof="${it.id}" ${it.prof?'checked':''}> tenho proficiência</label>`):''}`;
  const locs=it.kind==='prot'?['vestido','mochila','maos','chao']:it.kind==='weapon'?['maos','cintura','bandoleira','bolso','mochila','chao']:['maos','cintura','bolso','mochila','chao'];
  const qty=it.peso==='Bolso'||it.kind==='gear'?`<span class="inline"><button class="btn small" data-qty="${it.id}|-1">−</button><b>${it.qty||1}</b><button class="btn small" data-qty="${it.id}|1">+</button></span>`:'';
  return `<div class="t3-item"><div class="grow"><b>${esc(it.name)}</b> <span class="pill">${it.peso}${it.peso!=='Bolso'?' · '+E.itemCarga(it)+' carga':''}</span><div class="inline" style="margin-top:4px">${info}</div>${it.note&&it.note!=='personalizada'?`<div class="sub">${esc(it.note)}</div>`:''}</div>${qty}${camp3()&&chars3().length>1?`<button class="btn small" data-give="${it.id}" title="Entregar a outro personagem">🎁 Dar</button>`:''}<select data-move="${it.id}" class="search" style="max-width:190px">${locs.map(l=>`<option value="${l}" ${it.loc===l?'selected':''}>${LOCS[l]}</option>`).join('')}</select><button class="btn danger small" data-del-item="${it.id}">✕</button></div>`;
}
function renderInventory(){
  const inv=E.ensureInv(data),ci=E.cargaInfo(data,E.hasEffect(data,'Força do Cotidiano')),di=E.defenseInfo(data);
  const pen=['Sem penalidades.','<b>Pesado:</b> −1 dado em Acrobacia, Atletismo, Escalada, Esquiva, Furtividade, Natação e Reflexo; −2 na Defesa.','<b>Sobrecarregado:</b> não corre nem salta; Exausto; −2 dados em Esquiva e Reflexo; −5 na Defesa.','<b>Imobilizado:</b> não avança, não ataca nem esquiva.'][ci.level];
  const pct=Math.min(100,ci.carga/ci.limit*100);
  const zones=Object.keys(LOCS).map(l=>{const its=inv.items.filter(i=>i.loc===l);return its.length||['maos','cintura','vestido'].includes(l)?`<div class="t3-zone"><h4>${LOCS[l]}${l==='maos'?` <span class="sub">(${E.handsUsed(data)}/2 mãos)</span>`:''}</h4>${its.map(itemLine).join('')||'<div class="sub">Vazio.</div>'}</div>`:''}).join('');
  $('invBody').innerHTML=`<div class="panel"><div class="panel-head"><h2>Carga</h2><span class="pill">${ci.label}</span></div><div class="stat"><div class="value">${ci.carga}<span class="max"> / ${ci.limit} (${E.regra('cargaBase')} + Força${E.regra('cargaPorFor')===1?'':' × '+E.regra('cargaPorFor')}${inv.mochila?' + '+E.regra('cargaMochila')+' mochila':''})</span></div><div class="bar"><span style="width:${pct}%;${ci.level?'background:#a33':''}"></span></div></div><div class="notice" style="margin-top:8px">${pen}</div><div class="inline" style="margin-top:10px"><label><input type="checkbox" id="invMochila" ${inv.mochila?'checked':''}> Possui mochila/maleta (+${E.regra('cargaMochila')} de carga)</label><label><input type="checkbox" id="invBand" ${inv.bandoleira?'checked':''}> Possui bandoleira (1 arma Pesada)</label><button class="btn danger small" id="invDump" ${inv.mochila?'':'disabled'}>Descarte de Emergência (mochila)</button></div><p class="sub" style="margin-top:8px">Corpo: 2 mãos · cintura/coldre até 2 itens Leves/Médios · bolsos até 2 itens Leves · itens minúsculos custam 0 (a cada 5, 1 de carga). Saque Rápido: ação livre 1×/turno. Sacar da mochila: 1 ação padrão.</p></div><div class="panel"><div class="panel-head"><h2>Defesa</h2><span class="pill">DF ${di.DF}</span></div><p class="sub">Defesa Base (DB) ${di.DB} + proteções vestidas ${di.equip>=0?'+'+di.equip:di.equip} ${di.mods?`+ modificadores ${sign(di.mods)}`:''} ${di.dex?`+ Destreza +${di.dex}`:''} = <b>${di.DF}</b>.${di.dexWhy==='protecao-pesada'?' Proteção Pesada vestida: a Destreza não soma.':di.dexWhy==='sobrecarga'?' Excesso de carga: a Destreza não soma.':''} Vista roupas, colete, capacete e escudo (1 de cada) na zona “Vestido”.</p></div><div class="panel"><div class="panel-head"><h2>Equipamento</h2><span class="pill">${inv.items.length} itens</span></div><div class="t3-zones">${zones}</div></div>`;
  $('invMochila').onchange=e=>{if(!e.target.checked&&inv.items.some(i=>i.loc==='mochila')){toast('Retire os itens da mochila antes.');e.target.checked=true;return}inv.mochila=e.target.checked;save()};
  $('invBand').onchange=e=>{if(!e.target.checked&&inv.items.some(i=>i.loc==='bandoleira')){toast('Retire a arma da bandoleira antes.');e.target.checked=true;return}inv.bandoleira=e.target.checked;save()};
  $('invDump').onclick=()=>{if(!confirm('Descartar TODO o conteúdo da mochila?'))return;inv.items.forEach(i=>{if(i.loc==='mochila')i.loc='chao'});inv.mochila=false;save();toast('Mochila descartada.')};
  $$('[data-move]').forEach(s=>s.onchange=()=>moveItem(s.dataset.move,s.value));
  $$('[data-give]').forEach(b=>b.onclick=()=>giveItem(b.dataset.give));
  $$('[data-fav]').forEach(b=>b.onclick=()=>{data.favWeaponId=data.favWeaponId===b.dataset.fav?'':b.dataset.fav;save();toast(data.favWeaponId?'Arma Favorita marcada.':'Arma Favorita desmarcada.')});
  $$('[data-ammo]').forEach(c=>c.onchange=()=>{const it=inv.items.find(i=>i.id===c.dataset.ammo);if(it){it.useAmmo=c.checked;save()}});
  $$('[data-prof]').forEach(c=>c.onchange=()=>{const it=inv.items.find(i=>i.id===c.dataset.prof);if(it){it.prof=c.checked;save()}});
  $$('[data-del-item]').forEach(b=>b.onclick=()=>{inv.items=inv.items.filter(i=>i.id!==b.dataset.delItem);save()});
  $$('[data-qty]').forEach(b=>b.onclick=()=>{const [id,dl]=b.dataset.qty.split('|'),it=inv.items.find(i=>i.id===id);if(!it)return;it.qty=Math.max(0,(Number(it.qty)||1)+Number(dl));if(!it.qty)inv.items=inv.items.filter(i=>i.id!==id);save()});
}
function moveItem(id,loc){
  const inv=E.ensureInv(data),it=inv.items.find(i=>i.id===id);if(!it)return;
  if(loc==='vestido'&&it.kind==='prot'){
    const occ=inv.items.find(x=>x.id!==id&&x.loc==='vestido'&&x.p?.slot===it.p.slot);
    if(occ){toast(`Já há ${occ.name} no espaço ${SLOT_LABEL[it.p.slot]}. Remova-o antes.`);renderInventory();return}
    if(it.p.slot==='escudo'&&E.handsUsed(data)+1>2){toast('Sem mão livre para o escudo.');renderInventory();return}
  }
  if(it.kind==='prot'&&loc==='maos'&&E.handsUsed(data)+1>2){toast('Suas mãos estão ocupadas.');renderInventory();return}
  const v=it.kind==='prot'&&['vestido','mochila','maos','chao'].includes(loc)?(loc==='mochila'?E.validPlacement(data,it,'mochila'):{ok:true}):E.validPlacement(data,it,loc);
  if(!v.ok){toast(v.msg);renderInventory();return}
  it.loc=loc;save();
}
T3.moveItem=moveItem;
const ITEM_KEY=()=>'tulpa_items_'+(uid3()||'local');
const localItems=()=>{try{return JSON.parse(localStorage.getItem(ITEM_KEY())||'[]')}catch(e){return[]}};
const saveLocalItems=a=>{try{localStorage.setItem(ITEM_KEY(),JSON.stringify(a))}catch(e){}};
T3.items={campaign:[],loadedFor:null};
const allCustomItems=()=>{const m=new Map();[...localItems(),...T3.items.campaign].forEach(i=>m.set(i.id,i));return[...m.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))};
T3.allCustomItems=allCustomItems;
const toInv=ci=>{const b={kind:ci.kind,name:ci.name,peso:ci.peso,note:ci.note||''};if(ci.kind==='weapon')b.w={...ci.w,effects:(ci.w.effects||[]).map(e=>({...e}))};if(ci.kind==='prot')b.p={...ci.p};if(ci.kind==='gear')b.qty=1;return b};
function saveCustomItem(ci,share=true){
  const a=localItems().filter(x=>x.id!==ci.id);a.push(ci);saveLocalItems(a);
  if(!T3.items.campaign.some(x=>x.id===ci.id))T3.items.campaign.push(ci);
  if(share)T3.shareItem?.('add',ci);
}
function deleteCustomItem(id){
  saveLocalItems(localItems().filter(x=>x.id!==id));T3.items.campaign=T3.items.campaign.filter(x=>x.id!==id);T3.shareItem?.('del',{id});renderAddList();
}
const KINDLBL={weapon:'Arma',prot:'Proteção',gear:'Equipamento'};
function renderAddList(){
  const k=$('addKind')?.value||'weapon',q=($('addSearch')?.value||'').toLowerCase(),box=$('addList');if(!box)return;
  $('addSearch').style.display=k==='custom'?'none':'';
  if(k==='custom'){
    box.className='t3-form';
    box.innerHTML=`<div class="field"><label>Tipo de item</label><select id="ciKind"><option value="weapon">Arma</option><option value="prot">Proteção (Defesa)</option><option value="gear">Equipamento / objeto</option></select></div><div class="field"><label>Nome</label><input id="ciName" placeholder="Ex.: Facão enferrujado"></div><div class="field"><label>Peso</label><select id="ciPeso"><option>Leve</option><option selected>Médio</option><option>Pesado</option><option value="Bolso">Bolso (minúsculo, 0 de carga)</option></select></div>
    <div class="field ci-w"><label>Categoria</label><select id="ciCat"><option>Corpo a corpo</option><option>Distância</option><option>Especial</option></select></div><div class="field ci-w"><label>Perícia de ataque</label><select id="ciSkill"><option>Armas Brancas</option><option>Armas de Disparo</option><option>Briga</option><option>Arremesso</option></select></div><div class="field ci-w"><label>Dano (ex.: 1d8, 2d6+1)</label><input id="ciDado" value="1d6"></div><div class="field ci-w"><label>Margem de crítico</label><select id="ciCrit"><option value="20">20</option><option value="19">19–20</option><option value="18">18–20</option></select></div><div class="field ci-w"><label>Estado causado</label><select id="ciStatus"><option value="">Nenhum</option>${STATUS_DEFS.filter(s=>s.group==='manual').map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></div><div class="field ci-w"><label>Quando aplica</label><select id="ciWhen"><option value="crit">No crítico</option><option value="hit">Em todo acerto</option></select></div><label class="t3-check ci-w"><input type="checkbox" id="ciArea"> Dano em área</label>
    <div class="field ci-p" style="display:none"><label>Defesa que concede</label><input id="ciDef" type="number" min="0" max="20" value="2"></div><div class="field ci-p" style="display:none"><label>Espaço no corpo</label><select id="ciSlot">${Object.entries(SLOT_LABEL).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>
    <div class="field" style="grid-column:1/-1"><label>Descrição / observações (opcional)</label><textarea id="ciNote" rows="2" placeholder="Efeito narrativo, origem, regras especiais..."></textarea></div>
    <label class="t3-check"><input type="checkbox" id="ciAdd" checked> Adicionar ao meu inventário agora</label><label class="t3-check"><input type="checkbox" id="ciShare" checked> Salvar na lista (aparece para todos da campanha)</label><button class="btn primary" id="ciCreate">Criar item</button>`;
    const sync=()=>{const kd=$('ciKind').value;$$('.ci-w',box).forEach(e=>e.style.display=kd==='weapon'?'':'none');$$('.ci-p',box).forEach(e=>e.style.display=kd==='prot'?'':'none')};
    $('ciKind').onchange=sync;sync();
    $('ciCreate').onclick=()=>{
      const name=$('ciName').value.trim();if(!name){toast('Dê um nome ao item.');return}
      const kind=$('ciKind').value,ci={id:rid(),kind,name,peso:$('ciPeso').value,note:$('ciNote').value.trim(),by:(data.name||'Jogador'),byId:uid3()};
      if(kind==='weapon'){const dado=$('ciDado').value.trim();if(!/^\d+d\d+([+-]\d+)?$/i.test(dado)){toast('Dano inválido. Use algo como 1d8 ou 2d6+1.');return}
        ci.w={name,cat:$('ciCat').value,peso:ci.peso,dado,critMin:+$('ciCrit').value,skill:$('ciSkill').value,area:$('ciArea').checked,effects:$('ciStatus').value?[{status:$('ciStatus').value,when:$('ciWhen').value}]:[],note:ci.note||'personalizada'}}
      if(kind==='prot')ci.p={def:Math.max(0,Number($('ciDef').value)||0),slot:$('ciSlot').value};
      saveCustomItem(ci,$('ciShare').checked);
      if($('ciAdd').checked)addItem(toInv(ci));else toast(name+' criado e salvo na lista.');
      $('ciName').value='';$('ciNote').value='';
    };
    return;
  }
  box.className='skill-grid t3-scroll';
  let list=[];
  if(k==='mine')list=allCustomItems().map(ci=>({n:ci.name,sub:`${KINDLBL[ci.kind]} · ${ci.peso}${ci.kind==='weapon'?' · '+ci.w.dado:''}${ci.kind==='prot'?' · Defesa '+ci.p.def:''} · por ${ci.by||'—'}`,mk:()=>toInv(ci),ci}));
  if(k==='weapon')list=WEAPONS.map(w=>({n:w.name,sub:`${w.cat} · ${w.peso} · ${w.dado} · crít ${w.critMin>=20?'20':w.critMin+'-20'}${w.note?' · '+w.note:''}`,mk:()=>({kind:'weapon',name:w.name,peso:w.peso,w:{...w,effects:w.effects.map(e=>({...e}))}})}));
  if(k==='prot')list=PROTECTIONS.map(p=>({n:p.name,sub:`${p.cat} · ${p.peso} · Defesa ${p.def} · ${SLOT_LABEL[p.slot]}`,mk:()=>({kind:'prot',name:p.name,peso:p.peso,p:{def:p.def,slot:p.slot}})}));
  if(k==='gear')list=GEAR.map(g=>({n:g.name,sub:g.peso==='Bolso'?'Bolso (0 de carga)':g.peso,mk:()=>({kind:'gear',name:g.name,peso:g.peso,qty:g.qty||1})}));
  list=list.filter(x=>x.n.toLowerCase().includes(q));
  box.innerHTML=list.map((x,i)=>`<div class="skill"><div class="skill-info"><div class="skill-name">${esc(x.n)}</div><div class="skill-attr">${esc(x.sub)}</div></div><div class="skill-right">${x.ci&&(x.ci.byId===uid3()||role3()==='master')?`<button class="btn small danger" data-delci="${i}" title="Apagar da lista">🗑</button>`:''}<button class="roll" data-add="${i}">＋</button></div></div>`).join('')||`<div class="empty">${k==='mine'?'Nenhum item criado ainda. Use “＋ Criar item novo”.':'Nada encontrado.'}</div>`;
  $$('[data-add]',box).forEach(b=>b.onclick=()=>addItem(list[+b.dataset.add].mk()));
  $$('[data-delci]',box).forEach(b=>b.onclick=()=>{if(confirm('Apagar este item da lista? (itens já no inventário não são afetados)'))deleteCustomItem(list[+b.dataset.delci].ci.id)});
}
function addItem(base){
  const inv=E.ensureInv(data);const it={id:rid(),qty:1,loc:'mochila',...base};
  const ok=E.autoPlace(data,it);
  if(!ok)toast('Sem espaço no corpo: '+it.name+' foi para "Largado". Mova-o quando liberar espaço.');
  save();toast(it.name+' adicionado ('+LOCS[it.loc]+').');
}
async function giveItem(id){
  const inv=E.ensureInv(data),it=inv.items.find(i=>i.id===id);if(!it)return;
  const p=await pickTargets({title:'Dar '+it.name,multi:false,exclude:[activeCharacterId],onlyScene:false,hint:'Quem recebe o item? Ele vai para a mochila ou espaço livre do outro personagem.'});
  if(!p||!p.ids.length)return;
  const copy=JSON.parse(JSON.stringify(it));delete copy.id;
  inv.items=inv.items.filter(i=>i.id!==id);save();
  await sendFx(p.ids,[{t:'item',item:copy}],`${data.name||'Alguém'} entregou ${it.name} para ${nm(charById(p.ids[0]))}`,charById(activeCharacterId));
}
/* ---------- estados ---------- */
function toggleStatus(id){
  const had=(data.statuses||[]).some(s=>s.id===id);
  data.statuses=had?data.statuses.filter(s=>s.id!==id):[...(data.statuses||[]),{id,at:Date.now()}];
  save();toast((STATUS_BY_ID[id]?.name||id)+(had?' removido.':' aplicado.'));
}
T3.toggleStatus=toggleStatus;
function renderStatesTab(){
  const act=(data.statuses||[]),eff=(data.activeEffects||[]),m=E.computeMods(data);
  $('stActive').innerHTML=`<div class="panel"><div class="panel-head"><h2>Em vigor agora</h2><span class="pill">${act.length} estado(s) · ${eff.length} habilidade(s)</span></div><div class="inline">${act.map(s=>`<span class="tag t3-chip-bad">${esc(STATUS_BY_ID[s.id]?.name||s.id)}${s.id==='agonia'?' ('+(s.turns??3)+' turnos)':''}${s.turnsLeft?' · '+s.turnsLeft+' turno(s)':''}${s.id==='sonolento'?` <button class="t3-x" data-sono="1" title="Marcar uma falha em Concentração (3 falhas = adormece)">falhas ${Number(s.fails)||0}/3 ＋</button>`:''} <button class="t3-x" data-rm-status="${s.id}">×</button></span>`).join('')||'<span class="sub">Nenhum estado.</span>'}${eff.map(e=>`<span class="tag t3-chip-good">${esc(e.name)}${e.type==='rounds'?' ('+e.left+'r)':e.type==='scene'?' (cena)':''} <button class="t3-x" data-rm-eff="${e.id}">×</button></span>`).join('')}</div>${m.sources.length?`<div class="sub" style="margin-top:8px">Fontes de modificador: ${m.sources.map(esc).join(' · ')}</div>`:''}</div>`;
  $$('[data-rm-status]').forEach(b=>b.onclick=()=>toggleStatus(b.dataset.rmStatus));
  $$('[data-sono]').forEach(b=>b.onclick=()=>sonoFail(data));
  $$('[data-rm-eff]').forEach(b=>b.onclick=()=>{data.activeEffects=data.activeEffects.filter(e=>e.id!==b.dataset.rmEff);data.activeTalents=(data.activeTalents||[]).filter(id=>data.activeEffects.some(e=>e.source===id));save()});
  renderStatesList();
}
function renderStatesList(){
  const q=($('stSearch')?.value||'').toLowerCase(),g=$('stGroup')?.value||'',box=$('stList');if(!box)return;
  const list=STATUS_DEFS.filter(s=>(!g||s.group===g)&&(s.name+' '+s.text).toLowerCase().includes(q));
  $('stCount').textContent=list.length+' estados';
  box.innerHTML=list.map(s=>{const on=(data.statuses||[]).some(x=>x.id===s.id);return `<div class="t3-st ${on?'on':''}"><div class="grow"><b>${esc(s.name)}</b> ${s.dot?'<span class="pill">dano por turno</span>':''}<div class="sub" style="font-style:italic">“${esc(s.narr)}”</div><div>${esc(s.text)}</div></div><button class="btn small ${on?'danger':'primary'}" data-st="${s.id}">${on?'Remover':'Aplicar'}</button></div>`}).join('')||'<div class="empty">Nenhum estado.</div>';
  $$('[data-st]',box).forEach(b=>b.onclick=()=>toggleStatus(b.dataset.st));
}

/* ---------- Lucidez, Êxtase e Trauma ---------- */
T3.collapseModal=function(){
  T3.perseusReact?.('collapse');
  const max=dmax(data).luc,n=E.collapseNext(data),pl=Number(data.penaltyLevel)||0,ex=!!data.extase?.on;
  const auto=n>=3&&pl>=2&&!ex;
  const rule=n===1?'1d6: <b>4–6</b> = Êxtase · <b>1–3</b> = Penalidade Nível 1. Lucidez volta para Máx ÷ 2 ('+Math.floor(max/2)+').':n===2?'1d6: <b>4–6</b> mantém Êxtase / resiste · <b>1–3</b> aumenta a Penalidade em 1. Lucidez volta para Máx ÷ 3 ('+Math.floor(max/3)+').':auto?'Você está em Penalidade Nível 2 ou superior: o Terceiro Colapso vira <b>Trauma Permanente</b>. Lucidez fica em 0.':'Terceiro Colapso: 1d6 — <b>4–6</b> mantém o estado · <b>1–3</b> Trauma Permanente. Lucidez fica em 0.';
  openModal('PROTOCOLO DE COLAPSO',`Colapso #${Math.min(n,3)}`,`<div class="notice">Sua Lucidez chegou a 0.</div><p>${rule}</p>`,auto?'Prosseguir':'Rolar 1d6',()=>{
    const roll=auto?0:E.die(6);fx3('dice');
    if(!auto)T3.announceRoll?.(T3.charById?.(activeCharacterId)||{id:null,data},'Protocolo de Colapso',{dice:[roll],sides:6,total:roll,popup:false,eyebrow:'LUCIDEZ',note:roll>=4?'4–6':'1–3'});
    const st=E.collapseStep(data,roll,max);
    data.collapseCount=Math.min(3,st.n);data.penaltyLevel=st.penalty;data.lucidity=st.luc;data.collapsePending=false;
    const wasEx=!!data.extase?.on;data.extase={on:st.extase,bonus:st.extase?(data.extase?.bonus||''):'',escudoUsado:false};
    closeModal();save();
    openModal('RESULTADO DO COLAPSO',auto?'Trauma Permanente':`Dado: ${roll}`,`<div class="roll-result"><div class="bigresult">${auto?'—':roll}</div><div>${st.notes.map(esc).join('<br>')}</div><div class="sub" style="margin-top:6px">Lucidez agora: ${data.lucidity} / ${max}</div></div>`,'Continuar',()=>{
      closeModal();
      if(st.trauma)T3.traumaModal();
      else if(st.extase&&!wasEx||st.extase&&!data.extase.bonus)T3.extaseBonusModal();
    });
  });
};
T3.extaseBonusModal=function(){
  const opts=g=>EXTASE_DEFS.filter(x=>x.grp===g).map(x=>`<option value="${x.id}" ${data.extase?.bonus===x.id?'selected':''}>${x.name} — ${x.text}</option>`).join('');
  openModal('ÊXTASE','Escolha o bônus de Êxtase',`<p class="sub">Dura até o fim da cena ou até um novo Colapso.</p><div class="field"><label>Bônus</label><select id="exSel"><optgroup label="Combate">${opts('Combate')}</optgroup><optgroup label="Fora de combate">${opts('Fora de combate')}</optgroup></select></div>`,'Confirmar',()=>{data.extase={...(data.extase||{}),on:true,bonus:$('exSel').value,escudoUsado:false,sobrevidaUsada:false};T3.perseusReact?.('extase');closeModal();save();toast('Êxtase: '+EXTASE_BY_ID[data.extase.bonus].name)});
};
T3.extaseTest=function(loss){
  openModal('ÊXTASE',`Você perdeu ${loss} de Lucidez`,`<p>Em Êxtase, cada dano de Lucidez exige um teste: <b>1d6 · 4–6</b> mantém o Êxtase; <b>1–3</b> encerra o Êxtase e aumenta a Penalidade em 1.</p><div class="inline"><button class="btn danger" id="exGiveUp">Desistência</button><span class="sub">Perde o Êxtase, fica com Lucidez 0 sem recuperar pontos, sem Trauma, e incapacitado até o fim da cena.</span></div>`,'Rolar 1d6',()=>{
    const r=E.die(6);fx3('dice');closeModal();
    T3.announceRoll?.(T3.charById?.(activeCharacterId)||{id:null,data},'Teste de Êxtase',{dice:[r],sides:6,total:r,popup:false,eyebrow:'LUCIDEZ',note:r>=4?'Êxtase mantido':'Êxtase perdido'});
    if(r>=4){toast('Êxtase mantido (rolou '+r+').');return}
    data.extase={on:false,bonus:'',escudoUsado:false};data.penaltyLevel=(Number(data.penaltyLevel)||0)+1;save();
    openModal('ÊXTASE',`Falhou (${r})`,`<p>O Êxtase se desfez. Penalidade de Lucidez agora no <b>Nível ${data.penaltyLevel}</b>.</p>`,'Ok',closeModal);
  });
  $('exGiveUp').onclick=()=>{closeModal();data.extase={on:false,bonus:'',escudoUsado:false};data.lucidity=0;if(!data.statuses.some(s=>s.id==='desistente'))data.statuses.push({id:'desistente',at:Date.now()});save();toast('Desistência: incapacitado até o fim da cena.')};
};
T3.traumaModal=function(){
  const opt=g=>TRAUMA_DEFS.filter(x=>x.grp===g).map(x=>`<option value="${x.id}">${x.name} — ${x.text}</option>`).join('');
  openModal('TRAUMA PERMANENTE','Descreva o seu Trauma',`<p class="sub">O Trauma é fruto de sucessivos colapsos mentais: medos profundos, fissuras emocionais ou convicções distorcidas. Escolha a penalidade e escreva a cena narrada que descreve o impacto na vida do personagem. O texto fica salvo nas suas Anotações.</p><div class="field"><label>Tipo de Trauma</label><select id="trSel"><optgroup label="Combate">${opt('Combate')}</optgroup><optgroup label="Fora de combate">${opt('Fora de combate')}</optgroup></select></div><div class="field"><label>Descrição do Trauma</label><textarea id="trText" rows="5" placeholder="O que aconteceu? Como isso aparece na vida do personagem?"></textarea></div>`,'Registrar Trauma',()=>{
    const id=$('trSel').value,text=$('trText').value.trim();if(!text){toast('Descreva o seu Trauma antes de registrar.');return}
    const def=TRAUMA_BY_ID[id],stamp=new Date().toLocaleDateString('pt-BR');
    data.traumas=data.traumas||[];data.traumas.push({id,text,date:stamp});
    data.notes=(data.notes?data.notes+'\n\n':'')+`[TRAUMA — ${def.name} · ${stamp}] ${text}\nPenalidade: ${def.text}`;
    data.collapsePending=false;closeModal();save();toast('Trauma registrado e salvo em Anotações.');
  });
};
function renderMind(){
  const max=dmax(data).luc,ex=data.extase||{},n=Number(data.collapseCount)||0;
  const cur=EXTASE_BY_ID[ex.bonus];
  $('mindBody').innerHTML=`<div class="panel"><div class="panel-head"><h2>Lucidez</h2><span class="pill">${data.lucidity} / ${max}</span></div>${data.collapsePending?'<div class="notice t3-alert">Lucidez em 0: resolva o Protocolo de Colapso.</div>':''}<div class="t3-grid3"><div class="stat"><div class="name">COLAPSOS</div><div class="value">${n}<span class="max"> / 3</span></div></div><div class="stat"><div class="name">PENALIDADE</div><div class="value">Nível ${data.penaltyLevel||0}</div><div class="sub">${data.penaltyLevel?`−${data.penaltyLevel} dado(s) em Inteligência, Percepção, Presença, Carisma e Aparência`:'Nenhuma'}</div></div><div class="stat"><div class="name">ÊXTASE</div><div class="value">${ex.on?'Ativo':'—'}</div><div class="sub">${ex.on?esc(cur?cur.name+': '+cur.text:'Escolha um bônus'):'Inativo'}</div></div></div><div class="inline" style="margin-top:12px"><button class="btn primary" id="mdCollapse" ${(data.lucidity<=0&&data.collapsePending)?'':'disabled'}>Rolar Protocolo de Colapso</button><button class="btn" id="mdBonus" ${ex.on?'':'disabled'}>Trocar bônus de Êxtase</button><button class="btn" id="mdEndEx" ${ex.on?'':'disabled'}>Encerrar Êxtase (fim da cena)</button><button class="btn danger" id="mdGive" ${ex.on?'':'disabled'}>Desistência</button></div><p class="sub" style="margin-top:10px">Ao chegar a 0, role 1d6: 4–6 Êxtase, 1–3 Penalidade Nível 1; Lucidez restaurada para Máx ÷ 2. No 2º Colapso (Máx ÷ 3) e no 3º (Trauma Permanente se Penalidade ≥ 2, ou nova rolagem) o risco aumenta. Em Êxtase, cada dano de Lucidez pede 1d6 (1–3 perde o Êxtase).</p></div><div class="panel"><div class="panel-head"><h2>Traumas</h2><button class="btn small" id="mdAddTrauma">＋ Registrar Trauma</button></div>${(data.traumas||[]).map((t,i)=>`<div class="choice"><div class="inline"><b>${esc(TRAUMA_BY_ID[t.id]?.name||t.id)}</b><span class="pill">${esc(TRAUMA_BY_ID[t.id]?.grp||'')}</span><span class="sub">${esc(t.date||'')}</span>${role3()==='master'?`<button class="btn small danger right" data-cure="${i}">Curar (arco narrativo)</button>`:''}</div><p class="sub">${esc(TRAUMA_BY_ID[t.id]?.text||'')}</p><p>${esc(t.text)}</p></div>`).join('')||'<div class="empty">Nenhum trauma. Que continue assim.</div>'}</div>${role3()==='master'?'<div class="panel"><h2>Mestre</h2><div class="inline"><button class="btn small" id="mdReset">Zerar Colapsos e Penalidade</button></div></div>':''}`;
  $('mdCollapse').onclick=()=>T3.collapseModal();$('mdBonus').onclick=()=>T3.extaseBonusModal();
  $('mdEndEx').onclick=()=>{data.extase={on:false,bonus:'',escudoUsado:false};save()};
  $('mdGive').onclick=()=>T3.extaseTest(0);$('mdAddTrauma').onclick=()=>T3.traumaModal();
  $$('[data-cure]').forEach(b=>b.onclick=()=>{data.traumas.splice(+b.dataset.cure,1);save()});
  $('mdReset')&&($('mdReset').onclick=()=>{data.collapseCount=0;data.penaltyLevel=0;data.extase={on:false,bonus:''};data.collapsePending=false;save()});
}

/* ---------- aba Combate & Defesa ---------- */
function renderCombatTab(){
  const di=E.defenseInfo(data),m=E.computeMods(data),qw=E.quickWeapons(data);
  const flagsTxt=[['semAgir','Não pode agir'],['semMover','Não pode se mover'],['semAtacar','Não pode atacar'],['semDefender','Não pode se defender'],['semReacao','Sem reações'],['alvoAleatorio','Ataca alvos aleatórios'],['confuso','50% de errar a ação']].filter(([k])=>m.flags.has(k)).map(([,t])=>t);
  $('combatTabBody').innerHTML=`<div class="panel"><div class="panel-head"><h2>Defesa</h2><span class="pill">DF ${di.DF}</span></div><div class="t3-grid3"><div class="stat"><div class="name">DEFESA BASE (DB)</div><div class="value">${di.DB}</div></div><div class="stat"><div class="name">EQUIPAMENTO</div><div class="value">${sign(di.equip)}</div></div><div class="stat"><div class="name">ESTADOS / HABILIDADES</div><div class="value">${sign(di.mods)}</div></div><div class="stat"><div class="name">DESTREZA</div><div class="value">${sign(di.dex||0)}</div></div></div><p class="sub" style="margin-top:8px">Todo mundo começa com Defesa de equipamento 0; vista proteções no Inventário. Atacante: ATA = dados de Força/Destreza da perícia + bônus (Briga, Armas Brancas, Armas de Disparo, Arremesso). Defensor: RF = dados de Destreza + Esquiva (quando está vendo) ou Reflexo (quando desprevenido).</p>${flagsTxt.length?`<div class="notice t3-alert">${flagsTxt.join(' · ')}</div>`:''}</div>
  <div class="panel"><h2 style="margin-bottom:10px">Resolução do confronto</h2><div class="t3-table"><div><b>Esquiva / Bloqueio</b><span>RF maior que ATA e DB → desvia (ou bloqueia, se a Defesa do equipamento segurou o golpe). Não é atingido.</span></div><div><b>Acerto normal</b><span>ATA ≥ RF (e ≥ DF): acerta, consome 1 ação.</span></div><div><b>Acerto violento</b><span>RF &lt; DB e ATA &gt; DB: fere brutalmente e o atacante ganha 1 ação adicional. A Defesa do equipamento não vale quando RF &lt; DB.</span></div><div><b>Retaliação</b><span>RF &gt; DB e ATA &lt; DB: desvia com folga e ganha 1 ação extra para reagir.</span></div></div></div>
  <div class="panel"><div class="panel-head"><h2>Armas prontas (saque rápido)</h2></div>${qw.map(it=>{const w=it.w;const c=skillCalc3({data,vocations,tracks},w.skill);return `<div class="t3-item"><div class="grow"><b>${esc(it.name)}</b><div class="inline"><span class="tag">${esc(w.skill)} ${c.n}d20 ${sign(c.bonus)}</span><span class="tag">dano ${esc(w.dado)}</span>${wDmgTag(w,it.peso)}<span class="tag">crít. ${w.critMin>=20?'20':w.critMin+'-20'}</span>${(w.effects||[]).map(e=>`<span class="tag t3-chip-bad">${STATUS_BY_ID[e.status]?.name} (${e.when==='crit'?'crít.':'acerto'})</span>`).join('')}</div></div></div>`}).join('')||'<div class="empty">Nenhuma arma nas mãos, cintura ou bandoleira. Equipe no Inventário. Sem arma, você ataca no Soco (1d2, Briga).</div>'}<div class="inline" style="margin-top:10px"><button class="btn" data-q="Esquiva">🎲 Esquiva</button><button class="btn" data-q="Reflexo">🎲 Reflexo</button><button class="btn" data-q="Briga">🎲 Briga</button><button class="btn" data-q="Armas Brancas">🎲 Armas Brancas</button><button class="btn" data-q="Armas de Disparo">🎲 Armas de Disparo</button></div></div>`;
  $$('[data-q]',$('combatTabBody')).forEach(b=>b.onclick=()=>rollSkill(b.dataset.q));
}

/* Fim da cena: o Vital Temporário se dissipa, a Sutura Bruta pode rasgar e o sangramento suspenso volta */
function endSceneEffects(d){
  const notes=[];d.statuses=d.statuses||[];
  if(Number(d.vitalTemp)>0){notes.push('O Vital Temporário se dissipou ('+d.vitalTemp+').');d.vitalTemp=0}
  if(d.statuses.some(s=>s.suspended)){d.statuses.forEach(s=>{delete s.suspended});notes.push('O sangramento suspenso voltou a correr.')}
  if(d.suturaAtiva&&d.suturaRompe&&!d.statuses.some(s=>s.id==='feridaexposta')){d.statuses.push({id:'feridaexposta',at:Date.now()});notes.push('Os grampos da Sutura Bruta rasgaram a pele: Ferida Exposta (+3 na DT da cirurgia).')}
  d.suturaAtiva=false;d.suturaRompe=false;
  E.resetSceneFlags(d);
  const volta=E.recoverAmmo(d);if(volta)notes.push(`Munição recuperada intacta: ${volta} (Arcos & Balestras).`);
  return notes;
}
/* ---------- Descanso, Combustão e Medicina de campo ---------- */
T3.rest=T3.rest||{base:1,vigilia:false,sedacao:false,ancorado:false,fortificado:false,operador:false,tests:{}};
function attrTest(attr){const n=Math.max(1,Number(data.attributes[attr])||1),dice=Array.from({length:n},()=>E.die(20)),best=Math.max(...dice);return{attr,dice,best,ok:best>=15}}
function renderRest(){
  const R=T3.rest,pr=E.restPatamar(data,{...R,operador:R.operador||!!data.operou}),T=REST_TABLE;
  const row=(k,label,hint)=>`<label class="t3-check"><input type="checkbox" data-rest="${k}" ${R[k]?'checked':''}> <b>${label}</b> <span class="sub">${hint}</span></label>`;
  $('restBody').innerHTML=`<div class="panel"><div class="panel-head"><h2>Cena de Trégua</h2><span class="pill">Patamar final ${pr.final}</span></div><p class="sub">1 a 4 horas sem confronto. O descanso recupera apenas Essência e Lucidez — o Vital só se recupera com intervenção médica (veja abaixo).</p><div class="field" style="max-width:300px"><label>Patamar base do ambiente (definido pelo Mestre)</label><select id="restBase"><option value="1" ${R.base==1?'selected':''}>1 · Hostil / Precário</option><option value="2" ${R.base==2?'selected':''}>2 · Protegido / Improvisado</option><option value="3" ${R.base==3?'selected':''}>3 · Refúgio Seguro</option></select></div><h3 style="margin-top:14px">Ações Preparatórias</h3>${row('fortificado','Fortificar Perímetro','teste de Inteligência ou Força (DT 15) — ambiente Patamar 1 → 2 para o grupo')}${row('ancorado','Fui ancorado por um aliado','Intuição ou Artes (DT 15) — anula 1 ponto de penalidade de Lucidez')}${row('vigilia','Montar Vigília','impede emboscadas; não recupero Lucidez e minha Essência sofre −1 Patamar')}${row('sedacao','Sedação Química','ignoro penalidades de Lucidez, mas recebo Torpor na cena seguinte')}${row('operador','Operei alguém (Síntese Cirúrgica)','minha recuperação sofre −1 Patamar'+(data.operou?' — marcado automaticamente':''))}${E.supportBonus()?row('apoio','Recebi apoio psicológico',`de um aliado com a especialização de apoio — +${E.supportBonus()} de Lucidez`):''}${data.suturaAtiva?row('extremo','Fiz esforço físico extremo com a Sutura Bruta','os grampos rasgam: Ferida Exposta (+3 DT da cirurgia)'):''}<div class="inline" style="margin-top:8px"><button class="btn small" id="rtFort">🎲 Fortificar (INT)</button><button class="btn small" id="rtFort2">🎲 Fortificar (FOR)</button><button class="btn small" id="rtAnc">🎲 Ancorar (Intuição)</button><span class="sub" id="rtTestOut"></span></div><div class="notice" style="margin-top:12px"><b>Patamar ${pr.final} — ${T[pr.final].label}.</b> ES ${T[pr.es].es.replace('E','Estágio '+data.stage)} · Lucidez ${pr.noLuc?'nenhuma (vigília)':T[pr.luc].luc.replace('I','Intuição')} · ${T[pr.final].consequence}<br>${pr.notes.map(esc).join('<br>')||'Sem redutores.'}${pr.intTest?'<br>Mente Estilhaçada: exige teste de Intuição (DT 15) — falha = 0 Lucidez e 1 ES.':''}</div><button class="btn primary" id="restGo" style="margin-top:10px">☕ Realizar o descanso</button></div>
  <div class="panel"><div class="panel-head"><h2>Combustão Vital</h2></div><p class="sub">Sem Essência para pagar uma habilidade? Sacrifique 2 de Vital para cada 1 ES faltante (ignora armadura, resistência e VT Temporário). Limite por turno: ${E.regra('combBase')} + Constituição (${E.combustionLimit(data)} ES para você). A Combustão é oferecida automaticamente quando você usa um talento ou ritual sem Essência suficiente. Deixa Estigmas de Sobrecarga até o fim da cena. <b>A Última Centelha</b> permite zerar o próprio Vital: +1d20 na ação, mas você desaba Morrendo.</p></div>
  <div class="panel"><div class="panel-head"><h2>Medicina de campo</h2><span class="pill">Medicina ${data.attributes['Inteligência']||1}d20 ${sign(skillCalc3({data,vocations,tracks},'Medicina').bonus)}</span></div><div class="inline"><button class="btn primary" id="medSutura">🩹 Sutura Bruta</button><button class="btn primary" id="medSintese">🧵 Síntese Cirúrgica</button></div><p class="sub" style="margin-top:8px"><b>Sutura Bruta</b> (1 ação padrão — também no menu de combate —, adjacente, 1 Suprimento de Emergência, DT ${E.regra('suturaDT')}, com Inteligência+Medicina, Inteligência pura ou Destreza pura): sucesso = 2d6 + INT de Vital Temporário e suspende Sangramento até o fim da cena (+1d6 se 20+); falha = 1d4. O VT Temporário não acumula (vale o maior), absorve dano primeiro e some no fim da cena; um acerto crítico ou esforço extremo rasga os grampos. <b>Síntese Cirúrgica</b> (Ação Preparatória na Trégua, Kit Cirúrgico, DT ${E.regra('sinteseDT')} — ${E.regra('sinteseDTGrave')} com Ferida Exposta/0 VT): sucesso 2d8 + INT + Estágio de Vital Permanente e remove Sangrando/Lacerado/Ferida Exposta; +5 na DT = 3d8; falha = 1d6 + INT e Infecção Tecidual. Patamar 0–1 dá −1d20; Patamar 3 dá +1d20; autocirurgia −1d20.</p></div>`;
  $$('[data-rest]').forEach(c=>c.onchange=()=>{R[c.dataset.rest]=c.checked;renderRest()});
  $('restBase').onchange=e=>{R.base=+e.target.value;renderRest()};
  const out=t=>{$('rtTestOut').textContent=t};
  $('rtFort').onclick=()=>{const r=attrTest('Inteligência');out(`INT: ${r.dice.join(', ')} → ${r.best} ${r.ok?'✓ sucesso (marque Fortificar)':'✗ falha'}`)};
  $('rtFort2').onclick=()=>{const r=attrTest('Força');out(`FOR: ${r.dice.join(', ')} → ${r.best} ${r.ok?'✓ sucesso (marque Fortificar)':'✗ falha'}`)};
  $('rtAnc').onclick=()=>{const car=E.socialBonus(data,'Intuição',{ancorar:true}),c=doRoll({data,vocations,tracks},'Intuição',{extraBonus:car.bonus});out(`Intuição: ${c.dice.join(', ')} ${sign(c.bonus)}${car.bonus?` (inclui +${car.bonus} de Carisma)`:''} = ${c.total} ${c.total>=15?'✓ sucesso (o aliado marca Ancorado)':'✗ falha'}`)};
  $('restGo').onclick=doRest;
  $('medSutura').onclick=()=>T3.fieldMedicine?.('sutura');$('medSintese').onclick=()=>T3.fieldMedicine?.('sintese');
}
function doRest(){
  const R=T3.rest;if(R.extremo)data.suturaRompe=true;
  const sceneNotes=endSceneEffects(data);
  const pr=E.restPatamar(data,{...R,operador:R.operador||!!data.operou});let intFailed=false,intTxt='';
  if(pr.intTest){const c=doRoll({data,vocations,tracks},'Intuição');intFailed=c.total<15;intTxt=`Teste de Intuição (DT 15): ${c.total} — ${intFailed?'falhou':'passou'}.`}
  const r=E.restRoll(data,pr.es,pr.luc,{stage:data.stage,intFailed,noLuc:pr.noLuc});
  const apoio=R.apoio&&!pr.noLuc&&!intFailed?E.supportBonus():0;if(apoio){r.luc+=apoio;r.det.push(`Apoio psicológico: +${apoio} de Lucidez.`)}
  const s=dmax(data);
  {const meC=T3.charById?.(activeCharacterId)||{id:null,data},sd=e=>+((String(e).match(/d(\d+)/)||[])[1]||6);
   if(r.esR.rolls.length)T3.announceRoll?.(meC,'Descanso · Essência',{dice:r.esR.rolls,sides:sd(REST_TABLE[pr.es].es),bonus:r.esR.mod,total:r.es,popup:false,eyebrow:'DESCANSO'});
   if(r.lucR.rolls.length&&!pr.noLuc)T3.announceRoll?.(meC,'Descanso · Lucidez',{dice:r.lucR.rolls,sides:sd(REST_TABLE[pr.luc].luc),bonus:r.lucR.mod,total:r.luc,popup:false,eyebrow:'DESCANSO'})}
  data.essence=Math.min(s.es,(Number(data.essence)||0)+r.es);
  const wasZero=data.lucidity<=0;
  data.lucidity=Math.min(s.luc,(Number(data.lucidity)||0)+r.luc);
  if(wasZero&&data.lucidity>0)data.collapsePending=false;
  const notes=[];
  if(pr.final<=0&&!data.statuses.some(x=>x.id==='exaurido')){data.statuses.push({id:'exaurido',at:Date.now()});notes.push('Despertou Exaurido (−1d20 no primeiro teste).')}
  if(pr.final>=2){const before=data.statuses.length;data.statuses=data.statuses.filter(x=>!PASSING_STATUSES.includes(x.id));if(before!==data.statuses.length)notes.push('Condições passageiras removidas.')}
  if(pr.final>=3){data.activeEffects=data.activeEffects||[];data.activeEffects.push({id:'once-'+rid(),name:'Mente revigorada',type:'once',dieDelta:1,left:0,desc:'+1d20 no primeiro teste.'});notes.push('Mente revigorada: +1d20 no primeiro teste.')}
  if(R.sedacao){data.statuses.push({id:'torpor',at:Date.now()});notes.push('Torpor na cena seguinte.')}
  data.statuses=data.statuses.filter(x=>x.id!=='desistente');
  R.sedacao=R.vigilia=R.ancorado=R.fortificado=R.operador=R.extremo=R.apoio=false;data.operou=false;data.agoniaAnulada=false;notes.push(...sceneNotes);save();
  openModal('DESCANSO CONCLUÍDO',`Patamar ${pr.final} · ${r.esLabel}`,`<div class="roll-result"><div>Essência: <b>+${r.es}</b> (${r.esR.rolls.join('+')||0}${r.esR.mod?'+'+r.esR.mod:''})</div><div>Lucidez: <b>+${r.luc}</b> ${r.lucR.rolls.length?'('+r.lucR.rolls.join('+')+(r.lucR.mod?'+'+r.lucR.mod:'')+')':''}</div>${intTxt?'<div class="sub">'+esc(intTxt)+'</div>':''}${r.det.map(x=>'<div class="sub">'+esc(x)+'</div>').join('')}${notes.map(x=>'<div class="sub">'+esc(x)+'</div>').join('')}</div>`,'Fechar',closeModal);
}

