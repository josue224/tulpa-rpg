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

/* ---------- 🎨 arte do DOOM (somente visual: não toca regras, RNG nem mapa) ---------- */
function dmArt48(){
  const G=window.GFX60,W=640,H=400,FOV=Math.PI/3,COLS=W/2,TAU=Math.PI*2,TS=128,LV=14,HZ=H/2;
  const poly=G.poly;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const TH=[
    {acc:'#ff6b8a',fog:'#10040c',lamp:'#ff7a5a',amb:'poeira',ac:'#e8b8c8'},
    {acc:'#ffd36b',fog:'#120c02',lamp:'#ffc860',amb:'brasas',ac:'#ffb347'},
    {acc:'#7dffa8',fog:'#03100a',lamp:'#8affb0',amb:'vagalumes',ac:'#baff8a'},
    {acc:'#c58bff',fog:'#0a0316',lamp:'#b48cff',amb:'motes',ac:'#c58bff'}];

  /* ===== texturas de parede ===== */
  const bricks=(g,r,col,mortar,rows,cols)=>{box(g,0,0,TS,TS,mortar);const h=TS/rows,w=TS/cols;
    for(let j=0;j<rows;j++)for(let i=-1;i<=cols;i++){const X=i*w+(j%2)*w/2+1.5,Y=j*h+1.5,c=G.shade(col,(r()-.5)*.3);box(g,X,Y,w-3,h-3,c,3);
      g.fillStyle='rgba(255,255,255,.16)';g.fillRect(X+2,Y+1,w-7,2);g.fillStyle='rgba(0,0,0,.32)';g.fillRect(X+2,Y+h-7,w-7,3)}
    for(let i=0;i<340;i++){g.fillStyle=r()<.6?'rgba(0,0,0,.24)':'rgba(255,240,230,.12)';g.fillRect(r()*TS,r()*TS,1+r()*2,1+r()*2)}};
  const crack=(g,r,X,Y,n,c)=>{const p=[[X,Y]];for(let i=0;i<n;i++){X+=(r()-.5)*16;Y+=5+r()*9;p.push([X,Y])}line(g,p,c,1.6);if(p[2])line(g,[p[2],[p[2][0]+12,p[2][1]+5],[p[2][0]+17,p[2][1]+15]],c,1)};
  const eyeMark=(g,X,Y,s,c)=>{g.strokeStyle=c;g.lineWidth=2.4;g.beginPath();g.moveTo(X-s,Y);g.quadraticCurveTo(X,Y-s*.8,X+s,Y);g.quadraticCurveTo(X,Y+s*.8,X-s,Y);g.stroke();disc(g,X,Y,s*.28,c);for(let i=-2;i<=2;i++)line(g,[[X+i*s*.36,Y-s*.62],[X+i*s*.5,Y-s*.95]],c,1.4)};
  const frameBars=(g,c)=>{g.fillStyle=c;g.fillRect(0,0,TS,7);g.fillRect(0,TS-9,TS,9);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(0,1,TS,1.5);g.fillRect(0,TS-8,TS,1.5);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,7,TS,3);g.fillRect(0,TS-12,TS,3)};
  const WALL=[
    [ /* Porão: pedra úmida · papel de parede descascado · tijolo vermelho */
      (g,r)=>{bricks(g,r,'#6e5676','#1c1220',4,2);crack(g,r,34,8,7,'rgba(10,0,8,.75)');eyeMark(g,88,52,17,'rgba(255,90,120,.75)');
        for(let i=0;i<6;i++){const X=r()*TS;g.fillStyle='rgba(10,20,20,.35)';g.fillRect(X,0,2+r()*4,20+r()*70)}},
      (g,r)=>{box(g,0,0,TS,TS,'#5a2f80');for(let i=0;i<8;i++){box(g,i*16,0,7,TS,'#6c3c96');line(g,[[i*16+11,0],[i*16+11,TS]],'#43205f',1.5)}
        for(let j=0;j<4;j++)for(let i=0;i<4;i++){const X=16+i*32+(j%2)*16,Y=16+j*30;poly(g,[[X,Y-7],[X+5,Y],[X,Y+7],[X-5,Y]],'rgba(220,160,255,.3)')}
        for(let i=0;i<3;i++){const X=14+r()*90,Y=10+r()*70;poly(g,[[X,Y],[X+24,Y+6],[X+17,Y+34],[X+5,Y+24]],'#2a1c22');poly(g,[[X,Y],[X+24,Y+6],[X+15,Y+13]],'#b08ac8')}
        for(let i=0;i<5;i++){let X=r()*TS,Y=TS;const p=[[X,Y]];for(let k=0;k<6;k++){X+=(r()-.5)*22;Y-=9+r()*10;p.push([X,Y])}line(g,p,'#c03a6a',2.2)}frameBars(g,'#3a1c30')},
      (g,r)=>{bricks(g,r,'#a4403a','#2a1010',6,3);crack(g,r,96,30,6,'rgba(20,0,0,.8)');box(g,22,30,26,34,'#1c0a0a',13);box(g,25,34,20,28,'#0c0404',10);
        box(g,32,47,6,13,'#e9dcb8',2);ell(g,35,43,3.4,5.5,'#ffb33a');ell(g,35,44,1.6,2.8,'#fff4c0');const q=g.createRadialGradient(35,44,0,35,44,34);q.addColorStop(0,'rgba(255,150,70,.5)');q.addColorStop(1,'rgba(255,150,70,0)');g.fillStyle=q;g.fillRect(1,10,68,68)}],
    [ /* Fé: cantaria com sol · vitral · nichos dourados */
      (g,r)=>{bricks(g,r,'#b0925e','#3a2a12',3,2);ring(g,64,64,22,'rgba(90,60,10,.8)',4);ring(g,64,64,22,'rgba(255,230,150,.55)',1.4);for(let i=0;i<12;i++){const a=i/12*TAU;line(g,[[64+Math.cos(a)*27,64+Math.sin(a)*27],[64+Math.cos(a)*38,64+Math.sin(a)*38]],'rgba(110,74,12,.85)',3)}poly(g,[[64,47],[69,59],[81,64],[69,69],[64,81],[59,69],[47,64],[59,59]],'#e8c060');frameBars(g,'#7a5c20')},
      (g,r)=>{bricks(g,r,'#8a7048','#2a1c0a',4,2);g.fillStyle='#2a1c08';g.beginPath();g.moveTo(30,112);g.lineTo(30,48);g.quadraticCurveTo(32,16,64,10);g.quadraticCurveTo(96,16,98,48);g.lineTo(98,112);g.closePath();g.fill();
        g.save();g.beginPath();g.moveTo(35,108);g.lineTo(35,50);g.quadraticCurveTo(37,22,64,16);g.quadraticCurveTo(91,22,93,50);g.lineTo(93,108);g.closePath();g.clip();
        const cs=['#ffd36b','#ff8a3a','#e0455a','#5ab0ff','#ffe9a0','#c870ff'];for(let j=0;j<7;j++)for(let i=0;i<4;i++){const X=35+i*15,Y=14+j*15;poly(g,[[X,Y],[X+15,Y+(i%2?6:-2)],[X+15,Y+17],[X,Y+13]],cs[(i+j*3)%6]);line(g,[[X,Y],[X+15,Y+(i%2?6:-2)],[X+15,Y+17]],'#2a1c08',2.4)}
        disc(g,64,48,13,'#fff3c0');ring(g,64,48,13,'#2a1c08',2.4);line(g,[[64,36],[64,108]],'#2a1c08',3);g.restore();frameBars(g,'#8a6a22')},
      (g,r)=>{bricks(g,r,'#8c6844','#241606',6,3);[[26,40],[102,40]].forEach(([X,Y])=>{box(g,X-15,Y-16,30,52,'#241403',15);box(g,X-3.5,Y+8,7,22,'#efe2bc',2);ell(g,X,Y+2,3.6,6.5,'#ffb33a');ell(g,X,Y+3,1.7,3,'#fff4c0');const q=g.createRadialGradient(X,Y+3,0,X,Y+3,34);q.addColorStop(0,'rgba(255,190,80,.55)');q.addColorStop(1,'rgba(255,190,80,0)');g.fillStyle=q;g.fillRect(X-34,Y-31,68,68)});
        poly(g,[[56,20],[72,20],[72,116],[64,104],[56,116]],'#a02a2a');g.fillStyle='#ffd36b';g.fillRect(62,40,4,26);g.fillRect(56,47,16,4);frameBars(g,'#6a4a18')}],
    [ /* Jardim: pedra musgosa · cipós e esporos · casca de árvore */
      (g,r)=>{bricks(g,r,'#547862','#0e2016',4,2);for(let i=0;i<190;i++){const X=r()*TS,Y=Math.pow(r(),2)*60;disc(g,X,Y,1+r()*3.4,G.mix('#2a6a34','#8ad060',r()))}for(let i=0;i<70;i++)disc(g,r()*TS,TS-Math.pow(r(),2)*34,1+r()*3,G.mix('#1a4a24','#5aa04a',r()))},
      (g,r)=>{bricks(g,r,'#3a6a52','#0a1a12',3,2);for(let i=0;i<6;i++){let X=8+i*22+r()*8,Y=0;const p=[[X,0]],len=50+r()*78;while(Y<len){Y+=9;X+=(r()-.5)*11;p.push([X,Y])}line(g,p,'#173a1c',4.5);line(g,p,'#4a9a4a',2);p.forEach(([u,v],k)=>{if(k%2)ell(g,u+(k%4===1?6:-6),v,6,3,G.mix('#2f8a3a','#a0e070',r()),k%4===1?.5:-.5)})}
        for(let i=0;i<7;i++){const X=10+r()*108,Y=14+r()*96,q=g.createRadialGradient(X,Y,0,X,Y,10);q.addColorStop(0,'rgba(220,255,160,.95)');q.addColorStop(.3,'rgba(120,255,150,.5)');q.addColorStop(1,'rgba(120,255,150,0)');g.fillStyle=q;g.fillRect(X-10,Y-10,20,20)}},
      (g,r)=>{box(g,0,0,TS,TS,'#3a2a14');for(let i=0;i<11;i++){let X=i*12+r()*6;const p=[[X,-4]];for(let y=12;y<=TS+8;y+=14){X+=(r()-.5)*9;p.push([X,y])}line(g,p,G.mix('#5a4422','#8a7a3a',r()),7+r()*4);line(g,p,'rgba(10,6,0,.6)',2)}
        ell(g,70,58,17,24,'#1a1006');ell(g,70,58,9,15,'#050200');disc(g,66,52,2.6,'#b8ff6a');disc(g,76,53,2.6,'#b8ff6a');for(let i=0;i<60;i++)disc(g,r()*TS,r()*TS,1+r()*2,'rgba(120,180,60,.55)')}],
    [ /* Núcleo: obsidiana com runas · cristais · carne do Véu */
      (g,r)=>{box(g,0,0,TS,TS,'#241446');for(let j=0;j<2;j++)for(let i=0;i<2;i++){const X=i*64+3,Y=j*64+3;box(g,X,Y,58,58,vg(g,Y,Y+58,'#4c3288','#22143e'),5);line(g,[[X+4,Y+3],[X+54,Y+3]],'rgba(220,200,255,.35)',1.5);
          const cx=X+29,cy=Y+29;ring(g,cx,cy,15,'rgba(197,139,255,.85)',2);let k=Math.floor(r()*6);const p=[];for(let s=0;s<5;s++){const a=k*TAU/6;p.push([cx+Math.cos(a)*15,cy+Math.sin(a)*15]);k+=2+Math.floor(r()*2)}line(g,p,'#e0c0ff',1.6)}},
      (g,r)=>{box(g,0,0,TS,TS,'#2a0e4a');for(let i=0;i<14;i++){const X=r()*TS,Y=20+r()*120,w=9+r()*15,h=34+r()*60,c=G.mix('#6a2ab0','#e070ff',r());
          poly(g,[[X-w,Y],[X-w*.5,Y-h*.72],[X,Y-h],[X,Y]],G.shade(c,.2));poly(g,[[X,Y-h],[X+w*.6,Y-h*.66],[X+w,Y],[X,Y]],G.shade(c,-.4));line(g,[[X,Y-h],[X,Y-6]],'rgba(255,230,255,.6)',1.2)}frameBars(g,'#2a1048')},
      (g,r)=>{box(g,0,0,TS,TS,'#4a1c58');for(let i=0;i<22;i++)ell(g,r()*TS,r()*TS,10+r()*18,8+r()*14,G.mix('#32104a','#7a3480',r()),r()*3);
        for(let i=0;i<7;i++){let X=r()*TS,Y=0;const p=[[X,0]];while(Y<TS){Y+=12;X+=(r()-.5)*24;p.push([X,Y])}line(g,p,'#d050c8',2.6);line(g,p,'#ffc0f0',.8)}
        [[38,42,13],[92,86,9]].forEach(([X,Y,s])=>{ell(g,X,Y,s*1.2,s*.85,'#f4e0f0');disc(g,X,Y,s*.55,'#a01a6a');ell(g,X,Y,s*.14,s*.5,'#10000a');disc(g,X-s*.2,Y-s*.25,s*.13,'#fff')})}]];
  const door=(col,dk)=>(g,r)=>{box(g,0,0,TS,TS,dk);for(let i=0;i<6;i++){const X=8+i*19;box(g,X,8,17,TS-8,vg(g,8,TS,G.shade(col,-.12),G.shade(col,-.52)));g.fillStyle='rgba(255,255,255,.22)';g.fillRect(X+1,8,2,TS)}
    [24,98].forEach(Y=>{box(g,4,Y,TS-8,11,'#2a2430');g.fillStyle='rgba(255,255,255,.3)';g.fillRect(4,Y+1,TS-8,2);for(let i=0;i<7;i++)disc(g,12+i*17,Y+5.5,3,G.shade(col,.35))});
    g.fillStyle=G.shade(col,.45);g.fillRect(0,0,6,TS);g.fillRect(TS-6,0,6,TS);g.fillRect(0,0,TS,7);
    disc(g,64,63,21,'#1a141c');disc(g,64,63,18,G.shade(col,.2));ring(g,64,63,18,G.shade(col,.65),2);G.icon(g,'cadeado',64,63,26,'#1a0e08')};
  function paintWall(g,th,type,r){
    g.save();g.beginPath();g.rect(0,0,TS,TS);g.clip();
    if(type===4)door('#e8b830','#3a2606')(g,r);else if(type===5)door('#4a9af0','#06203a')(g,r);
    else{WALL[th][type===6?0:type-1](g,r);
      if(type===6){/* parede secreta: a mesma pedra, mais clara e com uma fresta */g.fillStyle='rgba(255,255,255,.07)';g.fillRect(34,18,48,96);line(g,[[38,16],[36,48],[40,70],[37,114]],'rgba(0,0,0,.6)',1.8);line(g,[[40,17],[38,48],[42,70],[39,114]],'rgba(255,255,255,.35)',1);line(g,[[80,22],[82,58],[78,80],[81,112]],'rgba(255,255,255,.22)',1)}}
    const q=g.createLinearGradient(0,0,0,TS);q.addColorStop(0,'rgba(0,0,0,.38)');q.addColorStop(.16,'rgba(0,0,0,0)');q.addColorStop(.82,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=q;g.fillRect(0,0,TS,TS);
    g.restore()}
  /* atlas: a textura repetida em LV níveis de escuridão (um drawImage por coluna) */
  const atlas=(th,type)=>G.bake(`dm:wall:${th}:${type}`,TS,TS*LV,g=>{const t=G.bake(`dm:tex:${th}:${type}`,TS,TS,(c,w,h,r)=>paintWall(c,th,type,r));
    for(let i=0;i<LV;i++){g.drawImage(t,0,i*TS,TS,TS);g.fillStyle=G.rgba(TH[th].fog,i/(LV-1)*.9);g.fillRect(0,i*TS,TS,TS)}});

  /* ===== chão e teto (projeção real em baixa resolução) ===== */
  const FS=64;
  const FLOOR=[
    [(g,r)=>{G.fillTile(g,G.tile('madeira',{size:64,a:'#5a3430',b:'#1c0c0c',seed:4}),0,0,64,64);for(let i=0;i<14;i++)disc(g,r()*64,r()*64,.8,'#1a0a0a')},
     (g)=>{box(g,0,0,64,64,'#2c1420');g.fillStyle='#4a2434';g.fillRect(0,0,64,9);g.fillRect(0,32,64,4);g.fillStyle='#180a10';g.fillRect(0,9,64,3);g.fillStyle='#3a1c28';g.fillRect(28,12,8,52)}],
    [(g,r)=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++){box(g,i*32,j*32,32,32,(i+j)%2?'#8a744a':'#4e3c22');for(let k=0;k<30;k++){g.fillStyle='rgba(255,240,200,.14)';g.fillRect(i*32+r()*30,j*32+r()*30,2,1)}}g.strokeStyle='#d8a83c';g.lineWidth=1.5;g.strokeRect(.7,.7,62.6,62.6);line(g,[[0,32],[64,32]],'#d8a83c',1);line(g,[[32,0],[32,64]],'#d8a83c',1)},
     (g)=>{box(g,0,0,64,64,'#4a3414');ring(g,32,32,24,'#a87c28',4);ring(g,32,32,12,'#6a4c18',3);line(g,[[0,0],[64,64]],'#6a4c18',4);line(g,[[64,0],[0,64]],'#6a4c18',4);disc(g,32,32,5,'#ffd36b')}],
    [(g,r)=>{G.fillTile(g,G.tile('grama',{size:64,a:'#1c4426',b:'#6ab050',seed:5}),0,0,64,64);for(let i=0;i<5;i++)ell(g,r()*64,r()*64,5+r()*7,3+r()*5,'#4a3a22',r()*3)},
     (g,r)=>{box(g,0,0,64,64,'#06160c');for(let i=0;i<40;i++)ell(g,r()*64,r()*64,5+r()*6,3+r()*4,G.mix('#08200e','#1e4a26',r()),r()*3);for(let i=0;i<7;i++)disc(g,r()*64,r()*64,1,'#a8ffb0')}],
    [(g,r)=>{G.fillTile(g,G.tile('runa',{size:64,a:'#24123c',b:'#b080ff',seed:6}),0,0,64,64);g.strokeStyle='#5a3a90';g.lineWidth=2;g.strokeRect(1,1,62,62)},
     (g,r)=>{box(g,0,0,64,64,'#0c0420');for(let i=0;i<5;i++){const X=r()*64,Y=r()*64,q=g.createRadialGradient(X,Y,0,X,Y,22);q.addColorStop(0,'rgba(130,60,200,.45)');q.addColorStop(1,'rgba(130,60,200,0)');g.fillStyle=q;g.fillRect(0,0,64,64)}for(let i=0;i<26;i++){g.fillStyle=r()<.5?'#fff':'#c58bff';g.fillRect(r()*63,r()*63,1,1)}}]];
  const FLV=16,PX=new Map();
  function planes(th){
    let p=PX.get(th);if(p)return p;
    const fog=[1,3,5].map(i=>parseInt(TH[th].fog.substr(i,2),16));
    p=[0,1].map(k=>{const c=G.bake(`dm:plane:${th}:${k}`,FS,FS,(g,w,h,r)=>FLOOR[th][k](g,r)),d=c.getContext('2d').getImageData(0,0,FS,FS).data,out=[];
      for(let l=0;l<FLV;l++){const a=l/(FLV-1)*.94,u=new Uint32Array(FS*FS);for(let i=0;i<u.length;i++){const j=i*4;u[i]=(255<<24|((d[j+2]*(1-a)+fog[2]*a)|0)<<16|((d[j+1]*(1-a)+fog[1]*a)|0)<<8|((d[j]*(1-a)+fog[0]*a)|0))>>>0}out.push(u)}return out});
    PX.set(th,p);return p}
  let FB=null;
  function floorCast(x,S,th){
    const low=G.low(),bw=low?96:192,bh=low?56:100;
    if(!FB||FB.bw!==bw){const c=document.createElement('canvas');c.width=bw;c.height=bh*2;const g=c.getContext('2d'),im=g.createImageData(bw,bh*2);
      const tn=new Float32Array(bw);for(let i=0;i<bw;i++)tn[i]=Math.tan(-FOV/2+FOV*(i+.5)/bw);FB={c,g,im,u:new Uint32Array(im.data.buffer),bw,bh,tn}}
    const P=planes(th),u=FB.u,tn=FB.tn,ca=Math.cos(S.a),sa=Math.sin(S.a);
    for(let j=0;j<bh;j++){const pd=HZ/((j+.5)/bh*HZ),sh=Math.max(.06,1-pd/12),l=Math.min(FLV-1,Math.round((1-sh)*(FLV-1))),F=P[0][l],T=P[1][l],fo=(bh+j)*bw,ce=(bh-1-j)*bw;
      let wx=(S.x+pd*ca)*FS,wy=(S.y+pd*sa)*FS;const kx=-pd*sa*FS,ky=pd*ca*FS;
      for(let i=0;i<bw;i++){const t=tn[i],q=(((wy+ky*t)|0)&63)<<6|(((wx+kx*t)|0)&63);u[fo+i]=F[q];u[ce+i]=T[q]}}
    FB.g.putImageData(FB.im,0,0);x.drawImage(FB.c,0,0,W,H)}

  /* ===== Perseus corrompidos ===== */
  const SZ=160;
  const FOE={per:{mul:'#ff5a7a',eye:'#fff27a'},ati:{mul:'#9a6aff',eye:'#7fffff'},tan:{mul:'#7a98a8',eye:'#ff8a3a'},boss:{mul:'#c8782a',eye:'#ff2a3a'}};
  function foeSprite(k,fr){
    const ok=SPR.ok?1:0;
    return G.bake(`dm:foe:${k}:${fr}:${ok}`,SZ,SZ,g=>{
      const F=FOE[k],S0=k==='boss'?128:k==='per'?134:130,ox=(SZ-S0)/2,oy=SZ-S0*.99-(k==='ati'?6:0),P=(u,v)=>[ox+u*S0,oy+v*S0],b=fr?1:0;
      const au=g.createRadialGradient(80,96,10,80,96,78);au.addColorStop(0,G.rgba(F.mul,.42));au.addColorStop(1,G.rgba(F.mul,0));g.fillStyle=au;g.fillRect(0,0,SZ,SZ);
      if(k==='ati'){poly(g,[[34,66],[80,30],[126,66],[146,154],[118,140],[100,157],[80,143],[60,157],[42,140],[14,154]],'#24103c');poly(g,[[80,30],[126,66],[146,154],[118,140],[100,157],[80,120]],'#160828')}
      if(k==='boss'){poly(g,[[30,58],[4,150],[34,136],[52,157],[80,140],[108,157],[126,136],[156,150],[130,58]],'#5a0a1a');poly(g,[[80,60],[130,58],[156,150],[126,136],[108,157],[80,140]],'#3a040e');
        [[-1,P(.16,.22)],[1,P(.66,.2)]].forEach(([s,[X,Y]])=>{g.fillStyle='#e8d0a0';g.beginPath();g.moveTo(X,Y+10);g.quadraticCurveTo(X+s*38,Y-2,X+s*30,Y-34);g.quadraticCurveTo(X+s*22,Y-12,X-s*8,Y-6);g.fill();line(g,[[X+s*8,Y-2],[X+s*24,Y-10]],'#8a6a40',2)})}
      /* corpo */
      const body=G.bake(`dm:cat:${k}:${ok}`,128,128,c=>{
        if(SPR.ok){c.drawImage(SPR.img,0,0,128,128);c.globalCompositeOperation='multiply';c.fillStyle=F.mul;c.fillRect(0,0,128,128);c.globalCompositeOperation='destination-in';c.drawImage(SPR.img,0,0,128,128)}
        else{ell(c,60,78,52,48,'#12060a');poly(c,[[12,62],[22,18],[50,36]],'#12060a');poly(c,[[60,36],[88,18],[104,62]],'#12060a');ell(c,60,78,47,43,F.mul);poly(c,[[17,58],[25,26],[46,40]],F.mul);poly(c,[[66,40],[86,26],[99,58]],F.mul)}
        c.globalCompositeOperation='source-atop';const q=c.createLinearGradient(0,10,128,128);q.addColorStop(0,'rgba(255,255,255,.14)');q.addColorStop(.5,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=q;c.fillRect(0,0,128,128)},{s:2});
      g.drawImage(body,ox,oy+(b?1.5:0),S0,S0-(b?1.5:0));
      /* olhos em brasa, boca rasgada */
      [[.285,.415,-1],[.585,.408,1]].forEach(([u,v,s])=>{const[X,Y]=P(u,v);ell(g,X,Y,10,7.5,'#12040a',s*.35);const q=g.createRadialGradient(X,Y,0,X,Y,15);q.addColorStop(0,G.rgba(F.eye,.9));q.addColorStop(1,G.rgba(F.eye,0));g.fillStyle=q;g.fillRect(X-15,Y-15,30,30);ell(g,X,Y,7,4.6,F.eye,s*.35);ell(g,X,Y,1.5,4,'#12040a');line(g,[[X-s*10,Y-10-(b?1:0)],[X+s*10,Y-6]],'#12040a',3.5)});
      const[mx,my]=P(.43,.52),mw=S0*.19,mh=(k==='boss'?17:12)+(b?5:0);
      g.fillStyle='#1a0206';g.beginPath();g.moveTo(mx-mw,my-3);g.quadraticCurveTo(mx,my+mh*1.9,mx+mw,my-3);g.quadraticCurveTo(mx,my+5,mx-mw,my-3);g.fill();
      for(let i=-3;i<=3;i++){const X=mx+i*mw/3.8,Y=my+(1-i*i/12)*3;poly(g,[[X-3,Y-1],[X+3,Y-1],[X,Y+6+(i%2?0:3)]],'#fff6e0')}
      if(k==='per'){[[-1,P(.06,.66)],[1,P(.82,.66)]].forEach(([s,[X,Y]])=>{const dy=(s<0)===!b?-7:3;for(let i=0;i<3;i++){g.fillStyle='#f4ead6';g.beginPath();g.moveTo(X+i*s*6-3,Y+dy);g.quadraticCurveTo(X+i*s*9+s*10,Y+dy+8,X+i*s*8+s*4,Y+dy+22);g.quadraticCurveTo(X+i*s*7,Y+dy+9,X+i*s*6+3,Y+dy+2);g.fill()}});
        [[.2,.2,-1],[.62,.18,1]].forEach(([u,v,s])=>{const[X,Y]=P(u,v);poly(g,[[X-7,Y+7],[X+s*14,Y-17],[X+8,Y+4]],'#3a0612')});for(let i=0;i<4;i++){const[X,Y]=P(.14+i*.2,.76);line(g,[[X,Y],[X+9,Y+12]],'rgba(70,0,18,.85)',2.4)}}
      else if(k==='ati'){g.fillStyle='#32174e';g.beginPath();g.moveTo(24,90);g.quadraticCurveTo(26,24,80,14);g.quadraticCurveTo(134,24,136,90);g.quadraticCurveTo(116,46,80,44);g.quadraticCurveTo(44,46,24,90);g.fill();
        line(g,[[28,80],[42,42],[80,22],[118,42],[132,80]],'#c58bff',2.4);disc(g,80,31,6.5,'#7fffff');disc(g,78,29,2.2,'#fff');
        [[22,106],[138,106]].forEach(([X,Y],i)=>{const y=Y+((i===0)!==!!b?-6:4),q=g.createRadialGradient(X,y,0,X,y,22);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(.3,'rgba(190,120,255,.8)');q.addColorStop(1,'rgba(150,80,255,0)');g.fillStyle=q;g.fillRect(X-22,y-22,44,44);ring(g,X,y,13,'rgba(220,190,255,.8)',1.4)})}
      else if(k==='tan'){const plate=(pts,c1,c2)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle=vg(g,pts[0][1]-6,pts[0][1]+42,c1,c2);g.fill();g.strokeStyle='#0c1418';g.lineWidth=2.6;g.stroke()};
        plate([[30,50],[60,28],[102,28],[130,48],[104,56],[80,47],[56,56]],'#aac0cc','#3a525e');poly(g,[[74,28],[80,6],[86,28]],'#d8e8f0');
        plate([[10,88],[38,76],[46,108],[22,122]],'#8aa2b0','#2c424e');plate([[150,88],[122,76],[114,108],[138,122]],'#7a929e','#243842');
        plate([[44,114],[116,114],[108,150],[80,158],[52,150]],'#93aab8','#2a404c');disc(g,80,132,12,'#12181c');disc(g,80,132,8,'#ff8a3a');disc(g,78,130,3,'#ffe0a0');
        [[20,94],[140,94],[54,121],[106,121],[44,45],[116,45]].forEach(([X,Y])=>{disc(g,X,Y,3,'#12181c');disc(g,X-.6,Y-.8,1.8,'#d8e8f0')})}
      else{const[X,Y]=P(.43,.16);poly(g,[[X-34,Y+12],[X-38,Y-20],[X-20,Y-3],[X-8,Y-28],[X+6,Y-5],[X+20,Y-27],[X+27,Y-1],[X+40,Y-18],[X+34,Y+13]],'#ffc830');poly(g,[[X-34,Y+12],[X+34,Y+13],[X+33,Y+4],[X-34,Y+3]],'#a87010');
        [[-20,8,'#e0304a'],[0,8,'#7fe3ff'],[20,8,'#e0304a']].forEach(([u,v,c])=>{disc(g,X+u,Y+v,4,c);disc(g,X+u-1,Y+v-1,1.4,'#fff')});
        [[30,118],[130,118]].forEach(([u,v])=>{ell(g,u,v+(b?3:-3),17,14,'#2a0a06');ell(g,u,v+(b?3:-3),13,10,'#8a3a10');for(let i=-1;i<2;i++)poly(g,[[u+i*9-3,v+8],[u+i*9+3,v+8],[u+i*9,v+22]],'#ffe0a0')});
        ring(g,80,138,13,'#ffc830',4);disc(g,80,138,7,'#e0304a')}
    });
  }
  /* ===== projéteis, itens e portal ===== */
  const orb=k=>{const c={w:['#ff4a7a','#ffd0dc'],p:['#a050ff','#e8ccff'],h:['#ff6a1a','#ffe0a0'],r:['#ffb020','#fffbe0']}[k];
    return G.bake('dm:orb:'+k,96,96,g=>{const q=g.createRadialGradient(48,48,2,48,48,47);q.addColorStop(0,'#fff');q.addColorStop(.2,c[1]);q.addColorStop(.42,c[0]);q.addColorStop(.55,G.rgba(c[0],.4));q.addColorStop(1,G.rgba(c[0],0));g.fillStyle=q;g.fillRect(0,0,96,96);
      if(k==='p'){disc(g,41,45,4.5,'#1a0030');disc(g,55,45,4.5,'#1a0030');poly(g,[[43,56],[48,60],[53,56],[48,64]],'#1a0030')}
      else if(k==='h'||k==='r'){for(let i=0;i<10;i++){const a=i/10*TAU;poly(g,[[48+Math.cos(a-.18)*20,48+Math.sin(a-.18)*20],[48+Math.cos(a)*40,48+Math.sin(a)*40],[48+Math.cos(a+.18)*20,48+Math.sin(a+.18)*20]],G.rgba(c[0],.85))}disc(g,48,48,12,c[1]);disc(g,45,45,5,'#fff')}
      else{ring(g,48,48,19,'rgba(255,255,255,.75)',2);disc(g,48,48,8,'#fff')}})};
  const ITEMC={vit:'#ff5a6a',arm:'#7dffa8',luc:'#c58bff',luz:'#fff1a8',ess:'#ff9b3d',sol:'#ffd36b',w3:'#ff9b3d',w4:'#ffd36b',key4:'#ffd36b',key5:'#7fc8ff'};
  const item=k=>G.bake('dm:item:'+k,64,64,g=>{const c=ITEMC[k]||'#ffffff';
    if(k==='vit'){box(g,25,8,14,10,'#8a6a4a',2);box(g,27,16,10,10,'#d8e8f0');g.fillStyle='#e8f4ff';g.beginPath();g.arc(32,43,20,0,TAU);g.fill();g.fillStyle='#d8203a';g.beginPath();g.arc(32,43,17,-.15,Math.PI+.15);g.fill();G.icon(g,'coracao',32,44,19,'#fff');line(g,[[20,36],[24,29]],'#fff',3)}
    else if(k==='arm'){G.icon(g,'escudo',32,34,56,'#0c3a24');G.icon(g,'escudo',32,33,48,'#3ac078');G.icon(g,'escudo',32,33,34,'#9fffc8');G.icon(g,'estrela',32,31,18,'#0c3a24')}
    else if(k==='luc'){poly(g,[[32,4],[52,26],[32,60],[12,26]],'#7a3ac8');poly(g,[[32,4],[52,26],[32,30]],'#c58bff');poly(g,[[32,4],[12,26],[32,30]],'#e8ccff');ell(g,32,31,13,8,'#fff');disc(g,32,31,5.5,'#4a1090');disc(g,30,29,1.8,'#fff')}
    else if(k==='luz'||k==='ess'||k==='sol'){const dk={luz:'#5a5018',ess:'#6a2c08',sol:'#6a4a04'}[k];
      for(let i=0;i<3;i++){const X=16+i*13;if(k==='sol'){disc(g,X+3,22,7.5,'#ffd36b');disc(g,X+1,20,3,'#fff6d0')}else{box(g,X,14,7,18,k==='ess'?'#d8402a':'#fff1a8',k==='ess'?1:3.5);g.fillStyle='#d8a83c';g.fillRect(X,27,7,6)}}
      box(g,9,28,46,28,vg(g,28,56,G.shade(c,-.15),dk),4);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(11,30,42,2);box(g,19,37,26,13,'#160e08',3);G.icon(g,k==='luz'?'raio':k==='ess'?'chama':'sol',32,43.5,13,c)}
    else if(k==='w3'){box(g,6,22,40,8,'#8a98a8',3);box(g,6,32,40,8,'#6a7888',3);poly(g,[[40,20],[60,24],[58,48],[46,42],[40,40]],'#7a4a22');box(g,22,38,14,10,'#5a3418',2);disc(g,8,26,3,'#ff9b3d');disc(g,8,36,3,'#ff9b3d')}
    else if(k==='w4'){box(g,10,20,34,24,'#8a6a18',5);box(g,40,24,20,16,'#4a3410',3);disc(g,12,32,15,'#d8a83c');disc(g,12,32,9,'#fff3c0');box(g,28,43,12,13,'#5a3418',2);for(let i=0;i<3;i++){g.fillStyle='#ffe9a0';g.fillRect(24+i*7,20,3,24)}}
    else{g.save();g.translate(32,32);g.rotate(-.7);G.icon(g,'chave',0,0,52,'#1a1008');G.icon(g,'chave',0,-1,46,c);g.restore();disc(g,20,18,2.4,'#fff')}
  },{s:2});
  const gate=sealed=>G.bake('dm:gate:'+(sealed?1:0),128,128,g=>{const c=sealed?'#8a8a9a':'#c58bff';
    for(let i=0;i<3;i++){const R=58-i*15;g.strokeStyle=G.rgba(c,.95-i*.2);g.lineWidth=7-i*1.5;for(let k=0;k<3;k++){g.beginPath();g.arc(64,64,R,k*TAU/3+i*.7,k*TAU/3+i*.7+1.5);g.stroke()}}
    for(let i=0;i<8;i++){const a=i/8*TAU;poly(g,[[64+Math.cos(a)*62,64+Math.sin(a)*62],[64+Math.cos(a+.12)*50,64+Math.sin(a+.12)*50],[64+Math.cos(a-.12)*50,64+Math.sin(a-.12)*50]],c)}},{s:2});
  const ped=()=>G.bake('dm:arch',160,170,g=>{box(g,10,30,18,134,vg(g,30,164,'#6a5a7a','#2a2036'),3);box(g,132,30,18,134,vg(g,30,164,'#6a5a7a','#2a2036'),3);
    g.strokeStyle='#4a3c5a';g.lineWidth=18;g.beginPath();g.arc(80,48,61,Math.PI,0);g.stroke();g.strokeStyle='#8a78a0';g.lineWidth=2;g.beginPath();g.arc(80,48,69,Math.PI,0);g.stroke();
    box(g,2,156,34,12,'#3a2e48',2);box(g,124,156,34,12,'#3a2e48',2);[[19,60],[19,100],[141,60],[141,100]].forEach(([X,Y])=>disc(g,X,Y,4,'#c58bff'));disc(g,80,-1+13,7,'#ffd36b')});

  /* ===== armas em 1ª pessoa ===== */
  const paw=(g,X,Y,s,flip)=>{g.save();g.translate(X,Y);g.scale(flip?-s:s,s);ell(g,0,30,30,38,'#12202e',-.25);ell(g,0,30,26,34,'#a8c8ee',-.25);ell(g,-3,6,22,17,'#12202e');ell(g,-3,6,19,14,'#b8d8ff');for(let i=0;i<4;i++){ell(g,-17+i*10,-4+Math.abs(i-1.5)*3,6,7.5,'#12202e');ell(g,-17+i*10,-4+Math.abs(i-1.5)*3,4,5.5,'#cfe4ff')}g.restore()};
  const gun=w=>G.bake('dm:gun:'+w,240,200,g=>{const m=(y0,y1,a,b)=>vg(g,y0,y1,a,b);
    if(w===0){poly(g,[[120,4],[142,40],[134,132],[106,132],[98,40]],'#2a1050');poly(g,[[120,10],[137,42],[130,128],[120,128]],'#8a5ae0');poly(g,[[120,10],[103,42],[110,128],[120,128]],'#d8c0ff');line(g,[[120,22],[120,122]],'#fff',2.4);
      for(let i=0;i<4;i++)disc(g,120,46+i*22,3.4,'#7fffff');poly(g,[[72,130],[96,124],[120,134],[144,124],[168,130],[146,146],[94,146]],'#d8a83c');line(g,[[78,132],[120,138],[162,132]],'#fff0b0',2);disc(g,120,140,9,'#e0455a');disc(g,117,137,3,'#fff');box(g,111,146,18,42,m(146,188,'#5a3478','#24123a'),4);for(let i=0;i<5;i++)line(g,[[111,152+i*8],[129,158+i*8]],'#c8a0ff',1.6);disc(g,120,192,8,'#d8a83c');paw(g,134,150,1.05,true)}
    else if(w===1){paw(g,82,150,1.05,false);poly(g,[[96,200],[102,112],[138,112],[148,200]],m(112,200,'#4a3050','#1a0e20'));poly(g,[[92,114],[100,54],[140,54],[148,114]],m(54,114,'#e8d8a0','#8a6a2a'));poly(g,[[120,54],[140,54],[148,114],[120,114]],'rgba(0,0,0,.22)');
      box(g,104,40,32,18,'#3a2440',4);disc(g,120,42,15,'#1a0e20');disc(g,120,42,11,'#fff1a8');disc(g,116,38,4.5,'#fff');for(let i=0;i<3;i++){box(g,104,68+i*13,32,6,'#2a1a30',3);box(g,108,69.5+i*13,24,3,'#fff1a8',1.5)}poly(g,[[116,28],[124,28],[120,16]],'#d8a83c');paw(g,156,160,1,true)}
    else if(w===2){paw(g,62,152,1.1,false);poly(g,[[70,200],[88,132],[152,132],[170,200]],m(132,200,'#8a5028','#3a1c0a'));[[76,0],[124,1]].forEach(([X,k])=>{poly(g,[[X,140],[X+6,40],[X+34,40],[X+40,140]],m(40,140,'#b8c4d0','#3a4450'));poly(g,[[X+22,40],[X+34,40],[X+40,140],[X+24,140]],'rgba(0,0,0,.3)');ell(g,X+20,40,16,8,'#0c0c10');ell(g,X+20,40,11,5,'#ff9b3d');for(let i=0;i<3;i++){g.fillStyle='#d8a83c';g.fillRect(X+3-i*1.4,62+i*28,35+i*2.4,6)}});
      box(g,100,102,40,46,'#2a1810',8);disc(g,120,124,13,'#ff9b3d');disc(g,116,120,5,'#ffe0a0');ring(g,120,124,13,'#d8a83c',3);paw(g,178,166,1,true)}
    else{paw(g,48,160,1.15,false);poly(g,[[56,200],[72,96],[168,96],[184,200]],m(96,200,'#c89a30','#4a3004'));poly(g,[[120,96],[168,96],[184,200],[120,200]],'rgba(0,0,0,.2)');
      ell(g,120,80,52,38,'#3a2806');ell(g,120,76,48,33,m(44,110,'#ffe9a0','#a87818'));ell(g,120,70,35,23,'#1a1002');const q=g.createRadialGradient(120,70,2,120,70,32);q.addColorStop(0,'#fff');q.addColorStop(.35,'#ffd36b');q.addColorStop(1,'rgba(255,120,0,0)');g.fillStyle=q;g.beginPath();g.ellipse(120,70,33,22,0,0,TAU);g.fill();
      for(let i=0;i<8;i++){const a=i/8*TAU+.2;disc(g,120+Math.cos(a)*44,76+Math.sin(a)*29,3.6,'#fff3c0')}[128,156,184].forEach(Y=>{box(g,72-(Y-128)*.2,Y,96+(Y-128)*.4,7,'#2a1c04',3);g.fillStyle='#ffd36b';g.fillRect(80-(Y-128)*.2,Y+2,80+(Y-128)*.4,2)});paw(g,196,174,1,true)}
  },{s:1.5});
  const WN=['#c58bff','#fff1a8','#ff9b3d','#ffd36b'],WI=['seta','raio','chama','sol'];

  /* ===== estado só visual ===== */
  const V={fl:-1,foes:new Map(),dead:[],hp:null,items:null,booms:new WeakSet(),fire:0,kills:0};
  let amb=null,ambK='';
  /* desenha um sprite coluna a coluna, agrupando os trechos visíveis (respeita o zbuffer) */
  function slice(x,zb,img,scx,top,w,h,pd){
    const left=scx-w/2,c0=Math.max(0,Math.floor(left/2)),c1=Math.min(COLS,Math.ceil((left+w)/2));let run=-1,vis=false;
    for(let c=c0;c<=c1;c++){const ok=c<c1&&zb[c]>=pd;if(ok&&run<0)run=c;else if(!ok&&run>=0){const a=Math.max(left,run*2),b=Math.min(left+w,c*2);if(b>a)x.drawImage(img,(a-left)/w*img.width,0,Math.max(.5,(b-a)/w*img.width),img.height,a,top,b-a,h);run=-1;vis=true}}
    return vis}

  return{
    TH,
    draw(x,S,E){
      const {L,m,N,seen,inf,angTo,los}=E,T=dmTheme48(S.fl),th=Math.floor((S.fl-1)/2)%4,A=TH[th],now=performance.now(),t=now/1000,red=G.reduced();
      const wob=!red&&S.luc<35?Math.sin(now/300)*(35-S.luc)/35*.06:0;
      if(V.fl!==S.fl){V.fl=S.fl;V.foes=new Map();V.dead=[];V.items=null;V.hp=S.hp}
      x.save();if(wob){x.fillStyle=A.fog;x.fillRect(-20,-20,W+40,H+40);x.translate(W/2,H/2);x.rotate(wob);x.scale(1.06,1.06);x.translate(-W/2,-H/2)}
      floorCast(x,S,th);
      /* paredes */
      const step=G.low()?2:1,AT=[];
      x.imageSmoothingEnabled=false;
      for(let c=0;c<COLS;c+=step){const ra=S.a-FOV/2+FOV*c/COLS,dx=Math.cos(ra),dy=Math.sin(ra);let mx=Math.floor(S.x),my=Math.floor(S.y);
        const ddx=Math.abs(1/dx),ddy=Math.abs(1/dy),sx=dx<0?-1:1,sy=dy<0?-1:1;let sdx=(dx<0?S.x-mx:mx+1-S.x)*ddx,sdy=(dy<0?S.y-my:my+1-S.y)*ddy,side=0,hit=0;
        for(let i=0;i<80&&!hit;i++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}hit=mx<0||my<0||mx>=N||my>=N?1:m[my][mx]}
        const dist=side?sdy-ddy:sdx-ddx,pd=dist*Math.cos(ra-S.a),h=Math.min(H*3,H/Math.max(.05,pd));S.zb[c]=pd;if(step>1)S.zb[c+1]=pd;
        let wx=side?S.x+dist*dx:S.y+dist*dy;wx-=Math.floor(wx);
        const type=hit>=1&&hit<=6?hit:1,at=AT[type]||(AT[type]=atlas(th,type)),sh=Math.max(.15,1-pd/13)*(side?.74:1),lv=Math.max(0,Math.min(LV-1,Math.round((1-sh)/.9*(LV-1))));
        let u=Math.floor(wx*TS);if((!side&&dx<0)||(side&&dy>0))u=TS-1-u;u=Math.max(0,Math.min(TS-1,u));
        if(h<=H)x.drawImage(at,u,lv*TS,1,TS,c*2,(H-h)/2,2*step,h);
        else{const sH=H/h*TS;x.drawImage(at,u,lv*TS+(TS-sH)/2,1,sH,c*2,0,2*step,H)}
      }
      x.imageSmoothingEnabled=true;
      if(amb==null||ambK!==A.amb+th){ambK=A.amb+th;amb=G.ambient(A.amb,{W,H,n:26,col:A.ac,seed:th+3})}
      amb.draw(x,t,S.a*420);
      /* quem sumiu da lista de inimigos virou um eco que se desfaz */
      const alive=new Set(S.en);
      V.foes.forEach((v,e)=>{if(!alive.has(e)){V.dead.push({x:e.x,y:e.y,k:e.k,t:now,burst:false});V.foes.delete(e)}});
      V.dead=V.dead.filter(d=>now-d.t<620);
      /* sprites, do mais longe para o mais perto */
      const items=S.items.map(q=>({x:q.x,y:q.y,k:'i',it:q.k})),list=[...S.en.map(e=>({x:e.x,y:e.y,k:'e',e})),...V.dead.map(d=>({x:d.x,y:d.y,k:'d',dd:d})),...S.orbs.map(q=>({x:q.x,y:q.y,k:'o',o:q})),...S.rk.map(r=>({x:r.x,y:r.y,k:'r'})),...items,{x:L.portal[0],y:L.portal[1],k:'p'},...S.booms.map(b=>({x:b.x,y:b.y,k:'b',b}))]
        .map(s=>({...s,d:Math.hypot(s.x-S.x,s.y-S.y)})).sort((a,b)=>b.d-a.d);
      S.booms=S.booms.filter(b=>now-b.t<400);
      const lamps=[];
      list.forEach(s=>{const da=angTo(s.x,s.y);if(Math.abs(da)>FOV*.7||s.d<.15)return;const pd=s.d*Math.cos(da),scx=(.5+da/FOV)*W,cc=Math.floor(scx/2),see=cc>=0&&cc<COLS&&S.zb[cc]>=pd,fog=Math.max(.25,1-pd/15);
        if(s.k==='e'){const e=s.e,F=DMF48[e.k],sz=F.sz*H/pd,top=HZ-sz/2+sz*.08;
          let v=V.foes.get(e);if(!v){v={hit:e.hitT,ph:(e.id*1.7)%6};V.foes.set(e,v)}
          const fr=e.alert&&!red?Math.floor(t*(e.k==='per'?7:4)+v.ph)&1:0,bob=e.k==='ati'&&!red?Math.sin(t*3+v.ph)*sz*.04:e.alert&&!red?-Math.abs(Math.sin(t*8+v.ph))*sz*.025:0;
          if(see&&pd<9){G.shadow(x,scx,top+sz,sz*.8,{alpha:.55*fog})}
          const base=foeSprite(e.k,fr),hurt=now-e.hitT<90,img=hurt?G.tint(base,'#ffffff',.55):base;
          const vis=slice(x,S.zb,img,scx,top+bob,sz*1.2,sz*1.02,pd);
          if(vis&&pd>6){x.save();x.globalAlpha=Math.min(.5,(pd-6)/12);slice(x,S.zb,G.tint(base,A.fog,1),scx,top+bob,sz*1.2,sz*1.02,pd);x.restore()}
          if(see&&pd<12){G.glow(x,scx,top+sz*.45+bob,sz*.16,FOE[e.k].eye,.35*fog)}
          if(e.hitT!==v.hit){v.hit=e.hitT;if(see){G.emit('impacto',scx,top+sz*.5,{col:FOE[e.k].eye,size:Math.min(1.1,Math.max(.5,sz/260)),amount:.7});v.flash=now}}
          if(see&&(e.k==='boss'||e.k==='tan')&&e.hp<e.max){const bw=Math.min(220,Math.max(30,sz*.6));G.hud.bar(x,scx-bw/2,Math.max(70,top-12),bw,6,e.hp/e.max,{col:e.k==='boss'?'#ffb000':'#7fd0ff'})}
          return}
        if(s.k==='d'){const d=s.dd,F=DMF48[d.k],sz=F.sz*H/pd,k=(now-d.t)/620,hh=sz*1.02*(1-k*.8);
          if(!d.burst){d.burst=true;if(see){G.emit(d.k==='boss'?'explosao':'estilhacos',scx,HZ,{col:FOE[d.k].mul,size:Math.min(2.2,Math.max(.7,sz/150))});G.hitstop(d.k==='boss'?130:55)}}
          x.save();x.globalAlpha=1-k;slice(x,S.zb,G.tint(foeSprite(d.k,1),k<.2?'#ffffff':FOE[d.k].mul,.8),scx,HZ+sz*.58-hh,sz*1.2*(1+k*.5),hh,pd);x.restore();return}
        if(!see)return;
        if(s.k==='o'||s.k==='r'){const kk=s.k==='r'?'r':s.o.k==='p'?'p':s.o.k==='h'?'h':'w',r=(s.k==='r'?.16:kk==='h'?.15:.11)*H/pd,yy=HZ+r*.5,d=r*(red?3.1:3+Math.sin(t*18+s.x*9)*.25);
          G.draw(x,orb(kk),scx,yy,{w:d,h:d,rot:(kk==='h'||kk==='r')&&!red?t*5:0});G.glow(x,scx,yy,r*2.4,{w:'#ff4a7a',p:'#a050ff',h:'#ff6a1a',r:'#ffb020'}[kk],.4);return}
        if(s.k==='b'){const k=Math.min(1,(now-s.b.t)/400),r=(.3+k*1.6)*H/pd;if(!V.booms.has(s.b)){V.booms.add(s.b);G.emit('explosao',scx,HZ,{size:1.6});G.hitstop(70)}
          G.glow(x,scx,HZ,r*1.9,'#ff8a00',(1-k)*.9);G.glow(x,scx,HZ,r*.9,'#fff3c0',1-k);G.rays(x,scx,HZ,{n:10,len:r*2.4,col:'#ffd36b',a:(1-k)*.3,t:t*9});x.strokeStyle=G.rgba('#ffe9a0',1-k);x.lineWidth=Math.max(1,5*(1-k));x.beginPath();x.arc(scx,HZ,r*1.15,0,TAU);x.stroke();return}
        if(s.k==='p'){const r=.42*H/pd,py=HZ+r*.2,c=S.boss?'#8a8a9a':'#c58bff';G.shadow(x,scx,HZ+.5*H/pd,r*2.8,{alpha:.5});
          G.draw(x,ped(),scx,HZ+.5*H/pd,{w:r*2.9,h:r*3.05,ay:1});G.glow(x,scx,py,r*1.7,c,S.boss?.25:.6,{sy:1.1});
          G.draw(x,gate(S.boss),scx,py,{w:r*2,h:r*2,rot:red?0:t*(S.boss?.15:.9),sy:1.05});G.draw(x,gate(S.boss),scx,py,{w:r*1.3,h:r*1.3,rot:red?0:-t*(S.boss?.25:1.7),alpha:.8});
          if(S.boss)G.icon(x,'cadeado',scx,py,r*.7,'#d8d8e4');else{G.glow(x,scx,py,r*.5,'#ffffff',.7)}
          lamps.push([scx,py,r*3,c]);
          if(s.d<6)G.hud.text(x,S.boss?'SELADO':'PORTAL',scx,Math.max(70,HZ+.5*H/pd-r*3.25),{size:13,al:'center',w:900,col:S.boss?'#c8c8d4':'#e9d6ff'});return}
        if(s.k==='i'){const sz=.3*H/pd,fl=HZ+.5*H/pd,bob=red?0:Math.sin(t*3.4+s.x*7)*sz*.1,key=s.it.startsWith('key')||s.it.startsWith('w'),w=sz*(key?1.3:1.1),c=ITEMC[s.it]||'#fff';
          G.shadow(x,scx,fl,w*.9,{alt:sz*.15,alpha:.5});G.glow(x,scx,fl-sz*.08,w*.8,c,.5,{sy:.34});G.draw(x,item(s.it),scx,fl-w*.62+bob,{w,h:w});G.glow(x,scx,fl-w*.62+bob,w*.75,c,key?.35:.2)}});
      x.restore();
      /* luz da arma e do portal */
      const firing=S.fire>0&&S.w>0;
      if(firing)G.glow(x,W/2,H*.78,W*.52,WN[S.w],S.fire/.12*.3,{sy:.75});
      /* dano e morte: pausa curta na imagem */
      if(S.hp<V.hp-.5)G.hitstop(45,{zoom:.02});V.hp=S.hp;
      G.vignette(x,W,H,{a:.55,col:'#000000'});
      if(S.luc<=0)G.vignette(x,W,H,{a:.75+(red?0:.15*Math.sin(now/200)),col:'#4a0068'});
      else if(S.luc<35){x.fillStyle=`rgba(120,40,200,${(35-S.luc)/35*.18})`;x.fillRect(0,0,W,H);G.vignette(x,W,H,{a:(35-S.luc)/35*.55,col:'#3a0058'})}
      /* arma em primeiro plano */
      const fs=G.fs(14),hh=Math.max(52,fs*2.9),walk=(S.keys2||{}).KeyW||(S.keys2||{}).ArrowUp||(S.keys2||{}).KeyS||(S.keys2||{}).KeyA||(S.keys2||{}).KeyD;
      const bx=red?0:Math.sin(now/260)*(walk?9:2),by=red?0:Math.abs(Math.cos(now/260))*(walk?7:1.5),rec=Math.max(0,S.fire)/.12,gy=H-10+by+rec*(S.w===3?20:S.w===2?16:9);
      if(S.w===0){const sw=S.swing>0?(.25-S.swing)/.25:0,cx=W/2+92-sw*190+bx,cy=gy+14+sw*18;G.draw(x,gun(0),cx,cy,{w:216,h:180,ay:.82,rot:-.42+sw*1.15});G.glow(x,cx-40+sw*60,cy-110,50,'#c58bff',.3);
        if(S.swing>0){x.save();x.globalCompositeOperation='lighter';x.strokeStyle=G.rgba('#d8b8ff',S.swing/.25*.8);x.lineCap='round';for(let i=0;i<3;i++){x.lineWidth=14-i*4;x.beginPath();x.arc(W/2,H*.86,150-i*9,-2.45+sw*.4,-2.45+sw*2.2);x.stroke()}x.restore()}}
      else{const dh=[0,142,150,158][S.w],dw=dh*1.2,my=gy-dh+[0,36,34,64][S.w]*dh/200;
        if(firing){G.rays(x,W/2,my,{n:S.w===2?11:8,len:S.w===1?70:120,width:.34,col:WN[S.w],a:rec*.55,t:t*11});G.glow(x,W/2,my,S.w===2?82:S.w===3?96:52,WN[S.w],rec);G.glow(x,W/2,my,24,'#ffffff',rec)}
        G.draw(x,gun(S.w),W/2+bx,gy,{w:dw,h:dh,ay:1});
        if(S.w===3&&!red)G.glow(x,W/2+bx,my+8,30,'#ffd36b',.35+.15*Math.sin(t*5))}
      /* mira */
      const hot=firing||S.swing>0;x.save();x.translate(W/2,HZ);x.strokeStyle='rgba(0,0,0,.65)';x.lineWidth=4;const cross=()=>{x.beginPath();const g0=hot?8:5,g1=hot?16:12;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([u,v])=>{x.moveTo(u*g0,v*g0);x.lineTo(u*g1,v*g1)});x.stroke()};cross();x.strokeStyle=hot?WN[S.w]:'rgba(255,255,255,.85)';x.lineWidth=2;cross();x.fillStyle=A.acc;x.fillRect(-1.5,-1.5,3,3);x.restore();
      if(S.hurt>0){G.vignette(x,W,H,{a:Math.min(1,S.hurt*2),col:'#ff0028'});x.fillStyle=`rgba(255,0,40,${S.hurt*.25})`;x.fillRect(0,0,W,H)}
      /* dano direcional */
      S.dir=S.dir.filter(q=>now-q.t<900);S.dir.forEach(q=>{const k=1-(now-q.t)/900;x.save();x.translate(W/2,H/2);x.rotate(q.a);x.globalAlpha=k;x.fillStyle='rgba(255,40,60,.35)';x.beginPath();x.arc(0,0,172,-.42,.42);x.arc(0,0,138,.3,-.3,true);x.fill();G.poly(x,[[186,0],[164,-13],[164,13]],'#ff3a50');x.restore()});
      /* minimapa / mapa */
      const big=S.map,ms=big?Math.floor(Math.min(W-40,H-70)/N):Math.max(2,Math.floor(104/N)),ox=big?(W-ms*N)/2:12,oy=big?(H-ms*N)/2+14:12;
      if(big){x.fillStyle='rgba(4,2,8,.84)';x.fillRect(0,0,W,H);G.hud.panel(x,ox-10,oy-10,ms*N+20,ms*N+20,{acc:A.acc,a:.95})}
      else G.hud.panel(x,ox-5,oy-5,ms*N+10,ms*N+10,{acc:A.acc,a:.8,r:6});
      x.globalAlpha=big?1:.9;
      for(let y=0;y<N;y++)for(let xx=0;xx<N;xx++){if(!seen[y*N+xx])continue;const v=m[y][xx];x.fillStyle=v===4?'#ffd36b':v===5?'#7fc8ff':v===0?'#3a2e4c':v===6?'#6a5a7a':'#8a8296';x.fillRect(ox+xx*ms,oy+y*ms,ms,ms)}
      const pc=[Math.floor(L.portal[0]),Math.floor(L.portal[1])];if(seen[pc[1]*N+pc[0]]){x.fillStyle=S.boss?'#bbb':'#e070ff';x.fillRect(ox+pc[0]*ms-1,oy+pc[1]*ms-1,ms+2,ms+2)}
      S.items.forEach(q=>{if(!q.k.startsWith('key'))return;const c=Math.floor(q.y)*N+Math.floor(q.x);if(seen[c])G.icon(x,'chave',ox+q.x*ms,oy+q.y*ms,Math.max(8,ms*1.4),q.k==='key4'?'#ffd36b':'#7fc8ff')});
      S.en.forEach(e=>{if(Math.hypot(e.x-S.x,e.y-S.y)<9&&los(S.x,S.y,e.x,e.y)){x.fillStyle=e.k==='boss'?'#ffb000':'#ff4040';x.beginPath();x.arc(ox+e.x*ms,oy+e.y*ms,e.k==='boss'?3.4:2.2,0,TAU);x.fill()}});
      x.save();x.translate(ox+S.x*ms,oy+S.y*ms);x.rotate(S.a);const ar=Math.max(4,ms*.75);G.poly(x,[[ar,0],[-ar*.7,-ar*.65],[-ar*.3,0],[-ar*.7,ar*.65]],'#ffd36b');x.restore();
      x.globalAlpha=1;if(big)G.hud.text(x,`Andar ${S.fl} · ${T.n} · M fecha o mapa`,W/2,18,{size:14,al:'center',col:'#e8dcc0',max:W-30});
      if(!big){
        /* HUD diegético: sinais vitais à esquerda, arma à direita */
        const ky=18,keyW=G.fs(16)*1.5;[[4,'#ffd36b'],[5,'#7fc8ff']].forEach(([v,c],i)=>{const cx=W-18-keyW/2-(1-i)*(keyW+6);x.fillStyle='rgba(10,6,16,.75)';x.beginPath();x.arc(cx,ky+6,keyW*.55,0,TAU);x.fill();x.strokeStyle=G.rgba(c,S.keys[v]?1:.3);x.lineWidth=1.6;x.stroke();G.icon(x,'chave',cx,ky+6,keyW*.72,S.keys[v]?c:'rgba(244,234,214,.2)')});
        const colW=Math.max(70,fs*4.1),lw=colW*3+16,ly=H-hh-6;
        G.hud.panel(x,6,ly,lw,hh,{acc:A.acc,a:.88});
        [['coracao',S.hp,S.hp<34?'#ff4a3a':'#ff5b6b'],['escudo',S.arm,'#7dffa8'],['olho',S.luc,S.luc<35?'#ff9bf0':'#c58bff']].forEach(([ic,v,c],i)=>{const X=14+i*colW;
          G.icon(x,ic,X+fs*.6,ly+hh*.36,fs*1.1,c);G.hud.text(x,String(Math.ceil(v)),X+fs*1.35,ly+hh*.38,{size:fs*1.2,w:900,col:i===0&&S.hp<34?'#ff8a7a':'#fff'});
          G.hud.bar(x,X+2,ly+hh*.7,colW-14,Math.max(5,hh*.12),v/100,{col:c})});
        const ws=DMW48[S.w],rw=Math.max(142,fs*8.6),rx=W-rw-6;
        G.hud.panel(x,rx,ly,rw,hh,{acc:WN[S.w],a:.88});
        G.icon(x,WI[S.w],rx+fs*1.1,ly+hh*.34,fs*1.35,WN[S.w]);G.hud.text(x,ws.am?String(S.ammo[ws.am]):'∞',rx+rw-12,ly+hh*.36,{size:fs*1.55,w:900,al:'right',col:ws.am&&S.ammo[ws.am]<=3?'#ff8a7a':'#fff'});
        for(let i=0;i<4;i++){const sw=(rw-18)/4,X=rx+9+i*sw,on=i===S.w,own=S.own[i];x.fillStyle=on?G.rgba(WN[i],.32):'rgba(0,0,0,.45)';x.fillRect(X+1,ly+hh*.62,sw-2,hh*.3);x.fillStyle=on?WN[i]:'rgba(244,234,214,.18)';x.fillRect(X+1,ly+hh*.92-2,sw-2,2);
          if(own)G.icon(x,WI[i],X+sw/2,ly+hh*.76,hh*.22,on?WN[i]:'#c9b995');else{x.fillStyle='rgba(244,234,214,.25)';x.fillRect(X+sw/2-3,ly+hh*.76-1,6,2)}}
      }
      if(S.boss&&S.boss.alert&&!big){const bw=240;G.hud.bar(x,W/2-bw/2,20,bw,11,S.boss.hp/S.boss.max,{col:S.boss.ph===2?'#ff4a2a':'#ffb000',segs:4});G.icon(x,'coroa',W/2-bw/2-14,25,18,'#ffd36b');G.hud.text(x,'CHEFE DE ANDAR',W/2,46,{size:12,al:'center',w:900,col:'#ffd36b'})}
      if(S.msg&&now<S.msgT&&Date.now()>=E.t0){const msg=G.clean(S.msg),k=Math.min(1,(S.msgT-now)/300),s=G.fs(16,11),Y=big?H-18:S.boss&&S.boss.alert?78:Math.max(64,ms*N+34);
        x.save();x.globalAlpha=k;x.font=`800 ${s}px "IBM Plex Sans",system-ui,sans-serif`;const w=Math.min(W-24,x.measureText(msg).width+34);G.hud.panel(x,W/2-w/2,Y-s*.95,w,s*1.9,{acc:A.acc,a:.9});G.hud.text(x,msg,W/2,Y+1,{size:s,al:'center',w:800,col:'#ffe9b0',max:W-40,stroke:0});x.restore()}
      G.hud.frame(x,W,H,{acc:A.acc,a:.55});
      if(S.phase==='tally'){const q=S.flStats[S.flStats.length-1];x.fillStyle='rgba(4,2,8,.7)';x.fillRect(0,0,W,H);const pw=Math.min(W-40,520),py=H/2-112;
        G.hud.panel(x,W/2-pw/2,py,pw,224,{acc:'#ffd36b',a:.97});G.rays(x,W/2,py+48,{n:12,len:220,col:'#ffd36b',a:.07,t:t*3});
        G.hud.text(x,`Andar ${q.f} concluído!`,W/2,py+46,{size:32,al:'center',w:900,col:'#ffd36b',stroke:5,max:pw-30});
        [['relogio',mmss21(q.t),'Tempo'],['caveira',String(q.k),'Abates'],['estrela',`${q.s}/${q.st}`,'Segredos'],['moeda',`+${q.tb}`,'Bônus']].forEach(([ic,v,l],i)=>{const cx=W/2-pw/2+pw*(i+.5)/4;G.icon(x,ic,cx,py+92,28,'#ffd36b');G.hud.text(x,v,cx,py+126,{size:20,al:'center',w:900});G.hud.text(x,l,cx,py+150,{size:12,al:'center',col:'#c9b995',max:pw/4-6})});
        G.hud.text(x,!inf&&q.f>=DMCAMP48?'O Colapso foi contido.':`Descendo para o Andar ${q.f+1}…`,W/2,py+192,{size:16,al:'center',col:'#e8dcc0',max:pw-30})}
    }
  };
}

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
  const G=window.GFX60,art=dmArt48();
  floor(f0);
  G.skin({acc:art.TH[Math.floor((f0-1)/2)%4].acc});
  return{
    g60intro:{title:'DOOM: Colapso Mental',sub:inf?'Modo Infinito':`Andar ${f0} · ${dmTheme48(f0).n}`,acc:art.TH[Math.floor((f0-1)/2)%4].acc},
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
      C.hud(G.chips([{icon:'caveira',label:'Andar',value:inf?S.fl:`${S.fl}/${DMCAMP48}`},{icon:'coracao',label:'Vital',value:Math.ceil(S.hp),tone:S.hp<34?'bad':null},{icon:'escudo',label:'Armadura',value:Math.ceil(S.arm)},{icon:'olho',label:'Lucidez',value:Math.ceil(S.luc),tone:S.luc<35?'warn':null},{icon:'alvo',label:ws.n,value:ws.am?S.ammo[ws.am]:'∞'},S.keys[4]&&{icon:'chave',label:'Dourada',tone:'warn'},S.keys[5]&&{icon:'chave',label:'Azul',tone:'ok'},{icon:'raio',label:'Abates',value:S.kills}]));
    },
    draw(x){art.draw(x,S,{L,m,N,seen,inf,angTo,los,t0:C.t0})}
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

