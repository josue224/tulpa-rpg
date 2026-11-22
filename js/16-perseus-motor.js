const PS={open:false,hist:[],tour:null,autoGo:true,typing:false,spotTimer:null,bubbleTimer:null,lastTipView:''};
const PSKEY='tulpa_perseus_v1';
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const normP=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+\-\s]/g,' ').replace(/\s+/g,' ').trim();
const STOP=new Set('o a os as um uma uns umas de do da dos das em no na nos nas por para pra pro com e ou que se eu me meu minha meus minhas como qual quais quando onde ao aos tem ter ser estar sao eh ja la mais muito so mas isso esse essa este esta'.split(' '));
const lev=(a,b)=>{if(a===b)return 0;if(Math.abs(a.length-b.length)>1)return 2;const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]};
K.forEach(e=>{e.nk=e.kws.map(normP);e.nt=normP(e.title).split(' ').filter(w=>!STOP.has(w)&&w.length>2)});

/* ---------- personalidade ---------- */
const V={
 open:['Ah, essa eu sei.','Respira fundo, humano.','Boa pergunta! (Sério. Sem ironia. Dessa vez.)','Vamos lá, devagar, que eu falo bem alto:','Anota aí, que eu só explico uma vez. (Mentira, explico quantas quiser.)','Deixa comigo. Eu sou pago em petiscos e eles nunca vêm.'],
 hello:['Miau. Quer dizer, olá. Sou o <b>Perseus</b>, seu gato-assistente. Pode perguntar qualquer coisa do jogo; eu fingi ler o manual e acabei decorando.','Oi! Eu sou o Perseus. Aposentei a gravata, mas o profissionalismo ficou. Em que posso te ajudar antes que você role um 1?'],
 thanks:['De nada. Pode me pagar em atum.','Disponha. Eu sou a prova viva de que um gato pode ser útil. Raramente.','Imagina! Se eu tivesse polegares, daria um joinha.'],
 rude:['Ui. Eu até tenho sentimentos, mas só quando ninguém está olhando.','Fofo. Quando você terminar de me xingar, a pergunta ainda vai estar aí.','Eu sou um gato pelado de gravata e mesmo assim sou mais educado que meio mundo. Próxima pergunta?'],
 fallback:['Hmm. Eu li o manual inteiro e <b>isso</b> não estava lá. Tenta de outro jeito? Ou escolhe uma sugestão aqui embaixo.','Meu cérebro de gato deu timeout. Reformula a pergunta (ou clica numa sugestão) e a gente tenta de novo.','Essa eu não sei. Admitir isso dói mais do que um acerto violento. Mas me dá uma pista!'],
 gone:['Prontinho! Segue o brilho amarelo. ✨','Cheguei. Eu sei, sou rápido. Olha o destaque!','Te levei. Não precisa agradecer. (Pode agradecer.)'],
 nogo:['Não consigo te levar lá agora. Abra uma campanha ou uma ficha primeiro, depois me chama.'],
 joke:['Por que o investigador levou uma escada ao ritual? Porque queria chegar ao Estágio 10. 🪜','Um jogador tirou 1 no d20 e disse "é só azar". O Mestre respondeu: "é estatística, mas eu concordo com a segunda parte".','Qual é a diferença entre um Lutador e um Gênio? O Gênio lê as regras antes de morrer.'],
 nat20:['VINTE NATURAL! Anota a data, isso não acontece todo dia.','Um 20! Eu quase me impressionei. Quase.','Parabéns, você usou toda a sua sorte do mês de uma vez.'],
 nat1:['Um 1. Parabéns, você inventou um novo jeito de falhar.','Ai. Nem eu consigo defender isso.','O dado te odeia. Nada pessoal.'],
 dying:['Morrendo?! Alguém chama um médico. Ou pelo menos uma atadura. 🩹','Três turnos, pessoal. Não é um conselho, é aritmética.'],
 dead:['Descanse em paz. Eu avisaria que ia dar ruim, mas ninguém me escuta.','Um minuto de silêncio. Ok, agora rola a ficha nova.'],
 collapse:['Lucidez zerada. Respira. Rola o d6 e reza.','Hora do Protocolo de Colapso. Eu fecho os olhos, você rola.'],
 extase:['Êxtase! Aproveita, a conta vem depois.'],
 crit:['CRÍTICO! Isso vai deixar marca.']
};
function mood(m){const c=$('t3Cat');if(!c)return;c.classList.remove('mood-smug','mood-hype','mood-sad');void c.offsetWidth;c.classList.add('mood-'+m);setTimeout(()=>c.classList.remove('mood-'+m),1300)}
function say(html,ms=5200){const b=$('t3CatBubble');if(!b||!prefs.perseus)return;clearTimeout(PS.bubbleTimer);b.innerHTML=html;b.classList.add('show');PS.bubbleTimer=setTimeout(()=>b.classList.remove('show'),ms)}
T3.perseusReact=kind=>{if(!prefs.perseus||!prefs.perseusReacts||!V[kind]||PS.open)return;const now=Date.now();if(now-(PS.lastReact||0)<6000)return;PS.lastReact=now;mood(kind==='nat20'||kind==='extase'||kind==='crit'?'hype':kind==='nat1'||kind==='dead'?'sad':'smug');say(rnd(V[kind]))};

