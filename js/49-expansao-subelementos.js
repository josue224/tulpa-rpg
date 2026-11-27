/* ===================================================================
   TULPA · ETAPA 34 — Sub-Elementos oficiais e rituais inéditos
   - SUBEL_BASE (t3.js): Sol, Desrealização, Pofenia, Confabulação e
     Metáfora, cada um nascido de dois elementos vizinhos do Ciclo.
   - 15 rituais novos no RITUAL_FULL (3 por sub-elemento), com
     automação de cura/estados quando faz sentido.
   - RART34 (t34s.js): sigilos autorais em SVG; o gradiente mistura as
     cores dos dois elementos de origem.
   - Manual Vivo: uma seção por sub-elemento (emblema, origem, conceito
     editável e rituais), no capítulo 8.
   =================================================================== */
const SUBK34={};(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE:[]).forEach(b=>{SUBK34[b.name]=b;EL32[b.name]=b.k});
const ELK34={'Fé':'fe','Natureza':'nat','Inexistência':'inx','Ilusão':'ilu','Verdade':'ver'};
function subOf34(x){
  const b=typeof x==='string'?(SUBK34[x]||(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE.find(s=>s.k===x||s.id===x):null)):x;if(!b)return null;
  let desc=b.desc;try{const c=cur29('subel',b.id);if(c&&c.desc)desc=c.desc}catch(e){}
  return{...b,desc};
}
T3.subOf=subOf34;

/* ---------- sigilo de ritual de sub-elemento ---------- */
let rsN34=0;
function artSym34(r,size,cls){
  const sb=SUBK34[r.element],ek=ELK34[r.element];const art=RART34[r.id]||RART34[slug32(r.name)];if(!art||!(sb||ek))return null;
  /* sub-elemento: gradiente dos dois elementos; elemento principal: cor própria */
  const b=sb||{k:ek,a:r.element,b:r.element};
  const id='ra'+(++rsN34);
  return`<svg class="rsym rs-${size} rs-${b.k} ${sb?'rs-sub':'rs-main'} ${cls||''}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="18" y1="18" x2="82" y2="82"><stop offset="0" class="rs-stop-${ELK34[b.a]}"/><stop offset="1" class="rs-stop-${ELK34[b.b]}"/></linearGradient></defs><circle class="rs-disc" cx="50" cy="50" r="40"/><g class="rs-spin"><circle class="rs-ring" cx="50" cy="50" r="40" style="stroke:url(#${id})"/><circle class="rs-hair" cx="50" cy="50" r="34.6" style="stroke:url(#${id})"/><g class="rs-art" transform="translate(50 50)" fill="url(#${id})" stroke="url(#${id})">${art}</g></g></svg>`;
}
{const _rs=ritSym32;ritSym32=function(x,size='md',o={}){
  const r=ritOf32(x);
  if(r&&!r.sym&&(SUBK34[r.element]||ELK34[r.element])){const a=artSym34(r,size,o.cls);if(a)return a}
  return _rs.apply(this,arguments)};
 T3.ritSym=(...a)=>ritSym32(...a);window.tulpaRitSym=T3.ritSym}

/* ---------- Manual Vivo: seção de cada sub-elemento ---------- */
LIVE31.subhead=function(b){
  const s=subOf34(b.k);if(!s)return'';
  const gm=gm31()?`<button type="button" class="gm29-b" data-sub34="${esc(s.id)}" title="Editar conceito" aria-label="Editar conceito de ${esc(s.name)}">✏️</button>`:'';
  const n=RITUALS.filter(r=>r.element===s.name).length;
  return`<div class="sub34-head rs-host">${T3.subEmblem(s.k,'xl')}<div><p class="sub34-eq"><span class="sub34-chip rs-${ELK34[s.a]}">${esc(s.a)}</span> + <span class="sub34-chip rs-${ELK34[s.b]}">${esc(s.b)}</span></p><p class="sub34-desc">${esc(s.desc)} ${gm}</p><p class="sub">${n} ritua${n===1?'l':'is'} de ${esc(s.name)}</p></div></div>`;
};
{const c8=MAN31.find(c=>c.id==='c8');
 if(c8){const at=c8.secs.findIndex(s=>s.id==='c8.7');
   const add=(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE:[]).map((s,i)=>({id:'c8.s-'+s.k,h:`8.${7+i} ${s.name} (${s.a} + ${s.b})`,b:[{live:'subhead',k:s.k},{live:'ritual',el:s.name}]}));
   if(!c8.secs.some(s=>s.id==='c8.s-sol'))c8.secs.splice(at>=0?at:c8.secs.length,0,...add);
   const auto=c8.secs.find(s=>s.id==='c8.7');if(auto)auto.h='8.12 Rituais de outros elementos';}}
document.addEventListener('click',e=>{const b=e.target.closest('#m31content [data-sub34]');if(!b||!gm31())return;try{T3.open29?T3.open29('subel',b.dataset.sub34):open29('subel',b.dataset.sub34)}catch(err){}});
/* Manual: elemento do diagrama → seção; sub-elemento → seção própria (go31 já trata data-sec) */

/* ---------- ficha: origem do sub-elemento no cartão ---------- */
function deco34(){
  $$('#ritualCatalog .ritual-card .pill').forEach(p=>{
    if(p.dataset.s34)return;const s=SUBK34[p.textContent.trim()];p.dataset.s34='1';if(!s)return;
    p.classList.add('sub34-pill','rs-'+s.k);p.title=`${s.name}: ${s.a} + ${s.b}`;
    p.insertAdjacentHTML('beforeend',` <small>${esc(s.a)} + ${esc(s.b)}</small>`);
  });
}
new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))requestAnimationFrame(()=>{try{deco34()}catch(e){}})}).observe(document.body,{childList:true,subtree:true});

/* compatibilidade: rituais personalizados antigos marcados como "Apofenia" */
setTimeout(()=>{try{RITUALS.forEach(r=>{if(r.element==='Apofenia')r.element='Pofenia'});(window.data?.customRituals||[]).forEach(r=>{if(r.element==='Apofenia')r.element='Pofenia'})}catch(e){}},800);
console.info('[Tulpa] Etapa 34 carregada (Sub-Elementos e rituais inéditos)');

/* ===================================================================
   TULPA · ETAPA 35 — Expansão Onda 2: itens vivos e aprimoramentos
   - ITEMFX35: ferramentas e artefatos (alguns amaldiçoados) dão bônus/
     penalidades reais no motor enquanto estão nas mãos, cintura ou bolso.
   - USE35: consumíveis médicos e psicológicos com botão "Usar".
   - WMOD35: aprimoramentos de armas (até 2 por arma) que mudam a própria
     arma do inventário (dado, margem de crítico, peso, efeitos).
   =================================================================== */
