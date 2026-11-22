/* ===================================================================
   TULPA · ETAPA 21 — TRÊS JOGOS NOVOS NO ARCADE
   🔢 Sudoku Teosófico · 🦖 Corredor do Vazio · 🧱 Block Blast Astral
   Todos usam o contrato defineArcadeGame (t15) e a camada C.fx (t20).
   =================================================================== */
const UI21='"IBM Plex Sans",system-ui,sans-serif';
function t21(x,s,X,Y,{size=16,w=700,col='#fff',al='center',bl='middle',stroke=0}={}){x.font=`${w} ${size}px ${UI21}`;x.textAlign=al;x.textBaseline=bl;if(stroke){x.lineWidth=stroke;x.strokeStyle='rgba(0,0,0,.6)';x.strokeText(s,X,Y)}x.fillStyle=col;x.fillText(s,X,Y)}
function rr21(x,X,Y,w,h,r){x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h)}
const me21=C=>C.players.find(p=>p.u===C.me)||C.players[0]||{n:'Você',c:0};
const mmss21=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
{const _pad21=padHtml;padHtml=function(p){
  const b=(k,l,cls='')=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${l}">${l}</button>`;
  if(p==='jd')return`<div>${b('ArrowDown','⤓ Agachar','wide')}</div><div>${b('Space','⤒ Pular','wide')}</div>`;
  return _pad21(p);
}}

/* ===================================================================
   🔢 SUDOKU TEOSÓFICO
   Gerador com semente: preenche a grade inteira com backtracking e tira
   números um a um, só quando a solução continua única.
   Fácil 40 pistas · Médio 32 · Difícil 26 · Pesadelo 23.
   =================================================================== */