/* ---------- 🎨 arte do Julgamento (somente visual: caixa, balas e hitboxes iguais) ---------- */
let JUART49=null;
function juArt49(){
  if(JUART49)return JUART49;
  const G=window.GFX60,W=600,H=450,TAU=Math.PI*2,poly=G.poly;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const radial=(g,X,Y,R,c,a)=>{const q=g.createRadialGradient(X,Y,0,X,Y,R);q.addColorStop(0,G.rgba(c,a));q.addColorStop(1,G.rgba(c,0));g.fillStyle=q;g.fillRect(X-R,Y-R,R*2,R*2)};
  const BC={cult:'#ffd36b',nat:'#7dffa8',void:'#c58bff',juiz:'#f4e2b8'};
  const AMB={cult:['brasas','#ffb347'],nat:['folhas','#6fbf5a'],void:['motes','#b48cff'],juiz:['poeira','#f4e2b8']};
  /* ===== palcos ===== */
  const CANDLES=[[70,128],[96,136],[124,126],[476,126],[504,136],[530,128]];
  const stage=bk=>G.bake('ju:stage:'+bk,W,H,(g,w,h,r)=>{
    if(bk==='cult'){g.fillStyle=vgrad0(g,['#1c0e12','#2e1a14','#0c0608']);g.fillRect(0,0,W,H);
      for(let j=0;j<9;j++)for(let i=-1;i<13;i++){box(g,i*52+(j%2)*26+1,j*18+1,50,16,G.shade('#3a2420',(r()-.5)*.3),2)}
      radial(g,300,66,230,'#ffb040',.3);
      g.fillStyle='#120808';g.beginPath();g.moveTo(222,150);g.lineTo(222,58);g.quadraticCurveTo(226,6,300,2);g.quadraticCurveTo(374,6,378,58);g.lineTo(378,150);g.fill();
      g.save();g.beginPath();g.moveTo(230,146);g.lineTo(230,60);g.quadraticCurveTo(234,14,300,10);g.quadraticCurveTo(366,14,370,60);g.lineTo(370,146);g.clip();
      const cs=['#b8701c','#8a2a30','#d8a83c','#5a2a6a','#c8501c','#2a4a7a'];for(let j=0;j<9;j++)for(let i=0;i<7;i++){const X=230+i*20,Y=10+j*17;poly(g,[[X,Y],[X+20,Y+(i%2?7:-3)],[X+20,Y+20],[X,Y+15]],G.shade(cs[(i*2+j*3)%6],-.25));line(g,[[X,Y],[X+20,Y+(i%2?7:-3)],[X+20,Y+20]],'#140a06',2.4)}
      radial(g,300,66,66,'#fff0b0',.55);ring(g,300,66,40,'#140a06',3);for(let i=0;i<8;i++){const a=i*TAU/8;line(g,[[300,66],[300+Math.cos(a)*74,66+Math.sin(a)*74]],'#140a06',2.4)}g.restore();
      [24,170,430,576].forEach(X=>{box(g,X-17,0,34,150,vg(g,0,150,'#4a2e22','#180c0a'));g.fillStyle='rgba(255,210,140,.16)';g.fillRect(X-12,0,4,150);box(g,X-23,138,46,12,'#2a1812',2);box(g,X-23,0,46,9,'#2a1812')});
      CANDLES.forEach(([X,Y])=>{box(g,X-4,Y,8,150-Y+4,'#e9dcb8',2);box(g,X+1,Y,3,150-Y+4,'#b8a47a');radial(g,X,Y-7,36,'#ffb040',.4)});}
    else if(bk==='nat'){g.fillStyle=vgrad0(g,['#04140e','#12402c','#04100a']);g.fillRect(0,0,W,H);radial(g,470,34,90,'#d8ffe0',.5);disc(g,470,34,20,'#e8fff0');disc(g,478,29,17,'#8ac8a0');
      for(let i=0;i<60;i++)disc(g,r()*W,r()*80,.5+r()*1.1,'rgba(220,255,230,.6)');
      G.paint.trees({col:'#163e2a',n:15,min:.18,max:.3,base:.34})(g,W,H,r);g.clearRect&&0;
      g.fillStyle=vg(g,140,H,'#0a2016','#030a07');g.fillRect(0,146,W,H-146);
      [[30,1],[570,-1],[150,1],[452,-1]].forEach(([X,s],k)=>{const big=k<2;let u=X,y=156;const p=[[u,y]];for(let i=0;i<6;i++){u+=s*(big?4:2)+(r()-.5)*10;y-=26;p.push([u,y])}line(g,p,'#1c140a',big?30:14);line(g,p,'#3a2c18',big?18:8);line(g,[p[3],[p[3][0]+s*60,p[3][1]-24],[p[3][0]+s*96,p[3][1]-16]],'#2a2010',big?9:5);for(let i=0;i<16;i++)ell(g,p[5][0]+(r()-.5)*90,p[5][1]+(r()-.3)*44,13+r()*14,8+r()*9,G.mix('#0e3a20','#2f7a44',r()),r()*3)});
      for(let i=0;i<110;i++){const X=r()*W,Y=146+r()*16;line(g,[[X,Y],[X+(r()-.5)*8,Y-6-r()*9]],G.mix('#14402a','#4a9a5a',r()),1.6)}}
    else if(bk==='void'){g.fillStyle=vgrad0(g,['#030108','#140a2e','#020106']);g.fillRect(0,0,W,H);G.paint.nebula({cols:['#5a2a9a','#1f2a6a','#7a2a7a'],n:9,a:.3,top:0,bottom:.36})(g,W,H,r);
      for(let i=0;i<130;i++){g.fillStyle=G.rgba('#e0d0ff',.2+r()*.7);const s=.5+r()*1.4;g.fillRect(r()*W,r()*150,s,s)}
      g.strokeStyle='rgba(197,139,255,.3)';for(let i=0;i<4;i++){g.lineWidth=2.5-i*.5;g.beginPath();g.ellipse(300,74,110+i*52,38+i*15,0,0,TAU);g.stroke()}
      for(let i=0;i<14;i++){const X=i<7?r()*180:420+r()*180,Y=12+r()*118,s=6+r()*17;poly(g,[[X-s,Y],[X-s*.2,Y-s*.9],[X+s,Y-s*.2],[X+s*.3,Y+s*.8]],'#241648');poly(g,[[X-s*.2,Y-s*.9],[X+s,Y-s*.2],[X,Y]],'#4a2e80');line(g,[[X-s,Y],[X-s*.2,Y-s*.9],[X+s,Y-s*.2]],'rgba(220,190,255,.55)',1)}}
    else{g.fillStyle=vgrad0(g,['#1a1016','#2a1a1e','#0a0608']);g.fillRect(0,0,W,H);
      for(let i=0;i<12;i++){const X=i*52;box(g,X,0,52,150,vg(g,0,150,i%2?'#6a1426':'#541020','#240610'));g.fillStyle='rgba(255,150,160,.12)';g.fillRect(X+12,0,8,150);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+36,0,10,150)}
      for(let i=0;i<10;i++){disc(g,i*66+10,0,38,'#3a0a16');line(g,[[i*66-28,2],[i*66+10,38],[i*66+48,2]],'#d8a83c',2)}
      [40,136,464,560].forEach(X=>{box(g,X-15,18,30,132,vg(g,18,150,'#e8e0d0','#8a8274'));for(let i=-1;i<2;i++){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(X+i*8-2,24,3,122)}box(g,X-24,12,48,10,'#f4ecdc',3);box(g,X-24,140,48,12,'#c8bea8',3)});
      radial(g,300,62,190,'#ffe9b0',.26);
      line(g,[[300,4],[300,26]],'#a87a22',5);line(g,[[196,30],[404,30]],'#d8a83c',5);disc(g,300,30,8,'#ffd36b');[196,404].forEach(X=>{line(g,[[X,30],[X-24,70]],'#a87a22',1.6);line(g,[[X,30],[X+24,70]],'#a87a22',1.6);g.fillStyle='#d8a83c';g.beginPath();g.arc(X,70,28,0,Math.PI);g.fill();ell(g,X,70,28,5,'#ffe9a0')})}
    /* tablado sob o réu */
    const fl={cult:'#3a1c12',nat:'#123020',void:'#1a1030',juiz:'#4a2a16'}[bk];
    ell(g,300,140,150,20,'rgba(0,0,0,.5)');ell(g,300,135,128,16,G.shade(fl,-.2));ell(g,300,131,122,14,G.shade(fl,.18));g.strokeStyle=G.rgba(BC[bk],.55);g.lineWidth=1.5;g.beginPath();g.ellipse(300,131,100,10,0,0,TAU);g.stroke();
    g.fillStyle=vg(g,128,176,'rgba(4,2,8,0)','rgba(4,2,8,.9)');g.fillRect(0,128,W,48);g.fillStyle='rgba(4,2,8,.9)';g.fillRect(0,176,W,H-176);
    const tx=G.tile('runa',{size:60,a:'#0a0612',b:BC[bk],seed:8});for(let X=0;X<W;X+=60)for(let Y=336;Y<H;Y+=60){g.globalAlpha=.22;g.drawImage(tx,X,Y,60,60)}g.globalAlpha=1;
    line(g,[[8,334],[592,334]],G.rgba(BC[bk],.35),1.5);
  });
  function vgrad0(g,s){return vg(g,0,H,...s)}
  /* ===== réus (o Perseus fantasiado) ===== */
  const BW=170,BH=140;
  const catImg=col=>G.bake(`ju:cat:${col}:${SPR.ok?1:0}`,128,128,c=>{
    if(SPR.ok){c.drawImage(SPR.img,0,0,128,128);c.globalCompositeOperation='multiply';c.fillStyle=col;c.fillRect(0,0,128,128);c.globalCompositeOperation='destination-in';c.drawImage(SPR.img,0,0,128,128)}
    else{ell(c,60,80,52,46,'#100810');poly(c,[[12,62],[22,18],[52,40]],'#100810');poly(c,[[58,40],[88,18],[104,62]],'#100810');ell(c,60,80,47,41,col);poly(c,[[17,58],[25,28],[46,42]],col);poly(c,[[66,42],[86,28],[99,58]],col)}
    c.globalCompositeOperation='source-atop';c.fillStyle=vg(c,10,128,'rgba(255,255,255,.14)','rgba(0,0,0,.42)');c.fillRect(0,0,128,128)},{s:2});
  const boss=(bk,fury,fr)=>G.bake(`ju:boss:${bk}:${fury?1:0}:${fr}:${SPR.ok?1:0}`,BW,BH,g=>{
    const S0=112,ox=29,oy=BH-S0*.99-2,P=(u,v)=>[ox+u*S0,oy+v*S0],eyes=[P(.285,.415),P(.585,.408)];
    const glowEyes=(c,s=1)=>eyes.forEach(([X,Y])=>{radial(g,X,Y,16*s,c,.9);ell(g,X,Y,7*s,4.4*s,c);ell(g,X,Y,1.6,3.6*s,'#100008')});
    const brows=()=>{if(fury){line(g,[[eyes[0][0]-9,eyes[0][1]-12],[eyes[0][0]+9,eyes[0][1]-5]],'#1a0004',4);line(g,[[eyes[1][0]+9,eyes[1][1]-12],[eyes[1][0]-9,eyes[1][1]-5]],'#1a0004',4)}};
    if(bk==='cult'){poly(g,[[38,56],[85,18],[132,56],[158,138],[128,126],[106,140],[85,128],[62,140],[40,126],[12,138]],'#7a4a10');poly(g,[[85,18],[132,56],[158,138],[128,126],[85,100]],'#4a2a08');
      g.drawImage(catImg('#e8c890'),ox,oy,S0,S0);
      g.fillStyle='#9a6416';g.beginPath();g.moveTo(24,84);g.quadraticCurveTo(30,12,85,6);g.quadraticCurveTo(140,12,146,84);g.quadraticCurveTo(122,36,85,34);g.quadraticCurveTo(48,36,24,84);g.fill();line(g,[[30,70],[46,34],[85,16],[124,34],[140,70]],'#ffd36b',2.6);
      G.icon(g,'sol',85,24,19,'#fff0b0');
      poly(g,[[50,112],[85,104],[120,112],[112,128],[85,118],[58,128]],'#7a1c24');line(g,[[50,112],[85,104],[120,112]],'#ffd36b',2);disc(g,85,118,8,'#ffd36b');G.icon(g,'estrela',85,118,10,'#6a4208');
      [[20,104],[150,104]].forEach(([X,Y],i)=>{box(g,X-5,Y,10,30,'#efe2bc',3);box(g,X+1,Y,4,30,'#bca87e');ell(g,X,Y+30,11,4,'#8a6a22');radial(g,X,Y-9,22,'#ffb040',.85);ell(g,X+(fr===i?1.5:-1.5),Y-7,3.8,8,'#ffb33a');ell(g,X,Y-5,1.8,3.6,'#fff6d0')});
      if(fury){glowEyes('#ff5a1a',1.15);brows()}}
    else if(bk==='nat'){[[-1,44],[1,126]].forEach(([s,X])=>{line(g,[[X,56],[X+s*16,32],[X+s*13,8]],'#4a3218',7);line(g,[[X+s*14,34],[X+s*34,24],[X+s*42,8]],'#4a3218',5);line(g,[[X+s*16,24],[X+s*3,12]],'#4a3218',3.5);[[X+s*13,8],[X+s*42,8],[X+s*3,12]].forEach(([u,v],i)=>{ell(g,u,v,7,4,i%2?'#5ac06a':'#8ae07a',s*.6)})});
      g.drawImage(catImg(fury?'#c8a070':'#8ad89a'),ox,oy,S0,S0);
      for(let i=0;i<22;i++){const a=Math.PI+i/21*Math.PI,X=85+Math.cos(a)*(46+(i%3)*4),Y=62+Math.sin(a)*(32+(i%2)*5);ell(g,X,Y,10,5,G.mix(fury?'#7a4a18':'#1f6a30',fury?'#d89030':'#7ad060',(i%5)/5),a+1.4+(fr?.12:-.12))}
      [[30,96,-1],[140,96,1]].forEach(([X,Y,s])=>{line(g,[[X+s*-4,Y-8],[X+s*12,Y+12],[X+s*4,138]],'#3a2812',9);line(g,[[X+s*10,Y+10],[X+s*26,Y+18]],'#3a2812',5);for(let i=0;i<3;i++)ell(g,X+s*(8+i*6),Y+i*14,6,3,'#4aa05a',s*i*.4)});
      line(g,[[54,122],[70,114],[85,126],[102,113],[118,122]],'#3a2812',5);[[60,50],[112,56],[85,108]].forEach(([X,Y],i)=>{for(let k=0;k<5;k++){const a=k*TAU/5+i;disc(g,X+Math.cos(a)*5,Y+Math.sin(a)*5,3.6,fury?'#8a5a2a':'#ffd0e8')}disc(g,X,Y,3,'#ffd36b')});
      if(fury){glowEyes('#ff8a1a',1.1);brows();for(let i=0;i<5;i++)line(g,[[48+i*18,86],[44+i*18+(i%2)*10,104]],'#3a1c08',2)}}
    else if(bk==='void'){radial(g,85,80,84,'#7a3ad8',.55);
      for(let i=0;i<9;i++){const X=24+i*15.2,len=18+((i*37)%26),w=fr?5:-5;g.strokeStyle='#08020f';g.lineWidth=11-Math.abs(i-4);g.lineCap='round';g.beginPath();g.moveTo(X,100);g.quadraticCurveTo(X+(i%2?w:-w)*2,104+len*.5,X+(i%2?-w:w),100+len);g.stroke()}
      const sil=G.tint(catImg('#ffffff'),'#0a0414',.94);g.save();g.shadowColor=fury?'#ff3a8a':'#b070ff';g.shadowBlur=16;g.drawImage(sil,ox,oy,S0,S0);g.drawImage(sil,ox,oy,S0,S0);g.restore();
      glowEyes(fury?'#ff5aa0':'#ffffff',fury?1.25:1);[[48,92,3],[126,84,2.5],[108,112,3.5],[62,66,2]].forEach(([X,Y,s],i)=>{radial(g,X,Y,s*3,'#e0c0ff',.8);disc(g,X,Y,s*(i%2===fr?1:.7),'#fff')});
      g.strokeStyle='rgba(197,139,255,.75)';g.lineWidth=2;g.beginPath();g.ellipse(85,32,34,9,-.12,0,TAU);g.stroke()}
    else{g.drawImage(catImg(fury?'#ffb8b8':'#ffffff'),ox,oy,S0,S0);
      [[-1,P(.14,.34)],[1,P(.74,.32)]].forEach(([s,[X,Y]])=>{for(let i=0;i<5;i++){disc(g,X+s*(6+i*1.5),Y-8+i*13,11,'#b8b0a8');disc(g,X+s*(6+i*1.5),Y-10+i*13,9.5,'#f4f0e8');ring(g,X+s*(6+i*1.5),Y-10+i*13,4,'#c0b8ac',1.4)}});
      for(let i=0;i<5;i++)disc(g,ox+24+i*14.5,oy+18+Math.abs(i-2)*1.5,10,'#f4f0e8');
      poly(g,[[36,106],[66,98],[85,112],[104,98],[134,106],[146,140],[24,140]],'#140c18');poly(g,[[72,102],[85,112],[98,102],[92,132],[85,124],[78,132]],'#f4f0e8');line(g,[[36,106],[66,98],[85,112],[104,98],[134,106]],'#d8a83c',2.4);
      g.save();g.translate(144,92);g.rotate(fr?.5:.25);box(g,-3,0,6,38,'#8a5a28',2);box(g,-17,-12,34,18,'#a87038',4);box(g,-17,-12,6,18,'#d8a83c',2);box(g,11,-12,6,18,'#d8a83c',2);g.restore();
      eyes.forEach(([X,Y])=>{ring(g,X,Y,11,'#d8a83c',2)});line(g,[[eyes[0][0]+11,eyes[0][1]],[eyes[1][0]-11,eyes[1][1]]],'#d8a83c',2);if(fury){glowEyes('#ff2a3a',.9);brows()}}
  },{s:2});
  /* ===== balas, lanças e coração ===== */
  const bullet=(c,r,kind)=>{const col=JUC49[c],R=r*3;return G.bake(`ju:bul:${c}:${r}:${kind}`,R*2,R*2,g=>{radial(g,R,R,R,col,.55);
    if(kind==='flame'){g.fillStyle=col;g.beginPath();g.moveTo(R,R-r*2.2);g.quadraticCurveTo(R+r*.4,R-r*1.1,R+r,R);g.arc(R,R,r,0,Math.PI);g.quadraticCurveTo(R-r*.4,R-r*1.1,R,R-r*2.2);g.fill();disc(g,R,R+r*.1,r*.62,G.shade(col,.55));disc(g,R,R+r*.25,r*.28,'#fff')}
    else if(kind==='leaf'){disc(g,R,R,r,col);poly(g,[[R+r*.5,R-r*.86],[R+r*1.9,R-r*1.7],[R+r*.9,R-r*.4]],G.shade(col,-.2));line(g,[[R-r*.8,R+r*.55],[R+r*1.6,R-r*1.45]],G.shade(col,-.45),1)}
    else if(kind==='skull'){disc(g,R,R,r+.4,col);disc(g,R-r*.38,R-r*.1,r*.26,'#2a0040');disc(g,R+r*.38,R-r*.1,r*.26,'#2a0040');g.fillStyle='#2a0040';g.fillRect(R-r*.35,R+r*.38,r*.7,r*.22);ring(g,R,R,r+2,G.rgba(col,.7),1)}
    else{disc(g,R,R,r,col);disc(g,R,R,r*.66,G.shade(col,.5));disc(g,R-r*.28,R-r*.32,r*.3,'#fff')}
    ring(g,R,R,r,'rgba(0,0,0,.35)',.8)},{s:3})};
  const wallImg=(c,w,h)=>G.bake(`ju:wall:${c}:${w}:${h}`,w,h,g=>{const col=JUC49[c];box(g,0,0,w,h,col);
    if(c==='w'){g.fillStyle=vg0(g,w,['#9a9aa8','#ffffff','#b8b8c8']);g.fillRect(0,0,w,h);for(let Y=6;Y<h;Y+=12)line(g,[[2,Y],[w/2,Y-4],[w-2,Y]],'rgba(60,60,90,.55)',1)}
    else if(c==='b'){g.fillStyle='rgba(255,255,255,.4)';for(let Y=8;Y<h;Y+=20){g.fillRect(w/2-3,Y,2.4,9);g.fillRect(w/2+1.4,Y,2.4,9)}}
    else{g.fillStyle='rgba(255,255,255,.45)';for(let Y=4;Y<h;Y+=16)poly(g,[[1,Y+8],[w/2,Y],[w-1,Y+8],[w-1,Y+12],[w/2,Y+4],[1,Y+12]],'rgba(255,240,180,.6)')}
    g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1;g.strokeRect(.5,.5,w-1,h-1)},{s:2});
  function vg0(g,w,s){const q=g.createLinearGradient(0,0,w,0);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q}
  const spear=col=>G.bake('ju:spear:'+col,48,20,g=>{radial(g,34,10,16,col,.55);box(g,2,8.4,26,3.2,G.shade(col,-.3),1.5);poly(g,[[38,10],[16,4],[20,10],[16,16]],col);poly(g,[[38,10],[16,4],[20,10]],G.shade(col,.55));line(g,[[2,5],[9,10],[2,15]],col,2)},{s:3});
  const heart=col=>G.bake('ju:heart:'+col,36,36,g=>{radial(g,18,18,18,col,.55);const p=(r,c)=>heart16(g,18,18.5,r,c);p(8.4,'#100008');p(7,col);disc(g,15,15,2,'rgba(255,255,255,.85)')},{s:3});
  /* ===== caixa, painéis e botões ===== */
  function boxFrame(x,b,acc){x.fillStyle='rgba(5,3,10,.92)';x.fillRect(b.x,b.y,b.w,b.h);x.strokeStyle=G.rgba(acc,.4);x.lineWidth=2;x.strokeRect(b.x-7,b.y-7,b.w+14,b.h+14);x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(b.x-2,b.y-2,b.w+4,b.h+4);
    [[b.x-7,b.y-7],[b.x+b.w+7,b.y-7],[b.x-7,b.y+b.h+7],[b.x+b.w+7,b.y+b.h+7]].forEach(([X,Y])=>poly(x,[[X,Y-6],[X+6,Y],[X,Y+6],[X-6,Y]],acc))}
  function btnIcon(x,i,cx,cy,col){x.save();x.translate(cx,cy);
    if(i===0){x.rotate(.78);poly(x,[[0,-12],[3.5,-8],[2.5,4],[-2.5,4],[-3.5,-8]],col);box(x,-7,4,14,3,col,1);box(x,-1.8,7,3.6,5,col,1)}
    else if(i===1){box(x,-11,-10,22,16,col,5);poly(x,[[-5,5],[-8,12],[3,5]],col);[-5.5,0,5.5].forEach(u=>disc(x,u,-2,1.8,'#160c1c'))}
    else if(i===2){g_ring(x,0,-6,5,col);poly(x,[[-9,-4],[9,-4],[11,11],[-11,11]],col);box(x,-3,0,6,6,'#160c1c',1)}
    else{ell(x,0,2,9,5.5,col,-.2);disc(x,7,-3,4,col);poly(x,[[10,-4],[15,-2],[10,-1]],col);poly(x,[[-3,0],[-11,-11],[3,-4]],col);poly(x,[[-8,3],[-15,6],[-7,7]],col)}
    x.restore()}
  function g_ring(x,X,Y,r,c){ring(x,X,Y,r,c,2.4)}
  function button(x,bx,by,w,h,on,acc){x.save();box(x,bx,by,w,h,vg(x,by,by+h,on?'#4a3410':'#2a1a14',on?'#241806':'#140c0a'),9);rim(x,bx+.5,by+.5,w-1,h-1,9,on?'#ffe14a':'#ff9b2f',on?3:2);rim(x,bx+4,by+4,w-8,h-8,6,'rgba(255,220,160,.2)',1);x.restore()}
  const ambs={};
  const amb=bk=>ambs[bk]||(ambs[bk]=G.ambient(AMB[bk][0],{W,H:170,n:20,col:AMB[bk][1],seed:5}));
  return JUART49={BC,CANDLES,stage,boss,bullet,wallImg,spear,heart,boxFrame,btnIcon,button,amb,
    /* cenário vivo atrás do réu */
    scene(x,bk,t,fury){const red=G.reduced();x.drawImage(stage(bk),0,0,W,H);
      if(bk==='cult')CANDLES.forEach(([X,Y],i)=>{const f=red?0:Math.sin(t*9+i*2.3);G.glow(x,X,Y-8,20+f*2,'#ffb040',.5);x.fillStyle='#ffb33a';x.beginPath();x.ellipse(X+f*.8,Y-6,2.8,6+f,0,0,TAU);x.fill();x.fillStyle='#fff6d0';x.beginPath();x.ellipse(X,Y-4.5,1.3,3,0,0,TAU);x.fill()});
      if(bk==='nat'){G.glow(x,470,34,70,'#c8ffd8',.25);G.rays(x,470,34,{n:5,len:300,width:.2,col:'#c8ffd8',a:.05,t,from:1.6,spread:1.5})}
      if(bk==='void')G.glow(x,300,74,150+(red?0:Math.sin(t*1.4)*18),'#6a30c0',.25);
      if(bk==='juiz')G.rays(x,300,-20,{n:5,len:230,width:.26,col:'#ffe9b0',a:.08,t,from:.9,spread:1.4});
      amb(bk).draw(x,t);
      if(fury){G.vignette(x,W,H,{a:.6,col:'#8a0014'});if(!red)G.ambient('brasas',{W,H:170,n:18,col:'#ff5a2a',seed:11}).draw(x,t)}}
  };
}

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
    const b=A.b,s=A.soul,now=performance.now(),t=now/1000,G=window.GFX60,art=juArt49(),red=G.reduced(),acc=A.acc||'#b9a6ff';
    const kinds=A.skin||{};
    art.boxFrame(x,b,acc);
    if(tint){x.fillStyle=tint;x.fillRect(b.x,b.y,b.w,b.h)}
    const one=(q,clip)=>{if(q.w){const im=art.wallImg(q.c,Math.round(q.w),Math.round(q.h));x.drawImage(im,q.x-q.w/2,q.y-q.h/2,q.w,q.h);return}
      const kind=q.c==='p'?'skull':q.c==='o'?'flame':q.wav?(kinds.leaf||'orb'):'orb',im=art.bullet(q.c,q.r,kind),d=im.lw;
      if(kind==='leaf'&&!red){x.save();x.translate(q.x,q.y);x.rotate(Math.sin(q.t*3+q.ph)*.7);x.drawImage(im,-d/2,-d/2,d,d);x.restore()}else x.drawImage(im,q.x-d/2,q.y-d/2,d,d)};
    x.save();x.beginPath();x.rect(b.x,b.y,b.w,b.h);x.clip();
    A.bul.forEach(q=>one(q));
    x.restore();
    A.bul.forEach(q=>{if(q.w)return;if(q.x<b.x||q.x>b.x+b.w||q.y<b.y||q.y>b.y+b.h)one(q)});
    A.sp.forEach(q=>{const a=[0,Math.PI/2,Math.PI,-Math.PI/2][q.d],im=art.spear(q.rev&&!q.flip?JUC49.y:'#ffffff');x.save();x.translate(q.x,q.y);x.rotate(a+Math.PI);x.drawImage(im,-34,-10,48,20);x.restore()});
    const col=s.mode==='blue'?'#3a6bff':s.mode==='green'?'#3fd46a':'#ff2a3d';
    if(s.mode==='green'){const a=[0,Math.PI/2,Math.PI,-Math.PI/2][s.sh],hit=now-A.flash<120;x.save();x.translate(s.x,s.y);x.rotate(a);x.lineCap='round';x.strokeStyle=hit?'#ffffff':'#1a3a8a';x.lineWidth=8;x.beginPath();x.arc(0,0,20,-.72,.72);x.stroke();x.strokeStyle=hit?'#ffffff':'#4aa0ff';x.lineWidth=5;x.beginPath();x.arc(0,0,20,-.7,.7);x.stroke();x.strokeStyle='rgba(220,245,255,.85)';x.lineWidth=1.4;x.beginPath();x.arc(0,0,21.5,-.6,.6);x.stroke();x.restore();
      if(hit)G.glow(x,s.x+Math.cos(a)*20,s.y+Math.sin(a)*20,26,'#9fd0ff',.8);x.strokeStyle='rgba(63,212,106,.35)';x.lineWidth=1;x.beginPath();x.arc(s.x,s.y,22,0,TAU16);x.stroke()}
    x.save();if(A.inv>0&&Math.floor(now/80)%2)x.globalAlpha=.3;if(ghost)x.globalAlpha=.55;G.glow(x,s.x,s.y,22,col,s.mode==='blue'?.75:.45);const hi=art.heart(col);x.drawImage(hi,s.x-18,s.y-18,36,36);x.restore();
    if(!red&&s.moving&&s.mode!=='green'&&Math.random()<.25)G.emit('rastro',s.x,s.y,{col,size:.6,amount:.5})};
  return A}

