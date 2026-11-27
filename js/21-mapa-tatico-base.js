/* ===================================================================
   TULPA · ETAPA 7 — mapa tático da Visão de Mesa (no lugar do Roll20)
   Mapas enviados pelo Mestre, grade proporcional, tokens ligados às
   fichas, câmera particular de cada pessoa, régua em metros e névoa
   de guerra. Cada jogador move apenas o próprio token.
   O motor tático (paredes, portas, visão, luz, WASD) fica em t10.js.
   =================================================================== */
const MAP7={cv:null,x:null,stage:null,img:null,imgKey:'',cam:{x:.5,y:.5,z:1},target:null,tool:'move',sel:null,drag:null,live:{},ruler:null,ring:null,raf:0,imgs:new Map(),fogSet:null,fogSig:'',brush:1,ptrs:new Map(),camSave:null,lastCast:0};
T3.map=MAP7;
const CELL0=70,COLS0=30,ROWS0=18;
function mapWorld7(){const m=M6.state.map;return m&&m.w&&m.h?{W:m.w,H:m.h}:{W:CELL0*COLS0,H:CELL0*ROWS0}}
function mapCfg7(){
  const m=M6.state.map,c=(m&&M6.state.mapCfg?.[m.key])||{},{W,H}=mapWorld7();
  const cols=Math.max(4,Math.min(120,Number(c.cols)||(m?Math.max(8,Math.round(W/CELL0)):COLS0))),cell=W/cols;
  const ox=((Number(c.ox)||0)%cell+cell)%cell,oy=((Number(c.oy)||0)%cell+cell)%cell;
  return{cols,cell,ox,oy,rows:Math.max(1,Math.ceil((H-oy)/cell)),show:c.show!==false,mpc:Number(c.mpc)>0?Number(c.mpc):1.5};
}
function mapView7(){
  const st=MAP7.stage,cw=st?st.clientWidth:1,ch=st?st.clientHeight:1,{W,H}=mapWorld7(),fit=Math.min(cw/W,ch/H),s=fit*MAP7.cam.z;
  return{cw,ch,W,H,s,tx:cw/2-MAP7.cam.x*W*s,ty:ch/2-MAP7.cam.y*H*s};
}
const w2s7=(v,wx,wy)=>[wx*v.s+v.tx,wy*v.s+v.ty];
const s2w7=(v,sx,sy)=>[(sx-v.tx)/v.s,(sy-v.ty)/v.s];
const gmUid7=()=>camp3()?.createdBy||null;
function canMove7(tok){const ch=charById(tok.charId);return isGM6()||(!!ch&&!!uid3()&&ch.ownerId===uid3())}
function tokPos7(t){return pos10(t)}

/* ---------- montagem ---------- */
function mapMount7(){
  const st=$('mapStage');if(!st)return false;
  if(MAP7.stage===st&&MAP7.cv)return true;
  MAP7.stage=st;
  st.innerHTML=`<canvas id="mapCanvas" aria-label="Mapa tático da mesa"></canvas><div class="map-tools" id="mapTools" role="toolbar" aria-label="Ferramentas do mapa"></div><div class="map-info" id="mapInfo" aria-live="polite"></div><div class="map-menu" id="mapMenu" hidden></div>`;
  const cv=MAP7.cv=$('mapCanvas');MAP7.x=cv.getContext('2d');
  try{new ResizeObserver(()=>mapSize7()).observe(st)}catch(e){window.addEventListener('resize',mapSize7)}
  cv.addEventListener('pointerdown',mapDown7);cv.addEventListener('pointermove',mapMove7);
  cv.addEventListener('pointerup',mapUp7);cv.addEventListener('pointercancel',mapUp7);
  cv.addEventListener('wheel',mapWheel7,{passive:false});
  cv.addEventListener('dblclick',e=>{if(Date.now()-(MAP7.menuAt||0)<600)return;{const v0=mapView7(),r0=cv.getBoundingClientRect(),[hx,hy]=s2w7(v0,e.clientX-r0.left,e.clientY-r0.top);if(mapHit7(hx,hy))return}if(isGM6()&&MAP7.tool==='edit'){if(TAC10.edit==='room')polyClose10();else chainEnd10();return}if(MAP7.tool!=='move')return;const v=mapView7(),r=cv.getBoundingClientRect(),[wx,wy]=s2w7(v,e.clientX-r.left,e.clientY-r.top);mapCam7({x:wx/v.W,y:wy/v.H,z:MAP7.cam.z})});
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerleave',()=>{TAC10.hover=null;if(TAC10.placing||MAP7.tool==='edit')mapDraw7()});
  mountUi10(st);mapTools7();mapSize7();actButton10();
  return true;
}
function mapSize7(){
  const cv=MAP7.cv,st=MAP7.stage;if(!cv||!st)return;
  const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,st.clientWidth),h=Math.max(1,st.clientHeight);
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  MAP7.dpr=dpr;mapDraw7();
  /* aba do mapa aberta antes de o palco ter tamanho (0×0): tenta de novo a cada quadro até ele aparecer, sem depender só do ResizeObserver */
  if(st.clientWidth<2||st.clientHeight<2){if(!MAP7.sizeRaf&&(MAP7.sizeTry=(MAP7.sizeTry||0)+1)<=180)MAP7.sizeRaf=requestAnimationFrame(()=>{MAP7.sizeRaf=0;mapSize7()})}
  else MAP7.sizeTry=0;
}
function mapTools7(){
  const box=$('mapTools');if(!box)return;const isM=isGM6(),t=MAP7.tool,fog=M6.state.fog||{};
  const b=(id,ico,label,on)=>`<button type="button" class="mt-btn ${on?'on':''}" data-mt="${id}" title="${label}" aria-label="${label}" aria-pressed="${on?'true':'false'}">${ico}</button>`;
  const ex=tacTools10(isM,b);
  const sig=[isM,t,fog.on,MAP7.brush,!!M6.state.map,ex.sig].join();
  if(box.dataset.sig===sig)return;box.dataset.sig=sig;
  box.innerHTML=`<div class="mt-row">${b('move','✥',isM?'Mover tokens e a sua câmera':'Mover o seu token e a sua câmera',t==='move')}${b('ruler','📏','Régua: arraste para medir em metros',t==='ruler')}${ex.main}${isM?b('fog','▦','Névoa por quadrado (pincel)',t==='reveal'||t==='hide'):''}<span class="mt-sep"></span>${isM?`${b('tokens','♟','Adicionar ou tirar tokens')}${b('maps','🗺','Mapas')}${b('grid','#','Ajustar a grade')}<span class="mt-sep"></span>`:''}${b('zout','−','Afastar (só na sua tela)')}${b('zin','＋','Aproximar (só na sua tela)')}${b('fit','⤢','Enquadrar o mapa inteiro')}${ex.view}${b('full','⛶','Tela cheia')}</div>
   ${isM&&(t==='reveal'||t==='hide')?`<div class="mt-row mt-fog"><button type="button" class="mt-chip ${t==='reveal'?'on':''}" data-mt="reveal">Revelar</button><button type="button" class="mt-chip ${t==='hide'?'on':''}" data-mt="hide">Cobrir</button><label class="mt-chip">Pincel <select id="mtBrush" aria-label="Tamanho do pincel">${[1,3,5].map(n=>`<option value="${n}" ${MAP7.brush===n?'selected':''}>${n}×${n}</option>`).join('')}</select></label><button type="button" class="mt-chip" data-mt="fogall">Cobrir tudo</button><button type="button" class="mt-chip" data-mt="fognone">${fog.on?'Desligar névoa':'Névoa desligada'}</button></div>`:''}${ex.row}`;
  $$('[data-mt]',box).forEach(x=>x.onclick=()=>mapTool7(x.dataset.mt));
  const br=$('mtBrush');if(br)br.onchange=()=>{MAP7.brush=Number(br.value)||1};
}
function mapTool7(id){
  const isM=isGM6();
  if(tacTool10(id)){}
  else if(id==='move'||id==='ruler'){MAP7.tool=id;TAC10.placing=null;if(id!=='ruler')MAP7.ruler=null}
  else if(id==='fog'&&isM){MAP7.tool=MAP7.tool==='reveal'||MAP7.tool==='hide'?'move':'reveal';if(MAP7.tool==='reveal'&&!M6.state.fog?.on)setState6({fog:{on:true,open:[]}})}
  else if((id==='reveal'||id==='hide')&&isM){MAP7.tool=id;if(!M6.state.fog?.on)setState6({fog:{on:true,open:[]}})}
  else if(id==='fogall'&&isM)setState6({fog:{on:true,open:[]}});
  else if(id==='fognone'&&isM){setState6({fog:{on:false,open:[]}});MAP7.tool='move'}
  else if(id==='tokens'&&isM)mapTokensModal7();
  else if(id==='maps'&&isM)mapMapsModal7();
  else if(id==='grid'&&isM)mapGridModal7();
  else if(id==='zin')mapCam7({...MAP7.cam,z:MAP7.cam.z*1.25});
  else if(id==='zout')mapCam7({...MAP7.cam,z:MAP7.cam.z/1.25});
  else if(id==='fit')mapCam7({x:.5,y:.5,z:1});
  else if(id==='full'){const st=MAP7.stage;try{document.fullscreenElement?document.exitFullscreen():st.requestFullscreen?.()}catch(e){}}
  mapMenu7(null);mapTools7();actButton10();mapDraw7();
}

