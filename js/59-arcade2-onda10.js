/* ===================================================================
   TULPA · ETAPA 56 — 🕹 ARCADE 2.0 · ONDA 10 (parte 1)
   ⬆️ SALTO ASTRAL 2.0
   Escalada de 5 Torres com regras próprias: Jardim, Gelo (escorrega),
   Ventania (vento lateral), Nuvens (somem depois de um pulo) e Véu
   (a Inexistência sobe atrás de você). Infinito com tudo misturado.
   Inimigos: Morcegos e Olhos Corrompidos. Pise neles por cima ou atire
   uma estrela (Espaço/K/✦). Poderes: Escudo, Ímã, Foguete, Asas
   (planar) e Mola de Bolso (super pulo).
   =================================================================== */
const SATW56=[{n:'Jardim Astral',ico:'🌿',goal:600,d:'A torre de sempre, agora com inimigos.',c:['#0b1430','#26365e']},{n:'Torre de Gelo',ico:'🧊',goal:800,d:'As patas escorregam: freie com antecedência.',c:['#0b1c2e','#3a6080']},
  {n:'Ventania',ico:'🌬',goal:1000,d:'O vento muda e empurra para os lados.',c:['#10202a','#2a4a52']},{n:'Mar de Nuvens',ico:'☁',goal:1200,d:'Nuvens somem depois de um pulo.',c:['#1a1a3a','#5a5a8a']},{n:'Véu Ascendente',ico:'🌫',goal:1500,d:'A Inexistência sobe atrás de você. Não pare.',c:['#0a0614','#2a1440']}];
