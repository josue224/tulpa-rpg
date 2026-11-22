/* ===================================================================
   TULPA · ETAPA 5 — som, efeitos de rolagem, foto de perfil e Perseus narrador
   =================================================================== */

/* ---------- motor de som (um único AudioContext, com reverberação leve) ---------- */
const A5={ctx:null,out:null,wet:null,last:{}};
if(prefs.sound===undefined)prefs.sound='on';
const vol5=()=>prefs.sound==='off'?0:prefs.sound==='low'?.4:1;
function actx(){
  if(A5.ctx){if(A5.ctx.state==='suspended')A5.ctx.resume().catch(()=>{});return A5.ctx}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  const c=A5.ctx=new AC();A5.out=c.createGain();A5.out.gain.value=.9;
  const comp=c.createDynamicsCompressor();A5.out.connect(comp);comp.connect(c.destination);
  const len=Math.floor(c.sampleRate*1.4),buf=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  const cv=c.createConvolver();cv.buffer=buf;A5.wet=c.createGain();A5.wet.gain.value=.22;A5.wet.connect(cv);cv.connect(A5.out);
  if(c.state==='suspended')c.resume().catch(()=>{});
  return c;
}
function env5(g,t,a,d,peak){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
function send5(g,wet){g.connect(A5.out);if(wet){const w=A5.ctx.createGain();w.gain.value=wet;g.connect(w);w.connect(A5.wet)}}
function o5(type,f,t,dur,{to,gain=.08,attack=.008,wet=.5,detune=0}={}){
  const c=A5.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);o.detune.value=detune;
  env5(g,t,attack,dur,gain*vol5());o.connect(g);send5(g,wet);o.start(t);o.stop(t+attack+dur+.05);
}
function n5(t,dur,{freq=2000,q=1,type='bandpass',gain=.1,to,wet=.2}={}){
  const c=A5.ctx,len=Math.max(1,Math.floor(c.sampleRate*(dur+.02))),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);
  if(to)f.frequency.exponentialRampToValueAtTime(to,t+dur);f.Q.value=q;
  const g=c.createGain();env5(g,t,.004,dur,gain*vol5());s.connect(f);f.connect(g);send5(g,wet);s.start(t);s.stop(t+dur+.05);
}
const S5={
  click:t=>o5('sine',900,t,.05,{to:620,gain:.05,wet:.1}),
  confirm:t=>{o5('triangle',659,t,.12,{gain:.06});o5('triangle',988,t+.09,.2,{gain:.06})},
  error:t=>{o5('sawtooth',196,t,.18,{to:130,gain:.05,wet:.2});n5(t,.12,{freq:300,type:'lowpass',gain:.08})},
  dice:t=>{const k=5+Math.floor(Math.random()*3);for(let i=0;i<k;i++){const tt=t+Math.pow(i/k,1.4)*.42+Math.random()*.02;n5(tt,.03,{freq:1800+Math.random()*2600,q:3,gain:.16-.012*i});o5('triangle',240+Math.random()*160,tt,.035,{gain:.035,wet:.15})}},
  crit:t=>{[523,659,784,1047,1319].forEach((f,i)=>{o5('triangle',f,t+i*.07,.5,{gain:.07});o5('sine',f*2,t+i*.07,.6,{gain:.025,detune:8})});n5(t+.3,.6,{freq:7000,q:.7,type:'highpass',gain:.03,wet:.6})},
  fumble:t=>{o5('sawtooth',330,t,.5,{to:82,gain:.06,wet:.3});o5('sine',233,t+.02,.5,{to:60,gain:.06});n5(t+.42,.2,{freq:180,type:'lowpass',gain:.2})},
  hit:t=>{n5(t,.14,{freq:520,type:'lowpass',gain:.3});o5('sine',140,t,.2,{to:48,gain:.22,wet:.2})},
  violent:t=>{S5.hit(t);n5(t+.03,.09,{freq:3200,q:2,gain:.14});o5('sine',90,t+.05,.4,{to:36,gain:.25})},
  dodge:t=>n5(t,.28,{freq:500,to:3200,q:1.4,gain:.12,wet:.4}),
  block:t=>{n5(t,.06,{freq:2400,q:5,gain:.2});o5('triangle',310,t,.18,{gain:.08});o5('triangle',467,t,.22,{gain:.05})},
  heal:t=>{o5('sine',523,t,.5,{to:1047,gain:.06});[1319,1568,2093].forEach((f,i)=>o5('sine',f,t+.2+i*.08,.3,{gain:.03}))},
  turn:t=>{o5('sine',784,t,.4,{gain:.06});o5('sine',1175,t+.14,.5,{gain:.05})},
  round:t=>[110,165,220,331].forEach((f,i)=>o5('sine',f,t,1.6-i*.2,{gain:.09-.015*i,attack:.02,wet:.8})),
  start:t=>{n5(t,.5,{freq:200,to:1400,q:.8,gain:.08});[147,220,294].forEach((f,i)=>o5('sawtooth',f,t+.1+i*.12,.5,{gain:.04,wet:.6}))},
  activate:t=>[440,660,880].forEach((f,i)=>o5('triangle',f,t+i*.08,.26,{gain:.06})),
  learn:t=>[523,659,784,1047].forEach((f,i)=>o5('sine',f,t+i*.1,.34,{gain:.06})),
  dying:t=>[0,.28,.9,1.18].forEach((d,i)=>o5('sine',70,t+d,.16,{to:45,gain:i%2?.2:.28,wet:.1})),
  dead:t=>[98,196,247,294].forEach((f,i)=>o5('sine',f,t,2.4,{gain:.1-.02*i,attack:.01,wet:.9})),
  collapse:t=>{n5(t,.9,{freq:300,to:5000,q:.6,gain:.1,wet:.6});o5('sawtooth',220,t,.9,{to:233,gain:.04});o5('sawtooth',311,t,.9,{to:294,gain:.04})},
  meow:t=>o5('sine',620,t,.16,{to:980,gain:.03,wet:.2}),
};
const CAST5={Natureza:[150,220,330,440],Inexistência:[90,140,210,300],Ilusão:[660,520,780,1040],Verdade:[440,660,880,990],Fé:[330,495,660,990],Sol:[330,440,495,660,990],Desrealização:[150,140,220,210,300],Pofenia:[90,520,210,780,1040],Confabulação:[660,440,780,880,1040],Metáfora:[440,330,660,495,990]};
function fx5(kind='click',element=''){
  try{
    if(!vol5())return;const c=actx();if(!c)return;
    const now=performance.now();if(now-(A5.last[kind]||0)<90)return;A5.last[kind]=now;
    const t=c.currentTime+.01;
    if(kind==='cast'){(CAST5[element]||CAST5['Fé']).forEach((f,i)=>o5(i%2?'triangle':'sine',f,t+i*.12,.34,{gain:.06,wet:.7}));return}
    (S5[kind]||S5.click)(t);
  }catch(e){}
}
window.tulpaFx5=fx5;window.tulpaFx=fx5;T3.fx=fx5;T3._a5=A5;T3._s5=S5;

