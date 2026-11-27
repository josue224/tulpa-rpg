/* ===================================================================
   TULPA · ETAPA 50 — 🕹 ARCADE 2.0 · ONDA 7 (parte 1)
   🥊 RINHA DE TULPAS 2.0 — luta 2D de verdade
   5 lutadores (um por Elemento) + Perseus Supremo (chefe do Torneio).
   Golpe Leve (rápido, abre combos) · Pesado (dano e empurrão) ·
   Agarrão (quebra a defesa) · Dash/Esquiva (invencível no começo) ·
   Defesa Perfeita (bloquear no instante do golpe atordoa o rival).
   Barra de Essência com 3 níveis: 1 barra = Especial EX, 3 = Supremo.
   Modos: Melhor de 3, Torneio (5 lutas), Treino (hitboxes e dano do
   combo) e PvP.
   =================================================================== */
const RF50={
  fe:{n:'Paladino da Fé',el:'Fé',ico:'✶',col:'#ffd36b',tint:'rgba(255,200,80,.5)',hp:100,spd:230,jv:820,r1:72,r2:94,sp:'Lança de Luz',ex:'Lança Dupla',su:'Julgamento Solar',d:'Equilibrado. Lança projéteis de luz.'},
  nat:{n:'Guardiã da Natureza',el:'Natureza',ico:'🌿',col:'#7dffa8',tint:'rgba(90,220,130,.5)',hp:115,spd:195,jv:760,r1:82,r2:112,sp:'Chicote de Raiz',ex:'Raiz Prisão',su:'Floresta Viva',d:'Lenta e resistente, com o maior alcance.'},
  ine:{n:'Vazio Errante',el:'Inexistência',ico:'🕳',col:'#c58bff',tint:'rgba(150,90,255,.5)',hp:88,spd:290,jv:880,r1:64,r2:84,sp:'Passo do Vazio',ex:'Passo Duplo',su:'Colapso',d:'Rápido e frágil. Teleporta pelas costas.'},
  ilu:{n:'Ilusionista',el:'Ilusão',ico:'🌀',col:'#7fe3ff',tint:'rgba(100,220,255,.5)',hp:95,spd:250,jv:840,r1:70,r2:90,sp:'Espelho',ex:'Espelho Duplo',su:'Mil Reflexos',d:'Manda clones que atropelam o rival.'},
  ver:{n:'Oráculo da Verdade',el:'Verdade',ico:'👁',col:'#ff8fb1',tint:'rgba(255,120,170,.5)',hp:100,spd:220,jv:800,r1:70,r2:98,sp:'Olho Penetrante',ex:'Raio que Atravessa',su:'Revelação',d:'Controla a distância com raios rápidos.'},
  boss:{n:'Perseus Supremo',el:'Todos',ico:'👑',col:'#ffffff',tint:'rgba(255,240,200,.35)',hp:150,spd:250,jv:850,r1:78,r2:102,sp:'Elemento Aleatório',ex:'Fúria Elemental',su:'Supremo dos Cinco',d:'O chefe final do Torneio.',boss:1},
};
const RFK50=['fe','nat','ine','ilu','ver'];
const RMV50={L:{st:.06,ac:.07,rc:.13,dmg:5,kb:120,stun:.3,y0:-95,y1:-40,meter:8},H:{st:.16,ac:.08,rc:.3,dmg:11,kb:300,stun:.45,y0:-100,y1:-30,meter:12},G:{st:.08,ac:.05,rc:.45,reach:64,grab:1}};
function riProg50(){const p=prog38().ri||{};return{tor:p.tor||0,win:p.win||{},best:p.best||0}}
const riSetup50={
  intro:o=>o._m==='pvp'?'Cada um escolhe o seu lutador. Melhor de 3 rounds.':'Escolha o seu lutador e o modo. No Torneio são 5 lutas até o Perseus Supremo.',
  def:()=>({m:'b3',f:'fe',o:'rnd',f2:'nat',dm:'cpu'}),
  fields:o=>{const pvp=o._m==='pvp',p=riProg50();const fo=(k,ex)=>RFK50.map(q=>({v:q,n:RF50[q].n,ico:RF50[q].ico,d:`${RF50[q].el} · ${RF50[q].d}`,badge:p.win[q]?`🏆 ${p.win[q]}`:''})).concat(ex||[]);
    if(pvp)return[{k:'f',l:'Lutador do anfitrião',wide:1,opts:fo('f')},{k:'f2',l:'Lutador do convidado',wide:1,opts:fo('f2')}];
    const F=[{k:'m',l:'Modo',opts:[{v:'b3',n:'Melhor de 3',ico:'🥊',d:'Uma luta contra o Perseus.'},{v:'tor',n:'Torneio',ico:'🏆',d:'5 lutas seguidas até o Perseus Supremo.',badge:p.tor?`👑 ×${p.tor}`:''},{v:'tre',n:'Treino',ico:'🎯',d:'Boneco, hitboxes e dano do combo.'}]},{k:'f',l:'Seu lutador',wide:1,opts:fo('f')}];
    if(o.m==='b3')F.push({k:'o',l:'Rival',wide:1,opts:[{v:'rnd',n:'Sorteado',ico:'🎲',d:'Um Elemento qualquer.'}].concat(RFK50.map(q=>({v:q,n:RF50[q].n,ico:RF50[q].ico,d:RF50[q].el}))).concat(p.tor?[{v:'boss',n:'Perseus Supremo',ico:'👑',d:'O chefe do Torneio.'}]:[])});
    if(o.m==='tre')F.push({k:'dm',l:'Boneco',opts:[{v:'par',n:'Parado',ico:'🧍',d:'Não faz nada.'},{v:'blk',n:'Bloqueia',ico:'🛡',d:'Defende tudo (teste o Agarrão).'},{v:'pul',n:'Pula',ico:'⤒',d:'Pula sem parar.'},{v:'cpu',n:'Luta',ico:'🤖',d:'Luta como o Perseus.'}]});
    return F},
  fix:o=>{if(!['b3','tor','tre'].includes(o.m))o.m='b3';if(!RFK50.includes(o.f))o.f='fe';if(!RFK50.includes(o.f2))o.f2='nat';if(!['rnd','boss',...RFK50].includes(o.o)||(o.o==='boss'&&!riProg50().tor))o.o='rnd';if(!['par','blk','pul','cpu'].includes(o.dm))o.dm='cpu'},
  sum:()=>'A/D andam · W pula · S defende (no instante do golpe = Defesa Perfeita) · J Leve · K Pesado · L Especial · H Agarrão · Espaço Dash · U Especial EX (1 barra) · I Supremo (3 barras).'
};