function saProg56(){const p=prog38().sa||{};return{tw:p.tw||{},best:p.best||0}}
const saOpen56=i=>i===0||!!saProg56().tw[i-1];
const saSetup56={
  intro:o=>o._m==='mesa'?'Todos sobem a mesma torre ao mesmo tempo, como fantasmas. Vence a maior altura.':'Suba até o topo de cada Torre. Pise nos inimigos ou derrube com estrelas.',
  def:()=>({m:'esc',tw:'0'}),
  fields:o=>{const p=saProg56(),mesa=o._m==='mesa',F=[{k:'m',l:'Modo',opts:[{v:'esc',n:'Escalada',ico:'🏔',d:'5 Torres com regras próprias.'},{v:'inf',n:'Infinito',ico:'♾',d:'Sem topo. A Inexistência sobe depois de 2000.',badge:p.best?`🏆 ${p.best}`:''}]}];
    if(o.m==='esc')F.push({k:'tw',l:'Torre',wide:1,opts:SATW56.map((t,i)=>{const lock=!mesa&&!saOpen56(i),st=p.tw[i]||0;return{v:String(i),n:`${i+1}. ${t.n}`,ico:t.ico,d:lock?'Vença a Torre anterior.':`${t.d} Topo: ${t.goal}.`,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});return F},
  fix:o=>{if(!['esc','inf'].includes(o.m))o.m='esc';let i=Math.max(0,Math.min(4,+o.tw||0));if(o._m!=='mesa')while(i>0&&!saOpen56(i))i--;o.tw=String(i)},
  sum:()=>'A/D ou ←/→ andam (arraste no celular) · Espaço, K ou ✦ atiram estrelas para cima · pise nos inimigos por cima.'
};

const escH56=s=>esc(s);
/* ---------- 🎨 arte do Salto Astral (GFX60) · SOMENTE VISUAL ----------
   Direção: gravura astral vertical, um céu por Torre (o último é o do
   modo Infinito). Camadas fecham de cima a baixo. Não lê a semente. */
const SAART56=[
  {acc:'#7dffa8',sky:['#050b22','#14285a','#2e6a68'],amb:'vagalumes',ambc:'#e8ff9a',n:26},
  {acc:'#bfeaff',sky:['#030c1c','#103862','#5c9cc4'],amb:'neve',ambc:'#eef8ff',n:44},
  {acc:'#9ff0d8',sky:['#07161d','#14444c','#6a9a88'],amb:'folhas',ambc:'#e0c468',n:18},
  {acc:'#ffd2a8',sky:['#181442','#5a4488','#e8968a'],amb:'motes',ambc:'#ffe8c8',n:24},
  {acc:'#d08cff',sky:['#030108','#160926','#361048'],amb:'motes',ambc:'#c77dff',n:28},
  {acc:'#ffd36b',sky:['#02030c','#0e1038','#2e1a52'],amb:'motes',ambc:'#cfd8ff',n:30},
];
function saArt56(th){
  const G=window.GFX60,W=480,H=640,TAU=Math.PI*2,A=SAART56[th];
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const oval=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(r&&g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const wr=(g,w,h,fn)=>G.wrap(g,w,h,fn,{vert:true});
  const list=(r,n,fn)=>Array.from({length:n},(_,i)=>fn(r,i));

  /* ===== céu distante (0), silhuetas (1) e bordas (2) ===== */
  const stars=(g,w,h,r,n,col)=>G.paint.stars({n,col,top:0,bottom:1})(g,w,h,r);
  const FAR=[
    (g,w,h,r)=>{stars(g,w,h,r,80,'#d9ffe6');const N=list(r,5,r=>[r()*w,r()*h,70+r()*80]);wr(g,w,h,()=>N.forEach(([X,Y,R],i)=>G.glow(g,X,Y,R,i%2?'#2aa88a':'#3a4ac8',.2,{add:false})))},
    (g,w,h,r)=>{stars(g,w,h,r,90,'#e6f6ff');list(r,3,(r,i)=>({y:h*(i+.3)/3,a:22+r()*30,p:r()*TAU,c:['#4affc8','#6ac8ff','#b07aff'][i]})).forEach(b=>wr(g,w,h,()=>{for(let X=0;X<=w;X+=6){const Y=b.y+Math.sin(X/w*TAU*2+b.p)*b.a,L=50+30*Math.sin(X/w*TAU*5+b.p*2);const q=g.createLinearGradient(0,Y-L,0,Y+8);q.addColorStop(0,G.rgba(b.c,0));q.addColorStop(.8,G.rgba(b.c,.2));q.addColorStop(1,G.rgba(b.c,0));g.fillStyle=q;g.fillRect(X,Y-L,6,L+8)}}))},
    (g,w,h,r)=>{stars(g,w,h,r,30,'#d8fff0');const L=list(r,24,r=>[r()*w,r()*h,60+r()*150,r()]);wr(g,w,h,()=>L.forEach(([X,Y,len,k])=>{g.strokeStyle=G.rgba(k<.5?'#c8f0e0':'#2a6a68',.22);g.lineWidth=2+k*7;g.lineCap='round';g.beginPath();g.moveTo(X-len/2,Y+len*.08);g.quadraticCurveTo(X,Y-len*.08,X+len/2,Y);g.stroke()}))},
    (g,w,h,r)=>{stars(g,w,h,r,50,'#fff0e0');const L=list(r,14,r=>[r()*w,r()*h,24+r()*40]);wr(g,w,h,()=>L.forEach(([X,Y,R])=>[-1,0,1].forEach(k=>G.glow(g,X+k*R*.8,Y+Math.abs(k)*R*.22,R*(1.25-Math.abs(k)*.3),'#f0b0c0',.27,{add:false}))))},
    (g,w,h,r)=>{stars(g,w,h,r,40,'#e0c8ff');const N=list(r,6,r=>[r()*w,r()*h,70+r()*90]);wr(g,w,h,()=>N.forEach(([X,Y,R],i)=>G.glow(g,X,Y,R,i%2?'#7a1a9a':'#2a1050',.34,{add:false})))},
    (g,w,h,r)=>{stars(g,w,h,r,130,'#e8ecff');const N=list(r,8,r=>[r()*w,r()*h,60+r()*100]);wr(g,w,h,()=>N.forEach(([X,Y,R],i)=>G.glow(g,X,Y,R,['#3a4ac8','#9a3aa8','#1f8a9a'][i%3],.24,{add:false})));
      const C=list(r,4,r=>{let X=40+r()*(w-80),Y=r()*h;return list(r,5,r=>{X=Math.max(14,Math.min(w-14,X+(r()-.5)*90));Y+=(r()-.3)*50;return[X,Y]})});
      wr(g,w,h,()=>C.forEach(p=>{line(g,p,'rgba(255,224,150,.28)',1);p.forEach(([X,Y])=>{disc(g,X,Y,2,'#ffe9b0');G.glow(g,X,Y,9,'#ffd36b',.4,{add:false})})}))},
  ];
  const island=(g,X,Y,S,top,body)=>{G.poly(g,[[X-S,Y],[X-S*.5,Y-S*.12],[X+S*.45,Y-S*.08],[X+S,Y],[X+S*.4,Y+S*.38],[X+S*.08,Y+S*.8],[X-S*.35,Y+S*.42]],body);line(g,[[X-S,Y],[X-S*.5,Y-S*.12],[X+S*.45,Y-S*.08],[X+S,Y]],top,2.5)};
  const MID=[
    (g,w,h,r)=>{const L=list(r,6,(r,i)=>[50+r()*(w-100),(i+r()*.6)*h/6,24+r()*34,r()]);wr(g,w,h,()=>L.forEach(([X,Y,S,k])=>{island(g,X,Y,S,'#2f7a5a','#10323a');
      [-.45,.05,.5].forEach((u,j)=>{if(j===1||k>.4){box(g,X+u*S-1.5,Y-S*.45,3,S*.38,'#0e2a2c');disc(g,X+u*S,Y-S*.52,S*(j===1?.3:.2),'#175a48');disc(g,X+u*S-3,Y-S*.57,S*.11,'#2a8a62')}});
      line(g,[[X-S*.3,Y+S*.4],[X-S*.34,Y+S*1.1]],'rgba(80,190,140,.4)',1.5);disc(g,X-S*.34,Y+S*1.12,2,'#e8ff9a')}))},
    (g,w,h,r)=>{const L=list(r,8,(r,i)=>[40+r()*(w-80),(i+r()*.7)*h/8,14+r()*26]);wr(g,w,h,()=>L.forEach(([X,Y,S])=>{g.globalAlpha=.62;G.poly(g,[[X,Y-S*1.6],[X+S*.6,Y-S*.2],[X+S*.25,Y+S],[X-S*.2,Y+S*.7],[X-S*.65,Y]],'#2e6a98');G.poly(g,[[X,Y-S*1.6],[X-S*.65,Y],[X-S*.2,Y+S*.7],[X-S*.05,Y-S*.3]],'#8cc8e8');line(g,[[X,Y-S*1.6],[X-S*.05,Y-S*.3],[X-S*.2,Y+S*.7]],'#eaf9ff',1);g.globalAlpha=1}))},
    (g,w,h,r)=>{const L=list(r,5,(r,i)=>[70+r()*(w-140),(i+r()*.5)*h/5,26+r()*24,r()]);wr(g,w,h,()=>L.forEach(([X,Y,S,k])=>{g.globalAlpha=.75;
      if(k<.6){for(let j=0;j<2;j++){const yy=Y-j*S*.55,ww=S*(1-j*.28);G.poly(g,[[X-ww*1.25,yy-3],[X-ww*.7,yy-9],[X,yy-S*.5],[X+ww*.7,yy-9],[X+ww*1.25,yy-3],[X+ww*.8,yy+2],[X-ww*.8,yy+2]],'#0f3034');box(g,X-ww*.5,yy+2,ww,S*.25,'#143c40')}disc(g,X,Y-S*1.08,3,'#ffd36b');box(g,X-4,Y+4,8,S*.14,'#e8c468');G.poly(g,[[X-S*.7,Y+S*.28],[X+S*.7,Y+S*.28],[X,Y+S*.75]],'#0c2428')}
      else{G.poly(g,[[X,Y-S*.8],[X+S*.55,Y],[X,Y+S*.7],[X-S*.55,Y]],'#2f7a74');G.poly(g,[[X,Y-S*.8],[X+S*.55,Y],[X,Y]],'#c8a850');line(g,[[X,Y-S*.8],[X,Y+S*.7]],'#0c2428',1.5);line(g,[[X-S*.55,Y],[X+S*.55,Y]],'#0c2428',1.5);g.strokeStyle='rgba(210,240,220,.55)';g.lineWidth=1;g.beginPath();g.moveTo(X,Y+S*.7);g.bezierCurveTo(X-24,Y+S*1.1,X+20,Y+S*1.35,X-8,Y+S*1.8);g.stroke()}
      g.globalAlpha=1}))},
    (g,w,h,r)=>{const L=list(r,6,(r,i)=>[60+r()*(w-120),(i+r()*.5)*h/6,30+r()*30]);wr(g,w,h,()=>L.forEach(([X,Y,S])=>{g.globalAlpha=.5;
      [[-1.1,6,.55],[-.5,-6,.78],[.25,-12,.9],[.95,2,.62]].forEach(([u,v,q])=>disc(g,X+u*S,Y+v,S*q,'#f2c0c8'));[[-.55,-14,.55],[.2,-24,.62]].forEach(([u,v,q])=>disc(g,X+u*S,Y+v,S*q,'#ffe4dc'));box(g,X-S*1.65,Y+6,S*3.25,S*.5,'#c892b8',S*.25);g.globalAlpha=1}))},
    (g,w,h,r)=>{const L=list(r,7,(r,i)=>[50+r()*(w-100),(i+r()*.7)*h/7,13+r()*20,(r()-.5)*.5]);wr(g,w,h,()=>L.forEach(([X,Y,S,a])=>{g.save();g.translate(X,Y);g.rotate(a);G.glow(g,0,0,S*2.2,'#8a2ac0',.35,{add:false});
      g.beginPath();g.moveTo(-S,0);g.quadraticCurveTo(0,-S*.75,S,0);g.quadraticCurveTo(0,S*.75,-S,0);g.fillStyle='#0a0412';g.fill();g.strokeStyle='rgba(208,140,255,.55)';g.lineWidth=1.5;g.stroke();disc(g,0,0,S*.3,'#9a3ad0');oval(g,0,0,S*.07,S*.27,'#05010a');disc(g,-S*.1,-S*.12,S*.06,'#fff');g.restore()}))},
    (g,w,h,r)=>{const X1=90+r()*60,Y1=h*.28;wr(g,w,h,()=>{G.glow(g,X1,Y1,76,'#c8a050',.25,{add:false});disc(g,X1,Y1,32,vg(g,Y1-32,Y1+32,'#e8c478','#7a3a6a'));for(let k=-2;k<3;k++)oval(g,X1,Y1+k*10,31*Math.cos(k*.38),1.6,'rgba(60,20,60,.35)');g.strokeStyle='rgba(255,224,160,.75)';g.lineWidth=3;g.beginPath();g.ellipse(X1,Y1,56,13,-.3,-.25,Math.PI+.25);g.stroke()});
      const L=list(r,6,r=>[60+r()*(w-120),r()*h,3+r()*9]);wr(g,w,h,()=>L.forEach(([X,Y,R])=>{disc(g,X,Y,R,'#38306a');disc(g,X-R*.3,Y-R*.3,R*.5,'#6a5aa8')}))},
  ];
  const sides=fn=>(g,w,h,r)=>{[0,1].forEach(s=>{const L=list(r,7,(r,i)=>({y:(i+r()*.7)*h/7,len:60+r()*100,out:10+r()*30,k:r()}));wr(g,w,h,()=>{g.save();if(s){g.translate(w,0);g.scale(-1,1)}fn(g,L,h,s);g.restore()})})};
  const EDGE=[
    sides((g,L)=>L.forEach(q=>{const pts=Array.from({length:9},(_,i)=>[8+Math.sin(i*.9+q.k*6)*q.out*.5+q.out*.4,q.y+i*q.len/8]);line(g,pts,'#0d3326',5);pts.forEach(([X,Y],i)=>{if(i%2){oval(g,X+9,Y,9,4,'#1c6a42',.5);oval(g,X-6,Y+6,7,3.5,'#124a30',-.6)}});if(q.k>.55){const[X,Y]=pts[8];disc(g,X,Y+5,5,'#ff9ac8');disc(g,X,Y+5,2,'#fff0a0')}oval(g,0,q.y,q.out,q.len*.4,'#092218')})),
    sides((g,L)=>L.forEach(q=>{G.poly(g,[[-4,q.y-q.len*.6],[q.out*.7,q.y-q.len*.35],[q.out*.45,q.y],[q.out,q.y+q.len*.22],[-4,q.y+q.len*.55]],'rgba(116,184,222,.82)');line(g,[[q.out*.7,q.y-q.len*.35],[q.out*.45,q.y],[q.out,q.y+q.len*.22]],'#eaf9ff',1.5);for(let i=0;i<3;i++)G.poly(g,[[i*q.out*.28,q.y+q.len*.24],[i*q.out*.28+7,q.y+q.len*.24],[i*q.out*.28+3,q.y+q.len*(.45+i%2*.14)]],'rgba(214,242,255,.85)')})),
    sides((g,L)=>L.forEach((q,i)=>{if(i%2)return;const x1=q.out*2.2,y1=q.y+34;line(g,[[0,q.y],[x1*.5,q.y+26],[x1,y1]],'rgba(20,30,30,.8)',1.5);for(let k=1;k<5;k++){const X=x1*k/5,Y=q.y+34*k/5+Math.sin(k/5*Math.PI)*9;G.poly(g,[[X-4,Y],[X+7,Y+2],[X+2,Y+16]],['#c8584a','#e0c060','#4aa890','#e8e0c8'][(k+i)%4])}box(g,-2,q.y-26,7,70,'#143034')})),
    sides((g,L)=>L.forEach(q=>{g.globalAlpha=.72;[[0,0,1],[q.out*.8,10,.65],[q.out*.2,-20,.7]].forEach(([u,v,s])=>disc(g,u,q.y+v,(q.out+12)*s,'#ffdcd4'));disc(g,-4,q.y+16,q.out+16,'#d89ab8');g.globalAlpha=1})),
    sides((g,L)=>L.forEach(q=>{g.strokeStyle='#04010a';g.lineCap='round';for(let k=0;k<3;k++){g.lineWidth=9-k*2.6;g.beginPath();g.moveTo(-8,q.y+k*9);g.bezierCurveTo(q.out*1.8,q.y-q.len*.3,q.out*.2,q.y+q.len*.35,q.out*1.5+k*7,q.y+q.len*(.15+k*.1));g.stroke()}disc(g,q.out*1.5,q.y+q.len*.15,2.4,'#d08cff');oval(g,-2,q.y,q.out*.8,q.len*.35,'#07020e')})),
    sides((g,L)=>L.forEach(q=>{const R=q.out*.75,X=R*.4;G.poly(g,Array.from({length:8},(_,i)=>{const a=i*TAU/8+q.k,k=R*(.75+((i*7+3)%5)*.09);return[X+Math.cos(a)*k,q.y+Math.sin(a)*k]}),'#151236');disc(g,X-R*.2,q.y-R*.25,R*.35,'#2c2660');disc(g,X+R*.35,q.y+R*.2,R*.16,'#0a0820');if(q.k>.6)G.glow(g,q.out*1.6,q.y+30,8,'#ffd36b',.7,{add:false})})),
  ];
  const back=G.vparallax(`sa-${th}`,W,H,[{paint:FAR[th],speed:.06,drift:th===2?3:0},{paint:MID[th],speed:.17},{paint:EDGE[th],speed:.45}]);
  const sky=()=>G.bake(`sa:sky:${th}`,W,H,(g,w,h)=>{G.paint.sky(A.sky)(g,w,h);if(th===0){G.glow(g,390,96,70,'#d8ffe8',.35,{add:false});disc(g,390,96,22,'#effff4');g.globalCompositeOperation='source-atop';disc(g,400,88,18,'#1a3866');g.globalCompositeOperation='source-over'}if(th===3)G.glow(g,w/2,h*1.02,330,'#ffd49a',.55,{add:false});if(th===4)G.glow(g,w/2,h,300,'#7a1a9a',.45,{add:false})});
  /* horizonte do ponto de partida */
  const base=()=>G.bake(`sa:base:${th}`,W,230,(g,w,h,r)=>{const c=[['#12403a','#071c1c'],['#4a86ac','#16385a'],['#245450','#0c2426'],['#b87aa8','#4a2e64'],['#240c38','#090212'],['#1c1c4a','#0a0a20']][th];
    G.paint.ridge({col:c[0],base:.48,amp:.2,k:[1,3,6]})(g,w,h,r);G.paint.ridge({col:c[1],base:.74,amp:.12,k:[2,5,9]})(g,w,h,r);
    if(th===0)G.paint.trees({col:c[1],n:18,min:.12,max:.3,base:.84})(g,w,h,r);else if(th===1||th===4)G.paint.spires({col:c[1],n:14,min:.12,max:.34,base:.84,edge:G.rgba(A.acc,.4)})(g,w,h,r);else if(th===2)G.paint.pillars({col:c[1],n:7,min:.18,max:.36,base:.84})(g,w,h,r)});

  /* ===== plataformas (74 de largura, topo em y=12 do sprite) ===== */
  const slab=(g,top,bot,rim)=>{box(g,10,12,74,13,vg(g,12,25,top,bot),6);box(g,13,12,68,3.4,rim,2);box(g,15,12.4,50,1,'rgba(255,255,255,.75)');g.strokeStyle='rgba(6,2,12,.65)';g.lineWidth=1.4;g.beginPath();if(g.roundRect)g.roundRect(10,12,74,13,6);else g.rect(10,12,74,13);g.stroke()};
  const plat=type=>G.bake(`sa:plat:${th}:${type}`,94,50,(g,w,h,r)=>{
    if(type==='c'){[[20,19,10],[34,15,13],[52,14,14],[68,17,12],[76,21,8]].forEach(([X,Y,R])=>disc(g,X,Y+4,R,'#b8cce8'));[[20,18,9],[34,14,12],[52,13,13],[68,16,11],[75,20,7]].forEach(([X,Y,R])=>disc(g,X,Y+1,R,'#eef5ff'));box(g,13,16,68,11,'#eef5ff',5);[[32,13,6],[52,11,7]].forEach(([X,Y,R])=>disc(g,X,Y+2,R,'#ffffff'));line(g,[[20,25],[34,28],[52,26],[70,28]],'rgba(120,150,200,.6)',1.5);return}
    if(type==='b'){[[10,12,22],[34,13,24],[60,12,24]].forEach(([X,Y,W2],i)=>{box(g,X,Y,W2,12,vg(g,Y,Y+12,'#b4875a','#5a3c26'),2);box(g,X+1,Y,W2-2,2.4,'#e0bc8c');line(g,[[X+3,Y+6],[X+W2-4,Y+7+i%2]],'rgba(50,28,12,.6)',1);disc(g,X+4,Y+8,1.3,'#2e1c10')});
      line(g,[[30,12],[35,17],[31,20],[36,25]],'#1c0e06',2.2);line(g,[[58,12],[56,16],[61,19],[57,24]],'#1c0e06',2.2);line(g,[[45,13],[49,18],[46,24]],'#1c0e06',1.4);[[20,24,7],[48,25,10],[72,24,6]].forEach(([X,Y,L])=>G.poly(g,[[X-3,Y],[X+4,Y],[X+1,Y+L]],'#6a482c'));return}
    if(type==='m'){G.glow(g,26,29,13,'#5ad0ff',.9,{add:false});G.glow(g,68,29,13,'#5ad0ff',.9,{add:false});box(g,18,22,16,6,'#2a4a78',2);box(g,60,22,16,6,'#2a4a78',2);slab(g,'#7ab4f0','#24448a','#d4f0ff');
      [[-1,28],[1,66]].forEach(([d,X])=>{line(g,[[X-d*3,15.5],[X+d*3,19],[X-d*3,22.5]],'#eaffff',2);line(g,[[X+d*3,15.5],[X+d*9,19],[X+d*3,22.5]],'rgba(234,255,255,.5)',2)});disc(g,47,19,3.6,'#eaffff');disc(g,47,19,1.6,'#24448a');return}
    if(th===0){[[22,14],[40,19],[57,11],[73,16]].forEach(([X,L],i)=>{line(g,[[X,23],[X+(i%2?3:-3),23+L*.6],[X,23+L]],'#2e7a4a',1.6);oval(g,X,23+L,3,1.8,'#6fd070',i)});slab(g,'#6a6a78','#2e2c3c','#6fd860');[16,23,31,44,52,66,74,79].forEach((X,i)=>line(g,[[X,13],[X+(i%3-1)*2.4,7+i%2*2]],i%2?'#a8f080':'#4fb84c',1.8));disc(g,60,11,2.2,'#ffb0d0');disc(g,60,11,.9,'#fff')}
    else if(th===1){[[18,9],[28,15],[40,8],[54,18],[66,11],[76,14]].forEach(([X,L])=>{G.poly(g,[[X-3.5,23],[X+3.5,23],[X,23+L]],'rgba(200,238,255,.88)');line(g,[[X-1,24],[X,21+L]],'#fff',.8)});slab(g,'#d8f4ff','#4a90c4','#ffffff');G.poly(g,[[22,15],[32,15],[26,25],[18,25]],'rgba(255,255,255,.35)');G.poly(g,[[52,15],[57,15],[50,25],[46,25]],'rgba(255,255,255,.3)')}
    else if(th===2){slab(g,'#c0925c','#5a3a22','#e8c890');[30,48,66].forEach(X=>box(g,X,14,1.4,11,'#3a2414'));[19,71].forEach(X=>{box(g,X,10.5,6,16,'#e0cc98',1.5);for(let k=0;k<4;k++)line(g,[[X,13+k*3.6],[X+6,11+k*3.6]],'#8a6a38',1)});G.poly(g,[[40,25],[48,25],[44,40]],'#c8584a');G.poly(g,[[52,25],[59,25],[57,35]],'#4aa890')}
    else if(th===3){[[24,27,8],[40,29,10],[58,28,9],[72,26,7]].forEach(([X,Y,R])=>disc(g,X,Y,R,'rgba(255,224,220,.75)'));slab(g,'#fff0e0','#b0809c','#ffd270');[22,34,46,58,70].forEach(X=>G.poly(g,[[X,17],[X+3,20.5],[X,24],[X-3,20.5]],'#d89a50'))}
    else if(th===4){[[20,9],[38,17],[57,10],[73,15]].forEach(([X,L])=>{G.poly(g,[[X-5,23],[X+5,23],[X+1,23+L]],'#2a0e40');line(g,[[X-4,24],[X+1,23+L]],'#b46ae8',1)});slab(g,'#46285e','#12081e','#c77dff');[22,36,50,64,76].forEach((X,i)=>line(g,i%2?[[X-3,17],[X+3,22],[X-3,22]]:[[X,16.5],[X,23],[X+3,19]],'#e4b8ff',1.3))}
    else{G.glow(g,47,28,24,'#ffd36b',.3,{add:false});G.poly(g,[[24,24],[70,24],[56,34],[38,34]],'#4a3418');slab(g,'#f0cc74','#7a5420','#fff0b8');[24,47,70].forEach((X,i)=>G.icon(g,'estrela',X,19.5,i===1?10:7,'#2c1c50'))}
  },{s:2});
  const spring=()=>G.bake('sa:spring',24,18,g=>{box(g,3,14,18,4,'#6a4a20',1);line(g,[[5,14],[19,11.5],[5,9.5],[19,7]],'#e8eef8',2.2);g.fillStyle=vg(g,0,8,'#fff0a8','#e89a20');g.beginPath();g.ellipse(12,7,12,7,0,Math.PI,0);g.closePath();g.fill();line(g,[[1,7],[23,7]],'#7a4a10',1.4);disc(g,8,3.6,1.6,'#fff');disc(g,16,4.4,1.1,'#fff')},{s:2});

  /* ===== itens, perigos e inimigos ===== */
  const orb=()=>G.bake('sa:orb',26,26,g=>{G.poly(g,[[13,0],[16,10],[26,13],[16,16],[13,26],[10,16],[0,13],[10,10]],'#ffd04a');G.poly(g,[[13,5],[15,11],[21,13],[15,15],[13,21],[11,15],[5,13],[11,11]],'#fff6c8');disc(g,13,13,3,'#fff')},{s:2});
  const medal=(k,c)=>G.bake(`sa:pw:${k}`,40,40,g=>{disc(g,20,20,18,'#161028');g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(20,20,17,0,TAU);g.stroke();g.lineWidth=1;g.strokeStyle=G.rgba(c,.5);g.beginPath();g.arc(20,20,12.5,0,TAU);g.stroke();
    if(k==='sh'){G.icon(g,'escudo',20,20,21,c);G.icon(g,'estrela',20,19.5,9,'#fff')}
    else if(k==='mg'){g.strokeStyle='#ff6a8a';g.lineWidth=6;g.beginPath();g.moveTo(14,12);g.lineTo(14,21);g.arc(20,21,6,Math.PI,0,true);g.lineTo(26,12);g.stroke();box(g,11,10,6,5,'#fff');box(g,23,10,6,5,'#fff')}
    else if(k==='jt'){G.poly(g,[[20,7],[26,15],[26,25],[14,25],[14,15]],'#f0f4ff');G.poly(g,[[14,19],[9,28],[14,26]],'#ff5a4a');G.poly(g,[[26,19],[31,28],[26,26]],'#ff5a4a');disc(g,20,17,3,'#3a8aff');G.poly(g,[[16,26],[24,26],[20,34]],c)}
    else if(k==='wg'){g.save();g.translate(20,20);g.rotate(.7);oval(g,0,-1,6,13,'#eafaff');line(g,[[0,-12],[0,15]],'#3a6a8a',1.4);for(let i=0;i<4;i++){line(g,[[0,-6+i*5],[-5,-9+i*5]],'#7ab0cc',1);line(g,[[0,-6+i*5],[5,-9+i*5]],'#7ab0cc',1)}g.restore()}
    else{line(g,[[12,31],[28,28],[12,24],[28,20],[12,17]],'#e8fff0',2.6);G.poly(g,[[20,6],[29,15],[11,15]],c)}},{s:2});
  const trap=()=>G.bake('sa:trap',44,44,g=>{const P=(R,r2,n)=>Array.from({length:n*2},(_,i)=>{const a=i*Math.PI/n,k=i%2?r2:R;return[22+Math.cos(a)*k,22+Math.sin(a)*k]});G.poly(g,P(21,9,8),'#b14bff');G.poly(g,P(18,8,8),'#0a0014');disc(g,22,22,9,'#16042a');g.strokeStyle='#7a2ac0';g.lineWidth=1.5;g.beginPath();g.arc(22,22,6,0,TAU);g.stroke();oval(g,22,22,5,2.4,'#ff4a8a');disc(g,22,22,1.4,'#fff')},{s:2});
  const bat=()=>G.sheet('sa-bat',4,64,44,(g,i)=>{const cx=32,cy=22,k=[-1,-.25,.8,.2][i];[-1,1].forEach(s=>{const p=[[cx+s*6,cy-4],[cx+s*17,cy+k*10-10],[cx+s*30,cy+k*15-2],[cx+s*24,cy+k*9+3],[cx+s*20,cy+k*6],[cx+s*15,cy+k*3+7],[cx+s*7,cy+5]];G.poly(g,p,'#341050');line(g,p.slice(0,3),'#c77dff',1.6);line(g,[[cx+s*8,cy-1],[cx+s*20,cy+k*6]],'#8a4ac0',1)});
    G.poly(g,[[cx-9,cy-5],[cx-8,cy-15],[cx-2,cy-8]],'#250838');G.poly(g,[[cx+9,cy-5],[cx+8,cy-15],[cx+2,cy-8]],'#250838');disc(g,cx,cy,11,vg(g,cy-11,cy+11,'#6a2a90','#160422'));g.strokeStyle='#d89aff';g.lineWidth=1.2;g.beginPath();g.arc(cx,cy,11,0,TAU);g.stroke();
    [-4.5,4.5].forEach(d=>{oval(g,cx+d,cy-2,3.2,2.4,'#ff3a6a',d<0?.4:-.4);disc(g,cx+d-.8,cy-2.8,.8,'#fff')});G.poly(g,[[cx-4,cy+4],[cx-2.5,cy+8.5],[cx-1,cy+4.5],[cx+1,cy+4.5],[cx+2.5,cy+8.5],[cx+4,cy+4]],'#fff')});
  const eye=()=>G.sheet('sa-eye',4,48,62,(g,i)=>{const k=[-1,0,1,0][i];for(let t=0;t<5;t++){const X=12+t*6;g.strokeStyle=t%2?'#4a1466':'#6a2292';g.lineWidth=3.4;g.lineCap='round';g.beginPath();g.moveTo(X,32);g.quadraticCurveTo(X+k*(t%2?7:-7),45,X+(t-2)*3-k*4,55+(t%2)*4);g.stroke()}
    disc(g,24,22,18,'#38104e');disc(g,24,22,15,vg(g,7,37,'#fff4fa','#c89ad0'));[[10,16,17,20],[38,26,31,23],[16,34,20,28],[33,10,28,16]].forEach(([a,b,c,d])=>line(g,[[a,b],[c,d]],'rgba(210,40,90,.75)',1));g.strokeStyle='#c77dff';g.lineWidth=1.5;g.beginPath();g.arc(24,22,18,0,TAU);g.stroke()});
  const iris=()=>G.bake('sa:iris',16,16,g=>{disc(g,8,8,7.5,'#7a1ab0');disc(g,8,8,5,'#e0306a');oval(g,8,8,1.8,4.6,'#12001c');disc(g,5.5,5.5,1.6,'#fff')},{s:2});
  const shot=()=>G.bake('sa:shot',24,24,g=>{G.poly(g,[[12,0],[15,9],[24,12],[15,15],[12,24],[9,15],[0,12],[9,9]],'#ffd36b');disc(g,12,12,4,'#fffbe0')},{s:2});
  const bubble=()=>G.bake('sa:bubble',76,76,g=>{const q=g.createRadialGradient(38,38,16,38,38,37);q.addColorStop(0,'rgba(143,232,255,0)');q.addColorStop(.8,'rgba(143,232,255,.16)');q.addColorStop(1,'rgba(224,250,255,.65)');g.fillStyle=q;g.beginPath();g.arc(38,38,37,0,TAU);g.fill();g.strokeStyle='rgba(190,242,255,.95)';g.lineWidth=2;g.beginPath();g.arc(38,38,34,0,TAU);g.stroke();g.strokeStyle='#fff';g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(38,38,28,3.6,4.5);g.stroke()},{s:2});
  const wing=()=>G.bake('sa:wing',34,30,g=>{[[0,0,32,9],[2,6,28,8],[5,12,22,7],[9,18,15,5]].forEach(([X,Y,L,t],i)=>{g.fillStyle=i%2?'#cfeeff':'#ffffff';g.beginPath();g.moveTo(34,12+i*3);g.quadraticCurveTo(X+L*.4,Y-2,X,Y+2);g.quadraticCurveTo(X+L*.4,Y+t+3,34,16+i*3);g.fill()})},{s:2});
  /* arco do topo: a linha de chegada fica em y=52 do sprite */
  const gate=()=>G.bake('sa:gate',W,76,(g,w)=>{const q=vg(g,22,76,'rgba(255,211,107,0)','rgba(255,211,107,.5)','rgba(255,211,107,0)');g.fillStyle=q;g.fillRect(0,26,w,52);box(g,0,50,w,4,'#ffe49a');for(let i=0;i<w;i+=24)box(g,i,50,12,4,'#7a4a10');
    [6,w-22].forEach(X=>{box(g,X,2,16,66,vg(g,2,68,'#fff0b8','#8a5a18'),4);disc(g,X+8,6,9,'#ffd36b');G.icon(g,'estrela',X+8,6,12,'#5a3200')});g.strokeStyle='#e8c468';g.lineWidth=2;g.beginPath();g.moveTo(22,8);g.quadraticCurveTo(w/2,34,w-22,8);g.stroke();
    for(let i=1;i<14;i++){const u=i/14,X=22+(w-44)*u,Y=8+52*u*(1-u);G.poly(g,[[X-7,Y],[X+7,Y],[X,Y+13]],['#ff7a6a','#7fe3ff','#7dffa8','#c77dff'][i%4])}},{s:2});
  /* maré da Inexistência: a borda letal fica em y=44 */
  const tide=()=>G.bake('sa:void',W,104,(g,w,h)=>{g.fillStyle=vg(g,0,48,'rgba(110,20,160,0)','rgba(120,30,170,.7)');g.fillRect(0,0,w,48);const yy=X=>44+Math.sin(X/w*TAU*5)*5+Math.sin(X/w*TAU*11+1)*3;
    const path=()=>{g.beginPath();g.moveTo(0,yy(0));for(let X=4;X<=w;X+=4)g.lineTo(X,yy(X))};path();g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.fillStyle=vg(g,36,h,'#4a0c6c','#12031e','#05010a');g.fill();
    path();g.strokeStyle='rgba(230,180,255,.3)';g.lineWidth=8;g.stroke();path();g.strokeStyle='#e4a8ff';g.lineWidth=2;g.stroke();
    for(let i=0;i<10;i++){const X=24+i*48,Y=yy(X);g.strokeStyle='rgba(190,110,240,.65)';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(X,Y+2);g.quadraticCurveTo(X+(i%2?9:-9),Y-12,X+(i%2?1:-1),Y-18-(i%3)*4);g.stroke()}},{s:1});
  const streak=()=>G.bake('sa:streak',96,6,g=>{const q=g.createLinearGradient(0,0,96,0);q.addColorStop(0,'rgba(220,244,255,0)');q.addColorStop(.7,'rgba(220,244,255,.75)');q.addColorStop(1,'rgba(220,244,255,0)');g.fillStyle=q;g.beginPath();g.ellipse(48,3,48,1.8,0,0,TAU);g.fill()},{s:2});
  return{acc:A.acc,back,sky,base,plat,spring,orb,medal,trap,bat,eye,iris,shot,bubble,wing,gate,tide,streak,amb:G.ambient(A.amb,{W,H,n:A.n,col:A.ambc,seed:th+11})};
}

function salto56(C){
  const W=480,H=640,PWD=74,G=1450,JV=760,SPRING=1180,HS=330,R=22,o=C.room.opt||{},esc=o.m!=='inf',tw=esc?Math.max(0,Math.min(4,+o.tw||0)):-1,TW=esc?SATW56[tw]:null;
  const ICE=tw===1,WIND=tw===2||(!esc),CLOUD=tw===3,VOID=tw===4||!esc,GOAL=TW?TW.goal:Infinity;
  const S={x:W/2,y:60,vy:JV,vx:0,maxY:0,cam:0,orbs:0,taken:new Set(),broken:new Set(),inl:0,inr:0,tx:null,score:0,sh:0,mg:0,jt:0,wing:0,pw:new Set(),alt:0,
    shots:[],cool:0,kills:0,stomps:0,deadE:new Set(),wind:0,windT:0,voidY:-400,won:false,t:0,usedPw:false,orbTot:0},RC=ghostRace(C,S);
  const PWI={sh:['🛡','#8fe8ff','Escudo'],mg:['🧲','#ff8fb1','Ímã de orbes'],jt:['🚀','#ffd36b','Foguete'],wg:['🪶','#c9f0ff','Asas'],sp:['🌀','#7dffa8','Mola de Bolso']};
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
  /* somente visual: arte GFX60, HUD vestido, último quique e recorde na entrada */
  const GX=window.GFX60,TH=esc?tw:5,art=saArt56(TH),hop={k:-9,t:-1e9},best0=saProg56().best;
  GX.skin({acc:SAART56[TH].acc});
  const tsec=()=>Math.max(0,(Date.now()-C.t0)/1000);
  const MAXH=JV*JV/(2*G),SAFE=MAXH*.75;
  const GP=gdPick(C.gd,[{sp:[58,12],b:.04,m:.08,s:.08,trap:.03,tk:14,mv:50,ms:1.2,en:.05},{sp:[66,18],b:.1,m:.15,s:.06,trap:.08,tk:10,mv:70,ms:1.6,en:.08},{sp:[74,26],b:.16,m:.25,s:.05,trap:.13,tk:8,mv:85,ms:1.9,en:.11},{sp:[82,34],b:.22,m:.34,s:.04,trap:.19,tk:6,mv:100,ms:2.3,en:.14}]);
  const reachX=dy=>{const disc=JV*JV-2*G*dy;if(disc<0)return 0;return HS*((JV+Math.sqrt(disc))/G)*(ICE||WIND?.65:.8)};
  const cdist=(a,b)=>{const d=Math.abs(a-b)%W;return Math.min(d,W-d)};
  const rows=[],seed=C.seed+tw*7777;
  function row(k){
    while(rows.length<=k){
      const j=rows.length,r=i=>hrand(seed,j,i);
      if(j===0){rows.push({k:0,y:20,x:W/2,type:'n',orb:false,trap:false,tx:0,alt:null});continue}
      const prev=rows[j-1],ps=prev.alt||prev,dy=Math.min(SAFE,GP.sp[0]+r(1)*GP.sp[1]),y=prev.y+dy;
      const t=r(2);let type='n';if(j>5){if(t<GP.b)type='b';else if(t<GP.b+GP.m)type='m';else if(t<GP.b+GP.m+GP.s)type='s';else if(CLOUD&&t<GP.b+GP.m+GP.s+.35)type='c'}
      if(type==='b'&&prev.type==='b')type='n';
      const lim=Math.min(W/2,reachX(y+(type==='b'?8:0)-ps.y));
      const fit=(px,sd)=>cdist(px,ps.x)<=lim-2?px:clamp12(ps.x+(sd<.5?-1:1)*Math.min(60,lim*.5),40,W-40);
      let x,alt=null;
      if(type==='b'){const ax=fit(40+r(8)*(W-80),r(7));alt={x:ax,y:y+8,type:'n'};x=40+r(3)*(W-80);if(Math.abs(x-ax)<PWD+14)x=clamp12(ax+(ax<W/2?1:-1)*(PWD+36),40,W-40)}
      else x=fit(40+r(3)*(W-80),r(7));
      let tx=30+r(6)*(W-60);const trap=j>GP.tk&&r(5)<GP.trap;
      if(trap)[x,alt&&alt.x].forEach(px=>{if(px!=null&&cdist(tx,px)<80)tx=((tx+150)%(W-60))+30});
      const orb=j>2&&r(4)<.2;const en=j>10&&!trap&&r(13)<GP.en*(tw===0?.8:1)?{k:r(14)<.6?'bat':'eye',x0:30+r(15)*(W-60),y:y+95}:null;
      rows.push({k:j,y,x,type,orb,trap,tx,alt,en,pw:!orb&&j>8&&type!=='b'&&r(11)<.07?['sh','mg','jt','wg','sp'][Math.floor(r(12)*5)]:null});
    }
    return rows[k];
  }
  function plat(k){const rw=row(k);return rw.type==='m'?{...rw,x:clamp12(rw.x+Math.sin(tsec()*GP.ms+k)*GP.mv,PWD/2,W-PWD/2)}:rw}
  const enPos=(rw)=>{const e=rw.en;return{x:e.k==='bat'?clamp12(e.x0+Math.sin(tsec()*1.4+rw.k)*90,20,W-20):e.x0,y:e.y+(e.k==='eye'?Math.sin(tsec()*2+rw.k)*6:0)}};
  function kFrom(y){let k=0;while(row(k+8).y<y)k+=8;while(k>0&&row(k).y>y)k--;while(row(k+1).y<y)k++;return k}
  const score=()=>Math.floor(S.maxY/10)+S.orbs*50+S.kills*100;
  const sy0=y=>H-(y-S.cam)-30;
  function shoot(){if(S.dead||S.cool>0||Date.now()<C.t0)return;S.cool=.35;S.shots.push({x:S.x,y:S.y+30,vy:900});fx5('fumble')}
  function die(why){if(S.sh){S.sh=0;fx5('activate');C.fx?.flash('#8fe8ff',.3);C.fx?.float(S.x,sy0(S.y)-50,'Salvo!',{col:'#8fe8ff',size:22});GX.impact(S.x,sy0(S.y)-R,{col:'#8fe8ff'});S.inv=1;return false}
    C.fx?.shake(10,.4);GX.impact(S.x,sy0(S.y)-R,{col:'#d89aff',force:2});GX.emit('explosao',S.x,sy0(S.y)-R,{col:'#c77dff'});if(why)C.say(why,false);finish(false);return true}
  function finish(win){if(S.dead)return;if(win)GX.emit('confete',W/2,H*.3);else GX.emit('fumaca',S.x,H-24,{col:'#8a6ab0',size:1.6});S.won=win;const alt=Math.floor(S.maxY/10);let st=0,first=false,rec=false;
    if(win){st=1+(S.orbs>=Math.max(1,S.orbTot*.6)?1:0)+(!S.usedPw&&!S.saved?1:0)}
    progPut38(q=>{q.sa=q.sa||{};q.sa.tw=q.sa.tw||{};if(esc&&win){first=!q.sa.tw[tw];if(st>(q.sa.tw[tw]||0))q.sa.tw[tw]=st;if(SATW56.every((_,i)=>q.sa.tw[i]))C.achieve?.('sa_escalada')}if(!esc&&alt>(q.sa.best||0)){q.sa.best=alt;rec=true}});
    if(alt>=5000)C.achieve?.('sa_5000');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((alt/160+S.orbs*.6+S.kills*1.5)*mul)+(win?10+tw*3:0)+(first?15:0)+(rec?5:0)),why:[esc?TW.n:'Infinito',win?'★'.repeat(st):'',first?'torre nova':'',rec?'recorde':''].filter(Boolean).join(' · ')||`${alt} m`};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>⬆️ Altitude: <b>${alt}</b>${esc?` / ${GOAL}`:''}</li><li>✨ Orbes: <b>${S.orbs}</b> · ☠ Inimigos: <b>${S.kills}</b> (${S.stomps} pisões)</li></ul>${esc&&win&&first&&tw<4?`<p class="r38-hi">Torre ${tw+2}: ${escH56(SATW56[tw+1].n)} foi aberta.</p>`:''}`;
    if(C.net){RC.die(score()+(win?1000:0));return}
    S.dead=true;fx5(win?'mgWin':'fumble');
    C.finish({title:win?`⬆️ ${TW.n}: topo alcançado! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:esc?`⬆️ Você caiu na ${TW.n} · ${alt}/${GOAL}`:`⬆️ Você caiu a ${alt} de altitude`,rows:[{u:C.me,n:me.n,c:me.c,s:score(),w:win}],unit:'pts',html:S.html})}
  return{st:()=>S,row,plat,enPos,shoot,finish,
    g60intro:{title:esc?TW.n:'Salto Infinito',sub:esc?`Suba até ${GOAL}`:'Sem topo. Não pare.',acc:SAART56[TH].acc},
    reward:()=>S.rw||null,
    next(){if(C.net)return null;if(esc){if(S.won&&tw<4)return{opt:{tw:String(tw+1)},label:`Torre ${tw+2}: ${SATW56[tw+1].n}`};return{opt:{},label:'Tentar de novo'}}return{opt:{},label:'Subir de novo'}},
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')S.inl=v;else if(code==='KeyD'||code==='ArrowRight')S.inr=v;else if(down&&(code==='Space'||code==='KeyK'||code==='ArrowUp'||code==='KeyW'))shoot()},
    ptr(t,px){if(t==='up'){S.tx=null;return}if(t==='down'||t==='move'&&S.tx!=null)S.tx=px},
    step(dt){
      const now=Date.now();if(now<C.t0)return;if(S.dead)return;S.t+=dt;S.cool=Math.max(0,S.cool-dt);S.inv=Math.max(0,(S.inv||0)-dt);
      S.mg=Math.max(0,S.mg-dt);S.wing=Math.max(0,S.wing-dt);if(S.jt>0){S.jt=Math.max(0,S.jt-dt);S.vy=Math.max(S.vy,1100);if(Math.random()<.6)C.fx?.burst(S.x,sy0(S.y)+20,{n:2,col:['#ffd36b','#ff7a3a'],sp:120,life:.4,size:3,grav:300,ang:Math.PI/2,spread:.7})}
      if(WIND){S.windT-=dt;if(S.windT<=0){S.windT=3+Math.random()*3;S.windTo=(Math.random()-.5)*(esc?180:Math.min(180,S.maxY/40))}S.wind+=((S.windTo||0)-S.wind)*dt}
      let want=(S.inr-S.inl)*HS;if(S.tx!=null){const d=S.tx-S.x;want=Math.abs(d)<8?0:Math.sign(d)*HS}
      if(ICE)S.vx+=(want-S.vx)*Math.min(1,dt*2.2);else S.vx=want;
      S.x+=(S.vx+S.wind)*dt;if(S.x<-R)S.x=W+R;if(S.x>W+R)S.x=-R;S.f=S.vx?Math.sign(S.vx):S.f||1;
      const prevY=S.y;S.vy-=G*(S.wing>0&&S.vy<0?.25:1)*dt;if(S.wing>0&&S.vy<-160)S.vy=-160;S.y+=S.vy*dt;
      const k0=Math.max(0,kFrom(S.y-160));
      for(let k=k0;k<k0+6;k++){const p=plat(k),rw=row(k);
        for(const q of [p,p.alt]){if(!q)continue;const brk=q===p&&p.type==='b',cl=q===p&&p.type==='c';
          if(S.vy<0&&!((brk||cl)&&S.broken.has(k))&&prevY>=q.y&&S.y<=q.y&&Math.abs(S.x-q.x)<PWD/2+R*.6){
            if(brk){S.broken.add(k);fx5('error');C.fx?.burst(q.x,sy0(q.y),{n:10,col:['#8a6d55','#3a2a1e'],sp:120,life:.5,size:3,grav:700});GX.emit('estilhacos',q.x,sy0(q.y),{col:'#b4875a',amount:.8})}
            else{S.y=q.y;S.vy=q===p&&p.type==='s'?SPRING:JV;hop.k=q===p?k:-1;hop.t=performance.now();GX.emit(q===p&&p.type==='s'?'brilho':'poeira',S.x,sy0(q.y),{col:q===p&&p.type==='s'?'#ffd36b':art.acc,amount:.6,size:.8});if(cl){S.broken.add(k);C.fx?.burst(q.x,sy0(q.y),{n:10,col:['#fff','#ddeeff'],sp:90,life:.5,size:4,grav:-50})}fx5(q===p&&p.type==='s'?'activate':'mgJump');if(q===p&&p.type==='s')C.fx?.float(S.x,sy0(S.y)-50,'BOING!',{col:'#ffd36b',size:22,life:.7})}}}
        if(p.orb&&!S.taken.has(k)&&(Math.hypot(S.x-p.x,S.y-(p.y+44))<R+12||S.mg>0&&Math.hypot(S.x-p.x,S.y-(p.y+44))<170)){S.taken.add(k);S.orbs++;fx5('mgCoin');C.fx?.float(p.x,sy0(p.y+44)-20,'+50',{col:'#ffd36b',size:20,life:.7});GX.emit('coleta',p.x,sy0(p.y+44),{col:'#ffd36b'})}
        if(p.pw&&!S.pw.has(k)&&Math.hypot(S.x-p.x,S.y-(p.y+44))<R+16){S.pw.add(k);S.usedPw=true;const P=PWI[p.pw];fx5('activate');C.fx?.float(p.x,sy0(p.y+44)-30,P[2],{col:P[1],size:20});GX.emit('brilho',p.x,sy0(p.y+44),{col:P[1]});
          if(p.pw==='sh')S.sh=1;else if(p.pw==='mg')S.mg=8;else if(p.pw==='jt')S.jt=1.3;else if(p.pw==='wg')S.wing=4;else{S.vy=SPRING*1.6;fx5('bb5')}}
        if(rw.en&&!S.deadE.has(k)){const e=enPos(rw);
          S.shots.forEach(s=>{if(!s.dead&&Math.hypot(s.x-e.x,s.y-e.y)<26){s.dead=true;S.deadE.add(k);S.kills++;fx5('mgCoin');C.fx?.burst(e.x,sy0(e.y),{n:14,col:['#b14bff','#fff'],sp:180,life:.5,size:3});C.fx?.float(e.x,sy0(e.y)-20,'+100',{col:'#ffd36b',size:18});GX.impact(e.x,sy0(e.y),{col:'#d89aff',force:.6});GX.emit('estilhacos',e.x,sy0(e.y),{col:'#b14bff'})}});
          if(!S.deadE.has(k)&&Math.hypot(S.x-e.x,S.y-e.y)<R+18&&!(S.inv>0)){if(S.vy<0&&S.y>e.y+6){S.deadE.add(k);S.kills++;S.stomps++;S.vy=JV*1.05;fx5('bb4');C.fx?.float(e.x,sy0(e.y)-30,'PISÃO! +100',{col:'#ffd36b',size:20});GX.impact(e.x,sy0(e.y),{col:'#ffd36b',force:1.2});GX.emit('estilhacos',e.x,sy0(e.y),{col:'#b14bff'});if(S.stomps>=10)C.achieve?.('sa_pisao')}
            else if(S.jt<=0){if(die('Um Perseus Corrompido te derrubou.'))return;S.saved=1}}}
        if(p.trap&&Math.hypot(S.x-p.tx,S.y-(p.y+36))<R+10&&!(S.inv>0)){if(S.sh){S.sh=0;row(k).trap=false;S.saved=1;fx5('activate');C.fx?.float(S.x,sy0(S.y)-50,'Salvo!',{col:'#8fe8ff',size:22});GX.impact(S.x,sy0(S.y)-R,{col:'#8fe8ff'})}else{die('A Inexistência te pegou. Ela sempre pega.');return}}}
      S.shots.forEach(s=>{s.y+=s.vy*dt;if(s.y>S.cam+H+40)s.dead=true});S.shots=S.shots.filter(s=>!s.dead);
      S.maxY=Math.max(S.maxY,S.y);S.cam=Math.max(S.cam,S.y-H*.42);
      {const lastK=kFrom(S.maxY);let n=0;for(let k=0;k<=lastK;k++)if(row(k).orb)n++;S.orbTot=n}
      if(VOID&&(esc||S.maxY>20000)){const sp=esc?45+S.t*.25:40+(S.maxY-20000)/300;S.voidY=Math.max(S.voidY,S.cam-180)+sp*dt;if(S.y<S.voidY){if(!die('A Inexistência alcançou você.')){S.y=Math.max(S.y,S.cam+40);S.voidY=S.y-160;S.vy=SPRING}else return}}
      {const a=Math.floor(S.maxY/10/1000);if(a>S.alt){S.alt=a;fx5('bb'+Math.min(7,a+1));C.fx?.float(W/2,H*.32,`ALTITUDE ${a*1000}!`,{col:'#ffd36b',size:34,life:1.3});GX.emit('confete',W/2,H*.32,{amount:.6})}}
      if(esc&&Math.floor(S.maxY/10)>=GOAL){finish(true);return}
      if(S.y<S.cam-60){if(S.sh){S.sh=0;S.saved=1;S.y=S.cam+40;S.vy=SPRING*1.25;fx5('activate');C.fx?.float(S.x,H*.7,'Salvo!',{col:'#8fe8ff',size:26});GX.emit('brilho',S.x,sy0(S.y)-R,{col:'#8fe8ff',amount:1.5});return}C.say(sayFmt(SAY12.fall),false);finish(false);return}
      S.score=score();RC.send({x:Math.round(S.x),y:Math.round(S.y),s:S.score});
      C.hud(GX.chips([esc?{icon:'bandeira',label:TW.n,value:`${Math.floor(S.maxY/10)}/${GOAL}`}:{icon:'estrela',value:`${S.score} pontos`},{icon:'moeda',label:'Orbes',value:S.orbs},{icon:'caveira',label:'Inimigos',value:S.kills},
        S.sh?{icon:'escudo',value:'Escudo',tone:'ok'}:null,S.mg>0?{icon:'raio',label:'Ímã',value:`${Math.ceil(S.mg)} s`,tone:'ok'}:null,S.jt>0?{icon:'chama',value:'Foguete',tone:'ok'}:null,S.wing>0?{icon:'estrela',label:'Asas',value:`${Math.ceil(S.wing)} s`,tone:'ok'}:null,
        Math.abs(S.wind)>30?{icon:'alvo',label:'Vento',value:S.wind>0?'→':'←',tone:'warn'}:null]))},
    msg:RC.msg,left:RC.left,
    draw(x){
      const cam=S.cam,sy=y=>H-(y-cam)-30,red=GX.reduced(),t=red?0:performance.now()/1000,vt=performance.now(),acc=art.acc;
      /* céu, paralaxe vertical, horizonte de partida e ambiente */
      x.drawImage(art.sky(),0,0,W,H);art.back.draw(x,cam,red?0:t);
      {const by=H-190+cam*.55;if(by<H)x.drawImage(art.base(),0,by,W,230)}
      art.amb.draw(x,t,0);
      if(Math.abs(S.wind)>30){const sg=Math.sign(S.wind),k=Math.min(1,Math.abs(S.wind)/150),img=art.streak();for(let i=0;i<16;i++){const yy=((i*67+cam*.5)%H+H)%H,xx=(((red?0:vt/(3.4+i%3)*sg)+i*83)%(W+120)+W+120)%(W+120)-60;GX.draw(x,img,xx,yy,{w:70+(i%4)*22,alpha:.35+k*.45,rot:sg*.05})}}
      /* linha do recorde no Infinito */
      if(!esc&&best0>0){const ry=sy(best0*10);if(ry>-20&&ry<H+20){x.save();x.setLineDash([10,8]);x.strokeStyle='rgba(255,211,107,.75)';x.lineWidth=2;x.beginPath();x.moveTo(0,ry);x.lineTo(W,ry);x.stroke();x.restore();GX.hud.text(x,`Seu recorde: ${best0}`,10,ry-GX.fs(12)*.8,{size:12,col:'#ffd36b'})}}
      if(esc&&GOAL*10-cam<H+60){const gy=sy(GOAL*10);GX.glow(x,W/2,gy,260,'#ffd36b',.45,{sy:.2});GX.draw(x,art.gate(),W/2,gy,{ay:52/76});GX.hud.text(x,'TOPO',W/2,gy-26,{size:19,w:900,col:'#ffd36b',al:'center'})}
      /* plataformas, itens e inimigos */
      const k0=Math.max(0,kFrom(cam-80));let floor=null;
      const under=(px,py)=>{if(!S.dead&&Math.abs(S.x-px)<PWD/2+R*.6&&py<=S.y+2&&(floor==null||py>floor))floor=py};
      const put=(type,px,py,k,a)=>{let dip=0;if(k===hop.k&&!red){const d=(vt-hop.t)/260;if(d<1)dip=Math.sin(d*Math.PI*2)*5*(1-d)}x.globalAlpha=a??1;x.drawImage(art.plat(type),px-47,py-12+dip,94,50);x.globalAlpha=1;return dip};
      for(let k=k0;k<k0+16;k++){const p=plat(k),rw=row(k),y=sy(p.y);if(y<-60)break;if(y>H+60)continue;
        if(p.alt){const ay=sy(p.alt.y);under(p.alt.x,p.alt.y);put('n',p.alt.x,ay,-1)}
        if(!S.broken.has(k)){under(p.x,p.y);const type=p.type==='b'||p.type==='m'||p.type==='c'?p.type:'n';
          if(p.type==='m')GX.glow(x,p.x,y+16,52,'#5ad0ff',.4,{sy:.3});else if(p.type==='s')GX.glow(x,p.x,y-6,30,'#ffd36b',.5+(red?0:Math.sin(t*5+k)*.2));
          const dip=put(type,p.x,y,k,p.type==='c'?.93:1);
          if(p.type==='s')GX.draw(x,art.spring(),p.x,y+1+dip,{ay:1,sy:k===hop.k&&!red&&vt-hop.t<200?1+Math.sin((vt-hop.t)/200*Math.PI)*.7:1})}
        if(p.orb&&!S.taken.has(k)){const oy=sy(p.y+44)+(red?0:Math.sin(t*3+k)*2);GX.glow(x,p.x,oy,24,'#ffca3a',.65);GX.draw(x,art.orb(),p.x,oy,{w:22,rot:red?0:Math.sin(t*2+k)*.5})}
        if(p.pw&&!S.pw.has(k)){const oy=sy(p.y+44)+(red?0:Math.sin(vt/250+k)*4),P=PWI[p.pw];GX.glow(x,p.x,oy,34,P[1],.65,{add:false});GX.draw(x,art.medal(p.pw,P[1]),p.x,oy,{w:32})}
        if(p.trap){const ty=sy(p.y+36),pu=red?0:Math.sin(t*6+k);GX.glow(x,p.tx,ty,36+pu*5,'#a02aff',.75,{add:false});GX.draw(x,art.trap(),p.tx,ty,{w:38+pu*2,rot:red?0:t*1.3+k})}
        if(rw.en&&!S.deadE.has(k)){const e=enPos(rw),ey=sy(e.y);GX.glow(x,e.x,ey,36,'#b14bff',.55,{add:false});
          if(rw.en.k==='bat')GX.draw(x,GX.anim(art.bat(),t+k*.2,12),e.x,ey,{w:56});
          else{GX.draw(x,GX.anim(art.eye(),t+k*.3,5),e.x,ey,{w:42,ay:22/62});const dx=S.x-e.x,dy=sy(S.y)-R-ey,d=Math.hypot(dx,dy)||1;GX.draw(x,art.iris(),e.x+dx/d*5.5,ey+dy/d*5.5,{w:13})}
          x.strokeStyle='rgba(214,150,255,.35)';x.lineWidth=1.5;x.beginPath();x.arc(e.x,ey,19,0,Math.PI*2);x.stroke()}}
      S.shots.forEach(s=>{const y=sy(s.y);for(let k=1;k<4;k++)GX.glow(x,s.x,y+k*10,11-k*2,'#ffb81c',.55-k*.12);GX.glow(x,s.x,y,18,'#ffd36b',.7);GX.draw(x,art.shot(),s.x,y,{w:19,rot:red?0:t*9})});
      for(const u in S.gh){const g=S.gh[u];if(g.y==null)continue;const y=sy(g.y);if(y<-60||y>H+60)continue;GX.glow(x,g.x,y-R,32,'#bfe8ff',g.dead?.08:.22);mgCat(x,RC.col(u),g.x,y-R,48,RC.nm(u),{alpha:g.dead?.18:.42})}
      /* Perseus */
      if(!S.dead){const py=sy(S.y),cy=py-R;if(floor!=null&&S.y-floor<260)GX.shadow(x,S.x,sy(floor)+2,48,{alt:S.y-floor,alpha:.55});
        GX.glow(x,S.x,cy,46,acc,.2);
        if(S.jt>0){const fl=red?0:Math.sin(t*40)*5;GX.glow(x,S.x,py+14,30,'#ff7a2a',.9,{sy:1.6});GX.glow(x,S.x,py+6,17+fl,'#ffe07a',.9,{sy:1.5})}
        if(S.wing>0){const f=red?0:Math.sin(t*9)*.28;GX.draw(x,art.wing(),S.x-14,cy,{ax:1,rot:f});GX.draw(x,art.wing(),S.x+14,cy,{ax:1,rot:-f,flip:true})}
        const q=red?0:Math.max(0,1-(vt-hop.t)/190),st=red?0:Math.max(0,Math.min(.14,(Math.abs(S.vy)-300)/3800));
        x.save();x.translate(S.x,py);x.scale(1+.24*q-st*.55,1-.2*q+st);mgCat(x,me.c,0,-R,52,me.n,{flip:S.f<0,alpha:S.inv>0&&Math.floor(S.inv*12)%2?.4:1});x.restore();
        if(S.sh){GX.glow(x,S.x,cy,40,'#8fe8ff',.25);GX.draw(x,art.bubble(),S.x,cy,{w:68+(red?0:Math.sin(t*5)*3)})}
        if(S.mg>0){x.save();x.strokeStyle='rgba(255,143,177,.75)';x.lineWidth=2;x.setLineDash([5,8]);x.lineDashOffset=red?0:-t*46;x.beginPath();x.arc(S.x,cy,44+(red?0:Math.sin(t*7)*5),0,Math.PI*2);x.stroke();x.restore()}}
      if(VOID&&S.voidY>-300){const vy=sy(S.voidY);if(vy<H+20){const img=art.tide(),pass=(off,dy,a)=>{const o=((off%W)+W)%W;x.globalAlpha=a;x.drawImage(img,o-W,vy-44+dy,W,104);x.drawImage(img,o,vy-44+dy,W,104);x.globalAlpha=1};
        pass(red?0:t*34,0,1);pass(red?170:170-t*22,9,.55);if(vy+59<H){x.fillStyle='#05010a';x.fillRect(0,vy+59,W,H-vy-59)}
        for(let i=0;i<4;i++){const ex=60+i*118+(i%2)*24,ey=vy+34+(i*23)%46,bl=red?1:Math.max(0,Math.sin(t*1.3+i*1.9));if(bl>.15&&ey<H+8){GX.glow(x,ex-6,ey,6,'#ff5ab0',bl);GX.glow(x,ex+6,ey,6,'#ff5ab0',bl)}}
        GX.glow(x,W/2,vy,W*.75,'#9a2ae0',.3,{sy:.16})}}
      GX.vignette(x,W,H,{a:.38});
      /* HUD no canvas: placar e altímetro */
      {const s=GX.fs(28,20),str=String(esc?Math.floor(S.maxY/10):S.score),ph=s*1.5+(esc?GX.fs(11)*1.15:0),pw2=Math.max(s*3.4,136);
        GX.hud.panel(x,W/2-pw2/2,56,pw2,ph,{acc,a:.84});GX.hud.text(x,str,W/2,56+s*.8,{size:s,w:900,al:'center'});
        if(esc)GX.hud.text(x,`de ${GOAL}`,W/2,56+s*1.45+GX.fs(11)*.35,{size:11,al:'center',col:acc,w:600})}
      if(esc){const X=W-15,Y0=176,Y1=470,at=v=>Y1-(Y1-Y0)*clamp12(v/GOAL,0,1),py=at(S.maxY/10);
        x.fillStyle='rgba(10,6,18,.78)';rr21(x,X-6,Y0-5,12,Y1-Y0+10,6);x.fill();x.strokeStyle=GX.rgba(acc,.55);x.lineWidth=1;x.stroke();
        x.fillStyle=acc;rr21(x,X-3,py,6,Math.max(2,Y1-py),3);x.fill();
        if(VOID&&S.voidY>0){const vy=at(S.voidY/10);x.fillStyle='#b14bff';rr21(x,X-3,vy,6,Math.max(2,Y1-vy),3);x.fill();x.fillRect(X-9,vy-1,18,2)}
        GX.icon(x,'bandeira',X,Y0-18,17,'#ffd36b');GX.glow(x,X,py,13,acc,.8);GX.draw(x,art.orb(),X-1,py,{w:15})}
      GX.hud.frame(x,W,H,{acc,a:.55});
      if(S.dead&&!MG.over)GX.hud.banner(x,W,H,`Você caiu com ${S.score} pontos`,{sub:'Assistindo os outros…',acc:'#ff9b8a',y:H*.46})}
  };
}
Object.assign(ACH,{
  sa_escalada:{ico:'🏔',n:'Cinco Torres',d:'Chegue ao topo das 5 Torres do Salto Astral.'},
  sa_pisao:{ico:'🐾',n:'Pisão Astral',d:'Pise em 10 inimigos numa partida do Salto Astral.'},
  sa_5000:{ico:'⬆️',n:'Acima das Nuvens',d:'Alcance 5000 de altitude no Salto Astral.',secret:true},
});
{const _p=padHtml;padHtml=function(p){const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='sa56')return`<div>${b('KeyA','◀')}${b('Space','✦','','Atirar estrela')}${b('KeyD','▶')}</div>`;return _p.apply(this,arguments)}}
defineArcadeGame('salto',{...GAMES12.salto,make:salto56,setup:saSetup56,modes:['solo','mesa'],max:6,pad:'sa56',
  desc:'Escalada de 5 Torres com gelo, vento, nuvens e a Inexistência subindo. Inimigos para pisar ou derrubar com estrelas e 5 poderes.',
  rule:'Suba sem cair. Na Escalada, chegue ao topo da Torre.',keys:'A/D ou ←/→ andam · Espaço ou K atiram',touch:'Arraste para andar · ✦ atira'});