/* ---------- câmera: particular de cada pessoa (não mexe na tela dos outros) ---------- */
const camKey7=()=>'tulpa_cam_'+(camp3()?.id||'x')+'_'+(M6.state.map?.key||'~blank');
function mapCam7(c){
  const z=Math.max(.4,Math.min(10,c.z)),x=Math.max(0,Math.min(1,c.x)),y=Math.max(0,Math.min(1,c.y));
  MAP7.cam={x,y,z};MAP7.target=null;mapDraw7();
  clearTimeout(MAP7.camSave);MAP7.camSave=setTimeout(()=>lsSet6(camKey7(),MAP7.cam),400);
}
function mapCamLoad7(){const c=lsGet6(camKey7(),null);MAP7.cam=c&&isFinite(c.x)&&isFinite(c.y)&&isFinite(c.z)?{x:c.x,y:c.y,z:c.z}:{x:.5,y:.5,z:1};MAP7.target=null}
function mapWheel7(e){
  e.preventDefault();
  const v=mapView7(),r=MAP7.cv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top,[wx,wy]=s2w7(v,sx,sy);
  const z=Math.max(.4,Math.min(10,MAP7.cam.z*Math.exp(-e.deltaY*.0015))),s2=v.s/MAP7.cam.z*z;
  mapCam7({z,x:(wx-(sx-v.cw/2)/s2)/v.W,y:(wy-(sy-v.ch/2)/s2)/v.H});
}

