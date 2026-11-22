/* ===================================================================
   TULPA · Mapa tático: HUD nos tokens, seleção múltipla com área de
   transferência (Ctrl+A/C/X/V) e vários mapas com Modo Espectador
   -------------------------------------------------------------------
   Onde os dados ficam (Supabase):
   - campaign_store, chave 'state' (o estado da mesa que já existe):
       state.map      → o mapa em exibição (o "current_map_id" é state.map.key)
       state.tokens   → os tokens do mapa em exibição (todo o resto do
                        código continua lendo só este array)
       state.parked   → { [chave do mapa]: {name, tokens:[…], fog} }
                        os tokens que ficaram nos outros mapas
   - Espelho opcional (tulpa-multimapas.sql): campaigns.maps e
     campaign_runtime.current_map_id, gravados pela função
     set_current_map. Sem o SQL aplicado, tudo funciona pelo 'state'.
   =================================================================== */
const SEL19={set:new Set(),clip:null,paste:null,hover:null,ctx:false,over:false,mirror:null};
const BLANK19='~blank';
const curKey19=()=>M6.state.map?.key||BLANK19;
const mapName19=k=>k===BLANK19?'Mesa em branco':(M6.maps.find(m=>m.key===k)?.name||M6.state.parked?.[k]?.name||'outro mapa');
const toksNow19=()=>M6.state.tokens||[];

/* ===================== MÓDULO 1 · HUD nos tokens ===================== */
const HUD19={on:lsGet6('tulpa_tok_hud',true)!==false};
T3.tokHud=function(x,t,ch,d,cx,cy,r,sz){
  /* seleção múltipla: anel tracejado dourado */
  if(SEL19.set.has(t.id)&&SEL19.set.size>1){x.beginPath();x.arc(cx,cy,r+4,0,Math.PI*2);x.setLineDash([6,4]);x.lineWidth=2.5;x.strokeStyle='#ffd36b';x.stroke();x.setLineDash([])}
  if(!HUD19.on||!ch||!d)return;
  /* mapa limpo: barras e números só no token em foco (selecionado, sob o cursor ou na vez) */
  if(T3.tokFocus&&!T3.tokFocus(t,ch)&&!SEL19.set.has(t.id))return;
  const isM=isGM6(),own=ch.ownerId&&ch.ownerId===uid3(),npc=gmChar6(ch);
  if(npc&&!isM)return;                       /* os jogadores não leem a ficha dos inimigos */
  if(d.hideStats&&!isM&&!own)return;         /* ficha escondida pelo dono */
  let mx;try{mx=dmax(d)}catch(e){mx={}}
  const vt=Math.max(0,Number(d.vital)||0),tmp=Math.max(0,Number(d.vitalTemp)||Number(d.temp)||0),vMax=Math.max(1,Number(mx.vt)||vt||1);
  const lu=Math.max(0,Number(d.lucidity)||0),es=Math.max(0,Number(d.essence)||0);
  /* barra de Vital: vermelho = Vital; azul-claro listrado = Vital Temporário, por cima do que sobra e além do máximo */
  const bw=Math.max(34,Math.min(96,r*2.2)),bh=Math.max(4,Math.min(7,sz*.09)),bx=cx-bw/2,by=cy-r-bh-6;
  const full=vMax+tmp,fv=bw*Math.min(1,vt/full),ft=bw*Math.min(1,tmp/full);
  x.save();
  x.fillStyle='rgba(12,8,6,.82)';x.beginPath();x.roundRect?x.roundRect(bx-1.5,by-1.5,bw+3,bh+3,3):x.rect(bx-1.5,by-1.5,bw+3,bh+3);x.fill();
  const pct=vt/vMax;x.fillStyle=pct>.5?'#4cc46a':pct>.25?'#e8b43a':'#e2483d';x.fillRect(bx,by,fv,bh);
  if(ft>0){x.fillStyle='#7fd6ff';x.fillRect(bx+fv,by,ft,bh);
    x.save();x.beginPath();x.rect(bx+fv,by,ft,bh);x.clip();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.2;for(let k=-bh;k<ft+bh;k+=4){x.beginPath();x.moveTo(bx+fv+k,by+bh);x.lineTo(bx+fv+k+bh,by);x.stroke()}x.restore()}
  x.restore();
  /* ícones com os valores (com o token grande o bastante, ou selecionado) */
  if(sz<30&&MAP7.sel!==t.id&&!SEL19.set.has(t.id))return;
  const fs=Math.max(9,Math.min(12,sz*.17)),parts=[['❤',vt+(tmp?'+'+tmp:''),tmp?'#bfeaff':'#ffd0cc'],['🧠',String(lu),'#e3d4ff'],['🌀',String(es),'#cfe7ff']];
  x.font=`700 ${fs}px "IBM Plex Sans",system-ui,sans-serif`;x.textBaseline='middle';
  const ws=parts.map(([i,v])=>x.measureText(i+v).width+6),tw=ws.reduce((a,b)=>a+b,0)+4,ty=by-fs/2-5;
  x.fillStyle='rgba(12,8,6,.78)';x.beginPath();x.roundRect?x.roundRect(cx-tw/2,ty-fs/2-2,tw,fs+4,6):x.rect(cx-tw/2,ty-fs/2-2,tw,fs+4);x.fill();
  let px=cx-tw/2+5;x.textAlign='left';
  parts.forEach(([i,v,c],k)=>{x.fillStyle='#fff';x.fillText(i,px,ty);const iw=x.measureText(i).width;x.fillStyle=c;x.fillText(v,px+iw+1,ty);px+=ws[k]});
};
T3.tokHudToggle=on=>{HUD19.on=on==null?!HUD19.on:!!on;lsSet6('tulpa_tok_hud',HUD19.on);mapDraw7();return HUD19.on};

