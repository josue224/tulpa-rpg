/* ===================================================================
   TULPA ARCADE · UNO Teosófico, Teosofia Clicker, Rinha de Tulpas e
   Corrida do Véu
   =================================================================== */
['um','ud','up','kfin','kit','rfin','ri'].forEach(t=>MG_MUST.add(t));
const bots17=(C,want)=>{const out=C.players.map(p=>({u:p.u,n:p.n,c:p.c,bot:false}));const names=['Perseus','Gato do Véu','Eco Felino','Sombra Ronronante','Bigode Astral'];let i=0;while(out.length<want){out.push({u:'~b'+i,n:names[i%names.length],c:-1,bot:true});i++}return out};

/* ===================================================================
   🃏 UNO TEOSÓFICO — cartas dos 5 Elementos
   Jogue carta da mesma cor (Elemento) ou do mesmo número/símbolo.
   ⊘ pula, ⇄ inverte, +2 / +4 fazem o próximo comprar E perder 2/4 de
   Lucidez (começa com 10; quem zera, colapsa e sai). Coringas trocam
   o Elemento. Esvazie a mão para vencer. Anfitrião manda na partida.
   =================================================================== */
const UNO_EL=[{n:'Natureza',c:'#3fae5a',g:'🌿'},{n:'Inexistência',c:'#2b2433',g:'◐'},{n:'Ilusão',c:'#9b5bff',g:'🌀'},{n:'Verdade',c:'#3a8bff',g:'👁'},{n:'Fé',c:'#e8b400',g:'✶'}];
function uno(C){
  const W=800,H=450,TURN=25000,CW=58,CH=86;
  const rnd=mb32(C.seed^0x0b0);
  const S={seats:[],deck:[],top:null,col:0,turn:0,dir:1,deadline:0,drew:false,over:false,pick:null,log:'',hover:-1,anim:0,v:0};
  const meIdx=()=>S.seats.findIndex(s=>s.u===C.me);
  const canPlay=c=>c.e<0||c.e===S.col||c.v===S.top.v;
  function newDeck(){const d=[];for(let e=0;e<5;e++){d.push({e,v:'0'});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({e,v:String(n)});d.push({e,v:'⊘'},{e,v:'⇄'},{e,v:'+2'})}}for(let k=0;k<4;k++)d.push({e:-1,v:'W'},{e:-1,v:'+4'});
    for(let i=d.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
  function draw1(s){if(!S.deck.length)S.deck=newDeck();s.hand.push(S.deck.pop())}
  const alive=()=>S.seats.filter(s=>!s.out);
  function nextIdx(from,steps=1){let i=from;for(let k=0;k<steps;k++){do{i=(i+S.dir+S.seats.length)%S.seats.length}while(S.seats[i].out)}return i}
  function setTurn(i){S.turn=i;S.drew=false;S.deadline=Date.now()+TURN;S.v++;pub();const s=S.seats[i];if(s.bot)S.botAt=Date.now()+700+Math.random()*700}
  /* ---- só o anfitrião (ou solo) executa estas ---- */
  function hostInit(){
    S.seats=bots17(C,Math.max(4,Math.min(6,C.players.length))).map(p=>({...p,hand:[],luc:10,out:false}));
    S.deck=newDeck();S.seats.forEach(s=>{for(let k=0;k<7;k++)draw1(s)});
    let t;do{t=S.deck.pop();if(t.e<0||isNaN(+t.v))S.deck.unshift(t)}while(t.e<0||isNaN(+t.v));
    S.top=t;S.col=t.e;setTurn(Math.floor(rnd()*S.seats.length));S.log='Primeira carta: '+UNO_EL[t.e].n+' '+t.v;
  }
  function play(si,hi,col){
    if(S.over||si!==S.turn)return;const s=S.seats[si],c=s.hand[hi];if(!c||!canPlay(c))return;
    s.hand.splice(hi,1);S.top=c;S.col=c.e<0?(col>=0&&col<5?col:0):c.e;S.anim=1;
    let skip=1;S.log=`${s.n} jogou ${c.e<0?'coringa → '+UNO_EL[S.col].n:UNO_EL[c.e].n+' '+c.v}`;
    if(c.v==='⇄'){S.dir*=-1;if(alive().length===2)skip=2}
    if(c.v==='⊘')skip=2;
    if(c.v==='+2'||c.v==='+4'){const n=c.v==='+2'?2:4,vi=nextIdx(si),v=S.seats[vi];for(let k=0;k<n;k++)draw1(v);v.luc-=n;S.log+=` · ${v.n} compra ${n} e perde ${n} de Lucidez`;
      if(v.luc<=0){v.luc=0;v.out=true;v.hand=[];S.log+=` · ${v.n} COLAPSOU!`}skip=2;
      if(v.out)skip=1}
    if(!s.hand.length){finishUno(s);return}
    if(alive().length===1){finishUno(alive()[0]);return}
    setTurn(nextIdx(si,skip));
  }
  function drawTurn(si){if(S.over||si!==S.turn||S.drew)return;const s=S.seats[si];draw1(s);S.drew=true;S.log=`${s.n} comprou uma carta`;S.v++;pub();
    if(!canPlay(s.hand[s.hand.length-1])&&!s.bot)setTimeout(()=>{if(S.turn===si&&S.drew&&!S.over)pass(si)},900)}
  function pass(si){if(S.over||si!==S.turn)return;setTurn(nextIdx(si))}
  function botMove(si){const s=S.seats[si];const ok=s.hand.map((c,i)=>[c,i]).filter(([c])=>canPlay(c));
    if(!ok.length){if(!S.drew){drawTurn(si);S.botAt=Date.now()+600;return}pass(si);return}
    ok.sort((a,b)=>score(b[0])-score(a[0]));const cnt=[0,0,0,0,0];s.hand.forEach(c=>{if(c.e>=0)cnt[c.e]++});const best=cnt.indexOf(Math.max(...cnt));
    play(si,ok[0][1],best)}
  const score=c=>(c.v==='+2'?5:c.v==='⊘'||c.v==='⇄'?4:c.e<0?(c.v==='+4'?2:1):3)+(C.diff==='facil'?Math.random()*6:0);
  function finishUno(w){S.over=true;S.v++;pub();const rows=S.seats.map(s=>({u:s.u,n:s.n,c:s.c<0?0:s.c,s:s===w?100:Math.max(0,50-s.hand.length*3)+s.luc,w:s===w})).sort((a,b)=>b.s-a.s);
    if(w.u===C.me)C.achieve?.('baralho');
    setTimeout(()=>C.finish({title:w.u===C.me?'Você esvaziou a mão! Vitória no UNO Teosófico':`Vitória de ${w.n}`,rows}),900)}
  function pub(){if(!C.net||!C.host)return;C.send('us',{st:{seats:S.seats.map(s=>({u:s.u,n:s.n,c:s.c,bot:s.bot,luc:s.luc,out:s.out,hand:s.hand})),top:S.top,col:S.col,turn:S.turn,dir:S.dir,drew:S.drew,over:S.over,left:S.deadline-Date.now(),log:S.log,v:S.v}})}
  /* ---- entrada local ---- */
  function act(kind,a,b){const si=meIdx();if(si<0)return;
    if(C.host){if(kind==='play')play(si,a,b);if(kind==='draw')drawTurn(si);if(kind==='pass')pass(si);return}
    C.send(kind==='play'?'um':kind==='draw'?'ud':'up',{i:a,e:b,v:S.v})}
  S.act=act;S.canPlay=canPlay;
  if(C.host)hostInit();
  /* layout da mão */
  function handRects(){const si=meIdx();if(si<0)return[];const h=S.seats[si].hand,n=h.length,span=Math.min(W-80,n*(CW+6)),step=n>1?(span-CW)/(n-1):0,x0=(W-span)/2;return h.map((c,i)=>({x:x0+i*step,y:H-CH-14,w:CW,h:CH,i}))}
  const DRAWB={x:W/2-150,y:150,w:CW,h:CH},PASSB={x:W/2+110,y:170,w:90,h:40};
  const colB=()=>UNO_EL.map((e,i)=>({x:W/2-200+i*82,y:H/2-30,w:72,h:60,i}));
  function cardDraw(x,c,X,Y,{hi=false,dim=false,small=false}={}){const w=small?CW*.6:CW,h=small?CH*.6:CH;rr16(x,X,Y,w,h,8);
    if(c.e<0){const g=x.createLinearGradient(X,Y,X+w,Y+h);UNO_EL.forEach((e,i)=>g.addColorStop(i/4,e.c));x.fillStyle=g}else x.fillStyle=UNO_EL[c.e].c;x.fill();
    x.lineWidth=hi?3:1.5;x.strokeStyle=hi?'#fff':'rgba(255,255,255,.6)';x.stroke();
    x.beginPath();x.ellipse(X+w/2,Y+h/2,w*.36,h*.3,-.5,0,TAU16);x.fillStyle='rgba(255,255,255,.9)';x.fill();
    txt16(x,c.v==='W'?'✦':c.v,X+w/2,Y+h/2+1,{size:small?14:22,w:800,col:c.e<0?'#222':c.e===1?'#2b2433':UNO_EL[c.e].c});
    if(!small&&c.e>=0)txt16(x,UNO_EL[c.e].g,X+11,Y+12,{size:11});
    if(dim){rr16(x,X,Y,w,h,8);x.fillStyle='rgba(0,0,0,.45)';x.fill()}}
  return{st:()=>S,
    msg(p){
      if(!C.host&&p.t==='us'&&p.st&&p.from===C.room.host){const st=p.st;S.seats=st.seats;S.top=st.top;S.col=st.col;if(S.turn!==st.turn)S.anim=1;S.turn=st.turn;S.dir=st.dir;S.drew=st.drew;S.over=st.over;S.deadline=Date.now()+st.left;S.log=st.log;S.v=st.v}
      if(C.host&&['um','ud','up'].includes(p.t)){const si=S.seats.findIndex(s=>s.u===p.from);if(si<0)return;if(p.t==='um')play(si,p.i|0,p.e|0);if(p.t==='ud')drawTurn(si);if(p.t==='up')pass(si)}
    },
    left(u){if(!C.host)return;const s=S.seats.find(q=>q.u===u);if(!s)return;s.bot=true;s.n+=' (Perseus)';if(S.seats[S.turn]===s)S.botAt=Date.now()+500},
    key(code,down){if(!down)return;if(code==='Space')act(S.drew?'pass':'draw')},
    ptr(t,px,py){
      if(t==='move'){S.hover=-1;handRects().forEach(r=>{if(inB16(r,px,py))S.hover=r.i});return}
      if(t!=='down'||S.over||Date.now()<C.t0)return;const si=meIdx();if(si<0||S.turn!==si)return;
      if(S.pick!=null){const b=colB().find(b=>inB16(b,px,py));if(b){act('play',S.pick,b.i);S.pick=null}else S.pick=null;return}
      if(inB16(DRAWB,px,py)&&!S.drew){act('draw');return}
      if(S.drew&&inB16(PASSB,px,py)){act('pass');return}
      const rs=handRects();for(let k=rs.length-1;k>=0;k--){const r=rs[k];if(inB16(r,px,py)){const c=S.seats[si].hand[r.i];if(!canPlay(c)){fx5('error');return}if(c.e<0){S.pick=r.i;return}act('play',r.i,-1);fx5('click');return}}
    },
    step(dt){
      S.anim=Math.max(0,S.anim-dt*3);if(!S.seats.length)return;
      if(C.host&&!S.over&&Date.now()>=C.t0){const s=S.seats[S.turn];
        if(s.bot&&Date.now()>=S.botAt)botMove(S.turn);
        else if(!s.bot&&Date.now()>S.deadline){if(!S.drew)drawTurn(S.turn);pass(S.turn)}}
      const si=meIdx(),mine=si>=0&&S.turn===si;
      C.hud(S.over?'Fim da partida':`🃏 ${mine?'<b>Sua vez</b> — jogue uma carta de <b>'+UNO_EL[S.col].n+'</b> ou do mesmo símbolo':'Vez de <b>'+esc(S.seats[S.turn]?.n||'?')+'</b>'} · ⏱ ${Math.max(0,Math.ceil((S.deadline-Date.now())/1000))}s`);
    },
    draw(x){
      x.fillStyle='#1d3a2a';x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,H/2,40,W/2,H/2,420);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(0,0,W,H);
      if(!S.seats.length){txt16(x,'Embaralhando…',W/2,H/2,{size:18});return}
      const si=meIdx(),others=S.seats.map((s,i)=>[s,i]).filter(([s])=>s.u!==C.me);
      others.forEach(([s,i],k)=>{const cx=(k+.5)*W/others.length,cy=46,on=S.turn===i;
        rr16(x,cx-70,10,140,74,12);x.fillStyle=on?'rgba(255,211,107,.25)':'rgba(0,0,0,.3)';x.fill();if(on){x.strokeStyle='#ffd36b';x.lineWidth=2;x.stroke()}
        sprAt16(x,s.c,cx-44,cy,40,0,s.out?.3:1);txt16(x,s.n.slice(0,12),cx+14,24,{size:12,col:s.out?'#888':'#fff'});
        txt16(x,s.out?'colapsou':`🂠 ${s.hand.length}`,cx+14,46,{size:14,col:'#fff'});txt16(x,'🧠'+s.luc,cx+14,66,{size:12,col:s.luc<=4?'#ff8a8a':'#c39bff'})});
      /* monte e descarte */
      rr16(x,DRAWB.x,DRAWB.y,CW,CH,8);x.fillStyle='#2a1a3a';x.fill();x.strokeStyle=si===S.turn&&!S.drew?'#ffd36b':'#c39bff';x.lineWidth=2;x.stroke();txt16(x,'🂠',DRAWB.x+CW/2,DRAWB.y+CH/2-6,{size:28,col:'#c39bff'});txt16(x,'comprar',DRAWB.x+CW/2,DRAWB.y+CH-12,{size:10,col:'#c39bff'});
      if(S.top)cardDraw(x,S.top,W/2-CW/2,150-S.anim*20);
      x.beginPath();x.arc(W/2+70,193,16,0,TAU16);x.fillStyle=UNO_EL[S.col].c;x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();txt16(x,UNO_EL[S.col].g,W/2+70,194,{size:14});
      txt16(x,S.dir>0?'↻':'↺',W/2-90,193,{size:24,col:'rgba(255,255,255,.6)'});
      if(S.drew&&si===S.turn)btn16(x,PASSB,'Passar',{hot:true});
      txt16(x,S.log,W/2,262,{size:13,col:'#e8f5ec'});
      /* minha mão */
      if(si>=0){const me=S.seats[si];txt16(x,`🧠 Lucidez ${me.luc}/10${me.out?' · você colapsou':''}`,14,H-CH-30,{size:12,al:'left',col:'#c39bff'});
        handRects().forEach(r=>{const c=me.hand[r.i],ok=si===S.turn&&canPlay(c);cardDraw(x,c,r.x,r.y-(S.hover===r.i&&ok?14:ok?6:0),{hi:ok,dim:si===S.turn&&!ok})})}
      if(S.pick!=null){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,W,H);txt16(x,'Escolha o novo Elemento',W/2,H/2-56,{size:18});colB().forEach(b=>{rr16(x,b.x,b.y,b.w,b.h,10);x.fillStyle=UNO_EL[b.i].c;x.fill();x.strokeStyle='#fff';x.stroke();txt16(x,UNO_EL[b.i].g,b.x+b.w/2,b.y+22,{size:20});txt16(x,UNO_EL[b.i].n,b.x+b.w/2,b.y+46,{size:10})})}
    }
  };
}