function sdkSolve21(g,limit=2){
  const a=g.slice(),rows=Array(9).fill(0),cols=Array(9).fill(0),box=Array(9).fill(0);let n=0;
  for(let i=0;i<81;i++){const v=a[i];if(v){const b=1<<v,r=i/9|0,c=i%9,q=(r/3|0)*3+(c/3|0);if(rows[r]&b||cols[c]&b||box[q]&b)return 0;rows[r]|=b;cols[c]|=b;box[q]|=b}}
  const bits=m=>{let k=0;while(m){m&=m-1;k++}return k};
  function rec(){
    let best=-1,bm=0,bc=10;
    for(let i=0;i<81;i++){if(a[i])continue;const r=i/9|0,c=i%9,q=(r/3|0)*3+(c/3|0),m=~(rows[r]|cols[c]|box[q])&0x3FE,k=bits(m);if(k<bc){bc=k;best=i;bm=m;if(k<=1)break}}
    if(best<0){n++;return n>=limit}
    if(!bc)return false;
    const r=best/9|0,c=best%9,q=(r/3|0)*3+(c/3|0);
    for(let v=1;v<=9;v++){const b=1<<v;if(!(bm&b))continue;a[best]=v;rows[r]|=b;cols[c]|=b;box[q]|=b;if(rec())return true;a[best]=0;rows[r]&=~b;cols[c]&=~b;box[q]&=~b}
    return false;
  }
  rec();return n;
}
function sdkGen21(seed,clues){
  const rnd=mb32(seed>>>0||1),sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const g=Array(81).fill(0);
  const ok=(i,v)=>{const r=i/9|0,c=i%9;for(let k=0;k<9;k++){if(g[r*9+k]===v||g[k*9+c]===v)return false}const br=(r/3|0)*3,bc=(c/3|0)*3;for(let y=0;y<3;y++)for(let x=0;x<3;x++)if(g[(br+y)*9+bc+x]===v)return false;return true};
  (function fill(i){if(i>=81)return true;for(const v of sh([1,2,3,4,5,6,7,8,9])){if(ok(i,v)){g[i]=v;if(fill(i+1))return true;g[i]=0}}return false})(0);
  const sol=g.slice(),puz=g.slice();let left=81;
  for(const i of sh([...Array(81).keys()])){if(left<=clues)break;const v=puz[i];puz[i]=0;if(sdkSolve21(puz,2)!==1)puz[i]=v;else left--}
  return{sol,puz};
}
T3.sdkGen=sdkGen21;T3.sdkSolve=sdkSolve21;
function sudoku(C){
  const W=480,H=720,X0=15,Y0=15,CS=50,clues=gdPick(C.gd,[40,32,26,23]),LV=gdPick(C.gd,['Fácil','Médio','Difícil','Pesadelo']),BASE=gdPick(C.gd,[700,1100,1700,2300]);
  const {sol,puz}=sdkGen21(C.seed,clues);
  const S={v:puz.slice(),given:puz.map(v=>!!v),notes:Array.from({length:81},()=>new Set()),sel:puz.findIndex(v=>!v),pen:false,err:0,hints:3,used:0,t:0,done:false,hist:[],wrong:new Set(),lines:new Set(),pulse:{}};
  const me=me21(C);
  const PADY=482,ACTY=552,ACTW=106,ACTG=10;
  const ACT=[['pen','✏ Lápis'],['del','⌫ Apagar'],['hint','💡 Dica'],['undo','↶ Desfazer']];
  const peers=i=>{const r=i/9|0,c=i%9,br=(r/3|0)*3,bc=(c/3|0)*3,o=new Set();for(let k=0;k<9;k++){o.add(r*9+k);o.add(k*9+c)}for(let y=0;y<3;y++)for(let x=0;x<3;x++)o.add((br+y)*9+bc+x);o.delete(i);return o};
  const cellXY=i=>[X0+(i%9)*CS,Y0+(i/9|0)*CS];
  const count=v=>S.v.filter((q,i)=>q===v&&!S.wrong.has(i)).length;
  function push(){S.hist.push({v:S.v.slice(),n:S.notes.map(s=>[...s]),w:[...S.wrong]});if(S.hist.length>60)S.hist.shift()}
  function groupsDone(i){
    const r=i/9|0,c=i%9,q=(r/3|0)*3+(c/3|0),okG=ids=>ids.every(k=>S.v[k]===sol[k]);
    const R=[...Array(9).keys()].map(k=>r*9+k),Cc=[...Array(9).keys()].map(k=>k*9+c),B=[...Array(9).keys()].map(k=>((q/3|0)*3+(k/3|0))*9+(q%3)*3+k%3);
    let n=0;[['r'+r,R],['c'+c,Cc],['b'+q,B]].forEach(([key,ids])=>{if(!S.lines.has(key)&&okG(ids)){S.lines.add(key);n++;ids.forEach((k,j)=>{S.pulse[k]=performance.now()+j*35;const [cx,cy]=cellXY(k);setTimeout(()=>C.fx?.burst(cx+CS/2,cy+CS/2,{n:5,col:['#ffd36b','#b48cff','#7fe3ff'],kind:'star',sp:120,life:.6,size:3,grav:80}),j*35)})}});
    return n;
  }
  function place(v){
    if(S.done||S.sel<0||S.given[S.sel])return;const i=S.sel;
    if(S.pen){if(S.v[i])return;push();const s=S.notes[i];if(s.has(v))s.delete(v);else s.add(v);fx5('click');return}
    if(S.v[i]===v&&!S.wrong.has(i))return;
    push();S.v[i]=v;S.notes[i].clear();const [cx,cy]=cellXY(i);
    if(v!==sol[i]){S.wrong.add(i);S.err++;fx5('error');C.fx?.shake(4,.2);C.fx?.float(cx+CS/2,cy+6,'✗',{col:'#ff6b6b',size:22});return}
    S.wrong.delete(i);peers(i).forEach(k=>S.notes[k].delete(v));
    fx5('mgCoin');C.fx?.burst(cx+CS/2,cy+CS/2,{n:8,col:['#ffd36b','#fff'],sp:110,life:.45,size:2.4,grav:0});
    const g=groupsDone(i);if(g){fx5('bb'+Math.min(7,2+g*2));C.fx?.float(W/2,Y0+CS*4.5,g>1?`${g} GRUPOS!`:'COMPLETO!',{col:'#ffd36b',size:30,life:1.1});C.fx?.shake(2+g,.2)}
    if(count(v)===9)C.fx?.float(X0+(v-1)*CS+CS/2,PADY-8,'✓',{col:'#7dffa8',size:20});
    if(S.v.every((q,k)=>q===sol[k]))win();
  }
  function erase(){if(S.done||S.sel<0||S.given[S.sel])return;const i=S.sel;if(!S.v[i]&&!S.notes[i].size)return;push();S.v[i]=0;S.notes[i].clear();S.wrong.delete(i);fx5('click')}
  function hint(){
    if(S.done)return;if(S.hints<=0){C.say('Sem dicas. A Verdade agora é com você.',false);return}
    let i=S.sel>=0&&!S.given[S.sel]&&S.v[S.sel]!==sol[S.sel]?S.sel:S.v.findIndex((q,k)=>q!==sol[k]);if(i<0)return;
    S.hints--;S.used++;S.sel=i;const p=S.pen;S.pen=false;place(sol[i]);S.pen=p;S.given[i]=true;fx5('activate');
  }
  function undo(){const h=S.hist.pop();if(!h||S.done)return;S.v=h.v;S.notes=h.n.map(a=>new Set(a));S.wrong=new Set(h.w);fx5('click')}
  function win(){
    S.done=true;const score=Math.max(50,Math.round(BASE-S.t-S.err*40-S.used*120));
    fx5('mgWin');C.fx?.flash('#fff3c0',.4);for(let k=0;k<6;k++)setTimeout(()=>C.fx?.burst(60+Math.random()*360,80+Math.random()*360,{n:18,col:['#ffd36b','#b48cff','#7fe3ff','#ff8fb1'],kind:'star',sp:220,life:1,size:4}),k*140);
    if(C.gd==='dificil'||C.gd==='pesadelo')C.achieve?.('sudoku');
    setTimeout(()=>C.finish({title:`Sudoku ${LV} resolvido em ${mmss21(S.t)}${S.err?` · ${S.err} erro${S.err>1?'s':''}`:' · sem erros!'}`,rows:[{u:C.me,n:me.n,c:me.c,s:score,w:true}]}),1100);
  }
  function move(dx,dy){if(S.sel<0)S.sel=0;const r=clamp12((S.sel/9|0)+dy,0,8),c=clamp12(S.sel%9+dx,0,8);S.sel=r*9+c}
  function hitBtn(px,py){
    if(py>=PADY&&py<=PADY+56){const k=Math.floor((px-X0)/CS);if(k>=0&&k<9)return['n',k+1]}
    if(py>=ACTY&&py<=ACTY+50){const k=Math.floor((px-X0)/(ACTW+ACTG));if(k>=0&&k<4&&px-X0-k*(ACTW+ACTG)<=ACTW)return['a',ACT[k][0]]}
    return null;
  }
  return{
    st:()=>S,sol:()=>sol,
    key(code,down){if(!down||Date.now()<C.t0)return;
      const m=code.match(/^(?:Digit|Numpad)([0-9])$/);if(m){const v=+m[1];if(v)place(v);else erase();return}
      if(code==='ArrowLeft'||code==='KeyA')move(-1,0);else if(code==='ArrowRight'||code==='KeyD')move(1,0);else if(code==='ArrowUp'||code==='KeyW')move(0,-1);else if(code==='ArrowDown'||code==='KeyS')move(0,1);
      else if(code==='Backspace'||code==='Delete')erase();else if(code==='KeyN'||code==='KeyP'){S.pen=!S.pen;fx5('click')}else if(code==='KeyH')hint();else if(code==='KeyZ'||code==='KeyU')undo()},
    ptr(t,px,py){if(t!=='down'||Date.now()<C.t0)return;
      if(px>=X0&&px<X0+9*CS&&py>=Y0&&py<Y0+9*CS){S.sel=Math.floor((py-Y0)/CS)*9+Math.floor((px-X0)/CS);fx5('click');return}
      const b=hitBtn(px,py);if(!b)return;if(b[0]==='n')place(b[1]);else if(b[1]==='pen'){S.pen=!S.pen;fx5('click')}else if(b[1]==='del')erase();else if(b[1]==='hint')hint();else undo()},
    step(dt){if(Date.now()<C.t0||S.done)return;S.t+=dt;C.hud(`🔢 <b>${LV}</b> · ⏱ <b>${mmss21(S.t)}</b> · ✗ ${S.err} erro${S.err===1?'':'s'} · 💡 ${S.hints}${S.pen?' · ✏ lápis ligado':''}`)},
    draw(x){
      const now=performance.now();x.fillStyle='#14101c';x.fillRect(0,0,W,H);
      const sv=S.sel>=0?S.v[S.sel]:0,sr=S.sel>=0?S.sel/9|0:-1,sc=S.sel%9,sq=S.sel>=0?(sr/3|0)*3+(sc/3|0):-1;
      rr21(x,X0-4,Y0-4,9*CS+8,9*CS+8,10);x.fillStyle='#f4ead6';x.fill();
      for(let i=0;i<81;i++){const r=i/9|0,c=i%9,q=(r/3|0)*3+(c/3|0),[cx,cy]=cellXY(i);
        let bg=(q%2)?'#efe2c8':'#f8f0de';
        if(S.sel>=0&&(r===sr||c===sc||q===sq))bg='#e2d3f5';
        if(sv&&S.v[i]===sv&&!S.wrong.has(i))bg='#c9b0f2';
        if(i===S.sel)bg='#ffd36b';
        if(S.wrong.has(i))bg=i===S.sel?'#ffb3a8':'#ffd6d1';
        const pu=S.pulse[i];if(pu&&now>pu&&now<pu+450){const k=1-(now-pu)/450;bg=`rgba(255,211,107,${.4+k*.6})`}
        x.fillStyle=bg;x.fillRect(cx,cy,CS,CS);
        const v=S.v[i];
        if(v)t21(x,String(v),cx+CS/2,cy+CS/2+1,{size:28,w:S.given[i]?800:600,col:S.wrong.has(i)?'#c0182c':S.given[i]?'#1b1424':'#5b2fa8'});
        else if(S.notes[i].size){x.font=`600 12px ${UI21}`;x.textAlign='center';x.textBaseline='middle';S.notes[i].forEach(n=>{const nx=cx+((n-1)%3)*15+10,ny=cy+Math.floor((n-1)/3)*14+11;x.fillStyle=n===sv?'#5b2fa8':'#6b5a7a';x.fillText(n,nx,ny)})}
      }
      x.strokeStyle='#b6a48a';x.lineWidth=1;for(let k=1;k<9;k++){if(k%3===0)continue;x.beginPath();x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS);x.stroke()}
      x.strokeStyle='#2a1c14';x.lineWidth=3;for(let k=0;k<=9;k+=3){x.beginPath();x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS);x.stroke()}
      /* teclado de números */
      for(let v=1;v<=9;v++){const bx=X0+(v-1)*CS+3,full=count(v)>=9;rr21(x,bx,PADY,CS-6,56,10);x.fillStyle=full?'#2a2236':v===sv?'#5b2fa8':'#2f2442';x.fill();
        t21(x,String(v),bx+(CS-6)/2,PADY+24,{size:26,w:800,col:full?'#5d5370':'#fff'});t21(x,full?'✓':String(9-count(v)),bx+(CS-6)/2,PADY+46,{size:11,w:600,col:full?'#7dffa8':'#c9b995'})}
      ACT.forEach(([k,l],i)=>{const bx=X0+i*(ACTW+ACTG);rr21(x,bx,ACTY,ACTW,50,12);x.fillStyle=k==='pen'&&S.pen?'#ffd36b':'#2f2442';x.fill();
        t21(x,k==='hint'?`💡 Dica (${S.hints})`:l,bx+ACTW/2,ACTY+25,{size:15,w:700,col:k==='pen'&&S.pen?'#1b1424':'#f4ead6'})});
      t21(x,S.pen?'✏ Lápis ligado: os números viram anotações pequenas.':'Toque numa casa e depois num número.',W/2,ACTY+80,{size:13,w:500,col:'#c9b995'});
      t21(x,`⏱ ${mmss21(S.t)}   ✗ ${S.err}   ${LV}`,W/2,H-30,{size:18,w:800,col:'#f4ead6'});
    }
  };
}

