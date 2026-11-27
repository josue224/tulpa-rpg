/* ===================================================================
   TULPA · 🎨 MOTOR GRÁFICO DO ARCADE (GFX60)
   -------------------------------------------------------------------
   Camada SOMENTE VISUAL compartilhada pelos jogos do Tulpa Arcade.
   Não altera regras, física, pontuação, dificuldade, apostas, rede,
   defineArcadeGame nem C.finish. Documentação: ARQUITETURA.md,
   seção "Motor gráfico do Arcade (GFX60)".
   - Sprites e tilesets procedurais em canvas offscreen, com cache LRU.
   - Loader opcional de assets/arcade/ (só pede o que estiver no
     manifesto, que começa vazio; sempre há reserva procedural).
   - Paralaxe, ambiente, glow, luzes, sombras de contato e vinheta.
   - Partículas novas por cima do FX20 e hit-stop apenas visual.
   - Moldura de HUD (canvas e DOM), legível em 390 px.
   Carregado pela QUEUE do js/60d, antes de todos os jogos.
   IIFE: o único nome global é window.GFX60.
   =================================================================== */
(function(){
  if(window.GFX60)return;
  const G={ver:1};
  const TAU=Math.PI*2,FONT='"IBM Plex Sans",system-ui,sans-serif';
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const mod=(v,m)=>((v%m)+m)%m;
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
  const rr=(x,X,Y,w,h,r)=>{x.beginPath();r=Math.max(0,Math.min(r,w/2,h/2));if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h)};

  /* ===================== preferências e desempenho ===================== */
  const mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  /* force.reduced / force.low: true|false para testes; null = automático */
  G.force={reduced:null,low:null};
  const PERF={low:false,last:0,sum:0,n:0,bad:0,good:0};
  G.reduced=()=>G.force.reduced??!!(mq&&mq.matches);
  G.low=()=>G.force.low??PERF.low;
  function sample(now){
    const d=now-PERF.last;PERF.last=now;
    if(!(d>0&&d<100))return;
    PERF.sum+=d;if(++PERF.n<90)return;
    const avg=PERF.sum/PERF.n;PERF.sum=0;PERF.n=0;
    if(avg>22){PERF.good=0;if(++PERF.bad>=2)PERF.low=true}
    else if(avg<18){PERF.bad=0;if(++PERF.good>=3)PERF.low=false}
  }

  /* ===================== cor ===================== */
  const COLS=new Map();let pc=null;
  function rgb(col){
    let v=COLS.get(col);if(v)return v;
    let s=String(col);
    if(!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)){
      pc=pc||mk(1,1).getContext('2d');pc.fillStyle='#000';pc.fillStyle=s;s=String(pc.fillStyle);
    }
    if(s[0]==='#'){const h=s.length===4?s.slice(1).replace(/./g,'$&$&'):s.slice(1,7);v=[0,2,4].map(i=>parseInt(h.substr(i,2),16))}
    else v=(s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
    if(COLS.size>600)COLS.clear();
    COLS.set(col,v);return v;
  }
  const hex=v=>'#'+v.map(n=>clamp(Math.round(n),0,255).toString(16).padStart(2,'0')).join('');
  G.rgba=(col,a=1)=>{const v=rgb(col);return`rgba(${v[0]},${v[1]},${v[2]},${a})`};
  G.mix=(a,b,k)=>{const p=rgb(a),q=rgb(b);return hex(p.map((n,i)=>n+(q[i]-n)*k))};
  /* k>0 clareia, k<0 escurece */
  G.shade=(col,k)=>G.mix(col,k>0?'#ffffff':'#000000',Math.min(1,Math.abs(k)));
  G.pal={fe:'#ffd36b',natureza:'#7dffa8',inexistencia:'#b9a6ff',ilusao:'#ff9be0',verdade:'#7fe3ff',
    ink:'#f4ead6',bg:'#120d18',acc:'#ffd36b',perigo:'#ff5b6b'};

  /* ===================== cache offscreen ===================== */
  /* PRNG próprio: a arte nunca consome a semente nem o RNG dos jogos */
  G.rng=seed=>{let a=(seed>>>0)||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0};
  const CACHE=new Map(),MAXPX=16e6;let px=0,uid=0;
  const idOf=c=>c.g60id||(c.g60id=++uid);
  /* bake(chave,w,h,paint(ctx,w,h,rnd),{s}) -> canvas pintado uma única vez.
     w/h são lógicos (guardados em .lw/.lh); s = densidade do bitmap. */
  function bake(key,w,h,paint,{s=1}={}){
    let c=CACHE.get(key);
    if(c){CACHE.delete(key);CACHE.set(key,c);return c}
    c=mk(w*s,h*s);c.lw=w;c.lh=h;c.gs=s;
    const x=c.getContext('2d');x.scale(s,s);
    try{paint(x,w,h,G.rng(hash(key)))}catch(e){console.warn('[GFX60] arte '+key,e)}
    CACHE.set(key,c);px+=c.width*c.height;
    for(const[k,v]of CACHE){if(px<=MAXPX||k===key)break;CACHE.delete(k);px-=v.width*v.height}
    return c;
  }
  G.bake=bake;
  G.clear=prefix=>{for(const[k,v]of CACHE)if(!prefix||k.startsWith(prefix)){CACHE.delete(k);px-=v.width*v.height}};
  G.stats=()=>({sprites:CACHE.size,pixels:px,low:G.low(),reduced:G.reduced()});

  /* ===================== sprites ===================== */
  /* draw(x,img,cx,cy,{w,h,rot,flip,alpha,sx,sy,ax,ay,add}) — âncora padrão no centro */
  G.draw=(x,img,cx,cy,{w,h,rot=0,flip=false,alpha=1,sx=1,sy=1,ax=.5,ay=.5,add=false}={})=>{
    if(!img||alpha<=0)return;
    const lw=img.lw||img.width,lh=img.lh||img.height;
    const W=w??(h!=null?h*lw/lh:lw),H=h??(w!=null?w*lh/lw:lh);
    if(!rot&&!flip&&alpha===1&&sx===1&&sy===1&&!add){x.drawImage(img,cx-W*ax,cy-H*ay,W,H);return}
    x.save();x.globalAlpha*=Math.min(1,alpha);if(add)x.globalCompositeOperation='lighter';
    x.translate(cx,cy);if(rot)x.rotate(rot);x.scale(flip?-sx:sx,sy);
    x.drawImage(img,-W*ax,-H*ay,W,H);x.restore();
  };
  /* quadros de animação pré-pintados */
  G.sheet=(key,n,w,h,paint,{s=2}={})=>{const out=[];for(let i=0;i<n;i++)out.push(bake(`sh:${key}:${i}`,w,h,(x,W,H,r)=>paint(x,i,n,r,W,H),{s}));return out};
  G.anim=(frames,t,fps=8,loop=true)=>{const i=Math.floor(Math.max(0,t)*(G.reduced()&&loop?0:fps));return frames[loop?i%frames.length:Math.min(frames.length-1,i)]};
  /* pixel art a partir de linhas de texto; '.' ou ' ' = transparente */
  G.pix=(key,rows,pal,{p=4}={})=>{const cols=Math.max(...rows.map(r=>r.length));
    return bake('pix:'+key,cols*p,rows.length*p,x=>{rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){x.fillStyle=c;x.fillRect(i*p,j*p,p,p)}}})})};
  /* silhueta tingida (clarão de dano) sem usar ctx.filter */
  G.tint=(img,col='#fff',a=1)=>{if(!img)return null;const w=img.lw||img.width,h=img.lh||img.height,s=img.gs||1;
    return bake(`tint:${idOf(img)}:${col}:${a}`,w,h,x=>{x.drawImage(img,0,0,w,h);x.globalCompositeOperation='source-atop';x.globalAlpha=a;x.fillStyle=col;x.fillRect(0,0,w,h)},{s})};

  /* ===================== peças prontas ===================== */
  const poly=(x,pts)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath()};
  const fillPoly=(x,pts,col)=>{poly(x,pts);x.fillStyle=col;x.fill()};
  const vgrad=(x,y0,y1,stops)=>{const g=x.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>g.addColorStop(stops.length>1?i/(stops.length-1):0,c));return g};
  G.prop={
    /* esfera com brilho */
    orb:(col,r=16)=>bake(`orb:${col}:${r}`,r*2+4,r*2+4,x=>{const c=r+2,g=x.createRadialGradient(c-r*.35,c-r*.4,r*.1,c,c,r);
      g.addColorStop(0,G.shade(col,.75));g.addColorStop(.45,col);g.addColorStop(1,G.shade(col,-.55));x.fillStyle=g;x.beginPath();x.arc(c,c,r,0,TAU);x.fill();
      x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(c-r*.34,c-r*.42,r*.22,r*.13,-.6,0,TAU);x.fill()},{s:2}),
    /* bloco: 'chanfro' | 'pedra' | 'vidro' */
    block:(col,sz=32,style='chanfro')=>bake(`blk:${col}:${sz}:${style}`,sz,sz,(x,w,h,r)=>{
      const b=Math.max(2,sz*.15),rad=sz*(style==='pedra'?.08:.18);
      rr(x,.5,.5,w-1,h-1,rad);x.save();x.clip();
      x.fillStyle=style==='vidro'?G.rgba(col,.55):col;x.fillRect(0,0,w,h);
      fillPoly(x,[[0,0],[w,0],[w-b,b],[b,b]],'rgba(255,255,255,.42)');
      fillPoly(x,[[0,0],[b,b],[b,h-b],[0,h]],'rgba(255,255,255,.18)');
      fillPoly(x,[[w,0],[w,h],[w-b,h-b],[w-b,b]],'rgba(0,0,0,.2)');
      fillPoly(x,[[0,h],[b,h-b],[w-b,h-b],[w,h]],'rgba(0,0,0,.38)');
      x.fillStyle=vgrad(x,b,h-b,['rgba(255,255,255,.16)','rgba(0,0,0,.14)']);x.fillRect(b,b,w-b*2,h-b*2);
      if(style==='pedra')for(let i=0;i<sz*.9;i++){x.fillStyle=r()<.5?'rgba(0,0,0,.18)':'rgba(255,255,255,.12)';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*1.4)}
      if(style==='vidro')fillPoly(x,[[w*.2,b],[w*.45,b],[b,h*.5],[b,h*.25]],'rgba(255,255,255,.28)');
      x.restore();rr(x,.5,.5,w-1,h-1,rad);x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1;x.stroke()},{s:2}),
    /* gema facetada */
    gem:(col,sz=32,n=6)=>bake(`gem:${col}:${sz}:${n}`,sz,sz,x=>{const c=sz/2,R=sz*.48,r=R*.55;
      const pt=(i,k)=>{const a=-Math.PI/2+i*TAU/n;return[c+Math.cos(a)*k,c+Math.sin(a)*k]};
      for(let i=0;i<n;i++){const k=Math.cos(-Math.PI/2+(i+.5)*TAU/n+2.2);fillPoly(x,[pt(i,R),pt(i+1,R),pt(i+1,r),pt(i,r)],G.shade(col,k*.45))}
      poly(x,Array.from({length:n},(_,i)=>pt(i,r)));x.fillStyle=vgrad(x,c-r,c+r,[G.shade(col,.5),col,G.shade(col,-.2)]);x.fill();
      poly(x,Array.from({length:n},(_,i)=>pt(i,R)));x.strokeStyle=G.shade(col,-.6);x.lineWidth=1.2;x.stroke();
      x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(c-r*.35,c-r*.4,Math.max(1,sz*.05),0,TAU);x.fill()},{s:2}),
    /* cristal pontiagudo, base em y=h */
    crystal:(col,w=24,h=48)=>bake(`cry:${col}:${w}:${h}`,w,h,x=>{
      fillPoly(x,[[0,h],[w*.12,h*.38],[w*.5,0],[w*.5,h]],G.shade(col,.22));
      fillPoly(x,[[w*.5,0],[w*.88,h*.32],[w,h],[w*.5,h]],G.shade(col,-.35));
      fillPoly(x,[[w*.5,0],[w*.66,h*.42],[w*.5,h],[w*.36,h*.45]],col);
      x.strokeStyle=G.shade(col,.65);x.lineWidth=1;x.beginPath();x.moveTo(w*.12,h*.38);x.lineTo(w*.5,0);x.lineTo(w*.5,h*.9);x.stroke()},{s:2}),
    /* óbolo / moeda */
    coin:(r=12,col='#f2c14e')=>bake(`coin:${r}:${col}`,r*2+2,r*2+2,x=>{const c=r+1;
      x.fillStyle=vgrad(x,0,r*2,[G.shade(col,.55),col,G.shade(col,-.45)]);x.beginPath();x.arc(c,c,r,0,TAU);x.fill();
      x.strokeStyle=G.shade(col,-.55);x.lineWidth=1;x.stroke();x.strokeStyle=G.shade(col,.4);x.lineWidth=Math.max(1,r*.12);x.beginPath();x.arc(c,c,r*.68,0,TAU);x.stroke();
      fillPoly(x,[[c,c-r*.42],[c+r*.26,c],[c,c+r*.42],[c-r*.26,c]],G.shade(col,-.3))},{s:2}),
  };

  /* ===================== tilesets (sem emendas) ===================== */
  /* repete o desenho nas bordas para o ladrilho fechar */
  const wrap9=(x,S,fn)=>{for(let i=-1;i<2;i++)for(let j=-1;j<2;j++){x.save();x.translate(i*S,j*S);fn();x.restore()}};
  const specks=(x,S,r,n,cols,max=2)=>{for(let i=0;i<n;i++){const X=r()*S,Y=r()*S,s=.6+r()*max;x.fillStyle=cols[i%cols.length];wrap9(x,S,()=>x.fillRect(X,Y,s,s))}};
  const TILES={
    pedra:{a:'#4a4458',b:'#1d1928',f(x,S,r,a,b){x.fillStyle=b;x.fillRect(0,0,S,S);const n=3,c=S/n;
      for(let j=0;j<n;j++)for(let i=0;i<n;i++){const X=i*c+(j%2)*c*.5+r()*c*.12,Y=j*c+r()*c*.1,w=c*(.82+r()*.14),h=c*(.8+r()*.14),col=G.shade(a,(r()-.5)*.28);
        wrap9(x,S,()=>{rr(x,X,Y,w,h,c*.22);x.fillStyle=col;x.fill();x.fillStyle='rgba(255,255,255,.13)';x.fillRect(X+c*.14,Y+1,w-c*.28,2);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(X+c*.14,Y+h-3,w-c*.28,2)})}
      specks(x,S,r,S,['rgba(0,0,0,.22)','rgba(255,255,255,.08)'])}},
    tijolo:{a:'#8a4638',b:'#2c1a18',f(x,S,r,a,b){x.fillStyle=b;x.fillRect(0,0,S,S);const h=S/4,w=S/2;
      for(let j=0;j<4;j++){const cols=[G.shade(a,(r()-.5)*.25),G.shade(a,(r()-.5)*.25)];
        for(let i=-1;i<3;i++){const X=i*w+(j%2)*w*.5+1,Y=j*h+1;x.fillStyle=cols[mod(i,2)];x.fillRect(X,Y,w-2,h-2);x.fillStyle='rgba(255,255,255,.15)';x.fillRect(X,Y,w-2,1.5);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(X,Y+h-4,w-2,2)}}
      specks(x,S,r,S,['rgba(0,0,0,.2)','rgba(255,220,190,.12)'])}},
    madeira:{a:'#7a5232',b:'#3a2415',f(x,S,r,a,b){const h=S/4;
      for(let j=0;j<4;j++){x.fillStyle=G.shade(a,(r()-.5)*.22);x.fillRect(0,j*h,S,h);
        x.strokeStyle=G.rgba(b,.5);x.lineWidth=1;for(let k=1;k<4;k++){const y=j*h+k*h/4,ph=r()*TAU,am=.6+r()*1.6;x.beginPath();for(let i=0;i<=S;i+=4){const Y=y+Math.sin(i/S*TAU+ph)*am;i?x.lineTo(i,Y):x.moveTo(i,Y)}x.stroke()}
        x.fillStyle=b;x.fillRect(0,j*h,S,1.5);const cut=r()*(S-6);x.fillRect(cut,j*h,2,h);x.fillStyle='rgba(255,230,190,.14)';x.fillRect(0,j*h+1.5,S,1)}}},
    grama:{a:'#2f6b3a',b:'#8fd47a',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);specks(x,S,r,S*2,[G.shade(a,-.25),G.shade(a,.12)],3);
      for(let i=0;i<S*.8;i++){const X=r()*S,Y=r()*S,h=3+r()*6,d=(r()-.5)*4;x.strokeStyle=G.mix(a,b,.3+r()*.7);x.lineWidth=1.1;wrap9(x,S,()=>{x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X,Y-h*.6,X+d,Y-h);x.stroke()})}}},
    terra:{a:'#5a4030',b:'#a88a6a',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);specks(x,S,r,S*3,[G.shade(a,-.3),G.shade(a,.15)],2.4);
      for(let i=0;i<S/8;i++){const X=r()*S,Y=r()*S,R=1.5+r()*3.5,col=G.mix(a,b,.35+r()*.5);wrap9(x,S,()=>{x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(X,Y+1.2,R,R*.7,0,0,TAU);x.fill();x.fillStyle=col;x.beginPath();x.ellipse(X,Y,R,R*.7,0,0,TAU);x.fill()})}}},
    areia:{a:'#c9a86a',b:'#8f7040',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);x.lineWidth=2;
      for(let j=0;j<5;j++){const y=(j+.5)*S/5,ph=r()*TAU;[[0,G.rgba(b,.45)],[-2,'rgba(255,245,210,.4)']].forEach(([d,c])=>{x.strokeStyle=c;x.beginPath();for(let i=0;i<=S;i+=3){const Y=y+d+Math.sin(i/S*TAU*2+ph)*2.6;i?x.lineTo(i,Y):x.moveTo(i,Y)}x.stroke()})}
      specks(x,S,r,S*2,[G.rgba(b,.6),'rgba(255,250,225,.55)'],1)}},
    metal:{a:'#566070',b:'#1c222c',f(x,S,r,a,b){const h=S/2;
      for(let j=0;j<2;j++)for(let i=0;i<2;i++){const X=i*h,Y=j*h;x.fillStyle=vgrad(x,Y,Y+h,[G.shade(a,.18),a,G.shade(a,-.22)]);x.fillRect(X,Y,h,h);x.fillStyle=b;x.fillRect(X,Y,h,1.5);x.fillRect(X,Y,1.5,h);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(X+1.5,Y+1.5,h-1.5,1);
        [[5,5],[h-5,5],[5,h-5],[h-5,h-5]].forEach(([u,v])=>{x.fillStyle=b;x.beginPath();x.arc(X+u,Y+v+.8,2,0,TAU);x.fill();x.fillStyle=G.shade(a,.4);x.beginPath();x.arc(X+u,Y+v,1.6,0,TAU);x.fill()})}
      for(let i=0;i<S/2;i++){x.fillStyle=r()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.1)';x.fillRect(r()*S*.8,r()*S,6+r()*S*.2,.7)}}},
    cristal:{a:'#4a3a8a',b:'#b9a6ff',f(x,S,r,a,b){const n=4,c=S/n,P=[];
      for(let j=0;j<n;j++){P[j]=[];for(let i=0;i<n;i++)P[j][i]=[(r()-.5)*c*.6,(r()-.5)*c*.6]}
      const p=(i,j)=>{const o=P[mod(j,n)][mod(i,n)];return[i*c+o[0],j*c+o[1]]};
      x.fillStyle=a;x.fillRect(0,0,S,S);
      for(let j=-1;j<=n;j++)for(let i=-1;i<=n;i++){const k1=G.rng(mod(j,n)*17+mod(i,n)+3)(),k2=G.rng(mod(j,n)*31+mod(i,n)+9)();
        [[[p(i,j),p(i+1,j),p(i,j+1)],k1],[[p(i+1,j),p(i+1,j+1),p(i,j+1)],k2]].forEach(([t,k])=>{fillPoly(x,t,G.mix(a,b,k*.6));x.strokeStyle=G.rgba(b,.4);x.lineWidth=.8;x.stroke()})}}},
    agua:{a:'#14506e',b:'#7fe3ff',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);
      for(let j=0;j<6;j++){const y=(j+.5)*S/6,ph=r()*TAU,k=1+(j%2);x.strokeStyle=G.rgba(b,.14+r()*.22);x.lineWidth=1+r()*1.5;x.beginPath();for(let i=0;i<=S;i+=3){const Y=y+Math.sin(i/S*TAU*k+ph)*3;i?x.lineTo(i,Y):x.moveTo(i,Y)}x.stroke()}
      specks(x,S,r,S/5,[G.rgba(b,.6)],1.4)}},
    feltro:{a:'#1f4a38',b:'#000000',f(x,S,r,a){x.fillStyle=a;x.fillRect(0,0,S,S);specks(x,S,r,S*S/10,[G.shade(a,-.18),G.shade(a,.1),G.shade(a,-.08)],1)}},
    pergaminho:{a:'#e8d9b4',b:'#9a7a48',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);
      for(let i=0;i<7;i++){const X=r()*S,Y=r()*S,R=S*(.12+r()*.22),al=.07+r()*.1;wrap9(x,S,()=>{const g=x.createRadialGradient(X,Y,0,X,Y,R);g.addColorStop(0,G.rgba(b,al));g.addColorStop(1,G.rgba(b,0));x.fillStyle=g;x.fillRect(X-R,Y-R,R*2,R*2)})}
      specks(x,S,r,S*3,[G.rgba(b,.28),'rgba(255,255,255,.3)'],1.2)}},
    runa:{a:'#171024',b:'#8a6cd0',f(x,S,r,a,b){x.fillStyle=a;x.fillRect(0,0,S,S);specks(x,S,r,S,['rgba(0,0,0,.3)','rgba(255,255,255,.05)']);
      x.strokeStyle=G.rgba(b,.26);x.lineWidth=1.2;const h=S/2;
      for(let j=0;j<2;j++)for(let i=0;i<2;i++){const cx=i*h+h/2,cy=j*h+h/2,R=h*.28;x.beginPath();x.arc(cx,cy,R,0,TAU);x.stroke();x.beginPath();let k=Math.floor(r()*6);for(let s=0;s<4;s++){const an=k*TAU/6,X=cx+Math.cos(an)*R,Y=cy+Math.sin(an)*R;s?x.lineTo(X,Y):x.moveTo(X,Y);k+=2+Math.floor(r()*2)}x.stroke()}}},
  };
  G.tiles=Object.keys(TILES);
  /* tile(tipo,{size,a,b,seed}) -> ladrilho em cache */
  G.tile=(kind,{size=64,a,b,seed=1}={})=>{const T=TILES[kind]||TILES.pedra,A=a||T.a,B=b||T.b;
    return bake(`tile:${kind}:${size}:${A}:${B}:${seed}`,size,size,x=>{x.beginPath();x.rect(0,0,size,size);x.clip();T.f(x,size,G.rng(hash(kind)+seed),A,B)},{s:2})};
  /* preenche uma área repetindo o ladrilho; ox/oy = rolagem (câmera) */
  G.fillTile=(x,tile,X,Y,W,H,{ox=0,oy=0,alpha=1}={})=>{
    if(!tile||W<=0||H<=0)return;
    const p=tile.g60pat||(tile.g60pat=x.createPattern(tile,'repeat')),s=tile.gs||1,tw=tile.lw||tile.width,th=tile.lh||tile.height;
    if(p.setTransform)p.setTransform(new DOMMatrix([1/s,0,0,1/s,mod(ox,tw),mod(oy,th)]));
    const a=x.globalAlpha;x.globalAlpha=a*alpha;x.fillStyle=p;x.fillRect(X,Y,W,H);x.globalAlpha=a;
  };

  /* ===================== assets opcionais (assets/arcade/) ===================== */
  let VER='';try{VER=(document.currentScript.src.match(/[?&]v=([^&]+)/)||[])[1]||''}catch(e){}
  /* o manifesto começa vazio: nada é requisitado (sem 404) */
  const MAN={},IMG={};
  function loadOne(n){
    if(!MAN[n])return Promise.resolve(null);
    if(IMG[n])return IMG[n].p;
    const img=new Image(),r=IMG[n]={ok:false,img};
    r.p=new Promise(res=>{img.onload=()=>{r.ok=true;res(img)};img.onerror=()=>res(null);img.src='assets/arcade/'+MAN[n]+(VER?'?v='+VER:'')});
    return r.p;
  }
  G.assets={manifest:MAN,
    add(map){Object.assign(MAN,map);return this},
    load:names=>Promise.all((names||Object.keys(MAN)).map(loadOne)),
    get:n=>IMG[n]&&IMG[n].ok?IMG[n].img:null};
  /* imagem do manifesto se já carregou; senão a reserva procedural */
  G.art=(name,fallback)=>{if(MAN[name]){const r=IMG[name];if(!r)loadOne(name);else if(r.ok)return r.img}return typeof fallback==='function'?fallback():fallback};

  /* ===================== pintores de camada (fecham na horizontal) ===================== */
  const wrapX=(x,w,X,r,fn)=>{fn(X);if(X-r<0)fn(X+w);if(X+r>w)fn(X-w)};
  const softDisc=(x,X,Y,R,col,a)=>{const g=x.createRadialGradient(X,Y,0,X,Y,R);g.addColorStop(0,G.rgba(col,a));g.addColorStop(1,G.rgba(col,0));x.fillStyle=g;x.fillRect(X-R,Y-R,R*2,R*2)};
  G.paint={
    sky:stops=>(x,w,h)=>{x.fillStyle=vgrad(x,0,h,stops);x.fillRect(0,0,w,h)},
    stars:({n=90,col='#ffffff',size=1.6,top=0,bottom=.8}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=r()*(w-4)+2,Y=h*(top+r()*(bottom-top)),s=.5+r()*size;x.fillStyle=G.rgba(col,.25+r()*.7);x.fillRect(X,Y,s,s);if(s>size*.85)softDisc(x,X+s/2,Y+s/2,s*3,col,.28)}},
    ridge:({col='#241a3a',base=.7,amp=.18,k=[1,3,7],edge,fade}={})=>(x,w,h,r)=>{const ph=k.map(()=>r()*TAU),yy=i=>{let v=0,t=0;k.forEach((f,j)=>{const a=1/(j+1);v+=Math.sin(i/w*TAU*f+ph[j])*a;t+=a});return h*(base-v/t*amp)};
      const path=()=>{x.beginPath();x.moveTo(0,yy(0));for(let i=4;i<w;i+=4)x.lineTo(i,yy(i));x.lineTo(w,yy(w))};
      path();x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fillStyle=vgrad(x,h*(base-amp),h,[col,fade||G.shade(col,-.35)]);x.fill();
      if(edge){path();x.strokeStyle=edge;x.lineWidth=1.5;x.stroke()}},
    spires:({col='#1a1230',n=14,min=.15,max=.5,base=1,edge}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=(i+r()*.8)*w/n,H=h*(min+r()*(max-min)),W=w/n*(.4+r()*.7),tip=(r()-.5)*W*.5,Y=h*base;
      wrapX(x,w,X,W,X=>{fillPoly(x,[[X-W/2,Y],[X-W*.18,Y-H*.62],[X+tip,Y-H],[X+W*.24,Y-H*.5],[X+W/2,Y]],col);fillPoly(x,[[X+tip,Y-H],[X+W*.24,Y-H*.5],[X+W/2,Y],[X+W*.08,Y]],'rgba(0,0,0,.28)');
        if(edge){x.strokeStyle=edge;x.lineWidth=1;x.beginPath();x.moveTo(X-W/2,Y);x.lineTo(X-W*.18,Y-H*.62);x.lineTo(X+tip,Y-H);x.stroke()}})}
      if(base<1){x.fillStyle=col;x.fillRect(0,h*base-1,w,h*(1-base)+1)}},
    trees:({col='#0d2a1c',n=16,min=.18,max=.45,base=.92}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=(i+r()*.9)*w/n,H=h*(min+r()*(max-min)),W=H*(.36+r()*.22),Y=h*base;
      wrapX(x,w,X,W,X=>{x.fillStyle=col;x.fillRect(X-W*.06,Y-H*.35,W*.12,H*.35);for(let k=0;k<4;k++){const y=Y-H*.2-k*H*.2,ww=W*(1-k*.2)/2;fillPoly(x,[[X-ww,y],[X,y-H*.34],[X+ww,y]],col);fillPoly(x,[[X,y-H*.34],[X+ww,y],[X,y]],'rgba(0,0,0,.2)')}})}
      x.fillStyle=col;x.fillRect(0,h*base-1,w,h*(1-base)+1)},
    pillars:({col='#0f2a36',n=7,min=.35,max=.7,base=.95,edge}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=(i+.2+r()*.5)*w/n,H=h*(min+r()*(max-min)),W=w/n*(.18+r()*.14),Y=h*base,broke=r()<.3;
      wrapX(x,w,X,W*2,X=>{x.fillStyle=col;x.fillRect(X-W/2,Y-H,W,H);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X+W*.12,Y-H,W*.38,H);x.fillStyle='rgba(255,255,255,.07)';x.fillRect(X-W*.28,Y-H,W*.1,H);
        x.fillStyle=col;x.fillRect(X-W*.75,Y-6,W*1.5,6);if(broke)fillPoly(x,[[X-W/2,Y-H],[X-W*.15,Y-H-W*.4],[X+W*.1,Y-H-W*.05],[X+W/2,Y-H-W*.3],[X+W/2,Y-H]],col);else{x.fillRect(X-W*.72,Y-H-6,W*1.44,6);x.fillRect(X-W*.9,Y-H-11,W*1.8,5)}
        if(edge){x.fillStyle=edge;x.fillRect(X-W/2,Y-H,1.2,H)}})}
      x.fillStyle=col;x.fillRect(0,h*base-1,w,h*(1-base)+1)},
    nebula:({cols=['#6a3fb0','#2f6fb0'],n=8,a=.28,top=.05,bottom=.7}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=r()*w,Y=h*(top+r()*(bottom-top)),R=Math.min(w,h)*(.18+r()*.3),c=cols[i%cols.length];wrapX(x,w,X,R,X=>softDisc(x,X,Y,R,c,a*(.5+r()*.5)))}},
    clouds:({col='#ffffff',n=6,a=.16,top=.08,bottom=.5}={})=>(x,w,h,r)=>{for(let i=0;i<n;i++){const X=r()*w,Y=h*(top+r()*(bottom-top)),R=18+r()*34,parts=[0,1,2,3,4].map(k=>[(k-2)*R*.55,(r()-.5)*R*.35,R*(.45+r()*.4)]);
      wrapX(x,w,X,R*2.4,X=>parts.forEach(([u,v,q])=>softDisc(x,X+u,Y+v,q,col,a)))}},
    fog:({col='#ffffff',a=.22,from=.55}={})=>(x,w,h,r)=>{x.fillStyle=vgrad(x,h*from,h,[G.rgba(col,0),G.rgba(col,a)]);x.fillRect(0,h*from,w,h*(1-from));
      for(let i=0;i<8;i++){const X=r()*w,Y=h*(from+r()*(1-from)),R=40+r()*70;wrapX(x,w,X,R,X=>softDisc(x,X,Y,R,col,a*.4))}},
  };

  /* ===================== paralaxe ===================== */
  /* camada: {paint, w, h, y, speed, vy, drift (px/s), alpha, s}
     speed 0 = parado, 1 = junto com a câmera. */
  G.parallax=(id,W,H,layers)=>{
    const L=layers.map((l,i)=>({speed:0,vy:0,drift:0,alpha:1,y:0,w:Math.round(W),h:Math.round(H),s:1,...l,key:`px:${id}:${W}x${H}:${i}`}));
    return{layers:L,
      /* from/to desenham só parte das camadas (ex.: a névoa por cima dos sprites) */
      draw(x,camX=0,camY=0,t=0,{from=0,to=L.length}={}){
        const red=G.reduced(),k=Math.abs(x.getTransform?x.getTransform().a:1)||1,base=x.globalAlpha;
        for(let i=from;i<to&&i<L.length;i++){const l=L[i],img=bake(l.key,l.w,l.h,l.paint,{s:l.s});
          const sp=red&&l.speed<1?0:l.speed,off=camX*sp+(red?0:l.drift*t),y=l.y-(red?0:camY*l.vy);
          x.globalAlpha=base*l.alpha;
          for(let X=-mod(off,l.w);X<W;X+=l.w){const a=Math.round(X*k)/k,b=Math.round((X+l.w)*k)/k;x.drawImage(img,a,y,b-a,l.h)}}
        x.globalAlpha=base;
      }};
  };
  const SCENES={
    fe:p=>[{paint:p.sky(['#1f1533','#6e3442','#d98f4a'])},{paint:p.clouds({col:'#ffd9a0',n:7,a:.14}),speed:.04,drift:5},{paint:p.ridge({col:'#6b3a46',base:.66,amp:.16}),speed:.14},{paint:p.pillars({col:'#3c2236',n:6,min:.18,max:.42}),speed:.32},{paint:p.ridge({col:'#241322',base:.88,amp:.08,k:[2,5,11]}),speed:.55}],
    natureza:p=>[{paint:p.sky(['#04110d','#103527','#3d7a52'])},{paint:p.stars({n:40,col:'#d9ffe6',bottom:.45}),speed:.03},{paint:p.ridge({col:'#1d4a37',base:.62,amp:.15}),speed:.12},{paint:p.trees({col:'#123424',n:18,min:.18,max:.38,base:.82}),speed:.3},{paint:p.trees({col:'#071a12',n:11,min:.25,max:.5,base:.94}),speed:.55},{paint:p.fog({col:'#a8e8c0',a:.18}),speed:.7,drift:9}],
    inexistencia:p=>[{paint:p.sky(['#030208','#120c26','#2c2150'])},{paint:p.stars({n:110,col:'#d9cfff'}),speed:.03},{paint:p.nebula({cols:['#5a3aa8','#25306a'],n:7,a:.24}),speed:.07,drift:3},{paint:p.spires({col:'#231a40',n:13,min:.18,max:.46}),speed:.22},{paint:p.spires({col:'#0d0919',n:9,min:.1,max:.3,edge:'rgba(185,166,255,.35)'}),speed:.5}],
    ilusao:p=>[{paint:p.sky(['#12071f','#46164e','#a9468a'])},{paint:p.stars({n:70,col:'#ffd6f4'}),speed:.04},{paint:p.nebula({cols:['#ff7ad0','#7a5aff','#4ad0e0'],n:9,a:.2}),speed:.08,drift:6},{paint:p.spires({col:'#5c2266',n:10,min:.2,max:.5,edge:'rgba(255,155,224,.5)'}),speed:.24},{paint:p.ridge({col:'#200a2a',base:.87,amp:.09}),speed:.52}],
    verdade:p=>[{paint:p.sky(['#031019','#0b2e42','#357f92'])},{paint:p.stars({n:60,col:'#d6f6ff',bottom:.5}),speed:.03},{paint:p.pillars({col:'#164658',n:9,min:.3,max:.55,base:.86}),speed:.16},{paint:p.pillars({col:'#08222e',n:5,min:.45,max:.72,edge:'rgba(127,227,255,.3)'}),speed:.4},{paint:p.fog({col:'#bff0ff',a:.16}),speed:.6,drift:7}],
    espaco:p=>[{paint:p.sky(['#02030a','#0a0c22','#161338'])},{paint:p.stars({n:140,size:1.1,bottom:1}),speed:.02},{paint:p.nebula({cols:['#3a4ab8','#8a3a9a','#1f7a8a'],n:10,a:.22,bottom:.95}),speed:.06,drift:2},{paint:p.stars({n:45,size:2.4,bottom:1}),speed:.18,drift:4}],
    cripta:p=>[{paint:p.sky(['#0a0710','#19121f','#2a1c24'])},{paint:p.pillars({col:'#241a2a',n:10,min:.55,max:.75,base:.9}),speed:.12},{paint:p.pillars({col:'#120c16',n:5,min:.7,max:.9,edge:'rgba(255,200,130,.16)'}),speed:.35},{paint:p.fog({col:'#8a7aa0',a:.2}),speed:.5,drift:6}],
  };
  G.scenes=Object.keys(SCENES);
  /* cenário pronto: scene('fe'|'natureza'|'inexistencia'|'ilusao'|'verdade'|'espaco'|'cripta',W,H,{seed}) */
  G.scene=(name,W,H,{seed=1}={})=>{const n=SCENES[name]?name:'inexistencia';return G.parallax(`sc-${n}-${seed}`,W,H,SCENES[n](G.paint))};

  /* paralaxe VERTICAL (escaladas e quedas): cada camada fecha de cima a baixo.
     Mesma forma de camada do parallax; camY cresce quando a câmera sobe. */
  G.vparallax=(id,W,H,layers)=>{
    const L=layers.map((l,i)=>({speed:0,drift:0,alpha:1,w:Math.round(W),h:Math.round(H),s:1,...l,key:`vp:${id}:${W}x${H}:${i}`}));
    return{layers:L,
      draw(x,camY=0,t=0,{from=0,to=L.length}={}){
        const red=G.reduced(),k=Math.abs(x.getTransform?x.getTransform().d:1)||1,base=x.globalAlpha;
        for(let i=from;i<to&&i<L.length;i++){const l=L[i],img=bake(l.key,l.w,l.h,l.paint,{s:l.s});
          const off=(red?0:camY*l.speed+l.drift*t);
          x.globalAlpha=base*l.alpha;
          for(let Y=mod(off,l.h)-l.h;Y<H;Y+=l.h){if(Y+l.h<=0)continue;const a=Math.round(Y*k)/k,b=Math.round((Y+l.h)*k)/k;x.drawImage(img,0,a,l.w,b-a)}}
        x.globalAlpha=base;
      }};
  };
  /* desenha um elemento repetido nas bordas, para a camada fechar. fn não pode sortear. */
  G.wrap=(x,w,h,fn,{vert=false}={})=>{for(let i=-1;i<2;i++){x.save();x.translate(vert?0:i*w,vert?i*h:0);fn();x.restore()}};
  /* polígono preenchido [[x,y],...] */
  G.poly=(x,pts,col)=>fillPoly(x,pts,col);

  /* ===================== luz, sombra e acabamento ===================== */
  const dot=col=>bake('dot:'+col,96,96,x=>{const g=x.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,G.rgba(col,1));g.addColorStop(.22,G.rgba(col,.62));g.addColorStop(.55,G.rgba(col,.2));g.addColorStop(1,G.rgba(col,0));x.fillStyle=g;x.fillRect(0,0,96,96)});
  /* brilho aditivo (substitui shadowBlur). Use cores fixas: cada cor vira 1 sprite. */
  G.glow=(x,cx,cy,r,col='#ffd36b',a=.6,{add=true,sy=1}={})=>{if(a<=0||r<=0)return;const o=x.globalCompositeOperation,ga=x.globalAlpha;
    if(add)x.globalCompositeOperation='lighter';x.globalAlpha=ga*Math.min(1,a);x.drawImage(dot(col),cx-r,cy-r*sy,r*2,r*2*sy);x.globalAlpha=ga;x.globalCompositeOperation=o};
  /* luz ambiente: escurece a cena e abre as luzes (mapa em baixa resolução) */
  G.lights=(W,H,{dark=.55,color='#05030c',res=.25}={})=>{
    const c=mk(W*res,H*res),lx=c.getContext('2d'),q=[];
    return{canvas:c,
      begin(d){q.length=0;if(d!=null)dark=d;return this},
      add(X,Y,r,col,i=1){if(q.length<(G.low()?12:28))q.push([X,Y,r,col,i]);return this},
      apply(x,{glow=.22}={}){
        lx.globalCompositeOperation='source-over';lx.globalAlpha=1;lx.clearRect(0,0,c.width,c.height);
        lx.globalAlpha=clamp(dark,0,1);lx.fillStyle=color;lx.fillRect(0,0,c.width,c.height);
        lx.globalCompositeOperation='destination-out';const d=dot('#000000');
        for(const[X,Y,r,,i]of q){lx.globalAlpha=clamp(i,0,1);lx.drawImage(d,(X-r)*res,(Y-r)*res,r*2*res,r*2*res);lx.drawImage(d,(X-r*.55)*res,(Y-r*.55)*res,r*1.1*res,r*1.1*res)}
        x.drawImage(c,0,0,W,H);
        if(glow>0)for(const[X,Y,r,col,i]of q)if(col)G.glow(x,X,Y,r*.8,col,glow*i);
        return this}};
  };
  /* feixes de luz girando devagar */
  G.rays=(x,cx,cy,{n=7,len=260,width=.2,col='#fff3c0',a=.12,t=0,from=0,spread=TAU}={})=>{
    const img=bake('ray:'+col,128,64,g=>{for(let i=0;i<8;i++){g.fillStyle=vgradX(g,128,col,.16);g.beginPath();g.moveTo(0,32);g.lineTo(128,i*4);g.lineTo(128,64-i*4);g.closePath();g.fill()}});
    const rot=G.reduced()?0:t*.08;
    for(let i=0;i<n;i++){const an=from+rot+i*spread/n;x.save();x.globalCompositeOperation='lighter';x.globalAlpha*=a;x.translate(cx,cy);x.rotate(an);x.drawImage(img,0,-len*width/2,len,len*width);x.restore()}
  };
  function vgradX(x,w,col,a){const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,G.rgba(col,a*2));g.addColorStop(1,G.rgba(col,0));return g}
  /* sombra de contato no chão; alt = altura do objeto acima do chão */
  G.shadow=(x,cx,groundY,w,{alt=0,alpha=.45,h}={})=>{const k=1/(1+Math.max(0,alt)/110),W=w*(.55+.45*k),H=h??w*.24;
    const img=bake('contact',96,32,g=>{g.translate(48,16);g.scale(1,1/3);const q=g.createRadialGradient(0,0,0,0,0,48);q.addColorStop(0,'rgba(0,0,0,1)');q.addColorStop(.55,'rgba(0,0,0,.65)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(-48,-48,96,96)});
    const ga=x.globalAlpha;x.globalAlpha=ga*alpha*k;x.drawImage(img,cx-W/2,groundY-H*k/2,W,H*k);x.globalAlpha=ga};
  G.vignette=(x,W,H,{a=.5,col='#000000'}={})=>{
    const img=bake(`vg:${W}x${H}:${col}`,W/2,H/2,(g,w,h)=>{g.translate(w/2,h/2);g.scale(w/2,h/2);const q=g.createRadialGradient(0,0,.55,0,0,1.42);q.addColorStop(0,G.rgba(col,0));q.addColorStop(.55,G.rgba(col,.5));q.addColorStop(1,G.rgba(col,1));g.fillStyle=q;g.fillRect(-1,-1,2,2)});
    const ga=x.globalAlpha;x.globalAlpha=ga*a;x.drawImage(img,0,0,W,H);x.globalAlpha=ga};
  G.scanlines=(x,W,H,a=.1)=>G.fillTile(x,bake('scan',4,4,g=>{g.fillStyle='#000';g.fillRect(0,0,4,1.4)},{s:2}),0,0,W,H,{alpha:a});

  /* ambiente sem estado: ambient('poeira'|'brasas'|'folhas'|'neve'|'chuva'|'motes'|'vagalumes',{W,H,n,col,seed}) */
  const AMB={poeira:{vx:7,vy:5,s:1.8,col:'#f4ead6',a:.35},brasas:{vx:6,vy:-38,s:2.6,col:'#ff9a3c',a:.8,add:1},folhas:{vx:-34,vy:34,s:5,col:'#6fcf6a',a:.75,sway:18},
    neve:{vx:-8,vy:30,s:2.4,col:'#eef6ff',a:.75,sway:10},chuva:{vx:-90,vy:520,s:1.2,col:'#a8c8ff',a:.4},motes:{vx:3,vy:-9,s:3.2,col:'#b9a6ff',a:.55,add:1,sway:14},vagalumes:{vx:4,vy:-3,s:3.6,col:'#e8ff8a',a:.9,add:1,sway:26}};
  G.ambient=(kind,{W=800,H=450,n=34,col,seed=7}={})=>{
    const A=AMB[kind]||AMB.poeira,r=G.rng(seed+hash(kind)),C=col||A.col,P=Array.from({length:n},()=>[r(),r(),.5+r()*.8,r()*TAU]);
    return{draw(x,t=0,camX=0){
      const red=G.reduced();if(red){t=0;camX=0}
      const m=G.low()?Math.ceil(n/2):n,ga=x.globalAlpha,o=x.globalCompositeOperation;if(A.add)x.globalCompositeOperation='lighter';
      for(let i=0;i<m;i++){const[a,b,k,ph]=P[i],X=mod(a*(W+40)+A.vx*k*t-camX*k*.25+Math.sin(t*k+ph)*(A.sway||0),W+40)-20,Y=mod(b*(H+40)+A.vy*k*t,H+40)-20,s=A.s*k;
        x.globalAlpha=ga*A.a*(kind==='vagalumes'?.35+.65*Math.abs(Math.sin(t*1.7*k+ph)):1);
        if(kind==='chuva'){x.strokeStyle=C;x.lineWidth=s;x.beginPath();x.moveTo(X,Y);x.lineTo(X+3,Y-14*k);x.stroke()}
        else if(kind==='folhas'){x.fillStyle=C;x.beginPath();x.ellipse(X,Y,s,s*.45,t*k*1.6+ph,0,TAU);x.fill()}
        else x.drawImage(dot(C),X-s*2,Y-s*2,s*4,s*4)}
      x.globalAlpha=ga;x.globalCompositeOperation=o}};
  };

  /* ===================== partículas (estende o FX20) ===================== */
  /* tipos novos para C.fx.burst({kind}): faisca, brilho, estilhaco, fumaca, onda, brasa, folha, confete */
  const KIND={
    faisca(x,p,a){x.globalCompositeOperation='lighter';x.strokeStyle=p.col;x.lineWidth=Math.max(1,p.s*.8);x.lineCap='round';x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);x.stroke()},
    brilho(x,p){x.globalCompositeOperation='lighter';const r=p.s*3.4;x.drawImage(dot(p.col),p.x-r,p.y-r,r*2,r*2)},
    estilhaco(x,p){x.translate(p.x,p.y);x.rotate(p.r);fillPoly(x,[[p.s*2,0],[-p.s,p.s*1.1],[-p.s*.6,-p.s]],p.col);fillPoly(x,[[p.s*2,0],[-p.s*.6,-p.s],[0,0]],'rgba(255,255,255,.4)')},
    fumaca(x,p,a,k){x.globalAlpha=a*.42;const r=p.s*(2+k*5);x.drawImage(dot(p.col),p.x-r,p.y-r,r*2,r*2)},
    onda(x,p,a,k){x.globalCompositeOperation='lighter';x.strokeStyle=p.col;x.lineWidth=Math.max(.6,p.s*(1-k));x.beginPath();x.arc(p.x,p.y,p.s*(1+(1-(1-k)*(1-k))*11),0,TAU);x.stroke()},
    brasa(x,p){x.globalCompositeOperation='lighter';const r=p.s*(2+Math.sin(p.r*3)*.6);x.drawImage(dot(p.col),p.x-r,p.y-r,r*2,r*2);x.fillStyle='#fff6d0';x.fillRect(p.x-p.s*.35,p.y-p.s*.35,p.s*.7,p.s*.7)},
    folha(x,p){x.fillStyle=p.col;x.beginPath();x.ellipse(p.x,p.y,p.s*1.8,p.s*.8,p.r,0,TAU);x.fill()},
    confete(x,p){x.translate(p.x,p.y);x.rotate(p.r*.7);x.scale(1,Math.cos(p.r*2));x.fillStyle=p.col;x.fillRect(-p.s*1.2,-p.s*.8,p.s*2.4,p.s*1.6)},
  };
  if(typeof fxDraw20==='function'){
    const _fd=fxDraw20;
    fxDraw20=function(x,W,H){
      const all=FX20.p;
      if(!all.some(p=>KIND[p.k]))return _fd.apply(this,arguments);
      const old=[];
      for(const p of all){const f=KIND[p.k];if(!f){old.push(p);continue}
        const k=clamp(p.t/p.life,0,1),a=1-k;x.save();x.globalAlpha=a;try{f(x,p,a,k)}catch(e){}x.restore()}
      FX20.p=old;
      try{return _fd.apply(this,arguments)}finally{FX20.p=all}
    };
  }
  const EMIT={
    impacto:c=>[{kind:'onda',n:1,sp:0,g:0,size:5,life:.32,col:c||'#ffffff'},{kind:'faisca',n:14,sp:340,g:420,size:2.4,life:.34,col:c?[c,'#fff']:['#ffd36b','#fff']}],
    explosao:c=>[{kind:'onda',n:1,sp:0,g:0,size:9,life:.45,col:c||'#ffb25a'},{kind:'fumaca',n:8,sp:90,g:-40,size:7,life:.9,col:'#6a5a68'},{kind:'brasa',n:18,sp:240,g:260,size:2.8,life:.8,col:c||['#ff9a3c','#ffd36b']},{kind:'estilhaco',n:8,sp:260,g:520,size:3,life:.7,col:c||'#c8b8d8'}],
    brilho:c=>[{kind:'brilho',n:10,sp:80,g:-40,size:2.6,life:.7,col:c||'#ffd36b'},{kind:'star',n:5,sp:130,g:60,size:2.2,life:.6,col:'#ffffff'}],
    coleta:c=>[{kind:'onda',n:1,sp:0,g:0,size:3.4,life:.3,col:c||'#ffd36b'},{kind:'brilho',n:7,sp:110,g:-20,size:2,life:.45,col:c||'#ffd36b'}],
    poeira:c=>[{kind:'fumaca',n:5,sp:70,g:-20,size:3.4,life:.45,col:c||'#b8a88a',ang:-Math.PI/2,spread:2.6}],
    rastro:c=>[{kind:'brilho',n:2,sp:22,g:0,size:2.4,life:.35,col:c||'#8fe8ff'}],
    fumaca:c=>[{kind:'fumaca',n:6,sp:34,g:-50,size:5,life:1.1,col:c||'#8a7a90'}],
    estilhacos:c=>[{kind:'estilhaco',n:14,sp:240,g:560,size:3,life:.75,col:c||['#b9a6ff','#e8e0ff']}],
    folhas:c=>[{kind:'folha',n:10,sp:110,g:90,size:2.8,life:1,col:c||['#6fcf6a','#b8e07a']}],
    confete:()=>[{kind:'confete',n:48,sp:330,g:360,size:3,life:1.5,col:['#ffd36b','#7dffa8','#b9a6ff','#ff9be0','#7fe3ff']}],
  };
  G.emitters=Object.keys(EMIT);
  /* emit('impacto'|...,x,y,{col,amount,ang,spread,size}) — usa o mesmo FX20 do C.fx */
  G.emit=(preset,X,Y,{col,amount=1,ang,spread,size=1}={})=>{
    const f=EMIT[preset];if(!f||typeof fx20==='undefined')return;
    const red=G.reduced(),q=amount*(red?.3:G.low()?.6:1);
    for(const o of f(col)){if(red&&o.kind==='onda')continue;const b={...o,n:Math.max(1,Math.round(o.n*q)),size:o.size*size,grav:o.g};if(ang!=null)b.ang=ang;if(spread!=null)b.spread=spread;fx20.burst(X,Y,b)}
  };

  /* ===================== hit-stop (só a imagem) ===================== */
  /* O laço, o step, os timers, a rede e o RNG seguem normais: apenas o
     quadro do impacto fica na tela por alguns milissegundos. */
  const HS={until:0,cool:0,fresh:false,zoom:0,snap:null};
  G.hitstop=(ms=70,{zoom=.012}={})=>{
    if(G.reduced())return false;
    const now=performance.now();if(now<HS.cool)return false;
    HS.until=now+clamp(ms,16,140);HS.cool=HS.until+120;HS.fresh=true;HS.zoom=zoom;return true;
  };
  G.frozen=()=>performance.now()<HS.until;
  function present(){
    if(!HS.until)return;
    if(performance.now()>=HS.until){HS.until=0;return}
    const cv=MG.cv,x=MG.x;if(!cv||!x)return;
    const s=HS.snap||(HS.snap=mk(1,1));
    if(HS.fresh||s.width!==cv.width||s.height!==cv.height){
      HS.fresh=false;if(s.width!==cv.width||s.height!==cv.height){s.width=cv.width;s.height=cv.height}
      const g=s.getContext('2d');g.clearRect(0,0,s.width,s.height);g.drawImage(cv,0,0);return}
    const z=HS.zoom,w=cv.width,h=cv.height;
    x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(s,-w*z/2,-h*z/2,w*(1+z),h*(1+z));x.restore();
  }
  /* atalho: congela, treme e solta faíscas. force 0.5 (leve) a 2 (pesado) */
  G.impact=(X,Y,{col,force=1}={})=>{G.hitstop(35+35*force);if(typeof fx20!=='undefined')fx20.shake(4*force,.12+.08*force);G.emit('impacto',X,Y,{col,amount:Math.min(2,force),size:.8+.2*force})};
  G.reset=()=>{HS.until=0;HS.cool=0;HS.fresh=false;PERF.low=false;PERF.last=0;PERF.sum=0;PERF.n=0;PERF.bad=0;PERF.good=0};

  /* ===================== HUD ===================== */
  /* ícones vetoriais 24x24 (mesmo desenho no canvas e no HUD em HTML) */
  const ICONS={
    coracao:'M12 21C7 17 2.5 13.4 2.5 8.8c0-3.2 2.4-5.3 5.1-5.3 1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.7 0 5.1 2.1 5.1 5.3C21.5 13.4 17 17 12 21z',
    estrela:'M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z',
    moeda:'M12 2a10 10 0 100 20 10 10 0 100-20zM12 5.5a6.5 6.5 0 110 13 6.5 6.5 0 110-13zM12 8l-2.6 4 2.6 4 2.6-4z',
    raio:'M13.5 2L4 14h6l-1.5 8L19 9.500h-6z',
    escudo:'M12 2l8 3v6c0 5.200-3.400 9.200-8 11-4.600-1.800-8-5.800-8-11V5z',
    caveira:'M12 2C7 2 3.5 5.500 3.500 10c0 2.700 1.300 4.700 3.500 6v5h3v-2h1v2h2v-2h1v2h3v-5c2.200-1.300 3.500-3.300 3.500-6 0-4.500-3.500-8-8.500-8zM8.500 8.500a2.2 2.2 0 110 4.400 2.200 2.200 0 110-4.400zM15.500 8.500a2.2 2.2 0 110 4.400 2.200 2.200 0 110-4.400z',
    relogio:'M12 2a10 10 0 100 20 10 10 0 100-20zM12 4.500a7.500 7.500 0 110 15 7.500 7.500 0 110-15zM11 7h2v4.600l3.500 2.100-1 1.700L11 12.800z',
    olho:'M12 5C6.500 5 2.500 9.500 1.500 12c1 2.500 5 7 10.500 7s9.500-4.500 10.500-7c-1-2.500-5-7-10.500-7zM12 8a4 4 0 110 8 4 4 0 110-8zM12 10.200a1.800 1.800 0 100 3.600 1.800 1.800 0 100-3.600z',
    chama:'M12.500 2c.5 4-6 6.500-6 12 0 4.400 2.500 8 5.500 8s6-3 6-7.500c0-2.500-1-4.500-2.500-6 0 2-1 3-2 3.500 1-4 .5-7.500-1-10z',
    alvo:'M12 2a10 10 0 100 20 10 10 0 100-20zM12 5a7 7 0 110 14 7 7 0 110-14zM12 8a4 4 0 100 8 4 4 0 100-8z',
    coroa:'M3 7l4.500 4L12 4l4.500 7L21 7l-2 12H5z',
    gota:'M12 2c-3 5-7 8.800-7 13a7 7 0 0014 0c0-4.200-4-8-7-13z',
    trofeu:'M6 3h12v2h3v3c0 2.500-1.800 4.300-4.100 4.500-.8 1.800-2.200 3-3.9 3.400V18h3v3H8v-3h3v-2.100c-1.700-.4-3.1-1.6-3.9-3.4C4.800 12.300 3 10.500 3 8V5h3z',
    bandeira:'M5 2h2v20H5zM8 3h11l-3 4.500 3 4.500H8z',
  };
  const P2D={};
  G.icons=Object.keys(ICONS);
  G.icon=(x,name,cx,cy,size=18,col='#ffd36b')=>{const d=ICONS[name];if(!d)return;const p=P2D[name]||(P2D[name]=new Path2D(d));
    x.save();x.translate(cx-size/2,cy-size/2);x.scale(size/24,size/24);x.fillStyle=col;x.fill(p,'evenodd');x.restore()};
  /* quantos px de tela vale 1 unidade lógica do canvas (≈0,45 num celular de 390 px) */
  G.cssScale=()=>{try{const w=parseFloat(MG.cv.style.width);return w>0&&MG.W?w/MG.W:1}catch(e){return 1}};
  /* tamanho de fonte lógico que nunca fica menor que minCss px na tela */
  G.fs=(size,minCss=11)=>Math.max(size,minCss/G.cssScale());
  const font=(w,s)=>`${w} ${s}px ${FONT}`;
  G.hud={
    text(x,str,X,Y,{size=16,col='#f4ead6',al='left',bl='middle',w=700,stroke=3,min=11,max}={}){
      const s=G.fs(size,min);x.save();x.font=font(w,s);x.textAlign=al;x.textBaseline=bl;
      if(stroke){x.lineJoin='round';x.lineWidth=Math.max(stroke,s*.18);x.strokeStyle='rgba(8,4,14,.82)';x.strokeText(str,X,Y,max)}
      x.fillStyle=col;x.fillText(str,X,Y,max);x.restore();return s},
    panel(x,X,Y,w,h,{r=10,acc='#ffd36b',a=.86}={}){
      const W=Math.max(8,Math.round(w)),H=Math.max(8,Math.round(h));
      const img=bake(`pan:${W}x${H}:${r}:${acc}`,W+4,H+4,g=>{g.translate(2,2);
        rr(g,0,0,W,H,r);g.fillStyle=vgrad(g,0,H,['#2b2139','#140e1f']);g.fill();
        g.strokeStyle=G.rgba(acc,.55);g.lineWidth=1.5;g.stroke();rr(g,2.5,2.5,W-5,H-5,Math.max(0,r-2.5));g.strokeStyle='rgba(255,255,255,.09)';g.lineWidth=1;g.stroke();
        g.fillStyle=acc;const L=Math.min(14,W/4,H/3);[[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([u,v,i,j])=>{g.fillRect(u+(i<0?-L:0),v+(j<0?-2:0),L,2);g.fillRect(u+(i<0?-2:0),v+(j<0?-L:0),2,L)})},{s:2});
      const ga=x.globalAlpha;x.globalAlpha=ga*a;x.drawImage(img,X-2,Y-2,W+4,H+4);x.globalAlpha=ga},
    /* v e ghost entre 0 e 1 */
    bar(x,X,Y,w,h,v,{col='#7dffa8',bg='#1a1226',ghost,segs=0,label,val}={}){
      v=clamp(v||0,0,1);x.save();rr(x,X-1.5,Y-1.5,w+3,h+3,h/2+1.5);x.fillStyle='rgba(8,4,14,.8)';x.fill();
      rr(x,X,Y,w,h,h/2);x.clip();x.fillStyle=bg;x.fillRect(X,Y,w,h);
      if(ghost!=null&&ghost>v){x.fillStyle='rgba(255,255,255,.55)';x.fillRect(X,Y,w*clamp(ghost,0,1),h)}
      x.fillStyle=col;x.fillRect(X,Y,w*v,h);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(X,Y,w*v,h*.35);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(X,Y+h*.72,w*v,h*.28);
      if(segs>1){x.fillStyle='rgba(8,4,14,.7)';for(let i=1;i<segs;i++)x.fillRect(X+w*i/segs-.75,Y,1.5,h)}
      x.restore();
      if(label)G.hud.text(x,label,X,Y-G.fs(12)*.75,{size:12});
      if(val!=null)G.hud.text(x,String(val),X+w,Y-G.fs(12)*.75,{size:12,al:'right'})},
    /* pílula com ícone; devolve a largura usada */
    chip(x,X,Y,{icon,text='',col='#ffd36b',size=15,al='left',min=11}={}){
      const s=G.fs(size,min),pad=s*.55,ic=icon?s*1.15:0,gap=icon&&text!==''?s*.35:0;
      x.save();x.font=font(800,s);const w=pad*2+ic+gap+x.measureText(String(text)).width,h=s*1.75;
      const L=al==='right'?X-w:al==='center'?X-w/2:X;
      rr(x,L,Y-h/2,w,h,h/2);x.fillStyle='rgba(18,12,28,.84)';x.fill();x.strokeStyle=G.rgba(col,.6);x.lineWidth=1.2;x.stroke();
      if(icon)G.icon(x,icon,L+pad+ic/2,Y,ic,col);
      x.font=font(800,s);x.textAlign='left';x.textBaseline='middle';x.fillStyle='#f4ead6';x.fillText(String(text),L+pad+ic+gap,Y+s*.04);x.restore();return w},
    /* vidas/cargas: n cheias de max */
    pips(x,X,Y,n,max,{icon='coracao',size=18,col='#ff5b6b',min=11}={}){const s=G.fs(size,min);for(let i=0;i<max;i++)G.icon(x,icon,X+s/2+i*s*1.12,Y,s,i<n?col:'rgba(244,234,214,.22)');return max*s*1.12},
    /* moldura nos cantos da tela, por cima de tudo, sem cobrir o jogo */
    frame(x,W,H,{acc='#ffd36b',a=.8}={}){
      const img=bake(`frm:${W}x${H}:${acc}`,W,H,g=>{g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=6;g.strokeRect(0,0,W,H);g.strokeStyle=G.rgba(acc,.3);g.lineWidth=1;g.strokeRect(4.5,4.5,W-9,H-9);
        [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([u,v,i,j])=>{g.save();g.translate(u,v);g.scale(i,j);g.strokeStyle=acc;g.lineWidth=2;g.beginPath();g.moveTo(4,30);g.lineTo(4,10);g.lineTo(10,4);g.lineTo(30,4);g.stroke();fillPoly(g,[[9,6],[12,9],[9,12],[6,9]],acc);g.restore()})});
      const ga=x.globalAlpha;x.globalAlpha=ga*a;x.drawImage(img,0,0,W,H);x.globalAlpha=ga},
    /* faixa de título (início de fase, chefe...); k = opacidade 0..1 */
    banner(x,W,H,title,{sub='',k=1,acc='#ffd36b',y}={}){
      if(k<=0)return;const s=G.fs(30,18),s2=G.fs(15,11),h=s*1.5+(sub?s2*1.7:0),Y=(y??H*.38)-h/2;
      x.save();x.globalAlpha*=Math.min(1,k);
      const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(10,6,18,0)');g.addColorStop(.2,'rgba(10,6,18,.85)');g.addColorStop(.8,'rgba(10,6,18,.85)');g.addColorStop(1,'rgba(10,6,18,0)');
      x.fillStyle=g;x.fillRect(0,Y,W,h);x.fillStyle=G.rgba(acc,.8);x.fillRect(W*.24,Y,W*.52,1.5);x.fillRect(W*.24,Y+h-1.5,W*.52,1.5);
      G.hud.text(x,title,W/2,Y+s*.8,{size:s,al:'center',w:900,col:acc,max:W-24});
      if(sub)G.hud.text(x,sub,W/2,Y+s*1.5+s2*.7,{size:s2,al:'center',max:W-24});
      x.restore()},
  };
  /* HUD em HTML: skin() veste a partida atual; chips() gera o HTML para C.hud() */
  G.skin=({acc='#ffd36b'}={})=>{const g=document.querySelector('#mgMain .mg-game');if(g){g.classList.add('gfx60');g.style.setProperty('--g60-acc',acc)}return!!g};
  const escH=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  G.svg=name=>ICONS[name]?`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${ICONS[name]}"/></svg>`:'';
  /* itens: {icon,label,value,tone:'ok'|'warn'|'bad'}; texto sempre escapado */
  G.chips=items=>`<span class="g60-hud">${(items||[]).filter(Boolean).map(i=>`<span class="g60-chip${['ok','warn','bad'].includes(i.tone)?' g60-'+i.tone:''}">${G.svg(i.icon)}${i.label?`<small>${escH(i.label)}</small>`:''}${i.value!=null?`<b>${escH(i.value)}</b>`:''}</span>`).join('')}</span>`;

  /* contagem regressiva comercial: o jogo põe g60intro:{title,sub,acc} no objeto do make() */
  function drawIntro(x,W,H,it,left){
    const n=Math.max(1,Math.ceil(left)),f=G.reduced()?0:Math.max(0,left-(n-1)),acc=it.acc||'#ffd36b';
    x.save();x.fillStyle='rgba(6,3,12,.46)';x.fillRect(0,0,W,H);x.restore();
    const cy=H*.56,R=Math.min(W,H)*.14;
    G.glow(x,W/2,cy,R*2.4,acc,.3);
    x.save();x.lineWidth=Math.max(3,R*.09);x.strokeStyle='rgba(255,255,255,.16)';x.beginPath();x.arc(W/2,cy,R,0,TAU);x.stroke();
    x.strokeStyle=acc;x.lineCap='round';x.beginPath();x.arc(W/2,cy,R,-Math.PI/2,-Math.PI/2+TAU*(G.reduced()?1:f||1));x.stroke();x.restore();
    G.hud.text(x,String(n),W/2,cy+R*.04,{size:R*1.15*(1+f*.12),al:'center',w:900,col:'#ffffff',stroke:6});
    G.hud.banner(x,W,H,it.title||'Prepare-se',{sub:it.sub||'Prepare-se',acc,y:Math.max(H*.2,cy-R-G.fs(30,18)*1.7)});
  }
  if(typeof mgOverlay==='function'){const _ov=mgOverlay;mgOverlay=function(x){
    const C=MG.C,it=MG.g&&MG.g.g60intro;
    if(!it||!C||Date.now()>=C.t0)return _ov.apply(this,arguments);
    try{drawIntro(x,MG.W,MG.H,it,(C.t0-Date.now())/1000)}catch(e){console.warn('[GFX60]',e);return _ov.apply(this,arguments)}
    MG.C=null;try{return _ov.apply(this,arguments)}finally{MG.C=C}
  }}

  /* ===================== ganchos no Arcade ===================== */
  if(typeof mgLoop==='function'){const _loop=mgLoop;mgLoop=function(now){const out=_loop.apply(this,arguments);try{sample(now);present()}catch(e){console.warn('[GFX60]',e)}return out}}
  if(typeof mgStartLocal==='function'){const _start=mgStartLocal;mgStartLocal=function(){G.reset();return _start.apply(this,arguments)}}
  /* movimento reduzido: sem tremor de tela e com clarão suave (só visual) */
  if(typeof fxOff20==='function'){const _off=fxOff20;fxOff20=function(){return G.reduced()?[0,0]:_off.apply(this,arguments)}}
  if(typeof fx20!=='undefined'){const _flash=fx20.flash;fx20.flash=function(col,a=.35){return _flash.call(this,col,G.reduced()?Math.min(a,.12):a)}}

  window.GFX60=G;
  console.info('[Tulpa] Motor gráfico do Arcade (GFX60) carregado');
})();
