/* ===================================================================
   TULPA · ETAPA 54 — 🕹 ARCADE 2.0 · ONDA 9 (parte 1)
   🏐 TULPA VOLLEY 2.0
   Regras de vôlei de verdade: no máximo 3 toques por lado, sets (melhor
   de 3) e pontos de 7, 11 ou 15. Ação (S/↓/K): no ar perto da rede é
   CORTADA ou BLOQUEIO; no chão é MERGULHO para salvar bolas baixas.
   Poder Elemental (E/L) com barra de Energia: Cortada Solar (Fé),
   Muralha de Raízes (Natureza), Passo do Vazio (Inexistência), Bola
   Fantasma (Ilusão) e Olho da Verdade (Verdade).
   Arenas: Clássica, Ventos do Véu, Gravidade Lunar e Bola Pesada.
   Copa do Véu: 4 rivais cada vez mais fortes. Mesa: até 3 × 3.
   =================================================================== */
const VBEL54={fe:{n:'Cortada Solar',ico:'☀',d:'Seu próximo toque vira uma bola de fogo que queima quem tenta devolver.'},nat:{n:'Muralha de Raízes',ico:'🌿',d:'Por 7 s, raízes devolvem a bola que cairia no seu lado.'},ine:{n:'Passo do Vazio',ico:'🕳',d:'Teleporta você para baixo da bola.'},ilu:{n:'Bola Fantasma',ico:'🌀',d:'Depois do seu toque a bola some e reaparece; o rival se confunde.'},ver:{n:'Olho da Verdade',ico:'👁',d:'Por 8 s você vê onde a bola vai cair e seus toques miram no buraco.'}};
const VBELK54=Object.keys(VBEL54);
const VBAR54={normal:{n:'Clássica',ico:'🏐',d:'Sem surpresas.'},vento:{n:'Ventos do Véu',ico:'🌬',d:'O vento muda e empurra a bola.'},lua:{n:'Gravidade Lunar',ico:'🌙',d:'Bola e pulos flutuam mais.'},pesada:{n:'Bola Pesada',ico:'🪨',d:'A bola cai rápido e pesa.'}};
const VBCUP54=[{n:'Perseus Aprendiz',d:'facil',el:'ver',ar:'normal'},{n:'Guardiã das Raízes',d:'medio',el:'nat',ar:'vento'},{n:'Eco do Vazio',d:'dificil',el:'ine',ar:'lua'},{n:'Perseus Supremo',d:'pesadelo',el:'fe',ar:'pesada'}];
function vbProg54(){const p=prog38().vb||{};return{cup:p.cup||0,wins:p.wins||0,best:p.best||0}}
const vbSetup54={
  intro:o=>o._m==='mesa'?'Times alternados pela ordem de chegada (até 3 × 3). O anfitrião escolhe arena e pontos. O Elemento de cada um vem da cor do seu Perseus.':'Escolha modo, arena e o seu Poder Elemental.',
  def:()=>({m:'jogo',pts:'7',sets:'1',ar:'normal',el:'fe',cs:'0'}),
  fields:o=>{const p=vbProg54(),mesa=o._m==='mesa',F=[];
    if(!mesa)F.push({k:'m',l:'Modo',opts:[{v:'jogo',n:'Partida',ico:'🏐',d:'Contra o Perseus.'},{v:'copa',n:'Copa do Véu',ico:'🏆',d:'4 rivais cada vez mais fortes.',badge:p.cup?`🏆 ×${p.cup}`:''}]});
    if(!mesa&&o.m==='copa')F.push({k:'cs',l:'Rival',wide:1,opts:VBCUP54.map((c,i)=>({v:String(i),n:`${i+1}. ${c.n}`,ico:VBEL54[c.el].ico,d:`${DIFF12[c.d].n} · ${VBAR54[c.ar].n}`,lock:i>0&&!(prog38().vb?.cs>=i)}))});
    if(mesa||o.m!=='copa'){F.push({k:'pts',l:'Pontos por set',opts:[{v:'7',n:'7',ico:'7️⃣',d:'Rápido.'},{v:'11',n:'11',ico:'🔟',d:'Com 2 de vantagem.'},{v:'15',n:'15',ico:'🏟',d:'Com 2 de vantagem.'}]},{k:'sets',l:'Sets',opts:[{v:'1',n:'Set único',ico:'1️⃣',d:''},{v:'3',n:'Melhor de 3',ico:'3️⃣',d:''}]},{k:'ar',l:'Arena',opts:Object.entries(VBAR54).map(([v,a])=>({v,n:a.n,ico:a.ico,d:a.d}))})}
    if(!mesa)F.push({k:'el',l:'Seu Poder Elemental',wide:1,opts:VBELK54.map(k=>({v:k,n:VBEL54[k].n,ico:VBEL54[k].ico,d:VBEL54[k].d}))});
    return F},
  fix:o=>{if(!['jogo','copa'].includes(o.m))o.m='jogo';if(!['7','11','15'].includes(o.pts))o.pts='7';if(!['1','3'].includes(o.sets))o.sets='1';if(!VBAR54[o.ar])o.ar='normal';if(!VBEL54[o.el])o.el='fe';let c=Math.max(0,Math.min(3,+o.cs||0));while(c>0&&!(prog38().vb?.cs>=c))c--;o.cs=String(c)},
  sum:()=>'A/D andam · W/↑/Espaço pulam · S/↓/K: Ação (cortada ou bloqueio no ar, mergulho no chão) · E/L: Poder Elemental (barra cheia). No máximo 3 toques por lado!'
};

