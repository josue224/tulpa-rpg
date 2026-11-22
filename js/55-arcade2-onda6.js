/* ===================================================================
   TULPA · ETAPA 48 — 🕹 ARCADE 2.0 · ONDA 6 (parte 1)
   💀 DOOM: COLAPSO MENTAL 2.0
   Campanha de 8 andares procedurais (chefes no 4º e no 8º) e Infinito.
   Cada andar é um labirinto maior: ache a Chave Dourada e a Azul, abra
   as portas, procure paredes secretas (E / ✋ Usar) e alcance o Portal.
   Arsenal: Lâmina Astral (infinita), Pistola de Luz, Escopeta de
   Essência e Canhão de Sol (explosivo). Vital, Armadura e Lucidez.
   Inimigos: Perseguidor Veloz, Atirador de Orbes, Tanque Blindado e o
   Chefe de Andar. Minimapa que se revela e aviso de dano direcional.
   Mapa: 0 chão · 1-3 parede · 4 porta dourada · 5 porta azul · 6 secreta
   =================================================================== */
const DMW48=[
  {k:'lam',n:'Lâmina Astral',ico:'🗡',am:null,cd:.42,dmg:3,rng:1.7,melee:1},
  {k:'pis',n:'Pistola de Luz',ico:'🔫',am:'luz',cd:.3,dmg:2,rng:22},
  {k:'esc',n:'Escopeta de Essência',ico:'💥',am:'ess',cd:.85,dmg:1.4,pel:7,sp:.2,rng:9},
  {k:'can',n:'Canhão de Sol',ico:'☀',am:'sol',cd:1.1,dmg:11,rad:1.9,proj:1},
];
const DMF48={
  per:{n:'Perseguidor Veloz',hp:3,sp:2.6,sz:.72,col:'rgba(255,40,90,.55)',pts:100,mel:9},
  ati:{n:'Atirador de Orbes',hp:3,sp:1.4,sz:.8,col:'rgba(150,80,255,.55)',pts:150,mel:5,shot:1.7},
  tan:{n:'Tanque Blindado',hp:12,sp:.8,sz:1.08,col:'rgba(90,130,150,.65)',pts:300,mel:14,shot:2.8,arm:.5},
  boss:{n:'Chefe de Andar',hp:45,sp:1.2,sz:1.45,col:'rgba(255,170,0,.55)',pts:1500,mel:14,shot:1.5,arm:.25},
};
const DMT48=[{n:'Porão da Mente',sky:['#1a0612','#3a0d1a'],fl:['#1a1014','#3a2a24'],w:[[120,90,130],[150,60,190],[200,70,60]]},
  {n:'Corredores da Fé',sky:['#1c1404','#3d2b08'],fl:['#1a150a','#3a3020'],w:[[160,130,80],[200,160,60],[140,100,60]]},
  {n:'Jardim Corrompido',sky:['#06140c','#0d3320'],fl:['#0c1410','#22382a'],w:[[70,130,90],[60,160,110],[110,140,70]]},
  {n:'Núcleo do Colapso',sky:['#0e0420','#2a0b4a'],fl:['#120a1c','#2a1c3a'],w:[[110,70,170],[170,60,200],[80,60,140]]}];
const DMCAMP48=8,dmBoss48=f=>f%4===0;
const dmTheme48=f=>DMT48[Math.floor((f-1)/2)%4];
function dmGen48(seed,fl){
  const rnd=mb32(((seed>>>0)^Math.imul(fl,0x9E3779B1))>>>0||1),N=Math.min(31,13+fl*2),m=Array.from({length:N},()=>Array(N).fill(1));
  const R=n=>Math.floor(rnd()*n),inb=(x,y)=>x>0&&y>0&&x<N-1&&y<N-1;
  {const st=[[1,1]];m[1][1]=0;while(st.length){const[cx,cy]=st[st.length-1];const ds=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dy])=>inb(cx+dx,cy+dy)&&m[cy+dy][cx+dx]);
    if(!ds.length){st.pop();continue}const[dx,dy]=ds[R(ds.length)];m[cy+dy/2][cx+dx/2]=0;m[cy+dy][cx+dx]=0;st.push([cx+dx,cy+dy])}}
  const D4=[[1,0],[-1,0],[0,1],[0,-1]];
  function bfs(sx,sy,pass){const d=Array.from({length:N},()=>Array(N).fill(-1)),par={};d[sy][sx]=0;const q=[[sx,sy]];for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[dx,dy]of D4){const a=x+dx,b=y+dy;if(a<0||b<0||a>=N||b>=N||d[b][a]>=0||!pass(a,b))continue;d[b][a]=d[y][x]+1;par[a+','+b]=[x,y];q.push([a,b])}}return{d,par}}
  const B0=bfs(1,1,(x,y)=>!m[y][x]);let portal=[1,1],md=0;for(let y=1;y<N;y+=2)for(let x=1;x<N;x+=2)if(B0.d[y][x]>md){md=B0.d[y][x];portal=[x,y]}
  const path=[];{let c=portal;while(c){path.unshift(c);c=B0.par[c[0]+','+c[1]]}}
  const onPath=new Set(path.map(([x,y])=>x+','+y));
  const nk=fl>=2?2:1,doors=[];
  [.42,.74].slice(0,nk).forEach((f,k)=>{let i=Math.floor(path.length*f);while(i<path.length-2&&!((path[i][0]%2)!==(path[i][1]%2)))i++;doors.push({x:path[i][0],y:path[i][1],k:4+k,i})});
  const isDoor=(x,y)=>doors.find(d=>d.x===x&&d.y===y);
  /* regiões: quantas portas entre a saída e a casa */
  const reg=Array.from({length:N},()=>Array(N).fill(-1));reg[1][1]=0;{const q=[[1,1]];for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[dx,dy]of D4){const a=x+dx,b=y+dy;if(m[b][a]||reg[b][a]>=0)continue;reg[b][a]=reg[y][x]+(isDoor(a,b)?1:0);q.push([a,b])}}}
  const cellsOf=r=>{const o=[];for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++)if(!m[y][x]&&reg[y][x]===r&&!isDoor(x,y))o.push([x,y]);return o};
  const keys=[];doors.forEach((dr,k)=>{const cs=cellsOf(k).filter(([x,y])=>!(x===1&&y===1));let best=null,bv=-1e9;cs.forEach(([x,y])=>{const v=B0.d[y][x]-(onPath.has(x+','+y)?1000:0)+(D4.filter(([dx,dy])=>!m[y+dy][x+dx]).length===1?5:0);if(v>bv){bv=v;best=[x,y]}});keys.push({x:best[0],y:best[1],k:dr.k})});
  const taken=new Set([...keys.map(k=>k.x+','+k.y),portal.join(','),'1,1',...doors.map(d=>d.x+','+d.y)]);
  /* atalhos dentro da mesma região */
  for(let k=0;k<N*2;k++){const x=1+R(N-2),y=1+R(N-2);if(!m[y][x])continue;
    const op=D4.map(([dx,dy])=>[x+dx,y+dy]).filter(([a,b])=>!m[b][a]);if(op.length<2||op.some(c=>isDoor(...c)||reg[c[1]][c[0]]!==reg[op[0][1]][op[0][0]]))continue;
    const straight=(!m[y][x-1]&&!m[y][x+1])||(!m[y-1][x]&&!m[y+1][x]);if(straight&&rnd()<.5){m[y][x]=0;reg[y][x]=reg[op[0][1]][op[0][0]]}}
  /* salões */
  const rooms=[];for(let t=0;t<4+fl;t++){const w=3+R(3),h=3+R(2),x0=1+R(N-2-w),y0=1+R(N-2-h);let r=-1,ok=true;
    for(let y=y0-1;y<=y0+h&&ok;y++)for(let x=x0-1;x<=x0+w&&ok;x++){if(y<0||x<0||y>=N||x>=N)continue;if(isDoor(x,y)||taken.has(x+','+y))ok=false;else if(!m[y][x]){if(r<0)r=reg[y][x];else if(reg[y][x]!==r)ok=false}}
    if(!ok||r<0)continue;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){m[y][x]=0;reg[y][x]=r}rooms.push({x0,y0,w,h,r})}
  /* paredes secretas com suprimentos */
  const secrets=[],nS=Math.min(3,1+Math.floor(fl/3));
  {const ends=[];for(let y=1;y<N-1;y+=2)for(let x=1;x<N-1;x+=2){if(m[y][x]||taken.has(x+','+y)||onPath.has(x+','+y))continue;const op=D4.filter(([dx,dy])=>!m[y+dy][x+dx]);if(op.length!==1)continue;const cx=x+op[0][0],cy=y+op[0][1];
      if(isDoor(cx,cy)||onPath.has(cx+','+cy)||D4.filter(([dx,dy])=>!m[cy+dy][cx+dx]).length!==2)continue;ends.push([x,y,cx,cy])}
    for(let i=ends.length-1;i>0;i--){const j=R(i+1);[ends[i],ends[j]]=[ends[j],ends[i]]}
    for(const[x,y,cx,cy]of ends){if(secrets.length>=nS)break;if(secrets.some(s=>Math.abs(s.x-x)+Math.abs(s.y-y)<4))continue;m[cy][cx]=6;secrets.push({wx:cx,wy:cy,x,y,r:reg[y][x]});taken.add(x+','+y)}}
  doors.forEach(d=>{m[d.y][d.x]=d.k});
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(m[y][x]===1&&rnd()<.16)m[y][x]=2+R(2);
  /* itens */
  const free=[];for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++)if(!m[y][x]&&!taken.has(x+','+y)&&B0.d[y][x]!==0&&Math.abs(x-1)+Math.abs(y-1)>3)free.push([x,y]);
  const pick=()=>{if(!free.length)return null;const i=R(free.length);const c=free.splice(i,1)[0];taken.add(c.join(','));return c};
  const items=[];const put=(k,c=pick())=>{if(c)items.push({x:c[0]+.5,y:c[1]+.5,k})};
  keys.forEach(k=>items.push({x:k.x+.5,y:k.y+.5,k:'key'+k.k}));
  secrets.forEach((s,i)=>items.push({x:s.x+.5,y:s.y+.5,k:['arm','sol','vit'][i%3],sec:1},{x:s.x+.5,y:s.y+.5,k:['ess','luc','luz'][i%3],sec:1}));
  if(fl===2)put('w3');if(fl===3)put('w4');
  const pool=['vit','vit','arm','luc','luz','luz','ess','ess','sol'];for(let i=0;i<5+fl;i++)put(pool[R(pool.length)]);
  /* inimigos */
  const foes=[];const nF=Math.min(30,4+fl*2);const wt=[['per',5],['ati',3+fl*.3],['tan',fl>=3?1+fl*.3:0]];const tot=wt.reduce((a,b)=>a+b[1],0);
  for(let i=0;i<nF;i++){let r=rnd()*tot,k='per';for(const[q,w]of wt){if(r<w){k=q;break}r-=w}
    const c=(()=>{for(let t=0;t<40;t++){const q=free[R(free.length)];if(q&&B0.d[q[1]][q[0]]>6)return q}return null})();if(c)foes.push({x:c[0]+.5,y:c[1]+.5,k})}
  if(dmBoss48(fl)){const c=path[path.length-3]||path[path.length-2];foes.push({x:c[0]+.5,y:c[1]+.5,k:'boss'})}
  if(dmBoss48(fl)){const rb=reg[portal[1]][portal[0]],fr=free.filter(([x,y])=>reg[y][x]===rb);['vit','arm','sol','sol','vit'].forEach(k=>{if(fr.length){const c=fr.splice(R(fr.length),1)[0];items.push({x:c[0]+.5,y:c[1]+.5,k})}})}
  return{N,m,start:[1.5,1.5],portal:[portal[0]+.5,portal[1]+.5],doors,keys,secrets,items,foes,rooms,reg,path:path.length}
}
T3.dmGen48=dmGen48;
function dmProg48(){const p=prog38().dm||{};return{reach:p.reach||1,wins:p.wins||0,inf:p.inf||0,best:p.best||0}}
const dmSetup48={
  intro:()=>'Cada andar é um labirinto maior. Ache as chaves, abra as portas e alcance o Portal. O Chefe de Andar guarda o portal do 4º e do 8º.',
  def:()=>({m:'c',f:'1'}),
  fields:o=>{const p=dmProg48(),F=[{k:'m',l:'Modo',opts:[{v:'c',n:'Campanha',ico:'💀',d:`${DMCAMP48} andares, 2 chefes.`,badge:p.wins?`🏆 ×${p.wins}`:''},{v:'i',n:'Infinito',ico:'♾',d:'Andares sem fim, cada vez maiores.',badge:p.inf?`🏆 andar ${p.inf}`:''}]}];
    if(o.m==='c')F.push({k:'f',l:'Começar no',opts:[{v:'1',n:'Andar 1',ico:'🚪',d:'Só a Lâmina e a Pistola.'},{v:'5',n:'Andar 5',ico:'🔥',d:p.reach>=5?'Depois do 1º chefe, com o arsenal completo.':'Chegue ao Andar 5 para abrir.',lock:p.reach<5}]});
    return F},
  fix:o=>{if(!['c','i'].includes(o.m))o.m='c';if(o.m!=='c'||dmProg48().reach<5)o.f='1';if(!['1','5'].includes(o.f))o.f='1'},
  sum:()=>'W/S andam · A/D andam de lado · ←/→ ou arrastar viram · Espaço atira · E usa (abre portas e paredes secretas) · Q ou 1–4 trocam de arma · M abre o mapa.'
};