/* ===================================================================
   🦖 CORREDOR DO VAZIO (estilo Dino Runner)
   Obstáculos e orbes saem da semente: todos correm na mesma pista.
   Ciclo dia/noite a cada 500 m (as cores se invertem no escuro),
   aceleração contínua, escudo e câmera lenta no meio da corrida.
   =================================================================== */
function runner(C){
  const W=800,H=320,GY=262,CX=118,G=2300,JV=-760,
    V0=gdPick(C.gd,[300,340,380,420]),AC=gdPick(C.gd,[8,10,12.5,15]),VM=gdPick(C.gd,[680,800,920,1040]),FLY=gdPick(C.gd,[.18,.26,.32,.38]);
  const S={y:0,vy:0,duck:false,dk:false,d:0,t:0,orbs:0,score:0,sh:0,inv:0,slow:0,taken:new Set(),pw:new Set(),runT:0,land:0,mile:0},R=ghostRace(C,S);
  const me=me21(C);
  const vAt=d=>Math.min(VM,Math.sqrt(V0*V0+2*AC*d));
  const OB=[];
  function ob(i){
    while(OB.length<=i){const j=OB.length,r=k=>hrand(C.seed,j,k),prev=OB[j-1],px=prev?prev.x+prev.w:700,v=vAt(px);
      const gap=v*(.62+r(1)*.95)+150+(j<3?260:0);let o={x:px+gap,i:j};
      if(j>4&&r(2)<FLY){const h=r(3)<.5?'low':'mid';o={...o,k:'fly',w:46,h:26,y:h==='low'?GY-24:GY-48,hi:h}}
      else{const n=1+Math.floor(r(4)*(C.gd==='facil'?2:3)),tall=r(5)<.22&&j>8;o={...o,k:tall?'totem':'cris',n,w:tall?30:18*n+(n-1)*4,h:tall?66:30+Math.floor(r(6)*20)}}
      const pr=r(7);o.orb=pr<.42?{dx:-gap*.5,dy:-60-Math.floor(r(8)*60),n:3+Math.floor(r(9)*3)}:null;
      o.pw=j>10&&r(10)<.09?{k:r(11)<.5?'sh':'sl',dx:-gap*.42,dy:-70}:null;
      OB.push(o)}
    return OB[i];
  }
  const day=m=>{const p=(m%1000)/1000;const tr=x=>clamp12(x,0,1);return p<.45?0:p<.5?tr((p-.45)/.05):p<.95?1:1-tr((p-.95)/.05)};
  const mix=(a,b,k)=>{const pa=a.match(/\w\w/g).map(h=>parseInt(h,16)),pb=b.match(/\w\w/g).map(h=>parseInt(h,16));return'#'+pa.map((v,i)=>Math.round(v+(pb[i]-v)*k).toString(16).padStart(2,'0')).join('')};
  const jump=()=>{if(S.dead||Date.now()<C.t0)return;if(S.y>=-1){S.vy=JV;fx5('mgJump');C.fx?.burst(CX,GY,{n:6,col:'#b8a88a',sp:90,life:.35,size:2,grav:200,ang:-Math.PI/2,spread:1.4})}};
  const hitbox=()=>S.dk?{x:CX-26,y:GY+S.y-28,w:52,h:28}:{x:CX-18,y:GY+S.y-50,w:36,h:50};
  const meters=()=>Math.floor(S.d/40);
  const score=()=>meters()+S.orbs*10;
  function die(){if(S.inv>0)return;if(S.sh>0){S.sh--;S.inv=1.2;fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(CX,GY-90,'🛡 ESCUDO!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.25);return}
    C.fx?.shake(12,.45);C.fx?.burst(CX,GY+S.y-25,{n:26,col:['#b48cff','#ffd36b','#fff'],sp:260,life:.8,size:3.4,grav:500});
    if(meters()>=1500)C.achieve?.('corredor');R.die(score());C.say(pick12(['O Vazio cobra pedágio.','Tropeçou na Inexistência. Clássico.','Corre mais da próxima vez. Ou pula. Pular ajuda.']),false)}
  return{
    st:()=>S,ob,
    key(code,down){if(code==='Space'||code==='ArrowUp'||code==='KeyW'){if(down)jump()}else if(code==='ArrowDown'||code==='KeyS')S.duck=!!down},
    ptr(t,px,py){if(t==='down'){if(py>H*.62)S.duck=true;else jump()}if(t==='up')S.duck=false},
    step(dt){
      const now=Date.now();if(now<C.t0){S.runT+=dt;return}
      if(S.dead){S.cam=S.d;for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=vAt(g.d)*dt}return}
      S.t+=dt;S.runT+=dt;S.slow=Math.max(0,S.slow-dt);S.inv=Math.max(0,S.inv-dt);
      const v=vAt(S.d)*(S.slow>0?.6:1);S.d+=v*dt;
      for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=vAt(g.d)*dt}
      const air=S.y<-1;S.dk=S.duck;
      S.vy+=G*(S.duck&&air?2.6:1)*dt;S.y=Math.min(0,S.y+S.vy*dt);if(S.y>=0){if(S.vy>300){S.land=.15;C.fx?.burst(CX,GY,{n:5,col:'#b8a88a',sp:80,life:.3,size:2,grav:200,ang:-Math.PI/2,spread:2})}S.vy=0}
      S.land=Math.max(0,S.land-dt);
      const hb=hitbox();let i0=0;while(ob(i0).x+ob(i0).w<S.d-200)i0++;
      for(let i=Math.max(0,i0-1);i<i0+5;i++){const o=ob(i),ox=CX+(o.x-S.d);
        const oy=o.k==='fly'?o.y-o.h/2:GY-o.h,pad=6;
        if(hb.x+pad<ox+o.w&&hb.x+hb.w-pad>ox&&hb.y+pad<oy+o.h&&hb.y+hb.h>oy+pad)die();
        if(o.orb&&!S.taken.has(i))for(let k=0;k<o.orb.n;k++){const key=i*10+k;if(S.taken.has(key))continue;const qx=ox+o.orb.dx+k*28,qy=GY+o.orb.dy-Math.sin(k/(o.orb.n-1||1)*Math.PI)*20;
          if(Math.abs(qx-CX)<26&&Math.abs(qy-(GY+S.y-26))<34){S.taken.add(key);S.orbs++;fx5('mgCoin');C.fx?.burst(qx,qy,{n:6,col:['#ffd36b','#fff'],sp:120,life:.4,size:2.4,grav:0});C.fx?.float(qx,qy-14,'+10',{col:'#ffd36b',size:16,life:.6})}}
        if(o.pw&&!S.pw.has(i)){const qx=ox+o.pw.dx,qy=GY+o.pw.dy;if(Math.abs(qx-CX)<28&&Math.abs(qy-(GY+S.y-26))<38){S.pw.add(i);fx5('activate');
          if(o.pw.k==='sh'){S.sh=1;C.fx?.float(qx,qy-20,'🛡 Escudo',{col:'#8fe8ff',size:20})}else{S.slow=5;C.fx?.float(qx,qy-20,'⏳ Câmera lenta',{col:'#c9b0ff',size:20})}C.fx?.burst(qx,qy,{n:16,kind:'star',col:['#8fe8ff','#fff'],sp:160,life:.6,size:3})}}
        if(S.dead)return}
      const m=meters();if(Math.floor(m/250)>S.mile){S.mile=Math.floor(m/250);fx5('bb'+Math.min(7,S.mile));C.fx?.float(W/2,90,`${S.mile*250} m!`,{col:day(m)>.5?'#fff3c0':'#5b2fa8',size:34,life:1.2});if(S.mile%2===0)C.fx?.flash(day(m)>.5?'#000':'#fff',.25)}
      S.score=score();S.cam=S.d;R.send({d:Math.round(S.d),y:Math.round(S.y),k:S.dk?1:0,s:S.score});
      C.hud(`<b>${m}</b> m · ✨ ${S.orbs} · ${S.score} pts${S.sh?' · 🛡':''}${S.slow>0?' · ⏳':''}${C.net?` · ${Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)} correndo`:''}`);
    },
    msg:R.msg,left:R.left,
    draw(x){
      const cam=S.cam??S.d,m=Math.floor(cam/40),nk=day(m),bg=mix('f3ead6','0f0b22',nk),ink=mix('3a2a20','e6dcff',nk),soft=mix('cbbd9f','3b3160',nk);
      x.fillStyle=bg;x.fillRect(0,0,W,H);
      if(nk>.05){x.globalAlpha=nk;x.fillStyle='#fff';for(let i=0;i<60;i++){const sx=((i*131-cam*.05)%W+W)%W;x.fillRect(sx,(i*37)%(GY-80),1.6,1.6)}x.fillStyle='#fff6cf';x.beginPath();x.arc(640,60,20,0,7);x.fill();x.fillStyle=bg;x.beginPath();x.arc(650,54,18,0,7);x.fill();x.globalAlpha=1}
      if(nk<.95){x.globalAlpha=1-nk;x.fillStyle='#f2b310';x.beginPath();x.arc(660,62,22,0,7);x.fill();x.fillStyle=soft;for(let i=0;i<5;i++){const cx=((i*233-cam*.12)%(W+200)+W+200)%(W+200)-100;x.beginPath();x.ellipse(cx,50+i*14%40,46,12,0,0,7);x.fill()}x.globalAlpha=1}
      x.fillStyle=soft;for(let i=0;i<6;i++){const hx=((i*190-cam*.3)%(W+300)+W+300)%(W+300)-150;x.beginPath();x.moveTo(hx-120,GY);x.lineTo(hx,GY-60-(i%3)*18);x.lineTo(hx+120,GY);x.closePath();x.fill()}
      x.fillStyle=ink;x.fillRect(0,GY,W,2);for(let i=0;i<40;i++){const gx=((i*53-cam)%W+W)%W;x.fillRect(gx,GY+6+(i*7)%14,i%3?3:8,2)}
      let i0=0;while(ob(i0).x+ob(i0).w<cam-200)i0++;
      for(let i=Math.max(0,i0-1);i<i0+6;i++){const o=ob(i),ox=CX+(o.x-cam);if(ox>W+100)break;
        if(o.orb)for(let k=0;k<o.orb.n;k++){if(S.taken.has(i*10+k))continue;const qx=ox+o.orb.dx+k*28,qy=GY+o.orb.dy-Math.sin(k/(o.orb.n-1||1)*Math.PI)*20;const g=x.createRadialGradient(qx,qy,1,qx,qy,10);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(242,179,16,0)');x.fillStyle=g;x.beginPath();x.arc(qx,qy,10,0,7);x.fill()}
        if(o.pw&&!S.pw.has(i)){const qx=ox+o.pw.dx,qy=GY+o.pw.dy+Math.sin(S.runT*4+i)*5;x.fillStyle=o.pw.k==='sh'?'#8fe8ff':'#c9b0ff';x.beginPath();x.arc(qx,qy,15,0,7);x.fill();t21(x,o.pw.k==='sh'?'🛡':'⏳',qx,qy+1,{size:16})}
        x.fillStyle=ink;
        if(o.k==='fly'){const fl=Math.sin(S.runT*16+i)>0;x.beginPath();x.ellipse(ox+o.w/2,o.y,12,9,0,0,7);x.fill();x.beginPath();x.moveTo(ox+o.w/2-6,o.y-2);x.lineTo(ox-2,o.y+(fl?-16:10));x.lineTo(ox+o.w/2-14,o.y+2);x.moveTo(ox+o.w/2+6,o.y-2);x.lineTo(ox+o.w+2,o.y+(fl?-16:10));x.lineTo(ox+o.w/2+14,o.y+2);x.fill();x.fillStyle='#ff4a6a';x.fillRect(ox+o.w/2-6,o.y-3,3,3);x.fillRect(ox+o.w/2+3,o.y-3,3,3)}
        else if(o.k==='totem'){x.fillRect(ox,GY-o.h,o.w,o.h);x.fillStyle=bg;x.fillRect(ox+6,GY-o.h+10,o.w-12,6);x.fillRect(ox+6,GY-o.h+28,o.w-12,6);x.fillStyle='#e0233b';x.beginPath();x.arc(ox+o.w/2,GY-o.h+50,4,0,7);x.fill()}
        else for(let k=0;k<o.n;k++){const cx=ox+k*22,h=o.h-(k%2)*8;x.beginPath();x.moveTo(cx,GY);x.lineTo(cx+4,GY-h*.6);x.lineTo(cx+9,GY-h);x.lineTo(cx+14,GY-h*.55);x.lineTo(cx+18,GY);x.closePath();x.fill()}
      }
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=CX+(g.d-cam);if(gx<-60||gx>W+60)continue;mgCat(x,R.col(u),gx,GY+(g.y||0)-(g.k?18:30),g.k?44:56,R.nm(u),{alpha:g.dead?.15:.4})}
      if(!S.dead){const bob=S.y<-1?0:Math.abs(Math.sin(S.runT*14))*-4,sz=S.dk?50:60;x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;
        if(S.dk){x.translate(CX,GY-14);x.scale(1.25,.62);mgCat(x,me.c,0,0,sz,'')}else mgCat(x,me.c,CX,GY+S.y-30+bob,sz,'');x.restore();
        if(S.sh){x.strokeStyle='rgba(143,232,255,.8)';x.lineWidth=3;x.beginPath();x.arc(CX,GY+S.y-28,38,0,7);x.stroke()}
        if(S.slow>0){x.fillStyle='rgba(180,140,255,.12)';x.fillRect(0,0,W,H)}}
      t21(x,String(meters()).padStart(5,'0')+' m',W-16,22,{size:20,w:800,col:ink,al:'right'});
      if(S.dead&&!MG.over)t21(x,`Você parou em ${meters()} m. Assistindo os outros…`,W/2,H/2-40,{size:18,col:nk>.5?'#ffd1d1':'#8e2a2a'});
    }
  };
}

