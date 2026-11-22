/* ===================================================================
   TULPA · ETAPA 30 — Motivos para juntar Óbolos (100% fora das regras)
   🪑 Quarto decorado + 🏘️ visitar o Perseus dos amigos com carinho
   🃏 Cápsulas e Álbum de Figurinhas (Comum, Raro, Épico, Mítico)
   ✨ Cosméticos: molduras animadas, títulos e efeitos de dado
   🎯 Missões do dia e 🎰 apostas amigáveis nos jogos competitivos
   Tudo fica em PET.x30 (salvo junto com o Perseus, na ficha).
   =================================================================== */
const PS30={deco:null,visit:null,raf:0,gtab:'cap',opening:false,likes:{},likesAt:0,bets:{},paid:{},betDone:{}};
T3.x30=PS30;
const MV30={
  poster:{n:'Pôster do Véu',ico:'🖼️',p:40,x:58,y:96,s:56,d:'Um mapa antigo do Véu, preso com fita.'},
  neon:{n:'Letreiro Neon',ico:'💡',p:70,x:232,y:44,s:42,d:'Pisca “TULPA” de madrugada.'},
  globo:{n:'Globo Astral',ico:'🔮',p:65,x:334,y:96,s:44,d:'Mostra o céu de outro plano.'},
  estante:{n:'Estante de Grimórios',ico:'📚',p:55,x:46,y:214,s:58,d:'Livros que sussurram quando ninguém olha.'},
  aquario:{n:'Aquário Etéreo',ico:'🐠',p:90,x:432,y:150,s:44,d:'Peixes que nadam no ar.'},
  fliperama:{n:'Fliperama',ico:'🕹️',p:150,x:46,y:330,s:64,d:'Joga Voo Além do Véu sozinho, de noite.'},
  planta:{n:'Plantinha da Natureza',ico:'🪴',p:30,x:446,y:360,s:52,d:'Cresce um pouco a cada carinho.'},
  vitrola:{n:'Vitrola',ico:'📻',p:80,x:378,y:376,s:46,d:'Toca discos antigos de Essência.'},
  discos:{n:'Coleção de Discos',ico:'💿',p:45,x:336,y:398,s:30,d:'Do Ritual Rhythm aos clássicos.'},
  tapete:{n:'Tapete Rúnico',ico:'🟣',p:35,x:214,y:404,s:34,d:'Fica embaixo do Perseus. Ele aprova.'},
  telescopio:{n:'Telescópio',ico:'🔭',p:110,x:142,y:392,s:40,d:'Para espiar o Plano Astral.'},
  trofeu:{n:'Troféu do Arcade',ico:'🏆',p:120,x:130,y:96,s:38,d:'Ninguém sabe de qual jogo.'},
};
const CARDS30=[
  ['nat','Natureza','🌿','c','Folha que fala com raízes.'],['ine','Inexistência','🕳️','c','Um buraco que olha de volta.'],['ilu','Ilusão','🎭','c','Nada aqui é o que parece.'],['ver','Verdade','👁️','c','O olho que não pisca.'],['fe','Fé','🕯️','c','A vela que nunca apaga.'],
  ['ampola','Ampola de Essência','🧪','c','Brilha quando alguém mente.'],['fita','Fita K7 Maldita','📼','c','Lado B: só estática.'],['lanterna','Lanterna Fraca','🔦','c','Pisca nas horas erradas.'],['emf','Medidor EMF','📟','c','Apita perto do Mestre.'],['racao','Ração Astral','🥣','c','O Perseus aprova.'],
  ['loaf','Perseus Pão','🍞','c','Formato de pão. Cortisol zero.'],['chill','Perseus de Boa','😎','c','Nada abala.'],['guaxinim','Guaxinim do Lixo','🦝','c','Parente distante.'],
  ['cao','Cão de Fumaça','🐕','r','Late sem som.'],['guarda','Homem do Guarda-chuva','☂️','r','Nunca chove onde ele está.'],['sombra','Sombra Faminta','👤','r','Come a luz da lanterna.'],['boneca','Boneca do Sótão','🪆','r','Muda de lugar à noite.'],
  ['67','Perseus 67','6️⃣','r','Ninguém sabe por quê.'],['omg','Perseus OMG','😱','r','Viu o 20 natural.'],['guitarra','Perseus Guitarrista','🎸','r','Solo de Essência.'],['espelho','Espelho Partido','🪞','r','Sete anos de Lucidez.'],
  ['colapso','Colapso de Lucidez','🌀','e','A mente rachou.'],['extase','Êxtase','✨','e','Tudo brilha demais.'],['abismo','Labirinto do Abismo','🗝️','e','A chave abre outra porta.'],['trono','Trono do Mestre','👑','e','Só um senta.'],['vazio','O Vazio','⬛','e','Não tem verso.'],
  ['veu','Além do Véu','🌌','m','O outro lado também te vê.'],['perseus','Perseus Cósmico','🐈‍⬛','m','O gato original. Holográfico.'],['mestre','O Mestre','🎲','m','Rola atrás do escudo.'],['tulpa','A Tulpa','🫥','m','Nasceu da sua mente.'],
].map(([id,n,ico,r,d])=>({id,n,ico,r,d}));
const RAR30={c:{n:'Comum',w:60,dup:4},r:{n:'Raro',w:27,dup:8},e:{n:'Épico',w:10,dup:15},m:{n:'Mítico',w:3,dup:30}};
const CAP30=25;
const FR30={fogo:{n:'Fogo Astral',ico:'🔥',p:120,d:'Chamas azuis giram em volta da foto.'},glitch:{n:'Glitch',ico:'📺',p:110,d:'A foto treme como fita velha.'},neon:{n:'Brilho Neon',ico:'💗',p:90,d:'Contorno rosa e ciano que pulsa.'},dourado:{n:'Dourado',ico:'🥇',p:180,d:'Moldura de ouro com brilho correndo.'}};
const TT30={volei:{n:'Lenda do Vôlei',p:80},inabalavel:{n:'Mente Inabalável',p:80},uno:{n:'Mestre do UNO',p:70},rei:{n:'Rei do Arcade',p:150},gato:{n:'Tutor de Gato Astral',p:50},colecao:{n:'Colecionador do Véu',p:0,need:'Complete 20 figurinhas do Álbum.'},sortudo:{n:'Sortudo do 20',p:100},sombra:{n:'Andarilho das Sombras',p:90}};
const DX30={brasas:{n:'Brasas',ico:'🔥',p:70,col:['#ff9b3d','#ffd36b','#ff5a2a']},estrelas:{n:'Chuva de Estrelas',ico:'⭐',p:80,col:['#fff4b0','#ffd36b','#b9c8ff']},glitch:{n:'Glitch',ico:'👾',p:90,col:['#00f0ff','#ff2bd6','#ffffff']},ouro:{n:'Ouro',ico:'🪙',p:120,col:['#ffd36b','#e8b04a','#fff1c0']},coracoes:{n:'Corações',ico:'💜',p:60,col:['#ff7ab6','#c08cff','#ffd1e8']}};
const MS30=[
  {id:'voo20',t:'Faça 20 pontos no Voo Além do Véu',g:'voo',k:'score',n:20,r:40},
  {id:'salto',t:'Faça 300 pontos no Salto Astral',g:'salto',k:'score',n:300,r:35},
  {id:'uno',t:'Vença 1 partida de UNO Teosófico',g:'uno',k:'win',n:1,r:50},
  {id:'velha',t:'Vença 1 Jogo da Velha Teosófico',g:'velha',k:'win',n:1,r:35},
  {id:'volley',t:'Vença 1 partida de Tulpa Volley',g:'volley',k:'win',n:1,r:50},
  {id:'rinha',t:'Vença 1 luta na Rinha de Tulpas',g:'rinha',k:'win',n:1,r:45},
  {id:'rhythm',t:'Vença 1 duelo no Ritual Rhythm',g:'rhythm',k:'win',n:1,r:45},
  {id:'play3',t:'Jogue 3 partidas de qualquer jogo',g:'*',k:'play',n:3,r:30},
  {id:'play5',t:'Jogue 5 partidas de qualquer jogo',g:'*',k:'play',n:5,r:45},
  {id:'runner',t:'Corra 600 m no Corredor do Vazio',g:'runner',k:'score',n:600,r:40},
  {id:'blast',t:'Faça 400 pontos no Block Blast Astral',g:'blast',k:'score',n:400,r:35},
  {id:'feed',t:'Alimente o Perseus 3 vezes',g:'pet',k:'feed',n:3,r:25},
  {id:'caps',t:'Abra 1 cápsula de figurinhas',g:'pet',k:'caps',n:1,r:20},
  {id:'visit',t:'Deixe um carinho no Perseus de alguém',g:'pet',k:'like',n:1,r:25},
];
const BETG30=['volley','rhythm','uno','rinha','velha','fuga','runner','vazio','corrida'];
const BETV30=[0,10,25,50,100];

