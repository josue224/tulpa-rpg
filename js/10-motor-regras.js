/* ===== MOTOR DE REGRAS TULPA (lógica pura, sem DOM) ===== */
const E={};
const _C=(typeof require!=='undefined'&&typeof CARGA==='undefined')?require('./catalog.js'):null;
const C=_C||{CARGA,SOCIAL,MENTAL_ATTRS,AGILITY_SKILLS,ATTACK_SKILLS,STATUS_BY_ID,TRAUMA_BY_ID,EXTASE_BY_ID,UNARMED,REST_TABLE};
E.DB=10;
E.rng=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch(e){return Math.random()}};
E.die=(s,r=E.rng)=>1+Math.floor(r()*s);
E.parseDice=str=>{const m=String(str||'0').replace(/\s/g,'').match(/^(\d+)d(\d+)([+-]\d+)?$/i);if(m)return{n:+m[1],s:+m[2],mod:+(m[3]||0)};const k=Number(str);return{n:0,s:0,mod:Number.isFinite(k)?k:0}};
E.rollExpr=(str,r=E.rng)=>{const p=E.parseDice(str),rolls=Array.from({length:p.n},()=>E.die(p.s,r));return{rolls,mod:p.mod,total:rolls.reduce((a,b)=>a+b,0)+p.mod,expr:str}};

/* ---------- Inventário e carga ---------- */
E.ensureInv=d=>{const inv=d.inventory=d.inventory||{};if(!Array.isArray(inv.items))inv.items=[];inv.mochila=!!inv.mochila;inv.bandoleira=!!inv.bandoleira;
  inv.items.forEach(i=>{if(i&&i.equipped===false&&i.loc!=='chao')delete i.equipped}); /* arma recolhida do chão volta a valer */
  return inv};
E.pesoVal=p=>C.CARGA[p]??0;
E.itemCarga=it=>{
  if(!it||it.loc==='chao')return 0;
  const q=Math.max(1,Number(it.qty)||1),base=E.pesoVal(it.peso);
  if(it.peso==='Bolso')return 0;
  if(it.kind==='prot'&&it.loc==='vestido'){
    if(it.name==='Roupas comuns')return 0;
    if(it.p&&it.p.slot==='escudo')return base*q;
    return Math.max(1,base-1)*q;
  }
  return base*q;
};
E.cargaInfo=(d,ignore=false)=>{
  const inv=E.ensureInv(d),items=inv.items;
  const pocketQty=items.filter(i=>i.peso==='Bolso'&&i.loc!=='chao').reduce((a,i)=>a+Math.max(1,Number(i.qty)||1),0);
  const carga=items.reduce((a,i)=>a+E.itemCarga(i),0)+Math.floor(pocketQty/5);
  const limit=E.carryLimit(d);
  const over=carga-limit;
  let level=0;if(over>=1)level=1;if(over>=3)level=2;if(over>4)level=3;
  if(ignore)level=0;
  return{carga,limit,over,level,label:['Normal','Pesado','Sobrecarregado','Imobilizado'][level],pocketQty};
};
E.handsUsed=d=>E.ensureInv(d).items.reduce((a,i)=>{
  if(i.loc==='maos')return a+(i.kind==='weapon'&&i.peso==='Pesado'?2:1);
  if(i.kind==='prot'&&i.loc==='vestido'&&i.p?.slot==='escudo')return a+1;
  return a;},0)+E.holding(d).length; /* cada alvo agarrado ocupa 1 mão */
E.validPlacement=(d,it,loc)=>{
  const inv=E.ensureInv(d),others=inv.items.filter(x=>x.id!==it.id);
  const cnt=(l,f=()=>true)=>others.filter(x=>x.loc===l&&f(x)).length;
  if(loc==='chao')return{ok:true};
  if(loc==='vestido')return it.kind==='prot'?{ok:true}:{ok:false,msg:'Só proteções podem ser vestidas.'};
  if(it.kind==='prot'&&loc!=='mochila'&&loc!=='maos'&&loc!=='bolso'&&loc!=='cintura'&&loc!=='bandoleira')return{ok:true};
  if(loc==='mochila')return inv.mochila?{ok:true}:{ok:false,msg:'Você precisa de uma Mochila/Maleta (marque "Possui mochila").'};
  if(loc==='bandoleira'){
    if(!inv.bandoleira)return{ok:false,msg:'Você precisa de uma Bandoleira (marque "Possui bandoleira").'};
    if(!(it.kind==='weapon'&&it.peso==='Pesado'))return{ok:false,msg:'A bandoleira só carrega 1 arma Pesada.'};
    if(cnt('bandoleira')>=1)return{ok:false,msg:'A bandoleira já está ocupada.'};
    return{ok:true};
  }
  if(loc==='cintura'){
    if(it.peso==='Pesado')return{ok:false,msg:'Itens Pesados não cabem na cintura/coldre.'};
    if(cnt('cintura',x=>x.peso!=='Bolso')>=2&&it.peso!=='Bolso')return{ok:false,msg:'Cintura/Coldre: máximo de 2 itens Leves ou Médios.'};
    return{ok:true};
  }
  if(loc==='bolso'){
    if(it.peso==='Bolso')return{ok:true};
    if(it.peso!=='Leve')return{ok:false,msg:'Bolsos aceitam itens minúsculos ou até 2 itens Leves.'};
    if(cnt('bolso',x=>x.peso==='Leve')>=2)return{ok:false,msg:'Bolsos: máximo de 2 itens Leves.'};
    return{ok:true};
  }
  if(loc==='maos'){
    const need=it.kind==='weapon'&&it.peso==='Pesado'?2:1;
    const used=others.reduce((a,i)=>a+(i.loc==='maos'?(i.kind==='weapon'&&i.peso==='Pesado'?2:1):(i.kind==='prot'&&i.loc==='vestido'&&i.p?.slot==='escudo'?1:0)),0);
    return used+E.holding(d).length+need<=2?{ok:true}:{ok:false,msg:'Suas 2 mãos já estão ocupadas (escudo e alvo agarrado ocupam 1 mão; arma Pesada ocupa 2).'};
  }
  return{ok:false,msg:'Local inválido.'};
};
E.autoPlace=(d,it)=>{
  const inv=E.ensureInv(d);
  const order=it.kind==='prot'?['mochila','chao']:it.peso==='Bolso'?['bolso','mochila','maos']:it.peso==='Pesado'?['maos','bandoleira','mochila']:['cintura','maos','bolso','mochila'];
  let placed=false;
  for(const l of order){if(l==='chao'){it.loc='chao';placed=true;break}const v=E.validPlacement(d,it,l);if(v.ok){it.loc=l;placed=true;break}}
  if(!placed)it.loc='chao';
  inv.items.push(it);return placed&&it.loc!=='chao';
};
E.equippedBySlot=d=>{const out={};E.ensureInv(d).items.filter(i=>i.kind==='prot'&&i.loc==='vestido'&&i.p).forEach(i=>{const s=i.p.slot;if(!out[s]||i.p.def>out[s].p.def)out[s]=i});return out};
E.equipDefense=d=>Object.values(E.equippedBySlot(d)).reduce((a,i)=>a+(Number(i.p.def)||0),0);
E.quickWeapons=d=>E.ensureInv(d).items.filter(i=>i.kind==='weapon'&&['maos','cintura','bandoleira'].includes(i.loc));
E.packWeapons=d=>E.ensureInv(d).items.filter(i=>i.kind==='weapon'&&['mochila','bolso'].includes(i.loc));

/* ---------- Modificadores (estados, traumas, êxtase, carga, efeitos) ---------- */
E.newMods=()=>({attrDice:{},skillDice:{},skillFlat:{},physDice:0,socialDice:0,allDice:0,defense:0,disadv:new Set(),disadvSkills:new Set(),flags:new Set(),atk:0,dodge:0,dmg:0,dmgDice:0,resist:0,sources:[]});
E.addSrc=(m,def,label)=>{
  if(!def)return;let used=false;
  const add=(o,k,v)=>{o[k]=(o[k]||0)+v;used=true};
  Object.entries(def.attrDice||{}).forEach(([k,v])=>add(m.attrDice,k,v));
  Object.entries(def.skillDice||{}).forEach(([k,v])=>add(m.skillDice,k,v));
  Object.entries(def.skillFlat||{}).forEach(([k,v])=>add(m.skillFlat,k,v));
  ['physDice','socialDice','allDice','defense','atk','dodge','dmg','dmgDice','resist'].forEach(k=>{if(def[k]){m[k]+=def[k];used=true}});
  (def.disadv||[]).forEach(x=>{m.disadv.add(x);used=true});
  (def.disadvSkills||[]).forEach(x=>{m.disadvSkills.add(x);used=true});
  (def.flags||[]).forEach(x=>{m.flags.add(x);used=true});
  if(used)m.sources.push(label);
};
E.hasEffect=(d,name)=>(d.activeEffects||[]).some(e=>e.name===name);
E.computeMods=d=>{
  const m=E.newMods();
  (d.statuses||[]).forEach(s=>E.addSrc(m,C.STATUS_BY_ID[s.id],C.STATUS_BY_ID[s.id]?.name||s.id));
  (d.traumas||[]).forEach(t=>E.addSrc(m,C.TRAUMA_BY_ID[t.id],'Trauma: '+(C.TRAUMA_BY_ID[t.id]?.name||t.id)));
  if(d.extase?.on&&d.extase.bonus)E.addSrc(m,C.EXTASE_BY_ID[d.extase.bonus],'Êxtase: '+C.EXTASE_BY_ID[d.extase.bonus]?.name);
  const pl=Number(d.penaltyLevel)||0;
  if(pl>0){const o={};C.MENTAL_ATTRS.forEach(a=>o[a]=-pl);E.addSrc(m,{attrDice:o},'Penalidade de Lucidez '+pl)}
  const ignore=E.hasEffect(d,'Força do Cotidiano');
  const load=E.cargaInfo(d,ignore);
  if(load.level===1)E.addSrc(m,{skillDice:Object.fromEntries(C.AGILITY_SKILLS.map(s=>[s,-1])),defense:-2},'Carga: Pesado');
  if(load.level===2)E.addSrc(m,{physDice:-1,skillDice:{'Esquiva':-2,'Reflexo':-2},defense:-5,flags:['semCorrer','semSaltar']},'Carga: Sobrecarregado');
  if(load.level===3)E.addSrc(m,{defense:-5,flags:['semAtacar','semEsquivar','semMover']},'Carga: Imobilizado');
  (d.activeEffects||[]).forEach(e=>{
    E.addSrc(m,{defense:+e.defense||0,atk:+e.atk||0,dodge:+e.dodge||0,dmg:+e.dmg||0,dmgDice:+e.dmgDice||0,resist:+e.resist||0,attrDice:e.attrDice,skillDice:e.skillDice,flags:e.flags},e.name);
  });
  return m;
};
E.attrOf=(skill,SKILL_ATTR)=>SKILL_ATTR[skill];
E.isPhysAttr=a=>['Força','Destreza','Constituição'].includes(a);
E.diceFor=(d,skill,SKILL_ATTR,m=E.computeMods(d))=>{
  const attr=SKILL_ATTR[skill],base=Math.max(1,Number(d.attributes?.[attr])||1);
  let n=base+(m.attrDice[attr]||0)+(m.skillDice[skill]||0)+m.allDice;
  if(E.isPhysAttr(attr))n+=m.physDice;
  if(C.SOCIAL.includes(skill))n+=m.socialDice;
  return Math.max(1,n);
};
E.flatFor=(d,skill,m=E.computeMods(d))=>(m.skillFlat[skill]||0);
E.pendingDieDelta=d=>(d.statuses||[]).reduce((a,s)=>a+(C.STATUS_BY_ID[s.id]?.once?.dieDelta||0),0)+(d.activeEffects||[]).filter(e=>e.type==='once'&&e.dieDelta).reduce((a,e)=>a+(+e.dieDelta||0),0);

/* Proficiência em proteções (pág. 19): Lutador, Militar e Seguranças são proficientes; os demais marcam item a item */
E.autoProficient=d=>d?.archetype==='Lutador'||['Militar','Seguranças'].includes(d?.vocation);
E.protProficient=d=>{if(E.autoProficient(d))return true;const eq=Object.values(E.equippedBySlot(d)).filter(i=>(Number(i.p?.def)||0)>0);return eq.every(i=>i.prof===true)};
/* DF = 10 + proteções vestidas + estados/habilidades + DES (sem proteção Pesada nem excesso de carga).
   Cobertura e posição entram no confronto (E.coverBonus). hasDefense/armored = há proteção ou bônus que
   "bloqueia" (a Destreza sozinha não conta: desviar continua sendo Esquiva). */
