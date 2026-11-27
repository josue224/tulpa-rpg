/* ===================================================================
   TULPA · ETAPA 10 — motor tático do mapa
   Paredes com colisão, portas com cadeado e som, cômodos com névoa
   individual, campo de visão por raycasting 2D, ambiente escuro com
   lanterna, movimento por WASD/analógico com direção (frente do token),
   câmera particular e ponto de destaque (laser) do Mestre.

   Unidades: as paredes, portas e cômodos ficam em pixels do mapa
   (mundo). Os tokens continuam em quadrados da grade (x, y = canto
   superior esquerdo; s = tamanho) e ganham o ângulo a (radianos,
   0 = direita, π/2 = baixo).
   =================================================================== */
const TAC10={
  edit:'wall',snap:true,follow:true,armed:false,undo:[],chain:null,poly:null,doorA:null,placing:null,
  hover:null,disp:{},doorLive:{},laser:{pts:[],rip:[],last:0,from:''},vs:null,vsAt:0,
  polyCache:new Map(),blk:null,blkSig:'',frameAt:0,dt:0,noV2:false,noDoorFn:false,noLightFn:false,lampLive:{},ltLive:{},fogA:{},flick:null
};
T3.tac=TAC10;
const TAU10=Math.PI*2;
const FOV10=Math.PI*2/3;          /* cone de visão: 120° (NPCs e inimigos) */
const FOV_PL10=Math.PI;           /* cone dos tokens dos jogadores: 180° (visão periférica ampliada) */
const fovOf10=t=>{try{const ch=charById(t.charId);return ch&&ch.ownerId&&!gmChar6(ch)?FOV_PL10:FOV10}catch(e){return FOV10}};
const LAMP_FOV10=Math.PI/3;       /* facho da lanterna: 60° */
const LAMP_RANGE10=8;             /* alcance da lanterna em quadrados */
const SPEED10=3.4;                /* quadrados por segundo andando */
const ROT10=Math.PI*1.1;          /* giro por segundo com Q/E */
const LAMP_R10=6;                 /* alcance de uma lâmpada sem cômodo, em quadrados */
const FLICK_MS10=1400;            /* duração do piscar na queda de energia */
const FADE_S10=.2;                /* transição da névoa de um cômodo */
const LIGHT_RE10=/lanterna|tocha|lampi[aã]o|l[aâ]mpada|vela\b|isqueiro|sinalizador|fonte de luz|flashlight|celular/i;

/* ---------- geometria ---------- */
const hyp10=(x,y)=>Math.hypot(x,y);
function closestOnSeg10(px,py,ax,ay,bx,by){
  const ex=bx-ax,ey=by-ay,l2=ex*ex+ey*ey;let u=l2?((px-ax)*ex+(py-ay)*ey)/l2:0;u=Math.max(0,Math.min(1,u));
  return[ax+ex*u,ay+ey*u,u];
}
function distSeg10(px,py,s){const [qx,qy]=closestOnSeg10(px,py,s.ax,s.ay,s.bx,s.by);return hyp10(px-qx,py-qy)}
function inPoly10(x,y,pts){
  let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/((yj-yi)||1e-12)+xi)ins=!ins}
  return ins;
}
function polyArea10(pts){let a=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)a+=(pts[j][0]+pts[i][0])*(pts[j][1]-pts[i][1]);return Math.abs(a/2)}
const normAng10=a=>{a%=TAU10;return a<0?a+TAU10:a};
function angDiff10(a,b){let d=normAng10(a-b);return d>Math.PI?d-TAU10:d}
/* raio a partir de (ox,oy) na direção (dx,dy) normalizada: distância até a parede mais próxima */
function castRay10(ox,oy,dx,dy,segs,maxT){
  let best=maxT;
  for(let i=0;i<segs.length;i++){
    const s=segs[i],ex=s.bx-s.ax,ey=s.by-s.ay,den=dx*ey-dy*ex;if(den>-1e-12&&den<1e-12)continue;
    const wx=s.ax-ox,wy=s.ay-oy,t=(wx*ey-wy*ex)/den;if(t<=1e-6||t>=best)continue;
    const u=(wx*dy-wy*dx)/den;if(u<-1e-9||u>1+1e-9)continue;best=t;
  }
  return best;
}

/* ---------- geometria guardada no estado da mesa (por mapa) ---------- */
const geoKey10=()=>M6.state.map?.key||'~blank';
const rnd10=v=>Math.round(Number(v)*10)/10;
function normGeo10(g){
  g=g&&typeof g==='object'?g:{};
  const walls=(Array.isArray(g.walls)?g.walls:[]).filter(w=>w&&Array.isArray(w.a)&&Array.isArray(w.b)).slice(0,800).map(w=>{
    const o={id:String(w.id||('w'+rid())).slice(0,24),a:[rnd10(w.a[0]),rnd10(w.a[1])],b:[rnd10(w.b[0]),rnd10(w.b[1])]};
    if(w.door)o.door={open:!!w.door.open,locked:!!w.door.locked};return o});
  const rooms=(Array.isArray(g.rooms)?g.rooms:[]).filter(r=>r&&Array.isArray(r.pts)&&r.pts.length>=3).slice(0,120).map(r=>({
    id:String(r.id||('r'+rid())).slice(0,24),name:String(r.name||'Cômodo').slice(0,40),pts:r.pts.slice(0,64).map(p=>[rnd10(p[0]),rnd10(p[1])]),open:!!r.open,reset:Number(r.reset)||0,...(r.rough?{rough:true}:{})}));
  const lamps=(Array.isArray(g.lamps)?g.lamps:[]).filter(l=>l&&isFinite(l.x)&&isFinite(l.y)).slice(0,120).map(l=>({id:String(l.id||('l'+rid())).slice(0,24),x:rnd10(l.x),y:rnd10(l.y),room:l.room?String(l.room).slice(0,24):null,on:!!l.on}));
  const sws=(Array.isArray(g.sws)?g.sws:[]).filter(q=>q&&isFinite(q.x)&&isFinite(q.y)).slice(0,120).map(q=>({id:String(q.id||('s'+rid())).slice(0,24),x:rnd10(q.x),y:rnd10(q.y),room:q.room?String(q.room).slice(0,24):null}));
  return{walls,rooms,lamps,sws,dark:!!g.dark};
}
function geo10(){return normGeo10((M6.state.geo||{})[geoKey10()])}
function geoSet10(next,{undo=true}={}){
  if(!isGM6())return false;
  if(undo){TAC10.undo.push(JSON.stringify(geo10()));if(TAC10.undo.length>40)TAC10.undo.shift()}
  const all={...(M6.state.geo||{})};all[geoKey10()]=normGeo10(next);
  TAC10.blkSig='';return setState6({geo:all});
}
function geoUndo10(){
  const s=TAC10.undo.pop();if(!s){toast('Nada para desfazer.');return}
  geoSet10(JSON.parse(s),{undo:false});TAC10.chain=null;TAC10.poly=null;TAC10.doorA=null;
}
T3.geo=geo10;T3.geoSet=geoSet10;
/* porta: estado efetivo (o aviso ao vivo vale até o banco confirmar) */
function doorOpen10(w){const l=TAC10.doorLive[w.id];return l&&l.until>Date.now()?l.open:!!w.door?.open}
/* segmentos que bloqueiam movimento, visão e luz: paredes e portas fechadas + borda do mapa */
function blockers10(){
  const g=geo10(),now=Date.now(),{W,H}=mapWorld7();
  const live=Object.entries(TAC10.doorLive).filter(([,v])=>v.until>now).map(([k,v])=>k+(v.open?1:0)).join(',');
  const sig=(M6.state.rev||0)+'|'+geoKey10()+'|'+live+'|'+g.walls.length+'|'+W+'x'+H;
  if(sig===TAC10.blkSig&&TAC10.blk)return TAC10.blk;
  const segs=[];
  g.walls.forEach(w=>{if(w.door&&doorOpen10(w))return;segs.push({ax:w.a[0],ay:w.a[1],bx:w.b[0],by:w.b[1],id:w.id})});
  segs.push({ax:0,ay:0,bx:W,by:0},{ax:W,ay:0,bx:W,by:H},{ax:W,ay:H,bx:0,by:H},{ax:0,ay:H,bx:0,by:0});
  TAC10.blk=segs;TAC10.blkSig=sig;TAC10.polyCache.clear();return segs;
}

/* ---------- tokens: centro, raio, quem eu controlo ---------- */
function tokCenter10(t,p){const g=mapCfg7(),q=p||pos10(t),s=t.s||1;return[g.ox+(q.x+s/2)*g.cell,g.oy+(q.y+s/2)*g.cell]}
const tokR10=t=>(t.s||1)*mapCfg7().cell*.42;
const tokAng10=(t,p)=>{const q=p||pos10(t);return q.a!=null&&isFinite(q.a)?q.a:Math.PI/2};
function myToks10(){const me=uid3();return(M6.state.tokens||[]).filter(t=>{const ch=charById(t.charId);return ch&&me&&ch.ownerId===me&&!gmChar6(ch)})}
function ctlTok10(){
  const toks=M6.state.tokens||[];
  if(isGM6()){const t=toks.find(q=>q.id===MAP7.sel);return t||null}
  const mine=myToks10();if(!mine.length)return null;
  const sel=mine.find(q=>q.id===MAP7.sel);if(sel)return sel;
  const cur=curEntry()?.characterId;return mine.find(q=>q.charId===cur)||mine[0];
}
function hasLight10(ch){
  const items=dOf6(ch)?.inventory?.items;if(!Array.isArray(items))return false;
  return items.some(i=>i&&LIGHT_RE10.test(String(i.name||''))&&i.loc!=='chao'&&(i.qty==null||Number(i.qty)>0));
}
T3.hasLight=hasLight10;
/* lanterna: tem o item E está ligada (token.lt; o aviso ao vivo vale até o banco confirmar) */
function torchOn10(t){const ch=charById(t.charId);if(!ch||!hasLight10(ch))return false;const l=TAC10.ltLive[t.id];return l?!!l.on:!!t.lt}
/* lâmpadas: estado gravado (ou aviso ao vivo); na queda de energia elas piscam */
function lampBase10(l){const v=TAC10.lampLive[l.id];return v?!!v.on:!!l.on}
const flickOn10=now=>((Math.floor(now/65)*2654435761)>>>0)%100<42;
function lampOn10(l){if(!lampBase10(l))return false;const f=TAC10.flick;return f&&Date.now()<f.until?flickOn10(Date.now()):true}
/* um interruptor controla as lâmpadas do mesmo cômodo (sem cômodo: as sem cômodo num raio de 8 quadrados) */
function swLamps10(geo,sw){const cell=mapCfg7().cell;return geo.lamps.filter(l=>sw.room?l.room===sw.room:(!l.room&&hyp10(l.x-sw.x,l.y-sw.y)<=8*cell))}
T3.torchOn=torchOn10;T3.lampOn=lampOn10;

