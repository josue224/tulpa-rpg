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
  return{
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
      C.hud(`🏛 ${esc(M.n)} · ❤ Vital <b>${S.vital}</b> · ⚗ <b>${Math.floor(S.ess)}</b> · Onda <b>${S.wave}</b>${inf?' ♾':'/'+WAVES}${S.syns.size?` · ✨ ${[...new Set(S.links?.map(l=>l[2]))].map(k=>SYN44[k].g).join('')}`:''}${S.wave===0?' · coloque totens e aperte ▶':''}`)},
    draw(x){
      const now=performance.now();
      x.fillStyle='#16121c';x.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const rd=road.has(c+','+r);x.fillStyle=rd?'#2a2230':((c+r)%2?'#1e2a20':'#1b261d');x.fillRect(c*CS,r*CS,CS,CS)}
      paths.forEach(p=>{x.lineJoin='round';x.lineCap='round';x.beginPath();p.pts.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q));x.strokeStyle='#3a2d22';x.lineWidth=36;x.stroke();x.strokeStyle='rgba(217,203,176,.22)';x.lineWidth=2;x.setLineDash([8,10]);x.stroke();x.setLineDash([])});
      const end=paths[0].pts[paths[0].pts.length-1];x.save();x.shadowColor='#ffd36b';x.shadowBlur=20;x.fillStyle='#ffd36b';const [ex,ey]=end;x.beginPath();x.moveTo(ex-14,ey+18);x.lineTo(ex-14,ey-6);x.lineTo(ex,ey-20);x.lineTo(ex+14,ey-6);x.lineTo(ex+14,ey+18);x.closePath();x.fill();x.restore();
      S.walls.forEach(w=>{x.save();x.fillStyle='#e8b83c';x.globalAlpha=Math.min(1,w.t);x.fillRect(w.x-6,w.y-22,12,44);x.restore();txt16(x,'🧱',w.x,w.y-30,{size:14})});
      S.rains.forEach(r=>{x.save();x.globalAlpha=.25;x.fillStyle='#7fe3ff';x.beginPath();x.arc(r.x,r.y,80,0,7);x.fill();x.globalAlpha=.8;x.strokeStyle='#bfefff';for(let i=0;i<14;i++){const a=i*2.4+now/90,rr=(i*13)%78;x.beginPath();x.moveTo(r.x+Math.cos(a)*rr,r.y+Math.sin(a)*rr-6);x.lineTo(r.x+Math.cos(a)*rr-2,r.y+Math.sin(a)*rr+6);x.stroke()}x.restore()});
      (S.links||[]).forEach(([a,b,k])=>{const s=SYN44[k];x.save();x.strokeStyle=s.c;x.globalAlpha=.55+.3*Math.sin(now/300);x.lineWidth=4;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.restore();txt16(x,s.g,(a.x+b.x)/2,(a.y+b.y)/2,{size:14,w:900,col:s.c,stroke:3})});
      S.towers.forEach(t=>{const b=TOT44[t.k],st=stats(t);if(S.sel===t){x.beginPath();x.arc(t.x,t.y,st.rng,0,7);x.fillStyle=b.c+'14';x.fill();x.strokeStyle=b.c+'88';x.stroke()}
        x.beginPath();x.arc(t.x,t.y,18,0,7);x.fillStyle='#120d18';x.fill();x.lineWidth=t.lv>3?5:3;x.strokeStyle=b.c;x.stroke();
        txt16(x,b.g,t.x,t.y+1,{size:18});
        if(t.lv>3)txt16(x,t.spec.toUpperCase(),t.x+15,t.y-15,{size:10,w:900,col:'#ffd36b',stroke:3});else for(let i=0;i<t.lv;i++){x.beginPath();x.arc(t.x-8+i*8,t.y+22,2.6,0,7);x.fillStyle='#ffd36b';x.fill()}
        if(t.jail>0){x.strokeStyle='#9fd3ff';x.lineWidth=2;for(let i=-12;i<=12;i+=8){x.beginPath();x.moveTo(t.x+i,t.y-20);x.lineTo(t.x+i,t.y+20);x.stroke()}}});
      S.foes.forEach(f=>{const D=FOE44[f.k],[px,py]=posF(f),vis=!D.inv||revealedAt(px,py);
        x.save();x.globalAlpha=vis?1:.18;x.beginPath();x.arc(px,py,D.r,0,7);x.fillStyle=now-(f.flash||0)<80?'#fff':D.c;x.fill();
        if(D.arm){x.strokeStyle='#d0d4dc';x.lineWidth=3;x.stroke()}if(D.boss){x.lineWidth=3;x.strokeStyle=D.boss===2?'#ff5a6e':'#c33cff';x.stroke();txt16(x,D.boss===2?'👑':'⚔',px,py-D.r-14,{size:12})}
        if(f.conf>0)txt16(x,'🌀',px,py-D.r-8,{size:11});if(f.burn>0)txt16(x,'☉',px+D.r,py-D.r,{size:10,col:'#ffb347'});if(f.vul>0)txt16(x,'◌',px-D.r,py-D.r,{size:10,col:'#7fd1a0'});if(f.root>0)txt16(x,'🌿',px,py+D.r+6,{size:10});
        if(f.slow>0){x.strokeStyle='#3fae5a';x.lineWidth=2;x.beginPath();x.arc(px,py,D.r+3,0,7);x.stroke()}
        x.restore();if(vis){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(px-14,py-D.r-7,28,4);x.fillStyle='#7dffa8';x.fillRect(px-14,py-D.r-7,28*Math.max(0,f.hp/f.max),4)}});
      S.shots=S.shots.filter(s=>now-s.t0<160);S.shots.forEach(s=>{x.save();x.globalAlpha=1-(now-s.t0)/160;x.strokeStyle=s.c;x.lineWidth=s.big?5:2.5;x.shadowColor=s.c;x.shadowBlur=10;x.beginPath();x.moveTo(s.x0,s.y0);x.lineTo(s.x1,s.y1);x.stroke();x.restore()});
      if(S.place&&S.hover&&S.hover[1]<TB){const [c,r]=tcell(...S.hover),ok=!road.has(c+','+r)&&!towerAt(c,r)&&S.ess>=TOT44[S.place].cost,b=TOT44[S.place];
        x.fillStyle=ok?'rgba(125,255,168,.18)':'rgba(255,107,91,.22)';x.fillRect(c*CS,r*CS,CS,CS);x.beginPath();x.arc(c*CS+CS/2,r*CS+CS/2,b.rng*CS,0,7);x.strokeStyle=b.c+'aa';x.stroke();
        S.towers.forEach(t=>{if(Math.hypot(t.x-(c*CS+CS/2),t.y-(r*CS+CS/2))<=CS*1.5+1){const k=synOf44(t.k,S.place);if(k)txt16(x,SYN44[k].g,t.x,t.y-28,{size:16,col:SYN44[k].c,stroke:3})}})}
      if(S.pend&&S.hover&&S.hover[1]<TB){x.strokeStyle='#ffd36b';x.setLineDash([5,5]);x.beginPath();x.arc(S.hover[0],S.hover[1],S.pend==='rain'?80:24,0,7);x.stroke();x.setLineDash([])}
      const p=panel();if(p){const t=S.sel,b=TOT44[t.k];x.fillStyle='rgba(18,13,24,.96)';x.strokeStyle=b.c;x.lineWidth=2;rr16(x,p.x,p.y,p.w,p.h,10);x.fill();x.stroke();
        txt16(x,`${b.g} ${b.n} · ${t.lv>3?b[t.spec.toUpperCase()][0]:'nível '+t.lv}`,p.x+10,p.y+14,{size:13,w:700,al:'left'});
        txt16(x,t.lv>3?b[t.spec.toUpperCase()][1]:b.info,p.x+10,p.y+32,{size:11,w:500,al:'left',col:'#cfc3b0'});
        if(t.syn.size)txt16(x,[...t.syn].map(k=>`${SYN44[k].g} ${SYN44[k].n}`).join(' · '),p.x+10,p.y+46,{size:10,w:700,al:'left',col:'#ffd36b'});
        const bt=(bb,l,on)=>{x.fillStyle=on?'#3a2c22':'#2a2420';rr16(x,bb.x,bb.y,bb.w,bb.h,6);x.fill();x.strokeStyle='#6b5a44';x.stroke();txt16(x,l,bb.x+bb.w/2,bb.y+bb.h/2,{size:11,w:700,col:on?'#f4ead6':'#7a6a58'})};
        if(p.up)bt(p.up,t.lv>3?'Especializado':`⬆ ${upCost(t)} ⚗`,t.lv<3&&S.ess>=upCost(t));
        if(p.a){['a','b'].forEach(k=>{const bb=p[k],sp=b[k.toUpperCase()];x.fillStyle=S.ess>=upCost(t)?'#3a2c22':'#2a2420';rr16(x,bb.x,bb.y,bb.w,bb.h,6);x.fill();x.strokeStyle=b.c;x.stroke();txt16(x,`${k.toUpperCase()} · ${sp[0]}`,bb.x+bb.w/2,bb.y+14,{size:11,w:800});txt16(x,`${upCost(t)} ⚗`,bb.x+bb.w/2,bb.y+32,{size:10,col:'#ffd36b'})})}
        bt(p.sell,`Vender +${Math.round(t.spent*.6)}`,true)}
      x.fillStyle='#0f0b14';x.fillRect(0,TB,W,H-TB);
      KEYS.forEach((k,i)=>{const b=TOT44[k],bb=BTN(k),on=S.place===k,can=S.ess>=b.cost;x.fillStyle=on?b.c+'55':'#1d1726';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.lineWidth=on?2.5:1;x.strokeStyle=on?b.c:'#3b3048';x.strokeRect(bb.x,bb.y,bb.w,bb.h);
        txt16(x,b.g,bb.x+14,bb.y+19,{size:16});txt16(x,`${i+1} ${b.n}`,bb.x+28,bb.y+12,{size:b.n.length>9?9:11,w:700,al:'left',col:can?'#f4ead6':'#7a6a58'});txt16(x,`${b.cost} ⚗`,bb.x+28,bb.y+27,{size:11,w:700,al:'left',col:can?'#ffd36b':'#7a6a58'})});
      ['wall','rain'].forEach(k=>{const a=ABL44[k],bb=BAB(k),cd=S.ab[k],on=S.pend===k;x.fillStyle=on?'#ffd36b44':'#1d1726';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.strokeStyle=on?'#ffd36b':'#3b3048';x.lineWidth=on?2.5:1;x.strokeRect(bb.x,bb.y,bb.w,bb.h);
        txt16(x,a.g,bb.x+bb.w/2,bb.y+14,{size:15});txt16(x,cd>0?`${Math.ceil(cd)} s`:k==='wall'?'M':'C',bb.x+bb.w/2,bb.y+30,{size:10,w:800,col:cd>0?'#7a6a58':'#ffd36b'});if(cd>0){x.fillStyle='rgba(0,0,0,.5)';x.fillRect(bb.x,bb.y,bb.w*cd/a.cd,bb.h)}});
      const busy=S.q.length||S.foes.length;
      [[B_WAVE,busy?(S.auto?'⏯ Auto: on':'⏯ Auto: off'):'▶ Onda '+(S.wave+1)],[B_FAST,'⏩ x'+S.fast]].forEach(([bb,l])=>{x.fillStyle='#2b1f10';x.fillRect(bb.x,bb.y,bb.w,bb.h);x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.strokeRect(bb.x,bb.y,bb.w,bb.h);txt16(x,l,bb.x+bb.w/2,bb.y+bb.h/2,{size:12,w:800,col:'#ffd36b'})});
      if(S.msg&&now-S.msgT<2400){x.save();x.globalAlpha=Math.min(1,(2400-(now-S.msgT))/400);txt16(x,S.msg,W/2,24,{size:17,w:800,stroke:4});x.restore()}
      txt16(x,`❤ ${S.vital}`,W-12,14,{size:13,w:700,al:'right',col:'#ffb3a8'});txt16(x,`⚗ ${Math.floor(S.ess)}`,W-12,32,{size:13,w:700,al:'right',col:'#ffd36b'});
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
  return{st:()=>S,choose,
    reward:()=>S.rw,
    key(code,down){if(!down||Date.now()<C.t0)return;if(code==='ArrowLeft'||code==='KeyA')choose(-1);if(code==='ArrowRight'||code==='KeyD')choose(1)},
    ptr(t,px){if(Date.now()<C.t0)return;if(t==='down'){S.drag=true;S.sx=px}else if(t==='move'&&S.drag){S.dx=px-S.sx}else if(t==='up'){S.drag=false;if(Math.abs(S.dx)>90)choose(Math.sign(S.dx));else if(Math.abs(S.dx)<6)choose(px<W/2?-1:1);S.dx=0}},
    step(dt){S.anim=Math.max(0,S.anim-dt*4);if(!S.drag)S.dx*=.8;C.hud(`👑 Ano <b>${year()}</b> · sessão ${sess()} · total ${S.n} · ${Object.keys(S.mods).length?Object.keys(S.mods).map(k=>MOD45[k].g).join(' '):'sem bênçãos'} · arraste a carta (ou ← →)`)},
    draw(x){
      x.fillStyle='#1a1410';x.fillRect(0,0,W,H);
      const side=S.dx<-20?-1:S.dx>20?1:0,o=side?opt(side):null,prev=o?(o.roll?null:scaled(o.fx||[0,0,0,0])):null;
      TRB45.forEach((b,i)=>{const bx=20+i*112,v=S.v[i];x.fillStyle='#2a221c';rr16(x,bx,12,100,70,12);x.fill();
        txt16(x,b.split(' ')[0],bx+50,32,{size:22});x.fillStyle='#000';x.fillRect(bx+12,54,76,10);x.fillStyle=TRC45[i];x.fillRect(bx+12,54,76*clamp12(v,0,100)/100,10);
        if(v<=15||v>=85){x.strokeStyle='#ff6b5b';x.lineWidth=2;x.strokeRect(bx+11,53,78,12)}
        txt16(x,b.split(' ')[1],bx+50,74,{size:11,col:'#cfc3b0'});
        if(o&&o.roll&&o.roll.i===i)txt16(x,'🎲',bx+50,92,{size:14});
        else if(prev&&prev[i]){if(S.mods.olho)txt16(x,(prev[i]>0?'+':'')+prev[i],bx+50,92,{size:13,w:800,col:prev[i]>0?'#7dffa8':'#ff9b8a'});else{const s=Math.abs(prev[i])>9?8:4;x.beginPath();x.arc(bx+50,92,s,0,TAU16);x.fillStyle='#fff';x.fill()}}});
      const mk=Object.keys(S.mods);mk.forEach((k,i)=>{const m=MOD45[k],bx=W/2-(mk.length*36)/2+i*36;rr16(x,bx,106,32,26,8);x.fillStyle=m.good?'rgba(125,255,168,.18)':'rgba(255,107,91,.2)';x.fill();txt16(x,m.g,bx+16,119,{size:14})});
      txt16(x,`Ano ${year()} · sessão ${sess()} de 12`,W/2,mk.length?146:122,{size:13,col:'#9a8a70'});
      if(S.done&&S.end){txt16(x,S.end[0],W/2,H/2-70,{size:60});txt16(x,S.end[1],W/2,H/2,{size:22,col:'#ffd36b'});wrap16(x,S.end[2],W/2,H/2+34,400,19,'#e9e1d0',14);return}
      const c=S.card;if(!c)return;const who=CAST45[c.who];
      const cx=W/2+S.dx,cy=380+S.anim*60,rot=S.dx/600;
      x.save();x.translate(cx,cy);x.rotate(rot);x.globalAlpha=1-S.anim*.6;
      rr16(x,-160,-180,320,360,18);x.fillStyle=c.crisis?'#f6d6cc':'#f1e4c8';x.fill();x.lineWidth=c.crisis?5:3;x.strokeStyle=c.crisis?'#b3261e':c._due?'#7b4bd0':'#8a6a3a';x.stroke();
      if(c.crisis){rr16(x,-160,-180,320,26,18);x.fillStyle='#b3261e';x.fill();txt16(x,'⚠ CRISE',0,-167,{size:12,w:900,col:'#fff'})}
      else if(c._due){rr16(x,-160,-180,320,26,18);x.fillStyle='#7b4bd0';x.fill();txt16(x,'⏳ CONSEQUÊNCIA',0,-167,{size:12,w:900,col:'#fff'})}
      if(c.who==='Perseus'||c.who==='perseus')sprAt16(x,-1,0,-100,100);else txt16(x,who?who.ico:c.ico||'❔',0,-100,{size:60});
      txt16(x,who?who.n:c.who,0,-34,{size:17,col:'#3a2a12'});if(who)txt16(x,who.p,0,-14,{size:10,w:500,col:'#7a5a32'});
      wrap16(x,c.t,0,16,280,19,'#3a2a12',14);
      if(side){rr16(x,-160,-180,320,50,18);x.fillStyle='rgba(42,26,10,.92)';x.fill();txt16(x,o.t+(o.roll?` (🎲 ${Math.round(clamp12(S.v[o.roll.i],5,95))}%)`:''),0,-155,{size:14,col:'#ffd36b'})}
      x.restore();
      if(S.roll&&performance.now()<S.roll.until)txt16(x,S.roll.t,W/2,H-60,{size:13,w:800,col:'#ffd36b',stroke:4});
      txt16(x,'◀ '+c.L.t,12,H-20,{size:12,al:'left',col:'#cfc3b0'});txt16(x,c.R.t+' ▶',W-12,H-20,{size:12,al:'right',col:'#cfc3b0'});
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