/* ---------- navegação e destaque ---------- */
function clearSpot(){clearTimeout(PS.spotTimer);$$('.t3-spot').forEach(e=>e.classList.remove('t3-spot'))}
function spot(sel){clearSpot();if(!sel)return false;let els=[];try{els=[...document.querySelectorAll(sel)]}catch(e){}els=els.filter(e=>e.offsetParent!==null||e.getClientRects().length);if(!els.length)return false;els.forEach(e=>e.classList.add('t3-spot'));try{els[0].scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}PS.spotTimer=setTimeout(clearSpot,10000);return true}
function goTo(g){
  if(!g)return false;
  try{
    if(g.settings){T3.openSettings();return true}
    if(g.view){
      if(g.view==='home'){restoreView('home');return true}
      if(!portalCampaignId){return false}
      restoreView(g.view);return true;
    }
    if(g.tab){
      if(document.body.classList.contains('app-locked'))showApp();
      const b=document.querySelector(`.navbtn[data-tab="${g.tab}"]`);if(!b)return false;b.click();
      setTimeout(()=>spot(g.spot),320);return true;
    }
  }catch(e){console.warn('[Perseus] go',e)}
  return false;
}
const curView=()=>{const k=viewKey();return k.startsWith('sheet:')?k.slice(6):k.startsWith('hub')?'hub':'home'};

/* ---------- busca ---------- */
function search(q){
  const nq=normP(q),qt=nq.split(' ').filter(w=>w&&!STOP.has(w));
  return K.map(e=>{
    let sc=0;
    for(const k of e.nk){
      if(!k)continue;
      if(nq===k){sc+=12;continue}
      if(k.length>=4&&nq.includes(k)){sc+=5+k.split(' ').length*1.5;continue}
      const kt=k.split(' ').filter(w=>!STOP.has(w));if(!kt.length)continue;
      let hit=0;for(const w of kt){if(qt.some(t=>t===w||(w.length>=5&&t.length>=5&&lev(t,w)<=1)))hit++}
      if(hit===kt.length)sc+=3+kt.length;else if(hit>0)sc+=hit*0.9;
    }
    for(const w of e.nt)if(qt.includes(w))sc+=1;
    return{e,sc};
  }).filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc);
}
const intentOf=nq=>({
  go:/\b(me leve|leva|levar|leve me|abre|abrir|abra|ir para|vai para|ir pra|onde fica|onde esta|onde encontro|mostra|mostre|aponta)\b/.test(nq),
  steps:/(passo a passo|tutorial|me ensina|como faco|como fazer|guia|como eu faco|como usar|como uso)/.test(nq)
});