/* ---------- ponteiro ---------- */
function mapPt7(e){const r=MAP7.cv.getBoundingClientRect(),v=mapView7(),sx=e.clientX-r.left,sy=e.clientY-r.top,[wx,wy]=s2w7(v,sx,sy);return{v,sx,sy,wx,wy}}
function mapHit7(wx,wy){
  const g=mapCfg7(),toks=M6.state.tokens||[];
  for(let i=toks.length-1;i>=0;i--){const t=toks[i];if(!mapTokVisible7(t))continue;const p=tokPos7(t),sz=(t.s||1)*g.cell,cx=g.ox+p.x*g.cell+sz/2,cy=g.oy+p.y*g.cell+sz/2;if(Math.hypot(wx-cx,wy-cy)<=sz/2)return t}
  return null;
}
function mapCellAt7(wx,wy){const g=mapCfg7();return[Math.floor((wx-g.ox)/g.cell),Math.floor((wy-g.oy)/g.cell)]}
function mapDown7(e){
  const p=mapPt7(e),isM=isGM6();MAP7.ptrs.set(e.pointerId,{sx:p.sx,sy:p.sy});
  try{MAP7.cv.setPointerCapture(e.pointerId)}catch(x){}
  mapMenu7(null);
  if(MAP7.ptrs.size===2){const [a,b]=[...MAP7.ptrs.values()];MAP7.drag={kind:'pinch',d0:Math.hypot(a.sx-b.sx,a.sy-b.sy),z0:MAP7.cam.z};return}
  if(T3.cbDown&&T3.cbDown(e,p))return;
  /* botão direito segurado = mover o mapa em qualquer ferramenta; o esquerdo fica livre para editar */
  if((e.button===2||e.button===1)&&e.pointerType==='mouse'){if(e.button===1)e.preventDefault();MAP7.drag={kind:'pan',sx:p.sx,sy:p.sy,cam:{...MAP7.cam}};return}
  if(tacDown10(e,p))return;
  if(MAP7.tool==='ruler'){const g=mapCfg7(),[cx,cy]=mapCellAt7(p.wx,p.wy);const a={x:g.ox+(cx+.5)*g.cell,y:g.oy+(cy+.5)*g.cell};MAP7.ruler={a,b:{...a}};MAP7.drag={kind:'ruler'};mapDraw7();return}
  if(isM&&(MAP7.tool==='reveal'||MAP7.tool==='hide')){MAP7.drag={kind:'fog',set:new Set(M6.state.fog?.open||[])};mapFogPaint7(p);return}
  if(T3.selDown&&T3.selDown(e,p))return;
  const t=mapHit7(p.wx,p.wy);
  if(t&&canMove7(t)){moveCancel10(t.id);const g=mapCfg7(),q=tokPos7(t);MAP7.sel=t.id;actButton10();MAP7.drag={kind:'tok',id:t.id,ox:p.wx-(g.ox+q.x*g.cell),oy:p.wy-(g.oy+q.y*g.cell),from:{x:q.x,y:q.y},moved:false,sx:p.sx,sy:p.sy};mapDraw7();return}
  if(t){MAP7.sel=t.id;actButton10();mapDraw7();tapTok7(t,e);return}
  MAP7.sel=null;MAP7.ring=null;
  MAP7.drag={kind:'pan',sx:p.sx,sy:p.sy,cam:{...MAP7.cam}};
  actButton10();mapDraw7();
}
function mapMove7(e){
  const d=MAP7.drag;if(MAP7.ptrs.has(e.pointerId)){const r=MAP7.cv.getBoundingClientRect();MAP7.ptrs.set(e.pointerId,{sx:e.clientX-r.left,sy:e.clientY-r.top})}
  const p=mapPt7(e);if(T3.cbHover)T3.cbHover(e,p);if(T3.selHover)T3.selHover(e,p);if(tacMove10(e,p))return;
  if(!d)return;
  if(d.ext){d.ext.move(p,e);return}
  if(d.kind==='pinch'){if(MAP7.ptrs.size<2)return;const [a,b]=[...MAP7.ptrs.values()];mapCam7({...MAP7.cam,z:d.z0*Math.hypot(a.sx-b.sx,a.sy-b.sy)/Math.max(10,d.d0)});return}
  if(d.kind==='pan'){const v=p.v;mapCam7({z:d.cam.z,x:d.cam.x-(p.sx-d.sx)/(v.s*v.W),y:d.cam.y-(p.sy-d.sy)/(v.s*v.H)});return}
  if(d.kind==='ruler'){MAP7.ruler.b={x:p.wx,y:p.wy};mapDraw7();return}
  if(d.kind==='fog'){mapFogPaint7(p);return}
  if(d.kind==='tok'){
    if(!d.moved&&Math.hypot(p.sx-d.sx,p.sy-d.sy)<5)return;d.moved=true;
    const g=mapCfg7(),t=(M6.state.tokens||[]).find(q=>q.id===d.id);let x=(p.wx-d.ox-g.ox)/g.cell,y=(p.wy-d.oy-g.oy)/g.cell;
    const prev=MAP7.live[d.id]||tokPos7(t||{x,y}),a=prev.a!=null?prev.a:t?.a;
    if(t&&(!isGM6()||(inCb14()&&!T3.cbFree?.()&&T3.cbNoSnap?.(t)))){/* o jogador (e o Mestre com o token da vez) arrasta com colisão e gasta metros */
      const s=t.s||1,c0=[g.ox+(prev.x+s/2)*g.cell,g.oy+(prev.y+s/2)*g.cell],c1=[g.ox+(x+s/2)*g.cell,g.oy+(y+s/2)*g.cell];
      let [nx,ny]=collide10(c0[0],c0[1],c1[0],c1[1],tokR10(t),blockers10());if(T3.cbMove)[nx,ny]=T3.cbMove(t,c0[0],c0[1],nx,ny,'drag');x=(nx-g.ox)/g.cell-s/2;y=(ny-g.oy)/g.cell-s/2}
    MAP7.live[d.id]={x,y,a,until:Date.now()+60000};
    const now=Date.now();if(now-(d.cast||0)>80){d.cast=now;cast6({t:'tok',id:d.id,x:+x.toFixed(3),y:+y.toFixed(3),a})}
    mapDraw7();
  }
}
function mapUp7(e){
  MAP7.ptrs.delete(e.pointerId);try{MAP7.cv.releasePointerCapture(e.pointerId)}catch(x){}
  if(tacUp10(e))return;
  const d=MAP7.drag;MAP7.drag=null;if(!d)return;
  if(d.ext){d.ext.up(mapPt7(e),e);mapDraw7();return}
  if(d.kind==='fog'){setState6({fog:{on:true,open:[...d.set].sort((a,b)=>a-b)}});return}
  if(d.kind==='tok'){
    const t=(M6.state.tokens||[]).find(x=>x.id===d.id);if(!t)return;
    if(!d.moved){delete MAP7.live[d.id];tapTok7(t,e);return}
    const g=mapCfg7(),l=MAP7.live[d.id]||t,sz=t.s||1;
    let x=Math.max(0,Math.min(g.cols-sz,Math.round(l.x))),y=Math.max(0,Math.min(g.rows-sz,Math.round(l.y)));
    if(T3.cbNoSnap&&T3.cbNoSnap(t)&&(!isGM6()||!T3.cbFree?.())){x=l.x;y=l.y}
    else if(!isGM6()){/* encaixa na grade só se o encaixe não entrar numa parede */
      const c0=[g.ox+(l.x+sz/2)*g.cell,g.oy+(l.y+sz/2)*g.cell],[nx,ny]=collide10(c0[0],c0[1],g.ox+(x+sz/2)*g.cell,g.oy+(y+sz/2)*g.cell,tokR10(t),blockers10());
      const sx=(nx-g.ox)/g.cell-sz/2,sy=(ny-g.oy)/g.cell-sz/2;if(Math.abs(sx-x)+Math.abs(sy-y)>.05){x=sx;y=sy}}
    mapCommitMove7(d.id,x,y,l.a!=null?l.a:t.a);
  }
  mapDraw7();
}
/* menu do token só com duplo clique / toque duplo; um toque apenas seleciona */
function tapTok7(t,e){
  const now=Date.now(),l=MAP7.lastTap;
  if(l&&l.id===t.id&&now-l.at<420){MAP7.lastTap=null;MAP7.menuAt=now;mapMenu7(t,e);return}
  MAP7.lastTap={id:t.id,at:now};
}
function mapFogPaint7(p){
  const d=MAP7.drag,g=mapCfg7(),[cx,cy]=mapCellAt7(p.wx,p.wy),r=(MAP7.brush-1)/2,rev=MAP7.tool==='reveal';
  for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){if(x<0||y<0||x>=g.cols||y>=g.rows)continue;const k=y*g.cols+x;rev?d.set.add(k):d.set.delete(k)}
  MAP7.fogSet=d.set;MAP7.fogSig='drag';mapDraw7();
}
/* mover: o Mestre grava direto; o jogador pede (função do banco com ângulo; na reserva, o aparelho do Mestre confere) */
async function mapCommitMove7(id,x,y,a){
  const t=(M6.state.tokens||[]).find(q=>q.id===id);if(!t)return;
  x=+(+x).toFixed(3);y=+(+y).toFixed(3);if(a==null||!isFinite(a))a=t.a;a=a==null?null:+(+a).toFixed(3);
  MAP7.live[id]={x,y,a,until:Date.now()+5000};
  if(isGM6()){setState6({tokens:(M6.state.tokens||[]).map(q=>q.id===id?{...q,x,y,...(a!=null?{a}:{})}:q)});return}
  if(!canMove7(t))return;
  cast6({t:'tok',id,x,y,a});
  if(M6.backend==='store'&&typeof sb()?.rpc==='function'&&!TAC10.noV2){
    try{const {error}=await sb().rpc('move_campaign_token_v2',{p_campaign_id:camp3().id,p_token_id:id,p_x:x,p_y:y,p_a:a});if(!error)return;if(noFn10(error))TAC10.noV2=true;else console.warn('[T7] mover token',error)}catch(e){console.warn('[T7] mover token',e)}
  }
  const gmOn=!!(M6.present&&M6.present[gmUid7()]);
  if(gmOn||M6.backend!=='store'){cast6({t:'req',kind:'move',id,x,y,a});return}
  /* sem o Mestre na mesa e sem a função nova: grava pela função antiga (posição arredondada, sem ângulo) */
  try{const {error}=await sb().rpc('move_campaign_token',{p_campaign_id:camp3().id,p_token_id:id,p_x:Math.round(x),p_y:Math.round(y)});if(error&&!noStore6(error))console.warn('[T7] mover token',error)}catch(e){console.warn('[T7] mover token',e)}
}
onCast6(p=>{
  if(p.t==='tok'&&p.id){if(MOV10.id===p.id&&p.from===uid3())return;MAP7.live[p.id]={x:Number(p.x)||0,y:Number(p.y)||0,a:p.a!=null&&isFinite(p.a)?Number(p.a):undefined,until:Date.now()+3000};mapDraw7()}
  if(p.t==='req'&&p.kind==='move'&&isGM6()){
    const t=(M6.state.tokens||[]).find(q=>q.id===p.id),ch=t&&charById(t.charId);
    if(!t||!ch||ch.ownerId!==p.from)return; /* só o dono move o próprio token */
    const g=mapCfg7(),sz=t.s||1,x=Math.max(-.5,Math.min(g.cols-sz+.5,Number(p.x)||0)),y=Math.max(-.5,Math.min(g.rows-sz+.5,Number(p.y)||0));
    const a=p.a!=null&&isFinite(p.a)?+Number(p.a).toFixed(3):t.a;
    setState6({tokens:M6.state.tokens.map(q=>q.id===t.id?{...q,x:+x.toFixed(3),y:+y.toFixed(3),...(a!=null?{a}:{})}:q)});
  }
});

