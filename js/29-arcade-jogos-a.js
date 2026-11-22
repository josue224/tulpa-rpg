/* ===================================================================
   TULPA ARCADE · jogos 3 a 7: Fuga Além do Véu, Julgamento da Essência,
   Poço das Almas e O Trono do Mestre (+ auxiliares comuns)
   =================================================================== */
const TAU16=Math.PI*2;
function txt16(x,s,X,Y,{size=16,w=700,col='#fff',al='center',bl='middle',stroke=0}={}){
  x.font=`${w} ${size}px "IBM Plex Sans",system-ui,sans-serif`;x.textAlign=al;x.textBaseline=bl;
  if(stroke){x.lineWidth=stroke;x.strokeStyle='rgba(0,0,0,.75)';x.strokeText(s,X,Y)}x.fillStyle=col;x.fillText(s,X,Y);
}
function rr16(x,X,Y,w,h,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h)}
const inB16=(b,px,py)=>!!b&&px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h;
function btn16(x,b,label,{on=true,hot=false,col='#ffd36b',size=14}={}){
  rr16(x,b.x,b.y,b.w,b.h,10);x.fillStyle=hot?col:on?'#2b1f10':'#1c1720';x.fill();x.lineWidth=1.5;x.strokeStyle=on?col:'#4a3f55';x.stroke();
  txt16(x,label,b.x+b.w/2,b.y+b.h/2+1,{size,col:hot?'#2a1a00':on?col:'#7a6a88'});
}
function sprAt16(x,ci,cx,cy,size,rot=0,alpha=1){
  const im=spr(ci);x.save();x.globalAlpha=alpha;x.translate(cx,cy);x.rotate(rot);
  if(im)x.drawImage(im,-size/2,-size/2,size,size);else{x.beginPath();x.arc(0,0,size*.42,0,TAU16);x.fillStyle=mgCol(ci);x.fill()}
  x.restore();
}
const me16=C=>C.players.find(p=>p.u===C.me)||C.players[0]||{n:'Você',c:0};
function solo16(C,s,title,won){const m=me16(C);C.finish({title,rows:[{u:C.me,n:m.n,c:m.c,s:Math.round(s),w:!!won}]})}
/* novos controles de toque */
const _pad16=padHtml;
padHtml=function(p){
  const b=(k,l,cls='')=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${l}">${l}</button>`;
  if(p==='tap')return`<div>${b('Space','⤒ Pular / Inverter','wide')}</div>`;
  if(p==='fps')return`<div>${b('ArrowLeft','↺')}${b('KeyW','▲')}${b('KeyS','▼')}${b('ArrowRight','↻')}</div><div>${b('Space','✦ Atirar','wide')}</div>`;
  if(p==='fight')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}${b('KeyW','⤒')}</div><div>${b('KeyS','🛡')}${b('KeyJ','👊')}${b('KeyK','✦')}</div>`;
  if(p==='kart')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}</div><div>${b('KeyS','▼')}${b('KeyE','🎁')}${b('KeyW','▲','wide')}</div>`;
  if(p==='twin')return`<div>${b('KeyA','◀')}${b('KeyW','▲')}${b('KeyS','▼')}${b('KeyD','▶')}</div><div>${b('ArrowLeft','←')}${b('ArrowUp','↑')}${b('ArrowDown','↓')}${b('ArrowRight','→')}</div>`;
  if(p==='dir4')return`<div>${b('KeyA','◀')}${b('KeyW','▲')}${b('KeyS','▼')}${b('KeyD','▶')}</div>`;
  if(p==='lrjv')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}</div><div>${b('Space','⤒ Pular','wide')}</div>`;
  return _pad16(p);
};
/* conquistas dos novos jogos */
Object.assign(ACH,{
  geometria:{ico:'🌀',n:'Além do Véu',d:'Corra 400 m na Fuga Além do Véu.'},
  coracao:{ico:'❤️',n:'Coração Intocado',d:'Vença o Julgamento da Essência sem levar dano.',secret:true},
  poco:{ico:'🔵',n:'Poço Limpo',d:'Limpe todos os pinos laranja do Poço das Almas.'},
  trono:{ico:'👑',n:'Mestre de Verdade',d:'Sobreviva a 40 sessões n’O Trono do Mestre.'},
  baralho:{ico:'🃏',n:'Mão Vazia',d:'Vença uma partida de UNO Teosófico.'},
  clicker:{ico:'📖',n:'Biblioteca Infinita',d:'Junte 1 milhão de Essência no Teosofia Clicker.'},
  campeao:{ico:'🥊',n:'Campeão da Rinha',d:'Vença uma luta na Rinha de Tulpas.'},
  piloto:{ico:'🏎',n:'Piloto do Véu',d:'Termine em 1º lugar na Corrida do Véu.'},
  doom:{ico:'💀',n:'Exorcista',d:'Chegue à 5ª horda do DOOM: Colapso Mental.'},
  vazio:{ico:'🧱',n:'Nada Me Segura',d:'Complete todas as fases do Salto para o Vazio.'},
  abismo:{ico:'🗝',n:'Fundo do Abismo',d:'Derrote o Perseus Abissal no Labirinto do Abismo.'},
});

/* ===================================================================
   🌀 FUGA ALÉM DO VÉU — auto-runner no ritmo
   Toque/Espaço: pula. Depois de um portal roxo, o toque inverte a
   gravidade (anda no teto). Obstáculos caem nas batidas da música e
   ficam mais densos com o tempo. Todo trecho é vencível: o espaço entre
   obstáculos é calculado pelo alcance do pulo e pelo tempo da virada.
   =================================================================== */
function fuga(C){
  const W=800,H=450,FL=380,CE=70,PX=180,SZ=30;
  const SPD=gdPick(C.gd,[250,300,350,410]),G=2600,JV=860,BPM=gdPick(C.gd,[110,120,130,142]),spb=60/BPM,BPX=SPD*spb;
  const JH=JV*JV/(2*G),SPAN=SPD*(2*JV/G),FLIPPX=SPD*Math.sqrt(2*(FL-CE-SZ)/G);
  const CH=8*BPX;   /* um trecho = 2 compassos */
  const S={y:FL-SZ/2,vy:0,g:1,d:0,t:0,rot:0,ground:true,buf:0,beat:-1,dead:false,mode:'j',best:0,parts:[]},R=ghostRace(C,S);
  const cache=new Map();
  function chunk(k){
    if(cache.has(k))return cache.get(k);
    const r=i=>hrand(C.seed,k,i),x0=k*CH,obs=[];
    const prevMode=k>0?chunk(k-1).modeOut:'j';
    let mode=prevMode;
    if(k>=3&&r(1)<gdPick(C.gd,[.12,.2,.26,.32]))mode=prevMode==='j'?'f':'j';
    if(mode!==prevMode)obs.push({t:'portal',x:x0+BPX*.5,to:mode});
    const dens=Math.min(.82,gdPick(C.gd,[.3,.38,.44,.5])+k*.012);
    let b=mode!==prevMode?4:2;   /* depois de um portal, 3 batidas livres */
    while(b<8){
      if(k===0||r(10+b)>dens){b++;continue}
      const x=x0+b*BPX;
      if(mode==='j'){
        if(r(20+b)<.65){const n=1+Math.floor(r(30+b)*Math.min(3,1+k/6)),w=Math.min(n*26,SPAN*.5);obs.push({t:'sp',x,w,side:1})}
        else{const w=40+r(40+b)*50,h=Math.min(JH*.6,26+r(50+b)*40);obs.push({t:'bl',x,w,h})}
        b+=Math.ceil(SPAN*1.1/BPX)+(r(60+b)<.4?1:0);
      }else{
        const side=r(70+b)<.5?1:-1,n=1+Math.floor(r(80+b)*2);obs.push({t:'sp',x,w:n*26,side});
        b+=Math.max(2,Math.ceil(FLIPPX*1.45/BPX));
      }
    }
    const c={obs,modeIn:prevMode,modeOut:mode,x0};cache.set(k,c);return c;
  }
  const near=()=>{const k=Math.floor(S.d/CH);return[k-1,k,k+1,k+2].filter(i=>i>=0).flatMap(i=>chunk(i).obs)};
  S.near=near;S.tapF=()=>tap();
  function tap(){if(S.dead||Date.now()<C.t0)return;S.buf=.12}
  function die(){if(S.dead)return;S.dead=true;for(let i=0;i<14;i++)S.parts.push({x:PX,y:S.y,vx:(Math.random()-.5)*500,vy:(Math.random()-.5)*500,t:0});
    const m=Math.floor(S.d/40);if(m>=400)C.achieve?.('geometria');R.die(m)}
  return{st:()=>S,
    key(code,down){if(down&&['Space','KeyW','ArrowUp','Enter'].includes(code))tap()},
    ptr(t){if(t==='down')tap()},
    msg:R.msg,left:R.left,
    step(dt){
      S.parts.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt});
      if(Date.now()<C.t0||S.dead)return;
      S.t+=dt;S.d+=SPD*dt;
      const bt=Math.floor(S.t/spb);if(bt!==S.beat){S.beat=bt;try{const c=actx();if(c){const t=c.currentTime+.01;o5('sine',120,t,.12,{to:45,gain:.12,attack:.002,wet:.03});if(bt%2)n5(t,.08,{freq:2000,gain:.06,wet:.2})}}catch(e){}}
      const wx=S.d+PX;
      near().forEach(o=>{if(o.t==='portal'&&!o.done&&wx>=o.x){o.done=true;S.mode=o.to;if(o.to==='j')S.g=1;fx5('activate')}});
      if(S.buf>0){S.buf-=dt;if(S.ground){S.buf=0;if(S.mode==='j'){S.vy=-JV;S.ground=false;fx5('mgJump')}else{S.g=-S.g;S.vy=-S.g*120;S.ground=false;fx5('mgJump')}}}
      const prevY=S.y;S.vy+=G*S.g*dt;S.y+=S.vy*dt;S.ground=false;
      const floor=FL-SZ/2,ceil=CE+SZ/2;
      if(S.g===1&&S.y>=floor){S.y=floor;S.vy=0;S.ground=true}
      if(S.g===-1&&S.y<=ceil){S.y=ceil;S.vy=0;S.ground=true}
      if(S.y<ceil-2&&S.g===1){S.y=ceil;S.vy=Math.max(0,S.vy)}
      for(const o of near()){
        if(o.t==='bl'){const top=FL-o.h;if(wx+SZ/2>o.x&&wx-SZ/2<o.x+o.w){
          if(S.vy>=0&&prevY+SZ/2<=top+8&&S.y+SZ/2>=top){S.y=top-SZ/2;S.vy=0;S.ground=true}
          else if(S.y+SZ/2>top+6){die();return}}}
        if(o.t==='sp'){const hw=o.w*.36,hx=o.x+o.w/2,hh=22;const cy=o.side===1?FL-hh/2:CE+hh/2;
          if(Math.abs(wx-hx)<hw+SZ*.32&&Math.abs(S.y-cy)<hh/2+SZ*.32){die();return}}
      }
      if(S.ground)S.rot=Math.round(S.rot/(Math.PI/2))*(Math.PI/2);else S.rot+=dt*7*S.g;
      R.send({d:Math.round(S.d),y:Math.round(S.y)});
      C.hud(`🌀 <b>${Math.floor(S.d/40)} m</b> · ${S.mode==='j'?'toque para pular':'<b style="color:#c39bff">gravidade invertida</b>: toque para virar'} · ${BPM} BPM`);
    },
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#120a24');gr.addColorStop(1,'#2a0f3a');x.fillStyle=gr;x.fillRect(0,0,W,H);
      const beatK=(S.t/spb)%1,pulse=Math.pow(1-beatK,3);
      x.strokeStyle=`rgba(195,155,255,${.08+pulse*.12})`;x.lineWidth=2;for(let i=0;i<12;i++){const lx=((i*90-S.d*.3)%1080+1080)%1080-80;x.beginPath();x.moveTo(lx,CE);x.lineTo(lx+60,FL);x.stroke()}
      x.fillStyle='#1a1030';x.fillRect(0,FL,W,H-FL);x.fillRect(0,0,W,CE);x.fillStyle=`rgba(195,155,255,${.5+pulse*.5})`;x.fillRect(0,FL,W,3);x.fillRect(0,CE-3,W,3);
      const ox=PX-S.d-PX;
      near().forEach(o=>{const sx=o.x-S.d;if(sx<-120||sx>W+120)return;
        if(o.t==='sp'){const n=Math.max(1,Math.round(o.w/26));for(let i=0;i<n;i++){const bx=sx+i*26;x.beginPath();if(o.side===1){x.moveTo(bx,FL);x.lineTo(bx+13,FL-26);x.lineTo(bx+26,FL)}else{x.moveTo(bx,CE);x.lineTo(bx+13,CE+26);x.lineTo(bx+26,CE)}x.closePath();x.fillStyle='#ff5b7a';x.fill();x.strokeStyle='#ffd0da';x.lineWidth=1.5;x.stroke()}}
        if(o.t==='bl'){rr16(x,sx,FL-o.h,o.w,o.h,4);x.fillStyle='#3b2a66';x.fill();x.strokeStyle='#c39bff';x.lineWidth=2;x.stroke()}
        if(o.t==='portal'){x.save();x.globalAlpha=.85;const g2=x.createLinearGradient(sx-10,0,sx+10,0);g2.addColorStop(0,'rgba(195,155,255,0)');g2.addColorStop(.5,o.to==='f'?'#c39bff':'#7dffa8');g2.addColorStop(1,'rgba(195,155,255,0)');x.fillStyle=g2;x.fillRect(sx-12,CE,24,FL-CE);x.restore();txt16(x,o.to==='f'?'⇅':'⤒',sx,CE-14,{size:16,col:o.to==='f'?'#c39bff':'#7dffa8'})}
      });
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=PX+(g.d-S.d);if(gx<-40||gx>W+40)continue;sprAt16(x,R.col(u),gx,g.y,SZ+8,0,g.dead?.15:.42);if(MG.drawn)MG.drawn[R.nm(u)]=.42;txt16(x,R.nm(u),gx,g.y-SZ,{size:11,col:'rgba(255,255,255,.75)',stroke:3})}
      if(!S.dead)sprAt16(x,me16(C).c,PX,S.y,SZ+10,S.rot);
      S.parts.forEach(p=>{if(p.t>.8)return;x.globalAlpha=1-p.t/.8;x.fillStyle='#c39bff';x.fillRect(p.x-3,p.y-3,6,6);x.globalAlpha=1});
      txt16(x,Math.floor(S.d/40)+' m',W-14,20,{size:16,al:'right',col:'#e9e1ff'});
    }
  };
}

/* ===================================================================
   ❤️ JULGAMENTO DA ESSÊNCIA — bullet hell (estilo Undertale)
   Controle o coração (Vital) dentro do quadro. Ataques brancos ferem;
   ataques AZUIS só ferem se você estiver se mexendo. Sobreviva às 12
   investidas das Trilhas. PvP: os dois enfrentam a mesma sequência.
   =================================================================== */
function julgamento(C){
  const W=600,H=450,BX=180,BY=150,BW=240,BH=200,HR=7,SP=gdPick(C.gd,[150,165,175,185]);
  const VMAX=gdPick(C.gd,[30,20,16,12]),DMG=3,TOTAL=12,DUR=5.2,SPDK=gdPick(C.gd,[.8,1,1.18,1.36]);
  const S={x:BX+BW/2,y:BY+BH/2,hp:VMAX,inv:0,b:[],k:-1,at:0,t:0,moving:false,keys:{},hits:0,done:false,flash:0},R=ghostRace(C,S);
  const NAMES=['Lâminas da Fé','Chuva de Ilusão','Raízes da Natureza','Olho da Verdade','Espiral da Inexistência','Anel do Véu'];
  const FLAV=['Perseus aponta uma pata. Lâminas de Fé atravessam o quadro.','O ar se desfaz em gotas de Ilusão.','Raízes brotam do chão do Julgamento.','O Olho da Verdade varre o quadro. Fique PARADO no azul.','A Inexistência gira em espiral.','Um anel do Véu se fecha à sua volta.'];
  const rnd=mb32(C.seed^0x51);
  function spawn(k){
    const p=k%6,sp=SPDK;S.pat=p;S.b=[];S.spawnT=0;S.patT=0;
    if(p===4)S.cx=BX+BW/2,S.cy=BY-40;
  }
  function emit(dt){
    const p=S.pat;S.patT+=dt;S.spawnT-=dt;const sp=SPDK;
    if(S.patT>DUR-0.8)return;
    if(p===0&&S.spawnT<=0){S.spawnT=.55/sp;const left=rnd()<.5,gap=BY+20+rnd()*(BH-70);for(let y=BY;y<BY+BH;y+=14){if(y>gap&&y<gap+48)continue;S.b.push({x:left?BX-10:BX+BW+10,y,vx:(left?1:-1)*170*sp,vy:0,r:5,c:'w'})}}
    if(p===1&&S.spawnT<=0){S.spawnT=.11/sp;S.b.push({x:BX+rnd()*BW,y:BY-8,vx:(rnd()-.5)*30,vy:(130+rnd()*90)*sp,r:4,c:'w'})}
    if(p===2&&S.spawnT<=0){S.spawnT=.7/sp;const gx=BX+20+rnd()*(BW-60);for(let x=BX+6;x<BX+BW;x+=16){if(x>gx&&x<gx+46)continue;S.b.push({x,y:BY+BH+10,vx:0,vy:-150*sp,r:6,c:'w',bar:1})}}
    if(p===3&&S.spawnT<=0){S.spawnT=1.1/sp;const left=rnd()<.5;S.b.push({x:left?BX-8:BX+BW+8,y:BY+BH/2,vx:(left?1:-1)*150*sp,vy:0,r:0,c:'b',wall:1,h:BH});if(rnd()<.6)for(let i=0;i<3;i++)S.b.push({x:BX+rnd()*BW,y:BY-8,vx:0,vy:120*sp,r:4,c:'w'})}
    if(p===4&&S.spawnT<=0){S.spawnT=.07/sp;S.ang=(S.ang||0)+.42;S.b.push({x:BX+BW/2,y:BY-30,vx:Math.cos(S.ang)*130*sp,vy:Math.abs(Math.sin(S.ang))*130*sp+40,r:4,c:rnd()<.25?'b':'w'})}
    if(p===5&&S.spawnT<=0){S.spawnT=1.3/sp;const n=18,miss=Math.floor(rnd()*n);for(let i=0;i<n;i++){if(i===miss||i===(miss+1)%n)continue;const a=i/n*TAU16,r0=210;S.b.push({x:S.x+Math.cos(a)*r0,y:S.y+Math.sin(a)*r0,vx:-Math.cos(a)*120*sp,vy:-Math.sin(a)*120*sp,r:5,c:'w'})}}
  }
  function hurt(){if(S.inv>0)return;S.hp-=DMG;S.hits++;S.inv=.85;S.flash=performance.now();fx5('error');if(S.hp<=0){S.hp=0;end(false)}}
  function end(won){if(S.done)return;S.done=true;const score=Math.round(S.t*10+S.hp*20+(won?500:0));if(won&&S.hits===0)C.achieve?.('coracao');
    if(!C.net){solo16(C,score,won?`Você sobreviveu ao Julgamento! · ${S.hp} de Vital`:`O Julgamento te alcançou na investida ${S.k+1}`,won);return}R.die(score)}
  return{st:()=>S,
    key(code,down){S.keys[code]=down},
    ptr(t,px,py){if(t==='down'||t==='move'){if(t==='down'||S.drag){S.drag=t!=='up';S.tx=px;S.ty=py}}if(t==='up'){S.drag=false;S.tx=null}},
    msg:R.msg,left:R.left,
    step(dt){
      if(Date.now()<C.t0||S.done)return;S.t+=dt;S.inv=Math.max(0,S.inv-dt);
      const k=Math.floor(S.t/DUR);if(k!==S.k){if(k>=TOTAL){end(true);return}S.k=k;spawn(k);C.say(FLAV[k%6],false)}
      emit(dt);
      let dx=(S.keys.KeyD||S.keys.ArrowRight?1:0)-(S.keys.KeyA||S.keys.ArrowLeft?1:0),dy=(S.keys.KeyS||S.keys.ArrowDown?1:0)-(S.keys.KeyW||S.keys.ArrowUp?1:0);
      if(S.tx!=null){const ddx=S.tx-S.x,ddy=S.ty-S.y,d=Math.hypot(ddx,ddy);if(d>4){dx=ddx/d;dy=ddy/d}}
      const n=Math.hypot(dx,dy)||1;S.moving=!!(dx||dy);S.x=clamp12(S.x+dx/n*SP*dt,BX+HR,BX+BW-HR);S.y=clamp12(S.y+dy/n*SP*dt,BY+HR,BY+BH-HR);
      S.b.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt});
      S.b=S.b.filter(b=>b.x>BX-260&&b.x<BX+BW+260&&b.y>BY-260&&b.y<BY+BH+260);
      for(const b of S.b){
        if(b.wall){if(Math.abs(S.x-b.x)<10&&b.c==='b'&&S.moving){hurt();break}continue}
        if(Math.hypot(b.x-S.x,b.y-S.y)<b.r+HR-2){if(b.c==='w'||S.moving){hurt();break}}
      }
      R.send({x:Math.round(S.x),y:Math.round(S.y),hp:S.hp});
      C.hud(`❤ Vital <b>${S.hp}</b>/${VMAX} · investida <b>${Math.min(TOTAL,S.k+1)}</b>/${TOTAL}: ${NAMES[(S.k<0?0:S.k)%6]} · <span style="color:#7fc8ff">azul = fique parado</span>`);
    },
    draw(x){
      x.fillStyle='#000';x.fillRect(0,0,W,H);
      sprAt16(x,-1,W/2,74,92,Math.sin(performance.now()/600)*.05);txt16(x,'PERSEUS, O JUIZ',W/2,128,{size:12,col:'#aaa'});
      x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(BX-2,BY-2,BW+4,BH+4);
      x.save();x.beginPath();x.rect(BX,BY,BW,BH);x.clip();
      S.b.forEach(b=>{x.fillStyle=b.c==='b'?'#3ab0ff':'#fff';if(b.wall){x.fillRect(b.x-5,BY,10,BH)}else if(b.bar){x.fillRect(b.x-5,b.y-6,10,40)}else{x.beginPath();x.arc(b.x,b.y,b.r,0,TAU16);x.fill()}});
      for(const u in S.gh){const g=S.gh[u];if(g.x==null)continue;x.save();x.globalAlpha=g.dead?.12:.35;heart16(x,g.x,g.y,HR,mgCol(R.col(u)));x.restore();if(MG.drawn)MG.drawn[R.nm(u)]=.35}
      x.restore();
      S.b.forEach(b=>{if(b.wall||b.bar)return;if(b.x<BX||b.x>BX+BW||b.y<BY||b.y>BY+BH){x.fillStyle=b.c==='b'?'#3ab0ff':'#fff';x.beginPath();x.arc(b.x,b.y,b.r,0,TAU16);x.fill()}});
      if(!S.done||S.hp>0){x.save();if(S.inv>0&&Math.floor(performance.now()/80)%2)x.globalAlpha=.3;heart16(x,S.x,S.y,HR,'#ff2a3d');x.restore()}
      const bw=200;x.fillStyle='#600';x.fillRect(W/2-bw/2,BY+BH+24,bw,14);x.fillStyle='#ffd000';x.fillRect(W/2-bw/2,BY+BH+24,bw*S.hp/VMAX,14);
      txt16(x,'VT',W/2-bw/2-18,BY+BH+31,{size:13,col:'#fff'});txt16(x,`${S.hp} / ${VMAX}`,W/2+bw/2+34,BY+BH+31,{size:13,col:'#fff'});
      if(S.k>=0)txt16(x,NAMES[S.k%6],W/2,BY+BH+64,{size:15,col:S.pat===3?'#7fc8ff':'#fff'});
      for(const u in S.gh){const g=S.gh[u];txt16(x,`${R.nm(u)}: ${g.dead?'caiu':'❤ '+(g.hp??'?')}`,12,H-14,{size:12,al:'left',col:mgCol(R.col(u))});break}
    }
  };
}
function heart16(x,cx,cy,r,col){x.beginPath();x.moveTo(cx,cy+r);x.bezierCurveTo(cx-r*1.6,cy-r*.2,cx-r*.8,cy-r*1.4,cx,cy-r*.5);x.bezierCurveTo(cx+r*.8,cy-r*1.4,cx+r*1.6,cy-r*.2,cx,cy+r);x.fillStyle=col;x.fill()}

/* ===================================================================
   🔵 POÇO DAS ALMAS — física de pinos (estilo Peggle)
   Mire e solte a esfera. Pinos acesos somem quando a esfera sai por
   baixo. Laranja: obrigatórios. Azul: Lucidez. Vermelho: Vital.
   A cesta que passeia no fundo devolve a esfera. PvP: mesmo poço.
   =================================================================== */
function poco(C){
  const W=480,H=640,LX=W/2,LY=46,PR=8,BR=7,G=640,BALLS=gdPick(C.gd,[12,10,9,8]),NOR=gdPick(C.gd,[16,20,24,28]);
  const rnd=mb32(C.seed^0x77),pegs=[];
  /* desenho do poço: arcos, linhas e pinos soltos (mesmo para todos pelo seed) */
  const lay=C.seed%3;
  for(let row=0;row<9;row++){const y=150+row*48,n=lay===0?7+(row%2):lay===1?8:6+(row%3),off=(row%2)*24;
    for(let i=0;i<n;i++){let x=40+off+i*((W-80-off)/(n-1||1));const yy=y+(lay===2?Math.sin(i*.9+row)*16:lay===1?Math.abs(i-(n-1)/2)*-6:0);x+=(rnd()-.5)*10;if(x<20||x>W-20)continue;pegs.push({x,y:yy,k:'g',lit:false,gone:false})}}
  const idx=pegs.map((_,i)=>i).sort(()=>rnd()-.5);idx.slice(0,NOR).forEach(i=>pegs[i].k='o');idx.slice(NOR,NOR+6).forEach(i=>pegs[i].k='b');idx.slice(NOR+6,NOR+10).forEach(i=>pegs[i].k='r');
  const S={ang:Math.PI/2,ball:null,balls:BALLS,score:0,luc:0,vit:0,bucket:W/2,bdir:1,stuck:0,done:false,pops:[],trail:[]},R=ghostRace(C,S);
  const left=()=>pegs.filter(p=>p.k==='o'&&!p.gone).length;
  function shoot(){if(S.ball||S.done||Date.now()<C.t0||S.balls<=0)return;S.balls--;const v=560;S.ball={x:LX,y:LY,vx:Math.cos(S.ang)*v,vy:Math.sin(S.ang)*v,hits:0};S.trail=[];fx5('mgJump')}
  function aimAt(px,py){S.ang=clamp12(Math.atan2(py-LY,px-LX),.12,Math.PI-.12)}
  function clearLit(){let n=0;pegs.forEach(p=>{if(p.lit&&!p.gone){p.gone=true;n++}});return n}
  function finish(win){if(S.done)return;S.done=true;if(win){S.score+=S.balls*500;C.achieve?.('poco')}
    if(!C.net){solo16(C,S.score,win?`Poço limpo! ${S.balls} esfera(s) sobrando`:`As esferas acabaram · faltaram ${left()} pinos laranja`,win);return}R.die(S.score)}
  return{st:()=>S,
    key(code,down){if(!down)return;if(code==='ArrowLeft'||code==='KeyA')S.ang=clamp12(S.ang+.06,.12,Math.PI-.12);if(code==='ArrowRight'||code==='KeyD')S.ang=clamp12(S.ang-.06,.12,Math.PI-.12);if(code==='Space'||code==='Enter')shoot()},
    ptr(t,px,py){if(t==='move'||t==='down')aimAt(px,py);if(t==='up')shoot()},
    msg:R.msg,left:R.left,
    step(dt){
      S.bucket+=S.bdir*110*dt;if(S.bucket<50||S.bucket>W-50)S.bdir*=-1;
      S.pops=S.pops.filter(p=>(p.t+=dt)<.9);
      const b=S.ball;if(b&&!S.done){
        const sub=4;for(let k=0;k<sub;k++){const h=dt/sub;b.vy+=G*h;b.x+=b.vx*h;b.y+=b.vy*h;
          if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.85}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.85}
          for(const p of pegs){if(p.gone)continue;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<PR+BR&&d>0){const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.75*vn*nx;b.vy-=1.75*vn*ny}b.x=p.x+nx*(PR+BR+.5);b.y=p.y+ny*(PR+BR+.5);
            if(!p.lit){p.lit=true;b.hits++;const mul=1+Math.floor((NOR-left())/5);const v=(p.k==='o'?100:p.k==='g'?10:50)*mul;S.score+=v;if(p.k==='b')S.luc++;if(p.k==='r')S.vit++;S.pops.push({x:p.x,y:p.y,t:0,s:'+'+v});fx5(p.k==='o'?'mgCoin':'click')}}}
        }
        S.trail.push([b.x,b.y]);if(S.trail.length>18)S.trail.shift();
        const sp=Math.hypot(b.vx,b.vy);S.stuck=sp<40?S.stuck+dt:0;if(S.stuck>1.6){clearLit();S.stuck=0;b.vy=-200}
        if(b.y>H-24&&Math.abs(b.x-S.bucket)<46&&b.vy>0){S.balls++;S.pops.push({x:b.x,y:H-50,t:0,s:'Esfera de volta!'});fx5('mgWin');b.y=H+50}
        if(b.y>H+20){const n=clearLit();S.ball=null;if(left()===0){finish(true);return}if(S.balls<=0){finish(false);return}}
      }
      R.send({s:S.score,l:left()});
      C.hud(`🔵 Esferas <b>${S.balls}</b> · laranja restantes <b>${left()}</b> · ⚗ <b>${S.score}</b> · 🧠 ${S.luc} · ❤ ${S.vit}`);
    },
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0c1530');gr.addColorStop(1,'#1d0d2c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      if(!S.ball&&!S.done){let px=LX,py=LY,vx=Math.cos(S.ang)*560,vy=Math.sin(S.ang)*560;x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<22;i++){const h=.03;vy+=G*h;px+=vx*h;py+=vy*h;if(px<BR||px>W-BR)vx=-vx;if(i%2)x.fillRect(px-1.5,py-1.5,3,3)}}
      pegs.forEach(p=>{if(p.gone)return;const col=p.k==='o'?'#ff8a2a':p.k==='b'?'#3a8bff':p.k==='r'?'#ff3d5a':'#9aa0b8';x.beginPath();x.arc(p.x,p.y,PR,0,TAU16);x.fillStyle=p.lit?'#fff':col;x.fill();if(p.lit){x.lineWidth=3;x.strokeStyle=col;x.stroke()}});
      S.trail.forEach(([tx,ty],i)=>{x.globalAlpha=i/S.trail.length*.4;x.beginPath();x.arc(tx,ty,BR*.7,0,TAU16);x.fillStyle='#ffd36b';x.fill()});x.globalAlpha=1;
      if(S.ball){x.beginPath();x.arc(S.ball.x,S.ball.y,BR,0,TAU16);x.fillStyle='#ffd36b';x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke()}
      x.save();x.translate(LX,LY);x.rotate(S.ang-Math.PI/2);x.fillStyle='#c39bff';x.fillRect(-7,0,14,30);x.restore();sprAt16(x,me16(C).c,LX,LY-12,48);
      rr16(x,S.bucket-46,H-26,92,20,8);x.fillStyle='#3fae5a';x.fill();txt16(x,'cesta',S.bucket,H-16,{size:11,col:'#0b2'});
      S.pops.forEach(p=>txt16(x,p.s,p.x,p.y-p.t*40,{size:13,col:'#fff',stroke:3}));
      for(let i=0;i<S.balls;i++){x.beginPath();x.arc(14,90+i*16,5,0,TAU16);x.fillStyle='#ffd36b';x.fill()}
      for(const u in S.gh){const g=S.gh[u];txt16(x,`${R.nm(u)}: ${g.dead?'terminou':''} ${g.s??0} ⚗ · ${g.l??'?'} laranja`,W-10,H-44,{size:12,al:'right',col:mgCol(R.col(u)),stroke:3});if(MG.drawn)MG.drawn[R.nm(u)]=.5;break}
    }
  };
}

/* ===================================================================
   👑 O TRONO DO MESTRE — cartas de decisão (estilo Reigns)
   Arraste a carta para a esquerda ou a direita (ou ← →). Equilibre
   Mestre, Jogadores, Vital e Lucidez: nenhuma barra pode zerar nem
   transbordar. Cada carta é uma sessão da sua ordem secreta.
   =================================================================== */
const TRONO_CARDS=[
  ['Perseus','😼','Perseus derrubou o café na ficha do Bruno. Ele quer que você finja que foi um evento do Véu.',['Foi o Véu.',[0,8,-5,0]],['Pede desculpas.',[-4,-6,0,6]]],
  ['Jogadora','🧑‍🎤','“Mestre, posso usar Ilusão para virar uma galinha gigante?”',['Pode. Hoje é dia de caos.',[-6,12,0,-10]],['Não. Regras são regras.',[8,-10,0,4]]],
  ['Oráculo','🔮','O Oráculo diz que a campanha vai durar mais três anos. O grupo se assusta.',['Acelere a história.',[-8,6,-4,0]],['Confie no ritmo.',[6,-6,0,4]]],
  ['Bibliotecária','📚','Um tomo proibido de Teosofia apareceu na biblioteca da ordem.',['Leia em voz alta.',[0,6,-6,-12]],['Tranque no cofre.',[6,-6,0,6]]],
  ['Jogador','🙋','“Rolei 20 natural! Posso derrotar o chefe com um soco?”',['Sim, épico!',[-10,14,0,0]],['Dano normal.',[8,-12,0,0]]],
  ['Curandeira','🩹','A curandeira pede verbas para Suturas Brutas.',['Libere tudo.',[-6,4,14,0]],['Corte pela metade.',[6,-4,-10,0]]],
  ['Cultista','🕯','Cultistas querem invocar algo “só um pouquinho”.',['Deixe, vai ser divertido.',[0,8,-10,-10]],['Expulse todos.',[6,-6,4,4]]],
  ['Perseus','😼','Perseus exige um trono só dele, ao lado do seu.',['Concedido.',[-6,10,0,-4]],['Ele dorme no chão.',[6,-4,0,4]]],
  ['Novato','🧒','Um jogador novo não entendeu nada da Tabela de Defesa.',['Explique com paciência.',[-4,8,0,6]],['Aprende jogando.',[6,-8,-4,0]]],
  ['Vigia','👁','A Verdade revelou um traidor no grupo.',['Exponha na mesa.',[4,-10,0,8]],['Guarde o segredo.',[0,6,0,-10]]],
  ['Mercador','🧪','Um mercador vende frascos de Lucidez “quase originais”.',['Compre um lote.',[0,4,-4,12]],['Desconfie.',[4,-4,0,-6]]],
  ['Bardo','🎻','O bardo quer cantar a saga do grupo por três horas.',['Que cante.',[-8,10,0,6]],['Uma música só.',[6,-6,0,0]]],
  ['Mestre Rival','🎭','Um Mestre rival desafia sua ordem para um duelo de narrativas.',['Aceite.',[10,6,-8,-4]],['Recuse com elegância.',[-6,-4,4,4]]],
  ['Jogadora','🧑‍💻','“Fiz uma ficha com 47 páginas de história.”',['Leio tudo.',[-10,10,0,6]],['Resume em uma linha?',[6,-8,0,0]]],
  ['Sombra','◐','A Inexistência sussurra que tudo é inútil.',['Escute com atenção.',[0,0,-6,-14]],['Ignore e role iniciativa.',[4,4,-4,8]]],
  ['Perseus','😼','Perseus sentou no mapa tático. Os tokens caíram.',['Deixe ele lá.',[-6,8,0,4]],['Tire o gato.',[6,-6,0,0]]],
  ['Guardião','🛡','O guardião pede treino de combate para todos.',['Treino pesado.',[4,-6,-8,6]],['Folga geral.',[-4,8,6,-4]]],
  ['Jogador','🙅','Um jogador faltou de novo. O grupo quer puni-lo na história.',['O personagem some no Véu.',[6,-8,0,0]],['Ele “dormiu na taverna”.',[-4,8,0,0]]],
  ['Profeta','🌿','A Natureza oferece um pacto: Vital em troca de memórias.',['Aceite o pacto.',[0,0,16,-12]],['Recuse.',[0,0,-8,6]]],
  ['Contador','📊','O caixa da ordem está no vermelho.',['Cobre mensalidade.',[8,-12,0,0]],['Faça uma rifa.',[-4,6,0,-4]]],
  ['Jogadora','😭','Uma personagem amada morreu num crítico.',['Ressurreição dramática.',[-8,12,6,0]],['A morte é real.',[10,-12,0,4]]],
  ['Sábio','🧘','Um sábio propõe uma sessão só de meditação.',['Topo.',[-6,-6,6,14]],['Melhor combate.',[4,6,-6,-6]]],
  ['Perseus','😼','Perseus aprendeu a abrir a geladeira.',['Promova a sumo-sacerdote.',[-4,10,0,-6]],['Cadeado nela.',[4,-6,0,4]]],
  ['Arquiteto','🏛','O arquiteto quer construir um Santuário novo.',['Construa.',[8,6,-10,0]],['Reforme o velho.',[-4,-4,6,0]]],
  ['Eco','🧠','Ecos de uma campanha antiga confundem os jogadores.',['Conte a história toda.',[-6,6,0,10]],['Deixe no mistério.',[6,-4,0,-8]]],
  ['Viajante','🧳','Um viajante traz notícias de outra mesa. Lá o Mestre dá XP em dobro.',['Dobre o XP também.',[-12,14,0,0]],['Cada mesa é uma mesa.',[8,-10,0,0]]],
  ['Ilusionista','🌀','O ilusionista transformou a sala em um labirinto.',['Jogue no labirinto.',[0,8,-6,-8]],['Desfaça a ilusão.',[6,-6,0,6]]],
  ['Jogador','🍕','“Mestre, pizza ou campanha?”',['Pizza primeiro.',[-6,10,8,0]],['Campanha primeiro.',[8,-8,-6,0]]],
  ['Fé','✶','Um peregrino pede bênção para a jornada do grupo.',['Abençoe.',[4,6,6,0]],['A Fé se conquista.',[6,-6,-4,4]]],
  ['Perseus','😼','Perseus olhou fixamente para o nada por dez minutos.',['Investigue o nada.',[0,4,0,-10]],['É só um gato.',[4,-2,0,6]]],
];
const TRONO_END=[
  ['O Mestre desapareceu','Sem autoridade, a ordem virou um grupo de WhatsApp sem dono.'],
  ['O Mestre virou tirano','Ninguém mais aguentava as regras. A mesa ficou vazia.'],
  ['Os jogadores foram embora','Sem diversão, cada um foi jogar outra coisa.'],
  ['Os jogadores tomaram o trono','Felizes demais, decidiram mestrar no seu lugar.'],
  ['A ordem perdeu o Vital','Cansados e feridos, todos foram dormir para sempre.'],
  ['Vital demais','Todo mundo ficou imortal e a campanha perdeu a graça.'],
  ['A Lucidez acabou','A ordem enlouqueceu e passou a adorar o Perseus.'],
  ['Lucidez demais','Viram a verdade do Véu e transcenderam. Sem jogadores.'],
];
function trono(C){
  const W=480,H=640,K=gdPick(C.gd,[.8,1,1.2,1.45]),BARS=['🎲 Mestre','👥 Jogadores','❤ Vital','🧠 Lucidez'],BC=['#ffd36b','#7fe3ff','#ff6b5b','#c39bff'];
  const rnd=mb32(C.seed^0x7e);
  const S={v:[50,50,50,50],n:0,card:null,dx:0,drag:false,sx:0,anim:0,done:false,deck:[],end:null};
  function next(){if(!S.deck.length)S.deck=TRONO_CARDS.map((_,i)=>i).sort(()=>rnd()-.5);S.card=TRONO_CARDS[S.deck.pop()];S.dx=0;S.anim=1}
  function choose(side){
    if(!S.card||S.done)return;const opt=S.card[side<0?3:4];S.v=S.v.map((v,i)=>v+Math.round(opt[1][i]*K));S.n++;fx5(side<0?'click':'activate');
    const bad=S.v.findIndex(v=>v<=0||v>=100);
    if(bad>=0){S.done=true;const e=TRONO_END[bad*2+(S.v[bad]>=100?1:0)];S.end=e;S.v=S.v.map(v=>clamp12(v,0,100));if(S.n>=40)C.achieve?.('trono');
      setTimeout(()=>solo16(C,S.n,`${e[0]} · ${S.n} sessões`,S.n>=40),1600);return}
    if(S.n>=40)C.achieve?.('trono');
    next();
  }
  next();
  return{st:()=>S,
    key(code,down){if(!down||Date.now()<C.t0)return;if(code==='ArrowLeft'||code==='KeyA')choose(-1);if(code==='ArrowRight'||code==='KeyD')choose(1)},
    ptr(t,px){if(Date.now()<C.t0)return;if(t==='down'){S.drag=true;S.sx=px}else if(t==='move'&&S.drag){S.dx=px-S.sx}else if(t==='up'){S.drag=false;if(Math.abs(S.dx)>90)choose(Math.sign(S.dx));else if(Math.abs(S.dx)<6){choose(px<W/2?-1:1)}S.dx=0}},
    step(dt){S.anim=Math.max(0,S.anim-dt*4);if(!S.drag)S.dx*=.8;C.hud(`👑 Sessão <b>${S.n+1}</b> · arraste a carta (ou ← →) · nenhuma barra pode zerar nem lotar`)},
    draw(x){
      x.fillStyle='#1a1410';x.fillRect(0,0,W,H);
      const side=S.dx<-20?-1:S.dx>20?1:0,opt=S.card&&side?S.card[side<0?3:4]:null;
      BARS.forEach((b,i)=>{const bx=20+i*112,v=S.v[i];x.fillStyle='#2a221c';rr16(x,bx,16,100,70,12);x.fill();
        txt16(x,b.split(' ')[0],bx+50,36,{size:22});x.fillStyle='#000';x.fillRect(bx+12,58,76,10);x.fillStyle=BC[i];x.fillRect(bx+12,58,76*clamp12(v,0,100)/100,10);
        txt16(x,b.split(' ')[1],bx+50,78,{size:11,col:'#cfc3b0'});
        if(opt&&opt[1][i]){const s=Math.abs(opt[1][i])>9?9:5;x.beginPath();x.arc(bx+50,96,s,0,TAU16);x.fillStyle='#fff';x.fill()}});
      if(S.done&&S.end){txt16(x,S.end[0],W/2,H/2-30,{size:24,col:'#ffd36b'});txt16(x,S.end[1],W/2,H/2+10,{size:14,col:'#e9e1d0'});return}
      const c=S.card;if(!c)return;
      const cx=W/2+S.dx,cy=360+S.anim*60,rot=S.dx/600;
      x.save();x.translate(cx,cy);x.rotate(rot);x.globalAlpha=1-S.anim*.6;
      rr16(x,-150,-170,300,340,18);x.fillStyle='#f1e4c8';x.fill();x.lineWidth=3;x.strokeStyle='#8a6a3a';x.stroke();
      if(c[0]==='Perseus')sprAt16(x,-1,0,-90,110);else txt16(x,c[1],0,-90,{size:64});
      txt16(x,c[0],0,-22,{size:18,col:'#3a2a12'});
      wrap16(x,c[2],0,8,260,19,'#3a2a12',15);
      if(side){rr16(x,-150,-170,300,46,18);x.fillStyle='rgba(42,26,10,.9)';x.fill();txt16(x,opt[0],0,-147,{size:15,col:'#ffd36b'})}
      x.restore();
      txt16(x,'◀ '+c[3][0],12,H-20,{size:12,al:'left',col:'#cfc3b0'});txt16(x,c[4][0]+' ▶',W-12,H-20,{size:12,al:'right',col:'#cfc3b0'});
      txt16(x,`Sessão ${S.n+1}`,W/2,130,{size:13,col:'#9a8a70'});
    }
  };
}
function wrap16(x,s,cx,y,maxW,lh,col,size){x.font=`500 ${size}px "IBM Plex Sans",system-ui,sans-serif`;const words=s.split(' ');let line='',yy=y;const out=[];words.forEach(w=>{const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t});if(line)out.push(line);out.forEach((l,i)=>txt16(x,l,cx,yy+i*lh,{size,w:500,col}))}

/* ---------- registro ---------- */
defineArcadeGame('fuga',{name:'Fuga Além do Véu',ico:'🌀',modes:['solo','mesa'],max:6,rec:true,unit:'m',W:800,H:450,pad:'tap',
  desc:'Auto-runner no ritmo: toque para pular. Depois do portal roxo, o toque inverte a gravidade.',keys:'Espaço, W ou ↑ (ou clique)',touch:'Toque na tela',make:fuga});
defineArcadeGame('julgamento',{name:'Julgamento da Essência',ico:'❤️',modes:['solo','pvp'],max:2,rec:true,unit:'pts',W:600,H:450,pad:'dir4',
  desc:'Bullet hell: guie o coração e desvie das 12 investidas. No azul, fique parado.',keys:'WASD ou setas',touch:'Arraste o dedo para guiar o coração',make:julgamento});
defineArcadeGame('poco',{name:'Poço das Almas',ico:'🔵',modes:['solo','pvp'],max:2,rec:true,unit:'⚗',W:480,H:640,
  desc:'Mire e solte a esfera nos pinos. Limpe os laranja com o menor número de esferas.',keys:'Mouse para mirar e clique para soltar · ← → e Espaço',touch:'Arraste para mirar, solte para lançar',make:poco});
defineArcadeGame('trono',{name:'O Trono do Mestre',ico:'👑',modes:['solo'],max:1,rec:true,unit:'sessões',W:480,H:640,
  desc:'Arraste as cartas para decidir. Equilibre Mestre, Jogadores, Vital e Lucidez.',keys:'← e → (ou arraste a carta)',touch:'Arraste a carta para um lado',make:trono});


