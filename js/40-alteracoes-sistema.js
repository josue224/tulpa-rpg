/* ===================================================================
   TULPA · ETAPA 29 — ⚙️ Alterações do Sistema (central do Mestre),
   edição inline nas fichas, regras por campanha em tempo real e
   avisos só para quem a mudança afeta (com o Perseus falando)
   Guardado em campaign_store, chave "rules" (sem tabela nova).
   =================================================================== */
const R29={camp:'',rules:null,base:null,sec:'voc',q:'',edit:null,loadedAt:0,fetching:false,lastCast:0};
T3.rules29=R29;
const cl29=o=>o==null?o:JSON.parse(JSON.stringify(o));
const defRules29=()=>({v:1,rev:0,voc:{},track:{},ritual:{},item:{},status:{},trauma:{},pericia:{},vert:{},attr:{},num:{},beast:[],subel:[],table:{},log:[]});
const rules29=()=>R29.rules||(R29.rules=defRules29());
const ARCH29=['Lutador','Gênio','Ritualista'];
const PESO29=['Bolso','Leve','Médio','Pesado'];
const SEC29=[['voc','✦','Vocações'],['track','⌁','Trilhas'],['attr','◆','Atributos'],['pericia','▤','Perícias'],['vert','❖','Especializações'],['num','🎯','Valores de Combate'],['ritual','✶','Rituais'],['item','▣','Itens e Equipamentos'],['status','☠','Estados e Condições'],['beast','👹','Bestiário'],['trauma','☾','Traumas e Colapsos'],['subel','✧','Sub-Elementos'],['table','⚖','Regras da Mesa'],['log','🕘','Histórico']];
const KIND29={voc:'Vocação',track:'Trilha',ritual:'Ritual',item:'Item',status:'Estado',beast:'Bestiário',trauma:'Trauma',subel:'Sub-Elemento',table:'Regras da Mesa',pericia:'Perícia',vert:'Vertente',attr:'Benefício de atributo',num:'Regra de combate'};
/* seções sem criar/excluir: só editar e voltar ao padrão */
const FIXED29=['attr','pericia','num'];

/* ---------- conteúdo original (antes de qualquer alteração do Mestre) ---------- */
function base29(){
  if(R29.base)return R29.base;
  const voc=cl29(ORIGINAL_VOCATIONS);NEW_VOCATIONS.forEach(n=>{if(!voc.some(x=>x.name===n.name))voc.push(cl29((vocations||[]).find(v=>v.name===n.name)||n))});
  R29.base={
    voc,track:cl29(ORIGINAL_TRACKS),
    ritual:cl29(RITUALS.filter(r=>!/^(custom|gm)-/.test(String(r.id)))),
    weapon:cl29(WEAPONS),prot:cl29(PROTECTIONS),gear:cl29(GEAR),
    status:cl29(STATUS_DEFS),trauma:cl29(TRAUMA_DEFS),
    pericia:cl29(PERICIA_DEFS),vert:cl29(VERT_DEFS),attr:cl29(ATTR_DEFS),
  };
  return R29.base;
}
const tkey29=t=>t.archetype+'|'+t.name;
const ikey29=(kind,name)=>kind+'|'+name;
const elems29=()=>[...new Set(RITUALS.map(r=>r.element).filter(Boolean))];
const skills29=()=>[...new Set([...(typeof BASE_SKILLS!=='undefined'?BASE_SKILLS:[]),...(typeof NEW_SKILLS!=='undefined'?NEW_SKILLS:[])])].sort((a,b)=>a.localeCompare(b,'pt-BR'));

/* ---------- aplicar as regras no conteúdo vivo ---------- */
function pickVoc29(o){const x={};['name','desc'].forEach(k=>{if(o[k]!=null)x[k]=o[k]});if(Array.isArray(o.skills))x.skills=o.skills.slice(0,3);return x}
function applyVoc29(){
  const R=rules29(),B=base29();let ch=false;
  Object.entries(R.voc||{}).forEach(([key,o])=>{
    if(!o)return;
    if(o.del){const n=vocations.length;vocations=vocations.filter(v=>v.name!==key&&v.name!==o.name);return}
    if(o.name&&o.name!==key&&vocations.some(x=>x.name===o.name))vocations=vocations.filter(x=>x.name!==key); /* o catálogo antigo devolve o nome original */
    let v=vocations.find(x=>x.name===key)||vocations.find(x=>x.name===o.name);
    if(!v){const b=B.voc.find(x=>x.name===key);if(!b&&!o.add)return;v=cl29(b||{name:key,desc:'',skills:[],talents:[]});vocations.push(v)}
    Object.assign(v,pickVoc29(o));
    if(Array.isArray(o.talents)){v.talents=v.talents||[];o.talents.forEach((t,i)=>{if(!t)return;const cur=v.talents[i]||(v.talents[i]={name:'',cost:1,desc:''});['name','desc'].forEach(k=>{if(t[k]!=null)cur[k]=t[k]});if(t.cost!=null)cur.cost=Number(t.cost)||0})}
    if(data&&data.vocation===key&&o.name&&o.name!==key){data.vocation=o.name;ch=true}
  });
  return ch;
}
function applyTrack29(){
  const R=rules29(),B=base29();let ch=false;
  Object.entries(R.track||{}).forEach(([key,o])=>{
    if(!o)return;const [arch,name]=key.split('|');
    if(o.del){tracks=tracks.filter(t=>!(t.archetype===arch&&(t.name===name||t.name===o.name)));return}
    let t=tracks.find(x=>x.archetype===arch&&x.name===name)||tracks.find(x=>x.name===o.name&&x.archetype===(o.archetype||arch));
    if(!t){const b=B.track.find(x=>tkey29(x)===key);if(!b&&!o.add)return;t=cl29(b||{name,archetype:arch,desc:'',stages:[3,5,8,10].map(s=>({stage:s,name:'',desc:''}))});tracks.push(t)}
    if(o.name!=null)t.name=o.name;if(o.desc!=null)t.desc=o.desc;if(o.archetype)t.archetype=o.archetype;
    if(Array.isArray(o.stages)){t.stages=t.stages||[];o.stages.forEach((s,i)=>{if(!s)return;const cur=t.stages[i]||(t.stages[i]={stage:[3,5,8,10][i],name:'',desc:''});if(s.name!=null)cur.name=s.name;if(s.desc!=null)cur.desc=s.desc})}
    if(data&&data.track===name&&data.archetype===arch&&o.name&&o.name!==name){data.track=o.name;ch=true}
  });
  return ch;
}
function rebuildItems29(){
  const R=rules29(),B=base29();
  const one=(kind,arr,base)=>{
    arr.length=0;
    base.forEach(b=>{const o=R.item[ikey29(kind,b.name)];if(o&&o.del)return;const x=cl29(b);x._k29=b.name;if(o)itemSet29(kind,x,o);arr.push(x)});
    Object.entries(R.item).forEach(([k,o])=>{if(o&&o.add&&!o.del&&k.startsWith(kind+'|')){const x=itemNew29(kind,o);x._k29=k.slice(kind.length+1);arr.push(x)}});
  };
  one('weapon',WEAPONS,B.weapon);one('prot',PROTECTIONS,B.prot);one('gear',GEAR,B.gear);
}
function itemSet29(kind,x,o){
  if(o.name)x.name=o.name;if(o.peso)x.peso=o.peso;
  if(kind==='weapon'){if(o.dado)x.dado=o.dado;if(o.critMin!=null)x.critMin=Number(o.critMin)||20;if(o.cat)x.cat=o.cat;if(o.skill)x.skill=o.skill;if(o.note!=null)x.note=o.note}
  if(kind==='prot'){if(o.def!=null)x.def=Number(o.def)||0;if(o.slot)x.slot=o.slot;if(o.note!=null)x.note=o.note}
  if(kind==='gear'){if(o.note!=null)x.note=o.note}
}
function itemNew29(kind,o){
  const x=kind==='weapon'?{name:o.name,cat:o.cat||'Corpo a corpo',peso:o.peso||'Médio',dado:o.dado||'1d6',critMin:Number(o.critMin)||20,skill:o.skill||'Armas Brancas',area:false,effects:[],note:o.note||''}
    :kind==='prot'?{name:o.name,cat:'Equipamento',peso:o.peso||'Médio',def:Number(o.def)||0,slot:o.slot||'tronco',note:o.note||''}
    :{name:o.name,peso:o.peso||'Leve',qty:1,note:o.note||''};
  return x;
}
/* itens que já estão nos inventários acompanham a mudança do catálogo */
function syncInv29(d){
  if(!d||!d.inventory||!Array.isArray(d.inventory.items))return false;
  const R=rules29();let ch=false;
  d.inventory.items.forEach(it=>{
    if(!it||!it.kind)return;const k=it._k29||it.name,o=R.item[ikey29(it.kind,k)];if(!o||o.del)return;
    const want={name:o.name||k,peso:o.peso||it.peso};
    if(want.name!==it.name||want.peso!==it.peso){it.name=want.name;it.peso=want.peso;ch=true}
    if(it._k29!==k){it._k29=k;ch=true}
    if(it.kind==='weapon'&&it.w){const w=it.w;if(o.dado&&w.dado!==o.dado){w.dado=o.dado;ch=true}if(o.critMin!=null&&w.critMin!==Number(o.critMin)){w.critMin=Number(o.critMin);ch=true}if(o.skill&&w.skill!==o.skill){w.skill=o.skill;ch=true}if(w.name!==it.name){w.name=it.name;ch=true}if(w.peso!==it.peso){w.peso=it.peso;ch=true}}
    if(it.kind==='prot'&&it.p){if(o.def!=null&&it.p.def!==Number(o.def)){it.p.def=Number(o.def);ch=true}if(o.slot&&it.p.slot!==o.slot){it.p.slot=o.slot;ch=true}}
  });
  return ch;
}
function rebuildStatus29(){
  const R=rules29(),B=base29();
  STATUS_DEFS.length=0;
  B.status.forEach(b=>{
    const o=R.status[b.id],t=STATUS_BY_ID[b.id]||(STATUS_BY_ID[b.id]={});
    Object.keys(t).forEach(k=>delete t[k]);Object.assign(t,cl29(b));
    if(o&&o.del){Object.keys(t).forEach(k=>{if(!['id','name','group','narr','text'].includes(k))delete t[k]});t.text='(removido pelo Mestre)';t._off=true;return}
    if(o)statusSet29(t,o);STATUS_DEFS.push(t);
  });
  Object.entries(R.status).forEach(([id,o])=>{if(!o||!o.add)return;const t=STATUS_BY_ID[id]||(STATUS_BY_ID[id]={});Object.keys(t).forEach(k=>delete t[k]);
    if(o.del){Object.assign(t,{id,name:o.name||id,group:'manual',narr:'',text:'(removido pelo Mestre)',_off:true});return}
    Object.assign(t,{id,name:o.name||id,group:'manual',narr:o.narr||'',text:o.text||''});statusSet29(t,o);STATUS_DEFS.push(t)});
}
function statusSet29(t,o){
  ['name','text','narr'].forEach(k=>{if(o[k]!=null)t[k]=o[k]});
  if(o.dot!=null){const n=Number(o.dot)||0;if(n>0)t.dot={fixed:n,label:t.dot?.label||t.name};else delete t.dot}
  if(o.defense!=null){const n=Number(o.defense)||0;if(n)t.defense=n;else delete t.defense}
  if(o.physDice!=null){const n=Number(o.physDice)||0;if(n)t.physDice=n;else delete t.physDice}
  const fl=new Set(t.flags||[]);
  if(o.noMove!=null){o.noMove?fl.add('semMover'):fl.delete('semMover')}
  if(o.loseAct!=null){o.loseAct?fl.add('perdeAcao'):fl.delete('perdeAcao')}
  if(fl.size)t.flags=[...fl];else delete t.flags;
  if(o.disAtk!=null){const ds=new Set(t.disadv||[]);o.disAtk?ds.add('ataque'):ds.delete('ataque');if(ds.size)t.disadv=[...ds];else delete t.disadv}
}
function rebuildTrauma29(){
  const R=rules29(),B=base29();
  TRAUMA_DEFS.length=0;
  B.trauma.forEach(b=>{const o=R.trauma[b.id],t=TRAUMA_BY_ID[b.id]||(TRAUMA_BY_ID[b.id]={});Object.keys(t).forEach(k=>delete t[k]);Object.assign(t,cl29(b));
    if(o&&o.del){Object.keys(t).forEach(k=>{if(!['id','name','grp','text'].includes(k))delete t[k]});t.text='(removido pelo Mestre)';t._off=true;return}
    if(o)['name','text','grp'].forEach(k=>{if(o[k]!=null)t[k]=o[k]});TRAUMA_DEFS.push(t)});
  Object.entries(R.trauma).forEach(([id,o])=>{if(!o||!o.add)return;const t=TRAUMA_BY_ID[id]||(TRAUMA_BY_ID[id]={});Object.keys(t).forEach(k=>delete t[k]);Object.assign(t,{id,name:o.name||id,grp:o.grp||'Mente',text:o.text||''});if(o.del){t._off=true;return}TRAUMA_DEFS.push(t)});
}
function rebuildRitual29(){
  const R=rules29(),B=base29();
  const keep=RITUALS.filter(r=>String(r.id).startsWith('custom-'));RITUALS.length=0;
  B.ritual.forEach(b=>{const o=R.ritual[b.id];if(o&&o.del)return;const x=cl29(b);if(o)ritSet29(x,o);RITUALS.push(x)});
  Object.entries(R.ritual).forEach(([id,o])=>{if(!o||!o.add||o.del)return;const x={id,name:o.name||id,element:o.element||'Natureza',cost:o.cost||'5 ES',desc:'',levels:['','','']};ritSet29(x,o);RITUALS.push(x)});
  keep.forEach(r=>RITUALS.push(r));
}
function ritSet29(x,o){
  ['name','element','cost'].forEach(k=>{if(o[k])x[k]=o[k]});
  if(Array.isArray(o.levels)){x.levels=x.levels||['','',''];o.levels.forEach((l,i)=>{if(l!=null)x.levels[i]=l});x.desc=x.levels[0]||x.desc}
}
/* perícias e vertentes: rules.pericia / rules.vert = {id:{campos alterados, add?, del?}}
   Tudo o que vem salvo é conferido: valor antigo ou inválido cai no padrão do manual. */