E.defenseInfo=d=>{
  const m=E.computeMods(d),equip=E.equipDefense(d),base=E.DB+equip+m.defense,hasDefense=base>E.DB;
  /* cópia pública de uma ficha que este aparelho não pode ler: vale a DF que o dono publicou */
  if(d._publico&&Number(d.df)>0){const df=Number(d.df);return{DB:E.DB,equip,mods:df-E.DB-equip,dex:0,dexAllowed:false,dexWhy:'publico',DF:df,hasDefense:df>E.DB,armored:df>E.DB,parts:{equip,mods:df-E.DB-equip,dex:0}}}
  const dx=E.defenseDex(d),df=base+dx.value;
  return{DB:E.DB,equip,mods:m.defense,dex:dx.value,dexAllowed:dx.allowed,dexWhy:dx.why,DF:df,hasDefense,armored:hasDefense,parts:{equip,mods:m.defense,dex:dx.value}};
};

/* ---------- Rolagem ---------- */
E.rollTest=(d,skill,SKILL_ATTR,opts={})=>{
  const r=opts.rng||E.rng,m=opts.mods||E.computeMods(d);
  let n=E.diceFor(d,skill,SKILL_ATTR,m)+(opts.extraDice||0);
  const delta=opts.consumeDelta?E.pendingDieDelta(d):0;
  n=Math.max(1,n+delta);
  const roll=()=>Array.from({length:n},()=>E.die(20,r));
  let dis=!!opts.disadv,adv=!!opts.adv;
  if(dis&&adv){dis=adv=false}
  let dice=roll(),alt=null,best=Math.max(...dice);
  if(dis||adv){alt=roll();const b2=Math.max(...alt);best=dis?Math.min(best,b2):Math.max(best,b2)}
  const bonus=(opts.bonus||0)+(opts.flat||0);
  return{skill,n,dice,alt,best,bonus,total:best+bonus,mode:dis?'desvantagem':adv?'vantagem':'normal',delta};
};

/* ---------- Dano ---------- */
E.rollDamage=(weapon,{extraDice=0,flat=0,rng=E.rng,critWeaponOnly=false}={})=>{
  const p=E.parseDice(weapon.dado);
  const rollSet=n=>Array.from({length:n},()=>E.die(p.s,rng));
  /* critWeaponOnly (balístico/perfurante): o crítico dobra só os dados impressos na arma */
  const normal=rollSet(p.n+extraDice),crit=rollSet(critWeaponOnly?p.n:p.n+extraDice);
  const base=normal.reduce((a,b)=>a+b,0)+p.mod+flat;
  const critTotal=base+crit.reduce((a,b)=>a+b,0);
  return{normal,crit,flat,mod:p.mod,total:base,critTotal,sides:p.s};
};

/* ---------- Resolução de ataque × defesa (Tabela de Defesa do manual) ---------- */
E.resolveAttack=({ATA,RF,DB=E.DB,DF=E.DB,canDefend=true,crit=false,nat20=false,targetDown=false,proficient=true,armored})=>{
  /* armored: há proteção/bônus que bloqueia (a DF pode passar de 10 só pela Destreza) */
  const rf=canDefend?RF:0,hasDef=armored===undefined?DF>DB:!!armored;
  let outcome,hit=false,extraAtk=0,extraDef=0,forced=false,full=false;
  if(targetDown){hit=true;outcome='normal'}
  else if(rf<DB){hit=true;outcome=ATA>DB?'violento':'normal';if(outcome==='violento')extraAtk=1}
  /* sem proficiência na proteção vestida, só retalia se a Esquiva/Reflexo superar a própria DF; senão conta como Defesa Completa (pág. 19) */
  else if(ATA<DB&&rf>DB&&hasDef&&!proficient&&rf<=DF){outcome='defesa';full=true}
  else if(ATA<DB&&rf>DB){outcome='retaliacao';extraDef=1}
  else{const v=Math.max(rf,DF);if(ATA>=v){hit=true;outcome='normal'}else outcome=(hasDef&&DF>rf)?'defesa':'esquiva'}
  /* 20 natural no ataque sempre acerta, não importa o bônus ou a rolagem do defensor */
  if(nat20&&!hit){hit=true;outcome='normal';forced=true;extraDef=0}
  let label={esquiva:'Esquiva perfeita',defesa:'Bloqueio perfeito',normal:'Acerto normal',violento:'Acerto violento',retaliacao:hasDef?'Bloqueio com folga (retaliação)':'Esquiva com folga (retaliação)'}[outcome];
  if(full)label='Defesa Completa (sem proficiência)';
  if(forced)label='Acerto garantido (20 natural)';else if(targetDown)label='Acerto em alvo caído';
  let text={esquiva:'O defensor desvia e não é atingido.',defesa:'O defensor bloqueia e não é atingido.',normal:'O ataque acerta normalmente (1 ação).',violento:'O atacante fere brutalmente e ganha 1 ação adicional.',retaliacao:'O defensor evita o golpe com folga e recebe 1 ação extra para reagir.'}[outcome];
  if(full)text='O golpe foi bloqueado, mas sem proficiência na proteção a Esquiva/Reflexo precisava superar a DF para retaliar.';
  if(forced)text='Um 20 natural sempre acerta, independentemente do bônus ou da defesa.';else if(targetDown)text='O alvo está caído: o golpe acerta sem bônus de ação extra.';
  return{outcome,hit,label,text,extraAtk,extraDef,crit:hit&&!!crit,ATA,RF:rf,DB,DF,forced,full};
};

/* ---------- Morrendo / Morto ---------- */
E.isDying=d=>(d.statuses||[]).some(s=>s.id==='agonia');
E.isDead=d=>(d.statuses||[]).some(s=>s.id==='morto');
E.startDying=d=>{d.statuses=d.statuses||[];if(E.isDead(d)||E.isDying(d))return false;d.statuses.push({id:'agonia',at:Date.now(),turns:3});return true};
E.kill=d=>{d.statuses=(d.statuses||[]).filter(s=>s.id!=='agonia');if(!E.isDead(d))d.statuses.push({id:'morto',at:Date.now()});d.vital=0};
E.dyingTick=d=>{const s=(d.statuses||[]).find(x=>x.id==='agonia');if(!s)return null;s.turns=(s.turns??3)-1;if(s.turns<=0){E.kill(d);return{dead:true,left:0}}return{dead:false,left:s.turns}};
E.dyingHit=(d,finalDamage,maxVt)=>{
  const s=(d.statuses||[]).find(x=>x.id==='agonia');if(!s||finalDamage<=0)return null;
  if(finalDamage>=Math.ceil(maxVt/2)){E.kill(d);return{dead:true,left:0,reason:'half'}}
  s.turns=(s.turns??3)-1;
  if(s.turns<=0){E.kill(d);return{dead:true,left:0,reason:'turns'}}
  return{dead:false,left:s.turns,reason:'turn'};
};
E.finishesDying=(d,finalDamage,maxVt)=>E.isDying(d)&&finalDamage>=Math.ceil(maxVt/2);

/* ---------- Dano sofrido ---------- */
E.applyDamageToSheet=(d,amount,{ignoreResist=false,ignoreTemp=false,type='fisico'}={})=>{
  const m=E.computeMods(d);let raw=Math.max(0,Math.floor(amount)),notes=[];
  let resisted=0;
  if(type==='fisico'&&d.extase?.on&&d.extase.bonus==='escudo'&&!d.extase.escudoUsado&&raw>0){d.extase.escudoUsado=true;notes.push('Escudo de Êxtase: dano físico anulado.');return{final:0,absorbed:raw,resisted:raw,notes,vitalBefore:d.vital,vitalAfter:d.vital,down:false}}
  if(!ignoreResist&&m.resist){resisted=Math.min(raw,m.resist);raw-=resisted;if(resisted)notes.push(`Resistência −${resisted}.`)}
  let absorbed=0;
  if(!ignoreTemp&&Number(d.vitalTemp)>0){absorbed=Math.min(d.vitalTemp,raw);d.vitalTemp-=absorbed;raw-=absorbed;if(absorbed)notes.push(`VT Temporário absorveu ${absorbed}.`)}
  const before=Number(d.vital)||0;
  d.vital=Math.max(0,before-raw);
  return{final:raw,absorbed,resisted,notes,vitalBefore:before,vitalAfter:d.vital,down:d.vital<=0&&before>0};
};

/* ---------- Lucidez: Protocolo de Colapso ---------- */
E.collapseNext=d=>(Number(d.collapseCount)||0)+1;
E.collapseStep=(d,roll,maxLuc)=>{
  const n=E.collapseNext(d),pl=Number(d.penaltyLevel)||0,ex=!!d.extase?.on;
  const out={n,roll,success:roll>=4,extase:ex,penalty:pl,trauma:false,luc:0,notes:[]};
  if(n===1){if(out.success){out.extase=true;out.notes.push('Êxtase!')}else{out.penalty=1;out.notes.push('Penalidade Nível 1.')}out.luc=Math.floor(maxLuc/2)}
  else if(n===2){if(out.success){out.notes.push(ex?'Mantém Êxtase.':'Resiste: a Penalidade não aumenta.')}else{out.penalty=pl+1;out.extase=false;out.notes.push('Penalidade +1 (Nível '+out.penalty+').')}out.luc=Math.floor(maxLuc/3)}
  else{
    out.luc=0;
    if(pl>=2&&!ex){out.trauma=true;out.notes.push('Penalidade Nível 2+: Trauma Permanente.');out.rolled=false}
    else if(out.success){out.notes.push(ex?'Mantém Êxtase (Lucidez 0).':'Resiste (Lucidez 0).')}
    else{out.trauma=true;out.extase=false;out.penalty=pl+(ex?1:0);out.notes.push('Trauma Permanente.')}
  }
  return out;
};
E.extaseDamageTest=roll=>({success:roll>=4,roll});

/* ---------- Descanso (Cena de Trégua) ---------- */
E.restPatamar=(d,{base=1,vigilia=false,sedacao=false,ancorado=false,autocirurgia=false,operador=false,fortificado=false}={})=>{
  const notes=[];let b=fortificado&&base<2?2:base;if(fortificado&&base<2)notes.push('Perímetro fortificado: ambiente vira Patamar 2.');
  let p=b;
  const vt=Number(d.vital)||0,bad=(d.statuses||[]).some(s=>['sangrando','infeccao','feridaexposta'].includes(s.id));
  if((vt<=10||bad)&&!d.agoniaAnulada){p-=1;notes.push('Agonia Física: −1 Patamar.')}else if(d.agoniaAnulada)notes.push('Síntese Cirúrgica perfeita: Agonia Física anulada.')
  const luc=Number(d.lucidity)||0;let mind=0,intTest=false;
  if(luc<=8){mind=-2;intTest=true}else if(luc<=15||(Number(d.collapseCount)||0)>0)mind=-1;
  if(sedacao){mind=0;intTest=false;notes.push('Sedação Química: ignora penalidades de Lucidez (aplica Torpor na cena seguinte).')}
  if(ancorado&&mind<0){mind+=1;notes.push('Ancorar Aliado: anula 1 ponto de penalidade.')}
  if(mind){notes.push(`${luc<=8?'Mente Estilhaçada':'Mente Turva'}: ${mind} Patamar.`)}
  p+=mind;
  let esP=p,lucP=p;
  if(vigilia){esP-=1;notes.push('Vigília: recuperação de Essência −1 Patamar (sem Lucidez).')}
  if(operador||autocirurgia){esP-=1;lucP-=1;notes.push('Operador de cirurgia: −1 Patamar em ES e Lucidez.')}
  const cl=x=>Math.max(0,Math.min(3,x));
  return{base:b,final:cl(p),es:cl(esP),luc:cl(lucP),intTest,noLuc:vigilia,notes};
};
/* o "+I" da tabela de Trégua é a Percepção do personagem (benefício direto do atributo) */
E.restRoll=(d,patamarEs,patamarLuc,{intuicao=E.restLucBonus(d)||1,stage=1,intFailed=false,noLuc=false,rng=E.rng}={})=>{
  const T=C.REST_TABLE;let es=0,luc=0,det=[];
  const f=(expr)=>{const s=expr.replace('E',stage).replace('I',intuicao);const r=E.rollExpr(s.replace(/\+(\d+)\+(\d+)/,(m,a,b)=>'+'+(+a+ +b)),rng);return r};
  const dr=(expr)=>{const mm=expr.match(/^(\d+d\d+)(?:\+(E|I))?$/);if(!mm)return{total:+expr,rolls:[],mod:0};const r=E.rollExpr(mm[1],rng);const add=mm[2]==='E'?stage:mm[2]==='I'?intuicao:0;return{rolls:r.rolls,mod:add,total:r.total+add}};
  const esR=dr(T[patamarEs].es),lucR=dr(T[patamarLuc].luc);
  es=esR.total;luc=lucR.total;
  if(intFailed){es=1;luc=0;det.push('Falhou em Intuição (DT 15): 0 de Lucidez e 1 de ES; desperta alertando ameaças.')}
  if(noLuc){luc=0}
  return{es,luc,esR,lucR,det,esLabel:T[patamarEs].label,lucLabel:T[patamarLuc].label};
};

