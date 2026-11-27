/* ===================================================================
   TULPA · ETAPA 31b — Tabelas editáveis do Manual Vivo
   - Perícias, Escolhas por estágio, Estágios (Vital/Lucidez/Essência),
     Êxtase e todas as tabelas de referência passam a ser editáveis
     pelo Mestre dentro do Manual.
   - As alterações ficam no mesmo registro do Manual (campaign_store,
     chave "manual", campo tbl) e são APLICADAS NO MOTOR do site
     (STAGES, SKILL_ATTR/BASE_SKILLS, E.tierLimits, EXTASE_DEFS) para
     todos os jogadores da campanha, em tempo real.
   =================================================================== */
const TB31={sig:'',names:{}};
const SN31=stageName;
const PRI31={
  stages:JSON.parse(JSON.stringify(STAGES)),
  skills:BASE_SKILLS.filter(s=>s!=='História').map(s=>[s,SKILL_ATTR[s]]),
  extase:EXTASE_DEFS.map(x=>({...x})),
  tier:E.tierLimits
};
const PW31={3:'1º (se Desperto)',5:'2º',8:'3º',10:'4º'};
/* numera as tabelas e fórmulas estáticas para poderem ser editadas */
const TBMAP31={};
MAN31.forEach(c=>(c.secs||[]).forEach(s=>{let t=0,f=0;(s.b||[]).forEach(b=>{if(!b||Array.isArray(b))return;if(b.tb){b.id=b.id||s.id+'.t'+(++t);TBMAP31[b.id]=b}else if(b.f!=null){b.id=b.id||s.id+'.f'+(++f)}})}));
const TURN31={head:['Recurso','Quantidade','Aplicação'],rows:[
  ['Movimento','{{move}} por turno','Gastos em metros reais no seu turno (configurável de 1 a 60 m por mesa).'],
  ['Ação Padrão','1 por turno','Atacar, arremessar, conjurar ritual, manobra corpo a corpo, Guarda Fechada, Fogo de Supressão, pegar item do chão, Sutura Bruta, Síntese Cirúrgica, usar perícia ("Outra ação"), Estado de Alerta, levantar-se (Caído), sacar da mochila ou Disparada. (+1 ação por Acerto Violento).'],
  ['Talento','1 por turno','Não gasta Ação Padrão.'],
  ['Saque Rápido','1 por turno','Livre: move arma da cintura/coldre ou bandoleira para as mãos.'],
  ['Ações livres de cena','Livre','Descarte de Emergência (soltar mochila), ligar/desligar lanterna, abrir/fechar porta destrancada, acionar interruptor, declarar Combustão Vital.'],
  ['Reação','1 por rodada','Bloqueio, Mergulho ou ritual de reação; volta no início do seu turno. Retaliação (1×/turno) e Contra-Ataque são ações extras à parte.']]};
const DOORS31={head:['Modo','Teste exigido','Onda sonora gerada'],rows:[
  ['Normal','Nenhum','5 quadrados (7,5 m).'],
  ['Furtiva','Destreza + Furtividade (DT {{doorDT}})','Sucesso: 1,2 quadrado (~1,8 m). Falha: rangido de 6 + (0,9 × margem da falha) quadrados (máx. 22 quadrados / 33 m).']]};
const tbl31=()=>(M31.data&&M31.data.tbl)||{};
const ensTbl31=()=>{const D=man31();D.tbl=D.tbl||{};return D.tbl};
const isNum31=v=>v!==''&&v!=null&&Number.isFinite(Number(v));
const int31=(v,lo,hi)=>isNum31(v)&&Number.isInteger(Number(v))&&Number(v)>=lo&&Number(v)<=hi;