/* ===================================================================
   🧱 BLOCK BLAST ASTRAL
   Grade 8×8, três peças por vez. Linhas e colunas cheias explodem.
   Combo: cada jogada que limpa sobe o multiplicador; três jogadas sem
   limpar zeram. Tabuleiro vazio = PERFEITO!
   =================================================================== */
const BB21=[
  [[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0],[3,0]],[[0,0],[0,1],[0,2],[0,3]],[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,0],[0,1],[0,2],[0,3],[0,4]],
  [[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
  [[0,0],[0,1],[1,1]],[[1,0],[0,1],[1,1]],[[0,0],[1,0],[0,1]],[[0,0],[1,0],[1,1]],
  [[0,0],[0,1],[0,2],[1,2]],[[1,0],[1,1],[1,2],[0,2]],[[0,0],[1,0],[2,0],[2,1]],[[0,0],[0,1],[1,0],[2,0]],
  [[0,0],[1,0],[2,0],[1,1]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],
  [[0,0],[0,1],[0,2],[1,0],[2,0]],[[0,0],[1,0],[2,0],[2,1],[2,2]],
];
const BBW21=[[6,8,8,6,6,3,3,1,1,7,1,3,5,5,5,5,3,3,3,3,4,4,3,3,1,1],[4,6,6,6,6,4,4,2,2,6,2,4,4,4,4,4,4,4,4,4,4,4,4,4,2,2],[2,4,4,5,5,5,5,3,3,5,3,5,3,3,3,3,5,5,5,5,5,5,5,5,3,3],[1,3,3,4,4,5,5,4,4,4,4,5,3,3,3,3,5,5,5,5,5,5,6,6,4,4]];
const BBCOL21=['#3fae5a','#9b5bff','#3a8bff','#e8b83c','#e0233b','#14c8e6','#ff7ac8'];
function blast(C){
  const W=480,H=720,N=8,CS=52,X0=(W-N*CS)/2,Y0=104,TY=600,LIFT=gdPick(C.gd,[70,70,70,70]);
  const wts=BBW21[GD12[C.gd]??1],tot=wts.reduce((a,b)=>a+b,0);
  const S={g:Array(N*N).fill(null),tray:[],k:0,score:0,combo:0,miss:0,best:0,drag:null,clr:[],over:false,overT:0,placed:0,perfect:0,lines:0};
  const me=me21(C);
  const rnd=mb32((C.seed^0xB10C)>>>0||7);
  function newPiece(){let r=rnd()*tot,i=0;while(r>=wts[i]){r-=wts[i];i++}const cells=BB21[i],w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1;return{cells,w,h,col:BBCOL21[Math.floor(rnd()*BBCOL21.length)],id:S.k++}}
  function deal(){S.tray=[newPiece(),newPiece(),newPiece()];fx5('click')}
  deal();
  const fits=(p,gx,gy)=>p.cells.every(([cx,cy])=>{const x=gx+cx,y=gy+cy;return x>=0&&y>=0&&x<N&&y<N&&!S.g[y*N+x]});
  const anyFit=p=>{for(let y=0;y<=N-p.h;y++)for(let x=0;x<=N-p.w;x++)if(fits(p,x,y))return true;return false};
  const slotX=i=>W/2+(i-1)*150;
  function trayScale(p){return Math.min(1,100/(Math.max(p.w,p.h)*26))}
  function place(p,gx,gy){
    p.cells.forEach(([cx,cy])=>{S.g[(gy+cy)*N+gx+cx]={col:p.col,t:performance.now()}});
    S.score+=p.cells.length;S.placed++;fx5('mgBall');
    const rows=[],cols=[];for(let y=0;y<N;y++)if([...Array(N).keys()].every(x=>S.g[y*N+x]))rows.push(y);for(let x=0;x<N;x++)if([...Array(N).keys()].every(y=>S.g[y*N+x]))cols.push(x);
    const L=rows.length+cols.length;
    if(L){S.combo++;S.miss=0;S.lines+=L;const set=new Set();rows.forEach(y=>{for(let x=0;x<N;x++)set.add(y*N+x)});cols.forEach(x=>{for(let y=0;y<N;y++)set.add(y*N+x)});
      const gain=Math.round(L*10*(L+1)/2*10*S.combo/2);S.score+=gain;
      const now=performance.now();set.forEach(i=>{const c=S.g[i];S.clr.push({i,col:c.col,t:now+((i%N)+(i/N|0))*18});S.g[i]=null;
        const x=X0+(i%N)*CS+CS/2,y=Y0+(i/N|0)*CS+CS/2;setTimeout(()=>C.fx?.burst(x,y,{n:7,col:[c.col,'#fff'],sp:200,life:.65,size:3.2,grav:380}),((i%N)+(i/N|0))*18)});
      fx5('bb'+Math.min(7,S.combo+L-1));C.fx?.shake(3+L*2.5,.3);
      const cy=Y0+(rows.length?(rows.reduce((a,b)=>a+b,0)/rows.length):3.5)*CS;
      C.fx?.float(W/2,cy,`+${gain}`,{col:'#fff',size:26});
      if(S.combo>=2)setTimeout(()=>C.fx?.float(W/2,cy-46,`x${S.combo} COMBO`,{col:S.combo>=4?'#ff7ac8':'#ffd36b',size:30+Math.min(14,S.combo*2),life:1.1}),120);
      if(S.combo>=4)C.achieve?.('blast');
      if(S.g.every(c=>!c)){S.score+=300;S.perfect++;setTimeout(()=>{fx5('mgWin');C.fx?.flash('#fff3c0',.45);C.fx?.float(W/2,Y0+CS*4,'PERFEITO! +300',{col:'#ffd36b',size:40,life:1.5})},260)}
    }else{S.miss++;if(S.miss>=3&&S.combo){S.combo=0;C.fx?.float(W/2,Y0-24,'combo perdido',{col:'#c9b995',size:16})}}
    S.tray=S.tray.map(q=>q===p?null:q);if(S.tray.every(q=>!q))deal();
    if(!S.tray.some(q=>q&&anyFit(q))){S.over=true;S.overT=1.2;fx5('mgLose');C.say(pick12(['Sem espaço. Nem a Inexistência cabe aí.','Fim da linha. Literalmente.','Tabuleiro cheio. Igual a minha tigela… nunca.']),false)}
  }
  function dragAt(px,py){const d=S.drag;if(!d)return;d.x=px;d.y=py;const p=d.p,tlx=px-p.w*CS/2,tly=py-d.lift-p.h*CS/2;d.gx=Math.round((tlx-X0)/CS);d.gy=Math.round((tly-Y0)/CS);d.ok=fits(p,d.gx,d.gy)}
  function drawBlock(x,X,Y,s,col,a=1){x.globalAlpha=a;rr21(x,X+1,Y+1,s-2,s-2,s*.16);x.fillStyle=col;x.fill();x.fillStyle='rgba(255,255,255,.28)';x.fillRect(X+4,Y+4,s-8,s*.16);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(X+4,Y+s-s*.2,s-8,s*.12);x.globalAlpha=1}
  return{
    st:()=>S,fits,place:(i,gx,gy)=>{const p=S.tray[i];if(p&&fits(p,gx,gy))place(p,gx,gy)},
    key(code,down){},
    ptr(t,px,py,e){
      if(Date.now()<C.t0||S.over)return;
      if(t==='down'){for(let i=0;i<3;i++){const p=S.tray[i];if(!p)continue;const sc=trayScale(p)*26,w=p.w*sc,h=p.h*sc;if(Math.abs(px-slotX(i))<Math.max(60,w/2+14)&&Math.abs(py-TY)<Math.max(60,h/2+14)){S.drag={p,i,x:px,y:py,lift:e&&e.pointerType==='mouse'?0:LIFT};dragAt(px,py);fx5('click');return}}}
      else if(t==='move'){dragAt(px,py)}
      else if(t==='up'&&S.drag){const d=S.drag;S.drag=null;if(d.ok)place(d.p,d.gx,d.gy);else fx5('error')}
    },
    step(dt){
      if(Date.now()<C.t0)return;
      if(S.over&&!S.done){S.overT-=dt;if(S.overT<=0){S.done=true;C.finish({title:`Block Blast Astral · ${S.score} pontos · ${S.lines} linhas${S.perfect?` · ${S.perfect} perfeito${S.perfect>1?'s':''}`:''}`,rows:[{u:C.me,n:me.n,c:me.c,s:S.score,w:false}]})}}
      C.hud(`🧱 <b>${S.score}</b> pts · ${S.lines} linhas${S.combo>=2?` · <b style="color:#ffd36b">x${S.combo} combo</b>`:''}`);
    },
    draw(x){
      const now=performance.now();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1030');g.addColorStop(1,'#0b0816');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++)x.fillRect((i*97)%W,(i*61)%H,1.4,1.4);
      t21(x,String(S.score),W/2,44,{size:40,w:900,col:'#fff',stroke:5});
      if(S.combo>=2)t21(x,`x${S.combo}`,W/2+80,46,{size:20,w:900,col:'#ffd36b'});
      rr21(x,X0-8,Y0-8,N*CS+16,N*CS+16,14);x.fillStyle='#120c22';x.fill();x.strokeStyle='#4b2f7a';x.lineWidth=2;x.stroke();
      for(let i=0;i<N*N;i++){const X=X0+(i%N)*CS,Y=Y0+(i/N|0)*CS;rr21(x,X+2,Y+2,CS-4,CS-4,8);x.fillStyle='#1d1533';x.fill();const c=S.g[i];if(c){const pop=Math.min(1,(now-c.t)/140);const s=CS*(.85+.15*pop);drawBlock(x,X+(CS-s)/2,Y+(CS-s)/2,s,c.col)}}
      S.clr=S.clr.filter(c=>now<c.t+260);S.clr.forEach(c=>{if(now<c.t){drawBlock(x,X0+(c.i%N)*CS,Y0+(c.i/N|0)*CS,CS,c.col);return}const k=(now-c.t)/260,s=CS*(1-k*.9);x.save();x.shadowColor='#fff';x.shadowBlur=14;drawBlock(x,X0+(c.i%N)*CS+(CS-s)/2,Y0+(c.i/N|0)*CS+(CS-s)/2,s,'#fff',1-k);x.restore()});
      const d=S.drag;
      if(d&&d.ok){d.p.cells.forEach(([cx,cy])=>drawBlock(x,X0+(d.gx+cx)*CS,Y0+(d.gy+cy)*CS,CS,d.p.col,.35));
        const rows=new Set(),cols=new Set(),tmp=S.g.slice();d.p.cells.forEach(([cx,cy])=>tmp[(d.gy+cy)*N+d.gx+cx]=1);
        for(let y=0;y<N;y++)if([...Array(N).keys()].every(q=>tmp[y*N+q]))rows.add(y);for(let q=0;q<N;q++)if([...Array(N).keys()].every(y=>tmp[y*N+q]))cols.add(q);
        x.fillStyle='rgba(255,211,107,.18)';rows.forEach(y=>x.fillRect(X0,Y0+y*CS,N*CS,CS));cols.forEach(q=>x.fillRect(X0+q*CS,Y0,CS,N*CS))}
      rr21(x,16,TY-74,W-32,148,16);x.fillStyle='rgba(255,255,255,.05)';x.fill();
      S.tray.forEach((p,i)=>{if(!p||d&&d.p===p)return;const sc=trayScale(p)*26,fit=anyFit(p);p.cells.forEach(([cx,cy])=>drawBlock(x,slotX(i)-p.w*sc/2+cx*sc,TY-p.h*sc/2+cy*sc,sc,fit?p.col:'#4a4458'))});
      if(d){const tlx=d.x-d.p.w*CS/2,tly=d.y-d.lift-d.p.h*CS/2;d.p.cells.forEach(([cx,cy])=>drawBlock(x,tlx+cx*CS,tly+cy*CS,CS,d.p.col,.95))}
      if(S.over){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,W,H);t21(x,'Sem espaço!',W/2,H/2-20,{size:38,w:900,col:'#fff',stroke:6})}
    }
  };
}