function doom48(C){
  const W=640,H=400,FOV=Math.PI/3,COLS=W/2,o=C.room.opt||{},inf=o.m==='i',me=me21(C);
  const EDMG=gdPick(C.gd,[5,7,10,13]),ESPD=gdPick(C.gd,[.85,1,1.15,1.3]),EHP=gdPick(C.gd,[.8,1,1.2,1.45]);
  const f0=!inf&&o.f==='5'?5:1;
  const S={fl:f0,hp:100,arm:f0>1?50:0,luc:100,ammo:{luz:f0>1?60:30,ess:f0>1?16:0,sol:f0>1?6:0},own:[true,true,f0>1,f0>1],w:1,
    x:1.5,y:1.5,a:0,keys:{},cool:0,fire:0,swing:0,hurt:0,dead:false,won:false,en:[],orbs:[],rk:[],items:[],booms:[],
    kills:0,secrets:0,secTot:0,score:0,t:0,ft:0,phase:'play',tally:0,msg:'',msgT:0,map:false,dir:[],noise:0,flow:null,flowT:0,seenT:0,
    usedW:new Set(),bossKills:0,lastMsg:{},zb:new Float32Array(COLS),drag:null,flStats:[]};
  let L,m,N,seen;
  function floor(f){
    L=dmGen48(C.seed,f);m=L.m;N=L.N;seen=new Uint8Array(N*N);S.fl=f;S.x=L.start[0];S.y=L.start[1];S.a=0;S.keys={};S.orbs=[];S.rk=[];S.booms=[];S.dir=[];S.ft=0;S.phase='play';S.flSec=0;S.flKill=0;
    S.items=L.items.map(q=>({...q}));S.secTot+=L.secrets.length;
    S.en=L.foes.map((q,i)=>{const F=DMF48[q.k],hp=Math.round((q.k==='boss'?F.hp+f*8:F.hp+(q.k==='tan'?Math.floor(f/2):0))*EHP);return{id:i,x:q.x,y:q.y,k:q.k,hp,max:hp,cool:1+Math.random()*2,mcd:0,alert:false,hitT:0,str:Math.random()<.5?1:-1,ph:1}});
    S.boss=S.en.find(e=>e.k==='boss')||null;
    say(`Andar ${f}${inf?'':'/'+DMCAMP48} · ${dmTheme48(f).n}${S.boss?' · o Chefe guarda o Portal':''}`,3);
    if(f===2)C.say('Ouvi dizer que tem uma Escopeta neste andar. Ouvi de mim mesmo.',false);
  }
  function say(t,s=2.2){S.msg=t;S.msgT=performance.now()+s*1000}
  const cellAt=(x,y)=>{const cx=Math.floor(x),cy=Math.floor(y);return cx<0||cy<0||cx>=N||cy>=N?1:m[cy][cx]};
  const solid=(x,y)=>cellAt(x,y)>0;
  function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d*4);for(let i=1;i<n;i++){const t=i/n;if(solid(ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true}
  function tryDoor(cx,cy){const v=m[cy]?.[cx];if(v!==4&&v!==5)return false;const nm=v===4?'Dourada':'Azul';
    if(S.keys[v]){m[cy][cx]=0;fx5('activate');C.fx?.flash(v===4?'#ffd36b':'#7fc8ff',.2);say(`🔓 Porta ${nm} aberta`);return true}
    const k='d'+v,n=performance.now();if(!(S.lastMsg[k]>n)){S.lastMsg[k]=n+1500;say(`🔒 Porta ${nm}: precisa da Chave ${nm}`);fx5('error')}return false}
  function move(dx,dy){const r=.24;
    const nx=S.x+dx+Math.sign(dx)*r;if(!solid(nx,S.y))S.x+=dx;else tryDoor(Math.floor(nx),Math.floor(S.y));
    const ny=S.y+dy+Math.sign(dy)*r;if(!solid(S.x,ny))S.y+=dy;else tryDoor(Math.floor(S.x),Math.floor(ny))}
  function use(){if(S.phase!=='play'||S.dead)return;for(let d=.4;d<=1.5;d+=.1){const cx=Math.floor(S.x+Math.cos(S.a)*d),cy=Math.floor(S.y+Math.sin(S.a)*d),v=m[cy]?.[cx];if(!v)continue;
      if(v===6){m[cy][cx]=0;S.secrets++;S.flSec++;S.score+=300;fx5('mgWin');C.fx?.flash('#b48cff',.3);say('✨ Passagem secreta! +300');if(S.flSec===L.secrets.length)C.achieve?.('dm_segredo');return true}
      if(v===4||v===5)return tryDoor(cx,cy);
      fx5('click');return false}return false}
  const angTo=(x,y)=>{let da=Math.atan2(y-S.y,x-S.x)-S.a;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;return da};
  function hurtFoe(e,dmg,expl,wk){if(e.hp<=0)return;const F=DMF48[e.k];if(!expl&&F.arm)dmg*=1-F.arm;e.hp-=dmg;e.hitT=performance.now();e.alert=true;
    if(e.hp<=0){S.kills++;S.flKill++;S.score+=F.pts;S.usedW.add(wk);if(S.usedW.size>=4)C.achieve?.('dm_arsenal');fx5('mgCoin');
      C.fx?.float(W/2,H/2-30,`+${F.pts}`,{col:'#ffd36b',size:18});
      if(e.k==='boss'){S.bossKills++;S.score+=0;C.fx?.shake(10,.6);C.fx?.flash('#ffd36b',.4);say('👑 O Chefe caiu! O Portal se abriu.',3);if(wk===0)C.achieve?.('dm_lamina')}
      else if(Math.random()<(e.k==='tan'?.7:.28))S.items.push({x:e.x,y:e.y,k:['luz','ess','vit','arm','sol'][Math.floor(Math.random()*(e.k==='tan'?5:4))]});
      S.en=S.en.filter(q=>q!==e);if(S.boss===e)S.boss=null}
    else if(e.k==='boss'&&e.ph===1&&e.hp<e.max/2){e.ph=2;say('🔥 O Chefe entra em fúria!');C.fx?.shake(6,.4);let made=0;for(let i=0;i<12&&made<2;i++){const a=i*TAU16/12+Math.random()*.3;const nx=e.x+Math.cos(a)*.8,ny=e.y+Math.sin(a)*.8;if(!solid(nx,ny)){made++;const hp=Math.round(3*EHP);S.en.push({id:900+S.en.length,x:nx,y:ny,k:'per',hp,max:hp,cool:1,mcd:.5,alert:true,hitT:0,str:1,ph:1})}}}}
  function fire(){
    if(S.dead||S.cool>0||S.phase!=='play'||Date.now()<C.t0)return;const Wp=DMW48[S.w];
    if(Wp.am&&S.ammo[Wp.am]<=0){fx5('error');say(`Sem munição para a ${Wp.n}`,1.2);const nx=[3,2,1,0].find(i=>S.own[i]&&(!DMW48[i].am||S.ammo[DMW48[i].am]>0));if(nx!=null)S.w=nx;return}
    if(Wp.am)S.ammo[Wp.am]--;S.cool=Wp.cd;S.fire=.12;S.noise=.3;
    if(Wp.melee){S.swing=.25;fx5('click');let best=null,bd=1e9;S.en.forEach(e=>{const d=Math.hypot(e.x-S.x,e.y-S.y);if(d<Wp.rng&&Math.abs(angTo(e.x,e.y))<.6&&d<bd){bd=d;best=e}});if(best){hurtFoe(best,Wp.dmg,false,0);C.fx?.shake(3,.12)}return}
    if(Wp.proj){fx5('bb5');S.rk.push({x:S.x+Math.cos(S.a)*.3,y:S.y+Math.sin(S.a)*.3,vx:Math.cos(S.a)*9,vy:Math.sin(S.a)*9});return}
    fx5('fumble');const n=Wp.pel||1;
    for(let p=0;p<n;p++){const a=S.a+(n>1?(Math.random()-.5)*2*Wp.sp:0);let best=null,bd=1e9;
      S.en.forEach(e=>{const dx=e.x-S.x,dy=e.y-S.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-a;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;
        const w=DMF48[e.k].sz*.42;if(Math.abs(da)<Math.atan2(w,d)&&d<bd&&d<Wp.rng&&los(S.x,S.y,e.x,e.y)){bd=d;best=e}});
      if(best){const fall=n>1?(bd<2.5?1:bd<6?.55:.25):1;hurtFoe(best,Wp.dmg*fall,false,S.w)}}
    if(n>1)C.fx?.shake(4,.15)}
  function explode(x,y){S.booms.push({x,y,t:performance.now()});fx5('bb7');C.fx?.shake(8,.35);const R=DMW48[3].rad;
    S.en.slice().forEach(e=>{const d=Math.hypot(e.x-x,e.y-y);if(d<R&&los(x,y,e.x,e.y))hurtFoe(e,DMW48[3].dmg*(1-d/R*.6),true,3)});
    const d=Math.hypot(S.x-x,S.y-y);if(d<R)hurt(25*(1-d/R),x,y)}
  function hurt(d,sx,sy,luc=0){if(S.dead||S.phase!=='play')return;
    if(luc){S.luc=Math.max(0,S.luc-luc)}d*=S.luc<=0?1.5:1;const ab=Math.min(S.arm,d*.6);S.arm-=ab;S.hp-=d-ab;S.hurt=Math.min(.5,.15+d/40);
    if(sx!=null)S.dir.push({a:angTo(sx,sy),t:performance.now()});fx5('error');C.fx?.shake(2+d/6,.15);
    if(S.hp<=0){S.hp=0;die()}}
  function flow(){/* mapa de distâncias até o jogador (para a perseguição pelo labirinto) */
    const d=new Int16Array(N*N).fill(-1),q=[Math.floor(S.y)*N+Math.floor(S.x)];d[q[0]]=0;for(let i=0;i<q.length;i++){const c=q[i],x=c%N,y=c/N|0;if(d[c]>24)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,j=b*N+a;if(a<0||b<0||a>=N||b>=N||d[j]>=0||m[b][a])continue;d[j]=d[c]+1;q.push(j)}}S.flow=d}
  function stepFoe(e,dt){
    const F=DMF48[e.k],dx=S.x-e.x,dy=S.y-e.y,d=Math.hypot(dx,dy),see=d<10&&los(e.x,e.y,S.x,S.y);
    if(!e.alert&&((see&&d<9)||(S.noise>0&&d<7)))e.alert=true;if(!e.alert)return;
    e.cool-=dt;e.mcd-=dt;const sp=F.sp*ESPD*(e.ph===2?1.35:1)*dt;
    let mx=0,my=0;
    if(see){if(e.k==='ati'){if(d<3.5){mx=-dx/d;my=-dy/d}else if(d>6){mx=dx/d;my=dy/d}else{mx=-dy/d*e.str;my=dx/d*e.str}}else if(d>.75){mx=dx/d;my=dy/d}}
    else if(S.flow){const cx=Math.floor(e.x),cy=Math.floor(e.y);let best=null,bv=S.flow[cy*N+cx];if(bv<0)bv=999;for(const[ax,ay]of[[1,0],[-1,0],[0,1],[0,-1]]){const v=S.flow[(cy+ay)*N+cx+ax];if(v>=0&&v<bv){bv=v;best=[cx+ax+.5,cy+ay+.5]}}
      if(best){const bx=best[0]-e.x,by=best[1]-e.y,bd=Math.hypot(bx,by)||1;mx=bx/bd;my=by/bd}}
    if(mx||my){const r=F.sz*.28,nx=e.x+mx*sp,ny=e.y+my*sp;if(!solid(nx+Math.sign(mx)*r,e.y))e.x=nx;else e.str*=-1;if(!solid(e.x,ny+Math.sign(my)*r))e.y=ny;else e.str*=-1}
    if(d<.8&&e.mcd<=0){e.mcd=.85;hurt(F.mel*EDMG/9,e.x,e.y)}
    if(F.shot&&see&&e.cool<=0&&d<11){e.cool=F.shot/ESPD*(e.ph===2?.7:1)*(.8+Math.random()*.4);const a0=Math.atan2(dy,dx);
      if(e.k==='ati'){const p=Math.random()<.35;S.orbs.push({x:e.x,y:e.y,vx:Math.cos(a0)*3.6*ESPD,vy:Math.sin(a0)*3.6*ESPD,k:p?'p':'w',sx:e.x,sy:e.y})}
      else if(e.k==='tan'){for(let i=-1;i<=1;i++){const a=a0+i*.22;S.orbs.push({x:e.x,y:e.y,vx:Math.cos(a)*2.6*ESPD,vy:Math.sin(a)*2.6*ESPD,k:'h',sx:e.x,sy:e.y})}}
      else{const n=e.ph===2?5:3;for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.2;S.orbs.push({x:e.x,y:e.y,vx:Math.cos(a)*3.6*ESPD,vy:Math.sin(a)*3.6*ESPD,k:i===(n-1)/2?'h':i%2?'p':'w',sx:e.x,sy:e.y})}
        if(e.ph===2&&Math.random()<.35){for(let i=0;i<12;i++){const a=i/12*TAU16;S.orbs.push({x:e.x,y:e.y,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,k:'w',sx:e.x,sy:e.y})}}}}
  }
  function grab(q){const k=q.k;
    if(k==='vit'){if(S.hp>=100)return false;S.hp=Math.min(100,S.hp+25);say('❤ +25 Vital',1.2)}
    else if(k==='arm'){if(S.arm>=100)return false;S.arm=Math.min(100,S.arm+30);say('🛡 +30 Armadura',1.2)}
    else if(k==='luc'){if(S.luc>=100)return false;S.luc=Math.min(100,S.luc+35);say('🧠 +35 Lucidez',1.2)}
    else if(k==='luz'){S.ammo.luz+=15;say('🔫 +15 Luz',1.2)}else if(k==='ess'){S.ammo.ess+=6;say('💥 +6 Essência',1.2)}else if(k==='sol'){S.ammo.sol+=3;say('☀ +3 Sol',1.2)}
    else if(k==='w3'){S.ammo.ess+=10;if(!S.own[2]){S.own[2]=true;S.w=2;say('💥 Escopeta de Essência! (tecla 3)',2.5);C.fx?.flash('#ff9b3d',.25)}else say('💥 +10 Essência',1.2)}
    else if(k==='w4'){S.ammo.sol+=5;if(!S.own[3]){S.own[3]=true;S.w=3;say('☀ Canhão de Sol! (tecla 4)',2.5);C.fx?.flash('#ffd36b',.25)}else say('☀ +5 Sol',1.2)}
    else if(k==='key4'||k==='key5'){const v=+k[3];S.keys[v]=true;say(`🔑 Chave ${v===4?'Dourada':'Azul'}!`,2);C.fx?.flash(v===4?'#ffd36b':'#7fc8ff',.3)}
    fx5(k.startsWith('key')||k.startsWith('w')?'mgWin':'mgCoin');return true}
  function reveal(){const r0=[Math.floor(S.x),Math.floor(S.y)];seen[r0[1]*N+r0[0]]=1;for(let i=0;i<40;i++){const a=i/40*TAU16,dx=Math.cos(a),dy=Math.sin(a);for(let d=.3;d<9;d+=.35){const cx=Math.floor(S.x+dx*d),cy=Math.floor(S.y+dy*d);if(cx<0||cy<0||cx>=N||cy>=N)break;seen[cy*N+cx]=1;if(m[cy][cx])break}}}
  function floorDone(){
    S.phase='tally';S.tally=2.6;const par=60+S.fl*25,tb=Math.max(0,Math.round((par-S.ft)*5));S.score+=500*S.fl+tb;
    S.flStats.push({f:S.fl,t:S.ft,k:S.flKill,s:S.flSec,st:L.secrets.length,tb});fx5('mgWin');C.fx?.flash('#fff3c0',.4);
    progPut38(p=>{p.dm=p.dm||{};if(!inf&&S.fl+1>(p.dm.reach||1))p.dm.reach=Math.min(DMCAMP48,S.fl+1);if(inf&&S.fl>(p.dm.inf||0))p.dm.inf=S.fl});
    if(S.fl+1>=5)C.achieve?.('doom')}
  function save(){let rec=false;progPut38(p=>{p.dm=p.dm||{};if(S.won)p.dm.wins=(p.dm.wins||0)+1;if(S.score>(p.dm.best||0)){p.dm.best=S.score;rec=true}});return rec}
  function html(){return`<ul class="r38-l"><li>🏚 Andares vencidos: <b>${S.flStats.length}</b>${inf?'':` de ${DMCAMP48}`}</li><li>☠ Perseus exorcizados: <b>${S.kills}</b></li><li>✨ Segredos: <b>${S.secrets}</b> de ${S.secTot}</li><li>👑 Chefes: <b>${S.bossKills}</b></li><li>⏱ Tempo: <b>${mmss21(S.t)}</b></li></ul>${S.flStats.length?`<p class="sub">${S.flStats.map(q=>`Andar ${q.f}: ${mmss21(q.t)} · ☠ ${q.k} · ✨ ${q.s}/${q.st}`).join('<br>')}</p>`:''}`}
  function finish(){
    const rec=save(),mul=gdMul38(C.gd),fd=S.flStats.length;
    S.rw={ob:Math.min(220,Math.round((fd*7+S.kills*.25+S.secrets*3+S.bossKills*10)*mul)+(S.won?30:0)+(rec?5:0)),why:[`${fd} andar${fd===1?'':'es'}`,S.won?'campanha vencida':'',rec?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    C.finish({title:S.won?`💀 Você atravessou os ${DMCAMP48} andares do Colapso! · ${S.score} pts`:`💀 O colapso te alcançou no Andar ${S.fl} · ${S.kills} Perseus exorcizados`,rows:[{u:C.me,n:me.n,c:me.c,s:S.score,w:S.won}],unit:'pts',html:html()})}
  function die(){if(S.dead)return;S.dead=true;fx5('mgLose');C.fx?.flash('#600',.5);setTimeout(finish,window.__dmFast?0:900)}
  function win(){S.won=true;S.dead=true;C.achieve?.('dm_campanha');setTimeout(finish,window.__dmFast?0:600)}
  function wpn(i){if(S.own[i]){S.w=i;fx5('click')}}
  floor(f0);
  return{
    st:()=>S,lvl:()=>L,map:()=>m,fire,use,seen:()=>seen,
    wpn,
    reward:()=>S.rw||null,
    key(code,down){S.keys2=S.keys2||{};S.keys2[code]=down;if(!down)return;
      if(code==='Space'||code==='Enter'||code==='KeyF')fire();else if(code==='KeyE')use();
      else if(code==='KeyQ'){for(let k=1;k<=4;k++){const i=(S.w+k)%4;if(S.own[i]){S.w=i;fx5('click');break}}}
      else if(/^Digit[1-4]$/.test(code)){wpn(+code[5]-1)}else if(code==='KeyM'||code==='Tab')S.map=!S.map},
    ptr(t,px,py,e){if(t==='down'){S.drag={x:px,moved:0};if(e&&e.pointerType==='mouse')fire()}else if(t==='move'&&S.drag){const d=px-S.drag.x;S.a+=d*.006;S.drag.moved+=Math.abs(d);S.drag.x=px}else if(t==='up'){if(S.drag&&S.drag.moved<8&&!(e&&e.pointerType==='mouse'))fire();S.drag=null}},
    step(dt){
      if(Date.now()<C.t0||S.dead)return;
      if(S.phase==='tally'){S.tally-=dt;if(S.tally<=0){if(!inf&&S.fl>=DMCAMP48){win();return}floor(S.fl+1)}return}
      S.t+=dt;S.ft+=dt;const k=S.keys2||{};S.cool=Math.max(0,S.cool-dt);S.fire=Math.max(0,S.fire-dt);S.swing=Math.max(0,S.swing-dt);S.hurt=Math.max(0,S.hurt-dt);S.noise=Math.max(0,S.noise-dt);
      const turn=(k.ArrowRight?1:0)-(k.ArrowLeft?1:0);S.a+=turn*2.6*dt;
      const fw=((k.KeyW||k.ArrowUp)?1:0)-((k.KeyS||k.ArrowDown)?1:0),sf=(k.KeyD?1:0)-(k.KeyA?1:0);if(fw||sf){const n=Math.hypot(fw,sf);move((Math.cos(S.a)*fw-Math.sin(S.a)*sf)/n*3.3*dt,(Math.sin(S.a)*fw+Math.cos(S.a)*sf)/n*3.3*dt)}
      S.flowT-=dt;if(S.flowT<=0){S.flowT=.3;flow()}S.seenT-=dt;if(S.seenT<=0){S.seenT=.12;reveal()}
      S.en.slice().forEach(e=>stepFoe(e,dt));
      S.orbs.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;if(solid(q.x,q.y))q.dead=true;else if(Math.hypot(q.x-S.x,q.y-S.y)<.34){q.dead=true;if(q.k==='p')hurt(2,q.sx,q.sy,14);else hurt(q.k==='h'?EDMG*1.5:EDMG,q.sx,q.sy)}});S.orbs=S.orbs.filter(q=>!q.dead);
      S.rk.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;if(solid(r.x,r.y)||S.en.some(e=>Math.hypot(e.x-r.x,e.y-r.y)<DMF48[e.k].sz*.45)){r.dead=true;explode(r.x-r.vx*dt*.5,r.y-r.vy*dt*.5)}});S.rk=S.rk.filter(r=>!r.dead);
      S.items=S.items.filter(q=>!(Math.hypot(q.x-S.x,q.y-S.y)<.55&&grab(q)));
      if(S.dead)return;
      if(Math.hypot(L.portal[0]-S.x,L.portal[1]-S.y)<.6){if(S.boss){const n=performance.now();if(!(S.lastMsg.p>n)){S.lastMsg.p=n+2000;say('🌀 O Portal está selado: derrote o Chefe de Andar')}}else floorDone()}
      const ws=DMW48[S.w];
      C.hud(`💀 Andar <b>${S.fl}</b>${inf?'':'/'+DMCAMP48} · ❤ <b>${Math.ceil(S.hp)}</b> · 🛡 ${Math.ceil(S.arm)} · 🧠 ${Math.ceil(S.luc)} · ${ws.ico} ${ws.n}${ws.am?` <b>${S.ammo[ws.am]}</b>`:''} · ${S.keys[4]?'🔑🟡':''}${S.keys[5]?'🔑🔵':''} · ☠ ${S.kills}`);
    },
    draw(x){
      const T=dmTheme48(S.fl),now=performance.now(),wob=S.luc<35?Math.sin(now/300)*(35-S.luc)/35*.06:0;
      x.save();if(wob){x.translate(W/2,H/2);x.rotate(wob);x.translate(-W/2,-H/2)}
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,T.sky[0]);g.addColorStop(.5,T.sky[1]);g.addColorStop(.5,T.fl[0]);g.addColorStop(1,T.fl[1]);x.fillStyle=g;x.fillRect(-20,-20,W+40,H+40);
      for(let c=0;c<COLS;c++){const ra=S.a-FOV/2+FOV*c/COLS,dx=Math.cos(ra),dy=Math.sin(ra);let mx=Math.floor(S.x),my=Math.floor(S.y);
        const ddx=Math.abs(1/dx),ddy=Math.abs(1/dy),sx=dx<0?-1:1,sy=dy<0?-1:1;let sdx=(dx<0?S.x-mx:mx+1-S.x)*ddx,sdy=(dy<0?S.y-my:my+1-S.y)*ddy,side=0,hit=0;
        for(let i=0;i<80&&!hit;i++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}hit=mx<0||my<0||mx>=N||my>=N?1:m[my][mx]}
        const dist=side?sdy-ddy:sdx-ddx,pd=dist*Math.cos(ra-S.a),h=Math.min(H*3,H/Math.max(.05,pd));S.zb[c]=pd;
        let wx=side?S.x+dist*dx:S.y+dist*dy;wx-=Math.floor(wx);
        const sh=Math.max(.15,1-pd/13)*(side?.75:1);let base=hit===4?[230,180,50]:hit===5?[70,150,240]:T.w[(hit===6?1:hit)-1]||T.w[0];
        if(hit===4||hit===5){if(Math.abs(wx-.5)<.08||wx<.06||wx>.94)base=base.map(v=>v*.6)}
        const y0=(H-h)/2;x.fillStyle=`rgb(${base[0]*sh|0},${base[1]*sh|0},${base[2]*sh|0})`;x.fillRect(c*2,y0,2,h);
        if(hit<4||hit===6){x.fillStyle=`rgba(0,0,0,${.18*sh})`;const row=Math.floor(wx*4);for(let r=1;r<4;r++)x.fillRect(c*2,y0+h*r/4,2,Math.max(1,h/60))}
        if(hit===6&&(Math.abs(wx-.3)<.03||Math.abs(wx-.62)<.025)){x.fillStyle=`rgba(255,255,255,${.12*sh})`;x.fillRect(c*2,y0+h*.2,2,h*.5)}
        if((hit===4||hit===5)&&Math.abs(wx-.5)<.12){x.fillStyle=`rgba(255,255,255,${.5*sh})`;x.fillRect(c*2,y0+h*.42,2,h*.16)}}
      /* sprites */
      const items=S.items.map(q=>({x:q.x,y:q.y,k:'i',it:q.k})),list=[...S.en.map(e=>({x:e.x,y:e.y,k:'e',e})),...S.orbs.map(q=>({x:q.x,y:q.y,k:'o',o:q})),...S.rk.map(r=>({x:r.x,y:r.y,k:'r'})),...items,{x:L.portal[0],y:L.portal[1],k:'p'},...S.booms.map(b=>({x:b.x,y:b.y,k:'b',b}))]
        .map(s=>({...s,d:Math.hypot(s.x-S.x,s.y-S.y)})).sort((a,b)=>b.d-a.d);
      S.booms=S.booms.filter(b=>now-b.t<400);
      list.forEach(s=>{const da=angTo(s.x,s.y);if(Math.abs(da)>FOV*.7||s.d<.15)return;const pd=s.d*Math.cos(da),scx=(.5+da/FOV)*W;
        if(s.k==='e'){const F=DMF48[s.e.k],sz=F.sz*H/pd,top=H/2-sz/2+sz*.08,im=tint18(-1,F.col);
          for(let c=Math.max(0,Math.floor((scx-sz/2)/2));c<Math.min(COLS,Math.ceil((scx+sz/2)/2));c++){if(S.zb[c]<pd)continue;const u=(c*2-(scx-sz/2))/sz;
            if(im)x.drawImage(im,u*im.width,0,Math.max(1,im.width*2/sz),im.height,c*2,top,2,sz);else{x.fillStyle='#b01030';x.fillRect(c*2,top,2,sz)}
            if(now-s.e.hitT<90){x.fillStyle='rgba(255,255,255,.6)';x.fillRect(c*2,top,2,sz)}}
          const cc=Math.floor(scx/2);if(cc>=0&&cc<COLS&&S.zb[cc]>=pd&&(s.e.k==='boss'||s.e.k==='tan')&&s.e.hp<s.e.max){x.fillStyle='#300';x.fillRect(scx-sz*.3,top-8,sz*.6,4);x.fillStyle=s.e.k==='boss'?'#ffb000':'#7fd0ff';x.fillRect(scx-sz*.3,top-8,sz*.6*s.e.hp/s.e.max,4)}
          if(s.e.k==='boss'&&S.zb[cc]>=pd)t21(x,'👑',scx,top-20,{size:Math.max(10,sz*.18)});return}
        const cc=Math.floor(scx/2);if(cc<0||cc>=COLS||S.zb[cc]<pd)return;
        if(s.k==='o'||s.k==='r'){const r=(s.k==='r'?.16:s.o.k==='h'?.15:.11)*H/pd;x.save();x.shadowColor=s.k==='r'?'#ffb347':s.o.k==='p'?'#c070ff':'#ff4a7a';x.shadowBlur=12;x.fillStyle=s.k==='r'?'#ffe27a':s.o.k==='p'?'#c58bff':s.o.k==='h'?'#ff7a3a':'#ff4a7a';x.beginPath();x.arc(scx,H/2+r*.5,r,0,TAU16);x.fill();x.restore();return}
        if(s.k==='b'){const k=(now-s.b.t)/400,r=(.3+k*1.6)*H/pd;x.save();x.globalAlpha=1-k;x.fillStyle='#ffd36b';x.shadowColor='#ff8a00';x.shadowBlur=30;x.beginPath();x.arc(scx,H/2,r,0,TAU16);x.fill();x.restore();return}
        if(s.k==='p'){const r=.42*H/pd;x.save();x.translate(scx,H/2+r*.2);x.rotate(now/400);for(let i=0;i<3;i++){x.strokeStyle=S.boss?`rgba(120,120,140,${.6-i*.15})`:`hsla(${270+i*30},90%,70%,${.9-i*.2})`;x.lineWidth=Math.max(1,r*.12);x.beginPath();x.ellipse(0,0,r*(1-i*.22),r*(1-i*.22)*.8,i,0,TAU16);x.stroke()}x.restore();
          if(s.d<6)t21(x,S.boss?'selado':'PORTAL',scx,H/2-r-10,{size:12,w:800,col:S.boss?'#aaa':'#e9d6ff',stroke:3});return}
        if(s.k==='i'){const sz=.3*H/pd,yy=H/2+.5*H/pd-sz;const IC={vit:['❤','#ff5a6a'],arm:['🛡','#7dffa8'],luc:['🧠','#c58bff'],luz:['🔫','#fff1a8'],ess:['💥','#ff9b3d'],sol:['☀','#ffd36b'],w3:['💥','#ff9b3d'],w4:['☀','#ffd36b'],key4:['🔑','#ffd36b'],key5:['🔑','#7fc8ff']}[s.it]||['?','#fff'];
          x.save();x.shadowColor=IC[1];x.shadowBlur=14;x.fillStyle=IC[1]+'55';x.beginPath();x.arc(scx,yy+sz/2,sz*.6,0,TAU16);x.fill();x.restore();t21(x,IC[0],scx,yy+sz/2,{size:Math.max(8,sz*(s.it.startsWith('w')?1.1:.8))})}});
      x.restore();
      /* arma em primeiro plano */
      const bob=Math.sin(now/160)*4*(((S.keys2||{}).KeyW||(S.keys2||{}).ArrowUp)?1:.3),wy=H+bob;
      x.save();if(S.w===0){const sw=S.swing>0?(.25-S.swing)/.25:0;x.translate(W/2+60-sw*120,wy-70+sw*30);x.rotate(-.6+sw*1.4);x.fillStyle='#c39bff';x.shadowColor='#c39bff';x.shadowBlur=18;x.beginPath();x.moveTo(0,-90);x.lineTo(10,0);x.lineTo(-10,0);x.closePath();x.fill();x.shadowBlur=0;x.fillStyle='#3a2450';x.fillRect(-14,0,28,8);x.fillRect(-5,8,10,40)}
      else if(S.w===1){x.fillStyle='#2a1a2e';x.beginPath();x.moveTo(W/2-36,wy);x.lineTo(W/2-16,wy-84);x.lineTo(W/2+16,wy-84);x.lineTo(W/2+36,wy);x.fill();x.beginPath();x.arc(W/2,wy-90,10,0,TAU16);x.fillStyle='#fff1a8';x.fill()}
      else if(S.w===2){x.fillStyle='#3a2018';x.fillRect(W/2-46,wy-70,92,70);x.fillStyle='#5a3020';x.fillRect(W/2-30,wy-104,24,40);x.fillRect(W/2+6,wy-104,24,40);x.fillStyle='#ff9b3d';x.fillRect(W/2-26,wy-108,16,6);x.fillRect(W/2+10,wy-108,16,6)}
      else{x.fillStyle='#4a3410';x.beginPath();x.moveTo(W/2-56,wy);x.lineTo(W/2-34,wy-80);x.lineTo(W/2+34,wy-80);x.lineTo(W/2+56,wy);x.fill();x.beginPath();x.arc(W/2,wy-86,22,0,TAU16);x.fillStyle='#ffd36b';x.shadowColor='#ffb347';x.shadowBlur=20;x.fill()}
      x.restore();
      if(S.fire>0&&S.w>0){x.save();x.globalAlpha=S.fire/.12;x.beginPath();x.arc(W/2,wy-(S.w===2?112:S.w===3?110:104),S.w===2?40:28,0,TAU16);x.fillStyle=S.w===2?'rgba(255,155,61,.85)':S.w===3?'rgba(255,211,107,.85)':'rgba(255,241,168,.85)';x.fill();x.restore()}
      x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;x.beginPath();x.moveTo(W/2-8,H/2);x.lineTo(W/2+8,H/2);x.moveTo(W/2,H/2-8);x.lineTo(W/2,H/2+8);x.stroke();
      if(S.hurt>0){x.fillStyle=`rgba(255,0,40,${S.hurt*.6})`;x.fillRect(0,0,W,H)}
      /* dano direcional */
      S.dir=S.dir.filter(q=>now-q.t<900);S.dir.forEach(q=>{const k=1-(now-q.t)/900;x.save();x.translate(W/2,H/2);x.rotate(q.a);x.strokeStyle=`rgba(255,40,60,${k})`;x.lineWidth=10;x.beginPath();x.arc(0,0,150,-.35,.35);x.stroke();x.restore()});
      if(S.luc<=0){const v=x.createRadialGradient(W/2,H/2,80,W/2,H/2,380);v.addColorStop(0,'rgba(60,0,80,0)');v.addColorStop(1,`rgba(60,0,80,${.6+.2*Math.sin(now/200)})`);x.fillStyle=v;x.fillRect(0,0,W,H)}
      else if(S.luc<35){x.fillStyle=`rgba(120,40,200,${(35-S.luc)/35*.18})`;x.fillRect(0,0,W,H)}
      /* minimapa / mapa */
      const big=S.map,ms=big?Math.floor(Math.min(W-40,H-40)/N):Math.max(2,Math.floor(110/N)),ox=big?(W-ms*N)/2:8,oy=big?(H-ms*N)/2:8;
      if(big){x.fillStyle='rgba(0,0,0,.78)';x.fillRect(0,0,W,H)}
      x.globalAlpha=big?1:.8;
      for(let y=0;y<N;y++)for(let xx=0;xx<N;xx++){if(!seen[y*N+xx])continue;const v=m[y][xx];x.fillStyle=v===4?'#ffd36b':v===5?'#7fc8ff':v===0?'#2a2236':v===6?'#6a5a7a':'#777';x.fillRect(ox+xx*ms,oy+y*ms,ms,ms)}
      const pc=[Math.floor(L.portal[0]),Math.floor(L.portal[1])];if(seen[pc[1]*N+pc[0]]){x.fillStyle=S.boss?'#888':'#c58bff';x.fillRect(ox+pc[0]*ms,oy+pc[1]*ms,ms,ms)}
      S.items.forEach(q=>{if(!q.k.startsWith('key'))return;const c=Math.floor(q.y)*N+Math.floor(q.x);if(seen[c]){x.fillStyle=q.k==='key4'?'#ffd36b':'#7fc8ff';x.beginPath();x.arc(ox+q.x*ms,oy+q.y*ms,ms*.4+1,0,TAU16);x.fill()}});
      S.en.forEach(e=>{if(Math.hypot(e.x-S.x,e.y-S.y)<9&&los(S.x,S.y,e.x,e.y)){x.fillStyle=e.k==='boss'?'#ffb000':'#f33';x.fillRect(ox+e.x*ms-1.5,oy+e.y*ms-1.5,3,3)}});
      x.fillStyle='#ffd36b';x.beginPath();x.arc(ox+S.x*ms,oy+S.y*ms,Math.max(2,ms*.45),0,TAU16);x.fill();x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.beginPath();x.moveTo(ox+S.x*ms,oy+S.y*ms);x.lineTo(ox+(S.x+Math.cos(S.a)*1.6)*ms,oy+(S.y+Math.sin(S.a)*1.6)*ms);x.stroke();
      x.globalAlpha=1;if(big)t21(x,`Andar ${S.fl} · ${T.n} · M fecha o mapa`,W/2,18,{size:13,col:'#c9b995'});
      /* HUD de baixo */
      const ws=DMW48[S.w];
      txt16(x,`❤ ${Math.ceil(S.hp)}`,14,H-22,{size:20,w:800,al:'left',col:S.hp<34?'#ff6b5b':'#fff',stroke:4});
      txt16(x,`🛡 ${Math.ceil(S.arm)}`,96,H-22,{size:16,w:800,al:'left',col:'#7dffa8',stroke:4});
      txt16(x,`🧠 ${Math.ceil(S.luc)}`,166,H-22,{size:16,w:800,al:'left',col:S.luc<35?'#ff9bf0':'#c58bff',stroke:4});
      txt16(x,`${ws.ico} ${ws.am?S.ammo[ws.am]:'∞'}`,W-14,H-22,{size:20,w:800,al:'right',col:'#fff',stroke:4});
      txt16(x,[0,1,2,3].map(i=>S.own[i]?(i===S.w?`[${i+1}]`:String(i+1)):'·').join(' '),W-14,H-46,{size:12,w:700,al:'right',col:'#c9b995',stroke:3});
      txt16(x,`${S.keys[4]?'🔑':'  '}${S.keys[5]?'🗝':''}`,W-14,26,{size:18,al:'right'});
      if(S.msg&&now<S.msgT)txt16(x,S.msg,W/2,big?44:64,{size:18,w:800,col:'#ffd36b',stroke:4});
      if(S.phase==='tally'){const q=S.flStats[S.flStats.length-1];x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,W,H);
        txt16(x,`Andar ${q.f} concluído!`,W/2,H/2-60,{size:32,w:900,col:'#ffd36b',stroke:5});
        txt16(x,`⏱ ${mmss21(q.t)} · ☠ ${q.k} · ✨ ${q.s}/${q.st} segredos · bônus de tempo +${q.tb}`,W/2,H/2-14,{size:16,col:'#fff',stroke:3});
        txt16(x,!inf&&q.f>=DMCAMP48?'O Colapso foi contido.':`Descendo para o Andar ${q.f+1}…`,W/2,H/2+24,{size:15,col:'#c9b995'})}
    }
  };
}
Object.assign(ACH,{
  doom:{ico:'💀',n:'Exorcista',d:'Chegue ao Andar 5 do DOOM: Colapso Mental.'},
  dm_campanha:{ico:'🏚',n:'Colapso Contido',d:'Vença os 8 andares da Campanha do DOOM.'},
  dm_segredo:{ico:'✨',n:'Caçador de Segredos',d:'Ache todas as paredes secretas de um andar do DOOM.'},
  dm_arsenal:{ico:'🔫',n:'Arsenal Completo',d:'Exorcize Perseus com as 4 armas numa mesma partida do DOOM.'},
  dm_lamina:{ico:'🗡',n:'Corte Final',d:'Derrote um Chefe de Andar com a Lâmina Astral.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='dm48')return`<div>${b('ArrowLeft','↺','','Virar à esquerda')}${b('KeyA','⇠','','Passo à esquerda')}${b('KeyW','▲','','Andar')}${b('KeyS','▼','','Recuar')}${b('KeyD','⇢','','Passo à direita')}${b('ArrowRight','↻','','Virar à direita')}</div><div>${b('Space','✦ Atirar','wide')}${b('KeyE','✋','','Usar')}${b('KeyQ','🔁','','Trocar arma')}${b('KeyM','🗺','','Mapa')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('doom',{...GAMES12.doom,make:doom48,setup:dmSetup48,pad:'dm48',
  desc:'FPS de labirinto em 8 andares (ou infinito): chaves, portas trancadas, paredes secretas, 4 armas, Armadura e Lucidez, 4 tipos de Perseus Corrompidos e chefes.',
  rule:'Ache as chaves, abra as portas e chegue ao Portal. Pontos por inimigos, segredos, andares e tempo.',
  keys:'W/S andam · A/D de lado · ←/→ viram · Espaço atira · E usa · Q ou 1–4 armas · M mapa',touch:'Arraste na tela para virar · toque para atirar'});
console.info('[Tulpa] Etapa 48 carregada (DOOM 2.0)');

/* ===================================================================
   TULPA · ETAPA 49 — 🕹 ARCADE 2.0 · ONDA 6 (parte 2)
   ❤️ JULGAMENTO DA ESSÊNCIA 2.0 — batalha por turnos (estilo Undertale)
   Menu: LUTAR (barra de precisão, crítico no centro) · AGIR (analisar,
   acalmar, descobrir a fraqueza → Rota Pacifista) · ITEM (Vital e
   Lucidez) · POUPAR (quando o nome do chefe fica amarelo).
   3 chefes + o Juiz secreto, cada um com padrões próprios e Fúria.
   Modos de Alma: ❤ Vermelha (livre), 💙 Azul (gravidade e pulo),
   💚 Verde (escudo nas 4 direções contra lanças).
   Ataques: brancos (desvie), AZUIS (fique parado), LARANJAS (continue
   se mexendo) e roxos (roubam Lucidez).
   PvP assimétrico: um é o Arquiteto (gasta Energia em cartas de
   padrão), o outro é a Alma (desvia e contra-ataca). Papéis invertem.
   =================================================================== */
const JUB49={
  cult:{n:'Cultista da Fé',ico:'🕯',col:'#ffd36b',tint:'rgba(255,200,80,.55)',hp:120,atk:0,
    intro:['* O Cultista da Fé bloqueia o caminho.','"Ajoelhe-se, alma perdida! A Fé exige o seu julgamento."'],
    flav:['* O Cultista ajeita as velas com cuidado.','* Cheiro de incenso e dúvida.','* O Cultista murmura uma prece que ele mesmo não termina.','* As velas tremem. As mãos dele também.'],
    lines:['"Sua alma pesa como chumbo!"','"A Fé não perdoa os indecisos!"','"Por que você ainda está de pé?"','"Eu… eu acredito. Não acredito?"'],
    fury:'"CHEGA! A Fé vai queimar a sua dúvida!"',
    acts:[{n:'Analisar',an:1,t:['* CULTISTA DA FÉ · ATQ 6 · DEF 3','* Prega mais alto do que acredita. Talvez queira ser questionado… com gentileza.']},
      {n:'Ouvir o sermão',m:20,max:2,t:['* Você ouve o sermão inteiro. Ele parece surpreso por alguém ouvir.'],t2:['* Você já ouviu esse sermão. Ele também, pelo jeito.']},
      {n:'Elogiar as velas',m:15,max:1,t:['* Você elogia as velas. Ele cora. "Fui eu que fiz…"']},
      {n:'Questionar a fé',need:1,m:45,max:2,t:['* Você pergunta, com calma, em que ele acredita de verdade.','"Eu… nunca tinham me perguntado isso."'],tn:['* Você questiona a fé dele sem entender nada dela.','"HEREGE!" (Ele ficou mais bravo.)'],mn:-10}],
    spare:['* O Cultista apaga as velas, uma por uma.','"Talvez a Fé seja isso: escolher não ferir."','* Você poupou o Cultista da Fé.'],
    kill:['* As velas se apagam de uma vez.','"Então… era só isso…"','* O Cultista da Fé se desfaz em cera e fumaça.'],
    pats:['laminas','velas','cruz','muro','lancas'],fpats:['laminas','cruz','lancas2','velas','muro']},
  nat:{n:'Tulpa da Natureza',ico:'🌿',col:'#7dffa8',tint:'rgba(90,220,130,.55)',hp:140,atk:0,
    intro:['* Raízes rachadas cercam a sala.','* A Tulpa da Natureza range como uma árvore velha.'],
    flav:['* Folhas secas caem sem vento.','* A Tulpa respira devagar. Muito devagar.','* Cheira a terra molhada… quase.','* Um passarinho pousa na Tulpa e vai embora.'],
    lines:['"Sssseca…"','"Pisssaram em mim tantas vezes…"','"Crescer dói."','"Você também tem raízes?"'],
    fury:'"A FLORESTA SE DEFENDE!"',
    acts:[{n:'Analisar',an:1,t:['* TULPA DA NATUREZA · ATQ 5 · DEF 5','* As raízes estão secas há séculos. Um pouco de água faria diferença.']},
      {n:'Regar',need:1,m:40,max:2,t:['* Você rega as raízes com o seu cantil.','* Uma flor pequena se abre no ombro da Tulpa.'],tn:['* Você joga água em qualquer lugar. Molhou só o chão.'],mn:5},
      {n:'Sentar e ouvir',m:20,max:2,t:['* Você se senta e escuta o vento nas folhas. A Tulpa se acalma um pouco.'],t2:['* Vocês dois ficam em silêncio. É bom.']},
      {n:'Pisar nas flores',m:-25,t:['* Você pisa nas flores de propósito.','"…" (As raízes ficam mais duras.)']}],
    spare:['* As raízes afrouxam e abrem caminho.','"Volte na primavera, pequena alma."','* Você poupou a Tulpa da Natureza.'],
    kill:['* A Tulpa racha ao meio com um estalo seco.','"Eu só… queria chuva."','* Restam folhas no chão.'],
    pats:['raizes','folhas','lancas','espinhos','chuva'],fpats:['raizes','espinhos','lancas2','folhas','alterna']},
  void:{n:'Sombra da Inexistência',ico:'🕳',col:'#c58bff',tint:'rgba(150,90,255,.55)',hp:150,atk:1,
    intro:['* Algo que não está aqui está aqui.','* A Sombra da Inexistência olha através de você.'],
    flav:['* A Sombra esquece que existe. Depois lembra.','* Você sente falta de algo que nunca teve.','* O silêncio faz barulho.','* A Sombra conta até zero.'],
    lines:['"Quem… sou… eu?"','"Nada é nada é nada."','"Você me vê? Ninguém vê."','"Se eu sumir, alguém nota?"'],
    fury:'"SE EU NÃO EXISTO, VOCÊ TAMBÉM NÃO!"',
    acts:[{n:'Analisar',an:1,t:['* SOMBRA DA INEXISTÊNCIA · ATQ 7 · DEF 2','* Ela não sabe o próprio nome. Talvez você possa dar um.']},
      {n:'Dar um nome',need:1,m:50,max:2,t:['* Você chama a Sombra de "Lumi".','"…Lumi. Lumi existe."'],tn:['* Você tenta dar um nome, mas ela não escuta. Ainda não.'],mn:0},
      {n:'Ignorar',m:15,max:1,t:['* Você ignora a Sombra.','* Ela fica surpresa. Ser ignorada é quase como ser vista.']},
      {n:'Abraçar',m:25,max:2,hurt:3,t:['* Você abraça a Sombra. Ela é fria.','* Você perde 3 de Vital, mas ela treme menos.']}],
    spare:['* A Sombra ganha contornos. Agora tem um rosto.','"Obrigada por me notar."','* Você poupou a Sombra da Inexistência.'],
    kill:['* A Sombra some. De novo. Para sempre.','* Ninguém lembra que ela estava ali.'],
    pats:['espiral','anel','alterna','olho','chuva'],fpats:['espiral','anel','olho','alterna','lancas2']},
  juiz:{n:'Perseus, o Juiz',ico:'⚖',col:'#ffffff',tint:'rgba(255,255,255,.35)',hp:200,atk:2,secret:1,
    intro:['* Uma balança enorme range no escuro.','* Perseus, o Juiz, lambe a pata e encara você.','"Miau. Vamos ver quanto pesa a sua alma."'],
    flav:['* O Juiz se espreguiça sobre a balança.','* Um sachê vazio rola pelo chão.','* O Juiz anota algo. Parece um desenho de peixe.','* Os pratos da balança oscilam.'],
    lines:['"Culpado de não me dar petisco."','"Objeção negada. Miau."','"Eu vi tudo o que você fez."','"Interessante. Ronrono."'],
    fury:'"ORDEM NO TRIBUNAL! MIAAAU!"',
    acts:[{n:'Analisar',an:1,t:['* PERSEUS, O JUIZ · ATQ 9 · DEF 9','* Julga por petiscos. Sempre julgou.']},
      {n:'Oferecer sachê',need:1,m:40,max:2,t:['* Você oferece um sachê. O Juiz finge não ligar e come tudo.'],tn:['* Você procura um sachê no bolso. Não tem. O Juiz percebe.'],mn:-5},
      {n:'Ronronar',m:20,max:2,t:['* Você tenta ronronar. É péssimo. O Juiz aprecia o esforço.']},
      {n:'Confessar',m:25,max:1,t:['* Você confessa tudo, até o que não fez.','"A corte aprecia a honestidade."']}],
    spare:['* O Juiz bate o martelo. Sai um ronronado.','"Inocente. Agora me faça carinho."','* Você foi absolvido pelo Juiz.'],
    kill:['* A balança se parte.','"Recurso… negado…"','* O tribunal fica vazio.'],
    pats:['laminas','raizes','espiral','lancas','olho','alterna','velas','anel'],fpats:['lancas2','espiral','cruz','espinhos','alterna','olho']},
};
const JUBO49=['cult','nat','void','juiz'];
const JUSOUL49=p=>/^lancas/.test(p)?'green':/^(raizes|espinhos)$/.test(p)?'blue':'red';
const JUBOX49={red:[240,160],blue:[320,130],green:[140,140]};
const JUC49={w:'#ffffff',b:'#3ab0ff',o:'#ff9b2f',p:'#c070ff',y:'#ffe14a'};
/* ---------- padrões de ataque (cada um cria balas na caixa) ---------- */
const JUPAT49={
  laminas:{n:'Lâminas da Fé',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.75/P.sp;const L=I.rnd()<.5,g=P.b.y+14+I.rnd()*(P.b.h-78),x=L?P.b.x-14:P.b.x+P.b.w+14,v=(L?1:-1)*150*P.sp;
    P.add({x,y:(P.b.y+g)/2,w:12,h:g-P.b.y,vx:v,c:'w'});P.add({x,y:(g+56+P.b.y+P.b.h)/2,w:12,h:P.b.y+P.b.h-g-56,vx:v,c:'w'})}},
  velas:{n:'Chama das Velas',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.1/P.sp;const x=P.b.x+I.rnd()*P.b.w;P.add({x,y:P.b.y-6,r:5,vy:(110+I.rnd()*60)*P.sp,c:I.rnd()<.7?'o':'w'})}},
  cruz:{n:'Cruz Girante',tick(I,P,dt){I.a=(I.a||0)+1.1*dt*P.sp;I.c-=dt;if(I.c>0)return;I.c=.2/P.sp;const cx=P.b.x+P.b.w/2,cy=P.b.y+P.b.h/2;for(let k=0;k<4;k++){const a=I.a+k*Math.PI/2;P.add({x:cx,y:cy,r:4,vx:Math.cos(a)*105*P.sp,vy:Math.sin(a)*105*P.sp,c:'w'})}}},
  muro:{n:'Muro Azul',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=1.25/P.sp;const L=I.rnd()<.5;P.add({x:L?P.b.x-8:P.b.x+P.b.w+8,y:P.b.y+P.b.h/2,w:14,h:P.b.h,vx:(L?1:-1)*140*P.sp,c:'b'});for(let i=0;i<2;i++)P.add({x:P.b.x+I.rnd()*P.b.w,y:P.b.y-6,r:4,vy:120*P.sp,c:'w'})}},
  muroL:{n:'Muro Laranja',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=1.25/P.sp;const L=I.rnd()<.5;P.add({x:L?P.b.x-8:P.b.x+P.b.w+8,y:P.b.y+P.b.h/2,w:14,h:P.b.h,vx:(L?1:-1)*140*P.sp,c:'o'})}},
  lancas:{n:'Lanças da Verdade',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.62/P.sp;const d=Math.floor(I.rnd()*4);P.spear(d,150*P.sp,false)}},
  lancas2:{n:'Lanças Invertidas',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.46/P.sp;const d=Math.floor(I.rnd()*4);P.spear(d,175*P.sp,I.rnd()<.3)}},
  raizes:{n:'Raízes Rasteiras',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.95/P.sp;const L=I.rnd()<.5,h=22+I.rnd()*22,blue=I.rnd()<.25;P.add({x:L?P.b.x-8:P.b.x+P.b.w+8,y:P.b.y+P.b.h-h/2,w:12,h:blue?P.b.h:h,vx:(L?1:-1)*150*P.sp,c:blue?'b':'w',...(blue?{y:P.b.y+P.b.h/2}:{})})}},
  espinhos:{n:'Espinhos',tick(I,P,dt){I.c-=dt;I.d=(I.d||0)-dt;if(I.c<=0){I.c=.28/P.sp;P.add({x:P.b.x+I.rnd()*P.b.w,y:P.b.y-6,r:4,vy:130*P.sp,c:'w'})}
    if(I.d<=0){I.d=1.4/P.sp;const L=I.rnd()<.5;P.add({x:L?P.b.x-8:P.b.x+P.b.w+8,y:P.b.y+P.b.h-12,w:24,h:24,vx:(L?1:-1)*170*P.sp,c:'w'})}}},
  folhas:{n:'Folhas ao Vento',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.16/P.sp;P.add({x:P.b.x+I.rnd()*P.b.w,y:P.b.y-6,r:5,vy:80*P.sp,c:I.rnd()<.2?'p':'w',wav:40+I.rnd()*40,ph:I.rnd()*6})}},
  espiral:{n:'Espiral do Nada',tick(I,P,dt){I.a=(I.a||0)+dt*2.4*P.sp;I.c-=dt;if(I.c>0)return;I.c=.07/P.sp;I.k=(I.k||0)+1;const cx=P.b.x+P.b.w/2,cy=P.b.y-24;P.add({x:cx,y:cy,r:4,vx:Math.cos(I.a)*120*P.sp,vy:Math.abs(Math.sin(I.a))*120*P.sp+40,c:I.k%4===0?'p':'w'})}},
  anel:{n:'Anel do Véu',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=1.6/P.sp;const n=18,miss=Math.floor(I.rnd()*n),s=P.soul();for(let i=0;i<n;i++){if(i===miss||i===(miss+1)%n||i===(miss+2)%n)continue;const a=i/n*TAU16;P.add({x:s.x+Math.cos(a)*200,y:s.y+Math.sin(a)*200,r:5,vx:-Math.cos(a)*100*P.sp,vy:-Math.sin(a)*100*P.sp,c:'w'})}}},
  alterna:{n:'Paredes Gêmeas',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.95/P.sp;I.k=(I.k||0)+1;const L=I.k%2===0;P.add({x:L?P.b.x-8:P.b.x+P.b.w+8,y:P.b.y+P.b.h/2,w:14,h:P.b.h,vx:(L?1:-1)*150*P.sp,c:I.k%2?'b':'o'})}},
  olho:{n:'Olho da Verdade',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.85/P.sp;const cx=P.b.x+P.b.w/2,cy=P.b.y-30,s=P.soul(),a0=Math.atan2(s.y-cy,s.x-cx);for(let i=-1;i<=1;i++){const a=a0+i*.22;P.add({x:cx,y:cy,r:5,vx:Math.cos(a)*170*P.sp,vy:Math.sin(a)*170*P.sp,c:i?'w':(I.rnd()<.4?'p':'w')})}}},
  chuva:{n:'Chuva de Ilusão',tick(I,P,dt){I.c-=dt;if(I.c>0)return;I.c=.1/P.sp;P.add({x:P.b.x+I.rnd()*P.b.w,y:P.b.y-8,r:4,vx:(I.rnd()-.5)*30,vy:(140+I.rnd()*80)*P.sp,c:I.rnd()<.12?'p':'w'})}},
};
/* cartas do PvP */
const JUCARD49=[{k:'laminas',n:'Lâminas',c:20,d:3},{k:'chuva',n:'Chuva',c:15,d:3},{k:'muro',n:'Muro Azul',c:25,d:3},{k:'muroL',n:'Muro Laranja',c:25,d:3},{k:'anel',n:'Anel',c:35,d:1.6},{k:'lancas',n:'Lanças 💚',c:35,d:3.5},{k:'raizes',n:'Raízes 💙',c:30,d:4}];

