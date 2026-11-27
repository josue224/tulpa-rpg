/* ===================================================================
   TULPA · Mini-games de intervalo (inspirados no Pou)
   Abrem pelo overlay do ⏸ Intervalo e fecham sozinhos quando o Mestre
   retoma a sessão. Até 6 jogadores por sala, cada um com um Perseus de
   uma cor; a IA usa o Perseus original. Rede: canal próprio
   'tulpa-minigames-<campanha>' com broadcast (sem gravar nada no banco).
   Modelo de rede:
   - Volley, Coleta, Jogo da Velha: o anfitrião simula e manda o estado;
     os outros mandam só os comandos.
   - Voo e Salto: cada um joga no próprio aparelho com a mesma semente;
     a posição vai pela rede e os outros aparecem como fantasmas.
   - Eco da Memória: o anfitrião sorteia a sequência e julga as respostas.
   =================================================================== */
const MG={open:false,view:'hub',room:null,g:null,C:null,ch:null,live:false,camp:'',rooms:{},raf:0,last:0,W:480,H:640,sc:1,say:null,pend:null,board:null,beat:0,over:null,lastHost:0};
T3.mg=MG;
const MG_MAX=6;
const MG_COLORS=[{n:'Roxo Místico',c:'#9b5cff'},{n:'Carmesim',c:'#e0233b'},{n:'Esmeralda',c:'#17b26a'},{n:'Dourado',c:'#f2b310'},{n:'Ciano',c:'#14c8e6'},{n:'Prata',c:'#c9ced8',gray:true}];
const mgCol=ci=>ci>=0&&MG_COLORS[ci]?MG_COLORS[ci].c:'#8fb6ff';
const mgColName=ci=>ci>=0&&MG_COLORS[ci]?MG_COLORS[ci].n:'Perseus original';
/* sorteio com semente: todos os aparelhos geram as mesmas colunas e plataformas */
const mb32=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const hrand=(seed,i,k=0)=>mb32((seed^Math.imul(i+1,0x9E3779B1)^Math.imul(k+7,0x85EBCA77))>>>0)();
const clamp12=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick12=a=>a[Math.floor(Math.random()*a.length)];
/* dificuldade do Perseus: guardada por aparelho */
const DIFF12={
  facil:{n:'Fácil',ico:'🌱',d:'Reage devagar, erra de vez em quando e joga na defesa.'},
  medio:{n:'Médio',ico:'⚖️',d:'Equilibrado: acompanha a bola e devolve jogadas normais.'},
  dificil:{n:'Difícil',ico:'🔥',d:'Calcula a trajetória, prevê quiques na parede e busca ângulos difíceis.'},
  pesadelo:{n:'Pesadelo',ico:'💀',d:'Reflexos quase instantâneos, cortadas na rede e provocações ácidas.'},
};
const diffGet=()=>{let v='medio';try{v=localStorage.getItem('tulpa_mg_diff')||v}catch(e){}return DIFF12[v]?v:'medio'};
const diffSet=v=>{if(!DIFF12[v])return;try{localStorage.setItem('tulpa_mg_diff',v)}catch(e){}};
/* dificuldade do JOGO (física e desafios), independente da IA do Perseus */
const GD12={facil:0,medio:1,dificil:2,pesadelo:3};
const gdGet=()=>{let v='medio';try{v=localStorage.getItem('tulpa_mg_gdiff')||v}catch(e){}return DIFF12[v]?v:'medio'};
const gdSet=v=>{if(!DIFF12[v])return;try{localStorage.setItem('tulpa_mg_gdiff',v)}catch(e){}};
const gdPick=(gd,a)=>a[GD12[gd]??1];
function gdChips(cur,attr){return`<div class="mg-gd" role="radiogroup" aria-label="Dificuldade do jogo">${Object.entries(DIFF12).map(([k,d])=>`<button type="button" role="radio" aria-checked="${k===cur}" class="mg-gdb d-${k} ${k===cur?'on':''}" ${attr}="${k}">${d.ico} ${d.n}</button>`).join('')}</div>`}

/* ---------- quem sou eu na sala ---------- */
function mgName(){
  if(isGM6())return'Mestre';
  const c=camp3(),me=uid3();
  const ch=(M6.myChar&&charById(M6.myChar))||(c?.characters||[]).find(x=>x.ownerId===me&&!gmChar6(x));
  return String((ch&&nm(ch))||myLabel()||'Jogador').slice(0,32);
}