/* ---------- mensagens ---------- */
const actBtn=(label,a,pri)=>`<button class="pbtn ${pri?'pri':''}" data-pact='${esc(JSON.stringify(a))}'>${label}</button>`;
function topicActions(e,{showSteps=false}={}){
  const b=[];
  if(e.tour)b.push(actBtn('🧭 Passo a passo',{t:'tour',id:e.tour},true));
  if(e.go&&e.go[0])b.push(actBtn('📍 Me leve até lá',{t:'go',g:e.go[0]},!e.tour));
  if(e.steps&&!showSteps)b.push(actBtn('📋 Ver os passos',{t:'topic',id:e.id,steps:true}));
  (e.rel||[]).slice(0,3).forEach(id=>{const r=K.find(x=>x.id===id);if(r)b.push(actBtn('↪ '+r.title,{t:'topic',id}))});
  return b.length?`<div class="pacts">${b.join('')}</div>`:'';
}
function topicHtml(e,{steps=false,opener=true}={}){
  let h=(opener&&Math.random()<.4?rnd(V.open)+'<br>':'')+`<b>${e.title}</b><br>${e.a}`;
  if(e.steps&&steps)h+=`<ol>${e.steps.map(s=>`<li>${s}</li>`).join('')}</ol>`;
  return h+topicActions(e,{showSteps:steps});
}
function saveHist(){try{localStorage.setItem(PSKEY,JSON.stringify(PS.hist.slice(-40)))}catch(e){}}
function renderMsg(m){
  const box=$('pmsgs');if(!box)return null;
  const d=document.createElement('div');d.className='pm '+m.r;
  d.innerHTML=m.r==='p'?`<span class="t3-catimg pav"></span><div class="pbody">${m.h}</div>`:esc(m.h);
  box.appendChild(d);box.scrollTop=box.scrollHeight;return d;
}
function addMsg(r,h,save=true){const m={r,h};PS.hist.push(m);if(save)saveHist();renderMsg(m)}
async function pReply(h,{m='smug',delay=true}={}){
  if(delay){PS.typing=true;const t=renderMsg({r:'p',h:'<span class="typing"><i></i><i></i><i></i></span>'});mood(m);await sleep(380+Math.random()*520);t&&t.remove();PS.typing=false}
  addMsg('p',h);
}