/* ---------- Combustão Vital ---------- */
E.combustao=(missing,vigor)=>({vtCost:missing*2,maxEsTurno:vigor+2,okTurno:missing<=vigor+2});

/* ---------- Texto de habilidades → efeitos extras ---------- */
E.parseExtras=desc=>{
  const t=String(desc||''),out={};
  const re=/\+(\d+)\b([^.;]{0,70})/g;let m;
  while((m=re.exec(t))){const n=+m[1],tail=m[2].toLowerCase();
    if(/\bdado\b/.test(tail)&&/dano/.test(tail)){out.dmgDice=(out.dmgDice||0)+n;continue}
    if(/^\s*d\d/.test(tail))continue;
    if(/(?:na|de|em)\s+(?:defesa|db)\b|defesa/.test(tail)&&!/ataque corpo/.test(tail))out.defense=Math.max(out.defense||0,n);
    if(/ataque/.test(tail)&&!/dano/.test(tail))out.atk=Math.max(out.atk||0,n);
    if(/esquiva/.test(tail))out.dodge=Math.max(out.dodge||0,n);
    if(/dano/.test(tail)&&!/ignora/.test(tail))out.dmg=Math.max(out.dmg||0,n);
  }
  const mm=t.match(/\+(\d)d(\d+)[^.;]{0,25}dano/i);if(mm)out.dmgExtra=`${mm[1]}d${mm[2]}`;
  const r=t.match(/resist[êe]ncia\s+(\d+)\s+a\s+qualquer\s+dano/i);if(r)out.resist=+r[1];
  const rd=t.match(/ignora (?:até )?(\d+) de redu/i);if(rd)out.ignoreResist=+rd[1];
  if(/\bvantagem\b/i.test(t)&&!out.dmg&&!out.atk)out.adv=true;
  return out;
};
E.classifyTargeting=desc=>{
  const t=String(desc||'').toLowerCase();
  if(/raio|cone|área|todos os inimigos|todos os aliados|até três aliados|colegas|todo inimigo|todo aliado/.test(t))return'area';
  if(/aliado|a quem|companheiro|paciente/.test(t))return'ally';
  if(/inimigo|alvo|obrigando|criatura|oponente/.test(t))return'enemy';
  return'self';
};
E.targetingInfo=desc=>{
  const t=String(desc||'').toLowerCase();
  return{
    ally:/aliados?\b|a quem\b|colegas|companheiro|paciente|quem (?:a )?(?:veste|come)|para você ou um/.test(t),
    area:/raio de|cone de|todos os inimigos|todos os aliados|todo inimigo|todo aliado|em área|diversos alvos|duas ou mais criaturas|quem olha|todos os colegas/.test(t),
    enemy:/inimigo|alvo|obrigando|oponente|criatura/.test(t),
    harmful:/exige um teste|obrigando|forçando|fazendo um teste|resistência ou|reflexo ou|caso falhe|para recuar/.test(t)};
};
E.suggestStatus=desc=>{
  const t=String(desc||'').toLowerCase();
  const map=[[/atordo/,'atordoado'],[/sangramento/,'sangrando'],[/enjoad/,'enjoado'],[/imobiliz/,'agarrado'],[/confus/,'confuso'],[/apavor/,'apavorado'],[/hesit|recuar/,'amedrontado'],[/emotiv/,'emotivo'],[/paralis/,'paralisado'],[/cegueira|cegá|cego/,'cego'],[/hipnot/,'hipnotizado'],[/veneno|toxina/,'envenenado']];
  for(const [re,id] of map)if(re.test(t))return id;return'';
};
/* ===================================================================
   ONDA 8 — Atributos, cobertura, perícias e vertentes (base das Ondas 9–13)
   Tudo aqui é puro: recebe a ficha (d) e devolve números. As funções
   que alteram a ficha dizem isso no comentário.
   =================================================================== */

/* ---------- Cobertura ---------- */
E.COVER={parcial:4,pesada:6};
E.coverBonus=kind=>E.COVER[kind]||0; /* cobertura total não tem número: bloqueia a linha de visão */

/* ---------- Os 8 benefícios diretos de atributo ---------- */
/* ficha sem atributos (cópia pública) devolve 0: nenhum benefício é inventado */
E.attr=(d,name)=>d?.attributes?Math.max(1,Number(d.attributes[name])||1):0;
/* criaturas do bestiário já trazem Vital, Defesa e Dano fechados: não somam benefícios de atributo */
E.isCreature=d=>!!d?.beastId;
const _A=(d,n)=>E.isCreature(d)?0:E.attr(d,n);

/* FOR: limite de carga = 3 + FOR (+2 com mochila) */
E.carryLimit=d=>3+Math.max(1,E.attr(d,'Força'))+(d?.inventory?.mochila?2:0);
/* FOR/DES no dano: devolve {bonus, attr}. opts.attr='Força'|'Destreza' é o atributo escolhido para o ataque. */
E.damageBonus=(d,w,opts={})=>{
  const none={bonus:0,attr:''};
  if(!w||!d?.attributes||E.isCreature(d)||w.area||w.note==='invocação'||w.note==='ataque da criatura'||w.skill==='Armas de Disparo')return none;
  const brawl=w.skill==='Briga',thrown=w.skill==='Arremesso';
  const melee=!thrown&&(brawl||w.cat==='Corpo a corpo'||(w.skill==='Armas Brancas'&&w.cat!=='Distância'));
  if(!melee&&!thrown)return none;
  const light=w.peso==='Leve'||w.peso==='Bolso';
  const dexStyle=()=>E.trainedVerts(d,'briga').some(x=>(x.def.attrs||[]).includes('Destreza'));
  const dexThrow=()=>E.vertEffects(d,'danoAtributo',{quando:'arremesso'}).some(x=>x.effect.atributo==='Destreza');
  /* armas brancas Leves podem usar DES; Briga usa DES se a arma for Leve, se o ataque for de DES ou com um estilo de DES treinado */
  const dexOk=!melee?dexThrow():brawl?(w.peso==='Leve'||opts.attr==='Destreza'||dexStyle()):light;
  const f=E.attr(d,'Força'),x=E.attr(d,'Destreza');
  if(opts.attr==='Força')return{bonus:f,attr:'Força'};
  return dexOk&&(x>f||opts.attr==='Destreza')?{bonus:x,attr:'Destreza'}:{bonus:f,attr:'Força'};
};
/* DES: soma na DF, menos com proteção Pesada vestida ou com excesso de carga */
E.heavyProtection=d=>(d?.inventory?.items||[]).filter(i=>i&&i.kind==='prot'&&i.loc==='vestido'&&i.peso==='Pesado'&&Number(i.p?.def)>0);
E.defenseDex=d=>{
  if(!d?.attributes)return{value:0,allowed:false,why:'sem-atributos'};
  if(E.isCreature(d))return{value:0,allowed:false,why:'criatura'};
  if(E.heavyProtection(d).length)return{value:0,allowed:false,why:'protecao-pesada'};
  if(E.cargaInfo(d,E.hasEffect(d,'Força do Cotidiano')).level>0)return{value:0,allowed:false,why:'sobrecarga'};
  return{value:E.attr(d,'Destreza'),allowed:true,why:''};
};
/* CON / PRE: máximos = tabela do estágio + atributo. table opcional (padrão: STAGES) */
E.maxStats=(d,table)=>{
  const T=table||(typeof STAGES!=='undefined'?STAGES:C.STAGES),row=T[d?.stage]||T[1];
  if(E.isCreature(d))return{...row};
  if(!d?.attributes||d._publico)return{...row,vt:Number(d?.vtMax)||row.vt,es:Number(d?.esMax)||row.es};
  return{...row,vt:row.vt+E.attr(d,'Constituição'),es:row.es+E.attr(d,'Presença')};
};
/* (altera d) depois de mudar atributo ou estágio: quem estava cheio continua cheio; o resto só é limitado */
E.syncMax=(d,before)=>{
  const now=E.maxStats(d);
  [['vital','vt'],['essence','es'],['lucidity','luc']].forEach(([k,m])=>{const v=Number(d[k])||0;if(before&&v>=before[m])d[k]=now[m];else if(v>now[m])d[k]=now[m]});
  return now;
};
/* CON: redução no Bloqueio (+ efeito de vertente, ex. Boxe +2; + Guarda Fechada +2) */
E.GUARDA_BONUS=2;
E.blockReduction=(d,{vert,guarda=false}={})=>{
  const con=_A(d,'Constituição');
  const list=E.vertEffects(d,'rdBloqueio',{vert});
  const rd=list.length?Math.max(...list.map(x=>Number(x.effect.valor)||0)):0;
  const g=guarda?E.GUARDA_BONUS:0;
  return{total:con+rd+g,con,vert:rd,guarda:g};
};
/* dano que passa por um bloqueio (com Brecha ou Parcial): metade - redução, mínimo 1 */
E.blockedDamage=(damage,reduction)=>damage>0?Math.max(1,Math.floor(damage/2)-(Number(reduction)||0)):0;
/* CON: limite da Combustão Vital (ES por turno) */
E.combustionLimit=d=>(E.attr(d,'Constituição')||1)+2;
/* INT: perícias treinadas extras e cura de Sutura/Síntese */
E.intExtraSkills=d=>Math.max(0,E.attr(d,'Inteligência')-1);
E.limitsFor=d=>{const base=E.tierLimits?E.tierLimits(d?.stage):{five:0,ten:0,fifteen:0,free10:0},intExtra=E.intExtraSkills(d);return{...base,five:base.five+intExtra,intExtra}};
E.medicineBonus=d=>E.attr(d,'Inteligência');
/* PER: DT contra aproximação furtiva e Lucidez na Trégua */
E.stealthDT=d=>10+E.attr(d,'Percepção');
E.restLucBonus=d=>E.attr(d,'Percepção');
/* PRE: blindagem do 1º dano de Lucidez da cena (reduz PRE, mínimo 1). d.lucShieldUsed guarda o uso. */
E.shieldReady=d=>!d?.lucShieldUsed&&_A(d,'Presença')>0;
E.lucidityShield=(d,amount,{consume=true}={})=>{ /* (altera d quando consume) */
  const raw=Math.max(0,Math.floor(Number(amount)||0));
  if(!raw||!E.shieldReady(d))return{raw,final:raw,reduced:0,applied:false};
  const final=Math.max(1,raw-_A(d,'Presença'));
  if(consume)d.lucShieldUsed=true;
  return{raw,final,reduced:raw-final,applied:true};
};
E.applyLucidityDamage=(d,amount,{ignoreShield=false}={})=>{ /* (altera d) */
  const raw=Math.max(0,Math.floor(Number(amount)||0));
  const r=ignoreShield?{raw,final:raw,reduced:0,applied:false}:E.lucidityShield(d,raw);
  const before=Number(d.lucidity)||0;d.lucidity=Math.max(0,before-r.final);
  return{...r,before,after:d.lucidity};
};
E.resetSceneFlags=d=>{if(d&&d.lucShieldUsed)d.lucShieldUsed=false;return d}; /* (altera d) fim da cena */
/* CAR / APA: bônus social. primeira = 1ª rolagem contra quem acabou de ver o personagem (vale APA no lugar de CAR);
   dialogo = acalmar, negociar ou liderar em conversa contínua (Persuasão ou Liderança); ancorar = ancorar aliado na Trégua */