/* ---------- Perseus colorido (sprite tingido no canvas) ---------- */
const SPR={img:null,ok:false,cache:{}};
function sprLoad(){if(SPR.img)return;const im=new Image();im.onload=()=>{SPR.ok=true;SPR.cache={}};im.src=PERSEUS_IMG;SPR.img=im}
function spr(ci){
  if(!SPR.ok)return null;const k=String(ci);if(SPR.cache[k])return SPR.cache[k];
  const S=128,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.drawImage(SPR.img,0,0,S,S);
  const col=MG_COLORS[ci];
  if(col){
    x.globalCompositeOperation=col.gray?'saturation':'color';x.fillStyle=col.gray?'#808080':col.c;x.fillRect(0,0,S,S);
    if(col.gray){x.globalCompositeOperation='soft-light';x.fillStyle='#ffffff';x.fillRect(0,0,S,S)}
    x.globalCompositeOperation='destination-in';x.drawImage(SPR.img,0,0,S,S);
  }
  SPR.cache[k]=c;return c;
}
/* desenha um Perseus (ci = cor; -1 = original) com o nome flutuando acima */
function mgCat(x,ci,cx,cy,size,name,{flip=false,alpha=1,ring=false}={}){
  x.save();x.globalAlpha=alpha;
  const im=spr(ci);
  if(ring){x.beginPath();x.ellipse(cx,cy+size*.46,size*.36,size*.1,0,0,Math.PI*2);x.fillStyle='rgba(255,255,255,.18)';x.fill()}
  if(im){x.translate(cx,cy);if(flip)x.scale(-1,1);x.drawImage(im,-size/2,-size/2,size,size)}
  else{x.beginPath();x.arc(cx,cy,size*.4,0,Math.PI*2);x.fillStyle=mgCol(ci);x.fill()}
  x.restore();
  if(name&&alpha<1&&MG.drawn)MG.drawn[name]=alpha;
  if(name){x.save();x.globalAlpha=Math.min(1,alpha+.15);x.font='700 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='bottom';x.lineWidth=3.5;x.strokeStyle='rgba(0,0,0,.75)';x.strokeText(name,cx,cy-size*.5-2);x.fillStyle=ci<0?'#dfe9ff':mgCol(ci);x.fillText(name,cx,cy-size*.5-2);x.restore()}
}
T3.mgCat=mgCat;

/* ---------- sons (pelo tulpaFx5) ---------- */
[262,196,330,392,523].forEach((f,i)=>{S5['eco'+i]=t=>{o5('triangle',f,t,.42,{gain:.08,wet:.45});o5('sine',f*2,t,.3,{gain:.025,wet:.4})}});
S5.mgJump=t=>o5('sine',380,t,.12,{to:760,gain:.05,wet:.1});
S5.mgCoin=t=>{o5('triangle',988,t,.08,{gain:.05});o5('triangle',1319,t+.06,.14,{gain:.05})};
S5.mgBall=t=>{n5(t,.04,{freq:900,type:'lowpass',gain:.22});o5('sine',220,t,.1,{to:140,gain:.08})};
S5.mgWin=t=>[523,659,784,1047].forEach((f,i)=>o5('triangle',f,t+i*.09,.3,{gain:.06,wet:.4}));
S5.mgLose=t=>[392,330,262].forEach((f,i)=>o5('sine',f,t+i*.12,.32,{gain:.05,wet:.4}));

/* ---------- canal ao vivo dos mini-games ---------- */
function mgJoinCh(){
  const c=camp3();if(!c)return;if(MG.ch&&MG.camp===c.id)return;
  mgLeaveCh();MG.camp=c.id;
  try{
    const s=sb();if(!s||typeof s.channel!=='function')return;
    const ch=s.channel('tulpa-minigames-'+c.id,{config:{broadcast:{self:false}}});
    ch.on('broadcast',{event:'g'},({payload})=>{try{mgOnMsg(payload||{})}catch(e){console.warn('[T12] mensagem',e)}});
    ch.subscribe(st=>{if(st==='SUBSCRIBED'){MG.live=true;mgSend('board?',{})}});
    MG.ch=ch;
  }catch(e){console.warn('[T12] canal',e)}
}
function mgLeaveCh(){mgRoomLeave();try{if(MG.ch)sb()?.removeChannel(MG.ch)}catch(e){}MG.ch=null;MG.live=false;MG.rooms={}}
/* ---------- canal só da sala ----------
   Antes, os snapshots (15–20 por segundo) e as entradas dos convidados iam pelo canal da campanha inteira:
   todo mundo conectado recebia tudo e o limite de mensagens do Realtime estourava (atraso de segundos para os convidados).
   Agora o tráfego rápido vai por um canal só de quem está na sala. Enquanto alguém ainda não entrou nele, cai no canal geral. */
const MG_FAST=new Set(['snap','in','pos','rs','ri','as','ain','rh','rhs','pss','pam']);
const MGR={ch:null,id:'',live:false,peers:new Set()};
function mgRoomLeave(){try{if(MGR.ch)sb()?.removeChannel(MGR.ch)}catch(e){}MGR.ch=null;MGR.id='';MGR.live=false;MGR.peers=new Set()}
function mgRoomSay(t,o){try{if(MGR.ch&&MGR.live)MGR.ch.send({type:'broadcast',event:'g',payload:{...o,t,from:uid3()}})}catch(e){}}
function mgRoomCh(){
  const r=MG.room,want=r&&r.mode==='multi'&&MG.live?r.id:'';
  if(MGR.id===want)return;
  mgRoomLeave();if(!want)return;
  const c=camp3(),s=sb();if(!c||!s||typeof s.channel!=='function')return;
  try{
    const ch=s.channel('tulpa-mg-'+c.id+'-'+want,{config:{broadcast:{self:false,ack:false}}});
    ch.on('broadcast',{event:'g'},({payload})=>{
      if(MGR.ch!==ch)return;const p=payload||{};
      /* "rj" = entrei no canal da sala; quem já estava responde para o recém-chegado saber dele também */
      if(p.t==='rj'){if(p.from){MGR.peers.add(p.from);if(!p.re)mgRoomSay('rj',{re:1})}return}
      try{mgOnMsg(p)}catch(e){console.warn('[T12] mensagem da sala',e)}
    });
    ch.subscribe(st=>{if(MGR.ch!==ch)return;if(st==='SUBSCRIBED'){MGR.live=true;mgRoomSay('rj',{})}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){MGR.live=false;MGR.peers=new Set()}});
    MGR.ch=ch;MGR.id=want;
  }catch(e){console.warn('[T12] canal da sala',e)}
}
/* todos os outros jogadores humanos da sala já estão ouvindo o canal da sala? */
function mgRoomReady(id){
  const r=MG.room;if(!MGR.live||!r||r.id!==id||MGR.id!==id)return false;const me=uid3();
  return r.players.every(p=>p.u===me||String(p.u||'').startsWith('~')||MGR.peers.has(p.u));
}
/* mensagens que não podem se perder: se o limite de envio recusar, tenta de novo */
const MG_MUST=new Set(['start','over','dead','close','join','leave','full','inv','bres','eseq','eres','eans','tstate','tmove','board','say']);
function mgSend(t,o,tries=0){
  try{
    if(MG_FAST.has(t)&&o&&o.id&&mgRoomReady(o.id)){mgRoomSay(t,o);return}
    if(!(MG.ch&&MG.live&&typeof MG.ch.send==='function'))return;
    const r=MG.ch.send({type:'broadcast',event:'g',payload:{...o,t,from:uid3()}});
    if(MG_MUST.has(t)&&tries<6&&r&&typeof r.then==='function')r.then(v=>{if(v==='rate limited'||v==='error'||v==='timed out')setTimeout(()=>mgSend(t,o,tries+1),140+tries*120)}).catch(()=>{});
  }catch(e){}
}

