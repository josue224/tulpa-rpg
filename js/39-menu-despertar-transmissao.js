/* ===================================================================
   TULPA · ETAPA 26 — Arcade pelo menu, configurações limpas, Perseus
   arrastável e trava de turno no combate (inclusive para o Mestre)
   =================================================================== */

/* ---------- 1a. Arcade a qualquer momento ---------- */
function arcGo26(){
  if(!camp3()){toast('Entre numa mesa para abrir o Tulpa Arcade.');return}
  try{mgOpen()}catch(e){console.warn('[T26] arcade',e)}
}
T3.arcGo=arcGo26;
/* o botão ☾/☀ sai do topo (quebrava as estéticas); no lugar entra o Arcade */
function top26(){
  $$('.t3-themebtn').forEach(b=>b.remove());
  $$('.t3-themewrap.in-top').forEach(w=>{
    if(w.querySelector('.t26-arc'))return;
    const a=document.createElement('button');a.type='button';a.className='btn small ghost t26-arc';
    a.innerHTML='<span aria-hidden="true">🕹</span> Arcade';a.title='Tulpa Arcade e o quarto do Perseus (não precisa da chamada nem do Intervalo)';
    a.onclick=arcGo26;w.prepend(a);
  });
}
/* também na barra da mesa (ao lado da call e da mão), que aparece no celular */
function bar26(){
  const bar=$('mesaBar');if(!bar||$('mbArc26'))return;
  const g=document.createElement('div');g.id='mbArc26';g.className='mb-group mb-arc26';
  g.innerHTML='<button type="button" class="btn small" id="arcBtn26">🕹 Arcade</button><button type="button" class="btn small" id="petBtn26">🐱 Visitar o Perseus</button>';
  const after=$('mbHand')||$('mbCall');if(after)after.after(g);else bar.append(g);
  $('arcBtn26').onclick=arcGo26;$('petBtn26').onclick=()=>{if(!camp3()){toast('Entre numa mesa para visitar o Perseus.');return}T3.petOpen?.('room')};
}
function vis26(){
  let ok=true;try{ok=!camp3()||T3.canAccessArcade?T3.canAccessArcade():true}catch(e){}
  $$('.t26-arc,#mbArc26').forEach(e=>{e.hidden=!ok;e.style.display=ok?'':'none'});
  if(!ok&&MG.open){try{mgClose()}catch(e){}}
}
T3.vis26=vis26;
onState6(()=>{try{vis26()}catch(e){}});
setInterval(()=>{try{if(!document.hidden){bar26();vis26()}}catch(e){}},1200);
{const _it26=T3.initTheme;T3.initTheme=function(){const out=_it26.apply(this,arguments);try{top26()}catch(e){}return out}}
setTimeout(top26,0);setTimeout(top26,1500);

/* ---------- 1b. configurações: sem seletor de visualização e claro/escuro só na Estrutura Clássica ---------- */
if(prefs.view!=='auto'){prefs.view='auto';try{savePrefs()}catch(e){}}
function cfg26(){
  const mb=$('modalBody');if(!mb)return;
  mb.querySelector('[data-pref="view"]')?.closest('.field')?.remove();
  const f=mb.querySelector('.ae-classic')||mb.querySelector('.pal-grid')?.closest('.field');
  if(f){
    const l=f.querySelector(':scope>label');if(l)l.textContent='Estrutura Clássica: claro ou escuro';
    if(!f.querySelector('.t26-note')){const n=document.createElement('p');n.className='sub t26-note';n.textContent='Claro e escuro valem para a Estrutura Clássica. As estéticas da galeria já trazem as próprias cores.';(l||f.firstChild)?.after?.(n)}
  }
  const pf=mb.querySelector('[data-pref="perseus"]')?.closest('.field');
  if(pf&&!pf.querySelector('#catReset26')){
    const b=document.createElement('button');b.type='button';b.className='btn small';b.id='catReset26';b.textContent='Levar o Perseus de volta ao canto';b.style.marginTop='8px';
    b.onclick=()=>{catReset26();toast('O Perseus voltou ao canto da tela.')};pf.append(b);
  }
}
{const _os26=openSettings;openSettings=function(){const out=_os26.apply(this,arguments);try{cfg26()}catch(e){console.warn('[T26] config',e)}return out};T3.openSettings=openSettings}
$$('.t3-setbtn').forEach(b=>b.onclick=openSettings);

