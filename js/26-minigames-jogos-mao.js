/* ===================================================================
   Os 6 mini-games
   =================================================================== */
const SAY12={
  aiPoint:['Belo saque. Pena que suas patas são curtas.','Ponto do gato. Anota aí no BN.','Eu nem estava olhando, sabia?','Isso foi física. Você devia estudar.','Miau. Próximo.'],
  humanPoint:['Isso foi sorte de dado, não habilidade.','Ok, essa eu deixei passar. Por pena.','Aproveite. Não vai se repetir.','A esfera escorregou. Acontece com os melhores. Comigo, raramente.'],
  multiPoint:['Que rally! Eu teria feito melhor, mas ok.','Ponto do time {t}. O outro time pode chorar no intervalo.','Alguém aí sabe pular de verdade?','Isso foi quase elegante.'],
  tttAi:['Hm. Previsível.','Você joga como quem rola 1 no d20.','Eu ganho até dormindo. Literalmente, sou um gato.','Interessante. Errado, mas interessante.'],
  tttMulti:['Jogada ousada. Ou distraída.','Estou só assistindo. E julgando.','Essa casa era óbvia, hein.'],
  eco:['{n} esqueceu a sequência. A Lucidez manda lembranças.','{n} caiu. Memória de peixe, não de gato.','Menos um. Eu lembraria até de olhos fechados.'],
  fall:['Gravidade: 1. Você: 0.','Voar não é para todos.','Tente bater as asas. É o básico.'],
  aiPoint_facil:['Ops, foi sem querer. Juro.','Ponto meu! Acho que foi sorte.','Eu tô só aquecendo as patinhas.'],
  humanPoint_facil:['Boa! Você tem jeito pra coisa.','Mandou bem. Eu tava distraído com uma mosca.','Ponto seu! Merecido.'],
  aiPoint_pesadelo:['Eu calculei essa trajetória antes de você nascer.','Isso não foi um ponto. Foi uma aula.','Seus reflexos são de Estágio 1. Os meus, de entidade.','Pode pedir para o Mestre rolar outra iniciativa. Não vai ajudar.','Sete vidas e nenhuma foi gasta com você.'],
  humanPoint_pesadelo:['Anotado. Vou me vingar com juros.','Um ponto. Guarde de lembrança, não vai ter outro.','Hm. Alguém andou treinando escondido.'],
  spike:['CORTADA. Chora no BN.','Isso se chama cortada. Pesquisa depois.','Nem a Lucidez te salvaria dessa.'],
  spike_pesadelo:['CORTADA. Senta e observa como se faz.','A rede é só decoração pra mim.','Pode sair da quadra, a bola não volta.'],
  aiWin:['Vitória. Como previsto pelo gato.','Fim de jogo. Eu ganhei e você aprendeu.'],
  aiWin_pesadelo:['Pesadelo cumprido. Volte quando tiver evoluído de Estágio.','Você escolheu Pesadelo. Eu só obedeci.'],
  humanWin:['Ok, você venceu. Vou fingir que deixei.','Parabéns. Não conte para ninguém.'],
  humanWin_pesadelo:['Você venceu o Pesadelo?! Vou exigir revisão do Véu.','Impossível. Inaceitável. Revanche. Agora.'],
  tttAi_pesadelo:['Já vi essa jogada em 9 universos. Perdi em nenhum.','Cada casa que você marca é uma casa que eu previ.','Empate é o melhor que você consegue aqui. E olhe lá.'],
  tttAi_facil:['Hmm, onde eu ponho... aqui?','Eu sou só um gatinho jogando.','Você joga bem, sabia?'],
};
const sayFmt=(a,o={})=>pick12(a).replace(/\{(\w+)\}/g,(_,k)=>o[k]??'');

