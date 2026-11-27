/* ===================================================================
   TULPA · ETAPA 8 — chamada de voz da mesa (estilo Discord)
   WebRTC em malha (cada participante fala direto com os outros).
   A sinalização usa o Realtime Broadcast do Supabase no canal
   "tulpa-voice-<campanha>" e servidores STUN públicos, sem custo.
   Só o Mestre inicia e encerra; todos entram automaticamente.
   Sussurro: o Mestre isola o áudio com um ou mais jogadores.
   =================================================================== */
const BUILD8=(()=>{try{const m=document.querySelector('meta[name="tulpa-build"]');return(m&&m.content&&m.content.trim())||'21/11 22:28'}catch(e){return'21/11 22:28'}})();
const V8={on:false,callId:'',ch:null,live:false,stream:null,peers:new Map(),muted:false,listenOnly:false,blocked:false,states:{},me:{speaking:false},vad:null,beat:null,joining:false,bad:new Set(),sid:'',dead:new Set(),vers:{}};
T3.voice=V8;
if(prefs.callVol===undefined)prefs.callVol=100;
const ICE8=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}];
/* servidores TURN (opcional): o Mestre cola o endereço de credenciais uma vez; ao iniciar a call, as credenciais vão no estado da mesa e todos usam */
const turnClean8=l=>(Array.isArray(l)?l:[]).slice(0,12).map(o=>{const u=[].concat(o&&o.urls||[]).filter(x=>typeof x==='string'&&/^(turns?|stuns?):/i.test(x)).slice(0,8);if(!u.length)return null;const r={urls:u};if(typeof o.username==='string')r.username=o.username.slice(0,200);if(typeof o.credential==='string')r.credential=o.credential.slice(0,300);return r}).filter(Boolean);
const iceServers8=()=>{const x=turnClean8(M6.state.call?.ice);return x.length?[...ICE8,...x]:ICE8};
const rtcOk8=()=>typeof RTCPeerConnection==='function';
const vGm8=()=>camp3()?.createdBy||null;
/* quem eu ouço e para quem meu microfone vai, de acordo com o sussurro */
function vAllowed8(uid){
  const w=M6.state.call?.whisper;if(!Array.isArray(w)||!w.length)return true;
  const g=new Set([...w,vGm8()]),me=uid3();
  return g.has(me)===g.has(uid);
}
function vSend8(o){try{if(V8.ch&&V8.live&&typeof V8.ch.send==='function')V8.ch.send({type:'broadcast',event:'v',payload:{...o,from:uid3(),call:V8.callId,sid:V8.sid,b:BUILD8}})}catch(e){}}
function vRoute8(){
  V8.peers.forEach(p=>{const ok=vAllowed8(p.uid);if(p.track)p.track.enabled=ok&&!V8.muted;p.audio.muted=!ok;p.audio.volume=Math.max(0,Math.min(1,(prefs.callVol??100)/100))});
}
/* oferta que ficou sem resposta (mensagem perdida): reenvia a mesma oferta */
function vResend8(){
  const now=Date.now();
  V8.peers.forEach(p=>{
    if(p.pc.signalingState!=='have-local-offer'||!p.pc.localDescription)return;
    if(now-(p.offerAt||p.made)<5000||(p.resent||0)>=3)return;
    p.resent=(p.resent||0)+1;p.offerAt=now;
    vSend8({t:'offer',to:p.uid,sdp:{type:p.pc.localDescription.type,sdp:p.pc.localDescription.sdp}});
  });
}
function vClosePeer8(uid){
  const p=V8.peers.get(uid);if(!p)return;V8.peers.delete(uid);
  clearTimeout(p.iceTimer);clearTimeout(p.wd);
  try{p.pc.onicecandidate=p.pc.ontrack=p.pc.onconnectionstatechange=null;p.pc.close()}catch(e){}
  try{p.track&&p.track.stop()}catch(e){}
  try{p.audio.srcObject=null;p.audio.remove()}catch(e){}
}
function vPeer8(uid,sid){
  let p=V8.peers.get(uid);if(p)return p;
  const pc=new RTCPeerConnection({iceServers:iceServers8()});
  const audio=document.createElement('audio');audio.autoplay=true;audio.setAttribute('playsinline','');audio.style.display='none';document.body.append(audio);
  p={uid,pc,audio,track:null,pending:[],iceOut:[],iceTimer:null,made:Date.now(),wd:null,sid:sid||'',lc:{},rc:{}};V8.peers.set(uid,p);
  /* se em 14 s não ligar, avisa na barra: quase sempre é rede restritiva e falta servidor TURN */
  p.wd=setTimeout(()=>{if(V8.peers.get(uid)===p&&pc.connectionState!=='connected'){V8.bad.add(uid);voiceBar8()}},14000);
  if(V8.stream&&V8.stream.getAudioTracks()[0]){p.track=V8.stream.getAudioTracks()[0].clone();pc.addTrack(p.track,V8.stream)}
  else{try{pc.addTransceiver('audio',{direction:'recvonly'})}catch(e){}}
  /* os candidatos de conexão saem em lotes para não estourar o limite de mensagens por segundo do Realtime */
  pc.onicecandidate=e=>{if(!e.candidate)return;{const t=(e.candidate.candidate||'').match(/ typ (\w+)/);if(t)p.lc[t[1]]=(p.lc[t[1]]||0)+1}p.iceOut.push(e.candidate.toJSON?e.candidate.toJSON():e.candidate);clearTimeout(p.iceTimer);p.iceTimer=setTimeout(()=>{const cs=p.iceOut.splice(0);if(cs.length)vSend8({t:'ice',to:uid,cs})},220)};
  pc.ontrack=e=>{audio.srcObject=e.streams&&e.streams[0]?e.streams[0]:new MediaStream([e.track]);vRoute8();const pr=audio.play();if(pr&&pr.catch)pr.catch(()=>{V8.blocked=true;voiceBar8()})};
  pc.onconnectionstatechange=()=>{
    const s=pc.connectionState;
    if(s==='connected'){V8.bad.delete(uid);clearTimeout(p.wd)}
    if(s==='disconnected'){setTimeout(()=>{if(V8.peers.get(uid)===p&&pc.connectionState==='disconnected'&&uid3()<uid){try{pc.restartIce();vOffer8(uid)}catch(e){}}},3000)}
    if(s==='failed'||s==='closed'){if(s==='failed')V8.bad.add(uid);vClosePeer8(uid);if(V8.on&&uid3()<uid)setTimeout(()=>{if(V8.on&&!V8.peers.has(uid))vOffer8(uid,(V8.states[uid]&&V8.states[uid].sid)||'')},1500)}
    voiceBar8();voicePaint8();
  };
  vRoute8();
  return p;
}
async function vOffer8(uid,sid){
  try{const p=vPeer8(uid,sid);const o=await p.pc.createOffer();await p.pc.setLocalDescription(o);p.offerAt=Date.now();vSend8({t:'offer',to:uid,sdp:{type:p.pc.localDescription.type,sdp:p.pc.localDescription.sdp}})}
  catch(e){console.warn('[T8] oferta',e)}
}
async function vSignal8(m){
  if(!V8.on||!V8.live||!m||m.from===uid3()||m.call!==V8.callId)return;
  if(m.to&&m.to!==uid3())return;
  if(m.sid&&V8.dead.has(m.sid))return; /* mensagem atrasada de uma sessão que já foi descartada */
  const from=m.from,old=V8.peers.get(from);V8.vers[from]=m.b||'antiga';
  if(old&&m.sid){
    if(!old.sid)old.sid=m.sid;
    else if(old.sid!==m.sid){
      /* a pessoa saiu e entrou de novo (o "bye" pode ter se perdido): a conexão velha não serve mais */
      if(m.t==='answer'||m.t==='ice'||m.t==='bye')return;
      V8.dead.add(old.sid);if(V8.dead.size>30)V8.dead.delete(V8.dead.values().next().value);
      vClosePeer8(from);V8.bad.delete(from);delete V8.states[from];
    }
  }
  try{
    if(m.t==='hello'||m.t==='st'){
      if(V8.gone&&V8.gone[from])delete V8.gone[from];
      if(m.t==='st'){const lt=m.speaking?Date.now():(V8.states[from]?.talkAt||0);V8.states[from]={muted:!!m.muted,speaking:!!m.speaking,at:Date.now(),sid:m.sid,talkAt:lt};voicePaint8()}
      if(!V8.peers.has(from)){if(uid3()<from)await vOffer8(from,m.sid);else if(!m.to)vSend8({t:'hello',to:from})}
      if(m.t==='hello'){V8.states[from]=V8.states[from]||{muted:false,speaking:false,at:Date.now(),sid:m.sid};voiceBar8();voicePaint8()}
    }else if(m.t==='offer'){
      let p=V8.peers.get(from);if(p&&p.pc.signalingState!=='stable'){vClosePeer8(from);p=null}
      p=p||vPeer8(from,m.sid);
      await p.pc.setRemoteDescription(m.sdp);
      for(const c of p.pending.splice(0))try{await p.pc.addIceCandidate(c)}catch(e){}
      const a=await p.pc.createAnswer();await p.pc.setLocalDescription(a);vSend8({t:'answer',to:from,sdp:{type:p.pc.localDescription.type,sdp:p.pc.localDescription.sdp}});
    }else if(m.t==='answer'){
      const p=V8.peers.get(from);if(!p)return;
      await p.pc.setRemoteDescription(m.sdp);
      for(const c of p.pending.splice(0))try{await p.pc.addIceCandidate(c)}catch(e){}
    }else if(m.t==='ice'){
      const p=V8.peers.get(from),cs=m.cs||(m.c?[m.c]:[]);if(!p||!cs.length)return;
      for(const c of cs){{const t=(c&&c.candidate||'').match(/ typ (\w+)/);if(t)p.rc[t[1]]=(p.rc[t[1]]||0)+1}if(p.pc.remoteDescription&&p.pc.remoteDescription.type){try{await p.pc.addIceCandidate(c)}catch(e){}}else p.pending.push(c)}
    }else if(m.t==='fix'){vMicSwap8('fix');
    }else if(m.t==='bye'){vClosePeer8(from);V8.bad.delete(from);delete V8.states[from];(V8.gone=V8.gone||{})[from]=1;voiceBar8();voicePaint8()}
  }catch(e){console.warn('[T8] sinal '+m.t,e)}
}
/* detecção de voz: contorno verde enquanto a pessoa fala */
function vVad8(){
  vVadStop8();if(!V8.stream)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC(),src=ctx.createMediaStreamSource(V8.stream),an=ctx.createAnalyser();
    an.fftSize=512;an.smoothingTimeConstant=.5;src.connect(an);
    const buf=new Uint8Array(an.fftSize);let last=0;
    const iv=setInterval(()=>{
      if(ctx.state==='suspended')ctx.resume().catch(()=>{});
      an.getByteTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++){const v=(buf[i]-128)/128;s+=v*v}
      const rms=Math.sqrt(s/buf.length),now=Date.now();V8.me.level=rms;if(rms>.002)V8.me.heard=now;if(rms>.035&&!V8.muted)last=now;
      const sp=!V8.muted&&now-last<380;
      if(sp!==V8.me.speaking){V8.me.speaking=sp;vSend8({t:'st',muted:V8.muted,speaking:sp});voicePaint8()}
    },90);
    V8.vad={ctx,iv};
  }catch(e){console.warn('[T8] detecção de voz',e)}
}
function vVadStop8(){if(V8.vad){clearInterval(V8.vad.iv);try{V8.vad.ctx.close()}catch(e){}V8.vad=null}}
async function vMic8(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('este navegador não libera o microfone aqui');
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
}
/* entra na call da mesa (chamado sozinho quando o Mestre inicia) */
async function voiceJoin8(id){
  if(!id||V8.callId===id||V8.joining)return;
  if(!rtcOk8()||!cloud6()||typeof sb().channel!=='function'){if(!V8.warned){V8.warned=true;toast('Este navegador não consegue entrar na chamada de voz.')}return}
  voiceLeave8(true);
  V8.joining=true;V8.callId=id;V8.sid=Math.random().toString(36).slice(2,10);V8.on=true;V8.muted=false;V8.listenOnly=false;V8.states={};
  const camp=camp3().id,gm=isGM6();
  if(!gm){fx5('start');say('📞 O Mestre iniciou a <b>call</b>. Você já está dentro: é só falar. Use 🎙 no topo da mesa para mutar.')}
  vBg8(true);voiceBar8();
  try{V8.stream=await vMic8();vMicWatch8()}
  catch(e){V8.listenOnly=true;V8.stream=null;toast('Sem acesso ao microfone: você entrou só ouvindo. Libere o microfone no navegador e toque em “Ligar microfone”.')}
  V8.joining=false;
  if(V8.callId!==id||M6.campId!==camp){vStopStream8();return}
  vVad8();
  try{
    const ch=sb().channel('tulpa-voice-'+camp,{config:{broadcast:{self:false}}});
    ch.on('broadcast',{event:'v'},({payload})=>vSignal8(payload));
    ch.subscribe(st=>{if(st==='SUBSCRIBED'&&V8.callId===id){V8.live=true;vSend8({t:'hello'});vSend8({t:'st',muted:V8.muted,speaking:false})}});
    V8.ch=ch;
  }catch(e){console.warn('[T8] canal de voz',e)}
  clearInterval(V8.beat);
  V8.beat=setInterval(()=>{if(!V8.on)return;vResend8();vSend8({t:'st',muted:V8.muted,speaking:V8.me.speaking});const now=Date.now();Object.keys(V8.states).forEach(u=>{if(now-V8.states[u].at>15000&&!V8.peers.has(u))delete V8.states[u]});voiceBar8()},4000);
  voiceBar8();voicePaint8();
}
function vStopStream8(){try{V8.stream&&V8.stream.getTracks().forEach(t=>t.stop())}catch(e){}V8.stream=null}
function voiceLeave8(silent=false){
  if(!V8.on&&!V8.ch)return;
  vSend8({t:'bye'});
  clearInterval(V8.beat);V8.beat=null;vVadStop8();
  [...V8.peers.keys()].forEach(vClosePeer8);
  vStopStream8();
  try{if(V8.ch)sb()?.removeChannel(V8.ch)}catch(e){}
  V8.bad.clear();V8.ch=null;V8.live=false;V8.on=false;V8.callId='';V8.states={};V8.gone={};V8.me.speaking=false;V8.blocked=false;V8.joining=false;vBg8(false);
  if(!silent){voiceBar8();voicePaint8()}
}
async function voiceRetryMic8(){
  try{vStopStream8();V8.stream=await vMic8();vMicWatch8();V8.listenOnly=false;vVad8();
    /* refaz as ligações já com o microfone */
    const ids=[...V8.peers.keys()];ids.forEach(vClosePeer8);vSend8({t:'bye'});setTimeout(()=>vSend8({t:'hello'}),300);toast('Microfone ligado.')}
  catch(e){toast('O navegador ainda não liberou o microfone.')}
  voiceBar8();
}
function voiceMute8(m){V8.muted=m===undefined?!V8.muted:!!m;vRoute8();if(V8.muted)V8.me.speaking=false;vSend8({t:'st',muted:V8.muted,speaking:false});voiceBar8();voicePaint8()}
/* comandos do Mestre */
async function turnFetch8(){
  const u=String(prefs.turnUrl||'').trim();if(!u)return turnClean8(M6.state.turn);
  try{if(u[0]==='['||u[0]==='{'){const j=JSON.parse(u);return turnClean8(Array.isArray(j)?j:j.iceServers)}
    if(!/^https:\/\//i.test(u))throw new Error('endereço');
    const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('http '+r.status);
    const j=await r.json();const l=turnClean8(Array.isArray(j)?j:j.iceServers);if(!l.length)throw new Error('vazio');return l}
  catch(e){console.warn('[T8] TURN',e);toast('Não consegui buscar o servidor TURN. A call vai começar sem ele.');return []}
}
function voiceStart8(){if(!isGM6())return false;if(!rtcOk8()){toast('Este navegador não tem suporte a chamadas de voz.');return false}actx();
  (async()=>{const ice=await turnFetch8();setState6({call:{on:true,id:'c'+rid(),whisper:null,ice:ice.length?ice:null}})})();return true}
function voiceEnd8(){if(!isGM6())return;setState6({call:{on:false,id:'',whisper:null}})}
function voiceWhisper8(uids){if(!isGM6()||!M6.state.call?.on)return;const w=(uids||[]).filter(Boolean);setState6({call:{...M6.state.call,whisper:w.length?w:null}})}
T3.voiceJoin=voiceJoin8;T3.voiceLeave=voiceLeave8;T3.voiceStart=voiceStart8;T3.voiceEnd=voiceEnd8;T3.voiceWhisper=voiceWhisper8;T3.voiceMute=voiceMute8;T3._vAllowed=vAllowed8;

onState6(st=>{
  const c=st.call||{};
  if(c.on&&c.id){if(V8.leftId&&V8.leftId!==c.id)V8.leftId='';if(V8.callId!==c.id&&V8.leftId!==c.id)voiceJoin8(c.id)}
  else if(V8.leftId){V8.leftId=''}
  else if(V8.on){const was=V8.on;voiceLeave8();if(was&&!isGM6())toast('O Mestre encerrou a call.')}
  const wsig=JSON.stringify(c.whisper||null);
  if(V8.on&&V8.wsig!==wsig){
    const had=V8.wsig&&V8.wsig!=='null';V8.wsig=wsig;vRoute8();
    if(!isGM6()){const w=c.whisper;if(w&&w.length){fx5('activate');say(w.includes(uid3())?'🤫 <b>Sussurro:</b> agora só você'+(w.length>1?'s':'')+' e o Mestre se ouvem. Os outros não escutam nada.':'🤫 O Mestre está em uma conversa particular. Você continua ouvindo o resto da mesa.')}else if(had)say('🔊 De volta ao áudio geral da mesa.')}
  }
  if(!V8.on)V8.wsig='null';
  voiceBar8();voicePaint8();
});
M6.hooks.leave.push(()=>{V8.leftId='';voiceLeave8()});
/* ---------- sair e entrar na call (jogador) ---------- */
function voiceQuit8(){
  const id=M6.state.call?.id;if(!id||isGM6()||!V8.on)return;
  V8.leftId=id;voiceLeave8(true);voiceBar8();voicePaint8();toast('📞 Você saiu da call. O microfone foi desligado.');
}
function voiceReenter8(){
  const c=M6.state.call;if(!c?.on||!c.id){toast('A call já foi encerrada.');return}
  V8.leftId='';voiceJoin8(c.id);voiceBar8();
}
T3.voiceQuit=voiceQuit8;T3.voiceReenter=voiceReenter8;
/* ---------- continuidade em segundo plano ----------
   Nada aqui pausa o áudio ao trocar de aba ou bloquear a tela. Media Session mostra a call
   nos controles do sistema, o wakeLock evita o aparelho dormir (se o navegador deixar) e,
   ao voltar à aba ou à rede, as conexões que caíram são refeitas. */
async function vWake8(){try{if(V8.on&&navigator.wakeLock&&document.visibilityState==='visible'&&!V8.wl){V8.wl=await navigator.wakeLock.request('screen');V8.wl.addEventListener('release',()=>{V8.wl=null})}}catch(e){V8.wl=null}}
function vResume8(){
  try{actx()}catch(e){}
  try{V8.peers.forEach(p=>{if(p.audio.srcObject&&p.audio.paused){const r=p.audio.play();if(r&&r.catch)r.catch(()=>{})}})}catch(e){}
  try{if(V8.vad&&V8.vad.ctx&&V8.vad.ctx.state==='suspended')V8.vad.ctx.resume()}catch(e){}
}
function vBg8(on){
  try{if('mediaSession' in navigator){
    if(on){
      navigator.mediaSession.metadata=new MediaMetadata({title:'Chamada de Voz — TULPA RPG',artist:'Mesa em Andamento'});
      navigator.mediaSession.playbackState='playing';
      ['play','pause'].forEach(a=>{try{navigator.mediaSession.setActionHandler(a,()=>{vResume8();try{navigator.mediaSession.playbackState='playing'}catch(e){}})}catch(e){}});
    }else{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}
  }}catch(e){}
  if(on)vWake8();else{try{V8.wl&&V8.wl.release()}catch(e){}V8.wl=null}
}
function vRecover8(){
  if(!V8.on)return;
  vResume8();vWake8();
  try{
    V8.peers.forEach((p,u)=>{
      const s=p.pc.connectionState;
      if(s==='connected')return;
      if(uid3()<u){try{p.pc.restartIce()}catch(e){}vOffer8(u,p.sid)}
    });
    vSend8({t:'hello'});
  }catch(e){console.warn('[T8] recuperar',e)}
}
T3.voiceRecover=vRecover8;
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')vRecover8()});
window.addEventListener('online',()=>setTimeout(vRecover8,600));
window.addEventListener('pageshow',()=>vRecover8());
/* som bloqueado pelo navegador (voz ou música): aviso grande e liga no primeiro toque na tela */
const audioNeed8=()=>!!((V8.on&&V8.blocked)||(YT6.blocked&&wantMusic6()?.playing));
function unlockAudio8(){
  try{actx()}catch(e){}
  V8.peers.forEach(p=>{if(p.audio.srcObject){const r=p.audio.play();if(r&&r.catch)r.catch(()=>{V8.blocked=true;voiceBar8()})}});
  V8.blocked=false;
  try{unlockMusic6()}catch(e){}
  voiceBar8();audioGateTick8();
}
function audioGateTick8(){
  if(V8.on)V8.peers.forEach(p=>{if(p.audio.srcObject&&p.audio.paused){const r=p.audio.play();if(r&&r.catch)r.catch(()=>{if(!V8.blocked){V8.blocked=true;voiceBar8()}})}});
  let g=$('audioGate');const need=audioNeed8();
  if(!need){if(g)g.classList.remove('show');return}
  if(!g){g=document.createElement('button');g.id='audioGate';g.type='button';g.textContent='🔊 Toque aqui para ligar o som da mesa';g.onclick=unlockAudio8;document.body.append(g)}
  g.classList.add('show');
}
['pointerdown','keydown','touchend'].forEach(ev=>document.addEventListener(ev,()=>{if(audioNeed8())unlockAudio8()},{capture:true,passive:true}));
setInterval(audioGateTick8,1200);
window.addEventListener('pagehide',()=>{try{vSend8({t:'bye'})}catch(e){}});

/* ---------- barra da call ---------- */
/* quem não conectou: calculado na hora (não fica aviso velho depois que a conexão sobe) */
function vBad8(){const s=new Set(V8.bad),now=Date.now();V8.peers.forEach((p,u)=>{if(p.pc.connectionState==='connected')s.delete(u);else if(now-p.made>14000)s.add(u)});return [...s]}
function vCount8(){const s=new Set(Object.keys(V8.states));V8.peers.forEach((p,u)=>s.add(u));return s.size+1}
function voiceBar8(){
  const box=$('mbCall');if(!box)return;
  const isM=isGM6(),c=M6.state.call||{},w=Array.isArray(c.whisper)&&c.whisper.length?c.whisper:null,names=w?w.map(u=>nm(charOfUser6(u))||'jogador').join(', '):'';
  const gmU=vGm8(),badN=vBad8().map(u=>u===gmU?'Mestre':(nm(charOfUser6(u))||'jogador')).join(', '),hasTurn=!!(c.ice&&c.ice.length),cfgTurn=!!String(prefs.turnUrl||'').trim()||turnClean8(M6.state.turn).length>0;
  const outCall=!!(c.on&&!isM&&!V8.on&&V8.leftId&&V8.leftId===c.id);
  const sig=[outCall,isM,c.on,V8.on,V8.muted,V8.listenOnly,V8.blocked,V8.joining,vCount8(),names,w&&w.includes(uid3()),badN,hasTurn,cfgTurn].join('|');
  if(box.dataset.sig===sig)return;box.dataset.sig=sig;
  if(!c.on){box.innerHTML=isM?'<button type="button" class="btn small primary" id="vcStart">📞 Iniciar call</button><button type="button" class="btn small '+(cfgTurn?'':'warn')+'" id="vcTurn" title="Ajuda a voz a conectar em redes difíceis (4G, Wi-Fi de empresa)">🌐 Servidor TURN'+(cfgTurn?' ✓':'')+'</button><span class="sub">Todos na mesa entram na hora.</span>':'<span class="sub vc-off">📞 Sem call no momento</span>';const s=$('vcStart');if(s)s.onclick=voiceStart8;const tb=$('vcTurn');if(tb)tb.onclick=vTurnModal8;return}
  if(outCall){box.innerHTML='<span class="sub vc-off">🎧 Você está fora da call</span><button type="button" class="btn small vc-enter" id="vcEnter">📞 Entrar na Call</button>';const e=$('vcEnter');if(e)e.onclick=voiceReenter8;return}
  box.innerHTML=`<span class="vc-live"><i></i>${V8.joining?'Entrando na call…':`Na call · ${vCount8()}`}</span>
   ${V8.listenOnly?'<button type="button" class="btn small primary" id="vcMic">🎙 Ligar microfone</button>':`<button type="button" class="btn small ${V8.muted?'danger':''}" id="vcMute" aria-pressed="${V8.muted}">${V8.muted?'🔇 Mudo':'🎙 Microfone'}</button>`}
   <label class="mb-vol vc-vol" title="Volume das vozes (só para você)"><span aria-hidden="true">🗣</span><input type="range" id="vcVol" min="0" max="100" step="1" value="${prefs.callVol??100}" aria-label="Volume das vozes"></label>
   ${V8.blocked?'<button type="button" class="btn small primary" id="vcUnlock">▶ Ativar áudio</button>':''}
   ${isM?`<button type="button" class="btn small ${w?'primary':''}" id="vcWhisper">🤫 Sussurro</button>${w?'<button type="button" class="btn small" id="vcAll">↩ Áudio geral</button>':''}<button type="button" class="btn small danger" id="vcEnd">Encerrar call</button>`:''}
   ${!isM&&V8.on?'<button type="button" class="btn small vc-quit" id="vcQuit">📞 Sair da Call</button>':''}
   <button type="button" class="btn small" id="vcDiag" title="Ver como está a conexão de voz" aria-label="Diagnóstico da voz">🔎</button>
   ${isM?`<button type="button" class="btn small ${hasTurn?'':'warn'}" id="vcTurn" title="Servidor TURN">🌐 TURN${hasTurn?' ✓':''}</button>`:''}
   ${badN?`<span class="vc-warn" role="status">⚠ A voz não conectou com ${esc(badN)}. ${isM?'Provável rede restrita: configure o servidor TURN (🌐) e reinicie a call.':'Avise o Mestre: pode faltar um servidor TURN.'}</span>`:''}
   ${w?`<span class="vc-whisper">${isM?'Falando só com '+esc(names):w.includes(uid3())?'🤫 Conversa particular com o Mestre':'🤫 O Mestre está em conversa particular'}</span>`:''}`;
  const on=(id,f)=>{const e=$(id);if(e)e.onclick=f};
  on('vcMute',()=>voiceMute8());on('vcMic',voiceRetryMic8);on('vcEnd',()=>{if(confirm('Encerrar a call para todos?'))voiceEnd8()});on('vcAll',()=>voiceWhisper8([]));
  on('vcUnlock',()=>unlockAudio8());on('vcQuit',voiceQuit8);
  on('vcWhisper',vWhisperModal8);on('vcTurn',vTurnModal8);on('vcDiag',vDiagModal8);
  const v=$('vcVol');if(v)v.oninput=()=>{prefs.callVol=Number(v.value)||0;savePrefs();vRoute8()};
}
/* ---------- recuperação da voz ----------
   1) Meu microfone parou (aparelho trocado, fone Bluetooth, outro programa pegou o mic,
      o sistema cortou): pego o microfone de novo e troco a trilha em todas as conexões
      com replaceTrack, sem derrubar a call.
   2) Quem ouve percebe: a pessoa diz que está falando (detecção de voz dela) e aqui não
      chega som. Primeiro reinicia o som local; depois pede para ela trocar o microfone;
      por fim refaz a conexão com ela. */
function vMicWatch8(){
  const t=V8.stream&&V8.stream.getAudioTracks()[0];if(!t||t._w8)return;t._w8=1;
  t.addEventListener('ended',()=>{if(V8.on&&V8.stream&&V8.stream.getAudioTracks()[0]===t)vMicSwap8('ended')});
  t.addEventListener('mute',()=>{clearTimeout(V8.muteT);V8.muteT=setTimeout(()=>{if(V8.on&&t.muted&&V8.stream&&V8.stream.getAudioTracks()[0]===t)vMicSwap8('mute')},2500)});
}
function vSenderOf8(p){
  const ss=p.pc.getSenders?p.pc.getSenders():[];
  return ss.find(x=>x.track&&x.track===p.track)||ss.find(x=>x.track&&x.track.kind==='audio')||(p.pc.getTransceivers?p.pc.getTransceivers().find(x=>x.receiver&&x.receiver.track&&x.receiver.track.kind==='audio')?.sender:null)||null;
}
async function vMicSwap8(why){
  if(!V8.on||V8.listenOnly||V8.swapping)return false;
  if(why!=='manual'&&Date.now()-(V8.swapFail||0)<20000)return false;
  V8.swapping=true;let ok=false;
  try{
    const ns=await vMic8(),nt=ns.getAudioTracks()[0];if(!nt)throw new Error('sem trilha');
    const old=V8.stream;V8.stream=ns;vMicWatch8();
    const rebuild=[];
    for(const [u,p] of V8.peers){
      const snd=vSenderOf8(p),cl=nt.clone();
      if(snd&&p.track){try{await snd.replaceTrack(cl);try{p.track.stop()}catch(e){}p.track=cl;continue}catch(e){}}
      try{cl.stop()}catch(e){}rebuild.push(u);
    }
    try{old&&old.getTracks().forEach(t=>t.stop())}catch(e){}
    vRoute8();vVad8();ok=true;V8.swaps=(V8.swaps||0)+1;
    rebuild.forEach(u=>vRebuild8(u));
    if(why!=='device')toast('🎙 Microfone reconectado.');
  }catch(e){V8.swapFail=Date.now();console.warn('[T8] trocar microfone',e);if(why!=='device')toast('Não consegui pegar o microfone de novo. Confira se outro programa está usando e toque em 🔎 → Reconectar meu microfone.')}
  V8.swapping=false;voiceBar8();return ok;
}
T3.voiceMicSwap=vMicSwap8;
/* refaz só a conexão com uma pessoa */
function vRebuild8(u){
  if(!V8.on)return;vClosePeer8(u);V8.bad.delete(u);vSend8({t:'bye',to:u});
  setTimeout(()=>vSend8({t:'hello'}),400);
}
T3.voiceRebuild=vRebuild8;
/* reinicia o som que chega de uma pessoa (o elemento de áudio pode travar) */
function vReplay8(p){
  try{const tr=p.pc.getReceivers().map(r=>r.track).filter(t=>t&&t.kind==='audio'&&t.readyState==='live');
    p.audio.pause();p.audio.srcObject=tr.length?new MediaStream(tr):p.audio.srcObject;vRoute8();
    const r=p.audio.play();if(r&&r.catch)r.catch(()=>{V8.blocked=true;voiceBar8()})}catch(e){}
}
async function vStats8(p){
  const o={pin:0,pout:0,ein:null,lin:null,lout:null,route:'?'};
  try{const st=await p.pc.getStats(),by={};let sel=null;
    st.forEach(x=>{by[x.id]=x;
      if(x.type==='inbound-rtp'&&x.kind==='audio'){o.pin=x.packetsReceived||0;if(x.totalAudioEnergy!=null)o.ein=x.totalAudioEnergy;if(x.audioLevel!=null)o.lin=x.audioLevel}
      if(x.type==='outbound-rtp'&&x.kind==='audio')o.pout=x.packetsSent||0;
      if(x.type==='media-source'&&x.kind==='audio'&&x.audioLevel!=null)o.lout=x.audioLevel;
      if(x.type==='candidate-pair'&&x.nominated&&x.state==='succeeded')sel=x});
    if(sel){const l=by[sel.localCandidateId],r=by[sel.remoteCandidateId];o.route=[l&&l.candidateType,r&&r.candidateType].map(x=>x==='relay'?'servidor TURN':x==='srflx'?'direto (STUN)':x==='host'?'rede local':x||'?').join(' ↔ ')}}catch(e){}
  return o;
}
/* vigia a cada 3 s */
setInterval(async()=>{
  if(!V8.on)return;
  /* meu microfone: trilha encerrada ou cortada pelo sistema */
  const t=V8.stream&&V8.stream.getAudioTracks()[0];
  if(t&&!V8.listenOnly&&!V8.swapping&&(t.readyState==='ended'||(t.muted&&Date.now()-(V8.mutedSince||(V8.mutedSince=Date.now()))>3000)))vMicSwap8(t.readyState==='ended'?'ended':'mute');
  if(t&&!t.muted)V8.mutedSince=0;
  for(const [u,p] of V8.peers){
    if(p.pc.connectionState!=='connected')continue;
    const s=await vStats8(p),st=V8.states[u]||{},talk=(!!st.speaking||Date.now()-(st.talkAt||0)<3500)&&!st.muted&&Date.now()-(st.at||0)<6000&&vAllowed8(u)&&!p.audio.muted;
    const prev=p.last8||s;p.last8=s;
    const silent=s.ein!=null?(s.ein-(prev.ein||0))<1e-7:(s.lin||0)<.0005;
    const noPk=s.pin<=prev.pin;
    if(talk&&(silent||noPk)){p.dumb=(p.dumb||0)+1;
      if(p.dumb===2)vReplay8(p);
      else if(p.dumb===4)vSend8({t:'fix',to:u});
      else if(p.dumb===7){p.dumb=0;vRebuild8(u);console.warn('[T8] sem som de '+u+': refazendo a conexão')}
    }else if(!silent)p.dumb=0;
  }
},3000);
let devT8=0;
try{navigator.mediaDevices?.addEventListener?.('devicechange',()=>{clearTimeout(devT8);devT8=setTimeout(()=>{if(V8.on&&V8.stream&&!V8.listenOnly)vMicSwap8('device')},1500)})}catch(e){}

/* diagnóstico: mostra por onde a voz está passando, se os pacotes chegam e se tem som de verdade */
async function vDiagModal8(){
  const rows=[],lv=v=>v==null?'?':v<.002?'silêncio':v<.02?'baixo':'com som';
  const list=[...V8.peers],A=await Promise.all(list.map(([u,p])=>vStats8(p)));
  await new Promise(r=>setTimeout(r,400));const B=await Promise.all(list.map(([u,p])=>vStats8(p)));
  for(let i=0;i<list.length;i++){
    const [u,p]=list[i],a=A[i],b=B[i];
    const nome=u===vGm8()?'Mestre':(nm(charOfUser6(u))||'jogador');
    const cnt=o=>['host','srflx','relay'].map(k=>k+' '+(o[k]||0)).join(', '),ver=V8.vers[u]||'?',igual=ver===BUILD8;
    const inE=a.ein!=null&&b.ein!=null?(b.ein-a.ein)/.4:null,st=V8.states[u]||{};
    const chega=b.pin>a.pin?(inE!=null?(inE>1e-6?'🔊 chegando com som':'🔇 chegando em silêncio'):'chegando'):'⚠ parado';
    rows.push(`<li><b>${esc(nome)}</b>: ${p.pc.connectionState==='connected'?'✅ conectado':'⚠ '+esc(p.pc.connectionState)}${st.muted?' · 🔇 está mudo':st.speaking?' · 🗣 falando agora':''}<br><span class="sub">Versão do site dele: ${esc(ver)}${igual?'':' ⚠ diferente da sua ('+BUILD8+'): peça para recarregar com Ctrl+F5'} · caminhos meus: ${cnt(p.lc)} · caminhos dele: ${cnt(p.rc)}${p.rc.relay?'':' (sem servidor TURN do lado dele)'}<br>Rota: ${esc(a.route)} · recebendo ${b.pin} pacotes (${chega}) · enviando ${b.pout} pacotes${b.pout>a.pout?'':' ⚠ parado'} · ${p.audio.paused?'🔇 som parado neste aparelho (toque na tela)':'🔊 som tocando'}${p.track&&!p.track.enabled?' · seu microfone está cortado para essa pessoa':''}</span><span class="vc-fix"><button type="button" class="btn small" data-vre="${esc(u)}">🔊 Reiniciar o som dela aqui</button><button type="button" class="btn small" data-vrb="${esc(u)}">↻ Refazer conexão</button></span></li>`);
  }
  const t=V8.stream&&V8.stream.getAudioTracks()[0];
  const mt=!t?'':t.readyState==='ended'?' · ⚠ o microfone foi desligado pelo aparelho':t.muted?' · ⚠ o sistema está cortando o microfone':'';
  const mic=V8.listenOnly?'sem acesso ao microfone':V8.muted?'mudo':V8.stream?'ligado':'desligado';
  const ago=V8.me.heard?Math.round((Date.now()-V8.me.heard)/1000):null;
  const cap=!t||V8.listenOnly?'':` · captando agora: <b>${lv(V8.me.level)}</b>${ago!=null&&ago>20?` (último som há ${ago} s)`:''}`;
  openModal('CALL','Diagnóstico da voz',`<p class="sub">Meu microfone: <b>${mic}</b>${mt}${cap}${t&&t.label?` · aparelho: ${esc(t.label.slice(0,60))}`:''} · servidor TURN na campanha: <b>${turnClean8(M6.state.call?.ice).length?'sim':'não'}</b></p>${!V8.listenOnly&&V8.stream?'<p><button type="button" class="btn small primary" id="vcMicSwap">🎙 Reconectar meu microfone</button></p>':''}${rows.length?`<ul class="vc-diag">${rows.join('')}</ul>`:'<p class="sub">Ninguém conectado ainda.</p>'}<p class="sub">Se “captando agora” fica em silêncio enquanto você fala, o seu microfone parou: use <b>Reconectar meu microfone</b> ou confira o microfone escolhido no sistema. Se aparecer “chegando em silêncio” enquanto a outra pessoa fala, o microfone dela é que parou: peça para ela abrir este 🔎 e reconectar. “Refazer conexão” liga de novo só com aquela pessoa, sem derrubar a call.</p>`,'Fechar',()=>closeModal());
  const ms=$('vcMicSwap');if(ms)ms.onclick=async()=>{ms.disabled=true;ms.textContent='Reconectando…';await vMicSwap8('manual');closeModal();vDiagModal8()};
  $$('[data-vre]').forEach(x=>x.onclick=()=>{const p=V8.peers.get(x.dataset.vre);if(p)vReplay8(p);toast('Som reiniciado.')});
  $$('[data-vrb]').forEach(x=>x.onclick=()=>{vRebuild8(x.dataset.vrb);closeModal();toast('Refazendo a conexão. Leva uns segundos.')});
}
function vTurnModal8(){
  if(!isGM6())return;
  openModal('CALL','Servidor TURN',`<p class="sub">Sem TURN, a voz só liga quando as redes dos jogadores permitem conexão direta. Em 4G, Wi-Fi de empresa ou alguns roteadores, isso falha e ninguém se ouve. O TURN faz a ponte e resolve.</p>
  <ol class="sub" style="margin:8px 0 10px 18px;line-height:1.5"><li>Crie uma conta gratuita em <b>metered.ca</b> (Open Relay, 20 GB por mês).</li><li>No painel, abra <b>TURN Server</b> e copie o endereço de credenciais (termina com <code>/api/v1/turn/credentials?apiKey=…</code>).</li><li>Cole abaixo e salve. Pode ser esse endereço ou a lista <code>iceServers</code> (JSON) do painel do Metered.</li></ol>
  <p class="sub">${turnClean8(M6.state.turn).length?'✓ Já há um servidor TURN salvo nesta campanha. Cole outro para trocar, ou deixe vazio e salve para remover.':prefs.turnUrl?'✓ Há um endereço salvo neste navegador. Cole outro para trocar, ou deixe vazio e salve para remover.':'Nenhum servidor TURN salvo ainda.'}</p><label class="sub" for="turnUrl">Endereço de credenciais ou lista iceServers</label><input id="turnUrl" type="text" autocomplete="off" spellcheck="false" placeholder="https://seuapp.metered.live/api/v1/turn/credentials?apiKey=…" value="" style="width:100%">`,
  'Salvar',()=>{
    const v=($('turnUrl').value||'').trim(),had=!!(prefs.turnUrl||turnClean8(M6.state.turn).length);
    if(!v&&!had){closeModal();return}
    if(v&&(v[0]==='['||v[0]==='{')){let l=[];try{const j=JSON.parse(v);l=turnClean8(Array.isArray(j)?j:j.iceServers)}catch(e){}
      if(!l.length){toast('Não entendi essa lista. Cole o iceServers do Metered ou o endereço de credenciais.');return}
      prefs.turnUrl='';savePrefs();setState6({turn:l})}
    else if(v){if(!/^https:\/\//i.test(v)){toast('O endereço precisa começar com https://');return}prefs.turnUrl=v;savePrefs();setState6({turn:null})}
    else{prefs.turnUrl='';savePrefs();setState6({turn:null})}
    closeModal();toast(v?'Servidor TURN salvo. Ele entra na próxima call que você iniciar.':'Servidor TURN removido.');voiceBar8()});
}
function vWhisperModal8(){
  const players=seats6().players,cur=new Set(M6.state.call?.whisper||[]);
  openModal('SUSSURRO','Falar em particular',`<p class="sub">Marque quem vai ouvir e falar com você. O áudio fica isolado: os outros jogadores não escutam nada dessa conversa e continuam se ouvindo entre si.</p><div class="sd-players">${players.length?players.map(s=>`<label class="t3-check"><input type="checkbox" value="${s.uid}" ${cur.has(s.uid)?'checked':''}> ${esc(nm(s.ch))}${V8.states[s.uid]||V8.peers.has(s.uid)?'':' <span class="sub">(fora da call)</span>'}</label>`).join(''):'<span class="sub">Nenhum jogador na campanha.</span>'}</div>`,'Começar sussurro',()=>{const ids=$$('#modalBody .sd-players input:checked').map(i=>i.value);closeModal();voiceWhisper8(ids);if(!ids.length)toast('Áudio geral da mesa.')});
}
/* contorno verde em quem fala; microfone cortado em quem está mudo */
function voicePaint8(){
  const me=uid3(),gm=vGm8(),c=M6.state.call||{},w=Array.isArray(c.whisper)&&c.whisper.length?new Set([...c.whisper,gm]):null;
  const st=u=>u===me?{muted:V8.muted,speaking:V8.me.speaking,inCall:V8.on}:{...(V8.states[u]||{}),inCall:V8.on&&(!!V8.states[u]||V8.peers.has(u))};
  $$('#tableCharacters .table-char.seat').forEach(card=>{
    const u=card.dataset.uid,s=st(u),av=card.querySelector('.tc-head .av');
    if(av){av.classList.toggle('speaking',!!(s.inCall&&s.speaking&&vAllowed8(u)));av.classList.toggle('muted',!!(s.inCall&&s.muted))}
    const out=c.on&&(u===me?(!isGM6()&&!V8.on&&!!V8.leftId):(V8.on&&!!(V8.gone&&V8.gone[u])&&!s.inCall));
    card.classList.toggle('out-call',!!out);
    card.classList.toggle('in-call',!!s.inCall);card.classList.toggle('whisper',!!(w&&w.has(u)&&(isGM6()||w.has(me))));
  });
  const mav=$q('#mAv .av');if(mav){const s=st(gm);mav.classList.toggle('speaking',!!(s.inCall&&s.speaking&&vAllowed8(gm)));mav.classList.toggle('muted',!!(s.inCall&&s.muted))}
  $('mesaM')?.classList.toggle('in-call',!!st(gm).inCall);
}
/* versão nova no ar: força a atualização (o navegador pode guardar a página antiga por alguns minutos).
   A versão = texto do <meta tulpa-build> + o token ?v= do js/61-init.js; qualquer mudança dispara. */
const verKey8=t=>{const m=t.match(/<meta\s+name="tulpa-build"\s+content="([^"]*)"/),v=t.match(/js\/61-init\.js\?v=([\w.-]+)/);return m?((m[1]||'').trim()+'|'+(v?v[1]:'')):''};
const localVer8=()=>{try{const sc=document.querySelector('script[src*="61-init.js"]'),v=sc&&(sc.getAttribute('src').match(/\?v=([\w.-]+)/)||[])[1];return BUILD8+'|'+(v||'')}catch(e){return BUILD8+'|'}};
function updateBanner8(remoteKey){
  if($('updBanner')||$('updOverlay'))return;
  /* trava contra laço: no máximo 2 tentativas por versão nova */
  let n=0;try{n=Number(sessionStorage.getItem('tulpa_upd_'+remoteKey)||0)}catch(e){}
  const go=()=>{try{sessionStorage.setItem('tulpa_upd_'+remoteKey,String(n+1))}catch(e){}
    try{if(typeof flushState6==='function'&&isGM6())flushState6()}catch(e){}
    try{const u=new URL(location.href);u.searchParams.set('u',Date.now().toString(36));location.replace(u.toString())}catch(e){location.reload()}};
  if(n>=2){const b=document.createElement('button');b.id='updBanner';b.type='button';b.textContent='🔄 Há uma versão nova do site. Toque aqui para atualizar.';b.onclick=go;document.body.append(b);return}
  const o=document.createElement('div');o.id='updOverlay';o.setAttribute('role','alertdialog');o.setAttribute('aria-live','assertive');
  o.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(8,6,10,.82);padding:16px';
  o.innerHTML='<div style="max-width:360px;width:100%;background:var(--panel,#171e28);color:var(--text,#edf2f7);border:1px solid var(--line,#2c3645);border-radius:12px;padding:24px;text-align:center"><h3 style="margin:0 0 8px">🔄 Versão nova do site</h3><p style="margin:0 0 16px">Atualizando em <b id="updCnt">8</b> s para você jogar com a versão certa.</p><button type="button" class="btn primary" id="updNow" style="min-height:44px">Atualizar agora</button></div>';
  document.body.append(o);let c=8;const t=setInterval(()=>{c--;const e=$('updCnt');if(e)e.textContent=String(Math.max(0,c));if(c<=0){clearInterval(t);go()}},1000);
  $('updNow').onclick=()=>{clearInterval(t);go()};
}
async function updateCheck8(){
  if(!/^https?:$/.test(location.protocol)||BUILD8.indexOf('__')===0)return;
  try{const r=await fetch(location.pathname,{cache:'reload'});if(!r.ok)return;const k=verKey8(await r.text());if(k&&k!==localVer8())updateBanner8(k)}catch(e){}
}
setTimeout(updateCheck8,10000);setInterval(updateCheck8,60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateCheck8()});
window.addEventListener('online',()=>setTimeout(updateCheck8,1000));
T3.build=BUILD8;
T3.voiceBar=voiceBar8;T3.voicePaint=voicePaint8;
M6.hooks.layout.push(()=>voicePaint8());
{const _lm8=layoutMesa6;layoutMesa6=function(){_lm8.apply(this,arguments);try{voicePaint8()}catch(e){}};T3.mesaLayout=layoutMesa6}


/* ===================================================================
   TULPA · ETAPA 9 — chat da mesa
   Mensagens para todos ou em particular (Mestre, ou outro jogador).
   Vai pelo canal ao vivo da mesa (sem tabela nova). Cada pessoa guarda
   as últimas mensagens no próprio navegador; quem entra depois recebe o
   histórico do Mestre, se ele estiver na mesa.
   =================================================================== */
const CH9={list:[],ids:new Set(),unread:0,asked:false,last:0,campId:null,draft:'',to:''};
const CHMAX9=150,CHTXT9=600;
const chKey9=()=>'tulpa_chat_'+(camp3()?.id||'x')+'_'+(uid3()||'x');
function chLoad9(){
  const id=camp3()?.id||null;if(CH9.campId===id)return;
  CH9.campId=id;CH9.list=[];CH9.ids=new Set();CH9.unread=0;CH9.asked=false;
  if(!id)return;
  const l=lsGet6(chKey9(),[]);if(Array.isArray(l))l.forEach(m=>chAdd9(m,true));
}
function chSave9(){try{lsSet6(chKey9(),CH9.list.slice(-CHMAX9))}catch(e){}}
function chName9(uid,fallback){
  if(uid&&uid===(camp3()?.createdBy))return 'Mestre';
  const c=uid?charOfUser6(uid):null;return(c&&nm(c))||fallback||'Jogador';
}
function chValid9(m){
  return m&&typeof m==='object'&&typeof m.id==='string'&&m.id.length<=40&&typeof m.text==='string'&&m.text.trim()&&typeof m.from==='string'
    &&(m.to==null||(Array.isArray(m.to)&&m.to.length<=8&&m.to.every(x=>typeof x==='string')));
}
const chVisible9=m=>{const me=uid3();return m.to==null||m.from===me||(m.to||[]).includes(me)};
function chAdd9(m,quiet){
  if(!chValid9(m)||CH9.ids.has(m.id)||!chVisible9(m))return false;
  const x={id:m.id,t:Number(m.t)||Date.now(),from:m.from,n:String(m.n||'').slice(0,40),to:m.to==null?null:m.to.slice(0,8),text:String(m.text).slice(0,CHTXT9)};
  CH9.ids.add(x.id);CH9.list.push(x);
  if(CH9.list.length>CHMAX9*2){const cut=CH9.list.splice(0,CH9.list.length-CHMAX9);cut.forEach(c=>CH9.ids.delete(c.id))}
  if(!quiet)CH9.list.sort((a,b)=>a.t-b.t);
  return true;
}
/* destinos possíveis */
function chTargets9(){
  const me=uid3(),gm=camp3()?.createdBy,out=[{v:'',l:'Todos'}];
  if(gm&&gm!==me)out.push({v:gm,l:'Mestre (particular)'});
  seats6().players.forEach(s=>{if(s.uid&&s.uid!==me)out.push({v:s.uid,l:nm(s.ch)+' (particular)'})});
  return out;
}
function chSend9(text,to){
  text=String(text||'').trim().slice(0,CHTXT9);if(!text)return false;
  if(!M6.live){toast('A mesa está sem conexão ao vivo: a mensagem não sairia.');return false}
  const now=Date.now();if(now-CH9.last<350)return false;CH9.last=now;
  const me=uid3(),m={id:'m'+rid(),t:now,from:me,n:chName9(me),to:to?[to]:null,text};
  chAdd9(m);chSave9();cast6({t:'chat',m});
  CH9.unread=0;renderChat9(true);chBadge9();
  return true;
}
T3.chat={send:chSend9,list:()=>CH9.list.slice(),unread:()=>CH9.unread};
/* recebimento */
onCast6(p=>{
  if(p.t==='chat'){
    chLoad9();
    const m=p.m;if(!m||m.from!==p.from)return; /* a origem tem de ser quem mandou */
    if(!chAdd9(m))return;
    chSave9();
    if(M6.tab==='chat'&&!document.hidden){renderChat9()}
    else{CH9.unread++;chBadge9();try{fx5('click')}catch(e){}
      toast('💬 '+chName9(m.from,m.n)+(m.to?' (particular)':'')+': '+String(m.text).slice(0,70)+(m.text.length>70?'…':''))}
    return}
  if(p.t==='chat?'&&isGM6()&&p.from&&p.from!==uid3()){
    chLoad9();const to=p.from;
    const msgs=CH9.list.filter(m=>m.to==null||m.to.includes(to)||m.from===to).slice(-80);
    if(msgs.length)cast6({t:'chath',to,msgs});return}
  if(p.t==='chath'&&p.to===uid3()&&Array.isArray(p.msgs)){
    chLoad9();let n=0;p.msgs.slice(-80).forEach(m=>{if(chAdd9(m,true))n++});
    if(n){CH9.list.sort((a,b)=>a.t-b.t);chSave9();if(M6.tab==='chat')renderChat9()}return}
  if(p.t==='chatclear'&&p.from===camp3()?.createdBy){CH9.list=[];CH9.ids=new Set();CH9.unread=0;chSave9();chBadge9();if(M6.tab==='chat')renderChat9()}
});
/* quem entra pede o histórico ao Mestre (uma vez por entrada) */
M6.hooks.layout.push(()=>{
  chLoad9();
  if(!CH9.asked&&M6.live&&!isGM6()&&camp3()?.createdBy&&M6.present&&M6.present[camp3().createdBy]){CH9.asked=true;cast6({t:'chat?'})}
  chBadge9();
});
M6.hooks.leave.push(()=>{CH9.campId=null});
function chBadge9(){
  const b=$q('#mesaDock [data-dock="chat"]');if(!b)return;
  let s=b.querySelector('.dock-badge');
  if(CH9.unread>0){if(!s){s=document.createElement('span');s.className='dock-badge';b.append(s)}s.textContent=CH9.unread>9?'9+':String(CH9.unread)}
  else if(s)s.remove();
}
const chTime9=t=>{try{return new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){return''}};
function renderChat9(forceBottom){
  const box=$('mesaChat');if(!box)return;chLoad9();
  if(M6.tab==='chat'){CH9.unread=0;chBadge9()}
  const me=uid3(),isM=isGM6();
  if(!box.firstChild){
    box.innerHTML=`<div class="chat-list" id="chatList" role="log" aria-live="polite" aria-label="Mensagens da mesa"></div>
    <form class="chat-form" id="chatForm" autocomplete="off"><label class="chat-to"><span>Para</span><select id="chatTo" aria-label="Destinatário"></select></label><textarea id="chatText" rows="1" maxlength="${CHTXT9}" placeholder="Escreva uma mensagem…" aria-label="Mensagem"></textarea><button class="btn primary" id="chatSend">Enviar</button></form>
    <div class="chat-foot"><span class="sub" id="chatNote"></span>${isM?'<button type="button" class="btn small" id="chatClear">🧹 Limpar para todos</button>':''}</div>`;
    const f=$('chatForm'),ta=$('chatText');
    f.onsubmit=e=>{e.preventDefault();if(chSend9(ta.value,$('chatTo').value)){ta.value='';CH9.draft='';ta.style.height=''}ta.focus()};
    ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();f.requestSubmit()}});
    ta.addEventListener('input',()=>{CH9.draft=ta.value;ta.style.height='auto';ta.style.height=Math.min(120,ta.scrollHeight)+'px'});
    $('chatTo').onchange=()=>{CH9.to=$('chatTo').value};
    const cl=$('chatClear');if(cl)cl.onclick=()=>{if(confirm('Apagar o chat para todos na mesa?')){CH9.list=[];CH9.ids=new Set();chSave9();cast6({t:'chatclear'});renderChat9()}};
  }
  /* destinatários: atualiza sem perder a escolha */
  const sel=$('chatTo'),tg=chTargets9(),sig=tg.map(x=>x.v).join('|');
  if(sel.dataset.sig!==sig){sel.dataset.sig=sig;sel.innerHTML=tg.map(x=>`<option value="${esc(x.v)}">${esc(x.l)}</option>`).join('');}
  if(tg.some(x=>x.v===CH9.to))sel.value=CH9.to;else{CH9.to='';sel.value=''}
  const ta=$('chatText');if(ta&&ta.value!==CH9.draft&&document.activeElement!==ta)ta.value=CH9.draft;
  const live=!!M6.live;$('chatSend').disabled=!live;$('chatNote').textContent=live?'Enter envia · Shift+Enter quebra a linha. Mensagens particulares só aparecem para quem participa delas.':'Sem conexão ao vivo com a mesa. Tente recarregar a página.';
  /* lista */
  const list=$('chatList'),near=list.scrollHeight-list.scrollTop-list.clientHeight<80;
  const sig2=CH9.list.length+':'+(CH9.list[CH9.list.length-1]?.id||'');
  if(list.dataset.sig!==sig2||forceBottom){
    list.dataset.sig=sig2;
    list.innerHTML=CH9.list.length?CH9.list.map(m=>{
      const mine=m.from===me,who=mine?'Você':chName9(m.from,m.n),priv=m.to!=null;
      const dest=priv?(mine?' → '+(m.to.map(u=>chName9(u)).join(', ')):' → você'):'';
      return `<div class="chat-msg ${mine?'me':''} ${priv?'priv':''} ${m.from===camp3()?.createdBy?'gm':''}"><div class="chat-meta"><b>${esc(who)}</b>${priv?`<span class="chat-tag">🤫 particular${esc(dest)}</span>`:''}<time>${chTime9(m.t)}</time></div><div class="chat-text">${esc(m.text)}</div></div>`}).join(''):'<p class="sub chat-empty">Ninguém falou ainda. Escreva a primeira mensagem.</p>';
    if(near||forceBottom||CH9.list[CH9.list.length-1]?.from===me)list.scrollTop=list.scrollHeight;
  }
}
T3.renderChat=renderChat9;
{const _l9=layoutMesa6;layoutMesa6=function(){_l9.apply(this,arguments);try{if(M6.tab==='chat')renderChat9();else chBadge9()}catch(e){}};T3.mesaLayout=layoutMesa6}