E.socialBonus=(d,skill,{primeira=false,dialogo=false,ancorar=false}={})=>{
  if(primeira&&(C.SOCIAL||[]).includes(skill))return{bonus:_A(d,'Aparência'),attr:'Aparência',motivo:'Primeira impressão'};
  if(ancorar||(dialogo&&['Persuasão','Liderança'].includes(skill)))return{bonus:_A(d,'Carisma'),attr:'Carisma',motivo:ancorar?'Ancorar aliado':'Diálogo contínuo'};
  return{bonus:0,attr:'',motivo:''};
};

/* ---------- Perícias e vertentes ----------
   Ficha: d.vertentes={[id]:{g:5|10|15, de?:perícia antiga, livre?:1}} e d.vertLegado={[perícia antiga]:id}.
   O treino antigo (extraSkills / skillUpgrades / free10) nunca é apagado: enquanto não houver
   d.vertLegado[perícia] ele vale inteiro, como "vertente a escolher". */
E.GRAUS=[5,10,15];
E.periciaDefs=()=>typeof PERICIA_DEFS!=='undefined'?PERICIA_DEFS:(C.PERICIA_DEFS||[]);
E.vertDefs=()=>typeof VERT_DEFS!=='undefined'?VERT_DEFS:(C.VERT_DEFS||[]);
E.vert=id=>E.vertDefs().find(v=>v.id===id)||null;
/* aceita id da perícia ('briga'), nome ('Persuasão / Etiqueta') ou perícia da ficha ('Etiqueta') */
E.pericia=key=>E.periciaDefs().find(p=>p.id===key||p.name===key||(p.skills||[]).includes(key))||null;
E.vertsOf=key=>{const p=E.pericia(key);return p?E.vertDefs().filter(v=>v.pericia===p.id):[]};
E.generalist=bonus=>Math.floor((Number(bonus)||0)/2);
E.vertGrade=(d,id)=>{const g=Number(d?.vertentes?.[id]?.g)||0;return g>=15?15:g>=10?10:g>=5?5:0};
E.trainedVerts=(d,key)=>{
  const p=key?E.pericia(key):null;if(key&&!p)return[];
  return Object.keys(d?.vertentes||{}).map(id=>({id,def:E.vert(id),grau:E.vertGrade(d,id),r:d.vertentes[id]})).filter(x=>x.def&&x.grau>0&&(!p||x.def.pericia===p.id));
};
E.legacyRaw=(d,skill)=>{
  const up=Number(d?.skillUpgrades?.[skill])||0;if(up>=15)return 15;if(up>=10||d?.free10===skill)return 10;
  return Math.min(15,(d?.extraSkills||[]).filter(x=>x===skill).length*5);
};
/* o treino antigo só deixa de valer quando a vertente que o recebeu existe de verdade */
E.legacyConsumed=(d,skill)=>{const id=d?.vertLegado?.[skill];return!!(id&&E.vertGrade(d,id)&&E.vert(id))};
E.legacyTier=(d,skill)=>E.legacyConsumed(d,skill)?0:E.legacyRaw(d,skill);
/* grau "cheio" de uma perícia numa rolagem sem escolher área: o maior entre o treino antigo e as vertentes */
E.skillTier=(d,skill)=>Math.max(E.legacyTier(d,skill),0,...E.trainedVerts(d,skill).map(x=>x.grau));
E.pendingVerts=d=>E.periciaDefs().flatMap(p=>(p.skills||[]).map(skill=>({pericia:p.id,skill,grau:E.legacyTier(d,skill)})).filter(x=>x.grau>0));
E.tierUsage=d=>{
  const ups=d?.skillUpgrades||{},old=s=>!E.legacyConsumed(d,s),sk=Object.keys(ups).filter(k=>ups[k]>=10&&old(k)),vs=E.trainedVerts(d),paid=vs.filter(x=>!x.r.livre);
  return{five:(d?.extraSkills||[]).filter(old).length+paid.length,
    ten:sk.filter(k=>d.free10!==k).length+paid.filter(x=>x.grau>=10).length,
    fifteen:sk.filter(k=>ups[k]>=15).length+vs.filter(x=>x.grau>=15).length,
    free10:d?.free10?1:0};
};
E.vocPlus=(d,skills,vocList)=>{
  const L=vocList||(typeof vocations!=='undefined'?vocations:[]),v=L.find(x=>x.name===d?.vocation);
  if(!v||!(v.skills||[]).map(s=>s==='Percepção'?'Observação':s).some(s=>skills.includes(s)))return 0;
  const y=Number(d.serviceYears)||0;return y>=40?15:y>=10?10:5;
};
/* Cálculo de um teste numa vertente.
   status: treinado (grau cheio + efeito tático) · pendente (treino antigo cheio, sem efeito) ·
           generalista (metade do melhor grau da perícia, sem efeito) · destreinado · bloqueado (requiresTraining).
   bonus = grau + voc (+V da Vocação, que nunca é dividido). attr = melhor atributo da vertente (ou opts.attr). */
E.vertCalc=(d,id,{vocList,attr}={})=>{
  const def=E.vert(id);if(!def)return null;
  const p=E.pericia(def.pericia),skills=p?p.skills:[def.skill],own=E.vertGrade(d,id);
  const other=Math.max(0,...E.trainedVerts(d,def.pericia).filter(x=>x.id!==id).map(x=>x.grau));
  const pend=Math.max(0,...skills.map(s=>E.legacyTier(d,s)));
  let status='destreinado',grau=0;
  if(own){status='treinado';grau=own}
  else if(def.requiresTraining)status='bloqueado';
  else{const half=E.generalist(other);if(pend&&pend>=half){status='pendente';grau=pend}else if(other){status='generalista';grau=half}}
  const permitido=status!=='bloqueado',voc=E.vocPlus(d,skills,vocList);
  const list=def.attrs&&def.attrs.length?def.attrs:['Força'];
  const at=attr||list.reduce((best,a)=>E.attr(d,a)>E.attr(d,best)?a:best,list[0]);
  return{id,def,pericia:def.pericia,skill:def.skill,status,permitido,grau,voc,bonus:permitido?grau+voc:0,attr:at,dice:Math.max(1,E.attr(d,at)),
    efeitoAtivo:status==='treinado',efeitos:status==='treinado'?(def.effects||[]):[]};
};
/* "Outra área" da perícia sem escolher vertente: metade do melhor grau (+V inteiro), sem efeito tático.
   Só para quem tem ao menos 1 vertente treinada nela (senão null). Treino antigo pendente vale se for maior.
   attr=null: quem chama usa o atributo padrão da perícia. */
E.generalistCalc=(d,key,{skill,vocList,attr}={})=>{
  const p=E.pericia(key);if(!p)return null;
  const melhor=Math.max(0,...E.trainedVerts(d,p.id).map(x=>x.grau));if(!melhor)return null;
  const half=E.generalist(melhor),pend=Math.max(0,...p.skills.map(s=>E.legacyTier(d,s)));
  const usaPend=pend>0&&pend>=half,grau=usaPend?pend:half,voc=E.vocPlus(d,p.skills,vocList);
  return{id:null,def:null,pericia:p.id,skill:skill||(p.skills.includes(key)?key:p.skills[0]),status:usaPend?'pendente':'generalista',permitido:true,grau,voc,bonus:grau+voc,attr:attr||null,melhor,efeitoAtivo:false,efeitos:[]};
};
/* efeitos táticos ativos (só vertentes treinadas). Filtros opcionais: quando, alvo, vert (só aquela) */
E.vertEffects=(d,tipo,{quando,alvo,vert}={})=>E.trainedVerts(d).filter(x=>!vert||x.id===vert)
  .flatMap(x=>(x.def.effects||[]).filter(e=>(!tipo||e.tipo===tipo)&&(!quando||e.quando===quando)&&(!alvo||e.alvo===alvo)).map(effect=>({id:x.id,def:x.def,grau:x.grau,effect})));
E.vertSum=(d,tipo,f)=>E.vertEffects(d,tipo,f).reduce((a,x)=>a+(Number(x.effect.valor)||0),0);

/* ---------- Treinar, escolher e remover (alteram d; devolvem {ok,msg}) ---------- */
/* Perícia antiga esperando vertente na mesma perícia (prefere a perícia da própria vertente) */
E.pendingFor=(d,id)=>{
  const def=E.vert(id),p=def&&E.pericia(def.pericia);if(!p)return null;
  const skill=[def.skill,...p.skills].find(s=>E.legacyTier(d,s)>0);
  return skill?{skill,grau:E.legacyTier(d,skill)}:null;
};
E.chooseVert=(d,id,skill)=>{ /* a vertente recebe o grau do treino antigo, sem custo */
  const def=E.vert(id),p=def&&E.pericia(def.pericia);if(!p)return{ok:false,msg:'Vertente desconhecida.'};
  const sk=skill||E.pendingFor(d,id)?.skill,g=sk&&p.skills.includes(sk)?E.legacyTier(d,sk):0;
  if(!g)return{ok:false,msg:'Não há treino antigo esperando uma vertente nesta perícia.'};
  if(E.vertGrade(d,id))return{ok:false,msg:'Essa vertente já está treinada: escolha outra.'};
  const free=d.free10===sk&&!(d.extraSkills||[]).includes(sk);
  d.vertentes=d.vertentes||{};d.vertLegado=d.vertLegado||{};
  d.vertentes[id]={g,de:sk,...(free?{livre:1}:{})};d.vertLegado[sk]=id;
  return{ok:true,grau:g,msg:`${def.name}: +${g}.`};
};
E.checkVertGrade=(d,id,grau)=>{
  const def=E.vert(id);if(!def)return{ok:false,msg:'Vertente desconhecida.'};
  if(!E.GRAUS.includes(grau))return{ok:false,msg:'Grau inválido (use +5, +10 ou +15).'};
  const cur=E.vertGrade(d,id);if(cur===grau)return{ok:false,msg:'A vertente já está nesse grau.'};
  if(d.freeMode||grau<cur)return{ok:true};
  const L=E.limitsFor(d),U=E.tierUsage(d),free=!!d.vertentes?.[id]?.livre;
  if(!cur&&U.five>=L.five)return{ok:false,msg:`Sem escolhas de treinamento: ${U.five} de ${L.five}.`};
  if(grau>=10&&cur<10&&!free&&U.ten>=L.ten)return{ok:false,msg:L.ten?`Limite de Mestre (+10) no Estágio ${d.stage}: ${L.ten}.`:'Mestre (+10) libera no Estágio 5.'};
  if(grau>=15&&cur<15&&U.fifteen>=L.fifteen)return{ok:false,msg:L.fifteen?'Você já tem a sua Maestria (+15).':'Maestria (+15) libera no Estágio 9.'};
  return{ok:true};
};
E.removeVert=(d,id)=>{ /* o treino antigo ligado a ela volta a ficar "a escolher" */
  if(!d?.vertentes?.[id])return{ok:false,msg:'Vertente não treinada.'};
  delete d.vertentes[id];
  Object.keys(d.vertLegado||{}).forEach(s=>{if(d.vertLegado[s]===id)delete d.vertLegado[s]});
  return{ok:true};
};
E.setVertGrade=(d,id,grau)=>{
  if(!grau)return E.removeVert(d,id);
  const c=E.checkVertGrade(d,id,grau);if(!c.ok)return c;
  d.vertentes=d.vertentes||{};d.vertentes[id]={...(d.vertentes[id]||{}),g:grau};
  return{ok:true,grau};
};
/* treinar: usa o treino antigo pendente (grátis) se houver; senão gasta 1 escolha de +5 */
E.trainVert=(d,id)=>E.vertGrade(d,id)?{ok:false,msg:'Essa vertente já está treinada.'}:E.pendingFor(d,id)?E.chooseVert(d,id):E.setVertGrade(d,id,5);