/* ---------- menu do token ---------- */
function mapMenu7(t,e){
  const m=$('mapMenu');if(!m)return;
  if(!t){m.hidden=true;return}
  const ch=charById(t.charId),isM=isGM6(),g=mapCfg7();
  m.innerHTML=`<div class="mm-head"><b>${esc(nm(ch))}</b><button type="button" class="mm-x" aria-label="Fechar o menu" title="Fechar">✕</button></div><div class="mm-row"><span class="sub">Alcance</span>${[3,6,9,15].map(n=>`<button type="button" class="mt-chip ${MAP7.ring&&MAP7.ring.id===t.id&&MAP7.ring.m===n?'on':''}" data-ring="${n}">${n} m</button>`).join('')}</div>${isM?`<div class="mm-row"><span class="sub">Tamanho</span>${[1,2,3].map(n=>`<button type="button" class="mt-chip ${(t.s||1)===n?'on':''}" data-size="${n}">${n}×</button>`).join('')}</div><div class="mm-row"><button type="button" class="mt-chip danger" data-rm>✕ Tirar do mapa</button></div>`:''}<div class="mm-row"><button type="button" class="mt-chip" data-focus>🎯 Centralizar na minha tela</button></div>`;
  const v=mapView7(),p=tokPos7(t),[sx,sy]=w2s7(v,g.ox+(p.x+(t.s||1))*g.cell,g.oy+p.y*g.cell);
  {const x=m.querySelector('.mm-x');if(x)x.onclick=e=>{e.stopPropagation();mapMenu7(null)}}
  m.hidden=false;m.style.left=Math.max(6,Math.min(v.cw-m.offsetWidth-6,sx+6))+'px';m.style.top=Math.max(6,Math.min(v.ch-m.offsetHeight-6,sy))+'px';
  $$('[data-ring]',m).forEach(b=>b.onclick=()=>{const n=Number(b.dataset.ring);MAP7.ring=MAP7.ring&&MAP7.ring.id===t.id&&MAP7.ring.m===n?null:{id:t.id,m:n};mapMenu7(t);mapDraw7()});
  $$('[data-size]',m).forEach(b=>b.onclick=()=>{setState6({tokens:M6.state.tokens.map(q=>q.id===t.id?{...q,s:Number(b.dataset.size)}:q)});mapMenu7(null)});
  const f=$q('[data-focus]',m);if(f)f.onclick=()=>{const W=mapWorld7();mapCam7({x:(g.ox+(p.x+(t.s||1)/2)*g.cell)/W.W,y:(g.oy+(p.y+(t.s||1)/2)*g.cell)/W.H,z:Math.max(MAP7.cam.z,2)});mapMenu7(null)};
  const r=$q('[data-rm]',m);if(r)r.onclick=()=>{setState6({tokens:M6.state.tokens.filter(q=>q.id!==t.id)});MAP7.sel=null;mapMenu7(null)};
}