/* ---------- 🏐 Tulpa Volley (o anfitrião simula) ---------- */
function volley(C){
  const W=800,H=450,GY=404,NX=400,NT=262,R=27,BR=17,G=1600,GB=gdPick(C.gd,[440,520,600,690]),SP=310,JV=-640,HIT=gdPick(C.gd,[440,480,530,590]),VMAX=gdPick(C.gd,[500,540,590,650]);
  const multi=C.net,ps=C.players.map((p,i)=>({...p,team:multi?(i%2):0,ai:false}));
  if(!multi)ps.push({u:'~ai',n:'Perseus',c:-1,team:1,ai:true});
  else{const a=ps.filter(p=>p.team===0).length,b=ps.length-a;if(a!==b)ps.push({u:'~ai',n:'Perseus',c:-1,team:a<b?0:1,ai:true})}
  const place=()=>ps.forEach(p=>{const m=ps.filter(q=>q.team===p.team),k=m.indexOf(p),n=m.length;p.x=p.team?NX+(W-NX)*(k+1)/(n+1):NX*(k+1)/(n+1);p.y=GY-R;p.vx=0;p.vy=0;p.in=p.in||{l:0,r:0,j:0};p.dx=p.x;p.dy=p.y;p.f=p.team?-1:1});
  place();
  const S={b:{x:200,y:120,vx:0,vy:0},sc:[0,0],wait:1.2,acc:0,snapAt:0,hits:0,shown:0,end:false};
  const serve=t=>{S.b={x:t?NX+190:NX-190,y:110,vx:0,vy:0};S.wait=1.1;S.fresh=true};
  serve(Math.random()<.5?0:1);
  const me=ps.find(p=>p.u===C.me),inp={l:0,r:0,j:0};
  const tname=t=>{const h=ps.filter(p=>p.team===t&&!p.ai);return h.length?h.map(p=>p.n).join(' + '):'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n};
  /* ----- IA do Perseus: prevê a trajetória, pula, corta e mira ----- */
  const AIP={
    facil:   {sp:.7, re:.4, err:80,jump:.4, spike:0,  aim:0,  back:250,slip:.16,net:false,naive:true},
    medio:   {sp:.9, re:.16,err:24,jump:.85,spike:.15,aim:.35,back:180,slip:0,  net:false},
    dificil: {sp:1,  re:.07,err:6, jump:1,  spike:.55,aim:.85,back:160,slip:0,  net:true},
    pesadelo:{sp:1.14,re:.015,err:0,jump:1, spike:.92,aim:1,  back:125,slip:0,  net:true},
  }[C.diff]||{};
  const HITY=GY-2*R-BR+6; /* altura em que o Perseus no chão encosta na bola */
  /* simula a bola (gravidade, paredes, teto e, nos níveis altos, a rede) até ela descer na altura y0 do lado 'side' */
  function predict(side,y0,useNet){
    let {x,y,vx,vy}=S.b;const h=1/120;
    if(S.wait>0)return{x,t:S.wait+Math.sqrt(Math.max(0,2*(y0-y)/GB))};
    for(let t=0;t<3;t+=h){
      vy+=GB*h;x+=vx*h;y+=vy*h;
      if(x<BR){x=BR;vx=Math.abs(vx)*.9}if(x>W-BR){x=W-BR;vx=-Math.abs(vx)*.9}
      if(useNet&&y+BR>NT&&x+BR>NX-5&&x-BR<NX+5){if(y<NT+4){y=NT-BR;vy=-Math.abs(vy)*.7;vx+=x<NX?-80:80}else if(x<NX){x=NX-5-BR;vx=-Math.abs(vx)*.8}else{x=NX+5+BR;vx=Math.abs(vx)*.8}}
      if(vy>0&&y>=y0&&(side?x>NX:x<NX))return{x,t};
      if(y+BR>=GY)return{x,t};
    }
    return{x,t:3};
  }
  function aiThink(p){
    const b=S.b,side=p.team,dir=side?1:-1,mine=side?b.x>NX:b.x<NX,coming=side?b.vx>0:b.vx<0;
    let tx=side?NX+AIP.back:NX-AIP.back;p.aiNear=false;
    if(S.wait>0&&mine){
      if(p.aiServe==null)p.aiServe=6+Math.random()*30;           /* saque com ângulo diferente a cada vez */
      tx=b.x+dir*p.aiServe;
    }else if(mine||coming){
      p.aiServe=null;
      const pr=AIP.naive?(()=>{const b=S.b,disc=b.vy*b.vy+2*GB*(HITY-b.y),t=disc>0?(-b.vy+Math.sqrt(disc))/GB:.3;let x=b.x+b.vx*t;if(x<0)x=-x;if(x>W)x=2*W-x;return{x}})():predict(side,HITY,AIP.net); /* Fácil: conta simples, sem simular */
      p.aiNear=Math.abs(pr.x-NX)<160;
      const off=p.aiSpk&&p.aiNear?20:10+Math.random()*16;          /* fica atrás da bola para empurrá-la ao outro lado */
      tx=pr.x+dir*off;
    }else{p.aiServe=null;p.aiSpk=Math.random()<AIP.spike}
    tx+=(Math.random()-.5)*2*AIP.err;
    if(AIP.slip&&Math.random()<AIP.slip)tx=p.x;                        /* Fácil: às vezes hesita */
    p.aiTx=tx;p.aiCanJ=Math.random()<AIP.jump;
  }
  function aiIn(p,h){
    const b=S.b,side=p.team,lo=side?NX+R+6:R,hi=side?W-R:NX-R-6;
    p.aiCd=(p.aiCd||0)-h;if(p.aiCd<=0||p.aiTx==null){p.aiCd=AIP.re*(.7+Math.random()*.6);aiThink(p)}
    const tx=clamp12(p.aiTx,lo,hi),I={l:0,r:0,j:0};
    if(p.x<tx-8)I.r=1;else if(p.x>tx+8)I.l=1;
    const mine=side?b.x>NX:b.x<NX,dx=Math.abs(b.x-p.x);
    if(mine&&S.wait<=0&&p.aiCanJ){
      if(p.aiSpk&&p.aiNear&&dx<62&&b.y>NT-215&&b.y<NT+20&&b.vy>-200)I.j=1;   /* cortada perto da rede */
      else if(dx<(AIP.net?58:70)&&b.y>GY-(AIP.net?230:190)&&b.y<GY-75&&b.vy>-120)I.j=1;
    }
    return I;
  }
  /* depois do toque do Perseus: cortada, bola mirada no buraco do time adversário ou erro (Fácil) */
  function aiHit(p,b){
    const dir=p.team?-1:1,air=p.y<GY-R-40;
    if(air&&p.aiSpk&&Math.abs(b.x-NX)<180&&b.y<NT-BR){
      const vx=dir*(380+Math.random()*(C.diff==='pesadelo'?190:130)),t=(Math.abs(NX-b.x)+BR+6)/Math.abs(vx),vyMax=(NT-BR-10-b.y-.5*GB*t*t)/t;
      if(vyMax>-140){b.vx=clamp12(vx,-560,560);b.vy=clamp12(vyMax-20,-140,320);S.spike=p.team;S.spikes=(S.spikes||0)+1;return true}
    }
    if(AIP.slip&&Math.random()<AIP.slip){b.vx*=.45;return true}         /* Fácil: toque fraco */
    const fresh=S.fresh;S.fresh=false;
    if(Math.random()>=AIP.aim)return false;
    const opp=ps.filter(q=>q.team!==p.team),a=p.team?R+10:NX+40,z=p.team?NX-40:W-R-10;
    let best=null,bs=-1,vys=[-360,-420,-480,-540,-600,-680,-760];if(b.y<NT-90)vys.push(-240,-120,0,150,300); /* bola alta: tiro reto ou para baixo */
    if(fresh){best=a+(z-a)*Math.random();const k=Math.floor(Math.random()*4);vys=vys.slice(k).concat(vys.slice(0,k))} /* saque: alvo e altura sorteados */
    else for(let i=0;i<9;i++){const x=a+(z-a)*i/8,s=Math.min(...opp.map(q=>Math.abs(q.x-x)))+(i===0||i===8?18:0)+Math.random()*20;if(s>bs){bs=s;best=x}}
    const ok=[];
    for(const vy of vys){
      const t=(-vy+Math.sqrt(vy*vy+2*GB*(GY-BR-b.y)))/GB,vx=(best-b.x)/t;if(Math.abs(vx)>560)continue;
      const xe=NX+dir*(6+BR),tn=(xe-b.x)/vx;if(!(tn>0))continue;  /* a bola precisa passar inteira pela rede */
      const yn=b.y+vy*tn+.5*GB*tn*tn;if(yn<NT-BR-8){ok.push([vx,vy]);if(!fresh)break}
    }
    if(!ok.length)return false;
    const [vx,vy]=fresh?pick12(ok):ok[0];b.vx=vx;b.vy=vy;return true;  /* saque: sorteia entre as trajetórias possíveis */
  }
  const say=k=>SAY12[k+'_'+C.diff]||SAY12[k];
  function point(t){
    S.sc[t]++;fx5('mgCoin');const spk=S.spike===t;S.spike=null;
    if(S.sc[t]===6)setTimeout(()=>{C.fx?.float(400,150,'MATCH POINT!',{col:'#ff8fb1',size:36,life:1.4});fx5('activate')},500);
    C.fx?.shake(spk?9:6,.3);C.fx?.burst(S.b.x,GY-6,{n:22,col:[t===0?'#5aa7e8':'#e0233b','#ffd36b','#fff'],sp:240,life:.7,size:3.2,grav:500,ang:-Math.PI/2,spread:2.2});C.fx?.float(S.b.x,GY-70,spk?'CORTADA!':'PONTO!',{col:'#ffd36b',size:spk?34:28,life:1});
    if(S.sc[t]>=7){S.end=true;const rows=ps.map(p=>({u:p.u,n:p.n,c:p.c,s:S.sc[p.team],w:p.team===t}));
      C.finish({title:(multi?'Vitória de '+tname(t):(t===1?'O Perseus venceu':'Você venceu o Perseus!'))+` · ${S.sc[0]} × ${S.sc[1]}`,rows});
      if(!multi)C.say(t===1?sayFmt(say('aiWin')):sayFmt(say('humanWin')));return}
    serve(t);
    const ai=ps.some(p=>p.ai&&p.team===t);
    const txt=spk&&ai?sayFmt(say('spike')):multi?(ai?sayFmt(say('aiPoint')):sayFmt(SAY12.multiPoint,{t:tname(t)})):sayFmt(t===1?say('aiPoint'):say('humanPoint'));
    C.say(txt);
  }
  function phys(h){
    ps.forEach(p=>{const I=p.ai?aiIn(p,h):p.in,sp=p.ai?SP*AIP.sp:SP;p.vx=(I.r-I.l)*sp;if(p.vx)p.f=p.vx>0?1:-1;if(p.cd>0)p.cd-=h;
      if(I.j&&p.y>=GY-R-.5){p.vy=JV;if(p.u===C.me)fx5('mgJump')}
      p.vy+=G*h;p.x+=p.vx*h;p.y+=p.vy*h;if(p.y>GY-R){p.y=GY-R;p.vy=0}
      p.x=clamp12(p.x,p.team?NX+6+R:R,p.team?W-R:NX-6-R)});
    if(S.wait>0){S.wait-=h;return}
    const b=S.b;b.vy+=GB*h;b.x+=b.vx*h;b.y+=b.vy*h;
    if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.9}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.9}  /* sem teto: a bola sobe além da tela e volta pela gravidade */
    if(b.y+BR>NT&&b.x+BR>NX-5&&b.x-BR<NX+5){
      if(b.y<NT+4){b.y=NT-BR;b.vy=-Math.abs(b.vy)*.7;b.vx+=b.x<NX?-80:80}
      else if(b.x<NX){b.x=NX-5-BR;b.vx=-Math.abs(b.vx)*.8}else{b.x=NX+5+BR;b.vx=Math.abs(b.vx)*.8}
    }
    ps.forEach(p=>{if(p.cd>0)return;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d>=R+BR||d<1e-6)return;
      const nx=dx/d,ny=dy/d;b.x=p.x+nx*(R+BR);b.y=p.y+ny*(R+BR);
      const sp=Math.max(HIT,Math.hypot(b.vx,b.vy)*.92);let vx=nx*sp+p.vx*.4,vy=ny*sp+Math.min(0,p.vy)*.25;
      if(vy>-320)vy=-320-Math.random()*80;
      /* empurra a bola para o lado do adversário */
      if(p.team===0&&vx<60)vx=Math.max(vx,60+Math.random()*120);if(p.team===1&&vx>-60)vx=Math.min(vx,-60-Math.random()*120);
      b.vx=clamp12(vx,-VMAX,VMAX);b.vy=Math.max(-780,vy);S.hits++;S.spike=null;
      if(p.ai&&aiHit(p,b))p.cd=.18;S.fresh=false;p.aiTx=null});
    if(b.y+BR>=GY){b.y=GY-BR;point(b.x<NX?1:0)}
  }
  function snap(){C.send('snap',{b:[S.b.x,S.b.y,S.b.vx,S.b.vy].map(v=>Math.round(v)),p:ps.map(p=>[p.u,Math.round(p.x),Math.round(p.y),p.f]),sc:S.sc,w:S.wait>0?1:0,h:S.hits})}
  function sendIn(){if(!me)return;if(C.host)me.in={...inp};else C.send('in',{l:inp.l,r:inp.r,j:inp.j})}
  let keepAt=0;
  return{
    st:()=>S,ps:()=>typeof ps!=="undefined"?ps:null,
    /* para os testes: roda a física sem desenhar */
    sim(sec){for(let t=0;t<sec&&!S.end;t+=1/120)phys(1/120)},aip:()=>AIP,
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')inp.l=v;else if(code==='KeyD'||code==='ArrowRight')inp.r=v;else if(code==='KeyW'||code==='ArrowUp'||code==='Space')inp.j=v;else return;sendIn()},
    ptr(){},
    step(dt){
      const now=Date.now();
      if(!C.host&&now-keepAt>400){keepAt=now;sendIn()}
      if(S.hits>S.shown){S.shown=S.hits;fx5('mgBall');C.fx?.burst(S.b.x,S.b.y,{n:7,col:['#ffe07a','#fff'],sp:150,life:.35,size:2.4,grav:0})}
      if(C.host){if(now<C.t0||S.end)return;S.acc+=dt;while(S.acc>=1/120){phys(1/120);S.acc-=1/120;if(S.end)break}
        ps.forEach(p=>{p.dx=p.x;p.dy=p.y});if(C.net&&now-S.snapAt>=50){S.snapAt=now;snap()}}
      else{const k=Math.min(1,dt*14);ps.forEach(p=>{if(p.tx==null)return;p.dx+=(p.tx-p.dx)*k;p.dy+=(p.ty-p.dy)*k});
        const b=S.b;if(!S.w){b.vy+=GB*dt;b.x+=b.vx*dt;b.y+=b.vy*dt}if(S.tb){b.x+=(S.tb[0]-b.x)*k;b.y+=(S.tb[1]-b.y)*k}}
    },
    msg(p){
      if(C.host&&p.t==='in'){const q=ps.find(x=>x.u===p.from);if(q)q.in={l:p.l?1:0,r:p.r?1:0,j:p.j?1:0}}
      if(!C.host&&p.t==='snap'){const [x,y,vx,vy]=p.b;S.tb=[x,y];S.b.vx=vx;S.b.vy=vy;if(Math.hypot(S.b.x-x,S.b.y-y)>90){S.b.x=x;S.b.y=y}if(p.sc&&(p.sc[0]!==S.sc[0]||p.sc[1]!==S.sc[1])){C.fx?.shake(6,.3);C.fx?.burst(S.b.x,GY-6,{n:20,col:['#ffd36b','#fff'],sp:220,life:.7,size:3,grav:500,ang:-Math.PI/2,spread:2.2});C.fx?.float(S.b.x,GY-70,'PONTO!',{col:'#ffd36b',size:28})}S.sc=p.sc;S.w=p.w;S.hits=Math.max(S.hits,p.h|0);
        (p.p||[]).forEach(([u,x2,y2,f])=>{const q=ps.find(z=>z.u===u);if(q){q.tx=x2;q.ty=y2;q.f=f}})}
    },
    left(u){const q=ps.find(p=>p.u===u);if(q){q.ai=true;q.n='Perseus';q.c=-1;q.u='~ai'+u}},
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1b1238');gr.addColorStop(1,'#3d2a5e');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<40;i++){x.fillRect((i*137)%W,(i*71)%220,2,2)}
      x.fillStyle='#2a1b17';x.fillRect(0,GY,W,H-GY);x.fillStyle='#4a3326';x.fillRect(0,GY,W,4);
      x.fillStyle='#d9cbb0';x.fillRect(NX-4,NT,8,GY-NT);x.fillStyle='rgba(217,203,176,.35)';for(let y=NT+8;y<GY;y+=14)x.fillRect(NX-30,y,60,2);
      x.font='800 34px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle='#fff';x.fillText(`${S.sc[0]} × ${S.sc[1]}`,W/2,12);
      x.font='600 13px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#d9cbb0';x.textAlign='left';x.fillText(tname(0),14,56);x.textAlign='right';x.fillText(tname(1),W-14,56);
      ps.forEach(p=>{const px=C.host?p.x:p.dx,py=C.host?p.y:p.dy;mgCat(x,p.c,px,py-4,R*2.5,p.n,{flip:p.f<0,ring:p.u===C.me})});
      const b=S.b,g2=x.createRadialGradient(b.x-5,b.y-5,2,b.x,b.y,BR);g2.addColorStop(0,'#e9fbff');g2.addColorStop(.5,'#5fd6ff');g2.addColorStop(1,'#1f6fb8');
      x.save();x.shadowColor='#7fe3ff';x.shadowBlur=18;x.beginPath();x.arc(b.x,b.y,BR,0,Math.PI*2);x.fillStyle=g2;x.fill();x.restore();
      if(b.y+BR<0){const hgt=-b.y,sz=clamp12(22-hgt/40,9,22),ax=clamp12(b.x,14,W-14);x.save();x.fillStyle='#7fe3ff';x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=2;x.shadowColor='#7fe3ff';x.shadowBlur=10;
        x.beginPath();x.moveTo(ax,4);x.lineTo(ax-sz*.75,4+sz);x.lineTo(ax+sz*.75,4+sz);x.closePath();x.fill();x.stroke();x.shadowBlur=0;
        x.restore()}
      if((C.host?S.wait:S.w)>0){x.font='600 15px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.fillStyle='#fff';x.fillText('Saque!',b.x,b.y-40)}
    }
  };
}