const EFF29=['dados','dano','danoExtra','danoAtributo','atributoAtaque','atributoManobra','rdBloqueio','cura','dt','alcance','multiplicador','empurrao','mirar','conceder','permite','ignora','bloqueia'];
const DADO29=/^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;
const EFFNUM29={valor:[-20,20],metros:[0,60],alcanceMax:[0,200]};
function eff29(e){
  if(!e||typeof e!=='object'||!EFF29.includes(e.tipo))return null;
  const x={tipo:e.tipo};
  ['quando','alvo','acao','custo','limite'].forEach(k=>{const s=typeof e[k]==='string'?e[k].trim().slice(0,40):'';if(s)x[k]=s});
  Object.entries(EFFNUM29).forEach(([k,[lo,hi]])=>{const v=e[k];if(v===''||v==null||typeof v==='boolean')return;const n=Number(v);if(Number.isFinite(n)&&n>=lo&&n<=hi)x[k]=n});
  if(typeof e.dado==='string'&&DADO29.test(e.dado.trim()))x.dado=e.dado.trim();
  if(ATTRS.includes(e.atributo))x.atributo=e.atributo;
  return x;
}
const str29=v=>typeof v==='string'&&v.trim()!=='';
function vertSet29(sec,x,o){
  if(str29(o.name))x.name=o.name;
  if(typeof o.desc==='string')x.desc=o.desc;
  if(sec==='pericia'){if(str29(o.grupo))x.grupo=o.grupo;if(Array.isArray(o.skills)&&o.skills.length&&o.skills.every(str29))x.skills=o.skills.slice();return x}
  if(str29(o.pericia)&&PERICIA_DEFS.some(p=>p.id===o.pericia))x.pericia=o.pericia;
  if(str29(o.skill))x.skill=o.skill;
  if(Array.isArray(o.attrs)){const a=o.attrs.filter(n=>ATTRS.includes(n));if(a.length)x.attrs=a}
  if(Array.isArray(o.effects)){const f=o.effects.map(eff29).filter(Boolean);if(f.length||!o.effects.length)x.effects=f}
  if(o.requiresTraining!=null)x.requiresTraining=!!o.requiresTraining;
  return x;
}
function vertNew29(sec,id,o){
  if(sec==='pericia')return vertSet29(sec,{id,name:id,grupo:'Mesa',skills:[o.name||id],desc:''},o);
  const p=PERICIA_DEFS.find(x=>x.id===o.pericia);
  return vertSet29(sec,{id,pericia:o.pericia||'',skill:p?.skills[0]||'',name:id,attrs:['Força'],desc:'',effects:[],requiresTraining:false},o);
}
function rebuildVert29(){
  const R=rules29(),B=base29();
  [['pericia',PERICIA_DEFS],['vert',VERT_DEFS]].forEach(([sec,arr])=>{
    const out=[];
    B[sec].forEach(b=>{const o=R[sec]?.[b.id];if(o&&o.del)return;const x=cl29(b);if(o)vertSet29(sec,x,o);out.push(x)});
    Object.entries(R[sec]||{}).forEach(([id,o])=>{if(o&&o.add&&!o.del&&!B[sec].some(b=>b.id===id)){const x=vertNew29(sec,id,o);if(sec==='pericia'||PERICIA_DEFS.some(p=>p.id===x.pericia))out.push(x)}});
    arr.length=0;out.forEach(x=>arr.push(x));
  });
}
/* benefícios dos atributos e números de combate: rules.num = {id:valor}, rules.attr = {nome:{desc}} */
function rebuildNum29(){
  const R=rules29(),B=base29();
  REGRA_DEFS.forEach(r=>{const v=E.regraClean(r,R.num?.[r.id]);REGRA_NUM[r.id]=v===undefined?r.d:v});
  B.attr.forEach(b=>{const t=ATTR_DEFS.find(a=>a.id===b.id),o=R.attr?.[b.id];if(t)t.desc=str29(o?.desc)?o.desc:b.desc});
}
const group29=g=>REGRA_DEFS.filter(r=>r.g===g);
const numGroups29=()=>[...new Set(REGRA_DEFS.map(r=>r.g))].filter(g=>!ATTRS.includes(g));
const numFmt29=v=>String(v).replace('.',',');
/* efeito tático em uma frase curta (Manual, central e avisos) */
const EFFLBL29={dados:'+d20 em',dano:'dano',danoExtra:'dano extra',danoAtributo:'atributo no dano',atributoAtaque:'atributo no acerto',atributoManobra:'atributo na manobra',rdBloqueio:'redução no Bloqueio',cura:'cura',dt:'DT/resistência',alcance:'alcance',multiplicador:'multiplica',empurrao:'empurrão',mirar:'mirar',conceder:'concede d20',permite:'permite',ignora:'ignora',bloqueia:'impede'};
function effText29(e){
  const out=[EFFLBL29[e.tipo]||e.tipo];
  if(e.valor!=null)out.push(e.tipo==='multiplicador'?'× '+numFmt29(e.valor):(e.valor>=0?'+':'')+numFmt29(e.valor));
  if(e.dado)out.push('+'+e.dado);if(e.atributo)out.push(e.atributo);
  [e.quando,e.alvo,e.acao].filter(Boolean).forEach(q=>out.push(E.quandoLabel(q)));
  if(e.metros!=null)out.push(numFmt29(e.metros)+' m');if(e.alcanceMax!=null)out.push('até '+numFmt29(e.alcanceMax)+' m');
  if(e.custo)out.push('custo: '+(e.custo==='reacao'?'Reação':e.custo==='movimento'?'Ação de Movimento':e.custo));
  if(e.limite)out.push('1 vez por '+e.limite);
  return out.join(' · ');
}

/* regras da mesa: deslocamento base, DT do Arremesso e DT de Furtividade */
T3.moveBase=()=>{const n=Number(rules29().table?.move);return n>0?n:9};
{const _dt29=dtFor14;dtFor14=function(m){const b=Number(rules29().table?.dtThrow);return _dt29(m)+(b>0?b-12:0)};T3.cbDbg&&(T3.cbDbg.dtFor14=dtFor14)}
function applyTable29(){const t=rules29().table||{};if(t.dtStealth!=null&&typeof AI23!=='undefined')AI23.dt=Number(t.dtStealth)||0}

function rebuildAll29(){
  try{rebuildItems29()}catch(e){console.warn('[T29] itens',e)}
  try{rebuildStatus29()}catch(e){console.warn('[T29] estados',e)}
  try{rebuildTrauma29()}catch(e){console.warn('[T29] traumas',e)}
  try{rebuildRitual29()}catch(e){console.warn('[T29] rituais',e)}
  try{rebuildVert29()}catch(e){console.warn('[T29] vertentes',e)}
  try{rebuildNum29()}catch(e){console.warn('[T29] valores',e)}
  try{applyTable29()}catch(e){}
}
/* toda vez que a ficha desenha, vocações, trilhas e inventário seguem as regras da campanha */
const canEdit29=()=>{try{const ch=charById(activeCharacterId);return !ch||ch.ownerId===uid3()||isGM6()}catch(e){return true}};
{const _r29=render;render=function(){
  let ch=false;
  try{ch=applyVoc29()||ch;ch=applyTrack29()||ch;ch=syncInv29(data)||ch}catch(e){console.warn('[T29] aplicar',e)}
  const out=_r29.apply(this,arguments);
  try{const n=vocations.length;applyVoc29();if(vocations.length!==n){renderVocations();previewVoc()}}catch(e){}
  if(ch&&canEdit29()&&!R29.saving){R29.saving=true;setTimeout(()=>{try{save()}catch(e){}R29.saving=false},60)}
  try{gmInline29()}catch(e){}
  return out;
}}