const ITEMFX35={
  'Kit de gazuas':{fx:{skillDice:{'Segurança':1}},txt:'+1 dado em Segurança.'},
  'Lupa de joalheiro':{fx:{skillDice:{'Identificação':1}},txt:'+1 dado em Identificação.'},
  'Binóculos':{fx:{skillDice:{'Observação':1}},txt:'+1 dado em Observação.'},
  'Estetoscópio':{fx:{skillDice:{'Medicina':1}},txt:'+1 dado em Medicina (e ouvir através de portas e cofres).'},
  'Máscara de gás':{fx:{skillDice:{'Resistência':1}},txt:'+1 dado em Resistência; gases e esporos não o afetam enquanto usada.'},
  'Gravador de voz digital':{fx:{skillDice:{'Audição':1}},txt:'+1 dado em Audição; capta vozes que o ouvido não pega.'},
  'Amuleto de olho turco':{fx:{skillDice:{'Resistência':1}},txt:'+1 dado em Resistência contra efeitos mentais.',art:1},
  'Relógio de bolso parado':{fx:{skillDice:{'Reflexo':1,'Esquiva':1,'Pesquisa':-1}},txt:'+1 dado em Reflexo e Esquiva. Maldição: −1 dado em Pesquisa (as horas se embaralham).',art:1,curse:1},
  'Espelho de obsidiana':{fx:{skillDice:{'Teosofia':1,'Intuição':1,'Empatia':-1}},txt:'+1 dado em Teosofia e Intuição. Maldição: −1 dado em Empatia (você vê o que não deveria nas pessoas).',art:1,curse:1},
  'Rosário de dentes':{fx:{dmg:2,socialDice:-1},txt:'+2 no dano corpo a corpo. Maldição: −1 em testes sociais.',art:1,curse:1},
  'Vela de sebo negro':{fx:{skillDice:{'Furtividade':1,'Intuição':-1}},txt:'Acesa nas mãos: +1 dado em Furtividade (a luz não denuncia). Maldição: −1 dado em Intuição.',art:1,curse:1},
  'Ferradura torta':{fx:{skillDice:{'Sorte':1}},txt:'+1 dado em Sorte.',art:1},
  'Medalhão do vigia':{fx:{defense:1},txt:'+1 na Defesa.',art:1},
  'Boneca sem rosto':{fx:{skillDice:{'Enganação':1,'Furtividade':1},defense:-1},txt:'+1 dado em Enganação e Furtividade. Maldição: −1 na Defesa (ela atrai o olhar das coisas).',art:1,curse:1}
};
const fxOn35=it=>!!ITEMFX35[it.name]&&!['mochila','chao'].includes(it.loc);
{const _cm=E.computeMods;E.computeMods=function(d){
  const m=_cm.apply(this,arguments);
  try{(d?.inventory?.items||[]).forEach(it=>{if(fxOn35(it)){const f=ITEMFX35[it.name];E.addSrc(m,f.fx,(f.art?'Artefato: ':'Item: ')+it.name)}})}catch(e){}
  return m}}

const USE35={
  'Morfina (ampola)':{heal:'2d6',add:['torpor'],txt:'Cura 2d6 VT; você fica em Torpor.'},
  'Adrenalina (autoinjetor)':{rem:['atordoado','exausto','sonolento'],add:['euforico'],txt:'Remove Atordoado, Exausto e Sonolento; você fica Eufórico.'},
  'Ansiolítico':{luc:'1d6',rem:['ansioso','amedrontado','tenso'],add:['sonolento'],txt:'Recupera 1d6 de Lucidez e remove Ansioso, Amedrontado e Tenso; você fica Sonolento.'},
  'Antídoto':{rem:['envenenado','enjoado'],txt:'Remove Envenenado e Enjoado.'},
  'Bandagem hemostática':{heal:'1d4',rem:['sangrando'],txt:'Remove Sangrando e cura 1d4 VT.'},
  'Café extraforte':{rem:['sonolento','exaurido'],txt:'Remove Sonolento e Exaurido.'},
  'Sais aromáticos':{rem:['atordoado','desrealizado'],txt:'Remove Atordoado e Desrealizado.'},
  'Pomada para queimaduras':{heal:'1d4',rem:['queimando','corroido'],txt:'Remove Queimando e Corroído e cura 1d4 VT.'}
};
async function use35(id){
  const inv=E.ensureInv(data),it=inv.items.find(i=>i.id===id);const u=it&&USE35[it.name];if(!u)return;
  const ok=await askModal('USAR ITEM',it.name,`<p>${esc(u.txt)}</p><p class="sub">Gasta 1 unidade (restam ${it.qty||1}).</p>`,'Usar');if(!ok)return;
  const mx=STAGES[data.stage]||STAGES[1],log=[];
  if(u.heal){const r=E.rollExpr(u.heal).total;data.vital=Math.min(mx.vt,(Number(data.vital)||0)+r);log.push(`+${r} VT`)}
  if(u.luc){const r=E.rollExpr(u.luc).total;data.lucidity=Math.min(mx.luc,(Number(data.lucidity)||0)+r);log.push(`+${r} Lucidez`)}
  data.statuses=data.statuses||[];
  (u.rem||[]).forEach(s=>{if(data.statuses.some(x=>x.id===s)){data.statuses=data.statuses.filter(x=>x.id!==s);log.push('sem '+(STATUS_BY_ID[s]?.name||s))}});
  (u.add||[]).forEach(s=>{if(!data.statuses.some(x=>x.id===s)){data.statuses.push({id:s,at:Date.now()});log.push(STATUS_BY_ID[s]?.name||s)}});
  it.qty=Math.max(0,(Number(it.qty)||1)-1);if(!it.qty)inv.items=inv.items.filter(i=>i.id!==id);
  save();toast(`${it.name}: ${log.join(', ')||'usado'}.`);
  try{if(camp3())insertRow(charById(activeCharacterId),'Item',{detail:{cmb:'log',text:`${nm(charById(activeCharacterId))} usou ${it.name} (${log.join(', ')||'sem efeito visível'}).`}}).catch(()=>{})}catch(e){}
}
T3.use35=use35;

