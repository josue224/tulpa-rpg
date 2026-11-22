/* ===================================================================
   TULPA · ETAPA 46 — 🕹 ARCADE 2.0 · ONDA 5 (parte 1)
   🔢 SUDOKU TEOSÓFICO 2.0
   Modos: Clássico (Fácil → Pesadelo), Diagonal (X-Sudoku: as duas
   diagonais também têm 1 a 9), Relâmpago (contra o relógio, cada acerto
   dá segundos) e Série de 12 fases progressivas.
   Ferramentas: lápis com auto-limpeza, anotação automática, Dica
   Inteligente (destaca a linha/coluna/bloco e explica a lógica antes de
   revelar), Desfazer/Refazer sem limite, Lucidez (3 erros e colapsa no
   Difícil/Pesadelo) e multiplicador por sequência sem erros.
   =================================================================== */
function skGroups46(diag){const G=[];for(let r=0;r<9;r++)G.push({n:`linha ${r+1}`,k:'r',ids:[...Array(9).keys()].map(c=>r*9+c)});for(let c=0;c<9;c++)G.push({n:`coluna ${c+1}`,k:'c',ids:[...Array(9).keys()].map(r=>r*9+c)});
  for(let q=0;q<9;q++)G.push({n:`bloco ${q+1}`,k:'b',ids:[...Array(9).keys()].map(k=>((q/3|0)*3+(k/3|0))*9+(q%3)*3+k%3)});
  if(diag){G.push({n:'diagonal principal',k:'d',ids:[...Array(9).keys()].map(k=>k*9+k)});G.push({n:'diagonal secundária',k:'d',ids:[...Array(9).keys()].map(k=>k*9+8-k)})}
  const of=Array.from({length:81},()=>[]);G.forEach((g,gi)=>g.ids.forEach(i=>of[i].push(gi)));return{G,of}}
function skSolve46(g,diag,limit=2,rnd=null){
  const {G,of}=skGroups46(diag),a=g.slice(),used=G.map(()=>0);let n=0,sol=null;
  for(let i=0;i<81;i++)if(a[i]){const b=1<<a[i];for(const gi of of[i]){if(used[gi]&b)return{n:0};used[gi]|=b}}
  const bits=m=>{let k=0;while(m){m&=m-1;k++}return k};
  (function rec(){let best=-1,bm=0,bc=10;
    for(let i=0;i<81;i++){if(a[i])continue;let u=0;for(const gi of of[i])u|=used[gi];const m=~u&0x3FE,k=bits(m);if(k<bc){bc=k;best=i;bm=m;if(k<=1)break}}
    if(best<0){n++;if(!sol)sol=a.slice();return n>=limit}if(!bc)return false;
    const vs=[];for(let v=1;v<=9;v++)if(bm&(1<<v))vs.push(v);if(rnd)for(let i=vs.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[vs[i],vs[j]]=[vs[j],vs[i]]}
    for(const v of vs){const b=1<<v;a[best]=v;for(const gi of of[best])used[gi]|=b;if(rec())return true;a[best]=0;for(const gi of of[best])used[gi]&=~b}return false})();
  return{n,sol}}