function julgamento49(C){
  if(C.net)return juPvp49(C);
  const W=600,H=450,o=C.room.opt||{},bk=JUBO49.includes(o.b)?o.b:'cult',B=JUB49[bk],me=me21(C),li=GD12[C.gd]??1;
  const VMAX=gdPick(C.gd,[40,30,24,20]),ATK=gdPick(C.gd,[3,4,5,6])+B.atk,SPD=gdPick(C.gd,[.85,1,1.12,1.25]);
  const S={st:'text',q:B.intro.slice(),qi:0,ch:0,after:'menu',sel:0,sub:0,hp:VMAX,luc:100,bhp:B.hp,mercy:0,an:false,used:{},turn:0,fury:false,
    items:[{n:'Chá de Ervas',v:15,k:'hp',q:gdPick(C.gd,[3,2,2,1])},{n:'Pão Bento',v:25,k:'hp',q:gdPick(C.gd,[2,1,1,1])},{n:'Incenso',v:40,k:'luc',q:gdPick(C.gd,[2,2,1,1])},{n:'Sachê do Perseus',v:999,k:'hp',q:1}],
    bar:0,barOn:false,dmgT:0,dmgN:'',shake:0,dodgeT:0,pat:'',hits:0,crits:0,critRow:0,done:false,route:'',t:0,bubble:'',flavor:B.flav[0],won:false};
  const A=juArena49(C);A.setMode('red',true);
  const G=window.GFX60,art=juArt49();A.acc=art.BC[bk];A.skin={leaf:bk==='nat'?'leaf':'orb'};G.skin({acc:art.BC[bk]});
  const V={hp:VMAX,dmgT:0,fury:false,end:false,bhpS:1};
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
    g60intro:{title:'Julgamento da Essência',sub:B.n,acc:art.BC[bk]},
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
      C.hud(G.chips([{icon:'alvo',label:B.n,tone:spareable()?'warn':null},{icon:'coracao',label:'Vital',value:`${S.hp}/${VMAX}`,tone:S.hp/VMAX<.34?'bad':null},{icon:'olho',label:'Lucidez',value:Math.round(S.luc)},{icon:'escudo',label:'Misericórdia',value:`${Math.min(100,Math.round(S.mercy))}%`,tone:spareable()?'ok':null},{icon:'relogio',label:'Turno',value:S.turn+1},S.fury&&{icon:'chama',label:'FÚRIA',tone:'bad'},S.st==='dodge'&&JUPAT49[S.pat]&&{icon:'raio',label:G.clean(JUPAT49[S.pat].n)}]))},
    draw(x){
      const now=performance.now(),t=now/1000,red=G.reduced(),acc=art.BC[bk],said=S.st==='text'&&/^"/.test(S.q[S.qi]||'');
      art.scene(x,bk,t,S.fury&&!(S.won&&S.done));
      if(S.luc<=0&&S.st==='dodge'){x.fillStyle=`rgba(80,0,120,${.25+(red?0:.1*Math.sin(now/150))})`;x.fillRect(0,0,W,H)}
      /* réu */
      const sx=S.shake>0&&!red?Math.sin(now/20)*8*S.shake:0,by=72+(red?0:Math.sin(now/700)*4),gone=S.won&&S.route==='f',calm=S.won&&S.route==='p';
      const fr=red?0:Math.floor(t*2.4)&1,img=art.boss(bk,S.fury&&!calm,fr),hurt=now-S.dmgT<130&&S.dmgN!=='ERROU';
      G.shadow(x,300+sx,132,110,{alt:Math.max(0,128-(by+64))*3,alpha:.55});
      G.glow(x,300+sx,by,88+(S.fury&&!red?Math.sin(now/90)*8:0),S.fury?'#ff3a2a':B.col,calm?.55:.32);
      x.save();x.globalAlpha=gone?.2:1;G.draw(x,hurt?G.tint(img,'#ffffff',.8):img,300+sx,by+68,{h:140,ay:1,sy:red?1:1+Math.sin(now/520)*.012});x.restore();
      if(S.won&&S.done&&!V.end){V.end=true;if(calm){G.emit('confete',300,70);G.emit('brilho',300,80,{col:'#ffe14a',amount:2})}else{G.emit('estilhacos',300,76,{col:B.col,amount:2,size:1.4});G.emit('fumaca',300,100,{amount:2});G.hitstop(130)}}
      if(S.fury&&!V.fury){V.fury=true;G.impact(300,76,{col:'#ff3a2a',force:1.6})}
      if(S.dmgT!==V.dmgT){V.dmgT=S.dmgT;if(S.dmgN!=='ERROU'){const cr=S.dmgN.startsWith('CR');G.impact(300,76,{col:cr?'#ffe14a':'#ff5a6a',force:cr?2:1})}}
      if(now-S.dmgT<260&&S.dmgN!=='ERROU'){const k=(now-S.dmgT)/260;x.save();x.globalCompositeOperation='lighter';x.strokeStyle=G.rgba('#ffffff',1-k);x.lineCap='round';x.lineWidth=7*(1-k)+1;x.beginPath();x.moveTo(250+k*20,30+k*10);x.lineTo(280+k*80,60+k*60);x.stroke();x.restore();G.rays(x,300,76,{n:9,len:110,col:'#fff3c0',a:(1-k)*.35,t:t*7})}
      G.hud.chip(x,300,143,{text:B.n.toUpperCase(),icon:spareable()?'coracao':(bk==='juiz'?'coroa':null),col:spareable()?'#ffe14a':acc,size:12,al:'center',min:10});
      /* vida do chefe ao golpear */
      V.bhpS+=(S.bhp/B.hp-V.bhpS)*.08;
      if(now-S.dmgT<1200||S.st==='fight'||S.st==='hit')G.hud.bar(x,210,155,180,8,S.bhp/B.hp,{col:'#7dffa8',bg:'#4a0c14',ghost:V.bhpS});
      if(now-S.dmgT<1100){const k=(now-S.dmgT)/1100;G.hud.text(x,S.dmgN,300,40-(now-S.dmgT)/40,{size:S.dmgN.startsWith('CR')?30:26,al:'center',w:900,col:S.dmgN==='ERROU'?'#bbb':S.dmgN.startsWith('CR')?'#ffe14a':'#ff4a5a',stroke:5})}
      /* fala do chefe */
      if(said){const L=(S.q[S.qi]||'').slice(0,Math.ceil(S.ch));x.save();x.fillStyle='rgba(0,0,0,.45)';rr21(x,391,33,200,92,12);x.fill();x.fillStyle='#fffaf0';rr21(x,388,28,200,92,12);x.fill();x.strokeStyle=acc;x.lineWidth=2.5;x.stroke();x.beginPath();x.moveTo(390,66);x.lineTo(368,78);x.lineTo(390,86);x.closePath();x.fillStyle='#fffaf0';x.fill();x.restore();
        const fs=Math.min(15,G.fs(13,10));wrap16(x,L,488,45,184,fs+3,'#1a0c14',fs)}
      /* caixa */
      if(S.st==='dodge'||S.st==='over'&&!S.won){A.draw(x,false,null)}
      else{const b={x:30,y:170,w:540,h:150};A.b={...b};A.tb={...b};art.boxFrame(x,b,acc);
        if(S.st==='text'&&!said)wrap16(x,(S.q[S.qi]||'').slice(0,Math.ceil(S.ch)),300,200,500,24,'#fff',18);
        else if(S.st==='text')wrap16(x,'* …',300,200,500,24,'#9a90a8',18);
        else if(S.st==='menu')wrap16(x,S.flavor,300,200,500,24,'#fff',18);
        else if(S.st==='act'||S.st==='item'){const L=S.st==='act'?B.acts.map(a=>a.n+(a.need&&!S.an?' ?':'')):S.items.map(i=>i.q?`${i.n} ×${i.q}`:'—');
          L.forEach((str,i)=>{const cx=b.x+40+(i%2)*270,cy=b.y+40+Math.floor(i/2)*60,on=i===S.sub,off=S.st==='item'&&!S.items[i].q;
            x.fillStyle=on?G.rgba('#ffe14a',.16):'rgba(255,255,255,.05)';rr21(x,cx-18,cy-22,248,44,9);x.fill();x.strokeStyle=on?'#ffe14a':'rgba(255,255,255,.16)';x.lineWidth=on?2:1;x.stroke();
            G.hud.text(x,str,cx+22,cy,{size:19,w:700,col:off?'#6a6070':on?'#ffe9a0':'#fff',stroke:0,max:200});if(on){G.glow(x,cx,cy,16,'#ff2a3d',.5);x.drawImage(art.heart('#ff2a3d'),cx-18,cy-18,36,36)}else{x.fillStyle=off?'#4a4054':acc;x.beginPath();x.arc(cx,cy,3,0,TAU16);x.fill()}});
          G.hud.text(x,S.st==='act'?'X volta · Analisar revela a fraqueza':'X volta',b.x+b.w-12,b.y+b.h-12,{size:12,al:'right',col:'#a89cb8',stroke:0,min:9})}
        else if(S.st==='fight'||S.st==='hit'){const fx0=b.x+30,fw=b.w-60,fy=b.y+40,fh=70;x.fillStyle='#0c0814';rr21(x,fx0-6,fy-6,fw+12,fh+12,fh/2);x.fill();x.strokeStyle=G.rgba(acc,.6);x.lineWidth=2;x.stroke();
          for(let i=0;i<30;i++){const k=1-Math.abs(i/29-.5)*2,hh=k*54+6;x.fillStyle=k>.88?'#ffe14a':G.mix('#7a1c2a','#5ae08a',k);rr21(x,fx0+i*fw/30+1,fy+fh/2-hh/2,fw/30-3,hh,3);x.fill()}
          G.glow(x,fx0+fw/2,fy+fh/2,46,'#ffe14a',.45);x.strokeStyle='#ffe14a';x.lineWidth=2.5;x.strokeRect(fx0+fw*.465,fy,fw*.07,fh);
          const cx=fx0+fw*S.bar;G.glow(x,cx,fy+fh/2,26,S.barOn?'#ffffff':'#ffe14a',.8,{sy:2});x.fillStyle=S.barOn?'#fff':'#ffe14a';rr21(x,cx-4,fy-8,8,fh+16,4);x.fill();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1.5;x.stroke();
          G.hud.text(x,'Aperte Z, Espaço ou toque no centro dourado',300,b.y+b.h-16,{size:13,al:'center',col:'#cfc4dc',max:520,min:9})}}
      if(S.hp<V.hp){G.hitstop(70,{zoom:.018});G.emit('estilhacos',A.soul.x,A.soul.y,{col:'#ff4a5a',size:.8,amount:.8});V.flash=now}V.hp=S.hp;
      if(now-(V.flash||0)<260)G.vignette(x,W,H,{a:.7*(1-(now-V.flash)/260),col:'#ff0030'});
      /* status */
      G.hud.panel(x,30,334,540,30,{acc,a:.85,r:8});
      G.hud.text(x,me.n.slice(0,12),44,350,{size:15,w:800,max:128});G.icon(x,'coracao',186,349,16,'#ff5b6b');G.hud.text(x,'VT',198,350,{size:12,w:800});G.hud.bar(x,220,343,100,13,S.hp/VMAX,{col:S.hp/VMAX<.34?'#ff6b4a':'#ffe14a',bg:'#600c14'});G.hud.text(x,`${S.hp} / ${VMAX}`,328,350,{size:14,w:700,max:78});
      G.icon(x,'olho',424,349,18,S.luc<30?'#ff7ac8':'#c58bff');G.hud.bar(x,440,343,116,13,S.luc/100,{col:S.luc<30?'#ff7ac8':'#c58bff',bg:'#302040'});
      if(S.st==='dodge'){const sm=A.soul.mode;G.hud.text(x,sm==='blue'?'Alma Azul: W/↑ pula':sm==='green'?'Alma Verde: setas viram o escudo':'Alma Vermelha: mova-se livre',300,379,{size:13,al:'center',col:sm==='blue'?'#8ab4ff':sm==='green'?'#6ff09a':'#ff9aa4'})}
      /* botões */
      BTN.forEach(([bx,l],i)=>{const on=(S.st==='menu'||S.st==='act'||S.st==='item')&&S.sel===i,gold=on||(i===3&&spareable()),col=gold?'#ffe14a':'#ff9b2f';
        if(i===3&&spareable())G.glow(x,bx+60,416,70,'#ffe14a',.35,{sy:.5});art.button(x,bx,394,120,44,on,acc);
        if(on&&S.st==='menu')x.drawImage(art.heart('#ff2a3d'),bx+4,398,36,36);else art.btnIcon(x,i,bx+22,416,col);G.hud.text(x,l,bx+76,417,{size:17,al:'center',w:900,col,max:76,stroke:2,min:9})});
      G.hud.frame(x,W,H,{acc,a:.5});
    }
  };
}