/* ===================================================================
   📖 TEOSOFIA CLICKER — idle persistente
   Clique no tomo para gerar Essência. Compre geradores que produzem
   sozinhos (até 8 h de ganho offline). Lampejos de Lucidez dourados
   aparecem de vez em quando: clique neles para multiplicar a produção.
   =================================================================== */
const CLK_GEN=[['Sutura Bruta','🩹',15,.2],['Cultista','🕯',110,1.2],['Tomo Menor','📕',900,7],['Oráculo','🔮',7000,40],['Tulpa Doméstica','😼',52000,220],['Santuário','🏛',400000,1300],['Portal do Véu','🌀',3200000,8000]];
const CLK_UP=[['Dedos Iluminados','👆',100,2],['Leitura Dinâmica','📖',2500,5],['Toque da Verdade','👁',60000,10],['Clique Transcendente','✶',2000000,25]];
const fmt17=n=>{if(n>0&&n<10&&n%1)return n.toFixed(1).replace('.',',');n=Math.floor(n);const u=['','mil','mi','bi','tri','qua'];let i=0;let v=n;while(v>=1000&&i<u.length-1){v/=1000;i++}return i?(v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v))+' '+u[i]:String(n)};
function clicker(C){
  const W=800,H=450,KEY='tulpa_clk_'+(C.me||'anon'),TOME={x:150,y:235,r:92};
  let d={e:0,tot:0,g:CLK_GEN.map(()=>0),u:0,clicks:0,at:Date.now()};
  try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&typeof o.e==='number')d={...d,...o,g:CLK_GEN.map((_,i)=>(o.g||[])[i]|0)}}catch(e){}
  const cost=i=>Math.ceil(CLK_GEN[i][2]*Math.pow(1.15,d.g[i]));
  const rate=()=>CLK_GEN.reduce((a,g,i)=>a+g[3]*d.g[i],0)*(S.boostT>0?7:1);
  const per=()=>(1+(d.u>0?CLK_UP.slice(0,d.u).reduce((a,u)=>a*u[3],1)-1:0)+rate()*.02)*(S.boostT>0?7:1);
  const S={data:()=>d,pops:[],boostT:0,gold:null,goldAt:Date.now()+30000+Math.random()*40000,saveAt:0,bump:0,offline:0};
  /* ganhos offline */
  const away=Math.min(8*3600,Math.max(0,(Date.now()-(d.at||Date.now()))/1000));if(away>30){const g=CLK_GEN.reduce((a,gg,i)=>a+gg[3]*d.g[i],0)*away;if(g>0){d.e+=g;d.tot+=g;S.offline=g}}
  function save(){d.at=Date.now();try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  const genB=i=>({x:330,y:62+i*46,w:300,h:40}),upB=i=>({x:646,y:62+i*58,w:140,h:50}),REG={x:646,y:300,w:140,h:40},RESET={x:646,y:350,w:140,h:30};
  function gain(v){d.e+=v;d.tot+=v;if(d.tot>=1e6)C.achieve?.('clicker')}
  function click(px,py){
    if(S.gold&&Math.hypot(px-S.gold.x,py-S.gold.y)<30){S.gold=null;S.boostT=20;S.goldAt=Date.now()+60000+Math.random()*60000;fx5('mgWin');C.say?.('Lampejo de Lucidez! Produção ×7 por 20 s.',false);return}
    if(Math.hypot(px-TOME.x,py-TOME.y)<TOME.r){const v=per();gain(v);d.clicks++;S.bump=1;S.pops.push({x:px,y:py,t:0,s:'+'+fmt17(v)});C.stat?.('clicks');fx5('click');return}
    for(let i=0;i<CLK_GEN.length;i++)if(inB16(genB(i),px,py)){const c=cost(i);if(d.e>=c){d.e-=c;d.g[i]++;fx5('mgCoin');save()}else fx5('error');return}
    for(let i=0;i<CLK_UP.length;i++)if(inB16(upB(i),px,py)){if(i!==d.u)return;const c=CLK_UP[i][2];if(d.e>=c){d.e-=c;d.u++;fx5('activate');save()}else fx5('error');return}
    if(inB16(REG,px,py)){save();solo16(C,d.tot,`Biblioteca registrada · ${fmt17(d.tot)} de Essência no total`,d.tot>=1e6);return}
  }
  return{st:()=>S,
    key(code,down){if(down&&code==='Space')click(TOME.x,TOME.y)},
    ptr(t,px,py){if(t==='down'&&Date.now()>=C.t0)click(px,py)},
    end(){save()},
    step(dt){
      if(Date.now()<C.t0)return;gain(CLK_GEN.reduce((a,g,i)=>a+g[3]*d.g[i],0)*(S.boostT>0?7:1)*dt);
      S.boostT=Math.max(0,S.boostT-dt);S.bump=Math.max(0,S.bump-dt*6);S.pops=S.pops.filter(p=>(p.t+=dt)<1);
      if(!S.gold&&Date.now()>S.goldAt)S.gold={x:60+Math.random()*220,y:80+Math.random()*300,t:0};
      if(S.gold&&(S.gold.t+=dt)>9){S.gold=null;S.goldAt=Date.now()+45000+Math.random()*45000}
      if(Date.now()>S.saveAt){S.saveAt=Date.now()+5000;save()}
      C.hud(`📖 <b>${fmt17(d.e)}</b> ⚗ · ${fmt17(rate())}/s · ${fmt17(per())} por clique${S.boostT>0?' · <b style="color:#ffd36b">×7 Lampejo</b>':''}`);
    },
    draw(x){
      x.fillStyle='#1b1410';x.fillRect(0,0,W,H);
      txt16(x,fmt17(d.e)+' ⚗',TOME.x,40,{size:26,w:800,col:'#ffd36b'});txt16(x,`${fmt17(rate())} por segundo`,TOME.x,66,{size:13,col:'#cfc3b0'});
      const s=1+S.bump*.06;x.save();x.translate(TOME.x,TOME.y);x.scale(s,s);
      x.beginPath();x.arc(0,0,TOME.r,0,TAU16);const g=x.createRadialGradient(0,0,10,0,0,TOME.r);g.addColorStop(0,S.boostT>0?'#fff3b0':'#c39bff');g.addColorStop(1,'rgba(195,155,255,0)');x.fillStyle=g;x.fill();
      rr16(x,-52,-64,104,128,8);x.fillStyle='#5a2a1a';x.fill();x.strokeStyle='#ffd36b';x.lineWidth=3;x.stroke();txt16(x,'✶',0,-8,{size:46,col:'#ffd36b'});txt16(x,'TOMO',0,40,{size:12,col:'#ffd36b'});x.restore();
      txt16(x,'clique no tomo',TOME.x,TOME.y+TOME.r+22,{size:12,col:'#9a8a70'});
      if(S.offline){txt16(x,`Enquanto você esteve fora: +${fmt17(S.offline)} ⚗`,TOME.x,H-18,{size:12,col:'#7dffa8'})}
      S.pops.forEach(p=>txt16(x,p.s,p.x,p.y-p.t*50,{size:14,col:`rgba(255,211,107,${1-p.t})`,stroke:2}));
      if(S.gold){const a=.6+.4*Math.sin(performance.now()/150);x.save();x.globalAlpha=a;x.beginPath();x.arc(S.gold.x,S.gold.y,24,0,TAU16);x.fillStyle='#ffd36b';x.shadowColor='#ffd36b';x.shadowBlur=20;x.fill();x.restore();txt16(x,'✦',S.gold.x,S.gold.y,{size:22,col:'#5a3a00'})}
      txt16(x,'Geradores',330,40,{size:14,al:'left',col:'#ffd36b'});
      CLK_GEN.forEach((gg,i)=>{const b=genB(i),c=cost(i),ok=d.e>=c,seen=i===0||d.g[i-1]>0||d.tot>=gg[2]/2;rr16(x,b.x,b.y,b.w,b.h,8);x.fillStyle=ok?'#2e2414':'#211a14';x.fill();x.strokeStyle=ok?'#ffd36b':'#4a3f35';x.lineWidth=1.5;x.stroke();
        txt16(x,seen?gg[1]:'?',b.x+20,b.y+20,{size:18});txt16(x,seen?gg[0]:'???',b.x+40,b.y+14,{size:13,al:'left',col:ok?'#fff':'#998'});txt16(x,`${fmt17(c)} ⚗ · +${fmt17(gg[3])}/s`,b.x+40,b.y+30,{size:11,al:'left',w:500,col:'#cfc3b0'});txt16(x,String(d.g[i]),b.x+b.w-14,b.y+20,{size:18,al:'right',col:'#c39bff'})});
      txt16(x,'Melhorias de clique',646,40,{size:14,al:'left',col:'#ffd36b'});
      CLK_UP.forEach((u,i)=>{const b=upB(i),own=i<d.u,nxt=i===d.u,ok=nxt&&d.e>=u[2];rr16(x,b.x,b.y,b.w,b.h,8);x.fillStyle=own?'#1f3a26':ok?'#2e2414':'#211a14';x.fill();x.strokeStyle=own?'#7dffa8':ok?'#ffd36b':'#4a3f35';x.stroke();
        txt16(x,u[1]+' '+u[0],b.x+8,b.y+16,{size:11,al:'left',col:own?'#7dffa8':'#fff'});txt16(x,own?'comprada':`${fmt17(u[2])} ⚗ · ×${u[3]}`,b.x+8,b.y+34,{size:11,al:'left',w:500,col:'#cfc3b0'})});
      btn16(x,REG,'🏆 Registrar no placar',{size:12});
    }
  };
}

