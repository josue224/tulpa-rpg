/* ===================================================================
   TULPA · ETAPA 44 — 🕹 ARCADE 2.0 · ONDA 4 (parte 1)
   🏛 DEFESA DO SANTUÁRIO 2.0
   4 mapas com caminhos curvos e bifurcações. Campanha de 30 ondas ou
   Infinito. Mini-chefes a cada 5 ondas e Chefes a cada 10, com
   habilidades (curam aliados, prendem totens, invocam lacaios).
   Totens dos 5 Elementos com 3 níveis + 2 especializações no máximo.
   Sinergia de proximidade: dois totens vizinhos no Ciclo Elemental
   (Fé→Natureza→Inexistência→Ilusão→Verdade→Fé) ativam o Sub-Elemento:
   ☉ Sol, ◌ Desrealização, ⁂ Pofenia, ✎ Confabulação, ✦ Metáfora.
   Inimigos Rápidos, Blindados, Invisíveis, Regeneradores e Divisores.
   Poderes: 🧱 Muralha de Fé e 🌧 Chuva de Essência. Velocidade 1x/2x/3x.
   =================================================================== */
const SD44={CS:50,COLS:16,ROWS:8,TB:400,W:800,H:450};
const SDM44=[
  {n:'Trilha da Fé',ico:'🕯',paths:[[[-1,1.5],[3,1.5],[5,4],[3,6.5],[8,6.5],[10,2],[13,2],[14,5.5],[15.4,5.5]]]},
  {n:'Bifurcação das Raízes',ico:'🌿',paths:[[[-1,3.5],[3,3.5],[5,1],[9,1],[11,3.5],[15.4,3.5]],[[-1,3.5],[3,3.5],[5,6.5],[9,6.5],[11,3.5],[15.4,3.5]]]},
  {n:'Espiral do Vazio',ico:'🕳',paths:[[[-1,.6],[14.5,.6],[14.5,6.9],[1.5,6.9],[1.5,2.5],[12,2.5],[12,4.8],[7,4.8]]]},
  {n:'Encruzilhada dos Espelhos',ico:'🪞',paths:[[[-1,1],[5,1],[7,3.5],[11,3.5],[13,6.2],[15.4,6.2]],[[-1,6.8],[5,6.8],[7,3.5],[11,3.5],[13,6.2],[15.4,6.2]]]},
];
const TOT44={
  fe:{n:'Fé',g:'✶',c:'#e8b83c',cost:50,dmg:11,rate:.55,rng:2.6,info:'Dano constante num alvo.',A:['Coro','Acerta 3 alvos.'],B:['Lança Sagrada','30% de crítico triplo.']},
  nat:{n:'Natureza',g:'🌿',c:'#3fae5a',cost:60,dmg:3,rate:.25,rng:2.1,slow:.45,info:'Raízes: deixa lento quem passa.',A:['Floresta','Alcance e lentidão maiores.'],B:['Raízes Presas','Prende um inimigo a cada 2 s.']},
  ver:{n:'Verdade',g:'👁',c:'#5aa7e8',cost:70,dmg:6,rate:.7,rng:3,reveal:true,info:'Revela os invisíveis e acerta.',A:['Farol','Revela mais longe e fortalece os vizinhos.'],B:['Sentença','Dano dobrado e ignora blindagem.']},
  ilu:{n:'Ilusão',g:'🌀',c:'#c056d6',cost:80,dmg:4,rate:2.2,rng:2.4,confuse:1.2,info:'Confunde: o alvo volta para trás.',A:['Labirinto','Confunde todos em volta do alvo.'],B:['Espelho','Confusão e dano em dobro.']},
  ine:{n:'Inexistência',g:'◐',c:'#8b6fd0',cost:120,dmg:60,rate:2.1,rng:4.2,info:'Golpe pesado e de longe.',A:['Buraco Negro','Dano em área.'],B:['Apagamento','Apaga quem está com pouca vida.']},
};
const CYC44=['fe','nat','ine','ilu','ver'];
const SYN44={sol:{n:'Sol',g:'☉',c:'#ffb347',p:['fe','nat'],d:'queima e corta a regeneração'},desreal:{n:'Desrealização',g:'◌',c:'#7fd1a0',p:['nat','ine'],d:'deixa o alvo vulnerável'},pofenia:{n:'Pofenia',g:'⁂',c:'#b48cff',p:['ine','ilu'],d:'o golpe salta para outro inimigo'},confab:{n:'Confabulação',g:'✎',c:'#d98bd6',p:['ilu','ver'],d:'revela e confunde mais'},metafora:{n:'Metáfora',g:'✦',c:'#9fd3ff',p:['ver','fe'],d:'+25% de alcance e +15% de dano'}};
const synOf44=(a,b)=>Object.keys(SYN44).find(k=>{const p=SYN44[k].p;return(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)});
const FOE44={
  ansioso:{n:'Ansioso',hp:30,sp:64,b:5,c:'#e8a23c',r:11},
  apavorado:{n:'Apavorado',hp:22,sp:118,b:6,c:'#f2d35b',r:9,tag:'rápido'},
  blindado:{n:'Blindado',hp:70,sp:46,b:10,c:'#8a8f9a',r:14,arm:.5,tag:'blindado'},
  vazio:{n:'Vazio',hp:40,sp:72,b:9,c:'#6b4fa0',r:12,inv:true,tag:'invisível'},
  regen:{n:'Regenerador',hp:60,sp:56,b:10,c:'#3fae5a',r:13,regen:.05,tag:'regenera'},
  divisor:{n:'Divisor',hp:55,sp:58,b:8,c:'#e0233b',r:14,split:'fragmento',tag:'divide'},
  fragmento:{n:'Fragmento',hp:16,sp:92,b:2,c:'#ff8a8a',r:8},
  arauto:{n:'Arauto Curandeiro',hp:520,sp:40,b:60,c:'#ffd36b',r:20,boss:1,lives:3,ab:['heal']},
  carcereiro:{n:'Carcereiro',hp:620,sp:38,b:70,c:'#5aa7e8',r:20,boss:1,lives:3,ab:['jail']},
  matriarca:{n:'Matriarca do Enxame',hp:560,sp:36,b:70,c:'#c056d6',r:20,boss:1,lives:3,ab:['summon']},
  colapso:{n:'Colapso',hp:1500,sp:32,b:150,c:'#3a1040',r:24,boss:2,lives:6,ab:['summon','heal']},
  juiz:{n:'Juiz de Cera',hp:2200,sp:30,b:180,c:'#7fe3ff',r:24,boss:2,lives:7,ab:['jail','heal']},
  santo:{n:'Santo Sem Nome',hp:3400,sp:28,b:300,c:'#fff3c2',r:26,boss:2,lives:10,ab:['jail','heal','summon']},
};
const ABL44={wall:{n:'Muralha de Fé',g:'🧱',cd:25,d:'Bloqueia o caminho por 5 s.'},rain:{n:'Chuva de Essência',g:'🌧',cd:30,d:'Dano em área por 1,5 s.'}};
function sdPath44(ctrl){const P=ctrl.map(([c,r])=>[c*SD44.CS+SD44.CS/2,r*SD44.CS]),n=P.length,pts=[];
  for(let i=0;i<n-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n-1,i+2)],L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),m=Math.max(4,Math.ceil(L/6));
    for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t;pts.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  pts.push(P[n-1]);const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return{pts,cum,len:cum[cum.length-1]}}
function sdPos44(p,d){d=Math.max(0,Math.min(p.len,d));let lo=0,hi=p.cum.length-1;while(lo<hi-1){const m=(lo+hi)>>1;if(p.cum[m]<=d)lo=m;else hi=m}const a=p.pts[lo],b=p.pts[hi],k=(d-p.cum[lo])/((p.cum[hi]-p.cum[lo])||1);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]}
function sdWave44(w,seed){
  const out=[],n=Math.min(42,6+Math.floor(w*1.5)),pool=['ansioso'];if(w>=2)pool.push('apavorado');if(w>=4)pool.push('blindado');if(w>=5)pool.push('vazio');if(w>=7)pool.push('regen');if(w>=9)pool.push('divisor');
  for(let i=0;i<n;i++){const r=hrand(seed,w,i);out.push(r<.35?'ansioso':pool[Math.floor(hrand(seed,w,i+99)*pool.length)])}
  if(w%10===0)out.push(['colapso','juiz','santo'][(w/10-1)%3]);else if(w%5===0)out.push(['arauto','carcereiro','matriarca'][(Math.floor(w/5)-1)%3]);
  return out}
T3.sd44={maps:SDM44,tot:TOT44,syn:SYN44,foes:FOE44,wave:sdWave44,path:sdPath44};
function sdProg44(){const p=prog38().sd||{};return{won:p.won||{},best:p.best||{},inf:p.inf||{}}}
const sdOpen44=i=>i===0||!!sdProg44().won[i-1];

const sdSetup44={
  intro:()=>'Defenda o Santuário dos Traumas e Estados. Vencer a Campanha de um mapa abre o próximo. O Infinito não acaba: veja até onde você chega.',
  def:()=>{let i=0;while(i<3&&sdOpen44(i+1))i++;return{m:'camp',map:String(i)}},
  fields:o=>{const p=sdProg44();return[{k:'m',l:'Modo',opts:[{v:'camp',n:'Campanha',ico:'📜',d:'30 ondas com mini-chefes e 3 Chefes.'},{v:'inf',n:'Infinito',ico:'♾',d:'Ondas sem fim, cada vez mais fortes.'}]},
    {k:'map',l:'Mapa',wide:1,opts:SDM44.map((m,i)=>{const lock=!sdOpen44(i);return{v:String(i),n:m.n,ico:m.ico,d:lock?`Vença a Campanha de ${SDM44[i-1].n}.`:`${m.paths.length>1?'Caminho com bifurcação':'Caminho único'}${p.best[i]?` · melhor: onda ${p.best[i]}`:''}${p.inf[i]?` · infinito: ${p.inf[i]}`:''}`,lock,badge:p.won[i]?'🏆':''}})}]},
  fix:o=>{if(!['camp','inf'].includes(o.m))o.m='camp';let i=Math.max(0,Math.min(3,+o.map||0));while(i>0&&!sdOpen44(i))i--;o.map=String(i)},
  sum:()=>`Totens: 1 a 5 escolhem, clique no mapa para construir. Clique num totem para melhorar (até o nível 3) e depois escolher uma de 2 especializações. Totens vizinhos no Ciclo formam Sub-Elementos: ${Object.values(SYN44).map(s=>`${s.g} ${s.n} (${s.d})`).join(' · ')}. Poderes: M Muralha de Fé, C Chuva de Essência. Espaço chama a onda.`
};

/* ---------- 🎨 arte da Defesa do Santuário (GFX60) · SOMENTE VISUAL ----------
   Direção: maquete noturna de um santuário vista do alto. Cada mapa tem
   solo, trilha, adereços e ar próprios; totens esculpidos e Traumas vivos.
   O sorteio dos adereços usa GFX60.rng, nunca a semente do jogo. */