/* ---------- 1c. Perseus arrastável (mouse e dedo) ---------- */
const PD26={key:'tulpa_perseus_pos',p:null,skip:0};
try{PD26.p=JSON.parse(localStorage.getItem(PD26.key)||'null')}catch(e){PD26.p=null}
const clampN26=(v,a,b)=>Math.max(a,Math.min(b,v));
function catXY26(c){const vw=innerWidth,vh=innerHeight,w=c.offsetWidth||80,h=c.offsetHeight||80,p=PD26.p;
  return{x:clampN26(p.fx*(vw-w),8,Math.max(8,vw-w-8)),y:clampN26(p.fy*(vh-h),10,Math.max(10,vh-h-8)),w,h}}
function catPlace26(){
  const c=$('t3Cat');if(!c)return;
  if(!PD26.p){['left','top','right','bottom'].forEach(k=>c.style[k]='');near26();return}
  const q=catXY26(c);c.style.left=q.x+'px';c.style.top=q.y+'px';c.style.right='auto';c.style.bottom='auto';near26();
}
function catReset26(){PD26.p=null;try{localStorage.removeItem(PD26.key)}catch(e){}catPlace26()}
T3.catReset=catReset26;
/* balão e animação acompanham o gato */
function near26(){
  const c=$('t3Cat'),b=$('t3CatBubble'),pa=$('pa24');
  [b,pa].forEach(el=>{if(el)['left','top','right','bottom','maxWidth'].forEach(k=>el.style[k]='')});
  if(!c||!PD26.p)return;
  const vw=innerWidth,vh=innerHeight,q=catXY26(c),r={left:q.x,top:q.y,right:q.x+q.w,bottom:q.y+q.h},right=q.x+q.w/2>vw/2;
  if(b){
    if(right){b.style.right=(vw-r.left+6)+'px';b.style.left='auto';b.style.maxWidth=Math.max(140,Math.min(270,r.left-14))+'px'}
    else{b.style.left=(r.right+6)+'px';b.style.right='auto';b.style.maxWidth=Math.max(140,Math.min(270,vw-r.right-14))+'px'}
    if(r.top<170){b.style.top=(r.top+q.h*.25)+'px';b.style.bottom='auto'}else{b.style.bottom=(vh-r.bottom+q.h*.35)+'px';b.style.top='auto'}
  }
  if(pa){
    if(right){pa.style.right=Math.max(6,vw-r.right)+'px';pa.style.left='auto'}else{pa.style.left=Math.max(6,r.left)+'px';pa.style.right='auto'}
    if(r.top>220){pa.style.bottom=(vh-r.top+6)+'px';pa.style.top='auto'}else{pa.style.top=(r.bottom+6)+'px';pa.style.bottom='auto'}
  }
}
function catDrag26(){
  const c=$('t3Cat');if(!c||c.dataset.drag26)return;c.dataset.drag26='1';c.style.touchAction='none';
  c.title='Perseus: clique para conversar · segure e arraste para mudar de lugar';
  let st=null;
  c.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const r=c.getBoundingClientRect();st={id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,moved:false};
    try{c.setPointerCapture(e.pointerId)}catch(x){}
  });
  c.addEventListener('pointermove',e=>{
    if(!st||e.pointerId!==st.id)return;
    if(!st.moved){if(Math.hypot(e.clientX-st.sx,e.clientY-st.sy)<=6)return;st.moved=true;c.classList.add('t26-drag');$('t3CatBubble')?.classList.remove('show')}
    const vw=innerWidth,vh=innerHeight,w=c.offsetWidth||80,h=c.offsetHeight||80;
    const x=clampN26(e.clientX-st.ox,8,Math.max(8,vw-w-8)),y=clampN26(e.clientY-st.oy,10,Math.max(10,vh-h-8));
    PD26.p={fx:+(x/Math.max(1,vw-w)).toFixed(4),fy:+(y/Math.max(1,vh-h)).toFixed(4)};
    c.style.left=x+'px';c.style.top=y+'px';c.style.right='auto';c.style.bottom='auto';e.preventDefault();
  });
  const end=e=>{
    if(!st||e.pointerId!==st.id)return;const mv=st.moved;st=null;c.classList.remove('t26-drag');
    try{c.releasePointerCapture(e.pointerId)}catch(x){}
    if(mv){PD26.skip=Date.now();try{localStorage.setItem(PD26.key,JSON.stringify(PD26.p))}catch(x){}catPlace26()}
  };
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  /* arrastar não abre o chat; clique simples continua abrindo */
  c.addEventListener('click',e=>{if(Date.now()-PD26.skip<350){e.stopImmediatePropagation();e.preventDefault()}},true);
  catPlace26();
}
{const _ip26=T3.initPerseus;T3.initPerseus=function(){const out=_ip26.apply(this,arguments);try{catDrag26()}catch(e){console.warn('[T26] Perseus',e)}return out}}
setTimeout(catDrag26,0);
addEventListener('resize',()=>{clearTimeout(PD26.rt);PD26.rt=setTimeout(catPlace26,120)});
{const _r26=react24;react24=function(){const out=_r26.apply(this,arguments);try{near26()}catch(e){}return out};PerseusAnimator.react=react24}
{const _say26=T3.say;if(typeof _say26==='function')T3.say=function(){const out=_say26.apply(this,arguments);try{near26()}catch(e){}return out}}