/* ===================== MÓDULO 2 · seleção e área de transferência ===================== */
function selSync19(){
  const ids=new Set(toksNow19().map(t=>t.id));[...SEL19.set].forEach(id=>{if(!ids.has(id))SEL19.set.delete(id)});
  if(SEL19.set.size===1)MAP7.sel=[...SEL19.set][0];
  else if(SEL19.set.size>1)MAP7.sel=null;
}
function selSet19(ids){SEL19.set=new Set(ids);selSync19();if(!SEL19.set.size)MAP7.sel=null;try{actButton10()}catch(e){}mapDraw7()}
T3.sel={get:()=>[...SEL19.set],set:selSet19,clip:()=>SEL19.clip,paste:()=>SEL19.paste};
const cellOf19=(wx,wy)=>{const g=mapCfg7();return[(wx-g.ox)/g.cell,(wy-g.oy)/g.cell]};
const tokCenterCell19=t=>{const s=t.s||1;return[t.x+s/2,t.y+s/2]};

T3.selDown=function(e,p){
  if(!isGM6())return false;
  SEL19.ctx=true;
  /* colando: o clique escolhe o destino */
  if(SEL19.paste){if(e.button===0||e.pointerType!=='mouse'){paste19(p);}return true}
  if(MAP7.tool!=='move')return false;
  const t=mapHit7(p.wx,p.wy),add=e.ctrlKey||e.metaKey;
  if(add&&t){if(MAP7.sel&&!SEL19.set.size)SEL19.set.add(MAP7.sel);SEL19.set.has(t.id)?SEL19.set.delete(t.id):SEL19.set.add(t.id);selSync19();try{actButton10()}catch(x){}mapDraw7();return true}
  if(t&&SEL19.set.has(t.id)&&SEL19.set.size>1){groupDrag19(t,p,e);return true}
  if(t){SEL19.set=new Set([t.id]);return false}   /* um token só: segue o caminho normal (arrastar / duplo clique abre o menu) */
  if(e.pointerType==='mouse'&&e.button===0){boxDrag19(p,add);return true}
  SEL19.set.clear();return false;                 /* toque no fundo: continua movendo a câmera */
};
function boxDrag19(p,add){
  const base=add?new Set(SEL19.set):new Set();
  MAP7.drag={kind:'box',a:{x:p.wx,y:p.wy},b:{x:p.wx,y:p.wy},sx:p.sx,sy:p.sy,ext:{
    move(q){MAP7.drag.b={x:q.wx,y:q.wy};mapDraw7()},up(){}
  }};
  const d=MAP7.drag;d.ext.up=q=>{
    SEL19.box=null;
    if(Math.hypot(q.sx-d.sx,q.sy-d.sy)<5){if(!add){SEL19.set.clear();MAP7.sel=null;MAP7.ring=null;try{actButton10()}catch(e){}}return}
    const g=mapCfg7(),x0=Math.min(d.a.x,q.wx),x1=Math.max(d.a.x,q.wx),y0=Math.min(d.a.y,q.wy),y1=Math.max(d.a.y,q.wy);
    toksNow19().forEach(t=>{if(!mapTokVisible7(t))return;const [cx,cy]=tokCenterCell19(t),wx=g.ox+cx*g.cell,wy=g.oy+cy*g.cell;if(wx>=x0&&wx<=x1&&wy>=y0&&wy<=y1)base.add(t.id)});
    selSet19(base);if(base.size>1)toast(`${base.size} tokens selecionados · Ctrl+C copia, Ctrl+X recorta`);
  };
  SEL19.box=d;mapDraw7();
}
function groupDrag19(t,p,e){
  const g=mapCfg7(),ids=[...SEL19.set],orig={};toksNow19().forEach(q=>{if(SEL19.set.has(q.id))orig[q.id]={x:q.x,y:q.y,a:q.a}});
  const d={kind:'group',sx:p.sx,sy:p.sy,w0:{x:p.wx,y:p.wy},moved:false,ext:{}};MAP7.drag=d;
  d.ext.move=q=>{
    if(!d.moved&&Math.hypot(q.sx-d.sx,q.sy-d.sy)<5)return;d.moved=true;
    const dx=(q.wx-d.w0.x)/g.cell,dy=(q.wy-d.w0.y)/g.cell,now=Date.now(),send=now-(d.cast||0)>90;if(send)d.cast=now;
    ids.forEach(id=>{const o=orig[id];if(!o)return;MAP7.live[id]={x:o.x+dx,y:o.y+dy,a:o.a,until:now+60000};if(send)cast6({t:'tok',id,x:+(o.x+dx).toFixed(3),y:+(o.y+dy).toFixed(3),a:o.a})});
    d.dx=dx;d.dy=dy;mapDraw7();
  };
  d.ext.up=q=>{
    if(!d.moved){ids.forEach(id=>delete MAP7.live[id]);SEL19.set=new Set([t.id]);MAP7.sel=t.id;tapTok7(t,e);return}
    const rx=Math.round(d.dx||0),ry=Math.round(d.dy||0);
    const next=toksNow19().map(q=>{const o=orig[q.id];if(!o)return q;const s=q.s||1;const x=Math.max(0,Math.min(g.cols-s,o.x+rx)),y=Math.max(0,Math.min(g.rows-s,o.y+ry));MAP7.live[q.id]={x,y,a:q.a,until:Date.now()+4000};return{...q,x,y}});
    setState6({tokens:next});
  };
}
T3.selHover=function(e,p){if(SEL19.paste){SEL19.paste.at={x:p.wx,y:p.wy};mapDraw7()}};