/* ---------- registro ---------- */
defineArcadeGame('sudoku',{name:'Sudoku Teosófico',ico:'🔢',modes:['solo'],max:1,rec:true,unit:'pts',W:480,H:720,
  desc:'Grade 9×9 com lápis de anotações, destaque de linha, coluna e número igual, verificação de erros e relógio.',
  rule:'Fácil, Médio, Difícil ou Pesadelo pela dificuldade do jogo. Menos tempo, menos erros e menos dicas valem mais pontos.',
  keys:'Clique numa casa e num número · setas · 1–9 · 0/⌫ apaga · N lápis · H dica · Z desfaz',touch:'Toque numa casa e depois num número',make:sudoku});
defineArcadeGame('runner',{name:'Corredor do Vazio',ico:'🦖',modes:['solo','mesa'],max:6,rec:true,unit:'pts',W:800,H:320,pad:'jd',
  desc:'Corrida infinita: pule cristais e totens, abaixe dos morcegos de sombra. Dia e noite se alternam e a pista acelera.',
  rule:'Mesma pista para todos; os colegas correm como fantasmas. Metros + orbes (10 cada). Vence quem for mais longe.',
  keys:'Espaço, ↑ ou W pulam · ↓ ou S agacham (no ar, descem rápido)',touch:'',make:runner});
defineArcadeGame('blast',{name:'Block Blast Astral',ico:'🧱',modes:['solo'],max:1,rec:true,unit:'pts',W:480,H:720,
  desc:'Encaixe 3 peças por vez na grade 8×8. Linhas e colunas cheias explodem em combo.',
  rule:'Jogadas seguidas que limpam linhas sobem o combo (x2, x3…). Três jogadas sem limpar zeram. Tabuleiro vazio vale +300.',
  keys:'Arraste as peças com o mouse',touch:'Arraste as peças com o dedo (a peça fica acima do dedo)',make:blast});