/* ---------- aprimoramentos de armas ---------- */
const DSTEP35=['1d2','1d3','1d4','1d6','1d8','1d10','1d12','2d8'];
const PSTEP35=['Bolso','Leve','Médio','Pesado'];
const up35=(v,arr)=>{const i=arr.indexOf(v);return i>=0&&i<arr.length-1?arr[i+1]:v};
const melee35=w=>w.cat==='Corpo a corpo',gun35=w=>w.skill==='Armas de Disparo',blade35=w=>w.skill==='Armas Brancas';
const addFx35=(w,status,when)=>{if(!w.effects.some(e=>e.status===status))w.effects.push({status,when})};
const WMOD35=[
  {id:'afiada',name:'Fio Afiado',ok:w=>melee35(w)&&blade35(w),txt:'Crítico 1 ponto mais fácil (mínimo 17).',req:'Artesanato DT 12 · pedra de amolar',ap:w=>{w.critMin=Math.max(17,(Number(w.critMin)||20)-1)}},
  {id:'contrapeso',name:'Contrapeso',ok:w=>melee35(w),txt:'O dado de dano sobe um passo (1d6 → 1d8). A arma fica um passo mais pesada.',req:'Mecânica DT 13 · chumbo e fita',ap:w=>{w.dado=up35(w.dado,DSTEP35);w._peso=1}},
  {id:'serrilha',name:'Serrilha',ok:w=>melee35(w)&&blade35(w),txt:'Críticos causam Sangrando.',req:'Artesanato DT 12 · lima',ap:w=>addFx35(w,'sangrando','crit')},
  {id:'bobina',name:'Bobina Elétrica',ok:w=>melee35(w),txt:'Críticos causam Atordoado.',req:'Tecnologia DT 14 · bateria e fios',ap:w=>addFx35(w,'atordoado','crit')},
  {id:'envenenada',name:'Banho de Veneno',ok:w=>blade35(w),txt:'Acertos causam Envenenado.',req:'Ciências DT 14 · toxina',ap:w=>addFx35(w,'envenenado','hit')},
  {id:'mira',name:'Mira Telescópica',ok:w=>gun35(w),txt:'Crítico 1 ponto mais fácil (mínimo 17).',req:'Mecânica DT 12 · luneta',ap:w=>{w.critMin=Math.max(17,(Number(w.critMin)||20)-1)}},
  {id:'canolongo',name:'Cano Longo',ok:w=>gun35(w),txt:'O dado de dano sobe um passo. A arma fica um passo mais pesada.',req:'Mecânica DT 14 · cano sobressalente',ap:w=>{w.dado=up35(w.dado,DSTEP35);w._peso=1}},
  {id:'incendiaria',name:'Munição Incendiária',ok:w=>gun35(w),txt:'Críticos causam Queimando.',req:'Ciências DT 13 · fósforo',ap:w=>addFx35(w,'queimando','crit')},
  {id:'salgrosso',name:'Carga de Sal Grosso',ok:w=>gun35(w),txt:'Críticos deixam o alvo Exposto (espíritos e espantos recuam).',req:'Teosofia DT 12 · sal benzido',ap:w=>addFx35(w,'exposto','crit')},
  {id:'sigilo',name:'Sigilo Gravado',ok:()=>true,txt:'Acertos deixam o alvo Marcado (a arma "lembra" de quem feriu).',req:'Teosofia DT 15 · gravação ritual (1 hora)',ap:w=>addFx35(w,'marcado','hit')}
];
const WMOD_BY35=Object.fromEntries(WMOD35.map(m=>[m.id,m]));
function applyMods35(it){
  if(!it.wBase)it.wBase=JSON.parse(JSON.stringify(it.w));if(!it.pesoBase)it.pesoBase=it.peso;
  const w=JSON.parse(JSON.stringify(it.wBase));w.effects=w.effects||[];let peso=it.pesoBase;
  (it.mods||[]).forEach(id=>{const m=WMOD_BY35[id];if(m&&m.ok(w)){m.ap(w);if(w._peso){peso=up35(peso,PSTEP35);delete w._peso}}});
  w.mods=(it.mods||[]).slice();it.w=w;it.peso=peso;if(w.peso)w.peso=peso;
}
async function mod35(id){
  const inv=E.ensureInv(data),it=inv.items.find(i=>i.id===id);if(!it||it.kind!=='weapon')return;
  const base=it.wBase||it.w,cur=new Set(it.mods||[]);
  const list=WMOD35.filter(m=>m.ok(base));
  if(!list.length){toast('Esta arma não aceita aprimoramentos.');return}
  SEL35=new Set(cur);
  const ok=await askModal('APRIMORAR ARMA',it.name,`<p class="sub">Até <b>2 aprimoramentos</b> por arma. O teste e o material indicados são feitos na mesa, com o Mestre.</p><div class="wm35-list">${list.map(m=>`<label class="wm35"><input type="checkbox" value="${m.id}" ${cur.has(m.id)?'checked':''}><span><b>${esc(m.name)}</b> ${esc(m.txt)}<br><span class="sub">${esc(m.req)}</span></span></label>`).join('')}</div>`,'Aplicar');
  if(!ok)return;
  const sel=[...SEL35];
  if(sel.length>2){toast('No máximo 2 aprimoramentos por arma.');return}
  it.mods=sel;applyMods35(it);save();
  toast(sel.length?`${it.name}: ${sel.map(i=>WMOD_BY35[i].name).join(' + ')}.`:`${it.name} voltou ao original.`);
}
T3.mod35=mod35;T3.CAT35={WEAPONS,GEAR,PROTECTIONS,ITEMFX35,USE35,WMOD35,NEW_TRACKS};
let SEL35=new Set();
document.addEventListener('change',e=>{if(!e.target.matches?.('.wm35 input'))return;if(e.target.checked&&SEL35.size>=2){e.target.checked=false;toast('No máximo 2 aprimoramentos por arma.');return}if(e.target.checked)SEL35.add(e.target.value);else SEL35.delete(e.target.value)});

/* ---------- inventário: botões e etiquetas ---------- */
{const _il=itemLine;itemLine=function(it){
  let h=_il.apply(this,arguments);
  let extra='';
  if(it.kind==='weapon'){const n=(it.mods||[]).length;extra+=`${(it.mods||[]).map(i=>WMOD_BY35[i]?`<span class="tag wm35-tag" title="${esc(WMOD_BY35[i].txt)}">🔧 ${esc(WMOD_BY35[i].name)}</span>`:'').join('')}<button class="btn small" data-mod35="${it.id}" title="Aprimoramentos de arma">🔧 Aprimorar${n?` (${n}/2)`:''}</button>`}
  if(USE35[it.name])extra+=`<button class="btn small primary" data-use35="${it.id}" title="${esc(USE35[it.name].txt)}">Usar</button><span class="sub">${esc(USE35[it.name].txt)}</span>`;
  if(ITEMFX35[it.name]){const f=ITEMFX35[it.name],on=fxOn35(it);extra+=`<span class="tag ${f.curse?'t3-chip-bad':'t3-chip-good'}" title="${esc(f.txt)}">${f.art?(f.curse?'☠ artefato amaldiçoado':'✶ artefato'):'🔍 ferramenta'}${on?'':' · guardado'}</span><span class="sub">${esc(f.txt)}${on?'':' Só vale nas mãos, na cintura ou no bolso.'}</span>`}
  if(extra)h=h.replace('<div class="inline" style="margin-top:4px">','<div class="inline" style="margin-top:4px">'+extra);
  return h}}
document.addEventListener('click',e=>{
  const u=e.target.closest('[data-use35]');if(u){e.preventDefault();use35(u.dataset.use35);return}
  const m=e.target.closest('[data-mod35]');if(m){e.preventDefault();mod35(m.dataset.mod35)}
});