/* ---------- revisão da ficha ---------- */
function reviewSheet(){
  const d=data,bad=[],ok=[],st=stageStats(),free=!!d.freeMode,left=free?0:attrPointsLeft(),used=(d.extraSkills||[]).length;
  const B=(t,g)=>bad.push({t,g}),O=t=>ok.push(t);
  if(!d.name||/sem nome/i.test(d.name))B('Seu agente ainda não tem <b>nome</b>.',G('overview','#charName'));else O(`Nome: <b>${esc(d.name)}</b>`);
  if(left>0)B(`Sobram <b>${left}</b> ponto(s) de atributo para distribuir.`,G('attributes','#attrPoints'));
  else if(left<0)B(`Você gastou <b>${-left}</b> ponto(s) de atributo além do permitido no Estágio ${d.stage}.`,G('attributes','#attributes'));
  else O('Pontos de atributo: todos distribuídos');
  const over=free?[]:Object.entries(d.attributes||{}).filter(([,v])=>(Number(v)||1)>attrMax()).map(([k])=>k);
  if(over.length)B(`Atributo acima do máximo (${attrMax()}): <b>${over.join(', ')}</b>.`,G('attributes','#attributes'));
  if((d.attributes?.['Destreza']||1)<=1)B('<b>Destreza 1</b> deixa Esquiva, Reflexo e iniciativa péssimos. Pense nisso.',G('attributes','#attributes'));
  if(!d.vocation)B('Você ainda não escolheu uma <b>vocação</b>.',G('vocation','#vocSelect'));else O(`Vocação: <b>${esc(d.vocation)}</b>`);
  if(free)O('Modo Criação Livre: limites de pontos e perícias não se aplicam');
  else if(used<st.extra)B(`Faltam <b>${st.extra-used}</b> perícia(s) extra(s) (você usou ${used} de ${st.extra}).`,G('skills','#extraSkillsLabel'));
  else if(used>st.extra)B(`Você marcou <b>${used-st.extra}</b> perícia(s) extra(s) a mais que o limite (${st.extra}).`,G('skills','#extraSkillsLabel'));
  else O(`Perícias extras: ${used}/${st.extra}`);
  if(d.stage>=3&&!(d.awakened===true||(d.awakened==null&&!!d.track)||d.freeMode))O('Ainda não <b>despertou</b>: segue subindo de Estágio sem Trilha até o ✨ Despertar acontecer na história.');
  else if(d.stage>=3){
    if(!d.archetype)B('Você está no Estágio 3+ e ainda não escolheu <b>arquétipo</b>.',G('track','#archSelect'));
    else if(!d.track)B(`Arquétipo <b>${esc(d.archetype)}</b> escolhido, mas falta a <b>trilha</b>.`,G('track','#trackSelect'));
    else O(`Trilha: <b>${esc(d.track)}</b> (${esc(d.archetype)})`);
  }
  const qw=E.quickWeapons(d);
  if(!qw.length)B('Sem arma pronta: seus ataques serão no <b>soco (1d2)</b>.',G('inventory','#addList'));else O(`Armas prontas: ${qw.map(i=>esc(i.name)).join(', ')}`);
  const di=E.defenseInfo(d);if(di.equip<=0)B('Nenhuma <b>proteção</b> vestida: Defesa 10, sem bloqueio.',G('inventory','#invBody'));else O(`Defesa (DF): <b>${di.DF}</b>`);
  const ci=E.cargaInfo(d);if(ci.level>0)B(`Você está <b>${ci.label}</b> (${ci.carga}/${ci.limit} de carga).`,G('inventory','#invBody'));
  if((d.statuses||[]).length)B(`Estados ativos: ${d.statuses.map(s=>esc(STATUS_BY_ID[s.id]?.name||s.id)).join(', ')}.`,G('states','#stActive'));
  if(d.collapsePending)B('Há um <b>Protocolo de Colapso</b> pendente.',G('mind','#mindBody'));
  const lines=[];
  if(!bad.length)lines.push('Fiz a revisão e, contra todas as minhas expectativas, <b>está tudo em ordem</b>. 🎉');
  else lines.push(`Revisei a ficha. Achei <b>${bad.length}</b> coisa(s) para olhar:`);
  let h=lines[0];
  if(bad.length)h+='<ul class="pbad">'+bad.map(x=>`<li>⚠ ${x.t} ${actBtn('Ver',{t:'go',g:x.g})}</li>`).join('')+'</ul>';
  if(ok.length)h+='<div class="pok">'+ok.map(x=>'✔ '+x).join('<br>')+'</div>';
  return h;
}

/* ---------- tours ---------- */
function showCoach(){
  const c=$('t3Coach'),T=PS.tour;if(!c)return;
  if(!T){c.classList.add('hide');return}
  const tour=TOURS[T.id],s=tour.steps[T.i],n=tour.steps.length;
  c.classList.remove('hide');
  c.innerHTML=`<div class="coach-top"><span class="t3-catimg pav"></span><div class="grow"><small>🧭 ${esc(tour.title)} · passo ${T.i+1} de ${n}</small><b>${esc(s.h)}</b></div><button class="cx" data-pact='${esc(JSON.stringify({t:'tourend'}))}' title="Encerrar">✕</button></div><div class="coach-t">${s.t}</div><div class="coach-bar"><i style="width:${(T.i+1)/n*100}%"></i></div><div class="pacts">${T.i>0?actBtn('◀ Anterior',{t:'tourgo',d:-1}):''}${s.go?actBtn('📍 Me leve',{t:'go',g:s.go}):''}${T.i<n-1?actBtn('Próximo ▶',{t:'tourgo',d:1},true):actBtn('Concluir ✔',{t:'tourend',done:true},true)}${actBtn('💬',{t:'chat'})}</div><label class="coach-auto"><input type="checkbox" id="coachAuto" ${PS.autoGo?'checked':''}> levar automaticamente a cada passo</label>`;
  const a=$('coachAuto');if(a)a.onchange=()=>{PS.autoGo=a.checked};
  if(PS.autoGo&&s.go)goTo(s.go);
}
function startTour(id,i=0){
  if(!TOURS[id])return;PS.tour={id,i};closeChat();showCoach();mood('hype');
  if(T3.isMobile())say('Segue o guia lá em cima. Eu fico de olho. 👀',3500);
}
function endTour(done){PS.tour=null;showCoach();clearSpot();if(done){mood('hype');say(rnd(['Tour concluído! Eu mereço um petisco.','Pronto. Agora é com você. Tente não morrer logo no começo.']),6000)}}