/* copiar / recortar: guarda a formação em relação ao centro do grupo */
function clipFrom19(ids,cut){
  const list=toksNow19().filter(t=>ids.includes(t.id));if(!list.length)return null;
  const cs=list.map(tokCenterCell19),mx=cs.reduce((a,c)=>a+c[0],0)/cs.length,my=cs.reduce((a,c)=>a+c[1],0)/cs.length;
  return{from:curKey19(),fromName:mapName19(curKey19()),cut:!!cut,at:Date.now(),
    items:list.map(t=>{const{ id,x,y,...rest}=t;return{...rest,id,dx:x-mx,dy:y-my}})};
}
function copy19(cut){
  const ids=SEL19.set.size?[...SEL19.set]:MAP7.sel?[MAP7.sel]:[];
  if(!ids.length){toast('Selecione tokens primeiro (Ctrl+clique, caixa de seleção ou Ctrl+A).');return}
  const c=clipFrom19(ids,cut);if(!c)return;SEL19.clip=c;lsSet6('tulpa_vtt_clip_'+(camp3()?.id||'x'),c);
  if(cut){setState6({tokens:toksNow19().filter(t=>!ids.includes(t.id))});ids.forEach(id=>delete MAP7.live[id]);SEL19.set.clear();MAP7.sel=null;try{actButton10()}catch(e){}}
  fx5('click');toast(`${cut?'✂️ Recortado':'📋 Copiado'}: ${c.items.length} token${c.items.length>1?'s':''}. Ctrl+V e clique no destino para colar${cut?' (pode ser em outro mapa)':''}.`);
  mapDraw7();
}
function pasteStart19(){
  const c=SEL19.clip||lsGet6('tulpa_vtt_clip_'+(camp3()?.id||'x'),null);
  if(!c||!c.items?.length){toast('A área de transferência está vazia. Use Ctrl+C ou Ctrl+X antes.');return}
  if(MAP7.tool!=='move')mapTool7('move');
  SEL19.clip=c;SEL19.paste={at:null};document.body.classList.add('vtt-pasting');
  toast(`📌 Clique no mapa onde os ${c.items.length} token${c.items.length>1?'s':''} devem aparecer · Esc cancela`);mapDraw7();
}
function pasteCancel19(){SEL19.paste=null;document.body.classList.remove('vtt-pasting');mapDraw7()}
/* posições finais da colagem: formação mantida, encaixada na grade e dentro do mapa */
function pastePlan19(wx,wy){
  const g=mapCfg7(),[cx,cy]=cellOf19(wx,wy),c=SEL19.clip;
  return c.items.map(it=>{const s=it.s||1;return{...it,x:Math.max(0,Math.min(g.cols-s,Math.round(cx+it.dx))),y:Math.max(0,Math.min(g.rows-s,Math.round(cy+it.dy)))}});
}
function paste19(p){
  const c=SEL19.clip;if(!c)return pasteCancel19();
  const plan=pastePlan19(p.wx,p.wy),toks=toksNow19(),byChar=new Map(toks.map(t=>[t.charId,t])),out=toks.slice(),newIds=[];let moved=0,miss=0;
  plan.forEach(it=>{
    if(!charById(it.charId)){miss++;return}
    const {dx,dy,...tok}=it,ex=byChar.get(it.charId);
    if(ex){const i=out.indexOf(ex);out[i]={...ex,x:tok.x,y:tok.y,s:tok.s||ex.s,a:tok.a!=null?tok.a:ex.a};newIds.push(ex.id);moved++;return}
    const id=c.cut&&!toks.some(t=>t.id===tok.id)?tok.id:'k'+rid();
    out.push({...tok,id});newIds.push(id);
  });
  /* um personagem só pode estar num mapa: ao colar, sai dos mapas guardados */
  const chars=new Set(plan.map(i=>i.charId)),parked={...(M6.state.parked||{})};let fromOther=0;
  for(const k in parked){if(k===curKey19())continue;const before=parked[k].tokens?.length||0;const left=(parked[k].tokens||[]).filter(t=>!chars.has(t.charId));if(left.length!==before){fromOther+=before-left.length;parked[k]={...parked[k],tokens:left}}}
  setState6({tokens:out,parked});
  newIds.forEach(id=>delete MAP7.live[id]);
  if(c.cut)SEL19.clip={...c,cut:false};
  pasteCancel19();selSet19(newIds);fx5('confirm');
  toast(`✅ ${newIds.length} token${newIds.length!==1?'s':''} colado${newIds.length!==1?'s':''} em ${mapName19(curKey19())}${moved?` · ${moved} já estava${moved>1?'m':''} aqui e mudou de lugar`:''}${fromOther?` · saiu de outro mapa`:''}${miss?` · ${miss} ficha(s) não existem mais`:''}.`);
}
T3.selPaint=function(x,v,g){
  const b=SEL19.box;
  if(b&&MAP7.drag===b){const [ax,ay]=w2s7(v,b.a.x,b.a.y),[bx,by]=w2s7(v,b.b.x,b.b.y);x.save();x.fillStyle='rgba(255,211,107,.12)';x.strokeStyle='#ffd36b';x.lineWidth=1.5;x.setLineDash([6,4]);x.fillRect(Math.min(ax,bx),Math.min(ay,by),Math.abs(bx-ax),Math.abs(by-ay));x.strokeRect(Math.min(ax,bx)+.5,Math.min(ay,by)+.5,Math.abs(bx-ax),Math.abs(by-ay));x.restore()}
  const P=SEL19.paste;
  if(P&&P.at&&SEL19.clip){
    const cs=g.cell*v.s;x.save();x.globalAlpha=.6;
    pastePlan19(P.at.x,P.at.y).forEach(it=>{const ch=charById(it.charId),sz=(it.s||1)*cs,[sx,sy]=w2s7(v,g.ox+it.x*g.cell,g.oy+it.y*g.cell),cx=sx+sz/2,cy=sy+sz/2,r=sz/2-2;
      x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.save();x.clip();const im=ch&&mapTokImg7(ch);if(im)x.drawImage(im,cx-r,cy-r,r*2,r*2);else{x.fillStyle='#6b4fa0';x.fillRect(cx-r,cy-r,r*2,r*2)}x.restore();
      x.setLineDash([5,4]);x.lineWidth=2;x.strokeStyle='#7dffa8';x.stroke();x.setLineDash([])});
    x.restore();
    const [px,py]=w2s7(v,P.at.x,P.at.y);x.font='700 12px "IBM Plex Sans",system-ui,sans-serif';const tx=`Colar ${SEL19.clip.items.length} aqui`,tw=x.measureText(tx).width+12;
    x.fillStyle='rgba(12,8,6,.85)';x.fillRect(px+14,py+12,tw,20);x.fillStyle='#7dffa8';x.textAlign='left';x.textBaseline='middle';x.fillText(tx,px+20,py+22);
  }
  return false;
};