function juProg49(){const p=prog38().ju||{};return{r:p.r||{}}}
const juOpen49=k=>k!=='juiz'||['cult','nat','void'].every(b=>{const r=juProg49().r[b];return r&&(r.p||r.f)});
const juSetup49={
  intro:o=>o._m==='pvp'?'Duelo de Almas: um é o Arquiteto e gasta Energia em cartas de ataque; o outro é a Alma, desvia e contra-ataca. Os papéis invertem a cada rodada.':'Escolha quem vai julgar você. Dá para vencer lutando ou poupando: descubra a fraqueza com AGIR.',
  def:()=>({b:'cult',rd:'6'}),
  fields:o=>{if(o._m==='pvp')return[{k:'rd',l:'Rodadas',opts:[{v:'4',n:'4 rodadas',ico:'⚡',d:'Duelo rápido.'},{v:'6',n:'6 rodadas',ico:'⚖',d:'Cada um é Alma 3 vezes.'},{v:'8',n:'8 rodadas',ico:'🔥',d:'Duelo longo.'}]}];
    const p=juProg49();return[{k:'b',l:'Chefe',wide:1,opts:JUBO49.map(k=>{const B=JUB49[k],r=p.r[k]||{},lock=!juOpen49(k);return{v:k,n:lock?'???':B.n,ico:lock?'🔒':B.ico,d:lock?'Vença os outros três chefes.':`Vital ${B.hp} · ${B.pats.length} padrões + Fúria`,lock,badge:[r.p?'☮':'',r.f?'⚔':''].join(' ').trim()}})}]},
  fix:o=>{if(!JUBO49.includes(o.b)||!juOpen49(o.b))o.b='cult';if(!['4','6','8'].includes(o.rd))o.rd='6'},
  sum:o=>o._m==='pvp'?'Alma: WASD ou setas (💙 pula com W/↑, 💚 vira o escudo). Arquiteto: teclas 1–7 ou toque nas cartas. Contra-ataque: Z, Espaço ou toque na hora certa.':'← → escolhem · Z, Enter ou Espaço confirmam · X volta. Na caixa: WASD ou setas. ❤ livre · 💙 pula · 💚 escudo. Branco: desvie · AZUL: fique parado · LARANJA: continue se mexendo · roxo rouba Lucidez.'
};

