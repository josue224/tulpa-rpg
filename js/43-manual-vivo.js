/* ===================================================================
   TULPA · ETAPA 31 — 📖 Manual Vivo (fonte única da verdade)
   - Camada de texto: MAN31 (t31c.js) + edições do Mestre por campanha
     em campaign_store, chave "manual" (sem tabela nova).
   - Camada viva: vocações, trilhas, rituais, itens, estados, traumas,
     bestiário e regras da mesa são lidos de list29/cur29, os MESMOS
     dados que alimentam fichas e combate (chave "rules"). Editar aqui
     usa o mesmo editor validado da central ⚙️ Alterações do Sistema,
     então fichas, combate e avisos do Perseus seguem o caminho de sempre.
   =================================================================== */
const M31={open:false,q:'',pv:false,camp:'',data:null,fetching:false,edit:null,seen:'',toc:false,scrollAt:0};
T3.man31=M31;
const defMan31=()=>({v:1,rev:0,ed:{},add:[],ttl:{},secs:[],log:[]});
const man31=()=>M31.data||(M31.data=defMan31());
const gm31=()=>{try{return isGM6()&&!!camp3()&&!M31.pv}catch(e){return false}};
const norm31=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const ridm31=()=>'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* ---------- carregar, gravar e transmitir ---------- */
async function fetchMan31(want=0,tries=0){
  const c=camp3();if(!c){M31.data=defMan31();M31.camp='';return}
  if(M31.fetching){M31.again=Math.max(M31.again||0,want||1);return}
  M31.fetching=true;let got=0;
  try{
    const v=await stGet6('manual');if(camp3()?.id!==c.id)return;
    const d={...defMan31(),...(v&&typeof v==='object'?v:{})};got=Number(d.rev)||0;
    const old=M31.camp===c.id?Number(man31().rev)||0:-1;
    if(got>=old||M31.camp!==c.id){M31.data=d;M31.camp=c.id;if(M31.open)paint31(true)}
  }catch(e){console.warn('[T31] ler manual',e);if(M31.camp!==c.id){M31.data=defMan31();M31.camp=c.id}}
  finally{M31.fetching=false}
  if(want&&got<want&&tries<6)setTimeout(()=>fetchMan31(want,tries+1),400+tries*300);
  else if(M31.again){const a=M31.again;M31.again=0;fetchMan31(a>1?a:0)}
}
async function saveMan31(label){
  if(!isGM6()||!camp3()){toast('Somente o Mestre edita o Manual.');return false}
  const D=man31();D.rev=Math.max((Number(D.rev)||0)+1,Date.now());
  D.log=[{at:Date.now(),label:String(label||'').slice(0,120)},...(D.log||[])].slice(0,40);
  try{await stPut6('manual','manual',JSON.parse(JSON.stringify(D)));try{cast6({t:'man31',rev:D.rev,label:String(label||'').slice(0,80)})}catch(e){}
    seenSet31(D.rev);paint31(true);return true}
  catch(e){console.warn('[T31] gravar manual',e);toast('Não consegui salvar o Manual. Tente de novo.');return false}
}
onCast6(p=>{
  if(!p||p.t!=='man31'||p.from===uid3())return;
  fetchMan31(Number(p.rev)||0);
  if(!isGM6())toast('📖 O Mestre atualizou o Manual'+(p.label?': '+String(p.label).slice(0,60):'')+'.');
  setTimeout(badge31,1500);
});
const seenKey31=()=>'tulpa_man_seen_'+(camp3()?.id||'x');
const seenGet31=()=>Number(lsGet6(seenKey31(),0))||0;
function seenSet31(r){try{localStorage.setItem(seenKey31(),JSON.stringify(Number(r)||0))}catch(e){}badge31()}
function badge31(){const n=!!camp3()&&(Number(man31().rev)||0)>seenGet31()&&M31.camp===camp3()?.id;$$('.m31-open').forEach(b=>b.classList.toggle('m31-new',n))}
/* sistema → manual: toda mudança de regras redesenha o manual aberto */
{const _sr31=setRules29;setRules29=function(){const out=_sr31.apply(this,arguments);try{if(M31.open)paint31(true)}catch(e){console.warn('[T31] regras',e)}return out}}

