/* ===================================================================
   TULPA · ETAPA 22 — VISÕES DO MESTRE, IA DE INIMIGOS E FURTIVIDADE
   ------------------------------------------------------------------
   1. Três visões do mapa (só o Mestre, guardadas no aparelho dele):
        🛠️ Edição  — paredes, portas/cadeados, cômodos, lâmpadas,
                      interruptores, cones e rotas dos inimigos.
        👁️ Mestre  — só a arte do mapa, todos os tokens e os cones
                      de visão dos jogadores em tempo real.
        🎭 Players — a tela de um jogador escolhido (névoa por cômodo,
                      escuro, lanterna e recorte nas portas).
   2. Inimigos hostis (M6.state.ai[charId]): fixo (com giro entre
      ângulos), patrulha livre no cômodo ou rota traçada no mapa.
      Cone de visão bloqueado por paredes e portas fechadas. Ao ver um
      jogador, o combate começa só para quem foi visto, os aliados no
      mesmo cômodo e os inimigos daquele cômodo (Reflexo rolado). Quem
      está longe continua em tempo real. Sem contato por 5 s, o
      inimigo (ou o jogador) sai do combate; sem inimigos, ele acaba.
      Encerrar o combate na mão com inimigos vivos = Rendidos/Neutros.
   3. Portas furtivas: perto de inimigos, o jogador escolhe abrir
      normal ou em silêncio (Destreza + Furtividade, DT 12). A falha
      faz um rangido mais alto quanto maior a margem, com onda sonora
      no mapa; inimigos no alcance mostram "?" e vão investigar.
   =================================================================== */
const AI22={mode:'edit',as:'',run:{},live:{},noise:[],routeFor:null,route:[],commitAt:0,engAt:0,lastEng:{},autoEnd:false,tick:0,last:0,dirty:new Set(),castAt:{}};
T3.ai22=AI22;
try{AI22.mode=localStorage.getItem('tulpa_gmview')||'edit';AI22.as=localStorage.getItem('tulpa_gmview_as')||''}catch(e){}
if(!['edit','clean','player'].includes(AI22.mode))AI22.mode='edit';
const realGM22=()=>(window.tulpaCloudRole||portalRole||'')==='master';
const aiAll22=()=>M6.state.ai||{};
const aiOf22=id=>{const c=aiAll22()[id];return c&&c.h?c:null};
const DT22B=12;                      /* DT da porta furtiva */
const dtDoor22=()=>Number(AI22.dt)||DT22B;
const SPD22={patrol:1.4,route:1.6,inv:2.6,back:1.9};  /* quadrados por segundo */
function aiCfg22(c){c=c||{};return{h:c.h?1:0,mode:['fixed','patrol','route'].includes(c.mode)?c.mode:'fixed',fov:clamp12(Number(c.fov)||90,20,300),rng:clamp12(Number(c.rng)||10,2,60),angs:(Array.isArray(c.angs)?c.angs:[]).map(Number).filter(isFinite).slice(0,8),per:clamp12(Number(c.per)||4,1,30),r:c.r&&typeof c.r==='object'?c.r:{},st:c.st==='surr'?'surr':''}}
const route22=c=>{const k=M6.state.map?.key||'~blank';return(c.r&&Array.isArray(c.r[k])?c.r[k]:[]).filter(p=>Array.isArray(p)&&isFinite(p[0])&&isFinite(p[1]))};
const alive22=ch=>{if(!ch)return false;const st=stIds(dOf6(ch));return!st.includes('morto')&&!st.includes('agonia')&&!isDeadCh(ch)};
const hostTok22=()=>(M6.state.tokens||[]).filter(t=>{const c=aiOf22(t.charId);return c&&c.st!=='surr'&&alive22(charById(t.charId))});
/* alvos dos hostis: jogadores e também NPCs neutros/aliados do Mestre (não hostis) */
const isFoe22=ch=>!!ch&&(!ch.ownerId||gmChar6(ch))&&!!aiOf22(ch.id);
const isTarget22=ch=>!!ch&&inScene(ch)&&alive22(ch)&&!isFoe22(ch);
const playerTok22=()=>(M6.state.tokens||[]).filter(t=>isTarget22(charById(t.charId)));
const cbOrder22=()=>{const cm=camp3()?.combat;return cm?.active&&cm.phase==='active'?(cm.order||[]).map(o=>o.characterId):[]};

/* ===================== 1. visões do Mestre ===================== */
function viewSet22(m,as){AI22.mode=m;if(as!=null)AI22.as=as;try{localStorage.setItem('tulpa_gmview',m);localStorage.setItem('tulpa_gmview_as',AI22.as||'')}catch(e){}TAC10.vs=null;TAC10.fogA={};viewRow22(true);mapDraw7()}
T3.gmView=viewSet22;
function viewPlayers22(){const seen=new Set();return(M6.state.tokens||[]).map(t=>charById(t.charId)).filter(ch=>ch&&ch.ownerId&&!gmChar6(ch)&&!seen.has(ch.ownerId)&&seen.add(ch.ownerId)).map(ch=>({u:ch.ownerId,n:nm(ch)}))}
function viewRow22(force){
  const box=$('mapTools');if(!box||!realGM22())return;
  let row=$('mtView');const pl=viewPlayers22();
  if(AI22.mode==='player'&&(!AI22.as||!pl.some(p=>p.u===AI22.as)))AI22.as=pl[0]?.u||'';
  const sig=[AI22.mode,AI22.as,pl.map(p=>p.u+p.n).join()].join('|');
  if(row&&row.dataset.sig===sig&&row.isConnected&&!force)return;
  if(!row){row=document.createElement('div');row.id='mtView';row.className='mt-row mt-view';row.setAttribute('role','radiogroup');row.setAttribute('aria-label','Visão do mapa do Mestre')}
  if(!row.isConnected)box.append(row);
  row.dataset.sig=sig;
  const c=(k,ico,l,tip)=>`<button type="button" role="radio" aria-checked="${AI22.mode===k}" class="mt-chip ${AI22.mode===k?'on':''}" data-gv="${k}" title="${tip}">${ico} ${l}</button>`;
  row.innerHTML=`${c('edit','🛠️','Edição','Paredes, portas, cadeados, cômodos, lâmpadas, interruptores e rotas dos inimigos')}${c('clean','👁️','Mestre','Só a arte do mapa, todos os tokens e para onde cada jogador está olhando')}${c('player','🎭','Players','Veja exatamente o que um jogador enxerga')}${AI22.mode==='player'?`<label class="mt-chip">Como <select id="mtViewAs" aria-label="Ver como qual jogador">${pl.length?pl.map(p=>`<option value="${esc(p.u)}" ${p.u===AI22.as?'selected':''}>${esc(p.n)}</option>`).join(''):'<option value="">nenhum token de jogador</option>'}</select></label>`:''}`;
  $$('[data-gv]',row).forEach(b=>b.onclick=()=>viewSet22(b.dataset.gv));
  const s=$('mtViewAs');if(s)s.onchange=()=>viewSet22('player',s.value);
}
{const _mt22=mapTools7;mapTools7=function(){const out=_mt22.apply(this,arguments);try{viewRow22()}catch(e){console.warn('[T22] visão',e)}return out}}
setInterval(()=>{try{if(MAP7.cv&&MAP7.cv.isConnected&&!document.hidden)viewRow22()}catch(e){}},1500);

/* desenho conforme a visão: a tela "Players" pinta o mapa como se o Mestre fosse aquele jogador (troca a identidade só durante a pintura) */
const _paint22=mapPaint7,_under22=paintUnder10,_over22=paintOver10,_fix22=paintFixtures10,_cfg22=mapCfg7;
let VPAINT22='';
mapCfg7=function(){const g=_cfg22.apply(this,arguments);if(VPAINT22==='clean')g.show=false;return g};
paintFixtures10=function(){if(VPAINT22==='clean')return;return _fix22.apply(this,arguments)};
paintUnder10=function(x,v,g,isM){if(VPAINT22!=='clean')_under22.apply(this,arguments);try{aiUnder22(x,v,g)}catch(e){console.warn('[T22] cones',e)}};
paintOver10=function(x,v,g,isM){
  if(VPAINT22==='clean')cleanOver22(x,v,g);else _over22.apply(this,arguments);
  try{aiOver22(x,v,g)}catch(e){console.warn('[T22] ícones',e)}
};
mapPaint7=function(){
  if(!realGM22()||AI22.mode==='edit'){VPAINT22='';return _paint22.apply(this,arguments)}
  if(AI22.mode==='clean'){const st=M6.state;VPAINT22='clean';M6.state={...st,fog:null};try{return _paint22.apply(this,arguments)}finally{M6.state=st;VPAINT22=''}}
  /* 🎭 visão do jogador escolhido */
  const as=AI22.as;if(!as){VPAINT22='';return _paint22.apply(this,arguments)}
  const role=window.tulpaCloudRole,user=window.tulpaCloudUser;
  VPAINT22='player';TAC10.vs=null;window.tulpaCloudRole='player';window.tulpaCloudUser={...(user||{}),id:as};
  try{AI22.vis=(M6.state.tokens||[]).filter(t=>{try{return mapTokVisible7(t)}catch(e){return false}}).map(t=>t.charId);return _paint22.apply(this,arguments)}
  finally{window.tulpaCloudRole=role;window.tulpaCloudUser=user;TAC10.vs=null;VPAINT22=''}
};
/* visão limpa: só os cones dos jogadores (e o ponto de destaque) por cima da arte */
function cleanOver22(x,v,g){
  const vs=view10(),geo=vs.geo;
  vs.gm.forEach(o=>{if(!o.player)return;const col=pcol10(o.t.charId);o.views.forEach(w=>{if(!geo.dark&&!w.cone)return;x.save();x.beginPath();path10(x,v,w.poly);
    const [sx,sy]=w2s7(v,w.ox,w.oy),gr=x.createRadialGradient(sx,sy,0,sx,sy,Math.max(60,(w.r||g.cell*8)*v.s));gr.addColorStop(0,col+' / .32)');gr.addColorStop(1,col+' / .06)');x.fillStyle=gr;x.fill();x.lineWidth=1.2;x.strokeStyle=col+' / .55)';x.stroke();x.restore()})});
  paintLaser10(x,v);
}

