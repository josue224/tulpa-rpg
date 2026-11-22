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

function eco58(C){
  const W=480,H=560,CX=240,CY=300,RR=150,SR=50,o=C.room.opt||{},solo=!C.net,jor=solo&&o.m==='jor',CI=jor?Math.max(0,Math.min(5,+o.ch||0)):-1,CH=jor?ECCH58[CI]:null;
  const TW=jor?CH.tw:(ECTW58[o.tw]?o.tw:'cls'),spd=CH&&CH.sp||1;
  const D0=gdPick(C.gd,[760,640,520,420])*spd,DMIN=gdPick(C.gd,[420,330,280,240])*spd,SEQ0=gdPick(C.gd,[1,1,3,4]);
  const S={seq:[],real:[],r:0,ph:'wait',at:0,dur:600,idx:0,lit:-1,litFake:false,litUntil:0,dead:new Set(),best:{},ans:{},prog:{},deadline:0,msg:'Prepare-se…',start:C.players.map(p=>p.u),
    rot:0,cur:0,spinAt:0,esp:false,lives:jor?3:1,hints:1,usedHint:false,score:0,fast:0,lastTap:0,won:false,lost:0,end:false,rw:null,html:''};
  const alive=()=>C.players.filter(p=>!S.dead.has(p.u));
  const nmOf=u=>(C.players.find(p=>p.u===u)||{n:'?'}).n;
  const ang=s=>-Math.PI/2+s*Math.PI*2/5;
  const posOf=i=>{const a=ang(i+S.cur);return[CX+Math.cos(a)*RR,CY+Math.sin(a)*RR]};
  const light=v=>{S.lit=v%10;S.litFake=v>=10;S.litUntil=Date.now()+Math.min(420,S.dur*.75);fx5(v>=10?'click':'eco'+v)};
  const exp=()=>{const r=S.seq.filter(v=>v<10);return S.esp?r.reverse():r};
  const twFor=r=>({esp:TW==='esp'||(TW==='all'&&r%2===1),gir:TW==='gir'||TW==='all',nf:TW==='int'||TW==='all'?1+Math.floor(r/3):0});
  function hostRound(){S.r++;do S.real.push(Math.floor(Math.random()*5));while(S.real.length<SEQ0);
    const t=twFor(S.r),seq=S.real.slice();for(let k=0;k<t.nf;k++)seq.splice(1+Math.floor(Math.random()*seq.length),0,10+Math.floor(Math.random()*5));
    const rot=t.gir?1+Math.floor(Math.random()*4):0;S.ans={};const at=Date.now()+900;C.send('eseq',{r:S.r,seq,at,rot,esp:t.esp});recvSeq(S.r,seq,at,rot,t.esp)}
  function recvSeq(r,seq,at,rot,esp){S.r=r;S.seq=seq.slice();S.at=at;S.rot=rot|0;S.esp=!!esp;S.cur=0;S.dur=Math.max(DMIN,D0-r*22);S.ph='show';S.idx=0;S.shown=-1;S.prog={};
    S.msg=`Rodada ${r}: observe${S.esp?' · 🪞 repita ao contrário':''}`}
  function replay(delay){S.ph='show';S.at=Date.now()+delay;S.idx=0;S.shown=-1;S.cur=0;S.msg=`Rodada ${S.r}: observe de novo${S.esp?' · 🪞 ao contrário':''}`}
  function answer(ok){
    if(solo){if(S.end)return;S.ph='sent';
      if(ok){const n=S.seq.filter(v=>v<10).length;S.best[C.me]=S.r;S.score+=n*10;S.msg='✓ Certo!';fx5('mgCoin');C.fx?.float(CX,CY,`+${n*10}`,{col:'#ffd36b',size:26});
        if(S.r%5===0&&S.hints<3){S.hints++;C.fx?.float(CX,CY+40,'👁 +1 Revelação',{col:'#c9b0ff',size:18})}
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
  function recvRes(out,over){out.forEach(u=>S.dead.add(u));if(out.length){const n=out.map(nmOf).join(', ');S.msg=`Eliminado${out.length>1?'s':''}: ${n}`;if(C.host)C.say(sayFmt(SAY12.eco,{n}))}else if(!over)S.msg='Todos acertaram. Próxima rodada…'}
  function finish(win){if(S.end)return;S.end=true;S.won=win;const best=S.best[C.me]||0;let st=0,first=false,rec=false;
    if(jor&&win)st=1+(S.lost===0?1:0)+(!S.usedHint?1:0);
    progPut38(q=>{q.ec=q.ec||{};q.ec.ch=q.ec.ch||{};if(jor&&win){first=!q.ec.ch[CI];if(st>(q.ec.ch[CI]||0))q.ec.ch[CI]=st;if(ECCH58.every((_,i)=>q.ec.ch[i]))C.achieve?.('eco_jornada')}if(!jor&&best>(q.ec.best||0)){q.ec.best=best;rec=true}});
    if(jor&&win&&st===3)C.achieve?.('eco_pura');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((best*3+S.fast*.4)*mul)+(win?10+CI*3:0)+(first?15:0)+(rec?5:0)),why:[jor?CH.n:'Clássico',win?'★'.repeat(st):'',first?'Câmara nova':'',rec?'recorde':''].filter(Boolean).join(' · ')||`${best} rodadas`};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>🧠 Rodadas: <b>${best}</b>${jor?` / ${CH.goal}`:''} · Pontos: <b>${S.score}</b></li><li>⚡ Respostas-relâmpago: <b>${S.fast}</b> · Ecos perdidos: <b>${S.lost}</b>${S.usedHint?' · usou Revelação':''}</li></ul>${jor&&win&&first&&CI<5?`<p class="r38-hi">Câmara ${CI+2}: ${esc(ECCH58[CI+1].n)} foi aberta.</p>`:''}`;
    fx5(win?'mgWin':'fumble');
    C.finish({title:jor?(win?`🧠 ${CH.n} vencida! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:`🧠 ${CH.n}: o Eco se perdeu na rodada ${S.r}`):`Fim · ${best} rodadas`,rows:[{u:C.me,n:(C.players[0]||{}).n||'Você',c:(C.players[0]||{}).c||0,s:best,w:win}],unit:'rodadas',html:S.html})}
  function tapEl(i){if(S.ph!=='input'||S.dead.has(C.me))return;light(i);const now=Date.now();
    if(exp()[S.idx]!==i){C.send('eprog',{r:S.r,i:S.idx,x:1});answer(false);return}
    if(now-S.lastTap<650){S.fast++;S.score+=5;C.fx?.float(posOf(i)[0],posOf(i)[1]-60,'⚡+5',{col:'#ffd36b',size:16,life:.5})}S.lastTap=now;
    S.idx++;C.send('eprog',{r:S.r,i:S.idx});if(S.idx>=exp().length)answer(true)}
  function hint(){if(!solo||S.ph!=='input'||S.hints<=0)return;S.hints--;S.usedHint=true;fx5('activate');replay(250);S.msg='👁 Revelação: observe de novo'}
  const slotEl=j=>((j-Math.round(S.cur))%5+5)%5;
  return{
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
      C.hud(`Rodada <b>${S.r||0}</b>${jor?` / ${CH.goal} · ${CH.ico} ${CH.n} · ${'💜'.repeat(Math.max(0,S.lives))}`:''}${solo?` · ${S.score} pts · 👁 ${S.hints}`:` · ${alive().length} de ${C.players.length} na disputa`}${TW!=='cls'&&!jor?` · ${ECTW58[TW][1]} ${ECTW58[TW][0]}`:''}`);
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
      const now=Date.now(),gr=x.createRadialGradient(CX,CY,40,CX,CY,380);gr.addColorStop(0,TW==='esp'?'#1e2a40':TW==='int'?'#2a1a2a':'#2c2140');gr.addColorStop(1,'#120c1c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      t21(x,S.msg,W/2,40,{size:17,w:700,col:'#f4ead6'});
      if(S.ph==='input'){const left=Math.max(0,(S.deadline-now)/1000),tot=3.5+exp().length*.9;x.fillStyle='rgba(255,255,255,.12)';x.fillRect(W/2-110,62,220,6);x.fillStyle=left<2?'#ff6b6b':'#ffd36b';x.fillRect(W/2-110,62,220*Math.min(1,left/tot),6);t21(x,`${S.idx}/${exp().length} · ${left.toFixed(1)} s`,W/2,82,{size:13,col:'#d9cbb0'})}
      /* pentagrama */
      x.strokeStyle='rgba(244,234,214,.08)';x.lineWidth=2;x.beginPath();for(let k=0;k<=5;k++){const[a,b]=posOf((k*2)%5);k?x.lineTo(a,b):x.moveTo(a,b)}x.stroke();
      for(let i=0;i<5;i++){const[px,py]=posOf(i),e=EL12[i],on=S.lit===i&&now<S.litUntil,fake=on&&S.litFake;x.save();if(on){x.shadowColor=fake?'#999':e.c;x.shadowBlur=34}
        x.beginPath();x.arc(px,py,on?SR+6:SR,0,7);x.fillStyle=fake?'#6d6a75':on?e.c:e.c+'55';x.fill();x.lineWidth=3;x.strokeStyle=fake?'#bbb':e.c;if(fake)x.setLineDash([6,6]);x.stroke();x.restore();
        t21(x,fake?'?':e.g,px,py-4,{size:on?34:30});t21(x,e.n,px,py+SR+14,{size:12,col:'#f4ead6',w:600});
        if(S.ph==='input'){const j=((i+Math.round(S.cur))%5+5)%5;t21(x,String(j+1),px+SR-6,py-SR+6,{size:11,col:'rgba(244,234,214,.55)'})}}
      if(solo){x.globalAlpha=S.hints>0&&S.ph==='input'?1:.35;x.fillStyle='#3a2a55';x.beginPath();x.arc(52,H-44,26,0,7);x.fill();x.strokeStyle='#c9b0ff';x.lineWidth=2;x.stroke();t21(x,'👁',52,H-46,{size:20});t21(x,String(S.hints),72,H-26,{size:12,w:800,col:'#fff'});x.globalAlpha=1;
        mgCat(x,-1,CX,CY,64,'');if(jor)t21(x,'💜'.repeat(Math.max(0,S.lives))+'🖤'.repeat(Math.max(0,3-S.lives)),W-70,H-44,{size:18})}
      else C.players.forEach((p,i)=>{const n=C.players.length,px=W*(i+.5)/n,mine=p.u===C.me,pg=S.prog[p.u],tag=mine?'':(S.dead.has(p.u)?' · fora':pg?(pg.x?' · ✕':` · ${pg.i}/${exp().length}`):'');mgCat(x,p.c,px,H-34,40,p.n+tag,{alpha:S.dead.has(p.u)?.18:mine?1:.5,ring:mine})});
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

function velha59(C){
  const W=480,H=600,o=C.room.opt||{},V=VEV59[o.v]?o.v:'cls',MD=[1,3,5].includes(+o.md)?+o.md:3,ai=!C.net;
  const OX=45,OY=118,CS=130,UX=24,UY=104,UC=48;
  const S={v:V,g:veInit59(V),x:null,o:null,turn:null,q:[],wins:{},line:null,st:'play',win:null,games:0,draws:0,last:-1,kb:-1,lostAny:false,rw:null,html:'',over:false};
  const nPl=ai?2:C.players.length,need=nPl<=2?Math.ceil(MD/2):({1:2,3:3,5:4})[MD];
  const info=u=>u==='~ai'?{n:'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n,c:-1}:(C.players.find(p=>p.u===u)||{n:'?',c:0});
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
  return{
    state:()=>S,st:()=>S,apply,aiMove,endSeries,cellXY,reward:()=>S.rw,
    next(){if(C.net)return null;return{opt:{},label:'Nova série'}},
    key(code,down){if(!down)return;if(code==='Escape'){S.kb=-1;return}const m=/^(?:Digit|Numpad)([1-9])$/.exec(code);if(!m)return;const d=+m[1]-1;
      if(V!=='ult'){tryMove(d);return}const g=S.g,forced=g.nb>=0&&!g.lb[g.nb];
      if(forced){tryMove(g.nb*9+d);return}if(S.kb<0){if(!g.lb[d]){S.kb=d;fx5('click')}else fx5('error');return}tryMove(S.kb*9+d)},
    ptr(t,px,py){if(t!=='down')return;if(V==='ult'){tryMove(ultCell(px,py));return}const cx=Math.floor((px-OX)/CS),cy=Math.floor((py-OY)/CS);if(cx<0||cx>2||cy<0||cy>2)return;tryMove(cy*3+cx)},
    tap(i){tryMove(i)},
    step(){const a=info(S.x),b=info(S.o);C.hud(`${VEV59[V][1]} <b>${esc(a.n)}</b> ✕ ${S.wins[S.x]||0} · ${S.wins[S.o]||0} ◯ <b>${esc(b.n)}</b> · ${MD>1?`melhor de ${MD} (${need} vitórias)`:'partida única'}${S.q.length?` · fila: ${S.q.map(u=>esc(info(u).n)).join(', ')}`:''}`)},
    msg(p){
      if(C.host&&p.t==='tmove'){const i=Number(p.i);if(i>=0&&i<(V==='ult'?81:9))apply(i,p.from)}
      if(!C.host&&p.t==='tstate'){Object.assign(S,{g:p.g||S.g,x:p.x,o:p.o,turn:p.turn,q:p.q||[],wins:p.wins||{},line:p.line,st:p.st,win:p.win,games:p.games|0,draws:p.draws|0,last:p.last==null?-1:p.last})}
    },
    left(u){if(!C.host||S.over)return;C.players=C.players.filter(p=>p.u!==u);
      if((u===S.x||u===S.o)&&S.st==='play'){const other=u===S.x?S.o:S.x;S.st='end';S.win=other;S.games++;S.wins[other]=(S.wins[other]||0)+1;syncTurn();bcast();if(S.wins[other]>=need||C.players.length<2)setTimeout(()=>endSeries(other),1200);else setTimeout(next,1500)}
      else{S.q=S.q.filter(x=>x!==u);bcast()}},
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,V==='eva'?'#1c1a30':V==='ult'?'#1a2228':'#241a2e');gr.addColorStop(1,'#16101c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      const ti=S.st==='over'?'Fim da série':S.st==='end'?(S.win?info(S.win).n+' venceu!':'Empate!'):S.turn===C.me?'Sua vez':S.turn==='~ai'?'Perseus pensando…':S.turn?'Vez de '+info(S.turn).n:'…';
      t21(x,ti,W/2,40,{size:20,w:700,col:S.turn===C.me&&S.st==='play'?'#ffd36b':'#f4ead6'});
      t21(x,`${VEV59[V][1]} ${VEV59[V][0]} · ${MD>1?`melhor de ${MD}`:'partida única'}${S.draws?` · ${S.draws} empate${S.draws>1?'s':''}`:''}`,W/2,70,{size:12,col:'#bfb2c8'});
      const col=u=>u===S.x?'#ffd36b':'#7fd0ff',g=S.g;
      if(V==='ult'){const free=g.nb<0||g.lb[g.nb],mine=S.turn===C.me&&S.st==='play';
        for(let k=0;k<9;k++){const bx=UX+(k%3)*UC*3,by=UY+Math.floor(k/3)*UC*3,act=S.st==='play'&&!g.lb[k]&&(free||g.nb===k);
          if(act){x.fillStyle=mine?'rgba(255,211,107,.12)':'rgba(255,255,255,.05)';x.fillRect(bx+3,by+3,UC*3-6,UC*3-6)}
          if(S.kb===k){x.strokeStyle='#ffd36b';x.lineWidth=3;x.strokeRect(bx+4,by+4,UC*3-8,UC*3-8)}
          x.strokeStyle='rgba(217,203,176,.45)';x.lineWidth=2;for(let i=1;i<3;i++){x.beginPath();x.moveTo(bx+i*UC,by+8);x.lineTo(bx+i*UC,by+UC*3-8);x.stroke();x.beginPath();x.moveTo(bx+8,by+i*UC);x.lineTo(bx+UC*3-8,by+i*UC);x.stroke()}
          for(let c=0;c<9;c++){const v=g.b[k*9+c];if(!v)continue;const[cx,cy]=cellXY(k*9+c);t21(x,v===1?'✕':'◯',cx,cy+1,{size:26,w:800,col:col(uidOf(v)),stroke:3});if(S.last===k*9+c){x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=2;x.strokeRect(cx-UC/2+5,cy-UC/2+5,UC-10,UC-10)}}
          if(g.lb[k]===1||g.lb[k]===2){x.fillStyle='rgba(16,10,22,.55)';x.fillRect(bx+3,by+3,UC*3-6,UC*3-6);t21(x,g.lb[k]===1?'✕':'◯',bx+UC*1.5,by+UC*1.5+4,{size:110,w:800,col:col(uidOf(g.lb[k])),stroke:5})}
          else if(g.lb[k]===3){x.fillStyle='rgba(16,10,22,.6)';x.fillRect(bx+3,by+3,UC*3-6,UC*3-6);t21(x,'—',bx+UC*1.5,by+UC*1.5,{size:40,col:'#8a7a66'})}}
        x.strokeStyle='#d9cbb0';x.lineWidth=5;x.lineCap='round';for(let i=1;i<3;i++){x.beginPath();x.moveTo(UX+i*UC*3,UY);x.lineTo(UX+i*UC*3,UY+UC*9);x.stroke();x.beginPath();x.moveTo(UX,UY+i*UC*3);x.lineTo(UX+UC*9,UY+i*UC*3);x.stroke()}
        if(S.line){const p=k=>[UX+((k%3)+.5)*UC*3,UY+(Math.floor(k/3)+.5)*UC*3],[ax,ay]=p(S.line[0]),[bx,by]=p(S.line[2]);x.strokeStyle='#ffd36b';x.lineWidth=10;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()}
        if(S.st==='play')t21(x,free?'Jogada livre: qualquer tabuleiro em destaque':`Jogue no tabuleiro ${g.nb+1}`,W/2,92,{size:12,col:'#ffd36b'})}
      else{x.strokeStyle='#d9cbb0';x.lineWidth=5;x.lineCap='round';
        for(let i=1;i<3;i++){x.beginPath();x.moveTo(OX+i*CS,OY+8);x.lineTo(OX+i*CS,OY+3*CS-8);x.stroke();x.beginPath();x.moveTo(OX+8,OY+i*CS);x.lineTo(OX+3*CS-8,OY+i*CS);x.stroke()}
        g.b.forEach((v,i)=>{if(!v)return;const u=uidOf(v),[cx,cy]=cellXY(i),f=info(u),fading=V==='eva'&&g.q[v].length===3&&g.q[v][0]===i&&S.st==='play'&&g.p===v;
          mgCat(x,f.c,cx,cy,96,'',{alpha:fading?.4:1});t21(x,v===1?'✕':'◯',cx+CS/2-24,cy+CS/2-22,{size:22,w:800,col:col(u),stroke:4});if(fading)t21(x,'⌛',cx-CS/2+22,cy-CS/2+22,{size:18})});
        if(S.line){const[ax,ay]=cellXY(S.line[0]),[bx,by]=cellXY(S.line[2]);x.strokeStyle='#ffd36b';x.lineWidth=8;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()}
        if(V==='eva'&&S.st==='play')t21(x,'⌛ marca que vai sumir na próxima jogada de quem tem a vez',W/2,96,{size:11,col:'#c9b0ff'})}
      const a=info(S.x),b=info(S.o),cy=V==='ult'?H-16:H-30,cz=V==='ult'?30:40;mgCat(x,a.c,60,cy,cz,a.n+' ✕ '+(S.wins[S.x]||0));mgCat(x,b.c,W-60,cy,cz,(S.wins[S.o]||0)+' ◯ '+b.n);
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

