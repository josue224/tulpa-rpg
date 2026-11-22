/* ===================================================================
   TULPA · ETAPA 20 — 🐱 VISITAR O PERSEUS
   ------------------------------------------------------------------
   - Camada de "game feel" para todos os mini-games (C.fx):
       burst(x,y,o) partículas · float(x,y,txt,o) números de combo ·
       shake(força,duração) tremor de tela · flash(cor) clarão.
   - Perseus de estimação (estilo Pou / Talking Tom), um por jogador,
     salvo na ficha (d.perseus) e no aparelho:
       barras 🍖 Fome · 🧼 Higiene · 🧶 Diversão · 💤 Energia (0–100),
       comida da cozinha, banho com sabonete/esponja/chuveiro, carinho
       com ronronar, abajur para cochilar, falas da lore e expressões.
   - Óbolos (moedas): mini-games, cuidados e conquistas pagam.
   - 🛍️ Loja de Visual: pelagens, chapéus/acessórios e cenários.
     A pelagem e o chapéu aparecem no gato do jogador nos mini-games.
   - Abas 🏆 Conquistas (cards com progresso e recompensa) e
     📊 Ranking da Mesa, dentro da tela do Perseus.
   =================================================================== */

/* ===================== game feel (todos os jogos) ===================== */
const FX20={p:[],f:[],sh:0,shT:0,shD:1,fl:null};
T3.fx20=FX20;
const fx20={
  burst(x,y,{n=14,col='#ffd36b',sp=170,life=.6,size=3,grav=260,kind='dot',spread=Math.PI*2,ang=0}={}){
    const cols=Array.isArray(col)?col:[col];
    for(let i=0;i<n&&FX20.p.length<420;i++){const a=ang+(Math.random()-.5)*spread,v=sp*(.35+Math.random()*.75);
      FX20.p.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:life*(.6+Math.random()*.6),s:size*(.6+Math.random()*.8),col:cols[i%cols.length],g:grav,k:kind,r:Math.random()*6})}
  },
  float(x,y,txt,{col='#fff',size=22,life=.9,rise=60}={}){if(FX20.f.length<40)FX20.f.push({x,y,txt:String(txt),col,size,life,t:0,rise})},
  shake(m=6,d=.25){if(m>FX20.sh){FX20.sh=m;FX20.shD=d}FX20.shT=Math.max(FX20.shT,d)},
  flash(col='#fff',a=.35){FX20.fl={col,a,t:0}},
  reset(){FX20.p=[];FX20.f=[];FX20.sh=0;FX20.shT=0;FX20.fl=null}
};
T3.fxApi=fx20;
function fxStep20(dt){
  FX20.p.forEach(p=>{p.t+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*1.2;p.r+=dt*5});
  FX20.p=FX20.p.filter(p=>p.t<p.life);
  FX20.f.forEach(f=>f.t+=dt);FX20.f=FX20.f.filter(f=>f.t<f.life);
  if(FX20.shT>0){FX20.shT=Math.max(0,FX20.shT-dt);if(!FX20.shT)FX20.sh=0}
  if(FX20.fl){FX20.fl.t+=dt;if(FX20.fl.t>.3)FX20.fl=null}
}
function fxOff20(){if(!FX20.shT||!FX20.sh)return[0,0];const k=FX20.sh*(FX20.shT/Math.max(.01,FX20.shD));return[(Math.random()*2-1)*k,(Math.random()*2-1)*k]}
function star20(x,cx,cy,r,rot){x.beginPath();for(let i=0;i<8;i++){const a=rot+i*Math.PI/4,rr=i%2?r*.42:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
function heart20(x,cx,cy,r){x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.5,cy-r*.1,cx-r*.7,cy-r*1.3,cx,cy-r*.4);x.bezierCurveTo(cx+r*.7,cy-r*1.3,cx+r*1.5,cy-r*.1,cx,cy+r*.9);x.fill()}
function fxDraw20(x,W,H){
  FX20.p.forEach(p=>{const a=1-p.t/p.life;x.globalAlpha=Math.max(0,a);x.fillStyle=p.col;
    if(p.k==='star')star20(x,p.x,p.y,p.s*1.8,p.r);
    else if(p.k==='heart')heart20(x,p.x,p.y,p.s*1.6);
    else if(p.k==='ring'){x.strokeStyle=p.col;x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.y,p.s*(1+p.t*6),0,7);x.stroke()}
    else if(p.k==='bubble'){x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.4;x.fillStyle='rgba(190,230,255,.25)';x.beginPath();x.arc(p.x,p.y,p.s*2.2,0,7);x.fill();x.stroke()}
    else{x.beginPath();x.arc(p.x,p.y,p.s,0,7);x.fill()}});
  x.globalAlpha=1;
  FX20.f.forEach(f=>{const k=f.t/f.life,a=k<.7?1:1-(k-.7)/.3,sc=k<.12?.6+k/.12*.5:1.1-Math.min(.1,(k-.12));
    x.save();x.globalAlpha=Math.max(0,a);x.translate(f.x,f.y-f.rise*k);x.scale(sc,sc);x.font=`900 ${f.size}px "IBM Plex Sans",system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';
    x.lineWidth=Math.max(3,f.size/5);x.strokeStyle='rgba(0,0,0,.7)';x.strokeText(f.txt,0,0);x.fillStyle=f.col;x.fillText(f.txt,0,0);x.restore()});
  if(FX20.fl){x.globalAlpha=FX20.fl.a*(1-FX20.fl.t/.3);x.fillStyle=FX20.fl.col;x.fillRect(-20,-20,W+40,H+40);x.globalAlpha=1}
}
/* o laço dos jogos ganha tremor, partículas e clarão por cima de qualquer jogo */
mgLoop=function(now){
  MG.raf=requestAnimationFrame(mgLoop);
  const dt=Math.min(.05,Math.max(0,(now-MG.last)/1000));MG.last=now;
  const g=MG.g,x=MG.x;if(!g||!x)return;
  MG.drawn={};
  try{
    if(!MG.over)g.step(dt);fxStep20(dt);
    const [ox,oy]=fxOff20();x.setTransform(MG.sc,0,0,MG.sc,ox*MG.sc,oy*MG.sc);
    if(ox||oy){x.fillStyle='#000';x.fillRect(-30,-30,MG.W+60,MG.H+60)}
    g.draw(x);fxDraw20(x,MG.W,MG.H);x.setTransform(MG.sc,0,0,MG.sc,0,0);mgOverlay(x);
  }catch(e){console.warn('[T20] jogo',e)}
};
{const _msl20=mgStartLocal;mgStartLocal=function(room){fx20.reset();const out=_msl20.apply(this,arguments);if(MG.C){MG.C.fx=fx20;MG.C.pet=()=>PET}return out}}
/* sons extras */
S5.meow=t=>{o5('sawtooth',620,t,.12,{to:880,gain:.025,wet:.25});o5('sine',880,t+.12,.28,{to:520,gain:.05,wet:.3})};
S5.purr=t=>{for(let i=0;i<6;i++)n5(t+i*.085,.07,{freq:180,type:'lowpass',gain:.16,wet:.05})};
S5.chomp=t=>{n5(t,.06,{freq:700,type:'bandpass',q:2,gain:.18});n5(t+.11,.06,{freq:560,type:'bandpass',q:2,gain:.16})};
S5.bubble=t=>o5('sine',520+Math.random()*300,t,.09,{to:1300,gain:.035,wet:.2});
S5.splash=t=>n5(t,.35,{freq:4200,type:'highpass',gain:.08,wet:.3});
S5.lamp=t=>{n5(t,.03,{freq:3000,gain:.12});o5('square',1600,t,.02,{gain:.015,wet:0})};
S5.coin20=t=>{o5('triangle',1175,t,.07,{gain:.05});o5('triangle',1568,t+.07,.12,{gain:.05});o5('sine',2349,t+.14,.18,{gain:.025,wet:.4})};
S5.buy20=t=>[784,988,1175,1568].forEach((f,i)=>o5('triangle',f,t+i*.06,.18,{gain:.05,wet:.4}));
S5.yawn=t=>o5('sine',420,t,.7,{to:180,gain:.05,wet:.4});
for(let i=0;i<8;i++)S5['bb'+i]=t=>{const f=330*Math.pow(2,i/5);o5('triangle',f,t,.12,{gain:.06,wet:.3});o5('sine',f*2,t+.04,.2,{gain:.03,wet:.5});if(i>2)n5(t,.18,{freq:1800+i*300,gain:.05,wet:.4})};

/* ===================== catálogo da Loja de Visual ===================== */
const SHOP20={
  sk:{t:'Pelagens',items:{
    orig:{n:'Perseus Original',ico:'🐱',p:0,d:'O azul de sempre, sem gravata.'},
    cosmico:{n:'Perseus Cósmico',ico:'🌌',p:120,d:'Pelagem de nebulosa com estrelas presas no pelo.'},
    esqueleto:{n:'Perseus Esqueleto (Supremacia)',ico:'💀',p:160,d:'Pelo escuro e ossos à mostra. Ele jura que é só estilo.'},
    fantasma:{n:'Perseus Fantasma',ico:'👻',p:140,d:'Translúcido, frio e brilhante. Atravessa o Véu.'},
    dourado:{n:'Perseus Dourado',ico:'✨',p:260,d:'Ouro de verdade. Ou Ilusão bem feita.'},
    ciber:{n:'Perseus Cibernético',ico:'🤖',p:190,d:'Circuitos no pelo e visor vermelho.'},
  }},
  ht:{t:'Chapéus',items:{
    detetive:{n:'Chapéu de Detetive',ico:'🕵️',p:60,d:'Para investigar cenas e potes de ração.'},
    coroa:{n:'Coroa do Mestre',ico:'👑',p:220,d:'Quem usa decide quando acaba o Intervalo. Ou não.'},
    capuz:{n:'Capuz Ocultista',ico:'🧙',p:95,d:'Roxo, pontudo e cheio de segredos.'},
  }},
  ac:{t:'Acessórios',items:{
    oculos:{n:'Óculos Escuros',ico:'🕶️',p:45,d:'Contra o brilho da Verdade.'},
    gravata:{n:'Gravata Borboleta',ico:'🎀',p:55,d:'Um toque de gala no pescoço.'},
  }},
  bg:{t:'Cenários',items:{
    quarto:{n:'Quarto do Perseus',ico:'🛏️',p:0,d:'Almofada, janela com lua e o abajur.'},
    biblioteca:{n:'Biblioteca Antiga',ico:'📚',p:85,d:'Estantes até o teto e uma vela que nunca apaga.'},
    laboratorio:{n:'Laboratório',ico:'🧪',p:85,d:'Frascos borbulhando Essência.'},
    astral:{n:'Plano Astral',ico:'🌠',p:150,d:'Uma ilha flutuando entre as estrelas.'},
  }},
};
T3.shop20=SHOP20;
const FOOD20={
  racao:{n:'Ração Astral',ico:'🥣',p:0,cd:90,f:22,d:0,e:0,h:0,dsc:'Tigela grátis a cada 1 min 30 s.'},
  peixe:{n:'Peixe Etéreo',ico:'🐟',p:8,f:45,d:6,e:0,h:0,dsc:'+45 Fome · +6 Diversão'},
  cafe:{n:'Café de Investigador',ico:'☕',p:6,f:10,d:0,e:32,h:0,dsc:'+10 Fome · +32 Energia'},
  bolo:{n:'Bolo de Essência',ico:'🍰',p:10,f:24,d:24,e:0,h:-6,dsc:'+24 Fome · +24 Diversão · suja um pouco'},
  leite:{n:'Leite da Lua',ico:'🥛',p:5,f:18,d:0,e:10,h:0,dsc:'+18 Fome · +10 Energia'},
};

/* ===================== estado do Perseus ===================== */
const PETK20=()=>'tulpa_pet_'+(uid3()||'anon');
const PET0=()=>({v:1,rev:0,coins:60,bars:{f:80,h:80,d:80,e:80},at:Date.now(),own:{sk:{orig:1},ht:{},ac:{},bg:{quarto:1}},eq:{sk:'orig',ht:'',ac:'',bg:'quarto'},xp:0,ap:0,best:{},st:{baths:0,feeds:0,pet:0,sleeps:0,buys:0,earned:0,games:0},cd:{},paid:{}});
let PET=null;
const PS20={saveAt:0,timer:0,mode:'',tool:'soap',sleep:false,raf:0,last:0,tab:'room',bubbles:[],soaped:0,rinsed:0,mood:'',say:null,sayNext:0,tap:0,bounce:0,purrAt:0,petDist:0,mouth:0,flying:null,drag:null,pp:null,hover:false,achF:'all',achV:'vitrine',achSel:null,rkSort:'total'};
T3.pet=()=>PET;T3.petState=PS20;
function petFix20(p){
  const b=PET0();p={...b,...(p||{})};
  p.bars={...b.bars,...(p.bars||{})};p.own={sk:{orig:1,...(p.own?.sk||{})},ht:{...(p.own?.ht||{})},ac:{...(p.own?.ac||{})},bg:{quarto:1,...(p.own?.bg||{})}};
  p.eq={...b.eq,...(p.eq||{})};p.st={...b.st,...(p.st||{})};p.best={...(p.best||{})};p.cd={...(p.cd||{})};p.paid={...(p.paid||{})};
  ['f','h','d','e'].forEach(k=>p.bars[k]=clamp12(Number(p.bars[k])||0,0,100));
  p.coins=Math.max(0,Math.floor(Number(p.coins)||0));return p;
}
function petLoad20(){
  let loc=null;try{loc=JSON.parse(localStorage.getItem(PETK20())||'null')}catch(e){}
  const ch=myArcChar(),cl=ch&&d14(ch).perseus;
  const pick=(cl&&(!loc||(Number(cl.rev)||0)>=(Number(loc.rev)||0)))?cl:loc;
  if(!PET||PET.__k!==PETK20()||(pick&&(Number(pick.rev)||0)>(Number(PET.rev)||0))){PET=petFix20(pick);PET.__k=PETK20()}
  petDecay20();return PET;
}
function petPlain20(){const o=JSON.parse(JSON.stringify(PET));delete o.__k;return o}
function petSave20(now){
  if(!PET)return;PET.rev=(Number(PET.rev)||0)+1;
  try{localStorage.setItem(PETK20(),JSON.stringify(petPlain20()))}catch(e){}
  clearTimeout(PS20.timer);
  const go=()=>{PS20.saveAt=Date.now();const ch=myArcChar();if(ch&&(ch._sheetAvailable||ch.id===activeCharacterId))try{const o=petPlain20();mutateChar(ch,d=>{d.perseus=o})}catch(e){console.warn('[T20] salvar Perseus',e)}};
  if(now||Date.now()-PS20.saveAt>4000)go();else PS20.timer=setTimeout(go,2500);
}
/* as barras caem com o tempo, mesmo com o app fechado (por hora) */
const DECAY20={f:7,h:4,d:5,e:3.5};
function petDecay20(){
  const now=Date.now(),hrs=Math.max(0,(now-(Number(PET.at)||now))/36e5);PET.at=now;if(!hrs)return;
  Object.entries(DECAY20).forEach(([k,v])=>{if(k==='e'&&PS20.sleep)return;PET.bars[k]=clamp12(PET.bars[k]-v*hrs,0,100)});
}
const petLvl20=p=>1+Math.floor(Math.sqrt((Number(p?.xp)||0)/40));
const petAvg20=p=>p?Math.round((p.bars.f+p.bars.h+p.bars.d+p.bars.e)/4):0;
function petGain20(k,v){if(!PET)return 0;const o=PET.bars[k];PET.bars[k]=clamp12(o+v,0,100);return PET.bars[k]-o}
/* Óbolos */
function petEarn20(n,why,{x,y}={}){
  petLoad20();n=Math.max(0,Math.round(n));if(!n)return 0;PET.coins+=n;PET.st.earned=(PET.st.earned||0)+n;fx5('coin20');
  if(MG.open&&MG.view==='pet'&&x!=null)fx20.float(x,y,'+'+n+' 🪙',{col:'#ffd36b',size:20});
  else if(why)toast(`🪙 +${n} Óbolos · ${why}`);
  if(PET.coins>=500)try{achieve('rico')}catch(e){}
  petHeader20();petSave20();return n;
}
function petCd20(k,sec){const now=Date.now(),t=Number(PET.cd[k])||0;if(now<t)return false;PET.cd[k]=now+sec*1000;return true}
T3.petEarn=(n,why)=>petEarn20(n,why);

/* ===================== pelagens e chapéus (também nos mini-games) ===================== */
const SKC20={};
const EYE20=[[.277,.328],[.603,.316]],MOUTH20=[.44,.346],HEAD20=[.446,.07];
function petImg20(eq,ci){
  if(!SPR.ok)return null;eq=eq||{};const sk=SHOP20.sk.items[eq.sk]?eq.sk:'orig',ht=SHOP20.ht.items[eq.ht]?eq.ht:'',ac=SHOP20.ac.items[eq.ac]?eq.ac:'';
  const key=[sk,ht,ac,sk==='orig'?ci:''].join('|');if(SKC20[key])return SKC20[key];
  const S=128,pad=ht?1:0,sz=pad?110:128,ox=(S-sz)/2+(pad?2:0),oy=pad?S-sz-1:0,P=(u,v)=>[ox+(.02+u*.92)*sz,oy+(.17+(v-.03)*.856)*sz];
  const base=document.createElement('canvas');base.width=base.height=S;const b=base.getContext('2d');
  if(sk==='orig'&&ci!=null&&ci>=0&&MG_COLORS[ci]){const tin=_spr20(ci);b.drawImage(tin,ox,oy,sz,sz)}else b.drawImage(SPR.img,ox,oy,sz,sz);
  const tint=(col,op='color')=>{b.globalCompositeOperation=op;b.fillStyle=col;b.fillRect(0,0,S,S);b.globalCompositeOperation='destination-in';b.drawImage(SPR.img,ox,oy,sz,sz);b.globalCompositeOperation='source-over'};
  const atop=f=>{b.save();b.globalCompositeOperation='source-atop';f();b.restore()};
  const rnd=mb32(key.length*7919+sk.charCodeAt(0));
  if(sk==='cosmico'){tint('#4934c8');atop(()=>{const g=b.createRadialGradient(...P(.35,.55),4,...P(.35,.55),sz*.6);g.addColorStop(0,'rgba(255,90,200,.45)');g.addColorStop(1,'rgba(20,10,60,.0)');b.fillStyle=g;b.fillRect(0,0,S,S);b.fillStyle='#fff';for(let i=0;i<34;i++){const r=rnd()<.15?1.6:.8;b.beginPath();b.arc(ox+rnd()*sz,oy+rnd()*sz,r,0,7);b.fill()}})}
  else if(sk==='esqueleto'){tint('#6a6a6a');tint('#2c2c34','multiply');atop(()=>{b.strokeStyle='#f1eee6';b.lineWidth=2.4;b.lineCap='round';
      [[.52,.62],[.6,.6],[.68,.58]].forEach(([y,w])=>{b.beginPath();b.moveTo(...P(.2,y));b.quadraticCurveTo(...P(.3,y-.04),...P(.39,y));b.stroke();b.beginPath();b.moveTo(...P(.52,y));b.quadraticCurveTo(...P(.62,y-.04),...P(w+.08,y));b.stroke()});
      b.beginPath();b.moveTo(...P(.12,.4));b.lineTo(...P(.2,.47));b.moveTo(...P(.8,.4));b.lineTo(...P(.72,.47));b.stroke();
      b.fillStyle='#0b0b10';EYE20.forEach(([u,v])=>{b.beginPath();b.ellipse(...P(u,v),sz*.05,sz*.045,0,0,7);b.fill()});b.fillStyle='#ff3b3b';EYE20.forEach(([u,v])=>{b.beginPath();b.arc(...P(u,v),sz*.014,0,7);b.fill()})})}
  else if(sk==='fantasma'){tint('#c9f3ff');tint('#ffffff','soft-light');atop(()=>{const g=b.createLinearGradient(0,oy+sz*.6,0,oy+sz);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(150,230,255,.55)');b.fillStyle=g;b.fillRect(0,0,S,S)})}
  else if(sk==='dourado'){tint('#e3a815');tint('#ffe28a','overlay');atop(()=>{const g=b.createLinearGradient(ox,oy,ox+sz,oy+sz);g.addColorStop(.35,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.55)');g.addColorStop(.65,'rgba(255,255,255,0)');b.fillStyle=g;b.fillRect(0,0,S,S)});b.fillStyle='#fffbe0';for(let i=0;i<5;i++)star20(b,ox+(.1+rnd()*.8)*sz,oy+(.1+rnd()*.8)*sz,2.5+rnd()*2.5,0)}
  else if(sk==='ciber'){tint('#17bfb1');atop(()=>{b.strokeStyle='rgba(0,40,45,.75)';b.lineWidth=1.3;for(let i=0;i<9;i++){let x0=ox+rnd()*sz,y0=oy+(.3+rnd()*.65)*sz;b.beginPath();b.moveTo(x0,y0);for(let j=0;j<3;j++){if(j%2)x0+=(rnd()-.5)*24;else y0+=(rnd()-.5)*20;b.lineTo(x0,y0)}b.stroke();b.fillStyle='#7cfff3';b.beginPath();b.arc(x0,y0,1.6,0,7);b.fill()}});
    b.save();b.shadowColor='#ff2a3a';b.shadowBlur=8;b.fillStyle='#ff3346';b.beginPath();const [ax,ay]=P(.2,.29),[bx]=P(.68,.29);b.roundRect?b.roundRect(ax,ay,bx-ax,sz*.055,4):b.rect(ax,ay,bx-ax,sz*.055);b.fill();b.restore()}
  const out=document.createElement('canvas');out.width=out.height=S;const x=out.getContext('2d');
  if(sk==='fantasma'){x.save();x.shadowColor='#8fe8ff';x.shadowBlur=10;x.globalAlpha=.68;x.drawImage(base,0,0);x.restore()}else x.drawImage(base,0,0);
  /* acessórios por cima */
  if(ac==='gravata'){const [cx,cy]=P(.45,.445),r=sz*.075;x.fillStyle='#d7263d';x.strokeStyle='#4a0b14';x.lineWidth=1.6;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx-r*1.4,cy-r*.8);x.lineTo(cx-r*1.4,cy+r*.8);x.closePath();x.moveTo(cx,cy);x.lineTo(cx+r*1.4,cy-r*.8);x.lineTo(cx+r*1.4,cy+r*.8);x.closePath();x.fill();x.stroke();x.beginPath();x.arc(cx,cy,r*.42,0,7);x.fill();x.stroke()}
  if(ac==='oculos'){x.fillStyle='#111';x.strokeStyle='#000';x.lineWidth=2;EYE20.forEach(([u,v])=>{const [cx,cy]=P(u,v);x.beginPath();x.roundRect?x.roundRect(cx-sz*.085,cy-sz*.05,sz*.17,sz*.095,sz*.03):x.rect(cx-sz*.085,cy-sz*.05,sz*.17,sz*.095);x.fill()});
    const [l]=P(EYE20[0][0]+.085,0),[r]=P(EYE20[1][0]-.085,0),[,yy]=P(0,.255);x.beginPath();x.moveTo(l,yy);x.lineTo(r,yy);x.stroke();x.fillStyle='rgba(255,255,255,.75)';EYE20.forEach(([u,v])=>{const [cx,cy]=P(u-.04,v-.02);x.fillRect(cx,cy,sz*.035,sz*.014)})}
  if(ht==='detetive'){const [cx,cy]=P(HEAD20[0],HEAD20[1]+.06);x.fillStyle='#7a5a32';x.strokeStyle='#2f2010';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy,sz*.3,sz*.055,-.04,0,7);x.fill();x.stroke();x.beginPath();x.ellipse(cx,cy-sz*.02,sz*.19,sz*.13,0,Math.PI,0);x.closePath();x.fill();x.stroke();
    x.strokeStyle='rgba(40,25,10,.55)';x.lineWidth=1;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*sz*.06,cy-sz*.14);x.lineTo(cx+i*sz*.07,cy-sz*.02);x.stroke()}x.fillStyle='#3a2612';x.fillRect(cx-sz*.19,cy-sz*.05,sz*.38,sz*.035)}
  if(ht==='coroa'){const [cx,cy]=P(HEAD20[0],HEAD20[1]+.05),w=sz*.36,h=sz*.16;x.fillStyle='#f2c230';x.strokeStyle='#7a5200';x.lineWidth=2;x.beginPath();x.moveTo(cx-w/2,cy);for(let i=0;i<=4;i++){x.lineTo(cx-w/2+i*w/4,cy-(i%2?h*.55:h));if(i<4)x.lineTo(cx-w/2+(i+.5)*w/4,cy-h*.45)}x.lineTo(cx+w/2,cy);x.closePath();x.fill();x.stroke();
    [['#e0233b',-.25],['#14c8e6',0],['#17b26a',.25]].forEach(([c,o])=>{x.fillStyle=c;x.beginPath();x.arc(cx+o*w,cy-h*.25,sz*.022,0,7);x.fill()})}
  if(ht==='capuz'){const [cx,cy]=P(.42,.27);x.fillStyle='#3b1d5e';x.strokeStyle='#170828';x.lineWidth=2;x.beginPath();x.moveTo(...P(.06,.5));x.quadraticCurveTo(...P(.04,.05),...P(.44,-.08));x.quadraticCurveTo(...P(.82,.05),...P(.8,.5));x.lineTo(...P(.68,.44));
    x.ellipse(cx,cy,sz*.24,sz*.15,0,0,Math.PI*2,true);x.lineTo(...P(.16,.44));x.closePath();x.fill('evenodd');x.stroke();x.fillStyle='#ffd36b';star20(x,...P(.44,.0),sz*.035,0)}
  SKC20[key]=out;return out;
}
T3.petImg=petImg20;
/* quem é o dono de cada cor dentro da sala: o gato dele aparece com a pelagem e o chapéu equipados */
function eqOfUid20(u){
  if(!u)return null;if(u===uid3()){petLoad20();return PET.eq}
  const ch=(chars3()||[]).find(c=>c.ownerId===u&&!gmChar6(c));const p=ch&&d14(ch).perseus;return p&&p.eq?p.eq:null;
}
const _spr20=spr;
spr=function(ci){
  try{const r=MG.room,pl=r&&r.players&&r.players.find(p=>p.c===ci&&!String(p.u||'').startsWith('~'));
    const eq=pl&&eqOfUid20(pl.u);if(eq&&(eq.sk&&eq.sk!=='orig'||eq.ht||eq.ac)){const im=petImg20(eq,ci);if(im)return im}}catch(e){}
  return _spr20(ci);
};

/* ===================== falas do Perseus ===================== */
const LORE20=[
  'Sabia que o Véu é mais fino durante o Intervalo? Por isso eu durmo tanto.',
  'Uma Tulpa é um pensamento que aprendeu a andar. Eu aprendi a andar E a pedir ração.',
  'Os 5 Elementos: Natureza, Inexistência, Ilusão, Verdade e Fé. E o sexto: Sachê.',
  'O Mestre acha que controla a mesa. Eu controlo o Mestre. Miau.',
  'Lucidez baixa? Já tentou carinho atrás da orelha? Funciona em gatos. Talvez em investigadores.',
  'Uma vez eu olhei para a Inexistência. Ela piscou primeiro.',
  'Essência é igual a ração: acaba quando você mais precisa.',
  'Não confie em portas que rangem. Nem em quem fecha devagar demais.',
  'Eu vi a Verdade uma vez. Ela tinha cheiro de peixe.',
  'Suturas seguram o que o Véu rasga. Gravatas seguram o que a dignidade rasga.',
  'Se eu sumir, procure dentro de uma caixa. Ou em outro plano. Geralmente caixa.',
  'A Ilusão é só a Verdade usando chapéu. Eu entendo de chapéus.',
  'Teosofia é o estudo das coisas que não deviam existir. Tipo segunda-feira.',
  'O Plano Astral é lindo. Mas não tem almofada.',
  'Fé é acreditar que a tigela vai encher de novo. Eu tenho muita Fé.',
  'Um Trauma marchou até o Santuário ontem. Eu sentei nele.',
  'Às vezes eu ronrono em código. Se decifrar, me avisa.',
  'Quem escreveu a ficha de vocês? Faltou a perícia Fazer Carinho.',
  'Nas Trilhas, quem anda sozinho anda rápido. Quem anda com gato anda feliz.',
  'Nunca deixe o Mestre ver você sorrindo depois de rolar 1.',
];
const MOODSAY20={
  hungry:['Minha barriga está fazendo um ritual sozinha.','Fome. Muita fome. Fome de Peixe Etéreo.','Se eu desmaiar, a culpa é da tigela vazia.'],
  dirty:['Estou com cheiro de Trilha. Banho, por favor?','Tem Ilusão grudada no meu pelo.','Até a Inexistência se afastou do meu cheiro.'],
  sad:['Ninguém brinca comigo… nem o Mestre.','Quero jogar alguma coisa no Arcade.','Faz carinho? Só um pouquinho?'],
  tired:['Meus olhos estão pesando como um Tomo Maior.','Apaga o abajur, vai…','Bocejo nível Pesadelo.'],
  happy:['Hoje eu acordei com a Essência cheia.','Você é o meu investigador favorito. Não conta pros outros.','Que vida boa a de Tulpa.'],
  purr:['Prrrrr… continua…','Isso. Bem aí. Perfeito.','Prrr. Esqueci até da Inexistência.'],
  wake:['Ei! Eu estava sonhando com sardinhas cósmicas!','Hmpf. Acordado contra a minha vontade.'],
  full:['Estou cheio. Nem mais um grão.','Se eu comer mais, eu viro uma lua.'],
  bath:['Água?! Traição!','Tá… tá… mas só porque é você.','Bolhas! Ninguém me avisou das bolhas.'],
  clean:['Cheiroso como um templo recém-varrido.','Brilhando mais que o Perseus Dourado.'],
};
function petSay20(t,ms=3200){PS20.say={t,until:Date.now()+ms};PS20.sayNext=Date.now()+9000+Math.random()*7000}

/* ===================== desenho do quarto ===================== */
const PW20=480,PH20=420,CX20=214,CY20=262,CS20=228;
function drawBg20(x,bg,W,H,t,lampOn){
  if(bg==='biblioteca'){x.fillStyle='#2a1a12';x.fillRect(0,0,W,H);
    const cols=['#7a2a2a','#2a4a7a','#2f6a3a','#8a6a2a','#5a2a6a','#a0522d'];
    for(let s=0;s<4;s++){const y=20+s*72;x.fillStyle='#4a2e1c';x.fillRect(0,y+56,W,10);let bx=6;let i=s*7;while(bx<W-6){const w=10+((i*37)%12),h=34+((i*53)%20);x.fillStyle=cols[i%cols.length];x.fillRect(bx,y+56-h,w,h);x.fillStyle='rgba(255,220,150,.25)';x.fillRect(bx+2,y+56-h+6,w-4,2);bx+=w+2;i++}}
    x.fillStyle='#3a2416';x.fillRect(0,H*.78,W,H*.22);x.fillStyle='#5a3a24';x.fillRect(0,H*.78,W,4);
    const fl=Math.sin(t*9)*1.5+Math.sin(t*13)*1;x.fillStyle='#efe6cf';x.fillRect(40,H*.78-40,10,40);const g=x.createRadialGradient(45,H*.78-50,2,45,H*.78-50,60);g.addColorStop(0,'rgba(255,200,90,.45)');g.addColorStop(1,'rgba(255,200,90,0)');x.fillStyle=g;x.fillRect(0,H*.78-120,120,120);x.fillStyle='#ffb43a';x.beginPath();x.ellipse(45,H*.78-50+fl*.3,4,8+fl,0,0,7);x.fill();return}
  if(bg==='laboratorio'){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f2420');g.addColorStop(1,'#1d3a33');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(120,255,200,.08)';x.lineWidth=1;for(let i=0;i<W;i+=24){x.beginPath();x.moveTo(i,0);x.lineTo(i,H*.72);x.stroke()}
    x.fillStyle='#2b3d38';x.fillRect(0,H*.72,W,H*.28);x.fillStyle='#3f5a52';x.fillRect(0,H*.72,W,5);
    [[50,'#5fd6ff'],[92,'#ff5a9e'],[130,'#9bff6b']].forEach(([px,c],i)=>{const by=H*.72;x.fillStyle='rgba(255,255,255,.15)';x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.beginPath();x.moveTo(px-6,by-60);x.lineTo(px-6,by-30);x.lineTo(px-18,by);x.lineTo(px+18,by);x.lineTo(px+6,by-30);x.lineTo(px+6,by-60);x.closePath();x.fill();x.stroke();x.fillStyle=c;x.beginPath();x.moveTo(px-12,by-12);x.lineTo(px-17,by-1);x.lineTo(px+17,by-1);x.lineTo(px+12,by-12);x.closePath();x.fill();
      for(let k=0;k<3;k++){const ph=(t*.8+k*.33+i*.2)%1;x.globalAlpha=1-ph;x.beginPath();x.arc(px+Math.sin(ph*9+k)*4,by-14-ph*60,2+k,0,7);x.fill();x.globalAlpha=1}});
    return}
  if(bg==='astral'){const g=x.createRadialGradient(W*.5,H*.4,10,W*.5,H*.4,W*.8);g.addColorStop(0,'#3b1f6e');g.addColorStop(.6,'#160b33');g.addColorStop(1,'#05030f');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<90;i++){const a=.35+.65*Math.abs(Math.sin(t*.8+i));x.globalAlpha=a;x.fillStyle=i%7?'#fff':'#ffd36b';x.fillRect((i*97)%W,(i*61)%(H*.8),i%9?1.5:2.5,i%9?1.5:2.5)}x.globalAlpha=1;
    const ng=x.createRadialGradient(W*.8,H*.2,4,W*.8,H*.2,90);ng.addColorStop(0,'rgba(255,110,200,.35)');ng.addColorStop(1,'rgba(255,110,200,0)');x.fillStyle=ng;x.fillRect(0,0,W,H);
    const fy=H*.78+Math.sin(t*1.2)*3;x.fillStyle='#4b3a7a';x.beginPath();x.ellipse(W*.47,fy,190,26,0,0,7);x.fill();x.fillStyle='#2a1f4a';x.beginPath();x.moveTo(W*.47-180,fy+6);x.lineTo(W*.47,fy+90);x.lineTo(W*.47+180,fy+6);x.closePath();x.fill();x.fillStyle='#8f7ad6';x.fillRect(W*.47-150,fy-6,300,3);return}
  /* quarto */
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2440');g.addColorStop(1,'#5a3446');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<W;i+=36)x.fillRect(i,0,18,H*.74);
  x.fillStyle='#1b2a52';x.fillRect(300,40,120,96);const mg=x.createRadialGradient(380,72,2,380,72,30);mg.addColorStop(0,'#fff8d8');mg.addColorStop(1,'rgba(255,248,216,0)');x.fillStyle=mg;x.fillRect(340,40,80,70);x.fillStyle='#fff6cf';x.beginPath();x.arc(380,72,12,0,7);x.fill();x.fillStyle='#1b2a52';x.beginPath();x.arc(386,68,11,0,7);x.fill();
  x.strokeStyle='#7a4a3a';x.lineWidth=6;x.strokeRect(300,40,120,96);x.beginPath();x.moveTo(360,40);x.lineTo(360,136);x.moveTo(300,88);x.lineTo(420,88);x.lineWidth=3;x.stroke();
  x.fillStyle='#6b3f2e';x.fillRect(0,H*.74,W,H*.26);x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=2;for(let i=0;i<W;i+=48){x.beginPath();x.moveTo(i,H*.74);x.lineTo(i-30,H);x.stroke()}
  x.fillStyle='#8e3e64';x.beginPath();x.ellipse(CX20,H*.86,150,26,0,0,7);x.fill();x.strokeStyle='#d07aa8';x.lineWidth=2;x.beginPath();x.ellipse(CX20,H*.86,132,20,0,0,7);x.stroke();
}
function drawLamp20(x,on,t){
  const tx=420,ty=262;x.fillStyle='#4a2c1e';x.fillRect(tx-34,ty+38,68,10);x.fillRect(tx-28,ty+48,8,60);x.fillRect(tx+20,ty+48,8,60);
  if(on){const g=x.createRadialGradient(tx,ty+10,4,tx,ty+10,130);g.addColorStop(0,'rgba(255,214,120,.42)');g.addColorStop(1,'rgba(255,214,120,0)');x.fillStyle=g;x.fillRect(tx-140,ty-120,280,260)}
  x.fillStyle='#c9a35a';x.fillRect(tx-4,ty-6,8,44);x.fillStyle='#8a6a30';x.beginPath();x.ellipse(tx,ty+38,16,5,0,0,7);x.fill();
  x.fillStyle=on?'#ffe7a6':'#6d5a3a';x.strokeStyle='#5a3a1a';x.lineWidth=2;x.beginPath();x.moveTo(tx-30,ty);x.lineTo(tx-18,ty-38);x.lineTo(tx+18,ty-38);x.lineTo(tx+30,ty);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(0,0,0,.25)';x.fillRect(tx-14,ty+48,28,3);
}
const LAMPHIT20={x:384,y:216,w:72,h:96};
/* posição de um ponto do sprite (u,v de 0 a 1) no quarto */
function ptP20(u,v,cx,cy,size,hat){const sz=hat?110:128,ox=(128-sz)/2+(hat?2:0),oy=hat?128-sz-1:0,k=size/128;return[cx-size/2+(ox+u*sz)*k,cy-size/2+(oy+v*sz)*k]}
const FUR20=new WeakMap();
function furOf20(im,hat){if(FUR20.has(im))return FUR20.get(im);let c='#a9c9f6';try{const sz=hat?110:128,ox=(128-sz)/2+(hat?2:0),oy=hat?128-sz-1:0,d=im.getContext('2d').getImageData(Math.round(ox+.40*sz),Math.round(oy+.17*sz),1,1).data;if(d[3]>40)c=`rgb(${d[0]},${d[1]},${d[2]})`}catch(e){}FUR20.set(im,c);return c}
function face20(x,mood,cx,cy,size,eq,im){
  if(!mood||mood==='normal')return;const hat=!!(eq&&eq.ht),k=size/128,glasses=eq&&eq.ac==='oculos',fur=furOf20(im,hat);
  const E=EYE20.map(([u,v])=>ptP20(u,v,cx,cy,size,hat)),M=ptP20(MOUTH20[0],MOUTH20[1],cx,cy,size,hat);
  x.save();x.lineCap='round';x.lineJoin='round';
  const cover=()=>{x.fillStyle=fur;E.forEach(([ex,ey])=>{x.beginPath();x.ellipse(ex,ey,7.2*k,6.4*k,0,0,7);x.fill()})};
  if(!glasses){
    if(mood==='happy'||mood==='purr'){cover();x.strokeStyle='#111';x.lineWidth=2.6*k;E.forEach(([ex,ey])=>{x.beginPath();x.arc(ex,ey+2*k,4.6*k,Math.PI*1.1,Math.PI*1.9);x.stroke()})}
    else if(mood==='sleep'||mood==='tired'){cover();x.strokeStyle='#111';x.lineWidth=2.4*k;E.forEach(([ex,ey])=>{x.beginPath();if(mood==='sleep')x.arc(ex,ey-1.5*k,4.6*k,Math.PI*.15,Math.PI*.85);else{x.moveTo(ex-5*k,ey);x.lineTo(ex+5*k,ey)}x.stroke();if(mood==='tired'){x.fillStyle='#111';x.beginPath();x.arc(ex,ey+2*k,1.8*k,0,Math.PI);x.fill()}})}
    else if(mood==='sad'||mood==='hungry'){cover();x.fillStyle='#111';E.forEach(([ex,ey],i)=>{x.beginPath();x.arc(ex,ey+1*k,2.4*k,0,7);x.fill();x.strokeStyle='#111';x.lineWidth=2*k;x.beginPath();x.moveTo(ex-5*k,ey-(i?3:6)*k);x.lineTo(ex+5*k,ey-(i?6:3)*k);x.stroke()});
      if(mood==='sad'){x.fillStyle='#7cc8ff';x.beginPath();const [tx,ty]=E[0];x.moveTo(tx-2*k,ty+5*k);x.quadraticCurveTo(tx-6*k,ty+12*k,tx-2*k,ty+14*k);x.quadraticCurveTo(tx+2*k,ty+12*k,tx-2*k,ty+5*k);x.fill()}}
  }
  if(mood==='eat'){x.fillStyle='#3a0e14';x.beginPath();x.ellipse(M[0],M[1]+2*k,6*k,5*k,0,0,7);x.fill();x.fillStyle='#e86a7a';x.beginPath();x.ellipse(M[0],M[1]+4.5*k,3.5*k,2*k,0,0,7);x.fill()}
  if(mood==='hungry'){x.fillStyle='#9fd8ff';x.beginPath();x.ellipse(M[0]+5*k,M[1]+8*k,1.8*k,3.2*k,0,0,7);x.fill()}
  if(mood==='purr'||mood==='happy'){x.fillStyle='rgba(255,120,150,.45)';E.forEach(([ex,ey],i)=>{x.beginPath();x.ellipse(ex+(i?6:-6)*k,ey+7*k,4.5*k,2.6*k,0,0,7);x.fill()})}
  if(mood==='dirty'){x.fillStyle='rgba(90,60,30,.55)';[[.25,.62],[.6,.7],[.4,.82],[.7,.5]].forEach(([u,v])=>{const [sx,sy]=ptP20(u,v,cx,cy,size,hat);x.beginPath();x.ellipse(sx,sy,6*k,4*k,.4,0,7);x.fill()});
    x.strokeStyle='rgba(140,200,90,.75)';x.lineWidth=2*k;const t=Date.now()/400;for(let i=0;i<3;i++){const sx=cx+size*.38+i*7*k,sy=cy-size*.2;x.beginPath();for(let j=0;j<5;j++)x.lineTo(sx+Math.sin(t+j+i)*3*k,sy-j*5*k);x.stroke()}}
  x.restore();
}
function moodOf20(){
  if(PS20.sleep)return'sleep';if(PS20.mouth>0)return'eat';if(Date.now()-PS20.purrAt<700)return'purr';
  const b=PET.bars;if(b.e<20)return'tired';if(b.f<25)return'hungry';if(b.h<25)return'dirty';if(b.d<25)return'sad';
  if(petAvg20(PET)>=70)return'happy';return'normal';
}
function bubble20(x,txt,W){
  x.save();x.font='600 14px "IBM Plex Sans",system-ui,sans-serif';const bw=Math.min(W-40,320),words=txt.split(' '),lines=[];let cur='';
  words.forEach(w=>{const t=cur?cur+' '+w:w;if(x.measureText(t).width>bw-24&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);
  const bh=14+lines.length*19,bx=Math.max(12,Math.min(W-bw-12,CX20-bw/2+30)),by=14;
  x.fillStyle='rgba(255,252,240,.97)';x.strokeStyle='#8e3e34';x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(bx,by,bw,bh,10):x.rect(bx,by,bw,bh);x.fill();x.stroke();
  x.beginPath();x.moveTo(CX20-6,by+bh);x.lineTo(CX20+4,by+bh+14);x.lineTo(CX20+14,by+bh);x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,252,240,.97)';x.fillRect(CX20-4,by+bh-3,16,5);
  x.fillStyle='#2a1c14';x.textAlign='left';x.textBaseline='top';lines.forEach((l,i)=>x.fillText(l,bx+12,by+8+i*19));x.restore();
}
function petDraw20(x,t){
  const W=PW20,H=PH20,eq=PET.eq,on=!PS20.sleep;
  drawBg20(x,eq.bg,W,H,t,on);drawLamp20(x,on,t);
  const im=petImg20(eq,-1),mood=moodOf20();
  const breathe=1+Math.sin(t*(PS20.sleep?1.4:2.6))*(PS20.sleep?.02:.012),bo=PS20.bounce>0?Math.sin(PS20.bounce*Math.PI)*-26:0,jit=mood==='purr'?Math.sin(t*60)*1.2:0;
  const cx=CX20+jit,cy=CY20+bo,size=CS20*(mood==='eat'?1.02:1);
  x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(CX20,CY20+size*.47,size*.32*(1+bo/120),12,0,0,7);x.fill();
  if(im){x.save();x.translate(cx,cy+size*.5);x.scale(1/breathe,breathe);x.drawImage(im,-size/2,-size,size,size);x.restore();face20(x,mood,cx,cy+size*.5-size*breathe/2,size*1,eq,im)}
  /* banho: banheira e bolhas presas no pelo */
  if(PS20.mode==='bath'){x.fillStyle='rgba(255,255,255,.92)';x.strokeStyle='#9ab';x.lineWidth=3;x.beginPath();x.ellipse(CX20,CY20+size*.36,size*.48,size*.16,0,0,Math.PI);x.lineTo(CX20-size*.48,CY20+size*.36);x.closePath();x.fill();x.stroke();
    x.fillStyle='rgba(140,200,255,.55)';x.beginPath();x.ellipse(CX20,CY20+size*.36,size*.46,size*.05,0,0,7);x.fill()}
  PS20.bubbles.forEach(b=>{const bx=CX20+b.dx,by=CY20+b.dy,r=b.r*(1+Math.sin(t*3+b.dx)*.06);x.fillStyle='rgba(235,248,255,.78)';x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=1.2;x.beginPath();x.arc(bx,by,r,0,7);x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(bx-r*.35,by-r*.35,r*.22,0,7);x.fill()});
  if(PS20.flying){const f=PS20.flying,k=Math.min(1,f.t/f.d),px=f.from[0]+(f.to[0]-f.from[0])*k,py=f.from[1]+(f.to[1]-f.from[1])*k-Math.sin(k*Math.PI)*90;x.font='34px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillText(f.ico,px,py)}
  if(PS20.sleep){x.fillStyle='rgba(6,6,28,.66)';x.fillRect(0,0,W,H);const mg=x.createRadialGradient(360,88,2,360,88,90);mg.addColorStop(0,'rgba(170,190,255,.18)');mg.addColorStop(1,'rgba(170,190,255,0)');x.fillStyle=mg;x.fillRect(0,0,W,H);
    for(let i=0;i<3;i++){const ph=(t*.45+i/3)%1;x.globalAlpha=1-ph;x.font=`800 ${16+i*6}px "IBM Plex Sans",system-ui,sans-serif`;x.fillStyle='#cfd8ff';x.textAlign='center';x.fillText('Z',CX20+60+ph*40+i*8,CY20-90-ph*60);x.globalAlpha=1}}
  fxDraw20(x,W,H);
  if(PS20.say&&Date.now()<PS20.say.until)bubble20(x,PS20.say.t,W);
  if(PS20.mode==='bath'&&PS20.drag&&PS20.drag.tool){const d=PS20.drag;x.font='38px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillText(d.tool==='shower'?'🚿':d.tool==='sponge'?'🧽':'🧼',d.x,d.y-6)}
}

/* ===================== lógica do quarto ===================== */
const onCat20=(px,py)=>((px-CX20)/(CS20*.42))**2+((py-(CY20+8))/(CS20*.48))**2<=1;
function petStep20(dt){
  const now=Date.now();petDecay20();
  if(PS20.bounce>0)PS20.bounce=Math.max(0,PS20.bounce-dt*2.6);
  if(PS20.mouth>0)PS20.mouth=Math.max(0,PS20.mouth-dt);
  if(PS20.sleep){petGain20('e',dt*1.6);if(PET.bars.e>=100){petWake20(true)}}
  if(PS20.flying){const f=PS20.flying;f.t+=dt;if(f.t>=f.d){PS20.flying=null;petEat20(f.id)}}
  if(PS20.mode==='bath'&&PS20.drag&&PS20.drag.tool==='shower'&&Math.random()<.9)fx20.burst(PS20.drag.x+(Math.random()-.5)*26,PS20.drag.y+10,{n:2,col:['#8fd3ff','#cfefff'],sp:60,life:.5,size:2.2,grav:900,ang:Math.PI/2,spread:.5});
  if(!PS20.sleep&&now>PS20.sayNext&&(!PS20.say||now>PS20.say.until)){const m=moodOf20(),pool=MOODSAY20[m]&&Math.random()<.6?MOODSAY20[m]:LORE20;petSay20(pick12(pool),4200)}
  fxStep20(dt);
  if(PET.bars.f>=90&&PET.bars.h>=90&&PET.bars.d>=90&&PET.bars.e>=90)try{achieve('cuidado')}catch(e){}
}
function petLoop20(now){
  if(!MG.open||MG.view!=='pet'||PS20.tab!=='room'){PS20.raf=0;return}
  PS20.raf=requestAnimationFrame(petLoop20);
  const dt=Math.min(.05,Math.max(0,(now-PS20.last)/1000));PS20.last=now;
  const cv=$('ptCv');if(!cv)return;const x=cv.getContext('2d'),sc=cv.width/PW20;
  try{petStep20(dt);x.setTransform(sc,0,0,sc,0,0);x.clearRect(0,0,PW20,PH20);petDraw20(x,now/1000)}catch(e){console.warn('[T20] quarto',e)}
  if(now-(PS20.uiAt||0)>250){PS20.uiAt=now;petBars20()}
}
function petWake20(natural){
  PS20.sleep=false;fx5('lamp');
  if(natural){PET.st.sleeps++;PET.xp+=6;petSay20('Dormi o suficiente. Acordei renovado!');if(petCd20('sleep',240))petEarn20(3,'',{x:CX20,y:CY20-120});try{achieve('sono')}catch(e){}}
  else{petSay20(pick12(MOODSAY20.wake));petGain20('d',-4)}
  petActs20();petSave20();
}
function petLamp20(){
  if(PS20.mode==='bath'){petSay20('Dormir na banheira? Nem pensar.');return}
  if(PS20.sleep){petWake20(false);return}
  PS20.sleep=true;fx5('lamp');setTimeout(()=>fx5('yawn'),250);PS20.say=null;PS20.mode='';petActs20();petSave20();
}
function petTap20(px,py){
  if(PS20.sleep){petWake20(false);return}
  PS20.bounce=1;fx5('meow');fx20.burst(px,py,{n:6,col:['#ff8fb1','#ffd36b'],kind:'heart',sp:90,life:.8,size:4,grav:-60});
  if(petCd20('tap',4)){petGain20('d',2);PET.xp+=1}
  petSay20(Math.random()<.35&&MOODSAY20[moodOf20()]?pick12(MOODSAY20[moodOf20()]):pick12(LORE20),4200);petSave20();
}
function petStroke20(px,py,dist){
  if(PS20.sleep){if(dist>60){petWake20(false);PS20.pp=null}return}
  PS20.petDist+=dist;const now=Date.now();
  if(now-PS20.purrAt>420){fx5('purr');fx20.burst(px,py-10,{n:2,col:['#ff8fb1','#ff5a8a','#ffd1e0'],kind:'heart',sp:70,life:.9,size:4,grav:-80})}
  PS20.purrAt=now;
  while(PS20.petDist>=28){PS20.petDist-=28;petGain20('d',1.1);PET.st.pet++;PET.xp+=.4;if(PET.st.pet%60===0&&petCd20('pet',25))petEarn20(1,'',{x:px,y:py-30})}
  if(PET.st.pet>=300)try{achieve('carinho')}catch(e){}
  if(Math.random()<.02)petSay20(pick12(MOODSAY20.purr));
  petSave20();
}
function petBathMove20(px,py,dist){
  const d=PS20.drag;if(!d)return;d.x=px;d.y=py;d.acc=(d.acc||0)+dist;
  if(d.tool==='soap'||d.tool==='sponge'){
    if(onCat20(px,py)&&d.acc>=(d.tool==='sponge'?8:12)){d.acc=0;
      if(PS20.bubbles.length<80){PS20.bubbles.push({dx:px-CX20+(Math.random()-.5)*14,dy:py-CY20+(Math.random()-.5)*14,r:(d.tool==='sponge'?7:5)+Math.random()*6});PS20.soaped++;fx5('bubble')}
      if(Math.random()<.4)fx20.burst(px,py,{n:1,kind:'bubble',col:'#fff',sp:30,life:1.4,size:3,grav:-50})}
  }else if(d.tool==='shower'){
    if(Math.random()<.15)fx5('splash');
    const before=PS20.bubbles.length;PS20.bubbles=PS20.bubbles.filter(b=>Math.hypot(CX20+b.dx-px,CY20+b.dy-(py+30))>38);
    const n=before-PS20.bubbles.length;
    if(n){PS20.rinsed+=n;petGain20('h',n*(PS20.soaped>0?1.6:.2));fx20.burst(px,py+30,{n:n*2,kind:'bubble',col:'#fff',sp:80,life:.8,size:2.4,grav:-40})}
    if(!PS20.bubbles.length&&PS20.rinsed>=12){
      PET.st.baths++;PET.xp+=8;petGain20('h',10);PS20.rinsed=0;PS20.soaped=0;fx5('mgWin');
      fx20.burst(CX20,CY20-40,{n:24,kind:'star',col:['#fff','#bfe8ff','#ffd36b'],sp:200,life:1,size:4,grav:120});
      petSay20(pick12(MOODSAY20.clean));if(petCd20('bath',90))petEarn20(3,'',{x:CX20,y:CY20-130});
      if(PET.st.baths>=5)try{achieve('banho')}catch(e){}
      petSave20();
    }
  }
}
function petFeed20(id){
  const f=FOOD20[id];if(!f)return;
  if(PS20.sleep){petSay20('Zzz… (ele está dormindo. Acenda o abajur primeiro.)');return}
  if(PS20.flying)return;
  if(PET.bars.f>=97){petSay20(pick12(MOODSAY20.full));fx5('error');return}
  if(f.p){if(PET.coins<f.p){toast(`🪙 Faltam ${f.p-PET.coins} Óbolos para ${f.n}.`);fx5('error');return}}
  else{const left=(Number(PET.cd['food_'+id])||0)-Date.now();if(left>0){petSay20(`A tigela enche de novo em ${Math.ceil(left/1000)} s.`);return}PET.cd['food_'+id]=Date.now()+f.cd*1000}
  if(f.p){PET.coins-=f.p;fx5('buy20')}
  if(PS20.mode==='bath')PS20.mode='';
  const M=ptP20(MOUTH20[0],MOUTH20[1],CX20,CY20,CS20,!!PET.eq.ht);
  PS20.flying={id,ico:f.ico,t:0,d:.55,from:[CX20+150,PH20-10],to:M};petHeader20();petPanel20();petSave20();
}
function petEat20(id){
  const f=FOOD20[id];if(!f)return;PS20.mouth=.7;fx5('chomp');
  const M=ptP20(MOUTH20[0],MOUTH20[1],CX20,CY20,CS20,!!PET.eq.ht);fx20.burst(M[0],M[1],{n:12,col:['#d9a066','#f2d28a','#fff'],sp:140,life:.6,size:2.6,grav:500});
  const gf=petGain20('f',f.f);petGain20('d',f.d);petGain20('e',f.e);petGain20('h',f.h);
  fx20.float(M[0]+40,M[1]-20,'+'+Math.round(gf)+' 🍖',{col:'#ffd36b',size:18});
  PET.st.feeds++;PET.xp+=3;if(PET.st.feeds>=20)try{achieve('chef')}catch(e){}
  if(Math.random()<.5)petSay20(pick12(['Nham!','Isso tinha gosto de Verdade.','Mais um? Brincadeira. Ou não.','Delícia teosófica.']));
  petSave20();
}

/* ===================== interface ===================== */
const TABS20=[['room','🏠 Quarto'],['shop','🛍️ Loja'],['ach','🏆 Conquistas'],['rank','📊 Ranking']];
function petOpen20(tab){
  arcFree12();
  if(!arcOk12()){toast('Com a call ativa, o Perseus recebe visitas só no ⏸ Intervalo.');return}
  actx();mgJoinCh();sprLoad();mgRootEl().classList.add('show');MG.open=true;document.body.classList.add('mg-on');
  mgLeaveRoom();mgStop();fx20.reset();petLoad20();PS20.tab=tab||PS20.tab||'room';PS20.sayNext=Date.now()+1200;
  petRender20();
}
T3.petOpen=petOpen20;
function petRender20(){
  MG.view='pet';mgTitle('🐱 Perseus');const m=$('mgMain');if(!m)return;petLoad20();
  m.innerHTML=`<div class="pt"><div class="pt-head"><div class="pt-purse" aria-live="polite"><span class="pt-coin" aria-hidden="true">🪙</span><b id="ptCoins">${PET.coins}</b><span>Óbolos</span></div><div class="pt-lvl" id="ptLvl"></div>
    <div class="pt-tabs" role="tablist" aria-label="Seções do Perseus">${TABS20.map(([k,l])=>`<button type="button" role="tab" class="pt-tab${PS20.tab===k?' on':''}" aria-selected="${PS20.tab===k}" data-ptab="${k}">${l}</button>`).join('')}</div></div><div class="pt-body" id="ptBody"></div></div>`;
  $$('[data-ptab]',m).forEach(b=>b.onclick=()=>{PS20.tab=b.dataset.ptab;PS20.mode='';PS20.drag=null;petRender20()});
  petHeader20();
  const body=$('ptBody');
  if(PS20.tab==='shop')body.innerHTML=shopHtml20(),shopBind20();
  else if(PS20.tab==='ach')body.innerHTML=achHtml20(),achBind20();
  else if(PS20.tab==='rank')body.innerHTML=rankHtml20(),rankBind20();
  else roomMount20(body);
}
function petHeader20(){const c=$('ptCoins');if(c&&PET)c.textContent=PET.coins;const l=$('ptLvl');if(l&&PET){const lv=petLvl20(PET),need=40*lv*lv,prev=40*(lv-1)*(lv-1),k=Math.round(100*(PET.xp-prev)/Math.max(1,need-prev));l.innerHTML=`<span>Cuidado <b>Nv ${lv}</b></span><i class="pt-xp"><em style="width:${clamp12(k,0,100)}%"></em></i>`}}
const BARS20=[['f','🍖','Fome','Alimentado'],['h','🧼','Higiene','Limpeza'],['d','🧶','Diversão','Felicidade'],['e','💤','Energia','Disposição']];
function roomMount20(body){
  body.innerHTML=`<div class="pt-room"><div class="pt-stage"><canvas id="ptCv" width="${PW20*2}" height="${PH20*2}" aria-label="Quarto do Perseus. Toque no gato para ele falar, passe o dedo para fazer carinho, toque no abajur para ele dormir."></canvas></div>
    <div class="pt-side"><div class="pt-bars">${BARS20.map(([k,ico,n,s])=>`<div class="pt-bar" data-b="${k}"><span class="pt-bl"><span aria-hidden="true">${ico}</span> ${n}</span><span class="pt-bt" role="meter" aria-label="${n}" aria-valuemin="0" aria-valuemax="100"><em></em></span><b>0%</b></div>`).join('')}</div>
    <div class="pt-acts" id="ptActs"></div><div class="pt-panel" id="ptPanel"></div></div></div>`;
  const cv=$('ptCv'),pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*PW20/r.width,(e.clientY-r.top)*PH20/r.height]};
  cv.addEventListener('pointerdown',e=>{e.preventDefault();actx();try{cv.setPointerCapture(e.pointerId)}catch(x){}const [px,py]=pt(e);
    if(px>=LAMPHIT20.x&&px<=LAMPHIT20.x+LAMPHIT20.w&&py>=LAMPHIT20.y&&py<=LAMPHIT20.y+LAMPHIT20.h){petLamp20();return}
    if(PS20.mode==='bath'){PS20.drag={tool:PS20.tool,x:px,y:py,lx:px,ly:py,acc:0};petBathMove20(px,py,0);return}
    if(onCat20(px,py))PS20.pp={x:px,y:py,lx:px,ly:py,t:Date.now(),dist:0}});
  cv.addEventListener('pointermove',e=>{const [px,py]=pt(e);
    if(PS20.drag){const d=PS20.drag,dd=Math.hypot(px-d.lx,py-d.ly);d.lx=px;d.ly=py;petBathMove20(px,py,dd);return}
    if(PS20.pp){const p=PS20.pp,dd=Math.hypot(px-p.lx,py-p.ly);p.lx=px;p.ly=py;p.dist+=dd;if(p.dist>14&&onCat20(px,py))petStroke20(px,py,dd)}});
  const up=e=>{const [px,py]=pt(e);if(PS20.drag){PS20.drag=null;return}const p=PS20.pp;PS20.pp=null;if(p&&p.dist<14&&Date.now()-p.t<500)petTap20(px,py)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{PS20.pp=null;PS20.drag=null});
  petActs20();petPanel20();petBars20();
  cancelAnimationFrame(PS20.raf);PS20.last=performance.now();PS20.raf=requestAnimationFrame(petLoop20);
}
function petBars20(){
  if(!PET)return;BARS20.forEach(([k])=>{const e=$q(`.pt-bar[data-b="${k}"]`);if(!e)return;const v=Math.round(PET.bars[k]);
    const em=e.querySelector('em');em.style.width=v+'%';e.classList.toggle('low',v<25);e.classList.toggle('mid',v>=25&&v<55);e.querySelector('b').textContent=v+'%';e.querySelector('[role=meter]').setAttribute('aria-valuenow',v)});
  petHeader20();
}
function petActs20(){
  const e=$('ptActs');if(!e)return;const sl=PS20.sleep,ba=PS20.mode==='bath',fd=PS20.mode==='food';
  e.innerHTML=`<button type="button" class="btn pt-act${fd?' on':''}" data-pa="food" ${sl?'disabled':''}>🍖 Cozinha</button><button type="button" class="btn pt-act${ba?' on':''}" data-pa="bath" ${sl?'disabled':''}>🧼 Banho</button><button type="button" class="btn pt-act${sl?' on':''}" data-pa="lamp">${sl?'💡 Acender':'🌙 Apagar abajur'}</button><button type="button" class="btn pt-act" data-pa="arc">🕹 Arcade</button>`;
  $$('[data-pa]',e).forEach(b=>b.onclick=()=>{const a=b.dataset.pa;
    if(a==='lamp')petLamp20();
    else if(a==='arc'){mgHub()}
    else{PS20.mode=PS20.mode===a?'':a;if(a==='bath'&&PS20.mode==='bath'){PS20.tool='soap';petSay20(pick12(MOODSAY20.bath))}if(PS20.mode!=='bath'&&PS20.bubbles.length){PS20.bubbles=[];PS20.soaped=0}petActs20();petPanel20()}});
}
function petPanel20(){
  const e=$('ptPanel');if(!e)return;
  if(PS20.mode==='food'){
    e.innerHTML=`<p class="pt-hint">Toque num prato ou arraste até a boca do Perseus.</p><div class="pt-food">${Object.entries(FOOD20).map(([k,f])=>{const cd=!f.p&&(Number(PET.cd['food_'+k])||0)>Date.now();return`<button type="button" class="pt-fd" data-food="${k}" ${f.p>PET.coins||cd?'aria-disabled="true"':''}><span class="pt-fi" aria-hidden="true">${f.ico}</span><b>${f.n}</b><span class="sub">${f.dsc}</span><span class="pt-price">${f.p?`🪙 ${f.p}`:cd?'⏳ enchendo':'Grátis'}</span></button>`}).join('')}</div>`;
    $$('[data-food]',e).forEach(b=>foodDrag20(b,b.dataset.food));
  }else if(PS20.mode==='bath'){
    e.innerHTML=`<p class="pt-hint">Esfregue o sabonete ou a esponja no Perseus para fazer bolhas. Depois enxágue tudo com o chuveiro.</p><div class="pt-tools" role="radiogroup" aria-label="Ferramenta do banho">${[['soap','🧼','Sabonete'],['sponge','🧽','Esponja'],['shower','🚿','Chuveiro']].map(([k,i,n])=>`<button type="button" role="radio" aria-checked="${PS20.tool===k}" class="pt-tool${PS20.tool===k?' on':''}" data-tool="${k}"><span aria-hidden="true">${i}</span>${n}</button>`).join('')}</div><p class="pt-hint sub" id="ptBathInfo"></p>`;
    $$('[data-tool]',e).forEach(b=>b.onclick=()=>{PS20.tool=b.dataset.tool;petPanel20()});
  }else{
    e.innerHTML=`<p class="pt-hint">${PS20.sleep?'💤 O Perseus está cochilando e recuperando Energia. Toque no abajur para acordá-lo.':'Toque no Perseus para ele falar. Passe o dedo ou o mouse nele para fazer carinho. O abajur ao lado põe ele para dormir.'}</p><p class="pt-hint sub">Mini-games do Arcade também deixam o Perseus feliz e pagam Óbolos.</p>`;
  }
}
function foodDrag20(btn,id){
  let st=null;
  btn.addEventListener('pointerdown',e=>{st={x:e.clientX,y:e.clientY,g:null,id:e.pointerId};try{btn.setPointerCapture(e.pointerId)}catch(x){}});
  btn.addEventListener('pointermove',e=>{if(!st)return;if(!st.g&&Math.hypot(e.clientX-st.x,e.clientY-st.y)>12){st.g=document.createElement('div');st.g.className='pt-ghost';st.g.textContent=FOOD20[id].ico;document.body.append(st.g)}
    if(st.g){st.g.style.left=e.clientX+'px';st.g.style.top=e.clientY+'px'}});
  const end=e=>{if(!st)return;const s=st;st=null;if(s.g){s.g.remove();const cv=$('ptCv');if(cv){const r=cv.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)petFeed20(id)}}else if(e.type==='pointerup')petFeed20(id)};
  btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);
  btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();petFeed20(id)}});
}

/* ===================== 🛍️ Loja de Visual ===================== */
function owned20(cat,k){return!!PET.own[cat]?.[k]}
function shopHtml20(){
  const sec=cat=>{const S=SHOP20[cat];return`<section class="pt-shop-sec"><h3>${S.t}</h3><div class="pt-shop">${Object.entries(S.items).map(([k,it])=>{const own=owned20(cat,k),eq=PET.eq[cat]===k;
    return`<article class="pt-item${eq?' eq':''}"><canvas class="pt-prev" width="160" height="${cat==='bg'?110:160}" data-prev="${cat}|${k}" aria-hidden="true"></canvas><div class="pt-itx"><b>${it.ico} ${esc(it.n)}</b><span class="sub">${esc(it.d)}</span></div>
      <button type="button" class="btn small ${own?'':'primary'}" data-buy="${cat}|${k}" ${!own&&it.p>PET.coins?'aria-disabled="true"':''}>${eq?(cat==='ht'||cat==='ac'?'Tirar':'✓ Equipado'):own?'Equipar':`Comprar · 🪙 ${it.p}`}</button></article>`}).join('')}</div></section>`};
  return`<div class="pt-shopwrap"><p class="pt-hint">Gaste Óbolos em visuais para o seu Perseus. A pelagem e o chapéu aparecem no seu gato dentro dos mini-games.</p>${['sk','ht','ac','bg'].map(sec).join('')}</div>`;
}
function shopBind20(){
  $$('[data-prev]').forEach(cv=>{const [cat,k]=cv.dataset.prev.split('|'),x=cv.getContext('2d');
    if(cat==='bg'){x.save();x.scale(160/PW20,110/PH20*1.0);drawBg20(x,k,PW20,PH20,1,true);x.restore();const im=petImg20(PET.eq,-1);if(im)x.drawImage(im,48,30,64,64);return}
    const eq={...PET.eq,[cat]:k};const draw=()=>{const im=petImg20(eq,-1);x.clearRect(0,0,160,160);if(im)x.drawImage(im,8,8,144,144)};if(SPR.ok)draw();else setTimeout(draw,400)});
  $$('[data-buy]').forEach(b=>b.onclick=()=>{const [cat,k]=b.dataset.buy.split('|'),it=SHOP20[cat].items[k];
    if(!owned20(cat,k)){if(PET.coins<it.p){toast(`🪙 Faltam ${it.p-PET.coins} Óbolos para ${it.n}.`);fx5('error');return}
      PET.coins-=it.p;PET.own[cat][k]=1;PET.st.buys++;PET.eq[cat]=k;fx5('buy20');toast(`🛍️ ${it.n} é seu! Já está equipado.`);
      const bought=['sk','ht','ac','bg'].reduce((n,c)=>n+Object.keys(PET.own[c]).filter(q=>SHOP20[c].items[q]?.p>0).length,0);if(bought>=5)try{achieve('estilo')}catch(e){}}
    else if(PET.eq[cat]===k){if(cat==='ht'||cat==='ac')PET.eq[cat]=''}else{PET.eq[cat]=k;fx5('confirm')}
    petSave20(true);petRender20()});
}

/* ===================== 🏆 Conquistas ===================== */
Object.assign(ACH,{
  banho:{ico:'🛁',n:'Gato Cheiroso',d:'Dê 5 banhos completos no Perseus (bolhas e enxágue).'},
  chef:{ico:'🍖',n:'Chef do Véu',d:'Alimente o Perseus 20 vezes.'},
  carinho:{ico:'💜',n:'Ronronar Eterno',d:'Faça muito carinho: 300 afagos no Perseus.'},
  sono:{ico:'💤',n:'Guardião do Sono',d:'Deixe o Perseus dormir até a Energia encher.'},
  cuidado:{ico:'🐱',n:'Melhor Amigo',d:'Deixe as 4 barras do Perseus acima de 90%.'},
  estilo:{ico:'🎩',n:'Fashionista Astral',d:'Compre 5 itens na Loja de Visual.'},
  rico:{ico:'🪙',n:'Tesouro de Óbolos',d:'Junte 500 Óbolos de uma vez.',secret:true},
  sudoku:{ico:'🔢',n:'Mente Teosófica',d:'Resolva um Sudoku Teosófico no Difícil ou no Pesadelo.'},
  corredor:{ico:'🦖',n:'Corredor do Vazio',d:'Corra 1500 m no Corredor do Vazio.'},
  blast:{ico:'🧱',n:'Explosão Astral',d:'Faça um combo x4 no Block Blast Astral.'},
});
const REW20={gato:80,inabalavel:100,mente:80,dedo:60,rico:60,guardiao:50,ascensao:40,asas:40,combo:40,cuidado:40,sudoku:40,corredor:40,blast:40,vicio:50,estilo:30};
const achRew20=k=>REW20[k]||25;
const stA20=k=>{arcLoad();return Number(ARC.stats[k])||0};
const PROG20={
  vicio:()=>[stA20('played'),25],dedo:()=>[stA20('clicks'),1000],asas:()=>[PET?.best?.voo||0,20],ascensao:()=>[PET?.best?.salto||0,2000],
  banho:()=>[PET?.st.baths||0,5],chef:()=>[PET?.st.feeds||0,20],carinho:()=>[PET?.st.pet||0,300],corredor:()=>[PET?.best?.runner||0,1500],
  estilo:()=>[['sk','ht','ac','bg'].reduce((n,c)=>n+Object.keys(PET?.own?.[c]||{}).filter(q=>SHOP20[c].items[q]?.p>0).length,0),5],
  rico:()=>[PET?.coins||0,500],cuidado:()=>[Math.min(...['f','h','d','e'].map(k=>Math.round(PET?.bars[k]||0))),90],
};
/* toda conquista nova paga Óbolos (uma vez só por conquista) */
const _ach20=achieve;
achieve=function(id){const r=_ach20.apply(this,arguments);if(r){try{petLoad20();if(!PET.paid[id]){PET.paid[id]=1;petEarn20(achRew20(id),'conquista '+(ACH[id]?.n||''))}}catch(e){}}return r};
T3.achieve=achieve;
achOpen=function(){petOpen20('ach')};
function achHtml20(){
  arcLoad();const keys=Object.keys(ACH),got=keys.filter(k=>ARC.ach[k]),earned=got.reduce((n,k)=>n+achRew20(k),0),f=PS20.achF,V=PS20.achV||'vitrine';
  const list=keys.filter(k=>f==='all'||(f==='got'?ARC.ach[k]:!ARC.ach[k])).sort((a,b)=>(!!ARC.ach[b]-!!ARC.ach[a])||((PROG20[b]?.()[0]/PROG20[b]?.()[1]||0)-(PROG20[a]?.()[0]/PROG20[a]?.()[1]||0)));
  const info=k=>{const a=ACH[k],ok=!!ARC.ach[k],hide=!!a.secret&&!ok,pr=!ok&&!hide&&PROG20[k]?PROG20[k]():null,pc=pr?clamp12(Math.floor(100*pr[0]/pr[1]),0,99):ok?100:0;return{a,ok,hide,pr,pc}};
  const selK=PS20.achSel&&ACH[PS20.achSel]?PS20.achSel:(got[got.length-1]||keys[0]);
  const pct=Math.round(100*got.length/Math.max(1,keys.length));
  const sum=`<div class="pt-achsum"><div class="pt-ring" style="--p:${pct}" role="meter" aria-label="Conquistas desbloqueadas" aria-valuenow="${got.length}" aria-valuemin="0" aria-valuemax="${keys.length}"><span><b>${got.length}</b><small>de ${keys.length}</small></span></div><div class="pt-achtx"><b>${pct}% da coleção</b><span class="sub">🪙 ${earned} Óbolos ganhos com conquistas</span></div></div>`;
  const filt=`<div class="pt-filt pt-filt2" role="radiogroup" aria-label="Filtrar conquistas">${[['all','Todas'],['got','Desbloqueadas'],['lock','Bloqueadas']].map(([k,l])=>`<button type="button" role="radio" aria-checked="${f===k}" class="pt-chip${f===k?' on':''}" data-achf="${k}">${l}</button>`).join('')}<span class="pt-spacer" aria-hidden="true"></span>${[['vitrine','🏅 Vitrine'],['lista','📋 Lista']].map(([k,l])=>`<button type="button" role="radio" aria-checked="${V===k}" class="pt-chip${V===k?' on':''}" data-achv="${k}">${l}</button>`).join('')}</div>`;
  const medal=k=>{const I=info(k);return`<button type="button" class="pt-medal${I.ok?' got':''}${I.hide?' secret':''}${selK===k?' on':''}" data-achsel="${k}" aria-pressed="${selK===k}" aria-label="${I.hide?'Conquista secreta':esc(I.a.n)}${I.ok?' (desbloqueada)':' (bloqueada)'}"><span class="pt-mwrap"><span class="pt-mico" aria-hidden="true">${I.hide?'❔':I.a.ico}</span>${I.ok?'':'<span class="pt-lock" aria-hidden="true">🔒</span>'}</span><span class="pt-mname">${I.hide?'???':esc(I.a.n)}</span>${I.pr?`<i class="pt-mbar" aria-hidden="true"><em style="width:${I.pc}%"></em></i>`:''}</button>`};
  const I=info(selK),det=`<div class="pt-detail${I.ok?' got':''}" aria-live="polite"><div class="pt-dico" aria-hidden="true">${I.hide?'❔':I.a.ico}</div><div class="pt-dtx"><small>${I.ok?'🏆 Desbloqueada em '+new Date(ARC.ach[selK]).toLocaleDateString('pt-BR'):I.hide?'Conquista secreta':'🔒 Ainda bloqueada'}</small><b>${I.hide?'Conquista secreta':esc(I.a.n)}</b><span class="sub">${I.hide?'Descubra jogando.':esc(I.a.d)}</span>${I.pr?`<span class="pt-acprog" role="meter" aria-label="Progresso" aria-valuenow="${I.pc}" aria-valuemin="0" aria-valuemax="100"><em style="width:${I.pc}%"></em></span><span class="pt-acn">${Math.min(I.pr[0],I.pr[1]).toLocaleString('pt-BR')} / ${I.pr[1].toLocaleString('pt-BR')}</span>`:''}</div><span class="pt-rew">🪙 ${achRew20(selK)}<span class="sub">${I.ok?'recebidos':'ao desbloquear'}</span></span></div>`;
  const body=!list.length?'<p class="pt-hint">Nenhuma conquista neste filtro.</p>':V==='vitrine'
    ?`<div class="pt-case" role="group" aria-label="Vitrine de conquistas">${list.map(medal).join('')}</div>`
    :`<ul class="pt-achgrid">${list.map(k=>{const I=info(k);return`<li class="pt-ac${I.ok?' got':''}"><span class="pt-acico" aria-hidden="true">${I.ok?I.a.ico:I.hide?'❔':'🔒'}</span><div class="pt-actx"><b>${I.hide?'Conquista secreta':esc(I.a.n)}</b><span class="sub">${I.hide?'Descubra jogando.':esc(I.a.d)}</span>${I.pr?`<span class="pt-acprog" role="meter" aria-label="Progresso" aria-valuenow="${I.pc}" aria-valuemin="0" aria-valuemax="100"><em style="width:${I.pc}%"></em></span><span class="pt-acn">${Math.min(I.pr[0],I.pr[1]).toLocaleString('pt-BR')} / ${I.pr[1].toLocaleString('pt-BR')}</span>`:''}</div><span class="pt-rew">${I.ok?`<span class="pt-trophy" aria-hidden="true">🏆</span><span class="sub">${new Date(ARC.ach[k]).toLocaleDateString('pt-BR')}</span>`:`🪙 ${achRew20(k)}`}</span></li>`}).join('')}</ul>`;
  return`<div class="pt-ach">${sum}${filt}${V==='vitrine'&&list.length?det:''}${body}</div>`;
}
function achBind20(){$$('[data-achf]').forEach(b=>b.onclick=()=>{PS20.achF=b.dataset.achf;petRender20()});$$('[data-achv]').forEach(b=>b.onclick=()=>{PS20.achV=b.dataset.achv;petRender20()});$$('[data-achsel]').forEach(b=>b.onclick=()=>{PS20.achSel=b.dataset.achsel;petRender20()})}
function achRender20(){if(MG.view==='pet'&&PS20.tab==='ach'){const b=$('ptBody');if(b){b.innerHTML=achHtml20();achBind20()}}}
{const _ar20=achRender;achRender=function(){try{_ar20()}catch(e){}achRender20()}}

/* ===================== 📊 Ranking da Mesa ===================== */
function rankRows20(){
  petLoad20();const me=uid3(),rows=[];
  (chars3()||[]).filter(c=>c.ownerId&&!gmChar6(c)).forEach(c=>{const d=d14(c),p=c.ownerId===me?PET:(d.perseus||null);
    rows.push({u:c.ownerId,n:nm(c)||d.name||'?',ap:Math.round(p?.ap||0),lv:p?petLvl20(p):0,avg:p?petAvg20(p):0,ach:Object.keys(d.achievements||{}).filter(k=>ACH[k]).length,me:c.ownerId===me,has:!!p})});
  if(!rows.some(r=>r.me)){arcLoad();rows.push({u:me,n:mgName(),ap:Math.round(PET.ap||0),lv:petLvl20(PET),avg:petAvg20(PET),ach:Object.keys(ARC.ach||{}).filter(k=>ACH[k]).length,me:true,has:true})}
  rows.forEach(r=>{r.care=r.lv*10+Math.round(r.avg/10);r.total=r.ap+r.care*5+r.ach*20});
  const s=PS20.rkSort;rows.sort((a,b)=>(b[s]-a[s])||(b.total-a.total));return rows;
}
function rankHtml20(){
  const rows=rankRows20(),mx=k=>Math.max(1,...rows.map(r=>r[k]));
  const head=[['total','Geral'],['ap','🕹 Mini-games'],['care','🐱 Cuidado'],['ach','🏆 Conquistas']];
  return`<div class="pt-rank"><div class="pt-filt" role="radiogroup" aria-label="Ordenar ranking">${head.map(([k,l])=>`<button type="button" role="radio" aria-checked="${PS20.rkSort===k}" class="pt-chip${PS20.rkSort===k?' on':''}" data-rks="${k}">${l}</button>`).join('')}</div>
    <ol class="pt-rk">${rows.map((r,i)=>`<li class="${r.me?'me':''}"><span class="pt-pos">${i<3?['🥇','🥈','🥉'][i]:i+1}</span><div class="pt-rkn"><b>${esc(r.n)}${r.me?' <span class="sub">(você)</span>':''}</b>${r.has?'':'<span class="sub">Ainda não visitou o Perseus</span>'}</div>
      <div class="pt-rkc"><span title="Pontos do Arcade">🕹 <b>${r.ap.toLocaleString('pt-BR')}</b></span><i class="pt-rkb"><em style="width:${Math.round(100*r.ap/mx('ap'))}%"></em></i></div>
      <div class="pt-rkc"><span title="Nível de cuidado com o Perseus">🐱 <b>Nv ${r.lv}</b> · ${r.avg}%</span><i class="pt-rkb care"><em style="width:${Math.round(100*r.care/mx('care'))}%"></em></i></div>
      <div class="pt-rkc"><span title="Conquistas">🏆 <b>${r.ach}</b></span><i class="pt-rkb ach"><em style="width:${Math.round(100*r.ach/Math.max(1,Object.keys(ACH).length))}%"></em></i></div></li>`).join('')}</ol>
    <p class="pt-hint sub">Pontos do Arcade: 10 por partida, +15 por vitória e +10 por recorde pessoal. Cuidado sobe com comida, banho, carinho e cochilos.</p>
    <div class="mg-board" id="mgBoardHub"></div></div>`;
}
function rankBind20(){$$('[data-rks]').forEach(b=>b.onclick=()=>{PS20.rkSort=b.dataset.rks;petRender20()});boardRender()}

/* ===================== ligação com o Arcade e o Intervalo ===================== */
/* fim de partida: Óbolos, pontos do ranking, recorde pessoal e diversão */
const _mso20=mgShowOver;
mgShowOver=function(res){
  const out=_mso20.apply(this,arguments);
  try{const r=MG.room,mine=(res.rows||[]).find(q=>q.u===uid3());
    if(r&&mine){petLoad20();const g=r.g,s=Number(mine.s)||0,rec=s>0&&s>(Number(PET.best[g])||0);
      if(rec)PET.best[g]=s;const zero=s<=0&&!mine.w,pts=zero?2:10+(mine.w?15:0)+(rec?10:0);PET.ap=(PET.ap||0)+pts;PET.st.games++;
      petGain20('d',zero?4:12);petGain20('e',-5);petGain20('f',-3);
      const coins=zero?1:4+(mine.w?6:0)+(rec?5:0);petEarn20(coins,mine.w?'vitória no Arcade':rec?'recorde pessoal':'partida no Arcade');
      petSave20(true);
      const e=$('mgOver')?.querySelector('.mg-ocard h3');if(e&&!e.parentElement.querySelector('.pt-earn'))e.insertAdjacentHTML('afterend',`<p class="pt-earn">🪙 +${coins} Óbolos · 🕹 +${pts} pontos${rec?' · recorde pessoal!':''}</p>`);
    }}catch(e){console.warn('[T20] fim de partida',e)}
  return out;
};
const _mgc20=mgClose;
mgClose=function(){cancelAnimationFrame(PS20.raf);PS20.raf=0;if(PET&&PS20.sleep)PS20.sleep=false;PS20.mode='';PS20.bubbles=[];if(PET)petSave20(true);return _mgc20.apply(this,arguments)};
T3.mgClose=mgClose;
/* botão do Perseus no Intervalo, ao lado do Arcade */
const _mpu20=mgPauseUi;
mgPauseUi=function(){_mpu20.apply(this,arguments);const box=$('mgPauseBox');if(box&&!$('ptOpenBtn')){const b=document.createElement('button');b.type='button';b.id='ptOpenBtn';b.className='btn pt-openbtn';b.innerHTML='<span aria-hidden="true">🐱</span> Visitar o Perseus';b.onclick=()=>petOpen20('room');box.insertBefore(b,$('mgOpenBtn').nextSibling)}};
/* no Arcade: o botão de Conquistas vira o do Perseus */
const _hub20=mgHub;
mgHub=function(){
  cancelAnimationFrame(PS20.raf);PS20.raf=0;PS20.mode='';
  const out=_hub20.apply(this,arguments);
  try{const a=$('mgAchBtn');if(a){a.innerHTML='🐱 Perseus · 🏆 Conquistas · 📊 Ranking';a.onclick=()=>petOpen20('ach');const p=document.createElement('button');p.type='button';p.className='btn small pt-hubbtn';p.id='ptHubBtn';petLoad20();p.innerHTML=`🐱 Visitar o Perseus · 🪙 ${PET.coins}`;p.onclick=()=>petOpen20('room');a.before(p)}}catch(e){}
  return out;
};
/* mgBack a partir do Perseus volta ao Arcade */
const _mgb20=mgBack;mgBack=function(){if(MG.view==='pet'){mgHub();return}return _mgb20.apply(this,arguments)};
T3.mgBack=mgBack;
T3.sprOf=ci=>spr(ci);