/* ---------- 🎨 arte da Rinha (somente visual: não toca golpes, hitboxes, rede nem a predição) ---------- */
function riArt50(stageKey){
  const G=window.GFX60,W=800,H=450,FL=380,TAU=Math.PI*2,poly=G.poly;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const ST={fe:{sc:'fe',acc:'#ffd36b',tile:'pedra',a:'#8a6a48',amb:'brasas',crowd:'#2a1418',name:'Templo do Ocaso'},
    nat:{sc:'natureza',acc:'#7dffa8',tile:'grama',a:'#2a5a34',amb:'folhas',crowd:'#04140a',name:'Clareira Viva'},
    ine:{sc:'inexistencia',acc:'#c58bff',tile:'runa',a:'#1c1230',amb:'motes',crowd:'#080414',name:'Beira do Nada'},
    ilu:{sc:'ilusao',acc:'#7fe3ff',tile:'cristal',a:'#3a2460',amb:'motes',crowd:'#180628',name:'Salão dos Espelhos'},
    ver:{sc:'verdade',acc:'#ff8fb1',tile:'metal',a:'#2a4a5a',amb:'poeira',crowd:'#031a24',name:'Observatório'},
    boss:{sc:'cripta',acc:'#ffe9b0',tile:'pedra',a:'#5a4a60',amb:'brasas',crowd:'#0c0610',name:'Trono do Perseus'}}[stageKey]||{};
  const bg=G.scene(ST.sc,W,H,{seed:7}),amb=G.ambient(ST.amb,{W,H:390,n:26,col:ST.acc,seed:4});
  /* arquibancada e adereços fixos */
  const props=()=>G.bake('ri:props:'+stageKey,W,FL,(g,w,h,r)=>{
    [[34,1],[766,-1]].forEach(([X,s])=>{
      if(stageKey==='nat'){let u=X,y=h;const p=[[u,y]];for(let i=0;i<7;i++){u+=s*3+(r()-.5)*12;y-=38;p.push([u,y])}line(g,p,'#160e06',34);line(g,p,'#3a2a14',20);for(let i=0;i<22;i++)ell(g,u+(r()-.5)*130,y+(r()-.2)*70,18+r()*18,10+r()*10,G.mix('#0c3418','#3a8a44',r()),r()*3)}
      else if(stageKey==='ine'||stageKey==='ilu'){for(let i=0;i<4;i++){const u=X+s*i*20,hh=170-i*34+r()*30,ww=20-i*3;const c=stageKey==='ine'?'#3a2070':'#2a8ab0';poly(g,[[u-ww,h],[u-ww*.4,h-hh*.75],[u,h-hh],[u,h]],G.shade(c,.1));poly(g,[[u,h-hh],[u+ww*.6,h-hh*.7],[u+ww,h],[u,h]],G.shade(c,-.45));line(g,[[u,h-hh],[u,h-8]],'rgba(230,230,255,.55)',1.4)}}
      else{const c={fe:'#8a5a38',ver:'#4a7a8a',boss:'#4a3a52'}[stageKey]||'#555';box(g,X-24,h-210,48,210,vg(g,h-210,h,G.shade(c,.18),G.shade(c,-.5)),3);for(let i=-1;i<2;i++){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(X+i*13-3,h-196,5,180)}box(g,X-34,h-222,68,16,G.shade(c,.3),4);box(g,X-34,h-14,68,14,G.shade(c,-.25),3);
        const bn={fe:'#9a2a2a',ver:'#1a4a7a',boss:'#6a1030'}[stageKey]||'#555';poly(g,[[X-17,h-188],[X+17,h-188],[X+17,h-84],[X,h-102],[X-17,h-84]],bn);line(g,[[X-17,h-188],[X+17,h-188]],'#ffd36b',3);G.icon(g,stageKey==='ver'?'olho':stageKey==='boss'?'coroa':'sol',X,h-150,24,ST.acc)}});
    g.fillStyle=vg(g,h-46,h,'rgba(0,0,0,0)','rgba(0,0,0,.6)');g.fillRect(0,h-46,w,46)});
  const crowd=k=>G.bake(`ri:crowd:${stageKey}:${k}`,840,56,(g,w,h,r)=>{for(let i=0;i<20;i++){const X=22+i*42+(k?18:0)+r()*10,s=14+r()*7,Y=h-(k?14:2)-r()*8,c=G.shade(ST.crowd,k?.1:.03);
    ell(g,X,Y,s*1.15,s,c);ell(g,X,Y-s*.95,s*.82,s*.7,c);poly(g,[[X-s*.8,Y-s*1.1],[X-s*.7,Y-s*2],[X-s*.15,Y-s*1.55]],c);poly(g,[[X+s*.8,Y-s*1.1],[X+s*.7,Y-s*2],[X+s*.15,Y-s*1.55]],c);
    if(r()<.55){disc(g,X-s*.3,Y-s,1.5,ST.acc);disc(g,X+s*.3,Y-s,1.5,ST.acc)}g.fillStyle=c;g.fillRect(X-s*1.15,Y,s*2.3,h-Y)}});
  const floor=()=>G.bake('ri:floor:'+stageKey,840,H-FL+6,(g,w,h)=>{
    G.fillTile(g,G.tile(ST.tile,{size:70,a:ST.a,seed:12}),0,6,w,h-6);g.fillStyle=vg(g,6,h,'rgba(0,0,0,.05)','rgba(0,0,0,.8)');g.fillRect(0,6,w,h-6);
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;for(let i=-9;i<=9;i++){g.beginPath();g.moveTo(420+i*52,8);g.lineTo(420+i*96,h);g.stroke()}[22,44].forEach(Y=>{g.beginPath();g.moveTo(0,Y);g.lineTo(w,Y);g.stroke()});
    g.fillStyle=G.shade(ST.a,.35);g.fillRect(0,2,w,6);g.fillStyle=ST.acc;g.fillRect(0,5,w,2);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(0,2,w,1.5);
    g.strokeStyle=G.rgba(ST.acc,.3);g.lineWidth=2;g.beginPath();g.ellipse(420,38,150,24,0,0,TAU);g.stroke();g.beginPath();g.ellipse(420,38,100,15,0,0,TAU);g.stroke()});
  /* ===== lutadores: Perseus caracterizado (160×150, pés em y=148, olhando para a direita) ===== */
  const FW=160,FH=150,S0=112,OX=24,OY=148-S0*.99;
  const LOOK={fe:{cat:'#ffe2a0',dk:'#8a5a10',cape:'#b8302a',glove:'#ffd36b',eye:'#6a3a00'},nat:{cat:'#a8f0b8',dk:'#1a5a30',cape:'#2a7a3a',glove:'#7ad060',eye:'#0a3a18'},
    ine:{cat:'#8a6ac0',dk:'#1a0a34',cape:'#241048',glove:'#c58bff',eye:'#ffffff'},ilu:{cat:'#b8f0ff',dk:'#1a5a8a',cape:'#7a3ab8',glove:'#7fe3ff',eye:'#12406a'},
    ver:{cat:'#ffc0d4',dk:'#8a1a4a',cape:'#2a1a5a',glove:'#ff8fb1',eye:'#5a0a2a'},boss:{cat:'#ffffff',dk:'#3a2a10',cape:'#6a0a24',glove:'#ffe9b0',eye:'#a01a1a'}};
  const catImg=col=>G.bake(`ri:cat:${col}:${SPR.ok?1:0}`,128,128,c=>{
    if(SPR.ok){c.translate(128,0);c.scale(-1,1);c.drawImage(SPR.img,0,0,128,128);c.globalCompositeOperation='multiply';c.fillStyle=col;c.fillRect(0,0,128,128);c.globalCompositeOperation='destination-in';c.drawImage(SPR.img,0,0,128,128)}
    else{ell(c,68,80,50,46,'#100810');poly(c,[[116,62],[106,18],[76,40]],'#100810');poly(c,[[70,40],[40,18],[24,62]],'#100810');ell(c,68,80,45,41,col);poly(c,[[111,58],[103,28],[82,42]],col);poly(c,[[62,42],[42,28],[29,58]],col)}
    c.setTransform(2,0,0,2,0,0);c.globalCompositeOperation='source-atop';c.fillStyle=vg(c,10,128,'rgba(255,255,255,.18)','rgba(0,0,0,.34)');c.fillRect(0,0,128,128)},{s:2});
  const body=(k,face)=>G.bake(`ri:body:${k}:${face}:${SPR.ok?1:0}`,FW,FH,g=>{
    const L=LOOK[k],P=(u,v)=>[OX+u*S0,OY+v*S0],eyes=[P(.415,.408),P(.715,.415)],mouth=P(.57,.5);
    g.drawImage(catImg(L.cat),OX,OY,S0,S0);
    const E=([X,Y],s)=>{ell(g,X,Y,10,8,L.cat);
      if(face==='h'){line(g,[[X-6,Y-5],[X+5,Y+4]],'#160810',3);line(g,[[X+5,Y-5],[X-6,Y+4]],'#160810',3)}
      else if(face==='b'){line(g,[[X-7,Y-s*3],[X+7,Y+s*3]],'#160810',3.6)}
      else{ell(g,X,Y,6.4,5.4,'#160810');ell(g,X+1,Y,4.4,3.8,k==='ine'?'#e8d0ff':'#fff');ell(g,X+2,Y+.4,2.3,3,L.eye);disc(g,X+1,Y-1.4,1.1,'#fff');line(g,[[X-8,Y-8-s*2.5],[X+8,Y-8+s*2.5]],'#160810',3.2)}};
    E(eyes[0],1);E(eyes[1],-1);
    const[mx,my]=mouth;if(face==='a'){ell(g,mx,my+3,9,8,'#2a060c');ell(g,mx,my+7,5,3,'#e86a7a');poly(g,[[mx-7,my-2],[mx-3,my-2],[mx-5,my+3]],'#fff');poly(g,[[mx+3,my-2],[mx+7,my-2],[mx+5,my+3]],'#fff')}
    else if(face==='h'){ell(g,mx,my+4,5,4,'#2a060c')}
    /* trajes */
    const belt=(c1,c2)=>{g.fillStyle=c1;g.beginPath();g.moveTo(...P(.1,.76));g.quadraticCurveTo(...P(.5,.86),...P(.9,.76));g.lineTo(...P(.9,.85));g.quadraticCurveTo(...P(.5,.95),...P(.1,.85));g.closePath();g.fill();line(g,[P(.1,.76),P(.3,.8),P(.5,.81),P(.7,.8),P(.9,.76)],c2,2)};
    if(k==='fe'){g.fillStyle=vg(g,P(0,.6)[1],P(0,.92)[1],'#fff0b8','#a87818');g.beginPath();g.moveTo(...P(.18,.62));g.quadraticCurveTo(...P(.5,.72),...P(.82,.62));g.lineTo(...P(.78,.88));g.quadraticCurveTo(...P(.5,.97),...P(.22,.88));g.closePath();g.fill();g.strokeStyle='#4a3004';g.lineWidth=2.4;g.stroke();G.icon(g,'sol',...P(.52,.77),22,'#7a2a0a');
      [P(.12,.64),P(.86,.64)].forEach(([X,Y])=>{ell(g,X,Y,14,11,'#4a3004');ell(g,X,Y-1,12,9,'#ffd36b');disc(g,X-3,Y-4,3,'#fff6d0')});g.strokeStyle='#ffe9a0';g.lineWidth=4;g.beginPath();g.ellipse(...P(.53,.07),26,7,0,0,TAU);g.stroke();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.4;g.stroke()}
    else if(k==='nat'){belt('#5a3a18','#8ad060');for(let i=0;i<9;i++){const[X,Y]=P(.13+i*.092,.65+Math.sin(i/8*Math.PI)*.08);ell(g,X,Y,11,6,G.mix('#1f6a30','#8ae06a',(i%3)/2),1.1+(i-4)*.16)}
      [[-1,P(.33,.17)],[1,P(.77,.17)]].forEach(([s,[X,Y]])=>{line(g,[[X,Y+6],[X+s*12,Y-8],[X+s*9,Y-20]],'#5a3a18',5);line(g,[[X+s*11,Y-8],[X+s*24,Y-13]],'#5a3a18',3.4);ell(g,X+s*24,Y-14,6,3.6,'#8ae06a',s*.5)});for(let i=0;i<5;i++){const a=i*TAU/5;disc(g,P(.55,.18)[0]+Math.cos(a)*5,P(.55,.18)[1]+Math.sin(a)*5,3.6,'#ffd0e8')}disc(g,...P(.55,.18),3,'#ffd36b')}
    else if(k==='ine'){g.fillStyle='#1a0a34';g.beginPath();g.moveTo(...P(.05,.55));g.quadraticCurveTo(...P(.08,.02),...P(.55,.02));g.quadraticCurveTo(...P(.99,.05),...P(.95,.52));g.quadraticCurveTo(...P(.84,.24),...P(.55,.23));g.quadraticCurveTo(...P(.22,.26),...P(.05,.55));g.fill();line(g,[P(.1,.46),P(.28,.25),P(.55,.2),P(.82,.24),P(.92,.45)],'#c58bff',2.2);belt('#120620','#c58bff');
      g.fillStyle='#2a1450';g.beginPath();g.moveTo(...P(.12,.6));g.quadraticCurveTo(...P(.5,.74),...P(.9,.6));g.lineTo(...P(.74,.72));g.lineTo(...P(.56,.66));g.lineTo(...P(.4,.74));g.closePath();g.fill();disc(g,...P(.52,.84),6,'#e8d0ff');disc(g,...P(.52,.84),3,'#08020f')}
    else if(k==='ilu'){belt('#7a3ab8','#ffd36b');for(let i=0;i<7;i++){const[X,Y]=P(.16+i*.115,.65+Math.sin(i/6*Math.PI)*.09);poly(g,[[X-8,Y-4],[X+8,Y-4],[X,Y+13]],i%2?'#7fe3ff':'#ff9be0');disc(g,X,Y+13,2.4,'#ffd36b')}
      [[-1,'#ff9be0'],[0,'#7a3ab8'],[1,'#7fe3ff']].forEach(([s,c])=>{const[X,Y]=P(.53+s*.17,.19);poly(g,[[X-10,Y+4],[X+s*18,Y-24+Math.abs(s)*7],[X+10,Y+4]],c);disc(g,X+s*18,Y-24+Math.abs(s)*7,4,'#ffd36b')});const[tx,ty]=P(.8,.5);poly(g,[[tx,ty-4],[tx+3,ty+4],[tx,ty+8],[tx-3,ty+4]],'#3ab0ff')}
    else if(k==='ver'){g.fillStyle=vg(g,P(0,.6)[1],P(0,.94)[1],'#5a3a9a','#1a0c3a');g.beginPath();g.moveTo(...P(.14,.62));g.lineTo(...P(.52,.74));g.lineTo(...P(.88,.62));g.lineTo(...P(.9,.9));g.quadraticCurveTo(...P(.5,1),...P(.12,.9));g.closePath();g.fill();line(g,[P(.14,.62),P(.52,.74),P(.88,.62)],'#ffd36b',2.6);line(g,[P(.52,.74),P(.52,.93)],'#ffd36b',2);
      const[X,Y]=P(.55,.26);ell(g,X,Y,13,8,'#160810');ell(g,X,Y,11,6,'#fff');disc(g,X+1,Y,4.4,'#ff4a8a');disc(g,X+1,Y,2,'#160810');for(let i=-2;i<=2;i++)line(g,[[X+i*6,Y-10],[X+i*9,Y-17]],'#ffd36b',2)}
    else{belt('#8a6a18','#fff0b0');g.fillStyle='#8a1030';g.beginPath();g.moveTo(...P(.1,.6));g.quadraticCurveTo(...P(.5,.78),...P(.92,.6));g.lineTo(...P(.86,.72));g.quadraticCurveTo(...P(.5,.9),...P(.15,.72));g.closePath();g.fill();for(let i=0;i<7;i++){const[X,Y]=P(.17+i*.113,.655+Math.sin(i/6*Math.PI)*.075);disc(g,X,Y,5,'#f4f0e8');disc(g,X,Y+1,1.4,'#160810')}
      const[X,Y]=P(.53,.2);poly(g,[[X-30,Y+8],[X-33,Y-20],[X-17,Y-6],[X-7,Y-28],[X+3,Y-8],[X+15,Y-27],[X+21,Y-4],[X+34,Y-18],[X+30,Y+9]],'#ffd36b');line(g,[[X-30,Y+5],[X+30,Y+6]],'#8a5a08',4);[['#e0304a',-18],['#7dffa8',-6],['#7fe3ff',6],['#c58bff',18]].forEach(([c,u])=>disc(g,X+u,Y+1,3.4,c))}
  },{s:2});
  const glove=(k)=>G.bake('ri:glove:'+k,44,40,g=>{const L=LOOK[k];ell(g,20,20,18,16,'#12080e');ell(g,20,20,15.5,13.5,L.glove);ell(g,24,15,8,5,'rgba(255,255,255,.45)',-.3);for(let i=0;i<3;i++){disc(g,33,11+i*9,7,'#12080e');disc(g,33,11+i*9,5,G.shade(L.glove,.18))}box(g,2,9,9,22,'#12080e',4);box(g,4,11,5,18,L.dk,2)},{s:2});
  /* ===== efeitos ===== */
  const swoosh=(col)=>G.bake('ri:swoosh:'+col,160,80,g=>{const q=g.createLinearGradient(0,0,160,0);q.addColorStop(0,G.rgba(col,0));q.addColorStop(.7,G.rgba(col,.75));q.addColorStop(1,'#ffffff');g.fillStyle=q;g.beginPath();g.moveTo(0,22);g.quadraticCurveTo(110,-6,158,40);g.quadraticCurveTo(110,86,0,58);g.quadraticCurveTo(96,52,104,40);g.quadraticCurveTo(96,28,0,22);g.fill()},{s:2});
  const lance=col=>G.bake('ri:lance:'+col,96,40,g=>{const q=g.createLinearGradient(0,0,90,0);q.addColorStop(0,G.rgba(col,0));q.addColorStop(1,col);g.fillStyle=q;g.beginPath();g.moveTo(0,20);g.lineTo(66,10);g.lineTo(94,20);g.lineTo(66,30);g.closePath();g.fill();poly(g,[[56,20],[70,8],[94,20],[70,32]],col);poly(g,[[64,20],[72,14],[90,20],[72,26]],'#fff')},{s:2});
  const eyeShot=(w,h)=>G.bake(`ri:eyeshot:${w}:${h}`,w*2,h*3,g=>{const Y=h*1.5,q=g.createLinearGradient(0,0,w*2,0);q.addColorStop(0,'rgba(255,143,177,0)');q.addColorStop(1,'#ff8fb1');g.fillStyle=q;g.fillRect(0,Y-h*.4,w*1.5,h*.8);ell(g,w*1.5,Y,w*.5,h*.9,'#ff8fb1');ell(g,w*1.5,Y,w*.4,h*.55,'#fff');disc(g,w*1.62,Y,h*.35,'#8a0a3a')},{s:2});
  const roots=(w,h,col)=>G.bake(`ri:roots:${w}:${h}:${col}`,w,h+16,(g,W2,H2,r)=>{const n=Math.round(w/26);for(let i=0;i<=n;i++){const X=4+i*(w-8)/n,top=2+r()*14,bend=(r()-.5)*26;g.fillStyle=G.shade(col,i%2?-.3:0);g.beginPath();g.moveTo(X-9,H2);g.quadraticCurveTo(X+bend,H2*.55,X+bend*.4,top);g.quadraticCurveTo(X+bend+8,H2*.55,X+9,H2);g.fill();poly(g,[[X+bend*.6,H2*.55],[X+bend*.6+11,H2*.45],[X+bend*.6+2,H2*.68]],'#d8ffb0')}box(g,0,H2-8,w,8,G.shade(col,-.45),4)},{s:2});
  const column=(w,h,col,vert)=>G.bake(`ri:col:${w}:${h}:${col}:${vert?1:0}`,w,h,g=>{const q=vert?g.createLinearGradient(0,0,w,0):g.createLinearGradient(0,0,0,h);[[0,0],[.18,.45],[.38,.95],[.5,1],[.62,.95],[.82,.45],[1,0]].forEach(([o,a])=>q.addColorStop(o,G.rgba(o>.4&&o<.6?'#ffffff':col,a)));g.fillStyle=q;g.fillRect(0,0,w,h)});

  const V={f:[{},{}],hits:new WeakSet(),bar:[1,1],ox:[240,560],walk:[0,0]};
  function pose(f,i,t,red){
    const d=f.face,dx=f.x-V.ox[i];V.ox[i]=f.x;if(Math.abs(dx)>.4&&Math.abs(dx)<30)V.walk[i]=t;
    const walking=f.st==='walk'||(f.st==='idle'&&t-V.walk[i]<.12),air=f.y<FL-2,br=red?0:Math.sin(t*3.2+i*2);
    const p={dx:0,dy:0,rot:0,sx:1-br*.012,sy:1+br*.022,face:'n',a:1,f:[d*32,-46],b:[-d*20,-40],fs:1,bs:.85};
    if(f.st==='ko'){const k=Math.min(1,f.t*2.4);p.rot=-d*1.45*k;p.dy=-14*k;p.face='h';p.f=[-d*26,-24];p.b=[-d*50,-18];return p}
    if(walking){const s=red?0:Math.sin(t*15);p.rot=s*.07;p.dy=-Math.abs(s)*6;p.f=[d*(32+s*9),-46];p.b=[-d*(20+s*9),-40]}
    if(air&&f.st!=='thrown'){p.sy=1.08;p.sx=.94;p.rot=d*(f.vy<0?.1:-.06);p.f=[d*36,-64];p.b=[-d*30,-30]}
    const m=f.mv;
    if(f.st==='atk'&&m){const st=m.st||0,on=f.t>=st&&f.t<st+(m.ac||0)+.07,wind=f.t<st,r=m.reach||64;
      if(m.k==='L'){p.face=on?'a':'n';if(wind){p.rot=-d*.1;p.dx=-d*5;p.f=[d*6,-62]}else if(on){p.rot=d*.14;p.dx=d*9;p.f=[d*(r-8),-66];p.fs=1.3}else{p.f=[d*46,-56]}}
      else if(m.k==='H'){p.face='a';if(wind){p.rot=-d*.26;p.sy=.92;p.sx=1.08;p.f=[-d*34,-74];p.fs=1.35}else if(on){p.rot=d*.3;p.dx=d*16;p.sx=1.1;p.sy=.95;p.f=[d*(r-14),-60];p.fs=1.85}else{p.rot=d*.12;p.f=[d*50,-34];p.fs=1.35}}
      else if(m.k==='G'){p.face='a';p.rot=d*(wind?-.08:.16);p.dx=d*(wind?-3:12);p.f=wind?[d*24,-82]:[d*(r-6),-74];p.b=wind?[d*4,-40]:[d*(r-14),-40];p.fs=p.bs=1.25}
      else if(m.k==='SP'){p.face='a';if(wind){p.sy=.9;p.sx=1.1;p.f=[d*20,-70];p.b=[d*2,-66]}else{p.rot=d*.14;p.dx=d*7;p.f=[d*50,-70];p.b=[d*40,-48];p.fs=1.25}}
      else{p.face='a';p.dy=-8-(red?0:Math.sin(t*20)*3);p.sy=1.1;p.f=[d*38,-104];p.b=[-d*38,-104];p.fs=p.bs=1.3}}
    else if(f.st==='dash'){const dr=m?.dir||d;p.rot=dr*.24;p.sx=1.2;p.sy=.84;p.f=[-dr*30,-40];p.b=[-dr*46,-34]}
    else if(f.st==='hit'||f.st==='bstun'){const hard=f.st==='hit';p.face=hard?'h':'b';p.rot=-d*(hard?.26:.08);p.dx=red?0:Math.sin(t*70)*(hard?4:2);if(hard){p.f=[d*18,-92];p.b=[-d*40,-74];p.sy=.94}else{p.f=[d*34,-74];p.b=[d*26,-48]}}
    else if(f.st==='thrown'){p.face='h';p.rot=red?-d*1.1:-d*f.t*11;p.f=[d*34,-80];p.b=[-d*34,-30]}
    else if(f.st==='stuck'){p.face='h';p.rot=red?0:Math.sin(t*22)*.07}
    else if(f.st==='tele'){p.a=.25+(red?.2:.25*Math.abs(Math.sin(t*28)));p.sx=.75;p.sy=1.2}
    if(f.blk){p.face='b';p.sy=.93;p.sx=1.05;p.dx=-d*4;p.f=[d*38,-74];p.b=[d*32,-46];p.fs=1.15}
    return p}
  /* desenha o lutador com os pés em (X,Y) */
  function puppet(x,k,face,X,Y,p,{alpha=1,tint=null,gloves=true}={}){
    let img=body(k,p.face);if(tint)img=G.tint(img,tint,.78);
    const a=alpha*p.a,cx=X+p.dx,cy=Y+p.dy;
    const gl=(pos,s)=>{const im=tint?G.tint(glove(k),tint,.78):glove(k);G.draw(x,im,cx+pos[0],cy+pos[1],{w:34*s,flip:face<0,alpha:a,rot:p.rot})};
    if(gloves)gl(p.b,p.bs);
    x.save();x.translate(cx,cy-46);x.rotate(p.rot);x.scale(face*p.sx,p.sy);x.globalAlpha*=a;x.drawImage(img,-FW/2+2,-(FH-48),FW,FH);x.restore();
    if(gloves)gl(p.f,p.fs)}
  function cape(x,f,p,t,red){const L=LOOK[f.k],d=f.face,X=f.x+p.dx-d*14,Y=f.y+p.dy-66,spd=['dash','walk','tele'].includes(f.st)||f.y<FL-2?1:.35,w1=red?0:Math.sin(t*9+f.i)*7*spd,w2=red?0:Math.sin(t*7+f.i+2)*5*spd,len=34+spd*34;
    if(f.st==='ko'||f.st==='thrown'||f.st==='tele')return;
    x.fillStyle=L.cape;x.beginPath();x.moveTo(X+d*16,Y-12);x.quadraticCurveTo(X-d*len*.6,Y+w1,X-d*(len+14),Y+30+w1);x.lineTo(X-d*(len-8),Y+42+w2);x.lineTo(X-d*(len+2),Y+56+w2);x.quadraticCurveTo(X-d*14,Y+48,X+d*10,Y+50);x.closePath();x.fill();x.strokeStyle=G.rgba(L.glove,.65);x.lineWidth=1.8;x.stroke()}
  /* retrato para o HUD */
  const portrait=k=>G.bake(`ri:face:${k}:${SPR.ok?1:0}`,52,52,g=>{const L=LOOK[k];g.beginPath();g.arc(26,26,24,0,TAU);g.save();g.clip();g.fillStyle=vg(g,0,52,L.cape,'#0c0612');g.fillRect(0,0,52,52);g.drawImage(body(k,'n'),-31,-28,106,99);g.restore();ring(g,26,26,24,'#12080e',4);ring(g,26,26,24,L.glove,2)},{s:2});

  return{ST,LOOK,portrait,
    background(x,mid,t){const red=G.reduced(),cam=(mid-400)*.35;
      bg.draw(x,cam,0,t);
      if(stageKey==='boss'){G.rays(x,400,150,{n:12,len:340,col:'#ffd36b',a:.06,t});G.glow(x,400,170,150,'#c89a30',.3)}
      if(stageKey==='fe')G.glow(x,400,230,170,'#ffb347',.22);
      if(stageKey==='ilu'&&!red)G.glow(x,400+Math.sin(t*.6)*220,150,110,'#ff9be0',.2);
      x.drawImage(props(),0,0,W,FL);
      const hype=S_hype(t);
      x.drawImage(crowd(1),-20-cam*.12,FL-60+(red?0:Math.sin(t*3)*1.5-hype*4),840,56);x.drawImage(crowd(0),-20-cam*.2,FL-48+(red?0:Math.sin(t*4+2)*1.8-hype*6),840,56);
      amb.draw(x,t);
      x.drawImage(floor(),-20,FL-5,840,H-FL+6)},
    entity(x,e,fighters,now){
      const t=now/1000,red=G.reduced(),X=e.x-e.w/2,Y=e.y-e.h/2;
      if(e.delay>0){const a=.35+(red?0:.25*Math.sin(now/45));x.fillStyle=G.rgba(e.col,a*.5);x.beginPath();x.ellipse(e.x,FL-2,e.w/2,7,0,0,TAU);x.fill();x.strokeStyle=G.rgba(e.col,a+.2);x.lineWidth=2;x.stroke();G.draw(x,column(Math.round(e.w),64,e.col,true),e.x,FL,{ay:1,alpha:a*.5});return}
      if(e.k==='proj'){const beam=e.col==='#ff8fb1';
        G.glow(x,e.x,e.y,e.w*1.1,e.col,.55,{sy:.55});const dir=dirOf(e);
        if(beam)G.draw(x,eyeShot(e.w,e.h),e.x-dir*e.w*.5,e.y,{flip:dir<0});else G.draw(x,lance(e.col),e.x-dir*e.w*.55,e.y,{w:e.w*2.6,h:e.h*2.5,flip:dir<0});
        if(!red&&Math.random()<.35)G.emit('rastro',e.x-dir*e.w*.5,e.y,{col:e.col,amount:.5})}
      else if(e.k==='clone'){const dir=dirOf(e),o=fighters[e.o]||fighters.find(f=>f.k==='ilu')||fighters[0],p={dx:0,dy:0,rot:dir*.22,sx:1.08,sy:.92,face:'a',a:1,f:[dir*44,-62],b:[dir*18,-40],fs:1.3,bs:1};
        G.glow(x,e.x,e.y-56,56,e.col,.35);for(let i=2;i>0;i--)puppet(x,o.k,dir,e.x-dir*i*22,e.y,p,{alpha:.18,tint:e.col,gloves:false});puppet(x,o.k,dir,e.x,e.y,p,{alpha:.72,tint:e.col})}
      else if(e.k==='hole'){const R=60+(red?0:Math.sin(now/60)*8);G.glow(x,e.x,e.y,R*2.4,'#7a3ad8',.55);x.save();x.translate(e.x,e.y);x.fillStyle='#000';x.beginPath();x.arc(0,0,R*.72,0,TAU);x.fill();
        for(let i=0;i<5;i++){x.rotate((red?0:t*(3+i*.7))+i*1.26);x.strokeStyle=G.rgba(i%2?'#c58bff':'#ffffff',.8-i*.12);x.lineWidth=4.5-i*.6;x.beginPath();x.ellipse(0,0,R*(.78+i*.17),R*(.55+i*.13),0,0,3.6);x.stroke()}x.restore()}
      else if(e.k==='pillar'){if(e.col==='#4ad46a'){G.glow(x,e.x,e.y,e.w*.9,e.col,.35,{sy:2});x.drawImage(roots(Math.round(e.w),Math.round(e.h),'#2f9a48'),X,Y-16,e.w,e.h+16)}
        else{G.draw(x,column(Math.round(e.w),Math.round(e.h),e.col,true),e.x,e.y,{add:true});x.globalAlpha=.7;x.drawImage(column(Math.round(e.w),Math.round(e.h),e.col,true),X,Y,e.w,e.h);x.globalAlpha=1;G.glow(x,e.x,FL,e.w,'#fff3c0',.8,{sy:.35});G.rays(x,e.x,Y+40,{n:10,len:150,col:e.col,a:.2,t:t*5})}}
      else if(e.k==='beam'){const im=column(64,Math.round(e.h),e.col,false);x.drawImage(im,X,Y,e.w,e.h);x.globalCompositeOperation='lighter';x.drawImage(im,X,Y+e.h*.2,e.w,e.h*.6);x.globalCompositeOperation='source-over';
        for(let i=0;i<8;i++)G.glow(x,X+((i*137+(red?0:now*.9))%e.w),e.y+Math.sin(i*2.4+t*14)*e.h*.2,18,'#ffffff',.5)}
      else if(e.k==='whip'||e.k==='trap'){G.glow(x,e.x,e.y,e.w*.7,e.col,.35,{sy:.4});x.drawImage(roots(Math.round(e.w),Math.round(e.h),e.col),X,Y-16,e.w,e.h+16)}
      else{G.glow(x,e.x,e.y,e.w,e.col,.5);x.fillStyle=e.col;x.beginPath();x.ellipse(e.x,e.y,e.w/2,e.h/2,0,0,TAU);x.fill()}},
    fighter(x,f,i,now){
      const t=now/1000,red=G.reduced(),L=LOOK[f.k],p=pose(f,i,t,red),v=V.f[i],d=f.face;
      G.shadow(x,f.x,FL+3,96,{alt:Math.max(0,FL-f.y),alpha:.6});
      x.strokeStyle=G.rgba(i?'#ff6b5b':'#7dffa8',.75);x.lineWidth=2;x.beginPath();x.ellipse(f.x,FL+4,34,6,0,0,TAU);x.stroke();
      G.glow(x,f.x+p.dx,f.y-54,f.meter>=300?82:62,f.meter>=300?'#ffd36b':L.glove,f.meter>=300?.42+(red?0:.12*Math.sin(t*9)):.2);
      if(f.meter>=300&&!red&&Math.random()<.16)G.emit('rastro',f.x+(Math.random()-.5)*50,f.y-20-Math.random()*80,{col:'#ffd36b',amount:.5});
      if(f.st==='dash'){const dr=f.mv?.dir||d;for(let k=3;k>0;k--)puppet(x,f.k,d,f.x-dr*k*24,f.y,p,{alpha:.14*(4-k),tint:L.glove,gloves:false})}
      cape(x,f,p,t,red);
      const flash=now-f.hitT<110;puppet(x,f.k,d,f.x,f.y,p,{tint:flash?'#ffffff':null});
      const m=f.mv;
      if(f.st==='atk'&&m&&(m.k==='L'||m.k==='H'||m.k==='G')&&f.t>=m.st){const r=m.reach||64,k=Math.min(1,(f.t-m.st)/((m.ac||.05)+.12)),col=m.k==='G'?'#ff9b2f':L.glove,heavy=m.k==='H';
        if(k<1){const w=r*.95,h=heavy?70:m.k==='G'?56:46;G.draw(x,swoosh(col),f.x+d*(10+r-w/2),f.y+(heavy?-65:-66),{w,h,flip:d<0,alpha:1-k*.85});G.glow(x,f.x+d*(r-4),f.y-64,heavy?40:26,col,(1-k)*.8)}}
      if(f.st==='atk'&&m&&(m.k==='SP'||m.k==='SU')){G.glow(x,f.x+d*34,f.y-62,m.k==='SU'?110:50,L.glove,.65);if(m.k==='SU')G.rays(x,f.x,f.y-60,{n:9,len:130,col:L.glove,a:.22,t:t*6})}
      if(f.blk){const hot=f.blkT<.15,c=hot?'#ffffff':'#7fc8ff';x.save();x.translate(f.x+d*14,f.y-56);x.scale(d,1);x.fillStyle=G.rgba(c,.16);x.beginPath();x.arc(0,0,52,-1.15,1.15);x.arc(-14,0,46,1,-1,true);x.closePath();x.fill();x.strokeStyle=c;x.lineWidth=hot?6:4;x.beginPath();x.arc(0,0,52,-1.1,1.1);x.stroke();x.lineWidth=1.2;for(let a=-.7;a<=.8;a+=.7){x.beginPath();x.moveTo(Math.cos(a)*34,Math.sin(a)*34);x.lineTo(Math.cos(a)*50,Math.sin(a)*50);x.stroke()}x.restore();if(hot)G.glow(x,f.x+d*56,f.y-56,44,'#ffffff',.8)}
      if(f.st==='stuck')x.drawImage(roots(70,34,'#2a8a40'),f.x-35,f.y-46,70,50);
      if(f.st==='hit'&&f.combo>=3)for(let k=0;k<3;k++){const a=(red?0:t*7)+k*TAU/3;G.icon(x,'estrela',f.x+Math.cos(a)*26,f.y-122+Math.sin(a)*7,13,'#ffd36b')}
      /* impactos: só imagem, a partir do que mudou */
      if(v.hp!=null&&f.hp<v.hp){const dif=v.hp-f.hp;V.hype=t+.9;G.impact(f.x,f.y-62,{col:dif>=20?'#ffd36b':LOOK[f.k].glove,force:dif>=20?2:dif>=9?1.3:dif>=4?.8:.45})}
      if(f.st==='ko'&&v.st!=='ko'&&v.st!=null){G.emit('explosao',f.x,f.y-60,{col:'#ffe9b0',size:1.4});G.hitstop(140,{zoom:.03})}
      if(v.y!=null&&v.y<FL-6&&f.y>=FL)G.emit('poeira',f.x,FL);
      if(f.st==='dash'&&v.st!=='dash')G.emit('poeira',f.x,FL);
      v.hp=f.hp;v.st=f.st;v.y=f.y},
    parry(h){if(V.hits.has(h))return;V.hits.add(h);if(h.t==='DEFESA PERFEITA!'){G.emit('brilho',h.x,h.y+55,{col:'#7fe3ff',amount:1.6});G.hitstop(90)}},
    bar:V.bar,reset(){V.pdir=null}};
  /* a torcida pula mais quando há combo em andamento */
  function S_hype(t){return Math.max(0,(V.hype||0)-t)>0?Math.abs(Math.sin(t*14)):0}
  function dirOf(e){/* o convidado recebe as entidades sem velocidade: deduz o sentido pelo movimento */
    if(e.vx)return Math.sign(e.vx);const key=e.k+e.col+Math.round(e.y),M=V.dirs||(V.dirs=new Map()),q=M.get(key)||{x:e.x,d:e.x<400?1:-1};if(Math.abs(e.x-q.x)>1)q.d=Math.sign(e.x-q.x);q.x=e.x;M.set(key,q);return q.d}
}

