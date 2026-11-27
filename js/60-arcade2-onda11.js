/* ===================================================================
   TULPA · ETAPA 58 — 🕹 ARCADE 2.0 · ONDA 11 (parte 1)
   🧠 ECO DA MEMÓRIA 2.0
   Jornada das 6 Câmaras com regras próprias: Clara, Veloz, Espelho
   (de trás para frente), Giratória (os Elementos trocam de lugar),
   Intruso (luzes falsas) e Verdade (tudo junto). 3 Ecos (vidas) na
   Jornada, dica 👁 Revelação, bônus Relâmpago por responder rápido,
   teclas 1–5. Na mesa, o anfitrião escolhe a regra.
   =================================================================== */
const ECCH58=[{n:'Câmara Clara',ico:'🕯',d:'A Memória como ela é.',goal:8,tw:'cls'},
  {n:'Câmara Veloz',ico:'⚡',d:'A sequência corre bem mais rápido.',goal:8,tw:'cls',sp:.66},
  {n:'Câmara Espelho',ico:'🪞',d:'Repita de trás para frente.',goal:7,tw:'esp'},
  {n:'Câmara Giratória',ico:'🌀',d:'Depois de mostrar, os Elementos trocam de lugar.',goal:7,tw:'gir'},
  {n:'Câmara do Intruso',ico:'🎭',d:'Luzes falsas, cinzentas, aparecem no meio: ignore.',goal:7,tw:'int'},
  {n:'Câmara da Verdade',ico:'👁',d:'Tudo junto: giro, intrusos e espelho nas rodadas ímpares.',goal:8,tw:'all'}];