/* ---------- carregar, gravar e transmitir ---------- */
function setRules29(r,{notify=false}={}){
  const old=R29.rules;
  R29.rules={...defRules29(),...(r&&typeof r==='object'?r:{})};
  ['voc','track','ritual','item','status','trauma','table','pericia','vert','attr','num'].forEach(k=>{if(!R29.rules[k]||typeof R29.rules[k]!=='object'||Array.isArray(R29.rules[k]))R29.rules[k]={}});
  ['beast','subel','log'].forEach(k=>{if(!Array.isArray(R29.rules[k]))R29.rules[k]=[]});
  /* só uma mudança ao vivo (a campanha já tinha sido lida) republica a minha ficha */
  const sig=JSON.stringify(REGRA_NUM),vivo=!!camp3()&&R29.synced===camp3().id;
  rebuildAll29();
  try{render()}catch(e){}
  /* os números mudaram: abas abertas se redesenham e a ficha republica Defesa e máximos */
  try{if(camp3()?.combat?.active)renderCombatUI()}catch(e){}
  if(notify&&vivo&&sig!==JSON.stringify(REGRA_NUM)&&activeCharacterId&&charById(activeCharacterId)?.ownerId===uid3())setTimeout(()=>{try{save()}catch(e){}},80);
  try{if(typeof renderAddList==='function'&&$('addList'))renderAddList()}catch(e){}
  try{if(typeof renderStatesList==='function'&&$('stList'))renderStatesList()}catch(e){}
  try{if($('ritualCatalog'))renderRituals()}catch(e){}
  try{subelPanel29()}catch(e){}
  if(notify)notify29();else seenAll29();
  if($('sys29')&&!$('sys29').classList.contains('hide')&&!R29.edit)paint29();
  return old;
}
async function fetchRules29(notify=true,want=0,tries=0){
  const c=camp3();if(!c)return;
  if(R29.fetching){R29.again=Math.max(R29.again||0,want||1);return}
  R29.fetching=true;let got=0;
  try{const v=await stGet6('rules');if(camp3()?.id!==c.id)return;
    const rev=Number(v?.rev)||0;got=rev;
    if(!(R29.rules&&rev&&rev<=(Number(R29.rules.rev)||0)&&R29.camp===c.id)){setRules29(v||defRules29(),{notify});}
    R29.synced=c.id;R29.loadedAt=Date.now()}
  catch(e){console.warn('[T29] ler regras',e)}
  finally{R29.fetching=false}
  /* o aviso pode chegar antes da gravação ficar visível: tenta de novo */
  if(want&&got<want&&tries<6)setTimeout(()=>fetchRules29(notify,want,tries+1),400+tries*300);
  else if(R29.again){const a=R29.again;R29.again=0;fetchRules29(notify,a>1?a:0)}
}
T3.rulesFetch=fetchRules29;T3.rules29dbg=()=>stGet6('rules');T3.c29=()=>({STATUS_BY_ID,STATUS_DEFS,WEAPONS,PROTECTIONS,GEAR,RITUALS,TRAUMA_DEFS});
async function saveRules29(entry){
  if(!isGM6()){toast('Somente o Mestre altera as regras do sistema.');return false}
  const R=rules29();R.rev=Math.max((Number(R.rev)||0)+1,Date.now());
  if(entry){R.log.unshift({id:rid(),at:Date.now(),...entry});R.log=R.log.slice(0,80);seen29().add(R.log[0].id);seenSave29()}
  setRules29(R);
  try{await stPut6('rules','rules',cl29(R));castRules29(R.rev);return true}
  catch(e){console.warn('[T29] gravar regras',e);toast('Não consegui salvar na nuvem: '+(e?.message||'erro'));return false}
}
onCast6(p=>{if(p&&p.t==='rules29'&&p.from!==uid3())fetchRules29(true,Number(p.rev)||0)});
/* canal próprio: o aviso chega mesmo com a ficha aberta (fora da Visão de Mesa) */
function chan29(){
  const c=camp3();if(!c){if(R29.ch){try{R29.ch.unsubscribe?.()}catch(e){}R29.ch=null;R29.chCamp=''}return}
  if(R29.ch&&R29.chCamp===c.id)return;
  try{if(R29.ch)R29.ch.unsubscribe?.()}catch(e){}R29.ch=null;R29.chLive=false;
  try{const s=sb();if(!s||typeof s.channel!=='function')return;
    const ch=s.channel('tulpa-rules-'+c.id,{config:{broadcast:{self:false}}});
    ch.on('broadcast',{event:'r'},({payload})=>{if(payload&&payload.from!==uid3())fetchRules29(true,Number(payload.rev)||0)});
    ch.subscribe(st=>{if(st==='SUBSCRIBED')R29.chLive=true});R29.ch=ch;R29.chCamp=c.id;
  }catch(e){console.warn('[T29] canal',e)}
}
const castRules29=rev=>{try{cast6({t:'rules29',rev})}catch(e){}try{if(R29.ch&&R29.chLive)R29.ch.send({type:'broadcast',event:'r',payload:{rev,from:uid3()}})}catch(e){}};
setInterval(()=>{
  try{
    const c=camp3();
    if(!c){if(R29.camp){R29.camp='';setRules29(defRules29())}return}
    if(R29.camp!==c.id){R29.camp=c.id;R29.rules=null;R29.seen=null;setRules29(defRules29());fetchRules29(true)}
    else if(Date.now()-R29.loadedAt>45000){R29.loadedAt=Date.now();fetchRules29(true)} /* reserva caso o tempo real falhe */
    chan29();sysBtn29();badges29();
  }catch(e){}
},1500);

/* ---------- avisos: só para quem a mudança afeta ---------- */
const seenKey29=()=>'tulpa_rules_seen_'+(camp3()?.id||'x');
function seen29(){if(!R29.seen){const a=lsGet6(seenKey29(),null);R29.seen=new Set(Array.isArray(a)?a:[]);R29.seenFirst=!Array.isArray(a)}return R29.seen}
function seenSave29(){lsSet6(seenKey29(),[...seen29()].slice(-200))}
function seenAll29(){const s=seen29();(rules29().log||[]).forEach(e=>s.add(e.id));seenSave29()}
const alertKey29=()=>'tulpa_rules_alert_'+(camp3()?.id||'x');
function alerts29(){return lsGet6(alertKey29(),{})||{}}
function ritTab29(){return($('ritualCatalog')?.closest('.tab')?.id||'tab-talents').slice(4)}
const hasPer29=(d,pid)=>{const p=pid&&E.pericia(pid);return!!p&&(E.trainedVerts(d,p.id).length>0||p.skills.some(s=>E.legacyRaw(d,s)>0))};
const affected29=(d,who)=>{
  if(!d.attributes||d.beastId)return false;
  if(who==='disparo')return hasPer29(d,'armasdisparo')||(d.inventory?.items||[]).some(i=>i?.w&&E.isGun(i.w));
  if(who==='medicina')return hasPer29(d,'medicina');
  if(who==='vertente')return E.trainedVerts(d).length>0||E.pendingVerts(d).length>0;
  return true;
};
function hits29(e){
  const c=camp3();if(!c)return[];
  const mine=(c.characters||[]).filter(ch=>ch&&ch.ownerId===uid3()&&!gmChar6(ch));
  const out=[];
  mine.forEach(ch=>{
    const d=dOf6(ch)||{},names=[e.key,e.label].filter(Boolean);let tab='';
    if(e.kind==='voc'&&names.includes(d.vocation))tab='vocation';
    if(e.kind==='track'){const [a,n]=String(e.key).split('|');if(d.track&&(d.track===n||d.track===e.label))tab='track'}
    if(e.kind==='ritual'&&(d.knownRituals||[]).includes(e.key))tab=ritTab29();
    if(e.kind==='item'){const [k,n]=String(e.key).split('|');if((d.inventory?.items||[]).some(it=>it&&it.kind===k&&[n,e.label].includes(it._k29||it.name)))tab='inventory'}
    if(e.kind==='status'&&(d.statuses||[]).some(s=>s&&s.id===e.key))tab='states';
    if(e.kind==='trauma'&&(d.traumas||[]).some(s=>s&&s.id===e.key))tab='mind';
    /* quem tem a especialização; se ela é nova ou mudou a exigência de treino, quem tem a perícia */
    if(e.kind==='vert'){const pid=(E.vert(e.key)||cur29('vert',e.key))?.pericia;if(d.vertentes?.[e.key]||((e.add||e.requer)&&hasPer29(d,pid)))tab='skills'}
    if(e.kind==='pericia'&&hasPer29(d,e.key))tab='skills';
    if(e.kind==='attr'||e.kind==='num'){const ids=e.ids||[],whos=ids.length?ids.map(i=>E.regraDef(i)?.who||''):[''],w=whos.find(x=>affected29(d,x));if(w!==undefined)tab=e.kind==='attr'?'attributes':w==='medicina'?'rest':w==='vertente'?'skills':'combat'}
    if(e.kind==='table')tab='combat';
    if(tab)out.push({ch,tab});
  });
  return out;
}
function notify29(){
  const s=seen29(),first=R29.seenFirst;R29.seenFirst=false;
  const fresh=(rules29().log||[]).filter(e=>e&&!s.has(e.id));fresh.forEach(e=>s.add(e.id));seenSave29();
  if(first||isGM6()||!fresh.length)return;
  const A=alerts29();let shown=0;
  fresh.slice().reverse().forEach(e=>{
    const h=hits29(e);if(!h.length)return;
    h.forEach(({ch,tab})=>{const a=A[ch.id]||(A[ch.id]={tabs:{},at:0});a.tabs[tab]=1;a.at=Date.now()});
    if(shown++<3)pop29(e,h);
  });
  lsSet6(alertKey29(),A);badges29();
}
const chg29=e=>(e.changes||[]).slice(0,4).map(([f,a,b])=>`<li><b>${esc(f)}:</b> <s>${esc(String(a??'—')).slice(0,90)}</s> → <ins>${esc(String(b??'—')).slice(0,90)}</ins></li>`).join('');
function pop29(e,h){
  let box=$('rn29');if(!box){box=document.createElement('div');box.id='rn29';box.className='rn29';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.append(box)}
  const who=[...new Set(h.map(x=>nm(x.ch)))].join(', ');
  const card=document.createElement('div');card.className='rn29-card';
  const what=e.del?'removeu':e.add?'criou':'alterou';
  card.innerHTML=`<div class="rn29-head"><span class="rn29-bang" aria-hidden="true">!</span><b>O Mestre ${what} ${esc(KIND29[e.kind]||'')}: ${esc(e.label||e.key)}</b><button type="button" class="rn29-x" aria-label="Fechar aviso">✕</button></div>${e.changes?.length?`<ul class="rn29-ch">${chg29(e)}</ul>`:''}<div class="sub">Afeta: ${esc(who)}. A ficha já foi recalculada.</div>`;
  card.querySelector('.rn29-x').onclick=()=>card.remove();
  box.prepend(card);while(box.children.length>3)box.lastElementChild.remove();
  setTimeout(()=>card.remove(),14000);
  const ch1=e.changes?.[0];
  try{say(`<b>Psiu, ${esc(nm(h[0].ch))}!</b> O Mestre ${what} <b>${esc(e.label||e.key)}</b>${ch1?`: ${esc(ch1[0])} <s>${esc(String(ch1[1]??'—')).slice(0,40)}</s> → <b>${esc(String(ch1[2]??'—')).slice(0,40)}</b>`:''}. Já ajustei a sua ficha.`,9000)}catch(err){}
  try{T3.perseusAnim?.react('noise')}catch(err){}
}
function badges29(){
  const A=alerts29(),c=camp3();if(!c)return;
  const mineHas=Object.keys(A).some(id=>{const ch=charById(id);return ch&&ch.ownerId===uid3()&&Object.keys(A[id].tabs||{}).length});
  $$('#tableCharacters .table-char[data-uid]').forEach(card=>{
    const on=card.dataset.uid===uid3()&&mineHas;let b=card.querySelector('.rn29-card-bang');
    if(on&&!b){b=document.createElement('span');b.className='rn29-card-bang';b.textContent='!';b.title='O Mestre mudou regras que afetam a sua ficha';card.append(b)}
    if(!on&&b)b.remove();
  });
  const tabs=A[activeCharacterId]?.tabs||{};
  $$('.navbtn[data-tab]').forEach(n=>{const on=!!tabs[n.dataset.tab];let b=n.querySelector('.rn29-tab-bang');if(on&&!b){b=document.createElement('span');b.className='rn29-tab-bang';b.textContent='!';b.setAttribute('aria-label','alterado pelo Mestre');n.append(b)}if(!on&&b)b.remove()});
}
document.addEventListener('click',ev=>{
  const n=ev.target.closest?.('.navbtn[data-tab]');if(!n||!activeCharacterId)return;
  const A=alerts29(),a=A[activeCharacterId];if(!a||!a.tabs[n.dataset.tab])return;
  delete a.tabs[n.dataset.tab];if(!Object.keys(a.tabs).length)delete A[activeCharacterId];lsSet6(alertKey29(),A);setTimeout(badges29,0);
},true);

