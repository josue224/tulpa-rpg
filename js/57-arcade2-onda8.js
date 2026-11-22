/* ===================================================================
   TULPA · ETAPA 52 — 🕹 ARCADE 2.0 · ONDA 8 (parte 1)
   🔵 POÇO DAS ALMAS 2.0 (estilo Peggle)
   Campanha de 15 tabuleiros: pinos móveis, blocos e hastes giratórias,
   portais, rampas e para-choques, pinos blindados (2 acertos).
   Mestres: escolha um poder (ativado pelos pinos verdes): Multibola,
   Bola de Sol, Mira da Verdade, Balde da Natureza, Segunda Chance.
   Êxtase: o último laranja dispara câmera lenta, zoom e baldes de bônus.
   Bônus de estilo: Tiro Longo, Quique Múltiplo e Rebote Livre.
   PvP: tiros alternados no mesmo tabuleiro.
   =================================================================== */
const POM52={multi:{n:'Multibola da Ilusão',ico:'🌀',d:'O pino verde solta mais 2 esferas.'},sol:{n:'Bola de Sol',ico:'☀',d:'Por 2 tiros a esfera atravessa os pinos sem quicar.'},ver:{n:'Mira da Verdade',ico:'👁',d:'Por 3 tiros a mira mostra o caminho inteiro.'},nat:{n:'Balde da Natureza',ico:'🌿',d:'Por 3 tiros o balde fica gigante.'},ine:{n:'Segunda Chance',ico:'🕳',d:'A próxima esfera perdida volta pelo alto.'}};
const POMK52=Object.keys(POM52);
/* construção dos tabuleiros */
function poBuild52(lv,seed){
  const W=480,P=[],O=[],rnd=mb32(((seed>>>0)^(lv*0x9e37+11))>>>0||3),R=a=>a+rnd()*0;
  const peg=(x,y,o={})=>P.push({x,y,x0:x,y0:y,k:'b',hp:1,...o});
  const brick=(x,y,a,o={})=>P.push({x,y,x0:x,y0:y,k:'b',hp:1,br:1,a,w:26,h:10,...o});
  const row=(y,n,x0=40,x1=W-40,o={})=>{for(let i=0;i<n;i++)peg(x0+(x1-x0)*i/(n-1||1),y,o)};
  const arc=(cx,cy,r,a0,a1,n,o={})=>{for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/(n-1||1);peg(cx+Math.cos(a)*r,cy+Math.sin(a)*r,o)}};
  const ring=(cx,cy,r,n,w,o={})=>{for(let i=0;i<n;i++){const a=i/n*TAU16;peg(cx+Math.cos(a)*r,cy+Math.sin(a)*r,{m:{t:'rot',cx,cy,r,a0:a,w},...o})}};
  const osc=(y,n,dx,w,o={})=>{for(let i=0;i<n;i++){const x=60+(W-120)*i/(n-1||1);peg(x,y,{m:{t:'osc',dx,dy:0,w,ph:0},...o})}};
  const seg=(x1,y1,x2,y2,o={})=>O.push({t:'seg',x1,y1,x2,y2,e:.9,...o});
  const bar=(cx,cy,len,w,o={})=>O.push({t:'bar',cx,cy,len,w,a:0,e:1,...o});
  const bump=(x,y,r=16)=>O.push({t:'bump',x,y,r});
  const portal=(ax,ay,bx,by)=>O.push({t:'por',ax,ay,bx,by});
  const L=[
    ()=>{for(let r=0;r<8;r++)row(170+r*48,r%2?7:8,r%2?64:40,r%2?W-64:W-40)},
    ()=>{arc(W/2,120,180,.35,Math.PI-.35,11);arc(W/2,220,170,.3,Math.PI-.3,11);arc(W/2,320,160,.3,Math.PI-.3,10);arc(W/2,420,150,.35,Math.PI-.35,9);row(520,6,90,W-90)},
    ()=>{for(let i=0;i<64;i++){const a=i*.38,r=24+i*3.1;peg(W/2+Math.cos(a)*r,330+Math.sin(a)*r*.95)}},
    ()=>{for(let r=0;r<8;r++)row(170+r*46,8,40,W-40,{hp:r%3===1?2:1});},
    ()=>{ring(150,280,70,10,.9);ring(330,280,70,10,-.9);ring(240,440,80,12,.7);row(170,7,70,W-70);row(560,6,80,W-80)},
    ()=>{for(let r=0;r<7;r++)row(180+r*52,7,50,W-50);portal(60,560,W-60,150);portal(W-60,560,60,150)},
    ()=>{seg(30,260,190,320);seg(W-30,260,W-190,320);seg(60,470,200,430);seg(W-60,470,W-200,430);bump(W/2,300);bump(120,400);bump(W-120,400);for(let r=0;r<5;r++)row(170+r*70,6,70,W-70);arc(W/2,520,90,0,Math.PI,8)},
    ()=>{for(let r=0;r<8;r++)osc(170+r*48,7,r%2?60:-60,1.1+r*.08);},
    ()=>{bar(150,300,120,1.6);bar(330,300,120,-1.6);bar(240,470,140,1.2);for(let r=0;r<4;r++)row(170+r*40,8,40,W-40);arc(150,300,85,0,TAU16-.6,10);arc(330,300,85,0,TAU16-.6,10)},
    ()=>{seg(10,170,190,470);seg(W-10,170,W-190,470);for(let r=0;r<7;r++){const y=180+r*38,hw=190-r*20;row(y,Math.max(3,9-r),W/2-hw,W/2+hw)}row(470,3,W/2-40,W/2+40)},
    ()=>{ring(W/2,340,60,8,1.4);ring(W/2,340,120,16,-.6);arc(W/2,340,180,0,TAU16-.35,22);row(150,8,40,W-40)},
    ()=>{for(let r=0;r<6;r++){const y=180+r*65;for(let i=0;i<7;i++)brick(56+i*61,y,(r%2?.4:-.4)*(i%2?1:-1),{hp:r===2||r===4?2:1})}seg(W/2,560,W/2,500)},
    ()=>{for(let r=0;r<6;r++)osc(170+r*60,6,r%2?90:-90,1.3+r*.1);ring(W/2,320,40,6,2);bump(80,520);bump(W-80,520)},
    ()=>{ring(140,300,65,9,1.1,{hp:2});ring(340,300,65,9,-1.1);portal(40,560,W/2,150);portal(W-40,560,W/2,150);for(let r=0;r<4;r++)row(420+r*40,7,60,W-60,{hp:r===0?2:1});row(160,8,40,W-40)},
    ()=>{bar(W/2,260,160,1.3);ring(W/2,260,95,12,-.8,{hp:2});osc(400,7,70,1.2);seg(30,330,150,380);seg(W-30,330,W-150,380);bump(W/2,470,18);portal(50,560,W-50,170);row(170,6,60,W-60);arc(W/2,430,150,.3,Math.PI-.3,9)},
  ];
  const lvi=lv>=0?lv:Math.floor(rnd()*L.length);L[lvi]();
  /* tipos: laranjas, verdes */
  const idx=P.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
  const nor=Math.max(12,Math.min(25,Math.round(P.length*.3)));idx.slice(0,nor).forEach(i=>P[i].k='o');idx.slice(nor,nor+2).forEach(i=>{P[i].k='g';P[i].hp=1});
  return{P,O,nor}
}
const POLV52=['Primeiro Mergulho','Arcos do Véu','Espiral','Pinos Blindados','Carrossel','Portais','Rampas e Para-choques','Pêndulo','Cata-vento','Funil','Olho da Verdade','Muralha','Tempestade','Véu Duplo','Núcleo'];
T3.poBuild52=poBuild52;
function poProg52(){const p=prog38().po||{};return{lv:p.lv||{},best:p.best||0,used:p.used||{}}}
const poOpen52=i=>i===0||!!poProg52().lv[i-1];
const poSetup52={
  intro:o=>o._m==='pvp'?'Os dois atiram no mesmo tabuleiro, um de cada vez. Vence quem fizer mais pontos.':'Limpe todos os pinos laranja. Os verdes ativam o poder do seu Mestre.',
  def:()=>({m:'c',lv:'0',pw:'multi'}),
  fields:o=>{const p=poProg52(),pvp=o._m==='pvp',F=[];if(!pvp)F.push({k:'m',l:'Modo',opts:[{v:'c',n:'Campanha',ico:'🗺',d:'15 tabuleiros em sequência.'},{v:'l',n:'Tabuleiro livre',ico:'🎲',d:'Um tabuleiro sorteado.'}]});
    if(pvp||o.m==='c')F.push({k:'lv',l:'Tabuleiro',wide:1,opts:POLV52.map((n,i)=>{const lock=!pvp&&!poOpen52(i),st=p.lv[i]||0;return{v:String(i),n:`${i+1}. ${n}`,ico:['🔵','🌈','🌀','🛡','🎠','🌀','↗','〰','🌬','🔻','👁','🧱','⛈','✖','✶'][i],d:lock?'Vença o anterior.':'',lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});
    F.push({k:'pw',l:'Mestre (poder dos pinos verdes)',opts:POMK52.map(k=>({v:k,n:POM52[k].n,ico:POM52[k].ico,d:POM52[k].d}))});return F},
  fix:o=>{if(!['c','l'].includes(o.m))o.m='c';if(!POMK52.includes(o.pw))o.pw='multi';let i=Math.max(0,Math.min(14,+o.lv||0));if(o._m!=='pvp')while(i>0&&!poOpen52(i))i--;o.lv=String(i)},
  sum:()=>'Mouse ou ← → miram · clique ou Espaço lança. Laranja: obrigatório · azul: pontos · roxo: 500 · verde: poder · com escudo: 2 acertos.'
};

function poco52(C){
  const W=480,H=640,LX=W/2,LY=46,PR=8,BR=7,G=620,o=C.room.opt||{},pvp=!!C.net,me=me16(C);
  const lv=o.m==='l'&&!pvp?-1:Math.max(0,Math.min(14,+o.lv||0)),pw=POMK52.includes(o.pw)?o.pw:'multi';
  const B=poBuild52(lv,lv<0?C.seed:7);const pegs=B.P,objs=B.O,NOR=pegs.filter(p=>p.k==='o').length;
  const BALLS=pvp?8:gdPick(C.gd,[12,10,10,9]);
  const ps=pvp?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c}];const myI=pvp?Math.max(0,ps.findIndex(p=>p.u===C.me)):0;
  const S={ang:Math.PI/2,balls:pvp?[BALLS,BALLS]:[BALLS],score:ps.map(()=>0),turn:0,T:0,ts:1,slowT:0,zoom:null,bucket:W/2,bdir:1,ballsIn:[],trail:[],pops:[],done:false,won:false,
    pw:{k:pw,shots:0,ready:false},shot:null,fever:false,feverHit:null,used:{},stats:{long:0,multi:0,free:0,feverBig:0},sendAt:0,purple:-1,wonBucket:null,aim:null};
  const rnd=mb32((C.seed^0xb0)>>>0||5);
  const leftO=()=>pegs.filter(p=>p.k==='o'&&!p.gone&&!p.lit).length;
  const mult=()=>{const f=1-leftO()/NOR;return f<.4?1:f<.6?2:f<.75?3:f<.9?5:10};
  function pickPurple(){pegs.forEach(p=>{if(p.k==='p')p.k='b'});const bl=pegs.filter(p=>p.k==='b'&&!p.gone&&!p.lit);if(bl.length){bl[Math.floor(rnd()*bl.length)].k='p'}}
  pickPurple();
  function placeMoving(){pegs.forEach(p=>{const m=p.m;if(!m||p.gone)return;if(m.t==='rot'){const a=m.a0+S.T*m.w;p.x=m.cx+Math.cos(a)*m.r;p.y=m.cy+Math.sin(a)*m.r}else if(m.t==='osc'){p.x=p.x0+Math.sin(S.T*m.w+m.ph)*m.dx;p.y=p.y0}});objs.forEach(q=>{if(q.t==='bar')q.a=S.T*q.w})}
  const bucketW=()=>S.pw.k==='nat'&&S.pw.shots>0?184:92;
  function canShoot(){return!S.done&&!S.ballsIn.length&&S.balls[S.turn]>0&&Date.now()>=C.t0}
  function shoot(){if(!canShoot())return;if(pvp&&S.turn!==myI)return;if(pvp&&!C.host){C.send('pos',{a:S.ang});return}doShoot(S.ang)}
  function doShoot(a){if(!canShoot())return;S.balls[S.turn]--;const v=580;S.ballsIn=[{x:LX,y:LY,vx:Math.cos(a)*v,vy:Math.sin(a)*v,dist:0,lastHit:null,sol:S.pw.k==='sol'&&S.pw.shots>0,solT:3}];
    S.shot={pts:0,hits:0,pi:S.turn,long:false};S.trail=[];fx5('mgJump')}
  function addPts(v,x,y,label){const pi=S.shot?S.shot.pi:S.turn;S.score[pi]+=v;if(S.shot)S.shot.pts+=v;S.pops.push({x,y,t:0,s:label||('+'+v)})}
  function lightPeg(p,b){if(p.lit)return;if(p.hp>1){p.hp--;p.crack=1;fx5('click');S.pops.push({x:p.x,y:p.y,t:0,s:'🛡'});return}
    p.lit=true;S.shot.hits++;const m=mult(),base=p.k==='o'?100:p.k==='p'?500:10;addPts(base*m,p.x,p.y);
    if(p.k==='o'){fx5('mgCoin');if(b.lastHit&&Math.hypot(p.x-b.lastHit[0],p.y-b.lastHit[1])>260&&!S.shot.long){S.shot.long=true;S.stats.long++;addPts(2500,p.x,p.y-20,'TIRO LONGO! +2500');C.achieve?.('po_longo');C.fx?.float(W/2,200,'Tiro Longo!',{col:'#ffd36b',size:26})}}else fx5(p.k==='p'?'activate':'click');
    if(p.k==='g'){S.pw.ready=true;S.used[S.pw.k]=1;activate(b)}
    if(p.k==='o'&&leftO()===0&&!S.fever){S.fever=true;S.slowT=1.8;S.zoom={x:p.x,y:p.y};S.feverHit=p;fx5('mgWin');C.fx?.flash('#fff3c0',.5);C.fx?.float(W/2,H/2,'ÊXTASE!',{col:'#ff9bf0',size:48,life:2})}
    b.lastHit=[p.x,p.y]}
  function activate(b){const k=S.pw.k;C.fx?.float(W/2,140,`${POM52[k].ico} ${POM52[k].n}!`,{col:'#7dffa8',size:22});fx5('bb5');
    if(k==='multi'){for(let i=0;i<2;i++)S.ballsIn.push({x:b.x,y:b.y,vx:b.vx*(i?.7:-.7)+(i?120:-120),vy:-Math.abs(b.vy)*.6-80,dist:0,lastHit:b.lastHit,sol:false})}
    else if(k==='sol'){S.pw.shots=1;b.sol=true;b.solT=2.5}else if(k==='ver')S.pw.shots=3;else if(k==='nat')S.pw.shots=3;else if(k==='ine')S.pw.shots=1}
  function collide(b,dt){
    if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.85}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.85}if(b.y<BR&&b.vy<0){b.y=BR;b.vy=-b.vy*.8}
    for(const p of pegs){if(p.gone)continue;let nx,ny,d,pen;
      if(p.br){const c=Math.cos(-p.a),s=Math.sin(-p.a),lx=(b.x-p.x)*c-(b.y-p.y)*s,ly=(b.x-p.x)*s+(b.y-p.y)*c,cx=clamp12(lx,-p.w/2,p.w/2),cy=clamp12(ly,-p.h/2,p.h/2),dx=lx-cx,dy=ly-cy;d=Math.hypot(dx,dy);if(d>=BR||d===0)continue;
        const c2=Math.cos(p.a),s2=Math.sin(p.a);nx=(dx*c2-dy*s2)/d;ny=(dx*s2+dy*c2)/d;pen=BR-d}
      else{const dx=b.x-p.x,dy=b.y-p.y;d=Math.hypot(dx,dy);if(d>=PR+BR||d===0)continue;nx=dx/d;ny=dy/d;pen=PR+BR-d}
      if(b.sol&&p.hp<=1){lightPeg(p,b);continue}
      const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.72*vn*nx;b.vy-=1.72*vn*ny}b.x+=nx*(pen+.5);b.y+=ny*(pen+.5);lightPeg(p,b)}
    for(const q of objs){
      if(q.t==='seg'||q.t==='bar'){let x1,y1,x2,y2;if(q.t==='seg'){x1=q.x1;y1=q.y1;x2=q.x2;y2=q.y2}else{const c=Math.cos(q.a)*q.len/2,s=Math.sin(q.a)*q.len/2;x1=q.cx-c;y1=q.cy-s;x2=q.cx+c;y2=q.cy+s}
        const ex=x2-x1,ey=y2-y1,l2=ex*ex+ey*ey,t=clamp12(((b.x-x1)*ex+(b.y-y1)*ey)/l2,0,1),px=x1+ex*t,py=y1+ey*t,dx=b.x-px,dy=b.y-py,d=Math.hypot(dx,dy);
        if(d<BR+3&&d>0){const nx=dx/d,ny=dy/d;let vx=b.vx,vy=b.vy;if(q.t==='bar'){const rx=px-q.cx,ry=py-q.cy;vx-=-ry*q.w;vy-=rx*q.w}const vn=vx*nx+vy*ny;if(vn<0){b.vx-=(1+q.e)*vn*nx;b.vy-=(1+q.e)*vn*ny}b.x=px+nx*(BR+3.5);b.y=py+ny*(BR+3.5)}}
      else if(q.t==='bump'){const dx=b.x-q.x,dy=b.y-q.y,d=Math.hypot(dx,dy);if(d<q.r+BR&&d>0){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=2.35*vn*nx;b.vy-=2.35*vn*ny}b.x=q.x+nx*(q.r+BR+.5);b.y=q.y+ny*(q.r+BR+.5);q.hitT=performance.now();fx5('bb3');if(S.shot)addPts(50,q.x,q.y-20)}}
      else if(q.t==='por'){if((b.pcd||0)>0)continue;if(Math.hypot(b.x-q.ax,b.y-q.ay)<16){b.x=q.bx;b.y=q.by;b.pcd=.35;fx5('activate')}}}
    b.pcd=Math.max(0,(b.pcd||0)-dt)}
  function clearLit(){pegs.forEach(p=>{if(p.lit&&!p.gone){p.gone=true}})}
  function endShot(){const sh=S.shot;clearLit();
    if(sh){if(sh.hits>=10){addPts(sh.hits>=20?5000:2000,W/2,300,`QUIQUE MÚLTIPLO! ${sh.hits} pinos`);S.stats.multi=Math.max(S.stats.multi,sh.hits);if(sh.hits>=20)C.achieve?.('po_quique')}
      if(sh.pts>=25000&&!S.fever){S.balls[sh.pi]++;S.stats.free++;S.pops.push({x:W/2,y:H-80,t:0,s:'REBOTE LIVRE! +1 esfera'});fx5('mgWin')}}
    if(S.pw.k!=='multi'&&S.pw.k!=='ine'&&S.pw.shots>0&&!S.pw.ready)S.pw.shots--;S.pw.ready=false;
    S.shot=null;S.ballsIn=[];pickPurple();
    if(S.fever){finish(true);return}
    if(pvp){const nx=(S.turn+1)%2;if(S.balls[nx]>0)S.turn=nx;else if(S.balls[S.turn]<=0){finish(false);return}}
    if(S.balls.every(n=>n<=0)){finish(false);return}}
  function save(st){let first=false;progPut38(p=>{p.po=p.po||{};p.po.lv=p.po.lv||{};p.po.used=p.po.used||{};Object.assign(p.po.used,S.used);if(lv>=0&&st){first=!p.po.lv[lv];if(st>(p.po.lv[lv]||0))p.po.lv[lv]=st;if(POLV52.every((_,i)=>p.po.lv[i]))C.achieve?.('po_campanha')}if(S.score[myI]>(p.po.best||0))p.po.best=S.score[myI];if(POMK52.every(k=>p.po.used[k]))C.achieve?.('po_mestres')});return first}
  function finish(win){if(S.done)return;S.done=true;S.won=win;
    if(win){const bonus=S.balls.reduce((a,n)=>a+n,0)*5000;if(!pvp)addPts(bonus,W/2,H/2,`+${bonus} pelas esferas`);C.achieve?.('poco')}
    const target=[15,20,25,25,30,30,35,35,40,40,45,45,50,55,60][Math.max(0,lv)]*1000;
    const st=win?1+(S.score[myI]>=target?1:0)+(S.balls[myI]>=3?1:0):0;const first=pvp?false:save(st);
    const mul=gdMul38(C.gd);S.rw=pvp?{ob:S.score[myI]>=Math.max(...S.score)?12:4,why:'duelo no Poço'}:{ob:win?Math.round((8+Math.max(0,lv)*1.5+st*3)*mul+(first?15:0)):2,why:[lv>=0?POLV52[lv]:'livre',st?'★'.repeat(st):'',first?'tabuleiro novo':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    if(pvp&&C.host)C.send('pss',{st:snap()});
    if(pvp&&!C.host)return;
    const rows=ps.map((p,i)=>({u:p.u,n:p.n,c:p.c,s:S.score[i],w:pvp?S.score[i]===Math.max(...S.score):win}));
    setTimeout(()=>C.finish({title:pvp?`🔵 ${rows.find(r=>r.w)?.n||'?'} venceu o Poço · ${Math.max(...S.score)} ⚗`:win?`🔵 ${lv>=0?POLV52[lv]:'Poço'} limpo! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:`🔵 As esferas acabaram · faltaram ${leftO()} laranja`,rows,unit:'⚗',
      html:`<ul class="r38-l"><li>⚗ Pontos: <b>${S.score[myI]}</b></li><li>🎯 Tiros Longos: <b>${S.stats.long}</b></li><li>💥 Maior quique: <b>${S.stats.multi}</b> pinos</li><li>🎁 Rebotes Livres: <b>${S.stats.free}</b></li>${S.wonBucket?`<li>🌈 Balde do Êxtase: <b>+${S.wonBucket}</b></li>`:''}</ul>${!pvp&&win&&lv>=0&&lv<14&&first?`<p class="r38-hi">Tabuleiro ${lv+2}: ${esc(POLV52[lv+1])} foi aberto.</p>`:''}`}),window.__poFast?0:1300)}
  const FB=[10000,50000,100000,50000,10000];
  function stepBalls(dt){
    const bw=bucketW();
    S.ballsIn.forEach(b=>{const sub=6;for(let k=0;k<sub;k++){const h=dt/sub;b.vy+=G*h;const ox=b.x,oy=b.y;b.x+=b.vx*h;b.y+=b.vy*h;b.dist+=Math.hypot(b.x-ox,b.y-oy);if(b.solT>0){b.solT-=h;if(b.solT<=0)b.sol=false}collide(b,h)}
      b.life=(b.life||0)+dt;if(b.life>25)b.y=H+99;let sp=Math.hypot(b.vx,b.vy);if(sp>950){b.vx*=950/sp;b.vy*=950/sp;sp=950}b.stuck=sp<40?(b.stuck||0)+dt:0;if(b.stuck>1.6){pegs.forEach(p=>{if(p.lit)p.gone=true});b.stuck=0;b.vy=-180}
      if(!S.fever&&b.y>H-24&&Math.abs(b.x-S.bucket)<bw/2&&b.vy>0&&!b.caught){b.caught=true;b.y=H+60;S.balls[S.shot?S.shot.pi:S.turn]++;S.pops.push({x:b.x,y:H-50,t:0,s:'Esfera de volta!'});fx5('mgWin')}
      if(S.fever&&b.y>H-30&&!b.fb){b.fb=true;const i=clamp12(Math.floor(b.x/(W/5)),0,4),v=FB[i];S.wonBucket=(S.wonBucket||0)+v;addPts(v,b.x,H-60,`+${v}`);if(v>=100000){S.stats.feverBig++;C.achieve?.('po_extase')}C.fx?.flash('#ffe27a',.3);for(let k=0;k<6;k++)setTimeout(()=>C.fx?.burst(Math.random()*W,H-40,{n:16,col:['#ff9bf0','#ffd36b','#7fe3ff'],kind:'star',sp:300,life:1,size:4,grav:300}),k*80)}
      if(b.y>H+20&&S.pw.k==='ine'&&S.pw.shots>0&&!b.saved&&!S.fever&&S.ballsIn.length===1&&!b.caught){b.saved=true;S.pw.shots=0;b.x=W/2;b.y=40;b.vx=(Math.random()-.5)*120;b.vy=40;S.pops.push({x:W/2,y:80,t:0,s:'🕳 Segunda Chance!'})}});
    const t=S.ballsIn[0];if(t){S.trail.push([t.x,t.y]);if(S.trail.length>18)S.trail.shift()}
    S.ballsIn=S.ballsIn.filter(b=>b.y<=H+20);if(S.shot&&!S.ballsIn.length)endShot()}
  const snap=()=>({T:+S.T.toFixed(3),b:S.ballsIn.map(b=>[Math.round(b.x),Math.round(b.y)]),g:pegs.map(p=>p.gone?2:p.lit?1:0).join(''),k:pegs.map(p=>p.k).join(''),hp:pegs.map(p=>p.hp).join(''),sc:S.score,bl:S.balls,turn:S.turn,ang:S.ang,fever:S.fever,bucket:Math.round(S.bucket),done:S.done,pw:S.pw});
  function aimAt(px,py){S.ang=clamp12(Math.atan2(py-LY,px-LX),.1,Math.PI-.1);if(pvp&&!C.host&&S.turn===myI){const n=Date.now();if(n-(S.aimSent||0)>80){S.aimSent=n;C.send('pam',{a:S.ang})}}}
  function guide(x){const full=S.pw.k==='ver'&&S.pw.shots>0;let b={x:LX,y:LY,vx:Math.cos(S.ang)*580,vy:Math.sin(S.ang)*580,sim:1,lastHit:null},n=full?150:24;x.fillStyle=full?'rgba(125,255,168,.7)':'rgba(255,255,255,.5)';
    const save=pegs.map(p=>[p.lit,p.hp]);const lp=lightPeg;let bounces=0;
    for(let i=0;i<n;i++){const h=.02;b.vy+=G*h;b.x+=b.vx*h;b.y+=b.vy*h;if(full){const vx=b.vx,vy=b.vy;for(const p of pegs){if(p.gone||p.br)continue;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<PR+BR&&d>0){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.72*vn*nx;b.vy-=1.72*vn*ny}b.x=p.x+nx*(PR+BR+.5);b.y=p.y+ny*(PR+BR+.5);bounces++}}}
      if(b.x<BR||b.x>W-BR)b.vx=-b.vx;if(b.y>H)break;if(i%2)x.fillRect(b.x-1.5,b.y-1.5,3,3)}}
  return{st:()=>S,pegs,objs,shoot,doShoot,activate:()=>S.ballsIn[0]&&activate(S.ballsIn[0]),
    reward:()=>S.rw||null,
    next(){if(pvp||lv<0||!S.won||lv>=14)return lv<0?{opt:{},label:'🎲 Outro tabuleiro'}:(!S.won?{opt:{},label:'Tentar de novo'}:null);return{opt:{lv:String(lv+1)},label:`Tabuleiro ${lv+2}: ${POLV52[lv+1]}`}},
    key(code,down){if(!down)return;if(code==='ArrowLeft'||code==='KeyA')aimAt(LX+Math.cos(S.ang+.05)*100,LY+Math.sin(S.ang+.05)*100);if(code==='ArrowRight'||code==='KeyD')aimAt(LX+Math.cos(S.ang-.05)*100,LY+Math.sin(S.ang-.05)*100);if(code==='Space'||code==='Enter')shoot()},
    ptr(t,px,py){if(pvp&&S.turn!==myI)return;if(t==='move'||t==='down')aimAt(px,py);if(t==='up')shoot()},
    msg(p){if(C.host){if(p.from!==ps[S.turn]?.u)return;if(p.t==='pam')S.ang=clamp12(+p.a||1.57,.1,Math.PI-.1);if(p.t==='pos'){S.ang=clamp12(+p.a||1.57,.1,Math.PI-.1);doShoot(S.ang)}}
      else if(p.t==='pss'&&p.from===C.room.host&&p.st){const st=p.st;S.T=st.T;placeMoving();S.ballsV=st.b;[...st.g].forEach((c,i)=>{const q=pegs[i];if(!q)return;q.gone=c==='2';q.lit=c==='1';q.k=st.k[i];q.hp=+st.hp[i];q.crack=q.hp<2&&q.crack});S.score=st.sc;S.balls=st.bl;if(st.turn!==myI||S.turn!==myI)S.ang=st.ang;S.turn=st.turn;S.fever=st.fever;S.bucket=st.bucket;S.pw=st.pw;
        if(st.done&&!S.done){S.done=true;const rows=ps.map((q,i)=>({u:q.u,n:q.n,c:q.c,s:S.score[i],w:S.score[i]===Math.max(...S.score)}));S.rw={ob:S.score[myI]>=Math.max(...S.score)?12:4,xp:4,why:'duelo no Poço'}}}},
    left(u){if(!C.host||S.done)return;const i=ps.findIndex(q=>q.u===u);if(i>=0){S.balls[i]=0;if(S.turn===i&&!S.ballsIn.length)S.turn=1-i}},
    step(dt){if(Date.now()<C.t0)return;
      if(!pvp||C.host){S.slowT=Math.max(0,S.slowT-dt);const ts=S.slowT>0?.25:1;const d2=dt*ts;S.T+=d2;placeMoving();
        if(!S.fever){S.bucket+=S.bdir*110*d2;const bw=bucketW();if(S.bucket<bw/2+4||S.bucket>W-bw/2-4){S.bdir*=-1;S.bucket=clamp12(S.bucket,bw/2+4,W-bw/2-4)}}
        if(!S.done)stepBalls(d2);
        if(pvp&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('pss',{st:snap()})}}
      S.pops=S.pops.filter(p=>(p.t+=dt)<1.1);
      const pv=pvp?` · vez de <b>${esc(ps[S.turn]?.n||'?')}</b> · ${ps.map((q,i)=>`${esc(q.n)} ${S.score[i]}`).join(' × ')}`:'';
      C.hud(`🔵 ${lv>=0?esc(POLV52[lv]):'Livre'} · esferas <b>${S.balls[pvp?myI:0]}</b> · laranja <b>${leftO()}</b>/${NOR} · ×${mult()} · ⚗ <b>${S.score[myI]}</b> · ${POM52[S.pw.k].ico}${S.pw.shots>0?` ${S.pw.shots}`:''}${pv}`)},
    draw(x){
      const now=performance.now();const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,S.fever?'#3a0f3a':'#0c1530');gr.addColorStop(1,'#1d0d2c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.save();if(S.slowT>0&&S.zoom){const k=1+.35*Math.min(1,S.slowT);x.translate(S.zoom.x,S.zoom.y);x.scale(k,k);x.translate(-S.zoom.x,-S.zoom.y)}
      if(!S.ballsIn.length&&!(S.ballsV&&S.ballsV.length)&&!S.done&&(!pvp||S.turn===myI))guide(x);
      objs.forEach(q=>{if(q.t==='seg'){x.strokeStyle='#7fe3ff';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(q.x1,q.y1);x.lineTo(q.x2,q.y2);x.stroke()}
        else if(q.t==='bar'){const c=Math.cos(q.a)*q.len/2,s=Math.sin(q.a)*q.len/2;x.strokeStyle='#c39bff';x.lineWidth=7;x.lineCap='round';x.beginPath();x.moveTo(q.cx-c,q.cy-s);x.lineTo(q.cx+c,q.cy+s);x.stroke();x.beginPath();x.arc(q.cx,q.cy,6,0,TAU16);x.fillStyle='#fff';x.fill()}
        else if(q.t==='bump'){const hit=now-(q.hitT||0)<150;x.beginPath();x.arc(q.x,q.y,q.r+(hit?3:0),0,TAU16);x.fillStyle=hit?'#fff':'#ff7ac8';x.fill();x.strokeStyle='#ffd36b';x.lineWidth=3;x.stroke()}
        else if(q.t==='por'){[[q.ax,q.ay,'#7dffa8'],[q.bx,q.by,'#ffb347']].forEach(([px,py,c],i)=>{x.save();x.translate(px,py);x.rotate(now/400*(i?-1:1));x.strokeStyle=c;x.lineWidth=3;x.beginPath();x.ellipse(0,0,15,11,0,0,TAU16);x.stroke();x.restore()})}});
      pegs.forEach(p=>{if(p.gone)return;const col=p.k==='o'?'#ff8a2a':p.k==='p'?'#c070ff':p.k==='g'?'#3fd46a':'#3a8bff';
        if(p.br){x.save();x.translate(p.x,p.y);x.rotate(p.a);rr21(x,-p.w/2,-p.h/2,p.w,p.h,4);x.fillStyle=p.lit?'#fff':col;x.fill();if(p.lit){x.lineWidth=3;x.strokeStyle=col;x.stroke()}if(p.hp>1){x.strokeStyle='#ddd';x.lineWidth=2;x.stroke()}x.restore();return}
        x.beginPath();x.arc(p.x,p.y,PR,0,TAU16);x.fillStyle=p.lit?'#fff':col;x.fill();if(p.lit){x.lineWidth=3;x.strokeStyle=col;x.stroke()}
        if(p.hp>1){x.lineWidth=2.5;x.strokeStyle='#e8e8f0';x.beginPath();x.arc(p.x,p.y,PR+3,0,TAU16);x.stroke()}else if(p.crack){x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=1.5;x.beginPath();x.moveTo(p.x-4,p.y-3);x.lineTo(p.x+1,p.y+1);x.lineTo(p.x+4,p.y-2);x.stroke()}
        if(p===S.feverHit&&S.slowT>0){x.strokeStyle='#ff9bf0';x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,PR+8+Math.sin(now/60)*3,0,TAU16);x.stroke()}});
      S.trail.forEach(([tx,ty],i)=>{x.globalAlpha=i/S.trail.length*.4;x.beginPath();x.arc(tx,ty,BR*.7,0,TAU16);x.fillStyle='#ffd36b';x.fill()});x.globalAlpha=1;
      (S.ballsV&&!C.host&&pvp?S.ballsV.map(([a,b])=>({x:a,y:b})):S.ballsIn).forEach(b=>{x.beginPath();x.arc(b.x,b.y,BR,0,TAU16);x.fillStyle=b.sol?'#ff9b3d':'#ffd36b';if(b.sol){x.shadowColor='#ff9b3d';x.shadowBlur=16}x.fill();x.shadowBlur=0;x.strokeStyle='#fff';x.lineWidth=2;x.stroke()});
      x.restore();
      x.save();x.translate(LX,LY);x.rotate(S.ang-Math.PI/2);x.fillStyle='#c39bff';x.fillRect(-7,0,14,30);x.restore();sprAt16(x,pvp?(ps[S.turn]?.c??me.c):me.c,LX,LY-12,48);
      if(S.fever){FB.forEach((v,i)=>{const bx=i*W/5;x.fillStyle=['#5a2a8a','#8a3a9a','#ff7ac8','#8a3a9a','#5a2a8a'][i];x.fillRect(bx+2,H-30,W/5-4,30);t21(x,v>=1e5?'100 mil':v>=5e4?'50 mil':'10 mil',bx+W/10,H-15,{size:12,w:800})})}
      else{const bw=bucketW();rr21(x,S.bucket-bw/2,H-26,bw,20,8);x.fillStyle=bw>92?'#7dffa8':'#3fae5a';x.fill();t21(x,'balde',S.bucket,H-16,{size:11,col:'#0b2'})}
      S.pops.forEach(p=>t21(x,p.s,p.x,p.y-p.t*40,{size:p.s.length>10?15:13,w:800,col:p.s.startsWith('+')?'#fff':'#ffd36b',stroke:3}));
      const bl=S.balls[pvp?myI:0];for(let i=0;i<Math.min(bl,20);i++){x.beginPath();x.arc(14,90+i*16,5,0,TAU16);x.fillStyle='#ffd36b';x.fill()}
      t21(x,`×${mult()}`,W-18,90,{size:18,w:900,col:'#ffd36b',al:'right'});t21(x,`${POM52[S.pw.k].ico}${S.pw.shots>0?' '+S.pw.shots:''}`,W-18,116,{size:16,al:'right'});
      if(pvp)t21(x,S.turn===myI?'Sua vez!':`Vez de ${ps[S.turn]?.n||'?'}`,W/2,104,{size:15,w:800,col:S.turn===myI?'#7dffa8':'#ccc',stroke:3});
      if(S.slowT>0)t21(x,'ÊXTASE',W/2,150,{size:36,w:900,col:'#ff9bf0',stroke:5});
    }
  };
}
Object.assign(ACH,{
  po_campanha:{ico:'🗺',n:'Fundo do Poço',d:'Vença os 15 tabuleiros da Campanha do Poço das Almas.'},
  po_extase:{ico:'🌈',n:'Êxtase Máximo',d:'Acerte o balde de 100 mil no Êxtase do Poço.'},
  po_longo:{ico:'🎯',n:'Tiro Longo',d:'Faça um Tiro Longo no Poço das Almas.'},
  po_quique:{ico:'💥',n:'Quique Múltiplo',d:'Acerte 20 pinos com uma esfera só.'},
  po_mestres:{ico:'🧙',n:'Todos os Mestres',d:'Ative o poder dos 5 Mestres do Poço.',secret:true},
});
defineArcadeGame('poco',{...GAMES12.poco,make:poco52,setup:poSetup52,
  desc:'Peggle teosófico: 15 tabuleiros com pinos móveis, hastes giratórias, portais, rampas e pinos blindados. Mestres com poderes, Êxtase e bônus de estilo. PvP com tiros alternados.',
  rule:'Limpe os pinos laranja. Quanto mais laranjas acesos, maior o multiplicador. Rebote Livre: 25 mil num tiro devolve a esfera.'});
console.info('[Tulpa] Etapa 52 carregada (Poço das Almas 2.0)');

/* ===================================================================
   TULPA · ETAPA 53 — 🕹 ARCADE 2.0 · ONDA 8 (parte 2)
   📖 TEOSOFIA CLICKER 2.0
   14 geradores (de Suturas até o Olho do Absoluto), ~90 melhorias:
   bênçãos por gerador, melhorias de clique, sinergias entre geradores
   e melhorias dos orbes. Eventos: Orbes Dourados da Fé (Frenesi ×7,
   Tempestade de Cliques ou Chuva de Essência) e Fendas de Inexistência
   (risco e recompensa). Prestígio: Despertar Cósmico → Fragmentos
   Celestiais (+3% de produção cada) e uma Árvore de Prestígio.
   Registrar no placar converte marcos em Óbolos do Arcade.
   =================================================================== */
const CKG53=[['Sutura','🩹',15,.1],['Cultista','🕯',100,1],['Tomo Menor','📕',1100,8],['Tulpa Doméstica','😼',12000,47],['Oráculo','🔮',130000,260],['Santuário','🏛',1.4e6,1400],['Biblioteca Proibida','📚',2e7,7800],['Círculo de Ritual','⭕',3.3e8,44000],['Portal do Véu','🌀',5.1e9,260000],['Arquivo Akáshico','🗄',7.5e10,1.6e6],['Motor de Realidade','⚙',1e12,1e7],['Nebulosa Teosófica','🌌',1.4e13,6.5e7],['Coração do Cosmos','💠',1.7e14,4.3e8],['Olho do Absoluto','👁',2.1e15,2.9e9]];
const CKT53=[[1,10,'Bênção'],[10,50,'Consagração'],[25,500,'Ascensão'],[50,5e4,'Transcendência'],[100,5e6,'Apoteose']];
const CKU53=(()=>{const U=[];
  CKG53.forEach((g,i)=>CKT53.forEach(([n,m,nm],t)=>U.push({id:`g${i}t${t}`,n:`${nm}: ${g[0]}`,ico:g[1],d:`${g[0]}: produção ×2`,c:g[2]*m,req:d=>d.g[i]>=n,gen:i})));
  [['Dedos Iluminados','👆',100,d=>d.clicks>=30],['Leitura Dinâmica','📖',2500,d=>d.clicks>=150],['Toque da Verdade','✋',6e4,d=>d.clicks>=500],['Clique Transcendente','✶',2e6,d=>d.clicks>=1500],['Mão do Absoluto','🖐',5e8,d=>d.clicks>=4000]].forEach(([n,ico,c,req],k)=>U.push({id:'clk'+k,n,ico,d:k<3?'Clique ×2':'Clique +1% da produção por segundo',c,req,click:k<3?'x2':'pct'}));
  [['syn0','Fé Contagiante','🕯','Cada Cultista: +2% no clique',5e5,d=>d.g[1]>=25],['syn1','Tulpas Cuidadoras','😼','Tulpas dobram a produção das Suturas',2e5,d=>d.g[3]>=10],['syn2','Oráculos Conectados','🔮','+1% de produção total por Oráculo',5e6,d=>d.g[4]>=25],['syn3','Leituras Proibidas','📚','Tomos +5% por Biblioteca',5e7,d=>d.g[6]>=5],['syn4','Rituais em Rede','⭕','Círculos +1% por Cultista',2e9,d=>d.g[7]>=10],['syn5','Portais Sincronizados','🌀','Santuários e Oráculos +1% por Portal',3e10,d=>d.g[8]>=10],['syn6','Motor Akáshico','⚙','Motores ×2 com 10 Arquivos',5e12,d=>d.g[10]>=5&&d.g[9]>=10],['syn7','Cosmos Interior','🌌','+0,5% total por gerador possuído',1e10,d=>CKG53.reduce((a,_,i)=>a+d.g[i],0)>=200]].forEach(([id,n,ico,d2,c,req])=>U.push({id,n,ico,d:d2,c,req}));
  [['orbA','Fé Constante','✨','Orbes Dourados aparecem 2× mais',1e6,d=>d.orbs>=1],['orbB','Brilho Duradouro','🌟','Orbes ficam 2× mais tempo',5e6,d=>d.orbs>=3],['orbC','Sorte Dourada','🍀','Frenesi dura 2× mais',5e7,d=>d.orbs>=7]].forEach(([id,n,ico,d2,c,req])=>U.push({id,n,ico,d:d2,c,req}));
  return U})();
const CKTREE53=[
  {k:'luz1',n:'Luz Perene',d:'+25% de produção',c:1,col:0,row:0},{k:'luz2',n:'Luz Eterna',d:'+50% de produção',c:3,col:0,row:1,req:'luz1'},{k:'luz3',n:'Sol Interior',d:'Produção ×2',c:10,col:0,row:2,req:'luz2'},{k:'luz4',n:'Supernova',d:'Produção ×3',c:40,col:0,row:3,req:'luz3'},
  {k:'ini1',n:'Memória do Despertar',d:'Começa com 15 Suturas e 5 Cultistas',c:1,col:1,row:0},{k:'ini2',n:'Herança Arcana',d:'Começa com 10 de cada gerador até o Tomo',c:4,col:1,row:1,req:'ini1'},{k:'ini3',n:'Reencarnação Plena',d:'Começa com 10 de cada gerador até o Oráculo',c:15,col:1,row:2,req:'ini2'},
  {k:'off1',n:'Sonho Lúcido',d:'Ganho fora de jogo até 24 h',c:2,col:2,row:0},{k:'off2',n:'Vigília Eterna',d:'Ganho fora de jogo até 72 h',c:8,col:2,row:1,req:'off1'},
  {k:'ob1',n:'Dízimo Arcano',d:'+50% de Óbolos no Arcade',c:2,col:3,row:0},{k:'ob2',n:'Tesouro Celestial',d:'+100% de Óbolos no Arcade',c:6,col:3,row:1,req:'ob1'},{k:'ob3',n:'Cofre do Véu',d:'+200% de Óbolos no Arcade',c:20,col:3,row:2,req:'ob2'},
  {k:'orb1',n:'Fé Constante',d:'Orbes e Fendas aparecem 2× mais',c:2,col:4,row:0},{k:'orb2',n:'Fenda Domada',d:'Fendas nunca dão o efeito ruim',c:8,col:4,row:1,req:'orb1'},{k:'clk1',n:'Mão Astral',d:'Clique +3% da produção por segundo',c:3,col:4,row:2},{k:'keep',n:'Biblioteca Eterna',d:'Mantém as melhorias de clique ao Despertar',c:12,col:4,row:3,req:'clk1'}];
const fmt53=n=>{if(!isFinite(n))return'∞';if(n>0&&n<10&&n%1)return n.toFixed(1).replace('.',',');n=Math.floor(n);const u=['','mil','mi','bi','tri','quatri','quinti','sexti','septi'];let i=0,v=n;while(v>=1000&&i<u.length-1){v/=1000;i++}return i?(v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v)).toString().replace('.',',')+' '+u[i]:String(n)};
const CKKEY53=()=>'tulpa_clk_'+(uid3()||'anon');
function ckLoad53(key){let d={v:2,e:0,tot:0,all:0,g:CKG53.map(()=>0),up:{},clicks:0,at:Date.now(),frag:0,spent:0,tree:{},asc:0,orbs:0,rifts:0,paid:{m:0,a:0},buyN:1};
  try{const o=JSON.parse(localStorage.getItem(key)||'null');if(o&&typeof o.e==='number'){
    if(o.v!==2){/* versão 1: 7 geradores */const map=[0,1,2,4,3,5,8];const g=CKG53.map(()=>0);(o.g||[]).forEach((n,i)=>{if(map[i]!=null)g[map[i]]=n|0});const up={};for(let k=0;k<Math.min(4,o.u|0);k++)up['clk'+k]=1;
      d={...d,e:o.e,tot:o.tot||o.e,all:o.tot||o.e,g,up,clicks:o.clicks|0,at:o.at||Date.now()}}
    else d={...d,...o,g:CKG53.map((_,i)=>(o.g||[])[i]|0),up:o.up||{},tree:o.tree||{},paid:o.paid||{m:0,a:0}}}}catch(e){}
  return d}
const ckSetup53={
  intro:()=>'O progresso fica salvo neste aparelho e continua rendendo enquanto você está fora.',
  def:()=>({}),fields:()=>[],
  sum:()=>{const d=ckLoad53(CKKEY53());return`📖 ${fmt53(d.e)} de Essência · ${CKG53.reduce((a,_,i)=>a+d.g[i],0)} geradores · ✨ ${d.frag} Fragmentos Celestiais · ${d.asc} Despertar${d.asc===1?'':'es'}. Clique no tomo (ou Espaço), compre geradores e melhorias, e clique nos orbes dourados quando aparecerem.`}
};

function clicker53(C){
  const W=800,H=450,KEY=CKKEY53(),TOME={x:145,y:236,r:84};
  let d=ckLoad53(KEY);
  const S={pops:[],bump:0,offline:0,orb:null,orbAt:0,rift:null,riftAt:0,frenzy:0,storm:0,colapse:0,scroll:0,tab:'up',sel:null,selT:null,ascConf:0,rain:[],msg:'',msgT:0,data:()=>d};
  const has=k=>!!d.up[k],tr=k=>!!d.tree[k];
  const owned=()=>CKG53.reduce((a,_,i)=>a+d.g[i],0);
  function genMult(i){let m=Math.pow(2,CKT53.filter((_,t)=>has(`g${i}t${t}`)).length);
    if(i===0&&has('syn1'))m*=2;if(i===2&&has('syn3'))m*=1+.05*d.g[6];if(i===7&&has('syn4'))m*=1+.01*d.g[1];if((i===4||i===5)&&has('syn5'))m*=1+.01*d.g[8];if(i===10&&has('syn6'))m*=2;return m}
  function globalMult(){let m=1+.03*d.frag;if(tr('luz1'))m*=1.25;if(tr('luz2'))m*=1.5;if(tr('luz3'))m*=2;if(tr('luz4'))m*=3;if(has('syn2'))m*=1+.01*d.g[4];if(has('syn7'))m*=1+.005*owned();return m}
  const baseRate=()=>CKG53.reduce((a,g,i)=>a+g[3]*d.g[i]*genMult(i),0)*globalMult();
  const rate=()=>baseRate()*(S.frenzy>0?7:1)*(S.colapse>0?.5:1);
  function perClick(){let v=1;for(let k=0;k<3;k++)if(has('clk'+k))v*=2;if(has('syn0'))v*=1+.02*d.g[1];let pct=(has('clk3')?.01:0)+(has('clk4')?.01:0)+(tr('clk1')?.03:0);v+=rate()*pct;return v*(S.storm>0?77:1)}
  const cost=(i,n=1)=>{let c=0;for(let k=0;k<n;k++)c+=Math.ceil(CKG53[i][2]*Math.pow(1.15,d.g[i]+k));return c};
  const maxBuy=i=>{let n=0,c=0;while(n<1000){const nc=Math.ceil(CKG53[i][2]*Math.pow(1.15,d.g[i]+n));if(c+nc>d.e)break;c+=nc;n++}return n};
  const fragNext=()=>Math.max(0,Math.floor(Math.cbrt(d.all/1e8))-d.frag);
  /* ganho offline */
  {const cap=(tr('off2')?72:tr('off1')?24:8)*3600,away=Math.min(cap,Math.max(0,(Date.now()-(d.at||Date.now()))/1000));if(away>30){const g=baseRate()*away;if(g>0){gain(g);S.offline=g}}}
  function save(){d.at=Date.now();try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  function gain(v){d.e+=v;d.tot+=v;d.all+=v;if(d.all>=1e6)C.achieve?.('clicker')}
  function say(m){S.msg=m;S.msgT=performance.now()}
  const orbEvery=()=>(tr('orb1')||has('orbA')?.5:1)*(tr('orb1')&&has('orbA')?.75:1);
  function schedule(){const now=Date.now();S.orbAt=now+(60000+Math.random()*60000)*orbEvery();S.riftAt=now+(180000+Math.random()*120000)*(tr('orb1')?.5:1)}
  schedule();
  function clickOrb(){S.orb=null;d.orbs++;if(d.orbs>=10)C.achieve?.('ck_orbe');const r=Math.random();fx5('mgWin');
    if(r<.5){S.frenzy=30*(has('orbC')?2:1);say('✨ Frenesi! Produção ×7');C.fx?.flash('#ffd36b',.3)}
    else if(r<.75){S.storm=10;say('⚡ Tempestade de Cliques! Clique ×77');C.fx?.flash('#fff',.25)}
    else{const v=Math.min(d.e*.15,baseRate()*900)+13;gain(v);say(`🌧 Chuva de Essência! +${fmt53(v)}`);for(let k=0;k<40;k++)S.rain.push({x:Math.random()*W,y:-Math.random()*200,v:150+Math.random()*200})}
    schedule();save()}
  function clickRift(){S.rift=null;d.rifts++;const r=Math.random();fx5('activate');C.fx?.flash('#6a2aa0',.35);
    if(r<.08&&d.asc>=1){d.frag++;say('💎 Um Fragmento Celestial caiu da Fenda!')}
    else if(r<.7||tr('orb2')){const v=Math.min(d.e*.25,baseRate()*3600)+100;gain(v);say(`🕳 Colheita do Vazio! +${fmt53(v)}`);C.achieve?.('ck_fenda')}
    else{S.colapse=60;say('🌑 Colapso Breve: produção ×0,5 por 60 s')}
    S.riftAt=Date.now()+(180000+Math.random()*120000)*(tr('orb1')?.5:1);save()}
  function buyGen(i){const n=d.buyN==='max'?maxBuy(i):d.buyN;if(n<1){fx5('error');return false}const c=cost(i,n);if(d.e<c){fx5('error');return false}d.e-=c;d.g[i]+=n;fx5('mgCoin');if(i===10)C.achieve?.('ck_motor');save();return true}
  const avail=()=>CKU53.filter(u=>!has(u.id)&&u.req(d)).sort((a,b)=>a.c-b.c);
  function buyUp(u){if(has(u.id)||!u.req(d))return false;if(d.e<u.c){fx5('error');say(`Faltam ${fmt53(u.c-d.e)} de Essência`);return false}d.e-=u.c;d.up[u.id]=1;fx5('activate');save();return true}
  function buyNode(n){if(tr(n.k))return false;if(n.req&&!tr(n.req)){say('Compre o nó anterior primeiro');fx5('error');return false}if(d.frag-d.spent<n.c){say(`Precisa de ${n.c} Fragmentos livres`);fx5('error');return false}d.spent+=n.c;d.tree[n.k]=1;fx5('mgWin');if(Object.keys(d.tree).length>=10)C.achieve?.('ck_arvore');save();return true}
  function ascend(){const n=fragNext();if(n<1){say('Junte mais Essência para Despertar');return false}
    d.frag+=n;d.asc++;const keepClicks=tr('keep');const up={};if(keepClicks)Object.keys(d.up).filter(k=>k.startsWith('clk')).forEach(k=>up[k]=1);
    d.up=up;d.e=0;d.tot=0;d.g=CKG53.map(()=>0);
    if(tr('ini1')){d.g[0]=15;d.g[1]=5}if(tr('ini2')){for(let i=0;i<3;i++)d.g[i]=Math.max(d.g[i],10)}if(tr('ini3')){for(let i=0;i<5;i++)d.g[i]=Math.max(d.g[i],10)}
    S.frenzy=S.storm=S.colapse=0;C.achieve?.('ck_despertar');fx5('mgWin');C.fx?.flash('#fff',.6);say(`✨ Despertar Cósmico! +${n} Fragmento${n>1?'s':''} Celestia${n>1?'is':'l'}`);save();return true}
  /* geometria */
  const ROW=44,GX=300,GY=52,VIS=8,genB=k=>({x:GX,y:GY+k*ROW,w:280,h:ROW-4});
  const tabB={up:{x:604,y:6,w:92,h:26},asc:{x:700,y:6,w:94,h:26}},buyB=[1,10,'max'].map((n,i)=>({n,x:GX+96+i*48,y:18,w:44,h:24})),upArrow={x:GX+250,y:18,w:30,h:24},dnArrow={x:GX+250,y:GY+VIS*ROW-2,w:30,h:22};
  const upCell=k=>({x:606+(k%4)*47,y:40+Math.floor(k/4)*47,w:43,h:43}),buyBtn={x:606,y:370,w:186,h:30},REG={x:606,y:410,w:186,h:32};
  const nodeXY=n=>({x:622+n.col*38,y:148+n.row*44}),ascBtn={x:606,y:84,w:186,h:28};
  const visGens=()=>{let n=1;for(let i=1;i<CKG53.length;i++){if(d.g[i-1]>0||d.all>=CKG53[i][2]*.5)n=i+1}return Math.min(CKG53.length,n+1)};
  function finish(){save();const now=Math.floor(Math.log10(Math.max(1,d.all)));const nm=Math.max(0,now-Math.max(2,d.paid.m||0)),na=Math.max(0,d.asc-(d.paid.a||0));
    const bonus=1+(tr('ob1')?.5:0)+(tr('ob2')?1:0)+(tr('ob3')?2:0);const ob=Math.round((nm*4+na*20)*bonus);d.paid={m:Math.max(d.paid.m||0,now),a:d.asc};save();
    S.rw={ob,xp:Math.round(ob*.6)+2,why:ob?`${nm} marco${nm===1?'':'s'} novo${nm===1?'':'s'}${na?` · ${na} Despertar`:''}`:'sem marcos novos desde o último registro'};
    const me=me16(C);C.finish({title:`📖 Biblioteca registrada · ${fmt53(d.all)} de Essência ao todo`,rows:[{u:C.me,n:me.n,c:me.c,s:Math.floor(d.all),st:fmt53(d.all)+' ⚗',w:d.all>=1e6}],unit:'⚗',
      html:`<ul class="r38-l"><li>⚗ Essência agora: <b>${fmt53(d.e)}</b> (${fmt53(rate())}/s)</li><li>🏗 Geradores: <b>${owned()}</b> · melhorias: <b>${Object.keys(d.up).length}</b>/${CKU53.length}</li><li>✨ Fragmentos Celestiais: <b>${d.frag}</b> · Despertares: <b>${d.asc}</b></li><li>🎯 Próximo marco de Óbolos: ${fmt53(Math.pow(10,Math.max(3,now+1)))}</li></ul>`})}
  function click(px,py){
    if(S.orb&&Math.hypot(px-S.orb.x,py-S.orb.y)<30){clickOrb();return}
    if(S.rift&&Math.hypot(px-S.rift.x,py-S.rift.y)<34){clickRift();return}
    if(Math.hypot(px-TOME.x,py-TOME.y)<TOME.r){const v=perClick();gain(v);d.clicks++;S.bump=1;S.pops.push({x:px,y:py,t:0,s:'+'+fmt53(v)});C.stat?.('clicks');fx5('click');return}
    for(const b of buyB)if(inB16(b,px,py)){d.buyN=b.n;fx5('click');return}
    if(inB16(upArrow,px,py)){S.scroll=Math.max(0,S.scroll-1);return}if(inB16(dnArrow,px,py)){S.scroll=Math.min(Math.max(0,visGens()-VIS),S.scroll+1);return}
    for(let k=0;k<VIS;k++){const i=k+S.scroll;if(i>=visGens())break;if(inB16(genB(k),px,py)){buyGen(i);return}}
    if(inB16(tabB.up,px,py)){S.tab='up';S.sel=null;return}if(inB16(tabB.asc,px,py)){S.tab='asc';S.sel=null;return}
    if(inB16(REG,px,py)){finish();return}
    if(S.tab==='up'){const L=avail().slice(0,24);for(let k=0;k<Math.min(L.length,24);k++)if(inB16(upCell(k),px,py)){if(S.sel===L[k].id)buyUp(L[k]);else S.sel=L[k].id;return}
      if(inB16(buyBtn,px,py)&&S.sel){const u=CKU53.find(q=>q.id===S.sel);if(u&&buyUp(u))S.sel=null;return}}
    else{if(inB16(ascBtn,px,py)){if(S.ascConf>0){ascend();S.ascConf=0}else if(fragNext()>=1){S.ascConf=4}else say(`Despertar a partir de ${fmt53(1e8*Math.pow(d.frag+1,3))} de Essência ao todo`);return}
      for(const n of CKTREE53){const p=nodeXY(n);if(Math.hypot(px-p.x,py-p.y)<17){if(S.sel===n.k)buyNode(n);else S.sel=n.k;return}}
      if(inB16(buyBtn,px,py)&&S.sel){const n=CKTREE53.find(q=>q.k===S.sel);if(n)buyNode(n);return}}}
  return{st:()=>S,data:()=>d,gain,rate,perClick,buyGen,buyUp,buyNode,ascend,fragNext,avail,clickOrb,clickRift,save,finish,
    spawnOrb(){S.orb={x:40+Math.random()*220,y:90+Math.random()*260,t:0}},spawnRift(){S.rift={x:40+Math.random()*220,y:90+Math.random()*260,t:0}},
    reward:()=>S.rw||null,
    key(code,down){if(!down)return;if(code==='Space')click(TOME.x,TOME.y)},
    ptr(t,px,py){if(t==='down'&&Date.now()>=C.t0)click(px,py)},
    end(){save()},
    step(dt){
      if(Date.now()<C.t0)return;gain(rate()*dt);
      S.frenzy=Math.max(0,S.frenzy-dt);S.storm=Math.max(0,S.storm-dt);S.colapse=Math.max(0,S.colapse-dt);S.ascConf=Math.max(0,S.ascConf-dt);
      S.bump=Math.max(0,S.bump-dt*6);S.pops=S.pops.filter(p=>(p.t+=dt)<1);S.rain.forEach(r=>r.y+=r.v*dt);S.rain=S.rain.filter(r=>r.y<H+20);
      const now=Date.now();if(!S.orb&&now>S.orbAt)S.orb={x:40+Math.random()*220,y:90+Math.random()*260,t:0};
      if(S.orb&&(S.orb.t+=dt)>13*(has('orbB')?2:1)){S.orb=null;schedule()}
      if(!S.rift&&now>S.riftAt)S.rift={x:40+Math.random()*220,y:90+Math.random()*260,t:0};
      if(S.rift&&(S.rift.t+=dt)>10){S.rift=null;S.riftAt=now+(180000+Math.random()*120000)*(tr('orb1')?.5:1)}
      if(now>(S.saveAt||0)){S.saveAt=now+5000;save()}
      C.hud(`📖 <b>${fmt53(d.e)}</b> ⚗ · ${fmt53(rate())}/s · ${fmt53(perClick())} por clique${S.frenzy>0?' · <b style="color:#ffd36b">✨ Frenesi ×7</b>':''}${S.storm>0?' · <b style="color:#fff">⚡ Tempestade ×77</b>':''}${S.colapse>0?' · <b style="color:#b48cff">🌑 Colapso</b>':''} · ✨ ${d.frag}`)},
    draw(x){
      const now=performance.now();x.fillStyle=S.colapse>0?'#140e1c':'#1b1410';x.fillRect(0,0,W,H);
      if(S.frenzy>0){x.fillStyle=`rgba(255,211,107,${.05+.03*Math.sin(now/200)})`;x.fillRect(0,0,W,H)}
      t21(x,fmt53(d.e)+' ⚗',TOME.x,34,{size:26,w:800,col:'#ffd36b'});t21(x,`${fmt53(rate())} por segundo`,TOME.x,60,{size:13,col:'#cfc3b0'});
      if(d.frag)t21(x,`✨ ${d.frag} Fragmentos · +${d.frag*3}%`,TOME.x,80,{size:11,col:'#c39bff'});
      const s=1+S.bump*.06;x.save();x.translate(TOME.x,TOME.y);x.scale(s,s);x.beginPath();x.arc(0,0,TOME.r,0,TAU16);const gr=x.createRadialGradient(0,0,10,0,0,TOME.r);gr.addColorStop(0,S.frenzy>0?'#fff3b0':S.storm>0?'#ffffff':'#c39bff');gr.addColorStop(1,'rgba(195,155,255,0)');x.fillStyle=gr;x.fill();
      rr16(x,-50,-62,100,124,8);x.fillStyle='#5a2a1a';x.fill();x.strokeStyle='#ffd36b';x.lineWidth=3;x.stroke();t21(x,'✶',0,-8,{size:44,col:'#ffd36b'});t21(x,'TOMO',0,38,{size:12,col:'#ffd36b'});x.restore();
      t21(x,`${fmt53(perClick())} por clique`,TOME.x,TOME.y+TOME.r+18,{size:12,col:'#9a8a70'});
      const st=[S.frenzy>0?`✨ Frenesi ${Math.ceil(S.frenzy)}s`:'',S.storm>0?`⚡ Tempestade ${Math.ceil(S.storm)}s`:'',S.colapse>0?`🌑 Colapso ${Math.ceil(S.colapse)}s`:''].filter(Boolean).join(' · ');if(st)t21(x,st,TOME.x,H-38,{size:12,w:800,col:'#ffd36b'});
      if(S.offline)t21(x,`Enquanto você esteve fora: +${fmt53(S.offline)} ⚗`,TOME.x,H-18,{size:11,col:'#7dffa8'});
      S.rain.forEach(r=>t21(x,'⚗',r.x,r.y,{size:14,col:'#ffd36b'}));
      S.pops.forEach(p=>t21(x,p.s,p.x,p.y-p.t*50,{size:14,w:800,col:`rgba(255,211,107,${1-p.t})`,stroke:2}));
      if(S.orb){const a=.6+.4*Math.sin(now/150);x.save();x.globalAlpha=a;x.beginPath();x.arc(S.orb.x,S.orb.y,24,0,TAU16);x.fillStyle='#ffd36b';x.shadowColor='#ffd36b';x.shadowBlur=24;x.fill();x.restore();t21(x,'✦',S.orb.x,S.orb.y,{size:22,col:'#5a3a00'})}
      if(S.rift){x.save();x.translate(S.rift.x,S.rift.y);x.rotate(Math.sin(now/300)*.2);x.strokeStyle='#c070ff';x.shadowColor='#8a2aff';x.shadowBlur=20;x.lineWidth=4;x.beginPath();x.moveTo(-6,-30);x.lineTo(6,-10);x.lineTo(-4,4);x.lineTo(8,28);x.stroke();x.fillStyle='rgba(20,0,40,.8)';x.beginPath();x.ellipse(0,0,10,26,0,0,TAU16);x.fill();x.restore();t21(x,'Fenda',S.rift.x,S.rift.y+40,{size:10,col:'#c39bff'})}
      /* geradores */
      t21(x,'Geradores',GX,30,{size:14,al:'left',col:'#ffd36b'});
      buyB.forEach(b=>{const on=d.buyN===b.n;rr16(x,b.x,b.y,b.w,b.h,6);x.fillStyle=on?'#ffd36b':'#2e2414';x.fill();t21(x,b.n==='max'?'máx':'×'+b.n,b.x+b.w/2,b.y+b.h/2,{size:11,w:800,col:on?'#1b1410':'#cfc3b0'})});
      const vg=visGens();
      if(S.scroll>0){rr16(x,upArrow.x,upArrow.y,upArrow.w,upArrow.h,6);x.fillStyle='#3a2e20';x.fill();t21(x,'▲',upArrow.x+15,upArrow.y+12,{size:12})}
      if(S.scroll+VIS<vg){rr16(x,dnArrow.x,dnArrow.y,dnArrow.w,dnArrow.h,6);x.fillStyle='#3a2e20';x.fill();t21(x,'▼',dnArrow.x+15,dnArrow.y+11,{size:12})}
      for(let k=0;k<VIS;k++){const i=k+S.scroll;if(i>=vg)break;const g=CKG53[i],b=genB(k),n=d.buyN==='max'?Math.max(1,maxBuy(i)):d.buyN,c=cost(i,n),ok=d.e>=c,seen=i===0||d.g[i-1]>0||d.all>=g[2]*.5;
        rr16(x,b.x,b.y,b.w,b.h,8);x.fillStyle=ok?'#2e2414':'#211a14';x.fill();x.strokeStyle=ok?'#ffd36b':'#4a3f35';x.lineWidth=1.5;x.stroke();
        t21(x,seen?g[1]:'?',b.x+20,b.y+20,{size:18});t21(x,seen?g[0]:'???',b.x+40,b.y+13,{size:12,al:'left',col:ok?'#fff':'#998'});
        t21(x,`${fmt53(c)} ⚗${n>1?` (×${n})`:''} · ${fmt53(g[3]*genMult(i)*globalMult())}/s cada`,b.x+40,b.y+29,{size:10,al:'left',w:500,col:'#cfc3b0'});t21(x,String(d.g[i]),b.x+b.w-12,b.y+20,{size:17,al:'right',col:'#c39bff'})}
      /* abas */
      [['up','Melhorias'],['asc','Despertar']].forEach(([k,l])=>{const b=tabB[k],on=S.tab===k;rr16(x,b.x,b.y,b.w,b.h,6);x.fillStyle=on?'#ffd36b':'#2e2414';x.fill();t21(x,(k==='asc'&&fragNext()>=1?'✨ ':'')+l,b.x+b.w/2,b.y+b.h/2,{size:12,w:800,col:on?'#1b1410':'#cfc3b0'})});
      if(S.tab==='up'){const L=avail().slice(0,24);if(!L.length)t21(x,'Nenhuma melhoria disponível ainda.',698,100,{size:11,col:'#998'});
        L.forEach((u,k)=>{const b=upCell(k),ok=d.e>=u.c,on=S.sel===u.id;rr16(x,b.x,b.y,b.w,b.h,7);x.fillStyle=on?'#4a3a20':ok?'#2e2414':'#1d1712';x.fill();x.strokeStyle=on?'#fff':ok?'#ffd36b':'#4a3f35';x.lineWidth=on?2:1;x.stroke();t21(x,u.ico,b.x+b.w/2,b.y+b.h/2,{size:20});if(u.gen!=null)t21(x,['I','II','III','IV','V'][+u.id.split('t')[1]],b.x+b.w-6,b.y+b.h-8,{size:9,w:800,col:'#ffd36b',al:'right'})});
        const u=S.sel&&CKU53.find(q=>q.id===S.sel);if(u){rr16(x,604,316,190,50,6);x.fillStyle='#120e0a';x.fill();t21(x,u.n,608,328,{size:11,w:800,al:'left',col:'#ffd36b'});wrap16(x,`${u.d} · ${fmt53(u.c)} ⚗`,699,346,184,13,'#cfc3b0',10);btn16(x,buyBtn,d.e>=u.c?'Comprar':'Essência insuficiente',{size:12,on:d.e>=u.c})}
        else wrap16(x,'Toque numa melhoria para ver; toque de novo para comprar.',699,336,180,13,'#998',10)}
      else{const n=fragNext();t21(x,`✨ ${d.frag} Fragmentos (${d.frag-d.spent} livres)`,699,48,{size:12,w:800,col:'#c39bff'});t21(x,`Despertar agora: +${n}`,699,68,{size:11,col:n?'#7dffa8':'#998'});
        btn16(x,ascBtn,S.ascConf>0?'Confirmar? (reinicia a run)':'✨ Despertar Cósmico',{size:12,on:n>=1,col:S.ascConf>0?'#ff9b9b':'#c39bff'});
        CKTREE53.forEach(nd=>{if(!nd.req)return;const a=nodeXY(nd),b=nodeXY(CKTREE53.find(q=>q.k===nd.req));x.strokeStyle=tr(nd.k)?'#c39bff':'#4a3f55';x.lineWidth=2;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()});
        CKTREE53.forEach(nd=>{const p=nodeXY(nd),own=tr(nd.k),can=!own&&(!nd.req||tr(nd.req))&&d.frag-d.spent>=nd.c;x.beginPath();x.arc(p.x,p.y,15,0,TAU16);x.fillStyle=own?'#c39bff':can?'#3a2e50':'#1d1724';x.fill();x.strokeStyle=S.sel===nd.k?'#fff':own?'#fff':can?'#c39bff':'#4a3f55';x.lineWidth=S.sel===nd.k?3:1.5;x.stroke();
          t21(x,own?'✓':String(nd.c),p.x,p.y,{size:11,w:800,col:own?'#1b1410':'#e9d6ff'})});
        ['Luz','Início','Sonho','Óbolos','Orbes'].forEach((l,i)=>t21(x,l,622+i*38,124,{size:9,col:'#998'}));
        const nd=S.sel&&CKTREE53.find(q=>q.k===S.sel);if(nd){rr16(x,604,316,190,50,6);x.fillStyle='#120e0a';x.fill();t21(x,nd.n,608,328,{size:11,w:800,al:'left',col:'#c39bff'});wrap16(x,`${nd.d} · ${nd.c} ✨`,699,346,184,13,'#cfc3b0',10);btn16(x,buyBtn,tr(nd.k)?'Já desperto':'Despertar este nó',{size:12,on:!tr(nd.k)&&d.frag-d.spent>=nd.c&&(!nd.req||tr(nd.req))})}}
      btn16(x,REG,'🏆 Registrar no placar',{size:12});
      if(S.msg&&now-S.msgT<2600)t21(x,S.msg,TOME.x,108,{size:13,w:800,col:'#ffd36b',stroke:3});
    }
  };
}
Object.assign(ACH,{
  ck_despertar:{ico:'✨',n:'Despertar Cósmico',d:'Desperte pela primeira vez no Teosofia Clicker.'},
  ck_orbe:{ico:'🌟',n:'Caçador de Orbes',d:'Clique em 10 Orbes Dourados da Fé.'},
  ck_fenda:{ico:'🕳',n:'Colheita do Vazio',d:'Ganhe a Colheita do Vazio numa Fenda de Inexistência.'},
  ck_motor:{ico:'⚙',n:'Motor de Realidade',d:'Tenha um Motor de Realidade no Teosofia Clicker.'},
  ck_arvore:{ico:'🌳',n:'Árvore Desperta',d:'Compre 10 nós da Árvore de Prestígio.',secret:true},
});
defineArcadeGame('clicker',{...GAMES12.clicker,make:clicker53,setup:ckSetup53,
  desc:'Idle teosófico: 14 geradores, ~90 melhorias e sinergias, Orbes Dourados, Fendas de Inexistência e o Despertar Cósmico com a Árvore de Prestígio.',
  rule:'Registrar no placar converte os marcos novos de Essência e os Despertares em Óbolos do Arcade.'});
console.info('[Tulpa] Etapa 53 carregada (Teosofia Clicker 2.0)');