/* ===================== cones, rotas e ícones dos inimigos ===================== */
function aiPoly22(t,c,p){
  const ch=charById(t.charId);if(!ch)return null;const g=mapCfg7(),pos=p||null;
  const [fx,fy,a]=front10(t,pos),rng=c.rng/g.mpc*g.cell,geo=geo10();
  const dark=geo.dark&&!torchOn10(t);
  return{poly:visPoly10(fx,fy,a,c.fov*Math.PI/180,dark?rng*.55:rng),ox:fx,oy:fy,r:dark?rng*.55:rng,a};
}
const aiLive22=id=>{const l=AI22.live[id];return l&&l.until>Date.now()?l.s:''};
function aiUnder22(x,v,g){
  const isM=isGM6(),edit=isM&&VPAINT22==='';
  (M6.state.tokens||[]).forEach(t=>{
    const c=aiOf22(t.charId);if(!c||c.st==='surr'||!alive22(charById(t.charId)))return;
    if(!mapTokVisible7(t))return;
    const P=aiPoly22(t,aiCfg22(c));if(!P)return;
    const s=aiLive22(t.charId),inCb=cbOrder22().includes(t.charId),hot=s==='alert'||inCb,inv=s==='inv';
    const [sx,sy]=w2s7(v,P.ox,P.oy),gr=x.createRadialGradient(sx,sy,0,sx,sy,Math.max(30,P.r*v.s));
    const col=hot?'224,35,59':inv?'242,179,16':'255,140,60';
    gr.addColorStop(0,`rgba(${col},${hot?.34:.26})`);gr.addColorStop(1,`rgba(${col},.04)`);
    x.save();x.beginPath();path10(x,v,P.poly);x.fillStyle=gr;x.fill();x.lineWidth=1.4;x.strokeStyle=`rgba(${col},.7)`;x.setLineDash(hot?[]:[6,5]);x.stroke();x.setLineDash([]);x.restore();
  });
  /* rotas traçadas: só na visão de edição */
  if(edit){
    Object.entries(aiAll22()).forEach(([id,raw])=>{const c=aiCfg22(raw);if(!c.h||c.mode!=='route')return;const pts=AI22.routeFor===id?AI22.route:route22(c);if(!pts.length)return;
      x.save();x.beginPath();pts.forEach((p,i)=>{const [px,py]=w2s7(v,p[0],p[1]);i?x.lineTo(px,py):x.moveTo(px,py)});if(pts.length>2&&AI22.routeFor!==id)x.closePath();
      x.setLineDash([8,6]);x.lineWidth=2.4;x.strokeStyle=AI22.routeFor===id?'#ffd36b':'rgba(224,35,59,.85)';x.stroke();x.setLineDash([]);
      pts.forEach((p,i)=>{const [px,py]=w2s7(v,p[0],p[1]);x.beginPath();x.arc(px,py,9,0,TAU10);x.fillStyle=AI22.routeFor===id?'#ffd36b':'#7a1a24';x.fill();x.lineWidth=1.5;x.strokeStyle='#fff';x.stroke();x.font='700 10px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=AI22.routeFor===id?'#2b1d00':'#fff';x.fillText(i+1,px,py+.5)});
      x.restore()});
  }
}
function aiOver22(x,v,g){
  const now=Date.now(),isM=isGM6();
  /* ondas sonoras */
  AI22.noise=AI22.noise.filter(n=>now-n.t0<n.dur);
  AI22.noise.forEach(n=>{const k=(now-n.t0)/n.dur,[sx,sy]=w2s7(v,n.x,n.y);for(let i=0;i<3;i++){const kk=(k*1.4-i*.18);if(kk<=0||kk>1)continue;x.save();x.globalAlpha=(1-kk)*.85;x.beginPath();x.arc(sx,sy,n.r*v.s*kk,0,TAU10);x.lineWidth=2.5+n.m*.15;x.strokeStyle=n.ok?'rgba(150,200,255,.9)':'rgba(255,190,90,.95)';x.stroke();x.restore()}
    if(k<.6){x.save();x.globalAlpha=1-k/.6;x.font='700 13px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='bottom';x.fillStyle='#ffe2a8';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=3;const tx=n.ok?'…':'CREEEEC!';x.strokeText(tx,sx,sy-14);x.fillText(tx,sx,sy-14);x.restore()}});
  if(AI22.noise.length)mapDraw7();
  /* ícones sobre os inimigos: ? investigando · ! alerta · 🏳 rendido */
  (M6.state.tokens||[]).forEach(t=>{
    const c=aiOf22(t.charId);if(!c)return;if(!mapTokVisible7(t))return;
    const s=c.st==='surr'?'surr':aiLive22(t.charId);
    const p=tokPos7(t),sz=(t.s||1)*g.cell*v.s,[sx,sy]=w2s7(v,g.ox+(p.x+(t.s||1)/2)*g.cell,g.oy+p.y*g.cell);
    const lab=s==='inv'?'?':s==='alert'?'!':s==='surr'?'🏳':'';
    if(isM&&VPAINT22===''&&!lab){x.save();x.font='11px system-ui';x.textAlign='center';x.textBaseline='bottom';x.fillText('☠',sx+sz*.42,sy+4);x.restore()}
    if(!lab)return;
    const bob=Math.sin(now/220)*2,y=sy-10+bob;x.save();x.beginPath();x.arc(sx,y-9,11,0,TAU10);x.fillStyle=s==='alert'?'#e0233b':s==='inv'?'#f2b310':'#f4ead6';x.fill();x.lineWidth=2;x.strokeStyle='#1b1410';x.stroke();
    x.font=s==='surr'?'12px system-ui':'900 15px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=s==='inv'?'#1b1410':'#fff';x.fillText(lab,sx,y-8.5);x.restore();
    if(s==='inv'||s==='alert')mapDraw7();
  });
}

/* ===================== 2. configuração do inimigo (menu do token) ===================== */
{const _mm22=mapMenu7;mapMenu7=function(t,e){
  const out=_mm22.apply(this,arguments);
  try{if(!t||!isGM6())return out;const ch=charById(t.charId);if(!ch||!(gmChar6(ch)||!ch.ownerId))return out;
    const m=$('mapMenu');if(!m||m.hidden)return out;const c=aiOf22(t.charId);
    const row=document.createElement('div');row.className='mm-row';
    row.innerHTML=`<button type="button" class="mt-chip ${c?'danger':''}" data-ai22>${c?(c.st==='surr'?'🏳 Inimigo rendido':'☠ Inimigo hostil')+' · configurar':'☠ Tornar inimigo hostil…'}</button>`;
    m.insertBefore(row,m.querySelector('[data-focus]')?.parentElement||null);
    row.querySelector('[data-ai22]').onclick=()=>{mapMenu7(null);aiModal22(t.charId)};
  }catch(err){console.warn('[T22] menu',err)}
  return out;
}}
function aiModal22(id){
  const ch=charById(id);if(!ch)return;const c=aiCfg22(aiAll22()[id]),tok=(M6.state.tokens||[]).find(q=>q.charId===id);
  const deg=a=>Math.round(((a*180/Math.PI)%360+360)%360);
  const curA=tok?deg(tokAng10(tok)):90,pts=route22(c);
  openModal('INIMIGO',nm(ch),`<div class="ai-form">
    <fieldset class="ai-f"><legend>Tipo de ficha</legend><label><input type="radio" name="aiH" value="0" ${c.h?'':'checked'}> NPC (neutro, sem cone)</label><label><input type="radio" name="aiH" value="1" ${c.h?'checked':''}> ☠ Inimigo hostil</label></fieldset>
    <fieldset class="ai-f"><legend>Comportamento</legend>
      <label><input type="radio" name="aiM" value="fixed" ${c.mode==='fixed'?'checked':''}> Fixo: parado olhando para uma direção (ou girando entre ângulos)</label>
      <label><input type="radio" name="aiM" value="patrol" ${c.mode==='patrol'?'checked':''}> Patrulha livre: anda pelo cômodo, respeitando paredes e portas fechadas</label>
      <label><input type="radio" name="aiM" value="route" ${c.mode==='route'?'checked':''}> Rota traçada: segue os pontos marcados no mapa, em volta</label></fieldset>
    <div class="ai-grid"><label>Abertura do cone (°)<input type="number" id="aiFov" min="20" max="300" step="5" value="${c.fov}"></label><label>Alcance da visão (m)<input type="number" id="aiRng" min="2" max="60" step="1" value="${c.rng}"></label>
      <label>Ângulos do giro (°, separados por vírgula)<input type="text" id="aiAngs" value="${esc(c.angs.join(', '))}" placeholder="vazio = olha para ${curA}°"></label><label>Tempo em cada ângulo (s)<input type="number" id="aiPer" min="1" max="30" step="1" value="${c.per}"></label></div>
    <p class="sub">0° = direita, 90° = baixo, 180° = esquerda, 270° = cima. A frente atual do token é ${curA}°.</p>
    <div class="ai-route"><span>Rota neste mapa: <b>${pts.length} ponto${pts.length===1?'':'s'}</b></span><button type="button" class="btn small" id="aiTrace">📍 Traçar rota no mapa</button></div>
    ${c.st==='surr'?'<label class="ai-surr"><input type="checkbox" id="aiUnsurr"> Voltar a ser hostil (tirar o 🏳 Rendido)</label>':''}
  </div>`,'Salvar',()=>{aiSave22(id);closeModal()});
  const tr=$('aiTrace');if(tr)tr.onclick=()=>{aiSave22(id,{mode:'route'});closeModal();routeStart22(id)};
}
function aiRead22(id,over){
  const old=aiCfg22(aiAll22()[id]),h=$q('input[name="aiH"]:checked')?.value==='1',mode=$q('input[name="aiM"]:checked')?.value||old.mode;
  const angs=String($('aiAngs')?.value||'').split(/[,;\s]+/).filter(s=>s.trim()!=='').map(Number).filter(n=>isFinite(n)).slice(0,8);
  return{...old,h:h?1:0,mode,fov:Number($('aiFov')?.value)||old.fov,rng:Number($('aiRng')?.value)||old.rng,angs,per:Number($('aiPer')?.value)||old.per,st:$('aiUnsurr')?.checked?'':old.st,...(over||{})};
}
function aiSave22(id,over){
  if(!isGM6())return;const next=aiCfg22(aiRead22(id,over));
  const all={...aiAll22()};if(!next.h&&!Object.keys(next.r||{}).length)delete all[id];else all[id]=next;
  setState6({ai:all});delete AI22.run[id];
  toast(next.h?`☠ ${nm(charById(id))} agora é inimigo hostil (${next.mode==='fixed'?'fixo':next.mode==='patrol'?'patrulha livre':'rota traçada'}).`:`${nm(charById(id))} voltou a ser NPC neutro.`);mapDraw7();
}
/* traçar rota: cada clique no mapa marca um ponto */
function routeStart22(id){
  AI22.routeFor=id;AI22.route=route22(aiCfg22(aiAll22()[id])).map(p=>[...p]);viewSet22('edit');
  let bar=$('aiRouteBar');if(!bar){bar=document.createElement('div');bar.id='aiRouteBar';bar.className='ai-routebar mt-row';MAP7.stage?.append(bar)}
  const draw=()=>{bar.innerHTML=`<span class="mt-chip on">📍 Rota de ${esc(nm(charById(id)))}: ${AI22.route.length} ponto${AI22.route.length===1?'':'s'}</span><span class="sub">Clique no mapa para marcar os pontos na ordem.</span><button type="button" class="mt-chip" data-rt="undo">↶ Desfazer ponto</button><button type="button" class="mt-chip" data-rt="ok">✓ Concluir</button><button type="button" class="mt-chip danger" data-rt="x">✕ Cancelar</button>`;
    $$('[data-rt]',bar).forEach(b=>b.onclick=()=>{const k=b.dataset.rt;if(k==='undo'){AI22.route.pop();draw();mapDraw7()}else routeEnd22(k==='ok')})};
  AI22.routeDraw=draw;draw();mapDraw7();toast('📍 Clique no mapa para marcar a rota. Enter conclui, Esc cancela.');
}
function routeEnd22(save){
  const id=AI22.routeFor;if(!id)return;
  if(save){const c=aiCfg22(aiAll22()[id]),k=M6.state.map?.key||'~blank';c.h=1;c.mode='route';c.r={...c.r,[k]:AI22.route.map(p=>[Math.round(p[0]),Math.round(p[1])])};const all={...aiAll22(),[id]:c};setState6({ai:all});delete AI22.run[id];toast(`✓ Rota salva com ${AI22.route.length} pontos.`)}
  AI22.routeFor=null;AI22.route=[];$('aiRouteBar')?.remove();mapDraw7();
}
{const _cbd22=T3.cbDown;T3.cbDown=(e,p)=>{
  if(AI22.routeFor&&isGM6()&&e.button!==2&&e.button!==1){AI22.route.push([Math.round(p.wx),Math.round(p.wy)]);if(AI22.route.length>40)AI22.route.shift();AI22.routeDraw?.();mapDraw7();return true}
  return _cbd22?_cbd22(e,p):false}}
document.addEventListener('keydown',e=>{if(!AI22.routeFor)return;if(e.key==='Enter'){e.preventDefault();routeEnd22(true)}else if(e.key==='Escape'){e.preventDefault();routeEnd22(false)}});

/* ===================== IA (roda no aparelho do Mestre) ===================== */
const g2p22=(t,x,y)=>{const g=mapCfg7(),s=t.s||1;return[g.ox+(x+s/2)*g.cell,g.oy+(y+s/2)*g.cell]};
const tk22=(x,y,a)=>[(+x).toFixed(3),(+y).toFixed(3),a==null?'':(+a).toFixed(3)].join(',');
const p2g22=(t,cx,cy)=>{const g=mapCfg7(),s=t.s||1;return[(cx-g.ox)/g.cell-s/2,(cy-g.oy)/g.cell-s/2]};
function aiState22(t){
  let R=AI22.run[t.charId];
  const l=MAP7.live[t.id],fresh=l&&l.until>Date.now()&&!(Math.abs(l.x-t.x)<.02&&Math.abs(l.y-t.y)<.02&&t.a!=null);
  if(!R||R.tok!==t.id||R.map!==(M6.state.map?.key||'~blank')){
    const x=fresh?l.x:t.x,y=fresh?l.y:t.y,a=fresh&&l.a!=null?l.a:(t.a!=null?t.a:Math.PI/2);
    R=AI22.run[t.charId]={tok:t.id,map:M6.state.map?.key||'~blank',x,y,a,home:{x,y,a},wp:-1,tgt:null,stuck:0,wait:Math.random()*1.5,inv:null,s:'',look:0,ang0:a,angI:0,angT:0,moved:false,lastP:[x,y],ts:tk22(t.x,t.y,t.a)};
  }
  return R;
}
function aiStatus22(id,s,dur=6000){const prev=AI22.live[id];AI22.live[id]={s,until:Date.now()+dur};if(!prev||prev.s!==s||prev.until-Date.now()<dur*.5){const n=Date.now();if(n-(AI22.castAt[id+s]||0)>1200){AI22.castAt[id+s]=n;cast6({t:'ai',id,s,dur})}}}
/* ponto aleatório dentro do cômodo do inimigo, com linha livre até ele */
function wanderPt22(t,R){
  const g=mapCfg7(),[cx,cy]=g2p22(t,R.x,R.y),geo=geo10(),room=smallestRoom10(roomAt10(geo.rooms,...g2p22(t,R.home.x,R.home.y)))||smallestRoom10(roomAt10(geo.rooms,cx,cy));
  const segs=blockers10();
  for(let i=0;i<16;i++){
    let px,py;
    if(room){const xs=room.pts.map(p=>p[0]),ys=room.pts.map(p=>p[1]);px=Math.min(...xs)+Math.random()*(Math.max(...xs)-Math.min(...xs));py=Math.min(...ys)+Math.random()*(Math.max(...ys)-Math.min(...ys));if(!inPoly10(px,py,room.pts))continue;if(distPoly10(px,py,room.pts)<g.cell*.6)continue}
    else{const [hx,hy]=g2p22(t,R.home.x,R.home.y),a=Math.random()*TAU10,d=(1+Math.random()*4)*g.cell;px=hx+Math.cos(a)*d;py=hy+Math.sin(a)*d}
    const d=hyp10(px-cx,py-cy);if(d<g.cell)continue;
    if(castRay10(cx,cy,(px-cx)/d,(py-cy)/d,segs,d)>=d-2)return[px,py];
  }
  return null;
}
function walk22(t,R,tx,ty,spd,dt){
  const g=mapCfg7(),[cx,cy]=g2p22(t,R.x,R.y),dx=tx-cx,dy=ty-cy,d=hyp10(dx,dy);
  if(d<g.cell*.18)return true;
  const step=Math.min(d,spd*g.cell*dt),want=Math.atan2(dy,dx);
  R.a=normAng10(R.a+angDiff10(want,R.a)*Math.min(1,dt*7));
  const [nx,ny]=collide10(cx,cy,cx+dx/d*step,cy+dy/d*step,tokR10(t),blockers10());
  const moved=hyp10(nx-cx,ny-cy);[R.x,R.y]=p2g22(t,nx,ny);R.moved=true;
  if(moved<step*.25){R.stuck+=dt;if(R.stuck>1.4){R.stuck=0;return'stuck'}}else R.stuck=0;
  return false;
}
function turn22(R,want,dt,sp=2.2){const d=angDiff10(want,R.a);if(Math.abs(d)<.01)return true;R.a=normAng10(R.a+Math.sign(d)*Math.min(Math.abs(d),sp*dt));R.moved=true;return false}
function aiMove22(t,c,R,dt){
  if(R.inv){
    const I=R.inv;
    if(I.phase==='go'){const r=walk22(t,R,I.x,I.y,SPD22.inv,dt);if(r===true||r==='stuck'||Date.now()>I.give){I.phase='look';I.lookT=3.2;I.base=R.a}}
    else if(I.phase==='look'){I.lookT-=dt;turn22(R,I.base+Math.sin((3.2-I.lookT)*2.2)*1.1,dt,3);if(I.lookT<=0){R.inv=null;R.s='back';R.tgt=null}}
    aiStatus22(t.charId,'inv',1500);return;
  }
  if(c.mode==='fixed'){
    if(R.s==='back'){const [hx,hy]=g2p22(t,R.home.x,R.home.y);const r=walk22(t,R,hx,hy,SPD22.back,dt);if(r===true||r==='stuck'){R.s='';}return}
    const angs=c.angs.length?c.angs.map(a=>a*Math.PI/180):[R.home.a];
    if(angs.length>1){R.angT+=dt;if(R.angT>=c.per){R.angT=0;R.angI=(R.angI+1)%angs.length}}
    turn22(R,angs[R.angI%angs.length],dt,1.6);return;
  }
  if(c.mode==='route'){
    const pts=route22(c);if(!pts.length){turn22(R,R.home.a,dt);return}
    if(R.wait>0){R.wait-=dt;return}
    if(R.wp<0||R.wp>=pts.length){const [cx,cy]=g2p22(t,R.x,R.y);let bi=0,bd=Infinity;pts.forEach((p,i)=>{const d=hyp10(p[0]-cx,p[1]-cy);if(d<bd){bd=d;bi=i}});R.wp=bi}
    const p=pts[R.wp],r=walk22(t,R,p[0],p[1],SPD22.route,dt);
    if(r===true||r==='stuck'){R.wp=(R.wp+1)%pts.length;R.wait=r===true?.6:0}
    return;
  }
  /* patrulha livre */
  if(R.wait>0){R.wait-=dt;R.look+=dt;turn22(R,R.ang0+Math.sin(R.look*1.4)*.9,dt,1.4);return}
  if(!R.tgt){R.tgt=wanderPt22(t,R);if(!R.tgt){R.wait=1.5;R.ang0=R.a;return}}
  const r=walk22(t,R,R.tgt[0],R.tgt[1],SPD22.patrol,dt);
  if(r===true||r==='stuck'){R.tgt=null;R.wait=.8+Math.random()*1.8;R.ang0=R.a;R.look=0}
}
/* o inimigo enxerga o jogador? (dentro do cone, sem parede no meio) */
function sees22(t,c,R,pt){
  const P=aiPoly22(t,c,{x:R.x,y:R.y,a:R.a});if(!P)return false;
  const [px,py]=tokCenter10(pt);if(hyp10(px-P.ox,py-P.oy)>P.r)return false;
  /* no escuro, quem está com a lanterna acesa é visto de mais longe */
  return inPoly10(px,py,P.poly)||(geo10().dark&&torchOn10(pt)&&hyp10(px-P.ox,py-P.oy)<=P.r/.55&&inPoly10(px,py,visPoly10(P.ox,P.oy,R.a,c.fov*Math.PI/180,P.r/.55)));
}
const sameRoom22=(a,b)=>{const rs=geo10().rooms;if(!rs.length)return false;const A=roomAt10(rs,...tokCenter10(a)).map(r=>r.id),B=new Set(roomAt10(rs,...tokCenter10(b)).map(r=>r.id));return A.some(id=>B.has(id))};
const near22=(a,b,cells)=>{const [ax,ay]=tokCenter10(a),[bx,by]=tokCenter10(b);return hyp10(ax-bx,ay-by)<=cells*mapCfg7().cell};
const group22=(a,b)=>sameRoom22(a,b)||(!geo10().rooms.length&&near22(a,b,6));
function aiTick22(){
  if(!realGM22()||!camp3()||!MAP7.cv||!MAP7.cv.isConnected)return;
  const now=performance.now(),dt=Math.min(.2,Math.max(0,(now-(AI22.last||now))/1000));AI22.last=now;
  AI22.tick++;const hs=hostTok22();if(!hs.length&&!M6.state.aiCb)return;
  const order=cbOrder22(),players=playerTok22(),seenBy=[];
  hs.forEach(t=>{
    const c=aiCfg22(aiOf22(t.charId)),R=aiState22(t);
    if((MAP7.drag&&MAP7.drag.id===t.id)||MOV10.id===t.id){const l=MAP7.live[t.id],q=l&&l.until>Date.now()?l:t;R.x=q.x;R.y=q.y;R.a=q.a!=null?q.a:R.a;R.home={x:R.x,y:R.y,a:R.a};return}
    /* o Mestre reposicionou o token por fora (menu, arrasto confirmado, troca de mapa): a IA parte da nova posição */
    {const k=tk22(t.x,t.y,t.a);if(R.ts!==k){if(R.pc===k)R.ts=k;else{R.x=t.x;R.y=t.y;if(t.a!=null)R.a=t.a;R.home={x:R.x,y:R.y,a:R.a};R.inv=null;R.tgt=null;R.wp=-1;R.ts=k;delete MAP7.live[t.id]}}}
    const inCb=order.includes(t.charId);
    if(inCb){const q=MAP7.live[t.id]&&MAP7.live[t.id].until>Date.now()?MAP7.live[t.id]:t;R.x=q.x;R.y=q.y;if(q.a!=null)R.a=q.a}
    else{R.moved=false;aiMove22(t,c,R,dt);
      if(R.moved){MAP7.live[t.id]={x:R.x,y:R.y,a:R.a,until:Date.now()+60000};AI22.dirty.add(t.id);const n=Date.now();if(n-(R.castAt||0)>140){R.castAt=n;cast6({t:'tok',id:t.id,x:+R.x.toFixed(3),y:+R.y.toFixed(3),a:+R.a.toFixed(3)})}}}
    if(AI22.tick%3===0)players.forEach(pt=>{if(order.includes(pt.charId)&&inCb)return;if(sees22(t,c,R,pt))seenBy.push([t,pt])});
  });
  if(AI22.dirty.size){mapDraw7();if(Date.now()-AI22.commitAt>4000)aiCommit22()}
  if(seenBy.length&&Date.now()-AI22.engAt>1500){AI22.engAt=Date.now();engage22(seenBy)}
  if(Date.now()-(AI22.disAt||0)>1000){AI22.disAt=Date.now();disengage22()}
}
function aiCommit22(){
  if(!AI22.dirty.size)return;AI22.commitAt=Date.now();const ids=new Set(AI22.dirty);AI22.dirty.clear();
  setState6({tokens:(M6.state.tokens||[]).map(q=>{if(!ids.has(q.id))return q;const R=AI22.run[q.charId];if(!R)return q;const n={...q,x:+R.x.toFixed(3),y:+R.y.toFixed(3),a:+R.a.toFixed(3)};R.pc=tk22(n.x,n.y,n.a);return n})});
}
setInterval(()=>{try{aiTick22()}catch(e){console.warn('[T22] IA',e)}},50);
setInterval(()=>{try{if(realGM22()&&AI22.dirty.size&&Date.now()-AI22.commitAt>1500)aiCommit22()}catch(e){}},1500);

/* ---------- combate híbrido ---------- */
async function engage22(pairs){
  const order=cbOrder22(),players=playerTok22(),hosts=hostTok22(),ids=new Set(),who=[];
  pairs.forEach(([e,p])=>{
    ids.add(e.charId);ids.add(p.charId);who.push([nm(charById(p.charId)),nm(charById(e.charId))]);
    players.forEach(q=>{if(q!==p&&group22(q,p))ids.add(q.charId)});
    hosts.forEach(q=>{if(q!==e&&group22(q,e))ids.add(q.charId)});
    aiStatus22(e.charId,'alert',4000);const R=AI22.run[e.charId];if(R){R.inv=null;R.tgt=null}
  });
  const fresh=[...ids].filter(id=>!order.includes(id)&&charById(id));
  if(!fresh.length)return;
  const [pn,en]=who[0];
  cast6({t:'ai',kind:'seen',who:pn,by:en});toast(`⚔ ${pn} foi visto por ${en}!`);fx5('start');
  aiCommit22();
  if(order.length)await cbAdd22(fresh);else await cbStart22(fresh);
}
async function cbStart22(ids){
  const c=camp3();if(!c||!isGM6())return;
  const list=ids.map(charById).filter(Boolean);if(!list.length)return;
  const rolls=list.map(ch=>({id:ch.id,name:nm(ch),...reflex14(ch)})).sort((a,b)=>b.total-a.total||b.best-a.best||a.name.localeCompare(b.name,'pt-BR'));
  try{
    try{await sb()?.from('campaign_reflex_rolls').delete().eq('campaign_id',c.id)}catch(e){}
    await window.tulpaSaveCombatState({active:true,phase:'active',round:1,turnIndex:0,participants:rolls.map(r=>({characterId:r.id,name:r.name,rolled:true})),order:rolls.map(r=>({characterId:r.id,name:r.name,done:false}))});
  }catch(e){fail3('iniciar combate',e);return}
  setState6({aiCb:{on:true,at:Date.now()}});
  CB.pending={};CB.log=[];
  const first=charById(rolls[0].id);
  insertRow(first,'Iniciativa',{dice:[],bonus:0,total:rolls[0].total,detail:{cmb:'init',rolls:rolls.map(r=>({id:r.id,name:r.name,dice:r.dice,total:r.total}))}}).catch(e=>fail3('iniciativa',e));
  rolls.forEach(r=>{const ch=charById(r.id);if(ch)insertRow(ch,'Iniciativa · Reflexo',{dice:r.dice,bonus:r.bonus,total:r.total,attribute:'Destreza',detail:{cmb:'rollx',sides:20,eyebrow:'INICIATIVA',quiet:true}}).catch(()=>{})});
  initPanel14(rolls);
  setTimeout(()=>{try{renderTable()}catch(e){}hud14(true)},200);
}
async function cbAdd22(ids){
  const c=camp3(),cm=c?.combat;if(!cm?.active)return cbStart22(ids);
  const list=ids.map(charById).filter(Boolean);if(!list.length)return;
  const rolls=list.map(ch=>({id:ch.id,name:nm(ch),...reflex14(ch)}));
  const st={...cm,participants:[...(cm.participants||[]),...rolls.map(r=>({characterId:r.id,name:r.name,rolled:true}))],order:[...(cm.order||[]),...rolls.map(r=>({characterId:r.id,name:r.name,done:false}))]};
  try{await window.tulpaSaveCombatState(st)}catch(e){fail3('entrar no combate',e);return}
  rolls.forEach(r=>{const ch=charById(r.id);if(ch)insertRow(ch,'Entra no combate · Reflexo',{dice:r.dice,bonus:r.bonus,total:r.total,attribute:'Destreza',detail:{cmb:'rollx',sides:20,eyebrow:'ENTRA NO COMBATE'}}).catch(()=>{})});
  toast(`⚔ Entram no combate: ${rolls.map(r=>r.name).join(', ')} (no fim da ordem).`);
  setTimeout(()=>{try{renderTable()}catch(e){}hud14(true)},200);
}
async function cbRemove22(ids,why){
  const c=camp3(),cm=c?.combat;if(!cm?.active||!ids.length)return;
  const o=cm.order||[],curId=o[Math.min(cm.turnIndex||0,o.length-1)]?.characterId,rm=new Set(ids);
  const order=o.filter(e=>!rm.has(e.characterId));
  if(!order.length){await cbEnd22();return}
  let ti=order.findIndex(e=>e.characterId===curId);if(ti<0)ti=Math.min(o.slice(0,cm.turnIndex||0).filter(e=>!rm.has(e.characterId)).length,order.length-1);
  try{await window.tulpaSaveCombatState({...cm,order,participants:(cm.participants||[]).filter(p=>!rm.has(p.characterId)),turnIndex:ti})}catch(e){fail3('sair do combate',e);return}
  const names=ids.map(id=>nm(charById(id))).join(', ');toast(`🏃 ${names} ${why}`);cast6({t:'ai',kind:'left',names,why});
  setTimeout(()=>{try{renderTable()}catch(e){}hud14(true)},200);
}
async function cbEnd22(){AI22.autoEnd=true;try{await window.tulpaEndCombat?.()}finally{AI22.autoEnd=false}if(isGM6())setState6({aiCb:null});toast('🕊 Ninguém mais em contato: o combate acabou.')}
/* sem contato por 5 s: o inimigo (ou o jogador) sai do combate; sem inimigos hostis, o combate acaba */
function disengage22(){
  const cm=camp3()?.combat;
  if(!(cm?.active&&cm.phase==='active')){if(M6.state.aiCb&&isGM6())setState6({aiCb:null});AI22.lastEng={};return}
  if(!M6.state.aiCb)return;
  const order=cbOrder22(),toks=M6.state.tokens||[],tk=id=>toks.find(t=>t.charId===id);
  const en=order.filter(id=>{const c=aiOf22(id);return c&&c.st!=='surr'&&alive22(charById(id))}).map(tk).filter(Boolean);
  const pl=order.filter(id=>{const ch=charById(id);return ch&&!aiOf22(id)&&alive22(ch)}).map(tk).filter(Boolean);
  if(!en.length){cbEnd22();return}
  if(!pl.length){cbEnd22();return}
  const now=Date.now(),contact=(e,p)=>{const c=aiCfg22(aiOf22(e.charId)),[ex,ey]=tokCenter10(e),[px,py]=tokCenter10(p),d=hyp10(px-ex,py-ey),rng=c.rng/mapCfg7().mpc*mapCfg7().cell;return sameRoom22(e,p)||(d<=rng*1.4&&los14(ex,ey,px,py))};
  const out=[];
  [...en,...pl].forEach(t=>{const other=en.includes(t)?pl:en;if(other.some(o=>contact(en.includes(t)?t:o,en.includes(t)?o:t)))AI22.lastEng[t.charId]=now;else{if(!AI22.lastEng[t.charId])AI22.lastEng[t.charId]=now;if(now-AI22.lastEng[t.charId]>5000)out.push(t.charId)}});
  if(!out.length)return;
  out.forEach(id=>delete AI22.lastEng[id]);
  const outE=out.filter(id=>aiOf22(id)),outP=out.filter(id=>!aiOf22(id));
  if(outE.length===en.length||outP.length===pl.length){cbEnd22();return}
  cbRemove22(out,outE.length&&!outP.length?'perdeu o contato e saiu do combate.':'saiu do alcance e voltou ao tempo real.');
}
/* quem não está na ordem do combate anda livre (tempo real) */
{const _cbm22=T3.cbMove;T3.cbMove=(t,cx,cy,nx,ny,how)=>{if(inCb14()&&!cbOrder22().includes(t.charId))return[nx,ny];return _cbm22?_cbm22(t,cx,cy,nx,ny,how):[nx,ny]}}
/* Mestre encerrou na mão com inimigos vivos: viram Rendidos / Neutros */
function wrapEnd22(){
  const f=window.tulpaEndCombat;if(!f||f.__t22)return;
  const w=async function(){
    if(!AI22.autoEnd&&realGM22()){try{const order=cbOrder22(),all={...aiAll22()},rs=[];order.forEach(id=>{const c=all[id];if(c&&c.h&&c.st!=='surr'&&alive22(charById(id))){all[id]={...c,st:'surr'};rs.push(nm(charById(id)))}});
      if(rs.length){setState6({ai:all,aiCb:null});toast(`🏳 Rendidos: ${rs.join(', ')}. Os cones deles foram desligados.`);cast6({t:'ai',kind:'surr',names:rs.join(', ')})}}catch(e){console.warn('[T22] rendição',e)}}
    return f.apply(this,arguments);
  };w.__t22=true;window.tulpaEndCombat=w;
}
setInterval(wrapEnd22,1000);wrapEnd22();

/* ===================== 3. portas furtivas e som ===================== */
const _door22=doorUse10;
function enemiesNear22(w,cells=12){const [mx,my]=[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2],cell=mapCfg7().cell;return hostTok22().filter(t=>{const [x,y]=tokCenter10(t);return hyp10(x-mx,y-my)<=cells*cell})}
doorUse10=function(w,t){
  {const cd=TAC10.doorCd;if(w&&cd&&cd[w.id]&&Date.now()-cd[w.id]<DOOR_CD10){toast('⏳ A porta acabou de ser usada. Aguarde um instante.');return}}
  if(isGM6()||!t||!w?.door||(w.door.locked)||!enemiesNear22(w).length||AI22.doorSkip)return _door22.apply(this,arguments);
  const open=!doorOpen10(w),verb=open?'Abrir':'Fechar';
  openModal('PORTA',`${verb} a porta`,`<p>Há inimigos por perto. Como ${open?'abrir':'fechar'}?</p><div class="ai-door"><button type="button" class="btn" id="dr22n">🚪 ${verb} normal<br><span class="sub">rápido, faz barulho de porta</span></button><button type="button" class="btn primary" id="dr22s">🤫 ${verb} furtivamente<br><span class="sub">Destreza + Furtividade, DT ${dtDoor22()}</span></button></div>`,'Cancelar',()=>closeModal());
  $('dr22n').onclick=()=>{closeModal();AI22.doorSkip=true;try{_door22(w,t)}finally{AI22.doorSkip=false}noise22(w,{m:3,ok:false,normal:true})};
  $('dr22s').onclick=()=>{closeModal();doorStealth22(w,t,open)};
};
T3.doorUse=w=>doorUse10(w,ctlTok10());
function doorStealth22(w,t,open){
  const ch=charById(t.charId);if(!ch)return;
  const d=d14(ch),r=doRoll({data:d,vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},'Furtividade'),DT=dtDoor22(),ok=r.total>=DT,m=Math.max(1,DT-r.total);
  insertRow(ch,'Furtividade · porta',{dice:r.dice,bonus:r.bonus,total:r.total,attribute:'Destreza',detail:{cmb:'rollx',sides:20,eyebrow:ok?'PORTA EM SILÊNCIO':'A PORTA RANGEU'}}).catch(()=>{});
  const key=geoKey10();TAC10.doorLive[w.id]={open,until:Date.now()+8000};TAC10.blkSig='';
  if(ok){cast6({t:'door',k:key,id:w.id,open,q:1});softDoor22();toast(`🤫 ${r.total} contra DT ${DT}: a porta ${open?'abriu':'fechou'} sem um ruído.`);noise22(w,{m:0,ok:true})}
  else{cast6({t:'door',k:key,id:w.id,open,q:1});creak22(m);toast(`💥 ${r.total} contra DT ${DT}: a porta rangeu alto (margem ${m}).`);noise22(w,{m,ok:false})}
  mapDraw7();doorSave10(key,w.id);
}
/* sons: porta abafada e rangido que cresce com a margem da falha */
function softDoor22(){try{const c=actx();if(!c||!vol5())return;const t=c.currentTime+.01;n5(t,.05,{freq:600,type:'lowpass',gain:.05,wet:.1});o5('sine',120,t+.02,.12,{to:90,gain:.03,wet:.2})}catch(e){}}
function creak22(m){
  try{const c=actx();if(!c||!vol5())return;const t=c.currentTime+.01,k=Math.min(1,.25+m*.07),v=vol5();
    const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';let fr=90+m*7;
    for(let i=0;i<28;i++){fr=Math.max(70,Math.min(260+m*10,fr+(Math.random()-.35)*(30+m*3)));o.frequency.setValueAtTime(fr,t+i*.035)}
    f.type='bandpass';f.frequency.value=900+m*60;f.Q.value=6;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06+.22*k*v,t+.08);g.gain.setValueAtTime(.05+.2*k*v,t+.85);g.gain.exponentialRampToValueAtTime(.0001,t+1.1);
    o.connect(f);f.connect(g);send5(g,.4);o.start(t);o.stop(t+1.15);
    if(m>=4){n5(t+1,.25,{freq:180,type:'lowpass',gain:.2*k,wet:.4});o5('sine',70,t+1,.35,{to:40,gain:.2*k,wet:.3})}
  }catch(e){}
}
/* onda sonora: desenhada em todos os aparelhos; o Mestre manda os inimigos no alcance investigarem */
function noise22(w,{m,ok,normal}){
  const [x,y]=[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2],cell=mapCfg7().cell,r=ok?cell*1.2:(normal?5:6+m*.9)*cell;
  const n={x,y,r:Math.min(r,cell*22),m:m||0,ok:!!ok,t0:Date.now(),dur:ok?900:1600+m*80,k:geoKey10()};
  AI22.noise.push(n);cast6({t:'noise',...n,t0:undefined});if(isGM6())hear22(n);mapDraw7();
}
function hear22(n){
  if(n.ok||!realGM22())return;const segs=blockers10();
  hostTok22().forEach(t=>{if(cbOrder22().includes(t.charId))return;const [ex,ey]=tokCenter10(t),d=hyp10(ex-n.x,ey-n.y);if(d>n.r)return;
    const blocked=castRay10(n.x,n.y,(ex-n.x)/(d||1),(ey-n.y)/(d||1),segs,d)<d-2;if(blocked&&d>n.r*.65)return; /* parede abafa: só ouve de mais perto */
    const R=aiState22(t);R.inv={x:n.x,y:n.y,phase:'go',give:Date.now()+12000};R.tgt=null;R.wait=0;aiStatus22(t.charId,'inv',9000)});
}
onCast6(p=>{
  if(p.t==='noise'&&p.k===geoKey10()&&isFinite(p.x)&&isFinite(p.y)){const n={x:+p.x,y:+p.y,r:+p.r||100,m:+p.m||0,ok:!!p.ok,t0:Date.now(),dur:+p.dur||1500};AI22.noise.push(n);if(!n.ok&&p.from!==uid3())creak22(n.m*.6);if(isGM6())hear22(n);mapDraw7()}
  if(p.t==='ai'&&p.id&&p.s){AI22.live[p.id]={s:p.s,until:Date.now()+(Number(p.dur)||6000)};mapDraw7()}
  if(p.t==='ai'&&p.kind==='seen'&&!isGM6()){toast(`⚔ ${String(p.who||'Alguém').slice(0,40)} foi visto por ${String(p.by||'um inimigo').slice(0,40)}!`);fx5('start')}
  if(p.t==='ai'&&p.kind==='surr'&&!isGM6())toast(`🏳 Rendidos: ${String(p.names||'').slice(0,120)}.`);
  if(p.t==='ai'&&p.kind==='left'&&!isGM6())toast(`🏃 ${String(p.names||'').slice(0,80)} ${String(p.why||'').slice(0,80)}`);
});
M6.hooks.leave.push(()=>{AI22.run={};AI22.live={};AI22.noise=[];AI22.dirty.clear();AI22.lastEng={};if(AI22.routeFor)routeEnd22(false)});
T3.aiModal=aiModal22;T3.aiDbg={playerTok22,sees22,aiState22,engage22,cbRemove22,disengage22,hear22,noise22,aiTick22,aiPoly22,aiCfg22};

/* ===================================================================
   TULPA · ETAPA 23 — mapa limpo, furtividade por proximidade, portas
   para NPCs e inimigos, rolagens privadas e alerta sonoro direcional
   =================================================================== */
const AI23={hov:null,pair:{},mv:{},alerts:[],marks:[],doorAt:{},off:false};

/* ---------- 1. mapa limpo: nome e barras só no token em foco ---------- */
T3.tokFocus=(t,ch)=>!!t&&(MAP7.sel===t.id||AI23.hov===t.id||(!!ch&&curEntry()?.characterId===ch.id));
function hovBind23(){
  const cv=MAP7.cv;if(!cv||cv.__h23)return;cv.__h23=1;
  cv.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;try{const p=mapPt7(e),t=mapHit7(p.wx,p.wy),id=t?t.id:null;if(id!==AI23.hov){AI23.hov=id;mapDraw7()}}catch(err){}});
  cv.addEventListener('pointerleave',()=>{if(AI23.hov){AI23.hov=null;mapDraw7()}});
}
setInterval(()=>{try{if(!document.hidden)hovBind23()}catch(e){}},1000);

/* ---------- rolagem privada: só quem rolou vê (o Mestre vê as dos NPCs) ---------- */
function privCard23(p){
  let box=$('priv23');if(!box){box=document.createElement('div');box.id='priv23';box.className='priv23';box.setAttribute('aria-live','polite');document.body.append(box)}
  const r=p.r||{},ok=!!p.ok,c=document.createElement('div');c.className='priv23-card '+(ok?'ok':'bad');
  const dice=(Array.isArray(r.dice)?r.dice:[]).join(' · '),b=Number(r.bonus)||0;
  c.innerHTML=`<div class="priv23-top"><span class="priv23-tag">🔒 Só você vê</span><button type="button" class="priv23-x" aria-label="Fechar">✕</button></div>
    <b class="priv23-n">${esc(String(p.who||'').slice(0,60))}</b><span class="priv23-l">${esc(String(p.label||'Furtividade').slice(0,80))}</span>
    <div class="priv23-roll"><span class="priv23-tot">${Number(r.total)||0}</span><span class="priv23-vs">contra DT ${Number(p.DT)||0}<br><small>🎲 ${esc(dice||'—')}${b?` ${b>0?'+':'−'} ${Math.abs(b)}`:''}</small></span></div>
    <div class="priv23-res">${ok?'🤫 Passou em silêncio':'💥 Fez barulho'}${p.note?` · ${esc(String(p.note).slice(0,60))}`:''}</div>`;
  box.prepend(c);c.querySelector('.priv23-x').onclick=()=>c.remove();
  while(box.children.length>3)box.lastChild.remove();
  setTimeout(()=>{c.classList.add('out');setTimeout(()=>c.remove(),420)},7500);
  try{window.tulpaPerseus?.react(ok?'sneak':'noise')}catch(e){}
}
T3.privCard=privCard23;
const side23=ch=>isFoe22(ch)?'foe':'ally';
function stealthRoll23(ch){return doRoll({data:d14(ch),vocations:ch.vocations||vocations,tracks:ch.tracks||tracks},'Furtividade')}
/* entrega o resultado só para quem deve ver */
function showPriv23(ch,payload){
  const owner=ch&&ch.ownerId&&!gmChar6(ch)?ch.ownerId:null;
  if(owner&&owner!==uid3()){cast6({t:'priv23',to:owner,...payload});return}
  if(!owner&&!isGM6())return;
  privCard23(payload);
}
/* DT de perceber alguém: 10 + Percepção do inimigo (entre 10 e 20) */
const percDT23=ech=>Number(AI23.dt)||clamp12(E.regra('furtDTBase')+(Number(dOf6(ech)?.attributes?.['Percepção'])||0)*E.regra('furtPorPer'),5,30);
/* raio de audição do inimigo, em quadrados */
const hearR23=c=>clamp12(c.rng/mapCfg7().mpc*.45,2,5);

/* ---------- som: onda, "!" no local e seta para quem ouviu ---------- */
function noiseAt23(x,y,{m=0,ok=false,normal=false,src='ally',rc=0}={}){
  const cell=mapCfg7().cell,r=Math.min(rc?rc*cell:ok?cell*1.2:(normal?5:6+m*.9)*cell,cell*22);
  const n={x:+x.toFixed(1),y:+y.toFixed(1),r:Math.round(r),m:Math.round(m),ok:!!ok,src,dur:ok?900:1600+m*80,k:geoKey10()};
  cast6({t:'noise23',...n});recvNoise23(n,true);
}
function recvNoise23(n,local){
  if(n.k!==geoKey10()||!isFinite(n.x)||!isFinite(n.y))return;
  const now=Date.now(),gm=isGM6(),N={x:+n.x,y:+n.y,r:+n.r||100,m:+n.m||0,ok:!!n.ok,t0:now,dur:+n.dur||1500},ally=n.src!=='foe';
  if(gm||ally)AI22.noise.push(N);                 /* o Mestre vê todas as ondas; os jogadores, as dos aliados */
  if(!N.ok){
    if(ally){AI23.marks.push({x:N.x,y:N.y,t0:now,dur:3400});if(!local)creak22(N.m*.6)}
    else if(!gm){                                  /* um inimigo fez barulho: quem está no alcance ouve e vê a seta */
      const mine=myToks10().filter(t=>{const [x,y]=tokCenter10(t);return hyp10(x-N.x,y-N.y)<=N.r*1.15});
      if(mine.length){const [tx,ty]=tokCenter10(mine[0]);AI23.alerts.push({x:N.x,y:N.y,t0:now,dur:4500});creak22(N.m*.6);toast(`👂 Você ouviu um barulho ${dir23(N.x-tx,N.y-ty)}.`);try{window.tulpaPerseus?.react('noise')}catch(e){}}
    }else if(!local)creak22(N.m*.5);
  }
  if(gm&&ally&&!N.ok)hear22(N);
  mapDraw7();
}
const DIRS23=['a leste','a sudeste','ao sul','a sudoeste','a oeste','a noroeste','ao norte','a nordeste'];
const dir23=(dx,dy)=>DIRS23[((Math.round(Math.atan2(dy,dx)/(Math.PI/4))%8)+8)%8];
/* as portas da Etapa 22 passam a usar o som novo */
noise22=function(w,o){noiseAt23((w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2,{...(o||{}),src:'ally'})};
onCast6(p=>{
  if(p.from&&p.from===uid3())return;
  if(p.t==='priv23'&&p.to===uid3())privCard23(p);
  if(p.t==='noise23')recvNoise23(p,false);
});
function bang23(x,sx,sy,al){x.save();x.globalAlpha=al;x.beginPath();x.arc(sx,sy,12,0,TAU10);x.fillStyle='#e0233b';x.shadowColor='rgba(255,40,40,.9)';x.shadowBlur=12;x.fill();x.shadowBlur=0;x.lineWidth=2;x.strokeStyle='#1b1410';x.stroke();x.font='900 16px "IBM Plex Sans",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText('!',sx,sy+1);x.restore()}
function arrow23(x,px,py,a,al){x.save();x.globalAlpha=al;x.translate(px,py);x.rotate(a);x.beginPath();x.moveTo(15,0);x.lineTo(-7,-10);x.lineTo(-2,0);x.lineTo(-7,10);x.closePath();x.fillStyle='#ff4a3d';x.shadowColor='rgba(255,40,40,.9)';x.shadowBlur=10;x.fill();x.shadowBlur=0;x.lineWidth=1.6;x.strokeStyle='#1b1410';x.stroke();x.restore()}
function over23(x,v,g){
  const now=Date.now();AI23.marks=AI23.marks.filter(a=>now-a.t0<a.dur);AI23.alerts=AI23.alerts.filter(a=>now-a.t0<a.dur);
  AI23.marks.forEach(a=>{const [sx,sy]=w2s7(v,a.x,a.y),k=(now-a.t0)/a.dur;bang23(x,sx,sy-16+Math.sin(now/170)*2.5,k>.75?1-(k-.75)/.25:1)});
  if(AI23.alerts.length){
    const t=ctlTok10()||myToks10()[0];
    if(t)AI23.alerts.forEach(a=>{
      const k=(now-a.t0)/a.dur,al=k>.75?1-(k-.75)/.25:1,[wx,wy]=tokCenter10(t),ang=Math.atan2(a.y-wy,a.x-wx),[cx,cy]=w2s7(v,wx,wy),R=tokR10(t)*v.s+20+Math.sin(now/150)*3;
      const on=cx>30&&cy>30&&cx<v.cw-30&&cy<v.ch-30;
      if(on){const px=cx+Math.cos(ang)*R,py=cy+Math.sin(ang)*R;arrow23(x,px,py,ang,al);bang23(x,cx+Math.cos(ang)*(R+24),cy+Math.sin(ang)*(R+24),al)}
      else{/* fora da tela: seta na borda */
        const [nx,ny]=w2s7(v,a.x,a.y),mx=v.cw/2,my=v.ch/2,dx=nx-mx,dy=ny-my,s=Math.min((v.cw/2-34)/Math.max(1,Math.abs(dx)),(v.ch/2-34)/Math.max(1,Math.abs(dy))),ex=mx+dx*s,ey=my+dy*s,an=Math.atan2(dy,dx);
        arrow23(x,ex,ey,an,al);bang23(x,ex-Math.cos(an)*24,ey-Math.sin(an)*24,al)}
    });
  }
  if(AI23.marks.length||AI23.alerts.length)mapDraw7();
}
{const _po23=paintOver10;paintOver10=function(x,v,g,isM){const out=_po23.apply(this,arguments);try{over23(x,v,g)}catch(e){console.warn('[T23] alerta',e)}return out}}

/* ---------- 2. furtividade automática ao chegar perto de um inimigo, fora do cone ---------- */
function prox23(){
  if(AI23.off||!realGM22()||!camp3()||!MAP7.cv||!MAP7.cv.isConnected)return;
  const hs=hostTok22();if(!hs.length)return;
  const order=cbOrder22(),g=mapCfg7(),now=Date.now(),tg=playerTok22();
  tg.forEach(pt=>{const [px,py]=tokCenter10(pt),M=AI23.mv[pt.id];if(!M||hyp10(px-M.x,py-M.y)>g.cell*.08)AI23.mv[pt.id]={x:px,y:py,at:M?now:0}});
  hs.forEach(e=>{
    if(order.includes(e.charId))return;const R=AI22.run[e.charId];if(!R)return;
    const c=aiCfg22(aiOf22(e.charId)),H=hearR23(c)*g.cell,[ex,ey]=g2p22(e,R.x,R.y);
    tg.forEach(pt=>{
      if(order.includes(pt.charId))return;
      const [px,py]=tokCenter10(pt),d=hyp10(px-ex,py-ey),k=e.charId+'|'+pt.charId,P=AI23.pair[k]||(AI23.pair[k]={in:false,at:0,x:px,y:py});
      if(d>H){P.in=false;return}
      if(sees22(e,c,R,pt)){P.in=true;P.at=now;P.x=px;P.y=py;return}       /* foi visto: o combate cuida */
      const moving=now-(AI23.mv[pt.id]?.at||0)<1600;if(!moving)return;      /* parado não faz barulho */
      if(!P.in||(hyp10(px-P.x,py-P.y)>=g.cell*1.5&&now-P.at>4000)){P.in=true;P.at=now;P.x=px;P.y=py;proxRoll23(e,pt)}
    });
  });
}
function proxRoll23(e,pt){
  const ch=charById(pt.charId),ech=charById(e.charId);if(!ch||!ech)return;
  const r=stealthRoll23(ch),DT=percDT23(ech),ok=r.total>=DT,m=Math.max(1,DT-r.total),player=ch.ownerId&&!gmChar6(ch);
  showPriv23(ch,{who:nm(ch),label:player?'Furtividade · algo por perto':`Furtividade perto de ${nm(ech)}`,r:{dice:r.dice,bonus:r.bonus,total:r.total},DT,ok,note:ok?'':'os inimigos ouviram'});
  if(!ok){const [x,y]=tokCenter10(pt);noiseAt23(x,y,{m:Math.min(m,8),src:'ally',rc:3+Math.min(m,8)*.5})}
}
{const _tk23=aiTick22;aiTick22=function(){const out=_tk23.apply(this,arguments);try{if(AI22.tick%4===0)prox23()}catch(e){console.warn('[T23] furtividade',e)}return out}}

/* ---------- 3. portas: mesmas opções para jogadores, NPCs e inimigos ---------- */
const mid23=w=>[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2];
function targetsNear23(w,cells=12){const [mx,my]=mid23(w),cell=mapCfg7().cell;return playerTok22().filter(t=>{const [x,y]=tokCenter10(t);return hyp10(x-mx,y-my)<=cells*cell})}
function doorSet23(w,open,quiet){
  const key=geoKey10();TAC10.doorLive[w.id]={open,until:Date.now()+8000};TAC10.blkSig='';
  cast6({t:'door',k:key,id:w.id,open,...(quiet?{q:1}:{})});
  if(isGM6()){const g=geo10();g.walls=g.walls.map(q=>q.id===w.id?{...q,door:{...q.door,open}}:q);geoSet10(g,{undo:false})}else doorSave10(key,w.id);
  mapDraw7();
}
doorUse10=function(w,t){
  if(!t||!w?.door||w.door.locked||AI22.doorSkip)return _door22.apply(this,arguments);
  const ch=charById(t.charId);if(!ch)return _door22.apply(this,arguments);
  const sd=side23(ch),near=sd==='foe'?targetsNear23(w):enemiesNear22(w);
  if(!near.length)return _door22.apply(this,arguments);
  const open=!doorOpen10(w),verb=open?'Abrir':'Fechar',args=arguments,self=this;
  openModal('PORTA',`${verb} a porta · ${esc(nm(ch))}`,`<p>${sd==='foe'?'Há personagens por perto que podem ouvir.':'Há inimigos por perto.'} Como ${open?'abrir':'fechar'}?</p><div class="ai-door"><button type="button" class="btn" id="dr23n">🚪 ${verb} normal<br><span class="sub">rápido, faz barulho de porta</span></button><button type="button" class="btn primary" id="dr23s">🤫 ${verb} furtivamente<br><span class="sub">Destreza + Furtividade, DT ${dtDoor22()} · resultado só seu</span></button></div>`,'Cancelar',()=>closeModal());
  $('dr23n').onclick=()=>{closeModal();AI22.doorSkip=true;try{_door22.apply(self,args)}finally{AI22.doorSkip=false}const [x,y]=mid23(w);noiseAt23(x,y,{m:3,normal:true,src:sd})};
  $('dr23s').onclick=()=>{closeModal();doorStealth23(w,t,open)};
};
T3.doorUse=w=>doorUse10(w,ctlTok10());
function doorStealth23(w,t,open){
  const ch=charById(t.charId);if(!ch)return;
  const r=stealthRoll23(ch),DT=dtDoor22(),ok=r.total>=DT,m=Math.max(1,DT-r.total),sd=side23(ch),[x,y]=mid23(w);
  showPriv23(ch,{who:nm(ch),label:`${open?'Abrir':'Fechar'} a porta em silêncio`,r:{dice:r.dice,bonus:r.bonus,total:r.total},DT,ok,note:ok?'':`a porta rangeu (margem ${m})`});
  doorSet23(w,open,true);
  if(ok){softDoor22();noiseAt23(x,y,{ok:true,src:sd})}else{creak22(m);noiseAt23(x,y,{m,src:sd})}
}
T3.doorStealth=doorStealth23;
/* rolar Furtividade pelo menu do token (Mestre para NPCs e inimigos; jogador para o próprio) */
function manual23(t){
  const ch=charById(t.charId);if(!ch)return;
  const r=stealthRoll23(ch),DT=dtDoor22(),ok=r.total>=DT,m=Math.max(1,DT-r.total);
  showPriv23(ch,{who:nm(ch),label:'Furtividade',r:{dice:r.dice,bonus:r.bonus,total:r.total},DT,ok,note:ok?'':'quem estiver perto ouviu'});
  if(!ok){const [x,y]=tokCenter10(t);noiseAt23(x,y,{m:Math.min(m,8),src:side23(ch),rc:3+Math.min(m,8)*.5})}
}
{const _mm23=mapMenu7;mapMenu7=function(t,e){
  const out=_mm23.apply(this,arguments);
  try{if(!t)return out;const ch=charById(t.charId),m=$('mapMenu');if(!ch||!m||m.hidden||m.querySelector('[data-stl23]'))return out;
    const mine=isGM6()?(gmChar6(ch)||!ch.ownerId):ch.ownerId===uid3();if(!mine)return out;
    const row=document.createElement('div');row.className='mm-row';row.innerHTML='<button type="button" class="mt-chip" data-stl23>🤫 Rolar Furtividade (só você vê)</button>';
    m.insertBefore(row,m.querySelector('[data-focus]')?.parentElement||null);
    row.querySelector('[data-stl23]').onclick=()=>{mapMenu7(null);manual23(t)};
  }catch(err){console.warn('[T23] menu',err)}
  return out}}
/* inimigos em patrulha ou investigando abrem portas destrancadas no caminho */
function segX23(ax,ay,bx,by,cx,cy,dx,dy){const d=(bx-ax)*(dy-cy)-(by-ay)*(dx-cx);if(Math.abs(d)<1e-9)return false;const u=((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx))/d,v=((cx-ax)*(by-ay)-(cy-ay)*(bx-ax))/d;return u>=0&&u<=1&&v>=0&&v<=1}
function autoDoor23(t,R,tx,ty){
  if(!realGM22())return;const g=mapCfg7(),[cx,cy]=g2p22(t,R.x,R.y),now=Date.now();
  for(const w of geo10().walls){
    if(!w.door||w.door.locked||doorOpen10(w))continue;const [mx,my]=mid23(w);
    if(hyp10(mx-cx,my-cy)>g.cell*1.6||!segX23(cx,cy,tx,ty,w.a[0],w.a[1],w.b[0],w.b[1]))continue;
    if(now-(AI23.doorAt[w.id]||0)<3000)continue;AI23.doorAt[w.id]=now;enemyDoor23(w,t,R);break;
  }
}
function enemyDoor23(w,t,R){
  const ch=charById(t.charId);if(!ch)return;const [x,y]=mid23(w);
  if(R.inv||aiLive22(t.charId)==='alert'){doorSet23(w,true,false);fx5('doorOpen');noiseAt23(x,y,{m:3,normal:true,src:'foe'});return}
  const r=stealthRoll23(ch),DT=dtDoor22(),ok=r.total>=DT,m=Math.max(1,DT-r.total);
  showPriv23(ch,{who:nm(ch),label:'Abriu uma porta na patrulha',r:{dice:r.dice,bonus:r.bonus,total:r.total},DT,ok,note:ok?'':'os jogadores perto ouviram'});
  doorSet23(w,true,ok);
  if(ok)softDoor22();else{creak22(m);noiseAt23(x,y,{m,src:'foe'})}
}
{const _wk23=walk22;walk22=function(t,R,tx,ty){try{autoDoor23(t,R,tx,ty)}catch(e){console.warn('[T23] porta',e)}return _wk23.apply(this,arguments)}}
M6.hooks.leave.push(()=>{AI23.pair={};AI23.mv={};AI23.alerts=[];AI23.marks=[];AI23.doorAt={};AI23.hov=null});
T3.ai23=AI23;T3.ai23f={prox23,proxRoll23,noiseAt23,recvNoise23,manual23,doorStealth23,autoDoor23,dir23,percDT23,hearR23};
T3.sprLoad=sprLoad;