/* ---------- 4. combate: só o token da vez se move ---------- */
const CB26={unlock:false,cur:null};
const lock26=()=>inCb14()&&!CB26.unlock;
T3.cbFree=()=>!!CB26.unlock;
const _cm26=canMove7;
canMove7=function(tok){
  if(!_cm26(tok))return false;
  if(!lock26())return true;
  const ch=charById(tok?.charId),cur=cur14();
  if(!ch||!cur||ch.id!==cur.id)return false;   /* fora da vez ninguém mexe (nem o Mestre) */
  return controls(ch);                           /* na vez de um jogador o Mestre também fica travado */
};
T3.canMove=canMove7;
/* aviso quando alguém tenta arrastar um token fora da vez */
document.addEventListener('pointerdown',e=>{
  try{
    if(!MAP7.cv||e.target!==MAP7.cv||!lock26()||MAP7.tool!=='move')return;
    const p=mapPt7(e),t=mapHit7(p.wx,p.wy);if(!t||!_cm26(t)||canMove7(t))return;
    const cur=cur14(),n=cur?.data?.name||'outro personagem';
    deny14(isGM6()&&cur&&!controls(cur)?`Vez de ${n} (jogador): os tokens ficam travados até a vez de um NPC.`:`Vez de ${n}: só esse token se move agora.`);
  }catch(x){}
},true);
/* botão de emergência do Mestre (desligado por padrão) e seleção automática do token da vez */
function unlockUi26(){
  const st=MAP7.stage;let b=$('cbUnlock26');
  const show=!!st&&isGM6()&&inCb14();
  if(!inCb14())CB26.unlock=false;
  if(!show){if(b)b.remove();return}
  if(!b||b.parentNode!==st){b?.remove();b=document.createElement('button');b.type='button';b.id='cbUnlock26';b.className='cb-unlock26';st.append(b);
    b.onclick=()=>{CB26.unlock=!CB26.unlock;unlockUi26();toast(CB26.unlock?'🔓 Posição manual liberada: você pode mover qualquer token (sem gastar metros).':'🔒 Trava de turno ligada de novo.');try{actButton10();mapDraw7()}catch(e){}}}
  const sig=CB26.unlock?'on':'off';if(b.dataset.sig!==sig){b.dataset.sig=sig;b.classList.toggle('on',CB26.unlock);b.setAttribute('aria-pressed',CB26.unlock);
    b.innerHTML=CB26.unlock?'🔒 Travar de novo':'🔓 Destravar Posição Manual';b.title=CB26.unlock?'Voltar a travar o mapa no token da vez':'Emergência: mover um token preso fora da vez (não gasta metros)'}
}
setInterval(()=>{
  try{
    unlockUi26();
    if(!inCb14()){CB26.cur=null;return}
    const cur=cur14(),id=cur?.id||null;if(id===CB26.cur)return;CB26.cur=id;
    if(cur&&controls(cur)){const t=tok14(cur.id);if(t&&(isGM6()||!MAP7.sel)){MAP7.sel=t.id;try{actButton10();mapDraw7()}catch(e){}}}
  }catch(e){}
},600);
console.info('[Tulpa] Etapa 26 carregada');

/* ===================================================================
   TULPA · ETAPA 27 — Despertar: a Trilha só chega quando o personagem
   desperta na história (o Estágio continua subindo sem Trilha)
   =================================================================== */