/* ===================================================================
   🥊 RINHA DE TULPAS — luta 2D melhor de 3
   A/D andam, W pula, S defende, J golpe, K especial (quando a barra de
   Inexistência enche: um raio que atravessa a arena — pule para
   desviar). PvP: o anfitrião simula a luta e manda o estado.
   =================================================================== */
function rinha(C){
  const W=800,H=450,FL=380,G=2200,JV=820,SPD=230,HP=100,ROUND=60;
  const AIK={facil:{react:.55,block:.15,aggr:.4},medio:{react:.3,block:.35,aggr:.6},dificil:{react:.16,block:.6,aggr:.75},pesadelo:{react:.07,block:.82,aggr:.9}}[C.diff]||{react:.3,block:.35,aggr:.6};
  const pvp=C.net,ps=pvp?C.players.slice(0,2):[me16(C),{u:'~p',n:'Perseus',c:-1}];
  const mk=(i)=>({x:i?560:240,y:FL,vy:0,face:i?-1:1,hp:HP,blk:false,atk:0,cool:0,meter:0,stun:0,hitT:0,inp:{},u:ps[i]?.u,n:ps[i]?.n||'?',c:ps[i]?.c??-1});
  const S={f:[mk(0),mk(1)],beams:[],round:1,wins:[0,0],t:ROUND,pause:1.6,msg:'Round 1',over:false,sendAt:0,ai:{next:0}};
  const myI=pvp?ps.findIndex(p=>p.u===C.me):0;
  const keys={};
  const inpOf=k=>({l:!!(k.KeyA||k.ArrowLeft),r:!!(k.KeyD||k.ArrowRight),j:!!(k.KeyW||k.ArrowUp||k.Space),b:!!(k.KeyS||k.ArrowDown),a:!!k.KeyJ,s:!!k.KeyK});
  function resetRound(){const w=S.wins;S.f=[mk(0),mk(1)];S.f.forEach((f,i)=>f.meter=S.keepMeter?.[i]||0);S.beams=[];S.t=ROUND;S.pause=1.6;S.msg='Round '+S.round}
  function hit(a,d,dmg,kb){if(d.blk&&Math.sign(a.x-d.x)===d.face){dmg=Math.ceil(dmg/3);d.x+=-d.face*kb*.4;fx5('click')}else{d.stun=.25;d.x+=-d.face*kb;fx5('error')}d.hp=Math.max(0,d.hp-dmg);d.hitT=performance.now();a.meter=Math.min(100,a.meter+12);d.meter=Math.min(100,d.meter+6)}
  function aiInput(f,o,now){const ai=S.ai;if(now<ai.next)return ai.inp||{};ai.next=now+AIK.react*1000*(0.6+Math.random()*.8);const dx=o.x-f.x,dist=Math.abs(dx),inp={};
    if(o.atk>0&&dist<110&&Math.random()<AIK.block){inp.b=true}
    else if(S.beams.some(b=>b.o!==1)&&Math.random()<AIK.block+.1){inp.j=true}
    else if(f.meter>=100&&Math.random()<.5){inp.s=true}
    else if(dist>70){if(Math.random()<AIK.aggr){dx>0?inp.r=true:inp.l=true}}
    else if(Math.random()<AIK.aggr)inp.a=true;else{dx>0?inp.l=true:inp.r=true}
    if(Math.random()<.05)inp.j=true;ai.inp=inp;return inp}
  function sim(dt){
    if(S.over)return;if(S.pause>0){S.pause-=dt;if(S.pause<=0)S.msg='';return}
    S.t-=dt;const now=performance.now();
    S.f.forEach((f,i)=>{const o=S.f[1-i];const inp=(!pvp&&i===1)?aiInput(f,o,now):f.inp;
      f.cool=Math.max(0,f.cool-dt);f.stun=Math.max(0,f.stun-dt);f.face=o.x>f.x?1:-1;
      f.blk=!!inp.b&&f.y>=FL&&f.stun<=0;
      if(f.atk>0){f.atk-=dt;if(f.atk<=.12&&!f.didHit){f.didHit=true;if(Math.abs(o.x-f.x)<78&&Math.abs(o.y-f.y)<70)hit(f,o,7,40)}}
      if(f.stun<=0&&!f.blk){const mv=(inp.r?1:0)-(inp.l?1:0);f.x+=mv*SPD*dt*(f.atk>0?.3:1);
        if(inp.j&&f.y>=FL){f.vy=-JV;fx5('mgJump')}
        if(inp.a&&f.cool<=0&&f.atk<=0){f.atk=.22;f.cool=.38;f.didHit=false}
        if(inp.s&&f.meter>=100){f.meter=0;S.beams.push({x:f.x+f.face*30,y:f.y-40,vx:f.face*720,o:i});fx5('activate')}}
      f.vy+=G*dt;f.y+=f.vy*dt;if(f.y>=FL){f.y=FL;f.vy=0}f.x=clamp12(f.x,30,W-30);
    });
    const [a,b]=S.f;if(Math.abs(a.x-b.x)<40&&Math.abs(a.y-b.y)<60){const m=(a.x+b.x)/2,s=a.x<b.x?-1:1;a.x=m+s*20;b.x=m-s*20}
    S.beams.forEach(bm=>{bm.x+=bm.vx*dt;const d=S.f[1-bm.o];if(!bm.hit&&Math.abs(bm.x-d.x)<24&&d.y>FL-70){bm.hit=true;hit(S.f[bm.o],d,25,90)}});
    S.beams=S.beams.filter(bm=>!bm.hit&&bm.x>-50&&bm.x<W+50);
    const ko=S.f.findIndex(f=>f.hp<=0);
    if(ko>=0||S.t<=0){const w=ko>=0?1-ko:a.hp===b.hp?-1:a.hp>b.hp?0:1;if(w>=0)S.wins[w]++;S.msg=w<0?'Empate no round':`${S.f[w].n} vence o round!`;S.keepMeter=S.f.map(f=>f.meter);
      if(S.wins[0]>=2||S.wins[1]>=2||S.round>=5){S.over=true;S.pause=99;const ww=S.wins[0]>S.wins[1]?0:S.wins[1]>S.wins[0]?1:-1;
        const rows=ps.slice(0,2).map((p,i)=>({u:p.u,n:p.n,c:p.c<0?0:p.c,s:S.wins[i],w:i===ww}));if(ww===myI){C.achieve?.('campeao');if(!pvp&&C.diff==='pesadelo')C.achieve?.('gato')}
        if(pvp)C.send('rs',{st:snap()});setTimeout(()=>C.finish({title:ww<0?'Empate na Rinha':pvp?`Vitória de ${ps[ww].n} · ${S.wins[ww]} × ${S.wins[1-ww]}`:ww===0?`Você venceu o Perseus! ${S.wins[0]} × ${S.wins[1]}`:`O Perseus venceu · ${S.wins[1]} × ${S.wins[0]}`,rows}),1400);return}
      S.round++;setTimeout(()=>{if(!S.over)resetRound()},1500);S.pause=99}
  }
  const snap=()=>({f:S.f.map(f=>({x:Math.round(f.x),y:Math.round(f.y),face:f.face,hp:f.hp,blk:f.blk,atk:+f.atk.toFixed(2),meter:f.meter,stun:+f.stun.toFixed(2)})),beams:S.beams.map(b=>({x:Math.round(b.x),y:b.y,vx:b.vx})),wins:S.wins,round:S.round,t:+S.t.toFixed(1),msg:S.msg,over:S.over});
  function sendInp(){const i=inpOf(keys);if(C.host)S.f[myI].inp=i;else C.send('ri',{inp:i})}
  return{st:()=>S,
    key(code,down){keys[code]=down;sendInp()},
    msg(p){
      if(C.host&&p.t==='ri'){const i=ps.findIndex(q=>q.u===p.from);if(i>=0)S.f[i].inp=p.inp||{}}
      if(!C.host&&p.t==='rs'&&p.from===C.room.host&&p.st){const st=p.st;st.f.forEach((g,i)=>{const f=S.f[i];if(g.hp<f.hp)f.hitT=performance.now();Object.assign(f,g)});S.beams=st.beams;S.wins=st.wins;S.round=st.round;S.t=st.t;S.msg=st.msg;S.over=st.over}
    },
    left(u){if(!C.host||S.over)return;const i=ps.findIndex(q=>q.u===u);if(i<0)return;S.f[i].hp=0;S.wins[1-i]=2;S.over=true;C.finish({title:`${ps[i].n} saiu · vitória de ${ps[1-i].n}`,rows:ps.map((p,k)=>({u:p.u,n:p.n,c:p.c<0?0:p.c,s:S.wins[k],w:k!==i}))})},
    step(dt){
      if(Date.now()<C.t0)return;
      if(C.host||!pvp){sim(dt);if(pvp&&Date.now()-S.sendAt>80){S.sendAt=Date.now();C.send('rs',{st:snap()})}}
      else{S.beams.forEach(b=>b.x+=b.vx*dt)}
      const m=S.f[myI];C.hud(`🥊 Round <b>${S.round}</b> · ${S.wins[0]} × ${S.wins[1]} · ⏱ ${Math.max(0,Math.ceil(S.t))} · ✦ ${m.meter>=100?'<b style="color:#c39bff">ESPECIAL PRONTO (K)</b>':Math.floor(m.meter)+'%'}`);
    },
    draw(x){
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a0d1f');g.addColorStop(1,'#0d0a1a');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.fillStyle='#2b1d33';x.fillRect(0,FL,W,H-FL);x.fillStyle='#c39bff';x.fillRect(0,FL,W,2);
      S.f.forEach((f,i)=>{const bx=i?W-24-300:24;x.fillStyle='#300';x.fillRect(bx,16,300,16);x.fillStyle=i?'#ff6b5b':'#7dffa8';const w=300*f.hp/HP;x.fillRect(i?bx+300-w:bx,16,w,16);x.strokeStyle='#fff';x.strokeRect(bx,16,300,16);
        x.fillStyle='#1a1030';x.fillRect(bx,36,300,6);x.fillStyle='#c39bff';x.fillRect(i?bx+300-300*f.meter/100:bx,36,300*f.meter/100,6);
        txt16(x,f.n,i?W-24:24,56,{size:13,al:i?'right':'left'});txt16(x,'●'.repeat(S.wins[i])+'○'.repeat(Math.max(0,2-S.wins[i])),i?W-24:24,74,{size:13,al:i?'right':'left',col:'#ffd36b'})});
      txt16(x,String(Math.max(0,Math.ceil(S.t))),W/2,26,{size:24,w:800});
      S.beams.forEach(b=>{const gg=x.createLinearGradient(b.x-80*Math.sign(b.vx),0,b.x,0);gg.addColorStop(0,'rgba(107,79,160,0)');gg.addColorStop(1,'#c39bff');x.fillStyle=gg;x.fillRect(Math.min(b.x,b.x-80*Math.sign(b.vx)),b.y-10,80,20);x.beginPath();x.arc(b.x,b.y,12,0,TAU16);x.fillStyle='#fff';x.fill()});
      S.f.forEach((f,i)=>{const flash=performance.now()-f.hitT<120;x.save();x.translate(f.x,f.y-34);x.scale(f.face,1);
        if(flash)x.filter='brightness(3)';const im=spr(f.c);if(im)x.drawImage(im,-34,-34,68,68);else{x.beginPath();x.arc(0,0,28,0,TAU16);x.fillStyle=mgCol(f.c);x.fill()}x.filter='none';
        if(f.atk>0){x.fillStyle='#ffd36b';x.beginPath();x.arc(46,4,10+(.22-f.atk)*40,0,TAU16);x.globalAlpha=.7;x.fill();x.globalAlpha=1}
        if(f.blk){x.strokeStyle='#7fc8ff';x.lineWidth=4;x.beginPath();x.arc(10,0,40,-1,1);x.stroke()}
        x.restore();if(i===myI&&pvp)txt16(x,'você',f.x,f.y-82,{size:11,col:'#ffd36b'})});
      if(S.msg)txt16(x,S.msg,W/2,H/2-40,{size:30,w:800,col:'#ffd36b',stroke:5});
    }
  };
}

