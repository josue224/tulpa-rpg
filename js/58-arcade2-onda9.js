/* ===================================================================
   TULPA · ETAPA 54 — 🕹 ARCADE 2.0 · ONDA 9 (parte 1)
   🏐 TULPA VOLLEY 2.0
   Regras de vôlei de verdade: no máximo 3 toques por lado, sets (melhor
   de 3) e pontos de 7, 11 ou 15. Ação (S/↓/K): no ar perto da rede é
   CORTADA ou BLOQUEIO; no chão é MERGULHO para salvar bolas baixas.
   Poder Elemental (E/L) com barra de Energia: Cortada Solar (Fé),
   Muralha de Raízes (Natureza), Passo do Vazio (Inexistência), Bola
   Fantasma (Ilusão) e Olho da Verdade (Verdade).
   Arenas: Clássica, Ventos do Véu, Gravidade Lunar e Bola Pesada.
   Copa do Véu: 4 rivais cada vez mais fortes. Mesa: até 3 × 3.
   =================================================================== */
const VBEL54={fe:{n:'Cortada Solar',ico:'☀',d:'Seu próximo toque vira uma bola de fogo que queima quem tenta devolver.'},nat:{n:'Muralha de Raízes',ico:'🌿',d:'Por 7 s, raízes devolvem a bola que cairia no seu lado.'},ine:{n:'Passo do Vazio',ico:'🕳',d:'Teleporta você para baixo da bola.'},ilu:{n:'Bola Fantasma',ico:'🌀',d:'Depois do seu toque a bola some e reaparece; o rival se confunde.'},ver:{n:'Olho da Verdade',ico:'👁',d:'Por 8 s você vê onde a bola vai cair e seus toques miram no buraco.'}};
const VBELK54=Object.keys(VBEL54);
const VBAR54={normal:{n:'Clássica',ico:'🏐',d:'Sem surpresas.'},vento:{n:'Ventos do Véu',ico:'🌬',d:'O vento muda e empurra a bola.'},lua:{n:'Gravidade Lunar',ico:'🌙',d:'Bola e pulos flutuam mais.'},pesada:{n:'Bola Pesada',ico:'🪨',d:'A bola cai rápido e pesa.'}};
const VBCUP54=[{n:'Perseus Aprendiz',d:'facil',el:'ver',ar:'normal'},{n:'Guardiã das Raízes',d:'medio',el:'nat',ar:'vento'},{n:'Eco do Vazio',d:'dificil',el:'ine',ar:'lua'},{n:'Perseus Supremo',d:'pesadelo',el:'fe',ar:'pesada'}];
function vbProg54(){const p=prog38().vb||{};return{cup:p.cup||0,wins:p.wins||0,best:p.best||0}}
const vbSetup54={
  intro:o=>o._m==='mesa'?'Times alternados pela ordem de chegada (até 3 × 3). O anfitrião escolhe arena e pontos. O Elemento de cada um vem da cor do seu Perseus.':'Escolha modo, arena e o seu Poder Elemental.',
  def:()=>({m:'jogo',pts:'7',sets:'1',ar:'normal',el:'fe',cs:'0'}),
  fields:o=>{const p=vbProg54(),mesa=o._m==='mesa',F=[];
    if(!mesa)F.push({k:'m',l:'Modo',opts:[{v:'jogo',n:'Partida',ico:'🏐',d:'Contra o Perseus.'},{v:'copa',n:'Copa do Véu',ico:'🏆',d:'4 rivais cada vez mais fortes.',badge:p.cup?`🏆 ×${p.cup}`:''}]});
    if(!mesa&&o.m==='copa')F.push({k:'cs',l:'Rival',wide:1,opts:VBCUP54.map((c,i)=>({v:String(i),n:`${i+1}. ${c.n}`,ico:VBEL54[c.el].ico,d:`${DIFF12[c.d].n} · ${VBAR54[c.ar].n}`,lock:i>0&&!(prog38().vb?.cs>=i)}))});
    if(mesa||o.m!=='copa'){F.push({k:'pts',l:'Pontos por set',opts:[{v:'7',n:'7',ico:'7️⃣',d:'Rápido.'},{v:'11',n:'11',ico:'🔟',d:'Com 2 de vantagem.'},{v:'15',n:'15',ico:'🏟',d:'Com 2 de vantagem.'}]},{k:'sets',l:'Sets',opts:[{v:'1',n:'Set único',ico:'1️⃣',d:''},{v:'3',n:'Melhor de 3',ico:'3️⃣',d:''}]},{k:'ar',l:'Arena',opts:Object.entries(VBAR54).map(([v,a])=>({v,n:a.n,ico:a.ico,d:a.d}))})}
    if(!mesa)F.push({k:'el',l:'Seu Poder Elemental',wide:1,opts:VBELK54.map(k=>({v:k,n:VBEL54[k].n,ico:VBEL54[k].ico,d:VBEL54[k].d}))});
    return F},
  fix:o=>{if(!['jogo','copa'].includes(o.m))o.m='jogo';if(!['7','11','15'].includes(o.pts))o.pts='7';if(!['1','3'].includes(o.sets))o.sets='1';if(!VBAR54[o.ar])o.ar='normal';if(!VBEL54[o.el])o.el='fe';let c=Math.max(0,Math.min(3,+o.cs||0));while(c>0&&!(prog38().vb?.cs>=c))c--;o.cs=String(c)},
  sum:()=>'A/D andam · W/↑/Espaço pulam · S/↓/K: Ação (cortada ou bloqueio no ar, mergulho no chão) · E/L: Poder Elemental (barra cheia). No máximo 3 toques por lado!'
};

/* ---------- arte do Tulpa Volley (somente visual) ----------
   Quatro quadras com identidade própria: praia ao pôr do sol, cais em
   ventania, solo lunar e arena da forja. */