function rinha50(C){
  const W=800,H=450,FL=380,G=2300,o=C.room.opt||{},pvp=!!C.net,mode=pvp?'pvp':(o.m||'b3'),me=me21(C);
  const AIK={facil:{re:.5,bl:.15,pa:0,ag:.45,cb:.3},medio:{re:.3,bl:.35,pa:.08,ag:.6,cb:.6},dificil:{re:.17,bl:.55,pa:.2,ag:.72,cb:.85},pesadelo:{re:.09,bl:.75,pa:.35,ag:.85,cb:1}}[C.diff]||{re:.3,bl:.35,pa:.08,ag:.6,cb:.6};
  const rnd=mb32((C.seed^0x51a6)>>>0||3);
  /* torneio: escada de rivais */
  const tst=Math.max(0,Math.min(4,+o.st||0)),myK=pvp?(o.f||'fe'):(RFK50.includes(o.f)?o.f:'fe');
  const ladder=(()=>{const a=RFK50.filter(k=>k!==myK);const r=mb32((C.seed^0x70e)>>>0||5);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.concat(['boss'])})();
  const oppK=pvp?(o.f2||'nat'):mode==='tor'?ladder[tst]:mode==='tre'?(RFK50[(RFK50.indexOf(myK)+1)%5]):(o.o==='rnd'||!o.o?RFK50.filter(k=>k!==myK)[Math.floor(rnd()*4)]:o.o);
  const ps=pvp?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c},{u:'~p',n:RF50[oppK].n,c:-1}];
  const myI=pvp?Math.max(0,ps.findIndex(p=>p.u===C.me)):0;
  const mk=(i,k)=>{const D=RF50[k];return{i,k,D,x:i?560:240,y:FL,vy:0,vx:0,kb:0,face:i?-1:1,hp:D.hp,max:D.hp,meter:0,st:'idle',t:0,mv:null,hitDone:false,conf:false,chain:0,
    blk:false,blkT:9,inv:0,dashCd:0,spCd:0,combo:0,cdmg:0,inp:{},cnt:{},last:{},buf:null,bufT:0,hitT:0,parries:0,dmgTaken:0,clones:0,u:ps[i]?.u,n:ps[i]?.n||D.n}};
  const S={f:[mk(0,myK),mk(1,oppK)],ents:[],round:1,wins:[0,0],t:60,pause:1.8,msg:`Round 1`,sub:'',over:false,freeze:0,frz:null,sendAt:0,showHB:mode==='tre',best:0,lastCombo:null,
    stats:{combo:0,sup:0,parry:0,perfect:0},hits:[],shake:0,ai:{next:0,hold:{},t:0},tst,ladder};
  const keys={},myCnt={};
  const PRESS={KeyJ:'L',KeyK:'H',KeyL:'S',KeyH:'G',Space:'D',KeyU:'X',KeyI:'U',KeyW:'J',ArrowUp:'J'};
  function inpOf(){return{l:!!(keys.KeyA||keys.ArrowLeft),r:!!(keys.KeyD||keys.ArrowRight),b:!!(keys.KeyS||keys.ArrowDown),cnt:{...myCnt}}}
  function resetRound(){const old=S.f;S.f=[mk(0,myK),mk(1,oppK)];S.f.forEach((f,i)=>{f.meter=old[i].meter;f.last={...old[i].last};f.inp=old[i].inp;f.cnt=old[i].cnt});S.ents=[];S.t=60;S.pause=1.8;S.msg=`Round ${S.round}`;S.sub=''}
  const hurtbox=f=>({x0:f.x-24,x1:f.x+24,y0:f.y-108,y1:f.y});
  const overlap=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
  const ground=f=>f.y>=FL;
  const busy=f=>['atk','hit','bstun','dash','thrown','stuck','ko','tele'].includes(f.st);
  function start(f,k){
    const D=f.D;f.hitDone=false;f.conf=false;f.t=0;
    if(k==='L'||k==='H'){f.st='atk';f.mv={k,...RMV50[k],reach:k==='L'?D.r1:D.r2};return true}
    if(k==='G'){if(!ground(f))return false;f.st='atk';f.mv={k,...RMV50.G};return true}
    if(k==='D'){if(f.dashCd>0)return false;const back=(f.inp.r&&f.face<0)||(f.inp.l&&f.face>0)||(!f.inp.r&&!f.inp.l);f.st='dash';f.mv={dir:back?-f.face:f.face,back};f.inv=.16;f.dashCd=.55;fx5('mgJump');return true}
    if(k==='S'||k==='X'){if(f.spCd>0&&k==='S')return false;if(k==='X'){if(f.meter<100)return false;f.meter-=100}f.st='atk';f.mv={k:'SP',ex:k==='X',el:f.k==='boss'?RFK50[Math.floor(rnd()*5)]:f.k,st:.18,ac:0,rc:.38};f.spCd=.8;if(k==='X'){C.fx?.flash(f.D.col,.12);fx5('activate')}return true}
    if(k==='U'){if(f.meter<300)return false;f.meter-=300;S.freeze=.9;S.frz={f,el:f.k==='boss'?RFK50[Math.floor(rnd()*5)]:f.k};f.st='atk';f.mv={k:'SU',st:0,ac:0,rc:.5};f.inv=1.2;S.stats.sup+=f.i===myI?1:0;fx5('bb7');C.fx?.flash('#000',.5);return true}
    return false}
  function damage(a,d,dmg,o2){/* o2: {kb,stun,un (inbloqueável), proj, sup, grab} */
    if(d.st==='ko')return'miss';d.idleT=0;if(d.inv>0&&!o2.grab)return'miss';
    const facing=Math.sign(a.x-d.x)===d.face||o2.proj&&Math.sign((o2.px??a.x)-d.x)===d.face;
    const canBlock=d.blk&&ground(d)&&!busy(d)&&facing&&!o2.grab;
    if(canBlock&&d.blkT<.15&&!o2.sup){/* Defesa Perfeita */
      d.meter=Math.min(300,d.meter+25);d.parries++;if(d.i===myI){S.stats.parry++;if(d.parries>=3)C.achieve?.('ri_parry')}
      if(!o2.proj){a.st='hit';a.t=0;a.stunT=.6;a.kb=0;a.mv=null}fx5('confirm');C.fx?.flash('#fff',.2);pop(d.x,d.y-120,'DEFESA PERFEITA!','#7fe3ff',22);return'parry'}
    if(canBlock&&!o2.un){const chip=Math.max(1,Math.round(dmg*(o2.sup?.4:.2)));d.hp=Math.max(0,d.hp-chip);d.st='bstun';d.t=0;d.stunT=.18;d.kb=-d.face*(o2.kb||100)*.5;d.meter=Math.min(300,d.meter+3);a.meter=Math.min(300,a.meter+3);fx5('click');if(d.hp<=0)ko(d);return'block'}
    const inCombo=d.st==='hit'||d.st==='thrown'||d.st==='stuck';if(!inCombo){d.combo=0;d.cdmg=0}
    const sc=Math.max(.5,Math.pow(.9,d.combo));const real=Math.max(1,Math.round(dmg*sc));d.combo++;d.cdmg+=real;
    d.hp=Math.max(0,d.hp-real);d.dmgTaken+=real;d.hitT=performance.now();d.st=o2.grab?'thrown':o2.stuck?'stuck':'hit';d.t=0;d.stunT=o2.stun??.35;d.mv=null;
    const dir=Math.sign(d.x-(o2.px??a.x))||-d.face;d.kb=dir*(o2.kb||120);if(o2.launch&&ground(d)){d.vy=-520}
    a.meter=Math.min(300,a.meter+(o2.meter||8));d.meter=Math.min(300,d.meter+5);
    if(a.i===myI||mode==='tre'){if(d.combo>=5&&a.i===myI)C.achieve?.('ri_combo');S.best=Math.max(S.best,d.combo)}
    if(o2.sup&&a.i===myI)C.achieve?.('ri_supremo');
    pop(d.x,d.y-118,String(real),o2.sup?'#ffd36b':'#fff',o2.sup?28:18);S.shake=Math.min(.35,.06+real/80);
    fx5(o2.sup?'bb7':real>=10?'bb4':'bb2');if(d.hp<=0)ko(d);return'hit'}
  function ko(d){d.st='ko';d.t=0;d.vy=-420;d.kb=-d.face*240;fx5('mgLose');C.fx?.shake(10,.5)}
  function pop(x,y,t,col,sz){S.hits.push({x,y,t,col,sz,at:performance.now()})}
  /* especiais por Elemento */
  function special(f,o,ex,el){const y=f.y-70,fc=f.face;
    if(el==='fe'){S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y,vx:fc*620,w:34,h:16,dmg:ex?9:9,col:'#ffd36b',life:2});if(ex)S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y:y-36,vx:fc*700,w:34,h:16,dmg:8,col:'#fff1a8',life:2});fx5('mgCoin')}
    else if(el==='ver'){S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y:y+6,vx:fc*920,w:ex?60:40,h:ex?14:8,dmg:ex?12:8,pierce:ex,col:'#ff8fb1',life:1.4});fx5('fumble')}
    else if(el==='nat'){S.ents.push({k:'whip',o:f.i,x:f.x+fc*(40+85),y:FL-24,w:190,h:40,dmg:12,col:'#4ad46a',life:.18,delay:0,kb:260});if(ex)S.ents.push({k:'trap',o:f.i,x:o.x,y:FL-14,w:70,h:30,dmg:8,col:'#2a8a40',life:.5,delay:.35,stuck:1,stun:1.0})}
    else if(el==='ine'){f.st='tele';f.t=0;f.inv=.3;f.mv={hits:ex?2:1,dmg:ex?7:9};C.fx?.burst(f.x,f.y-60,{n:14,col:['#c58bff','#000'],sp:180,life:.4,size:3,grav:0});f.x=clamp12(o.x-o.face*-1*0-(o.x>f.x?-1:1)*60,30,W-30);f.face=o.x>f.x?1:-1;fx5('activate')}
    else if(el==='ilu'){S.ents.push({k:'clone',o:f.i,x:f.x,y:f.y,vx:fc*640,w:46,h:100,dmg:8,col:'#7fe3ff',life:.7,dist:0});if(ex)S.ents.push({k:'clone',o:f.i,x:fc>0?W+30:-30,y:f.y,vx:-fc*640,w:46,h:100,dmg:8,col:'#b6f2ff',life:1.4})}}
  function supremo(f,el){const o=S.f[1-f.i];S.stats.supN=(S.stats.supN||0);
    if(el==='fe'||el==='nat'){S.ents.push({k:'pillar',o:f.i,x:o.x,y:FL-150,w:150,h:300,dmg:el==='fe'?30:32,col:el==='fe'?'#ffd36b':'#4ad46a',life:.5,delay:.25,sup:1,kb:200,launch:1})}
    else if(el==='ine'){S.ents.push({k:'hole',o:f.i,x:W/2,y:FL-90,w:20,h:20,dmg:28,col:'#120020',life:1.1,delay:0,sup:1})}
    else if(el==='ilu'){for(let i=0;i<6;i++){const L=i%2===0;S.ents.push({k:'clone',o:f.i,x:L?-40-i*30:W+40+i*30,y:FL,vx:(L?1:-1)*720,w:46,h:100,dmg:4.5,col:'#7fe3ff',life:2,sup:1,multi:1})}}
    else{S.ents.push({k:'beam',o:f.i,x:f.face>0?(f.x+W)/2:f.x/2,y:f.y-75,w:W,h:70,dmg:30,col:'#ff8fb1',life:.6,delay:.15,sup:1,kb:260})}
    pop(W/2,150,RF50[f.k].su+'!',f.D.col,30)}
  function landHit(f,o){const m=f.mv;if(!m||f.hitDone)return;
    const r=m.reach||64,hb={x0:f.face>0?f.x+10:f.x-10-r,x1:f.face>0?f.x+10+r:f.x-10,y0:f.y+(m.y0??-90),y1:f.y+(m.y1??-30)};f.hb=hb;
    if(!overlap(hb,hurtbox(o)))return;f.hitDone=true;
    if(m.grab){if(o.st==='hit'||!ground(o)||o.inv>0)return;const res=damage(f,o,10,{grab:1,kb:-f.face*320*-1,stun:.6,meter:12});o.x=clamp12(f.x-f.face*-50,30,W-30);o.kb=f.face*360;o.vy=-380;fx5('bb5');pop(o.x,o.y-140,'AGARRÃO!','#ff9b2f',20);return}
    const res=damage(f,o,m.dmg,{kb:m.kb,stun:m.stun,meter:m.meter,launch:m.k==='H'&&!ground(f)?0:0});if(res==='hit')f.conf=true}
  function step1(f,o,dt){
    const D=f.D,inp=f.inp,now=performance.now();
    f.dashCd=Math.max(0,f.dashCd-dt);f.spCd=Math.max(0,f.spCd-dt);f.inv=Math.max(0,f.inv-dt);f.blkT+=dt;
    /* toques novos */
    const cnt=inp.cnt||{};for(const k in cnt){if((cnt[k]|0)>(f.last[k]|0)){f.last[k]=cnt[k];if(k==='J'){if(ground(f)&&!busy(f)){f.vy=-D.jv;fx5('mgJump')}}else{f.buf=k;f.bufT=.15}}}
    if(inp.b&&!f.wasB)f.blkT=0;f.wasB=!!inp.b;
    if(f.st!=='atk'&&f.st!=='dash'&&f.st!=='tele')f.face=o.x>f.x?1:-1;
    f.blk=!!inp.b&&ground(f)&&!busy(f);
    if(f.buf){f.bufT-=dt;if(f.bufT<=0)f.buf=null}
    /* cancelamento: Leve confirmado → Leve/Pesado/Especial; Pesado confirmado → Especial */
    if(f.buf&&f.st==='atk'&&f.conf&&f.mv&&f.t>=f.mv.st+f.mv.ac*.5){const m=f.mv.k,b=f.buf;
      if((m==='L'&&(b==='H'||b==='S'||b==='X'||b==='U'||(b==='L'&&f.chain<2)))||(m==='H'&&(b==='S'||b==='X'||b==='U'))){f.chain=b==='L'?f.chain+1:f.chain;f.buf=null;start(f,b)}}
    if(f.buf&&!busy(f)){const b=f.buf;f.buf=null;if(b!=='L')f.chain=0;start(f,b)}
    switch(f.st){
      case'idle':case'walk':{if(f.blk){f.st='idle';break}const mv=(inp.r?1:0)-(inp.l?1:0);f.x+=mv*D.spd*dt*(mv===f.face?1:.8);f.st=mv?'walk':'idle';break}
      case'atk':{f.t+=dt;const m=f.mv;if(!m){f.st='idle';break}
        if(m.k==='SP'&&!m.done&&f.t>=m.st){m.done=true;special(f,o,m.ex,m.el)}
        if(m.k==='SU'&&!m.done&&S.freeze<=0){m.done=true;supremo(f,S.frz?.el||f.k)}
        if(m.k==='L'||m.k==='H'||m.k==='G'){if(f.t>=m.st&&f.t<m.st+m.ac)landHit(f,o);else f.hb=null;if(!ground(f)){}}
        if(f.t>=(m.st||0)+(m.ac||0)+(m.rc||0)){f.st='idle';f.mv=null;f.hb=null;if(!f.conf)f.chain=0}
        if(ground(f))f.x+=(m.k==='H'&&f.t<m.st?f.face*60*dt:0);break}
      case'dash':{f.t+=dt;f.x+=f.mv.dir*D.spd*(f.mv.back?2:2.4)*dt;if(f.t>=.24){f.st='idle'}break}
      case'tele':{f.t+=dt;if(f.t>=.12&&f.mv.hits>0&&!f.mv.tk){f.mv.tk=1;const hb={x0:f.x-70,x1:f.x+70,y0:f.y-110,y1:f.y};if(overlap(hb,hurtbox(o)))damage(f,o,f.mv.dmg,{kb:180,stun:.4,meter:10,px:f.x});if(f.mv.hits>1){f.mv.hits--;f.mv.tk=0;f.t=.02}}
        if(f.t>=.42){f.st='idle';f.mv=null}break}
      case'hit':case'bstun':case'thrown':case'stuck':{f.t+=dt;if(f.st!=='stuck')f.x+=f.kb*dt;f.kb*=1-6*dt;if(f.t>=(f.stunT||.3)&&ground(f)){f.st='idle';if(f.combo>=2)S.lastCombo={n:f.combo,d:f.cdmg,at:performance.now()};f.combo=0}break}
      case'ko':{f.t+=dt;f.x+=f.kb*dt;f.kb*=1-3*dt;break}
    }
    f.vy+=G*dt;f.y+=f.vy*dt;if(f.y>=FL){f.y=FL;f.vy=0}f.x=clamp12(f.x,30,W-30)}
  /* IA */
  function aiThink(f,o,dt){
    const A=S.ai,hold=A.hold;if(mode==='tre'){const dm=o0.dm||'cpu';if(dm==='par'){f.inp={};return}if(dm==='blk'){f.inp={b:true};return}if(dm==='pul'){A.t-=dt;if(A.t<=0){A.t=.9;f.cnt.J=(f.cnt.J|0)+1}f.inp={cnt:f.cnt};return}}
    const press=k=>{f.cnt[k]=(f.cnt[k]|0)+1};A.next-=dt;
    const dist=Math.abs(o.x-f.x),toward=o.x>f.x?'r':'l',away=toward==='r'?'l':'r';
    /* defesa reativa (rápida) */
    const threat=(o.st==='atk'&&o.mv&&(o.mv.k==='L'||o.mv.k==='H')&&dist<(o.mv.reach||80)+50&&o.t<o.mv.st)||S.ents.some(e=>e.o===o.i&&Math.abs(e.x-f.x)<220&&Math.sign((e.vx||0))===Math.sign(f.x-e.x));
    if(threat&&!A.reacted){A.reacted=true;const r=Math.random();if(r<AIK.pa){hold.b=true;A.relB=.25;f.blkT=0}else if(r<AIK.bl){hold.b=true;A.relB=.4}else if(r<AIK.bl+.1&&f.dashCd<=0)press('D')}
    if(!threat)A.reacted=false;
    if(A.relB!=null){A.relB-=dt;if(A.relB<=0){hold.b=false;A.relB=null}}
    if(A.next<=0&&!hold.b){A.next=AIK.re*(0.6+Math.random()*.8);hold.l=hold.r=false;
      if(o.st==='hit'&&dist<f.D.r2+10&&Math.random()<AIK.cb){press(f.meter>=300&&Math.random()<.6?'U':Math.random()<.5?'H':'L');if(Math.random()<.5)setTimeout(()=>press('S'),90)}
      else if(f.meter>=300&&Math.random()<.25)press('U');
      else if(f.meter>=100&&Math.random()<.15)press('X');
      else if(dist>f.D.r2+30){const zone=f.k==='fe'||f.k==='ver'||f.k==='boss';if(zone&&Math.random()<.35)press('S');else if(f.k==='ine'&&Math.random()<.2)press('S');else if(Math.random()<AIK.ag){hold[toward]=true;if(Math.random()<.15)press('D')}else if(Math.random()<.3)press('J')}
      else{const r=Math.random();if(o.blk&&r<.35)press('G');else if(r<AIK.ag*.6)press('L');else if(r<AIK.ag)press('H');else if(r<AIK.ag+.1)press('G');else hold[away]=true}}
    f.inp={l:hold.l,r:hold.r,b:hold.b,cnt:f.cnt}}
  const o0=o;
  function sim(dt){
    if(S.over)return;
    if(S.freeze>0){S.freeze-=dt;return}
    if(S.pause>0){S.pause-=dt;if(S.pause<=0){S.msg='';S.sub=''}return}
    if(mode!=='tre')S.t-=dt;
    if(!pvp)aiThink(S.f[1],S.f[0],dt);
    S.f.forEach((f,i)=>step1(f,S.f[1-i],dt));
    const [a,b]=S.f;if(Math.abs(a.x-b.x)<46&&Math.abs(a.y-b.y)<90&&a.st!=='ko'&&b.st!=='ko'){const m=(a.x+b.x)/2,s=a.x<b.x?-1:1;a.x=clamp12(m+s*23,30,W-30);b.x=clamp12(m-s*23,30,W-30)}
    /* entidades */
    S.ents.forEach(e=>{e.life-=dt;if(e.delay>0){e.delay-=dt;return}const d=S.f[1-e.o],a=S.f[e.o];
      if(e.vx)e.x+=e.vx*dt;
      if(e.k==='hole'){if(Math.abs(d.x-e.x)<300){d.x+=Math.sign(e.x-d.x)*260*dt}if(e.life<.15&&!e.done){e.done=1;if(Math.abs(d.x-e.x)<260)damage(a,d,e.dmg,{kb:300,stun:.8,sup:1,px:e.x,launch:1});C.fx?.flash('#000',.4)}return}
      if(e.hit&&!e.multi)return;const box={x0:e.x-e.w/2,x1:e.x+e.w/2,y0:e.y-e.h/2,y1:e.y+e.h/2};
      if(e.k==='clone'&&e.multi){if(!e.hitSet)e.hitSet=0}
      if(overlap(box,hurtbox(d))&&!(e.multi&&e.hitSet)){const res=damage(a,d,e.dmg,{kb:e.kb||150,stun:e.stun||(e.sup?.5:.35),proj:1,px:e.x,sup:e.sup,stuck:e.stuck,launch:e.launch});if(res!=='miss'){e.hit=1;if(e.multi)e.hitSet=1;if(!e.pierce&&e.k!=='pillar'&&e.k!=='beam')e.life=0}}});
    /* projéteis se anulam */
    const pr=S.ents.filter(e=>e.k==='proj');pr.forEach(p=>pr.forEach(q=>{if(p.o!==q.o&&!p.dead&&!q.dead&&Math.abs(p.x-q.x)<30&&Math.abs(p.y-q.y)<30){if(!p.pierce)p.life=0;if(!q.pierce)q.life=0;C.fx?.burst(p.x,p.y,{n:10,col:['#fff',p.col],sp:160,life:.35,size:3,grav:0})}}));
    S.ents=S.ents.filter(e=>e.life>0&&e.x>-200&&e.x<W+200);
    /* treino: o boneco recupera */
    if(mode==='tre'){const d=S.f[1];if(d.st!=='hit'&&d.st!=='thrown'&&d.st!=='stuck'){d.idleT=(d.idleT||0)+dt;if(d.idleT>1.2){d.hp=d.max}}else d.idleT=0;if(d.st==='ko'){d.st='idle';d.hp=d.max;d.y=FL}S.f[0].meter=Math.min(300,S.f[0].meter+40*dt);return}
    const ko2=S.f.findIndex(f=>f.hp<=0);
    if(ko2>=0||S.t<=0){const w=ko2>=0?1-ko2:a.hp===b.hp?-1:(a.hp/a.max>b.hp/b.max?0:1);if(w>=0){S.wins[w]++;if(w===myI&&S.f[w].dmgTaken===0){S.stats.perfect++;C.achieve?.('ri_perfeito')}}
      S.msg=w<0?'Empate no round':ko2>=0?'K.O.!':'Tempo!';S.sub=w<0?'':`${S.f[w].n} vence o round`;S.pause=99;
      if(S.wins[0]>=2||S.wins[1]>=2||S.round>=5){S.over=true;setTimeout(finish,window.__riFast?0:1500);return}
      S.round++;setTimeout(()=>{if(!S.over)resetRound()},window.__riFast?0:1600)}}
  function save(won){let first=false;progPut38(p=>{p.ri=p.ri||{};p.ri.win=p.ri.win||{};if(won){p.ri.win[myK]=(p.ri.win[myK]||0)+1}if(mode==='tor'&&won&&tst===4){first=!p.ri.tor;p.ri.tor=(p.ri.tor||0)+1}if(S.best>(p.ri.best||0))p.ri.best=S.best});return first}
  function finish(){
    const ww=S.wins[0]>S.wins[1]?0:S.wins[1]>S.wins[0]?1:-1,won=ww===myI;
    if(won){C.achieve?.('campeao');if(!pvp&&C.diff==='pesadelo')C.achieve?.('gato');if(mode==='tor'&&tst===4)C.achieve?.('ri_torneio')}
    const first=pvp?false:save(won),mul=gdMul38(C.diff||'medio');
    S.rw=pvp?{ob:won?12:4,xp:won?7:2,why:won?'vitória no PvP':'luta'}:{ob:won?Math.round((mode==='tor'?(tst===4?45:8+tst*3):12)*mul+(first?20:0)):2,why:[RF50[myK].n,mode==='tor'?`luta ${tst+1}/5`:'',won?'vitória':'derrota'].filter(Boolean).join(' · ')};if(!S.rw.xp)S.rw.xp=Math.round(S.rw.ob*.6);
    const rows=[0,1].map(i=>({u:ps[i].u,n:ps[i].n,c:ps[i].c<0?0:ps[i].c,s:S.wins[i],w:i===ww}));
    const title=ww<0?'Empate na Rinha':pvp?`Vitória de ${ps[ww].n} · ${S.wins[ww]} × ${S.wins[1-ww]}`:mode==='tor'?(won?(tst===4?'👑 Você é o Campeão do Torneio!':`🏆 Luta ${tst+1}/5 vencida · ${S.wins[0]} × ${S.wins[1]}`):`O Torneio acabou na luta ${tst+1}/5`):won?`Você venceu ${RF50[oppK].n}! ${S.wins[0]} × ${S.wins[1]}`:`${RF50[oppK].n} venceu · ${S.wins[1]} × ${S.wins[0]}`;
    if(pvp)C.send('rs',{st:snap()});
    C.finish({title,rows,unit:'rounds',html:`<ul class="r38-l"><li>🥊 ${esc(RF50[myK].n)} × ${esc(RF50[oppK].n)}</li><li>🔗 Maior combo: <b>${S.best}</b> golpes</li><li>🛡 Defesas Perfeitas: <b>${S.stats.parry}</b></li><li>🌟 Supremos: <b>${S.stats.sup}</b></li></ul>${mode==='tor'&&won&&tst<4?`<p class="r38-hi">Próxima luta: ${esc(RF50[ladder[tst+1]].n)}${tst+1===4?' (chefe final)':''}.</p>`:''}`})}
  const snap=()=>({f:S.f.map(f=>({x:Math.round(f.x),y:Math.round(f.y),face:f.face,hp:f.hp,meter:Math.round(f.meter),st:f.st,t:+f.t.toFixed(2),mv:f.mv&&{k:f.mv.k,reach:f.mv.reach,st:f.mv.st,ac:f.mv.ac},blk:f.blk,inv:+f.inv.toFixed(2),combo:f.combo,cdmg:f.cdmg})),ents:S.ents.map(e=>({k:e.k,x:Math.round(e.x),y:Math.round(e.y),w:e.w,h:e.h,col:e.col,delay:e.delay>0?1:0,life:+e.life.toFixed(2)})),wins:S.wins,round:S.round,t:+S.t.toFixed(1),msg:S.msg,sub:S.sub,over:S.over,freeze:+S.freeze.toFixed(2),frz:S.frz&&{i:S.frz.f.i,el:S.frz.el},hits:S.hits.slice(-6).map(h=>({...h,at:0}))});
  function sendInp(){const i=inpOf();if(C.host||!pvp)S.f[myI].inp=i;else C.send('ri',{inp:i})}
  function exitTraining(){if(mode!=='tre'||S.over)return;S.over=true;S.rw={ob:0,xp:2,why:'treino'};progPut38(p=>{p.ri=p.ri||{};if(S.best>(p.ri.best||0))p.ri.best=S.best});C.finish({title:`🎯 Treino encerrado · maior combo ${S.best} golpes`,rows:[{u:C.me,n:me.n,c:me.c,s:0,w:false}],unit:'rounds'})}
  const GX=window.GFX60,art=riArt50(oppK);GX.skin({acc:art.ST.acc});
  return{g60intro:{title:'Rinha de Tulpas',sub:`${RF50[myK].n} × ${RF50[oppK].n}`,acc:art.ST.acc},st:()=>S,start:(i,k)=>start(S.f[i],k),damage:(a,d,dmg,o2)=>damage(S.f[a],S.f[d],dmg,o2||{}),press(k){myCnt[k]=(myCnt[k]|0)+1;sendInp()},
    reward:()=>S.rw||null,
    next(){if(pvp)return null;if(mode==='tor'){const won=S.wins[0]>S.wins[1];if(won&&tst<4)return{opt:{m:'tor',st:String(tst+1)},label:`Luta ${tst+2}/5: ${RF50[ladder[tst+1]].n}`};if(!won)return{opt:{m:'tor',st:String(tst)},label:'Tentar a luta de novo'};return null}return{opt:{},label:'Revanche'}},
    key(code,down){const was=!!keys[code];keys[code]=down;if(down&&!was){if(PRESS[code])myCnt[PRESS[code]]=(myCnt[PRESS[code]]|0)+1;if(code==='KeyT')S.showHB=!S.showHB;if(code==='KeyQ'||code==='Escape')exitTraining()}sendInp()},
    ptr(t,px,py){if(t==='down'&&mode==='tre'&&px>W-130&&py<34)exitTraining()},
    msg(p){if(C.host&&p.t==='ri'){const i=ps.findIndex(q=>q.u===p.from);if(i>=0)S.f[i].inp=p.inp||{}}
      if(!C.host&&p.t==='rs'&&p.from===C.room.host&&p.st){const st=p.st;st.f.forEach((g,i)=>{const f=S.f[i];if(g.hp<f.hp)f.hitT=performance.now();
          /* guarda a posição como alvo e desliza até ela (antes pulava de 70 em 70 ms); salto grande (novo round) vai direto */
          const x0=f.x,y0=f.y,had=f.tx!=null;Object.assign(f,g);f.tx=g.x;f.ty=g.y;if(had&&Math.hypot(x0-g.x,y0-g.y)<150){f.x=x0;f.y=y0}});S.ents=st.ents;S.wins=st.wins;S.round=st.round;S.t=st.t;S.msg=st.msg;S.sub=st.sub;S.over=st.over;S.freeze=st.freeze;S.frz=st.frz?{f:S.f[st.frz.i],el:st.frz.el}:null}},
    left(u){if(!C.host||S.over)return;const i=ps.findIndex(q=>q.u===u);if(i<0)return;S.f[i].hp=0;S.wins[1-i]=2;S.over=true;C.finish({title:`${ps[i].n} saiu · vitória de ${ps[1-i].n}`,rows:ps.map((p,k)=>({u:p.u,n:p.n,c:p.c<0?0:p.c,s:S.wins[k],w:k!==i}))})},
    step(dt){if(Date.now()<C.t0)return;
      if(C.host||!pvp){sim(dt);if(pvp&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('rs',{st:snap()})}}
      else{S.ents.forEach(e=>{if(e.vx)e.x+=e.vx*dt});
        /* convidado: o próprio lutador anda na hora (predição); o resto desliza até a posição do anfitrião */
        const k=Math.min(1,dt*16),mine=S.f[myI],I=inpOf()||{};
        S.f.forEach(f=>{if(f.tx==null)return;
          if(f===mine&&(f.st==='idle'||f.st==='walk')&&!I.b&&f.D){const mv=(I.r?1:0)-(I.l?1:0);if(mv){f.x=clamp12(f.x+mv*f.D.spd*dt*(mv===f.face?1:.8),30,W-30);if(Math.abs(f.x-f.tx)>70)f.x+=(f.tx-f.x)*k;f.y+=(f.ty-f.y)*k;return}}
          f.x+=(f.tx-f.x)*k;f.y+=(f.ty-f.y)*k})}
      const m=S.f[myI];C.hud(GX.chips([mode==='tor'&&{icon:'trofeu',label:'Torneio',value:`${tst+1}/5`},mode==='tre'&&{icon:'alvo',label:'Treino'},{icon:'bandeira',label:'Round',value:S.round},{icon:'estrela',label:'Placar',value:`${S.wins[0]} × ${S.wins[1]}`},{icon:'relogio',value:mode==='tre'?'∞':Math.max(0,Math.ceil(S.t))},{icon:'raio',label:'Essência',value:`${Math.floor(m.meter/100)}/3`},m.meter>=300?{icon:'coroa',label:'SUPREMO (I)',tone:'warn'}:m.meter>=100?{icon:'chama',label:'EX (U)',tone:'ok'}:null]))},
    draw(x){
      const now=performance.now(),t=now/1000,red=GX.reduced(),sh=S.shake>0?(S.shake-=1/60,red?0:Math.sin(now/15)*S.shake*20):0;
      x.save();x.translate(sh,0);
      art.background(x,(S.f[0].x+S.f[1].x)/2,t);
      S.ents.forEach(e=>{art.entity(x,e,S.f,now);
        if(S.showHB&&!(e.delay>0)){x.strokeStyle='#ff4040';x.lineWidth=1.5;x.strokeRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h)}});
      S.f.forEach((f,i)=>{art.fighter(x,f,i,now);
        if(S.showHB){const hb=hurtbox(f);x.strokeStyle='#40ff80';x.lineWidth=1.5;x.strokeRect(hb.x0,hb.y0,hb.x1-hb.x0,hb.y1-hb.y0);if(f.st==='atk'&&f.mv&&f.mv.reach&&f.t>=f.mv.st&&f.t<f.mv.st+f.mv.ac){const r=f.mv.reach;const a={x0:f.face>0?f.x+10:f.x-10-r,x1:f.face>0?f.x+10+r:f.x-10,y0:f.y+(f.mv.y0??-90),y1:f.y+(f.mv.y1??-30)};x.strokeStyle='#ff4040';x.strokeRect(a.x0,a.y0,a.x1-a.x0,a.y1-a.y0)}}
        if(i===myI&&pvp)GX.hud.chip(x,f.x,f.y-128,{icon:'seta',text:'você',col:'#ffd36b',size:11,al:'center',min:9})});
      x.restore();
      GX.vignette(x,W,H,{a:.45});
      /* barras */
      S.f.forEach((f,i)=>{const D=RF50[f.k],L=art.LOOK[f.k],v=f.hp/f.max,bw=292,bx=i?W-70-bw:70,col=v<.28?'#ffb02a':i?'#ff6b5b':'#7dffa8';
        art.bar[i]=v>art.bar[i]?v:art.bar[i]+(v-art.bar[i])*.05;
        const plate=(X,Y,w,h,sk)=>{x.beginPath();if(i){x.moveTo(X+sk,Y);x.lineTo(X+w,Y);x.lineTo(X+w,Y+h);x.lineTo(X,Y+h)}else{x.moveTo(X,Y);x.lineTo(X+w-sk,Y);x.lineTo(X+w,Y+h);x.lineTo(X,Y+h)}x.closePath()};
        plate(bx-6,11,bw+12,26,14);x.fillStyle='rgba(8,4,14,.85)';x.fill();x.strokeStyle=GX.rgba(L.glove,.8);x.lineWidth=1.6;x.stroke();
        x.save();plate(bx,15,bw,18,10);x.clip();x.fillStyle='#3a0a10';x.fillRect(bx,15,bw,18);
        const fill=(k,c2)=>{x.fillStyle=c2;x.fillRect(i?bx+bw*(1-k):bx,15,bw*k,18)};fill(art.bar[i],'rgba(255,255,255,.6)');fill(v,col);x.fillStyle='rgba(255,255,255,.32)';x.fillRect(bx,15,bw,5);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(bx,28,bw,5);x.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<10;k++)x.fillRect(bx+bw*k/10,15,1.2,18);x.restore();
        for(let k=0;k<3;k++){const sw=bw*.8/3,sx=i?bx+bw-(k+1)*sw:bx+k*sw,m=clamp12(f.meter-k*100,0,100)/100;x.fillStyle='rgba(8,4,14,.85)';rr21(x,sx+1,39,sw-3,11,4);x.fill();x.fillStyle=m>=1?(f.meter>=300?'#ffd36b':'#c39bff'):'#6b4fa0';if(m>0){rr21(x,i?sx+3+(sw-7)*(1-m):sx+3,41,(sw-7)*m,7,3);x.fill()}x.strokeStyle=m>=1?'rgba(255,255,255,.75)':'rgba(255,255,255,.18)';x.lineWidth=1;rr21(x,sx+1,39,sw-3,11,4);x.stroke();if(m>=1&&!red)GX.glow(x,sx+sw/2,44,26,f.meter>=300?'#ffd36b':'#c39bff',.25+.15*Math.sin(t*7+k),{sy:.5})}
        x.drawImage(art.portrait(f.k),i?W-62:10,8,52,52);
        GX.hud.text(x,(pvp||i===0?ps[i].n:D.n).slice(0,18),i?W-70:70,64,{size:13,al:i?'right':'left',col:i?'#ffd8d0':'#d8ffe4',max:210,min:10});
        for(let k=0;k<Math.max(2,S.wins[i]);k++){const px=i?W-18-k*20:18+k*20,won=k<S.wins[i];if(won)GX.glow(x,px,80,16,'#ffd36b',.5);GX.icon(x,'estrela',px,80,17,won?'#ffd36b':'rgba(244,234,214,.28)')}});
      const tl=mode==='tre'?'∞':String(Math.max(0,Math.ceil(S.t)));x.beginPath();x.arc(W/2,28,23,0,TAU16);x.fillStyle='rgba(8,4,14,.88)';x.fill();x.strokeStyle=mode!=='tre'&&S.t<=10?'#ff6b5b':art.ST.acc;x.lineWidth=2.5;x.stroke();if(mode!=='tre'){x.strokeStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(W/2,28,19,-Math.PI/2,-Math.PI/2+TAU16*clamp12(S.t/60,0,1));x.stroke()}
      GX.hud.text(x,tl,W/2,29,{size:22,al:'center',w:900,col:mode!=='tre'&&S.t<=10?'#ff9a8a':'#fff',min:12,stroke:0,max:34});
      if(mode==='tre'){x.fillStyle='rgba(20,10,26,.92)';rr21(x,W-128,4,120,26,8);x.fill();x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.stroke();GX.icon(x,'bandeira',W-115,17,13,'#ffd36b');GX.hud.text(x,'Encerrar (Q)',W-62,18,{size:12,al:'center',max:92,stroke:0,min:9});GX.hud.chip(x,W/2,100,{icon:'alvo',text:`Hitboxes: ${S.showHB?'sim':'não'} (T) · maior combo ${S.best}`,col:'#c9b995',size:12,al:'center',min:10})}
      const lc=S.lastCombo,cf=S.f.find(f=>f.combo>=2);
      if(cf){const X=cf.i?150:W-150,pop=1+(red?0:Math.max(0,.3-(now-cf.hitT)/500));GX.hud.text(x,`${cf.combo} GOLPES`,X,mode==='tre'?136:114,{size:24*pop,al:'center',w:900,col:'#ffd36b',stroke:5});GX.hud.text(x,`${cf.cdmg} de dano`,X,mode==='tre'?162:140,{size:14,al:'center',w:800,stroke:4})}
      else if(lc&&now-lc.at<1500)GX.hud.text(x,`${lc.n} GOLPES · ${lc.d} de dano`,W/2,124,{size:18,al:'center',w:900,col:'#ffd36b',stroke:4});
      S.hits=S.hits.filter(h=>now-h.at<800||!h.at);S.hits.forEach(h=>{art.parry(h);if(!h.at)h.at=now;const k=(now-h.at)/800;x.globalAlpha=1-k;GX.hud.text(x,h.t,clamp12(h.x,90,W-90),h.y-k*30,{size:h.sz*(red?1:1+Math.max(0,.4-k*3)),al:'center',w:900,col:h.col,stroke:5});x.globalAlpha=1});
      if(S.freeze>0&&S.frz){const f=S.frz.f,D=RF50[f.k],L=art.LOOK[f.k],k=clamp12((.9-S.freeze)/.22,0,1),side=S.frz.f.i?-1:1;x.fillStyle='rgba(4,2,10,.78)';x.fillRect(0,0,W,H);
        x.save();x.beginPath();x.moveTo(0,H/2-62);x.lineTo(W,H/2-88);x.lineTo(W,H/2+66);x.lineTo(0,H/2+92);x.closePath();x.fillStyle=GX.rgba(D.col,.28);x.fill();x.clip();
        for(let i=0;i<22;i++){const y=H/2-90+((i*47)%182),len=80+(i*53)%220,X=((i*191+(red?0:t*1700))%(W+len))-len;x.fillStyle=GX.rgba(i%3?'#ffffff':D.col,.35);x.fillRect(side>0?X:W-X-len,y,len,2+(i%3))}x.restore();
        const px=W/2-side*(250+(1-k)*(red?0:240)),img=art.portrait(f.k);GX.glow(x,px,H/2,150,D.col,.7);GX.rays(x,px,H/2,{n:11,len:210,col:L.glove,a:.2,t:t*2});GX.draw(x,img,px,H/2,{w:150,h:150});
        const tx=W/2+side*90;GX.hud.text(x,'SUPREMO',tx,H/2-30,{size:20,al:'center',w:900,col:'#fff',stroke:4});GX.hud.text(x,D.su,tx,H/2+14,{size:38,al:'center',w:900,col:D.col,stroke:7,max:430})}
      if(Date.now()>=C.t0){if(S.msg){const koMsg=S.msg==='K.O.!';if(koMsg)GX.rays(x,W/2,H/2-40,{n:14,len:320,col:'#ffd36b',a:.14,t:t*2});GX.hud.banner(x,W,H,S.msg,{sub:S.sub||(mode==='tor'&&S.round===1&&S.pause>1?`Luta ${tst+1}/5 · ${RF50[myK].n} × ${RF50[oppK].n}`:S.msg.startsWith('Round')?art.ST.name:''),acc:'#ffd36b',y:H*.38})}
        else if(S.sub)GX.hud.text(x,S.sub,W/2,H/2-18,{size:18,al:'center',w:800,stroke:4})}
      GX.hud.frame(x,W,H,{acc:art.ST.acc,a:.5});
    }
  };
}
Object.assign(ACH,{
  ri_parry:{ico:'🛡',n:'Defesa Perfeita',d:'Faça 3 Defesas Perfeitas numa mesma luta da Rinha.'},
  ri_supremo:{ico:'🌟',n:'Supremo!',d:'Acerte um Especial Supremo na Rinha.'},
  ri_combo:{ico:'🔗',n:'Corrente Elemental',d:'Acerte um combo de 5 golpes na Rinha.'},
  ri_torneio:{ico:'👑',n:'Campeão do Torneio',d:'Vença o Perseus Supremo no Torneio da Rinha.'},
  ri_perfeito:{ico:'✨',n:'Round Perfeito',d:'Vença um round da Rinha sem levar dano.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='ri50')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}${b('KeyW','⤒','','Pular')}${b('KeyS','🛡','','Defender')}</div><div>${b('KeyJ','👊','','Golpe Leve')}${b('KeyK','💥','','Golpe Pesado')}${b('KeyL','✦','','Especial')}${b('KeyH','✋','','Agarrão')}</div><div>${b('Space','💨','','Dash')}${b('KeyU','⚡','','Especial EX')}${b('KeyI','🌟','','Supremo')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('rinha',{...GAMES12.rinha,make:rinha50,setup:riSetup50,pad:'ri50',
  desc:'Luta 2D com 5 lutadores elementais: golpes leve e pesado, agarrão, dash, Defesa Perfeita, Especiais EX e Supremos. Melhor de 3, Torneio, Treino e PvP.',
  rule:'Vença 2 rounds. A Barra de Essência tem 3 níveis: 1 para o Especial EX, 3 para o Supremo.',
  keys:'A/D · W pula · S defende · J leve · K pesado · L especial · H agarrão · Espaço dash · U EX · I Supremo',touch:'Use os botões'});
console.info('[Tulpa] Etapa 50 carregada (Rinha 2.0)');

/* ===================================================================
   TULPA · ETAPA 51 — 🕹 ARCADE 2.0 · ONDA 7 (parte 2)
   🗝 O LABIRINTO DO ABISMO 2.0 — roguelike em 4 andares
   Porão → Catacumbas → Plano Astral → Núcleo do Véu. Salas de Combate,
   Tesouro (1 mutação garantida), Loja de Óbolos da run, Sala do Pacto
   (troca Vital máximo por poderes absurdos), Sala Secreta (abra com
   bombas) e Sala do Chefe (alçapão para o próximo andar).
   35 Mutações acumuláveis que mudam os tiros de verdade, Itens Ativos
   (recarregam ao limpar salas) e consumíveis (bombas, chaves, corações,
   Escudos de Lucidez). Co-op 2: masmorra compartilhada, reviver o
   colega segurando F perto dele e chefes com mais vida.
   =================================================================== */
const ABF51=[{n:'Porão',fl:'#2a2024',wl:'#3d2b33',bk:'#1a1214',boss:'Rei das Moscas'},{n:'Catacumbas',fl:'#24222a',wl:'#3a3848',bk:'#141218',boss:'Guardião Ossudo'},{n:'Plano Astral',fl:'#1c1830',wl:'#33285a',bk:'#0e0a1c',boss:'Olho Astral'},{n:'Núcleo do Véu',fl:'#2a1020',wl:'#4a1a34',bk:'#160810',boss:'Perseus do Véu'}];
const MUT51=[
  ['tri','Olho da Fé','✶','Tiro triplo',p=>p.f.tri=1],
  ['homing','Lágrimas Teleguiadas','🧿','Os tiros perseguem inimigos',p=>p.f.homing=1],
  ['pierce','Véu da Inexistência','◐','Tiros perfurantes',p=>p.f.pierce=1],
  ['explo','Lágrimas Explosivas','💥','Os tiros explodem ao acertar',p=>p.f.explo=1],
  ['beam','Raio Contínuo de Fé','🔆','Troca os tiros por um raio contínuo',p=>p.f.beam=1],
  ['orbit','Orbitais Protetores','🪐','Dois orbes giram e bloqueiam tiros',p=>p.f.orb=(p.f.orb||0)+2],
  ['boom','Bumerangue','🪃','Os tiros voltam',p=>p.f.boom=1],
  ['split','Lágrima que Divide','✳','Ao acertar, o tiro se divide em dois',p=>p.f.split=1],
  ['dmg','Lágrima da Verdade','👁','+1 de dano',p=>p.dmg+=1],
  ['spd','Asas da Ilusão','🌀','+20% de velocidade',p=>p.spd*=1.2],
  ['rate','Pressa Mística','⚡','Atira mais rápido',p=>p.rate*=.72],
  ['range','Visão Longa','🔭','Tiros vão mais longe',p=>p.range*=1.4],
  ['hp','Coração da Natureza','🌿','+1 coração e cura total',p=>{p.max+=2;p.hp=p.max}],
  ['cross','Cruz Teosófica','✚','Também atira para trás',p=>p.f.back=1],
  ['wave','Onda do Véu','〰','Tiros ondulam',p=>p.f.wave=1],
  ['big','Lágrima Gigante','🔴','Tiros maiores e mais fortes, mais lentos',p=>{p.f.big=1;p.dmg+=.8;p.shot*=.85}],
  ['chain','Corrente Elétrica','🌩','O acerto salta para outro inimigo',p=>p.f.chain=1],
  ['poison','Veneno da Natureza','☠','Envenena (dano contínuo)',p=>p.f.poison=1],
  ['slow','Gelo da Inexistência','❄','Deixa os inimigos lentos',p=>p.f.slow=1],
  ['knock','Empurrão Astral','💨','Empurra os inimigos',p=>p.f.knock=1],
  ['crit','Golpe Crítico','🎯','10% de chance de dano triplo',p=>p.f.crit=1],
  ['vamp','Vampirismo','🩸','Cura meio coração a cada 12 abates',p=>p.f.vamp=1],
  ['luck','Trevo da Sorte','🍀','Mais Óbolos e itens caindo',p=>p.f.luck=(p.f.luck||0)+1],
  ['shield','Escudo da Fé','🛡','+2 Escudos de Lucidez',p=>p.sh+=2],
  ['thorn','Espinhos','🌵','Quem encosta em você leva dano',p=>p.f.thorn=1],
  ['dash','Passo Etéreo','👣','Shift: dash invencível',p=>p.f.dash=1],
  ['magnet','Ímã de Óbolos','🧲','Atrai moedas e itens',p=>p.f.magnet=1],
  ['ghost','Corpo Fantasma','👻','Atravessa pedras',p=>p.f.ghost=1],
  ['double','Tiro Duplo','‖','Dois tiros paralelos',p=>p.f.double=1],
  ['spectral','Lágrimas Espectrais','💫','Tiros atravessam pedras',p=>p.f.spectral=1],
  ['coin','Moeda da Sorte','🪙','+8 Óbolos e desconto na loja',p=>{p.coins+=8;p.f.disc=1}],
  ['bombs','Bombas Grandes','💣','+5 bombas e explosão maior',p=>{p.bombs+=5;p.f.bigb=1}],
  ['keys','Chaveiro','🗝','+3 chaves',p=>p.keys+=3],
  ['eye','Mapa Interior','🗺','Revela o mapa de cada andar',p=>p.f.map=1],
  ['ring','Anel do Sol','☀','Solta um anel de fogo a cada 4 s',p=>p.f.ring=1],
];
const ACT51={livro:{n:'Livro da Fé',ico:'📖',max:3,d:'3 s invencível'},solar:{n:'Bomba Solar',ico:'🌞',max:2,d:'fere todos na sala'},vela:{n:'Vela da Ilusão',ico:'🕯',max:3,d:'uma isca atrai os inimigos'},ampulheta:{n:'Ampulheta',ico:'⏳',max:3,d:'inimigos lentos por 5 s'},sino:{n:'Sino da Verdade',ico:'🔔',max:4,d:'cura 1 coração e revela o mapa'}};
const ACTK51=Object.keys(ACT51),PACT51=['beam','orbit','homing','tri','explo','split','pierce','chain','double','ring'];
function abGen51(seed,fl){
  const rnd=mb32(((seed>>>0)^Math.imul(fl+1,0x2c1b3c6d))>>>0||9),R=n=>Math.floor(rnd()*n),K=(x,y)=>x+','+y,rooms={};
  const want=8+fl*2;rooms[K(3,3)]={x:3,y:3,kind:'start'};let tries=0;
  while(Object.keys(rooms).length<want&&tries++<4000){const keys=Object.keys(rooms),b=rooms[keys[R(keys.length)]];const[dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]][R(4)],nx=b.x+dx,ny=b.y+dy;
    if(nx<0||ny<0||nx>6||ny>6||rooms[K(nx,ny)])continue;const nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>rooms[K(nx+a,ny+c)]).length;if(nb>1&&rnd()<.7)continue;rooms[K(nx,ny)]={x:nx,y:ny,kind:'fight'}}
  const list=Object.values(rooms),deg=r=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>rooms[K(r.x+a,r.y+c)]).length;
  const dist=r=>{/* BFS do início */const d={};d[K(3,3)]=0;const q=[rooms[K(3,3)]];for(let i=0;i<q.length;i++){const c=q[i];for(const[a,b2]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=rooms[K(c.x+a,c.y+b2)];if(n&&!(K(n.x,n.y)in d)){d[K(n.x,n.y)]=d[K(c.x,c.y)]+1;q.push(n)}}}return d[K(r.x,r.y)]};
  const ends=list.filter(r=>r.kind==='fight'&&deg(r)===1).sort((a,b)=>dist(b)-dist(a));
  const pickEnd=k=>{const r=ends.shift()||list.filter(q=>q.kind==='fight').sort((a,b)=>dist(b)-dist(a))[0];if(r)r.kind=k;return r};
  pickEnd('boss');pickEnd('treasure');pickEnd('shop');if(fl>=1||rnd()<.5)pickEnd('pact');
  /* sala secreta: vizinha de 2+ salas, sem porta até explodir */
  let sec=null;for(let t=0;t<300&&!sec;t++){const x=R(7),y=R(7);if(rooms[K(x,y)])continue;const nbs=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b2])=>rooms[K(x+a,y+b2)]).filter(r=>r&&r.kind!=='boss');if(nbs.length>=2||(t>200&&nbs.length>=1))sec={x,y,kind:'secret',hidden:true}}
  if(sec)rooms[K(sec.x,sec.y)]=sec;
  Object.values(rooms).forEach(r=>{r.rocks=[];r.clear=['start','treasure','shop','pact','secret'].includes(r.kind);r.seen=r.kind==='start';r.drops=[];r.peds=[];
    if(r.kind==='fight'){const n=R(5);for(let i=0;i<n;i++){const ax=170+R(460),ay=110+R(230);if(Math.hypot(ax-400,ay-225)>90&&Math.abs(ax-400)>40&&Math.abs(ay-225)>30)r.rocks.push({x:ax,y:ay,r:18+R(10)})}}
    r.locked=r.kind==='treasure'&&fl>=1;r.seed=R(1e9)});
  return{rooms,K,sec}
}
T3.abGen51=abGen51;T3.MUT51i=k=>MUT51.findIndex(m=>m[0]===k);
function abProg51(){const p=prog38().ab||{};return{deep:p.deep||0,wins:p.wins||0,muts:p.muts||{}}}
const abSetup51={
  intro:o=>o._m==='pvp'?'Co-op: a masmorra é a mesma para os dois. Itens no pedestal são de quem pegar primeiro. Caiu? O colega revive você segurando F por perto.':'Desça os 4 andares do Abismo. Cada run é diferente: junte mutações e crie sinergias.',
  def:()=>({m:'run'}),
  fields:o=>{const p=abProg51();return[{k:'m',l:'Run',opts:[{v:'run',n:'Run nova',ico:'🗝',d:'Uma masmorra sorteada.',badge:p.wins?`🏆 ×${p.wins}`:p.deep?`andar ${p.deep}`:''},{v:'day',n:'Desafio do Dia',ico:'📅',d:'A mesma masmorra para todos hoje.'}]}]},
  fix:o=>{if(!['run','day'].includes(o.m))o.m='run'},
  sum:o=>`WASD anda · setas ou mouse atiram · E solta bomba · Espaço usa o Item Ativo · Shift dash (com Passo Etéreo)${o._m==='pvp'?' · F (segurar) revive o colega':''}. Mutações descobertas: ${Object.keys(abProg51().muts).length}/${MUT51.length}.`
};