/* atalhos: só valem no contexto do mapa (ponteiro sobre ele, ou o último clique foi nele) */
document.addEventListener('pointerdown',e=>{const cv=MAP7.cv;SEL19.ctx=!!(cv&&(e.target===cv||cv.contains?.(e.target)))},true);
function mapCtx19(){
  const cv=MAP7.cv;if(!cv||!cv.isConnected||!cv.offsetParent)return false;
  const a=document.activeElement;if(a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)))return false;
  if($('modalWrap')&&!$('modalWrap').classList.contains('hide')&&$('modalWrap').offsetParent)return false;
  return SEL19.ctx||SEL19.over;
}
document.addEventListener('keydown',e=>{
  if(!isGM6()||!mapCtx19())return;
  if(e.key==='Escape'&&(SEL19.paste||SEL19.set.size)){if(SEL19.paste)pasteCancel19();else selSet19([]);return}
  if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
  const k=e.key.toLowerCase();
  if(k==='a'){e.preventDefault();const ids=toksNow19().filter(mapTokVisible7).map(t=>t.id);selSet19(ids);toast(ids.length?`${ids.length} tokens selecionados.`:'Não há tokens neste mapa.');return}
  if(k==='c'){e.preventDefault();copy19(false);return}
  if(k==='x'){e.preventDefault();copy19(true);return}
  if(k==='v'){e.preventDefault();pasteStart19();return}
});
T3.vttKey=(k,ctrl=true)=>{if(k==='a'){selSet19(toksNow19().map(t=>t.id))}else if(k==='c')copy19(false);else if(k==='x')copy19(true);else if(k==='v')pasteStart19();else if(k==='esc')pasteCancel19()};
function hookCanvas19(){const cv=MAP7.cv;if(!cv||cv.dataset.sel19)return;cv.dataset.sel19='1';cv.addEventListener('pointerenter',()=>SEL19.over=true);cv.addEventListener('pointerleave',()=>{SEL19.over=false;if(SEL19.paste){SEL19.paste.at=null;mapDraw7()}})}

