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

/* ---------- arte do Poço das Almas (somente visual) ----------
   Poço de pedra afundando em água espectral: pinos são lanternas de almas,
   o lançador é uma lanterna de bronze e o balde é um cálice boiando. */
function poArt52(){
  const G=window.GFX60,W=480,H=640,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const COL={b:'#3a8bff',o:'#ff8a2a',p:'#c070ff',g:'#3fd46a'};

  /* fundo: o poço visto de dentro, anéis de pedra afundando */
  const bg=fever=>G.bake('po:bg:'+(fever?1:0),W,H,(g,w,h,r)=>{
    g.fillStyle=fever?lg(g,0,0,0,h,'#4a1650','#2a0c3c','#12061e'):lg(g,0,0,0,h,'#123a48','#0c1c36','#07060f');g.fillRect(0,0,w,h);
    const tile=G.tile('pedra',{size:80,a:fever?'#5a3260':'#2c4a56',b:'#0a0e18',seed:21});
    G.fillTile(g,tile,0,0,w,h,{alpha:.34});
    for(let i=0;i<9;i++){const k=i/8,cy=-40+k*k*760,rx=330-k*40,ry=70+k*30;
      g.strokeStyle='rgba(0,0,0,.34)';g.lineWidth=16-i;g.beginPath();g.ellipse(240,cy,rx,ry,0,0,Math.PI);g.stroke();
      g.strokeStyle=G.rgba(fever?'#ff9bf0':'#7fe3ff',.09);g.lineWidth=1.5;g.beginPath();g.ellipse(240,cy+9,rx,ry,0,0,Math.PI);g.stroke()}
    g.fillStyle=rg(g,240,60,10,330,G.rgba(fever?'#ffb0f0':'#a8ecff',.2),'rgba(0,0,0,0)');g.fillRect(0,0,w,420);
    g.fillStyle=rg(g,240,330,130,420,'rgba(0,0,0,0)','rgba(0,0,0,.62)');g.fillRect(0,0,w,h);
    /* bordas de pedra e runas (finas: a esfera quica na borda da tela) */
    [[0,1],[w,-1]].forEach(([X,s])=>{g.save();g.translate(X,0);g.scale(s,1);
      G.fillTile(g,G.tile('pedra',{size:48,a:fever?'#7a4a80':'#4a6a72',b:'#10141e',seed:5}),0,0,9,h);
      g.fillStyle=lg(g,0,0,30,0,'rgba(0,0,0,.1)','rgba(0,0,0,.5)','rgba(0,0,0,0)');g.fillRect(0,0,30,h);
      g.fillStyle=fever?'#ff9bf0':'#6fd8e8';g.globalAlpha=.6;g.fillRect(8,0,1.2,h);
      for(let y=430;y<h-60;y+=46){g.globalAlpha=.25+r()*.35;line(g,[[3,y],[6,y+6],[3,y+12]],'#bff4ff',1.2);line(g,[[3,y+18],[7,y+18]],'#bff4ff',1.2)}g.restore()});
    /* arco do topo, com musgo pendurado */
    g.fillStyle=G.rgba('#05060c',.75);g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w,44);g.quadraticCurveTo(360,8,240,6);g.quadraticCurveTo(120,8,0,44);g.closePath();g.fill();
    line(g,[[0,44],[60,22],[130,10],[240,6],[350,10],[420,22],[480,44]],fever?'#8a4a90':'#3c6a70',3);
    for(let i=0;i<34;i++){const X=r()*w,y0=Math.max(4,Math.abs(X-240)/240*36),L=5+r()*22;if(Math.abs(X-240)<46)continue;
      line(g,[[X,y0],[X+(r()-.5)*6,y0+L*.6],[X+(r()-.5)*9,y0+L]],G.rgba(r()<.5?'#2f8a62':'#1d5a48',.8),1.6)}
  },{s:2});

  /* almas subindo ao fundo (sem estado) */
  const souls=G.ambient('motes',{W,H,n:26,col:'#8fe8ff',seed:31}),sparks=G.ambient('brasas',{W,H,n:30,col:'#ff9bf0',seed:8});
  const wisps=(x,t,fever)=>{(fever?sparks:souls).draw(x,t);
    if(G.reduced())t=0;
    for(let i=0;i<4;i++){const X=60+i*122+Math.sin(t*.5+i*2)*34,Y=H-((t*(16+i*5)+i*190)%(H+80))+40;
      G.glow(x,X,Y,26,fever?'#ff9bf0':'#6fd8e8',.16);G.glow(x,X+Math.sin(t*2+i)*5,Y+17,13,fever?'#ff9bf0':'#6fd8e8',.12,{sy:1.8})}};

  /* ===== pinos (raio 8; sprite 28×28) ===== */
  const peg=(k,lit)=>G.bake(`po:peg:${k}:${lit?1:0}`,28,28,g=>{const c=14,col=COL[k]||COL.b;
    disc(g,c+1,c+3,8.4,'rgba(0,0,0,.42)');
    disc(g,c,c,8.6,G.shade(col,-.68));
    disc(g,c,c,7.6,lit?rg(g,c-2,c-2,.5,9,'#ffffff','#ffffff',G.shade(col,.55)):rg(g,c-3,c-3,.5,12,G.shade(col,.62),col,G.shade(col,-.55)));
    if(k==='o'){g.fillStyle=lit?col:'#fff0b8';g.beginPath();g.moveTo(c,c-5.4);g.quadraticCurveTo(c+5,c-.6,c+3,c+3);g.quadraticCurveTo(c,c+6.2,c-3,c+3);g.quadraticCurveTo(c-4.4,c,c-1.4,c-1);g.quadraticCurveTo(c-.4,c-2.6,c,c-5.4);g.fill();
      disc(g,c,c+2.2,1.7,lit?'#fff3b0':'#ff7a1a')}
    else if(k==='p'){G.poly(g,[[c,c-5.6],[c+4.6,c],[c,c+5.6],[c-4.6,c]],lit?col:'#f0d8ff');G.poly(g,[[c,c-5.6],[c+4.6,c],[c,c]],lit?G.shade(col,.3):'#ffffff');G.poly(g,[[c,c+5.6],[c-4.6,c],[c,c]],G.shade(col,lit?-.2:.2))}
    else if(k==='g'){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?2.4:5.8;p.push([c+Math.cos(a)*q,c+Math.sin(a)*q])}G.poly(g,p,lit?col:'#eafff0')}
    else{g.strokeStyle=lit?col:'rgba(220,240,255,.75)';g.lineWidth=1.3;g.lineCap='round';g.beginPath();g.arc(c,c+.6,3.6,.2,Math.PI*1.45);g.stroke();disc(g,c+2.4,c-1.6,1.1,lit?col:'#e8f6ff')}
    if(lit)ring(g,c,c,8.4,col,2);else{g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(c-3.2,c-4,2.4,1.3,-.6,0,TAU);g.fill()}
  },{s:3});
  /* blindagem (2 acertos): aro de ferro com rebites */
  const armor=()=>G.bake('po:armor',30,30,g=>{ring(g,15,15,11.2,'#1a1e28',4.4);ring(g,15,15,11.2,'#cfd6e4',2.2);ring(g,15,15,12.2,'rgba(255,255,255,.4)',.6);
    for(let i=0;i<4;i++){const a=i*TAU/4+TAU/8;disc(g,15+Math.cos(a)*11.2,15+Math.sin(a)*11.2,2.2,'#2a3040');disc(g,15+Math.cos(a)*11.2-.4,15+Math.sin(a)*11.2-.5,1.4,'#fff')}},{s:3});
  /* bloco rúnico 26×10 */
  const brick=(k,lit,hard)=>G.bake(`po:brk:${k}:${lit?1:0}:${hard?1:0}`,32,16,g=>{const col=COL[k]||COL.b;
    box(g,4,5,26,10,'rgba(0,0,0,.42)',4);box(g,3,3,26,10,G.shade(col,-.65),4);
    box(g,4,4,24,8,lit?lg(g,0,4,0,12,'#ffffff','#ffffff',G.shade(col,.5)):lg(g,0,4,0,12,G.shade(col,.45),col,G.shade(col,-.45)),3);
    g.fillStyle='rgba(255,255,255,.5)';g.fillRect(6,4.6,20,1.2);
    line(g,[[11,6],[13,10],[15,6]],lit?col:'rgba(255,255,255,.8)',1.1);line(g,[[19,6],[19,10],[22,8]],lit?col:'rgba(255,255,255,.8)',1.1);
    if(hard){g.strokeStyle='#e8ecf4';g.lineWidth=1.8;g.beginPath();if(g.roundRect)g.roundRect(3,3,26,10,4);else g.rect(3,3,26,10);g.stroke();disc(g,6,8,1.5,'#fff');disc(g,26,8,1.5,'#fff')}
    else if(lit){g.strokeStyle=col;g.lineWidth=2;g.beginPath();if(g.roundRect)g.roundRect(3,3,26,10,4);else g.rect(3,3,26,10);g.stroke()}},{s:3});

  /* ===== obstáculos ===== */
  const rail=(x,x1,y1,x2,y2,iron)=>{line(x,[[x1+2,y1+4],[x2+2,y2+4]],'rgba(0,0,0,.4)',9);
    line(x,[[x1,y1],[x2,y2]],'#14100c',9.5);line(x,[[x1,y1],[x2,y2]],iron?'#8a68c8':'#b8863a',6.5);line(x,[[x1,y1-1.2],[x2,y2-1.2]],iron?'#e0ccff':'#ffe6a8',1.8);
    [[x1,y1],[x2,y2]].forEach(([X,Y])=>{disc(x,X,Y,4.6,'#14100c');disc(x,X,Y,3.4,iron?'#c8a8ff':'#e8c070');disc(x,X-1,Y-1,1.2,'#fff')})};
  const gear=()=>G.bake('po:gear',22,22,g=>{for(let i=0;i<8;i++){g.save();g.translate(11,11);g.rotate(i*TAU/8);box(g,-2,-10.4,4,5,'#d8c8f8',1);g.restore()}
    disc(g,11,11,7.4,'#1a1028');disc(g,11,11,6.2,rg(g,9,9,1,8,'#ffffff','#b89ae8','#4a2a7a'));disc(g,11,11,2,'#1a1028')},{s:3});
  const bumper=(r,hit)=>G.bake(`po:bmp:${r}:${hit?1:0}`,r*2+14,r*2+14,g=>{const c=r+7;
    disc(g,c+1.5,c+3,r+2.5,'rgba(0,0,0,.4)');disc(g,c,c,r+2.6,'#2a1408');disc(g,c,c,r+1.4,lg(g,0,c-r,0,c+r,'#fff0b0','#e0a030','#6a3a08'));
    disc(g,c,c,r-2.4,hit?'#ffffff':rg(g,c-r*.3,c-r*.35,1,r*1.3,'#ffd8f0','#ff5ab8','#6a0a48'));
    ring(g,c,c,r*.5,hit?'#ff7ac8':'rgba(255,255,255,.55)',2);disc(g,c,c,r*.2,hit?'#ffd36b':'#fff2c0');
    for(let i=0;i<6;i++){const a=i*TAU/6;disc(g,c+Math.cos(a)*(r+.2),c+Math.sin(a)*(r+.2),1.3,'#3a1c04')}},{s:3});
  const swirl=col=>G.bake('po:por:'+col,40,40,g=>{const c=20;disc(g,c,c,15,rg(g,c,c,1,15,'#02040a','#06101c',G.rgba(col,.85)));
    for(let i=0;i<4;i++){g.strokeStyle=G.rgba(i%2?'#ffffff':col,.85);g.lineWidth=2.4-i%2;g.lineCap='round';g.beginPath();for(let k=0;k<=14;k++){const a=i*TAU/4+k*.22,q=1.5+k*.92,X=c+Math.cos(a)*q,Y=c+Math.sin(a)*q;k?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
    ring(g,c,c,15.4,col,1.6)},{s:3});

  /* ===== lançador, água, balde e cálices ===== */
  const barrel=()=>G.bake('po:barrel',24,40,g=>{box(g,5,0,14,31,lg(g,5,0,19,0,'#4a2e10','#ffe0a0','#b8863a','#3a2008'),4);
    [6,17,26].forEach(y=>{box(g,3,y,18,3.6,'#2a1806',1.5);box(g,4,y+.6,16,1.4,'#ffd98a',1)});box(g,2,29,20,6,lg(g,2,0,22,0,'#6a4418','#ffeab0','#4a2c08'),2);
    box(g,7,33,10,3,'#0c0604',1.5)},{s:3});
  const cradle=()=>G.bake('po:cradle',96,44,g=>{g.strokeStyle='#14100c';g.lineWidth=6;g.beginPath();g.arc(48,10,28,.12,Math.PI-.12);g.stroke();g.strokeStyle='#b8863a';g.lineWidth=3.4;g.stroke();
    g.strokeStyle='#ffe0a0';g.lineWidth=1;g.beginPath();g.arc(48,9,28,.3,Math.PI-.3);g.stroke();[[20,13],[76,13]].forEach(([X,Y])=>{disc(g,X,Y,4.6,'#2a1806');disc(g,X,Y,3,'#8fe8ff')})},{s:2});
  const wave=(x,t,y,amp,col,k)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=16)x.lineTo(X,y+Math.sin(X*.05*k+t*1.8*k)*amp+Math.sin(X*.021-t*1.1)*amp*.7);x.lineTo(W,H);x.closePath();x.fill()};
  const water=(x,t,front,fever)=>{if(G.reduced())t=0;
    if(!front)wave(x,t,H-17,2.6,fever?'rgba(150,40,150,.5)':'rgba(30,120,140,.45)',1);
    else wave(x,t+2,H-8,2,fever?'rgba(60,10,80,.8)':'rgba(6,40,60,.78)',1.4)};
  const bucket=w=>G.bake('po:bkt:'+w,w+16,36,g=>{const big=w>92,c=big?'#4ad88a':'#2f9a62';g.translate(8,6);
    g.fillStyle=lg(g,0,0,0,22,G.shade(c,.35),c,G.shade(c,-.62));g.beginPath();g.moveTo(0,2);g.lineTo(w,2);g.quadraticCurveTo(w-3,20,w-16,21);g.lineTo(16,21);g.quadraticCurveTo(3,20,0,2);g.closePath();g.fill();
    g.strokeStyle='#08160e';g.lineWidth=2;g.stroke();
    box(g,-3,-2,w+6,6.4,lg(g,0,-2,0,5,'#fff0b0','#c8922c'),3);g.strokeStyle='#3a2406';g.lineWidth=1;g.stroke();
    [-2,w+2].forEach(X=>{disc(g,X,1.4,4.6,'#3a2406');disc(g,X,1.4,3,'#ffe6a0')})},{s:3});
  const pool=(i,lbl)=>G.bake(`po:pool:${i}:${lbl}`,96,40,g=>{const c=['#7a46c8','#c04ab8','#ffd36b','#c04ab8','#7a46c8'][i];
    box(g,3,8,90,34,lg(g,0,8,0,40,G.shade(c,.3),G.shade(c,-.62)),9);box(g,3,8,90,34,'rgba(0,0,0,.1)',9);
    box(g,2,6,92,5,lg(g,0,6,0,11,'#fff4c0','#c8922c'),2.5);g.fillStyle='rgba(255,255,255,.22)';g.fillRect(10,13,6,24);},{s:2});
  /* tubo de reserva de esferas, à esquerda */
  const tube=()=>G.bake('po:tube',22,334,g=>{box(g,1,4,20,326,'rgba(4,8,18,.66)',10);g.strokeStyle='rgba(143,232,255,.55)';g.lineWidth=1.4;g.stroke();
    box(g,0,0,22,7,lg(g,0,0,0,7,'#ffe6a0','#8a5a18'),3);box(g,0,327,22,7,lg(g,0,327,0,334,'#ffe6a0','#8a5a18'),3);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(4,10,2.4,314)},{s:2});
  return{COL,bg,wisps,peg,armor,brick,rail,gear,bumper,swirl,barrel,cradle,water,bucket,pool,tube};
}
function poco52(C){
  const W=480,H=640,LX=W/2,LY=46,PR=8,BR=7,G=620,o=C.room.opt||{},pvp=!!C.net,me=me16(C);
  const lv=o.m==='l'&&!pvp?-1:Math.max(0,Math.min(14,+o.lv||0)),pw=POMK52.includes(o.pw)?o.pw:'multi';
  const B=poBuild52(lv,lv<0?C.seed:7);const pegs=B.P,objs=B.O,NOR=pegs.filter(p=>p.k==='o').length;
  const BALLS=pvp?8:gdPick(C.gd,[12,10,10,9]);
  const ps=pvp?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c}];const myI=pvp?Math.max(0,ps.findIndex(p=>p.u===C.me)):0;
  const S={ang:Math.PI/2,balls:pvp?[BALLS,BALLS]:[BALLS],score:ps.map(()=>0),turn:0,T:0,ts:1,slowT:0,zoom:null,bucket:W/2,bdir:1,ballsIn:[],trail:[],pops:[],done:false,won:false,
    pw:{k:pw,shots:0,ready:false},shot:null,fever:false,feverHit:null,used:{},stats:{long:0,multi:0,free:0,feverBig:0},sendAt:0,purple:-1,wonBucket:null,aim:null};
  const rnd=mb32((C.seed^0xb0)>>>0||5);
  /* visual (GFX60): GX é o motor; G aqui é a gravidade */
  const GX=window.GFX60,art=poArt52(),T=(x,s,X,Y,o)=>GX.hud.text(x,s,X,Y,{al:'center',...o}),PICO={multi:'gota',sol:'sol',ver:'olho',nat:'folha',ine:'espiral'};
  GX.skin({acc:'#7fe3ff'});
  /* efeitos nascem comparando o estado entre dois quadros (vale para anfitrião e convidado) */
  const V={on:false,lit:[],gone:[],hp:[],bump:[],fever:false,balls:0};
  function watch(){
    pegs.forEach((p,i)=>{const col=art.COL[p.k]||art.COL.b;
      if(V.on){if(p.lit&&!V.lit[i])GX.emit('coleta',p.x,p.y,{col,amount:p.k==='b'?.45:.8,size:.85});
        if(p.gone&&!V.gone[i])GX.emit('estilhacos',p.x,p.y,{col,amount:.22,size:.7});
        if(!p.gone&&p.hp<V.hp[i])GX.emit('estilhacos',p.x,p.y,{col:'#e8ecf4',amount:.35,size:.7})}
      V.lit[i]=!!p.lit;V.gone[i]=!!p.gone;V.hp[i]=p.hp});
    objs.forEach((q,i)=>{if(q.t!=='bump')return;if(V.on&&q.hitT&&q.hitT!==V.bump[i])GX.emit('impacto',q.x,q.y,{col:'#ff9be0',amount:.5,size:.8});V.bump[i]=q.hitT});
    if(V.on&&S.fever&&!V.fever){const z=S.zoom||{x:W/2,y:H/2};GX.impact(z.x,z.y,{col:'#ff9bf0',force:2});GX.emit('confete',W/2,H*.3)}
    const bl=S.balls.reduce((a,n)=>a+n,0);if(V.on&&bl>V.balls){GX.emit('brilho',S.bucket,H-34,{col:'#7dffa8'});GX.hitstop(50)}
    V.balls=bl;V.fever=S.fever;V.on=true}
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
  function activate(b){const k=S.pw.k;C.fx?.float(W/2,140,`${POM52[k].n}!`,{col:'#7dffa8',size:22});fx5('bb5');
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
  function guide(x){const full=S.pw.k==='ver'&&S.pw.shots>0;let b={x:LX,y:LY,vx:Math.cos(S.ang)*580,vy:Math.sin(S.ang)*580,sim:1,lastHit:null},n=full?150:24;
    const save=pegs.map(p=>[p.lit,p.hp]);const lp=lightPeg;let bounces=0;
    for(let i=0;i<n;i++){const h=.02;b.vy+=G*h;b.x+=b.vx*h;b.y+=b.vy*h;if(full){const vx=b.vx,vy=b.vy;for(const p of pegs){if(p.gone||p.br)continue;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<PR+BR&&d>0){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.72*vn*nx;b.vy-=1.72*vn*ny}b.x=p.x+nx*(PR+BR+.5);b.y=p.y+ny*(PR+BR+.5);bounces++}}}
      if(b.x<BR||b.x>W-BR)b.vx=-b.vx;if(b.y>H)break;if(i%2){x.globalAlpha=full?1:Math.max(.45,1-i/n*.6);x.fillStyle='rgba(3,8,16,.75)';x.fillRect(b.x-2.5,b.y-2.5,5,5);x.fillStyle=full?'#7dffa8':'#eafaff';x.fillRect(b.x-1.5,b.y-1.5,3,3);x.globalAlpha=1}}}
  return{g60intro:{title:lv>=0?POLV52[lv]:'Tabuleiro livre',sub:'Limpe os pinos laranja',acc:'#7fe3ff'},st:()=>S,pegs,objs,shoot,doShoot,activate:()=>S.ballsIn[0]&&activate(S.ballsIn[0]),
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
      {const bl=S.balls[pvp?myI:0];C.hud(GX.chips([{icon:'alvo',label:lv>=0?POLV52[lv]:'Livre'},{icon:'gota',label:'esferas',value:bl,tone:bl<=2?'bad':null},{icon:'chama',label:'laranja',value:`${leftO()}/${NOR}`},{icon:'raio',value:'×'+mult()},{icon:'estrela',value:S.score[myI]},
        {icon:PICO[S.pw.k],label:POM52[S.pw.k].n,value:S.pw.shots>0?S.pw.shots:null},pvp?{icon:'relogio',label:'vez de',value:ps[S.turn]?.n||'?'}:null,...(pvp?ps.map((q,i)=>({label:q.n,value:S.score[i]})):[])]))}},
    draw(x){
      const now=performance.now(),t=now/1000,fever=!!S.fever,still=GX.reduced();watch();
      GX.draw(x,art.bg(fever),W/2,H/2,{w:W,h:H});art.wisps(x,t,fever);
      if(fever)GX.rays(x,W/2,60,{n:9,len:520,col:'#ff9bf0',a:.1,t:t*3});
      x.save();if(S.slowT>0&&S.zoom){const k=1+.35*Math.min(1,S.slowT);x.translate(S.zoom.x,S.zoom.y);x.scale(k,k);x.translate(-S.zoom.x,-S.zoom.y)}
      art.water(x,t,false,fever);
      if(!S.ballsIn.length&&!(S.ballsV&&S.ballsV.length)&&!S.done&&(!pvp||S.turn===myI))guide(x);
      objs.forEach(q=>{if(q.t==='seg')art.rail(x,q.x1,q.y1,q.x2,q.y2,false);
        else if(q.t==='bar'){const c=Math.cos(q.a)*q.len/2,s=Math.sin(q.a)*q.len/2;GX.glow(x,q.cx,q.cy,q.len*.42,'#b48cff',.14);art.rail(x,q.cx-c,q.cy-s,q.cx+c,q.cy+s,true);GX.draw(x,art.gear(),q.cx,q.cy,{rot:q.a*2})}
        else if(q.t==='bump'){const hit=now-(q.hitT||0)<150;if(hit)GX.glow(x,q.x,q.y,q.r*2.8,'#ff9be0',.8);else GX.glow(x,q.x,q.y,q.r*1.9,'#ff5ab8',.22);
          GX.draw(x,art.bumper(q.r,hit),q.x,q.y,{sx:hit&&!still?1.16:1,sy:hit&&!still?1.16:1})}
        else if(q.t==='por'){[[q.ax,q.ay,'#7dffa8'],[q.bx,q.by,'#ffb347']].forEach(([px,py,c],i)=>{GX.glow(x,px,py,30,c,.38);GX.draw(x,art.swirl(c),px,py,{rot:still?0:t*2.5*(i?-1:1),w:38,h:38})})}});
      pegs.forEach((p,i)=>{if(p.gone)return;const col=art.COL[p.k]||art.COL.b;
        if(p.br){if(p.lit)GX.glow(x,p.x,p.y,26,col,.75);else if(p.k!=='b')GX.glow(x,p.x,p.y,20,col,.28);GX.draw(x,art.brick(p.k,!!p.lit,p.hp>1),p.x,p.y,{rot:p.a});return}
        if(p.lit)GX.glow(x,p.x,p.y,25,col,.85);else if(p.k!=='b')GX.glow(x,p.x,p.y,17,col,p.k==='o'?.34+(still?0:.1*Math.sin(t*3+i)):.42);
        GX.draw(x,art.peg(p.k,!!p.lit),p.x,p.y);
        if(p.hp>1)GX.draw(x,art.armor(),p.x,p.y);else if(p.crack){x.strokeStyle='rgba(10,6,16,.75)';x.lineWidth=1.4;x.beginPath();x.moveTo(p.x-5,p.y-4);x.lineTo(p.x-1,p.y);x.lineTo(p.x+1,p.y+4);x.moveTo(p.x-1,p.y);x.lineTo(p.x+5,p.y-2);x.stroke()}
        if(p===S.feverHit&&S.slowT>0){x.strokeStyle='#ff9bf0';x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,PR+8+(still?0:Math.sin(now/60)*3),0,TAU16);x.stroke();GX.glow(x,p.x,p.y,46,'#ff9bf0',.6)}});
      const balls=S.ballsV&&!C.host&&pvp?S.ballsV.map(([a,b])=>({x:a,y:b})):S.ballsIn,hot=!!(balls[0]&&balls[0].sol);
      if(!still)S.trail.forEach(([tx,ty],i)=>{const k=i/S.trail.length;GX.glow(x,tx,ty,BR*(.6+k*1.3),hot?'#ff7a1a':'#ffd36b',k*.45)});
      balls.forEach(b=>{GX.glow(x,b.x,b.y,b.sol?30:19,b.sol?'#ff7a1a':'#ffe9a0',b.sol?.9:.6);
        if(b.sol){x.strokeStyle='#ffd36b';x.lineWidth=2;for(let i=0;i<6;i++){const a=i*TAU16/6+(still?0:t*7);x.beginPath();x.moveTo(b.x+Math.cos(a)*(BR+1),b.y+Math.sin(a)*(BR+1));x.lineTo(b.x+Math.cos(a+.25)*(BR+6),b.y+Math.sin(a+.25)*(BR+6));x.stroke()}}
        GX.draw(x,GX.prop.orb(b.sol?'#ff9b3d':'#ffd36b',BR),b.x,b.y);x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.4;x.beginPath();x.arc(b.x,b.y,BR,0,TAU16);x.stroke()});
      if(!fever){const bw=bucketW(),by=H-26;GX.glow(x,S.bucket,H-8,bw*.7,'#3fd46a',.3,{sy:.35});
        GX.draw(x,art.bucket(bw),S.bucket,by+12,{w:bw+16,h:36});
        T(x,'balde',S.bucket,H-15,{size:11,col:'#eafff0',min:9})}
      art.water(x,t,true,fever);
      x.restore();
      /* lançador */
      GX.draw(x,art.cradle(),LX,LY-2);x.save();x.translate(LX,LY);x.rotate(S.ang-Math.PI/2);GX.draw(x,art.barrel(),0,-3,{ay:0});x.restore();
      GX.glow(x,LX,LY-8,40,'#8fe8ff',.3);sprAt16(x,pvp?(ps[S.turn]?.c??me.c):me.c,LX,LY-12,48);
      if(fever)FB.forEach((v,i)=>{const bx=i*W/5,lbl=v>=1e5?'100 mil':v>=5e4?'50 mil':'10 mil';if(v>=1e5)GX.glow(x,bx+W/10,H-24,70,'#ffd36b',.45,{sy:.5});
        GX.draw(x,art.pool(i,lbl),bx+W/10,H-18,{w:W/5,h:40});T(x,lbl,bx+W/10,H-13,{size:13,w:900,col:i===2?'#fff6d0':'#fff',max:W/5-8})});
      GX.vignette(x,W,H,{a:.34});
      S.pops.forEach(p=>{const Y=p.y-p.t*40,a=Math.min(1,(1.1-p.t)*2.4);x.globalAlpha=Math.max(0,a);
        const s=GX.clean(p.s);if(!s)GX.icon(x,'escudo',p.x,Y,17,'#e8ecf4');else{const X=Math.max(70,Math.min(W-70,p.x));T(x,s,s.length>8?X:p.x,Y,{size:s.length>10?15:13,w:800,col:s.startsWith('+')?'#ffffff':'#ffd36b',max:W-40})}x.globalAlpha=1});
      /* HUD: almas laranja, pontos, reserva, multiplicador e poder */
      const left=leftO(),bl=S.balls[pvp?myI:0],m=mult(),mc=m>=10?'#ff9bf0':m>=5?'#ff8a2a':m>=2?'#ffd36b':'#bcd8ff';
      GX.hud.panel(x,5,7,150,38,{acc:'#ff8a2a',a:.82});T(x,'almas',14,18,{size:10,al:'left',col:'#ffd9b0',min:9});T(x,`${NOR-left}/${NOR}`,146,18,{size:11,al:'right',col:'#fff',min:9});
      GX.hud.bar(x,14,31,132,7,(NOR-left)/NOR,{col:fever?'#ff9bf0':'#ff8a2a',segs:Math.min(NOR,25)});
      GX.hud.chip(x,W-6,26,{icon:'estrela',text:S.score[myI],al:'right',col:'#ffd36b',size:14,min:10});
      GX.draw(x,art.tube(),15,243);
      for(let i=0;i<Math.min(bl,20);i++)GX.draw(x,GX.prop.orb('#ffd36b',6),14,90+i*16);
      T(x,String(bl),14,422,{size:13,w:900,col:'#ffd36b',min:10});
      GX.hud.panel(x,W-50,70,44,40,{acc:mc,a:.86});T(x,`×${m}`,W-28,91,{size:18,w:900,col:mc,min:11});if(m>1)GX.glow(x,W-28,90,34,mc,.22);
      GX.hud.panel(x,W-50,116,44,46,{acc:'#7dffa8',a:.86});GX.icon(x,PICO[S.pw.k]||'estrela',W-28,133,22,'#7dffa8');
      if(S.pw.shots>0)for(let i=0;i<S.pw.shots;i++)GX.draw(x,GX.prop.orb('#7dffa8',3),W-28+(i-(S.pw.shots-1)/2)*10,153);
      if(pvp){const mine=S.turn===myI;GX.hud.chip(x,W/2,84,{icon:mine?'alvo':'relogio',text:mine?'Sua vez!':`Vez de ${ps[S.turn]?.n||'?'}`,al:'center',col:mine?'#7dffa8':'#c9c0e0',size:14,min:10})}
      if(S.slowT>0)GX.hud.banner(x,W,H,'ÊXTASE',{sub:'baldes de bônus abertos',k:Math.min(1,S.slowT*2),acc:'#ff9bf0',y:150});
      GX.hud.frame(x,W,H,{acc:fever?'#ff9bf0':'#6fd8e8',a:.6});
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