/* ===================================================================
   🏎 CORRIDA DO VÉU — corrida vista de cima, 3 voltas
   W acelera, S freia, A/D viram, E usa o item. Caixas de Ritual dão
   Fumaça (embaça a tela de todos à frente), Raízes (armadilha no
   chão) ou Impulso. Fora da pista o carro fica lento.
   Solo: contra 3 Perseus. Mesa: todos correm juntos (fantasmas).
   =================================================================== */
const TRACKS17=[
  [[300,250],[700,180],[1150,230],[1400,450],[1300,780],[950,850],[750,620],[500,820],[220,700],[160,450]],
  [[250,200],[650,150],[900,380],[1250,200],[1450,500],[1200,850],[800,700],[450,900],[180,650]],
  [[400,180],[1000,160],[1420,320],[1250,560],[1430,820],[900,900],[620,700],[300,880],[150,520]],
];
function corrida(C){
  const W=800,H=450,TW=120,LAPS=3,WW=1600,WH=1050;
  const ctrl=TRACKS17[C.seed%TRACKS17.length];
  /* linha central suave (Catmull-Rom) */
  const pts=[];const n=ctrl.length;for(let i=0;i<n;i++){const p0=ctrl[(i-1+n)%n],p1=ctrl[i],p2=ctrl[(i+1)%n],p3=ctrl[(i+2)%n];for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;pts.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  const N=pts.length;
  const off=document.createElement('canvas');off.width=WW;off.height=WH;{const o=off.getContext('2d');o.fillStyle='#173322';o.fillRect(0,0,WW,WH);
    for(let i=0;i<400;i++){o.fillStyle=`rgba(0,0,0,${Math.random()*.15})`;o.fillRect(Math.random()*WW,Math.random()*WH,6,6)}
    o.lineJoin='round';o.lineCap='round';o.beginPath();pts.forEach((p,i)=>i?o.lineTo(...p):o.moveTo(...p));o.closePath();
    o.strokeStyle='#e8e0f0';o.lineWidth=TW+12;o.stroke();o.strokeStyle='#3a3046';o.lineWidth=TW;o.stroke();
    o.setLineDash([18,18]);o.strokeStyle='rgba(255,255,255,.25)';o.lineWidth=3;o.stroke();o.setLineDash([]);
    const [a,b]=[pts[0],pts[1]],ang=Math.atan2(b[1]-a[1],b[0]-a[0]);o.save();o.translate(...a);o.rotate(ang);for(let k=-6;k<6;k++){o.fillStyle=k%2?'#fff':'#111';o.fillRect(-6,k*10,12,10)}o.restore()}
  function nearest(x,y,hint){let best=hint,bd=1e9;const r=hint==null?N:40;for(let k=-r;k<=r;k++){const i=hint==null?k+r:((hint+k)%N+N)%N;if(i<0||i>=N)continue;const p=pts[i],d=(p[0]-x)**2+(p[1]-y)**2;if(d<bd){bd=d;best=i}}return[best,Math.sqrt(bd)]}
  const ang0=Math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]);
  const car=(u,n,c,k,bot)=>{const px=-Math.sin(ang0),py=Math.cos(ang0),lane=(k%2?1:-1)*28,back=Math.floor(k/2)*46+30;return{u,n,c,bot,x:pts[0][0]-Math.cos(ang0)*back+px*lane,y:pts[0][1]-Math.sin(ang0)*back+py*lane,a:ang0,v:0,idx:N-2,prog:-2,lap:0,done:false,ft:0,item:null,boost:0,slow:0,smoke:0}};
  const racers=C.net?C.players.map((p,k)=>car(p.u,p.n,p.c,k,false)):[car(C.me,me16(C).n,me16(C).c,0,false),...[1,2,3].map(k=>car('~k'+k,['Perseus Veloz','Perseus Turbo','Perseus Sonolento'][k-1],-1,k,true))];
  const me=racers.find(r=>r.u===C.me)||racers[0];
  const boxes=[.15,.4,.65,.88].map(f=>{const i=Math.floor(f*N);return[-30,0,30].map(o=>{const p=pts[i],q=pts[(i+1)%N],a=Math.atan2(q[1]-p[1],q[0]-p[0]);return{x:p[0]-Math.sin(a)*o,y:p[1]+Math.cos(a)*o,t:0}})}).flat();
  const S={t:0,traps:[],keys:{},gh:{},fin:{},sendAt:0,cam:[me.x,me.y],closed:false,msg:'',msgT:0};
  S.pts=pts;S.me=me;S.racers=racers;
  const BOT=gdPick(C.gd,[.82,.9,.97,1.04]);
  const VMAX=320;
  function flash(m){S.msg=m;S.msgT=performance.now()}
  function useItem(r){if(!r.item)return;const it=r.item;r.item=null;
    if(it==='boost'){r.boost=1.6;if(r===me)fx5('activate')}
    if(it==='roots'){const t={x:r.x-Math.cos(r.a)*40,y:r.y-Math.sin(r.a)*40,o:r.u,life:25};S.traps.push(t);if(r===me&&C.net)C.send('kit',{k:'roots',x:t.x,y:t.y})}
    if(it==='smoke'){racers.forEach(o=>{if(o!==r&&o.bot&&total(o)>total(r))o.slow=1.5});if(r===me){fx5('activate');if(C.net)C.send('kit',{k:'smoke',p:total(r)})}}}
  const total=r=>r.lap*N+r.prog;
  function drive(r,inp,dt){
    if(r.done){r.v*=.97;r.x+=Math.cos(r.a)*r.v*dt;r.y+=Math.sin(r.a)*r.v*dt;return}
    const[idx,dist]=nearest(r.x,r.y,r.idx);const offroad=dist>TW/2;
    let d=idx-r.idx;if(d<-N/2)d+=N;if(d>N/2)d-=N;r.idx=idx;r.prog+=d;if(r.prog>=N){r.prog-=N;r.lap++;if(r===me&&r.lap<LAPS){flash(`Volta ${r.lap+1} de ${LAPS}`);fx5('confirm')}
      if(r.lap>=LAPS){r.done=true;r.ft=S.t;if(r===me){fx5('mgWin');finishMe()}}}
    r.boost=Math.max(0,r.boost-dt);r.slow=Math.max(0,r.slow-dt);
    const vmax=(offroad?130:VMAX)*(r.boost>0?1.45:1)*(r.slow>0?.55:1)*(r.bot?BOT:1);
    if(inp.up)r.v+=420*dt;else if(inp.dn)r.v-=520*dt;else r.v*=1-1.2*dt;
    r.v=clamp12(r.v,-110,vmax);if(r.v>vmax)r.v=vmax;
    const steer=(inp.r?1:0)-(inp.l?1:0);r.a+=steer*2.8*dt*clamp12(Math.abs(r.v)/160,0,1)*Math.sign(r.v||1);
    r.x+=Math.cos(r.a)*r.v*dt;r.y+=Math.sin(r.a)*r.v*dt;r.x=clamp12(r.x,10,WW-10);r.y=clamp12(r.y,10,WH-10);
    boxes.forEach(b=>{if(b.t<=0&&Math.hypot(b.x-r.x,b.y-r.y)<22){b.t=6;if(!r.item){r.item=pick12(['boost','roots','smoke']);if(r===me){fx5('mgCoin');flash({boost:'🎁 Impulso!',roots:'🎁 Raízes!',smoke:'🎁 Fumaça!'}[r.item])}}}});
    S.traps.forEach(t=>{if(t.o!==r.u&&!t.hit&&Math.hypot(t.x-r.x,t.y-r.y)<24){t.hit=true;r.slow=1.4;r.v*=.4;if(r===me){fx5('error');flash('Preso nas raízes!')}}});
  }
  function botInp(r){const look=pts[(r.idx+8+Math.floor(Math.random()*2))%N],ta=Math.atan2(look[1]-r.y,look[0]-r.x);let da=ta-r.a;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;if(r.item&&Math.random()<.01)useItem(r);return{up:true,l:da<-.06,r:da>.06}}
  function finishMe(){if(!C.net){const ord=racers.slice().sort((a,b)=>(b.done-a.done)||(a.done?a.ft-b.ft:total(b)-total(a)));const pos=ord.indexOf(me)+1;if(pos===1)C.achieve?.('piloto');
      setTimeout(()=>C.finish({title:pos===1?`1º lugar! ${me.ft.toFixed(1)} s`:`Você chegou em ${pos}º · ${me.ft.toFixed(1)} s`,rows:ord.map((r,k)=>({u:r.u,n:r.n,c:r.c<0?0:r.c,s:Math.max(0,Math.round(4000-(r.done?r.ft:S.t+30)*20)),w:k===0}))}),1500);return}
    flash('Chegada!');C.send('kfin',{t:me.ft});S.fin[C.me]=me.ft;check()}
  function check(){if(!C.host||S.closed)return;const all=C.players.every(p=>p.u in S.fin);const anyFin=Object.keys(S.fin).length;if(!all&&!(anyFin&&S.t-Math.min(...Object.values(S.fin))>45))return;S.closed=true;
    const rows=C.players.map(p=>({u:p.u,n:p.n,c:p.c,t:S.fin[p.u]})).sort((a,b)=>(a.t??1e9)-(b.t??1e9));if(rows[0].u===C.me)C.achieve?.('piloto');
    C.finish({title:`Vitória de ${rows[0].n} · ${rows[0].t?.toFixed(1)} s`,rows:rows.map((r,k)=>({u:r.u,n:r.n,c:r.c,s:r.t!=null?Math.max(0,Math.round(4000-r.t*20)):0,w:k===0}))})}
  return{st:()=>S,
    key(code,down){S.keys[code]=down;if(down&&(code==='KeyE'||code==='Space'))useItem(me)},
    msg(p){
      if(p.t==='pos'&&p.from!==C.me)S.gh[p.from]={...p,at:Date.now()};
      if(p.t==='kit'&&p.from!==C.me){if(p.k==='roots')S.traps.push({x:p.x,y:p.y,o:p.from,life:25});if(p.k==='smoke'&&total(me)<p.p){me.smoke=3;flash('Fumaça! Alguém à frente te cegou.')}}
      if(p.t==='kfin'){S.gh[p.from]={...(S.gh[p.from]||{}),done:true};if(C.host){S.fin[p.from]=Number(p.t)||999;check()}}
    },
    left(u){if(C.host){S.fin[u]=S.fin[u]??null;C.players=C.players.filter(p=>p.u!==u);check()}},
    step(dt){
      if(Date.now()<C.t0)return;S.t+=dt;const k=S.keys;
      drive(me,{up:k.KeyW||k.ArrowUp,dn:k.KeyS||k.ArrowDown,l:k.KeyA||k.ArrowLeft,r:k.KeyD||k.ArrowRight},dt);
      racers.forEach(r=>{if(r.bot)drive(r,botInp(r),dt)});
      boxes.forEach(b=>b.t=Math.max(0,b.t-dt));S.traps=S.traps.filter(t=>!t.hit&&(t.life-=dt)>0);me.smoke=Math.max(0,me.smoke-dt);
      if(C.net&&Date.now()-S.sendAt>100){S.sendAt=Date.now();C.send('pos',{x:Math.round(me.x),y:Math.round(me.y),a:+me.a.toFixed(2),p:total(me)})}
      if(C.host&&C.net)check();
      S.cam[0]+=(me.x-S.cam[0])*Math.min(1,dt*6);S.cam[1]+=(me.y-S.cam[1])*Math.min(1,dt*6);
      const all=[...racers.filter(r=>!C.net||r===me).map(r=>[r.u,total(r),r.done,r.ft]),...Object.entries(S.gh).map(([u,g])=>[u,g.done?1e9:g.p||0,g.done])];
      const pos=all.sort((a,b)=>(b[2]-a[2])||(a[2]?a[3]-b[3]:b[1]-a[1])).findIndex(a=>a[0]===C.me)+1;
      C.hud(`🏎 Volta <b>${Math.min(LAPS,me.lap+1)}</b>/${LAPS} · <b>${pos}º</b> de ${all.length} · ⏱ ${S.t.toFixed(1)} s · 🎁 ${me.item?{boost:'Impulso',roots:'Raízes',smoke:'Fumaça'}[me.item]+' (E)':'—'}`);
    },
    draw(x){
      const cx=clamp12(S.cam[0]-W/2,0,WW-W),cy=clamp12(S.cam[1]-H/2,0,WH-H);x.drawImage(off,cx,cy,W,H,0,0,W,H);x.save();x.translate(-cx,-cy);
      boxes.forEach(b=>{if(b.t>0)return;x.save();x.translate(b.x,b.y);x.rotate(performance.now()/500);rr16(x,-10,-10,20,20,4);x.fillStyle='#c39bff';x.fill();x.restore();txt16(x,'?',b.x,b.y,{size:12})});
      S.traps.forEach(t=>txt16(x,'🌿',t.x,t.y,{size:24}));
      const carD=(r,al=1)=>{x.save();x.globalAlpha=al;x.translate(r.x,r.y);x.rotate(r.a);rr16(x,-16,-10,32,20,6);x.fillStyle=mgCol(r.c);x.fill();x.fillStyle='rgba(0,0,0,.4)';x.fillRect(4,-8,8,16);if(r.boost>0){x.fillStyle='#ffd36b';x.fillRect(-26,-4,10,8)}x.restore();sprAt16(x,r.c,r.x,r.y,26,0,al)};
      for(const u in S.gh){const g=S.gh[u];const p=C.players.find(q=>q.u===u);if(!p)continue;carD({x:g.x,y:g.y,a:g.a||0,c:p.c,boost:0},.5);if(MG.drawn)MG.drawn[p.n]=.5;txt16(x,p.n,g.x,g.y-24,{size:11,stroke:3})}
      racers.forEach(r=>{if(C.net&&r!==me)return;carD(r);if(r!==me)txt16(x,r.n,r.x,r.y-24,{size:10,stroke:3,col:'#ddd'})});
      x.restore();
      if(me.smoke>0){x.fillStyle=`rgba(60,50,70,${Math.min(.85,me.smoke/2)})`;x.fillRect(0,0,W,H)}
      if(S.msg&&performance.now()-S.msgT<1800)txt16(x,S.msg,W/2,60,{size:22,w:800,col:'#ffd36b',stroke:4});
      /* minimapa */
      const ms=.1;x.fillStyle='rgba(0,0,0,.4)';x.fillRect(W-WW*ms-10,10,WW*ms,WH*ms);x.beginPath();pts.forEach((p,i)=>i?x.lineTo(W-WW*ms-10+p[0]*ms,10+p[1]*ms):x.moveTo(W-WW*ms-10+p[0]*ms,10+p[1]*ms));x.closePath();x.strokeStyle='#aaa';x.lineWidth=2;x.stroke();
      [...racers.filter(r=>!C.net||r===me),...Object.values(S.gh)].forEach(r=>{x.beginPath();x.arc(W-WW*ms-10+r.x*ms,10+r.y*ms,r===me?4:3,0,TAU16);x.fillStyle=r===me?'#ffd36b':'#ff6b5b';x.fill()});
    }
  };
}