/* ---------- foto de perfil ---------- */
const AV_C=['#8e3e34','#7a5a2b','#3f6f6a','#4a4f86','#6d3f6b','#44566b'];
const avOk=a=>typeof a==='string'&&a.length<90000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(a);
function av5(d,cls=''){
  const n=String(d?.name||'?').trim()||'?',ini=(n.split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).slice(0,2).map(w=>[...w][0]).join('')||'?').toUpperCase();
  let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;
  const state=avState(d);
  return `<span class="av ${cls} ${state}" style="--avc:${AV_C[h%AV_C.length]}">${avOk(d?.avatar)?`<img src="${d.avatar}" alt="" decoding="sync">`:`<b>${esc(ini)}</b>`}</span>`;
}
function avState(d){const st=stIds(d||{}),mx=STAGES[d?.stage]||STAGES[1],low=(Number(d?.vital)||0)<=mx.vt/3;return st.includes('morto')||st.includes('agonia')?'down':low?'low':''}
/* Correção do pisca-pisca: cada foto vira UM nó do DOM, guardado por personagem + foto.
   Quando a mesa ou a ordem de combate são redesenhadas, o mesmo nó é recolocado no lugar
   (a imagem já está decodificada), em vez de criar um <img> novo a cada atualização. */
const AVN=new Map();
const avSig=(d,f)=>{const a=avOk(d?.[f])?d[f]:'';return String(d?.name||'')+'|'+a.length+'|'+a.slice(-32)};
function avNode(key,d,cls='',field='avatar'){
  const sig=avSig(d,field)+'|'+cls;let e=AVN.get(key);
  if(!e||e.sig!==sig){const t=document.createElement('template');t.innerHTML=av5(field==='avatar'?d:{...d,avatar:avOk(d?.[field])?d[field]:d?.avatar},cls).trim();const keep=e?[...e.node.classList].filter(c=>c==='speaking'||c==='muted'):[];e={sig,node:t.content.firstElementChild};keep.forEach(c=>e.node.classList.add(c));AVN.set(key,e)}
  const s=avState(d);e.node.classList.toggle('down',s==='down');e.node.classList.toggle('low',s==='low');
  return e.node;
}
T3.avNode=avNode;T3._avn=AVN;
T3.avatar=av5;T3._avLoad=avLoad;
function charByName(name){
  const n=String(name||'').trim();if(!n)return null;
  const c=chars3().find(x=>nm(x)===n);if(c)return c.data;
  return data&&data.name===n?data:null;
}
async function avLoad(file){
  if(!file)return;
  if(!/^image\//.test(file.type)){toast('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');return}
  if(file.size>20e6){toast('Essa imagem é grande demais (máximo de 20 MB).');return}
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('imagem inválida'));i.src=url});
    const S=192,cv=document.createElement('canvas');cv.width=cv.height=S;
    const w=img.naturalWidth,h=img.naturalHeight,m=Math.min(w,h),x=cv.getContext('2d');
    x.fillStyle='#2b211b';x.fillRect(0,0,S,S);
    x.imageSmoothingQuality='high';x.drawImage(img,(w-m)/2,(h-m)*.3,m,m,0,0,S,S);
    let q=.86,out=cv.toDataURL('image/jpeg',q);
    while(out.length>30000&&q>.4){q-=.08;out=cv.toDataURL('image/jpeg',q)}
    if(!avOk(out))throw new Error('não consegui converter a imagem');
    data.avatar=out;save();fx5('confirm');toast('Foto do personagem atualizada.');
  }catch(e){toast('Não consegui usar essa imagem: '+(e.message||'erro')+'.')}
  finally{URL.revokeObjectURL(url)}
}
function avEditor(){
  const p=$q('#tab-overview .panel');if(!p)return;
  let w=$('avEdit');
  if(!w){
    w=document.createElement('div');w.id='avEdit';w.className='av-edit';
    w.innerHTML=`<button type="button" class="av-btn" id="avBtn" aria-label="Trocar a foto do personagem"></button><div class="av-txt"><b>Foto do personagem</b><span class="sub">Aparece na ficha, na Visão de Mesa e nas rolagens. Vale para personagens, NPCs e chefes.</span><div class="inline"><button type="button" class="btn small" id="avPick">Escolher foto</button><button type="button" class="btn small" id="avDel">Remover</button></div></div><input type="file" id="avFile" accept="image/*" hidden>`;
    (p.querySelector('.panel-head')||p.firstElementChild).after(w);
    const pick=()=>$('avFile').click();
    $('avBtn').onclick=pick;$('avPick').onclick=pick;
    $('avFile').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';avLoad(f)};
    $('avDel').onclick=()=>{if(!data.avatar)return;delete data.avatar;save();toast('Foto removida.')};
  }
  $('avBtn').innerHTML=av5(data,'xl');$('avDel').style.display=data.avatar?'':'none';
}
{const _r5=render;render=function(){_r5.apply(this,arguments);try{avEditor()}catch(e){console.warn('[T5] foto',e)}}}

