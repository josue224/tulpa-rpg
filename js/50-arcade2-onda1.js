/* ===================================================================
   TULPA · ETAPA 38 — 🕹 ARCADE 2.0 · ONDA 1 (parte 1)
   ------------------------------------------------------------------
   BASE COMUM DAS ONDAS DO ARCADE 2.0
   - def.setup: tela de preparação antes do jogo solo (fase, faixa, modo)
     e escolhas do anfitrião na sala multiplayer (vão em room.opt).
     setup = { def(), fields(opt) -> [{k,l,hint,opts:[{v,n,d,ico,lock,badge}]}],
               fix(opt), sum(opt), intro(opt) }
   - progresso por jogador (fases, notas, moedas) em localStorage.
   - instância do jogo pode expor reward(res) -> {ob,xp,ap,d,why} (Óbolos
     extras e XP do Perseus proporcionais à duração e à dificuldade) e
     next() -> opções da próxima fase.
   - res.html (resumo extra no fim), res.unit (unidade da pontuação) e
     row.st (texto da pontuação) no cartão de fim de partida.
   - Pote Top 3 (60/30/10) nas corridas com def.top3.
   E 🎵 RITUAL RHYTHM 2.0 (a Fuga Além do Véu 2.0 fica em t39.js).
   =================================================================== */
const A38={hold:false};
T3.a38=A38;
const PK38=()=>'tulpa_arc2_'+(uid3()||'anon');
function prog38(){let o={};try{o=JSON.parse(localStorage.getItem(PK38())||'{}')||{}}catch(e){}return o}
function progPut38(f){const o=prog38();try{f(o)}catch(e){console.warn('[T38] progresso',e)}try{localStorage.setItem(PK38(),JSON.stringify(o))}catch(e){}return o}
T3.prog38=prog38;
const GDM38={facil:1,medio:1.3,dificil:1.7,pesadelo:2.2};
const gdMul38=gd=>GDM38[gd]||1.3;
const pnow38=()=>performance.now();

/* ---------- tela de preparação ---------- */
function setupHtml38(def,opt,{edit=true}={}){
  return def.setup.fields(opt).map(f=>`<section class="s38-f"><h3 class="s38-h">${esc(f.l)}</h3>${f.hint?`<p class="sub">${esc(f.hint)}</p>`:''}<div class="s38-opts${f.wide?' wide':''}" role="group" aria-label="${esc(f.l)}">${f.opts.map(o=>{const on=String(opt[f.k])===String(o.v);
    return`<button type="button" class="s38-o${on?' on':''}${o.lock?' lock':''}" ${edit&&!o.lock?`data-s38="${f.k}|${esc(String(o.v))}"`:'disabled'} aria-pressed="${on}">${o.ico?`<span class="s38-ico" aria-hidden="true">${o.ico}</span>`:''}<span class="s38-tx"><b>${esc(o.n)}</b>${o.d?`<span class="sub">${esc(o.d)}</span>`:''}</span>${o.badge?`<span class="s38-bd">${o.badge}</span>`:''}${o.lock?'<span class="s38-lk" aria-label="Bloqueado">🔒</span>':''}</button>`}).join('')}</div></section>`).join('');
}
function optMode38(r,def){return r.mode==='multi'?(r.max===2&&def.modes.includes('pvp')?'pvp':'mesa'):r.mode}
function setupOpen38(){
  const r=MG.room;if(!r){mgHub();return}const def=GAMES12[r.g];if(!def?.setup){A38.hold=false;mgStartHost();return}
  r.opt={...def.setup.def(),...(r.opt||{}),_m:optMode38(r,def)};def.setup.fix?.(r.opt);
  MG.view='setup';mgStop();mgTitle(def.ico+' '+def.name);
  const m=$('mgMain');if(!m)return;
  const paint=focus=>{
    m.innerHTML=`<div class="mg-lobby s38"><h2>${def.ico} ${def.name}</h2>${def.setup.intro?`<p class="sub">${def.setup.intro(r.opt)}</p>`:''}${setupHtml38(def,r.opt)}${def.setup.sum?`<p class="s38-sum">${def.setup.sum(r.opt)}</p>`:''}<div class="mg-lbtn"><button type="button" class="btn primary" id="s38Go">▶ Começar</button><button type="button" class="btn small" id="s38Back">Voltar</button></div></div>`;
    $$('[data-s38]',m).forEach(b=>b.onclick=()=>{const i=b.dataset.s38.indexOf('|'),k=b.dataset.s38.slice(0,i),v=b.dataset.s38.slice(i+1);r.opt[k]=v;def.setup.fix?.(r.opt);fx5('confirm');paint(b.dataset.s38)});
    $('s38Go').onclick=()=>{A38.hold=false;mgStartHost()};
    $('s38Back').onclick=()=>{mgLeaveRoom();mgHub()};
    (focus&&m.querySelector(`[data-s38="${CSS.escape(focus)}"]`)||$('s38Go'))?.focus();
  };
  paint();
}
T3.setupOpen38=setupOpen38;
{const _sh=mgStartHost;mgStartHost=function(){if(A38.hold){A38.hold=false;setupOpen38();return}return _sh.apply(this,arguments)}}
{const _cr=mgCreate;mgCreate=function(g,multi){
  const def=GAMES12[g];if(def?.setup&&!multi)A38.hold=true;
  let out;try{out=_cr.apply(this,arguments)}finally{A38.hold=false}
  if(def?.setup&&multi&&MG.room){MG.room.opt={...def.setup.def(),_m:optMode38(MG.room,def)};def.setup.fix?.(MG.room.opt);mgPublish();mgLobby()}
  return out}}
{const _lb=mgLobby;mgLobby=function(){
  const out=_lb.apply(this,arguments);
  try{const r=MG.room,m=$('mgMain');if(!r||!m||MG.view!=='lobby')return out;const def=GAMES12[r.g];if(!def?.setup)return out;
    if(!r.opt){r.opt={...def.setup.def(),_m:optMode38(r,def)};def.setup.fix?.(r.opt)}
    const host=r.host===uid3(),box=document.createElement('div');box.className='s38 s38-lobby';
    box.innerHTML=setupHtml38(def,r.opt,{edit:host})+(def.setup.sum?`<p class="s38-sum">${def.setup.sum(r.opt)}</p>`:'');
    (m.querySelector('.mg-rule')||m.querySelector('.mg-players'))?.after(box);
    $$('[data-s38]',box).forEach(b=>b.onclick=()=>{const i=b.dataset.s38.indexOf('|');r.opt[b.dataset.s38.slice(0,i)]=b.dataset.s38.slice(i+1);def.setup.fix?.(r.opt);mgPublish();mgLobby()});
  }catch(e){console.warn('[T38] sala',e)}
  return out}}

/* ---------- fim de partida: resumo, Óbolos extras, próxima fase ---------- */
{const _so=mgShowOver;mgShowOver=function(res){
  const out=_so.apply(this,arguments);
  try{
    const card=$('mgOver')?.querySelector('.mg-ocard');if(!card||!res)return out;
    if(res.html&&!card.querySelector('.r38'))(card.querySelector('.x30-betres')||card.querySelector('.mg-rank'))?.insertAdjacentHTML('afterend',`<div class="r38">${res.html}</div>`);
    const g=MG.g,rw=g&&!g._paid38&&g.reward?g.reward(res):null;
    if(g)g._paid38=1;
    if(rw&&(rw.ob>0||rw.xp>0)){petLoad20();const ob=Math.max(0,Math.round(rw.ob||0)),xp=Math.max(0,Math.round(rw.xp||0));
      if(ob)petEarn20(ob,'');PET.xp=(PET.xp||0)+xp;PET.ap=(PET.ap||0)+Math.round(rw.ap||0);if(rw.d)petGain20('d',rw.d);petSave20(true);try{petHeader20?.()}catch(e){}
      card.querySelector('.pt-earn')?.insertAdjacentHTML('afterend',`<p class="pt-earn r38-earn">🎁 +${ob} Óbolos extras · ✨ +${xp} XP do Perseus${rw.why?` · ${esc(rw.why)}`:''}</p>`)}
    const r=MG.room,def=r&&GAMES12[r.g],host=!!r&&(r.mode!=='multi'||r.host===uid3());
    if(def?.setup&&host){const lb=card.querySelector('.mg-lbtn'),nx=g?.next?.();
      if(lb&&nx&&!$('s38Next')){const b=document.createElement('button');b.type='button';b.className='btn primary';b.id='s38Next';b.textContent='⏭ '+(nx.label||'Próxima');b.onclick=()=>{const o={...(r.opt||{}),...nx.opt};r.opt=o;if(r.mode==='multi'){mgPublish();mgStartHost()}else{r.st='lobby';mgStartHost()}};lb.prepend(b)}
      if(lb&&!$('s38Pick')){const b=document.createElement('button');b.type='button';b.className='btn small';b.id='s38Pick';b.textContent='🗺 Escolher outra';b.onclick=()=>{if(r.mode==='multi'){r.st='lobby';mgPublish();mgLobby()}else setupOpen38()};$('mgToHub')?.before(b)}}
  }catch(e){console.warn('[T38] fim',e)}
  return out}}

/* ---------- conquistas da Onda 1 ---------- */
Object.assign(ACH,{
  rh_desp:{ico:'✨',n:'Despertar Rítmico',d:'Ative o Despertar no Ritual Rhythm.'},
  rh_splus:{ico:'🌟',n:'Ritual Perfeito',d:'Tire S+ numa faixa do Ritual Rhythm.',secret:true},
  rh_semana:{ico:'📅',n:'Semana Sagrada',d:'Termine uma Semana completa do Ritual Rhythm sem colapsar.'},
  rh_coral:{ico:'🎼',n:'Coral dos Cinco',d:'Conclua as 5 semanas do Ritual Rhythm.'},
  rh_sab:{ico:'🌫',n:'Sabotador Astral',d:'Lance 3 sabotagens numa mesma faixa do Ritual Rhythm.'},
  fu_limiar:{ico:'🚪',n:'Atravessou o Limiar',d:'Termine a primeira fase da Fuga Além do Véu.'},
  fu_coracao:{ico:'👁',n:'Coração do Véu',d:'Termine as 6 fases da Fuga Além do Véu.'},
  fu_moedas:{ico:'🪙',n:'Caçador de Moedas Astrais',d:'Junte as 18 Moedas Astrais da Fuga Além do Véu.'},
  fu_limpo:{ico:'💫',n:'Sem Tropeços',d:'Termine uma fase da Fuga na primeira tentativa.',secret:true},
  fu_pratica:{ico:'🚩',n:'Treino Dedicado',d:'Termine uma fase no Modo Prática da Fuga.'},
});

/* ---------- controles de toque ---------- */
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='rh38')return`<div class="mg-rh4">${b('ArrowLeft','←')}${b('ArrowDown','↓')}${b('ArrowUp','↑')}${b('ArrowRight','→')}</div><div class="mg-rhx">${b('Space','✨','','Despertar')}${b('Digit1','🌫','','Neblina de Ilusão')}${b('Digit2','🕳','','Distorção do Vazio')}${b('Digit3','🌿','','Raízes Trêmulas')}</div>`;
  if(p==='fu38')return`<div>${b('Space','⤒ Pular / Segurar','wide')}${b('KeyQ','🏳','','Encerrar')}</div><div class="fu38-pr">${b('KeyC','🚩','','Marcar checkpoint')}${b('KeyX','✖','','Apagar checkpoint')}</div>`;
  return _p.apply(this,arguments)}}

/* ===================================================================
   🎵 RITUAL RHYTHM 2.0
   Campanha em 5 Semanas (uma por Elemento), 3 faixas cada, com BPM que
   sobe dentro da faixa (verso → refrão → clímax) e de semana em semana.
   Notas: normal, longa (segure: drena Essência), corrompida (NÃO aperte)
   e dourada de Sub-Elemento (Essência em dobro + Lucidez).
   Despertar (barra cheia: Espaço) dobra os pontos por 8 s. Sabotagens
   (1, 2, 3) gastam Essência e atrapalham o rival por 3 s.
   Avaliação: Perfeito / Ótimo / Bom / Erro, precisão e rank S+…D.
   =================================================================== */
const RHW38=[
  {k:'fe',n:'Semana da Fé',el:4,ico:'🕯',root:60,scale:[0,2,4,7,9],prog:[0,7,9,5],col:['#2a2106','#5a4a12'],ins:'organ',sub:'☉',
    tr:[['Vigília da Fé',96,98],['Sinos do Limiar',102,110],['Coro da Devoção',110,120]]},
  {k:'nat',n:'Semana da Natureza',el:0,ico:'🌿',root:57,scale:[0,3,5,7,10],prog:[0,5,3,7],col:['#0c2416','#1f4a2c'],ins:'pluck',sub:'☉',
    tr:[['Raízes Lentas',108,112],['Esporos ao Vento',114,124],['Seiva Antiga',120,130]]},
  {k:'ine',n:'Semana da Inexistência',el:1,ico:'🕳',root:55,scale:[0,1,5,7,10],prog:[0,1,5,3],col:['#0b0a14','#2a2440'],ins:'drone',sub:'◌',
    tr:[['Eco da Inexistência',120,126],['Vazio Cantante',126,136],['Gravidade Esquecida',132,142]]},
  {k:'ilu',n:'Semana da Ilusão',el:2,ico:'🌀',root:62,scale:[0,2,3,7,8],prog:[0,8,3,7],col:['#22102e','#4b1f5e'],ins:'saw',sub:'✧',
    tr:[['Espiral da Ilusão',126,132],['Espelho Partido',134,144],['Teatro de Sombras',140,152]]},
  {k:'ver',n:'Semana da Verdade',el:3,ico:'👁',root:59,scale:[0,2,4,6,9],prog:[0,4,7,2],col:['#06202a','#13495a'],ins:'bell',sub:'✶',
    tr:[['Lanterna Acesa',136,144],['Tribunal das Lâmpadas',144,156],['Fim do Véu',152,170]]},
];
const RANKS38=['D','C','B','A','S','S+'];
const rhId38=(w,t)=>w+'-'+t;
const rhBars38=(t,w=0)=>([48,56,64][t]||48)+8*(w|0);
const rkCls38=r=>'rk38 rk-'+String(r).replace('+','p');
function rhTrack38(w,t){w=Math.max(0,Math.min(4,w|0));t=Math.max(0,Math.min(2,t|0));const W=RHW38[w],T=W.tr[t];
  return{w,t,id:rhId38(w,t),n:T[0],b0:T[1],b1:T[2],bars:rhBars38(t,w),wk:W,el:W.el,root:W.root+(t===2?2:0),scale:W.scale,prog:W.prog,col:W.col,ins:W.ins}}
