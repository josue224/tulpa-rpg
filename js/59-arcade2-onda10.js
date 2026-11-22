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
function salto56(C){
  const W=480,H=640,PWD=74,G=1450,JV=760,SPRING=1180,HS=330,R=22,o=C.room.opt||{},esc=o.m!=='inf',tw=esc?Math.max(0,Math.min(4,+o.tw||0)):-1,TW=esc?SATW56[tw]:null;
  const ICE=tw===1,WIND=tw===2||(!esc),CLOUD=tw===3,VOID=tw===4||!esc,GOAL=TW?TW.goal:Infinity;
  const S={x:W/2,y:60,vy:JV,vx:0,maxY:0,cam:0,orbs:0,taken:new Set(),broken:new Set(),inl:0,inr:0,tx:null,score:0,sh:0,mg:0,jt:0,wing:0,pw:new Set(),alt:0,
    shots:[],cool:0,kills:0,stomps:0,deadE:new Set(),wind:0,windT:0,voidY:-400,won:false,t:0,usedPw:false,orbTot:0},RC=ghostRace(C,S);
  const PWI={sh:['🛡','#8fe8ff','Escudo'],mg:['🧲','#ff8fb1','Ímã de orbes'],jt:['🚀','#ffd36b','Foguete'],wg:['🪶','#c9f0ff','Asas'],sp:['🌀','#7dffa8','Mola de Bolso']};
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
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
  function die(why){if(S.sh){S.sh=0;fx5('activate');C.fx?.flash('#8fe8ff',.3);C.fx?.float(S.x,sy0(S.y)-50,'🛡 Salvo!',{col:'#8fe8ff',size:22});S.inv=1;return false}
    C.fx?.shake(10,.4);if(why)C.say(why,false);finish(false);return true}
  function finish(win){if(S.dead)return;S.won=win;const alt=Math.floor(S.maxY/10);let st=0,first=false,rec=false;
    if(win){st=1+(S.orbs>=Math.max(1,S.orbTot*.6)?1:0)+(!S.usedPw&&!S.saved?1:0)}
    progPut38(q=>{q.sa=q.sa||{};q.sa.tw=q.sa.tw||{};if(esc&&win){first=!q.sa.tw[tw];if(st>(q.sa.tw[tw]||0))q.sa.tw[tw]=st;if(SATW56.every((_,i)=>q.sa.tw[i]))C.achieve?.('sa_escalada')}if(!esc&&alt>(q.sa.best||0)){q.sa.best=alt;rec=true}});
    if(alt>=5000)C.achieve?.('sa_5000');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((alt/160+S.orbs*.6+S.kills*1.5)*mul)+(win?10+tw*3:0)+(first?15:0)+(rec?5:0)),why:[esc?TW.n:'Infinito',win?'★'.repeat(st):'',first?'torre nova':'',rec?'recorde':''].filter(Boolean).join(' · ')||`${alt} m`};S.rw.xp=Math.round(S.rw.ob*.6);
    S.html=`<ul class="r38-l"><li>⬆️ Altitude: <b>${alt}</b>${esc?` / ${GOAL}`:''}</li><li>✨ Orbes: <b>${S.orbs}</b> · ☠ Inimigos: <b>${S.kills}</b> (${S.stomps} pisões)</li></ul>${esc&&win&&first&&tw<4?`<p class="r38-hi">Torre ${tw+2}: ${escH56(SATW56[tw+1].n)} foi aberta.</p>`:''}`;
    if(C.net){RC.die(score()+(win?1000:0));return}
    S.dead=true;fx5(win?'mgWin':'fumble');
    C.finish({title:win?`⬆️ ${TW.n}: topo alcançado! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:esc?`⬆️ Você caiu na ${TW.n} · ${alt}/${GOAL}`:`⬆️ Você caiu a ${alt} de altitude`,rows:[{u:C.me,n:me.n,c:me.c,s:score(),w:win}],unit:'pts',html:S.html})}
  return{st:()=>S,row,plat,enPos,shoot,finish,
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
            if(brk){S.broken.add(k);fx5('error');C.fx?.burst(q.x,sy0(q.y),{n:10,col:['#8a6d55','#3a2a1e'],sp:120,life:.5,size:3,grav:700})}
            else{S.y=q.y;S.vy=q===p&&p.type==='s'?SPRING:JV;if(cl){S.broken.add(k);C.fx?.burst(q.x,sy0(q.y),{n:10,col:['#fff','#ddeeff'],sp:90,life:.5,size:4,grav:-50})}fx5(q===p&&p.type==='s'?'activate':'mgJump');if(q===p&&p.type==='s')C.fx?.float(S.x,sy0(S.y)-50,'BOING!',{col:'#ffd36b',size:22,life:.7})}}}
        if(p.orb&&!S.taken.has(k)&&(Math.hypot(S.x-p.x,S.y-(p.y+44))<R+12||S.mg>0&&Math.hypot(S.x-p.x,S.y-(p.y+44))<170)){S.taken.add(k);S.orbs++;fx5('mgCoin');C.fx?.float(p.x,sy0(p.y+44)-20,'+50',{col:'#ffd36b',size:20,life:.7})}
        if(p.pw&&!S.pw.has(k)&&Math.hypot(S.x-p.x,S.y-(p.y+44))<R+16){S.pw.add(k);S.usedPw=true;const P=PWI[p.pw];fx5('activate');C.fx?.float(p.x,sy0(p.y+44)-30,P[0]+' '+P[2],{col:P[1],size:20});
          if(p.pw==='sh')S.sh=1;else if(p.pw==='mg')S.mg=8;else if(p.pw==='jt')S.jt=1.3;else if(p.pw==='wg')S.wing=4;else{S.vy=SPRING*1.6;fx5('bb5')}}
        if(rw.en&&!S.deadE.has(k)){const e=enPos(rw);
          S.shots.forEach(s=>{if(!s.dead&&Math.hypot(s.x-e.x,s.y-e.y)<26){s.dead=true;S.deadE.add(k);S.kills++;fx5('mgCoin');C.fx?.burst(e.x,sy0(e.y),{n:14,col:['#b14bff','#fff'],sp:180,life:.5,size:3});C.fx?.float(e.x,sy0(e.y)-20,'+100',{col:'#ffd36b',size:18})}});
          if(!S.deadE.has(k)&&Math.hypot(S.x-e.x,S.y-e.y)<R+18&&!(S.inv>0)){if(S.vy<0&&S.y>e.y+6){S.deadE.add(k);S.kills++;S.stomps++;S.vy=JV*1.05;fx5('bb4');C.fx?.float(e.x,sy0(e.y)-30,'PISÃO! +100',{col:'#ffd36b',size:20});if(S.stomps>=10)C.achieve?.('sa_pisao')}
            else if(S.jt<=0){if(die('Um Perseus Corrompido te derrubou.'))return;S.saved=1}}}
        if(p.trap&&Math.hypot(S.x-p.tx,S.y-(p.y+36))<R+10&&!(S.inv>0)){if(S.sh){S.sh=0;row(k).trap=false;S.saved=1;fx5('activate');C.fx?.float(S.x,sy0(S.y)-50,'🛡 Salvo!',{col:'#8fe8ff',size:22})}else{die('A Inexistência te pegou. Ela sempre pega.');return}}}
      S.shots.forEach(s=>{s.y+=s.vy*dt;if(s.y>S.cam+H+40)s.dead=true});S.shots=S.shots.filter(s=>!s.dead);
      S.maxY=Math.max(S.maxY,S.y);S.cam=Math.max(S.cam,S.y-H*.42);
      {const lastK=kFrom(S.maxY);let n=0;for(let k=0;k<=lastK;k++)if(row(k).orb)n++;S.orbTot=n}
      if(VOID&&(esc||S.maxY>20000)){const sp=esc?45+S.t*.25:40+(S.maxY-20000)/300;S.voidY=Math.max(S.voidY,S.cam-180)+sp*dt;if(S.y<S.voidY){if(!die('A Inexistência alcançou você.')){S.y=Math.max(S.y,S.cam+40);S.voidY=S.y-160;S.vy=SPRING}else return}}
      {const a=Math.floor(S.maxY/10/1000);if(a>S.alt){S.alt=a;fx5('bb'+Math.min(7,a+1));C.fx?.float(W/2,H*.32,`ALTITUDE ${a*1000}!`,{col:'#ffd36b',size:34,life:1.3})}}
      if(esc&&Math.floor(S.maxY/10)>=GOAL){finish(true);return}
      if(S.y<S.cam-60){if(S.sh){S.sh=0;S.saved=1;S.y=S.cam+40;S.vy=SPRING*1.25;fx5('activate');C.fx?.float(S.x,H*.7,'🛡 Salvo!',{col:'#8fe8ff',size:26});return}C.say(sayFmt(SAY12.fall),false);finish(false);return}
      S.score=score();RC.send({x:Math.round(S.x),y:Math.round(S.y),s:S.score});
      C.hud(`⬆️ ${esc?`${TW.ico} ${TW.n} · <b>${Math.floor(S.maxY/10)}</b>/${GOAL}`:`<b>${S.score}</b> pontos`} · ✨ ${S.orbs} · ☠ ${S.kills}${S.sh?' · 🛡':''}${S.mg>0?' · 🧲':''}${S.jt>0?' · 🚀':''}${S.wing>0?' · 🪶':''}${Math.abs(S.wind)>30?` · ${S.wind>0?'→':'←'} vento`:''}`)},
    msg:RC.msg,left:RC.left,
    draw(x){
      const cam=S.cam,sy=y=>H-(y-cam)-30,cols=TW?TW.c:['#0b1430','#26365e'],gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,cols[0]);gr.addColorStop(1,cols[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<40;i++)x.fillRect((i*89)%W,((i*61+cam*.3)%H),1.6,1.6);
      if(Math.abs(S.wind)>30){x.strokeStyle='rgba(220,240,255,.25)';x.lineWidth=2;for(let i=0;i<10;i++){const yy=(i*67+cam*.5)%H,xx=((Date.now()/5*Math.sign(S.wind)+i*83)%W+W)%W;x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+Math.sign(S.wind)*30,yy);x.stroke()}}
      const k0=Math.max(0,kFrom(cam-80));
      for(let k=k0;k<k0+16;k++){const p=plat(k),rw=row(k),y=sy(p.y);if(y<-60)break;if(y>H+60)continue;
        if(p.alt){const ay=sy(p.alt.y);x.fillStyle=ICE?'#bfe8ff':'#7fe0a8';x.beginPath();x.roundRect?x.roundRect(p.alt.x-PWD/2,ay,PWD,12,6):x.rect(p.alt.x-PWD/2,ay,PWD,12);x.fill()}
        if(!S.broken.has(k)){x.fillStyle=p.type==='b'?'#8a6d55':p.type==='m'?'#5fb0ff':p.type==='s'?'#ffd36b':p.type==='c'?'#ffffff':ICE?'#bfe8ff':'#7fe0a8';if(p.type==='c')x.globalAlpha=.8;x.beginPath();x.roundRect?x.roundRect(p.x-PWD/2,y,PWD,12,6):x.rect(p.x-PWD/2,y,PWD,12);x.fill();x.globalAlpha=1;
          if(p.type==='b'){x.strokeStyle='#3a2a1e';x.beginPath();x.moveTo(p.x-8,y);x.lineTo(p.x+2,y+12);x.stroke()}if(p.type==='s'){x.fillStyle='#fff3c0';x.fillRect(p.x-8,y-10,16,10)}}
        if(p.orb&&!S.taken.has(k)){const oy=sy(p.y+44),g2=x.createRadialGradient(p.x,oy,1,p.x,oy,12);g2.addColorStop(0,'#fff');g2.addColorStop(1,'rgba(255,230,120,0)');x.fillStyle=g2;x.beginPath();x.arc(p.x,oy,12,0,7);x.fill()}
        if(p.pw&&!S.pw.has(k)){const oy=sy(p.y+44)+Math.sin(Date.now()/250+k)*4,P=PWI[p.pw];x.fillStyle=P[1];x.beginPath();x.arc(p.x,oy,14,0,7);x.fill();t21(x,P[0],p.x,oy+1,{size:15})}
        if(p.trap){const ty=sy(p.y+36);x.fillStyle='#0a0010';x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?8:15;x.lineTo(p.tx+Math.cos(a)*rr,ty+Math.sin(a)*rr)}x.closePath();x.fill();x.strokeStyle='#b14bff';x.lineWidth=1.5;x.stroke()}
        if(rw.en&&!S.deadE.has(k)){const e=enPos(rw);t21(x,rw.en.k==='bat'?'🦇':'👁',e.x,sy(e.y),{size:28});x.strokeStyle='rgba(177,75,255,.6)';x.lineWidth=2;x.beginPath();x.arc(e.x,sy(e.y),18,0,TAU16);x.stroke()}}
      S.shots.forEach(s=>t21(x,'✦',s.x,sy(s.y),{size:18,col:'#ffd36b'}));
      if(esc&&GOAL*10-cam<H+40){const gy=sy(GOAL*10);x.fillStyle='rgba(255,211,107,.35)';x.fillRect(0,gy-4,W,8);t21(x,'🏁 TOPO',W/2,gy-18,{size:16,w:800,col:'#ffd36b'})}
      for(const u in S.gh){const g=S.gh[u];if(g.y==null)continue;const y=sy(g.y);if(y<-60||y>H+60)continue;mgCat(x,RC.col(u),g.x,y-R,48,RC.nm(u),{alpha:g.dead?.18:.42})}
      if(!S.dead){x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;mgCat(x,me.c,S.x,sy(S.y)-R,52,me.n,{flip:S.f<0});x.restore();if(S.sh){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(S.x,sy(S.y)-R,32,0,7);x.stroke()}if(S.wing>0)t21(x,'🪶',S.x+26,sy(S.y)-R-10,{size:16})}
      if(VOID&&S.voidY>-300){const vy=sy(S.voidY);if(vy<H+20){const g3=x.createLinearGradient(0,vy-60,0,H);g3.addColorStop(0,'rgba(60,0,90,0)');g3.addColorStop(.3,'rgba(40,0,70,.85)');g3.addColorStop(1,'#000');x.fillStyle=g3;x.fillRect(0,vy-60,W,H-vy+60)}}
      t21(x,String(esc?Math.floor(S.maxY/10):S.score),W/2,78,{size:30,w:800,stroke:4});
      if(S.dead&&!MG.over)t21(x,`Você caiu com ${S.score} pontos. Assistindo os outros…`,W/2,H/2,{size:16,col:'#ffd1d1'})}
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
      if(C.host){if(!S.end){hostStep(dt);const ev=S.ev.splice(0);feel(ev);if(C.net&&(now-S.snapAt>66||ev.length)){S.snapAt=now;C.send('snap',{...pack(),ev})}}}
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

