/* ===================================================================
   TULPA ARCADE · DOOM: Colapso Mental, Salto para o Vazio e
   O Labirinto do Abismo
   =================================================================== */
MG_MUST.add('ain');
function tint18(ci,col){const im=spr(ci);if(!im)return null;const k='t18'+ci+col;SPR.cache=SPR.cache||{};if(SPR.cache[k])return SPR.cache[k];
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);SPR.cache[k]=c;return c}

/* ===================================================================
   💀 DOOM: COLAPSO MENTAL — FPS por raycasting
   Labirinto gerado pelo seed (com atalhos). Hordas de Perseus
   Corrompidos atiram orbes. Mate todos para a próxima horda.
   W/S andam · A/D ou ←/→ viram · arraste para virar · Espaço atira.
   =================================================================== */
function doom(C){
  const W=640,H=400,MW=21,MH=21,FOV=Math.PI/3,COLS=W/2;
  const rnd=mb32(C.seed^0xd00);
  /* labirinto: backtracker + atalhos */
  const m=Array.from({length:MH},()=>Array(MW).fill(1));
  (function carve(){const st=[[1,1]];m[1][1]=0;while(st.length){const[cx,cy]=st[st.length-1];const ds=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>{const nx=cx+dx,ny=cy+dy;return nx>0&&ny>0&&nx<MW-1&&ny<MH-1&&m[ny][nx]});
    if(!ds.length){st.pop();continue}const[dx,dy]=ds[Math.floor(rnd()*ds.length)];m[cy+dy/2][cx+dx/2]=0;m[cy+dy][cx+dx]=0;st.push([cx+dx,cy+dy])}})();
  for(let k=0;k<60;k++){const x=1+Math.floor(rnd()*(MW-2)),y=1+Math.floor(rnd()*(MH-2));if(m[y][x]&&((m[y][x-1]===0&&m[y][x+1]===0)||(m[y-1][x]===0&&m[y+1][x]===0)))m[y][x]=0}
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)if(m[y][x]&&rnd()<.18)m[y][x]=2+Math.floor(rnd()*2);
  const solid=(x,y)=>{const cx=Math.floor(x),cy=Math.floor(y);return cx<0||cy<0||cx>=MW||cy>=MH||m[cy][cx]>0};
  const VMAX=gdPick(C.gd,[150,100,80,60]),EDMG=gdPick(C.gd,[6,9,12,15]),ESPD=gdPick(C.gd,[1,1.3,1.6,1.9]);
  const S={x:1.5,y:1.5,a:0,hp:VMAX,ammo:0,wave:0,kills:0,en:[],orbs:[],pick:[],keys:{},cool:0,fire:0,hurt:0,dead:false,zb:new Float32Array(COLS),drag:null,msg:'',msgT:0};
  const open=[];for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)if(!m[y][x])open.push([x+.5,y+.5]);
  function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d*4);for(let i=1;i<n;i++){const t=i/n;if(solid(ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true}
  function wave(){S.wave++;const n=2+S.wave*2;const far=open.filter(([x,y])=>Math.hypot(x-S.x,y-S.y)>6).sort(()=>rnd()-.5);
    for(let i=0;i<n&&i<far.length;i++){const boss=S.wave%5===0&&i===0;S.en.push({x:far[i][0],y:far[i][1],hp:boss?12:2+Math.floor(S.wave/3),max:boss?12:2+Math.floor(S.wave/3),cool:1+rnd()*2,boss,hitT:0})}
    S.msg=S.wave%5===0?`Horda ${S.wave} · um Perseus Colossal se aproxima`:`Horda ${S.wave}`;S.msgT=performance.now();fx5('activate');if(S.wave>=5)C.achieve?.('doom')}
  function move(dx,dy){const r=.22;if(!solid(S.x+dx+Math.sign(dx)*r,S.y))S.x+=dx;if(!solid(S.x,S.y+dy+Math.sign(dy)*r))S.y+=dy}
  function shoot(){if(S.dead||S.cool>0||Date.now()<C.t0)return;S.cool=.32;S.fire=.12;fx5('fumble');
    let best=null,bd=1e9;S.en.forEach(e=>{const dx=e.x-S.x,dy=e.y-S.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-S.a;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;if(Math.abs(da)<Math.atan2(e.boss?.5:.3,d)&&d<bd&&los(S.x,S.y,e.x,e.y)){bd=d;best=e}});
    if(best){best.hp--;best.hitT=performance.now();if(best.hp<=0){S.kills++;fx5('mgCoin');if(rnd()<.35)S.pick.push({x:best.x,y:best.y});S.en=S.en.filter(e=>e!==best)}}}
  function die(){if(S.dead)return;S.dead=true;solo16(C,S.kills*100+S.wave*250,`O colapso te alcançou na horda ${S.wave} · ${S.kills} Perseus exorcizados`,S.wave>=5)}
  wave();
  return{st:()=>S,
    key(code,down){S.keys[code]=down;if(down&&(code==='Space'||code==='Enter'||code==='KeyF'))shoot()},
    ptr(t,px,py,e){if(t==='down'){S.drag={x:px,moved:0};if(e&&e.pointerType==='mouse')shoot()}else if(t==='move'&&S.drag){const d=px-S.drag.x;S.a+=d*.006;S.drag.moved+=Math.abs(d);S.drag.x=px}else if(t==='up'){if(S.drag&&S.drag.moved<8&&!(e&&e.pointerType==='mouse'))shoot();S.drag=null}},
    step(dt){
      if(Date.now()<C.t0||S.dead)return;const k=S.keys;S.cool=Math.max(0,S.cool-dt);S.fire=Math.max(0,S.fire-dt);S.hurt=Math.max(0,S.hurt-dt);
      const turn=((k.ArrowRight||k.KeyD||k.KeyE)?1:0)-((k.ArrowLeft||k.KeyA||k.KeyQ)?1:0);S.a+=turn*2.6*dt;
      const fw=((k.KeyW||k.ArrowUp)?1:0)-((k.KeyS||k.ArrowDown)?1:0);if(fw)move(Math.cos(S.a)*fw*3.2*dt,Math.sin(S.a)*fw*3.2*dt);
      S.en.forEach(e=>{const dx=S.x-e.x,dy=S.y-e.y,d=Math.hypot(dx,dy),see=d<10&&los(e.x,e.y,S.x,S.y);
        if(see&&d>1.4){const sp=(e.boss?.8:1.1)*ESPD*dt;const nx=e.x+dx/d*sp,ny=e.y+dy/d*sp;if(!solid(nx,e.y))e.x=nx;if(!solid(e.x,ny))e.y=ny}
        e.cool-=dt;if(see&&e.cool<=0){e.cool=(e.boss?.9:2.2)/ESPD+rnd();const n=e.boss?3:1;for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+(i-(n-1)/2)*.18;S.orbs.push({x:e.x,y:e.y,vx:Math.cos(a)*3.4*ESPD,vy:Math.sin(a)*3.4*ESPD})}}
        if(d<.6&&e.cool<1.5){S.hp-=EDMG/2*dt*4;S.hurt=.2}});
      S.orbs.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;if(solid(o.x,o.y))o.dead=true;if(Math.hypot(o.x-S.x,o.y-S.y)<.32){o.dead=true;S.hp-=EDMG;S.hurt=.3;fx5('error')}});S.orbs=S.orbs.filter(o=>!o.dead);
      S.pick=S.pick.filter(p=>{if(Math.hypot(p.x-S.x,p.y-S.y)<.5){S.hp=Math.min(VMAX,S.hp+Math.ceil(VMAX/4));fx5('mgCoin');return false}return true});
      if(S.hp<=0){S.hp=0;die();return}
      if(!S.en.length)wave();
      C.hud(`💀 Horda <b>${S.wave}</b> · ❤ <b>${Math.ceil(S.hp)}</b>/${VMAX} · 👁 ${S.en.length} restantes · ☠ ${S.kills}`);
    },
    draw(x){
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0612');g.addColorStop(.5,'#3a0d1a');g.addColorStop(.5,'#1a1014');g.addColorStop(1,'#3a2a24');x.fillStyle=g;x.fillRect(0,0,W,H);
      for(let c=0;c<COLS;c++){const ra=S.a-FOV/2+FOV*c/COLS,dx=Math.cos(ra),dy=Math.sin(ra);let mx=Math.floor(S.x),my=Math.floor(S.y);
        const ddx=Math.abs(1/dx),ddy=Math.abs(1/dy),sx=dx<0?-1:1,sy=dy<0?-1:1;let sdx=(dx<0?S.x-mx:mx+1-S.x)*ddx,sdy=(dy<0?S.y-my:my+1-S.y)*ddy,side=0,hit=0;
        for(let i=0;i<64&&!hit;i++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}hit=mx<0||my<0||mx>=MW||my>=MH?1:m[my][mx]}
        const pd=(side?sdy-ddy:sdx-ddx)*Math.cos(ra-S.a),h=Math.min(H*3,H/Math.max(.05,pd));S.zb[c]=pd;
        const sh=Math.max(.15,1-pd/12)*(side?.75:1),base=hit===2?[150,60,190]:hit===3?[200,70,60]:[120,90,130];
        x.fillStyle=`rgb(${base[0]*sh|0},${base[1]*sh|0},${base[2]*sh|0})`;x.fillRect(c*2,(H-h)/2,2,h)}
      const sprs=[...S.en.map(e=>({...e,k:'e',ref:e})),...S.orbs.map(o=>({...o,k:'o'})),...S.pick.map(p=>({...p,k:'p'}))].map(s=>({...s,d:Math.hypot(s.x-S.x,s.y-S.y)})).sort((a,b)=>b.d-a.d);
      const im=tint18(-1,'rgba(200,0,40,.45)');
      sprs.forEach(s=>{let da=Math.atan2(s.y-S.y,s.x-S.x)-S.a;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;if(Math.abs(da)>FOV*.7||s.d<.2)return;
        const pd=s.d*Math.cos(da),sz=(s.k==='e'?(s.boss?1.3:.85):.3)*H/pd,scx=(.5+da/FOV)*W,top=H/2-sz/2+(s.k==='e'?sz*.1:sz*.9);
        for(let c=Math.max(0,Math.floor((scx-sz/2)/2));c<Math.min(COLS,Math.ceil((scx+sz/2)/2));c++){if(S.zb[c]<pd)continue;const u=(c*2-(scx-sz/2))/sz;
          if(s.k==='e'){if(im){x.drawImage(im,u*im.width,0,Math.max(1,im.width*2/sz),im.height,c*2,top,2,sz)}else{x.fillStyle='#b01030';x.fillRect(c*2,top,2,sz)}
            if(performance.now()-(s.hitT||0)<90){x.fillStyle='rgba(255,255,255,.6)';x.fillRect(c*2,top,2,sz)}}
          else{x.fillStyle=s.k==='o'?'#ff4a7a':'#7dffa8';const r=sz/2,yy=Math.sqrt(Math.max(0,r*r-(c*2-scx)**2));x.fillRect(c*2,top+r-yy,2,yy*2)}}});
      /* arma */
      const bob=Math.sin(performance.now()/160)*4;x.fillStyle='#2a1a2e';x.beginPath();x.moveTo(W/2-40,H);x.lineTo(W/2-18,H-90+bob);x.lineTo(W/2+18,H-90+bob);x.lineTo(W/2+40,H);x.fill();
      x.beginPath();x.arc(W/2,H-96+bob,10,0,TAU16);x.fillStyle='#c39bff';x.fill();
      if(S.fire>0){x.beginPath();x.arc(W/2,H-110,28,0,TAU16);x.fillStyle='rgba(195,155,255,.8)';x.fill()}
      x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;x.beginPath();x.moveTo(W/2-8,H/2);x.lineTo(W/2+8,H/2);x.moveTo(W/2,H/2-8);x.lineTo(W/2,H/2+8);x.stroke();
      if(S.hurt>0){x.fillStyle=`rgba(255,0,40,${S.hurt})`;x.fillRect(0,0,W,H)}
      /* minimapa */
      const ms=4;x.globalAlpha=.75;for(let y=0;y<MH;y++)for(let xx=0;xx<MW;xx++)if(m[y][xx]){x.fillStyle='#555';x.fillRect(8+xx*ms,8+y*ms,ms,ms)}
      S.en.forEach(e=>{x.fillStyle='#f33';x.fillRect(8+e.x*ms-1,8+e.y*ms-1,3,3)});x.fillStyle='#ffd36b';x.fillRect(8+S.x*ms-2,8+S.y*ms-2,4,4);x.globalAlpha=1;
      txt16(x,`❤ ${Math.ceil(S.hp)}`,W-12,H-20,{size:20,w:800,al:'right',col:S.hp<VMAX/3?'#ff6b5b':'#fff',stroke:4});
      if(S.msg&&performance.now()-S.msgT<2200)txt16(x,S.msg,W/2,60,{size:22,w:800,col:'#ffd36b',stroke:4});
    }
  };
}