/* ---------- Manual Vivo: capítulo 9 ---------- */
LIVE31.wmods=()=>tb31(['Aprimoramento','Aceita','Efeito','Teste e material'],WMOD35.map(m=>tr31([`<b>${esc(m.name)}</b>`,esc(m.id==='sigilo'?'qualquer arma':['afiada','serrilha'].includes(m.id)?'lâminas corpo a corpo':m.id==='envenenada'?'armas brancas':['contrapeso','bobina'].includes(m.id)?'corpo a corpo':'armas de disparo'),link31(esc(m.txt)),esc(m.req)])));
LIVE31.itemfx=()=>tb31(['Item','Tipo','Efeito enquanto carregado'],Object.entries(ITEMFX35).map(([n,f])=>tr31([`<b>${esc(n)}</b>`,f.art?(f.curse?'Artefato amaldiçoado':'Artefato'):'Ferramenta',link31(esc(f.txt))])));
LIVE31.consum=()=>tb31(['Consumível','Efeito ao usar'],Object.entries(USE35).map(([n,u])=>tr31([`<b>${esc(n)}</b>`,link31(esc(u.txt))])));
{const c9=MAN31.find(c=>c.id==='c9');
 if(c9&&!c9.secs.some(s=>s.id==='c9.w2')){const n=c9.secs.length;
  c9.secs.push(
   {id:'c9.w2',h:`9.${n+1} Aprimoramentos de Armas`,b:[['c9.w2.p','Cada arma aceita até **2 aprimoramentos**. O jogador abre o inventário, toca em **🔧 Aprimorar** na arma e escolhe; o teste e o material ficam a cargo da mesa. O aprimoramento muda a própria arma: dado, margem de crítico, peso (e a carga) e os estados aplicados no acerto ou no crítico.'],{live:'wmods'}]},
   {id:'c9.fx2',h:`9.${n+2} Ferramentas e Artefatos`,b:[['c9.fx2.p','Ferramentas e artefatos só funcionam **nas mãos, na cintura ou no bolso**; guardados na mochila, não fazem nada. Artefatos amaldiçoados cobram um preço enquanto você os carrega.'],{live:'itemfx'}]},
   {id:'c9.cs2',h:`9.${n+3} Consumíveis Médicos e Psicológicos`,b:[['c9.cs2.p','Consumíveis têm o botão **Usar** no inventário. Cada uso gasta 1 unidade, aplica o efeito na ficha e avisa a mesa.'],{live:'consum'}]}
  )}}
console.info('[Tulpa] Etapa 35 carregada (Onda 2: itens vivos e aprimoramentos)');

/* ===================================================================
   TULPA · ETAPA 36 — Expansão Onda 3: bestiário, IA, fases, sinergias
   - BEAST_BASE (t3.js): 18 criaturas oficiais, editáveis na central.
   - Perfis de IA: no turno de um inimigo do bestiário, o Mestre vê o
     "Conselho do turno" com o alvo sugerido e o motivo; um toque ataca.
   - Chefes com fases: ao cruzar 66% e 33% do Vital, a fase dispara
     sozinha (estado no chefe + aviso na mesa).
   - Criar NPC a partir do modelo e calculadora de encontro (Mestre).
   - Sinergias: pares de estados no mesmo alvo somam efeitos extras.
   =================================================================== */
const AIP36={
  agressivo:{n:'Agressivo',d:'Ataca quem tem a Defesa mais baixa.'},
  cacador:{n:'Caçador',d:'Persegue o alvo mais ferido (menor % de Vital).'},
  covarde:{n:'Covarde',d:'Ataca o mais fácil, mas foge quando cai abaixo de 1/3 do Vital.'},
  protetor:{n:'Protetor',d:'Mira a maior ameaça do grupo (maior Estágio) para proteger os aliados dele.'},
  conjurador:{n:'Conjurador',d:'Usa a habilidade especial a cada 2 rodadas; nas outras, ataca quem tem mais Essência.'},
  emboscador:{n:'Emboscador',d:'Prioriza alvos Caídos, Atordoados ou Agarrados; evita quem está Em Alerta.'},
  chefe:{n:'Chefe',d:'Alterna entre a maior ameaça e o mais ferido; muda de fase em 66% e 33% do Vital.'}
};
const TIERPTS36={Capanga:1,Inimigo:2,Elite:4,Entidade:7,Chefe:10};
const TIERSTG36={Capanga:2,Inimigo:4,Elite:6,Entidade:8,Chefe:9};
const ELK36={'Fé':'fe','Natureza':'nat','Inexistência':'inx','Ilusão':'ilu','Verdade':'ver','Sol':'sol','Desrealização':'dsr','Pofenia':'pof','Confabulação':'cnf','Metáfora':'met'};
function beasts36(){
  let R=[];try{R=rules29().beast||[]}catch(e){}
  return BEAST_BASE.map(b=>{const o=R.find(x=>x.id===b.id);return o?{...b,...o,_ed:1}:{...b}}).concat(R.filter(x=>!String(x.id).startsWith('bb-')).map(x=>({...x,_new:1})));
}
T3.beasts=beasts36;