/* ---------- corrida de fantasmas (Voo e Salto): cada um no seu aparelho ---------- */
function ghostRace(C,S){
  S.gh={};S.fin={};S.sentAt=0;S.dead=false;
  const expected=()=>C.players.map(p=>p.u);
  function check(){
    if(!C.host||!C.net)return;const exp=expected();if(!exp.every(u=>u in S.fin))return;if(S.closed)return;S.closed=true;
    const best=Math.max(...exp.map(u=>S.fin[u]));
    const rows=C.players.map(p=>({u:p.u,n:p.n,c:p.c,s:S.fin[p.u]||0,w:S.fin[p.u]===best&&best>0})).sort((a,b)=>b.s-a.s);
    const ws=rows.filter(r=>r.w).map(r=>r.n);C.finish({title:ws.length?'Fim da corrida · vitória de '+ws.join(' e '):'Fim da corrida · ninguém pontuou. Tentem de novo!',rows});
  }
  return{
    die(score){if(S.dead)return;S.dead=true;fx5('fumble');
      if(!C.net){C.finish({title:'Fim · '+score+' pontos',rows:[{u:C.me,n:C.players[0].n,c:C.players[0].c,s:score,w:false}]});return}
      C.send('dead',{s:score});S.fin[C.me]=score;check()},
    send(o){const now=Date.now();if(!C.net||now-S.sentAt<100)return;S.sentAt=now;C.send('pos',o)},
    msg(p){
      if(p.t==='pos'&&p.from!==C.me){S.gh[p.from]={...p,at:Date.now()}}
      if(p.t==='dead'){S.gh[p.from]={...(S.gh[p.from]||{}),dead:true};if(C.host){S.fin[p.from]=Number(p.s)||0;check()}}
    },
    left(u){if(C.host){S.fin[u]=S.fin[u]??0;C.players=C.players.filter(p=>p.u!==u);check()}},
    col:u=>{const p=C.players.find(q=>q.u===u);return p?p.c:0},nm:u=>{const p=C.players.find(q=>q.u===u);return p?p.n:'?'},
  };
}

