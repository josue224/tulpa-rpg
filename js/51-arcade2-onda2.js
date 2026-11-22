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

function runner40(C){
  const R=RN40,W=R.W,H=R.H,GY=R.GY,CX=R.CX,o=C.room.opt||{},bi0=Math.max(0,Math.min(4,+o.b||0)),d0=bi0*R.BIO*R.M;
  const L=rnLevel40(C.seed,C.gd,d0),me=me21(C);
  const S=rnSt040(d0);Object.assign(S,{runT:0,cam:d0,parts:[],mile:Math.floor(d0/R.M/250),bioShow:bi0,bioT:-9,jumpQ:false,hold:false,duck:false,dashQ:false});
  const GR=ghostRace(C,S);let fin=null;
  const meters=()=>Math.floor((S.d-d0)/R.M);
  const score=()=>meters()+S.orbs*10+S.bossN*150;
  const day=m=>{const p=(m%1000)/1000;const tr=x=>clamp12(x,0,1);return p<.45?0:p<.5?tr((p-.45)/.05):p<.95?1:1-tr((p-.95)/.05)};
  const mix=(a,b,k)=>{const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)),pb=b.match(/\w\w/g).map(h=>parseInt(h,16));return'#'+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k).toString(16).padStart(2,'0')).join('')};
  function save(){const m=Math.floor(S.d/R.M),reach=Math.min(4,Math.floor(m/R.BIO));let rec=false,newBio=false;
    progPut38(p=>{p.rn=p.rn||{};const q=p.rn;if(reach>(q.reach||0)){q.reach=reach;newBio=true}if(meters()>(q.best||0)){q.best=meters();rec=true}q.bosses=(q.bosses||0)+S.bossN});return{rec,newBio,reach}}
  function die(){
    C.fx?.shake(12,.45);C.fx?.burst(CX,GY+S.y-25,{n:26,col:['#b48cff','#ffd36b','#fff'],sp:260,life:.8,size:3.4,grav:500});
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
      else if(ev==='phase'){C.fx?.float(CX+30,GY+S.y-70,'💨 atravessou',{col:'#8fe8ff',size:15,life:.6});if(S.phN>=10)C.achieve?.('rn_dash')}
      else if(ev==='shield'){fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(CX,GY-90,'🛡 Escudo de Fé!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.25)}
      else if(ev==='orb'){fx5('mgCoin')}
      else if(ev&&ev.startsWith('pw:')){fx5('activate');const k=ev.slice(3);C.fx?.float(CX,GY-110,k==='sh'?'🛡 Escudo de Fé':k==='mag'?'🧲 Ímã de Óbolos':'⏳ Câmera Lenta de Verdade',{col:k==='sh'?'#8fe8ff':k==='mag'?'#ffd36b':'#c9b0ff',size:20})}
      else if(ev==='boss'){fx5('mgWin');C.fx?.flash('#ffd36b',.3);C.fx?.float(W/2,110,`👹 Chefe superado! +150`,{col:'#ffd36b',size:28,life:1.6});C.achieve?.('rn_chefe')}
      else if(ev==='fire'){try{o5('square',220,actx().currentTime,.12,{to:110,gain:.04})}catch(e){}}
      if(!wasGnd&&S.gnd&&!S.dead)C.fx?.burst(CX,GY+S.y,{n:5,col:'#b8a88a',sp:80,life:.3,size:2,grav:200,ang:-Math.PI/2,spread:2});
      if(S.dead){die();return}
      const m=Math.floor(S.d/R.M),bio=rnBio40(S.d);
      if(bio!==S.bioShow){S.bioShow=bio;S.bioT=S.runT;fx5('confirm');if(bio===3)C.achieve?.('rn_espelho')}
      const mm=meters();if(Math.floor(mm/250)>S.mile){S.mile=Math.floor(mm/250);fx5('bb'+Math.min(7,S.mile%8));C.fx?.float(W/2,90,`${S.mile*250} m!`,{col:day(m)>.5?'#fff3c0':'#5b2fa8',size:30,life:1.1})}
      S.score=score();S.cam=S.d;GR.send({d:Math.round(S.d),y:Math.round(S.y),k:S.dk?1:0,s:S.score});
      const bk=L.bossOf(S.d);
      C.hud(`🦖 <b>${mm}</b> m · ${RNB40[bio].ico} ${RNB40[bio].n} · ✨ ${S.orbs} · ${S.score} pts${S.sh?' · 🛡':''}${S.mag>0?' · 🧲':''}${S.slow>0?' · ⏳':''}${bk?` · <b style="color:#ff9b8a">👹 ${RNB40[rnBio40(bk*1000*RN40.M)].boss.n}: aguente ${Math.max(0,Math.ceil(bk*1000+R.BZ-m))} m</b>`:''}${C.net?` · ${Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)} correndo`:''}`);
    },
    draw(x){
      const cam=S.cam??S.d,m=Math.floor(cam/R.M),nk=day(m),bio=rnBio40(cam),B=RNB40[bio],bp=(cam/R.M%R.BIO)/R.BIO,NB=RNB40[(bio+1)%5];
      const blend=bp>.94?(bp-.94)/.06:0,col=(k)=>{const d=mix(B[k==='bg'?'day':'d'+k],B[k==='bg'?'night':'n'+k],nk);if(!blend)return d;const e=mix(NB[k==='bg'?'day':'d'+k],NB[k==='bg'?'night':'n'+k],nk);return mix(d.slice(1),e.slice(1),blend)};
      const bg=col('bg'),ink=col('ink'),soft=col('soft');
      x.fillStyle=bg;x.fillRect(0,0,W,H);
      if(nk>.05){x.globalAlpha=nk;x.fillStyle='#fff';for(let i=0;i<60;i++){const sx=((i*131-cam*.05)%W+W)%W;x.fillRect(sx,(i*37)%(GY-80),1.6,1.6)}x.fillStyle='#fff6cf';x.beginPath();x.arc(640,60,20,0,7);x.fill();x.fillStyle=bg;x.beginPath();x.arc(650,54,18,0,7);x.fill();x.globalAlpha=1}
      if(nk<.95){x.globalAlpha=1-nk;x.fillStyle=B.sun;x.beginPath();x.arc(660,62,22,0,7);x.fill();x.globalAlpha=1}
      /* cenário do bioma */
      x.fillStyle=soft;
      for(let i=0;i<7;i++){const hx=((i*190-cam*.3)%(W+300)+W+300)%(W+300)-150;
        if(B.deco==='hills'){x.beginPath();x.moveTo(hx-120,GY);x.lineTo(hx,GY-60-(i%3)*18);x.lineTo(hx+120,GY);x.closePath();x.fill()}
        else if(B.deco==='trees'){x.fillRect(hx-6,GY-70-(i%3)*20,12,80+(i%3)*20);x.beginPath();x.arc(hx,GY-80-(i%3)*20,34,0,7);x.fill()}
        else if(B.deco==='abyss'){x.beginPath();x.moveTo(hx-60,GY);x.lineTo(hx-20,GY-110-(i%3)*30);x.lineTo(hx+10,GY-40);x.lineTo(hx+60,GY);x.closePath();x.fill()}
        else if(B.deco==='mirror'){x.save();x.globalAlpha=.6;rr21(x,hx-30,GY-120-(i%2)*30,60,100,30);x.fill();x.globalAlpha=.25;x.fillStyle='#fff';x.fillRect(hx-18,GY-110-(i%2)*30,8,70);x.restore();x.fillStyle=soft}
        else{x.fillRect(hx-14,GY-130,28,130);x.fillRect(hx-22,GY-138,44,10)}}
      /* clima */
      for(let i=0;i<24;i++){const sx=((i*97-cam*(.6+i%3*.2)+S.runT*(B.fx==='leaves'?-40:0))%W+W)%W,sy=((i*53+S.runT*(B.fx==='void'?-30:B.fx==='rays'?0:50))%(GY-20)+(GY-20))%(GY-20);x.globalAlpha=.35;
        if(B.fx==='leaves'){x.fillStyle='#5fbf6a';x.beginPath();x.ellipse(sx,sy,5,2.5,i,0,7);x.fill()}
        else if(B.fx==='void'){x.fillStyle=nk>.5?'#b9a6ff':'#241a3a';x.beginPath();x.arc(sx,sy,2+i%3,0,7);x.fill()}
        else if(B.fx==='shards'){x.fillStyle='#fff';x.save();x.translate(sx,sy);x.rotate(S.runT+i);x.fillRect(-4,-1,8,2);x.restore()}
        else if(B.fx==='lanterns'){x.fillStyle='#ffd36b';x.beginPath();x.arc(sx,40+(i*29)%120,3,0,7);x.fill()}
        else if(i<6){x.fillStyle='#fff3c0';x.globalAlpha=.08;x.beginPath();x.moveTo(660,62);x.lineTo(sx,GY);x.lineTo(sx+40,GY);x.closePath();x.fill()}
        x.globalAlpha=1}
      /* chão com fendas */
      let i0=0;while(L.ob(i0).x+L.ob(i0).w<cam-200)i0++;
      const gaps=[];for(let i=Math.max(0,i0-1);i<i0+7;i++){const o=L.ob(i);if(o.k==='gap')gaps.push([o.x,o.x+o.w]);if(o.k==='plat')gaps.push([o.g0,o.g1])}
      x.fillStyle=ink;x.fillRect(0,GY,W,2);for(let i=0;i<40;i++){const gx=((i*53-cam)%W+W)%W;x.fillRect(gx,GY+6+(i*7)%14,i%3?3:8,2)}
      gaps.forEach(([a,b])=>{const sx=CX+(a-cam),ex=CX+(b-cam);if(ex<0||sx>W)return;const g=x.createLinearGradient(0,GY,0,H);g.addColorStop(0,'#050308');g.addColorStop(1,bg);x.fillStyle=g;x.fillRect(sx,GY-1,ex-sx,H-GY+1);x.fillStyle=ink;x.fillRect(sx-3,GY,3,H-GY);x.fillRect(ex,GY,3,H-GY)});
      for(let i=Math.max(0,i0-1);i<i0+7;i++){const o=L.ob(i),ox=CX+(o.x-cam);if(ox>W+120)break;
        if(o.orb)for(let k=0;k<o.orb.n;k++){if(S.taken[i*10+k])continue;const qx=ox+o.orb.dx+k*28,qy=GY+o.orb.dy-Math.sin(k/(o.orb.n-1||1)*Math.PI)*20;const g=x.createRadialGradient(qx,qy,1,qx,qy,10);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(242,179,16,0)');x.fillStyle=g;x.beginPath();x.arc(qx,qy,10,0,7);x.fill()}
        if(o.pw&&!S.pwt[i]){const qx=ox+o.pw.dx,qy=GY+o.pw.dy+Math.sin(S.runT*4+i)*5,c={sh:'#8fe8ff',mag:'#ffd36b',sl:'#c9b0ff'}[o.pw.k];x.fillStyle=c;x.beginPath();x.arc(qx,qy,15,0,7);x.fill();t21(x,{sh:'🛡',mag:'🧲',sl:'⏳'}[o.pw.k],qx,qy+1,{size:16})}
        x.fillStyle=ink;
        if(o.k==='plat'){rr21(x,ox,GY-R.PLH,o.w,12,6);x.fill();x.fillStyle=B.sun;x.fillRect(ox+4,GY-R.PLH,o.w-8,3)}
        else if(o.k==='fly'){const fl=Math.sin(S.runT*16+i)>0;x.beginPath();x.ellipse(ox+o.w/2,o.y,12,9,0,0,7);x.fill();x.beginPath();x.moveTo(ox+o.w/2-6,o.y-2);x.lineTo(ox-2,o.y+(fl?-16:10));x.lineTo(ox+o.w/2-14,o.y+2);x.moveTo(ox+o.w/2+6,o.y-2);x.lineTo(ox+o.w+2,o.y+(fl?-16:10));x.lineTo(ox+o.w/2+14,o.y+2);x.fill();x.fillStyle='#ff4a6a';x.fillRect(ox+o.w/2-6,o.y-3,3,3);x.fillRect(ox+o.w/2+3,o.y-3,3,3)}
        else if(o.k==='totem'){x.fillRect(ox,GY-o.h,o.w,o.h);x.fillStyle=bg;x.fillRect(ox+6,GY-o.h+10,o.w-12,6);x.fillRect(ox+6,GY-o.h+28,o.w-12,6);x.fillStyle='#e0233b';x.beginPath();x.arc(ox+o.w/2,GY-o.h+50,4,0,7);x.fill()}
        else if(o.k==='cris')for(let k=0;k<o.n;k++){const cx=ox+k*22,h=o.h-(k%2)*8;x.beginPath();x.moveTo(cx,GY);x.lineTo(cx+4,GY-h*.6);x.lineTo(cx+9,GY-h);x.lineTo(cx+14,GY-h*.55);x.lineTo(cx+18,GY);x.closePath();x.fill()}
        else if(o.k==='proj'){const px=CX+(rnProjX40(L,S,o)-cam),bc=RNB40[rnBio40(o.boss*1000*RN40.M)].boss.c;if(o.i in S.pf||px<W){x.save();x.shadowColor=bc;x.shadowBlur=12;x.fillStyle=bc;
          if(o.pk==='wave'){x.beginPath();x.moveTo(px,GY);x.quadraticCurveTo(px+o.w/2,GY-o.h*2,px+o.w,GY);x.fill()}else{x.beginPath();x.arc(px+o.w/2,o.y,o.h/2,0,7);x.fill();x.globalAlpha=.4;x.fillRect(px+o.w/2,o.y-4,30,8)}x.restore()}}
      }
      /* chefe */
      const bk=L.bossOf(cam);
      if(bk){const BB=RNB40[rnBio40(bk*1000*RN40.M)].boss,left=Math.max(0,bk*1000+R.BZ-m)/R.BZ,bob=Math.sin(S.runT*3)*12,bx=700,by=110+bob;
        x.save();x.shadowColor=BB.c;x.shadowBlur=24;x.fillStyle='rgba(10,6,18,.85)';x.beginPath();x.arc(bx,by,44,0,7);x.fill();x.restore();x.strokeStyle=BB.c;x.lineWidth=3;x.beginPath();x.arc(bx,by,44,0,7);x.stroke();
        t21(x,BB.ico,bx,by+2,{size:44});t21(x,BB.n,bx,by-58,{size:13,w:800,col:ink,stroke:3});
        x.fillStyle='rgba(0,0,0,.35)';x.fillRect(W/2-120,42,240,8);x.fillStyle=BB.c;x.fillRect(W/2-120,42,240*left,8);t21(x,`Fuja de ${BB.n}`,W/2,32,{size:12,w:800,col:ink})}
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=CX+(g.d-cam);if(gx<-60||gx>W+60)continue;mgCat(x,GR.col(u),gx,GY+(g.y||0)-(g.k?18:30),g.k?44:56,GR.nm(u),{alpha:g.dead?.15:.4})}
      if(!S.dead){const bob=S.y<-1?0:Math.abs(Math.sin(S.runT*14))*-4,sz=S.dk?50:60;x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;
        if(S.dash>0){x.globalAlpha=.25;for(let k=1;k<4;k++)mgCat(x,me.c,CX-k*16,GY+S.y-30,sz,'');x.globalAlpha=1}
        if(S.dk&&S.gnd){x.translate(CX,GY+S.y-14);x.scale(1.25,.62);mgCat(x,me.c,0,0,sz,'')}else mgCat(x,me.c,CX,GY+S.y-30+bob,sz,'');x.restore();
        if(S.sh){x.strokeStyle='rgba(143,232,255,.8)';x.lineWidth=3;x.beginPath();x.arc(CX,GY+S.y-28,38,0,7);x.stroke()}
        if(S.mag>0){x.strokeStyle='rgba(255,211,107,.5)';x.setLineDash([4,6]);x.beginPath();x.arc(CX,GY+S.y-28,60+Math.sin(S.runT*8)*6,0,7);x.stroke();x.setLineDash([])}
        if(S.slow>0){x.fillStyle='rgba(180,140,255,.12)';x.fillRect(0,0,W,H)}}
      /* dash e pulo duplo */
      const dc=S.dcd>0?1-S.dcd/2.6:1;x.strokeStyle=ink;x.globalAlpha=.3;x.lineWidth=4;x.beginPath();x.arc(30,30,13,0,7);x.stroke();x.globalAlpha=1;x.strokeStyle=dc>=1?'#8fe8ff':ink;x.beginPath();x.arc(30,30,13,-Math.PI/2,-Math.PI/2+dc*Math.PI*2);x.stroke();t21(x,'💨',30,31,{size:12});
      if(!S.gnd&&!S.dj)t21(x,'⤒⤒',60,31,{size:12,w:900,col:ink});
      t21(x,String(meters()).padStart(5,'0')+' m',W-16,22,{size:20,w:800,col:ink,al:'right'});
      if(S.runT-S.bioT<2.2){const a=Math.min(1,(2.2-(S.runT-S.bioT))/.5);x.save();x.globalAlpha=a;t21(x,`${B.ico} ${B.n}`,W/2,H/2-60,{size:30,w:900,col:ink,stroke:0});x.restore()}
      if(S.dead&&!MG.over)t21(x,`Você parou em ${meters()} m. Assistindo os outros…`,W/2,H/2-40,{size:18,col:nk>.5?'#ffd1d1':'#8e2a2a'});
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
  if(p==='rn40')return`<div>${b('ArrowDown','▼','','Agachar')}${b('KeyE','💨','','Dash')}</div><div>${b('Space','⤒ Pular','wide')}</div>`;
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