/* ---------- aplicar no motor ---------- */
function applyTbl31(force){
  const T=tbl31(),sig=JSON.stringify(T);
  if(!force&&sig===TB31.sig)return false;
  TB31.sig=sig;
  Object.keys(STAGES).forEach(k=>delete STAGES[k]);
  Object.entries(PRI31.stages).forEach(([k,v])=>{STAGES[k]={...v}});
  TB31.names={};
  for(let n=1;n<=10;n++){
    const o=(T.stages||{})[n],t=(T.tiers||{})[n];
    if(o){['vt','luc','es','attr'].forEach(f=>{if(isNum31(o[f]))STAGES[n][f]=Number(o[f])});if(o.name)TB31.names[n]=String(o.name)}
    if(t&&isNum31(t.five))STAGES[n].extra=Number(t.five);
  }
  stageName=n=>TB31.names[n]||SN31(n);
  E.tierLimits=s=>{s=Number(s)||1;const L=PRI31.tier(s),o=(T.tiers||{})[s];if(!o)return L;const g=(v,d)=>isNum31(v)?Number(v):d;return{five:L.five,ten:g(o.ten,L.ten),fifteen:g(o.fifteen,L.fifteen),free10:g(o.free10,L.free10)}};
  const SK=T.skills&&T.skills.length?T.skills.map(r=>[r.n,r.a]):PRI31.skills;
  BASE_SKILLS.length=0;Object.keys(SKILL_ATTR).forEach(k=>delete SKILL_ATTR[k]);
  SK.forEach(([n,a])=>{BASE_SKILLS.push(n);SKILL_ATTR[n]=a});
  const byId=Object.fromEntries(PRI31.extase.map(x=>[x.id,x]));
  const EX=T.extase&&T.extase.length?T.extase.map(x=>{const b=byId[x.id]||{};const o={id:x.id,name:x.name,grp:x.grp,text:x.text};if(b.flags)o.flags=b.flags;if(x.dice&&Object.keys(x.dice).length)o.skillDice=x.dice;if(x.flat&&Object.keys(x.flat).length)o.skillFlat=x.flat;return o}):PRI31.extase.map(x=>({...x}));
  EXTASE_DEFS.length=0;EX.forEach(x=>EXTASE_DEFS.push(x));
  Object.keys(EXTASE_BY_ID).forEach(k=>delete EXTASE_BY_ID[k]);EXTASE_DEFS.forEach(x=>{EXTASE_BY_ID[x.id]=x});
  if(!force){try{T3.refresh()}catch(e){}}
  return true;
}
{const _p=paint31;paint31=function(){try{applyTbl31()}catch(e){console.warn('[T31] aplicar tabelas',e)}return _p.apply(this,arguments)}}
{const _f=fetchMan31;fetchMan31=async function(){const r=await _f.apply(this,arguments);try{applyTbl31()}catch(e){console.warn('[T31] aplicar tabelas',e)}return r}}
setInterval(()=>{try{const c=camp3();if(c&&M31.camp!==c.id&&!M31.fetching&&!M31.open)fetchMan31()}catch(e){}},2500);
M6.hooks.leave.push(()=>{M31.tg=null;try{applyTbl31(true)}catch(e){}TB31.sig=''});

/* ---------- células e tabelas de texto ---------- */
const cellTok31=s=>{let dt=12;try{dt=dtDoor22()}catch(e){}const mv=(()=>{try{return T3.moveBase?.()||9}catch(e){return 9}})();
  return regras31(s).replace(/\{\{move\}\}/g,String(mv).replace('.',',')+' m').replace(/\{\{doorDT\}\}/g,String(dt))};
const rowsHtml31=rows=>rows.map(r=>tr31(r.map((c,i)=>i===0?`<b>${esc(cellTok31(c))}</b>`:link31(esc(cellTok31(c))))));
const bar31=(kind,over,extra='')=>gm31()?`<div class="m31-addrow m31-gm m31-tbbar"><button type="button" class="gm29-b gm29-add" data-g="open:${esc(kind)}">✏️ Editar tabela</button>${over?'<span class="m31-st edit" title="Alterada pelo Mestre nesta campanha">editada</span>':''}${extra}</div>`:'';
const ovTb31=id=>(tbl31().tb||{})[id];
const tbEff31=(id,def)=>{const o=ovTb31(id);return o?{head:o.head,rows:o.rows}:def};

