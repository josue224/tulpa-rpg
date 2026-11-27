/* ===================================================================
   TULPA · ETAPA 50 — 🕹 ARCADE 2.0 · ONDA 7 (parte 1)
   🥊 RINHA DE TULPAS 2.0 — luta 2D de verdade
   5 lutadores (um por Elemento) + Perseus Supremo (chefe do Torneio).
   Golpe Leve (rápido, abre combos) · Pesado (dano e empurrão) ·
   Agarrão (quebra a defesa) · Dash/Esquiva (invencível no começo) ·
   Defesa Perfeita (bloquear no instante do golpe atordoa o rival).
   Barra de Essência com 3 níveis: 1 barra = Especial EX, 3 = Supremo.
   Modos: Melhor de 3, Torneio (5 lutas), Treino (hitboxes e dano do
   combo) e PvP.
   =================================================================== */
const RF50={
  fe:{n:'Paladino da Fé',el:'Fé',ico:'✶',col:'#ffd36b',tint:'rgba(255,200,80,.5)',hp:100,spd:230,jv:820,r1:72,r2:94,sp:'Lança de Luz',ex:'Lança Dupla',su:'Julgamento Solar',d:'Equilibrado. Lança projéteis de luz.'},
  nat:{n:'Guardiã da Natureza',el:'Natureza',ico:'🌿',col:'#7dffa8',tint:'rgba(90,220,130,.5)',hp:115,spd:195,jv:760,r1:82,r2:112,sp:'Chicote de Raiz',ex:'Raiz Prisão',su:'Floresta Viva',d:'Lenta e resistente, com o maior alcance.'},
  ine:{n:'Vazio Errante',el:'Inexistência',ico:'🕳',col:'#c58bff',tint:'rgba(150,90,255,.5)',hp:88,spd:290,jv:880,r1:64,r2:84,sp:'Passo do Vazio',ex:'Passo Duplo',su:'Colapso',d:'Rápido e frágil. Teleporta pelas costas.'},
  ilu:{n:'Ilusionista',el:'Ilusão',ico:'🌀',col:'#7fe3ff',tint:'rgba(100,220,255,.5)',hp:95,spd:250,jv:840,r1:70,r2:90,sp:'Espelho',ex:'Espelho Duplo',su:'Mil Reflexos',d:'Manda clones que atropelam o rival.'},
  ver:{n:'Oráculo da Verdade',el:'Verdade',ico:'👁',col:'#ff8fb1',tint:'rgba(255,120,170,.5)',hp:100,spd:220,jv:800,r1:70,r2:98,sp:'Olho Penetrante',ex:'Raio que Atravessa',su:'Revelação',d:'Controla a distância com raios rápidos.'},
  boss:{n:'Perseus Supremo',el:'Todos',ico:'👑',col:'#ffffff',tint:'rgba(255,240,200,.35)',hp:150,spd:250,jv:850,r1:78,r2:102,sp:'Elemento Aleatório',ex:'Fúria Elemental',su:'Supremo dos Cinco',d:'O chefe final do Torneio.',boss:1},
};
const RFK50=['fe','nat','ine','ilu','ver'];
const RMV50={L:{st:.06,ac:.07,rc:.13,dmg:5,kb:120,stun:.3,y0:-95,y1:-40,meter:8},H:{st:.16,ac:.08,rc:.3,dmg:11,kb:300,stun:.45,y0:-100,y1:-30,meter:12},G:{st:.08,ac:.05,rc:.45,reach:64,grab:1}};
function riProg50(){const p=prog38().ri||{};return{tor:p.tor||0,win:p.win||{},best:p.best||0}}
const riSetup50={
  intro:o=>o._m==='pvp'?'Cada um escolhe o seu lutador. Melhor de 3 rounds.':'Escolha o seu lutador e o modo. No Torneio são 5 lutas até o Perseus Supremo.',
  def:()=>({m:'b3',f:'fe',o:'rnd',f2:'nat',dm:'cpu'}),
  fields:o=>{const pvp=o._m==='pvp',p=riProg50();const fo=(k,ex)=>RFK50.map(q=>({v:q,n:RF50[q].n,ico:RF50[q].ico,d:`${RF50[q].el} · ${RF50[q].d}`,badge:p.win[q]?`🏆 ${p.win[q]}`:''})).concat(ex||[]);
    if(pvp)return[{k:'f',l:'Lutador do anfitrião',wide:1,opts:fo('f')},{k:'f2',l:'Lutador do convidado',wide:1,opts:fo('f2')}];
    const F=[{k:'m',l:'Modo',opts:[{v:'b3',n:'Melhor de 3',ico:'🥊',d:'Uma luta contra o Perseus.'},{v:'tor',n:'Torneio',ico:'🏆',d:'5 lutas seguidas até o Perseus Supremo.',badge:p.tor?`👑 ×${p.tor}`:''},{v:'tre',n:'Treino',ico:'🎯',d:'Boneco, hitboxes e dano do combo.'}]},{k:'f',l:'Seu lutador',wide:1,opts:fo('f')}];
    if(o.m==='b3')F.push({k:'o',l:'Rival',wide:1,opts:[{v:'rnd',n:'Sorteado',ico:'🎲',d:'Um Elemento qualquer.'}].concat(RFK50.map(q=>({v:q,n:RF50[q].n,ico:RF50[q].ico,d:RF50[q].el}))).concat(p.tor?[{v:'boss',n:'Perseus Supremo',ico:'👑',d:'O chefe do Torneio.'}]:[])});
    if(o.m==='tre')F.push({k:'dm',l:'Boneco',opts:[{v:'par',n:'Parado',ico:'🧍',d:'Não faz nada.'},{v:'blk',n:'Bloqueia',ico:'🛡',d:'Defende tudo (teste o Agarrão).'},{v:'pul',n:'Pula',ico:'⤒',d:'Pula sem parar.'},{v:'cpu',n:'Luta',ico:'🤖',d:'Luta como o Perseus.'}]});
    return F},
  fix:o=>{if(!['b3','tor','tre'].includes(o.m))o.m='b3';if(!RFK50.includes(o.f))o.f='fe';if(!RFK50.includes(o.f2))o.f2='nat';if(!['rnd','boss',...RFK50].includes(o.o)||(o.o==='boss'&&!riProg50().tor))o.o='rnd';if(!['par','blk','pul','cpu'].includes(o.dm))o.dm='cpu'},
  sum:()=>'A/D andam · W pula · S defende (no instante do golpe = Defesa Perfeita) · J Leve · K Pesado · L Especial · H Agarrão · Espaço Dash · U Especial EX (1 barra) · I Supremo (3 barras).'
};