/* ---------- Migração de fichas (altera d; pode rodar quantas vezes quiser) ---------- */
E.SHEET_VER=8;
E.migrateSheet=d=>{
  if(!d||typeof d!=='object'||!d.attributes||d._publico)return false;
  let ch=false;const obj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  if(!obj(d.vertentes)){d.vertentes={};ch=true}
  if(!obj(d.vertLegado)){d.vertLegado={};ch=true}
  if(!(Number(d.regrasV)>=E.SHEET_VER)){
    /* os máximos subiram (+CON no Vital, +PRE na Essência): quem estava cheio continua cheio */
    if(!E.isCreature(d)){
      const T=typeof STAGES!=='undefined'?STAGES:C.STAGES,old=T[d.stage]||T[1],now=E.maxStats(d);
      if(Number(d.vital)>=old.vt)d.vital=Math.max(Number(d.vital),now.vt);
      if(Number(d.essence)>=old.es)d.essence=Math.max(Number(d.essence),now.es);
    }
    d.regrasV=E.SHEET_VER;ch=true;
  }
  return ch;
};
/* ===================================================================
   ONDA 10 — Corpo a corpo: Reação, Guarda Fechada, Bloqueio,
   Contra-Ataque, manobras, agarrão, desarme, empurrão e arremesso.
   Puro: a UI (js/13, js/27, js/60h) só escolhe alvos e chama daqui.
   Dados injetáveis: quem rola passa os totais já rolados.
   =================================================================== */

/* ---------- estados (a ficha pública traz só os ids) ---------- */
E.statusId=s=>typeof s==='string'?s:s?.id;
E.hasStatus=(d,id)=>(d?.statuses||[]).some(s=>E.statusId(s)===id);
E.isMeleeWeapon=w=>!!w&&!w.area&&w.skill!=='Arremesso'&&w.skill!=='Armas de Disparo'&&(w.cat==='Corpo a corpo'||w.skill==='Briga'||(w.skill==='Armas Brancas'&&w.cat!=='Distância'));
E.isShortBlade=w=>E.isMeleeWeapon(w)&&w.skill==='Armas Brancas'&&(w.peso==='Leve'||w.peso==='Bolso');
E.isImprovised=w=>!!w&&w.note!=='desarmado'&&/improvis|p[ée][- ]de[- ]cabra|taco com pregos|corrente|foice|garrafa|cadeira/i.test((w.name||'')+' '+(w.note||''));
E.isTwoHanded=w=>w?.peso==='Pesado';
E.isCreatureAttack=w=>w?.note==='ataque da criatura'||w?.note==='invocação';

/* ---------- Agarrão: alvo = {id:'agarrado',by} · quem segura = {id:'segurando',alvos:[{id,at}]} ---------- */
E.holding=d=>((d?.statuses||[]).find(s=>s&&s.id==='segurando')?.alvos||[]).map(a=>a.id);
E.grappledBy=d=>(d?.statuses||[]).find(s=>E.statusId(s)==='agarrado')?.by||'';
E.addStatus=(d,id,extra)=>{d.statuses=d.statuses||[];if(E.hasStatus(d,id))return false;d.statuses.push({id,at:Date.now(),...extra});return true}; /* (altera d) */
E.applyGrapple=(d,byId)=>{d.statuses=(d.statuses||[]).filter(s=>E.statusId(s)!=='agarrado');d.statuses.push({id:'agarrado',at:Date.now(),by:byId||''})}; /* (altera d) */
E.releaseGrapple=(d,byId)=>{const n=(d.statuses||[]).length;d.statuses=(d.statuses||[]).filter(s=>!(E.statusId(s)==='agarrado'&&(!byId||!s.by||s.by===byId)));return d.statuses.length!==n}; /* (altera d) */
E.addHold=(d,targetId)=>{ /* (altera d) */
  d.statuses=d.statuses||[];let s=d.statuses.find(x=>x&&x.id==='segurando');
  if(!s){s={id:'segurando',at:Date.now(),alvos:[]};d.statuses.push(s)}
  s.alvos=(s.alvos||[]).filter(a=>a.id!==targetId).concat({id:targetId,at:Date.now()});
};
E.dropHold=(d,targetId)=>{ /* (altera d) sem alvo = solta todos */
  const s=(d.statuses||[]).find(x=>x&&x.id==='segurando');if(!s)return false;
  const before=(s.alvos||[]).length;s.alvos=targetId?(s.alvos||[]).filter(a=>a.id!==targetId):[];
  const gone=before-s.alvos.length;
  if(!s.alvos.length)d.statuses=d.statuses.filter(x=>x!==s);
  return gone>0;
};
/* agarrado não usa arma de duas mãos; quem segura alguém só tem 1 mão livre */
E.weaponAllowed=(d,w)=>E.isTwoHanded(w)&&!E.isCreatureAttack(w)&&(E.hasStatus(d,'agarrado')||E.holding(d).length)
  ?{ok:false,msg:E.hasStatus(d,'agarrado')?'Agarrado: não dá para usar arma de duas mãos.':'Você segura alguém com uma das mãos: não dá para usar arma de duas mãos.'}:{ok:true};

/* ---------- Reação (1 por rodada) e Guarda Fechada (até 2 Bloqueios) ----------
   d.reacao={r:rodada,i:índice do turno no último gasto,n:gastos,b:bloqueios,g:guarda}
   O registro vence sozinho no início do próximo turno do dono: nenhum aparelho precisa zerar nada. */
E.GUARDA_CAP=2;
E.turnCtx=(combat,charId)=>{
  if(!combat?.active||combat.phase!=='active')return null;
  const o=combat.order||[];
  return{round:Number(combat.round)||1,turnIndex:Math.max(0,Math.min(Number(combat.turnIndex)||0,o.length-1)),myIndex:o.findIndex(x=>x.characterId===charId)};
};
E.reactionFresh=(rec,t)=>{ /* true = o registro já venceu */
  if(!rec||!t)return true;
  const r=Number(rec.r)||0,i=Number(rec.i)||0,k=t.myIndex;
  if(t.round<r)return true; /* combate novo */
  const nr=k>i?r:r+1,ni=k<0?0:k;
  return t.round>nr||(t.round===nr&&t.turnIndex>=ni);
};
E.reactionInfo=(d,t)=>{
  const rec=t&&!E.reactionFresh(d?.reacao,t)?d.reacao:null,uses=Number(rec?.n)||0,guard=!!rec?.g,cap=guard?E.GUARDA_CAP:1;
  const forbidden=!!d&&E.computeMods(d).flags.has('semReacao');
  return{tracked:!!t,uses,blocks:Number(rec?.b)||0,guard,cap,forbidden,
    reactionAvailable:!forbidden&&(!t||uses<1),canBlock:!forbidden&&(!t||uses<cap),left:forbidden?0:Math.max(0,cap-uses)};
};
E.useReaction=(d,t,{block=false}={})=>{ /* (altera d) bloquear cabe na Guarda; o resto exige a Reação livre */
  const i=E.reactionInfo(d,t);
  if(i.forbidden)return{ok:false,msg:'Neste estado você não pode usar reações.'};
  if(!t)return{ok:true};
  if(block?!i.canBlock:!i.reactionAvailable)return{ok:false,msg:i.guard?'Os 2 usos da Guarda Fechada já não permitem isso nesta rodada.':'A Reação desta rodada já foi usada.'};
  d.reacao={r:t.round,i:t.turnIndex,n:i.uses+1,b:i.blocks+(block?1:0),g:i.guard};
  return{ok:true};
};
E.closeGuard=(d,t)=>{ /* (altera d) custa a Ação Padrão: quem chama gasta */
  if(!t)return{ok:false,msg:'A Guarda Fechada só vale durante o combate.'};
  const i=E.reactionInfo(d,t);
  if(i.forbidden)return{ok:false,msg:'Neste estado você não pode usar reações.'};
  if(i.guard)return{ok:false,msg:'Sua guarda já está fechada.'};
  d.reacao={r:t.round,i:t.turnIndex,n:i.uses,b:i.blocks,g:true};
  return{ok:true};
};
E.setReaction=(d,t,used)=>{ /* (altera d) ajuste manual no marcador */
  if(!t)return;
  const i=E.reactionInfo(d,t);
  if(!used&&!i.guard){delete d.reacao;return}
  d.reacao={r:t.round,i:t.turnIndex,n:used?i.cap:0,b:used?i.blocks:0,g:i.guard};
};
E.pruneReaction=(d,t)=>{if(d?.reacao&&E.reactionFresh(d.reacao,t))delete d.reacao;return d}; /* (altera d) */

/* ---------- Bloqueio ---------- */
E.hasShield=d=>(d?.inventory?.items||[]).some(i=>i&&i.kind==='prot'&&(i.loc==='vestido'||i.loc==='maos')&&i.p?.slot==='escudo');
E.blockWeapon=d=>E.quickWeapons(d).find(i=>i.w&&i.w.skill==='Armas Brancas'&&E.isMeleeWeapon(i.w)&&E.weaponAllowed(d,{...i.w,peso:i.peso}).ok)||null;
E.blockStyles=d=>{
  const out=[{id:'briga',skill:'Briga',attr:'Constituição',label:'Briga (CON)'}],arma=E.blockWeapon(d);
  if(arma||E.hasShield(d))out.push({id:'arma',skill:'Armas Brancas',attr:'Força',label:'Armas Brancas (FOR) · '+(arma?arma.name:'escudo')});
  return out;
};
E.canBlock=(d,{weapon,turn=null,noDefense=false,surprise=false,pointBlank=false}={})=>{
  if(!pointBlank&&!E.isMeleeWeapon(weapon))return{ok:false,msg:'Só dá para bloquear ataques corpo a corpo.'};
  if(noDefense)return{ok:false,msg:'Este contra-ataque não permite defesa.'};
  if(surprise)return{ok:false,msg:'Desprevenido: não dá para bloquear.'};
  if(E.isDying(d)||E.isDead(d))return{ok:false,msg:'Incapaz de agir.'};
  const f=E.computeMods(d).flags;
  if(['semDefender','semAgir','semEsquivar'].some(x=>f.has(x)))return{ok:false,msg:'Você não pode se defender neste estado.'};
  const i=E.reactionInfo(d,turn);
  if(!i.canBlock)return{ok:false,msg:i.forbidden?'Neste estado você não pode usar reações.':i.guard?'Os 2 bloqueios da Guarda Fechada já foram usados.':'A Reação desta rodada já foi usada.'};
  return{ok:true};
};
E.blockPlan=(d,styleId,turn=null)=>{
  const list=E.blockStyles(d),st=list.find(x=>x.id===styleId)||list[0],guard=E.reactionInfo(d,turn).guard;
  const rd=E.blockReduction(d,{guarda:guard});
  return{...st,guard,reduction:rd.total,parts:rd,extraDice:st.id==='arma'?E.vertSum(d,'dados',{quando:'bloqueioArma'}):0};
};
/* Os 4 desfechos. A ordem importa:
   1º Erro Total (ATA<DB e Bloqueio>=DB), senão a 1ª condição da Brecha o engoliria;
   2º Brecha (Bloqueio>=ATA com ATA<DB, ou folga de 5 ou mais);
   3º Parcial (Bloqueio>=DB e ATA>Bloqueio);
   4º Guarda Quebrada (Bloqueio<DB e ATA>=DB).
   O que as 4 condições não cobrem vira Parcial: Bloqueio>=ATA>=DB com folga menor que 5, e os dois
   abaixo da DB com o ataque maior. 20 natural nunca vira Erro Total: nesse caso vira Parcial. */
E.resolveBlock=({block,ATA,DB=E.DB,damage=0,reduction=0,nat20=false})=>{
  let outcome;
  if(ATA<DB&&block>=DB)outcome=nat20?'parcial':'erro';
  else if((block>=ATA&&ATA<DB)||block-ATA>=5)outcome='brecha';
  else if(block>=DB&&ATA>block)outcome='parcial';
  else if(block<DB&&ATA>=DB)outcome='quebrada';
  else outcome='parcial';
  const final=outcome==='erro'?0:outcome==='quebrada'?damage:E.blockedDamage(damage,reduction);
  const label={erro:'Erro total do agressor',brecha:'Bloqueio com brecha',parcial:'Bloqueio parcial',quebrada:'Guarda quebrada'}[outcome];
  const text={erro:'O golpe se perde no vazio: nenhum dano, e quem defendeu ganha 1 Contra-Ataque corpo a corpo.',
    brecha:`O bloqueio abre uma brecha: ${damage} → ${final} de dano, e quem defendeu ganha 1 Contra-Ataque corpo a corpo.`,
    parcial:`O bloqueio amortece o golpe: ${damage} → ${final} de dano, sem contra-ataque.`,
    quebrada:'A guarda se rompe: dano total, sem redução e sem contra-ataque.'}[outcome];
  return{outcome,label,text,damage:final,raw:damage,reduction,hit:outcome!=='erro',counter:outcome==='erro'||outcome==='brecha'};
};