/* ---------- ⚔ PvP assimétrico: Arquiteto × Alma ---------- */
function juPvp49(C){
  const W=600,H=450,o=C.room.opt||{},RD=+o.rd||6,PL=C.players,ME=Math.max(0,PL.findIndex(p=>p.u===C.me)),OP=1-ME,opp=PL[OP]||{n:'?',c:0,u:'?'};
  const VT=40,K=window.__juT||1,T_TR=1.5*K,T_DG=12*K,T_CT=3.5*K,T_R=T_TR+T_DG+T_CT;
  const S={hp:[VT,VT],dealt:[0,0],en:35,r:-1,ph:'',bar:0,barOn:false,ctDone:false,ghost:{x:300,y:245,mode:'red',sh:0},cards:[],done:false,hits:0,dmgN:'',dmgT:0,lastSend:0,soulMode:[],ended:false};
  const A=juArena49(C);A.setMode('red',true);
  const G=window.GFX60,art=juArt49(),V={hp:[VT,VT],dmgT:0};A.acc='#ffe14a';G.skin({acc:'#ffe14a'});
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
    g60intro:{title:'Duelo de Almas',sub:'Arquiteto × Alma',acc:'#ffe14a'},
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
      C.hud(G.chips([{icon:'relogio',label:'Rodada',value:`${Math.min(RD,r+1)}/${RD}`},{icon:iAmAlma()?'coracao':'alvo',label:G.clean(role),tone:'warn'},{icon:'coracao',label:'Você',value:S.hp[ME]},{icon:'caveira',label:opp.n,value:S.hp[OP]},!iAmAlma()&&{icon:'raio',label:'Energia',value:Math.floor(S.en),tone:'ok'}]))},
    draw(x){const now=performance.now(),t=now/1000;art.scene(x,'juiz',t,false);
      const dg=S.ph==='dg';x.fillStyle=`rgba(5,3,10,${dg?.55:.35})`;x.fillRect(0,0,W,H);
      const bar=(i,X,lbl)=>{const L=i?X-186:X-8;G.hud.panel(x,L,8,194,44,{acc:mgCol(PL[i]?.c??0),a:.9,r:8});G.hud.text(x,lbl,i?X-8:X+8,22,{size:14,w:800,al:i?'right':'left',col:mgCol(PL[i]?.c??0),max:160});
        const bx=i?X-170:X+20;G.icon(x,'coracao',i?X-6:X+4,39,15,'#ff5b6b');G.hud.bar(x,bx,34,150,10,S.hp[i]/VT,{col:'#ffe14a',bg:'#600c14'});mgCat(x,PL[i]?.c??0,i?W-32:32,78,40,'',{flip:!!i})};
      bar(0,16,`${PL[0]?.n||'?'} · ${S.hp[0]}`);bar(1,W-16,`${S.hp[1]} · ${PL[1]?.n||'?'}`);
      const al=S.r>=0?PL[alma(S.r)]:null;
      if(Date.now()>=C.t0){if(S.ph==='tr')G.hud.banner(x,W,H,`Rodada ${S.r+1}`,{sub:`${al?.n||'?'} é a Alma`,acc:'#ffe14a',y:170});else G.hud.chip(x,W/2,72,{icon:S.ph==='ct'?'raio':'relogio',text:S.ph==='ct'?`Contra-ataque de ${al?.n||'?'}!`:`Rodada ${S.r+1}/${RD}`,col:'#ffe14a',size:14,al:'center'})}
      [0,1].forEach(i=>{if(S.hp[i]<V.hp[i]){const X=i?W-110:110;G.emit('estilhacos',X,40,{col:'#ff4a5a',size:.8});if(i===ME)G.hitstop(70,{zoom:.018})}V.hp[i]=S.hp[i]});
      if(S.dmgT!==V.dmgT){V.dmgT=S.dmgT;if(S.dmgN!=='ERROU')G.impact(W/2,150,{col:'#ff5a6a',force:1.2})}
      if(S.ph==='dg'){A.draw(x,!iAmAlma(),null);const k=S.cards.filter(c=>now-c.t<1500);k.forEach((c,i)=>G.hud.chip(x,W/2,100+i*24,{icon:'alvo',text:G.clean(c.n),col:'#ff8aa0',size:13,al:'center',min:10}))}
      if(S.ph==='ct'){const fx0=60,fw=480,fy=190,fh=60;x.fillStyle='#0c0814';rr21(x,fx0-6,fy-6,fw+12,fh+12,fh/2);x.fill();x.strokeStyle='rgba(255,225,74,.6)';x.lineWidth=2;x.stroke();
        for(let i=0;i<30;i++){const k=1-Math.abs(i/29-.5)*2,hh=k*44+6;x.fillStyle=k>.88?'#ffe14a':G.mix('#7a1c2a','#5ae08a',k);rr21(x,fx0+i*fw/30+1,fy+fh/2-hh/2,fw/30-3,hh,3);x.fill()}
        G.glow(x,fx0+fw/2,fy+fh/2,42,'#ffe14a',.45);x.strokeStyle='#ffe14a';x.lineWidth=2.5;x.strokeRect(fx0+fw*.465,fy,fw*.07,fh);G.glow(x,fx0+fw*S.bar,fy+fh/2,24,'#ffffff',.8,{sy:2});x.fillStyle=S.barOn?'#fff':'#ffe14a';rr21(x,fx0+fw*S.bar-4,fy-8,8,fh+16,4);x.fill();
        G.hud.text(x,iAmAlma()?'Z, Espaço ou toque: golpeie no centro!':`${al?.n||'?'} está contra-atacando…`,W/2,282,{size:14,al:'center',col:'#e0d8ec',max:W-30})}
      if(now-S.dmgT<1100)G.hud.text(x,S.dmgN,W/2,150-(now-S.dmgT)/40,{size:28,al:'center',w:900,col:'#ff4a5a',stroke:5});
      if(!iAmAlma()&&S.ph!=='ct'){G.icon(x,'raio',13,345,15,'#ffe14a');G.hud.text(x,`Energia ${Math.floor(S.en)}`,26,345,{size:12,col:'#ffe14a'});G.hud.bar(x,8,357,584,9,S.en/100,{col:'#ffe14a',bg:'#302040',segs:20});
        JUCARD49.forEach((c,i)=>{const bx=6+i*84,ok=S.en>=c.c&&S.ph==='dg',md=JUSOUL49(c.k),cc=md==='green'?'#5fe08a':md==='blue'?'#6a9bff':c.k==='muroL'?'#ff9b2f':c.k==='muro'?'#3ab0ff':'#ffb3c0';
          if(ok)G.glow(x,bx+40,412,48,'#ffe14a',.18);const g=x.createLinearGradient(0,378,0,442);g.addColorStop(0,ok?'#4a3668':'#221a30');g.addColorStop(1,ok?'#1c1030':'#120e1a');rr21(x,bx,378,80,64,8);x.fillStyle=g;x.fill();x.strokeStyle=ok?'#ffe14a':'#4a4456';x.lineWidth=2;x.stroke();rr21(x,bx+4,382,72,56,5);x.strokeStyle='rgba(255,240,200,.14)';x.lineWidth=1;x.stroke();
          x.globalAlpha=ok?1:.45;G.icon(x,['seta','gota','escudo','escudo','espiral','raio','folha'][i],bx+62,392,15,cc);x.globalAlpha=1;
          G.hud.text(x,`${i+1}`,bx+10,392,{size:11,col:'#c8bcd8',stroke:0,min:9});G.hud.text(x,G.clean(c.n),bx+40,409,{size:12,al:'center',w:800,col:ok?'#fff':'#7a7288',max:74,min:9});G.icon(x,'raio',bx+27,428,13,ok?'#ffe14a':'#6a6478');G.hud.text(x,String(c.c),bx+38,429,{size:13,w:900,col:ok?'#ffe14a':'#6a6478',min:10})})}
      else if(iAmAlma()&&S.ph==='dg'){const sm=A.soul.mode;G.hud.text(x,sm==='blue'?'Alma Azul: W/↑ pula':sm==='green'?'Alma Verde: setas viram o escudo':'Desvie! Branco desvia · AZUL parado · LARANJA mexendo',W/2,402,{size:14,al:'center',col:'#e8e0f4',max:W-30})}
      G.hud.frame(x,W,H,{acc:'#ffe14a',a:.5});}
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

