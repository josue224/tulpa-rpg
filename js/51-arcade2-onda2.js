/* ===================================================================
   TULPA · ETAPA 40 — 🕹 ARCADE 2.0 · ONDA 2 (parte 1)
   🦖 CORREDOR DO VAZIO 2.0
   Biomas a cada 1000 m (Planície da Fé → Floresta da Natureza → Abismo
   da Inexistência → Espelho de Ilusão → Salão da Verdade, e repete) com
   paleta, clima e obstáculos próprios, além do dia e da noite.
   Pulo com altura variável (solte cedo = pulo curto), pulo duplo,
   agachar / queda rápida no ar e Dash curto com recarga (atravessa
   obstáculos pequenos). Fendas no chão, plataformas elevadas, voadores
   em duas alturas, Escudo de Fé, Ímã de Óbolos e Câmera Lenta de
   Verdade. A cada 1000 m um mini-chefe do bioma persegue e dispara.
   Tudo sai da semente: na Mesa todos correm a mesma pista.
   =================================================================== */
const RN40={W:800,H:320,GY:262,CX:118,G:2300,JV:-760,PLH:84,FIRE:650,M:40,BZ:450,BIO:1000};
const RNB40=[
  {n:'Planície da Fé',ico:'🕯',day:'f6ecd2',dink:'3a2a20',dsoft:'d9c79a',night:'120d22',nink:'e6dcff',nsoft:'3b3160',sun:'#f2b310',deco:'hills',fx:'rays',w:{cris:5,totem:2,fly:1,gap:0,plat:2},boss:{n:'Cervo Solar',ico:'🦌',c:'#ffd36b'}},
  {n:'Floresta da Natureza',ico:'🌿',day:'dcefd0',dink:'1f3a22',dsoft:'9cc48e',night:'08160c',nink:'cfeedd',nsoft:'1f4a2c',sun:'#e8d36b',deco:'trees',fx:'leaves',w:{cris:4,totem:1,fly:3,gap:2,plat:2},boss:{n:'Espantalho de Raízes',ico:'🌾',c:'#7dffa8'}},
  {n:'Abismo da Inexistência',ico:'🕳',day:'d3cce0',dink:'241a3a',dsoft:'8d82a8',night:'07060d',nink:'d9cfff',nsoft:'2a2440',sun:'#b9a6ff',deco:'abyss',fx:'void',w:{cris:3,totem:2,fly:2,gap:4,plat:3},boss:{n:'Eco Faminto',ico:'👄',c:'#b9a6ff'}},
  {n:'Espelho de Ilusão',ico:'🪞',day:'f2dff4',dink:'3a1240',dsoft:'c99ad0',night:'150a24',nink:'f0d6ff',nsoft:'3a1650',sun:'#ff9be0',deco:'mirror',fx:'shards',w:{cris:3,totem:2,fly:4,gap:2,plat:2},boss:{n:'Mancha Pareidólica',ico:'👁',c:'#ff9be0'}},
  {n:'Salão da Verdade',ico:'⚖',day:'dcecf2',dink:'0f2a36',dsoft:'8fb6c4',night:'061a22',nink:'d6f3ff',nsoft:'13495a',sun:'#7fe3ff',deco:'pillars',fx:'lanterns',w:{cris:3,totem:3,fly:3,gap:3,plat:2},boss:{n:'Juiz de Cera',ico:'🕯',c:'#7fe3ff'}},
];
const rnBio40=d=>Math.floor(d/RN40.M/RN40.BIO)%RNB40.length;
function rnLevel40(seed,gd,d0=0){
  const R=RN40,li=GD12[gd]??1,V0=[300,340,380,420][li],AC=[8,10,12.5,15][li],VM=[680,800,920,1040][li],FLYK=[.6,.85,1,1.2][li],PV=[110,150,190,230][li];
  const vAt=d=>Math.min(VM,Math.sqrt(V0*V0+2*AC*d));
  const bossOf=x=>{const m=x/R.M,k=Math.floor(m/1000);return k>=1&&m-k*1000<R.BZ?k:0};
  const OB=[];
  function ob(i){
    while(OB.length<=i){
      const j=OB.length,r=k=>hrand(seed,j,k),prev=OB[j-1];const px=prev?prev.x+prev.w:d0+700,v=vAt(px);
      let x=px+v*(.62+r(1)*.95)+150+(j<3?260:0),o;
      const bk=bossOf(x);
      if(bk){const z0=(bk*1000)*R.M;if(!prev||prev.k!=='proj')x=Math.max(x,z0+v*1.6);
        const t=['low','high','wave'][Math.floor(r(2)*3)];
        o={x,i:j,k:'proj',pk:t,w:t==='wave'?40:24,h:t==='wave'?22:20,y:t==='high'?R.GY-60:t==='low'?R.GY-16:R.GY-11,boss:bk};
        OB.push(o);continue}
      if(prev&&prev.k==='proj'&&!bk)x=Math.max(x,prev.x+v*1.4);
      const B=RNB40[rnBio40(x)],wt={...B.w};wt.fly*=FLYK;if(j<4){wt.totem=0;wt.fly=0;wt.gap=0;wt.plat=0}
      const ks=Object.keys(wt),tot=ks.reduce((a,k)=>a+wt[k],0);let q=r(2)*tot,kind='cris';for(const k of ks){q-=wt[k];if(q<=0){kind=k;break}}
      if(kind==='fly'){const hi=r(3)<.5?'low':'mid';o={x,i:j,k:'fly',w:46,h:26,y:hi==='low'?R.GY-24:R.GY-50,hi}}
      else if(kind==='totem')o={x,i:j,k:'totem',w:30,h:66};
      else if(kind==='gap')o={x,i:j,k:'gap',w:Math.max(70,Math.min(330,v*(.28+r(4)*.17))),h:0};
      else if(kind==='plat'){const w=180+r(4)*120;o={x,i:j,k:'plat',w,h:0,g0:x+30,g1:x+w-30}}
      else{const n=1+Math.floor(r(4)*(gd==='facil'?2:3));o={x,i:j,k:'cris',n,w:18*n+(n-1)*4,h:30+Math.floor(r(6)*20)}}
      const pr=r(7);
      if(o.k==='plat')o.orb={dx:o.w*.35,dy:-R.PLH-34,n:4};
      else o.orb=pr<.42?{dx:-(x-px)*.5,dy:-60-Math.floor(r(8)*60),n:3+Math.floor(r(9)*3)}:null;
      o.pw=j>10&&r(10)<.1?{k:['sh','mag','sl'][Math.floor(r(11)*3)],dx:-(x-px)*.42,dy:-70}:null;
      OB.push(o);
    }
    return OB[i];
  }
  return{seed,gd,li,vAt,ob,bossOf,PV,d0};
}
const rnSt040=(d0=0)=>({d:d0,d0,y:0,vy:0,t:0,gnd:true,dj:0,dk:false,dash:0,dcd:0,sh:0,mag:0,slow:0,inv:0,orbs:0,taken:{},pwt:{},pf:{},ph:{},phN:0,boss:{},bossN:0,dead:false,ev:'',i0:0,fellIn:false});
const rnClone40=S=>({...S,taken:{...S.taken},pwt:{...S.pwt},pf:{...S.pf},ph:{...S.ph},boss:{...S.boss}});
const rnProjX40=(L,S,o)=>o.i in S.pf?o.x-L.PV*(S.t-S.pf[o.i]):o.x;
function rnStep40(L,S,inp,dt){
  if(S.dead)return;const R=RN40;S.ev='';
  S.t+=dt;S.inv=Math.max(0,S.inv-dt);S.slow=Math.max(0,S.slow-dt);S.mag=Math.max(0,S.mag-dt);S.dash=Math.max(0,S.dash-dt);S.dcd=Math.max(0,S.dcd-dt);
  const v=L.vAt(S.d)*(S.slow>0?.6:1);S.d+=v*dt;
  if(inp.dash&&S.dcd<=0){S.dash=.28;S.dcd=2.6;S.ev='dash'}
  if(inp.jump){if(S.gnd){S.vy=R.JV;S.gnd=false;S.ev='jump'}else if(!S.dj){S.vy=R.JV*.85;S.dj=1;S.ev='dj'}}
  if(!inp.hold&&S.vy<-320)S.vy=-320;
  S.dk=!!inp.duck;
  S.vy+=R.G*(S.dk&&!S.gnd?2.6:1)*dt;
  const py=S.y;S.y+=S.vy*dt;
  while(L.ob(S.i0).x+L.ob(S.i0).w<S.d-300)S.i0++;
  let over=false,onPlat=false;
  for(let i=Math.max(0,S.i0-1);i<S.i0+6;i++){const o=L.ob(i);
    if(o.k==='gap'&&S.d-10>o.x&&S.d+10<o.x+o.w)over=true;
    if(o.k==='plat'){if(S.d-10>o.g0&&S.d+10<o.g1)over=true;
      if(S.d+14>=o.x&&S.d-14<=o.x+o.w&&S.vy>=0&&py<=-R.PLH+2&&S.y>=-R.PLH){S.y=-R.PLH;S.vy=0;onPlat=true}
      else if(Math.abs(S.y+R.PLH)<1&&S.vy===0&&S.d+14>=o.x&&S.d-14<=o.x+o.w)onPlat=true}}
  S.gnd=false;
  if(onPlat){S.gnd=true}
  else if(!over&&S.y>=0){if(py>6){S.dead=true;S.ev='fall';return}S.y=0;S.vy=Math.min(S.vy,0);S.gnd=true}
  else if(over&&S.y>46){if(S.sh>0){S.sh--;S.inv=1.2;S.vy=R.JV*1.18;S.dj=0;S.ev='shield'}else{S.dead=true;S.ev='fall';return}}
  if(S.gnd)S.dj=0;
  /* obstáculos e tiros */
  const box=S.dk&&S.gnd?{x0:S.d-26,x1:S.d+26,y0:R.GY+S.y-28,y1:R.GY+S.y}:{x0:S.d-18,x1:S.d+18,y0:R.GY+S.y-50,y1:R.GY+S.y};const pad=6;
  for(let i=Math.max(0,S.i0-1);i<S.i0+6;i++){const o=L.ob(i);
    if(o.k==='proj'&&!(o.i in S.pf)&&S.d>=o.x-R.FIRE){S.pf[o.i]=S.t;S.ev=S.ev||'fire'}
    if(o.k==='cris'||o.k==='totem'||o.k==='fly'||o.k==='proj'){
      const ox=o.k==='proj'?rnProjX40(L,S,o):o.x,oy=o.k==='fly'||o.k==='proj'?o.y-o.h/2:R.GY-o.h;
      if(box.x0+pad<ox+o.w&&box.x1-pad>ox&&box.y0+pad<oy+o.h&&box.y1>oy+pad){
        const small=o.k==='fly'||o.k==='proj'||(o.k==='cris'&&o.n<=2);
        if(S.dash>0&&small){if(!S.ph[i]){S.ph[i]=1;S.phN++;S.ev='phase'}continue}
        if(S.inv>0||S.ph[i])continue;
        if(S.sh>0){S.sh--;S.inv=1.2;S.ev='shield';continue}
        S.dead=true;S.ev='hit';return}}
    if(o.orb)for(let k=0;k<o.orb.n;k++){const key=i*10+k;if(S.taken[key])continue;const qx=o.x+o.orb.dx+k*28,qy=R.GY+o.orb.dy-Math.sin(k/(o.orb.n-1||1)*Math.PI)*20;
      const dx=qx-S.d,dy=qy-(R.GY+S.y-26);if((Math.abs(dx)<26&&Math.abs(dy)<34)||(S.mag>0&&Math.abs(dx)<170&&Math.abs(dy)<140)){S.taken[key]=1;S.orbs++;S.ev=S.ev||'orb'}}
    if(o.pw&&!S.pwt[i]){const qx=o.x+o.pw.dx,qy=R.GY+o.pw.dy;if(Math.abs(qx-S.d)<28&&Math.abs(qy-(R.GY+S.y-26))<38){S.pwt[i]=o.pw.k;
      if(o.pw.k==='sh')S.sh=1;else if(o.pw.k==='mag')S.mag=8;else S.slow=5;S.ev='pw:'+o.pw.k}}
  }
  const m=S.d/R.M,k=Math.floor(m/1000);if(k>=1&&m-k*1000>=R.BZ&&!S.boss[k]){S.boss[k]=1;S.bossN++;S.ev='boss'}
}
T3.rn40={level:rnLevel40,step:rnStep40,st0:rnSt040,clone:rnClone40,biomes:RNB40,K:RN40};
function rnProg40(){const p=prog38().rn||{};return{reach:p.reach||0,best:p.best||0,bosses:p.bosses||0}}

const rnSetup40={
  intro:o=>o._m==='mesa'?'Todos correm a mesma pista e os colegas aparecem como fantasmas. Vence quem for mais longe.':'Os biomas mudam a cada 1000 m, e o mini-chefe de cada bioma persegue você na entrada. Chegou num bioma, pode começar nele da próxima vez.',
  def:()=>({b:'0'}),
  fields:o=>{const p=rnProg40(),mesa=o._m==='mesa';return[{k:'b',l:'Começar em',wide:1,opts:RNB40.map((B,i)=>{const lock=!mesa&&i>p.reach;return{v:String(i),n:B.n,ico:B.ico,d:lock?`Chegue até aqui correndo (${i*RN40.BIO} m).`:i?`Começa em ${i*RN40.BIO} m, já rápido. Chefe: ${B.boss.n}.`:`Chefe: ${B.boss.n}.`,lock}})}]},
  fix:o=>{let b=Math.max(0,Math.min(4,+o.b||0));if(o._m!=='mesa')b=Math.min(b,rnProg40().reach);o.b=String(b)},
  sum:o=>`Espaço, ↑ ou W: pula (segure para ir mais alto, no ar pula de novo) · ↓ ou S: agacha e cai rápido · Shift, E ou →: Dash, que atravessa cristais pequenos, voadores e tiros.${rnProg40().best?` Seu recorde: ${rnProg40().best} m.`:''}`
};

/* ---------- 🎨 arte do Corredor (GFX60) · SOMENTE VISUAL ----------
   Direção: teatro de silhuetas pintadas, um palco por bioma, com versões
   de dia e de noite. Nada aqui lê ou consome a semente da corrida.
   sky/far/mid/near = [dia, noite]. */
