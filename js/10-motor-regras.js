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
  const forca=Math.max(1,Number(d.attributes?.['Força'])||1);
  const limit=3+forca+(inv.mochila?2:0);
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
E.defenseInfo=d=>{
  const m=E.computeMods(d),equip=E.equipDefense(d);
  const df=E.DB+equip+m.defense;
  return{DB:E.DB,equip,mods:m.defense,DF:df,hasDefense:df>E.DB,parts:{equip,mods:m.defense}};
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
E.resolveAttack=({ATA,RF,DB=E.DB,DF=E.DB,canDefend=true,crit=false,nat20=false,targetDown=false,proficient=true})=>{
  const rf=canDefend?RF:0,hasDef=DF>DB;
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
E.restRoll=(d,patamarEs,patamarLuc,{intuicao=1,stage=1,intFailed=false,noLuc=false,rng=E.rng}={})=>{
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
if(typeof module!=='undefined')module.exports=E;