/* ---------- placar da pausa (recordes e vitórias da sessão de hoje) ---------- */
const boardKey=()=>'tulpa_mg_'+(camp3()?.id||MG.camp||'x')+'_'+new Date().toLocaleDateString('sv');
function boardGet(){
  const k=boardKey();if(MG.board&&MG.board.k===k)return MG.board;
  let b=null;try{b=JSON.parse(localStorage.getItem(k)||'null')}catch(e){}
  MG.board={rec:{},wins:{},ids:[],...(b&&typeof b==='object'?b:{}),k};return MG.board;
}
function boardSave(){try{localStorage.setItem(MG.board.k,JSON.stringify(MG.board))}catch(e){}}
function boardApply(list,id){
  const b=boardGet();if(id){if(b.ids.includes(id))return;b.ids.push(id);if(b.ids.length>300)b.ids.splice(0,150)}
  (list||[]).forEach(r=>{if(!r||!GAMES12[r.g])return;const n=String(r.n||'?').slice(0,32);
    if(isFinite(r.s)&&r.s>0&&GAMES12[r.g].rec){const cur=b.rec[r.g];if(!cur||r.s>cur.s)b.rec[r.g]={s:Math.round(r.s),n}}
    if(r.w)b.wins[n]=(b.wins[n]||0)+1});
  boardSave();boardRender();
}
function boardPush(list){const id='b'+rid();boardApply(list,id);mgSend('bres',{list,mid:id})}
function boardMerge(o){
  if(!o||typeof o!=='object')return;const b=boardGet();
  Object.entries(o.rec||{}).forEach(([g,r])=>{if(!GAMES12[g]||!r||!isFinite(r.s))return;const cur=b.rec[g];if(!cur||r.s>cur.s)b.rec[g]={s:Math.round(r.s),n:String(r.n||'?').slice(0,32)}});
  Object.entries(o.wins||{}).forEach(([n,v])=>{v=Number(v)||0;if(v>(b.wins[n]||0))b.wins[n]=v});
  boardSave();boardRender();
}
function boardHtml(){
  const b=boardGet(),rec=Object.entries(GAMES12).filter(([g])=>b.rec[g]).map(([g,d])=>`<li><span>${d.ico} ${d.short||d.name}</span><b>${b.rec[g].s}</b><span class="sub">${esc(b.rec[g].n)}</span></li>`).join('');
  const wins=Object.entries(b.wins).sort((a,c)=>c[1]-a[1]).slice(0,6).map(([n,v])=>`<li><span>${esc(n)}</span><b>${v}</b><span class="sub">vitória${v===1?'':'s'}</span></li>`).join('');
  return`<h3>🏆 Placar da Pausa</h3>${rec||wins?`${rec?`<p class="mgb-h">Recordes</p><ul class="mgb">${rec}</ul>`:''}${wins?`<p class="mgb-h">Vitórias</p><ul class="mgb">${wins}</ul>`:''}`:'<p class="sub">Ninguém jogou ainda nesta sessão. O primeiro recorde é seu.</p>'}`;
}
function boardRender(){['mgBoardPause','mgBoardHub'].forEach(id=>{const e=$(id);if(e){const h=boardHtml();if(e.innerHTML!==h)e.innerHTML=h}})}

/* ---------- janela dos mini-games ---------- */
function mgRootEl(){
  let r=$('mgRoot');if(r)return r;
  r=document.createElement('div');r.id='mgRoot';r.setAttribute('role','dialog');r.setAttribute('aria-label','Mini-games de intervalo');
  r.innerHTML=`<div class="mg-top"><button type="button" class="mg-tb" id="mgBack" aria-label="Voltar">←</button><b id="mgTitle">🎮 Mini-Games de Intervalo</b><button type="button" class="mg-tb mg-full-btn" id="mgFull" hidden aria-pressed="false" title="Tela cheia">⛶<span> Tela Cheia</span></button><button type="button" class="mg-tb" id="mgClose" aria-label="Fechar e voltar ao intervalo">✕</button></div><div class="mg-main" id="mgMain"></div>`;
  document.body.append(r);
  $('mgClose').onclick=()=>mgClose();$('mgBack').onclick=()=>mgBack();$('mgFull').onclick=()=>mgFull();
  return r;
}
function mgTitle(t){const e=$('mgTitle');if(e)e.textContent=t;mgLayout()}
/* ---------- tela cheia e modo paisagem ----------
   ⛶ pede a tela cheia do navegador (Fullscreen API). No iPhone, que não deixa,
   o jogo ocupa a tela inteira só pelo CSS. Celular deitado no jogo = mesmo visual,
   e o primeiro toque na partida também pede a tela cheia de verdade. */