/* ---------- arte do Teosofia Clicker (somente visual) ----------
   Biblioteca proibida à luz de velas: estantes, atril com o grimório,
   placas de madeira para os geradores e ícones vetoriais próprios. */
function ckArt53(){
  const G=window.GFX60,W=800,H=450,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const edge=(g,X,Y,w,h,c,r=0,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const corners=(g,X,Y,w,h,c)=>{[[X,Y,1,1],[X+w,Y,-1,1],[X,Y+h,1,-1],[X+w,Y+h,-1,-1]].forEach(([u,v,i,j])=>{G.poly(g,[[u,v],[u+i*14,v],[u+i*10,v+j*3],[u+i*3,v+j*3],[u+i*3,v+j*10],[u,v+j*14]],c);disc(g,u+i*5.5,v+j*5.5,1.5,'#fff4c0')})};

  /* ===== cenário ===== */
  const bg=()=>G.bake('ck:bg',W,H,(g,w,h,r)=>{
    g.fillStyle=lg(g,0,0,0,h,'#1c110c','#2a180e','#120a08');g.fillRect(0,0,w,h);
    G.fillTile(g,G.tile('madeira',{size:96,a:'#4a2c1a',b:'#160b05',seed:9}),0,0,w,h,{alpha:.55});
    for(let row=0;row<5;row++){const sy=20+row*88;
      let X=2;while(X<w){const bw=7+r()*12,bh=44+r()*26,c=['#6a2a26','#2a4a3a','#2a3458','#6a4a1e','#46245a','#5a5048'][(r()*6)|0];
        if(r()<.08){X+=18;continue}box(g,X,sy+70-bh,bw,bh,lg(g,X,0,X+bw,0,G.shade(c,.18),c,G.shade(c,-.45)),1.5);
        g.fillStyle='rgba(255,214,130,.5)';g.fillRect(X+1,sy+70-bh+6,bw-2,1.4);g.fillRect(X+1,sy+62,bw-2,1.4);if(r()<.35)disc(g,X+bw/2,sy+70-bh*.55,1.8,'rgba(255,214,130,.55)');X+=bw+1}
      box(g,0,sy+70,w,9,lg(g,0,sy+70,0,sy+79,'#8a5a34','#2a160a'));g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,sy+79,w,7)}
    g.fillStyle='rgba(12,6,4,.58)';g.fillRect(0,0,w,h);
    g.fillStyle=rg(g,145,236,20,230,'rgba(255,200,110,.26)','rgba(255,160,80,0)');g.fillRect(0,0,380,h);
    /* arco da alcova do tomo */
    g.strokeStyle='rgba(255,211,107,.18)';g.lineWidth=3;g.beginPath();g.moveTo(24,h);g.lineTo(24,230);g.arc(145,230,121,Math.PI,0);g.lineTo(266,h);g.stroke();
    /* atril */
    G.poly(g,[[128,306],[162,306],[170,392],[120,392]],lg(g,120,0,170,0,'#3a200e','#8a5a30','#3a200e'));
    ell(g,145,396,62,10,'#241206');ell(g,145,392,52,8,'#6a4222');ell(g,145,390,40,5,'#8a5a30');
    G.poly(g,[[74,292],[216,292],[204,312],[86,312]],lg(g,0,292,0,312,'#a8723e','#3a1e0c'));line(g,[[74,292],[216,292]],'#ffd36b',2);
    /* molduras das colunas */
    [[292,3,296,444],[599,1,199,447]].forEach(([X,Y,pw,ph])=>{box(g,X,Y,pw,ph,'rgba(14,8,5,.82)',12);edge(g,X,Y,pw,ph,'#6a4a22',12,2);edge(g,X+3,Y+3,pw-6,ph-6,'rgba(255,211,107,.16)',9,1);corners(g,X,Y,pw,ph,'#c8962e')});
    line(g,[[300,47],[580,47]],'rgba(255,211,107,.3)',1)
  },{s:2});

  /* ===== grimório e círculo ===== */
  const circle=col=>G.bake('ck:circ:'+col,200,200,(g,w,h,r)=>{const c=100;ring(g,c,c,92,G.rgba(col,.75),1.6);ring(g,c,c,78,G.rgba(col,.45),1);ring(g,c,c,96,G.rgba(col,.25),3);
    for(let i=0;i<24;i++){const a=i*TAU/24;g.save();g.translate(c+Math.cos(a)*85,c+Math.sin(a)*85);g.rotate(a+Math.PI/2);const p=[];for(let k=0;k<4;k++)p.push([(r()-.5)*8,(r()-.5)*9]);line(g,p,G.rgba(col,.8),1.2);g.restore()}
    for(let k=0;k<2;k++){g.strokeStyle=G.rgba(col,.3);g.lineWidth=1;g.beginPath();for(let i=0;i<=3;i++){const a=k*Math.PI/3+i*TAU/3,X=c+Math.cos(a)*78,Y=c+Math.sin(a)*78;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}},{s:2});
  const book=()=>G.bake('ck:book',130,156,g=>{g.translate(65,78);
    box(g,-48,-56,106,126,'rgba(0,0,0,.45)',9);
    box(g,-46,-60,102,124,lg(g,0,-60,0,64,'#f4e6c0','#b89a64'),6);for(let i=0;i<7;i++)line(g,[[50,-52+i*17],[55,-52+i*17]],'rgba(110,80,40,.6)',1);for(let i=0;i<3;i++)line(g,[[-38,59+i*2],[52,59+i*2]],'rgba(110,80,40,.5)',.7);
    box(g,-52,-64,100,122,lg(g,-52,-64,48,58,'#8a3a22','#5a1e12','#32100a'),8);edge(g,-52,-64,100,122,'#1e0a06',8,2);
    box(g,-52,-64,17,122,lg(g,-52,0,-35,0,'#2a0c06','#6a2416','#2a0c06'),6);[-44,-16,14,40].forEach(y=>box(g,-52,y,17,4,'#d8a838',1));
    edge(g,-28,-54,68,102,'#d8a838',5,1.6);edge(g,-24,-50,60,94,'rgba(255,224,150,.4)',3,.8);
    corners(g,-32,-62,78,118,'#e8bc4a');
    ring(g,6,-8,25,'#ffd36b',2);ring(g,6,-8,19,'rgba(255,211,107,.6)',1);const p=[];for(let i=0;i<16;i++){const a=-Math.PI/2+i*TAU/16,q=i%2?9:(i%4?17:24);p.push([6+Math.cos(a)*q,-8+Math.sin(a)*q])}G.poly(g,p,'rgba(255,211,107,.85)');
    disc(g,6,-8,9.5,'#3a1004');disc(g,6,-8,8,rg(g,3,-11,1,10,'#ffffff','#c39bff','#3a1a6a'));ell(g,6,-8,2,6,'#160830');disc(g,3.4,-11,1.6,'#fff');
    G.hud.text(g,'TOMO',6,33,{size:14,al:'center',w:900,col:'#ffd36b',stroke:3,min:8});
    G.poly(g,[[22,56],[32,56],[32,76],[27,70],[22,76]],'#c8283a')},{s:3});
  const candle=()=>G.bake('ck:candle',34,60,g=>{ell(g,17,55,15,4.5,'#2a1a08');ell(g,17,53,13,3.8,'#c8962e');box(g,11,20,12,33,lg(g,11,0,23,0,'#c8b890','#fff6dc','#a89470'),3);
    box(g,11,20,4,12,'#fff6dc',2);box(g,19,20,3,8,'#e8dcb8',2);line(g,[[17,20],[17,15]],'#2a1a10',1.4)},{s:3});
  const flame=()=>G.bake('ck:flame',16,26,g=>{const f=(s,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(8,25-s*23);g.bezierCurveTo(8+s*10,25-s*10,8+s*7,24,8,24);g.bezierCurveTo(8-s*7,24,8-s*10,25-s*10,8,25-s*23);g.fill()};f(1,'#ff8a2a');f(.7,'#ffd36b');f(.38,'#fffbe0')},{s:3});

  /* ===== ícones dos geradores e melhorias (36×36) ===== */
  const ICON={
    g0(g){line(g,[[7,28],[28,7]],'#ff6a7a',3);[[10,19,17,26],[15,14,22,21],[20,9,27,16]].forEach(([a,b,c,d])=>line(g,[[a,b],[c,d]],'#ffe0d0',2.2));disc(g,29,6,2.4,'#fff')},
    g1(g){box(g,13,16,10,15,'#f4e8c8',2);box(g,10,30,16,3,'#c8962e',1);G.poly(g,[[18,3],[23,11],[18,16],[13,11]],'#ff8a2a');disc(g,18,12,2.6,'#fff3b0')},
    g2(g){box(g,8,6,21,25,'#c8283a',3);box(g,11,26,18,4,'#f4e6c0',1);box(g,8,6,5,25,'#7a1422',2);ring(g,20,16,5,'#ffd36b',1.6);disc(g,20,16,1.6,'#ffd36b')},
    g3(g){G.poly(g,[[7,16],[8,4],[16,10]],'#c8a8ff');G.poly(g,[[29,16],[28,4],[20,10]],'#c8a8ff');ell(g,18,20,13,11,'#c8a8ff');ell(g,13,19,2.6,3.4,'#1a0c2e');ell(g,23,19,2.6,3.4,'#1a0c2e');disc(g,13.6,18,1,'#fff');disc(g,23.6,18,1,'#fff');line(g,[[15,25],[18,27],[21,25]],'#1a0c2e',1.4)},
    g4(g){G.poly(g,[[9,32],[27,32],[23,25],[13,25]],'#c8962e');disc(g,18,17,12,rg(g,14,13,1,14,'#ffffff','#a86ae8','#2a0c58'));ring(g,18,17,12,'#e8d0ff',1);ell(g,18,18,6,3,'rgba(255,255,255,.55)',-.4);disc(g,13,12,2,'#fff')},
    g5(g){G.poly(g,[[4,13],[18,3],[32,13]],'#ffd36b');box(g,6,13,24,3,'#c8962e');[8,15,22,27].forEach(X=>box(g,X-1,16,3.4,12,'#f4ead6'));box(g,4,28,28,4,'#c8962e',1);disc(g,18,9.4,2,'#8a3a10')},
    g6(g){[['#2a6a5a',24,6,24],['#8a2a4a',17,9,21],['#3a4a9a',10,5,25]].forEach(([c,y,X,w])=>{box(g,X,y,w,7,c,1.5);box(g,X+w-4,y+1,3,5,'#f4e6c0');box(g,X+4,y,2,7,'#ffd36b')});G.poly(g,[[18,2],[21,8],[15,8]],'#ffd36b')},
    g7(g){ring(g,18,18,14,'#ff7ac8',2);ring(g,18,18,10,'rgba(255,122,200,.5)',1);const p=[];for(let i=0;i<=5;i++){const a=-Math.PI/2+i*TAU*2/5;p.push([18+Math.cos(a)*13,18+Math.sin(a)*13])}line(g,p,'#ffd0ec',1.4);disc(g,18,18,2.6,'#fff')},
    g8(g){disc(g,18,18,14,rg(g,18,18,1,14,'#02101a','#0c3a5a','#7fe3ff'));g.strokeStyle='#e0faff';g.lineWidth=1.8;g.lineCap='round';g.beginPath();for(let k=0;k<=40;k++){const a=k*.34,q=.8+k*.31,X=18+Math.cos(a)*q,Y=18+Math.sin(a)*q;k?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()},
    g9(g){box(g,6,5,24,27,'#8a5a30',3);[8,16,24].forEach(y=>{box(g,9,y,18,6.4,'#c89058',1.5);box(g,15,y+2.2,6,2,'#ffe6a0',1)})},
    g10(g){for(let i=0;i<8;i++){g.save();g.translate(18,18);g.rotate(i*TAU/8);box(g,-3,-16,6,7,'#c8d4e4',1);g.restore()}disc(g,18,18,11,rg(g,14,14,1,13,'#ffffff','#8a9ab4','#3a465a'));disc(g,18,18,5,'#141a26');disc(g,18,18,2.4,'#ffd36b')},
    g11(g){disc(g,18,18,15,rg(g,18,18,1,15,'rgba(255,220,255,.9)','rgba(130,80,220,.55)','rgba(60,40,140,0)'));[['#ffb0e8',0],['#9ad8ff',Math.PI]].forEach(([c,o])=>{g.strokeStyle=c;g.lineWidth=2.4;g.lineCap='round';g.beginPath();for(let k=0;k<=18;k++){const a=o+k*.22,q=2+k*.72,X=18+Math.cos(a)*q,Y=18+Math.sin(a)*q*.7;k?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()});disc(g,18,18,2.6,'#fff');[[7,9],[29,27],[27,7],[8,29]].forEach(([X,Y])=>disc(g,X,Y,1.1,'#fff'))},
    g12(g){const hp=()=>{g.beginPath();g.moveTo(18,31);g.bezierCurveTo(-2,18,6,3,18,12);g.bezierCurveTo(30,3,38,18,18,31)};hp();g.fillStyle=lg(g,6,6,30,30,'#e0faff','#4ac8ff','#1a3a9a');g.fill();g.strokeStyle='#e0faff';g.lineWidth=1.2;g.stroke();line(g,[[18,12],[12,19],[18,31],[24,19],[18,12]],'rgba(255,255,255,.65)',1)},
    g13(g){g.beginPath();g.moveTo(2,18);g.quadraticCurveTo(18,0,34,18);g.quadraticCurveTo(18,36,2,18);g.fillStyle='#fff3d0';g.fill();g.strokeStyle='#ffd36b';g.lineWidth=1.6;g.stroke();disc(g,18,18,8,rg(g,16,16,1,9,'#ffe27a','#e0782a','#5a1a04'));ell(g,18,18,2.2,5.6,'#140600');disc(g,15,15,1.8,'#fff')},
    mao(g){box(g,12,16,15,15,'#ffd8a8',5);box(g,13,4,5,18,'#ffd8a8',2.5);box(g,19,13,4.4,8,'#f4c690',2.2);box(g,23.4,15,4,8,'#e8b880',2);box(g,7,18,8,5,'#ffd8a8',2.5);[[8,9],[22,5],[27,10]].forEach(([X,Y])=>line(g,[[X,Y],[X+(X<15?-3:3),Y-3]],'#ffd36b',1.6))},
    orbe(g){disc(g,18,18,15,rg(g,18,18,2,15,'rgba(255,240,180,.85)','rgba(255,190,60,0)'));disc(g,18,18,8,rg(g,15,15,1,9,'#ffffff','#ffd36b','#b8720a'));[[18,2,18,8],[18,28,18,34],[2,18,8,18],[28,18,34,18]].forEach(([a,b,c,d])=>line(g,[[a,b],[c,d]],'#ffe9a0',2))},
    trevo(g){line(g,[[18,19],[22,32]],'#2a8a4a',2.6);[[18,10],[26,18],[10,18],[18,26]].forEach(([X,Y],i)=>{disc(g,X,Y,6.6,i%2?'#4ad87a':'#38c066');disc(g,X-1.6,Y-1.6,1.8,'#c8ffd8')});disc(g,18,18,3,'#1a7a3a')},
  };
  const icon=k=>G.bake('ck:ic:'+k,36,36,g=>(ICON[k]||ICON.orbe)(g),{s:3});
  const upKey=u=>u.gen!=null?'g'+u.gen:u.id.startsWith('clk')?'mao':u.id==='orbC'?'trevo':u.id.startsWith('orb')?'orbe':'g'+({syn0:1,syn1:3,syn2:4,syn3:6,syn4:7,syn5:8,syn6:10,syn7:11}[u.id]??13);
  const link=()=>G.bake('ck:link',14,10,g=>{ring(g,5,5,3.4,'#14080a',3.4);ring(g,9,5,3.4,'#14080a',3.4);ring(g,5,5,3.4,'#7dffa8',1.6);ring(g,9,5,3.4,'#7dffa8',1.6)},{s:3});
  /* gota de essência */
  const ess=()=>G.bake('ck:ess',18,22,g=>{g.beginPath();g.moveTo(9,1);g.bezierCurveTo(11,7,16.5,10,16.5,14);g.arc(9,14,7.5,0,Math.PI);g.bezierCurveTo(1.5,10,7,7,9,1);g.fillStyle=rg(g,7,12,1,11,'#fffbe0','#ffd36b','#b8620a');g.fill();g.strokeStyle='#4a2604';g.lineWidth=1.2;g.stroke();ell(g,6.4,13,1.6,2.8,'rgba(255,255,255,.85)',.5)},{s:3});

  /* ===== placas, botões, células e nós ===== */
  const row=(ok,seen)=>G.bake(`ck:row:${ok?1:0}:${seen?1:0}`,280,40,g=>{box(g,0,0,280,40,ok?lg(g,0,0,0,40,'#6a4420','#3a2410','#2a180a'):lg(g,0,0,0,40,'#2c221a','#1a130e'),9);
    G.fillTile(g,G.tile('madeira',{size:64,a:ok?'#7a5028':'#33261c',b:'#120a04',seed:3}),2,2,276,36,{alpha:.28});
    edge(g,.8,.8,278.4,38.4,ok?'#ffd36b':'#54453a',9,1.6);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(10,2,260,1.2);
    disc(g,20,20,16.5,'rgba(8,4,2,.75)');ring(g,20,20,16.5,ok?'#ffd36b':'#6a5848',1.4);if(!seen)G.hud.text(g,'?',20,21,{size:18,al:'center',w:900,col:'#a89880',stroke:0})},{s:2});
  const btn=(w,h,col,on)=>G.bake(`ck:btn:${w}x${h}:${col}:${on?1:0}`,w,h,g=>{box(g,0,0,w,h,on?lg(g,0,0,0,h,G.shade(col,-.35),G.shade(col,-.68),G.shade(col,-.78)):lg(g,0,0,0,h,'#2a2230','#17121c'),8);
    edge(g,.8,.8,w-1.6,h-1.6,on?col:'#4a3f55',8,1.6);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(7,2,w-14,1.4)},{s:2});
  const tab=(w,h,on)=>G.bake(`ck:tab:${w}:${on?1:0}`,w,h,g=>{box(g,0,0,w,h,on?lg(g,0,0,0,h,'#ffeab0','#e0a838'):lg(g,0,0,0,h,'#3a2a18','#241808'),7);edge(g,.7,.7,w-1.4,h-1.4,on?'#fff4d0':'#7a5a2a',7,1.4)},{s:2});
  const cell=state=>G.bake('ck:cell:'+state,43,43,g=>{const C={on:['#7a5a2a','#4a3418','#ffffff'],ok:['#4a3418','#2a1c0c','#ffd36b'],no:['#241c18','#140f0c','#54453a']}[state];
    box(g,0,0,43,43,lg(g,0,0,0,43,C[0],C[1]),8);edge(g,.8,.8,41.4,41.4,C[2],8,state==='on'?2.2:1.2);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(6,2,31,1.2)},{s:2});
  const info=()=>G.bake('ck:info',192,53,g=>{box(g,0,0,192,53,'rgba(8,5,3,.96)',7);edge(g,.7,.7,190.6,51.6,'#8a6a2a',7,1.4)},{s:2});
  const node=state=>G.bake('ck:node:'+state,36,36,g=>{const C={own:['#ffffff','#c39bff','#5a2a9a','#ffffff'],can:['#7a5ab0','#4a2e78','#22123c','#c39bff'],no:['#32283e','#201a2a','#100c16','#54466a']}[state];
    disc(g,19,20,15.5,'rgba(0,0,0,.4)');disc(g,18,18,15.5,rg(g,13,12,1,19,C[0],C[1],C[2]));ring(g,18,18,15,C[3],1.5);if(state==='own'){ring(g,18,18,11,'rgba(255,255,255,.55)',1)}},{s:3});
  /* orbe dourado e fenda */
  const orb=()=>G.bake('ck:orb',56,56,g=>{const c=28;disc(g,c,c,24,rg(g,c-8,c-9,2,30,'#fffbe0','#ffd36b','#b87008'));ring(g,c,c,23.4,'#fff4c0',1.6);ring(g,c,c,17,'rgba(255,255,255,.55)',1);
    const p=[];for(let i=0;i<8;i++){const a=-Math.PI/2+i*TAU/8,q=i%2?5:14;p.push([c+Math.cos(a)*q,c+Math.sin(a)*q])}G.poly(g,p,'#6a4004');disc(g,c,c,4,'#fff8d0');ell(g,c-9,c-11,7,3.6,'rgba(255,255,255,.75)',-.6)},{s:3});
  const rift=()=>G.bake('ck:rift',44,72,g=>{g.translate(22,36);ell(g,0,0,17,32,rg(g,0,0,2,32,'rgba(170,80,255,.75)','rgba(90,20,160,.35)','rgba(60,0,110,0)'));
    G.poly(g,[[-3,-31],[7,-14],[3,-4],[11,6],[3,17],[7,31],[-6,14],[-3,5],[-11,-5],[-4,-16]],'#0a0016');
    line(g,[[-3,-31],[7,-14],[3,-4],[11,6],[3,17],[7,31],[-6,14],[-3,5],[-11,-5],[-4,-16],[-3,-31]],'#d89aff',1.8);[[-1,-12],[2,8],[-4,0]].forEach(([X,Y])=>disc(g,X,Y,1,'#fff'))},{s:3});
  const motes=G.ambient('motes',{W,H,n:30,col:'#ffd890',seed:17}),dust=G.ambient('poeira',{W,H,n:30,seed:5});
  return{bg,circle,book,candle,flame,icon,upKey,link,ess,row,btn,tab,cell,info,node,orb,rift,motes,dust};
}
function clicker53(C){
  const W=800,H=450,KEY=CKKEY53(),TOME={x:145,y:236,r:84};
  let d=ckLoad53(KEY);
  const S={pops:[],bump:0,offline:0,orb:null,orbAt:0,rift:null,riftAt:0,frenzy:0,storm:0,colapse:0,scroll:0,tab:'up',sel:null,selT:null,ascConf:0,rain:[],msg:'',msgT:0,data:()=>d};
  const has=k=>!!d.up[k],tr=k=>!!d.tree[k];
  /* visual (GFX60): o motor é EN; GX aqui é a coluna dos geradores */
  const EN=window.GFX60,art=ckArt53(),T=(x,s,X,Y,o)=>EN.hud.text(x,s,X,Y,{al:'center',...o});
  EN.skin({acc:'#ffd36b'});
  function wrap(x,s,cx,y,maxW,size,col,maxL){let z=EN.fs(size,7.5),lines=[];
    for(let k=0;k<4;k++){x.font=`600 ${z}px "IBM Plex Sans",system-ui,sans-serif`;lines=[];let cur='';for(const w of s.split(' ')){const t=cur?cur+' '+w:w;if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);if(lines.length<=maxL)break;z*=.88}
    lines.slice(0,maxL).forEach((l,i)=>EN.hud.text(x,l,cx,y+i*z*1.12,{size:z,min:0,al:'center',w:600,col,max:maxW}))}
  function btn(x,b,label,on,col,icon){EN.draw(x,art.btn(b.w,b.h,col,!!on),b.x+b.w/2,b.y+b.h/2);if(icon)EN.icon(x,icon,b.x+14,b.y+b.h/2,13,on?col:'#8a7a98');T(x,label,b.x+b.w/2+(icon?9:0),b.y+b.h/2+1,{size:12,w:800,col:on?col:'#b0a0c0',min:8,max:b.w-(icon?32:10)})}
  /* efeitos nascem comparando o estado entre dois quadros: nada muda na economia */
  const V={on:false,cl:0,g:[],up:0,orbs:0,rifts:0,asc:0,tree:0,orb:null,rift:null};
  function watch(){const nu=Object.keys(d.up).length,nt=Object.keys(d.tree).length;
    if(V.on){
      if(d.clicks>V.cl){const p=S.pops[S.pops.length-1];EN.emit('brilho',p?p.x:TOME.x,p?p.y:TOME.y,{col:S.storm>0?'#ffffff':'#ffd36b',amount:.35,size:.8})}
      if(d.asc>V.asc){EN.hitstop(130,{zoom:.02});EN.emit('confete',W/2,H*.4);EN.emit('explosao',TOME.x,TOME.y,{col:'#fff3c0'})}
      else{d.g.forEach((n,i)=>{const k=i-S.scroll;if(n>V.g[i]&&k>=0&&k<VIS){const b=genB(k);EN.emit('coleta',b.x+20,b.y+20,{col:'#ffd36b'})}});
        if(nu>V.up)EN.emit('brilho',699,342,{col:'#ffd36b'})}
      if(d.orbs>V.orbs&&V.orb){EN.impact(V.orb.x,V.orb.y,{col:'#ffd36b',force:1.3});EN.emit('confete',V.orb.x,V.orb.y,{amount:.5})}
      if(d.rifts>V.rifts&&V.rift){EN.impact(V.rift.x,V.rift.y,{col:'#c070ff',force:1.4});EN.emit('estilhacos',V.rift.x,V.rift.y,{col:['#c070ff','#f0d8ff']})}
      if(nt>V.tree){const n=CKTREE53.find(q=>q.k===S.sel);if(n){const p=nodeXY(n);EN.emit('brilho',p.x,p.y,{col:'#c39bff'})}}}
    V.cl=d.clicks;V.g=d.g.slice();V.up=nu;V.orbs=d.orbs;V.rifts=d.rifts;V.asc=d.asc;V.tree=nt;V.orb=S.orb||V.orb;V.rift=S.rift||V.rift;V.on=true}
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
  return{g60intro:{title:'Teosofia Clicker',sub:'A biblioteca rende mesmo longe',acc:'#ffd36b'},st:()=>S,data:()=>d,gain,rate,perClick,buyGen,buyUp,buyNode,ascend,fragNext,avail,clickOrb,clickRift,save,finish,
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
      C.hud(EN.chips([{icon:'gota',label:'essência',value:fmt53(d.e)},{icon:'relogio',label:'por s',value:fmt53(rate())},{icon:'alvo',label:'clique',value:fmt53(perClick())},S.frenzy>0?{icon:'sol',value:'Frenesi ×7',tone:'ok'}:null,S.storm>0?{icon:'raio',value:'Tempestade ×77',tone:'ok'}:null,S.colapse>0?{icon:'nuvem',value:'Colapso',tone:'bad'}:null,{icon:'estrela',label:'fragmentos',value:d.frag}]))},
    draw(x){
      const now=performance.now(),t=EN.reduced()?0:now/1000,still=EN.reduced(),CX=TOME.x,CY=TOME.y;watch();
      EN.draw(x,art.bg(),W/2,H/2,{w:W,h:H});
      if(S.colapse>0){x.fillStyle='rgba(30,6,60,.45)';x.fillRect(0,0,W,H)}
      art.dust.draw(x,t);art.motes.draw(x,t);
      /* velas */
      [30,260].forEach((X,i)=>{const f=still?1:1+.09*Math.sin(t*9+i*2.4)+.05*Math.sin(t*23+i);EN.shadow(x,X,404,46,{alpha:.6});EN.draw(x,art.candle(),X,376);
        EN.glow(x,X,348,54*f,'#ff9a3c',.34);EN.draw(x,art.flame(),X,358,{ay:1,sy:f,sx:1/f})});
      /* tomo */
      const fz=S.frenzy>0,st1=S.storm>0,acc=st1?'#ffffff':fz?'#ffd36b':'#c39bff';
      if(fz||st1)EN.rays(x,CX,CY,{n:12,len:190,col:fz?'#ffd36b':'#bfe4ff',a:.2,t:t*5});
      EN.glow(x,CX,CY,TOME.r*1.45,acc,.34+(still?0:.06*Math.sin(t*2))+S.bump*.3);
      EN.draw(x,art.circle(acc),CX,CY,{w:178,h:178,rot:t*.18});
      const s=1+(still?0:S.bump*.07),by=CY+(still?0:Math.sin(t*1.5)*2.4);
      EN.draw(x,art.book(),CX,by,{sx:s,sy:s});
      if(st1){x.strokeStyle='rgba(220,240,255,.85)';x.lineWidth=1.6;const k=Math.floor(t*14);for(let i=0;i<4;i++){let a=i*TAU16/4+k*1.7+i*k*.31,X=CX+Math.cos(a)*54,Y=CY+Math.sin(a)*62;x.beginPath();x.moveTo(X,Y);for(let j=1;j<4;j++){a+=Math.sin(k*3+i*7+j)*.24;x.lineTo(CX+Math.cos(a)*(56+j*11),CY+Math.sin(a)*(62+j*9))}x.stroke()}}
      /* essência em órbita */
      if(!still)for(let i=0;i<6;i++){const a=t*.55+i*TAU16/6;EN.draw(x,art.ess(),CX+Math.cos(a)*96,CY+Math.sin(a)*34+26*Math.sin(a*.5+i),{w:9,h:11,alpha:.75})}
      /* contadores */
      EN.hud.panel(x,34,13,222,(d.frag?76:58),{acc:'#ffd36b',a:.86});
      {const v=fmt53(d.e),z=EN.fs(26,13);x.font=`900 ${z}px "IBM Plex Sans",system-ui,sans-serif`;const vw=Math.min(170,x.measureText(v).width);EN.draw(x,art.ess(),CX-vw/2-12,33,{w:18,h:22});
        T(x,v,CX+8,34,{size:26,w:900,col:'#ffd36b',min:13,max:170})}
      T(x,`${fmt53(rate())} por segundo`,CX,60,{size:13,col:'#e8dcc8',min:8,max:210});
      if(d.frag)T(x,`${d.frag} Fragmentos · +${d.frag*3}%`,CX,80,{size:11,col:'#d8bcff',min:7.5,max:210});
      T(x,`${fmt53(perClick())} por clique`,CX,CY+TOME.r+18,{size:12,col:'#ffe6b8',min:8,max:190});
      const st=[S.frenzy>0?`Frenesi ${Math.ceil(S.frenzy)}s`:'',S.storm>0?`Tempestade ${Math.ceil(S.storm)}s`:'',S.colapse>0?`Colapso ${Math.ceil(S.colapse)}s`:''].filter(Boolean).join(' · ');if(st)EN.hud.chip(x,CX,H-38,{icon:S.colapse>0&&!fz&&!st1?'nuvem':'raio',text:st,al:'center',col:S.colapse>0&&!fz&&!st1?'#c39bff':'#ffd36b',size:12,min:7.5});
      if(S.offline)T(x,`Enquanto você esteve fora: +${fmt53(S.offline)}`,CX,H-15,{size:11,col:'#7dffa8',min:7.5,max:276});
      /* geradores */
      T(x,'Geradores',GX,30,{size:14,al:'left',col:'#ffd36b',w:900,min:8,max:90});
      buyB.forEach(b=>{const on=d.buyN===b.n;EN.draw(x,art.tab(b.w,b.h,on),b.x+b.w/2,b.y+b.h/2);T(x,b.n==='max'?'máx':'×'+b.n,b.x+b.w/2,b.y+b.h/2+1,{size:11,w:900,col:on?'#2a1804':'#f0e0c0',stroke:on?0:3,min:8,max:b.w-6})});
      const vg=visGens(),arrow=(b,up)=>{EN.draw(x,art.btn(b.w,b.h,'#ffd36b',true),b.x+b.w/2,b.y+b.h/2);x.save();x.translate(b.x+b.w/2,b.y+b.h/2);if(!up)x.rotate(Math.PI);EN.poly(x,[[0,-6],[7,5],[-7,5]],'#ffe9b0');x.restore()};
      if(S.scroll>0)arrow(upArrow,true);
      if(S.scroll+VIS<vg)arrow(dnArrow,false);
      for(let k=0;k<VIS;k++){const i=k+S.scroll;if(i>=vg)break;const g=CKG53[i],b=genB(k),n=d.buyN==='max'?Math.max(1,maxBuy(i)):d.buyN,c=cost(i,n),ok=d.e>=c,seen=i===0||d.g[i-1]>0||d.all>=g[2]*.5;
        EN.draw(x,art.row(ok,seen),b.x+b.w/2,b.y+b.h/2);if(ok)EN.glow(x,b.x+20,b.y+20,24,'#ffd36b',.2);
        if(seen)EN.draw(x,art.icon('g'+i),b.x+20,b.y+20,{w:29,h:29,alpha:ok||d.g[i]?1:.6});
        if(!ok){const f=Math.max(0,Math.min(1,d.e/c));x.fillStyle='rgba(255,211,107,.55)';x.fillRect(b.x+40,b.y+b.h-3.4,(b.w-90)*f,2)}
        T(x,seen?g[0]:'???',b.x+41,b.y+12,{size:12,al:'left',col:ok?'#ffffff':'#c8b8a0',min:8.5,max:b.w-94});
        EN.draw(x,art.ess(),b.x+45,b.y+28,{w:9,h:11});
        T(x,`${fmt53(c)}${n>1?` (×${n})`:''} · ${fmt53(g[3]*genMult(i)*globalMult())}/s cada`,b.x+53,b.y+28.5,{size:10,al:'left',w:600,col:ok?'#ffe6b0':'#bcae98',min:7.5,max:b.w-106});
        T(x,String(d.g[i]),b.x+b.w-11,b.y+21,{size:17,al:'right',w:900,col:'#d8bcff',min:10,max:42})}
      /* abas */
      [['up','Melhorias'],['asc','Despertar']].forEach(([k,l])=>{const b=tabB[k],on=S.tab===k,star=k==='asc'&&fragNext()>=1;EN.draw(x,art.tab(b.w,b.h,on),b.x+b.w/2,b.y+b.h/2);if(star)EN.icon(x,'estrela',b.x+9,b.y+b.h/2,11,on?'#6a2aa0':'#d8bcff');
        T(x,l,b.x+b.w/2+(star?6:0),b.y+b.h/2+1,{size:12,w:900,col:on?'#2a1804':'#f0e0c0',stroke:on?0:3,min:8,max:b.w-(star?20:8)})});
      if(S.tab==='up'){const L=avail().slice(0,24);if(!L.length)wrap(x,'Nenhuma melhoria disponível ainda.',699,96,170,11,'#bcae98',3);
        L.forEach((u,k)=>{const b=upCell(k),ok=d.e>=u.c,on=S.sel===u.id;EN.draw(x,art.cell(on?'on':ok?'ok':'no'),b.x+b.w/2,b.y+b.h/2);if(ok)EN.glow(x,b.x+b.w/2,b.y+b.h/2,26,'#ffd36b',on?.4:.18);
          EN.draw(x,art.icon(art.upKey(u)),b.x+b.w/2,b.y+b.h/2,{w:31,h:31,alpha:ok||on?1:.5});if(u.id.startsWith('syn'))EN.draw(x,art.link(),b.x+b.w-9,b.y+8);
          if(u.gen!=null)T(x,['I','II','III','IV','V'][+u.id.split('t')[1]],b.x+b.w-4,b.y+b.h-8,{size:9,w:900,col:'#ffd36b',al:'right',min:6.5})});
        const u=S.sel&&CKU53.find(q=>q.id===S.sel);if(u){EN.draw(x,art.info(),699,342);T(x,u.n,699,327,{size:11,w:900,col:'#ffd36b',min:7.5,max:182});wrap(x,`${u.d} · custo ${fmt53(u.c)}`,699,342,182,10,'#f0e4d0',2);btn(x,buyBtn,d.e>=u.c?'Comprar':'Essência insuficiente',d.e>=u.c,'#ffd36b')}
        else wrap(x,'Toque numa melhoria para ver; toque de novo para comprar.',699,336,176,10,'#bcae98',3)}
      else{const n=fragNext();T(x,`${d.frag} Fragmentos (${d.frag-d.spent} livres)`,699,48,{size:12,w:900,col:'#d8bcff',min:8,max:186});T(x,`Despertar agora: +${n}`,699,68,{size:11,col:n?'#7dffa8':'#bcae98',min:7.5,max:186});
        btn(x,ascBtn,S.ascConf>0?'Confirmar? (reinicia a run)':'Despertar Cósmico',n>=1,S.ascConf>0?'#ff9b9b':'#c39bff','estrela');if(n>=1)EN.glow(x,ascBtn.x+ascBtn.w/2,ascBtn.y+14,90,S.ascConf>0?'#ff5b6b':'#b48cff',.2,{sy:.3});
        CKTREE53.forEach(nd=>{if(!nd.req)return;const a=nodeXY(nd),b=nodeXY(CKTREE53.find(q=>q.k===nd.req)),own=tr(nd.k);x.strokeStyle=own?'rgba(195,155,255,.35)':'rgba(0,0,0,.5)';x.lineWidth=own?7:4;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.strokeStyle=own?'#e8d8ff':'#6a587a';x.lineWidth=2;x.stroke()});
        CKTREE53.forEach(nd=>{const p=nodeXY(nd),own=tr(nd.k),can=!own&&(!nd.req||tr(nd.req))&&d.frag-d.spent>=nd.c,sel=S.sel===nd.k;if(own||can)EN.glow(x,p.x,p.y,26,'#b48cff',own?.5:.35+(still?0:.2*Math.sin(t*4)));
          EN.draw(x,art.node(own?'own':can?'can':'no'),p.x,p.y);if(sel){x.strokeStyle='#ffffff';x.lineWidth=2.6;x.beginPath();x.arc(p.x,p.y,16,0,TAU16);x.stroke()}
          if(own)EN.icon(x,'estrela',p.x,p.y,15,'#3a1470');else T(x,String(nd.c),p.x,p.y+1,{size:11,w:900,col:'#f4e8ff',min:8,max:26})});
        ['Luz','Início','Sonho','Óbolos','Orbes'].forEach((l,i)=>T(x,l,622+i*38,124,{size:9,col:'#d0c0a8',min:7,max:36}));
        const nd=S.sel&&CKTREE53.find(q=>q.k===S.sel);if(nd){EN.draw(x,art.info(),699,342);T(x,nd.n,699,327,{size:11,w:900,col:'#d8bcff',min:7.5,max:182});wrap(x,`${nd.d} · custo ${nd.c}`,699,342,182,10,'#f0e4d0',2);btn(x,buyBtn,tr(nd.k)?'Já desperto':'Despertar este nó',!tr(nd.k)&&d.frag-d.spent>=nd.c&&(!nd.req||tr(nd.req)),'#c39bff')}}
      btn(x,REG,'Registrar no placar',true,'#ffd36b','trofeu');
      EN.vignette(x,W,H,{a:.32});
      if(fz){x.fillStyle=`rgba(255,211,107,${.05+(still?0:.03*Math.sin(now/200))})`;x.fillRect(0,0,W,H)}
      /* efeitos por cima: chuva, números, orbe e fenda */
      S.rain.forEach(r=>{EN.glow(x,r.x,r.y,12,'#ffd36b',.45);EN.draw(x,art.ess(),r.x,r.y,{w:12,h:15})});
      S.pops.forEach(p=>{x.globalAlpha=Math.max(0,Math.min(1,1-p.t));T(x,p.s,p.x,p.y-p.t*50,{size:15,w:900,col:'#ffe08a',min:9});x.globalAlpha=1});
      if(S.orb){const o=S.orb,k=still?1:1+.08*Math.sin(now/150);EN.rays(x,o.x,o.y,{n:8,len:70,col:'#ffe9a0',a:.34,t:t*14});EN.glow(x,o.x,o.y,56,'#ffd36b',.7);EN.draw(x,art.orb(),o.x,o.y,{sx:k,sy:k});
        if(!still)for(let i=0;i<4;i++){const a=t*2.6+i*TAU16/4;EN.icon(x,'estrela',o.x+Math.cos(a)*34,o.y+Math.sin(a)*34,7,'#fff4c0')}}
      if(S.rift){const f=S.rift,w=still?0:Math.sin(now/300)*.2;EN.glow(x,f.x,f.y,58,'#8a2aff',.65);EN.draw(x,art.rift(),f.x,f.y,{rot:w});
        if(!still)for(let i=0;i<7;i++){const q=1-(t*.7+i/7)%1,a=i*2.4+t*2;EN.glow(x,f.x+Math.cos(a)*q*40,f.y+Math.sin(a)*q*44,5,'#d89aff',(1-q)*.9)}
        T(x,'Fenda',f.x,f.y+44,{size:10,col:'#e4c8ff',min:8})}
      if(S.msg&&now-S.msgT<2600){const m=EN.clean(S.msg);EN.hud.panel(x,5,94,280,28,{acc:'#ffd36b',a:.9});T(x,m,CX,108,{size:13,w:900,col:'#ffe08a',min:8,max:268})}
      EN.hud.frame(x,W,H,{acc:'#ffd36b',a:.5});
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