/* ---------- Ataque corpo a corpo: efeitos das vertentes ---------- */
E.meleePlan=(d,w,{surprise=false,counter=false}={})=>{
  const out={attr:null,extraDice:0,flat:0,notes:[]};
  if(!E.isMeleeWeapon(w)||E.isCreature(d)||E.isCreatureAttack(w))return out;
  if(E.isShortBlade(w)){
    if(E.vertEffects(d,'atributoAtaque').length&&E.attr(d,'Destreza')>E.attr(d,'Força')){out.attr='Destreza';out.notes.push('Lâminas Curtas: Destreza no acerto e no dano')}
    const n=surprise?Math.max(E.vertSum(d,'dados',{quando:'furtivo'}),E.vertSum(d,'dados',{quando:'desprevenido'})):0;
    if(n){out.extraDice+=n;out.notes.push(`Lâminas Curtas: +${n}d20 contra desprevenido`)}
  }
  if(E.isImprovised(w)){const n=E.vertSum(d,'dados',{quando:'armaImprovisada'});if(n){out.extraDice+=n;out.notes.push(`Briga de Rua: +${n}d20 com arma improvisada`)}}
  if(w.note==='desarmado'){const n=E.vertSum(d,'dano',{quando:'desarmado'});if(n){out.flat+=n;out.notes.push(`Briga de Rua: +${n} de dano desarmado`)}}
  if(counter){const n=E.vertSum(d,'dados',{quando:'contraAtaque'});if(n){out.extraDice+=n;out.notes.push(`Boxe / Muay Thai: +${n}d20 no Contra-Ataque`)}}
  return out;
};
/* dados de dano somados contra o alvo (Jiu-Jitsu: alvo Agarrado e Caído) */
E.meleeExtraDice=(d,w,target)=>!E.isMeleeWeapon(w)||!E.hasStatus(target,'agarrado')||!E.hasStatus(target,'caido')?[]
  :E.vertEffects(d,'danoExtra',{quando:'alvoAgarradoCaido'}).map(x=>({dado:x.effect.dado,nome:x.def.name}));

/* ---------- Manobras (1 Ação Padrão, adjacente, sem dano) ---------- */
E.MANOBRAS={
  desarmar:{name:'Desarmar',skills:['Briga','Armas Brancas'],def:['Briga','Armas Brancas'],hint:'Disputa. Se vencer, a arma do alvo cai no chão.'},
  derrubar:{name:'Derrubar',skills:['Briga'],def:['Briga'],hint:'Disputa. Se vencer, o alvo fica Caído (empate favorece quem defende).'},
  agarrar:{name:'Agarrar',skills:['Briga'],def:['Briga'],hint:'Disputa. O alvo fica Agarrado; você ocupa 1 mão e anda pela metade.'},
  escapar:{name:'Escapar',skills:['Briga'],def:['Briga'],hint:'Disputa contra quem segura você.'},
  empurrar:{name:'Empurrar',skills:['Briga'],def:[],hint:'Teste contra DT 10 + maior entre FOR e CON do alvo. Empurra até 4,5 m (teto de 1,5 m × sua FOR).'}
};
/* alvo é opcional: a ficha de outro jogador pode não estar neste aparelho (vale o que for público) */
E.maneuverCheck=(d,m,target=null,targetId='')=>{
  if(!E.MANOBRAS[m])return{ok:false,msg:'Manobra desconhecida.'};
  if(E.isDying(d)||E.isDead(d))return{ok:false,msg:'Incapaz de agir.'};
  const f=E.computeMods(d).flags;
  if(f.has('semAgir')||(m!=='escapar'&&f.has('semAtacar')))return{ok:false,msg:'Neste estado você não pode agir.'};
  if(m==='escapar'&&!E.hasStatus(d,'agarrado'))return{ok:false,msg:'Você não está Agarrado.'};
  if(m==='agarrar'){
    if(E.holding(d).includes(targetId))return{ok:false,msg:'Você já está segurando esse alvo.'};
    if(E.handsUsed(d)>=2)return{ok:false,msg:'Libere uma mão para agarrar.'};
  }
  if(target){
    if(E.isDead(target))return{ok:false,msg:'O alvo está morto.'};
    if(m==='derrubar'&&E.hasStatus(target,'caido'))return{ok:false,msg:'O alvo já está Caído.'};
  }
  return{ok:true};
};
/* rolagem de quem inicia: perícia, atributo e dados de vertente (só as da própria perícia) */
E.maneuverPlan=(d,m,{skill,targetTwoHanded=false}={})=>{
  const def=E.MANOBRAS[m],sk=def.skills.includes(skill)?skill:def.skills[0],p=E.pericia(sk),notes=[];
  const mine=(tipo,quando)=>E.vertEffects(d,tipo,{quando}).filter(x=>p&&x.def.pericia===p.id);
  let attr=sk==='Briga'?'Força':null,extraDice=0,bonus=0;
  if(m==='empurrar'){const alt=mine('atributoManobra','empurrar')[0]?.effect.atributo;if(alt&&E.attr(d,alt)>E.attr(d,'Força')){attr=alt;notes.push('Taekwondo / Karatê: Destreza para Empurrar')}}
  mine('dados',m).forEach(x=>{const n=Number(x.effect.valor)||0;extraDice+=n;notes.push(`${x.def.name}: +${n}d20`)});
  if(m==='desarmar'&&targetTwoHanded){bonus-=2;notes.push('Alvo empunha arma de duas mãos: −2')}
  return{skill:sk,attr,extraDice,bonus,notes};
};
E.contest=(atk,def)=>({success:atk>def,margin:atk-def}); /* empate favorece quem defende */
E.pushDT=target=>10+Math.max(1,E.attr(target,'Força'),E.attr(target,'Constituição'));
E.pushMeters=(margin,atkFor)=>margin<0?0:Math.min((margin>=10?3:margin>=5?2:1)*1.5,1.5*Math.max(1,Number(atkFor)||1));
/* resolução no lado do alvo: def = total do defensor (null = indefeso) */
E.resolveManeuver=({m,atk,def=null,dt=0,atkFor=1,twoHanded=false})=>{
  const total=atk+(m==='desarmar'&&twoHanded?-2:0);
  if(m==='empurrar'){const margin=total-dt,meters=E.pushMeters(margin,atkFor);return{success:meters>0,margin,meters,total,dt}}
  if(def===null||def===undefined)return{success:true,margin:total,meters:0,total,def:null};
  return{...E.contest(total,def),meters:0,total,def};
};
/* Judô / Wrestling: ao derrubar, gastar a Reação para manter Agarrado */
E.canHoldAfterTrip=(d,turn=null)=>E.vertEffects(d,'permite').some(x=>x.effect.acao==='agarrarAoDerrubar')&&E.reactionInfo(d,turn).reactionAvailable&&E.handsUsed(d)<2;

/* ---------- Desarme ---------- */
/* arma "empunhada": a que está nas mãos; senão a última usada para atacar (cintura/bandoleira) */
E.disarmTarget=d=>{
  const list=E.quickWeapons(d).filter(i=>i.w&&!E.isCreatureAttack(i.w));
  return list.find(i=>i.loc==='maos'&&i.id===d.armaEmUso)||list.find(i=>i.loc==='maos')||list.find(i=>i.id===d.armaEmUso)||null;
};
E.disarm=(d,itemId)=>{ /* (altera d) devolve a cópia do item largado: é o gancho do DroppedItem (Onda 12) */
  const it=itemId?E.ensureInv(d).items.find(i=>i.id===itemId):E.disarmTarget(d);if(!it)return null;
  const from=it.loc;it.loc='chao';it.equipped=false;if(d.armaEmUso===it.id)d.armaEmUso='';
  return{...JSON.parse(JSON.stringify(it)),from};
};

/* ---------- Empurrão no mapa: linha reta até parede, borda ou outro token (unidades do mapa) ---------- */
E.segDist=(px,py,s)=>{const ex=s.bx-s.ax,ey=s.by-s.ay,l=ex*ex+ey*ey,t=l?Math.max(0,Math.min(1,((px-s.ax)*ex+(py-s.ay)*ey)/l)):0;return Math.hypot(px-s.ax-ex*t,py-s.ay-ey*t)};
E.segCross=(ax,ay,bx,by,s)=>{
  const rx=bx-ax,ry=by-ay,ex=s.bx-s.ax,ey=s.by-s.ay,den=rx*ey-ry*ex;if(Math.abs(den)<1e-12)return false;
  const t=((s.ax-ax)*ey-(s.ay-ay)*ex)/den,u=((s.ax-ax)*ry-(s.ay-ay)*rx)/den;
  return t>=0&&t<=1&&u>=-1e-9&&u<=1+1e-9;
};
E.pushPath=({x,y,dx,dy,dist,radius,segments=[],circles=[],bounds=null})=>{
  const len=Math.hypot(dx,dy),ux=len?dx/len:1,uy=len?dy/len:0,n=Math.max(1,Math.ceil(dist/Math.max(.5,radius*.15)));
  let cx=x,cy=y,moved=0,hit=null,hitId='';
  for(let k=1;k<=n;k++){
    const at=dist*k/n,nx=x+ux*at,ny=y+uy*at;
    if(bounds&&((nx<radius-1e-6&&nx<cx)||(ny<radius-1e-6&&ny<cy)||(nx>bounds.W-radius+1e-6&&nx>cx)||(ny>bounds.H-radius+1e-6&&ny>cy)))hit='borda';
    if(!hit)for(const s of segments){const d1=E.segDist(nx,ny,s);if(E.segCross(cx,cy,nx,ny,s)||(d1<radius*.95&&d1<E.segDist(cx,cy,s)-1e-6)){hit=s.edge?'borda':'parede';break}}
    if(!hit)for(const c of circles){const d1=Math.hypot(nx-c.x,ny-c.y);if(d1<(radius+c.r)*.95&&d1<Math.hypot(cx-c.x,cy-c.y)-1e-6){hit='token';hitId=c.id||'';break}}
    if(hit)break;
    cx=nx;cy=ny;moved=at;
  }
  return{x:cx,y:cy,moved,hit,hitId};
};
E.PUSH_HAZARD={parede:'1d4',borda:'1d6',token:'1d4'};

/* ---------- Arremesso ---------- */
E.isExplosive=w=>w?.skill==='Arremesso'&&(!!w.area||/molotov|granada|bomba|mina|dinamite/i.test(w.name||''));
E.throwProfile=(d,w,base=12)=>{
  if(w?.skill!=='Arremesso')return{range:base,short:6,exact:false,notes:[]};
  const plus=E.vertSum(d,'alcance'),notes=[];
  const dbl=E.isTwoHanded(w)?1:E.vertEffects(d,'multiplicador',{alvo:'alcanceCurto'}).reduce((a,x)=>Math.max(a,Number(x.effect.valor)||1),1);
  const exact=E.isExplosive(w)&&E.vertEffects(d,'permite').some(x=>x.effect.acao==='explosivoNoPontoExato');
  if(plus)notes.push(`Carga & Explosivos: +${plus} m de alcance`);
  if(dbl>1)notes.push(`Precisão Leve: alcance curto de ${6*dbl} m`);
  if(exact)notes.push('Carga & Explosivos: o explosivo cai no ponto exato');
  return{range:base+plus,short:6*dbl,exact,notes};
};
E.throwDT=(m,short=6)=>m<=short?12:m<=12?15:m<=18?18:20+2*Math.ceil(Math.max(0,m-24)/6);

/* ===================================================================
   ONDA 11 — Armas de Disparo (Tiroteio Tático). Puro: a UI (js/13,
   js/27, js/60i) só informa o contexto e o alvo.
   Contexto de um tiro: {aware, pointBlank, short, cover:''|'parcial'|'pesada',
   sprint, aimed, rangePenalty, second, free, dist}.
   =================================================================== */