/* ---------- 🦇 Voo Além do Véu ---------- */
function voo(C){
  const W=480,H=640,BX=130,GAP=gdPick(C.gd,[205,176,160,146]),DX=gdPick(C.gd,[252,232,222,210]),PW=66,G=1450,FL=-470,BR=16,FLOOR=H-40;
  const AMP=gdPick(C.gd,[0,0,46,74]),SP0=gdPick(C.gd,[140,165,188,212]),SPMAX=gdPick(C.gd,[70,95,110,125]);
  const S={y:H*.42,vy:0,d:0,t:0,score:0,sh:0,inv:0,slow:0,pw:new Set(),phase:0},R=ghostRace(C,S);
  /* fases: a cada 10 colunas o vão aperta um pouco (igual para todos os fantasmas) */
  const gapOf=i=>Math.max(GAP-48,GAP-Math.floor(i/10)*8);
  const pwOf=i=>i>3&&hrand(C.seed,i,5)<.13?(hrand(C.seed,i,6)<.5?'sh':'sl'):null;
  /* colunas móveis (Difícil/Pesadelo): o vão sobe e desce no mesmo ritmo em todos os aparelhos */
  const pipe=i=>{const base=130+hrand(C.seed,i,1)*(FLOOR-260),mv=AMP&&hrand(C.seed,i,2)<(C.gd==='pesadelo'?.7:.45);
    const g=gapOf(i),ts=Math.max(0,(Date.now()-C.t0)/1000),gy=mv?clamp12(base+Math.sin(ts*(1.3+hrand(C.seed,i,3))+i)*AMP,g/2+24,FLOOR-g/2-24):clamp12(base,g/2+24,FLOOR-g/2-24);return{x:380+i*DX,gy,mv,g,pw:pwOf(i),i}};
  const speed=()=>SP0+Math.min(SPMAX,S.t*2.4);
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
  const flap=()=>{if(S.dead||Date.now()<C.t0)return;S.vy=FL;fx5('mgJump')};
  return{
    st:()=>S,ps:()=>typeof ps!=="undefined"?ps:null,
    key(code,down){if(down&&(code==='Space'||code==='ArrowUp'||code==='KeyW'))flap()},
    ptr(t){if(t==='down')flap()},
    step(dt){
      const now=Date.now();if(now<C.t0){S.y=H*.42+Math.sin(now/220)*8;return}
      S.t+=dt;const sp=speed();S.slow=Math.max(0,S.slow-dt);S.inv=Math.max(0,S.inv-dt);
      for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=sp*dt}
      if(S.dead){const lead=Object.values(S.gh).filter(g=>!g.dead&&g.d!=null).sort((a,b)=>b.d-a.d)[0];S.cam=lead?lead.d:S.cam;return}
      const k=S.slow>0?.6:1;S.vy+=G*k*dt;S.y+=S.vy*k*dt;S.d+=sp*k*dt;S.cam=S.d;
      let hit=S.y>FLOOR-BR||S.y<BR;
      const i0=Math.max(0,Math.floor((S.d+BX-380-PW)/DX));
      for(let i=i0;i<i0+3;i++){const p=pipe(i),px=p.x-S.d;if(BX+BR>px&&BX-BR<px+PW&&(S.y-BR<p.gy-p.g/2||S.y+BR>p.gy+p.g/2))hit=true;
        if(p.pw&&!S.pw.has(i)&&Math.hypot(BX-(px+PW/2),S.y-p.gy)<BR+16){S.pw.add(i);fx5('activate');C.fx?.burst(BX,S.y,{n:16,kind:'star',col:['#8fe8ff','#fff'],sp:170,life:.6,size:3});
          if(p.pw==='sh'){S.sh=1;C.fx?.float(BX+40,S.y-30,'🛡 Escudo',{col:'#8fe8ff',size:20})}else{S.slow=4;C.fx?.float(BX+40,S.y-30,'⏳ Câmera lenta',{col:'#c9b0ff',size:20})}}}
      if(hit&&(S.inv>0||S.sh>0)){if(S.inv<=0){S.sh=0;S.inv=1.2;fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(BX,S.y-40,'🛡 Salvo!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.2)}S.y=clamp12(S.y,BR+2,FLOOR-BR-2);if(S.vy>0)S.vy=-260;hit=false}
      const sc=Math.max(0,Math.floor((S.d+BX-380-PW)/DX)+1);if(sc>S.score){S.score=sc;fx5('mgCoin');C.fx?.burst(BX-10,S.y,{n:6,col:['#ffd36b','#b48cff'],sp:110,life:.45,size:2.4,grav:0});C.fx?.float(BX+30,S.y-28,'+1',{col:'#ffd36b',size:16,life:.6});
        const ph=Math.floor(sc/10);if(ph>S.phase){S.phase=ph;fx5('mgWin');C.fx?.flash('#b48cff',.25);C.fx?.float(W/2,H*.3,`FASE ${ph+1}`,{col:'#ffd36b',size:42,life:1.4});C.fx?.shake(3,.2)}}
      R.send({d:Math.round(S.d),y:Math.round(S.y),s:S.score});
      if(hit){C.fx?.shake(10,.4);C.fx?.burst(BX,S.y,{n:22,col:['#b48cff','#fff','#6b4f9e'],sp:240,life:.8,size:3,grav:600});if(Math.random()<.5)C.say(sayFmt(SAY12.fall),false);R.die(S.score)}
      C.hud(`<b>${S.score}</b> colunas · fase ${S.phase+1}${S.sh?' · 🛡':''}${S.slow>0?' · ⏳':''}${C.net?` · ${Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)} voando`:''}`);
    },
    msg:R.msg,left:R.left,
    draw(x){
      const cam=S.cam??S.d,gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0e0b1f');gr.addColorStop(1,'#2b1c3f');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<50;i++){const sx=((i*97-cam*.15)%W+W)%W;x.fillRect(sx,(i*53)%(FLOOR-20),1.5,1.5)}
      const i0=Math.max(0,Math.floor((cam-380-PW)/DX));
      for(let i=i0;i<i0+4;i++){const p=pipe(i),px=p.x-cam;if(px>W)break;
        const col=x.createLinearGradient(px,0,px+PW,0);col.addColorStop(0,'#1a1030');col.addColorStop(.5,'#4b2f7a');col.addColorStop(1,'#1a1030');x.fillStyle=col;
        x.fillRect(px,0,PW,p.gy-p.g/2);x.fillRect(px,p.gy+p.g/2,PW,FLOOR-(p.gy+p.g/2));
        x.fillStyle=p.mv?'#ff9ad5':'#b48cff';x.fillRect(px-4,p.gy-p.g/2-10,PW+8,10);x.fillRect(px-4,p.gy+p.g/2,PW+8,10);
        if(p.pw&&!S.pw.has(i)){const by=p.gy+Math.sin(S.t*4+i)*6;x.fillStyle=p.pw==='sh'?'#8fe8ff':'#c9b0ff';x.beginPath();x.arc(px+PW/2,by,15,0,7);x.fill();x.font='16px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillText(p.pw==='sh'?'🛡':'⏳',px+PW/2,by+1)}}
      x.fillStyle='#1c1426';x.fillRect(0,FLOOR,W,H-FLOOR);x.fillStyle='#6b4f9e';x.fillRect(0,FLOOR,W,3);
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=BX+(g.d-cam);if(gx<-40||gx>W+40)continue;mgCat(x,R.col(u),gx,g.y,46,R.nm(u),{alpha:g.dead?.18:.42})}
      if(!S.dead){x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;mgCat(x,me.c,BX,S.y,48,me.n,{flip:false});x.restore();if(S.sh){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(BX,S.y,30,0,7);x.stroke()}if(S.slow>0){x.fillStyle='rgba(180,140,255,.1)';x.fillRect(0,0,W,H)}}
      x.font='800 44px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.lineWidth=5;x.strokeStyle='rgba(0,0,0,.5)';x.strokeText(S.score,W/2,70);x.fillStyle='#fff';x.fillText(S.score,W/2,70);
      if(S.dead&&!MG.over){x.font='700 18px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#ffd1d1';x.fillText(`Você caiu com ${S.score} colunas. Assistindo os outros…`,W/2,H/2)}
    }
  };
}

/* ---------- ⬆️ Salto Astral ---------- */
function salto(C){
  const W=480,H=640,PH=70,PWD=74,G=1450,JV=760,SPRING=1180,HS=330,R=22;
  const S={x:W/2,y:60,vy:JV,maxY:0,cam:0,orbs:0,taken:new Set(),broken:new Set(),inl:0,inr:0,tx:null,score:0,sh:0,mg:0,jt:0,pw:new Set(),alt:0},RC=ghostRace(C,S);
  const PWI={sh:['🛡','#8fe8ff','Escudo'],mg:['🧲','#ff8fb1','Ímã de orbes'],jt:['🚀','#ffd36b','Foguete']};
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
  const tsec=()=>Math.max(0,(Date.now()-C.t0)/1000);
  /* Gerador vencível: usa a física do pulo. Altura máxima = JV²/(2G); a distância vertical entre
     plataformas firmes nunca passa de 75% disso, e a próxima firme fica dentro do alcance horizontal
     do pulo (com a volta pela borda da tela). Linha com plataforma quebradiça ganha uma firme ao lado. */
  const MAXH=JV*JV/(2*G),SAFE=MAXH*.75;
  const GP=gdPick(C.gd,[{sp:[58,12],b:.04,m:.08,s:.08,trap:.03,tk:14,mv:50,ms:1.2},{sp:[66,18],b:.1,m:.15,s:.06,trap:.08,tk:10,mv:70,ms:1.6},{sp:[74,26],b:.16,m:.25,s:.05,trap:.13,tk:8,mv:85,ms:1.9},{sp:[82,34],b:.22,m:.34,s:.04,trap:.19,tk:6,mv:100,ms:2.3}]);
  const reachX=dy=>{const disc=JV*JV-2*G*dy;if(disc<0)return 0;return HS*((JV+Math.sqrt(disc))/G)*.8};
  const cdist=(a,b)=>{const d=Math.abs(a-b)%W;return Math.min(d,W-d)};
  const rows=[];
  function row(k){
    while(rows.length<=k){
      const j=rows.length,r=i=>hrand(C.seed,j,i);
      if(j===0){rows.push({k:0,y:20,x:W/2,type:'n',orb:false,trap:false,tx:0,alt:null});continue}
      const prev=rows[j-1],ps=prev.alt||prev,dy=Math.min(SAFE,GP.sp[0]+r(1)*GP.sp[1]),y=prev.y+dy;
      const t=r(2);let type='n';if(j>5){if(t<GP.b)type='b';else if(t<GP.b+GP.m)type='m';else if(t<GP.b+GP.m+GP.s)type='s'}
      if(type==='b'&&prev.type==='b')type='n';
      const lim=Math.min(W/2,reachX(y+(type==='b'?8:0)-ps.y));
      /* posição dentro do alcance; se o sorteio cair longe, fica perto da anterior (no máximo 60 px de lado) */
      const fit=(px,sd)=>cdist(px,ps.x)<=lim-2?px:clamp12(ps.x+(sd<.5?-1:1)*Math.min(60,lim*.5),40,W-40);
      let x,alt=null;
      if(type==='b'){const ax=fit(40+r(8)*(W-80),r(7));alt={x:ax,y:y+8,type:'n'};x=40+r(3)*(W-80);if(Math.abs(x-ax)<PWD+14)x=clamp12(ax+(ax<W/2?1:-1)*(PWD+36),40,W-40)}
      else x=fit(40+r(3)*(W-80),r(7));
      let tx=30+r(6)*(W-60);const trap=j>GP.tk&&r(5)<GP.trap;
      if(trap)[x,alt&&alt.x].forEach(px=>{if(px!=null&&cdist(tx,px)<80)tx=((tx+150)%(W-60))+30});
      const orb=j>2&&r(4)<.2;rows.push({k:j,y,x,type,orb,trap,tx,alt,pw:!orb&&j>8&&type!=='b'&&r(11)<.07?['sh','mg','jt'][Math.floor(r(12)*3)]:null});
    }
    return rows[k];
  }
  function plat(k){const rw=row(k);return rw.type==='m'?{...rw,x:clamp12(rw.x+Math.sin(tsec()*GP.ms+k)*GP.mv,PWD/2,W-PWD/2)}:rw}
  function kFrom(y){let k=0;while(row(k+8).y<y)k+=8;while(k>0&&row(k).y>y)k--;while(row(k+1).y<y)k++;return k}
  T3.mgSaltoRows=n=>{for(let k=0;k<n;k++)row(k);return{rows:rows.slice(0,n),MAXH,SAFE,reach:reachX,W,PWD,HS,JV,G}};
  const score=()=>Math.floor(S.maxY/10)+S.orbs*50;
  const sy0=y=>H-(y-S.cam)-30;
  return{
    st:()=>S,ps:()=>typeof ps!=="undefined"?ps:null,
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')S.inl=v;else if(code==='KeyD'||code==='ArrowRight')S.inr=v},
    ptr(t,px){if(t==='up'){S.tx=null;return}if(t==='down'||t==='move'&&S.tx!=null)S.tx=px},
    step(dt){
      const now=Date.now();if(now<C.t0)return;
      if(S.dead)return;
      S.mg=Math.max(0,S.mg-dt);if(S.jt>0){S.jt=Math.max(0,S.jt-dt);S.vy=Math.max(S.vy,1100);if(Math.random()<.6)C.fx?.burst(S.x,sy0(S.y)+20,{n:2,col:['#ffd36b','#ff7a3a'],sp:120,life:.4,size:3,grav:300,ang:Math.PI/2,spread:.7})}
      let vx=(S.inr-S.inl)*HS;if(S.tx!=null){const d=S.tx-S.x;vx=Math.abs(d)<8?0:Math.sign(d)*HS}
      S.x+=vx*dt;if(S.x<-R)S.x=W+R;if(S.x>W+R)S.x=-R;S.f=vx?Math.sign(vx):S.f||1;
      const prevY=S.y;S.vy-=G*dt;S.y+=S.vy*dt;
      const k0=Math.max(0,kFrom(S.y-160));
      for(let k=k0;k<k0+6;k++){const p=plat(k);
        for(const q of [p,p.alt]){if(!q)continue;const brk=q===p&&p.type==='b';
          if(S.vy<0&&!(brk&&S.broken.has(k))&&prevY>=q.y&&S.y<=q.y&&Math.abs(S.x-q.x)<PWD/2+R*.6){
            if(brk){S.broken.add(k);fx5('error');C.fx?.burst(q.x,sy0(q.y),{n:10,col:['#8a6d55','#3a2a1e'],sp:120,life:.5,size:3,grav:700})}else{S.y=q.y;S.vy=q===p&&p.type==='s'?SPRING:JV;fx5(q===p&&p.type==='s'?'activate':'mgJump');if(q===p&&p.type==='s'){C.fx?.float(S.x,sy0(S.y)-50,'BOING!',{col:'#ffd36b',size:22,life:.7});C.fx?.burst(S.x,sy0(S.y),{n:10,kind:'star',col:'#fff3c0',sp:140,life:.5,size:3,grav:200})}}}}
        if(p.orb&&!S.taken.has(k)&&(Math.hypot(S.x-p.x,S.y-(p.y+44))<R+12||S.mg>0&&Math.hypot(S.x-p.x,S.y-(p.y+44))<170)){S.taken.add(k);S.orbs++;fx5('mgCoin');C.fx?.burst(p.x,sy0(p.y+44),{n:10,kind:'star',col:['#fff','#ffe07a'],sp:150,life:.55,size:3,grav:0});C.fx?.float(p.x,sy0(p.y+44)-20,'+50',{col:'#ffd36b',size:20,life:.7})}
        if(p.pw&&!S.pw.has(k)&&Math.hypot(S.x-p.x,S.y-(p.y+44))<R+16){S.pw.add(k);const P=PWI[p.pw];fx5('activate');C.fx?.burst(p.x,sy0(p.y+44),{n:16,kind:'star',col:[P[1],'#fff'],sp:170,life:.6,size:3});C.fx?.float(p.x,sy0(p.y+44)-30,P[0]+' '+P[2],{col:P[1],size:20});
          if(p.pw==='sh')S.sh=1;else if(p.pw==='mg')S.mg=8;else S.jt=1.3}
        if(p.trap&&Math.hypot(S.x-p.tx,S.y-(p.y+36))<R+10){if(S.sh){S.sh=0;row(k).trap=false;fx5('activate');C.fx?.flash('#8fe8ff',.3);C.fx?.float(S.x,sy0(S.y)-50,'🛡 Salvo!',{col:'#8fe8ff',size:22})}else{C.fx?.shake(10,.4);RC.die(score());C.say('A Inexistência te pegou. Ela sempre pega.',false);return}}
      }
      S.maxY=Math.max(S.maxY,S.y);S.cam=Math.max(S.cam,S.y-H*.42);
      {const a=Math.floor(S.maxY/10/1000);if(a>S.alt){S.alt=a;fx5('bb'+Math.min(7,a+1));C.fx?.float(W/2,H*.32,`ALTITUDE ${a*1000}!`,{col:'#ffd36b',size:34,life:1.3});C.fx?.flash('#fff3c0',.2)}}
      if(S.y<S.cam-60){if(S.sh){S.sh=0;S.y=S.cam+40;S.vy=SPRING*1.25;fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(S.x,H*.7,'🛡 Salvo!',{col:'#8fe8ff',size:26});return}C.fx?.shake(10,.4);C.say(sayFmt(SAY12.fall),false);RC.die(score());return}
      S.score=score();RC.send({x:Math.round(S.x),y:Math.round(S.y),s:S.score});
      C.hud(`<b>${S.score}</b> pontos · ✨ ${S.orbs} orbes${S.sh?' · 🛡':''}${S.mg>0?' · 🧲':''}${S.jt>0?' · 🚀':''}`);
    },
    msg:RC.msg,left:RC.left,
    draw(x){
      const cam=S.cam,sy=y=>H-(y-cam)-30,gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0b1430');gr.addColorStop(1,'#26365e');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<40;i++){x.fillRect((i*89)%W,((i*61+cam*.3)%H),1.6,1.6)}
      const k0=Math.max(0,kFrom(cam-80));
      for(let k=k0;k<k0+16;k++){const p=plat(k),y=sy(p.y);if(y<-30)break;if(y>H+30)continue;
        if(p.alt){const ay=sy(p.alt.y);x.fillStyle='#7fe0a8';x.beginPath();x.roundRect?x.roundRect(p.alt.x-PWD/2,ay,PWD,12,6):x.rect(p.alt.x-PWD/2,ay,PWD,12);x.fill()}
        if(!S.broken.has(k)){x.fillStyle=p.type==='b'?'#8a6d55':p.type==='m'?'#5fb0ff':p.type==='s'?'#ffd36b':'#7fe0a8';x.beginPath();x.roundRect?x.roundRect(p.x-PWD/2,y,PWD,12,6):x.rect(p.x-PWD/2,y,PWD,12);x.fill();
          if(p.type==='b'){x.strokeStyle='#3a2a1e';x.beginPath();x.moveTo(p.x-8,y);x.lineTo(p.x+2,y+12);x.stroke()}
          if(p.type==='s'){x.fillStyle='#fff3c0';x.fillRect(p.x-8,y-10,16,10)}}
        if(p.orb&&!S.taken.has(k)){const oy=sy(p.y+44),g2=x.createRadialGradient(p.x,oy,1,p.x,oy,12);g2.addColorStop(0,'#fff');g2.addColorStop(1,'rgba(255,230,120,0)');x.fillStyle=g2;x.beginPath();x.arc(p.x,oy,12,0,7);x.fill()}
        if(p.pw&&!S.pw.has(k)){const oy=sy(p.y+44)+Math.sin(Date.now()/250+k)*4,P=PWI[p.pw];x.fillStyle=P[1];x.beginPath();x.arc(p.x,oy,14,0,7);x.fill();x.font='15px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillText(P[0],p.x,oy+1)}
        if(p.trap){const ty=sy(p.y+36);x.fillStyle='#0a0010';x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?8:15;x.lineTo(p.tx+Math.cos(a)*rr,ty+Math.sin(a)*rr)}x.closePath();x.fill();x.strokeStyle='#b14bff';x.lineWidth=1.5;x.stroke()}
      }
      for(const u in S.gh){const g=S.gh[u];if(g.y==null)continue;const y=sy(g.y);if(y<-60||y>H+60)continue;mgCat(x,RC.col(u),g.x,y-R,48,RC.nm(u),{alpha:g.dead?.18:.42})}
      if(!S.dead){mgCat(x,me.c,S.x,sy(S.y)-R,52,me.n,{flip:S.f<0});if(S.sh){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(S.x,sy(S.y)-R,32,0,7);x.stroke()}if(S.mg>0){x.strokeStyle='rgba(255,143,177,.35)';x.setLineDash([6,6]);x.beginPath();x.arc(S.x,sy(S.y)-R,170,0,7);x.stroke();x.setLineDash([])}}
      x.font='800 30px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle='#fff';x.fillText(S.score,W/2,64);
      if(S.dead&&!MG.over){x.font='700 18px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#ffd1d1';x.fillText(`Você caiu com ${S.score} pontos. Assistindo os outros…`,W/2,H/2)}
    }
  };
}

/* ---------- 🧪 Coleta de Essência (o anfitrião simula) ---------- */
function coleta(C){
  const W=480,H=640,BY=588,REACH=38,VM=gdPick(C.gd,[.8,1,1.22,1.45]),SKULL=gdPick(C.gd,[.18,.3,.38,.46]),SPN=gdPick(C.gd,[.78,.66,.56,.46]),SPMIN=gdPick(C.gd,[.34,.26,.22,.18]);
  const ps=C.players.map((p,i,a)=>({...p,x:W*(i+1)/(a.length+1),tx:W*(i+1)/(a.length+1),s:0,l:3,out:false,dx:W*(i+1)/(a.length+1)}));
  const S={items:[],t:0,spawn:.6,snapAt:0,inAt:0,lastX:-1,ev:[],end:false,nid:1,kl:0,kr:0};
  const me=ps.find(p=>p.u===C.me);
  const KIND={e:{pts:10,col:'#5fd6ff',ico:'⚗'},v:{pts:25,col:'#ff5a6e',ico:'❤'},x:{pts:0,col:'#2a0a2e',ico:'☠'},
    sh:{pts:0,col:'#8fe8ff',ico:'🛡',n:'Escudo'},mg:{pts:0,col:'#ff8fb1',ico:'🧲',n:'Ímã'},sl:{pts:0,col:'#c9b0ff',ico:'⏳',n:'Câmera lenta'},l:{pts:0,col:'#7dffa8',ico:'➕',n:'+1 vida'}};
  ps.forEach(p=>{p.sh=0;p.mg=0;p.cb=0});S.slow=0;S.wave=1;
  function hostStep(dt){
    S.t+=dt;S.spawn-=dt;
    if(S.spawn<=0){S.spawn=Math.max(SPMIN,SPN-S.t*.006);const r=Math.random();const pw=['sh','mg','sl','l'];S.items.push({id:S.nid++,x:24+Math.random()*(W-48),y:-20,k:r<SKULL?'x':r<SKULL+.15?'v':r<SKULL+.185&&S.t>8?pw[Math.floor(Math.random()*(S.t>40?4:3))]:'e',v:(150+Math.min(230,S.t*3.2)+Math.random()*60)*VM})}
    /* ondas: a cada 30 s a chuva aperta e todos veem o aviso */
    if(S.t>S.wave*30){S.wave++;S.ev.push(['*','w',S.wave])}
    ps.forEach(p=>{if(p.u!==C.me){const d=p.tx-p.x;p.x+=Math.sign(d)*Math.min(Math.abs(d),640*dt)}});
    const slow=S.t<S.slow?.5:1;
    S.items.forEach(it=>{it.y+=it.v*slow*dt;if(it.got)return;
      if(it.k!=='x'){const mp=ps.find(q=>!q.out&&q.mg>S.t&&Math.abs(q.x-it.x)<170&&it.y>BY-300);if(mp)it.x+=Math.sign(mp.x-it.x)*Math.min(Math.abs(mp.x-it.x),300*dt)}
      if(it.y>BY-34&&it.y<BY+18){const p=ps.filter(q=>!q.out&&Math.abs(q.x-it.x)<REACH).sort((a,b)=>Math.abs(a.x-it.x)-Math.abs(b.x-it.x))[0];
        if(p){it.got=true;
          if(it.k==='x'){if(p.sh){p.sh=0;S.ev.push([p.u,'xs'])}else{p.l--;p.cb=0;if(p.l<=0)p.out=true;S.ev.push([p.u,'x'])}}
          else if(it.k==='sh'){p.sh=1;S.ev.push([p.u,'sh'])}else if(it.k==='mg'){p.mg=S.t+7;S.ev.push([p.u,'mg'])}else if(it.k==='sl'){S.slow=S.t+5;S.ev.push([p.u,'sl'])}else if(it.k==='l'){p.l=Math.min(5,p.l+1);S.ev.push([p.u,'l'])}
          else{p.s+=KIND[it.k].pts;p.cb++;S.ev.push([p.u,it.k]);if(p.cb%5===0){const bonus=p.cb*2;p.s+=bonus;S.ev.push([p.u,'cb',p.cb,bonus])}}}}});
    S.items=S.items.filter(it=>!it.got&&it.y<H+30);
    const alive=ps.filter(p=>!p.out);
    if(!alive.length&&!S.end){S.end=true;const best=Math.max(...ps.map(p=>p.s));
      C.finish({title:C.net?'Fim da coleta · vitória de '+ps.filter(p=>p.s===best).map(p=>p.n).join(' e '):`Fim · ${ps[0].s} pontos`,rows:ps.map(p=>({u:p.u,n:p.n,c:p.c,s:p.s,w:C.net&&p.s===best&&best>0})).sort((a,b)=>b.s-a.s)})}
  }
  function feel(list){(list||[]).forEach(([u,k,a,b])=>{
    if(u==='*'&&k==='w'){S.wave=a;fx5('mgWin');C.fx?.float(W/2,H*.32,`ONDA ${a}`,{col:'#ffd36b',size:40,life:1.4});C.fx?.flash('#ffd36b',.18);return}
    if(u!==C.me||!me)return;const px=me.x,py=BY-24;
    if(k==='x'){fx5('fumble');C.fx?.shake(9,.35);C.fx?.flash('#e0233b',.25);C.fx?.burst(px,py,{n:16,col:['#c33cff','#2a0a2e'],sp:200,life:.6,size:3.4});if(me.l>0)C.say(me.l===1?'Última vida. Sem pressão.':'Isso era um crânio. Dica: crânios são ruins.',false);return}
    if(k==='xs'){fx5('activate');C.fx?.float(px,py-30,'🛡 bloqueou!',{col:'#8fe8ff',size:20});C.fx?.burst(px,py,{n:14,kind:'ring',col:'#8fe8ff',sp:60,life:.5,size:6,grav:0});return}
    if(KIND[k]&&KIND[k].n){fx5('activate');C.fx?.float(px,py-34,KIND[k].ico+' '+KIND[k].n,{col:KIND[k].col,size:20});C.fx?.burst(px,py,{n:14,kind:'star',col:[KIND[k].col,'#fff'],sp:160,life:.6,size:3});return}
    if(k==='cb'){fx5('bb'+Math.min(7,Math.floor(a/5)+1));C.fx?.float(px,py-60,`COMBO ${a}! +${b}`,{col:'#ffd36b',size:24});C.fx?.shake(2,.15);return}
    fx5('mgCoin');C.fx?.burst(px,py,{n:8,col:[KIND[k]?.col||'#fff','#fff'],sp:130,life:.45,size:2.6,grav:200});C.fx?.float(px,py-26,'+'+(KIND[k]?.pts||0),{col:KIND[k]?.col||'#fff',size:17,life:.6})})}
  return{
    st:()=>S,ps:()=>typeof ps!=="undefined"?ps:null,
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')S.kl=v;else if(code==='KeyD'||code==='ArrowRight')S.kr=v},
    ptr(t,px,py,e){if(t==='up'){S.drag=false;return}if(t==='down')S.drag=true;if(t==='down'||S.drag||(e&&e.pointerType==='mouse')){if(me&&!me.out)me.x=clamp12(px,20,W-20)}},
    step(dt){
      const now=Date.now();if(now<C.t0)return;
      if(me&&!me.out){me.x=clamp12(me.x+(S.kr-S.kl)*440*dt,20,W-20);me.dx=me.x}
      if(C.host){if(!S.end){hostStep(dt);const ev=S.ev.splice(0);feel(ev);if(C.net&&now-S.snapAt>66){S.snapAt=now;C.send('snap',{it:S.items.map(i=>[i.id,Math.round(i.x),Math.round(i.y),i.k,Math.round(i.v)]),p:ps.map(p=>[p.u,Math.round(p.x),p.s,p.l,p.sh,p.mg>S.t?1:0,p.cb]),sl:S.t<S.slow?1:0,ev})}else if(ev.length&&C.net)C.send('snap',{it:S.items.map(i=>[i.id,Math.round(i.x),Math.round(i.y),i.k,Math.round(i.v)]),p:ps.map(p=>[p.u,Math.round(p.x),p.s,p.l,p.sh,p.mg>S.t?1:0,p.cb]),sl:S.t<S.slow?1:0,ev})}}
      else{S.items.forEach(i=>{i.y+=i.v*(S.sl?.5:1)*dt});const k=Math.min(1,dt*12);ps.forEach(p=>{if(p!==me)p.dx+=(p.x-p.dx)*k});
        if(me&&Math.abs(me.x-S.lastX)>1&&now-S.inAt>66){S.inAt=now;S.lastX=me.x;C.send('in',{x:Math.round(me.x)})}}
      if(me)C.hud(`<b>${me.s}</b> pontos · ${'❤'.repeat(Math.max(0,me.l))}${me.sh?' · 🛡':''}${(C.host?me.mg>S.t:me.mgOn)?' · 🧲':''}${me.cb>=3?` · combo ${me.cb}`:''}${me.out?' · fora (assistindo)':''}`);
    },
    msg(p){
      if(C.host&&p.t==='in'){const q=ps.find(x=>x.u===p.from);if(q)q.tx=clamp12(Number(p.x)||0,20,W-20)}
      if(!C.host&&p.t==='snap'){const old=new Map(S.items.map(i=>[i.id,i]));S.items=(p.it||[]).map(([id,x,y,k,v])=>{const o=old.get(id);return{id,x,y:o&&Math.abs(o.y-y)<40?o.y+(y-o.y)*.5:y,k,v}});
        S.sl=!!p.sl;(p.p||[]).forEach(([u,x,s,l,sh,mg,cb])=>{const q=ps.find(z=>z.u===u);if(!q)return;if(q!==me)q.x=x;q.s=s;q.l=l;q.out=l<=0;q.sh=sh|0;q.mgOn=!!mg;q.cb=cb|0});feel(p.ev)}
    },
    left(u){const q=ps.find(p=>p.u===u);if(q){q.out=true;q.l=0}},
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14261f');gr.addColorStop(1,'#2d1d14');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='#3a2a1e';x.fillRect(0,BY+26,W,H-BY);x.fillStyle='#5b4330';x.fillRect(0,BY+26,W,3);
      S.items.forEach(it=>{const K=KIND[it.k];x.save();if(it.k==='x'){x.shadowColor='#c33cff';x.shadowBlur=14}x.beginPath();x.arc(it.x,it.y,15,0,7);x.fillStyle=K.col;x.fill();x.restore();x.font='18px system-ui,"Apple Color Emoji","Segoe UI Emoji"';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(K.ico,it.x,it.y+1)});
      ps.filter(p=>p!==me).forEach(p=>{const px=C.host?p.x:p.dx;mgCat(x,p.c,px,BY,54,p.n+(C.net?' · '+p.s:''),{alpha:p.out?.18:.5})});
      if(me){mgCat(x,me.c,me.x,BY,58,me.n+(C.net?' · '+me.s:''),{alpha:me.out?.25:1,ring:true});if(me.sh&&!me.out){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(me.x,BY,36,0,7);x.stroke()}if((C.host?me.mg>S.t:me.mgOn)&&!me.out){x.strokeStyle='rgba(255,143,177,.4)';x.setLineDash([6,6]);x.beginPath();x.arc(me.x,BY-60,120,Math.PI*1.1,Math.PI*1.9);x.stroke();x.setLineDash([])}}
      if(C.host?S.t<S.slow:S.sl){x.fillStyle='rgba(180,140,255,.1)';x.fillRect(0,0,W,H)}
      x.font='600 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='left';x.textBaseline='top';x.fillStyle='#d9cbb0';x.fillText('⚗ +10   ❤ +25   ☠ −1 vida   🛡 🧲 ⏳ ➕ poderes',12,12);x.textAlign='right';x.fillText(`Onda ${S.wave||1}`,W-12,12);
    }
  };
}

/* ---------- 🧠 Eco da Memória (o anfitrião sorteia e julga) ---------- */
const EL12=[{n:'Natureza',g:'🌿',c:'#3fae5a'},{n:'Inexistência',g:'◐',c:'#6b4fa0'},{n:'Ilusão',g:'🌀',c:'#c056d6'},{n:'Verdade',g:'👁',c:'#e8b83c'},{n:'Fé',g:'✶',c:'#5aa7e8'}];
function eco(C){
  const W=480,H=540,CX=240,CY=300,RR=150,SR=52;
  const pos=EL12.map((e,i)=>{const a=-Math.PI/2+i*Math.PI*2/5;return[CX+Math.cos(a)*RR,CY+Math.sin(a)*RR]});
  const D0=gdPick(C.gd,[760,640,520,420]),DMIN=gdPick(C.gd,[420,330,280,240]),SEQ0=gdPick(C.gd,[1,1,3,4]);
  const S={seq:[],r:0,ph:'wait',at:0,dur:600,idx:0,lit:-1,litUntil:0,dead:new Set(),best:{},ans:{},prog:{},deadline:0,msg:'Prepare-se…',start:C.players.map(p=>p.u)};
  const alive=()=>C.players.filter(p=>!S.dead.has(p.u));
  const nmOf=u=>(C.players.find(p=>p.u===u)||{n:'?'}).n;
  const light=i=>{S.lit=i;S.litUntil=Date.now()+Math.min(420,S.dur*.75);fx5('eco'+i)};
  function hostRound(){S.r++;do S.seq.push(Math.floor(Math.random()*5));while(S.seq.length<SEQ0);S.ans={};const at=Date.now()+900;C.send('eseq',{r:S.r,seq:S.seq,at});recvSeq(S.r,S.seq,at)}
  function recvSeq(r,seq,at){S.r=r;S.seq=seq.slice();S.at=at;S.dur=Math.max(DMIN,D0-r*22);S.ph='show';S.idx=0;S.shown=-1;S.prog={};S.msg=`Rodada ${r}: observe`}
  function answer(ok){S.ph='sent';S.msg=ok?'✓ Certo! Esperando os outros…':'✕ Errou a sequência.';if(ok)S.best[C.me]=S.r;if(C.host)hostAns(C.me,ok);else C.send('eans',{r:S.r,ok})}
  function hostAns(u,ok){if(S.ans[u]!==undefined||S.dead.has(u))return;S.ans[u]=!!ok;if(ok)S.best[u]=S.r;hostCheck()}
  function hostCheck(force){
    const al=alive();if(!force&&!al.every(p=>S.ans[p.u]!==undefined))return;if(S.judged===S.r)return;S.judged=S.r;
    const failed=al.filter(p=>!S.ans[p.u]).map(p=>p.u);
    let over=false,winners=[];
    if(!C.net){over=failed.length>0}
    else if(failed.length===al.length){over=true;winners=al.map(p=>p.u)}
    else{failed.forEach(u=>S.dead.add(u));const rest=alive();if(rest.length<=1&&S.start.length>1){over=true;winners=rest.map(p=>p.u)}}
    C.send('eres',{r:S.r,out:failed,over});recvRes(failed,over);
    if(over){setTimeout(()=>{const rows=C.players.map(p=>({u:p.u,n:p.n,c:p.c,s:S.best[p.u]||0,w:winners.includes(p.u)})).sort((a,b)=>b.s-a.s);
      C.finish({title:C.net?(winners.length===1?'O último Perseus de pé: '+nmOf(winners[0]):'Empate entre '+winners.map(nmOf).join(' e ')):`Fim · ${S.best[C.me]||0} rodadas`,rows})},1200)}
    else setTimeout(hostRound,1400);
  }
  function recvRes(out,over){out.forEach(u=>S.dead.add(u));if(out.length&&C.net){const n=out.map(nmOf).join(', ');S.msg=`Eliminado${out.length>1?'s':''}: ${n}`;if(C.host)C.say(sayFmt(SAY12.eco,{n}))}else if(!over)S.msg='Todos acertaram. Próxima rodada…'}
  return{
    st:()=>S,ps:()=>typeof ps!=="undefined"?ps:null,
    key(){},
    ptr(t,px,py){if(t!=='down'||S.ph!=='input'||S.dead.has(C.me))return;const i=pos.findIndex(([x,y])=>Math.hypot(px-x,py-y)<SR+6);if(i<0)return;
      light(i);if(S.seq[S.idx]!==i){C.send('eprog',{r:S.r,i:S.idx,x:1});answer(false);return}S.idx++;C.send('eprog',{r:S.r,i:S.idx});if(S.idx>=S.seq.length)answer(true)},
    tap(i){this.ptr('down',pos[i][0],pos[i][1])},
    step(){
      const now=Date.now();
      if(S.ph==='wait'&&now>=C.t0&&C.host&&!S.r){S.ph='x';hostRound()}
      if(S.ph==='show'){const k=Math.floor((now-S.at)/S.dur);if(now>=S.at&&k<S.seq.length&&k!==S.shown){S.shown=k;light(S.seq[k])}
        if(now>=S.at+S.seq.length*S.dur){if(S.dead.has(C.me)){S.ph='watch';S.msg='Você está assistindo.'}else{S.ph='input';S.idx=0;S.deadline=now+3500+S.seq.length*900;S.msg='Sua vez: repita a sequência'}}}
      if(S.ph==='input'&&now>S.deadline){S.msg='⏱ Tempo esgotado.';answer(false)}
      if(C.host&&S.r&&S.judged!==S.r&&S.ph!=='show'&&now>S.at+S.seq.length*S.dur+3500+S.seq.length*900+1800)hostCheck(true);
      C.hud(`Rodada <b>${S.r||0}</b>${C.net?` · ${alive().length} de ${C.players.length} na disputa`:''}`);
    },
    msg(p){
      if(!C.host&&p.t==='eseq')recvSeq(p.r,p.seq||[],p.at);
      if(!C.host&&p.t==='eres')recvRes(p.out||[],p.over);
      if(C.host&&p.t==='eans'&&p.r===S.r)hostAns(p.from,p.ok);
      if(p.t==='eprog'&&p.r===S.r&&p.from!==C.me)S.prog[p.from]={i:Number(p.i)||0,x:!!p.x};
    },
    left(u){if(!C.host)return;C.players=C.players.filter(p=>p.u!==u);S.start=S.start.filter(x=>x!==u);if(S.r)hostCheck()},
    draw(x){
      const now=Date.now(),gr=x.createRadialGradient(CX,CY,40,CX,CY,360);gr.addColorStop(0,'#2c2140');gr.addColorStop(1,'#120c1c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.font='700 17px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle='#f4ead6';x.fillText(S.msg,W/2,74);
      if(S.ph==='input'){const left=Math.max(0,(S.deadline-now)/1000);x.font='600 13px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#d9cbb0';x.fillText(`${S.idx}/${S.seq.length} · ${left.toFixed(1)} s`,W/2,98)}
      pos.forEach(([px,py],i)=>{const e=EL12[i],on=S.lit===i&&now<S.litUntil;x.save();if(on){x.shadowColor=e.c;x.shadowBlur=34}
        x.beginPath();x.arc(px,py,on?SR+6:SR,0,7);x.fillStyle=on?e.c:e.c+'55';x.fill();x.lineWidth=3;x.strokeStyle=e.c;x.stroke();x.restore();
        x.font=`${on?34:30}px system-ui,"Apple Color Emoji","Segoe UI Emoji"`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(e.g,px,py-4);
        x.font='600 12px "IBM Plex Sans",system-ui,sans-serif';x.fillStyle='#f4ead6';x.fillText(e.n,px,py+SR+14)});
      if(C.net){C.players.forEach((p,i)=>{const n=C.players.length,px=W*(i+.5)/n,mine=p.u===C.me,pg=S.prog[p.u],tag=mine?'':(S.dead.has(p.u)?' · fora':pg?(pg.x?' · ✕':` · ${pg.i}/${S.seq.length}`):'');mgCat(x,p.c,px,H-34,40,p.n+tag,{alpha:S.dead.has(p.u)?.18:mine?1:.5,ring:mine})})}
      else mgCat(x,-1,CX,CY,70,'');
    }
  };
}

/* ---------- ❌⭕ Jogo da Velha Teosófico (o anfitrião julga) ---------- */
const LINES12=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
/* IA do Jogo da Velha por dificuldade.
   Fácil: muitas vezes joga ao acaso e nem sempre bloqueia. Médio: ganha se der, bloqueia, prefere centro e cantos.
   Difícil: minimax, mas às vezes escolhe uma jogada só "boa". Pesadelo: minimax perfeito (no máximo empate). */
function tttWin(b){for(const l of LINES12)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return b[l[0]];return null}
function tttMinimax(b,me,op,turn,depth){
  const w=tttWin(b);if(w===me)return 10-depth;if(w===op)return depth-10;if(b.every(Boolean))return 0;
  let best=turn===me?-99:99;
  for(let i=0;i<9;i++){if(b[i])continue;b[i]=turn;const v=tttMinimax(b,me,op,turn===me?op:me,depth+1);b[i]=null;best=turn===me?Math.max(best,v):Math.min(best,v)}
  return best;
}
function tttPick(b0,me,op,diff){
  const b=b0.slice(),free=b.map((v,i)=>v?null:i).filter(i=>i!=null);if(!free.length)return null;
  const finds=who=>{for(const l of LINES12){const v=l.map(i=>b[i]);if(v.filter(z=>z===who).length===2&&v.includes(null))return l[v.indexOf(null)]}return null};
  if(diff==='facil'){
    const w=finds(me);if(w!=null&&Math.random()<.7)return w;
    const k=finds(op);if(k!=null&&Math.random()<.4)return k;
    return pick12(free);
  }
  if(diff==='dificil'||diff==='pesadelo'){
    const sc=free.map(i=>{b[i]=me;const v=tttMinimax(b,me,op,op,1);b[i]=null;return{i,v}});
    const top=Math.max(...sc.map(s=>s.v));
    if(diff==='dificil'&&Math.random()<.2){const ok=sc.filter(s=>s.v>=0&&s.v<top);if(ok.length)return pick12(ok).i}
    const best=sc.filter(s=>s.v===top).map(s=>s.i);
    return best.includes(4)?4:pick12(best);
  }
  let i=finds(me);if(i==null)i=finds(op);
  if(i==null){if(Math.random()<.7)i=[4,0,2,6,8,1,3,5,7].find(k=>!b[k]);else i=pick12(free)}
  return i;
}
T3.tttPick=tttPick;
function velha(C){
  const W=480,H=560,OX=45,OY=110,CS=130;
  const ai=!C.net,S={b:Array(9).fill(null),x:null,o:null,turn:null,q:[],wins:{},line:null,st:'play',win:null};
  const info=u=>u==='~ai'?{n:'Perseus · '+(DIFF12[C.diff]||DIFF12.medio).n,c:-1}:(C.players.find(p=>p.u===u)||{n:'?',c:0});
  function winner(b){for(const l of LINES12)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return l;return null}
  function bcast(){if(C.net)C.send('tstate',{b:S.b,x:S.x,o:S.o,turn:S.turn,q:S.q,wins:S.wins,line:S.line,st:S.st,win:S.win})}
  function newMatch(x,o){S.b=Array(9).fill(null);S.x=x;S.o=o;S.turn=x;S.line=null;S.st='play';S.win=null;bcast()}
  if(C.host){if(ai)newMatch(C.me,'~ai');else{const us=C.players.map(p=>p.u);S.q=us.slice(2);newMatch(us[0],us[1])}}
  function apply(i,u){
    if(S.st!=='play'||u!==S.turn||S.b[i])return false;
    S.b[i]=u;fx5('click');const l=winner(S.b);
    if(l){S.line=l;S.st='end';S.win=u;S.wins[u]=(S.wins[u]||0)+1;
      boardPush([{g:'velha',n:info(u).n,w:true}]);
      C.say(u==='~ai'?'Miau. Vitória. Como previsto.':ai?'Eu deixei. Para manter sua autoestima.':sayFmt(SAY12.tttMulti));setTimeout(next,2400)}
    else if(S.b.every(Boolean)){S.st='end';S.win=null;C.say('Empate. Considere isso uma vitória moral… minha.');setTimeout(next,2200)}
    else{S.turn=u===S.x?S.o:S.x;if(C.net&&Math.random()<.25)C.say(sayFmt(SAY12.tttMulti))}
    bcast();if(ai&&S.turn==='~ai'&&S.st==='play')setTimeout(aiMove,650);return true;
  }
  function aiMove(){
    if(S.st!=='play'||S.turn!=='~ai')return;
    const i=tttPick(S.b,'~ai',S.x,C.diff);
    apply(i,'~ai');if(S.st==='play'&&Math.random()<.45)C.say(sayFmt(SAY12['tttAi_'+C.diff]||SAY12.tttAi));
  }
  function next(){
    if(!C.host)return;
    if(ai){newMatch(S.x,'~ai');return}
    const us=C.players.map(p=>p.u);S.q=S.q.filter(u=>us.includes(u));us.forEach(u=>{if(u!==S.x&&u!==S.o&&!S.q.includes(u))S.q.push(u)});
    let champ=S.win||S.x,loser=champ===S.x?S.o:S.x;if(!us.includes(champ))champ=us.find(u=>u!==loser);
    if(loser&&us.includes(loser))S.q.push(loser);const ch=S.q.shift();
    if(!champ||!ch){newMatch(us[0],us[1]);return}
    newMatch(champ,ch);
  }
  return{
    key(){},
    ptr(t,px,py){if(t!=='down')return;const cx=Math.floor((px-OX)/CS),cy=Math.floor((py-OY)/CS);if(cx<0||cx>2||cy<0||cy>2)return;const i=cy*3+cx;
      if(S.turn!==C.me||S.st!=='play'||S.b[i])return;
      if(C.host)apply(i,C.me);else{C.send('tmove',{i});S.b[i]=C.me;S.turn=null;fx5('click')}},
    tap(i){this.ptr('down',OX+(i%3+.5)*CS,OY+(Math.floor(i/3)+.5)*CS)},
    state:()=>S,
    step(){
      const a=info(S.x),b=info(S.o);C.hud(`<b>${esc(a.n)}</b> ✕ ${S.wins[S.x]||0} · ${S.wins[S.o]||0} ◯ <b>${esc(b.n)}</b>${S.q.length?` · fila: ${S.q.map(u=>esc(info(u).n)).join(', ')}`:''}`);
    },
    msg(p){
      if(C.host&&p.t==='tmove'){const i=Number(p.i);if(i>=0&&i<9)apply(i,p.from)}
      if(!C.host&&p.t==='tstate'){Object.assign(S,{b:p.b||S.b,x:p.x,o:p.o,turn:p.turn,q:p.q||[],wins:p.wins||{},line:p.line,st:p.st,win:p.win})}
    },
    left(u){if(!C.host)return;C.players=C.players.filter(p=>p.u!==u);if(u===S.x||u===S.o){const other=u===S.x?S.o:S.x;S.st='end';S.win=other;S.wins[other]=(S.wins[other]||0)+1;bcast();setTimeout(next,1500)}else{S.q=S.q.filter(x=>x!==u);bcast()}},
    draw(x){
      const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#241a2e');gr.addColorStop(1,'#16101c');x.fillStyle=gr;x.fillRect(0,0,W,H);
      const ti=S.st==='end'?(S.win?info(S.win).n+' venceu!':'Empate!'):S.turn===C.me?'Sua vez':S.turn?'Vez de '+info(S.turn).n:'…';
      x.font='700 20px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle=S.turn===C.me&&S.st==='play'?'#ffd36b':'#f4ead6';x.fillText(ti,W/2,76);
      x.strokeStyle='#d9cbb0';x.lineWidth=5;x.lineCap='round';
      for(let i=1;i<3;i++){x.beginPath();x.moveTo(OX+i*CS,OY+8);x.lineTo(OX+i*CS,OY+3*CS-8);x.stroke();x.beginPath();x.moveTo(OX+8,OY+i*CS);x.lineTo(OX+3*CS-8,OY+i*CS);x.stroke()}
      S.b.forEach((u,i)=>{if(!u)return;const cx=OX+(i%3+.5)*CS,cy=OY+(Math.floor(i/3)+.5)*CS,f=info(u);mgCat(x,f.c,cx,cy,96,'');
        x.font='800 22px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='right';x.textBaseline='bottom';x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=4;const m=u===S.x?'✕':'◯';x.strokeText(m,cx+CS/2-10,cy+CS/2-6);x.fillText(m,cx+CS/2-10,cy+CS/2-6)});
      if(S.line){const a=S.line[0],b=S.line[2],p=i=>[OX+(i%3+.5)*CS,OY+(Math.floor(i/3)+.5)*CS],[ax,ay]=p(a),[bx,by]=p(b);x.strokeStyle='#ffd36b';x.lineWidth=8;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()}
      const a=info(S.x),b=info(S.o);mgCat(x,a.c,60,H-30,40,a.n+' ✕');mgCat(x,b.c,W-60,H-30,40,'◯ '+b.n);
    }
  };
}

/* ---------- catálogo ---------- */
const GAMES12={
  volley:{name:'Tulpa Volley',short:'Volley',ico:'🏐',solo:'🤖 Contra o Perseus',ai:true,desc:'Vôlei 2D com a esfera de Essência. 7 pontos vencem. Até 3 contra 3.',rule:'Times alternados pela ordem de chegada (até 3 de cada lado). Se faltar alguém, o Perseus completa o time menor.',W:800,H:450,pad:'lrj',keys:'A/D ou ←/→ andam · W, ↑ ou Espaço pulam',touch:'',unit:'pts',make:volley},
  voo:{name:'Voo Além do Véu',short:'Voo',ico:'🦇',solo:'🎯 Solo',rec:true,desc:'Bata as asas entre colunas de sombra. Os outros voam junto como fantasmas.',rule:'Todos voam nas mesmas colunas ao mesmo tempo. Vence quem passar por mais colunas.',W:480,H:640,pad:'',keys:'Espaço, ↑ ou clique para bater as asas',touch:'Toque em qualquer lugar para bater as asas',unit:'colunas',make:voo},
  salto:{name:'Salto Astral',short:'Salto',ico:'⬆️',solo:'🎯 Solo',rec:true,desc:'Suba de plataforma em plataforma, pegue orbes de Luz e fuja da Inexistência.',rule:'Mesmas plataformas para todos; os colegas sobem como fantasmas. Vence a maior pontuação.',W:480,H:640,pad:'lr',keys:'A/D ou ←/→ · ou segure o clique do lado para onde quer ir',touch:'',unit:'pts',make:salto},
  coleta:{name:'Coleta de Essência',short:'Coleta',ico:'🧪',solo:'🎯 Solo',rec:true,desc:'Pegue frascos de Essência (+10) e Vital (+25). Crânios tiram uma das 3 vidas.',rule:'Todos na mesma arena disputando os mesmos itens. Vence quem terminar com mais pontos.',W:480,H:640,pad:'lr',keys:'A/D, ←/→ ou arraste com o mouse',touch:'',unit:'pts',make:coleta},
  eco:{name:'Eco da Memória',short:'Eco',ico:'🧠',solo:'🎯 Solo',rec:true,desc:'Os 5 Elementos acendem e tocam uma sequência. Repita sem errar.',rule:'Quem errar ou demorar demais é eliminado e assiste. O último Perseus de pé vence.',W:480,H:540,pad:'',keys:'Clique nos símbolos na ordem',touch:'Toque nos símbolos na ordem',unit:'rodadas',make:eco},
  velha:{name:'Jogo da Velha Teosófico',short:'Velha',ico:'❌',solo:'🤖 Contra o Perseus',ai:true,desc:'Partida rápida com os Perseus coloridos. Quem vence continua na mesa.',rule:'1 contra 1 com fila: quem vence fica, o próximo da fila desafia. Até 6 na sala.',W:480,H:560,pad:'',keys:'Clique numa casa',touch:'Toque numa casa',unit:'',make:velha},
};
T3.games=GAMES12;


/* ===================================================================
   TULPA · ✋ Levantar a Mão
   O jogador levanta ou abaixa a mão pela barra da mesa (ao lado da call).
   O estado vai na presença do canal da mesa (handRaised = hand > 0) e
   também por transmissão, para chegar na hora. Quem sai da mesa perde a
   mão levantada sozinho. O Mestre vê o ✋ dourado no card do jogador, ouve
   um aviso discreto e baixa uma mão ou todas.
   =================================================================== */
const HAND13={hands:{},castAt:{},sig:'',barSig:''};
T3.hand=HAND13;T3.myHand=()=>M6.myHand||0;
S5.hand=t=>{o5('sine',784,t,.22,{gain:.045,wet:.5});o5('sine',1175,t+.11,.34,{gain:.04,wet:.55})};

const handName13=u=>{const ch=charOfUser6(u);return String((ch&&nm(ch))||M6.present?.[u]?.name||'Jogador').slice(0,32)};
const handKey13=()=>'tulpa_hand_'+(camp3()?.id||'x');
/* quem está com a mão levantada agora, em ordem de quem levantou primeiro */
function handList13(){return Object.entries(HAND13.hands).filter(([u,at])=>at>0&&(u===uid3()||!M6.live||!Object.keys(M6.present||{}).length||M6.present[u])).sort((a,b)=>a[1]-b[1]).map(([u])=>u)}
T3.handList=handList13;

function handSet13(on,quiet){
  if(isGM6()||!camp3())return;
  const at=on?Date.now():0;if(!!M6.myHand===!!on)return;
  M6.myHand=at;HAND13.hands[uid3()]=at;HAND13.castAt[uid3()]=Date.now();
  try{sessionStorage.setItem(handKey13(),String(at))}catch(e){}
  trackMe6();cast6({t:'hand',on:!!on,at});
  if(!quiet){fx5('click');toast(on?'✋ Mão levantada. O Mestre foi avisado.':'Mão abaixada.')}
  handPaint13();
}
T3.handSet=handSet13;
function handDown13(u){
  if(!isGM6())return;
  const all=u==='*',list=all?handList13():[u];
  list.forEach(x=>{HAND13.hands[x]=0;HAND13.castAt[x]=Date.now()});
  cast6({t:'hand-down',u});fx5('confirm');handPaint13();
}
T3.handDown=handDown13;

/* um aviso só para o Mestre quando alguém novo levanta a mão */
function handNew13(u,before){
  if(!isGM6()||u===uid3()||before)return;
  fx5('hand');HAND13.beeps=(HAND13.beeps||0)+1;
  const n=handName13(u);
  if(!document.hidden)toast(`✋ ${n} levantou a mão.`);
}
function handFromPresence13(){
  const now=Date.now();
  Object.entries(M6.present||{}).forEach(([u,p])=>{
    if(u===uid3())return;
    if(now-(HAND13.castAt[u]||0)<4000)return;
    const before=HAND13.hands[u]>0,at=Number(p?.hand)||0;HAND13.hands[u]=at;
    if(at>0)handNew13(u,before);
  });
  handPaint13();
}
onCast6(p=>{
  if(p.t==='hand'&&p.from&&p.from!==uid3()){
    const before=HAND13.hands[p.from]>0;HAND13.hands[p.from]=p.on?(Number(p.at)||Date.now()):0;HAND13.castAt[p.from]=Date.now();
    if(p.on)handNew13(p.from,before);handPaint13();
  }
  if(p.t==='hand-down'){
    const all=p.u==='*';
    if(all)Object.keys(HAND13.hands).forEach(u=>{HAND13.hands[u]=0;HAND13.castAt[u]=Date.now()});
    else if(p.u){HAND13.hands[p.u]=0;HAND13.castAt[p.u]=Date.now()}
    if(!isGM6()&&M6.myHand&&(all||p.u===uid3())){
      M6.myHand=0;try{sessionStorage.setItem(handKey13(),'0')}catch(e){}trackMe6();
      toast('✓ O Mestre baixou sua mão.');
    }
    handPaint13();
  }
  /* quem chega depois pergunta; cada jogador responde com a própria mão */
  if(p.t==='hand?'&&!isGM6()&&M6.myHand)cast6({t:'hand',on:true,at:M6.myHand});
});
M6.hooks.layout.push(handFromPresence13);
M6.hooks.leave.push(()=>{HAND13.hands={};HAND13.castAt={};M6.myHand=0;HAND13.sig='';HAND13.barSig=''});

/* ---------- desenho: botão na barra, lista do Mestre e ✋ nos cards ---------- */
function handBar13(){
  const bar=$('mesaBar');if(!bar)return;
  let g=$('mbHand');
  if(!g){g=document.createElement('div');g.id='mbHand';g.className='mb-group mb-hand';const call=$('mbCall');if(call)call.after(g);else bar.prepend(g)}
  const isM=isGM6(),list=handList13(),mine=!!M6.myHand;
  const sig=[isM,mine,list.map(u=>u+':'+handName13(u)).join(',')].join('|');
  if(HAND13.barSig===sig&&g.childNodes.length)return;HAND13.barSig=sig;
  if(!isM){
    g.innerHTML=`<button type="button" class="btn small hand-btn ${mine?'up':''}" id="handBtn" aria-pressed="${mine}">${mine?'✋ Abaixar a Mão':'✋ Levantar a Mão'}</button>`;
    $('handBtn').onclick=()=>handSet13(!M6.myHand);
    return;
  }
  if(!list.length){g.innerHTML='<span class="sub hand-none">✋ Nenhuma mão levantada</span>';return}
  g.innerHTML=`<span class="hand-title" role="status">✋ ${list.length===1?'1 mão levantada':list.length+' mãos levantadas'}</span>${list.map((u,i)=>`<button type="button" class="hand-chip" data-hdown="${esc(u)}" title="Baixar a mão de ${esc(handName13(u))}"><span class="hand-n">${i+1}</span>${esc(handName13(u))}<span class="hand-ok">✓ Baixar Mão</span></button>`).join('')}${list.length>1?'<button type="button" class="btn small" id="handAll">Baixar Todas as Mãos</button>':''}`;
  $$('[data-hdown]',g).forEach(b=>b.onclick=()=>handDown13(b.dataset.hdown));
  const a=$('handAll');if(a)a.onclick=()=>handDown13('*');
}
function handCards13(){
  const up=new Set(handList13()),isM=isGM6();
  $$('#tableCharacters .table-char[data-uid]').forEach(card=>{
    const u=card.dataset.uid,on=up.has(u)&&card.classList.contains('seat');
    card.classList.toggle('hand-up',on);
    let b=card.querySelector('.hand-badge');
    if(!on){b?.remove();return}
    const want=isM?'m':'p';
    if(b&&b.dataset.k===want)return;b?.remove();
    b=document.createElement(isM?'button':'span');b.className='hand-badge';b.dataset.k=want;
    if(isM){b.type='button';b.title='Baixar a mão de '+handName13(u);b.setAttribute('aria-label',b.title);b.innerHTML='<span aria-hidden="true">✋</span><span class="hand-ok">✓ Baixar Mão</span>';b.onclick=e=>{e.stopPropagation();handDown13(u)}}
    else{b.setAttribute('role','img');b.setAttribute('aria-label','Mão levantada');b.textContent='✋'}
    card.append(b);
  });
}
function handPaint13(){if(!camp3())return;try{handBar13();handCards13()}catch(e){console.warn('[T13] mão',e)}}
T3.handPaint=handPaint13;
onState6(handPaint13);
/* os cards da mesa são redesenhados por outros módulos: confere de vez em quando */
setInterval(()=>{if(camp3()&&$('mesaBar'))handPaint13()},900);

/* ao entrar (ou recarregar), recupera a própria mão e pergunta pelas dos outros */
let handBoot13='';
setInterval(()=>{
  const c=camp3();if(!c||!M6.live||handBoot13===c.id)return;handBoot13=c.id;
  if(!isGM6()){let at=0;try{at=Number(sessionStorage.getItem(handKey13()))||0}catch(e){}if(at){M6.myHand=at;HAND13.hands[uid3()]=at;trackMe6()}}
  cast6({t:'hand?'});handPaint13();
},700);
M6.hooks.leave.push(()=>{handBoot13=''});