/* ===================== MÓDULO 3 · vários mapas e Modo Espectador ===================== */
/* trocar de mapa: os tokens (e a névoa) ficam guardados no mapa antigo e os do mapa novo voltam */
const _use19=mapUse7;
mapUse7=function(key){
  if(!isGM6())return false;
  const from=curKey19(),to=key||BLANK19;
  if(key&&!M6.maps.find(x=>x.key===key))return false;
  if(from===to)return _use19(key);
  const parked={...(M6.state.parked||{})};
  parked[from]={name:mapName19(from),tokens:toksNow19(),fog:M6.state.fog||{on:false,open:[]},at:Date.now()};
  const back=parked[to];delete parked[to];
  const m=key?M6.maps.find(x=>x.key===key):null;
  SEL19.set.clear();MAP7.sel=null;MAP7.live={};if(SEL19.paste)pasteCancel19();
  setState6({map:m?{key:m.key,name:m.name,w:m.w,h:m.h}:null,tokens:back?.tokens||[],fog:back?.fog||{on:false,open:[]},parked});
  mirror19();
  const n=back?.tokens?.length||0,left=parked[from].tokens.length;
  toast(`🗺 ${mapName19(to)}${n?` · ${n} token${n>1?'s':''} guardado${n>1?'s':''} aqui voltaram`:''}${left?` · ${left} ficaram em ${mapName19(from)}`:''}`);
  return true;
};
T3.mapUse=mapUse7;

