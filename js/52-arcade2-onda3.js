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

function corrida42(C){
  const W=800,H=450,LAPS=Number(window.__ktLaps)||3,o=C.room.opt||{},mesa=!!C.net;
  const list=o.m==='cup'?CUPS42[+o.cup||0].tr.slice():[+o.tr||0];
  const BOT=gdPick(C.gd,[.82,.9,.97,1.04]),meI=me16(C);
  const S={ri:0,K:null,racers:[],me:null,t:0,traps:[],orbs:[],bolts:[],keys:{},gh:{},fin:{},sendAt:0,cam:[0,0],msg:'',msgT:0,final:false,wait:0,inter:null,pts:{},res:[],closed:false,itemQ:false,offC:{},finAll:false,rw:null,cuts:0,purple:false,pulseHit:false};
  const names=['Perseus Veloz','Perseus Turbo','Perseus Sonolento'];
  function load(ri){
    S.ri=ri;S.K=ktTrack42(list[ri]);S.t=0;S.traps=[];S.orbs=[];S.bolts=[];S.final=false;S.gh={};S.fin={};S.closed=false;S.wait=0;
    S.racers=mesa?C.players.map((p,k)=>ktCar42(S.K,p.u,p.n,p.c,k,false)):[ktCar42(S.K,C.me,meI.n,meI.c,0,false),...[1,2,3].map(k=>ktCar42(S.K,'~k'+k,names[k-1],-1,k,true))];
    S.me=S.racers.find(r=>r.u===C.me)||S.racers[0];S.cam=[S.me.x,S.me.y];S.raceT0=Date.now();
    if(!S.offC[list[ri]])S.offC[list[ri]]=paintTrack(S.K);
    flash(`${S.K.T.ico} ${S.K.T.n}${list.length>1?` · corrida ${ri+1}/${list.length}`:''}`);
  }
  function paintTrack(K){const c=document.createElement('canvas');c.width=KTW42;c.height=KTH42;const x=c.getContext('2d');
    x.fillStyle=K.T.grass;x.fillRect(0,0,KTW42,KTH42);const rr=mb32(K.i*99+7);for(let i=0;i<500;i++){x.fillStyle=`rgba(0,0,0,${rr()*.18})`;x.fillRect(rr()*KTW42,rr()*KTH42,6,6)}
    K.cuts.forEach(cu=>{x.lineCap='round';x.beginPath();cu.path.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=KTCW42+6;x.stroke();x.strokeStyle=cu.surf==='mud'?'#4a3420':'#2c2436';x.lineWidth=KTCW42;x.stroke();x.setLineDash([4,14]);x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;x.stroke();x.setLineDash([])});
    x.lineJoin='round';x.lineCap='round';const path=()=>{x.beginPath();K.pts.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath()};
    path();x.strokeStyle='#e8e0f0';x.lineWidth=KTTW42+12;x.stroke();path();x.strokeStyle='#3a3046';x.lineWidth=KTTW42;x.stroke();
    const seg=(a,b,col)=>{x.beginPath();for(let k=a;k<=b;k++){const p=K.pts[k%K.N];k===a?x.moveTo(...p):x.lineTo(...p)}x.strokeStyle=col;x.lineWidth=KTTW42-4;x.stroke()};
    K.T.zones.forEach(([a,b,s])=>seg(Math.floor(a*K.N),Math.floor(b*K.N),s==='mud'?'#5a3d22':'#bfe6f5'));
    path();x.setLineDash([18,18]);x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=3;x.stroke();x.setLineDash([]);
    K.pads.forEach(p=>{x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle='#ffd36b';for(let k=0;k<3;k++){x.beginPath();x.moveTo(-14+k*10,-12);x.lineTo(-6+k*10,0);x.lineTo(-14+k*10,12);x.lineTo(-10+k*10,12);x.lineTo(-2+k*10,0);x.lineTo(-10+k*10,-12);x.closePath();x.fill()}x.restore()});
    const a=K.ang0,p=K.pts[0];x.save();x.translate(...p);x.rotate(a);for(let k=-6;k<6;k++){x.fillStyle=k%2?'#fff':'#111';x.fillRect(-6,k*10,12,10)}x.restore();
    return c}
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
  function hit(r,kind){if(r.done)return false;if(r.sh>0){r.sh=0;if(r===S.me){flash('🛡 O Escudo de Verdade bloqueou!');fx5('activate')}return false}
    if(kind==='roots'){r.stun=.9;r.vx*=.2;r.vy*=.2}else if(kind==='smoke'){if(r.bot)r.slow=1.5;else r.smoke=2.6}else{r.spin=kind==='pulse'?1.2:.85}
    if(r===S.me){fx5('error');C.fx?.shake(8,.35);flash({roots:'🌿 Preso nas raízes!',smoke:'🌫 Fumaça de Ilusão!',orb:'✶ Atingido pelo Orbe de Fé!',pulse:'◐ Pulso de Inexistência no líder!'}[kind])}return true}
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
  load(0);
  const K_UP=['KeyW','ArrowUp'],K_DN=['KeyS','ArrowDown'],K_L=['KeyA','ArrowLeft'],K_R=['KeyD','ArrowRight'],K_DR=['ShiftLeft','ShiftRight','KeyK'],K_IT=['KeyE','Space','KeyJ'];
  return{
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
      if(ev==='pad'){fx5('confirm')}
      if(ev==='lap'){flash(`Volta ${me.lap+1} de ${LAPS}`);fx5('confirm')}
      if(ev==='final'&&!S.final){S.final=true;flash('🔥 VOLTA FINAL!');fx5('mgWin');C.fx?.flash('#ff9b3d',.25)}
      if(ev==='finish'){fx5('mgWin');flash('🏁 Chegada!');if(mesa){C.send('kfin',{ri:S.ri,tm:me.ft});S.fin[C.me]=me.ft;checkMesa()}}
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
      C.hud(`🏎 <b>${esc(S.K.T.n)}</b>${list.length>1?` · corrida ${S.ri+1}/${list.length}`:''} · Volta <b>${Math.min(LAPS,me.lap+1)}</b>/${LAPS} · <b>${pos}º</b> de ${n} · ⏱ ${S.t.toFixed(1)} s · 🎁 ${me.item?ITEM42[me.item].ico+' '+ITEM42[me.item].n+' (E)':'—'}${me.sh?' · 🛡':''}`);
    },
    draw(x){
      const K=S.K,me=S.me,cx=clamp12(S.cam[0]-W/2,0,KTW42-W),cy=clamp12(S.cam[1]-H/2,0,KTH42-H);x.drawImage(S.offC[list[S.ri]],cx,cy,W,H,0,0,W,H);x.save();x.translate(-cx,-cy);
      K.boxes.forEach(b=>{if(b.t>0)return;x.save();x.translate(b.x,b.y);x.rotate(performance.now()/500);rr16(x,-10,-10,20,20,4);x.fillStyle='#c39bff';x.fill();x.restore();txt16(x,'?',b.x,b.y,{size:12})});
      S.traps.forEach(t=>txt16(x,'🌿',t.x,t.y,{size:24}));
      S.orbs.forEach(q=>{x.save();x.shadowColor='#ffd36b';x.shadowBlur=14;x.fillStyle='#ffd36b';x.beginPath();x.arc(q.x,q.y,8,0,7);x.fill();x.restore()});
      S.bolts.forEach(b=>{x.save();x.globalAlpha=b.t/.6;x.strokeStyle='#c56bff';x.lineWidth=6;x.beginPath();x.moveTo(b.x,b.y-300);x.lineTo(b.x+12,b.y-150);x.lineTo(b.x-10,b.y-80);x.lineTo(b.x,b.y);x.stroke();x.restore()});
      const carD=(r,al=1)=>{x.save();x.globalAlpha=al;x.translate(r.x,r.y);x.rotate(r.a+(r.dr?r.dr*.25:0));rr16(x,-16,-10,32,20,6);x.fillStyle=mgCol(r.c);x.fill();x.fillStyle='rgba(0,0,0,.4)';x.fillRect(4,-8,8,16);
        if(r.boost>0){x.fillStyle=r.sun>0?'#ffae3d':'#ffd36b';x.fillRect(-28,-4,12,8)}
        if(r.lvl||r.dr){const sc=['#ddd','#5aa7ff','#ff9b3d','#c56bff'][r.lvl||0];x.fillStyle=sc;for(let k=0;k<3;k++){x.beginPath();x.arc(-18-Math.random()*8,(k-1)*9,2+Math.random()*2,0,7);x.fill()}}
        if(r.sh){x.strokeStyle='rgba(143,232,255,.8)';x.lineWidth=2;x.beginPath();x.arc(0,0,22,0,7);x.stroke()}
        x.restore();sprAt16(x,r.c,r.x,r.y,26,0,al)};
      for(const u in S.gh){const g=S.gh[u];const p=C.players.find(q=>q.u===u);if(!p||g.x==null)continue;carD({x:g.x,y:g.y,a:g.a||0,c:p.c,boost:0,lvl:g.dr||0},.5);if(MG.drawn)MG.drawn[p.n]=.5;txt16(x,p.n,g.x,g.y-24,{size:11,stroke:3})}
      S.racers.forEach(r=>{if(mesa&&r!==me)return;carD(r);if(r!==me)txt16(x,r.n,r.x,r.y-24,{size:10,stroke:3,col:'#ddd'})});
      x.restore();
      if(S.final&&!me.done){x.strokeStyle='rgba(255,155,61,.25)';x.lineWidth=2;for(let i=0;i<14;i++){const a=i/14*Math.PI*2+performance.now()/900,r1=260,r2=330;x.beginPath();x.moveTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1);x.lineTo(W/2+Math.cos(a)*r2,H/2+Math.sin(a)*r2);x.stroke()}}
      if(me.smoke>0){const a=Math.min(.92,me.smoke/2);x.fillStyle=`rgba(70,58,82,${a})`;[[180,140,170],[520,260,190],[330,330,150],[640,110,140]].forEach(([bx,by,br],i)=>{x.beginPath();x.arc(bx+Math.sin(performance.now()/700+i)*20,by,br,0,7);x.fill()})}
      /* item e posição */
      rr16(x,12,12,58,58,12);x.fillStyle='rgba(0,0,0,.5)';x.fill();x.strokeStyle='#c39bff';x.lineWidth=2;x.stroke();if(me.item)txt16(x,ITEM42[me.item].ico,41,42,{size:30});
      const pos=posOf(C.me);txt16(x,`${pos}º`,20,H-36,{size:44,w:900,al:'left',col:pos===1?'#ffd36b':'#fff',stroke:6});
      txt16(x,`Volta ${Math.min(LAPS,me.lap+1)}/${LAPS}`,20,H-8,{size:14,w:800,al:'left',stroke:4});
      if(me.dr){const lv=me.lvl,col=['#ddd','#5aa7ff','#ff9b3d','#c56bff'][lv];rr16(x,W/2-60,H-26,120,10,5);x.fillStyle='rgba(0,0,0,.5)';x.fill();rr16(x,W/2-60,H-26,120*Math.min(1,me.ch/1.5),10,5);x.fillStyle=col;x.fill();txt16(x,['drift','azul','laranja','ROXO'][lv],W/2,H-36,{size:11,w:800,col})}
      if(S.msg&&performance.now()-S.msgT<1800)txt16(x,S.msg,W/2,60,{size:22,w:800,col:'#ffd36b',stroke:4});
      /* minimapa */
      const ms=.1;x.fillStyle='rgba(0,0,0,.4)';x.fillRect(W-KTW42*ms-10,10,KTW42*ms,KTH42*ms);x.beginPath();K.pts.forEach((p,i)=>i?x.lineTo(W-KTW42*ms-10+p[0]*ms,10+p[1]*ms):x.moveTo(W-KTW42*ms-10+p[0]*ms,10+p[1]*ms));x.closePath();x.strokeStyle='#aaa';x.lineWidth=2;x.stroke();
      [...S.racers.filter(r=>!mesa||r===me),...Object.values(S.gh).filter(g=>g.x!=null)].forEach(r=>{x.beginPath();x.arc(W-KTW42*ms-10+r.x*ms,10+r.y*ms,r===me?4:3,0,TAU16);x.fillStyle=r===me?'#ffd36b':'#ff6b5b';x.fill()});
      if(me.done&&!S.inter&&!MG.over)txt16(x,'Chegada! Aguardando os outros…',W/2,H/2,{size:22,w:800,stroke:5});
      if(S.inter){x.fillStyle='rgba(8,4,14,.85)';x.fillRect(0,0,W,H);txt16(x,`Tabela · depois de ${S.ri+1} de ${list.length} corridas`,W/2,50,{size:20,w:800});
        const ppl=mesa?C.players.map(p=>({u:p.u,n:p.n})):S.racers.map(r=>({u:r.u,n:r.n}));ppl.sort((a,b)=>(S.pts[b.u]||0)-(S.pts[a.u]||0)).forEach((p,i)=>{const z=S.inter.order.findIndex(q=>q.u===p.u);txt16(x,`${i+1}. ${p.n}`,W/2-160,100+i*34,{size:17,w:700,al:'left',col:p.u===C.me?'#ffd36b':'#fff'});txt16(x,`${z>=0?`+${S.inter.order[z].t!=null?KTP42[z]||0:0}`:''}  ${S.pts[p.u]||0} pts`,W/2+170,100+i*34,{size:17,w:700,al:'right'})});
        txt16(x,`Próxima: ${KT42[list[S.ri+1]].ico} ${KT42[list[S.ri+1]].n} em ${Math.ceil((S.inter.until-pnow38())/1000)} s`,W/2,H-50,{size:16,w:700,col:'#c9b8ff'})}
    }
  };
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
  function cardDraw(x,c,X,Y,{hi=false,dim=false,small=false}={}){const w=small?CW*.58:CW,h=small?CH*.58:CH;rr16(x,X,Y,w,h,8);
    if(c.e<0){const g=x.createLinearGradient(X,Y,X+w,Y+h);UNO_EL.forEach((e,i)=>g.addColorStop(i/4,e.c));x.fillStyle=g}else x.fillStyle=UNO_EL[c.e].c;x.fill();
    x.lineWidth=hi?3:1.5;x.strokeStyle=hi?'#fff':'rgba(255,255,255,.6)';x.stroke();
    if(c.v==='P'){x.save();x.strokeStyle='#ffd36b';x.lineWidth=2;rr16(x,X+3,Y+3,w-6,h-6,6);x.stroke();x.restore()}
    x.beginPath();x.ellipse(X+w/2,Y+h/2,w*.36,h*.3,-.5,0,TAU16);x.fillStyle='rgba(255,255,255,.92)';x.fill();
    const lab=c.v==='W'?'✦':c.v==='P'?UNOP43[c.e].ico:c.v;txt16(x,lab,X+w/2,Y+h/2+1,{size:small?13:c.v==='P'?20:22,w:800,col:c.e<0?'#222':c.e===1?'#2b2433':UNO_EL[c.e].c});
    if(!small&&c.v==='P')txt16(x,UNOP43[c.e].n,X+w/2,Y+h-9,{size:9,w:800,col:'#fff',stroke:2});
    if(!small&&c.e>=0&&c.v!=='P')txt16(x,UNO_EL[c.e].g,X+11,Y+12,{size:11});
    if(dim){rr16(x,X,Y,w,h,8);x.fillStyle='rgba(0,0,0,.45)';x.fill()}}
  function tryCard(i){const si=meIdx(),c=S.seats[si].hand[i];if(!canPlay(c)){fx5('error');return}
    if(c.e<0){S.pick={i,k:'col'};return}if(c.v==='P'&&(c.e===3||c.e===2)){S.pick={i,k:'tg',inv:c.e===2};return}act('play',i,-1,-1);fx5('click')}
  return{st:()=>S,
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
      const info=mode==='one'?'':mode==='bo3'?` · rodada ${S.round} · vitórias: ${me?.wins||0}`:` · rodada ${S.round} · ${me?.score||0}/${GOAL} pts`;
      C.hud(S.over?'Fim da partida':S.rover?`🏁 ${esc(S.log)}`:`🃏 ${mine?(S.stack?`<b>Pilha de +${S.stack.n}!</b> Jogue ${S.stack.type} ou ✶ Escudo, ou compre`:'<b>Sua vez</b>: jogue uma carta de <b>'+UNO_EL[S.col].n+'</b> ou do mesmo símbolo'):'Vez de <b>'+esc(S.seats[S.turn]?.n||'?')+'</b>'}${info} · ⏱ ${Math.max(0,Math.ceil((S.deadline-Date.now())/1000))}s`);
    },
    draw(x){
      x.fillStyle='#1d3a2a';x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,H/2,40,W/2,H/2,420);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(0,0,W,H);
      if(!S.seats.length){txt16(x,'Embaralhando…',W/2,H/2,{size:18});return}
      const si=meIdx(),me=S.seats[si];
      panels().forEach(({s,i,x:px,y:py,w,h,cb})=>{const on=S.turn===i&&!S.rover;
        rr16(x,px,py,w,h,12);x.fillStyle=on?'rgba(255,211,107,.25)':'rgba(0,0,0,.3)';x.fill();if(on){x.strokeStyle='#ffd36b';x.lineWidth=2;x.stroke()}
        sprAt16(x,s.c,px+26,py+34,38);txt16(x,s.n.slice(0,13),px+86,py+16,{size:12});
        txt16(x,`🂠 ${s.hand.length}${s.hand.length===1?(s.said?' 📣':' ⚠'):''}`,px+86,py+38,{size:14,w:800});
        txt16(x,`🧠${s.luc}${s.sh?' ✶':''}${s.imm?' 🌿':''}${mode==='bo3'?` · 🏆${s.wins||0}`:mode==='pts'?` · ${s.score||0}`:''}`,px+86,py+60,{size:11,col:s.luc<=4?'#ff8a8a':'#c39bff'});
        if(catchable(s)){rr16(x,cb.x,cb.y,cb.w,cb.h,8);x.fillStyle='#ff6b5b';x.fill();txt16(x,'🚨 Delatar',cb.x+cb.w/2,cb.y+cb.h/2+1,{size:11,w:800})}
        if(S.reveal&&S.reveal.by===si&&S.reveal.to===i&&S.turnN<S.reveal.until)s.hand.slice(0,12).forEach((c,k)=>cardDraw(x,c,px-8+k*14,py+h+28,{small:true}))});
      rr16(x,DRAWB.x,DRAWB.y,CW,CH,8);x.fillStyle='#2a1a3a';x.fill();x.strokeStyle=si===S.turn&&!S.drew?'#ffd36b':'#c39bff';x.lineWidth=2;x.stroke();txt16(x,'🂠',DRAWB.x+CW/2,DRAWB.y+CH/2-6,{size:28,col:'#c39bff'});txt16(x,S.stack&&si===S.turn?`+${S.stack.n}`:'comprar',DRAWB.x+CW/2,DRAWB.y+CH-12,{size:S.stack&&si===S.turn?14:10,w:800,col:S.stack&&si===S.turn?'#ff8a8a':'#c39bff'});
      if(S.top)cardDraw(x,S.top,W/2-CW/2,140-S.anim*20);
      x.beginPath();x.arc(W/2+70,182,16,0,TAU16);x.fillStyle=UNO_EL[S.col].c;x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();txt16(x,UNO_EL[S.col].g,W/2+70,183,{size:14});
      txt16(x,S.dir>0?'↻':'↺',W/2-90,182,{size:24,col:'rgba(255,255,255,.6)'});
      if(S.stack){txt16(x,`📚 Pilha +${S.stack.n}`,W/2,124,{size:16,w:900,col:'#ff8a8a',stroke:4})}
      if(S.drew&&si===S.turn&&!S.stack)btn16(x,PASSB,'Passar',{hot:true});
      S.hist.forEach((l,k)=>{x.save();x.globalAlpha=1-k*.25;txt16(x,l,W/2,248+k*16,{size:k?11:13,col:'#e8f5ec'});x.restore()});
      if(me){txt16(x,`🧠 Lucidez ${me.luc}/10${me.imm?' · 🌿 protegido':''}${me.sh?' · ✶ Escudo guardado':''}`,14,H-CH-26,{size:12,al:'left',col:'#c39bff'});
        handRects().forEach(r=>{const c=me.hand[r.i],ok=si===S.turn&&!S.rover&&canPlay(c);cardDraw(x,c,r.x,r.y-(S.hover===r.i&&ok?14:ok?6:0),{hi:ok,dim:si===S.turn&&!ok})});
        const can=me.hand.length<=2&&!me.said;rr16(x,TULB.x,TULB.y,TULB.w,TULB.h,12);x.fillStyle=can?'#e0233b':'rgba(255,255,255,.08)';x.fill();txt16(x,me.said?'📣 dito':'TULPA!',TULB.x+TULB.w/2,TULB.y+TULB.h/2+1,{size:18,w:900,col:can?'#fff':'rgba(255,255,255,.4)'})}
      if(S.pick){x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,0,W,H);
        if(S.pick.k==='col'){txt16(x,'Escolha o novo Elemento',W/2,H/2-56,{size:18});colB().forEach(b=>{rr16(x,b.x,b.y,b.w,b.h,10);x.fillStyle=UNO_EL[b.i].c;x.fill();x.strokeStyle='#fff';x.stroke();txt16(x,UNO_EL[b.i].g,b.x+b.w/2,b.y+22,{size:20});txt16(x,UNO_EL[b.i].n,b.x+b.w/2,b.y+46,{size:10})})}
        else{const c=me.hand[S.pick.i];txt16(x,`${UNOP43[c.e].ico} ${UNOP43[c.e].n}: escolha o rival`,W/2,H/2-60,{size:18});tgB().forEach(b=>{rr16(x,b.x,b.y,b.w,b.h,10);x.fillStyle='rgba(255,255,255,.12)';x.fill();x.strokeStyle='#ffd36b';x.stroke();txt16(x,b.s.n.slice(0,12),b.x+b.w/2,b.y+24,{size:13});txt16(x,`🂠 ${b.s.hand.length}`,b.x+b.w/2,b.y+50,{size:14,w:800})});
          if(S.pick.inv){btn16(x,{x:W/2-70,y:H/2+50,w:140,h:36},'↻ Inverter sentido',{hot:true})}}}
      if(S.rover&&!S.over){x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,H/2-50,W,100);txt16(x,S.log,W/2,H/2-12,{size:20,w:800,col:'#ffd36b'});txt16(x,mode==='bo3'?S.seats.map(s=>`${s.n.split(' ')[0]} ${s.wins||0}`).join(' · '):S.seats.map(s=>`${s.n.split(' ')[0]} ${s.score||0}`).join(' · '),W/2,H/2+20,{size:14})}
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