/* ---------- ficha de NPC a partir do modelo ---------- */
function npcData36(b){
  const stage=TIERSTG36[b.tier]||4,mx=(STAGES[stage]||STAGES[1]).vt,vt=Math.max(1,Number(b.vital)||mx);
  const atk=parseInt(String(b.atk||'0').replace('+',''))||0,a=Math.max(1,Math.min(5,1+Math.ceil(atk/2)));
  const ranged=/Armas de Disparo/.test(b.skills||'')||/Atirador/i.test(b.name||'');
  const fx=[];(b.abil||[]).forEach(x=>{if(!x.st)return;if(/no acerto/i.test(x.d))fx.push({status:x.st,when:'hit'});else if(/no cr[ií]tico/i.test(x.d))fx.push({status:x.st,when:'crit'})});
  const attrs=Object.fromEntries(ATTRS.map(k=>[k,1]));Object.assign(attrs,{'Força':a,'Destreza':a,'Constituição':Math.min(5,1+Math.ceil(vt/30)),'Percepção':Math.max(1,a-1),'Presença':b.tier==='Chefe'?4:2});
  const rid36=()=>Math.random().toString(36).slice(2,10);
  return{name:b.name,stage,vital:Math.min(mx,vt),vitalTemp:Math.max(0,vt-mx),beastId:b.id,beastMax:vt,attributes:attrs,essence:(STAGES[stage]||STAGES[1]).es,lucidity:(STAGES[stage]||STAGES[1]).luc,
    hideStats:b.tier!=='Capanga',statuses:[],activeEffects:[],phaseDone:[],
    notes:[`${b.tier}${b.el?' de '+b.el:''} · IA: ${(AIP36[b.ai]||AIP36.agressivo).n}`,b.skills?`Perícias: ${b.skills}`:'',...(b.abil||[]).map(x=>`${x.n}: ${x.d}`),...(b.phases||[]).map(p=>`Fase (${p.at}%) ${p.name}: ${p.text}`),b.notes||''].filter(Boolean).join('\n'),
    inventory:{mochila:false,bandoleira:false,items:[
      {id:'it-'+rid36(),kind:'weapon',name:'Ataque: '+b.name,peso:'Bolso',loc:'maos',w:{name:'Ataque: '+b.name,cat:ranged?'Distância':'Corpo a corpo',peso:'Bolso',dado:b.dano||'1d6',critMin:/18–20/.test(JSON.stringify(b.abil||[]))?18:20,skill:ranged?'Armas de Disparo':'Briga',area:false,effects:fx,note:'ataque da criatura'}},
      {id:'it-'+rid36(),kind:'prot',name:'Couraça natural',peso:'Bolso',loc:'vestido',prof:true,p:{name:'Couraça natural',cat:'Natural',peso:'Bolso',def:Math.max(0,(Number(b.def)||10)-10),slot:'roupa'}}]}};
}
T3.npcData=npcData36;
async function makeNpc36(id,n=1){
  if(!isGM6()){toast('Só o Mestre cria NPCs.');return}
  const b=beasts36().find(x=>x.id===id);if(!b)return;
  if(typeof window.tulpaInsertChar!=='function'){toast('Entre numa campanha na nuvem para criar NPCs.');return}
  for(let i=0;i<n;i++){const d=npcData36(b);if(n>1)d.name=`${b.name} ${i+1}`;await window.tulpaInsertChar('Mestre',{hidden:true,boss:b.tier!=='Capanga',data:d})}
  toast(`${n>1?n+'× ':''}${b.name} criado${n>1?'s':''} (invisível até você ligar o 👁).`);
}
T3.makeNpc=makeNpc36;

/* ---------- conselho do turno (IA) ---------- */
const stIds36=d=>(d?.statuses||[]).map(s=>s.id);
function foesOf36(){
  const cm=camp3()?.combat;if(!cm?.active)return[];
  return(cm.order||[]).map(o=>charById(o.characterId)).filter(ch=>ch&&!gmChar6(ch)&&!isDeadCh(ch)&&!isDyingCh(ch));
}
function advise36(ch){
  const d=dOf6(ch);const b=beasts36().find(x=>x.id===d.beastId);if(!b)return null;
  const ai=b.ai||'agressivo',P=AIP36[ai]||AIP36.agressivo,round=Number(camp3()?.combat?.round)||1;
  const T=foesOf36().map(c=>{const x=dOf6(c),mx=Number(x.beastMax)||dmax(x).vt;return{c,n:nm(c),def:Number(x.defense)||10,pct:(Number(x.vital)||0)/mx,stage:Number(x.stage)||1,es:Number(x.essence)||0,st:stIds36(x)}});
  if(!T.length)return{b,P,text:'Nenhum alvo de pé.',tgt:null};
  const by=(f,dir=1)=>T.slice().sort((p,q)=>dir*(f(p)-f(q)))[0];
  let tgt,why,act='atacar';
  const myMx=Number(d.beastMax)||dmax(d).vt,myPct=((Number(d.vital)||0)+(Number(d.vitalTemp)||0))/myMx;
  const timed=(b.abil||[]).find(x=>/a cada 2 rodadas/i.test(x.d));
  if(ai==='covarde'&&myPct<1/3){act='fugir';why='Vital abaixo de 1/3: tenta fugir ou se render.'}
  else if(ai==='cacador'){tgt=by(t=>t.pct);why=`mais ferido (${Math.round(tgt.pct*100)}% do Vital)`}
  else if(ai==='protetor'){tgt=by(t=>t.stage,-1);why=`maior ameaça (Estágio ${tgt.stage})`}
  else if(ai==='conjurador'&&timed&&round%2===0){act='habilidade';tgt=by(t=>t.def);why=`rodada par: usa ${timed.n}`}
  else if(ai==='conjurador'){tgt=by(t=>t.es,-1);why=`quem mais usa Essência (${tgt.es} ES)`}
  else if(ai==='emboscador'){const down=T.filter(t=>t.st.some(s=>['caido','atordoado','agarrado','paralisado','sonolento'].includes(s)));const pool=down.length?down:T.filter(t=>!t.st.includes('alerta'));tgt=(pool.length?pool:T).slice().sort((p,q)=>p.def-q.def)[0];why=down.length?'alvo indefeso':'quem não está Em Alerta'}
  else if(ai==='chefe'){tgt=round%2?by(t=>t.stage,-1):by(t=>t.pct);why=round%2?`maior ameaça (Estágio ${tgt.stage})`:`mais ferido (${Math.round(tgt.pct*100)}%)`;if(timed&&round%2===0)act='habilidade'}
  else{tgt=by(t=>t.def);why=`Defesa mais baixa (${tgt.def})`}
  const text=act==='fugir'?why:act==='habilidade'?`Usar ${timed.n} em ${tgt?.n||'todos'}: ${timed.d}`:`Atacar ${tgt.n}: ${why}.`;
  return{b,P,text,tgt,act};
}
T3.advise=advise36;
let advHide36='';
function advTick36(){
  let box=$('adv36');
  const e=(()=>{try{return curEntry()}catch(err){return null}})(),ch=e&&charById(e.characterId),d=ch&&dOf6(ch);
  const key=e?`${camp3()?.combat?.round}|${e.characterId}`:'';
  if(!isGM6()||!d?.beastId||advHide36===key){box?.remove();return}
  const a=advise36(ch);if(!a){box?.remove();return}
  if(!box){box=document.createElement('aside');box.id='adv36';box.className='adv36';box.setAttribute('aria-live','polite');document.body.append(box)}
  const sig=key+a.text;if(box.dataset.sig===sig)return;box.dataset.sig=sig;
  const k=ELK36[a.b.el]||'';
  box.innerHTML=`<div class="adv36-h"><span class="adv36-chip ${k?'rs-'+k:''}">${esc(a.b.tier)}${a.b.el?' · '+esc(a.b.el):''}</span><b>🧠 Turno de ${esc(nm(ch))}</b><button type="button" class="adv36-x" aria-label="Fechar conselho">✕</button></div>
    <p class="adv36-p"><span class="sub">IA ${esc(a.P.n)}:</span> ${esc(a.text)}</p>
    <div class="adv36-b">${a.act!=='fugir'?'<button type="button" class="btn small primary" data-adv36="atk">⚔ Atacar</button>':''}<span class="sub">${esc(a.P.d)}</span></div>`;
  box.querySelector('.adv36-x').onclick=()=>{advHide36=key;box.remove()};
  const at=box.querySelector('[data-adv36="atk"]');if(at)at.onclick=()=>{try{startAttack(ch)}catch(err){console.warn('[T36] atacar',err)}};
}
setInterval(()=>{try{advTick36()}catch(e){}},1200);

