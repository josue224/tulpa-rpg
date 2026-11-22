/* ===================================================================
   TULPA · ETAPA 17 — 🕹 TULPA ARCADE
   ------------------------------------------------------------------
   Base comum de todos os mini-games do Intervalo:
   - CONTRATO DE JOGO (defineArcadeGame): cada jogo é um objeto
       { name, short, ico, desc, rule, status:'ready'|'soon',
         modes:['solo'|'ai'|'pvp'|'mesa'], max, rec, unit,
         W, H, pad, keys, touch, make(C) }
     e make(C) devolve a instância:
       { step(dt), draw(ctx), key(code,down), ptr(type,x,y,e),
         msg(payload), left(uid), end() }
     C (contexto) traz: room, seed, t0, me, host, net, players,
       diff (IA do Perseus), gd (dificuldade do jogo),
       send(t,o), say(txt), hud(html), finish({title,rows}),
       achieve(id), stat(key,inc).
   - MODOS: Solo · Contra o Perseus · PvP 1v1 (sala de 2) · Mesa (até 6,
     fantasmas simultâneos). Convites chegam em pilha (vários ao mesmo tempo).
   - CONQUISTAS (Trophy Room): gatilhos por jogo e por estatística, banner
     dourado com fanfarra, gravadas na ficha do jogador (Supabase) e
     mostradas como broches em volta do avatar na Visão de Mesa.
   - JOGOS: 🎵 Ritual Rhythm e 🏛 Defesa do Santuário aqui; os outros 11
     ficam em t16.js, t17.js e t18.js (registrados por defineArcadeGame).
   =================================================================== */
const ARC={stats:null,ach:null,banner:[],showing:false};
T3.arcade=ARC;
const ARC_KEY=()=>'tulpa_arc_'+(uid3()||'anon');

/* ---------- contrato ---------- */
function defineArcadeGame(id,def){
  const d={status:'ready',modes:['solo'],max:6,unit:'pts',W:800,H:450,pad:'',keys:'',touch:'',solo:'🎯 Solo',desc:'',rule:'',...def};
  if(d.status==='ready'&&typeof d.make!=='function')throw new Error('Jogo '+id+' sem make()');
  if(d.status!=='ready')d.make=()=>({step(){},draw(x){x.fillStyle='#120d18';x.fillRect(0,0,d.W,d.H)},key(){},ptr(){}});
  if(d.modes.includes('ai'))d.ai=true;
  GAMES12[id]=d;return d;
}
T3.defineArcadeGame=defineArcadeGame;
/* jogos que já existiam: só declaram os modos */
Object.assign(GAMES12.volley,{modes:['ai','mesa'],max:6});
Object.assign(GAMES12.voo,{modes:['solo','mesa'],max:6});
Object.assign(GAMES12.salto,{modes:['solo','mesa'],max:6});
Object.assign(GAMES12.coleta,{modes:['solo','mesa'],max:6});
Object.assign(GAMES12.eco,{modes:['solo','mesa'],max:6});
Object.assign(GAMES12.velha,{modes:['ai','mesa'],max:6});

/* ===================== conquistas ===================== */
const ACH={
  ritual1:{ico:'🎵',n:'Primeiro Ritual',d:'Termine uma música no Ritual Rhythm.'},
  mente:{ico:'🧠',n:'Mente Intacta',d:'Termine uma música do Ritual Rhythm sem errar nenhuma nota.',secret:true},
  combo:{ico:'🔥',n:'Combo Astral',d:'Faça um combo de 60 notas no Ritual Rhythm.'},
  gato:{ico:'😼',n:'Humilhando o Gato',d:'Vença o Perseus no Pesadelo, em qualquer jogo.',secret:true},
  guardiao:{ico:'🏛',n:'Guardião do Santuário',d:'Vença todas as ondas da Defesa do Santuário.'},
  inabalavel:{ico:'💎',n:'Santuário Inabalável',d:'Vença a Defesa do Santuário no Pesadelo sem perder Vital.',secret:true},
  cinco:{ico:'🌈',n:'Os Cinco Elementos',d:'Construa os 5 totens numa mesma partida da Defesa.'},
  quadra:{ico:'🏐',n:'Rei da Quadra',d:'Vença uma partida de Tulpa Volley.'},
  asas:{ico:'🦇',n:'Asas do Véu',d:'Passe por 20 colunas no Voo Além do Véu.'},
  ascensao:{ico:'⬆️',n:'Ascensão',d:'Faça 2000 pontos no Salto Astral.'},
  mesa:{ico:'👥',n:'Mesa Unida',d:'Jogue uma partida com 3 ou mais pessoas.'},
  vicio:{ico:'🎮',n:'Viciado no Intervalo',d:'Jogue 25 partidas no Arcade.'},
  dedo:{ico:'👆',n:'Dedo Divino',d:'Dê 1000 cliques ou toques dentro dos jogos.',secret:true},
};
T3.ach=ACH;
function arcLoad(){
  if(ARC.stats&&ARC.key===ARC_KEY())return;ARC.key=ARC_KEY();
  let o={};try{o=JSON.parse(localStorage.getItem(ARC.key)||'{}')}catch(e){}
  ARC.stats=o.stats||{};ARC.ach=o.ach||{};
  const ch=myArcChar();Object.assign(ARC.ach,(ch&&d14(ch).achievements)||{});
}
function arcSave(){try{localStorage.setItem(ARC.key,JSON.stringify({stats:ARC.stats,ach:ARC.ach}))}catch(e){}}
function myArcChar(){if(isGM6())return null;const me=uid3();return(M6.myChar&&charById(M6.myChar))||chars3().find(c=>c.ownerId===me&&!gmChar6(c))||null}
S5.achieve=t=>{[523,659,784,1047,1319].forEach((f,i)=>o5('triangle',f,t+i*.08,.5,{gain:.07,wet:.6}));o5('sine',2093,t+.42,.9,{gain:.04,wet:.8});n5(t+.4,.6,{freq:9000,type:'highpass',gain:.05,wet:.6})};
function achieve(id){
  arcLoad();const a=ACH[id];if(!a||ARC.ach[id])return false;
  ARC.ach[id]=Date.now();arcSave();
  /* grava na ficha (o Supabase sincroniza com a mesa) */
  const ch=myArcChar();if(ch&&(ch._sheetAvailable||ch.id===activeCharacterId))try{mutateChar(ch,d=>{d.achievements={...(d.achievements||{}),[id]:ARC.ach[id]}})}catch(e){}
  ARC.banner.push(id);achBanner();
  try{cast6({t:'ach',id,n:mgName()})}catch(e){}
  achRender();return true;
}
function stat(k,inc=1){arcLoad();ARC.stats[k]=(Number(ARC.stats[k])||0)+inc;arcSave();
  if(k==='played'&&ARC.stats.played>=25)achieve('vicio');
  if(k==='clicks'&&ARC.stats.clicks>=1000)achieve('dedo');
  return ARC.stats[k]}