/* ---------- Visão de Mesa: fotos, barras animadas e marcas de dano/cura ---------- */
const T5={prev:{},turnKey:null,seenRolls:new Set()};
function floatNum(host,txt,cls){const f=document.createElement('span');f.className='float5 '+cls;f.textContent=txt;host.appendChild(f);setTimeout(()=>f.remove(),1100)}
function decorateTable(){
  const c=camp3();if(!c)return;
  const hidden=ch=>!!ch.data?.hideStats&&role3()!=='master'&&ch.ownerId!==uid3();
  $$('#tableCharacters .table-char').forEach(card=>{
    const ch=charById(card.dataset.cid);if(!ch)return;const d=ch.data||{};
    if(!card.querySelector('.tc-head')){
      const h3=card.querySelector('h3'),own=card.querySelector('.owner'),eye=card.querySelector('.scene-eye');
      if(h3){const head=document.createElement('div');head.className='tc-head';const id=document.createElement('div');id.className='tc-id';
        h3.before(head);head.append(avNode('card:'+ch.id,d,'lg'));id.append(h3);if(own)id.append(own);head.append(id);if(eye)head.append(eye)}
    }
    if(hidden(ch))return;
    const mx=STAGES[d.stage]||STAGES[1],cur={vital:[Number(d.vital)||0,mx.vt],lucidity:[Number(d.lucidity)||0,mx.luc],essence:[Number(d.essence)||0,mx.es]};
    const old=T5.prev[ch.id];
    if(old){
      const bars=$$('.resource-bar',card);
      [['vital','vt'],['lucidity','luc'],['essence','es']].forEach(([k,cls])=>{
        const delta=cur[k][0]-old[k][0];if(!delta)return;
        const bar=bars.find(b=>b.classList.contains(cls)),sp=bar&&bar.querySelector('span');
        if(sp&&!reduce5()){const to=sp.style.width;sp.style.transition='none';sp.style.width=(old[k][1]?Math.max(0,Math.min(100,old[k][0]/old[k][1]*100)):0)+'%';void sp.offsetWidth;sp.style.transition='';sp.style.width=to}
        if(bar)floatNum(bar.parentElement,(delta>0?'+':'−')+Math.abs(delta),delta>0?'up':'down');
        if(k==='vital'){card.classList.remove('fx-hit','fx-heal');void card.offsetWidth;card.classList.add(delta<0?'fx-hit':'fx-heal');setTimeout(()=>card.classList.remove('fx-hit','fx-heal'),700)}
      });
    }
    T5.prev[ch.id]=cur;
  });
  /* fotos na ordem de combate */
  watchRoster();decorateRoster();
}
function decorateRoster(){
  const cm=camp3()?.combat;if(!cm?.active)return;
  const list=cm.phase==='rolling'?(cm.participants||[]):(cm.order||[]);
  $$('#roundRoster .combatant').forEach((el,i)=>{const ch=charById(list[i]?.characterId);if(!ch)return;el.dataset.cid=ch.id;const n=avNode('ros:'+ch.id,ch.data,'sm');if(el.firstElementChild!==n)el.prepend(n);el.classList.add('has-av')});
}
/* a ordem de combate também é redesenhada fora da Visão de Mesa (a cada salvamento da ficha):
   as fotos voltam no mesmo instante, antes de a tela ser pintada */