/* ---------- editor de grade ---------- */
const COLS31={
  skills:[{k:'n',l:'Perícia',t:'text'},{k:'a',l:'Atributo',t:'sel',o:()=>ATTRS}],
  tiers:[{k:'s',l:'Estágio',t:'ro'},{k:'five',l:'Escolhas de +5',t:'num'},{k:'ten',l:'Mestre (+10)',t:'num'},{k:'fifteen',l:'Maestria (+15)',t:'num'},{k:'free10',l:'+10 direto (sem gastar +5)',t:'num'}],
  stages:[{k:'s',l:'Estágio',t:'ro'},{k:'name',l:'Título',t:'text'},{k:'vt',l:'Vital',t:'num'},{k:'luc',l:'Lucidez',t:'num'},{k:'es',l:'Essência',t:'num'},{k:'attr',l:'Atributos extras (acum.)',t:'num'},{k:'pw',l:'Poder de Trilha',t:'text'}],
  extase:[{k:'name',l:'Bônus',t:'text'},{k:'grp',l:'Grupo',t:'sel',o:()=>['Combate','Fora de combate']},{k:'text',l:'Efeito mecânico',t:'text'},{k:'dice',l:'+dados automáticos (ex.: Briga +1)',t:'text'},{k:'flat',l:'+fixo automático (ex.: Intuição +10)',t:'text'}]
};
const LBL31={skills:'Perícias',tiers:'Escolhas por estágio',stages:'Estágios',extase:'Bônus de Êxtase'};
const fmtSk31=o=>Object.entries(o||{}).map(([k,v])=>`${k} ${v>=0?'+':''}${v}`).join(', ');
function parseSk31(s,names){
  const out={};s=String(s||'').trim();if(!s)return{v:out};
  for(const part of s.split(/[,;]/).map(x=>x.trim()).filter(Boolean)){
    const m=part.match(/^(.+?)\s*([+-]?\d+)$/);if(!m)return{err:`"${part}" deve ser "Perícia +N"`};
    const nm=names.find(n=>norm31(n)===norm31(m[1]));if(!nm)return{err:`Perícia "${m[1].trim()}" não existe`};
    out[nm]=Number(m[2]);
  }
  return{v:out};
}
function open31g(kind){
  const T=tbl31();let g;
  if(kind==='skills')g={kind,free:0,canAdd:1,canDel:1,cols:COLS31.skills,rows:BASE_SKILLS.map(s=>({n:s,a:SKILL_ATTR[s],o:s}))};
  else if(kind==='tiers')g={kind,cols:COLS31.tiers,rows:Array.from({length:10},(_,i)=>{const n=i+1,L=E.tierLimits(n);return{s:String(n),five:String(L.five),ten:String(L.ten),fifteen:String(L.fifteen),free10:String(L.free10)}})};
  else if(kind==='stages')g={kind,cols:COLS31.stages,rows:Array.from({length:10},(_,i)=>{const n=i+1,x=STAGES[n];const pw=(T.stages||{})[n]&&(T.stages[n].pw!=null)?T.stages[n].pw:(PW31[n]||'');return{s:String(n),name:stageName(n),vt:String(x.vt),luc:String(x.luc),es:String(x.es),attr:String(x.attr),pw}})};
  else if(kind==='extase')g={kind,canAdd:1,canDel:1,cols:COLS31.extase,rows:EXTASE_DEFS.map(x=>({id:x.id,name:x.name,grp:x.grp,text:x.text,dice:fmtSk31(x.skillDice),flat:fmtSk31(x.skillFlat)}))};
  else{ /* tabela livre: tb:<id> ou live:turn / live:doors */
    const id=kind.slice(kind.indexOf(':')+1);
    const def=kind==='live:turn'?TURN31:kind==='live:doors'?DOORS31:(TBMAP31[id]?{head:TBMAP31[id].tb[0],rows:TBMAP31[id].tb.slice(1)}:null);
    if(!def)return;const e=tbEff31(kind,def);
    g={kind,free:1,canAdd:1,canDel:1,canCols:1,head:e.head.slice(),cols:e.head.map((h,j)=>({k:j,t:'text'})),rows:e.rows.map(r=>{const o={};r.forEach((c,j)=>o[j]=c);return o})};
  }
  M31.tg=g;paint31(true);setTimeout(()=>{$q('#m31content .m31-grid')?.scrollIntoView({block:'center'})},30);
}
const tgOn31=k=>gm31()&&M31.tg&&M31.tg.kind===k?M31.tg:null;
function gridEd31(g){
  const th=g.free?g.cols.map((c,j)=>`<th><div class="m31-gh"><input data-gh="${j}" value="${esc(g.head[j]||'')}" aria-label="Título da coluna ${j+1}">${g.cols.length>1?`<button type="button" class="gm29-b" data-g="delc:${j}" title="Remover coluna" aria-label="Remover coluna ${j+1}">🗑️</button>`:''}</div></th>`).join(''):g.cols.map(c=>`<th scope="col">${esc(c.l)}</th>`).join('');
  const body=g.rows.map((r,i)=>`<tr data-gi="${i}">${g.cols.map(c=>{const v=r[c.k]==null?'':r[c.k];
    const inp=c.t==='ro'?`<b>${esc(v)}</b>`:c.t==='sel'?`<select data-gk="${esc(c.k)}" aria-label="${esc(c.l||'')}">${c.o().map(o=>`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}</select>`:c.t==='num'?`<input type="number" step="1" data-gk="${esc(c.k)}" value="${esc(v)}" aria-label="${esc(c.l||'')}">`:`<textarea rows="${Math.max(1,Math.min(5,Math.ceil(String(v).length/(g.free?28:34))))}" data-gk="${esc(c.k)}" aria-label="${esc(c.l||'Célula')}">${esc(v)}</textarea>`;
    return`<td>${inp}</td>`}).join('')}<td class="m31-gdel">${g.canDel?`<button type="button" class="gm29-b" data-g="del:${i}" title="Remover linha" aria-label="Remover linha ${i+1}">🗑️</button>`:''}</td></tr>`).join('');
  const hint=g.hint||{skills:'Edite o atributo de cada perícia, adicione novas ou remova. Perícias removidas deixam de aparecer nas fichas.',tiers:'Quantas perícias cada estágio pode ter em +5, Mestre (+10) e Maestria (+15). A coluna da direita sobe uma perícia direto para +10.',stages:'Valores máximos de Vital, Lucidez e Essência por estágio. Os máximos mudam na hora nas fichas e na mesa.',extase:'Os campos de "+dados" e "+fixo" aplicam o bônus automaticamente nos testes. Deixe vazios para bônus só narrativos.'}[g.kind]||'Edite as células, adicione ou remova linhas e colunas. Use {{move}} para o deslocamento da mesa.';
  return`<div class="m31-gridwrap"><p class="sub m31-ghint">${esc(hint)}</p><div class="m31-tw"><table class="m31-tb m31-grid"><thead><tr>${th}<th class="m31-gdel"></th></tr></thead><tbody>${body}</tbody></table></div>
    <div class="m31-edbar m31-gbar">${g.canAdd?'<button type="button" class="btn small" data-g="add">＋ Linha</button>':''}${g.canCols?'<button type="button" class="btn small" data-g="addc">＋ Coluna</button>':''}<button type="button" class="btn small primary" data-g="save">Salvar tabela</button><button type="button" class="btn small" data-g="cancel">Cancelar</button><button type="button" class="btn small" data-g="reset" title="Volta ao padrão do Manual Oficial">↺ Restaurar original</button></div>
    ${g.err?`<p class="m31-err" role="alert">${esc(g.err)}</p>`:''}</div>`;
}
const wrapEd31=(g)=>`<div class="m31-live-ed">${gridEd31(g)}</div>`;

/* ---------- salvar ---------- */
async function save31g(){
  const g=M31.tg;if(!g||!isGM6())return;
  const T=ensTbl31(),fail=m=>{g.err=m;paint31(true);return false};
  const R=g.rows.map(r=>({...r}));
  let label='';
  if(g.kind==='skills'){
    const seen=new Set(),out=[];
    for(const r of R){const n=String(r.n||'').trim();if(!n)return fail('Toda perícia precisa de um nome.');if(n.length>30)return fail(`Nome muito longo: ${n}`);if(seen.has(norm31(n)))return fail(`Perícia repetida: ${n}`);seen.add(norm31(n));if(!ATTRS.includes(r.a))return fail(`Atributo inválido em ${n}.`);out.push({n,a:r.a})}
    if(out.length<5)return fail('Mantenha pelo menos 5 perícias.');
    const gone=g.rows.length&&BASE_SKILLS.filter(s=>!seen.has(norm31(s)));
    if(gone&&gone.length){const used=[...(typeof vocations!=='undefined'?vocations:[])].filter(v=>(v.skills||[]).some(s=>gone.includes(s))).length;if(!confirm(`Remover ${gone.length} perícia(s) (${gone.slice(0,4).join(', ')}${gone.length>4?'…':''})? ${used?used+' vocação(ões) usam essa(s) perícia(s) e perderão o bônus +V. ':''}Fichas existentes não são apagadas.`))return}
    out.sort((a,b)=>a.n.localeCompare(b.n,'pt-BR'));T.skills=out;label='Tabela de perícias';
    const same=out.length===PRI31.skills.length&&out.every(o=>PRI31.skills.some(p=>p[0]===o.n&&p[1]===o.a));if(same)delete T.skills;
  }else if(g.kind==='tiers'){
    const o={};for(const r of R){const n=r.s;for(const [f,hi] of [['five',40],['ten',40],['fifteen',40],['free10',40]])if(!int31(r[f],0,hi))return fail(`Estágio ${n}: "${f==='five'?'Escolhas de +5':f==='ten'?'Mestre':f==='fifteen'?'Maestria':'+10 direto'}" deve ser um inteiro de 0 a ${hi}.`);o[n]={five:+r.five,ten:+r.ten,fifteen:+r.fifteen,free10:+r.free10}}
    T.tiers=o;label='Escolhas por estágio';
  }else if(g.kind==='stages'){
    const o={};for(const r of R){const n=r.s,nm=String(r.name||'').trim();if(!nm)return fail(`Estágio ${n}: informe o título.`);if(nm.length>30)return fail(`Estágio ${n}: título longo demais.`);
      for(const f of ['vt','luc','es'])if(!int31(r[f],1,999))return fail(`Estágio ${n}: ${f==='vt'?'Vital':f==='luc'?'Lucidez':'Essência'} deve ser um inteiro de 1 a 999.`);
      if(!int31(r.attr,0,30))return fail(`Estágio ${n}: atributos extras deve ser de 0 a 30.`);
      o[n]={name:nm,vt:+r.vt,luc:+r.luc,es:+r.es,attr:+r.attr,pw:String(r.pw||'').trim().slice(0,40)}}
    T.stages=o;label='Estágios';
  }else if(g.kind==='extase'){
    const names=(T.skills&&T.skills.length?T.skills.map(s=>s.n):BASE_SKILLS),out=[],seen=new Set();
    for(const r of R){const nm=String(r.name||'').trim(),tx=String(r.text||'').trim();if(!nm||!tx)return fail('Todo bônus precisa de nome e efeito.');if(seen.has(norm31(nm)))return fail(`Bônus repetido: ${nm}`);seen.add(norm31(nm));
      const d=parseSk31(r.dice,names),f=parseSk31(r.flat,names);if(d.err)return fail(`${nm}: ${d.err}.`);if(f.err)return fail(`${nm}: ${f.err}.`);
      out.push({id:r.id||('x'+ridm31()),name:nm.slice(0,30),grp:r.grp==='Combate'?'Combate':'Fora de combate',text:tx.slice(0,300),dice:d.v,flat:f.v})}
    if(!out.length)return fail('Mantenha pelo menos um bônus.');
    T.extase=out;label='Bônus de Êxtase';
  }else{
    const head=g.head.map(h=>String(h||'').trim());if(head.some(h=>!h))return fail('Todo título de coluna precisa de texto.');
    if(!R.length)return fail('A tabela precisa de pelo menos uma linha.');
    const rows=R.map(r=>head.map((_,j)=>String(r[j]==null?'':r[j]).slice(0,400)));
    T.tb=T.tb||{};T.tb[g.kind]={head,rows,br:BASE_REV31};label='Tabela do Manual';
  }
  M31.tg=null;
  const ok=await saveMan31(label);
  if(!ok){M31.tg=g}
  else{try{T3.refresh()}catch(e){}}
  paint31(true);
}
async function reset31g(){
  const g=M31.tg;if(!g||!isGM6())return;
  if(!confirm('Restaurar esta tabela para o padrão do Manual Oficial? As suas alterações nela serão perdidas.'))return;
  const T=ensTbl31();
  if(g.free){if(T.tb)delete T.tb[g.kind]}else delete T[g.kind];
  M31.tg=null;await saveMan31('Tabela restaurada');
}
document.addEventListener('click',e=>{
  if(!M31.open||!gm31())return;const b=e.target.closest('#m31content [data-g]');if(!b)return;
  const [a,v]=b.dataset.g.split(/:(.*)/s);const g=M31.tg;
  if(a==='open'){open31g(v);return}
  if(!g)return;
  if(a==='cancel'){M31.tg=null;paint31(true);return}
  if(a==='save'){save31g();return}
  if(a==='reset'){reset31g();return}
  if(a==='add'){const r={};g.cols.forEach(c=>{r[c.k]=c.t==='sel'?c.o()[0]:''});if(g.kind==='skills')r.o='';g.rows.push(r);g.err='';paint31(true);setTimeout(()=>$q(`#m31content tr[data-gi="${g.rows.length-1}"] textarea,#m31content tr[data-gi="${g.rows.length-1}"] input`)?.focus(),30);return}
  if(a==='del'){if(g.rows.length<=1){return}g.rows.splice(+v,1);g.err='';paint31(true);return}
  if(a==='addc'){const j=g.cols.length;g.head.push('Nova coluna');g.cols.push({k:j,t:'text'});g.rows.forEach(r=>{r[j]=''});paint31(true);return}
  if(a==='delc'){const j=+v;if(g.cols.length<=1)return;g.head.splice(j,1);g.cols.splice(j,1);g.rows.forEach(r=>{const arr=g.cols.length+1,vals=[];for(let k=0;k<arr;k++)vals.push(r[k]);vals.splice(j,1);g.cols.forEach((c,k)=>{c.k=k;r[k]=vals[k]});delete r[arr-1]});paint31(true);return}
});
const edIn31=e=>{const g=M31.tg;if(!g||!M31.open)return;const t=e.target;
  if(t.dataset.gh!=null){g.head[+t.dataset.gh]=t.value;return}
  const tr=t.closest('tr[data-gi]');if(!tr||t.dataset.gk==null)return;const r=g.rows[+tr.dataset.gi];if(!r)return;
  const k=t.dataset.gk;r[g.free?+k:k]=t.value;
  if(t.tagName==='TEXTAREA'){t.rows=Math.max(1,Math.min(6,Math.ceil(t.value.length/(g.free?28:34))))}};
