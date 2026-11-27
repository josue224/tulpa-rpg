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
E.ensureInv=d=>{const inv=d.inventory=d.inventory||{};if(!Array.isArray(inv.items))inv.items=[];inv.mochila=!!inv.mochila;inv.bandoleira=!!inv.bandoleira;return inv};
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
  return a;},0);
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
    return used+need<=2?{ok:true}:{ok:false,msg:'Suas 2 mãos já estão ocupadas (escudo ocupa 1 mão; arma Pesada ocupa 2).'};
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
E.rollDamage=(weapon,{extraDice=0,flat=0,rng=E.rng}={})=>{
  const p=E.parseDice(weapon.dado);
  const rollSet=()=>Array.from({length:p.n+extraDice},()=>E.die(p.s,rng));
  const normal=rollSet(),crit=rollSet();
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
if(typeof module!=='undefined')module.exports=E;