/* ---------- desenho ---------- */
function mapTokVisible7(t){
  const ch=charById(t.charId);if(!ch)return false;
  if(isGM6())return true;if(ch.ownerId===uid3())return true;
  if(!inScene(ch))return false;
  if(!tokVisible10(t))return false;
  const f=M6.state.fog;if(f?.on){const g=mapCfg7(),p=tokPos7(t),k=Math.round(p.y)*g.cols+Math.round(p.x);if(!mapFog7().has(k)&&!fogSeen7(t))return false}
  return true;
}
/* névoa de guerra: o que os personagens do jogador enxergam agora (cone/luz) dissipa a névoa, mesmo nas células que o Mestre não abriu */
function fogSeen7(t){try{const vs=view10(),[x,y]=tokCenter10(t);return vs.mine.some(m=>m.views.some(o=>inPoly10(x,y,o.poly)))}catch(e){return false}}
function fogVision7(fx,v,isM){
  const vs=view10();
  if(isM){vs.gm.forEach(o=>{if(o.player)o.views.forEach(w=>lightCut10(fx,v,w,.7))});return}
  vs.mine.forEach(m=>{
    m.views.forEach(o=>lightCut10(fx,v,o));
    /* o próprio token e o entorno imediato nunca ficam debaixo da névoa */
    const R=tokR10(m.t)*1.9;lightCut10(fx,v,{poly:visPoly10(m.cx,m.cy,0,TAU10,R),ox:m.cx,oy:m.cy,r:R,soft:true});
  });
}
/* a lista de células abertas é trocada inteira a cada mudança: compara a referência (a assinatura antiga por tamanho/pontas perdia mudanças no meio) */
function mapFog7(){const f=M6.state.fog||{},o=Array.isArray(f.open)?f.open:[];if(MAP7.drag?.kind==='fog')return MAP7.drag.set;if(MAP7.fogRef!==o||MAP7.fogSig==='drag'||!MAP7.fogSet){MAP7.fogRef=o;MAP7.fogSig='';MAP7.fogSet=new Set(o)}return MAP7.fogSet}
function mapTokImg7(ch){
  const d=dOf6(ch),src=avOk(d.tokenAvatar)?d.tokenAvatar:avOk(d.avatar)?d.avatar:'';if(!src)return null;
  const key=ch.id,sig=src.length+src.slice(-24);let e=MAP7.imgs.get(key);
  if(!e||e.sig!==sig){const im=new Image();e={sig,im,ok:false};im.onload=()=>{e.ok=true;mapDraw7()};im.src=src;MAP7.imgs.set(key,e)}
  return e.ok?e.im:null;
}
function mapDraw7(){if(MAP7.raf||!MAP7.cv)return;MAP7.raf=requestAnimationFrame(()=>{MAP7.raf=0;try{mapPaint7()}catch(e){console.warn('[T7] mapa',e)}})}
function mapPaint7(){
  const cv=MAP7.cv,x=MAP7.x;if(!cv||!x||!cv.isConnected)return;
  let again=false;
  try{if(tacFrame10())again=true}catch(e){TAC10.vs=null;console.warn('[T7] quadro',e)}
  if(MAP7.target){const c=MAP7.cam,t=MAP7.target,k=.28;c.x+=(t.x-c.x)*k;c.y+=(t.y-c.y)*k;c.z+=(t.z-c.z)*k;if(Math.abs(t.x-c.x)+Math.abs(t.y-c.y)<.0006&&Math.abs(t.z-c.z)<.003){MAP7.cam={...t};MAP7.target=null}else again=true}
  const dpr=MAP7.dpr||1,v=mapView7(),g=mapCfg7(),isM=isGM6(),dark=document.body.classList.contains('t3-dark');
  x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,v.cw,v.ch);
  const pal=document.body.classList.contains('t3-pal'),cssv=pal?getComputedStyle(document.body):null,pv=k=>cssv?cssv.getPropertyValue(k).trim():'';
  x.fillStyle=pal?(pv('--bg')||'#0d1117'):dark?'#0d1117':'#241b14';x.fillRect(0,0,v.cw,v.ch);
  const [x0,y0]=w2s7(v,0,0),mw=v.W*v.s,mh=v.H*v.s;let blank=false;
  if(MAP7.img&&M6.state.map){x.imageSmoothingQuality='high';x.drawImage(MAP7.img,x0,y0,mw,mh)}
  else{
    try{blank=!!(T3.mapBlank20&&T3.mapBlank20(x,v,g,{x0,y0,mw,mh,dark,isM}))}catch(e){blank=false;console.warn('[T7] mapa em branco',e)}
    if(!blank){const gr=x.createLinearGradient(x0,y0,x0+mw,y0+mh);gr.addColorStop(0,pal?(pv('--panel2')||'#222b38'):dark?'#222b38':'#e9dcc0');gr.addColorStop(1,pal?(pv('--panel')||'#1a212c'):dark?'#1a212c':'#d6c3a0');x.fillStyle=gr;x.fillRect(x0,y0,mw,mh);
    if(!(M6.state.tokens||[]).length){x.fillStyle=dark?'#ffffff18':'#5a3b2620';x.font=`700 ${Math.max(28,mh*.2)}px "Cormorant Garamond",Georgia,serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('MESA',x0+mw/2,y0+mh/2)}}
  }
  const cs=g.cell*v.s;
  if(g.show&&cs>=7&&!blank){
    x.beginPath();x.lineWidth=1;x.strokeStyle=MAP7.img?'rgba(255,255,255,.22)':(dark?'rgba(255,255,255,.1)':'rgba(70,45,25,.2)');
    for(let c=0;c<=g.cols;c++){const sx=Math.round(x0+(g.ox+c*g.cell)*v.s)+.5;if(sx<-1||sx>v.cw+1||sx>x0+mw+1)continue;x.moveTo(sx,Math.max(0,y0));x.lineTo(sx,Math.min(v.ch,y0+mh))}
    for(let r=0;r<=g.rows;r++){const sy=Math.round(y0+(g.oy+r*g.cell)*v.s)+.5;if(sy<-1||sy>v.ch+1||sy>y0+mh+1)continue;x.moveTo(Math.max(0,x0),sy);x.lineTo(Math.min(v.cw,x0+mw),sy)}
    x.stroke();
  }
  try{paintUnder10(x,v,g,isM)}catch(e){console.warn('[T7] paredes',e)}
  /* tokens */
  const now=Date.now(),cur=curEntry()?.characterId;
  (M6.state.tokens||[]).forEach(t=>{let sv=0;try{
    if(!mapTokVisible7(t))return;const ch=charById(t.charId),d=dOf6(ch),p=tokPos7(t);
    if(MAP7.live[t.id]){if(MAP7.live[t.id].until<now)delete MAP7.live[t.id]}
    const sz=(t.s||1)*cs,[sx,sy]=w2s7(v,g.ox+p.x*g.cell,g.oy+p.y*g.cell),cx=sx+sz/2,cy=sy+sz/2,r=Math.max(4,sz/2-Math.max(1.5,sz*.05));
    if(cx<-sz||cy<-sz||cx>v.cw+sz||cy>v.ch+sz)return;
    if(MAP7.ring&&MAP7.ring.id===t.id){const rr=(MAP7.ring.m/g.mpc)*cs+sz/2;x.beginPath();x.arc(cx,cy,rr,0,Math.PI*2);x.fillStyle='rgba(240,200,90,.13)';x.fill();x.setLineDash([6,5]);x.lineWidth=2;x.strokeStyle='rgba(240,200,90,.9)';x.stroke();x.setLineDash([]);
      x.font='700 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='bottom';x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=3;x.strokeText(MAP7.ring.m+' m',cx,cy-rr-3);x.fillText(MAP7.ring.m+' m',cx,cy-rr-3)}
    const st=stIds(d),down=st.includes('morto')||st.includes('agonia');
    x.save();sv=1;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.closePath();
    x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=8;x.shadowOffsetY=2;x.fillStyle='#2b211b';x.fill();x.shadowColor='transparent';
    x.clip();
    const im=mapTokImg7(ch);
    if(im){if(down)x.filter='grayscale(1) brightness(.6)';x.drawImage(im,cx-r,cy-r,r*2,r*2);x.filter='none'}
    else{let h=0;for(const c of nm(ch))h=(h*31+c.charCodeAt(0))>>>0;x.fillStyle=down?'#555':AV_C[h%AV_C.length];x.fillRect(cx-r,cy-r,r*2,r*2);x.fillStyle='#fff';x.font=`700 ${Math.max(9,r*.8)}px "Cormorant Garamond",Georgia,serif`;x.textAlign='center';x.textBaseline='middle';x.fillText((nm(ch).split(/\s+/).slice(0,2).map(w=>[...w][0]).join('')||'?').toUpperCase(),cx,cy+1)}
    x.restore();sv=0;
    const own=ch.ownerId&&ch.ownerId===uid3();
    x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.lineWidth=Math.max(2,sz*.06);x.strokeStyle=down?'#777':gmChar6(ch)?'#c2493d':own?'#f0c85a':'#f4ead6';x.stroke();
    paintFacing10(x,t,cx,cy,r,own);
    if(cur===ch.id){x.beginPath();x.arc(cx,cy,r+4+Math.sin(now/260)*1.5,0,Math.PI*2);x.lineWidth=2.5;x.strokeStyle='rgba(240,200,90,.95)';x.stroke();again=true}
    if(MAP7.sel===t.id){x.beginPath();x.arc(cx,cy,r+3,0,Math.PI*2);x.setLineDash([5,4]);x.lineWidth=2;x.strokeStyle='#fff';x.stroke();x.setLineDash([])}
    if(down){x.font=`${Math.max(12,r)}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.fillText('☠',cx,cy)}
    if(T3.tokFocus?T3.tokFocus(t,ch):(sz>=26||MAP7.sel===t.id)){const label=nm(ch);x.font=`600 ${Math.max(10,Math.min(13,sz*.2))}px "IBM Plex Sans",system-ui,sans-serif`;x.textAlign='center';x.textBaseline='top';const tw=x.measureText(label).width+10;x.fillStyle='rgba(20,14,10,.78)';x.beginPath();x.roundRect?x.roundRect(cx-tw/2,cy+r+3,tw,17,6):x.rect(cx-tw/2,cy+r+3,tw,17);x.fill();x.fillStyle='#fff';x.fillText(label,cx,cy+r+6)}
    if(T3.tokHud){try{T3.tokHud(x,t,ch,d,cx,cy,r,sz)}catch(e){console.warn('[T19] HUD',e)}}
  }catch(e){if(sv)x.restore();x.setTransform(dpr,0,0,dpr,0,0);x.globalAlpha=1;x.filter='none';x.shadowColor='transparent';x.setLineDash([]);console.warn('[T7] token',e)}});
  /* distância percorrida enquanto arrasta um token */
  try{if(MAP7.drag?.kind==='tok'&&MAP7.drag.moved){const d=MAP7.drag,l=MAP7.live[d.id],t=(M6.state.tokens||[]).find(q=>q.id===d.id);if(l&&t){const h=(t.s||1)/2;mapRuler7(v,g,{x:g.ox+(d.from.x+h)*g.cell,y:g.oy+(d.from.y+h)*g.cell},{x:g.ox+(Math.round(l.x)+h)*g.cell,y:g.oy+(Math.round(l.y)+h)*g.cell})}}}catch(e){console.warn('[T7] régua',e)}
  /* névoa de guerra: os jogadores não veem nada por baixo; o Mestre vê escurecido */
  const fog=M6.state.fog;
  if(fog?.on){
    /* pinta numa camada à parte para a visão dos personagens poder "furar" a névoa */
    const open=mapFog7(),L=fogCanvas10();L.fillStyle=isM?'rgba(8,8,12,.55)':(dark?'#07090d':'#120d0a');
    const c0=Math.max(0,Math.floor((-v.tx/v.s-g.ox)/g.cell)),c1=Math.min(g.cols-1,Math.ceil(((v.cw-v.tx)/v.s-g.ox)/g.cell)),r0=Math.max(0,Math.floor((-v.ty/v.s-g.oy)/g.cell)),r1=Math.min(g.rows-1,Math.ceil(((v.ch-v.ty)/v.s-g.oy)/g.cell));
    for(let r=r0;r<=r1;r++){let run=-1;for(let c=c0;c<=c1+1;c++){const hid=c<=c1&&!open.has(r*g.cols+c);if(hid&&run<0)run=c;if(!hid&&run>=0){const [fx,fy]=w2s7(v,g.ox+run*g.cell,g.oy+r*g.cell);L.fillRect(Math.floor(fx),Math.floor(fy),Math.ceil((c-run)*cs)+1,Math.ceil(cs)+1);run=-1}}}
    if(!isM&&(g.ox>0||g.oy>0)){const [ax,ay]=w2s7(v,0,0);L.fillRect(ax,ay,mw,g.oy*v.s);L.fillRect(ax,ay,g.ox*v.s,mh)}
    try{fogVision7(L,v,isM)}catch(e){console.warn('[T7] visão na névoa',e)}
    if(!isM){try{T3.fogHalo20&&T3.fogHalo20(L,v)}catch(e){console.warn('[T7] halo inicial',e)}}
    x.drawImage(TAC10.fogCv,0,0,v.cw,v.ch);
  }
  try{paintOver10(x,v,g,isM)}catch(e){console.warn('[T7] névoa/portas',e)}
  if(T3.cbPaint){try{if(T3.cbPaint(x,v,g))again=true}catch(e){console.warn('[T14] desenho',e)}}
  if(T3.selPaint){try{if(T3.selPaint(x,v,g))again=true}catch(e){console.warn('[T19] desenho',e)}}
  if(MAP7.ruler)mapRuler7(v,g,MAP7.ruler.a,MAP7.ruler.b);
  const info=$('mapInfo');if(info){const m=M6.state.map,gg=geo10(),txt=(m?m.name:'Sem mapa')+' · '+g.mpc.toLocaleString('pt-BR')+' m por quadrado'+(gg.dark?' · 🌑 ambiente escuro':'')+(fog?.on?' · névoa ligada':'');if(info.textContent!==txt)info.textContent=txt}
  if(again)mapDraw7();
}
function mapRuler7(v,g,a,b){
  const x=MAP7.x,[ax,ay]=w2s7(v,a.x,a.y),[bx,by]=w2s7(v,b.x,b.y),cells=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))/g.cell,m=Math.round(cells)*g.mpc;
  x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.6)';x.stroke();x.lineWidth=1.6;x.strokeStyle='#f0c85a';x.setLineDash([7,5]);x.stroke();x.setLineDash([]);
  [[ax,ay],[bx,by]].forEach(([px,py])=>{x.beginPath();x.arc(px,py,4,0,Math.PI*2);x.fillStyle='#f0c85a';x.fill()});
  const label=m.toLocaleString('pt-BR')+' m · '+Math.round(cells)+' quadrado'+(Math.round(cells)===1?'':'s');
  x.font='700 13px "IBM Plex Sans",system-ui,sans-serif';const tw=x.measureText(label).width+14,lx=Math.max(4,Math.min(v.cw-tw-4,bx+10)),ly=Math.max(4,Math.min(v.ch-26,by-28));
  x.fillStyle='rgba(20,14,10,.86)';x.beginPath();x.roundRect?x.roundRect(lx,ly,tw,22,7):x.rect(lx,ly,tw,22);x.fill();x.fillStyle='#fff';x.textAlign='left';x.textBaseline='middle';x.fillText(label,lx+7,ly+11.5);
}

