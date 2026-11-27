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

/* ---------- 🎨 arte do Sudoku Teosófico (GFX60) · SOMENTE VISUAL ----------
   Direção: grimório aberto sobre a escrivaninha do copista. Legibilidade
   primeiro: casas claras de pergaminho, pistas em serifa escura, números do
   jogador em tinta violeta e erro marcado também por um X. Não usa a semente. */
function skArt46(){
  const G=window.GFX60,W=480,H=720,TAU=Math.PI*2;
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const ring=(g,X,Y,r,c,lw=1,dash)=>{g.strokeStyle=c;g.lineWidth=lw;g.setLineDash(dash||[]);g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke();g.setLineDash([])};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const gold=(g,y0,y1)=>vg(g,y0,y1,'#fbe3a0','#b8862e','#6e4a14','#d8ac50');
  const desk=()=>G.bake('sk:desk',W,H,(g,w,h)=>{
    G.fillTile(g,G.tile('madeira',{size:96,a:'#3a2218',b:'#150b07',seed:11}),0,0,w,h);box(g,0,0,w,h,'rgba(10,4,14,.5)');
    G.glow(g,w/2,230,340,'#a070d0',.16,{add:false});G.glow(g,w/2,640,260,'#d89a40',.18,{add:false});
    ring(g,w/2,640,150,'rgba(214,169,74,.14)',2);ring(g,w/2,640,132,'rgba(214,169,74,.1)',1,[4,8]);
    /* capa do grimório */
    box(g,2,2,476,472,'rgba(0,0,0,.45)',16);box(g,3,1,474,470,vg(g,0,470,'#4a1c34','#24091a'),15);rim(g,6.5,4.5,467,463,12,'rgba(214,169,74,.7)',1.5);
    [[3,1,1,1],[477,1,-1,1],[3,471,1,-1],[477,471,-1,-1]].forEach(([X,Y,i,j])=>{G.poly(g,[[X,Y],[X+i*24,Y],[X,Y+j*24]],'#d8ac50');disc(g,X+i*6,Y+j*6,2.2,'#6e4a14')});
    /* bandejas dos teclados */
    box(g,8,476,464,68,'rgba(8,4,12,.6)',14);rim(g,8.5,476.5,463,67,14,'rgba(214,169,74,.35)',1);box(g,8,547,464,60,'rgba(8,4,12,.6)',14);rim(g,8.5,547.5,463,59,14,'rgba(214,169,74,.35)',1);
  });
  /* tabuleiro 450×450 com 4 de moldura */
  const board=diag=>G.bake(`sk:board:${diag?1:0}`,466,466,(g,w,h,r)=>{
    box(g,0,0,466,466,gold(g,0,466),12);box(g,5,5,456,456,'#2a1a0c',7);
    for(let i=0;i<81;i++){const rr=i/9|0,c=i%9,q=(rr/3|0)*3+(c/3|0),X=8+c*50,Y=8+rr*50;let bg=(q%2)?'#efe0c0':'#faf3e2';if(diag&&(rr===c||rr+c===8))bg=(q%2)?'#e6d6f2':'#efe5fa';box(g,X,Y,50,50,bg)}
    G.fillTile(g,G.tile('pergaminho',{size:128,a:'#ffffff',b:'#b89860',seed:5}),8,8,450,450,{alpha:.0});
    for(let i=0;i<26;i++){const X=8+r()*450,Y=8+r()*450,R=18+r()*46;g.save();g.beginPath();g.rect(8,8,450,450);g.clip();const q=g.createRadialGradient(X,Y,0,X,Y,R);q.addColorStop(0,'rgba(150,110,50,.09)');q.addColorStop(1,'rgba(150,110,50,0)');g.fillStyle=q;g.fillRect(X-R,Y-R,R*2,R*2);g.restore()}
    for(let i=0;i<700;i++){g.fillStyle='rgba(110,80,40,.13)';g.fillRect(8+r()*450,8+r()*450,1,1)}
  },{s:2});
  const key=(w,h,state)=>G.bake(`sk:key:${w}x${h}:${state}`,w,h,g=>{
    const C={base:['#4a3670','#241838','#d8ac50'],sel:['#7a48d0','#43207c','#ffe9a8'],full:['#2a2434','#181420','#4a4058'],on:['#ffe08a','#d8a02a','#fff6d0']}[state];
    box(g,0,0,w,h,'rgba(0,0,0,.5)',11);box(g,0,0,w,h-3,C[2],11);box(g,2,2,w-4,h-7,vg(g,2,h-5,C[0],C[1]),9);box(g,6,4,w-12,3,'rgba(255,255,255,.2)',2)},{s:2});
  /* ícones das ferramentas */
  function tool(g,k,cx,cy,c){
    g.save();g.translate(cx,cy);
    if(k==='pen'){g.rotate(Math.PI/4);box(g,-3.5,-10,7,14,c,1);G.poly(g,[[-3.5,5],[3.5,5],[0,11]],c);box(g,-3.5,-13,7,2.5,c,1)}
    else if(k==='auto'){rim(g,-10,-10,20,20,3,c,1.8);for(let j=0;j<3;j++)for(let i=0;i<3;i++)disc(g,-5+i*5,-5+j*5,1.5,c)}
    else if(k==='hint'){disc(g,0,-3,7.5,c);box(g,-4,4,8,4,c,1);box(g,-3,9,6,2.4,c,1);[[-12,-4,-9.5,-4],[12,-4,9.5,-4],[-8,-12,-6.5,-10.5],[8,-12,6.5,-10.5]].forEach(([a,b,d,e])=>line(g,[[a,b],[d,e]],c,1.6))}
    else if(k==='del'){G.poly(g,[[-13,0],[-5,-9],[12,-9],[12,9],[-5,9]],c);line(g,[[-1,-4],[7,4]],'#241838',2.4);line(g,[[7,-4],[-1,4]],'#241838',2.4)}
    else{const m=k==='undo'?1:-1;g.scale(m,1);g.strokeStyle=c;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-6,-4);g.lineTo(3,-4);g.arc(3,2,6,-Math.PI/2,Math.PI/2);g.lineTo(-3,8);g.stroke();G.poly(g,[[-12,-4],[-4,-11],[-4,3]],c)}
    g.restore();
  }
  function cross(g,cx,cy,r,c,lw=2){line(g,[[cx-r,cy-r],[cx+r,cy+r]],c,lw);line(g,[[cx+r,cy-r],[cx-r,cy+r]],c,lw)}
  const note=()=>G.bake('sk:note',456,66,(g,w,h)=>{box(g,0,0,456,66,'#e8d9b4',10);G.fillTile(g,G.tile('pergaminho',{size:96,seed:2}),2,2,452,62,{alpha:.5});rim(g,1,1,454,64,10,'#8a6a2a',1.5);rim(g,4.5,4.5,447,57,7,'rgba(138,106,42,.4)',1)},{s:2});
  return{desk,board,key,tool,cross,note,amb:G.ambient('poeira',{W,H,n:14,col:'#ffd98a',seed:46})};
}
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
  const GX=window.GFX60,art=skArt46(),V={v:S.v.slice(),pop:[],err:0,lines:0,done:false,hurt:-1e9,last:-1};
  GX.skin({acc:'#c9a8ff'});
  function wrapLines(x,str,maxW,size){x.font=`600 ${size}px ${UI21}`;const out=[];let line='';String(str).split(' ').forEach(w=>{const n=line?line+' '+w:w;if(x.measureText(n).width>maxW&&line){out.push(line);line=w}else line=n});if(line)out.push(line);return out}
  /* efeitos só de imagem, disparados quando o estado muda */
  function fxEvents(){
    const now=performance.now();
    for(let i=0;i<81;i++)if(S.v[i]!==V.v[i]){V.v[i]=S.v[i];if(S.v[i]){V.pop[i]=now;V.last=i}}
    const at=V.last>=0?cellXY(V.last):[X0+CS*4,Y0+CS*4];
    if(S.err>V.err){V.hurt=now;GX.hitstop(80);GX.emit('estilhacos',at[0]+CS/2,at[1]+CS/2,{col:'#ff5b6b',amount:.7})}V.err=S.err;
    if(S.lines.size>V.lines){GX.hitstop(60);GX.emit('brilho',at[0]+CS/2,at[1]+CS/2,{col:'#ffd36b',amount:2})}V.lines=S.lines.size;
    if(S.done&&!V.done){V.done=true;if(!S.lost){GX.hitstop(110);GX.emit('confete',W/2,Y0+CS*4.5,{amount:1.6})}}
  }
  return{
    g60intro:{title:'Sudoku Teosófico',sub:title,acc:'#c9a8ff'},
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
      C.hud(GX.chips([{icon:'olho',value:title},{icon:flash?'raio':'relogio',value:mmss21(flash?Math.max(0,S.clock):S.t),tone:flash&&S.clock<30?'warn':null},{icon:'caveira',label:'erros',value:S.err,tone:S.err?(life?'bad':'warn'):null},
        life?{icon:'coracao',label:'lucidez',value:Math.max(0,3-S.err),tone:S.err>=2?'bad':null}:null,{icon:'estrela',label:'dicas',value:S.hints},{icon:'chama',value:'x'+mult().toFixed(1)},S.pen?{icon:'nota',value:'lápis ligado',tone:'ok'}:null]))},
    draw(x){
      const now=performance.now(),t=now/1000,red=GX.reduced();
      x.drawImage(art.desk(),0,0,W,H);
      art.amb.draw(x,t);
      const sv=S.sel>=0?S.v[S.sel]:0,hg=S.hint?new Set(G[S.hint.gi].ids):null,selG=S.sel>=0?new Set(of[S.sel].flatMap(gi=>G[gi].ids)):new Set();
      fxEvents();
      x.drawImage(art.board(diag),X0-8,Y0-8,466,466);
      for(let i=0;i<81;i++){const r=i/9|0,c=i%9,[cx,cy]=cellXY(i),dg=diag&&(r===c||r+c===8);
        let bg=null;
        if(selG.has(i))bg=dg?'#d6c2f0':'#e2d3f5';
        if(sv&&S.v[i]===sv&&!S.wrong.has(i))bg='#c9b0f2';
        if(hg&&hg.has(i))bg='#c9ecd9';
        if(i===S.sel)bg=S.hint&&S.hint.i===i?'#7dffa8':'#ffd36b';
        if(S.wrong.has(i))bg=i===S.sel?'#ffb9ae':'#ffd6d1';
        const pu=S.pulse[i];if(pu&&now>pu&&now<pu+450){const k=1-(now-pu)/450;bg=`rgba(255,211,107,${.4+k*.6})`}
        if(bg){x.fillStyle=bg;x.fillRect(cx,cy,CS,CS)}
        const v=S.v[i];
        if(v){const bad=S.wrong.has(i),giv=S.given[i],a=(now-(V.pop[i]||-1e9))/260,k=!red&&a<1?1+.45*(1-a)*(1-a):1;
          x.font=giv?`700 ${33*k}px Georgia,"Times New Roman",serif`:`600 ${30*k}px ${UI21}`;x.textAlign='center';x.textBaseline='middle';
          x.fillStyle=bad?'#930b1e':giv?'#1b1020':'#3f1488';x.fillText(String(v),cx+CS/2,cy+CS/2+(giv?0:1.5));
          if(bad)art.cross(x,cx+CS-10,cy+10,4,'#930b1e',2.4)}
        else if(S.notes[i].size){x.textAlign='center';x.textBaseline='middle';S.notes[i].forEach(n=>{const nx=cx+((n-1)%3)*15+10,ny=cy+Math.floor((n-1)/3)*14+11,hot=n===sv;if(hot){x.fillStyle='#5b2fa8';x.beginPath();x.arc(nx,ny,7.5,0,TAU16);x.fill()}x.font=`700 13px ${UI21}`;x.fillStyle=hot?'#ffffff':'#4a3660';x.fillText(n,nx,ny+.5)})}
      }
      x.strokeStyle='rgba(110,82,44,.55)';x.lineWidth=1;x.beginPath();for(let k=1;k<9;k++){if(k%3===0)continue;x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS)}x.stroke();
      x.strokeStyle='#2a1608';x.lineWidth=3.5;x.beginPath();for(let k=0;k<=9;k+=3){x.moveTo(X0+k*CS,Y0);x.lineTo(X0+k*CS,Y0+9*CS);x.moveTo(X0,Y0+k*CS);x.lineTo(X0+9*CS,Y0+k*CS)}x.stroke();
      if(diag){x.save();x.strokeStyle='rgba(91,47,168,.3)';x.lineWidth=2;x.setLineDash([6,6]);x.beginPath();x.moveTo(X0,Y0);x.lineTo(X0+9*CS,Y0+9*CS);x.moveTo(X0+9*CS,Y0);x.lineTo(X0,Y0+9*CS);x.stroke();x.restore()}
      if(S.sel>=0){const [cx,cy]=cellXY(S.sel);if(!S.done)GX.glow(x,cx+CS/2,cy+CS/2,40,'#ffb020',.2+(red?0:.1*Math.sin(t*5)));x.strokeStyle='#6a3a00';x.lineWidth=3.5;rr21(x,cx+1.5,cy+1.5,CS-3,CS-3,6);x.stroke()}
      /* teclado de números */
      for(let v=1;v<=9;v++){const bx=X0+(v-1)*CS+3,full=count(v)>=9,w=CS-6,on=v===sv&&!full;
        x.drawImage(art.key(w,56,full?'full':on?'sel':'base'),bx,PADY,w,56);if(on)GX.glow(x,bx+w/2,PADY+28,34,'#b48cff',.35);
        t21(x,String(v),bx+w/2,PADY+22,{size:29,w:800,col:full?'#8a7ea0':'#ffffff'});
        if(full){x.strokeStyle='#7dffa8';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(bx+w/2-7,PADY+43);x.lineTo(bx+w/2-2,PADY+47);x.lineTo(bx+w/2+7,PADY+38);x.stroke()}
        else GX.hud.text(x,String(9-count(v)),bx+w/2,PADY+43,{size:13,al:'center',w:800,col:'#ffe0a0',min:10,stroke:0})}
      ACT.forEach(([k],i)=>{const bx=X0+i*(ACTW+ACTG),on=(k==='pen'&&S.pen)||(k==='hint'&&!!S.hint),off=(k==='undo'&&!S.hist.length)||(k==='redo'&&!S.redo.length),col=on?'#241200':off?'#8d7fa6':'#fff2d8';
        x.drawImage(art.key(ACTW,50,on?'on':off?'full':'base'),bx,ACTY,ACTW,50);
        if(k==='hint'&&!S.hint&&S.hints>0&&!S.done)GX.glow(x,bx+ACTW/2,ACTY+17,26,'#ffd36b',.28);
        art.tool(x,k,bx+ACTW/2,ACTY+17,k==='hint'&&!on&&S.hints>0?'#ffd96a':col);
        const lbl={pen:S.pen?'Lápis: on':'Lápis',auto:'Anotar',hint:S.hint?'Aplicar':`Dica ${S.hints}`,del:'Apagar',undo:'Desfazer',redo:'Refazer'}[k];
        GX.hud.text(x,lbl,bx+ACTW/2,ACTY+38,{size:12,al:'center',w:800,col,min:9,max:ACTW-6,stroke:0})});
      /* bilhete da dica */
      x.drawImage(art.note(),12,610,456,66);
      {const msg=S.hint?S.hint.txt:S.pen?'Lápis ligado: os números viram anotações pequenas.':'Toque numa casa e depois num número.';
        let size=S.hint?14:15,ls=wrapLines(x,msg,430,size);while(ls.length>3&&size>10){size--;ls=wrapLines(x,msg,430,size)}
        const lh=Math.min(19,58/ls.length);ls.forEach((l,i)=>{x.font=`600 ${size}px ${UI21}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle=S.hint?'#0f3a24':'#33200c';x.fillText(l,W/2,643+(i-(ls.length-1)/2)*lh,440)})}
      /* painel de situação */
      {const y=H-24,low=flash&&S.clock<30;
        GX.hud.chip(x,72,y,{icon:flash?'raio':'relogio',text:flash?mmss21(Math.max(0,S.clock)):mmss21(S.t),col:low?'#ff6b7a':'#ffd36b',size:15,al:'center'});
        GX.hud.chip(x,186,y,{icon:'caveira',text:`${S.err} erro${S.err===1?'':'s'}`,col:S.err?'#ff8a8a':'#b9a6ff',size:14,al:'center'});
        if(life){GX.hud.panel(x,252,y-15,86,30,{r:15,acc:'#c39bff',a:.9});GX.hud.pips(x,261,y,Math.max(0,3-S.err),3,{icon:'olho',size:18,col:'#d4b0ff',min:10})}
        else GX.hud.chip(x,295,y,{icon:'estrela',text:`${Math.round(S.pts)} pts`,col:'#b9a6ff',size:14,al:'center'});
        GX.hud.chip(x,406,y,{icon:'chama',text:`x${mult().toFixed(1)}`,col:S.streak>=5?'#ff9a3c':'#ffd36b',size:15,al:'center'});
        if(S.streak>=5&&!S.done)GX.glow(x,406,y,40,'#ff8a1a',.2+(red?0:.1*Math.sin(t*6)),{sy:.6})}
      if(S.done){if(!S.lost){GX.rays(x,W/2,Y0+CS*4.5,{n:12,len:300,col:'#ffd36b',a:.14,t});GX.glow(x,W/2,Y0+CS*4.5,220,'#ffd36b',.18)}
        if(Date.now()>=C.t0)GX.hud.banner(x,W,H,S.lost?(flash&&S.clock<=0?'Tempo esgotado':'Lucidez esgotada'):'Selo completo!',{acc:S.lost?'#ff8a8a':'#ffd36b',y:Y0+CS*2,sub:S.lost?'':`${mmss21(S.t)} · ${S.err} erro${S.err===1?'':'s'}`})}
      if(now-V.hurt<420)GX.vignette(x,W,H,{a:.75*(1-(now-V.hurt)/420),col:'#a00c24'});
      GX.vignette(x,W,H,{a:.3});GX.hud.frame(x,W,H,{acc:'#d6a94a',a:.55});
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

/* ---------- 🎨 arte do Block Blast (GFX60) · SOMENTE VISUAL ----------
   Direção: relicário de um observatório, latão e índigo, blocos de
   esmalte lapidado. Não toca na sacola de peças nem na semente. */
function bbArt47(){
  const G=window.GFX60,W=480,H=720,TAU=Math.PI*2;
  const disc=(g,X,Y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill()};
  const path=(g,X,Y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(X,Y,w,h,r);else g.rect(X,Y,w,h)};
  const box=(g,X,Y,w,h,c,r=0)=>{g.fillStyle=c;path(g,X,Y,w,h,r);g.fill()};
  const rim=(g,X,Y,w,h,r,c,lw=1)=>{g.strokeStyle=c;g.lineWidth=lw;path(g,X,Y,w,h,r);g.stroke()};
  const line=(g,pts,c,lw=2)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const ring=(g,X,Y,r,c,lw=1,dash)=>{g.strokeStyle=c;g.lineWidth=lw;g.setLineDash(dash||[]);g.beginPath();g.arc(X,Y,r,0,TAU);g.stroke();g.setLineDash([])};
  const vg=(g,y0,y1,...s)=>{const q=g.createLinearGradient(0,y0,0,y1);s.forEach((c,i)=>q.addColorStop(i/(s.length-1),c));return q};
  const brass=(g,y0,y1)=>vg(g,y0,y1,'#fbe3a0','#b8862e','#6e4a14','#d8ac50');

  const bg=fever=>G.bake(`bb:bg:${fever?1:0}`,W,H,(g,w,h,r)=>{box(g,0,0,w,h,vg(g,0,h,...(fever?['#3a0b36','#5a1246','#1c0618']:['#171038','#241640','#0a0714'])));
    G.glow(g,w/2,320,330,fever?'#ff4ab0':'#6a4ac8',fever?.42:.3,{add:false});G.glow(g,w/2,H,260,fever?'#ff8a3a':'#b8802a',.22,{add:false});
    G.paint.stars({n:110,col:fever?'#ffd6ee':'#e4dcff',size:1.4,bottom:1})(g,w,h,r);
    /* constelações */
    for(let k=0;k<7;k++){let X=30+r()*(w-60),Y=30+r()*(h-60);const p=[[X,Y]];for(let i=0;i<4;i++){X+=(r()-.5)*90;Y+=(r()-.5)*70;p.push([X,Y])}line(g,p,'rgba(232,196,120,.15)',1);p.forEach(([a,b])=>disc(g,a,b,1.7,'rgba(255,226,160,.55)'))}
    /* colunas laterais */
    [0,w].forEach((X,i)=>{const d=i?-1:1;box(g,X-(i?9:0),0,9,h,'rgba(8,4,16,.65)');box(g,X+d*10-(i?1.5:0),0,1.5,h,'rgba(220,170,80,.35)');for(let y=40;y<h;y+=92)G.poly(g,[[X+d*10,y-8],[X+d*17,y],[X+d*10,y+8],[X+d*3,y]],'rgba(220,170,80,.4)')})});
  const astro=()=>G.bake('bb:astro',640,640,g=>{const c=320;[[312,2,.3],[300,1,.2],[262,6,.1],[228,1,.28],[170,1.5,.18]].forEach(([R,lw,a])=>ring(g,c,c,R,`rgba(232,190,100,${a})`,lw));
    for(let i=0;i<120;i++){const a=i*TAU/120,l=i%10?6:14;line(g,[[c+Math.cos(a)*300,c+Math.sin(a)*300],[c+Math.cos(a)*(300-l),c+Math.sin(a)*(300-l)]],'rgba(232,190,100,.3)',1)}
    ring(g,c,c,282,'rgba(232,190,100,.25)',3,[2,16]);g.save();g.translate(c,c);for(let i=0;i<12;i++){g.rotate(TAU/12);disc(g,0,-262,9,'rgba(20,10,36,.9)');ring(g,0,-262,9,'rgba(232,190,100,.45)',1.5);G.poly(g,[[0,-267],[3,-262],[0,-257],[-3,-262]],'rgba(255,220,140,.5)')}
      line(g,[[-228,0],[228,0]],'rgba(232,190,100,.14)',1);line(g,[[0,-228],[0,228]],'rgba(232,190,100,.14)',1);g.restore();
    g.beginPath();g.ellipse(c,c,300,118,.5,0,TAU);g.strokeStyle='rgba(232,190,100,.2)';g.lineWidth=1.5;g.stroke()});
  /* moldura e os 64 nichos (casa de 52) */
  const board=()=>G.bake('bb:board',440,440,(g,w,h,r)=>{box(g,0,0,w,h,brass(g,0,h),18);rim(g,.5,.5,w-1,h-1,18,'#2a1804',1.5);box(g,6,6,w-12,h-12,'#1a0f26',13);rim(g,6,6,w-12,h-12,13,'rgba(255,232,170,.75)',1.5);rim(g,9.5,9.5,w-19,h-19,10,'rgba(0,0,0,.7)',2);
    for(let y=0;y<8;y++)for(let X=0;X<8;X++){const a=12+X*52,b=12+y*52;box(g,a+2,b+2,48,48,vg(g,b+2,b+50,'#0d0819','#22173a'),8);rim(g,a+2.5,b+2.5,47,47,8,'rgba(0,0,0,.65)',1);box(g,a+8,b+48.4,36,1.2,'rgba(190,160,255,.24)');
      G.poly(g,[[a+26,b+19],[a+33,b+26],[a+26,b+33],[a+19,b+26]],(X+y)%2?'rgba(150,120,220,.13)':'rgba(232,190,100,.1)');disc(g,a+26,b+26,1.2,'rgba(232,206,150,.28)')}
    [[10,10],[w-10,10],[10,h-10],[w-10,h-10]].forEach(([X,Y])=>{disc(g,X,Y,9,'#4a2e0a');disc(g,X,Y,7.5,'#ffd98a');G.poly(g,[[X,Y-5],[X+5,Y],[X,Y+5],[X-5,Y]],'#7a3ad0');disc(g,X-1.4,Y-1.8,1.3,'#fff')})},{s:2});
  /* bloco de esmalte lapidado */
  const block=col=>G.bake(`bb:blk:${col}`,52,52,g=>{const dk=G.shade(col,-.5);box(g,1,1,50,50,dk,9);g.save();path(g,2,2,48,48,8);g.clip();
    box(g,2,2,48,48,col);G.poly(g,[[2,2],[50,2],[41,11],[11,11]],G.shade(col,.52));G.poly(g,[[2,2],[11,11],[11,41],[2,50]],G.shade(col,.24));G.poly(g,[[50,2],[50,50],[41,41],[41,11]],G.shade(col,-.22));G.poly(g,[[2,50],[11,41],[41,41],[50,50]],G.shade(col,-.42));
    box(g,11,11,30,30,vg(g,11,41,G.shade(col,.2),col,G.shade(col,-.18)),3);G.poly(g,[[26,15],[37,26],[26,37],[15,26]],'rgba(255,255,255,.1)');line(g,[[15,26],[26,15],[37,26]],'rgba(255,255,255,.42)',1.2);line(g,[[15,26],[26,37],[37,26]],'rgba(0,0,0,.25)',1.2);
    G.poly(g,[[12,12],[27,12],[12,27]],'rgba(255,255,255,.16)');g.restore();rim(g,11,11,30,30,3,'rgba(255,240,200,.3)',1);G.poly(g,[[15,9],[16.6,13.4],[21,15],[16.6,16.6],[15,21],[13.4,16.6],[9,15],[13.4,13.4]],'#ffffff');rim(g,1.5,1.5,49,49,9,'rgba(6,2,14,.8)',1)},{s:2});
  const sun=()=>G.bake('bb:sun',52,52,g=>{G.glow(g,26,26,25,'#ff8a1a',.85,{add:false});for(let i=0;i<10;i++){const a=i*TAU/10;G.poly(g,[[26+Math.cos(a-.22)*11,26+Math.sin(a-.22)*11],[26+Math.cos(a)*(i%2?19:23),26+Math.sin(a)*(i%2?19:23)],[26+Math.cos(a+.22)*11,26+Math.sin(a+.22)*11]],'#ffe27a')}
    disc(g,26,26,12,'#7a3a00');disc(g,26,26,10.5,'#ffc02a');disc(g,26,26,7,'#fff2a8');disc(g,23,23,2.4,'#fff')},{s:2});
  const coin=()=>G.bake('bb:coin',52,52,g=>{G.glow(g,26,26,22,'#fff0a0',.55,{add:false});G.draw(g,G.prop.coin(14),26,26,{w:30});G.poly(g,[[38,9],[40,14],[45,16],[40,18],[38,23],[36,18],[31,16],[36,14]],'#fff')},{s:2});
  const gem=col=>G.bake(`bb:gem:${col}`,52,52,g=>{G.glow(g,26,26,26,col,.75,{add:false});ring(g,26,26,17.5,'#4a2e0a',5);ring(g,26,26,17.5,'#f4cc70',2.6);[[26,8.5],[43.5,26],[26,43.5],[8.5,26]].forEach(([X,Y])=>disc(g,X,Y,3,'#ffe4a0'));G.draw(g,G.prop.gem(col,32,6),26,26,{w:31})},{s:2});
  const ice=n=>G.bake(`bb:ice:${n}`,52,52,(g,w,h,r)=>{box(g,2,2,48,48,vg(g,2,50,...(n>1?['#d8f4ff','#5aa8e0','#2c6aa8']:['#e4f8ff','#8cccec','#5a9ccc'])),9);G.poly(g,[[5,5],[25,5],[5,30]],'rgba(255,255,255,.45)');G.poly(g,[[47,22],[47,47],[22,47]],'rgba(20,70,120,.28)');
    line(g,[[8,36],[19,30],[17,22],[27,16]],'rgba(255,255,255,.9)',1.4);line(g,[[30,43],[36,34],[45,32]],'rgba(255,255,255,.8)',1.2);for(let i=0;i<9;i++)disc(g,6+r()*40,6+r()*40,.6+r(),'#fff');rim(g,2.7,2.7,46.6,46.6,9,'#f2fcff',1.6);
    if(n>1){rim(g,8,8,36,36,6,'#ffffff',2.4);for(let i=0;i<3;i++){const a=i*Math.PI/3;line(g,[[26-Math.cos(a)*11,26-Math.sin(a)*11],[26+Math.cos(a)*11,26+Math.sin(a)*11]],'#fff',2.2)}[[8,8],[44,8],[8,44],[44,44]].forEach(([X,Y])=>disc(g,X,Y,2.6,'#fff'))}},{s:2});
  const lock=()=>G.bake('bb:lock',52,52,g=>{box(g,2,2,48,48,vg(g,2,50,'#5a4e72','#241c34'),8);rim(g,2.7,2.7,46.6,46.6,8,'#a898c8',1.4);[[[4,4],[48,48]],[[48,4],[4,48]]].forEach(([a,b])=>{line(g,[a,b],'#0c0814',8);g.setLineDash([5,3]);line(g,[a,b],'#b8acd0',4);g.setLineDash([])});
    g.strokeStyle='#1c1206';g.lineWidth=6.5;g.beginPath();g.arc(26,23,7.5,Math.PI,0);g.lineTo(33.5,28);g.moveTo(18.5,23);g.lineTo(18.5,28);g.stroke();g.strokeStyle='#e8d4a0';g.lineWidth=3.4;g.stroke();box(g,15,25,22,18,brass(g,25,43),4);rim(g,15,25,22,18,4,'#2a1804',1.2);disc(g,26,32.5,2.8,'#1c1206');box(g,24.8,33,2.4,6,'#1c1206');
    [[8,8],[44,8],[8,44],[44,44]].forEach(([X,Y])=>disc(g,X,Y,2.2,'#d8cce8'))},{s:2});
  /* mesa das peças: reserva à esquerda (x 14..102) e três pedestais */
  const tray=()=>G.bake('bb:tray',W,156,g=>{box(g,110,3,356,150,brass(g,3,153),18);box(g,113,6,350,144,vg(g,6,150,'#241638','#0e0819'),15);rim(g,113,6,350,144,15,'rgba(255,232,170,.45)',1);
    [170,290,410].forEach(X=>{G.glow(g,X,78,60,'#8a6ae0',.28,{add:false});ring(g,X,78,50,'rgba(232,190,100,.2)',1.5);ring(g,X,78,43,'rgba(232,190,100,.12)',1,[3,6]);g.beginPath();g.ellipse(X,134,40,6,0,0,TAU);g.fillStyle='rgba(232,190,100,.16)';g.fill()});
    [230,350].forEach(X=>{line(g,[[X,24],[X,132]],'rgba(232,190,100,.2)',1);G.poly(g,[[X,71],[X+4,78],[X,85],[X-4,78]],'rgba(232,190,100,.45)')});
    box(g,12,3,92,150,brass(g,3,153),18);box(g,15,6,86,144,vg(g,6,150,'#112a3c','#08111e'),15);G.glow(g,58,78,52,'#4ab8e0',.25,{add:false});ring(g,58,78,36,'rgba(127,227,255,.2)',1.5,[4,5])},{s:2});
  const beam=vert=>G.bake(`bb:beam:${vert?1:0}`,vert?64:440,vert?440:64,(g,w,h)=>{const q=g.createLinearGradient(0,0,vert?w:0,vert?0:h);q.addColorStop(0,'rgba(255,220,140,0)');q.addColorStop(.35,'rgba(255,214,110,.7)');q.addColorStop(.5,'rgba(255,255,255,1)');q.addColorStop(.65,'rgba(255,214,110,.7)');q.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=q;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='destination-in';const m=g.createLinearGradient(0,0,vert?0:w,vert?h:0);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.12,'#000');m.addColorStop(.88,'#000');m.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=m;g.fillRect(0,0,w,h)});
  const icon=(k,col)=>k==='gem'?gem(col||'#4aa8ff'):k==='ice'?ice(1):k==='lock'?lock():k==='sun'?sun():coin();
  return{bg,astro,board,block,sun,coin,gem,ice,lock,tray,beam,icon,motes:G.ambient('motes',{W,H,n:22,col:'#ffd98a',seed:5}),embers:G.ambient('brasas',{W,H,n:30,col:'#ff7ac8',seed:8})};
}

function blast47(C){
  const W=480,H=720,N=8,CS=52,X0=(W-N*CS)/2,Y0=112,TY=616,o=C.room.opt||{};
  const adv=o.m==='a',lv=adv?Math.max(0,Math.min(BBLV47.length-1,+o.lv||0)):-1,L=adv?BBLV47[lv]:null;
  const wts=BBW21[adv?1:(GD12[C.gd]??1)],tot=wts.reduce((a,b)=>a+b,0);
  const S={g:Array(N*N).fill(null),tray:[],hold:null,holdOk:true,k:0,score:0,combo:0,miss:0,best:0,drag:null,clr:[],over:false,overT:0,placed:0,perfect:0,lines:0,
    gems:0,cry:0,suns:0,sunChain:0,mv:L?L.mv:0,won:false,fever:0,deals:0,ring:[]};
  const me=me21(C),rnd=mb32(((C.seed^0xB10C)+lv*131)>>>0||7);
  const now0=()=>performance.now();
  /* somente visual: arte GFX60, HUD vestido, feixes das linhas limpas e recorde na entrada */
  const G=window.GFX60,art=bbArt47(),best0=bbProg47().best;let beams=[];
  const cell=i=>[X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS+CS/2];
  G.skin({acc:'#ffd36b'});
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
    if(c.ice&&!hard&&c.ice>1){c.ice--;c.t=now0();burstAt(i,'#bff0ff',4);G.emit('estilhacos',...cell(i),{col:'#d8f4ff',amount:.5});return}
    if(c.gem){S.gems++;C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'+1 gema',{size:18,col:c.gem});fx5('mgCoin');G.emit('brilho',...cell(i),{col:c.gem})}
    if(c.cry){S.cry++;S.score+=25;C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'+25',{size:20,col:'#ffd36b'});fx5('mgCoin');G.emit('coleta',...cell(i),{col:'#ffd36b'})}
    if(c.lock){C.fx?.float(X0+(i%N)*CS+CS/2,Y0+(i/N|0)*CS,'aberta',{size:17,col:'#fff'});G.emit('estilhacos',...cell(i),{col:'#d8cce8'})}
    else if(c.ice)G.emit('estilhacos',...cell(i),{col:'#d8f4ff',amount:.5})
    S.clr.push({i,col:c.ice?'#bff0ff':c.col,t:now0()+q*18});S.g[i]=null;setTimeout(()=>burstAt(i,c.col),q*18);
    if(c.sun)S.sunQ.push(i)}
  function place(p,gx,gy,fromHold){
    if(!fits(p,gx,gy))return false;
    const t=now0(),sp=p.sp||{};p.cells.forEach(([cx,cy],k)=>{const c={col:p.col,t};if(sp[k]==='sun')c.sun=1;if(sp[k]==='cry')c.cry=1;S.g[(gy+cy)*N+gx+cx]=c});
    S.score+=p.cells.length;S.placed++;if(L)S.mv--;fx5('mgBall');
    p.cells.forEach(([cx,cy])=>G.emit('poeira',X0+(gx+cx)*CS+CS/2,Y0+(gy+cy+1)*CS-8,{col:'#d8c8f0',amount:.25,size:.7}));
    const rows=[],cols=[];for(let y=0;y<N;y++)if([...Array(N).keys()].every(x=>S.g[y*N+x]))rows.push(y);for(let x=0;x<N;x++)if([...Array(N).keys()].every(y=>S.g[y*N+x]))cols.push(x);
    const Ln=rows.length+cols.length;
    if(Ln){S.combo++;S.miss=0;S.lines+=Ln;S.best=Math.max(S.best,S.combo);S.holdOk=true;S.sunQ=[];
      rows.forEach(row=>beams.push({row,t}));cols.forEach(col=>beams.push({col,t}));G.hitstop(30+Ln*26);
      const set=new Set();rows.forEach(y=>{for(let x=0;x<N;x++)set.add(y*N+x)});cols.forEach(x=>{for(let y=0;y<N;y++)set.add(y*N+x)});
      set.forEach(i=>hit(i,false,(i%N)+(i/N|0)));
      let chain=0;while(S.sunQ.length){const s=S.sunQ.shift();chain++;S.suns++;const sx=s%N,sy=s/N|0;
        C.fx?.flash('#fff1a8',.25);C.fx?.burst(X0+sx*CS+CS/2,Y0+sy*CS+CS/2,{n:30,col:['#ffd36b','#ff9b3d','#fff'],sp:320,life:.8,size:4,grav:0});fx5('bb7');
        S.ring.push({x:X0+sx*CS+CS/2,y:Y0+sy*CS+CS/2,t:now0()});G.impact(...cell(s),{col:'#ffd36b',force:1.6});G.emit('explosao',...cell(s),{col:'#ffb81c'});
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
      if(S.g.every(c=>!c)){S.score+=300;S.perfect++;setTimeout(()=>{fx5('mgWin');C.fx?.flash('#fff3c0',.45);C.fx?.float(W/2,Y0+CS*4,'PERFEITO! +300',{col:'#ffd36b',size:40,life:1.5});G.emit('confete',W/2,Y0+CS*3)},260)}
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
    if(why==='win')G.emit('confete',W/2,Y0+CS*2);else G.emit('fumaca',W/2,Y0+CS*N,{col:'#8a6ab0',size:2});
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
  function drawBlock(x,X,Y,s,col,a=1){const g=x.globalAlpha;x.globalAlpha=g*a;x.drawImage(art.block(col),X,Y,s,s);x.globalAlpha=g}
  function drawMark(x,X,Y,s,c,i=0){
    const red=G.reduced(),t=red?0:performance.now()/1000,cx=X+s/2,cy=Y+s/2;
    if(c.sun||c.sp==='sun'){G.glow(x,cx,cy,s*.62,'#ffa41a',.55+(red?0:.25*Math.sin(t*5+i)));G.draw(x,art.sun(),cx,cy,{w:s*.9,rot:t*.5})}
    if(c.cry||c.sp==='cry'){x.drawImage(art.coin(),X,Y,s,s);if(!red)G.glow(x,cx,cy,s*.45,'#fff0a0',Math.max(0,Math.sin(t*3+i))*.5)}
    if(c.gem){x.drawImage(art.gem(c.gem),X,Y,s,s);if(!red)G.glow(x,cx,cy,s*.5,c.gem,.2+.2*Math.sin(t*2.4+i))}
    if(c.ice)x.drawImage(art.ice(c.ice>1?2:1),X,Y,s,s);
    if(c.lock)x.drawImage(art.lock(),X,Y,s,s);
  }
  function drawPiece(x,p,ox,oy,sc,dim){const sp=p.sp||{};p.cells.forEach(([cx,cy],k)=>{const X=ox+cx*sc,Y=oy+cy*sc;drawBlock(x,X,Y,sc,dim?'#4a4458':p.col);if(sp[k])drawMark(x,X,Y,sc,{sp:sp[k]},k)})}
  return{
    st:()=>S,fits,left,goalMet,lvl:()=>L,
    g60intro:{title:L?`Fase ${lv+1} · ${L.n}`:'Block Blast Astral',sub:L?`${L.mv} jogadas`:'Jogue até faltar espaço',acc:'#ffd36b'},
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
      C.hud(G.chips([{icon:'estrela',value:`${S.score} pts`},L?null:{icon:'raio',label:'Linhas',value:S.lines},
        L&&goal.gem?{icon:'estrela',label:'Gemas',value:l.gem,tone:l.gem?'':'ok'}:null,L&&goal.ice?{icon:'gota',label:'Gelo',value:l.ice,tone:l.ice?'':'ok'}:null,L&&goal.lock?{icon:'escudo',label:'Trancas',value:l.lock,tone:l.lock?'':'ok'}:null,L&&goal.pts?{icon:'alvo',label:'Faltam',value:l.pts,tone:l.pts?'':'ok'}:null,
        L?{icon:'relogio',label:'Jogadas',value:S.mv,tone:S.mv<=3?'bad':''}:null,S.combo>=2?{icon:'chama',label:S.fever?'Fervor':'Combo',value:`x${mult().toFixed(1)}`,tone:'warn'}:null]));
    },
    draw(x){
      const now=now0(),red=G.reduced(),t=red?0:now/1000,fev=!!S.fever,acc=fev?'#ff7ac8':'#ffd36b';
      /* observatório: céu, astrolábio girando e poeira (brasas no Fervor) */
      x.drawImage(art.bg(fev),0,0,W,H);
      G.draw(x,art.astro(),W/2,Y0+N*CS/2,{w:640,rot:t*.025,alpha:.85});G.draw(x,art.astro(),W/2,Y0+N*CS/2,{w:420,rot:-t*.04,alpha:.45});
      (fev?art.embers:art.motes).draw(x,t);
      if(fev)G.glow(x,W/2,Y0+N*CS/2,340,'#ff4ab0',.16+(red?0:.07*Math.sin(now/130)));
      /* cabeçalho */
      {const s=G.fs(34,22);G.hud.panel(x,152,6,176,56,{acc,a:.92});G.glow(x,W/2,34,66,acc,.18,{sy:.5});G.hud.text(x,String(S.score),W/2,35,{size:s,w:900,al:'center',max:160});
        const s1=G.fs(15),s2=G.fs(13);
        G.hud.panel(x,8,6,138,56,{acc:'#c9a45a',a:.82});G.hud.text(x,L?`Fase ${lv+1} de ${BBLV47.length}`:'Clássico',77,22,{size:15,w:800,al:'center',col:'#ffe4a8',max:126});
        G.hud.text(x,L?L.n:best0?`Recorde ${Math.max(best0,S.score)}`:'Sem fim',77,45,{size:13,w:600,al:'center',max:126});
        G.hud.panel(x,334,6,138,56,{acc,a:.82});
        if(S.combo>=1){G.hud.text(x,S.combo>=2?`x${mult().toFixed(1)} combo`:'combo 1',403,22,{size:15,w:900,al:'center',col:acc,max:126});
          for(let k=0;k<3;k++){const on=k<3-S.miss,X=379+k*24;if(on)G.glow(x,X,45,12,acc,.6);G.icon(x,'chama',X,45,17,on?acc:'rgba(244,234,214,.22)')}}
        else{G.hud.text(x,'Combo',403,22,{size:15,w:700,al:'center',col:'#a99cc4'});G.hud.text(x,'limpe linhas',403,45,{size:12,w:600,al:'center',col:'#a99cc4',max:126})}}
      /* metas (Aventura) ou contadores (Clássico) */
      {const items=[],lf=L?left():null;
        if(L){if(goal.gem)items.push({k:'gem',v:lf.gem});if(goal.ice)items.push({k:'ice',v:lf.ice});if(goal.lock)items.push({k:'lock',v:lf.lock});if(goal.pts)items.push({k:'pts',v:lf.pts});items.push({k:'mv',v:S.mv})}
        else{items.push({k:'ln',v:S.lines});items.push({k:'coin',v:S.cry})}
        const s=G.fs(15),word={mv:' jogadas',ln:S.lines===1?' linha':' linhas',pts:' pts'};
        x.font=`800 ${s}px "IBM Plex Sans",system-ui,sans-serif`;
        const W2=items.map(i=>x.measureText(i.v+(word[i.k]||'')).width+s*1.5+20),total=W2.reduce((a,b)=>a+b,0)+(items.length-1)*8;let X=(W-total)/2;
        items.forEach((i,j)=>{const w=W2[j],done=L&&i.k!=='mv'&&!i.v,low=i.k==='mv'&&S.mv<=3,Y=79,ic=X+8+s*.75;
          x.fillStyle='rgba(14,8,26,.86)';rr21(x,X,Y-15,w,30,15);x.fill();x.strokeStyle=low?'#ff6a7a':done?'#7dffa8':'rgba(232,190,100,.6)';x.lineWidth=low?2.2:1.3;x.stroke();
          if(i.k==='mv')G.icon(x,'relogio',ic,Y,s*1.25,low?'#ff8a8a':'#e8d4a0');else if(i.k==='pts')G.icon(x,'estrela',ic,Y,s*1.3,'#ffd36b');else if(i.k==='ln')G.icon(x,'raio',ic,Y,s*1.3,'#ffd36b');
          else{const sz=s*(i.k==='gem'||i.k==='coin'?1.9:1.5);x.drawImage(art.icon(i.k),ic-sz/2,Y-sz/2,sz,sz)}
          G.hud.text(x,done?'ok':i.v+(word[i.k]||''),X+14+s*1.5,Y+1,{size:15,w:800,col:low?'#ff9a9a':done?'#7dffa8':'#f4ead6',stroke:0});X+=w+8})}
      /* tabuleiro */
      G.shadow(x,W/2,Y0+N*CS+16,N*CS+60,{alpha:.55,h:34});
      if(fev)G.glow(x,W/2,Y0+N*CS/2,N*CS*.82,'#ff7ac8',.34+(red?0:.1*Math.sin(now/160)));
      x.drawImage(art.board(),X0-12,Y0-12,440,440);
      if(fev){x.strokeStyle='#ff9bd6';x.lineWidth=3;rr21(x,X0-9,Y0-9,N*CS+18,N*CS+18,14);x.stroke()}
      for(let i=0;i<N*N;i++){const c=S.g[i];if(!c)continue;const X=X0+(i%N)*CS,Y=Y0+(i/N|0)*CS,pop=c.t?Math.min(1,(now-c.t)/140):1,s=CS*(red?1:.85+.15*pop),bx=X+(CS-s)/2,by=Y+(CS-s)/2;
        if(!c.ice&&!c.lock)drawBlock(x,bx,by,s,c.col);drawMark(x,bx,by,s,c,i);
        if(c.t&&pop<1&&!red)G.glow(x,X+CS/2,Y+CS/2,CS*.75,'#ffffff',(1-pop)*.5)}
      beams=beams.filter(b=>now<b.t+420);beams.forEach(b=>{const k=(now-b.t)/420,th=CS*(red?1:1.5-k*.9);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=(1-k)*(red?.5:.9);
        if(b.row!=null)x.drawImage(art.beam(false),X0-12,Y0+b.row*CS+CS/2-th/2,N*CS+24,th);else x.drawImage(art.beam(true),X0+b.col*CS+CS/2-th/2,Y0-12,th,N*CS+24);x.restore()});
      S.clr=S.clr.filter(c=>now<c.t+260);S.clr.forEach(c=>{if(now<c.t){drawBlock(x,X0+(c.i%N)*CS,Y0+(c.i/N|0)*CS,CS,c.col);return}const k=(now-c.t)/260,s=CS*(1-k*.9),cx=X0+(c.i%N)*CS+CS/2,cy=Y0+(c.i/N|0)*CS+CS/2;
        G.glow(x,cx,cy,CS*(.5+k*.7),c.col,1-k);G.draw(x,art.block('#ffffff'),cx,cy,{w:s,rot:red?0:k*1.1,alpha:1-k})});
      S.ring=S.ring.filter(r=>now<r.t+450);S.ring.forEach(r=>{const k=(now-r.t)/450,sz=CS*3*(.4+k*.6);G.glow(x,r.x,r.y,sz*.9,'#ffa41a',(1-k)*.85);x.save();x.globalCompositeOperation='lighter';x.strokeStyle=`rgba(255,220,130,${1-k})`;x.lineWidth=7*(1-k)+1;rr21(x,r.x-sz/2,r.y-sz/2,sz,sz,14);x.stroke();x.beginPath();x.arc(r.x,r.y,sz*.62,0,Math.PI*2);x.lineWidth=3*(1-k)+.5;x.stroke();x.restore();
        if(!red)G.draw(x,art.sun(),r.x,r.y,{w:CS*(1+k*1.6),rot:k*2,alpha:1-k,add:true})});
      /* prévia da jogada */
      const d=S.drag;
      if(d&&d.ok&&!d.toHold){const rows=new Set(),cols=new Set(),tmp=S.g.slice();d.p.cells.forEach(([cx,cy])=>tmp[(d.gy+cy)*N+d.gx+cx]=1);
        for(let y=0;y<N;y++)if([...Array(N).keys()].every(q=>tmp[y*N+q]))rows.add(y);for(let q=0;q<N;q++)if([...Array(N).keys()].every(y=>tmp[y*N+q]))cols.add(q);
        const al=.55+(red?0:.2*Math.sin(now/110));x.save();x.globalCompositeOperation='lighter';x.globalAlpha=al*.55;rows.forEach(y=>x.drawImage(art.beam(false),X0-6,Y0+y*CS-3,N*CS+12,CS+6));cols.forEach(q=>x.drawImage(art.beam(true),X0+q*CS-3,Y0-6,CS+6,N*CS+12));x.restore();
        d.p.cells.forEach(([cx,cy])=>{const X=X0+(d.gx+cx)*CS,Y=Y0+(d.gy+cy)*CS;drawBlock(x,X,Y,CS,d.p.col,.42);x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=2;rr21(x,X+3,Y+3,CS-6,CS-6,8);x.stroke()})}
      /* reserva e peças da mão */
      x.drawImage(art.tray(),0,TY-77,W,156);
      if(d&&d.toHold){G.glow(x,HX,TY,80,'#7fe3ff',.5);x.fillStyle='rgba(127,227,255,.2)';rr21(x,HX-HW/2,TY-74,HW,148,16);x.fill()}
      x.strokeStyle=S.holdOk?'#7fe3ff':'#5a5270';x.lineWidth=2;x.setLineDash(S.holdOk?[]:[5,5]);rr21(x,HX-HW/2+1,TY-73,HW-2,146,15);x.stroke();x.setLineDash([]);
      G.hud.text(x,'Reserva',HX,TY-57,{size:12,w:800,al:'center',col:S.holdOk?'#9fe9ff':'#948aac',max:HW-6});G.hud.text(x,S.holdOk?'pronta':'limpe 1 linha',HX,TY+58,{size:11,w:700,al:'center',col:S.holdOk?'#7dffa8':'#bcb2cc',max:HW-4});
      if(S.hold&&!(d&&d.fromHold)){const p=S.hold,sc=trayScale(p,72)*26;drawPiece(x,p,HX-p.w*sc/2,TY-p.h*sc/2,sc,!anyFit(p))}
      S.tray.forEach((p,i)=>{if(!p||d&&d.p===p)return;const sc=trayScale(p)*26,bob=red?0:Math.sin(now/520+i*2)*2.5,fit=anyFit(p);if(fit)G.shadow(x,slotX(i),TY+57,p.w*sc+20,{alt:18-bob*3,alpha:.5});drawPiece(x,p,slotX(i)-p.w*sc/2,TY-p.h*sc/2+bob,sc,!fit)});
      if(d&&!d.toHold){const tlx=d.x-d.p.w*CS/2,tly=d.y-d.lift-d.p.h*CS/2;G.glow(x,d.x,d.y-d.lift,Math.max(d.p.w,d.p.h)*CS*.8,d.p.col,.35);x.globalAlpha=.35;d.p.cells.forEach(([cx,cy])=>{x.fillStyle='#000';rr21(x,tlx+cx*CS+6,tly+cy*CS+10,CS-2,CS-2,9);x.fill()});x.globalAlpha=.96;drawPiece(x,d.p,tlx,tly,CS,false);x.globalAlpha=1}
      else if(d){const sc=trayScale(d.p,72)*26;drawPiece(x,d.p,d.x-d.p.w*sc/2,d.y-d.p.h*sc/2,sc,false)}
      /* legenda com os próprios ícones */
      {const s=G.fs(12),parts=[[art.sun(),'explode 3×3'],[art.coin(),'dá Óbolos'],[null,'guarde 1 na Reserva']];x.font=`600 ${s}px "IBM Plex Sans",system-ui,sans-serif`;
        const w2=parts.map(([ic,tx])=>x.measureText(tx).width+(ic?s*1.7:0)),k=Math.min(1,(W-16)/(w2.reduce((a,b)=>a+b,0)+32));let X=(W-(w2.reduce((a,b)=>a+b,0)+32)*k)/2;
        parts.forEach(([ic,tx],i)=>{if(ic){x.drawImage(ic,X,H-15-s*.8*k,s*1.6*k,s*1.6*k);X+=s*1.7*k}const tw=(w2[i]-(ic?s*1.7:0))*k;G.hud.text(x,tx,X,H-14,{size:12,w:600,col:'#d4c8e8',max:Math.max(20,tw),stroke:3});X+=tw+16*k})}
      G.vignette(x,W,H,{a:.34});G.hud.frame(x,W,H,{acc,a:.5});
      if(S.over){const k=Math.min(1,(1.4-Math.max(0,S.overT))*3);x.fillStyle=`rgba(6,2,12,${(.5*k).toFixed(2)})`;x.fillRect(0,0,W,H);if(S.why==='win')G.rays(x,W/2,Y0+N*CS/2,{n:12,len:420,a:.2,t,col:'#ffe49a'});
        G.hud.banner(x,W,H,S.why==='win'?'Fase vencida!':S.why==='moves'?'Sem jogadas!':'Sem espaço!',{sub:`${S.score} pontos · ${S.lines} linha${S.lines===1?'':'s'}`,k,acc:S.why==='win'?'#ffd36b':'#ff9bb4',y:Y0+N*CS/2})}
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