/* ---------- fases de chefe ---------- */
const phaseBusy36={};
function phaseTick36(){
  if(!isGM6())return;const cm=camp3()?.combat;if(!cm?.active)return;
  (cm.order||[]).forEach(o=>{const ch=charById(o.characterId);const d=ch&&dOf6(ch);if(!d?.beastId||phaseBusy36[ch.id])return;
    const b=beasts36().find(x=>x.id===d.beastId);if(!b?.phases?.length)return;
    const mx=Number(d.beastMax)||1,pct=((Number(d.vital)||0)+(Number(d.vitalTemp)||0))/mx*100,done=d.phaseDone||[];
    const i=b.phases.findIndex((p,k)=>pct<=p.at&&!done.includes(k)&&pct>0);if(i<0)return;
    const p=b.phases[i];phaseBusy36[ch.id]=1;
    try{mutateChar(ch,x=>{x.phaseDone=[...(x.phaseDone||[]),i];if(p.st){x.statuses=x.statuses||[];if(!x.statuses.some(s=>s.id===p.st))x.statuses.push({id:p.st,at:Date.now()})}})}catch(e){console.warn('[T36] fase',e)}
    toast(`⚠ ${nm(ch)} · ${p.name}: ${p.text}`);
    try{insertRow(ch,'Fase do chefe',{detail:{cmb:'log',text:`⚠ ${nm(ch)} entra na fase ${p.name}: ${p.text}`}}).catch(()=>{})}catch(e){}
    setTimeout(()=>{delete phaseBusy36[ch.id]},2500);
  });
}
setInterval(()=>{try{phaseTick36()}catch(e){}},1500);
T3.phaseTick=phaseTick36;

/* ---------- sinergias de estados ---------- */
const SYN36=[
  ['iluminado','exposto','Revelado','Não há onde se esconder: −2 na Defesa a mais.',{defense:-2}],
  ['abencoado','inspirado','Graça','+1 na Defesa e +1 dado em Resistência a mais.',{defense:1,skillDice:{'Resistência':1}}],
  ['sonolento','desrealizado','Sonho Lúcido','O corpo não responde: sem reações e −1 dado em Reflexo.',{flags:['semReacao'],skillDice:{'Reflexo':-1}}],
  ['amedrontado','vaticinado','Profecia Cumprida','A queda parece certa: −1 dado em todos os testes.',{allDice:-1}],
  ['enraizado','corroido','Raiz Podre','As raízes apodrecem: −3 na Defesa (anula o bônus do Enraizado).',{defense:-3}],
  ['ofuscado','iluminado','Cegueira Branca','Desvantagem em todos os ataques.',{disadv:['ataque']}],
  ['velado','desrealizado','Fantasma','+1 dado em Furtividade e Esquiva a mais.',{skillDice:{'Furtividade':1,'Esquiva':1}}],
  ['fragmentado','ecoado','Colapso Narrativo','−1 em testes sociais e −1 dado em Teosofia.',{socialDice:-1,skillDice:{'Teosofia':-1}}],
  ['queimando','envenenado','Febre Tóxica','−1 dado em testes físicos.',{physDice:-1}],
  ['marcado','exposto','Alvo Pintado','−1 na Defesa a mais.',{defense:-1}]
];
{const _cm=E.computeMods;E.computeMods=function(d){
  const m=_cm.apply(this,arguments);
  try{const ids=new Set(stIds36(d));SYN36.forEach(([a,b,n,,fx])=>{if(ids.has(a)&&ids.has(b))E.addSrc(m,fx,'Sinergia: '+n)})}catch(e){}
  return m}}
T3.SYN36=SYN36;

/* ---------- calculadora de encontro ---------- */
const ENC36={};
function party36(){try{return chars3().filter(c=>!gmChar6(c)).map(c=>Number(dOf6(c)?.stage)||1)}catch(e){return[]}}
function encHtml36(){
  const L=beasts36(),pick=Object.entries(ENC36).filter(([,n])=>n>0),P=party36();
  const threat=pick.reduce((a,[id,n])=>a+(TIERPTS36[(L.find(b=>b.id===id)||{}).tier]||2)*n,0);
  const power=P.reduce((a,s)=>a+1+s/2,0)||1,r=threat/power;
  const lab=!pick.length?'—':r<.5?'Fácil':r<.9?'Equilibrado':r<1.4?'Difícil':'Mortal';
  const cls=!pick.length?'':r<.5?'easy':r<.9?'ok':r<1.4?'hard':'deadly';
  return`<div class="enc36" id="enc36"><h4>🧮 Calculadora de encontro <span class="sub">(só o Mestre vê)</span></h4>
   <p class="sub">Grupo: ${P.length} personage${P.length===1?'m':'ns'}${P.length?` · estágios ${P.join(', ')}`:''}. Use ＋ nos cartões para montar o encontro.</p>
   <div class="enc36-list">${pick.map(([id,n])=>{const b=L.find(x=>x.id===id);return b?`<span class="enc36-it">${n}× ${esc(b.name)} <button type="button" class="gm29-b" data-enc36="-${esc(id)}" aria-label="Remover um ${esc(b.name)}">−</button></span>`:''}).join('')||'<span class="sub">Nenhuma criatura escolhida.</span>'}</div>
   <p class="enc36-r ${cls}">Dificuldade: <b>${lab}</b>${pick.length?` <span class="sub">(ameaça ${threat} contra força ${power.toFixed(1)})</span>`:''}</p>
   ${pick.length?'<div class="m31-edbar"><button type="button" class="btn small primary" data-enc36="make">Criar os NPCs deste encontro</button><button type="button" class="btn small" data-enc36="clear">Limpar</button></div>':''}</div>`;
}