/* fichas antigas que já têm trilha contam como despertas */
const awk27=(d=data)=>!!d&&(d.awakened===true||(d.awakened==null&&!!d.track)||!!d.freeMode);
T3.awakened=awk27;
function awkCard27(){
  const tab=$('tab-track');if(!tab)return;
  const panels=[...tab.querySelectorAll(':scope>.panel')];
  let c=$('awk27');
  if(!c){c=document.createElement('div');c.id='awk27';c.className='panel awk27';tab.prepend(c)}
  const on=awk27();
  panels.forEach(p=>p.classList.toggle('hide',!on));
  if(on){
    const st=Number(data.stage)||1,since=Number(data.awakenStage)||0;
    c.className='panel awk27 done';
    c.innerHTML=`<div class="awk27-row"><span class="awk27-ico" aria-hidden="true">✨</span><div><b>Desperto</b><span class="sub">${data.awakened===true&&since?`Despertou no Estágio ${since}. `:''}${st>=3?'A Trilha recebe os poderes de todos os estágios já alcançados (3, 5, 8 e 10).':'Os poderes da Trilha começam no Estágio 3.'}</span></div></div>`;
    return;
  }
  const st=Number(data.stage)||1;
  c.className='panel awk27';
  c.innerHTML=`<div class="awk27-hero"><span class="awk27-ico big" aria-hidden="true">✨</span><div><h2>Despertar</h2>
    <p>Este personagem <b>ainda não despertou</b>. Ele continua subindo de Estágio normalmente, só que <b>sem Trilha</b>.</p>
    <p class="sub">Quando o Despertar acontecer na história, o jogador ou o Mestre toca no botão. A escolha de Arquétipo e Trilha é liberada e ele recebe na hora os poderes dos estágios que já alcançou${st>=3?` (está no Estágio ${st})`:''} e dos próximos.</p></div></div>
    <div class="inline"><button type="button" class="btn primary awk27-btn" id="awkBtn27">✨ Despertar</button><span class="sub">Estágio atual: <b>${st}</b></span></div>`;
  $('awkBtn27').onclick=awkAsk27;
}
function awkAsk27(){
  const n=data.name||'Este personagem';
  openModal('DESPERTAR','✨ '+n+' desperta?',`<p>Use quando o Despertar acontecer na narrativa. Depois disso a aba libera a escolha de <b>Arquétipo</b> e <b>Trilha</b>.</p><div class="notice">Ao escolher a Trilha, ${esc(n)} recebe os poderes de todos os estágios que já alcançou (Estágio ${Number(data.stage)||1}).</div>`,'✨ Despertar agora',()=>{
    data.awakened=true;data.awakenStage=Number(data.stage)||1;data.awakenedAt=new Date().toISOString();
    closeModal();save();
    toast('✨ '+n+' despertou! Escolha o Arquétipo e a Trilha.');
    try{T3.perseusAnim?.react('extase')}catch(e){}
    try{const ch=charById(activeCharacterId);if(ch&&camp3()&&typeof insertRow==='function')insertRow(ch,'Despertar',{detail:{cmb:'log',text:`✨ ${n} despertou no Estágio ${data.awakenStage}.`}}).catch(()=>{})}catch(e){}
    setTimeout(()=>$('archSelect')?.focus(),300);
  });
}
T3.awaken=awkAsk27;
{const _rt27=renderTracks;renderTracks=function(){const out=_rt27.apply(this,arguments);try{awkCard27();if(!awk27()){const b=$('confirmTrack');if(b)b.disabled=true}}catch(e){console.warn('[T27] despertar',e)}return out}}
{const _pv27=previewTrack;previewTrack=function(){const out=_pv27.apply(this,arguments);try{if(!awk27())$('confirmTrack').disabled=true}catch(e){}return out}}
/* Visão Geral */
{const _r27=render;render=function(){const out=_r27.apply(this,arguments);try{const o=$('overviewTrack');if(o&&!awk27()&&!data.track)o.innerHTML='Ainda não despertou. <button type="button" class="btn small" data-awk27="1">✨ Despertar</button>'}catch(e){}return out}}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-awk27]'))awkAsk27()});
console.info('[Tulpa] Etapa 27 carregada');

/* ===================================================================
   TULPA · ETAPA 28 — 🖥️ Transmitir Tela (getDisplayMedia + WebRTC)
   Mestre transmite livremente; jogador pede permissão ao Mestre.
   Malha própria (separada do áudio da call) no canal "tulpa-screen-<campanha>".
   =================================================================== */