function sdArt44(mi,paths,road){
  const G=window.GFX60,W=800,BH=400,CS=SD44.CS,TAU=Math.PI*2;
  const TH=[
    {acc:'#ffd36b',gk:'grama',ga:'#2b3320',gb:'#8a8a4a',pk:'terra',pa:'#7a5c3c',pb:'#d0b080',edge:'#3a2814',lip:'#b08a4a',amb:'brasas',deco:['vela','pedra','tufo','vela','tufo']},
    {acc:'#7dffa8',gk:'grama',ga:'#17402a',gb:'#7ac86a',pk:'terra',pa:'#5c4630',pb:'#a88a60',edge:'#22301a',lip:'#7a9a4a',amb:'folhas',deco:['cogumelo','tufo','raiz','tufo','pedra']},
    {acc:'#b9a6ff',gk:'runa',ga:'#171028',gb:'#6a50b0',pk:'pedra',pa:'#4a3c6a',pb:'#241a3a',edge:'#0a0614',lip:'#8a6ae0',amb:'motes',deco:['cristal','pedra','obelisco','cristal']},
    {acc:'#7fe3ff',gk:'cristal',ga:'#10283a',gb:'#255a72',pk:'pedra',pa:'#4a6a80',pb:'#1a3040',edge:'#061520',lip:'#9fe8ff',amb:'neve',deco:['espelho','cristal','pedra','espelho']}][mi];
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1,dash)=>{g.strokeStyle=c;g.lineWidth=lw;g.setLineDash(dash||[]);g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke();g.setLineDash([])};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const candles=[];
  function deco(g,k,X,Y,r){
    ell(g,X,Y+5,9,3,'rgba(0,0,0,.4)');
    if(k==='pedra'){G.poly(g,[[X-9,Y+5],[X-6,Y-3],[X+1,Y-6],[X+8,Y],[X+9,Y+5]],G.shade(TH.pa,-.15));G.poly(g,[[X-6,Y-3],[X+1,Y-6],[X+3,Y-1],[X-3,Y+1]],G.shade(TH.pa,.3))}
    else if(k==='tufo')for(let i=0;i<7;i++){const d=(i-3)*2.4;line(g,[[X+d*.5,Y+5],[X+d+(r()-.5)*3,Y-3-r()*7]],G.mix(TH.ga,TH.gb,.4+r()*.6),1.6)}
    else if(k==='vela'){box(g,X-2.5,Y-6,5,11,'#e9dcb8',1.5);box(g,X+3.5,Y-2,4,7,'#cdbd96',1.5);disc(g,X,Y-9,2.2,'#ffb33a');disc(g,X,Y-8.4,1,'#fff4c0')}
    else if(k==='cogumelo'){[[0,0,1],[7,3,.65]].forEach(([u,v,s])=>{box(g,X+u-2*s,Y+v-5*s,4*s,10*s,'#d8ceb4',2);ell(g,X+u,Y+v-5*s,8*s,5*s,'#c0455a');ell(g,X+u,Y+v-4*s,7*s,1.6*s,'#7a2438');disc(g,X+u-3*s,Y+v-7*s,1.3*s,'#fff')})}
    else if(k==='raiz'){line(g,[[X-12,Y+4],[X-4,Y-2],[X+2,Y+3],[X+12,Y-4]],'#4a3320',3.5);line(g,[[X-4,Y-2],[X-6,Y-8]],'#4a3320',2);ell(g,X-6,Y-9,4,2,'#6ac05a',-.6)}
    else if(k==='cristal'){G.draw(g,G.prop.crystal(mi===2?'#8a64e0':'#6ad0f0',9,22),X,Y+5,{ay:1});G.draw(g,G.prop.crystal(mi===2?'#5a3ab0':'#3a90b8',7,13),X+7,Y+6,{ay:1,rot:.35})}
    else if(k==='obelisco'){G.poly(g,[[X-5,Y+6],[X-3,Y-12],[X,Y-17],[X+3,Y-12],[X+5,Y+6]],'#2c2248');G.poly(g,[[X,Y-17],[X+3,Y-12],[X+5,Y+6],[X,Y+6]],'#171028');disc(g,X-1,Y-6,1.6,'#c9a8ff')}
    else{G.poly(g,[[X-7,Y+5],[X-5,Y-12],[X+4,Y-15],[X+7,Y+5]],'#6a5a48');G.poly(g,[[X-4.5,Y+2],[X-3,Y-10],[X+3,Y-12.5],[X+4.5,Y+2]],'#aeeaff');line(g,[[X-2.5,Y-4],[X+2,Y-10]],'#ffffff',1.2)}
  }
  /* posições dos adereços (uma vez por partida) */
  const D=[];{const r=G.rng(881+mi*17);for(let ry=0;ry<8;ry++)for(let c=0;c<16;c++){const p=r(),k=TH.deco[Math.floor(r()*TH.deco.length)],X=c*CS+13+r()*24,Y=ry*CS+16+r()*22;if(!road.has(c+','+ry)&&p<.27)D.push([k,X,Y])}}
  D.forEach(([k,X,Y])=>{if(k==='vela')candles.push([X,Y-9])});
  const ground=()=>G.bake(`sd:ground:${mi}`,W,BH,(g,w,h,r)=>{
      G.fillTile(g,G.tile(TH.gk,{size:100,a:TH.ga,b:TH.gb,seed:mi+3}),0,0,w,h);
      for(let i=0;i<46;i++){const X=r()*w,Y=r()*h,R=30+r()*70,dk=r()<.6;const q=g.createRadialGradient(X,Y,0,X,Y,R);q.addColorStop(0,dk?'rgba(0,0,0,.34)':G.rgba(TH.acc,.08));q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(X-R,Y-R,R*2,R*2)}
      for(let ry=1;ry<8;ry++)for(let c=1;c<16;c++)disc(g,c*CS,ry*CS,1,'rgba(255,255,255,.13)');
      const trace=(p,dy=0)=>{g.beginPath();p.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]+dy):g.moveTo(q[0],q[1]+dy))};
      g.lineJoin='round';g.lineCap='round';
      const pass=(lw,col,dy=0)=>paths.forEach(p=>{trace(p,dy);g.lineWidth=lw;g.strokeStyle=col;g.stroke()});
      pass(46,'rgba(0,0,0,.38)',4);pass(42,TH.edge);pass(39,G.shade(TH.lip,-.25));
      const tile=G.tile(TH.pk,{size:64,a:TH.pa,b:TH.pb,seed:mi+9}),pt=g.createPattern(tile,'repeat');pt.setTransform&&pt.setTransform(new DOMMatrix([.5,0,0,.5,0,0]));
      pass(33,pt);pass(33,'rgba(0,0,0,.14)');pass(22,'rgba(255,235,200,.07)');
      paths.forEach(p=>{trace(p);g.setLineDash([5,12]);g.lineWidth=2;g.strokeStyle=G.rgba(TH.acc,.3);g.stroke();g.setLineDash([])});
      D.forEach(([k,X,Y])=>deco(g,k,X,Y,r));
    });
  /* templo ao fim da trilha */
  const temple=()=>G.bake('sd:temple',70,76,g=>{ell(g,35,68,34,8,'rgba(0,0,0,.45)');box(g,6,58,58,10,'#8a7a62',3);box(g,10,52,50,8,'#b0a084',2);
    G.poly(g,[[12,26],[35,6],[58,26]],'#d8a83c');G.poly(g,[[35,6],[58,26],[35,26]],'#a87818');box(g,12,25,46,5,'#f4d27a',2);
    box(g,17,30,36,23,'#2a1606');g.fillStyle='#ffe9a0';g.beginPath();g.moveTo(26,53);g.lineTo(26,42);g.arc(35,42,9,Math.PI,0);g.lineTo(44,53);g.closePath();g.fill();
    [13,50].forEach(X=>{box(g,X,29,7,24,'#e6d8b8');box(g,X+4,29,3,24,'#a8987a');box(g,X-1,29,9,3,'#f4ead0')});
    disc(g,35,18,5.5,'#fff3c0');ring(g,35,18,5.5,'#7a5208',1.2);G.poly(g,[[35,0],[37.5,7],[32.5,7]],'#fff3c0')},{s:2});
  /* totem: base em (26,52) do desenho */
  const totem=(k,lv,spec)=>G.bake(`sd:tot:${k}:${lv}:${spec}`,52,62,g=>{
    const b=TOT44[k],c=b.c,dk=G.shade(c,-.55),lt=G.shade(c,.45),top=25-Math.min(3,lv)*4;
    ell(g,26,53,20,7,'#17121c');ell(g,26,50,19,6.5,lv>=3?'#c99a3a':'#6a6276');ell(g,26,48.5,15,5,lv>=3?'#f0cc72':'#8e869a');
    if(lv>=2)[8,44].forEach(X=>{box(g,X-2.5,34,5,15,dk,2);disc(g,X,33,3.4,c);disc(g,X-1,32,1.2,'#fff')});
    if(k==='fe'){G.poly(g,[[17,49],[20,top+8],[26,top],[32,top+8],[35,49]],c);G.poly(g,[[26,top],[32,top+8],[35,49],[26,49]],dk);box(g,18,40,16,3,lt);line(g,[[21,top+14],[21,38]],lt,1.5)}
    else if(k==='nat'){G.poly(g,[[19,49],[22,top+14],[30,top+14],[33,49]],'#6a4a2a');G.poly(g,[[26,top+14],[30,top+14],[33,49],[26,49]],'#41301a');[[16,top+14,9],[36,top+14,9],[26,top+7,12]].forEach(([X,Y,r])=>{disc(g,X,Y,r,dk);disc(g,X-1,Y-2,r*.78,c)});[[18,top+9],[31,top+4],[37,top+14]].forEach(([X,Y])=>ell(g,X,Y,3,1.6,lt,-.5));line(g,[[19,49],[12,52]],'#41301a',3);line(g,[[33,49],[40,52]],'#41301a',3)}
    else if(k==='ver'){G.poly(g,[[18,49],[15,top+16],[26,top],[37,top+16],[34,49]],c);G.poly(g,[[26,top],[37,top+16],[34,49],[26,49]],dk);G.poly(g,[[26,top],[30,top+17],[26,49],[21,top+18]],lt);line(g,[[18,top+16],[26,top]],'#ffffff',1.2)}
    else if(k==='ilu'){for(let i=0;i<4;i++){const y=44-i*(34-top)/3.2,w=15-i*2.6;ell(g,26+(i%2?3:-3),y,w,5.5,i%2?c:dk);ell(g,26+(i%2?3:-3),y-1.6,w*.7,2.2,lt)}g.strokeStyle=lt;g.lineWidth=1.4;g.beginPath();g.ellipse(26,top+12,20,7,-.35,0,TAU);g.stroke()}
    else{ell(g,26,45,12,3.5,dk);G.poly(g,[[19,40],[19,top+6],[26,top],[33,top+6],[33,40],[26,45]],'#120a20');G.poly(g,[[19,40],[19,top+6],[26,top],[26,45]],'#2a1c48');line(g,[[19,40],[19,top+6],[26,top],[33,top+6],[33,40],[26,45],[19,40]],c,1.6);g.strokeStyle=G.rgba(c,.8);g.lineWidth=1.5;g.beginPath();g.ellipse(26,top+22,19,6,.3,0,TAU);g.stroke()}
    /* medalhão com o símbolo */
    const my=top+19;disc(g,26,my,10,'#120d18');ring(g,26,my,10,lt,1.8);sym(g,k,26,my,13,lt);
    if(lv>3){G.poly(g,[[17,top+2],[17,top-8],[21.5,top-3],[26,top-11],[30.5,top-3],[35,top-8],[35,top+2]],'#ffd36b');line(g,[[17,top+2],[35,top+2]],'#7a5208',1.5);disc(g,26,top-1,2,'#e0455a')}
  },{s:2});
  function sym(g,k,cx,cy,s,col){
    if(k==='fe'){g.fillStyle=col;g.beginPath();for(let i=0;i<12;i++){const a=-Math.PI/2+i*TAU/12,r=i%2?s*.2:s*.48;i?g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):g.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath();g.fill()}
    else if(k==='nat')G.icon(g,'folha',cx,cy,s,col);else if(k==='ver')G.icon(g,'olho',cx,cy,s*1.1,col);else if(k==='ilu')G.icon(g,'espiral',cx,cy,s,col);
    else{ring(g,cx,cy,s*.4,col,s*.13);g.fillStyle=col;g.beginPath();g.arc(cx,cy,s*.4,-Math.PI/2,Math.PI/2);g.closePath();g.fill()}}
  /* Traumas: corpo com raio D.r no centro; 2 quadros */
  const eyes=(g,X,Y,d,r,col='#fff',pup='#1a0a10')=>[-1,1].forEach(i=>{disc(g,X+i*d,Y,r,col);if(pup)disc(g,X+i*d+r*.25,Y+r*.1,r*.52,pup)});
  const foe=(key,D,f)=>{const R=D.r,S=Math.ceil(R*3.4);return G.bake(`sd:foe:${key}:${f}`,S,S,g=>{
    const c=D.c,dk=G.shade(c,-.5),lt=G.shade(c,.4),m=S/2,s=f?1:-1;g.translate(m,m);
    const body=(w,h,col=c,y=0)=>{const q=g.createRadialGradient(-w*.35,y-h*.4,1,0,y,Math.max(w,h)*1.1);q.addColorStop(0,G.shade(col,.45));q.addColorStop(.5,col);q.addColorStop(1,G.shade(col,-.55));ell(g,0,y,w,h,q);g.strokeStyle='rgba(10,4,14,.75)';g.lineWidth=1.4;g.stroke()};
    const feet=col=>[-1,1].forEach(i=>ell(g,i*R*.45,R*.88+(i*s>0?-2:0),R*.3,R*.17,col));
    if(key==='ansioso'){feet(dk);const P=[];for(let i=0;i<18;i++){const a=i*TAU/18+(f?.12:0),k=i%2?R*.9:R*1.16;P.push([Math.cos(a)*k,Math.sin(a)*k])}G.poly(g,P,dk);body(R*.9,R*.9);eyes(g,0,-R*.15,R*.34,R*.3);line(g,[[-R*.4,R*.42],[-R*.2,R*.28],[0,R*.42],[R*.2,R*.28],[R*.4,R*.42]],'#2a0e08',1.5);ell(g,R*.85,-R*.6,R*.14,R*.24,'#9fe8ff',.5)}
    else if(key==='apavorado'){G.poly(g,[[-R*1.55,R*.1+s*2],[-R*.5,-R*.55],[-R*.5,R*.75]],G.rgba(c,.5));G.poly(g,[[-R*1.3,-R*.5-s*2],[-R*.4,-R*.7],[-R*.6,0]],G.rgba(c,.35));body(R,R*1.05);eyes(g,R*.18,-R*.28,R*.36,R*.3);ell(g,R*.22,R*.42,R*.2,R*(f?.34:.24),'#2a1a04')}
    else if(key==='blindado'){feet('#2c2e36');body(R,R*.95);g.fillStyle=vg(g,-R,R*.2,'#eef2fa',c,'#4a4e5a');g.beginPath();g.arc(0,R*.05,R*1.02,Math.PI,0);g.closePath();g.fill();g.strokeStyle='#1e2028';g.lineWidth=1.5;g.stroke();line(g,[[0,-R*.95],[0,0]],'#2c2e36',1.5);[-.62,.62].forEach(i=>{disc(g,R*i,-R*.3,1.8,'#fff');disc(g,R*i*.5,-R*.72,1.5,'#d8dce6')});box(g,-R*.62,R*.1,R*1.24,R*.36,'#14151c',3);eyes(g,0,R*.28,R*.28,R*.12,'#ff6b5b',null)}
    else if(key==='vazio'){G.poly(g,[[-R,R*1.1],[-R*.9,-R*.2],[0,-R*1.2],[R*.9,-R*.2],[R,R*1.1],[R*.55,R*(f?.75:.95)],[R*.18,R*1.15],[-R*.25,R*(f?.95:.75)],[-R*.62,R*1.15]],c);G.poly(g,[[0,-R*1.2],[R*.9,-R*.2],[R,R*1.1],[R*.3,R*.4]],dk);ell(g,0,-R*.15,R*.55,R*.6,'#0c0616');eyes(g,0,-R*.2,R*.24,R*.14,'#e8d4ff',null)}
    else if(key==='regen'){feet(dk);body(R,R*.95);[[-.35,-1,-.7],[.35,-1.05,.7],[0,-1.25+s*.06,0]].forEach(([u,v,a])=>ell(g,R*u,R*v,R*.2,R*.42,'#a8f070',a));eyes(g,0,-R*.1,R*.34,R*.24);g.strokeStyle='#08240e';g.lineWidth=1.5;g.beginPath();g.arc(0,R*.2,R*.28,.3,Math.PI-.3);g.stroke();box(g,-1.5,R*.52,3,R*.4,'#eaffe0');box(g,-R*.2,R*.7,R*.4,3,'#eaffe0')}
    else if(key==='divisor'){feet(dk);ell(g,-R*.42,0,R*.72,R*.9+s,c);ell(g,R*.42,0,R*.72,R*.9-s,G.shade(c,-.18));g.strokeStyle='rgba(10,4,14,.75)';g.lineWidth=1.4;g.beginPath();g.ellipse(0,0,R*1.1,R*.94,0,0,TAU);g.stroke();line(g,[[0,-R*.9],[R*.14,-R*.4],[-R*.14,0],[R*.14,R*.45],[0,R*.9]],'#2a0408',2);eyes(g,-R*.52,-R*.2,R*.2,R*.15);eyes(g,R*.52,-R*.2,R*.2,R*.15)}
    else if(key==='fragmento'){G.poly(g,[[0,-R*1.25],[R*1.05,-R*.15],[R*.6,R],[-R*.75,R*.8],[-R,-R*.35+s]],c);G.poly(g,[[0,-R*1.25],[R*1.05,-R*.15],[0,0]],lt);G.poly(g,[[0,0],[R*.6,R],[-R*.75,R*.8]],dk);eyes(g,0,0,R*.32,R*.22)}
    else{ /* chefes */
      if(key==='arauto'){ring(g,0,-R*.75,R*.62,'#fff3c0',3);body(R*.95,R,c);G.poly(g,[[-R,R],[-R*.55,0],[R*.55,0],[R,R]],'#a87818');box(g,-2.5,R*.2,5,R*.6,'#eaffe8');box(g,-R*.28,R*.38,R*.56,5,'#eaffe8');eyes(g,0,-R*.25,R*.32,R*.16,'#fff','#4a2a00');line(g,[[R*.7,R*.1],[R*1.4,-R*.4+s*2]],'#fff3c0',3.5);disc(g,R*1.45,-R*.45+s*2,R*.2,'#ffd36b')}
      else if(key==='carcereiro'){body(R,R,c);box(g,-R*.82,-R*1.02,R*1.64,R*.95,'#58607a',R*.4);box(g,-R*.64,-R*.68,R*1.28,R*.42,'#080a12',3);eyes(g,0,-R*.47,R*.28,R*.12,'#bfefff',null);[-.34,0,.34].forEach(u=>line(g,[[R*u,-R*.72],[R*u,-R*.22]],'#9aa4c0',2));ring(g,R*.95,R*.42+s*2,R*.24,'#ffd36b',2.5);line(g,[[R*.95,R*.66+s*2],[R*.95,R*1.15+s*2],[R*1.15,R*1.15+s*2]],'#ffd36b',2.5);box(g,-R*.75,R*.28,R*1.5,5,'#1c2438')}
      else if(key==='matriarca'){for(const i of[-1,1])for(let k=0;k<3;k++)line(g,[[i*R*.5,k*R*.28],[i*R*(1.25+k*.08),-R*.25+k*R*.42+((k%2)===f?-3:2)],[i*R*(1.5+k*.05),R*.3+k*R*.38]],'#4a1458',3);body(R*.95,R*1.02,c);ell(g,0,R*.5,R*.62,R*.38,dk);[[-.42,-.4,.18],[.42,-.4,.18],[-.14,-.58,.11],[.14,-.58,.11],[-.18,-.18,.1],[.18,-.18,.1]].forEach(([u,v,r])=>disc(g,R*u,R*v,R*r,'#ffe8a0'));line(g,[[-R*.3,R*.08],[-R*.15,R*.32]],'#fff',2.5);line(g,[[R*.3,R*.08],[R*.15,R*.32]],'#fff',2.5)}
      else if(key==='colapso'){for(let i=0;i<10;i++){const a=i*TAU/10+(f?.18:0);G.poly(g,[[Math.cos(a-.25)*R*.8,Math.sin(a-.25)*R*.8],[Math.cos(a+.2)*R*1.38,Math.sin(a+.2)*R*1.38],[Math.cos(a+.3)*R*.8,Math.sin(a+.3)*R*.8]],'#9a1c68')}body(R,R,c);for(let i=0;i<3;i++){g.strokeStyle=G.rgba('#ff5ac8',.8-i*.2);g.lineWidth=2;g.beginPath();g.arc(0,0,R*(.72-i*.2),i*2+(f?.5:0),i*2+4+(f?.5:0));g.stroke()}disc(g,0,0,R*.2,'#fff');disc(g,0,0,R*.1,'#1a0014')}
      else if(key==='juiz'){body(R*.92,R*1.05,c);for(let i=-2;i<=2;i++)ell(g,i*R*.34,R*(.85+((i+f)%2?.14:0)),R*.13,R*.28,c);box(g,-R*.7,-R*1.18,R*1.4,R*.42,'#e8f8ff',R*.2);[-.55,-.2,.15,.5].forEach(u=>disc(g,R*u,-R*.76,R*.2,'#f4fdff'));eyes(g,0,-R*.28,R*.3,R*.17,'#fff','#04324a');line(g,[[-R*.55,R*.2],[R*.55,R*.2]],'#04324a',2);line(g,[[0,R*.2],[0,R*.65]],'#04324a',2);[-1,1].forEach(i=>{g.fillStyle='#ffd36b';g.beginPath();g.arc(i*R*.55,R*.42+i*s,R*.22,0,Math.PI);g.fill()})}
      else{ring(g,0,-R*.4,R*.95,'#fff8d8',3.5);ring(g,0,-R*.4,R*1.14,'rgba(255,240,180,.55)',1.5,[3,5]);G.poly(g,[[-R,R*1.15],[-R*.55,-R*.35],[R*.55,-R*.35],[R,R*1.15],[0,R*.85]],'#d8c894');G.poly(g,[[0,-R*.35],[R*.55,-R*.35],[R,R*1.15],[0,R*.85]],'#a8946a');ell(g,0,-R*.4,R*.52,R*.68,'#fffbe8');line(g,[[-R*.3,-R*.48],[-R*.08,-R*.44]],'#6a5a30',2);line(g,[[R*.3,-R*.48],[R*.08,-R*.44]],'#6a5a30',2);line(g,[[0,-R*.92],[0,-R*.62]],'#e0a83c',2)}}
  },{s:2})};
  const wall=()=>G.bake('sd:wall',22,52,g=>{box(g,2,2,18,48,'#7a5208',4);for(let i=0;i<6;i++){box(g,3.5+(i%2)*2,4+i*7.6,14,6.4,vg(g,4+i*7.6,10+i*7.6,'#fff0b0','#d89a24'),1.5)}rim(g,2.5,2.5,17,47,4,'#fff6d0',1.2)},{s:2});
  const cloud=()=>G.bake('sd:cloud',120,48,g=>{[[30,30,18],[54,22,22],[80,26,20],[98,32,14],[60,32,20]].forEach(([X,Y,r])=>{disc(g,X,Y,r,'#4a6a8a')});[[30,26,14],[54,17,17],[80,21,15]].forEach(([X,Y,r])=>disc(g,X,Y,r,'#8ab0cc'))},{s:2});
  const bar=()=>G.bake(`sd:bar:${mi}`,W,50,(g,w,h)=>{G.fillTile(g,G.tile('madeira',{size:64,a:'#35241c',b:'#150c08',seed:6}),0,0,w,h);box(g,0,0,w,h,'rgba(8,4,10,.4)');box(g,0,0,w,3,vg(g,0,3,'#fbe3a0','#8a6218'));box(g,0,3,w,1.5,'rgba(0,0,0,.6)');[4,448,590].forEach(X=>{if(X>4){line(g,[[X,10],[X,42]],'rgba(214,169,74,.4)',1.5)}})});
  function slot(x,bb,{on=false,col=TH.acc,dim=false}={}){
    const img=G.bake(`sd:slot:${bb.w}x${bb.h}:${col}:${on?1:0}`,bb.w,bb.h,g=>{box(g,0,0,bb.w,bb.h,on?vg(g,0,bb.h,G.mix(col,'#140e1c',.45),G.mix(col,'#140e1c',.75)):vg(g,0,bb.h,'#2b2236','#120d1a'),8);rim(g,.75,.75,bb.w-1.5,bb.h-1.5,8,on?col:'#5a4a6a',on?2.5:1.2);rim(g,3,3,bb.w-6,bb.h-6,6,'rgba(255,255,255,.08)',1)},{s:2});
    x.drawImage(img,bb.x,bb.y,bb.w,bb.h);if(dim){rr16(x,bb.x,bb.y,bb.w,bb.h,8);x.fillStyle='rgba(6,3,10,.35)';x.fill()}}
  const lights=G.lights(W,BH,{dark:.2,color:'#040210'});
  return{TH,ground,candles,temple,totem,foe,wall,cloud,bar,slot,sym,lights,amb:G.ambient(TH.amb,{W,H:BH,n:20,seed:21+mi,col:mi===0?'#ffb84a':undefined})};
}
function sanctuary44(C){
  const {CS,COLS,ROWS,TB,W,H}=SD44,o=C.room.opt||{},mi=Math.max(0,Math.min(3,+o.map||0)),M=SDM44[mi],inf=o.m==='inf';
  const paths=M.paths.map(sdPath44),WAVES=inf?Infinity:Number(window.__sdWaves)||30,HPM=gdPick(C.gd,[.8,1.05,1.4,1.85]);
  const road=new Set();for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x=c*CS+CS/2,y=r*CS+CS/2;if(paths.some(p=>p.pts.some(q=>Math.hypot(q[0]-x,q[1]-y)<32)))road.add(c+','+r)}
  const S={ess:gdPick(C.gd,[240,190,170,150]),vital:gdPick(C.gd,[25,20,15,10]),vital0:0,wave:0,foes:[],towers:[],shots:[],q:[],spawnT:0,sel:null,place:null,hover:null,fast:1,over:false,kills:0,bossK:0,built:new Set(),auto:false,msg:'',msgT:0,lost:0,t:0,ab:{wall:0,rain:0},walls:[],rains:[],pend:null,syns:new Set(),nid:0,betweenPaid:0,specN:0};
  S.vital0=S.vital;
  function msg(t){S.msg=t;S.msgT=performance.now()}
  const tcell=(px,py)=>[Math.floor(px/CS),Math.floor(py/CS)];
  const towerAt=(c,r)=>S.towers.find(t=>t.c===c&&t.r===r);
  const posF=f=>sdPos44(paths[f.p],f.d);
  function relink(){S.towers.forEach(t=>t.syn=new Set());S.links=[];
    for(let i=0;i<S.towers.length;i++)for(let j=i+1;j<S.towers.length;j++){const a=S.towers[i],b=S.towers[j];if(Math.hypot(a.x-b.x,a.y-b.y)>CS*1.5+1)continue;const k=synOf44(a.k,b.k);if(!k)continue;a.syn.add(k);b.syn.add(k);S.links.push([a,b,k])}
    const now=new Set(S.links.map(l=>l[2]));now.forEach(k=>{if(!S.syns.has(k)){S.syns.add(k);msg(`${SYN44[k].g} Sinergia ${SYN44[k].n}: ${SYN44[k].d}!`);fx5('achieve');C.achieve?.('sd_sinergia')}});if(now.size>=5)C.achieve?.('sd_ciclo')}
  function buffed(t){return S.towers.some(q=>q!==t&&q.k==='ver'&&q.spec==='a'&&Math.hypot(q.x-t.x,q.y-t.y)<=stats(q).rng)}
  function stats(t){const b=TOT44[t.k],lv=Math.min(3,t.lv),m=1+(lv-1)*.55+(t.lv>3?.45:0);let dmg=b.dmg*m,rng=b.rng*(1+(lv-1)*.12)*CS,rate=b.rate*(lv>2?.85:1),slow=b.slow?Math.min(.75,b.slow+(lv-1)*.08):0,conf=b.confuse?b.confuse+(lv-1)*.3:0;
    if(t.spec==='a'&&t.k==='nat'){rng*=1.4;slow=Math.min(.85,slow+.15)}
    if(t.spec==='b'&&t.k==='ilu'){conf*=2;dmg*=2}
    if(t.spec==='b'&&t.k==='ver')dmg*=2;
    if(t.syn?.has('metafora')){rng*=1.25;dmg*=1.15}if(t.syn?.has('confab'))conf+=.4;
    if(buffed&&t.k!=='ver'&&S.towers.some(q=>q!==t&&q.k==='ver'&&q.spec==='a'&&Math.hypot(q.x-t.x,q.y-t.y)<=b.rng*CS*1.6))dmg*=1.15;
    return{dmg,rate,rng,slow,conf,reveal:!!b.reveal||t.syn?.has('confab'),revR:rng*(t.k==='ver'&&t.spec==='a'?1.5:1)}}
  const upCost=t=>Math.round(TOT44[t.k].cost*(t.lv===1?.8:t.lv===2?1.25:2));
  function build(k,c,r){
    const b=TOT44[k];if(S.ess<b.cost){msg('Essência insuficiente.');fx5('error');return false}
    if(c<0||r<0||c>=COLS||r>=ROWS||road.has(c+','+r)||towerAt(c,r)){msg('Não dá para construir aqui.');fx5('error');return false}
    S.ess-=b.cost;S.towers.push({id:S.nid++,k,c,r,lv:1,spec:'',cd:0,spent:b.cost,x:c*CS+CS/2,y:r*CS+CS/2,a:0,jail:0,syn:new Set(),rootT:0});S.built.add(k);fx5('activate');
    if(S.built.size>=5)C.achieve?.('cinco');relink();return true}
  function upgrade(t,br){t=t||S.sel;if(!t)return false;if(t.lv>=4){msg('Totem especializado.');return false}
    if(t.lv===3&&!br){msg('Escolha uma especialização.');return false}
    const c=upCost(t);if(S.ess<c){msg('Essência insuficiente.');fx5('error');return false}
    S.ess-=c;t.spent+=c;t.lv++;if(t.lv===4){t.spec=br;S.specN++;C.achieve?.('sd_spec');msg(`${TOT44[t.k].n}: ${TOT44[t.k][br.toUpperCase()][0]}!`)}else msg(`${TOT44[t.k].n} nível ${t.lv}`);fx5('activate');return true}
  function sell(t){t=t||S.sel;if(!t)return;const v=Math.round(t.spent*.6);S.ess+=v;S.towers=S.towers.filter(q=>q!==t);S.sel=null;fx5('click');msg(`Totem vendido: +${v} ⚗`);relink()}
  function revealedAt(x,y){return S.towers.some(t=>t.jail<=0&&(TOT44[t.k].reveal||t.syn.has('confab'))&&Math.hypot(t.x-x,t.y-y)<=stats(t).revR)}
  function spawn(k,p,d,hpMul=1){const D=FOE44[k],w=Math.max(1,S.wave),hp=D.hp*HPM*(1+(w-1)*.22)*(1+Math.max(0,w-15)*.07)*(D.boss?1.4:1)*hpMul;S.foes.push({id:S.nid++,k,hp,max:hp,p,d,slow:0,slowK:0,conf:0,root:0,burn:0,vul:0,abT:{heal:3,jail:4,summon:3.5},wob:Math.random()*6})}
  function hit(f,dmg,t,{noChain=false}={}){
    if(f.dead)return;const D=FOE44[f.k];let k=1;if(D.arm&&!(t&&t.k==='ver'&&t.spec==='b')&&!(f.vul>0))k=1-D.arm;if(f.vul>0)k*=1.25;
    f.hp-=dmg*k;f.flash=performance.now();
    if(t){if(t.syn.has('sol'))f.burn=3;if(t.syn.has('desreal'))f.vul=2;
      if(t.syn.has('pofenia')&&!noChain&&Math.random()<.25){const [x,y]=posF(f);const o2=S.foes.find(q=>q!==f&&!q.dead&&Math.hypot(...posF(q).map((v,i)=>v-[x,y][i]))<90);if(o2){const [x2,y2]=posF(o2);S.shots.push({x0:x,y0:y,x1:x2,y1:y2,c:SYN44.pofenia.c,t0:performance.now()});hit(o2,dmg*.5,t,{noChain:true})}}
      if(t.k==='ine'&&t.spec==='b'&&!f.dead&&f.hp>0&&f.hp<f.max*(D.boss?.08:.2))f.hp=0}
    if(f.hp<=0&&!f.dead){f.dead=true;S.kills++;S.ess+=D.b;if(D.boss){S.bossK++;if(D.boss===2)C.achieve?.('sd_chefe');msg(`${D.n} foi derrotado!`)}fx5(D.boss?'mgWin':'mgCoin');
      const [px,py]=posF(f);if(D.split){spawn(D.split,f.p,Math.max(0,f.d-8),1);spawn(D.split,f.p,Math.max(0,f.d+8),1)}
      if(C.fx){const big=!!D.boss;C.fx.burst(px,py,{n:big?36:10,kind:big?'star':'dot',col:big?['#ffd36b','#ff5a6e','#fff']:['#ffd36b','#c9b0ff','#fff'],sp:big?260:150,life:big?.9:.5,size:big?4:2.6,grav:big?200:300});C.fx.float(px,py-18,'+'+D.b+' ⚗',{col:'#ffd36b',size:big?24:14,life:.7});if(big){C.fx.shake(8,.4);C.fx.flash('#ffd36b',.25)}}}}
  function startWave(){if(S.over||S.wave>=WAVES||S.q.length||S.foes.length)return false;S.wave++;S.q=sdWave44(S.wave,C.seed+mi).map((k,i)=>({k,p:i%paths.length}));S.spawnT=0;
    const bk=S.q.find(q=>FOE44[q.k].boss);msg(bk?`Onda ${S.wave}: ${FOE44[bk.k].boss===2?'👑 CHEFE':'⚔ Mini-chefe'} ${FOE44[bk.k].n}!`:`Onda ${S.wave}${inf?'':' de '+WAVES}`);fx5('round');return true}
  function useAb(k,x,y){if(S.ab[k]>0){msg(`${ABL44[k].n}: recarregando (${Math.ceil(S.ab[k])} s).`);return false}
    if(k==='wall'){let best=null;paths.forEach((p,pi)=>p.pts.forEach((q,i)=>{const d=Math.hypot(q[0]-x,q[1]-y);if(!best||d<best.dd)best={dd:d,p:pi,d:p.cum[i],x:q[0],y:q[1]}}));if(!best||best.dd>60){msg('Coloque a Muralha em cima do caminho.');return false}
      paths.forEach((p,pi)=>{if(pi===best.p||paths.length===1)return;});S.walls.push({p:best.p,d:best.d,x:best.x,y:best.y,t:5});if(paths.length>1){const o2=paths.map((p,pi)=>{if(pi===best.p)return null;let b2=null;p.pts.forEach((q,i)=>{const d=Math.hypot(q[0]-best.x,q[1]-best.y);if(!b2||d<b2.dd)b2={dd:d,d:p.cum[i]}});return b2&&b2.dd<20?{p:pi,d:b2.d,x:best.x,y:best.y,t:5}:null}).filter(Boolean);S.walls.push(...o2)}}
    else S.rains.push({x,y,t:1.5,dps:(150+S.wave*20)/1.5});
    S.ab[k]=ABL44[k].cd;fx5('activate');msg(`${ABL44[k].g} ${ABL44[k].n}!`);return true}
  function bossAbility(f,ab){const [x,y]=posF(f),D=FOE44[f.k];
    if(ab==='heal'){S.foes.forEach(q=>{if(q!==f&&!q.dead&&Math.hypot(...posF(q).map((v,i)=>v-[x,y][i]))<130)q.hp=Math.min(q.max,q.hp+q.max*.15)});C.fx?.burst(x,y,{n:14,col:'#7dffa8',kind:'ring',sp:160,life:.5});msg(`💚 ${D.n} curou os aliados`)}
    if(ab==='jail'){const n=D.boss===2?2:1;S.towers.filter(t=>t.jail<=0).map(t=>[t,Math.hypot(t.x-x,t.y-y)]).filter(([,d])=>d<240).sort((a,b)=>a[1]-b[1]).slice(0,n).forEach(([t])=>{t.jail=3});msg(`⛓ ${D.n} prendeu totens!`)}
    if(ab==='summon'){for(let i=0;i<3;i++)spawn('ansioso',f.p,Math.max(0,f.d-10-i*12),.8);msg(`🦂 ${D.n} invocou lacaios`)}}
  function sim(dt){
    if(S.over)return;S.t+=dt;S.ab.wall=Math.max(0,S.ab.wall-dt);S.ab.rain=Math.max(0,S.ab.rain-dt);
    if(S.q.length){S.spawnT-=dt;if(S.spawnT<=0){const q=S.q.shift();spawn(q.k,q.p,0);S.spawnT=FOE44[q.k].boss?2:Math.max(.38,.95-S.wave*.02)}}
    S.walls.forEach(w=>w.t-=dt);S.walls=S.walls.filter(w=>w.t>0);
    S.rains.forEach(r=>{r.t-=dt;S.foes.forEach(f=>{if(f.dead)return;const [x,y]=posF(f);if(Math.hypot(x-r.x,y-r.y)<80)hit(f,r.dps*dt,null)})});S.rains=S.rains.filter(r=>r.t>0);
    S.foes.forEach(f=>{if(f.dead)return;const D=FOE44[f.k],P=paths[f.p];let sp=D.sp*(f.slow>0?(1-f.slowK):1);if(D.wob)sp*=1+Math.sin(S.t*3+f.wob)*.35;
      f.slow=Math.max(0,f.slow-dt);if(f.slow<=0)f.slowK=0;f.vul=Math.max(0,f.vul-dt);
      if(f.burn>0){f.burn-=dt;f.hp-=(6+S.wave*.8)*dt}else if(D.regen)f.hp=Math.min(f.max,f.hp+f.max*D.regen*dt);
      if(f.hp<=0){hit(f,0,null);return}
      if(D.ab)D.ab.forEach(a=>{f.abT[a]-=dt;if(f.abT[a]<=0){f.abT[a]=a==='heal'?4:a==='jail'?6:5;bossAbility(f,a)}});
      if(f.root>0){f.root-=dt;return}
      let nd;if(f.conf>0){f.conf-=dt;nd=Math.max(0,f.d-sp*.6*dt)}else nd=f.d+sp*dt;
      const wall=S.walls.find(w=>w.p===f.p&&f.d<=w.d&&nd>=w.d-2);if(wall&&nd>f.d){nd=Math.min(nd,wall.d-2);if(D.boss)wall.t-=dt}
      f.d=nd;
      if(f.d>=P.len){f.dead=true;f.out=true;const L=D.lives||1;S.vital-=L;S.lost+=L;fx5('fumble');msg(`${D.n} chegou ao Santuário: −${L} Vital`);C.fx?.shake(6+L*2,.35);C.fx?.flash('#e0233b',.25)}});
    S.towers.forEach(t=>{t.jail=Math.max(0,t.jail-dt);if(t.jail>0)return;const st=stats(t),b=TOT44[t.k];t.cd-=dt;
      if(b.slow){t.rootT-=dt;S.foes.forEach(f=>{if(f.dead)return;const [x,y]=posF(f);if(Math.hypot(x-t.x,y-t.y)<=st.rng){f.slow=.3;f.slowK=Math.max(f.slowK||0,st.slow);hit(f,st.dmg*dt*4,t,{noChain:true})}});
        if(t.spec==='b'&&t.rootT<=0){const f=S.foes.find(f=>!f.dead&&!FOE44[f.k].boss&&Math.hypot(...posF(f).map((v,i)=>v-[t.x,t.y][i]))<=st.rng);if(f){f.root=1;t.rootT=2}}return}
      if(t.cd>0)return;
      const inR=S.foes.filter(f=>{if(f.dead)return false;const [x,y]=posF(f);if(FOE44[f.k].inv&&!revealedAt(x,y))return false;return Math.hypot(x-t.x,y-t.y)<=st.rng}).sort((a,b)=>b.d/paths[b.p].len-a.d/paths[a.p].len);
      if(!inR.length)return;t.cd=st.rate;const tg=inR[0],[x,y]=posF(tg);t.a=Math.atan2(y-t.y,x-t.x);
      const targets=t.k==='fe'&&t.spec==='a'?inR.slice(0,3):[tg];
      targets.forEach(f=>{const [fx,fy]=posF(f);S.shots.push({x0:t.x,y0:t.y,x1:fx,y1:fy,c:b.c,t0:performance.now(),big:t.k==='ine'});
        let d=st.dmg;if(t.k==='fe'&&t.spec==='b'&&Math.random()<.3)d*=3;hit(f,d,t);
        if(st.conf&&!FOE44[f.k].boss)f.conf=st.conf});
      if(t.k==='ilu'&&t.spec==='a')S.foes.forEach(f=>{if(f.dead||FOE44[f.k].boss)return;const [fx,fy]=posF(f);if(Math.hypot(fx-x,fy-y)<60)f.conf=st.conf});
      if(t.k==='ine'&&t.spec==='a')S.foes.forEach(f=>{if(f.dead||f===tg)return;const [fx,fy]=posF(f);if(Math.hypot(fx-x,fy-y)<70)hit(f,st.dmg*.6,t,{noChain:true})});
    });
    S.foes=S.foes.filter(f=>!f.dead);
    if(S.vital<=0){S.vital=0;lose();return}
    if(!S.q.length&&!S.foes.length&&S.wave>0&&S.betweenPaid!==S.wave){S.betweenPaid=S.wave;const bonus=15+S.wave*3;S.ess+=bonus;msg(`Onda ${S.wave} vencida! +${bonus} ⚗`);C.fx?.float(400,200,`ONDA ${S.wave} VENCIDA! +${bonus} ⚗`,{col:'#ffd36b',size:28,life:1.4});if(S.wave>=WAVES){win();return}if(S.auto)S.autoT=1.5}
    if(S.autoT>0&&!S.q.length&&!S.foes.length){S.autoT-=dt;if(S.autoT<=0)startWave()}
    if(S.vital<=0){S.vital=0;lose()}
  }
  function save(won){let rec=false;progPut38(p=>{p.sd=p.sd||{};['won','best','inf'].forEach(k=>p.sd[k]=p.sd[k]||{});if(inf){if(S.wave>(p.sd.inf[mi]||0)){p.sd.inf[mi]=S.wave;rec=true}}else{if(S.wave>(p.sd.best[mi]||0)){p.sd.best[mi]=S.wave;rec=true}if(won){S.first=!p.sd.won[mi];p.sd.won[mi]=1}}});return rec}
  function end(won){S.over=true;const rec=save(won);if(inf&&S.wave>=40)C.achieve?.('sd_infinito');
    const mul=gdMul38(C.gd);S.rw={ob:Math.round((S.wave*1.2+S.bossK*8+(won?40:0))*mul+(S.first?40:0)),why:[`${S.wave} ondas`,S.bossK?`${S.bossK} chefe${S.bossK>1?'s':''}`:'',won?'campanha vencida':'',rec?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    const score=S.wave*100+S.vital*10+S.kills;
    C.finish({title:won?`🏆 O Santuário resistiu às ${WAVES} ondas de ${M.n}!`:inf?`♾ ${M.n} · você chegou à onda ${S.wave}`:`O Santuário caiu na onda ${S.wave} de ${M.n}`,rows:[{u:C.me,n:(C.players[0]||{}).n||'Você',c:(C.players[0]||{}).c||0,s:score,w:won}],unit:'pts',
      html:`<ul class="r38-l"><li>🌊 Ondas: <b>${S.wave}</b></li><li>☠ Inimigos: <b>${S.kills}</b></li><li>👑 Chefes: <b>${S.bossK}</b></li><li>❤ Vital: <b>${S.vital}/${S.vital0}</b></li><li>🗼 Totens: <b>${S.towers.length}</b> (${S.specN} especializados)</li><li>✨ Sinergias: <b>${[...S.syns].map(k=>SYN44[k].g).join(' ')||'nenhuma'}</b></li></ul>${S.first&&mi<3?`<p class="r38-hi">🗺 ${esc(SDM44[mi+1].n)} foi aberto!</p>`:''}`})}
  function win(){C.achieve?.('guardiao');if(C.gd==='pesadelo'&&S.lost===0)C.achieve?.('inabalavel');C.say('Hm. O Santuário de pé. Admito: foi elegante.',false);end(true)}
  function lose(){C.say('Os Traumas venceram. Eles sempre voltam, sabia?',false);end(false)}
  /* barra de baixo */
  const KEYS=Object.keys(TOT44),BTN=k=>({x:6+KEYS.indexOf(k)*88,y:TB+6,w:84,h:38}),BAB=k=>({x:452+(k==='wall'?0:68),y:TB+6,w:64,h:38});
  const B_WAVE={x:W-184,y:TB+6,w:104,h:38},B_FAST={x:W-76,y:TB+6,w:70,h:38};
  const inB=(b,px,py)=>px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h;
  function panel(){const t=S.sel;if(!t)return null;const x0=clamp12(t.x-110,4,W-224),y0=t.y>200?t.y-136:t.y+30;const P={x:x0,y:y0,w:220,h:106};
    if(t.lv===3){P.a={x:x0+8,y:y0+52,w:100,h:44};P.b={x:x0+112,y:y0+52,w:100,h:44};P.sell={x:x0+150,y:y0+6,w:62,h:22}}else{P.up={x:x0+8,y:y0+62,w:100,h:34};P.sell={x:x0+112,y:y0+62,w:100,h:34}}return P}
  const GX=window.GFX60,art=sdArt44(mi,paths,road),V={dir:new Map(),tw:null,wave:0,lost:0,boss:0,bossAt:null,syn:0,banner:null,hurt:-1e9};
  GX.skin({acc:art.TH.acc});
  const pt=(x,str,X,Y,o)=>GX.hud.text(x,str,X,Y,{min:GX.cssScale()<.7?8:9,stroke:0,...o});
  function wrapTwo(x,str,w){if(str.length<=34)return[str];let i=str.lastIndexOf(' ',Math.ceil(str.length/2)+4);if(i<8)i=str.indexOf(' ',str.length>>1);return i<0?[str]:[str.slice(0,i),str.slice(i+1)]}
  function synBadge(x,X,Y,k){const s=SYN44[k];GX.glow(x,X,Y,20,s.c,.5);x.beginPath();x.arc(X,Y,10,0,7);x.fillStyle='#140e1e';x.fill();x.strokeStyle=s.c;x.lineWidth=2;x.stroke();txt16(x,s.g,X,Y+1,{size:13,w:900,col:s.c})}
  /* efeitos só de imagem, disparados quando o estado muda */
  function fxEvents(ex,ey){
    const now=performance.now();
    if(S.wave!==V.wave){V.wave=S.wave;const bk=S.q.find(q=>FOE44[q.k].boss);if(S.wave)V.banner={t0:now,t:'Onda '+S.wave,sub:bk?(FOE44[bk.k].boss===2?'Chefe: ':'Mini-chefe: ')+FOE44[bk.k].n:M.n,acc:bk?'#ff6b7a':art.TH.acc}}
    if(S.lost>V.lost){V.lost=S.lost;V.hurt=now;GX.hitstop(90);GX.emit('estilhacos',ex,ey,{col:'#ff6b7a'})}
    const bf=S.foes.find(f=>FOE44[f.k].boss);
    if(S.bossK>V.boss){V.boss=S.bossK;GX.hitstop(130);if(V.bossAt)GX.emit('explosao',V.bossAt[0],V.bossAt[1],{amount:1.4})}
    if(bf)V.bossAt=posF(bf);
    if(S.syns.size>V.syn){V.syn=S.syns.size;(S.links||[]).forEach(([a,b,k])=>GX.emit('brilho',(a.x+b.x)/2,(a.y+b.y)/2,{col:SYN44[k].c}))}
    const seen=new Map(S.towers.map(tw=>[tw.id,tw.lv]));
    if(V.tw)S.towers.forEach(tw=>{const old=V.tw.get(tw.id);if(old===undefined){GX.emit('poeira',tw.x,tw.y+16,{amount:1.5});GX.emit('coleta',tw.x,tw.y,{col:TOT44[tw.k].c})}else if(tw.lv>old)GX.emit('brilho',tw.x,tw.y-10,{col:TOT44[tw.k].c,amount:1.6})});
    V.tw=seen;if(V.dir.size>400)V.dir.clear();
  }
  return{
    g60intro:{title:M.n,sub:inf?'Modo Infinito':'Campanha de '+WAVES+' ondas',acc:art.TH.acc},
    st:()=>S,paths,sim,build,startWave,upgrade,sell,useAb,stats,road,
    reward:()=>S.rw||null,
    key(code,down){if(!down)return;const i=['Digit1','Digit2','Digit3','Digit4','Digit5'].indexOf(code);if(i>=0){S.place=KEYS[i];S.pend=null;S.sel=null;return}
      if(code==='Space'){startWave();return}if(code==='KeyU'&&S.sel&&S.sel.lv<3)upgrade();if(code==='KeyX'&&S.sel)sell();if(code==='KeyQ'){S.place=null;S.sel=null;S.pend=null}
      if(code==='KeyM'){S.pend='wall';S.place=null}if(code==='KeyC'){S.pend='rain';S.place=null}},
    ptr(type,px,py){
      if(type==='move'){S.hover=[px,py];return}if(type!=='down')return;S.hover=[px,py];
      if(py>=TB){for(const k of KEYS)if(inB(BTN(k),px,py)){S.place=S.place===k?null:k;S.sel=null;S.pend=null;return}
        for(const k of ['wall','rain'])if(inB(BAB(k),px,py)){S.pend=S.pend===k?null:k;S.place=null;S.sel=null;return}
        if(inB(B_WAVE,px,py)){if(!S.q.length&&!S.foes.length)startWave();else{S.auto=!S.auto;msg(S.auto?'Ondas automáticas ligadas':'Ondas automáticas desligadas')}return}
        if(inB(B_FAST,px,py)){S.fast=S.fast===1?2:S.fast===2?3:1;return}return}
      if(S.pend){if(useAb(S.pend,px,py))S.pend=null;return}
      const p=panel();if(p){if(p.up&&inB(p.up,px,py)){upgrade();return}if(p.a&&inB(p.a,px,py)){upgrade(null,'a');return}if(p.b&&inB(p.b,px,py)){upgrade(null,'b');return}if(p.sell&&inB(p.sell,px,py)){sell();return}if(inB(p,px,py))return}
      const [c,r]=tcell(px,py),t=towerAt(c,r);
      if(t){S.sel=S.sel===t?null:t;S.place=null;return}
      if(S.place){build(S.place,c,r);return}
      S.sel=null;
    },
    step(dt){if(Date.now()<C.t0||S.over)return;for(let i=0;i<S.fast;i++)sim(dt);
      C.hud(GX.chips([{icon:'bandeira',value:M.n},{icon:'coracao',label:'Vital',value:S.vital,tone:S.vital<=S.vital0*.3?'bad':null},{icon:'gota',label:'Essência',value:Math.floor(S.ess)},{icon:'raio',label:'Onda',value:S.wave+(inf?' · infinito':'/'+WAVES)},
        S.links?.length?{icon:'estrela',value:[...new Set(S.links.map(l=>l[2]))].map(k=>SYN44[k].g).join(' '),tone:'ok'}:null,S.wave===0?{icon:'alvo',value:'coloque totens e chame a onda'}:null]))},
    draw(x){
      const now=performance.now(),t=now/1000,red=GX.reduced(),small=GX.cssScale()<.7;
      const bg=art.ground();x.drawImage(bg,0,0,W,TB);
      /* luz do santuário, das velas e dos totens (só sobre o terreno) */
      const [ex0,ey]=paths[0].pts[paths[0].pts.length-1],ex=Math.min(ex0,W-30);
      art.lights.begin().add(ex,ey,150,art.TH.acc);
      art.candles.slice(0,8).forEach(([cx,cy],i)=>art.lights.add(cx,cy,42,'#ff9a3c',.7+(red?0:.15*Math.sin(t*8+i))));
      S.towers.slice(0,14).forEach(tw=>art.lights.add(tw.x,tw.y,58,TOT44[tw.k].c,.75));
      art.lights.apply(x,{glow:.16});
      paths.forEach(p=>{const [sx,sy]=sdPos44(p,CS*1.15);GX.glow(x,Math.max(6,sx-CS*.8),sy,34,'#8a3ad0',.55+(red?0:.2*Math.sin(t*3)))});
      /* Santuário */
      GX.glow(x,ex,ey-8,64,'#ffd36b',.38+(red?0:.1*Math.sin(t*2.4)));
      GX.draw(x,art.temple(),ex,ey+20,{ay:68/76});
      GX.hud.bar(x,ex-24,ey+22,48,5,S.vital/S.vital0,{col:S.vital<=S.vital0*.3?'#ff5b6b':'#7dffa8'});
      fxEvents(ex,ey);
      S.walls.forEach(w=>{x.save();x.globalAlpha=Math.min(1,w.t);GX.glow(x,w.x,w.y,44,'#ffc43c',.6);GX.draw(x,art.wall(),w.x,w.y,{w:20,h:48});GX.icon(x,'escudo',w.x,w.y-32,15,'#ffe9a0');x.restore()});
      /* sinergias */
      (S.links||[]).forEach(([a,b,k])=>{const s=SYN44[k],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;x.save();x.lineCap='round';x.globalCompositeOperation='lighter';x.strokeStyle=s.c;x.globalAlpha=.24+(red?0:.12*Math.sin(t*3.3));x.lineWidth=11;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();
        x.globalAlpha=.9;x.lineWidth=2.5;x.setLineDash([7,7]);x.lineDashOffset=red?0:-t*22;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.restore()});
      /* totens, de cima para baixo */
      S.towers.slice().sort((a,b)=>a.y-b.y).forEach(tw=>{const b=TOT44[tw.k],st=stats(tw),sel=S.sel===tw;
        if(sel){x.beginPath();x.arc(tw.x,tw.y,st.rng,0,7);x.fillStyle=b.c+'18';x.fill();x.setLineDash([9,6]);x.lineDashOffset=red?0:-t*16;x.strokeStyle=b.c+'cc';x.lineWidth=2;x.stroke();x.setLineDash([])}
        GX.shadow(x,tw.x,tw.y+17,46,{alpha:.6});
        const shot=tw.jail<=0&&tw.cd>st.rate-.14&&!b.slow;if(shot)GX.glow(x,tw.x,tw.y-10,34,b.c,.75);else if(sel||b.slow)GX.glow(x,tw.x,tw.y-4,30,b.c,sel?.55:.2);
        GX.draw(x,art.totem(tw.k,tw.lv,tw.spec),tw.x,tw.y+16+(shot&&!red?1.5:0),{ay:52/62});
        if(tw.lv>3){x.beginPath();x.arc(tw.x+17,tw.y+9,8,0,7);x.fillStyle='#160f1e';x.fill();x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.stroke();txt16(x,tw.spec.toUpperCase(),tw.x+17,tw.y+10,{size:11,w:900,col:'#ffd36b'})}
        else for(let i=0;i<tw.lv;i++){const px=tw.x+(i-(tw.lv-1)/2)*9,py=tw.y+22;GX.poly(x,[[px,py-4.5],[px+4,py],[px,py+4.5],[px-4,py]],'#160f1e');GX.poly(x,[[px,py-3],[px+2.7,py],[px,py+3],[px-2.7,py]],'#ffd36b')}
        if(tw.jail>0){GX.glow(x,tw.x,tw.y,32,'#5aa7e8',.45);x.lineCap='round';for(let i=-14;i<=14;i+=9){x.strokeStyle='#0c1a30';x.lineWidth=4.5;x.beginPath();x.moveTo(tw.x+i,tw.y-24);x.lineTo(tw.x+i,tw.y+18);x.stroke();x.strokeStyle='#b8dcff';x.lineWidth=2;x.stroke()}GX.icon(x,'cadeado',tw.x,tw.y-3,18,'#ffffff')}});
      /* Traumas */
      S.foes.slice().sort((a,b)=>posF(a)[1]-posF(b)[1]).forEach(f=>{const D=FOE44[f.k],[px,py]=posF(f),vis=!D.inv||revealedAt(px,py);
        let m=V.dir.get(f.id);if(!m){m={x:px,flip:false};V.dir.set(f.id,m)}if(Math.abs(px-m.x)>.6){m.flip=px<m.x;m.x=px}
        const frame=red?0:(Math.floor(S.t*(D.sp>80?9:5)+f.wob)&1),bob=red?0:Math.sin(S.t*6+f.wob*2)*1.6,img=art.foe(f.k,D,frame),flash=now-(f.flash||0)<80&&!red;
        x.save();x.globalAlpha=vis?1:.18;
        GX.shadow(x,px,py+D.r+3,D.r*2.4,{alpha:.55});
        if(D.boss){GX.glow(x,px,py,D.r*2.3,D.boss===2?'#ff3a50':'#b83cff',.5+(red?0:.18*Math.sin(t*4)));x.beginPath();x.ellipse(px,py+D.r+2,D.r*1.15,D.r*.38,0,0,7);x.strokeStyle=D.boss===2?'#ff5a6e':'#d46cff';x.lineWidth=2;x.stroke()}
        GX.draw(x,img,px,py+bob,{flip:m.flip});
        if(flash)GX.draw(x,GX.tint(img,'#ffffff',.85),px,py+bob,{flip:m.flip,alpha:.7});
        if(D.boss)GX.icon(x,D.boss===2?'coroa':'caveira',px,py-D.r-19,14,D.boss===2?'#ffd36b':'#e8b8ff');
        if(f.conf>0)GX.icon(x,'espiral',px+(red?0:Math.sin(t*7)*5),py-D.r-(D.boss?31:15),13,'#ffa8e8');
        if(f.burn>0){GX.glow(x,px,py,D.r*1.7,'#ff8a1a',.4);GX.icon(x,'chama',px+D.r,py-D.r+2,13,'#ffb347')}
        if(f.vul>0){x.setLineDash([4,4]);x.strokeStyle='#9fffc8';x.lineWidth=2;x.beginPath();x.arc(px,py,D.r+6,0,7);x.stroke();x.setLineDash([]);GX.icon(x,'alvo',px-D.r,py-D.r+2,12,'#9fffc8')}
        if(f.root>0){x.strokeStyle='#6a4a24';x.lineWidth=3;for(let i=-1;i<2;i++){x.beginPath();x.moveTo(px+i*D.r*.8,py+D.r+7);x.quadraticCurveTo(px+i*D.r*1.2,py+D.r*.2,px+i*D.r*.2,py+D.r*.35);x.stroke()}GX.icon(x,'folha',px,py+D.r+8,12,'#8aff9a')}
        if(f.slow>0){x.strokeStyle='#4ad070';x.lineWidth=2;x.beginPath();x.ellipse(px,py+D.r*.7,D.r+5,D.r*.55,0,0,7);x.stroke()}
        x.restore();
        if(vis){const bw=D.boss?46:28;GX.hud.bar(x,px-bw/2,py-D.r-9,bw,D.boss?5:3.5,Math.max(0,f.hp/f.max),{col:D.boss?'#ff6b7a':'#7dffa8'})}});
      /* chuva de essência */
      S.rains.forEach(r=>{x.save();GX.glow(x,r.x,r.y,92,'#3ac8ff',.3);x.beginPath();x.ellipse(r.x,r.y,80,80,0,0,7);x.strokeStyle='rgba(191,239,255,.75)';x.lineWidth=1.5;x.stroke();x.strokeStyle='#cdf4ff';x.lineWidth=2;x.lineCap='round';
        for(let i=0;i<26;i++){const a=i*2.4,rr=(i*13)%74,k=red?.5:((t*2.2+i*.173)%1),X=r.x+Math.cos(a)*rr,Y=r.y+Math.sin(a)*rr-34+k*34;x.globalAlpha=.9-k*.4;x.beginPath();x.moveTo(X,Y-9);x.lineTo(X-2,Y);x.stroke();if(k>.82){x.beginPath();x.ellipse(X-2,Y+3,5,1.8,0,0,7);x.stroke()}}
        x.globalAlpha=.82;GX.draw(x,art.cloud(),r.x,Math.max(22,r.y-66),{w:112});x.restore()});
      /* disparos */
      S.shots=S.shots.filter(s=>now-s.t0<160);S.shots.forEach(s=>{const k=(now-s.t0)/160;x.save();x.lineCap='round';x.globalCompositeOperation='lighter';x.strokeStyle=s.c;
        x.globalAlpha=(1-k)*.4;x.lineWidth=s.big?13:7;x.beginPath();x.moveTo(s.x0,s.y0-(s.big?10:14));x.lineTo(s.x1,s.y1);x.stroke();
        x.globalAlpha=1-k;x.lineWidth=s.big?4:2;x.stroke();x.strokeStyle='#ffffff';x.lineWidth=s.big?1.6:.8;x.stroke();x.restore();
        const q=Math.min(1,k*1.5),bx=s.x0+(s.x1-s.x0)*q,by=s.y0-14+(s.y1-s.y0+14)*q;GX.glow(x,bx,by,s.big?22:11,s.c,1-k*.5);GX.glow(x,s.x1,s.y1,s.big?46:20,s.c,(1-k)*.8)});
      art.amb.draw(x,t);
      /* pré-visualização de construção e de poder */
      if(S.place&&S.hover&&S.hover[1]<TB){const [c,r]=tcell(...S.hover),ok=!road.has(c+','+r)&&!towerAt(c,r)&&S.ess>=TOT44[S.place].cost,b=TOT44[S.place],cx=c*CS+CS/2,cy=r*CS+CS/2;
        rr16(x,c*CS+2,r*CS+2,CS-4,CS-4,8);x.fillStyle=ok?'rgba(125,255,168,.24)':'rgba(255,90,80,.34)';x.fill();x.strokeStyle=ok?'#7dffa8':'#ff6b5b';x.lineWidth=2.5;x.stroke();
        if(!ok){x.beginPath();x.moveTo(cx-10,cy-10);x.lineTo(cx+10,cy+10);x.moveTo(cx+10,cy-10);x.lineTo(cx-10,cy+10);x.stroke()}else GX.draw(x,art.totem(S.place,1,''),cx,cy+16,{ay:52/62,alpha:.65});
        x.beginPath();x.arc(cx,cy,b.rng*CS,0,7);x.strokeStyle=b.c;x.lineWidth=1.5;x.setLineDash([8,6]);x.stroke();x.setLineDash([]);
        S.towers.forEach(tw=>{if(Math.hypot(tw.x-cx,tw.y-cy)<=CS*1.5+1){const k=synOf44(tw.k,S.place);if(k)synBadge(x,tw.x,tw.y-34,k)}})}
      if(S.pend&&S.hover&&S.hover[1]<TB){const R=S.pend==='rain'?80:24;GX.glow(x,S.hover[0],S.hover[1],R*1.2,S.pend==='rain'?'#3ac8ff':'#ffc43c',.35);x.strokeStyle='#ffd36b';x.lineWidth=2;x.setLineDash([6,5]);x.lineDashOffset=red?0:-t*20;x.beginPath();x.arc(S.hover[0],S.hover[1],R,0,7);x.stroke();x.setLineDash([])}
      (S.links||[]).forEach(([a,b,k])=>synBadge(x,(a.x+b.x)/2,(a.y+b.y)/2+4,k));
      GX.vignette(x,W,TB,{a:.34});
      const p=panel();if(p){const tw=S.sel,b=TOT44[tw.k],sp4=tw.lv>3;
        GX.hud.panel(x,p.x,p.y,p.w,p.h,{r:10,acc:b.c,a:.97});
        art.sym(x,tw.k,p.x+16,p.y+15,15,GX.shade(b.c,.4));
        pt(x,`${b.n} · ${sp4?b[tw.spec.toUpperCase()][0]:'nível '+tw.lv}`,p.x+28,p.y+15,{size:13,w:800,max:p.a?p.w-106:p.w-36});
        const info=sp4?b[tw.spec.toUpperCase()][1]:b.info,two=!tw.syn.size,ls=wrapTwo(x,info,p.w-18);
        if(two&&ls[1]){pt(x,ls[0],p.x+10,p.y+32,{size:11,w:500,col:'#e4d8c4',max:p.w-18});pt(x,ls[1],p.x+10,p.y+45,{size:11,w:500,col:'#e4d8c4',max:p.w-18})}else pt(x,info,p.x+10,p.y+32,{size:11,w:500,col:'#e4d8c4',max:p.w-18});
        if(tw.syn.size)pt(x,[...tw.syn].map(k=>`${SYN44[k].g} ${SYN44[k].n}`).join(' · '),p.x+10,p.y+46,{size:10,w:700,col:'#ffd36b',max:p.w-18});
        const bt=(bb,l,on,col='#c99a3a')=>{art.slot(x,bb,{on,col});pt(x,l,bb.x+bb.w/2,bb.y+bb.h/2+1,{size:12,w:800,al:'center',col:on?'#ffffff':'#a8987e',max:bb.w-6})};
        if(p.up)bt(p.up,sp4?'Especializado':`Melhorar ${upCost(tw)}`,tw.lv<3&&S.ess>=upCost(tw),'#3fae5a');
        if(p.a){['a','b'].forEach(k=>{const bb=p[k],sp=b[k.toUpperCase()],can=S.ess>=upCost(tw);art.slot(x,bb,{on:can,col:b.c});pt(x,`${k.toUpperCase()} · ${sp[0]}`,bb.x+bb.w/2,bb.y+14,{size:11,w:800,al:'center',max:bb.w-6});GX.icon(x,'gota',bb.x+bb.w/2-18,bb.y+31,11,'#ffd36b');pt(x,String(upCost(tw)),bb.x+bb.w/2+6,bb.y+32,{size:12,w:800,al:'center',col:'#ffd36b'})})}
        bt(p.sell,`Vender +${Math.round(tw.spent*.6)}`,true)}
      /* barra de construção */
      x.drawImage(art.bar(),0,TB,W,H-TB);
      KEYS.forEach((k,i)=>{const b=TOT44[k],bb=BTN(k),on=S.place===k,can=S.ess>=b.cost;art.slot(x,bb,{on,col:b.c});
        if(on)GX.glow(x,bb.x+18,bb.y+19,28,b.c,.5);
        GX.draw(x,art.totem(k,1,''),bb.x+18,bb.y+32,{ay:52/62,w:32,alpha:can?1:.45});
        if(!small)pt(x,`${i+1} ${b.n}`,bb.x+33,bb.y+11,{size:11,w:700,col:can?'#fff4e0':'#a8987e',max:bb.w-36});
        const cy=small?bb.y+19:bb.y+27;GX.icon(x,'gota',bb.x+39,cy,small?14:12,can?'#ffd36b':'#8a7a66');
        GX.hud.text(x,String(b.cost),bb.x+47,cy+1,{size:small?17:13,w:900,col:can?'#ffd36b':'#a8987e',min:small?10:9,max:bb.w-50,stroke:0})});
      ['wall','rain'].forEach(k=>{const a=ABL44[k],bb=BAB(k),cd=S.ab[k],on=S.pend===k,cx=bb.x+bb.w/2;art.slot(x,bb,{on,col:'#ffd36b'});
        if(k==='wall')GX.draw(x,art.wall(),cx,bb.y+14,{w:10,h:22});else{GX.draw(x,art.cloud(),cx,bb.y+10,{w:34});x.strokeStyle='#9fe0ff';x.lineWidth=1.8;[-9,0,9].forEach(d=>{x.beginPath();x.moveTo(cx+d,bb.y+17);x.lineTo(cx+d-2,bb.y+23);x.stroke()})}
        if(cd>0){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(bb.x,bb.y,bb.w*cd/a.cd,bb.h)}
        GX.hud.text(x,cd>0?`${Math.ceil(cd)} s`:k==='wall'?'M':'C',cx,bb.y+31,{size:11,w:900,al:'center',col:cd>0?'#e8dcc8':'#ffd36b',min:small?9:8})});
      const busy=S.q.length||S.foes.length;
      [[B_WAVE,busy?(S.auto?'Auto: ligado':'Auto: desligado'):'Onda '+(S.wave+1),busy?(S.auto?'pausa':'play'):'play',!busy],[B_FAST,'x'+S.fast,'ff',false]].forEach(([bb,l,ic,hot])=>{
        if(hot&&!S.over)GX.glow(x,bb.x+bb.w/2,bb.y+bb.h/2,64,'#ffd36b',.3+(red?0:.18*Math.sin(t*4)),{sy:.55});
        art.slot(x,bb,{on:hot||(ic==='pausa')||(ic==='ff'&&S.fast>1),col:'#c99a3a'});
        const ix=bb.x+15,iy=bb.y+bb.h/2;
        if(ic==='pausa'){x.fillStyle='#ffd36b';x.fillRect(ix-5,iy-6,4,12);x.fillRect(ix+2,iy-6,4,12)}else{GX.poly(x,[[ix-4,iy-7],[ix+6,iy],[ix-4,iy+7]],'#ffd36b');if(ic==='ff')GX.poly(x,[[ix+4,iy-7],[ix+14,iy],[ix+4,iy+7]],'#ffd36b')}
        GX.hud.text(x,l,bb.x+(ic==='ff'?34:26),iy+1,{size:13,w:900,col:'#ffe6a0',min:9,max:bb.w-(ic==='ff'?38:30),stroke:0})});
      GX.hud.chip(x,W-8,15,{icon:'coracao',text:String(S.vital),col:'#ff8a8a',size:13,al:'right',min:10});
      GX.hud.chip(x,W-8,small?44:40,{icon:'gota',text:String(Math.floor(S.ess)),col:'#ffd36b',size:13,al:'right',min:10});
      if(S.msg&&now-S.msgT<2400){x.save();x.globalAlpha=Math.min(1,(2400-(now-S.msgT))/400);GX.hud.text(x,GX.clean(S.msg),W/2,24,{size:17,w:900,al:'center',col:'#fff4d8',stroke:5,min:10,max:W-170});x.restore()}
      if(Date.now()>=C.t0&&V.banner&&now-V.banner.t0<1500){const a=now-V.banner.t0;GX.hud.banner(x,W,TB,V.banner.t,{sub:V.banner.sub,acc:V.banner.acc,k:Math.min(1,a/150,(1500-a)/400),y:TB*.42})}
      if(now-V.hurt<500)GX.vignette(x,W,H,{a:.8*(1-(now-V.hurt)/500),col:'#b0102a'});
      GX.hud.frame(x,W,H,{acc:art.TH.acc,a:.55});
    }
  };
}
Object.assign(ACH,{
  sd_sinergia:{ico:'✨',n:'Harmonia Elemental',d:'Ative uma sinergia de Sub-Elemento na Defesa do Santuário.'},
  sd_ciclo:{ico:'🔯',n:'O Ciclo Completo',d:'Tenha as 5 sinergias de Sub-Elemento ativas ao mesmo tempo.',secret:true},
  sd_chefe:{ico:'👑',n:'Queda do Colosso',d:'Derrote um Chefe na Defesa do Santuário.'},
  sd_spec:{ico:'🗼',n:'Especialista',d:'Especialize um totem na Defesa do Santuário.'},
  sd_infinito:{ico:'♾',n:'Vigília Eterna',d:'Chegue à onda 40 no modo Infinito.'},
});
ACH.guardiao&&(ACH.guardiao.d='Vença as 30 ondas da Campanha da Defesa do Santuário.');
defineArcadeGame('santuario',{...GAMES12.santuario,make:sanctuary44,setup:sdSetup44,
  desc:'4 mapas, Campanha de 30 ondas ou Infinito, chefes com habilidades, totens com especializações, sinergias de Sub-Elementos e poderes ativos.',
  keys:'1-5 totens · clique no mapa · clique no totem para melhorar/especializar · M Muralha · C Chuva · Espaço onda · U melhora · X vende',touch:'Toque no totem embaixo e depois no mapa · toque num totem para melhorar ou especializar · 🧱 e 🌧 são os poderes'});
console.info('[Tulpa] Etapa 44 carregada (Defesa do Santuário 2.0)');

/* ===================================================================
   TULPA · ETAPA 45 — 🕹 ARCADE 2.0 · ONDA 4 (parte 2)
   👑 O TRONO DO MESTRE 2.0
   Arcos narrativos encadeados: escolhas de hoje voltam 5 a 15 sessões
   depois. Elenco fixo com personalidade (O Combeiro, O Cultista, O
   Detetive, Perseus Conselheiro, O Monstro). Bênçãos e Maldições ficam
   no topo e mudam como as barras sobem e descem. Crise a cada ano
   (12 sessões), duelos decididos no dado, preview do tamanho do efeito
   ao inclinar a carta e uma Galeria com 18 finais para colecionar.
   =================================================================== */
const TRB45=['🎲 Mestre','👥 Jogadores','❤ Vital','🧠 Lucidez'],TRC45=['#ffd36b','#7fe3ff','#ff6b5b','#c39bff'];
const CAST45={
  combeiro:{n:'O Combeiro',ico:'🧮',p:'Otimiza tudo. Vive de combos e brechas nas regras.'},
  cultista:{n:'O Cultista',ico:'🕯',p:'Gentil demais. Sempre tem um pacto “sem compromisso”.'},
  detetive:{n:'O Detetive',ico:'🕵',p:'Desconfia de tudo, principalmente de você.'},
  perseus:{n:'Perseus Conselheiro',ico:'😼',p:'Sábio, preguiçoso e movido a petisco.'},
  monstro:{n:'O Monstro',ico:'👹',p:'Mora embaixo da mesa da ordem. Cresce quando ignorado.'},
};
const MOD45={
  mentor:{n:'Bênção do Mentor',g:'📖',good:1,d:'Ganhos de Jogadores valem 25% a mais.'},
  cafe:{n:'Café Infinito',g:'☕',good:1,d:'+1 de Vital a cada sessão.'},
  olho:{n:'Olho do Detetive',g:'🔍',good:1,d:'Você vê os números exatos de cada escolha.'},
  guarda:{n:'Guardião Domado',g:'🛡',good:1,d:'Perdas de Vital caem pela metade.'},
  vidas:{n:'Sete Vidas do Perseus',g:'🐾',good:1,d:'Salva a campanha uma vez quando uma barra estourar.'},
  tedio:{n:'Maldição do Tédio',g:'🥱',d:'−1 de Jogadores a cada sessão.'},
  teia:{n:'Maldição da Paranoia',g:'🕸',d:'−1 de Lucidez a cada sessão.'},
  birra:{n:'Birra do Perseus',g:'😾',d:'Perdas de Lucidez valem 25% a mais.'},
  dividas:{n:'Dívidas da Ordem',g:'💸',d:'Ganhos de Mestre valem metade.'},
  pacto:{n:'Marca do Pacto',g:'🩸',d:'−1 de Vital a cada sessão.'},
};
const END45={
  b0:['🫥','O Mestre desapareceu','Sem autoridade, a ordem virou um grupo de mensagens sem dono.'],
  b1:['🤴','O Mestre virou tirano','Ninguém mais aguentava as regras. A mesa ficou vazia.'],
  b2:['🚪','Os jogadores foram embora','Sem diversão, cada um foi jogar outra coisa.'],
  b3:['🎭','Os jogadores tomaram o trono','Felizes demais, decidiram mestrar no seu lugar.'],
  b4:['💤','A ordem perdeu o Vital','Cansados e feridos, todos foram dormir para sempre.'],
  b5:['♾','Vital demais','Todo mundo ficou imortal e a campanha perdeu a graça.'],
  b6:['🌀','A Lucidez acabou','A ordem enlouqueceu e passou a adorar o Perseus.'],
  b7:['🌞','Lucidez demais','Viram a verdade do Véu e transcenderam. Sem jogadores.'],
  culto:['🕯','O Culto da Inexistência','A porta foi aberta. Agora a ordem reza para o vazio entre as sessões.'],
  usurpa:['😼','Perseus no Trono','O gato julgado injustamente voltou e tomou a cadeira do Mestre. Ninguém reclamou.'],
  monstro:['👹','O Monstro devorou a campanha','Ele cresceu tanto que engoliu a mesa, os dados e a pizza.'],
  tulpa:['🪞','Você era um Tulpa','O Detetive provou: o Mestre nunca existiu. Você foi imaginado pelos jogadores.'],
  rebeliao:['🔥','A Rebelião dos Jogadores','A crise virou motim. Fichas rasgadas, dados jogados pela janela.'],
  build:['🧮','A Build Quebrada','O Combeiro achou o combo infinito e zerou o jogo na primeira rolagem.'],
  pizzaria:['🍕','A Ordem virou Pizzaria','Ninguém lembra mais da campanha, mas a calabresa é ótima.'],
  aposentado:['🪑','Aposentadoria Honrosa','Você passou o trono para um jogador e virou lenda viva nas histórias da ordem.'],
  exilio:['🌫','Exilado no Véu','Um duelo perdido de narrativas te mandou para o outro lado do Véu.'],
  lenda:['🏆','Campanha Lendária','Dez anos de sessões. O nome da sua ordem virou mito em todas as mesas.'],
};
/* carta: {id, who, ico, t, L:{t,fx,set,sched,mod,unmod,end,roll}, R:{...}, req(F), once, crisis, arc}
   fx = [Mestre, Jogadores, Vital, Lucidez]; sched = [id, min, max]; roll = {i, ok:{fx,t,end?}, no:{fx,t,end?}} */
const TRC45cards=(()=>{
  const base=(typeof TRONO_CARDS!=='undefined'?TRONO_CARDS:[]).map((c,i)=>({id:'b'+i,who:c[0],ico:c[1],t:c[2],L:{t:c[3][0],fx:c[3][1]},R:{t:c[4][0],fx:c[4][1]}}));
  const arc=[
    /* O Cultista: pacto oculto */
    {id:'pact1',who:'cultista',t:'“Posso salvar o Vital do grupo agora mesmo. Em troca, só um pequeno ritual… depois.”',L:{t:'Aceite o pacto.',fx:[0,4,22,-4],mod:'pacto',sched:['pact2',5,9]},R:{t:'Recuse com educação.',fx:[4,-4,-6,4]},once:1,arc:1},
    {id:'pact2',who:'cultista',t:'Os cultistas vieram cobrar o pacto. Querem o ritual nesta sessão.',L:{t:'Faça o ritual.',fx:[0,6,0,-16],sched:['pact3',8,12]},R:{t:'Quebre o pacto.',fx:[6,-14,0,0],unmod:'pacto',sched:['rebel1',5,10]},once:1,arc:1},
    {id:'pact3',who:'cultista',t:'Algo bate do outro lado do Véu. Os cultistas pedem que você abra a porta.',L:{t:'Abra a porta.',fx:[0,0,0,0],end:'culto'},R:{t:'Sele a porta para sempre.',fx:[8,-6,-8,10],unmod:'pacto',mod:'mentor'},once:1,arc:1},
    {id:'rebel1',who:'cultista',crisis:1,t:'CRISE: os cultistas enganados incitam os jogadores contra você.',L:{t:'Reprima a revolta.',roll:{i:0,ok:{fx:[12,-16,0,0],t:'A ordem obedeceu, a contragosto.'},no:{fx:[0,0,0,0],t:'Os jogadores tomaram as ruas.',end:'rebeliao'}}},R:{t:'Negocie a paz.',fx:[-10,6,0,-10],mod:'teia'},once:1,arc:1},
    /* O Detetive: o segredo do Mestre */
    {id:'det1',who:'detetive',t:'“Mestre, você rola os dados escondido atrás do escudo. Por quê?”',L:{t:'Mostre tudo.',fx:[-8,8,0,4]},R:{t:'Negue.',fx:[6,-4,0,0],set:'mentira',sched:['det2',6,10]},once:1,arc:1},
    {id:'det2',who:'detetive',t:'O Detetive achou suas anotações secretas. Ele exige explicações.',L:{t:'Confesse.',fx:[-14,10,0,6],mod:'olho'},R:{t:'Culpe o Perseus.',fx:[6,-6,0,-4],set:'culpaPerseus',sched:['det3',5,8]},once:1,arc:1},
    {id:'det3',who:'detetive',t:'Julgamento: o Perseus é acusado de mexer nas suas anotações.',L:{t:'Exile o Perseus.',fx:[8,-8,0,-6],sched:['usurp',8,14]},R:{t:'Admita que mentiu.',fx:[-16,12,0,8]},once:1,arc:1},
    {id:'usurp',who:'perseus',crisis:1,t:'CRISE: o Perseus voltou do exílio, maior e mais peludo. Ele quer o trono.',L:{t:'Ceda o trono.',fx:[0,0,0,0],end:'usurpa'},R:{t:'Duelo de olhares.',roll:{i:0,ok:{fx:[12,6,0,0],t:'O gato piscou primeiro.'},no:{fx:[0,0,0,0],t:'Você piscou.',end:'usurpa'}}},once:1,arc:1},
    {id:'det4',who:'detetive',req:F=>F.mentira&&F.olho,t:'“Investiguei mais fundo. Mestre… você tem reflexo no espelho?”',L:{t:'Olhe no espelho.',fx:[0,0,0,0],end:'tulpa'},R:{t:'Quebre o espelho.',fx:[6,0,-6,-12]},once:1,arc:1},
    /* O Combeiro: a build quebrada */
    {id:'comb1',who:'combeiro',t:'“Mestre, juntei três talentos e uma arma. Dano infinito. Pode?”',L:{t:'Pode, é criativo.',fx:[-6,12,0,0],sched:['comb2',5,9]},R:{t:'Corte o combo.',fx:[8,-10,0,0]},once:1,arc:1},
    {id:'comb2',who:'combeiro',t:'Todos querem a build do Combeiro. As lutas acabam em uma rodada.',L:{t:'Libere geral.',fx:[-10,14,0,-4],sched:['comb3',6,10]},R:{t:'Errata nas regras.',fx:[12,-14,0,0],mod:'dividas'},once:1,arc:1},
    {id:'comb3',who:'combeiro',crisis:1,t:'CRISE: o Combeiro achou o combo que encerra qualquer história.',L:{t:'Deixe rolar.',fx:[0,0,0,0],end:'build'},R:{t:'Duelo de regras.',roll:{i:3,ok:{fx:[10,-6,0,6],t:'Você achou a brecha da brecha.'},no:{fx:[-12,8,0,-8],t:'O Combeiro citou a página 312.'}}},once:1,arc:1},
    /* O Monstro */
    {id:'mon1',who:'monstro',t:'Algo ronca embaixo da mesa da ordem. Os petiscos estão sumindo.',L:{t:'Alimente o Monstro.',fx:[0,4,-10,0],set:'alimentou',sched:['mon2',6,10]},R:{t:'Finja que não ouviu.',fx:[0,0,0,-4],sched:['mon2b',10,15]},once:1,arc:1},
    {id:'mon2',who:'monstro',t:'O Monstro cresceu e agora te olha com carinho. Ele parece… leal.',L:{t:'Dome o Monstro.',fx:[6,6,0,0],mod:'guarda'},R:{t:'Leve ao veterinário do Véu.',fx:[-4,4,8,4]},once:1,arc:1},
    {id:'mon2b',who:'monstro',crisis:1,t:'CRISE: o Monstro acordou faminto e destruiu o mapa tático.',L:{t:'Enfrente o Monstro.',roll:{i:2,ok:{fx:[10,10,-10,0],t:'Você venceu e virou lenda.'},no:{fx:[0,0,0,0],t:'Ele era maior do que parecia.',end:'monstro'}}},R:{t:'Ofereça a pizza da sessão.',fx:[-8,-10,6,0],set:'pizza'},once:1,arc:1},
    /* Perseus Conselheiro */
    {id:'pc1',who:'perseus',t:'“Miau. Tenho conselhos de 9 vidas. Aceito pagamento em sachê.”',L:{t:'Pague o sachê.',fx:[0,4,0,4],mod:'vidas'},R:{t:'Gatos não dão conselhos.',fx:[4,-2,0,0],mod:'birra',sched:['pc2',8,12]},once:1,arc:1},
    {id:'pc2',who:'perseus',t:'O Perseus ainda está de birra. Derrubou todos os dados no chão.',L:{t:'Peça desculpas (e sachê).',fx:[-4,4,0,6],unmod:'birra',mod:'cafe'},R:{t:'Ignore a birra.',fx:[4,-4,0,-8]},once:1,arc:1},
    /* duelos e especiais */
    {id:'duel1',who:'🎭',ico:'🎭',t:'Um Mestre rival desafia você para um duelo de narrativas valendo a ordem.',L:{t:'Aceite o duelo.',roll:{i:0,ok:{fx:[14,10,0,0],t:'Sua história arrancou aplausos.'},no:{fx:[-16,-6,0,0],t:'O rival foi melhor desta vez.'}}},R:{t:'Recuse.',fx:[-6,-4,4,4]},req:(F,n)=>n>=10},
    {id:'duel2',who:'🎭',ico:'🌫',t:'O rival voltou, agora com um dado do Véu. A aposta é seu lugar no mundo.',L:{t:'Aposte tudo.',roll:{i:3,ok:{fx:[16,8,0,8],t:'O dado do Véu caiu do seu lado.'},no:{fx:[0,0,0,0],t:'O Véu te puxou.',end:'exilio'}}},R:{t:'Fuja do duelo.',fx:[-12,-8,0,0]},req:(F,n)=>n>=30,once:1},
    {id:'pizza2',who:'🍕',ico:'🍕',req:F=>F.pizza,t:'Desde a crise, a ordem só fala da pizza. Abriram até um cardápio.',L:{t:'Abra a pizzaria.',fx:[0,0,0,0],end:'pizzaria'},R:{t:'Volte para a campanha.',fx:[6,-8,0,4]},once:1},
    {id:'cafe1',who:'☕',ico:'☕',t:'A curandeira descobriu um bule que nunca esvazia.',L:{t:'Café para todos.',fx:[0,6,4,-4],mod:'cafe'},R:{t:'Guarde para emergências.',fx:[4,-2,0,2]},once:1},
    {id:'ment1',who:'📖',ico:'📖',t:'Uma veterana se oferece para ensinar os novatos da ordem.',L:{t:'Aceite a mentora.',fx:[-4,6,0,4],mod:'mentor'},R:{t:'Aqui quem ensina sou eu.',fx:[8,-6,0,0]},once:1},
  ];
  const crises=[
    {id:'cr1',crisis:1,who:'📅',ico:'📅',t:'CRISE DE FIM DE ANO: metade da mesa viaja nas férias.',L:{t:'Sessões online.',fx:[-6,-6,0,-6]},R:{t:'Pausa de um mês.',fx:[-10,-10,10,10]}},
    {id:'cr2',crisis:1,who:'☠',ico:'☠',t:'CRISE: o grupo está à beira de um TPK.',L:{t:'Intervenção divina.',fx:[-12,10,12,0]},R:{t:'Os dados decidem.',roll:{i:2,ok:{fx:[10,10,-6,0],t:'Sobreviveram por um fio.'},no:{fx:[6,-16,-16,0],t:'Fichas novas para todos.'}}}},
    {id:'cr3',crisis:1,who:'💔',ico:'💔',t:'CRISE: um casal da mesa terminou. Os dois querem continuar jogando.',L:{t:'Separe os grupos.',fx:[6,-12,0,0]},R:{t:'Tudo junto e misturado.',fx:[-8,4,0,-12]}},
    {id:'cr4',crisis:1,who:'🌑',ico:'🌑',t:'CRISE: o Véu ameaça engolir o mundo da campanha.',L:{t:'Arco épico de 10 sessões.',fx:[8,8,-12,-8]},R:{t:'Reinicie o mundo.',fx:[-14,-6,10,10]}},
    {id:'cr5',crisis:1,who:'🪑',ico:'🪑',t:'CRISE: um jogador antigo pergunta se você não quer descansar e passar o trono.',L:{t:'Passe o trono.',fx:[0,0,0,0],end:'aposentado'},R:{t:'Ainda não é a hora.',fx:[6,-4,-6,0]},req:(F,n)=>n>=48},
  ];
  return{base,arc,crises,all:[...base,...arc,...crises]};
})();
const TRBYID45=Object.fromEntries(TRC45cards.all.map(c=>[c.id,c]));
function trProg45(){const p=prog38().tr||{};return{ends:p.ends||{},best:p.best||0}}
const trSetup45={
  intro:()=>'Cada carta é uma sessão. Escolhas voltam como consequência anos depois. Nenhuma barra pode zerar nem lotar.',
  def:()=>({m:'camp'}),
  fields:()=>[{k:'m',l:'Modo',opts:[{v:'camp',n:'Campanha',ico:'👑',d:'Sobreviva o quanto puder. Ao chegar em 10 anos (120 sessões), sua ordem vira lenda.'}]}],
  sum:()=>{const p=trProg45(),n=Object.keys(p.ends).length;return`<b>Galeria de finais: ${n} de ${Object.keys(END45).length}</b><br>${Object.entries(END45).map(([k,e])=>p.ends[k]?`<span title="${esc(e[1])}">${e[0]}</span>`:'<span title="Final ainda não descoberto">❔</span>').join(' ')}${p.best?`<br>Recorde: ${p.best} sessões.`:''}`}
};

/* ---------- 🎨 arte do Trono do Mestre (GFX60) · SOMENTE VISUAL ----------
   Direção: salão do trono em carmim e ouro, vitral, colunas, velas e
   cartas de pergaminho com retratos pintados. Não lê nem gasta a semente. */
function trArt45(){
  const G=window.GFX60,W=480,H=640,TAU=Math.PI*2;
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ell=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1,a0=0,a1=TAU)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(X,Y,r,a0,a1);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const gold=(g,y0,y1)=>vg(g,y0,y1,'#fbe3a0','#c8962e','#6e4a14','#e0b456');

  /* ===== salão ===== */
  const hall=()=>G.bake('tr:hall',W,H,(g,w,h,r)=>{
    box(g,0,0,w,h,vg(g,0,h,'#1a0a10','#3a121a','#150709'));
    G.fillTile(g,G.tile('tijolo',{size:80,a:'#3c1a22',b:'#160a0e',seed:7}),0,0,w,520,{alpha:.55});
    /* vitral */
    const arch=(X,Y,ww,hh)=>{g.beginPath();g.moveTo(X-ww/2,Y+hh);g.lineTo(X-ww/2,Y+ww/2);g.arc(X,Y+ww/2,ww/2,Math.PI,0);g.lineTo(X+ww/2,Y+hh);g.closePath()};
    g.save();arch(w/2,140,330,380);g.clip();box(g,0,0,w,h,'#12060c');
    const cols=['#7a1830','#b8862e','#1f4a7a','#3a1f6a','#14604a','#a83a20'];
    for(let j=0;j<9;j++)for(let i=0;i<8;i++){const X=75+i*42+(j%2)*21,Y=140+j*44;G.poly(g,[[X,Y],[X+20,Y+22],[X,Y+44],[X-20,Y+22]],cols[Math.floor(r()*cols.length)])}
    G.glow(g,w/2,230,190,'#ffcf6a',.5,{add:false});box(g,0,0,w,h,'rgba(10,3,8,.42)');g.restore();
    for(let X=117;X<400;X+=62)line(g,[[X,170],[X,520]],'rgba(15,6,6,.8)',4);
    arch(w/2,140,330,380);g.strokeStyle='#150808';g.lineWidth=14;g.stroke();g.strokeStyle=gold(g,140,520);g.lineWidth=5;g.stroke();
    /* trono atrás da carta */
    G.poly(g,[[56,600],[70,230],[96,196],[122,228],[138,176],[168,222],[w/2,150],[312,222],[342,176],[358,228],[384,196],[410,230],[424,600]],'#2a0a10');
    line(g,[[56,600],[70,230],[96,196],[122,228],[138,176],[168,222],[w/2,150],[312,222],[342,176],[358,228],[384,196],[410,230],[424,600]],'#b8862e',3);
    [[96,196],[138,176],[w/2,150],[342,176],[384,196]].forEach(([X,Y])=>{disc(g,X,Y-5,6,'#ffd98a');disc(g,X-2,Y-7,2,'#fff')});
    /* colunas */
    [0,w-38].forEach((X,i)=>{box(g,X,0,38,h,'#241a22');const q=g.createLinearGradient(X,0,X+38,0);q.addColorStop(0,i?'#4a3a46':'#120c12');q.addColorStop(.5,'#5a4856');q.addColorStop(1,i?'#120c12':'#3a2c38');box(g,X+3,0,32,h,q);
      [10,19,28].forEach(u=>box(g,X+u,150,2,380,'rgba(0,0,0,.3)'));box(g,X,138,38,12,gold(g,138,150));box(g,X,528,38,14,gold(g,528,542))});
    /* estandartes */
    [[44,150],[w-84,150]].forEach(([X,Y])=>{box(g,X-4,Y-6,48,6,gold(g,Y-6,Y),3);G.poly(g,[[X,Y],[X+40,Y],[X+40,Y+150],[X+20,Y+132],[X,Y+150]],'#8a1424');G.poly(g,[[X+20,Y],[X+40,Y],[X+40,Y+150],[X+20,Y+132]],'#5e0c18');line(g,[[X+4,Y],[X+4,Y+140],[X+20,Y+127],[X+36,Y+140],[X+36,Y]],'#d6a94a',1.5);G.icon(g,'coroa',X+20,Y+50,24,'#ffd36b');ring(g,X+20,Y+50,17,'rgba(255,211,107,.5)',1.5)});
    /* piso e tapete */
    box(g,0,548,w,h-548,vg(g,548,h,'#2c1c22','#0e080a'));for(let i=-8;i<=8;i++)line(g,[[w/2+i*34,548],[w/2+i*90,h]],'rgba(255,220,170,.09)',1);[560,580,610].forEach(y=>line(g,[[0,y],[w,y]],'rgba(255,220,170,.08)',1));
    G.poly(g,[[170,548],[310,548],[400,h],[80,h]],'#7a1020');line(g,[[176,548],[96,h]],'#d6a94a',3);line(g,[[304,548],[384,h]],'#d6a94a',3);
    box(g,0,0,w,150,vg(g,0,150,'rgba(6,2,4,.85)','rgba(6,2,4,0)'));
  });
  const candelabrum=()=>G.bake('tr:cande',44,120,g=>{ell(g,22,114,18,5,'rgba(0,0,0,.45)');ell(g,22,111,15,4.5,'#8a6218');box(g,19,52,6,60,gold(g,52,112),3);line(g,[[7,46],[10,60],[22,66],[34,60],[37,46]],'#c8962e',4);disc(g,22,82,5,'#e0b456');
    [[7,46],[22,40],[37,46]].forEach(([X,Y])=>{ell(g,X,Y,6,2.4,'#e0b456');box(g,X-3,Y-18,6,18,'#f4e8c8',1.5);box(g,X+1,Y-18,2,18,'#c8b890');line(g,[[X,Y-18],[X,Y-22]],'#2a1408',1.2)})},{s:2});
  function flames(x,X,Y,t,k){const red=G.reduced();[[-15,-96],[0,-102],[15,-96]].forEach(([u,v],i)=>{const f=red?0:Math.sin(t*10+k+i*2)*.9;G.glow(x,X+u,Y+v,26+f*2,'#ff9a3c',.38);x.fillStyle='#ffb33a';x.beginPath();x.ellipse(X+u+f*.3,Y+v,2.6,5.2+f*.4,0,0,TAU);x.fill();x.fillStyle='#fff4c0';x.beginPath();x.ellipse(X+u,Y+v+1.4,1.2,2.6,0,0,TAU);x.fill()})}

  /* ===== medidores ===== */
  function stat(g,i,cx,cy,s,col){
    if(i===0){const P=k=>{const a=-Math.PI/2+k*TAU/6;return[cx+Math.cos(a)*s*.5,cy+Math.sin(a)*s*.5]};G.poly(g,[0,1,2,3,4,5].map(P),col);const T=[[cx,cy-s*.24],[cx+s*.22,cy+s*.14],[cx-s*.22,cy+s*.14]];line(g,[...T,T[0]],'rgba(0,0,0,.65)',1.3);[[0,0],[2,1],[4,2]].forEach(([k,j])=>line(g,[T[j],P(k)],'rgba(0,0,0,.55)',1.1))}
    else if(i===1){[[-.24,-.02,.82],[.24,-.02,.82],[0,.08,1]].forEach(([u,v,k])=>{disc(g,cx+s*u,cy+s*(v-.2),s*.15*k+.6,'rgba(0,0,0,.6)');disc(g,cx+s*u,cy+s*(v-.2),s*.15*k,col);g.fillStyle=col;g.beginPath();g.arc(cx+s*u,cy+s*(v+.3),s*.23*k,Math.PI,0);g.closePath();g.fill()})}
    else G.icon(g,i===2?'coracao':'olho',cx,cy,s*(i===2?1.05:1.15),col);
  }
  const gauge=(i,col)=>G.bake(`tr:gauge:${i}`,100,70,g=>{box(g,0,0,100,70,gold(g,0,70),12);box(g,2.5,2.5,95,65,vg(g,2,68,'#2e1820','#10080c'),10);rim(g,5,5,90,60,8,G.rgba(col,.35),1);G.glow(g,50,22,30,col,.28,{add:false});stat(g,i,50,22,30,'rgba(255,240,220,.3)')},{s:2});
  /* ícones das bênçãos e maldições */
  const modIcon=(k,good)=>G.bake(`tr:mod:${k}`,32,32,g=>{box(g,0,0,32,26,good?'#12432a':'#4a1018',8);rim(g,.75,.75,30.5,24.5,7.5,good?'#6fe8a0':'#ff8a7a',1.5);const c='#fff4dc';
    if(k==='mentor'){G.poly(g,[[7,7],[16,10],[25,7],[25,19],[16,22],[7,19]],c);line(g,[[16,10],[16,22]],'#4a2a10',1.4);line(g,[[10,12],[13,13]],'#8a6a3a',1);line(g,[[19,13],[22,12]],'#8a6a3a',1)}
    else if(k==='cafe'){box(g,9,11,12,10,c,3);ring(g,22,15,3.4,c,1.8,-1.6,1.6);line(g,[[12,9],[13,6],[12,4]],c,1.2);line(g,[[17,9],[18,6],[17,4]],c,1.2)}
    else if(k==='olho')G.icon(g,'olho',16,13,20,c);else if(k==='guarda')G.icon(g,'escudo',16,13,18,c);
    else if(k==='vidas'){ell(g,16,17,6,5,c);[[8,12],[12.5,7],[19.5,7],[24,12]].forEach(([X,Y])=>disc(g,X,Y,2.6,c))}
    else if(k==='tedio'){line(g,[[8,12],[16,12],[8,21],[16,21]],c,2);line(g,[[18,5],[24,5],[18,11],[24,11]],c,1.6)}
    else if(k==='teia'){for(let i=0;i<8;i++){const a=i*TAU/8;line(g,[[16,13],[16+Math.cos(a)*11,13+Math.sin(a)*10]],c,1)}[4.5,8.5].forEach(R=>ring(g,16,13,R,c,1))}
    else if(k==='birra'){G.poly(g,[[7,5],[13,10],[19,10],[25,5],[24,17],[16,23],[8,17]],c);line(g,[[11,12],[14,15]],'#4a1018',2);line(g,[[21,12],[18,15]],'#4a1018',2);line(g,[[13,19],[16,18],[19,19]],'#4a1018',1.3)}
    else if(k==='dividas'){G.icon(g,'moeda',16,13,18,c);line(g,[[7,21],[25,5]],'#ff6b5b',2.5)}
    else G.icon(g,'gota',16,13,19,'#ff7a8a');
    if(good)G.poly(g,[[16,25],[20,31],[12,31]],'#6fe8a0');else G.poly(g,[[12,25],[20,25],[16,31]],'#ff8a7a')},{s:2});

  /* ===== retratos ===== */
  const DEF={combeiro:['#24507a','#3a6a9a','#e8b890','spiky','glasses','abacus'],cultista:['#4a1450','#5a1848','#d8a888','hood','smile','candle'],detetive:['#5a4426','#6a5436','#c8946a','fedora','squint','lupa'],
    Jogadora:['#5a2048','#a83a6a','#e0a880','long','open','d20'],Jogador:['#1f4a34','#3a7a4a','#c89068','short','open','d20'],Arquiteto:['#2a4050','#5a7080','#d8a880','short','glasses','casa'],Bardo:['#4a2a60','#8a3a8a','#e8b890','feather','smile','alaude'],
    'Bibliotecária':['#4a3018','#7a4a2a','#d0a078','bun','glasses','livro'],Contador:['#243848','#46607a','#e0b090','bald','glasses','grafico'],Curandeira:['#1f5048','#d8e4dc','#c89878','veil','smile','cruz'],'Guardião':['#303a4a','#6a7488','#b88868','helmet','squint','escudo'],
    Ilusionista:['#3a1a6a','#4a2a8a','#d8c0e8','tophat','glow','espiral'],Mercador:['#5a3a10','#9a6a1a','#b88060','turban','smile','pocao'],Novato:['#20485a','#d87a2a','#f0c8a0','cap','open','d20'],'Oráculo':['#241450','#3a2470','#b89ac8','hood','glow','orbe'],
    Profeta:['#1a4a24','#4a7a30','#c09070','laurel','closed','folha'],'Sábio':['#4a4020','#c8a860','#d0a078','bald','closed','barba'],Viajante:['#4a3420','#7a5a3a','#c89870','wide','squint','bolsa']};
  function item(g,k,X,Y){
    if(!k||k==='barba')return;disc(g,X,Y,17,'rgba(10,4,8,.72)');ring(g,X,Y,17,'#e0b456',1.6);const c='#ffe9b0';
    if(k==='abacus'){rim(g,X-10,Y-9,20,18,2,c,1.6);[-4,1,6].forEach((v,i)=>{line(g,[[X-9,Y+v],[X+9,Y+v]],c,.8);[0,1,2].forEach(j=>disc(g,X-6+j*(3+i),Y+v,2,['#ff7a6a','#6ad0ff','#8aff9a'][i]))})}
    else if(k==='candle'){box(g,X-3,Y-3,6,13,c,1.5);ell(g,X,Y-8,3,5,'#ffb33a');ell(g,X,Y-7,1.4,2.6,'#fff')}
    else if(k==='lupa'){ring(g,X-3,Y-3,7,c,2.6);line(g,[[X+2,Y+2],[X+9,Y+9]],c,3.5);disc(g,X-5,Y-5,2,'#bfefff')}
    else if(k==='d20')stat(g,0,X,Y,24,c);else if(k==='casa')G.poly(g,[[X-10,Y],[X,Y-10],[X+10,Y],[X+7,Y],[X+7,Y+9],[X-7,Y+9],[X-7,Y]],c);
    else if(k==='alaude'){ell(g,X-3,Y+4,7,6,c,-.6);line(g,[[X,Y],[X+8,Y-9]],c,3);disc(g,X-3,Y+4,2,'#4a2a10')}
    else if(k==='livro'){box(g,X-9,Y-9,18,18,'#a83a3a',2);box(g,X-6,Y-9,2,18,'#e0b456');box(g,X-1,Y-4,8,2,c);box(g,X-1,Y+1,8,2,c)}
    else if(k==='grafico'){[[-8,5],[-2,10],[4,16]].forEach(([u,v])=>box(g,X+u,Y+8-v,4,v,c))}
    else if(k==='cruz'){box(g,X-3,Y-10,6,20,'#7dffa8',1);box(g,X-10,Y-3,20,6,'#7dffa8',1)}
    else if(k==='pocao'){box(g,X-3,Y-10,6,7,c);disc(g,X,Y+3,8,c);g.fillStyle='#b84ad0';g.beginPath();g.arc(X,Y+3,6,0,Math.PI);g.fill()}
    else if(k==='orbe'){G.draw(g,G.prop.orb('#8ad8ff',10),X,Y-1,{w:22});line(g,[[X-7,Y+10],[X+7,Y+10]],c,2.5)}
    else if(k==='bolsa'){box(g,X-9,Y-4,18,13,'#c8945a',4);ring(g,X,Y-4,5,c,2,Math.PI,TAU)}
    else if(k==='pizza'){G.poly(g,[[X-10,Y-7],[X+10,Y-7],[X,Y+11]],'#ffcf5a');line(g,[[X-10,Y-7],[X+10,Y-7]],'#c8782a',4);[[-3,-2],[4,-1],[0,4]].forEach(([u,v])=>disc(g,X+u,Y+v,2.2,'#c0302a'))}
    else if(k==='nao'){line(g,[[X-8,Y-8],[X+8,Y+8]],'#ff7a6a',4);line(g,[[X+8,Y-8],[X-8,Y+8]],'#ff7a6a',4)}
    else if(k==='mao'){box(g,X-6,Y-1,12,10,c,3);[-6,-2.6,.8,4.2].forEach((u,i)=>box(g,X+u,Y-9+(i%3?0:2),2.6,11,c,1.3))}
    else if(k==='mic'){box(g,X-4,Y-10,8,13,c,4);ring(g,X,Y-1,7,c,1.6,0,Math.PI);line(g,[[X,Y+6],[X,Y+10]],c,2)}
    else if(k==='laptop'){box(g,X-8,Y-8,16,11,'#6ad0ff',1);rim(g,X-8,Y-8,16,11,1,c,1.6);G.poly(g,[[X-11,Y+8],[X-8,Y+3],[X+8,Y+3],[X+11,Y+8]],c)}
    else G.icon(g,k==='escudo'?'escudo':k==='folha'?'folha':'espiral',X,Y,21,c);
  }
  function bust(g,d,it,r){
    const[bg,robe,skin,head,eyes,itemK]=d,dk=G.shade(robe,-.45),hair=['#2a1a10','#5a3018','#1a1420','#8a5a20'][Math.floor(r()*4)];
    box(g,0,0,150,108,vg(g,0,108,bg,G.shade(bg,-.6)));G.glow(g,75,40,62,G.shade(bg,.5),.6,{add:false});
    for(let i=0;i<9;i++){const X=8+r()*134,Y=6+r()*80;G.poly(g,[[X,Y-2.5],[X+2,Y],[X,Y+2.5],[X-2,Y]],'rgba(255,230,170,.28)')}
    if(head==='long')box(g,48,30,54,66,hair,22);if(head==='hood'||head==='veil'){const hc=head==='veil'?'#eef6f0':dk;G.poly(g,[[75,10],[104,30],[110,82],[40,82],[46,30]],hc)}
    G.poly(g,[[22,108],[34,82],[56,70],[94,70],[116,82],[128,108]],robe);G.poly(g,[[75,70],[94,70],[116,82],[128,108],[75,108]],dk);G.poly(g,[[63,70],[75,92],[87,70]],G.shade(robe,.35));
    box(g,67,58,16,16,G.shade(skin,-.18),4);ell(g,75,46,19,22,skin);ell(g,82,48,10,17,'rgba(0,0,0,.1)');
    if(eyes==='glow'){disc(g,68,44,3.4,'#bff4ff');disc(g,82,44,3.4,'#bff4ff');G.glow(g,75,44,18,'#7fe3ff',.7)}
    else if(eyes==='closed'){ring(g,68,44,3.6,'#2a1408',1.6,.2,Math.PI-.2);ring(g,82,44,3.6,'#2a1408',1.6,.2,Math.PI-.2)}
    else{const q=eyes==='squint'?1.4:2.6;ell(g,68,44,3.4,q,'#fff');ell(g,82,44,3.4,q,'#fff');disc(g,68.6,44,1.5,'#201008');disc(g,81.4,44,1.5,'#201008');line(g,[[63,38.5],[72,eyes==='squint'?41:38]],'#2a1408',1.6);line(g,[[87,38.5],[78,eyes==='squint'?41:38]],'#2a1408',1.6);
      if(eyes==='glasses'){ring(g,68,44,6.5,'#1a1008',1.8);ring(g,82,44,6.5,'#1a1008',1.8);line(g,[[74.5,44],[75.5,44]],'#1a1008',1.8)}}
    line(g,[[75,47],[73,53],[76,54]],G.shade(skin,-.35),1.2);
    if(eyes==='smile')ring(g,75,55,6,'#5a2014',1.8,.35,Math.PI-.35);else line(g,[[70,60],[75,61],[80,59.5]],'#5a2014',1.6);
    if(itemK==='barba'||head==='laurel')G.poly(g,[[58,52],[66,58],[75,56],[84,58],[92,52],[90,70],[75,86],[60,70]],'#e8e4dc');
    if(head==='spiky')G.poly(g,[[55,40],[56,24],[64,28],[68,16],[76,25],[86,17],[87,29],[96,27],[94,42],[87,32],[63,32]],hair);
    else if(head==='short'){g.fillStyle=hair;g.beginPath();g.arc(75,42,20,Math.PI,0);g.lineTo(92,36);g.lineTo(60,34);g.closePath();g.fill()}
    else if(head==='long'){g.fillStyle=hair;g.beginPath();g.arc(75,40,21,Math.PI*.98,Math.PI*2.02);g.lineTo(80,31);g.lineTo(56,46);g.closePath();g.fill()}
    else if(head==='bun'){disc(g,75,20,9,hair);g.fillStyle=hair;g.beginPath();g.arc(75,40,20,Math.PI,0);g.lineTo(75,31);g.closePath();g.fill()}
    else if(head==='hood'){g.strokeStyle=dk;g.lineWidth=9;g.beginPath();g.ellipse(75,43,23,27,0,Math.PI*.86,Math.PI*2.14);g.stroke();line(g,[[52,56],[75,12],[98,56]],'rgba(255,210,130,.45)',1.4)}
    else if(head==='veil'){g.strokeStyle='#ffffff';g.lineWidth=7;g.beginPath();g.ellipse(75,43,22,26,0,Math.PI*.9,Math.PI*2.1);g.stroke();box(g,72,19,6,13,'#d8405a');box(g,68.5,22.5,13,6,'#d8405a')}
    else if(head==='fedora'){ell(g,75,30,32,7,'#3a2814');box(g,57,8,36,23,'#4a3420',9);box(g,57,23,36,6,'#8a1c24')}
    else if(head==='feather'){ell(g,75,28,27,7,'#6a1a5a',-.14);box(g,60,13,28,16,'#8a2a74',8);ell(g,98,14,15,4,'#7dffd0',-.75)}
    else if(head==='helmet'){g.fillStyle=vg(g,16,46,'#e8eef8','#6a7488');g.beginPath();g.arc(75,40,24,Math.PI,0);g.closePath();g.fill();box(g,72.5,36,5,17,'#a8b2c4',2);box(g,50,38,7,22,'#8a94a8',3);box(g,93,38,7,22,'#8a94a8',3);box(g,72,8,6,12,'#c0303a',3)}
    else if(head==='tophat'){ell(g,75,29,29,6,'#120a20');box(g,60,-1,30,30,'#1c1030',3);box(g,60,20,30,6,'#c8962e')}
    else if(head==='turban'){ell(g,75,27,25,14,'#d8d0e8');line(g,[[54,30],[78,17],[97,28]],'#9a80c0',3);disc(g,75,26,4,'#ff4a6a')}
    else if(head==='cap'){g.fillStyle='#2a6ad0';g.beginPath();g.arc(75,35,21,Math.PI,0);g.closePath();g.fill();box(g,75,31,34,6,'#1a4a9a',3);disc(g,75,15,3,'#ffd36b')}
    else if(head==='laurel')for(let i=0;i<9;i++){const a=Math.PI*(1.08+i*.105);ell(g,75+Math.cos(a)*23,42+Math.sin(a)*23,7,3,i%2?'#7ad060':'#4a9a3a',a+Math.PI/2)}
    else if(head==='wide'){ell(g,75,28,38,8,'#6a4a28');ell(g,75,22,19,12,'#8a6238')}
    else if(head==='bald')ell(g,68,31,7,4,'rgba(255,255,255,.3)',-.4);
    if(eyes==='open'&&it==='tears'){[[66,52],[84,52]].forEach(([X,Y])=>{line(g,[[X,Y-4],[X-1,Y+12]],'#8ad8ff',3);disc(g,X-1,Y+14,2.6,'#8ad8ff')})}
    item(g,it==='tears'?null:it||itemK,126,84);
  }
  const SPECIAL={
    monstro(g){box(g,0,0,150,108,vg(g,0,108,'#2a0c2e','#07020a'));G.poly(g,[[26,108],[24,56],[40,34],[36,6],[58,28],[75,24],[92,28],[114,6],[110,34],[126,56],[124,108]],'#6a2438');G.poly(g,[[75,24],[92,28],[114,6],[110,34],[126,56],[124,108],[75,108]],'#47162a');[[54,52],[96,52]].forEach(([X,Y])=>{ell(g,X,Y,12,10,'#ffe05a');ell(g,X,Y,3,9,'#1a0408');G.glow(g,X,Y,24,'#ffb000',.45)});ell(g,75,84,34,17,'#120206');for(let i=0;i<7;i++){const X=47+i*9.4;G.poly(g,[[X-4,70],[X+4,70],[X,83]],'#fff4dc');G.poly(g,[[X-4,99],[X+4,99],[X,88]],'#fff4dc')}},
    Eco(g){box(g,0,0,150,108,vg(g,0,108,'#143a4a','#04101a'));for(let i=3;i>=0;i--){const dx=(i-1.2)*17;g.globalAlpha=i===1?1:.28;G.poly(g,[[48+dx,108],[52+dx,40],[75+dx,16],[98+dx,40],[102+dx,108],[88+dx,96],[75+dx,108],[62+dx,96]],'#a8e8f8');ell(g,66+dx,48,5,8,'#082030');ell(g,84+dx,48,5,8,'#082030');ell(g,75+dx,70,5,9,'#082030')}g.globalAlpha=1},
    'Fé'(g){box(g,0,0,150,108,vg(g,0,108,'#6a4a08','#1c1002'));G.glow(g,75,54,76,'#ffd36b',.9,{add:false});for(let i=0;i<16;i++){const a=i*TAU/16;G.poly(g,[[75+Math.cos(a-.08)*24,54+Math.sin(a-.08)*24],[75+Math.cos(a)*(i%2?44:60),54+Math.sin(a)*(i%2?44:60)],[75+Math.cos(a+.08)*24,54+Math.sin(a+.08)*24]],'#ffe9a0')}disc(g,75,54,24,'#fff6d0');stat(g,3,75,54,30,'#7a4a00')},
    Sombra(g){box(g,0,0,150,108,vg(g,0,108,'#3a3050','#0e0a18'));G.poly(g,[[24,108],[44,58],[40,30],[75,10],[110,30],[106,58],[126,108]],'#05030a');[[62,46],[88,46]].forEach(([X,Y])=>{ell(g,X,Y,7,3.5,'#e8d4ff');G.glow(g,X,Y,17,'#b48cff',.75)})},
    Vigia(g){box(g,0,0,150,108,vg(g,0,108,'#102c50','#030a16'));for(let i=0;i<20;i++){const a=i*TAU/20;line(g,[[75+Math.cos(a)*46,54+Math.sin(a)*40],[75+Math.cos(a)*68,54+Math.sin(a)*56]],'rgba(127,227,255,.35)',2)}g.fillStyle='#eef8ff';g.beginPath();g.moveTo(20,54);g.quadraticCurveTo(75,-4,130,54);g.quadraticCurveTo(75,112,20,54);g.fill();disc(g,75,54,24,'#2a80d8');disc(g,75,54,12,'#04121c');disc(g,67,46,6,'#fff')},
    '🎭'(g){box(g,0,0,150,108,vg(g,0,108,'#4a0c18','#12040a'));[[54,48,'#f4ead6',1],[98,62,'#3a2a48',-1]].forEach(([X,Y,c,m])=>{g.fillStyle=c;g.beginPath();g.moveTo(X-26,Y-28);g.lineTo(X+26,Y-28);g.quadraticCurveTo(X+28,Y+26,X,Y+36);g.quadraticCurveTo(X-28,Y+26,X-26,Y-28);g.fill();rim(g,X-1,Y-1,2,2,1,'rgba(0,0,0,0)');const k=m>0?'#3a1018':'#ffd36b';ell(g,X-11,Y-8,6,4,k,.25*m);ell(g,X+11,Y-8,6,4,k,-.25*m);ring(g,X,Y+(m>0?8:24),11,k,3,m>0?.3:Math.PI+.4,m>0?Math.PI-.3:TAU-.4)})},
    '🍕'(g){box(g,0,0,150,108,vg(g,0,108,'#5a2408','#1c0a02'));G.glow(g,75,54,70,'#ff9a3c',.5,{add:false});disc(g,75,56,46,'#c8782a');disc(g,75,56,40,'#ffcf5a');for(let i=0;i<8;i++){const a=i*TAU/8;line(g,[[75,56],[75+Math.cos(a)*45,56+Math.sin(a)*45]],'#a85a1a',1.5)}[[60,38],[92,44],[100,66],[72,72],[52,62],[76,52],[84,86],[60,86]].forEach(([X,Y])=>{disc(g,X,Y,6.5,'#c0302a');disc(g,X-2,Y-2,1.8,'#ff7a6a')})},
    '☕'(g){box(g,0,0,150,108,vg(g,0,108,'#3a2418','#100806'));ell(g,72,96,48,7,'#8a6a4a');G.poly(g,[[44,50],[100,50],[92,92],[52,92]],'#e8e0d4');G.poly(g,[[72,50],[100,50],[92,92],[72,92]],'#b8ac9c');ell(g,72,50,28,7,'#5a3418');ring(g,104,66,14,'#e8e0d4',6,-1.5,1.5);[56,72,88].forEach((X,i)=>line(g,[[X,40],[X+7,30],[X-3,20],[X+4,8+i*3]],'rgba(255,244,220,.65)',3))},
    '📖'(g){box(g,0,0,150,108,vg(g,0,108,'#1c3a2a','#06120c'));G.glow(g,75,48,64,'#ffe9a0',.55,{add:false});G.poly(g,[[18,34],[75,50],[132,34],[132,88],[75,102],[18,88]],'#7a2a20');G.poly(g,[[25,30],[75,46],[75,94],[25,80]],'#fbf0d0');G.poly(g,[[125,30],[75,46],[75,94],[125,80]],'#e8d8b0');for(let i=0;i<5;i++){line(g,[[34,42+i*8],[66,52+i*8]],'#8a6a3a',1.5);line(g,[[84,52+i*8],[116,42+i*8]],'#8a6a3a',1.5)}},
    '📅'(g){box(g,0,0,150,108,vg(g,0,108,'#3a1c20','#10060a'));box(g,34,18,82,76,'#f4ead6',7);box(g,34,18,82,20,'#b3261e',7);[52,98].forEach(X=>box(g,X-3,10,6,16,'#e0b456',3));for(let j=0;j<3;j++)for(let i=0;i<5;i++)box(g,42+i*14,46+j*15,9,9,'#c8b490',2);line(g,[[96,74],[108,88]],'#b3261e',4);line(g,[[108,74],[96,88]],'#b3261e',4)},
    '☠'(g){box(g,0,0,150,108,vg(g,0,108,'#4a0c0c','#120202'));G.glow(g,75,52,66,'#ff3a2a',.45,{add:false});G.icon(g,'caveira',75,55,88,'#f4ead6')},
    '💔'(g){box(g,0,0,150,108,vg(g,0,108,'#4a1030','#12040c'));G.icon(g,'coracao',75,56,92,'#e0405a');line(g,[[75,24],[64,42],[84,58],[68,74],[76,94]],'#14040a',6)},
    '🌑'(g){box(g,0,0,150,108,vg(g,0,108,'#1a1040','#03020a'));for(let i=0;i<24;i++)disc(g,r0(i,1)*150,r0(i,2)*108,.5+r0(i,3),'#fff');G.glow(g,75,54,66,'#b48cff',.85,{add:false});disc(g,75,54,33,'#e8d4ff');disc(g,70,51,32,'#05030c')},
    '🪑'(g){box(g,0,0,150,108,vg(g,0,108,'#3a2808','#0e0802'));G.glow(g,75,44,66,'#ffd36b',.5,{add:false});box(g,52,14,46,64,'#8a1424',12);rim(g,52,14,46,64,12,'#e0b456',3.5);box(g,40,66,70,14,'#e0b456',5);[46,96].forEach(X=>box(g,X,78,9,24,'#c8962e',2));[36,104].forEach(X=>box(g,X,46,10,30,'#e0b456',4));G.icon(g,'coroa',75,34,26,'#ffd36b')},
    porta(g){box(g,0,0,150,108,vg(g,0,108,'#243040','#080c14'));box(g,48,12,54,96,'#ffe9a0',4);G.glow(g,75,60,60,'#ffe9a0',.5,{add:false});G.poly(g,[[48,12],[76,22],[76,108],[48,108]],'#4a2c16');disc(g,69,66,3,'#ffd36b')},
    lua(g){box(g,0,0,150,108,vg(g,0,108,'#18204a','#04061a'));disc(g,62,52,30,'#f4f0d8');disc(g,76,44,28,'#121a40');[[98,30,20],[112,50,14],[100,68,10]].forEach(([X,Y,s])=>line(g,[[X-s/2,Y-s/2],[X+s/2,Y-s/2],[X-s/2,Y+s/2],[X+s/2,Y+s/2]],'#bfd0ff',s/5))},
    infinito(g){box(g,0,0,150,108,vg(g,0,108,'#4a1018','#120406'));G.glow(g,75,54,66,'#ff7a6a',.5,{add:false});g.strokeStyle='#ffe0d0';g.lineWidth=11;g.beginPath();g.moveTo(75,54);g.bezierCurveTo(110,12,148,54,128,70);g.bezierCurveTo(108,90,90,70,75,54);g.bezierCurveTo(40,12,2,54,22,70);g.bezierCurveTo(42,90,60,70,75,54);g.stroke()},
    fogo(g){box(g,0,0,150,108,vg(g,0,108,'#4a1404','#120400'));G.glow(g,75,70,74,'#ff6a10',.7,{add:false});G.icon(g,'chama',75,54,96,'#ff7a1a');G.icon(g,'chama',75,68,58,'#ffd36b')},
    coroa(g){box(g,0,0,150,108,vg(g,0,108,'#3a0c14','#0c0204'));G.glow(g,75,54,66,'#ff4a3a',.4,{add:false});G.icon(g,'coroa',75,52,88,'#ffd36b')},
    trofeu(g){box(g,0,0,150,108,vg(g,0,108,'#4a3808','#100c02'));G.glow(g,75,50,76,'#ffd36b',.8,{add:false});G.icon(g,'trofeu',75,56,88,'#ffe28a')},
  };
  const r0=(i,k)=>G.rng(i*31+k)();
  const ALIAS={'Mestre Rival':'🎭',Cultista:'cultista'};
  const ITEMS={'🍕':'pizza','🙅':'nao','🙋':'mao','😭':'tears','🧑‍🎤':'mic','🧑‍💻':'laptop'};
  /* retrato 150×108 de um personagem; o Perseus é desenhado por cima com o sprite */
  function portrait(who,ico){
    const k=ALIAS[who]||who,it=(k==='Jogador'||k==='Jogadora')?ITEMS[ico]:undefined;
    return G.bake(`tr:por:${k}:${it||''}`,150,108,(g,w,h,r)=>{
      if(SPECIAL[k])SPECIAL[k](g);else if(DEF[k])bust(g,DEF[k],it,r);
      else{box(g,0,0,150,108,vg(g,0,108,'#4a2c50','#12081a'));G.glow(g,75,54,64,'#c8a0ff',.5,{add:false});if(k==='perseus'||k==='Perseus'){ell(g,75,98,40,9,'#8a1424');ell(g,75,95,34,6,'#d6a94a')}else stat(g,0,75,54,60,'#ffe9b0')}
    },{s:2});
  }
  const END={b0:'Eco',b1:'coroa',b2:'porta',b3:'🎭',b4:'lua',b5:'infinito',b6:'Ilusionista',b7:'Fé',culto:'cultista',usurpa:'perseus',monstro:'monstro',tulpa:'Eco',rebeliao:'fogo',build:'combeiro',pizzaria:'🍕',aposentado:'🪑',exilio:'🌑',lenda:'trofeu'};
  /* frente da carta (320×360 + margem para a sombra) */
  const card=type=>G.bake(`tr:card:${type}`,344,384,(g,w,h)=>{
    g.translate(12,10);box(g,3,6,320,360,'rgba(0,0,0,.45)',18);
    const edge=type==='crisis'?['#ff9a80','#b3261e','#5e0a10']:type==='due'?['#d8b8ff','#7b4bd0','#33186a']:['#fbe3a0','#b8862e','#6e4a14'];
    box(g,0,0,320,360,vg(g,0,360,...edge),18);box(g,7,7,306,346,type==='crisis'?'#f8ded4':'#f4e8cc',13);
    g.save();path(g,7,7,306,346,13);g.clip();G.fillTile(g,G.tile('pergaminho',{size:128,a:type==='crisis'?'#f6dace':'#f2e4c4',b:'#a8844a',seed:3}),7,7,306,346,{alpha:.75});
    const q=g.createRadialGradient(160,180,120,160,180,250);q.addColorStop(0,'rgba(120,80,30,0)');q.addColorStop(1,'rgba(120,70,20,.3)');g.fillStyle=q;g.fillRect(0,0,320,360);g.restore();
    rim(g,12,12,296,336,10,G.rgba(edge[2],.55),1.2);
    [[19,19,1,1],[301,19,-1,1],[19,341,1,-1],[301,341,-1,-1]].forEach(([X,Y,i,j])=>{line(g,[[X,Y+j*20],[X,Y],[X+i*20,Y]],edge[1],2);G.poly(g,[[X+i*6,Y+j*2],[X+i*10,Y+j*6],[X+i*6,Y+j*10],[X+i*2,Y+j*6]],edge[1])});
    box(g,81,28,158,110,vg(g,28,138,...edge),10);box(g,84,31,152,104,'#140a10',7);
    line(g,[[54,183],[146,183]],G.rgba(edge[1],.65),1.5);line(g,[[174,183],[266,183]],G.rgba(edge[1],.65),1.5);G.poly(g,[[160,179],[165,183],[160,187],[154,183]],edge[1]);
  },{s:2});
  return{hall,candelabrum,flames,stat,gauge,modIcon,portrait,card,END,amb:G.ambient('poeira',{W,H,n:28,col:'#ffd98a',seed:31})};
}
function trono45(C){
  const W=480,H=640,K=gdPick(C.gd,[.8,1,1.2,1.45]),rnd=mb32((C.seed^0x7e)>>>0);
  const S={v:[50,50,50,50],n:0,card:null,dx:0,drag:false,sx:0,anim:0,done:false,end:null,F:{},sched:[],mods:{},used:{},roll:null,log:'',endKey:'',saved:false,arcHits:0,rw:null};
  const year=()=>1+Math.floor(S.n/12),sess=()=>S.n%12+1;
  function pickCard(){
    const due=S.sched.filter(s=>s.at<=S.n).sort((a,b)=>a.at-b.at)[0];
    if(due){S.sched=S.sched.filter(s=>s!==due);const c=TRBYID45[due.id];if(c&&!S.used[c.id]){S.arcHits++;if(S.arcHits===1)C.achieve?.('tr_arco');return{...c,_due:true}}}
    if(S.n>0&&S.n%12===0){const cr=TRC45cards.crises.filter(c=>(!c.req||c.req(S.F,S.n))&&!S.used[c.id]);if(cr.length)return cr[Math.floor(rnd()*cr.length)]}
    const arcs=TRC45cards.arc.filter(c=>!c.crisis&&!c._sched&&!S.used[c.id]&&(c.req?c.req(S.F,S.n):['pact1','det1','comb1','mon1','pc1','cafe1','ment1','duel1'].includes(c.id))&&!S.sched.some(s=>s.id===c.id));
    if(arcs.length&&rnd()<.3)return arcs[Math.floor(rnd()*arcs.length)];
    const pool=TRC45cards.base.filter(c=>!S.recent?.includes(c.id));const c=pool[Math.floor(rnd()*pool.length)];S.recent=[...(S.recent||[]).slice(-12),c.id];return c}
  function next(){S.card=pickCard();S.dx=0;S.anim=1}
  function scaled(fx){return fx.map((d,i)=>{let v=d*K;if(d>0&&i===1&&S.mods.mentor)v*=1.25;if(d>0&&i===0&&S.mods.dividas)v*=.5;if(d<0&&i===2&&S.mods.guarda)v*=.5;if(d<0&&i===3&&S.mods.birra)v*=1.25;return Math.round(v)})}
  function choose(side){
    if(!S.card||S.done)return;const c=S.card,o=side<0?c.L:c.R;if(!o)return;
    S.lastSide=side<0?-1:1;/* só para a animação */
    if(c.once||c.arc||c.crisis)S.used[c.id]=1;
    let fx=o.fx||[0,0,0,0],endK=o.end,txt='';
    if(o.roll){const p=clamp12(S.v[o.roll.i],5,95)/100,ok=rnd()<p,r=ok?o.roll.ok:o.roll.no;fx=r.fx;txt=`🎲 ${Math.round(p*100)}% · ${ok?'sucesso':'fracasso'}: ${r.t}`;if(r.end)endK=r.end;S.roll={t:txt,until:performance.now()+1600};fx5(ok?'mgWin':'error')}
    else fx5(side<0?'click':'activate');
    if(o.set)S.F[o.set]=1;if(o.mod){S.mods[o.mod]=1;S.F[o.mod]=1;C.fx?.float(W/2,150,`${MOD45[o.mod].g} ${MOD45[o.mod].n}`,{col:MOD45[o.mod].good?'#7dffa8':'#ff9b8a',size:18,life:1.6})}if(o.unmod)delete S.mods[o.unmod];
    if(o.sched){const [id,a,b]=o.sched;S.sched.push({id,at:S.n+1+a+Math.floor(rnd()*(b-a+1))})}
    const d=scaled(fx);S.v=S.v.map((v,i)=>v+d[i]);S.n++;
    /* efeitos por sessão */
    if(S.mods.cafe)S.v[2]+=1;if(S.mods.tedio)S.v[1]-=1;if(S.mods.teia)S.v[3]-=1;if(S.mods.pacto)S.v[2]-=1;
    if(S.n>=40)C.achieve?.('trono');
    if(endK){finish(endK);return}
    let bad=S.v.findIndex(v=>v<=0||v>=100);
    if(bad>=0&&S.mods.vidas){delete S.mods.vidas;S.v[bad]=50;C.fx?.float(W/2,200,'🐾 As Sete Vidas do Perseus salvaram a ordem!',{col:'#ffd36b',size:16,life:2});fx5('achieve');bad=-1}
    if(bad>=0){finish('b'+(bad*2+(S.v[bad]>=100?1:0)));return}
    if(S.n>=120){finish('lenda');return}
    next();
  }
  function finish(k){
    S.done=true;S.endKey=k;S.end=END45[k];S.v=S.v.map(v=>clamp12(v,0,100));
    let fresh=false;progPut38(p=>{p.tr=p.tr||{};p.tr.ends=p.tr.ends||{};if(!p.tr.ends[k]){p.tr.ends[k]=Date.now();fresh=true}if(S.n>(p.tr.best||0))p.tr.best=S.n;if(Object.keys(p.tr.ends).length>=10)C.achieve?.('tr_galeria')});
    if(k==='lenda')C.achieve?.('tr_lenda');
    const mul=gdMul38(C.gd);S.rw={ob:Math.round(S.n/3*mul+(fresh?10:0)+(k==='lenda'?60:0)),why:[`${S.n} sessões`,fresh?'final novo':'',k==='lenda'?'campanha lendária':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    const p=trProg45(),got=Object.keys(p.ends).length;
    setTimeout(()=>C.finish({title:`${S.end[0]} ${S.end[1]} · ${S.n} sessões (ano ${year()})`,rows:[{u:C.me,n:me16(C).n,c:me16(C).c,s:S.n,w:k==='lenda'||S.n>=40,st:`${S.n} sessões`}],unit:'sessões',
      html:`<p>${esc(S.end[2])}</p>${fresh?'<p class="r38-hi">🆕 Final novo na Galeria!</p>':''}<p class="sub">Galeria: ${got} de ${Object.keys(END45).length} finais</p><p class="tr45-gal">${Object.entries(END45).map(([kk,e])=>p.ends[kk]?`<span title="${esc(e[1])}">${e[0]}</span>`:'<span>❔</span>').join(' ')}</p>`}),window.__trFast?0:1400);
  }
  next();
  const opt=side=>S.card&&(side<0?S.card.L:S.card.R);
  const GX=window.GFX60,art=trArt45(),V={v:S.v.slice(),pv:S.v.slice(),flash:[-1e9,-1e9,-1e9,-1e9],card:S.card,prev:null,done:false,last:performance.now()};
  GX.skin({acc:'#ffd36b'});
  const NAME={'🎭':'Mestre Rival','🍕':'A Pizza','☕':'O Bule Sem Fim','📖':'A Mentora','📅':'Fim de Ano','☠':'Perigo Mortal','💔':'A Mesa Dividida','🌑':'O Véu','🪑':'O Trono'};
  function wrapLines(x,str,maxW,size){x.font=`700 ${GX.fs(size,10)}px "IBM Plex Sans",system-ui,sans-serif`;const out=[];let line='';String(str).split(' ').forEach(w=>{const n=line?line+' '+w:w;if(x.measureText(n).width>maxW&&line){out.push(line);line=w}else line=n});if(line)out.push(line);return out}
  function paintCard(x,c){
    const who=CAST45[c.who],type=c.crisis?'crisis':c._due?'due':'normal',cat=c.who==='Perseus'||c.who==='perseus';
    x.drawImage(art.card(type),-172,-190,344,384);
    x.drawImage(art.portrait(c.who,c.ico),-75,-148,150,102);
    if(cat)sprAt16(x,-1,0,-95,92);
    if(c.crisis){rr16(x,-110,-178,220,24,12);x.fillStyle='#a01a14';x.fill();GX.icon(x,'chama',-42,-166,15,'#ffd36b');GX.icon(x,'chama',42,-166,15,'#ffd36b');txt16(x,'CRISE',0,-165,{size:14,w:900,col:'#fff'})}
    else if(c._due){rr16(x,-110,-178,220,24,12);x.fillStyle='#5a2cb0';x.fill();GX.icon(x,'relogio',-84,-166,15,'#ffe9a8');txt16(x,'CONSEQUÊNCIA',8,-165,{size:13,w:900,col:'#fff'})}
    txt16(x,who?who.n:NAME[c.who]||c.who,0,-29,{size:18,w:800,col:'#33220c'});
    if(who){x.font='600 11px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#5c4020';x.fillText(who.p,0,-12,290)}
    wrap16(x,c.t,0,24,278,21,'#2c1c08',15);
  }
  /* efeitos só de imagem, disparados quando o estado muda */
  function fxEvents(){
    const now=performance.now(),dt=Math.min(.05,(now-V.last)/1000);V.last=now;
    for(let i=0;i<4;i++){const v=clamp12(S.v[i],0,100);V.v[i]=GX.reduced()?v:V.v[i]+(v-V.v[i])*Math.min(1,dt*5);
      if(S.v[i]!==V.pv[i]){const up=S.v[i]>V.pv[i];if(Math.abs(S.v[i]-V.pv[i])>1){V.flash[i]=now;GX.emit(up?'coleta':'estilhacos',70+i*112,46,{col:up?TRC45[i]:'#ff6b5b',amount:.6})}V.pv[i]=S.v[i]}}
    if(S.card!==V.card){V.prev={c:V.card,t0:now,dir:S.lastSide||1};V.card=S.card;GX.emit('brilho',W/2+(S.lastSide||1)*150,380,{col:'#ffd36b'});
      if(S.card?.crisis){GX.hitstop(100);C.fx?.shake(7,.35);GX.emit('estilhacos',W/2,230,{col:'#ff6b5b',amount:1.4})}}
    if(S.done&&!V.done){V.done=true;GX.hitstop(120);GX.emit(S.endKey==='lenda'?'confete':'fumaca',W/2,300,{amount:2})}
  }
  return{st:()=>S,choose,
    g60intro:{title:'O Trono do Mestre',sub:'Arraste a carta ou toque num lado',acc:'#ffd36b'},
    reward:()=>S.rw,
    key(code,down){if(!down||Date.now()<C.t0)return;if(code==='ArrowLeft'||code==='KeyA')choose(-1);if(code==='ArrowRight'||code==='KeyD')choose(1)},
    ptr(t,px){if(Date.now()<C.t0)return;if(t==='down'){S.drag=true;S.sx=px}else if(t==='move'&&S.drag){S.dx=px-S.sx}else if(t==='up'){S.drag=false;if(Math.abs(S.dx)>90)choose(Math.sign(S.dx));else if(Math.abs(S.dx)<6)choose(px<W/2?-1:1);S.dx=0}},
    step(dt){S.anim=Math.max(0,S.anim-dt*4);if(!S.drag)S.dx*=.8;const ks=Object.keys(S.mods),good=ks.filter(k=>MOD45[k].good).length;
      C.hud(GX.chips([{icon:'coroa',label:'Ano',value:year()},{icon:'relogio',label:'sessão',value:sess()+'/12'},{icon:'estrela',label:'total',value:S.n},
        good?{icon:'escudo',label:'bênçãos',value:good,tone:'ok'}:null,ks.length-good?{icon:'caveira',label:'maldições',value:ks.length-good,tone:'bad'}:null,{icon:'seta',value:'arraste a carta'}]))},
    draw(x){
      const now=performance.now(),t=now/1000,red=GX.reduced();
      x.drawImage(art.hall(),0,0,W,H);
      GX.glow(x,W/2,236,230,'#ffcf6a',.12+(red?0:.04*Math.sin(t*1.3)));
      [[44,606],[W-44,606]].forEach(([cx,cy],i)=>{x.drawImage(art.candelabrum(),cx-22,cy-114,44,120);art.flames(x,cx,cy,t,i*3)});
      art.amb.draw(x,t);
      fxEvents();
      const side=S.dx<-20?-1:S.dx>20?1:0,o=side?opt(side):null,prev=o?(o.roll?null:scaled(o.fx||[0,0,0,0])):null;
      TRB45.forEach((b,i)=>{const bx=20+i*112,v=clamp12(S.v[i],0,100),shown=V.v[i],col=TRC45[i],danger=S.v[i]<=15||S.v[i]>=85,fl=clamp12(1-(now-V.flash[i])/600,0,1);
        if(danger)GX.glow(x,bx+50,46,72,'#ff3a30',.35+(red?0:.25*Math.sin(t*6)),{sy:.75});if(fl>0)GX.glow(x,bx+50,40,74,col,fl*.7);
        x.drawImage(art.gauge(i,col),bx,12,100,70);
        /* ícone enche conforme a barra */
        x.save();x.beginPath();x.rect(bx+30,19+30*(1-shown/100),40,30*shown/100+3);x.clip();art.stat(x,i,bx+50,34,30,col);x.restore();
        GX.hud.bar(x,bx+12,52,76,7,v/100,{col:danger?'#ff6b5b':col,ghost:shown/100,segs:4});
        if(danger){rr16(x,bx+1,13,98,68,11);x.strokeStyle='#ff6b5b';x.lineWidth=2.5;x.stroke()}
        GX.hud.text(x,b.split(' ')[1],bx+50,71,{size:12,al:'center',w:800,col:'#fff0d8',min:9,max:90,stroke:2});
        if(o&&o.roll&&o.roll.i===i){GX.glow(x,bx+50,95,20,'#ffd36b',.7);art.stat(x,0,bx+50,95,22,'#ffe9a8')}
        else if(prev&&prev[i]){if(S.mods.olho)GX.hud.text(x,(prev[i]>0?'+':'')+prev[i],bx+50,93,{size:15,al:'center',w:900,col:prev[i]>0?'#7dffa8':'#ff9b8a',stroke:4,min:11});else{const s=Math.abs(prev[i])>9?8:4;GX.glow(x,bx+50,92,s*2.6,'#fff0c0',.7);x.beginPath();x.arc(bx+50,92,s,0,TAU16);x.fillStyle='#fff';x.fill();x.strokeStyle='#4a2a08';x.lineWidth=1.5;x.stroke()}}});
      const mk=Object.keys(S.mods);mk.forEach((k,i)=>{const bx=W/2-(mk.length*36)/2+i*36;x.drawImage(art.modIcon(k,MOD45[k].good),bx,106,32,32)});
      GX.hud.chip(x,W/2,mk.length?151:124,{icon:'coroa',text:`Ano ${year()} · sessão ${sess()} de 12`,col:'#ffd36b',size:12,al:'center',min:10});
      if(S.done&&S.end){const good=S.endKey==='lenda';x.fillStyle='rgba(8,2,6,.74)';x.fillRect(0,175,W,H-175);
        GX.rays(x,W/2,300,{n:11,len:270,col:good?'#ffd36b':'#ff9a7a',a:.16,t});GX.glow(x,W/2,300,150,good?'#ffd36b':'#c8506a',.4);
        rr16(x,W/2-116,218,232,170,14);x.fillStyle='#d6a94a';x.fill();rr16(x,W/2-111,223,222,160,11);x.fillStyle='#14080c';x.fill();
        const who=art.END[S.endKey];GX.draw(x,art.portrait(who,''),W/2,303,{w:214});if(who==='perseus')sprAt16(x,-1,W/2,300,128);
        GX.hud.text(x,S.end[1],W/2,420,{size:24,al:'center',w:900,col:'#ffd36b',stroke:5,max:W-40,min:14});
        wrapLines(x,S.end[2],400,15).forEach((l,i)=>GX.hud.text(x,l,W/2,454+i*21,{size:15,al:'center',w:600,col:'#f4e9d6',stroke:4,min:10,max:420}));
        GX.hud.text(x,`${S.n} sessões`,W/2,540,{size:16,al:'center',w:800,col:'#c9b995',stroke:4});
        GX.vignette(x,W,H,{a:.45});GX.hud.frame(x,W,H,{acc:'#d6a94a',a:.75});return}
      /* carta anterior voando para o lado escolhido */
      if(V.prev&&!red){const k=(now-V.prev.t0)/320;if(k<1){x.save();x.translate(W/2+V.prev.dir*(60+k*k*430),380-k*30);x.rotate(V.prev.dir*(.12+k*.4));x.globalAlpha=1-k;paintCard(x,V.prev.c);x.restore()}else V.prev=null}
      const c=S.card;if(!c){GX.vignette(x,W,H,{a:.45});return}
      const cx=W/2+S.dx,cy=380+S.anim*60,rot=S.dx/600;
      GX.shadow(x,cx,574,300,{alpha:.6,h:34});
      if(c.crisis)GX.glow(x,cx,cy,250,'#ff3a20',.28+(red?0:.14*Math.sin(t*5)));else if(c._due)GX.glow(x,cx,cy,250,'#9a5aff',.28);
      if(side)GX.glow(x,cx+side*165,cy,120,side<0?'#5ac8ff':'#ffc040',.45,{sy:1.7});
      x.save();x.translate(cx,cy);x.rotate(rot);x.globalAlpha=1-S.anim*.6;
      paintCard(x,c);
      if(side){rr16(x,-160,-180,320,50,14);x.fillStyle='rgba(30,14,6,.95)';x.fill();x.strokeStyle=side<0?'#7fd8ff':'#ffd36b';x.lineWidth=2.5;x.stroke();
        const lbl=o.t+(o.roll?` (chance ${Math.round(clamp12(S.v[o.roll.i],5,95))}%)`:''),ls=wrapLines(x,lbl,296,14);
        ls.slice(0,2).forEach((l,i)=>GX.hud.text(x,l,0,(ls.length>1?-164:-155)+i*19,{size:14,al:'center',w:900,col:'#ffe08a',stroke:0,min:10,max:300}))}
      x.restore();
      if(S.roll&&now<S.roll.until){const ls=wrapLines(x,GX.clean(S.roll.t),W-60,13),h=ls.length*19+14;GX.hud.panel(x,20,170,W-40,h,{r:10,acc:'#ffd36b',a:.97});ls.forEach((l,i)=>GX.hud.text(x,l,W/2,187+i*19,{size:13,al:'center',w:800,col:'#ffe08a',stroke:0,min:10,max:W-56}))}
      /* as duas escolhas (toque no lado da tela) */
      [[-1,c.L.t,8],[1,c.R.t,W/2+4]].forEach(([s,label,X])=>{const on=side===s,w=W/2-12,y=578;
        GX.hud.panel(x,X,y,w,56,{r:10,acc:on?(s<0?'#7fd8ff':'#ffd36b'):'#a8844a',a:on?1:.93});if(on)GX.glow(x,X+w/2,y+28,130,s<0?'#5ac8ff':'#ffc040',.3,{sy:.35});
        const ax=s<0?X+14:X+w-14;GX.poly(x,[[ax+s*6,y+28],[ax-s*5,y+20],[ax-s*5,y+36]],s<0?'#7fd8ff':'#ffd36b');
        const ls=wrapLines(x,label,w-42,13).slice(0,3),tx=X+w/2-s*9;ls.forEach((l,i)=>GX.hud.text(x,l,tx,y+29+(i-(ls.length-1)/2)*17,{size:13,al:'center',w:700,col:on?'#ffffff':'#ecdfc8',stroke:0,min:10,max:w-32}))});
      GX.vignette(x,W,H,{a:.4});GX.hud.frame(x,W,H,{acc:'#d6a94a',a:.7});
    }
  };
}
Object.assign(ACH,{
  tr_arco:{ico:'⏳',n:'Consequências',d:'Veja uma escolha antiga voltar n’O Trono do Mestre.'},
  tr_galeria:{ico:'🖼',n:'Colecionador de Finais',d:'Descubra 10 finais diferentes n’O Trono do Mestre.'},
  tr_lenda:{ico:'🏆',n:'Campanha Lendária',d:'Sobreviva 10 anos (120 sessões) n’O Trono do Mestre.',secret:true},
});
defineArcadeGame('trono',{...GAMES12.trono,make:trono45,setup:trSetup45,
  desc:'Arcos narrativos com consequências anos depois, elenco fixo, bênçãos e maldições, crises, duelos no dado e 18 finais para colecionar.',
  keys:'← e → (ou arraste a carta)',touch:'Arraste a carta para um lado'});
console.info('[Tulpa] Etapa 45 carregada (O Trono do Mestre 2.0)');