/* ---------- motor da caixa (compartilhado entre solo e PvP) ---------- */
function juArena49(C,opt){
  const A={b:{x:180,y:165,w:240,h:160},tb:null,bul:[],sp:[],inst:[],soul:{x:300,y:245,vx:0,vy:0,g:true,mode:'red',sh:0,moving:false},inv:0,flash:0,
    keys:{},drag:null,lastDir:0};
  const P={get b(){return A.b},sp:1,add:o=>A.bul.push({vx:0,vy:0,r:0,...o,t:0}),soul:()=>A.soul,
    spear(d,v,rev){const cx=A.b.x+A.b.w/2,cy=A.b.y+A.b.h/2,dx=[1,0,-1,0][d],dy=[0,1,0,-1][d];A.sp.push({d,x:cx+dx*170,y:cy+dy*170,v,rev,flip:false})}};
  A.P=P;
  A.setMode=(mode,instant)=>{const [w,h]=JUBOX49[mode];A.tb={x:300-w/2,y:245-h/2,w,h};if(instant)A.b={...A.tb};const s=A.soul;s.mode=mode;s.vx=s.vy=0;if(mode==='green'){s.x=300;s.y=245}else{s.x=clamp12(s.x,A.tb.x+8,A.tb.x+A.tb.w-8);s.y=mode==='blue'?A.tb.y+A.tb.h-8:clamp12(s.y,A.tb.y+8,A.tb.y+A.tb.h-8)}};
  A.start=(pat,dur,sp,seed)=>{A.inst.push({p:pat,t:0,dur,c:.35,rnd:mb32((seed>>>0)||1)});P.sp=sp};
  A.clear=()=>{A.bul=[];A.sp=[];A.inst=[]};
  A.step=(dt,inv,hit)=>{
    const b=A.b,t=A.tb;if(t){const k=Math.min(1,dt*10);b.x+=(t.x-b.x)*k;b.y+=(t.y-b.y)*k;b.w+=(t.w-b.w)*k;b.h+=(t.h-b.h)*k}
    A.inst.forEach(I=>{I.t+=dt;if(I.t<I.dur-.5)JUPAT49[I.p].tick(I,P,dt)});A.inst=A.inst.filter(I=>I.t<I.dur);
    const s=A.soul,K=A.keys,sg=inv?-1:1;let ix=((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0),iy=((K.KeyS||K.ArrowDown)?1:0)-((K.KeyW||K.ArrowUp)?1:0);ix*=sg;iy*=sg;
    if(A.drag&&s.mode!=='green'){const dx=A.drag.x-s.x,dy=A.drag.y-s.y,d=Math.hypot(dx,dy);if(d>5){ix=dx/d;iy=s.mode==='blue'?(A.drag.y<s.y-30?-1:0):dy/d}}
    const ox=s.x,oy=s.y;
    if(s.mode==='red'){const n=Math.hypot(ix,iy)||1;s.x+=ix/n*150*dt;s.y+=iy/n*150*dt}
    else if(s.mode==='blue'){s.x+=ix*150*dt;const up=iy<0;if(up&&s.g){s.vy=-310;s.g=false;fx5('mgJump')}s.vy+=(s.vy<0&&!up?1900:900)*dt;s.y+=s.vy*dt;const fl=b.y+b.h-8;if(s.y>=fl){s.y=fl;s.vy=0;s.g=true}}
    else{if(ix||iy){const d=ix>0?0:iy>0?1:ix<0?2:3;if(d!==s.sh){s.sh=d;fx5('click')}}}
    s.x=clamp12(s.x,b.x+8,b.x+b.w-8);s.y=clamp12(s.y,b.y+8,b.y+b.h-8);
    s.moving=s.mode==='blue'?(Math.abs(s.x-ox)>.01||!s.g):Math.hypot(s.x-ox,s.y-oy)>.01;
    A.bul.forEach(q=>{q.t+=dt;q.x+=q.vx*dt+(q.wav?Math.cos(q.t*3+q.ph)*q.wav*dt:0);q.y+=q.vy*dt});
    A.bul=A.bul.filter(q=>q.x>b.x-260&&q.x<b.x+b.w+260&&q.y>b.y-260&&q.y<b.y+b.h+260);
    const cx=b.x+b.w/2,cy=b.y+b.h/2;
    A.sp.forEach(q=>{const dx=[1,0,-1,0][q.d],dy=[0,1,0,-1][q.d];let dist=Math.hypot(q.x-cx,q.y-cy)-q.v*dt;if(q.rev&&!q.flip&&dist<70){q.flip=true;q.d=(q.d+2)%4}
      const ndx=[1,0,-1,0][q.d],ndy=[0,1,0,-1][q.d];q.x=cx+ndx*dist;q.y=cy+ndy*dist;
      if(dist<22){q.dead=true;if(s.sh===q.d){A.flash=performance.now();fx5('mgBall');hit&&hit('block')}else hit&&hit('w')}});
    A.sp=A.sp.filter(q=>!q.dead);
    if(A.inv>0){A.inv-=dt;return}
    for(const q of A.bul){let touch=false;
      if(q.w){touch=Math.abs(s.x-q.x)<q.w/2+5&&Math.abs(s.y-q.y)<q.h/2+5}else touch=Math.hypot(q.x-s.x,q.y-s.y)<q.r+5;
      if(!touch)continue;
      if(q.c==='w'||(q.c==='b'&&s.moving)||(q.c==='o'&&!s.moving)){hit&&hit(q.c);break}
      if(q.c==='p'&&!q.used){q.used=true;hit&&hit('p')}}
  };
  A.key=(code,down)=>{A.keys[code]=down};
  A.ptr=(t,px,py)=>{if(t==='down'||(t==='move'&&A.drag))A.drag={x:px,y:py};if(t==='up')A.drag=null;
    if(t==='down'&&A.soul.mode==='green'){const dx=px-300,dy=py-245;A.soul.sh=Math.abs(dx)>Math.abs(dy)?(dx>0?0:2):(dy>0?1:3);fx5('click')}};
  A.draw=(x,ghost,tint)=>{
    const b=A.b,s=A.soul,now=performance.now();
    x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(b.x-2,b.y-2,b.w+4,b.h+4);
    if(tint){x.fillStyle=tint;x.fillRect(b.x,b.y,b.w,b.h)}
    x.save();x.beginPath();x.rect(b.x,b.y,b.w,b.h);x.clip();
    A.bul.forEach(q=>{x.fillStyle=JUC49[q.c];if(q.w){x.fillRect(q.x-q.w/2,q.y-q.h/2,q.w,q.h)}else{x.beginPath();x.arc(q.x,q.y,q.r,0,TAU16);x.fill()}});
    x.restore();
    A.bul.forEach(q=>{if(q.w)return;if(q.x<b.x||q.x>b.x+b.w||q.y<b.y||q.y>b.y+b.h){x.fillStyle=JUC49[q.c];x.beginPath();x.arc(q.x,q.y,q.r,0,TAU16);x.fill()}});
    A.sp.forEach(q=>{const a=[0,Math.PI/2,Math.PI,-Math.PI/2][q.d];x.save();x.translate(q.x,q.y);x.rotate(a+Math.PI);x.fillStyle=q.rev&&!q.flip?JUC49.y:'#fff';x.beginPath();x.moveTo(14,0);x.lineTo(-8,-6);x.lineTo(-4,0);x.lineTo(-8,6);x.closePath();x.fill();x.restore()});
    const col=s.mode==='blue'?'#3a6bff':s.mode==='green'?'#3fd46a':'#ff2a3d';
    if(s.mode==='green'){const a=[0,Math.PI/2,Math.PI,-Math.PI/2][s.sh];x.save();x.translate(s.x,s.y);x.rotate(a);x.strokeStyle=now-A.flash<120?'#fff':'#3a8bff';x.lineWidth=5;x.beginPath();x.arc(0,0,20,-.7,.7);x.stroke();x.restore();x.strokeStyle='rgba(63,212,106,.3)';x.lineWidth=1;x.beginPath();x.arc(s.x,s.y,22,0,TAU16);x.stroke()}
    x.save();if(A.inv>0&&Math.floor(now/80)%2)x.globalAlpha=.3;if(ghost)x.globalAlpha=.55;heart16(x,s.x,s.y,7,col);x.restore()};
  return A}

function julgamento49(C){
  if(C.net)return juPvp49(C);
  const W=600,H=450,o=C.room.opt||{},bk=JUBO49.includes(o.b)?o.b:'cult',B=JUB49[bk],me=me21(C),li=GD12[C.gd]??1;
  const VMAX=gdPick(C.gd,[40,30,24,20]),ATK=gdPick(C.gd,[3,4,5,6])+B.atk,SPD=gdPick(C.gd,[.85,1,1.12,1.25]);
  const S={st:'text',q:B.intro.slice(),qi:0,ch:0,after:'menu',sel:0,sub:0,hp:VMAX,luc:100,bhp:B.hp,mercy:0,an:false,used:{},turn:0,fury:false,
    items:[{n:'Chá de Ervas',v:15,k:'hp',q:gdPick(C.gd,[3,2,2,1])},{n:'Pão Bento',v:25,k:'hp',q:gdPick(C.gd,[2,1,1,1])},{n:'Incenso',v:40,k:'luc',q:gdPick(C.gd,[2,2,1,1])},{n:'Sachê do Perseus',v:999,k:'hp',q:1}],
    bar:0,barOn:false,dmgT:0,dmgN:'',shake:0,dodgeT:0,pat:'',hits:0,crits:0,critRow:0,done:false,route:'',t:0,bubble:'',flavor:B.flav[0],won:false};
  const A=juArena49(C);A.setMode('red',true);
  function say(lines,after){S.st='text';S.q=lines.slice();S.qi=0;S.ch=0;S.after=after}
  const spareable=()=>S.mercy>=100;
  function bossLine(){return S.fury?B.fury:B.lines[S.turn%B.lines.length]}
  function toDodge(){const list=S.fury?B.fpats:B.pats;let p=list[S.turn%list.length];if(bk==='juiz'){const r=mb32(C.seed+S.turn*77);p=list[Math.floor(r()*list.length)]}
    S.pat=p;S.st='dodge';S.dodgeT=S.fury?7.5:6.5;const mode=JUSOUL49(p);A.clear();A.setMode(mode);A.soul.x=300;A.soul.y=mode==='blue'?999:245;A.setMode(mode);
    A.start(p,S.dodgeT,SPD*(S.fury?1.22:1),C.seed+S.turn*131+7);if(mode!=='red')C.fx?.float(300,150,mode==='blue'?'💙 Alma Azul':'💚 Alma Verde',{col:mode==='blue'?'#6a9bff':'#5fe08a',size:20});fx5('activate')}
  function endTurn(){S.turn++;A.clear();A.setMode('red');
    if(!S.fury&&(S.bhp<B.hp/2||S.turn>=7)){S.fury=true;C.fx?.shake(8,.5);C.fx?.flash(B.col,.3);say([`* ${B.n} entra em FÚRIA!`,B.fury],'menu');return}
    S.flavor=spareable()?`* ${B.n} não quer mais lutar.`:B.flav[S.turn%B.flav.length];S.st='menu'}
  function hit(c){if(S.st!=='dodge'||S.done)return;if(c==='block'){return}
    if(c==='p'){S.luc=Math.max(0,S.luc-12);fx5('error');C.fx?.float(A.soul.x,A.soul.y-16,'-12 🧠',{col:'#c58bff',size:14});return}
    S.hp-=ATK+(S.fury?1:0);S.hits++;A.inv=.9;fx5('error');C.fx?.shake(4,.2);if(S.hp<=0){S.hp=0;lose()}}
  function lose(){S.done=true;S.st='text';S.q=['* Sua essência se partiu.','* Mas a sua determinação… ainda brilha?'];S.qi=0;S.ch=0;S.after='lost';A.clear();fx5('mgLose')}
  function act(i){const a=B.acts[i];let lines=[],n=0;
    if(a.an){S.an=true;lines=a.t}else if(a.need&&!S.an){lines=a.tn;S.mercy=Math.max(0,S.mercy+(a.mn||0))}
    else{n=S.used[i]=(S.used[i]||0)+1;const gain=a.max&&n>a.max?0:a.m;lines=n>1&&a.t2?a.t2:a.t;S.mercy=clamp12(S.mercy+gain*(gain>0&&S.luc<30?.5:1),0,120);if(a.hurt){S.hp=Math.max(1,S.hp-a.hurt)}if(gain<=0&&a.m>0&&!a.t2)lines=['* Não teve mais efeito.']}
    if(spareable())lines=lines.concat([`* O nome de ${B.n} ficou amarelo. Você já pode POUPAR.`]);
    say(lines.concat([bossLine()]),'dodge')}
  function useItem(i){const it=S.items[i];if(!it||!it.q)return;it.q--;if(it.k==='hp'){const g=Math.min(VMAX-S.hp,it.v);S.hp+=g;say([`* Você usou ${it.n}. +${g} Vital.`,bossLine()],'dodge')}else{const g=Math.min(100-S.luc,it.v);S.luc+=g;say([`* Você acendeu ${it.n}. +${g} Lucidez.`,bossLine()],'dodge')}fx5('mgCoin')}
  function spare(){if(spareable()){S.route='p';S.done=true;S.won=true;say(B.spare,'won');fx5('mgWin');C.fx?.flash('#ffe14a',.35)}else say([`* Você tenta poupar ${B.n}…`,`* …mas ${B.n} ainda não quer ser poupado.`,bossLine()],'dodge')}
  function strike(){if(!S.barOn)return;S.barOn=false;const p=S.bar,off=Math.abs(p-.5);let d,crit=false;
    if(p>=1){d=0}else{d=Math.max(3,Math.round(24*(1-off*1.7)));if(off<.035){d*=2;crit=true}}
    if(crit){S.crits++;S.critRow++;if(S.critRow>=3)C.achieve?.('ju_crit')}else S.critRow=0;
    S.bhp=Math.max(0,S.bhp-d);S.dmgN=d?(crit?`CRÍTICO! ${d}`:String(d)):'ERROU';S.dmgT=performance.now();S.shake=d?.5:0;S.mercy=Math.max(0,S.mercy-(d?15:0));
    fx5(d?(crit?'bb7':'bb4'):'error');if(crit)C.fx?.flash('#fff',.25);
    setTimeout(()=>{if(S.done)return;if(S.bhp<=0){S.route='f';S.done=true;S.won=true;say(B.kill,'won');fx5('mgWin')}else say([bossLine()],'dodge')},window.__juFast?0:900);S.st='hit'}
  function confirm(){
    if(S.st==='menu'){fx5('confirm');if(S.sel===0){S.st='fight';S.bar=0;S.barOn=true}else if(S.sel===1){S.st='act';S.sub=0}else if(S.sel===2){if(!S.items.some(i=>i.q)){S.flavor='* Seus bolsos estão vazios.';return}S.st='item';S.sub=S.items.findIndex(i=>i.q)}else spare();return}
    if(S.st==='act'){act(S.sub);return}
    if(S.st==='item'){useItem(S.sub);return}
    if(S.st==='fight'){strike();return}
    if(S.st==='text'){const L=S.q[S.qi]||'';if(S.ch<L.length){S.ch=L.length;return}S.qi++;S.ch=0;if(S.qi>=S.q.length)nextAfter()}}
  function nextAfter(){const a=S.after;if(a==='menu'){S.st='menu';S.flavor=B.flav[S.turn%B.flav.length]}else if(a==='dodge')toDodge();else if(a==='won'||a==='lost')finish()}
  function save(){let first=false;progPut38(p=>{p.ju=p.ju||{};p.ju.r=p.ju.r||{};const r=p.ju.r[bk]=p.ju.r[bk]||{};if(S.won){first=!r[S.route];r[S.route]=1}
    const R=p.ju.r;if(['cult','nat','void'].every(k=>R[k]&&R[k].p))C.achieve?.('ju_paz');if(['cult','nat','void'].every(k=>R[k]&&R[k].f))C.achieve?.('ju_luta')});return first}
  function finish(){if(S.st==='over')return;S.st='over';const first=save(),mul=gdMul38(C.gd);
    if(S.won&&!S.hits)C.achieve?.('coracao');if(S.won&&bk==='juiz')C.achieve?.('ju_juiz');
    const sc=Math.round((S.won?(S.route==='p'?1500:1000):0)+S.hp*20+S.turn*40+S.crits*30+(S.won&&!S.hits?500:0));
    S.rw={ob:S.won?Math.round((12+JUBO49.indexOf(bk)*5+(S.route==='p'?6:0))*mul+(first?15:0)):3,why:[B.n,S.won?(S.route==='p'?'poupado':'derrotado'):'tentativa',first?'rota nova':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    C.finish({title:S.won?(S.route==='p'?`☮ Você poupou ${B.n}!`:`⚔ Você derrotou ${B.n}!`):`💔 ${B.n} venceu o Julgamento`,rows:[{u:C.me,n:me.n,c:me.c,s:sc,w:S.won}],unit:'pts',
      html:`<ul class="r38-l"><li>⏳ Turnos: <b>${S.turn}</b></li><li>❤ Vital restante: <b>${S.hp}</b>/${VMAX}</li><li>💥 Golpes levados: <b>${S.hits}</b></li><li>✦ Críticos: <b>${S.crits}</b></li><li>💛 Misericórdia: <b>${Math.min(100,Math.round(S.mercy))}%</b></li></ul>${bk!=='juiz'&&juOpen49('juiz')&&S.won?'<p class="r38-hi">⚖ Perseus, o Juiz, espera por você.</p>':''}`})}
  function nav(dx,dy){if(S.st==='menu'){S.sel=(S.sel+dx+4)%4;if(dx)fx5('click')}
    else if(S.st==='act'){const n=B.acts.length;S.sub=clamp12(S.sub+dx+dy*2,0,n-1);fx5('click')}
    else if(S.st==='item'){let i=S.sub;const n=S.items.length;for(let k=0;k<n;k++){i=(i+(dx+dy*2||1)+n)%n;if(S.items[i].q)break}S.sub=i;fx5('click')}}
  const BTN=[[30,'LUTAR','✊'],[170,'AGIR','💬'],[310,'ITEM','🎒'],[450,'POUPAR','🕊']];
  const rowAt=(px,py)=>{if(px<A.b.x||px>A.b.x+A.b.w||py<A.b.y||py>A.b.y+A.b.h)return -1;return(py>A.b.y+A.b.h/2?2:0)+(px>A.b.x+A.b.w/2?1:0)};
  return{st:()=>S,arena:A,B,act,useItem,spare,strike,confirm,toDodge,
    reward:()=>S.rw||null,
    next(){if(!S.won)return{opt:{b:bk},label:'Tentar de novo'};const i=JUBO49.indexOf(bk);const nx=JUBO49.slice(i+1).find(k=>juOpen49(k));return nx?{opt:{b:nx},label:`Próximo: ${JUB49[nx].n}`}:null},
    key(code,down){if(Date.now()<C.t0)return;A.key(code,down);if(!down)return;
      if(S.st==='dodge')return;
      if(code==='ArrowLeft'||code==='KeyA')nav(-1,0);else if(code==='ArrowRight'||code==='KeyD')nav(1,0);else if(code==='ArrowUp'||code==='KeyW')nav(0,-1);else if(code==='ArrowDown'||code==='KeyS')nav(0,1);
      else if(code==='KeyZ'||code==='Enter'||code==='Space')confirm();else if((code==='KeyX'||code==='Backspace'||code==='ShiftLeft')&&(S.st==='act'||S.st==='item')){S.st='menu';fx5('click')}},
    ptr(t,px,py){if(Date.now()<C.t0)return;if(S.st==='dodge'){A.ptr(t,px,py);return}if(t!=='down')return;
      if(py>392&&py<440){const i=BTN.findIndex(b=>px>=b[0]&&px<=b[0]+120);if(i>=0&&(S.st==='menu'||S.st==='act'||S.st==='item')){S.sel=i;S.st='menu';confirm();return}}
      if(S.st==='act'||S.st==='item'){const r=rowAt(px,py);if(r>=0&&(S.st==='act'?r<B.acts.length:S.items[r]&&S.items[r].q)){S.sub=r;confirm()}return}
      confirm()},
    step(dt){if(Date.now()<C.t0||S.st==='over')return;S.t+=dt;
      if(S.st==='text'){const L=S.q[S.qi]||'';S.ch=Math.min(L.length,S.ch+dt*55)}
      if(S.st==='fight'&&S.barOn){S.bar+=dt/(S.luc<30?.72:1.05);if(S.bar>=1){S.bar=1;strike()}}
      if(S.st==='dodge'){S.dodgeT-=dt;A.step(dt,S.luc<=0,hit);if(S.dodgeT<=0&&!S.done)endTurn()}else A.step(dt,false,null);
      S.shake=Math.max(0,S.shake-dt);
      C.hud(`${B.ico} <b style="color:${spareable()?'#ffe14a':'#fff'}">${esc(B.n)}</b> · ❤ <b>${S.hp}</b>/${VMAX} · 🧠 ${Math.round(S.luc)} · 💛 ${Math.min(100,Math.round(S.mercy))}% · turno ${S.turn+1}${S.fury?' · <b style="color:#ff6b5b">FÚRIA</b>':''}${S.st==='dodge'&&JUPAT49[S.pat]?` · ${JUPAT49[S.pat].n}`:''}`)},
    draw(x){
      const now=performance.now();x.fillStyle='#000';x.fillRect(0,0,W,H);
      if(S.luc<=0&&S.st==='dodge'){x.fillStyle=`rgba(80,0,120,${.25+.1*Math.sin(now/150)})`;x.fillRect(0,0,W,H)}
      /* chefe */
      const sx=S.shake>0?Math.sin(now/20)*8*S.shake:0,by=78+Math.sin(now/700)*4;
      x.save();x.globalAlpha=S.won&&S.route==='f'?.25:1;
      x.fillStyle=B.col+'22';x.beginPath();x.ellipse(300+sx,by,70+(S.fury?Math.sin(now/90)*6:0),62,0,0,TAU16);x.fill();
      const im=tint18(-1,B.tint);if(im){const s=110;x.drawImage(im,300-s/2+sx,by-s/2,s,s)}else sprAt16(x,-1,300+sx,by,100);
      t21(x,B.ico,300+sx+52,by-46,{size:26});x.restore();
      t21(x,B.n.toUpperCase(),300,142,{size:12,w:800,col:spareable()?'#ffe14a':'#bbb'});
      /* vida do chefe ao golpear */
      if(now-S.dmgT<1200||S.st==='fight'||S.st==='hit'){x.fillStyle='#400';x.fillRect(220,150,160,8);x.fillStyle='#7dffa8';x.fillRect(220,150,160*S.bhp/B.hp,8)}
      if(now-S.dmgT<1100)t21(x,S.dmgN,300,40-(now-S.dmgT)/40,{size:S.dmgN.startsWith('CR')?30:26,w:900,col:S.dmgN==='ERROU'?'#bbb':'#ff4a5a',stroke:4});
      /* fala do chefe */
      if(S.st==='text'&&/^"/.test(S.q[S.qi]||'')){const L=(S.q[S.qi]||'').slice(0,Math.ceil(S.ch));x.fillStyle='#fff';rr21(x,388,30,196,84,10);x.fill();x.beginPath();x.moveTo(390,72);x.lineTo(372,80);x.lineTo(390,86);x.fill();wrap16(x,L,486,48,180,16,'#111',13)}
      /* caixa */
      if(S.st==='dodge'||S.st==='over'&&!S.won){A.draw(x,false,null)}
      else{const b={x:30,y:170,w:540,h:150};A.b={...b};A.tb={...b};x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(b.x-2,b.y-2,b.w+4,b.h+4);
        if(S.st==='text'&&!/^"/.test(S.q[S.qi]||''))wrap16(x,(S.q[S.qi]||'').slice(0,Math.ceil(S.ch)),300,200,500,24,'#fff',18);
        else if(S.st==='text')wrap16(x,'* …',300,200,500,24,'#888',18);
        else if(S.st==='menu')wrap16(x,S.flavor,300,200,500,24,'#fff',18);
        else if(S.st==='act'||S.st==='item'){const L=S.st==='act'?B.acts.map(a=>a.n+(a.need&&!S.an?' ?':'')):S.items.map(i=>i.q?`${i.n} ×${i.q}`:'—');
          L.forEach((s,i)=>{const cx=b.x+40+(i%2)*270,cy=b.y+40+Math.floor(i/2)*60;t21(x,'* '+s,cx+22,cy,{size:19,w:700,al:'left',col:(S.st==='item'&&!S.items[i].q)?'#555':'#fff'});if(i===S.sub)heart16(x,cx,cy,7,'#ff2a3d')});
          t21(x,S.st==='act'?'X volta · Analisar revela a fraqueza':'X volta',b.x+b.w-12,b.y+b.h-14,{size:12,al:'right',col:'#888'})}
        else if(S.st==='fight'||S.st==='hit'){const fx0=b.x+30,fw=b.w-60,fy=b.y+40,fh=70;x.fillStyle='#111';x.fillRect(fx0,fy,fw,fh);
          for(let i=0;i<20;i++){const k=1-Math.abs(i/19-.5)*2;x.fillStyle=`rgb(${40+k*60|0},${80+k*120|0},${40+k*40|0})`;x.fillRect(fx0+i*fw/20,fy+fh/2-k*28,fw/20-2,k*56+4)}
          x.strokeStyle='#ffe14a';x.lineWidth=2;x.strokeRect(fx0+fw*.465,fy,fw*.07,fh);
          const cx=fx0+fw*S.bar;x.fillStyle=S.barOn?'#fff':'#ffe14a';x.fillRect(cx-4,fy-6,8,fh+12);
          t21(x,'Aperte Z, Espaço ou toque no centro dourado',300,b.y+b.h-18,{size:13,col:'#aaa'})}}
      /* status */
      t21(x,me.n.slice(0,12),40,352,{size:15,w:800,al:'left'});t21(x,'VT',190,352,{size:13,w:800});x.fillStyle='#600';x.fillRect(206,345,110,14);x.fillStyle='#ffe14a';x.fillRect(206,345,110*S.hp/VMAX,14);t21(x,`${S.hp} / ${VMAX}`,324,352,{size:14,w:700,al:'left'});
      t21(x,'🧠',418,352,{size:13});x.fillStyle='#302040';x.fillRect(432,345,100,14);x.fillStyle=S.luc<30?'#ff7ac8':'#c58bff';x.fillRect(432,345,S.luc,14);
      if(S.st==='dodge'){const sm=A.soul.mode;t21(x,sm==='blue'?'💙 Alma Azul: W/↑ pula':sm==='green'?'💚 Alma Verde: setas viram o escudo':'❤ Alma Vermelha',300,375,{size:13,col:sm==='blue'?'#6a9bff':sm==='green'?'#5fe08a':'#ff8a95'})}
      /* botões */
      BTN.forEach(([bx,l,ic],i)=>{const on=(S.st==='menu'||S.st==='act'||S.st==='item')&&S.sel===i;x.strokeStyle=on?'#ffe14a':'#ff9b2f';x.lineWidth=3;x.strokeRect(bx,394,120,44);
        if(on&&S.st==='menu')heart16(x,bx+18,416,7,'#ff2a3d');else t21(x,ic,bx+20,416,{size:15});t21(x,l,bx+72,417,{size:18,w:800,col:on?'#ffe14a':(i===3&&spareable()?'#ffe14a':'#ff9b2f')})});
    }
  };
}

/* ---------- ⚔ PvP assimétrico: Arquiteto × Alma ---------- */
function juPvp49(C){
  const W=600,H=450,o=C.room.opt||{},RD=+o.rd||6,PL=C.players,ME=Math.max(0,PL.findIndex(p=>p.u===C.me)),OP=1-ME,opp=PL[OP]||{n:'?',c:0,u:'?'};
  const VT=40,K=window.__juT||1,T_TR=1.5*K,T_DG=12*K,T_CT=3.5*K,T_R=T_TR+T_DG+T_CT;
  const S={hp:[VT,VT],dealt:[0,0],en:35,r:-1,ph:'',bar:0,barOn:false,ctDone:false,ghost:{x:300,y:245,mode:'red',sh:0},cards:[],done:false,hits:0,dmgN:'',dmgT:0,lastSend:0,soulMode:[],ended:false};
  const A=juArena49(C);A.setMode('red',true);
  const alma=r=>r%2;/* índice de quem é Alma na rodada r */
  const iAmAlma=()=>alma(S.r)===ME;
  function playCard(i){if(S.ph!=='dg'||iAmAlma())return;const c=JUCARD49[i];if(!c||S.en<c.c){fx5('error');return}S.en-=c.c;const seed=(Math.random()*1e9)>>>0;spawn(c,seed);C.send('jc',{i,s:seed,r:S.r});fx5('confirm')}
  function spawn(c,seed){const md=JUSOUL49(c.k);if(md!==A.soul.mode||md!=='red'){S.soulMode.push({m:md,t:c.d});A.setMode(md)}A.start(c.k,c.d+.5,1,seed);S.cards.push({n:c.n,t:performance.now()})}
  function hit(c){if(!iAmAlma()||S.ph!=='dg'||S.done)return;if(c==='block')return;if(c==='p'){S.hp[ME]=Math.max(0,S.hp[ME]-1);}else{S.hp[ME]=Math.max(0,S.hp[ME]-4);A.inv=.9;S.hits++}fx5('error');C.fx?.shake(3,.2);sendHp()}
  function sendHp(){C.send('jh',{hp:S.hp[ME]});check()}
  function strike(){if(!S.barOn)return;S.barOn=false;const off=Math.abs(S.bar-.5);let d=S.bar>=1?0:Math.max(1,Math.round(9*(1-off*1.7)));if(off<.035)d*=2;
    S.dealt[ME]+=d;S.dmgN=d?String(d):'ERROU';S.dmgT=performance.now();fx5(d?'bb5':'error');C.send('jd',{d,r:S.r});if(d){}}
  function check(){if(!C.host||S.ended)return;if(S.hp[0]<=0||S.hp[1]<=0)end()}
  function end(){if(S.ended)return;S.ended=true;setTimeout(()=>{const rows=PL.slice(0,2).map((p,i)=>({u:p.u,n:p.n,c:p.c,s:S.hp[i]*10+S.dealt[i]*5,w:false}));const a=S.hp[0],b=S.hp[1];
      if(a!==b){rows[a>b?0:1].w=true}const wn=rows.find(r=>r.w);
      C.finish({title:wn?`⚖ ${wn.n} venceu o Duelo de Almas`:'⚖ Empate no Duelo de Almas',rows:rows.sort((x,y)=>y.s-x.s),unit:'pts',html:`<ul class="r38-l">${PL.slice(0,2).map((p,i)=>`<li>${esc(p.n)}: ❤ <b>${S.hp[i]}</b> · golpes dados <b>${S.dealt[i]}</b></li>`).join('')}</ul>`})},window.__juFast?0:900)}
  return{st:()=>S,arena:A,playCard,strike,
    reward:()=>{const won=S.hp[ME]>S.hp[OP];return{ob:won?14:5,xp:won?8:3,why:won?'duelo vencido':'duelo'}},
    msg(p){if(p.from!==opp.u)return;
      if(p.t==='jc'&&p.r===S.r&&iAmAlma()){const c=JUCARD49[p.i|0];if(c)spawn(c,p.s>>>0)}
      if(p.t==='jp'){S.ghost={x:+p.x||300,y:+p.y||245,mode:p.m||'red',sh:p.sh|0}}
      if(p.t==='jh'){S.hp[OP]=clamp12(+p.hp,0,VT);check()}
      if(p.t==='jd'&&!iAmAlma()){S.hp[ME]=Math.max(0,S.hp[ME]-(p.d|0));S.dmgN=p.d?String(p.d):'ERROU';S.dmgT=performance.now();if(p.d)C.fx?.shake(4,.2);sendHp()}},
    left(u){if(u===opp.u&&!S.ended){S.hp[OP]=0;if(C.host)end()}},
    key(code,down){if(Date.now()<C.t0)return;
      if(iAmAlma()&&S.ph==='dg'){A.key(code,down);return}A.key(code,false);if(!down)return;
      const m=code.match(/^Digit([1-7])$/);if(m)playCard(+m[1]-1);
      if(S.ph==='ct'&&iAmAlma()&&(code==='KeyZ'||code==='Space'||code==='Enter'))strike()},
    ptr(t,px,py){if(Date.now()<C.t0)return;if(iAmAlma()&&S.ph==='dg'){A.ptr(t,px,py);return}if(t!=='down')return;
      if(S.ph==='ct'&&iAmAlma()){strike();return}
      if(!iAmAlma()&&py>376){const i=Math.floor((px-6)/84);if(i>=0&&i<7)playCard(i)}},
    step(dt){const el=(Date.now()-C.t0)/1000;if(el<0||S.ended)return;
      const r=Math.floor(el/T_R),in_=el-r*T_R;
      if(r>=RD){if(C.host)end();return}
      if(r!==S.r){S.r=r;S.en=35;A.clear();A.setMode('red',true);S.soulMode=[];S.ctDone=false;C.fx?.float(300,120,iAmAlma()?'Você é a ALMA ❤':'Você é o ARQUITETO ⚖',{col:'#ffe14a',size:24,life:1.4})}
      const ph=in_<T_TR?'tr':in_<T_TR+T_DG?'dg':'ct';
      if(ph!==S.ph){S.ph=ph;if(ph==='ct'){A.clear();if(iAmAlma()){S.bar=0;S.barOn=true}}if(ph==='dg')A.setMode('red')}
      if(ph==='dg'){if(!iAmAlma())S.en=Math.min(100,S.en+14*dt);
        S.soulMode.forEach(q=>q.t-=dt);if(S.soulMode.length&&S.soulMode[0].t<=0){S.soulMode.shift();A.setMode(S.soulMode.length?S.soulMode[S.soulMode.length-1].m:'red')}
        A.step(dt,false,iAmAlma()?hit:null);
        if(iAmAlma()){const n=performance.now();if(n-S.lastSend>80){S.lastSend=n;C.send('jp',{x:Math.round(A.soul.x),y:Math.round(A.soul.y),m:A.soul.mode,sh:A.soul.sh})}}
        else{A.soul.x=S.ghost.x;A.soul.y=S.ghost.y;A.soul.sh=S.ghost.sh}}
      if(ph==='ct'&&S.barOn){S.bar+=dt/(.95*K);if(S.bar>=1){S.bar=1;strike()}}
      const role=iAmAlma()?'❤ ALMA: desvie!':'⚖ ARQUITETO: lance cartas!';
      C.hud(`⚖ Rodada <b>${Math.min(RD,r+1)}</b>/${RD} · ${role} · você ❤ ${S.hp[ME]} · ${esc(opp.n)} ❤ ${S.hp[OP]}${!iAmAlma()?` · ⚡ ${Math.floor(S.en)}`:''}`)},
    draw(x){const now=performance.now();x.fillStyle='#000';x.fillRect(0,0,W,H);
      const bar=(i,X,lbl)=>{t21(x,lbl,X,22,{size:14,w:800,al:i?'right':'left',col:mgCol(PL[i]?.c??0)});x.fillStyle='#600';x.fillRect(i?X-150:X,34,150,10);x.fillStyle='#ffe14a';x.fillRect(i?X-150*S.hp[i]/VT:X,34,150*S.hp[i]/VT,10)};
      bar(0,16,`${PL[0]?.n||'?'} ❤ ${S.hp[0]}`);bar(1,W-16,`❤ ${S.hp[1]} ${PL[1]?.n||'?'}`);
      const al=S.r>=0?PL[alma(S.r)]:null;
      t21(x,S.ph==='tr'?`Rodada ${S.r+1}: ${al?.n||'?'} é a Alma`:S.ph==='ct'?`Contra-ataque de ${al?.n||'?'}!`:`Rodada ${S.r+1}/${RD}`,W/2,72,{size:S.ph==='tr'?24:16,w:900,col:'#ffe14a'});
      if(S.ph==='dg'){A.draw(x,!iAmAlma(),null);const k=S.cards.filter(c=>now-c.t<1500);k.forEach((c,i)=>t21(x,`⚖ ${c.n}`,W/2,108+i*18,{size:13,col:'#ffb3c0'}))}
      if(S.ph==='ct'){const fx0=60,fw=480,fy=190,fh=60;x.fillStyle='#111';x.fillRect(fx0,fy,fw,fh);x.strokeStyle='#ffe14a';x.lineWidth=2;x.strokeRect(fx0+fw*.465,fy,fw*.07,fh);x.fillStyle=S.barOn?'#fff':'#ffe14a';x.fillRect(fx0+fw*S.bar-4,fy-6,8,fh+12);
        t21(x,iAmAlma()?'Z, Espaço ou toque: golpeie no centro!':`${al?.n||'?'} está contra-atacando…`,W/2,280,{size:14,col:'#ccc'})}
      if(now-S.dmgT<1100)t21(x,S.dmgN,W/2,150-(now-S.dmgT)/40,{size:28,w:900,col:'#ff4a5a',stroke:4});
      if(!iAmAlma()&&S.ph!=='ct'){x.fillStyle='#302040';x.fillRect(6,356,588,10);x.fillStyle='#ffe14a';x.fillRect(6,356,588*S.en/100,10);t21(x,`⚡ Energia ${Math.floor(S.en)}`,10,346,{size:12,al:'left',col:'#ffe14a'});
        JUCARD49.forEach((c,i)=>{const bx=6+i*84,ok=S.en>=c.c&&S.ph==='dg';rr21(x,bx,378,80,64,8);x.fillStyle=ok?'#2f2442':'#1a1424';x.fill();x.strokeStyle=ok?'#ffe14a':'#444';x.lineWidth=2;x.stroke();
          t21(x,`${i+1}`,bx+10,392,{size:11,col:'#888'});t21(x,c.n,bx+40,406,{size:12,w:800,col:ok?'#fff':'#666'});t21(x,`⚡${c.c}`,bx+40,428,{size:12,col:ok?'#ffe14a':'#555'})})}
      else if(iAmAlma()&&S.ph==='dg'){const sm=A.soul.mode;t21(x,sm==='blue'?'💙 Alma Azul: W/↑ pula':sm==='green'?'💚 Alma Verde: setas viram o escudo':'❤ Desvie! Branco desvia · AZUL parado · LARANJA mexendo',W/2,400,{size:14,col:'#ddd'})}}
  };
}
Object.assign(ACH,{
  ju_paz:{ico:'🕊',n:'Rota Pacifista',d:'Poupe o Cultista, a Tulpa da Natureza e a Sombra no Julgamento.'},
  ju_luta:{ico:'⚔',n:'Rota da Lâmina',d:'Derrote os três chefes do Julgamento lutando.'},
  ju_juiz:{ico:'⚖',n:'Absolvido',d:'Vença Perseus, o Juiz.'},
  ju_crit:{ico:'✦',n:'Mão Firme',d:'Acerte 3 críticos seguidos no LUTAR do Julgamento.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='ju49')return`<div>${b('KeyA','◀')}${b('KeyW','▲')}${b('KeyS','▼')}${b('KeyD','▶')}</div><div>${b('KeyZ','✓ Confirmar','wide')}${b('KeyX','✕','','Voltar')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('julgamento',{...GAMES12.julgamento,make:julgamento49,setup:juSetup49,pad:'ju49',
  desc:'Batalha por turnos no estilo Undertale: LUTAR, AGIR, ITEM e POUPAR contra 3 chefes (e um secreto), com Almas Vermelha, Azul e Verde. PvP: Arquiteto × Alma.',
  rule:'Vença lutando ou poupe o chefe descobrindo a fraqueza com AGIR. No PvP, quem termina com mais Vital vence.',
  keys:'Setas/WASD · Z, Enter ou Espaço confirmam · X volta',touch:'Toque nos botões e arraste o coração'});
T3.juArena=juArena49;T3.juSoul=JUSOUL49;T3.juPat=JUPAT49;
console.info('[Tulpa] Etapa 49 carregada (Julgamento 2.0)');