/* espelho opcional no Supabase: campaigns.maps + campaign_runtime.current_map_id */
async function mirror19(){
  if(!cloud6()||typeof sb()?.rpc!=='function'||SEL19.mirror===false)return;
  const c=camp3();if(!c)return;
  const maps=M6.maps.map(m=>({id:m.key,name:m.name,w:m.w,h:m.h,tokens:(m.key===curKey19()?toksNow19():M6.state.parked?.[m.key]?.tokens||[]).length}));
  const sig=JSON.stringify(maps.map(m=>[m.id,m.name,m.w,m.h]));const sendMaps=sig!==SEL19.mapsSig;
  try{const {error}=await sb().rpc('set_current_map',{p_campaign_id:c.id,p_map_id:curKey19(),p_maps:sendMaps?maps:null});if(!error)SEL19.mapsSig=sig;
    if(error){if(noFn10(error)||/does not exist|schema cache/i.test(error.message||''))SEL19.mirror=false;else console.warn('[T19] espelho do mapa',error)}else SEL19.mirror=true}
  catch(e){SEL19.mirror=false}
}

/* onde está cada personagem: no mapa atual, guardado em outro mapa ou em nenhum */
function charWhere19(charId){
  if(toksNow19().some(t=>t.charId===charId))return{here:true};
  const p=M6.state.parked||{};for(const k in p){if(k!==BLANK19&&M6.maps.length&&!M6.maps.some(m=>m.key===k))continue;/* mapa apagado */if((p[k].tokens||[]).some(t=>t.charId===charId))return{here:false,key:k,name:p[k].name||mapName19(k)}}
  return null;
}
T3.charWhere=charWhere19;
/* estado de espectador de um usuário: todos os personagens dele ficaram em outro mapa */
function specOf19(u){
  const mine=chars3().filter(ch=>ch.ownerId===u&&!gmChar6(ch));if(!mine.length)return null;
  const w=mine.map(ch=>charWhere19(ch.id));if(w.some(x=>x&&x.here))return null;
  const away=w.find(x=>x&&!x.here);return away||null;
}
T3.specOf=specOf19;
let wasSpec19=null;
function specPaint19(){
  if(!camp3())return;
  hookCanvas19();
  const st=$('mapStage');
  /* jogador */
  if(st){
    const me=isGM6()?null:specOf19(uid3());let ov=$('specOv');
    st.classList.toggle('spec-on',!!me);
    if(me){
      if(!ov){ov=document.createElement('div');ov.id='specOv';ov.className='spec-ov';ov.setAttribute('role','status');st.append(ov)}
      const sig=me.key+'|'+mapName19(curKey19());
      if(ov.dataset.sig!==sig){ov.dataset.sig=sig;ov.innerHTML=`<div class="spec-box"><div class="spec-eye" aria-hidden="true"></div><b>Modo Espectador</b><p>O Mestre está mostrando <b>${esc(mapName19(curKey19()))}</b>. O seu personagem ficou em <b>${esc(me.name)}</b>.</p><p class="sub">Você volta a jogar quando o Mestre retornar para lá ou trouxer o seu token para cá.</p><div class="inline"><button type="button" class="btn primary small" id="specArc">🕹 Jogar no Tulpa Arcade</button><button type="button" class="btn small" id="specWait">Só assistir</button></div></div>`;
        $('specArc').onclick=()=>{if(T3.mgOpen)T3.mgOpen();else document.getElementById('mgOpenBtn')?.click()};
        $('specWait').onclick=()=>ov.classList.add('mini')}
    }else ov?.remove();
    if(wasSpec19!==null&&wasSpec19&&!me){toast('🎲 Você está de volta à cena!');fx5('confirm')}
    if(wasSpec19!==null&&!wasSpec19&&me){toast(`👁 Modo Espectador: o seu personagem ficou em ${me.name}.`)}
    wasSpec19=!!me;MG.specWas=!!me;
  }
  /* olho riscado nos assentos de quem está assistindo */
  $$('#tableCharacters .table-char[data-uid]').forEach(card=>{
    const u=card.dataset.uid,sp=card.classList.contains('seat')?specOf19(u):null;let b=card.querySelector('.spec-badge');
    card.classList.toggle('spec',!!sp);
    if(!sp){b?.remove();return}
    const t=`Espectador · personagem em ${sp.name}`;
    if(!b){b=document.createElement('span');b.className='spec-badge';b.setAttribute('role','img');card.append(b)}
    if(b.title!==t){b.title=t;b.setAttribute('aria-label',t);b.innerHTML='<span class="spec-eye sm" aria-hidden="true"></span>'}
  });
}
onState6(()=>{selSync19();specPaint19()});
M6.hooks.layout.push(specPaint19);
setInterval(()=>{try{if(camp3()&&$('mapStage'))specPaint19()}catch(e){}},1200);
/* a lista de mapas mostra quantos tokens ficaram em cada um */
const _list19=mapListHtml7;
mapListHtml7=function(){
  _list19();M6.mapsLoaded19=true;const l=$('mapList');if(!l)return;
  $$('li',l).forEach(li=>{const b=li.querySelector('[data-muse]');if(!b)return;const k=b.dataset.muse,n=k===curKey19()?toksNow19().length:(M6.state.parked?.[k]?.tokens||[]).length;
    if(n&&!li.querySelector('.mu-n')){const s=document.createElement('small');s.className='mu-n';s.textContent=` · ${n} token${n>1?'s':''}`;li.querySelector('.mu-t')?.append(s)}});
};
T3.charById=charById;T3.mapCfg=()=>mapCfg7();T3.mapCam=c=>mapCam7(c);
T3.vttCtx=()=>{const cv=MAP7.cv,a=document.activeElement,m=$('modalWrap');return{cv:!!cv,conn:cv?.isConnected,op:!!cv?.offsetParent,act:a&&a.tagName+'#'+a.id,modal:m?{cls:m.className,op:!!m.offsetParent}:null,ctx:SEL19.ctx,over:SEL19.over,gm:isGM6(),tool:MAP7.tool}};
T3.vttDbg=()=>({sel:[...SEL19.set],clip:SEL19.clip,paste:!!SEL19.paste,parked:M6.state.parked,cur:curKey19(),mirror:SEL19.mirror});