console.info('[Tulpa] Etapa 56 carregada (Salto Astral 2.0)');

/* ===================================================================
   TULPA · ETAPA 57 — 🕹 ARCADE 2.0 · ONDA 10 (parte 2)
   🧪 COLETA DE ESSÊNCIA 2.0
   Essências dos 5 Elementos caem no Caldeirão. Três iguais seguidas
   fazem uma Trinca (com efeito do Elemento); cinco diferentes fazem
   um Pentáculo. Perigos: Crânio, Bomba de Vazio (explode no chão) e
   Gelo (congela). Impulso (dash), 6 poderes, Ondas com o Colosso do
   Vazio a cada 5ª e a campanha das 8 Receitas.
   =================================================================== */
const COREC57=[
  {n:'Poção Verde',ico:'🌿',d:'Pegue 10 Essências da Natureza.',t:45,g:{el:{0:10}},bias:[0]},
  {n:'Tônico da Fé',ico:'✶',d:'Faça 3 Trincas.',t:60,g:{tri:3},bias:[4]},
  {n:'Elixir Duplo',ico:'⚖',d:'8 da Natureza e 8 da Fé.',t:60,g:{el:{0:8,4:8}},bias:[0,4]},
  {n:'Sopa de Ilusão',ico:'🌀',d:'12 de Ilusão, com chuva de Gelo.',t:60,g:{el:{2:12}},bias:[2],ice:.16},
  {n:'O Pentáculo',ico:'⛤',d:'Monte 1 Pentáculo: 5 Elementos diferentes seguidos.',t:60,g:{pen:1}},
  {n:'Fogo Cruzado',ico:'💣',d:'Faça 600 pontos sob Bombas de Vazio.',t:75,g:{pts:600},bomb:.14},
  {n:'Destilado do Vazio',ico:'◐',d:'2 Trincas e 1 Pentáculo.',t:100,g:{tri:2,pen:1},bias:[1]},
  {n:'A Grande Obra',ico:'👑',d:'Derrote o Colosso do Vazio.',t:90,g:{boss:1},boss:40}];