function rinha50(C){
  const W=800,H=450,FL=380,G=2300,o=C.room.opt||{},pvp=!!C.net,mode=pvp?'pvp':(o.m||'b3'),me=me21(C);
  const AIK={facil:{re:.5,bl:.15,pa:0,ag:.45,cb:.3},medio:{re:.3,bl:.35,pa:.08,ag:.6,cb:.6},dificil:{re:.17,bl:.55,pa:.2,ag:.72,cb:.85},pesadelo:{re:.09,bl:.75,pa:.35,ag:.85,cb:1}}[C.diff]||{re:.3,bl:.35,pa:.08,ag:.6,cb:.6};
  const rnd=mb32((C.seed^0x51a6)>>>0||3);
  /* torneio: escada de rivais */
  const tst=Math.max(0,Math.min(4,+o.st||0)),myK=pvp?(o.f||'fe'):(RFK50.includes(o.f)?o.f:'fe');
  const ladder=(()=>{const a=RFK50.filter(k=>k!==myK);const r=mb32((C.seed^0x70e)>>>0||5);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.concat(['boss'])})();
  const oppK=pvp?(o.f2||'nat'):mode==='tor'?ladder[tst]:mode==='tre'?(RFK50[(RFK50.indexOf(myK)+1)%5]):(o.o==='rnd'||!o.o?RFK50.filter(k=>k!==myK)[Math.floor(rnd()*4)]:o.o);
  const ps=pvp?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c},{u:'~p',n:RF50[oppK].n,c:-1}];
  const myI=pvp?Math.max(0,ps.findIndex(p=>p.u===C.me)):0;
  const mk=(i,k)=>{const D=RF50[k];return{i,k,D,x:i?560:240,y:FL,vy:0,vx:0,kb:0,face:i?-1:1,hp:D.hp,max:D.hp,meter:0,st:'idle',t:0,mv:null,hitDone:false,conf:false,chain:0,
    blk:false,blkT:9,inv:0,dashCd:0,spCd:0,combo:0,cdmg:0,inp:{},cnt:{},last:{},buf:null,bufT:0,hitT:0,parries:0,dmgTaken:0,clones:0,u:ps[i]?.u,n:ps[i]?.n||D.n}};
  const S={f:[mk(0,myK),mk(1,oppK)],ents:[],round:1,wins:[0,0],t:60,pause:1.8,msg:`Round 1`,sub:'',over:false,freeze:0,frz:null,sendAt:0,showHB:mode==='tre',best:0,lastCombo:null,
    stats:{combo:0,sup:0,parry:0,perfect:0},hits:[],shake:0,ai:{next:0,hold:{},t:0},tst,ladder};
  const keys={},myCnt={};
  const PRESS={KeyJ:'L',KeyK:'H',KeyL:'S',KeyH:'G',Space:'D',KeyU:'X',KeyI:'U',KeyW:'J',ArrowUp:'J'};
  function inpOf(){return{l:!!(keys.KeyA||keys.ArrowLeft),r:!!(keys.KeyD||keys.ArrowRight),b:!!(keys.KeyS||keys.ArrowDown),cnt:{...myCnt}}}
  function resetRound(){const old=S.f;S.f=[mk(0,myK),mk(1,oppK)];S.f.forEach((f,i)=>{f.meter=old[i].meter;f.last={...old[i].last};f.inp=old[i].inp;f.cnt=old[i].cnt});S.ents=[];S.t=60;S.pause=1.8;S.msg=`Round ${S.round}`;S.sub=''}
  const hurtbox=f=>({x0:f.x-24,x1:f.x+24,y0:f.y-108,y1:f.y});
  const overlap=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
  const ground=f=>f.y>=FL;
  const busy=f=>['atk','hit','bstun','dash','thrown','stuck','ko','tele'].includes(f.st);
  function start(f,k){
    const D=f.D;f.hitDone=false;f.conf=false;f.t=0;
    if(k==='L'||k==='H'){f.st='atk';f.mv={k,...RMV50[k],reach:k==='L'?D.r1:D.r2};return true}
    if(k==='G'){if(!ground(f))return false;f.st='atk';f.mv={k,...RMV50.G};return true}
    if(k==='D'){if(f.dashCd>0)return false;const back=(f.inp.r&&f.face<0)||(f.inp.l&&f.face>0)||(!f.inp.r&&!f.inp.l);f.st='dash';f.mv={dir:back?-f.face:f.face,back};f.inv=.16;f.dashCd=.55;fx5('mgJump');return true}
    if(k==='S'||k==='X'){if(f.spCd>0&&k==='S')return false;if(k==='X'){if(f.meter<100)return false;f.meter-=100}f.st='atk';f.mv={k:'SP',ex:k==='X',el:f.k==='boss'?RFK50[Math.floor(rnd()*5)]:f.k,st:.18,ac:0,rc:.38};f.spCd=.8;if(k==='X'){C.fx?.flash(f.D.col,.12);fx5('activate')}return true}
    if(k==='U'){if(f.meter<300)return false;f.meter-=300;S.freeze=.9;S.frz={f,el:f.k==='boss'?RFK50[Math.floor(rnd()*5)]:f.k};f.st='atk';f.mv={k:'SU',st:0,ac:0,rc:.5};f.inv=1.2;S.stats.sup+=f.i===myI?1:0;fx5('bb7');C.fx?.flash('#000',.5);return true}
    return false}
  function damage(a,d,dmg,o2){/* o2: {kb,stun,un (inbloqueável), proj, sup, grab} */
    if(d.st==='ko')return'miss';d.idleT=0;if(d.inv>0&&!o2.grab)return'miss';
    const facing=Math.sign(a.x-d.x)===d.face||o2.proj&&Math.sign((o2.px??a.x)-d.x)===d.face;
    const canBlock=d.blk&&ground(d)&&!busy(d)&&facing&&!o2.grab;
    if(canBlock&&d.blkT<.15&&!o2.sup){/* Defesa Perfeita */
      d.meter=Math.min(300,d.meter+25);d.parries++;if(d.i===myI){S.stats.parry++;if(d.parries>=3)C.achieve?.('ri_parry')}
      if(!o2.proj){a.st='hit';a.t=0;a.stunT=.6;a.kb=0;a.mv=null}fx5('confirm');C.fx?.flash('#fff',.2);pop(d.x,d.y-120,'DEFESA PERFEITA!','#7fe3ff',22);return'parry'}
    if(canBlock&&!o2.un){const chip=Math.max(1,Math.round(dmg*(o2.sup?.4:.2)));d.hp=Math.max(0,d.hp-chip);d.st='bstun';d.t=0;d.stunT=.18;d.kb=-d.face*(o2.kb||100)*.5;d.meter=Math.min(300,d.meter+3);a.meter=Math.min(300,a.meter+3);fx5('click');if(d.hp<=0)ko(d);return'block'}
    const inCombo=d.st==='hit'||d.st==='thrown'||d.st==='stuck';if(!inCombo){d.combo=0;d.cdmg=0}
    const sc=Math.max(.5,Math.pow(.9,d.combo));const real=Math.max(1,Math.round(dmg*sc));d.combo++;d.cdmg+=real;
    d.hp=Math.max(0,d.hp-real);d.dmgTaken+=real;d.hitT=performance.now();d.st=o2.grab?'thrown':o2.stuck?'stuck':'hit';d.t=0;d.stunT=o2.stun??.35;d.mv=null;
    const dir=Math.sign(d.x-(o2.px??a.x))||-d.face;d.kb=dir*(o2.kb||120);if(o2.launch&&ground(d)){d.vy=-520}
    a.meter=Math.min(300,a.meter+(o2.meter||8));d.meter=Math.min(300,d.meter+5);
    if(a.i===myI||mode==='tre'){if(d.combo>=5&&a.i===myI)C.achieve?.('ri_combo');S.best=Math.max(S.best,d.combo)}
    if(o2.sup&&a.i===myI)C.achieve?.('ri_supremo');
    pop(d.x,d.y-118,String(real),o2.sup?'#ffd36b':'#fff',o2.sup?28:18);S.shake=Math.min(.35,.06+real/80);
    fx5(o2.sup?'bb7':real>=10?'bb4':'bb2');if(d.hp<=0)ko(d);return'hit'}
  function ko(d){d.st='ko';d.t=0;d.vy=-420;d.kb=-d.face*240;fx5('mgLose');C.fx?.shake(10,.5)}
  function pop(x,y,t,col,sz){S.hits.push({x,y,t,col,sz,at:performance.now()})}
  /* especiais por Elemento */
  function special(f,o,ex,el){const y=f.y-70,fc=f.face;
    if(el==='fe'){S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y,vx:fc*620,w:34,h:16,dmg:ex?9:9,col:'#ffd36b',life:2});if(ex)S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y:y-36,vx:fc*700,w:34,h:16,dmg:8,col:'#fff1a8',life:2});fx5('mgCoin')}
    else if(el==='ver'){S.ents.push({k:'proj',o:f.i,x:f.x+fc*40,y:y+6,vx:fc*920,w:ex?60:40,h:ex?14:8,dmg:ex?12:8,pierce:ex,col:'#ff8fb1',life:1.4});fx5('fumble')}
    else if(el==='nat'){S.ents.push({k:'whip',o:f.i,x:f.x+fc*(40+85),y:FL-24,w:190,h:40,dmg:12,col:'#4ad46a',life:.18,delay:0,kb:260});if(ex)S.ents.push({k:'trap',o:f.i,x:o.x,y:FL-14,w:70,h:30,dmg:8,col:'#2a8a40',life:.5,delay:.35,stuck:1,stun:1.0})}
    else if(el==='ine'){f.st='tele';f.t=0;f.inv=.3;f.mv={hits:ex?2:1,dmg:ex?7:9};C.fx?.burst(f.x,f.y-60,{n:14,col:['#c58bff','#000'],sp:180,life:.4,size:3,grav:0});f.x=clamp12(o.x-o.face*-1*0-(o.x>f.x?-1:1)*60,30,W-30);f.face=o.x>f.x?1:-1;fx5('activate')}
    else if(el==='ilu'){S.ents.push({k:'clone',o:f.i,x:f.x,y:f.y,vx:fc*640,w:46,h:100,dmg:8,col:'#7fe3ff',life:.7,dist:0});if(ex)S.ents.push({k:'clone',o:f.i,x:fc>0?W+30:-30,y:f.y,vx:-fc*640,w:46,h:100,dmg:8,col:'#b6f2ff',life:1.4})}}
  function supremo(f,el){const o=S.f[1-f.i];S.stats.supN=(S.stats.supN||0);
    if(el==='fe'||el==='nat'){S.ents.push({k:'pillar',o:f.i,x:o.x,y:FL-150,w:150,h:300,dmg:el==='fe'?30:32,col:el==='fe'?'#ffd36b':'#4ad46a',life:.5,delay:.25,sup:1,kb:200,launch:1})}
    else if(el==='ine'){S.ents.push({k:'hole',o:f.i,x:W/2,y:FL-90,w:20,h:20,dmg:28,col:'#120020',life:1.1,delay:0,sup:1})}
    else if(el==='ilu'){for(let i=0;i<6;i++){const L=i%2===0;S.ents.push({k:'clone',o:f.i,x:L?-40-i*30:W+40+i*30,y:FL,vx:(L?1:-1)*720,w:46,h:100,dmg:4.5,col:'#7fe3ff',life:2,sup:1,multi:1})}}
    else{S.ents.push({k:'beam',o:f.i,x:f.face>0?(f.x+W)/2:f.x/2,y:f.y-75,w:W,h:70,dmg:30,col:'#ff8fb1',life:.6,delay:.15,sup:1,kb:260})}
    pop(W/2,150,RF50[f.k].su+'!',f.D.col,30)}
  function landHit(f,o){const m=f.mv;if(!m||f.hitDone)return;
    const r=m.reach||64,hb={x0:f.face>0?f.x+10:f.x-10-r,x1:f.face>0?f.x+10+r:f.x-10,y0:f.y+(m.y0??-90),y1:f.y+(m.y1??-30)};f.hb=hb;
    if(!overlap(hb,hurtbox(o)))return;f.hitDone=true;
    if(m.grab){if(o.st==='hit'||!ground(o)||o.inv>0)return;const res=damage(f,o,10,{grab:1,kb:-f.face*320*-1,stun:.6,meter:12});o.x=clamp12(f.x-f.face*-50,30,W-30);o.kb=f.face*360;o.vy=-380;fx5('bb5');pop(o.x,o.y-140,'AGARRÃO!','#ff9b2f',20);return}
    const res=damage(f,o,m.dmg,{kb:m.kb,stun:m.stun,meter:m.meter,launch:m.k==='H'&&!ground(f)?0:0});if(res==='hit')f.conf=true}
  function step1(f,o,dt){
    const D=f.D,inp=f.inp,now=performance.now();
    f.dashCd=Math.max(0,f.dashCd-dt);f.spCd=Math.max(0,f.spCd-dt);f.inv=Math.max(0,f.inv-dt);f.blkT+=dt;
    /* toques novos */
    const cnt=inp.cnt||{};for(const k in cnt){if((cnt[k]|0)>(f.last[k]|0)){f.last[k]=cnt[k];if(k==='J'){if(ground(f)&&!busy(f)){f.vy=-D.jv;fx5('mgJump')}}else{f.buf=k;f.bufT=.15}}}
    if(inp.b&&!f.wasB)f.blkT=0;f.wasB=!!inp.b;
    if(f.st!=='atk'&&f.st!=='dash'&&f.st!=='tele')f.face=o.x>f.x?1:-1;
    f.blk=!!inp.b&&ground(f)&&!busy(f);
    if(f.buf){f.bufT-=dt;if(f.bufT<=0)f.buf=null}
    /* cancelamento: Leve confirmado → Leve/Pesado/Especial; Pesado confirmado → Especial */
    if(f.buf&&f.st==='atk'&&f.conf&&f.mv&&f.t>=f.mv.st+f.mv.ac*.5){const m=f.mv.k,b=f.buf;
      if((m==='L'&&(b==='H'||b==='S'||b==='X'||b==='U'||(b==='L'&&f.chain<2)))||(m==='H'&&(b==='S'||b==='X'||b==='U'))){f.chain=b==='L'?f.chain+1:f.chain;f.buf=null;start(f,b)}}
    if(f.buf&&!busy(f)){const b=f.buf;f.buf=null;if(b!=='L')f.chain=0;start(f,b)}
    switch(f.st){
      case'idle':case'walk':{if(f.blk){f.st='idle';break}const mv=(inp.r?1:0)-(inp.l?1:0);f.x+=mv*D.spd*dt*(mv===f.face?1:.8);f.st=mv?'walk':'idle';break}
      case'atk':{f.t+=dt;const m=f.mv;if(!m){f.st='idle';break}
        if(m.k==='SP'&&!m.done&&f.t>=m.st){m.done=true;special(f,o,m.ex,m.el)}
        if(m.k==='SU'&&!m.done&&S.freeze<=0){m.done=true;supremo(f,S.frz?.el||f.k)}
        if(m.k==='L'||m.k==='H'||m.k==='G'){if(f.t>=m.st&&f.t<m.st+m.ac)landHit(f,o);else f.hb=null;if(!ground(f)){}}
        if(f.t>=(m.st||0)+(m.ac||0)+(m.rc||0)){f.st='idle';f.mv=null;f.hb=null;if(!f.conf)f.chain=0}
        if(ground(f))f.x+=(m.k==='H'&&f.t<m.st?f.face*60*dt:0);break}
      case'dash':{f.t+=dt;f.x+=f.mv.dir*D.spd*(f.mv.back?2:2.4)*dt;if(f.t>=.24){f.st='idle'}break}
      case'tele':{f.t+=dt;if(f.t>=.12&&f.mv.hits>0&&!f.mv.tk){f.mv.tk=1;const hb={x0:f.x-70,x1:f.x+70,y0:f.y-110,y1:f.y};if(overlap(hb,hurtbox(o)))damage(f,o,f.mv.dmg,{kb:180,stun:.4,meter:10,px:f.x});if(f.mv.hits>1){f.mv.hits--;f.mv.tk=0;f.t=.02}}
        if(f.t>=.42){f.st='idle';f.mv=null}break}
      case'hit':case'bstun':case'thrown':case'stuck':{f.t+=dt;if(f.st!=='stuck')f.x+=f.kb*dt;f.kb*=1-6*dt;if(f.t>=(f.stunT||.3)&&ground(f)){f.st='idle';if(f.combo>=2)S.lastCombo={n:f.combo,d:f.cdmg,at:performance.now()};f.combo=0}break}
      case'ko':{f.t+=dt;f.x+=f.kb*dt;f.kb*=1-3*dt;break}
    }
    f.vy+=G*dt;f.y+=f.vy*dt;if(f.y>=FL){f.y=FL;f.vy=0}f.x=clamp12(f.x,30,W-30)}
  /* IA */
  function aiThink(f,o,dt){
    const A=S.ai,hold=A.hold;if(mode==='tre'){const dm=o0.dm||'cpu';if(dm==='par'){f.inp={};return}if(dm==='blk'){f.inp={b:true};return}if(dm==='pul'){A.t-=dt;if(A.t<=0){A.t=.9;f.cnt.J=(f.cnt.J|0)+1}f.inp={cnt:f.cnt};return}}
    const press=k=>{f.cnt[k]=(f.cnt[k]|0)+1};A.next-=dt;
    const dist=Math.abs(o.x-f.x),toward=o.x>f.x?'r':'l',away=toward==='r'?'l':'r';
    /* defesa reativa (rápida) */
    const threat=(o.st==='atk'&&o.mv&&(o.mv.k==='L'||o.mv.k==='H')&&dist<(o.mv.reach||80)+50&&o.t<o.mv.st)||S.ents.some(e=>e.o===o.i&&Math.abs(e.x-f.x)<220&&Math.sign((e.vx||0))===Math.sign(f.x-e.x));
    if(threat&&!A.reacted){A.reacted=true;const r=Math.random();if(r<AIK.pa){hold.b=true;A.relB=.25;f.blkT=0}else if(r<AIK.bl){hold.b=true;A.relB=.4}else if(r<AIK.bl+.1&&f.dashCd<=0)press('D')}
    if(!threat)A.reacted=false;
    if(A.relB!=null){A.relB-=dt;if(A.relB<=0){hold.b=false;A.relB=null}}
    if(A.next<=0&&!hold.b){A.next=AIK.re*(0.6+Math.random()*.8);hold.l=hold.r=false;
      if(o.st==='hit'&&dist<f.D.r2+10&&Math.random()<AIK.cb){press(f.meter>=300&&Math.random()<.6?'U':Math.random()<.5?'H':'L');if(Math.random()<.5)setTimeout(()=>press('S'),90)}
      else if(f.meter>=300&&Math.random()<.25)press('U');
      else if(f.meter>=100&&Math.random()<.15)press('X');
      else if(dist>f.D.r2+30){const zone=f.k==='fe'||f.k==='ver'||f.k==='boss';if(zone&&Math.random()<.35)press('S');else if(f.k==='ine'&&Math.random()<.2)press('S');else if(Math.random()<AIK.ag){hold[toward]=true;if(Math.random()<.15)press('D')}else if(Math.random()<.3)press('J')}
      else{const r=Math.random();if(o.blk&&r<.35)press('G');else if(r<AIK.ag*.6)press('L');else if(r<AIK.ag)press('H');else if(r<AIK.ag+.1)press('G');else hold[away]=true}}
    f.inp={l:hold.l,r:hold.r,b:hold.b,cnt:f.cnt}}
  const o0=o;
  function sim(dt){
    if(S.over)return;
    if(S.freeze>0){S.freeze-=dt;return}
    if(S.pause>0){S.pause-=dt;if(S.pause<=0){S.msg='';S.sub=''}return}
    if(mode!=='tre')S.t-=dt;
    if(!pvp)aiThink(S.f[1],S.f[0],dt);
    S.f.forEach((f,i)=>step1(f,S.f[1-i],dt));
    const [a,b]=S.f;if(Math.abs(a.x-b.x)<46&&Math.abs(a.y-b.y)<90&&a.st!=='ko'&&b.st!=='ko'){const m=(a.x+b.x)/2,s=a.x<b.x?-1:1;a.x=clamp12(m+s*23,30,W-30);b.x=clamp12(m-s*23,30,W-30)}
    /* entidades */
    S.ents.forEach(e=>{e.life-=dt;if(e.delay>0){e.delay-=dt;return}const d=S.f[1-e.o],a=S.f[e.o];
      if(e.vx)e.x+=e.vx*dt;
      if(e.k==='hole'){if(Math.abs(d.x-e.x)<300){d.x+=Math.sign(e.x-d.x)*260*dt}if(e.life<.15&&!e.done){e.done=1;if(Math.abs(d.x-e.x)<260)damage(a,d,e.dmg,{kb:300,stun:.8,sup:1,px:e.x,launch:1});C.fx?.flash('#000',.4)}return}
      if(e.hit&&!e.multi)return;const box={x0:e.x-e.w/2,x1:e.x+e.w/2,y0:e.y-e.h/2,y1:e.y+e.h/2};
      if(e.k==='clone'&&e.multi){if(!e.hitSet)e.hitSet=0}
      if(overlap(box,hurtbox(d))&&!(e.multi&&e.hitSet)){const res=damage(a,d,e.dmg,{kb:e.kb||150,stun:e.stun||(e.sup?.5:.35),proj:1,px:e.x,sup:e.sup,stuck:e.stuck,launch:e.launch});if(res!=='miss'){e.hit=1;if(e.multi)e.hitSet=1;if(!e.pierce&&e.k!=='pillar'&&e.k!=='beam')e.life=0}}});
    /* projéteis se anulam */
    const pr=S.ents.filter(e=>e.k==='proj');pr.forEach(p=>pr.forEach(q=>{if(p.o!==q.o&&!p.dead&&!q.dead&&Math.abs(p.x-q.x)<30&&Math.abs(p.y-q.y)<30){if(!p.pierce)p.life=0;if(!q.pierce)q.life=0;C.fx?.burst(p.x,p.y,{n:10,col:['#fff',p.col],sp:160,life:.35,size:3,grav:0})}}));
    S.ents=S.ents.filter(e=>e.life>0&&e.x>-200&&e.x<W+200);
    /* treino: o boneco recupera */
    if(mode==='tre'){const d=S.f[1];if(d.st!=='hit'&&d.st!=='thrown'&&d.st!=='stuck'){d.idleT=(d.idleT||0)+dt;if(d.idleT>1.2){d.hp=d.max}}else d.idleT=0;if(d.st==='ko'){d.st='idle';d.hp=d.max;d.y=FL}S.f[0].meter=Math.min(300,S.f[0].meter+40*dt);return}
    const ko2=S.f.findIndex(f=>f.hp<=0);
    if(ko2>=0||S.t<=0){const w=ko2>=0?1-ko2:a.hp===b.hp?-1:(a.hp/a.max>b.hp/b.max?0:1);if(w>=0){S.wins[w]++;if(w===myI&&S.f[w].dmgTaken===0){S.stats.perfect++;C.achieve?.('ri_perfeito')}}
      S.msg=w<0?'Empate no round':ko2>=0?'K.O.!':'Tempo!';S.sub=w<0?'':`${S.f[w].n} vence o round`;S.pause=99;
      if(S.wins[0]>=2||S.wins[1]>=2||S.round>=5){S.over=true;setTimeout(finish,window.__riFast?0:1500);return}
      S.round++;setTimeout(()=>{if(!S.over)resetRound()},window.__riFast?0:1600)}}
  function save(won){let first=false;progPut38(p=>{p.ri=p.ri||{};p.ri.win=p.ri.win||{};if(won){p.ri.win[myK]=(p.ri.win[myK]||0)+1}if(mode==='tor'&&won&&tst===4){first=!p.ri.tor;p.ri.tor=(p.ri.tor||0)+1}if(S.best>(p.ri.best||0))p.ri.best=S.best});return first}
  function finish(){
    const ww=S.wins[0]>S.wins[1]?0:S.wins[1]>S.wins[0]?1:-1,won=ww===myI;
    if(won){C.achieve?.('campeao');if(!pvp&&C.diff==='pesadelo')C.achieve?.('gato');if(mode==='tor'&&tst===4)C.achieve?.('ri_torneio')}
    const first=pvp?false:save(won),mul=gdMul38(C.diff||'medio');
    S.rw=pvp?{ob:won?12:4,xp:won?7:2,why:won?'vitória no PvP':'luta'}:{ob:won?Math.round((mode==='tor'?(tst===4?45:8+tst*3):12)*mul+(first?20:0)):2,why:[RF50[myK].n,mode==='tor'?`luta ${tst+1}/5`:'',won?'vitória':'derrota'].filter(Boolean).join(' · ')};if(!S.rw.xp)S.rw.xp=Math.round(S.rw.ob*.6);
    const rows=[0,1].map(i=>({u:ps[i].u,n:ps[i].n,c:ps[i].c<0?0:ps[i].c,s:S.wins[i],w:i===ww}));
    const title=ww<0?'Empate na Rinha':pvp?`Vitória de ${ps[ww].n} · ${S.wins[ww]} × ${S.wins[1-ww]}`:mode==='tor'?(won?(tst===4?'👑 Você é o Campeão do Torneio!':`🏆 Luta ${tst+1}/5 vencida · ${S.wins[0]} × ${S.wins[1]}`):`O Torneio acabou na luta ${tst+1}/5`):won?`Você venceu ${RF50[oppK].n}! ${S.wins[0]} × ${S.wins[1]}`:`${RF50[oppK].n} venceu · ${S.wins[1]} × ${S.wins[0]}`;
    if(pvp)C.send('rs',{st:snap()});
    C.finish({title,rows,unit:'rounds',html:`<ul class="r38-l"><li>🥊 ${esc(RF50[myK].n)} × ${esc(RF50[oppK].n)}</li><li>🔗 Maior combo: <b>${S.best}</b> golpes</li><li>🛡 Defesas Perfeitas: <b>${S.stats.parry}</b></li><li>🌟 Supremos: <b>${S.stats.sup}</b></li></ul>${mode==='tor'&&won&&tst<4?`<p class="r38-hi">Próxima luta: ${esc(RF50[ladder[tst+1]].n)}${tst+1===4?' (chefe final)':''}.</p>`:''}`})}
  const snap=()=>({f:S.f.map(f=>({x:Math.round(f.x),y:Math.round(f.y),face:f.face,hp:f.hp,meter:Math.round(f.meter),st:f.st,t:+f.t.toFixed(2),mv:f.mv&&{k:f.mv.k,reach:f.mv.reach,st:f.mv.st,ac:f.mv.ac},blk:f.blk,inv:+f.inv.toFixed(2),combo:f.combo,cdmg:f.cdmg})),ents:S.ents.map(e=>({k:e.k,x:Math.round(e.x),y:Math.round(e.y),w:e.w,h:e.h,col:e.col,delay:e.delay>0?1:0,life:+e.life.toFixed(2)})),wins:S.wins,round:S.round,t:+S.t.toFixed(1),msg:S.msg,sub:S.sub,over:S.over,freeze:+S.freeze.toFixed(2),frz:S.frz&&{i:S.frz.f.i,el:S.frz.el},hits:S.hits.slice(-6).map(h=>({...h,at:0}))});
  function sendInp(){const i=inpOf();if(C.host||!pvp)S.f[myI].inp=i;else C.send('ri',{inp:i})}
  function exitTraining(){if(mode!=='tre'||S.over)return;S.over=true;S.rw={ob:0,xp:2,why:'treino'};progPut38(p=>{p.ri=p.ri||{};if(S.best>(p.ri.best||0))p.ri.best=S.best});C.finish({title:`🎯 Treino encerrado · maior combo ${S.best} golpes`,rows:[{u:C.me,n:me.n,c:me.c,s:0,w:false}],unit:'rounds'})}
  return{st:()=>S,start:(i,k)=>start(S.f[i],k),damage:(a,d,dmg,o2)=>damage(S.f[a],S.f[d],dmg,o2||{}),press(k){myCnt[k]=(myCnt[k]|0)+1;sendInp()},
    reward:()=>S.rw||null,
    next(){if(pvp)return null;if(mode==='tor'){const won=S.wins[0]>S.wins[1];if(won&&tst<4)return{opt:{m:'tor',st:String(tst+1)},label:`Luta ${tst+2}/5: ${RF50[ladder[tst+1]].n}`};if(!won)return{opt:{m:'tor',st:String(tst)},label:'Tentar a luta de novo'};return null}return{opt:{},label:'Revanche'}},
    key(code,down){const was=!!keys[code];keys[code]=down;if(down&&!was){if(PRESS[code])myCnt[PRESS[code]]=(myCnt[PRESS[code]]|0)+1;if(code==='KeyT')S.showHB=!S.showHB;if(code==='KeyQ'||code==='Escape')exitTraining()}sendInp()},
    ptr(t,px,py){if(t==='down'&&mode==='tre'&&px>W-130&&py<34)exitTraining()},
    msg(p){if(C.host&&p.t==='ri'){const i=ps.findIndex(q=>q.u===p.from);if(i>=0)S.f[i].inp=p.inp||{}}
      if(!C.host&&p.t==='rs'&&p.from===C.room.host&&p.st){const st=p.st;st.f.forEach((g,i)=>{const f=S.f[i];if(g.hp<f.hp)f.hitT=performance.now();
          /* guarda a posição como alvo e desliza até ela (antes pulava de 70 em 70 ms); salto grande (novo round) vai direto */
          const x0=f.x,y0=f.y,had=f.tx!=null;Object.assign(f,g);f.tx=g.x;f.ty=g.y;if(had&&Math.hypot(x0-g.x,y0-g.y)<150){f.x=x0;f.y=y0}});S.ents=st.ents;S.wins=st.wins;S.round=st.round;S.t=st.t;S.msg=st.msg;S.sub=st.sub;S.over=st.over;S.freeze=st.freeze;S.frz=st.frz?{f:S.f[st.frz.i],el:st.frz.el}:null}},
    left(u){if(!C.host||S.over)return;const i=ps.findIndex(q=>q.u===u);if(i<0)return;S.f[i].hp=0;S.wins[1-i]=2;S.over=true;C.finish({title:`${ps[i].n} saiu · vitória de ${ps[1-i].n}`,rows:ps.map((p,k)=>({u:p.u,n:p.n,c:p.c<0?0:p.c,s:S.wins[k],w:k!==i}))})},
    step(dt){if(Date.now()<C.t0)return;
      if(C.host||!pvp){sim(dt);if(pvp&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('rs',{st:snap()})}}
      else{S.ents.forEach(e=>{if(e.vx)e.x+=e.vx*dt});
        /* convidado: o próprio lutador anda na hora (predição); o resto desliza até a posição do anfitrião */
        const k=Math.min(1,dt*16),mine=S.f[myI],I=inpOf()||{};
        S.f.forEach(f=>{if(f.tx==null)return;
          if(f===mine&&(f.st==='idle'||f.st==='walk')&&!I.b&&f.D){const mv=(I.r?1:0)-(I.l?1:0);if(mv){f.x=clamp12(f.x+mv*f.D.spd*dt*(mv===f.face?1:.8),30,W-30);if(Math.abs(f.x-f.tx)>70)f.x+=(f.tx-f.x)*k;f.y+=(f.ty-f.y)*k;return}}
          f.x+=(f.tx-f.x)*k;f.y+=(f.ty-f.y)*k})}
      const m=S.f[myI];C.hud(`🥊 ${mode==='tor'?`Torneio ${tst+1}/5 · `:mode==='tre'?'Treino · ':''}Round <b>${S.round}</b> · ${S.wins[0]} × ${S.wins[1]} · ⏱ ${mode==='tre'?'∞':Math.max(0,Math.ceil(S.t))} · ✦ Essência <b>${Math.floor(m.meter/100)}</b>/3${m.meter>=300?' · <b style="color:#ffd36b">SUPREMO (I)</b>':m.meter>=100?' · EX (U)':''}`)},
    draw(x){
      const now=performance.now(),sh=S.shake>0?(S.shake-=1/60,Math.sin(now/15)*S.shake*20):0;
      x.save();x.translate(sh,0);
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a0d1f');g.addColorStop(1,'#0d0a1a');x.fillStyle=g;x.fillRect(-20,0,W+40,H);
      for(let i=0;i<5;i++){x.fillStyle=`rgba(195,155,255,${.04+i*.01})`;x.fillRect(i*170+40,FL-180-i*8,90,180+i*8)}
      x.fillStyle='#2b1d33';x.fillRect(-20,FL,W+40,H-FL);x.fillStyle='#c39bff';x.fillRect(-20,FL,W+40,2);
      S.ents.forEach(e=>{if(e.delay>0){x.fillStyle='rgba(255,255,255,.15)';x.fillRect(e.x-e.w/2,FL-6,e.w,6);return}
        x.save();x.shadowColor=e.col;x.shadowBlur=18;x.fillStyle=e.col;
        if(e.k==='clone'){x.globalAlpha=.7;const im=tint18(-1,'rgba(120,230,255,.6)');if(im)x.drawImage(im,e.x-34,e.y-104,68,68);else x.fillRect(e.x-20,e.y-100,40,100)}
        else if(e.k==='hole'){x.beginPath();x.arc(e.x,e.y,60+Math.sin(now/60)*8,0,TAU16);x.fillStyle='#000';x.fill();x.strokeStyle='#c58bff';x.lineWidth=4;x.stroke()}
        else if(e.k==='pillar'||e.k==='beam'){x.globalAlpha=.8;x.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);x.globalAlpha=1;x.fillStyle='#fff';x.fillRect(e.x-e.w*.2,e.y-e.h/2,e.w*.4,e.h)}
        else if(e.k==='whip'||e.k==='trap'){x.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);for(let k=0;k<6;k++){x.fillRect(e.x-e.w/2+k*e.w/6,e.y-e.h/2-12,6,14)}}
        else{rr21(x,e.x-e.w/2,e.y-e.h/2,e.w,e.h,e.h/2);x.fill()}x.restore();
        if(S.showHB){x.strokeStyle='#ff4040';x.lineWidth=1.5;x.strokeRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h)}});
      S.f.forEach((f,i)=>{const D=RF50[f.k],fl=now-f.hitT<110;x.save();x.translate(f.x,f.y-50);
        const lean=f.st==='atk'&&f.mv?(f.t<(f.mv.st||0)?-.08:.15):f.st==='hit'?-.2:f.st==='ko'?-1.2:0;x.scale(f.face,1);x.rotate(lean);
        if(f.inv>0&&f.st==='dash'){x.globalAlpha=.45}
        x.fillStyle=D.col+'33';x.beginPath();x.ellipse(0,10,40,56,0,0,TAU16);x.fill();
        if(fl)x.filter='brightness(3)';const im=tint18(-1,D.tint);if(im)x.drawImage(im,-40,-48,80,80);else{x.beginPath();x.arc(0,0,30,0,TAU16);x.fillStyle=D.col;x.fill()}x.filter='none';
        t21(x,D.ico,26,-44,{size:16});
        if(f.st==='atk'&&f.mv&&(f.mv.k==='L'||f.mv.k==='H'||f.mv.k==='G')&&f.t>=f.mv.st){const r=f.mv.reach||64;x.fillStyle=f.mv.k==='G'?'#ff9b2f':D.col;x.globalAlpha=.75;x.beginPath();x.ellipse(20+r*.6,f.mv.k==='H'?-8:-18,r*.35,f.mv.k==='H'?18:11,0,0,TAU16);x.fill();x.globalAlpha=1}
        if(f.blk){x.strokeStyle=f.blkT<.15?'#ffffff':'#7fc8ff';x.lineWidth=5;x.beginPath();x.arc(14,0,48,-1.1,1.1);x.stroke()}
        x.restore();
        if(S.showHB){const hb=hurtbox(f);x.strokeStyle='#40ff80';x.lineWidth=1.5;x.strokeRect(hb.x0,hb.y0,hb.x1-hb.x0,hb.y1-hb.y0);if(f.st==='atk'&&f.mv&&f.mv.reach&&f.t>=f.mv.st&&f.t<f.mv.st+f.mv.ac){const r=f.mv.reach;const a={x0:f.face>0?f.x+10:f.x-10-r,x1:f.face>0?f.x+10+r:f.x-10,y0:f.y+(f.mv.y0??-90),y1:f.y+(f.mv.y1??-30)};x.strokeStyle='#ff4040';x.strokeRect(a.x0,a.y0,a.x1-a.x0,a.y1-a.y0)}}
        if(i===myI&&(pvp||mode!=='tre'))t21(x,pvp?'você':'',f.x,f.y-118,{size:11,col:'#ffd36b'})});
      x.restore();
      /* barras */
      S.f.forEach((f,i)=>{const bx=i?W-24-300:24,D=RF50[f.k];x.fillStyle='#300';x.fillRect(bx,16,300,16);x.fillStyle=i?'#ff6b5b':'#7dffa8';const w=300*f.hp/f.max;x.fillRect(i?bx+300-w:bx,16,w,16);x.strokeStyle='#fff';x.lineWidth=1;x.strokeRect(bx,16,300,16);
        for(let k=0;k<3;k++){const sx=i?bx+300-(k+1)*100:bx+k*100,fill=clamp12(f.meter-k*100,0,100)/100;x.fillStyle='#1a1030';x.fillRect(sx+2,36,96,8);x.fillStyle=fill>=1?(f.meter>=300?'#ffd36b':'#c39bff'):'#6b4fa0';x.fillRect(i?sx+2+96*(1-fill):sx+2,36,96*fill,8)}
        t21(x,`${D.ico} ${(pvp||i===0?ps[i].n:D.n).slice(0,18)}`,i?W-24:24,58,{size:13,al:i?'right':'left'});t21(x,'●'.repeat(S.wins[i])+'○'.repeat(Math.max(0,2-S.wins[i])),i?W-24:24,76,{size:13,al:i?'right':'left',col:'#ffd36b'})});
      t21(x,mode==='tre'?'∞':String(Math.max(0,Math.ceil(S.t))),W/2,26,{size:24,w:800});
      if(mode==='tre'){rr21(x,W-128,4,120,26,8);x.fillStyle='rgba(255,255,255,.12)';x.fill();t21(x,'🏳 Encerrar (Q)',W-68,17,{size:12});t21(x,`Hitboxes: ${S.showHB?'sim':'não'} (T) · maior combo ${S.best}`,W/2,96,{size:12,col:'#c9b995'})}
      const lc=S.lastCombo,cf=S.f.find(f=>f.combo>=2);
      if(cf)t21(x,`${cf.combo} GOLPES · ${cf.cdmg} de dano`,cf.i?160:W-160,120,{size:20,w:900,col:'#ffd36b',stroke:4});
      else if(lc&&now-lc.at<1500)t21(x,`${lc.n} GOLPES · ${lc.d} de dano`,W/2,120,{size:18,w:900,col:'#ffd36b',stroke:4});
      S.hits=S.hits.filter(h=>now-h.at<800||!h.at);S.hits.forEach(h=>{if(!h.at)h.at=now;const k=(now-h.at)/800;x.globalAlpha=1-k;t21(x,h.t,h.x,h.y-k*30,{size:h.sz,w:900,col:h.col,stroke:4});x.globalAlpha=1});
      if(S.freeze>0&&S.frz){x.fillStyle='rgba(0,0,0,.7)';x.fillRect(0,0,W,H);const f=S.frz.f,D=RF50[f.k];x.save();x.fillStyle=D.col;x.globalAlpha=.25;x.fillRect(0,H/2-50,W,100);x.restore();
        t21(x,'SUPREMO',W/2,H/2-26,{size:20,w:900,col:'#fff'});t21(x,D.su,W/2,H/2+12,{size:40,w:900,col:D.col,stroke:6})}
      if(S.msg)t21(x,S.msg,W/2,H/2-60,{size:40,w:900,col:'#ffd36b',stroke:6});if(S.sub)t21(x,S.sub,W/2,H/2-18,{size:18,w:800,col:'#fff',stroke:4});
      if(S.pause>1&&S.round===1&&mode==='tor')t21(x,`Luta ${tst+1}/5 · ${RF50[myK].n} × ${RF50[oppK].n}`,W/2,H/2+20,{size:16,col:'#c9b995',stroke:3});
    }
  };
}
Object.assign(ACH,{
  ri_parry:{ico:'🛡',n:'Defesa Perfeita',d:'Faça 3 Defesas Perfeitas numa mesma luta da Rinha.'},
  ri_supremo:{ico:'🌟',n:'Supremo!',d:'Acerte um Especial Supremo na Rinha.'},
  ri_combo:{ico:'🔗',n:'Corrente Elemental',d:'Acerte um combo de 5 golpes na Rinha.'},
  ri_torneio:{ico:'👑',n:'Campeão do Torneio',d:'Vença o Perseus Supremo no Torneio da Rinha.'},
  ri_perfeito:{ico:'✨',n:'Round Perfeito',d:'Vença um round da Rinha sem levar dano.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='ri50')return`<div>${b('KeyA','◀')}${b('KeyD','▶')}${b('KeyW','⤒','','Pular')}${b('KeyS','🛡','','Defender')}</div><div>${b('KeyJ','👊','','Golpe Leve')}${b('KeyK','💥','','Golpe Pesado')}${b('KeyL','✦','','Especial')}${b('KeyH','✋','','Agarrão')}</div><div>${b('Space','💨','','Dash')}${b('KeyU','⚡','','Especial EX')}${b('KeyI','🌟','','Supremo')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('rinha',{...GAMES12.rinha,make:rinha50,setup:riSetup50,pad:'ri50',
  desc:'Luta 2D com 5 lutadores elementais: golpes leve e pesado, agarrão, dash, Defesa Perfeita, Especiais EX e Supremos. Melhor de 3, Torneio, Treino e PvP.',
  rule:'Vença 2 rounds. A Barra de Essência tem 3 níveis: 1 para o Especial EX, 3 para o Supremo.',
  keys:'A/D · W pula · S defende · J leve · K pesado · L especial · H agarrão · Espaço dash · U EX · I Supremo',touch:'Use os botões'});
console.info('[Tulpa] Etapa 50 carregada (Rinha 2.0)');

/* ===================================================================
   TULPA · ETAPA 51 — 🕹 ARCADE 2.0 · ONDA 7 (parte 2)
   🗝 O LABIRINTO DO ABISMO 2.0 — roguelike em 4 andares
   Porão → Catacumbas → Plano Astral → Núcleo do Véu. Salas de Combate,
   Tesouro (1 mutação garantida), Loja de Óbolos da run, Sala do Pacto
   (troca Vital máximo por poderes absurdos), Sala Secreta (abra com
   bombas) e Sala do Chefe (alçapão para o próximo andar).
   35 Mutações acumuláveis que mudam os tiros de verdade, Itens Ativos
   (recarregam ao limpar salas) e consumíveis (bombas, chaves, corações,
   Escudos de Lucidez). Co-op 2: masmorra compartilhada, reviver o
   colega segurando F perto dele e chefes com mais vida.
   =================================================================== */
const ABF51=[{n:'Porão',fl:'#2a2024',wl:'#3d2b33',bk:'#1a1214',boss:'Rei das Moscas'},{n:'Catacumbas',fl:'#24222a',wl:'#3a3848',bk:'#141218',boss:'Guardião Ossudo'},{n:'Plano Astral',fl:'#1c1830',wl:'#33285a',bk:'#0e0a1c',boss:'Olho Astral'},{n:'Núcleo do Véu',fl:'#2a1020',wl:'#4a1a34',bk:'#160810',boss:'Perseus do Véu'}];
const MUT51=[
  ['tri','Olho da Fé','✶','Tiro triplo',p=>p.f.tri=1],
  ['homing','Lágrimas Teleguiadas','🧿','Os tiros perseguem inimigos',p=>p.f.homing=1],
  ['pierce','Véu da Inexistência','◐','Tiros perfurantes',p=>p.f.pierce=1],
  ['explo','Lágrimas Explosivas','💥','Os tiros explodem ao acertar',p=>p.f.explo=1],
  ['beam','Raio Contínuo de Fé','🔆','Troca os tiros por um raio contínuo',p=>p.f.beam=1],
  ['orbit','Orbitais Protetores','🪐','Dois orbes giram e bloqueiam tiros',p=>p.f.orb=(p.f.orb||0)+2],
  ['boom','Bumerangue','🪃','Os tiros voltam',p=>p.f.boom=1],
  ['split','Lágrima que Divide','✳','Ao acertar, o tiro se divide em dois',p=>p.f.split=1],
  ['dmg','Lágrima da Verdade','👁','+1 de dano',p=>p.dmg+=1],
  ['spd','Asas da Ilusão','🌀','+20% de velocidade',p=>p.spd*=1.2],
  ['rate','Pressa Mística','⚡','Atira mais rápido',p=>p.rate*=.72],
  ['range','Visão Longa','🔭','Tiros vão mais longe',p=>p.range*=1.4],
  ['hp','Coração da Natureza','🌿','+1 coração e cura total',p=>{p.max+=2;p.hp=p.max}],
  ['cross','Cruz Teosófica','✚','Também atira para trás',p=>p.f.back=1],
  ['wave','Onda do Véu','〰','Tiros ondulam',p=>p.f.wave=1],
  ['big','Lágrima Gigante','🔴','Tiros maiores e mais fortes, mais lentos',p=>{p.f.big=1;p.dmg+=.8;p.shot*=.85}],
  ['chain','Corrente Elétrica','🌩','O acerto salta para outro inimigo',p=>p.f.chain=1],
  ['poison','Veneno da Natureza','☠','Envenena (dano contínuo)',p=>p.f.poison=1],
  ['slow','Gelo da Inexistência','❄','Deixa os inimigos lentos',p=>p.f.slow=1],
  ['knock','Empurrão Astral','💨','Empurra os inimigos',p=>p.f.knock=1],
  ['crit','Golpe Crítico','🎯','10% de chance de dano triplo',p=>p.f.crit=1],
  ['vamp','Vampirismo','🩸','Cura meio coração a cada 12 abates',p=>p.f.vamp=1],
  ['luck','Trevo da Sorte','🍀','Mais Óbolos e itens caindo',p=>p.f.luck=(p.f.luck||0)+1],
  ['shield','Escudo da Fé','🛡','+2 Escudos de Lucidez',p=>p.sh+=2],
  ['thorn','Espinhos','🌵','Quem encosta em você leva dano',p=>p.f.thorn=1],
  ['dash','Passo Etéreo','👣','Shift: dash invencível',p=>p.f.dash=1],
  ['magnet','Ímã de Óbolos','🧲','Atrai moedas e itens',p=>p.f.magnet=1],
  ['ghost','Corpo Fantasma','👻','Atravessa pedras',p=>p.f.ghost=1],
  ['double','Tiro Duplo','‖','Dois tiros paralelos',p=>p.f.double=1],
  ['spectral','Lágrimas Espectrais','💫','Tiros atravessam pedras',p=>p.f.spectral=1],
  ['coin','Moeda da Sorte','🪙','+8 Óbolos e desconto na loja',p=>{p.coins+=8;p.f.disc=1}],
  ['bombs','Bombas Grandes','💣','+5 bombas e explosão maior',p=>{p.bombs+=5;p.f.bigb=1}],
  ['keys','Chaveiro','🗝','+3 chaves',p=>p.keys+=3],
  ['eye','Mapa Interior','🗺','Revela o mapa de cada andar',p=>p.f.map=1],
  ['ring','Anel do Sol','☀','Solta um anel de fogo a cada 4 s',p=>p.f.ring=1],
];
const ACT51={livro:{n:'Livro da Fé',ico:'📖',max:3,d:'3 s invencível'},solar:{n:'Bomba Solar',ico:'🌞',max:2,d:'fere todos na sala'},vela:{n:'Vela da Ilusão',ico:'🕯',max:3,d:'uma isca atrai os inimigos'},ampulheta:{n:'Ampulheta',ico:'⏳',max:3,d:'inimigos lentos por 5 s'},sino:{n:'Sino da Verdade',ico:'🔔',max:4,d:'cura 1 coração e revela o mapa'}};
const ACTK51=Object.keys(ACT51),PACT51=['beam','orbit','homing','tri','explo','split','pierce','chain','double','ring'];
function abGen51(seed,fl){
  const rnd=mb32(((seed>>>0)^Math.imul(fl+1,0x2c1b3c6d))>>>0||9),R=n=>Math.floor(rnd()*n),K=(x,y)=>x+','+y,rooms={};
  const want=8+fl*2;rooms[K(3,3)]={x:3,y:3,kind:'start'};let tries=0;
  while(Object.keys(rooms).length<want&&tries++<4000){const keys=Object.keys(rooms),b=rooms[keys[R(keys.length)]];const[dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]][R(4)],nx=b.x+dx,ny=b.y+dy;
    if(nx<0||ny<0||nx>6||ny>6||rooms[K(nx,ny)])continue;const nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>rooms[K(nx+a,ny+c)]).length;if(nb>1&&rnd()<.7)continue;rooms[K(nx,ny)]={x:nx,y:ny,kind:'fight'}}
  const list=Object.values(rooms),deg=r=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,c])=>rooms[K(r.x+a,r.y+c)]).length;
  const dist=r=>{/* BFS do início */const d={};d[K(3,3)]=0;const q=[rooms[K(3,3)]];for(let i=0;i<q.length;i++){const c=q[i];for(const[a,b2]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=rooms[K(c.x+a,c.y+b2)];if(n&&!(K(n.x,n.y)in d)){d[K(n.x,n.y)]=d[K(c.x,c.y)]+1;q.push(n)}}}return d[K(r.x,r.y)]};
  const ends=list.filter(r=>r.kind==='fight'&&deg(r)===1).sort((a,b)=>dist(b)-dist(a));
  const pickEnd=k=>{const r=ends.shift()||list.filter(q=>q.kind==='fight').sort((a,b)=>dist(b)-dist(a))[0];if(r)r.kind=k;return r};
  pickEnd('boss');pickEnd('treasure');pickEnd('shop');if(fl>=1||rnd()<.5)pickEnd('pact');
  /* sala secreta: vizinha de 2+ salas, sem porta até explodir */
  let sec=null;for(let t=0;t<300&&!sec;t++){const x=R(7),y=R(7);if(rooms[K(x,y)])continue;const nbs=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b2])=>rooms[K(x+a,y+b2)]).filter(r=>r&&r.kind!=='boss');if(nbs.length>=2||(t>200&&nbs.length>=1))sec={x,y,kind:'secret',hidden:true}}
  if(sec)rooms[K(sec.x,sec.y)]=sec;
  Object.values(rooms).forEach(r=>{r.rocks=[];r.clear=['start','treasure','shop','pact','secret'].includes(r.kind);r.seen=r.kind==='start';r.drops=[];r.peds=[];
    if(r.kind==='fight'){const n=R(5);for(let i=0;i<n;i++){const ax=170+R(460),ay=110+R(230);if(Math.hypot(ax-400,ay-225)>90&&Math.abs(ax-400)>40&&Math.abs(ay-225)>30)r.rocks.push({x:ax,y:ay,r:18+R(10)})}}
    r.locked=r.kind==='treasure'&&fl>=1;r.seed=R(1e9)});
  return{rooms,K,sec}
}
T3.abGen51=abGen51;T3.MUT51i=k=>MUT51.findIndex(m=>m[0]===k);
function abProg51(){const p=prog38().ab||{};return{deep:p.deep||0,wins:p.wins||0,muts:p.muts||{}}}
const abSetup51={
  intro:o=>o._m==='pvp'?'Co-op: a masmorra é a mesma para os dois. Itens no pedestal são de quem pegar primeiro. Caiu? O colega revive você segurando F por perto.':'Desça os 4 andares do Abismo. Cada run é diferente: junte mutações e crie sinergias.',
  def:()=>({m:'run'}),
  fields:o=>{const p=abProg51();return[{k:'m',l:'Run',opts:[{v:'run',n:'Run nova',ico:'🗝',d:'Uma masmorra sorteada.',badge:p.wins?`🏆 ×${p.wins}`:p.deep?`andar ${p.deep}`:''},{v:'day',n:'Desafio do Dia',ico:'📅',d:'A mesma masmorra para todos hoje.'}]}]},
  fix:o=>{if(!['run','day'].includes(o.m))o.m='run'},
  sum:o=>`WASD anda · setas ou mouse atiram · E solta bomba · Espaço usa o Item Ativo · Shift dash (com Passo Etéreo)${o._m==='pvp'?' · F (segurar) revive o colega':''}. Mutações descobertas: ${Object.keys(abProg51().muts).length}/${MUT51.length}.`
};