defineArcadeGame('uno',{name:'UNO Teosófico',ico:'🃏',modes:['solo','mesa'],max:6,rec:true,unit:'pts',W:800,H:450,solo:'🎯 Contra 3 Perseus',
  desc:'Cartas dos 5 Elementos. ⊘ pula, ⇄ inverte, +2 e +4 fazem comprar e tiram Lucidez. Zerou a Lucidez, colapsou.',
  rule:'Na mesa, faltando gente, Perseus completam os lugares. 25 s por vez.',keys:'Clique na carta · Espaço compra/passa',touch:'Toque na carta para jogar · toque no monte para comprar',make:uno});
defineArcadeGame('clicker',{name:'Teosofia Clicker',ico:'📖',modes:['solo'],max:1,rec:true,unit:'⚗',W:800,H:450,
  desc:'Clique no tomo, compre Suturas, Cultistas e Tulpas. O progresso fica salvo e rende até 8 h fora.',keys:'Clique (ou Espaço) no tomo',touch:'Toque no tomo',make:clicker});
defineArcadeGame('rinha',{name:'Rinha de Tulpas',ico:'🥊',modes:['ai','pvp'],max:2,rec:true,unit:'rounds',W:800,H:450,pad:'fight',
  desc:'Luta 2D melhor de 3: golpe, defesa, pulo e o raio de Inexistência quando a barra enche.',keys:'A/D andam · W pula · S defende · J golpe · K especial',touch:'',make:rinha});
defineArcadeGame('corrida',{name:'Corrida do Véu',ico:'🏎',modes:['solo','mesa'],max:6,rec:true,unit:'pts',W:800,H:450,pad:'kart',solo:'🎯 Contra 3 Perseus',
  desc:'Corrida de 3 voltas vista de cima. Caixas de Ritual dão Fumaça, Raízes ou Impulso.',keys:'W acelera · S freia · A/D viram · E usa o item',touch:'',make:corrida});