E.POINT_BLANK=1.5;E.SHOTGUN_RANGE=6;E.DIVE_M=3;E.EXPOSE_M=.75;E.SPRINT_DF=2;E.PRONE_DF=2;
E.isGun=w=>w?.skill==='Armas de Disparo'&&!w.area;
/* especialização que a arma pede (item da campanha: w.spec manda). '' = nenhuma: vale o generalismo */
E.gunClass=w=>{
  if(!E.isGun(w)||E.isCreatureAttack(w))return'';
  if(w.spec)return w.spec;
  const n=String(w.name||'').toLowerCase();
  if(/precis|sniper|franco/.test(n))return'precisao';
  if(/espingarda|escopeta/.test(n))return'espingardas';
  if(/(^|\s)arco(\s|$)|besta|balestra/.test(n))return'arcos';
  if(/metralhadora|fuzil|carabina|rifle|mosquete/.test(n))return'fuzis';
  if(/pistola|rev[óo]lver/.test(n))return'pistolas';
  return'';
};
/* balístico ou perfurante: o crítico dobra só os dados da arma e faz sangrar */
E.isBallistic=w=>E.isGun(w)&&!/lan[çc]a-chamas|sinalizadora|taser|choque|estilingue|tranquiliz/i.test(w.name||'')&&!(w.effects||[]).some(e=>e.status==='queimando');
/* como rolar o ataque: vertente da arma, metade fora da especialização, ou a perícia pura.
   calc vai direto para skillCalc3/doRoll ({vert} ou {generalista}); trained libera o efeito tático */
E.gunSpec=(d,w)=>{
  const cls=E.gunClass(w),none={cls,vert:null,calc:null,trained:false,status:'',name:''};
  if(!E.isGun(w)||E.isCreature(d)||E.isCreatureAttack(w))return none;
  if(cls){const vert='armasdisparo.'+cls,c=E.vertCalc(d,vert);if(c)return{cls,vert,calc:{vert},trained:c.status==='treinado',status:c.status,name:c.def.name}}
  const g=E.generalistCalc(d,'armasdisparo');
  return g?{...none,calc:{generalista:'armasdisparo'},status:g.status}:none;
};
/* gatilhos automáticos das especializações (só vertentes treinadas) e da queima-roupa */
E.shotEffects=(d,w,ctx={})=>{
  const spec=E.gunSpec(d,w),f=(tipo,o={})=>spec.trained?E.vertEffects(d,tipo,{...o,vert:spec.vert}):[];
  const sum=(tipo,quando)=>f(tipo,{quando}).reduce((a,x)=>a+(Number(x.effect.valor)||0),0);
  const r={spec,extraDice:0,disadv:false,flat:0,critMin:Number(w?.critMin)||20,canAim:false,aimed:false,push:0,silent:false,recover:false,quickDraw:false,notes:[]};
  if(!E.isGun(w))return r;
  r.quickDraw=f('permite').some(x=>x.effect.acao==='sacarEDisparar');
  r.silent=f('permite').some(x=>x.effect.acao==='disparoSilencioso');
  r.recover=f('permite').some(x=>x.effect.acao==='recuperarMunicao');
  if(ctx.pointBlank&&!ctx.suppress){
    if(f('ignora',{quando:'queimaRoupa'}).length)r.notes.push(spec.name+': sem desvantagem à queima-roupa');
    else{r.disadv=true;r.notes.push('Queima-roupa: desvantagem no ataque')}
    const n=sum('dano','queimaRoupa');if(n){r.flat+=n;r.notes.push(`${spec.name}: +${n} de dano à queima-roupa`)}
  }
  if(ctx.rangePenalty){
    if(f('ignora',{quando:'alcanceMedioLongo'}).length)r.notes.push(spec.name+': ignora a penalidade de alcance');
    else{r.extraDice-=1;r.notes.push('Médio/longo alcance: −1d20')}
  }
  if(ctx.suppress){const n=sum('dados','supressao');if(n){r.extraDice+=n;r.notes.push(`${spec.name}: +${n}d20 na supressão`)}}
  const aim=f('mirar')[0];r.canAim=!!aim;
  if(ctx.aimed&&aim){const v=Number(aim.effect.valor)||1;r.aimed=true;r.critMin=Math.max(2,r.critMin-v);r.notes.push(`Mira: ignora Cobertura Parcial e crítico ${r.critMin}–20`)}
  const pu=f('empurrao')[0];
  if(pu&&!ctx.suppress){
    const max=Number(pu.effect.alcanceMax)||E.SHOTGUN_RANGE;
    if(ctx.pointBlank||ctx.short||(ctx.dist!=null&&ctx.dist<=max+.01)){r.push=Number(pu.effect.metros)||1.5;r.notes.push(`${spec.name}: empurra ${String(r.push).replace('.',',')} m ao superar a DF`)}
  }
  return r;
};
/* raio do barulho do disparo, em quadrados do mapa (0 = silencioso: não revela a posição) */
E.shotNoise=(d,w)=>!E.isGun(w)?0:E.shotEffects(d,w).silent?0:E.gunClass(w)==='arcos'?3:16;
/* Mirar (Sniper) custa a Ação de Movimento inteira: só antes de andar e sem Disparada */
E.canAim=(d,w,{moved=0,ran=false}={})=>{
  if(!E.shotEffects(d,w).canAim)return{ok:false,msg:'Mirar exige a especialização em Rifles de Precisão com um rifle de precisão.'};
  if(ran)return{ok:false,msg:'Depois de uma Disparada não dá para mirar.'};
  if(moved>.05)return{ok:false,msg:'Mirar gasta a Ação de Movimento: você já se moveu neste turno.'};
  return{ok:true};
};
/* trava pós-disparo: o movimento que sobrou deixa de existir */
E.lockedMove=(max,used,locked)=>locked&&used<max?used:max;

/* ---------- contexto automático ---------- */
/* 3 linhas de visão (centro e bordas): todas = sem cobertura · 2 = parcial · 1 = pesada · 0 = total */
E.coverFromRays=(n,total=3)=>n>=total?'':n<=0?'total':n>=2?'parcial':'pesada';
E.autoAware=({inCombat=false,targetInCombat=false,surprised=false,hostile=false,sees=false}={})=>
  surprised?false:inCombat&&targetInCombat?true:hostile?!!sees:!inCombat;
/* Disparada: vale até o começo do próximo turno de quem correu */
E.markSprint=(d,t)=>{if(t)d.disparada={r:t.round,i:t.turnIndex}}; /* (altera d) */
E.isSprinting=(d,t)=>!!(d?.disparada&&t&&!E.reactionFresh(d.disparada,t));

/* ---------- Defesa contra o tiro: DF da ficha + cobertura + Disparada + Caído ---------- */
E.shotDF=(target,{cover='',sprint=false,aimed=false}={})=>{
  const base=E.defenseInfo(target).DF,parts=[],ignored=!!(aimed&&cover==='parcial');
  const c=ignored?0:E.coverBonus(cover);if(c)parts.push({label:cover==='pesada'?'Cobertura pesada':'Cobertura parcial',v:c});
  if(sprint)parts.push({label:'Em Disparada',v:E.SPRINT_DF});
  if(E.hasStatus(target,'caido'))parts.push({label:'Caído',v:E.PRONE_DF});
  return{base,DF:base+parts.reduce((a,p)=>a+p.v,0),parts,ignored};
};

/* ---------- Mergulho (RF) = (DES)d20 + Reflexo, consome a Reação ---------- */
E.canDive=(d,{turn=null}={})=>{
  if(E.isDying(d)||E.isDead(d))return{ok:false,msg:'Incapaz de agir.'};
  const f=E.computeMods(d).flags;
  if(['semDefender','semAgir','semEsquivar','semMover'].some(x=>f.has(x)))return{ok:false,msg:'Neste estado você não consegue mergulhar.'};
  const i=E.reactionInfo(d,turn);
  if(!i.reactionAvailable)return{ok:false,msg:i.forbidden?'Neste estado você não pode usar reações.':'A Reação desta rodada já foi usada.'};
  return{ok:true};
};
/* no tiro, Esquiva e Bloqueio só existem à queima-roupa com o alvo ciente */
E.shotBlockable=s=>!!(s&&s.aware&&s.pointBlank&&!s.second&&!s.free);
/* o que o alvo pode fazer. direct = resolve na hora, ATA × DF */
E.shotOptions=(d,shot,{turn=null,nat20=false,weapon=null}={})=>{
  const no=why=>({direct:true,why,dive:{ok:false,msg:why},dodge:false,block:false});
  if(shot.second)return no('2º Disparo: sem Mergulho nem Esquiva');
  if(shot.free)return no('Tiro Livre');
  if(!shot.aware)return no('Desprevenido');
  const f=E.computeMods(d).flags;
  if(E.isDying(d)||E.isDead(d)||f.has('semDefender')||f.has('semAgir'))return no('Alvo indefeso');
  const pb=E.shotBlockable(shot);
  const dive=nat20?{ok:false,msg:'20 natural: o Mergulho não adianta.'}:E.canDive(d,{turn});
  const dodge=pb&&!f.has('semEsquivar'),block=pb&&E.canBlock(d,{weapon,turn,pointBlank:true}).ok;
  const direct=!dive.ok&&!dodge&&!block;
  return{direct,why:direct?dive.msg:'',dive,dodge,block};
};
/* Os 5 desfechos do Mergulho e o tiro direto. Precedência:
   1º 20 natural: crítico garantido, o RF é ignorado (o alvo não cai e não há 2º Disparo);
   2º sem RF (desprevenido, 2º Disparo, Tiro Livre, sem Reação ou não quis mergulhar): ATA >= DF acerta;
   3º com RF, sempre contra a Defesa Base (a DF não entra):
      ATA<DB  e RF>=DB  Erro e Recuperação (fica de pé)
      ATA>=DB e RF>=DB  Mergulho bem-sucedido (Caído ou abrigado)
      ATA>=DB e RF<DB   Acerto Violento (acerta, Caído, +1 Ação Padrão para o 2º Disparo)
      ATA<DB  e RF<DB   Erro e Queda (Caído)
   crit = o dado caiu na margem da arma: só conta quando acerta. */
E.resolveShot=({ATA,RF=null,DB=E.DB,DF=E.DB,nat20=false,crit=false})=>{
  const dived=RF!==null&&RF!==undefined;let id;
  if(nat20)id='critico';
  else if(!dived)id=ATA>=DF?'direto':'errou';
  else if(ATA<DB)id=RF>=DB?'recuperacao':'queda';
  else id=RF>=DB?'mergulho':'violento';
  const hit=id==='critico'||id==='direto'||id==='violento';
  const T={critico:['Crítico garantido (20 natural)','Um 20 natural acerta em cheio: o Mergulho não adianta.'],
    direto:['Tiro certeiro',`O disparo alcança a Defesa (${ATA} × DF ${DF}).`],errou:['Tiro perdido',`O disparo não passa pela Defesa (${ATA} × DF ${DF}).`],
    recuperacao:['Erro e recuperação','O tiro erra e o alvo se recupera de pé.'],mergulho:['Mergulho bem-sucedido','Nenhum dano: o alvo termina Caído ou abrigado.'],
    violento:['Acerto violento','O tiro acerta, o alvo cai e o atirador ganha um 2º Disparo imediato.'],queda:['Erro e queda','O tiro erra, mas o alvo termina Caído.']}[id];
  return{shotOutcome:id,outcome:id==='violento'?'violento':hit?'normal':'esquiva',hit,crit:hit&&(!!nat20||!!crit),forced:id==='critico',
    fall:id==='mergulho'||id==='violento'||id==='queda',shot2:id==='violento',label:T[0],text:T[1],extraAtk:0,extraDef:0,full:false,ATA,RF:dived?RF:0,DB,DF};
};