const ECTW58={cls:['Clássico','🧠','A sequência de sempre.'],esp:['Espelho','🪞','Repita de trás para frente.'],gir:['Giratório','🌀','Os Elementos trocam de lugar.'],int:['Intruso','🎭','Luzes falsas no meio.']};
function ecProg58(){const p=prog38().ec||{};return{ch:p.ch||{},best:p.best||0}}
const ecOpen58=i=>i===0||!!ecProg58().ch[i-1];
const ecSetup58={
  intro:o=>o._m==='mesa'?'Todos veem a mesma sequência. Quem errar sai; o último de pé vence.':o.m==='jor'?'6 Câmaras, cada uma com uma regra. Você tem 3 Ecos: errar gasta um e repete a rodada.':'A Memória clássica: um erro e acabou. Até onde você vai?',
  def:()=>({m:'cls',ch:'0',tw:'cls'}),
  fields:o=>{const p=ecProg58();if(o._m==='mesa')return[{k:'tw',l:'Regra',wide:1,opts:Object.entries(ECTW58).map(([v,t])=>({v,n:t[0],ico:t[1],d:t[2]}))}];
    const F=[{k:'m',l:'Modo',opts:[{v:'cls',n:'Clássico',ico:'🧠',d:'Infinito, sem segunda chance.',badge:p.best?`🏆 ${p.best}`:''},{v:'jor',n:'Jornada',ico:'🏛',d:'6 Câmaras com regras próprias.',badge:`${Object.keys(p.ch).length}/6`}]}];
    if(o.m==='jor')F.push({k:'ch',l:'Câmara',wide:1,opts:ECCH58.map((c,i)=>{const lock=!ecOpen58(i),st=p.ch[i]||0;return{v:String(i),n:`${i+1}. ${c.n}`,ico:c.ico,d:lock?'Vença a Câmara anterior.':`${c.d} Meta: ${c.goal} rodadas.`,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});return F},
  fix:o=>{if(!ECTW58[o.tw])o.tw='cls';if(o._m==='mesa')return;if(!['cls','jor'].includes(o.m))o.m='cls';let i=Math.max(0,Math.min(5,+o.ch||0));while(i>0&&!ecOpen58(i))i--;o.ch=String(i)},
  sum:()=>'Clique ou toque nos Elementos, ou use as teclas 1 a 5 (a partir do topo, no sentido do relógio) · H usa a Revelação.'
};

/* arte procedural do Eco: uma Câmara por regra, altar com o pentagrama (só visual) */
function ecArt58(key){
  const G=window.GFX60,W=480,H=560,CX=240,CY=300,RR=150,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const TH={cls:{acc:'#c9a8ff',top:'#1e1338',bot:'#0b0714',stone:'#43335e',flame:'#ffb35a',amb:'motes'},
    vel:{acc:'#ff9a4a',top:'#321208',bot:'#100604',stone:'#5a3022',flame:'#ff7a2a',amb:'brasas'},
    esp:{acc:'#9ad8ff',top:'#0e2238',bot:'#050a14',stone:'#2e4660',flame:'#bfe8ff',amb:'neve'},
    gir:{acc:'#5ae0c8',top:'#072825',bot:'#030d10',stone:'#1f504a',flame:'#7dffd8',amb:'motes'},
    int:{acc:'#ff7a98',top:'#2a0a1e',bot:'#0c0309',stone:'#4a2036',flame:'#ff9a6a',amb:'poeira'},
    all:{acc:'#ffd36b',top:'#2a1e0a',bot:'#0e0a04',stone:'#4c3e1e',flame:'#ffd36b',amb:'motes'}}[key]||null;
  const T=TH||{acc:'#c9a8ff',top:'#1e1338',bot:'#0b0714',stone:'#43335e',flame:'#ffb35a',amb:'motes'};
  const slot=i=>{const a=-Math.PI/2+i*TAU/5;return[CX+Math.cos(a)*RR,CY+Math.sin(a)*RR]};
  const CANDLES=[[26,138],[454,138],[30,446],[450,446]];

  const bg=()=>G.bake('ec:bg:'+key,W,H,(g,w,h,r)=>{
    g.fillStyle=lg(g,0,0,0,h,T.top,T.bot);g.fillRect(0,0,w,h);
    G.fillTile(g,G.tile('tijolo',{size:96,a:T.stone,b:T.bot,seed:5}),0,0,w,h,{alpha:.34});
    g.fillStyle=rg(g,CX,CY,60,340,'rgba(0,0,0,0)','rgba(0,0,0,.6)');g.fillRect(0,0,w,h);
    if(key==='vel')for(let i=0;i<46;i++){const Y=r()*h,X=r()<.5?r()*70:w-r()*70-30;line(g,[[X,Y],[X+18+r()*40,Y-3]],G.rgba('#ffb060',.14+r()*.26),1+r()*1.5)}
    if(key==='esp')[[22,1],[458,-1]].forEach(([X])=>{box(g,X-20,168,40,210,'#6a88a8',20);box(g,X-15,173,30,200,lg(g,X-15,170,X+15,370,'#d8f2ff','#3a6a90','#102438'),15);line(g,[[X-9,230],[X+7,196]],'rgba(255,255,255,.75)',3);line(g,[[X-9,262],[X+11,220]],'rgba(255,255,255,.35)',2)});
    if(key==='int')[[0,1],[w,-1]].forEach(([X,s])=>{for(let k=0;k<4;k++){g.fillStyle=lg(g,X+s*k*13,0,X+s*(k+1)*15,0,'#7a1030','#3a0618','#120208');g.beginPath();g.moveTo(X+s*k*13,0);g.lineTo(X+s*(k*13+17),0);g.quadraticCurveTo(X+s*(k*13+34-k*5),260,X+s*(k*13+8),h);g.lineTo(X+s*k*8,h);g.closePath();g.fill()}box(g,s>0?0:w-46,262,46,9,'#d8a84a',3)});
    /* altar */
    disc(g,CX,CY+8,214,'rgba(0,0,0,.45)');disc(g,CX,CY,212,rg(g,CX-50,CY-60,20,260,G.shade(T.stone,.08),G.shade(T.stone,-.45),G.shade(T.stone,-.72)));
    g.save();g.beginPath();g.arc(CX,CY,206,0,TAU);g.clip();G.fillTile(g,G.tile('pedra',{size:72,a:T.stone,b:T.bot,seed:9}),0,0,w,h,{alpha:.24});g.restore();
    ring(g,CX,CY,211,G.rgba(T.acc,.4),2);ring(g,CX,CY,203,'rgba(0,0,0,.5)',3);ring(g,CX,CY,RR+62,G.rgba(T.acc,.2),1);ring(g,CX,CY,RR,G.rgba(T.acc,.3),1.5);ring(g,CX,CY,66,G.rgba(T.acc,.35),1.5);
    for(let i=0;i<40;i++){const a=i*TAU/40,R=207,u=CX+Math.cos(a)*R,v=CY+Math.sin(a)*R;g.save();g.translate(u,v);g.rotate(a);line(g,[[-3,-3],[3,r()*4-2],[-2,3+r()*2]],G.rgba(T.acc,.4),1);g.restore()}
    if(key==='gir')for(let k=0;k<5;k++){g.strokeStyle='rgba(120,255,220,.16)';g.lineWidth=5;g.beginPath();for(let i=0;i<=40;i++){const a=k*TAU/5+i*.062,R=66+i*3.2;i?g.lineTo(CX+Math.cos(a)*R,CY+Math.sin(a)*R):g.moveTo(CX+Math.cos(a)*R,CY+Math.sin(a)*R)}g.stroke()}
    if(key==='all')for(let i=0;i<20;i++){const a=i*TAU/20;G.poly(g,[[CX+Math.cos(a-.03)*70,CY+Math.sin(a-.03)*70],[CX+Math.cos(a)*(i%2?118:140),CY+Math.sin(a)*(i%2?118:140)],[CX+Math.cos(a+.03)*70,CY+Math.sin(a+.03)*70]],'rgba(255,211,107,.12)')}
    const star=[0,2,4,1,3,0].map(slot);line(g,star,'rgba(0,0,0,.55)',6);line(g,star,G.rgba(T.acc,.32),2);
    for(let i=0;i<5;i++){const[u,v]=slot(i);disc(g,u,v+7,58,'rgba(0,0,0,.4)')}
    /* velas */
    CANDLES.forEach(([X,Y])=>{ell(g,X,Y+32,17,6,'rgba(0,0,0,.5)');ell(g,X,Y+29,15,5,'#8a6a3a');box(g,X-6,Y,12,28,lg(g,X-6,0,X+6,0,'#f4e8c8','#a89878'),2);ell(g,X,Y,6,2.4,'#fff4d8');box(g,X-6,Y+2,3,9,'#fff4d8',1);line(g,[[X,Y-1],[X,Y-5]],'#2a1a10',1.5)})},{s:2});

  /* medalhão de um Elemento: apagado, aceso ou luz falsa */
  const pad=(i,st)=>G.bake(`ec:pad:${i}:${st}`,124,124,g=>{const C=62,c=EL12[i].c,lit=st==='lit',fake=st==='fake';
    disc(g,C,C,52,lg(g,0,C-52,0,C+52,fake?'#c8c6d0':lit?G.shade(c,.55):'#6a6078',fake?'#4a4854':lit?G.shade(c,-.2):'#1a1424'));
    disc(g,C,C,45,fake?'#2a2830':'#100a18');
    disc(g,C,C,42,fake?rg(g,C-12,C-16,4,56,'#a8a6b0','#6d6a75','#34323c'):lit?rg(g,C-8,C-10,2,48,'#ffffff',G.shade(c,.45),c,G.shade(c,-.2)):rg(g,C-14,C-18,4,60,G.shade(c,-.12),G.shade(c,-.48),G.shade(c,-.72)));
    if(!lit&&!fake)ring(g,C,C,42,c,3);
    for(let k=0;k<10;k++){const a=k*TAU/10;disc(g,C+Math.cos(a)*48.5,C+Math.sin(a)*48.5,1.8,fake?'#e0dee8':lit?'#ffffff':G.shade(c,.15))}
    if(fake){g.setLineDash([8,7]);ring(g,C,C,36,'#f0eef8',3.5);g.setLineDash([]);g.font='900 40px "IBM Plex Sans",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='#1a1820';g.strokeText('?',C,C+2);g.fillStyle='#ffffff';g.fillText('?',C,C+2)}
    else{G.icon(g,G.sigils[i],C+1.5,C+2.5,44,lit?G.shade(c,-.65):'rgba(0,0,0,.6)');G.icon(g,G.sigils[i],C,C,44,lit?'#ffffff':G.shade(c,.55))}
    g.strokeStyle='rgba(255,255,255,'+(lit?.75:.28)+')';g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(C,C,37,Math.PI*1.12,Math.PI*1.4);g.stroke()},{s:2});
  const eye=(on)=>G.bake('ec:eye:'+on,64,64,g=>{disc(g,32,32,28,lg(g,0,4,0,60,on?'#7a58c0':'#4a4458','#1a1028'));ring(g,32,32,28,on?'#e2d2ff':'#7a7488',2.5);ring(g,32,32,22,'rgba(255,255,255,.18)',1);G.icon(g,'olho',32,32,34,on?'#ffffff':'#a8a2b4')},{s:2});
  const pedestal=()=>G.bake('ec:ped',130,60,g=>{ell(g,65,38,60,18,'rgba(0,0,0,.5)');ell(g,65,32,54,16,lg(g,0,16,0,48,G.shade(T.stone,.2),G.shade(T.stone,-.5)));ell(g,65,27,46,12,G.shade(T.stone,-.2));g.strokeStyle=G.rgba(T.acc,.8);g.lineWidth=1.5;g.beginPath();g.ellipse(65,27,38,9,0,0,TAU);g.stroke()},{s:2});
  return{T,bg,pad,eye,pedestal,CANDLES,amb:G.ambient(T.amb,{W,H,n:T.amb==='neve'?20:24,col:T.acc,seed:3})};
}

function eco58(C){
  const W=480,H=560,CX=240,CY=300,RR=150,SR=50,o=C.room.opt||{},solo=!C.net,jor=solo&&o.m==='jor',CI=jor?Math.max(0,Math.min(5,+o.ch||0)):-1,CH=jor?ECCH58[CI]:null;
  const TW=jor?CH.tw:(ECTW58[o.tw]?o.tw:'cls'),spd=CH&&CH.sp||1;
  const D0=gdPick(C.gd,[760,640,520,420])*spd,DMIN=gdPick(C.gd,[420,330,280,240])*spd,SEQ0=gdPick(C.gd,[1,1,3,4]);
  const S={seq:[],real:[],r:0,ph:'wait',at:0,dur:600,idx:0,lit:-1,litFake:false,litUntil:0,dead:new Set(),best:{},ans:{},prog:{},deadline:0,msg:'Prepare-se…',start:C.players.map(p=>p.u),
    rot:0,cur:0,spinAt:0,esp:false,lives:jor?3:1,hints:1,usedHint:false,score:0,fast:0,lastTap:0,won:false,lost:0,end:false,rw:null,html:''};
  const GX=window.GFX60,TAU=Math.PI*2,art=ecArt58(jor?['cls','vel','esp','gir','int','all'][CI]:TW);GX.skin({acc:art.T.acc});
  const alive=()=>C.players.filter(p=>!S.dead.has(p.u));
  const nmOf=u=>(C.players.find(p=>p.u===u)||{n:'?'}).n;
  const ang=s=>-Math.PI/2+s*Math.PI*2/5;
  const posOf=i=>{const a=ang(i+S.cur);return[CX+Math.cos(a)*RR,CY+Math.sin(a)*RR]};
  const light=v=>{S.lit=v%10;S.litFake=v>=10;S.litUntil=Date.now()+Math.min(420,S.dur*.75);{const[u,w]=posOf(v%10);GX.emit(v>=10?'fumaca':'brilho',u,w,{col:v>=10?'#8a8894':EL12[v%10].c,amount:v>=10?.6:.8,size:1.3})}fx5(v>=10?'click':'eco'+v)};
  const exp=()=>{const r=S.seq.filter(v=>v<10);return S.esp?r.reverse():r};
  const twFor=r=>({esp:TW==='esp'||(TW==='all'&&r%2===1),gir:TW==='gir'||TW==='all',nf:TW==='int'||TW==='all'?1+Math.floor(r/3):0});
  function hostRound(){S.r++;do S.real.push(Math.floor(Math.random()*5));while(S.real.length<SEQ0);
    const t=twFor(S.r),seq=S.real.slice();for(let k=0;k<t.nf;k++)seq.splice(1+Math.floor(Math.random()*seq.length),0,10+Math.floor(Math.random()*5));
    const rot=t.gir?1+Math.floor(Math.random()*4):0;S.ans={};const at=Date.now()+900;C.send('eseq',{r:S.r,seq,at,rot,esp:t.esp});recvSeq(S.r,seq,at,rot,t.esp)}
  function recvSeq(r,seq,at,rot,esp){S.r=r;S.seq=seq.slice();S.at=at;S.rot=rot|0;S.esp=!!esp;S.cur=0;S.dur=Math.max(DMIN,D0-r*22);S.ph='show';S.idx=0;S.shown=-1;S.prog={};
    S.msg=`Rodada ${r}: observe${S.esp?' · 🪞 repita ao contrário':''}`}
  function replay(delay){S.ph='show';S.at=Date.now()+delay;S.idx=0;S.shown=-1;S.cur=0;S.msg=`Rodada ${S.r}: observe de novo${S.esp?' · 🪞 ao contrário':''}`}
  function answer(ok){
    if(ok)GX.emit('coleta',CX,CY,{col:'#ffd36b',size:2.4,amount:1.6});else if(!solo||!S.end){GX.impact(CX,CY,{col:'#ff5b6b',force:1.5});GX.emit('estilhacos',CX,CY,{col:['#ff8a9a','#e8e0ff']})}
    if(solo){if(S.end)return;S.ph='sent';
      if(ok){const n=S.seq.filter(v=>v<10).length;S.best[C.me]=S.r;S.score+=n*10;S.msg='✓ Certo!';fx5('mgCoin');C.fx?.float(CX,CY,`+${n*10}`,{col:'#ffd36b',size:26});
        if(S.r%5===0&&S.hints<3){S.hints++;C.fx?.float(CX,CY+40,'+1 Revelação',{col:'#c9b0ff',size:18})}
        if(!jor&&S.r>=15)C.achieve?.('eco_15');
        if(jor&&S.r>=CH.goal){setTimeout(()=>finish(true),700);return}
        setTimeout(()=>{if(!S.end)hostRound()},1100)}
      else{S.lives--;S.lost++;C.fx?.shake(8,.35);C.fx?.flash('#e0233b',.2);fx5('fumble');
        if(S.lives>0){S.msg=`✕ Eco perdido. Restam ${S.lives}. De novo!`;setTimeout(()=>{if(!S.end)replay(300)},1200)}
        else{S.msg='✕ Errou a sequência.';setTimeout(()=>finish(false),900)}}
      return}
    S.ph='sent';S.msg=ok?'✓ Certo! Esperando os outros…':'✕ Errou a sequência.';if(ok)S.best[C.me]=S.r;if(C.host)hostAns(C.me,ok);else C.send('eans',{r:S.r,ok})}
  function hostAns(u,ok){if(S.ans[u]!==undefined||S.dead.has(u))return;S.ans[u]=!!ok;if(ok)S.best[u]=S.r;hostCheck()}
  function hostCheck(force){
    const al=alive();if(!force&&!al.every(p=>S.ans[p.u]!==undefined))return;if(S.judged===S.r)return;S.judged=S.r;
    const failed=al.filter(p=>!S.ans[p.u]).map(p=>p.u);let over=false,winners=[];
    if(failed.length===al.length){over=true;winners=al.map(p=>p.u)}
    else{failed.forEach(u=>S.dead.add(u));const rest=alive();if(rest.length<=1&&S.start.length>1){over=true;winners=rest.map(p=>p.u)}}
    C.send('eres',{r:S.r,out:failed,over});recvRes(failed,over);
    if(over){setTimeout(()=>{const rows=C.players.map(p=>({u:p.u,n:p.n,c:p.c,s:S.best[p.u]||0,w:winners.includes(p.u)})).sort((a,b)=>b.s-a.s);
      C.finish({title:winners.length===1?'O último Perseus de pé: '+nmOf(winners[0]):'Empate entre '+winners.map(nmOf).join(' e '),rows,unit:'rodadas'})},1200)}
    else setTimeout(hostRound,1400)}
  function recvRes(out,over){out.forEach(u=>S.dead.add(u));if(out.length){GX.impact(CX,CY,{col:'#ff5b6b',force:1});const n=out.map(nmOf).join(', ');S.msg=`Eliminado${out.length>1?'s':''}: ${n}`;if(C.host)C.say(sayFmt(SAY12.eco,{n}))}else if(!over)S.msg='Todos acertaram. Próxima rodada…'}
  function finish(win){if(S.end)return;S.end=true;S.won=win;const best=S.best[C.me]||0;let st=0,first=false,rec=false;
    if(jor&&win)st=1+(S.lost===0?1:0)+(!S.usedHint?1:0);
    progPut38(q=>{q.ec=q.ec||{};q.ec.ch=q.ec.ch||{};if(jor&&win){first=!q.ec.ch[CI];if(st>(q.ec.ch[CI]||0))q.ec.ch[CI]=st;if(ECCH58.every((_,i)=>q.ec.ch[i]))C.achieve?.('eco_jornada')}if(!jor&&best>(q.ec.best||0)){q.ec.best=best;rec=true}});
    if(jor&&win&&st===3)C.achieve?.('eco_pura');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((best*3+S.fast*.4)*mul)+(win?10+CI*3:0)+(first?15:0)+(rec?5:0)),why:[jor?CH.n:'Clássico',win?'★'.repeat(st):'',first?'Câmara nova':'',rec?'recorde':''].filter(Boolean).join(' · ')||`${best} rodadas`};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>🧠 Rodadas: <b>${best}</b>${jor?` / ${CH.goal}`:''} · Pontos: <b>${S.score}</b></li><li>⚡ Respostas-relâmpago: <b>${S.fast}</b> · Ecos perdidos: <b>${S.lost}</b>${S.usedHint?' · usou Revelação':''}</li></ul>${jor&&win&&first&&CI<5?`<p class="r38-hi">Câmara ${CI+2}: ${esc(ECCH58[CI+1].n)} foi aberta.</p>`:''}`;
    fx5(win?'mgWin':'fumble');if(win)GX.emit('confete',CX,CY-60);
    C.finish({title:jor?(win?`🧠 ${CH.n} vencida! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:`🧠 ${CH.n}: o Eco se perdeu na rodada ${S.r}`):`Fim · ${best} rodadas`,rows:[{u:C.me,n:(C.players[0]||{}).n||'Você',c:(C.players[0]||{}).c||0,s:best,w:win}],unit:'rodadas',html:S.html})}
  function tapEl(i){if(S.ph!=='input'||S.dead.has(C.me))return;light(i);const now=Date.now();
    if(exp()[S.idx]!==i){C.send('eprog',{r:S.r,i:S.idx,x:1});answer(false);return}
    if(now-S.lastTap<650){S.fast++;S.score+=5;C.fx?.float(posOf(i)[0],posOf(i)[1]-60,'⚡+5',{col:'#ffd36b',size:16,life:.5})}S.lastTap=now;
    S.idx++;C.send('eprog',{r:S.r,i:S.idx});if(S.idx>=exp().length)answer(true)}
  function hint(){if(!solo||S.ph!=='input'||S.hints<=0)return;S.hints--;S.usedHint=true;fx5('activate');replay(250);S.msg='👁 Revelação: observe de novo'}
  const slotEl=j=>((j-Math.round(S.cur))%5+5)%5;
  return{
    g60intro:{title:jor?CH.n:'Eco da Memória',sub:jor?CH.d:'Observe a sequência e repita',acc:art.T.acc},
    st:()=>S,exp,tapEl,hint,posOf,hostRound,finish,
    reward:()=>S.rw,
    next(){if(C.net)return null;if(jor){if(S.won&&CI<5)return{opt:{ch:String(CI+1)},label:`Câmara ${CI+2}: ${ECCH58[CI+1].n}`};return{opt:{},label:'Tentar de novo'}}return{opt:{},label:'Jogar de novo'}},
    key(code,down){if(!down)return;const m=/^(?:Digit|Numpad)([1-5])$/.exec(code);if(m){tapEl(slotEl(+m[1]-1));return}if(code==='KeyH')hint()},
    ptr(t,px,py){if(t!=='down')return;if(solo&&Math.hypot(px-52,py-(H-44))<30){hint();return}if(S.ph!=='input')return;
      let bi=-1,bd=1e9;for(let i=0;i<5;i++){const[x,y]=posOf(i),d=Math.hypot(px-x,py-y);if(d<bd){bd=d;bi=i}}if(bd<SR+6)tapEl(bi)},
    tap(i){tapEl(i)},
    step(){
      const now=Date.now();
      if(S.ph==='wait'&&now>=C.t0&&(C.host||solo)&&!S.r){S.ph='x';hostRound()}
      if(S.ph==='show'){const k=Math.floor((now-S.at)/S.dur);if(now>=S.at&&k<S.seq.length&&k!==S.shown){S.shown=k;light(S.seq[k])}
        if(now>=S.at+S.seq.length*S.dur){if(S.rot){S.ph='spin';S.spinAt=now;S.msg='🌀 Os Elementos giram…';fx5('bb3')}else toInput(now)}}
      if(S.ph==='spin'){const k=Math.min(1,(now-S.spinAt)/750),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;S.cur=S.rot*e;if(k>=1){S.cur=S.rot;toInput(now)}}
      if(S.ph==='input'&&now>S.deadline){S.msg='⏱ Tempo esgotado.';answer(false)}
      if(!solo&&C.host&&S.r&&S.judged!==S.r&&S.ph!=='show'&&S.ph!=='spin'&&now>S.at+S.seq.length*S.dur+3500+S.seq.length*900+2700)hostCheck(true);
      C.hud(GX.chips([{icon:'brilho',label:'Rodada',value:jor?`${S.r||0}/${CH.goal}`:S.r||0},jor?{icon:'bandeira',value:CH.n}:null,jor?{icon:'coracao',label:'Ecos',value:Math.max(0,S.lives),tone:S.lives<=1?'bad':null}:null,
        solo?{icon:'estrela',value:`${S.score} pts`}:null,solo?{icon:'olho',label:'Revelação',value:S.hints}:{icon:'coroa',label:'Na disputa',value:`${alive().length}/${C.players.length}`},TW!=='cls'&&!jor?{icon:'espiral',value:ECTW58[TW][0]}:null]));
      function toInput(n){if(S.dead.has(C.me)){S.ph='watch';S.msg='Você está assistindo.'}else{S.ph='input';S.idx=0;S.lastTap=n;S.deadline=n+3500+exp().length*900;S.msg=S.esp?'Sua vez: 🪞 de trás para frente':'Sua vez: repita a sequência'}}
    },
    msg(p){
      if(!C.host&&p.t==='eseq')recvSeq(p.r,p.seq||[],p.at,p.rot,p.esp);
      if(!C.host&&p.t==='eres')recvRes(p.out||[],p.over);
      if(C.host&&p.t==='eans'&&p.r===S.r)hostAns(p.from,p.ok);
      if(p.t==='eprog'&&p.r===S.r&&p.from!==C.me)S.prog[p.from]={i:Number(p.i)||0,x:!!p.x};
    },
    left(u){if(!C.host||solo)return;C.players=C.players.filter(p=>p.u!==u);S.start=S.start.filter(x=>x!==u);if(S.r)hostCheck()},
    draw(x){
      const now=Date.now(),red=GX.reduced(),t=red?0:performance.now()/1000,my=S.ph==='input',on=S.lit>=0&&now<S.litUntil,fake=on&&S.litFake,lc=on?(fake?'#c8c6d0':EL12[S.lit].c):art.T.acc;
      x.drawImage(art.bg(),0,0,W,H);art.amb.draw(x,t,0);
      art.CANDLES.forEach(([u,v],i)=>{const f=red?0:Math.sin(t*9+i*2.1)+Math.sin(t*23+i);GX.glow(x,u,v-8,34+f*3,art.T.flame,.4);GX.glow(x,u+f*.5,v-9,7,art.T.flame,.95,{sy:1.7});GX.glow(x,u,v-7,3,'#ffffff',.95,{sy:1.8})});
      /* enquanto observa, o fundo recua para a luz saltar */
      if(S.ph==='show'||S.ph==='spin'){x.fillStyle='rgba(4,2,10,.24)';x.fillRect(0,0,W,H)}
      if(on&&!fake){const[u,v]=posOf(S.lit);GX.rays(x,u,v,{n:9,len:150,width:.22,col:lc,a:.2,t:t*5});x.save();x.globalCompositeOperation='lighter';x.strokeStyle=GX.rgba(lc,.55);x.lineWidth=4;x.beginPath();x.moveTo(u,v);x.lineTo(CX,CY);x.stroke();x.restore()}
      if(S.ph==='spin'){x.save();x.strokeStyle=GX.rgba(art.T.acc,.7);x.lineWidth=3;x.setLineDash([14,20]);x.lineDashOffset=-S.cur*RR*1.26;x.beginPath();x.arc(CX,CY,RR,0,TAU);x.stroke();x.restore()}
      /* núcleo: Perseus (solo) ou o cristal da Câmara */
      GX.glow(x,CX,CY+6,on?96:62,lc,on&&!fake?.55:.24);
      if(solo){GX.draw(x,art.pedestal(),CX,CY+36);GX.shadow(x,CX,CY+34,52,{alpha:.5});mgCat(x,-1,CX,CY+(red?0:Math.sin(t*2)*2),72,'')}
      else{GX.draw(x,art.pedestal(),CX,CY+30);GX.draw(x,GX.prop.gem(on&&!fake?EL12[S.lit].c:'#8a7aa8',64,8),CX,CY-4+(red?0:Math.sin(t*2)*3),{w:58});GX.glow(x,CX,CY-4,36,lc,.4)}
      /* os 5 Elementos */
      for(let i=0;i<5;i++){const[px,py]=posOf(i),e=EL12[i],lit=S.lit===i&&on,fk=lit&&S.litFake,k=lit?Math.max(0,Math.min(1,(S.litUntil-now)/220)):0;
        if(lit&&!fk){GX.glow(x,px,py,108,e.c,.72);GX.glow(x,px,py,70,e.c,.6,{add:false})}else if(!lit)GX.glow(x,px,py,64,e.c,my?.2:.11);
        const sz=lit?(124*(SR+6)/SR)*(1+(red?0:k*.04)):124;GX.draw(x,art.pad(i,lit?(fk?'fake':'lit'):'idle'),px,py,{w:sz});
        if(lit){x.save();x.strokeStyle=fk?'#e8e6f0':'#ffffff';x.lineWidth=3.5;if(fk)x.setLineDash([7,7]);x.beginPath();x.arc(px,py,SR+13+(red?0:(1-k)*12),0,TAU);x.stroke();x.restore()}
        else if(my&&!S.dead.has(C.me)){x.strokeStyle='rgba(255,211,107,.55)';x.lineWidth=1.5;x.beginPath();x.arc(px,py,SR+5,0,TAU);x.stroke()}
        {const s=GX.fs(13),tw=Math.min(112,e.n.length*s*.62+s),ly=py+SR+15;x.fillStyle='rgba(10,6,18,.78)';rr21(x,px-tw/2,ly-s*.72,tw,s*1.44,s*.72);x.fill();GX.hud.text(x,e.n,px,ly+.5,{size:13,al:'center',col:lit&&!fk?'#ffffff':'#f4ead6',stroke:0})}
        if(my){const j=((i+Math.round(S.cur))%5+5)%5,bx=px+SR-6,by=py-SR+8;x.fillStyle='rgba(10,6,18,.9)';x.beginPath();x.arc(bx,by,GX.fs(13)*.82,0,TAU);x.fill();x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.stroke();GX.hud.text(x,String(j+1),bx,by+.5,{size:13,al:'center',col:'#ffd36b',stroke:0})}}
      /* painel: o que fazer agora */
      {const col=my?'#ffd36b':S.ph==='watch'?'#a89abc':art.T.acc,ph=my?84:50,ic=my?'alvo':S.ph==='show'?'olho':S.ph==='spin'?'espiral':S.ph==='sent'?'brilho':'relogio',msg=GX.clean(S.msg).replace(/^[✓✕⏱]\s*/,'');
        GX.hud.panel(x,12,8,W-24,ph,{acc:col,a:.92});
        if(my){x.strokeStyle=GX.rgba(col,.35+(red?.3:.35*Math.abs(Math.sin(t*3))));x.lineWidth=2.5;rr21(x,12,8,W-24,ph,10);x.stroke()}
        GX.icon(x,ic,38,33,24,col);GX.hud.text(x,msg,W/2+14,33,{size:18,w:800,al:'center',col:my?'#ffd36b':'#f4ead6',max:W-104});
        if(my){const seq=exp(),n=seq.length,left=Math.max(0,(S.deadline-now)/1000),tot=3.5+n*.9;
          if(n<=20){const step=Math.min(22,380/n);for(let i=0;i<n;i++){const u=W/2+(i-(n-1)/2)*step,done=i<S.idx,cur=i===S.idx,r=Math.min(7,step*.34);if(cur)GX.glow(x,u,56,14,'#ffd36b',.8);x.beginPath();x.arc(u,56,done?r:r*.82,0,TAU);x.fillStyle=done?'#ffd36b':'rgba(255,255,255,.14)';x.fill();x.strokeStyle=done||cur?'#ffe9b0':'rgba(244,234,214,.5)';x.lineWidth=1.5;x.stroke()}}
          else GX.hud.bar(x,70,52,W-140,8,S.idx/n,{col:'#ffd36b'});
          GX.hud.text(x,`${S.idx}/${n}`,24,77,{size:13,col:'#f4ead6'});GX.hud.bar(x,82,73,W-164,8,left/tot,{col:left<2?'#ff6b6b':'#7dffa8'});GX.hud.text(x,`${left.toFixed(1)} s`,W-22,77,{size:13,al:'right',col:left<2?'#ff9a9a':'#f4ead6'})}}
      GX.vignette(x,W,H,{a:.34});
      if(solo){const can=S.hints>0&&my;x.globalAlpha=can?1:.45;if(can)GX.glow(x,52,H-44,42,'#c9b0ff',.5);GX.draw(x,art.eye(can),52,H-44,{w:62});
        x.fillStyle='#1a1028';x.beginPath();x.arc(75,H-24,GX.fs(13)*.8,0,TAU);x.fill();x.strokeStyle='#c9b0ff';x.lineWidth=1.5;x.stroke();GX.hud.text(x,String(S.hints),75,H-23.5,{size:13,w:900,al:'center',stroke:0});x.globalAlpha=1;
        if(jor){GX.hud.panel(x,W-124,H-62,112,36,{acc:'#ff7a98',a:.9});for(let i=0;i<3;i++){const u=W-98+i*30,full=i<S.lives;if(full)GX.glow(x,u,H-44,17,'#c05aff',.6);GX.icon(x,'coracao',u,H-44,24,full?'#c98aff':'rgba(244,234,214,.2)')}}}
      else{GX.hud.panel(x,6,H-62,W-12,58,{acc:art.T.acc,a:.62});
        C.players.forEach((p,i)=>{const n=C.players.length,px=W*(i+.5)/n,mine=p.u===C.me,pg=S.prog[p.u],tag=mine?'':(S.dead.has(p.u)?' · fora':pg?(pg.x?' · ✕':` · ${pg.i}/${exp().length}`):'');mgCat(x,p.c,px,H-27,34,p.n+tag,{alpha:S.dead.has(p.u)?.18:mine?1:.5,ring:mine})})}
      GX.hud.frame(x,W,H,{acc:art.T.acc,a:.55});
    }
  };
}
Object.assign(ACH,{
  eco_jornada:{ico:'🏛',n:'Seis Câmaras',d:'Vença as 6 Câmaras da Jornada do Eco da Memória.'},
  eco_15:{ico:'🧠',n:'Memória de Elefante',d:'Chegue à rodada 15 no Eco Clássico.'},
  eco_pura:{ico:'💎',n:'Memória Pura',d:'Vença uma Câmara sem perder Eco e sem Revelação.',secret:true},
});
defineArcadeGame('eco',{...GAMES12.eco,make:eco58,setup:ecSetup58,modes:['solo','mesa'],max:6,H:560,unit:'rodadas',
  desc:'Jornada de 6 Câmaras com regras próprias (Espelho, Giro, Intrusos), 3 Ecos de vida, Revelação e bônus Relâmpago.',
  rule:'Repita a sequência. Na mesa, quem errar sai e o último de pé vence.',keys:'Clique nos Elementos ou use 1 a 5 · H: Revelação',touch:'Toque nos Elementos na ordem'});