T3.achieve=achieve;T3.arcStat=stat;
function achBanner(){
  if(ARC.showing||!ARC.banner.length)return;const id=ARC.banner.shift(),a=ACH[id];ARC.showing=true;
  const b=document.createElement('div');b.className='ach-banner';b.setAttribute('role','status');
  b.innerHTML=`<span class="ach-ico" aria-hidden="true">${a.ico}</span><span><small>🏆 Conquista desbloqueada</small><b>${esc(a.n)}</b><em>${esc(a.d)}</em></span>`;
  (document.fullscreenElement||document.body).append(b);fx5('achieve');
  requestAnimationFrame(()=>b.classList.add('show'));
  setTimeout(()=>{b.classList.remove('show');setTimeout(()=>{b.remove();ARC.showing=false;achBanner()},450)},4200);
}
onCast6(p=>{if(p.t==='ach'&&ACH[p.id]&&p.from!==uid3())toast(`🏆 ${String(p.n||'Alguém').slice(0,32)} desbloqueou “${ACH[p.id].n}”.`)});
/* broches em volta do avatar na Visão de Mesa */
function achPins(){
  $$('#tableCharacters .table-char.seat').forEach(card=>{
    const ch=charById(card.dataset.cid);if(!ch)return;const got=Object.entries(d14(ch).achievements||{}).filter(([k])=>ACH[k]).sort((a,b)=>a[1]-b[1]).map(([k])=>k);
    const host=card.querySelector('.tc-head .av')?.parentElement||card.querySelector('.tc-head');if(!host)return;
    let box=host.querySelector('.ach-pins');const sig=got.join(',');
    if(!got.length){box?.remove();return}
    if(box&&box.dataset.sig===sig)return;
    if(!box){box=document.createElement('div');box.className='ach-pins';host.append(box)}
    box.dataset.sig=sig;const show=got.slice(-6);
    box.innerHTML=show.map((k,i)=>`<span class="ach-pin" style="--a:${-150+i*(120/Math.max(1,show.length-1||1))}deg" title="${esc(ACH[k].n)}">${ACH[k].ico}</span>`).join('')+(got.length>6?`<span class="ach-more">+${got.length-6}</span>`:'');
  });
}
setInterval(()=>{try{if(camp3())achPins()}catch(e){}},1500);
/* sala de troféus */
function achHtml(){
  arcLoad();const n=Object.keys(ACH).filter(k=>ARC.ach[k]).length;
  return`<div class="ach-room"><h3>🏆 Conquistas <span class="sub">${n} de ${Object.keys(ACH).length}</span></h3><ul class="ach-grid">${Object.entries(ACH).map(([k,a])=>{const got=!!ARC.ach[k],hide=a.secret&&!got;return`<li class="${got?'got':''}"><span class="ach-ico">${hide?'❔':a.ico}</span><b>${hide?'Conquista secreta':esc(a.n)}</b><span class="sub">${hide?'Descubra jogando.':esc(a.d)}</span>${got?`<span class="ach-date">${new Date(ARC.ach[k]).toLocaleDateString('pt-BR')}</span>`:''}</li>`}).join('')}</ul></div>`;
}
function achRender(){const e=$('mgAch');if(e)e.innerHTML=achHtml()}
function achOpen(){
  MG.view='ach';mgStop();mgTitle('🏆 Conquistas');const m=$('mgMain');if(!m)return;
  m.innerHTML=`<div class="mg-lobby" style="max-width:900px"><div id="mgAch"></div><div class="mg-lbtn"><button type="button" class="btn small" id="mgAchBack">← Voltar ao Arcade</button></div></div>`;
  achRender();$('mgAchBack').onclick=()=>mgHub();
}
/* gatilhos gerais: quando qualquer partida termina */
const _mso15=mgShowOver;
mgShowOver=function(res){
  const out=_mso15.apply(this,arguments);
  try{
    const r=MG.room,me=uid3(),mine=(res.rows||[]).find(q=>q.u===me);
    if(r&&mine){
      stat('played');
      if(r.players&&r.players.length>=3)achieve('mesa');
      if(mine.w&&r.g==='volley')achieve('quadra');
      if(mine.w&&r.mode==='ai'&&r.diff==='pesadelo')achieve('gato');
      if(r.g==='voo'&&mine.s>=20)achieve('asas');
      if(r.g==='salto'&&mine.s>=2000)achieve('ascensao');
    }
  }catch(e){console.warn('[T15] conquistas',e)}
  return out;
};
/* conta cliques e toques dentro dos jogos */
document.addEventListener('pointerdown',e=>{if(MG.view==='game'&&e.target&&(e.target.id==='mgCv'||e.target.closest?.('#mgPad')))stat('clicks')},true);
/* o contexto de cada jogo ganha achieve() e stat() */
const _msl15=mgStartLocal;
mgStartLocal=function(room,seed,t0){const out=_msl15.apply(this,arguments);if(MG.C){MG.C.achieve=achieve;MG.C.stat=stat}return out};

/* ===================== hub do Arcade ===================== */
const MODE15={solo:'🎯 Solo',ai:'🤖 Contra o Perseus',pvp:'⚔ PvP 1v1',mesa:'👥 Mesa até 6'};
mgHub=function(){
  MG.view='hub';mgStop();mgTitle('🕹 Tulpa Arcade');arcLoad();
  const m=$('mgMain');if(!m)return;
  const b=boardGet(),ready=Object.entries(GAMES12).filter(([,g])=>g.status!=='soon'),soon=Object.entries(GAMES12).filter(([,g])=>g.status==='soon');
  const nAch=Object.keys(ACH).filter(k=>ARC.ach[k]).length;
  const card=([id,g])=>{const soonG=g.status==='soon',rec=b.rec[id];return`<article class="mg-card ${soonG?'soon':''}"><div class="mg-ico" aria-hidden="true">${g.ico}</div><div class="mg-txt"><h3>${g.name}${soonG?' <span class="mg-soon">Em breve</span>':''}</h3><p>${g.desc}</p>${rec?`<p class="mg-rec">🏆 Recorde de hoje: <b>${rec.s}</b> · ${esc(rec.n)}</p>`:''}</div><div class="mg-cbtn">${(g.modes||[]).map(md=>`<button type="button" class="btn small ${md==='mesa'||md==='pvp'?'primary':''}" data-arc="${id}|${md}" ${md==='solo'||md==='ai'?`data-solo="${id}"`:md==='mesa'?`data-multi="${id}"`:''} ${soonG?'aria-disabled="true"':''}>${md==='solo'&&g.solo?g.solo:md==='pvp'&&g.pvpLabel?g.pvpLabel:MODE15[md]}</button>`).join('')}</div></article>`};
  m.innerHTML=`<div class="mg-hub"><div class="mg-gdrow"><span>🎚 Dificuldade do jogo</span>${gdChips(gdGet(),'data-gd')}<button type="button" class="btn small mg-achbtn" id="mgAchBtn">🏆 Conquistas <b>${nAch}/${Object.keys(ACH).length}</b></button><span class="sub">Muda velocidade, física e desafios. A IA do Perseus tem a dificuldade dela, escolhida antes da partida.</span></div><div class="mg-games"><div class="mg-grid">${ready.map(card).join('')}</div>${soon.length?`<h3 class="mg-soonh">Em breve no Arcade</h3><div class="mg-grid">${soon.map(card).join('')}</div>`:''}</div><aside class="mg-side"><div id="mgRooms"></div><div class="mg-board" id="mgBoardHub"></div></aside></div>`;
  $$('[data-arc]',m).forEach(btn=>btn.onclick=()=>{
    const [id,md]=btn.dataset.arc.split('|'),g=GAMES12[id];
    if(g.status==='soon'){toast(`${g.ico} ${g.name}: em breve no Tulpa Arcade.`);return}
    if(md==='ai')mgDiffPick(id);else if(md==='solo')mgCreate(id,false);else mgCreate(id,md==='pvp'?'pvp':true);
  });
  $$('[data-gd]',m).forEach(x=>x.onclick=()=>{gdSet(x.dataset.gd);mgHub()});
  $('mgAchBtn').onclick=achOpen;
  roomsRender();boardRender();
};
/* convites em pilha: vários ao mesmo tempo */
mgInvShow=function(p){
  const g=GAMES12[p.g];if(!g||!arcOk12())return;
  let st=$('mgInvStack');if(!st){st=document.createElement('div');st.id='mgInvStack';st.className='mg-invstack';(document.fullscreenElement||document.body).append(st)}
  st.querySelector(`[data-inv="${CSS.escape(p.id)}"]`)?.remove();
  const d=document.createElement('div');d.className='mg-inv';d.dataset.inv=p.id;d.setAttribute('role','status');
  d.innerHTML=`<span>${g.ico} <b>${esc(String(p.hn||'Alguém').slice(0,32))}</b> chamou ${p.to?'você':'a mesa'} para <b>${g.name}</b>${p.pvp?' (PvP 1v1)':''}</span><span class="mg-lbtn"><button type="button" class="btn small primary">Aceitar Desafio</button><button type="button" class="btn small">Agora não</button></span>`;
  st.querySelectorAll('#mgInv,#mgInvOk,#mgInvNo').forEach(e=>e.removeAttribute('id'));d.id='mgInv';
  st.prepend(d);while(st.children.length>3)st.lastElementChild.remove();fx5('activate');
  const [ok,no]=d.querySelectorAll('button');ok.id='mgInvOk';no.id='mgInvNo';
  ok.onclick=()=>{st.innerHTML='';mgOpen();MG.rooms[p.id]=MG.rooms[p.id]||{r:{id:p.id,g:p.g,hn:p.hn,players:[],st:'lobby'},seen:Date.now()};mgJoinRoom(p.id)};
  no.onclick=()=>d.remove();
  setTimeout(()=>d.remove(),30000);
};