function volley54(C){
  const W=800,H=450,GY=404,NX=400,NT=262,R=27,BR=17,o=C.room.opt||{},multi=!!C.net;
  const cup=!multi&&o.m==='copa'?VBCUP54[Math.max(0,Math.min(3,+o.cs||0))]:null,cs=cup?+o.cs||0:-1;
  const diff=cup?cup.d:C.diff,ar=cup?cup.ar:(o.ar||'normal'),PTS=cup?7:+(o.pts||7),SETS=cup?1:+(o.sets||1),NEED=Math.ceil(SETS/2);
  const gk=ar==='lua'?.62:ar==='pesada'?1.28:1;
  const G=1600*(ar==='lua'?.8:1),GB=gdPick(C.gd,[440,520,600,690])*gk,SP=310,JV=-640*(ar==='lua'?.92:1),HIT=gdPick(C.gd,[440,480,530,590])*(ar==='pesada'?.95:1),VMAX=gdPick(C.gd,[500,540,590,650]);
  const ps=C.players.map((p,i)=>({...p,team:multi?(i%2):0,ai:false,el:multi?VBELK54[((p.c|0)%5+5)%5]:(o.el||'fe')}));
  if(!multi)ps.push({u:'~ai',n:cup?cup.n:'Perseus',c:-1,team:1,ai:true,el:cup?cup.el:VBELK54[Math.floor(Math.random()*5)]});
  else{const a=ps.filter(p=>p.team===0).length,b=ps.length-a;if(a!==b)ps.push({u:'~ai',n:'Perseus',c:-1,team:a<b?0:1,ai:true,el:'fe'})}
  const place=()=>ps.forEach(p=>{const m=ps.filter(q=>q.team===p.team),k=m.indexOf(p),n=m.length;p.x=p.team?NX+(W-NX)*(k+1)/(n+1):NX*(k+1)/(n+1);p.y=GY-R;p.vx=0;p.vy=0;p.in=p.in||{l:0,r:0,j:0,a:0,p:0};p.dx=p.x;p.dy=p.y;p.f=p.team?-1:1;p.en=p.en||0;p.dive=0;p.spk=0;p.blk=0});
  place();
  const S={b:{x:200,y:120,vx:0,vy:0},sc:[0,0],sets:[0,0],setN:1,wait:1.2,acc:0,snapAt:0,hits:0,shown:0,end:false,touch:{t:-1,n:0},rally:0,maxRally:0,wind:0,windT:0,
    st:{spk:0,blk:0,ace:0,dive:0,pow:0},fire:null,ghost:0,roots:[0,0],eye:[0,0],lastHitter:null,msg:'',msgT:0,points:[]};
  const serve=t=>{S.b={x:t?NX+190:NX-190,y:110,vx:0,vy:0};S.wait=1.1;S.fresh=true;S.server=t;S.touchesSinceServe=0;S.touch={t:-1,n:0};S.rally=0;S.fire=null;S.ghost=0};
  serve(Math.random()<.5?0:1);
  const me=ps.find(p=>p.u===C.me),inp={l:0,r:0,j:0,a:0,p:0};
  const tname=t=>{const h=ps.filter(p=>p.team===t&&!p.ai);return h.length?h.map(p=>p.n).join(' + '):(cup?cup.n:'Perseus · '+(DIFF12[diff]||DIFF12.medio).n)};
  const AIP={facil:{sp:.7,re:.4,err:80,jump:.4,spike:0,aim:0,back:250,slip:.16,net:false,naive:true,pw:.002},medio:{sp:.9,re:.16,err:24,jump:.85,spike:.15,aim:.35,back:180,slip:0,net:false,pw:.006},
    dificil:{sp:1,re:.07,err:6,jump:1,spike:.55,aim:.85,back:160,slip:0,net:true,pw:.012},pesadelo:{sp:1.14,re:.015,err:0,jump:1,spike:.92,aim:1,back:125,slip:0,net:true,pw:.02}}[diff]||{};
  const HITY=GY-2*R-BR+6;
  function say(m){S.msg=m;S.msgT=performance.now()}
  function predict(side,y0,useNet){let{x,y,vx,vy}=S.b;const h=1/120;if(S.wait>0)return{x,t:S.wait+Math.sqrt(Math.max(0,2*(y0-y)/GB))};
    for(let t=0;t<3;t+=h){vy+=GB*h;vx+=S.wind*h;x+=vx*h;y+=vy*h;if(x<BR){x=BR;vx=Math.abs(vx)*.9}if(x>W-BR){x=W-BR;vx=-Math.abs(vx)*.9}
      if(useNet&&y+BR>NT&&x+BR>NX-5&&x-BR<NX+5){if(y<NT+4){y=NT-BR;vy=-Math.abs(vy)*.7;vx+=x<NX?-80:80}else if(x<NX){x=NX-5-BR;vx=-Math.abs(vx)*.8}else{x=NX+5+BR;vx=Math.abs(vx)*.8}}
      if(vy>0&&y>=y0&&(side?x>NX:x<NX))return{x,t};if(y+BR>=GY)return{x,t}}return{x,t:3}}
  function aiThink(p){const b=S.b,side=p.team,dir=side?1:-1,mine=side?b.x>NX:b.x<NX,coming=side?b.vx>0:b.vx<0;let tx=side?NX+AIP.back:NX-AIP.back;p.aiNear=false;
    if(S.wait>0&&mine){if(p.aiServe==null)p.aiServe=6+Math.random()*30;tx=b.x+dir*p.aiServe}
    else if(mine||coming){p.aiServe=null;const pr=AIP.naive?(()=>{const disc=b.vy*b.vy+2*GB*(HITY-b.y),t=disc>0?(-b.vy+Math.sqrt(disc))/GB:.3;let x=b.x+b.vx*t;if(x<0)x=-x;if(x>W)x=2*W-x;return{x}})():predict(side,HITY,AIP.net);
      p.aiNear=Math.abs(pr.x-NX)<160;const off=p.aiSpk&&p.aiNear?20:10+Math.random()*16;tx=pr.x+dir*off;p.aiLand=pr.x}else{p.aiServe=null;p.aiSpk=Math.random()<AIP.spike}
    const conf=S.ghost>0&&!mine?(Math.random()-.5)*160:0;tx+=(Math.random()-.5)*2*AIP.err+conf;if(AIP.slip&&Math.random()<AIP.slip)tx=p.x;p.aiTx=tx;p.aiCanJ=Math.random()<AIP.jump}
  function aiIn(p,h){const b=S.b,side=p.team,lo=side?NX+R+6:R,hi=side?W-R:NX-R-6;p.aiCd=(p.aiCd||0)-h;if(p.aiCd<=0||p.aiTx==null){p.aiCd=AIP.re*(.7+Math.random()*.6);aiThink(p)}
    const tx=clamp12(p.aiTx,lo,hi),I={l:0,r:0,j:0,a:0,p:0};if(p.x<tx-8)I.r=1;else if(p.x>tx+8)I.l=1;const mine=side?b.x>NX:b.x<NX,dx=Math.abs(b.x-p.x);
    if(mine&&S.wait<=0&&p.aiCanJ){if(p.aiSpk&&p.aiNear&&dx<62&&b.y>NT-215&&b.y<NT+20&&b.vy>-200)I.j=1;else if(dx<(AIP.net?58:70)&&b.y>GY-(AIP.net?230:190)&&b.y<GY-75&&b.vy>-120)I.j=1}
    /* mergulho quando não alcança */
    if(mine&&S.wait<=0&&b.vy>0&&b.y>GY-110&&dx>60&&dx<200&&p.y>=GY-R-1&&AIP.jump>.5&&Math.random()<.5){I.a=1;p.f=b.x>p.x?1:-1}
    /* poder */
    if(p.en>=100&&S.wait<=0&&Math.random()<AIP.pw*60*h){const ok={fe:mine&&dx<120,nat:mine&&b.vy>0,ine:mine&&dx>150,ilu:mine&&dx<100,ver:true}[p.el];if(ok)I.p=1}
    return I}
  function aiHit(p,b){const dir=p.team?-1:1,air=p.y<GY-R-40;
    if(air&&p.aiSpk&&Math.abs(b.x-NX)<180&&b.y<NT-BR){const vx=dir*(380+Math.random()*(diff==='pesadelo'?190:130)),t=(Math.abs(NX-b.x)+BR+6)/Math.abs(vx),vyMax=(NT-BR-10-b.y-.5*GB*t*t)/t;
      if(vyMax>-140){b.vx=clamp12(vx,-560,560);b.vy=clamp12(vyMax-20,-140,320);S.spike=p.team;return true}}
    if(AIP.slip&&Math.random()<AIP.slip){b.vx*=.45;return true}const fresh=S.fresh;S.fresh=false;if(Math.random()>=AIP.aim)return false;
    return aimHole(p,b,fresh)}
  function aimHole(p,b,fresh){const dir=p.team?-1:1,opp=ps.filter(q=>q.team!==p.team),a=p.team?R+10:NX+40,z=p.team?NX-40:W-R-10;let best=null,bs=-1,vys=[-360,-420,-480,-540,-600,-680,-760];if(b.y<NT-90)vys.push(-240,-120,0,150,300);
    if(fresh){best=a+(z-a)*Math.random();const k=Math.floor(Math.random()*4);vys=vys.slice(k).concat(vys.slice(0,k))}else for(let i=0;i<9;i++){const x=a+(z-a)*i/8,s=Math.min(...opp.map(q=>Math.abs(q.x-x)))+(i===0||i===8?18:0)+Math.random()*20;if(s>bs){bs=s;best=x}}
    const ok=[];for(const vy of vys){const t=(-vy+Math.sqrt(vy*vy+2*GB*(GY-BR-b.y)))/GB,vx=(best-b.x)/t;if(Math.abs(vx)>560)continue;const xe=NX+dir*(6+BR),tn=(xe-b.x)/vx;if(!(tn>0))continue;const yn=b.y+vy*tn+.5*GB*tn*tn;if(yn<NT-BR-8){ok.push([vx,vy]);if(!fresh)break}}
    if(!ok.length)return false;const[vx,vy]=fresh?pick12(ok):ok[0];b.vx=vx;b.vy=vy;return true}
  const sayK=k=>SAY12[k+'_'+diff]||SAY12[k];
  function point(t,why){
    S.sc[t]++;fx5('mgCoin');const spk=S.spike===t;S.spike=null;S.points.push(t);
    if(S.rally>S.maxRally)S.maxRally=S.rally;if(S.rally>=20&&me&&!multi)C.achieve?.('vb_rally');
    if(S.server===t&&S.touchesSinceServe===0&&ps.some(p=>p.team===t&&p===me)){S.st.ace++;C.achieve?.('vb_ace')}
    ps.forEach(p=>{if(p.team===t)p.en=Math.min(100,p.en+12)});
    C.fx?.shake(spk?9:6,.3);C.fx?.burst(S.b.x,GY-6,{n:22,col:[t===0?'#5aa7e8':'#e0233b','#ffd36b','#fff'],sp:240,life:.7,size:3.2,grav:500,ang:-Math.PI/2,spread:2.2});C.fx?.float(S.b.x,GY-70,why||(spk?'CORTADA!':'PONTO!'),{col:'#ffd36b',size:spk?34:28,life:1});
    const o2=1-t,won=S.sc[t]>=PTS&&S.sc[t]-S.sc[o2]>=(PTS>7?2:1);
    if(won){S.sets[t]++;
      if(S.sets[t]>=NEED){S.end=true;finish(t);return}
      S.setN++;say(`Set para ${tname(t)}! Set ${S.setN}`);C.fx?.float(400,150,`SET ${S.setN}`,{col:'#ffd36b',size:40,life:1.6});S.sc=[0,0];place();serve(o2);return}
    if(S.sc[t]===PTS-1&&S.sets[t]===NEED-1)setTimeout(()=>{C.fx?.float(400,150,'MATCH POINT!',{col:'#ff8fb1',size:36,life:1.4});fx5('activate')},500);
    serve(t);const ai=ps.some(p=>p.ai&&p.team===t);
    C.say(spk&&ai?sayFmt(sayK('spike')):multi?(ai?sayFmt(sayK('aiPoint')):sayFmt(SAY12.multiPoint,{t:tname(t)})):sayFmt(t===1?sayK('aiPoint'):sayK('humanPoint')))}
  function finish(t){const rows=ps.map(p=>({u:p.u,n:p.n,c:p.c,s:SETS>1?S.sets[p.team]:S.sc[p.team],w:p.team===t}));const won=me&&me.team===t;
    let first=false;if(!multi)progPut38(pp=>{pp.vb=pp.vb||{};if(won){pp.vb.wins=(pp.vb.wins||0)+1;if(cup){if(cs+1>(pp.vb.cs||0))pp.vb.cs=Math.min(3,cs+1);if(cs===3){first=!pp.vb.cup;pp.vb.cup=(pp.vb.cup||0)+1;C.achieve?.('vb_copa')}}}if(S.maxRally>(pp.vb.best||0))pp.vb.best=S.maxRally});
    if(won&&!multi&&S.sc[1-t]===0&&SETS===1)C.achieve?.('vb_perfeito');
    const mul=gdMul38(diff||'medio');S.rw={ob:won?Math.round((multi?10:cup?(cs===3?40:10+cs*4):8+(PTS-7)*.8+(SETS-1)*4)*mul)+(first?20:0):3,why:[cup?`Copa ${cs+1}/4`:'',won?'vitória':'',S.maxRally>=10?`rali de ${S.maxRally}`:''].filter(Boolean).join(' · ')||'partida'};S.rw.xp=Math.round(S.rw.ob*.6);
    C.finish({title:(multi?'Vitória de '+tname(t):(t===1?`${tname(1)} venceu`:`Você venceu ${cup?cup.n:'o Perseus'}!`))+(SETS>1?` · sets ${S.sets[0]} × ${S.sets[1]}`:` · ${S.sc[0]} × ${S.sc[1]}`),rows,unit:SETS>1?'sets':'pts',
      html:`<ul class="r38-l"><li>🏐 Maior rali: <b>${S.maxRally}</b> toques</li><li>💥 Cortadas: <b>${S.st.spk}</b> · 🧱 Bloqueios: <b>${S.st.blk}</b></li><li>🤿 Mergulhos: <b>${S.st.dive}</b> · ✨ Poderes: <b>${S.st.pow}</b></li><li>🎯 Aces: <b>${S.st.ace}</b> · 🏟 ${esc(VBAR54[ar].n)}</li></ul>${cup&&won&&cs<3?`<p class="r38-hi">Próximo rival: ${esc(VBCUP54[cs+1].n)}.</p>`:''}`});
    if(!multi)C.say(t===1?sayFmt(sayK('aiWin')):sayFmt(sayK('humanWin')))}
  function usePower(p){if(p.en<100)return;p.en=0;if(p===me)S.st.pow++;fx5('activate');C.fx?.flash(p.team?'#ff8fb1':'#7fe3ff',.18);const b=S.b;
    if(p.el==='fe'){p.fireReady=1;C.fx?.float(p.x,p.y-60,'☀ Cortada Solar!',{col:'#ffd36b',size:18})}
    else if(p.el==='nat'){S.roots[p.team]=7;C.fx?.float(p.x,p.y-60,'🌿 Muralha!',{col:'#7dffa8',size:18})}
    else if(p.el==='ine'){const mine=p.team?b.x>NX:b.x<NX;if(mine){p.x=clamp12(b.x-p.f*10,p.team?NX+6+R:R,p.team?W-R:NX-6-R);C.fx?.burst(p.x,p.y,{n:14,col:['#c58bff','#000'],sp:160,life:.4,size:3,grav:0})}else p.en=100}
    else if(p.el==='ilu'){p.ghostReady=1;C.fx?.float(p.x,p.y-60,'🌀 Bola Fantasma',{col:'#7fe3ff',size:18})}
    else if(p.el==='ver'){S.eye[p.team]=8;p.eyeAim=8;C.fx?.float(p.x,p.y-60,'👁 Olho da Verdade',{col:'#ff8fb1',size:18})}}
  function phys(h){
    S.windT-=h;if(ar==='vento'&&S.windT<=0){S.windT=4+Math.random()*3;S.windTo=(Math.random()-.5)*320}if(ar==='vento')S.wind+=((S.windTo||0)-S.wind)*h*.8;
    S.roots=S.roots.map(v=>Math.max(0,v-h));S.eye=S.eye.map(v=>Math.max(0,v-h));S.ghost=Math.max(0,S.ghost-h);
    ps.forEach(p=>{const I=p.ai?aiIn(p,h):p.in,sp=p.ai?SP*(AIP.sp||1):SP;const prevA=p.lastA,prevP=p.lastP;p.lastA=I.a;p.lastP=I.p;if(p.eyeAim>0)p.eyeAim-=h;
      if(I.p&&!prevP)usePower(p);
      const ground=p.y>=GY-R-.5;
      if(I.a&&!prevA){if(ground&&p.dive<=0&&S.wait<=0){p.dive=.38;p.f=I.r?1:I.l?-1:p.f;if(p===me)S.st.dive++;fx5('mgJump')}else if(!ground){p.spk=.25;p.blk=Math.abs(p.x-NX)<70?.3:0}}
      p.spk=Math.max(0,p.spk-h);p.blk=Math.max(0,p.blk-h);
      if(p.dive>0){p.dive-=h;p.vx=p.f*SP*1.9}else{p.vx=(I.r-I.l)*sp;if(p.vx)p.f=p.vx>0?1:-1}
      if(p.cd>0)p.cd-=h;if(I.j&&ground&&p.dive<=0){p.vy=JV;if(p.u===C.me)fx5('mgJump')}
      p.vy+=G*h;p.x+=p.vx*h;p.y+=p.vy*h;if(p.y>GY-R){p.y=GY-R;p.vy=0}p.x=clamp12(p.x,p.team?NX+6+R:R,p.team?W-R:NX-6-R)});
    if(S.wait>0){S.wait-=h;return}
    const b=S.b;b.vy+=GB*h;b.vx+=S.wind*h;b.x+=b.vx*h;b.y+=b.vy*h;
    if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.9}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.9}
    if(b.y+BR>NT&&b.x+BR>NX-5&&b.x-BR<NX+5){if(b.y<NT+4){b.y=NT-BR;b.vy=-Math.abs(b.vy)*.7;b.vx+=b.x<NX?-80:80}else if(b.x<NX){b.x=NX-5-BR;b.vx=-Math.abs(b.vx)*.8}else{b.x=NX+5+BR;b.vx=Math.abs(b.vx)*.8}}
    /* a bola mudou de lado: zera os toques */
    for(const p of ps){if(p.cd>0)continue;const rr=R*(p.blk>0?1.45:1)*(p.dive>0?1.2:1),dx=b.x-p.x,dy=b.y-(p.y+(p.dive>0?10:0)),d=Math.hypot(dx,dy);if(d>=rr+BR||d<1e-6)continue;
      /* contagem de toques */
      if(S.touch.t===p.team)S.touch.n++;else S.touch={t:p.team,n:1,side:p.team};S.rally++;S.touchesSinceServe=(S.touchesSinceServe||0)+(S.server!==p.team?1:0);
      if(S.touch.n>3){S.touch={t:-1,n:0};point(1-p.team,'4 TOQUES!');return}
      p.en=Math.min(100,p.en+9);
      const nx=dx/d,ny=dy/d;b.x=p.x+nx*(rr+BR);b.y=p.y+ny*(rr+BR);
      const burned=S.fire&&S.fire.t!==p.team;
      let sp=Math.max(HIT,Math.hypot(b.vx,b.vy)*.92),vx=nx*sp+p.vx*.4,vy=ny*sp+Math.min(0,p.vy)*.25;if(vy>-320)vy=-320-Math.random()*80;
      if(p.team===0&&vx<60)vx=Math.max(vx,60+Math.random()*120);if(p.team===1&&vx>-60)vx=Math.min(vx,-60-Math.random()*120);
      b.vx=clamp12(vx,-VMAX,VMAX);b.vy=Math.max(-780,vy);S.hits++;S.spike=null;S.fire=null;S.lastHitter=p;
      const dir=p.team?-1:1;
      if(p.dive>0){b.vy=-560;b.vx=dir*120;p.dive=0;C.fx?.float(p.x,p.y-50,'MERGULHO!',{col:'#7fe3ff',size:16})}
      else if(p.blk>0&&Math.abs(b.x-NX)<90&&b.y<NT){b.vx=dir*300;b.vy=60;p.blk=0;S.spike=p.team;if(!p.ai)S.st.blk++;if(p===me)C.achieve?.('vb_bloqueio');C.fx?.float(p.x,p.y-60,'BLOQUEIO!',{col:'#ffd36b',size:20});fx5('bb5')}
      else if(p.spk>0&&b.y<NT+20&&Math.abs(b.x-NX)<260){const t=(Math.abs(NX-b.x)+BR+6)/520,vyM=(NT-BR-10-b.y-.5*GB*t*t)/t;b.vx=dir*520;b.vy=clamp12(Math.min(vyM-20,280),-200,320);p.spk=0;S.spike=p.team;if(!p.ai)S.st.spk++;C.fx?.shake(5,.2);C.fx?.float(p.x,p.y-60,'CORTADA!',{col:'#ff9b3d',size:20});fx5('bb6')}
      else if(p.ai&&aiHit(p,b))p.cd=.18;
      else if(p.eyeAim>0)aimHole(p,b,false);
      if(burned){b.vx*=.45;b.vy=Math.max(b.vy,-260);C.fx?.float(p.x,p.y-50,'🔥 queimou!',{col:'#ff6b3d',size:16})}
      if(p.fireReady){p.fireReady=0;S.fire={t:p.team};b.vx=dir*Math.max(Math.abs(b.vx),480);C.fx?.flash('#ff9b3d',.2)}
      if(p.ghostReady){p.ghostReady=0;S.ghost=1.4}
      S.fresh=false;p.aiTx=null;break}
    if(b.y+BR>=GY){const side2=b.x<NX?0:1;if(S.roots[side2]>0){S.roots[side2]=0;b.y=GY-BR-2;b.vy=-620;b.vx=side2?-160:160;C.fx?.float(b.x,GY-60,'🌿 Raízes!',{col:'#7dffa8',size:20});fx5('bb4');return}
      b.y=GY-BR;point(b.x<NX?1:0)}}
  function snap(){C.send('snap',{b:[S.b.x,S.b.y,S.b.vx,S.b.vy].map(v=>Math.round(v)),p:ps.map(p=>[p.u,Math.round(p.x),Math.round(p.y),p.f,Math.round(p.en),p.dive>0?1:0]),sc:S.sc,ss:S.sets,w:S.wait>0?1:0,h:S.hits,tn:S.touch.n,tt:S.touch.t,r:S.roots.map(v=>v>0?1:0),g:S.ghost>0?1:0,fi:S.fire?S.fire.t:-1,wd:Math.round(S.wind)})}
  function sendIn(){if(!me)return;if(C.host)me.in={...inp};else C.send('in',{...inp})}
  let keepAt=0;
  return{st:()=>S,ps:()=>ps,sim(sec){for(let t=0;t<sec&&!S.end;t+=1/120)phys(1/120)},aip:()=>AIP,usePower,
    reward:()=>S.rw||null,
    next(){if(multi)return null;if(cup){const won=S.sets[0]>=NEED;if(won&&cs<3)return{opt:{m:'copa',cs:String(cs+1)},label:`Copa: ${VBCUP54[cs+1].n}`};if(!won)return{opt:{m:'copa',cs:String(cs)},label:'Tentar de novo'};return null}return{opt:{},label:'Revanche'}},
    key(code,down){const v=down?1:0;if(code==='KeyA'||code==='ArrowLeft')inp.l=v;else if(code==='KeyD'||code==='ArrowRight')inp.r=v;else if(code==='KeyW'||code==='ArrowUp'||code==='Space')inp.j=v;else if(code==='KeyS'||code==='ArrowDown'||code==='KeyK')inp.a=v;else if(code==='KeyE'||code==='KeyL')inp.p=v;else return;sendIn()},
    ptr(){},
    step(dt){const now=Date.now();if(!C.host&&now-keepAt>400){keepAt=now;sendIn()}
      if(S.hits>S.shown){S.shown=S.hits;fx5('mgBall');C.fx?.burst(S.b.x,S.b.y,{n:7,col:['#ffe07a','#fff'],sp:150,life:.35,size:2.4,grav:0})}
      if(C.host){if(now<C.t0||S.end)return;S.acc+=dt;while(S.acc>=1/120){phys(1/120);S.acc-=1/120;if(S.end)break}ps.forEach(p=>{p.dx=p.x;p.dy=p.y});if(C.net&&now-S.snapAt>=50){S.snapAt=now;snap()}}
      else{const k=Math.min(1,dt*14);ps.forEach(p=>{if(p.tx==null)return;p.dx+=(p.tx-p.dx)*k;p.dy+=(p.ty-p.dy)*k});const b=S.b;if(!S.w){b.vy+=GB*dt;b.x+=b.vx*dt;b.y+=b.vy*dt}if(S.tb){b.x+=(S.tb[0]-b.x)*k;b.y+=(S.tb[1]-b.y)*k}}
      const m=me||ps[0];C.hud(`🏐 ${SETS>1?`Set ${S.setN} · sets ${S.sets[0]}×${S.sets[1]} · `:''}${S.sc[0]} × ${S.sc[1]} · toques: ${S.touch.t===m.team?S.touch.n:0}/3 · ✨ ${Math.floor(m.en)}%${m.en>=100?` <b style="color:#ffd36b">${VBEL54[m.el].ico} PODER (E)</b>`:''}${ar!=='normal'?' · '+VBAR54[ar].ico:''}`)},
    msg(p){if(C.host&&p.t==='in'){const q=ps.find(x=>x.u===p.from);if(q)q.in={l:p.l?1:0,r:p.r?1:0,j:p.j?1:0,a:p.a?1:0,p:p.p?1:0}}
      if(!C.host&&p.t==='snap'){const[x,y,vx,vy]=p.b;S.tb=[x,y];S.b.vx=vx;S.b.vy=vy;if(Math.hypot(S.b.x-x,S.b.y-y)>90){S.b.x=x;S.b.y=y}
        if(p.sc&&(p.sc[0]!==S.sc[0]||p.sc[1]!==S.sc[1])){C.fx?.shake(6,.3);C.fx?.float(S.b.x,GY-70,'PONTO!',{col:'#ffd36b',size:28})}S.sc=p.sc;S.sets=p.ss||S.sets;S.w=p.w;S.hits=Math.max(S.hits,p.h|0);S.touch={t:p.tt,n:p.tn};S.rootsV=p.r;S.ghost=p.g?1:0;S.fire=p.fi>=0?{t:p.fi}:null;S.wind=p.wd||0;
        (p.p||[]).forEach(([u,x2,y2,f,en,dv])=>{const q=ps.find(z=>z.u===u);if(q){q.tx=x2;q.ty=y2;q.f=f;q.en=en;q.dive=dv?.1:0}})}},
    left(u){const q=ps.find(p=>p.u===u);if(q){q.ai=true;q.n='Perseus';q.c=-1;q.u='~ai'+u}},
    draw(x){
      const now=performance.now(),gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,ar==='lua'?'#0a0a24':ar==='vento'?'#12243a':ar==='pesada'?'#2a1a12':'#1b1238');gr.addColorStop(1,'#3d2a5e');x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<40;i++)x.fillRect((i*137)%W,(i*71)%220,2,2);
      if(ar==='lua'){x.beginPath();x.arc(680,70,34,0,TAU16);x.fillStyle='#e9e4ff';x.fill()}
      if(ar==='vento'&&Math.abs(S.wind)>20){x.strokeStyle='rgba(200,230,255,.25)';x.lineWidth=2;for(let i=0;i<8;i++){const y=60+i*24,off=((now/6*Math.sign(S.wind))%W+W)%W;x.beginPath();x.moveTo((off+i*90)%W,y);x.lineTo((off+i*90)%W+Math.sign(S.wind)*40,y);x.stroke()}t21(x,`${S.wind>0?'→':'←'} vento`,W/2,90,{size:12,col:'#cde'})}
      x.fillStyle='#2a1b17';x.fillRect(0,GY,W,H-GY);x.fillStyle='#4a3326';x.fillRect(0,GY,W,4);
      const roots=C.host?S.roots.map(v=>v>0):(S.rootsV||[0,0]);[0,1].forEach(t=>{if(!roots[t])return;x.fillStyle='rgba(90,200,110,.55)';x.fillRect(t?NX+6:0,GY-8,NX-6,10);for(let i=0;i<12;i++){const rx=(t?NX+6:0)+i*(NX-6)/12+8;x.fillRect(rx,GY-18,4,12)}});
      x.fillStyle='#d9cbb0';x.fillRect(NX-4,NT,8,GY-NT);x.fillStyle='rgba(217,203,176,.35)';for(let y=NT+8;y<GY;y+=14)x.fillRect(NX-30,y,60,2);
      t21(x,`${S.sc[0]} × ${S.sc[1]}`,W/2,30,{size:34,w:800});if(SETS>1)t21(x,`sets ${S.sets[0]} × ${S.sets[1]}`,W/2,58,{size:13,col:'#ffd36b'});
      t21(x,tname(0),14,62,{size:13,w:600,al:'left',col:'#d9cbb0'});t21(x,tname(1),W-14,62,{size:13,w:600,al:'right',col:'#d9cbb0'});
      if(S.touch.t>=0&&S.touch.n>0){const tx=S.touch.t?W*.75:W*.25;t21(x,'●'.repeat(S.touch.n)+'○'.repeat(Math.max(0,3-S.touch.n)),tx,86,{size:14,col:S.touch.n>=3?'#ff8a8a':'#fff'})}
      /* previsão do Olho da Verdade */
      const myT=me?me.team:0;if((C.host?S.eye[myT]:0)>0){const pr=predict(myT,GY-BR,true);x.strokeStyle='#ff8fb1';x.lineWidth=3;x.beginPath();x.ellipse(pr.x,GY-2,22,6,0,0,TAU16);x.stroke()}
      ps.forEach(p=>{const px=C.host?p.x:p.dx,py=C.host?p.y:p.dy;x.save();if(p.dive>0){x.translate(px,py+12);x.rotate(p.f*1.1);x.translate(-px,-(py+12))}mgCat(x,p.c,px,py-4,R*2.5,p.n,{flip:p.f<0,ring:p.u===C.me});x.restore();
        x.fillStyle='rgba(0,0,0,.45)';x.fillRect(px-20,py+R+2,40,4);x.fillStyle=p.en>=100?'#ffd36b':'#c39bff';x.fillRect(px-20,py+R+2,40*p.en/100,4);if(p.en>=100)t21(x,VBEL54[p.el].ico,px+28,py-R,{size:14})});
      const b=S.b,gv=S.ghost>0&&Math.floor(now/90)%3!==0;if(!gv){const fire=!!S.fire,g2=x.createRadialGradient(b.x-5,b.y-5,2,b.x,b.y,BR);g2.addColorStop(0,fire?'#fff3b0':'#e9fbff');g2.addColorStop(.5,fire?'#ff9b3d':'#5fd6ff');g2.addColorStop(1,fire?'#c03010':'#1f6fb8');
        x.save();x.shadowColor=fire?'#ff6b3d':'#7fe3ff';x.shadowBlur=fire?28:18;x.beginPath();x.arc(b.x,b.y,BR*(ar==='pesada'?1.12:1),0,TAU16);x.fillStyle=g2;x.fill();x.restore()}
      if(b.y+BR<0){const hgt=-b.y,sz=clamp12(22-hgt/40,9,22),ax=clamp12(b.x,14,W-14);x.save();x.fillStyle='#7fe3ff';x.beginPath();x.moveTo(ax,4);x.lineTo(ax-sz*.75,4+sz);x.lineTo(ax+sz*.75,4+sz);x.closePath();x.fill();x.restore()}
      if((C.host?S.wait:S.w)>0)t21(x,'Saque!',b.x,b.y-40,{size:15,w:600});
      if(S.msg&&now-S.msgT<2200)t21(x,S.msg,W/2,140,{size:22,w:800,col:'#ffd36b',stroke:4})}
  };
}
Object.assign(ACH,{
  vb_copa:{ico:'🏆',n:'Copa do Véu',d:'Vença o Perseus Supremo na Copa do Véu do Volley.'},
  vb_rally:{ico:'🏐',n:'Rali Infinito',d:'Faça um rali de 20 toques no Tulpa Volley.'},
  vb_ace:{ico:'🎯',n:'Ace',d:'Faça um ponto direto do saque no Tulpa Volley.'},
  vb_bloqueio:{ico:'🧱',n:'Paredão',d:'Bloqueie uma bola na rede no Tulpa Volley.'},
  vb_perfeito:{ico:'✨',n:'Pneu',d:'Vença uma partida do Volley sem levar ponto.',secret:true},
});
{const _p=padHtml;padHtml=function(p){const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='vb54')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}${b('Space','⤒','','Pular')}</div><div>${b('KeyS','💥','','Ação: cortada, bloqueio ou mergulho')}${b('KeyE','✨','','Poder Elemental')}</div>`;return _p.apply(this,arguments)}}
defineArcadeGame('volley',{...GAMES12.volley,make:volley54,setup:vbSetup54,pad:'vb54',modes:['ai','mesa'],max:6,
  desc:'Vôlei 2D com 3 toques por lado, sets, cortada, bloqueio, mergulho, Poderes Elementais, 4 arenas e a Copa do Véu. Até 3 × 3 na mesa.',
  rule:'No máximo 3 toques por lado. Sets de 7, 11 ou 15 pontos (11 e 15 com 2 de vantagem).',
  keys:'A/D andam · W/Espaço pulam · S/K ação · E poder'});
console.info('[Tulpa] Etapa 54 carregada (Tulpa Volley 2.0)');

/* ===================================================================
   TULPA · ETAPA 55 — 🕹 ARCADE 2.0 · ONDA 9 (parte 2)
   🦇 VOO ALÉM DO VÉU 2.0
   Jornada de 6 Céus (25 colunas cada), cada um com uma regra nova:
   Crepúsculo, Tempestade (rajadas e trovões), Espelho (anéis invertem a
   gravidade), Abismo (morcegos no vão), Fé (anéis dourados obrigatórios)
   e Véu (escuridão: só a lanterna ilumina). Infinito com fases.
   Óbolos no caminho compram Rastros. Poderes: Escudo, Câmera Lenta,
   Ímã, Mini e Turbo. Mesa: todos voam juntos como fantasmas.
   =================================================================== */
const VOSK55=[{n:'Crepúsculo',ico:'🌆',d:'O céu de sempre, com colunas que se mexem.',c:['#1a0f2a','#4a2a3a']},{n:'Tempestade',ico:'⛈',d:'Rajadas empurram você para cima ou para baixo.',c:['#0e1626','#2a3646']},
  {n:'Espelho',ico:'🪞',d:'Anéis prateados invertem a gravidade.',c:['#141a2a','#3a4a6a']},{n:'Abismo',ico:'🦇',d:'Morcegos de sombra patrulham os vãos.',c:['#08060e','#22142e']},
  {n:'Fé',ico:'✨',d:'Passe por 15 anéis dourados para concluir.',c:['#2a1c06','#5a3a10']},{n:'Véu',ico:'🌫',d:'Escuridão total: só a lanterna ilumina.',c:['#050408','#120c1a']}];
const VOTR55=[{k:'base',n:'Sem rastro',c:0,col:null},{k:'fe',n:'Rastro da Fé',c:40,col:['#ffd36b','#fff1a8']},{k:'nat',n:'Rastro da Natureza',c:80,col:['#7dffa8','#3fae5a']},{k:'ilu',n:'Rastro da Ilusão',c:140,col:['#ff7ac8','#7fe3ff','#ffd36b','#b48cff']},{k:'ine',n:'Rastro do Vazio',c:200,col:['#2a0040','#c58bff']},{k:'ver',n:'Rastro da Verdade',c:300,col:['#ff8fb1','#fff']}];
const VOGOAL55=25;
function voProg55(){const p=prog38().vo||{};return{sky:p.sky||{},bank:p.bank||0,tr:p.tr||{base:1},best:p.best||0,sel:p.sel||'base'}}
const voOpen55=i=>i===0||!!voProg55().sky[i-1];
const voSetup55={
  intro:o=>o._m==='mesa'?'Todos voam o mesmo céu ao mesmo tempo, como fantasmas. Vence quem for mais longe (Óbolos desempatam).':'Pegue Óbolos no caminho para comprar Rastros. Cada Céu vencido abre o próximo.',
  def:()=>({m:'jor',sk:'0',tr:voProg55().sel||'base'}),
  fields:o=>{const p=voProg55(),mesa=o._m==='mesa',F=[{k:'m',l:'Modo',opts:[{v:'jor',n:'Jornada',ico:'🗺',d:`6 Céus de ${VOGOAL55} colunas.`},{v:'inf',n:'Infinito',ico:'♾',d:'Até cair. Fica mais difícil a cada 10.',badge:p.best?`🏆 ${p.best}`:''}]}];
    if(o.m==='jor')F.push({k:'sk',l:'Céu',wide:1,opts:VOSK55.map((s,i)=>{const lock=!mesa&&!voOpen55(i),st=p.sky[i]||0;return{v:String(i),n:`${i+1}. ${s.n}`,ico:s.ico,d:lock?'Vença o Céu anterior.':s.d,lock,badge:st?'★'.repeat(st)+'☆'.repeat(3-st):''}})});
    F.push({k:'tr',l:`Rastro (🪙 ${p.bank} Óbolos guardados)`,wide:1,opts:VOTR55.map(t=>{const own=!!p.tr[t.k];return{v:t.k,n:t.n,ico:own?'✓':'🪙',d:own?'Seu.':`Custa ${t.c} Óbolos do Voo.`,badge:own?'':String(t.c)}})});return F},
  fix:o=>{if(!['jor','inf'].includes(o.m))o.m='jor';let i=Math.max(0,Math.min(5,+o.sk||0));if(o._m!=='mesa')while(i>0&&!voOpen55(i))i--;o.sk=String(i);
    const p=voProg55(),t=VOTR55.find(q=>q.k===o.tr)||VOTR55[0];if(!p.tr[t.k]){if(p.bank>=t.c&&o._m!=='mesa'){progPut38(q=>{q.vo=q.vo||{};q.vo.tr=q.vo.tr||{base:1};q.vo.bank=(q.vo.bank||0)-t.c;q.vo.tr[t.k]=1;q.vo.sel=t.k});fx5('mgWin');o.tr=t.k}else o.tr=p.sel||'base'}else progPut38(q=>{q.vo=q.vo||{};q.vo.sel=t.k})},
  sum:()=>'Espaço, ↑ ou clique: bater as asas. 🛡 Escudo · ⏳ Câmera lenta · 🧲 Ímã · 🔹 Mini · 🚀 Turbo (atravessa 3 colunas).'
};

function voo55(C){
  const W=480,H=640,BX=130,PW=66,G=1450,FL=-470,FLOOR=H-40,o=C.room.opt||{},jor=o.m!=='inf',sk=jor?Math.max(0,Math.min(5,+o.sk||0)):-1,SK=jor?VOSK55[sk]:null;
  const GAP=gdPick(C.gd,[205,176,160,146])+(sk===4?-6:0),DX=gdPick(C.gd,[252,232,222,210]),AMP=gdPick(C.gd,[30,40,52,74])*(sk===0||sk===3?1:sk<0?0:.5),SP0=gdPick(C.gd,[140,165,188,212]),SPMAX=gdPick(C.gd,[70,95,110,125]);
  const trail=VOTR55.find(t=>t.k===o.tr)||VOTR55[0];
  const S={y:H*.42,vy:0,d:0,t:0,score:0,coins:0,coinTot:0,sh:0,inv:0,slow:0,mag:0,mini:0,turbo:0,pw:new Set(),got:new Set(),ph:0,gdir:1,rings:0,light:220,used:false,saves:0,won:false,parts:[],flashT:0,thunder:3},R=ghostRace(C,S);
  const hr=(i,k)=>hrand(C.seed+sk*977,i,k);
  const gapOf=i=>jor?Math.max(GAP-30,GAP-Math.floor(i/8)*5):Math.max(GAP-48,GAP-Math.floor(i/10)*8);
  const PWK=['sh','sl','mag','mini','tur'];
  const pwOf=i=>i>2&&hr(i,5)<.14?PWK[Math.floor(hr(i,6)*5)]:sk===5&&i%5===2?'lan':null;
  const BASE=[];const baseOf=i=>{if(i<0)return FLOOR/2;if(BASE[i]!=null)return BASE[i];const prev=i>0?baseOf(i-1):FLOOR/2;const v=clamp12(prev+(hr(i,1)-.5)*2*(jor?170:185),130,FLOOR-130);BASE[i]=v;return v};
  const pipe=i=>{const base=baseOf(i),bat=sk===3&&i>1&&hr(i,7)<.4,mv=!bat&&AMP&&hr(i,2)<.45,g=gapOf(i),ts=Math.max(0,(Date.now()-C.t0)/1000),gy=mv?clamp12(base+Math.sin(ts*(1.3+hr(i,3))+i)*AMP,g/2+24,FLOOR-g/2-24):clamp12(base,g/2+24,FLOOR-g/2-24);
    return{x:380+i*DX,gy,mv,g,pw:pwOf(i),i,bat,gust:sk===1&&i%3===1?(hr(i,8)<.5?-1:1):0,mirror:sk===2&&i%4===3,ring:sk===4&&i>0,coin:hr(i,9)<.6}};
  const batY=(p,q)=>clamp12((p.gy+q.gy)/2+Math.sin(S.t*1.1+p.i)*150,40,FLOOR-40);
  const speed=()=>(SP0+Math.min(SPMAX,S.t*2.4))*(S.turbo>0?1.6:1);
  const me=C.players.find(p=>p.u===C.me)||{n:'Você',c:0};
  const flap=()=>{if(S.dead||Date.now()<C.t0)return;S.vy=FL*S.gdir;fx5('mgJump')};
  const score=()=>S.score*10+S.coins;
  function finish(win){if(S.dead)return;S.won=win;
    let st=0,first=false,rec=false;const goldOk=sk!==4||S.rings>=15;
    if(win){st=1+(S.coins>=S.coinTot*.8?1:0)+(!S.used&&!S.saves?1:0)}
    progPut38(q=>{q.vo=q.vo||{};q.vo.sky=q.vo.sky||{};q.vo.bank=(q.vo.bank||0)+S.coins;if(jor&&win){first=!q.vo.sky[sk];if(st>(q.vo.sky[sk]||0))q.vo.sky[sk]=st;if(VOSK55.every((_,i)=>q.vo.sky[i]))C.achieve?.('voo_jornada');if(VOSK55.every((_,i)=>q.vo.sky[i]===3))C.achieve?.('voo_estrelas')}if(!jor&&S.score>(q.vo.best||0)){q.vo.best=S.score;rec=true}if(Object.keys(q.vo.tr||{}).length>=4)C.achieve?.('voo_rastro')});
    if(!jor&&S.score>=100)C.achieve?.('voo_100');
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(160,Math.round((S.score/3+S.coins/4)*mul)+(win?10+sk*2:0)+(first?15:0)+(rec?5:0)),why:[jor?SK.n:'Infinito',win?'★'.repeat(st):'',first?'céu novo':'',rec?'recorde':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);S.st=st;
    S.html=`<ul class="r38-l"><li>🏛 Colunas: <b>${S.score}</b>${jor?`/${VOGOAL55}`:''}</li><li>🪙 Óbolos do Voo: <b>${S.coins}</b> de ${S.coinTot} (guardados para os Rastros)</li>${sk===4?`<li>✨ Anéis dourados: <b>${S.rings}</b>/15</li>`:''}<li>🛡 Salvamentos: <b>${S.saves}</b></li></ul>${jor&&win&&first&&sk<5?`<p class="r38-hi">Céu ${sk+2}: ${esc(VOSK55[sk+1].n)} foi aberto.</p>`:''}`;
    if(C.net){R.die(score()+(win?500:0));return}
    S.dead=true;fx5(win?'mgWin':'fumble');
    C.finish({title:win?`🦇 ${SK.n} vencido! ${'★'.repeat(st)}${'☆'.repeat(3-st)}`:jor?`🦇 Você caiu no ${SK.n} · ${S.score}/${VOGOAL55} colunas${sk===4&&S.score>=VOGOAL55&&!goldOk?' (faltaram anéis)':''}`:`🦇 Você caiu com ${S.score} colunas`,rows:[{u:C.me,n:me.n,c:me.c,s:score(),w:win}],unit:'pts',html:S.html})}
  return{st:()=>S,pipe,flap,finish,speedNow:()=>speed()*(S.slow>0?.6:1),
    reward:()=>S.rw||null,
    next(){if(C.net)return null;if(jor){if(S.won&&sk<5)return{opt:{sk:String(sk+1)},label:`Céu ${sk+2}: ${VOSK55[sk+1].n}`};return{opt:{},label:'Tentar de novo'}}return{opt:{},label:'Voar de novo'}},
    key(code,down){if(down&&(code==='Space'||code==='ArrowUp'||code==='KeyW'))flap()},
    ptr(t){if(t==='down')flap()},
    step(dt){
      const now=Date.now();if(now<C.t0){S.y=H*.42+Math.sin(now/220)*8;return}
      S.t+=dt;const sp=speed();['slow','inv','mag','mini','turbo','flashT'].forEach(k=>S[k]=Math.max(0,S[k]-dt));
      for(const u in S.gh){const g=S.gh[u];if(!g.dead&&g.d!=null)g.d+=sp*dt}
      if(S.dead){const lead=Object.values(S.gh).filter(g=>!g.dead&&g.d!=null).sort((a,b)=>b.d-a.d)[0];S.cam=lead?lead.d:S.cam;return}
      const k=S.slow>0?.6:1,BR=S.mini>0?10:16;
      if(sk===1){S.thunder-=dt;if(S.thunder<=0){S.thunder=4+hr(Math.floor(S.t),11)*4;S.flashT=.25;fx5('bb6')}}
      if(sk===5)S.light=Math.max(80,S.light-dt*14);
      S.vy+=G*S.gdir*k*dt;S.y+=S.vy*k*dt;S.d+=sp*k*dt;S.cam=S.d;
      let hit=S.y>FLOOR-BR||S.y<BR;
      const i0=Math.max(0,Math.floor((S.d+BX-380-PW-DX)/DX));
      for(let i=i0;i<i0+3;i++){const p=pipe(i),px=p.x-S.d;
        if(BX+BR>px&&BX-BR<px+PW&&(S.y-BR<p.gy-p.g/2||S.y+BR>p.gy+p.g/2))hit=true;
        
        /* entre a coluna i e a i+1 */
        const mx=px+PW+(DX-PW)/2,q=pipe(i+1),my=(p.gy+q.gy)/2;
        if(p.gust&&BX>px+PW&&BX<px+DX){S.vy+=p.gust*900*dt}
        if(p.bat){const by=batY(p,q),bx=mx;if(Math.hypot(BX-bx,S.y-by)<BR+10)hit=true}
        if(p.mirror&&!S.got.has('m'+i)&&Math.abs(BX-mx)<20&&Math.abs(S.y-my)<70){S.got.add('m'+i);S.gdir*=-1;S.vy*=-.3;fx5('activate');C.fx?.flash('#cfe0ff',.25);C.fx?.float(BX+40,S.y-30,S.gdir>0?'⬇ gravidade':'⬆ gravidade invertida',{col:'#cfe0ff',size:18})}
        if(p.ring&&!S.got.has('r'+i)&&Math.abs(BX-mx)<18&&Math.abs(S.y-my)<34){S.got.add('r'+i);S.rings++;fx5('mgCoin');C.fx?.float(BX+30,S.y-24,`✨ ${S.rings}/15`,{col:'#ffd36b',size:16})}
        if(p.coin){for(let c=0;c<3;c++){const cid=`c${i}_${c}`;if(S.got.has(cid))continue;const cx=px+PW+20+c*((DX-PW-40)/2),cy=p.gy+(q.gy-p.gy)*((c+1)/4);let dx=BX-cx,dy=S.y-cy;
          if(S.mag>0&&Math.hypot(dx,dy)<160){dx*=.5;dy*=.5}if(Math.hypot(dx,dy)<BR+10){S.got.add(cid);S.coins++;fx5('mgCoin')}}}
        if(p.pw&&!S.pw.has(i)&&Math.hypot(BX-(px+PW/2),S.y-p.gy)<BR+16){S.pw.add(i);fx5('activate');C.fx?.burst(BX,S.y,{n:16,kind:'star',col:['#8fe8ff','#fff'],sp:170,life:.6,size:3});if(p.pw!=='lan')S.used=true;
          const lb={sh:'🛡 Escudo',sl:'⏳ Câmera lenta',mag:'🧲 Ímã',mini:'🔹 Mini',tur:'🚀 Turbo',lan:'🏮 Lanterna'}[p.pw];C.fx?.float(BX+40,S.y-30,lb,{col:'#8fe8ff',size:18});
          if(p.pw==='sh')S.sh=1;else if(p.pw==='sl')S.slow=4;else if(p.pw==='mag')S.mag=8;else if(p.pw==='mini')S.mini=8;else if(p.pw==='tur'){S.turbo=2.2;S.inv=Math.max(S.inv,2.4)}else S.light=240}}
      S.coinTot=Math.max(S.coinTot,(()=>{let n=0;const last=Math.floor((S.d+BX-380)/DX);for(let i=0;i<=Math.min(last,jor?VOGOAL55-1:last);i++)if(pipe(i).coin)n+=3;return n})());
      if(hit&&(S.inv>0||S.sh>0)){if(S.inv<=0){S.sh=0;S.inv=1.2;S.saves++;fx5('activate');C.fx?.flash('#8fe8ff',.35);C.fx?.float(BX,S.y-40,'🛡 Salvo!',{col:'#8fe8ff',size:22});C.fx?.shake(5,.2)}S.y=clamp12(S.y,BR+2,FLOOR-BR-2);if(S.vy*S.gdir>0)S.vy=-260*S.gdir;hit=false}
      const sc=Math.max(0,Math.floor((S.d+BX-380-PW)/DX)+1);if(sc>S.score){S.score=sc;fx5('mgCoin');C.fx?.float(BX+30,S.y-28,'+1',{col:'#ffd36b',size:16,life:.6});
        const ph=Math.floor(sc/10);if(!jor&&ph>S.ph){S.ph=ph;fx5('mgWin');C.fx?.flash('#b48cff',.25);C.fx?.float(W/2,H*.3,`FASE ${ph+1}`,{col:'#ffd36b',size:42,life:1.4})}}
      if(trail.col){S.parts.push({x:BX-14,y:S.y+(Math.random()-.5)*8,d:S.d,t:0,c:trail.col[Math.floor(Math.random()*trail.col.length)]})}
      S.parts.forEach(q=>q.t+=dt);S.parts=S.parts.filter(q=>q.t<.6);
      R.send({d:Math.round(S.d),y:Math.round(S.y),s:S.score});
      if(jor&&S.score>=VOGOAL55){if(sk===4&&S.rings<15){/* sem anéis suficientes: continua até completar */if(S.score>=VOGOAL55+15){finish(false);return}}else{finish(true);return}}
      if(hit){C.fx?.shake(10,.4);C.fx?.burst(BX,S.y,{n:22,col:['#b48cff','#fff','#6b4f9e'],sp:240,life:.8,size:3,grav:600});if(Math.random()<.5)C.say(sayFmt(SAY12.fall),false);finish(false);return}
      C.hud(`🦇 ${jor?`${SK.ico} ${SK.n} · <b>${S.score}</b>/${VOGOAL55}`:`<b>${S.score}</b> colunas · fase ${S.ph+1}`} · 🪙 ${S.coins}${sk===4?` · ✨ ${S.rings}/15`:''}${S.sh?' · 🛡':''}${S.slow>0?' · ⏳':''}${S.mag>0?' · 🧲':''}${S.mini>0?' · 🔹':''}${S.turbo>0?' · 🚀':''}${C.net?` · ${Object.values(S.gh).filter(g=>!g.dead).length+(S.dead?0:1)} voando`:''}`)},
    msg:R.msg,left:R.left,
    draw(x){
      const cam=S.cam??S.d,now=performance.now(),cols=SK?SK.c:['#0e0b1f','#2b1c3f'],gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,cols[0]);gr.addColorStop(1,cols[1]);x.fillStyle=gr;x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<50;i++){const sx=((i*97-cam*.15)%W+W)%W;x.fillRect(sx,(i*53)%(FLOOR-20),1.5,1.5)}
      const BR=S.mini>0?10:16,i0=Math.max(0,Math.floor((cam-380-PW-DX)/DX));
      for(let i=i0;i<i0+5;i++){const p=pipe(i),px=p.x-cam;if(px>W+DX)break;const q=pipe(i+1);
        if(p.gust){x.fillStyle=p.gust<0?'rgba(120,200,255,.08)':'rgba(255,160,120,.08)';x.fillRect(px+PW,0,DX-PW,FLOOR);x.strokeStyle='rgba(200,230,255,.3)';for(let k=0;k<6;k++){const yy=((now/4*(p.gust)+k*110)%FLOOR+FLOOR)%FLOOR;x.beginPath();x.moveTo(px+PW+20+k*24,yy);x.lineTo(px+PW+20+k*24,yy+30*p.gust);x.stroke()}}
        const col=x.createLinearGradient(px,0,px+PW,0);col.addColorStop(0,'#1a1030');col.addColorStop(.5,sk===4?'#7a5a20':'#4b2f7a');col.addColorStop(1,'#1a1030');x.fillStyle=col;
        x.fillRect(px,0,PW,p.gy-p.g/2);x.fillRect(px,p.gy+p.g/2,PW,FLOOR-(p.gy+p.g/2));x.fillStyle=p.mv?'#ff9ad5':sk===4?'#ffd36b':'#b48cff';x.fillRect(px-4,p.gy-p.g/2-10,PW+8,10);x.fillRect(px-4,p.gy+p.g/2,PW+8,10);
        if(p.bat){t21(x,'🦇',px+PW+(DX-PW)/2,batY(p,q),{size:24})}
        const mx=px+PW+(DX-PW)/2,my=(p.gy+q.gy)/2;
        if(p.mirror&&!S.got.has('m'+i)){x.strokeStyle='#cfe0ff';x.lineWidth=4;x.beginPath();x.ellipse(mx,my,12,60,0,0,TAU16);x.stroke()}
        if(p.ring&&!S.got.has('r'+i)){x.strokeStyle='#ffd36b';x.lineWidth=4;x.shadowColor='#ffd36b';x.shadowBlur=12;x.beginPath();x.ellipse(mx,my,10,30,0,0,TAU16);x.stroke();x.shadowBlur=0}
        if(p.coin)for(let c=0;c<3;c++){if(S.got.has(`c${i}_${c}`))continue;const cx=px+PW+20+c*((DX-PW-40)/2),cy=p.gy+(q.gy-p.gy)*((c+1)/4);x.beginPath();x.arc(cx,cy,7,0,TAU16);x.fillStyle='#ffd36b';x.fill();x.strokeStyle='#a07a10';x.lineWidth=1.5;x.stroke()}
        if(p.pw&&!S.pw.has(i)){const by=p.gy+Math.sin(S.t*4+i)*6;x.fillStyle='#8fe8ff';x.beginPath();x.arc(px+PW/2,by,15,0,7);x.fill();t21(x,{sh:'🛡',sl:'⏳',mag:'🧲',mini:'🔹',tur:'🚀',lan:'🏮'}[p.pw],px+PW/2,by+1,{size:16})}
        if(jor&&i===VOGOAL55-1){x.fillStyle='rgba(255,211,107,.3)';x.fillRect(px+PW+4,0,6,FLOOR);t21(x,'🏁',px+PW+7,30,{size:20})}}
      x.fillStyle='#1c1426';x.fillRect(0,FLOOR,W,H-FLOOR);x.fillStyle='#6b4f9e';x.fillRect(0,FLOOR,W,3);
      S.parts.forEach(q=>{const k=q.t/.6;x.globalAlpha=1-k;x.fillStyle=q.c;x.beginPath();x.arc(q.x-(cam-q.d),q.y,5*(1-k)+1,0,TAU16);x.fill()});x.globalAlpha=1;
      for(const u in S.gh){const g=S.gh[u];if(g.d==null)continue;const gx=BX+(g.d-cam);if(gx<-40||gx>W+40)continue;mgCat(x,R.col(u),gx,g.y,46,R.nm(u),{alpha:g.dead?.18:.42})}
      if(!S.dead){x.save();if(S.inv>0&&Math.floor(S.inv*12)%2)x.globalAlpha=.4;if(S.gdir<0){x.translate(BX,S.y);x.scale(1,-1);x.translate(-BX,-S.y)}mgCat(x,me.c,BX,S.y,S.mini>0?30:48,me.n,{flip:false});x.restore();
        if(S.sh){x.strokeStyle='rgba(143,232,255,.85)';x.lineWidth=3;x.beginPath();x.arc(BX,S.y,BR+14,0,7);x.stroke()}if(S.turbo>0){x.fillStyle='rgba(255,160,80,.5)';x.beginPath();x.moveTo(BX-20,S.y-12);x.lineTo(BX-70,S.y);x.lineTo(BX-20,S.y+12);x.fill()}if(S.slow>0){x.fillStyle='rgba(180,140,255,.1)';x.fillRect(0,0,W,H)}}
      if(sk===5){const lr=S.light;const vg=x.createRadialGradient(BX,S.y,lr*.3,BX,S.y,lr);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.97)');x.fillStyle=vg;x.fillRect(0,0,W,H)}
      if(S.flashT>0){x.fillStyle=`rgba(230,240,255,${S.flashT*2})`;x.fillRect(0,0,W,H)}
      t21(x,String(S.score),W/2,90,{size:44,w:800,stroke:5});if(jor)t21(x,`/${VOGOAL55}`,W/2+44,96,{size:16,col:'#ccc'});t21(x,`🪙 ${S.coins}`,W-14,26,{size:16,al:'right',col:'#ffd36b',stroke:3});
      if(S.dead&&!MG.over)t21(x,`Você parou com ${S.score} colunas. Assistindo os outros…`,W/2,H/2,{size:16,col:'#ffd1d1'})}
  };
}
Object.assign(ACH,{
  voo_jornada:{ico:'🗺',n:'Seis Céus',d:'Vença os 6 Céus da Jornada do Voo Além do Véu.'},
  voo_100:{ico:'🦇',n:'Cem Colunas',d:'Passe por 100 colunas no Voo Infinito.'},
  voo_rastro:{ico:'🌈',n:'Colecionador de Rastros',d:'Tenha 4 Rastros no Voo Além do Véu.'},
  voo_estrelas:{ico:'⭐',n:'Céu Estrelado',d:'Tire 3 estrelas nos 6 Céus do Voo.',secret:true},
});
defineArcadeGame('voo',{...GAMES12.voo,make:voo55,setup:voSetup55,modes:['solo','mesa'],max:6,
  desc:'Jornada de 6 Céus com regras próprias (rajadas, espelhos, morcegos, anéis dourados, escuridão), Infinito, Óbolos, Rastros e 5 poderes.',
  rule:'Passe pelas colunas. Na Jornada, chegue à coluna 25 de cada Céu.'});
console.info('[Tulpa] Etapa 55 carregada (Voo Além do Véu 2.0)');