function rhProg38(){const p=prog38().rh||{};return{tr:p.tr||{},wk:p.wk||{}}}
function rhOpen38(w){return w===0||!!rhProg38().wk[w-1]}
function rhRank38(acc,miss){return acc>=98&&miss===0?'S+':acc>=95?'S':acc>=90?'A':acc>=80?'B':acc>=70?'C':'D'}
const rhBetter38=(a,b)=>RANKS38.indexOf(a)>RANKS38.indexOf(b||'');
const SAB38={nevoa:{n:'Neblina de Ilusão',ico:'🌫',key:'Digit1',d:'esconde as setas até perto dos receptores'},distorcao:{n:'Distorção do Vazio',ico:'🕳',key:'Digit2',d:'a velocidade das setas oscila'},tremor:{n:'Raízes Trêmulas',ico:'🌿',key:'Digit3',d:'as faixas tremem'}};
const SABK38=Object.keys(SAB38),SABCOST38=2000;

/* mapa de tempo: o BPM muda nos blocos de 4 compassos (verso → refrão → clímax) */
function tempo38(T,bars,mul){
  const b1=Math.max(4,Math.round(bars*.45/4)*4),b2=Math.max(b1,Math.round(bars*.75/4)*4);
  const bpmOf=bar=>Math.round((bar<b1?T.b0:bar<b2?(T.b0+T.b1)/2:T.b1)*mul);
  const spbAt=bar=>60/bpmOf(Math.max(0,Math.min(bars+1,bar)));
  const st=[0];for(let b=0;b<bars+2;b++)st.push(st[b]+4*spbAt(b));
  return{bars,b1,b2,bpmOf,spbAt,
    at:B=>{const bar=Math.max(0,Math.min(bars+1,Math.floor(B/4)));return st[bar]+(B-bar*4)*spbAt(bar)},
    beat:t=>{if(t<0)return t/spbAt(0);let bar=0;while(bar<bars+1&&st[bar+1]<=t)bar++;return bar*4+(t-st[bar])/spbAt(bar)}};
}
/* gráfico: chamada (2 compassos) e resposta (os mesmos padrões 2 compassos depois) */
function chart38(T,bars,li,tm){
  const rng=mb32((9973*(T.w*3+T.t+1)+li*31+7)>>>0),ev=[];
  const intens=bar=>{const f=bar/bars;return f<.12?0:f<.4?1:f<.62?2:f<.72?.5:3};
  let prev=Math.floor(rng()*4);
  const walk=()=>{const r=rng();prev=r<.18?prev:(prev+1+Math.floor(rng()*3))%4;return prev};
  const other=l=>(l+1+Math.floor(rng()*3))%4;
  for(let bar=0;bar<bars;bar+=4){
    const I=intens(bar),call=[];
    const add=(b,lane,k='n',len=0)=>call.push({b,lane,k,len,deg:Math.floor(rng()*T.scale.length)});
    for(let h=0;h<2;h++){
      const b0=bar*4+h*4,s16=li>=2&&I>=2,quick=li>=3&&I>=3;
      let pool=I===0?['quarter','quarter','synco','hold']:I<=1?['eighth','stairs','quarter','hold','jumps','synco']:I===2?['stairs','trill','jumps','gallop','hold','eighth']:['trill','stairs','gallop','jumps','roll','hold','eighth'];
      if(li===0)pool=pool.filter(p=>!['roll','gallop'].includes(p));
      if(bar===0&&h===0)pool=['quarter'];
      const p=pool[Math.floor(rng()*pool.length)];
      if(p==='quarter'){for(let b=0;b<4;b++)if(rng()<.85||b===0)add(b0+b,walk())}
      else if(p==='eighth'){for(let b=0;b<4;b+=.5)if(b%1===0||rng()<[.2,.45,.6,.75][li])add(b0+b,walk())}
      else if(p==='synco'){add(b0,walk());[.5,1.5,2.5].forEach(b=>add(b0+b,walk()));if(rng()<.6)add(b0+3,walk())}
      else if(p==='stairs'){const dir=rng()<.5?1:-1,st=s16?.25:.5,n=st===.25?8:li===0?4:6;let l=dir>0?0:3;for(let i=0;i<n;i++){add(b0+i*st,l);l=(l+dir+4)%4}if(st===.5&&n===4){add(b0+2,walk());add(b0+3,walk())}else if(st===.25)add(b0+3,walk())}
      else if(p==='trill'){const a=walk(),c=other(a),st=quick?.25:li===0?1:.5,until=st===.25?2:4;for(let b=0,i=0;b<until;b+=st,i++)add(b0+b,i%2?c:a);if(until===2){add(b0+2.5,walk());add(b0+3,walk())}}
      else if(p==='jumps'){for(let b=0;b<4;b++){const l=walk();add(b0+b,l);if(b%2===0||li>=2)add(b0+b,other(l))}}
      else if(p==='gallop'){[0,2].forEach(b=>{const l=walk();add(b0+b,l);add(b0+b+.5,walk());if(li>=2)add(b0+b+.75,walk());add(b0+b+1,walk())})}
      else if(p==='roll'){for(let i=0;i<8;i++)add(b0+i*.25,i%4);add(b0+2,walk());add(b0+3,walk())}
      else if(p==='hold'){const a=walk();add(b0,a,'h',li===0?2:3);if(li>=2){const c=other(a);add(b0+1,c);add(b0+1.5,other(a))}if(li>=1)add(b0+3.5,other(a));else add(b0+3,other(a))}
    }
    /* limpeza: nada na mesma faixa colado demais, nada dentro de uma nota longa, no máximo 2 juntas */
    call.sort((a,b)=>a.b-b.b||(b.len-a.len));
    const keep=[];
    for(const n of call){
      if(keep.some(k=>k.lane===n.lane&&Math.abs(k.b-n.b)<.24))continue;
      if(keep.some(k=>k.len&&k.lane===n.lane&&n.b>=k.b&&n.b<=k.b+k.len+.25))continue;
      if(n.len&&keep.some(k=>k.lane===n.lane&&k.b>n.b&&k.b<=n.b+n.len+.25))continue;
      if(keep.filter(k=>Math.abs(k.b-n.b)<.01).length>=2)continue;
      if(n.b>=bar*4+8)continue;
      keep.push(n);
    }
    /* notas especiais */
    if(I>0)for(let h=0;h<2;h++)if(rng()<.24){const c=keep.filter(n=>n.k==='n'&&n.b>=bar*4+h*4&&n.b<bar*4+h*4+4);if(c.length)c[Math.floor(rng()*c.length)].k='g'}
    const pc=[.05,.14,.2,.27,.34][T.w]*[.5,1,1.2,1.4][li]*(I===0?.3:1);
    for(let h=0;h<2;h++){let want=(rng()<pc?1:0)+(rng()<pc*.4?1:0);
      for(let tries=0;want>0&&tries<14;tries++){const b=bar*4+h*4+Math.floor(rng()*8)/2,l=Math.floor(rng()*4);
        if(keep.some(k=>k.lane===l&&(Math.abs(k.b-b)<.75||(k.len&&b>=k.b-.5&&b<=k.b+k.len+.5))))continue;
        if(keep.filter(k=>Math.abs(k.b-b)<.01).length>=2)continue;
        keep.push({b,lane:l,k:'x',len:0,deg:0});want--}}
    keep.forEach(n=>{ev.push({...n,owner:0},{...n,b:n.b+8,owner:1})});
  }
  ev.sort((a,b)=>a.b-b.b||a.lane-b.lane);
  return ev.map((e,i)=>({i,b:e.b,t:tm.at(e.b),lane:e.lane,owner:e.owner,k:e.k,len:e.len?tm.at(e.b+e.len)-tm.at(e.b):0,deg:e.deg,j:null}));
}
T3.rh38={tempo:tempo38,chart:chart38,track:rhTrack38,weeks:RHW38,rank:rhRank38};

const rhSetup38={
  intro:o=>o._m==='pvp'?'Escolha a faixa da batalha. Os dois tocam o mesmo gráfico, em frases alternadas.':'Campanha contra o Perseus. Termine as 3 faixas de uma semana para abrir a próxima. O BPM sobe de semana em semana.',
  def:()=>{let w=0;while(w<4&&rhOpen38(w+1))w++;const p=rhProg38();let t=[0,1,2].find(i=>!p.tr[rhId38(w,i)]?.ok);return{mode:'one',wk:String(w),tr:String(t==null?0:t)}},
  fields:o=>{const pvp=o._m==='pvp',p=rhProg38(),F=[];
    if(!pvp)F.push({k:'mode',l:'Modo',opts:[{v:'one',n:'Faixa única',ico:'🎵',d:'Uma música, do começo ao fim.'},{v:'week',n:'Semana completa',ico:'📅',d:'As 3 faixas seguidas. A Lucidez passa de uma para a outra.'}]});
    F.push({k:'wk',l:'Semana',opts:RHW38.map((W,i)=>{const lock=!pvp&&!rhOpen38(i);return{v:String(i),n:W.n,ico:W.ico,d:lock?`Termine a ${RHW38[i-1].n} para abrir.`:`${W.tr[0][1]} a ${W.tr[2][2]} BPM`,lock,badge:p.wk[i]?'✓':''}})});
    if(pvp||o.mode!=='week'){const w=+o.wk||0;F.push({k:'tr',l:'Faixa',opts:RHW38[w].tr.map((T,i)=>{const r=p.tr[rhId38(w,i)];return{v:String(i),n:T[0],ico:['Ⅰ','Ⅱ','Ⅲ'][i],d:`${T[1]}${T[2]!==T[1]?' → '+T[2]:''} BPM · ${rhBars38(i,w)} compassos`,badge:r?.rank?`<b class="${rkCls38(r.rank)}">${r.rank}</b>`:''}})})}
    return F},
  fix:o=>{if(o._m==='pvp')o.mode='one';if(!['one','week'].includes(o.mode))o.mode='one';let w=Math.max(0,Math.min(4,+o.wk||0));if(o._m!=='pvp')while(w>0&&!rhOpen38(w))w--;o.wk=String(w);const t=+o.tr;o.tr=String(t>=0&&t<3?t:0)},
  sum:o=>{const W=RHW38[+o.wk||0];if(o.mode==='week')return`📅 ${W.n}: ${W.tr.map(t=>t[0]).join(' → ')}. Perdeu a Lucidez, a semana acaba.`;const T=W.tr[+o.tr||0];return`🎵 ${T[0]} · ${T[1]}${T[2]!==T[1]?'→'+T[2]:''} BPM. Setas ou WASD tocam. Espaço ativa o Despertar. 1, 2 e 3 lançam sabotagens (${SABCOST38} ⚗ cada).`}
};