console.info('[Tulpa] Etapa 58 carregada (Eco da Memória 2.0)');

/* ===================================================================
   TULPA · ETAPA 59 — 🕹 ARCADE 2.0 · ONDA 11 (parte 2)
   ❌ JOGO DA VELHA TEOSÓFICO 2.0
   3 variantes: Clássica, Suprema (9 tabuleiros: a casa que você joga
   manda o rival para o tabuleiro correspondente) e Evanescente (cada
   um tem no máximo 3 marcas; a 4ª apaga a mais antiga). Séries
   melhor de 1, 3 ou 5, IA por variante, teclas 1–9, apostas e
   missões funcionando (a série termina com resultado).
   =================================================================== */
const VEV59={cls:['Clássica','❌','O jogo de sempre, 3×3.'],ult:['Suprema','🔳','9 tabuleiros: sua casa escolhe o tabuleiro do rival.'],eva:['Evanescente','◐','Só 3 marcas cada: a 4ª apaga a mais antiga.']};
function veInit59(v){if(v==='ult')return{b:Array(81).fill(0),lb:Array(9).fill(0),nb:-1,n:0,p:1};if(v==='eva')return{b:Array(9).fill(0),q:[[],[],[]],n:0,p:1};return{b:Array(9).fill(0),n:0,p:1}}
function veW359(b,off){for(const l of LINES12){const a=b[off+l[0]];if(a&&a!==3&&a===b[off+l[1]]&&a===b[off+l[2]])return a}return 0}
function veMoves59(v,s){const out=[];if(v!=='ult'){for(let i=0;i<9;i++)if(!s.b[i])out.push(i);return out}
  const bs=s.nb>=0&&!s.lb[s.nb]?[s.nb]:[0,1,2,3,4,5,6,7,8].filter(k=>!s.lb[k]);for(const bb of bs)for(let c=0;c<9;c++)if(!s.b[bb*9+c])out.push(bb*9+c);return out}
