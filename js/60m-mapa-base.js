/* ===================================================================
   TULPA · Onda 2 — Mapa Tático nunca em branco
   1) T3.mapBlank20: desenho padrão do mapa SEM imagem (chamado pelo mapPaint7 do js/21):
      grade nítida com coordenadas (A, B, C… / 1, 2, 3…), escala em metros e luz ambiente,
      tudo com as variáveis da estética ativa (--bg --panel --panel2 --line --accent --text).
   2) Guia sobre o mapa: o Mestre vê como carregar/trocar o mapa; o jogador vê
      "Aguardando o Mestre carregar o mapa" (e um aviso se a névoa cobre tudo e ele não tem token).
   3) T3.fogHalo20: círculo mínimo de visão em volta do token do jogador, para a névoa nunca
      ficar 100% preta (não atravessa nada além do entorno imediato do token).
   4) Rede de segurança: remonta/redimensiona o canvas se o palco mudou ou ficou com tamanho 0.
   Camada IIFE: sem nomes globais. Depende (em tempo de execução) de MAP7, M6, T3 e do motor tático.
   =================================================================== */
(()=>{
 'use strict';
 const FONT_FB='system-ui,"IBM Plex Sans",sans-serif';

 /* ---------- cores: converte qualquer valor CSS (hex, rgb, color-mix, var) em [r,g,b] ---------- */
 let probe=null;const cache=new Map();
 function rgb(val,fb){
  const key=(val||'')+'|'+fb;if(cache.has(key))return cache.get(key);
  let out=null;
  try{
   if(!probe){const c=document.createElement('canvas');c.width=c.height=1;probe=c.getContext('2d',{willReadFrequently:true})}
   const seed='#010203';
   for(const cand of [val,fb]){
    if(!cand)continue;
    probe.clearRect(0,0,1,1);probe.fillStyle=seed;probe.fillStyle=cand;
    if(probe.fillStyle==='#010203'&&String(cand).replace(/\s/g,'').toLowerCase()!=='#010203'&&String(cand).replace(/\s/g,'').toLowerCase()!=='rgb(1,2,3)')continue;
    probe.fillRect(0,0,1,1);const d=probe.getImageData(0,0,1,1).data;out=[d[0],d[1],d[2]];break;
   }
  }catch(e){}
  if(!out)out=[128,128,128];
  if(cache.size>200)cache.clear();
  cache.set(key,out);return out;
 }
 const mix=(a,b,t)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t));
 const css=(c,a=1)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
 const lum=c=>{const f=u=>{u/=255;return u<=.03928?u/12.92:Math.pow((u+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
 const contrast=(a,b)=>{const l1=lum(a),l2=lum(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);return(hi+.05)/(lo+.05)};
 /* texto legível (≥ 4,5:1) sobre o fundo dado: prefere --text; senão branco ou preto */
 const inkOn=(bg,pref)=>{if(contrast(pref,bg)>=4.5)return pref;const w=[255,255,255],k=[0,0,0];return contrast(w,bg)>=contrast(k,bg)?w:k};

 const colName=i=>{let s='',n=i;do{s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)-1}while(n>=0);return s};
 const rrect=(x,a,b,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else x.rect(a,b,w,h)};

 /* ---------- 1) mapa padrão em branco ---------- */
 T3.mapBlank20=function(x,v,g,o){
  const cs0=getComputedStyle(document.body),gv=k=>cs0.getPropertyValue(k).trim();
  const dark=!!o.dark;
  const bg=rgb(gv('--bg'),dark?'#0d1117':'#241b14'),
        pa=rgb(gv('--panel2')||gv('--panel'),dark?'#222b38':'#e9dcc0'),
        pb=rgb(gv('--panel'),dark?'#1a212c':'#d6c3a0'),
        ln=rgb(gv('--line'),dark?'#3a4658':'#8a7452'),
        ac=rgb(gv('--accent'),'#c9a24b'),
        tx=rgb(gv('--text'),dark?'#edf2f7':'#2a1d12'),
        font=gv('--f-ui')||FONT_FB;
  const {x0,y0,mw,mh}=o,cw=v.cw,ch=v.ch,cs=g.cell*v.s;
  if(!(mw>0&&mh>0))return true;
  const base=mix(pa,pb,.5);
  /* chão + luz ambiente (o foco de luz usa o destaque da estética; a vinheta, o fundo) */
  const gr=x.createLinearGradient(x0,y0,x0+mw,y0+mh);gr.addColorStop(0,css(pa));gr.addColorStop(1,css(pb));
  x.fillStyle=gr;x.fillRect(x0,y0,mw,mh);
  x.save();x.beginPath();x.rect(x0,y0,mw,mh);x.clip();
  const mx=x0+mw/2,my=y0+mh/2,R=Math.max(mw,mh)*.72;
  const amb=x.createRadialGradient(mx,my,0,mx,my,R);amb.addColorStop(0,css(ac,.16));amb.addColorStop(.6,css(ac,.05));amb.addColorStop(1,css(ac,0));
  x.fillStyle=amb;x.fillRect(x0,y0,mw,mh);
  const vig=x.createRadialGradient(mx,my,R*.45,mx,my,R*1.05);vig.addColorStop(0,css(bg,0));vig.addColorStop(1,css(bg,.38));
  x.fillStyle=vig;x.fillRect(x0,y0,mw,mh);
  /* grade nítida (linhas alinhadas ao pixel; a cada 5 quadrados uma linha mais forte) */
  if(g.show&&cs>=7){
   const minor=css(mix(ln,tx,.28),.85),major=css(mix(ln,tx,.55),.95);
   const top=Math.max(0,y0),bot=Math.min(ch,y0+mh),left=Math.max(0,x0),right=Math.min(cw,x0+mw);
   [[false,minor],[true,major]].forEach(([isMajor,col])=>{
    x.beginPath();x.lineWidth=isMajor?1.5:1;x.strokeStyle=col;
    for(let c=0;c<=g.cols;c++){if((c%5===0)!==isMajor)continue;const sx=Math.round(x0+(g.ox+c*g.cell)*v.s)+.5;if(sx<-1||sx>cw+1||sx>x0+mw+1)continue;x.moveTo(sx,top);x.lineTo(sx,bot)}
    for(let r=0;r<=g.rows;r++){if((r%5===0)!==isMajor)continue;const sy=Math.round(y0+(g.oy+r*g.cell)*v.s)+.5;if(sy<-1||sy>ch+1||sy>y0+mh+1)continue;x.moveTo(left,sy);x.lineTo(right,sy)}
    x.stroke();
   });
  }
  x.restore();
  x.beginPath();x.lineWidth=2;x.strokeStyle=css(ac,.7);x.rect(x0+1,y0+1,mw-2,mh-2);x.stroke();
  /* coordenadas e escala (só com a grade visível) */
  if(g.show&&cs>=12){
   const chipBg=mix(base,bg,.72),ink=inkOn(chipBg,tx),fs=Math.round(Math.max(10,Math.min(13,cs*.32)));
   x.font=`700 ${fs}px ${font}`;x.textBaseline='middle';x.textAlign='center';
   const step=cs>=26?1:cs>=16?2:5,h=fs+6,topY=Math.max(0,y0)+2,leftX=Math.max(0,x0)+2;
   x.fillStyle=css(chipBg,.82);
   const chip=(cx,cy,t,wMin)=>{const w=Math.max(wMin||0,x.measureText(t).width+8);rrect(x,cx-w/2,cy-h/2,w,h,4);x.fill();return w};
   const items=[];
   for(let c=0;c<g.cols;c+=step){const sx=x0+(g.ox+(c+.5)*g.cell)*v.s;if(sx<6||sx>cw-6||sx<x0||sx>x0+mw)continue;items.push([sx,topY+h/2,colName(c)])}
   for(let r=0;r<g.rows;r+=step){const sy=y0+(g.oy+(r+.5)*g.cell)*v.s;if(sy<topY+h*1.5||sy>ch-6||sy<y0||sy>y0+mh)continue;items.push([leftX+10,sy,String(r+1)])}
   items.forEach(([px,py,t])=>chip(px,py,t,t.length>1?0:h));
   x.fillStyle=css(ink);items.forEach(([px,py,t])=>x.fillText(t,px,py));
   /* barra de escala (canto superior direito do mapa, preso à tela) */
   const mpc=g.mpc,n=cs*2>=32?2:cs*5>=32?5:10,len=n*cs,label=`1 quadrado = ${mpc.toLocaleString('pt-BR')} m`,end=`${(n*mpc).toLocaleString('pt-BR')} m`;
   x.font=`600 ${fs}px ${font}`;
   const tw=Math.max(x.measureText(label).width,len+x.measureText(end).width+8)+16,bh=h*2+6;
   const rx=Math.min(x0+mw,cw)-8,ry=Math.max(0,y0)+h+10;
   if(rx-tw>6&&ry+bh<ch-4){
    x.fillStyle=css(chipBg,.88);rrect(x,rx-tw,ry,tw,bh,6);x.fill();
    x.fillStyle=css(ink);x.textAlign='left';x.fillText(label,rx-tw+8,ry+h/2+1);
    const by=ry+h+h/2+1,bx=rx-tw+8;
    x.strokeStyle=css(ink);x.lineWidth=2;x.beginPath();x.moveTo(bx,by);x.lineTo(bx+len,by);x.moveTo(bx,by-4);x.lineTo(bx,by+4);x.moveTo(bx+len,by-4);x.lineTo(bx+len,by+4);x.stroke();
    x.fillText(end,bx+len+6,by);
   }
  }
  return true;
 };

 /* ---------- 3) halo mínimo em volta do token do jogador na névoa ---------- */
 T3.fogHalo20=function(L,v){
  if(isGM6())return;
  let mine;try{mine=view10().mine.map(m=>({t:m.t,cx:m.cx,cy:m.cy}))}catch(e){mine=myToks10().map(t=>{const [cx,cy]=tokCenter10(t);return{t,cx,cy}})}
  mine.forEach(m=>{
   const R=tokR10(m.t)*1.9,poly=[];for(let i=0;i<28;i++){const a=i/28*TAU10;poly.push([m.cx+Math.cos(a)*R,m.cy+Math.sin(a)*R])}
   lightCut10(L,v,{poly,ox:m.cx,oy:m.cy,r:R,soft:true});
  });
 };

 /* ---------- 2) guia sobre o mapa ---------- */
 let guide=null,hiddenByGm=false,lastSig='';
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function ensure(){
  const st=MAP7&&MAP7.stage;if(!st||!MAP7.cv||!st.isConnected)return null;
  if(guide&&guide.parentNode===st)return guide;
  guide=document.createElement('div');guide.id='mapGuide20';guide.className='map-guide20';guide.hidden=true;guide.setAttribute('role','status');guide.setAttribute('aria-live','polite');
  st.append(guide);lastSig='';return guide;
 }
 function myToken(){const me=uid3();return !!me&&(M6.state.tokens||[]).some(t=>{const ch=charById(t.charId);return ch&&ch.ownerId===me})}
 function refresh(){
  const el=ensure();if(!el)return;
  const gm=isGM6(),s=M6.state||{},has=!!s.map,im=MAP7.imgSt||'',mpc=mapCfg7().mpc.toLocaleString('pt-BR');
  let kind='';
  if(!has)kind=gm?'gm-empty':'pl-empty';
  else if(im==='loading'&&!MAP7.img)kind='loading';
  else if(im==='err'&&!MAP7.img)kind=gm?'gm-err':'pl-err';
  else if(!gm&&s.fog?.on&&!myToken())kind='pl-notoken';
  if(gm&&hiddenByGm&&(kind==='gm-empty'))kind='';
  if(kind===lastSig&&el.dataset.mpc===mpc)return;
  lastSig=kind;el.dataset.mpc=mpc;el.dataset.kind=kind;
  if(!kind){el.hidden=true;el.textContent='';return}
  const act=(open,label)=>`<div class="mg-act"><button type="button" class="btn primary" data-mg="open">${esc(label)}</button>${open?'<button type="button" class="btn" data-mg="hide">Ocultar guia</button>':''}</div>`;
  const html={
   'gm-empty':`<b>Nenhum mapa carregado</b><p>Esta é a grade tática padrão: cada quadrado vale ${esc(mpc)} m. Para jogar sobre uma imagem, envie o mapa (JPG, PNG ou WEBP). Os tokens e a régua já funcionam aqui.</p>${act(true,'Carregar ou trocar mapa')}`,
   'gm-err':`<b>Não consegui carregar a imagem deste mapa</b><p>A grade padrão fica na tela até o mapa voltar. Envie a imagem de novo ou escolha outro mapa.</p>${act(false,'Carregar ou trocar mapa')}`,
   'pl-empty':`<b>Aguardando o Mestre carregar o mapa</b><p>Enquanto isso, a grade tática padrão (${esc(mpc)} m por quadrado) fica na tela.</p>`,
   'pl-err':`<b>Aguardando o Mestre</b><p>Não consegui carregar a imagem do mapa agora. Ela aparece sozinha assim que estiver disponível.</p>`,
   'loading':`<b>Carregando o mapa…</b>`,
   'pl-notoken':`<b>Seu token ainda não está no mapa</b><p>A névoa cobre a mesa até o Mestre colocar você em cena.</p>`
  }[kind];
  el.innerHTML=html;el.hidden=false;
  el.querySelectorAll('[data-mg]').forEach(b=>b.onclick=()=>{
   if(b.dataset.mg==='open'){try{mapMapsModal7()}catch(e){console.warn('[T20] mapas',e)}}
   else{hiddenByGm=true;lastSig='';refresh()}
  });
 }
 T3.mapGuide20=refresh;
 onState6(()=>{try{refresh()}catch(e){console.warn('[T20] guia',e)}});
 M6.hooks.layout.push(()=>{try{refresh()}catch(e){}});
 window.addEventListener('tulpa:mapimg',()=>{try{refresh()}catch(e){}});

 /* ---------- 4) rede de segurança: palco remontado ou com tamanho errado ---------- */
 setInterval(()=>{
  try{
   const st=$('mapStage');if(!st)return;
   if(MAP7.stage!==st||!MAP7.cv||!MAP7.cv.isConnected){if(mapMount7())mapDraw7();return}
   const dpr=Math.min(2,window.devicePixelRatio||1),w=st.clientWidth,h=st.clientHeight;
   if(w>1&&h>1&&(Math.abs(MAP7.cv.width-Math.round(w*dpr))>1||Math.abs(MAP7.cv.height-Math.round(h*dpr))>1))mapSize7();
   refresh();
  }catch(e){}
 },1500);
 window.addEventListener('pageshow',()=>{try{if(MAP7.cv)mapSize7()}catch(e){}});
 document.addEventListener('visibilitychange',()=>{try{if(!document.hidden&&MAP7.cv)mapSize7()}catch(e){}});
})();