/* ---------- Manual: bestiário rico ---------- */
LIVE31.beast=function(){
  const L=beasts36(),gm=gm31();
  const card=b=>{const k=ELK36[b.el]||'',P=AIP36[b.ai]||AIP36.agressivo;
    return`<article class="m31-card m31-row beast36 ${b.tier==='Chefe'?'boss':''}" data-key="${esc(b.id)}"><header><h4>${esc(b.name)}</h4><span class="m31-chip">${esc(b.tier||'Inimigo')}</span>${b.el?`<span class="m31-chip beast36-el rs-${k}">${esc(b.el)}</span>`:''}${b._ed?'<span class="m31-st edit">editado</span>':b._new?'<span class="m31-st new">da campanha</span>':''}${gm?gmBtns29('beast',b.id,b.name):''}</header>
    <p class="m31-meta"><span><i>Vital:</i> ${esc(String(b.vital??'—'))}</span><span><i>Defesa:</i> ${esc(String(b.def??'—'))}</span><span><i>Ataque:</i> ${esc(String(b.atk||'—'))}</span><span><i>Dano:</i> ${esc(b.dano||'—')}</span></p>
    ${b.skills?`<p class="sub">${esc(b.skills)}</p>`:''}
    <p class="beast36-ai"><b>🧠 ${esc(P.n)}</b> · ${esc(P.d)}</p>
    ${(b.abil||[]).length?`<ul class="beast36-ab">${b.abil.map(x=>`<li><b>${esc(x.n)}:</b> ${link31(esc(x.d))}</li>`).join('')}</ul>`:''}
    ${(b.phases||[]).length?`<ol class="beast36-ph">${b.phases.map(p=>`<li><b>${p.at}% · ${esc(p.name)}:</b> ${link31(esc(p.text))}</li>`).join('')}</ol>`:''}
    ${b.notes?`<p class="m31-desc">${esc(b.notes)}</p>`:''}
    ${gm?`<div class="m31-edbar beast36-gm"><button type="button" class="btn small" data-npc36="${esc(b.id)}">➕ Criar NPC</button><button type="button" class="btn small" data-enc36="+${esc(b.id)}">＋ Encontro</button></div>`:''}</article>`};
  const tiers=['Capanga','Inimigo','Elite','Entidade','Chefe'];
  return`${gm?encHtml36():''}<h4 class="m31-sub">Bestiário (${L.length} criaturas)</h4>${gm?gmAdd29('beast','Criatura'):''}${tiers.map(t=>{const g=L.filter(b=>(b.tier||'Inimigo')===t);return g.length?`<h5 class="beast36-t">${t==='Chefe'?'Chefes':t==='Capanga'?'Capangas':t==='Elite'?'Elites':t==='Entidade'?'Entidades':'Inimigos'}</h5><div class="m31-cards">${g.map(card).join('')}</div>`:''}).join('')}`;
};
LIVE31.aiprof=()=>tb31(['Comportamento','O que a IA sugere no turno'],Object.values(AIP36).map(p=>tr31([`<b>${esc(p.n)}</b>`,esc(p.d)])));
LIVE31.syn=()=>tb31(['Estados juntos','Sinergia','Efeito extra'],SYN36.map(([a,b,n,t])=>tr31([`${link31(esc(STATUS_BY_ID[a]?.name||a))} + ${link31(esc(STATUS_BY_ID[b]?.name||b))}`,`<b>${esc(n)}</b>`,esc(t)])));
{const all=MAN31.flatMap(c=>c.secs.map(s=>({c,s})));
 const bs=all.find(x=>(x.s.b||[]).some(b=>b&&b.live==='beast'));
 if(bs&&!bs.s.b.some(b=>b&&b.live==='aiprof')){const i=bs.s.b.findIndex(b=>b&&b.live==='beast');bs.s.b.splice(i,0,['beast36.p','Cada criatura tem um **comportamento de IA**. No turno dela, o Mestre vê o *Conselho do turno* com o alvo sugerido e o motivo, e ataca com um toque. A decisão final é sempre do Mestre. Chefes mudam de fase sozinhos ao cair para 66% e 33% do Vital.'],{live:'aiprof'})}
 const c10=MAN31.find(c=>c.id==='c10');
 if(c10&&!c10.secs.some(s=>s.id==='c10.syn')){const n=c10.secs.length;c10.secs.push({id:'c10.syn',h:`10.${n+1} Sinergias de Estados`,b:[['c10.syn.p','Quando dois estados combinam no mesmo alvo, surge uma **sinergia** com efeito extra. Ela entra sozinha no cálculo dos dados e da Defesa e aparece como "Sinergia" no detalhamento da rolagem. Basta um dos estados acabar para a sinergia sumir.'],{live:'syn'}]})}}

/* ---------- cliques do Mestre ---------- */
document.addEventListener('click',async e=>{
  const n=e.target.closest('[data-npc36]');if(n){e.preventDefault();makeNpc36(n.dataset.npc36);return}
  const c=e.target.closest('[data-enc36]');if(!c)return;e.preventDefault();const v=c.dataset.enc36;
  if(v==='clear')Object.keys(ENC36).forEach(k=>delete ENC36[k]);
  else if(v==='make'){for(const [id,q] of Object.entries(ENC36))if(q>0)await makeNpc36(id,q);Object.keys(ENC36).forEach(k=>delete ENC36[k])}
  else{const id=v.slice(1);ENC36[id]=Math.max(0,(ENC36[id]||0)+(v[0]==='+'?1:-1));if(!ENC36[id])delete ENC36[id];if(v[0]==='+')toast('Adicionado ao encontro.')}
  const box=$('enc36');if(box)box.outerHTML=encHtml36();
});
console.info('[Tulpa] Etapa 36 carregada (Onda 3: bestiário, IA, fases e sinergias)');

/* ===================================================================
   TULPA · ETAPA 37 — Catálogos da Onda 2 editáveis no Manual
   Aprimoramentos de armas (textos), Ferramentas/Artefatos (efeitos reais)
   e Consumíveis (efeitos reais) ganham "✏️ Editar tabela". As mudanças
   ficam no Manual da campanha (tbl.wmods/itemfx/consum) e são aplicadas
   nos catálogos do motor para todos, em tempo real.
   =================================================================== */
const DEF37={
  itemfx:JSON.parse(JSON.stringify(ITEMFX35)),
  consum:JSON.parse(JSON.stringify(USE35)),
  wmods:WMOD35.map(m=>({id:m.id,name:m.name,txt:m.txt,req:m.req}))
};
const TIPO37=['Ferramenta','Artefato','Artefato amaldiçoado'];
const stName37=id=>STATUS_BY_ID[id]?.name||id;
const stId37=n=>{const k=nrm32(n);const s=STATUS_DEFS.find(x=>nrm32(x.name)===k||x.id===k);return s?s.id:null};
const fxRow37=(n,f)=>({n,tipo:f.art?(f.curse?TIPO37[2]:TIPO37[1]):TIPO37[0],dice:fmtSk31(f.fx?.skillDice),def:String(f.fx?.defense||0),dmg:String(f.fx?.dmg||0),soc:String(f.fx?.socialDice||0),txt:f.txt});
const useRow37=(n,u)=>({n,heal:u.heal||'',luc:u.luc||'',rem:(u.rem||[]).map(stName37).join(', '),add:(u.add||[]).map(stName37).join(', '),txt:u.txt});