function rhythm38(C){
  const W=800,H=450,RY=78,LX=[[96,156,216,276],[524,584,644,704]],SR=24;
  const o=C.room.opt||{},pvp=!!C.net,li=GD12[C.gd]??1,di=GD12[C.diff]??1;
  const list=(!pvp&&o.mode==='week')?[0,1,2].map(t=>rhTrack38(+o.wk||0,t)):[rhTrack38(+o.wk||0,+o.tr||0)];
  const players=C.players,owners=pvp?[players[0].u,players[1]?players[1].u:'~ai']:['~ai',C.me];
  const ME=Math.max(0,owners.indexOf(C.me)),OP=1-ME,oppU=owners[OP];
  const oppInfo=oppU==='~ai'?{n:'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n,c:-1}:(players.find(p=>p.u===oppU)||{n:'?',c:0});
  const meInfo=players.find(p=>p.u===C.me)||{n:'Você',c:0};
  const speed=[380,450,540,640][li],lucMiss=[6,8,10,13][li],lucX=[12,15,18,22][li],wk=[1.2,1,1,.9][li];
  const WIN=[.045*wk,.08*wk,.125*wk],JN=['PERFEITO','ÓTIMO','BOM'],JC=['#ffd36b','#7dffa8','#7fe3ff'];
  const aiAcc=gdPick(C.diff,[.74,.87,.95,1]),aiPerf=gdPick(C.diff,[.35,.55,.75,.95]);
  const rng=mb32(((C.seed>>>0)^0x5EED)>>>0);
  const mk=()=>({ess:0,luc:100,combo:0,max:0,maxAll:0,hits:0,miss:0,perf:0,great:0,good:0,hOk:0,hDrop:0,xHit:0,xDodge:0,gold:0,dsp:0,dspOn:0,dspN:0,accW:0,accN:0,pose:-1,poseT:0,sabN:0,drain:0,ess0:0});
  const side=[mk(),mk()];
  const S={ac:null,start:0,sched:0,timer:0,end:false,pops:[],held:[0,0,0,0],flash:[0,0,0,0],lastSync:0,collapsed:-1,yv:null,ti:0,inter:null,res:[],sab:{},sabCd:0,aiSabCd:0,aiDeb:0,ptr:{},banner:null,wait:0,gotFin:false,opRes:null};
  let T=null,notes=[],tm=null,END=0;
  function load(i){
    T=list[i];S.ti=i;
    const want=Number(window.__rhBars)||T.bars,bars=Math.max(4,Math.round(want/4)*4);
    tm=tempo38(T,bars,[.92,1,1.06,1.12][li]);notes=chart38(T,bars,li,tm);
    END=tm.at(bars*4)+tm.spbAt(bars)*1.5;
    side.forEach(s=>{Object.assign(s,{combo:0,max:0,hits:0,miss:0,perf:0,great:0,good:0,hOk:0,hDrop:0,xHit:0,xDodge:0,gold:0,accW:0,accN:0,sabN:0,ess0:s.ess})});
    S.sched=0;S.held=[0,0,0,0];
  }
  load(0);
  const mul=si=>(side[si].dspOn>pnow38()?2:1);
  const gain=(si,e)=>Math.round(e*(1+Math.min(side[si].combo,50)/50)*mul(si));
  const accOf=sd=>sd.accN?100*sd.accW/sd.accN:100;
  function pop(si,txt,col){S.pops.push({si,txt,col,t0:pnow38()});if(S.pops.length>10)S.pops.shift()}
  const songT=()=>S.ac?S.ac.currentTime-S.start:-9;
  const beatNow=()=>tm.beat(Math.max(0,songT()));
  const phase=()=>{const t=songT();return t<0?-1:Math.floor(tm.beat(t)/8)%2};
  /* ---------- julgamento ---------- */
  function judge(si,n,dt){
    const sd=side[si],a=Math.abs(dt),j=a<=WIN[0]?0:a<=WIN[1]?1:a<=WIN[2]?2:-1;
    if(j<0){miss(si,n);return}
    n.j=JN[j];sd.combo++;sd.max=Math.max(sd.max,sd.combo);sd.maxAll=Math.max(sd.maxAll,sd.combo);sd.hits++;sd[['perf','great','good'][j]]++;
    sd.accW+=[1,.8,.5][j];sd.accN++;
    let e=[350,200,100][j];if(n.k==='g'){e*=2;sd.gold++;sd.luc=Math.min(100,sd.luc+6)}
    sd.ess+=gain(si,e);sd.luc=Math.min(100,sd.luc+[2,1,.5][j]);
    if(!(sd.dspOn>pnow38()))sd.dsp=Math.min(100,sd.dsp+[2.2,1.6,.8][j]+(n.k==='g'?6:0));
    if(n.k==='h'){n.holding=1;sd.accN++}
    sd.pose=n.lane;sd.poseT=pnow38();if(si===ME)S.flash[n.lane]=pnow38();
    pop(si,n.k==='g'?'DOURADA!':JN[j],n.k==='g'?'#ffe9a0':JC[j]);
    if(si===ME&&C.fx){const lx=LX[si][n.lane];C.fx.burst(lx,RY,{n:j===0||n.k==='g'?14:6,kind:j===0||n.k==='g'?'star':'dot',col:n.k==='g'?['#ffd36b','#fff3c2','#fff']:[JC[j],LANE15[n.lane].c,'#fff'],sp:j===0?190:120,life:.5,size:3,grav:120});
      if(n.k==='g')try{const ac=actx(),t=ac.currentTime;o5('sine',1568,t,.25,{gain:.05,wet:.6});o5('sine',2093,t+.06,.3,{gain:.04,wet:.7})}catch(e){}
      if(sd.combo>0&&sd.combo%10===0){C.fx.float(400,190,`${sd.combo} COMBO!`,{col:'#ffd36b',size:30+Math.min(16,sd.combo/5),life:1.1});C.fx.shake(3,.15);if(sd.combo%25===0)C.fx.flash('#ffd36b',.2)}}
  }
  function miss(si,n){const sd=side[si],lost=sd.combo;n.j='miss';sd.combo=0;sd.miss++;sd.accN+=n.k==='h'?2:1;sd.luc=Math.max(0,sd.luc-lucMiss);pop(si,'ERRO','#ff6b5b');
    if(si===ME){try{o5('sawtooth',90,actx().currentTime,.18,{to:60,gain:.05,wet:.1})}catch(e){}C.fx?.shake(lost>=10?6:3,.18)}}
  function hitX(si,n){const sd=side[si];n.j='X';sd.combo=0;sd.xHit++;sd.miss++;sd.accN++;sd.luc=Math.max(0,sd.luc-lucX);pop(si,'CORROMPIDA!','#c56bff');
    if(si===ME){try{const t=actx().currentTime;n5(t,.25,{freq:300,type:'bandpass',q:4,gain:.2,wet:.2});o5('square',70,t,.3,{to:40,gain:.06})}catch(e){}C.fx?.shake(7,.25);C.fx?.flash('#3a0a5a',.35);C.fx?.burst(LX[si][n.lane],RY,{n:12,col:['#7b2cbf','#000','#c56bff'],sp:160,life:.5})}}
  function dodgeX(si,n){const sd=side[si];n.j='ok';sd.xDodge++;sd.ess+=40}
  function holdEnd(si,n,ok){if(!n.holding)return;n.holding=0;n.hd=ok?'ok':'drop';const sd=side[si];
    if(ok){sd.hOk++;sd.accW+=1;if(!(sd.dspOn>pnow38()))sd.dsp=Math.min(100,sd.dsp+3);pop(si,'SEGUROU!','#ffd36b')}
    else{sd.hDrop++;sd.combo=0;sd.miss++;sd.luc=Math.max(0,sd.luc-3);pop(si,'SOLTOU','#ff9b6b')}
    if(si===ME&&pvp)C.send('rhh',{i:n.i,ok:ok?1:0})}
  function press(lane){
    const t=songT();if(t<-.2||S.end||S.inter)return;S.held[lane]=1;S.flash[lane]=pnow38();
    let best=null,bd=9;for(const n of notes)if(n.owner===ME&&n.lane===lane&&!n.j){const d=Math.abs(n.t-t);if(d<=WIN[2]&&d<bd){bd=d;best=n}}
    if(!best)return;
    if(best.k==='x'){hitX(ME,best);if(pvp)C.send('rh',{i:best.i,j:'X'});return}
    judge(ME,best,t-best.t);if(pvp)C.send('rh',{i:best.i,j:best.j});
  }
  function release(lane){S.held[lane]=0;const t=songT();for(const n of notes)if(n.owner===ME&&n.holding&&n.lane===lane)holdEnd(ME,n,t>=n.t+n.len-.12)}
  function awaken(si,net=true){const sd=side[si];if(sd.dsp<100||sd.dspOn>pnow38()||S.end)return false;
    sd.dspOn=pnow38()+8000;sd.dspN++;sd.luc=Math.min(100,sd.luc+10);pop(si,'✨ DESPERTAR!','#ffe9a0');
    if(si===ME){C.achieve?.('rh_desp');C.fx?.flash('#ffd36b',.35);C.fx?.float(400,230,'✨ DESPERTAR ×2',{col:'#ffe9a0',size:34,life:1.4});try{const t=actx().currentTime;[523,659,784,1047].forEach((f,i)=>o5('triangle',f,t+i*.06,.6,{gain:.05,wet:.6}))}catch(e){}if(pvp&&net)C.send('rhd',{})}
    return true}
  function sabotage(k){
    if(S.end||S.inter||songT()<0)return;const sd=side[ME],a=SAB38[k];if(!a)return;
    if(S.sabCd>pnow38()){pop(ME,'Recarregando…','#bbb');return}
    if(sd.ess<SABCOST38){pop(ME,`Precisa de ${SABCOST38} ⚗`,'#bbb');return}
    sd.ess-=SABCOST38;S.sabCd=pnow38()+6000;sd.sabN++;if(sd.sabN>=3)C.achieve?.('rh_sab');
    pop(ME,`${a.ico} ${a.n}!`,'#d9b8ff');try{const t=actx().currentTime;n5(t,.4,{freq:900,type:'bandpass',q:2,gain:.12,wet:.6})}catch(e){}
    if(pvp)C.send('rhx',{k});else S.aiDeb=pnow38()+3000;
  }
  function getSab(k,from){S.sab[k]=pnow38()+3000;S.banner={k,t0:pnow38(),from};C.fx?.shake(3,.2);try{o5('sawtooth',220,actx().currentTime,.3,{to:110,gain:.04})}catch(e){}}
  /* ---------- IA do Perseus ---------- */
  function aiStep(t){
    const deb=S.aiDeb>pnow38()?.15:0;
    for(const n of notes){if(n.owner!==OP)continue;
      if(n.holding){if(n.aiDrop!=null&&t>=n.t+n.len*n.aiDrop){holdEnd(OP,n,false)}else if(t>=n.t+n.len)holdEnd(OP,n,true);continue}
      if(n.j)continue;
      if(n.k==='x'){if(n.ai==null)n.ai=rng()<(1-aiAcc+deb)*.5?1:0;if(n.ai===1&&t>=n.t){hitX(OP,n);continue}if(t-n.t>WIN[2])dodgeX(OP,n);continue}
      if(n.ai==null){const r=rng();n.ai=r<aiAcc-deb?(rng()<aiPerf?(rng()-.5)*.06:(rng()<.5?-1:1)*(.05+rng()*.07)):9;if(n.k==='h')n.aiDrop=rng()<aiAcc-deb?null:.3+rng()*.5}
      if(n.ai===9){if(t-n.t>WIN[2])miss(OP,n);continue}
      if(t>=n.t+n.ai)judge(OP,n,n.ai);
    }
    const ph=phase();
    if(side[OP].dsp>=100&&di>=1&&ph===OP)awaken(OP);
    if(di>=2&&ph===ME&&side[OP].ess>SABCOST38*1.5&&pnow38()>S.aiSabCd&&rng()<[0,0,.006,.012][di]){
      const k=SABK38[Math.floor(rng()*3)];side[OP].ess-=SABCOST38;S.aiSabCd=pnow38()+9000;getSab(k,oppInfo.n);C.say?.(['Um pouco de neblina não faz mal a ninguém.','Vamos ver você ler essas setas agora.','Trema, humano.'][Math.floor(rng()*3)],false)}
  }
  /* ---------- música ---------- */
  function sched(){
    const ac=S.ac;if(!ac||S.end||S.inter)return;const now=ac.currentTime,ahead=now+.14,bars=tm.bars;
    for(;;){const k=S.sched,beat=k/2,t=S.start+tm.at(beat);if(t>=ahead||beat>=bars*4+2)break;S.sched++;
      if(t<now-.02||beat>=bars*4)continue;
      const bar=Math.floor(beat/4),inBar=beat%4,spb=tm.spbAt(bar),chord=T.root+T.prog[bar%T.prog.length],climax=bar>=tm.b2,chorus=bar>=tm.b1;
      if(k%2===0){
        if(inBar===0||inBar===2||(climax&&inBar===3)){o5('sine',140,t,.16,{to:42,gain:.2,attack:.002,wet:.05});n5(t,.03,{freq:180,type:'lowpass',gain:.25,wet:.02})}
        else{n5(t,.12,{freq:1900,q:.8,gain:.16,wet:.25});o5('triangle',220,t,.06,{to:160,gain:.05,wet:.1})}
        o5('triangle',midi15(chord-24),t,spb*.85,{gain:.07,attack:.01,wet:.1});
      }
      n5(t,.025,{freq:8000,type:'highpass',gain:.05,wet:.05});if(climax)n5(t+spb/4,.02,{freq:9000,type:'highpass',gain:.035,wet:.05});
      if(inBar===0&&k%2===0){
        if(T.ins==='organ')[0,4,7].forEach(iv=>o5('sine',midi15(chord+iv),t,spb*3.6,{gain:.022,attack:.08,wet:.6}));
        else if(T.ins==='pluck')[0,4,7,12].forEach((iv,i)=>o5('triangle',midi15(chord+12+iv),t+i*spb/2,spb*.4,{gain:.025,wet:.4}));
        else if(T.ins==='saw')[0,3,7].forEach(iv=>o5('sawtooth',midi15(chord+iv),t,spb*3.4,{gain:.01,attack:.1,wet:.6,detune:iv?8:-8}));
        else if(T.ins==='bell')[0,7].forEach((iv,i)=>o5('sine',midi15(chord+24+iv),t+i*spb,spb*1.2,{gain:.02,wet:.7}));
        else{o5('sine',midi15(chord-12),t,spb*4,{gain:.04,attack:.2,wet:.5});n5(t,spb*2,{freq:400,type:'lowpass',gain:.04,wet:.6})}
        if(chorus)o5('triangle',midi15(chord+19),t,spb*.5,{gain:.018,wet:.5});
      }
    }
    for(const n of notes){if(n.played||n.k==='x')continue;const t=S.start+n.t;if(t<ahead&&t>=now-.05){n.played=true;
      o5(n.owner===0?'square':'sawtooth',midi15(T.root+12+T.scale[n.deg%T.scale.length]+(n.lane>1?12:0)+(n.k==='g'?12:0)),t,n.len?n.len:tm.spbAt(Math.floor(n.b/4))*.42,{gain:n.owner===ME?.035:.028,attack:.004,wet:.35,detune:n.owner===0?-6:6})}}
  }
  /* ---------- fim de faixa / fim de jogo ---------- */
  function trackRes(si){const sd=side[si],acc=accOf(sd);return{n:T.n,id:T.id,rank:rhRank38(acc,sd.miss),acc:Math.round(acc*10)/10,ess:sd.ess-sd.ess0,max:sd.max,perf:sd.perf,great:sd.great,good:sd.good,miss:sd.miss,hOk:sd.hOk,hDrop:sd.hDrop,xHit:sd.xHit,xDodge:sd.xDodge,gold:sd.gold,dspN:sd.dspN,ok:S.collapsed<0}}
  function trackEnd(){
    if(S.res.length>S.ti)return;
    const r=trackRes(ME);S.res.push(r);
    if(r.rank==='S+')C.achieve?.('rh_splus');
    /* progresso: rank sempre; faixa concluída (abre semanas) só na campanha contra o Perseus */
    progPut38(p=>{p.rh=p.rh||{tr:{},wk:{}};p.rh.tr=p.rh.tr||{};p.rh.wk=p.rh.wk||{};const q=p.rh.tr[r.id]||{};
      r.first=!q.ok&&r.ok&&!pvp;r.newRank=rhBetter38(r.rank,q.rank);
      if(r.newRank)q.rank=r.rank;if(r.acc>(q.acc||0))q.acc=r.acc;if(r.ok&&!pvp)q.ok=1;p.rh.tr[r.id]=q;
      const w=T.w;if(!pvp&&[0,1,2].every(i=>p.rh.tr[rhId38(w,i)]?.ok)){if(!p.rh.wk[w])r.weekNew=w;p.rh.wk[w]=1}
      if(RHW38.every((_,i)=>p.rh.wk[i]))C.achieve?.('rh_coral')});
    if(S.collapsed<0&&S.ti<list.length-1){
      side.forEach(s=>{s.luc=Math.min(100,s.luc+30);s.dspOn=0});S.inter={until:pnow38()+5200,r,op:trackRes(OP)};
      try{if(side[ME].ess>=side[OP].ess)fx5('mgWin')}catch(e){}
      return}
    finish();
  }
  function collapse(si){if(S.collapsed>=0)return;S.collapsed=si;finish()}
  function finish(){
    if(S.end)return;if(S.res.length<=S.ti)trackEnd();if(S.end)return;S.end=true;clearInterval(S.timer);
    try{if(S.yv!=null)YT6.player.setVolume(S.yv)}catch(e){}
    const me=side[ME],tot=S.res.reduce((a,r)=>({miss:a.miss+r.miss,hits:a.hits+r.perf+r.great+r.good}),{miss:0,hits:0});
    if(S.collapsed<0&&tot.miss===0&&tot.hits>0)C.achieve?.('mente');
    if(S.collapsed!==ME)C.achieve?.('ritual1');
    if(me.maxAll>=60)C.achieve?.('combo');
    if(list.length>1&&S.collapsed<0)C.achieve?.('rh_semana');
    if(pvp&&!C.host){C.send('rhfin',{ess:me.ess,luc:me.luc,miss:me.miss,max:me.max,col:S.collapsed===ME,r:S.res[0]||null});return}
    if(pvp&&C.host){S.wait=Date.now();return}
    done();
  }
  function done(){
    const me=side[ME],op=side[OP];
    let win=me.ess>=op.ess?ME:OP;if(S.collapsed===ME)win=OP;else if(S.collapsed===OP)win=ME;
    const rkMe=S.res.length?S.res[S.res.length-1].rank:'D';
    const rows=[{u:C.me,n:meInfo.n,c:meInfo.c,s:me.ess,w:win===ME},{u:oppU,n:oppInfo.n,c:oppInfo.c,s:op.ess,w:win===OP}];
    const why=S.collapsed>=0?` · ${S.collapsed===ME?meInfo.n:oppInfo.n} colapsou`:'';
    const html=summary();
    if(S.collapsed<0&&me.ess===op.ess){rows.forEach(r=>r.w=false);C.finish({title:'Empate na batalha de rituais · '+me.ess+' ⚗ cada',rows,html,unit:'⚗'});return}
    const head=list.length>1?`${T.wk.n}: `:'';
    C.finish({title:head+(win===ME?(pvp?'Vitória de '+meInfo.n:'Você venceu o Perseus!'):(pvp?'Vitória de '+oppInfo.n:'O Perseus venceu a batalha'))+why+(list.length===1&&S.collapsed<0?` · Rank ${rkMe}`:''),rows,html,unit:'⚗'});
    if(!pvp)C.say(win===ME?sayFmt(SAY12['humanWin_'+C.diff]||SAY12.humanWin):sayFmt(SAY12['aiWin_'+C.diff]||SAY12.aiWin),false);
  }
  function summary(){
    const R=S.res;if(!R.length)return'';
    const row=r=>`<tr><th scope="row">${esc(r.n)}</th><td><b class="${rkCls38(r.rank)}">${r.rank}</b></td><td>${r.acc.toFixed(1)}%</td><td>${r.perf} · ${r.great} · ${r.good} · ${r.miss}</td><td>${r.max}</td><td>${r.hOk}/${r.hOk+r.hDrop}</td><td>${r.xDodge} · ${r.xHit}</td></tr>`;
    return`<table class="r38-t"><caption>Sua avaliação</caption><thead><tr><th scope="col">Faixa</th><th scope="col">Rank</th><th scope="col">Precisão</th><th scope="col">Perf. · Ót. · Bom · Erro</th><th scope="col">Combo</th><th scope="col">Longas</th><th scope="col">Corromp. evitadas · tocadas</th></tr></thead><tbody>${R.map(row).join('')}</tbody></table>${R.some(r=>r.first)?'<p class="sub">🆕 Faixa concluída pela primeira vez.</p>':''}${R.some(r=>r.weekNew!=null)?`<p class="r38-hi">📅 ${esc(RHW38[R.find(r=>r.weekNew!=null).weekNew].n)} concluída! ${R.find(r=>r.weekNew!=null).weekNew<4?'A próxima semana foi aberta.':'Você fechou a campanha.'}</p>`:''}`;
  }
  /* ---------- desenho ---------- */
  function drawNote(x,n,cx,y,mine){
    const L=LANE15[n.lane];
    if(n.k==='h'){const y2=RY+(n.t+n.len-songT())*(mine?spdMe():speed),ya=n.holding?RY:y;if(y2>ya){x.save();x.globalAlpha=n.holding?.85:.55;x.fillStyle=L.c;rr16(x,cx-8,ya,16,y2-ya,8);x.fill();x.globalAlpha=1;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.5;x.stroke();x.restore()}if(n.holding)return}
    if(n.k==='x'){const jx=(Math.random()-.5)*3;x.save();arrow(x,cx+jx,y,SR-2,L.a,'#16081f','#b04bff',2.5);x.strokeStyle='#ff4d6d';x.lineWidth=3;x.beginPath();x.moveTo(cx-9,y-9);x.lineTo(cx+9,y+9);x.moveTo(cx+9,y-9);x.lineTo(cx-9,y+9);x.stroke();x.restore();return}
    if(n.k==='g'){x.save();x.shadowColor='#ffd36b';x.shadowBlur=14;arrow(x,cx,y,SR-1,L.a,'#ffd36b','#fff7d6',2.5);x.restore();txt16(x,T.wk.sub,cx,y+1,{size:11,w:900,col:'#5a3a00'});return}
    arrow(x,cx,y,SR-2,L.a,L.c,'#fff',2);
  }
  const spdMe=()=>S.sab.distorcao>pnow38()?speed*(1+.35*Math.sin(pnow38()/140)):speed;
  return{
    st:()=>({side,notes,song:{n:T.n,el:T.el},bpm:tm.bpmOf(0),S,ME,OP,T,tm,list,END,awaken:()=>awaken(ME),sabotage,phase}),
    key(code,down){
      const l=KEYLANE15[code];if(l!=null){if(down)press(l);else release(l);return}
      if(!down)return;
      if(code==='Space'||code==='Enter'){awaken(ME);return}
      const k=SABK38.find(k=>SAB38[k].key===code);if(k)sabotage(k);
    },
    ptr(t,px,py,e){const id=e?.pointerId??0;
      if(t==='up'){const l=S.ptr[id];if(l!=null){release(l);delete S.ptr[id]}return}if(t!=='down')return;
      if(py>H-60&&px>W/2-150&&px<W/2+150){awaken(ME);return}
      const xs=px>=W/2?LX[ME===1?1:1]:[0,1,2,3].map(i=>W*(i+.5)/4);let best=0,bd=1e9;xs.forEach((x0,i)=>{const d=Math.abs(px-x0);if(d<bd){bd=d;best=i}});S.ptr[id]=best;press(best)},
    step(dt){
      const now=Date.now(),pn=pnow38();
      if(!S.ac&&now>=C.t0-1500){S.ac=actx();if(S.ac){S.start=S.ac.currentTime+Math.max(0,(C.t0-now)/1000)+tm.spbAt(0)*2;S.timer=setInterval(sched,25);try{S.yv=YT6.player.getVolume();YT6.player.setVolume(Math.min(S.yv,8))}catch(e){S.yv=null}}}
      if(!S.ac||S.end){if(S.wait&&(Date.now()-S.wait>3000||S.gotFin)){S.wait=0;done()}return}
      if(S.inter){if(pn>=S.inter.until){S.inter=null;load(S.ti+1);S.start=S.ac.currentTime+tm.spbAt(0)*2}else{C.hud(`📅 <b>${esc(T.wk.n)}</b> · faixa ${S.ti+1} de ${list.length} concluída`);return}}
      const t=songT();
      side.forEach(sd=>{if(sd.dspOn&&pn>sd.dspOn){sd.dspOn=0;sd.dsp=0}else if(sd.dspOn)sd.dsp=Math.max(0,100*(sd.dspOn-pn)/8000)});
      if(!pvp)aiStep(t);
      for(const n of notes){if(n.owner!==ME)continue;
        if(n.holding){if(!S.held[n.lane]&&t<n.t+n.len-.12)holdEnd(ME,n,false);else if(t>=n.t+n.len)holdEnd(ME,n,true);else{const sd=side[ME];sd.drain+=140*dt*mul(ME);const d=Math.floor(sd.drain);sd.drain-=d;sd.ess+=d;if(!(sd.dspOn>pn))sd.dsp=Math.min(100,sd.dsp+1.5*dt)}continue}
        if(!n.j&&t-n.t>WIN[2]){if(n.k==='x')dodgeX(ME,n);else miss(ME,n);if(pvp)C.send('rh',{i:n.i,j:n.k==='x'?'ok':'miss'})}}
      if(pvp)for(const n of notes)if(n.owner===OP&&n.holding){const sd=side[OP];sd.drain+=140*dt*mul(OP);const d=Math.floor(sd.drain);sd.drain-=d;sd.ess+=d}
      if(pvp&&now-S.lastSync>400){S.lastSync=now;const m=side[ME];C.send('rhs',{ess:m.ess,luc:m.luc,combo:m.combo,dsp:Math.round(m.dsp)})}
      if(side[ME].maxAll>=60)C.achieve?.('combo');
      if(side[ME].luc<=0)collapse(ME);else if(!pvp&&side[OP].luc<=0)collapse(OP);
      if(t>END)trackEnd();
      const ph=phase(),sd=side[ME];
      C.hud(`🎵 <b>${esc(T.n)}</b>${list.length>1?` · ${S.ti+1}/${list.length}`:''} · ${tm.bpmOf(Math.floor(beatNow()/4))} BPM · ${t<0?'prepare-se':ph===ME?'<b style="color:#ffd36b">sua vez</b>':'vez de '+esc(oppInfo.n)} · combo ${sd.combo} · ${accOf(sd).toFixed(1)}%${sd.dsp>=100&&!(sd.dspOn>pn)?' · <b style="color:#ffe9a0">✨ Espaço: Despertar</b>':''}`);
    },
    msg(p){
      if(p.from!==oppU)return;
      if(p.t==='rh'){const n=notes[p.i|0];if(!n||n.owner!==OP||n.j)return;
        if(p.j==='X')hitX(OP,n);else if(p.j==='ok')dodgeX(OP,n);else if(p.j==='miss')miss(OP,n);else{const dt=p.j==='PERFEITO'?0:p.j==='ÓTIMO'?.06:p.j==='BOM'?.1:1;judge(OP,n,dt)}}
      if(p.t==='rhh'){const n=notes[p.i|0];if(n&&n.owner===OP)holdEnd(OP,n,!!p.ok)}
      if(p.t==='rhs'){const o=side[OP];o.ess=Math.max(0,Number(p.ess)||0);o.luc=Math.max(0,Math.min(100,Number(p.luc)));if(!(o.dspOn>pnow38()))o.dsp=Math.max(0,Math.min(100,Number(p.dsp)||0));if(o.luc<=0)collapse(OP)}
      if(p.t==='rhd'){const o=side[OP];o.dsp=100;awaken(OP,false)}
      if(p.t==='rhx'&&SAB38[p.k])getSab(p.k,oppInfo.n);
      if(p.t==='rhfin'&&C.host){const o=side[OP];o.ess=Number(p.ess)||o.ess;o.luc=Number(p.luc);if(p.col)S.collapsed=S.collapsed<0?OP:S.collapsed;S.gotFin=true}
    },
    left(u){if(u===oppU&&!S.end){side[OP].luc=0;collapse(OP)}},
    end(){S.end=true;clearInterval(S.timer);try{if(S.yv!=null)YT6.player.setVolume(S.yv)}catch(e){}},
    reward(){
      const R=S.res.length?S.res:[trackRes(ME)],base={'S+':24,S:18,A:12,B:8,C:5,D:2};
      let ob=R.reduce((a,r)=>a+(r.ok||pvp?base[r.rank]||2:1),0)*gdMul38(C.gd)*(pvp?.7:1);
      const firsts=R.filter(r=>r.first).length,weeks=R.filter(r=>r.weekNew!=null).length,splus=R.filter(r=>r.rank==='S+'&&r.newRank).length;
      ob+=firsts*10+weeks*40+splus*15;if(list.length>1&&S.collapsed<0)ob+=15;
      const why=[R.length>1?`${R.length} faixas`:'',firsts?'faixa nova':'',weeks?'semana concluída':'',splus?'S+ novo':''].filter(Boolean).join(' · ');
      return{ob:Math.round(ob),xp:Math.round(ob*.6),ap:R.length*5,d:Math.min(12,R.length*4),why:why||`Rank ${R[R.length-1].rank}`}},
    next(){if(pvp||list.length>1||S.collapsed>=0)return null;const w=T.w,t=T.t;
      if(t<2)return{opt:{tr:String(t+1)},label:`Próxima faixa: ${RHW38[w].tr[t+1][0]}`};
      if(w<4&&rhOpen38(w+1))return{opt:{wk:String(w+1),tr:'0'},label:`${RHW38[w+1].n}`};return null},
    draw(x){
      const pn=pnow38(),t=songT(),beat=t>0?tm.beat(t):0,bk=t>0?beat%1:0,pulse=Math.pow(1-bk,3),ph=phase(),me=side[ME];
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,T.col[0]);gr.addColorStop(1,T.col[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
      if(me.dspOn>pn){const g2=x.createRadialGradient(W*.75,H*.5,40,W*.75,H*.5,420);g2.addColorStop(0,`rgba(255,211,107,${.12+pulse*.1})`);g2.addColorStop(1,'rgba(255,211,107,0)');x.fillStyle=g2;x.fillRect(0,0,W,H);x.strokeStyle=`rgba(255,233,160,${.5+pulse*.4})`;x.lineWidth=6;x.strokeRect(3,3,W-6,H-6)}
      x.fillStyle=`rgba(255,255,255,${.04+pulse*.05})`;for(let i=0;i<30;i++)x.fillRect((i*131)%W,(i*67)%H,2,2);
      x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,0,W,4);x.fillStyle=EL12[T.el].c;x.fillRect(0,0,W*Math.max(0,Math.min(1,t/END)),4);
      for(let si=0;si<2;si++){
        const mine=si===ME,trem=mine&&S.sab.tremor>pn?Math.sin(pn/45)*8:0,lx=LX[mine?1:0].map(v=>v+trem),active=ph===si&&t>=0;
        x.save();x.globalAlpha=active?1:.45;
        lx.forEach((cx,l)=>{const L=LANE15[l],fl=mine&&(pn-S.flash[l]<120||S.held[l]);arrow(x,cx,RY,SR+(fl?3:0),L.a,fl?L.c:'rgba(255,255,255,.18)',fl?'#fff':L.c,2.5)});
        x.restore();
        const sp=mine?spdMe():speed;
        for(const n of notes){if(n.owner!==si)continue;if(n.j&&n.j!=='miss'&&!n.holding)continue;const y=RY+(n.t-t)*sp;if(!n.holding&&(y<-40||y>H+40))continue;if(n.k==='h'&&!n.holding&&y>H+40)continue;
          x.save();x.globalAlpha=n.j==='miss'?.3:1;drawNote(x,n,lx[n.lane],y,mine);x.restore()}
        if(mine&&S.sab.nevoa>pn){const x0=lx[0]-44,x1=lx[3]+44,g3=x.createLinearGradient(0,RY+70,0,RY+150);g3.addColorStop(0,'rgba(215,200,235,0)');g3.addColorStop(1,'rgba(215,200,235,.96)');x.fillStyle=g3;x.fillRect(x0,RY+70,x1-x0,80);x.fillStyle='rgba(215,200,235,.96)';x.fillRect(x0,RY+150,x1-x0,H-RY-150);txt16(x,'🌫',(x0+x1)/2,H-80,{size:40})}
      }
      const bob=pulse*6,po=(si,cx)=>{const sd=side[si],k=pn-sd.poseT<220?sd.pose:-1,dx=k===0?-12:k===3?12:0,dy=k===1?8:k===2?-12:0;return[cx+dx,300-bob+dy]};
      const [ox,oy]=po(OP,180),[mx,my]=po(ME,620);
      mgCat(x,oppInfo.c,ox,oy,130,oppInfo.n,{flip:false});mgCat(x,meInfo.c,mx,my,130,meInfo.n,{flip:true,ring:true});
      [[OP,60],[ME,W-260]].forEach(([si,bx])=>{const sd=side[si];x.fillStyle='rgba(0,0,0,.45)';x.fillRect(bx,378,200,10);x.fillStyle=sd.luc>35?'#9b7bff':'#ff6b5b';x.fillRect(bx,378,2*sd.luc,10);
        x.fillStyle='rgba(0,0,0,.45)';x.fillRect(bx,392,200,6);x.fillStyle=sd.dspOn>pn?'#fff3c2':sd.dsp>=100?(Math.floor(pn/200)%2?'#ffd36b':'#fff3c2'):'#c9a640';x.fillRect(bx,392,2*sd.dsp,6);
        x.font='700 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='left';x.textBaseline='bottom';x.fillStyle='#e9e1ff';x.fillText(`🧠 Lucidez ${Math.round(sd.luc)} · ⚗ ${sd.ess}${sd.dspOn>pn?' · ✨×2':''}`,bx,375)});
      const ms=side[ME].ess,os=side[OP].ess,share=ms+os?ms/(ms+os):.5,bw=300,bx=W/2-bw/2,by=418,cut=bx+bw*(1-share);
      x.fillStyle=mgCol(oppInfo.c);x.fillRect(bx,by,cut-bx,12);x.fillStyle=mgCol(meInfo.c);x.fillRect(cut,by,bx+bw-cut,12);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(bx,by,bw,12);
      x.beginPath();x.arc(cut,by+6,9+pulse*3+(me.dspOn>pn?4:0),0,7);x.fillStyle=me.dspOn>pn?'#ffe9a0':'#fff';x.fill();
      txt16(x,share>.55?'A batalha pende para você':share<.45?'A batalha pende para '+oppInfo.n.split(' · ')[0]:'Batalha equilibrada',W/2,by-10,{size:13,w:800});
      if(t>=0&&!S.end&&!S.inter)txt16(x,ph===ME?'▶ SUA VEZ':'♪ '+oppInfo.n.split(' · ')[0]+' canta',W/2,150,{size:16,w:800,col:ph===ME?'#ffd36b':'#c9b8ff'});
      else if(t<0&&!S.inter)txt16(x,t<-tm.spbAt(0)*1.5?(list.length>1?`Faixa ${S.ti+1}: ${T.n}`:'Prepare-se'):String(Math.ceil(-t/tm.spbAt(0))),W/2,200,{size:t<-tm.spbAt(0)*1.5?30:40,w:800,stroke:5});
      if(me.combo>=5)txt16(x,me.combo+' combo',LX[1][1]+30,200,{size:22,w:900,col:'#ffd36b'});
      if(me.dsp>=100&&!(me.dspOn>pn)&&t>=0&&!S.inter)txt16(x,touch12()?'✨ toque em ✨ para DESPERTAR':'✨ ESPAÇO: DESPERTAR',LX[1][1]+30,230,{size:15,w:900,col:Math.floor(pn/250)%2?'#ffe9a0':'#ffd36b',stroke:4});
      S.pops=S.pops.filter(p=>pn-p.t0<650);S.pops.forEach(p=>{const k=(pn-p.t0)/650,cx=p.si===ME?LX[1][1]+30:LX[0][1]+30;x.save();x.globalAlpha=1-k;txt16(x,p.txt,cx,RY+60-k*20,{size:20,w:900,col:p.col,stroke:4});x.restore()});
      /* sabotagens disponíveis */
      if(t>=0&&!S.end&&!S.inter){const cd=S.sabCd>pn,ok=me.ess>=SABCOST38&&!cd;x.save();x.globalAlpha=ok?1:.45;txt16(x,`${SABK38.map((k,i)=>`${i+1} ${SAB38[k].ico}`).join('   ')}   ·   ${cd?'recarregando':SABCOST38+' ⚗'}`,W/2,H-62,{size:12,w:700,col:'#e0d4ff'});x.restore()}
      const act=SABK38.filter(k=>S.sab[k]>pn);if(act.length)txt16(x,act.map(k=>`${SAB38[k].ico} ${SAB38[k].n}`).join(' · ')+` (${((Math.max(...act.map(k=>S.sab[k]))-pn)/1000).toFixed(1)} s)`,LX[1][1]+30,RY+120,{size:13,w:800,col:'#ffd0f0',stroke:4});
      if(S.banner&&pn-S.banner.t0<1400){const a=SAB38[S.banner.k];txt16(x,`${a.ico} ${S.banner.from.split(' · ')[0]} lançou ${a.n}!`,W/2,112,{size:18,w:900,col:'#ffb3e6',stroke:5})}
      if(S.inter){const r=S.inter.r;x.fillStyle='rgba(8,4,14,.82)';x.fillRect(0,0,W,H);
        txt16(x,`${r.n} · concluída`,W/2,90,{size:22,w:800});txt16(x,r.rank,W/2,175,{size:96,w:900,col:r.rank.startsWith('S')?'#ffd36b':'#e9e1ff',stroke:6});
        txt16(x,`Precisão ${r.acc.toFixed(1)}% · combo ${r.max} · ${r.perf} perfeitos · ${r.miss} erros`,W/2,250,{size:15,w:600});
        txt16(x,`Você ${side[ME].ess} ⚗  ×  ${side[OP].ess} ⚗ ${oppInfo.n.split(' · ')[0]}`,W/2,282,{size:15,w:700,col:'#ffd36b'});
        txt16(x,`Próxima: ${list[S.ti+1].n} · ${list[S.ti+1].b0}→${list[S.ti+1].b1} BPM · +30 de Lucidez`,W/2,330,{size:16,w:700,col:'#c9b8ff'});
        txt16(x,String(Math.ceil((S.inter.until-pn)/1000)),W/2,385,{size:30,w:900})}
      txt16(x,`${T.n} · ${tm.bpmOf(Math.floor(beat/4))} BPM`,W-10,16,{size:12,w:600,al:'right',col:'rgba(255,255,255,.75)'});
    }
  };
}
defineArcadeGame('rhythm',{...GAMES12.rhythm,make:rhythm38,setup:rhSetup38,pad:'rh38',
  desc:'Campanha em 5 Semanas contra o Perseus. Notas longas, corrompidas (não aperte!) e douradas, Despertar, sabotagens e rank S+ a D.',
  rule:'PvP 1v1: frases alternadas com o mesmo gráfico. Gaste Essência em sabotagens (1, 2, 3) durante a vez do rival. Vence quem tiver mais Essência ou quem não colapsar.',
  keys:'Setas ← ↓ ↑ → (ou A S W D) · segure as notas longas · Espaço: Despertar · 1 2 3: sabotagens',touch:'Toque nas setas embaixo · ✨ desperta · 🌫 🕳 🌿 sabotam'});
console.info('[Tulpa] Etapa 38 carregada (Arcade 2.0 · Ritual Rhythm 2.0)');

/* ===================================================================
   TULPA · ETAPA 39 — 🕹 ARCADE 2.0 · ONDA 1 (parte 2)
   🌀 FUGA ALÉM DO VÉU 2.0
   6 fases com música própria (Limiar da Fé → Coração do Véu), geradas
   sempre iguais para cada dificuldade (dá para decorar), 3 Moedas Astrais
   secretas por fase, Modo Prática com checkpoints manuais e o Infinito
   clássico. Portais: Cubo (pulo), Gravidade (toque vira), Nave Astral
   (segure sobe, solte desce), Velocidade 0.5x/1x/2x/3x e Mini-Perseus.
   Orbes amarelos pulam no ar, rampas amarelas lançam alto.
   Mesa: corrida até a linha de chegada com fantasmas dos colegas.
   A física é uma função pura (fuStep38) para o teste resolver as fases.
   =================================================================== */
const FUP38={G:2600,JV:860,JVM:600,PAD:1.32,SZ:30,SZM:18,FL:380,CE:70,PX:170,SHA:2300,SHV:460};
const FU38=[
  {id:'limiar',n:'Limiar da Fé',ico:'🕯',bpm:118,c:['#1b1206','#3e2a0c'],a:'#ffd36b',root:60,sc:[0,2,4,7,9],
    secs:[['j',1,0,16,'spike1 spike1 block'],['j',1,0,24,'spike1 spikeN block stairs',1],['j',.5,0,12,'stairs block'],['j',1,0,20,'orbPit spike1 pad',1],['j',2,0,12,'spike1'],['j',1,0,24,'spikeN stairs orbPit pad',1]]},
  {id:'raizes',n:'Floresta das Raízes',ico:'🌿',bpm:124,c:['#06170c','#123d22'],a:'#7dffa8',root:57,sc:[0,3,5,7,10],
    secs:[['j',1,0,16,'spike1 block stairs'],['f',1,0,20,'fspike',1],['j',1,0,20,'orbPit pad spikeN'],['j',2,0,16,'spike1 pad',1],['f',1,0,16,'fspike'],['j',1,0,24,'orbPit stairs spikeN',1]]},
  {id:'espiral',n:'Espiral da Ilusão',ico:'🌀',bpm:130,c:['#150a24','#3a1650'],a:'#c39bff',root:62,sc:[0,2,3,7,8],
    secs:[['j',1,0,12,'spike1 spikeN'],['s',1,0,24,'gate corridor',1],['j',1,1,16,'miniTunnel mspike',1],['j',1,0,16,'orbPit pad'],['s',1,0,16,'gate'],['f',1,0,16,'fspike',1],['j',1,0,16,'spikeN stairs']]},
  {id:'tribunal',n:'Tribunal da Verdade',ico:'👁',bpm:136,c:['#061a22','#0f3a4a'],a:'#7fe3ff',root:59,sc:[0,2,4,6,9],
    secs:[['j',.5,0,12,'stairs block'],['j',2,0,16,'spike1 pad'],['s',1,1,20,'gate corridor',1],['f',2,0,16,'fspike'],['j',1,0,20,'orbChain spikeN',1],['s',2,0,16,'gate'],['j',3,0,12,'spike1'],['j',1,1,16,'miniTunnel',1]]},
  {id:'vazio',n:'Eco do Vazio',ico:'🕳',bpm:144,c:['#07060d','#1f1a33'],a:'#b9a6ff',root:55,sc:[0,1,5,7,10],
    secs:[['j',1,0,16,'spikeN orbPit'],['s',2,0,16,'gate',1],['j',1,1,16,'miniTunnel mspike'],['f',1,0,16,'fspike',1],['j',3,0,16,'spike1'],['s',1,1,20,'gate corridor'],['j',2,0,16,'orbPit pad spike1',1],['j',3,0,12,'spike1']]},
  {id:'coracao',n:'Coração do Véu',ico:'❤️',bpm:150,c:['#1a0610','#4a0f2a'],a:'#ff7aa8',root:58,sc:[0,2,3,7,10],
    secs:[['j',1,0,16,'spikeN stairs pad'],['f',2,0,16,'fspike'],['s',1,0,20,'gate corridor',1],['j',1,1,16,'miniTunnel mspike'],['j',2,0,16,'orbChain pad',1],['s',2,1,16,'gate'],['f',1,0,12,'fspike'],['j',3,0,16,'spike1',1],['j',.5,0,8,'stairs'],['s',3,0,12,'gate']]},
];
const FUTAG38=s=>{const m=new Set();s.secs.forEach(([md,sp,mi,,p])=>{if(md==='f')m.add('Gravidade');if(md==='s')m.add('Nave');if(mi)m.add('Mini');if(sp>=2)m.add(sp+'x');if(sp<1)m.add('0.5x');if(/orb/.test(p))m.add('Orbes');if(/pad/.test(p))m.add('Rampas')});return[...m].join(' · ')};
function fuProg38(){const p=prog38().fu||{};return{st:p.st||{}}}
function fuOpen38(i){return i===0||!!fuProg38().st[FU38[i-1]?.id]?.done}
const coinsTxt38=c=>[0,1,2].map(i=>c&&c[i]?'●':'○').join('');

/* ---------- geração das fases (determinística por fase e dificuldade) ---------- */
function fuLevel38(si,gd){
  const st=FU38[si],li=GD12[gd]??1,base=[220,250,275,300][li],spb=60/st.bpm,P=FUP38,FL=P.FL,CE=P.CE,SPW=26;
  const rng=mb32((7919*(si+1)+li*104729)>>>0);
  const L={obs:[],trig:[],base,spb,st,si,li,coins:0,secs:[]};let nid=0;
  const add=o=>{o.id=nid++;if(o.w==null)o.w=0;(['portal','spd','mini','end'].includes(o.t)?L.trig:L.obs).push(o);return o};
  const phys=(m,mini,sp)=>{const spd=base*sp,jv=mini?P.JVM:P.JV,sz=mini?P.SZM:P.SZ;return{m,mini,sp,spd,bpx:spd*spb,jv,sz,span:spd*2*jv/P.G,jh:jv*jv/(2*P.G),spanP:spd*2*jv*P.PAD/P.G,flip:spd*Math.sqrt(2*(FL-CE-sz)/P.G)}};
  let shipC=(FL+CE)/2;
  const PAT={
    spike1:(x,k)=>{const w=k.mini?18:SPW,h=k.mini?16:26;add({t:'sp',x,w,h,side:1});return x+w+Math.max(k.span*1.15,k.bpx)},
    mspike:(x,k)=>PAT.spike1(x,k),
    spikeN:(x,k)=>{const nmax=Math.max(1,Math.min(3,Math.floor(k.span*.5/SPW))),n=1+Math.floor(rng()*nmax);add({t:'sp',x,w:n*SPW,h:26,side:1});return x+n*SPW+k.span*1.15},
    block:(x,k)=>{const w=60+rng()*50,h=Math.min(k.jh*.55,24+rng()*30);add({t:'bl',x,w,h});return x+w+k.span},
    stairs:(x,k)=>{const n=2+(rng()<.5?1:0);let h=k.jh*.4,xx=x;for(let i=0;i<n;i++){const w=Math.max(70,k.spd*.28)+rng()*20;add({t:'bl',x:xx,w,h});xx+=w;h+=k.jh*.38}return xx+k.span*1.1},
    pad:(x,k)=>{add({t:'pad',x,w:30});add({t:'bl',x:x+k.spanP*.42,w:34,h:k.jh*1.2});return x+k.spanP*1.15},
    orbPit:(x,k)=>{const w=k.span*1.35;add({t:'sp',x,w,h:26,side:1});add({t:'orb',x:x+k.span*.5,y:FL-k.sz/2-k.jh*.8,r:30});return x+w+k.span},
    orbChain:(x,k)=>{const w=k.span*2.25,o1=x+k.span*.5;add({t:'sp',x,w,h:26,side:1});add({t:'orb',x:o1,y:FL-k.sz/2-k.jh*.8,r:30});add({t:'orb',x:o1+k.span,y:FL-k.sz/2-k.jh*.8,r:30});return x+w+k.span},
    fspike:(x,k)=>{const side=rng()<.5?1:-1,w=SPW*(1+Math.floor(rng()*2));add({t:'sp',x,w,h:26,side});return x+w+Math.max(2*k.bpx,k.flip*1.5)},
    gate:(x,k)=>{const gap=[165,150,138,128][li]-(k.mini?25:0),dt=2*k.bpx/k.spd,maxD=Math.min(120,P.SHV*dt*.45);
      let c=shipC+(rng()*2-1)*maxD;c=Math.max(CE+gap/2+12,Math.min(FL-gap/2-12,c));shipC=c;
      add({t:'pil',x,w:40,y0:CE,y1:c-gap/2});add({t:'pil',x,w:40,y0:c+gap/2,y1:FL});return x+40+2*k.bpx},
    corridor:(x,k)=>{const w=2*k.bpx;add({t:'sp',x,w,h:26,side:1});add({t:'sp',x,w,h:26,side:-1});shipC=(FL+CE)/2;return x+w+k.bpx},
    miniTunnel:(x,k)=>{const Lw=4*k.bpx;add({t:'slab',x,w:Lw,y:FL-100});let xx=x+k.bpx;const n=Math.max(1,Math.floor((Lw-2*k.bpx)/(k.span*1.2)));for(let i=0;i<n;i++){add({t:'sp',x:xx,w:18,h:16,side:1});xx+=k.span*1.2}return x+Lw+k.bpx},
  };
  const COIN={
    j:(x,k)=>{
      if(k.mini){const Lw=4*k.bpx;add({t:'slab',x,w:Lw,y:FL-100});const sx=x+k.bpx*1.5;add({t:'sp',x:sx,w:18,h:16,side:1});add({t:'coin',x:sx+9,y:FL-k.sz/2-k.jh*.92,i:L.coins++});return x+Lw+k.bpx}
      add({t:'sp',x,w:SPW,h:26,side:1});const ox=x+13;add({t:'orb',x:ox,y:FL-k.sz/2-k.jh*.85,r:30,opt:1});
      add({t:'coin',x:ox+k.span*.45,y:FL-k.sz/2-k.jh*1.6,i:L.coins++});
      const s2=ox+k.span*1.55;add({t:'sp',x:s2,w:SPW,h:26,side:1});return s2+SPW+k.span*1.15},
    f:(x,k)=>{const D=Math.max(2*k.bpx,k.flip*1.5);add({t:'sp',x,w:SPW,h:26,side:-1});const sx=x+SPW+D;add({t:'sp',x:sx,w:SPW,h:26,side:1});add({t:'coin',x:sx+13,y:(FL+CE)/2,i:L.coins++});return sx+SPW+D},
    s:(x,k)=>{const w=3*k.bpx;add({t:'sp',x,w,h:26,side:1});add({t:'sp',x,w,h:26,side:-1});add({t:'coin',x:x+w/2,y:FL-26-24,i:L.coins++});shipC=(FL+CE)/2;return x+w+k.bpx},
  };
  let x=P.PX+base*spb*4,cur={m:'j',sp:1,mini:0};
  for(const [m,sp,mini,beats,pats,coin] of st.secs){
    const k=phys(m,mini,sp),ch=[];
    if(sp!==cur.sp)ch.push({t:'spd',v:sp});if(m!==cur.m)ch.push({t:'portal',to:m});if(mini!==cur.mini)ch.push({t:'mini',v:mini});
    if(ch.length){ch.forEach((c,i)=>add({...c,x:x+i*k.bpx*.5}));x+=k.bpx*(ch.length*.5+3)}
    if(m==='s')shipC=(FL+CE)/2;
    const s0=x,end=x+beats*k.bpx,P2=pats.split(' ');let coinTodo=!!coin;
    const snap=v=>s0+Math.ceil((v-s0)/(k.bpx/2)-1e-6)*(k.bpx/2);
    L.secs.push({x:s0,m,sp,mini});
    while(x<end-k.bpx){
      if(coinTodo&&x>s0+(end-s0)*.3){x=snap(COIN[m](x,k));coinTodo=false;continue}
      x=snap(PAT[P2[Math.floor(rng()*P2.length)]](x,k));
      if(rng()<[.4,.25,.15,.08][li])x=snap(x+k.bpx*2);
    }
    if(coinTodo)x=snap(COIN[m](x,k));
    x=Math.max(x,end);cur={m,sp,mini};
  }
  const k=phys(cur.m,cur.mini,cur.sp);add({t:'end',x:x+k.bpx*3});L.len=x+k.bpx*3-P.PX;
  L.obs.sort((a,b)=>a.x-b.x);L.trig.sort((a,b)=>a.x-b.x);L.maxW=Math.max(60,...L.obs.map(o=>o.w||0));
  return L;
}
function fuFrom38(L,x0){let lo=0,hi=L.obs.length;while(lo<hi){const m=(lo+hi)>>1;if(L.obs[m].x<x0)lo=m+1;else hi=m}return lo}
function fuNear38(L,wx){const out=[];for(let i=fuFrom38(L,wx-L.maxW-60);i<L.obs.length;i++){const o=L.obs[i];if(o.x>wx+60)break;if(o.x+o.w+40>=wx)out.push(o)}return out}
const fuSt038=()=>({d:0,y:FUP38.FL-FUP38.SZ/2,vy:0,g:1,m:'j',sp:1,mini:0,ground:true,buf:0,t:0,dead:false,done:false,ti:0,used:[],coins:[],rot:0,hold:false,ev:''});
const fuClone38=S=>({...S,used:S.used.slice(),coins:S.coins.slice()});
function hitSp38(o,wx,y,hs){if(!(wx+hs>o.x+5&&wx-hs<o.x+o.w-5))return false;const hh=o.h*.7;return o.side===1?y+hs>FUP38.FL-hh:y-hs<FUP38.CE+hh}
/* um passo da física: inp = {press (toque novo), hold (segurando)} */
function fuStep38(L,S,inp,dt){
  if(S.dead||S.done)return;const P=FUP38;S.ev='';
  if(inp.press)S.buf=.12;S.hold=!!inp.hold;
  S.t+=dt;S.d+=L.base*S.sp*dt;const wx=S.d+P.PX;
  while(S.ti<L.trig.length&&L.trig[S.ti].x<=wx){const o=L.trig[S.ti++];
    if(o.t==='portal'){S.m=o.to;if(o.to!=='f')S.g=1;if(o.to==='s')S.vy=Math.max(-200,Math.min(200,S.vy));S.ev='portal'}
    else if(o.t==='spd'){S.sp=o.v;S.ev='portal'}else if(o.t==='mini'){S.mini=o.v;S.ev='portal'}else if(o.t==='end'){S.done=true;return}}
  const sz=S.mini?P.SZM:P.SZ,jv=S.mini?P.JVM:P.JV,hs=sz*(S.m==='s'?.4:.35),floor=P.FL-sz/2,ceil=P.CE+sz/2,near=fuNear38(L,wx);
  if(S.m==='j'){
    if(S.buf>0)for(const o of near)if(o.t==='orb'&&!S.used.includes(o.id)&&Math.hypot(wx-o.x,S.y-o.y)<=o.r+sz*.3){S.vy=-jv*.98;S.used.push(o.id);S.buf=0;S.ground=false;S.ev='orb';break}
    if(S.ground&&(S.buf>0||S.hold)){S.vy=-jv;S.ground=false;S.buf=0;S.ev='jump'}
    if(S.ground)for(const o of near)if(o.t==='pad'&&wx+sz/2>o.x&&wx-sz/2<o.x+o.w){S.vy=-jv*P.PAD;S.ground=false;S.ev='pad';break}
    S.vy+=P.G*dt;
  }else if(S.m==='f'){
    if(S.buf>0&&S.ground){S.g=-S.g;S.vy=-S.g*120;S.ground=false;S.buf=0;S.ev='flip'}
    S.vy+=P.G*S.g*dt;
  }else{S.vy+=(S.hold?-P.SHA:P.SHA)*dt;S.vy=Math.max(-P.SHV,Math.min(P.SHV,S.vy));S.buf=0}
  S.buf=Math.max(0,S.buf-dt);
  const prevY=S.y;S.y+=S.vy*dt;S.ground=false;
  if(S.m==='s'){if(S.y>floor){S.y=floor;S.vy=Math.min(0,S.vy)}if(S.y<ceil){S.y=ceil;S.vy=Math.max(0,S.vy)}}
  else{
    if(S.g===1&&S.y>=floor){S.y=floor;S.vy=0;S.ground=true}
    if(S.g===-1&&S.y<=ceil){S.y=ceil;S.vy=0;S.ground=true}
    if(S.g===1&&S.y<ceil){S.y=ceil;S.vy=Math.max(0,S.vy)}
    if(S.g===-1&&S.y>floor){S.y=floor;S.vy=Math.min(0,S.vy)}
  }
  for(const o of near){
    if(o.t==='bl'){const top=P.FL-o.h;if(wx+sz/2>o.x&&wx-sz/2<o.x+o.w){
      if(S.m==='s'){if(S.y+hs>top){S.dead=true;return}continue}
      if(S.vy>=0&&prevY+sz/2<=top+8&&S.y+sz/2>=top){S.y=top-sz/2;S.vy=0;S.ground=true}
      else if(S.y+sz/2>top+6){S.dead=true;return}}}
    else if(o.t==='sp'){if(hitSp38(o,wx,S.y,hs)){S.dead=true;return}}
    else if(o.t==='slab'){if(wx+hs>o.x&&wx-hs<o.x+o.w&&S.y-hs<o.y){S.dead=true;return}}
    else if(o.t==='pil'){if(wx+hs>o.x&&wx-hs<o.x+o.w&&S.y+hs>o.y0&&S.y-hs<o.y1){S.dead=true;return}}
    else if(o.t==='coin'){if(!S.coins.includes(o.i)&&Math.hypot(wx-o.x,S.y-o.y)<14+sz*.45){S.coins.push(o.i);S.ev='coin'}}
  }
  if(S.m==='s')S.rot=S.vy/P.SHV*.5;else if(S.ground)S.rot=Math.round(S.rot/(Math.PI/2))*(Math.PI/2);else S.rot+=dt*7*S.g;
}
T3.fu38={level:fuLevel38,step:fuStep38,st0:fuSt038,clone:fuClone38,stages:FU38};

const fuSetup38={
  intro:o=>o._m==='mesa'?'Todos correm a mesma fase. Quem cruzar a chegada primeiro vence. Se ninguém chegar em 3 minutos, vence quem foi mais longe.':'Cada fase tem música, portais e 3 Moedas Astrais escondidas em rotas arriscadas. Termine uma fase para abrir a próxima.',
  def:()=>{let i=0;while(i<FU38.length-1&&fuOpen38(i+1))i++;return{m:'fase',st:String(i)}},
  fields:o=>{const mesa=o._m==='mesa',p=fuProg38();
    const F=[{k:'m',l:'Modo',opts:[{v:'fase',n:'Fases',ico:'🚪',d:'Morreu, recomeça do início. As moedas só contam se você terminar.'},...(mesa?[]:[{v:'pratica',n:'Prática',ico:'🚩',d:'Marque checkpoints com C (ou 🚩) e treine os trechos difíceis.'}]),{v:'inf',n:'Infinito clássico',ico:'♾',d:'A corrida sem fim de antes. Morreu, acabou.'}]}];
    if(o.m!=='inf')F.push({k:'st',l:'Fase',wide:1,opts:FU38.map((s,i)=>{const r=p.st[s.id]||{},lock=!mesa&&!fuOpen38(i);
      return{v:String(i),n:s.n,ico:s.ico,d:lock?`Termine ${FU38[i-1].n} para abrir.`:`${s.bpm} BPM · ${FUTAG38(s)}${r.best&&!r.done?` · melhor ${Math.floor(r.best)}%`:''}`,lock,badge:`${r.done?'✓ ':''}<span class="fu38-c" aria-label="Moedas">${coinsTxt38(r.coins)}</span>`}})});
    return F},
  fix:o=>{if(!['fase','pratica','inf'].includes(o.m))o.m='fase';if(o._m==='mesa'&&o.m==='pratica')o.m='fase';let i=Math.max(0,Math.min(FU38.length-1,+o.st||0));if(o._m!=='mesa')while(i>0&&!fuOpen38(i))i--;o.st=String(i)},
  sum:o=>{if(o.m==='inf')return'♾ Toque para pular. Depois do portal roxo, o toque inverte a gravidade.';const s=FU38[+o.st||0];return`${s.ico} ${s.n} · ${FUTAG38(s)}. Espaço, ↑ ou clique: pula (segure para pular sempre). Na Nave, segure para subir.${o.m==='pratica'?' C marca checkpoint, X apaga.':''} Q encerra.`}
};

function fuga38(C){
  const o=C.room.opt||{};
  if(o.m==='inf'){setTimeout(()=>$$('#mgPad [data-k="KeyQ"]').forEach(e=>e.hidden=true),60);const f=C.finish;C.finish=res=>f({...res,unit:'m'});const g=fuga(C);g.reward=()=>null;return g}
  const W=800,H=450,P=FUP38,si=Math.max(0,Math.min(FU38.length-1,+o.st||0)),stg=FU38[si],prac=o.m==='pratica'&&!C.net,mesa=!!C.net,spb=60/stg.bpm;
  const L=fuLevel38(si,C.gd),saved=fuProg38().st[stg.id]||{};
  const G={S:fuSt038(),att:1,best:0,deaths:0,cps:[],deadT:0,press:false,hold:false,time:0,fin:false,started:false,gh:{},fins:{},sentAt:0,parts:[],attT:0,ac:null,mT:0,mK:0,mTimer:0,rw:null,res:null,limit:180,waitT:0};
  const me=me16(C);
  if(prac)setTimeout(()=>$$('#mgPad .fu38-pr').forEach(e=>e.classList.add('on')),60);
  /* música da fase */
  function mStop(){clearInterval(G.mTimer);G.mTimer=0}
  function mStart(t0){mStop();const ac=actx();if(!ac)return;G.ac=ac;G.mT=ac.currentTime+.05-t0;G.mK=Math.max(0,Math.ceil(t0/spb*2));G.mTimer=setInterval(msched,25)}
  function msched(){const ac=G.ac;if(!ac||G.fin||G.S.dead){mStop();return}const ahead=ac.currentTime+.15;
    while(G.mT+G.mK*spb/2<ahead){const k=G.mK++,t=G.mT+k*spb/2,beat=k/2,bar=Math.floor(beat/4),inBar=beat%4;if(t<ac.currentTime-.02)continue;
      const fast=G.S.sp>=2,root=stg.root+[0,5,7,3][bar%4];
      if(k%2===0){if(inBar%2===0)o5('sine',120,t,.14,{to:45,gain:.16,attack:.002,wet:.03});else n5(t,.1,{freq:1800,q:.8,gain:.11,wet:.25});
        o5('triangle',midi15(root-24),t,spb*.8,{gain:.07,attack:.01,wet:.1})}
      n5(t,.02,{freq:8000,type:'highpass',gain:.04,wet:.05});if(fast)n5(t+spb/4,.02,{freq:9000,type:'highpass',gain:.03,wet:.05});
      if(G.S.m==='s'||fast)o5('square',midi15(root+12+stg.sc[k%stg.sc.length]),t,spb*.2,{gain:.018,wet:.4});
      else if(k%2===1)o5('triangle',midi15(root+12+stg.sc[(k>>1)%stg.sc.length]),t,spb*.3,{gain:.02,wet:.4});
      if(inBar===0&&k%2===0)[0,4,7].forEach(iv=>o5('sine',midi15(root+iv),t,spb*3.5,{gain:.016,attack:.1,wet:.6}));
    }}
  function die(){
    G.deaths++;G.deadT=.75;mStop();fx5('fumble');C.fx?.shake(7,.3);
    for(let i=0;i<18;i++)G.parts.push({x:P.PX,y:G.S.y,vx:(Math.random()-.5)*520,vy:(Math.random()-.5)*520,t:0,c:i%2?stg.a:'#fff'});
    if(mesa)send(true);
  }
  function respawn(){
    G.S=prac&&G.cps.length?fuClone38(G.cps[G.cps.length-1]):fuSt038();G.att++;G.attT=pnow38();G.S.dead=false;G.press=false;mStart(G.S.t);
  }
  function complete(){
    mStop();fx5('mgWin');C.fx?.flash(stg.a,.4);C.fx?.burst(P.PX,G.S.y,{n:40,kind:'star',col:[stg.a,'#fff','#ffd36b'],sp:260,life:1});
    const t=G.time;
    if(prac){C.achieve?.('fu_pratica');G.rw={ob:3,xp:4,why:'prática concluída'};solo(`🚩 Prática concluída: ${stg.n}`,100,true,`${G.att} tentativas · ${G.cps.length} checkpoints`);return}
    const got=G.S.coins.slice();let first=false,newCoins=0;
    progPut38(p=>{p.fu=p.fu||{st:{}};p.fu.st=p.fu.st||{};const q=p.fu.st[stg.id]||{};first=!q.done;q.done=1;q.best=100;
      q.coins=q.coins||[0,0,0];got.forEach(i=>{if(!q.coins[i]){q.coins[i]=1;newCoins++}});if(!q.t||t<q.t)q.t=Math.round(t*10)/10;q.att=Math.min(q.att||1e9,G.att);p.fu.st[stg.id]=q;
      const all=FU38.map(s=>p.fu.st[s.id]||{});if(all.every(s=>s.done))C.achieve?.('fu_coracao');if(all.reduce((a,s)=>a+(s.coins||[]).filter(Boolean).length,0)>=18)C.achieve?.('fu_moedas')});
    if(si===0)C.achieve?.('fu_limiar');if(G.att===1)C.achieve?.('fu_limpo');
    const m=gdMul38(C.gd);G.rw={ob:Math.round((15+5*si)*m+(first?25:0)+newCoins*12+(G.att===1?10:0)),xp:0,why:[first?'fase nova':'',newCoins?`${newCoins} moeda${newCoins>1?'s':''} nova${newCoins>1?'s':''}`:'',G.att===1?'sem morrer':''].filter(Boolean).join(' · ')||'fase concluída'};G.rw.xp=Math.round(G.rw.ob*.6);
    G.res={first,newCoins,got};
    if(mesa){G.fin=true;send(true,true);fins(C.me,{done:1,t,best:100});return}
    solo(`${stg.ico} ${stg.n} concluída!`,100,true,null);
  }
  function giveUp(){if(G.fin)return;mStop();if(mesa){G.fin=true;send(true,true);fins(C.me,{done:0,t:G.time,best:G.best});return}
    G.rw={ob:Math.round(Math.floor(G.best/10)*gdMul38(C.gd)*(prac?.3:1)),xp:0,why:`melhor ${Math.floor(G.best)}%`};G.rw.xp=Math.round(G.rw.ob*.6);
    solo(prac?`🚩 Prática encerrada · ${stg.n}`:`${stg.ico} ${stg.n} · melhor ${Math.floor(G.best)}%`,Math.floor(G.best),false,null)}
  function html(){const c=G.S.coins,sv=fuProg38().st[stg.id]||{};
    return`<ul class="r38-l"><li>🔁 Tentativas: <b>${G.att}</b></li><li>⏱ Tempo total: <b>${G.time.toFixed(1)} s</b></li><li>📈 Melhor: <b>${Math.floor(G.best)}%</b></li><li>🪙 Moedas desta corrida: <b class="fu38-c">${coinsTxt38(prac?[]:c.reduce((a,i)=>(a[i]=1,a),[]))}</b> · salvas: <b class="fu38-c">${coinsTxt38(sv.coins)}</b>${G.res?.newCoins?` (+${G.res.newCoins})`:''}</li>${sv.t?`<li>🏁 Recorde: <b>${sv.t} s</b></li>`:''}</ul>${G.res?.first?'<p class="r38-hi">🆕 Fase concluída pela primeira vez!'+(si<FU38.length-1?` ${esc(FU38[si+1].n)} foi aberta.`:' Você chegou ao Coração do Véu.')+'</p>':''}`}
  function solo(title,s,won,extra){if(G.fin&&!mesa&&G.over)return;G.fin=true;G.over=true;
    C.finish({title,rows:[{u:C.me,n:me.n,c:me.c,s,w:!!won,st:won&&!prac?`✓ ${G.time.toFixed(1)} s`:`${s}%`}],unit:'%',html:html()+(extra?`<p class="sub">${esc(extra)}</p>`:'')})}
  /* ---------- mesa: fantasmas e linha de chegada ---------- */
  function send(force,fin){const now=Date.now();if(!mesa)return;if(fin){C.send('fufin',{done:G.S.done?1:0,t:G.time,best:G.best});return}
    if(!force&&now-G.sentAt<100)return;G.sentAt=now;C.send('fu',{d:Math.round(G.S.d),y:Math.round(G.S.y),m:G.S.m,mi:G.S.mini,a:G.att,dead:G.S.dead?1:0,r:+G.S.rot.toFixed(2)})}
  function fins(u,r){G.fins[u]={done:+r.done||0,t:+r.t||0,best:Math.min(100,+r.best||0)};check()}
  function check(){
    if(!C.host||G.closed)return;const exp=C.players.map(p=>p.u);if(!exp.every(u=>G.fins[u]))return;G.closed=true;
    const rows=C.players.map(p=>{const f=G.fins[p.u];return{u:p.u,n:p.n,c:p.c,s:f.done?100:Math.floor(f.best),st:f.done?`✓ ${f.t.toFixed(1)} s`:`${Math.floor(f.best)}%`,_d:f.done,_t:f.t,w:false}})
      .sort((a,b)=>(b._d-a._d)||(a._d?a._t-b._t:b.s-a.s));
    if(rows[0]&&rows[0].s>0)rows[0].w=true;rows.forEach(r=>{delete r._d;delete r._t});
    C.finish({title:rows[0]?.w?`${stg.ico} ${stg.n} · vitória de ${rows[0].n}`:`${stg.ico} ${stg.n} · ninguém saiu do lugar`,rows,unit:'%',html:''});
  }
  G.html=html;
  return{
    st:()=>G,L,
    key(code,down){
      if(['Space','KeyW','ArrowUp','Enter'].includes(code)){if(down){if(!G.hold)G.press=true;G.hold=true}else G.hold=false;return}
      if(!down)return;
      if(code==='KeyQ'){giveUp();return}
      if(prac&&code==='KeyC'&&!G.S.dead&&!G.fin&&Date.now()>=C.t0){G.cps.push(fuClone38(G.S));fx5('confirm');C.fx?.float(P.PX,G.S.y-40,'🚩',{size:24});return}
      if(prac&&code==='KeyX'&&G.cps.length){G.cps.pop();fx5('confirm')}
    },
    ptr(t){if(t==='down'){if(!G.hold)G.press=true;G.hold=true}else if(t==='up')G.hold=false},
    msg(p){
      if(p.t==='fu'&&p.from!==C.me)G.gh[p.from]={...p,at:Date.now()};
      if(p.t==='fufin'){G.gh[p.from]={...(G.gh[p.from]||{}),fin:1};if(C.host)fins(p.from,p)}
    },
    left(u){if(C.host&&mesa){G.fins[u]=G.fins[u]||{done:0,t:0,best:0};C.players=C.players.filter(p=>p.u!==u);check()}},
    end(){mStop()},
    reward(){return G.rw},
    next(){if(mesa||prac||!G.S.done||si>=FU38.length-1)return null;return{opt:{st:String(si+1),m:'fase'},label:`Próxima fase: ${FU38[si+1].n}`}},
    step(dt){
      G.parts.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt});G.parts=G.parts.filter(p=>p.t<1);
      if(Date.now()<C.t0)return;
      if(G.fin){if(mesa&&C.host&&!G.closed&&G.time>=G.limit){G.waitT+=dt;if(G.waitT>4){C.players.forEach(p=>{if(!G.fins[p.u])G.fins[p.u]={done:0,t:G.time,best:Number(G.gh[p.u]?.d||0)/L.len*100}});check()}}G.time+=dt;return}
      if(!G.started){G.started=true;G.attT=pnow38();mStart(0)}
      G.time+=dt;
      if(mesa&&G.time>=G.limit){giveUp();return}
      if(G.S.dead){G.deadT-=dt;if(G.deadT<=0)respawn();return}
      const inp={press:G.press,hold:G.hold};G.press=false;
      fuStep38(L,G.S,inp,dt);
      const ev=G.S.ev;
      if(ev==='jump'||ev==='flip')fx5('mgJump');
      else if(ev==='orb'){fx5('activate');C.fx?.burst(P.PX,G.S.y,{n:10,col:['#ffd36b','#fff'],sp:140,life:.4,kind:'ring'})}
      else if(ev==='pad'){fx5('activate');C.fx?.burst(P.PX,G.S.y+12,{n:10,col:'#ffd36b',sp:160,life:.4,ang:-Math.PI/2,spread:1.2})}
      else if(ev==='portal'){fx5('confirm');C.fx?.flash(stg.a,.15)}
      else if(ev==='coin'){fx5('coin20');C.fx?.float(P.PX,G.S.y-40,prac?'🪙 (prática)':'🪙 Moeda Astral!',{col:'#ffd36b',size:20});C.fx?.burst(P.PX,G.S.y,{n:16,kind:'star',col:['#ffd36b','#fff'],sp:180,life:.6})}
      const pct=Math.min(100,G.S.d/L.len*100);if(!prac)G.best=Math.max(G.best,pct);
      if(G.S.dead){die();return}
      if(G.S.done){if(!prac)G.best=100;complete();return}
      send(false);
      const md=G.S.m==='s'?'🚀 Nave: segure para subir':G.S.m==='f'?'⇅ Gravidade: toque para virar':'⤒ toque para pular';
      C.hud(`${stg.ico} <b>${esc(stg.n)}</b> · ${Math.floor(pct)}% · tentativa ${G.att} · ${md}${G.S.sp!==1?` · <b>${G.S.sp}x</b>`:''}${G.S.mini?' · <b>Mini</b>':''}${prac?` · 🚩 ${G.cps.length} (C marca, X apaga)`:''}${mesa?` · ⏱ ${Math.max(0,Math.ceil(G.limit-G.time))} s`:''}`);
    },
    draw(x){
      const S=G.S,cam=S.d,beatF=((S.t/spb)%1+1)%1,pulse=Math.pow(1-beatF,3),pn=pnow38();
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,stg.c[0]);gr.addColorStop(1,stg.c[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
      /* fundo que pulsa com a batida */
      x.save();x.globalAlpha=.08+pulse*.08;txt16(x,stg.ico,W*.62-((cam*.05)%200),H*.45,{size:200});x.restore();
      x.strokeStyle=stg.a;x.globalAlpha=.06+pulse*.1;x.lineWidth=2;for(let i=0;i<12;i++){const lx=((i*90-cam*.3)%1080+1080)%1080-80;x.beginPath();x.moveTo(lx,P.CE);x.lineTo(lx+60,P.FL);x.stroke()}x.globalAlpha=1;
      for(let i=0;i<32;i++){const h=(6+26*pulse*(.5+.5*Math.sin(i*1.7+S.t*4)))*Math.min(2,S.sp);x.fillStyle=stg.a;x.globalAlpha=.18;x.fillRect(i*25+2,P.FL+6,20,h);x.fillRect(i*25+2,P.CE-6-h,20,h)}x.globalAlpha=1;
      x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,P.FL,W,H-P.FL);x.fillRect(0,0,W,P.CE);x.fillStyle=stg.a;x.globalAlpha=.5+pulse*.5;x.fillRect(0,P.FL,W,3);x.fillRect(0,P.CE-3,W,3);x.globalAlpha=1;
      /* objetos */
      const vis=o=>{const sx=o.x-cam;return sx+o.w>-60&&sx<W+60};
      for(let i=fuFrom38(L,cam-L.maxW-60);i<L.obs.length;i++){const o=L.obs[i],sx=o.x-cam;if(sx>W+60)break;if(!vis(o))continue;
        if(o.t==='sp'){const n=Math.max(1,Math.round(o.w/(o.h<20?18:26))),sw=o.w/n;for(let k=0;k<n;k++){const bx=sx+k*sw;x.beginPath();if(o.side===1){x.moveTo(bx,P.FL);x.lineTo(bx+sw/2,P.FL-o.h);x.lineTo(bx+sw,P.FL)}else{x.moveTo(bx,P.CE);x.lineTo(bx+sw/2,P.CE+o.h);x.lineTo(bx+sw,P.CE)}x.closePath();x.fillStyle='#ff5b7a';x.fill();x.strokeStyle='#ffd0da';x.lineWidth=1.5;x.stroke()}}
        else if(o.t==='bl'){rr16(x,sx,P.FL-o.h,o.w,o.h,4);x.fillStyle='rgba(20,12,40,.92)';x.fill();x.strokeStyle=stg.a;x.lineWidth=2;x.stroke()}
        else if(o.t==='slab'){x.fillStyle='rgba(20,12,40,.92)';x.fillRect(sx,P.CE,o.w,o.y-P.CE);x.strokeStyle=stg.a;x.lineWidth=2;x.strokeRect(sx,P.CE,o.w,o.y-P.CE);x.fillStyle='#ff5b7a';for(let k=sx;k<sx+o.w-8;k+=16){x.beginPath();x.moveTo(k,o.y);x.lineTo(k+8,o.y+10);x.lineTo(k+16,o.y);x.fill()}}
        else if(o.t==='pil'){x.fillStyle='rgba(20,12,40,.92)';x.fillRect(sx,o.y0,o.w,o.y1-o.y0);x.strokeStyle=stg.a;x.lineWidth=2;x.strokeRect(sx,o.y0,o.w,o.y1-o.y0)}
        else if(o.t==='pad'){x.beginPath();x.ellipse(sx+15,P.FL,15,8+pulse*3,0,Math.PI,0);x.fillStyle='#ffd36b';x.fill()}
        else if(o.t==='orb'){const used=S.used.includes(o.id);x.save();x.globalAlpha=used?.25:1;x.strokeStyle=o.opt?'#ffb3e6':'#ffd36b';x.lineWidth=4;x.beginPath();x.arc(sx,o.y,14+pulse*3,0,7);x.stroke();x.fillStyle=o.opt?'rgba(255,179,230,.35)':'rgba(255,211,107,.35)';x.beginPath();x.arc(sx,o.y,10,0,7);x.fill();x.restore()}
        else if(o.t==='coin'){if(S.coins.includes(o.i))continue;const had=saved.coins&&saved.coins[o.i],sc=Math.abs(Math.cos(pn/300));x.save();x.globalAlpha=had?.4:1;x.fillStyle='#ffd36b';x.strokeStyle='#fff3c2';x.lineWidth=2;x.beginPath();x.ellipse(sx,o.y,12*sc+2,12,0,0,7);x.fill();x.stroke();if(sc>.5)txt16(x,'✦',sx,o.y+1,{size:12,w:900,col:'#7a4b00'});x.restore()}
      }
      for(const o of L.trig){const sx=o.x-cam;if(sx<-40||sx>W+40)continue;
        const col=o.t==='spd'?'#7fe3ff':o.t==='mini'?'#ff9be0':o.to==='f'?'#c39bff':o.to==='s'?'#ffae5a':o.t==='end'?'#fff':'#7dffa8';
        x.save();x.globalAlpha=.85;const g2=x.createLinearGradient(sx-12,0,sx+12,0);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(.5,col);g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(sx-14,P.CE,28,P.FL-P.CE);x.restore();
        const lab=o.t==='spd'?(o.v<1?'0.5x':o.v+'x'):o.t==='mini'?(o.v?'MINI':'NORMAL'):o.t==='end'?'🏁':o.to==='f'?'⇅':o.to==='s'?'🚀':'⤒';
        txt16(x,lab,sx,P.CE-14,{size:14,w:900,col,stroke:3})}
      if(prac)G.cps.forEach(c=>{const sx=c.d+P.PX-cam;if(sx<-20||sx>W+20)return;x.save();x.translate(sx,c.y);x.rotate(Math.PI/4);x.fillStyle='#7dffa8';x.fillRect(-7,-7,14,14);x.restore()});
      for(const u in G.gh){const g=G.gh[u];if(g.d==null||g.fin)continue;const gx=P.PX+(g.d-cam);if(gx<-40||gx>W+40)continue;const pl=C.players.find(p=>p.u===u);sprAt16(x,pl?pl.c:0,gx,g.y,(g.mi?P.SZM:P.SZ)+8,g.r||0,g.dead?.15:.42);if(MG.drawn&&pl)MG.drawn[pl.n]=.42;txt16(x,pl?pl.n:'?',gx,g.y-26,{size:11,col:'rgba(255,255,255,.75)',stroke:3})}
      if(!S.dead){const sz=(S.mini?P.SZM:P.SZ)+8;
        if(S.m==='s'){x.save();x.translate(P.PX,S.y);x.rotate(S.rot);x.beginPath();x.moveTo(sz*.75,0);x.lineTo(-sz*.6,-sz*.42);x.lineTo(-sz*.4,0);x.lineTo(-sz*.6,sz*.42);x.closePath();x.fillStyle=stg.a;x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.restore();sprAt16(x,me.c,P.PX-2,S.y-sz*.3,sz*.6,0);
          if(S.hold){x.fillStyle='#ffae5a';x.globalAlpha=.7;x.beginPath();x.arc(P.PX-sz*.65,S.y,4+Math.random()*4,0,7);x.fill();x.globalAlpha=1}}
        else sprAt16(x,me.c,P.PX,S.y,sz,S.rot)}
      G.parts.forEach(p=>{x.globalAlpha=Math.max(0,1-p.t);x.fillStyle=p.c;x.fillRect(p.x-3,p.y-3,6,6)});x.globalAlpha=1;
      /* barra de progresso */
      const pct=Math.min(1,S.d/L.len),bx=200,bw=400;x.fillStyle='rgba(0,0,0,.45)';rr16(x,bx,14,bw,10,5);x.fill();x.fillStyle=stg.a;rr16(x,bx,14,Math.max(4,bw*pct),10,5);x.fill();
      if(G.best>0&&!prac){x.fillStyle='#fff';x.fillRect(bx+bw*G.best/100-1,11,2,16)}
      txt16(x,`${Math.floor(pct*100)}%`,bx+bw+28,20,{size:14,w:800});
      txt16(x,coinsTxt38(S.coins.reduce((a,i)=>(a[i]=1,a),[])),60,20,{size:16,w:900,col:'#ffd36b'});
      txt16(x,stg.n+(prac?' · prática':''),W-14,44,{size:12,w:700,al:'right',col:'rgba(255,255,255,.7)'});
      if(mesa)txt16(x,`⏱ ${Math.max(0,Math.ceil(G.limit-G.time))} s`,W-14,20,{size:14,w:800,al:'right'});
      if(pn-G.attT<1200&&G.started)txt16(x,`Tentativa ${G.att}`,W/2,H/2-40,{size:34,w:900,col:'#fff',stroke:6});
      if(G.fin&&mesa&&!MG.over)txt16(x,'Aguardando os outros…',W/2,H/2,{size:24,w:800,stroke:5});
    }
  };
}
defineArcadeGame('fuga',{...GAMES12.fuga,make:fuga38,setup:fuSetup38,pad:'fu38',unit:'%',top3:true,
  desc:'6 fases com música, portais de Nave, Gravidade, Velocidade e Mini-Perseus, orbes, rampas e 3 Moedas Astrais por fase. Tem Prática e o Infinito clássico.',
  rule:'Mesa: todos correm a mesma fase e os colegas aparecem como fantasmas. Morreu, recomeça. Vence quem cruzar a chegada primeiro; em 3 minutos, vence quem foi mais longe.',
  keys:'Espaço, W, ↑ ou clique: pula (segure para pular sempre) · Nave: segure sobe · Prática: C marca, X apaga · Q encerra',touch:'Toque para pular, segure na Nave · 🚩 e ✖ na Prática · 🏳 encerra'});
console.info('[Tulpa] Etapa 39 carregada (Fuga Além do Véu 2.0)');