function vbArt54(ar){
  const G=window.GFX60,W=800,H=450,GY=404,NX=400,NT=262,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const TH={
    normal:{acc:'#ffd36b',amb:'poeira',ac:'#ffe0b0',floor:'areia',a:'#d8a868',b:'#8a5a30',line:'#fff6e0',crowd:'#3a1a30',dust:'#e8c890'},
    vento:{acc:'#9ad8ff',amb:'folhas',ac:'#8ac8a0',floor:'madeira',a:'#5a5048',b:'#221a14',line:'#d8ecff',crowd:'#0e1a28',dust:'#b8c8d0'},
    lua:{acc:'#d8d0ff',amb:'motes',ac:'#d8d0ff',floor:'pedra',a:'#9a98ac',b:'#4a485c',line:'#f0ecff',crowd:'#14122a',dust:'#c8c4dc'},
    pesada:{acc:'#ff9a4a',amb:'brasas',ac:'#ff9a3c',floor:'metal',a:'#5a4a44',b:'#1c120e',line:'#ffd0a0',crowd:'#180a08',dust:'#a8887a'}}[ar]||{};
  const key=TH.floor?ar:'normal';

  const bg=()=>G.bake('vb:bg:'+key,W,GY,(g,w,h,r)=>{
    const sky=s=>{g.fillStyle=lg(g,0,0,0,h,...s);g.fillRect(0,0,w,h)};
    const stars=(n,y1)=>{for(let i=0;i<n;i++)disc(g,r()*w,r()*y1,.5+r()*1.1,G.rgba('#ffffff',.3+r()*.6))};
    const stands=(c1,c2,trim)=>{[[0,300],[500,300]].forEach(([X,Y])=>{for(let k=0;k<3;k++){box(g,X,Y+k*26,300,28,k%2?c1:c2);g.fillStyle=trim;g.fillRect(X,Y+k*26,300,2)}})};
    if(key==='vento'){sky(['#0a1830','#24445e','#6a8a98']);
      g.fillStyle=lg(g,0,250,0,h,'#1c4a62','#0a2030');g.fillRect(0,262,w,h-262);for(let i=0;i<90;i++){const Y=266+r()*110;line(g,[[r()*w,Y],[r()*w*.04+r()*w,Y]],'rgba(200,235,255,.0)',1);const X=r()*w;line(g,[[X,Y],[X+8+r()*22,Y-1]],'rgba(210,240,255,'+(0.12+r()*.25)+')',1.4)}
      G.poly(g,[[600,270],[640,236],[700,244],[760,210],[800,222],[800,280],[600,280]],'#0e2230');
      box(g,718,130,26,92,lg(g,718,0,744,0,'#e8e0d0','#8a8078'),3);[150,178].forEach(y=>box(g,718,y,26,12,'#b8384a'));box(g,714,120,34,12,'#2a3440',2);box(g,722,104,18,18,'#ffe9a0',3);G.poly(g,[[716,106],[731,90],[746,106]],'#b8384a');g.fillStyle=rg(g,731,113,2,70,'rgba(255,233,160,.4)','rgba(255,233,160,0)');g.fillRect(660,50,140,130);
      stands('#1c2c3c','#243648','rgba(180,220,255,.3)')}
    else if(key==='lua'){sky(['#020207','#0a0a22','#1a1836']);stars(170,300);
      g.fillStyle=rg(g,640,92,40,100,'rgba(110,190,255,.3)','rgba(110,190,255,0)');g.fillRect(540,0,200,200);
      disc(g,640,92,48,rg(g,622,74,4,66,'#bfe8ff','#2a78c8','#061a44'));g.save();g.beginPath();g.arc(640,92,48,0,TAU);g.clip();for(let i=0;i<11;i++)ell(g,596+r()*90,52+r()*80,6+r()*18,3+r()*9,'rgba(80,180,110,.75)',r()*3);for(let i=0;i<6;i++)ell(g,600+r()*80,56+r()*74,14+r()*20,2+r()*3,'rgba(255,255,255,.6)',-.3);g.fillStyle=lg(g,610,60,690,130,'rgba(0,0,0,0)','rgba(0,0,10,.75)');g.fillRect(590,40,100,110);g.restore();
      G.paint.ridge({col:'#4a4862',base:.74,amp:.12,k:[2,5,11],edge:'rgba(230,225,255,.35)'})(g,w,h,r);
      [[120,300,50],[210,314,30],[620,310,42]].forEach(([X,Y,R])=>{g.fillStyle='#232240';g.beginPath();g.arc(X,Y,R,Math.PI,0);g.fill();g.strokeStyle='rgba(190,220,255,.55)';g.lineWidth=1.4;g.stroke();for(let i=1;i<4;i++){g.beginPath();g.ellipse(X,Y,R*i/4,R,0,Math.PI,0);g.stroke()}for(let i=0;i<5;i++)box(g,X-R*.7+i*R*.32,Y-9,4,5,'#ffe9a0',1);box(g,X-R-4,Y,R*2+8,6,'#6a6888',2)});
      G.paint.ridge({col:'#2c2a40',base:.9,amp:.05,k:[3,7,13]})(g,w,h,r);stands('#1a1830','#222040','rgba(216,208,255,.28)')}
    else if(key==='pesada'){sky(['#120806','#2a120c','#4a1e10']);G.fillTile(g,G.tile('tijolo',{size:80,a:'#5a2a20',b:'#140806',seed:4}),0,0,w,h,{alpha:.75});g.fillStyle=lg(g,0,0,0,h,'rgba(0,0,0,.65)','rgba(0,0,0,.2)');g.fillRect(0,0,w,h);
      [150,650].forEach(X=>{g.fillStyle=rg(g,X,250,6,130,'rgba(255,140,40,.65)','rgba(255,90,20,0)');g.fillRect(X-130,120,260,260);g.fillStyle='#0c0504';g.beginPath();g.moveTo(X-52,320);g.lineTo(X-52,240);g.arc(X,240,52,Math.PI,0);g.lineTo(X+52,320);g.closePath();g.fill();
        g.fillStyle=lg(g,0,206,0,318,'#ffd36b','#ff6a1a','#5a1004');g.beginPath();g.moveTo(X-40,316);g.lineTo(X-40,244);g.arc(X,244,40,Math.PI,0);g.lineTo(X+40,316);g.closePath();g.fill();for(let i=-3;i<4;i++)box(g,X+i*12-1.5,204,3,114,'#140806')});
      [60,270,530,740].forEach((X,i)=>{for(let y=-4;y<90+(i%2)*60;y+=13){g.strokeStyle='#8a7a70';g.lineWidth=2.6;g.beginPath();g.ellipse(X,y,(y/13|0)%2?3:6,9,0,0,TAU);g.stroke()}G.poly(g,[[X-12,96+(i%2)*60],[X+12,96+(i%2)*60],[X+8,112+(i%2)*60],[X-8,112+(i%2)*60]],'#2a1c18')});
      stands('#22100c','#2e1812','rgba(255,170,100,.3)')}
    else{sky(['#1c1244','#6a2a68','#d8606a','#ffc070']);stars(46,110);
      g.fillStyle=rg(g,236,236,20,170,'rgba(255,220,140,.75)','rgba(255,150,90,0)');g.fillRect(60,70,360,300);disc(g,236,250,52,lg(g,0,198,0,300,'#fff4c0','#ff9a5a'));[258,270,281,290].forEach((y,i)=>box(g,180,y,112,1.5+i,'rgba(180,70,110,.75)'));
      g.fillStyle=lg(g,0,272,0,h,'#b8506a','#3a2058','#1c1236');g.fillRect(0,272,w,h-272);for(let i=0;i<110;i++){const Y=275+Math.pow(r(),1.6)*100,X=r()<.45?196+r()*80:r()*w;line(g,[[X,Y],[X+6+r()*18,Y]],'rgba(255,225,160,'+(0.15+r()*.4)+')',1.3)}
      [[34,1],[766,-1],[96,1]].forEach(([X,s],k)=>{const top=150+k*28;g.strokeStyle='#1c0c20';g.lineWidth=11-k*2;g.lineCap='round';g.beginPath();g.moveTo(X,340);g.quadraticCurveTo(X+s*4,240,X+s*34,top);g.stroke();for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6,L=52-k*8,tx=X+s*34,u=tx+Math.cos(a)*L,v=top+Math.sin(a)*L*.55;g.fillStyle='#1c0c20';g.beginPath();g.moveTo(tx,top);g.quadraticCurveTo((tx+u)/2,v-16,u,v+14);g.quadraticCurveTo((tx+u)/2,v+2,tx,top+5);g.fill()}disc(g,X+s*34,top+4,6,'#3a1c14')});
      stands('#3a1a38','#4a2442','rgba(255,200,140,.35)')}
  },{s:2});

  /* torcida de Perseus (duas fileiras que balançam) */
  const crowd=k=>G.bake(`vb:crowd:${key}:${k}`,820,70,(g,w,h,r)=>{for(let side=0;side<2;side++)for(let i=0;i<10;i++){const X=(side?530:24)+i*29+(k?12:0),s=9+r()*4,Y=h-(k?30:6)-r()*5,c=G.shade(TH.crowd,k?.16:.05);
    ell(g,X,Y,s*1.1,s,c);ell(g,X,Y-s*.95,s*.82,s*.7,c);G.poly(g,[[X-s*.8,Y-s*1.1],[X-s*.7,Y-s*2],[X-s*.15,Y-s*1.55]],c);G.poly(g,[[X+s*.8,Y-s*1.1],[X+s*.7,Y-s*2],[X+s*.15,Y-s*1.55]],c);
    if(r()<.6){disc(g,X-s*.3,Y-s,1.2,TH.acc);disc(g,X+s*.3,Y-s,1.2,TH.acc)}if(r()<.2)box(g,X+s,Y-s*2.6,12,8,r()<.5?'#5aa7e8':'#e0455a',1)}});
  const clouds=()=>G.bake('vb:cl:'+key,800,200,G.paint.clouds({col:key==='vento'?'#c8dcec':'#ffd0c0',n:9,a:key==='vento'?.22:.18,top:.1,bottom:.8}));
  const floor=()=>G.bake('vb:floor:'+key,W,H-GY+4,(g,w,h)=>{G.fillTile(g,G.tile(TH.floor,{size:64,a:TH.a,b:TH.b,seed:6}),0,4,w,h-4);g.fillStyle=lg(g,0,4,0,h,'rgba(0,0,0,.02)','rgba(0,0,0,.55)');g.fillRect(0,4,w,h-4);
    if(key==='lua')[[70,24,30],[230,34,18],[560,20,24],[720,32,34]].forEach(([X,Y,R])=>{ell(g,X,Y,R,R*.24,'rgba(30,28,46,.6)');ell(g,X,Y+1.5,R*.8,R*.16,'rgba(200,196,230,.35)')});
    box(g,0,2,w,5,TH.line,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,7,w,2);
    [[14,'#5aa7e8'],[w-84,'#e0455a'],[NX-84,'#5aa7e8'],[NX+14,'#e0455a']].forEach(([X,c])=>box(g,X,3,70,3,c,1.5))},{s:2});
  /* rede: o poste central tem a largura da colisão (8 px) */
  const net=()=>G.bake('vb:net:'+key,48,GY-NT+16,(g,w,h)=>{const c=24,top=8;
    g.fillStyle='rgba(10,8,18,.28)';g.fillRect(c-15,top+4,30,92);g.strokeStyle=G.rgba(TH.line,.5);g.lineWidth=1;
    for(let y=top+10;y<top+98;y+=9){g.beginPath();g.moveTo(c-15,y);g.lineTo(c+15,y);g.stroke()}for(let X=c-15;X<=c+15;X+=7.5){g.beginPath();g.moveTo(X,top+4);g.lineTo(X,top+96);g.stroke()}
    box(g,c-5,top,10,h-top-8,lg(g,c-5,0,c+5,0,'#6a5a48','#fff0d8','#7a6a54'),3);
    box(g,c-17,top+2,34,5,TH.line,2);box(g,c-17,top+95,34,3,G.rgba(TH.line,.8),1.5);
    box(g,c-8,h-58,16,48,lg(g,c-8,0,c+8,0,'#1c3a6a','#5aa7e8','#12284a'),5);box(g,c-8,h-40,16,5,'#ffd36b');
    disc(g,c,top,5.4,'#3a2406');disc(g,c,top,4,'#ffd36b');disc(g,c-1.2,top-1.4,1.4,'#fff')},{s:2});
  /* bola de vôlei com gomos (raio 20 no sprite) */
  const ball=kind=>G.bake('vb:ball:'+kind,44,44,g=>{const c=22,R=20,C={n:['#ffffff','#2f8ae0','#ffd36b'],fire:['#ffd36b','#e0501a','#fff4c0'],heavy:['#a8a4a0','#4a4650','#c8802a']}[kind];
    disc(g,c,c,R,C[0]);g.save();g.beginPath();g.arc(c,c,R,0,TAU);g.clip();
    for(let i=0;i<3;i++){g.save();g.translate(c,c);g.rotate(i*TAU/3);g.fillStyle=C[1];g.beginPath();g.moveTo(1,-1);g.quadraticCurveTo(19,-6,16,-22);g.lineTo(4,-24);g.quadraticCurveTo(13,-9,1,-1);g.fill();g.strokeStyle=C[2];g.lineWidth=2.6;g.beginPath();g.moveTo(-2,-3);g.quadraticCurveTo(6,-12,-2,-22);g.stroke();g.strokeStyle='rgba(20,16,30,.55)';g.lineWidth=1;g.beginPath();g.moveTo(1,-1);g.quadraticCurveTo(19,-6,16,-22);g.moveTo(1,-1);g.quadraticCurveTo(13,-9,4,-24);g.stroke();g.restore()}
    g.fillStyle=rg(g,c-7,c-8,2,30,'rgba(255,255,255,.4)','rgba(255,255,255,0)','rgba(0,0,0,.5)');g.fillRect(0,0,44,44);
    if(kind==='heavy')[[12,14],[30,12],[28,31],[13,29]].forEach(([X,Y])=>{disc(g,X,Y,2.4,'#2a2630');disc(g,X-.6,Y-.6,1.1,'#d8d0c8')});g.restore();
    ring(g,c,c,R-.4,'#160c20',1.4);ell(g,c-7,c-9,5,3,'rgba(255,255,255,.75)',-.6)},{s:3});
  const roots=()=>G.bake('vb:roots',394,34,(g,w,h,r)=>{for(let k=0;k<2;k++){const p=[];for(let X=0;X<=w;X+=14)p.push([X,26+Math.sin(X*.09+k*3)*5+(r()-.5)*3]);line(g,p,'#2a1a0a',8-k*2);line(g,p,k?'#6aa850':'#7a5a2a',4.4-k)}
    for(let i=0;i<22;i++){const X=8+i*17.6+r()*6,hh=14+r()*14;line(g,[[X,30],[X+(r()-.5)*9,30-hh*.6],[X+(r()-.5)*12,30-hh]],'#3a6a24',3);ell(g,X+(r()-.5)*12,30-hh,6,3,r()<.5?'#7dffa8':'#4ac86a',r()*3)}},{s:2});
  const sock=(x,X,Y,wind,t)=>{const k=Math.max(-1,Math.min(1,wind/160)),d=k<0?-1:1,L=14+Math.abs(k)*38,wob=Math.sin(t*9)*3*Math.abs(k);box(x,X-2,Y,4,66,'#c8d4dc',2);disc(x,X,Y,3.4,'#ffd36b');
    for(let i=0;i<4;i++){const a=i/4,b=(i+1)/4,y0=Y+3+a*(1-Math.abs(k))*34+wob*a,y1=Y+3+b*(1-Math.abs(k))*34+wob*b;G.poly(x,[[X+d*L*a,y0-7+a*4],[X+d*L*b,y1-7+b*4],[X+d*L*b,y1+7-b*4],[X+d*L*a,y0+7-a*4]],i%2?'#f4f0e8':'#e0455a')}};
  const amb=G.ambient(TH.amb,{W,H:GY,n:key==='lua'?18:24,col:TH.ac,seed:11});
  return{TH,bg,crowd,clouds,floor,net,ball,roots,sock,amb};
}
function volley54(C){
  const W=800,H=450,GY=404,NX=400,NT=262,R=27,BR=17,o=C.room.opt||{},multi=!!C.net;
  const cup=!multi&&o.m==='copa'?VBCUP54[Math.max(0,Math.min(3,+o.cs||0))]:null,cs=cup?+o.cs||0:-1;
  const diff=cup?cup.d:C.diff,ar=cup?cup.ar:(o.ar||'normal'),PTS=cup?7:+(o.pts||7),SETS=cup?1:+(o.sets||1),NEED=Math.ceil(SETS/2);
  const gk=ar==='lua'?.62:ar==='pesada'?1.28:1;
  const G=1600*(ar==='lua'?.8:1),GB=gdPick(C.gd,[440,520,600,690])*gk,SP=310,JV=-640*(ar==='lua'?.92:1),HIT=gdPick(C.gd,[440,480,530,590])*(ar==='pesada'?.95:1),VMAX=gdPick(C.gd,[500,540,590,650]);
  const ps=C.players.map((p,i)=>({...p,team:multi?(i%2):0,ai:false,el:multi?VBELK54[((p.c|0)%5+5)%5]:(o.el||'fe')}));
  if(!multi)ps.push({u:'~ai',n:cup?cup.n:'Perseus',c:-1,team:1,ai:true,el:cup?cup.el:VBELK54[Math.floor(Math.random()*5)]});
  else{const a=ps.filter(p=>p.team===0).length,b=ps.length-a;if(a!==b)ps.push({u:'~ai',n:'Perseus',c:-1,team:a<b?0:1,ai:true,el:'fe'})}
  const place=()=>ps.forEach(p=>{const m=ps.filter(q=>q.team===p.team),k=m.indexOf(p),n=m.length;p.x=p.team?NX+(W-NX)*(k+1)/(n+1):NX*(k+1)/(n+1);p.y=GY-R;p.vx=0;p.vy=0;p.in=p.in||{l:0,r:0,j:0,a:0,p:0};p.dx=p.x;p.dy=p.y;p.f=p.team?-1:1;p.en=p.en||0;p.dive=0;p.spk=0;p.blk=0;p.tp=(p.tp|0)+1});
  place();
  const S={b:{x:200,y:120,vx:0,vy:0},sc:[0,0],sets:[0,0],setN:1,wait:1.2,acc:0,snapAt:0,hits:0,shown:0,end:false,touch:{t:-1,n:0},rally:0,maxRally:0,wind:0,windT:0,
    st:{spk:0,blk:0,ace:0,dive:0,pow:0},fire:null,ghost:0,roots:[0,0],eye:[0,0],lastHitter:null,msg:'',msgT:0,points:[]};
  const serve=t=>{S.b={x:t?NX+190:NX-190,y:110,vx:0,vy:0};S.wait=1.1;S.fresh=true;S.server=t;S.touchesSinceServe=0;S.touch={t:-1,n:0};S.rally=0;S.fire=null;S.ghost=0};
  serve(Math.random()<.5?0:1);
  const me=ps.find(p=>p.u===C.me),inp={l:0,r:0,j:0,a:0,p:0};
  const tname=t=>{const h=ps.filter(p=>p.team===t&&!p.ai);return h.length?h.map(p=>p.n).join(' + '):(cup?cup.n:'Perseus · '+(DIFF12[diff]||DIFF12.medio).n)};
  const AIP={facil:{sp:.7,re:.4,err:80,jump:.4,spike:0,aim:0,back:250,slip:.16,net:false,naive:true,pw:.002},medio:{sp:.9,re:.16,err:24,jump:.85,spike:.15,aim:.35,back:180,slip:0,net:false,pw:.006},
    dificil:{sp:1,re:.07,err:6,jump:1,spike:.55,aim:.85,back:160,slip:0,net:true,pw:.012},pesadelo:{sp:1.14,re:.015,err:0,jump:1,spike:.92,aim:1,back:125,slip:0,net:true,pw:.02}}[diff]||{};
  const HITY=GY-2*R-BR+6;
  function say(m){S.msg=m;S.msgT=performance.now()}
  function predict(side,y0,useNet){let{x,y,vx,vy}=S.b;const h=1/120;if(S.wait>0)return{x,t:S.wait+Math.sqrt(Math.max(0,2*(y0-y)/GB))};
    for(let t=0;t<3;t+=h){vy+=GB*h;vx+=S.wind*h;x+=vx*h;y+=vy*h;if(x<BR){x=BR;vx=Math.abs(vx)*.9}if(x>W-BR){x=W-BR;vx=-Math.abs(vx)*.9}
      if(useNet&&y+BR>NT&&x+BR>NX-5&&x-BR<NX+5){if(y<NT+4){y=NT-BR;vy=-Math.abs(vy)*.7;vx+=x<NX?-80:80}else if(x<NX){x=NX-5-BR;vx=-Math.abs(vx)*.8}else{x=NX+5+BR;vx=Math.abs(vx)*.8}}
      if(vy>0&&y>=y0&&(side?x>NX:x<NX))return{x,t};if(y+BR>=GY)return{x,t}}return{x,t:3}}
  function aiThink(p){const b=S.b,side=p.team,dir=side?1:-1,mine=side?b.x>NX:b.x<NX,coming=side?b.vx>0:b.vx<0;let tx=side?NX+AIP.back:NX-AIP.back;p.aiNear=false;
    if(S.wait>0&&mine){if(p.aiServe==null)p.aiServe=6+Math.random()*30;tx=b.x+dir*p.aiServe}
    else if(mine||coming){p.aiServe=null;const pr=AIP.naive?(()=>{const disc=b.vy*b.vy+2*GB*(HITY-b.y),t=disc>0?(-b.vy+Math.sqrt(disc))/GB:.3;let x=b.x+b.vx*t;if(x<0)x=-x;if(x>W)x=2*W-x;return{x}})():predict(side,HITY,AIP.net);
      p.aiNear=Math.abs(pr.x-NX)<160;const off=p.aiSpk&&p.aiNear?20:10+Math.random()*16;tx=pr.x+dir*off;p.aiLand=pr.x}else{p.aiServe=null;p.aiSpk=Math.random()<AIP.spike}
    const conf=S.ghost>0&&!mine?(Math.random()-.5)*160:0;tx+=(Math.random()-.5)*2*AIP.err+conf;if(AIP.slip&&Math.random()<AIP.slip)tx=p.x;p.aiTx=tx;p.aiCanJ=Math.random()<AIP.jump}
  function aiIn(p,h){const b=S.b,side=p.team,lo=side?NX+R+6:R,hi=side?W-R:NX-R-6;p.aiCd=(p.aiCd||0)-h;if(p.aiCd<=0||p.aiTx==null){p.aiCd=AIP.re*(.7+Math.random()*.6);aiThink(p)}
    const tx=clamp12(p.aiTx,lo,hi),I={l:0,r:0,j:0,a:0,p:0};if(p.x<tx-8)I.r=1;else if(p.x>tx+8)I.l=1;const mine=side?b.x>NX:b.x<NX,dx=Math.abs(b.x-p.x);
    if(mine&&S.wait<=0&&p.aiCanJ){if(p.aiSpk&&p.aiNear&&dx<62&&b.y>NT-215&&b.y<NT+20&&b.vy>-200)I.j=1;else if(dx<(AIP.net?58:70)&&b.y>GY-(AIP.net?230:190)&&b.y<GY-75&&b.vy>-120)I.j=1}
    /* mergulho quando não alcança */
    if(mine&&S.wait<=0&&b.vy>0&&b.y>GY-110&&dx>60&&dx<200&&p.y>=GY-R-1&&AIP.jump>.5&&Math.random()<.5){I.a=1;p.f=b.x>p.x?1:-1}
    /* poder */
    if(p.en>=100&&S.wait<=0&&Math.random()<AIP.pw*60*h){const ok={fe:mine&&dx<120,nat:mine&&b.vy>0,ine:mine&&dx>150,ilu:mine&&dx<100,ver:true}[p.el];if(ok)I.p=1}
    return I}
  function aiHit(p,b){const dir=p.team?-1:1,air=p.y<GY-R-40;
    if(air&&p.aiSpk&&Math.abs(b.x-NX)<180&&b.y<NT-BR){const vx=dir*(380+Math.random()*(diff==='pesadelo'?190:130)),t=(Math.abs(NX-b.x)+BR+6)/Math.abs(vx),vyMax=(NT-BR-10-b.y-.5*GB*t*t)/t;
      if(vyMax>-140){b.vx=clamp12(vx,-560,560);b.vy=clamp12(vyMax-20,-140,320);S.spike=p.team;return true}}
    if(AIP.slip&&Math.random()<AIP.slip){b.vx*=.45;return true}const fresh=S.fresh;S.fresh=false;if(Math.random()>=AIP.aim)return false;
    return aimHole(p,b,fresh)}
  function aimHole(p,b,fresh){const dir=p.team?-1:1,opp=ps.filter(q=>q.team!==p.team),a=p.team?R+10:NX+40,z=p.team?NX-40:W-R-10;let best=null,bs=-1,vys=[-360,-420,-480,-540,-600,-680,-760];if(b.y<NT-90)vys.push(-240,-120,0,150,300);
    if(fresh){best=a+(z-a)*Math.random();const k=Math.floor(Math.random()*4);vys=vys.slice(k).concat(vys.slice(0,k))}else for(let i=0;i<9;i++){const x=a+(z-a)*i/8,s=Math.min(...opp.map(q=>Math.abs(q.x-x)))+(i===0||i===8?18:0)+Math.random()*20;if(s>bs){bs=s;best=x}}
    const ok=[];for(const vy of vys){const t=(-vy+Math.sqrt(vy*vy+2*GB*(GY-BR-b.y)))/GB,vx=(best-b.x)/t;if(Math.abs(vx)>560)continue;const xe=NX+dir*(6+BR),tn=(xe-b.x)/vx;if(!(tn>0))continue;const yn=b.y+vy*tn+.5*GB*tn*tn;if(yn<NT-BR-8){ok.push([vx,vy]);if(!fresh)break}}
    if(!ok.length)return false;const[vx,vy]=fresh?pick12(ok):ok[0];b.vx=vx;b.vy=vy;return true}
  const sayK=k=>SAY12[k+'_'+diff]||SAY12[k];
  function point(t,why){
    S.sc[t]++;fx5('mgCoin');const spk=S.spike===t;S.spike=null;S.points.push(t);
    if(S.rally>S.maxRally)S.maxRally=S.rally;if(S.rally>=20&&me&&!multi)C.achieve?.('vb_rally');
    if(S.server===t&&S.touchesSinceServe===0&&ps.some(p=>p.team===t&&p===me)){S.st.ace++;C.achieve?.('vb_ace')}
    ps.forEach(p=>{if(p.team===t)p.en=Math.min(100,p.en+12)});
    C.fx?.shake(spk?9:6,.3);C.fx?.burst(S.b.x,GY-6,{n:22,col:[t===0?'#5aa7e8':'#e0233b','#ffd36b','#fff'],sp:240,life:.7,size:3.2,grav:500,ang:-Math.PI/2,spread:2.2});C.fx?.float(S.b.x,GY-70,why||(spk?'CORTADA!':'PONTO!'),{col:'#ffd36b',size:spk?34:28,life:1});
    const o2=1-t,won=S.sc[t]>=PTS&&S.sc[t]-S.sc[o2]>=(PTS>7?2:1);
    if(won){S.sets[t]++;
      if(S.sets[t]>=NEED){S.end=true;finish(t);return}
      S.setN++;say(`Set para ${tname(t)}! Set ${S.setN}`);C.fx?.float(400,150,`SET ${S.setN}`,{col:'#ffd36b',size:40,life:1.6});S.sc=[0,0];place();serve(o2);return}
    if(S.sc[t]===PTS-1&&S.sets[t]===NEED-1)setTimeout(()=>{C.fx?.float(400,150,'MATCH POINT!',{col:'#ff8fb1',size:36,life:1.4});fx5('activate')},500);
    serve(t);const ai=ps.some(p=>p.ai&&p.team===t);
    C.say(spk&&ai?sayFmt(sayK('spike')):multi?(ai?sayFmt(sayK('aiPoint')):sayFmt(SAY12.multiPoint,{t:tname(t)})):sayFmt(t===1?sayK('aiPoint'):sayK('humanPoint')))}
  function finish(t){const rows=ps.map(p=>({u:p.u,n:p.n,c:p.c,s:SETS>1?S.sets[p.team]:S.sc[p.team],w:p.team===t}));const won=me&&me.team===t;
    let first=false;if(!multi)progPut38(pp=>{pp.vb=pp.vb||{};if(won){pp.vb.wins=(pp.vb.wins||0)+1;if(cup){if(cs+1>(pp.vb.cs||0))pp.vb.cs=Math.min(3,cs+1);if(cs===3){first=!pp.vb.cup;pp.vb.cup=(pp.vb.cup||0)+1;C.achieve?.('vb_copa')}}}if(S.maxRally>(pp.vb.best||0))pp.vb.best=S.maxRally});
    if(won&&!multi&&S.sc[1-t]===0&&SETS===1)C.achieve?.('vb_perfeito');
    const mul=gdMul38(diff||'medio');S.rw={ob:won?Math.round((multi?10:cup?(cs===3?40:10+cs*4):8+(PTS-7)*.8+(SETS-1)*4)*mul)+(first?20:0):3,why:[cup?`Copa ${cs+1}/4`:'',won?'vitória':'',S.maxRally>=10?`rali de ${S.maxRally}`:''].filter(Boolean).join(' · ')||'partida'};S.rw.xp=Math.round(S.rw.ob*.6);
    C.finish({title:(multi?'Vitória de '+tname(t):(t===1?`${tname(1)} venceu`:`Você venceu ${cup?cup.n:'o Perseus'}!`))+(SETS>1?` · sets ${S.sets[0]} × ${S.sets[1]}`:` · ${S.sc[0]} × ${S.sc[1]}`),rows,unit:SETS>1?'sets':'pts',
      html:`<ul class="r38-l"><li>🏐 Maior rali: <b>${S.maxRally}</b> toques</li><li>💥 Cortadas: <b>${S.st.spk}</b> · 🧱 Bloqueios: <b>${S.st.blk}</b></li><li>🤿 Mergulhos: <b>${S.st.dive}</b> · ✨ Poderes: <b>${S.st.pow}</b></li><li>🎯 Aces: <b>${S.st.ace}</b> · 🏟 ${esc(VBAR54[ar].n)}</li></ul>${cup&&won&&cs<3?`<p class="r38-hi">Próximo rival: ${esc(VBCUP54[cs+1].n)}.</p>`:''}`});
    if(!multi)C.say(t===1?sayFmt(sayK('aiWin')):sayFmt(sayK('humanWin')))}
  function usePower(p){if(p.en<100)return;p.en=0;if(p===me)S.st.pow++;fx5('activate');C.fx?.flash(p.team?'#ff8fb1':'#7fe3ff',.18);const b=S.b;
    if(p.el==='fe'){p.fireReady=1;C.fx?.float(p.x,p.y-60,'Cortada Solar!',{col:'#ffd36b',size:18})}
    else if(p.el==='nat'){S.roots[p.team]=7;C.fx?.float(p.x,p.y-60,'Muralha!',{col:'#7dffa8',size:18})}
    else if(p.el==='ine'){const mine=p.team?b.x>NX:b.x<NX;if(mine){p.x=clamp12(b.x-p.f*10,p.team?NX+6+R:R,p.team?W-R:NX-6-R);p.tp=(p.tp|0)+1;C.fx?.burst(p.x,p.y,{n:14,col:['#c58bff','#000'],sp:160,life:.4,size:3,grav:0})}else p.en=100}
    else if(p.el==='ilu'){p.ghostReady=1;C.fx?.float(p.x,p.y-60,'Bola Fantasma',{col:'#7fe3ff',size:18})}
    else if(p.el==='ver'){S.eye[p.team]=8;p.eyeAim=8;C.fx?.float(p.x,p.y-60,'Olho da Verdade',{col:'#ff8fb1',size:18})}}
  function phys(h){
    S.windT-=h;if(ar==='vento'&&S.windT<=0){S.windT=4+Math.random()*3;S.windTo=(Math.random()-.5)*320}if(ar==='vento')S.wind+=((S.windTo||0)-S.wind)*h*.8;
    S.roots=S.roots.map(v=>Math.max(0,v-h));S.eye=S.eye.map(v=>Math.max(0,v-h));S.ghost=Math.max(0,S.ghost-h);
    ps.forEach(p=>{const I=p.ai?aiIn(p,h):p.in,sp=p.ai?SP*(AIP.sp||1):SP;const prevA=p.lastA,prevP=p.lastP;p.lastA=I.a;p.lastP=I.p;if(p.eyeAim>0)p.eyeAim-=h;
      if(I.p&&!prevP)usePower(p);
      const ground=p.y>=GY-R-.5;
      if(I.a&&!prevA){if(ground&&p.dive<=0&&S.wait<=0){p.dive=.38;p.f=I.r?1:I.l?-1:p.f;if(p===me)S.st.dive++;fx5('mgJump')}else if(!ground){p.spk=.25;p.blk=Math.abs(p.x-NX)<70?.3:0}}
      p.spk=Math.max(0,p.spk-h);p.blk=Math.max(0,p.blk-h);
      if(p.dive>0){p.dive-=h;p.vx=p.f*SP*1.9}else{p.vx=(I.r-I.l)*sp;if(p.vx)p.f=p.vx>0?1:-1}
      if(p.cd>0)p.cd-=h;if(I.j&&ground&&p.dive<=0){p.vy=JV;if(p.u===C.me)fx5('mgJump')}
      p.vy+=G*h;p.x+=p.vx*h;p.y+=p.vy*h;if(p.y>GY-R){p.y=GY-R;p.vy=0}p.x=clamp12(p.x,p.team?NX+6+R:R,p.team?W-R:NX-6-R)});
    if(S.wait>0){S.wait-=h;return}
    const b=S.b;b.vy+=GB*h;b.vx+=S.wind*h;b.x+=b.vx*h;b.y+=b.vy*h;
    if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.9}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.9}
    if(b.y+BR>NT&&b.x+BR>NX-5&&b.x-BR<NX+5){if(b.y<NT+4){b.y=NT-BR;b.vy=-Math.abs(b.vy)*.7;b.vx+=b.x<NX?-80:80}else if(b.x<NX){b.x=NX-5-BR;b.vx=-Math.abs(b.vx)*.8}else{b.x=NX+5+BR;b.vx=Math.abs(b.vx)*.8}}
    /* a bola mudou de lado: zera os toques */
    for(const p of ps){if(p.cd>0)continue;const rr=R*(p.blk>0?1.45:1)*(p.dive>0?1.2:1),dx=b.x-p.x,dy=b.y-(p.y+(p.dive>0?10:0)),d=Math.hypot(dx,dy);if(d>=rr+BR||d<1e-6)continue;
      /* contagem de toques */
      if(S.touch.t===p.team)S.touch.n++;else S.touch={t:p.team,n:1,side:p.team};S.rally++;S.touchesSinceServe=(S.touchesSinceServe||0)+(S.server!==p.team?1:0);
      if(S.touch.n>3){S.touch={t:-1,n:0};point(1-p.team,'4 TOQUES!');return}
      p.en=Math.min(100,p.en+9);
      const nx=dx/d,ny=dy/d;b.x=p.x+nx*(rr+BR);b.y=p.y+ny*(rr+BR);
      const burned=S.fire&&S.fire.t!==p.team;
      let sp=Math.max(HIT,Math.hypot(b.vx,b.vy)*.92),vx=nx*sp+p.vx*.4,vy=ny*sp+Math.min(0,p.vy)*.25;if(vy>-320)vy=-320-Math.random()*80;
      if(p.team===0&&vx<60)vx=Math.max(vx,60+Math.random()*120);if(p.team===1&&vx>-60)vx=Math.min(vx,-60-Math.random()*120);
      b.vx=clamp12(vx,-VMAX,VMAX);b.vy=Math.max(-780,vy);S.hits++;S.spike=null;S.fire=null;S.lastHitter=p;
      const dir=p.team?-1:1;
      if(p.dive>0){b.vy=-560;b.vx=dir*120;p.dive=0;C.fx?.float(p.x,p.y-50,'MERGULHO!',{col:'#7fe3ff',size:16})}
      else if(p.blk>0&&Math.abs(b.x-NX)<90&&b.y<NT){b.vx=dir*300;b.vy=60;p.blk=0;S.spike=p.team;if(!p.ai)S.st.blk++;if(p===me)C.achieve?.('vb_bloqueio');C.fx?.float(p.x,p.y-60,'BLOQUEIO!',{col:'#ffd36b',size:20});fx5('bb5')}
      else if(p.spk>0&&b.y<NT+20&&Math.abs(b.x-NX)<260){const t=(Math.abs(NX-b.x)+BR+6)/520,vyM=(NT-BR-10-b.y-.5*GB*t*t)/t;b.vx=dir*520;b.vy=clamp12(Math.min(vyM-20,280),-200,320);p.spk=0;S.spike=p.team;if(!p.ai)S.st.spk++;C.fx?.shake(5,.2);C.fx?.float(p.x,p.y-60,'CORTADA!',{col:'#ff9b3d',size:20});fx5('bb6')}
      else if(p.ai&&aiHit(p,b))p.cd=.18;
      else if(p.eyeAim>0)aimHole(p,b,false);
      if(burned){b.vx*=.45;b.vy=Math.max(b.vy,-260);C.fx?.float(p.x,p.y-50,'Queimou!',{col:'#ff6b3d',size:16})}
      if(p.fireReady){p.fireReady=0;S.fire={t:p.team};b.vx=dir*Math.max(Math.abs(b.vx),480);C.fx?.flash('#ff9b3d',.2)}
      if(p.ghostReady){p.ghostReady=0;S.ghost=1.4}
      S.fresh=false;p.aiTx=null;break}
    if(b.y+BR>=GY){const side2=b.x<NX?0:1;if(S.roots[side2]>0){S.roots[side2]=0;b.y=GY-BR-2;b.vy=-620;b.vx=side2?-160:160;C.fx?.float(b.x,GY-60,'Raízes!',{col:'#7dffa8',size:20});fx5('bb4');return}
      b.y=GY-BR;point(b.x<NX?1:0)}}
  function snap(){C.send('snap',{b:[S.b.x,S.b.y,S.b.vx,S.b.vy].map(v=>Math.round(v)),p:ps.map(p=>[p.u,Math.round(p.x),Math.round(p.y),p.f,Math.round(p.en),p.dive>0?1:0,p.tp|0]),sc:S.sc,ss:S.sets,w:S.wait>0?1:0,h:S.hits,tn:S.touch.n,tt:S.touch.t,r:S.roots.map(v=>v>0?1:0),g:S.ghost>0?1:0,fi:S.fire?S.fire.t:-1,wd:Math.round(S.wind)})}
  /* convidado: manda as teclas E a posição que ele mesmo calculou (o boneco responde na hora, sem esperar a ida e volta pelo servidor).
     O anfitrião continua dono da bola, dos toques, dos pontos e do C.finish. */
  function sendIn(){if(!me)return;if(C.host){me.in={...inp};return}sentAt=Date.now();sentX=me.x;sentY=me.y;C.send('in',{...inp,x:Math.round(me.x),y:Math.round(me.y),vy:Math.round(me.vy||0),tp:me.tp|0})}
  /* predição local do próprio boneco (as mesmas regras de movimento do phys) */
  function selfStep(p,h){const I=inp,prevA=p.lastA;p.lastA=I.a;const ground=p.y>=GY-R-.5;
    if(I.a&&!prevA&&ground&&p.dive<=0&&!S.w){p.dive=.38;p.f=I.r?1:I.l?-1:p.f;fx5('mgJump')}
    if(p.dive>0){p.dive-=h;p.vx=p.f*SP*1.9}else{p.vx=(I.r-I.l)*SP;if(p.vx)p.f=p.vx>0?1:-1}
    if(I.j&&ground&&p.dive<=0){p.vy=JV;fx5('mgJump')}
    p.vy+=G*h;p.x+=p.vx*h;p.y+=p.vy*h;if(p.y>GY-R){p.y=GY-R;p.vy=0}p.x=clamp12(p.x,p.team?NX+6+R:R,p.team?W-R:NX-6-R)}
  let keepAt=0,sentAt=0,sentX=0,sentY=0,selfAcc=0;
  /* visual (GFX60): o motor é GX; G aqui é a gravidade */
  const GX=window.GFX60,art=vbArt54(ar),T=(x,s,X,Y,o)=>GX.hud.text(x,s,X,Y,{al:'center',...o});
  const ELC={fe:'#ffd36b',nat:'#7dffa8',ine:'#c58bff',ilu:'#7fe3ff',ver:'#ff8fb1'},ELI={fe:'sol',nat:'folha',ine:'espiral',ilu:'estrela',ver:'olho'};
  GX.skin({acc:art.TH.acc});
  /* efeitos lidos do estado já calculado (e da posição desenhada): nada volta para a física nem para a rede */
  const V={on:false,hits:0,key:'',cheer:-9999,ang:0,at:0,bx:0,trail:[],p:[]};
  function watch(now){const dt=V.on?Math.min(.05,Math.max(0,(now-V.at)/1000)):0;V.at=now;
    const b=S.b,key=`${S.sc}|${S.sets}`,wait=C.host?S.wait>0:!!S.w,hidden=S.ghost>0;
    if(!wait)V.ang+=b.vx*dt/BR*.45;
    if(hidden||wait)V.trail.length=0;else{V.trail.push([b.x,b.y]);if(V.trail.length>7)V.trail.shift()}
    if(V.on){
      if(S.hits>V.hits&&!hidden){if(Math.abs(b.vx)>=470||S.fire){GX.hitstop(55);GX.emit('impacto',b.x,b.y,{col:S.fire?'#ff9b3d':'#fff3c0'})}else GX.emit('brilho',b.x,b.y,{col:'#ffffff',amount:.35,size:.8})}
      if(key!==V.key){V.cheer=now;V.trail.length=0;GX.hitstop(110,{zoom:.018});GX.emit('poeira',V.bx,GY-4,{col:art.TH.dust,amount:2,size:1.4})}}
    ps.forEach((p,i)=>{const px=C.host?p.x:p.dx,py=C.host?p.y:p.dy,o=V.p[i]||(V.p[i]={x:px,y:py,vx:0,vy:0,sq:0,dive:false,air:false,land:-999});
      if(dt>0){o.vx=(px-o.x)/dt;o.vy=(py-o.y)/dt}const air=py<GY-R-3,dive=p.dive>0;
      if(V.on){if(dive&&!o.dive)GX.emit('poeira',px,GY-3,{col:art.TH.dust,amount:1.2});if(o.air&&!air){GX.emit('poeira',px,GY-3,{col:art.TH.dust,amount:.8});o.land=now}}
      const alvo=air?Math.min(.1,Math.abs(o.vy)/4200):now-o.land<120?-.1:0;o.sq+=(alvo-o.sq)*Math.min(1,dt*18);o.x=px;o.y=py;o.air=air;o.dive=dive});
    V.hits=S.hits;V.key=key;V.bx=b.x;V.on=true}
  return{g60intro:{title:cup?cup.n:VBAR54[ar].n,sub:'No máximo 3 toques por lado',acc:art.TH.acc},st:()=>S,ps:()=>ps,sim(sec){for(let t=0;t<sec&&!S.end;t+=1/120)phys(1/120)},aip:()=>AIP,usePower,
    reward:()=>S.rw||null,
    next(){if(multi)return null;if(cup){const won=S.sets[0]>=NEED;if(won&&cs<3)return{opt:{m:'copa',cs:String(cs+1)},label:`Copa: ${VBCUP54[cs+1].n}`};if(!won)return{opt:{m:'copa',cs:String(cs)},label:'Tentar de novo'};return null}return{opt:{},label:'Revanche'}},
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')inp.l=v;else if(code==='KeyD'||code==='ArrowRight')inp.r=v;else if(code==='KeyW'||code==='ArrowUp'||code==='Space')inp.j=v;else if(code==='KeyS'||code==='ArrowDown'||code==='KeyK')inp.a=v;else if(code==='KeyE'||code==='KeyL')inp.p=v;else return;sendIn()},
    ptr(){},
    step(dt){const now=Date.now();
      if(!C.host&&me&&now>=C.t0&&!S.end){selfAcc+=dt;while(selfAcc>=1/120){selfStep(me,1/120);selfAcc-=1/120}me.dx=me.x;me.dy=me.y;
        /* enquanto se mexe, manda a posição ~20x/s; parado, só um "estou aqui" a cada 400 ms */
        const moved=Math.abs(me.x-sentX)>.5||Math.abs(me.y-sentY)>.5;if((moved&&now-sentAt>=50)||now-sentAt>400){keepAt=now;sendIn()}}
      else if(!C.host&&now-keepAt>400){keepAt=now;sendIn()}
      if(S.hits>S.shown){S.shown=S.hits;fx5('mgBall');C.fx?.burst(S.b.x,S.b.y,{n:7,col:['#ffe07a','#fff'],sp:150,life:.35,size:2.4,grav:0})}
      if(C.host){if(now<C.t0||S.end)return;S.acc+=dt;while(S.acc>=1/120){phys(1/120);S.acc-=1/120;if(S.end)break}ps.forEach(p=>{p.dx=p.x;p.dy=p.y});if(C.net&&now-S.snapAt>=50){S.snapAt=now;snap()}}
      else{const k=Math.min(1,dt*14);ps.forEach(p=>{if(p.tx==null||p===me)return;p.dx+=(p.tx-p.dx)*k;p.dy+=(p.ty-p.dy)*k});const b=S.b;if(!S.w){b.vy+=GB*dt;b.x+=b.vx*dt;b.y+=b.vy*dt}if(S.tb){b.x+=(S.tb[0]-b.x)*k;b.y+=(S.tb[1]-b.y)*k}}
      const m=me||ps[0],tq=S.touch.t===m.team?S.touch.n:0;C.hud(GX.chips([SETS>1?{icon:'bandeira',label:`set ${S.setN}`,value:`${S.sets[0]}×${S.sets[1]}`}:null,{icon:'trofeu',label:'placar',value:`${S.sc[0]} × ${S.sc[1]}`},{icon:'alvo',label:'toques',value:`${tq}/3`,tone:tq>=3?'warn':null},{icon:'raio',label:'energia',value:`${Math.floor(m.en)}%`},m.en>=100?{icon:ELI[m.el],label:'PODER (E)',value:VBEL54[m.el].n,tone:'ok'}:null,ar!=='normal'?{icon:'nuvem',label:VBAR54[ar].n}:null]))},
    msg(p){if(C.host&&p.t==='in'){const q=ps.find(x=>x.u===p.from);if(q){q.in={l:p.l?1:0,r:p.r?1:0,j:p.j?1:0,a:p.a?1:0,p:p.p?1:0};
        /* posição calculada pelo convidado (só vale se ele já recebeu o último reposicionamento: saque de set, teleporte) */
        if(isFinite(p.x)&&isFinite(p.y)&&(p.tp|0)===(q.tp|0)){q.x=clamp12(Number(p.x),q.team?NX+6+R:R,q.team?W-R:NX-6-R);q.y=Math.min(GY-R,Number(p.y));if(isFinite(p.vy))q.vy=Number(p.vy)}}}
      if(!C.host&&p.t==='snap'){const[x,y,vx,vy]=p.b;S.tb=[x,y];S.b.vx=vx;S.b.vy=vy;if(Math.hypot(S.b.x-x,S.b.y-y)>90){S.b.x=x;S.b.y=y}
        if(p.sc&&(p.sc[0]!==S.sc[0]||p.sc[1]!==S.sc[1])){C.fx?.shake(6,.3);C.fx?.float(S.b.x,GY-70,'PONTO!',{col:'#ffd36b',size:28})}S.sc=p.sc;S.sets=p.ss||S.sets;S.w=p.w;S.hits=Math.max(S.hits,p.h|0);S.touch={t:p.tt,n:p.tn};S.rootsV=p.r;S.ghost=p.g?1:0;S.fire=p.fi>=0?{t:p.fi}:null;S.wind=p.wd||0;
        (p.p||[]).forEach(([u,x2,y2,f,en,dv,tp])=>{const q=ps.find(z=>z.u===u);if(!q)return;q.en=en;
          /* o próprio boneco é previsto aqui: só aceita a posição do anfitrião quando ele reposicionou (tp mudou) ou se a diferença ficou absurda */
          if(q===me){const far=Math.hypot((q.x||0)-x2,(q.y||0)-y2)>160;if((tp!=null&&(tp|0)!==(q.tp|0))||far){q.x=q.dx=x2;q.y=q.dy=y2;q.vy=0;q.dive=0;if(tp!=null)q.tp=tp|0}return}
          q.tx=x2;q.ty=y2;q.f=f;q.dive=dv?.1:0})}},
    left(u){const q=ps.find(p=>p.u===u);if(q){q.ai=true;q.n='Perseus';q.c=-1;q.u='~ai'+u}},
    draw(x){
      const now=performance.now(),still=GX.reduced(),t=still?0:now/1000,TH=art.TH;watch(now);
      GX.draw(x,art.bg(),W/2,GY/2,{w:W,h:GY});
      if(ar==='vento'||ar==='normal'){const cl=art.clouds(),off=still?0:(now/1000*(ar==='vento'?14+S.wind*.35:5))%W;x.drawImage(cl,off-W,20,W,200);x.drawImage(cl,off,20,W,200);x.drawImage(cl,off+W,20,W,200)}
      const cheer=now-V.cheer<900;[0,1].forEach(k=>{const b=still?0:Math.sin(t*(cheer?15:2.2)+k*2)*(cheer?4:1.2);x.drawImage(art.crowd(k),-10,GY-76+b,820,70)});
      art.amb.draw(x,t);
      if(ar==='vento'){art.sock(x,48,100,S.wind,t);
        if(Math.abs(S.wind)>20){const d=Math.sign(S.wind),off=still?0:((now/6*d)%W+W)%W;x.strokeStyle='rgba(220,240,255,.32)';x.lineWidth=2;x.lineCap='round';for(let i=0;i<8;i++){const y=110+i*24,X=(off+i*190)%W;x.beginPath();x.moveTo(X,y);x.quadraticCurveTo(X+d*24,y-5,X+d*(30+Math.abs(S.wind)*.2),y);x.stroke()}
          GX.hud.chip(x,W/2,112,{icon:'nuvem',text:`${S.wind>0?'→':'←'} vento`,al:'center',col:'#9ad8ff',size:12,min:8.5})}}
      if(ar==='pesada'){GX.glow(x,150,270,110,'#ff7a1a',.22+(still?0:.07*Math.sin(t*7)));GX.glow(x,650,270,110,'#ff7a1a',.22+(still?0:.07*Math.sin(t*8+2)))}
      x.drawImage(art.floor(),0,GY-4,W,H-GY+4);
      const roots=C.host?S.roots.map(v=>v>0):(S.rootsV||[0,0]);[0,1].forEach(tm=>{if(!roots[tm])return;GX.glow(x,tm?(NX+W)/2:NX/2,GY,170,'#7dffa8',.28,{sy:.16});x.drawImage(art.roots(),tm?NX+6:0,GY-30,NX-6,34)});
      GX.shadow(x,NX,GY+3,52,{alpha:.55});GX.draw(x,art.net(),NX,NT-8,{ay:0,w:48,h:GY-NT+16});
      /* placar */
      const sw=SETS>1?62:48;GX.hud.panel(x,W/2-92,5,184,sw,{acc:TH.acc,a:.88});
      T(x,String(S.sc[0]),W/2-42,30,{size:32,w:900,col:'#8fd0ff',max:70});T(x,'×',W/2,30,{size:20,col:'#d8d0e0'});T(x,String(S.sc[1]),W/2+42,30,{size:32,w:900,col:'#ff9aa8',max:70});
      if(SETS>1)T(x,`sets ${S.sets[0]} × ${S.sets[1]}`,W/2,56,{size:12,col:'#ffd36b',min:8.5,max:170});
      GX.hud.chip(x,8,62,{icon:'bandeira',text:tname(0),col:'#5aa7e8',size:12,min:8.5});GX.hud.chip(x,W-8,62,{icon:'bandeira',text:tname(1),al:'right',col:'#e0455a',size:12,min:8.5});
      if(S.touch.t>=0&&S.touch.n>0){const tx=S.touch.t?W*.75:W*.25;GX.hud.panel(x,tx-38,76,76,22,{acc:S.touch.n>=3?'#ff6a6a':TH.acc,a:.8});
        for(let i=0;i<3;i++){const on=i<S.touch.n;GX.draw(x,art.ball(S.touch.n>=3?'fire':'n'),tx+(i-1)*21,87,{w:15,h:15,alpha:on?1:.24})}}
      /* previsão do Olho da Verdade */
      const myT=me?me.team:0;if((C.host?S.eye[myT]:0)>0){const pr=predict(myT,GY-BR,true),k=still?0:Math.sin(now/110)*2;GX.glow(x,pr.x,GY-2,40,'#ff8fb1',.6,{sy:.3});x.strokeStyle='#ff8fb1';x.lineWidth=3;x.beginPath();x.ellipse(pr.x,GY-2,22+k,6+k*.3,0,0,TAU16);x.stroke();GX.icon(x,'olho',pr.x,GY-22,18,'#ff8fb1')}
      ps.forEach((p,i)=>{const px=C.host?p.x:p.dx,py=C.host?p.y:p.dy,tc=p.team?'#e0455a':'#5aa7e8',v=V.p[i]||{sq:0},alt=Math.max(0,GY-R-py);
        GX.shadow(x,px,GY+2,R*2.3,{alt,alpha:.55});x.strokeStyle=GX.rgba(tc,.85);x.lineWidth=2.4;x.beginPath();x.ellipse(px,GY+3,R*(p.u===C.me?1.05:.85),4.5,0,0,TAU16);x.stroke();
        if(p.en>=100)GX.glow(x,px,py-4,R*2.1,ELC[p.el]||'#ffd36b',.4+(still?0:.15*Math.sin(t*5)));
        x.save();if(p.dive>0){x.translate(px,py+12);x.rotate(p.f*1.1);x.translate(-px,-(py+12))}
        /* lenço do time esvoaçando */
        {const f=p.f<0?-1:1,w=still?0:Math.sin(t*11+i)*3,run=Math.min(1,Math.abs(v.vx||0)/260);GX.poly(x,[[px-f*14,py+3],[px-f*(34+run*14),py-3+w-(v.vy||0)*.012],[px-f*(30+run*10),py+7+w],[px-f*(38+run*12),py+14+w-(v.vy||0)*.01],[px-f*13,py+13]],tc)}
        x.translate(px,py+R);if(!still&&p.dive<=0)x.scale(1-v.sq*.7,1+v.sq);x.translate(-px,-(py+R));
        mgCat(x,p.c,px,py-4,R*2.5,p.n,{flip:p.f<0,ring:p.u===C.me});
        x.fillStyle='#0c0814';x.fillRect(px-17,py+9,34,7);x.fillStyle=tc;x.fillRect(px-16,py+10,32,5);x.fillStyle='rgba(255,255,255,.45)';x.fillRect(px-16,py+10,32,1.5);x.restore();
        GX.hud.bar(x,px-22,py+R+5,44,5,p.en/100,{col:p.en>=100?'#ffd36b':'#c39bff'});
        if(p.en>=100){GX.hud.panel(x,px+21,py-R-11,22,22,{r:11,acc:ELC[p.el],a:.9});GX.icon(x,ELI[p.el]||'raio',px+32,py-R,15,ELC[p.el])}});
      const b=S.b,gv=S.ghost>0&&Math.floor(now/90)%3!==0,rad=BR*(ar==='pesada'?1.12:1),fire=!!S.fire,bc=fire?'#ff7a1a':ar==='pesada'?'#ffb070':'#9ae0ff';
      if(!gv){if(b.y<GY-rad)GX.shadow(x,b.x,GY+3,rad*2.1,{alt:GY-rad-b.y,alpha:.5});
        if(!still&&!(S.ghost>0))V.trail.forEach(([tx,ty],i)=>{const k=(i+1)/V.trail.length;GX.glow(x,tx,ty,rad*(fire?.7+k*.9:.4+k*.6),bc,k*(fire?.6:.28))});
        GX.glow(x,b.x,b.y,rad*(fire?2.7:1.8),bc,fire?.85:.35);
        if(fire&&!still)for(let i=0;i<6;i++){const a=i*TAU16/6+t*8,q=rad+5+Math.sin(t*21+i*2)*3;GX.glow(x,b.x+Math.cos(a)*q,b.y+Math.sin(a)*q,8,'#ffd36b',.7)}
        GX.draw(x,art.ball(fire?'fire':ar==='pesada'?'heavy':'n'),b.x,b.y,{w:rad*2.2,h:rad*2.2,rot:V.ang})}
      if(b.y+BR<0){const hgt=-b.y,sz=clamp12(22-hgt/40,9,22),ax=clamp12(b.x,14,W-14);GX.glow(x,ax,8+sz/2,sz*1.6,'#7fe3ff',.6);GX.poly(x,[[ax,4],[ax-sz*.75,4+sz],[ax+sz*.75,4+sz]],'#bff0ff');x.strokeStyle='#08202c';x.lineWidth=1.5;x.stroke()}
      GX.vignette(x,W,H,{a:.3});
      if((C.host?S.wait:S.w)>0&&Date.now()>=C.t0)GX.hud.chip(x,clamp12(b.x,60,W-60),b.y-42,{icon:'alvo',text:'Saque!',al:'center',col:'#ffd36b',size:14,min:9});
      if(S.msg&&now-S.msgT<2200)GX.hud.banner(x,W,H,GX.clean(S.msg),{k:Math.min(1,(2200-(now-S.msgT))/300),acc:'#ffd36b',y:146});
      GX.hud.frame(x,W,H,{acc:TH.acc,a:.55});
    }
  };
}
Object.assign(ACH,{
  vb_copa:{ico:'🏆',n:'Copa do Véu',d:'Vença o Perseus Supremo na Copa do Véu do Volley.'},
  vb_rally:{ico:'🏐',n:'Rali Infinito',d:'Faça um rali de 20 toques no Tulpa Volley.'},
  vb_ace:{ico:'🎯',n:'Ace',d:'Faça um ponto direto do saque no Tulpa Volley.'},
  vb_bloqueio:{ico:'🧱',n:'Paredão',d:'Bloqueie uma bola na rede no Tulpa Volley.'},
  vb_perfeito:{ico:'✨',n:'Pneu',d:'Vença uma partida do Volley sem levar ponto.',secret:true},
});
{const _p=padHtml;padHtml=function(p){const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='vb54')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}${b('Space','⤒','','Pular')}</div><div>${b('KeyS','💥','','Ação: cortada, bloqueio ou mergulho')}${b('KeyE','✨','','Poder Elemental')}</div>`;return _p.apply(this,arguments)}}
defineArcadeGame('volley',{...GAMES12.volley,make:volley54,setup:vbSetup54,pad:'vb54',modes:['ai','mesa'],max:6,
  desc:'Vôlei 2D com 3 toques por lado, sets, cortada, bloqueio, mergulho, Poderes Elementais, 4 arenas e a Copa do Véu. Até 3 × 3 na mesa.',
  rule:'No máximo 3 toques por lado. Sets de 7, 11 ou 15 pontos (11 e 15 com 2 de vantagem).',
  keys:'A/D andam · W/Espaço pulam · S/K ação · E poder'});
console.info('[Tulpa] Etapa 54 carregada (Tulpa Volley 2.0)');

/* ===================================================================
   TULPA · ETAPA 55 — 🕹 ARCADE 2.0 · ONDA 9 (parte 2)
   🦇 VOO ALÉM DO VÉU 2.0
   Jornada de 6 Céus (25 colunas cada), cada um com uma regra nova:
   Crepúsculo, Tempestade (rajadas e trovões), Espelho (anéis invertem a
   gravidade), Abismo (morcegos no vão), Fé (anéis dourados obrigatórios)
   e Véu (escuridão: só a lanterna ilumina). Infinito com fases.
   Óbolos no caminho compram Rastros. Poderes: Escudo, Câmera Lenta,
   Ímã, Mini e Turbo. Mesa: todos voam juntos como fantasmas.
   =================================================================== */
const VOSK55=[{n:'Crepúsculo',ico:'🌆',d:'O céu de sempre, com colunas que se mexem.',c:['#1a0f2a','#4a2a3a']},{n:'Tempestade',ico:'⛈',d:'Rajadas empurram você para cima ou para baixo.',c:['#0e1626','#2a3646']},
  {n:'Espelho',ico:'🪞',d:'Anéis prateados invertem a gravidade.',c:['#141a2a','#3a4a6a']},{n:'Abismo',ico:'🦇',d:'Morcegos de sombra patrulham os vãos.',c:['#08060e','#22142e']},
  {n:'Fé',ico:'✨',d:'Passe por 15 anéis dourados para concluir.',c:['#2a1c06','#5a3a10']},{n:'Véu',ico:'🌫',d:'Escuridão total: só a lanterna ilumina.',c:['#050408','#120c1a']}];
const VOTR55=[{k:'base',n:'Sem rastro',c:0,col:null},{k:'fe',n:'Rastro da Fé',c:40,col:['#ffd36b','#fff1a8']},{k:'nat',n:'Rastro da Natureza',c:80,col:['#7dffa8','#3fae5a']},{k:'ilu',n:'Rastro da Ilusão',c:140,col:['#ff7ac8','#7fe3ff','#ffd36b','#b48cff']},{k:'ine',n:'Rastro do Vazio',c:200,col:['#2a0040','#c58bff']},{k:'ver',n:'Rastro da Verdade',c:300,col:['#ff8fb1','#fff']}];
const VOGOAL55=25;
function voProg55(){const p=prog38().vo||{};return{sky:p.sky||{},bank:p.bank||0,tr:p.tr||{base:1},best:p.best||0,sel:p.sel||'base'}}
const voOpen55=i=>i===0||!!voProg55().sky[i-1];
const voSetup55={
  intro:o=>o._m==='mesa'?'Todos voam o mesmo céu ao mesmo tempo, como fantasmas. Vence quem for mais longe (Óbolos desempatam).':'Pegue Óbolos no caminho para comprar Rastros. Cada Céu vencido abre o próximo.',
  def:()=>({m:'jor',sk:'0',tr:voProg55().sel||'base'}),
  fields:o=>{const p=voProg55(),mesa=o._m==='mesa',F=[{k:'m',l:'Modo',opts:[{v:'jor',n:'Jornada',ico:'🗺',d:`6 Céus de ${VOGOAL55} colunas.`},{v:'inf',n:'Infinito',ico:'♾',d:'Até cair. Fica mais difícil a cada 10.',badge:p.best?`🏆 ${p.best}`:''}]}];
    if(o.m==='jor')F.push({k:'sk',l:'Céu',wide:1,opts:VOSK55.map((s,i)=>{const lock=!mesa&&!voOpen55(i),st=p.sky[i]||0;return{v:String(i),n:`${i+1}. ${s.n}`,ico:s.ico,d:lock?'Vença o Céu anterior.':s.d,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});
    F.push({k:'tr',l:`Rastro (🪙 ${p.bank} Óbolos guardados)`,wide:1,opts:VOTR55.map(t=>{const own=!!p.tr[t.k];return{v:t.k,n:t.n,ico:own?'✓':'🪙',d:own?'Seu.':`Custa ${t.c} Óbolos do Voo.`,badge:own?'':String(t.c)}})});return F},
  fix:o=>{if(!['jor','inf'].includes(o.m))o.m='jor';let i=Math.max(0,Math.min(5,+o.sk||0));if(o._m!=='mesa')while(i>0&&!voOpen55(i))i--;o.sk=String(i);
    const p=voProg55(),t=VOTR55.find(q=>q.k===o.tr)||VOTR55[0];if(!p.tr[t.k]){if(p.bank>=t.c&&o._m!=='mesa'){progPut38(q=>{q.vo=q.vo||{};q.vo.tr=q.vo.tr||{base:1};q.vo.bank=(q.vo.bank||0)-t.c;q.vo.tr[t.k]=1;q.vo.sel=t.k});fx5('mgWin');o.tr=t.k}else o.tr=p.sel||'base'}else progPut38(q=>{q.vo=q.vo||{};q.vo.sel=t.k})},
  sum:()=>'Espaço, ↑ ou clique: bater as asas. 🛡 Escudo · ⏳ Câmera lenta · 🧲 Ímã · 🔹 Mini · 🚀 Turbo (atravessa 3 colunas).'
};

/* ---------- arte do Voo Além do Véu (somente visual) ----------
   Cada Céu tem fundo em paralaxe, colunas, chão e clima próprios. */
function voArt55(sk){
  const G=window.GFX60,W=480,H=640,FLOOR=H-40,PW=66,TAU=Math.PI*2,P=G.paint;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const lg=(g,x0,y0,x1,y1,...s)=>{const q=g.createLinearGradient(x0,y0,x1,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const rg=(g,X,Y,r0,r1,...s)=>{const q=g.createRadialGradient(X,Y,r0,X,Y,r1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const TH=[
    {acc:'#ffb070',tile:'tijolo',a:'#7a3c48',b:'#240c18',cap:'#ffc080',floor:'tijolo',fa:'#5a2a34',amb:'poeira',ac:'#ffd0a0'},
    {acc:'#9ad0ff',tile:'metal',a:'#44587a',b:'#101826',cap:'#9ad0ff',floor:'pedra',fa:'#34465e',amb:'chuva',ac:'#b8d8ff'},
    {acc:'#e4f0ff',tile:'cristal',a:'#3a5488',b:'#cfe4ff',cap:'#e4f0ff',floor:'cristal',fa:'#4a649a',amb:'neve',ac:'#eef6ff'},
    {acc:'#c58bff',tile:'pedra',a:'#46305e',b:'#10081c',cap:'#b080f0',floor:'pedra',fa:'#2c1c40',amb:'motes',ac:'#c58bff'},
    {acc:'#ffd36b',tile:'areia',a:'#b8924e',b:'#5a3c12',cap:'#ffd36b',floor:'areia',fa:'#a87c34',amb:'brasas',ac:'#ffe9a0'},
    {acc:'#b48cff',tile:'runa',a:'#2a1c42',b:'#a88ae8',cap:'#b48cff',floor:'runa',fa:'#1c1230',amb:'motes',ac:'#8a7ac0'},
  ][sk]||{acc:'#b48cff',tile:'runa',a:'#35225c',b:'#b9a6ff',cap:'#b48cff',floor:'cristal',fa:'#2c1c50',amb:'motes',ac:'#b9a6ff'};

  /* ===== fundos ===== */
  const sun=(X,Y,R,c1,c2)=>(g)=>{g.fillStyle=rg(g,X,Y,R*.4,R*4,G.rgba(c1,.7),G.rgba(c2,0));g.fillRect(X-R*4,Y-R*4,R*8,R*8);disc(g,X,Y,R,lg(g,0,Y-R,0,Y+R,c1,c2))};
  const both=(...f)=>(g,w,h,r)=>f.forEach(p=>p(g,w,h,r));
  const stal=(col,edge)=>(g,w,h,r)=>{for(let i=0;i<13;i++){const X=(i+r()*.6)*w/13,L=40+r()*130,ww=14+r()*22;[X,X-w,X+w].forEach(u=>{G.poly(g,[[u-ww,0],[u-ww*.3,L*.6],[u,L],[u+ww*.35,L*.5],[u+ww,0]],col);line(g,[[u-ww,0],[u-ww*.3,L*.6],[u,L]],edge,1)})}};
  const city=(col,win)=>(g,w,h,r)=>{let X=0;while(X<w-10){const bw=Math.min(w-X,18+r()*34),bh=40+r()*130,Y=h*.86-bh;box(g,X,Y,bw,h-Y,col);if(r()<.35)G.poly(g,[[X,Y],[X+bw/2,Y-22-r()*20],[X+bw,Y]],col);for(let y=Y+10;y<h*.84;y+=14)for(let u=X+5;u<X+bw-5;u+=9)if(r()<.16)box(g,u,y,3,5,win);X+=bw+r()*6}box(g,0,h*.86,w,h*.14,col)};
  const layers={
    0:[{paint:P.sky(['#1c1044','#5a2460','#c8566a','#ffb468'])},{paint:sun(340,430,46,'#fff0b8','#ff7a5a'),speed:0},{paint:P.clouds({col:'#ffc8a0',n:9,a:.2,top:.12,bottom:.66}),speed:.05,drift:6},{paint:P.ridge({col:'#6a2a58',base:.74,amp:.1}),speed:.12},{paint:city('#35163c','#ffd890'),speed:.28}],
    1:[{paint:P.sky(['#04070f','#142234','#324a60'])},{paint:P.clouds({col:'#8aa8c4',n:12,a:.17,top:.02,bottom:.42}),speed:.05,drift:16},{paint:P.ridge({col:'#1a2c40',base:.76,amp:.12}),speed:.12},{paint:P.clouds({col:'#02040a',n:10,a:.4,top:.06,bottom:.3}),speed:.2,drift:30},{paint:P.spires({col:'#0b1420',n:9,min:.12,max:.3,base:.94,edge:'rgba(150,200,255,.2)'}),speed:.32}],
    2:[{paint:P.sky(['#0c1428','#34487c','#9ab8e4','#34487c'])},{paint:P.stars({n:80,col:'#ffffff',bottom:.95}),speed:.02},{paint:both((g,w,h,r)=>{g.save();g.translate(0,h);g.scale(1,-1);P.ridge({col:'#4a649c',base:.82,amp:.1,edge:'rgba(230,245,255,.55)'})(g,w,h,G.rng(44));g.restore()},(g,w,h)=>P.ridge({col:'#4a649c',base:.82,amp:.1,edge:'rgba(230,245,255,.55)'})(g,w,h,G.rng(44))),speed:.12},{paint:P.pillars({col:'#2a3a66',n:7,min:.14,max:.36,base:.95,edge:'rgba(230,245,255,.4)'}),speed:.28},{paint:(g,w,h)=>{g.fillStyle='rgba(230,245,255,.16)';g.fillRect(0,h*.5-1,w,2);g.fillStyle=lg(g,0,h*.46,0,h*.54,'rgba(255,255,255,0)','rgba(255,255,255,.1)','rgba(255,255,255,0)');g.fillRect(0,h*.46,w,h*.08)},speed:0}],
    3:[{paint:P.sky(['#050309','#140a22','#2c1038','#10061a'])},{paint:P.nebula({cols:['#6a2a9a','#2a1a6a'],n:8,a:.2,top:.2,bottom:.9}),speed:.05},{paint:stal('#1c0e2c','rgba(197,139,255,.22)'),speed:.14},{paint:P.spires({col:'#22103a',n:14,min:.16,max:.42,base:.96,edge:'rgba(197,139,255,.25)'}),speed:.22},{paint:stal('#0b0512','rgba(197,139,255,.14)'),speed:.34,y:-18}],
    4:[{paint:P.sky(['#2a1404','#7a4410','#d89a38','#ffe4a0'])},{paint:(g)=>{g.save();g.translate(240,520);for(let i=0;i<13;i++){const a=-Math.PI+i*Math.PI/12;G.poly(g,[[0,0],[Math.cos(a-.05)*620,Math.sin(a-.05)*620],[Math.cos(a+.05)*620,Math.sin(a+.05)*620]],'rgba(255,240,190,.11)')}g.restore();sun(240,520,60,'#fffbe0','#ffc04a')(g)},speed:0},{paint:P.clouds({col:'#fff0c8',n:10,a:.24,top:.1,bottom:.8}),speed:.06,drift:5},{paint:P.pillars({col:'#a86c28',n:8,min:.2,max:.42,base:.93,edge:'rgba(255,240,190,.5)'}),speed:.16},{paint:P.clouds({col:'#ffe8b0',n:12,a:.3,top:.76,bottom:.98}),speed:.34}],
    5:[{paint:P.sky(['#020104','#0c0814','#181022'])},{paint:P.stars({n:30,col:'#b8a8e0',bottom:.4}),speed:.02},{paint:P.fog({col:'#6a5a8a',a:.2,from:.35}),speed:.08,drift:8},{paint:P.trees({col:'#0c0814',n:12,min:.2,max:.42,base:.95}),speed:.2},{paint:P.fog({col:'#8a7aa8',a:.18,from:.65}),speed:.4,drift:14}],
  }[sk]||[{paint:P.sky(['#06041a','#1c1048','#4a2270','#1a0c30'])},{paint:P.stars({n:130,col:'#e8dcff',bottom:.96}),speed:.03},{paint:P.nebula({cols:['#7a3ac8','#2a5ab8','#c84a9a'],n:10,a:.24,bottom:.9}),speed:.07,drift:3},{paint:P.spires({col:'#24144a',n:12,min:.12,max:.34,base:.96,edge:'rgba(180,140,255,.24)'}),speed:.2},{paint:P.spires({col:'#0e0822',n:8,min:.08,max:.2,base:.98}),speed:.38}];
  const bg=G.parallax('vo:'+sk,W,H,layers);
  const amb=G.ambient(TH.amb,{W,H:FLOOR,n:sk===1?46:26,col:TH.ac,seed:23+sk});

  /* ===== colunas: textura comprida; a ponta encosta no vão ===== */
  const column=mv=>G.bake(`vo:col:${sk}:${mv?1:0}`,PW,640,(g,w,h,r)=>{
    G.fillTile(g,G.tile(TH.tile,{size:sk===2?PW:44,a:TH.a,b:TH.b,seed:8+sk}),0,0,w,h);
    g.fillStyle=lg(g,0,0,w,0,'rgba(0,0,0,.66)','rgba(0,0,0,.06)','rgba(255,255,255,.14)','rgba(0,0,0,.12)','rgba(0,0,0,.68)');g.fillRect(0,0,w,h);
    for(let y=40;y<h;y+=96){box(g,0,y,w,9,'rgba(0,0,0,.5)');box(g,0,y+1.5,w,4,lg(g,0,0,w,0,G.shade(TH.cap,-.65),G.shade(TH.cap,-.1),G.shade(TH.cap,-.65)))}
    for(let y=88;y<h;y+=96){const X=w/2;
      if(sk===0){box(g,X-8,y-15,16,26,'#1a0610',8);box(g,X-5,y-11,10,19,r()<.6?'#ffd080':'#4a2030',5);line(g,[[X,y-11],[X,y+8]],'#1a0610',1.4)}
      else if(sk===1){line(g,[[X+6,y-18],[X-5,y-2],[X+2,y-2],[X-7,y+16]],'#cfe8ff',2.4);[10,w-10].forEach(u=>{disc(g,u,y,3,'#0c1420');disc(g,u-.6,y-.6,1.7,'#b8d0e8')})}
      else if(sk===2){G.poly(g,[[X,y-22],[X+11,y],[X,y+22],[X-11,y]],'rgba(235,248,255,.34)');line(g,[[X-6,y+8],[X+5,y-12]],'#ffffff',1.6)}
      else if(sk===3){ell(g,X-8,y,4,2.6,'#ff5a6a');ell(g,X+8,y,4,2.6,'#ff5a6a');disc(g,X-8,y,1.1,'#fff');disc(g,X+8,y,1.1,'#fff');line(g,[[X-14,y+10],[X-6,y+24],[X-12,y+38]],'rgba(197,139,255,.45)',1.6)}
      else if(sk===4){ring(g,X,y,9,'#fff4c0',2);disc(g,X,y,3,'#fff4c0');for(let i=0;i<8;i++){const a=i*TAU/8;line(g,[[X+Math.cos(a)*12,y+Math.sin(a)*12],[X+Math.cos(a)*17,y+Math.sin(a)*17]],'#fff0b0',1.6)}}
      else{ring(g,X,y,10,G.rgba(TH.cap,.8),1.6);line(g,[[X,y-14],[X-7,y],[X,y+14],[X+7,y],[X,y-14]],G.rgba(TH.cap,.8),1.4);disc(g,X,y,2.4,'#fff')}}
    if(sk===4)[12,22,w-22,w-12].forEach(u=>{g.fillStyle='rgba(90,56,10,.35)';g.fillRect(u,0,2,h);g.fillStyle='rgba(255,246,200,.35)';g.fillRect(u+2,0,1.2,h)});
    if(mv){for(let y=18;y<h;y+=48){line(g,[[7,y],[15,y-7],[23,y]],'#ff9ad5',2.4);line(g,[[w-23,y],[w-15,y+7],[w-7,y]],'#ff9ad5',2.4)}}
    const edge=mv?'#ff9ad5':TH.cap;box(g,0,0,2.4,h,G.rgba(edge,.95));box(g,w-2.4,0,2.4,h,G.rgba(edge,.7));
  },{s:1.5});
  const cap=mv=>G.bake(`vo:cap:${sk}:${mv?1:0}`,PW+16,16,g=>{const c=mv?'#ff9ad5':TH.cap;box(g,3,2,PW+10,12,'#0a0510',3);
    box(g,4,3,PW+8,10,lg(g,0,3,0,13,G.shade(c,.55),c,G.shade(c,-.45)),2);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(7,4,PW+2,1.3);
    for(let X=13;X<PW+8;X+=13)box(g,X,7,5,3,G.shade(c,-.55),1);const m=(PW+16)/2;G.poly(g,[[m,2.5],[m+7,8],[m,13.5],[m-7,8]],'#fff8ff');G.poly(g,[[m,5],[m+4,8],[m,11],[m-4,8]],G.shade(c,-.25))},{s:3});
  const floorImg=()=>G.bake('vo:floor:'+sk,W,H-FLOOR,(g,w,h)=>{G.fillTile(g,G.tile(TH.floor,{size:40,a:TH.fa,seed:2}),0,0,w,h);g.fillStyle=lg(g,0,0,0,h,'rgba(0,0,0,.1)','rgba(0,0,0,.75)');g.fillRect(0,0,w,h);
    box(g,0,0,w,4,TH.cap);box(g,0,4,w,3,'rgba(0,0,0,.5)');for(let X=0;X<w;X+=40)G.poly(g,[[X+12,4],[X+20,13],[X+28,4]],G.shade(TH.cap,-.3))},{s:2});

  /* ===== criaturas e itens ===== */
  const bats=G.sheet('vo:bat',6,48,34,(g,i)=>{const f=Math.sin(i/6*TAU),c=24,y=18;[-1,1].forEach(s=>{const tip=[c+s*22,y-4-f*11];G.poly(g,[[c+s*5,y-5],[c+s*13,y-9-f*7],tip,[c+s*18,y+2-f*5],[c+s*13,y-f*2],[c+s*10,y+6-f*2],[c+s*5,y+4]],'#241036');line(g,[[c+s*5,y-5],[c+s*13,y-9-f*7],tip],'#b080f0',1.4)});
    ell(g,c,y+1,7.4,9,'#1a0a28');G.poly(g,[[c-6,y-4],[c-6,y-13],[c-1,y-7]],'#1a0a28');G.poly(g,[[c+6,y-4],[c+6,y-13],[c+1,y-7]],'#1a0a28');ring(g,c,y+1,8,'rgba(197,139,255,.75)',1);
    ell(g,c-3,y-1,2.1,1.6,'#ff4a5a');ell(g,c+3,y-1,2.1,1.6,'#ff4a5a');G.poly(g,[[c-3,y+4],[c-1,y+8],[c,y+4]],'#fff');G.poly(g,[[c+3,y+4],[c+1,y+8],[c,y+4]],'#fff')},{s:3});
  const wings=G.sheet('vo:wing',6,96,64,(g,i)=>{const f=Math.sin(i/6*TAU),c=48,y=34;[-1,1].forEach(s=>{const p=[[c+s*10,y-4],[c+s*28,y-16-f*14],[c+s*46,y-8-f*22],[c+s*39,y+1-f*13],[c+s*31,y-2-f*7],[c+s*26,y+10-f*6],[c+s*18,y+5],[c+s*10,y+10]];
    G.poly(g,p,'#4a2a78');line(g,[...p,p[0]],'#14082a',2.4);line(g,[p[0],p[1],p[2]],'#e0c8ff',2.2);line(g,[p[1],p[4]],'rgba(224,200,255,.55)',1.2);line(g,[p[1],p[5]],'rgba(224,200,255,.45)',1.2)})},{s:3});
  const PWC={sh:'#8fe8ff',sl:'#c39bff',mag:'#ff8f8f',mini:'#7dffa8',tur:'#ffb05a',lan:'#ffe08a'};
  const power=k=>G.bake('vo:pw:'+k,36,36,g=>{const c=18,col=PWC[k]||'#8fe8ff';disc(g,c,c,15.5,rg(g,c-5,c-6,1,19,'#ffffff',col,G.shade(col,-.6)));disc(g,c,c,11.4,'rgba(10,6,22,.8)');ring(g,c,c,15,'#ffffff',1.3);
    if(k==='mag'){g.strokeStyle=col;g.lineWidth=5;g.lineCap='butt';g.beginPath();g.moveTo(12,11);g.lineTo(12,18);g.arc(18,18,6,Math.PI,0,true);g.lineTo(24,11);g.stroke();box(g,9.5,10,5,3.6,'#fff');box(g,21.5,10,5,3.6,'#fff')}
    else if(k==='mini'){[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([i,j])=>line(g,[[c+i*8,c+j*8],[c+i*3,c+j*3]],col,2));disc(g,c,c,2.6,'#fff')}
    else G.icon(g,{sh:'escudo',sl:'relogio',tur:'raio',lan:'chama'}[k]||'estrela',c,c,17,col)},{s:3});
  const flag=()=>G.bake('vo:flag',34,26,g=>{box(g,1,1,3,25,'#fff4d0',1);for(let i=0;i<5;i++)for(let j=0;j<4;j++)box(g,4+i*5.6,2+j*4.4,5.6,4.4,(i+j)%2?'#14080a':'#ffffff');g.strokeStyle='#ffd36b';g.lineWidth=1.4;g.strokeRect(4,2,28,17.6)},{s:3});
  return{TH,PWC,bg,amb,column,cap,floorImg,bats,wings,power,flag};
}
function voo55(C){
  const W=480,H=640,BX=130,PW=66,G=1450,FL=-470,FLOOR=H-40,o=C.room.opt||{},jor=o.m!=='inf',sk=jor?Math.max(0,Math.min(5,+o.sk||0)):-1,SK=jor?VOSK55[sk]:null;
  const GAP=gdPick(C.gd,[205,176,160,146])+(sk===4?-6:0),DX=gdPick(C.gd,[252,232,222,210]),AMP=gdPick(C.gd,[30,40,52,74])*(sk===0||sk===3?1:sk<0?0:.5),SP0=gdPick(C.gd,[140,165,188,212]),SPMAX=gdPick(C.gd,[70,95,110,125]);
  const trail=VOTR55.find(t=>t.k===o.tr)||VOTR55[0];
  const S={y:H*.42,vy:0,d:0,t:0,score:0,coins:0,coinTot:0,sh:0,inv:0,slow:0,mag:0,mini:0,turbo:0,pw:new Set(),got:new Set(),ph:0,gdir:1,rings:0,light:220,used:false,saves:0,won:false,parts:[],flashT:0,thunder:3},R=ghostRace(C,S);
  const hr=(i,k)=>hrand(C.seed+sk*977,i,k);
  const gapOf=i=>jor?Math.max(GAP-30,GAP-Math.floor(i/8)*5):Math.max(GAP-48,GAP-Math.floor(i/10)*8);
  const PWK=['sh','sl','mag','mini','tur'];
  const pwOf=i=>i>2&&hr(i,5)<.14?PWK[Math.floor(hr(i,6)*5)]:sk===5&&i%5===2?'lan':null;
  const BASE=[];const baseOf=i=>{if(i<0)return FLOOR/2;if(BASE[i]!=null)return BASE[i];const prev=i>0?baseOf(i-1):FLOOR/2;const v=clamp12(prev+(hr(i,1)-.5)*2*(jor?170:185),130,FLOOR-130);BASE[i]=v;return v};
  const pipe=i=>{const base=baseOf(i),bat=sk===3&&i>1&&hr(i,7)<.4,mv=!bat&&AMP&&hr(i,2)<.45,g=gapOf(i),ts=Math.max(0,(Date.now()-C.t0)/1000),gy=mv?clamp12(base+Math.sin(ts*(1.3+hr(i,3))+i)*AMP,g/2+24,FLOOR-g/2-24):clamp12(base,g/2+24,FLOOR-g/2-24);
    return{x:380+i*DX,gy,mv,g,pw:pwOf(i),i,bat,gust:sk===1&&i%3===1?(hr(i,8)<.5?-1:1):0,mirror:sk===2&&i%4===3,ring:sk===4&&i>0,coin:hr(i,9)<.6}};
  const batY=(p,q)=>clamp12((p.gy+q.gy)/2+Math.sin(S.t*1.1+p.i)*150,40,FLOOR-40);
  const speed=()=>(SP0+Math.min(SPMAX,S.t*2.4))*(S.turbo>0?1.6:1);
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
  /* visual (GFX60): o motor é GX; G aqui é a gravidade */
  const GX=window.GFX60,art=voArt55(sk),T=(x,s,X,Y,o)=>GX.hud.text(x,s,X,Y,{al:'center',...o});
  GX.skin({acc:art.TH.acc});
  function hoop(x,X,Y,rx,ry,c,dk,t){GX.glow(x,X,Y,ry*1.3,c,.38);x.beginPath();x.ellipse(X,Y,rx,ry,0,0,TAU16);x.lineWidth=7;x.strokeStyle=dk;x.stroke();x.lineWidth=4;x.strokeStyle=c;x.stroke();
    x.beginPath();x.ellipse(X-.6,Y,rx*.86,ry*.95,0,2.2,4.1);x.lineWidth=1.4;x.strokeStyle='#ffffff';x.stroke();for(let i=0;i<3;i++){const a=t*3+i*TAU16/3;GX.glow(x,X+Math.cos(a)*rx,Y+Math.sin(a)*ry,6,'#ffffff',.8)}}
  /* efeitos lidos do estado já calculado */
  const V={on:false,score:0,coins:0,rings:0,saves:0,dead:false,pw:0,gdir:1};
  function watch(){
    if(V.on){if(S.coins>V.coins)GX.emit('coleta',BX+8,S.y,{col:'#ffd36b',amount:.6,size:.8});
      if(S.rings>V.rings)GX.emit('brilho',BX+10,S.y,{col:'#ffd36b'});
      if(S.score>V.score)GX.emit('brilho',BX,S.y,{col:art.TH.acc,amount:.35,size:.8});
      if(S.pw.size>V.pw)GX.emit('coleta',BX,S.y,{col:'#8fe8ff',amount:1.2});
      if(S.saves>V.saves)GX.impact(BX,S.y,{col:'#8fe8ff',force:1});
      if(S.gdir!==V.gdir)GX.hitstop(55);
      if(S.dead&&!V.dead){if(S.won)GX.emit('confete',W/2,H*.35);else{GX.impact(BX,S.y,{col:'#c58bff',force:1.7});GX.emit('estilhacos',BX,S.y,{col:['#b48cff','#ffffff']})}}}
    V.score=S.score;V.coins=S.coins;V.rings=S.rings;V.saves=S.saves;V.dead=S.dead;V.pw=S.pw.size;V.gdir=S.gdir;V.on=true}
  const flap=()=>{if(S.dead||Date.now()<C.t0)return;S.vy=FL*S.gdir;fx5('mgJump')};
  const score=()=>S.score*10+S.coins;
  function finish(win){if(S.dead)return;S.won=win;
    let st=0,first=false,rec=false;const goldOk=sk!==4||S.rings>=15;
    if(win){st=1+(S.coins>=S.coinTot*.8?1:0)+(!S.used&&!S.saves?1:0)}
    progPut38(q=>{q.vo=q.vo||{};q.vo.sky=q.vo.sky||{};q.vo.bank=(q.vo.bank||0)+S.coins;if(jor&&win){first=!q.vo.sky[sk];if(st>(q.vo.sky[sk]||0))q.vo.sky[sk]=st;if(VOSK55.every((_,i)=>q.vo.sky[i]))C.achieve?.('voo_jornada');if(VOSK55.every((_,i)=>q.vo.sky[i]===3))C.achieve?.('voo_estrelas')}if(!jor&&S.score>(q.vo.best||0)){q.vo.best=S.score;rec=true}if(Object.keys(q.vo.tr||{}).length>=4)C.achieve?.('voo_rastro')});
    if(!jor&&S.score>=100)C.achieve?.('voo_100');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((S.score/3+S.coins/4)*mul)+(win?10+sk*2:0)+(first?15:0)+(rec?5:0)),why:[jor?SK.n:'Infinito',win?'★'.repeat(st):'',first?'céu novo':'',rec?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);S.st=st;
    S.html=`<ul class="r38-l"><li>🏛 Colunas: <b>${S.score}</b>${jor?`/${VOGOAL55}`:''}</li><li>🪙 Óbolos do Voo: <b>${S.coins}</b> de ${S.coinTot} (guardados para os Rastros)</li>${sk===4?`<li>✨ Anéis dourados: <b>${S.rings}</b>/15</li>`:''}<li>🛡 Salvamentos: <b>${S.saves}</b></li></ul>${jor&&win&&first&&sk<5?`<p class="r38-hi">Céu ${sk+2}: ${esc(VOSK55[sk+1].n)} foi aberto.</p>`:''}`;
    if(C.net){R.die(score()+(win?500:0));return}
    S.dead=true;fx5(win?'mgWin':'fumble');
    C.finish({title:win?`🦇 ${SK.n} vencido! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:jor?`🦇 Você caiu no ${SK.n} · ${S.score}/${VOGOAL55} colunas${sk===4&&S.score>=VOGOAL55&&!goldOk?' (faltaram anéis)':''}`:`🦇 Você caiu com ${S.score} colunas`,rows:[{u:C.me,n:me.n,c:me.c,s:score(),w:win}],unit:'pts',html:S.html})}
  return{g60intro:{title:jor?SK.n:'Voo Infinito',sub:jor?SK.d:'Voe até cair',acc:art.TH.acc},st:()=>S,pipe,flap,finish,speedNow:()=>speed()*(S.slow>0?.6:1),
    reward:()=>S.rw||null,
    next(){if(C.net)return null;if(jor){if(S.won&&sk<5)return{opt:{sk:String(sk+1)},label:`Céu ${sk+2}: ${VOSK55[sk+1].n}`};return{opt:{},label:'Tentar de novo'}}return{opt:{},label:'Voar de novo'}},
    key(code,down){if(down&&(code==='Space'||code==='ArrowUp'||code==='KeyW'))flap()},
    ptr(t){if(t==='down')flap()},
    step(dt){
      const now=Date.now();if(now<C.t0){S.y=H*.42+Math.sin(now/220)*8;return}
      S.t+=dt;const sp=speed();['slow','inv','mag','mini','turbo','flashT'].forEach(k=>S[k]=Math.max(0,S[k]-dt));
      for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=sp*dt}
      if(S.dead){const lead=Object.values(S.gh).filter(g=>!g.dead&&g.d!=null).sort((a,b)=>b.d-a.d)[0];S.cam=lead?lead.d:S.cam;return}
      const k=S.slow>0?.6:1,BR=S.mini>0?10:16;
      if(sk===1){S.thunder-=dt;if(S.thunder<=0){S.thunder=4+hr(Math.floor(S.t),11)*4;S.flashT=.25;fx5('bb6')}}
      if(sk===5)S.light=Math.max(80,S.light-dt*14);
      S.vy+=G*S.gdir*k*dt;S.y+=S.vy*k*dt;S.d+=sp*k*dt;S.cam=S.d;
      let hit=S.y>FLOOR-BR||S.y<BR;
      const i0=Math.max(0,Math.floor((S.d+BX-380-PW-DX)/DX));
      for(let i=i0;i<i0+3;i++){const p=pipe(i),px=p.x-S.d;
        if(BX+BR>px&&BX-BR<px+PW&&(S.y-BR<p.gy-p.g/2||S.y+BR>p.gy+p.g/2))hit=true;
        
        /* entre a coluna i e a i+1 */
        const mx=px+PW+(DX-PW)/2,q=pipe(i+1),my=(p.gy+q.gy)/2;
        if(p.gust&&BX>px+PW&&BX<px+DX){S.vy+=p.gust*900*dt}
        if(p.bat){const by=batY(p,q),bx=mx;if(Math.hypot(BX-bx,S.y-by)<BR+10)hit=true}
        if(p.mirror&&!S.got.has('m'+i)&&Math.abs(BX-mx)<20&&Math.abs(S.y-my)<70){S.got.add('m'+i);S.gdir*=-1;S.vy*=-.3;fx5('activate');C.fx?.flash('#cfe0ff',.25);C.fx?.float(BX+40,S.y-30,S.gdir>0?'gravidade normal':'gravidade invertida',{col:'#cfe0ff',size:18})}
        if(p.ring&&!S.got.has('r'+i)&&Math.abs(BX-mx)<18&&Math.abs(S.y-my)<34){S.got.add('r'+i);S.rings++;fx5('mgCoin');C.fx?.float(BX+30,S.y-24,`Anel ${S.rings}/15`,{col:'#ffd36b',size:16})}
        if(p.coin){for(let c=0;c<3;c++){const cid=`c${i}_${c}`;if(S.got.has(cid))continue;const cx=px+PW+20+c*((DX-PW-40)/2),cy=p.gy+(q.gy-p.gy)*((c+1)/4);let dx=BX-cx,dy=S.y-cy;
          if(S.mag>0&&Math.hypot(dx,dy)<160){dx*=.5;dy*=.5}if(Math.hypot(dx,dy)<BR+10){S.got.add(cid);S.coins++;fx5('mgCoin')}}}
        if(p.pw&&!S.pw.has(i)&&Math.hypot(BX-(px+PW/2),S.y-p.gy)<BR+16){S.pw.add(i);fx5('activate');C.fx?.burst(BX,S.y,{n:16,kind:'star',col:['#8fe8ff','#fff'],sp:170,life:.6,size:3});if(p.pw!=='lan')S.used=true;
          const lb={sh:'Escudo',sl:'Câmera lenta',mag:'Ímã',mini:'Mini',tur:'Turbo',lan:'Lanterna'}[p.pw];C.fx?.float(BX+40,S.y-30,lb,{col:'#8fe8ff',size:18});
          if(p.pw==='sh')S.sh=1;else if(p.pw==='sl')S.slow=4;else if(p.pw==='mag')S.mag=8;else if(p.pw==='mini')S.mini=8;else if(p.pw==='tur'){S.turbo=2.2;S.inv=Math.max(S.inv,2.4)}else S.light=240}}
      S.coinTot=Math.max(S.coinTot,(()=>{let n=0;const last=Math.floor((S.d+BX-380)/DX);for(let i=0;i<=Math.min(last,jor?VOGOAL55-1:last);i++)if(pipe(i).coin)n+=3;return n})());
      if(hit&&(S.inv>0||S.sh>0)){if(S.inv<=0){S.sh=0;S.inv=1.2;S.saves++;fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(BX,S.y-40,'Salvo!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.2)}S.y=clamp12(S.y,BR+2,FLOOR-BR-2);if(S.vy*S.gdir>0)S.vy=-260*S.gdir;hit=false}
      const sc=Math.max(0,Math.floor((S.d+BX-380-PW)/DX)+1);if(sc>S.score){S.score=sc;fx5('mgCoin');C.fx?.float(BX+30,S.y-28,'+1',{col:'#ffd36b',size:16,life:.6});
        const ph=Math.floor(sc/10);if(!jor&&ph>S.ph){S.ph=ph;fx5('mgWin');C.fx?.flash('#b48cff',.25);C.fx?.float(W/2,H*.3,`FASE ${ph+1}`,{col:'#ffd36b',size:42,life:1.4})}}
      if(trail.col){S.parts.push({x:BX-14,y:S.y+(Math.random()-.5)*8,d:S.d,t:0,c:trail.col[Math.floor(Math.random()*trail.col.length)]})}
      S.parts.forEach(q=>q.t+=dt);S.parts=S.parts.filter(q=>q.t<.6);
      R.send({d:Math.round(S.d),y:Math.round(S.y),s:S.score});
      if(jor&&S.score>=VOGOAL55){if(sk===4&&S.rings<15){/* sem anéis suficientes: continua até completar */if(S.score>=VOGOAL55+15){finish(false);return}}else{finish(true);return}}
      if(hit){C.fx?.shake(10,.4);C.fx?.burst(BX,S.y,{n:22,col:['#b48cff','#fff','#6b4f9e'],sp:240,life:.8,size:3,grav:600});if(Math.random()<.5)C.say(sayFmt(SAY12.fall),false);finish(false);return}
      C.hud(GX.chips([jor?{icon:'bandeira',label:SK.n,value:`${S.score}/${VOGOAL55}`}:{icon:'bandeira',label:`fase ${S.ph+1}`,value:`${S.score} colunas`},{icon:'moeda',value:S.coins},sk===4?{icon:'estrela',label:'anéis',value:`${S.rings}/15`,tone:S.rings>=15?'ok':null}:null,S.sh?{icon:'escudo',value:'Escudo',tone:'ok'}:null,S.slow>0?{icon:'relogio',value:'Lento'}:null,S.mag>0?{icon:'alvo',value:'Ímã'}:null,S.mini>0?{icon:'gota',value:'Mini'}:null,S.turbo>0?{icon:'raio',value:'Turbo',tone:'warn'}:null,C.net?{icon:'olho',label:'voando',value:Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)}:null]))},
    msg:R.msg,left:R.left,
    draw(x){
      const cam=S.cam??S.d,now=performance.now(),still=GX.reduced(),t=still?0:now/1000,TH=art.TH;watch();
      art.bg.draw(x,cam,0,t);
      if(sk===4)GX.rays(x,W/2,-30,{n:7,len:560,col:'#fff0b0',a:.08,t:t*2,from:.35,spread:2.4});
      if(sk===1&&S.flashT>0){let X=60+hr(Math.floor(S.t),12)*360,Y=0;const pts=[[X,Y]];for(let i=1;i<9;i++){X+=(hr(Math.floor(S.t)*13+i,13)-.5)*70;Y+=30+hr(i,14)*26;pts.push([X,Y])}
        x.lineJoin='round';[[9,'rgba(150,200,255,.28)'],[2.6,'#f4fbff']].forEach(([lw,c])=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()});GX.glow(x,pts[0][0],40,150,'#9ad0ff',.5)}
      art.amb.draw(x,t,cam);
      const BR=S.mini>0?10:16,i0=Math.max(0,Math.floor((cam-380-PW-DX)/DX));
      for(let i=i0;i<i0+5;i++){const p=pipe(i),px=p.x-cam;if(px>W+DX)break;const q=pipe(i+1);
        if(p.gust){const up=p.gust<0,c=up?'#78c8ff':'#ffa078';x.fillStyle=up?'rgba(120,200,255,.1)':'rgba(255,160,120,.1)';x.fillRect(px+PW,0,DX-PW,FLOOR);x.strokeStyle=GX.rgba(c,.6);x.lineWidth=2.4;x.lineCap='round';
          for(let k=0;k<6;k++){const yy=(((still?0:now/4*p.gust)+k*110)%FLOOR+FLOOR)%FLOOR,u=px+PW+20+k*24;x.beginPath();x.moveTo(u,yy-30*p.gust);x.lineTo(u,yy);x.moveTo(u-5,yy-7*p.gust);x.lineTo(u,yy);x.lineTo(u+5,yy-7*p.gust);x.stroke()}}
        const img=art.column(p.mv),cp=art.cap(p.mv),s=img.gs,th=p.gy-p.g/2,bY=p.gy+p.g/2,bh=FLOOR-bY;
        if(th>0)x.drawImage(img,0,(640-th)*s,img.width,th*s,px,0,PW,th);
        if(bh>0)x.drawImage(img,0,0,img.width,bh*s,px,bY,PW,bh);
        GX.draw(x,cp,px+PW/2,th-5,{w:PW+16,h:16});GX.draw(x,cp,px+PW/2,bY+5,{w:PW+16,h:16});
        if(p.mv){GX.glow(x,px+PW/2,th-4,52,'#ff9ad5',.3,{sy:.35});GX.glow(x,px+PW/2,bY+4,52,'#ff9ad5',.3,{sy:.35})}
        if(p.bat){const by=batY(p,q),bx=px+PW+(DX-PW)/2;GX.glow(x,bx,by,30,'#c58bff',.5);GX.draw(x,GX.anim(art.bats,t+i*.13,14),bx,by-1,{w:44,h:31})}
        const mx=px+PW+(DX-PW)/2,my=(p.gy+q.gy)/2;
        if(p.mirror&&!S.got.has('m'+i))hoop(x,mx,my,12,60,'#e4f0ff','#5a7ab0',t);
        if(p.ring&&!S.got.has('r'+i))hoop(x,mx,my,10,30,'#ffd36b','#8a5a08',t);
        if(p.coin)for(let c=0;c<3;c++){if(S.got.has(`c${i}_${c}`))continue;const cx=px+PW+20+c*((DX-PW-40)/2),cy=p.gy+(q.gy-p.gy)*((c+1)/4),k=still?1:Math.max(.2,Math.abs(Math.cos(t*3.4+i+c*.7)));GX.glow(x,cx,cy,15,'#ffd36b',.4);GX.draw(x,GX.prop.coin(7),cx,cy,{sx:k})}
        if(p.pw&&!S.pw.has(i)){const by=p.gy+(still?0:Math.sin(S.t*4+i)*6),c=art.PWC[p.pw];GX.glow(x,px+PW/2,by,34,c,.6);GX.draw(x,art.power(p.pw),px+PW/2,by,{w:34,h:34})}
        if(jor&&i===VOGOAL55-1){x.fillStyle='rgba(255,211,107,.32)';x.fillRect(px+PW+4,0,6,FLOOR);GX.glow(x,px+PW+7,FLOOR/2,300,'#ffd36b',.2,{sy:1.2});GX.draw(x,art.flag(),px+PW+20,132,{w:34,h:26})}}
      {const f=art.floorImg(),o=((cam%W)+W)%W;x.drawImage(f,-o,FLOOR,W,H-FLOOR);x.drawImage(f,W-o,FLOOR,W,H-FLOOR)}
      S.parts.forEach(q=>{const k=q.t/.6,X=q.x-(cam-q.d);x.globalAlpha=1-k;x.fillStyle=q.c;x.beginPath();x.arc(X,q.y,5*(1-k)+1,0,TAU16);x.fill();x.globalAlpha=1;if(q.c!=='#2a0040')GX.glow(x,X,q.y,14*(1-k)+3,q.c,.4*(1-k))});
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=BX+(g.d-cam);if(gx<-40||gx>W+40)continue;GX.glow(x,gx,g.y,28,'#9ad8ff',g.dead?.08:.2);mgCat(x,R.col(u),gx,g.y,46,R.nm(u),{alpha:g.dead?.18:.42})}
      if(!S.dead){GX.shadow(x,BX,FLOOR+3,S.mini>0?30:46,{alt:Math.max(0,FLOOR-S.y-BR),alpha:.6});
        const sz=S.mini>0?30:48,rise=S.vy*S.gdir<0;
        if(S.turbo>0){GX.glow(x,BX-34,S.y,40,'#ff9a3c',.8,{sy:.55});for(let i=0;i<3;i++){const L=48+(still?0:Math.sin(now/40+i*2)*10)-i*12;GX.poly(x,[[BX-16,S.y-12+i*3.4],[BX-16-L,S.y],[BX-16,S.y+12-i*3.4]],['rgba(255,110,40,.55)','rgba(255,190,80,.7)','rgba(255,246,200,.85)'][i])}
          x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1.6;for(let i=0;i<5;i++){const y=S.y-34+i*17,o=still?0:(now/2+i*57)%110;x.beginPath();x.moveTo(BX-30-o,y);x.lineTo(BX-58-o,y);x.stroke()}}
        GX.glow(x,BX,S.y,sz*.9,TH.acc,.26);
        x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;if(S.gdir<0){x.translate(BX,S.y);x.scale(1,-1);x.translate(-BX,-S.y)}
        GX.draw(x,GX.anim(art.wings,t*(rise?1.9:.8),9),BX-3,S.y-1,{w:sz*1.9,h:sz*1.27,rot:Math.max(-.22,Math.min(.22,S.vy*S.gdir/2200))});
        mgCat(x,me.c,BX,S.y,sz,me.n,{flip:false});x.restore();
        if(S.sh){const k=still?0:Math.sin(now/150)*1.5;GX.glow(x,BX,S.y,BR+30,'#8fe8ff',.35);x.strokeStyle='rgba(143,232,255,.9)';x.lineWidth=3;x.beginPath();x.arc(BX,S.y,BR+14+k,0,7);x.stroke();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2;x.beginPath();x.arc(BX,S.y,BR+10+k,3.5,4.6);x.stroke()}
        if(S.mag>0){x.strokeStyle='rgba(255,143,143,.5)';x.lineWidth=1.5;for(let i=0;i<2;i++){const q=still?i*.5:(1-(now/800+i*.5)%1);x.beginPath();x.arc(BX,S.y,24+q*70,0,7);x.stroke()}}
        if(S.slow>0){x.fillStyle='rgba(180,140,255,.1)';x.fillRect(0,0,W,H);x.strokeStyle='rgba(215,195,255,.35)';x.lineWidth=2;const q=still?.5:(now/1400)%1;x.beginPath();x.arc(BX,S.y,30+q*150,0,7);x.stroke()}}
      if(sk===5){const lr=S.light;const vg=x.createRadialGradient(BX,S.y,lr*.3,BX,S.y,lr);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.97)');x.fillStyle=vg;x.fillRect(0,0,W,H);GX.glow(x,BX,S.y,lr*.45,'#ffb86a',.12)}
      else GX.vignette(x,W,H,{a:.34});
      if(S.flashT>0){x.fillStyle=`rgba(230,240,255,${S.flashT*(still?.4:2)})`;x.fillRect(0,0,W,H)}
      GX.hud.panel(x,W/2-58,62,116,jor?68:56,{acc:TH.acc,a:.74});
      T(x,String(S.score),jor?W/2-14:W/2,90,{size:42,w:900,col:'#ffffff',stroke:5,max:70});if(jor){T(x,`/${VOGOAL55}`,W/2+24,96,{size:16,al:'left',col:'#d8d0e8',min:9,max:30});GX.hud.bar(x,W/2-46,117,92,6,S.score/VOGOAL55,{col:TH.acc,segs:5})}
      GX.hud.chip(x,W-10,26,{icon:'moeda',text:S.coins,al:'right',col:'#ffd36b',size:15,min:10});
      if(sk===4)GX.hud.chip(x,10,26,{icon:'estrela',text:`${S.rings}/15 anéis`,col:S.rings>=15?'#7dffa8':'#ffd36b',size:14,min:10});
      {let X=10;[[S.sh>0,'sh',1],[S.slow>0,'sl',S.slow/4],[S.mag>0,'mag',S.mag/8],[S.mini>0,'mini',S.mini/8],[S.turbo>0,'tur',S.turbo/2.2]].forEach(([on,k,v])=>{if(!on)return;GX.draw(x,art.power(k),X+14,FLOOR-34,{w:28,h:28});if(k!=='sh')GX.hud.bar(x,X+2,FLOOR-15,24,4,v,{col:art.PWC[k]});X+=34})}
      if(S.gdir<0){x.save();x.translate(24,70);x.rotate(0);GX.icon(x,'seta',0,0,22,'#e4f0ff');x.restore()}
      GX.hud.frame(x,W,H,{acc:TH.acc,a:.55});
      if(S.dead&&!MG.over){GX.hud.panel(x,20,H/2-24,W-40,48,{acc:'#ffd1d1',a:.9});T(x,`Você parou com ${S.score} colunas. Assistindo os outros…`,W/2,H/2+1,{size:15,col:'#ffd1d1',min:9,max:W-60})}
    }
  };
}
Object.assign(ACH,{
  voo_jornada:{ico:'🗺',n:'Seis Céus',d:'Vença os 6 Céus da Jornada do Voo Além do Véu.'},
  voo_100:{ico:'🦇',n:'Cem Colunas',d:'Passe por 100 colunas no Voo Infinito.'},
  voo_rastro:{ico:'🌈',n:'Colecionador de Rastros',d:'Tenha 4 Rastros no Voo Além do Véu.'},
  voo_estrelas:{ico:'⭐',n:'Céu Estrelado',d:'Tire 3 estrelas nos 6 Céus do Voo.',secret:true},
});
defineArcadeGame('voo',{...GAMES12.voo,make:voo55,setup:voSetup55,modes:['solo','mesa'],max:6,
  desc:'Jornada de 6 Céus com regras próprias (rajadas, espelhos, morcegos, anéis dourados, escuridão), Infinito, Óbolos, Rastros e 5 poderes.',
  rule:'Passe pelas colunas. Na Jornada, chegue à coluna 25 de cada Céu.'});
console.info('[Tulpa] Etapa 55 carregada (Voo Além do Véu 2.0)');