function vePlay59(v,s,i){const p=s.p,t={...s,b:s.b.slice(),n:s.n+1,p:3-p};t.b[i]=p;
  if(v==='ult'){t.lb=s.lb.slice();const bb=Math.floor(i/9),c=i%9,w=veW359(t.b,bb*9);if(w)t.lb[bb]=w;else if(!t.b.slice(bb*9,bb*9+9).includes(0))t.lb[bb]=3;t.nb=t.lb[c]?-1:c}
  else if(v==='eva'){t.q=s.q.map(a=>a.slice());t.q[p].push(i);if(t.q[p].length>3)t.b[t.q[p].shift()]=0}
  return t}
function veWin59(v,s){if(v==='ult'){for(const l of LINES12){const a=s.lb[l[0]];if(a&&a!==3&&a===s.lb[l[1]]&&a===s.lb[l[2]])return{w:a,line:l}}if(s.lb.every(Boolean))return{w:3};if(!veMoves59(v,s).length)return{w:3};return{w:0}}
  for(const l of LINES12){const a=s.b[l[0]];if(a&&a===s.b[l[1]]&&a===s.b[l[2]])return{w:a,line:l}}
  if(v==='cls'&&s.b.every(Boolean))return{w:3};if(v==='eva'&&s.n>=36)return{w:3};return{w:0}}