const RNART40=[
  {sky:[['#d9663f','#f5ad66','#fde3ac'],['#0d0920','#2a1742','#74324e']],far:['#d9906c','#34204c'],mid:['#ab5c4c','#231538'],near:['#7a3c40','#160b24'],ground:['#8a5540','#2c1618'],lip:'#ffcf6a',acc:'#ffd36b',cry:'#e0502f',amb:'poeira',ambc:'#fff2c4'},
  {sky:[['#4fa6a8','#a6dcbe','#eaf6d0'],['#030d0e','#0c2e26','#245c46']],far:['#7cb89c','#143e32'],mid:['#488a66','#0d2a1e'],near:['#275c3c','#061810'],ground:['#6a4c36','#1c120c'],lip:'#8be070',acc:'#7dffa8',cry:'#14924e',amb:'folhas',ambc:'#4faf4a'},
  {sky:[['#7268a4','#b2a6d0','#e6dfee'],['#030208','#150d2c','#3c2866']],far:['#9c8ec2','#251c48'],mid:['#6a5a9a','#191134'],near:['#3c3062','#0b0818'],ground:['#43336e','#0e0a1e'],lip:'#c4b2ff',acc:'#b9a6ff',cry:'#6236cc',amb:'motes',ambc:'#b9a6ff'},
  {sky:[['#a964c6','#eaa6dc','#fde2ee'],['#10061c','#3e114c','#964082']],far:['#d49ad6','#401756'],mid:['#a25eb0','#2b0e3c'],near:['#642c72','#170722'],ground:['#7a4288','#1e0a28'],lip:'#ffb0e6',acc:'#ff9be0',cry:'#c22a92',amb:'motes',ambc:'#ffd6f4'},
  {sky:[['#4598bc','#9ed4e4','#ecf8fa'],['#02101a','#0a2c3e','#1f6070']],far:['#8cc4d4','#123a4c'],mid:['#5092a8','#0b2836'],near:['#2a5e72','#05151e'],ground:['#8aa6b0','#223a46'],lip:'#ffe9a8',acc:'#7fe3ff',cry:'#0d768f',amb:'vagalumes',ambc:'#ffd96a'},
];
function rnArt40(){
  const G=window.GFX60,W=RN40.W,H=RN40.H,GY=RN40.GY,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const oval=(g,X,Y,a,b,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(X,Y,a,b,rot,0,TAU);g.fill()};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();if(r&&g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h);g.fill()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,a,b)=>{const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
  /* sorteia os parâmetros uma vez; G.wrap só redesenha */
  const rep=(r,n,w,fn)=>Array.from({length:n},(_,i)=>fn((i+.2+r()*.6)*w/n,i));

  /* ===== camadas de fundo, uma por bioma ===== */
  const FAR=[
    (g,w,h,c,r)=>G.paint.ridge({col:c,base:.66,amp:.15,k:[1,3,6]})(g,w,h,r),
    (g,w,h,c,r)=>{G.paint.ridge({col:c,base:.62,amp:.13})(g,w,h,r);G.paint.trees({col:c,n:32,min:.08,max:.17,base:.72})(g,w,h,r)},
    (g,w,h,c,r)=>{const L=rep(r,5,w,X=>({X,Y:h*(.22+r()*.28),W:32+r()*50,D:22+r()*40,a:r()}));
      G.wrap(g,w,h,()=>L.forEach(q=>{G.poly(g,[[q.X-q.W,q.Y],[q.X-q.W*.4,q.Y-8],[q.X+q.W*.1,q.Y-4],[q.X+q.W*.5,q.Y-11],[q.X+q.W,q.Y],[q.X+q.W*.35,q.Y+q.D*.5],[q.X+q.W*.05,q.Y+q.D],[q.X-q.W*.5,q.Y+q.D*.4]],c);
        for(let k=0;k<3;k++)disc(g,q.X-q.W+k*q.W*.9,q.Y+q.D+8+k*6*q.a,2.6-k*.6,c)}));
      G.paint.ridge({col:c,base:.74,amp:.07,k:[2,7,13]})(g,w,h,r)},
    (g,w,h,c)=>{const P=G.paint.ridge({col:c,base:.66,amp:.17,k:[2,3,8]});P(g,w,h,G.rng(91));g.save();g.globalAlpha=.34;g.translate(0,h*.8);g.scale(1,-1);P(g,w,h,G.rng(91));g.restore()},
    (g,w,h,c)=>{const n=16,p=w/n;for(let i=0;i<n;i++){const X=i*p+p/2;box(g,X-6,h*.42,12,h*.4,c);box(g,X-9,h*.42,18,5,c);box(g,X-8,h*.64,16,3,c)}
      box(g,0,h*.37,w,h*.052,c);for(let i=0;i<4;i++){const X=i*w/4+w/8;G.poly(g,[[X-56,h*.372],[X,h*.27],[X+56,h*.372]],c);disc(g,X,h*.33,5,G.shade(c,.3))}box(g,0,h*.74,w,h*.26,c)},
  ];
  const arch=(g,X,Y,w,h)=>{g.beginPath();g.moveTo(X-w/2,Y+h);g.lineTo(X-w/2,Y+w/2);g.arc(X,Y+w/2,w/2,Math.PI,0);g.lineTo(X+w/2,Y+h);g.closePath();g.fill()};
  const MID=[
    /* capelas de peregrinação */
    (g,w,h,c,r,night)=>{const L=rep(r,5,w,X=>({X,H:48+r()*64,W:30+r()*22,dome:r()<.5}));
      G.wrap(g,w,h,()=>L.forEach(q=>{const base=h*.84,top=base-q.H;box(g,q.X-q.W/2,top,q.W,q.H+20,c);box(g,q.X+q.W*.38,base-q.H*.44,q.W*.6,q.H*.44+20,c);
        if(q.dome){g.fillStyle=c;g.beginPath();g.arc(q.X,top+1,q.W/2,Math.PI,0);g.fill()}else G.poly(g,[[q.X-q.W*.64,top+1],[q.X,top-q.W*.85],[q.X+q.W*.64,top+1]],c);
        const tip=top-(q.dome?q.W/2:q.W*.85);box(g,q.X-1,tip-13,2,14,c);disc(g,q.X,tip-16,4.5,c);
        g.fillStyle='rgba(255,255,255,.1)';g.fillRect(q.X-q.W/2,top,3,q.H);
        g.fillStyle=night?'rgba(255,190,90,.9)':'rgba(255,226,168,.5)';arch(g,q.X,top+q.H*.22,q.W*.22,q.H*.28);arch(g,q.X+q.W*.68,base-q.H*.3,6,11)}));
      box(g,0,h*.83,w,h*.17,c)},
    /* troncos antigos */
    (g,w,h,c,r)=>{const L=rep(r,6,w,X=>({X,H:96+r()*76,t:7+r()*9,l:(r()-.5)*26,lv:Array.from({length:7},()=>[(r()-.5)*86,(r()-.5)*34,14+r()*22])}));
      G.wrap(g,w,h,()=>L.forEach(q=>{const base=h*.85,top=base-q.H;G.poly(g,[[q.X-q.t*2,base],[q.X-q.t*.7,base-24],[q.X-q.t*.45+q.l,top],[q.X+q.t*.45+q.l,top],[q.X+q.t*.7,base-24],[q.X+q.t*2.2,base]],c);
        line(g,[[q.X+q.l*.5,top+q.H*.45],[q.X+q.l*.5+q.t*3,top+q.H*.25]],c,4);q.lv.forEach(([u,v,s])=>disc(g,q.X+q.l+u,top+v,s,c));q.lv.slice(0,3).forEach(([u,v,s])=>disc(g,q.X+q.l+u-s*.25,top+v-s*.3,s*.45,'rgba(255,255,255,.06)'))}));
      box(g,0,h*.83,w,h*.17,c)},
    (g,w,h,c,r,night)=>G.paint.spires({col:c,n:11,min:.14,max:.44,base:.85,edge:G.rgba('#cdb8ff',night?.5:.32)})(g,w,h,r),
    /* espelhos suspensos */
    (g,w,h,c,r,night)=>{const L=rep(r,5,w,X=>({X,Y:h*(.38+r()*.22),a:17+r()*13,b:32+r()*24,rot:(r()-.5)*.34}));
      G.wrap(g,w,h,()=>L.forEach(q=>{g.save();g.translate(q.X,q.Y);g.rotate(q.rot);oval(g,0,0,q.a+6,q.b+6,c);
        oval(g,0,0,q.a,q.b,vg(g,-q.b,q.b,night?'#6a3282':'#e6c4ea',night?'#1c0828':'#ac6cc0'));
        G.poly(g,[[-q.a*.55,-q.b*.35],[-q.a*.15,-q.b*.7],[-q.a*.5,q.b*.35],[-q.a*.75,q.b*.15]],'rgba(255,255,255,.3)');
        G.poly(g,[[0,-q.b-18],[6,-q.b-8],[0,-q.b-3],[-6,-q.b-8]],c);G.poly(g,[[0,q.b+20],[5,q.b+9],[0,q.b+3],[-5,q.b+9]],c);g.restore()}));
      G.paint.ridge({col:c,base:.82,amp:.05,k:[3,7,13]})(g,w,h,r)},
    /* salão com lanternas */
    (g,w,h,c,r,night)=>{G.paint.pillars({col:c,n:6,min:.34,max:.58,base:.86,edge:G.rgba('#bff0ff',.25)})(g,w,h,r);
      const L=rep(r,5,w,X=>({X,Y:h*(.2+r()*.2)}));G.wrap(g,w,h,()=>L.forEach(q=>{line(g,[[q.X,0],[q.X,q.Y]],c,1.5);G.glow(g,q.X,q.Y+9,night?30:18,'#ffd36b',night?.6:.4,{add:false});
        G.poly(g,[[q.X-8,q.Y],[q.X+8,q.Y],[q.X+5,q.Y+17],[q.X-5,q.Y+17]],c);box(g,q.X-4,q.Y+3,8,11,'#ffe08a',2)}))},
  ];
  const NEAR=[
    (g,w,h,c,r)=>{const L=rep(r,13,w,X=>({X,H:12+r()*30}));G.wrap(g,w,h,()=>L.forEach(q=>{const b=h*.82;box(g,q.X-3,b-q.H,6,q.H+8,c);box(g,q.X-6,b-q.H,12,4,c);oval(g,q.X,b-q.H-6,2.6,5.5,'#ffb347');oval(g,q.X,b-q.H-5,1.2,2.6,'#fff3c0')}));
      G.paint.ridge({col:c,base:.8,amp:.035,k:[3,9,17]})(g,w,h,r)},
    (g,w,h,c,r)=>{G.paint.trees({col:c,n:12,min:.1,max:.21,base:.84})(g,w,h,r);const L=rep(r,16,w,X=>({X,s:7+r()*13}));G.wrap(g,w,h,()=>L.forEach(q=>disc(g,q.X,h*.82,q.s,c)));box(g,0,h*.81,w,h*.19,c)},
    (g,w,h,c,r)=>G.paint.spires({col:c,n:17,min:.05,max:.15,base:.84,edge:'rgba(185,166,255,.45)'})(g,w,h,r),
    (g,w,h,c,r)=>G.paint.spires({col:c,n:13,min:.06,max:.18,base:.84,edge:'rgba(255,170,230,.6)'})(g,w,h,r),
    (g,w,h,c)=>{const n=32,p=w/n,top=h*.72;box(g,0,top,w,5,c);for(let i=0;i<n;i++){const X=i*p+p/2;box(g,X-2,top,4,h*.1,c);oval(g,X,top+h*.055,4.5,7,c);if(i%8===0){box(g,X-6,top-8,12,h*.14,c);disc(g,X,top-12,5,c)}}box(g,0,h*.8,w,h*.2,c)},
  ];
  const skyPaint=(bio,n)=>(g,w,h)=>{const B=RNART40[bio],r=G.rng(400+bio);G.paint.sky(B.sky[n])(g,w,h);
    if(n){G.paint.stars({n:110,bottom:.62})(g,w,h,r);if(bio===2||bio===3)G.paint.nebula({cols:bio===2?['#6a48c0','#2a307a']:['#ff6ac8','#6a5aff'],n:7,a:.24})(g,w,h,r)}
    else G.paint.clouds({n:6,a:.3,top:.06,bottom:.4})(g,w,h,r)};
  const layer=(P,bio,n,key,sd)=>(g,w,h)=>P[bio](g,w,h,RNART40[bio][key][n],G.rng(sd+bio*7),!!n);
  const stacks=[];
  const stack=(bio,n)=>stacks[bio*2+n]||(stacks[bio*2+n]=G.parallax(`rn-${bio}-${n}`,W,H,[{paint:skyPaint(bio,n)},{paint:layer(FAR,bio,n,'far',11),speed:.06},{paint:layer(MID,bio,n,'mid',37),speed:.18},{paint:layer(NEAR,bio,n,'near',73),speed:.42}]));

  /* astro de cada bioma */
  const cel=(bio,n)=>G.bake(`rn:cel:${bio}:${n}`,120,120,g=>{const B=RNART40[bio];
    if(!n){G.glow(g,60,60,58,'#fff4c8',.85,{add:false});
      if(bio===0)for(let i=0;i<12;i++){const a=i*TAU/12;G.poly(g,[[60+Math.cos(a-.12)*27,60+Math.sin(a-.12)*27],[60+Math.cos(a)*(i%2?38:46),60+Math.sin(a)*(i%2?38:46)],[60+Math.cos(a+.12)*27,60+Math.sin(a+.12)*27]],'#ffc94a')}
      disc(g,60,60,23,bio===2?'#4a3c72':bio===3?'#ffc4ee':'#ffd45a');disc(g,60,60,18,bio===2?'#2c2248':bio===3?'#fff0fa':'#fff0b0');
      if(bio===2){g.strokeStyle='#efe4ff';g.lineWidth=2.5;g.beginPath();g.arc(60,60,24,0,TAU);g.stroke()}
      if(bio===3)disc(g,92,84,8,'rgba(255,240,250,.8)');
      if(bio===4){oval(g,60,60,13,7,'#12708a');disc(g,60,60,3.5,'#fff')}}
    else{
      if(bio===2){disc(g,60,60,23,'#05030c');g.strokeStyle=B.acc;g.lineWidth=3;g.beginPath();g.arc(60,60,24,0,TAU);g.stroke();g.lineWidth=1;g.beginPath();g.ellipse(60,60,40,9,-.35,0,TAU);g.stroke()}
      else{disc(g,60,60,21,bio===3?'#ffd6f4':bio===4?'#dff6ff':'#fff2c8');g.globalCompositeOperation='destination-out';disc(g,70,52,19,'#000');g.globalCompositeOperation='source-over';if(bio===3){disc(g,88,82,9,'#ff9be0');disc(g,91,79,7,'#5a1c60')}}
      g.globalCompositeOperation='destination-over';G.glow(g,60,60,56,B.acc,.42,{add:false});g.globalCompositeOperation='source-over'}},{s:2});

  /* ===== chão (ladrilho de 256) e primeiro plano ===== */
  const ground=bio=>G.bake(`rn:gnd:${bio}`,256,64,(g,w,h,r)=>{const B=RNART40[bio],[a,b]=B.ground;box(g,0,6,w,h-6,vg(g,6,h,a,b));
    if(bio===0){[[11,14],[27,16],[45,19]].forEach(([y,hh],j)=>{for(let i=-1;i<5;i++){const X=i*64+j*23,k=(i+4)%4,col=G.shade(a,((k*7+j*3)%5-2)*.07-j*.13);box(g,X+1,y,61,hh-1,col,5);box(g,X+5,y+1,52,1.5,'rgba(255,225,170,.25)')}});
      for(let i=0;i<4;i++)G.poly(g,[[i*64+30,13],[i*64+35,18],[i*64+30,23],[i*64+25,18]],'rgba(255,207,106,.55)')}
    else if(bio===1){const P=Array.from({length:26},()=>[r()*w,16+r()*42,1.5+r()*3.5]),R=Array.from({length:7},()=>[r()*w,(r()-.5)*34,18+r()*30]);
      G.wrap(g,w,h,()=>{R.forEach(([X,d,len])=>{g.strokeStyle='rgba(180,150,100,.38)';g.lineWidth=2;g.beginPath();g.moveTo(X,9);g.quadraticCurveTo(X+d,9+len*.5,X+d*.4,9+len);g.stroke()});P.forEach(([X,Y,s])=>{oval(g,X,Y+1,s,s*.7,'rgba(0,0,0,.35)');oval(g,X,Y,s,s*.7,'#8a7256')})})}
    else if(bio===2){const T=Array.from({length:22},()=>[r()*w,12+r()*40,8+r()*20,r()]),K=Array.from({length:5},()=>[r()*w,12+r()*10,(r()-.5)*30,(r()-.5)*26]);
      G.wrap(g,w,h,()=>{T.forEach(([X,Y,s,k])=>G.poly(g,[[X,Y],[X+s,Y+s*.35],[X+s*.25,Y+s*.8]],k<.5?'rgba(150,120,240,.2)':'rgba(0,0,0,.3)'));K.forEach(([X,Y,d,e])=>{const p=[[X,Y],[X+d*.4,Y+14],[X+d*.2+e*.4,Y+25],[X+d,Y+40]];line(g,p,'rgba(160,120,255,.35)',4);line(g,p,'#d8c8ff',1.2)})})}
    else if(bio===3){const D=Array.from({length:20},()=>[r()*w,14+r()*44,.8+r()*1.4]);
      G.wrap(g,w,h,()=>{for(let i=0;i<4;i++){const X=i*64+8;G.poly(g,[[X,10],[X+18,10],[X-12,h],[X-30,h]],'rgba(255,255,255,.12)');G.poly(g,[[X+27,10],[X+32,10],[X+2,h],[X-3,h]],'rgba(255,255,255,.2)')}D.forEach(([X,Y,s])=>disc(g,X,Y,s,'#ffe4f8'))});box(g,0,34,w,1.5,'rgba(255,190,236,.45)')}
    else{for(let j=0;j<3;j++)for(let i=0;i<8;i++){const X=i*32,Y=10+j*18;box(g,X,Y,32,18,(i+j)%2?'rgba(255,255,255,.2)':'rgba(4,30,44,.35)');box(g,X,Y,32,1,'rgba(255,255,255,.3)')}
      const V=Array.from({length:6},()=>[r()*w,12+r()*40,18+r()*26]);G.wrap(g,w,h,()=>V.forEach(([X,Y,L])=>line(g,[[X,Y],[X+L*.4,Y+5],[X+L*.6,Y+2],[X+L,Y+10]],'rgba(255,255,255,.28)',.8)))}
    box(g,0,10,w,4,'rgba(0,0,0,.3)');box(g,0,6,w,4.5,B.lip);box(g,0,6,w,1.2,'rgba(255,255,255,.75)');
    if(bio===1){const T=Array.from({length:80},()=>[r()*w,3+r()*6,(r()-.5)*5,r()]);G.wrap(g,w,h,()=>T.forEach(([X,L,d,k])=>line(g,[[X,8],[X+d,8-L]],k<.5?'#5fbe58':'#a8ee80',1.4)))}
  },{s:2});
  const fore=bio=>G.bake(`rn:fg:${bio}`,512,26,(g,w,h,r)=>{const c=G.shade(RNART40[bio].near[1],-.25),L=rep(r,15,w,X=>({X,s:5+r()*11,d:r()}));
    G.wrap(g,w,h,()=>L.forEach(q=>{
      if(bio===1)for(let k=-3;k<=3;k++){g.strokeStyle=c;g.lineWidth=2.4;g.beginPath();g.moveTo(q.X+k*3,h);g.quadraticCurveTo(q.X+k*5,h-q.s,q.X+k*8+q.d*6,h-q.s*1.5+Math.abs(k)*3);g.stroke()}
      else if(bio===2||bio===3){G.poly(g,[[q.X-q.s,h],[q.X-q.s*.2,h-q.s*1.5],[q.X+q.s*.2,h-q.s*.5],[q.X+q.s*.7,h-q.s],[q.X+q.s,h]],c);line(g,[[q.X-q.s,h],[q.X-q.s*.2,h-q.s*1.5]],G.rgba(RNART40[bio].acc,.5),1)}
      else{oval(g,q.X,h,q.s*1.5,q.s*.8,c);oval(g,q.X+q.s,h,q.s,q.s*.5,c);if(bio===0&&q.d>.6){box(g,q.X-2,h-q.s*1.4,4,q.s,c);disc(g,q.X,h-q.s*1.55,1.8,'#ffb347')}if(bio===4&&q.d>.55)G.poly(g,[[q.X-5,h],[q.X-1,h-q.s*1.3],[q.X+7,h-q.s],[q.X+6,h]],c)}}))},{s:2});

  /* ===== fenda e plataforma ===== */
  const pit=bio=>G.bake(`rn:pit:${bio}`,64,66,(g,w,h)=>{box(g,0,0,w,h,vg(g,0,h,'#150b20','#010003'));const q=g.createLinearGradient(0,h*.45,0,h);q.addColorStop(0,G.rgba(RNART40[bio].acc,0));q.addColorStop(1,G.rgba(RNART40[bio].acc,.42));g.fillStyle=q;g.fillRect(0,h*.45,w,h*.55)});
  const edge=bio=>G.bake(`rn:edge:${bio}`,16,66,(g,w,h)=>{const B=RNART40[bio];G.poly(g,[[0,0],[13,0],[14,7],[8,16],[12,27],[6,38],[10,50],[4,h],[0,h]],G.shade(B.ground[1],.06));line(g,[[13,1],[14,7],[8,16],[12,27],[6,38],[10,50],[4,h]],G.rgba(B.acc,.7),1.4);box(g,0,0,13,4,B.lip)},{s:2});
  const seg=bio=>G.bake(`rn:plat:${bio}`,64,34,(g,w,h,r)=>{const B=RNART40[bio],[a,b]=B.ground;
    const H2=Array.from({length:6},(_,i)=>[(i+.5)*w/6+(r()-.5)*5,5+r()*14,3+r()*3]);
    H2.forEach(([X,L,s])=>{if(bio===1){line(g,[[X,13],[X+2,13+L*.6],[X-1,13+L]],'#4a8a44',1.5);oval(g,X-1,13+L,2.4,1.5,'#8be070',.5)}else G.poly(g,[[X-s,13],[X+s,13],[X,13+L]],bio===4?G.shade(b,.1):G.shade(b,.18))});
    box(g,0,2,w,12,vg(g,2,14,G.shade(a,.2),b));for(let i=0;i<4;i++){box(g,i*16,5,1,9,'rgba(0,0,0,.35)');box(g,i*16+1,5,1,9,'rgba(255,255,255,.12)')}
    box(g,0,2,w,3.5,B.lip);box(g,0,2,w,1,'rgba(255,255,255,.8)');box(g,0,13,w,1.5,'rgba(0,0,0,.45)')},{s:2});

  /* ===== obstáculos (mesmas medidas das caixas de colisão) ===== */
  const totem=bio=>G.bake(`rn:tot:${bio}`,44,76,g=>{const B=RNART40[bio],st=G.mix('#2a1c28',B.near[0],.28);
    box(g,7,10,30,64,vg(g,10,74,G.shade(st,.16),G.shade(st,-.35)),5);g.strokeStyle=B.acc;g.lineWidth=1.5;g.beginPath();if(g.roundRect)g.roundRect(7.7,10.7,28.6,62.6,5);else g.rect(7.7,10.7,28.6,62.6);g.stroke();
    box(g,4,68,36,6,G.shade(st,-.2),2);box(g,5,34,34,5,G.shade(st,.22),2);box(g,5,54,34,5,G.shade(st,.22),2);
    G.poly(g,[[11,18],[20,21],[20,25],[12,23]],'#ff3a5a');G.poly(g,[[33,18],[24,21],[24,25],[32,23]],'#ff3a5a');line(g,[[15,30],[19,28],[22,31],[25,28],[29,30]],B.acc,1.4);
    G.poly(g,[[22,41],[28,46.5],[22,52],[16,46.5]],B.acc);disc(g,22,46.5,2.6,'#1a0c14');line(g,[[13,62],[31,62]],B.acc,1.5);line(g,[[17,65],[27,65]],B.acc,1);
    if(bio===0){box(g,20,4,4,7,'#f4e2c0');oval(g,22,3,2.4,3.6,'#ffb347')}
    else if(bio===1){oval(g,15,8,7,3.4,'#4fa84a',-.5);oval(g,29,8,7,3.4,'#6fd060',.5);disc(g,22,8,3,'#a8ee80')}
    else if(bio===2){g.strokeStyle=B.acc;g.lineWidth=2;g.beginPath();g.ellipse(22,6,10,3.5,0,0,TAU);g.stroke()}
    else if(bio===3){G.poly(g,[[9,11],[13,1],[17,10],[22,0],[27,10],[31,1],[35,11]],B.acc)}
    else{box(g,21,2,2,9,B.lip);box(g,12,3,20,2,B.lip);disc(g,13,8,3,B.lip);disc(g,31,8,3,B.lip)}},{s:2});
  const fly=bio=>G.sheet(`rn:fly:${bio}`,4,68,52,(g,i)=>{const B=RNART40[bio],cx=34,cy=26,k=[-1,-.3,.75,.15][i],body=G.mix('#1a0c24',B.cry,.3);
    [-1,1].forEach(s=>{const p=[[cx+s*7,cy-5],[cx+s*19,cy+k*12-9],[cx+s*33,cy+k*17],[cx+s*26,cy+k*10+3],[cx+s*21,cy+k*8+1],[cx+s*17,cy+k*4+7],[cx+s*8,cy+5]];G.poly(g,p,body);line(g,p.slice(0,4),B.acc,1.5);line(g,[[cx+s*9,cy-1],[cx+s*21,cy+k*8+1]],G.rgba(B.acc,.5),1)});
    G.poly(g,[[cx-9,cy-5],[cx-8,cy-14],[cx-2,cy-8]],body);G.poly(g,[[cx+9,cy-5],[cx+8,cy-14],[cx+2,cy-8]],body);oval(g,cx,cy,13,10.5,vg(g,cy-10,cy+10,G.shade(body,.22),'#0c0612'));
    g.strokeStyle=B.acc;g.lineWidth=1.3;g.beginPath();g.ellipse(cx,cy,13,10.5,0,0,TAU);g.stroke();
    [-5,5].forEach(d=>{oval(g,cx+d,cy-2,3,2.2,'#ff3a5a',d<0?.35:-.35);disc(g,cx+d-1,cy-2.6,.8,'#fff')});G.poly(g,[[cx-4,cy+4],[cx-2,cy+8],[cx,cy+4],[cx+2,cy+8],[cx+4,cy+4]],'#fff')});
  const shot=bio=>{const c=RNB40[bio].boss.c;return G.bake(`rn:shot:${bio}`,36,32,g=>{for(let i=0;i<9;i++){const a=i*TAU/9;G.poly(g,[[18+Math.cos(a-.28)*9,16+Math.sin(a-.28)*9],[18+Math.cos(a)*15,16+Math.sin(a)*15],[18+Math.cos(a+.28)*9,16+Math.sin(a+.28)*9]],c)}
    disc(g,18,16,10.5,'#160a20');disc(g,18,16,8.5,c);disc(g,16,13.5,4,'#fff')},{s:2})};
  const wave=bio=>{const c=RNB40[bio].boss.c;return G.bake(`rn:wave:${bio}`,52,32,g=>{const p=()=>{g.beginPath();g.moveTo(4,31);g.quadraticCurveTo(8,6,24,5);g.quadraticCurveTo(20,13,30,15);g.quadraticCurveTo(42,17,48,31);g.closePath()};
    p();g.fillStyle=vg(g,4,31,'#ffffff',c);g.fill();p();g.strokeStyle='#160a20';g.lineWidth=2;g.stroke();line(g,[[13,28],[16,17],[23,13]],'#fff',2);line(g,[[27,28],[31,22],[38,26]],'#fff',1.5)},{s:2})};
  /* mini-chefes desenhados */
  const BOSS=[
    (g,c)=>{for(let i=0;i<14;i++){const a=i*TAU/14;G.poly(g,[[70+Math.cos(a-.1)*44,70+Math.sin(a-.1)*44],[70+Math.cos(a)*(i%2?56:66),70+Math.sin(a)*(i%2?56:66)],[70+Math.cos(a+.1)*44,70+Math.sin(a+.1)*44]],'#ffb83a')}
      disc(g,70,70,44,'#2a1420');[-1,1].forEach(s=>{const P=(a,b)=>[70+s*a,b];line(g,[P(10,56),P(24,42),P(26,24),P(36,14)],c,5);line(g,[P(24,42),P(40,38),P(48,26)],c,4);line(g,[P(26,26),P(16,16)],c,3);G.poly(g,[P(14,60),P(34,52),P(22,70)],'#e8b870')});
      G.poly(g,[[52,56],[88,56],[84,80],[76,102],[64,102],[56,80]],'#f4d49a');G.poly(g,[[70,56],[88,56],[84,80],[76,102],[70,102]],'#d8aa68');
      [-9,9].forEach(d=>{oval(g,70+d,74,4.5,3,'#3a1408',d*.03);disc(g,70+d,74,1.6,'#fff2a0')});oval(g,70,98,6,4,'#4a2418');G.poly(g,[[70,60],[75,66],[70,72],[65,66]],'#ff7a2a')},
    (g,c)=>{disc(g,70,70,46,'#0a1a10');for(let i=0;i<7;i++){const X=40+i*10;g.strokeStyle='#6a4a2a';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(X,92);g.quadraticCurveTo(X+(i%2?14:-14),108,X+(i-3)*5,124);g.stroke()}
      disc(g,70,74,28,'#c49a5a');disc(g,76,80,22,'rgba(70,40,16,.25)');oval(g,70,52,46,9,'#5a3a1e');G.poly(g,[[48,52],[56,18],[72,26],[84,12],[94,52]],'#7a5028');box(g,50,42,42,7,'#3a7a3a');
      [-12,12].forEach(d=>{line(g,[[70+d-6,64],[70+d+6,76]],'#102810',5);line(g,[[70+d+6,64],[70+d-6,76]],'#102810',5);disc(g,70+d,70,2.6,c)});line(g,[[52,88],[58,84],[64,91],[70,85],[76,91],[82,84],[88,88]],'#102810',3);[58,70,82].forEach(X=>line(g,[[X,83],[X,93]],'#102810',1.5))},
    (g,c)=>{disc(g,70,70,50,'#0b0718');g.strokeStyle=c;for(let i=0;i<3;i++){g.lineWidth=3-i*.7;g.beginPath();g.arc(70,76,36-i*10,0,TAU);g.stroke()}
      disc(g,70,78,31,'#000');for(let i=0;i<14;i++){const a=i*TAU/14,t=i%2?15:20;G.poly(g,[[70+Math.cos(a-.18)*32,78+Math.sin(a-.18)*32],[70+Math.cos(a)*t,78+Math.sin(a)*t],[70+Math.cos(a+.18)*32,78+Math.sin(a+.18)*32]],'#f0eaff')}
      disc(g,70,78,6,'#6a3ad0');[[46,34,6],[70,24,8],[94,34,6]].forEach(([X,Y,s])=>{oval(g,X,Y,s,s*.65,'#f0eaff');disc(g,X,Y,s*.4,'#6a1ab0')})},
    (g,c,r)=>{const L=Array.from({length:22},()=>[4+r()*34,26+r()*88,6+r()*15]);L.forEach(([u,v,s])=>{disc(g,70-u,v,s,'#2a0a30');disc(g,70+u,v,s,'#2a0a30')});disc(g,70,70,32,'#2a0a30');
      L.slice(0,9).forEach(([u,v,s])=>{disc(g,70-u,v,s*.3,G.rgba(c,.5));disc(g,70+u,v,s*.3,G.rgba(c,.5))});
      [-16,16].forEach(d=>{oval(g,70+d,60,11,8,'#fff',d*.015);disc(g,70+d,60,5,c);disc(g,70+d,60,2,'#12041a')});g.strokeStyle=c;g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(70,76,18,.25,Math.PI-.25);g.stroke()},
    (g,c)=>{disc(g,70,70,46,'#08202a');box(g,48,46,44,72,vg(g,46,118,'#fdf0d8','#c8a878'),12);[[48,60,9,22],[62,52,8,13],[84,56,10,30]].forEach(([X,Y,w,h])=>box(g,X,Y,w,h,'#fff6e4',5));
      [-1,1].forEach(s=>{for(let i=0;i<4;i++)disc(g,70+s*(24+i*2),54+i*13,9-i,'#e8e0d0')});oval(g,70,48,24,7,'#fff8e8');line(g,[[70,46],[70,34]],'#3a2418',3);
      oval(g,70,24,10,17,'#ff9a2c');oval(g,70,28,6,11,'#ffd86a');oval(g,70,32,3,5,'#fff');line(g,[[52,70],[66,76]],'#3a2418',4);line(g,[[88,70],[74,76]],'#3a2418',4);disc(g,60,80,3.4,'#12708a');disc(g,80,80,3.4,'#12708a');
      line(g,[[60,96],[70,92],[80,96]],'#3a2418',3);box(g,56,106,28,6,c,2);G.poly(g,[[70,112],[78,120],[70,128],[62,120]],c)},
  ];
  const boss=bio=>G.bake(`rn:boss:${bio}`,140,140,(g,w,h,r)=>{const c=RNB40[bio].boss.c;BOSS[bio](g,c,r)},{s:2});

  /* ===== itens ===== */
  const PWC={sh:'#8fe8ff',mag:'#ffd36b',sl:'#c9b0ff'};
  const medal=k=>G.bake(`rn:pw:${k}`,40,40,g=>{const c=PWC[k];disc(g,20,20,18,'#171024');g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(20,20,17,0,TAU);g.stroke();g.lineWidth=1;g.strokeStyle=G.rgba(c,.5);g.beginPath();g.arc(20,20,12.5,0,TAU);g.stroke();
    if(k==='sh'){G.icon(g,'escudo',20,20,21,c);G.icon(g,'estrela',20,19.5,9,'#fff')}
    else if(k==='mag'){g.strokeStyle='#ff6a7a';g.lineWidth=6;g.beginPath();g.moveTo(14,12);g.lineTo(14,21);g.arc(20,21,6,Math.PI,0,true);g.lineTo(26,12);g.stroke();box(g,11,10,6,5,'#fff');box(g,23,10,6,5,'#fff')}
    else{box(g,12,9,16,3,c,1);box(g,12,28,16,3,c,1);G.poly(g,[[13,12],[27,12],[21,20],[27,28],[13,28],[19,20]],'rgba(255,255,255,.3)');G.poly(g,[[17,15],[23,15],[20,19]],c);G.poly(g,[[15,28],[20,23],[25,28]],c)}},{s:2});
  const bubble=()=>G.bake('rn:bubble',92,92,g=>{const q=g.createRadialGradient(46,46,20,46,46,45);q.addColorStop(0,'rgba(143,232,255,0)');q.addColorStop(.8,'rgba(143,232,255,.16)');q.addColorStop(1,'rgba(220,250,255,.6)');g.fillStyle=q;g.beginPath();g.arc(46,46,45,0,TAU);g.fill();
    g.strokeStyle='rgba(190,242,255,.95)';g.lineWidth=2;g.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/6-Math.PI/2,X=46+Math.cos(a)*41,Y=46+Math.sin(a)*41;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(46,46,34,3.6,4.5);g.stroke()},{s:2});

  const amb=[];
  return{
    A:RNART40,PWC,cel,ground,fore,pit,edge,seg,totem,fly,shot,wave,boss,medal,bubble,
    lights:G.lights(W,H,{dark:.36,color:'#050212',res:.2}),
    amb:b=>amb[b]||(amb[b]=G.ambient(RNART40[b].amb,{W,H:GY,n:b===1?16:26,col:RNART40[b].ambc,seed:b+3})),
    /* céu, astro e as três camadas; a noite entra por cima da versão de dia */
    back(x,bio,cam,nk,alpha){const one=(n,a)=>{if(a<=.004)return;const g=x.globalAlpha;x.globalAlpha=g*a;const p=stack(bio,n);p.draw(x,cam,0,0,{to:1});G.draw(x,cel(bio,n),660,n?66:64,{w:112});p.draw(x,cam,0,0,{from:1});x.globalAlpha=g};
      if(nk<.996)one(0,alpha);one(1,alpha*nk)},
    plat(x,bio,X,Y,w){const s=seg(bio);G.glow(x,X+w/2,Y+16,w*.6,RNART40[bio].acc,.26,{sy:.18});x.save();x.beginPath();x.rect(X,Y-1,w,36);x.clip();for(let q=X;q<X+w;q+=64)x.drawImage(s,q,Y-2,64,34);x.restore();
      x.fillStyle='#14081a';x.fillRect(X-1.5,Y,2.5,13);x.fillRect(X+w-1,Y,2.5,13);x.fillStyle='rgba(255,255,255,.85)';x.fillRect(X,Y,w,1)},
  };
}