/* ---------- texto: marcação simples, tokens vivos e links cruzados ---------- */
function tokens31(s){
  const mv=(()=>{try{return T3.moveBase?.()||9}catch(e){return 9}})();
  const st=(()=>{try{return Number(typeof AI23!=='undefined'&&AI23.dt)||0}catch(e){return 0}})();
  return regras31(s).replace(/\{\{move\}\}/g,String(mv).replace('.',',')+' m')
    .replace(/\{\{stealthDT\}\}/g,st?`**DT ${st}** (fixa da mesa)`:`**DT = ${E.regra('furtDTBase')} + Percepção do inimigo** (ou DT fixa de mesa)`);
}
/* números das regras no texto: {{r:id}} (valor em vigor), {{carga}} e {{comb}} (fórmulas) */
function regras31(s){
  const f=v=>String(v).replace('.',','),x=v=>v===1?'':f(v)+' × ';
  return String(s).replace(/\{\{r:(\w+)\}\}/g,(m,id)=>{const v=E.regra(id);return v===undefined?m:f(v)})
    .replace(/\{\{carga\}\}/g,()=>`${f(E.regra('cargaBase'))} + ${x(E.regra('cargaPorFor'))}Força (+${f(E.regra('cargaMochila'))} com Mochila ou Maleta)`)
    .replace(/\{\{comb\}\}/g,()=>`${f(E.regra('combBase'))} + ${x(E.regra('combPorCon'))}Constituição`);
}
function refs31(){
  if(M31.refs&&M31.refsAt===M31.renderAt)return M31.refs;
  const m=new Map();
  try{list29('status').filter(r=>r.st!=='del').forEach(r=>m.set(norm31(r.name),{k:'status',key:r.key,n:r.name}))}catch(e){}
  try{list29('ritual').filter(r=>r.st!=='del').forEach(r=>m.set(norm31(r.name.replace(/\s*\(.*\)$/,'')),{k:'ritual',key:r.key,n:r.name}))}catch(e){}
  [['sangramento','sangrando'],['caidos','caido'],['caídos','caido'],['agonia / morrendo','agonia'],['morrendo','agonia'],['desperto','']].forEach(([a,b])=>{if(b&&!m.has(norm31(a)))m.set(norm31(a),{k:'status',key:b,n:a})});
  const names=[...m.keys()].filter(k=>k.length>3).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  M31.refs={m,re:names.length?new RegExp('(^|[^\\p{L}])('+names.join('|')+')(?![\\p{L}])','giu'):null};M31.refsAt=M31.renderAt;
  return M31.refs;
}
function link31(html){
  const R=refs31();if(!R.re)return html;
  /* só nos trechos de texto (fora das tags); o texto é comparado sem acento */
  return html.split(/(<[^>]+>)/).map(part=>{
    if(!part||part[0]==='<')return part;
    const flat=norm31(part);if(flat.length!==part.length)return part;
    let out='',last=0;R.re.lastIndex=0;let m;
    while((m=R.re.exec(flat))){const st=m.index+m[1].length,en=st+m[2].length,e=R.m.get(m[2]);if(!e)continue;
      out+=part.slice(last,st)+`<button type="button" class="m31-ref" data-rk="${e.k}" data-rv="${esc(e.key)}">${part.slice(st,en)}</button>`;last=en}
    return out+part.slice(last);
  }).join('');
}
function inl31(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g,'$1<i>$2</i>')}
function md31(src,{link=true}={}){
  const lines=tokens31(String(src||'')).split('\n');let html='',list=false;
  lines.forEach(l=>{
    const li=l.match(/^\s*-\s+(.*)$/);
    if(li){if(!list){html+='<ul>';list=true}html+=`<li>${inl31(li[1])}</li>`;return}
    if(list){html+='</ul>';list=false}
    if(l.trim())html+=`<p>${inl31(l)}</p>`;
  });
  if(list)html+='</ul>';
  return link?link31(html):html;
}