/* ---------- 🎨 arte do Abismo (somente visual: não toca RNG da run, hitboxes, rede nem a predição) ---------- */
function abArt51(){
  const G=window.GFX60,W=800,H=450,WL=34,DOOR=80,TAU=Math.PI*2,poly=G.poly;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const ring=(g,X,Y,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const radial=(g,X,Y,R,c,a)=>{const q=g.createRadialGradient(X,Y,0,X,Y,R);q.addColorStop(0,G.rgba(c,a));q.addColorStop(1,G.rgba(c,0));g.fillStyle=q;g.fillRect(X-R,Y-R,R*2,R*2)};
  const TH=[
    {acc:'#e8a860',tile:'madeira',fa:'#4a3430',fb:'#180c0a',wa:'#6a4a50',mo:'#1a0e12',rock:'#7a6268',light:'#ffb060',dark:.46,amb:'poeira',ac:'#d8c0a8'},
    {acc:'#c8c4e8',tile:'pedra',fa:'#3a3846',fb:'#141218',wa:'#5c5a74',mo:'#121018',rock:'#8a869c',light:'#8ac8ff',dark:.5,amb:'poeira',ac:'#c8c8e8'},
    {acc:'#b9a6ff',tile:'runa',fa:'#1c1436',fb:'#8a6ae0',wa:'#4a3484',mo:'#0c0620',rock:'#6a50b0',light:'#b48cff',dark:.44,amb:'motes',ac:'#c5b0ff'},
    {acc:'#ff6a8a',tile:'cristal',fa:'#32101e',fb:'#8a2a4a',wa:'#6a1c3c',mo:'#16040c',rock:'#8a3454',light:'#ff5a7a',dark:.48,amb:'brasas',ac:'#ff7a6a'}];
  const KINDC={boss:['#ff3a4a','caveira'],treasure:['#ffd36b','estrela'],shop:['#7dffa8','moeda'],pact:['#e0203a','chama'],secret:['#9fe8ff','olho']};
  const TORCH=[[WL+10,WL+10],[W-WL-10,WL+10],[WL+10,H-WL-10],[W-WL-10,H-WL-10]];
  /* ===== sala (chão, paredes e enfeites fixos, a partir de uma semente só da arte) ===== */
  const room=(fl,kind,seed)=>G.bake(`ab:room:${fl}:${kind}:${seed%9973}`,W,H,(g,w,h,r)=>{
    const T=TH[fl];box(g,0,0,W,H,T.mo);
    G.fillTile(g,G.tile(T.tile,{size:78,a:T.fa,b:T.fb,seed:fl+2}),WL,WL,W-WL*2,H-WL*2);
    if(fl===2){g.fillStyle='rgba(8,4,24,.45)';g.fillRect(WL,WL,W-WL*2,H-WL*2)}
    for(let i=0;i<14;i++)radial(g,WL+r()*(W-WL*2),WL+r()*(H-WL*2),30+r()*70,r()<.65?'#000000':T.acc,r()<.65?.32:.08);
    const rx=()=>WL+30+r()*(W-WL*2-60),ry=()=>WL+30+r()*(H-WL*2-60);
    for(let i=0;i<6;i++){let X=rx(),Y=ry();const p=[[X,Y]];for(let k=0;k<4;k++){X+=(r()-.5)*34;Y+=(r()-.5)*28;p.push([X,Y])}line(g,p,'rgba(0,0,0,.45)',1.6)}
    for(let i=0;i<9;i++){const X=rx(),Y=ry(),a=r()*TAU;
      if(fl===0){if(i<5){ell(g,X,Y,7+r()*12,4+r()*8,'rgba(60,8,12,.4)',a);disc(g,X+14,Y+4,2.2,'rgba(60,8,12,.45)')}else line(g,[[X,Y],[X+Math.cos(a)*12,Y+Math.sin(a)*12]],'rgba(190,150,110,.35)',2)}
      else if(fl===1){if(i<4){ell(g,X,Y,8,7,'rgba(215,205,180,.5)');disc(g,X-3,Y,2,'#1a1418');disc(g,X+3,Y,2,'#1a1418');box(g,X-3,Y+4,6,4,'rgba(215,205,180,.45)')}else{const u=Math.cos(a)*10,v=Math.sin(a)*10;line(g,[[X-u,Y-v],[X+u,Y+v]],'rgba(215,205,180,.45)',3.4);[[X-u,Y-v],[X+u,Y+v]].forEach(([P,Q])=>disc(g,P,Q,3,'rgba(215,205,180,.45)'))}}
      else if(fl===2){radial(g,X,Y,16,'#c8a8ff',.45);disc(g,X,Y,1.6,'#ffffff');if(i<3){ring(g,X,Y,16+r()*14,'rgba(185,166,255,.22)',1.4)}}
      else{let u=X,v=Y;const p=[[u,v]];for(let k=0;k<5;k++){u+=Math.cos(a+(r()-.5))*13;v+=Math.sin(a+(r()-.5))*13;p.push([u,v])}line(g,p,'rgba(210,40,80,.45)',3);line(g,p,'rgba(255,160,180,.4)',1)}}
    /* marca da sala especial */
    const cx=W/2,cy=H/2;
    if(kind==='pact'){radial(g,cx,cy,190,'#a00010',.45);g.strokeStyle='rgba(255,50,60,.55)';g.lineWidth=3;ring(g,cx,cy,120,'rgba(255,50,60,.55)',3);ring(g,cx,cy,104,'rgba(255,50,60,.3)',1.4);const pt=i=>[cx+Math.cos(-Math.PI/2+i*TAU*2/5)*104,cy+Math.sin(-Math.PI/2+i*TAU*2/5)*104];line(g,[0,1,2,3,4,5].map(pt),'rgba(255,50,60,.5)',2.4)}
    else if(kind==='shop'){box(g,150,cy-48,500,96,'rgba(110,30,36,.75)',10);g.strokeStyle='#d8a83c';g.lineWidth=2.5;g.strokeRect(160,cy-40,480,80);for(let X=162;X<640;X+=16){g.fillStyle='#d8a83c';g.fillRect(X,cy-56,3,8);g.fillRect(X,cy+48,3,8)}}
    else if(kind==='treasure'){radial(g,cx,cy,170,'#ffd36b',.28);ring(g,cx,cy,74,'rgba(255,211,107,.6)',3);ring(g,cx,cy,58,'rgba(255,211,107,.3)',1.4);for(let i=0;i<12;i++){const a=i*TAU/12;line(g,[[cx+Math.cos(a)*78,cy+Math.sin(a)*78],[cx+Math.cos(a)*94,cy+Math.sin(a)*94]],'rgba(255,211,107,.5)',2)}}
    else if(kind==='boss'){radial(g,cx,cy,260,'#8a0a20',.35);ring(g,cx,cy,150,'rgba(255,70,80,.32)',4);ring(g,cx,cy,128,'rgba(255,70,80,.18)',1.5);for(let i=0;i<8;i++){const a=i*TAU/8;G.icon(g,'caveira',cx+Math.cos(a)*150,cy+Math.sin(a)*150,16,'rgba(255,150,150,.4)')}}
    else if(kind==='secret'){radial(g,cx,cy,230,'#3a8ab0',.25);for(let i=0;i<22;i++){const X=rx(),Y=ry();G.draw(g,G.prop.crystal('#5ac0e0',7,15),X,Y,{ay:1,alpha:.55})}}
    else if(kind==='start'){ring(g,cx,cy,66,G.rgba(T.acc,.35),2.5);G.icon(g,'olho',cx,cy,46,G.rgba(T.acc,.3))}
    /* sombra junto às paredes */
    [[WL,WL,W-WL*2,26,0,1],[WL,H-WL-18,W-WL*2,18,1,0]].forEach(([X,Y,a,b,d0,d1])=>{g.fillStyle=vg(g,Y,Y+b,`rgba(0,0,0,${d1?.6:0})`,`rgba(0,0,0,${d1?0:.4})`);g.fillRect(X,Y,a,b)});
    [[WL,1],[W-WL,-1]].forEach(([X,s])=>{const q=g.createLinearGradient(X,0,X+s*24,0);q.addColorStop(0,'rgba(0,0,0,.55)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(Math.min(X,X+s*24),WL,24,H-WL*2)});
    /* paredes de pedra com chanfro */
    const brick=(X,Y,a,b)=>{const c=G.shade(T.wa,(r()-.5)*.3);box(g,X+1,Y+1,a-2,b-2,c,4);g.fillStyle='rgba(255,255,255,.17)';g.fillRect(X+3,Y+2,a-6,2);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+3,Y+b-5,a-6,3);if(r()<.25)line(g,[[X+a*.3,Y+3],[X+a*.45,Y+b*.5],[X+a*.4,Y+b-4]],'rgba(0,0,0,.45)',1.2)};
    for(let X=0;X<W;X+=40){brick(X,0,40,WL/2);brick(X-20,WL/2,40,WL/2);brick(X,H-WL/2,40,WL/2);brick(X-20,H-WL,40,WL/2)}
    for(let Y=WL;Y<H-WL;Y+=32){const b=Math.min(32,H-WL-Y);brick(0,Y,WL,b);brick(W-WL,Y,WL,b)}
    g.strokeStyle=G.shade(T.wa,.35);g.lineWidth=2;g.strokeRect(WL-1,WL-1,W-WL*2+2,H-WL*2+2);g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=3;g.strokeRect(WL+1.5,WL+1.5,W-WL*2-3,H-WL*2-3);
    [[0,0],[W-WL,0],[0,H-WL],[W-WL,H-WL]].forEach(([X,Y])=>{box(g,X+2,Y+2,WL-4,WL-4,G.shade(T.wa,.18),5);disc(g,X+WL/2,Y+WL/2,8,T.mo);disc(g,X+WL/2,Y+WL/2,4,T.acc)});
    TORCH.forEach(([X,Y])=>{disc(g,X,Y+3,9,'rgba(0,0,0,.5)');disc(g,X,Y,8,'#2a2026');ring(g,X,Y,8,'#8a7a5a',2);disc(g,X,Y,3.5,'#4a2a10')});
  });
  /* porta desenhada como se fosse a de cima (largura DOOR, altura WL) */
  const door=(fl,st)=>G.bake(`ab:door:${fl}:${st}`,DOOR+20,WL+6,g=>{const T=TH[fl];g.translate(10,0);
    box(g,-9,0,DOOR+18,WL+3,G.shade(T.wa,.2),6);box(g,-9,0,DOOR+18,5,G.shade(T.wa,.42),3);box(g,2,3,DOOR-4,WL-1,'#050306',3);
    if(st==='open'){g.fillStyle=vg(g,0,WL,'rgba(0,0,0,0)',G.rgba(T.light,.45));g.fillRect(2,3,DOOR-4,WL-1);for(let i=0;i<3;i++){g.fillStyle=G.rgba(T.acc,.12+i*.1);g.fillRect(12+i*5,WL-14+i*5,DOOR-24-i*10,2)}}
    else if(st==='shut'){for(let i=0;i<6;i++){const X=7+i*13;box(g,X,3,6,WL-2,vg(g,0,WL,'#b86a6a','#4a1c1c'),2);poly(g,[[X,WL],[X+6,WL],[X+3,WL+5]],'#b86a6a')}box(g,2,10,DOOR-4,5,'#6a2a2a',2);disc(g,DOOR/2,12,6,'#ff4a3a')}
    else{for(let i=0;i<4;i++)box(g,4+i*18.4,4,17,WL-5,vg(g,0,WL,'#c89a30','#5a3c08'),2);box(g,2,12,DOOR-4,5,'#3a2a08');disc(g,DOOR/2,18,10,'#2a1c04');G.icon(g,'cadeado',DOOR/2,18,15,'#ffe9a0')}
    box(g,-9,WL-5,10,9,G.shade(T.wa,.05),2);box(g,DOOR-1,WL-5,10,9,G.shade(T.wa,.05),2)},{s:2});
  const rock=(fl,r,v)=>G.bake(`ab:rock:${fl}:${r}:${v}`,r*2+8,r*2+8,(g,w,h,rr)=>{const T=TH[fl],c=r+4,n=9,P=Array.from({length:n},(_,i)=>{const a=i*TAU/n+rr()*.3,k=r*(.9+rr()*.13);return[c+Math.cos(a)*k,c+Math.sin(a)*k]});
    poly(g,P,G.shade(T.rock,-.35));poly(g,P.map(([X,Y])=>[c+(X-c)*.82-r*.08,c+(Y-c)*.82-r*.12]),T.rock);poly(g,P.map(([X,Y])=>[c+(X-c)*.45-r*.2,c+(Y-c)*.45-r*.28]),G.shade(T.rock,.25));
    line(g,[...P,P[0]],'rgba(0,0,0,.65)',2);line(g,[[c+r*.1,c-r*.3],[c+r*.3,c+r*.1],[c+r*.18,c+r*.55]],'rgba(0,0,0,.45)',1.5);for(let i=0;i<10;i++)disc(g,c+(rr()-.5)*r*1.4,c+(rr()-.5)*r*1.4,.8+rr(),'rgba(0,0,0,.3)');if(fl===2||fl===3)G.draw(g,G.prop.crystal(T.acc,r*.45,r*.9),c+r*.35,c+r*.1,{ay:1,alpha:.9})},{s:2});
  /* ===== inimigos (canvas 96×96, centro = 48; raio de colisão = 24) ===== */
  const eyeb=(g,X,Y,R,iris)=>{disc(g,X,Y,R,'#f4eee0');disc(g,X,Y,R*.58,iris);disc(g,X,Y,R*.28,'#08040c');disc(g,X-R*.22,Y-R*.25,R*.14,'#fff')};
  const foeImg=(k,fr)=>G.bake(`ab:foe:${k}:${fr}`,96,96,g=>{const c=48,b=fr?1:-1;
    if(k==='traco'){radial(g,c,c,40,'#c01a3a',.35);g.fillStyle='#1a040a';g.beginPath();for(let i=0;i<=16;i++){const a=i*TAU/16,R=i%2?30+((i*7+fr*5)%7):22;i?g.lineTo(c+Math.cos(a)*R,c+Math.sin(a)*R):g.moveTo(c+Math.cos(a)*R,c+Math.sin(a)*R)}g.closePath();g.fill();disc(g,c,c,23,'#8a1a2a');disc(g,c-6,c-8,12,'#b83048');
      [[-9,-3],[9,-3]].forEach(([u,v])=>{disc(g,c+u,c+v,6,'#12040a');disc(g,c+u,c+v,3.6,'#ffe86a')});g.fillStyle='#12040a';g.beginPath();g.moveTo(c-13,c+7);g.quadraticCurveTo(c,c+22+b*3,c+13,c+7);g.quadraticCurveTo(c,c+13,c-13,c+7);g.fill();for(let i=-2;i<=2;i++)poly(g,[[c+i*5-2,c+9],[c+i*5+2,c+9],[c+i*5,c+14]],'#fff')}
    else if(k==='mosca'){[[-1],[1]].forEach(([s])=>{ell(g,c+s*24,c-10+(fr?-12:6),24,fr?11:15,'rgba(210,240,255,.55)',s*(fr?-.6:.45));line(g,[[c+s*8,c-6],[c+s*36,c-16+(fr?-14:10)]],'rgba(255,255,255,.7)',1.4)});ell(g,c,c+8,15,19,'#1c2810');ell(g,c,c+8,12,16,'#5a8a3a');for(let i=0;i<3;i++)line(g,[[c-11,c+6+i*7],[c+11,c+6+i*7]],'#1c2810',2.4);disc(g,c,c-9,13,'#2a3a18');disc(g,c-7,c-11,7,'#e0303a');disc(g,c+7,c-11,7,'#e0303a');disc(g,c-9,c-13,2.2,'#ffd0d0');disc(g,c+5,c-13,2.2,'#ffd0d0');for(let s=-1;s<2;s+=2)for(let i=0;i<3;i++)line(g,[[c+s*10,c+i*7],[c+s*22,c+8+i*8+(i===1?b*3:0)]],'#1c2810',2.4)}
    else if(k==='olho'){for(let i=0;i<7;i++){const a=.35+i*.4;line(g,[[c+Math.cos(a)*20,c+Math.sin(a)*20],[c+Math.cos(a+b*.14)*32,c+Math.sin(a)*30],[c+Math.cos(a-b*.1)*40,c+Math.sin(a)*37]],'#6a2a4a',5-i%2)}disc(g,c,c,27,'#2a1430');disc(g,c,c,24,'#e8dcd8');for(let i=0;i<7;i++){const a=i*TAU/7+.2;line(g,[[c+Math.cos(a)*23,c+Math.sin(a)*23],[c+Math.cos(a+.25)*17,c+Math.sin(a+.25)*17],[c+Math.cos(a+.1)*13,c+Math.sin(a+.1)*13]],'#c0304a',1.2)}radial(g,c,c-14,26,'#ffffff',.3);if(fr)line(g,[[c-22,c-17],[c,c-26],[c+22,c-17]],'#5a2a3a',5)}
    else if(k==='aranha'){for(let s=-1;s<2;s+=2)for(let i=0;i<4;i++){const k2=(i%2===fr)?5:-3,y=c-16+i*11;line(g,[[c+s*14,c-6+i*4],[c+s*(30+k2),y-8],[c+s*(40+k2),y+7]],'#1a0c06',5);line(g,[[c+s*14,c-6+i*4],[c+s*(30+k2),y-8],[c+s*(40+k2),y+7]],'#8a5030',2.4)}ell(g,c,c+9,19,18,'#1a0c06');ell(g,c,c+9,16,15,'#6a3a20');poly(g,[[c-6,c+2],[c+6,c+2],[c,c+9],[c+6,c+17],[c-6,c+17],[c,c+9]],'#ff5a2a');disc(g,c,c-11,12,'#2a140a');[[-6,-13,3.4],[6,-13,3.4],[-2,-18,2],[3,-18,2]].forEach(([u,v,R])=>{disc(g,c+u,c+v,R,'#ff3a4a');disc(g,c+u-1,c+v-1,R*.3,'#fff')});line(g,[[c-5,c-3],[c-8,c+3]],'#fff',2.4);line(g,[[c+5,c-3],[c+8,c+3]],'#fff',2.4)}
    else if(k==='larva'){for(let i=3;i>=0;i--){const X=c-16+i*10+(i%2?b*2:-b*2),Y=c+16-i*9,R=13+i*3.4;disc(g,X,Y,R,'#3a3010');disc(g,X,Y,R-2.5,G.mix('#8a7a3a','#d8c870',i/3));disc(g,X-R*.3,Y-R*.35,R*.3,'rgba(255,250,200,.55)')}disc(g,c+8,c-14,3.6,'#10080a');disc(g,c+22,c-10,3.6,'#10080a');line(g,[[c+9,c-2],[c+16,c+(fr?3:6)],[c+23,c-1]],'#10080a',3);line(g,[[c+6,c-25],[c+1,c-36]],'#3a3010',2.4);line(g,[[c+22,c-22],[c+30,c-31]],'#3a3010',2.4)}
    else if(k==='torre'){ell(g,c,c+22,28,11,'#1a1a22');box(g,c-22,c-18,44,42,vg(g,c-18,c+24,'#8a8aa0','#35354a'),7);poly(g,[[c-26,c-16],[c-18,c-32],[c-8,c-20],[c,c-36],[c+8,c-20],[c+18,c-32],[c+26,c-16]],'#6a6a80');box(g,c-26,c-19,52,8,'#a8a8c0',3);eyeb(g,c,c+3,13,fr?'#ff8a2a':'#d83a2a');[[-15,-4],[15,-4],[-15,16],[15,16]].forEach(([u,v])=>{disc(g,c+u,c+v,3,'#1a1a22');disc(g,c+u,c+v,1.7,fr?'#ffd36b':'#8a5a2a')});line(g,[[c-16,c+22],[c-8,c+14],[c-12,c+9]],'#1a1a22',1.6)}
    else{g.globalAlpha=.85;radial(g,c,c,44,'#c8d0ff',.5);g.fillStyle=vg(g,c-30,c+38,'#f4f6ff','rgba(150,160,230,.25)');g.beginPath();g.moveTo(c-24,c+34);g.quadraticCurveTo(c-30,c-30,c,c-30);g.quadraticCurveTo(c+30,c-30,c+24,c+34);for(let i=3;i>=-3;i--)g.lineTo(c+i*7,c+34-((i+fr+8)%2?12:0));g.closePath();g.fill();ell(g,c-9,c-8,5.5,8,'#1a1440');ell(g,c+9,c-8,5.5,8,'#1a1440');ell(g,c,c+9,5,7+b*2,'#1a1440');disc(g,c-7,c-11,1.8,'#fff');disc(g,c+11,c-11,1.8,'#fff');line(g,[[c-22,c+2],[c-37,c+8+b*4]],'rgba(232,236,255,.75)',7);line(g,[[c+22,c+2],[c+37,c+8-b*4]],'rgba(232,236,255,.75)',7);g.globalAlpha=1}
  },{s:2});
  /* chefes: canvas 192×192, centro 96; raio de colisão ≈ 56 */
  const bossImg=(b,fr)=>G.bake(`ab:boss:${b}:${fr}:${SPR.ok?1:0}`,192,192,g=>{const c=96,s=fr?1:-1;
    const crown=(X,Y,w)=>{poly(g,[[X-w,Y+12],[X-w-3,Y-14],[X-w*.5,Y-1],[X-w*.22,Y-22],[X,Y-3],[X+w*.28,Y-22],[X+w*.55,Y-1],[X+w+3,Y-14],[X+w,Y+12]],'#ffc830');box(g,X-w,Y+6,w*2,8,'#a87010',2);[-.6,0,.6].forEach((u,i)=>disc(g,X+u*w,Y+10,3.4,i===1?'#7fe3ff':'#e0304a'))};
    if(b===0){radial(g,c,c,94,'#6a9a20',.4);[[-1],[1]].forEach(([d])=>{ell(g,c+d*52,c-18+(fr?-18:8),48,fr?20:30,'rgba(210,235,190,.5)',d*(fr?-.65:.4));for(let i=-1;i<2;i++)line(g,[[c+d*16,c-10],[c+d*82,c-24+i*16+(fr?-26:10)]],'rgba(255,255,255,.55)',1.6)});
      for(let d=-1;d<2;d+=2)for(let i=0;i<3;i++)line(g,[[c+d*34,c+6+i*18],[c+d*64,c+8+i*24+(i===1?s*6:0)],[c+d*70,c+32+i*22]],'#16200a',7);
      ell(g,c,c+22,48,56,'#16200a');ell(g,c,c+22,43,51,'#4a6a1e');ell(g,c-14,c+6,20,28,'rgba(180,220,90,.28)');for(let i=0;i<4;i++){g.strokeStyle='#16200a';g.lineWidth=5;g.beginPath();g.ellipse(c,c+12+i*15,40-i*5,13,0,.15,Math.PI-.15);g.stroke()}
      disc(g,c,c-26,34,'#2a3a12');[[-1],[1]].forEach(([d])=>{disc(g,c+d*21,c-30,21,'#5a0a12');disc(g,c+d*21,c-30,17,'#e0303a');for(let i=-1;i<2;i++)for(let j=-1;j<2;j++)disc(g,c+d*21+i*8,c-30+j*8,2.2,'rgba(90,0,10,.55)');disc(g,c+d*21-7,c-38,5,'#ffd0d0')});line(g,[[c-9,c-4],[c-14,c+14+s*3]],'#d8c890',6);line(g,[[c+9,c-4],[c+14,c+14+s*3]],'#d8c890',6);crown(c,c-62,30)}
    else if(b===1){radial(g,c,c,94,'#a8c8ff',.3);[[-1],[1]].forEach(([d])=>{ell(g,c+d*58,c+30+s*d*4,28,30,'#2a2836');ell(g,c+d*58,c+28+s*d*4,23,25,'#8a869c');poly(g,[[c+d*58-14,c+6+s*d*4],[c+d*70,c-18+s*d*4],[c+d*58+14,c+8+s*d*4]],'#d8d0b8')});
      box(g,c-30,c+24,60,54,'#2a2836',12);for(let i=0;i<4;i++)line(g,[[c-26,c+34+i*11],[c,c+40+i*11],[c+26,c+34+i*11]],'#d8d0b8',5);line(g,[[c,c+26],[c,c+78]],'#b8b098',7);
      ell(g,c,c-14,50,46,'#2a2418');ell(g,c,c-17,45,42,'#e8e0c8');ell(g,c-15,c-34,17,12,'rgba(255,255,255,.55)',-.4);box(g,c-27,c+10,54,24,'#2a2418',8);box(g,c-23,c+12,46,19+(fr?3:0),'#d8d0b4',6);for(let i=-3;i<=3;i++)line(g,[[c+i*6.6,c+13],[c+i*6.6,c+29]],'#2a2418',2);
      [[-19],[19]].forEach(([u])=>{ell(g,c+u,c-14,13,15,'#0c0810');radial(g,c+u,c-13,15,'#7fd0ff',.95);disc(g,c+u,c-13,4+(fr?1:0),'#e8fbff')});poly(g,[[c-6,c+2],[c,c-9],[c+6,c+2]],'#1a1418');line(g,[[c-30,c-46],[c-18,c-32],[c-24,c-20]],'#5a5040',2.4);
      poly(g,[[c-36,c-48],[c-62,c-78],[c-26,c-56]],'#b8b098');poly(g,[[c+36,c-48],[c+62,c-78],[c+26,c-56]],'#b8b098')}
    else if(b===2){radial(g,c,c,94,'#8a5aff',.55);for(let i=0;i<10;i++){const a=i*TAU/10+(fr?.18:0);poly(g,[[c+Math.cos(a-.14)*52,c+Math.sin(a-.14)*52],[c+Math.cos(a)*(i%2?88:76),c+Math.sin(a)*(i%2?88:76)],[c+Math.cos(a+.14)*52,c+Math.sin(a+.14)*52]],i%2?'#6a40d0':'#b9a6ff')}
      disc(g,c,c,56,'#1a0c40');disc(g,c,c,50,'#f0e8ff');for(let i=0;i<11;i++){const a=i*TAU/11;line(g,[[c+Math.cos(a)*49,c+Math.sin(a)*49],[c+Math.cos(a+.2)*38,c+Math.sin(a+.2)*38],[c+Math.cos(a+.05)*30,c+Math.sin(a+.05)*30]],'#9a5ad0',1.8)}radial(g,c-12,c-18,40,'#ffffff',.5)}
    else{radial(g,c,c,96,'#c01a60',.5);for(let i=0;i<11;i++){const X=c-62+i*12.4,len=26+((i*41)%30),w=fr?9:-9;g.strokeStyle='#14020c';g.lineWidth=12-Math.abs(i-5);g.lineCap='round';g.beginPath();g.moveTo(X,c+30);g.quadraticCurveTo(X+(i%2?w:-w)*2,c+34+len*.6,X+(i%2?-w:w),c+38+len);g.stroke()}
      poly(g,[[c-52,c-24],[c-86,c+56],[c-50,c+40],[c,c+62],[c+50,c+40],[c+86,c+56],[c+52,c-24]],'#3a0824');const S0=130,ox=c-S0*.48,oy=c-S0*.58;
      if(SPR.ok){const t=document.createElement('canvas');t.width=t.height=256;const q=t.getContext('2d');q.drawImage(SPR.img,0,0,256,256);q.globalCompositeOperation='multiply';q.fillStyle='#6a1a50';q.fillRect(0,0,256,256);q.globalCompositeOperation='destination-in';q.drawImage(SPR.img,0,0,256,256);g.save();g.shadowColor='#ff3a8a';g.shadowBlur=18;g.drawImage(t,ox,oy,S0,S0);g.restore()}
      else{ell(g,c,c+4,54,48,'#6a1a50');poly(g,[[c-50,c-10],[c-40,c-54],[c-12,c-34]],'#6a1a50');poly(g,[[c+50,c-10],[c+40,c-54],[c+12,c-34]],'#6a1a50')}
      [[.285,.415],[.585,.408]].forEach(([u,v])=>{const X=ox+u*S0,Y=oy+v*S0;radial(g,X,Y,19,'#ff2a6a',1);ell(g,X,Y,9,6,'#ffe0ea');ell(g,X,Y,2,5,'#2a0010')});const mx=ox+.43*S0,my=oy+.52*S0;g.fillStyle='#14020a';g.beginPath();g.moveTo(mx-24,my-3);g.quadraticCurveTo(mx,my+34+(fr?7:0),mx+24,my-3);g.quadraticCurveTo(mx,my+8,mx-24,my-3);g.fill();for(let i=-3;i<=3;i++)poly(g,[[mx+i*6.4-3,my+1],[mx+i*6.4+3,my+1],[mx+i*6.4,my+10]],'#fff');crown(ox+.43*S0,oy+.12*S0,32)}
  },{s:1.5});
  /* ===== relíquias, itens do chão e tiros ===== */
  const RELIC={tri:['estrela','#ffd36b'],homing:['olho','#c58bff'],pierce:['seta','#7fe3ff'],explo:['chama','#ff9b3d'],beam:['sol','#fff1a8'],orbit:['espiral','#b48cff'],boom:['espiral','#d8a860'],split:['estrela','#7fe3ff'],dmg:['olho','#ff8fb1'],spd:['raio','#7fe3ff'],rate:['raio','#ffd36b'],range:['alvo','#9fe8ff'],hp:['coracao','#7dffa8'],cross:['estrela','#ffffff'],wave:['gota','#7fe3ff'],big:['gota','#ff6b6b'],chain:['raio','#fff27a'],poison:['caveira','#7dffa8'],slow:['relogio','#9fe8ff'],knock:['nuvem','#d6e8ff'],crit:['alvo','#ff6b6b'],vamp:['gota','#e0304a'],luck:['folha','#7dffa8'],shield:['escudo','#ffd36b'],thorn:['coroa','#6fcf6a'],dash:['seta','#b9a6ff'],magnet:['moeda','#ff9be0'],ghost:['nuvem','#c8b8ff'],double:['nota','#ffd36b'],spectral:['estrela','#b9a6ff'],coin:['moeda','#ffd36b'],bombs:['caveira','#ff9b3d'],keys:['chave','#ffd36b'],eye:['bandeira','#e8d9b4'],ring:['sol','#ff9b3d'],
    a_livro:['escudo','#ffd36b'],a_solar:['sol','#ff9b3d'],a_vela:['chama','#ffb347'],a_ampulheta:['relogio','#9fe8ff'],a_sino:['trofeu','#c58bff']};
  const relic=k=>G.bake('ab:relic:'+k,40,40,g=>{const[ic,c]=RELIC[k]||['estrela','#ffffff'];radial(g,20,20,20,c,.55);poly(g,[[20,3],[34,11],[34,29],[20,37],[6,29],[6,11]],'#140c1e');poly(g,[[20,6],[31.5,12.5],[31.5,27.5],[20,34],[8.5,27.5],[8.5,12.5]],G.mix(c,'#140c1e',.72));
    line(g,[[20,3],[34,11],[34,29],[20,37],[6,29],[6,11],[20,3]],c,1.8);if(k==='boom'){g.strokeStyle=c;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(13,26);g.quadraticCurveTo(15,12,29,14);g.stroke()}else G.icon(g,ic,20,20,20,G.shade(c,.2))},{s:3});
  const drop=k=>G.bake('ab:drop:'+k,32,32,g=>{
    if(k==='coin')G.draw(g,G.prop.coin(11),16,16);
    else if(k==='heart'){G.icon(g,'coracao',16,17,29,'#3a0410');G.icon(g,'coracao',16,16,25,'#ff3a52');disc(g,11,11,2.6,'#ffd0d8')}
    else if(k==='bomb'){disc(g,14,19,11,'#0c0a10');disc(g,14,19,9,'#3a3446');disc(g,10,15,3,'#a8a0c0');box(g,18,6,8,8,'#6a6278',2);line(g,[[23,8],[27,3]],'#c8a060',2);disc(g,28,3,2.6,'#ffb33a')}
    else if(k==='key'){g.translate(16,16);g.rotate(-.7);G.icon(g,'chave',0,1,30,'#3a2804');G.icon(g,'chave',0,0,26,'#ffd36b')}
    else{G.icon(g,'escudo',16,17,30,'#06283a');G.icon(g,'escudo',16,16,25,'#6ad0ff');G.icon(g,'olho',16,15,14,'#06283a')}},{s:3});
  const shot=(col,foe)=>G.bake(`ab:shot:${col}:${foe?1:0}`,48,48,g=>{radial(g,24,24,24,col,.75);if(foe){disc(g,24,24,12,col);disc(g,24,24,8,'#3a0418');disc(g,24,24,4,col);disc(g,21,21,2,'#ffd8e4')}else{disc(g,24,24,12,col);disc(g,24,24,8,G.shade(col,.55));disc(g,20.5,20,3.4,'#fff')}},{s:2});
  const pedestal=pact=>G.bake('ab:ped:'+(pact?1:0),52,32,g=>{ell(g,26,25,24,6,'rgba(0,0,0,.45)');box(g,8,12,36,14,vg(g,12,26,pact?'#6a2a30':'#7a6a8a',pact?'#2a0a10':'#2c2440'),4);box(g,5,8,42,7,pact?'#9a3a40':'#a898b8',3);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(8,9,36,1.5);disc(g,26,20,3,pact?'#ff5a5a':'#ffd36b')},{s:2});

  const amb=[],V={lights:null,seen:new WeakMap(),hp:new Map(),en:[],pos:new Map(),room:null,boss:null,bar:1};
  return{TH,KINDC,TORCH,relic,drop,shot,
    /* uma camada de ambiente por andar */
    amb:f=>amb[f]||(amb[f]=G.ambient(TH[f].amb,{W,H,n:22,col:TH[f].ac,seed:f+8})),
    room,door,rock,foeImg,bossImg,pedestal,V,
    lights:()=>V.lights||(V.lights=G.lights(W,H,{res:.2})),
    /* estado de caminhada, só a partir da posição desenhada */
    walk(key,X,Y,t){let q=V.pos.get(key);if(!q){q={x:X,y:Y,t:-9,d:1};V.pos.set(key,q)}const dx=X-q.x,dy=Y-q.y;if(Math.abs(dx)+Math.abs(dy)>.3&&Math.abs(dx)+Math.abs(dy)<40){q.t=t;if(Math.abs(dx)>.4)q.d=Math.sign(dx)}q.x=X;q.y=Y;return q}};
}

function abismo51(C){
  const W=800,H=450,WL=34,DOOR=80,coop=!!C.net,o=C.room.opt||{},me=me21(C);
  const seed=o.m==='day'?(()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()})():C.seed;
  const HP0=gdPick(C.gd,[8,6,6,4]),ESP=gdPick(C.gd,[.8,1,1.12,1.25]),EHP=gdPick(C.gd,[.8,1,1.2,1.45])*(coop?1.35:1);
  const rnd=mb32((seed^0xab51)>>>0||7),R=n=>Math.floor(rnd()*n),pick=a=>a[R(a.length)];
  let M=null;/* mapa do andar */
  const mkP=(p,i)=>({u:p.u,n:p.n,c:p.c,x:W/2+(i?40:-40),y:H/2,hp:HP0,max:HP0,sh:0,dmg:1,spd:210,rate:.34,range:.85,shot:440,cool:0,inv:0,f:{},muts:[],act:null,coins:0,bombs:1,keys:1,
    inp:{},cnt:{},last:{},dead:false,rev:0,dashCd:0,dashT:0,kills:0,buys:0,pacts:0,ringT:4,aim:null});
  const S={fl:0,room:null,ps:(coop?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c}]).map(mkP),en:[],tears:[],eb:[],bombs:[],booms:[],beams:[],decoy:null,slowT:0,
    kills:0,roomsSeen:0,pedAdd:[],ot:0,over:false,won:false,msg:'',msgT:0,sendAt:0,keys:{},trap:false,trans:0,flMsg:0,found:[]};
  const myP=()=>S.ps.find(p=>p.u===C.me)||S.ps[0];
  const nb=(r,dx,dy)=>{const n=M.rooms[M.K(r.x+dx,r.y+dy)];if(!n)return null;if(n.hidden&&!(r.open&&r.open[dx+','+dy]))return null;return n};
  const secretWall=(r,dx,dy)=>{const n=M.rooms[M.K(r.x+dx,r.y+dy)];return n&&n.hidden&&!(r.open&&r.open[dx+','+dy])};
  function say(m){S.msg=m;S.msgT=performance.now()}
  function floor(f){S.fl=f;M=abGen51(seed,f);S.trap=false;const st=M.rooms[M.K(3,3)];S.ps.forEach((p,i)=>{p.x=W/2+(i?40:-40);p.y=H/2+40});enter(st,null);S.flMsg=performance.now();
    if(S.ps.some(p=>p.f.map))Object.values(M.rooms).forEach(r=>{if(!r.hidden)r.seen=true});
    say(`Andar ${f+1}: ${ABF51[f].n}`)}
  function mutPool(){const have=new Set(S.ps.flatMap(p=>p.muts));const pool=MUT51.map((m,i)=>i).filter(i=>!have.has(MUT51[i][0])||['orbit','dmg','luck','shield','hp','rate'].includes(MUT51[i][0]));return pool}
  function fillRoom(r){if(r.filled)return;r.filled=true;const rr=mb32(r.seed),Rr=n=>Math.floor(rr()*n);
    const pool=mutPool(),pm=()=>pool[Rr(pool.length)];
    if(r.kind==='treasure')r.peds.push({x:W/2,y:H/2,mut:pm()});
    if(r.kind==='shop'){const disc=S.ps.some(p=>p.f.disc)?.7:1;const items=[{k:'heart',p:3},{k:'bomb',p:5},{k:'key',p:5},{k:'shield',p:6},rr()<.6?{mut:pm(),p:15}:{act:ACTK51[Rr(5)],p:12}];
      items.forEach((it,i)=>r.peds.push({x:200+i*100,y:H/2,...it,p:Math.max(1,Math.round(it.p*disc))}))}
    if(r.kind==='pact'){const a=PACT51[Rr(PACT51.length)];let b=PACT51[Rr(PACT51.length)];if(b===a)b=PACT51[(PACT51.indexOf(a)+3)%PACT51.length];[a,b].forEach((k,i)=>r.peds.push({x:W/2+(i?90:-90),y:H/2,mut:MUT51.findIndex(m=>m[0]===k),pact:2}))}
    if(r.kind==='secret'){r.drops.push(...[0,1,2,3,4].map(i=>({x:W/2-80+i*40,y:H/2+50,k:'coin'})));if(rr()<.55)r.peds.push({x:W/2,y:H/2-20,mut:pm()});else r.drops.push({x:W/2,y:H/2-20,k:pick(['bomb','key','shield','heart'])},{x:W/2+40,y:H/2-20,k:'bomb'})}
    if(r.kind==='start'&&S.fl===0&&!coop&&rr()<1)r.drops.push({x:W/2,y:H/2-70,k:'bomb'})}
  function foe(k,x,y){const m=1+S.fl*.3,b={traco:{r:14,hp:3,spd:95},mosca:{r:10,hp:2,spd:140,fly:1},olho:{r:16,hp:4,spd:0,cool:1.5},aranha:{r:13,hp:4,spd:0,hop:1},larva:{r:15,hp:5,spd:60},torre:{r:17,hp:8,spd:0,cool:2},fantasma:{r:14,hp:5,spd:80,fly:1}}[k];
    return{k,x,y,...b,hp:b.hp*m*EHP,max:b.hp*m*EHP,cool:(b.cool||1)+rnd()*1.5,ph:rnd()*9,vx:0,vy:0,hitT:0,slow:0,pois:0}}
  function boss(){const hp=[45,70,90,130][S.fl]*EHP;return{k:'boss',b:S.fl,x:W/2,y:150,r:[40,44,38,46][S.fl],hp,max:hp,cool:2,ph:0,vx:0,vy:0,hitT:0,slow:0,pois:0,a:0}}
  function enter(r,from){S.tpN=(S.tpN|0)+1;S.room=r;S.en=[];S.eb=[];S.tears=[];S.bombs=[];S.beams=[];S.decoy=null;if(!r.seen){r.seen=true;S.roomsSeen++}
    if(r.kind==='secret'&&!S.found.includes(S.fl)){S.found.push(S.fl);C.achieve?.('ab_segredo');say('✨ Sala Secreta!')}
    S.ps.forEach((p,i)=>{if(from){p.x=from[0]?(from[0]>0?WL+32:W-WL-32):W/2+(i?28:-28);p.y=from[1]?(from[1]>0?WL+32:H-WL-32):H/2+(i?28:-28)}p.inv=Math.max(p.inv,.8)});
    fillRoom(r);
    if(!r.clear&&r.kind==='fight'){const n=3+S.fl+R(3);const kinds=['traco','traco','mosca','olho'].concat(S.fl>=1?['aranha','larva']:[]).concat(S.fl>=2?['torre','fantasma']:[]);
      for(let i=0;i<n;i++){let x,y,t=0;do{x=120+rnd()*560;y=90+rnd()*270}while(t++<20&&S.ps.some(p=>Math.hypot(p.x-x,p.y-y)<150));const e=foe(pick(kinds),x,y);wallClamp(e);S.en.push(e)}}
    if(!r.clear&&r.kind==='boss'){S.en.push(boss());say(`👹 ${ABF51[S.fl].boss}`);fx5('activate')}
    if(r.kind==='shop')say('🛒 Loja: pise no item para comprar');if(r.kind==='pact')say('⛧ Sala do Pacto: poder em troca de corações');if(r.kind==='treasure')say('✦ Sala do Tesouro')}
  function wallClamp(o,ghost){o.x=clamp12(o.x,WL+o.r,W-WL-o.r);o.y=clamp12(o.y,WL+o.r,H-WL-o.r);if(ghost)return;S.room.rocks.forEach(k=>{const dx=o.x-k.x,dy=o.y-k.y,d=Math.hypot(dx,dy);if(d<k.r+o.r&&d>0){o.x=k.x+dx/d*(k.r+o.r);o.y=k.y+dy/d*(k.r+o.r)}})}
  function hurt(p,src){if(p.inv>0||p.dead||p.dashT>0)return;if(p.sh>0){p.sh--;p.inv=1;fx5('click');say('🛡 Escudo de Lucidez!');return}p.hp--;p.inv=1;fx5('error');C.fx?.shake(4,.2);
    if(p.f.thorn&&src&&src.hp!=null){src.hp-=2;src.hitT=performance.now()}
    if(p.hp<=0){p.dead=true;p.hp=0;p.rev=0;say(coop?`${p.n} caiu! Segure F perto para reviver`:`${p.n} caiu no Abismo`);if(S.ps.every(q=>q.dead))end(false)}}
  function score(){return S.roomsSeen*40+S.kills*20+S.fl*500+(S.won?2000:0)+S.ps.reduce((a,p)=>a+p.coins*5,0)}
  function end(won){if(S.over)return;S.over=true;S.won=won;if(won)C.achieve?.('abismo');
    const deep=S.fl+(won?1:0);let first=false;progPut38(p=>{p.ab=p.ab||{};p.ab.muts=p.ab.muts||{};if(deep>(p.ab.deep||0))p.ab.deep=deep;if(won){first=!p.ab.wins;p.ab.wins=(p.ab.wins||0)+1}S.ps.forEach(q=>q.muts.forEach(k=>p.ab.muts[k]=1))});
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(220,Math.round((S.fl*9+S.kills*.2+S.roomsSeen*.6)*mul)+(won?40:0)+(first?20:0)),why:[`andar ${S.fl+1}`,won?'Abismo vencido':'',first?'primeira vitória':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    if(coop&&C.host)C.send('as',{st:snap()});
    const p=myP();setTimeout(()=>C.finish({title:won?'🗝 O Perseus do Véu caiu! O Abismo está limpo':`🗝 O Abismo venceu no andar ${S.fl+1} · ${ABF51[S.fl].n}`,unit:'pts',
      rows:S.ps.map(q=>({u:q.u,n:q.n,c:q.c,s:score(),w:won})),html:`<ul class="r38-l"><li>🏚 Andar: <b>${S.fl+1}/4</b> · ${esc(ABF51[S.fl].n)}</li><li>🚪 Salas: <b>${S.roomsSeen}</b></li><li>☠ Inimigos: <b>${S.kills}</b></li><li>🧬 Mutações: ${p.muts.map(k=>MUT51.find(m=>m[0]===k)?.[2]||'').join(' ')||'nenhuma'}</li></ul>`}),window.__abFast?0:1200)}
  /* tiros */
  function fire(p,ax,ay){const base=Math.atan2(ay,ax),angs=[];const spread=p.f.tri?[-.2,0,.2]:[0];spread.forEach(s=>{angs.push(base+s);if(p.f.back)angs.push(base+Math.PI+s)});
    if(p.f.beam){p.beamA=angs;p.beamT=.12;return}
    angs.forEach(a=>{const offs=p.f.double?[-8,8]:[0];offs.forEach(of=>{const nx=-Math.sin(a)*of,ny=Math.cos(a)*of;
      S.tears.push({x:p.x+nx,y:p.y+ny,vx:Math.cos(a)*p.shot,vy:Math.sin(a)*p.shot,a,d:p.dmg*(p.f.crit&&rnd()<.1?3:1),r:p.f.big?9:5,life:p.range*(p.f.boom?1.4:1),t:0,o:p.u,f:p.f,gen:0,hit:new Set(),ox:of})})});
    if(p.u===C.me)fx5('click')}
  const tearCol=f=>f.explo?'#ff9b3d':f.homing?'#c58bff':f.poison?'#7dffa8':f.slow?'#9fe8ff':f.pierce?'#7fe3ff':f.chain?'#fff27a':'#ffd36b';
  function hitFoe(e,dmg,f,by){if(e.hp<=0)return;e.hp-=dmg;e.hitT=performance.now();if(f){if(f.poison)e.pois=3;if(f.slow)e.slow=2.5;if(f.knock&&e.k!=='boss'){const d=Math.hypot(e.x-by.x,e.y-by.y)||1;e.x+=(e.x-by.x)/d*26;e.y+=(e.y-by.y)/d*26}}}
  function explode(x,y,r,dmg,hurtPlayers,opens){S.booms.push({x,y,r,t:performance.now()});fx5('bb7');C.fx?.shake(6,.3);
    S.en.forEach(e=>{if(Math.hypot(e.x-x,e.y-y)<r+e.r)hitFoe(e,dmg)});
    S.room.rocks=S.room.rocks.filter(k=>Math.hypot(k.x-x,k.y-y)>r+k.r*.5);
    if(hurtPlayers)S.ps.forEach(p=>{if(!p.dead&&Math.hypot(p.x-x,p.y-y)<r)hurt(p)});
    if(opens){for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){if(!secretWall(S.room,dx,dy))continue;const wx=dx?(dx<0?WL:W-WL):W/2,wy=dy?(dy<0?WL:H-WL):H/2;if(Math.hypot(wx-x,wy-y)<r+50){S.room.open=S.room.open||{};S.room.open[dx+','+dy]=1;const n=M.rooms[M.K(S.room.x+dx,S.room.y+dy)];n.hidden=false;n.open=n.open||{};n.open[(-dx)+','+(-dy)]=1;say('🕳 Uma passagem secreta se abriu!');fx5('mgWin')}}}}
  function useActive(p){const a=p.act;if(!a||a.ch<ACT51[a.k].max){if(a)say('Item Ativo ainda carregando');return}a.ch=0;fx5('activate');
    if(a.k==='livro'){p.inv=3;say('📖 Invencível!')}else if(a.k==='solar'){C.fx?.flash('#ffd36b',.4);S.en.forEach(e=>hitFoe(e,6))}else if(a.k==='vela'){S.decoy={x:p.x,y:p.y,t:4.5}}
    else if(a.k==='ampulheta'){S.slowT=5;say('⏳ O tempo desacelera')}else if(a.k==='sino'){S.ps.forEach(q=>{if(!q.dead)q.hp=Math.min(q.max,q.hp+2)});Object.values(M.rooms).forEach(r=>{r.seen=true})}}
  function grabPed(p,pd){const r=S.room;
    if(pd.p!=null){if(p.coins<pd.p){const n=performance.now();if(!(pd.warn>n)){pd.warn=n+1500;say(`Custa ${pd.p} Óbolos`)}return false}p.coins-=pd.p;p.buys++;if(p.buys>=4)C.achieve?.('ab_loja')}
    if(pd.pact){if(p.max<=pd.pact){const n=performance.now();if(!(pd.warn>n)){pd.warn=n+1500;say('Você não tem corações para esse pacto')}return false}p.max-=pd.pact;p.hp=Math.min(p.hp,p.max);p.pacts++;if(p.pacts>=2)C.achieve?.('ab_pacto');C.fx?.flash('#600',.3);r.peds.forEach(q=>{if(q.pact&&q!==pd)q.gone=1})}
    if(pd.mut!=null){const m=MUT51[pd.mut];m[4](p);p.muts.push(m[0]);say(`${m[2]} ${m[1]}: ${m[3]}`);fx5('mgWin');C.fx?.flash('#c39bff',.2);if(p.muts.length>=6)C.achieve?.('ab_sinergia')}
    else if(pd.act){const old=p.act;p.act={k:pd.act,ch:ACT51[pd.act].max};say(`${ACT51[pd.act].ico} ${ACT51[pd.act].n}: ${ACT51[pd.act].d} (Espaço)`);fx5('mgWin');if(old)S.pedAdd.push({x:pd.x,y:pd.y+60,act:old.k});}
    else if(pd.k){giveDrop(p,pd.k)}
    return true}
  function giveDrop(p,k){if(k==='coin')p.coins++;else if(k==='heart'){if(p.hp>=p.max)return false;p.hp=Math.min(p.max,p.hp+2)}else if(k==='bomb')p.bombs++;else if(k==='key')p.keys++;else if(k==='shield')p.sh++;fx5('mgCoin');return true}
  function roomCleared(){const r=S.room;r.clear=true;say('Sala limpa · portas abertas');fx5('confirm');
    S.ps.forEach(p=>{if(p.act&&p.act.ch<ACT51[p.act.k].max)p.act.ch++});
    const luck=S.ps.reduce((a,p)=>a+(p.f.luck||0),0);if(r.kind==='fight'&&rnd()<.38+luck*.15)r.drops.push({x:W/2,y:H/2,k:pick(['coin','coin','heart','bomb','key','shield'])});
    if(r.kind==='boss'){if(S.fl<3){r.peds.push({x:W/2-80,y:H/2,mut:pick(mutPool())});S.trap=true;say('Chefe derrotado! Pegue a mutação e desça pelo alçapão')}else end(true)}}
  function sim(dt){
    if(S.over)return;const r=S.room;S.ot+=dt;S.slowT=Math.max(0,S.slowT-dt);
    if(S.decoy){S.decoy.t-=dt;if(S.decoy.t<=0)S.decoy=null}
    const alive=S.ps.filter(p=>!p.dead);
    S.ps.forEach(p=>{const i=p.inp,cnt=i.cnt||{};p.inv=Math.max(0,p.inv-dt);p.cool=Math.max(0,p.cool-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.dashT=Math.max(0,p.dashT-dt);p.r=13;
      const pr=k=>{const n=cnt[k]|0;if(n>(p.last[k]|0)){p.last[k]=n;return true}return false};
      if(p.dead){pr('B');pr('A');pr('D');return}
      if(pr('B')&&p.bombs>0){p.bombs--;S.bombs.push({x:p.x,y:p.y,t:1.2,big:p.f.bigb});fx5('click')}
      if(pr('A'))useActive(p);
      if(pr('D')&&p.f.dash&&p.dashCd<=0){p.dashT=.22;p.dashCd=.9;fx5('mgJump')}
      let mx=(i.r?1:0)-(i.l?1:0),my=(i.d?1:0)-(i.u?1:0);const n=Math.hypot(mx,my)||1,sp=p.spd*(p.dashT>0?2.6:1);p.x+=mx/n*sp*dt;p.y+=my/n*sp*dt;
      if(r.clear){for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){const nr=nb(r,dx,dy);if(!nr)continue;const gap=dy?Math.abs(p.x-W/2)<DOOR/2-6:Math.abs(p.y-H/2)<DOOR/2-6;
        const past=dy<0?p.y<WL+p.r+2:dy>0?p.y>H-WL-p.r-2:dx<0?p.x<WL+p.r+2:p.x>W-WL-p.r-2;
        if(gap&&past){if(nr.locked){if(p.keys>0){p.keys--;nr.locked=false;say('🔑 Porta destrancada');fx5('activate')}else{const nn=performance.now();if(!(S.lockW>nn)){S.lockW=nn+1500;say('🔒 Trancada: precisa de uma chave')}continue}}
          enter(nr,[dx,dy]);return}}}
      wallClamp(p,p.f.ghost);
      if(i.ax!=null&&(i.ax||i.ay)&&p.cool<=0){p.cool=p.f.beam?.05:p.rate;fire(p,i.ax,i.ay)}
      if(p.f.ring){p.ringT-=dt;if(p.ringT<=0){p.ringT=4;for(let k=0;k<12;k++){const a=k/12*TAU16;S.tears.push({x:p.x,y:p.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,a,d:p.dmg,r:6,life:.6,t:0,o:p.u,f:{explo:0},gen:1,hit:new Set(),col:'#ff9b3d'})}fx5('bb3')}}
      if(p.f.magnet)r.drops.forEach(d=>{const dd=Math.hypot(p.x-d.x,p.y-d.y);if(dd<220&&dd>1){d.x+=(p.x-d.x)/dd*240*dt;d.y+=(p.y-d.y)/dd*240*dt}});
      r.drops=r.drops.filter(d=>!(Math.hypot(p.x-d.x,p.y-d.y)<22&&giveDrop(p,d.k)));
      r.peds=r.peds.filter(pd=>!pd.gone&&!(Math.hypot(p.x-pd.x,p.y-pd.y)<24&&grabPed(p,pd)));r.peds=r.peds.filter(q=>!q.gone).concat(S.pedAdd);S.pedAdd=[];
      if(S.trap&&Math.hypot(p.x-W/2,p.y-H/2-60)<26&&!S.over){floor(S.fl+1);return}
      /* raio contínuo */
      if(p.f.beam&&p.beamT>0){p.beamT-=dt;S.beams.push(...(p.beamA||[]).map(a=>({x:p.x,y:p.y,a,o:p.u})));const dps=p.dmg/p.rate*1.15;
        (p.beamA||[]).forEach(a=>{let len=620;if(!p.f.spectral)r.rocks.forEach(k=>{const t=(k.x-p.x)*Math.cos(a)+(k.y-p.y)*Math.sin(a);if(t>0){const dd=Math.abs(-(k.x-p.x)*Math.sin(a)+(k.y-p.y)*Math.cos(a));if(dd<k.r)len=Math.min(len,t)}});p.beamL=len;
          S.en.forEach(e=>{const t=(e.x-p.x)*Math.cos(a)+(e.y-p.y)*Math.sin(a);if(t<0||t>len)return;const dd=Math.abs(-(e.x-p.x)*Math.sin(a)+(e.y-p.y)*Math.cos(a));if(dd<e.r+8)hitFoe(e,dps*dt,p.f,p)})})}
      /* reviver */
      if(coop&&i.f){const dn=S.ps.find(q=>q.dead&&q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<50);if(dn){dn.rev+=dt;if(dn.rev>=2){dn.dead=false;dn.hp=2;dn.inv=2;dn.rev=0;say(`${p.n} reviveu ${dn.n}!`);fx5('mgWin');C.achieve?.('ab_reviver')}}}
    });
    if(S.over||S.room!==r)return;
    const live=S.ps.filter(p=>!p.dead);if(!live.length)return;
    const tgtOf=e=>S.decoy?S.decoy:live.reduce((a,b)=>Math.hypot(b.x-e.x,b.y-e.y)<Math.hypot(a.x-e.x,a.y-e.y)?b:a);
    const spk=S.slowT>0?.4:1;
    S.en.forEach(e=>{const t=tgtOf(e),dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1,sl=(e.slow>0?.5:1)*spk*ESP;e.slow=Math.max(0,e.slow-dt);
      if(e.pois>0){e.pois-=dt;e.hp-=.8*dt}
      if(e.k==='traco'||e.k==='larva'){e.x+=dx/d*e.spd*sl*dt;e.y+=dy/d*e.spd*sl*dt;wallClamp(e)}
      if(e.k==='mosca'||e.k==='fantasma'){e.ph+=dt*4;e.x+=(dx/d*e.spd*.6+Math.cos(e.ph*1.7)*110)*sl*dt;e.y+=(dy/d*e.spd*.6+Math.sin(e.ph*2.3)*110)*sl*dt;wallClamp(e,true)}
      if(e.k==='aranha'){e.cool-=dt*sl;if(e.cool<=0){e.cool=1.3;e.vx=dx/d*360;e.vy=dy/d*360}e.x+=e.vx*dt*sl;e.y+=e.vy*dt*sl;e.vx*=1-3*dt;e.vy*=1-3*dt;wallClamp(e)}
      if(e.k==='olho'){e.cool-=dt*sl;if(e.cool<=0){e.cool=1.8;S.eb.push({x:e.x,y:e.y,vx:dx/d*220*ESP,vy:dy/d*220*ESP,r:6})}}
      if(e.k==='torre'){e.cool-=dt*sl;if(e.cool<=0){e.cool=2.2;e.ph=(e.ph||0)+1;for(let k=0;k<4;k++){const a=k*Math.PI/2+(e.ph%2)*Math.PI/4;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*190*ESP,vy:Math.sin(a)*190*ESP,r:6})}}}
      if(e.k==='boss'){e.cool-=dt*sl;const hp=e.hp/e.max;e.a+=dt;
        if(e.cool<=0){e.ph++;const B=e.b;
          if(B===0){if(e.ph%3===0){e.vx=dx/d*400;e.vy=dy/d*400;e.cool=1.4}else{for(let k=0;k<2;k++)S.en.push(foe('mosca',e.x+(k?30:-30),e.y));e.cool=hp<.5?1.6:2.2}}
          else if(B===1){if(e.ph%3===0){e.vx=dx/d*430;e.vy=dy/d*430;e.cool=1.5}else{const n=hp<.5?16:12,of=e.ph*.25;for(let k=0;k<n;k++){const a=of+k/n*TAU16;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*170*ESP,vy:Math.sin(a)*170*ESP,r:7})}e.cool=hp<.5?1.1:1.5}}
          else if(B===2){if(e.ph%4===0){e.x=120+rnd()*560;e.y=100+rnd()*200;e.cool=.6}else if(e.ph%2){for(let k=0;k<3;k++){const a=Math.atan2(dy,dx)+(k-1)*.2;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*240*ESP,vy:Math.sin(a)*240*ESP,r:7})}e.cool=.7}else{e.spiral=1.6;e.cool=1.8}}
          else{const stg=hp>.6?0:hp>.3?1:2;if(e.ph%3===0){e.vx=dx/d*(420+stg*80);e.vy=dy/d*(420+stg*80);e.cool=1.3-stg*.2}else if(e.ph%3===1){const n=12+stg*6;for(let k=0;k<n;k++){const a=e.ph*.3+k/n*TAU16;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*(170+stg*20)*ESP,vy:Math.sin(a)*(170+stg*20)*ESP,r:7})}e.cool=1.2-stg*.2}else{if(stg>=1)for(let k=0;k<2;k++)S.en.push(foe('traco',e.x,e.y+(k?30:-30)));e.spiral=1.4;e.cool=1.6}}}
        if(e.spiral>0){e.spiral-=dt;e.st=(e.st||0)-dt;if(e.st<=0){e.st=.07;const a=e.a*5;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*190*ESP,vy:Math.sin(a)*190*ESP,r:6})}}
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=1-2.5*dt;e.vy*=1-2.5*dt;e.x=clamp12(e.x,WL+e.r,W-WL-e.r);e.y=clamp12(e.y,WL+e.r,H-WL-e.r)}
      live.forEach(p=>{if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+11)hurt(p,e)});
      if(S.decoy&&Math.hypot(S.decoy.x-e.x,S.decoy.y-e.y)<e.r+10)S.decoy.t-=dt*.5});
    /* orbitais */
    S.ps.forEach(p=>{if(p.dead||!p.f.orb)return;for(let k=0;k<p.f.orb;k++){const a=S.ot*2.86+k*TAU16/p.f.orb,ox=p.x+Math.cos(a)*42,oy=p.y+Math.sin(a)*42;
      S.eb.forEach(b=>{if(Math.hypot(b.x-ox,b.y-oy)<b.r+8)b.dead=true});S.en.forEach(e=>{if(Math.hypot(e.x-ox,e.y-oy)<e.r+8)hitFoe(e,2.5*dt)})}});
    /* lágrimas */
    const add=[];
    S.tears.forEach(b=>{b.t+=dt;const f=b.f;
      if(f.homing){let best=null,bd=260;S.en.forEach(e=>{const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;best=e}});if(best){const want=Math.atan2(best.y-b.y,best.x-b.x),cur=Math.atan2(b.vy,b.vx);let da=want-cur;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;const nr=cur+clamp12(da,-5*dt,5*dt),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(nr)*sp;b.vy=Math.sin(nr)*sp}}
      if(f.boom&&b.t>b.life*.45&&!b.back){b.back=1;b.vx*=-1;b.vy*=-1;b.hit.clear()}
      let wx=0,wy=0;if(f.wave){const s=Math.cos(b.t*14)*220;wx=-Math.sin(b.a)*s*dt;wy=Math.cos(b.a)*s*dt}
      b.x+=b.vx*dt+wx;b.y+=b.vy*dt+wy;
      const wall=b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL,rock=!f.spectral&&r.rocks.some(k=>Math.hypot(b.x-k.x,b.y-k.y)<k.r);
      if(wall||rock||b.t>b.life){b.dead=true;if(f.explo)explode(b.x,b.y,42,b.d,false,false)}
      if(b.dead)return;
      for(const e of S.en){if(b.hit.has(e)||Math.hypot(b.x-e.x,b.y-e.y)>e.r+b.r)continue;b.hit.add(e);const owner=S.ps.find(p=>p.u===b.o)||S.ps[0];hitFoe(e,b.d,f,b);
        if(f.chain){const n2=S.en.filter(q=>q!==e&&Math.hypot(q.x-e.x,q.y-e.y)<160)[0];if(n2){hitFoe(n2,b.d*.6,f,e);S.beams.push({x:e.x,y:e.y,x2:n2.x,y2:n2.y,el:1})}}
        if(f.explo)explode(b.x,b.y,42,b.d*.8,false,false);
        if(f.split&&b.gen<1){[-.6,.6].forEach(s=>{const a=Math.atan2(b.vy,b.vx)+s,sp=Math.hypot(b.vx,b.vy);add.push({...b,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,d:b.d*.5,r:Math.max(3,b.r-2),t:0,life:.4,gen:1,hit:new Set([e])})})}
        if(!f.pierce){b.dead=true;break}}});
    S.tears=S.tears.filter(b=>!b.dead).concat(add);
    /* bombas */
    S.bombs.forEach(b=>{b.t-=dt;if(b.t<=0){b.dead=true;explode(b.x,b.y,b.big?110:80,b.big?10:7,true,true)}});S.bombs=S.bombs.filter(b=>!b.dead);
    /* mortes */
    const before=S.en.length;S.en=S.en.filter(e=>{if(e.hp>0)return true;S.kills++;const killer=live[0];live.forEach(p=>{p.kills++;if(p.f.vamp&&p.kills%12===0)p.hp=Math.min(p.max,p.hp+1)});
      if(e.k==='larva'){for(let k=0;k<2;k++)S.en.push(foe('mosca',e.x+(k?14:-14),e.y))}
      const luck=S.ps.reduce((a,p)=>a+(p.f.luck||0),0);if(e.k!=='boss'&&rnd()<.16+luck*.08)r.drops.push({x:e.x,y:e.y,k:rnd()<.8?'coin':pick(['heart','bomb','key'])});
      C.fx?.burst(e.x,e.y,{n:10,col:['#8a1a2a','#ffd36b'],sp:160,life:.45,size:3,grav:0});return false});
    if(S.en.length<before)fx5('mgCoin');
    S.eb.forEach(b=>{b.x+=b.vx*dt*spk;b.y+=b.vy*dt*spk;if(b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL||r.rocks.some(k=>Math.hypot(b.x-k.x,b.y-k.y)<k.r))b.dead=true;live.forEach(p=>{if(!b.dead&&Math.hypot(p.x-b.x,p.y-b.y)<b.r+9){b.dead=true;hurt(p)}})});S.eb=S.eb.filter(b=>!b.dead);
    if(!r.clear&&!S.en.length&&(r.kind==='fight'||r.kind==='boss'))roomCleared();
  }
  const snap=()=>({fl:S.fl,tp:S.tpN|0,ps:S.ps.map(p=>({u:p.u,x:Math.round(p.x),y:Math.round(p.y),spd:p.spd,hp:p.hp,max:p.max,sh:p.sh,coins:p.coins,bombs:p.bombs,keys:p.keys,dead:p.dead,rev:+p.rev.toFixed(2),inv:+p.inv.toFixed(2),muts:p.muts,act:p.act,f:p.f,beamA:p.beamT>0?p.beamA:null,beamL:p.beamL})),
    en:S.en.map(e=>({k:e.k,b:e.b,x:Math.round(e.x),y:Math.round(e.y),r:e.r,hp:+e.hp.toFixed(1),max:e.max})),t:S.tears.map(b=>[Math.round(b.x),Math.round(b.y),b.r,b.col||tearCol(b.f)]),eb:S.eb.map(b=>[Math.round(b.x),Math.round(b.y),b.r]),bm:S.bombs.map(b=>[Math.round(b.x),Math.round(b.y)]),
    rx:S.room.x,ry:S.room.y,clear:S.room.clear,open:S.room.open||null,peds:S.room.peds,drops:S.room.drops,rocks:S.room.rocks,trap:S.trap,kills:S.kills,seen:S.roomsSeen,msg:S.msg,over:S.over,
    vis:Object.values(M.rooms).filter(q=>q.seen).map(q=>[q.x,q.y]),unl:Object.values(M.rooms).filter(q=>!q.hidden).map(q=>[q.x,q.y]),dec:S.decoy&&[Math.round(S.decoy.x),Math.round(S.decoy.y)]});
  function myInp(){const k=S.keys,i={l:!!k.KeyA,r:!!k.KeyD,u:!!k.KeyW,d:!!k.KeyS,f:!!k.KeyF,cnt:{...myCnt}};let ax=((k.ArrowRight?1:0)-(k.ArrowLeft?1:0)),ay=((k.ArrowDown?1:0)-(k.ArrowUp?1:0));
    if(!ax&&!ay&&S.aim){const p=myP();ax=S.aim[0]-p.x;ay=S.aim[1]-p.y}if(ax||ay){i.ax=ax;i.ay=ay}return i}
  const myCnt={};
  /* convidado: manda as teclas E a posição que ele mesmo calculou (anda na hora, sem esperar o servidor).
     O anfitrião segue dono dos inimigos, do dano, das salas e do fim da run. */
  let pushAt=0,pX=0,pY=0;
  function push(){const i=myInp();if(C.host||!coop){myP().inp=i;return}const p=myP();pushAt=Date.now();pX=p.x;pY=p.y;C.send('ain',{inp:i,x:Math.round(p.x),y:Math.round(p.y),tp:S.tpN|0})}
  /* predição local do próprio personagem (mesmo movimento do sim: velocidade, dash, paredes e pedras) */
  function selfMove(p,dt){if(p.dead||S.over)return;const k=S.keys;S.ldT=Math.max(0,(S.ldT||0)-dt);S.ldCd=Math.max(0,(S.ldCd||0)-dt);
    let mx=(k.KeyD?1:0)-(k.KeyA?1:0),my=(k.KeyS?1:0)-(k.KeyW?1:0);const n=Math.hypot(mx,my)||1,sp=(p.spd||0)*(S.ldT>0?2.6:1);p.r=13;p.x+=mx/n*sp*dt;p.y+=my/n*sp*dt;wallClamp(p,p.f&&p.f.ghost)}
  floor(0);
  const G=window.GFX60,art=abArt51();G.skin({acc:art.TH[0].acc});
  /* alvo mais próximo, só para o desenho do olhar */
  const live51=e=>{let best=null,bd=1e9;for(const p of S.ps){if(p.dead)continue;const d=Math.hypot(p.x-e.x,p.y-e.y);if(d<bd){bd=d;best=p}}return best};
  return{g60intro:{title:'Labirinto do Abismo',sub:coop?'Co-op · desça os 4 andares':o.m==='day'?'Desafio do Dia':'Desça os 4 andares',acc:art.TH[0].acc},st:()=>S,map:()=>M,enter,floor,fire:(ax,ay)=>fire(myP(),ax,ay),grab:pd=>grabPed(myP(),pd),explode,useActive:()=>useActive(myP()),
    reward:()=>S.rw||null,
    next(){return coop?null:{opt:{},label:'🗝 Nova run'}},
    key(code,down){const was=!!S.keys[code];S.keys[code]=down;if(down&&!was){const m={KeyE:'B',Space:'A',ShiftLeft:'D',ShiftRight:'D'}[code];if(m)myCnt[m]=(myCnt[m]|0)+1;
        if(m==='D'&&coop&&!C.host){const p=myP();if(p.f&&p.f.dash&&!(S.ldCd>0)){S.ldT=.22;S.ldCd=.9}}}push()},
    ptr(t,px,py,e){if(touch12()&&!(e&&e.pointerType==='mouse'))return;if(t==='down'||(t==='move'&&S.aim))S.aim=[px,py];if(t==='up')S.aim=null;push()},
    msg(p){
      if(C.host&&p.t==='ain'){const pl=S.ps.find(q=>q.u===p.from);if(pl){pl.inp=p.inp||{};
        /* posição do convidado: só vale na mesma sala (tp igual ao da última troca de sala) */
        if(isFinite(p.x)&&isFinite(p.y)&&(p.tp|0)===(S.tpN|0)&&!pl.dead){pl.x=Number(p.x);pl.y=Number(p.y);pl.r=13;wallClamp(pl,pl.f&&pl.f.ghost)}}}
      if(!C.host&&p.t==='as'&&p.st&&p.from===C.room.host){const st=p.st;if(st.fl!==S.fl){S.fl=st.fl;M=abGen51(seed,st.fl)}
        const newRoom=st.tp!=null&&(st.tp|0)!==(S.tpN|0);if(st.tp!=null)S.tpN=st.tp|0;
        st.ps.forEach(g=>{const pl=S.ps.find(q=>q.u===g.u);if(!pl)return;
          /* o próprio personagem é previsto aqui: mantém a posição local, salvo troca de sala ou diferença absurda */
          if(g.u===C.me&&!g.dead&&!newRoom&&Math.hypot(pl.x-g.x,pl.y-g.y)<140){const x0=pl.x,y0=pl.y;Object.assign(pl,g);pl.x=x0;pl.y=y0}else Object.assign(pl,g);
          pl.beamT=g.beamA?.1:0});S.en=st.en;S.tV=st.t;S.ebV=st.eb;S.bmV=st.bm;
        const rm=M.rooms[M.K(st.rx,st.ry)];if(rm){S.room=rm;rm.clear=st.clear;rm.open=st.open;rm.peds=st.peds;rm.drops=st.drops;rm.rocks=st.rocks;rm.seen=true}
        st.vis.forEach(([x,y])=>{const q=M.rooms[M.K(x,y)];if(q)q.seen=true});st.unl.forEach(([x,y])=>{const q=M.rooms[M.K(x,y)];if(q)q.hidden=false});
        S.trap=st.trap;S.kills=st.kills;S.roomsSeen=st.seen;if(st.msg!==S.msg){S.msg=st.msg;S.msgT=performance.now()}S.over=st.over;S.decoy=st.dec?{x:st.dec[0],y:st.dec[1]}:null}},
    left(u){if(!C.host)return;const p=S.ps.find(q=>q.u===u);if(p){p.dead=true;if(S.ps.every(q=>q.dead))end(false)}},
    step(dt){
      if(Date.now()<C.t0)return;
      /* mira com o mouse mandava uma mensagem por quadro (60/s); agora no máximo ~20/s */
      if(coop&&!C.host){S.ot+=dt;const p=myP();selfMove(p,dt);const now=Date.now(),moved=Math.abs(p.x-pX)>.5||Math.abs(p.y-pY)>.5;if(((S.aim||moved)&&now-pushAt>=50)||now-pushAt>400)push()}
      else if(S.aim)push();
      if(C.host||!coop){S.beams=[];sim(dt);if(coop&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('as',{st:snap()})}}
      const p=myP();C.hud(G.chips([{icon:'chave',label:ABF51[S.fl].n},{icon:'coracao',label:'Vida',value:`${p.hp/2}/${p.max/2}`,tone:p.hp<=2?'bad':null},p.sh?{icon:'escudo',value:p.sh}:null,{icon:'moeda',value:p.coins},{icon:'caveira',label:'Bombas',value:p.bombs},{icon:'chave',label:'Chaves',value:p.keys},p.act?{icon:'raio',label:ACT51[p.act.k].n,value:`${p.act.ch}/${ACT51[p.act.k].max}`,tone:p.act.ch>=ACT51[p.act.k].max?'ok':null}:null,{icon:'alvo',label:'Abates',value:S.kills}]))},
    draw(x){
      const r=S.room,T=ABF51[S.fl],A=art.TH[S.fl],now=performance.now(),t=now/1000,red=G.reduced(),V=art.V,KC=art.KINDC[r.kind];
      x.drawImage(art.room(S.fl,r.kind,r.seed|0),0,0,W,H);
      /* portas */
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const n=nb(r,dx,dy);
        if(!n){if(secretWall(r,dx,dy)){const cx=dx?(dx<0?WL/2:W-WL/2):W/2,cy=dy?(dy<0?WL/2:H-WL/2):H/2;x.lineCap='round';[['rgba(0,0,0,.75)',2.6,0],['rgba(255,240,220,.35)',1,1.4]].forEach(([c,lw,o])=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();x.moveTo(cx-13+o,cy-9);x.lineTo(cx-3+o,cy+1);x.lineTo(cx+11+o,cy-7);x.moveTo(cx-3+o,cy+1);x.lineTo(cx+2+o,cy+12);x.stroke()})}return}
        const st=!r.clear?'shut':n.locked?'locked':'open',im=art.door(S.fl,st),X=dy?W/2:dx<0?0:W,Y=dx?H/2:dy<0?0:H,ang=dy<0?0:dy>0?Math.PI:dx<0?-Math.PI/2:Math.PI/2;
        x.save();x.translate(X,Y);x.rotate(ang);x.drawImage(im,-(DOOR+20)/2,0,DOOR+20,WL+6);x.restore();
        const kc=art.KINDC[n.kind],tx=dy?W/2:dx<0?WL/2:W-WL/2,ty=dx?H/2:dy<0?WL/2:H-WL/2;
        if(st==='open')G.glow(x,tx,ty,46,kc?kc[0]:A.light,.3);
        if(kc&&!n.locked){x.fillStyle='rgba(10,4,14,.85)';x.beginPath();x.arc(tx,ty,11,0,TAU16);x.fill();x.strokeStyle=kc[0];x.lineWidth=1.6;x.stroke();G.icon(x,kc[1],tx,ty,15,kc[0])}});
      /* rochas */
      r.rocks.forEach(k=>{G.shadow(x,k.x+3,k.y+k.r*.75,k.r*2.5,{alpha:.6});const im=art.rock(S.fl,Math.round(k.r),(Math.round(k.x)+Math.round(k.y))%3),d=k.r*2+8;x.drawImage(im,k.x-d/2,k.y-d/2,d,d)});
      /* luz do ambiente (os personagens e os tiros vêm por cima, sempre legíveis) */
      const L=art.lights().begin(r.kind==='secret'?.56:r.kind==='start'||r.kind==='shop'?A.dark-.12:A.dark);
      S.ps.forEach(p=>{if(!p.dead)L.add(p.x,p.y,190,null,1)});
      art.TORCH.forEach(([X,Y],i)=>L.add(X,Y,150+(red?0:Math.sin(t*8+i*1.9)*9),A.light,.85));
      L.add(W/2,H/2,230,KC?KC[0]:null,KC?.6:.45);S.en.forEach(e=>{if(e.k==='boss')L.add(e.x,e.y,180,'#ff4a6a',.7)});S.booms.forEach(b=>L.add(b.x,b.y,b.r*2.4,'#ffb050',1));
      L.apply(x,{glow:.2});
      art.TORCH.forEach(([X,Y],i)=>{const f=red?0:Math.sin(t*11+i*2.1);x.fillStyle=A.light;x.beginPath();x.ellipse(X+f,Y-5,4,8+f*1.5,0,0,TAU16);x.fill();x.fillStyle='#fff6d8';x.beginPath();x.ellipse(X,Y-3,1.8,4,0,0,TAU16);x.fill();G.glow(x,X,Y-5,20,A.light,.7)});
      art.amb(S.fl).draw(x,t);
      if(S.trap&&r.kind==='boss'){const X=W/2,Y=H/2+60;G.glow(x,X,Y,58,'#b48cff',.5+(red?0:.15*Math.sin(t*4)));x.fillStyle='#6a5a48';rr21(x,X-30,Y-24,60,48,8);x.fill();x.fillStyle='#000';rr21(x,X-24,Y-18,48,36,5);x.fill();for(let i=0;i<4;i++){x.fillStyle=`rgba(150,110,200,${.55-i*.12})`;x.fillRect(X-18+i*4,Y-12+i*8,36-i*8,4)}x.strokeStyle='#d8a83c';x.lineWidth=2;rr21(x,X-27,Y-21,54,42,7);x.stroke();G.hud.chip(x,X,H/2+100,{icon:'seta',text:'alçapão',col:'#d8c0ff',size:11,al:'center',min:9})}
      r.drops.forEach(d=>{const bob=red?0:Math.sin(now/300+d.x)*2;G.shadow(x,d.x,d.y+11,22,{alt:bob+2,alpha:.55});if(d.k==='coin'||d.k==='key')G.glow(x,d.x,d.y,17,'#ffd36b',.3);const im=art.drop(d.k),sx=d.k==='coin'&&!red?.35+.65*Math.abs(Math.cos(now/330+d.x)):1;G.draw(x,im,d.x,d.y+bob,{w:26,h:26,sx})});
      r.peds.forEach(pd=>{const b=red?0:Math.sin(now/300+pd.x)*3,key=pd.mut!=null?MUT51[pd.mut][0]:pd.act?'a_'+pd.act:null,col=pd.pact?'#ff3a4a':pd.act?'#ffd36b':'#c39bff';
        G.draw(x,art.pedestal(pd.pact),pd.x,pd.y+14,{w:48,h:30});G.glow(x,pd.x,pd.y-8+b,34,col,.5);
        if(key){G.rays(x,pd.x,pd.y-8+b,{n:6,len:40,col,a:.18,t:t*3});G.draw(x,art.relic(key),pd.x,pd.y-9+b,{w:36,h:36})}else G.draw(x,art.drop(pd.k),pd.x,pd.y-8+b,{w:30,h:30});
        const lbl=pd.mut!=null?MUT51[pd.mut][1]:pd.act?ACT51[pd.act].n:'';if(lbl&&S.ps.some(p=>Math.hypot(p.x-pd.x,p.y-pd.y)<110))G.hud.text(x,lbl,clamp12(pd.x,90,W-90),pd.y-40,{size:12,al:'center',col:'#f0e0ff',stroke:4,min:10});
        if(pd.p!=null){G.hud.chip(x,pd.x,pd.y+34,{icon:'moeda',text:String(pd.p),col:'#ffd36b',size:12,al:'center',min:9})}if(pd.pact)G.hud.chip(x,pd.x,pd.y+34,{icon:'coracao',text:`-${pd.pact/2} máx.`,col:'#ff6b6b',size:12,al:'center',min:9})});
      (S.bmV||S.bombs.map(b=>[b.x,b.y])).forEach(([bx,by])=>{const on=Math.floor(now/120)%2,k=red?1:1+(on?.08:0);G.shadow(x,bx,by+12,30,{alpha:.55});G.draw(x,art.drop('bomb'),bx,by-2,{w:34*k,h:34*k});G.glow(x,bx+13,by-16,on?20:12,on?'#ff4a3a':'#ffd36b',.9);if(on)G.glow(x,bx,by,24,'#ff2a1a',.35)});
      S.booms=S.booms.filter(b=>now-b.t<350);S.booms.forEach(b=>{const k=(now-b.t)/350;if(!V.seen.has(b)){V.seen.set(b,1);G.emit('explosao',b.x,b.y,{size:Math.min(1.5,b.r/60),amount:b.r>60?1:.5});if(b.r>60)G.hitstop(80)}
        G.glow(x,b.x,b.y,b.r*(.9+k),'#ff8a20',.9*(1-k));G.glow(x,b.x,b.y,b.r*.7,'#fff3c0',1-k);x.strokeStyle=`rgba(255,220,150,${1-k})`;x.lineWidth=6*(1-k)+1;x.beginPath();x.arc(b.x,b.y,b.r*(.5+k*.6),0,TAU16);x.stroke()});
      if(S.decoy){G.shadow(x,S.decoy.x,S.decoy.y+14,30);G.glow(x,S.decoy.x,S.decoy.y,46,'#ffb347',.5);x.globalAlpha=.45;sprAt16(x,myP().c,S.decoy.x,S.decoy.y-10,32);x.globalAlpha=1;x.fillStyle='#efe2bc';x.fillRect(S.decoy.x-4,S.decoy.y,8,14);x.fillStyle='#ffb33a';x.beginPath();x.ellipse(S.decoy.x,S.decoy.y-5,3.5,7,0,0,TAU16);x.fill()}
      /* inimigos */
      let boss=null;
      S.en.forEach((e,i)=>{const fl=now-(e.hitT||0)<80,ph=i*.37,fr=red?0:Math.floor(t*(e.k==='mosca'||(e.k==='boss'&&e.b===0)?14:e.k==='boss'||e.k==='torre'?2.5:6)+ph)&1,w=art.walk('e'+i+e.k,e.x,e.y,t),fly=e.k==='mosca'||e.k==='fantasma',hov=fly&&!red?Math.sin(t*5+i)*3:0;
        if(e.k==='boss'){boss=e;const b=e.b||0,sz=e.r*3.1,bob=red?0:Math.sin(t*2.2)*4,im=art.bossImg(b,fr),col=['#8ac030','#a8d0ff','#a070ff','#ff2a7a'][b];
          G.shadow(x,e.x,e.y+e.r*1.15,e.r*2.6,{alt:12+bob,alpha:.65});G.glow(x,e.x,e.y,e.r*2,col,.3);G.draw(x,fl?G.tint(im,'#ffffff',.65):im,e.x,e.y+bob,{w:sz,h:sz,flip:w.d>0&&b!==3});
          if(b===2){const p=live51(e),a=p?Math.atan2(p.y-e.y,p.x-e.x):Math.PI/2,u=sz/192,X=e.x+Math.cos(a)*u*15,Y=e.y+bob+Math.sin(a)*u*15;x.fillStyle='#6a2ac0';x.beginPath();x.arc(X,Y,u*24,0,TAU16);x.fill();x.fillStyle='#08020f';x.beginPath();x.ellipse(X+Math.cos(a)*u*5,Y+Math.sin(a)*u*5,u*8,u*15,0,0,TAU16);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X-u*8,Y-u*10,u*5,0,TAU16);x.fill();G.glow(x,X,Y,u*40,'#c58bff',.45);for(let k=0;k<4;k++){const q=(red?0:t*1.8)+k*TAU16/4,ox=e.x+Math.cos(q)*e.r*1.55,oy=e.y+bob+Math.sin(q)*e.r*.55;G.draw(x,G.prop.crystal('#b9a6ff',12,24),ox,oy,{alpha:.95});G.glow(x,ox,oy,16,'#b48cff',.5)}}}
        else{const sz=e.r*(e.k==='mosca'?4.4:e.k==='aranha'?4.1:e.k==='torre'?3.7:3.5),im=art.foeImg(e.k,fr),Y=e.y+hov-(fly?4:0);
          G.shadow(x,e.x,e.y+e.r*.95,e.r*2.4,{alt:fly?14+hov:0,alpha:.55});G.draw(x,fl?G.tint(im,'#ffffff',.85):im,e.x,Y,{w:sz,h:sz,flip:w.d<0&&e.k!=='torre',sy:!red&&e.k==='traco'?1+Math.sin(t*9+i)*.05:1});
          if(e.k==='olho'){const p=live51(e);if(p){const a=Math.atan2(p.y-e.y,p.x-e.x),u=sz/96,X=e.x+Math.cos(a)*u*7,Yy=Y+Math.sin(a)*u*7;x.fillStyle='#3a80c8';x.beginPath();x.arc(X,Yy,u*10.5,0,TAU16);x.fill();x.fillStyle='#08040c';x.beginPath();x.arc(X+Math.cos(a)*u*2,Yy+Math.sin(a)*u*2,u*5,0,TAU16);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X-u*3.5,Yy-u*4,u*2.4,0,TAU16);x.fill()}}
          if(e.hp<e.max&&(e.k==='torre'||e.max>9))G.hud.bar(x,e.x-16,e.y-e.r-12,32,4,e.hp/e.max,{col:'#ff5b6b'})}
        if(e.pois>0){x.strokeStyle='#7dffa8';x.lineWidth=2;x.setLineDash([4,4]);x.beginPath();x.arc(e.x,e.y,e.r+3,0,TAU16);x.stroke();x.setLineDash([]);G.glow(x,e.x,e.y,e.r*1.5,'#2aff6a',.25)}if(e.slow>0){x.strokeStyle='#9fe8ff';x.lineWidth=2;x.beginPath();x.arc(e.x,e.y,e.r+5,0,TAU16);x.stroke();G.glow(x,e.x,e.y,e.r*1.7,'#7fd0ff',.25)}});
      /* raios e correntes */
      S.ps.forEach(p=>{if(!p.beamT&&!p.beamA)return;if(!(p.beamT>0))return;(p.beamA||[]).forEach(a=>{const Ln=p.beamL||620,ex=p.x+Math.cos(a)*Ln,ey=p.y+Math.sin(a)*Ln;x.save();x.globalCompositeOperation='lighter';x.lineCap='round';[[24,'rgba(255,190,60,.22)'],[13,'rgba(255,220,110,.55)'],[7,'rgba(255,244,190,.95)'],[2.5,'#ffffff']].forEach(([lw,c],k)=>{x.strokeStyle=c;x.lineWidth=lw+(red||k>1?0:Math.sin(t*30+k)*2);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(ex,ey);x.stroke()});x.restore();G.glow(x,ex,ey,30,'#ffd36b',.9);G.glow(x,p.x,p.y,30,'#ffd36b',.7)})});
      S.beams.filter(b=>b.el).forEach(b=>{const dx=b.x2-b.x,dy=b.y2-b.y,pts=[0,1,2,3,4,5].map(k=>{const j=k&&k<5?Math.sin(k*12.7+now/40)*9:0,l=Math.hypot(dx,dy)||1;return[b.x+dx*k/5-dy/l*j,b.y+dy*k/5+dx/l*j]});x.lineJoin='round';[[6,'rgba(255,242,122,.35)'],[2,'#fffbe0']].forEach(([lw,c])=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();pts.forEach((q,k)=>k?x.lineTo(...q):x.moveTo(...q));x.stroke()})});
      /* jogadores */
      S.ps.forEach(p=>{if(p.dead){G.shadow(x,p.x,p.y+12,34);x.globalAlpha=.5;const im=spr(p.c);if(im){x.save();x.translate(p.x,p.y+4);x.rotate(-1.45);x.drawImage(G.tint(im,'#8a8a9a',.8),-17,-17,34,34);x.restore()}x.globalAlpha=1;x.fillStyle='#b8b0c4';rr21(x,p.x-3,p.y-26,6,22,2);x.fill();rr21(x,p.x-9,p.y-20,18,6,2);x.fill();if(coop){x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=5;x.beginPath();x.arc(p.x,p.y,22,0,TAU16);x.stroke();x.strokeStyle='#ffd36b';x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,22,-Math.PI/2,-Math.PI/2+TAU16*(p.rev/2));x.stroke();G.hud.chip(x,p.x,p.y+34,{text:'F reviver',col:'#ffd36b',size:10,al:'center',min:9})}return}
        const w=art.walk('p'+p.u,p.x,p.y,t),mv=t-w.t<.12,bob=mv&&!red?-Math.abs(Math.sin(t*15))*4:0,nm=p.muts.length;
        G.shadow(x,p.x,p.y+15+Math.min(5,nm/2),34+nm,{alt:-bob,alpha:.6});
        if(p.f.orb)for(let k=0;k<p.f.orb;k++){const a=S.ot*2.86+k*TAU16/p.f.orb,ox=p.x+Math.cos(a)*42,oy=p.y+Math.sin(a)*42;G.glow(x,ox,oy,17,'#b48cff',.7);G.draw(x,G.prop.orb('#b48cff',7),ox,oy)}
        if(p.inv>0&&p.inv<1&&Math.floor(now/90)%2)return;if(nm)G.glow(x,p.x,p.y,30+Math.min(12,nm*1.5),p.f.beam?'#ffdc78':p.f.homing?'#be8cff':'#ffc878',.2+Math.min(.3,nm*.04));else G.glow(x,p.x,p.y,26,mgCol(p.c),.2);
        if(p.inv>=1&&p.f){x.strokeStyle='rgba(255,230,140,.8)';x.lineWidth=2.5;x.beginPath();x.arc(p.x,p.y,25,0,TAU16);x.stroke();G.glow(x,p.x,p.y,34,'#ffe68c',.4)}
        const size=36+Math.min(10,nm),im=spr(p.c);if(im)G.draw(x,im,p.x,p.y+bob,{w:size,h:size,flip:w.d>0,rot:mv&&!red?Math.sin(t*15)*.09:0,sy:mv||red?1:1+Math.sin(t*3)*.03});else sprAt16(x,p.c,p.x,p.y+bob,size);
        if(p.sh>0){x.strokeStyle='rgba(110,200,255,.75)';x.lineWidth=1.6;x.beginPath();x.arc(p.x,p.y+bob,size*.62,0,TAU16);x.stroke()}
        if(coop)G.hud.text(x,p.n,p.x,p.y-30,{size:11,al:'center',stroke:3,col:mgCol(p.c),min:9});
        const k='h'+p.u,was=V.hp.get(k);if(was!=null&&p.hp<was){G.impact(p.x,p.y,{col:'#ff4a5a',force:p.u===C.me?1.2:.6});if(p.u===C.me)V.hurtAt=now}V.hp.set(k,p.hp)});
      /* tiros: por cima de tudo, no tamanho exato da colisão */
      (S.tV||S.tears.map(b=>[b.x,b.y,b.r,b.col||tearCol(b.f)])).forEach(([bx,by,br,col])=>{const d=br*4;x.drawImage(art.shot(col,false),bx-d/2,by-d/2,d,d)});
      (S.ebV||S.eb.map(b=>[b.x,b.y,b.r])).forEach(([bx,by,br])=>{const d=br*4*(red?1:1+Math.sin(t*14+bx*.05)*.07);x.drawImage(art.shot('#ff4a7a',true),bx-d/2,by-d/2,d,d)});
      /* mortes e chefe derrotado (só imagem) */
      if(V.room!==r){V.room=r;V.n=S.en.length;V.boss=null;V.pos.clear()}else{if(S.en.length<V.n)G.hitstop(35,{zoom:.006});V.n=S.en.length}
      if(boss)V.boss={x:boss.x,y:boss.y};else if(V.boss){G.emit('explosao',V.boss.x,V.boss.y,{size:1.8,amount:1.5});G.emit('confete',V.boss.x,V.boss.y);G.hitstop(140,{zoom:.03});V.boss=null;V.bar=1}
      G.vignette(x,W,H,{a:.5});
      if(now-(V.hurtAt||-999)<320)G.vignette(x,W,H,{a:.75*(1-(now-V.hurtAt)/320),col:'#c0001a'});
      /* minimapa */
      const ms=13;{const cells=Object.values(M.rooms).filter(q=>{if(q.hidden)return false;const near=Object.values(M.rooms).some(o=>o.seen&&!o.hidden&&Math.abs(o.x-q.x)+Math.abs(o.y-q.y)===1);q.near51=near;return q.seen||near});
        if(cells.length)G.hud.panel(x,W-107,3,7*ms+12,7*9+8,{acc:A.acc,a:.72,r:6});
        cells.forEach(q=>{const X=W-100+q.x*ms,Y=6+q.y*9,kc=art.KINDC[q.kind];x.fillStyle=q===r?'#ffd36b':q.seen?'#8a8098':'#40384c';x.fillRect(X,Y,ms-2,7);if(q===r){x.strokeStyle='#fff';x.lineWidth=1;x.strokeRect(X-.5,Y-.5,ms-1,8)}if(kc){x.fillStyle='rgba(10,4,14,.8)';x.beginPath();x.arc(X+ms/2-1,Y+3.5,4.8,0,TAU16);x.fill();G.icon(x,kc[1],X+ms/2-1,Y+3.5,8.5,kc[0])}})}
      /* HUD */
      const p=myP(),hs=G.fs(17,12),n=Math.ceil(p.max/2);let hx=WL+8+hs/2;const hy=WL+6+hs/2;
      for(let k=0;k<n;k++){const v=p.hp-k*2;G.icon(x,'coracao',hx,hy+1,hs*1.16,'rgba(10,2,6,.85)');G.icon(x,'coracao',hx,hy,hs,'#4a1a26');if(v>0){x.save();if(v<2){x.beginPath();x.rect(hx-hs/2,hy-hs/2,hs/2,hs);x.clip()}G.icon(x,'coracao',hx,hy,hs,'#ff4a5a');x.restore()}hx+=hs*1.08}
      for(let k=0;k<p.sh;k++){G.icon(x,'escudo',hx,hy+1,hs*1.14,'rgba(2,8,14,.85)');G.icon(x,'escudo',hx,hy,hs*.96,'#6ad0ff');hx+=hs*1.08}
      {let cx=WL+8;const cs=G.fs(13,10),cy=hy+hs*.7+cs;[['moeda',p.coins,'#ffd36b'],['caveira',p.bombs,'#ff9b6a'],['chave',p.keys,'#e8d9a0']].forEach(([ic,v,col],i)=>{if(i===1){const w=cs*2.9+cs*String(v).length*.62;x.fillStyle='rgba(18,12,28,.84)';rr21(x,cx,cy-cs*.875,w,cs*1.75,cs*.875);x.fill();x.strokeStyle=G.rgba(col,.6);x.lineWidth=1.2;x.stroke();G.draw(x,art.drop('bomb'),cx+cs*1.1,cy,{w:cs*1.55,h:cs*1.55});G.hud.text(x,String(v),cx+cs*2.1,cy+1,{size:cs,w:800,stroke:0,min:9});cx+=w+5}else cx+=G.hud.chip(x,cx,cy,{icon:ic,text:String(v),col,size:cs,min:9})+5});
        if(p.act){const Ac=ACT51[p.act.k],full=p.act.ch>=Ac.max,ay=cy+cs*1.1+18;if(full)G.glow(x,WL+24,ay,30,'#ffd36b',.5+(red?0:.2*Math.sin(t*6)));G.draw(x,art.relic('a_'+p.act.k),WL+24,ay,{w:32,h:32,alpha:full?1:.7});G.hud.bar(x,WL+44,ay-4,46,8,p.act.ch/Ac.max,{col:full?'#ffd36b':'#8a7aa0',segs:Ac.max})}}
      if(p.muts.length){const n2=p.muts.length,gap=Math.min(23,420/n2);p.muts.forEach((k,i)=>x.drawImage(art.relic(k),WL+4+i*gap,H-WL-27,24,24))}
      if(boss){const b=boss.b||0,v=Math.max(0,boss.hp)/boss.max;V.bar=v>V.bar?v:V.bar+(v-V.bar)*.05;G.hud.panel(x,W/2-172,H-31,344,28,{acc:'#ff4a5a',a:.9,r:7});G.icon(x,'caveira',W/2-157,H-17,16,'#ff8a8a');G.hud.bar(x,W/2-142,H-12,292,6,v,{col:'#e0303a',bg:'#3a0810',ghost:V.bar});G.hud.text(x,ABF51[b].boss,W/2+4,H-21,{size:11,al:'center',w:900,col:'#ffd8d0',stroke:0,min:9,max:260})}
      G.hud.text(x,`${T.n} · andar ${S.fl+1}/4`,W-WL-8,H-WL-12,{size:11,al:'right',col:'#d8cce0',stroke:3,min:9});
      G.hud.frame(x,W,H,{acc:A.acc,a:.45});
      if(S.msg&&now-S.msgT<2600&&Date.now()>=C.t0){const msg=G.clean(S.msg),k=Math.min(1,(2600-(now-S.msgT))/300),fs=G.fs(16,11);x.save();x.globalAlpha=k;x.font=`800 ${fs}px "IBM Plex Sans",system-ui,sans-serif`;const w=Math.min(W-240,x.measureText(msg).width+36),Y=Math.max(70,hy+fs*3.6);G.hud.panel(x,W/2-w/2,Y-fs,w,fs*2,{acc:'#ffd36b',a:.9});G.hud.text(x,msg,W/2,Y+1,{size:fs,al:'center',w:800,col:'#ffe9b0',max:w-18,stroke:0});x.restore()}
      if(now-S.flMsg<1800){const k=1-(now-S.flMsg)/1800;x.fillStyle=`rgba(0,0,0,${.65*k})`;x.fillRect(0,0,W,H);if(Date.now()>=C.t0)G.hud.banner(x,W,H,`Andar ${S.fl+1} · ${T.n}`,{sub:T.boss,k:Math.min(1,k*2.5),acc:A.acc,y:H/2})}
    }
  };
}
Object.assign(ACH,{
  abismo:{ico:'🗝',n:'Limpa-Abismo',d:'Derrote o Perseus do Véu no fundo do Labirinto do Abismo.'},
  ab_sinergia:{ico:'🧬',n:'Sinergia',d:'Junte 6 mutações numa mesma run do Abismo.'},
  ab_pacto:{ico:'⛧',n:'Pactário',d:'Aceite 2 pactos numa mesma run do Abismo.'},
  ab_segredo:{ico:'🕳',n:'Explorador do Abismo',d:'Encontre uma Sala Secreta com bombas.'},
  ab_loja:{ico:'🛒',n:'Freguês do Abismo',d:'Compre 4 itens na loja numa mesma run.'},
  ab_reviver:{ico:'🤝',n:'Ninguém Fica Para Trás',d:'Reviva o colega no Co-op do Abismo.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='ab51')return`<div>${b('KeyA','◀','','Andar à esquerda')}${b('KeyW','▲','','Andar para cima')}${b('KeyS','▼','','Andar para baixo')}${b('KeyD','▶','','Andar à direita')}</div><div>${b('ArrowLeft','←','','Atirar à esquerda')}${b('ArrowUp','↑','','Atirar para cima')}${b('ArrowDown','↓','','Atirar para baixo')}${b('ArrowRight','→','','Atirar à direita')}</div><div>${b('KeyE','💣','','Bomba')}${b('Space','✨','','Item Ativo')}${b('ShiftLeft','👣','','Dash')}${b('KeyF','🤝','','Reviver')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('abismo',{...GAMES12.abismo,make:abismo51,setup:abSetup51,pad:'ab51',
  desc:'Roguelike em 4 andares: Combate, Tesouro, Loja, Pacto, Sala Secreta e Chefe. 35 mutações que se combinam, itens ativos, bombas e chaves. Co-op para 2.',
  rule:'Desça até o Núcleo do Véu e derrote o Perseus do Véu. Pontos por salas, inimigos, andares e Óbolos.',
  keys:'WASD anda · setas ou mouse atiram · E bomba · Espaço item ativo · Shift dash · F revive',touch:'Use os botões'});
console.info('[Tulpa] Etapa 51 carregada (Abismo 2.0)');