/* ===================================================================
   🧱 SALTO PARA O VAZIO — plataforma hardcore (estilo Super Meat Boy)
   Respawn instantâneo, wall-slide e wall-jump. Chegue ao portal ✦.
   Todas as fases foram feitas à mão e conferidas pelo verificador de
   alcance (pulo de até 3 blocos de altura e 4 de vão).
   # parede · ^ espinho · S início · E saída
   =================================================================== */
const VAZIO_LV=[
[ /* 1 · primeiros passos */
'################################',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#.........................E....#',
'#.....................#######..#',
'#................###...........#',
'#..........###.................#',
'#.S....##......................#',
'#######...^^^^^^^^^^^^^^^^^^^^^#',
'################################'],
[ /* 2 · degraus */
'################################',
'#..............................#',
'#..............................#',
'#..............................#',
'#..........................E...#',
'#........................#####.#',
'#..............................#',
'#...................###........#',
'#..............................#',
'#.............###..............#',
'#..............................#',
'#........###...................#',
'#..............................#',
'#....###.......................#',
'#..............................#',
'#.S............................#',
'####^^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'################################'],
[ /* 3 · poço do wall-jump */
'################################',
'#..............................#',
'#...E..........................#',
'#.#####........................#',
'#.....#........................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#.....#..#.....................#',
'#........#.....................#',
'#........#.....................#',
'#.S......#.....................#',
'##########.....................#',
'################################'],
[ /* 4 · ponte de espinhos */
'################################',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#...........................E..#',
'#..........^.......^........##.#',
'#.S.....#####....#####...##....#',
'#####...................##.....#',
'#####^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'################################'],
[ /* 5 · zigue-zague */
'################################',
'#..............................#',
'#.....................E........#',
'#....................###.......#',
'#..............................#',
'#..........................###.#',
'#..............................#',
'#.....................###......#',
'#..............................#',
'#................###...........#',
'#..............................#',
'#...........###................#',
'#..............................#',
'#......###.....................#',
'#..............................#',
'#.S............................#',
'#####^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'################################',
],
[ /* 6 · torre */
'################################',
'#..............................#',
'#..............E...............#',
'#............#####.............#',
'#..............................#',
'#.......###..........###.......#',
'#..............................#',
'#...###..................###...#',
'#..............................#',
'#.......###..........###.......#',
'#..............................#',
'#...###..................###...#',
'#..............................#',
'#.......###..........###.......#',
'#..............................#',
'#.S..........................S.#',
'################################',
'################################'],
[ /* 7 · espinhos no teto */
'################################',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#..............................#',
'#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'#..............................#',
'#..............................#',
'#..............................#',
'#............................E.#',
'#.S......#.....#.....#.....#####',
'#######..#..#..#..#..#..#..#####',
'#######^^^^^^^^^^^^^^^^^^^^#####',
'################################'],
[ /* 8 · chaminé */
'################################',
'#..............................#',
'#..............................#',
'#.........#....................#',
'#.........#....................#',
'#.........#....................#',
'#......#..#...###..............#',
'#......#..#....................#',
'#......#..#....................#',
'#......#..#........###.........#',
'#......#..#....................#',
'#......#..#.................E..#',
'#......#..#.............######.#',
'#......#..#....................#',
'#......#..#....................#',
'#.S.......#....................#',
'###########^^^^^^^^^^^^^^^^^^^^#',
'################################',
],
[ /* 9 · salto de fé */
'################################',
'#..............................#',
'#..............................#',
'#............................E.#',
'#..........................###.#',
'#..............................#',
'#......................###.....#',
'#..............................#',
'#..................###.........#',
'#..............................#',
'#..............###.............#',
'#..............................#',
'#..........###.................#',
'#..............................#',
'#......###.....................#',
'#.S............................#',
'####^^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'################################'],
[ /* 10 · o vazio */
'################################',
'#..E...........................#',
'#.###..........................#',
'#.....###......................#',
'#..........###.................#',
'#...............###............#',
'#....................###.......#',
'#.........................###..#',
'#..............................#',
'#.......................###....#',
'#..................###.........#',
'#.............###..............#',
'#........###...................#',
'#....###.......................#',
'#..............................#',
'#.S............................#',
'####^^^^^^^^^^^^^^^^^^^^^^^^^^^#',
'################################'],
];
T3.vazioLevels=VAZIO_LV;
function vazio(C){
  const W=800,H=450,T=25,G=2400,JV=Math.sqrt(2*G*T*3.6),SPD=230,PW=16,PH=20;
  const NL=gdPick(C.gd,[6,8,10,10]);
  const S={lv:0,x:0,y:0,vx:0,vy:0,ground:false,wall:0,coyote:0,buf:0,lock:0,deaths:0,t:0,lvT:0,keys:{},parts:[],done:false,flash:0,gh:{},sentAt:0,fin:{}};
  let L;
  function load(i){L=VAZIO_LV[i].map(r=>r.split(''));let sx=2,sy=15;
    for(let y=0;y<L.length;y++){const x=L[y].indexOf('S');if(x>=0){sx=x;sy=y;break}}S.spawn=[sx*T+T/2,sy*T+T-PH/2];respawn();S.lvT=0}
  function respawn(){[S.x,S.y]=S.spawn;S.vx=0;S.vy=0;S.buf=0;S.lock=0}
  const tile=(tx,ty)=>tx<0||ty<0||tx>=32||ty>=18?'#':L[ty][tx];
  const solidAt=(px,py)=>tile(Math.floor(px/T),Math.floor(py/T))==='#';
  function die(){S.deaths++;fx5('error');for(let i=0;i<12;i++)S.parts.push({x:S.x,y:S.y,vx:(Math.random()-.5)*400,vy:(Math.random()-.8)*400,t:0});S.flash=.15;respawn()}
  function hitBox(nx,ny){for(const[ox,oy]of[[-PW/2,-PH/2],[PW/2-.01,-PH/2],[-PW/2,PH/2-.01],[PW/2-.01,PH/2-.01],[-PW/2,0],[PW/2-.01,0]])if(solidAt(nx+ox,ny+oy))return true;return false}
  function finishAll(){S.done=true;const score=Math.max(100,Math.round(20000-S.t*40-S.deaths*60));const all=S.lv>=NL;if(all&&NL>=10)C.achieve?.('vazio');
    if(!C.net){solo16(C,score,all?`Você atravessou o Vazio! ${S.t.toFixed(1)} s · ${S.deaths} quedas`:`Fase ${S.lv+1}`,all);return}
    C.send('dead',{s:score});S.fin[C.me]=score;check()}
  function check(){if(!C.host||!C.net||S.closed)return;if(!C.players.every(p=>p.u in S.fin))return;S.closed=true;const best=Math.max(...C.players.map(p=>S.fin[p.u]||0));
    C.finish({title:'Fim do Salto para o Vazio',rows:C.players.map(p=>({u:p.u,n:p.n,c:p.c,s:S.fin[p.u]||0,w:(S.fin[p.u]||0)===best&&best>0})).sort((a,b)=>b.s-a.s)})}
  load(0);
  return{st:()=>S,
    key(code,down){S.keys[code]=down;if(down&&['Space','KeyW','ArrowUp','KeyK'].includes(code))S.buf=.12;if(down&&code==='KeyR')die()},
    msg(p){if(p.t==='pos'&&p.from!==C.me)S.gh[p.from]={...p};if(p.t==='dead'){S.gh[p.from]={...(S.gh[p.from]||{}),done:true};if(C.host){S.fin[p.from]=Number(p.s)||0;check()}}},
    left(u){if(C.host){S.fin[u]=S.fin[u]??0;C.players=C.players.filter(p=>p.u!==u);check()}},
    step(dt){
      S.parts=S.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=1200*dt;return p.t<.7});S.flash=Math.max(0,S.flash-dt);
      if(Date.now()<C.t0||S.done)return;S.t+=dt;S.lvT+=dt;const k=S.keys;
      const dir=((k.KeyD||k.ArrowRight)?1:0)-((k.KeyA||k.ArrowLeft)?1:0);
      S.lock=Math.max(0,S.lock-dt);S.buf=Math.max(0,S.buf-dt);S.coyote=S.ground?.09:Math.max(0,S.coyote-dt);
      if(S.lock<=0)S.vx+=(dir*SPD-S.vx)*Math.min(1,dt*(S.ground?18:9));
      const wl=hitBox(S.x-2,S.y)&&!S.ground,wr=hitBox(S.x+2,S.y)&&!S.ground;S.wall=wl?-1:wr?1:0;
      if(S.buf>0){if(S.coyote>0){S.vy=-JV;S.buf=0;S.coyote=0;fx5('mgJump')}else if(S.wall){S.vy=-JV*.92;S.vx=-S.wall*SPD*1.25;S.lock=.16;S.buf=0;fx5('mgJump')}}
      S.vy+=G*dt;if(S.wall&&S.vy>0&&dir===S.wall)S.vy=Math.min(S.vy,110);S.vy=Math.min(S.vy,900);
      const sub=3;S.ground=false;for(let i=0;i<sub;i++){const nx=S.x+S.vx*dt/sub;if(hitBox(nx,S.y)){S.vx=0}else S.x=nx;const ny=S.y+S.vy*dt/sub;if(hitBox(S.x,ny)){if(S.vy>0)S.ground=true;S.vy=0}else S.y=ny}
      if(!S.ground&&hitBox(S.x,S.y+1))S.ground=true;
      for(const oy of[-PH/2+3,PH/2-3])for(const ox of[-PW/2+3,PW/2-3]){const c=tile(Math.floor((S.x+ox)/T),Math.floor((S.y+oy)/T));if(c==='^'){die();return}if(c==='E'){S.lv++;fx5('mgWin');if(S.lv>=NL){finishAll();return}load(S.lv);return}}
      if(S.y>H+40){die();return}
      if(C.net&&Date.now()-S.sentAt>100){S.sentAt=Date.now();C.send('pos',{x:Math.round(S.x),y:Math.round(S.y),lv:S.lv})}
      C.hud(`🧱 Fase <b>${S.lv+1}</b>/${NL} · ⏱ ${S.t.toFixed(1)} s · ☠ ${S.deaths} · encoste na parede e pule para o wall-jump`);
    },
    draw(x){
      x.fillStyle='#0d0a14';x.fillRect(0,0,W,H);if(!L)return;
      for(let y=0;y<18;y++)for(let xx=0;xx<32;xx++){const c=L[y][xx],X=xx*T,Y=y*T;
        if(c==='#'){x.fillStyle='#3b2a4a';x.fillRect(X,Y,T,T);x.fillStyle='#5a4370';x.fillRect(X,Y,T,3)}
        if(c==='^'){x.fillStyle='#ff4a6a';x.beginPath();for(let k=0;k<3;k++){x.moveTo(X+k*T/3,Y+T);x.lineTo(X+k*T/3+T/6,Y+6);x.lineTo(X+(k+1)*T/3,Y+T)}x.fill()}
        if(c==='E'){const p=.5+.5*Math.sin(performance.now()/200);x.beginPath();x.arc(X+T/2,Y+T/2,10+p*3,0,TAU16);x.fillStyle='#c39bff';x.fill();txt16(x,'✦',X+T/2,Y+T/2,{size:14,col:'#fff'})}}
      for(const u in S.gh){const g=S.gh[u];if(g.lv!==S.lv||g.done)continue;const p=C.players.find(q=>q.u===u);sprAt16(x,p?p.c:0,g.x,g.y,26,0,.4);if(MG.drawn&&p)MG.drawn[p.n]=.4}
      S.parts.forEach(p=>{x.fillStyle=`rgba(255,74,106,${1-p.t/.7})`;x.fillRect(p.x-3,p.y-3,6,6)});
      if(!S.done)sprAt16(x,me16(C).c,S.x,S.y-2,28,S.wall?S.wall*.25:0);
      if(S.flash>0){x.fillStyle=`rgba(255,74,106,${S.flash*2})`;x.fillRect(0,0,W,H)}
      txt16(x,`Fase ${S.lv+1}`,W-12,14,{size:13,al:'right',col:'#c39bff'});
    }
  };
}

/* ===================================================================
   🗝 O LABIRINTO DO ABISMO — twin-stick roguelite (estilo Isaac)
   WASD anda, setas (ou clique/segure) atiram. Limpe a sala para abrir
   as portas. Salas ✦ guardam Mutações Teosóficas. No fundo, o Perseus
   Abissal. Co-op 2: o anfitrião simula a masmorra e manda o estado.
   =================================================================== */
const MUT18=[['Lágrima da Verdade','👁','+1 de dano',p=>p.dmg++],['Asas da Ilusão','🌀','+25% de velocidade',p=>p.spd*=1.25],['Coração da Natureza','🌿','+1 coração e cura',p=>{p.max+=2;p.hp=p.max}],['Olho da Fé','✶','tiro triplo',p=>p.tri=true],['Véu da Inexistência','◐','tiros atravessam',p=>p.pierce=true],['Pressa Mística','⚡','atira mais rápido',p=>p.rate*=.7]];
function abismo(C){
  const W=800,H=450,WL=34,DOOR=80,coop=C.net;
  const rnd=mb32(C.seed^0xab15);
  /* mapa 5×5: caminhada aleatória a partir do centro */
  const rooms={},key=(x,y)=>x+','+y;let cx=2,cy=2;rooms[key(2,2)]={x:2,y:2,kind:'start',clear:true,seen:true};
  const want=gdPick(C.gd,[7,9,10,12]);let guard=0;while(Object.keys(rooms).length<want&&guard++<500){const[dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(rnd()*4)];const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>4||ny>4)continue;cx=nx;cy=ny;if(!rooms[key(cx,cy)])rooms[key(cx,cy)]={x:cx,y:cy,kind:'fight',clear:false}}
  const list=Object.values(rooms);const far=list.slice().sort((a,b)=>(Math.abs(b.x-2)+Math.abs(b.y-2))-(Math.abs(a.x-2)+Math.abs(a.y-2)));far[0].kind='boss';far.filter(r=>r.kind==='fight').slice(-2).forEach(r=>r.kind='item');
  list.forEach(r=>{r.rocks=[];if(r.kind!=='boss'&&r.kind!=='start')for(let i=0;i<3;i++){const ax=160+rnd()*480,ay=110+rnd()*230;if(Math.hypot(ax-W/2,ay-H/2)>80)r.rocks.push({x:ax,y:ay,r:20+rnd()*10})}if(r.kind==='item')r.item=Math.floor(rnd()*MUT18.length)});
  const HP0=gdPick(C.gd,[8,6,6,4]),ESP=gdPick(C.gd,[.8,1,1.15,1.3]);
  const mkP=(p,i)=>({u:p.u,n:p.n,c:p.c,x:W/2+(i?40:-40),y:H/2,hp:HP0,max:HP0,dmg:1,spd:210,rate:.32,cool:0,inv:0,tri:false,pierce:false,inp:{},mut:[],dead:false});
  const S={room:rooms[key(2,2)],ps:(coop?C.players.slice(0,2):[me16(C)]).map(mkP),en:[],sh:[],eb:[],kills:0,seen:1,over:false,msg:'',msgT:0,sendAt:0,keys:{},aim:null,bossDown:false};
  const myP=()=>S.ps.find(p=>p.u===C.me)||S.ps[0];
  const nb=(r,dx,dy)=>rooms[key(r.x+dx,r.y+dy)];
  function flash(m){S.msg=m;S.msgT=performance.now()}
  function enter(r,from){S.room=r;S.en=[];S.eb=[];S.sh=[];if(!r.seen){r.seen=true;S.seen++}
    S.ps.forEach((p,i)=>{if(from){p.x=from[0]?(from[0]>0?WL+30:W-WL-30):W/2+(i?30:-30);p.y=from[1]?(from[1]>0?WL+30:H-WL-30):H/2+(i?0:0)}p.inv=1});
    if(!r.clear&&r.kind==='fight'){const n=2+Math.floor(rnd()*3)+Math.floor(S.seen/3);for(let i=0;i<n;i++){const k=pick18(['traco','traco','olho','mosca']);S.en.push(foe(k,140+rnd()*520,90+rnd()*270))}}
    if(!r.clear&&r.kind==='boss'){S.en.push({k:'boss',x:W/2,y:140,r:44,hp:gdPick(C.gd,[40,60,75,95]),max:gdPick(C.gd,[40,60,75,95]),cool:2,ph:0,vx:0,vy:0,hitT:0});flash('O Perseus Abissal desperta');fx5('activate')}
    if(r.kind!=='fight'&&r.kind!=='boss')r.clear=true;
  }
  const pick18=a=>a[Math.floor(rnd()*a.length)];
  function foe(k,x,y){return{traco:{k,x,y,r:14,hp:3,spd:95},olho:{k,x,y,r:16,hp:4,spd:0,cool:1+rnd()*2},mosca:{k,x,y,r:10,hp:2,spd:140,ph:rnd()*9}}[k]}
  function wallClamp(o){o.x=clamp12(o.x,WL+o.r,W-WL-o.r);o.y=clamp12(o.y,WL+o.r,H-WL-o.r);S.room.rocks.forEach(k=>{const dx=o.x-k.x,dy=o.y-k.y,d=Math.hypot(dx,dy);if(d<k.r+o.r&&d>0){o.x=k.x+dx/d*(k.r+o.r);o.y=k.y+dy/d*(k.r+o.r)}})}
  function hurt(p){if(p.inv>0||p.dead)return;p.hp--;p.inv=1;fx5('error');if(p.hp<=0){p.dead=true;p.hp=0;flash(p.n+' caiu no Abismo');if(S.ps.every(q=>q.dead))end(false)}}
  function score(){return S.seen*50+S.kills*20+(S.bossDown?1000:0)}
  function end(won){if(S.over)return;S.over=true;if(won)C.achieve?.('abismo');if(coop&&C.host)C.send('as',{st:snap()});
    setTimeout(()=>C.finish({title:won?'O Perseus Abissal caiu! O Abismo está limpo':`O Abismo venceu · ${S.seen} salas exploradas`,rows:S.ps.map(p=>({u:p.u,n:p.n,c:p.c,s:score(),w:won}))}),1200)}
  function sim(dt){
    if(S.over)return;const r=S.room;
    S.ps.forEach(p=>{if(p.dead)return;const i=p.inp;p.inv=Math.max(0,p.inv-dt);p.cool=Math.max(0,p.cool-dt);
      let mx=(i.r?1:0)-(i.l?1:0),my=(i.d?1:0)-(i.u?1:0);const n=Math.hypot(mx,my)||1;p.x+=mx/n*p.spd*dt;p.y+=my/n*p.spd*dt;p.r=14;
      /* portas: com a sala limpa, encostar no vão da porta leva à sala vizinha */
      if(r.clear){for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){const nr=nb(r,dx,dy);if(!nr)continue;const gap=dy?Math.abs(p.x-W/2)<DOOR/2-8:Math.abs(p.y-H/2)<DOOR/2-8;
        const past=dy<0?p.y<WL+p.r+2:dy>0?p.y>H-WL-p.r-2:dx<0?p.x<WL+p.r+2:p.x>W-WL-p.r-2;if(gap&&past){enter(nr,[dx,dy]);return}}}
      wallClamp(p);
      if(i.ax!=null&&p.cool<=0){p.cool=p.rate;const a=Math.atan2(i.ay,i.ax),sp=440;(p.tri?[-.2,0,.2]:[0]).forEach(o=>S.sh.push({x:p.x,y:p.y,vx:Math.cos(a+o)*sp,vy:Math.sin(a+o)*sp,d:p.dmg,pr:p.pierce,t:0,hit:new Set()}));if(p.u===C.me)fx5('click')}
      if(r.kind==='item'&&r.item!=null&&Math.hypot(p.x-W/2,p.y-H/2)<26){const m=MUT18[r.item];m[3](p);p.mut.push(m[1]);flash(`${p.n}: ${m[0]} (${m[2]})`);fx5('mgWin');r.item=null}
    });
    const alive=S.ps.filter(p=>!p.dead);if(!alive.length)return;
    S.en.forEach(e=>{const t=alive.reduce((a,b)=>Math.hypot(b.x-e.x,b.y-e.y)<Math.hypot(a.x-e.x,a.y-e.y)?b:a),dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1;
      if(e.k==='traco'){e.x+=dx/d*e.spd*ESP*dt;e.y+=dy/d*e.spd*ESP*dt;wallClamp(e)}
      if(e.k==='mosca'){e.ph+=dt*4;e.x+=(dx/d*e.spd*.6+Math.cos(e.ph*1.7)*120)*ESP*dt;e.y+=(dy/d*e.spd*.6+Math.sin(e.ph*2.3)*120)*ESP*dt;wallClamp(e)}
      if(e.k==='olho'){e.cool-=dt*ESP;if(e.cool<=0){e.cool=1.8;S.eb.push({x:e.x,y:e.y,vx:dx/d*220*ESP,vy:dy/d*220*ESP,r:6})}}
      if(e.k==='boss'){e.cool-=dt*ESP;const hp=e.hp/e.max;
        if(e.cool<=0){e.ph++;if(e.ph%3===0){e.vx=dx/d*420;e.vy=dy/d*420;e.cool=1.6;fx5('fumble')}else{const n=hp<.5?18:12,o=e.ph*.3;for(let i=0;i<n;i++){const a=o+i/n*TAU16;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*180*ESP,vy:Math.sin(a)*180*ESP,r:7})}e.cool=hp<.5?1.1:1.5}}
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=1-2.5*dt;e.vy*=1-2.5*dt;e.x=clamp12(e.x,WL+e.r,W-WL-e.r);e.y=clamp12(e.y,WL+e.r,H-WL-e.r)}
      alive.forEach(p=>{if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+12)hurt(p)})});
    S.sh.forEach(b=>{b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL||b.t>1.2||(!b.pr&&r.rocks.some(k=>Math.hypot(b.x-k.x,b.y-k.y)<k.r)))b.dead=true;
      S.en.forEach(e=>{if(b.dead||b.hit.has(e)||Math.hypot(b.x-e.x,b.y-e.y)>e.r+5)return;b.hit.add(e);e.hp-=b.d;e.hitT=performance.now();if(!b.pr)b.dead=true})});
    S.sh=S.sh.filter(b=>!b.dead);
    const before=S.en.length;S.en=S.en.filter(e=>{if(e.hp>0)return true;S.kills++;if(e.k==='boss'){S.bossDown=true;r.clear=true;end(true)}return false});if(S.en.length<before)fx5('mgCoin');
    S.eb.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL)b.dead=true;alive.forEach(p=>{if(!b.dead&&Math.hypot(p.x-b.x,p.y-b.y)<b.r+10){b.dead=true;hurt(p)}})});S.eb=S.eb.filter(b=>!b.dead);
    if(!r.clear&&!S.en.length&&r.kind!=='boss'){r.clear=true;flash('Sala limpa · portas abertas');fx5('confirm');if(rnd()<.3)alive.forEach(p=>p.hp=Math.min(p.max,p.hp+1))}
  }
  const snap=()=>({ps:S.ps.map(p=>({u:p.u,x:Math.round(p.x),y:Math.round(p.y),hp:p.hp,max:p.max,dead:p.dead,inv:+p.inv.toFixed(2),mut:p.mut})),en:S.en.map(e=>({k:e.k,x:Math.round(e.x),y:Math.round(e.y),r:e.r,hp:e.hp,max:e.max})),sh:S.sh.map(b=>[Math.round(b.x),Math.round(b.y)]),eb:S.eb.map(b=>[Math.round(b.x),Math.round(b.y),b.r]),rx:S.room.x,ry:S.room.y,clear:S.room.clear,item:S.room.item,kills:S.kills,seen:S.seen,msg:S.msg,over:S.over});
  function myInp(){const k=S.keys,i={l:!!k.KeyA,r:!!k.KeyD,u:!!k.KeyW,d:!!k.KeyS};let ax=((k.ArrowRight?1:0)-(k.ArrowLeft?1:0)),ay=((k.ArrowDown?1:0)-(k.ArrowUp?1:0));
    if(!ax&&!ay&&S.aim){const p=myP();ax=S.aim[0]-p.x;ay=S.aim[1]-p.y}if(ax||ay){i.ax=ax;i.ay=ay}return i}
  function push(){const i=myInp();if(C.host||!coop)myP().inp=i;else C.send('ain',{inp:i})}
  S.enter=enter;S.list=list;S.rooms=rooms;
  enter(S.room,null);
  return{st:()=>S,
    key(code,down){S.keys[code]=down;push()},
    ptr(t,px,py,e){if(touch12()&&!(e&&e.pointerType==='mouse'))return;if(t==='down'||(t==='move'&&S.aim))S.aim=[px,py];if(t==='up')S.aim=null;push()},
    msg(p){
      if(C.host&&p.t==='ain'){const pl=S.ps.find(q=>q.u===p.from);if(pl)pl.inp=p.inp||{}}
      if(!C.host&&p.t==='as'&&p.st&&p.from===C.room.host){const st=p.st;st.ps.forEach(g=>{const pl=S.ps.find(q=>q.u===g.u);if(pl)Object.assign(pl,g)});S.en=st.en;S.shV=st.sh;S.ebV=st.eb;S.room=rooms[key(st.rx,st.ry)]||S.room;S.room.clear=st.clear;S.room.item=st.item;S.room.seen=true;S.kills=st.kills;S.seen=st.seen;if(st.msg!==S.msg){S.msg=st.msg;S.msgT=performance.now()}S.over=st.over}
    },
    left(u){if(!C.host)return;const p=S.ps.find(q=>q.u===u);if(p){p.dead=true;if(S.ps.every(q=>q.dead))end(false)}},
    step(dt){
      if(Date.now()<C.t0)return;if(S.aim)push();
      if(C.host||!coop){sim(dt);if(coop&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('as',{st:snap()})}}
      const p=myP();C.hud(`🗝 ${'❤'.repeat(Math.floor(p.hp/2))}${p.hp%2?'♡':''}${'·'.repeat(Math.max(0,Math.floor((p.max-p.hp)/2)))} · salas <b>${S.seen}</b>/${list.length} · ☠ ${S.kills}${p.mut.length?' · '+p.mut.join(''):''}`);
    },
    draw(x){
      const r=S.room;x.fillStyle='#1a1214';x.fillRect(0,0,W,H);x.fillStyle=r.kind==='boss'?'#2a0e18':'#2a2024';x.fillRect(WL,WL,W-WL*2,H-WL*2);
      x.fillStyle='#3d2b33';x.fillRect(0,0,W,WL);x.fillRect(0,H-WL,W,WL);x.fillRect(0,0,WL,H);x.fillRect(W-WL,0,WL,H);
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{if(!nb(r,dx,dy))return;x.fillStyle=r.clear?'#120c10':'#5a2a2a';const n=nb(r,dx,dy);
        if(dy)x.fillRect(W/2-DOOR/2,dy<0?0:H-WL,DOOR,WL);else x.fillRect(dx<0?0:W-WL,H/2-DOOR/2,WL,DOOR);
        if(n.kind==='boss'||n.kind==='item'){const tx=dy?W/2:dx<0?WL/2:W-WL/2,ty=dx?H/2:dy<0?WL/2:H-WL/2;txt16(x,n.kind==='boss'?'💀':'✦',tx,ty,{size:14})}});
      r.rocks.forEach(k=>{x.beginPath();x.arc(k.x,k.y,k.r,0,TAU16);x.fillStyle='#4a3a40';x.fill();x.strokeStyle='#6a5560';x.lineWidth=2;x.stroke()});
      if(r.kind==='item'&&r.item!=null){const m=MUT18[r.item],b=Math.sin(performance.now()/300)*4;x.beginPath();x.arc(W/2,H/2+b,22,0,TAU16);x.fillStyle='rgba(195,155,255,.3)';x.fill();txt16(x,m[1],W/2,H/2+b,{size:24});txt16(x,m[0],W/2,H/2+40,{size:12,col:'#c39bff'})}
      S.en.forEach(e=>{const fl=performance.now()-(e.hitT||0)<80;
        if(e.k==='boss'){const im=tint18(-1,'rgba(40,0,60,.55)');x.save();if(fl)x.globalAlpha=.6;if(im)x.drawImage(im,e.x-e.r*1.4,e.y-e.r*1.4,e.r*2.8,e.r*2.8);else{x.beginPath();x.arc(e.x,e.y,e.r,0,TAU16);x.fillStyle='#401060';x.fill()}x.restore();
          x.fillStyle='#300';x.fillRect(W/2-150,H-24,300,10);x.fillStyle='#c33';x.fillRect(W/2-150,H-24,300*e.hp/e.max,10);txt16(x,'Perseus Abissal',W/2,H-34,{size:11})}
        else{x.beginPath();x.arc(e.x,e.y,e.r,0,TAU16);x.fillStyle=fl?'#fff':e.k==='traco'?'#8a1a2a':e.k==='olho'?'#3a6aa0':'#5a8a3a';x.fill();
          if(e.k==='olho'){x.beginPath();x.arc(e.x,e.y,6,0,TAU16);x.fillStyle='#fff';x.fill();x.beginPath();x.arc(e.x,e.y,3,0,TAU16);x.fillStyle='#000';x.fill()}
          if(e.k==='traco')txt16(x,'〰',e.x,e.y,{size:12})}});
      (S.shV||S.sh.map(b=>[b.x,b.y])).forEach(([bx,by])=>{x.beginPath();x.arc(bx,by,5,0,TAU16);x.fillStyle='#ffd36b';x.fill()});
      (S.ebV||S.eb.map(b=>[b.x,b.y,b.r])).forEach(([bx,by,br])=>{x.beginPath();x.arc(bx,by,br,0,TAU16);x.fillStyle='#ff4a7a';x.fill()});
      S.ps.forEach(p=>{if(p.dead){txt16(x,'✝',p.x,p.y,{size:20,col:'#888'});return}if(p.inv>0&&Math.floor(performance.now()/90)%2)return;sprAt16(x,p.c,p.x,p.y,34);if(coop)txt16(x,p.n,p.x,p.y-26,{size:10,stroke:3})});
      /* mini mapa */
      list.forEach(q=>{if(!q.seen&&!Object.values(rooms).some(o=>o.seen&&Math.abs(o.x-q.x)+Math.abs(o.y-q.y)===1))return;x.fillStyle=q===r?'#ffd36b':q.seen?'#776':'#333';x.fillRect(W-96+q.x*17,6+q.y*11,15,9);if(q.kind==='boss'&&q.seen)txt16(x,'💀',W-88+q.x*17,11+q.y*11,{size:8})});
      if(S.msg&&performance.now()-S.msgT<2000)txt16(x,S.msg,W/2,64,{size:18,w:800,col:'#ffd36b',stroke:4});
    }
  };
}