/* ---------- mapas guardados ---------- */
async function mapRefresh7(){
  try{M6.maps=(await stList6('map')).map(r=>({key:r.key,name:r.meta?.name||'Mapa',w:r.meta?.w||0,h:r.meta?.h||0}))}catch(e){console.warn('[T7] mapas',e)}
  const l=$('mapList');if(l)mapListHtml7();
}
T3.mapRefreshList=mapRefresh7;
function mapFind7(q){
  const n=normTxt(q).replace(/\b(mapa|o|a|do|da|de|para|pra|pro)\b/g,' ').replace(/\s+/g,' ').trim();if(!n)return null;
  const words=n.split(' ');let best=null,bs=0;
  M6.maps.forEach(m=>{const h=normTxt(m.name);let s=0;if(h===n)s+=10;if(h.includes(n))s+=5;words.forEach(w=>{if(w.length>2&&h.includes(w))s++});if(s>bs){bs=s;best=m}});
  return bs>=1?best:null;
}
function mapUse7(key){
  if(!isGM6())return false;
  if(!key){setState6({map:null,fog:{on:false,open:[]}});return true}
  const m=M6.maps.find(x=>x.key===key);if(!m)return false;
  setState6({map:{key:m.key,name:m.name,w:m.w,h:m.h},fog:{on:false,open:[]}});
  return true;
}
T3.mapFind=mapFind7;T3.mapUse=mapUse7;
async function mapUpload7(file,name){
  const im=await imgFit6(file,2400,950000),key='map:'+rid(),nmx=String(name||file.name||'Mapa').replace(/\.[a-z0-9]+$/i,'').trim().slice(0,60)||'Mapa';
  await stPut6(key,'map',{meta:{name:nmx,w:im.w,h:im.h,at:Date.now()},data:im.data},null);
  M6.assetCache[key]=im.data;await mapRefresh7();
  if(!M6.maps.some(m=>m.key===key))M6.maps.push({key,name:nmx,w:im.w,h:im.h});
  return key;
}
T3.mapUpload=mapUpload7;
function mapListHtml7(){
  const l=$('mapList');if(!l)return;const cur=M6.state.map?.key;
  l.innerHTML=M6.maps.length?M6.maps.map(m=>`<li class="${m.key===cur?'cur':''}"><span class="mu-t">${esc(m.name)} <small>${m.w}×${m.h}</small></span><button type="button" class="btn small ${m.key===cur?'':'primary'}" data-muse="${esc(m.key)}">${m.key===cur?'Em uso':'Usar na mesa'}</button><button type="button" class="bn-x" data-mdel="${esc(m.key)}" title="Apagar mapa" aria-label="Apagar ${esc(m.name)}">✕</button></li>`).join(''):'<li class="sub">Nenhum mapa guardado ainda.</li>';
  $$('[data-muse]',l).forEach(b=>b.onclick=()=>{mapUse7(b.dataset.muse);mapListHtml7()});
  $$('[data-mdel]',l).forEach(b=>b.onclick=async()=>{if(!confirm('Apagar este mapa? Não dá para desfazer.'))return;const k=b.dataset.mdel;try{await stDel6(k);delete M6.assetCache[k];if(M6.state.map?.key===k)mapUse7(null);M6.maps=M6.maps.filter(m=>m.key!==k);mapListHtml7()}catch(e){toast('Não consegui apagar: '+(e?.message||'erro'))}});
}
function mapMapsModal7(){
  openModal('MAPAS','Mapas da campanha',`<p class="sub">Envie a imagem do mapa (JPG, PNG ou WEBP). Ela é reduzida automaticamente e fica guardada na campanha.</p><div class="grid two"><div class="field"><label for="mpFile">Imagem do mapa</label><input type="file" id="mpFile" accept="image/*"></div><div class="field"><label for="mpName">Nome do mapa</label><input id="mpName" maxlength="60" placeholder="Ex.: Laboratório"></div></div><div class="inline"><button type="button" class="btn primary small" id="mpSend">Enviar mapa</button><button type="button" class="btn small" id="mpNone">Usar a mesa em branco</button><span class="sub" id="mpMsg"></span></div><h4>Guardados</h4><ul class="mu-list" id="mapList"></ul><p class="sub">Dica: peça ao Perseus “muda o mapa para o laboratório”.</p>`,'Fechar',()=>closeModal());
  mapListHtml7();mapRefresh7();
  $('mpNone').onclick=()=>{mapUse7(null);mapListHtml7()};
  $('mpSend').onclick=async()=>{const f=$('mpFile').files&&$('mpFile').files[0];if(!f){toast('Escolha a imagem do mapa.');return}$('mpMsg').textContent='Enviando…';$('mpSend').disabled=true;try{const k=await mapUpload7(f,$('mpName').value);mapUse7(k);$('mpMsg').textContent='Mapa enviado e colocado na mesa.';$('mpFile').value='';$('mpName').value='';mapListHtml7()}catch(e){$('mpMsg').textContent='';toast('Não consegui enviar o mapa: '+(e?.message||'erro'))}finally{const b=$('mpSend');if(b)b.disabled=false}};
}
function mapGridModal7(){
  const g=mapCfg7(),m=M6.state.map,key=m?m.key:'~blank';
  openModal('GRADE','Ajustar a grade',`<p class="sub">Diga quantos quadrados cabem na largura do mapa. Os tokens se ajustam sozinhos ao tamanho do quadrado.</p><div class="grid two"><div class="field"><label for="gdCols">Quadrados na largura</label><input type="number" id="gdCols" min="4" max="120" value="${g.cols}"></div><div class="field"><label for="gdMpc">Metros por quadrado</label><input type="number" id="gdMpc" min="0.5" max="50" step="0.5" value="${g.mpc}"></div><div class="field"><label for="gdOx">Deslocar para a direita (px do mapa)</label><input type="number" id="gdOx" value="${Math.round(g.ox)}"></div><div class="field"><label for="gdOy">Deslocar para baixo (px do mapa)</label><input type="number" id="gdOy" value="${Math.round(g.oy)}"></div></div><label class="t3-check"><input type="checkbox" id="gdShow" ${g.show?'checked':''}> Mostrar as linhas da grade</label>`,'Concluir',()=>closeModal());
  const apply=()=>{if(!m){toast('A mesa em branco usa a grade padrão. Envie um mapa para ajustar.');return}setState6({mapCfg:{...(M6.state.mapCfg||{}),[key]:{cols:Number($('gdCols').value)||g.cols,mpc:Number($('gdMpc').value)||1.5,ox:Number($('gdOx').value)||0,oy:Number($('gdOy').value)||0,show:$('gdShow').checked}}})};
  ['gdCols','gdMpc','gdOx','gdOy','gdShow'].forEach(id=>{$(id).oninput=apply;$(id).onchange=apply});
}
function mapTokensModal7(){
  const draw=()=>{
    const on=new Map((M6.state.tokens||[]).map(t=>[t.charId,t])),list=chars3().slice().sort((a,b)=>(gmChar6(a)-gmChar6(b))||nm(a).localeCompare(nm(b),'pt-BR'));
    $('tkList').innerHTML=list.length?list.map(ch=>`<li>${av5({...ch.data,avatar:avOk(ch.data?.tokenAvatar)?ch.data.tokenAvatar:ch.data?.avatar},'sm')}<span class="mu-t">${esc(nm(ch))} <small>${gmChar6(ch)?'Mestre':esc(ch.ownerLabel||'Jogador')}${inScene(ch)?'':' · fora da cena'}</small></span>${on.has(ch.id)?`<button type="button" class="btn small" data-tkmove="${ch.id}">Mudar de lugar</button><button type="button" class="btn small" data-tk="${ch.id}">Tirar do mapa</button>`:`<button type="button" class="btn small primary" data-tkplace="${ch.id}">＋ Adicionar token</button>`}</li>`).join(''):'<li class="sub">Nenhum personagem na campanha.</li>';
    $$('[data-tk]').forEach(b=>b.onclick=()=>{mapToggleToken7(b.dataset.tk);draw()});
    $$('[data-tkplace],[data-tkmove]').forEach(b=>b.onclick=()=>placeStart10(b.dataset.tkplace||b.dataset.tkmove));
  };
  openModal('TOKENS','Tokens no mapa',`<p class="sub">Cada token já vem ligado à ficha do personagem e usa a imagem de token dele. Em “＋ Adicionar token”, a janela fecha e você clica no ponto do mapa onde ele deve aparecer.</p><div class="inline"><button type="button" class="btn small primary" id="tkScene">Colocar todos que estão na cena</button><button type="button" class="btn small" id="tkClear">Tirar todos</button></div><ul class="mu-list tk-list" id="tkList"></ul>`,'Concluir',()=>closeModal());
  $('tkScene').onclick=()=>{chars3().filter(inScene).forEach(ch=>{if(!(M6.state.tokens||[]).some(t=>t.charId===ch.id))mapToggleToken7(ch.id)});draw()};
  $('tkClear').onclick=()=>{setState6({tokens:[]});draw()};
  draw();
}
function mapToggleToken7(charId){
  if(!isGM6())return;const toks=M6.state.tokens||[];
  if(toks.some(t=>t.charId===charId)){setState6({tokens:toks.filter(t=>t.charId!==charId)});return}
  const g=mapCfg7(),W=mapWorld7(),cx=Math.round((MAP7.cam.x*W.W-g.ox)/g.cell),cy=Math.round((MAP7.cam.y*W.H-g.oy)/g.cell),used=new Set(toks.map(t=>t.x+','+t.y));
  let x=cx,y=cy;for(let i=0;i<60&&used.has(x+','+y);i++){x=cx+(i%6)-2;y=cy+Math.floor(i/6)}
  setState6({tokens:[...toks,{id:'k'+rid(),charId,x:Math.max(0,Math.min(g.cols-1,x)),y:Math.max(0,Math.min(g.rows-1,y)),s:1,a:Math.PI/2}]});
}
T3.mapToggleToken=mapToggleToken7;
T3.mapView=()=>mapView7();T3.w2s=(x,y)=>w2s7(mapView7(),x,y);