/* ---------- lista "efetiva" de cada seção (original + alterações) ---------- */
function list29(sec){
  const R=rules29(),B=base29(),st=(o,native)=>!o?'orig':o.del?'del':native?'edit':'new';
  if(sec==='voc'){
    const rows=B.voc.map(b=>{const o=R.voc[b.name];return{key:b.name,name:o?.name||b.name,sub:(o?.skills||b.skills||[]).join(' · '),st:st(o,true)}});
    Object.entries(R.voc).forEach(([k,o])=>{if(o&&o.add&&!B.voc.some(b=>b.name===k))rows.push({key:k,name:o.name||k,sub:(o.skills||[]).join(' · '),st:st(o,false)})});
    return rows;
  }
  if(sec==='track'){
    const rows=B.track.map(b=>{const k=tkey29(b),o=R.track[k];return{key:k,name:o?.name||b.name,sub:o?.archetype||b.archetype,st:st(o,true)}});
    Object.entries(R.track).forEach(([k,o])=>{if(o&&o.add&&!B.track.some(b=>tkey29(b)===k))rows.push({key:k,name:o.name||k,sub:o.archetype||k.split('|')[0],st:st(o,false)})});
    return rows;
  }
  if(sec==='ritual'){
    const rows=B.ritual.map(b=>{const o=R.ritual[b.id];return{key:b.id,name:o?.name||b.name,sub:(o?.element||b.element)+' · '+(o?.cost||b.cost),st:st(o,true)}});
    Object.entries(R.ritual).forEach(([k,o])=>{if(o&&o.add)rows.push({key:k,name:o.name||k,sub:(o.element||'')+' · '+(o.cost||'5 ES'),st:st(o,false)})});
    return rows;
  }
  if(sec==='item'){
    const rows=[];
    [['weapon','Arma',B.weapon],['prot','Proteção',B.prot],['gear','Equipamento',B.gear]].forEach(([kind,lbl,arr])=>{
      arr.forEach(b=>{const k=ikey29(kind,b.name),o=R.item[k];rows.push({key:k,name:o?.name||b.name,sub:lbl+' · '+(o?.peso||b.peso)+(kind==='weapon'?' · '+(o?.dado||b.dado):'')+(kind==='prot'?' · Defesa '+(o?.def??b.def):''),st:st(o,true)})});
      Object.entries(R.item).forEach(([k,o])=>{if(o&&o.add&&k.startsWith(kind+'|'))rows.push({key:k,name:o.name,sub:lbl+' · '+(o.peso||'')+(kind==='weapon'?' · '+(o.dado||''):'')+(kind==='prot'?' · Defesa '+(o.def??0):''),st:st(o,false)})});
    });
    return rows;
  }
  if(sec==='status'){
    const rows=B.status.map(b=>{const o=R.status[b.id];const dot=o?.dot!=null?Number(o.dot):b.dot?.fixed;return{key:b.id,name:o?.name||b.name,sub:(dot?`${dot} de dano por turno · `:'')+String(o?.text??b.text).slice(0,80),st:st(o,true)}});
    Object.entries(R.status).forEach(([k,o])=>{if(o&&o.add)rows.push({key:k,name:o.name||k,sub:(Number(o.dot)?`${o.dot} de dano por turno · `:'')+String(o.text||'').slice(0,80),st:st(o,false)})});
    return rows;
  }
  if(sec==='trauma'){
    const rows=B.trauma.map(b=>{const o=R.trauma[b.id];return{key:b.id,name:o?.name||b.name,sub:(o?.grp||b.grp)+' · '+String(o?.text??b.text).slice(0,80),st:st(o,true)}});
    Object.entries(R.trauma).forEach(([k,o])=>{if(o&&o.add)rows.push({key:k,name:o.name||k,sub:(o.grp||'')+' · '+String(o.text||'').slice(0,80),st:st(o,false)})});
    return rows;
  }
  if(sec==='attr')return B.attr.map(b=>{const ids=group29(b.id).map(r=>r.id),mine=ids.some(i=>R.num?.[i]!==undefined)||!!R.attr?.[b.id];return{key:b.id,name:b.id+' ('+b.sigla+')',sub:E.attrBenefits(b.id).join(' '),st:mine?'edit':'orig'}});
  if(sec==='num')return numGroups29().map(g=>({key:g,name:g,sub:group29(g).map(r=>r.l.split(':')[0]+' '+numFmt29(E.regra(r.id))).join(' · ').slice(0,160),st:group29(g).some(r=>R.num?.[r.id]!==undefined)?'edit':'orig'}));
  if(sec==='pericia'||sec==='vert'){
    const sub=(b,o)=>sec==='vert'?((PERICIA_DEFS.find(p=>p.id===(o?.pericia||b?.pericia))?.name||'')+' · '+(o?.attrs||b?.attrs||[]).join(' ou ')):(o?.skills||b?.skills||[]).join(' · ');
    const rows=B[sec].map(b=>{const o=R[sec][b.id];return{key:b.id,name:o?.name||b.name,sub:sub(b,o),st:st(o,true)}});
    Object.entries(R[sec]).forEach(([k,o])=>{if(o&&o.add&&!B[sec].some(b=>b.id===k))rows.push({key:k,name:o.name||k,sub:sub(null,o),st:st(o,false)})});
    return rows;
  }
  if(sec==='beast'){const L=R.beast||[],row=(b,st)=>({key:b.id,name:b.name,sub:`${b.tier||'Inimigo'} · VT ${b.vital||'—'} · Defesa ${b.def||'—'} · ${b.dano||'—'}`,st});
    return(typeof BEAST_BASE!=='undefined'?BEAST_BASE:[]).map(b=>{const o=L.find(x=>x.id===b.id);return row(o||b,o?'edit':'orig')}).concat(L.filter(x=>!String(x.id).startsWith('bb-')).map(b=>row(b,'new')))}
  if(sec==='subel'){const L=R.subel||[];
    const off=(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE:[]).map(b=>{const o=L.find(x=>x.id===b.id);return{key:b.id,name:b.name,sub:`${b.a} + ${b.b} · `+String(o?.desc??b.desc).slice(0,80),st:o?'edit':'orig'}});
    return off.concat(L.filter(x=>!String(x.id).startsWith('sub-')).map(b=>({key:b.id,name:b.name,sub:(b.element||'')+' · '+String(b.desc||'').slice(0,80),st:'new'})))}
  return[];
}
/* valores atuais de um registro (para o formulário e para o "antes") */
function cur29(sec,key){
  const R=rules29(),B=base29();
  if(sec==='voc'){const b=B.voc.find(x=>x.name===key),o=R.voc[key]||{};const v=cl29(b||{name:key,desc:'',skills:['','',''],talents:[{},{}]});Object.assign(v,pickVoc29(o));if(o.talents)o.talents.forEach((t,i)=>{v.talents[i]={...(v.talents[i]||{}),...t}});return v}
  if(sec==='track'){const b=B.track.find(x=>tkey29(x)===key),o=R.track[key]||{};const [a,n]=String(key).split('|');const t=cl29(b||{name:n,archetype:a,desc:'',stages:[3,5,8,10].map(s=>({stage:s,name:'',desc:''}))});if(o.name)t.name=o.name;if(o.desc!=null)t.desc=o.desc;if(o.archetype)t.archetype=o.archetype;if(o.stages)o.stages.forEach((s,i)=>{t.stages[i]={...(t.stages[i]||{}),...s}});return t}
  if(sec==='ritual'){const b=B.ritual.find(x=>x.id===key),o=R.ritual[key]||{};const x=cl29(b||{id:key,name:'',element:'Natureza',cost:'5 ES',desc:'',levels:['','','']});ritSet29(x,o);if(!x.levels)x.levels=[x.desc||'','',''];return x}
  if(sec==='item'){const [kind,n]=String(key).split('|'),arr=kind==='weapon'?B.weapon:kind==='prot'?B.prot:B.gear,b=arr.find(x=>x.name===n),o=R.item[key]||{};const x=b?cl29(b):itemNew29(kind,{name:n,...o});if(b)itemSet29(kind,x,o);x.kind=kind;return x}
  if(sec==='status'){const b=B.status.find(x=>x.id===key),o=R.status[key]||{};const t=cl29(b||{id:key,name:'',group:'manual',narr:'',text:''});statusSet29(t,o);return t}
  if(sec==='trauma'){const b=B.trauma.find(x=>x.id===key),o=R.trauma[key]||{};const t=cl29(b||{id:key,name:'',grp:'Mente',text:''});['name','text','grp'].forEach(k=>{if(o[k]!=null)t[k]=o[k]});return t}
  if(sec==='pericia'||sec==='vert'){const b=B[sec].find(x=>x.id===key),o=R[sec][key]||{};return b?vertSet29(sec,cl29(b),o):vertNew29(sec,key,o)}
  if(sec==='attr'||sec==='num'){const num=Object.fromEntries(group29(key).map(r=>[r.id,E.regra(r.id)]));return sec==='attr'?{...cl29(ATTR_DEFS.find(a=>a.id===key)),num}:{id:key,name:key,num}}
  if(sec==='beast'){const b=(typeof BEAST_BASE!=='undefined'?BEAST_BASE:[]).find(x=>x.id===key),o=(R.beast||[]).find(x=>x.id===key);return cl29(o?{...(b||{}),...o}:b||{id:key,name:'',tier:'Inimigo',el:'',vital:20,def:12,atk:'+3',dano:'1d6',skills:'',notes:'',ai:'agressivo'})}
  if(sec==='subel'){const b=String(key).startsWith('sub-')&&typeof SUBEL_BASE!=='undefined'?SUBEL_BASE.find(x=>x.id===key):null,o=(R.subel||[]).find(x=>x.id===key);
    if(b)return cl29({...b,element:`${b.a} + ${b.b}`,off:1,...(o?{desc:o.desc}:{})});
    return cl29(o||{id:key,name:'',element:'Natureza',desc:''})}
  return{};
}
const isNative29=(sec,key)=>{const B=base29();return sec==='voc'?B.voc.some(x=>x.name===key):sec==='track'?B.track.some(x=>tkey29(x)===key):sec==='ritual'?B.ritual.some(x=>x.id===key):sec==='item'?(()=>{const [k,n]=String(key).split('|');return(k==='weapon'?B.weapon:k==='prot'?B.prot:B.gear).some(x=>x.name===n)})():sec==='status'?B.status.some(x=>x.id===key):sec==='trauma'?B.trauma.some(x=>x.id===key):(sec==='pericia'||sec==='vert')?B[sec].some(x=>x.id===key):sec==='attr'||sec==='num'};