T3.COREC57=COREC57;
const COTRI57=['+1 vida','Vazio devora os perigos','Ímã','Câmera lenta','Escudo'];
function coProg57(){const p=prog38().co||{};return{rc:p.rc||{},best:p.best||0,wave:p.wave||0}}
const coOpen57=i=>i===0||!!coProg57().rc[i-1];
const coSetup57={
  intro:o=>o._m==='mesa'?'Todos na mesma chuva, disputando as mesmas Essências. O Colosso aparece na 5ª Onda e cai mais rápido em equipe.':o.m==='rec'?'Cada Receita pede uma mistura. Complete antes do tempo acabar.':'Ondas sem fim. A cada 5ª Onda, o Colosso do Vazio desce.',
  def:()=>({m:'arc',rc:'0'}),
  fields:o=>{if(o._m==='mesa')return[];const p=coProg57(),F=[{k:'m',l:'Modo',opts:[{v:'arc',n:'Ondas',ico:'🌊',d:'Sobreviva o máximo que puder.',badge:p.best?`🏆 ${p.best}`:''},{v:'rec',n:'Receitas',ico:'📜',d:'8 Receitas com metas e tempo.',badge:`${Object.keys(p.rc).length}/8`}]}];
    if(o.m==='rec')F.push({k:'rc',l:'Receita',wide:1,opts:COREC57.map((r,i)=>{const lock=!coOpen57(i),st=p.rc[i]||0;return{v:String(i),n:`${i+1}. ${r.n}`,ico:r.ico,d:lock?'Complete a Receita anterior.':`${r.d} ${r.t} s.`,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});return F},
  fix:o=>{if(o._m==='mesa'){o.m='arc';return}if(!['arc','rec'].includes(o.m))o.m='arc';let i=Math.max(0,Math.min(7,+o.rc||0));while(i>0&&!coOpen57(i))i--;o.rc=String(i)},
  sum:()=>'A/D ou ←/→ andam · Shift, S ou ⚡ dão um Impulso · 3 iguais = Trinca · 5 diferentes = Pentáculo.'
};

function coleta57(C){
  const W=480,H=640,BY=588,REACH=38,o=C.room.opt||{},rec=o.m==='rec'&&!C.net,RI=rec?Math.max(0,Math.min(7,+o.rc||0)):-1,RC=rec?COREC57[RI]:null;
  const VM=gdPick(C.gd,[.8,1,1.18,1.38]),SKULL=gdPick(C.gd,[.14,.2,.26,.32]),SPN=gdPick(C.gd,[.7,.6,.52,.44]),SPMIN=gdPick(C.gd,[.34,.28,.24,.2]),BHP=gdPick(C.gd,[.8,1,1.2,1.45]);
  const WAVE=25;
  const ps=C.players.map((p,i,a)=>({...p,x:W*(i+1)/(a.length+1),tx:W*(i+1)/(a.length+1),s:0,l:3,out:false,dx:W*(i+1)/(a.length+1),sh:0,mg:0,cb:0,cal:[],frz:0,big:0,hit:0}));
  const S={items:[],t:0,spawn:.6,snapAt:0,inAt:0,lastX:-1,ev:[],end:false,nid:1,kl:0,kr:0,slow:0,gold:0,wave:1,boss:null,bossN:0,
    dash:0,dashCd:0,dir:1,rp:{el:[0,0,0,0,0],tri:0,pen:0,boss:0},st:{tri:0,pen:0,boss:0,maxcb:0,dash:0},won:false,rw:null,html:''};
  const me=ps.find(p=>p.u===C.me);
  const KIND={e:{pts:10},g:{pts:30,col:'#ffd36b',ico:'✦'},v:{pts:25,col:'#ff5a6e',ico:'❤'},x:{col:'#2a0a2e',ico:'☠'},b:{col:'#3a1060',ico:'💣'},i:{col:'#bfe8ff',ico:'❄'},
    sh:{col:'#8fe8ff',ico:'🛡',n:'Escudo'},mg:{col:'#ff8fb1',ico:'🧲',n:'Ímã'},sl:{col:'#c9b0ff',ico:'⏳',n:'Câmera lenta'},l:{col:'#7dffa8',ico:'➕',n:'+1 vida'},gc:{col:'#ffb36b',ico:'🍯',n:'Caldeirão Grande'},gd:{col:'#ffd36b',ico:'🌟',n:'Chuva Dourada'}};
  const PW=['sh','mg','sl','l','gc','gd'],isPw=k=>PW.includes(k),bad=k=>k==='x'||k==='b'||k==='i';
  const elOf=it=>EL12[it.el|0];
  /* ---------- geração ---------- */
  function addItem(k,x,el,v,y){const it={id:S.nid++,x:x==null?24+Math.random()*(W-48):x,y:y==null?-20:y,k,v:v||(150+Math.min(230,S.t*2.6+(S.wave-1)*12)+Math.random()*60)*VM};if(k==='e')it.el=el==null?Math.floor(Math.random()*5):el;S.items.push(it);return it}
  function pickEl(){if(RC&&RC.bias&&Math.random()<.5)return RC.bias[Math.floor(Math.random()*RC.bias.length)];
    if(rec&&RC.g.el){const need=Object.keys(RC.g.el).filter(e=>S.rp.el[e]<RC.g.el[e]);if(need.length&&Math.random()<.35)return +need[Math.floor(Math.random()*need.length)]}return Math.floor(Math.random()*5)}
  function spawn(){
    if(S.t<S.gold){addItem('g');return}
    const bossOn=!!S.boss,lv=rec?1+RI*.5:S.wave;
    const pX=bossOn?0:Math.min(.45,SKULL*(1+(lv-1)*.05)),pB=bossOn?0:rec?(RC.bomb||(RI>=5?.05:0)):lv>=2?Math.min(.12,.04+lv*.01):0,pI=bossOn?.03:rec?(RC.ice||(RI>=3?.04:0)):lv>=3?.06:0,pP=S.t>6?.04:0,pV=.08;
    const r=Math.random();let a=pX;if(r<a)return addItem('x');if(r<(a+=pB))return addItem('b');if(r<(a+=pI))return addItem('i');if(r<(a+=pP))return addItem(PW[Math.floor(Math.random()*PW.length)]);if(r<(a+=pV))return addItem('v');
    addItem('e',null,pickEl())}
  /* ---------- Colosso do Vazio ---------- */
  function bossStart(hp){S.bossN++;const n=C.net?Math.max(1,ps.length):1;const max=Math.round((hp||(26+S.wave*3))*BHP*(1+(n-1)*.6));S.boss={x:W/2,vx:70,hp:max,max,t:0,atk:2,until:S.t+45};S.ev.push(['*','bs',max])}
  function bossHit(n,u){if(!S.boss)return;S.boss.hp-=n;S.ev.push(['*','bh',n,u]);if(S.boss.hp<=0){S.boss=null;ps.forEach(p=>{if(!p.out){p.s+=300;p.l=Math.min(5,p.l+1)}});S.st.boss++;S.rp.boss++;S.ev.push(['*','bd']);if(!rec)S.wave++;S.waveAt=S.t;C.achieve?.('co_colosso')}}
  function bossStep(dt){const B=S.boss;B.t+=dt;B.x+=B.vx*dt;if(B.x<70||B.x>W-70){B.vx*=-1;B.x=clamp12(B.x,70,W-70)}
    B.atk-=dt;if(B.atk<=0){const ph=B.hp<B.max/2;B.atk=ph?1.35:1.8;const pat=Math.floor(Math.random()*3);
      if(pat===0){const gap=40+Math.floor(Math.random()*5)*100;for(let x=40;x<W;x+=80)if(Math.abs(x-gap)>70)addItem('x',x,null,200*VM,40)}
      else if(pat===1){const tg=ps.filter(p=>!p.out);for(let i=0;i<(ph?3:2);i++){const p=tg[Math.floor(Math.random()*tg.length)];addItem('b',clamp12((p?p.x:W/2)+(Math.random()-.5)*120,30,W-30),null,230*VM,40)}}
      else for(let i=0;i<3;i++)addItem(i===1?'e':'i',clamp12(B.x+(i-1)*70,30,W-30),i===1?Math.floor(Math.random()*5):null,240*VM,40);
      S.ev.push(['*','ba'])}
    if(S.t>B.until){S.boss=null;S.ev.push(['*','bl']);if(!rec)S.wave++;S.waveAt=S.t}}
  /* ---------- Caldeirão ---------- */
  function brew(p,el){p.cal.push(el);if(p.cal.length>5)p.cal.shift();const c=p.cal,n=c.length;
    if(n>=3&&c[n-1]===c[n-2]&&c[n-2]===c[n-3]){p.cal=[];const b=60;p.s+=b;if(p===me){S.st.tri++;S.rp.tri++}S.ev.push([p.u,'tri',el,b]);triEff(p,el);bossHit(4,p.u);return}
    if(n===5&&new Set(c).size===5){p.cal=[];p.s+=200;if(p===me){S.st.pen++;S.rp.pen++;C.achieve?.('co_pentaculo')}S.ev.push([p.u,'pen',0,200]);S.gold=Math.max(S.gold,S.t+3);bossHit(12,p.u)}}
  function triEff(p,el){if(el===0)p.l=Math.min(5,p.l+1);else if(el===1){S.items.forEach(it=>{if(bad(it.k))it.got=true});S.ev.push(['*','void'])}else if(el===2)p.mg=S.t+6;else if(el===3)S.slow=S.t+4;else p.sh=1}
  function hurt(p,why){if(p.sh){p.sh=0;S.ev.push([p.u,'xs']);return}p.l--;p.cb=0;p.hit=1;if(p.l<=0)p.out=true;S.ev.push([p.u,why||'x'])}
  function catchIt(p,it){it.got=true;const k=it.k;
    if(k==='x'||k==='b'){hurt(p,k);return}
    if(k==='i'){p.frz=S.t+1.5;p.cb=0;S.ev.push([p.u,'i']);return}
    if(k==='sh'){p.sh=1}else if(k==='mg'){p.mg=S.t+7}else if(k==='sl'){S.slow=S.t+5}else if(k==='l'){p.l=Math.min(5,p.l+1)}else if(k==='gc'){p.big=S.t+8}else if(k==='gd'){S.gold=S.t+5}
    if(isPw(k)){S.ev.push([p.u,k]);return}
    p.s+=KIND[k].pts;p.cb++;if(p===me)S.st.maxcb=Math.max(S.st.maxcb,p.cb);S.ev.push([p.u,k,it.el|0]);
    if(p.cb%5===0){const bonus=p.cb*2;p.s+=bonus;S.ev.push([p.u,'cb',p.cb,bonus])}
    if(k==='e'){if(p===me)S.rp.el[it.el]++;bossHit(1,p.u);brew(p,it.el)}else if(k==='g')bossHit(2,p.u)}
  function goalOk(){if(!rec)return false;const g=RC.g;if(g.el&&Object.keys(g.el).some(e=>S.rp.el[e]<g.el[e]))return false;if(g.tri&&S.rp.tri<g.tri)return false;if(g.pen&&S.rp.pen<g.pen)return false;if(g.pts&&me.s<g.pts)return false;if(g.boss&&S.rp.boss<g.boss)return false;return true}
  function goalTxt(){if(!rec)return'';const g=RC.g,a=[];if(g.el)Object.keys(g.el).forEach(e=>a.push(`${EL12[e].g} ${Math.min(S.rp.el[e],g.el[e])}/${g.el[e]}`));if(g.tri)a.push(`Trincas ${Math.min(S.rp.tri,g.tri)}/${g.tri}`);if(g.pen)a.push(`⛤ ${Math.min(S.rp.pen,g.pen)}/${g.pen}`);if(g.pts)a.push(`${Math.min(me.s,g.pts)}/${g.pts} pts`);if(g.boss)a.push(S.rp.boss?'Colosso ✔':'Colosso');return a.join(' · ')}
  function hostStep(dt){
    S.t+=dt;S.spawn-=dt;
    if(S.spawn<=0){S.spawn=Math.max(SPMIN,(SPN-S.t*.004)*(S.t<S.gold?.45:1));spawn()}
    if(!rec&&!S.boss){const wt=S.waveAt||0;if(S.t-wt>WAVE){S.waveAt=S.t;if((S.wave+1)%5===0){S.wave++;bossStart()}else S.wave++;S.ev.push(['*','w',S.wave]);if(S.wave>=10)C.achieve?.('co_onda10')}}
    if(rec&&RC.g.boss&&!S.boss&&!S.rp.boss&&S.t>3&&!S.bossN)bossStart(RC.boss);
    if(S.boss)bossStep(dt);
    ps.forEach(p=>{if(p.u!==C.me&&!(p.frz>S.t)){const d=p.tx-p.x;p.x+=Math.sign(d)*Math.min(Math.abs(d),1100*dt)}});
    const slow=S.t<S.slow?.5:1;
    S.items.forEach(it=>{it.y+=it.v*slow*dt;if(it.got)return;
      if(!bad(it.k)){const mp=ps.find(q=>!q.out&&q.mg>S.t&&Math.abs(q.x-it.x)<170&&it.y>BY-300);if(mp)it.x+=Math.sign(mp.x-it.x)*Math.min(Math.abs(mp.x-it.x),300*dt)}
      if(it.y>BY-34&&it.y<BY+18){const p=ps.filter(q=>!q.out&&Math.abs(q.x-it.x)<REACH*(q.big>S.t?1.8:1)).sort((a,b)=>Math.abs(a.x-it.x)-Math.abs(b.x-it.x))[0];if(p)catchIt(p,it)}
      if(!it.got&&it.k==='b'&&it.y>=BY+18){it.got=true;S.ev.push(['*','boom',Math.round(it.x)]);ps.forEach(p=>{if(!p.out&&Math.abs(p.x-it.x)<85)hurt(p,'boom')})}});
    S.items=S.items.filter(it=>!it.got&&it.y<H+30);
    if(rec&&!S.end){if(goalOk())return endGame(true);if(S.t>=RC.t||me.out)return endGame(false)}
    if(!ps.some(p=>!p.out)&&!S.end)endGame(false);
  }
  function endGame(win){if(S.end)return;S.end=true;S.won=win;const sc=me?me.s:0;let st=0,first=false,recd=false;
    if(rec&&win)st=1+(S.t<=RC.t*.6?1:0)+(!me.hit?1:0);
    progPut38(q=>{q.co=q.co||{};q.co.rc=q.co.rc||{};if(rec&&win){first=!q.co.rc[RI];if(st>(q.co.rc[RI]||0))q.co.rc[RI]=st;if(COREC57.every((_,i)=>q.co.rc[i]))C.achieve?.('co_receitas')}if(!rec){if(sc>(q.co.best||0)){q.co.best=sc;recd=true}q.co.wave=Math.max(q.co.wave||0,S.wave)}});
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((sc/45+S.st.tri*2+S.st.pen*6+S.st.boss*12)*mul)+(win?10+RI*3:0)+(first?15:0)+(recd?5:0)),why:[rec?RC.n:`Onda ${S.wave}`,win?'★'.repeat(st):'',first?'Receita nova':'',recd?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>🧪 Pontos: <b>${sc}</b>${rec?'':` · 🌊 Onda <b>${S.wave}</b>`}</li><li>Trincas: <b>${S.st.tri}</b> · Pentáculos: <b>${S.st.pen}</b> · Colossos: <b>${S.st.boss}</b> · Maior combo: <b>${S.st.maxcb}</b></li>${rec?`<li>📜 ${esc(goalTxt())}</li>`:''}</ul>${rec&&win&&first&&RI<7?`<p class="r38-hi">Receita ${RI+2}: ${esc(COREC57[RI+1].n)} foi aberta.</p>`:''}`;
    fx5(win?'mgWin':'fumble');const best=Math.max(...ps.map(p=>p.s));
    C.finish({title:rec?(win?`🧪 ${RC.n}: pronta! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:`🧪 ${RC.n} desandou`):C.net?'Fim da coleta · vitória de '+ps.filter(p=>p.s===best).map(p=>p.n).join(' e '):`Fim · ${sc} pontos na Onda ${S.wave}`,
      rows:ps.map(p=>({u:p.u,n:p.n,c:p.c,s:p.s,w:rec?win:C.net&&p.s===best&&best>0})).sort((a,b)=>b.s-a.s),unit:'pts',html:S.html})}
  /* ---------- sensação ---------- */
  function feel(list){(list||[]).forEach(([u,k,a,b])=>{
    if(u==='*'){if(k==='w'){S.wave=a;fx5('mgWin');C.fx?.float(W/2,H*.32,(a%5===0?`ONDA ${a} · COLOSSO!`:`ONDA ${a}`),{col:a%5===0?'#c56bff':'#ffd36b',size:36,life:1.4});C.fx?.flash('#ffd36b',.15)}
      else if(k==='bs'){fx5('bb7');C.fx?.shake(8,.5);C.fx?.float(W/2,H*.4,'O COLOSSO DO VAZIO DESCE',{col:'#c56bff',size:26,life:1.6});C.say('Essências ferem o Colosso. Trincas e Pentáculos ferem mais.',false)}
      else if(k==='bd'){fx5('mgWin');C.fx?.flash('#ffffff',.4);C.fx?.burst(W/2,90,{n:40,col:['#c56bff','#ffd36b','#fff'],sp:300,life:1,size:4});C.fx?.float(W/2,H*.35,'COLOSSO DERROTADO! +300',{col:'#ffd36b',size:30,life:1.6})}
      else if(k==='bl'){C.fx?.float(W/2,H*.35,'O Colosso recuou…',{col:'#c9b0ff',size:22})}
      else if(k==='boom'){fx5('error');C.fx?.shake(6,.3);C.fx?.burst(a,BY+10,{n:22,col:['#8a3bd6','#2a0a2e','#ffb3ff'],sp:240,life:.6,size:4,grav:300})}
      else if(k==='void'){fx5('activate');C.fx?.flash('#6b4fa0',.3);C.fx?.float(W/2,H*.45,'◐ O Vazio devorou os perigos',{col:'#c9b0ff',size:22})}
      return}
    if(u!==C.me||!me)return;const px=me.x,py=BY-24;
    if(k==='x'||k==='b'||k==='boom'){fx5('fumble');C.fx?.shake(9,.35);C.fx?.flash('#e0233b',.25);C.fx?.burst(px,py,{n:16,col:['#c33cff','#2a0a2e'],sp:200,life:.6,size:3.4});if(me.l>0)C.say(me.l===1?'Última vida. Sem pressão.':k==='x'?'Isso era um crânio. Dica: crânios são ruins.':'Bomba de Vazio! Fique longe de onde ela cai.',false);return}
    if(k==='i'){fx5('error');C.fx?.float(px,py-30,'❄ Congelado!',{col:'#bfe8ff',size:20});return}
    if(k==='xs'){fx5('activate');C.fx?.float(px,py-30,'🛡 bloqueou!',{col:'#8fe8ff',size:20});C.fx?.burst(px,py,{n:14,kind:'ring',col:'#8fe8ff',sp:60,life:.5,size:6,grav:0});return}
    if(k==='tri'){fx5('bb5');const E=EL12[a];C.fx?.float(px,py-70,`TRINCA ${E.g} +${b}`,{col:E.c,size:26,life:1});C.fx?.float(px,py-40,COTRI57[a],{col:'#fff',size:16,life:1});C.fx?.burst(px,py,{n:22,kind:'star',col:[E.c,'#fff'],sp:220,life:.7,size:3.4});return}
    if(k==='pen'){fx5('bb7');C.fx?.flash('#ffd36b',.3);C.fx?.float(px,py-80,`⛤ PENTÁCULO! +${b}`,{col:'#ffd36b',size:30,life:1.3});C.fx?.burst(px,py-20,{n:40,kind:'star',col:EL12.map(e=>e.c),sp:300,life:.9,size:4});return}
    if(KIND[k]&&KIND[k].n){fx5('activate');C.fx?.float(px,py-34,KIND[k].ico+' '+KIND[k].n,{col:KIND[k].col,size:20});C.fx?.burst(px,py,{n:14,kind:'star',col:[KIND[k].col,'#fff'],sp:160,life:.6,size:3});return}
    if(k==='cb'){fx5('bb'+Math.min(7,Math.floor(a/5)+1));C.fx?.float(px,py-60,`COMBO ${a}! +${b}`,{col:'#ffd36b',size:24});return}
    const col=k==='e'?EL12[a].c:KIND[k]?.col||'#fff';fx5('mgCoin');C.fx?.burst(px,py,{n:8,col:[col,'#fff'],sp:130,life:.45,size:2.6,grav:200});C.fx?.float(px,py-26,'+'+(KIND[k]?.pts||0),{col,size:17,life:.6})})}
  function dash(){if(!me||me.out||S.dashCd>0||(C.host?me.frz>S.t:me.frzOn))return;S.dash=.14;S.dashCd=1.1;S.st.dash++;fx5('mgJump');C.fx?.burst(me.x,BY-10,{n:10,col:['#fff','#c9b0ff'],sp:120,life:.35,size:3,grav:0})}
  const pack=()=>({it:S.items.map(i=>[i.id,Math.round(i.x),Math.round(i.y),i.k,Math.round(i.v),i.el|0]),p:ps.map(p=>[p.u,Math.round(p.x),p.s,p.l,p.sh,p.mg>S.t?1:0,p.cb,p.cal.join(''),p.frz>S.t?1:0,p.big>S.t?1:0]),sl:S.t<S.slow?1:0,w:S.wave,bo:S.boss?[Math.round(S.boss.x),Math.max(0,S.boss.hp),S.boss.max]:0});
  return{
    st:()=>S,ps:()=>ps,addItem,brew,bossStart,goalOk,endGame,dash,
    reward:()=>S.rw,
    next(){if(C.net)return null;if(rec){if(S.won&&RI<7)return{opt:{rc:String(RI+1)},label:`Receita ${RI+2}: ${COREC57[RI+1].n}`};return{opt:{},label:'Tentar de novo'}}return{opt:{},label:'Jogar de novo'}},
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft'){S.kl=v;if(down)S.dir=-1}else if(code==='KeyD'||code==='ArrowRight'){S.kr=v;if(down)S.dir=1}else if(down&&(code==='ShiftLeft'||code==='ShiftRight'||code==='KeyS'||code==='ArrowDown'||code==='Space'))dash()},
    ptr(t,px,py,e){if(t==='up'){S.drag=false;return}if(t==='down')S.drag=true;if(t==='down'||S.drag||(e&&e.pointerType==='mouse')){if(me&&!me.out&&!(C.host?me.frz>S.t:me.frzOn)){if(Math.abs(px-me.x)>2)S.dir=Math.sign(px-me.x);me.x=clamp12(px,20,W-20)}}},
    step(dt){
      const now=Date.now();if(now<C.t0)return;
      S.dashCd=Math.max(0,S.dashCd-dt);
      if(me&&!me.out&&!(C.host?me.frz>S.t:me.frzOn)){let v=(S.kr-S.kl)*440;if(S.dash>0){S.dash-=dt;v=S.dir*1100}me.x=clamp12(me.x+v*dt,20,W-20);me.dx=me.x}
      if(C.host){if(!S.end){hostStep(dt);const ev=S.ev.splice(0);feel(ev);if(C.net){S.evq=(S.evq||[]).concat(ev);/* eventos saem junto, mas no máximo ~30 snapshots/s (antes era um por quadro) */if(now-S.snapAt>66||(S.evq.length&&now-S.snapAt>33)){S.snapAt=now;C.send('snap',{...pack(),ev:S.evq});S.evq=[]}}}}
      else{S.items.forEach(i=>{i.y+=i.v*(S.sl?.5:1)*dt});const k=Math.min(1,dt*12);ps.forEach(p=>{if(p!==me)p.dx+=(p.x-p.dx)*k});
        if(me&&Math.abs(me.x-S.lastX)>1&&now-S.inAt>50){S.inAt=now;S.lastX=me.x;C.send('in',{x:Math.round(me.x)})}}
      if(me){const bo=C.host?S.boss&&[0,S.boss.hp,S.boss.max]:S.bo;C.hud(`<b>${me.s}</b> pts · ${'❤'.repeat(Math.max(0,me.l))}${me.sh?' · 🛡':''}${(C.host?me.mg>S.t:me.mgOn)?' · 🧲':''}${(C.host?me.big>S.t:me.bigOn)?' · 🍯':''}${me.cb>=3?` · combo ${me.cb}`:''}${rec?` · ⏱ ${Math.max(0,Math.ceil(RC.t-S.t))} s · ${goalTxt()}`:` · 🌊 Onda ${S.wave}`}${bo?` · 👁 Colosso ${Math.max(0,bo[1])}/${bo[2]}`:''}${me.out?' · fora (assistindo)':''}`)}
    },
    msg(p){
      if(C.host&&p.t==='in'){const q=ps.find(x=>x.u===p.from);if(q)q.tx=clamp12(Number(p.x)||0,20,W-20)}
      if(!C.host&&p.t==='snap'){const old=new Map(S.items.map(i=>[i.id,i]));S.items=(p.it||[]).map(([id,x,y,k,v,el])=>{const o=old.get(id);return{id,x,y:o&&Math.abs(o.y-y)<40?o.y+(y-o.y)*.5:y,k,v,el}});
        S.sl=!!p.sl;if(p.w)S.wave=p.w;S.bo=p.bo||null;
        (p.p||[]).forEach(([u,x,s,l,sh,mg,cb,cal,frz,big])=>{const q=ps.find(z=>z.u===u);if(!q)return;if(q!==me)q.x=x;q.s=s;q.l=l;q.out=l<=0;q.sh=sh|0;q.mgOn=!!mg;q.cb=cb|0;q.cal=String(cal||'').split('').filter(Boolean).map(Number);q.frzOn=!!frz;q.bigOn=!!big});feel(p.ev)}
    },
    left(u){const q=ps.find(p=>p.u===u);if(q){q.out=true;q.l=0}},
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);const gold=C.host?S.t<S.gold:false;gr.addColorStop(0,gold?'#3a2a0a':'#14261f');gr.addColorStop(1,'#2d1d14');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='#3a2a1e';x.fillRect(0,BY+26,W,H-BY);x.fillStyle='#5b4330';x.fillRect(0,BY+26,W,3);
      /* Colosso */
      const bo=C.host?S.boss&&[S.boss.x,S.boss.hp,S.boss.max]:S.bo;
      if(bo){const bx=bo[0],t=Date.now()/400;x.save();x.shadowColor='#c56bff';x.shadowBlur=24;x.fillStyle='#1a0628';x.beginPath();x.ellipse(bx,70,62,38+Math.sin(t)*3,0,0,7);x.fill();x.restore();
        x.fillStyle='#fff';x.beginPath();x.ellipse(bx,66,20,14,0,0,7);x.fill();x.fillStyle='#c56bff';x.beginPath();x.arc(bx+Math.sin(t*1.3)*7,66,8,0,7);x.fill();
        for(let i=-2;i<=2;i++){x.strokeStyle='rgba(197,107,255,.6)';x.lineWidth=3;x.beginPath();x.moveTo(bx+i*22,100);x.quadraticCurveTo(bx+i*26+Math.sin(t+i)*10,125,bx+i*20,140);x.stroke()}
        x.fillStyle='rgba(0,0,0,.5)';x.fillRect(W/2-120,18,240,10);x.fillStyle='#c56bff';x.fillRect(W/2-120,18,240*Math.max(0,bo[1])/bo[2],10);t21(x,'Colosso do Vazio',W/2,38,{size:11,col:'#e6d0ff'})}
      /* sombras das bombas */
      S.items.forEach(it=>{if(it.k==='b'&&it.y>BY-320){const a=Math.min(1,(it.y-(BY-320))/300);x.fillStyle=`rgba(160,60,255,${.12+a*.25})`;x.beginPath();x.ellipse(it.x,BY+22,85,10,0,0,7);x.fill()}});
      S.items.forEach(it=>{const E=it.k==='e'?elOf(it):null,col=E?E.c:KIND[it.k].col,ico=E?E.g:KIND[it.k].ico;x.save();if(bad(it.k)){x.shadowColor=it.k==='i'?'#bfe8ff':'#c33cff';x.shadowBlur=14}else if(it.k==='g'){x.shadowColor='#ffd36b';x.shadowBlur=16}
        x.beginPath();x.arc(it.x,it.y,15,0,7);x.fillStyle=col;x.fill();x.restore();t21(x,ico,it.x,it.y+1,{size:17})});
      ps.filter(p=>p!==me).forEach(p=>{const px=C.host?p.x:p.dx;mgCat(x,p.c,px,BY,54,p.n+(C.net?' · '+p.s:''),{alpha:p.out?.18:.5})});
      if(me){const frz=C.host?me.frz>S.t:me.frzOn,big=C.host?me.big>S.t:me.bigOn;
        if(big&&!me.out){x.fillStyle='rgba(255,179,107,.18)';x.fillRect(me.x-REACH*1.8,BY-34,REACH*3.6,52)}
        mgCat(x,me.c,me.x,BY,58,me.n+(C.net?' · '+me.s:''),{alpha:me.out?.25:1,ring:true});
        if(frz&&!me.out){x.fillStyle='rgba(191,232,255,.45)';x.beginPath();x.roundRect?x.roundRect(me.x-32,BY-62,64,64,12):x.rect(me.x-32,BY-62,64,64);x.fill();t21(x,'❄',me.x,BY-70,{size:18})}
        if(me.sh&&!me.out){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(me.x,BY,36,0,7);x.stroke()}
        if((C.host?me.mg>S.t:me.mgOn)&&!me.out){x.strokeStyle='rgba(255,143,177,.4)';x.setLineDash([6,6]);x.beginPath();x.arc(me.x,BY-60,120,Math.PI*1.1,Math.PI*1.9);x.stroke();x.setLineDash([])}
        /* caldeirão: últimos 5 Elementos */
        const cx=W-12-5*26;x.fillStyle='rgba(0,0,0,.45)';x.fillRect(cx-8,BY+30,5*26+12,H-BY-30);for(let i=0;i<5;i++){const e=me.cal[i];x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1.5;x.beginPath();x.arc(cx+i*26+9,BY+41,9,0,7);x.stroke();if(e!=null){x.fillStyle=EL12[e].c;x.fill();t21(x,EL12[e].g,cx+i*26+9,BY+42,{size:10})}}
        t21(x,'Caldeirão',cx-50,BY+41,{size:11,col:'#d9cbb0'});
        if(S.dashCd>0){x.fillStyle='rgba(255,255,255,.5)';x.fillRect(12,BY+44,60*(1-S.dashCd/1.1),5)}t21(x,'⚡ Impulso',42,BY+38,{size:10,col:S.dashCd>0?'#8a7a66':'#fff'})}
      if(C.host?S.t<S.slow:S.sl){x.fillStyle='rgba(180,140,255,.1)';x.fillRect(0,0,W,H)}
      if(!bo){x.font='600 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='left';x.textBaseline='top';x.fillStyle='#d9cbb0';x.fillText('3 iguais = Trinca · 5 diferentes = ⛤ · 💣 explode no chão · ❄ congela',12,12);x.textAlign='right';x.fillText(rec?`${RC.ico} ${RC.n}`:`Onda ${S.wave}`,W-12,30)}
    }
  };
}
Object.assign(ACH,{
  co_receitas:{ico:'📜',n:'Mestre Alquimista',d:'Complete as 8 Receitas da Coleta de Essência.'},
  co_pentaculo:{ico:'⛤',n:'Pentáculo',d:'Junte 5 Elementos diferentes seguidos no Caldeirão.'},
  co_colosso:{ico:'👁',n:'Colosso Caído',d:'Derrote o Colosso do Vazio na Coleta de Essência.'},
  co_onda10:{ico:'🌊',n:'Décima Onda',d:'Chegue à Onda 10 da Coleta de Essência.',secret:true},
});
{const _p=padHtml;padHtml=function(p){const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='co57')return`<div>${b('KeyA','◀','wide')}${b('ShiftLeft','⚡','','Impulso')}${b('KeyD','▶','wide')}</div>`;return _p.apply(this,arguments)}}
defineArcadeGame('coleta',{...GAMES12.coleta,make:coleta57,setup:coSetup57,modes:['solo','mesa'],max:6,pad:'co57',
  desc:'Essências dos 5 Elementos: Trincas e Pentáculos no Caldeirão, Bombas de Vazio, Gelo, o Colosso a cada 5ª Onda e 8 Receitas.',
  rule:'Pegue Essências, fuja dos perigos. Nas Receitas, cumpra a mistura antes do tempo.',keys:'A/D ou ←/→ andam · Shift ou S dão Impulso',touch:'Arraste para andar · ⚡ Impulso'});
console.info('[Tulpa] Etapa 57 carregada (Coleta de Essência 2.0)');