const fsEl12=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
function fsExit12(){try{if(fsEl12())(document.exitFullscreen||document.webkitExitFullscreen).call(document)?.catch?.(()=>{})}catch(e){}try{screen.orientation?.unlock?.()}catch(e){}MG.fsNative=false;MG.fsAuto=false}
function fsReq12(auto){
  const r=$('mgRoot');if(!r||fsEl12())return;const f=r.requestFullscreen||r.webkitRequestFullscreen;if(!f)return;
  try{const p=f.call(r,{navigationUI:'hide'});MG.fsNative=true;MG.fsAuto=!!auto;
    const lock=()=>{if(MG.W>MG.H)screen.orientation?.lock?.('landscape')?.catch?.(()=>{})};
    if(p&&p.then)p.then(lock,()=>{MG.fsNative=false;MG.fsAuto=false});else lock()}catch(e){}
}
function mgFull(on){
  on=on??!MG.full;MG.full=!!on;
  if(on)fsReq12(false);else fsExit12();
  mgLayout();
}
function mgLayout(){
  const game=MG.open&&MG.view==='game',land=game&&touch12()&&window.innerWidth>window.innerHeight;
  if(!game&&(MG.full||MG.fsNative)){MG.full=false;fsExit12()}
  if(game&&!land&&MG.fsAuto&&!MG.full)fsExit12();
  const b=document.body;b.classList.toggle('mg-land',land);b.classList.toggle('mg-full',game&&!!MG.full);b.classList.toggle('mg-ov',game&&(land||!!MG.full));
  const fb=$('mgFull');if(fb){fb.hidden=!game;fb.setAttribute('aria-pressed',MG.full?'true':'false');fb.title=MG.full?'Sair da tela cheia':'Tela cheia';fb.setAttribute('aria-label',fb.title)}
  if(game)requestAnimationFrame(mgFit);
}
T3.mgFull=mgFull;
document.addEventListener('fullscreenchange',()=>{if(!fsEl12()&&MG.fsNative){MG.fsNative=false;MG.fsAuto=false;if(MG.full){MG.full=false;mgLayout()}}});
document.addEventListener('webkitfullscreenchange',()=>{if(!fsEl12()&&MG.fsNative){MG.fsNative=false;if(MG.full){MG.full=false;mgLayout()}}});
window.addEventListener('orientationchange',()=>setTimeout(mgLayout,120));
/* o Arcade abre no ⏸ Intervalo e também para quem está no Modo Espectador (personagem em outro mapa) */
/* e agora também a qualquer momento, pelo menu (modo livre: não fecha quando a sessão retoma) */
/* regra: livre sem call; com call ativa (estado GLOBAL da mesa, sair da call não destrava) só no Intervalo ou fora do mapa principal */
const canAccessArcade=()=>!M6.state.call?.on||!!M6.state.pause?.on||(!isGM6()&&!!T3.specOf?.(uid3()));
T3.canAccessArcade=canAccessArcade;
const arcOk12=()=>canAccessArcade();
T3.arcOk=arcOk12;
const arcFree12=()=>{if(!M6.state.pause?.on&&!(!isGM6()&&T3.specOf?.(uid3()))&&!M6.state.call?.on)MG.free=true};
T3.arcFree=arcFree12;
function mgOpen(){
  arcFree12();
  if(!arcOk12()){toast('Com a call ativa, o Arcade abre só no ⏸ Intervalo.');return}
  actx();mgJoinCh();sprLoad();mgRootEl().classList.add('show');MG.open=true;document.body.classList.add('mg-on');
  if(MG.room)(MG.g?null:mgLobby());else mgHub();
}
function mgClose(){MG.free=false;mgLeaveRoom();mgStop();const r=$('mgRoot');if(r)r.classList.remove('show');MG.open=false;document.body.classList.remove('mg-on');mgLayout()}
function mgBack(){if(MG.view==='hub'){mgClose();return}mgLeaveRoom();mgHub()}
T3.mgOpen=mgOpen;T3.mgClose=mgClose;

const touch12=()=>document.body.classList.contains('t3-mobile')||!!window.matchMedia?.('(pointer:coarse)').matches||('ontouchstart' in window&&navigator.maxTouchPoints>0);

function mgHub(){
  MG.view='hub';mgStop();mgTitle('🎮 Mini-Games de Intervalo');
  const m=$('mgMain');if(!m)return;
  m.innerHTML=`<div class="mg-hub"><div class="mg-gdrow"><span>🎚 Dificuldade do jogo</span>${gdChips(gdGet(),'data-gd')}<span class="sub">Muda velocidade, física e armadilhas de todos os jogos. A IA do Perseus tem a dela.</span></div><div class="mg-grid">${Object.entries(GAMES12).map(([id,g])=>`<article class="mg-card"><div class="mg-ico" aria-hidden="true">${g.ico}</div><div class="mg-txt"><h3>${g.name}</h3><p>${g.desc}</p></div><div class="mg-cbtn"><button type="button" class="btn small" data-solo="${id}">${g.solo}</button><button type="button" class="btn small primary" data-multi="${id}">👥 Sala até 6</button></div></article>`).join('')}</div><aside class="mg-side"><div id="mgRooms"></div><div class="mg-board" id="mgBoardHub"></div></aside></div>`;
  $$('[data-solo]',m).forEach(b=>b.onclick=()=>GAMES12[b.dataset.solo].ai?mgDiffPick(b.dataset.solo):mgCreate(b.dataset.solo,false));
  $$('[data-multi]',m).forEach(b=>b.onclick=()=>mgCreate(b.dataset.multi,true));
  $$('[data-gd]',m).forEach(b=>b.onclick=()=>{gdSet(b.dataset.gd);mgHub()});
  roomsRender();boardRender();
}
function roomsRender(){
  const e=$('mgRooms');if(!e)return;const now=Date.now();
  const list=Object.values(MG.rooms).filter(x=>now-x.seen<9000&&x.r.st==='lobby'&&x.r.players.length<(x.r.max||MG_MAX)&&!x.r.players.some(p=>p.u===uid3()));
  const h=list.length?`<h3>Salas abertas</h3><ul class="mg-rooms">${list.map(({r})=>`<li><span>${GAMES12[r.g].ico} <b>${GAMES12[r.g].name}</b><br><span class="sub">de ${esc(r.hn)} · ${r.players.length}/${r.max||MG_MAX}</span></span><button type="button" class="btn small primary" data-join="${r.id}">Entrar</button></li>`).join('')}</ul>`:'<h3>Salas abertas</h3><p class="sub">Nenhuma sala aberta agora. Abra uma e convide a mesa.</p>';
  if(e.dataset.h!==h){e.dataset.h=h;e.innerHTML=h;$$('[data-join]',e).forEach(b=>b.onclick=()=>mgJoinRoom(b.dataset.join))}
}