function runner40(C){
  const R=RN40,W=R.W,H=R.H,GY=R.GY,CX=R.CX,o=C.room.opt||{},bi0=Math.max(0,Math.min(4,+o.b||0)),d0=bi0*R.BIO*R.M;
  const L=rnLevel40(C.seed,C.gd,d0),me=me21(C);
  const S=rnSt040(d0);Object.assign(S,{runT:0,cam:d0,parts:[],mile:Math.floor(d0/R.M/250),bioShow:bi0,bioT:-9,jumpQ:false,hold:false,duck:false,dashQ:false});
  const GR=ghostRace(C,S);let fin=null;
  /* somente visual: arte GFX60, HUD vestido e relógio da poeira da corrida */
  const G=window.GFX60,art=rnArt40();let dustT=0;
  G.skin({acc:RNART40[bi0].acc});
  const meters=()=>Math.floor((S.d-d0)/R.M);
  const score=()=>meters()+S.orbs*10+S.bossN*150;
  const day=m=>{const p=(m%1000)/1000;const tr=x=>clamp12(x,0,1);return p<.45?0:p<.5?tr((p-.45)/.05):p<.95?1:1-tr((p-.95)/.05)};
  function save(){const m=Math.floor(S.d/R.M),reach=Math.min(4,Math.floor(m/R.BIO));let rec=false,newBio=false;
    progPut38(p=>{p.rn=p.rn||{};const q=p.rn;if(reach>(q.reach||0)){q.reach=reach;newBio=true}if(meters()>(q.best||0)){q.best=meters();rec=true}q.bosses=(q.bosses||0)+S.bossN});return{rec,newBio,reach}}
  function die(){
    C.fx?.shake(12,.45);C.fx?.burst(CX,GY+S.y-25,{n:26,col:['#b48cff','#ffd36b','#fff'],sp:260,life:.8,size:3.4,grav:500});
    G.impact(CX,GY+S.y-25,{col:'#d0b4ff',force:2});G.emit('explosao',CX,GY+S.y-25);
    if(meters()>=1500)C.achieve?.('corredor');
    const sv=save(),m=meters();fin=sv;
    const mul=gdMul38(C.gd);fin.rw={ob:Math.min(160,Math.round((m/90+S.bossN*8+S.orbs*.4)*mul+(sv.newBio?15:0)+(sv.rec?5:0))),why:[S.bossN?`${S.bossN} chefe${S.bossN>1?'s':''}`:'',sv.newBio?'bioma novo':'',sv.rec?'recorde':''].filter(Boolean).join(' · ')||`${m} m`};fin.rw.xp=Math.round(fin.rw.ob*.6);
    if(C.net){GR.die(score());return}
    fx5('fumble');
    C.finish({title:`🦖 Você parou em ${m} m · ${RNB40[rnBio40(S.d)].n}`,rows:[{u:C.me,n:me.n,c:me.c,s:score(),w:false}],html:html()});
    C.say(pick12(['O Vazio cobra pedágio.','Tropeçou na Inexistência. Clássico.','Corre mais da próxima vez. Ou pula. Pular ajuda.','O chefe mandou lembranças.']),false);
  }
  function html(){const p=rnProg40();return`<ul class="r38-l"><li>📏 Distância: <b>${meters()} m</b></li><li>✨ Orbes: <b>${S.orbs}</b></li><li>👹 Chefes superados: <b>${S.bossN}</b></li><li>💨 Dash através: <b>${S.phN}</b></li><li>🌍 Bioma: <b>${RNB40[rnBio40(S.d)].ico} ${RNB40[rnBio40(S.d)].n}</b></li><li>🏆 Recorde: <b>${p.best} m</b></li></ul>${fin?.newBio?`<p class="r38-hi">🗺 Novo ponto de partida aberto: ${esc(RNB40[fin.reach].n)}.</p>`:''}`}
  const jumpKeys=['Space','ArrowUp','KeyW'],duckKeys=['ArrowDown','KeyS'],dashKeys=['ShiftLeft','ShiftRight','KeyE','ArrowRight','KeyD'];
  return{
    st:()=>S,L,
    g60intro:{title:'Corredor do Vazio',sub:`${RNB40[bi0].n} · prepare-se`,acc:RNART40[bi0].acc},
    key(code,down){
      if(jumpKeys.includes(code)){if(down&&!S.hold)S.jumpQ=true;S.hold=!!down}
      else if(duckKeys.includes(code))S.duck=!!down;
      else if(dashKeys.includes(code)&&down)S.dashQ=true},
    ptr(t,px,py,e){if(t==='down'){if(py>H*.62&&px<W*.55)S.duck=true;else if(px>W*.7&&py>H*.55)S.dashQ=true;else{if(!S.hold)S.jumpQ=true;S.hold=true}}if(t==='up'){S.duck=false;S.hold=false}},
    msg:GR.msg,left:GR.left,
    reward:()=>fin?.rw||null,
    step(dt){
      S.parts=S.parts.filter(p=>(p.t+=dt)<p.life);
      const now=Date.now();if(now<C.t0){S.runT+=dt;return}
      if(S.dead){S.cam=S.d;for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=L.vAt(g.d)*dt}return}
      S.runT+=dt;
      for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=L.vAt(g.d)*dt}
      const inp={jump:S.jumpQ,hold:S.hold,duck:S.duck,dash:S.dashQ};S.jumpQ=false;S.dashQ=false;
      const wasGnd=S.gnd;rnStep40(L,S,inp,dt);const ev=S.ev;
      if(ev==='jump'||ev==='dj'){fx5('mgJump');C.fx?.burst(CX,GY+S.y,{n:ev==='dj'?10:6,col:ev==='dj'?['#c9b0ff','#fff']:'#b8a88a',sp:90,life:.35,size:2,grav:200,ang:Math.PI/2,spread:1.4})}
      else if(ev==='dash'){fx5('activate');C.fx?.burst(CX-20,GY+S.y-25,{n:12,col:['#8fe8ff','#fff'],sp:200,life:.35,size:2.4,grav:0,ang:Math.PI,spread:.6})}
      else if(ev==='phase'){C.fx?.float(CX+30,GY+S.y-70,'atravessou',{col:'#8fe8ff',size:15,life:.6});G.emit('estilhacos',CX+14,GY+S.y-28,{col:'#8fe8ff',amount:.6});if(S.phN>=10)C.achieve?.('rn_dash')}
      else if(ev==='shield'){fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(CX+60,GY-90,'Escudo de Fé!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.25);G.impact(CX,GY+S.y-28,{col:'#8fe8ff'})}
      else if(ev==='orb'){fx5('mgCoin');G.emit('coleta',CX+10,GY+S.y-28,{col:'#ffd36b',amount:.5,size:.8})}
      else if(ev&&ev.startsWith('pw:')){fx5('activate');const k=ev.slice(3);C.fx?.float(CX+110,GY-110,k==='sh'?'Escudo de Fé':k==='mag'?'Ímã de Óbolos':'Câmera Lenta de Verdade',{col:art.PWC[k],size:20});G.emit('brilho',CX,GY+S.y-28,{col:art.PWC[k]})}
      else if(ev==='boss'){fx5('mgWin');C.fx?.flash('#ffd36b',.3);C.fx?.float(W/2,110,`Chefe superado! +150`,{col:'#ffd36b',size:28,life:1.6});G.emit('confete',W/2,100,{amount:.8});G.hitstop(80);C.achieve?.('rn_chefe')}
      else if(ev==='fire'){try{o5('square',220,actx().currentTime,.12,{to:110,gain:.04})}catch(e){}}
      if(!wasGnd&&S.gnd&&!S.dead){C.fx?.burst(CX,GY+S.y,{n:5,col:'#b8a88a',sp:80,life:.3,size:2,grav:200,ang:-Math.PI/2,spread:2});G.emit('poeira',CX,GY+S.y,{amount:.7})}
      if(S.gnd&&!S.dead&&(dustT+=dt)>.14){dustT=0;C.fx?.burst(CX-18,GY+S.y-3,{n:1,col:RNART40[rnBio40(S.d)].lip,sp:60,life:.32,size:2.2,grav:-60,kind:'fumaca',ang:Math.PI,spread:.7})}
      if(S.dead){die();return}
      const m=Math.floor(S.d/R.M),bio=rnBio40(S.d);
      if(bio!==S.bioShow){S.bioShow=bio;S.bioT=S.runT;fx5('confirm');if(bio===3)C.achieve?.('rn_espelho')}
      const mm=meters();if(Math.floor(mm/250)>S.mile){S.mile=Math.floor(mm/250);fx5('bb'+Math.min(7,S.mile%8));C.fx?.float(W/2,90,`${S.mile*250} m!`,{col:day(m)>.5?'#fff3c0':'#5b2fa8',size:30,life:1.1})}
      S.score=score();S.cam=S.d;GR.send({d:Math.round(S.d),y:Math.round(S.y),k:S.dk?1:0,s:S.score});
      const bk=L.bossOf(S.d);
      C.hud(G.chips([{icon:'bandeira',value:`${mm} m`},{icon:'estrela',value:`${S.score} pts`},{icon:'moeda',label:'Orbes',value:S.orbs},{icon:'chama',value:RNB40[bio].n},
        S.sh?{icon:'escudo',value:'Escudo',tone:'ok'}:null,S.mag>0?{icon:'raio',label:'Ímã',value:`${Math.ceil(S.mag)} s`,tone:'ok'}:null,S.slow>0?{icon:'relogio',label:'Lento',value:`${Math.ceil(S.slow)} s`,tone:'ok'}:null,
        bk?{icon:'caveira',label:RNB40[rnBio40(bk*1000*RN40.M)].boss.n,value:`aguente ${Math.max(0,Math.ceil(bk*1000+R.BZ-m))} m`,tone:'bad'}:null,
        C.net?{icon:'olho',value:`${Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)} correndo`}:null]));
    },
    draw(x){
      const cam=S.cam??S.d,m=Math.floor(cam/R.M),nk=day(m),bio=rnBio40(cam),B=RNB40[bio],bp=(cam/R.M%R.BIO)/R.BIO,nx=(bio+1)%5,A=art.A[bio];
      const blend=bp>.94?(bp-.94)/.06:0,t=S.runT,red=G.reduced(),pulse=red?0:Math.sin(t*5);
      /* cenário em paralaxe (dia, noite e troca de bioma por alpha cruzado) */
      art.back(x,bio,cam,nk,1);if(blend>0)art.back(x,nx,cam,nk,blend);
      if(bio===0&&nk<.9&&!G.low())G.rays(x,660,64,{n:9,len:520,width:.13,col:'#fff0b0',a:.07*(1-nk),t});
      art.amb(bio).draw(x,t,cam);
      /* chão */
      G.fillTile(x,art.ground(bio),0,GY-6,W,H-GY+6,{ox:-cam,oy:GY-6});
      if(blend>0)G.fillTile(x,art.ground(nx),0,GY-6,W,H-GY+6,{ox:-cam,oy:GY-6,alpha:blend});
      if(nk>.02){x.fillStyle=`rgba(7,3,16,${(nk*.38).toFixed(2)})`;x.fillRect(0,GY,W,H-GY)}
      let i0=0;while(L.ob(i0).x+L.ob(i0).w<cam-200)i0++;
      const gaps=[];for(let i=Math.max(0,i0-1);i<i0+7;i++){const o=L.ob(i);if(o.k==='gap')gaps.push([o.x,o.x+o.w]);if(o.k==='plat')gaps.push([o.g0,o.g1])}
      gaps.forEach(([a,b])=>{const sx=CX+(a-cam),ex=CX+(b-cam);if(ex<-14||sx>W+14)return;const gb=rnBio40(a);x.drawImage(art.pit(gb),sx,GY-7,ex-sx,H-GY+7);
        const e=art.edge(gb);G.draw(x,e,sx-11,GY-6,{ax:0,ay:0});G.draw(x,e,ex+11,GY-6,{ax:0,ay:0,flip:true});G.glow(x,(sx+ex)/2,H,(ex-sx)*.6,art.A[gb].acc,.22,{sy:.35})});
      /* noite: escurece o palco antes dos obstáculos, que continuam legíveis */
      if(nk>.06&&!G.low()){art.lights.begin(.4*nk).add(CX+20,GY+S.y-30,200,null,1).add(CX+240,GY-40,170,null,.7);if(L.bossOf(cam))art.lights.add(708,128,120,null,1);art.lights.apply(x,{glow:0})}
      /* obstáculos, plataformas e itens */
      const halo=.2+nk*.3;
      for(let i=Math.max(0,i0-1);i<i0+7;i++){const o=L.ob(i),ox=CX+(o.x-cam);if(ox>W+120)break;const ob=rnBio40(o.x),OA=art.A[ob];
        if(o.orb)for(let k=0;k<o.orb.n;k++){if(S.taken[i*10+k])continue;const qx=ox+o.orb.dx+k*28,qy=GY+o.orb.dy-Math.sin(k/(o.orb.n-1||1)*Math.PI)*20;if(qx<-20||qx>W+20)continue;
          G.glow(x,qx,qy,17,'#ffb81c',.6,{add:false});G.draw(x,G.prop.orb('#ffd04a',7),qx,qy);const tw=red?.6:.5+.5*Math.sin(t*7+k*1.3+i);G.glow(x,qx,qy,9+tw*4,'#fff3c0',.25+tw*.3)}
        if(o.pw&&!S.pwt[i]){const qx=ox+o.pw.dx,qy=GY+o.pw.dy+(red?0:Math.sin(S.runT*4+i)*5),c=art.PWC[o.pw.k];G.glow(x,qx,qy,34,c,.7,{add:false});G.draw(x,art.medal(o.pw.k),qx,qy,{w:34})}
        if(o.k==='plat')art.plat(x,ob,ox,GY-R.PLH,o.w);
        else if(o.k==='fly'){G.shadow(x,ox+o.w/2,GY,34,{alt:GY-o.y,alpha:.4});G.glow(x,ox+o.w/2,o.y,36,OA.acc,halo);G.draw(x,G.anim(art.fly(ob),S.runT+i*.13,14),ox+o.w/2,o.y)}
        else if(o.k==='totem'){G.shadow(x,ox+o.w/2,GY+2,48);G.glow(x,ox+o.w/2,GY-36,50,OA.acc,halo,{sy:1.1});G.draw(x,art.totem(ob),ox-7,GY+2,{ax:0,ay:74/76});G.glow(x,ox+o.w/2,GY-45,17,'#ff2a50',.4+.18*pulse,{sy:.5})}
        else if(o.k==='cris'){G.shadow(x,ox+o.w/2,GY+2,o.w+22);G.glow(x,ox+o.w/2,GY-o.h*.4,o.w*.7+20,OA.acc,halo,{sy:o.h/(o.w*.7+20)});
          for(let k=0;k<o.n;k++){const px=ox+k*22+9,h=o.h-(k%2)*8,c=G.prop.crystal(OA.cry,18,h);G.draw(x,G.tint(c,'#160818',1),px,GY+1,{w:23,h:h+3,ay:1});G.draw(x,c,px,GY,{ay:1});
            if(!red&&Math.sin(t*3+i*2+k)>.93)G.glow(x,px-2,GY-h+4,9,'#ffffff',.9)}
          x.fillStyle='#160818';x.fillRect(ox-2,GY-2,o.w+4,4)}
        else if(o.k==='proj'){const px=CX+(rnProjX40(L,S,o)-cam),pb=rnBio40(o.boss*1000*RN40.M),bc=RNB40[pb].boss.c;if(o.i in S.pf||px<W){const cx=px+o.w/2,cy=o.pk==='wave'?GY-10:o.y;
          G.glow(x,cx+20,cy,34,bc,.55,{sy:.4});G.glow(x,cx,cy,28,bc,.75,{add:false});
          if(o.pk==='wave'){G.shadow(x,cx,GY+2,48);G.draw(x,art.wave(pb),cx,GY+1,{ay:31/32,sy:1+(red?0:Math.sin(t*20+i)*.07)})}
          else{G.shadow(x,cx,GY,26,{alt:GY-o.y,alpha:.35});for(let k=1;k<4;k++)G.glow(x,cx+k*11,cy,10-k*2,bc,.6-k*.13);G.draw(x,art.shot(pb),cx,cy,{w:30,rot:red?0:-t*6})}}}
      }
      /* mini-chefe */
      const bk=L.bossOf(cam);
      if(bk){const bb=rnBio40(bk*1000*RN40.M),BB=RNB40[bb].boss,bx=708,by=128+(red?0:Math.sin(S.runT*3)*10);
        G.glow(x,bx,by,92,BB.c,.55+.15*pulse,{add:false});G.draw(x,art.boss(bb),bx,by,{w:126,rot:red?0:Math.sin(t*2)*.05,sx:1+.025*pulse,sy:1-.025*pulse});
        G.hud.text(x,BB.n,Math.min(bx,W-110),by+66,{size:13,w:800,col:BB.c,al:'center',max:210})}
      /* fantasmas da Mesa */
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=CX+(g.d-cam);if(gx<-60||gx>W+60)continue;const gy=GY+(g.y||0);G.glow(x,gx,gy-26,34,'#bfe8ff',g.dead?.08:.22);mgCat(x,GR.col(u),gx,gy-(g.k?18:30),g.k?44:56,GR.nm(u),{alpha:g.dead?.15:.4})}
      /* Perseus */
      if(!S.dead){const py=GY+S.y,bob=S.y<-1||red?0:Math.abs(Math.sin(S.runT*14))*-4,sz=S.dk?50:60;
        let floor=GY;for(const[a,b]of gaps)if(cam-10>a&&cam+10<b)floor=null;
        for(let i=Math.max(0,i0-1);i<i0+5;i++){const o=L.ob(i);if(o.k==='plat'&&cam+14>=o.x&&cam-14<=o.x+o.w&&S.y<=-R.PLH+1)floor=GY-R.PLH}
        if(floor!=null)G.shadow(x,CX,floor+2,58,{alt:floor-py,alpha:.55});
        G.glow(x,CX,py-28,52,A.acc,.18+nk*.16);
        x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;
        if(S.dash>0){G.glow(x,CX-44,py-28,64,'#8fe8ff',.8,{sy:.34});const ga=x.globalAlpha;for(let k=3;k>0;k--){x.globalAlpha=ga*(.34-k*.08);mgCat(x,me.c,CX-k*17,py-30,sz,'',{alpha:x.globalAlpha})}x.globalAlpha=ga;
          x.fillStyle='rgba(214,248,255,.8)';for(let k=0;k<5;k++){const yy=py-48+k*10,len=30+((k*37+Math.floor(t*30)*13)%42);x.fillRect(CX-34-len,yy,len,1.5)}}
        const al=S.inv>0&&Math.floor(S.inv*12)%2?.4:1;
        if(S.dk&&S.gnd){x.translate(CX,py-14);x.scale(1.25,.62);mgCat(x,me.c,0,0,sz,'',{alpha:al})}
        else{const st=red||S.gnd?0:Math.max(-.12,Math.min(.14,-S.vy/5200));x.translate(CX,py-30+bob);x.rotate(S.gnd?0:Math.max(-.16,Math.min(.2,S.vy/3600)));x.scale(1-st*.6,1+st);mgCat(x,me.c,0,0,sz,'',{alpha:al})}
        x.restore();
        if(S.sh){G.glow(x,CX,py-28,50,'#8fe8ff',.25);G.draw(x,art.bubble(),CX,py-28,{w:80+pulse*3})}
        if(S.mag>0){for(let k=0;k<2;k++){const rr=56+k*16+(red?0:Math.sin(t*8+k*2)*6);x.strokeStyle=`rgba(255,211,107,${.55-k*.22})`;x.lineWidth=2;x.setLineDash([5,7]);x.lineDashOffset=red?0:-t*40*(k?-1:1);x.beginPath();x.arc(CX,py-28,rr,0,Math.PI*2);x.stroke()}x.setLineDash([])}}
      /* primeiro plano */
      {const f=art.fore(bio),off=((cam*1.35)%512+512)%512;for(let X=-off;X<W;X+=512)x.drawImage(f,X,H-24,512,26)}
      if(S.slow>0){x.fillStyle='rgba(150,110,255,.13)';x.fillRect(0,0,W,H);G.vignette(x,W,H,{a:.55,col:'#4a1a9a'})}
      else G.vignette(x,W,H,{a:.34+nk*.12,col:'#05020a'});
      /* HUD no canvas */
      const u=Math.max(1,G.fs(13)/16);
      G.hud.panel(x,8,8,86*u,40*u,{acc:A.acc,a:.9});
      {const cx=8+22*u,cy=8+20*u,r=13*u,dc=S.dcd>0?1-S.dcd/2.6:1;x.lineWidth=4*u;x.strokeStyle='rgba(255,255,255,.18)';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();x.strokeStyle=dc>=1?'#8fe8ff':'#8a7aa8';x.beginPath();x.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+dc*Math.PI*2);x.stroke();
        if(dc>=1)G.glow(x,cx,cy,r*1.9,'#8fe8ff',.35);G.icon(x,'raio',cx,cy,15*u,dc>=1?'#e6fbff':'#9a8ab8');
        const dj=!S.gnd&&!S.dj,jx=8+62*u;x.strokeStyle=dj?'#ffd36b':S.gnd?'rgba(255,255,255,.55)':'rgba(255,255,255,.2)';x.lineWidth=3*u;x.lineCap='round';x.lineJoin='round';
        for(let k=0;k<2;k++){const yy=cy-6*u+k*9*u;x.beginPath();x.moveTo(jx-9*u,yy+4*u);x.lineTo(jx,yy-4*u);x.lineTo(jx+9*u,yy+4*u);x.stroke()}x.lineCap='butt'}
      {let X=8+86*u+8*u;const row=(on,k,v)=>{if(!on)return;G.draw(x,art.medal(k),X+13*u,8+17*u,{w:26*u});if(v!=null)G.hud.bar(x,X+1*u,8+34*u,24*u,4*u,v,{col:art.PWC[k]});X+=32*u};
        row(S.sh,'sh');row(S.mag>0,'mag',S.mag/8);row(S.slow>0,'sl',S.slow/5)}
      G.hud.chip(x,W-10,8+16*u,{icon:'bandeira',text:String(meters()).padStart(5,'0')+' m',col:A.acc,size:17,al:'right'});
      if(bk){const BB=RNB40[rnBio40(bk*1000*RN40.M)].boss,left=Math.max(0,bk*1000+R.BZ-m)/R.BZ,by=8+40*u+G.fs(12)*1.35;
        G.hud.bar(x,W/2-120,by,240,9*u,left,{col:BB.c,segs:9});G.hud.text(x,`Fuja de ${BB.n}`,W/2,by-G.fs(12)*.75,{size:12,al:'center',w:800,max:W-40})}
      G.hud.frame(x,W,H,{acc:A.acc,a:.55});
      if(S.runT-S.bioT<2.2)G.hud.banner(x,W,H,B.n,{sub:`Mini-chefe: ${B.boss.n}`,k:Math.min(1,(2.2-(S.runT-S.bioT))/.5),acc:A.acc,y:H*.46});
      if(S.dead&&!MG.over)G.hud.banner(x,W,H,`Você parou em ${meters()} m`,{sub:'Assistindo os outros…',acc:'#ff9b8a',y:H*.44});
    }
  };
}
Object.assign(ACH,{
  rn_chefe:{ico:'👹',n:'Caçado e Vivo',d:'Sobreviva a um mini-chefe no Corredor do Vazio.'},
  rn_espelho:{ico:'🪞',n:'Turista do Véu',d:'Chegue ao Espelho de Ilusão no Corredor do Vazio.'},
  rn_dash:{ico:'💨',n:'Atravessando o Vazio',d:'Atravesse 10 obstáculos com o Dash numa corrida.'},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='rn40')return`<div>${b('ArrowDown','▼','','Agachar')}${b('KeyE','Dash','','Dash')}</div><div>${b('Space','⤒ Pular','wide')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('runner',{...GAMES12.runner,make:runner40,setup:rnSetup40,pad:'rn40',top3:true,
  desc:'5 biomas que mudam a cada 1000 m, cada um com seu mini-chefe, pulo duplo, Dash, fendas, plataformas e 3 poderes.',
  rule:'Mesma pista para todos, os colegas correm como fantasmas. Metros + orbes (10 cada) + chefes (150 cada). Vence quem fizer mais pontos.',
  keys:'Espaço, ↑ ou W pulam (segure: mais alto · no ar: pulo duplo) · ↓ ou S agacham · Shift, E ou →: Dash',touch:'⤒ pula (segure mais alto) · ▼ agacha · 💨 Dash'});
console.info('[Tulpa] Etapa 40 carregada (Corredor do Vazio 2.0)');

/* ===================================================================
   TULPA · ETAPA 41 — 🕹 ARCADE 2.0 · ONDA 2 (parte 2)
   🧱 SALTO PARA O VAZIO 2.0
   Campanha em 5 Capítulos (34 fases desenhadas à mão), respawn na hora.
   Wall-jump, Dash Aéreo em 8 direções (recarrega no chão e nos cristais
   ✦), molas, blocos que desmoronam, serras móveis, espinhos que
   alternam no ritmo e chaves que destrancam a saída.
   Cronômetro por fase com medalhas (Ouro, Prata, Bronze), contador de
   quedas, fantasma do seu recorde e fantasmas da Mesa.
   Legenda: # parede · ^ espinho · S início · E saída · m mola
            ~ bloco que desmorona · * cristal do Dash · k chave
            o serra (movimento em meta) · a / b espinhos do ritmo
   A física é pura (svStep41) e o teste resolve todas as fases.
   =================================================================== */
const SV41={T:25,G:2400,JV:Math.sqrt(2*2400*25*3.6),SPD:230,PW:16,PH:20,DSP:560,DT:.15,SPR:1.55};
function svMap41(rows){const g=Array.from({length:18},(_,y)=>y===0||y>=16?'#'.repeat(32).split(''):('#'+'.'.repeat(30)+'#').split(''));
  rows.forEach(([y,x,s])=>{for(let i=0;i<s.length;i++)if(x+i<32)g[y][x+i]=s[i]});return g.map(r=>r.join(''))}
const col41=(x,y0,y1,c='#')=>Array.from({length:y1-y0+1},(_,i)=>[y0+i,x,c]);
const SVCH41=[
  {n:'Primeiros Passos',ico:'🕯',el:'Fé',c:'#ffd36b',d:'Corrida, pulo e wall-jump.',lv:VAZIO_LV.map((g,i)=>({n:['Primeiros passos','Degraus','Poço do wall-jump','Ponte de espinhos','Zigue-zague','Torre','Espinhos no teto','Chaminé','Salto de fé','O Vazio'][i],g}))},
  {n:'Raízes e Molas',ico:'🌿',el:'Natureza',c:'#7dffa8',d:'Molas e blocos que desmoronam.',lv:[
    {n:'Primeira mola',g:svMap41([[15,2,'S'],[15,12,'m'],...[9,10,11,12,13,14,15].map(y=>[y,14,'####']),[15,28,'E']])},
    {n:'Escada de molas',g:svMap41([[15,1,'S'],[15,3,'m'],[15,4,'^'.repeat(27)],[11,7,'#####'],[10,10,'m'],[7,16,'#####'],[4,22,'#####'],[3,24,'E']])},
    {n:'Chão que cede',g:svMap41([[15,1,'###'],[15,4,'~'.repeat(23)],[15,27,'####'],[16,4,'^'.repeat(23)],[14,2,'S'],[14,15,'^'],[14,28,'E']])},
    {n:'Mola e parede',g:svMap41([[3,1,'######'],...col41(6,4,12),...col41(10,4,15),[15,8,'m'],[15,2,'S'],[2,3,'E']])},
    {n:'Ponte podre',g:svMap41([[15,2,'S'],[16,4,'^'.repeat(27)],[14,6,'~~~'],[12,10,'~~~'],[10,14,'~~~'],[8,18,'~~~'],[6,22,'~~~'],[4,26,'####'],[3,27,'E']])},
    {n:'Floresta vertical',g:svMap41([[15,2,'S'],[16,10,'^'.repeat(21)],[15,8,'m'],[9,14,'######'],[8,16,'m'],[5,8,'~~~~'],[3,1,'####'],[2,2,'E']])},
  ]},
  {n:'Dash do Vazio',ico:'🕳',el:'Inexistência',c:'#b9a6ff',d:'Dash em 8 direções e cristais que recarregam.',lv:[
    {n:'Primeiro dash',g:svMap41([[15,2,'S'],[16,10,'^'.repeat(7)],[15,26,'E']])},
    {n:'Dash para cima',g:svMap41([[15,2,'S'],[9,16,'########'],[8,19,'E']])},
    {n:'Cristais',g:svMap41([[15,2,'S'],[16,5,'^'.repeat(22)],[12,10,'*'],[12,16,'*'],[12,22,'*'],[15,28,'E']])},
    {n:'Fresta',g:svMap41([...col41(16,3,6),...col41(16,10,15),[15,2,'S'],[15,27,'E']])},
    {n:'Dash e parede',g:svMap41([...col41(7,5,15),...col41(10,5,15),[15,8,'S'],[15,11,'^'.repeat(20)],[3,14,'*'],[4,22,'#####'],[3,24,'E']])},
    {n:'Travessia do Vazio',g:svMap41([[15,2,'S'],[16,4,'^'.repeat(25)],[11,8,'*'],[10,14,'*'],[11,20,'*'],[10,25,'*'],[15,30,'E']])},
  ]},
  {n:'Serras e Ritmo',ico:'🌀',el:'Ilusão',c:'#c39bff',d:'Serras que se movem e espinhos no compasso.',lv:[
    {n:'Primeira serra',g:svMap41([[15,2,'S'],[15,14,'o'],[12,22,'o'],[15,28,'E']]),saw:[['x',5,2.4],['y',2,1.6]]},
    {n:'Compasso',g:svMap41([[15,2,'S'],[15,4,'aaa.bbb.aaa.bbb.aaa.bbb'],[15,29,'E']])},
    {n:'Serras verticais',g:svMap41([[15,2,'S'],[16,5,'^'.repeat(26)],[13,5,'####'],[10,11,'####'],[7,17,'####'],[4,23,'#####'],[3,25,'E'],[11,9,'o'],[8,15,'o'],[5,21,'o']]),saw:[['y',1.2,1.4],['y',1.2,1.2],['y',1.2,1.1]]},
    {n:'Ritmo aéreo',g:svMap41([[15,2,'S'],[16,4,'^'.repeat(27)],[14,5,'######'],[13,7,'aa'],[12,13,'######'],[11,15,'bb'],[10,21,'######'],[9,23,'aa'],[8,28,'##'],[7,29,'E']])},
    {n:'Serra e dash',g:svMap41([[15,2,'S'],[16,9,'^'.repeat(8)],[12,13,'o'],[15,27,'E']]),saw:[['x',2,1.8]]},
    {n:'Espelho quebrado',g:svMap41([[15,2,'S'],[16,6,'^'.repeat(25)],[13,7,'###'],[12,8,'a'],[10,13,'*'],[11,17,'###'],[8,18,'o'],[9,24,'####'],[8,25,'b'],[8,27,'E']]),saw:[['x',1.5,1.5]]},
  ]},
  {n:'Chaves da Verdade',ico:'👁',el:'Verdade',c:'#7fe3ff',d:'Pegue todas as chaves 🔑 para abrir a saída.',lv:[
    {n:'Uma chave',g:svMap41([[15,2,'S'],...col41(13,6,13),[8,9,'####'],[7,10,'k'],[15,28,'E']])},
    {n:'Duas chaves',g:svMap41([[15,8,'S'],[15,3,'m'],[7,3,'k'],[15,28,'m'],[7,28,'k'],[15,15,'E']])},
    {n:'Chave na ponte',g:svMap41([[15,2,'S'],[16,6,'^'.repeat(20)],[13,7,'~~~'],[11,12,'~~~'],[13,17,'~~~'],[10,13,'k'],[15,29,'m'],[8,24,'####'],[7,25,'E']])},
    {n:'Chave atrás da serra',g:svMap41([[15,2,'S'],[13,10,'##########'],[12,18,'k'],[12,14,'o'],[15,28,'E']]),saw:[['x',3,2]]},
    {n:'Chave e cristal',g:svMap41([[15,2,'S'],[16,6,'^'.repeat(18)],[9,14,'k'],[11,10,'*'],[11,18,'*'],[15,27,'E']])},
    {n:'A Grande Sentença',g:svMap41([[15,2,'S'],[15,5,'m'],[7,5,'k'],[16,8,'^'.repeat(14)],[14,9,'~~~~'],[14,15,'~~~~'],[13,17,'k'],[15,23,'aaa'],[13,26,'o'],[15,29,'k'],[15,21,'E']]),saw:[['y',1.5,1.5]]},
  ]},
];
/* tempos de referência (s) das medalhas de ouro: do resolvedor × 1,3 */
const SVPAR41=[[4.5,4.5,3.5,5.0,5.5,4.5,5.0,6.5,5.0,8.0],[5.0,5.5,4.5,3.5,5.0,7.0],[3.5,3.0,4.0,3.5,3.5,4.5],[3.5,3.5,3.5,3.5,3.5,4.0],[6.5,5.5,3.5,3.5,3.5,4.5]];
const svLvId41=(c,l)=>c+'-'+l;
function svLevel41(c,l,gd){
  const ch=SVCH41[c],d=ch.lv[l],g=d.g,li=GD12[gd]??1,T=SV41.T;let sx=2,sy=15;const saws=[],cr=[],cy=[],keys=[];let si=0;
  for(let y=0;y<18;y++)for(let x=0;x<32;x++){const k=g[y][x];
    if(k==='o'){const m=(d.saw||[])[si++]||['x',2,2];saws.push({x:x*T+T/2,y:y*T+T/2,ax:m[0],r:m[1]*T,p:m[2]/[.75,1,1.15,1.3][li]})}
    if(k==='~')cr.push(y*32+x);if(k==='*')cy.push(y*32+x);if(k==='k')keys.push(y*32+x)}
  const fs=g.findIndex(r=>r.includes('S'));if(fs>=0){sy=fs;sx=g[fs].indexOf('S')}
  const par=(SVPAR41[c]||[])[l]||8;
  return{c,l,dash:c>=2,id:svLvId41(c,l),n:d.n,g,saws,cr,cy,keys,nk:keys.length,spawn:[sx*T+T/2,sy*T+T-SV41.PH/2],P:[1.5,1.2,1.05,.95][li],par,medals:[par,par*1.6,par*2.5],timed:saws.length>0||g.some(r=>/[ab]/.test(r))};
}
const svSt041=L=>({x:L.spawn[0],y:L.spawn[1],vx:0,vy:0,ground:false,wall:0,coyote:0,buf:0,lock:0,dT:0,ddx:0,ddy:0,can:true,t:0,keys:0,crs:{},cys:{},dead:false,done:false,face:1,ev:''});
const svClone41=S=>({...S,crs:{...S.crs},cys:{...S.cys}});
function svTile41(L,S,tx,ty){if(tx<0||ty<0||tx>=32||ty>=18)return'#';const c=L.g[ty][tx];if(c==='~'){const q=S.crs[ty*32+tx];if(q&&S.t>=q.st+.45&&S.t<q.gone)return'.'}return c}
const svSolid41=(L,S,px,py)=>{const c=svTile41(L,S,Math.floor(px/SV41.T),Math.floor(py/SV41.T));return c==='#'||c==='~'};
function svHit41(L,S,nx,ny){const P=SV41;for(const[ox,oy]of[[-P.PW/2,-P.PH/2],[P.PW/2-.01,-P.PH/2],[-P.PW/2,P.PH/2-.01],[P.PW/2-.01,P.PH/2-.01],[-P.PW/2,0],[P.PW/2-.01,0]])if(svSolid41(L,S,nx+ox,ny+oy))return true;return false}
const svSaw41=(o,t)=>{const k=Math.sin(Math.PI*2*t/o.p)*o.r;return o.ax==='x'?[o.x+k,o.y]:[o.x,o.y+k]};
const svRh41=(L,t,c)=>{const on=Math.floor(t/L.P)%2===0;return c==='a'?on:!on};
/* inp: {dx,dy (setas), jump (toque novo), dash (toque novo)} */
function svStep41(L,S,inp,dt){
  if(S.dead||S.done)return;const P=SV41,T=P.T;S.ev='';S.t+=dt;
  if(inp.jump)S.buf=.12;
  const dir=inp.dx|0;if(dir)S.face=dir;
  S.lock=Math.max(0,S.lock-dt);S.buf=Math.max(0,S.buf-dt);S.coyote=S.ground?.09:Math.max(0,S.coyote-dt);
  S.dcd=Math.max(0,(S.dcd||0)-dt);
  if(inp.dash&&L.dash&&S.can&&S.dT<=0&&S.dcd<=0){let dx=inp.dx|0,dy=inp.dy|0;if(!dx&&!dy)dx=S.face;const n=Math.hypot(dx,dy);S.ddx=dx/n;S.ddy=dy/n;S.dT=P.DT;S.can=false;S.vx=S.ddx*P.DSP;S.vy=S.ddy*P.DSP;S.ev='dash'}
  if(S.dT>0){S.dT-=dt;if(S.dT<=0){S.vx=S.ddx*300;S.vy=S.ddy*250;S.dcd=.3}}
  else{
    if(S.lock<=0)S.vx+=(dir*P.SPD-S.vx)*Math.min(1,dt*(S.ground?18:9));
    const wl=svHit41(L,S,S.x-2,S.y)&&!S.ground,wr=svHit41(L,S,S.x+2,S.y)&&!S.ground;S.wall=wl?-1:wr?1:0;
    if(S.buf>0){if(S.coyote>0){S.vy=-P.JV;S.buf=0;S.coyote=0;S.ev='jump'}else if(S.wall){S.vy=-P.JV*.92;S.vx=-S.wall*P.SPD*1.25;S.lock=.16;S.buf=0;S.ev='wall'}}
    S.vy+=P.G*dt;if(S.wall&&S.vy>0&&dir===S.wall)S.vy=Math.min(S.vy,110);S.vy=Math.min(S.vy,900);
  }
  const sub=3;S.ground=false;
  for(let i=0;i<sub;i++){const nx=S.x+S.vx*dt/sub;if(svHit41(L,S,nx,S.y)){S.vx=0}else S.x=nx;const ny=S.y+S.vy*dt/sub;if(svHit41(L,S,S.x,ny)){if(S.vy>0)S.ground=true;S.vy=0}else S.y=ny}
  if(!S.ground&&svHit41(L,S,S.x,S.y+1))S.ground=true;
  if(S.ground&&S.dT<=0)S.can=true;
  /* blocos que desmoronam: pisou, começa a contar */
  if(S.ground)for(const ox of[-P.PW/2+1,P.PW/2-1]){const tx=Math.floor((S.x+ox)/T),ty=Math.floor((S.y+P.PH/2+1)/T),id=ty*32+tx;if(L.g[ty]&&L.g[ty][tx]==='~'){const q=S.crs[id];if(!q||(q.gone&&q.gone<=S.t))S.crs[id]={st:S.t,gone:S.t+.45+2.5}}}
  for(const id in S.crs){const q=S.crs[id];if(S.t>=q.st+.45&&S.t<q.gone&&!q.fell){q.fell=1}}
  /* cristais, chaves, molas, espinhos, saída */
  for(const oy of[-P.PH/2+3,P.PH/2-3])for(const ox of[-P.PW/2+3,P.PW/2-3]){
    const tx=Math.floor((S.x+ox)/T),ty=Math.floor((S.y+oy)/T),c=svTile41(L,S,tx,ty),id=ty*32+tx;
    if(c==='^'||((c==='a'||c==='b')&&svRh41(L,S.t,c))){S.dead=true;S.ev='die';return}
    if(c==='*'&&!S.can&&!(S.cys[id]>S.t)){S.can=true;S.cys[id]=S.t+2;S.ev='crys'}
    if(c==='k'){const b=L.keys.indexOf(id);if(b>=0&&!(S.keys&(1<<b))){S.keys|=1<<b;S.ev='key'}}
    if(c==='m'&&S.vy>=0&&S.dT<=0){S.vy=-P.JV*P.SPR;S.ground=false;S.can=true;S.ev='spring'}
    if(c==='E'&&S.keys===(1<<L.nk)-1){S.done=true;S.ev='exit';return}
  }
  for(const o of L.saws){const[sx,sy]=svSaw41(o,S.t);if(Math.hypot(S.x-sx,S.y-sy)<18){S.dead=true;S.ev='die';return}}
  if(S.y>18*T+40){S.dead=true;S.ev='die'}
}
T3.sv41={chapters:SVCH41,level:svLevel41,step:svStep41,st0:svSt041,clone:svClone41,saw:svSaw41,rh:svRh41};
function svProg41(){const p=prog38().sv||{};return{lv:p.lv||{},cap:p.cap||{},gh:p.gh||{}}}
const svOpenCap41=c=>c===0||!!svProg41().cap[c-1];
const svOpenLv41=(c,l)=>svOpenCap41(c)&&(l===0||!!svProg41().lv[svLvId41(c,l-1)]);
const svMedal41=(L,t)=>t<=L.medals[0]?'ouro':t<=L.medals[1]?'prata':t<=L.medals[2]?'bronze':'';
const MED41={ouro:'🥇',prata:'🥈',bronze:'🥉','':'✓'};

const svSetup41={
  intro:o=>o._m==='mesa'?'Todos jogam as fases do capítulo, uma depois da outra. Vence quem terminar primeiro; em 6 minutos, quem chegou mais longe.':'Cinco capítulos, uma mecânica nova em cada. Termine um capítulo para abrir o próximo. Cada fase tem cronômetro e medalha.',
  def:()=>{let c=0;while(c<4&&svOpenCap41(c+1))c++;return{cap:String(c),lv:'all'}},
  fields:o=>{const mesa=o._m==='mesa',p=svProg41(),c=+o.cap||0,ch=SVCH41[c];
    const F=[{k:'cap',l:'Capítulo',wide:1,opts:SVCH41.map((C,i)=>{const lock=!mesa&&!svOpenCap41(i),done=C.lv.filter((_,j)=>p.lv[svLvId41(i,j)]).length,gold=C.lv.filter((_,j)=>p.lv[svLvId41(i,j)]?.m==='ouro').length;
      return{v:String(i),n:`${i+1}. ${C.n}`,ico:C.ico,d:lock?`Termine o capítulo ${i} para abrir.`:`${C.d} ${C.lv.length} fases.`,lock,badge:done?`${done}/${C.lv.length}${gold?` · 🥇${gold}`:''}`:''}})}];
    if(!mesa)F.push({k:'lv',l:'Fase',opts:[{v:'all',n:'Capítulo inteiro',ico:'📜',d:'Todas as fases seguidas, com tempo total.'},...ch.lv.map((L,j)=>{const r=p.lv[svLvId41(c,j)],lock=!svOpenLv41(c,j);return{v:String(j),n:`${j+1}. ${L.n}`,d:lock?'Termine a fase anterior.':r?`Recorde ${r.t.toFixed(2)} s`:'Ainda não feita',lock,badge:r?MED41[r.m||'']:''}})]});
    return F},
  fix:o=>{let c=Math.max(0,Math.min(4,+o.cap||0));if(o._m!=='mesa')while(c>0&&!svOpenCap41(c))c--;o.cap=String(c);if(o._m==='mesa')o.lv='all';
    if(o.lv!=='all'){let l=Math.max(0,Math.min(SVCH41[c].lv.length-1,+o.lv||0));if(!svOpenLv41(c,l))o.lv='all';else o.lv=String(l)}},
  sum:o=>{const ch=SVCH41[+o.cap||0];return`${ch.ico} Capítulo ${+o.cap+1}: ${ch.n}. A/D ou setas andam, Espaço ou K pula (W/↑ também, até o Capítulo 2), J/X/Shift dá o Dash na direção das setas (W/↑ miram para cima), R reinicia a fase. Medalhas: 🥇 ouro, 🥈 prata, 🥉 bronze pelo tempo.`}
};

function vazio41(C){
  const W=800,H=450,P=SV41,T=P.T,o=C.room.opt||{},c=Math.max(0,Math.min(4,+o.cap||0)),ch=SVCH41[c],mesa=!!C.net;
  const list=o.lv!=='all'&&!mesa?[+o.lv||0]:ch.lv.map((_,j)=>j);
  const G={i:0,L:null,S:null,keys:{},jq:false,dq:false,deaths:0,dl:0,t:0,res:[],parts:[],flash:0,fin:false,gh:{},sentAt:0,fins:{},rec:[],recT:0,best:null,limit:360,rw:null,shown:0};
  const me=me16(C);
  function load(k){G.i=k;G.L=svLevel41(c,list[k],C.gd);G.S=svSt041(G.L);G.lt=0;G.dl=0;G.rec=[];G.recT=0;G.best=svProg41().gh[G.L.id]||null;G.shown=pnow38()}
  function respawn(){const t=G.S.t;G.S=svSt041(G.L);G.S.t=t;G.rec=[]}
  function die(){G.deaths++;G.dl++;fx5('error');for(let i=0;i<14;i++)G.parts.push({x:G.S.x,y:G.S.y,vx:(Math.random()-.5)*420,vy:(Math.random()-.8)*420,t:0});G.flash=.15;C.fx?.shake(4,.15);respawn()}
  function levelDone(){
    const L=G.L,t=G.lt,m=svMedal41(L,t);fx5('mgWin');C.fx?.burst(G.S.x,G.S.y,{n:24,kind:'star',col:[ch.c,'#fff'],sp:220,life:.7});
    let rec=false,first=false,newGold=false;
    progPut38(p=>{p.sv=p.sv||{};p.sv.lv=p.sv.lv||{};p.sv.gh=p.sv.gh||{};p.sv.cap=p.sv.cap||{};const q=p.sv.lv[L.id];first=!q;
      if(!q||t<q.t){rec=true;p.sv.lv[L.id]={t:Math.round(t*100)/100,m,d:Math.min(q?.d??99,G.dl)};p.sv.gh[L.id]=G.rec.slice(0,1400)}
      else if(G.dl<(q.d??99))q.d=G.dl;
      newGold=m==='ouro'&&q?.m!=='ouro';if(newGold&&!rec)p.sv.lv[L.id].m='ouro';
      if(ch.lv.every((_,j)=>p.sv.lv[svLvId41(c,j)])){if(!p.sv.cap[c]){p.sv.cap[c]=1;G.capNew=true}}
      if(SVCH41.every((_,i)=>p.sv.cap[i])){C.achieve?.('sv_tudo');C.achieve?.('vazio')}});
    if(m==='ouro')C.achieve?.('sv_ouro');
    G.res.push({n:L.n,t,m,d:G.dl,rec,first,newGold});
    C.fx?.float(W/2,140,`${MED41[m]} ${L.n} · ${t.toFixed(2)} s${rec?' · recorde!':''}`,{col:ch.c,size:22,life:1.6});
    if(G.i<list.length-1){load(G.i+1);return}
    finishRun(true);
  }
  function finishRun(all){
    if(G.fin)return;G.fin=true;
    if(all&&list.length>1){C.achieve?.('sv_cap');if(G.deaths===0)C.achieve?.('sv_zero')}
    const pts={ouro:8,prata:5,bronze:3,'':1};const mul=gdMul38(C.gd);
    let ob=G.res.reduce((a,r)=>a+pts[r.m],0)*mul+G.res.filter(r=>r.newGold).length*5+(G.capNew?30:0);
    G.rw={ob:Math.round(ob),xp:Math.round(ob*.6),why:[`${G.res.length} fase${G.res.length>1?'s':''}`,G.capNew?'capítulo novo':'',G.res.some(r=>r.newGold)?'ouro novo':''].filter(Boolean).join(' · ')};
    const score=Math.max(0,Math.round(G.res.length*1000-G.t*10-G.deaths*20));
    if(mesa){C.send('svfin',{n:G.res.length,t:G.t,s:score});fins(C.me,{n:G.res.length,t:G.t,s:score});return}
    C.finish({title:all?(list.length>1?`📜 ${ch.n} concluído · ${G.t.toFixed(1)} s · ${G.deaths} quedas`:`${MED41[G.res[0].m]} ${G.res[0].n} · ${G.res[0].t.toFixed(2)} s`):`${ch.n} · ${G.res.length} de ${list.length} fases`,rows:[{u:C.me,n:me.n,c:me.c,s:score,w:all}],unit:'pts',html:html()});
  }
  function html(){if(!G.res.length)return'<p class="sub">Nenhuma fase concluída desta vez.</p>';
    return`<table class="r38-t"><caption>Suas fases</caption><thead><tr><th scope="col">Fase</th><th scope="col">Tempo</th><th scope="col">Medalha</th><th scope="col">Quedas</th></tr></thead><tbody>${G.res.map(r=>`<tr><th scope="row">${esc(r.n)}</th><td>${r.t.toFixed(2)} s${r.rec?' 🆕':''}</td><td>${MED41[r.m]} ${r.m||'sem medalha'}</td><td>${r.d}</td></tr>`).join('')}</tbody></table>${G.capNew?`<p class="r38-hi">📜 Capítulo concluído!${c<4?` ${esc(SVCH41[c+1].n)} foi aberto.`:' Você dominou o Vazio.'}</p>`:''}`}
  function fins(u,r){G.fins[u]={n:+r.n||0,t:+r.t||0,s:+r.s||0};check()}
  function check(){if(!C.host||G.closed)return;if(!C.players.every(p=>G.fins[p.u]))return;G.closed=true;
    const rows=C.players.map(p=>{const f=G.fins[p.u];return{u:p.u,n:p.n,c:p.c,s:f.s,st:f.n>=list.length?`✓ ${f.t.toFixed(1)} s`:`${f.n}/${list.length} fases`,_n:f.n,_t:f.t,w:false}}).sort((a,b)=>b._n-a._n||a._t-b._t);
    if(rows[0]&&rows[0]._n>0)rows[0].w=true;rows.forEach(r=>{delete r._n;delete r._t});
    C.finish({title:rows[0]?.w?`🧱 ${ch.n} · vitória de ${rows[0].n}`:`🧱 ${ch.n} · ninguém passou da 1ª fase`,rows,unit:'pts'})}
  load(0);
  const K=G.keys,dirX=()=>((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0),dirY=()=>((K.KeyS||K.ArrowDown)?1:0)-((K.KeyW||K.ArrowUp)?1:0);
  return{
    st:()=>G,
    key(code,down){K[code]=down;if(!down)return;
      if(['Space','KeyK'].includes(code)||(!G.L.dash&&['KeyW','ArrowUp'].includes(code)))G.jq=true;
      if(['KeyJ','KeyX','ShiftLeft','ShiftRight','KeyL'].includes(code))G.dq=true;
      if(code==='KeyR'&&!G.fin)die();
      if(code==='KeyQ'&&!G.fin){if(mesa)finishRun(false);else finishRun(false)}},
    msg(p){if(p.t==='pos'&&p.from!==C.me)G.gh[p.from]={...p};if(p.t==='svfin'){G.gh[p.from]={...(G.gh[p.from]||{}),done:1};if(C.host)fins(p.from,p)}},
    left(u){if(C.host&&mesa){G.fins[u]=G.fins[u]||{n:0,t:0,s:0};C.players=C.players.filter(p=>p.u!==u);check()}},
    reward:()=>G.rw,
    next(){if(mesa||list.length>1||!G.res.length)return null;const l=list[0];if(l<ch.lv.length-1)return{opt:{lv:String(l+1)},label:`Próxima fase: ${ch.lv[l+1].n}`};if(c<4&&svOpenCap41(c+1))return{opt:{cap:String(c+1),lv:'all'},label:`Capítulo ${c+2}: ${SVCH41[c+1].n}`};return null},
    step(dt){
      G.parts=G.parts.filter(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=1200*dt;return p.t<.7});G.flash=Math.max(0,G.flash-dt);
      if(Date.now()<C.t0||G.fin){if(G.fin&&mesa&&C.host&&!G.closed&&G.t>=G.limit){G.wt=(G.wt||0)+dt;if(G.wt>4){C.players.forEach(p=>{G.fins[p.u]=G.fins[p.u]||{n:Number(G.gh[p.u]?.i||0),t:G.t,s:Number(G.gh[p.u]?.i||0)*1000-G.t*10}});check()}}if(G.fin)G.t+=dt;return}
      G.t+=dt;G.lt+=dt;
      if(mesa&&G.t>=G.limit){finishRun(false);return}
      const inp={dx:dirX(),dy:dirY(),jump:G.jq,dash:G.dq};G.jq=false;G.dq=false;
      svStep41(G.L,G.S,inp,dt);const ev=G.S.ev;
      if(ev==='jump'||ev==='wall')fx5('mgJump');else if(ev==='dash'){fx5('activate');C.fx?.burst(G.S.x,G.S.y,{n:10,col:[ch.c,'#fff'],sp:160,life:.35,size:2.4,grav:0})}
      else if(ev==='spring'){fx5('activate');C.fx?.burst(G.S.x,G.S.y+10,{n:10,col:'#ffd36b',sp:160,life:.4,ang:-Math.PI/2,spread:1})}
      else if(ev==='crys'){fx5('confirm');C.fx?.burst(G.S.x,G.S.y,{n:12,kind:'star',col:['#8fe8ff','#fff'],sp:140,life:.4})}
      else if(ev==='key'){fx5('coin20');C.fx?.float(G.S.x,G.S.y-30,`🔑 ${countBits(G.S.keys)}/${G.L.nk}`,{col:'#ffd36b',size:20})}
      if(G.S.dead){die();return}
      if(G.S.done){levelDone();return}
      G.recT+=dt;if(G.recT>=.05){G.recT-=.05;G.rec.push([Math.round(G.S.x),Math.round(G.S.y)])}
      if(mesa&&Date.now()-G.sentAt>100){G.sentAt=Date.now();C.send('pos',{x:Math.round(G.S.x),y:Math.round(G.S.y),lv:G.i,i:G.i})}
      const L=G.L,nx=svMedal41(L,G.lt);
      C.hud(`${ch.ico} <b>${esc(L.n)}</b> · fase ${G.i+1}/${list.length} · ⏱ ${G.lt.toFixed(2)} s ${nx?MED41[nx]:'⌛'} · ☠ ${G.deaths}${L.nk?` · 🔑 ${countBits(G.S.keys)}/${L.nk}`:''}${L.dash&&G.S.can?' · 💨 pronto':''}${mesa?` · ⏱ ${Math.max(0,Math.ceil(G.limit-G.t))} s`:''}`);
    },
    draw(x){
      const L=G.L,S=G.S,pn=pnow38();
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0d0a14');gr.addColorStop(1,'#1a1226');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.globalAlpha=.06;txt16(x,ch.ico,W/2,H/2,{size:260});x.globalAlpha=1;
      const allK=S.keys===(1<<L.nk)-1;
      for(let y=0;y<18;y++)for(let xx=0;xx<32;xx++){const cc=L.g[y][xx],X=xx*T,Y=y*T;
        if(cc==='#'){x.fillStyle='#3b2a4a';x.fillRect(X,Y,T,T);x.fillStyle='#5a4370';x.fillRect(X,Y,T,3)}
        else if(cc==='~'){const q=S.crs[y*32+xx],gone=q&&q.gone>S.t&&S.t>=q.st+.45,shk=q&&S.t<q.st+.45?(Math.random()-.5)*3:0;if(!gone){x.fillStyle='#6b4a2a';x.fillRect(X+shk,Y,T,T);x.strokeStyle='#a87a4a';x.lineWidth=1.5;x.beginPath();x.moveTo(X+4+shk,Y+6);x.lineTo(X+12+shk,Y+14);x.lineTo(X+20+shk,Y+8);x.stroke()}else{x.strokeStyle='rgba(168,122,74,.35)';x.setLineDash([3,3]);x.strokeRect(X+1,Y+1,T-2,T-2);x.setLineDash([])}}
        else if(cc==='^'){x.fillStyle='#ff4a6a';x.beginPath();for(let k=0;k<3;k++){x.moveTo(X+k*T/3,Y+T);x.lineTo(X+k*T/3+T/6,Y+6);x.lineTo(X+(k+1)*T/3,Y+T)}x.fill()}
        else if(cc==='a'||cc==='b'){const on=svRh41(L,S.t,cc),ph=(S.t%L.P)/L.P,warn=!on&&ph>.8;x.fillStyle=on?'#ff4a6a':warn?'#ffb36b':'rgba(255,74,106,.25)';const h=on?T-6:6;x.beginPath();for(let k=0;k<3;k++){x.moveTo(X+k*T/3,Y+T);x.lineTo(X+k*T/3+T/6,Y+T-h);x.lineTo(X+(k+1)*T/3,Y+T)}x.fill();txt16(x,cc==='a'?'·':'··',X+T/2,Y+T-2,{size:9,col:'rgba(255,255,255,.5)'})}
        else if(cc==='m'){x.fillStyle='#ffd36b';x.fillRect(X+3,Y+T-6,T-6,6);x.strokeStyle='#ffd36b';x.lineWidth=2;x.beginPath();for(let k=0;k<3;k++){x.moveTo(X+5,Y+T-8-k*5);x.lineTo(X+T-5,Y+T-10-k*5)}x.stroke()}
        else if(cc==='*'){const id=y*32+xx,hid=S.cys[id]>S.t;x.save();x.globalAlpha=hid?.2:1;x.fillStyle='#8fe8ff';x.translate(X+T/2,Y+T/2);x.rotate(pn/400);x.beginPath();x.moveTo(0,-10);x.lineTo(6,0);x.lineTo(0,10);x.lineTo(-6,0);x.closePath();x.fill();x.restore()}
        else if(cc==='k'){const b=L.keys.indexOf(y*32+xx);if(!(S.keys&(1<<b)))txt16(x,'🔑',X+T/2,Y+T/2+Math.sin(pn/250+b)*3,{size:18})}
        else if(cc==='E'){const p=.5+.5*Math.sin(pn/200);x.beginPath();x.arc(X+T/2,Y+T/2,10+p*3,0,TAU16);x.fillStyle=allK?'#c39bff':'#4a3f55';x.fill();txt16(x,allK?'✦':'🔒',X+T/2,Y+T/2,{size:allK?14:12,col:'#fff'})}}
      for(const o of L.saws){const[sx,sy]=svSaw41(o,S.t);x.save();x.translate(sx,sy);x.rotate(pn/60);x.fillStyle='#d7d7e0';x.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,r=k%2?8:12;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#ff4a6a';x.beginPath();x.arc(0,0,3,0,7);x.fill();x.restore()}
      if(G.best&&G.best.length){const p=G.best[Math.min(G.best.length-1,Math.floor(G.lt/.05))];if(p){sprAt16(x,me.c,p[0],p[1]-2,26,0,.28);txt16(x,'recorde',p[0],p[1]-22,{size:9,col:'rgba(255,255,255,.55)'})}}
      for(const u in G.gh){const g=G.gh[u];if(g.lv!==G.i||g.done)continue;const p=C.players.find(q=>q.u===u);sprAt16(x,p?p.c:0,g.x,g.y,26,0,.4);if(MG.drawn&&p)MG.drawn[p.n]=.4}
      G.parts.forEach(p=>{x.fillStyle=`rgba(255,74,106,${1-p.t/.7})`;x.fillRect(p.x-3,p.y-3,6,6)});
      if(!G.fin){if(S.dT>0){x.globalAlpha=.35;sprAt16(x,me.c,S.x-S.ddx*14,S.y-S.ddy*14-2,28,0);x.globalAlpha=1}
        sprAt16(x,me.c,S.x,S.y-2,28,S.wall?S.wall*.25:0);if(L.dash&&S.can){x.fillStyle='#8fe8ff';x.beginPath();x.arc(S.x,S.y-20,2.5,0,7);x.fill()}}
      if(G.flash>0){x.fillStyle=`rgba(255,74,106,${G.flash*2})`;x.fillRect(0,0,W,H)}
      const m=svMedal41(L,G.lt);txt16(x,`${G.lt.toFixed(2)} s ${m?MED41[m]:''}`,W-12,14,{size:13,al:'right',col:ch.c});
      txt16(x,`🥇 ${L.medals[0].toFixed(1)} · 🥈 ${L.medals[1].toFixed(1)} · 🥉 ${L.medals[2].toFixed(1)}`,W-12,32,{size:10,al:'right',col:'rgba(255,255,255,.6)'});
      if(pn-G.shown<1500){x.save();x.globalAlpha=Math.min(1,(1500-(pn-G.shown))/400);txt16(x,`${G.i+1}. ${L.n}`,W/2,60,{size:26,w:900,col:'#fff',stroke:5});x.restore()}
      if(G.fin&&mesa&&!MG.over)txt16(x,'Aguardando os outros…',W/2,H/2,{size:24,w:800,stroke:5});
    }
  };
}
const countBits=n=>{let c=0;while(n){c+=n&1;n>>=1}return c};
Object.assign(ACH,{
  sv_cap:{ico:'📜',n:'Capítulo Completo',d:'Termine um capítulo inteiro do Salto para o Vazio de uma vez.'},
  sv_ouro:{ico:'🥇',n:'Medalha de Ouro',d:'Ganhe uma medalha de ouro numa fase do Salto para o Vazio.'},
  sv_tudo:{ico:'🏛',n:'Mestre do Vazio',d:'Termine os 5 capítulos do Salto para o Vazio.'},
  sv_zero:{ico:'🪶',n:'Sem Quedas',d:'Termine um capítulo do Salto para o Vazio sem cair nenhuma vez.',secret:true},
});
ACH.vazio&&(ACH.vazio.d='Termine os 5 capítulos do Salto para o Vazio.');
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='sv41')return`<div>${b('KeyA','◀','','Esquerda')}${b('KeyW','▲','','Cima')}${b('KeyS','▼','','Baixo')}${b('KeyD','▶','','Direita')}</div><div>${b('Space','⤒','','Pular')}${b('KeyJ','💨','','Dash')}${b('KeyR','↺','','Reiniciar fase')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('vazio',{...GAMES12.vazio,make:vazio41,setup:svSetup41,pad:'sv41',unit:'pts',top3:true,
  desc:'34 fases em 5 capítulos: molas, blocos que desmoronam, Dash em 8 direções, cristais, serras, espinhos no ritmo e chaves. Medalhas por tempo e fantasma do seu recorde.',
  rule:'Mesa: todos jogam as fases do capítulo em sequência, com fantasmas. Vence quem terminar primeiro; em 6 minutos, quem chegou mais longe.',
  keys:'A/D ou setas andam · Espaço ou K pula (W/↑ também nos Capítulos 1 e 2) · encoste na parede para o wall-jump · J, X ou Shift: Dash na direção das setas · R reinicia · Q encerra',touch:'◀ ▲ ▼ ▶ direção · ⤒ pula · 💨 Dash · ↺ reinicia'});
console.info('[Tulpa] Etapa 41 carregada (Salto para o Vazio 2.0)');

