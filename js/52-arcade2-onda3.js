/* ===================================================================
   TULPA · ETAPA 42 — 🕹 ARCADE 2.0 · ONDA 3 (parte 1)
   🏎 CORRIDA DO VÉU 2.0
   4 pistas (Anel da Fé, Bosque das Raízes, Lago Congelado, Labirinto de
   Espelhos) com curvas fechadas, lama e gelo (menos tração), rampas de
   turbo e atalhos secretos. Corrida única ou Copa de 3 pistas com
   tabela de pontos. Drift com mini-turbo em 3 níveis (Azul → Laranja →
   Roxo). Caixas de Ritual balanceadas pela posição: Fumaça de Ilusão,
   Raízes da Natureza, Turbo de Sol, Escudo de Verdade, Orbe Perseguidor
   de Fé e Pulso de Inexistência. 3 voltas, volta final acelerada.
   A física do carro é pura (ktDrive42) para o teste dirigir sozinho.
   =================================================================== */
const KT42=[
  {n:'Anel da Fé',ico:'🕯',c:'#ffd36b',grass:'#22301a',ctrl:[[250,230],[650,150],[1100,170],[1420,360],[1380,720],[1050,880],[620,880],[280,760],[160,480]],zones:[],pads:[[.06,0],[.4,-26],[.4,26],[.72,0]],cuts:[[.47,.66]]},
  {n:'Bosque das Raízes',ico:'🌿',c:'#7dffa8',grass:'#132a18',ctrl:[[200,200],[600,150],[760,420],[980,170],[1400,240],[1430,600],[1150,860],[820,700],[560,900],[220,820],[300,560]],zones:[[.2,.28,'mud'],[.62,.7,'mud']],pads:[[.04,0],[.47,0]],cuts:[[.11,.27,'mud']]},
  {n:'Lago Congelado',ico:'🕳',c:'#b9e6ff',grass:'#1c2433',ctrl:[[300,180],[1000,150],[1420,330],[1200,520],[1440,800],[900,900],[600,680],[300,890],[150,520]],zones:[[.12,.3,'ice'],[.56,.76,'ice']],pads:[[.05,0],[.4,0],[.85,0]],cuts:[[.42,.52]]},
  {n:'Labirinto de Espelhos',ico:'🪞',c:'#ff9be0',grass:'#2a1630',ctrl:[[220,170],[520,300],[820,150],[1120,300],[1420,170],[1450,520],[1150,560],[1400,880],[900,900],[650,700],[400,900],[150,650],[260,420]],zones:[[.3,.35,'mud'],[.72,.77,'ice']],pads:[[.02,0],[.25,0],[.55,0]],cuts:[[.06,.16],[.75,.84]]},
];
const CUPS42=[{n:'Copa Elemental',ico:'🏆',tr:[0,1,2]},{n:'Copa do Abismo',ico:'🌀',tr:[1,2,3]}];
const KTP42=[10,7,5,3,2,1];
const SURF42={road:{vmax:320,acc:420,grip:9},mud:{vmax:185,acc:260,grip:7},ice:{vmax:310,acc:300,grip:1.4},off:{vmax:130,acc:300,grip:6}};
const ITEM42={smoke:{n:'Fumaça de Ilusão',ico:'🌫'},roots:{n:'Raízes da Natureza',ico:'🌿'},sun:{n:'Turbo de Sol',ico:'☀'},shield:{n:'Escudo de Verdade',ico:'🛡'},orb:{n:'Orbe Perseguidor de Fé',ico:'✶'},pulse:{n:'Pulso de Inexistência',ico:'◐'}};
const KTW42=1600,KTH42=1050,KTTW42=120,KTCW42=64;
function ktTrack42(i){
  const T=KT42[i],ctrl=T.ctrl,n=ctrl.length,pts=[];
  for(let k=0;k<n;k++){const p0=ctrl[(k-1+n)%n],p1=ctrl[k],p2=ctrl[(k+1)%n],p3=ctrl[(k+2)%n];for(let j=0;j<24;j++){const t=j/24,t2=t*t,t3=t2*t;pts.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  const N=pts.length,zone=new Array(N).fill('road');
  T.zones.forEach(([a,b,s])=>{for(let k=Math.floor(a*N);k<Math.floor(b*N);k++)zone[k]=s});
  const dir=k=>{const p=pts[k%N],q=pts[(k+1)%N];return Math.atan2(q[1]-p[1],q[0]-p[0])};
  const pads=T.pads.map(([f,o])=>{const k=Math.floor(f*N),a=dir(k),p=pts[k];return{x:p[0]-Math.sin(a)*o,y:p[1]+Math.cos(a)*o,a}});
  const cuts=T.cuts.map(([a,b,s])=>{const i0=Math.floor(a*N),i1=Math.floor(b*N),p=pts[i0],q=pts[i1],L=Math.hypot(q[0]-p[0],q[1]-p[1]),m=Math.max(2,Math.round(L/14)),path=[];for(let k=0;k<=m;k++)path.push([p[0]+(q[0]-p[0])*k/m,p[1]+(q[1]-p[1])*k/m]);return{i0,i1,path,surf:s||'road',len:L}});
  const boxes=[.15,.38,.63,.88].map(f=>{const k=Math.floor(f*N),a=dir(k),p=pts[k];return[-32,0,32].map(o=>({x:p[0]-Math.sin(a)*o,y:p[1]+Math.cos(a)*o,t:0}))}).flat();
  const curv=pts.map((_,k)=>{let d=dir(k+10)-dir(k);while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d});
  return{i,T,pts,N,zone,pads,cuts,boxes,dir,curv,ang0:dir(0)};
}
function ktNear42(K,x,y,hint){let best=hint??0,bd=1e18;const full=hint==null;const r=full?K.N:40;
  for(let k=full?0:-r;k<(full?K.N:r+1);k++){const i=full?k:((hint+k)%K.N+K.N)%K.N,p=K.pts[i],d=(p[0]-x)**2+(p[1]-y)**2;if(d<bd){bd=d;best=i}}return[best,Math.sqrt(bd)]}
function ktSurf42(K,r){
  let[idx,dist]=ktNear42(K,r.x,r.y,r.idx);if(dist>KTTW42)[idx,dist]=ktNear42(K,r.x,r.y,null);r.near=idx;r.dist=dist;
  if(dist<=KTTW42/2)return K.zone[idx];
  for(const c of K.cuts){for(const p of c.path)if((p[0]-r.x)**2+(p[1]-r.y)**2<(KTCW42/2)**2){r.onCut=c;return c.surf}}
  return'off';
}
function ktCar42(K,u,n,c,k,bot){const a=K.ang0,px=-Math.sin(a),py=Math.cos(a),lane=(k%2?1:-1)*26,back=Math.floor(k/2)*44+30,p=K.pts[0];
  return{u,n,c,bot,x:p[0]-Math.cos(a)*back+px*lane,y:p[1]-Math.sin(a)*back+py*lane,a,vx:0,vy:0,idx:K.N-2,prog:-2,lap:0,done:false,ft:0,item:null,boost:0,slow:0,spin:0,stun:0,sun:0,sh:0,smoke:0,dr:0,ch:0,lvl:0,near:0,dist:0,onCut:null,cutUsed:0,cut:null,cutK:0}}
/* física do carro: inp = {up, dn, l, r, drift} */
function ktDrive42(K,r,inp,dt,o={}){
  const fl=o.final?1.05:1,LAPS=o.laps||3;r.ev='';
  if(r.done){r.vx*=.97;r.vy*=.97;r.x+=r.vx*dt;r.y+=r.vy*dt;return}
  r.onCut=null;let s=ktSurf42(K,r);if(s==='off'&&r.sun>0)s='road';
  if(r.onCut&&r.cutUsed!==r.onCut.i0){r.cutUsed=r.onCut.i0;r.ev='cut'}
  let d=r.near-r.idx;if(d<-K.N/2)d+=K.N;if(d>K.N/2)d-=K.N;r.idx=r.near;r.prog+=d;
  if(r.prog>=K.N){r.prog-=K.N;r.lap++;r.ev=r.lap>=LAPS?'finish':r.lap===LAPS-1?'final':'lap';if(r.lap>=LAPS){r.done=true;r.ft=o.t||0}}
  ['boost','slow','spin','stun','sun','smoke'].forEach(k=>r[k]=Math.max(0,r[k]-dt));
  const M=SURF42[s],steer=(inp.r?1:0)-(inp.l?1:0);
  if(r.spin>0){r.a+=9*dt;r.vx*=1-2.4*dt;r.vy*=1-2.4*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.dr=0;r.ch=0;return}
  if(r.stun>0){r.vx*=1-6*dt;r.vy*=1-6*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;return}
  let fwd=r.vx*Math.cos(r.a)+r.vy*Math.sin(r.a);
  /* drift e mini-turbo */
  if(inp.drift&&!r.dr&&fwd>170&&steer){r.dr=steer;r.ch=0}
  if(r.dr&&(!inp.drift||fwd<110)){const lv=r.ch>=1.5?3:r.ch>=.9?2:r.ch>=.4?1:0;if(lv){r.boost=Math.max(r.boost,[0,.55,.95,1.45][lv]);r.ev='mt'+lv}r.dr=0;r.ch=0}
  const k=Math.min(1,Math.abs(fwd)/160);
  if(r.dr){r.ch+=dt*(steer===r.dr?1.3:.6);r.lvl=r.ch>=1.5?3:r.ch>=.9?2:r.ch>=.4?1:0;r.a+=(steer*2.2+r.dr*1.5)*dt*k}
  else{r.lvl=0;r.a+=steer*2.8*dt*k*Math.sign(fwd||1)}
  const fx=Math.cos(r.a),fy=Math.sin(r.a);fwd=r.vx*fx+r.vy*fy;let lat=-r.vx*fy+r.vy*fx;
  const vmax=M.vmax*(r.boost>0?1.45:1)*(r.slow>0?.55:1)*(r.bot?o.bot||1:1)*fl;
  if(inp.up)fwd+=M.acc*(r.boost>0?1.6:1)*dt;else if(inp.dn)fwd-=(fwd>0?560:260)*dt;else fwd*=1-1*dt;
  if(r.boost>0&&fwd<vmax*.9)fwd+=300*dt;
  fwd=Math.max(-110,Math.min(vmax,fwd));if(fwd>vmax)fwd=vmax;
  lat*=Math.exp(-M.grip*(r.dr?.22:1)*dt);
  r.vx=fx*fwd-fy*lat;r.vy=fy*fwd+fx*lat;
  r.x=Math.max(10,Math.min(KTW42-10,r.x+r.vx*dt));r.y=Math.max(10,Math.min(KTH42-10,r.y+r.vy*dt));
  for(const p of K.pads)if((p.x-r.x)**2+(p.y-r.y)**2<22*22&&r.boost<.9){r.boost=1;r.ev=r.ev||'pad'}
}
const ktTotal42=(K,r)=>r.lap*K.N+r.prog;
/* direção automática (Perseus e teste) */
function ktBot42(K,r,o={}){
  const sp=Math.hypot(r.vx,r.vy);
  if(r.cut){const P=r.cut.path;let nb=r.cutK,bd=1e18;P.forEach((p,k)=>{const d=(p[0]-r.x)**2+(p[1]-r.y)**2;if(d<bd){bd=d;nb=k}});r.cutK=Math.max(r.cutK,nb);if(r.cutK>=P.length-2||bd>90*90)r.cut=null}
  if(!r.cut&&o.cuts)for(const c of K.cuts){const dd=(c.i0-r.idx+K.N)%K.N;if(dd>2&&dd<8&&(o.cutP??1)>Math.random()){r.cut=c;r.cutK=0}}
  let tgt;if(r.cut){const P=r.cut.path;tgt=P[Math.min(P.length-1,r.cutK+3)]}
  else{const la=6+Math.floor(sp/45);tgt=K.pts[(r.idx+la)%K.N]}
  const ta=Math.atan2(tgt[1]-r.y,tgt[0]-r.x);let da=ta-r.a;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
  const cv=Math.max(...[2,6,10,14].map(j=>Math.abs(K.curv[(r.idx+j)%K.N]))),z=K.zone[(r.idx+8)%K.N];
  let tv=cv>1.3?150:cv>.9?190:cv>.6?235:400;if(z==='ice')tv=Math.min(tv,cv>.4?170:260);if(z==='mud')tv=Math.min(tv,185);
  const drift=!!o.drift&&!r.cut&&z!=='ice'&&K.zone[r.idx]!=='ice'&&cv>.55&&cv<1.3&&sp>200&&Math.abs(da)<.7;
  return{up:sp<tv,dn:sp>tv+50,l:da<-.05,r:da>.05,drift:drift?(r.dr||(da>0?1:-1)):false};
}
T3.kt42={tracks:KT42,cups:CUPS42,track:ktTrack42,car:ktCar42,drive:ktDrive42,bot:ktBot42,total:ktTotal42};
function ktProg42(){const p=prog38().kt||{};return{best:p.best||{},cups:p.cups||{}}}

const ktSetup42={
  intro:o=>o._m==='mesa'?'Todos correm juntos; os outros aparecem como fantasmas. Na Copa, a tabela soma os pontos das 3 pistas.':'Contra 3 Perseus. Corrida única ou Copa de 3 pistas com pontos 10, 7, 5 e 3.',
  def:()=>({m:'race',tr:'0',cup:'0'}),
  fields:o=>{const p=ktProg42();const F=[{k:'m',l:'Modo',opts:[{v:'race',n:'Corrida única',ico:'🏁',d:'Uma pista, 3 voltas.'},{v:'cup',n:'Copa de 3 pistas',ico:'🏆',d:'Três corridas seguidas com tabela de pontos.'}]}];
    if(o.m==='cup')F.push({k:'cup',l:'Copa',opts:CUPS42.map((c,i)=>({v:String(i),n:c.n,ico:c.ico,d:c.tr.map(t=>KT42[t].n).join(' → '),badge:p.cups[i]?'🏆':''}))});
    else F.push({k:'tr',l:'Pista',wide:1,opts:KT42.map((T,i)=>({v:String(i),n:T.n,ico:T.ico,d:[T.zones.some(z=>z[2]==='mud')?'lama':'',T.zones.some(z=>z[2]==='ice')?'gelo':'',`${T.pads.length} turbos`,`${T.cuts.length} atalho${T.cuts.length>1?'s':''} secreto${T.cuts.length>1?'s':''}`].filter(Boolean).join(' · '),badge:p.best[i]?`⏱ ${p.best[i].toFixed(1)} s`:''}))});
    return F},
  fix:o=>{if(!['race','cup'].includes(o.m))o.m='race';o.tr=String(Math.max(0,Math.min(3,+o.tr||0)));o.cup=String(Math.max(0,Math.min(1,+o.cup||0)))},
  sum:()=>'W/↑ acelera · S/↓ freia · A/D viram · segure Shift ou K numa curva para o drift (Azul → Laranja → Roxo) e solte para o mini-turbo · E ou Espaço usa o item.'
};

/* ---------- 🎨 arte da Corrida do Véu (GFX60) · SOMENTE VISUAL ----------
   Direção: maquete de rali vista de cima, com sombras curtas, zebras e
   cenário próprio por pista. A pista continua com a mesma largura, zonas,
   atalhos e turbos; o enfeite fica sempre fora do asfalto. */
const KTART42=[
  {tile:'grama',a:'#37461f',b:'#c9b45a',kerb:['#fff0c0','#d99a22'],road:'#433645',amb:'poeira',ambc:'#ffe6a0'},
  {tile:'grama',a:'#14341c',b:'#5aa050',kerb:['#e8ffd8','#2f8a4a'],road:'#3a3440',amb:'folhas',ambc:'#6fcf6a'},
  {tile:'areia',a:'#7e93b4',b:'#3a4a6e',kerb:['#ffffff','#3a7ac0'],road:'#2c3246',amb:'neve',ambc:'#ffffff'},
  {tile:'cristal',a:'#251032',b:'#6a3a80',kerb:['#ffe0f6','#c0388e'],road:'#35283e',amb:'motes',ambc:'#ffc0ee'},
];
function ktArt42(){
  const G=window.GFX60,TAU=Math.PI*2,KW=KTW42,KH=KTH42,TW=KTTW42;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const oval=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,stops)=>{const q=g.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>q.addColorStop(i/(stops.length-1),c));return q};
  const rr=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  /* ===== enfeites fora da pista (vistos de cima) ===== */
  const DECO=[
    (g,X,Y,r)=>{const q=r();if(q<.18){oval(g,X+8,Y+10,26,20,'rgba(0,0,0,.35)');g.fillStyle='#b8905a';g.fillRect(X-22,Y-9,44,18);g.fillRect(X-9,Y-22,18,44);G.poly(g,[[X-22,Y-9],[X+22,Y-9],[X,Y]],'#e0b878');G.poly(g,[[X-9,Y-22],[X+9,Y-22],[X,Y]],'#d0a468');disc(g,X,Y,6,'#ffe08a');G.glow(g,X,Y,30,'#ffc040',.5)}
      else if(q<.5){for(let i=0;i<5;i++){const x=X+(r()-.5)*44,y=Y+(r()-.5)*34;g.fillStyle='#f0e0b0';g.fillRect(x-1.5,y-4,3,7);G.glow(g,x,y-5,11,'#ffb030',.85)}}
      else if(q<.8){for(let i=0;i<12;i++){const x=X+(r()-.5)*52,y=Y+(r()-.5)*40;disc(g,x,y,2.6,r()<.5?'#ffe070':'#fff4d0');disc(g,x,y,1,'#a86a10')}}
      else{oval(g,X+6,Y+7,18,13,'rgba(0,0,0,.35)');oval(g,X,Y,17,13,'#7a6a48',r()*3);oval(g,X-4,Y-4,8,5,'#a89870',.4)}},
    (g,X,Y,r)=>{const q=r();if(q<.66){const R=18+r()*20;oval(g,X+R*.45,Y+R*.55,R,R*.85,'rgba(0,0,0,.4)');disc(g,X,Y,R,'#123a20');for(let i=0;i<9;i++){const a=r()*TAU,d=r()*R*.75;disc(g,X+Math.cos(a)*d,Y+Math.sin(a)*d,R*(.22+r()*.22),i%3?'#1e5a30':'#2e7a40')}disc(g,X-R*.3,Y-R*.34,R*.2,'rgba(160,240,150,.35)')}
      else if(q<.84){for(let i=0;i<3;i++){const x=X+(r()-.5)*34,y=Y+(r()-.5)*28,R=4+r()*5;oval(g,x+2,y+3,R,R*.8,'rgba(0,0,0,.4)');disc(g,x,y,R,'#d8503a');disc(g,x-R*.3,y-R*.3,R*.25,'#fff0e0');disc(g,x+R*.35,y+R*.15,R*.18,'#fff0e0')}}
      else{for(let i=0;i<4;i++){const a=r()*TAU;g.strokeStyle='#3a2814';g.lineWidth=6-i;g.beginPath();g.moveTo(X,Y);g.quadraticCurveTo(X+Math.cos(a+.8)*22,Y+Math.sin(a+.8)*22,X+Math.cos(a)*34,Y+Math.sin(a)*34);g.stroke()}disc(g,X,Y,8,'#4a341c');disc(g,X,Y,4,'#8a6a40')}},
    (g,X,Y,r)=>{const q=r();if(q<.58){const R=15+r()*17;oval(g,X+R*.5,Y+R*.6,R,R*.8,'rgba(10,20,50,.35)');for(let k=0;k<3;k++){const s=R*(1-k*.28),rot=r()*1;g.fillStyle=['#12343c','#1c4a52','#e8f4ff'][k];g.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16+rot,d=i%2?s*.62:s;g.lineTo(X+Math.cos(a)*d-k*1.5,Y+Math.sin(a)*d-k*1.5)}g.closePath();g.fill()}}
      else if(q<.8){oval(g,X+6,Y+7,17,12,'rgba(10,20,50,.35)');oval(g,X,Y,17,12,'#56648a',r()*3);oval(g,X-3,Y-4,12,6,'#f0f8ff',.3)}
      else{const R=22+r()*18;oval(g,X,Y,R+4,R*.7+4,'#dcecff');oval(g,X,Y,R,R*.7,'#5a8ac0');line(g,[[X-R*.6,Y],[X-R*.1,Y-R*.2],[X+R*.4,Y+R*.1]],'rgba(255,255,255,.7)',1.5);oval(g,X-R*.3,Y-R*.25,R*.25,R*.1,'rgba(255,255,255,.55)',-.4)}},
    (g,X,Y,r)=>{const q=r();if(q<.45){for(let i=0;i<4;i++){const x=X+(r()-.5)*30,s=8+r()*12,y=Y+(r()-.5)*20;oval(g,x+6,y+4,s*.7,s*.35,'rgba(0,0,0,.4)');G.poly(g,[[x-s*.5,y],[x,y-s*1.7],[x+s*.5,y],[x,y+s*.45]],i%2?'#c060d8':'#7a50d0');G.poly(g,[[x-s*.5,y],[x,y-s*1.7],[x,y+s*.45]],'rgba(255,225,255,.38)')}G.glow(g,X,Y,38,'#ff80e0',.3)}
      else if(q<.75){const R=14+r()*16,rot=r()*TAU;g.save();g.translate(X,Y);g.rotate(rot);oval(g,6,7,R*.65,R,'rgba(0,0,0,.4)');oval(g,0,0,R*.65+4,R+4,'#d0a0c8');oval(g,0,0,R*.65,R,vg(g,-R,R,['#f4e0ff','#6a4a9a']));G.poly(g,[[-R*.35,-R*.3],[-R*.05,-R*.6],[-R*.3,R*.3]],'rgba(255,255,255,.7)');g.restore()}
      else{for(let i=0;i<6;i++){const x=X+(r()-.5)*50,y=Y+(r()-.5)*40;G.poly(g,[[x-5,y],[x,y-3],[x+6,y+1],[x,y+4]],'rgba(255,210,245,.55)')}}},
  ];
  /* pista inteira pintada uma vez por instância (1600×1050) */
  function track(K){
    const A=KTART42[K.i]||KTART42[0],c=document.createElement('canvas');c.width=KW;c.height=KH;const x=c.getContext('2d'),r=G.rng(K.i*977+31);
    G.fillTile(x,G.tile(A.tile,{size:96,a:A.a,b:A.b,seed:K.i+5}),0,0,KW,KH);
    for(let i=0;i<70;i++){const X=r()*KW,Y=r()*KH,R=60+r()*150,dk=r()<.6;const q=x.createRadialGradient(X,Y,0,X,Y,R);q.addColorStop(0,dk?'rgba(0,0,0,.26)':'rgba(255,255,255,.1)');q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(X-R,Y-R,R*2,R*2)}
    /* enfeites longe do asfalto e dos atalhos */
    const free=(X,Y)=>ktNear42(K,X,Y,null)[1]>TW/2+48&&!K.cuts.some(cu=>cu.path.some(p=>(p[0]-X)**2+(p[1]-Y)**2<(KTCW42/2+46)**2));
    for(let gy=40;gy<KH;gy+=88)for(let gx=40;gx<KW;gx+=88){const X=gx+(r()-.5)*56,Y=gy+(r()-.5)*56;if(r()<.62&&free(X,Y))DECO[K.i](x,X,Y,r)}
    const trace=pts=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]))},path=()=>{trace(K.pts);x.closePath()};
    x.lineJoin='round';x.lineCap='round';
    /* atalhos secretos: trilha discreta */
    K.cuts.forEach(cu=>{trace(cu.path);x.strokeStyle='rgba(255,255,255,.09)';x.lineWidth=KTCW42+7;x.stroke();x.strokeStyle=cu.surf==='mud'?'#4a3420':'#2e2638';x.lineWidth=KTCW42;x.stroke();
      cu.path.forEach(p=>{for(let k=0;k<5;k++)disc(x,p[0]+(r()-.5)*KTCW42*.8,p[1]+(r()-.5)*KTCW42*.8,1+r()*2,r()<.5?'rgba(0,0,0,.35)':'rgba(255,255,255,.1)')});
      x.setLineDash([4,14]);x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;x.stroke();x.setLineDash([])});
    /* sombra, acostamento, zebras e asfalto */
    x.save();x.translate(7,10);path();x.strokeStyle='rgba(0,0,0,.32)';x.lineWidth=TW+20;x.stroke();x.restore();
    path();x.strokeStyle='#120c18';x.lineWidth=TW+20;x.stroke();path();x.strokeStyle=A.kerb[0];x.lineWidth=TW+15;x.stroke();
    x.lineCap='butt';path();x.setLineDash([20,20]);x.strokeStyle=A.kerb[1];x.lineWidth=TW+15;x.stroke();x.setLineDash([]);x.lineCap='round';
    path();x.strokeStyle='#e8e0f0';x.lineWidth=TW+3;x.stroke();path();x.strokeStyle=A.road;x.lineWidth=TW-1;x.stroke();
    path();x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=TW-40;x.stroke();path();x.strokeStyle='rgba(0,0,0,.09)';x.lineWidth=TW-74;x.stroke();
    const around=(k,off)=>{const a=K.dir(k),p=K.pts[k%K.N];return[p[0]-Math.sin(a)*off,p[1]+Math.cos(a)*off]};
    for(let k=0;k<K.N;k++)for(let j=0;j<9;j++){const[X,Y]=around(k,(r()-.5)*(TW-10));x.fillStyle=r()<.5?'rgba(0,0,0,.22)':'rgba(255,255,255,.1)';x.fillRect(X+(r()-.5)*14,Y+(r()-.5)*14,1+r()*2,1+r()*2)}
    for(let m=0;m<14;m++){const k0=Math.floor(r()*K.N),off=(r()-.5)*56,len=8+Math.floor(r()*16);for(const d of[-6,6]){trace(Array.from({length:len},(_,i)=>around(k0+i,off+d+Math.sin(i/5)*5)));x.strokeStyle='rgba(8,4,12,.2)';x.lineWidth=3;x.stroke()}}
    const seg=(a,b,col,lw)=>{x.beginPath();for(let k=a;k<=b;k++){const p=K.pts[k%K.N];k===a?x.moveTo(p[0],p[1]):x.lineTo(p[0],p[1])}x.strokeStyle=col;x.lineWidth=lw;x.stroke()};
    K.T.zones.forEach(([a,b,s])=>{const i0=Math.floor(a*K.N),i1=Math.floor(b*K.N),mud=s==='mud';seg(i0,i1,mud?'#6a4826':'#b4def2',TW-4);seg(i0,i1,mud?'#533418':'#cdeefc',TW-30);
      for(let k=i0;k<=i1;k++)for(let j=0;j<3;j++){const[X,Y]=around(k,(r()-.5)*(TW-34));
        if(mud){const R=3+r()*9;oval(x,X,Y,R,R*.65,r()<.5?'#38220e':'#7a5630',r()*3);if(r()<.3)oval(x,X-R*.25,Y-R*.2,R*.35,R*.18,'rgba(255,230,190,.32)')}
        else if(r()<.5)line(x,[[X,Y],[X+(r()-.5)*26,Y+(r()-.5)*26],[X+(r()-.5)*38,Y+(r()-.5)*38]],r()<.5?'rgba(255,255,255,.9)':'rgba(80,140,190,.55)',1.2);
        else{x.fillStyle='rgba(255,255,255,.85)';x.fillRect(X-3,Y-.6,6,1.2);x.fillRect(X-.6,Y-3,1.2,6)}}});
    path();x.setLineDash([18,18]);x.strokeStyle='rgba(255,255,255,.26)';x.lineWidth=3;x.stroke();x.setLineDash([]);
    K.pads.forEach(p=>{x.save();x.translate(p.x,p.y);x.rotate(p.a);G.glow(x,0,0,44,'#ffb830',.55);rr(x,-23,-19,46,38,8);x.fillStyle='#241606';x.fill();x.strokeStyle='#ffd36b';x.lineWidth=2;x.stroke();
      for(let k=0;k<3;k++)G.poly(x,[[-17+k*11,-13],[-8+k*11,0],[-17+k*11,13],[-12+k*11,13],[-3+k*11,0],[-12+k*11,-13]],['#ff9b3d','#ffd36b','#fff2bc'][k]);x.restore()});
    /* largada quadriculada com postes */
    const p0=K.pts[0];x.save();x.translate(p0[0],p0[1]);x.rotate(K.ang0);for(let col=0;col<2;col++)for(let k=-6;k<6;k++){x.fillStyle=(k+col)&1?'#ffffff':'#14101a';x.fillRect(-10+col*10,k*10,10,10)}
    for(const s of[-1,1]){const y=s*(TW/2+16);oval(x,6,y+7,13,13,'rgba(0,0,0,.4)');disc(x,0,y,13,'#2a2038');disc(x,0,y,9,A.kerb[1]);disc(x,-2,y-2,4,'#ffffff');G.glow(x,0,y,36,'#fff0c0',.45)}x.restore();
    return c;
  }
  /* ===== kart visto de cima (frente para +x) ===== */
  const car=ci=>{const col=mgCol(ci);return G.bake(`kt:car:${col}`,52,36,g=>{g.translate(26,18);
    for(const[X,Y]of[[-14,-13],[11,-13],[-14,13],[11,13]]){rr(g,X-7,Y-4,14,8,3);g.fillStyle='#0c0a10';g.fill();g.fillStyle='#5a5666';g.fillRect(X-4,Y-1,8,2)}
    g.fillStyle='#1a1424';g.fillRect(-21,-13,5,26);g.fillStyle=G.shade(col,.25);g.fillRect(-21,-13,2,26);
    g.beginPath();g.moveTo(-17,-9);g.quadraticCurveTo(-4,-13,8,-9);g.quadraticCurveTo(22,-6,22,0);g.quadraticCurveTo(22,6,8,9);g.quadraticCurveTo(-4,13,-17,9);g.closePath();g.fillStyle=vg(g,-11,11,[G.shade(col,.5),col,G.shade(col,-.5)]);g.fill();g.strokeStyle='#120c1a';g.lineWidth=1.6;g.stroke();
    line(g,[[9,0],[20,0]],'rgba(255,255,255,.75)',2.5);g.fillStyle='rgba(10,6,18,.78)';g.beginPath();g.ellipse(-2,0,10,7.5,0,0,TAU);g.fill();g.fillStyle='rgba(180,230,255,.75)';g.beginPath();g.arc(1,0,9,-.8,.8);g.arc(0,0,5.5,.9,-.9,true);g.fill();
    for(const Y of[-5.5,5.5])disc(g,19,Y,2,'#fff6c0')},{s:3})};
  const shadow=G.bake('kt:shadow',56,40,g=>{const q=g.createRadialGradient(28,20,4,28,20,27);q.addColorStop(0,'rgba(0,0,0,.7)');q.addColorStop(.65,'rgba(0,0,0,.38)');q.addColorStop(1,'rgba(0,0,0,0)');g.save();g.translate(28,20);g.scale(1,.72);g.translate(-28,-20);g.fillStyle=q;g.fillRect(0,-8,56,56);g.restore()});
  /* ===== ícones dos rituais (no lugar de emojis) ===== */
  const item=k=>G.bake(`kt:item:${k}`,40,40,g=>{const c=20;
    if(k==='smoke'){for(const[X,Y,R,col]of[[12,24,9,'#8a78a8'],[27,24,10,'#a490c4'],[20,16,11,'#c8b4e4'],[20,26,9,'#b4a0d4']])disc(g,X,Y,R,col);disc(g,16,13,3,'#f0e4ff')}
    else if(k==='roots'){for(const[pts,w]of[[[[20,36],[18,24],[8,18],[6,8]],5],[[[20,36],[24,22],[22,12],[28,4]],5],[[[21,28],[31,24],[35,13]],4],[[[17,22],[17,10],[12,4]],3]]){line(g,pts,'#12361a',w+2.5);line(g,pts,'#4cc060',w)}disc(g,28,5,3,'#b8f090');disc(g,6,8,3,'#b8f090')}
    else if(k==='sun'){G.glow(g,c,c,19,'#ffb030',.9);for(let i=0;i<8;i++){const a=i*TAU/8;G.poly(g,[[c+Math.cos(a-.22)*10,c+Math.sin(a-.22)*10],[c+Math.cos(a)*19,c+Math.sin(a)*19],[c+Math.cos(a+.22)*10,c+Math.sin(a+.22)*10]],'#ffb030')}disc(g,c,c,9,'#ffe070');disc(g,c-3,c-3,3,'#fffbe0')}
    else if(k==='shield'){G.poly(g,[[c,3],[34,9],[32,25],[c,37],[8,25],[6,9]],'#0e3a4e');G.poly(g,[[c,6],[31,11],[29,24],[c,33],[11,24],[9,11]],'#7fe3ff');G.poly(g,[[c,6],[c,33],[11,24],[9,11]],'#c8f4ff');disc(g,c,18,5,'#0e3a4e');disc(g,c,18,2.4,'#fff')}
    else if(k==='orb'){G.glow(g,c,c,20,'#ffd36b',.9);for(let i=0;i<4;i++){const a=i*TAU/4+.4;G.poly(g,[[c+Math.cos(a-.5)*7,c+Math.sin(a-.5)*7],[c+Math.cos(a)*18,c+Math.sin(a)*18],[c+Math.cos(a+.5)*7,c+Math.sin(a+.5)*7]],'#ffd36b')}disc(g,c,c,9,'#fff2bc');disc(g,c,c,5,'#ffffff')}
    else{disc(g,c,c,16,'#1a0a30');disc(g,c,c,13,'#c56bff');disc(g,c+4,c-3,11,'#12061e');g.strokeStyle='#e8c8ff';g.lineWidth=2;g.beginPath();g.arc(c,c,17,0,TAU);g.stroke()}
  },{s:3});
  const box=G.bake('kt:box',28,28,g=>{G.poly(g,[[14,1],[26,8],[26,20],[14,27],[2,20],[2,8]],'#6a38b0');G.poly(g,[[14,1],[26,8],[14,15],[2,8]],'#d8b8ff');G.poly(g,[[2,8],[14,15],[14,27],[2,20]],'#9a68e0');line(g,[[14,1],[26,8],[26,20],[14,27],[2,20],[2,8],[14,1]],'#f4e8ff',1.4);line(g,[[2,8],[14,15],[26,8]],'rgba(255,255,255,.7)',1);line(g,[[14,15],[14,27]],'rgba(255,255,255,.7)',1);g.font='900 15px "IBM Plex Sans",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='#2a0e50';g.strokeText('?',14,15);g.fillStyle='#fff';g.fillText('?',14,15)},{s:3});
  const trap=G.bake('kt:trap',48,48,g=>{oval(g,24,26,20,16,'rgba(0,0,0,.35)');for(let i=0;i<7;i++){const a=i*TAU/7;g.strokeStyle='#12361a';g.lineWidth=7;g.beginPath();g.moveTo(24,24);g.quadraticCurveTo(24+Math.cos(a+.9)*16,24+Math.sin(a+.9)*16,24+Math.cos(a)*21,24+Math.sin(a)*21);g.stroke();g.strokeStyle=i%2?'#4cc060':'#7a5a2a';g.lineWidth=4;g.stroke();disc(g,24+Math.cos(a)*20,24+Math.sin(a)*20,2.6,'#c8f4a0')}disc(g,24,24,6,'#2a6a34');disc(g,22,22,2.4,'#d8ffc0')},{s:2});
  const amb={};
  return{
    track,car,shadow,item,box,trap,rnd:G.rng(404),
    amb:i=>{const A=KTART42[i]||KTART42[0];return amb[i]||(amb[i]=G.ambient(A.amb,{W:800,H:450,n:A.amb==='neve'?40:18,col:A.ambc,seed:i+21}))},
  };
}

function corrida42(C){
  const W=800,H=450,LAPS=Number(window.__ktLaps)||3,o=C.room.opt||{},mesa=!!C.net;
  const list=o.m==='cup'?CUPS42[+o.cup||0].tr.slice():[+o.tr||0];
  const BOT=gdPick(C.gd,[.82,.9,.97,1.04]),meI=me16(C);
  const S={ri:0,K:null,racers:[],me:null,t:0,traps:[],orbs:[],bolts:[],keys:{},gh:{},fin:{},sendAt:0,cam:[0,0],msg:'',msgT:0,final:false,wait:0,inter:null,pts:{},res:[],closed:false,itemQ:false,offC:{},finAll:false,rw:null,cuts:0,purple:false,pulseHit:false};
  const names=['Perseus Veloz','Perseus Turbo','Perseus Sonolento'];
  const GX=window.GFX60,art=ktArt42(),FXK={ri:-1,t:0,at:0,skid:[],dust:[],last:{}};
  function load(ri){
    S.ri=ri;S.K=ktTrack42(list[ri]);S.t=0;S.traps=[];S.orbs=[];S.bolts=[];S.final=false;S.gh={};S.fin={};S.closed=false;S.wait=0;
    S.racers=mesa?C.players.map((p,k)=>ktCar42(S.K,p.u,p.n,p.c,k,false)):[ktCar42(S.K,C.me,meI.n,meI.c,0,false),...[1,2,3].map(k=>ktCar42(S.K,'~k'+k,names[k-1],-1,k,true))];
    S.me=S.racers.find(r=>r.u===C.me)||S.racers[0];S.cam=[S.me.x,S.me.y];S.raceT0=Date.now();
    if(!S.offC[list[ri]])S.offC[list[ri]]=paintTrack(S.K);
    flash(`${S.K.T.ico} ${S.K.T.n}${list.length>1?` · corrida ${ri+1}/${list.length}`:''}`);
  }
  const paintTrack=K=>art.track(K);
  function flash(m){S.msg=m;S.msgT=performance.now()}
  const total=r=>ktTotal42(S.K,r);
  /* posição: carros locais + fantasmas */
  function standing(){const all=[...S.racers.filter(r=>!mesa||r===S.me).map(r=>({u:r.u,p:total(r),d:r.done,t:r.ft})),...Object.entries(S.gh).map(([u,g])=>({u,p:g.done?1e9:g.p||0,d:!!g.done,t:g.t||0}))];
    return all.sort((a,b)=>(b.d-a.d)||(a.d?a.t-b.t:b.p-a.p))}
  function posOf(u){return standing().findIndex(a=>a.u===u)+1}
  function giveItem(r){if(r.item)return;const n=standing().length,pos=posOf(r.u),f=n>1?(pos-1)/(n-1):0,rr=Math.random();
    const tab=f<.25?[['roots',4],['shield',4],['smoke',2],['sun',1]]:f<.7?[['sun',3],['orb',3],['smoke',2],['roots',2],['shield',1]]:[['sun',4],['orb',3],['pulse',2],['smoke',2]];
    const tot=tab.reduce((a,b)=>a+b[1],0);let q=rr*tot;for(const [k,w] of tab){q-=w;if(q<=0){r.item=k;break}}if(!r.item)r.item='sun';
    if(r===S.me){fx5('mgCoin');flash(`🎁 ${ITEM42[r.item].ico} ${ITEM42[r.item].n}!`)}}
  const scr=r=>[r.x-clamp12(S.cam[0]-W/2,0,KTW42-W),r.y-clamp12(S.cam[1]-H/2,0,KTH42-H)];
  function hit(r,kind){if(r.done)return false;if(r.sh>0){r.sh=0;if(r===S.me){flash('🛡 O Escudo de Verdade bloqueou!');fx5('activate')}return false}
    if(kind==='roots'){r.stun=.9;r.vx*=.2;r.vy*=.2}else if(kind==='smoke'){if(r.bot)r.slow=1.5;else r.smoke=2.6}else{r.spin=kind==='pulse'?1.2:.85}
    if(r===S.me){fx5('error');C.fx?.shake(8,.35);GX.hitstop(80);GX.emit('estilhacos',...scr(r));flash({roots:'🌿 Preso nas raízes!',smoke:'🌫 Fumaça de Ilusão!',orb:'✶ Atingido pelo Orbe de Fé!',pulse:'◐ Pulso de Inexistência no líder!'}[kind])}return true}
  function useItem(r){if(!r.item||r.done)return;const it=r.item;r.item=null;
    if(it==='sun'){r.boost=2.2;r.sun=2.2;if(r===S.me)fx5('activate')}
    else if(it==='shield'){r.sh=1;if(r===S.me)fx5('confirm')}
    else if(it==='roots'){const t={x:r.x-Math.cos(r.a)*42,y:r.y-Math.sin(r.a)*42,o:r.u,life:25};S.traps.push(t);if(r===S.me&&mesa)C.send('kit',{k:'roots',x:Math.round(t.x),y:Math.round(t.y)})}
    else if(it==='smoke'){const p=total(r);S.racers.forEach(q=>{if(q!==r&&total(q)>p)hit(q,'smoke')});if(r===S.me&&mesa)C.send('kit',{k:'smoke',p})}
    else if(it==='orb'){const st=standing(),i=st.findIndex(a=>a.u===r.u),tg=i>0?st[i-1].u:null;if(tg)S.orbs.push({x:r.x,y:r.y,tg,o:r.u,t:6});if(r===S.me)fx5('activate')}
    else if(it==='pulse'){const lead=standing().find(a=>a.u!==r.u&&!a.d);if(lead){const q=S.racers.find(z=>z.u===lead.u&&(!mesa||z===S.me));const pt=q||S.gh[lead.u];if(pt)S.bolts.push({x:pt.x,y:pt.y,t:.6});if(q)hit(q,'pulse');else if(mesa)C.send('khit',{to:lead.u,k:'pulse'});if(r===S.me){S.pulseHit=true;C.achieve?.('ku_pulso')}}}
  }
  function finishRace(){
    /* posições desta corrida */
    let order;
    if(mesa){order=C.players.map(p=>({u:p.u,n:p.n,c:p.c,t:S.fin[p.u]})).sort((a,b)=>(a.t??1e9)-(b.t??1e9))}
    else order=S.racers.slice().sort((a,b)=>(b.done-a.done)||(a.done?a.ft-b.ft:total(b)-total(a))).map(r=>({u:r.u,n:r.n,c:r.c<0?0:r.c,t:r.done?r.ft:null}));
    order.forEach((a,k)=>{S.pts[a.u]=(S.pts[a.u]||0)+(a.t!=null?KTP42[k]||0:0)});
    return order}
  function raceOver(order){
    const myPos=order.findIndex(a=>a.u===C.me)+1,myT=order.find(a=>a.u===C.me)?.t;
    if(myPos===1)C.achieve?.('piloto');
    progPut38(p=>{p.kt=p.kt||{};p.kt.best=p.kt.best||{};const ti=list[S.ri];if(myT!=null&&(!p.kt.best[ti]||myT<p.kt.best[ti]))p.kt.best[ti]=Math.round(myT*10)/10});
    S.res.push({n:S.K.T.n,pos:myPos,t:myT,order});
    if(S.ri<list.length-1){S.inter={until:pnow38()+6500,order};return}
    finishAll();
  }
  function finishAll(){
    if(S.finAll)return;S.finAll=true;
    const players=mesa?C.players.map(p=>({u:p.u,n:p.n,c:p.c})):S.racers.map(r=>({u:r.u,n:r.n,c:r.c<0?0:r.c}));
    const rows=players.map(p=>({u:p.u,n:p.n,c:p.c,s:S.pts[p.u]||0,w:false})).sort((a,b)=>b.s-a.s);
    const last=S.res[S.res.length-1];
    if(list.length===1){const ord=last.order;rows.sort((a,b)=>ord.findIndex(z=>z.u===a.u)-ord.findIndex(z=>z.u===b.u));rows.forEach(r=>{const z=ord.find(q=>q.u===r.u);r.st=z?.t!=null?`${r.s} pts · ${z.t.toFixed(1)} s`:`${r.s} pts · não terminou`})}
    if(rows[0])rows[0].w=true;
    const cupWin=list.length>1&&rows[0]?.u===C.me;
    if(cupWin){C.achieve?.('ku_copa');progPut38(p=>{p.kt=p.kt||{};p.kt.cups=p.kt.cups||{};if(!p.kt.cups[+o.cup||0]){p.kt.cups[+o.cup||0]=1;S.cupNew=true}})}
    const mul=gdMul38(C.gd),per=[20,12,8,5,4,3];let ob=S.res.reduce((a,r)=>a+(r.t!=null?per[r.pos-1]||3:1),0)*mul+(cupWin?40:0)+(S.cupNew?30:0);
    S.rw={ob:Math.round(ob),xp:Math.round(ob*.6),why:[list.length>1?`${S.res.length} corridas`:`${S.res[0].pos}º lugar`,cupWin?'copa vencida':''].filter(Boolean).join(' · ')};
    const title=list.length>1?(cupWin?`🏆 Você venceu a ${CUPS42[+o.cup||0].n}!`:`${CUPS42[+o.cup||0].n} · campeão: ${rows[0].n}`):(last.pos===1?`🏁 1º lugar! ${last.t?.toFixed(1)} s`:last.t!=null?`🏁 Você chegou em ${last.pos}º · ${last.t.toFixed(1)} s`:`🏁 ${S.K.T.n} · vitória de ${rows[0].n}`);
    if(mesa&&!C.host)return;
    C.finish({title,rows,unit:'pts',html:html()});
  }
  function html(){return`<table class="r38-t"><caption>${list.length>1?'Tabela da Copa':'Resultado'}</caption><thead><tr><th scope="col">Corrida</th><th scope="col">Sua posição</th><th scope="col">Tempo</th></tr></thead><tbody>${S.res.map(r=>`<tr><th scope="row">${esc(r.n)}</th><td>${r.pos}º</td><td>${r.t!=null?r.t.toFixed(1)+' s':'—'}</td></tr>`).join('')}</tbody></table>${S.cupNew?'<p class="r38-hi">🏆 Troféu novo na sua estante!</p>':''}`}
  /* mesa: o anfitrião fecha cada corrida e manda a próxima */
  function checkMesa(){if(!C.host||!mesa||S.closed)return;const all=C.players.every(p=>p.u in S.fin),first=Object.values(S.fin).filter(v=>v!=null);if(!all&&!(first.length&&S.t-Math.min(...first)>45))return;S.closed=true;
    const order=finishRace();C.send('kres',{ri:S.ri,order,pts:S.pts});raceOver(order)}
  load(0);GX.skin({acc:S.K.T.c});
  const K_UP=['KeyW','ArrowUp'],K_DN=['KeyS','ArrowDown'],K_L=['KeyA','ArrowLeft'],K_R=['KeyD','ArrowRight'],K_DR=['ShiftLeft','ShiftRight','KeyK'],K_IT=['KeyE','Space','KeyJ'];
  return{
    g60intro:{title:list.length>1?CUPS42[+o.cup||0].n:S.K.T.n,sub:'W acelera · A/D viram · Shift: drift',acc:S.K.T.c},
    st:()=>S,
    key(code,down){S.keys[code]=down;if(down&&K_IT.includes(code))S.itemQ=true},
    msg(p){
      if(p.t==='pos'&&p.from!==C.me&&p.ri===S.ri)S.gh[p.from]={...(S.gh[p.from]||{}),...p,at:Date.now()};
      if(p.t==='kit'&&p.from!==C.me){if(p.k==='roots')S.traps.push({x:p.x,y:p.y,o:p.from,life:25});if(p.k==='smoke'&&total(S.me)>p.p)hit(S.me,'smoke')}
      if(p.t==='khit'&&p.to===C.me)hit(S.me,p.k);
      if(p.t==='kfin'&&p.ri===S.ri){S.gh[p.from]={...(S.gh[p.from]||{}),done:true,t:Number(p.tm)||0};if(C.host){S.fin[p.from]=Number(p.tm)||999;checkMesa()}}
      if(p.t==='kres'&&!C.host&&p.from===C.room.host&&p.ri===S.ri&&!S.closed){S.closed=true;S.pts=p.pts||S.pts;raceOver(p.order||[])}
    },
    left(u){if(C.host&&mesa){S.fin[u]=S.fin[u]??null;C.players=C.players.filter(p=>p.u!==u);checkMesa()}},
    reward:()=>S.rw,
    step(dt){
      if(Date.now()<C.t0)return;
      if(S.finAll)return;
      if(S.inter){if(pnow38()>=S.inter.until){S.inter=null;load(S.ri+1)}return}
      S.t+=dt;const k=S.keys,has=a=>a.some(c=>k[c]),me=S.me;
      const opt={t:S.t,final:S.final,laps:LAPS,bot:BOT};
      const inp=window.__ktAuto?ktBot42(S.K,me,{drift:true,cuts:true,cutP:1}):{up:has(K_UP),dn:has(K_DN),l:has(K_L),r:has(K_R),drift:has(K_DR)};
      if(window.__ktAuto&&me.item&&Math.random()<.02)S.itemQ=true;
      if(S.itemQ){S.itemQ=false;useItem(me)}
      ktDrive42(S.K,me,inp,dt,opt);
      const ev=me.ev;
      if(ev==='cut'){S.cuts++;C.achieve?.('ku_atalho');flash('🌀 Atalho secreto!')}
      if(ev&&ev.startsWith('mt')){const lv=+ev[2];fx5('activate');C.fx?.burst(W/2,H/2+10,{n:10+lv*4,col:[['#5aa7ff','#ff9b3d','#c56bff'][lv-1],'#fff'],sp:180,life:.4,size:2.6,grav:0});if(lv===3){S.purple=true;C.achieve?.('ku_drift')}}
      if(ev==='pad'){fx5('confirm');GX.emit('brilho',...scr(me),{col:'#ffd36b'})}
      if(ev==='lap'){flash(`Volta ${me.lap+1} de ${LAPS}`);fx5('confirm')}
      if(ev==='final'&&!S.final){S.final=true;flash('🔥 VOLTA FINAL!');fx5('mgWin');C.fx?.flash('#ff9b3d',.25)}
      if(ev==='finish'){fx5('mgWin');flash('🏁 Chegada!');GX.emit('confete',W/2,H/2-60);if(mesa){C.send('kfin',{ri:S.ri,tm:me.ft});S.fin[C.me]=me.ft;checkMesa()}}
      S.racers.forEach(r=>{if(!r.bot)return;const bi=ktBot42(S.K,r,{drift:C.gd==='dificil'||C.gd==='pesadelo',cuts:C.gd!=='facil',cutP:gdPick(C.gd,[0,.25,.5,.8])});ktDrive42(S.K,r,bi,dt,opt);if(r.ev==='final'&&!S.final&&total(r)>=total(me)){}
        if(r.item&&!r.done){const pos=posOf(r.u),st=standing();const near=S.racers.some(q=>q!==r&&Math.hypot(q.x-r.x,q.y-r.y)<160&&total(q)<total(r));
          if((r.item==='roots'&&near)||r.item==='sun'||(r.item==='orb'&&pos>1)||(r.item==='pulse'&&pos>1)||(r.item==='smoke'&&pos>1)||r.item==='shield'){if(Math.random()<dt*.8)useItem(r)}}});
      [...S.racers].forEach(r=>{if(r.done)return;S.K.boxes.forEach(b=>{if(b.t<=0&&Math.hypot(b.x-r.x,b.y-r.y)<22){b.t=6;giveItem(r)}});
        S.traps.forEach(t=>{if(t.o!==r.u&&!t.hit&&Math.hypot(t.x-r.x,t.y-r.y)<24){t.hit=true;hit(r,'roots')}})});
      S.K.boxes.forEach(b=>b.t=Math.max(0,b.t-dt));S.traps=S.traps.filter(t=>!t.hit&&(t.life-=dt)>0);
      S.orbs.forEach(q=>{q.t-=dt;const tr=S.racers.find(r=>r.u===q.tg&&(!mesa||r===S.me))||S.gh[q.tg];if(!tr){q.t=0;return}const a=Math.atan2(tr.y-q.y,tr.x-q.x);q.x+=Math.cos(a)*560*dt;q.y+=Math.sin(a)*560*dt;
        if(Math.hypot(tr.x-q.x,tr.y-q.y)<22){q.t=0;if(S.racers.includes(tr))hit(tr,'orb');else if(mesa)C.send('khit',{to:q.tg,k:'orb'})}});S.orbs=S.orbs.filter(q=>q.t>0);
      S.bolts.forEach(b=>b.t-=dt);S.bolts=S.bolts.filter(b=>b.t>0);
      if(mesa&&Date.now()-S.sendAt>100){S.sendAt=Date.now();C.send('pos',{ri:S.ri,x:Math.round(me.x),y:Math.round(me.y),a:+me.a.toFixed(2),p:total(me),dr:me.lvl})}
      if(mesa){if(C.host)checkMesa()}
      else if(me.done){const bots=S.racers.filter(r=>r.bot);if(bots.every(b=>b.done)||S.t-me.ft>12){if(!S.closed){S.closed=true;raceOver(finishRace())}}}
      S.cam[0]+=(me.x-S.cam[0])*Math.min(1,dt*6);S.cam[1]+=(me.y-S.cam[1])*Math.min(1,dt*6);
      const pos=posOf(C.me),n=standing().length;
      C.hud(GX.chips([{icon:'bandeira',value:S.K.T.n+(list.length>1?` · ${S.ri+1}/${list.length}`:'')},{icon:'alvo',label:'volta',value:`${Math.min(LAPS,me.lap+1)}/${LAPS}`},{icon:'trofeu',value:`${pos}º de ${n}`,tone:pos===1?'warn':null},{icon:'relogio',value:S.t.toFixed(1)+' s'},{icon:'estrela',label:'item',value:me.item?ITEM42[me.item].n+' (E)':'—',tone:me.item?'ok':null},me.sh?{icon:'escudo',value:'escudo'}:null]));
    },
    draw(x){
      const K=S.K,me=S.me,cx=clamp12(S.cam[0]-W/2,0,KTW42-W),cy=clamp12(S.cam[1]-H/2,0,KTH42-H),pn=performance.now(),t=pn/1000,red=GX.reduced(),TC=K.T.c;
      x.drawImage(S.offC[list[S.ri]],cx,cy,W,H,0,0,W,H);x.save();x.translate(-cx,-cy);
      const seen=(X,Y,m=60)=>X>cx-m&&X<cx+W+m&&Y>cy-m&&Y<cy+H+m;
      /* marcas de pneu e poeira (só desenho) */
      trail(x,t);
      K.pads.forEach((p,i)=>{if(seen(p.x,p.y))GX.glow(x,p.x,p.y,34+(red?0:Math.sin(t*7+i)*7),'#ffc440',.35)});
      K.boxes.forEach((b,i)=>{if(b.t>0||!seen(b.x,b.y))return;const bob=red?0:Math.sin(t*3+i)*3;GX.shadow(x,b.x+3,b.y+12,28,{alpha:.55,alt:6+bob});GX.glow(x,b.x,b.y+bob,28,'#c39bff',.6);GX.draw(x,art.box,b.x,b.y-3+bob,{w:27,rot:red?0:Math.sin(t*2+i*1.7)*.22})});
      S.traps.forEach(q=>{if(!seen(q.x,q.y))return;GX.glow(x,q.x,q.y,30,'#7dffa8',.35);GX.draw(x,art.trap,q.x,q.y,{w:44})});
      S.orbs.forEach(q=>{const tr=S.racers.find(r=>r.u===q.tg&&(!mesa||r===me))||S.gh[q.tg];if(tr&&tr.x!=null){const a=Math.atan2(tr.y-q.y,tr.x-q.x);for(let k=1;k<5;k++)GX.glow(x,q.x-Math.cos(a)*k*13,q.y-Math.sin(a)*k*13,15-k*2.4,'#ffb030',.7-k*.13)}GX.glow(x,q.x,q.y,32,'#ffd36b',.9);GX.draw(x,art.item('orb'),q.x,q.y,{w:30,rot:red?0:t*8})});
      const carD=(r,al=1)=>{if(!seen(r.x,r.y))return;const ang=r.a+(r.dr?r.dr*.25:0),ca=Math.cos(ang),sa=Math.sin(ang);
        GX.draw(x,art.shadow,r.x+4,r.y+6,{w:52,rot:ang,alpha:al});
        if(r.boost>0){const f=red?1:.75+Math.random()*.45,c=r.sun>0?'#ff7a1a':'#ffd36b';GX.glow(x,r.x-ca*25,r.y-sa*25,17*f,c,.95*al);GX.glow(x,r.x-ca*36,r.y-sa*36,14*f,c,.55*al);GX.glow(x,r.x-ca*22,r.y-sa*22,7,'#ffffff',al)}
        GX.draw(x,art.car(r.c),r.x,r.y,{w:44,rot:ang,alpha:al});
        if(r.lvl||r.dr){const sc=['#dddddd','#5aa7ff','#ff9b3d','#c56bff'][r.lvl||0];for(const s of[-1,1]){const wx=r.x-ca*14-sa*s*12,wy=r.y-sa*14+ca*s*12;GX.glow(x,wx,wy,10+(r.lvl||0)*2,sc,.85*al);x.fillStyle=sc;for(let k=0;k<3;k++)x.fillRect(wx-ca*(3+Math.random()*13)+(Math.random()-.5)*7,wy-sa*(3+Math.random()*13)+(Math.random()-.5)*7,2.4,2.4)}}
        sprAt16(x,r.c,r.x-ca*2,r.y-sa*2-3,23,0,al);
        if(r.sh){GX.glow(x,r.x,r.y,34,'#7fe3ff',.4*al);x.save();x.globalAlpha=al;x.strokeStyle='rgba(180,240,255,.9)';x.lineWidth=2;x.beginPath();for(let k=0;k<=6;k++){const a=k*TAU16/6+(red?0:t*1.5),X=r.x+Math.cos(a)*27,Y=r.y+Math.sin(a)*27;k?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();x.restore()}
        if(r.stun>0)GX.draw(x,art.trap,r.x,r.y,{w:54,alpha:.8*al})};
      for(const u in S.gh){const g=S.gh[u];const p=C.players.find(q=>q.u===u);if(!p||g.x==null)continue;carD({x:g.x,y:g.y,a:g.a||0,c:p.c,boost:0,lvl:g.dr||0},.5);if(MG.drawn)MG.drawn[p.n]=.5;GX.hud.text(x,p.n,g.x,g.y-27,{size:11,min:9,al:'center'})}
      S.racers.forEach(r=>{if(mesa&&r!==me)return;if(r===me)GX.glow(x,r.x,r.y,44,'#ffd36b',.2);carD(r);if(r!==me)GX.hud.text(x,r.n,r.x,r.y-27,{size:10,min:8,al:'center',col:'#e9e1ff'})});
      S.bolts.forEach(b=>{const a=Math.max(0,b.t/.6),pts=[[b.x,b.y-300],[b.x+14,b.y-205],[b.x-6,b.y-168],[b.x+12,b.y-120],[b.x-12,b.y-72],[b.x+5,b.y-34],[b.x,b.y]];x.save();x.globalAlpha=a;x.lineJoin='round';x.globalCompositeOperation='lighter';for(const[lw,col]of[[15,'rgba(150,60,255,.35)'],[6,'#c56bff'],[2,'#ffffff']]){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}x.restore();GX.glow(x,b.x,b.y,75,'#c56bff',a)});
      x.restore();
      art.amb(K.i).draw(x,t,cx);
      if(S.final&&!me.done){x.save();x.globalCompositeOperation='lighter';x.lineCap='round';for(let i=0;i<22;i++){const a=i/22*Math.PI*2+i*.13,k=red?.5:((t*1.7+i*.37)%1),r1=240+k*150,r2=r1+50+k*40;x.strokeStyle=`rgba(255,155,61,${(.32*(red?.7:Math.sin(k*Math.PI))).toFixed(3)})`;x.lineWidth=3;x.beginPath();x.moveTo(W/2+Math.cos(a)*r1*1.35,H/2+Math.sin(a)*r1*.8);x.lineTo(W/2+Math.cos(a)*r2*1.35,H/2+Math.sin(a)*r2*.8);x.stroke()}x.restore()}
      GX.vignette(x,W,H,{a:.42});
      if(me.smoke>0){const a=Math.min(.92,me.smoke/2);x.fillStyle=`rgba(70,58,82,${a})`;[[180,140,170],[520,260,190],[330,330,150],[640,110,140]].forEach(([bx,by,br],i)=>{const X=bx+Math.sin(pn/700+i)*20;x.beginPath();x.arc(X,by,br,0,7);x.fill();GX.glow(x,X-br*.25,by-br*.25,br*.75,'#b8a4d0',a*.4,{add:false});GX.glow(x,X+br*.35,by+br*.3,br*.6,'#2a1e38',a*.6,{add:false})})}
      /* item, posição e volta */
      const u=GX.fs(12,10)/12,pos=posOf(C.me),n=standing().length,ib=60*Math.max(1,u*.75);
      GX.hud.panel(x,12,12,ib,ib,{acc:me.item?'#ffd36b':'#c39bff',r:12});
      if(me.item){GX.glow(x,12+ib/2,12+ib/2,ib*.6,'#ffd36b',.3);GX.draw(x,art.item(me.item),12+ib/2,12+ib/2,{w:ib*.78});GX.hud.text(x,ITEM42[me.item].n,14,ib+12+GX.fs(11,9),{size:11,min:9,w:800,col:'#ffe9b0',max:260})}
      else GX.hud.text(x,'?',12+ib/2,13+ib/2,{size:24,w:900,al:'center',col:'rgba(244,234,214,.35)',stroke:0});
      if(me.sh)GX.draw(x,art.item('shield'),ib+34,32,{w:30});
      const lap=`Volta ${Math.min(LAPS,me.lap+1)}/${LAPS}`,ph=44+GX.fs(14,10)*1.5,pw=Math.max(112,GX.fs(14,10)*7);
      GX.hud.panel(x,10,H-ph-10,pw,ph,{acc:pos===1?'#ffd36b':TC,r:10});
      GX.hud.text(x,`${pos}º`,22,H-ph+15,{size:42,w:900,col:pos===1?'#ffd36b':'#ffffff',stroke:6});
      x.font='900 42px "IBM Plex Sans",system-ui,sans-serif';const nx=22+x.measureText(`${pos}º`).width+6;GX.hud.text(x,`/${n}`,nx,H-ph+24,{size:15,w:800,col:'#c9c0dc',max:pw-nx+4});
      GX.hud.text(x,lap,22,H-10-GX.fs(14,10)*.85,{size:14,min:10,w:800});
      if(pos===1)GX.icon(x,'coroa',pw-12,H-ph+4,20,'#ffd36b');
      if(me.dr){const lv=me.lvl,col=['#dddddd','#5aa7ff','#ff9b3d','#c56bff'][lv];GX.hud.bar(x,W/2-70,H-24,140,11,Math.min(1,me.ch/1.5),{col,segs:3});if(lv)GX.glow(x,W/2,H-18,60+lv*14,col,.4,{sy:.3});GX.hud.text(x,['drift','azul','laranja','ROXO'][lv],W/2,H-26-GX.fs(11,9)*.6,{size:11,min:9,w:900,al:'center',col})}
      const age=pn-S.msgT;if(S.msg&&age<1800&&Date.now()>=C.t0)GX.hud.banner(x,W,H,S.msg.replace(/^[^0-9A-Za-zÀ-ÿ]+/,''),{acc:'#ffd36b',k:Math.min(1,(1800-age)/300),y:76});
      /* minimapa */
      const ms=.1,mw=KTW42*ms,mh=KTH42*ms,mx=W-mw-14,my=14;GX.hud.panel(x,mx-5,my-5,mw+10,mh+10,{acc:TC,r:8,a:.82});
      x.save();x.lineJoin='round';x.beginPath();K.pts.forEach((p,i)=>i?x.lineTo(mx+p[0]*ms,my+p[1]*ms):x.moveTo(mx+p[0]*ms,my+p[1]*ms));x.closePath();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=8;x.stroke();x.strokeStyle=GX.rgba(TC,.85);x.lineWidth=4;x.stroke();x.restore();
      GX.icon(x,'bandeira',mx+K.pts[0][0]*ms+3,my+K.pts[0][1]*ms-5,11,'#ffffff');
      [...S.racers.filter(r=>!mesa||r===me),...Object.values(S.gh).filter(g=>g.x!=null)].forEach(r=>{const mine=r===me,X=mx+r.x*ms,Y=my+r.y*ms;if(mine)GX.glow(x,X,Y,12,'#ffd36b',.9);x.beginPath();x.arc(X,Y,mine?4.5:3.5,0,TAU16);x.fillStyle=mine?'#ffd36b':'#ff6b5b';x.fill();x.strokeStyle='#120c1a';x.lineWidth=1.2;x.stroke()});
      if(me.done&&!S.inter&&!MG.over)GX.hud.banner(x,W,H,'Chegada!',{sub:'Aguardando os outros…',y:H/2});
      if(S.inter){x.fillStyle='rgba(8,4,14,.86)';x.fillRect(0,0,W,H);GX.hud.panel(x,150,20,W-300,H-40,{acc:'#ffd36b',r:16});GX.icon(x,'trofeu',186,52,28,'#ffd36b');
        GX.hud.text(x,`Tabela · depois de ${S.ri+1} de ${list.length} corridas`,W/2+14,52,{size:20,min:10,w:800,al:'center',max:W-370});
        const ppl=mesa?C.players.map(p=>({u:p.u,n:p.n})):S.racers.map(r=>({u:r.u,n:r.n}));ppl.sort((a,b)=>(S.pts[b.u]||0)-(S.pts[a.u]||0)).forEach((p,i)=>{const z=S.inter.order.findIndex(q=>q.u===p.u),Y=104+i*40;
          x.fillStyle=p.u===C.me?'rgba(255,211,107,.18)':'rgba(255,255,255,.06)';rr16(x,176,Y-17,W-352,34,8);x.fill();
          GX.hud.text(x,`${i+1}. ${p.n}`,192,Y,{size:17,min:10,w:800,col:p.u===C.me?'#ffd36b':'#ffffff',max:270});GX.hud.text(x,`${z>=0?`+${S.inter.order[z].t!=null?KTP42[z]||0:0}`:''}  ${S.pts[p.u]||0} pts`,W-192,Y,{size:17,min:10,w:800,al:'right'})});
        GX.hud.text(x,`Próxima: ${KT42[list[S.ri+1]].n} em ${Math.ceil((S.inter.until-pnow38())/1000)} s`,W/2,H-52,{size:16,min:10,w:700,al:'center',col:'#c9b8ff',max:W-330})}
      GX.hud.frame(x,W,H,{acc:TC,a:.65});
    }
  };
  /* rastros dos pneus e poeira, em coordenadas da pista; nunca leem nem mudam a física */
  function trail(x,t){
    if(FXK.ri!==S.ri||S.t<FXK.t){FXK.ri=S.ri;FXK.skid=[];FXK.dust=[];FXK.last={}}
    FXK.t=S.t;const fresh=!GX.frozen()&&t-FXK.at>.025;
    if(fresh){FXK.at=t;for(const r of S.racers){if(mesa&&r!==S.me)continue;const sp=Math.hypot(r.vx,r.vy),slide=(r.dr||r.spin>0)&&sp>60,ca=Math.cos(r.a),sa=Math.sin(r.a);
      const wl=[r.x-ca*14+sa*12,r.y-sa*14-ca*12],wr=[r.x-ca*14-sa*12,r.y-sa*14+ca*12],prev=FXK.last[r.u];
      if(slide&&prev)FXK.skid.push([prev[0],wl],[prev[1],wr]);
      FXK.last[r.u]=slide?[wl,wr]:null;
      const surf=r.dist>KTTW42/2?'off':S.K.zone[r.near]||'road';
      if(sp>90&&(surf!=='road'||slide)&&FXK.dust.length<60)FXK.dust.push({x:r.x-ca*20+(art.rnd()-.5)*14,y:r.y-sa*20+(art.rnd()-.5)*14,t,c:surf==='mud'?'#8a6038':surf==='ice'?'#e0f4ff':surf==='off'?'#a89a78':'#b8b0c4'})}
      if(FXK.skid.length>220)FXK.skid.splice(0,FXK.skid.length-220)}
    x.save();x.strokeStyle='rgba(8,4,12,.38)';x.lineWidth=4;x.lineCap='round';x.beginPath();for(const[a,b]of FXK.skid){if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])>60)continue;x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1])}x.stroke();x.restore();
    FXK.dust=FXK.dust.filter(p=>t-p.t<.55);for(const p of FXK.dust){const k=(t-p.t)/.55;GX.glow(x,p.x,p.y,8+k*18,p.c,.55*(1-k),{add:false})}
  }
}
Object.assign(ACH,{
  ku_copa:{ico:'🏆',n:'Campeão da Copa',d:'Vença uma Copa de 3 pistas na Corrida do Véu.'},
  ku_drift:{ico:'💜',n:'Faísca Roxa',d:'Solte um mini-turbo roxo na Corrida do Véu.'},
  ku_atalho:{ico:'🌀',n:'Atalho Secreto',d:'Passe por um atalho secreto na Corrida do Véu.',secret:true},
  ku_pulso:{ico:'◐',n:'Pulso no Líder',d:'Acerte o 1º colocado com o Pulso de Inexistência.'},
});
['kres','khit'].forEach(t=>MG_MUST.add(t));
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='kt42')return`<div>${b('KeyA','◀','','Esquerda')}${b('KeyD','▶','','Direita')}</div><div>${b('KeyS','▼','','Frear')}${b('KeyK','🌀','','Drift')}${b('KeyE','🎁','','Item')}${b('KeyW','▲','wide','Acelerar')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('corrida',{...GAMES12.corrida,make:corrida42,setup:ktSetup42,pad:'kt42',top3:true,
  desc:'4 pistas com lama, gelo, turbos e atalhos secretos. Drift com mini-turbo, 6 itens balanceados pela posição e Copa de 3 pistas.',
  rule:'Mesa: todos correm juntos (fantasmas) e os itens acertam quem está online. Na Copa, os pontos (10, 7, 5, 3…) somam nas 3 pistas.',
  keys:'W acelera · S freia · A/D viram · Shift ou K: drift · E ou Espaço: item',touch:'◀ ▶ viram · ▲ acelera · ▼ freia · 🌀 drift · 🎁 item'});
console.info('[Tulpa] Etapa 42 carregada (Corrida do Véu 2.0)');

/* ===================================================================
   TULPA · ETAPA 43 — 🕹 ARCADE 2.0 · ONDA 3 (parte 2)
   🃏 UNO TEOSÓFICO 2.0
   Cartas de Poder (uma por Elemento, ✦):
     👁 Verdade · Revelar: você vê a mão de um rival por 2 rodadas.
     🌀 Ilusão · Troca: troca sua mão com a de um rival (ou inverte o sentido).
     🌿 Natureza · Cura: +3 de Lucidez e anula a próxima compra contra você.
     ◐ Inexistência · Vazio: pula o próximo e troca uma carta aleatória dele.
     ✶ Fé · Escudo: reflete a pilha de +2/+4 de volta para quem jogou
       (sem pilha, fica guardado e reflete a próxima).
   Empilhamento (+2 em +2, +4 em +4). Colapso de Lucidez: zerou, compra 3
   e a barra volta cheia. Botão "TULPA!" com 1 carta; esqueceu e alguém
   delatou, compra 2. Rodada única, Melhor de 3 ou Pontos (até 200).
   O anfitrião (ou o solo) é a autoridade da partida.
   =================================================================== */
const UNOP43={3:{n:'Revelar',ico:'👁',d:'Veja a mão de um rival por 2 rodadas.'},2:{n:'Troca',ico:'🌀',d:'Troque de mão com um rival, ou inverta o sentido.'},0:{n:'Cura',ico:'🌿',d:'+3 de Lucidez e anula a próxima compra contra você.'},1:{n:'Vazio',ico:'◐',d:'Pula o próximo e troca uma carta dele.'},4:{n:'Escudo',ico:'✶',d:'Reflete a pilha de +2/+4 de volta.'}};
const UNOMODE43={one:{n:'Rodada única',ico:'🃏',d:'Quem esvaziar a mão primeiro vence.'},bo3:{n:'Melhor de 3',ico:'🥉',d:'Quem vencer 2 rodadas leva a partida.'},pts:{n:'Pontos (até 200)',ico:'🧮',d:'O vencedor da rodada soma o valor das cartas dos outros.'}};
const unoVal43=c=>c.e<0?50:c.v==='P'?30:isNaN(+c.v)?20:+c.v;
/* ---------- 🎨 arte do UNO Teosófico (GFX60) · SOMENTE VISUAL ----------
   Direção: mesa de carteado de uma taverna ocultista, feltro esmeralda,
   aro de nogueira com filete de latão e velas. Cada Elemento tem cor E
   símbolo próprios nas cartas. Nada aqui toca no baralho nem na semente. */
function unoArt43(){
  const G=window.GFX60,W=800,H=450,TAU=Math.PI*2,CW=56,CH=84;
  /* [corpo, sombra, tinta do canto, brilho, tinta no marfim] */
  const EL=[['#1f7a3c','#0d4220','#ffffff','#7dffa8','#0f4a21'],
    ['#352a44','#110c19','#ffffff','#b9a6ff','#231a30'],
    ['#6d2fd6','#33127a','#ffffff','#d9a8ff','#3f1590'],
    ['#1a5fc0','#092c68','#ffffff','#7fc8ff','#0d397e'],
    ['#f2be10','#b98600','#1f1500','#ffe27a','#4f3800']];
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const txt=(g,s,X,Y,size,col,{stroke,sw=3,max,al='center'}={})=>{g.font=`900 ${size}px "IBM Plex Sans",system-ui,sans-serif`;g.textAlign=al;g.textBaseline='middle';if(stroke){g.lineJoin='round';g.strokeStyle=stroke;g.lineWidth=sw;g.strokeText(s,X,Y,max)}g.fillStyle=col;g.fillText(s,X,Y,max)};
  const star6=(g,cx,cy,r,c)=>{g.fillStyle=c;g.beginPath();for(let i=0;i<12;i++){const a=-Math.PI/2+i*TAU/12,k=i%2?r*.44:r;i?g.lineTo(cx+Math.cos(a)*k,cy+Math.sin(a)*k):g.moveTo(cx+Math.cos(a)*k,cy+Math.sin(a)*k)}g.closePath();g.fill()};
  /* símbolo do Elemento: folha, meia-lua, espiral, olho, estrela de 6 pontas */
  function symbol(g,e,cx,cy,s,col){
    if(e===0)G.icon(g,'folha',cx,cy,s,col);
    else if(e===1){const r=s*.42;ring(g,cx,cy,r,col,Math.max(1.4,s*.12));g.fillStyle=col;g.beginPath();g.arc(cx,cy,r,-Math.PI/2,Math.PI/2);g.closePath();g.fill()}
    else if(e===2)G.icon(g,'espiral',cx,cy,s,col);
    else if(e===3)G.icon(g,'olho',cx,cy,s*1.12,col);
    else star6(g,cx,cy,s*.5,col);
  }
  function arrow(g,X,Y,ang,s,col){g.save();g.translate(X,Y);g.rotate(ang);G.poly(g,[[s,0],[-s*.4,-s*.8],[-s*.4,s*.8]],col);g.restore()}
  /* poder da Carta de Poder, por Elemento */
  function power(g,e,cx,cy,s,col){
    if(e===3)G.icon(g,'olho',cx,cy,s,col);
    else if(e===0){G.icon(g,'coracao',cx,cy,s,col);box(g,cx-s*.2,cy-s*.07,s*.4,s*.12,'#fbf4e2');box(g,cx-s*.06,cy-s*.21,s*.12,s*.4,'#fbf4e2')}
    else if(e===4)G.icon(g,'escudo',cx,cy,s,col);
    else if(e===2){const r=s*.34;g.strokeStyle=col;g.lineWidth=s*.13;g.beginPath();g.arc(cx,cy,r,.35,2.55);g.stroke();g.beginPath();g.arc(cx,cy,r,Math.PI+.35,Math.PI+2.55);g.stroke();arrow(g,cx+Math.cos(2.75)*r,cy+Math.sin(2.75)*r,2.75+Math.PI/2,s*.2,col);arrow(g,cx+Math.cos(2.75+Math.PI)*r,cy+Math.sin(2.75+Math.PI)*r,2.75-Math.PI/2,s*.2,col)}
    else{disc(g,cx,cy,s*.42,col);disc(g,cx,cy,s*.24,'#fbf4e2');disc(g,cx+s*.04,cy,s*.15,col)}
  }
  function glyph(g,v,cx,cy,s,col,opt){
    if(v==='⊘'){ring(g,cx,cy,s*.34,col,s*.14);line(g,[[cx-s*.23,cy+s*.23],[cx+s*.23,cy-s*.23]],col,s*.14)}
    else if(v==='⇄'){line(g,[[cx-s*.36,cy-s*.17],[cx+s*.18,cy-s*.17]],col,s*.14);arrow(g,cx+s*.28,cy-s*.17,0,s*.2,col);line(g,[[cx+s*.36,cy+s*.17],[cx-s*.18,cy+s*.17]],col,s*.14);arrow(g,cx-s*.28,cy+s*.17,Math.PI,s*.2,col)}
    else{txt(g,v,cx,cy+s*.04,s,col,opt);if(v==='6'||v==='9')box(g,cx-s*.26,cy+s*.43,s*.52,Math.max(1.4,s*.09),col)}
  }
  const card=(c,name)=>G.bake(`uno:card:${c.e}:${c.v}`,CW,CH,g=>{
    box(g,0,0,CW,CH,'#f7efdc',8);rim(g,.5,.5,CW-1,CH-1,8,'#1a1208',1);
    const wild=c.e<0,P=c.v==='P',E=wild?null:EL[c.e];
    g.save();path(g,3,3,CW-6,CH-6,6);g.clip();
    box(g,0,0,CW,CH,wild?vg(g,0,CH,'#2c2438','#0c0912'):vg(g,0,CH,E[0],G.mix(E[0],E[1],.6)));
    g.globalAlpha=.13;if(!wild)symbol(g,c.e,CW*.72,CH*.2,34,'#ffffff');g.globalAlpha=1;
    G.poly(g,[[3,3],[CW*.62,3],[3,CH*.5]],'rgba(255,255,255,.09)');g.restore();
    const ink=wild?'#ffffff':E[2];
    /* oval central de marfim */
    g.save();g.translate(CW/2+1,CH/2+(P?-3:0));g.rotate(.5);g.beginPath();g.ellipse(0,0,17.5,P?24:27,0,0,TAU);
    if(wild){g.save();g.clip();g.rotate(-.5);EL.forEach((q,i)=>{g.fillStyle=q[0];g.beginPath();g.moveTo(0,0);g.arc(0,0,48,-Math.PI/2+i*TAU/5,-Math.PI/2+(i+1)*TAU/5);g.closePath();g.fill()});g.restore();g.strokeStyle='#f7efdc';g.lineWidth=2;g.stroke()}
    else{g.fillStyle='#fbf4e2';g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.stroke()}
    g.restore();
    if(P){rim(g,3.5,3.5,CW-7,CH-7,6,'#ffd36b',2.4);power(g,c.e,CW/2+2,CH/2-3,27,E[4]);box(g,4,CH-18,CW-8,14,'rgba(10,6,16,.9)',4);txt(g,name||'Poder',CW/2,CH-10.5,10,'#ffe9a8',{max:CW-11});
      disc(g,12,13,8.5,'#1a1020');ring(g,12,13,8.5,'#ffd36b',1.2);G.icon(g,['coracao','alvo','espiral','olho','escudo'][c.e],12,13,11.5,'#ffe9a8');symbol(g,c.e,11,30,12,ink)}
    else if(wild){if(c.v==='+4'){glyph(g,'+4',CW/2,CH/2,28,'#ffffff',{stroke:'#0c0912',sw:5});txt(g,'+4',12,13,14,'#fff',{stroke:'#000'})}else{G.icon(g,'estrela',CW/2,CH/2,30,'#0c0912');G.icon(g,'estrela',CW/2,CH/2,22,'#ffffff');G.icon(g,'estrela',11,13,14,'#ffffff')}
      EL.forEach((q,i)=>disc(g,9+i*4.2,24+(i%2)*3,2.1,q[3]));G.icon(g,'estrela',CW-11,CH-13,13,'#ffd36b')}
    else{glyph(g,c.v,CW/2+1,CH/2+1,30,E[4]);glyph(g,c.v,c.v==='+2'?13:11,13,c.v==='+2'?14:16,ink,{stroke:c.e===4?null:'rgba(0,0,0,.55)',sw:3});symbol(g,c.e,11,29,13,ink);symbol(g,c.e,CW-12,CH-14,16,ink)}
  },{s:3});
  const back=()=>G.bake('uno:back',CW,CH,g=>{
    box(g,0,0,CW,CH,'#f7efdc',8);rim(g,.5,.5,CW-1,CH-1,8,'#1a1208',1);box(g,3,3,CW-6,CH-6,vg(g,3,CH-3,'#3a2258','#150b24'),6);
    g.save();path(g,3,3,CW-6,CH-6,6);g.clip();for(let i=-CH;i<CW+CH;i+=9){line(g,[[i,0],[i+CH,CH]],'rgba(255,211,107,.13)',1);line(g,[[i,CH],[i+CH,0]],'rgba(255,211,107,.13)',1)}g.restore();
    rim(g,6.5,6.5,CW-13,CH-13,4,'#c99a3a',1.2);disc(g,CW/2,CH/2,17,'#150b24');ring(g,CW/2,CH/2,17,'#ffd36b',1.6);ring(g,CW/2,CH/2,12.5,'rgba(255,211,107,.45)',1);G.icon(g,'olho',CW/2,CH/2,22,'#ffd36b');
    [[11,12],[CW-11,12],[11,CH-12],[CW-11,CH-12]].forEach(([X,Y])=>G.poly(g,[[X,Y-3.5],[X+3,Y],[X,Y+3.5],[X-3,Y]],'#ffd36b'))},{s:3});
  const table=()=>G.bake('uno:table',W,H,(g,w,h,r)=>{
    box(g,0,0,w,h,'#140c08');G.fillTile(g,G.tile('madeira',{size:96,a:'#3a2416',b:'#170d07',seed:4}),0,0,w,h);box(g,0,0,w,h,'rgba(6,3,2,.45)');
    const cx=400,cy=214;
    const oval=(rx,ry,fill)=>{g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.fillStyle=fill;g.fill()};
    oval(432,258,'rgba(0,0,0,.5)');oval(424,246,vg(g,cy-246,cy+246,'#8a5a30','#4a2a14','#2a160a'));oval(409,232,'#d6a94a');oval(405,228,'#241208');
    g.save();g.beginPath();g.ellipse(cx,cy,400,223,0,0,TAU);g.clip();G.fillTile(g,G.tile('feltro',{size:96,a:'#12503c',seed:2}),0,0,w,h);
    G.glow(g,cx,180,300,'#5fd8a8',.16,{add:false,sy:.7});const q=g.createRadialGradient(cx,cy,120,cx,cy,420);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=q;g.fillRect(0,0,w,h);g.restore();
    g.beginPath();g.ellipse(cx,cy,384,208,0,0,TAU);g.strokeStyle='rgba(255,214,120,.28)';g.lineWidth=1.5;g.stroke();
    /* Ciclo Elemental bordado no centro */
    const R=112,P=[0,1,2,3,4].map(i=>{const a=-Math.PI/2+i*TAU/5;return[cx+Math.cos(a)*R,182+Math.sin(a)*R]});
    ring(g,cx,182,R,'rgba(255,214,120,.2)',1.5);ring(g,cx,182,R+13,'rgba(255,214,120,.1)',1);line(g,[...P,P[0]],'rgba(255,214,120,.13)',1.2);
    P.forEach(([X,Y],k)=>{const e=[4,0,1,2,3][k];disc(g,X,Y,12,'rgba(4,22,16,.75)');ring(g,X,Y,12,G.rgba(EL[e][3],.45),1.2);g.globalAlpha=.6;symbol(g,e,X,Y,13,EL[e][3]);g.globalAlpha=1});
    /* cantos de madeira com latão */
    [[22,22,1,1],[w-22,22,-1,1],[22,h-22,1,-1],[w-22,h-22,-1,-1]].forEach(([X,Y,i,j])=>{line(g,[[X,Y+j*26],[X,Y],[X+i*26,Y]],'#c99a3a',2.5);disc(g,X+i*7,Y+j*7,3.5,'#ffd98a')});
    /* couro da mão do jogador */
    box(g,6,346,w-12,100,'rgba(20,10,6,.38)',16);rim(g,6.5,346.5,w-13,99,16,'rgba(214,169,74,.3)',1);
  });
  const candle=()=>G.bake('uno:candle',34,60,g=>{g.beginPath();g.ellipse(17,53,15,6,0,0,TAU);g.fillStyle='#5a3c12';g.fill();g.beginPath();g.ellipse(17,51,13,4.5,0,0,TAU);g.fillStyle='#d6a94a';g.fill();
    box(g,11,22,12,29,vg(g,22,51,'#fff6dc','#c9b48a'),3);box(g,11,22,3,27,'rgba(255,255,255,.55)',2);disc(g,15,25,3,'#fff6dc');box(g,20,25,3,9,'#fff6dc',2);line(g,[[17,22],[17,17]],'#2a1a0a',1.4)},{s:2});
  function flame(x,X,Y,t,k){const f=G.reduced()?0:Math.sin(t*9+k)*1.2+Math.sin(t*13+k*2)*.7;G.glow(x,X,Y,52+f*3,'#ff9a3c',.32);
    x.fillStyle='#ffb33a';x.beginPath();x.ellipse(X+f*.3,Y,3.6,7+f*.5,f*.05,0,TAU);x.fill();x.fillStyle='#fff4c0';x.beginPath();x.ellipse(X,Y+2,1.7,3.6,0,0,TAU);x.fill()}
  /* botão de latão */
  function button(x,b,label,{col='#ffd36b',on=true,size=16}={}){
    const img=G.bake(`uno:btn:${b.w}x${b.h}:${col}:${on?1:0}`,b.w,b.h,g=>{box(g,0,0,b.w,b.h,on?vg(g,0,b.h,G.shade(col,.35),col,G.shade(col,-.4)):'#241a2c',12);rim(g,1,1,b.w-2,b.h-2,11,on?'#fff3cf':'#5a4a66',1.5);rim(g,4,4,b.w-8,b.h-8,8,'rgba(0,0,0,.35)',1)},{s:2});
    x.drawImage(img,b.x,b.y,b.w,b.h);
    G.hud.text(x,label,b.x+b.w/2,b.y+b.h/2+1,{size,al:'center',w:900,col:on?'#ffffff':'#a897b8',stroke:4,min:9,max:b.w-8});
  }
  return{EL,card,back,table,candle,flame,symbol,power,button,motes:G.ambient('motes',{W,H,n:16,col:'#ffd98a',seed:12})};
}
function uno43(C){
  const W=800,H=450,TURN=25000,CW=56,CH=84,o=C.room.opt||{},mode=UNOMODE43[o.m]?o.m:'one',GOAL=Number(window.__unoGoal)||200;
  const rnd=mb32((C.seed^0x0b0)>>>0),di=GD12[C.diff]??1,fast=()=>!!window.__unoFast;
  const S={seats:[],deck:[],top:null,col:0,turn:0,dir:1,deadline:0,drew:false,rover:false,over:false,pick:null,log:'',hover:-1,anim:0,v:0,stack:null,reveal:null,turnN:0,round:1,next:0,hist:[],stats:{caught:0,escudo:0,pile:0},myLog:[]};
  const meIdx=()=>S.seats.findIndex(s=>s.u===C.me);
  const alive=()=>S.seats;
  function canPlay(c){if(!S.top)return false;if(S.stack)return(c.v===S.stack.type)||(c.v==='P'&&c.e===4);return c.e<0||c.e===S.col||c.v===S.top.v}
  function newDeck(){const d=[];for(let e=0;e<5;e++){d.push({e,v:'0'});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({e,v:String(n)});d.push({e,v:'⊘'},{e,v:'⇄'},{e,v:'+2'},{e,v:'P'})}}for(let k=0;k<4;k++)d.push({e:-1,v:'W'},{e:-1,v:'+4'});
    for(let i=d.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
  function draw1(s){if(!S.deck.length)S.deck=newDeck();s.hand.push(S.deck.pop());s.said=false}
  function nextIdx(from,steps=1){let i=from;for(let k=0;k<steps;k++)i=(i+S.dir+S.seats.length)%S.seats.length;return i}
  function setTurn(i){S.turn=i;S.drew=false;S.deadline=Date.now()+TURN;S.turnN++;S.v++;pub();const s=S.seats[i];if(s.bot)S.botAt=Date.now()+(fast()?0:700+Math.random()*700)}
  function say(t){S.log=t;S.hist.unshift(t);if(S.hist.length>4)S.hist.pop()}
  /* ---------- só o anfitrião (ou solo) ---------- */
  function deal(){
    S.deck=newDeck();S.seats.forEach(s=>{s.hand=[];s.luc=10;s.said=false;s.imm=0;s.sh=0;s.oneAt=0;for(let k=0;k<7;k++)draw1(s)});
    let t;do{t=S.deck.pop();if(t.e<0||isNaN(+t.v))S.deck.unshift(t)}while(t.e<0||isNaN(+t.v));
    S.top=t;S.col=t.e;S.stack=null;S.reveal=null;S.rover=false;S.dir=1;say(`Rodada ${S.round} · primeira carta: ${UNO_EL[t.e].n} ${t.v}`);setTurn(Math.floor(rnd()*S.seats.length));
  }
  function hostInit(){S.seats=bots17(C,Math.max(4,Math.min(6,C.players.length))).map(p=>({...p,hand:[],luc:10,wins:0,score:0}));deal()}
  function damage(v,n){if(v.imm>0){v.imm=0;say(`🌿 ${v.n} anulou a compra com a Cura`);return false}
    for(let k=0;k<n;k++)draw1(v);v.luc-=n;let t=`${v.n} compra ${n} e perde ${n} de Lucidez`;
    if(v.luc<=0){for(let k=0;k<3;k++)draw1(v);v.luc=10;t+=` · 💥 COLAPSO! compra mais 3 e a Lucidez volta cheia`}say(t);return true}
  function oneCard(s){if(s.hand.length===1){s.oneAt=Date.now();if(s.bot&&rnd()<[.6,.8,.95,1][di])s.said=true}}
  function play(si,hi,col,tg){
    if(S.rover||S.over||si!==S.turn)return;const s=S.seats[si],c=s.hand[hi];if(!c||!canPlay(c))return;
    s.hand.splice(hi,1);S.top=c;S.col=c.e<0?(col>=0&&col<5?col:0):c.e;S.anim=1;oneCard(s);
    let skip=1,t=`${s.n} jogou ${c.e<0?(c.v==='+4'?'+4':'coringa')+' → '+UNO_EL[S.col].n:c.v==='P'?UNOP43[c.e].ico+' '+UNOP43[c.e].n:UNO_EL[c.e].n+' '+c.v}`;
    if(c.v==='⇄'){S.dir*=-1;if(S.seats.length===2)skip=2}
    else if(c.v==='⊘')skip=2;
    else if(c.v==='+2'||c.v==='+4'){const n=c.v==='+2'?2:4;S.stack={n:(S.stack?.n||0)+n,type:c.v,from:si};t+=` · pilha de +${S.stack.n}`;if(S.stack.n>=8&&s.u===C.me)C.achieve?.('uno_pilha');S.stats.pile=Math.max(S.stats.pile,S.stack.n)}
    else if(c.v==='P'){
      if(c.e===3){const tj=S.seats[tg]&&tg!==si?tg:S.seats.findIndex((q,i)=>i!==si);S.reveal={by:si,to:tj,until:S.turnN+2*S.seats.length};t+=` · 👁 vê a mão de ${S.seats[tj].n}`}
      else if(c.e===2){if(S.seats[tg]&&tg!==si){const h=s.hand;s.hand=S.seats[tg].hand;S.seats[tg].hand=h;oneCard(s);oneCard(S.seats[tg]);t+=` · 🌀 trocou de mão com ${S.seats[tg].n}`}else{S.dir*=-1;t+=' · 🌀 o sentido virou de surpresa'}}
      else if(c.e===0){s.luc=Math.min(10,s.luc+3);s.imm=1;t+=' · 🌿 +3 de Lucidez e proteção contra a próxima compra'}
      else if(c.e===1){const vi=nextIdx(si),v=S.seats[vi];if(v.hand.length){const k=Math.floor(rnd()*v.hand.length);S.deck.unshift(v.hand.splice(k,1)[0]);draw1(v)}skip=2;t+=` · ◐ ${v.n} perde a vez e troca uma carta`}
      else if(c.e===4){if(S.stack){const back=S.stack.from;S.stack.from=si;t+=` · ✶ reflete a pilha de +${S.stack.n} para ${S.seats[back].n}`;if(S.stack.type==='+4'&&s.u===C.me)C.achieve?.('uno_escudo');if(s.u===C.me)S.stats.escudo++;say(t);if(!s.hand.length){roundWin(s);return}setTurn(back);return}
        s.sh=1;t+=' · ✶ Escudo guardado para a próxima pilha'}
    }
    say(t);
    if(!s.hand.length){roundWin(s);return}
    /* pilha mirando alguém com Escudo guardado: reflete sozinha */
    let ni=nextIdx(si,skip);
    if(S.stack&&S.seats[ni].sh){const v=S.seats[ni];v.sh=0;const back=S.stack.from;S.stack.from=ni;say(`${t} · ✶ o Escudo de ${v.n} refletiu a pilha`);ni=back}
    setTurn(ni);
  }
  function drawTurn(si){if(S.rover||S.over||si!==S.turn||S.drew)return;const s=S.seats[si];
    if(S.stack){const st=S.stack;S.stack=null;damage(s,st.n);setTurn(nextIdx(si));return}
    draw1(s);S.drew=true;say(`${s.n} comprou uma carta`);S.v++;pub();
    if(!canPlay(s.hand[s.hand.length-1])&&!s.bot)setTimeout(()=>{if(S.turn===si&&S.drew&&!S.rover)pass(si)},fast()?0:900)}
  function pass(si){if(S.rover||S.over||si!==S.turn)return;setTurn(nextIdx(si))}
  function tulpa(si){const s=S.seats[si];if(!s||s.hand.length>2)return;s.said=true;say(`📣 ${s.n}: TULPA!`);S.v++;pub()}
  const catchable=s=>s.hand.length===1&&!s.said&&Date.now()-s.oneAt>1200&&!S.rover;
  function catchIt(si,tj){const t=S.seats[tj],s=S.seats[si];if(!t||!s||tj===si||!catchable(t))return;for(let k=0;k<2;k++)draw1(t);t.said=false;say(`🚨 ${s.n} delatou ${t.n}: esqueceu o TULPA, compra 2`);if(s.u===C.me){S.stats.caught++;C.achieve?.('uno_delator')}S.v++;pub()}
  function roundWin(w){
    S.rover=true;w.wins=(w.wins||0)+1;const pts=S.seats.filter(q=>q!==w).reduce((a,q)=>a+q.hand.reduce((b,c)=>b+unoVal43(c),0),0);w.score=(w.score||0)+pts;
    if(w.u===C.me&&w.said)C.achieve?.('uno_tulpa');
    S.myLog.push({r:S.round,w:w.n,me:w.u===C.me,pts});
    say(`🏁 ${w.n} esvaziou a mão${mode==='pts'?` e soma ${pts} pontos`:''}!`);
    const done=mode==='one'||(mode==='bo3'&&w.wins>=2)||(mode==='pts'&&w.score>=GOAL);
    S.v++;pub();
    if(done){S.over=true;S.v++;pub();setTimeout(()=>finishMatch(w),fast()?0:1300);return}
    S.next=Date.now()+(fast()?0:3500);
  }
  function finishMatch(w){
    const rows=S.seats.map(s=>({u:s.u,n:s.n,c:s.c<0?0:s.c,s:mode==='pts'?s.score:mode==='bo3'?s.wins:(s===w?100:Math.max(0,50-s.hand.length*3)+s.luc),st:mode==='bo3'?`${s.wins} rodada${s.wins===1?'':'s'}`:mode==='pts'?`${s.score} pts`:undefined,w:s===w})).sort((a,b)=>b.s-a.s);
    if(w.u===C.me)C.achieve?.('baralho');
    C.finish({title:w.u===C.me?`Você venceu o UNO Teosófico! ${UNOMODE43[mode].n}`:`Vitória de ${w.n} · ${UNOMODE43[mode].n}`,rows,unit:'pts',html:html()});
  }
  function html(){return`<table class="r38-t"><caption>Rodadas</caption><thead><tr><th scope="col">Rodada</th><th scope="col">Vencedor</th>${mode==='pts'?'<th scope="col">Pontos</th>':''}</tr></thead><tbody>${S.myLog.map(r=>`<tr><th scope="row">${r.r}</th><td>${r.me?'🏆 você':esc(r.w)}</td>${mode==='pts'?`<td>${r.pts}</td>`:''}</tr>`).join('')}</tbody></table><ul class="r38-l"><li>🚨 Delações: <b>${S.stats.caught}</b></li><li>✶ Escudos refletidos: <b>${S.stats.escudo}</b></li><li>📚 Maior pilha: <b>+${S.stats.pile}</b></li></ul>`}
  /* ---------- IA ---------- */
  function botMove(si){const s=S.seats[si];
    if(S.stack){const same=s.hand.findIndex(c=>c.v===S.stack.type),esc4=s.hand.findIndex(c=>c.v==='P'&&c.e===4);
      if(same>=0&&(di>0||rnd()<.6)){play(si,same,mostCol(s));return}if(esc4>=0&&S.stack.n>=4){play(si,esc4,-1);return}drawTurn(si);return}
    const ok=s.hand.map((c,i)=>[c,i]).filter(([c])=>canPlay(c));
    if(!ok.length){if(!S.drew){drawTurn(si);S.botAt=Date.now()+(fast()?0:600);return}pass(si);return}
    const nxt=S.seats[nextIdx(si)],fewest=S.seats.map((q,i)=>[q,i]).filter(([q,i])=>i!==si).sort((a,b)=>a[0].hand.length-b[0].hand.length)[0];
    const sc=c=>{if(c.v==='P'){if(c.e===0)return s.luc<=5?9:2;if(c.e===4)return 1;if(c.e===2)return fewest[0].hand.length+2<=s.hand.length?9:3;if(c.e===1)return nxt.hand.length<=3?8:4;return 4}
      return(c.v==='+2'?(nxt.hand.length<=3?8:5):c.v==='⊘'||c.v==='⇄'?4:c.e<0?(c.v==='+4'?2:1):3)+(di===0?rnd()*6:0)};
    ok.sort((a,b)=>sc(b[0])-sc(a[0]));const [c,i]=ok[0];
    let tg=-1;if(c.v==='P'&&c.e===3)tg=fewest[1];if(c.v==='P'&&c.e===2)tg=fewest[0].hand.length+2<=s.hand.length?fewest[1]:-2;
    play(si,i,mostCol(s),tg)}
  const mostCol=s=>{const cnt=[0,0,0,0,0];s.hand.forEach(c=>{if(c.e>=0)cnt[c.e]++});return cnt.indexOf(Math.max(...cnt))};
  function botCatch(){if(S.rover)return;S.seats.forEach((t,tj)=>{if(!catchable(t))return;const wait=[3.5,2.5,1.8,1.2][di]*1000;if(Date.now()-t.oneAt<wait)return;const b=S.seats.findIndex((q,i)=>q.bot&&i!==tj);if(b>=0&&rnd()<.5)catchIt(b,tj)})}
  function pub(){if(!C.net||!C.host)return;C.send('us',{st:{seats:S.seats.map(s=>({u:s.u,n:s.n,c:s.c,bot:s.bot,luc:s.luc,hand:s.hand,said:s.said,oneAt:s.oneAt?Date.now()-s.oneAt:0,imm:s.imm,sh:s.sh,wins:s.wins,score:s.score})),top:S.top,col:S.col,turn:S.turn,dir:S.dir,drew:S.drew,rover:S.rover,over:S.over,left:S.deadline-Date.now(),log:S.log,hist:S.hist,stack:S.stack,reveal:S.reveal,turnN:S.turnN,round:S.round,myLog:S.myLog,v:S.v}})}
  /* ---------- entrada local ---------- */
  function act(kind,a,b,c){const si=meIdx();if(si<0)return;
    if(C.host){if(kind==='play')play(si,a,b,c);if(kind==='draw')drawTurn(si);if(kind==='pass')pass(si);if(kind==='tulpa')tulpa(si);if(kind==='catch')catchIt(si,a);return}
    C.send({play:'um',draw:'ud',pass:'up',tulpa:'uu',catch:'uc'}[kind],{i:a,e:b,tg:c,v:S.v})}
  S.act=act;S.canPlay=canPlay;S.botMove=botMove;
  if(C.host)hostInit();
  /* ---------- layout ---------- */
  function handRects(){const si=meIdx();if(si<0||!S.seats[si])return[];const h=S.seats[si].hand,n=h.length,span=Math.min(W-150,n*(CW+6)),step=n>1?(span-CW)/(n-1):0,x0=(W-150-span)/2+10;return h.map((c,i)=>({x:x0+i*step,y:H-CH-12,w:CW,h:CH,i}))}
  const DRAWB={x:W/2-150,y:140,w:CW,h:CH},PASSB={x:W/2+110,y:160,w:90,h:40},TULB={x:W-128,y:H-62,w:116,h:48};
  const panels=()=>{const si=meIdx(),others=S.seats.map((s,i)=>[s,i]).filter(([s])=>s.u!==C.me);return others.map(([s,i],k)=>({s,i,x:(k+.5)*W/others.length-72,y:8,w:144,h:84,cb:{x:(k+.5)*W/others.length-34,y:94,w:68,h:22}}))};
  const colB=()=>UNO_EL.map((e,i)=>({x:W/2-200+i*82,y:H/2-30,w:72,h:60,i}));
  const tgB=()=>{const si=meIdx(),ops=S.seats.map((s,i)=>[s,i]).filter(([,i])=>i!==si);return ops.map(([s,i],k)=>({x:W/2-(ops.length*130)/2+k*130,y:H/2-36,w:120,h:72,i,s}))};
  const GX=window.GFX60,art=unoArt43(),FXU={top:null,log:'',rover:false,init:false};
  GX.skin({acc:'#d6a94a'});
  /* efeitos só de imagem, disparados quando o estado muda */
  function fxEvents(E){
    const top=S.top?S.top.e+':'+S.top.v:'';
    if(!FXU.init){Object.assign(FXU,{init:true,top,log:S.log,rover:S.rover});return}
    if(top!==FXU.top){FXU.top=top;if(S.top){if(S.top.v==='+2'||S.top.v==='+4')GX.impact(W/2,182,{col:E[3],force:S.top.v==='+4'?1.5:1});else{GX.emit('coleta',W/2,182,{col:E[3]});if(S.top.v==='P'||S.top.e<0)GX.emit('brilho',W/2,182,{col:E[3],amount:1.6})}}}
    if(S.log!==FXU.log){FXU.log=S.log;const l=String(S.log);
      if(l.includes('COLAPSO')){GX.hitstop(130);C.fx?.shake(8,.4);C.fx?.flash('#7a1ad0',.3);GX.emit('estilhacos',W/2,182,{amount:2})}
      else if(l.includes('delatou')){GX.impact(W/2,120,{col:'#ff5b6b',force:1.1})}
      else if(l.includes('TULPA!')){GX.emit('confete',W/2,300,{amount:.45})}
      else if(l.includes('refletiu')||l.includes('reflete'))GX.emit('brilho',W/2,182,{col:'#ffe27a',amount:2})}
    if(S.rover!==FXU.rover){FXU.rover=S.rover;if(S.rover){GX.hitstop(100);GX.emit('confete',W/2,170,{amount:1.4})}}
  }
  function cardDraw(x,c,X,Y,{hi=false,dim=false,small=false}={}){const w=small?CW*.58:CW,h=small?CH*.58:CH;x.drawImage(art.card(c,c.v==='P'?UNOP43[c.e].n:''),X,Y,w,h);
    if(hi){rr16(x,X-1,Y-1,w+2,h+2,9);x.strokeStyle='#fff6d0';x.lineWidth=2.5;x.stroke()}
    if(dim){rr16(x,X,Y,w,h,8);x.fillStyle='rgba(4,10,8,.5)';x.fill()}}
  function tryCard(i){const si=meIdx(),c=S.seats[si].hand[i];if(!canPlay(c)){fx5('error');return}
    if(c.e<0){S.pick={i,k:'col'};return}if(c.v==='P'&&(c.e===3||c.e===2)){S.pick={i,k:'tg',inv:c.e===2};return}act('play',i,-1,-1);fx5('click')}
  return{st:()=>S,
    g60intro:{title:'UNO Teosófico',sub:UNOMODE43[mode].n,acc:'#ffd36b'},
    msg(p){
      if(!C.host&&p.t==='us'&&p.st&&p.from===C.room.host){const st=p.st;S.seats=st.seats.map(s=>({...s,oneAt:s.oneAt?Date.now()-s.oneAt:0}));S.top=st.top;S.col=st.col;if(S.turn!==st.turn)S.anim=1;Object.assign(S,{turn:st.turn,dir:st.dir,drew:st.drew,rover:st.rover,over:st.over,log:st.log,hist:st.hist||[],stack:st.stack,reveal:st.reveal,turnN:st.turnN,round:st.round,myLog:(st.myLog||[]).map(r=>({...r,me:r.w===me16(C).n})),v:st.v});S.deadline=Date.now()+st.left}
      if(C.host&&['um','ud','up','uu','uc'].includes(p.t)){const si=S.seats.findIndex(s=>s.u===p.from);if(si<0)return;if(p.t==='um')play(si,p.i|0,p.e|0,p.tg|0);if(p.t==='ud')drawTurn(si);if(p.t==='up')pass(si);if(p.t==='uu')tulpa(si);if(p.t==='uc')catchIt(si,p.i|0)}
    },
    left(u){if(!C.host)return;const s=S.seats.find(q=>q.u===u);if(!s)return;s.bot=true;s.n+=' (Perseus)';if(S.seats[S.turn]===s)S.botAt=Date.now()+500},
    reward(){const si=meIdx(),s=S.seats[si];if(!s)return null;const won=S.over&&S.seats.reduce((a,q)=>!a||(mode==='pts'?q.score>a.score:q.wins>a.wins)?q:a,null)===s;
      const ob=Math.round(((s.wins||0)*8+(won?20:0)+S.stats.caught*2+S.stats.escudo*2)*gdMul38(C.diff));return{ob,xp:Math.round(ob*.6),why:[`${s.wins||0} rodada${s.wins===1?'':'s'} vencida${s.wins===1?'':'s'}`,S.stats.caught?`${S.stats.caught} delação`:'',won?'partida vencida':''].filter(Boolean).join(' · ')}},
    key(code,down){if(!down)return;if(code==='Space')act(S.drew?'pass':'draw');if(code==='KeyT')act('tulpa')},
    ptr(t,px,py){
      if(t==='move'){S.hover=-1;handRects().forEach(r=>{if(inB16(r,px,py))S.hover=r.i});return}
      if(t!=='down'||S.over||Date.now()<C.t0||!S.seats.length)return;const si=meIdx();if(si<0)return;
      if(inB16(TULB,px,py)&&S.seats[si].hand.length<=2&&!S.seats[si].said){act('tulpa');fx5('activate');return}
      for(const p of panels())if(inB16(p.cb,px,py)&&catchable(p.s)){act('catch',p.i);fx5('activate');return}
      if(S.turn!==si||S.rover)return;
      if(S.pick){const pk=S.pick;S.pick=null;
        if(pk.k==='col'){const b=colB().find(b=>inB16(b,px,py));if(b)act('play',pk.i,b.i,-1);return}
        const b=tgB().find(b=>inB16(b,px,py));if(b){act('play',pk.i,-1,b.i);return}
        if(pk.inv&&inB16({x:W/2-70,y:H/2+50,w:140,h:36},px,py))act('play',pk.i,-1,-2);return}
      if(inB16(DRAWB,px,py)&&!S.drew){act('draw');return}
      if(S.drew&&!S.stack&&inB16(PASSB,px,py)){act('pass');return}
      const rs=handRects();for(let k=rs.length-1;k>=0;k--){if(inB16(rs[k],px,py)){tryCard(rs[k].i);return}}
    },
    step(dt){
      S.anim=Math.max(0,S.anim-dt*3);if(!S.seats.length)return;
      if(C.host&&!S.over&&Date.now()>=C.t0){
        if(S.rover){if(Date.now()>=S.next){S.round++;deal()}}
        else{const s=S.seats[S.turn];if(s.bot&&Date.now()>=S.botAt)botMove(S.turn);else if(!s.bot&&Date.now()>S.deadline){if(!S.drew)drawTurn(S.turn);if(S.turn===S.seats.indexOf(s))pass(S.turn)}botCatch()}}
      const si=meIdx(),mine=si>=0&&S.turn===si,me=S.seats[si];
      const left=Math.max(0,Math.ceil((S.deadline-Date.now())/1000));
      C.hud(GX.chips(S.over?[{icon:'trofeu',value:'Fim da partida'}]:S.rover?[{icon:'trofeu',value:GX.clean(S.log),tone:'ok'}]:[
        {icon:'alvo',value:mine?'Sua vez':'Vez de '+(S.seats[S.turn]?.n||'?'),tone:mine?'ok':null},
        mine&&S.stack?{icon:'raio',label:'pilha +'+S.stack.n,value:S.stack.type+' ou Escudo',tone:'bad'}:{icon:'estrela',label:mine?'jogue':'cor',value:UNO_EL[S.col].n+(mine?' ou igual':'')},
        mode==='bo3'?{icon:'trofeu',label:'rodada '+S.round+' · vitórias',value:me?.wins||0}:mode==='pts'?{icon:'trofeu',label:'rodada '+S.round,value:(me?.score||0)+'/'+GOAL}:null,
        {icon:'relogio',value:left+' s',tone:left<=5?'warn':null}]));
    },
    draw(x){
      const t=performance.now()/1000,now=Date.now(),red=GX.reduced(),sc=GX.cssScale();
      x.drawImage(art.table(),0,0,W,H);
      art.motes.draw(x,t);
      x.drawImage(art.candle(),16,150,34,60);art.flame(x,33,162,t,1);x.drawImage(art.candle(),W-50,150,34,60);art.flame(x,W-33,162,t,4);
      if(!S.seats.length){GX.hud.text(x,'Embaralhando…',W/2,H/2,{size:20,al:'center'});GX.vignette(x,W,H,{a:.45});return}
      const si=meIdx(),me=S.seats[si],E=art.EL[S.col]||art.EL[0],cardImg=c=>art.card(c,c.v==='P'?UNOP43[c.e].n:'');
      fxEvents(E);
      GX.glow(x,W/2,182,128,E[3],.2+(red?0:.04*Math.sin(t*2)),{sy:.86});
      /* sentido da jogada */
      const spin=red?0:t*.5*S.dir;
      x.save();x.strokeStyle=GX.rgba(E[3],.75);x.lineWidth=3;x.lineCap='round';
      for(let k=0;k<2;k++){const a=(k?Math.PI:0)+(red?0:Math.sin(spin*2)*.18),a0=a-.55,a1=a+.55,tip=S.dir>0?a1:a0;x.beginPath();x.arc(W/2,182,56,a0,a1);x.stroke();
        x.save();x.translate(W/2+Math.cos(tip)*56,182+Math.sin(tip)*56);x.rotate(tip+(S.dir>0?Math.PI/2:-Math.PI/2));GX.poly(x,[[9,0],[-3,-7],[-3,7]],E[3]);x.restore()}
      x.restore();
      GX.hud.text(x,S.dir>0?'horário':'anti-horário',339,228,{size:11,al:'center',col:'#d8ecdf',min:8,max:60});
      /* oponentes: só a quantidade de cartas aparece (informação oculta) */
      panels().forEach(({s,i,x:px,y:py,w,h,cb})=>{const on=S.turn===i&&!S.rover;
        if(on)GX.glow(x,px+w/2,py+h/2,w*.7,'#ffd36b',.28,{sy:.65});
        GX.hud.panel(x,px,py,w,h,{r:12,acc:on?'#ffd36b':'#6f9a86',a:.95});
        GX.shadow(x,px+25,py+55,38,{alpha:.6});sprAt16(x,s.c,px+25,py+36,40);
        if(on){const k=clamp12((S.deadline-now)/TURN,0,1);x.save();x.strokeStyle=k<.25?'#ff6b5b':'#ffd36b';x.lineWidth=3;x.lineCap='round';x.beginPath();x.arc(px+25,py+36,23,-Math.PI/2,-Math.PI/2+TAU16*k);x.stroke();x.restore()}
        GX.hud.text(x,s.n,px+51,py+15,{size:13,w:800,min:9,max:w-57,col:on?'#ffe6a0':'#f4ead6'});
        const n=s.hand.length,m=Math.min(n,7);for(let k=0;k<m;k++)GX.draw(x,art.back(),px+61+k*7,py+40,{w:16,rot:(k-(m-1)/2)*.08});
        GX.hud.text(x,String(n),px+w-8,py+40,{size:22,al:'right',w:900,min:12,col:n<=2?'#ffb09a':'#ffffff'});
        GX.icon(x,'olho',px+12,py+68,12,'#c39bff');
        GX.hud.bar(x,px+22,py+64.5,mode==='one'?w-58:w-76,7,s.luc/10,{col:s.luc<=4?'#ff6b7a':'#b48cff',segs:10});
        let ix=px+w-9;
        if(mode!=='one'){const lbl=mode==='bo3'?`${s.wins||0}`:`${s.score||0}`,tw=GX.hud.text(x,lbl,ix,py+69,{size:12,al:'right',w:800,col:'#ffd36b',min:9});ix-=tw*.62*lbl.length+7;GX.icon(x,'trofeu',ix,py+69,12,'#ffd36b');ix-=13}
        if(s.sh){GX.icon(x,'escudo',ix,py+69,13,'#ffe27a');ix-=14}if(s.imm)GX.icon(x,'folha',ix,py+69,13,'#7dffa8');
        if(n===1){const k=s.said?0:red?0:Math.abs(Math.sin(t*5));GX.hud.chip(x,px+w-6,py+h-1,{icon:s.said?'coroa':'raio',text:s.said?'TULPA!':'1 carta',col:s.said?'#7dffa8':GX.mix('#ff9a5a','#ffd36b',k>.5?1:0),size:10,al:'right',min:8})}
        if(catchable(s)){art.button(x,cb,'',{col:'#d62f45'});GX.icon(x,'bandeira',cb.x+11,cb.y+cb.h/2,13,'#ffffff');GX.hud.text(x,'Delatar',cb.x+cb.w/2+8,cb.y+cb.h/2+1,{size:12,al:'center',w:900,col:'#fff',min:9,max:cb.w-22})}});
      /* monte de compra */
      const mineNow=si===S.turn&&!S.drew&&!S.rover,pileTxt=S.stack&&si===S.turn?`+${S.stack.n}`:'COMPRAR';
      GX.shadow(x,DRAWB.x+CW/2+3,DRAWB.y+CH+3,CW*1.5,{alpha:.7,h:18});
      for(let k=3;k>0;k--)x.drawImage(art.back(),DRAWB.x+k*2,DRAWB.y+k*1.5,CW,CH);
      if(mineNow)GX.glow(x,DRAWB.x+CW/2,DRAWB.y+CH/2,74,S.stack?'#ff5b6b':'#ffd36b',.45+(red?0:.2*Math.sin(t*5)));
      x.drawImage(art.back(),DRAWB.x,DRAWB.y,CW,CH);
      if(mineNow){rr16(x,DRAWB.x-1,DRAWB.y-1,CW+2,CH+2,9);x.strokeStyle=S.stack?'#ff8a8a':'#ffd36b';x.lineWidth=2.5;x.stroke()}
      rr16(x,DRAWB.x-5,DRAWB.y+CH-19,CW+10,24,7);x.fillStyle=S.stack&&si===S.turn?'#8a1426':'rgba(12,7,18,.92)';x.fill();
      GX.hud.text(x,pileTxt,DRAWB.x+CW/2,DRAWB.y+CH-7,{size:S.stack&&si===S.turn?18:11,al:'center',w:900,col:S.stack&&si===S.turn?'#ffffff':'#ffe6a0',min:9,max:CW+6,stroke:0});
      /* descarte */
      if(S.top){const k=S.anim,rot=Math.sin(S.turnN*12.9)*.11;
        GX.shadow(x,W/2,DRAWB.y+CH+3,CW*1.6,{alt:k*40,alpha:.7,h:18});
        GX.draw(x,art.back(),W/2-3,183,{w:CW,rot:-rot*1.6-.05,alpha:.55});
        GX.draw(x,cardImg(S.top),W/2,182-k*20,{w:CW,rot:rot+(red?0:k*.35),sx:red?1:1+k*.2,sy:red?1:1+k*.2})}
      /* Elemento atual */
      {const gx=484,gy=170;GX.glow(x,gx,gy,34,E[3],.55);x.beginPath();x.arc(gx,gy,19,0,TAU16);x.fillStyle=E[0];x.fill();x.strokeStyle='#ffe9b0';x.lineWidth=2.5;x.stroke();
        art.symbol(x,S.col,gx,gy,22,E[2]);GX.hud.text(x,UNO_EL[S.col].n,gx,gy+33,{size:12,al:'center',w:800,col:E[3],min:9,max:96})}
      if(S.stack){const k=1+(red?0:.05*Math.sin(t*8));GX.hud.chip(x,W/2,122,{icon:'raio',text:`PILHA +${S.stack.n}`,col:'#ff6b7a',size:16*k,al:'center',min:11})}
      if(S.drew&&si===S.turn&&!S.stack)art.button(x,PASSB,'Passar',{col:'#b8862e',size:17});
      /* Revelar: só quem usou o poder vê a mão do alvo */
      if(S.reveal&&S.reveal.by===si&&S.turnN<S.reveal.until)panels().forEach(({s,i,x:px,y:py,h})=>{if(S.reveal.to===i)s.hand.slice(0,12).forEach((c,k)=>cardDraw(x,c,px-8+k*14,py+h+28,{small:true}))});
      /* diário da mesa */
      {const small=sc<.7,n=small?2:4,step=small?24:15,hs=S.hist.slice(0,n);
        if(hs.length){rr16(x,W/2-250,239,500,hs.length*step+10,10);x.fillStyle='rgba(3,16,11,.62)';x.fill();
          hs.forEach((l,k)=>{x.save();x.globalAlpha=1-k*(small?.22:.16);GX.hud.text(x,GX.clean(l),W/2,251+k*step+(small?4:0),{size:k?12:14,al:'center',col:k?'#d6ebe0':'#ffffff',min:small?9:11,max:486,stroke:0});x.restore()})}}
      if(me){
        const y=H-CH-24;GX.icon(x,'olho',22,y,16,'#c39bff');
        GX.hud.bar(x,34,y-4,100,8,me.luc/10,{col:me.luc<=4?'#ff6b7a':'#b48cff',segs:10});
        const used=GX.hud.text(x,`Lucidez ${me.luc}/10`,142,y+1,{size:12,w:800,col:'#e6d8ff',min:9,max:190});
        let ix=142+Math.min(190,used*7.6)+14;
        if(me.imm){GX.icon(x,'folha',ix,y,15,'#7dffa8');ix+=18}if(me.sh)GX.icon(x,'escudo',ix,y,15,'#ffe27a');
        if(si===S.turn&&!S.rover){const k=clamp12((S.deadline-now)/TURN,0,1);GX.glow(x,W/2,H-8,330,'#ffd36b',.14,{sy:.22});GX.hud.bar(x,W/2-110,y-3,220,6,k,{col:k<.25?'#ff6b5b':'#ffd36b'})}
        handRects().forEach(r=>{const c=me.hand[r.i],ok=si===S.turn&&!S.rover&&canPlay(c),Y=r.y-(S.hover===r.i&&ok?14:ok?6:0);
          GX.shadow(x,r.x+CW/2,r.y+CH+2,CW*1.2,{alt:r.y-Y,alpha:.55,h:12});
          if(ok&&S.hover===r.i)GX.glow(x,r.x+CW/2,Y+CH/2,70,art.EL[c.e<0?4:c.e][3],.5);
          cardDraw(x,c,r.x,Y,{hi:ok,dim:si===S.turn&&!ok})});
        const can=me.hand.length<=2&&!me.said;
        if(can){GX.glow(x,TULB.x+TULB.w/2,TULB.y+TULB.h/2,92,'#ff3a55',.4+(red?0:.25*Math.sin(t*6)),{sy:.7})}
        art.button(x,TULB,me.said?'dito':'TULPA!',{col:'#d62f45',on:can,size:21});
      }
      if(S.pick&&me){x.fillStyle='rgba(4,10,8,.78)';x.fillRect(0,0,W,H);
        if(S.pick.k==='col'){GX.hud.banner(x,W,H,'Escolha o novo Elemento',{acc:'#ffd36b',y:H/2-74});
          colB().forEach(b=>{const q=art.EL[b.i];GX.glow(x,b.x+b.w/2,b.y+b.h/2,54,q[3],.35);rr16(x,b.x,b.y,b.w,b.h,10);x.fillStyle=q[0];x.fill();x.strokeStyle='#fff3cf';x.lineWidth=2;x.stroke();
            art.symbol(x,b.i,b.x+b.w/2,b.y+22,28,q[2]);GX.hud.text(x,UNO_EL[b.i].n,b.x+b.w/2,b.y+48,{size:11,al:'center',w:800,col:q[2],min:8,max:b.w-5,stroke:b.i===4?0:3})})}
        else{const c=me.hand[S.pick.i];if(!c)return;GX.hud.banner(x,W,H,`${UNOP43[c.e].n}: escolha o rival`,{acc:'#ffd36b',y:H/2-76});
          tgB().forEach(b=>{GX.hud.panel(x,b.x,b.y,b.w,b.h,{r:10,acc:'#ffd36b',a:1});sprAt16(x,b.s.c,b.x+22,b.y+46,34);GX.hud.text(x,b.s.n,b.x+b.w/2,b.y+16,{size:13,al:'center',w:800,min:9,max:b.w-10});
            GX.draw(x,art.back(),b.x+60,b.y+48,{w:22,rot:-.14});GX.hud.text(x,String(b.s.hand.length),b.x+b.w-14,b.y+48,{size:22,al:'right',w:900,min:12})});
          if(S.pick.inv)art.button(x,{x:W/2-70,y:H/2+50,w:140,h:36},'Inverter sentido',{col:'#b8862e',size:13})}}
      if(S.rover&&!S.over){GX.hud.banner(x,W,H,GX.clean(S.log),{acc:'#ffd36b',y:H/2-18,sub:mode==='bo3'?S.seats.map(s=>`${s.n.split(' ')[0]} ${s.wins||0}`).join(' · '):S.seats.map(s=>`${s.n.split(' ')[0]} ${s.score||0}`).join(' · ')})}
      GX.vignette(x,W,H,{a:.38});GX.hud.frame(x,W,H,{acc:'#d6a94a',a:.6});
    }
  };
}
Object.assign(ACH,{
  uno_tulpa:{ico:'📣',n:'Grito de TULPA',d:'Vença uma rodada de UNO depois de gritar TULPA!.'},
  uno_delator:{ico:'🚨',n:'Delator',d:'Pegue alguém que esqueceu de gritar TULPA!.'},
  uno_escudo:{ico:'✶',n:'Espelho de Fé',d:'Reflita uma pilha de +4 com o Escudo de Fé.',secret:true},
  uno_pilha:{ico:'📚',n:'Pilha Astral',d:'Faça uma pilha de +8 ou mais no UNO.'},
});
['uu','uc'].forEach(t=>MG_MUST.add(t));
const unoSetup43={
  intro:o=>o._m==='mesa'?'Faltando gente, Perseus completam a mesa. 25 s por vez.':'Contra 3 Perseus com a dificuldade escolhida.',
  def:()=>({m:'bo3'}),
  fields:()=>[{k:'m',l:'Formato',opts:Object.entries(UNOMODE43).map(([v,m])=>({v,n:m.n,ico:m.ico,d:m.d}))}],
  fix:o=>{if(!UNOMODE43[o.m])o.m='bo3'},
  sum:()=>`Cartas de Poder: ${Object.entries(UNOP43).map(([e,p])=>`${p.ico} ${p.n} (${UNO_EL[e].n})`).join(' · ')}. +2 em +2 e +4 em +4 empilham. Com 1 carta, aperte TULPA! (ou T).`
};
defineArcadeGame('uno',{...GAMES12.uno,make:uno43,setup:unoSetup43,top3:true,modes:['ai','mesa'],
  desc:'5 Cartas de Poder elementais, pilha de +2/+4, Colapso de Lucidez, botão TULPA! com delação e partidas em Melhor de 3 ou por Pontos.',
  rule:'Faltando gente, Perseus completam a mesa. Na aposta com 3 ou mais, o pote vai para o pódio.',
  keys:'Clique na carta · Espaço compra/passa · T grita TULPA!',touch:'Toque na carta · toque no monte para comprar · TULPA! no canto'});
console.info('[Tulpa] Etapa 43 carregada (UNO Teosófico 2.0)');