let _ro5=null;
function watchRoster(){const r=$('roundRoster');if(!r||r===_ro5)return;_ro5=r;new MutationObserver(()=>{try{decorateRoster()}catch(e){}}).observe(r,{childList:true})}
{const _rt5=window.renderTable;window.renderTable=function(){_rt5.apply(this,arguments);try{decorateTable()}catch(e){console.warn('[T5] mesa',e)}}}
{const _rc5=renderCombatUI;renderCombatUI=function(){_rc5.apply(this,arguments);try{decorateTable();watchTurn()}catch(e){console.warn('[T5] combate',e)}}}

/* ---------- efeitos visuais e sonoros das rolagens ---------- */
const reduce5=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function sparks5(host){
  if(reduce5())return;host.classList.add('fx-host');
  for(let i=0;i<18;i++){const s=document.createElement('i');s.className='spark';const a=Math.random()*Math.PI*2,r=70+Math.random()*110;
    s.style.setProperty('--dx',Math.cos(a)*r+'px');s.style.setProperty('--dy',Math.sin(a)*r+'px');s.style.animationDelay=(Math.random()*.12)+'s';host.appendChild(s);setTimeout(()=>s.remove(),1100)}
}
window.tulpaRollFx=function(box,{d20=false,crit,fumble,tone='',rattle=true,who=[]}={}){
  try{
    if(!box)return;
    /* fotos de quem rolou */
    const people=(who||[]).map(charByName).filter(Boolean),title=box.querySelector('.rp-title');
    if(people.length&&title&&!box.querySelector('.rp-avs'))title.insertAdjacentHTML('beforebegin',`<div class="rp-avs">${people.map(p=>av5(p,'lg')).join(people.length>1?'<span class="rp-vs">⚔</span>':'')}</div>`);
    const dice=$$('.die',box);
    const first=box.querySelector('.dice'),fv=first?$$('.die',first).map(e=>Number(e.textContent)).filter(Number.isFinite):[];
    const best=fv.length?Math.max(...fv):0;
    const isCrit=crit!==undefined?!!crit:(d20&&best===20),isFum=fumble!==undefined?!!fumble:(d20&&fv.length>0&&best===1);
    const vals=dice.map(e=>e.textContent);
    box.classList.remove('fx-crit','fx-fumble','fx-settled','fx-rolling');
    if(rattle&&dice.length)fx5('dice');
    const fin=()=>{
      dice.forEach((e,i)=>{e.textContent=vals[i]});box.classList.remove('fx-rolling');box.classList.add('fx-settled');
      if(isCrit){box.classList.add('fx-crit');sparks5(box.querySelector('.bigresult')||box);fx5('crit')}
      else if(isFum){box.classList.add('fx-fumble');fx5('fumble')}
      else if(tone)fx5(tone);else if(!dice.length)fx5('confirm');
    };
    if(reduce5()||!dice.length){fin();return}
    box.classList.add('fx-rolling');
    let n=0;const iv=setInterval(()=>{dice.forEach((e,i)=>{const mxv=Math.max(Number(vals[i])||1,d20||/best|discard/.test(e.className)?20:6);e.textContent=1+Math.floor(Math.random()*mxv)});if(++n>=7){clearInterval(iv);fin()}},62);
  }catch(e){console.warn('[T5] efeito de rolagem',e)}
};