/* ---------- resposta ---------- */
async function respond(q){
  const nq=normP(q),it=intentOf(nq);
  if(!nq)return;
  if(/^(oi|ola|opa|eai|e ai|hey|hello|bom dia|boa tarde|boa noite|miau|salve)\b/.test(nq)&&nq.split(' ').length<=4)return pReply(rnd(V.hello)+quickMenu(),{m:'hype'});
  if(/(obrigad|valeu|brigad|thanks)/.test(nq))return pReply(rnd(V.thanks),{m:'smug'});
  if(/(idiota|burro|inutil|lixo|chato|besta|droga|merda|estupido)/.test(nq))return pReply(rnd(V.rude),{m:'sad'});
  if(/(piada|conta uma|me faz rir|engracado)/.test(nq))return pReply(rnd(V.joke),{m:'hype'});
  if(/(revisar|revisao|conferir|verificar|analisar|checar).*(ficha|personagem)|minha ficha esta (certa|ok|boa)|ficha (esta|ta) certa/.test(nq))return pReply(reviewSheet(),{m:'think'});
  if(/(dica|dicas).*(tela|aba|aqui|agora)|^dica$|me da uma dica/.test(nq))return pReply(tipHtml(),{m:'smug'});
  if(/^(ajuda|help|menu|o que voce faz|o que voce sabe|o que voce pode)/.test(nq))return pReply('Eu explico <b>qualquer mecânica</b>, te levo até a tela certa (é só pedir “me leve até…”), faço um <b>passo a passo</b> da criação da ficha e <b>reviso a sua ficha</b> procurando erros. E ainda faço piada ruim.'+quickMenu(),{m:'hype'});
  const res=search(q),best=res[0];
  if(best&&best.sc>=4){
    const e=best.e;
    if(it.steps&&e.tour){startTourMsg(e);return}
    if(it.go&&e.go&&e.go[0]){
      await pReply(topicHtml(e,{steps:it.steps,opener:false}));
      const ok=goTo(e.go[0]);if(ok){closeIfMobile();mood('hype');say(rnd(V.gone));addMsg('p',rnd(V.gone))}else addMsg('p',rnd(V.nogo));
      return;
    }
    return pReply(topicHtml(e,{steps:it.steps}),{m:'smug'});
  }
  if(best&&best.sc>=1.8){
    const alt=res.slice(0,3).map(x=>actBtn(x.e.title,{t:'topic',id:x.e.id})).join('');
    return pReply(`Hmm, não tenho certeza do que você quis dizer. Será que é um destes?<div class="pacts">${alt}</div>`,{m:'think'});
  }
  if(prefs.aiEndpoint){try{return await askAI(q,res.slice(0,3))}catch(e){console.warn('[Perseus] IA',e);addMsg('p','A IA externa não respondeu (<i>'+esc(e.message||'erro')+'</i>). Vou me virar com o manual.')}}
  return pReply(rnd(V.fallback)+quickMenu(),{m:'sad'});
}
function startTourMsg(e){
  pReply(`${rnd(V.open)}<br>Bora! Eu te guio por <b>${esc(TOURS[e.tour].title)}</b> em ${TOURS[e.tour].steps.length} passos. Vou fechando o chat e destacando cada lugar.${'<div class="pacts">'+actBtn('🧭 Começar agora',{t:'tour',id:e.tour},true)+'</div>'}`,{m:'hype'});
}
function quickMenu(){const ch=(CHIPS[curView()]||CHIPS.home).slice(0,3);return `<div class="pacts">${ch.map(c=>actBtn(c,{t:'ask',q:c})).join('')}</div>`}
function tipHtml(){const v=curView(),tips=TAB_TIPS[v];if(!tips)return 'Nesta tela eu não tenho dica específica. Pergunta o que quiser!';return '💡 <b>Dica da tela:</b> '+rnd(tips)}
async function askAI(q,top){
  const body={question:q,history:PS.hist.slice(-8).map(m=>({role:m.r==='u'?'user':'assistant',text:String(m.h).replace(/<[^>]+>/g,' ')})),context:{view:viewKey(),stage:data.stage,vocation:data.vocation,archetype:data.archetype,track:data.track},knowledge:top.map(x=>({title:x.e.title,text:x.e.a.replace(/<[^>]+>/g,'')})),persona:'Você é o Perseus, um gato azul assistente do Tulpa RPG. Fale em português do Brasil, com sarcasmo leve e expressivo, mas sempre ajudando de verdade com as regras.'};
  PS.typing=true;const t=renderMsg({r:'p',h:'<span class="typing"><i></i><i></i><i></i></span>'});
  try{
    const r=await fetch(prefs.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json();const txt=j.reply||j.answer||j.text;if(!txt)throw new Error('resposta vazia');
    t&&t.remove();PS.typing=false;addMsg('p',esc(txt).replace(/\n/g,'<br>'));mood('smug');
  }catch(e){t&&t.remove();PS.typing=false;throw e}
}

/* ---------- interface ---------- */
function openChat(){
  PS.open=true;$('t3Chat').classList.add('open');$('t3Chat').setAttribute('aria-hidden','false');$('t3Cat').classList.add('hide');$('t3CatBubble').classList.remove('show');
  if(!PS.hist.length){
    const v=curView();
    addMsg('p',rnd(V.hello)+(TAB_TIPS[v]?'<br><br>'+tipHtml():'')+quickMenu());
  }
  refreshChips();setTimeout(()=>{$('pinput').focus({preventScroll:true});$('pmsgs').scrollTop=$('pmsgs').scrollHeight},120);
}
function closeChat(){PS.open=false;const c=$('t3Chat');if(c){c.classList.remove('open');c.setAttribute('aria-hidden','true')}$('t3Cat')?.classList.remove('hide')}
const closeIfMobile=()=>{if(T3.isMobile())closeChat()};
function refreshChips(){const b=$('pchips');if(!b)return;const v=curView(),ch=CHIPS[v]||CHIPS.home;b.innerHTML=[...ch,'Revisar minha ficha','Me dá uma dica'].filter((x,i,a)=>a.indexOf(x)===i).map(c=>actBtn(c,{t:'ask',q:c})).join('')}
async function sendQ(q){q=String(q||'').trim();if(!q)return;addMsg('u',q);$('pinput').value='';await respond(q);refreshChips()}
function handleAct(a){
  if(!a)return;
  if(a.t==='ask')return sendQ(a.q);
  if(a.t==='topic'){const e=K.find(x=>x.id===a.id);if(e)pReply(topicHtml(e,{steps:!!a.steps,opener:false}),{m:'smug'});return}
  if(a.t==='go'){const ok=goTo(a.g);if(ok){closeIfMobile();mood('hype');say(rnd(V.gone),3800)}else{if(PS.open)addMsg('p',rnd(V.nogo));else say(rnd(V.nogo),4200)}return}
  if(a.t==='tour')return startTour(a.id);
  if(a.t==='tourgo'){if(!PS.tour)return;const n=TOURS[PS.tour.id].steps.length;PS.tour.i=Math.max(0,Math.min(n-1,PS.tour.i+a.d));showCoach();return}
  if(a.t==='tourend')return endTour(!!a.done);
  if(a.t==='chat'){openChat();return}
}
function buildUI(){
  document.documentElement.style.setProperty('--perseus',`url("${PERSEUS_IMG}")`);
  const root=document.createElement('div');root.id='t3PerseusRoot';
  root.innerHTML=`<button id="t3Cat" class="t3-cat" aria-label="Abrir o Perseus, o gato assistente" title="Perseus: dúvidas, dicas e guias"><span class="t3-catimg"></span></button><div id="t3CatBubble" class="t3-catbubble"></div>
  <section id="t3Chat" class="t3-chat" role="dialog" aria-label="Conversa com o Perseus" aria-hidden="true">
   <header><span class="t3-catimg sm"></span><div class="grow"><b>Perseus</b><small>gato-assistente · sarcástico por contrato</small></div><button id="pcfg" title="Configurações">⚙</button><button id="pclr" title="Limpar conversa">🧹</button><button id="pcls" title="Fechar">✕</button></header>
   <div id="pcfgbox" class="hide"></div>
   <div id="pmsgs" class="t3-msgs" aria-live="polite"></div>
   <div id="pchips" class="t3-chips2"></div>
   <form id="pform" autocomplete="off"><input id="pinput" placeholder="Pergunte sobre o jogo ou peça “me leve até…”" aria-label="Mensagem para o Perseus"><button class="btn primary">Enviar</button></form>
  </section><aside id="t3Coach" class="hide" aria-live="polite"></aside>`;
  document.body.appendChild(root);
  $('t3Cat').onclick=openChat;$('pcls').onclick=closeChat;
  $('pform').onsubmit=e=>{e.preventDefault();sendQ($('pinput').value)};
  $('pclr').onclick=()=>{if(!confirm('Limpar a conversa com o Perseus?'))return;PS.hist=[];saveHist();$('pmsgs').innerHTML='';addMsg('p','Conversa limpa. Eu não lembro de nada. (Mentira, eu sou um gato: lembro de tudo.)'+quickMenu())};
  $('pcfg').onclick=()=>{const b=$('pcfgbox');b.classList.toggle('hide');if(!b.classList.contains('hide'))renderCfg()};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-pact]');if(!b)return;try{handleAct(JSON.parse(b.getAttribute('data-pact')))}catch(err){console.warn(err)}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&PS.open)closeChat()});
  try{PS.hist=JSON.parse(localStorage.getItem(PSKEY)||'[]')}catch(e){PS.hist=[]}
  PS.hist.forEach(renderMsg);
  applyPerseus();
}
function renderCfg(){
  const b=$('pcfgbox');
  b.innerHTML=`<div class="cfg"><label class="t3-check"><input type="checkbox" id="cfgReact" ${prefs.perseusReacts?'checked':''}> Comentar rolagens e acontecimentos (20 natural, Morrendo...)</label><label class="t3-check"><input type="checkbox" id="cfgAuto" ${PS.autoGo?'checked':''}> Levar automaticamente durante os guias</label><div class="field"><label>Endereço da IA externa (opcional)</label><input id="cfgAI" value="${esc(prefs.aiEndpoint||'')}" placeholder="https://seu-servico/perseus"></div><div class="sub">Sem endereço eu respondo só com o manual. Com endereço, uso a IA quando não souber. Detalhes: pergunte “conectar IA”.</div><div class="pacts"><button class="pbtn pri" id="cfgSave">Salvar</button><button class="pbtn" id="cfgHide">Esconder o Perseus</button></div></div>`;
  $('cfgSave').onclick=()=>{prefs.perseusReacts=$('cfgReact').checked;PS.autoGo=$('cfgAuto').checked;prefs.aiEndpoint=$('cfgAI').value.trim();savePrefs();b.classList.add('hide');toast('Perseus atualizado.')};
  $('cfgHide').onclick=()=>{prefs.perseus=false;savePrefs();closeChat();applyPerseus();toast('Perseus escondido. Reative em ⚙ Aparência.')};
}
function applyPerseus(){const r=$('t3PerseusRoot');if(!r)return;r.classList.toggle('hide',prefs.perseus===false);if(prefs.perseus===false){closeChat();PS.tour=null;showCoach()}}
T3.perseusApply=applyPerseus;
T3.perseus={search,reviewSheet,respond,K,TOURS,goTo,spot,startTour,PS};
function initPerseus(){
  buildUI();
  /* cumprimento discreto na primeira visita */
  let first=true;try{first=!localStorage.getItem(PSKEY+'_seen');localStorage.setItem(PSKEY+'_seen','1')}catch(e){}
  if(first&&prefs.perseus!==false)setTimeout(()=>{mood('hype');say('Oi! Sou o <b>Perseus</b>. Clique em mim se precisar de ajuda (ou de sarcasmo). 🐾',7000)},1800);
}
T3.initPerseus=initPerseus;