/* ---------- posição exibida: suaviza (lerp) o que chega pela rede ---------- */
function pos10(t){
  const now=Date.now(),l=MAP7.live[t.id],fresh=l&&l.until>now;
  if(fresh&&MAP7.drag&&MAP7.drag.id===t.id)return{x:l.x,y:l.y,a:l.a!=null?l.a:t.a};
  if(MOV10.id===t.id&&MOV10.st){const st=MOV10.st;TAC10.disp[t.id]={x:st.x,y:st.y,a:st.a,tx:st.x,ty:st.y,ta:st.a};return st}
  const tx=fresh?l.x:t.x,ty=fresh?l.y:t.y,ta=fresh&&l.a!=null?l.a:(t.a!=null?t.a:Math.PI/2);
  let d=TAC10.disp[t.id];
  if(!d||Math.abs(d.tx-tx)>8||Math.abs(d.ty-ty)>8){d=TAC10.disp[t.id]={x:tx,y:ty,a:ta,tx,ty,ta}}
  d.tx=tx;d.ty=ty;d.ta=ta;return d;
}
function stepDisp10(dt){
  let moving=false;const k=1-Math.exp(-dt*16),ids=new Set((M6.state.tokens||[]).map(t=>t.id));
  for(const id in TAC10.disp){
    if(!ids.has(id)){delete TAC10.disp[id];continue}
    const d=TAC10.disp[id];
    const dx=d.tx-d.x,dy=d.ty-d.y,da=angDiff10(d.ta,d.a);
    if(Math.abs(dx)+Math.abs(dy)<.002&&Math.abs(da)<.003){d.x=d.tx;d.y=d.ty;d.a=d.ta;continue}
    d.x+=dx*k;d.y+=dy*k;d.a+=da*k;moving=true;
  }
  return moving;
}

/* ---------- colisão círculo × segmento ---------- */
function collide10(x0,y0,x1,y1,R,segs){
  const dist=hyp10(x1-x0,y1-y0),steps=Math.max(1,Math.ceil(dist/(R*.35)));
  const minx=Math.min(x0,x1)-R*2,maxx=Math.max(x0,x1)+R*2,miny=Math.min(y0,y1)-R*2,maxy=Math.max(y0,y1)+R*2;
  const near=segs.filter(s=>Math.max(s.ax,s.bx)>=minx&&Math.min(s.ax,s.bx)<=maxx&&Math.max(s.ay,s.by)>=miny&&Math.min(s.ay,s.by)<=maxy);
  let x=x0,y=y0;
  for(let i=0;i<steps;i++){
    x+=(x1-x0)/steps;y+=(y1-y0)/steps;
    for(let it=0;it<4;it++){
      let pushed=false;
      for(const s of near){
        const [qx,qy]=closestOnSeg10(x,y,s.ax,s.ay,s.bx,s.by);let dx=x-qx,dy=y-qy,d=hyp10(dx,dy);
        if(d>=R)continue;
        if(d<1e-6){const ex=s.bx-s.ax,ey=s.by-s.ay,l=hyp10(ex,ey)||1;dx=-ey/l;dy=ex/l;d=1e-6}else{dx/=d;dy/=d}
        x=qx+dx*R;y=qy+dy*R;pushed=true;
      }
      if(!pushed)break;
    }
  }
  const {W,H}=mapWorld7();x=Math.max(R,Math.min(W-R,x));y=Math.max(R,Math.min(H-R,y));
  return[x,y];
}
T3.collide=collide10;

/* ---------- campo de visão (polígono de visibilidade por raycasting) ---------- */
function visPoly10(ox,oy,a,fov,range){
  const segsAll=blockers10(),full=fov>=TAU10-1e-6,{W,H}=mapWorld7(),R=isFinite(range)?range:hyp10(W,H)*1.5;
  const key=ox.toFixed(1)+','+oy.toFixed(1)+','+(full?0:a.toFixed(3))+','+fov.toFixed(3)+','+Math.round(R)+'|'+TAC10.blkSig;
  const hit=TAC10.polyCache.get(key);if(hit)return hit;
  const segs=isFinite(range)?segsAll.filter(s=>distSeg10(ox,oy,s)<=R+1):segsAll;
  const a0=full?-Math.PI:a-fov/2,angs=[];
  const N=full?Math.max(72,Math.ceil(TAU10/(Math.PI/90))):Math.max(12,Math.ceil(fov/(Math.PI/90)));
  for(let i=0;i<=N;i++){if(full&&i===N)break;angs.push(fov*i/N)}
  const add=(px,py)=>{if(isFinite(range)&&hyp10(px-ox,py-oy)>R*1.05)return;const an=Math.atan2(py-oy,px-ox);for(const e of[-1e-4,0,1e-4]){const rel=normAng10(an+e-a0);if(full||rel<=fov)angs.push(rel)}};
  segs.forEach(s=>{add(s.ax,s.ay);add(s.bx,s.by)});
  angs.sort((p,q)=>p-q);
  const pts=[];let last=-1;
  for(const rel of angs){if(rel-last<1e-5)continue;last=rel;const an=a0+rel,dx=Math.cos(an),dy=Math.sin(an),t=castRay10(ox,oy,dx,dy,segs,R);pts.push([ox+dx*t,oy+dy*t])}
  const poly=full?pts:[[ox,oy],...pts];
  if(TAC10.polyCache.size>160)TAC10.polyCache.clear();
  TAC10.polyCache.set(key,poly);return poly;
}
T3.visPoly=visPoly10;T3.inPoly=inPoly10;
/* frente do token: ponto fixo na borda, de onde saem o cone, a lanterna e a interação */
function front10(t,p){const [cx,cy]=tokCenter10(t,p),a=tokAng10(t,p),r=tokR10(t)*.85;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r,a,cx,cy]}
/* o que um token enxerga agora (cone no claro; luz no escuro) */
function tokView10(t,geo){
  const ch=charById(t.charId),[fx,fy,a,cx,cy]=front10(t),g=mapCfg7(),R=tokR10(t);
  if(geo.dark){
    const polys=[{poly:visPoly10(cx,cy,0,TAU10,R*2.4),ox:cx,oy:cy,r:R*2.4,soft:true}];
    if(torchOn10(t))polys.push({poly:visPoly10(fx,fy,a,LAMP_FOV10,LAMP_RANGE10*g.cell),ox:fx,oy:fy,r:LAMP_RANGE10*g.cell,lamp:true});
    return polys;
  }
  return[{poly:visPoly10(fx,fy,a,fovOf10(t),Infinity),ox:fx,oy:fy,r:0,cone:true}];
}

/* ---------- cômodos: a névoa só some enquanto o jogador está dentro (sem memória) ---------- */
const roomAt10=(rooms,x,y)=>rooms.filter(r=>inPoly10(x,y,r.pts));

/* ---------- estado de visão do quadro atual ---------- */
function litOf10(geo,l,mine){
  const room=l.room&&geo.rooms.find(r=>r.id===l.room),clips=mine.flatMap(m=>m.clips||[]);
  if(room)return{l,room,poly:room.pts,inside:mine.some(m=>inPoly10(m.cx,m.cy,room.pts)),clips};
  return{l,room:null,poly:visPoly10(l.x,l.y,0,TAU10,LAMP_R10*mapCfg7().cell),inside:false,clips};
}
/* o ponto está numa área acesa que este jogador enxerga (dentro do cômodo, ou pelo cone através de uma porta aberta)? */
const litAt10=(vs,x,y)=>vs.lit.some(L=>inPoly10(x,y,L.poly)&&(L.inside||L.clips.some(c=>inPoly10(x,y,c))));
function computeView10(){
  const geo=geo10(),isM=isGM6(),out={geo,mode:geo.dark?'dark':geo.rooms.length?'rooms':'open',mine:[],others:[],fog:[],gm:[],lit:[]};
  const toks=(M6.state.tokens||[]).filter(t=>charById(t.charId));
  const lamps=geo.dark?geo.lamps.filter(lampOn10):[];
  if(isM){
    toks.forEach(t=>{const ch=charById(t.charId);if(gmChar6(ch)&&!(geo.dark&&torchOn10(t)))return;out.gm.push({t,ch,views:tokView10(t,geo),player:!gmChar6(ch)})});
    out.lit=lamps.map(l=>{const L=litOf10(geo,l,[]);L.inside=true;return L});
    return out;
  }
  const mine=myToks10();
  mine.forEach(t=>{const [cx,cy]=tokCenter10(t);out.mine.push({t,views:tokView10(t,geo),los:geo.dark?visPoly10(cx,cy,0,TAU10,Infinity):null,cx,cy})});
  if(out.mode==='rooms'){
    const cur=new Set();out.mine.forEach(m=>roomAt10(geo.rooms,m.cx,m.cy).forEach(r=>cur.add(r.id)));
    out.fog=geo.rooms.filter(r=>!r.open&&!cur.has(r.id));
  }
  if(out.mode==='dark'){
    toks.forEach(t=>{if(mine.includes(t)||!torchOn10(t))return;const [fx,fy,a]=front10(t);out.others.push({poly:visPoly10(fx,fy,a,LAMP_FOV10,LAMP_RANGE10*mapCfg7().cell),ox:fx,oy:fy,r:LAMP_RANGE10*mapCfg7().cell})});
    if(lamps.length){
      out.mine.forEach(m=>{const [fx,fy,a]=front10(m.t);m.clips=[visPoly10(fx,fy,a,fovOf10(m.t),Infinity),m.views[0].poly]});
      out.lit=lamps.map(l=>litOf10(geo,l,out.mine));
    }
  }
  return out;
}
function view10(){const now=performance.now();if(!TAC10.vs||now-TAC10.vsAt>12){TAC10.vs=computeView10();TAC10.vsAt=now}return TAC10.vs}
/* o jogador enxerga este token? */
function tokVisible10(t){
  if(isGM6())return true;
  const ch=charById(t.charId);if(ch&&ch.ownerId===uid3())return true;
  const vs=view10();if(vs.mode==='open')return true;
  const [x,y]=tokCenter10(t);
  if(vs.mode==='dark'){
    if(vs.mine.some(m=>m.views.some(v=>inPoly10(x,y,v.poly))))return true;
    if(litAt10(vs,x,y))return true;
    return vs.others.some(o=>inPoly10(x,y,o.poly)&&vs.mine.some(m=>m.los&&inPoly10(x,y,m.los)));
  }
  const fogged=vs.fog.some(r=>inPoly10(x,y,r.pts));if(!fogged)return true;
  return vs.mine.some(m=>m.views.some(v=>inPoly10(x,y,v.poly)));
}
/* interruptor: no escuro só aparece quando o campo de visão ativo (facho, tato ou área acesa) passa por cima */
function swVisible10(s){
  if(isGM6())return true;
  const vs=view10(),geo=vs.geo;if(vs.mode==='open')return true;
  const room=s.room&&geo.rooms.find(r=>r.id===s.room);let px=s.x,py=s.y;
  if(room){const c=room.pts.reduce((a,p)=>[a[0]+p[0]/room.pts.length,a[1]+p[1]/room.pts.length],[0,0]),d=hyp10(c[0]-s.x,c[1]-s.y)||1;px=s.x+(c[0]-s.x)/d*4;py=s.y+(c[1]-s.y)/d*4}
  /* o ponto logo à frente do interruptor, do lado de quem olha */
  const seen=vs.mine.some(m=>m.views.some(o=>{const d=hyp10(o.ox-s.x,o.oy-s.y)||1;return inPoly10(s.x+(o.ox-s.x)/d*4,s.y+(o.oy-s.y)/d*4,o.poly)}));
  if(vs.mode==='rooms')return seen||!vs.fog.some(r=>inPoly10(px,py,r.pts));
  return seen||litAt10(vs,px,py);
}
T3.tokVisible=tokVisible10;T3.swVisible=swVisible10;T3.computeView=()=>computeView10();T3.tokView=t=>tokView10(t,geo10());T3.tokCenter=t=>tokCenter10(t);