/* ---------- estado salvo ---------- */
function x30(){
  petLoad20();const b={mv:{own:{},on:{}},cards:{},caps:0,cos:{own:{fr:{},tt:{},dx:{}},eq:{fr:'',tt:'',dx:''}},miss:{day:'',list:[]},bets:{}};
  const x=PET.x30=PET.x30&&typeof PET.x30==='object'?PET.x30:{};
  x.mv={own:{...(x.mv?.own||{})},on:{...(x.mv?.on||{})}};x.cards={...(x.cards||{})};x.caps=Number(x.caps)||0;
  x.cos={own:{fr:{...(x.cos?.own?.fr||{})},tt:{...(x.cos?.own?.tt||{})},dx:{...(x.cos?.own?.dx||{})}},eq:{...b.cos.eq,...(x.cos?.eq||{})}};
  x.miss=x.miss&&typeof x.miss==='object'?x.miss:b.miss;x.bets=x.bets&&typeof x.bets==='object'?x.bets:{};
  return x;
}
T3.x30data=x30;
const save30=()=>petSave20(true);
/* cosméticos e quarto dos outros jogadores (vêm da ficha deles) */
function petOfUid30(u){
  if(!u)return null;if(u===uid3()){petLoad20();return PET}
  const ch=(chars3()||[]).find(c=>c.ownerId===u&&!gmChar6(c)&&d14(c).perseus);return ch?d14(ch).perseus:null;
}
const cosOf30=u=>petOfUid30(u)?.x30?.cos?.eq||{};