/* ---------- Fogo de Supressão: Resistência [PRE] (Firmeza Mental) contra o ATA ---------- */
E.canSuppress=(d,w,{cover=''}={})=>{
  if(!E.isGun(w))return{ok:false,msg:'Fogo de Supressão exige uma arma de disparo.'};
  const f=E.computeMods(d).flags;
  if(f.has('semAgir')||f.has('semAtacar'))return{ok:false,msg:'Neste estado você não pode atacar.'};
  if(cover!=='parcial'&&cover!=='pesada')return{ok:false,msg:'Fogo de Supressão só vale contra alvo em cobertura.'};
  return{ok:true};
};
E.resolveSuppression=({ATA,resist=null})=>({suppressed:resist===null||resist<ATA,ATA,resist}); /* empate favorece o alvo */
E.suppressionOf=d=>(d?.statuses||[]).find(s=>s&&s.id==='suprimido')||null;
E.applySuppressed=(d,info)=>{d.statuses=(d.statuses||[]).filter(s=>E.statusId(s)!=='suprimido');d.statuses.push({id:'suprimido',at:Date.now(),...info})}; /* (altera d) */
E.clearSuppressed=(d,sid)=>{const n=(d.statuses||[]).length;d.statuses=(d.statuses||[]).filter(s=>!(E.statusId(s)==='suprimido'&&(!sid||s.sid===sid)));return d.statuses.length!==n}; /* (altera d) */
/* dura até o começo do próximo turno de quem atirou (t = E.turnCtx do atirador) */
E.suppressionExpired=(s,t)=>!t||E.reactionFresh({r:s.r,i:s.i},t);
/* andou: continua protegido só se a cobertura era do mapa e o novo lugar também cobre; sem visão não há tiro */
E.exposes=({moved=0,autoCover=false,cover=''}={})=>moved>E.EXPOSE_M&&cover!=='total'&&!(autoCover&&!!cover);

/* ---------- Sangramento (1 VT por rodada) ---------- */
E.applyBleed=d=>E.addStatus(d,'sangrando'); /* (altera d) nunca acumula */
/* uma vez por turno, mesmo que dois aparelhos (ou um F5) processem o mesmo início de turno */
E.bleedTick=(d,key)=>{const s=(d?.statuses||[]).find(x=>x&&x.id==='sangrando');if(!s||s.suspended||(key&&s.tick===key))return false;if(key)s.tick=key;return true}; /* (altera d) */

/* ---------- Arcos: a munição intacta volta no fim da cena ---------- */
E.registerRecovery=(d,item)=>{if(!item)return;const r=d.municaoRec||{n:0};d.municaoRec={n:r.n+1,item:{...item,qty:1}}}; /* (altera d) */
E.recoverAmmo=d=>{ /* (altera d) devolve quantas voltaram */
  const r=d?.municaoRec;if(!r)return 0;delete d.municaoRec;if(!(r.n>0)||!r.item)return 0;
  const inv=E.ensureInv(d),it=inv.items.find(i=>i.id===r.item.id)||inv.items.find(i=>i.name===r.item.name&&i.loc!=='chao');
  if(it)it.qty=(Number(it.qty)||0)+r.n;else inv.items.push({...r.item,qty:r.n});
  return r.n;
};

/* ---------- Itens caídos no mapa (DroppedItem) ----------
   O "livro" fica em M6.state.drops (só o Mestre escreve). Cada entrada é uma passagem do item:
   st 'floor' (no chão) ou 'taken' (com `by`). `line` liga as passagens do mesmo item. A ficha é
   sempre derivada do livro (E.dropReconcile), por isso repetir, recarregar ou concorrer não duplica. */
E.DROP_MAX=80;            /* itens no chão ao mesmo tempo */
E.DROP_KEEP=864e5;        /* passagens encerradas ficam 24 h (consertam cópias antigas de ficha) */
E.dropClean=v=>{ /* cópia sem imagens: o estado da mesa só leva texto e números */
  if(typeof v==='string')return /^\s*(data|blob):/i.test(v)?'':v.slice(0,1500);
  if(Array.isArray(v))return v.map(E.dropClean);
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,E.dropClean(x)]));
  return v;
};
/* o item original inteiro, sem o que diz onde ele estava */
E.dropItem=it=>{const c=E.dropClean(JSON.parse(JSON.stringify(it||{})));delete c.loc;delete c.equipped;delete c.from;delete c.dropPend;return c};
E.dropVert=it=>{
  const w=it?.w;if(!w||it.kind!=='weapon')return'';
  if(E.isGun(w)){const c=E.gunClass(w);return c?'armasdisparo.'+c:''}
  if(w.skill==='Arremesso')return E.isExplosive(w)?'arremesso.explosivos':'arremesso.precisao';
  if(w.skill==='Armas Brancas'&&E.isMeleeWeapon(w))return E.isShortBlade(w)?'armasbrancas.curtas':'armasbrancas.longas';
  return'';
};
E.dropIcon=it=>{
  const n=String(it?.name||'').toLowerCase(),w=it?.w;
  if(it?.kind==='prot')return it.p?.slot==='escudo'?'escudo':'protecao';
  if(!w)return /muni/.test(n)?'municao':'objeto';
  if(E.isGun(w)){const c=E.gunClass(w);return c==='arcos'?'arco':['espingardas','fuzis','precisao'].includes(c)?'rifle':'pistola'}
  if(w.skill==='Arremesso'||w.area)return'bomba';
  if(/machad/.test(n))return'machado';
  if(/taco|porrete|bast[ãa]o|martelo|marreta|corrente|cano|cassetete|cabra/.test(n))return'porrete';
  return E.isShortBlade(w)?'faca':'espada';
};
E.dropRecord=({id,line='',item,from,fromName='',map,x,y,at,reason='largado',feet=false})=>{
  const home=item?.from||item?.loc||'',it=E.dropItem(item),w=it.w||null,vert=E.dropVert(it);
  return{id,line:line||id,st:'floor',map,x,y,from,fromName,name:it.name||'Item',
    cat:w?w.cat||'':it.kind==='prot'?'Proteção':'Equipamento',skill:w?.skill||'',vert,vertName:vert?E.vert(vert)?.name||'':'',
    dado:w?.dado||'',critMin:w?.critMin||null,peso:it.peso||'',qty:Math.max(1,Number(it.qty)||1),
    ammo:w&&E.isGun(w)?{controlada:!!it.useAmmo}:null,icon:E.dropIcon(it),home,item:it,reason,feet:!!feet,at,upd:at};
};
/* o token ocupa a célula (i,j)? (posições fracionárias contam) */
E.cellTaken=(t,i,j)=>{
  const s=t.s||1,rx=Math.round(t.x),ry=Math.round(t.y);
  if(i>=rx&&i<rx+s&&j>=ry&&j<ry+s)return true;
  return Math.max(Math.abs(i+.5-t.x-s/2),Math.abs(j+.5-t.y-s/2))<s/2-1e-6;
};
/* célula livre adjacente mais próxima (até 1 célula). clear(i,j) diz se não há parede ou porta
   fechada no caminho. Sem nenhuma: o item cai aos pés de quem largou (fallback). */
E.dropCell=({tok,cols,rows,tokens=[],drops=[],clear=()=>true})=>{
  const s=tok.s||1,rx=Math.round(tok.x),ry=Math.round(tok.y),cx=tok.x+s/2,cy=tok.y+s/2,list=[];
  for(let j=ry-1;j<=ry+s;j++)for(let i=rx-1;i<=rx+s;i++){
    if(i<0||j<0||i>=cols||j>=rows||E.cellTaken(tok,i,j))continue;
    const dx=i+.5-cx,dy=j+.5-cy;
    if(Math.max(Math.abs(dx),Math.abs(dy))>s/2+.5+1e-6)continue;
    if(tokens.some(t=>E.cellTaken(t,i,j))||!clear(i,j))continue;
    list.push({x:i,y:j,n:drops.filter(d=>d.x===i&&d.y===j).length,d:Math.hypot(dx,dy)});
  }
  list.sort((a,b)=>a.n-b.n||a.d-b.d||a.y-b.y||a.x-b.x);
  return list.length?{x:list[0].x,y:list[0].y,fallback:false}:{x:Math.max(0,Math.min(cols-1,rx)),y:Math.max(0,Math.min(rows-1,ry)),fallback:true};
};
/* o token alcança o item? (a até 1 célula, diagonal conta) */
E.dropReach=(tok,d,folga=.35)=>{const s=tok.s||1;return Math.max(Math.abs(d.x+.5-tok.x-s/2),Math.abs(d.y+.5-tok.y-s/2))<=s/2+.5+folga+1e-6};
/* onde o item recolhido vai ficar na ficha ('' = não há espaço) */
E.pickPlace=(d,item,home='')=>{
  const order=item.kind==='prot'?['maos','mochila']:item.peso==='Bolso'?['bolso','mochila','maos']:['maos',home,'cintura','bandoleira','bolso','mochila'];
  for(const l of order){if(!l||l==='chao'||l==='vestido')continue;if(E.validPlacement(d,{...item,loc:l},l).ok)return l}
  return'';
};
E.dropLast=(drops,line)=>{for(let i=drops.length-1;i>=0;i--)if(drops[i].line===line)return drops[i];return null};
/* quem vai largar ainda tem o item? devolve a linha que a nova passagem continua */
E.dropLineage=(drops,charId,itemId)=>{
  for(let i=drops.length-1;i>=0;i--){
    const e=drops[i];
    if(!((e.by===charId&&(e.as||e.item.id)===itemId)||(e.from===charId&&e.item.id===itemId)))continue;
    const l=E.dropLast(drops,e.line);
    return l.st==='taken'&&l.by===charId&&(l.as||l.item.id)===itemId?{ok:true,line:e.line}:{ok:false,line:''};
  }
  return{ok:true,line:''};
};
/* o primeiro leva: só um item no chão pode ser recolhido. `as` troca o id se ele colidir */
E.dropTake=(drops,id,by,{at=0,req='',has=false}={})=>{
  const e=drops.find(x=>x.id===id);if(!e||e.st!=='floor')return null;
  const k=e.item.id,involved=drops.some(x=>x.line===e.line&&(x.from===by||x.by===by));
  const clash=drops.some(x=>x.line!==e.line&&(x.item.id===k||x.as===k))||(has&&!involved);
  const entry={...e,st:'taken',by,req,takenAt:at,upd:at,...(clash?{as:k+'-'+e.id}:{})};
  return{drops:drops.map(x=>x.id===id?entry:x),entry};
};
/* (altera d) ajusta o inventário de charId ao livro: sai o que não está com ele; entra, uma única
   vez, o que está (a marca em d.dropsIn é gravada junto com o item, na mesma ficha). */
E.dropReconcile=(d,drops,charId)=>{
  const lines=new Map();drops.forEach(e=>{if(!lines.has(e.line))lines.set(e.line,[]);lines.get(e.line).push(e)});
  let changed=false;
  lines.forEach(list=>{
    if(!list.some(e=>e.from===charId||e.by===charId))return;
    const last=list[list.length-1],hold=last.st==='taken'&&last.by===charId,held=hold?last.as||last.item.id:'';
    const gone=new Set();list.forEach(e=>{if(e.from===charId)gone.add(e.item.id);if(e.by===charId)gone.add(e.as||e.item.id)});
    if(hold)gone.delete(held);
    const inv=E.ensureInv(d),n=inv.items.length;
    if(inv.items.some(i=>gone.has(i.id))){inv.items=inv.items.filter(i=>!gone.has(i.id));if(gone.has(d.armaEmUso))d.armaEmUso=''}
    if(inv.items.length!==n)changed=true;
    if(!hold){
      const marks=new Set(list.map(e=>e.id));
      if((d.dropsIn||[]).some(m=>marks.has(m))){d.dropsIn=d.dropsIn.filter(m=>!marks.has(m));changed=true}
      return;
    }
    if((d.dropsIn||[]).includes(last.id))return;
    let it=inv.items.find(i=>i.id===held);
    if(!it){it={...JSON.parse(JSON.stringify(last.item)),id:held};it.loc=E.pickPlace(d,it,last.home)||'chao';inv.items=[...inv.items,it]}
    else if(it.loc==='chao')it.loc=E.pickPlace(d,it,last.home)||'chao';
    delete it.equipped;delete it.dropPend;
    d.dropsIn=[...(d.dropsIn||[]),last.id].slice(-60);changed=true;
  });
  return changed;
};
/* faxina do Mestre: só sai o que já encerrou há mais de 24 h (e a ficha de quem pegou confirmou) */
E.dropPrune=(drops,now,confirmed=()=>true)=>{
  const out=drops.filter(e=>{
    const recent=now-(e.upd||0)<E.DROP_KEEP;
    if(E.dropLast(drops,e.line)!==e)return recent;
    return e.st==='floor'||recent||!confirmed(e);
  });
  return out.length===drops.length?drops:out;
};

if(typeof module!=='undefined')module.exports=E;