defineArcadeGame('doom',{name:'DOOM: Colapso Mental',ico:'💀',modes:['solo'],max:1,rec:true,unit:'pts',W:640,H:400,pad:'fps',
  desc:'FPS pseudo-3D por raycasting contra hordas de Perseus Corrompidos num labirinto.',keys:'W/S andam · A/D ou ←/→ viram · Espaço ou clique atira',touch:'Arraste na tela para virar',make:doom});
defineArcadeGame('vazio',{name:'Salto para o Vazio',ico:'🧱',modes:['solo','mesa'],max:6,rec:true,unit:'pts',W:800,H:450,pad:'lrjv',
  desc:'Plataforma hardcore: respawn instantâneo, wall-jump e espinhos. Chegue ao ✦ de cada fase.',keys:'A/D andam · Espaço/W pula (também na parede) · R recomeça',touch:'',make:vazio});
defineArcadeGame('abismo',{name:'O Labirinto do Abismo',ico:'🗝',modes:['solo','pvp'],max:2,rec:true,unit:'pts',W:800,H:450,pad:'twin',pvpLabel:'🤝 Co-op 2',
  desc:'Twin-stick em salas procedurais. Junte Mutações Teosóficas e derrote o Perseus Abissal.',keys:'WASD anda · setas ou mouse atiram',touch:'',make:abismo});