function veLine59(b,off,p){let sc=0;for(const l of LINES12){let m=0,o=0;for(const k of l){const v=b[off+k];if(v===p)m++;else if(v&&v!==3)o++}if(!o)sc+=m===2?6:m===1?1:0;if(!m)sc-=o===2?6:o===1?1:0}return sc}
function veEval59(v,s){const p=s.p,op=3-p;
  if(v==='ult'){let sc=0;for(let k=0;k<9;k++){const w=s.lb[k];if(w===p)sc+=k===4?34:24;else if(w===op)sc-=k===4?34:24;else if(!w)sc+=veLine59(s.b,k*9,p)+(s.b[k*9+4]===p?2:s.b[k*9+4]===op?-2:0)}
    sc+=veLine59(s.lb.map(x=>x===3?3:x),0,p)*9;if(s.nb<0)sc+=7;return sc}
  let sc=veLine59(s.b,0,p)+(s.b[4]===p?3:s.b[4]===op?-3:0);if(v==='eva'){const old=s.q[p][0];if(s.q[p].length===3&&old!=null)sc-=1}return sc}
function veNeg59(v,s,d,a,b,cnt){cnt.n++;const W=veWin59(v,s);if(W.w)return W.w===3?0:(W.w===s.p?1:-1)*(1e4+d);if(d<=0||cnt.n>250000)return veEval59(v,s);
  const ms=veMoves59(v,s);if(!ms.length)return 0;let best=-1e9;
  for(const m of ms){const val=-veNeg59(v,vePlay59(v,s,m),d-1,-b,-a,cnt);if(val>best)best=val;if(best>a)a=best;if(a>=b)break}return best}
function vePick59(v,s,diff){const ms=veMoves59(v,s);if(!ms.length)return null;
  if(v==='cls'){const b=s.b.map(x=>x||null);return tttPick(b,s.p,3-s.p,diff)}
  const win=ms.find(m=>veWin59(v,vePlay59(v,s,m)).w===s.p);
  if(diff==='facil'){if(win!=null&&Math.random()<.7)return win;if(Math.random()<.55)return pick12(ms)}
  if(win!=null)return win;
  const d=v==='ult'?(diff==='pesadelo'?(ms.length>20?3:4):diff==='dificil'?(ms.length>20?2:3):2):(diff==='pesadelo'?6:diff==='dificil'?4:2);
  const cnt={n:0},sc=ms.map(m=>({m,v:-veNeg59(v,vePlay59(v,s,m),d-1,-1e9,1e9,cnt)+Math.random()*.5})).sort((a,b)=>b.v-a.v);
  if(diff==='dificil'&&sc.length>1&&Math.random()<.15&&sc[1].v>-5e3)return sc[1].m;
  if(diff==='medio'&&sc.length>1&&Math.random()<.25&&sc[1].v>-5e3)return sc[1].m;
  return sc[0].m}
T3.ve59={init:veInit59,moves:veMoves59,play:vePlay59,win:veWin59,pick:vePick59};
function veProg59(){const p=prog38().ve||{};return{w:p.w||{},ser:p.ser||0}}
const veSetup59={
  intro:o=>o._m==='mesa'?'1 contra 1 com fila: quem vence fica na mesa. Vence a série quem chegar primeiro às vitórias.':'Escolha a variante e a série contra o Perseus. Quem começa alterna a cada partida.',
  def:()=>({v:'cls',md:'3'}),
  fields:o=>{const p=veProg59();return[{k:'v',l:'Variante',wide:1,opts:Object.entries(VEV59).map(([v,t])=>({v,n:t[0],ico:t[1],d:t[2],badge:p.w[v]?`🏆 ${p.w[v]}`:''}))},
    {k:'md',l:'Série',opts:[{v:'1',n:'Partida única',ico:'1️⃣',d:'Uma partida decide.'},{v:'3',n:'Melhor de 3',ico:'3️⃣',d:o._m==='mesa'?'Com 3 ou mais: 3 vitórias.':'2 vitórias levam.'},{v:'5',n:'Melhor de 5',ico:'5️⃣',d:o._m==='mesa'?'Com 3 ou mais: 4 vitórias.':'3 vitórias levam.'}]}]},
  fix:o=>{if(!VEV59[o.v])o.v='cls';if(!['1','3','5'].includes(String(o.md)))o.md='3';o.md=String(o.md)},
  sum:o=>o.v==='ult'?'Clique numa casa do tabuleiro em destaque · teclas 1–9: tabuleiro e depois casa.':'Clique numa casa ou use as teclas 1 a 9 (da esquerda para a direita, de cima para baixo).'
};