/* ---------- desenho ---------- */
function path10(x,v,pts){if(!pts||!pts.length)return;x.moveTo(pts[0][0]*v.s+v.tx,pts[0][1]*v.s+v.ty);for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0]*v.s+v.tx,pts[i][1]*v.s+v.ty);x.closePath()}
function fogCanvas10(){
  const cv=MAP7.cv;let f=TAC10.fogCv;if(!f){f=TAC10.fogCv=document.createElement('canvas');TAC10.fx=f.getContext('2d')}
  if(f.width!==cv.width||f.height!==cv.height){f.width=cv.width;f.height=cv.height}
  const fx=TAC10.fx,dpr=MAP7.dpr||1;fx.setTransform(1,0,0,1,0,0);fx.globalCompositeOperation='source-over';fx.clearRect(0,0,f.width,f.height);fx.setTransform(dpr,0,0,dpr,0,0);return fx;
}
function lightCut10(fx,v,o,alpha=1){
  fx.save();fx.globalCompositeOperation='destination-out';fx.beginPath();path10(fx,v,o.poly);
  if(o.r>0){const [sx,sy]=w2s7(v,o.ox,o.oy),r=o.r*v.s,gr=fx.createRadialGradient(sx,sy,0,sx,sy,r);gr.addColorStop(0,`rgba(0,0,0,${alpha})`);gr.addColorStop(o.soft?.55:.72,`rgba(0,0,0,${alpha*.93})`);gr.addColorStop(1,'rgba(0,0,0,0)');fx.fillStyle=gr}
  else fx.fillStyle=`rgba(0,0,0,${alpha})`;
  fx.fill();fx.restore();
}
/* paredes e portas (debaixo dos tokens e da névoa) */
function paintUnder10(x,v,g,isM){
  const geo=geo10(),hasImg=!!(MAP7.img&&M6.state.map),editing=isM&&MAP7.tool==='edit';
  if(!geo.walls.length)return;
  x.save();x.lineCap='round';
  geo.walls.forEach(w=>{
    const [ax,ay]=w2s7(v,w.a[0],w.a[1]),[bx,by]=w2s7(v,w.b[0],w.b[1]);
    if(w.door){
      const open=doorOpen10(w),len=hyp10(bx-ax,by-ay);
      x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=Math.max(2,g.cell*v.s*.12);x.strokeStyle=open?'rgba(120,85,50,.35)':'#7a5432';x.setLineDash(open?[4,4]:[]);x.stroke();x.setLineDash([]);
      if(open){const an=Math.atan2(by-ay,bx-ax)-Math.PI*.45;x.beginPath();x.moveTo(ax,ay);x.lineTo(ax+Math.cos(an)*len,ay+Math.sin(an)*len);x.lineWidth=Math.max(2,g.cell*v.s*.09);x.strokeStyle='#a87444';x.stroke();
        x.beginPath();x.arc(ax,ay,len,an,Math.atan2(by-ay,bx-ax));x.lineWidth=1;x.strokeStyle='rgba(168,116,68,.55)';x.setLineDash([3,4]);x.stroke();x.setLineDash([])}
      else{x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=Math.max(1,g.cell*v.s*.04);x.strokeStyle='#d9a066';x.stroke()}
      return;
    }
    if(hasImg&&!isM)return; /* no mapa com desenho, a parede já aparece na imagem */
    x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);
    if(editing){x.lineWidth=4;x.strokeStyle='rgba(255,120,70,.95)'}
    else if(isM){x.lineWidth=hasImg?2:Math.max(3,g.cell*v.s*.1);x.strokeStyle=hasImg?'rgba(255,140,90,.55)':'#3a2a20'}
    else{x.lineWidth=Math.max(3,g.cell*v.s*.1);x.strokeStyle='#3a2a20'}
    x.stroke();
    if(editing){[[ax,ay],[bx,by]].forEach(([px,py])=>{x.beginPath();x.arc(px,py,3.5,0,TAU10);x.fillStyle='#ffd2b8';x.fill()})}
  });
  x.restore();
}
/* marcador de frente no token */
function paintFacing10(x,t,cx,cy,r,own){
  const a=tokAng10(t),px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r,s=Math.max(3.5,r*.26);
  x.save();x.beginPath();x.moveTo(px+Math.cos(a)*s*1.5,py+Math.sin(a)*s*1.5);x.lineTo(px+Math.cos(a+2.3)*s,py+Math.sin(a+2.3)*s);x.lineTo(px+Math.cos(a-2.3)*s,py+Math.sin(a-2.3)*s);x.closePath();
  x.fillStyle=own?'#f0c85a':'#f4ead6';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=1.5;x.fill();x.stroke();
  x.beginPath();x.arc(px,py,Math.max(2,s*.45),0,TAU10);x.fillStyle=own?'#fff4cf':'#ffffff';x.fill();x.restore();
}
const pcol10=id=>{let h=7;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return`hsl(${Math.round((h*137.508)%360)} 85% 62%`};
/* névoa, escuro, visão dos jogadores (Mestre), portas (cadeados), editor, laser */
function paintOver10(x,v,g,isM){
  const vs=view10(),geo=vs.geo,dark=document.body.classList.contains('t3-dark');
  if(!isM){
    if(vs.mode==='rooms'){
      /* cada cômodo tem a sua opacidade de névoa (sobe e desce em ~200 ms quando o jogador sai ou entra) */
      const FA=TAC10.fogA,rs=geo.rooms.filter(r=>!r.open&&FA[r.id]>.01);
      if(rs.length){
        const fx=fogCanvas10();fx.fillStyle=dark?'#07090d':'#120d0a';
        rs.forEach(r=>{fx.globalAlpha=Math.min(1,FA[r.id]);fx.beginPath();path10(fx,v,r.pts);fx.fill()});fx.globalAlpha=1;
        vs.mine.forEach(m=>m.views.forEach(o=>lightCut10(fx,v,o)));
        x.drawImage(TAC10.fogCv,0,0,v.cw,v.ch);
      }
    }else if(vs.mode==='dark'){
      const fx=fogCanvas10();fx.fillStyle='rgba(2,2,4,.985)';fx.fillRect(0,0,v.cw,v.ch);
      vs.mine.forEach(m=>m.views.forEach(o=>lightCut10(fx,v,o)));
      if(vs.others.length&&vs.mine.some(m=>m.los)){fx.save();fx.beginPath();vs.mine.forEach(m=>m.los&&path10(fx,v,m.los));fx.clip();vs.others.forEach(o=>lightCut10(fx,v,o));fx.restore()}
      cutLit10(fx,v,vs);
      x.drawImage(TAC10.fogCv,0,0,v.cw,v.ch);tintLit10(x,v,vs);
      x.save();x.globalCompositeOperation='screen';[...vs.mine.flatMap(m=>m.views.filter(o=>o.lamp)),...vs.others].forEach(o=>{const [sx,sy]=w2s7(v,o.ox,o.oy),gr=x.createRadialGradient(sx,sy,0,sx,sy,o.r*v.s);gr.addColorStop(0,'rgba(255,214,140,.16)');gr.addColorStop(1,'rgba(255,214,140,0)');x.beginPath();path10(x,v,o.poly);x.fillStyle=gr;x.fill()});x.restore();
    }
  }else{
    /* Mestre: tudo nítido; névoa e escuro translúcidos para referência */
    geo.rooms.forEach(r=>{
      x.save();x.beginPath();path10(x,v,r.pts);
      if(!r.open){x.fillStyle='rgba(16,16,30,.34)';x.fill()}
      x.setLineDash(r.open?[2,5]:[7,5]);x.lineWidth=1.5;x.strokeStyle=r.open?'rgba(120,220,160,.75)':'rgba(190,190,235,.8)';x.stroke();x.setLineDash([]);
      if(MAP7.tool==='edit'||g.cell*v.s>22){const c=r.pts.reduce((s,p)=>[s[0]+p[0]/r.pts.length,s[1]+p[1]/r.pts.length],[0,0]),[sx,sy]=w2s7(v,c[0],c[1]);x.font='600 11px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=r.open?'rgba(190,255,215,.85)':'rgba(225,225,255,.85)';x.fillText((r.open?'':'🌫 ')+r.name,sx,sy)}
      x.restore();
    });
    if(geo.dark){const fx=fogCanvas10();fx.fillStyle='rgba(0,0,0,.5)';fx.fillRect(0,0,v.cw,v.ch);vs.gm.forEach(o=>o.views.forEach(w=>lightCut10(fx,v,w)));cutLit10(fx,v,vs);x.drawImage(TAC10.fogCv,0,0,v.cw,v.ch);tintLit10(x,v,vs)}
    vs.gm.forEach(o=>{if(!o.player&&!geo.dark)return;const col=pcol10(o.t.charId);o.views.forEach(w=>{if(!geo.dark&&!w.cone)return;x.save();x.beginPath();path10(x,v,w.poly);x.fillStyle=col+' / .12)';x.fill();x.lineWidth=1.4;x.strokeStyle=col+' / .7)';x.stroke();x.restore()})});
    /* cadeados das portas (só o Mestre vê) */
    geo.walls.forEach(w=>{if(!w.door)return;const [sx,sy]=w2s7(v,(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2);x.save();x.beginPath();x.arc(sx,sy,11,0,TAU10);x.fillStyle=w.door.locked?'rgba(120,30,25,.92)':'rgba(30,70,40,.92)';x.fill();x.lineWidth=1.5;x.strokeStyle='#f4ead6';x.stroke();x.font='12px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(w.door.locked?'🔒':'🔓',sx,sy+1);x.restore()});
  }
  paintFixtures10(x,v,g,isM,vs);
  paintEditor10(x,v,g,isM);
  paintLaser10(x,v);
  if(TAC10.placing&&TAC10.hover){const ch=charById(TAC10.placing),[sx,sy]=[TAC10.hover.sx,TAC10.hover.sy],r=g.cell*v.s*.46;x.save();x.globalAlpha=.75;x.beginPath();x.arc(sx,sy,r,0,TAU10);x.fillStyle='rgba(240,200,90,.25)';x.fill();x.setLineDash([5,4]);x.lineWidth=2;x.strokeStyle='#f0c85a';x.stroke();x.setLineDash([]);x.font='600 12px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='top';x.fillStyle='#fff';x.fillText(nm(ch),sx,sy+r+4);x.restore()}
}

/* áreas acesas por lâmpadas: recortam a escuridão (só onde o jogador enxerga) e ganham um tom quente */
function litEach10(vs,fn){vs.lit.forEach(L=>{if(L.inside)fn(L.poly,null);else L.clips.forEach(c=>fn(L.poly,c))})}
function cutLit10(fx,v,vs){
  fx.save();fx.globalCompositeOperation='destination-out';fx.fillStyle='#000';
  litEach10(vs,(poly,clip)=>{fx.save();if(clip){fx.beginPath();path10(fx,v,clip);fx.clip()}fx.beginPath();path10(fx,v,poly);fx.fill();fx.restore()});
  fx.restore();
}
function tintLit10(x,v,vs){
  x.save();x.fillStyle='rgba(255,208,130,.11)';
  litEach10(vs,(poly,clip)=>{x.save();if(clip){x.beginPath();path10(x,v,clip);x.clip()}x.beginPath();path10(x,v,poly);x.fill();x.restore()});
  x.restore();
}
/* lâmpadas e interruptores: o Mestre vê tudo; o jogador só o que a luz dele alcança */
function paintFixtures10(x,v,g,isM,vs){
  const geo=vs.geo;if(!geo.lamps.length&&!geo.sws.length)return;
  const r=Math.max(9,Math.min(16,g.cell*v.s*.3));
  x.save();x.textAlign='center';x.textBaseline='middle';x.font=`${Math.round(r*1.15)}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  geo.lamps.forEach(l=>{
    const on=lampOn10(l),base=lampBase10(l);
    if(!isM&&!(geo.dark&&on&&litAt10(vs,l.x,l.y)))return;
    const [sx,sy]=w2s7(v,l.x,l.y);
    if(on){const gr=x.createRadialGradient(sx,sy,0,sx,sy,r*2.4);gr.addColorStop(0,'rgba(255,228,150,.8)');gr.addColorStop(1,'rgba(255,228,150,0)');x.fillStyle=gr;x.beginPath();x.arc(sx,sy,r*2.4,0,TAU10);x.fill()}
    if(isM){x.beginPath();x.arc(sx,sy,r,0,TAU10);x.fillStyle=base?'rgba(120,90,10,.92)':'rgba(40,40,50,.92)';x.fill();x.lineWidth=1.6;x.strokeStyle=base?'#ffd86b':'#8a8a98';x.stroke();x.fillStyle='#fff';x.fillText('🔆',sx,sy+1)}
    else{x.beginPath();x.arc(sx,sy,Math.max(3,r*.32),0,TAU10);x.fillStyle='#fff6d2';x.fill()}
  });
  geo.sws.forEach(q=>{
    if(!swVisible10(q))return;
    const [sx,sy]=w2s7(v,q.x,q.y),on=swLamps10(geo,q).some(lampBase10),h=r*.95;
    x.beginPath();x.rect(sx-h,sy-h,h*2,h*2);x.fillStyle=on?'rgba(120,88,12,.95)':'rgba(30,30,40,.95)';x.fill();x.lineWidth=1.6;x.strokeStyle=on?'#ffd86b':'#a2a2b2';x.stroke();
    x.fillStyle='#fff';x.fillText('💡',sx,sy+1);
  });
  x.restore();
}
function lampHit10(wx,wy,v){const tol=14/v.s;return geo10().lamps.find(l=>hyp10(l.x-wx,l.y-wy)<=tol)||null}
function swHit10(wx,wy,v){const tol=14/v.s;return geo10().sws.find(q=>hyp10(q.x-wx,q.y-wy)<=tol)||null}
function distPoly10(x,y,pts){let d=Infinity;for(let i=0,j=pts.length-1;i<pts.length;j=i++)d=Math.min(d,distSeg10(x,y,{ax:pts[j][0],ay:pts[j][1],bx:pts[i][0],by:pts[i][1]}));return d}
const smallestRoom10=rs=>rs.slice().sort((a,b)=>polyArea10(a.pts)-polyArea10(b.pts))[0]||null;

/* ---------- editor do Mestre ---------- */
function snap10(wx,wy,v){
  const tol=12/v.s,geo=geo10();let best=null,bd=tol;
  const tryp=(px,py)=>{const d=hyp10(px-wx,py-wy);if(d<bd){bd=d;best=[px,py]}};
  geo.walls.forEach(w=>{tryp(w.a[0],w.a[1]);tryp(w.b[0],w.b[1])});
  geo.rooms.forEach(r=>r.pts.forEach(p=>tryp(p[0],p[1])));
  (TAC10.poly||[]).forEach(p=>tryp(p[0],p[1]));
  if(best)return best;
  if(TAC10.snap){const g=mapCfg7(),h=g.cell/2;return[g.ox+Math.round((wx-g.ox)/h)*h,g.oy+Math.round((wy-g.oy)/h)*h]}
  return[wx,wy];
}
function nearWall10(wx,wy,v,onlyDoors,tolW){
  const tol=tolW||10/v.s;let best=null,bd=tol;
  geo10().walls.forEach(w=>{if(onlyDoors&&!w.door)return;const d=distSeg10(wx,wy,{ax:w.a[0],ay:w.a[1],bx:w.b[0],by:w.b[1]});if(d<bd){bd=d;best=w}});
  return best;
}
function lockHit10(wx,wy,v){
  const tol=13/v.s;return geo10().walls.find(w=>w.door&&hyp10((w.a[0]+w.b[0])/2-wx,(w.a[1]+w.b[1])/2-wy)<=tol)||null;
}
function chainEnd10(){TAC10.chain=null;mapDraw7()}
function polyClose10(){
  const pts=TAC10.poly;TAC10.poly=null;
  if(!pts||pts.length<3){mapDraw7();return}
  const g=geo10();g.rooms.push({id:'r'+rid(),name:'Cômodo '+(g.rooms.length+1),pts,open:false,reset:0});geoSet10(g);toast('Cômodo criado. Ele começa coberto pela névoa para os jogadores.');
}
function editDown10(e,p){
  const v=p.v,m=TAC10.edit,geo=geo10();
  if(e.button===2)return true;/* o direito move o mapa; duplo clique esquerdo confirma (dblclick) */
  if(m==='wall'){
    const [sx,sy]=snap10(p.wx,p.wy,v);
    if(TAC10.chain){const [lx,ly]=TAC10.chain;if(hyp10(sx-lx,sy-ly)*v.s<4)return true;geo.walls.push({id:'w'+rid(),a:[lx,ly],b:[sx,sy]});geoSet10(geo)}
    TAC10.chain=[sx,sy];mapDraw7();return true;
  }
  if(m==='door'){
    const w=TAC10.doorA?null:nearWall10(p.wx,p.wy,v,false);
    if(w){geo.walls=geo.walls.map(q=>q.id===w.id?(q.door?{id:q.id,a:q.a,b:q.b}:{...q,door:{open:false,locked:false}}):q);geoSet10(geo);toast(w.door?'Porta virou parede.':'Parede virou porta (fechada e destrancada).');return true}
    const [sx,sy]=snap10(p.wx,p.wy,v);
    if(!TAC10.doorA){TAC10.doorA=[sx,sy];mapDraw7();return true}
    const [ax,ay]=TAC10.doorA;TAC10.doorA=null;
    if(hyp10(sx-ax,sy-ay)*v.s<6){mapDraw7();return true}
    geo.walls.push({id:'w'+rid(),a:[ax,ay],b:[sx,sy],door:{open:false,locked:false}});geoSet10(geo);return true;
  }
  if(m==='room'){
    const [sx,sy]=snap10(p.wx,p.wy,v);
    if(!TAC10.poly)TAC10.poly=[];
    const f=TAC10.poly[0];
    if(f&&TAC10.poly.length>=3&&hyp10(sx-f[0],sy-f[1])*v.s<12){polyClose10();return true}
    const l=TAC10.poly[TAC10.poly.length-1];if(l&&hyp10(sx-l[0],sy-l[1])*v.s<4)return true;
    TAC10.poly.push([sx,sy]);mapDraw7();return true;
  }
  if(m==='rough'){
    const rs=roomAt10(geo.rooms,p.wx,p.wy).sort((a,b)=>polyArea10(a.pts)-polyArea10(b.pts));const r=rs[0];
    if(!r){toast('Clique dentro de um cômodo.');return true}
    geo.rooms=geo.rooms.map(q=>q.id===r.id?(q.rough?(({rough,...z})=>z)(q):{...q,rough:true}):q);geoSet10(geo);
    toast(r.rough?`“${r.name}” voltou a ser terreno normal.`:`“${r.name}” agora é terreno difícil: andar ali custa o dobro.`);return true;
  }
  if(m==='roomfog'){
    const rs=roomAt10(geo.rooms,p.wx,p.wy).sort((a,b)=>polyArea10(a.pts)-polyArea10(b.pts));const r=rs[0];
    if(!r){toast('Clique dentro de um cômodo.');return true}
    geo.rooms=geo.rooms.map(q=>q.id===r.id?{...q,open:!q.open,reset:q.open?q.reset+1:q.reset}:q);geoSet10(geo);
    toast(r.open?`Névoa recolocada em “${r.name}”.`:`“${r.name}” revelado para todos.`);return true;
  }
  if(m==='lamp'){
    const h=lampHit10(p.wx,p.wy,v);if(h){lampSet10([h.id],!lampBase10(h),'gm');return true}
    const [sx,sy]=snap10(p.wx,p.wy,v),room=smallestRoom10(roomAt10(geo.rooms,sx,sy));
    geo.lamps.push({id:'l'+rid(),x:sx,y:sy,room:room?room.id:null,on:false});geoSet10(geo);
    toast(room?`Lâmpada colocada em “${room.name}” (apagada). Clique nela para ligar.`:`Lâmpada sem cômodo: ilumina um raio de ${LAMP_R10} quadrados.`);return true;
  }
  if(m==='sw'){
    const w=nearWall10(p.wx,p.wy,v,false,mapCfg7().cell*.8);
    if(!w){toast('Clique perto de uma parede para colocar o interruptor.');return true}
    const [qx,qy]=closestOnSeg10(p.wx,p.wy,w.a[0],w.a[1],w.b[0],w.b[1]);
    let rs=roomAt10(geo.rooms,p.wx,p.wy);if(!rs.length)rs=geo.rooms.filter(r=>distPoly10(qx,qy,r.pts)<5);
    const room=smallestRoom10(rs);
    geo.sws.push({id:'s'+rid(),x:qx,y:qy,room:room?room.id:null});geoSet10(geo);
    toast(room?`Interruptor ligado às lâmpadas de “${room.name}”.`:'Interruptor sem cômodo: liga as lâmpadas sem cômodo num raio de 8 quadrados.');return true;
  }
  if(m==='erase'){
    const lh=lampHit10(p.wx,p.wy,v);if(lh){geo.lamps=geo.lamps.filter(q=>q.id!==lh.id);geoSet10(geo);return true}
    const sh=swHit10(p.wx,p.wy,v);if(sh){geo.sws=geo.sws.filter(q=>q.id!==sh.id);geoSet10(geo);return true}
    const w=nearWall10(p.wx,p.wy,v,false);
    if(w){geo.walls=geo.walls.filter(q=>q.id!==w.id);geoSet10(geo);return true}
    const rs=roomAt10(geo.rooms,p.wx,p.wy).sort((a,b)=>polyArea10(a.pts)-polyArea10(b.pts));
    if(rs[0]){geo.rooms=geo.rooms.filter(q=>q.id!==rs[0].id);geoSet10(geo);toast(`“${rs[0].name}” apagado. Use Desfazer se foi sem querer.`)}
    return true;
  }
  return false;
}
function paintEditor10(x,v,g,isM){
  if(!isM||MAP7.tool!=='edit')return;
  const h=TAC10.hover,m=TAC10.edit;
  const sp=h?snap10(h.wx,h.wy,v):null;
  x.save();
  if(m==='wall'&&TAC10.chain&&sp){const [ax,ay]=w2s7(v,...TAC10.chain),[bx,by]=w2s7(v,...sp);x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.setLineDash([6,5]);x.lineWidth=3;x.strokeStyle='rgba(255,140,90,.9)';x.stroke();x.setLineDash([])}
  if(m==='door'&&TAC10.doorA&&sp){const [ax,ay]=w2s7(v,...TAC10.doorA),[bx,by]=w2s7(v,...sp);x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.setLineDash([6,5]);x.lineWidth=4;x.strokeStyle='#d9a066';x.stroke();x.setLineDash([])}
  if(m==='room'&&TAC10.poly&&TAC10.poly.length){x.beginPath();path10(x,v,sp?[...TAC10.poly,sp]:TAC10.poly);x.fillStyle='rgba(160,160,255,.12)';x.fill();x.setLineDash([6,5]);x.lineWidth=2;x.strokeStyle='rgba(200,200,255,.95)';x.stroke();x.setLineDash([]);
    TAC10.poly.forEach((p,i)=>{const [px,py]=w2s7(v,p[0],p[1]);x.beginPath();x.arc(px,py,i?3.5:6,0,TAU10);x.fillStyle=i?'#dcdcff':'#fff';x.fill()})}
  if(m==='lamp'&&sp){const [px,py]=w2s7(v,...sp);x.beginPath();x.arc(px,py,10,0,TAU10);x.setLineDash([4,3]);x.lineWidth=2;x.strokeStyle='#ffd86b';x.stroke();x.setLineDash([])}
  if(m==='sw'&&h){const w=nearWall10(h.wx,h.wy,v,false,mapCfg7().cell*.8);if(w){const [qx,qy]=closestOnSeg10(h.wx,h.wy,w.a[0],w.a[1],w.b[0],w.b[1]),[px,py]=w2s7(v,qx,qy);x.beginPath();x.rect(px-9,py-9,18,18);x.setLineDash([4,3]);x.lineWidth=2;x.strokeStyle='#ffd86b';x.stroke();x.setLineDash([])}}
  if(sp&&(m==='wall'||m==='door'||m==='room')){const [px,py]=w2s7(v,...sp);x.beginPath();x.arc(px,py,6,0,TAU10);x.lineWidth=2;x.strokeStyle='#fff';x.stroke()}
  if((m==='erase'||m==='door')&&h&&!TAC10.doorA){const w=nearWall10(h.wx,h.wy,v,false);if(w){const [ax,ay]=w2s7(v,...w.a),[bx,by]=w2s7(v,...w.b);x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=7;x.strokeStyle=m==='erase'?'rgba(255,70,70,.55)':'rgba(240,200,90,.55)';x.stroke()}}
  x.restore();
}

/* ---------- ponto de destaque (laser) do Mestre ---------- */
function laserAt10(wx,wy,kind){
  const now=Date.now(),L=TAC10.laser;
  if(kind!=='click'&&now-L.last<40)return;L.last=now;
  cast6({t:'ping',x:+wx.toFixed(1),y:+wy.toFixed(1),k:kind||'move'});laserGot10(wx,wy,kind);
}
function laserGot10(wx,wy,kind){
  const now=Date.now(),L=TAC10.laser;L.pts.push({x:wx,y:wy,t:now});if(L.pts.length>40)L.pts.splice(0,L.pts.length-40);
  if(kind==='click')L.rip.push({x:wx,y:wy,t:now});mapDraw7();
}
function paintLaser10(x,v){
  const L=TAC10.laser,now=Date.now();
  L.pts=L.pts.filter(p=>now-p.t<1400);L.rip=L.rip.filter(r=>now-r.t<1100);
  if(!L.pts.length&&!L.rip.length)return false;
  x.save();
  const trail=L.pts.filter(p=>now-p.t<500);
  for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i],[ax,ay]=w2s7(v,a.x,a.y),[bx,by]=w2s7(v,b.x,b.y),al=1-(now-b.t)/500;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=4*al+1;x.strokeStyle=`rgba(255,60,50,${.55*al})`;x.lineCap='round';x.stroke()}
  const h=L.pts[L.pts.length-1];
  if(h){const age=now-h.t,al=age<900?1:Math.max(0,1-(age-900)/500),[sx,sy]=w2s7(v,h.x,h.y),pulse=Math.sin(now/120)*3;
    x.globalAlpha=al;x.shadowColor='rgba(255,40,30,.95)';x.shadowBlur=18;x.beginPath();x.arc(sx,sy,6,0,TAU10);x.fillStyle='#ff3b30';x.fill();x.shadowBlur=0;
    x.beginPath();x.arc(sx,sy,12+pulse,0,TAU10);x.lineWidth=2.5;x.strokeStyle='rgba(255,90,80,.85)';x.stroke();x.globalAlpha=1}
  L.rip.forEach(r=>{const k=(now-r.t)/1100,[sx,sy]=w2s7(v,r.x,r.y);for(let i=0;i<2;i++){const kk=Math.max(0,k-i*.18);x.beginPath();x.arc(sx,sy,10+kk*60,0,TAU10);x.lineWidth=3*(1-kk);x.strokeStyle=`rgba(255,70,60,${.8*(1-kk)})`;x.stroke()}});
  x.restore();return true;
}

/* ---------- portas: interação, som e gravação ---------- */
S5.doorOpen=t=>{
  n5(t,.035,{freq:3300,q:4,gain:.2,wet:.1});o5('square',1300,t,.02,{gain:.025,wet:.05});
  const c=A5.ctx,o=c.createOscillator(),f=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain(),g2=c.createGain();
  o.type='sawtooth';let fr=92;for(let i=0;i<22;i++){fr=Math.max(70,Math.min(170,fr+(Math.random()-.4)*26));o.frequency.setValueAtTime(fr,t+.07+i*.04)}
  f.type='bandpass';f.frequency.value=980;f.Q.value=7;f2.type='bandpass';f2.frequency.value=2300;f2.Q.value=10;
  const v=vol5();g.gain.setValueAtTime(.0001,t+.06);g.gain.exponentialRampToValueAtTime(.11*v+.0001,t+.16);g.gain.setValueAtTime(.1*v+.0001,t+.8);g.gain.exponentialRampToValueAtTime(.0001,t+1.02);
  g2.gain.value=.35;o.connect(f);f.connect(g);o.connect(f2);f2.connect(g2);g2.connect(g);send5(g,.35);o.start(t+.06);o.stop(t+1.08);
  n5(t+.2,.65,{freq:420,to:180,type:'lowpass',gain:.05,wet:.5});
};
S5.doorClose=t=>{
  const c=A5.ctx,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';
  for(let i=0;i<7;i++)o.frequency.setValueAtTime(110+Math.random()*50,t+i*.04);f.type='bandpass';f.frequency.value=1100;f.Q.value=7;
  const v=vol5();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08*v+.0001,t+.06);g.gain.exponentialRampToValueAtTime(.0001,t+.3);
  o.connect(f);f.connect(g);send5(g,.3);o.start(t);o.stop(t+.34);
  n5(t+.31,.14,{freq:170,type:'lowpass',gain:.38,wet:.35});o5('sine',74,t+.31,.28,{to:44,gain:.26,wet:.2});n5(t+.37,.03,{freq:2900,q:5,gain:.16,wet:.05});
};
S5.switchClick=t=>{
  n5(t,.014,{freq:3800,q:6,gain:.3,wet:.04});o5('square',1650,t,.012,{gain:.035,wet:.04});
  o5('sine',150,t+.012,.06,{to:90,gain:.16,wet:.1});n5(t+.075,.02,{freq:2500,q:5,gain:.18,wet:.05});
};
S5.torchClick=t=>{
  n5(t,.01,{freq:4900,q:12,gain:.3,wet:.05});o5('triangle',2150,t,.03,{to:1500,gain:.06,wet:.08});
  n5(t+.055,.012,{freq:3500,q:10,gain:.2,wet:.05});o5('sine',320,t+.01,.05,{to:210,gain:.1,wet:.1});
};
S5.power=t=>{
  o5('sawtooth',210,t,.8,{to:38,gain:.1,wet:.35});n5(t+.04,.6,{freq:1000,to:110,type:'lowpass',gain:.14,wet:.45});
  for(let i=0;i<5;i++){n5(t+.1+i*.19+Math.random()*.05,.02,{freq:2800+Math.random()*1200,q:6,gain:.14,wet:.05})}
  o5('sine',60,t+.9,.4,{to:34,gain:.22,wet:.3});
};
S5.doorLocked=t=>{
  n5(t,.06,{freq:520,type:'lowpass',gain:.2,wet:.1});
  for(let i=0;i<5;i++){const tt=t+.02+i*.072+Math.random()*.014;n5(tt,.028,{freq:2400+Math.random()*1800,q:6,gain:.2-.02*i,wet:.08});o5('triangle',380+Math.random()*120,tt,.03,{gain:.035,wet:.05})}
};
/* o que está ao alcance e à frente do token: porta ou interruptor (o mais perto) */
function reach10(t){
  if(!t)return null;const [fx,fy,a]=front10(t),g=mapCfg7(),reach=g.cell*.95,geo=geo10();let best=null,bd=Infinity;
  const test=(kind,obj,qx,qy)=>{const d=hyp10(qx-fx,qy-fy);if(d>reach)return;const ang=Math.atan2(qy-fy,qx-fx);if(d>g.cell*.2&&Math.abs(angDiff10(ang,a))>Math.PI*.42)return;if(d<bd){bd=d;best={kind,obj}}};
  geo.walls.forEach(w=>{if(!w.door)return;const [qx,qy]=closestOnSeg10(fx,fy,w.a[0],w.a[1],w.b[0],w.b[1]);test('door',w,qx,qy)});
  geo.sws.forEach(q=>test('sw',q,q.x,q.y));
  return best;
}
const doorReach10=t=>{const r=reach10(t);return r&&r.kind==='door'?r.obj:null};
T3.reach=reach10;
function interact10(){
  const t=ctlTok10();if(!t){toast(isGM6()?'Selecione um token para interagir.':'Você não tem um token neste mapa.');return}
  const r=reach10(t);if(!r){toast('Nada para interagir à frente do personagem.');return}
  if(r.kind==='sw')swUse10(r.obj,t);else doorUse10(r.obj,t);
}
const DOOR_CD10=2500; /* ms entre usos da mesma porta */
function doorUse10(w,t){
  /* tempo de espera: a mesma porta não abre e fecha sem parar */
  const cd=TAC10.doorCd||(TAC10.doorCd={}),nowT=Date.now();
  if(cd[w.id]&&nowT-cd[w.id]<DOOR_CD10){toast('⏳ A porta acabou de ser usada. Aguarde um instante.');return}
  cd[w.id]=nowT;
  const key=geoKey10(),isM=isGM6();
  if(w.door.locked&&!isM){fx5('doorLocked');cast6({t:'doorlk',k:key,id:w.id,who:t?nm(charById(t.charId)):''});toast('🔒 A porta está trancada.');return}
  const open=!doorOpen10(w);
  TAC10.doorLive[w.id]={open,until:Date.now()+8000};TAC10.blkSig='';
  fx5(open?'doorOpen':'doorClose');cast6({t:'door',k:key,id:w.id,open});mapDraw7();
  if(isM){const g=geo10();g.walls=g.walls.map(q=>q.id===w.id?{...q,door:{...q.door,open}}:q);geoSet10(g,{undo:false});return}
  doorSave10(key,w.id);
}
async function doorSave10(key,id){
  if(M6.backend==='store'&&!TAC10.noDoorFn&&typeof sb()?.rpc==='function'){
    try{const {data,error}=await sb().rpc('use_campaign_door',{p_campaign_id:camp3().id,p_map_key:key,p_wall_id:id});
      if(!error){if(data==='locked'){delete TAC10.doorLive[id];TAC10.blkSig='';fx5('doorLocked');toast('🔒 A porta está trancada.');mapDraw7()}return}
      if(noFn10(error))TAC10.noDoorFn=true;else console.warn('[T10] porta',error)}catch(e){console.warn('[T10] porta',e)}
  }
  cast6({t:'req',kind:'door',k:key,id});
}
const noFn10=e=>/PGRST202|42883|404|could not find the function|function .* does not exist/i.test(String(e?.code||'')+' '+String(e?.message||'')+' '+String(e?.status||''));
T3.interact=interact10;T3.doorUse=w=>doorUse10(w,ctlTok10());

/* ---------- luz: interruptores, lâmpadas, queda de energia e lanterna ---------- */
function lampSet10(ids,on,via,ref){
  const key=geoKey10();
  ids.forEach(id=>{TAC10.lampLive[id]={on,until:Date.now()+600000}});
  fx5('switchClick');cast6({t:'lamp',k:key,ids,on});TAC10.vs=null;mapDraw7();
  if(isGM6()){const g=geo10();g.lamps=g.lamps.map(l=>ids.includes(l.id)?{...l,on}:l);geoSet10(g,{undo:false});return}
  if(via==='sw')lightSave10({kind:'switch',key,ref,on,req:{kind:'sw',k:key,id:ref,on}});
}
function swUse10(q,t){
  const ls=swLamps10(geo10(),q);
  if(!ls.length){fx5('switchClick');toast('Este interruptor não está ligado a nenhuma lâmpada.');return}
  const on=!ls.some(lampBase10);lampSet10(ls.map(l=>l.id),on,'sw',q.id);
  toast(on?'💡 Luz acesa.':'💡 Luz apagada.');
}
/* grava: função do banco (se existir) ou o aparelho do Mestre */
async function lightSave10({kind,key,ref,on,req}){
  if(M6.backend==='store'&&!TAC10.noLightFn&&typeof sb()?.rpc==='function'){
    try{const {data,error}=await sb().rpc('set_campaign_light',{p_campaign_id:camp3().id,p_kind:kind,p_map_key:key||'',p_ref:ref,p_on:on});
      if(!error&&(data==='on'||data==='off'))return;
      if(error){if(noFn10(error))TAC10.noLightFn=true;else console.warn('[T10] luz',error)}}catch(e){console.warn('[T10] luz',e)}
  }
  cast6({t:'req',...req});
}
function torchToggle10(t){
  t=t||ctlTok10();
  if(!t){toast(isGM6()?'Selecione um token para ligar a lanterna.':'Você não tem um token neste mapa.');return}
  const ch=charById(t.charId);
  if(!hasLight10(ch)){toast('Sem lanterna no inventário. Coloque uma Lanterna (ou Tocha, Lampião, Vela…) na mochila.');return}
  const on=!torchOn10(t);
  TAC10.ltLive[t.id]={on,until:Date.now()+600000};TAC10.vs=null;
  fx5('torchClick');cast6({t:'lt',id:t.id,on});
  if(isGM6())setState6({tokens:(M6.state.tokens||[]).map(q=>q.id===t.id?{...q,lt:on}:q)});
  else lightSave10({kind:'torch',key:geoKey10(),ref:t.id,on,req:{kind:'lt',id:t.id,on}});
  toast(on?'🔦 Lanterna ligada.':'🔦 Lanterna desligada.');mapTools7();actButton10();mapDraw7();
}
T3.torch=torchToggle10;T3.sw=swUse10;
/* queda de energia: as luzes piscam por ~1,4 s e depois ficam apagadas para todos */
function powerFx10(){
  TAC10.flick={until:Date.now()+FLICK_MS10};fx5('power');mapDraw7();
  setTimeout(()=>{geo10().lamps.forEach(l=>{TAC10.lampLive[l.id]={on:false,until:Date.now()+600000}});TAC10.vs=null;mapDraw7()},FLICK_MS10+10);
}
function blackout10(){
  if(!isGM6())return;const g=geo10();
  if(!g.lamps.some(lampBase10)){toast('Nenhuma lâmpada acesa neste mapa.');return}
  cast6({t:'power',k:geoKey10()});powerFx10();
  setTimeout(()=>{const g2=geo10();g2.lamps=g2.lamps.map(l=>({...l,on:false}));geoSet10(g2,{undo:false})},FLICK_MS10+60);
  toast('⚡ Queda de energia: as luzes piscam e apagam.');
}
T3.blackout=blackout10;

/* ---------- movimento direto (WASD, setas, analógico) ---------- */
const MOV10={id:null,st:null,keys:new Set(),joy:null,raf:0,last:0,lastCast:0,dirtyAt:0,dirty:false,eDown:0,aim:null,commitT:null,lastCommit:null};
T3.mov=MOV10;
const DIRK10={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
function moveWanted10(){return[...MOV10.keys].some(k=>DIRK10[k])||(MOV10.joy&&hyp10(MOV10.joy.x,MOV10.joy.y)>.08)||MOV10.keys.has('KeyQ')||(MOV10.keys.has('KeyE')&&Date.now()-MOV10.eDown>180)}
function moveKick10(){if(!MOV10.raf){MOV10.last=performance.now();MOV10.raf=requestAnimationFrame(moveTick10)}}
function moveTick10(now){
  MOV10.raf=0;const dt=Math.min(.05,Math.max(0,(now-MOV10.last)/1000));MOV10.last=now;
  const t=ctlTok10();
  if(!t||!canMove7(t)){MOV10.id=null;MOV10.st=null;return}
  if(MAP7.drag&&MAP7.drag.id===t.id){MOV10.aim=null;return} /* arrastando com o mouse: o arrasto manda */
  if(MOV10.id!==t.id||!MOV10.st){
    /* parte da posição verdadeira (a última que chegou ou a gravada), nunca da que ainda está deslizando na tela */
    const l=MAP7.live[t.id],fresh=l&&l.until>Date.now(),bx=fresh?l.x:t.x,by=fresh?l.y:t.y,ba=fresh&&l.a!=null?l.a:(t.a!=null?t.a:Math.PI/2);
    MOV10.id=t.id;MOV10.st={x:bx,y:by,a:ba};TAC10.disp[t.id]={x:bx,y:by,a:ba,tx:bx,ty:by,ta:ba};
  }
  const st=MOV10.st,g=mapCfg7();let changed=false;
  let vx=0,vy=0;MOV10.keys.forEach(k=>{const d=DIRK10[k];if(d){vx+=d[0];vy+=d[1]}});
  let joy=false;if(MOV10.joy){vx+=MOV10.joy.x;vy+=MOV10.joy.y;joy=hyp10(MOV10.joy.x,MOV10.joy.y)>.08}
  const mag=hyp10(vx,vy);if(mag>1){vx/=mag;vy/=mag}
  let rot=0;if(MOV10.keys.has('KeyQ'))rot-=1;if(MOV10.keys.has('KeyE')&&Date.now()-MOV10.eDown>180)rot+=1;
  if(rot){st.a=normAng10(st.a+rot*ROT10*dt);changed=true}
  if(mag>.08){
    const run=MOV10.keys.has('ShiftLeft')||MOV10.keys.has('ShiftRight'),sp=SPEED10*(run?1.8:1)*g.cell*Math.min(1,mag);
    const s=t.s||1,cx=g.ox+(st.x+s/2)*g.cell,cy=g.oy+(st.y+s/2)*g.cell;
    let [nx,ny]=collide10(cx,cy,cx+vx*sp*dt,cy+vy*sp*dt,tokR10(t),blockers10());
    if(T3.cbMove)[nx,ny]=T3.cbMove(t,cx,cy,nx,ny,'key');
    if(Math.abs(nx-cx)+Math.abs(ny-cy)>1e-4){st.x=(nx-g.ox)/g.cell-s/2;st.y=(ny-g.oy)/g.cell-s/2;changed=true}
    if(!rot&&MOV10.aim==null){const want=Math.atan2(vy,vx),d=angDiff10(want,st.a);st.a=normAng10(st.a+d*Math.min(1,dt*14));changed=true}
  }
  if(MOV10.aim!=null&&!rot){const [cx,cy]=tokCenter10(t,st),want=Math.atan2(MOV10.aim[1]-cy,MOV10.aim[0]-cx);if(Math.abs(angDiff10(want,st.a))>.004){st.a=normAng10(want);changed=true}MOV10.aim=MOV10.aimHold?MOV10.aim:null}
  if(changed){
    MAP7.live[t.id]={x:st.x,y:st.y,a:st.a,until:Date.now()+60000};MOV10.dirty=true;MOV10.dirtyAt=Date.now();
    const n=Date.now();if(n-MOV10.lastCast>80){MOV10.lastCast=n;cast6({t:'tok',id:t.id,x:+st.x.toFixed(3),y:+st.y.toFixed(3),a:+st.a.toFixed(3)})}
    if(TAC10.follow&&mag>.08)keepInView10(t);
    actButton10();mapDraw7();
  }
  if(moveWanted10()){MOV10.raf=requestAnimationFrame(moveTick10);return}
  if(MOV10.dirty){clearTimeout(MOV10.commitT);MOV10.commitT=setTimeout(moveCommit10,300)}
}
function moveCommit10(){
  if(!MOV10.dirty||!MOV10.st||!MOV10.id)return;if(moveWanted10())return;
  const st=MOV10.st,id=MOV10.id,lc=MOV10.lastCommit;MOV10.dirty=false;
  cast6({t:'tok',id,x:+st.x.toFixed(3),y:+st.y.toFixed(3),a:+st.a.toFixed(3)});
  /* só grava se mudou de verdade (girar o mouse um pouquinho não precisa ir ao banco) */
  if(lc&&lc.id===id&&Math.abs(lc.x-st.x)<.01&&Math.abs(lc.y-st.y)<.01&&Math.abs(angDiff10(lc.a,st.a))<.06)return;
  MOV10.lastCommit={id,x:st.x,y:st.y,a:st.a};
  mapCommitMove7(id,st.x,st.y,st.a);
  setTimeout(()=>{if(!MOV10.dirty&&!moveWanted10()&&MOV10.id===id){MOV10.id=null;MOV10.st=null}},1200);
}
/* mantém o próprio token dentro da tela (câmera particular) */
function keepInView10(t){
  const v=mapView7(),[cx,cy]=tokCenter10(t),[sx,sy]=w2s7(v,cx,cy),mx=v.cw*.22,my=v.ch*.22;let dx=0,dy=0;
  if(sx<mx)dx=sx-mx;else if(sx>v.cw-mx)dx=sx-(v.cw-mx);if(sy<my)dy=sy-my;else if(sy>v.ch-my)dy=sy-(v.ch-my);
  if(dx||dy)mapCam7({...MAP7.cam,x:MAP7.cam.x+dx/(v.s*v.W),y:MAP7.cam.y+dy/(v.s*v.H)});
}
/* teclado: só quando o mapa foi tocado por último e não há campo de texto em foco */
function keyOk10(e){
  const el=e.target;if(el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))return false;
  if(!TAC10.armed||!MAP7.cv||!MAP7.cv.isConnected)return false;
  if($('modalWrap')?.classList.contains('open'))return false;
  const r=MAP7.stage.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0;
}
document.addEventListener('pointerdown',e=>{const st=MAP7.stage;TAC10.armed=!!(st&&st.contains(e.target))},true);
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey){if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'&&isGM6()&&MAP7.tool==='edit'&&keyOk10(e)){e.preventDefault();geoUndo10()}return}
  if(!keyOk10(e))return;
  const c=e.code;
  if(c==='Escape'){if(TAC10.placing){TAC10.placing=null;MAP7.tool='move';mapTools7()}TAC10.chain=null;TAC10.poly=null;TAC10.doorA=null;mapDraw7();return}
  if(c==='Enter'&&isGM6()&&MAP7.tool==='edit'){e.preventDefault();if(TAC10.edit==='room')polyClose10();else chainEnd10();return}
  if(c==='KeyL'&&isGM6()){MOV10.laserKey=true;return}
  if(c==='KeyF'){e.preventDefault();if(!e.repeat)torchToggle10();return}
  if(c==='Space'){e.preventDefault();if(!e.repeat)interact10();return}
  if(DIRK10[c]||c==='KeyQ'||c==='KeyE'||c==='ShiftLeft'||c==='ShiftRight'){
    if(!ctlTok10()){if(DIRK10[c]&&!e.repeat)toast(isGM6()?'Selecione um token para movê-lo pelo teclado.':'Você não tem um token neste mapa.');return}
    e.preventDefault();if(c==='KeyE'&&!MOV10.keys.has('KeyE'))MOV10.eDown=Date.now();
    if(!TAC10.hintSeen&&DIRK10[c]){TAC10.hintSeen=true;lsSet6('tulpa_tac_hint',1);setTimeout(actButton10,2500)}
    MOV10.keys.add(c);if(isGM6()&&DIRK10[c])MOV10.aimHold=false;moveKick10();
  }
});
document.addEventListener('keyup',e=>{
  const c=e.code;if(c==='KeyL')MOV10.laserKey=false;
  if(c==='KeyE'&&MOV10.keys.has('KeyE')&&Date.now()-MOV10.eDown<=180){MOV10.keys.delete('KeyE');interact10();return}
  if(MOV10.keys.delete(c))moveKick10();
});
window.addEventListener('blur',()=>{MOV10.keys.clear();MOV10.joy=null;MOV10.laserKey=false;moveKick10()});

/* ---------- analógico e botão de interagir (toque) ---------- */
function mountUi10(st){
  if(!st||$('tacJoy'))return;
  st.insertAdjacentHTML('beforeend',`<div class="tac-joy" id="tacJoy" hidden aria-label="Analógico: arraste para andar"><div class="tac-knob" id="tacKnob"></div></div><button type="button" class="tac-act" id="tacAct" hidden>✋ Interagir</button><div class="tac-hint" id="tacHint" hidden></div>`);
  const j=$('tacJoy'),k=$('tacKnob');let pid=null;
  const upd=e=>{const r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.38;let dx=e.clientX-cx,dy=e.clientY-cy;const d=hyp10(dx,dy);if(d>max){dx*=max/d;dy*=max/d}k.style.transform=`translate(${dx}px,${dy}px)`;MOV10.joy={x:dx/max,y:dy/max};moveKick10()};
  j.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;try{j.setPointerCapture(pid)}catch(x){}TAC10.armed=true;if(!ctlTok10()){toast('Você não tem um token neste mapa.');return}upd(e)});
  j.addEventListener('pointermove',e=>{if(e.pointerId===pid)upd(e)});
  const end=e=>{if(e.pointerId!==pid)return;pid=null;k.style.transform='';MOV10.joy=null;moveKick10()};
  j.addEventListener('pointerup',end);j.addEventListener('pointercancel',end);
  $('tacAct').onclick=()=>{TAC10.armed=true;interact10()};
}
const touchUi10=()=>document.body.classList.contains('t3-mobile')||!!window.matchMedia?.('(pointer:coarse)').matches;
function actButton10(){
  const b=$('tacAct'),j=$('tacJoy'),h=$('tacHint');if(!b)return;
  if(MAP7.cv)MAP7.cv.style.cursor=TAC10.placing||MAP7.tool==='edit'||MAP7.tool==='laser'?'crosshair':MAP7.tool==='ruler'?'cell':'';
  const t=ctlTok10(),touch=touchUi10(),near=t&&canMove7(t)?reach10(t):null;
  if(j)j.hidden=!(touch&&t&&canMove7(t));if(MAP7.stage)MAP7.stage.classList.toggle('has-joy',!!(j&&!j.hidden));
  b.hidden=!(t&&(touch||near));b.classList.toggle('ready',!!near);b.disabled=!near;
  b.textContent=near?(near.kind==='sw'?(swLamps10(geo10(),near.obj).some(lampBase10)?'💡 Apagar a luz':'💡 Acender a luz'):(near.obj.door.locked&&!isGM6()?'🔒 Tentar abrir':doorOpen10(near.obj)?'✋ Fechar porta':'✋ Abrir porta')):'✋ Interagir';
  if(h){const msg=TAC10.placing?'Clique no local do mapa onde o token deve aparecer (Esc cancela).':(isGM6()&&MAP7.tool==='edit')?editHint10():(!touch&&t&&canMove7(t)&&!TAC10.hintSeen?'WASD ou setas: andar · mouse ou Q/E: virar · Espaço ou toque em E: interagir · F: lanterna · Shift: correr':(t&&canMove7(t)&&geo10().dark&&hasLight10(charById(t.charId))&&!torchOn10(t)?'Está escuro: aperte F (ou o botão 🔦) para ligar a lanterna.':''));h.hidden=!msg;h.textContent=msg}
}
function editHint10(){return{wall:'Parede: clique para marcar pontos; clique duplo (ou Enter) termina a linha. Segure o botão direito para mover o mapa.',door:'Porta: clique numa parede para torná-la porta, ou clique dois pontos para criar uma porta nova.',room:'Cômodo: clique os cantos; clique duplo (ou Enter, ou o primeiro ponto) confirma. Segure o botão direito para mover o mapa.',roomfog:'Névoa do cômodo: clique dentro de um cômodo para revelar ou recolocar a névoa.',rough:'Terreno difícil: clique dentro de um cômodo. Em combate, andar ali custa o dobro (9 m viram 4,5 m).',lamp:'Lâmpada: clique dentro de um cômodo para colocar; clique numa lâmpada para ligar ou apagar.',sw:'Interruptor: clique perto de uma parede do cômodo. Ele liga e apaga as lâmpadas daquele cômodo.',erase:'Apagar: clique numa parede, porta, lâmpada, interruptor ou dentro de um cômodo.'}[TAC10.edit]||''}

/* ---------- ponteiro: editor, laser, posicionar token, mirar ---------- */
function tacDown10(e,p){
  const isM=isGM6();TAC10.hover={wx:p.wx,wy:p.wy,sx:p.sx,sy:p.sy};
  if(TAC10.placing&&isM){
    const ch=charById(TAC10.placing),g=mapCfg7(),toks=M6.state.tokens||[];TAC10.placing=null;MAP7.tool='move';
    if(ch){const s=1,x=(p.wx-g.ox)/g.cell-s/2,y=(p.wy-g.oy)/g.cell-s/2,rest=toks.filter(t=>t.charId!==ch.id);setState6({tokens:[...rest,{id:'k'+rid(),charId:ch.id,x:+x.toFixed(3),y:+y.toFixed(3),s,a:Math.PI/2}]});toast(`${nm(ch)} colocado no mapa.`)}
    mapTools7();actButton10();mapDraw7();return true;
  }
  if(isM&&(MAP7.tool==='laser'||MOV10.laserKey)){MAP7.drag={kind:'laser'};laserAt10(p.wx,p.wy,'click');return true}
  if(isM&&MAP7.tool==='edit')return editDown10(e,p);
  if(isM&&MAP7.tool==='move'&&e.button===0){
    const lk=lockHit10(p.wx,p.wy,p.v);
    if(lk){const g=geo10();g.walls=g.walls.map(q=>q.id===lk.id?{...q,door:{...q.door,locked:!q.door.locked}}:q);geoSet10(g);fx5(lk.door.locked?'click':'doorLocked');toast(lk.door.locked?'🔓 Porta destrancada.':'🔒 Porta trancada.');return true}
    const lh=lampHit10(p.wx,p.wy,p.v);if(lh){const on=!lampBase10(lh);lampSet10([lh.id],on,'gm');toast(on?'🔆 Lâmpada ligada.':'🔆 Lâmpada apagada.');return true}
    const sh=swHit10(p.wx,p.wy,p.v);if(sh){swUse10(sh,null);return true}
    if(!mapHit7(p.wx,p.wy)){const w=nearWall10(p.wx,p.wy,p.v,true);if(w){doorUse10(w,null);return true}}
  }
  return false;
}
function tacMove10(e,p){
  TAC10.hover={wx:p.wx,wy:p.wy,sx:p.sx,sy:p.sy};
  const isM=isGM6();
  if(isM&&(MAP7.drag?.kind==='laser'||(MOV10.laserKey&&!MAP7.drag))){laserAt10(p.wx,p.wy,'move');return true}
  if(MAP7.drag?.kind==='laser')return true;
  if(e.pointerType==='mouse'&&!e.buttons&&MAP7.tool==='move'){
    const t=ctlTok10();
    if(t&&canMove7(t)&&(!isM||[...MOV10.keys].some(k=>DIRK10[k]))){MOV10.aim=[p.wx,p.wy];moveKick10()}
  }
  if(TAC10.placing||(isM&&MAP7.tool==='edit'))mapDraw7();
  return false;
}
function tacUp10(e){if(MAP7.drag?.kind==='laser'){MAP7.drag=null;return true}return false}
T3.tacDown=tacDown10;

/* ---------- barra de ferramentas ---------- */
function tacTools10(isM,b){
  const geo=geo10(),ct=ctlTok10(),hasT=!!(ct&&hasLight10(charById(ct.charId))),tOn=hasT&&torchOn10(ct);
  const torch=hasT?b('torch','🔦',tOn?'Lanterna ligada (tecla F desliga)':'Lanterna desligada (tecla F liga)',tOn):'';
  return{main:isM?`${b('laser','🔴','Ponto de destaque para todos (ou segure L)',MAP7.tool==='laser')}${b('edit','✏️','Editar paredes, portas e cômodos',MAP7.tool==='edit')}${b('dark','🌑',geo.dark?'Ambiente escuro: ligado (clique para desligar)':'Ambiente escuro: desligado (clique para ligar)',geo.dark)}${b('power','⚡','Queda de energia: as luzes piscam e apagam',false)}`:'',
    view:`${torch}${b('follow','🎯',TAC10.follow?'Seguir meu token: ligado':'Seguir meu token: desligado',TAC10.follow)}`,
    row:isM&&MAP7.tool==='edit'?editRow10():'',sig:[geo.dark,TAC10.edit,TAC10.snap,TAC10.follow,!!TAC10.placing,hasT,tOn,geo.lamps.length].join()};
}
function editRow10(){
  const m=TAC10.edit,c=(id,l,on,cls='')=>`<button type="button" class="mt-chip ${on?'on':''} ${cls}" data-mt="e:${id}" aria-pressed="${on?'true':'false'}">${l}</button>`;
  return`<div class="mt-row mt-edit">${c('wall','🧱 Parede',m==='wall')}${c('door','🚪 Porta',m==='door')}${c('room','▢ Cômodo',m==='room')}${c('roomfog','🌫 Névoa do cômodo',m==='roomfog')}${c('rough','🪨 Terreno difícil',m==='rough')}${c('lamp','🔆 Lâmpada',m==='lamp')}${c('sw','💡 Interruptor',m==='sw')}${c('erase','✂ Apagar',m==='erase')}<span class="mt-sep"></span>${c('snap','🧲 Ímã '+(TAC10.snap?'ligado':'desligado'),TAC10.snap)}${c('undo','⤺ Desfazer',false)}${c('allon','Ligar todas as luzes',false)}${c('alloff','Apagar todas as luzes',false)}${c('revealall','Revelar cômodos',false)}${c('hideall','Cobrir cômodos',false)}${c('clear','Apagar tudo',false,'danger')}${c('done','✓ Concluir',false)}</div>`;
}
function tacTool10(id){
  const isM=isGM6();
  if(id==='follow'){TAC10.follow=!TAC10.follow;lsSet6('tulpa_follow',TAC10.follow);return true}
  if(id==='torch'){torchToggle10();return true}
  if(!isM)return false;
  if(id==='power'){blackout10();return true}
  if(id==='laser'){MAP7.tool=MAP7.tool==='laser'?'move':'laser';return true}
  if(id==='edit'){MAP7.tool=MAP7.tool==='edit'?'move':'edit';TAC10.chain=null;TAC10.poly=null;TAC10.doorA=null;actButton10();return true}
  if(id==='dark'){const g=geo10();g.dark=!g.dark;geoSet10(g,{undo:false});toast(g.dark?'🌑 Ambiente escuro ligado: só a lanterna (ou o tato) revela o mapa.':'Ambiente claro: os cômodos revelados ficam visíveis.');return true}
  if(id.startsWith('e:')){
    const k=id.slice(2),g=geo10();
    if(['wall','door','room','roomfog','rough','lamp','sw','erase'].includes(k)){if(TAC10.edit==='room'&&k!=='room'&&TAC10.poly)polyClose10();TAC10.edit=k;TAC10.chain=null;TAC10.doorA=null;if(k!=='room')TAC10.poly=null}
    else if(k==='snap')TAC10.snap=!TAC10.snap;
    else if(k==='undo')geoUndo10();
    else if(k==='allon'||k==='alloff'){const on=k==='allon',ids=g.lamps.map(l=>l.id);if(!ids.length)toast('Nenhuma lâmpada neste mapa.');else lampSet10(ids,on,'gm')}
    else if(k==='revealall'){g.rooms=g.rooms.map(r=>({...r,open:true}));geoSet10(g)}
    else if(k==='hideall'){g.rooms=g.rooms.map(r=>({...r,open:false,reset:r.reset+1}));geoSet10(g)}
    else if(k==='clear'){if(confirm('Apagar todas as paredes, portas, cômodos, lâmpadas e interruptores deste mapa?')){geoSet10({walls:[],rooms:[],dark:g.dark})}}
    else if(k==='done'){if(TAC10.poly)polyClose10();MAP7.tool='move';TAC10.chain=null}
    actButton10();return true;
  }
  return false;
}
function moveCancel10(id){if(!id||MOV10.id===id){MOV10.id=null;MOV10.st=null;MOV10.aim=null;MOV10.dirty=false;clearTimeout(MOV10.commitT)}}
function placeStart10(charId){if(!isGM6())return;TAC10.placing=charId;MAP7.tool='place';closeModal();mapTools7();actButton10();mapDraw7();toast('Clique no local do mapa onde o token deve aparecer.')}
T3.placeToken=placeStart10;

/* névoa dos cômodos: sobe para 1 quando o jogador sai, desce para 0 quando entra (≈200 ms) */
function stepFog10(vs,dt){
  if(vs.mode!=='rooms')return false;
  const FA=TAC10.fogA,fogged=new Set(vs.fog.map(r=>r.id));let anim=false;
  vs.geo.rooms.forEach(r=>{
    if(r.open){delete FA[r.id];return}
    const tgt=fogged.has(r.id)?1:0;if(FA[r.id]==null){FA[r.id]=tgt;return}
    const d=tgt-FA[r.id];if(Math.abs(d)<.001){FA[r.id]=tgt;return}
    FA[r.id]+=Math.sign(d)*Math.min(Math.abs(d),dt/FADE_S10);anim=true;
  });
  return anim;
}
/* ---------- quadro: atualiza animações (lerp, laser, névoa) ---------- */
function tacFrame10(){
  const now=performance.now(),dt=TAC10.frameAt?Math.min(.1,(now-TAC10.frameAt)/1000):0;TAC10.frameAt=now;
  let again=stepDisp10(dt);
  if(TAC10.laser.pts.length||TAC10.laser.rip.length)again=true;
  TAC10.vs=null;
  if(TAC10.flick){if(Date.now()<TAC10.flick.until)again=true;else TAC10.flick=null}
  if(!isGM6()&&stepFog10(view10(),dt))again=true;
  return again;
}

/* ---------- rede ---------- */
onCast6(p=>{
  if(p.t==='ping'&&p.from===gmUid7()&&isFinite(p.x)&&isFinite(p.y)){if(p.from!==uid3())laserGot10(Number(p.x),Number(p.y),p.k)}
  if(p.t==='door'&&p.k===geoKey10()&&p.id){const w=geo10().walls.find(q=>q.id===p.id&&q.door);if(!w)return;TAC10.doorLive[p.id]={open:!!p.open,until:Date.now()+8000};TAC10.blkSig='';if(p.from!==uid3()&&!p.q)fx5(p.open?'doorOpen':'doorClose');mapDraw7()}
  if(p.t==='lamp'&&p.k===geoKey10()&&Array.isArray(p.ids)){p.ids.slice(0,80).forEach(id=>{TAC10.lampLive[String(id)]={on:!!p.on,until:Date.now()+600000}});if(p.from!==uid3())fx5('switchClick');TAC10.vs=null;mapDraw7()}
  if(p.t==='lt'&&p.id){TAC10.ltLive[String(p.id)]={on:!!p.on,until:Date.now()+600000};TAC10.vs=null;const t=(M6.state.tokens||[]).find(q=>q.id===p.id);if(p.from!==uid3()&&t&&tokVisible10(t))fx5('torchClick');mapTools7();mapDraw7()}
  if(p.t==='power'&&p.from===gmUid7()&&p.k===geoKey10()&&p.from!==uid3())powerFx10();
  if(p.t==='req'&&p.kind==='sw'&&isGM6()&&p.k===geoKey10()){
    const g=geo10(),q=g.sws.find(x=>x.id===p.id);if(!q)return;
    const ids=swLamps10(g,q).map(l=>l.id);g.lamps=g.lamps.map(l=>ids.includes(l.id)?{...l,on:!!p.on}:l);geoSet10(g,{undo:false});
  }
  if(p.t==='req'&&p.kind==='lt'&&isGM6()){
    const t=(M6.state.tokens||[]).find(q=>q.id===p.id),ch=t&&charById(t.charId);
    if(!t||!ch||ch.ownerId!==p.from)return; /* só o dono liga a própria lanterna */
    setState6({tokens:(M6.state.tokens||[]).map(q=>q.id===t.id?{...q,lt:!!p.on}:q)});
  }
  if(p.t==='doorlk'&&p.k===geoKey10()&&p.from!==uid3()){fx5('doorLocked');if(isGM6())toast('🔒 '+(String(p.who||'Alguém').slice(0,40))+' tentou abrir uma porta trancada.')}
  if(p.t==='req'&&p.kind==='door'&&isGM6()&&p.k===geoKey10()){
    const g=geo10(),w=g.walls.find(q=>q.id===p.id&&q.door);if(!w||w.door.locked)return;
    const live=TAC10.doorLive[w.id],open=live&&live.until>Date.now()?live.open:!w.door.open;
    g.walls=g.walls.map(q=>q.id===w.id?{...q,door:{...q.door,open}}:q);geoSet10(g,{undo:false});
  }
});
onState6(()=>{
  /* posição gravada mudou (alguém confirmou ou o Mestre reposicionou): o aviso ao vivo antigo deixa de valer */
  const prev=TAC10.lastToks||{},next={};
  (M6.state.tokens||[]).forEach(t=>{const k=t.x+','+t.y+','+t.a;next[t.id]=k;
    if(prev[t.id]!==undefined&&prev[t.id]!==k&&!(MAP7.drag&&MAP7.drag.id===t.id)&&!(MOV10.id===t.id&&(MOV10.dirty||moveWanted10()))){
      const l=MAP7.live[t.id];if(l&&(Math.abs(l.x-t.x)>.02||Math.abs(l.y-t.y)>.02))delete MAP7.live[t.id];
      if(MOV10.id===t.id){MOV10.id=null;MOV10.st=null}}});
  TAC10.lastToks=next;TAC10.vs=null;
  /* o banco confirmou: tira o aviso ao vivo das portas que já batem com o estado gravado */
  const g=geo10();for(const id in TAC10.doorLive){const w=g.walls.find(q=>q.id===id);if(!w||!!w.door?.open===TAC10.doorLive[id].open)delete TAC10.doorLive[id]}
  const lampIds=new Set(g.lamps.map(l=>l.id));
  for(const id in TAC10.lampLive){const l=g.lamps.find(q=>q.id===id);if(!l||!!l.on===TAC10.lampLive[id].on)delete TAC10.lampLive[id]}
  for(const id in TAC10.ltLive){const t=(M6.state.tokens||[]).find(q=>q.id===id);if(!t||!!t.lt===TAC10.ltLive[id].on)delete TAC10.ltLive[id]}
  TAC10.blkSig='';actButton10();mapTools7();
});
M6.hooks.leave.push(()=>{TAC10.disp={};TAC10.doorLive={};TAC10.undo=[];TAC10.chain=null;TAC10.poly=null;TAC10.placing=null;TAC10.lampLive={};TAC10.ltLive={};TAC10.fogA={};TAC10.flick=null;MOV10.id=null;MOV10.st=null;MOV10.keys.clear()});
try{const f=lsGet6('tulpa_follow',null);if(f===false)TAC10.follow=false;TAC10.hintSeen=!!lsGet6('tulpa_tac_hint',0)}catch(e){}
/* o inventário pode mudar fora do mapa (ganhou ou perdeu a lanterna): confere a barra e o botão de vez em quando */
setInterval(()=>{try{if(MAP7.cv&&MAP7.cv.isConnected&&!document.hidden){mapTools7();actButton10()}}catch(e){}},1200);
/* o tema mudou: redesenha o mapa com as cores novas */
try{new MutationObserver(()=>mapDraw7()).observe(document.body,{attributes:true,attributeFilter:['class','data-pal','style']})}catch(e){}