const SC28={sid:Math.random().toString(36).slice(2,10),ch:null,camp:'',live:false,stream:null,sharer:null,sharerName:'',peers:new Map(),view:null,asks:{},granted:false,beat:0,lastStart:0,audio:false,src:null,sharerAudio:false};
T3.screen=SC28;
const scName28=u=>{try{if(u===vGm8())return'Mestre';const ch=charOfUser6(u);return String((ch&&nm(ch))||M6.present?.[u]?.name||'Jogador').slice(0,32)}catch(e){return'Jogador'}};
const scOk28=()=>!!navigator.mediaDevices?.getDisplayMedia&&typeof RTCPeerConnection==='function';
function scSend28(o){try{if(SC28.ch&&SC28.live)SC28.ch.send({type:'broadcast',event:'sc',payload:{...o,from:uid3(),fs:SC28.sid}})}catch(e){}}
function scJoin28(){
  const c=camp3();if(!c){scLeave28();return}
  if(SC28.ch&&SC28.camp===c.id)return;scLeave28();SC28.camp=c.id;
  try{const s=sb();if(!s||typeof s.channel!=='function')return;
    const ch=s.channel('tulpa-screen-'+c.id,{config:{broadcast:{self:false}}});
    ch.on('broadcast',{event:'sc'},({payload})=>{try{scMsg28(payload||{})}catch(e){console.warn('[T28] tela',e)}});
    ch.subscribe(st=>{if(st==='SUBSCRIBED'){SC28.live=true;scSend28({k:'who'})}});SC28.ch=ch;
  }catch(e){console.warn('[T28] canal',e)}
}
function scLeave28(){scStop28(true);scViewClose28();try{SC28.ch&&sb()?.removeChannel?.(SC28.ch)}catch(e){}try{SC28.ch?.unsubscribe?.()}catch(e){}SC28.ch=null;SC28.live=false;SC28.camp=''}
/* ---------- quem transmite ---------- */
function scPeer28(to){
  let p=SC28.peers.get(to);if(p)return p;/* to = sessão de quem assiste */
  const pc=new RTCPeerConnection({iceServers:iceServers8()});p={pc,to};SC28.peers.set(to,p);
  SC28.stream.getTracks().forEach(t=>pc.addTrack(t,SC28.stream));
  pc.onicecandidate=e=>{if(e.candidate)scSend28({k:'ice',ts:to,c:e.candidate.toJSON?e.candidate.toJSON():e.candidate,dir:'v'})};
  pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)){try{pc.close()}catch(e){}SC28.peers.delete(to)}};
  pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>scSend28({k:'offer',ts:to,sdp:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}})).catch(e=>console.warn('[T28] oferta',e));
  return p;
}
async function scStart28(audioOnly){
  if(!scOk28()){toast('Transmitir a tela não funciona neste navegador (celulares não permitem). Use um computador. Assistir funciona normalmente.');return}
  if(!camp3()){toast('Entre numa mesa para transmitir.');return}
  if(!isGM6()&&!SC28.granted){scAsk28();return}
  let st;try{st=await navigator.mediaDevices.getDisplayMedia(audioOnly?{video:true,audio:true,systemAudio:'include'}:{video:{cursor:'always'},audio:true})}catch(e){toast('Transmissão cancelada.');SC28.granted=false;scBar28();return}
  let out=st;
  if(audioOnly){
    /* só o som: a imagem capturada não é enviada a ninguém (o navegador exige escolher uma janela/aba para liberar o áudio) */
    const at=st.getAudioTracks();
    if(!at.length){st.getTracks().forEach(t=>{try{t.stop()}catch(e){}});toast('Nenhum áudio foi compartilhado. Escolha a ABA do YouTube e marque “Compartilhar áudio da aba” (no Chrome/Edge do computador).');scBar28();return}
    out=new MediaStream(at);
  }
  if(SC28.sharer&&SC28.sharer!==uid3())scViewClose28();
  scStop28(true);SC28.stream=out;SC28.src=audioOnly?st:null;SC28.audio=!!audioOnly;SC28.sharer=uid3();SC28.sharerName=scName28(uid3());
  const keep=audioOnly?st.getTracks():out.getVideoTracks();
  keep.forEach(t=>{t.onended=()=>{if(SC28.stream===out)scStop28()}});
  scSend28({k:'start',name:SC28.sharerName,audio:audioOnly?1:0});SC28.lastStart=Date.now();
  toast(audioOnly?'🎧 O áudio da janela está sendo transmitido para a mesa.':'🖥️ Sua tela está sendo transmitida para a mesa.');scBar28();
}
function scStop28(silent){
  const mine=SC28.sharer===uid3()&&SC28.stream;
  SC28.peers.forEach(p=>{try{p.pc.close()}catch(e){}});SC28.peers.clear();
  if(SC28.stream){SC28.stream.getTracks().forEach(t=>{try{t.stop()}catch(e){}});SC28.stream=null}
  if(SC28.src){SC28.src.getTracks().forEach(t=>{try{t.stop()}catch(e){}});SC28.src=null}
  SC28.audio=false;
  if(mine){scSend28({k:'stop'});SC28.sharer=null;SC28.granted=false;if(!silent)toast('Transmissão encerrada.')}
  scBar28();
}
T3.screenStart=scStart28;T3.screenStop=scStop28;
/* ---------- permissão ---------- */
function scAsk28(){
  if(SC28.asking&&Date.now()-SC28.asking<20000){toast('Pedido enviado. Esperando o Mestre.');return}
  SC28.asking=Date.now();scSend28({k:'ask',name:scName28(uid3())});toast('✋ Pedido enviado ao Mestre. A tela só aparece depois que ele permitir.');scBar28();
}
function scAskUi28(u,name){
  if(!isGM6())return;SC28.asks[u]=name;
  let box=$('scAsk28');if(!box){box=document.createElement('div');box.id='scAsk28';box.className='sc28-asks';box.setAttribute('role','alertdialog');document.body.append(box)}
  box.innerHTML=Object.entries(SC28.asks).map(([id,n])=>`<div class="sc28-ask"><span>🖥️ <b>${esc(n)}</b> quer transmitir a tela</span><span class="sc28-ask-b"><button type="button" class="btn small primary" data-scok="${esc(id)}">Permitir</button><button type="button" class="btn small" data-scno="${esc(id)}">Recusar</button></span></div>`).join('');
  if(!Object.keys(SC28.asks).length)box.remove();
  $$('[data-scok]',box).forEach(b=>b.onclick=()=>{const id=b.dataset.scok;delete SC28.asks[id];scSend28({k:'grant',to:id});scAskUi28();toast('Permissão enviada.')});
  $$('[data-scno]',box).forEach(b=>b.onclick=()=>{const id=b.dataset.scno;delete SC28.asks[id];scSend28({k:'deny',to:id});scAskUi28()});
  try{T3.fx?.('click')}catch(e){}
}
/* ---------- quem assiste ---------- */
function scView28(from,name,fs){
  let v=SC28.view;
  if(v&&(v.from!==from||v.fs!==fs)){scViewClose28();v=null}
  if(!v){
    const pc=new RTCPeerConnection({iceServers:iceServers8()});v={from,fs,pc,name,audio:!!SC28.sharerAudio};SC28.view=v;
    pc.onicecandidate=e=>{if(e.candidate)scSend28({k:'ice',ts:fs,c:e.candidate.toJSON?e.candidate.toJSON():e.candidate,dir:'s'})};
    pc.ontrack=e=>{const pn=scPanel28(from,name,v.audio),vid=pn.querySelector('video');vid.srcObject=e.streams&&e.streams[0]?e.streams[0]:new MediaStream([e.track]);
      if(v.audio){
        /* só som: tenta tocar com volume; se o navegador exigir um toque, deixa mudo e avisa */
        const sb=pn.querySelector('[data-sca="snd"]'),vol=pn.querySelector('.sc28-vol');
        vid.muted=false;vid.volume=Math.max(0,Math.min(1,(prefs.musicVol==null?60:prefs.musicVol)/100));if(vol)vol.value=Math.round(vid.volume*100);
        const set=()=>{sb.textContent=vid.muted?'🔇':'🔊';sb.setAttribute('aria-pressed',String(!vid.muted))};
        const pr=vid.play?.();if(pr&&pr.catch)pr.catch(()=>{vid.muted=true;set();vid.play?.().catch(()=>{});toast('🎧 Toque em 🔇 para ouvir o áudio transmitido.')});set();
      }else vid.play?.().catch(()=>{})};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))scViewClose28()};
  }
  return v;
}
function scPanel28(from,name,audio){
  let p=$('sc28');
  if(!p){p=document.createElement('section');p.id='sc28';p.className='sc28';p.setAttribute('aria-label','Tela transmitida');
    p.innerHTML=`<header class="sc28-h"><b class="sc28-t"></b><span class="sc28-btns"><button type="button" data-sca="snd" title="Ouvir o som da tela" aria-pressed="false">🔇</button><button type="button" data-sca="min" title="Minimizar">▁</button><button type="button" data-sca="full" title="Tela cheia">⛶</button><button type="button" data-sca="kill" class="sc28-kill" title="Encerrar esta transmissão">⛔</button><button type="button" data-sca="x" title="Fechar">✕</button></span></header><div class="sc28-au"><label class="sub">Volume <input type="range" class="sc28-vol" min="0" max="100" step="1" value="60" aria-label="Volume do áudio transmitido"></label></div><div class="sc28-v"><video playsinline autoplay muted></video></div>`;
    document.body.append(p);
    p.querySelector('[data-sca="snd"]').onclick=e=>{const v=p.querySelector('video');v.muted=!v.muted;e.currentTarget.textContent=v.muted?'🔇':'🔊';e.currentTarget.setAttribute('aria-pressed',!v.muted)};
    p.querySelector('.sc28-vol').oninput=e=>{const v=p.querySelector('video');v.volume=Number(e.target.value)/100;if(v.muted&&v.volume>0){v.muted=false;const b=p.querySelector('[data-sca="snd"]');b.textContent='🔊';b.setAttribute('aria-pressed','true')}};
    p.querySelector('[data-sca="min"]').onclick=e=>{
      if(p.classList.contains('aud')){const m=p.classList.toggle('mini');try{localStorage.setItem('tulpa_aud_mini',m?'1':'0')}catch(x){}e.currentTarget.textContent=m?'▢':'▁';e.currentTarget.title=m?'Expandir':'Minimizar';e.currentTarget.setAttribute('aria-label',m?'Expandir o painel de áudio':'Minimizar o painel de áudio')}
      else p.classList.toggle('min')};
    p.querySelector('[data-sca="full"]').onclick=()=>{const v=p.querySelector('.sc28-v');try{document.fullscreenElement?document.exitFullscreen():(v.requestFullscreen||v.webkitRequestFullscreen).call(v)}catch(e){}};
    p.querySelector('[data-sca="kill"]').onclick=()=>{if(SC28.view)scSend28({k:'kill',to:SC28.view.from});scViewClose28();toast('Transmissão encerrada pelo Mestre.')};
    p.querySelector('[data-sca="x"]').onclick=()=>{p.classList.add('hide');SC28.hidden=SC28.view?.from||true};
  }
  p.classList.remove('hide');SC28.hidden=null;
  p.classList.toggle('aud',!!audio);p.classList.toggle('min',!!audio);
  {let mi=true;try{mi=localStorage.getItem('tulpa_aud_mini')!=='0'}catch(x){}p.classList.toggle('mini',!!audio&&mi);
   const mb=p.querySelector('[data-sca="min"]');mb.textContent=audio&&mi?'▢':'▁';mb.title=audio&&mi?'Expandir':'Minimizar';mb.setAttribute('aria-label',audio&&mi?'Expandir o painel de áudio':'Minimizar o painel')}
  p.querySelector('.sc28-t').textContent=audio?'🎧 Áudio de '+(name||'alguém'):name==='Mestre'?'🖥️ Tela do Mestre':'🖥️ Tela de '+(name||'alguém');
  p.querySelector('[data-sca="full"]').hidden=!!audio;
  p.querySelector('.sc28-kill').hidden=!isGM6();
  return p;
}
function scViewClose28(){const v=SC28.view;if(v){try{v.pc.close()}catch(e){}}SC28.view=null;const p=$('sc28');if(p){const vid=p.querySelector('video');if(vid)vid.srcObject=null;p.remove()}if(SC28.sharer!==uid3())SC28.sharer=null;scBar28()}
/* ---------- mensagens ---------- */
function scMsg28(m){
  const me=uid3(),from=m.from;if(!from)return;
  if(m.to&&m.to!==me)return;if(m.ts&&m.ts!==SC28.sid)return;if(m.fs===SC28.sid)return;
  switch(m.k){
    case'who':if(SC28.stream&&SC28.sharer===me)scSend28({k:'start',name:SC28.sharerName,audio:SC28.audio?1:0,ts:m.fs});break;
    case'start':
      if(SC28.stream&&SC28.sharer===me){scStop28(true);toast('Outra pessoa começou a transmitir. A sua tela parou.')}
      SC28.sharer=from;SC28.sharerName=m.name||scName28(from);SC28.sharerAudio=!!m.audio;
      if(!SC28.view||SC28.view.fs!==m.fs){scViewClose28();SC28.sharer=from;SC28.sharerSid=m.fs;scSend28({k:'want',ts:m.fs})}
      scBar28();break;
    case'want':if(SC28.stream&&SC28.sharer===me&&m.fs){const old=SC28.peers.get(m.fs);if(old){try{old.pc.close()}catch(e){}SC28.peers.delete(m.fs)}scPeer28(m.fs)}break;
    case'offer':{const v=scView28(from,SC28.sharerName||scName28(from),m.fs);v.pc.setRemoteDescription(m.sdp).then(()=>v.pc.createAnswer()).then(a=>v.pc.setLocalDescription(a)).then(()=>scSend28({k:'answer',ts:m.fs,sdp:{type:v.pc.localDescription.type,sdp:v.pc.localDescription.sdp}})).then(()=>{(v.q||[]).forEach(c=>v.pc.addIceCandidate(c).catch(()=>{}));v.q=null}).catch(e=>console.warn('[T28] resposta',e));break}
    case'answer':{const p=SC28.peers.get(m.fs);if(p)p.pc.setRemoteDescription(m.sdp).catch(()=>{});break}
    case'ice':{
      if(m.dir==='s'){const p=SC28.peers.get(m.fs);if(p)p.pc.addIceCandidate(m.c).catch(()=>{})}
      else{const v=SC28.view;if(v&&v.fs===m.fs){if(v.pc.remoteDescription)v.pc.addIceCandidate(m.c).catch(()=>{});else(v.q=v.q||[]).push(m.c)}}
      break}
    case'stop':if(SC28.view?.fs===m.fs||SC28.sharerSid===m.fs){scViewClose28();SC28.sharer=null;scBar28()}break;
    case'ask':if(isGM6())scAskUi28(from,m.name||scName28(from));break;
    case'grant':if(from===vGm8()){SC28.granted=true;SC28.asking=0;scBar28();toast('✅ O Mestre permitiu. Toque em 🖥️ Começar transmissão.');try{T3.fx?.('click')}catch(e){}}break;
    case'deny':if(from===vGm8()){SC28.asking=0;SC28.granted=false;scBar28();toast('O Mestre recusou a transmissão agora.')}break;
    case'kill':if(from===vGm8()&&SC28.sharer===me){scStop28(true);toast('⛔ O Mestre encerrou a sua transmissão.')}break;
  }
}
/* ---------- botão na barra da mesa ---------- */
function scBar28(){
  const bar=$('mesaBar');if(!bar)return;
  let g=$('mbScr28');
  if(!g){g=document.createElement('div');g.id='mbScr28';g.className='mb-group mb-scr28';const after=$('mbArc26')||$('mbHand')||$('mbCall');if(after)after.after(g);else bar.append(g)}
  const me=uid3(),mine=SC28.sharer===me&&!!SC28.stream,isM=isGM6(),hid=SC28.view&&$('sc28')?.classList.contains('hide');
  const sig=[mine,isM,SC28.granted,!!SC28.asking,SC28.sharer||'',!!hid,SC28.audio,SC28.sharerAudio].join('|');if(g.dataset.sig===sig)return;g.dataset.sig=sig;
  let h='';
  if(mine)h=`<button type="button" class="btn small sc28-on" id="scBtn28">⏹ ${SC28.audio?'Parar áudio':'Parar transmissão'}</button>`;
  else if(isM||SC28.granted)h=`<button type="button" class="btn small ${SC28.granted?'primary':''}" id="scBtn28">🖥️ ${SC28.granted?'Começar transmissão':'Transmitir Tela'}</button>`;
  else h=`<button type="button" class="btn small" id="scBtn28" ${SC28.asking?'disabled':''}>🖥️ ${SC28.asking?'Esperando o Mestre…':'Transmitir Tela'}</button>`;
  if(!mine&&(isM||SC28.granted)&&scOk28())h+=`<button type="button" class="btn small" id="scAud28" title="Transmite só o som de uma aba ou janela (ex.: o YouTube) para a mesa ouvir">🎧 Só áudio</button>`;
  if(SC28.sharer&&!mine&&hid)h+=`<button type="button" class="btn small" id="scShow28">👁 ${SC28.sharerAudio?'Ver controle do áudio de':'Ver tela de'} ${esc(SC28.sharerName||'alguém')}</button>`;
  g.innerHTML=h;
  $('scBtn28').onclick=()=>mine?scStop28():scStart28();
  const au=$('scAud28');if(au)au.onclick=()=>scStart28(true);
  const sh=$('scShow28');if(sh)sh.onclick=()=>{$('sc28')?.classList.remove('hide');SC28.hidden=null;scBar28()};
}
setInterval(()=>{
  try{
    if(camp3())scJoin28();else if(SC28.ch)scLeave28();
    scBar28();
    /* quem transmite se anuncia de tempos em tempos (para quem chegou depois) */
    if(SC28.stream&&SC28.sharer===uid3()&&Date.now()-SC28.lastStart>6000){SC28.lastStart=Date.now();scSend28({k:'start',name:SC28.sharerName,audio:SC28.audio?1:0})}
  }catch(e){}
},1500);
try{M6.hooks.leave.push(()=>scLeave28())}catch(e){}
console.info('[Tulpa] Etapa 28 carregada');