/* escolha de dificuldade antes da partida contra o Perseus */
function diffChips(cur,attr){return`<div class="mg-diff" role="radiogroup" aria-label="Dificuldade do Perseus">${Object.entries(DIFF12).map(([k,d])=>`<button type="button" role="radio" aria-checked="${k===cur}" class="mg-dbtn d-${k} ${k===cur?'on':''}" ${attr}="${k}"><span class="mg-dico" aria-hidden="true">${d.ico}</span><b>${d.n}</b><span class="mg-dtx">${d.d}</span></button>`).join('')}</div>`}
function mgDiffPick(g){
  const def=GAMES12[g];if(!def)return;MG.view='diff';mgStop();mgTitle(def.ico+' '+def.name);
  const m=$('mgMain');if(!m)return;
  m.innerHTML=`<div class="mg-lobby mg-dpick"><h2>${def.ico} ${def.name}</h2><p class="sub">Escolha a dificuldade do Perseus.</p>${diffChips(diffGet(),'data-diff')}<div class="mg-lbtn"><button type="button" class="btn small" id="mgDiffBack">Voltar</button></div></div>`;
  $$('[data-diff]',m).forEach(b=>b.onclick=()=>{diffSet(b.dataset.diff);mgCreate(g,false,b.dataset.diff)});
  $('mgDiffBack').onclick=()=>mgHub();
  m.querySelector('.mg-dbtn.on')?.focus();
}

/* ---------- salas ---------- */
function mgCreate(g,multi,diff){
  const def=GAMES12[g];if(!def)return;mgLeaveRoom();
  const me={u:uid3(),n:mgName(),c:0};
  MG.room={id:'r'+rid(),g,mode:multi?'multi':(def.ai?'ai':'solo'),host:uid3(),hn:me.n,players:[me],st:'lobby',max:Math.min(MG_MAX,(multi==='pvp'?2:def.max)||MG_MAX),diff:DIFF12[diff]?diff:diffGet(),gd:gdGet()};
  if(multi){mgPublish();mgLobby()}else mgStartHost();
}
function mgPublish(){try{mgRoomCh()}catch(e){}const r=MG.room;if(!r||r.host!==uid3()||r.mode!=='multi')return;mgSend('room',{r})}
function mgJoinRoom(id){
  const x=MG.rooms[id];if(!x){toast('Essa sala não existe mais.');return}
  mgLeaveRoom();MG.pend=id;mgSend('join',{id,n:mgName()});
  MG.view='lobby';const m=$('mgMain');if(m)m.innerHTML=`<div class="mg-lobby"><h2>${GAMES12[x.r.g].ico} ${GAMES12[x.r.g].name}</h2><p class="sub">Entrando na sala de ${esc(x.r.hn)}…</p></div>`;
  clearTimeout(MG.pendT);MG.pendT=setTimeout(()=>{if(MG.pend===id){MG.pend=null;toast('O anfitrião não respondeu. A sala pode estar cheia ou já ter começado.');if(MG.open)mgHub()}},5000);
}
function mgLeaveRoom(){
  const r=MG.room;MG.pend=null;
  if(r&&r.mode==='multi'){if(r.host===uid3())mgSend('close',{id:r.id});else mgSend('leave',{id:r.id})}
  try{MG.g?.end?.()}catch(e){}
  MG.g=null;MG.C=null;MG.room=null;MG.over=null;mgStop();
}
function mgLobby(){
  MG.view='lobby';mgStop();const r=MG.room;if(!r){mgHub();return}
  const g=GAMES12[r.g],host=r.host===uid3(),m=$('mgMain');if(!m)return;mgTitle(g.ico+' '+g.name);
  m.innerHTML=`<div class="mg-lobby"><h2>${g.ico} ${g.name} <span class="sub">· sala multiplayer</span></h2><p class="sub">${host?'Você é o anfitrião. Convide a mesa e comece quando quiser.':'Aguardando '+esc(r.hn)+' começar a partida.'}</p>
   <ul class="mg-players">${r.players.map(p=>`<li><span class="mg-dot" style="background:${mgCol(p.c)}"></span><b>${esc(p.n)}</b><span class="sub">${mgColName(p.c)}${p.u===r.host?' · anfitrião':''}${p.u===uid3()?' · você':''}</span></li>`).join('')}${Array.from({length:Math.max(0,(r.max||MG_MAX)-r.players.length)},()=>'<li class="empty">vaga livre</li>').join('')}</ul>
   <p class="sub mg-rule">${g.rule||''}</p>
   ${host?`<p class="mgb-h">Dificuldade do jogo</p>${gdChips(r.gd||'medio','data-lgd')}`:`<p class="sub">Dificuldade do jogo: ${DIFF12[r.gd||'medio'].ico} ${DIFF12[r.gd||'medio'].n}</p>`}
   ${r.g==='volley'?(host?`<p class="mgb-h">Dificuldade do Perseus quando ele completar um time</p>${diffChips(r.diff||'medio','data-ldiff').replace('mg-diff','mg-diff mini')}`:`<p class="sub">Perseus, se entrar: ${DIFF12[r.diff||'medio'].ico} ${DIFF12[r.diff||'medio'].n}</p>`):''}
   <div class="mg-lbtn">${host?`<button type="button" class="btn" id="mgInvite">✉ Convidar Jogadores</button><button type="button" class="btn primary" id="mgStart" ${r.players.length<2?'disabled':''}>▶ Começar</button>`:''}<button type="button" class="btn small" id="mgLeave">Sair da sala</button></div>
   ${host&&r.players.length<2?'<p class="sub">Precisa de pelo menos 2 jogadores na sala. Sozinho, use o modo solo ou contra o Perseus.</p>':''}<div id="mgInvBox"></div></div>`;
  $$('[data-lgd]',m).forEach(b=>b.onclick=()=>{gdSet(b.dataset.lgd);MG.room.gd=b.dataset.lgd;mgPublish();mgLobby()});
  $$('[data-ldiff]',m).forEach(b=>b.onclick=()=>{diffSet(b.dataset.ldiff);MG.room.diff=b.dataset.ldiff;mgPublish();mgLobby()});
  const inv=$('mgInvite');if(inv)inv.onclick=mgInvitePanel;
  const st=$('mgStart');if(st)st.onclick=()=>{if(MG.room.players.length>=2)mgStartHost()};
  $('mgLeave').onclick=()=>{mgLeaveRoom();mgHub()};
}
function mgInvitePanel(){
  const box=$('mgInvBox');if(!box)return;const r=MG.room;
  const ppl=Object.values(M6.present||{}).filter(p=>p&&p.uid&&p.uid!==uid3()&&!r.players.some(q=>q.u===p.uid));
  const nameOf=p=>{const ch=p.charId&&charById(p.charId);return(ch&&nm(ch))||p.name||'Jogador'};
  box.innerHTML=`<div class="mg-invp"><b>✉ Convidar</b>${ppl.length?`<div class="mg-invl">${ppl.map(p=>`<label><input type="checkbox" value="${esc(p.uid)}"> ${esc(nameOf(p))}${p.role==='master'?' (Mestre)':''}</label>`).join('')}</div>`:'<p class="sub">Ninguém mais aparece online na mesa agora. Você ainda pode mandar um chamado aberto.</p>'}<div class="mg-lbtn">${ppl.length?'<button type="button" class="btn small primary" id="mgInvSend">Convidar marcados</button>':''}<button type="button" class="btn small" id="mgInvAll">📣 Chamado aberto para a mesa</button></div></div>`;
  const send=to=>{mgSend('inv',{id:r.id,g:r.g,hn:mgName(),to});toast(to?'Convite enviado.':'Chamado enviado para toda a mesa.');box.innerHTML=''};
  const s=$('mgInvSend');if(s)s.onclick=()=>{const to=$$('input:checked',box).map(i=>i.value);if(!to.length){toast('Marque pelo menos uma pessoa.');return}send(to)};
  $('mgInvAll').onclick=()=>send(null);
}
function mgInvShow(p){
  const g=GAMES12[p.g];if(!g||!arcOk12())return;
  $('mgInv')?.remove();const d=document.createElement('div');d.id='mgInv';d.className='mg-inv';d.setAttribute('role','status');
  d.innerHTML=`<span>🎮 <b>${esc(String(p.hn||'Alguém').slice(0,32))}</b> chamou ${p.to?'você ':'a mesa '}para ${g.ico} <b>${g.name}</b></span><span class="mg-lbtn"><button type="button" class="btn small primary" id="mgInvOk">Aceitar Desafio</button><button type="button" class="btn small" id="mgInvNo">Agora não</button></span>`;
  document.body.append(d);fx5('activate');
  $('mgInvOk').onclick=()=>{d.remove();mgOpen();MG.rooms[p.id]=MG.rooms[p.id]||{r:{id:p.id,g:p.g,hn:p.hn,players:[],st:'lobby'},seen:Date.now()};mgJoinRoom(p.id)};
  $('mgInvNo').onclick=()=>d.remove();
  setTimeout(()=>d.remove(),25000);
}