/* ---------- Perseus narrador: comenta a sessão com o nome de quem jogou ---------- */
const NAR={
  nat20:['<b>{n}</b> tirou <b>20 natural</b> em {s}! Guardem essa data, vai virar feriado.','VINTE em {s}! <b>{n}</b>, de onde saiu isso? Eu vi o seu histórico.','<b>{n}</b> acabou de gastar a sorte do mês inteiro em {s}. Valeu a pena.','20 natural! <b>{n}</b>, eu quase aplaudi. Não tenho polegar, mas a intenção conta.','<b>{n}</b> rolou 20 em {s}. O dado está pedindo desculpas pelas outras vezes.','Alguém anota: <b>{n}</b>, {s}, 20 natural. Vai precisar de testemunha depois.'],
  nat1:['<b>{n}</b> tirou <b>1</b> em {s}. O dado olhou pra ficha e disse “não”.','Um 1 em {s}. <b>{n}</b>, isso não foi uma rolagem, foi um pedido de socorro.','<b>{n}</b> conseguiu errar {s} de um jeito que nem o manual previu.','1 natural! <b>{n}</b>, eu vou fingir que não vi. (Eu vi. Todo mundo viu.)','<b>{n}</b> e o dado terminaram o relacionamento agora, em {s}.','Silêncio na mesa. <b>{n}</b> tirou 1 em {s} e eu preciso respeitar o luto.'],
  high:['<b>{n}</b> fez <b>{x}</b> em {s}. Competência é sempre uma surpresa agradável.','{x} em {s}! <b>{n}</b> veio trabalhar hoje.','<b>{n}</b> mandou {x} em {s}. Mestre, pode chorar no banho.','Olha só, <b>{n}</b> com {x} em {s}. Tem gente que lê a ficha, afinal.'],
  low:['<b>{n}</b> fez {x} em {s}. Foi uma tentativa. Tecnicamente.','{x} em {s}. <b>{n}</b>, o importante é participar.','<b>{n}</b> tirou {x} em {s}. Eu, que sou um gato, faria melhor dormindo.','{x}. <b>{n}</b>, a gente finge que era um teste de humildade.'],
  mid:['<b>{n}</b> rolou {s}: {x}. Nem herói nem vergonha. Um dia comum de trabalho.','{s} de <b>{n}</b> deu {x}. O Mestre que decida se isso basta.','<b>{n}</b>, {x} em {s}. Estou anotando tudo, só para constar.'],
  hit:['<b>{a}</b> acertou <b>{t}</b> com {w}: <b>{x} de dano</b>. Isso vai doer amanhã.','{x} de dano em <b>{t}</b>. <b>{a}</b> não veio fazer amigos.','<b>{a}</b> acerta <b>{t}</b>! {x} de dano. Alguém tem gelo?','<b>{t}</b> levou {x} de <b>{a}</b>. Eu senti daqui, e eu nem tenho ficha.'],
  violent:['<b>ACERTO VIOLENTO!</b> <b>{a}</b> amassou <b>{t}</b>: {x} de dano e ainda ganha outra ação.','<b>{a}</b> pegou <b>{t}</b> desprevenido. {x} de dano. Feio de ver, lindo de narrar.','<b>{t}</b> nem viu de onde veio. <b>{a}</b>, {x} de dano e direito a bis.'],
  crit:['<b>CRÍTICO!</b> <b>{a}</b> em <b>{t}</b>: {x} de dano. Alguém recolhe os dentes.','<b>{a}</b> critou em <b>{t}</b>! {x} de dano. Isso não foi um ataque, foi um recado.','CRÍTICO de <b>{a}</b>! <b>{t}</b>, sinto muito. Na verdade não, foi lindo.'],
  dodge:['<b>{t}</b> desviou de <b>{a}</b>. Elegante. Quase felino.','<b>{a}</b> atacou o ar. O ar está bem, obrigado. <b>{t}</b> também.','<b>{t}</b> saiu da frente e <b>{a}</b> acertou o vazio com muita convicção.','Errou! <b>{a}</b>, o alvo era <b>{t}</b>, não a parede.'],
  block:['A proteção de <b>{t}</b> segurou o golpe de <b>{a}</b>. Dinheiro bem gasto.','<b>{a}</b> bateu, a defesa de <b>{t}</b> respondeu “hoje não”.','<b>{t}</b> aguentou firme. <b>{a}</b>, tenta bater com mais vontade.'],
  retal:['<b>RETALIAÇÃO!</b> <b>{t}</b> desviou com folga e vai devolver. <b>{a}</b>, eu começaria a rezar.','<b>{t}</b> esquivou e ganhou uma ação extra. <b>{a}</b> acabou de armar o próprio problema.','<b>{a}</b> errou feio e <b>{t}</b> agradece a oportunidade.'],
  dying:['<b>{t}</b> caiu e está <b>Morrendo</b>! Três turnos, pessoal. Alguém tem uma atadura?','<b>{t}</b> no chão. Sutura Bruta existe, e este seria um ótimo momento para lembrar dela.','<b>{t}</b> está Morrendo. Não é hora de saquear o inimigo, é hora de salvar o colega.'],
  dead:['<b>{t}</b> morreu. Um minuto de silêncio. Eu tiro a gravata em respeito. (Não tiro, mas penso nisso.)','Descanse em paz, <b>{t}</b>. Foi uma ficha muito bonita.','<b>{t}</b> não resistiu. Alguém avisa a família. E o Mestre, que parece feliz demais.'],
  turn:['Vez de <b>{n}</b>. Sem pressão. (Com pressão.)','<b>{n}</b>, o palco é seu. Tenta não cair dele.','Agora é <b>{n}</b>. Estou assistindo, e eu julgo.','<b>{n}</b> na vez. Um talento de graça e uma ação. Usa com sabedoria.','Vai, <b>{n}</b>. A mesa inteira finge que não está torcendo contra.'],
  round:['<b>Rodada {x}</b>. Todo mundo ainda vivo? Não respondam, eu estou contando.','Começa a rodada {x}. Os efeitos por rodada acabaram de andar.','Rodada {x}. O Mestre sorriu. Eu não gostei.'],
  init:['<b>{n}</b> age primeiro. Reflexo de gato. Quase.','A ordem saiu, e <b>{n}</b> puxa a fila. Sem desculpas agora.','<b>{n}</b> ganhou a iniciativa. Os outros que esperem sentados.'],
  start:['Combate começou! Eu fico aqui em cima, onde é seguro.','Protocolo de Confronto. Guardem os lanches e rolem Reflexo.'],
};
const NAR_PRI={dead:5,dying:5,crit:4,nat20:4,nat1:4,violent:3,retal:3,init:3,start:3,hit:2,dodge:2,block:2,round:2,high:1,low:1,turn:1,mid:0};
const NAR_MOOD={nat20:'hype',crit:'hype',violent:'hype',high:'hype',nat1:'sad',dead:'sad',dying:'sad',low:'sad'};
T5.lastLine={};
function narrate(kind,ctx={}){
  try{
    if(!prefs.perseus||!prefs.perseusReacts||!NAR[kind])return false;
    const pri=NAR_PRI[kind]||0,now=Date.now();
    if(now-(T5.narAt||0)<3200&&pri<=(T5.narPri||0))return false;
    let pool=NAR[kind].filter(l=>l!==T5.lastLine[kind]);if(!pool.length)pool=NAR[kind];
    const line=rnd(pool);T5.lastLine[kind]=line;
    const html=line.replace(/\{(\w+)\}/g,(m,k)=>esc(ctx[k]??'')).replace(/\s+com \./,'.').replace(/ com :/,':');
    T5.narAt=now;T5.narPri=pri;setTimeout(()=>{if(T5.narAt===now)T5.narPri=0},3200);
    PS.lastReact=now;mood(NAR_MOOD[kind]||'smug');
    if(PS.open)addMsg('p','🎙 '+html,false);else say(html,pri>=4?7000:5200);
    if(pri>=3)fx5('meow');
    return true;
  }catch(e){return false}
}
T3.narrate=narrate;
/* rolagem de perícia (da ficha, da mesa ou de outro jogador) */
function narrateRoll(o){
  try{
    const name=o.name||o.character_name,skill=o.skill,dice=(o.dice||[]).map(Number),total=Number(o.total)||0;
    if(!name||!skill||!dice.length)return;
    if(o.sides&&o.sides!==20)return;
    if(o.id){if(T5.seenRolls.has(o.id))return;T5.seenRolls.add(o.id)}
    if(o.created_at&&Date.now()-Date.parse(o.created_at)>25000)return;
    const key=name+'|'+skill+'|'+total,now=Date.now();if(T5.rollKey===key&&now-(T5.rollAt||0)<5000)return;T5.rollKey=key;T5.rollAt=now;
    const best=Math.max(...dice),ctx={n:name,s:skill,x:total};
    if(best===20)return narrate('nat20',ctx);
    if(best===1)return narrate('nat1',ctx);
    if(total>=22)return narrate('high',ctx);
    if(total<=6)return narrate('low',ctx);
    if(Math.random()<.4)narrate('mid',ctx);
  }catch(e){}
}
T3.narrateRoll=narrateRoll;window.tulpaNarrateRoll=narrateRoll;
/* resultado de um confronto */
function narrateRes(dt){
  try{
    const ctx={a:dt.attackerName,t:dt.targetName,w:dt.weapon||'o que tinha na mão',x:dt.dmg?.final??0},st=dt.statuses||[];
    if(st.includes('morto')){fx5('dead');return narrate('dead',ctx)}
    if(st.includes('agonia')){fx5('dying');return narrate('dying',ctx)}
    if(dt.crit&&dt.hit)return narrate('crit',ctx);
    const k={violento:'violent',normal:'hit',esquiva:'dodge',defesa:'block',retaliacao:'retal'}[dt.outcome];
    if(k)narrate(k,ctx);
  }catch(e){}
}
T3.narrateRes=narrateRes;
/* troca de turno e de rodada */
function watchTurn(){
  const cm=camp3()?.combat;
  if(!cm?.active||cm.phase!=='active'){if(T5.turnKey&&T5.turnKey!=='off'){T5.turnKey='off'}return}
  const cur=curEntry();if(!cur)return;
  const key=cm.round+':'+cur.characterId,first=T5.turnKey===null||T5.turnKey==='off',prevRound=T5.round;
  if(key===T5.turnKey)return;T5.turnKey=key;T5.round=cm.round;
  if(first)return;
  const ch=charById(cur.characterId);if(!ch||isDyingCh(ch)||stIds(ch.data).includes('morto'))return;
  if(prevRound&&cm.round>prevRound){fx5('round');if(narrate('round',{x:cm.round}))return}
  else fx5('turn');
  narrate('turn',{n:nm(ch)});
}