/* ---------- componentes vivos (lidos dos dados do sistema) ---------- */
const live31=sec=>{try{return list29(sec).filter(r=>r.st!=='del').map(r=>({row:r,v:cur29(sec,r.key)}))}catch(e){console.warn('[T31] dados',sec,e);return[]}};
const gmB31=(sec,key,name)=>gm31()?gmBtns29(sec,key,name):'';
const gmA31=(sec,l)=>gm31()?`<div class="m31-addrow">${gmAdd29(sec,l)}</div>`:'';
const tag31=st=>st==='edit'?'<span class="m31-st edit" title="Alterado pelo Mestre nesta campanha">editado</span>':st==='new'?'<span class="m31-st new" title="Criado pelo Mestre nesta campanha">novo</span>':'';
const tb31=(head,rows,cls='')=>`<div class="m31-tw"><table class="m31-tb ${cls}"><thead><tr>${head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const tr31=(cells,{gm='',key=''}={})=>`<tr class="m31-row"${key?` data-key="${esc(key)}"`:''}>${cells.map((c,i)=>`<td>${c}${i===0&&gm?gm:''}</td>`).join('')}</tr>`;
const cost31=c=>{const n=Number(c);return n>0?`${n} ES`:'Passivo'};
const LIVE31={
  skills(){const sk=(typeof BASE_SKILLS!=='undefined'?BASE_SKILLS:[]).filter(s=>s!=='História');const n=Math.ceil(sk.length/3),cols=[0,1,2].map(i=>sk.slice(i*n,(i+1)*n));
    const rows=[];for(let r=0;r<n;r++)rows.push(`<tr class="m31-row">${cols.map(c=>c[r]?`<td><b>${esc(c[r])}</b></td><td>${esc(SKILL_ATTR[c[r]]||'')}</td>`:'<td></td><td></td>').join('')}</tr>`);
    return tb31(['Perícia','Atributo','Perícia','Atributo','Perícia','Atributo'],rows,'m31-skills')},
  tiers(){const rows=[];for(let s=1;s<=10;s++){const L=E.tierLimits(s);rows.push(tr31([String(s),String(L.five),String(L.ten),String(L.fifteen),L.free10?'+1 perícia sobe direto para +10 (sem gastar escolha de +5)':'—']))}
    return tb31(['Estágio','Escolhas de +5','Mestre (+10)','Maestria (+15)','Regra especial'],rows)},
  stages(){const rows=[];const P={3:'1º (se Desperto)',5:'2º',8:'3º',10:'4º'};for(let s=1;s<=10;s++){const x=STAGES[s]||STAGES[1];rows.push(tr31([String(s),esc(stageName(s)),String(x.vt),String(x.luc),String(x.es),(x.attr?'+':'')+x.attr,P[s]||'—']))}
    return tb31(['Estágio','Título','Vital','Lucidez','Essência','Atributos extras (acum.)','Poder de Trilha'],rows)},
  voc(){const L=live31('voc').sort((a,b)=>String(a.v.name).localeCompare(String(b.v.name),'pt-BR'));
    return gmA31('voc','Vocação')+`<p class="m31-count">${L.length} vocações</p><div class="m31-cards">${L.map(({row,v})=>`<article class="m31-card m31-row" data-key="${esc(row.key)}"><header><h4>${esc(v.name)}</h4>${tag31(row.st)}${gmB31('voc',row.key,v.name)}</header>${v.desc?`<p class="m31-desc">${esc(v.desc)}</p>`:''}<div class="m31-chips">${(v.skills||[]).filter(Boolean).map(s=>`<span class="m31-chip">${esc(s)} +V</span>`).join('')}</div><ul class="m31-tal">${(v.talents||[]).filter(t=>t&&t.name).map(t=>`<li><b>${esc(t.name)}</b> <span class="m31-cost">${cost31(t.cost)}</span><br>${link31(esc(t.desc||''))}</li>`).join('')}</ul></article>`).join('')}</div>`},
  track(b){const L=live31('track').filter(x=>(x.v.archetype||'')===b.arch).sort((a,c)=>String(a.v.name).localeCompare(String(c.v.name),'pt-BR'));
    return gmA31('track','Trilha')+L.map(({row,v})=>{const ars=v.name==='Arsenal Mental';return`<article class="m31-track m31-row" data-key="${esc(row.key)}"><header><h4>${esc(v.name)}</h4>${tag31(row.st)}${gmB31('track',row.key,v.name)}</header>${v.desc?`<p class="m31-desc">${esc(v.desc)}</p>`:''}<ol class="m31-stages">${(v.stages||[]).map((s,i)=>{let c=cost31(s.cost);if(ars&&i<3&&[1,2,4,5,10,20].includes(Number(s.cost)))c=`${[5,10,20][i]} ES · variante ${[1,2,4][i]} ES`;return`<li><span class="m31-stg">Estágio ${esc(String(s.stage))}</span> <b>${esc(s.name||'')}</b> <span class="m31-cost">${c}</span><div>${link31(esc(s.desc||''))}</div></li>`}).join('')}</ol></article>`}).join('')||'<p class="sub">Nenhuma trilha neste arquétipo.</p>'},
  extase(){return tb31(['Bônus','Grupo','Efeito mecânico'],EXTASE_DEFS.map(x=>tr31([`<b>${esc(x.name)}</b>`,esc(x.grp),esc(x.text)])))+'<p class="m31-note">Os bônus de Êxtase são fixos do sistema.</p>'},
  trauma(){const L=live31('trauma');return gmA31('trauma','Trauma')+tb31(['Trauma','Grupo','Penalidade mecânica'],L.map(({row,v})=>tr31([`<b>${esc(v.name)}</b>${tag31(row.st)}`,esc(v.grp||''),esc(v.text||'')],{gm:gmB31('trauma',row.key,v.name),key:row.key})))},
  turn(){const mv=String(T3.moveBase?.()||9).replace('.',',');return tb31(['Recurso','Quantidade','Aplicação'],[
    ['Movimento',`${mv} m por turno`,'Gastos em metros reais no seu turno (configurável de 1 a 60 m por mesa).'],
    ['Ação Padrão','1 por turno','Atacar, arremessar, conjurar ritual, Sutura Bruta, Síntese Cirúrgica, usar perícia ("Outra ação"), Estado de Alerta, levantar-se (Caído), sacar da mochila ou Disparada. (+1 ação por Acerto Violento).'],
    ['Talento','1 por turno','Não gasta Ação Padrão.'],
    ['Saque Rápido','1 por turno','Livre: move arma da cintura/coldre ou bandoleira para as mãos.'],
    ['Ações livres de cena','Livre','Descarte de Emergência (soltar mochila), ligar/desligar lanterna, abrir/fechar porta destrancada, acionar interruptor, declarar Combustão Vital.'],
    ['Reação','Fora do turno','Retaliação (1×/turno) e talentos ou rituais de reação.']].map(r=>tr31([`<b>${esc(r[0])}</b>`,esc(r[1]),link31(esc(r[2]))])))+(gm31()?`<div class="m31-addrow"><button type="button" class="gm29-b gm29-add" data-m31tab="1">⚖ Regras da Mesa</button></div>`:'')},
  dt(){const d=[6,12,18,24,30,36];let f=x=>12;try{f=dtFor14}catch(e){}
    return`<p><b>DT do teste de Arremesso pela distância até o ponto mirado:</b></p>`+tb31(['Distância',...d.map(m=>'até '+m+' m'),'cada 6 m a mais'],[`<tr class="m31-row"><td><b>DT</b></td>${d.map(m=>`<td>${f(m)}</td>`).join('')}<td>+2</td></tr>`])+(gm31()?`<div class="m31-addrow"><button type="button" class="gm29-b gm29-add" data-m31tab="1">⚖ Ajustar DT base (Regras da Mesa)</button></div>`:'')},
  doors(){let dt=12;try{dt=dtDoor22()}catch(e){}return tb31(['Modo','Teste exigido','Onda sonora gerada'],[tr31(['<b>Normal</b>','Nenhum','5 quadrados (7,5 m).']),tr31(['<b>Furtiva</b>',`Destreza + Furtividade (DT ${dt})`,'Sucesso: 1,2 quadrado (~1,8 m). Falha: rangido de 6 + (0,9 × margem da falha) quadrados (máx. 22 quadrados / 33 m).'])])},
  ritual(b){const base=['Natureza','Inexistência','Ilusão','Verdade','Fé',...(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE.map(x=>x.name):[])];
    const L=live31('ritual').filter(x=>b.el==='*'?!base.includes(x.v.element):x.v.element===b.el);
    if(!L.length&&b.el==='*')return'';
    return(b.el==='*'?'':gmA31('ritual','Ritual'))+L.map(({row,v})=>{const lv=v.levels||[v.desc,'',''];return`<article class="m31-rit m31-row rs-host" data-key="${esc(row.key)}"><header>${typeof ritSym32==='function'?ritSym32(v,'lg'):''}<h4>Ritual: ${esc(v.name)}</h4>${tag31(row.st)}${gmB31('ritual',row.key,v.name)}</header><p class="m31-meta">${[['Elemento',v.element],['Execução',v.exec],['Alcance',v.alcance],['Alvo',v.alvo],['Duração',v.dur]].filter(x=>x[1]).map(([k,x])=>`<span><i>${k}:</i> ${esc(x)}</span>`).join('')}</p><dl class="m31-pot">${['Base · 5 ES','Avançada · 10 ES','Próspera · 20 ES'].map((n,i)=>lv[i]?`<dt>${n}</dt><dd>${link31(esc(lv[i]))}</dd>`:'').join('')}</dl></article>`}).join('')},
  subel(){let L=[];try{L=(rules29().subel||[]).filter(x=>!String(x.id).startsWith('sub-'))}catch(e){}
    if(!L.length&&!gm31())return'';
    return`<div class="m31-subel"><h4>Sub-Elementos da campanha</h4>${gmA31('subel','Sub-Elemento')}${L.map(s=>`<p class="m31-row" data-key="${esc(s.id)}"><b>${esc(s.name)}</b> <span class="m31-chip">${esc(s.element||'')}</span>${gmB31('subel',s.id,s.name)} — ${esc(s.desc||'')}</p>`).join('')||'<p class="sub">Nenhum sub-elemento próprio ainda.</p>'}</div>`},
  weapons(){const L=live31('item').filter(x=>String(x.row.key).startsWith('weapon|'));
    const fx=w=>[...(w.effects||[]).map(e=>(STATUS_BY_ID[e.status]?.name||e.status)+(e.when==='crit'?' no crítico':' no acerto')),w.area?'área':'' ].filter(Boolean).join(' · ')||'—';
    return gmA31('item','Item')+tb31(['Arma','Cat.','Peso','Dano','Crít.','Perícia','Efeito'],L.map(({row,v})=>tr31([`<b>${esc(v.name)}</b>${tag31(row.st)}`,esc(v.cat||''),esc(v.peso||''),esc(v.dado||''),(Number(v.critMin)||20)>=20?'20':v.critMin+'–20',esc(v.skill||''),link31(esc(fx(v)))],{gm:gmB31('item',row.key,v.name),key:row.key})).concat(tr31(['<b>Soco (desarmado)</b> <span class="m31-st sys">sistema</span>','Corpo a corpo','Bolso','1d2','20','Briga','—'])),'m31-weap')},
  prot(){const L=live31('item').filter(x=>String(x.row.key).startsWith('prot|'));
    return tb31(['Proteção','Categoria','Peso','Defesa','Encaixe'],L.map(({row,v})=>tr31([`<b>${esc(v.name)}</b>${tag31(row.st)}`,esc(v.cat||''),esc(v.peso||''),'+'+(Number(v.def)||0),esc((SLOT_LABEL[v.slot]||v.slot||'').replace(' (colete/armadura)',''))],{gm:gmB31('item',row.key,v.name),key:row.key})))},
  gear(){const L=live31('item').filter(x=>String(x.row.key).startsWith('gear|'));
    return tb31(['Item','Peso','Cargas iniciais'],L.map(({row,v})=>tr31([`<b>${esc(v.name)}</b>${tag31(row.st)}`,esc(v.peso||''),String(v.qty||1)],{gm:gmB31('item',row.key,v.name),key:row.key})))},
  status(){const L=live31('status');
    const mech=s=>{const a=[];const dot=s.dot?.fixed||s.dot?.dice;if(dot)a.push(`${dot} de dano por turno`);if(s.defense)a.push(`${s.defense>0?'+':''}${s.defense} na Defesa`);if(s.physDice)a.push(`${s.physDice} dado em testes físicos`);const f=new Set(s.flags||[]);if(f.has('semMover'))a.push('movimento 0');if(f.has('semAgir'))a.push('não age');if(f.has('semAtacar'))a.push('não ataca');if(f.has('semDefender'))a.push('sem defesa');if(f.has('semReacao'))a.push('sem reações');if((s.disadv||[]).length)a.push('desvantagem em ataques');return a.join(' · ')};
    return gmA31('status','Estado')+tb31(['Estado','Efeito mecânico oficial','Automação no site'],L.map(({row,v})=>tr31([`<b>${esc(v.name)}</b>${tag31(row.st)}${v.group==='sistema'?' <span class="m31-st sys">sistema</span>':''}`,esc(v.text||''),esc(mech(v))||'—'],{gm:gmB31('status',row.key,v.name),key:row.key})),'m31-status')},
  table(){let t={};try{t=rules29().table||{}}catch(e){}const st=Number(t.dtStealth)||0;
    return`<div class="m31-rules"><h4>Regras desta mesa${gm31()?' <button type="button" class="gm29-b" data-m31tab="1" title="Editar Regras da Mesa">✏️</button>':''}</h4><ul><li>Deslocamento base: <b>${String(Number(t.move)||9).replace('.',',')} m</b> por turno</li><li>DT do Arremesso até 6 m: <b>${Number(t.dtThrow)||12}</b></li><li>DT de Furtividade dos inimigos: <b>${st?st+' (fixa)':E.regra('furtDTBase')+' + Percepção do inimigo'}</b></li></ul></div>`},
  beast(){let L=[];try{L=rules29().beast||[]}catch(e){}
    if(!L.length&&!gm31())return'<p class="m31-note">O Bestiário desta campanha ainda está vazio.</p>';
    return`<h4 class="m31-sub">Bestiário da campanha</h4>${gmA31('beast','Criatura')}<div class="m31-cards">${L.map(b=>`<article class="m31-card m31-row" data-key="${esc(b.id)}"><header><h4>${esc(b.name)}</h4><span class="m31-chip">${esc(b.tier||'Inimigo')}</span>${gmB31('beast',b.id,b.name)}</header><p class="m31-meta"><span><i>Vitalidade:</i> ${esc(String(b.vital??'—'))}</span><span><i>Defesa:</i> ${esc(String(b.def??'—'))}</span><span><i>Ataque:</i> ${esc(String(b.atk??'—'))}</span><span><i>Dano:</i> ${esc(String(b.dano??'—'))}</span></p>${b.skills?`<p>${link31(esc(b.skills))}</p>`:''}${b.notes?`<p class="m31-desc">${esc(b.notes)}</p>`:''}</article>`).join('')}</div>`}
};

/* ---------- blocos de texto com edição do Mestre ---------- */
const bid31=b=>Array.isArray(b)?b[0]:(b&&(b.id||b.glitch))||'';
const btxt31=b=>Array.isArray(b)?b[1]:b.t;
function gmTxt31(id,{edited=false,added=false}={}){
  if(!gm31())return'';
  return`<span class="m31-gm" role="group" aria-label="Mestre: bloco de texto"><button type="button" class="gm29-b" data-m31e="${esc(id)}" title="Editar texto" aria-label="Editar texto">✏️</button><button type="button" class="gm29-b" data-m31a="${esc(id)}" title="Adicionar parágrafo abaixo" aria-label="Adicionar parágrafo abaixo">＋</button><button type="button" class="gm29-b" data-m31d="${esc(id)}" title="Excluir" aria-label="Excluir bloco">🗑️</button>${edited&&!added?`<button type="button" class="gm29-b" data-m31r="${esc(id)}" title="Restaurar o texto original do manual" aria-label="Restaurar original">↺</button>`:''}</span>`;
}
function editor31(id,text){return`<div class="m31-edit" data-ed="${esc(id)}"><label class="sub" for="m31ta">Texto (use **negrito**, *itálico* e linhas começando com "- " para listas; trechos como {{r:db}} mostram o valor em vigor)</label><textarea id="m31ta" rows="${Math.min(14,Math.max(4,String(text).split('\n').length+2))}">${esc(text)}</textarea><div class="m31-edbar"><button type="button" class="btn small primary" data-m31save="${esc(id)}">Salvar no Manual</button><button type="button" class="btn small" data-m31cancel="1">Cancelar</button></div></div>`}
function blockHtml31(b){
  const D=man31();
  if(b&&b.live){const f=LIVE31[b.live];let h='';try{h=f?f(b):''}catch(e){console.warn('[T31] componente',b.live,e);h='<p class="sub">Não consegui montar esta tabela agora.</p>'}return h?`<div class="m31-live" data-live="${esc(b.live)}">${h}</div>`:''}
  if(b&&b.tb)return tb31(b.tb[0],b.tb.slice(1).map(r=>tr31(r.map((c,i)=>i===0?`<b>${esc(c)}</b>`:link31(esc(c))))));
  if(b&&b.f)return`<pre class="m31-f">${esc(tokens31(b.f))}</pre>`;
  const id=bid31(b),ed=D.ed[id];
  if(ed&&ed.del)return gm31()?`<div class="m31-blk m31-gone"><span class="sub">Bloco removido nesta campanha.</span> <button type="button" class="gm29-b" data-m31r="${esc(id)}">↺ Restaurar</button></div>`:'';
  const txt=ed&&ed.t!=null?ed.t:btxt31(b);
  if(M31.edit===id)return editor31(id,txt);
  if(b.box)return`<aside class="m31-aside m31-blk" data-bid="${esc(id)}"><h5>${esc(b.box)}</h5>${md31(txt)}${gmTxt31(id,{edited:!!ed})}</aside>`;
  if(b.glitch)return`<blockquote class="m31-glitch m31-blk" data-bid="${esc(id)}">${md31(txt,{link:false})}${gmTxt31(id,{edited:!!ed})}</blockquote>`;
  return`<div class="m31-blk" data-bid="${esc(id)}">${md31(txt)}${gmTxt31(id,{edited:!!ed})}</div>`;
}
function addsAfter31(id){
  const D=man31();return(D.add||[]).filter(a=>a.after===id).map(a=>{
    const ed=D.ed[a.id];if(ed&&ed.del)return'';
    const txt=ed&&ed.t!=null?ed.t:a.t;
    const self=M31.edit===a.id?editor31(a.id,txt):`<div class="m31-blk m31-added" data-bid="${esc(a.id)}">${md31(txt)}${gmTxt31(a.id,{added:true})}</div>`;
    return self+addsAfter31(a.id);
  }).join('');
}
function secHtml31(s,chap){
  const D=man31(),h=D.ttl[s.id]!=null?D.ttl[s.id]:s.h;
  const blocks=(s.b||[]).map(b=>{const id=bid31(b);return blockHtml31(b)+(id?addsAfter31(id):'')}).join('')+addsAfter31('end:'+s.id);
  if(!blocks.trim()&&s.auto)return'';
  const head=h||M31.edit==='ttl:'+s.id?(M31.edit==='ttl:'+s.id?`<div class="m31-edit" data-ed="ttl:${esc(s.id)}"><label class="sub" for="m31ti">Título da seção</label><input id="m31ti" value="${esc(h)}"><div class="m31-edbar"><button type="button" class="btn small primary" data-m31save="ttl:${esc(s.id)}">Salvar título</button><button type="button" class="btn small" data-m31cancel="1">Cancelar</button></div></div>`:`<h3 class="m31-h3">${esc(h)}${gm31()?`<button type="button" class="gm29-b m31-gm" data-m31t="${esc(s.id)}" title="Renomear seção" aria-label="Renomear seção">✏️</button>`:''}</h3>`):'';
  const tail=gm31()?`<div class="m31-addrow m31-gm"><button type="button" class="gm29-b gm29-add" data-m31a="end:${esc(s.id)}">＋ Parágrafo no fim da seção</button></div>`:'';
  return`<section class="m31-sec" id="m31-${esc(s.id)}" data-sec="${esc(s.id)}">${head}${blocks}${tail}</section>`;
}
function chapters31(){
  const D=man31();
  return MAN31.map(c=>({...c,secs:[...c.secs,...(D.secs||[]).filter(x=>x.chap===c.id).map(x=>({id:x.id,h:x.h,b:[],custom:1}))]}));
}
function content31(){
  const D=man31();
  return chapters31().map(c=>{const h=D.ttl[c.id]!=null?D.ttl[c.id]:c.h;
    const secs=c.secs.map(s=>secHtml31(s,c)).join('');
    return`<section class="m31-chap" id="m31-${esc(c.id)}" data-chap="${esc(c.id)}">${c.id==='intro'?'':`<h2 class="m31-h2">${esc(h)}${gm31()?`<button type="button" class="gm29-b m31-gm" data-m31t="${esc(c.id)}" title="Renomear capítulo" aria-label="Renomear capítulo">✏️</button>`:''}</h2>`}${secs}${gm31()&&c.id!=='intro'?`<div class="m31-addrow m31-gm"><button type="button" class="gm29-b gm29-add" data-m31ns="${esc(c.id)}">＋ Nova seção neste capítulo</button></div>`:''}</section>`}).join('');
}
function toc31(){
  const D=man31();
  return`<ol class="m31-toc">${chapters31().filter(c=>c.id!=='intro').map(c=>{const h=D.ttl[c.id]!=null?D.ttl[c.id]:c.h;const secs=c.secs.filter(s=>(D.ttl[s.id]!=null?D.ttl[s.id]:s.h));
    return`<li data-tc="${esc(c.id)}"><details><summary><a href="#m31-${esc(c.id)}" data-go="${esc(c.id)}">${esc(h)}</a></summary>${secs.length?`<ol>${secs.map(s=>`<li data-ts="${esc(s.id)}"><a href="#m31-${esc(s.id)}" data-go="${esc(s.id)}">${esc(D.ttl[s.id]!=null?D.ttl[s.id]:s.h)}</a></li>`).join('')}</ol>`:''}</details></li>`}).join('')}</ol>`;
}

/* ---------- janela ---------- */
function shell31(){
  let w=$('man31');if(w)return w;
  w=document.createElement('div');w.id='man31';w.className='man31 hide';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Manual do Sistema');
  w.innerHTML=`<div class="m31-box">
    <header class="m31-top">
      <button type="button" class="btn small m31-tocbtn" id="m31toc" aria-expanded="false" aria-controls="m31nav">☰ Sumário</button>
      <div class="m31-ttl"><h1>📖 ${esc(MAN31_TITLE)}</h1><p class="sub">${esc(MAN31_SUB)}</p></div>
      <div class="m31-tools">
        <label class="m31-search"><span class="sr-only">Buscar no Manual</span><input type="search" id="m31q" placeholder="Buscar ritual, estado, vocação, item ou regra…" autocomplete="off"></label>
        <span class="m31-hits sub" id="m31hits" aria-live="polite"></span>
        <label class="t3-switch m31-pvsw hide" id="m31pvw"><input type="checkbox" id="m31pv"><span>👁️ Pré-visualizar como Player</span></label>
        <button type="button" class="btn small" id="m31print" title="Gera um PDF com o conteúdo atual (use Salvar como PDF na janela de impressão)">📥 <span class="m31-pl">Baixar </span>PDF<span class="m31-pl"> Atualizado</span></button>
        <button type="button" class="btn small" id="m31x">Fechar</button>
      </div>
    </header>
    <div class="m31-body">
      <nav class="m31-nav" id="m31nav" aria-label="Sumário do Manual"></nav>
      <div class="m31-main" id="m31main" tabindex="-1"><div class="m31-paper"><div class="m31-cover"><p class="m31-eyebrow">Sistema de Interpretação Teosófica &amp; Realista</p><h1>${esc(MAN31_TITLE)}</h1><p class="m31-coversub">${esc(MAN31_SUB)}</p><p class="m31-camp sub" id="m31camp"></p></div><div id="m31content"></div></div></div>
    </div>
  </div><div class="m31-pop hide" id="m31pop" role="tooltip"></div>`;
  document.body.append(w);
  $('m31x').onclick=close31;
  w.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('m31pop').classList.contains('hide')){pop31(null);return}if($('sys29')&&!$('sys29').classList.contains('hide'))return;close31()}});
  $('m31toc').onclick=()=>{M31.toc=!M31.toc;w.classList.toggle('m31-tocopen',M31.toc);$('m31toc').setAttribute('aria-expanded',String(M31.toc))};
  let qt=0;$('m31q').oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{M31.q=e.target.value.trim();paint31(!M31.q);const f=$q('#m31content mark.m31-hl');if(f)f.scrollIntoView({block:'center'});else if(M31.q)$('m31main').scrollTop=0},140)};
  $('m31pv').onchange=e=>{M31.pv=e.target.checked;M31.edit=null;paint31(true)};
  $('m31print').onclick=print31;
  $('m31nav').addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();go31(a.dataset.go);if(innerWidth<900){M31.toc=false;w.classList.remove('m31-tocopen');$('m31toc').setAttribute('aria-expanded','false')}});
  const main=$('m31main');
  main.addEventListener('click',click31);
  main.addEventListener('mouseover',e=>{const r=e.target.closest('.m31-ref');if(r&&matchMedia('(hover:hover)').matches)pop31(r)});
  main.addEventListener('mouseout',e=>{const r=e.target.closest('.m31-ref');if(r&&!e.relatedTarget?.closest?.('.m31-pop')&&matchMedia('(hover:hover)').matches)setTimeout(()=>{if(!$('m31pop').matches(':hover'))pop31(null)},120)});
  main.addEventListener('scroll',()=>{const n=Date.now();if(n-M31.scrollAt<120)return;M31.scrollAt=n;spy31()},{passive:true});
  $('m31pop').addEventListener('mouseleave',()=>pop31(null));
  return w;
}
function open31(target){
  const w=shell31();M31.open=true;w.classList.remove('hide');document.body.classList.add('m31-on');base31(w);
  const c=camp3();
  if(c&&M31.camp!==c.id){M31.data=null;M31.camp=c.id;fetchMan31()}else if(c)fetchMan31();
  if(!c){M31.data=defMan31();M31.camp=''}
  if(c&&isGM6()){try{fetchRules29?.(false)}catch(e){}}
  paint31();
  setTimeout(()=>{$('m31main')?.focus({preventScroll:true});if(target)go31(target)},30);
}
/* algumas estéticas usam painel translúcido (vidro): o manual ganha uma base sólida da mesma família de cor */
function base31(w){
  try{const cs=getComputedStyle(document.body),bg=cs.backgroundColor,m=bg.match(/rgba?\(([^)]+)\)/);let base='';
    if(m){const p=m[1].split(',').map(Number);if(p.length<4||p[3]>=.95)base=bg}
    if(!base){const t=cs.color.match(/\d+/g)?.map(Number)||[230,230,230];const lum=(t[0]*.299+t[1]*.587+t[2]*.114);base=lum>140?'#14171d':'#f7f4ee'}
    w.style.setProperty('--m31-base',base)}catch(e){}
}
function close31(){M31.open=false;M31.edit=null;pop31(null);$('man31')?.classList.add('hide');document.body.classList.remove('m31-on');if(camp3())seenSet31(man31().rev)}
T3.manualOpen=open31;T3.manualClose=close31;
function paint31(keep){
  const w=$('man31');if(!w||!M31.open)return;
  M31.renderAt=Date.now();
  const main=$('m31main'),top=keep?main.scrollTop:0;
  const isM=isGM6()&&!!camp3();
  $('m31pvw').classList.toggle('hide',!isM);$('m31pv').checked=M31.pv;
  w.classList.toggle('m31-gmmode',gm31());
  const c=camp3();$('m31camp').textContent=c?`Campanha: ${c.name||''}${isM?(gm31()?' · Mestre (edição ligada)':' · pré-visualização de Player'):''}`:'Manual base (entre numa campanha para ver as regras da sua mesa)';
  $('m31content').innerHTML=content31();
  $('m31nav').innerHTML=toc31();
  try{bindGm29($('m31content'))}catch(e){}
  if(M31.q)search31(true);else $('m31hits').textContent='';
  main.scrollTop=top;spy31();
  if(M31.edit){const t=$('m31ta')||$('m31ti');if(t){t.focus();t.scrollIntoView?.({block:'center'})}}
}
function go31(id){const el=$('m31-'+id);if(!el)return;const main=$('m31main');const y=el.getBoundingClientRect().top-main.getBoundingClientRect().top+main.scrollTop;main.scrollTo({top:y-12,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});el.classList.add('m31-flash');setTimeout(()=>el.classList.remove('m31-flash'),1200)}
function spy31(){
  const main=$('m31main');if(!main)return;const y=main.scrollTop+80;let cur='';
  $$('.m31-sec,.m31-chap',main).forEach(s=>{if(s.offsetTop<=y&&!s.classList.contains('m31-hid'))cur=s.dataset.sec||s.dataset.chap||cur});
  $$('#m31nav a').forEach(a=>a.classList.toggle('on',a.dataset.go===cur));
}

/* ---------- busca instantânea com destaque ---------- */
function search31(silent){
  const main=$('m31content');if(!main)return;
  if(!silent){paint31(true);return}
  const q=norm31(M31.q);let hits=0;
  $$('mark.m31-hl',main).forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
  if(!q){$$('.m31-hid',main).forEach(e=>e.classList.remove('m31-hid'));$('m31hits').textContent='';$$('#m31nav li').forEach(l=>l.classList.remove('m31-dim'));return}
  const has=el=>norm31(el.textContent).includes(q);
  $$('.m31-sec',main).forEach(sec=>{
    const rows=$$('.m31-row',sec),head=$q('.m31-h3',sec);
    let any=false;
    if(rows.length){let n=0;rows.forEach(r=>{const ok=has(r);r.classList.toggle('m31-hid',!ok);if(ok)n++});any=n>0;
      const txt=$$('.m31-blk',sec).some(has)||(head&&has(head));if(!any&&txt){rows.forEach(r=>r.classList.remove('m31-hid'));any=true}}
    else any=has(sec);
    sec.classList.toggle('m31-hid',!any);
  });
  $$('.m31-chap',main).forEach(c=>c.classList.toggle('m31-hid',!$$('.m31-sec',c).some(s=>!s.classList.contains('m31-hid'))));
  /* destaque nos textos visíveis */
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('.m31-hid,textarea,input,.m31-gm,.gm29,button.gm29-b,script,style'))return NodeFilter.FILTER_REJECT;return norm31(n.nodeValue).includes(q)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{const v=n.nodeValue,f=norm31(v);if(f.length!==v.length)return;const frag=document.createDocumentFragment();let i=0,j;
    while((j=f.indexOf(q,i))>=0){frag.append(v.slice(i,j));const m=document.createElement('mark');m.className='m31-hl';m.textContent=v.slice(j,j+q.length);frag.append(m);hits++;i=j+q.length}
    frag.append(v.slice(i));n.replaceWith(frag)});
  $('m31hits').textContent=hits?`${hits} resultado${hits>1?'s':''}`:'Nada encontrado';
  $$('#m31nav [data-ts],#m31nav [data-tc]').forEach(l=>{const id=l.dataset.ts||l.dataset.tc,el=$('m31-'+id);l.classList.toggle('m31-dim',!!el&&el.classList.contains('m31-hid'))});
}

/* ---------- links cruzados: resumo rápido sem sair da página ---------- */
function refBody31(k,key){
  try{
    if(k==='status'){const s=cur29('status',key);const dot=s.dot?.fixed||s.dot?.dice;return`<b>${esc(s.name)}</b><span class="m31-pk">Estado</span><p>${esc(s.text||'')}</p>${s.narr?`<p class="m31-narr">“${esc(s.narr)}”</p>`:''}${dot?`<p class="sub">Dano por turno: ${esc(String(dot))}</p>`:''}`}
    if(k==='ritual'){const r=cur29('ritual',key);return`${typeof ritSym32==='function'?ritSym32(r,'md',{cls:'rs-pop'}):''}<b>${esc(r.name)}</b><span class="m31-pk">Ritual · ${esc(r.element||'')}</span><p class="sub">${esc([r.exec,r.alcance,r.dur].filter(Boolean).join(' · '))}</p><p>${esc((r.levels||[r.desc])[0]||'')}</p>`}
    if(k==='trauma'){const t=cur29('trauma',key);return`<b>${esc(t.name)}</b><span class="m31-pk">Trauma · ${esc(t.grp||'')}</span><p>${esc(t.text||'')}</p>`}
  }catch(e){}
  return'';
}
function pop31(el){
  const p=$('m31pop');if(!p)return;
  if(!el){p.classList.add('hide');M31.popFor=null;return}
  const h=refBody31(el.dataset.rk,el.dataset.rv);if(!h){p.classList.add('hide');return}
  M31.popFor=el;p.innerHTML=h+(el.dataset.rk!=='trauma'?`<button type="button" class="btn small" data-popgo="${el.dataset.rk}">Ver na tabela</button>`:'');
  p.classList.remove('hide');
  const r=el.getBoundingClientRect(),pw=Math.min(340,innerWidth-24);p.style.width=pw+'px';
  let x=Math.max(12,Math.min(innerWidth-pw-12,r.left+r.width/2-pw/2)),y=r.bottom+8;
  const ph=p.offsetHeight;if(y+ph>innerHeight-12)y=Math.max(12,r.top-ph-8);
  p.style.left=x+'px';p.style.top=y+'px';
  const g=p.querySelector('[data-popgo]');if(g)g.onclick=()=>{const k=el.dataset.rk,v=el.dataset.rv;pop31(null);const sec=k==='status'?'c10.1':null;
    if(k==='ritual'){const row=$q(`.m31-rit[data-key="${CSS.escape(v)}"]`);if(row){row.scrollIntoView({block:'center'});row.classList.add('m31-flash');setTimeout(()=>row.classList.remove('m31-flash'),1200)}return}
    if(sec){go31(sec);setTimeout(()=>{const row=$q(`#m31-${CSS.escape(sec)} tr[data-key="${CSS.escape(v)}"]`);if(row){row.scrollIntoView({block:'center'});row.classList.add('m31-flash');setTimeout(()=>row.classList.remove('m31-flash'),1200)}},350)}};
}
document.addEventListener('click',e=>{if(!M31.open)return;const p=$('m31pop');if(p&&!p.classList.contains('hide')&&!e.target.closest('.m31-pop,.m31-ref'))pop31(null)},true);