/* arte procedural da Velha: mesa ritual, marcas talhadas e fichas dos jogadores (só visual) */
function veArt59(V){
  const G=window.GFX60,W=480,H=600,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const T=V==='ult'?{acc:'#7fe0d0',cloth:'#12303a',wood:'#4a3222',amb:'motes'}:V==='eva'?{acc:'#c9b0ff',cloth:'#1c1840',wood:'#38283a',amb:'motes'}:{acc:'#ffd36b',cloth:'#38142a',wood:'#5a3620',amb:'poeira'};
  const COL=['#ffd36b','#7fd0ff'];
  const B=V==='ult'?{x:24,y:104,s:432}:{x:45,y:118,s:390};
  const CANDLES=V==='ult'?[]:[[22,150],[458,150],[22,470],[458,470]];

  const bg=()=>G.bake('ve:bg:'+V,W,H,(g,w,h,r)=>{
    G.fillTile(g,G.tile('madeira',{size:112,a:T.wood,b:'#160c06',seed:8}),0,0,w,h);
    g.fillStyle=rg(g,w/2,h*.46,90,420,'rgba(0,0,0,.15)','rgba(0,0,0,.82)');g.fillRect(0,0,w,h);
    /* toalha ritual */
    box(g,8,92,w-16,B.y+B.s-80,'rgba(0,0,0,.35)',16);g.save();g.beginPath();if(g.roundRect)g.roundRect(10,88,w-20,B.y+B.s-80,14);else g.rect(10,88,w-20,B.y+B.s-80);g.clip();
    G.fillTile(g,G.tile('feltro',{size:96,a:T.cloth,seed:2}),0,0,w,h);g.fillStyle=rg(g,w/2,B.y+B.s/2,40,300,'rgba(255,255,255,.07)','rgba(0,0,0,.5)');g.fillRect(0,0,w,h);g.restore();
    g.strokeStyle=G.rgba(T.acc,.35);g.lineWidth=1.5;g.beginPath();if(g.roundRect)g.roundRect(14,92,w-28,B.y+B.s-88,11);else g.rect(14,92,w-28,B.y+B.s-88);g.stroke();
    const cx=w/2,cy=B.y+B.s/2;ring(g,cx,cy,B.s*.69,G.rgba(T.acc,.16),1.5);ring(g,cx,cy,B.s*.65,G.rgba(T.acc,.1),1);
    for(let i=0;i<48;i++){const a=i*TAU/48,R=B.s*.67;g.save();g.translate(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.rotate(a);line(g,[[-3,-3],[3,r()*4-2],[-2,3]],G.rgba(T.acc,.24),1);g.restore()}
    /* tábua de pedra do tabuleiro */
    const p=V==='ult'?4:8;box(g,B.x-p+3,B.y-p+8,B.s+p*2,B.s+p*2,'rgba(0,0,0,.5)',16);box(g,B.x-p,B.y-p,B.s+p*2,B.s+p*2,lg(g,0,B.y,0,B.y+B.s,'#3a3048','#15101e'),14);
    g.save();g.beginPath();if(g.roundRect)g.roundRect(B.x,B.y,B.s,B.s,9);else g.rect(B.x,B.y,B.s,B.s);g.clip();G.fillTile(g,G.tile('pedra',{size:130,a:'#2c2438',b:'#171120',seed:11}),B.x,B.y,B.s,B.s,{alpha:.55});g.fillStyle='rgba(8,4,14,.3)';g.fillRect(B.x,B.y,B.s,B.s);g.restore();
    g.strokeStyle=G.rgba(T.acc,.6);g.lineWidth=1.5;g.beginPath();if(g.roundRect)g.roundRect(B.x-p+1,B.y-p+1,B.s+p*2-2,B.s+p*2-2,13);else g.rect(B.x-p,B.y-p,B.s+p*2,B.s+p*2);g.stroke();
    /* sulcos do tabuleiro */
    const groove=(pts,lw,col)=>{line(g,pts,'rgba(0,0,0,.65)',lw+3);line(g,pts,col,lw);line(g,pts,'rgba(255,255,255,.35)',Math.max(1,lw*.25))};
    if(V==='ult'){const U=B.s/9;for(let k=0;k<9;k++){const bx=B.x+(k%3)*U*3,by=B.y+(k/3|0)*U*3;for(let i=1;i<3;i++){line(g,[[bx+i*U,by+8],[bx+i*U,by+U*3-8]],'rgba(217,203,176,.42)',1.6);line(g,[[bx+8,by+i*U],[bx+U*3-8,by+i*U]],'rgba(217,203,176,.42)',1.6)}}
      for(let i=1;i<3;i++){groove([[B.x+i*U*3,B.y+3],[B.x+i*U*3,B.y+B.s-3]],5,'#d9cbb0');groove([[B.x+3,B.y+i*U*3],[B.x+B.s-3,B.y+i*U*3]],5,'#d9cbb0')}}
    else{const U=B.s/3;for(let i=1;i<3;i++){groove([[B.x+i*U,B.y+10],[B.x+i*U,B.y+B.s-10]],5,'#d9cbb0');groove([[B.x+10,B.y+i*U],[B.x+B.s-10,B.y+i*U]],5,'#d9cbb0')}
      [[1,1],[2,1],[1,2],[2,2]].forEach(([i,j])=>{G.poly(g,[[B.x+i*U,B.y+j*U-9],[B.x+i*U+9,B.y+j*U],[B.x+i*U,B.y+j*U+9],[B.x+i*U-9,B.y+j*U]],'#1a1424');disc(g,B.x+i*U,B.y+j*U,3.4,T.acc)})}
    CANDLES.forEach(([X,Y])=>{ell(g,X,Y+26,14,5,'rgba(0,0,0,.55)');ell(g,X,Y+23,12,4,'#8a6a3a');box(g,X-5,Y,10,22,lg(g,X-5,0,X+5,0,'#f4e8c8','#a89878'),2);ell(g,X,Y,5,2,'#fff4d8');line(g,[[X,Y-1],[X,Y-4]],'#2a1a10',1.4)})},{s:2});

  /* marcas: forma e cor diferentes (✕ ouro · ◯ azul) */
  const mark=v=>G.bake('ve:mk:'+v,128,128,g=>{const c=COL[v-1],hi=G.shade(c,.6),lo=G.shade(c,-.45);
    if(v===1){const bar=(a,b)=>{const q=[a,b];line(g,q,'#0c0610',30);line(g,q,lo,22);line(g,[[a[0],a[1]-2.5],[b[0],b[1]-2.5]],c,16);line(g,[[a[0],a[1]-5],[b[0],b[1]-5]],hi,4)};bar([27,27],[101,101]);bar([101,27],[27,101]);
      G.poly(g,[[64,50],[78,64],[64,78],[50,64]],'#0c0610');G.poly(g,[[64,54],[74,64],[64,74],[54,64]],hi)}
    else{ring(g,64,64,40,'#0c0610',30);ring(g,64,64,40,lo,22);ring(g,64,62,40,c,15);g.strokeStyle=hi;g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(64,62,43,Math.PI*1.05,Math.PI*1.75);g.stroke();
      for(let k=0;k<4;k++){const a=k*TAU/4+Math.PI/4;G.poly(g,[[64+Math.cos(a)*32,63+Math.sin(a)*32],[64+Math.cos(a+.13)*40,63+Math.sin(a+.13)*40],[64+Math.cos(a)*48,63+Math.sin(a)*48],[64+Math.cos(a-.13)*40,63+Math.sin(a-.13)*40]],hi)}}},{s:2});
  /* casa ocupada, tingida com a cor de quem jogou */
  const tile=v=>G.bake('ve:tile:'+v,118,118,g=>{const c=COL[v-1];box(g,1,1,116,116,rg(g,59,59,8,84,G.rgba(c,.28),G.rgba(c,.07)),14);g.strokeStyle=G.rgba(c,.5);g.lineWidth=2;g.beginPath();if(g.roundRect)g.roundRect(2,2,114,114,13);else g.rect(2,2,114,114);g.stroke()},{s:2});
  const token=()=>G.bake('ve:token',60,60,g=>{disc(g,30,32,27,'rgba(0,0,0,.45)');disc(g,30,30,27,lg(g,0,3,0,57,'#4a3c60','#150f20'));ring(g,30,30,27,'rgba(255,255,255,.35)',1.5)},{s:2});
  return{T,COL,B,bg,mark,tile,token,CANDLES,amb:G.ambient(T.amb,{W,H,n:20,col:T.acc,seed:4})};
}

function velha59(C){
  const W=480,H=600,o=C.room.opt||{},V=VEV59[o.v]?o.v:'cls',MD=[1,3,5].includes(+o.md)?+o.md:3,ai=!C.net;
  const OX=45,OY=118,CS=130,UX=24,UY=104,UC=48;
  const S={v:V,g:veInit59(V),x:null,o:null,turn:null,q:[],wins:{},line:null,st:'play',win:null,games:0,draws:0,last:-1,kb:-1,lostAny:false,rw:null,html:'',over:false};
  const nPl=ai?2:C.players.length,need=nPl<=2?Math.ceil(MD/2):({1:2,3:3,5:4})[MD];
  const info=u=>u==='~ai'?{n:'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n,c:-1}:(C.players.find(p=>p.u===u)||{n:'?',c:0});
  const GX=window.GFX60,TAU=Math.PI*2,art=veArt59(V),fxv={b:null,lb:null,n:0,line:'',lineAt:0,born:{}};GX.skin({acc:art.T.acc});
  const uidOf=p=>p===1?S.x:p===2?S.o:null;
  const syncTurn=()=>{S.turn=S.st==='play'?uidOf(S.g.p):null};
  function bcast(){if(C.net)C.send('tstate',{g:S.g,x:S.x,o:S.o,turn:S.turn,q:S.q,wins:S.wins,line:S.line,st:S.st,win:S.win,games:S.games,draws:S.draws,last:S.last})}
  function newMatch(x,o){S.g=veInit59(V);S.x=x;S.o=o;S.line=null;S.st='play';S.win=null;S.last=-1;S.kb=-1;syncTurn();bcast();if(ai&&S.turn==='~ai')setTimeout(aiMove,800)}
  if(C.host){if(ai)newMatch(C.me,'~ai');else{const us=C.players.map(p=>p.u);S.q=us.slice(2);newMatch(us[0],us[1])}}
  function apply(i,u){
    if(S.st!=='play'||u!==S.turn||!veMoves59(V,S.g).includes(i))return false;
    S.g=vePlay59(V,S.g,i);S.last=i;S.kb=-1;fx5('click');
    if(V==='ult'){const bb=Math.floor(i/9);if(S.g.lb[bb]&&S.g.lb[bb]!==3){fx5('mgCoin');C.fx?.float(UX+((bb%3)+.5)*UC*3,UY+(Math.floor(bb/3)+.5)*UC*3,'Tabuleiro conquistado!',{col:'#ffd36b',size:16})}}
    const R=veWin59(V,S.g);
    if(R.w===1||R.w===2){const wu=uidOf(R.w);S.line=R.line;S.st='end';S.win=wu;S.games++;S.wins[wu]=(S.wins[wu]||0)+1;if(ai&&wu==='~ai')S.lostAny=true;
      boardPush([{g:'velha',n:info(wu).n,w:true}]);fx5(wu===C.me?'mgWin':'fumble');
      C.say(wu==='~ai'?'Miau. Vitória. Como previsto.':ai?'Eu deixei. Para manter sua autoestima.':sayFmt(SAY12.tttMulti));
      if(S.wins[wu]>=need){bcast();setTimeout(()=>endSeries(wu),1800);return true}setTimeout(next,2300)}
    else if(R.w===3){S.st='end';S.win=null;S.games++;S.draws++;C.say('Empate. Considere isso uma vitória moral… minha.');if(S.games>=MD*2+1){bcast();setTimeout(()=>endSeries(null),1600);return true}setTimeout(next,2000)}
    else if(C.net&&Math.random()<.2)C.say(sayFmt(SAY12.tttMulti));
    syncTurn();bcast();if(ai&&S.turn==='~ai'&&S.st==='play')setTimeout(aiMove,V==='ult'?500:650);return true}
  function aiMove(){if(S.st!=='play'||S.turn!=='~ai')return;const i=vePick59(V,S.g,C.diff);if(i==null)return;apply(i,'~ai');if(S.st==='play'&&Math.random()<.35)C.say(sayFmt(SAY12['tttAi_'+C.diff]||SAY12.tttAi))}
  function next(){if(!C.host||S.over)return;
    if(ai){newMatch(S.o,S.x);return}
    const us=C.players.map(p=>p.u);S.q=S.q.filter(u=>us.includes(u));us.forEach(u=>{if(u!==S.x&&u!==S.o&&!S.q.includes(u))S.q.push(u)});
    if(us.length===2){newMatch(S.o&&us.includes(S.o)?S.o:us[1],S.x&&us.includes(S.x)?S.x:us[0]);return}
    let champ=S.win||S.x,loser=champ===S.x?S.o:S.x;if(!us.includes(champ))champ=us.find(u=>u!==loser);
    if(loser&&us.includes(loser))S.q.push(loser);const ch=S.q.shift();if(!champ||!ch){newMatch(us[0],us[1]);return}newMatch(champ,ch)}
  function endSeries(wu){if(S.over)return;S.over=true;S.st='over';syncTurn();bcast();
    const list=ai?[{u:C.me,...info(C.me)},{u:'~ai',...info('~ai')}]:C.players.map(p=>({u:p.u,n:p.n,c:p.c}));
    const rows=list.map(p=>({u:p.u,n:p.n,c:p.c,s:S.wins[p.u]||0,w:p.u===wu})).sort((a,b)=>b.s-a.s);
    const mine=S.wins[C.me]||0,iwon=wu===C.me;
    if(ai){progPut38(q=>{q.ve=q.ve||{};q.ve.w=q.ve.w||{};if(iwon){q.ve.w[V]=(q.ve.w[V]||0)+1;q.ve.ser=(q.ve.ser||0)+1}});
      if(iwon&&['dificil','pesadelo'].includes(C.diff)){if(V==='ult')C.achieve?.('ve_suprema');if(V==='eva')C.achieve?.('ve_eva')}
      if(iwon&&MD===5&&!S.lostAny&&C.diff!=='facil')C.achieve?.('ve_invicto')}
    const mul=gdMul38(C.gd),dm={facil:.7,medio:1,dificil:1.4,pesadelo:1.8}[C.diff]||1;
    S.rw={ob:Math.min(160,Math.round((mine*7+(iwon?12+MD*2:0)+(V!=='cls'?4:0))*mul*(ai?dm:1))),why:[VEV59[V][0],`melhor de ${MD}`,iwon?'série vencida':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>${VEV59[V][1]} ${VEV59[V][0]} · melhor de ${MD}</li><li>Partidas: <b>${S.games}</b> · Empates: <b>${S.draws}</b></li><li>${rows.map(r=>`${esc(r.n)}: <b>${r.s}</b>`).join(' · ')}</li></ul>`;
    C.finish({title:wu?(wu===C.me?`❌ Série vencida! ${mine} vitória${mine>1?'s':''}`:`❌ ${info(wu).n} venceu a série`):'❌ Série empatada',rows,unit:'vitórias',html:S.html})}
  const ultCell=(px,py)=>{const gc=Math.floor((px-UX)/UC),gr=Math.floor((py-UY)/UC);if(gc<0||gc>8||gr<0||gr>8)return -1;return(Math.floor(gr/3)*3+Math.floor(gc/3))*9+(gr%3)*3+gc%3};
  function tryMove(i){if(i<0||S.turn!==C.me||S.st!=='play')return;if(!veMoves59(V,S.g).includes(i)){fx5('error');return}
    if(C.host)apply(i,C.me);else{C.send('tmove',{i});S.turn=null;fx5('click')}}
  const cellXY=i=>V==='ult'?[UX+((Math.floor(i/9)%3)*3+i%9%3+.5)*UC,UY+(Math.floor(Math.floor(i/9)/3)*3+Math.floor(i%9/3)+.5)*UC]:[OX+(i%3+.5)*CS,OY+(Math.floor(i/3)+.5)*CS];
  /* efeitos nascem comparando o tabuleiro com o do quadro anterior (anfitrião e convidado) */
  function watch(){
    const g=S.g,now=performance.now();
    if(!fxv.b||g.n<fxv.n){fxv.b=g.b.slice();fxv.lb=(g.lb||[]).slice();fxv.born={}}
    else{g.b.forEach((v,i)=>{if(v===fxv.b[i])return;const[cx,cy]=cellXY(i);
        if(v){fxv.born[i]=now;GX.emit('coleta',cx,cy,{col:art.COL[v-1],size:V==='ult'?.8:1.9,amount:1.3});if(V!=='ult')GX.hitstop(45)}else GX.emit('fumaca',cx,cy,{col:'#b9a6ff',size:1.6})});
      (g.lb||[]).forEach((v,k)=>{if(v===fxv.lb[k])return;if(v===1||v===2){fxv.born['b'+k]=now;GX.impact(UX+((k%3)+.5)*UC*3,UY+(Math.floor(k/3)+.5)*UC*3,{col:art.COL[v-1],force:1.2})}});
      fxv.b=g.b.slice();fxv.lb=(g.lb||[]).slice()}
    fxv.n=g.n;
    const lk=S.line?S.line.join():'';
    if(lk!==fxv.line){fxv.line=lk;if(lk){fxv.lineAt=now;GX.impact(W/2,V==='ult'?UY+UC*4.5:OY+CS*1.5,{col:'#ffd36b',force:1.8});if(S.win===C.me)GX.emit('confete',W/2,200)}}
  }
  return{
    g60intro:{title:'Velha '+VEV59[V][0],sub:VEV59[V][2],acc:art.T.acc},
    state:()=>S,st:()=>S,apply,aiMove,endSeries,cellXY,reward:()=>S.rw,
    next(){if(C.net)return null;return{opt:{},label:'Nova série'}},
    key(code,down){if(!down)return;if(code==='Escape'){S.kb=-1;return}const m=/^(?:Digit|Numpad)([1-9])$/.exec(code);if(!m)return;const d=+m[1]-1;
      if(V!=='ult'){tryMove(d);return}const g=S.g,forced=g.nb>=0&&!g.lb[g.nb];
      if(forced){tryMove(g.nb*9+d);return}if(S.kb<0){if(!g.lb[d]){S.kb=d;fx5('click')}else fx5('error');return}tryMove(S.kb*9+d)},
    ptr(t,px,py){if(t!=='down')return;if(V==='ult'){tryMove(ultCell(px,py));return}const cx=Math.floor((px-OX)/CS),cy=Math.floor((py-OY)/CS);if(cx<0||cx>2||cy<0||cy>2)return;tryMove(cy*3+cx)},
    tap(i){tryMove(i)},
    step(){const a=info(S.x),b=info(S.o);C.hud(GX.chips([{icon:'brilho',value:VEV59[V][0]},{icon:'alvo',label:'✕ '+a.n,value:S.wins[S.x]||0,tone:S.turn===S.x?'ok':null},{icon:'moeda',label:'◯ '+b.n,value:S.wins[S.o]||0,tone:S.turn===S.o?'ok':null},
      {icon:'trofeu',value:MD>1?`melhor de ${MD} (${need} vitórias)`:'partida única'},S.q.length?{icon:'relogio',label:'Fila',value:S.q.map(u=>info(u).n).join(', ')}:null]))},
    msg(p){
      if(C.host&&p.t==='tmove'){const i=Number(p.i);if(i>=0&&i<(V==='ult'?81:9))apply(i,p.from)}
      if(!C.host&&p.t==='tstate'){Object.assign(S,{g:p.g||S.g,x:p.x,o:p.o,turn:p.turn,q:p.q||[],wins:p.wins||{},line:p.line,st:p.st,win:p.win,games:p.games|0,draws:p.draws|0,last:p.last==null?-1:p.last})}
    },
    left(u){if(!C.host||S.over)return;C.players=C.players.filter(p=>p.u!==u);
      if((u===S.x||u===S.o)&&S.st==='play'){const other=u===S.x?S.o:S.x;S.st='end';S.win=other;S.games++;S.wins[other]=(S.wins[other]||0)+1;syncTurn();bcast();if(S.wins[other]>=need||C.players.length<2)setTimeout(()=>endSeries(other),1200);else setTimeout(next,1500)}
      else{S.q=S.q.filter(x=>x!==u);bcast()}},
    draw(x){
      watch();
      const now=performance.now(),red=GX.reduced(),t=red?0:now/1000,COL=art.COL,g=S.g,mine=S.turn===C.me&&S.st==='play',pulse=red?.6:.5+.5*Math.sin(t*4.5);
      const vOf=u=>u===S.x?1:2,pop=i=>{if(red||!fxv.born[i])return 1;const k=(now-fxv.born[i])/220;return k>=1?1:1+(1-k)*(1-k)*.55};
      x.drawImage(art.bg(),0,0,W,H);art.amb.draw(x,t,0);
      art.CANDLES.forEach(([u,v],i)=>{const f=red?0:Math.sin(t*9+i*2.1)+Math.sin(t*23+i);GX.glow(x,u,v-7,30+f*2.6,'#ffb35a',.42);GX.glow(x,u+f*.4,v-8,6,'#ff9a3c',.95,{sy:1.7});GX.glow(x,u,v-6,2.6,'#ffffff',.95,{sy:1.8})});
      if(V==='ult'){const free=g.nb<0||g.lb[g.nb];
        for(let k=0;k<9;k++){const bx=UX+(k%3)*UC*3,by=UY+Math.floor(k/3)*UC*3,act=S.st==='play'&&!g.lb[k]&&(free||g.nb===k);
          if(act){x.fillStyle=mine?`rgba(255,211,107,${.14+pulse*.12})`:'rgba(255,255,255,.08)';rr21(x,bx+4,by+4,UC*3-8,UC*3-8,8);x.fill();x.strokeStyle=mine?`rgba(255,211,107,${.65+pulse*.35})`:'rgba(244,234,214,.45)';x.lineWidth=mine?3:2;x.stroke()}
          else if(S.st==='play'&&!g.lb[k]){x.fillStyle='rgba(4,2,10,.34)';x.fillRect(bx+3,by+3,UC*3-6,UC*3-6)}
          if(S.kb===k){x.strokeStyle='#ffffff';x.lineWidth=3;x.setLineDash([9,6]);rr21(x,bx+5,by+5,UC*3-10,UC*3-10,7);x.stroke();x.setLineDash([])}
          for(let c=0;c<9;c++){const i=k*9+c,v=g.b[i];if(!v)continue;const[cx,cy]=cellXY(i),m=vOf(uidOf(v)),last=S.last===i;
            if(last){GX.glow(x,cx,cy,34,COL[m-1],.55);x.strokeStyle='#ffffff';x.lineWidth=2;rr21(x,cx-UC/2+3,cy-UC/2+3,UC-6,UC-6,7);x.stroke()}
            GX.draw(x,art.mark(v),cx,cy,{w:43*pop(i)})}
          if(g.lb[k]===1||g.lb[k]===2){const m=g.lb[k],cx=bx+UC*1.5,cy=by+UC*1.5;x.fillStyle='rgba(12,7,18,.72)';rr21(x,bx+4,by+4,UC*3-8,UC*3-8,8);x.fill();x.strokeStyle=COL[m-1];x.lineWidth=2;x.stroke();GX.glow(x,cx,cy,78,COL[m-1],.42);GX.draw(x,art.mark(m),cx,cy,{w:132*pop('b'+k)})}
          else if(g.lb[k]===3){x.fillStyle='rgba(12,7,18,.7)';rr21(x,bx+4,by+4,UC*3-8,UC*3-8,8);x.fill();x.fillStyle='#a89a86';rr21(x,bx+UC*.8,by+UC*1.5-5,UC*1.4,10,5);x.fill();GX.hud.text(x,'Empate',bx+UC*1.5,by+UC*2.1,{size:13,al:'center',col:'#c9bca6'})}}
      }else{
        g.b.forEach((v,i)=>{const[cx,cy]=cellXY(i);
          if(!v){if(mine&&veMoves59(V,g).includes(i))GX.glow(x,cx,cy,22,'#ffd36b',.1+pulse*.12);return}
          const u=uidOf(v),f=info(u),fading=V==='eva'&&g.q[v].length===3&&g.q[v][0]===i&&S.st==='play'&&g.p===v,s=pop(i);
          GX.draw(x,art.tile(v),cx,cy,{w:118,alpha:fading?.4:1});if(S.last===i){x.strokeStyle='#ffffff';x.lineWidth=2.5;rr21(x,cx-59,cy-59,118,118,14);x.stroke()}
          if(!fading)GX.glow(x,cx,cy,64,COL[v-1],.26);
          GX.draw(x,art.mark(v),cx-8,cy-8,{w:106*s,alpha:fading?.34+(red?0:pulse*.22):1});
          GX.draw(x,art.token(),cx+34,cy+34,{w:50,alpha:fading?.5:1});mgCat(x,f.c,cx+34,cy+34,48,'',{alpha:fading?.4:1});
          if(fading){x.strokeStyle='#d8c8ff';x.lineWidth=3;x.setLineDash([9,7]);x.lineDashOffset=red?0:-t*18;rr21(x,cx-58,cy-58,116,116,13);x.stroke();x.setLineDash([]);x.fillStyle='#1a1230';x.beginPath();x.arc(cx-38,cy+38,15,0,TAU);x.fill();x.strokeStyle='#d8c8ff';x.lineWidth=1.5;x.stroke();GX.icon(x,'ampulheta',cx-38,cy+38,18,'#e8dcff')}})}
      GX.vignette(x,W,H,{a:.34});
      /* linha da vitória */
      if(S.line){const p=k=>V==='ult'?[UX+((k%3)+.5)*UC*3,UY+(Math.floor(k/3)+.5)*UC*3]:cellXY(k),[ax,ay]=p(S.line[0]),[bx,by]=p(S.line[2]),k=red?1:Math.min(1,(now-fxv.lineAt)/360);
        const ex=ax+(bx-ax)*k,ey=ay+(by-ay)*k,lw=V==='ult'?12:10,seg=(w,c)=>{x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(ax,ay);x.lineTo(ex,ey);x.stroke()};
        x.save();x.lineCap='round';seg(lw+8,'rgba(10,4,16,.8)');seg(lw,'#ffd36b');seg(lw*.35,'#fffbe8');x.restore();for(let i=0;i<=4;i++)GX.glow(x,ax+(ex-ax)*i/4,ay+(ey-ay)*i/4,34,'#ffb830',.34+(red?0:pulse*.18))}
      /* topo: de quem é a vez */
      {const over=S.st==='over',end=S.st==='end',who=over?null:end?S.win:S.turn,v=who?vOf(who):0,col=v?COL[v-1]:art.T.acc;
        const ti=over?'Fim da série':end?(S.win?info(S.win).n+' venceu!':'Empate!'):S.turn===C.me?'Sua vez':S.turn==='~ai'?'Perseus pensando…':S.turn?'Vez de '+info(S.turn).n:'…';
        GX.hud.panel(x,60,10,W-120,46,{acc:col,a:.94});
        if(mine){GX.glow(x,W/2,33,190,col,.16+pulse*.14,{sy:.22});x.strokeStyle=GX.rgba(col,.45+pulse*.5);x.lineWidth=2.5;rr21(x,60,10,W-120,46,10);x.stroke()}
        if(v){GX.draw(x,art.mark(v),88,33,{w:36});GX.draw(x,art.mark(v),W-88,33,{w:36})}
        GX.hud.text(x,ti,W/2,34,{size:21,w:800,al:'center',col:mine?col:'#f4ead6',max:W-230});
        const sub=`${VEV59[V][0]} · ${MD>1?`melhor de ${MD}`:'partida única'}${S.draws?` · ${S.draws} empate${S.draws>1?'s':''}`:''}`;
        const hint=S.st!=='play'?'':V==='ult'?(g.nb<0||g.lb[g.nb]?'Jogada livre: qualquer tabuleiro em destaque':`Jogue no tabuleiro ${g.nb+1}`):V==='eva'&&g.q[g.p].length===3?'A marca com ampulheta some na próxima jogada':'';
        /* com o balão do Perseus por cima do painel, a linha de baixo passa a dizer de quem é a vez */
        const talk=MG.say&&Date.now()<MG.say.until&&Date.now()>=C.t0;
        GX.hud.text(x,talk?(hint?`${ti} · ${hint}`:ti):hint||sub,W/2,V==='ult'?80:79,{size:13,al:'center',col:talk||hint?'#ffd36b':'#d8cce0',max:W-30});}
      /* fichas dos jogadores */
      {const top=V==='ult'?544:524,h=H-6-top;
        [[S.x,1,10],[S.o,2,W/2+5]].forEach(([u,v,X])=>{if(S.x===null&&S.o===null)return;const w=W/2-15,a=info(u),turn=S.st==='play'&&S.turn===u,col=COL[v-1],w0=S.wins[u]||0,cz=Math.min(46,h-8),R=v===2,at=d=>R?X+w-d:X+d;
          GX.hud.panel(x,X,top,w,h,{acc:col,a:turn?.96:.74});
          if(turn){x.strokeStyle=col;x.lineWidth=3;rr21(x,X,top,w,h,10);x.stroke();GX.glow(x,at(30),top+h/2,38,col,.35+pulse*.2)}
          mgCat(x,a.c,at(30),top+h/2,cz,'',{flip:R});GX.draw(x,art.mark(v),at(w-20),top+h/2,{w:30});
          GX.hud.text(x,a.n,at(58),top+h*.32,{size:14,al:R?'right':'left',max:w-96});
          if(need<=5)for(let i=0;i<need;i++){const px=at(64+i*16),py=top+h*.71;x.beginPath();x.arc(px,py,5.5,0,TAU);x.fillStyle=i<w0?col:'rgba(255,255,255,.14)';x.fill();x.strokeStyle=i<w0?'#ffffff':GX.rgba(col,.65);x.lineWidth=1.4;x.stroke()}})}
      GX.hud.frame(x,W,H,{acc:art.T.acc,a:.55});
    }
  };
}
Object.assign(ACH,{
  ve_suprema:{ico:'🔳',n:'Mente Suprema',d:'Vença uma série de Velha Suprema contra o Perseus no Difícil ou Pesadelo.'},
  ve_eva:{ico:'◐',n:'Memória Evanescente',d:'Vença uma série de Velha Evanescente contra o Perseus no Difícil ou Pesadelo.'},
  ve_invicto:{ico:'👑',n:'Invicto',d:'Vença uma melhor de 5 contra o Perseus sem perder nenhuma partida.',secret:true},
});
defineArcadeGame('velha',{...GAMES12.velha,make:velha59,setup:veSetup59,modes:['ai','mesa'],max:6,H:600,unit:'vitórias',
  desc:'3 variantes (Clássica, Suprema com 9 tabuleiros e Evanescente), séries melhor de 3 ou 5 e um Perseus que joga cada uma.',
  rule:'1 contra 1 com fila: quem vence fica. Vence quem chegar primeiro às vitórias da série.',keys:'Clique numa casa ou use 1 a 9',touch:'Toque numa casa'});
console.info('[Tulpa] Etapa 59 carregada (Jogo da Velha 2.0)');