/* o Perseus sabe explicar as novidades */
[
 ['foto-perfil','Foto de perfil do personagem',['foto','foto de perfil','avatar','imagem do personagem','retrato','fotinha','trocar foto'],'Na ficha, em <b>Visão geral › Identificação do agente</b>, clique em <b>Escolher foto</b>. Eu recorto e reduzo a imagem sozinho. A foto aparece na ficha, nos cards da <b>Visão de Mesa</b>, na ordem de combate e nas rolagens. Vale para personagens, NPCs e chefes. Sem foto, fica um monograma com as iniciais.',{tab:'overview',sel:'#avEdit'}],
 ['sons','Sons e efeitos',['som','sons','efeitos sonoros','volume','mudo','silenciar','barulho'],'Os sons de dado, acerto, crítico, turno e ritual podem ficar <b>ligados, baixos ou desligados</b> em <b>⚙ Aparência › Sons</b>. As animações respeitam a opção “reduzir movimento” do seu aparelho.'],
 ['narrador','Perseus narrando a sessão',['narrar','narrador','comentar','comentarios','comenta as rolagens','parar de comentar'],'Eu comento as rolagens e o combate com o nome de quem jogou: 20 natural, 1 natural, acertos, esquivas, críticos, quem caiu e de quem é a vez. Para me calar (que grosseria), clique em ⚙ no meu chat e desmarque <b>Comentar rolagens e acontecimentos</b>.'],
].forEach(([id,title,kws,a,go])=>{if(K.some(x=>x.id===id))return;const e={id,title,kws,a,...(go&&go.tab?{go:[go]}:{})};e.nk=kws.map(normP);e.nt=normP(title).split(' ').filter(w=>!STOP.has(w)&&w.length>2);K.push(e)});