/* ---------- cliques do Mestre (texto) e links ---------- */
async function click31(e){
  const t=e.target;
  const ref=t.closest('.m31-ref');if(ref){e.preventDefault();if(M31.popFor===ref&&!$('m31pop').classList.contains('hide'))pop31(null);else pop31(ref);return}
  const tab=t.closest('[data-m31tab]');if(tab){try{open29('table')}catch(err){}return}
  if(!gm31()&&!t.closest('[data-m31cancel]'))return;
  const D=man31();
  const ed=t.closest('[data-m31e]');if(ed){M31.edit=ed.dataset.m31e;paint31(true);return}
  const ti=t.closest('[data-m31t]');if(ti){M31.edit='ttl:'+ti.dataset.m31t;paint31(true);return}
  const ad=t.closest('[data-m31a]');if(ad){const id=ridm31();D.add=D.add||[];D.add.push({id,after:ad.dataset.m31a,t:''});M31.edit=id;M31.newId=id;paint31(true);return}
  const ns=t.closest('[data-m31ns]');if(ns){const h=prompt('Título da nova seção:','Nova seção');if(!h||!h.trim())return;const id=ridm31();D.secs=D.secs||[];D.secs.push({id,chap:ns.dataset.m31ns,h:h.trim().slice(0,120)});await saveMan31('Nova seção: '+h.trim());return}
  const de=t.closest('[data-m31d]');if(de){const id=de.dataset.m31d;if(!confirm('Excluir este bloco do Manual desta campanha? Texto original do manual pode ser restaurado depois.'))return;
    const me=(D.add||[]).find(a=>a.id===id);
    if(me){D.add.forEach(a=>{if(a.after===id)a.after=me.after});D.add=D.add.filter(a=>a.id!==id);delete D.ed[id]}
    else D.ed[id]={del:1};
    await saveMan31('Bloco removido');return}
  const rs=t.closest('[data-m31r]');if(rs){delete D.ed[rs.dataset.m31r];await saveMan31('Texto restaurado');return}
  if(t.closest('[data-m31cancel]')){if(M31.newId){D.add=(D.add||[]).filter(a=>!(a.id===M31.newId&&!a.t));M31.newId=null}M31.edit=null;paint31(true);return}
  const sv=t.closest('[data-m31save]');if(sv){const id=sv.dataset.m31save;
    if(id.startsWith('ttl:')){const v=($('m31ti')?.value||'').trim().slice(0,140);if(!v){toast('O título não pode ficar vazio.');return}D.ttl[id.slice(4)]=v;M31.edit=null;await saveMan31('Título: '+v);return}
    const v=($('m31ta')?.value||'').replace(/\r/g,'').trim();
    if(!v){toast('Escreva o texto ou use 🗑️ para excluir.');return}
    if(v.length>6000){toast('Texto muito longo (máximo 6000 caracteres por bloco).');return}
    const a=(D.add||[]).find(x=>x.id===id);if(a){a.t=v;delete D.ed[id]}else D.ed[id]={t:v};
    M31.edit=null;M31.newId=null;
    const sec=$q(`[data-ed="${CSS.escape(id)}"]`)?.closest('.m31-sec');const h=sec?$q('.m31-h3',sec)?.textContent:'';
    await saveMan31(h||'Texto do Manual');return}
}