/* ---------- acompanha o estado da mesa ---------- */
onState6((st,why)=>{
  if(!mapMount7())return;
  const key=st.map?.key||'';
  if(key!==MAP7.imgKey){
    MAP7.imgKey=key;MAP7.img=null;mapCamLoad7();TAC10.undo=[];MAP7.imgSt=key?'loading':'';
    const imgEnd=(k,st)=>{if(MAP7.imgKey!==k)return;MAP7.imgSt=st;mapDraw7();try{window.dispatchEvent(new Event('tulpa:mapimg'))}catch(e){}};
    if(key)assetData6(key).then(src=>{if(MAP7.imgKey!==key)return;if(!src){imgEnd(key,'err');return}const im=new Image();im.onload=()=>{if(MAP7.imgKey===key){MAP7.img=im;imgEnd(key,'ok')}};im.onerror=()=>imgEnd(key,'err');im.src=src}).catch(e=>{console.warn('[T7] imagem do mapa',e);imgEnd(key,'err')});
  }
  mapTools7();mapDraw7();
});
M6.hooks.layout.push(()=>mapDraw7());
M6.hooks.leave.push(()=>{MAP7.imgKey='';MAP7.img=null;MAP7.sel=null;MAP7.ring=null;MAP7.ruler=null;MAP7.live={}});
{const _lm7=layoutMesa6;layoutMesa6=function(){_lm7.apply(this,arguments);try{if(mapMount7()){mapTools7();mapDraw7()}}catch(e){console.warn('[T7] mapa',e)}};T3.mesaLayout=layoutMesa6}