document.addEventListener('input',edIn31);document.addEventListener('change',edIn31);

/* ---------- tabelas vivas: perícias, escolhas, estágios, Êxtase, turno, portas ---------- */
const _skills31=LIVE31.skills;
LIVE31.skills=function(){const g=tgOn31('skills');if(g)return wrapEd31(g);return _skills31.apply(this,arguments)+bar31('skills',!!tbl31().skills)};
LIVE31.tiers=function(){const g=tgOn31('tiers');if(g)return wrapEd31(g);
  const rows=[];for(let s=1;s<=10;s++){const L=E.tierLimits(s);rows.push(tr31([String(s),String(L.five),String(L.ten),String(L.fifteen),L.free10?`+${L.free10} perícia${L.free10>1?'s sobem':' sobe'} direto para +10 (sem gastar escolha de +5)`:'—']))}
  return tb31(['Estágio','Escolhas de +5','Mestre (+10)','Maestria (+15)','Regra especial'],rows)+bar31('tiers',!!tbl31().tiers)};
LIVE31.stages=function(){const g=tgOn31('stages');if(g)return wrapEd31(g);
  const T=tbl31(),rows=[];for(let s=1;s<=10;s++){const x=STAGES[s]||STAGES[1],o=(T.stages||{})[s],pw=o&&o.pw!=null?o.pw:(PW31[s]||'');rows.push(tr31([String(s),esc(stageName(s)),String(x.vt),String(x.luc),String(x.es),(x.attr?'+':'')+x.attr,esc(pw||'—')]))}
  return tb31(['Estágio','Título','Vital','Lucidez','Essência','Atributos extras (acum.)','Poder de Trilha'],rows)+bar31('stages',!!tbl31().stages)};