/* ---------- 🎯 missões do dia ---------- */
const day30=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function hash30(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function missions30(){
  const x=x30(),dk=day30();
  if(x.miss.day!==dk||!Array.isArray(x.miss.list)||x.miss.list.length!==3){
    const pool=MS30.slice();let h=hash30(dk+'|'+uid3());const pick=[];
    while(pick.length<3&&pool.length){const i=h%pool.length;pick.push(pool.splice(i,1)[0].id);h=hash30(h+':'+pick.length)}
    x.miss={day:dk,list:pick.map(id=>({id,p:0,done:false,paid:false}))};save30();
  }
  return x.miss.list.map(m=>({...m,def:MS30.find(d=>d.id===m.id)})).filter(m=>m.def);
}
function progress30(kind,{g='',score=0,win=false,n=1}={}){
  try{
    const x=x30();missions30();let ch=false;
    x.miss.list.forEach(m=>{const d=MS30.find(q=>q.id===m.id);if(!d||m.done)return;
      if(d.k!==kind)return;if(d.g!=='*'&&d.g!=='pet'&&d.g!==g)return;
      if(kind==='score')m.p=Math.max(m.p,Number(score)||0);else if(kind==='win'){if(win)m.p+=1}else m.p+=n;
      if(m.p>=d.n){m.done=true;m.p=d.n;if(!m.paid){m.paid=true;petEarn20(d.r,'Missão cumprida: '+d.t);fx5('mgWin');toast('🎯 Missão cumprida: '+d.t+' (+'+d.r+' 🪙)')}}
      ch=true});
    if(ch)save30();
  }catch(e){console.warn('[T30] missão',e)}
}
T3.mission30=progress30;
/* ---------- 🃏 cápsulas ---------- */
function roll30(){const tot=Object.values(RAR30).reduce((a,r)=>a+r.w,0);let k=Math.random()*tot,rar='c';for(const [id,r] of Object.entries(RAR30)){if(k<r.w){rar=id;break}k-=r.w}
  const pool=CARDS30.filter(c=>c.r===rar);return pool[Math.floor(Math.random()*pool.length)]}
function openCap30(){
  const x=x30();if(PS30.opening)return null;
  if(PET.coins<CAP30){toast(`🪙 Faltam ${CAP30-PET.coins} Óbolos para uma cápsula.`);fx5('error');return null}
  PET.coins-=CAP30;x.caps++;const c=roll30(),dup=(x.cards[c.id]||0)>0;x.cards[c.id]=(x.cards[c.id]||0)+1;
  let back=0;if(dup){back=RAR30[c.r].dup;PET.coins+=back}
  save30();petHeader20();progress30('caps');
  if(Object.keys(x.cards).length>=20&&!x.cos.own.tt.colecao){x.cos.own.tt.colecao=1;save30();toast('🏅 Título liberado: Colecionador do Véu')}
  return{c,dup,back};
}
T3.cap30=openCap30;
/* ---------- telas novas dentro do Perseus ---------- */
const NEWTABS30=[['deco','🪑 Decorar'],['visit','🏘️ Visitar'],['gacha','🃏 Cápsulas'],['cos','✨ Visual da Mesa'],['miss','🎯 Missões']];
NEWTABS30.forEach(t=>{if(!TABS20.some(x=>x[0]===t[0]))TABS20.splice(TABS20.length-2,0,t)});
{const _pr30=petRender20;petRender20=function(){
  const mine=NEWTABS30.some(t=>t[0]===PS20.tab);cancelAnimationFrame(PS30.raf);PS30.raf=0;PS30.visit=PS30.visit&&PS20.tab==='visit'?PS30.visit:null;
  if(!mine)return _pr30.apply(this,arguments);
  const real=PS20.tab;PS20.tab='rank';try{_pr30.apply(this,arguments)}finally{PS20.tab=real}
  $$('[data-ptab]').forEach(b=>{const on=b.dataset.ptab===real;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  const body=$('ptBody');if(!body)return;
  if(real==='deco')decoTab30(body);else if(real==='visit')visitTab30(body);else if(real==='gacha')gachaTab30(body);else if(real==='cos')cosTab30(body);else missTab30(body);
}}
/* --- 🪑 quarto --- */
function deco30(x,on,t){
  Object.keys(on||{}).forEach(k=>{const m=MV30[k];if(!m)return;
    x.save();x.font=`${m.s}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;x.textAlign='center';x.textBaseline='middle';
    if(k==='neon'){x.shadowColor='#ff4fd8';x.shadowBlur=10+Math.sin((t||0)*3)*6}
    if(k==='aquario'){x.translate(0,Math.sin((t||0)*1.6)*2)}
    x.fillText(m.ico,m.x,m.y);x.restore()});
}
{const _dl30=drawLamp20;drawLamp20=function(x,on,t){_dl30.apply(this,arguments);if(PS30.deco)try{deco30(x,PS30.deco,t)}catch(e){}}}
{const _pd30=petDraw20;petDraw20=function(x,t){PS30.deco=x30().mv.on;try{return _pd30.apply(this,arguments)}finally{PS30.deco=null}}}
function roomCanvas30(cv,pet,t=1){
  const x=cv.getContext('2d'),eq=pet?.eq||{sk:'orig',bg:'quarto'},k=cv.width/PW20;
  x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.scale(k,cv.height/PH20);
  drawBg20(x,eq.bg||'quarto',PW20,PH20,t,true);PS30.deco=pet?.x30?.mv?.on||{};drawLamp20(x,true,t);PS30.deco=null;
  const im=petImg20(eq,-1);if(im){const s=CS20;x.drawImage(im,CX20-s/2,CY20+s*.5-s,s,s)}
  x.restore();
}
function decoTab30(body){
  const x=x30();
  body.innerHTML=`<div class="x30"><p class="pt-hint">Monte o quarto do seu Perseus. Os amigos da mesa podem visitar e deixar carinho.</p><canvas class="x30-room" id="x30room" width="480" height="420" aria-label="Prévia do quarto"></canvas>
    <div class="pt-shop">${Object.entries(MV30).map(([k,m])=>{const own=!!x.mv.own[k],on=!!x.mv.on[k];return`<article class="pt-item${on?' eq':''}"><div class="x30-ico" aria-hidden="true">${m.ico}</div><div class="pt-itx"><b>${esc(m.n)}</b><span class="sub">${esc(m.d)}</span></div><button type="button" class="btn small ${own?'':'primary'}" data-mv30="${k}">${!own?`Comprar · 🪙 ${m.p}`:on?'Guardar':'Colocar no quarto'}</button></article>`}).join('')}</div></div>`;
  const cv=$('x30room');const loop=now=>{roomCanvas30(cv,PET,now/1000);PS30.raf=requestAnimationFrame(loop)};if(SPR.ok)PS30.raf=requestAnimationFrame(loop);else setTimeout(()=>roomCanvas30(cv,PET),400);
  $$('[data-mv30]').forEach(b=>b.onclick=()=>{const k=b.dataset.mv30,m=MV30[k];
    if(!x.mv.own[k]){if(PET.coins<m.p){toast(`🪙 Faltam ${m.p-PET.coins} Óbolos para ${m.n}.`);fx5('error');return}PET.coins-=m.p;x.mv.own[k]=1;x.mv.on[k]=1;fx5('buy20');toast(`🪑 ${m.n} já está no quarto.`)}
    else if(x.mv.on[k])delete x.mv.on[k];else x.mv.on[k]=1;
    save30();petRender20()});
}
/* --- 🏘️ visitar --- */
async function likes30(force){
  if(!camp3())return PS30.likes;if(!force&&Date.now()-PS30.likesAt<15000)return PS30.likes;PS30.likesAt=Date.now();
  try{const L=await stList6('like30');const m={};(L||[]).forEach(r=>{const t=r.meta?.t;if(!t)return;(m[t]=m[t]||[]).push(r.meta)});PS30.likes=m}catch(e){console.warn('[T30] carinhos',e)}
  return PS30.likes;
}
function friends30(){
  const seen=new Set(),out=[];
  (chars3()||[]).forEach(c=>{if(!c||!c.ownerId||c.ownerId===uid3()||gmChar6(c)||seen.has(c.ownerId))return;const p=d14(c).perseus;if(!p||!p.eq)return;seen.add(c.ownerId);out.push({u:c.ownerId,n:nm(c),p})});
  return out;
}
async function visitTab30(body){
  if(PS30.visit)return visitRoom30(body,PS30.visit);
  const fr=friends30(),L=await likes30();const mine=(L[uid3()]||[]).length;
  if(PS20.tab!=='visit')return;
  body.innerHTML=`<div class="x30"><p class="pt-hint">Seu Perseus recebeu <b>${mine}</b> ${mine===1?'carinho':'carinhos'}. Visite o quarto dos amigos da mesa e deixe um carinho (1 por dia em cada).</p>
    ${fr.length?`<ul class="x30-fr">${fr.map(f=>`<li><canvas width="160" height="140" data-fr30="${esc(f.u)}" aria-hidden="true"></canvas><div><b>${esc(f.n)}</b><span class="sub">❤️ ${(L[f.u]||[]).length} · ${Object.keys(f.p.x30?.mv?.on||{}).length} móveis</span></div><button type="button" class="btn small primary" data-v30="${esc(f.u)}">Visitar</button></li>`).join('')}</ul>`:'<p class="empty">Ninguém da mesa abriu o Perseus ainda. Quando abrirem, o quarto aparece aqui.</p>'}</div>`;
  const draw=()=>$$('[data-fr30]').forEach(cv=>{const f=fr.find(q=>q.u===cv.dataset.fr30);if(f)roomCanvas30(cv,f.p)});if(SPR.ok)draw();else setTimeout(draw,400);
  $$('[data-v30]').forEach(b=>b.onclick=()=>{PS30.visit=b.dataset.v30;petRender20()});
}
async function visitRoom30(body,u){
  const f=friends30().find(q=>q.u===u);if(!f){PS30.visit=null;return visitTab30(body)}
  const L=await likes30(),k='like30:'+u+':'+uid3()+':'+day30(),done=(L[u]||[]).some(m=>m.f===uid3()&&m.day===day30());
  if(PS20.tab!=='visit')return;
  body.innerHTML=`<div class="x30"><div class="x30-vhead"><button type="button" class="btn small" id="x30back">← Voltar</button><h3>Quarto do Perseus de ${esc(f.n)}</h3><span class="sub">❤️ ${(L[u]||[]).length}</span></div><canvas class="x30-room" id="x30vroom" width="480" height="420" aria-label="Quarto de ${esc(f.n)}"></canvas>
    <button type="button" class="btn primary" id="x30like" ${done?'disabled':''}>${done?'💜 Carinho deixado hoje':'💜 Deixar carinho'}</button></div>`;
  const cv=$('x30vroom');const loop=now=>{roomCanvas30(cv,f.p,now/1000);PS30.raf=requestAnimationFrame(loop)};if(SPR.ok)PS30.raf=requestAnimationFrame(loop);else setTimeout(()=>roomCanvas30(cv,f.p),400);
  $('x30back').onclick=()=>{PS30.visit=null;petRender20()};
  $('x30like').onclick=async()=>{const b=$('x30like');b.disabled=true;
    try{await stPut6(k,'like30',{meta:{t:u,f:uid3(),n:mgName?.()||'',day:day30(),at:Date.now()}});(PS30.likes[u]=PS30.likes[u]||[]).push({t:u,f:uid3(),day:day30()});
      try{mgSend('like30',{to:u,n:mgName?.()||'Alguém'})}catch(e){}
      fx5('coin20');toast(`💜 Carinho deixado no Perseus de ${f.n}.`);progress30('like');petRender20()}
    catch(e){b.disabled=false;toast('Não consegui deixar o carinho agora.')}};
}
{const _om30=mgOnMsg;mgOnMsg=function(p){
  try{
    if(p&&p.t==='like30'&&p.to===uid3()){toast(`💜 ${String(p.n||'Alguém').slice(0,32)} deixou um carinho no seu Perseus!`);PS30.likesAt=0;return}
    if(p&&p.t==='bet30'&&p.id){(PS30.paid[p.id]=PS30.paid[p.id]||{})[p.from]=!!p.ok;return}
  }catch(e){}
  return _om30.apply(this,arguments);
}}
/* --- 🃏 cápsulas e álbum --- */
function gachaTab30(body){
  const x=x30(),have=Object.keys(x.cards).length;
  body.innerHTML=`<div class="x30"><div class="x30-sub" role="tablist">${[['cap','🎰 Máquina'],['alb',`📒 Álbum ${have}/${CARDS30.length}`]].map(([k,l])=>`<button type="button" role="tab" class="pt-tab${PS30.gtab===k?' on':''}" aria-selected="${PS30.gtab===k}" data-g30="${k}">${l}</button>`).join('')}</div><div id="x30g"></div></div>`;
  $$('[data-g30]').forEach(b=>b.onclick=()=>{PS30.gtab=b.dataset.g30;petRender20()});
  const g=$('x30g');
  if(PS30.gtab==='alb'){
    g.innerHTML=`<p class="pt-hint">Repetidas viram Óbolos: Comum +${RAR30.c.dup}, Raro +${RAR30.r.dup}, Épico +${RAR30.e.dup}, Mítico +${RAR30.m.dup}.</p><ul class="x30-album">${CARDS30.map(c=>{const n=x.cards[c.id]||0;return`<li class="x30-card r-${c.r}${n?'':' lock'}" title="${n?esc(c.n):'Ainda não tem'}"><span class="x30-cico" aria-hidden="true">${n?c.ico:'?'}</span><b>${n?esc(c.n):'???'}</b><span class="x30-rar">${RAR30[c.r].n}${n>1?' · x'+n:''}</span></li>`}).join('')}</ul>`;
    return;
  }
  g.innerHTML=`<div class="x30-mach"><div class="x30-capsule" id="x30cap" aria-hidden="true">🥚</div><p>Cada cápsula custa <b>🪙 ${CAP30}</b>. Chances: Comum ${RAR30.c.w}%, Raro ${RAR30.r.w}%, Épico ${RAR30.e.w}%, Mítico ${RAR30.m.w}%.</p><button type="button" class="btn primary" id="x30open">Girar a máquina · 🪙 ${CAP30}</button><div id="x30res" aria-live="polite"></div></div>`;
  $('x30open').onclick=()=>{if(PS30.opening)return;const r=openCap30();if(!r)return;PS30.opening=true;const cap=$('x30cap'),res=$('x30res');cap.classList.add('shake');fx5('activate');
    setTimeout(()=>{PS30.opening=false;if(!$('x30res'))return;cap.classList.remove('shake');cap.textContent='✨';
      res.innerHTML=`<div class="x30-card big r-${r.c.r} reveal"><span class="x30-cico" aria-hidden="true">${r.c.ico}</span><b>${esc(r.c.n)}</b><span class="x30-rar">${RAR30[r.c.r].n}</span><span class="sub">${esc(r.c.d)}</span>${r.dup?`<span class="sub">Repetida: +${r.back} 🪙</span>`:'<span class="x30-new">Nova no álbum!</span>'}</div>`;
      fx5(r.c.r==='m'||r.c.r==='e'?'mgWin':'confirm');if(r.c.r==='m')try{T3.perseusAnim?.react('win')}catch(e){}
      const lb=document.querySelector('[data-g30="alb"]');if(lb)lb.textContent=`📒 Álbum ${Object.keys(x30().cards).length}/${CARDS30.length}`},reduce30()?50:1000)};
}
const reduce30=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
/* --- ✨ cosméticos --- */
function cosTab30(body){
  const x=x30(),eq=x.cos.eq,own=x.cos.own;
  const btn=(cat,k,p,need)=>{const o=!!own[cat][k]||p===0&&!need,on=eq[cat]===k;return`<button type="button" class="btn small ${o?'':'primary'}" data-c30="${cat}|${k}" ${need&&!own[cat][k]?'disabled':''}>${on?'Tirar':o?'Usar':need?'Bloqueado':`Comprar · 🪙 ${p}`}</button>`};
  body.innerHTML=`<div class="x30"><p class="pt-hint">Só visual: aparece para a mesa toda e não muda nenhuma regra do RPG.</p>
   <section class="pt-shop-sec"><h3>Molduras animadas</h3><p class="sub">Na sua foto do card da mesa.</p><div class="pt-shop">${Object.entries(FR30).map(([k,f])=>`<article class="pt-item${eq.fr===k?' eq':''}"><div class="x30-frprev fr30 fr30-${k}"><span>${esc((nm(myArcChar?.()||{})||'?').slice(0,1))}</span></div><div class="pt-itx"><b>${f.ico} ${esc(f.n)}</b><span class="sub">${esc(f.d)}</span></div>${btn('fr',k,f.p)}</article>`).join('')}</div></section>
   <section class="pt-shop-sec"><h3>Títulos</h3><p class="sub">Embaixo do seu nome na mesa e no Arcade.</p><div class="pt-shop">${Object.entries(TT30).map(([k,t])=>`<article class="pt-item${eq.tt===k?' eq':''}"><div class="pt-itx"><b class="tt30">${esc(t.n)}</b><span class="sub">${t.need?esc(t.need):''}</span></div>${btn('tt',k,t.p,t.need)}</article>`).join('')}</div></section>
   <section class="pt-shop-sec"><h3>Efeitos de dado</h3><p class="sub">Partículas quando você rola um dado na mesa.</p><div class="pt-shop">${Object.entries(DX30).map(([k,d])=>`<article class="pt-item${eq.dx===k?' eq':''}"><div class="x30-dxprev" style="--c1:${d.col[0]};--c2:${d.col[1]}" aria-hidden="true">${d.ico}</div><div class="pt-itx"><b>${esc(d.n)}</b></div>${btn('dx',k,d.p)}</article>`).join('')}</div></section></div>`;
  $$('[data-c30]').forEach(b=>b.onclick=()=>{const [cat,k]=b.dataset.c30.split('|'),def=(cat==='fr'?FR30:cat==='tt'?TT30:DX30)[k];
    if(!own[cat][k]&&!(def.p===0&&!def.need)){if(def.need)return;if(PET.coins<def.p){toast(`🪙 Faltam ${def.p-PET.coins} Óbolos.`);fx5('error');return}PET.coins-=def.p;own[cat][k]=1;eq[cat]=k;fx5('buy20');toast(`✨ ${def.n} é seu e já está em uso.`)}
    else eq[cat]=eq[cat]===k?'':k;
    save30();petRender20();cosApply30(true)});
}
/* --- 🎯 missões --- */
function missTab30(body){
  const L=missions30();
  body.innerHTML=`<div class="x30"><p class="pt-hint">Três desafios novos por dia. Valem Óbolos, nunca bônus no RPG.</p><ol class="x30-miss">${L.map(m=>`<li class="${m.done?'done':''}"><div class="grow"><b>${esc(m.def.t)}</b><i class="pt-xp"><em style="width:${Math.round(100*Math.min(1,m.p/m.def.n))}%"></em></i><span class="sub">${m.done?'Cumprida':`${m.def.k==='score'?'Melhor: ':''}${m.p} / ${m.def.n}`}</span></div><span class="x30-rew">${m.done?'✓':'🪙 '+m.def.r}</span></li>`).join('')}</ol>
   <p class="sub">Apostas amigáveis: nas salas multiplayer de Vôlei, Ritual Rhythm (FNF), UNO, Rinha e Jogo da Velha, o anfitrião escolhe quanto cada um aposta. Quem vencer leva o pote.</p></div>`;
}
/* progresso de cuidados (alimentar) */
{const _pf30=petEat20;petEat20=function(){const out=_pf30.apply(this,arguments);try{progress30('feed')}catch(e){}return out}}

/* ---------- 🎰 apostas amigáveis ---------- */
const betOk30=r=>!!r&&r.mode==='multi'&&BETG30.includes(r.g);
{const _lb30=mgLobby;mgLobby=function(){
  const out=_lb30.apply(this,arguments);
  try{
    const r=MG.room,m=$('mgMain');if(!r||!m)return out;
    /* títulos ao lado do nome */
    $$('.mg-players li',m).forEach((li,i)=>{const p=r.players[i];if(!p||li.querySelector('.tt30'))return;const tt=TT30[cosOf30(p.u).tt];if(tt)li.querySelector('b')?.insertAdjacentHTML('afterend',`<span class="tt30">${esc(tt.n)}</span>`)});
    if(!betOk30(r))return out;
    const host=r.host===uid3(),bet=Number(r.bet)||0,pot=bet*r.players.length;petLoad20();
    const box=document.createElement('div');box.className='x30-bet';
    box.innerHTML=`<p class="mgb-h">🎰 Aposta amigável (Óbolos do Arcade)</p>${host?`<div class="mg-diff mini" role="group" aria-label="Valor da aposta">${BETV30.map(v=>`<button type="button" class="mg-dchip${v===bet?' on':''}" data-bet30="${v}">${v?'🪙 '+v:'Sem aposta'}</button>`).join('')}</div>`:''}
      <p class="sub">${bet?`Cada um aposta <b>🪙 ${bet}</b>. Pote: <b>🪙 ${pot}</b>. ${GAMES12[r.g]?.top3&&r.players.length>=3?'Pódio: 1º leva 60%, 2º 30% e 3º 10%.':'Quem vencer leva tudo; empate devolve.'}`:'Sem aposta nesta sala.'}${bet&&PET.coins<bet?` <b class="x30-warn">Você tem só 🪙 ${PET.coins}: vai jogar fora do pote.</b>`:''}</p>`;
    (m.querySelector('.mg-rule')||m.querySelector('.mg-lbtn'))?.after(box);
    $$('[data-bet30]',box).forEach(b=>b.onclick=()=>{MG.room.bet=Number(b.dataset.bet30)||0;mgPublish();mgLobby()});
  }catch(e){console.warn('[T30] aposta',e)}
  return out;
}}
{const _sl30=mgStartLocal;mgStartLocal=function(room,seed,t0){
  const out=_sl30.apply(this,arguments);
  try{
    const bet=Number(room?.bet)||0,key=room.id+':'+seed;
    if(betOk30(room)&&bet>0&&room.players.some(p=>p.u===uid3())&&!PS30.betDone[key]){
      petLoad20();const x=x30(),ok=PET.coins>=bet;
      if(ok){PET.coins-=bet;x.bets[key]={bet,at:Date.now()};save30();toast(`🎰 Você apostou 🪙 ${bet}. Boa sorte!`)}else toast('🎰 Sem Óbolos para a aposta: você joga fora do pote.');
      PS30.betDone[key]={bet,ok,n:room.players.length};(PS30.paid[room.id]=PS30.paid[room.id]||{})[uid3()]=ok;PS30.cur=key;
      mgSend('bet30',{id:room.id,ok});
    }else PS30.cur=bet>0?key:null;
  }catch(e){console.warn('[T30] aposta início',e)}
  return out;
}}
{const _so30=mgShowOver;mgShowOver=function(res){
  const out=_so30.apply(this,arguments);
  try{
    const g=MG.room?.g||MG.C?.room?.g||'',mine=(res?.rows||[]).find(q=>q.u===uid3());
    if(mine){progress30('play',{g});progress30('score',{g,score:mine.s});if(mine.w)progress30('win',{g,win:true})}
    const key=PS30.cur,b=key&&PS30.betDone[key];
    if(b&&!b.settled){b.settled=true;const id=key.split(':')[0],paid=PS30.paid[id]||{},x=x30();
      const payers=Object.keys(paid).filter(u=>paid[u]),pot=b.bet*Math.max(payers.length,1);
      const wins=(res.rows||[]).filter(q=>q.w&&paid[q.u]);let line='';
      const top3=!!GAMES12[g]?.top3&&payers.length>=3,podium=top3?(res.rows||[]).filter(q=>paid[q.u]&&q.s>0).slice(0,3):[];
      if(b.ok&&top3){const i=podium.findIndex(q=>q.u===uid3());
        if(!podium.length){PET.coins+=b.bet;line=`🎰 Ninguém pontuou: sua aposta de 🪙 ${b.bet} voltou.`}
        else if(i>=0){const sh=[.6,.3,.1].slice(0,podium.length),tot=sh.reduce((a,v)=>a+v,0),prize=Math.floor(pot*sh[i]/tot);PET.coins+=prize;PET.st.earned=(PET.st.earned||0)+prize-b.bet;line=`🎰 ${i+1}º lugar no pote: +🪙 ${prize}!`;fx5('coin20')}
        else line=`🎰 Fora do pódio (−🪙 ${b.bet}). Revanche?`;
        delete x.bets[key];save30();petHeader20?.();
      }else if(b.ok){
        if(!wins.length){PET.coins+=b.bet;line=`🎰 Ninguém do pote venceu: sua aposta de 🪙 ${b.bet} voltou.`}
        else if(wins.some(q=>q.u===uid3())){const prize=Math.floor(pot/wins.length);PET.coins+=prize;PET.st.earned=(PET.st.earned||0)+prize-b.bet;line=`🎰 Você levou o pote: +🪙 ${prize}!`;fx5('coin20')}
        else line=`🎰 Perdeu a aposta (−🪙 ${b.bet}). Revanche?`;
        delete x.bets[key];save30();petHeader20?.();
      }else line=wins.length?`🎰 ${esc(wins.map(q=>q.n).join(', '))} levou o pote de 🪙 ${pot}.`:'';
      const card=$('mgOver')?.querySelector('.mg-ocard');if(card&&line)card.querySelector('.mg-rank')?.insertAdjacentHTML('afterend',`<p class="x30-betres">${line}</p>`);
    }
  }catch(e){console.warn('[T30] fim de jogo',e)}
  return out;
}}

/* ---------- ✨ cosméticos na mesa ---------- */
function cosApply30(force){
  const c=camp3();if(!c)return;
  $$('#tableCharacters .table-char').forEach(card=>{
    const ch=charById(card.dataset.cid);if(!ch||!ch.ownerId||gmChar6(ch))return;
    const eq=cosOf30(ch.ownerId),av=card.querySelector('.tc-head>:first-child'),sig=[eq.fr||'',eq.tt||''].join('|');
    if(!force&&card.dataset.c30===sig&&(!eq.fr||av?.classList.contains('fr30-'+eq.fr)))return;card.dataset.c30=sig;
    if(av){[...av.classList].filter(k=>k.startsWith('fr30-')).forEach(k=>av.classList.remove(k));av.classList.toggle('fr30',!!eq.fr);if(eq.fr)av.classList.add('fr30-'+eq.fr)}
    let t=card.querySelector('.tc-id .tt30');const tt=TT30[eq.tt];
    if(tt){if(!t){t=document.createElement('span');t.className='tt30';card.querySelector('.tc-id h3')?.after(t)}t.textContent=tt.n}else t?.remove();
  });
}
setInterval(()=>{try{cosApply30(false)}catch(e){}},1600);
/* efeito de dado: partículas na rolagem (pelo dono do personagem) */
{const _rf30=window.tulpaRollFx;window.tulpaRollFx=function(box,o={}){
  const out=_rf30?_rf30.apply(this,arguments):undefined;
  try{
    const who=(o.who||[])[0]||'',ch=(chars3()||[]).find(c=>nm(c)===who);const u=ch?.ownerId||(who?'':uid3());
    const dx=DX30[cosOf30(u||uid3()).dx];if(!dx||!box)return out;
    box.classList.add('dx30');box.style.setProperty('--dx1',dx.col[0]);box.style.setProperty('--dx2',dx.col[1]);
    if(reduce30())return out;
    const n=18;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='dx30-p';const a=Math.random()*Math.PI*2,r=60+Math.random()*90;
      s.style.cssText=`--x:${Math.cos(a)*r}px;--y:${Math.sin(a)*r}px;background:${dx.col[i%dx.col.length]};animation-delay:${Math.random()*.15}s`;box.append(s);setTimeout(()=>s.remove(),1300)}
  }catch(e){}
  return out;
}}
console.info('[Tulpa] Etapa 30 carregada');
T3.mg30={lobby:()=>mgLobby(),start:(r,s,t)=>mgStartLocal(r,s,t),over:res=>mgShowOver(res)};