/* ---------- PDF atualizado (impressão limpa) ---------- */
function print31(){
  if(M31.q){M31.q='';$('m31q').value='';paint31(true)}
  M31.edit=null;const pv=M31.pv;M31.pv=true;paint31(true);
  $$('#man31 details').forEach(d=>d.open=true);
  document.body.classList.add('m31-print');
  const done=()=>{document.body.classList.remove('m31-print');M31.pv=pv;paint31(true);removeEventListener('afterprint',done)};
  addEventListener('afterprint',done);
  setTimeout(()=>{try{window.print()}catch(e){done()}},60);
}

/* ---------- botões de entrada ---------- */
function entry31(){
  $$('.t3-themewrap.in-top').forEach(w=>{if(w.querySelector('.m31-open'))return;const b=document.createElement('button');b.type='button';b.className='btn small ghost m31-open t31-top';b.innerHTML='<span aria-hidden="true">📖</span> Manual';b.title='Manual do Sistema';b.onclick=()=>open31();w.prepend(b)});
  const grid=$q('#campaignHub .portal-grid');
  if(grid&&!$('openMan31')){const b=document.createElement('button');b.className='portal-card m31-card m31-open';b.id='openMan31';b.innerHTML='<div class="symbol">📖</div><h2>Manual do Sistema</h2><p>Regras, catálogos e lore da campanha, sempre atualizados com o que vale na mesa.</p>';b.onclick=()=>open31();grid.prepend(b)}
  badge31();
}
setTimeout(entry31,0);setTimeout(entry31,1600);setInterval(()=>{try{entry31()}catch(e){}},2500);
M6.hooks.leave.push(()=>{if(M31.open)close31();M31.data=null;M31.camp=''});
T3.manualDbg={md31,refs31,search31,fetchMan31,saveMan31,LIVE31,man31};
console.info('[Tulpa] Etapa 31 carregada (Manual Vivo)');