/* ---------- a central ---------- */
function sysBtn29(){
  const gm=isGM6()&&!!camp3();
  const mb=$('masterBtn');if(mb){if(!mb.dataset.t29){mb.dataset.t29='1';mb.innerHTML='⚙️ Alterações do Sistema';mb.onclick=()=>open29()}mb.classList.toggle('hide',!gm)}
  $('masterPanel')?.classList.remove('open');
  const grid=$q('#campaignHub .portal-grid');
  if(grid){let b=$('openSys29');
    if(!b&&gm){b=document.createElement('button');b.className='portal-card sys29-card';b.id='openSys29';b.innerHTML='<div class="symbol">⚙️</div><h2>Alterações do Sistema</h2><p>Vocações, Trilhas, Atributos, Especializações, valores de combate, Rituais, Itens, Estados e Bestiário desta campanha.</p>';b.onclick=()=>open29();grid.append(b)}
    if(b)b.classList.toggle('hide',!gm)}
}
T3.sysOpen=(s,k)=>open29(s,k);
function open29(sec,key){
  if(!isGM6()){toast('Somente o Mestre abre as Alterações do Sistema.');return}
  if(!camp3()){toast('Entre numa campanha primeiro.');return}
  let w=$('sys29');
  if(!w){w=document.createElement('div');w.id='sys29';w.className='sys29 hide';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Alterações do Sistema');
    w.innerHTML=`<div class="sys29-box"><header class="sys29-top"><div><h2>⚙️ Alterações do Sistema</h2><p class="sub">Vale para toda a campanha e chega às fichas e ao combate na hora. Só quem for afetado recebe aviso.</p></div><button type="button" class="btn small" id="sys29x">Fechar</button></header><div class="sys29-body"><nav class="sys29-nav" aria-label="Seções"></nav><section class="sys29-main" id="sys29main"></section></div></div>`;
    document.body.append(w);
    w.querySelector('#sys29x').onclick=close29;
    w.addEventListener('click',e=>{if(e.target===w)close29()});
    w.addEventListener('keydown',e=>{if(e.key==='Escape')close29()});
  }
  w.querySelector('.sys29-nav').innerHTML=SEC29.map(([id,ico,n])=>`<button type="button" class="sys29-tab" data-s29="${id}">${ico} ${n}</button>`).join('');
  $$('[data-s29]',w).forEach(b=>b.onclick=()=>{R29.sec=b.dataset.s29;R29.edit=null;R29.q='';paint29()});
  if(sec)R29.sec=sec;R29.edit=null;
  w.classList.remove('hide');document.body.classList.add('sys29-open');
  if(key!==undefined)edit29(R29.sec,key);else paint29();
}
function close29(){$('sys29')?.classList.add('hide');document.body.classList.remove('sys29-open');R29.edit=null}
const stTag29={orig:'',edit:'<span class="pill sys29-p edit">editado</span>',new:'<span class="pill sys29-p new">novo</span>',del:'<span class="pill sys29-p del">removido</span>'};
function paint29(){
  const w=$('sys29'),m=$('sys29main');if(!w||!m)return;
  $$('[data-s29]',w).forEach(b=>b.classList.toggle('on',b.dataset.s29===R29.sec));
  const sec=R29.sec,lbl=SEC29.find(s=>s[0]===sec)?.[2]||'';
  if(sec==='table')return tableForm29(m);
  if(sec==='log')return logView29(m);
  const q=R29.q.toLowerCase(),rows=list29(sec).filter(r=>!q||(r.name+' '+r.sub).toLowerCase().includes(q));
  const counts=list29(sec).reduce((a,r)=>(a[r.st]=(a[r.st]||0)+1,a),{});
  m.innerHTML=`<div class="sys29-head"><h3>${esc(lbl)}</h3><span class="sub">${list29(sec).length} no total${counts.edit?` · ${counts.edit} editados`:''}${counts.new&&!['beast','subel'].includes(sec)?` · ${counts.new} novos`:''}${counts.del?` · ${counts.del} removidos`:''}</span>${FIXED29.includes(sec)?'':'<button type="button" class="btn primary small" id="sys29add">＋ Novo</button>'}</div>
    <input class="search" id="sys29q" placeholder="Buscar em ${esc(lbl.toLowerCase())}" value="${esc(R29.q)}" aria-label="Buscar">
    <ul class="sys29-list">${rows.slice(0,400).map(r=>`<li class="sys29-row ${r.st}"><div class="grow"><b>${esc(r.name)}</b> ${stTag29[r.st]}<div class="sub">${esc(r.sub)}</div></div><div class="sys29-acts">${r.st==='del'?`<button type="button" class="btn small" data-rs29="${esc(r.key)}" title="Restaurar">↺ Restaurar</button>`:`<button type="button" class="btn small" data-e29="${esc(r.key)}" aria-label="Editar ${esc(r.name)}">✏️</button>${FIXED29.includes(sec)?'':`<button type="button" class="btn small danger" data-d29="${esc(r.key)}" aria-label="Excluir ${esc(r.name)}">🗑️</button>`}${r.st==='edit'?`<button type="button" class="btn small" data-rs29="${esc(r.key)}" title="Voltar ao original">↺</button>`:''}`}</div></li>`).join('')||'<li class="empty">Nada por aqui ainda. Use ＋ Novo.</li>'}</ul>`;
  const qi=$('sys29q');qi.oninput=()=>{R29.q=qi.value;const p=qi.selectionStart;paint29();const n=$('sys29q');n.focus();try{n.setSelectionRange(p,p)}catch(e){}};
  if($('sys29add'))$('sys29add').onclick=()=>{R29.newPericia='';edit29(sec,null)};
  $$('[data-e29]',m).forEach(b=>b.onclick=()=>edit29(sec,b.dataset.e29));
  $$('[data-d29]',m).forEach(b=>b.onclick=()=>del29(sec,b.dataset.d29));
  $$('[data-rs29]',m).forEach(b=>b.onclick=()=>restore29(sec,b.dataset.rs29));
}
/* ---------- formulários ---------- */
const fI29=(id,l,v,t='text',x='')=>`<div class="field"><label for="${id}">${l}</label><input id="${id}" type="${t}" value="${esc(String(v??''))}" ${x}></div>`;
const fT29=(id,l,v,r=3)=>`<div class="field full"><label for="${id}">${l}</label><textarea id="${id}" rows="${r}">${esc(String(v??''))}</textarea></div>`;
const fS29=(id,l,v,opts)=>`<div class="field"><label for="${id}">${l}</label><select id="${id}">${opts.map(o=>Array.isArray(o)?o:[o,o]).map(([a,b])=>`<option value="${esc(a)}" ${String(a)===String(v)?'selected':''}>${esc(b)}</option>`).join('')}</select></div>`;
const fC29=(id,l,v)=>`<label class="t3-check"><input type="checkbox" id="${id}" ${v?'checked':''}> ${l}</label>`;
const gv29=id=>{const e=$(id);return e?(e.type==='checkbox'?e.checked:e.value.trim()):''};
function edit29(sec,key){
  const m=$('sys29main');if(!m){open29(sec,key);return}
  R29.sec=sec;R29.edit={sec,key};$$('[data-s29]').forEach(b=>b.classList.toggle('on',b.dataset.s29===sec));
  const isNew=key==null,c=isNew?null:cur29(sec,key),lbl=KIND29[sec];
  let f='';
  if(sec==='voc'){const v=c||{name:'',desc:'',skills:['','',''],talents:[{name:'',cost:1,desc:''},{name:'',cost:2,desc:''}]},sk=['',...skills29()];
    f=fI29('e29n','Nome',v.name)+fT29('e29d','Descrição',v.desc)+`<div class="sys29-3">${[0,1,2].map(i=>fS29('e29s'+i,'Perícia '+(i+1)+' (+V)',v.skills[i]||'',sk)).join('')}</div>`+[0,1].map(i=>{const t=v.talents?.[i]||{};return`<fieldset class="sys29-fs"><legend>Talento ${i+1}</legend>${fI29('e29t'+i+'n','Nome',t.name)}${fI29('e29t'+i+'c','Custo (ES)',t.cost??1,'number','min="0" max="20"')}${fT29('e29t'+i+'d','Efeito',t.desc,2)}</fieldset>`}).join('')}
  if(sec==='track'){const t=c||{name:'',archetype:'Lutador',desc:'',stages:[3,5,8,10].map(s=>({stage:s,name:'',desc:''}))};
    f=fS29('e29a','Arquétipo',t.archetype,ARCH29)+fI29('e29n','Nome da trilha',t.name)+fT29('e29d','Resumo',t.desc)+(t.stages||[]).slice(0,4).map((s,i)=>`<fieldset class="sys29-fs"><legend>Estágio ${s.stage||[3,5,8,10][i]}</legend>${fI29('e29g'+i+'n','Habilidade',s.name)}${fT29('e29g'+i+'d','Efeito',s.desc,2)}</fieldset>`).join('')}
  if(sec==='ritual'){const r=c||{name:'',element:elems29()[0]||'Natureza',cost:'5 ES',levels:['','','']};
    f=fI29('e29n','Nome',r.name)+fS29('e29el','Elemento',r.element,elems29())+fI29('e29c','Custo base',r.cost)+fT29('e29l0','Execução base',r.levels?.[0]??r.desc)+fT29('e29l1','Avançada (10 ES)',r.levels?.[1],2)+fT29('e29l2','Próspera (20 ES)',r.levels?.[2],2)}
  if(sec==='item'){const it=c||{kind:'weapon',name:'',peso:'Médio',dado:'1d6',critMin:20,cat:'Corpo a corpo',skill:'Armas Brancas',def:2,slot:'tronco',note:''},k=it.kind;
    f=(isNew?fS29('e29k','Tipo',k,[['weapon','Arma'],['prot','Proteção'],['gear','Equipamento']]):'')+fI29('e29n','Nome',it.name)+fS29('e29p','Peso',it.peso,PESO29)
     +`<div class="sys29-k" data-k29="weapon">${fI29('e29dado','Dano',it.dado||'1d6','text','placeholder="1d8 ou 2d6+1"')}${fI29('e29crit','Crítico a partir de',it.critMin??20,'number','min="2" max="20"')}${fS29('e29cat','Categoria',it.cat||'Corpo a corpo',['Corpo a corpo','Distância','Especial'])}${fS29('e29sk','Perícia de ataque',it.skill||'Armas Brancas',ATTACK_SKILLS)}</div>`
     +`<div class="sys29-k" data-k29="prot">${fI29('e29def','Defesa',it.def??2,'number','min="0" max="20"')}${fS29('e29slot','Espaço no corpo',it.slot||'tronco',Object.entries(SLOT_LABEL))}</div>`
     +fT29('e29note','Descrição',it.note||'',2)}
  if(sec==='status'){const s=c||{name:'',text:'',narr:''};
    f=fI29('e29n','Nome',s.name)+fT29('e29d','Regra (o que aparece na ficha)',s.text,2)+fT29('e29nr','Narração',s.narr,2)+`<div class="sys29-3">${fI29('e29dot','Dano por turno (PV)',s.dot?.fixed??0,'number','min="0" max="50"')}${fI29('e29def','Defesa (− penalidade)',s.defense??0,'number','min="-20" max="20"')}${fI29('e29ph','Dados em testes físicos',s.physDice??0,'number','min="-5" max="5"')}</div>`
     +fC29('e29mv','Não pode se mover',(s.flags||[]).includes('semMover'))+fC29('e29atk','Desvantagem em ataques',(s.disadv||[]).includes('ataque'))+fC29('e29act','Perde a próxima ação',(s.flags||[]).includes('perdeAcao'))}
  if(sec==='trauma'){const t=c||{name:'',grp:'Mente',text:''};f=fI29('e29n','Nome',t.name)+fI29('e29g','Grupo',t.grp)+fT29('e29d','Efeito',t.text)}
  if(sec==='beast'){const b=c||cur29('beast',null);f=fI29('e29n','Nome',b.name)+fS29('e29tier','Tipo',b.tier||'Inimigo',['Capanga','Inimigo','Elite','Chefe','Entidade'])+`<div class="sys29-3">${fS29('e29bel','Elemento',b.el||'',['','Natureza','Inexistência','Ilusão','Verdade','Fé','Sol','Desrealização','Pofenia','Confabulação','Metáfora'])}${fS29('e29ai','Comportamento (IA)',b.ai||'agressivo',['agressivo','cacador','covarde','protetor','conjurador','emboscador','chefe'])}</div>`+`<div class="sys29-3">${fI29('e29vt','Vitalidade',b.vital,'number','min="1" max="999"')}${fI29('e29def','Defesa',b.def,'number','min="0" max="40"')}${fI29('e29atk','Ataque (bônus)',b.atk)}</div>`+fI29('e29dano','Dano',b.dano)+fT29('e29sk','Perícias e poderes',b.skills,2)+fT29('e29nt','Notas e comportamento',b.notes,3)}
  if(sec==='attr'){f=`<p class="sub full">Hoje: ${esc(E.attrBenefits(c.name).join(' '))}</p>`+fT29('e29d','Resumo do atributo (aparece no Manual)',c.desc,2)+group29(c.name).map(r=>numField29(r,c.num[r.id])).join('')}
  if(sec==='num'){f=group29(c.name).map(r=>numField29(r,c.num[r.id])).join('')}
  if(sec==='pericia'){const x=c||{name:'',desc:'',skills:[]};f=fI29('e29n','Nome da perícia',x.name)+fT29('e29d','Descrição',x.desc,3)+`<p class="sub full">Perícia(s) da ficha ligadas: <b>${esc((x.skills||[]).join(', '))}</b>.</p>`}
  if(sec==='vert'){const first=PERICIA_DEFS.find(p=>p.id===R29.newPericia)||PERICIA_DEFS[0];f=vertForm29(c||{pericia:first.id,name:'',desc:'',attrs:['Força'],effects:[],requiresTraining:false},isNew)}
  if(sec==='subel'){const s=c||cur29('subel',null);
    if(s.off)f=`<p class="sub">Sub-elemento oficial do Ciclo Elemental: <b>${esc(s.name)}</b> nasce de <b>${esc(s.a)} + ${esc(s.b)}</b>. O nome fica fixo porque os rituais dependem dele; o conceito aparece no diagrama, no Manual e na ficha.</p><input type="hidden" id="e29n" value="${esc(s.name)}">`+fT29('e29d','Conceito',s.desc,2);
    else f=fI29('e29n','Nome do sub-elemento',s.name)+fS29('e29el','Elemento de origem',s.element,elems29())+fT29('e29d','Descrição e efeitos',s.desc)}
  m.innerHTML=`<div class="sys29-head"><button type="button" class="btn small" id="e29back">← Voltar</button><h3>${isNew?'Novo':'Editar'} ${esc((lbl||'').toLowerCase())}</h3>${!isNew&&isNative29(sec,key)?'<span class="sub">Conteúdo do manual. Dá para voltar ao original depois.</span>':''}</div><form class="sys29-form" id="e29f">${f}<div class="sys29-save"><button type="submit" class="btn primary">Salvar e aplicar na mesa</button><button type="button" class="btn" id="e29cancel">Cancelar</button></div></form>`;
  const kSync=()=>{const k=isNew&&sec==='item'?gv29('e29k'):c?.kind;$$('[data-k29]',m).forEach(d=>d.classList.toggle('hide',d.dataset.k29!==k))};
  if(sec==='item'){kSync();$('e29k')&&($('e29k').onchange=kSync)}
  if(sec==='vert')bindVert29(m);
  $('e29back').onclick=$('e29cancel').onclick=()=>{R29.edit=null;paint29()};
  $('e29f').onsubmit=async ev=>{ev.preventDefault();const ok=await submit29(sec,key,c);if(ok){R29.edit=null;paint29()}};
  setTimeout(()=>($('e29n')||$q('#e29f input,#e29f textarea'))?.focus(),30);
}
/* ---------- formulários das regras novas ---------- */
const numField29=(r,v)=>r.t==='dado'?fI29('e29x-'+r.id,`${r.l} (padrão ${r.d})`,v,'text','placeholder="1d4"')
  :fI29('e29x-'+r.id,`${r.l} (padrão ${numFmt29(r.d)})`,v,'number',`min="${r.min}" max="${r.max}" step="${r.step}" inputmode="decimal"`);