/* ===================================================================
   🎵 RITUAL RHYTHM — batalha de ritmo (estilo FNF)
   Frases alternadas: o adversário canta, depois é a sua vez. Setas sobem
   até os receptores no compasso de uma música gerada na hora (Web Audio).
   Acerto dá Essência; erro tira Lucidez. Lucidez zerada = colapso.
   No fim da música vence quem tem mais Essência.
   Solo contra o Perseus (IA com a dificuldade dele) ou PvP 1v1 pela rede.
   =================================================================== */
const SONGS15=[
  {n:'Vigília da Fé',el:4,bpm:100,root:60,scale:[0,2,4,7,9],prog:[0,7,9,5],col:['#2a2106','#5a4a12']},
  {n:'Raízes da Natureza',el:0,bpm:112,root:57,scale:[0,3,5,7,10],prog:[0,5,3,7],col:['#0c2416','#1f4a2c']},
  {n:'Espiral da Ilusão',el:2,bpm:124,root:62,scale:[0,2,3,7,8],prog:[0,8,3,7],col:['#22102e','#4b1f5e']},
  {n:'Eco da Inexistência',el:1,bpm:136,root:55,scale:[0,1,5,7,10],prog:[0,1,5,3],col:['#0b0a14','#2a2440']},
];
const LANE15=[{k:'←',a:Math.PI,c:'#c056d6'},{k:'↓',a:Math.PI/2,c:'#5aa7e8'},{k:'↑',a:-Math.PI/2,c:'#3fae5a'},{k:'→',a:0,c:'#e8b83c'}];
const KEYLANE15={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3,KeyA:0,KeyS:1,KeyW:2,KeyD:3};
const midi15=n=>440*Math.pow(2,(n-69)/12);
function rhythm(C){
  const W=800,H=450,RY=78,LX=[[96,156,216,276],[524,584,644,704]],SR=24,BARS=Math.max(4,Number(window.__rhBars)||32),PH=2;
  const rng=mb32(C.seed^0xA5A5);
  const song=SONGS15[C.seed%SONGS15.length],bpm=Math.round(song.bpm*gdPick(C.gd,[.9,1,1.1,1.22])),spb=60/bpm;
  const speed=gdPick(C.gd,[360,430,520,620]),lucMiss=gdPick(C.gd,[6,8,10,13]);
  const pvp=C.net,players=C.players;
  /* dono de cada frase: 0 = adversário/anfitrião começa, 1 = o outro */
  const owners=pvp?[players[0].u,players[1]?players[1].u:'~ai']:['~ai',C.me];
  const myIdx=owners.indexOf(C.me),oppU=owners[1-myIdx];
  const oppInfo=oppU==='~ai'?{n:'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n,c:-1}:(players.find(p=>p.u===oppU)||{n:'?',c:0});
  const meInfo=players.find(p=>p.u===C.me)||{n:'Você',c:0};
  /* gráfico: notas por compasso conforme a dificuldade */
  const den=gdPick(C.gd,[{sub:2,p:.55,dbl:0},{sub:2,p:.62,dbl:.04,s16:0},{sub:4,p:.42,dbl:.1},{sub:4,p:.6,dbl:.18}]);
  const notes=[];
  /* chamada e resposta (como no FNF): o primeiro canta uma frase e o outro repete o mesmo padrão.
     Os dois lados têm sempre as mesmas notas: quem toca perfeito nunca perde. */
  for(let bar=0;bar<BARS;bar++){
    const phrase=Math.floor(bar/PH);if(phrase%2)continue;
    for(let s=0;s<4*den.sub;s++){
      const onBeat=s%den.sub===0;if(!(rng()<(onBeat?Math.min(.95,den.p+.25):den.p)))continue;
      const t=(bar*4+s/den.sub)*spb,lane=Math.floor(rng()*4),deg=Math.floor(rng()*song.scale.length),off=PH*4*spb;
      notes.push({t,lane,owner:0,deg,j:null},{t:t+off,lane,owner:1,deg,j:null});
      if(rng()<den.dbl){const l2=(lane+1+Math.floor(rng()*3))%4;notes.push({t,lane:l2,owner:0,deg,j:null,dbl:true},{t:t+off,lane:l2,owner:1,deg,j:null,dbl:true})}
    }
  }
  notes.sort((a,b)=>a.t-b.t||a.lane-b.lane);notes.forEach((n,i)=>n.i=i);
  const END=BARS*4*spb+spb;
  const side=[{ess:0,luc:100,combo:0,max:0,hits:0,miss:0,pose:-1,poseT:0},{ess:0,luc:100,combo:0,max:0,hits:0,miss:0,pose:-1,poseT:0}];
  const ME=myIdx,OP=1-myIdx;
  const S={ac:null,start:0,sched:0,timer:0,end:false,pops:[],held:[0,0,0,0],flash:[0,0,0,0],lastSync:0,collapsed:-1,yv:null};
  const aiAcc=gdPick(C.diff,[.74,.87,.95,1]),aiPerf=gdPick(C.diff,[.35,.55,.75,.95]);
  /* ---------- música (Web Audio) ---------- */
  function sched(){
    const ac=S.ac;if(!ac||S.end)return;const now=ac.currentTime,ahead=now+.14;
    while(S.sched*spb/2+S.start<ahead){
      const k=S.sched,t=S.start+k*spb/2,beat=k/2,bar=Math.floor(beat/4),inBar=beat%4;
      if(t>=now-.02&&beat<BARS*4){
        const chord=song.root+song.prog[bar%song.prog.length];
        if(k%2===0){if(inBar===0||inBar===2){o5('sine',140,t,.16,{to:42,gain:.2,attack:.002,wet:.05});n5(t,.03,{freq:180,type:'lowpass',gain:.25,wet:.02})}
          else{n5(t,.12,{freq:1900,q:.8,gain:.16,wet:.25});o5('triangle',220,t,.06,{to:160,gain:.05,wet:.1})}
          o5('triangle',midi15(chord-24),t,spb*.85,{gain:.07,attack:.01,wet:.1})}
        n5(t,.025,{freq:8000,type:'highpass',gain:.05,wet:.05});
        if(inBar===0&&k%2===0){[0,4,7].forEach(iv=>o5('sine',midi15(chord+iv),t,spb*3.6,{gain:.022,attack:.08,wet:.6}))}
      }
      S.sched++;
    }
    /* melodia: cada nota do gráfico toca a sua altura na hora certa */
    notes.forEach(n=>{if(n.played)return;const t=S.start+n.t;if(t<ahead&&t>=now-.05){n.played=true;if(!n.dbl)o5(n.owner===0?'square':'sawtooth',midi15(song.root+12+song.scale[n.deg]+(n.lane>1?12:0)),t,spb*.42,{gain:n.owner===ME?.035:.028,attack:.004,wet:.35,detune:n.owner===0?-6:6})}});
  }
  function songT(){return S.ac?S.ac.currentTime-S.start:-9}
  /* ---------- julgamento ---------- */
  const JUD=[[.045,'PERFEITO!','#ffd36b',100,2],[.09,'BOM','#7dffa8',60,1],[.135,'OK','#7fe3ff',30,.5]];
  function judge(si,n,dt){
    const sd=side[si],j=JUD.find(x=>Math.abs(dt)<=x[0]);
    if(!j){n.j='miss';const lost=sd.combo;sd.combo=0;sd.miss++;sd.luc=Math.max(0,sd.luc-lucMiss);pop(si,'ERROU','#ff6b5b');if(si===ME){o5('sawtooth',90,S.ac.currentTime,.18,{to:60,gain:.05,wet:.1});C.fx?.shake(lost>=10?6:3,.18)}return}
    n.j=j[1];sd.combo++;sd.max=Math.max(sd.max,sd.combo);sd.hits++;sd.ess+=Math.round(j[3]*(1+Math.min(sd.combo,50)/50));sd.luc=Math.min(100,sd.luc+j[4]);
    sd.pose=n.lane;sd.poseT=performance.now();if(si===ME)S.flash[n.lane]=performance.now();
    pop(si,j[1],j[2]);
    if(si===ME&&C.fx){const lx=LX[si][n.lane];C.fx.burst(lx,RY,{n:j[0]<.05?12:6,kind:j[0]<.05?'star':'dot',col:[j[2],LANE15[n.lane].c,'#fff'],sp:j[0]<.05?190:120,life:.5,size:3,grav:120});
      if(sd.combo>0&&sd.combo%10===0){C.fx.float(400,190,`${sd.combo} COMBO!`,{col:'#ffd36b',size:30+Math.min(16,sd.combo/5),life:1.1});C.fx.shake(3,.15);if(sd.combo%25===0)C.fx.flash('#ffd36b',.2)}}
  }
  function pop(si,txt,col){S.pops.push({si,txt,col,t0:performance.now()});if(S.pops.length>8)S.pops.shift()}
  function press(lane){
    const t=songT();if(t<-.2||S.end)return;S.held[lane]=1;S.flash[lane]=performance.now();
    const n=notes.find(q=>q.owner===ME&&q.lane===lane&&!q.j&&Math.abs(q.t-t)<=.135);
    if(!n)return;   /* toque fora de nota: sem castigo */
    judge(ME,n,t-n.t);
    if(pvp)C.send('rh',{i:n.i,j:n.j});
  }
  function collapse(si){if(S.collapsed>=0)return;S.collapsed=si;finish()}
  function finish(){
    if(S.end)return;S.end=true;clearInterval(S.timer);
    try{if(S.yv!=null)YT6.player.setVolume(S.yv)}catch(e){}
    const me=side[ME],op=side[OP];
    if(S.collapsed<0&&me.miss===0&&me.hits>0)C.achieve?.('mente');
    if(S.collapsed!==ME)C.achieve?.('ritual1');
    if(pvp&&!C.host){C.send('rhfin',{ess:me.ess,luc:me.luc,miss:me.miss,max:me.max,col:S.collapsed===ME});return}
    if(pvp&&C.host){S.wait=Date.now();return}   /* espera o placar final do convidado (até 3 s) */
    done();
  }
  function done(){
    const me=side[ME],op=side[OP];
    let winSi=me.ess>=op.ess?ME:OP;if(S.collapsed===ME)winSi=OP;else if(S.collapsed===OP)winSi=ME;
    const rows=[{u:C.me,n:meInfo.n,c:meInfo.c,s:me.ess,w:winSi===ME},{u:oppU,n:oppInfo.n,c:oppInfo.c,s:op.ess,w:winSi===OP}];
    const why=S.collapsed>=0?` · ${S.collapsed===ME?meInfo.n:oppInfo.n} colapsou`:'';
    if(S.collapsed<0&&me.ess===op.ess){rows.forEach(r=>r.w=false);C.finish({title:'Empate na batalha de rituais · '+me.ess+' ⚗ cada',rows});return}
    C.finish({title:(winSi===ME?(pvp?'Vitória de '+meInfo.n:'Você venceu o Perseus!'):(pvp?'Vitória de '+oppInfo.n:'O Perseus venceu a batalha'))+why,rows});
    if(!pvp)C.say(winSi===ME?sayFmt(SAY12['humanWin_'+C.diff]||SAY12.humanWin):sayFmt(SAY12['aiWin_'+C.diff]||SAY12.aiWin),false);
  }
  /* IA: o Perseus canta as frases dele */
  function aiStep(t){
    notes.forEach(n=>{if(n.owner!==OP||n.j||oppU!=='~ai')return;
      if(n.ai==null){const r=rng();n.ai=r<aiAcc?(rng()<aiPerf?(rng()-.5)*.06:(rng()<.5?-1:1)*(.05+rng()*.07)):9}
      if(n.ai===9){if(t-n.t>.14)judge(OP,n,1);return}
      if(t>=n.t+n.ai)judge(OP,n,n.ai)});
  }
  return{
    st:()=>({side,notes,song,bpm,S,ME,OP}),
    key(code,down){const l=KEYLANE15[code];if(l==null)return;if(down)press(l);else S.held[l]=0},
    ptr(t,px,py){if(t==='up'){S.held=[0,0,0,0];return}if(t!=='down')return;
      /* toque: as quatro faixas do seu lado (ou a tela toda dividida em 4) */
      const xs=px>=W/2?LX[1]:[0,1,2,3].map(i=>W*(i+.5)/4);let best=0,bd=1e9;xs.forEach((x,i)=>{const d=Math.abs(px-x);if(d<bd){bd=d;best=i}});press(best)},
    step(dt){
      const now=Date.now();
      if(!S.ac&&now>=C.t0-1500){S.ac=actx();if(S.ac){S.start=S.ac.currentTime+Math.max(0,(C.t0-now)/1000)+spb*2;S.timer=setInterval(sched,25);try{S.yv=YT6.player.getVolume();YT6.player.setVolume(Math.min(S.yv,8))}catch(e){S.yv=null}}}
      if(!S.ac||S.end){if(S.wait&&(Date.now()-S.wait>3000||S.gotFin)){S.wait=0;done()}return}
      const t=songT();
      if(!pvp)aiStep(t);
      notes.forEach(n=>{if(n.owner===ME&&!n.j&&t-n.t>.135)judge(ME,n,1)});
      if(pvp&&now-S.lastSync>400){S.lastSync=now;C.send('rhs',{ess:side[ME].ess,luc:side[ME].luc,combo:side[ME].combo})}
      if(side[ME].max>=60)C.achieve?.('combo');
      if(side[ME].luc<=0)collapse(ME);else if(!pvp&&side[OP].luc<=0)collapse(OP);
      if(t>END)finish();
      const ph=Math.floor(Math.max(0,t)/(spb*4*PH))%2;
      C.hud(`🎵 <b>${esc(song.n)}</b> · ${bpm} BPM · ${t<0?'prepare-se':ph===ME?'<b style="color:#ffd36b">sua vez</b>':'vez de '+esc(oppInfo.n)} · combo ${side[ME].combo}`);
    },
    msg(p){
      if(p.t==='rh'&&p.from===oppU){const n=notes[p.i|0];if(n&&n.owner===OP&&!n.j){const dt=p.j==='PERFEITO!'?0:p.j==='BOM'?.07:p.j==='OK'?.12:1;judge(OP,n,dt)}}
      if(p.t==='rhs'&&p.from===oppU){const o=side[OP];o.ess=Math.max(o.ess,Number(p.ess)||0);o.luc=Math.max(0,Math.min(100,Number(p.luc)));if(o.luc<=0)collapse(OP)}
      if(p.t==='rhfin'&&C.host&&p.from===oppU){const o=side[OP];o.ess=Number(p.ess)||o.ess;o.luc=Number(p.luc);if(p.col)S.collapsed=S.collapsed<0?OP:S.collapsed;S.gotFin=true}
    },
    left(u){if(u===oppU&&!S.end){side[OP].luc=0;collapse(OP)}},
    end(){S.end=true;clearInterval(S.timer);try{if(S.yv!=null)YT6.player.setVolume(S.yv)}catch(e){}},
    draw(x){
      const now=performance.now(),t=songT(),beatK=t>0?(t/spb)%1:0,pulse=Math.pow(1-beatK,3);
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,song.col[0]);gr.addColorStop(1,song.col[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle=`rgba(255,255,255,${.04+pulse*.05})`;for(let i=0;i<30;i++)x.fillRect((i*131)%W,(i*67)%H,2,2);
      /* progresso */
      x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,0,W,4);x.fillStyle=EL12[song.el].c;x.fillRect(0,0,W*Math.max(0,Math.min(1,t/END)),4);
      const ph=Math.floor(Math.max(0,t)/(spb*4*PH))%2;
      for(let si=0;si<2;si++){
        const lx=LX[si===ME?1:0],active=ph===si&&t>=0,mine=si===ME;
        x.save();x.globalAlpha=active?1:.45;
        lx.forEach((cx,l)=>{const L=LANE15[l],fl=mine&&now-S.flash[l]<120;arrow(x,cx,RY,SR+(fl?3:0),L.a,fl?L.c:'rgba(255,255,255,.18)',fl?'#fff':L.c,2.5)});
        x.restore();
        notes.forEach(n=>{if(n.owner!==si||(n.j&&n.j!=='miss'))return;const y=RY+(n.t-t)*speed;if(y<-40||y>H+40)return;const L=LANE15[n.lane];x.save();x.globalAlpha=n.j==='miss'?.3:1;arrow(x,lx[n.lane],y,SR-2,L.a,L.c,'#fff',2);x.restore()});
      }
      /* personagens */
      const bob=pulse*6,po=(si,cx)=>{const sd=side[si],k=now-sd.poseT<220?sd.pose:-1,dx=k===0?-12:k===3?12:0,dy=k===1?8:k===2?-12:0;return[cx+dx,300-bob+dy]};
      const [ox,oy]=po(OP,180),[mx,my]=po(ME,620);
      mgCat(x,oppInfo.c,ox,oy,130,oppInfo.n,{flip:false});mgCat(x,meInfo.c,mx,my,130,meInfo.n,{flip:true,ring:true});
      /* barra de Lucidez de cada lado e Essência */
      [[OP,60],[ME,W-260]].forEach(([si,bx])=>{const sd=side[si];x.fillStyle='rgba(0,0,0,.45)';x.fillRect(bx,384,200,10);x.fillStyle=sd.luc>35?'#9b7bff':'#ff6b5b';x.fillRect(bx,384,2*sd.luc,10);x.font='700 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='left';x.textBaseline='bottom';x.fillStyle='#e9e1ff';x.fillText(`🧠 Lucidez ${Math.round(sd.luc)} · ⚗ ${sd.ess}`,bx,381)});
      /* cabo de guerra no centro */
      const me=side[ME].ess,op=side[OP].ess,share=me+op?me/(me+op):.5,bw=300,bx=W/2-bw/2,by=418,cut=bx+bw*(1-share);
      x.fillStyle=mgCol(oppInfo.c);x.fillRect(bx,by,cut-bx,12);x.fillStyle=mgCol(meInfo.c);x.fillRect(cut,by,bx+bw-cut,12);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(bx,by,bw,12);
      x.beginPath();x.arc(cut,by+6,9+pulse*3,0,7);x.fillStyle='#fff';x.fill();
      x.font='800 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='bottom';x.fillStyle='#fff';x.fillText(share>.55?'A batalha pende para você':share<.45?'A batalha pende para '+oppInfo.n:'Batalha equilibrada',W/2,by-3);
      /* frase atual */
      if(t>=0&&!S.end){x.font='800 16px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle=ph===ME?'#ffd36b':'#c9b8ff';x.fillText(ph===ME?'▶ SUA VEZ':'♪ '+oppInfo.n.split(' · ')[0]+' canta',W/2,150)}
      else if(t<0){x.font='800 40px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#fff';x.fillText(t<-spb*1.5?'Prepare-se':Math.ceil(-t/spb),W/2,200)}
      /* combo e avisos */
      if(side[ME].combo>=5){x.font='900 22px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#ffd36b';x.fillText(side[ME].combo+' combo',LX[1][1]+30,200)}
      S.pops=S.pops.filter(p=>now-p.t0<600);S.pops.forEach(p=>{const k=(now-p.t0)/600,cx=p.si===ME?LX[1][1]+30:LX[0][1]+30;x.save();x.globalAlpha=1-k;x.font='900 20px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle=p.col;x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=4;x.strokeText(p.txt,cx,RY+60-k*20);x.fillText(p.txt,cx,RY+60-k*20);x.restore()});
      x.font='600 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='right';x.textBaseline='top';x.fillStyle='rgba(255,255,255,.7)';x.fillText(`${song.n} · ${bpm} BPM`,W-10,10);
    }
  };
}
/* desenha uma seta (receptor ou nota) */
function arrow(x,cx,cy,r,ang,fill,stroke,lw){
  x.save();x.translate(cx,cy);x.rotate(ang);x.beginPath();x.moveTo(r,0);x.lineTo(r*.05,-r*.85);x.lineTo(r*.05,-r*.35);x.lineTo(-r*.85,-r*.35);x.lineTo(-r*.85,r*.35);x.lineTo(r*.05,r*.35);x.lineTo(r*.05,r*.85);x.closePath();
  x.fillStyle=fill;x.fill();x.lineWidth=lw;x.strokeStyle=stroke;x.stroke();x.restore();
}

/* ===================================================================
   🏛 DEFESA DO SANTUÁRIO — tower defense
   Traumas e Estados andam pelo caminho até o Santuário. Gaste Essência em
   Totens dos 5 Elementos. Clique num totem para melhorar ou vender.
   =================================================================== */
const TOT15={
  fe:{n:'Fé',g:'✶',c:'#e8b83c',cost:50,dmg:11,rate:.55,rng:2.6,info:'Dano constante num alvo.'},
  nat:{n:'Natureza',g:'🌿',c:'#3fae5a',cost:60,dmg:3,rate:.25,rng:2.1,slow:.45,info:'Raízes: deixa lento quem passa.'},
  ver:{n:'Verdade',g:'👁',c:'#5aa7e8',cost:70,dmg:6,rate:.7,rng:3,reveal:true,info:'Revela os invisíveis e acerta.'},
  ilu:{n:'Ilusão',g:'🌀',c:'#c056d6',cost:80,dmg:4,rate:2.2,rng:2.4,confuse:1.2,info:'Confunde: o alvo volta para trás.'},
  ine:{n:'Inexistência',g:'◐',c:'#8b6fd0',cost:120,dmg:60,rate:2.1,rng:4.2,info:'Golpe pesado e de longe.'},
};
const FOE15={
  ansioso:{n:'Ansioso',hp:30,sp:68,b:6,c:'#e8a23c',r:11},
  apavorado:{n:'Apavorado',hp:22,sp:112,b:7,c:'#f2d35b',r:10},
  enlouquecido:{n:'Enlouquecido',hp:85,sp:52,b:11,c:'#e0233b',r:14,wob:true},
  vazio:{n:'Vazio',hp:46,sp:76,b:10,c:'#6b4fa0',r:12,inv:true},
  colapso:{n:'Colapso',hp:620,sp:36,b:60,c:'#2a0a2e',r:22,boss:true,lives:5},
};
const MAPS15=[
  [[-1,1],[4,1],[4,5],[9,5],[9,2],[13,2],[13,6],[16,6]],
  [[-1,6],[3,6],[3,1],[8,1],[8,6],[12,6],[12,3],[16,3]],
  [[-1,3],[6,3],[6,0],[10,0],[10,7],[14,7],[14,2],[16,2]],
];
function sanctuary(C){
  const W=800,H=450,CS=50,COLS=16,ROWS=8,TB=400;
  const map=MAPS15[C.seed%MAPS15.length],pts=map.map(([c,r])=>[c*CS+CS/2,r*CS+CS/2]);
  const segs=[];for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];segs.push({ax,ay,bx,by,len:Math.hypot(bx-ax,by-ay)})}
  const LEN=segs.reduce((a,s)=>a+s.len,0);
  const road=new Set();map.forEach((p,i)=>{if(i===map.length-1)return;const [c0,r0]=p,[c1,r1]=map[i+1];for(let c=Math.min(c0,c1);c<=Math.max(c0,c1);c++)for(let r=Math.min(r0,r1);r<=Math.max(r0,r1);r++)road.add(c+','+r)});
  const WAVES=gdPick(C.gd,[10,12,15,18]),HPM=gdPick(C.gd,[.8,1,1.28,1.6]);
  const S={ess:gdPick(C.gd,[220,170,150,130]),vital:gdPick(C.gd,[25,20,15,10]),vital0:0,wave:0,foes:[],towers:[],shots:[],q:[],spawnT:0,sel:null,place:null,hover:null,fast:1,over:false,kills:0,built:new Set(),auto:false,msg:'',msgT:0,lost:0};
  S.vital0=S.vital;
  const posAt=d=>{let a=0;for(const s of segs){if(d<=a+s.len){const k=(d-a)/s.len;return[s.ax+(s.bx-s.ax)*k,s.ay+(s.by-s.ay)*k]}a+=s.len}const l=pts[pts.length-1];return[l[0],l[1]]};
  function waveList(w){
    const out=[],n=6+Math.floor(w*1.6),boss=(w+1)%5===0||w===WAVES-1;
    for(let i=0;i<n;i++){let k='ansioso';const r=hrand(C.seed,w,i);if(w>=2&&r<.28)k='apavorado';if(w>=3&&r>.78)k='enlouquecido';if(w>=4&&r>.58&&r<.74)k='vazio';out.push(k)}
    if(boss)out.push('colapso');return out;
  }
  function startWave(){if(S.wave>=WAVES||S.q.length||S.foes.length)return;S.q=waveList(S.wave);S.wave++;S.spawnT=0;msg(`Onda ${S.wave} de ${WAVES}`);fx5('round')}
  function msg(t){S.msg=t;S.msgT=performance.now()}
  const tcell=(px,py)=>[Math.floor(px/CS),Math.floor(py/CS)];
  const towerAt=(c,r)=>S.towers.find(t=>t.c===c&&t.r===r);
  const stats=t=>{const b=TOT15[t.k],m=1+(t.lv-1)*.55;return{dmg:b.dmg*m,rate:b.rate*(t.lv>2?.85:1),rng:b.rng*(1+(t.lv-1)*.12)*CS,slow:b.slow?Math.min(.7,b.slow+(t.lv-1)*.08):0,confuse:b.confuse?b.confuse+(t.lv-1)*.3:0,reveal:!!b.reveal}};
  const upCost=t=>Math.round(TOT15[t.k].cost*(t.lv===1?.8:1.25));
  function build(k,c,r){
    const b=TOT15[k];if(S.ess<b.cost){msg('Essência insuficiente.');fx5('error');return}
    if(c<0||r<0||c>=COLS||r>=ROWS||road.has(c+','+r)||towerAt(c,r)){msg('Não dá para construir aqui.');fx5('error');return}
    S.ess-=b.cost;S.towers.push({k,c,r,lv:1,cd:0,spent:b.cost,x:c*CS+CS/2,y:r*CS+CS/2,a:0});S.built.add(k);fx5('activate');
    if(S.built.size>=5)C.achieve?.('cinco');
  }
  function revealedAt(x,y){return S.towers.some(t=>TOT15[t.k].reveal&&Math.hypot(t.x-x,t.y-y)<=stats(t).rng)}
  function hit(f,dmg,t){f.hp-=dmg;f.flash=performance.now();if(f.hp<=0&&!f.dead){f.dead=true;S.kills++;S.ess+=FOE15[f.k].b;fx5(f.k==='colapso'?'mgWin':'mgCoin');
    if(C.fx){const [px,py]=posAt(f.d),big=f.k==='colapso';C.fx.burst(px,py,{n:big?36:12,kind:big?'star':'dot',col:big?['#ffd36b','#ff5a6e','#fff']:['#ffd36b','#c9b0ff','#fff'],sp:big?260:150,life:big?.9:.5,size:big?4:2.6,grav:big?200:300});C.fx.float(px,py-18,'+'+FOE15[f.k].b+' ⚗',{col:'#ffd36b',size:big?24:15,life:.7});if(big){C.fx.shake(8,.4);C.fx.flash('#ffd36b',.25)}}}}
  function sim(dt){
    if(S.over)return;
    if(S.q.length){S.spawnT-=dt;if(S.spawnT<=0){const k=S.q.shift(),d=FOE15[k],hp=d.hp*HPM*(1+(S.wave-1)*.17);S.foes.push({k,hp,max:hp,d:0,slow:0,conf:0,wob:Math.random()*6});S.spawnT=k==='colapso'?2:Math.max(.42,.95-S.wave*.03)}}
    S.foes.forEach(f=>{if(f.dead)return;const d=FOE15[f.k];let sp=d.sp*(f.slow>0?(1-f.slowK):1);if(d.wob)sp*=1+Math.sin(performance.now()/300+f.wob)*.35;
      f.slow=Math.max(0,f.slow-dt);f.slowK=f.slow>0?f.slowK:0;
      if(f.conf>0){f.conf-=dt;f.d=Math.max(0,f.d-sp*.6*dt)}else f.d+=sp*dt;
      if(f.d>=LEN){f.dead=true;f.out=true;const L=d.lives||1;S.vital-=L;S.lost+=L;fx5('fumble');msg(`${d.n} chegou ao Santuário: −${L} Vital`);C.fx?.shake(6+L*2,.35);C.fx?.flash('#e0233b',.25);const [px,py]=posAt(LEN);C.fx?.float(px,py-20,`−${L} ❤`,{col:'#ff6b6b',size:24})}});
    S.towers.forEach(t=>{const st=stats(t),b=TOT15[t.k];t.cd-=dt;
      if(b.slow){S.foes.forEach(f=>{if(f.dead)return;const [x,y]=posAt(f.d);if(Math.hypot(x-t.x,y-t.y)<=st.rng){f.slow=.3;f.slowK=Math.max(f.slowK||0,st.slow);hit(f,st.dmg*dt*4,t)}});return}
      if(t.cd>0)return;
      let tgt=null,best=-1;S.foes.forEach(f=>{if(f.dead)return;const [x,y]=posAt(f.d);if(FOE15[f.k].inv&&!revealedAt(x,y))return;if(Math.hypot(x-t.x,y-t.y)<=st.rng&&f.d>best){best=f.d;tgt=f}});
      if(!tgt)return;t.cd=st.rate;const [x,y]=posAt(tgt.d);t.a=Math.atan2(y-t.y,x-t.x);
      S.shots.push({x0:t.x,y0:t.y,x1:x,y1:y,c:b.c,t0:performance.now(),big:t.k==='ine'});
      hit(tgt,st.dmg,t);if(st.confuse&&!FOE15[tgt.k].boss)tgt.conf=st.confuse;
    });
    S.foes=S.foes.filter(f=>!f.dead);
    if(!S.q.length&&!S.foes.length&&S.wave>0&&!S.betweenPaid){S.betweenPaid=S.wave;const bonus=20+S.wave*4;S.ess+=bonus;msg(`Onda ${S.wave} vencida! +${bonus} ⚗`);C.fx?.float(400,200,`ONDA ${S.wave} VENCIDA! +${bonus} ⚗`,{col:'#ffd36b',size:30,life:1.5});if(S.wave>=WAVES){win();return}if(S.auto)S.autoT=1.5}
    if(S.autoT>0&&!S.q.length&&!S.foes.length){S.autoT-=dt;if(S.autoT<=0)startWave()}
    if(S.q.length)S.betweenPaid=0;
    if(S.vital<=0){S.vital=0;lose()}
  }
  function end(won){S.over=true;const score=S.wave*100+S.vital*10+S.kills;C.finish({title:won?`O Santuário resistiu às ${WAVES} ondas!`:`O Santuário caiu na onda ${S.wave}`,rows:[{u:C.me,n:(C.players[0]||{}).n||'Você',c:(C.players[0]||{}).c||0,s:score,w:won}]})}
  function win(){C.achieve?.('guardiao');if(C.gd==='pesadelo'&&S.lost===0)C.achieve?.('inabalavel');C.say('Hm. O Santuário de pé. Admito: foi elegante.',false);end(true)}
  function lose(){C.say('Os Traumas venceram. Eles sempre voltam, sabia?',false);end(false)}
  /* barra de baixo: 5 totens + onda + velocidade */
  const KEYS=Object.keys(TOT15),BTN=k=>({x:8+KEYS.indexOf(k)*104,y:TB+6,w:98,h:38});
  const B_WAVE={x:W-196,y:TB+6,w:100,h:38},B_FAST={x:W-90,y:TB+6,w:82,h:38};
  const inB=(b,px,py)=>px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h;
  function panel(){const t=S.sel;if(!t)return null;const x0=clamp12(t.x-90,4,W-184),y0=t.y>200?t.y-118:t.y+30;return{x:x0,y:y0,w:180,h:88,up:{x:x0+8,y:y0+50,w:80,h:30},sell:{x:x0+92,y:y0+50,w:80,h:30}}}
  return{
    st:()=>S,
    key(code,down){if(!down)return;const i=['Digit1','Digit2','Digit3','Digit4','Digit5'].indexOf(code);if(i>=0){S.place=KEYS[i];S.sel=null;return}
      if(code==='Space'){startWave();return}if(code==='KeyU'&&S.sel)this.upgrade();if(code==='KeyX'&&S.sel)this.sell();if(code==='KeyQ'){S.place=null;S.sel=null}},
    upgrade(){const t=S.sel;if(!t)return;if(t.lv>=3){msg('Totem no nível máximo.');return}const c=upCost(t);if(S.ess<c){msg('Essência insuficiente.');fx5('error');return}S.ess-=c;t.spent+=c;t.lv++;fx5('activate');msg(`${TOT15[t.k].n} nível ${t.lv}`)},
    sell(){const t=S.sel;if(!t)return;const v=Math.round(t.spent*.6);S.ess+=v;S.towers=S.towers.filter(q=>q!==t);S.sel=null;fx5('click');msg(`Totem vendido: +${v} ⚗`)},
    build,startWave,
    ptr(type,px,py){
      if(type==='move'){S.hover=[px,py];return}if(type!=='down')return;S.hover=[px,py];
      if(py>=TB){for(const k of KEYS)if(inB(BTN(k),px,py)){S.place=S.place===k?null:k;S.sel=null;return}
        if(inB(B_WAVE,px,py)){if(!S.q.length&&!S.foes.length)startWave();else{S.auto=!S.auto;msg(S.auto?'Ondas automáticas ligadas':'Ondas automáticas desligadas')}return}
        if(inB(B_FAST,px,py)){S.fast=S.fast===1?2:S.fast===2?3:1;return}return}
      const p=panel();if(p){if(inB(p.up,px,py)){this.upgrade();return}if(inB(p.sell,px,py)){this.sell();return}}
      const [c,r]=tcell(px,py),t=towerAt(c,r);
      if(t){S.sel=S.sel===t?null:t;S.place=null;return}
      if(S.place){build(S.place,c,r);return}
      S.sel=null;
    },
    step(dt){if(Date.now()<C.t0||S.over)return;const n=S.fast;for(let i=0;i<n;i++)sim(dt);
      C.hud(`❤ Vital <b>${S.vital}</b> · ⚗ <b>${S.ess}</b> Essência · Onda <b>${S.wave}</b>/${WAVES}${S.wave===0?' · coloque totens e aperte ▶':''}`)},
    draw(x){
      const now=performance.now();
      x.fillStyle='#16121c';x.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const rd=road.has(c+','+r);x.fillStyle=rd?'#3a2d22':((c+r)%2?'#1e2a20':'#1b261d');x.fillRect(c*CS,r*CS,CS,CS)}
      x.strokeStyle='rgba(217,203,176,.25)';x.lineWidth=2;x.setLineDash([8,10]);x.beginPath();pts.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.stroke();x.setLineDash([]);
      /* Santuário */
      const [ex,ey]=pts[pts.length-1];x.save();x.shadowColor='#ffd36b';x.shadowBlur=20;x.fillStyle='#ffd36b';x.beginPath();x.moveTo(ex-14,ey+18);x.lineTo(ex-14,ey-6);x.lineTo(ex,ey-20);x.lineTo(ex+14,ey-6);x.lineTo(ex+14,ey+18);x.closePath();x.fill();x.restore();
      /* totens */
      S.towers.forEach(t=>{const b=TOT15[t.k],st=stats(t);if(S.sel===t||S.place===t.k&&S.hover){x.beginPath();x.arc(t.x,t.y,st.rng,0,7);x.fillStyle=b.c+'14';x.fill();x.strokeStyle=b.c+'88';x.stroke()}
        x.beginPath();x.arc(t.x,t.y,18,0,7);x.fillStyle='#120d18';x.fill();x.lineWidth=3;x.strokeStyle=b.c;x.stroke();
        x.font='20px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(b.g,t.x,t.y+1);
        for(let i=0;i<t.lv;i++){x.beginPath();x.arc(t.x-8+i*8,t.y+22,2.6,0,7);x.fillStyle='#ffd36b';x.fill()}});
      /* inimigos */
      S.foes.forEach(f=>{const d=FOE15[f.k],[px,py]=posAt(f.d),vis=!d.inv||revealedAt(px,py);
        x.save();x.globalAlpha=vis?1:.18;x.beginPath();x.arc(px,py,d.r,0,7);x.fillStyle=now-(f.flash||0)<80?'#fff':d.c;x.fill();if(d.boss){x.lineWidth=3;x.strokeStyle='#c33cff';x.stroke()}
        if(f.conf>0){x.font='12px system-ui';x.fillText('🌀',px,py-d.r-8)}if(f.slow>0){x.strokeStyle='#3fae5a';x.lineWidth=2;x.beginPath();x.arc(px,py,d.r+3,0,7);x.stroke()}
        x.restore();if(vis){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(px-14,py-d.r-7,28,4);x.fillStyle='#7dffa8';x.fillRect(px-14,py-d.r-7,28*Math.max(0,f.hp/f.max),4)}});
      /* tiros */
      S.shots=S.shots.filter(s=>now-s.t0<160);S.shots.forEach(s=>{x.save();x.globalAlpha=1-(now-s.t0)/160;x.strokeStyle=s.c;x.lineWidth=s.big?5:2.5;x.shadowColor=s.c;x.shadowBlur=10;x.beginPath();x.moveTo(s.x0,s.y0);x.lineTo(s.x1,s.y1);x.stroke();x.restore()});
      /* prévia de construção */
      if(S.place&&S.hover&&S.hover[1]<TB){const [c,r]=tcell(...S.hover),ok=!road.has(c+','+r)&&!towerAt(c,r)&&S.ess>=TOT15[S.place].cost,b=TOT15[S.place];
        x.fillStyle=ok?'rgba(125,255,168,.18)':'rgba(255,107,91,.22)';x.fillRect(c*CS,r*CS,CS,CS);x.beginPath();x.arc(c*CS+CS/2,r*CS+CS/2,b.rng*CS,0,7);x.strokeStyle=b.c+'aa';x.stroke()}
      /* painel do totem */
      const p=panel();if(p){const t=S.sel,b=TOT15[t.k];x.fillStyle='rgba(18,13,24,.95)';x.strokeStyle=b.c;x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(p.x,p.y,p.w,p.h,10):x.rect(p.x,p.y,p.w,p.h);x.fill();x.stroke();
        x.font='700 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='left';x.textBaseline='top';x.fillStyle='#fff';x.fillText(`${b.g} ${b.n} · nível ${t.lv}`,p.x+10,p.y+8);x.font='12px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#cfc3b0';x.fillText(b.info,p.x+10,p.y+28);
        [[p.up,t.lv>=3?'Máximo':`⬆ ${upCost(t)} ⚗`,t.lv<3&&S.ess>=upCost(t)],[p.sell,`Vender +${Math.round(t.spent*.6)}`,true]].forEach(([bb,l,on])=>{x.fillStyle=on?'#3a2c22':'#2a2420';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.strokeStyle='#6b5a44';x.strokeRect(bb.x,bb.y,bb.w,bb.h);x.fillStyle=on?'#f4ead6':'#7a6a58';x.textAlign='center';x.textBaseline='middle';x.fillText(l,bb.x+bb.w/2,bb.y+bb.h/2)})}
      /* barra de baixo */
      x.fillStyle='#0f0b14';x.fillRect(0,TB,W,H-TB);
      KEYS.forEach((k,i)=>{const b=TOT15[k],bb=BTN(k),on=S.place===k,can=S.ess>=b.cost;x.fillStyle=on?b.c+'55':'#1d1726';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.lineWidth=on?2.5:1;x.strokeStyle=on?b.c:'#3b3048';x.strokeRect(bb.x,bb.y,bb.w,bb.h);
        x.font='18px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='left';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(b.g,bb.x+6,bb.y+19);
        x.font='700 12px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle=can?'#f4ead6':'#7a6a58';x.fillText(`${i+1} ${b.n}`,bb.x+30,bb.y+12);x.fillStyle=can?'#ffd36b':'#7a6a58';x.fillText(`${b.cost} ⚗`,bb.x+30,bb.y+27)});
      const busy=S.q.length||S.foes.length;
      [[B_WAVE,busy?(S.auto?'⏯ Auto: on':'⏯ Auto: off'):'▶ Onda '+Math.min(WAVES,S.wave+1)],[B_FAST,'⏩ x'+S.fast]].forEach(([bb,l])=>{x.fillStyle='#2b1f10';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.strokeRect(bb.x,bb.y,bb.w,bb.h);x.font='800 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffd36b';x.fillText(l,bb.x+bb.w/2,bb.y+bb.h/2)});
      /* aviso */
      if(S.msg&&now-S.msgT<2200){x.save();x.globalAlpha=Math.min(1,(2200-(now-S.msgT))/400);x.font='800 18px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=4;x.strokeText(S.msg,W/2,16);x.fillText(S.msg,W/2,16);x.restore()}
      x.font='700 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='right';x.textBaseline='top';x.fillStyle='#ffb3a8';x.fillText(`❤ ${S.vital}`,W-12,10);x.fillStyle='#ffd36b';x.fillText(`⚗ ${S.ess}`,W-12,28);
    }
  };
}

/* ---------- registro dos jogos ---------- */
defineArcadeGame('rhythm',{name:'Ritual Rhythm',short:'Rhythm',ico:'🎵',modes:['ai','pvp'],max:2,rec:true,unit:'⚗',W:800,H:450,pad:'rh4',
  desc:'Batalha de rituais no compasso. Acertos dão Essência, erros tiram Lucidez. A barra pende para quem canta melhor.',
  rule:'PvP 1v1: as frases se alternam entre os dois. Vence quem tiver mais Essência no fim (ou quem não colapsar).',
  keys:'Setas ← ↓ ↑ → (ou A S W D) no compasso',touch:'',make:rhythm});
defineArcadeGame('santuario',{name:'Defesa do Santuário',short:'Defesa',ico:'🏛',modes:['solo'],max:1,rec:true,unit:'pts',W:800,H:450,pad:'td',solo:'🎯 Solo',
  desc:'Traumas e Estados marcham até o Santuário. Gaste Essência em Totens dos 5 Elementos.',
  keys:'Clique no totem embaixo e depois no mapa · 1-5 escolhem · Espaço chama a onda · U melhora · X vende',touch:'Toque no totem embaixo e depois no mapa · toque num totem para melhorar ou vender',make:sanctuary});
/* os próximos jogos do documento: só a vitrine por enquanto */
[
  ['fuga','Fuga Além do Véu','🌀','Auto-runner rítmico: um toque pula ou inverte a gravidade no compasso.',['solo','mesa']],
  ['uno','UNO Teosófico','🃏','Cartas dos 5 Elementos. +2 e +4 tiram Lucidez de quem vem depois.',['mesa']],
  ['doom','DOOM: Colapso Mental','💀','FPS pseudo-3D por raycasting contra Perseus Corrompidos em labirintos.',['solo']],
  ['julgamento','Julgamento da Essência','❤️','Bullet hell no estilo Undertale: desvie dos ataques das Trilhas.',['solo','pvp']],
  ['poco','Poço das Almas','🔵','Física de pinos: limpe o poço com o menor número de esferas.',['solo','pvp']],
  ['clicker','Teosofia Clicker','📖','Clique no tomo sagrado e compre Suturas, Cultistas e Tulpas que geram Essência.',['solo']],
  ['corrida','Corrida do Véu','🏎','Corrida vista de cima com Caixas de Rituais: fumaça, raízes e atalhos.',['mesa']],
  ['rinha','Rinha de Tulpas','🥊','Luta 2D: pulo, defesa, ataque e um especial de Inexistência.',['pvp']],
  ['trono','O Trono do Mestre','👑','Deslize as cartas: equilibre Mestre, Jogadores, Vital e Lucidez.',['solo']],
  ['vazio','Salto para o Vazio','🧱','Plataforma hardcore: wall-jump e respawn instantâneo.',['solo','mesa']],
  ['abismo','O Labirinto do Abismo','🗝','Twin-stick em salas procedurais com mutações teosóficas.',['solo','pvp']],
].forEach(([id,name,ico,desc,modes])=>defineArcadeGame(id,{name,ico,desc,modes,status:'soon'}));
T3.arcGames=GAMES12;