/* ---------- partida ---------- */
function mgStartHost(){
  const r=MG.room;if(!r||r.host!==uid3())return;
  const seed=(Math.random()*2**31)>>>0,t0=Date.now()+(r.mode==='multi'?3200:1600);
  r.st='play';mgPublish();
  if(r.mode==='multi')mgSend('start',{id:r.id,r,seed,t0});
  mgStartLocal(r,seed,t0);
}
function mgStartLocal(room,seed,t0){
  const def=GAMES12[room.g];MG.view='game';MG.over=null;MG.say=null;mgTitle(def.ico+' '+def.name+' · '+(DIFF12[room.gd]||DIFF12.medio).ico+' '+(DIFF12[room.gd]||DIFF12.medio).n);
  const m=$('mgMain');if(!m)return;
  const pad=touch12()?def.pad||'':'';
  m.innerHTML=`<div class="mg-game">${def.W>def.H&&touch12()?'<p class="mg-rot">📱 Gire o celular para ver a quadra maior</p>':''}<div class="mg-hud" id="mgHud"></div><div class="mg-stage" id="mgStage"><canvas id="mgCv" aria-label="${esc(def.name)}"></canvas><div class="mg-over" id="mgOver" hidden></div></div>${pad?`<div class="mg-pad mg-pad-${pad}" id="mgPad">${padHtml(pad)}</div>`:`<p class="mg-keys sub">${touch12()?def.touch:def.keys}</p>`}</div>`;
  MG.W=def.W;MG.H=def.H;
  const C={room,seed,t0,def,diff:DIFF12[room.diff]?room.diff:'medio',gd:DIFF12[room.gd]?room.gd:'medio',me:uid3(),host:room.host===uid3(),net:room.mode==='multi',players:room.players.map(p=>({...p})),
    send:(t,o)=>{if(room.mode==='multi')mgSend(t,{...o,id:room.id})},
    say:(txt,net=true)=>{MG.say={txt,until:Date.now()+3000};if(net&&room.mode==='multi'&&room.host===uid3())mgSend('say',{id:room.id,txt})},
    finish:res=>mgFinish(room,res),
    hud:h=>{const e=$('mgHud');if(e&&e.dataset.h!==h){e.dataset.h=h;e.innerHTML=h}}};
  try{mgRoomCh()}catch(e){}
  MG.C=C;MG.g=def.make(C);
  const cv=$('mgCv');MG.cv=cv;MG.x=cv.getContext('2d');
  const pt=e=>{const rc=cv.getBoundingClientRect();return[(e.clientX-rc.left)*MG.W/rc.width,(e.clientY-rc.top)*MG.H/rc.height]};
  $('mgMain').onpointerdown=()=>{if(document.body.classList.contains('mg-land')&&!fsEl12())fsReq12(true)};
  cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}MG.g?.ptr?.('down',...pt(e),e)});
  cv.addEventListener('pointermove',e=>MG.g?.ptr?.('move',...pt(e),e));
  cv.addEventListener('pointerup',e=>MG.g?.ptr?.('up',...pt(e),e));
  cv.addEventListener('pointercancel',e=>MG.g?.ptr?.('up',...pt(e),e));
  if(pad)padBind();
  mgFit();MG.last=performance.now();cancelAnimationFrame(MG.raf);MG.raf=requestAnimationFrame(mgLoop);
}
function padHtml(p){
  const b=(k,l,cls='')=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${l}">${l}</button>`;
  if(p==='lrj')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}</div><div>${b('Space','⤒ Pular','wide')}</div>`;
  if(p==='lr')return`<div>${b('KeyA','◀','wide')}${b('KeyD','▶','wide')}</div>`;
  if(p==='rh4')return`<div class="mg-rh4">${b('ArrowLeft','←')}${b('ArrowDown','↓')}${b('ArrowUp','↑')}${b('ArrowRight','→')}</div>`;
  if(p==='td')return'';
  return'';
}
function padBind(){$$('#mgPad [data-k]').forEach(b=>{const k=b.dataset.k,on=e=>{e.preventDefault();b.classList.add('on');MG.g?.key?.(k,true)},off=e=>{e.preventDefault();b.classList.remove('on');MG.g?.key?.(k,false)};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);b.addEventListener('contextmenu',e=>e.preventDefault())})}
function mgFit(){
  const st=$('mgStage'),cv=$('mgCv');if(!st||!cv)return;const r=st.getBoundingClientRect();if(r.width<10||r.height<10)return;
  const s=Math.min(r.width/MG.W,r.height/MG.H),w=Math.max(1,Math.floor(MG.W*s)),h=Math.max(1,Math.floor(MG.H*s)),dpr=Math.min(2,window.devicePixelRatio||1);
  cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);MG.sc=cv.width/MG.W;
}
window.addEventListener('resize',()=>{if(MG.open)mgLayout();if(MG.view==='game')mgFit()});
function mgStop(){cancelAnimationFrame(MG.raf);MG.raf=0}
function mgLoop(now){
  MG.raf=requestAnimationFrame(mgLoop);
  const dt=Math.min(.05,Math.max(0,(now-MG.last)/1000));MG.last=now;
  const g=MG.g,x=MG.x;if(!g||!x)return;
  MG.drawn={};try{if(!MG.over)g.step(dt);x.setTransform(MG.sc,0,0,MG.sc,0,0);g.draw(x);mgOverlay(x)}catch(e){console.warn('[T12] jogo',e)}
}
/* contagem regressiva e balão do Perseus por cima do jogo */
function mgOverlay(x){
  const now=Date.now(),C=MG.C,W=MG.W,H=MG.H;
  if(C&&now<C.t0){const n=Math.ceil((C.t0-now)/1000);x.save();x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,0,W,H);x.font='800 92px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=6;x.strokeText(n,W/2,H/2);x.fillText(n,W/2,H/2);x.font='600 18px "IBM Plex Sans",system-ui,sans-serif';x.fillText('Prepare-se',W/2,H/2+70);x.restore()}
  const s=MG.say;if(s&&now<s.until){
    x.save();x.globalAlpha=Math.min(1,(s.until-now)/400);const bw=Math.min(W-90,360);x.font='600 14px "IBM Plex Sans",system-ui,sans-serif';
    const words=s.txt.split(' '),lines=[];let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w;if(x.measureText(t).width>bw-24&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);
    const bh=14+lines.length*19,bx=66,by=10;mgCat(x,-1,36,by+28,52,'');
    x.fillStyle='rgba(255,252,240,.96)';x.strokeStyle='#8e3e34';x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(bx,by,bw,bh,10):x.rect(bx,by,bw,bh);x.fill();x.stroke();
    x.fillStyle='#2a1c14';x.textAlign='left';x.textBaseline='top';lines.forEach((l,i)=>x.fillText(l,bx+12,by+8+i*19));x.restore();
  }
}
/* resultado: o anfitrião (ou o jogo solo) fecha a partida e atualiza o placar */
function mgFinish(room,res){
  if(MG.over)return;
  if(room.mode==='multi'){mgSend('over',{id:room.id,res});room.st='lobby';mgPublish()}
  boardPush(res.rows.filter(r=>!(String(r.u||'').startsWith('~')&&!r.w)).map(r=>({g:room.g,n:r.n,s:String(r.u||'').startsWith('~')?0:r.s,w:!!r.w})));
  mgShowOver(res);
}
function mgShowOver(res){
  MG.over=res;const e=$('mgOver');if(!e)return;const r=MG.room,host=r&&r.host===uid3();
  const mine=res.rows.find(q=>q.u===uid3());fx5(mine&&mine.w?'mgWin':res.rows.some(q=>q.w)?'mgLose':'confirm');
  e.innerHTML=`<div class="mg-ocard"><h3>${esc(res.title||'Fim de jogo')}</h3><ol class="mg-rank">${res.rows.map(q=>`<li class="${q.w?'win':''}"><span class="mg-dot" style="background:${mgCol(q.c)}"></span><b>${esc(q.n)}</b>${q.st!=null?`<span>${esc(String(q.st))}</span>`:q.s!=null?`<span>${q.s} ${res.unit||GAMES12[r?.g||'voo']?.unit||'pts'}</span>`:''}${q.w?'<span class="mg-crown">🏆</span>':''}</li>`).join('')}</ol>
    <div class="mg-lbtn">${!r||r.mode!=='multi'||host?'<button type="button" class="btn primary" id="mgAgain">↻ Jogar de novo</button>':'<span class="sub">Aguardando o anfitrião…</span>'}<button type="button" class="btn small" id="mgToHub">Outros jogos</button></div></div>`;
  e.hidden=false;
  const a=$('mgAgain');if(a)a.onclick=()=>{if(!MG.room)return;if(MG.room.mode==='multi')mgStartHost();else{MG.room.st='lobby';mgStartHost()}};
  $('mgToHub').onclick=()=>{mgLeaveRoom();mgHub()};
}

/* ---------- mensagens ---------- */
function mgOnMsg(p){
  const me=uid3(),now=Date.now();
  if(p.t==='board?'){mgSend('board',{b:{rec:boardGet().rec,wins:boardGet().wins}});return}
  if(p.t==='board'){boardMerge(p.b);return}
  if(p.t==='bres'){boardApply(p.list,p.mid);return}
  if(p.t==='room'&&p.r&&p.r.id&&GAMES12[p.r.g]){
    const r=p.r;if(r.host!==p.from)return;MG.rooms[r.id]={r,seen:now};
    if(MG.pend===r.id&&r.players.some(q=>q.u===me)){MG.pend=null;clearTimeout(MG.pendT);MG.room=r;MG.lastHost=now;try{mgRoomCh()}catch(e){}if(MG.open)mgLobby();return}
    if(MG.room&&MG.room.id===r.id&&MG.room.host!==me){
      if(!r.players.some(q=>q.u===me)){MG.room=null;toast('Você saiu da sala.');if(MG.open)mgHub();return}
      MG.lastHost=now;const was=MG.room.st;MG.room=r;if(MG.view==='lobby')mgLobby();
      if(MG.C)MG.C.room.players=r.players;
      if(was==='play'&&r.st==='lobby'&&MG.view==='game'&&!MG.over){}
    }
    if(MG.open&&MG.view==='hub')roomsRender();return;
  }
  if(p.t==='close'&&p.id){delete MG.rooms[p.id];if(MG.room&&MG.room.id===p.id&&MG.room.host===p.from){MG.room=null;try{MG.g?.end?.()}catch(e){}MG.g=null;MG.C=null;mgStop();toast('O anfitrião fechou a sala.');if(MG.open)mgHub()}else if(MG.open&&MG.view==='hub')roomsRender();return}
  if(p.t==='inv'){if(p.from===me)return;if(p.to&&!p.to.includes(me))return;if(MG.room&&MG.room.id===p.id)return;MG.rooms[p.id]=MG.rooms[p.id]||{r:{id:p.id,g:p.g,hn:p.hn,players:[],st:'lobby'},seen:now};mgInvShow(p);return}
  const r=MG.room;if(!r||p.id!==r.id)return;
  if(r.host===me){
    if(p.t==='join'){if(r.players.some(q=>q.u===p.from)){mgPublish();return}if(r.st!=='lobby'||r.players.length>=(r.max||MG_MAX)){mgSend('full',{id:r.id,to:p.from});return}
      const used=new Set(r.players.map(q=>q.c));let c=0;while(used.has(c))c++;r.players.push({u:p.from,n:String(p.n||'Jogador').slice(0,32),c});mgPublish();if(MG.view==='lobby')mgLobby();fx5('confirm');return}
    if(p.t==='leave'){const was=r.players.find(q=>q.u===p.from);r.players=r.players.filter(q=>q.u!==p.from);mgPublish();if(MG.view==='lobby')mgLobby();if(was){try{MG.g?.left?.(p.from)}catch(e){}toast(was.n+' saiu da sala.')}return}
  }else{
    if(p.from!==r.host&&['start','over','snap','say','eseq','eres','tstate'].includes(p.t))return;
    if(p.t==='start'){MG.room=p.r||r;MG.lastHost=now;mgStartLocal(MG.room,p.seed,p.t0);return}
    if(p.t==='over'){if(MG.g)mgShowOver(p.res);return}
    if(p.t==='say'){MG.say={txt:String(p.txt||'').slice(0,160),until:now+3000};return}
    if(p.t==='full'&&p.to===me){MG.pend=null;toast('A sala está cheia ou a partida já começou.');if(MG.open)mgHub();return}
  }
  if(MG.g&&MG.g.msg)MG.g.msg(p);
}
/* anfitrião avisa que a sala existe; quem está na sala percebe se ele sumiu */
setInterval(()=>{
  if(!MG.live)return;const r=MG.room,now=Date.now();
  if(r&&r.mode==='multi'&&r.host===uid3())mgPublish();
  if(r&&r.mode==='multi'&&r.host!==uid3()&&MG.lastHost&&now-MG.lastHost>12000){MG.room=null;try{MG.g?.end?.()}catch(e){}MG.g=null;MG.C=null;mgStop();toast('O anfitrião saiu. A sala foi fechada.');if(MG.open)mgHub()}
  for(const id in MG.rooms)if(now-MG.rooms[id].seen>15000)delete MG.rooms[id];
  try{mgRoomCh()}catch(e){}
  if(MG.open&&MG.view==='hub')roomsRender();
},2500);

/* ---------- teclado: só enquanto o jogo está aberto ---------- */
const MG_BLOCK=['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
window.addEventListener('keydown',e=>{
  if(!MG.open)return;const tg=e.target;if(tg&&(tg.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)))return;
  if(e.code==='Escape'){e.preventDefault();e.stopPropagation();mgBack();return}
  if(MG.view!=='game')return;
  if(MG_BLOCK.includes(e.code)||/^Key[WASD]$/.test(e.code)){e.preventDefault()}
  e.stopPropagation();if(!e.repeat)MG.g?.key?.(e.code,true);
},true);
window.addEventListener('keyup',e=>{if(!MG.open||MG.view!=='game')return;e.stopPropagation();MG.g?.key?.(e.code,false)},true);
window.addEventListener('blur',()=>{if(MG.g)['KeyA','KeyD','Space','ArrowLeft','ArrowRight','ArrowUp','KeyW'].forEach(k=>MG.g.key?.(k,false))});

/* ---------- ligação com o intervalo ---------- */
function mgPauseUi(){
  const card=$q('#mesaPause .pause-card');if(!card||$('mgPauseBox'))return;
  const box=document.createElement('div');box.id='mgPauseBox';box.className='mg-pausebox';
  box.innerHTML=`<button type="button" class="btn primary mg-openbtn" id="mgOpenBtn">🕹 Tulpa Arcade</button><div class="mg-board" id="mgBoardPause"></div>`;
  card.insertBefore(box,card.querySelector('.pause-act'));
  $('mgOpenBtn').onclick=mgOpen;boardRender();
}
onState6(()=>{
  if(M6.state.pause?.on)MG.free=false;
  if(arcOk12()&&camp3()){mgJoinCh();if(M6.state.pause?.on)mgPauseUi();boardRender()}
  else{
    const was=MG.open||!!MG.room;
    if(was){mgClose();if(!isGM6())toast(M6.state.call?.on&&!M6.state.pause?.on&&!(!isGM6()&&T3.specOf?.(uid3()))?(MG.specWas?'🎲 O seu personagem voltou à cena. De volta à mesa!':'📞 A call começou. De volta à mesa!'):MG.specWas?'🎲 O seu personagem voltou à cena. De volta à mesa!':'▶ O Mestre retomou a sessão. De volta à mesa!')}
    $('mgInv')?.remove();if(MG.ch)mgLeaveCh();
  }
});
M6.hooks.leave.push(()=>{mgClose();$('mgInv')?.remove();mgLeaveCh()});