const FXF29=[['quando','Quando'],['alvo','Alvo'],['acao','Ação']];
function fxRow29(e,i){
  const sel=(k,l,opts)=>`<label class="field"><span class="field-label">${l}</span><select data-fx="${k}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(e[k]||'')===v?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
  const inp=(k,l,t='text',x='')=>`<label class="field"><span class="field-label">${l}</span><input data-fx="${k}" type="${t}" value="${esc(String(e[k]??''))}" ${x}></label>`;
  const keep=(v,list)=>v&&!list.some(o=>o[0]===v)?[...list,[v,v]]:list;
  return`<fieldset class="sys29-fs sys29-fx" data-fxrow><legend>Efeito ${i+1}</legend>${sel('tipo','Tipo',EFF29.map(t=>[t,EFFLBL29[t]+' ('+t+')']))}${FXF29.map(([k,l])=>inp(k,l,'text',`list="e29dl-${k}"`)).join('')}${inp('valor','Valor (d20, dano, multiplicador)','number','step="0.5" min="-20" max="20"')}${inp('dado','Dado (ex.: 1d4)')}${sel('atributo','Atributo',[['','—'],...ATTRS.map(a=>[a,a])])}${sel('custo','Custo',keep(e.custo,[['','—'],['reacao','Reação'],['movimento','Ação de Movimento']]))}${sel('limite','Limite',keep(e.limite,[['','—'],['cena','1 vez por cena']]))}${inp('metros','Metros','number','step="0.5" min="0" max="60"')}${inp('alcanceMax','Alcance máximo (m)','number','step="0.5" min="0" max="200"')}<button type="button" class="btn small danger" data-fxdel>Remover efeito</button></fieldset>`;
}
function vertForm29(v,isNew){
  const lists=FXF29.map(([k])=>`<datalist id="e29dl-${k}">${[...new Set([...base29().vert.flatMap(x=>x.effects.map(e=>e[k])),...(k==='quando'?Object.keys(QUANDO_LABEL):[])].filter(Boolean))].sort().map(o=>`<option value="${esc(o)}">${esc(E.quandoLabel(o))}</option>`).join('')}</datalist>`).join('');
  const per=PERICIA_DEFS.find(p=>p.id===v.pericia);
  return(isNew?fS29('e29per','Perícia',v.pericia,PERICIA_DEFS.map(p=>[p.id,p.name])):`<p class="sub full">Perícia: <b>${esc(per?.name||v.pericia)}</b></p>`)
    +fI29('e29n','Nome da especialização',v.name)+fT29('e29d','Benefício (texto que aparece na ficha e no Manual)',v.desc,3)
    +`<fieldset class="sys29-fs sys29-attrs"><legend>Atributos possíveis</legend>${ATTRS.map(a=>`<label class="t3-check"><input type="checkbox" data-vattr="${a}" ${v.attrs.includes(a)?'checked':''}> ${a}</label>`).join('')}</fieldset>`
    +fC29('e29req','Exige treino específico (não vale o generalismo)',v.requiresTraining)
    +`<p class="sub full"><b>Efeitos táticos</b> são o que o sistema aplica sozinho nas rolagens e no combate. "+d20 em" com uma situação nova vira uma opção na hora de rolar.</p><div id="e29fx">${(v.effects||[]).map(fxRow29).join('')}</div><div><button type="button" class="btn small" id="e29fxadd">＋ Efeito</button></div>${lists}`;
}
function bindVert29(m){
  const box=$('e29fx');if(!box)return;
  const renum=()=>$$('[data-fxrow] legend',box).forEach((l,i)=>l.textContent='Efeito '+(i+1));
  box.addEventListener('click',e=>{const b=e.target.closest('[data-fxdel]');if(!b)return;b.closest('[data-fxrow]').remove();renum();$('e29fxadd').focus()});
  $('e29fxadd').onclick=()=>{box.insertAdjacentHTML('beforeend',fxRow29({tipo:'dados',valor:1},box.children.length));$q('[data-fx="tipo"]',box.lastElementChild).focus()};
}
/* lê as linhas de efeito; devolve {err} ou {list} */
function readFx29(){
  const list=[];
  for(const [i,row] of $$('#e29fx [data-fxrow]').entries()){
    const raw={};$$('[data-fx]',row).forEach(c=>{const v=c.value.trim();if(v!=='')raw[c.dataset.fx]=v});
    if(raw.dado&&!DADO29.test(raw.dado))return{err:`Efeito ${i+1}: dado inválido (use algo como 1d4).`};
    for(const [k,[lo,hi]] of Object.entries(EFFNUM29))if(raw[k]!=null&&!(Number(raw[k])>=lo&&Number(raw[k])<=hi))return{err:`Efeito ${i+1}: ${k} deve ficar entre ${lo} e ${hi}.`};
    const x=eff29(raw);if(!x)return{err:`Efeito ${i+1}: escolha o tipo.`};list.push(x);
  }
  return{list};
}
async function submitNum29(sec,key){
  const R=rules29(),changes=[],ids=[],next={};
  for(const r of group29(key)){
    const v=E.regraClean(r,gv29('e29x-'+r.id));
    if(v===undefined){toast(r.t==='dado'?`${r.l}: use um dado como 1d4.`:`${r.l}: use um número de ${r.min} a ${r.max}${r.step!==1?' (passo '+numFmt29(r.step)+')':''}.`);return false}
    next[r.id]=v;const old=E.regra(r.id);if(v!==old){changes.push([r.l,numFmt29(old),numFmt29(v)]);ids.push(r.id)}
  }
  const get=id=>next[id]??E.regra(id);
  if(get('empurraoMargem3')<=get('empurraoMargem2')){toast('Empurrar: a margem de 3 faixas precisa ser maior que a de 2.');return false}
  if(sec==='attr'){const old=cur29('attr',key).desc,desc=gv29('e29d')||base29().attr.find(a=>a.id===key).desc;
    if(desc!==old)changes.push(['Descrição',old,desc]);
    if(desc===base29().attr.find(a=>a.id===key).desc)delete R.attr[key];else R.attr[key]={desc}}
  if(!changes.length){toast('Nada mudou.');return true}
  Object.entries(next).forEach(([id,v])=>{if(v===E.regraDef(id).d)delete R.num[id];else R.num[id]=v});
  /* mudança só de texto avisa todo mundo que tem o atributo */
  const ok=await saveRules29({kind:sec,key,label:key,ids:changes.length>ids.length?[]:ids,changes});
  if(ok)toast(`${key}: atualizado. A mesa já recebeu.`);
  return ok;
}
/* compara antes x depois para o aviso */
function diff29(a,b,fields){const out=[];fields.forEach(([k,l,fmt])=>{const f=fmt||(x=>x==null?'':Array.isArray(x)?x.join(', '):String(x));const x=f(a?.[k]),y=f(b?.[k]);if(x!==y)out.push([l,x||'—',y||'—'])});return out}
async function submit29(sec,key,c){
  if(sec==='attr'||sec==='num')return submitNum29(sec,key);
  const R=rules29(),isNew=key==null,name=gv29('e29n');
  if(!name){toast('Dê um nome.');return false}
  let k=key,o,after,changes=[],extra={};
  if(sec==='pericia'){
    o={name,desc:gv29('e29d')};changes=diff29(c,o,[['name','Nome'],['desc','Descrição']]);if(changes.length)R.pericia[key]={...(R.pericia[key]||{}),...o};
  }
  if(sec==='vert'){
    const pid=isNew?gv29('e29per'):c.pericia,attrs=$$('#e29f [data-vattr]').filter(x=>x.checked).map(x=>x.dataset.vattr),fx=readFx29();
    if(!attrs.length){toast('Marque pelo menos um atributo.');return false}
    if(fx.err){toast(fx.err);return false}
    if(list29('vert').some(r=>r.key!==key&&r.st!=='del'&&r.name===name&&cur29('vert',r.key).pericia===pid)){toast('Essa perícia já tem uma especialização com esse nome.');return false}
    /* a ordem dos atributos de antes é mantida (o 1º desempata a escolha automática) */
    const old=c?.attrs||[],ordered=[...old.filter(a=>attrs.includes(a)),...attrs.filter(a=>!old.includes(a))];
    o={name,desc:gv29('e29d'),attrs:ordered,requiresTraining:gv29('e29req'),effects:fx.list};
    if(isNew){k=pid+'.gm-'+rid().slice(0,6);o.add=1;o.pericia=pid}else if(R.vert[key]?.add){o.add=1;o.pericia=R.vert[key].pericia}
    const yes=x=>x?'sim':'não',efs=l=>(l||[]).map(effText29).join('; ')||'nenhum';
    changes=diff29(c,o,[['name','Nome'],['attrs','Atributos'],['requiresTraining','Exige treino',yes],['effects','Efeitos',efs],['desc','Benefício']]);
    extra.requer=!isNew&&!!c.requiresTraining!==!!o.requiresTraining?1:0;
    if(isNew||changes.length)R.vert[k]=o;
  }
  if(sec==='voc'){
    const skills=[0,1,2].map(i=>gv29('e29s'+i)).filter(Boolean);if(skills.length!==3||new Set(skills).size!==3){toast('Escolha três perícias diferentes.');return false}
    const talents=[0,1].map(i=>({name:gv29('e29t'+i+'n'),cost:Number(gv29('e29t'+i+'c'))||0,desc:gv29('e29t'+i+'d')}));
    o={name,desc:gv29('e29d'),skills,talents};if(isNew){k=name;if(list29('voc').some(r=>r.key===k||r.name===k)){toast('Já existe uma vocação com esse nome.');return false}o.add=1}else if(R.voc[key]?.add)o.add=1;
    changes=diff29(c,o,[['name','Nome'],['skills','Perícias'],['desc','Descrição']]);
    [0,1].forEach(i=>{const a=c?.talents?.[i]||{},b=talents[i];if(a.name!==b.name)changes.push([`Talento ${i+1}`,a.name,b.name]);else if((a.desc||'')!==b.desc||Number(a.cost)!==b.cost)changes.push([`Talento ${a.name||i+1}`,`${a.cost??'—'} ES · ${String(a.desc||'').slice(0,50)}`,`${b.cost} ES · ${b.desc.slice(0,50)}`])});
    R.voc[k]=o;
  }
  if(sec==='track'){
    const arch=gv29('e29a'),stages=[0,1,2,3].map(i=>({name:gv29('e29g'+i+'n'),desc:gv29('e29g'+i+'d')}));
    o={name,archetype:arch,desc:gv29('e29d'),stages};
    if(isNew){k=arch+'|'+name;if(R.track[k]||base29().track.some(t=>tkey29(t)===k)){toast('Essa trilha já existe.');return false}o.add=1}else if(R.track[key]?.add)o.add=1;
    changes=diff29(c,o,[['name','Nome'],['archetype','Arquétipo'],['desc','Resumo']]);
    stages.forEach((s,i)=>{const a=c?.stages?.[i]||{};if((a.name||'')!==s.name||(a.desc||'')!==s.desc)changes.push([`Estágio ${a.stage||[3,5,8,10][i]}`,`${a.name||''} ${String(a.desc||'').slice(0,40)}`.trim(),`${s.name} ${s.desc.slice(0,40)}`.trim()])});
    R.track[k]=o;
  }
  if(sec==='ritual'){
    o={name,element:gv29('e29el'),cost:gv29('e29c')||'5 ES',levels:[gv29('e29l0'),gv29('e29l1'),gv29('e29l2')]};
    if(isNew){k='gm-'+name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-')+'-'+rid().slice(0,4);o.add=1}else if(R.ritual[key]?.add)o.add=1;
    changes=diff29({name:c?.name,element:c?.element,cost:c?.cost,l0:c?.levels?.[0]},{name:o.name,element:o.element,cost:o.cost,l0:o.levels[0]},[['name','Nome'],['element','Elemento'],['cost','Custo'],['l0','Efeito base']]);
    {const ps=T3.symPending?.(key),old=isNew?undefined:R.ritual[key]?.sym;
     if(ps===undefined){if(old!==undefined)o.sym=old}
     else{o.sym=ps||null;const lb=v=>v==='none'?'sem símbolo':v?'imagem própria':'oficial';if(lb(ps)!==lb(old))changes.push(['Símbolo',lb(old),lb(ps)])}}
    R.ritual[k]=o;
  }
  if(sec==='item'){
    const kind=isNew?gv29('e29k'):c.kind;
    o={name,peso:gv29('e29p'),note:gv29('e29note')};
    if(kind==='weapon'){const dado=gv29('e29dado');if(!/^\d+d\d+([+-]\d+)?$/i.test(dado)){toast('Dano inválido. Use algo como 1d8 ou 2d6+1.');return false}Object.assign(o,{dado,critMin:Math.min(20,Math.max(2,Number(gv29('e29crit'))||20)),cat:gv29('e29cat'),skill:gv29('e29sk')})}
    if(kind==='prot')Object.assign(o,{def:Math.max(0,Number(gv29('e29def'))||0),slot:gv29('e29slot')});
    if(isNew){k=ikey29(kind,name);if(list29('item').some(r=>r.key===k)){toast('Já existe um item com esse nome.');return false}o.add=1}else if(R.item[key]?.add)o.add=1;
    changes=diff29(c,o,[['name','Nome'],['peso','Peso'],['dado','Dano'],['critMin','Crítico'],['def','Defesa'],['note','Descrição']].filter(([f])=>f!=='dado'&&f!=='critMin'||kind==='weapon').filter(([f])=>f!=='def'||kind==='prot'));
    R.item[k]=o;
  }
  if(sec==='status'){
    o={name,text:gv29('e29d'),narr:gv29('e29nr'),dot:Number(gv29('e29dot'))||0,defense:Number(gv29('e29def'))||0,physDice:Number(gv29('e29ph'))||0,noMove:gv29('e29mv'),disAtk:gv29('e29atk'),loseAct:gv29('e29act')};
    if(isNew){k='gm-'+name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,24)+'-'+rid().slice(0,4);o.add=1}else if(R.status[key]?.add)o.add=1;
    const flat=s=>({name:s?.name,text:s?.text,dot:s?.dot?.fixed??(typeof s?.dot==='number'?s.dot:0),defense:s?.defense||0,physDice:s?.physDice||0,noMove:(s?.flags||[]).includes('semMover')||!!s?.noMove,disAtk:(s?.disadv||[]).includes('ataque')||!!s?.disAtk,loseAct:(s?.flags||[]).includes('perdeAcao')||!!s?.loseAct});
    const yes=x=>x?'sim':'não';
    changes=diff29(flat(c),o,[['name','Nome'],['dot','Dano por turno'],['defense','Defesa'],['physDice','Dados físicos'],['noMove','Não pode se mover',yes],['disAtk','Desvantagem em ataques',yes],['loseAct','Perde a ação',yes],['text','Regra']]);
    R.status[k]=o;
  }
  if(sec==='trauma'){
    o={name,grp:gv29('e29g')||'Mente',text:gv29('e29d')};
    if(isNew){k='gm-'+rid().slice(0,6);o.add=1}else if(R.trauma[key]?.add)o.add=1;
    changes=diff29(c,o,[['name','Nome'],['grp','Grupo'],['text','Efeito']]);R.trauma[k]=o;
  }
  if(sec==='beast'){const dn=gv29('e29dano'),at=gv29('e29atk');
    if(dn&&!/^\d+d\d+([+-]\d+)?$/i.test(dn)){toast('Dano inválido. Use algo como 1d6 ou 2d8+2.');return false}
    if(at&&!/^[+-]?\d+$/.test(at)){toast('Ataque inválido. Use um número, como +3.');return false}}
  if(sec==='beast'||sec==='subel'){
    const arr=R[sec];k=isNew?'gm-'+rid().slice(0,8):key;const off29=sec==='subel'&&c&&c.off;
    o=sec==='beast'?{...(c&&String(k).startsWith('bb-')?cl29(c):{}),id:k,name,tier:gv29('e29tier'),el:gv29('e29bel')||'',ai:gv29('e29ai')||'agressivo',vital:Number(gv29('e29vt'))||1,def:Number(gv29('e29def'))||0,atk:gv29('e29atk'),dano:gv29('e29dano'),skills:gv29('e29sk'),notes:gv29('e29nt')}:off29?{id:k,name:c.name,element:c.element,desc:gv29('e29d').trim()||c.desc,off:1}:{id:k,name,element:gv29('e29el'),desc:gv29('e29d')};
    const i=arr.findIndex(x=>x.id===k);changes=diff29(c,o,sec==='beast'?[['name','Nome'],['vital','Vitalidade'],['def','Defesa'],['atk','Ataque'],['dano','Dano']]:[['name','Nome'],['element','Elemento'],['desc','Descrição']]);
    if(i>=0)arr[i]=o;else arr.push(o);
  }
  if(!isNew&&!changes.length){toast('Nada mudou.');return true}
  const ok=await saveRules29({kind:sec,key:k,label:name,add:isNew?1:0,changes:isNew?[]:changes,...extra});
  if(ok)toast(`${KIND29[sec]} ${isNew?'criado':'atualizado'}: ${name}. A mesa já recebeu.`);
  return ok;
}
async function del29(sec,key){
  const R=rules29(),row=list29(sec).find(r=>r.key===key);if(!row)return;
  if(FIXED29.includes(sec)){toast('Aqui dá para editar e voltar ao padrão, mas não excluir.');return}
  if(sec==='beast'&&String(key).startsWith('bb-')){if(!(R.beast||[]).some(x=>x.id===key)){toast('Criatura do bestiário oficial: dá para editar, mas não excluir.');return}if(!confirm(`Voltar “${row.name}” ao bestiário oficial?`))return;R.beast=R.beast.filter(x=>x.id!==key);await saveRules29({kind:sec,key,label:row.name,changes:[['Criatura','editada','oficial']]});paint29();return}
  if(sec==='subel'&&String(key).startsWith('sub-')){if(!(R.subel||[]).some(x=>x.id===key)){toast('Sub-elemento oficial: dá para editar o conceito, mas não excluir.');return}if(!confirm(`Voltar o conceito de “${row.name}” ao texto oficial?`))return;R.subel=R.subel.filter(x=>x.id!==key);await saveRules29({kind:sec,key,label:row.name,changes:[['Conceito','editado','oficial']]});paint29();return}
  if(!confirm(`Excluir “${row.name}” de ${KIND29[sec]}? ${isNative29(sec,key)?'É conteúdo do manual: dá para restaurar depois.':'Não dá para desfazer.'}`))return;
  if(sec==='beast'||sec==='subel')R[sec]=R[sec].filter(x=>x.id!==key);
  else if(isNative29(sec,key))R[sec][key]={...(R[sec][key]||{}),del:1};
  else{if(R[sec][key])R[sec][key].del=1}
  await saveRules29({kind:sec,key,label:row.name,del:1,changes:[['Situação','ativo','removido']]});paint29();
}
async function restore29(sec,key){
  const R=rules29(),row=list29(sec).find(r=>r.key===key);if(!row)return;
  if(sec==='attr'||sec==='num'){
    const ids=group29(key).map(r=>r.id).filter(i=>R.num[i]!==undefined),changes=ids.map(i=>[E.regraDef(i).l,numFmt29(E.regra(i)),numFmt29(E.regraDef(i).d)]);
    const txt=sec==='attr'&&!!R.attr[key];ids.forEach(i=>delete R.num[i]);if(sec==='attr')delete R.attr[key];
    await saveRules29({kind:sec,key,label:key,ids:txt?[]:ids,changes:changes.length?changes:[['Descrição','editada','original do manual']]});paint29();return}
  const o=R[sec][key];if(!o)return;
  if(isNative29(sec,key)){const before=cur29(sec,key);delete R[sec][key];await saveRules29({kind:sec,key,label:row.name,changes:[['Situação',o.del?'removido':'editado','original do manual']]})}
  else{delete o.del;await saveRules29({kind:sec,key,label:row.name,changes:[['Situação','removido','ativo']]})}
  paint29();
}
function tableForm29(m){
  const t=rules29().table||{};
  m.innerHTML=`<div class="sys29-head"><h3>Regras da Mesa</h3><span class="sub">Valem para todos os combates da campanha.</span></div><form class="sys29-form" id="t29f">
    ${fI29('t29mv','Deslocamento base por turno (m)',t.move||9,'number','min="1" max="60" step="0.5"')}
    ${fI29('t29dt','DT do Arremesso até 6 m',t.dtThrow||12,'number','min="5" max="30"')}
    ${fI29('t29st','DT de Furtividade dos inimigos (0 = 10 + Percepção)',t.dtStealth??0,'number','min="0" max="30"')}
    <p class="sub full">A tabela inteira acompanha esse valor: até 6 m = base · até 12 m = base +3 · até 18 m = base +6 · depois +2 a cada 6 m. Correr continua dobrando o deslocamento.</p>
    <div class="sys29-save"><button type="submit" class="btn primary">Salvar e aplicar na mesa</button></div></form>`;
  $('t29f').onsubmit=async ev=>{ev.preventDefault();const R=rules29(),old={...R.table};
    const nv={move:Math.max(1,Number(gv29('t29mv'))||9),dtThrow:Math.max(5,Number(gv29('t29dt'))||12),dtStealth:Math.max(0,Number(gv29('t29st'))||0)};
    const changes=diff29({move:old.move||9,dtThrow:old.dtThrow||12,dtStealth:old.dtStealth||0},nv,[['move','Deslocamento base (m)'],['dtThrow','DT do Arremesso'],['dtStealth','DT de Furtividade']]);
    if(!changes.length){toast('Nada mudou.');return}
    R.table=nv;if(await saveRules29({kind:'table',key:'table',label:'Regras da Mesa',changes}))toast('Regras da mesa atualizadas.');paint29()};
}
function logView29(m){
  const L=rules29().log||[];
  m.innerHTML=`<div class="sys29-head"><h3>Histórico</h3><span class="sub">As últimas ${L.length} alterações desta campanha.</span></div><ol class="sys29-log">${L.map(e=>`<li><time>${new Date(e.at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</time> <b>${esc(KIND29[e.kind]||e.kind)}: ${esc(e.label||e.key)}</b> ${e.del?'removido':e.add?'criado':''}${e.changes?.length?`<ul class="rn29-ch">${chg29(e)}</ul>`:''}</li>`).join('')||'<li class="empty">Nenhuma alteração ainda.</li>'}</ol>`;
}

/* ---------- botões inline do Mestre nas listas normais da ficha ---------- */
const gmBtns29=(sec,key,name)=>`<span class="gm29" role="group" aria-label="Mestre: ${esc(name)}"><button type="button" class="gm29-b" data-g29e="${sec}" data-k="${esc(key)}" title="Editar (Mestre)" aria-label="Editar ${esc(name)}">✏️</button><button type="button" class="gm29-b" data-g29d="${sec}" data-k="${esc(key)}" title="Excluir (Mestre)" aria-label="Excluir ${esc(name)}">🗑️</button></span>`;
const gmAdd29=(sec,l)=>`<button type="button" class="gm29-b gm29-add" data-g29a="${sec}" title="Adicionar (Mestre)">＋ ${esc(l)}</button>`;
function bindGm29(root){
  $$('[data-g29e]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();open29(b.dataset.g29e,b.dataset.k)});
  $$('[data-g29d]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();del29(b.dataset.g29d,b.dataset.k).then(()=>close29())});
  $$('[data-g29a]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();R29.newPericia=b.dataset.p||'';open29(b.dataset.g29a,null)});
}
const vocKey29=name=>{const R=rules29();const e=Object.entries(R.voc).find(([k,o])=>o&&o.name===name);return e?e[0]:name};
const trkKey29=(arch,name)=>{const R=rules29();const e=Object.entries(R.track).find(([k,o])=>o&&o.name===name&&(o.archetype||k.split('|')[0])===arch);return e?e[0]:arch+'|'+name};
function gmInline29(){
  const gm=isGM6();document.body.classList.toggle('gm29-on',gm);
  if(!gm){$$('.gm29,.gm29-add,.gm29-bar').forEach(e=>e.remove());return}
  /* vocação */
  const vp=$('vocPreview');if(vp&&!vp.querySelector('.gm29-bar')){const nm0=$('vocSelect')?.value;const bar=document.createElement('div');bar.className='gm29-bar';bar.innerHTML=(nm0&&vocations.some(v=>v.name===nm0)?gmBtns29('voc',vocKey29(nm0),nm0):'')+gmAdd29('voc','Nova vocação');vp.prepend(bar);bindGm29(bar)}
  /* trilha */
  const tp=$('trackPreview');if(tp&&!tp.querySelector('.gm29-bar')){const a=$('archSelect')?.value,n=$('trackSelect')?.value;const bar=document.createElement('div');bar.className='gm29-bar';bar.innerHTML=(a&&n&&tracks.some(t=>t.archetype===a&&t.name===n)?gmBtns29('track',trkKey29(a,n),n):'')+gmAdd29('track','Nova trilha');tp.prepend(bar);bindGm29(bar)}
  /* rituais */
  const rc=$('ritualCatalog');if(rc){$$('.ritual-card',rc).forEach(card=>{if(card.querySelector('.gm29'))return;const n=card.querySelector('h4')?.textContent;const r=RITUALS.find(x=>x.name===n);if(!r||String(r.id).startsWith('custom-'))return;const h=card.querySelector('.inline')||card;h.insertAdjacentHTML('beforeend',gmBtns29('ritual',r.id,r.name));bindGm29(card)});
    const head=rc.closest('.panel')?.querySelector('.panel-head');if(head&&!head.querySelector('.gm29-add')){head.insertAdjacentHTML('beforeend',gmAdd29('ritual','Novo ritual'));bindGm29(head)}}
}
/* listas que não passam por render(): itens, estados */
{const _al29=renderAddList;renderAddList=function(){const out=_al29.apply(this,arguments);try{
  if(!isGM6())return out;const k=$('addKind')?.value,box=$('addList');if(!box||!['weapon','prot','gear'].includes(k))return out;
  const arr=k==='weapon'?WEAPONS:k==='prot'?PROTECTIONS:GEAR;
  $$('.skill',box).forEach(row=>{if(row.querySelector('.gm29'))return;const n=row.querySelector('.skill-name')?.textContent;const it=arr.find(x=>x.name===n);if(!it)return;(row.querySelector('.skill-right')||row).insertAdjacentHTML('afterbegin',gmBtns29('item',ikey29(k,it._k29||it.name),it.name))});
  if(!box.querySelector('.gm29-add'))box.insertAdjacentHTML('afterbegin',`<div class="gm29-bar">${gmAdd29('item','Novo item no catálogo')}</div>`);
  bindGm29(box);
}catch(e){console.warn('[T29] itens inline',e)}return out}}
{const _sl29=renderStatesList;renderStatesList=function(){const out=_sl29.apply(this,arguments);try{
  if(!isGM6())return out;const box=$('stList');if(!box)return out;
  $$('[data-st]',box).forEach(b=>{const row=b.closest('.t3-st');if(!row||row.querySelector('.gm29'))return;const s=STATUS_BY_ID[b.dataset.st];if(!s)return;b.insertAdjacentHTML('beforebegin',gmBtns29('status',s.id,s.name))});
  if(!box.querySelector('.gm29-add'))box.insertAdjacentHTML('afterbegin',`<div class="gm29-bar">${gmAdd29('status','Novo estado')}</div>`);
  bindGm29(box);
}catch(e){console.warn('[T29] estados inline',e)}return out}}
/* sub-elementos aparecem para todos junto do repertório de rituais */
function subelPanel29(){
  const rc=$('ritualCatalog');if(!rc)return;const panel=rc.closest('.panel');if(!panel)return;
  const L=(rules29().subel||[]).filter(x=>!String(x.id).startsWith('sub-'));let p=$('subel29');
  if(!L.length){p&&p.remove();return}
  if(!p){p=document.createElement('div');p.id='subel29';p.className='panel subel29';panel.after(p)}
  const sig=JSON.stringify(L);if(p.dataset.sig===sig)return;p.dataset.sig=sig;
  p.innerHTML=`<div class="panel-head"><h2>Sub-elementos da campanha</h2><span class="pill">${L.length}</span></div><ul class="subel29-list">${L.map(s=>`<li><b>${esc(s.name)}</b> <span class="tag">${esc(s.element||'')}</span><p>${esc(s.desc||'')}</p></li>`).join('')}</ul>`;
}
/* o painel antigo do Mestre sai da ficha */
try{$('masterPanel')?.classList.add('hide')}catch(e){}
try{base29()}catch(e){console.warn('[T29] base',e)}
/* Perseus (Onda 4): alterações recentes do Mestre e a revisão das regras, para o conhecimento e o prompt da IA */
T3.rulesLog29=(n=8)=>(rules29().log||[]).slice(0,n).map(e=>({at:e.at,kind:KIND29[e.kind]||e.kind,label:String(e.label||e.key||''),add:!!e.add,del:!!e.del,
  changes:(e.changes||[]).slice(0,4).map(([f,a,b])=>`${f}: ${a??'—'} → ${b??'—'}`)}));
T3.rulesRev29=()=>Number(R29.rules?.rev)||0;
T3.rulesTable29=()=>{const t=rules29().table||{};return{move:T3.moveBase(),dtThrow:Number(t.dtThrow)>0?Number(t.dtThrow):12,dtStealth:Number(t.dtStealth)||0}};
console.info('[Tulpa] Etapa 29 carregada');