LIVE31.extase=function(){const g=tgOn31('extase');if(g)return wrapEd31(g);
  const auto=x=>[fmtSk31(x.skillDice)?'+dados: '+fmtSk31(x.skillDice):'',fmtSk31(x.skillFlat)?'fixo: '+fmtSk31(x.skillFlat):'',(x.flags||[]).length?'regra especial':''].filter(Boolean).join(' · ')||'narrativo';
  return tb31(['Bônus','Grupo','Efeito mecânico','Automação'],EXTASE_DEFS.map(x=>tr31([`<b>${esc(x.name)}</b>`,esc(x.grp),esc(x.text),esc(auto(x))])))+bar31('extase',!!tbl31().extase)};
const freeLive31=(id,DEF,extra)=>{const k='live:'+id,g=tgOn31(k);if(g)return wrapEd31(g);const e=tbEff31(k,DEF);return tb31(e.head,rowsHtml31(e.rows))+bar31(k,!!ovTb31(k),extra||'')};
LIVE31.turn=function(){return freeLive31('turn',TURN31,gm31()?'<button type="button" class="gm29-b gm29-add" data-m31tab="1">⚖ Regras da Mesa</button>':'')};
LIVE31.doors=function(){return freeLive31('doors',DOORS31)};

/* ---------- tabelas e fórmulas de texto do Manual ---------- */
{const _bh=blockHtml31;blockHtml31=function(b){
  if(b&&b.tb&&b.id){const k=b.id,g=tgOn31(k);if(g)return wrapEd31(g);
    const e=tbEff31(k,{head:b.tb[0],rows:b.tb.slice(1)});return tb31(e.head,rowsHtml31(e.rows))+bar31(k,!!ovTb31(k))}
  if(b&&b.f!=null&&b.id){const D=man31(),id=b.id,ed=D.ed[id];
    if(ed&&ed.del)return gm31()?`<div class="m31-blk m31-gone"><span class="sub">Fórmula removida nesta campanha.</span> <button type="button" class="gm29-b" data-m31r="${esc(id)}">↺ Restaurar</button></div>`:'';
    const txt=ed&&ed.t!=null?ed.t:b.f;if(M31.edit===id)return editor31(id,txt);
    return`<div class="m31-blk" data-bid="${esc(id)}"><pre class="m31-f">${esc(tokens31(txt))}</pre>${gmTxt31(id,{edited:!!ed})}</div>`}
  return _bh.apply(this,arguments)}}
T3.E=E;T3.EXT={DEFS:EXTASE_DEFS,BY:EXTASE_BY_ID};T3.manualDbg.TB31=TB31;T3.manualDbg.applyTbl31=applyTbl31;T3.manualDbg.openGrid=open31g;
console.info('[Tulpa] Etapa 31b carregada (tabelas editáveis do Manual)');

/* Etapa 32 · símbolos dos 40 rituais (Sistema Tulpa RPG V1.2), vetorizados e refinados */