function applyCat37(){
  const T=tbl31();
  Object.keys(ITEMFX35).forEach(k=>delete ITEMFX35[k]);
  if(T.itemfx&&T.itemfx.length)T.itemfx.forEach(r=>{const fx={};if(r.dice&&Object.keys(r.dice).length)fx.skillDice=r.dice;if(+r.def)fx.defense=+r.def;if(+r.dmg)fx.dmg=+r.dmg;if(+r.soc)fx.socialDice=+r.soc;ITEMFX35[r.n]={fx,txt:r.txt,art:r.tipo!==TIPO37[0]?1:0,curse:r.tipo===TIPO37[2]?1:0}});
  else Object.entries(DEF37.itemfx).forEach(([k,v])=>{ITEMFX35[k]=JSON.parse(JSON.stringify(v))});
  Object.keys(USE35).forEach(k=>delete USE35[k]);
  if(T.consum&&T.consum.length)T.consum.forEach(r=>{const u={txt:r.txt};if(r.heal)u.heal=r.heal;if(r.luc)u.luc=r.luc;if(r.rem?.length)u.rem=r.rem;if(r.add?.length)u.add=r.add;USE35[r.n]=u});
  else Object.entries(DEF37.consum).forEach(([k,v])=>{USE35[k]=JSON.parse(JSON.stringify(v))});
  WMOD35.forEach(m=>{const d=DEF37.wmods.find(x=>x.id===m.id),o=(T.wmods||[]).find(x=>x.id===m.id)||d;m.name=o.name;m.txt=o.txt;m.req=o.req});
}
{const _a=applyTbl31;applyTbl31=function(){const r=_a.apply(this,arguments);try{applyCat37()}catch(e){console.warn('[T37] catálogos',e)}return r}}

const KINDS37={
  itemfx:{label:'Ferramentas e artefatos',hint:'Os efeitos valem enquanto o item está nas mãos, na cintura ou no bolso. "Dados" usa o formato Perícia +N (ex.: Observação +1, Empatia −1). O nome precisa ser igual ao do item no inventário.',canAdd:1,canDel:1,
    cols:[{k:'n',l:'Item',t:'text'},{k:'tipo',l:'Tipo',t:'sel',o:()=>TIPO37},{k:'dice',l:'Dados (Perícia +N)',t:'text'},{k:'def',l:'Defesa',t:'num'},{k:'dmg',l:'Dano',t:'num'},{k:'soc',l:'Testes sociais',t:'num'},{k:'txt',l:'Descrição',t:'text'}],
    rows:()=>Object.entries(ITEMFX35).map(([n,f])=>fxRow37(n,f))},
  consum:{label:'Consumíveis',hint:'Cura e Lucidez aceitam dados (ex.: 2d6, 1d4+1). Em "Remove" e "Adiciona", escreva nomes de estados separados por vírgula.',canAdd:1,canDel:1,
    cols:[{k:'n',l:'Consumível',t:'text'},{k:'heal',l:'Cura (VT)',t:'text'},{k:'luc',l:'Lucidez',t:'text'},{k:'rem',l:'Remove estados',t:'text'},{k:'add',l:'Adiciona estados',t:'text'},{k:'txt',l:'Descrição',t:'text'}],
    rows:()=>Object.entries(USE35).map(([n,u])=>useRow37(n,u))},
  wmods:{label:'Aprimoramentos de armas',hint:'Edite o nome, o texto e o teste/material. O efeito mecânico de cada aprimoramento é fixo.',
    cols:[{k:'name',l:'Aprimoramento',t:'text'},{k:'txt',l:'Efeito',t:'text'},{k:'req',l:'Teste e material',t:'text'}],
    rows:()=>WMOD35.map(m=>({id:m.id,name:m.name,txt:m.txt,req:m.req}))}
};
{const _o=open31g;open31g=function(kind){
  const K=KINDS37[kind];if(!K)return _o.apply(this,arguments);
  M31.tg={kind,cols:K.cols,rows:K.rows(),canAdd:K.canAdd,canDel:K.canDel,hint:K.hint};paint31(true);
  setTimeout(()=>{$q('#m31content .m31-grid')?.scrollIntoView({block:'center'})},30)}}
{const _s=save31g;save31g=async function(){
  const g=M31.tg;if(!g||!KINDS37[g.kind])return _s.apply(this,arguments);
  if(!isGM6())return;const T=ensTbl31(),fail=m=>{g.err=m;paint31(true)},seen=new Set();let out=[];
  for(const r of g.rows){
    if(g.kind==='wmods'){const nm=String(r.name||'').trim();if(!nm)return fail('Todo aprimoramento precisa de nome.');out.push({id:r.id,name:nm.slice(0,40),txt:String(r.txt||'').trim().slice(0,200),req:String(r.req||'').trim().slice(0,120)});continue}
    const n=String(r.n||'').trim();if(!n)return fail('Toda linha precisa de nome.');if(seen.has(nrm32(n)))return fail(`Nome repetido: ${n}`);seen.add(nrm32(n));
    const txt=String(r.txt||'').trim();if(!txt)return fail(`${n}: escreva a descrição.`);
    if(g.kind==='itemfx'){const d=parseSk31(r.dice,BASE_SKILLS);if(d.err)return fail(`${n}: ${d.err}.`);
      for(const k of ['def','dmg','soc'])if(!int31(r[k]===''?'0':r[k],-10,10))return fail(`${n}: Defesa, Dano e Testes sociais vão de −10 a 10.`);
      out.push({n,tipo:TIPO37.includes(r.tipo)?r.tipo:TIPO37[0],dice:d.v,def:+r.def||0,dmg:+r.dmg||0,soc:+r.soc||0,txt:txt.slice(0,200)})}
    else{const dice=v=>!v||/^\d+d\d+([+-]\d+)?$|^\d+$/i.test(String(v).trim());if(!dice(r.heal)||!dice(r.luc))return fail(`${n}: Cura e Lucidez usam dados como 2d6 ou 1d4+1.`);
      const list=v=>String(v||'').split(/[,;]/).map(x=>x.trim()).filter(Boolean);const rem=[],add=[];
      for(const x of list(r.rem)){const id=stId37(x);if(!id)return fail(`${n}: estado "${x}" não existe.`);rem.push(id)}
      for(const x of list(r.add)){const id=stId37(x);if(!id)return fail(`${n}: estado "${x}" não existe.`);add.push(id)}
      out.push({n,heal:String(r.heal||'').trim(),luc:String(r.luc||'').trim(),rem,add,txt:txt.slice(0,200)})}
  }
  if(!out.length)return fail('Mantenha pelo menos uma linha.');
  T[g.kind]=out;M31.tg=null;
  const ok=await saveMan31(KINDS37[g.kind].label);if(!ok)M31.tg=g;
  try{applyCat37();T3.refresh()}catch(e){}paint31(true)}}
['wmods','itemfx','consum'].forEach(k=>{const _l=LIVE31[k];LIVE31[k]=function(){const g=tgOn31(k);if(g)return wrapEd31(g);return _l.apply(this,arguments)+bar31(k,!!tbl31()[k])}});
T3.applyCat37=applyCat37;
console.info('[Tulpa] Etapa 37 carregada (catálogos da Onda 2 editáveis)');