function abismo51(C){
  const W=800,H=450,WL=34,DOOR=80,coop=!!C.net,o=C.room.opt||{},me=me21(C);
  const seed=o.m==='day'?(()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()})():C.seed;
  const HP0=gdPick(C.gd,[8,6,6,4]),ESP=gdPick(C.gd,[.8,1,1.12,1.25]),EHP=gdPick(C.gd,[.8,1,1.2,1.45])*(coop?1.35:1);
  const rnd=mb32((seed^0xab51)>>>0||7),R=n=>Math.floor(rnd()*n),pick=a=>a[R(a.length)];
  let M=null;/* mapa do andar */
  const mkP=(p,i)=>({u:p.u,n:p.n,c:p.c,x:W/2+(i?40:-40),y:H/2,hp:HP0,max:HP0,sh:0,dmg:1,spd:210,rate:.34,range:.85,shot:440,cool:0,inv:0,f:{},muts:[],act:null,coins:0,bombs:1,keys:1,
    inp:{},cnt:{},last:{},dead:false,rev:0,dashCd:0,dashT:0,kills:0,buys:0,pacts:0,ringT:4,aim:null});
  const S={fl:0,room:null,ps:(coop?C.players.slice(0,2):[{u:C.me,n:me.n,c:me.c}]).map(mkP),en:[],tears:[],eb:[],bombs:[],booms:[],beams:[],decoy:null,slowT:0,
    kills:0,roomsSeen:0,pedAdd:[],ot:0,over:false,won:false,msg:'',msgT:0,sendAt:0,keys:{},trap:false,trans:0,flMsg:0,found:[]};
  const myP=()=>S.ps.find(p=>p.u===C.me)||S.ps[0];
  const nb=(r,dx,dy)=>{const n=M.rooms[M.K(r.x+dx,r.y+dy)];if(!n)return null;if(n.hidden&&!(r.open&&r.open[dx+','+dy]))return null;return n};
  const secretWall=(r,dx,dy)=>{const n=M.rooms[M.K(r.x+dx,r.y+dy)];return n&&n.hidden&&!(r.open&&r.open[dx+','+dy])};
  function say(m){S.msg=m;S.msgT=performance.now()}
  function floor(f){S.fl=f;M=abGen51(seed,f);S.trap=false;const st=M.rooms[M.K(3,3)];S.ps.forEach((p,i)=>{p.x=W/2+(i?40:-40);p.y=H/2+40});enter(st,null);S.flMsg=performance.now();
    if(S.ps.some(p=>p.f.map))Object.values(M.rooms).forEach(r=>{if(!r.hidden)r.seen=true});
    say(`Andar ${f+1}: ${ABF51[f].n}`)}
  function mutPool(){const have=new Set(S.ps.flatMap(p=>p.muts));const pool=MUT51.map((m,i)=>i).filter(i=>!have.has(MUT51[i][0])||['orbit','dmg','luck','shield','hp','rate'].includes(MUT51[i][0]));return pool}
  function fillRoom(r){if(r.filled)return;r.filled=true;const rr=mb32(r.seed),Rr=n=>Math.floor(rr()*n);
    const pool=mutPool(),pm=()=>pool[Rr(pool.length)];
    if(r.kind==='treasure')r.peds.push({x:W/2,y:H/2,mut:pm()});
    if(r.kind==='shop'){const disc=S.ps.some(p=>p.f.disc)?.7:1;const items=[{k:'heart',p:3},{k:'bomb',p:5},{k:'key',p:5},{k:'shield',p:6},rr()<.6?{mut:pm(),p:15}:{act:ACTK51[Rr(5)],p:12}];
      items.forEach((it,i)=>r.peds.push({x:200+i*100,y:H/2,...it,p:Math.max(1,Math.round(it.p*disc))}))}
    if(r.kind==='pact'){const a=PACT51[Rr(PACT51.length)];let b=PACT51[Rr(PACT51.length)];if(b===a)b=PACT51[(PACT51.indexOf(a)+3)%PACT51.length];[a,b].forEach((k,i)=>r.peds.push({x:W/2+(i?90:-90),y:H/2,mut:MUT51.findIndex(m=>m[0]===k),pact:2}))}
    if(r.kind==='secret'){r.drops.push(...[0,1,2,3,4].map(i=>({x:W/2-80+i*40,y:H/2+50,k:'coin'})));if(rr()<.55)r.peds.push({x:W/2,y:H/2-20,mut:pm()});else r.drops.push({x:W/2,y:H/2-20,k:pick(['bomb','key','shield','heart'])},{x:W/2+40,y:H/2-20,k:'bomb'})}
    if(r.kind==='start'&&S.fl===0&&!coop&&rr()<1)r.drops.push({x:W/2,y:H/2-70,k:'bomb'})}
  function foe(k,x,y){const m=1+S.fl*.3,b={traco:{r:14,hp:3,spd:95},mosca:{r:10,hp:2,spd:140,fly:1},olho:{r:16,hp:4,spd:0,cool:1.5},aranha:{r:13,hp:4,spd:0,hop:1},larva:{r:15,hp:5,spd:60},torre:{r:17,hp:8,spd:0,cool:2},fantasma:{r:14,hp:5,spd:80,fly:1}}[k];
    return{k,x,y,...b,hp:b.hp*m*EHP,max:b.hp*m*EHP,cool:(b.cool||1)+rnd()*1.5,ph:rnd()*9,vx:0,vy:0,hitT:0,slow:0,pois:0}}
  function boss(){const hp=[45,70,90,130][S.fl]*EHP;return{k:'boss',b:S.fl,x:W/2,y:150,r:[40,44,38,46][S.fl],hp,max:hp,cool:2,ph:0,vx:0,vy:0,hitT:0,slow:0,pois:0,a:0}}
  function enter(r,from){S.tpN=(S.tpN|0)+1;S.room=r;S.en=[];S.eb=[];S.tears=[];S.bombs=[];S.beams=[];S.decoy=null;if(!r.seen){r.seen=true;S.roomsSeen++}
    if(r.kind==='secret'&&!S.found.includes(S.fl)){S.found.push(S.fl);C.achieve?.('ab_segredo');say('✨ Sala Secreta!')}
    S.ps.forEach((p,i)=>{if(from){p.x=from[0]?(from[0]>0?WL+32:W-WL-32):W/2+(i?28:-28);p.y=from[1]?(from[1]>0?WL+32:H-WL-32):H/2+(i?28:-28)}p.inv=Math.max(p.inv,.8)});
    fillRoom(r);
    if(!r.clear&&r.kind==='fight'){const n=3+S.fl+R(3);const kinds=['traco','traco','mosca','olho'].concat(S.fl>=1?['aranha','larva']:[]).concat(S.fl>=2?['torre','fantasma']:[]);
      for(let i=0;i<n;i++){let x,y,t=0;do{x=120+rnd()*560;y=90+rnd()*270}while(t++<20&&S.ps.some(p=>Math.hypot(p.x-x,p.y-y)<150));const e=foe(pick(kinds),x,y);wallClamp(e);S.en.push(e)}}
    if(!r.clear&&r.kind==='boss'){S.en.push(boss());say(`👹 ${ABF51[S.fl].boss}`);fx5('activate')}
    if(r.kind==='shop')say('🛒 Loja: pise no item para comprar');if(r.kind==='pact')say('⛧ Sala do Pacto: poder em troca de corações');if(r.kind==='treasure')say('✦ Sala do Tesouro')}
  function wallClamp(o,ghost){o.x=clamp12(o.x,WL+o.r,W-WL-o.r);o.y=clamp12(o.y,WL+o.r,H-WL-o.r);if(ghost)return;S.room.rocks.forEach(k=>{const dx=o.x-k.x,dy=o.y-k.y,d=Math.hypot(dx,dy);if(d<k.r+o.r&&d>0){o.x=k.x+dx/d*(k.r+o.r);o.y=k.y+dy/d*(k.r+o.r)}})}
  function hurt(p,src){if(p.inv>0||p.dead||p.dashT>0)return;if(p.sh>0){p.sh--;p.inv=1;fx5('click');say('🛡 Escudo de Lucidez!');return}p.hp--;p.inv=1;fx5('error');C.fx?.shake(4,.2);
    if(p.f.thorn&&src&&src.hp!=null){src.hp-=2;src.hitT=performance.now()}
    if(p.hp<=0){p.dead=true;p.hp=0;p.rev=0;say(coop?`${p.n} caiu! Segure F perto para reviver`:`${p.n} caiu no Abismo`);if(S.ps.every(q=>q.dead))end(false)}}
  function score(){return S.roomsSeen*40+S.kills*20+S.fl*500+(S.won?2000:0)+S.ps.reduce((a,p)=>a+p.coins*5,0)}
  function end(won){if(S.over)return;S.over=true;S.won=won;if(won)C.achieve?.('abismo');
    const deep=S.fl+(won?1:0);let first=false;progPut38(p=>{p.ab=p.ab||{};p.ab.muts=p.ab.muts||{};if(deep>(p.ab.deep||0))p.ab.deep=deep;if(won){first=!p.ab.wins;p.ab.wins=(p.ab.wins||0)+1}S.ps.forEach(q=>q.muts.forEach(k=>p.ab.muts[k]=1))});
    const mul=gdMul38(C.gd);S.rw={ob:Math.min(220,Math.round((S.fl*9+S.kills*.2+S.roomsSeen*.6)*mul)+(won?40:0)+(first?20:0)),why:[`andar ${S.fl+1}`,won?'Abismo vencido':'',first?'primeira vitória':''].filter(Boolean).join(' · ')};S.rw.xp=Math.round(S.rw.ob*.6);
    if(coop&&C.host)C.send('as',{st:snap()});
    const p=myP();setTimeout(()=>C.finish({title:won?'🗝 O Perseus do Véu caiu! O Abismo está limpo':`🗝 O Abismo venceu no andar ${S.fl+1} · ${ABF51[S.fl].n}`,unit:'pts',
      rows:S.ps.map(q=>({u:q.u,n:q.n,c:q.c,s:score(),w:won})),html:`<ul class="r38-l"><li>🏚 Andar: <b>${S.fl+1}/4</b> · ${esc(ABF51[S.fl].n)}</li><li>🚪 Salas: <b>${S.roomsSeen}</b></li><li>☠ Inimigos: <b>${S.kills}</b></li><li>🧬 Mutações: ${p.muts.map(k=>MUT51.find(m=>m[0]===k)?.[2]||'').join(' ')||'nenhuma'}</li></ul>`}),window.__abFast?0:1200)}
  /* tiros */
  function fire(p,ax,ay){const base=Math.atan2(ay,ax),angs=[];const spread=p.f.tri?[-.2,0,.2]:[0];spread.forEach(s=>{angs.push(base+s);if(p.f.back)angs.push(base+Math.PI+s)});
    if(p.f.beam){p.beamA=angs;p.beamT=.12;return}
    angs.forEach(a=>{const offs=p.f.double?[-8,8]:[0];offs.forEach(of=>{const nx=-Math.sin(a)*of,ny=Math.cos(a)*of;
      S.tears.push({x:p.x+nx,y:p.y+ny,vx:Math.cos(a)*p.shot,vy:Math.sin(a)*p.shot,a,d:p.dmg*(p.f.crit&&rnd()<.1?3:1),r:p.f.big?9:5,life:p.range*(p.f.boom?1.4:1),t:0,o:p.u,f:p.f,gen:0,hit:new Set(),ox:of})})});
    if(p.u===C.me)fx5('click')}
  const tearCol=f=>f.explo?'#ff9b3d':f.homing?'#c58bff':f.poison?'#7dffa8':f.slow?'#9fe8ff':f.pierce?'#7fe3ff':f.chain?'#fff27a':'#ffd36b';
  function hitFoe(e,dmg,f,by){if(e.hp<=0)return;e.hp-=dmg;e.hitT=performance.now();if(f){if(f.poison)e.pois=3;if(f.slow)e.slow=2.5;if(f.knock&&e.k!=='boss'){const d=Math.hypot(e.x-by.x,e.y-by.y)||1;e.x+=(e.x-by.x)/d*26;e.y+=(e.y-by.y)/d*26}}}
  function explode(x,y,r,dmg,hurtPlayers,opens){S.booms.push({x,y,r,t:performance.now()});fx5('bb7');C.fx?.shake(6,.3);
    S.en.forEach(e=>{if(Math.hypot(e.x-x,e.y-y)<r+e.r)hitFoe(e,dmg)});
    S.room.rocks=S.room.rocks.filter(k=>Math.hypot(k.x-x,k.y-y)>r+k.r*.5);
    if(hurtPlayers)S.ps.forEach(p=>{if(!p.dead&&Math.hypot(p.x-x,p.y-y)<r)hurt(p)});
    if(opens){for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){if(!secretWall(S.room,dx,dy))continue;const wx=dx?(dx<0?WL:W-WL):W/2,wy=dy?(dy<0?WL:H-WL):H/2;if(Math.hypot(wx-x,wy-y)<r+50){S.room.open=S.room.open||{};S.room.open[dx+','+dy]=1;const n=M.rooms[M.K(S.room.x+dx,S.room.y+dy)];n.hidden=false;n.open=n.open||{};n.open[(-dx)+','+(-dy)]=1;say('🕳 Uma passagem secreta se abriu!');fx5('mgWin')}}}}
  function useActive(p){const a=p.act;if(!a||a.ch<ACT51[a.k].max){if(a)say('Item Ativo ainda carregando');return}a.ch=0;fx5('activate');
    if(a.k==='livro'){p.inv=3;say('📖 Invencível!')}else if(a.k==='solar'){C.fx?.flash('#ffd36b',.4);S.en.forEach(e=>hitFoe(e,6))}else if(a.k==='vela'){S.decoy={x:p.x,y:p.y,t:4.5}}
    else if(a.k==='ampulheta'){S.slowT=5;say('⏳ O tempo desacelera')}else if(a.k==='sino'){S.ps.forEach(q=>{if(!q.dead)q.hp=Math.min(q.max,q.hp+2)});Object.values(M.rooms).forEach(r=>{r.seen=true})}}
  function grabPed(p,pd){const r=S.room;
    if(pd.p!=null){if(p.coins<pd.p){const n=performance.now();if(!(pd.warn>n)){pd.warn=n+1500;say(`Custa ${pd.p} Óbolos`)}return false}p.coins-=pd.p;p.buys++;if(p.buys>=4)C.achieve?.('ab_loja')}
    if(pd.pact){if(p.max<=pd.pact){const n=performance.now();if(!(pd.warn>n)){pd.warn=n+1500;say('Você não tem corações para esse pacto')}return false}p.max-=pd.pact;p.hp=Math.min(p.hp,p.max);p.pacts++;if(p.pacts>=2)C.achieve?.('ab_pacto');C.fx?.flash('#600',.3);r.peds.forEach(q=>{if(q.pact&&q!==pd)q.gone=1})}
    if(pd.mut!=null){const m=MUT51[pd.mut];m[4](p);p.muts.push(m[0]);say(`${m[2]} ${m[1]}: ${m[3]}`);fx5('mgWin');C.fx?.flash('#c39bff',.2);if(p.muts.length>=6)C.achieve?.('ab_sinergia')}
    else if(pd.act){const old=p.act;p.act={k:pd.act,ch:ACT51[pd.act].max};say(`${ACT51[pd.act].ico} ${ACT51[pd.act].n}: ${ACT51[pd.act].d} (Espaço)`);fx5('mgWin');if(old)S.pedAdd.push({x:pd.x,y:pd.y+60,act:old.k});}
    else if(pd.k){giveDrop(p,pd.k)}
    return true}
  function giveDrop(p,k){if(k==='coin')p.coins++;else if(k==='heart'){if(p.hp>=p.max)return false;p.hp=Math.min(p.max,p.hp+2)}else if(k==='bomb')p.bombs++;else if(k==='key')p.keys++;else if(k==='shield')p.sh++;fx5('mgCoin');return true}
  function roomCleared(){const r=S.room;r.clear=true;say('Sala limpa · portas abertas');fx5('confirm');
    S.ps.forEach(p=>{if(p.act&&p.act.ch<ACT51[p.act.k].max)p.act.ch++});
    const luck=S.ps.reduce((a,p)=>a+(p.f.luck||0),0);if(r.kind==='fight'&&rnd()<.38+luck*.15)r.drops.push({x:W/2,y:H/2,k:pick(['coin','coin','heart','bomb','key','shield'])});
    if(r.kind==='boss'){if(S.fl<3){r.peds.push({x:W/2-80,y:H/2,mut:pick(mutPool())});S.trap=true;say('Chefe derrotado! Pegue a mutação e desça pelo alçapão')}else end(true)}}
  function sim(dt){
    if(S.over)return;const r=S.room;S.ot+=dt;S.slowT=Math.max(0,S.slowT-dt);
    if(S.decoy){S.decoy.t-=dt;if(S.decoy.t<=0)S.decoy=null}
    const alive=S.ps.filter(p=>!p.dead);
    S.ps.forEach(p=>{const i=p.inp,cnt=i.cnt||{};p.inv=Math.max(0,p.inv-dt);p.cool=Math.max(0,p.cool-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.dashT=Math.max(0,p.dashT-dt);p.r=13;
      const pr=k=>{const n=cnt[k]|0;if(n>(p.last[k]|0)){p.last[k]=n;return true}return false};
      if(p.dead){pr('B');pr('A');pr('D');return}
      if(pr('B')&&p.bombs>0){p.bombs--;S.bombs.push({x:p.x,y:p.y,t:1.2,big:p.f.bigb});fx5('click')}
      if(pr('A'))useActive(p);
      if(pr('D')&&p.f.dash&&p.dashCd<=0){p.dashT=.22;p.dashCd=.9;fx5('mgJump')}
      let mx=(i.r?1:0)-(i.l?1:0),my=(i.d?1:0)-(i.u?1:0);const n=Math.hypot(mx,my)||1,sp=p.spd*(p.dashT>0?2.6:1);p.x+=mx/n*sp*dt;p.y+=my/n*sp*dt;
      if(r.clear){for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){const nr=nb(r,dx,dy);if(!nr)continue;const gap=dy?Math.abs(p.x-W/2)<DOOR/2-6:Math.abs(p.y-H/2)<DOOR/2-6;
        const past=dy<0?p.y<WL+p.r+2:dy>0?p.y>H-WL-p.r-2:dx<0?p.x<WL+p.r+2:p.x>W-WL-p.r-2;
        if(gap&&past){if(nr.locked){if(p.keys>0){p.keys--;nr.locked=false;say('🔑 Porta destrancada');fx5('activate')}else{const nn=performance.now();if(!(S.lockW>nn)){S.lockW=nn+1500;say('🔒 Trancada: precisa de uma chave')}continue}}
          enter(nr,[dx,dy]);return}}}
      wallClamp(p,p.f.ghost);
      if(i.ax!=null&&(i.ax||i.ay)&&p.cool<=0){p.cool=p.f.beam?.05:p.rate;fire(p,i.ax,i.ay)}
      if(p.f.ring){p.ringT-=dt;if(p.ringT<=0){p.ringT=4;for(let k=0;k<12;k++){const a=k/12*TAU16;S.tears.push({x:p.x,y:p.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,a,d:p.dmg,r:6,life:.6,t:0,o:p.u,f:{explo:0},gen:1,hit:new Set(),col:'#ff9b3d'})}fx5('bb3')}}
      if(p.f.magnet)r.drops.forEach(d=>{const dd=Math.hypot(p.x-d.x,p.y-d.y);if(dd<220&&dd>1){d.x+=(p.x-d.x)/dd*240*dt;d.y+=(p.y-d.y)/dd*240*dt}});
      r.drops=r.drops.filter(d=>!(Math.hypot(p.x-d.x,p.y-d.y)<22&&giveDrop(p,d.k)));
      r.peds=r.peds.filter(pd=>!pd.gone&&!(Math.hypot(p.x-pd.x,p.y-pd.y)<24&&grabPed(p,pd)));r.peds=r.peds.filter(q=>!q.gone).concat(S.pedAdd);S.pedAdd=[];
      if(S.trap&&Math.hypot(p.x-W/2,p.y-H/2-60)<26&&!S.over){floor(S.fl+1);return}
      /* raio contínuo */
      if(p.f.beam&&p.beamT>0){p.beamT-=dt;S.beams.push(...(p.beamA||[]).map(a=>({x:p.x,y:p.y,a,o:p.u})));const dps=p.dmg/p.rate*1.15;
        (p.beamA||[]).forEach(a=>{let len=620;if(!p.f.spectral)r.rocks.forEach(k=>{const t=(k.x-p.x)*Math.cos(a)+(k.y-p.y)*Math.sin(a);if(t>0){const dd=Math.abs(-(k.x-p.x)*Math.sin(a)+(k.y-p.y)*Math.cos(a));if(dd<k.r)len=Math.min(len,t)}});p.beamL=len;
          S.en.forEach(e=>{const t=(e.x-p.x)*Math.cos(a)+(e.y-p.y)*Math.sin(a);if(t<0||t>len)return;const dd=Math.abs(-(e.x-p.x)*Math.sin(a)+(e.y-p.y)*Math.cos(a));if(dd<e.r+8)hitFoe(e,dps*dt,p.f,p)})})}
      /* reviver */
      if(coop&&i.f){const dn=S.ps.find(q=>q.dead&&q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<50);if(dn){dn.rev+=dt;if(dn.rev>=2){dn.dead=false;dn.hp=2;dn.inv=2;dn.rev=0;say(`${p.n} reviveu ${dn.n}!`);fx5('mgWin');C.achieve?.('ab_reviver')}}}
    });
    if(S.over||S.room!==r)return;
    const live=S.ps.filter(p=>!p.dead);if(!live.length)return;
    const tgtOf=e=>S.decoy?S.decoy:live.reduce((a,b)=>Math.hypot(b.x-e.x,b.y-e.y)<Math.hypot(a.x-e.x,a.y-e.y)?b:a);
    const spk=S.slowT>0?.4:1;
    S.en.forEach(e=>{const t=tgtOf(e),dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1,sl=(e.slow>0?.5:1)*spk*ESP;e.slow=Math.max(0,e.slow-dt);
      if(e.pois>0){e.pois-=dt;e.hp-=.8*dt}
      if(e.k==='traco'||e.k==='larva'){e.x+=dx/d*e.spd*sl*dt;e.y+=dy/d*e.spd*sl*dt;wallClamp(e)}
      if(e.k==='mosca'||e.k==='fantasma'){e.ph+=dt*4;e.x+=(dx/d*e.spd*.6+Math.cos(e.ph*1.7)*110)*sl*dt;e.y+=(dy/d*e.spd*.6+Math.sin(e.ph*2.3)*110)*sl*dt;wallClamp(e,true)}
      if(e.k==='aranha'){e.cool-=dt*sl;if(e.cool<=0){e.cool=1.3;e.vx=dx/d*360;e.vy=dy/d*360}e.x+=e.vx*dt*sl;e.y+=e.vy*dt*sl;e.vx*=1-3*dt;e.vy*=1-3*dt;wallClamp(e)}
      if(e.k==='olho'){e.cool-=dt*sl;if(e.cool<=0){e.cool=1.8;S.eb.push({x:e.x,y:e.y,vx:dx/d*220*ESP,vy:dy/d*220*ESP,r:6})}}
      if(e.k==='torre'){e.cool-=dt*sl;if(e.cool<=0){e.cool=2.2;e.ph=(e.ph||0)+1;for(let k=0;k<4;k++){const a=k*Math.PI/2+(e.ph%2)*Math.PI/4;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*190*ESP,vy:Math.sin(a)*190*ESP,r:6})}}}
      if(e.k==='boss'){e.cool-=dt*sl;const hp=e.hp/e.max;e.a+=dt;
        if(e.cool<=0){e.ph++;const B=e.b;
          if(B===0){if(e.ph%3===0){e.vx=dx/d*400;e.vy=dy/d*400;e.cool=1.4}else{for(let k=0;k<2;k++)S.en.push(foe('mosca',e.x+(k?30:-30),e.y));e.cool=hp<.5?1.6:2.2}}
          else if(B===1){if(e.ph%3===0){e.vx=dx/d*430;e.vy=dy/d*430;e.cool=1.5}else{const n=hp<.5?16:12,of=e.ph*.25;for(let k=0;k<n;k++){const a=of+k/n*TAU16;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*170*ESP,vy:Math.sin(a)*170*ESP,r:7})}e.cool=hp<.5?1.1:1.5}}
          else if(B===2){if(e.ph%4===0){e.x=120+rnd()*560;e.y=100+rnd()*200;e.cool=.6}else if(e.ph%2){for(let k=0;k<3;k++){const a=Math.atan2(dy,dx)+(k-1)*.2;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*240*ESP,vy:Math.sin(a)*240*ESP,r:7})}e.cool=.7}else{e.spiral=1.6;e.cool=1.8}}
          else{const stg=hp>.6?0:hp>.3?1:2;if(e.ph%3===0){e.vx=dx/d*(420+stg*80);e.vy=dy/d*(420+stg*80);e.cool=1.3-stg*.2}else if(e.ph%3===1){const n=12+stg*6;for(let k=0;k<n;k++){const a=e.ph*.3+k/n*TAU16;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*(170+stg*20)*ESP,vy:Math.sin(a)*(170+stg*20)*ESP,r:7})}e.cool=1.2-stg*.2}else{if(stg>=1)for(let k=0;k<2;k++)S.en.push(foe('traco',e.x,e.y+(k?30:-30)));e.spiral=1.4;e.cool=1.6}}}
        if(e.spiral>0){e.spiral-=dt;e.st=(e.st||0)-dt;if(e.st<=0){e.st=.07;const a=e.a*5;S.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*190*ESP,vy:Math.sin(a)*190*ESP,r:6})}}
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=1-2.5*dt;e.vy*=1-2.5*dt;e.x=clamp12(e.x,WL+e.r,W-WL-e.r);e.y=clamp12(e.y,WL+e.r,H-WL-e.r)}
      live.forEach(p=>{if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+11)hurt(p,e)});
      if(S.decoy&&Math.hypot(S.decoy.x-e.x,S.decoy.y-e.y)<e.r+10)S.decoy.t-=dt*.5});
    /* orbitais */
    S.ps.forEach(p=>{if(p.dead||!p.f.orb)return;for(let k=0;k<p.f.orb;k++){const a=S.ot*2.86+k*TAU16/p.f.orb,ox=p.x+Math.cos(a)*42,oy=p.y+Math.sin(a)*42;
      S.eb.forEach(b=>{if(Math.hypot(b.x-ox,b.y-oy)<b.r+8)b.dead=true});S.en.forEach(e=>{if(Math.hypot(e.x-ox,e.y-oy)<e.r+8)hitFoe(e,2.5*dt)})}});
    /* lágrimas */
    const add=[];
    S.tears.forEach(b=>{b.t+=dt;const f=b.f;
      if(f.homing){let best=null,bd=260;S.en.forEach(e=>{const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;best=e}});if(best){const want=Math.atan2(best.y-b.y,best.x-b.x),cur=Math.atan2(b.vy,b.vx);let da=want-cur;while(da>Math.PI)da-=TAU16;while(da<-Math.PI)da+=TAU16;const nr=cur+clamp12(da,-5*dt,5*dt),sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(nr)*sp;b.vy=Math.sin(nr)*sp}}
      if(f.boom&&b.t>b.life*.45&&!b.back){b.back=1;b.vx*=-1;b.vy*=-1;b.hit.clear()}
      let wx=0,wy=0;if(f.wave){const s=Math.cos(b.t*14)*220;wx=-Math.sin(b.a)*s*dt;wy=Math.cos(b.a)*s*dt}
      b.x+=b.vx*dt+wx;b.y+=b.vy*dt+wy;
      const wall=b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL,rock=!f.spectral&&r.rocks.some(k=>Math.hypot(b.x-k.x,b.y-k.y)<k.r);
      if(wall||rock||b.t>b.life){b.dead=true;if(f.explo)explode(b.x,b.y,42,b.d,false,false)}
      if(b.dead)return;
      for(const e of S.en){if(b.hit.has(e)||Math.hypot(b.x-e.x,b.y-e.y)>e.r+b.r)continue;b.hit.add(e);const owner=S.ps.find(p=>p.u===b.o)||S.ps[0];hitFoe(e,b.d,f,b);
        if(f.chain){const n2=S.en.filter(q=>q!==e&&Math.hypot(q.x-e.x,q.y-e.y)<160)[0];if(n2){hitFoe(n2,b.d*.6,f,e);S.beams.push({x:e.x,y:e.y,x2:n2.x,y2:n2.y,el:1})}}
        if(f.explo)explode(b.x,b.y,42,b.d*.8,false,false);
        if(f.split&&b.gen<1){[-.6,.6].forEach(s=>{const a=Math.atan2(b.vy,b.vx)+s,sp=Math.hypot(b.vx,b.vy);add.push({...b,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,d:b.d*.5,r:Math.max(3,b.r-2),t:0,life:.4,gen:1,hit:new Set([e])})})}
        if(!f.pierce){b.dead=true;break}}});
    S.tears=S.tears.filter(b=>!b.dead).concat(add);
    /* bombas */
    S.bombs.forEach(b=>{b.t-=dt;if(b.t<=0){b.dead=true;explode(b.x,b.y,b.big?110:80,b.big?10:7,true,true)}});S.bombs=S.bombs.filter(b=>!b.dead);
    /* mortes */
    const before=S.en.length;S.en=S.en.filter(e=>{if(e.hp>0)return true;S.kills++;const killer=live[0];live.forEach(p=>{p.kills++;if(p.f.vamp&&p.kills%12===0)p.hp=Math.min(p.max,p.hp+1)});
      if(e.k==='larva'){for(let k=0;k<2;k++)S.en.push(foe('mosca',e.x+(k?14:-14),e.y))}
      const luck=S.ps.reduce((a,p)=>a+(p.f.luck||0),0);if(e.k!=='boss'&&rnd()<.16+luck*.08)r.drops.push({x:e.x,y:e.y,k:rnd()<.8?'coin':pick(['heart','bomb','key'])});
      C.fx?.burst(e.x,e.y,{n:10,col:['#8a1a2a','#ffd36b'],sp:160,life:.45,size:3,grav:0});return false});
    if(S.en.length<before)fx5('mgCoin');
    S.eb.forEach(b=>{b.x+=b.vx*dt*spk;b.y+=b.vy*dt*spk;if(b.x<WL||b.x>W-WL||b.y<WL||b.y>H-WL||r.rocks.some(k=>Math.hypot(b.x-k.x,b.y-k.y)<k.r))b.dead=true;live.forEach(p=>{if(!b.dead&&Math.hypot(p.x-b.x,p.y-b.y)<b.r+9){b.dead=true;hurt(p)}})});S.eb=S.eb.filter(b=>!b.dead);
    if(!r.clear&&!S.en.length&&(r.kind==='fight'||r.kind==='boss'))roomCleared();
  }
  const snap=()=>({fl:S.fl,tp:S.tpN|0,ps:S.ps.map(p=>({u:p.u,x:Math.round(p.x),y:Math.round(p.y),spd:p.spd,hp:p.hp,max:p.max,sh:p.sh,coins:p.coins,bombs:p.bombs,keys:p.keys,dead:p.dead,rev:+p.rev.toFixed(2),inv:+p.inv.toFixed(2),muts:p.muts,act:p.act,f:p.f,beamA:p.beamT>0?p.beamA:null,beamL:p.beamL})),
    en:S.en.map(e=>({k:e.k,b:e.b,x:Math.round(e.x),y:Math.round(e.y),r:e.r,hp:+e.hp.toFixed(1),max:e.max})),t:S.tears.map(b=>[Math.round(b.x),Math.round(b.y),b.r,b.col||tearCol(b.f)]),eb:S.eb.map(b=>[Math.round(b.x),Math.round(b.y),b.r]),bm:S.bombs.map(b=>[Math.round(b.x),Math.round(b.y)]),
    rx:S.room.x,ry:S.room.y,clear:S.room.clear,open:S.room.open||null,peds:S.room.peds,drops:S.room.drops,rocks:S.room.rocks,trap:S.trap,kills:S.kills,seen:S.roomsSeen,msg:S.msg,over:S.over,
    vis:Object.values(M.rooms).filter(q=>q.seen).map(q=>[q.x,q.y]),unl:Object.values(M.rooms).filter(q=>!q.hidden).map(q=>[q.x,q.y]),dec:S.decoy&&[Math.round(S.decoy.x),Math.round(S.decoy.y)]});
  function myInp(){const k=S.keys,i={l:!!k.KeyA,r:!!k.KeyD,u:!!k.KeyW,d:!!k.KeyS,f:!!k.KeyF,cnt:{...myCnt}};let ax=((k.ArrowRight?1:0)-(k.ArrowLeft?1:0)),ay=((k.ArrowDown?1:0)-(k.ArrowUp?1:0));
    if(!ax&&!ay&&S.aim){const p=myP();ax=S.aim[0]-p.x;ay=S.aim[1]-p.y}if(ax||ay){i.ax=ax;i.ay=ay}return i}
  const myCnt={};
  /* convidado: manda as teclas E a posição que ele mesmo calculou (anda na hora, sem esperar o servidor).
     O anfitrião segue dono dos inimigos, do dano, das salas e do fim da run. */
  let pushAt=0,pX=0,pY=0;
  function push(){const i=myInp();if(C.host||!coop){myP().inp=i;return}const p=myP();pushAt=Date.now();pX=p.x;pY=p.y;C.send('ain',{inp:i,x:Math.round(p.x),y:Math.round(p.y),tp:S.tpN|0})}
  /* predição local do próprio personagem (mesmo movimento do sim: velocidade, dash, paredes e pedras) */
  function selfMove(p,dt){if(p.dead||S.over)return;const k=S.keys;S.ldT=Math.max(0,(S.ldT||0)-dt);S.ldCd=Math.max(0,(S.ldCd||0)-dt);
    let mx=(k.KeyD?1:0)-(k.KeyA?1:0),my=(k.KeyS?1:0)-(k.KeyW?1:0);const n=Math.hypot(mx,my)||1,sp=(p.spd||0)*(S.ldT>0?2.6:1);p.r=13;p.x+=mx/n*sp*dt;p.y+=my/n*sp*dt;wallClamp(p,p.f&&p.f.ghost)}
  floor(0);
  return{st:()=>S,map:()=>M,enter,floor,fire:(ax,ay)=>fire(myP(),ax,ay),grab:pd=>grabPed(myP(),pd),explode,useActive:()=>useActive(myP()),
    reward:()=>S.rw||null,
    next(){return coop?null:{opt:{},label:'🗝 Nova run'}},
    key(code,down){const was=!!S.keys[code];S.keys[code]=down;if(down&&!was){const m={KeyE:'B',Space:'A',ShiftLeft:'D',ShiftRight:'D'}[code];if(m)myCnt[m]=(myCnt[m]|0)+1;
        if(m==='D'&&coop&&!C.host){const p=myP();if(p.f&&p.f.dash&&!(S.ldCd>0)){S.ldT=.22;S.ldCd=.9}}}push()},
    ptr(t,px,py,e){if(touch12()&&!(e&&e.pointerType==='mouse'))return;if(t==='down'||(t==='move'&&S.aim))S.aim=[px,py];if(t==='up')S.aim=null;push()},
    msg(p){
      if(C.host&&p.t==='ain'){const pl=S.ps.find(q=>q.u===p.from);if(pl){pl.inp=p.inp||{};
        /* posição do convidado: só vale na mesma sala (tp igual ao da última troca de sala) */
        if(isFinite(p.x)&&isFinite(p.y)&&(p.tp|0)===(S.tpN|0)&&!pl.dead){pl.x=Number(p.x);pl.y=Number(p.y);pl.r=13;wallClamp(pl,pl.f&&pl.f.ghost)}}}
      if(!C.host&&p.t==='as'&&p.st&&p.from===C.room.host){const st=p.st;if(st.fl!==S.fl){S.fl=st.fl;M=abGen51(seed,st.fl)}
        const newRoom=st.tp!=null&&(st.tp|0)!==(S.tpN|0);if(st.tp!=null)S.tpN=st.tp|0;
        st.ps.forEach(g=>{const pl=S.ps.find(q=>q.u===g.u);if(!pl)return;
          /* o próprio personagem é previsto aqui: mantém a posição local, salvo troca de sala ou diferença absurda */
          if(g.u===C.me&&!g.dead&&!newRoom&&Math.hypot(pl.x-g.x,pl.y-g.y)<140){const x0=pl.x,y0=pl.y;Object.assign(pl,g);pl.x=x0;pl.y=y0}else Object.assign(pl,g);
          pl.beamT=g.beamA?.1:0});S.en=st.en;S.tV=st.t;S.ebV=st.eb;S.bmV=st.bm;
        const rm=M.rooms[M.K(st.rx,st.ry)];if(rm){S.room=rm;rm.clear=st.clear;rm.open=st.open;rm.peds=st.peds;rm.drops=st.drops;rm.rocks=st.rocks;rm.seen=true}
        st.vis.forEach(([x,y])=>{const q=M.rooms[M.K(x,y)];if(q)q.seen=true});st.unl.forEach(([x,y])=>{const q=M.rooms[M.K(x,y)];if(q)q.hidden=false});
        S.trap=st.trap;S.kills=st.kills;S.roomsSeen=st.seen;if(st.msg!==S.msg){S.msg=st.msg;S.msgT=performance.now()}S.over=st.over;S.decoy=st.dec?{x:st.dec[0],y:st.dec[1]}:null}},
    left(u){if(!C.host)return;const p=S.ps.find(q=>q.u===u);if(p){p.dead=true;if(S.ps.every(q=>q.dead))end(false)}},
    step(dt){
      if(Date.now()<C.t0)return;
      /* mira com o mouse mandava uma mensagem por quadro (60/s); agora no máximo ~20/s */
      if(coop&&!C.host){S.ot+=dt;const p=myP();selfMove(p,dt);const now=Date.now(),moved=Math.abs(p.x-pX)>.5||Math.abs(p.y-pY)>.5;if(((S.aim||moved)&&now-pushAt>=50)||now-pushAt>400)push()}
      else if(S.aim)push();
      if(C.host||!coop){S.beams=[];sim(dt);if(coop&&Date.now()-S.sendAt>70){S.sendAt=Date.now();C.send('as',{st:snap()})}}
      const p=myP();C.hud(`🗝 ${ABF51[S.fl].n} · ${'❤'.repeat(Math.floor(p.hp/2))}${p.hp%2?'♡':''}${p.sh?' · 🛡'+p.sh:''} · 🪙 ${p.coins} · 💣 ${p.bombs} · 🔑 ${p.keys}${p.act?` · ${ACT51[p.act.k].ico} ${p.act.ch}/${ACT51[p.act.k].max}`:''} · ☠ ${S.kills}`)},
    draw(x){
      const r=S.room,T=ABF51[S.fl],now=performance.now();x.fillStyle=T.bk;x.fillRect(0,0,W,H);x.fillStyle=r.kind==='boss'?'#2a0e18':r.kind==='pact'?'#1a0606':r.kind==='secret'?'#1c1c28':T.fl;x.fillRect(WL,WL,W-WL*2,H-WL*2);
      x.fillStyle='rgba(255,255,255,.025)';for(let i=0;i<12;i++)for(let j=0;j<6;j++)if((i+j)%2)x.fillRect(WL+i*61,WL+j*64,61,64);
      x.fillStyle=T.wl;x.fillRect(0,0,W,WL);x.fillRect(0,H-WL,W,WL);x.fillRect(0,0,WL,H);x.fillRect(W-WL,0,WL,H);
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const n=nb(r,dx,dy);
        if(!n){if(secretWall(r,dx,dy)){x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=2;const cx=dx?(dx<0?WL/2:W-WL/2):W/2,cy=dy?(dy<0?WL/2:H-WL/2):H/2;x.beginPath();x.moveTo(cx-12,cy-8);x.lineTo(cx-2,cy+2);x.lineTo(cx+10,cy-6);x.moveTo(cx-2,cy+2);x.lineTo(cx+2,cy+10);x.stroke()}return}
        x.fillStyle=!r.clear?'#5a2a2a':n.locked?'#6a5a20':'#0c080a';if(dy)x.fillRect(W/2-DOOR/2,dy<0?0:H-WL,DOOR,WL);else x.fillRect(dx<0?0:W-WL,H/2-DOOR/2,WL,DOOR);
        const ic={boss:'💀',treasure:'✦',shop:'🛒',pact:'⛧',secret:'?'}[n.kind]||(n.locked?'🔒':'');if(ic||n.locked){const tx=dy?W/2:dx<0?WL/2:W-WL/2,ty=dx?H/2:dy<0?WL/2:H-WL/2;t21(x,n.locked?'🔒':ic,tx,ty,{size:13})}});
      r.rocks.forEach(k=>{x.beginPath();x.arc(k.x,k.y,k.r,0,TAU16);x.fillStyle='#4a3a40';x.fill();x.strokeStyle='#6a5560';x.lineWidth=2;x.stroke()});
      if(S.trap&&r.kind==='boss'){x.fillStyle='#000';rr21(x,W/2-26,H/2+40,52,40,6);x.fill();x.strokeStyle='#5a4a60';x.lineWidth=3;x.stroke();t21(x,'alçapão',W/2,H/2+96,{size:11,col:'#aaa'})}
      r.drops.forEach(d=>{const ic={coin:'🪙',heart:'❤',bomb:'💣',key:'🔑',shield:'🛡'}[d.k];t21(x,ic,d.x,d.y+Math.sin(now/300+d.x)*2,{size:18})});
      r.peds.forEach(pd=>{x.fillStyle='#3a2e40';rr21(x,pd.x-18,pd.y+6,36,14,4);x.fill();const b=Math.sin(now/300+pd.x)*3;x.beginPath();x.arc(pd.x,pd.y-8+b,18,0,TAU16);x.fillStyle=pd.pact?'rgba(200,30,40,.35)':'rgba(195,155,255,.28)';x.fill();
        const ic=pd.mut!=null?MUT51[pd.mut][2]:pd.act?ACT51[pd.act].ico:{heart:'❤',bomb:'💣',key:'🔑',shield:'🛡'}[pd.k];t21(x,ic,pd.x,pd.y-8+b,{size:22});
        const lbl=pd.mut!=null?MUT51[pd.mut][1]:pd.act?ACT51[pd.act].n:'';if(lbl&&S.ps.some(p=>Math.hypot(p.x-pd.x,p.y-pd.y)<110))t21(x,lbl,pd.x,pd.y-40,{size:11,col:'#e9d6ff',stroke:3});
        if(pd.p!=null)t21(x,`🪙${pd.p}`,pd.x,pd.y+32,{size:12,col:'#ffd36b'});if(pd.pact)t21(x,`-${pd.pact/2} ❤ máx.`,pd.x,pd.y+32,{size:12,col:'#ff6b6b'})});
      (S.bmV||S.bombs.map(b=>[b.x,b.y])).forEach(([bx,by])=>{x.beginPath();x.arc(bx,by,11,0,TAU16);x.fillStyle='#222';x.fill();x.fillStyle=Math.floor(now/120)%2?'#ff4a3a':'#ffd36b';x.fillRect(bx-2,by-16,4,6)});
      S.booms=S.booms.filter(b=>now-b.t<350);S.booms.forEach(b=>{const k=(now-b.t)/350;x.beginPath();x.arc(b.x,b.y,b.r*(.5+k*.6),0,TAU16);x.fillStyle=`rgba(255,180,60,${.6*(1-k)})`;x.fill()});
      if(S.decoy){t21(x,'🕯',S.decoy.x,S.decoy.y,{size:22});x.globalAlpha=.4;sprAt16(x,myP().c,S.decoy.x,S.decoy.y-10,30);x.globalAlpha=1}
      S.en.forEach(e=>{const fl=now-(e.hitT||0)<80;
        if(e.k==='boss'){const tint=['rgba(60,90,20,.55)','rgba(200,200,200,.45)','rgba(80,60,200,.55)','rgba(40,0,60,.6)'][e.b||0];const im=tint18(-1,tint);x.save();if(fl)x.globalAlpha=.6;if(im)x.drawImage(im,e.x-e.r*1.4,e.y-e.r*1.4,e.r*2.8,e.r*2.8);else{x.beginPath();x.arc(e.x,e.y,e.r,0,TAU16);x.fillStyle='#401060';x.fill()}x.restore();
          x.fillStyle='#300';x.fillRect(W/2-150,H-24,300,10);x.fillStyle='#c33';x.fillRect(W/2-150,H-24,300*Math.max(0,e.hp)/e.max,10);t21(x,ABF51[e.b||0].boss,W/2,H-34,{size:11});return}
        x.beginPath();x.arc(e.x,e.y,e.r,0,TAU16);x.fillStyle=fl?'#fff':{traco:'#8a1a2a',olho:'#3a6aa0',mosca:'#5a8a3a',aranha:'#6a3a20',larva:'#b0a060',torre:'#5a5a6a',fantasma:'rgba(200,200,255,.55)'}[e.k];x.fill();
        if(e.k==='olho'||e.k==='torre'){x.beginPath();x.arc(e.x,e.y,6,0,TAU16);x.fillStyle='#fff';x.fill();x.beginPath();x.arc(e.x,e.y,3,0,TAU16);x.fillStyle='#000';x.fill()}
        if(e.k==='aranha'){x.strokeStyle='#3a1a10';x.lineWidth=2;for(let k=0;k<4;k++){x.beginPath();x.moveTo(e.x-e.r,e.y-6+k*4);x.lineTo(e.x-e.r-8,e.y-10+k*6);x.moveTo(e.x+e.r,e.y-6+k*4);x.lineTo(e.x+e.r+8,e.y-10+k*6);x.stroke()}}
        if(e.pois>0){x.strokeStyle='#7dffa8';x.lineWidth=2;x.beginPath();x.arc(e.x,e.y,e.r+3,0,TAU16);x.stroke()}if(e.slow>0){x.strokeStyle='#9fe8ff';x.lineWidth=2;x.beginPath();x.arc(e.x,e.y,e.r+5,0,TAU16);x.stroke()}});
      S.ps.forEach(p=>{if(!p.beamT&&!p.beamA)return;if(!(p.beamT>0))return;(p.beamA||[]).forEach(a=>{const L=p.beamL||620;x.save();x.strokeStyle='rgba(255,240,160,.9)';x.shadowColor='#ffd36b';x.shadowBlur=16;x.lineWidth=10;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x+Math.cos(a)*L,p.y+Math.sin(a)*L);x.stroke();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();x.restore()})});
      S.beams.filter(b=>b.el).forEach(b=>{x.strokeStyle='#fff27a';x.lineWidth=2;x.beginPath();x.moveTo(b.x,b.y);x.lineTo(b.x2,b.y2);x.stroke()});
      (S.tV||S.tears.map(b=>[b.x,b.y,b.r,b.col||tearCol(b.f)])).forEach(([bx,by,br,col])=>{x.beginPath();x.arc(bx,by,br,0,TAU16);x.fillStyle=col;x.fill()});
      (S.ebV||S.eb.map(b=>[b.x,b.y,b.r])).forEach(([bx,by,br])=>{x.beginPath();x.arc(bx,by,br,0,TAU16);x.fillStyle='#ff4a7a';x.fill()});
      S.ps.forEach(p=>{if(p.dead){t21(x,'✝',p.x,p.y,{size:22,col:'#aaa'});if(coop){x.strokeStyle='#ffd36b';x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,20,-Math.PI/2,-Math.PI/2+TAU16*(p.rev/2));x.stroke();t21(x,'F',p.x,p.y+26,{size:10,col:'#ffd36b'})}return}
        if(p.f.orb)for(let k=0;k<p.f.orb;k++){const a=S.ot*2.86+k*TAU16/p.f.orb;x.beginPath();x.arc(p.x+Math.cos(a)*42,p.y+Math.sin(a)*42,7,0,TAU16);x.fillStyle='#b48cff';x.fill()}
        if(p.inv>0&&p.inv<1&&Math.floor(now/90)%2)return;const nm=p.muts.length;if(nm){x.beginPath();x.arc(p.x,p.y,20+Math.min(8,nm),0,TAU16);x.fillStyle=`rgba(${p.f.beam?'255,220,120':p.f.homing?'190,140,255':'255,200,120'},${.12+Math.min(.3,nm*.04)})`;x.fill()}
        if(p.inv>=1&&p.f){x.strokeStyle='rgba(255,230,140,.7)';x.lineWidth=3;x.beginPath();x.arc(p.x,p.y,24,0,TAU16);x.stroke()}
        sprAt16(x,p.c,p.x,p.y,34+Math.min(10,nm));if(coop)t21(x,p.n,p.x,p.y-28,{size:10,stroke:3})});
      /* minimapa */
      const ms=13;Object.values(M.rooms).forEach(q=>{if(q.hidden)return;const near=Object.values(M.rooms).some(o=>o.seen&&!o.hidden&&Math.abs(o.x-q.x)+Math.abs(o.y-q.y)===1);if(!q.seen&&!near)return;
        x.fillStyle=q===r?'#ffd36b':q.seen?'#776':'#333';x.fillRect(W-100+q.x*ms,6+q.y*9,ms-2,7);const ic={boss:'💀',treasure:'✦',shop:'$',pact:'⛧',secret:'?'}[q.kind];if(ic&&(q.seen||near))t21(x,ic,W-100+q.x*ms+5,10+q.y*9,{size:7})});
      /* HUD */
      const p=myP();let hx=WL+8;for(let k=0;k<p.max;k+=2){t21(x,p.hp>=k+2?'❤':p.hp===k+1?'♡':'·',hx,WL+12,{size:16,col:'#ff4a5a',al:'left'});hx+=18}for(let k=0;k<p.sh;k++){t21(x,'🛡',hx,WL+12,{size:14,al:'left'});hx+=18}
      t21(x,`🪙 ${p.coins}  💣 ${p.bombs}  🔑 ${p.keys}`,WL+8,WL+32,{size:13,al:'left',col:'#ddd'});
      if(p.act){const A=ACT51[p.act.k];t21(x,A.ico,WL+14,WL+56,{size:20});x.fillStyle='#333';x.fillRect(WL+30,WL+50,40,8);x.fillStyle=p.act.ch>=A.max?'#ffd36b':'#8a7aa0';x.fillRect(WL+30,WL+50,40*p.act.ch/A.max,8)}
      if(p.muts.length)t21(x,p.muts.map(k=>MUT51.find(m=>m[0]===k)?.[2]).join(''),WL+8,H-WL-12,{size:13,al:'left'});
      t21(x,`${T.n} · andar ${S.fl+1}/4`,W-WL-8,H-WL-12,{size:11,al:'right',col:'#887'});
      if(S.msg&&now-S.msgT<2600)t21(x,S.msg,W/2,70,{size:17,w:800,col:'#ffd36b',stroke:4});
      if(now-S.flMsg<1800){x.fillStyle=`rgba(0,0,0,${.6*(1-(now-S.flMsg)/1800)})`;x.fillRect(0,0,W,H);t21(x,`Andar ${S.fl+1} · ${T.n}`,W/2,H/2,{size:34,w:900,col:'#e9d6ff',stroke:5})}
    }
  };
}
Object.assign(ACH,{
  abismo:{ico:'🗝',n:'Limpa-Abismo',d:'Derrote o Perseus do Véu no fundo do Labirinto do Abismo.'},
  ab_sinergia:{ico:'🧬',n:'Sinergia',d:'Junte 6 mutações numa mesma run do Abismo.'},
  ab_pacto:{ico:'⛧',n:'Pactário',d:'Aceite 2 pactos numa mesma run do Abismo.'},
  ab_segredo:{ico:'🕳',n:'Explorador do Abismo',d:'Encontre uma Sala Secreta com bombas.'},
  ab_loja:{ico:'🛒',n:'Freguês do Abismo',d:'Compre 4 itens na loja numa mesma run.'},
  ab_reviver:{ico:'🤝',n:'Ninguém Fica Para Trás',d:'Reviva o colega no Co-op do Abismo.',secret:true},
});
{const _p=padHtml;padHtml=function(p){
  const b=(k,l,cls='',al)=>`<button type="button" class="mg-pb ${cls}" data-k="${k}" aria-label="${al||l}">${l}</button>`;
  if(p==='ab51')return`<div>${b('KeyA','◀','','Andar à esquerda')}${b('KeyW','▲','','Andar para cima')}${b('KeyS','▼','','Andar para baixo')}${b('KeyD','▶','','Andar à direita')}</div><div>${b('ArrowLeft','←','','Atirar à esquerda')}${b('ArrowUp','↑','','Atirar para cima')}${b('ArrowDown','↓','','Atirar para baixo')}${b('ArrowRight','→','','Atirar à direita')}</div><div>${b('KeyE','💣','','Bomba')}${b('Space','✨','','Item Ativo')}${b('ShiftLeft','👣','','Dash')}${b('KeyF','🤝','','Reviver')}</div>`;
  return _p.apply(this,arguments)}}
defineArcadeGame('abismo',{...GAMES12.abismo,make:abismo51,setup:abSetup51,pad:'ab51',
  desc:'Roguelike em 4 andares: Combate, Tesouro, Loja, Pacto, Sala Secreta e Chefe. 35 mutações que se combinam, itens ativos, bombas e chaves. Co-op para 2.',
  rule:'Desça até o Núcleo do Véu e derrote o Perseus do Véu. Pontos por salas, inimigos, andares e Óbolos.',
  keys:'WASD anda · setas ou mouse atiram · E bomba · Espaço item ativo · Shift dash · F revive',touch:'Use os botões'});
console.info('[Tulpa] Etapa 51 carregada (Abismo 2.0)');