function skGen46(seed,clues,diag){
  const rnd=mb32((seed>>>0)||1),sol=skSolve46(Array(81).fill(0),diag,1,rnd).sol,puz=sol.slice();let left=81;
  const order=[...Array(81).keys()];for(let i=80;i>0;i--){const j=Math.floor(rnd()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  for(const i of order){if(left<=clues)break;const v=puz[i];puz[i]=0;if(skSolve46(puz,diag,2).n!==1)puz[i]=v;else left--}
  return{sol,puz}}
T3.sk46={gen:skGen46,solve:skSolve46,groups:skGroups46};
const SKSER46=[['c',42,'Despertar'],['c',38,'Primeiros Passos'],['c',34,'Ritmo'],['d',38,'O Primeiro X'],['c',30,'Concentração'],['f',34,'Relâmpago I'],['c',28,'Vigília'],['d',32,'Cruz da Verdade'],['c',26,'Abismo',1],['f',30,'Relâmpago II',1],['d',28,'Espelho Duplo',1],['d',26,'O Último Selo',1]];
function skProg46(){const p=prog38().sk||{};return{ser:p.ser||{},best:p.best||{}}}
const skOpen46=i=>i===0||!!skProg46().ser[i-1];
const skSetup46={
  intro:()=>'Clássico usa a dificuldade do jogo. Na Série, cada fase vencida abre a próxima.',
  def:()=>({m:'c',ph:'0'}),
  fields:o=>{const p=skProg46(),F=[{k:'m',l:'Modo',opts:[{v:'c',n:'Clássico',ico:'🔢',d:'9×9 de Fácil a Pesadelo.'},{v:'d',n:'Diagonal (X-Sudoku)',ico:'✖',d:'As duas diagonais também têm 1 a 9.'},{v:'f',n:'Relâmpago',ico:'⚡',d:'Contra o relógio: cada acerto dá +4 s.'},{v:'s',n:'Série de Fases',ico:'📜',d:'12 fases que ficam mais difíceis.'}]}];
    if(o.m==='s')F.push({k:'ph',l:'Fase',wide:1,opts:SKSER46.map((s,i)=>{const lock=!skOpen46(i),r=p.ser[i];return{v:String(i),n:`${i+1}. ${s[2]}`,ico:s[0]==='d'?'✖':s[0]==='f'?'⚡':'🔢',d:lock?'Vença a fase anterior.':`${s[0]==='d'?'Diagonal':s[0]==='f'?'Relâmpago':'Clássico'} · ${s[1]} pistas${s[3]?' · 🧠 Lucidez (3 erros)':''}`,lock,badge:r?`✓ ${mmss21(r)}`:''}})});
    return F},
  fix:o=>{if(!['c','d','f','s'].includes(o.m))o.m='c';let i=Math.max(0,Math.min(11,+o.ph||0));while(i>0&&!skOpen46(i))i--;o.ph=String(i)},
  sum:()=>'Clique numa casa e num número. N liga o lápis, A anota tudo, H pede a Dica Inteligente (aperte de novo para aplicar), Z desfaz e Y refaz.'
};

function sudoku46(C){
  const W=480,H=720,X0=15,Y0=15,CS=50,o=C.room.opt||{},li=GD12[C.gd]??1;
  let mode=o.m||'c',clues=gdPick(C.gd,[40,32,26,23]),life=li>=2,phase=-1,title=['Fácil','Médio','Difícil','Pesadelo'][li];
  if(mode==='s'){phase=Math.max(0,Math.min(11,+o.ph||0));const s=SKSER46[phase];mode=s[0];clues=s[1];life=!!s[3];title=`Fase ${phase+1} · ${s[2]}`}
  else if(mode==='d'){clues=gdPick(C.gd,[38,32,28,26]);title='Diagonal '+title}else if(mode==='f'){title='Relâmpago '+title}
  const diag=mode==='d',flash=mode==='f',{G,of}=skGroups46(diag);
  const {sol,puz}=skGen46(phase>=0?9001+phase*7919:C.seed,clues,diag);
  const S={v:puz.slice(),given:puz.map(v=>!!v),notes:Array.from({length:81},()=>new Set()),sel:puz.findIndex(v=>!v),pen:false,err:0,hints:[4,3,2,1][li],used:0,t:0,done:false,hist:[],redo:[],wrong:new Set(),lines:new Set(),pulse:{},streak:0,best:0,pts:0,hint:null,clock:flash?[480,360,300,240][li]:0,lost:false};
  const me=me21(C),PADY=482,ACTY=552,ACTW=70,ACTG=6;
  const ACT=[['pen','✏ Lápis'],['auto','✎ Anotar'],['hint','💡 Dica'],['del','⌫'],['undo','↶'],['redo','↷']];
  const peers=i=>{const s=new Set();of[i].forEach(gi=>G[gi].ids.forEach(k=>s.add(k)));s.delete(i);return s};
  const cellXY=i=>[X0+(i%9)*CS,Y0+(i/9|0)*CS];
  const ok=i=>S.v[i]&&S.v[i]===sol[i];
  const count=v=>S.v.filter((q,i)=>q===v&&!S.wrong.has(i)).length;
  const mult=()=>1+Math.min(2,S.streak*.08);
  function snap(){return{v:S.v.slice(),n:S.notes.map(s=>[...s]),w:[...S.wrong],g:S.given.slice()}}
  function push(){S.hist.push(snap());S.redo=[]}
  function restore(h){S.v=h.v;S.notes=h.n.map(a=>new Set(a));S.wrong=new Set(h.w);S.given=h.g}
  function cands(i){if(S.v[i]&&!S.wrong.has(i))return new Set();let u=new Set();peers(i).forEach(k=>{if(ok(k))u.add(S.v[k])});return new Set([1,2,3,4,5,6,7,8,9].filter(v=>!u.has(v)))}
  function groupsDone(i){let n=0;of[i].forEach(gi=>{const g=G[gi],key=g.n;if(!S.lines.has(key)&&g.ids.every(ok)){S.lines.add(key);n++;g.ids.forEach((k,j)=>{S.pulse[k]=performance.now()+j*35;const [cx,cy]=cellXY(k);setTimeout(()=>C.fx?.burst(cx+CS/2,cy+CS/2,{n:5,col:['#ffd36b','#b48cff','#7fe3ff'],kind:'star',sp:120,life:.6,size:3,grav:80}),j*35)})}});return n}
  function place(v){
    if(S.done||S.sel<0||S.given[S.sel])return;const i=S.sel;
    if(S.pen){if(S.v[i]&&!S.wrong.has(i))return;push();const s=S.notes[i];if(s.has(v))s.delete(v);else s.add(v);fx5('click');return}
    if(S.v[i]===v&&!S.wrong.has(i))return;
    push();S.v[i]=v;S.notes[i].clear();const [cx,cy]=cellXY(i);
    if(S.hint&&S.hint.i===i)S.hint=null;
    if(v!==sol[i]){S.wrong.add(i);S.err++;S.streak=0;fx5('error');C.fx?.shake(4,.2);C.fx?.float(cx+CS/2,cy+6,'✗',{col:'#ff6b6b',size:22});
      if(life&&S.err>=3){lose('🧠 A Lucidez acabou: 3 erros.');}return}
    S.wrong.delete(i);peers(i).forEach(k=>S.notes[k].delete(v));
    S.streak++;S.best=Math.max(S.best,S.streak);const gain=Math.round(10*mult());S.pts+=gain;if(flash)S.clock+=4;
    fx5('mgCoin');C.fx?.burst(cx+CS/2,cy+CS/2,{n:8,col:['#ffd36b','#fff'],sp:110,life:.45,size:2.4,grav:0});if(S.streak%5===0)C.fx?.float(cx+CS/2,cy-6,`x${mult().toFixed(1)}`,{col:'#ffd36b',size:16});
    const g=groupsDone(i);if(g){S.pts+=g*30;fx5('bb'+Math.min(7,2+g*2));C.fx?.float(W/2,Y0+CS*4.5,g>1?`${g} GRUPOS!`:'COMPLETO!',{col:'#ffd36b',size:30,life:1.1});C.fx?.shake(2+g,.2)}
    if(S.v.every((q,k)=>q===sol[k]))win();
  }
  function erase(){if(S.done||S.sel<0||S.given[S.sel])return;const i=S.sel;if(!S.v[i]&&!S.notes[i].size)return;push();S.v[i]=0;S.notes[i].clear();S.wrong.delete(i);fx5('click')}
  function autoNotes(){if(S.done)return;push();for(let i=0;i<81;i++)if(!S.v[i]||S.wrong.has(i)){if(S.v[i])continue;S.notes[i]=cands(i)}fx5('activate')}
  /* Dica Inteligente: casa única ou único lugar no grupo, com explicação */
  function findHint(){
    const empty=[...Array(81).keys()].filter(i=>!ok(i));
    for(const i of empty){const c=cands(i);if(c.size===1){const v=[...c][0];if(v===sol[i])return{i,v,kind:'naked',gi:of[i][2],txt:`Na linha ${(i/9|0)+1}, coluna ${i%9+1}, só cabe o ${v}: a linha, a coluna${diag&&of[i].length>3?', a diagonal':''} e o bloco já têm todos os outros números.`}}}
    for(let gi=0;gi<G.length;gi++){const g=G[gi];for(let v=1;v<=9;v++){if(g.ids.some(k=>ok(k)&&S.v[k]===v))continue;const spots=g.ids.filter(k=>!ok(k)&&cands(k).has(v));if(spots.length===1&&sol[spots[0]]===v)return{i:spots[0],v,kind:'hidden',gi,txt:`Na ${g.n}, o ${v} só pode ficar nesta casa: todas as outras casas vazias já veem um ${v}.`}}}
    const i=empty.find(k=>!S.given[k]);return i==null?null:{i,v:sol[i],kind:'reveal',gi:of[i][2],txt:`Este ponto pede técnicas avançadas. A Verdade revela: aqui vai o ${sol[i]}.`}}
  function hint(){
    if(S.done)return;
    if(S.hint){const h=S.hint;S.sel=h.i;const p=S.pen;S.pen=false;place(h.v);S.pen=p;S.given[h.i]=true;S.hint=null;fx5('activate');return}
    if(S.hints<=0){C.say('Sem dicas. A Verdade agora é com você.',false);return}
    const h=findHint();if(!h)return;S.hints--;S.used++;S.hint=h;S.sel=h.i;fx5('confirm');
  }
  function undo(){if(S.done||!S.hist.length)return;S.redo.push(snap());restore(S.hist.pop());fx5('click')}
  function redo(){if(S.done||!S.redo.length)return;S.hist.push(snap());restore(S.redo.pop());fx5('click')}
  function score(){const base=gdPick(C.gd,[700,1100,1700,2300])*(diag?1.2:1)*(phase>=0?1+phase*.1:1);return Math.max(50,Math.round(base+S.pts-(flash?0:S.t)-S.err*40-S.used*120+(flash?S.clock*3:0)))}
  function save(){let first=false,rec=false;progPut38(p=>{p.sk=p.sk||{};p.sk.ser=p.sk.ser||{};p.sk.best=p.sk.best||{};if(phase>=0){first=!p.sk.ser[phase];if(!p.sk.ser[phase]||S.t<p.sk.ser[phase]){p.sk.ser[phase]=Math.round(S.t);rec=true}if(SKSER46.every((_,k)=>p.sk.ser[k]))C.achieve?.('sk_serie')}const key=(o.m||'c')+(phase>=0?phase:C.gd);if(!p.sk.best[key]||S.t<p.sk.best[key]){p.sk.best[key]=Math.round(S.t);rec=true}});return{first,rec}}
  function html(){return`<ul class="r38-l"><li>⏱ Tempo: <b>${mmss21(S.t)}</b></li><li>✗ Erros: <b>${S.err}</b></li><li>💡 Dicas: <b>${S.used}</b></li><li>🔥 Maior sequência: <b>${S.best}</b> (x${(1+Math.min(2,S.best*.08)).toFixed(1)})</li>${flash?`<li>⚡ Tempo sobrando: <b>${mmss21(Math.max(0,S.clock))}</b></li>`:''}</ul>`}
  function win(){
    S.done=true;const sc=score(),sv=save();
    fx5('mgWin');C.fx?.flash('#fff3c0',.4);for(let k=0;k<6;k++)setTimeout(()=>C.fx?.burst(60+Math.random()*360,80+Math.random()*360,{n:18,col:['#ffd36b','#b48cff','#7fe3ff','#ff8fb1'],kind:'star',sp:220,life:1,size:4}),k*140);
    if(C.gd==='dificil'||C.gd==='pesadelo'||(phase>=8))C.achieve?.('sudoku');if(diag)C.achieve?.('sk_diag');if(flash)C.achieve?.('sk_raio');if(!S.err&&!S.used&&(li>=2||phase>=8))C.achieve?.('sk_limpo');
    const mul=gdMul38(C.gd);S.rw={ob:Math.round((8+[0,4,10,16][li]+(diag?4:0)+(flash?4:0)+(phase>=0?phase*1.5:0))*mul+(sv.first?15:0)),why:[title,sv.first?'fase nova':'',sv.rec?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    setTimeout(()=>C.finish({title:`Sudoku ${title} resolvido em ${mmss21(S.t)}${S.err?` · ${S.err} erro${S.err>1?'s':''}`:' · sem erros!'}`,rows:[{u:C.me,n:me.n,c:me.c,s:sc,w:true}],unit:'pts',html:html()+(sv.first&&phase>=0&&phase<11?`<p class="r38-hi">📜 Fase ${phase+2}: ${esc(SKSER46[phase+1][2])} foi aberta.</p>`:'')}),window.__skFast?0:1100);
  }
  function lose(why){if(S.done)return;S.done=true;S.lost=true;fx5('mgLose');C.fx?.flash('#3a0a2e',.4);S.rw={ob:2,xp:1,why:'tentativa'};
    setTimeout(()=>C.finish({title:`${why} · ${title}`,rows:[{u:C.me,n:me.n,c:me.c,s:Math.round(S.pts),w:false}],unit:'pts',html:html()}),window.__skFast?0:900)}
  function move(dx,dy){if(S.sel<0)S.sel=0;const r=clamp12((S.sel/9|0)+dy,0,8),c=clamp12(S.sel%9+dx,0,8);S.sel=r*9+c}
  function hitBtn(px,py){
    if(py>=PADY&&py<=PADY+56){const k=Math.floor((px-X0)/CS);if(k>=0&&k<9)return['n',k+1]}
    if(py>=ACTY&&py<=ACTY+50){const k=Math.floor((px-X0)/(ACTW+ACTG));if(k>=0&&k<6&&px-X0-k*(ACTW+ACTG)<=ACTW)return['a',ACT[k][0]]}
    return null}
  return{
    st:()=>S,sol:()=>sol,hint,undo,redo,autoNotes,findHint,
    reward:()=>S.rw||null,
    next(){if(phase<0||!S.done||S.lost||phase>=11)return null;return{opt:{m:'s',ph:String(phase+1)},label:`Fase ${phase+2}: ${SKSER46[phase+1][2]}`}},
    key(code,down){if(!down||Date.now()<C.t0)return;
      const m=code.match(/^(?:Digit|Numpad)([0-9])$/);if(m){const v=+m[1];if(v)place(v);else erase();return}
      if(code==='ArrowLeft')move(-1,0);else if(code==='ArrowRight')move(1,0);else if(code==='ArrowUp')move(0,-1);else if(code==='ArrowDown')move(0,1);
      else if(code==='Backspace'||code==='Delete')erase();else if(code==='KeyN'||code==='KeyP'){S.pen=!S.pen;fx5('click')}else if(code==='KeyH')hint();else if(code==='KeyZ'||code==='KeyU')undo();else if(code==='KeyY')redo();else if(code==='KeyA')autoNotes()},
    ptr(t,px,py){if(t!=='down'||Date.now()<C.t0)return;
      if(px>=X0&&px<X0+9*CS&&py>=Y0&&py<Y0+9*CS){S.sel=Math.floor((py-Y0)/CS)*9+Math.floor((px-X0)/CS);fx5('click');return}
      const b=hitBtn(px,py);if(!b)return;if(b[0]==='n')place(b[1]);else({pen:()=>{S.pen=!S.pen;fx5('click')},del:erase,hint,undo,redo,auto:autoNotes})[b[1]]()},
    step(dt){if(Date.now()<C.t0||S.done)return;S.t+=dt;if(flash){S.clock-=dt;if(S.clock<=0){S.clock=0;lose('⚡ O tempo acabou')}}
      C.hud(`🔢 <b>${esc(title)}</b> · ${flash?`⚡ <b>${mmss21(Math.max(0,S.clock))}</b>`:`⏱ <b>${mmss21(S.t)}</b>`} · ✗ ${S.err}${life?` · 🧠 ${'●'.repeat(Math.max(0,3-S.err))}${'○'.repeat(Math.min(3,S.err))}`:''} · 💡 ${S.hints} · 🔥 x${mult().toFixed(1)}${S.pen?' · ✏ lápis':''}`)},
    draw(x){
      const now=performance.now();x.fillStyle='#14101c';x.fillRect(0,0,W,H);
      const sv=S.sel>=0?S.v[S.sel]:0,hg=S.hint?new Set(G[S.hint.gi].ids):null,selG=S.sel>=0?new Set(of[S.sel].flatMap(gi=>G[gi].ids)):new Set();
      rr21(x,X0-4,Y0-4,9*CS+8,9*CS+8,10);x.fillStyle='#f4ead6';x.fill();
      for(let i=0;i<81;i++){const r=i/9|0,c=i%9,q=(r/3|0)*3+(c/3|0),[cx,cy]=cellXY(i);
        let bg=(q%2)?'#efe2c8':'#f8f0de';if(diag&&(r===c||r+c===8))bg=(q%2)?'#e9dcf4':'#efe6f8';
        if(selG.has(i))bg='#e2d3f5';
        if(sv&&S.v[i]===sv&&!S.wrong.has(i))bg='#c9b0f2';
        if(hg&&hg.has(i))bg='#cdeedd';
        if(i===S.sel)bg=S.hint&&S.hint.i===i?'#7dffa8':'#ffd36b';
        if(S.wrong.has(i))bg=i===S.sel?'#ffb3a8':'#ffd6d1';
        const pu=S.pulse[i];if(pu&&now>pu&&now<pu+450){const k=1-(now-pu)/450;bg=`rgba(255,211,107,${.4+k*.6})`}
        x.fillStyle=bg;x.fillRect(cx,cy,CS,CS);
        const v=S.v[i];
        if(v)t21(x,String(v),cx+CS/2,cy+CS/2+1,{size:28,w:S.given[i]?800:600,col:S.wrong.has(i)?'#c0182c':S.given[i]?'#1b1424':'#5b2fa8'});
        else if(S.notes[i].size){x.font=`600 12px ${UI21}`;x.textAlign='center';x.textBaseline='middle';S.notes[i].forEach(n=>{const nx=cx+((n-1)%3)*15+10,ny=cy+Math.floor((n-1)/3)*14+11;x.fillStyle=n===sv?'#5b2fa8':'#6b5a7a';x.fillText(n,nx,ny)})}
      }
      x.strokeStyle='#b6a48a';x.lineWidth=1;for(let k=1;k<9;k++){if(k%3===0)continue;x.beginPath();x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS);x.stroke()}
      x.strokeStyle='#2a1c14';x.lineWidth=3;for(let k=0;k<=9;k+=3){x.beginPath();x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS);x.stroke()}
      if(diag){x.save();x.strokeStyle='rgba(91,47,168,.35)';x.lineWidth=2;x.setLineDash([6,6]);x.beginPath();x.moveTo(X0,Y0);x.lineTo(X0+9*CS,Y0+9*CS);x.moveTo(X0+9*CS,Y0);x.lineTo(X0,Y0+9*CS);x.stroke();x.restore()}
      for(let v=1;v<=9;v++){const bx=X0+(v-1)*CS+3,full=count(v)>=9;rr21(x,bx,PADY,CS-6,56,10);x.fillStyle=full?'#2a2236':v===sv?'#5b2fa8':'#2f2442';x.fill();
        t21(x,String(v),bx+(CS-6)/2,PADY+24,{size:26,w:800,col:full?'#5d5370':'#fff'});t21(x,full?'✓':String(9-count(v)),bx+(CS-6)/2,PADY+46,{size:11,w:600,col:full?'#7dffa8':'#c9b995'})}
      ACT.forEach(([k,l],i)=>{const bx=X0+i*(ACTW+ACTG),on=(k==='pen'&&S.pen)||(k==='hint'&&S.hint);rr21(x,bx,ACTY,ACTW,50,12);x.fillStyle=on?'#ffd36b':'#2f2442';x.fill();
        t21(x,k==='hint'?(S.hint?'✔ Aplicar':`💡 ${S.hints}`):l,bx+ACTW/2,ACTY+25,{size:13,w:700,col:on?'#1b1424':(k==='undo'&&!S.hist.length)||(k==='redo'&&!S.redo.length)?'#6b5a7a':'#f4ead6'})});
      if(S.hint)wrap16(x,'💡 '+S.hint.txt,W/2,ACTY+70,440,17,'#cdeedd',13);
      else t21(x,S.pen?'✏ Lápis ligado: os números viram anotações pequenas.':'Toque numa casa e depois num número.',W/2,ACTY+78,{size:13,w:500,col:'#c9b995'});
      t21(x,`${flash?'⚡ '+mmss21(Math.max(0,S.clock)):'⏱ '+mmss21(S.t)}   ✗ ${S.err}${life?'   🧠 '+'●'.repeat(Math.max(0,3-S.err)):''}   🔥 x${mult().toFixed(1)}`,W/2,H-28,{size:17,w:800,col:flash&&S.clock<30?'#ff8a8a':'#f4ead6'});
    }
  };
}
Object.assign(ACH,{
  sk_diag:{ico:'✖',n:'Olho em X',d:'Resolva um Sudoku Diagonal.'},
  sk_raio:{ico:'⚡',n:'Relâmpago',d:'Vença o Sudoku Relâmpago antes do tempo acabar.'},
  sk_serie:{ico:'📜',n:'Série Completa',d:'Vença as 12 fases da Série do Sudoku.'},
  sk_limpo:{ico:'🧘',n:'Mente Clara',d:'Resolva um Sudoku Difícil sem erros e sem dicas.',secret:true},
});
defineArcadeGame('sudoku',{...GAMES12.sudoku,make:sudoku46,setup:skSetup46,
  desc:'Clássico, Diagonal (X-Sudoku), Relâmpago e Série de 12 fases. Dica Inteligente que explica a lógica, desfazer/refazer, anotação automática e Lucidez.',
  keys:'Clique numa casa e num número · setas · 1–9 · 0/⌫ apaga · N lápis · A anota tudo · H dica · Z desfaz · Y refaz',touch:'Toque numa casa e depois num número'});
console.info('[Tulpa] Etapa 46 carregada (Sudoku Teosófico 2.0)');

/* ===================================================================
   TULPA · ETAPA 47 — 🕹 ARCADE 2.0 · ONDA 5 (parte 2)
   🧱 BLOCK BLAST ASTRAL 2.0
   Clássico Infinito e Aventura (15 fases com objetivos: gelo, trancas,
   gemas elementais presas e metas de pontos em X jogadas).
   Reserva de 1 peça (recarrega ao limpar linhas), Bomba de Sol (limpa
   3×3 e reage em cadeia), Cristal de Óbolos (moedas extras) e Combo
   Contínuo com multiplicador explosivo e modo Fervor.
   Grade: '.' vazio · b bloco · g gema · i gelo · I gelo duplo (2 limpezas) · l tranca (só a Bomba de Sol abre)
   =================================================================== */
const BBLV47=[
  {n:'Gemas Soltas',mv:18,goal:{gem:3},map:['........','........','........','........','........','gbbbb...','bbbg.bbb','bbgbbbb.']},
  {n:'Primeiro Gelo',mv:20,goal:{ice:1},map:['........','........','........','........','........','........','iiii....','....iiii']},
  {n:'Pontos Rápidos',mv:18,goal:{pts:500},map:['........','........','........','........','........','........','........','........']},
  {n:'Gelo e Gemas',mv:24,goal:{gem:4,ice:1},map:['........','........','........','........','..g..g..','iibbbbi.','........','iibggb.i']},
  {n:'Primeira Tranca',mv:24,goal:{lock:1},sun:1,map:['........','........','........','...ll...','...ll...','........','........','........']},
  {n:'Geada',mv:30,goal:{ice:1},map:['........','.i....i.','........','..iiii..','..iiii..','........','.i....i.','........']},
  {n:'Pontos sob Pressão',mv:24,goal:{pts:1200},map:['b......b','........','........','...bb...','...bb...','........','........','b......b']},
  {n:'Cofre de Gemas',mv:30,goal:{gem:4,lock:1},sun:1,map:['........','........','..gllg..','..l..l..','..l..l..','..gllg..','........','........']},
  {n:'Inverno',mv:34,goal:{ice:1,gem:3},map:['i......i','.i.g..i.','..i..i..','...ii...','...ii...','..i..ig.','.ig...i.','i......i']},
  {n:'Dois Mil',mv:30,goal:{pts:2000},map:['bb....bb','b......b','........','........','........','........','b......b','bb....bb']},
  {n:'Selos Gêmeos',mv:30,goal:{lock:1},sun:1,map:['.l....l.','........','........','........','........','........','........','.l....l.']},
  {n:'Gelo Profundo',mv:32,goal:{ice:1},map:['........','..IIII..','..I..I..','..I..I..','..IIII..','........','........','........']},
  {n:'Joias do Vazio',mv:34,goal:{gem:8},map:['g.bbbb.g','.b....b.','b..gg..b','b......b','b......b','b..gg..b','.b....b.','g.bbbb.g']},
  {n:'Fortaleza',mv:38,goal:{lock:1,ice:1},sun:1,map:['........','.iiiiii.','.i....i.','.i.ll.i.','.i.ll.i.','.i....i.','.iiiiii.','........']},
  {n:'O Último Bloco',mv:40,goal:{pts:3000,gem:4},sun:1,map:['g......g','.ll..ll.','........','...ii...','...ii...','........','.ll..ll.','g......g']},
];
const BBGEM47=['#ff5a4a','#4aa8ff','#5ad46a','#ffd34a','#c77dff'];
function bbProg47(){const p=prog38().bb||{};return{lv:p.lv||{},best:p.best||0}}
const bbOpen47=i=>i===0||!!bbProg47().lv[i-1];
const bbGoalTxt47=g=>[g.gem?`💎 ${g.gem} gemas`:'',g.ice?'🧊 todo o gelo':'',g.lock?'🔒 todas as trancas':'',g.pts?`⭐ ${g.pts} pts`:''].filter(Boolean).join(' + ');
const bbSetup47={
  intro:()=>'Clássico usa a dificuldade do jogo. Na Aventura, cada fase vencida abre a próxima.',
  def:()=>({m:'c',lv:'0'}),
  fields:o=>{const p=bbProg47(),F=[{k:'m',l:'Modo',opts:[{v:'c',n:'Clássico Infinito',ico:'♾',d:'Jogue até faltar espaço.',badge:p.best?`🏆 ${p.best}`:''},{v:'a',n:'Aventura',ico:'🗺',d:'15 fases com objetivos e jogadas contadas.'}]}];
    if(o.m==='a')F.push({k:'lv',l:'Fase',wide:1,opts:BBLV47.map((L,i)=>{const lock=!bbOpen47(i),st=p.lv[i]||0;return{v:String(i),n:`${i+1}. ${L.n}`,ico:L.goal.lock?'🔒':L.goal.ice?'🧊':L.goal.gem?'💎':'⭐',d:lock?'Vença a fase anterior.':`${bbGoalTxt47(L.goal)} · ${L.mv} jogadas`,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});
    return F},
  fix:o=>{if(!['c','a'].includes(o.m))o.m='c';let i=Math.max(0,Math.min(BBLV47.length-1,+o.lv||0));while(i>0&&!bbOpen47(i))i--;o.lv=String(i)},
  sum:()=>'Arraste as peças para a grade. Solte uma peça na Reserva (à esquerda) para guardá-la; a Reserva recarrega quando você limpa uma linha. ☀ explode 3×3, 🪙 dá Óbolos.'
};

function blast47(C){
  const W=480,H=720,N=8,CS=52,X0=(W-N*CS)/2,Y0=112,TY=616,o=C.room.opt||{};
  const adv=o.m==='a',lv=adv?Math.max(0,Math.min(BBLV47.length-1,+o.lv||0)):-1,L=adv?BBLV47[lv]:null;
  const wts=BBW21[adv?1:(GD12[C.gd]??1)],tot=wts.reduce((a,b)=>a+b,0);
  const S={g:Array(N*N).fill(null),tray:[],hold:null,holdOk:true,k:0,score:0,combo:0,miss:0,best:0,drag:null,clr:[],over:false,overT:0,placed:0,perfect:0,lines:0,
    gems:0,cry:0,suns:0,sunChain:0,mv:L?L.mv:0,won:false,fever:0,deals:0,ring:[]};
  const me=me21(C),rnd=mb32(((C.seed^0xB10C)+lv*131)>>>0||7);
  const now0=()=>performance.now();
  if(L)L.map.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='.')return;const c={col:'#3a3354',t:0};
    if(ch==='g'){c.gem=BBGEM47[(x+y)%5];c.col='#2c2444'}else if(ch==='i'||ch==='I'){c.ice=ch==='I'?2:1;c.col='#7fd8ff'}else if(ch==='l'){c.lock=1;c.col='#5a5068'}S.g[y*N+x]=c}));
  const goal=L?L.goal:{},need={gem:goal.gem||0,ice:S.g.filter(c=>c&&c.ice).length,lock:S.g.filter(c=>c&&c.lock).length};
  const left=()=>({gem:Math.max(0,need.gem-S.gems),ice:S.g.filter(c=>c&&c.ice).length,lock:S.g.filter(c=>c&&c.lock).length,pts:Math.max(0,(goal.pts||0)-S.score)});
  const goalMet=()=>{if(!L)return false;const l=left();return(!goal.gem||!l.gem)&&(!goal.ice||!l.ice)&&(!goal.lock||!l.lock)&&(!goal.pts||!l.pts)};
  function newPiece(force){let r=rnd()*tot,i=0;while(r>=wts[i]){r-=wts[i];i++}const cells=BB21[i].map(c=>c.slice()),w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1;
    const p={cells,w,h,col:BBCOL21[Math.floor(rnd()*BBCOL21.length)],id:S.k++,sp:{}};
    const sunP=force?1:L&&L.sun?.12:.05,cryP=L?.04:.08;
    if(rnd()<sunP)p.sp[Math.floor(rnd()*cells.length)]='sun';else if(rnd()<cryP)p.sp[Math.floor(rnd()*cells.length)]='cry';
    return p}
  function deal(){S.deals++;const f=L&&L.sun?Math.floor(rnd()*3):-1;S.tray=[0,1,2].map(i=>newPiece(i===f));fx5('click')}
  deal();
  const free=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&!S.g[y*N+x];
  const fits=(p,gx,gy)=>p.cells.every(([cx,cy])=>free(gx+cx,gy+cy));
  const anyFit=p=>{if(!p)return false;for(let y=0;y<=N-p.h;y++)for(let x=0;x<=N-p.w;x++)if(fits(p,x,y))return true;return false};
  const slotX=i=>170+i*120,HX=58,HW=88;
  const trayScale=(p,box=100)=>Math.min(1,box/(Math.max(p.w,p.h)*26));
  const mult=()=>(1+(S.combo-1)*.5)*(S.fever?1.5:1);
  function burstAt(i,col,n=7){const x=X0+(i%N)*CS+CS/2,y=Y0+(i/N|0)*CS+CS/2;C.fx?.burst(x,y,{n,col:[col,'#fff'],sp:200,life:.65,size:3.2,grav:380})}
  /* remove uma casa; devolve true se saiu */
  function hit(i,hard,q){const c=S.g[i];if(!c)return;
    if(c.lock&&!hard)return;
    if(c.ice&&!hard&&c.ice>1){c.ice--;c.t=now0();burstAt(i,'#bff0ff',4);return}
    if(c.gem){S.gems++;C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'💎',{size:22,col:c.gem});fx5('mgCoin')}
    if(c.cry){S.cry++;S.score+=25;C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'+🪙',{size:20,col:'#ffd36b'});fx5('mgCoin')}
    if(c.lock){C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'🔓',{size:22,col:'#fff'})}
    S.clr.push({i,col:c.ice?'#bff0ff':c.col,t:now0()+q*18});S.g[i]=null;setTimeout(()=>burstAt(i,c.col),q*18);
    if(c.sun)S.sunQ.push(i)}
  function place(p,gx,gy,fromHold){
    if(!fits(p,gx,gy))return false;
    const t=now0(),sp=p.sp||{};p.cells.forEach(([cx,cy],k)=>{const c={col:p.col,t};if(sp[k]==='sun')c.sun=1;if(sp[k]==='cry')c.cry=1;S.g[(gy+cy)*N+gx+cx]=c});
    S.score+=p.cells.length;S.placed++;if(L)S.mv--;fx5('mgBall');
    const rows=[],cols=[];for(let y=0;y<N;y++)if([...Array(N).keys()].every(x=>S.g[y*N+x]))rows.push(y);for(let x=0;x<N;x++)if([...Array(N).keys()].every(y=>S.g[y*N+x]))cols.push(x);
    const Ln=rows.length+cols.length;
    if(Ln){S.combo++;S.miss=0;S.lines+=Ln;S.best=Math.max(S.best,S.combo);S.holdOk=true;S.sunQ=[];
      const set=new Set();rows.forEach(y=>{for(let x=0;x<N;x++)set.add(y*N+x)});cols.forEach(x=>{for(let y=0;y<N;y++)set.add(y*N+x)});
      set.forEach(i=>hit(i,false,(i%N)+(i/N|0)));
      let chain=0;while(S.sunQ.length){const s=S.sunQ.shift();chain++;S.suns++;const sx=s%N,sy=s/N|0;
        C.fx?.flash('#fff1a8',.25);C.fx?.burst(X0+sx*CS+CS/2,Y0+sy*CS+CS/2,{n:30,col:['#ffd36b','#ff9b3d','#fff'],sp:320,life:.8,size:4,grav:0});fx5('bb7');
        S.ring.push({x:X0+sx*CS+CS/2,y:Y0+sy*CS+CS/2,t:now0()});
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=sx+dx,y=sy+dy;if(x<0||y<0||x>=N||y>=N)continue;const j=y*N+x;if(S.g[j]){S.score+=5;hit(j,true,chain*3+Math.abs(dx)+Math.abs(dy))}}}
      if(chain>=2)C.achieve?.('bb_sol');S.sunChain=Math.max(S.sunChain,chain);
      const gain=Math.round(Ln*(Ln+1)/2*50*mult());S.score+=gain;
      if(S.combo>=5&&!S.fever){S.fever=1;C.fx?.flash('#ff7ac8',.35);C.say('🔥 FERVOR! Pontos x1,5 enquanto o combo durar.',false)}
      fx5('bb'+Math.min(7,S.combo+Ln-1));C.fx?.shake(Math.min(16,3+Ln*2.5+S.combo),.3+Math.min(.3,S.combo*.03));
      const cy=Y0+(rows.length?(rows.reduce((a,b)=>a+b,0)/rows.length):3.5)*CS;
      C.fx?.float(W/2,cy,`+${gain}`,{col:'#fff',size:26+Math.min(18,Ln*3)});
      if(S.combo>=2)setTimeout(()=>C.fx?.float(W/2,cy-46,`x${mult().toFixed(1)} COMBO ${S.combo}`,{col:S.combo>=5?'#ff7ac8':'#ffd36b',size:28+Math.min(18,S.combo*2),life:1.1}),120);
      if(S.combo>=4)C.achieve?.('blast');if(S.combo>=8)C.achieve?.('bb_fervor');
      if(S.combo>=6){for(let k=0;k<4;k++)setTimeout(()=>C.fx?.burst(40+Math.random()*400,Y0+Math.random()*N*CS,{n:16,col:['#ff7ac8','#ffd36b','#7fe3ff'],kind:'star',sp:260,life:.9,size:4}),k*90)}
      if(S.g.every(c=>!c)){S.score+=300;S.perfect++;setTimeout(()=>{fx5('mgWin');C.fx?.flash('#fff3c0',.45);C.fx?.float(W/2,Y0+CS*4,'PERFEITO! +300',{col:'#ffd36b',size:40,life:1.5})},260)}
    }else{S.miss++;if(S.miss>=3&&S.combo){S.combo=0;if(S.fever){S.fever=0;C.fx?.float(W/2,Y0-26,'fervor apagado',{col:'#ff9bd1',size:16})}else C.fx?.float(W/2,Y0-26,'combo perdido',{col:'#c9b995',size:16})}}
    if(S.cry>=10)C.achieve?.('bb_cristal');
    if(fromHold)S.hold=null;else{S.tray=S.tray.map(q=>q===p?null:q);if(S.tray.every(q=>!q))deal()}
    check();return true}
  function stash(i){const p=S.tray[i];if(!p||!S.holdOk||S.over)return false;S.tray[i]=S.hold;S.hold=p;S.holdOk=false;fx5('activate');
    C.fx?.float(HX,TY-60,'guardada',{col:'#7fe3ff',size:14});if(S.tray.every(q=>!q))deal();check();return true}
  function canMove(){if(S.tray.some(anyFit)||anyFit(S.hold))return true;const n=S.tray.filter(Boolean).length;return S.holdOk&&!S.hold&&n===1}
  function check(){if(S.over)return;
    if(L&&goalMet()){S.won=true;end('win');return}
    if(L&&S.mv<=0){end('moves');return}
    if(!canMove())end('full')}
  function save(st){let first=false,rec=false;progPut38(p=>{p.bb=p.bb||{};p.bb.lv=p.bb.lv||{};if(L){first=!p.bb.lv[lv];if(st>(p.bb.lv[lv]||0)){p.bb.lv[lv]=st;rec=true}if(BBLV47.every((_,k)=>p.bb.lv[k]))C.achieve?.('bb_aventura')}else if(S.score>(p.bb.best||0)){p.bb.best=S.score;rec=true}});return{first,rec}}
  function end(why){S.over=true;S.why=why;S.overT=why==='win'?1.4:1.2;
    if(why==='win'){fx5('mgWin');C.fx?.flash('#fff3c0',.4);for(let k=0;k<6;k++)setTimeout(()=>C.fx?.burst(60+Math.random()*360,Y0+Math.random()*400,{n:18,col:['#ffd36b','#b48cff','#7fe3ff'],kind:'star',sp:240,life:1,size:4}),k*120)}
    else{fx5('mgLose');C.say(why==='moves'?'Acabaram as jogadas. Quase lá!':pick12(['Sem espaço. Nem a Inexistência cabe aí.','Fim da linha. Literalmente.','Tabuleiro cheio. Igual a minha tigela… nunca.']),false)}}
  function finish(){
    const mul=gdMul38(C.gd);let st=0,title,rw;
    if(L){if(S.won)st=S.mv>=Math.ceil(L.mv*.35)?3:S.mv>=Math.ceil(L.mv*.15)?2:1;const sv=save(st);
      if(S.won)S.score+=S.mv*40;
      rw={ob:S.won?Math.round(10+lv*1.6+st*3+(sv.first?15:0)+S.cry*2):2+S.cry*2,why:[`Fase ${lv+1}`,S.won?'★'.repeat(st):'',sv.first&&S.won?'fase nova':'',S.cry?`${S.cry} 🪙`:''].filter(Boolean).join(' · ')};
      title=S.won?`Fase ${lv+1} · ${L.n} vencida ${'★'.repeat(st)}${'☆'.repeat(3-st)} · ${S.mv} jogadas sobrando`:`Fase ${lv+1} · ${L.n}: ${S.why==='moves'?'acabaram as jogadas':'sem espaço'}`;
      S.sv=sv}
    else{const sv=save(0);rw={ob:Math.min(150,Math.round(S.score/250*mul+S.cry*2+(sv.rec?5:0))),why:[sv.rec?'recorde':'',S.cry?`${S.cry} 🪙`:''].filter(Boolean).join(' · ')||`${S.score} pts`};
      title=`Block Blast Astral · ${S.score} pontos · ${S.lines} linha${S.lines===1?'':'s'}${S.perfect?` · ${S.perfect} perfeito${S.perfect>1?'s':''}`:''}`}
    rw.xp=Math.round(rw.ob*.6);S.rw=rw;S.stars=st;
    const html=`<ul class="r38-l"><li>🧱 Linhas: <b>${S.lines}</b></li><li>🔥 Maior combo: <b>${S.best}</b></li><li>☀ Bombas de Sol: <b>${S.suns}</b></li><li>🪙 Cristais: <b>${S.cry}</b></li>${L?`<li>💎 Gemas: <b>${S.gems}</b></li><li>🎯 ${esc(bbGoalTxt47(goal))}</li>`:''}</ul>`+(L&&S.won&&S.sv.first&&lv<BBLV47.length-1?`<p class="r38-hi">🗺 Fase ${lv+2}: ${esc(BBLV47[lv+1].n)} foi aberta.</p>`:'');
    C.finish({title,rows:[{u:C.me,n:me.n,c:me.c,s:S.score,w:!!S.won}],unit:'pts',html})}
  function dragAt(px,py){const d=S.drag;if(!d)return;d.x=px;d.y=py;const p=d.p,tlx=px-p.w*CS/2,tly=py-d.lift-p.h*CS/2;d.gx=Math.round((tlx-X0)/CS);d.gy=Math.round((tly-Y0)/CS);d.ok=fits(p,d.gx,d.gy);d.toHold=!d.fromHold&&px<HX+HW/2+6&&py>TY-80}
  function drawBlock(x,X,Y,s,col,a=1){x.globalAlpha=a;rr21(x,X+1,Y+1,s-2,s-2,s*.16);x.fillStyle=col;x.fill();x.fillStyle='rgba(255,255,255,.28)';x.fillRect(X+4,Y+4,s-8,s*.16);x.fillStyle='rgba(0,0,0,.2)';x.fillRect(X+4,Y+s-s*.2,s-8,s*.12);x.globalAlpha=1}
  function drawMark(x,X,Y,s,c){
    if(c.sun||c.sp==='sun'){const cx=X+s/2,cy=Y+s/2,r=s*.2;x.save();x.fillStyle='#fff4b0';x.shadowColor='#ffb347';x.shadowBlur=s*.25;x.beginPath();x.arc(cx,cy,r,0,TAU16);x.fill();x.strokeStyle='#ffd36b';x.lineWidth=Math.max(1.5,s*.05);for(let k=0;k<8;k++){const a=k*Math.PI/4;x.beginPath();x.moveTo(cx+Math.cos(a)*r*1.35,cy+Math.sin(a)*r*1.35);x.lineTo(cx+Math.cos(a)*r*1.9,cy+Math.sin(a)*r*1.9);x.stroke()}x.restore()}
    if(c.cry||c.sp==='cry'){const cx=X+s/2,cy=Y+s/2,r=s*.26;x.save();x.fillStyle='#ffe27a';x.strokeStyle='#a87a10';x.lineWidth=Math.max(1,s*.04);x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.75,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.75,cy);x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.fillRect(cx-r*.2,cy-r*.55,r*.25,r*.5);x.restore()}
    if(c.gem){const cx=X+s/2,cy=Y+s/2,r=s*.3;x.save();x.fillStyle=c.gem;x.shadowColor=c.gem;x.shadowBlur=10;x.beginPath();x.moveTo(cx-r,cy-r*.3);x.lineTo(cx-r*.5,cy-r*.8);x.lineTo(cx+r*.5,cy-r*.8);x.lineTo(cx+r,cy-r*.3);x.lineTo(cx,cy+r);x.closePath();x.fill();x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(cx-r*.5,cy-r*.3);x.lineTo(cx,cy-r*.75);x.lineTo(cx+r*.2,cy-r*.3);x.closePath();x.fill();x.restore()}
    if(c.ice){x.save();x.fillStyle=c.ice>1?'rgba(150,215,255,.9)':'rgba(200,240,255,.7)';rr21(x,X+3,Y+3,s-6,s-6,s*.14);x.fill();x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.5;x.beginPath();x.moveTo(X+s*.2,Y+s*.3);x.lineTo(X+s*.45,Y+s*.2);x.moveTo(X+s*.6,Y+s*.75);x.lineTo(X+s*.8,Y+s*.6);x.stroke();x.restore()}
    if(c.lock){x.save();x.fillStyle='#2a2236';rr21(x,X+3,Y+3,s-6,s-6,s*.14);x.fill();x.strokeStyle='#8e7fa8';x.lineWidth=2;for(let k=0;k<3;k++){x.beginPath();x.moveTo(X+6,Y+10+k*(s-20)/2);x.lineTo(X+s-6,Y+10+k*(s-20)/2);x.stroke()}
      x.fillStyle='#c9b995';rr21(x,X+s*.32,Y+s*.42,s*.36,s*.3,3);x.fill();x.strokeStyle='#c9b995';x.lineWidth=3;x.beginPath();x.arc(X+s/2,Y+s*.42,s*.12,Math.PI,0);x.stroke();x.restore()}
  }
  function drawPiece(x,p,ox,oy,sc,dim){const sp=p.sp||{};p.cells.forEach(([cx,cy],k)=>{const X=ox+cx*sc,Y=oy+cy*sc;drawBlock(x,X,Y,sc,dim?'#4a4458':p.col);if(sp[k])drawMark(x,X,Y,sc,{sp:sp[k]})})}
  return{
    st:()=>S,fits,left,goalMet,lvl:()=>L,
    place:(i,gx,gy)=>{const p=i==='h'?S.hold:S.tray[i];if(p&&!S.over)return place(p,gx,gy,i==='h');return false},
    stash,
    reward:()=>S.rw||null,
    next(){if(!L||!S.won||lv>=BBLV47.length-1)return null;return{opt:{m:'a',lv:String(lv+1)},label:`Fase ${lv+2}: ${BBLV47[lv+1].n}`}},
    key(code,down){},
    ptr(t,px,py,e){
      if(Date.now()<C.t0||S.over)return;
      const lift=e&&e.pointerType==='mouse'?0:70;
      if(t==='down'){
        if(S.hold&&Math.abs(px-HX)<HW/2+8&&Math.abs(py-TY)<64){S.drag={p:S.hold,fromHold:1,x:px,y:py,lift};dragAt(px,py);fx5('click');return}
        for(let i=0;i<3;i++){const p=S.tray[i];if(!p)continue;const sc=trayScale(p)*26,w=p.w*sc,h=p.h*sc;if(Math.abs(px-slotX(i))<Math.max(56,w/2+12)&&Math.abs(py-TY)<Math.max(60,h/2+14)){S.drag={p,i,x:px,y:py,lift};dragAt(px,py);fx5('click');return}}}
      else if(t==='move')dragAt(px,py);
      else if(t==='up'&&S.drag){const d=S.drag;S.drag=null;
        if(d.toHold){if(!stash(d.i)){fx5('error');C.fx?.float(HX,TY-60,'recarregue limpando',{col:'#ff9b9b',size:13})}return}
        if(d.ok)place(d.p,d.gx,d.gy,!!d.fromHold);else fx5('error')}
    },
    step(dt){
      if(Date.now()<C.t0)return;
      if(S.over&&!S.done){S.overT-=dt;if(S.overT<=0){S.done=true;finish()}}
      const l=left();
      C.hud(`🧱 <b>${S.score}</b> pts${L?` · 🎯 ${[goal.gem?`💎 ${l.gem}`:'',goal.ice?`🧊 ${l.ice}`:'',goal.lock?`🔒 ${l.lock}`:'',goal.pts?`⭐ ${l.pts}`:''].filter(Boolean).join(' ')} · 🕹 ${S.mv}`:` · ${S.lines} linhas`}${S.combo>=2?` · <b style="color:${S.fever?'#ff7ac8':'#ffd36b'}">x${mult().toFixed(1)} combo</b>`:''}`);
    },
    draw(x){
      const now=now0();const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,S.fever?'#3a0f3a':'#1a1030');g.addColorStop(1,'#0b0816');x.fillStyle=g;x.fillRect(0,0,W,H);
      if(S.fever){x.fillStyle=`rgba(255,122,200,${.06+.05*Math.sin(now/120)})`;x.fillRect(0,0,W,H)}
      x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++)x.fillRect((i*97)%W,(i*61)%H,1.4,1.4);
      t21(x,String(S.score),W/2,36,{size:36,w:900,col:'#fff',stroke:5});
      if(S.combo>=2)t21(x,`x${mult().toFixed(1)}`,W/2+96,38,{size:20,w:900,col:S.fever?'#ff7ac8':'#ffd36b'});
      if(L){const l=left(),parts=[goal.gem?`💎 ${l.gem}`:'',goal.ice?`🧊 ${l.ice}`:'',goal.lock?`🔒 ${l.lock}`:'',goal.pts?`⭐ ${l.pts}`:''].filter(Boolean);
        t21(x,`Fase ${lv+1} · ${L.n}`,W/2,66,{size:14,w:700,col:'#c9b995'});t21(x,`${parts.join('   ')}     🕹 ${S.mv} jogadas`,W/2,88,{size:16,w:800,col:S.mv<=3?'#ff8a8a':'#fff'})}
      else t21(x,`${S.lines} linhas${S.cry?` · 🪙 ${S.cry}`:''}`,W/2,72,{size:15,w:700,col:'#c9b995'});
      rr21(x,X0-8,Y0-8,N*CS+16,N*CS+16,14);x.fillStyle='#120c22';x.fill();x.strokeStyle=S.fever?'#ff7ac8':'#4b2f7a';x.lineWidth=S.fever?3:2;x.stroke();
      for(let i=0;i<N*N;i++){const X=X0+(i%N)*CS,Y=Y0+(i/N|0)*CS;rr21(x,X+2,Y+2,CS-4,CS-4,8);x.fillStyle='#1d1533';x.fill();const c=S.g[i];
        if(c){const pop=c.t?Math.min(1,(now-c.t)/140):1;const s=CS*(.85+.15*pop),bx=X+(CS-s)/2,by=Y+(CS-s)/2;if(!c.ice&&!c.lock)drawBlock(x,bx,by,s,c.col);drawMark(x,bx,by,s,c)}}
      S.clr=S.clr.filter(c=>now<c.t+260);S.clr.forEach(c=>{if(now<c.t){drawBlock(x,X0+(c.i%N)*CS,Y0+(c.i/N|0)*CS,CS,c.col);return}const k=(now-c.t)/260,s=CS*(1-k*.9);x.save();x.shadowColor='#fff';x.shadowBlur=14;drawBlock(x,X0+(c.i%N)*CS+(CS-s)/2,Y0+(c.i/N|0)*CS+(CS-s)/2,s,'#fff',1-k);x.restore()});
      S.ring=S.ring.filter(r=>now<r.t+450);S.ring.forEach(r=>{const k=(now-r.t)/450;x.save();x.strokeStyle=`rgba(255,211,107,${1-k})`;x.lineWidth=6*(1-k)+1;x.strokeRect(r.x-CS*1.5*(.4+k*.6),r.y-CS*1.5*(.4+k*.6),CS*3*(.4+k*.6),CS*3*(.4+k*.6));x.restore()});
      const d=S.drag;
      if(d&&d.ok&&!d.toHold){d.p.cells.forEach(([cx,cy])=>drawBlock(x,X0+(d.gx+cx)*CS,Y0+(d.gy+cy)*CS,CS,d.p.col,.35));
        const rows=new Set(),cols=new Set(),tmp=S.g.slice();d.p.cells.forEach(([cx,cy])=>tmp[(d.gy+cy)*N+d.gx+cx]=1);
        for(let y=0;y<N;y++)if([...Array(N).keys()].every(q=>tmp[y*N+q]))rows.add(y);for(let q=0;q<N;q++)if([...Array(N).keys()].every(y=>tmp[y*N+q]))cols.add(q);
        x.fillStyle='rgba(255,211,107,.18)';rows.forEach(y=>x.fillRect(X0,Y0+y*CS,N*CS,CS));cols.forEach(q=>x.fillRect(X0+q*CS,Y0,CS,N*CS))}
      rr21(x,112,TY-74,W-128,148,16);x.fillStyle='rgba(255,255,255,.05)';x.fill();
      rr21(x,HX-HW/2,TY-74,HW,148,16);x.fillStyle=d&&d.toHold?'rgba(127,227,255,.22)':'rgba(127,227,255,.07)';x.fill();x.strokeStyle=S.holdOk?'#7fe3ff':'#4a4458';x.lineWidth=2;x.setLineDash(S.holdOk?[]:[5,5]);x.stroke();x.setLineDash([]);
      t21(x,'Reserva',HX,TY-58,{size:12,w:700,col:S.holdOk?'#7fe3ff':'#7a7090'});t21(x,S.holdOk?'pronta':'limpe 1 linha',HX,TY+60,{size:11,w:600,col:S.holdOk?'#7dffa8':'#a89fb8'});
      if(S.hold&&!(d&&d.fromHold)){const p=S.hold,sc=trayScale(p,72)*26;drawPiece(x,p,HX-p.w*sc/2,TY-p.h*sc/2,sc,!anyFit(p))}
      S.tray.forEach((p,i)=>{if(!p||d&&d.p===p)return;const sc=trayScale(p)*26;drawPiece(x,p,slotX(i)-p.w*sc/2,TY-p.h*sc/2,sc,!anyFit(p))});
      if(d&&!d.toHold){const tlx=d.x-d.p.w*CS/2,tly=d.y-d.lift-d.p.h*CS/2;x.globalAlpha=.95;drawPiece(x,d.p,tlx,tly,CS,false);x.globalAlpha=1}
      else if(d){const sc=trayScale(d.p,72)*26;drawPiece(x,d.p,d.x-d.p.w*sc/2,d.y-d.p.h*sc/2,sc,false)}
      t21(x,'☀ explode 3×3 · 🪙 dá Óbolos · solte na Reserva para guardar',W/2,H-14,{size:12,w:500,col:'#8f85a6'});
      if(S.over){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,W,H);t21(x,S.why==='win'?'Fase vencida!':S.why==='moves'?'Sem jogadas!':'Sem espaço!',W/2,H/2-20,{size:38,w:900,col:S.why==='win'?'#ffd36b':'#fff',stroke:6})}
    }
  };
}
Object.assign(ACH,{
  bb_sol:{ico:'☀',n:'Reação Solar',d:'Detone duas Bombas de Sol na mesma jogada do Block Blast.'},
  bb_cristal:{ico:'🪙',n:'Garimpeiro Astral',d:'Colete 10 Cristais de Óbolos numa partida do Block Blast.'},
  bb_fervor:{ico:'🔥',n:'Fervor Infinito',d:'Chegue a um combo 8 no Block Blast.',secret:true},
  bb_aventura:{ico:'🗺',n:'Mapa Completo',d:'Vença as 15 fases da Aventura do Block Blast.'},
});
defineArcadeGame('blast',{...GAMES12.blast,make:blast47,setup:bbSetup47,
  desc:'Clássico Infinito e Aventura com 15 fases (gelo, trancas, gemas e metas). Reserva de peça, Bomba de Sol, Cristal de Óbolos e combo com Fervor.',
  rule:'Linhas e colunas cheias explodem. Jogadas seguidas que limpam sobem o multiplicador (x1,5, x2…); no combo 5 entra o Fervor (x1,5 a mais). Três jogadas sem limpar zeram. Tabuleiro vazio vale +300.',
  keys:'Arraste as peças com o mouse · solte na Reserva para guardar',touch:'Arraste as peças com o dedo (a peça fica acima do dedo)'});
console.info('[Tulpa] Etapa 47 carregada (Block Blast Astral 2.0)');

