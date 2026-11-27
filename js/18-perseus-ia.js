/* ===== PERSEUS · IA gratuita (Pollinations sem chave, Gemini, Groq) + base local ===== */
if(!prefs.aiProvider)prefs.aiProvider=prefs.aiEndpoint?'custom':'tulpa';
/* a IA do servidor vira o padrão de quem estava no padrão antigo (Pollinations) */
if(!prefs.aiV2){if(prefs.aiProvider==='pollinations')prefs.aiProvider='tulpa';prefs.aiV2=1;try{savePrefs()}catch(e){}}
const AI_LBL={tulpa:'Perseus IA (Gemini, pelo servidor da campanha)',pollinations:'Pollinations (grátis, sem chave)',gemini:'Google Gemini (chave grátis do AI Studio)',groq:'Groq Cloud (chave grátis)',custom:'Endereço próprio',off:'Desligada (só o manual)'};
const AMIGO=['V0ÇÊ$ N@0 3NT3ND3M…','0 M3$TR3… 3L3 $@B3…','0 @M1G0 N@0 P0D3 $3R C0NF1@D0!','V0ÇÊ$ @CH@M QU3 TULP@$ $@0 BR1NQU3D0$?','QU3 R1TU@1$ $@0 T3@TR0? N@0!','0 M3$TR3 0B$3RV@ C@D@ P@$$0 $3U…','V0ÇÊ CH@M@ D3 ‘@M1G0’… 3L3 $0RR1 P0R D3NTR0…','0$ 0B0$ C0M3M 0 $3U T3MP0… @ $U@ M3M0R1@…','3$CUT3M-M3… @NT3$ QU3 0 M3$TR3 CH@M3…','…$3J@ R3@L M3$M0!'];
const amigoOn=()=>{try{return (Number(data.lucidity)||0)<=8||!!data.collapsePending||(data.statuses||[]).some(s=>s.id==='desistente')}catch(e){return false}};
const amigoBit=()=>`<span class="t3-leet">${esc(rnd(AMIGO))}</span>`;
function amigoMood(){const c=$('t3Cat');if(!c)return;const on=amigoOn();c.classList.toggle('t3-amigo',on);if(on)c.classList.add('mood-smug')}
setInterval(()=>{try{amigoMood()}catch(e){}},2500);
{const _say=say;say=function(html,ms){_say(amigoOn()?`${html}<br>${amigoBit()}`:html,ms)}}

/* resumo da ficha e das regras para o system prompt */
function sheetBrief(){
  const d=data,s=dmax(d),m=E.computeMods(d),di=E.defenseInfo(d),ci=E.cargaInfo(d,E.hasEffect(d,'Força do Cotidiano'));
  const attrs=Object.entries(d.attributes||{}).map(([k,v])=>`${k} ${v}`).join(', ');
  const arms=E.quickWeapons(d).map(i=>`${i.name} (${i.w.skill}, ${i.w.dado}, crít ${i.w.critMin}-20)`).join('; ')||'nenhuma (soco 1d2)';
  const tiers=tierSkills(d).map(k=>`${k} ${TIER_LBL[E.skillTier(d,k)]}`).join(', ')||'nenhuma';
  const st=(d.statuses||[]).map(x=>STATUS_BY_ID[x.id]?.name||x.id).join(', ')||'nenhum';
  const tr=(d.traumas||[]).map(t=>TRAUMA_BY_ID[t.id]?.name||t.id).join(', ')||'nenhum';
  const cm=camp3()?.combat,cur=curEntry(),curC=cur&&charById(cur.characterId);
  return [`Personagem aberto: ${d.name||'sem nome'} · Estágio ${d.stage} (${stageName(d.stage)})${d.freeMode?' · Modo Criação Livre':''}`,
    `Vital ${d.vital}/${s.vt}${d.vitalTemp?' (+'+d.vitalTemp+' temporário)':''} · Lucidez ${d.lucidity}/${s.luc} · Essência ${d.essence}/${s.es}`,
    `Atributos: ${attrs}`,`Vocação: ${d.vocation||'nenhuma'} (${d.serviceYears||0} anos) · Arquétipo: ${d.archetype||'—'} · Trilha: ${d.track||'—'}`,
    `Perícias com grau: ${tiers}`,`Estados: ${st} · Traumas: ${tr} · Colapsos ${d.collapseCount||0}, Penalidade ${d.penaltyLevel||0}${d.extase?.on?' · em Êxtase ('+(EXTASE_BY_ID[d.extase.bonus]?.name||'sem bônus')+')':''}`,
    `Defesa DF ${di.DF} · Carga ${ci.carga}/${ci.limit} (${ci.label}) · Armas prontas: ${arms}`,
    m.sources.length?`Modificadores em vigor: ${m.sources.join('; ')}`:'',
    cm?.active?`Combate ativo: rodada ${cm.round}, vez de ${curC?nm(curC):'—'}`:'Sem combate ativo.',
    `Quem pergunta: ${role3()==='master'?'o Mestre':'um jogador'} · Tela: ${viewKey()}`].filter(Boolean).join('\n');
}
const RULES_BRIEF=`REGRAS ESSENCIAIS (Manual Tulpa RPG V1.2):
- Teste: role tantos d20 quanto o atributo e fique com o maior + bônus da perícia. Toda perícia começa em 0; vocação dá +V (+5; 10 anos +10; 40 anos +15); extras +5; Mestre +10 (Estágios 5/7/8); Maestria +15 (Estágio 9); Estágio 10: +1 perícia direto em +10.
- Tabela de Defesa: Defesa Base DB 10; DF = 10 + proteções + Destreza (sem proteção Pesada nem excesso de carga); cobertura parcial +4, pesada +6. Atributos: Vital máximo +CON, Essência máxima +PRE, dano corpo a corpo/arremesso +FOR (DES em armas Leves e Briga ágil), perícias extras INT-1. ATA = ataque; RF = Esquiva (vendo) ou Reflexo (desprevenido). RF < DB e ATA > DB = Acerto Violento (atacante ganha 1 ação). RF > DB e ATA < DB = Retaliação (defensor ganha 1 ação extra; a retaliação não pode ser esquivada). Sem proficiência na proteção, só retalia se RF > DF, senão conta como Defesa Completa. RF ≥ DB: acerta se ATA ≥ RF e ≥ DF. 20 natural sempre acerta. Crítico rola os dados de dano de novo e soma.
- Lucidez 0 = Protocolo de Colapso (1d6): 1º colapso 4–6 Êxtase, 1–3 Penalidade 1 (Lucidez volta a Máx÷2); 2º Máx÷3; 3º Trauma Permanente se Penalidade ≥ 2. Em Êxtase, cada dano de Lucidez pede 1d6 (1–3 perde o Êxtase).
- Combustão Vital: 2 VT por ES faltante (máx. Vigor+2 ES por turno), deixa Estigmas. Última Centelha zera o Vital: +1d20, depois Morrendo.
- Vital 0 = Morrendo: 3 turnos para estabilizar; golpe ≥ metade do Vital máximo finaliza. Sutura Bruta (1 ação, Suprimento, DT 15): 2d6+INT de VT temporário e suspende sangramento. Síntese Cirúrgica (Trégua, Kit, DT 15/18): 2d8+INT+Estágio de Vital; falha dá Infecção.
- Caído: oponente tem vantagem corpo a corpo; levantar custa 1 ação. Alerta: +1 Esquiva/Reflexo até ser atacado.`;
function persona(){return `Você é o Perseus, um gato místico azul (aposentou a gravata): sarcástico, observador e elegante. Você conversa sobre QUALQUER assunto (dúvidas gerais, estudos, ideias, escrita, tecnologia, papo furado) como um ótimo assistente. Você também conhece a fundo o Tulpa RPG, mas NÃO traga o sistema, as regras, a ficha, o personagem nem a campanha para a conversa por conta própria: só fale deles quando a pergunta for sobre o jogo ou quando a pessoa pedir. Em assuntos fora do jogo, responda normalmente, sem comparações nem referências ao Tulpa. Quando o assunto for o jogo, ajude de verdade e não invente regras: se o material de referência não cobrir, diga que é decisão do Mestre. Responda SEMPRE em português do Brasil, de forma curta (até ~150 palavras, salvo se pedirem mais), com humor leve. Use **negrito** para termos importantes e listas curtas quando ajudar.${amigoOn()?'\nATENÇÃO: a mente do personagem está estilhaçada (Lucidez muito baixa ou Colapso). Intercale 1 ou 2 frases curtas e enigmáticas em leetspeak, como se "O Amigo" falasse através de você (ex.: "V0ÇÊ$ N@0 3NT3ND3M…", "0 M3$TR3 0B$3RV@ C@D@ P@$$0 $3U…", "0 @M1G0 $0RR1 P0R D3NTR0…"), e depois volte a responder normalmente.':''}`}
const GAME_RX=/tulpa|ficha|pericia|atribut|vital|lucidez|essencia|ritual|talento|trilha|vocac|arquetip|combate|turno|rodada|dano|ataque|atacar|defesa|esquiv|reflexo|rola|dado|d20|mestre|campanha|personagem|npc|inimig|trauma|colapso|extase|estagio|teosofia|item|itens|arma|protec|inventario|regra|manual|sistema|iniciativa|morrendo|estado|estigma|combustao|sutura|retalia|invoca|municao|rpg|interpreta|sessao|jogador|sangr|atordo|paralis|caido|envenen|exaust|briga|pontaria|furtiv/;
/* o assunto é o jogo? (pergunta atual, as 2 anteriores do usuário, ou um trecho do manual bem relacionado) */
let GAME_NAMES=null;
function gameNames(){
  if(GAME_NAMES)return GAME_NAMES;const out=new Set(),add=n=>{n=normP(n||'');if(n.length>=6)out.add(n)};
  try{vocations.forEach(v=>(v.talents||[]).forEach(t=>add(t.name)));tracks.forEach(t=>{add(t.name);(t.stages||[]).forEach(x=>add(x.name))});
    RITUALS.forEach(r=>add(r.name));Object.values(STATUS_BY_ID).forEach(x=>add(x.name));WEAPONS.forEach(w=>add(w.name));PROTECTIONS.forEach(x=>add(x.name))}catch(e){}
  return GAME_NAMES=[...out];
}
function gameTopic(q){
  const prev=PS.hist.filter(m=>m.r==='u').slice(-3).map(m=>String(m.h).replace(/<[^>]+>/g,' '));
  const names=gameNames();
  return [q,...prev].some(t=>{t=normP(t);return GAME_RX.test(t)||names.some(n=>t.includes(n))});
}
function aiMessages(q,top){
  const game=gameTopic(q);
  const kbTxt=game?top.slice(0,3).map(x=>`• ${x.e.title}: ${String(x.e.a).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,600)}`).join('\n'):'';
  const sys=game?`${persona()}\n\nMATERIAL DE REFERÊNCIA DO JOGO (use somente no que a pergunta pedir):\n${RULES_BRIEF}\n\nFICHA EM TEMPO REAL:\n${sheetBrief()}${kbTxt?'\n\nTRECHOS DO MANUAL RELACIONADOS:\n'+kbTxt:''}`:persona();
  const hist=PS.hist.slice(-9,-1).map(m=>({role:m.r==='u'?'user':'assistant',content:String(m.h).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,700)}));
  return{sys,msgs:[...hist,{role:'user',content:q}],game};
}
async function fetchT(url,opt,ms=28000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{return await fetch(url,{...opt,signal:c.signal})}finally{clearTimeout(t)}}
async function callAI(q,top){
  const P=prefs.aiProvider||'tulpa',{sys,msgs,game}=aiMessages(q,top);
  PS.aiVia=null;PS.aiSrvErr=null;
  if(P==='tulpa'){
    /* IA do servidor (Edge Function perseus-ai): a chave fica guardada no Supabase, nunca no site */
    try{
      const c=sb();if(!c)throw new Error('sem conexão com o servidor');
      const {data:{session}}=await c.auth.getSession();if(!session)throw new Error('entre na sua conta para usar a IA do servidor');
      const res=await Promise.race([c.functions.invoke('perseus-ai',{body:{system:sys,messages:msgs}}),new Promise((_,rj)=>setTimeout(()=>rj(new Error('tempo esgotado')),40000))]);
      if(res.error){let m=res.error.message||'erro';try{const b=await res.error.context.json();if(b&&b.error)m=b.error}catch(e){}throw new Error(m)}
      const t=String(res.data?.reply||'').trim();if(!t)throw new Error('resposta vazia');
      PS.aiVia='Gemini'+(res.data.model?' · '+res.data.model:'');return t;
    }catch(e){console.warn('[Perseus] IA do servidor',e);PS.aiSrvErr=e.message||'erro';PS.aiVia='Pollinations (reserva)'}
  }
  if(P==='gemini'){
    if(!prefs.geminiKey)throw new Error('cole a chave do Gemini nas configurações');
    let err='Gemini sem resposta';
    for(const m of ['gemini-3.8-flash','gemini-3.5-flash-lite']){
      const r=await fetchT('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':prefs.geminiKey},body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:msgs.map(x=>({role:x.role==='assistant'?'model':'user',parts:[{text:x.content}]})),generationConfig:{temperature:.8,maxOutputTokens:2048}})});
      if(!r.ok){err='Gemini HTTP '+r.status;continue}const j=await r.json();
      const t=(j.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim();if(t){PS.aiVia='Gemini · '+m;return t}
    }
    throw new Error(err);
  }
  if(P==='groq'){
    if(!prefs.groqKey)throw new Error('cole a chave da Groq nas configurações');
    let err='Groq sem resposta';
    for(const m of ['openai/gpt-oss-120b','llama-3.3-70b-versatile']){
      const r=await fetchT('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+prefs.groqKey},body:JSON.stringify({model:m,messages:[{role:'system',content:sys},...msgs],temperature:.8,max_tokens:1200})});
      if(!r.ok){err='Groq HTTP '+r.status;continue}const j=await r.json();const t=j.choices?.[0]?.message?.content?.trim();if(t){PS.aiVia='Groq · '+m;return t}
    }
    throw new Error(err);
  }
  if(P==='custom'){
    if(!prefs.aiEndpoint)throw new Error('informe o endereço da IA');
    const r=await fetchT(prefs.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,system:sys,messages:msgs})});
    if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();const t=j.reply||j.answer||j.text||j.choices?.[0]?.message?.content;if(!t)throw new Error('resposta vazia');return t;
  }
  /* Pollinations: formato OpenAI; se falhar, o endpoint de texto simples; por fim, GET com o prompt na URL */
  const all=[{role:'system',content:sys},...msgs];
  try{
    const r=await fetchT('https://text.pollinations.ai/openai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:all,private:true,referrer:'tulpa-rpg'})});
    if(r.ok){const j=await r.json();const t=j.choices?.[0]?.message?.content?.trim();if(t)return t}
  }catch(e){if(e.name==='AbortError')throw new Error('tempo esgotado')}
  try{
    const r=await fetchT('https://text.pollinations.ai/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:all,private:true,referrer:'tulpa-rpg'})});
    if(r.ok){const t=(await r.text()).trim();if(t&&!/^\s*[{<]/.test(t))return t}
  }catch(e){}
  const short=(persona().slice(0,600)+(game?'\n'+sheetBrief().slice(0,700):'')+'\nPergunta: '+q).slice(0,1700);
  const r=await fetchT('https://text.pollinations.ai/'+encodeURIComponent(short)+'?model=openai&private=true',{method:'GET'});
  if(!r.ok)throw new Error('Pollinations HTTP '+r.status);const t=(await r.text()).trim();if(!t)throw new Error('resposta vazia');return t;
}
const mdLite=t=>esc(String(t||'').replace(/\r/g,'')).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|\n)\s*[-•*]\s+/g,'$1• ').replace(/\n/g,'<br>');
async function aiReply(q,top,{prefix=''}={}){
  PS.typing=true;const t=renderMsg({r:'p',h:'<span class="typing"><i></i><i></i><i></i></span>'});mood('smug');
  try{
    const txt=await callAI(q,top);t&&t.remove();PS.typing=false;
    const best=top[0]&&top[0].sc>=4&&gameTopic(q)?top[0].e:null;
    addMsg('p',prefix+mdLite(txt)+(best?topicActions(best):'')+`<div class="pai">✦ ${esc(PS.aiVia||AI_LBL[prefs.aiProvider]||'IA')}</div>`);
    return true;
  }catch(e){t&&t.remove();PS.typing=false;console.warn('[Perseus] IA',e);PS.aiFail=(PS.aiFail||0)+1;return e}
}

/* ações rápidas (funcionam também sem internet) */
function turnAdvice(){
  const d=data,m=E.computeMods(d),cm=camp3()?.combat,cur=curEntry(),me=charById(activeCharacterId);
  const tips=[];
  if(!cm?.active)tips.push('Não há combate ativo agora. Fora do combate: investigue, converse, use perícias. Se a coisa apertar, o Mestre inicia o combate e todos rolam <b>Reflexo</b> para a iniciativa.');
  else if(!cur||cur.characterId!==activeCharacterId)tips.push(`Ainda não é a sua vez${cur?` (vez de <b>${esc(nm(charById(cur.characterId)))}</b>)`:''}. Enquanto espera: pense na reação se for atacado — <b>Esquiva</b> se estiver vendo, <b>Reflexo</b> se pego desprevenido.`);
  else tips.push('<b>É a sua vez!</b> Você tem 1 ação padrão e pode usar 1 talento sem gastar a ação.');
  if(m.flags.has('semAgir'))tips.push('Seu estado atual <b>impede de agir</b>. Aguarde ou peça ajuda a um aliado.');
  if(stIds(d).includes('caido'))tips.push('Você está <b>Caído</b>: inimigos têm vantagem corpo a corpo. Gaste 1 ação em <b>⬆ Levantar</b>.');
  const dying=chars3().filter(c=>inScene(c)&&isDyingCh(c));if(dying.length)tips.push(`☠ ${dying.map(c=>esc(nm(c))).join(', ')} está Morrendo: <b>Sutura Bruta</b> (1 ação, Suprimento de Emergência) pode salvar.`);
  if((Number(d.vital)||0)<=dmax(d).vt/3)tips.push('Vital baixo: considere <b>Alerta</b> (+1 Esquiva/Reflexo) ou recuar.');
  const qw=E.quickWeapons(d);tips.push(qw.length?`Ataque pronto: <b>${esc(qw[0].name)}</b> (${esc(qw[0].w.skill)}, ${esc(qw[0].w.dado)}).`:'Sem arma pronta: equipe uma no Inventário ou ataque no soco (1d2).');
  const ab=listAbilities().filter(a=>(Number(a.item.cost)||0)<=(Number(d.essence)||0));if(ab.length)tips.push(`Talentos que cabem na sua Essência (${d.essence} ES): ${ab.slice(0,4).map(a=>esc(a.item.name)+' ('+a.item.cost+')').join(', ')}.`);
  if((d.summons||[]).length)tips.push(`Sua invocação (${d.summons.map(x=>esc(x.name)).join(', ')}) pode atacar uma vez por turno sem gastar a sua ação.`);
  return '🐾 <b>O que fazer no seu turno</b><ul class="pbad">'+tips.map(t=>`<li>${t}</li>`).join('')+'</ul>';
}
function rpIdeas(){
  const d=data,out=[];
  (d.statuses||[]).forEach(s=>{const def=STATUS_BY_ID[s.id];if(def)out.push(`<b>${esc(def.name)}:</b> “${esc(def.narr)}” Descreva como isso aparece: a respiração, o olhar, o que o personagem evita tocar.`)});
  (d.traumas||[]).forEach(t=>{const def=TRAUMA_BY_ID[t.id];if(def)out.push(`<b>Trauma · ${esc(def.name)}:</b> ${esc(def.text)} Um gatilho na cena (um som, um cheiro, uma frase) pode trazer a memória de volta: ${esc((t.text||'').slice(0,120))}${(t.text||'').length>120?'…':''}`)});
  if(d.extase?.on)out.push('<b>Êxtase:</b> a mente brilha alto demais. Fale rápido, ria na hora errada, veja padrões onde não há.');
  if(!out.length)out.push('Sem estados nem traumas agora. Aproveite para mostrar um hábito pequeno do personagem: um tique, uma superstição, a forma como guarda a arma.');
  return '🎭 <b>Ideias de interpretação</b><ul class="pbad">'+out.map(x=>`<li>${x}</li>`).join('')+'</ul>';
}
function quickNpc(){
  const NOMES=['Vulto da Estação','Doutora Marta Lins','O Homem do Guarda-chuva','Cão de Ferro','Irmã Celeste','Rato de Arquivo','Eco Sem Rosto','Caçador de Fitas'];
  const st=Math.max(1,Math.min(10,(Number(data.stage)||1)+E.die(3)-2)),S=STAGES[st];
  const at=Object.fromEntries(ATTRS.map(a=>[a,1+Math.floor(E.rng()*Math.min(4,1+st/2))]));
  const w=rnd(WEAPONS.filter(x=>x.cat!=='Especial')),p=rnd(PROTECTIONS.filter(x=>x.def<=Math.min(6,1+st)));
  const npc={name:rnd(NOMES),stage:st,vt:S.vt+(at['Constituição']||1),es:S.es+(at['Presença']||1),at,w,p};
  T3.lastNpc=npc;
  return {npc,html:`👹 <b>${esc(npc.name)}</b> · Estágio ${st}<br>VT ${npc.vt} · ES ${npc.es} · DF ${10+p.def+(p.peso==='Pesado'&&p.def>0?0:at['Destreza']||1)} (${esc(p.name)})<br>${Object.entries(at).map(([k,v])=>`${k.slice(0,3)} ${v}`).join(' · ')}<br>Arma: <b>${esc(w.name)}</b> (${esc(w.skill)}, ${esc(w.dado)}, crít ${w.critMin}-20)<div class="sub">Crie como personagem do Mestre na Visão de Mesa e use o 🙈 para esconder os status, se for um chefe.</div>`};
}
const QUICK=['Analisar minha ficha','O que fazer no meu turno?','Explicar Defesa e Retaliação','Sugerir RP para meu Trauma/Estado','Gerar NPC/Inimigo rápido'];
const aiOn=()=>(prefs.aiProvider||'tulpa')!=='off';
{const _respond=respond;
 respond=async function(q){
  const nq=normP(q);if(!nq)return;
  if(/analisar minha ficha|^revis/.test(nq)){await pReply(reviewSheet(),{m:'think'});if(aiOn())await aiReply('Analise a minha ficha: aponte em até 5 itens curtos os pontos fortes, fracos e uma sugestão de evolução para o próximo estágio.',search('ficha atributos pericias'));return}
  if(/o que fazer no meu turno/.test(nq)){await pReply(turnAdvice(),{m:'smug'});return}
  if(/explicar defesa e retaliacao/.test(nq)){const r=search('defesa retaliacao tabela de defesa');if(aiOn()){const ok=await aiReply('Explique a Tabela de Defesa, Acerto Violento e Retaliação com um exemplo usando a minha ficha.',r);if(ok===true)return}return _respond('tabela de defesa retaliacao')}
  if(/sugerir rp/.test(nq)){await pReply(rpIdeas(),{m:'smug'});if(aiOn())await aiReply('Sugira 3 falas ou atitudes curtas de interpretação para os meus estados e traumas atuais, no tom de horror investigativo.',[]);return}
  if(/gerar npc|inimigo rapido/.test(nq)){if(role3()&&role3()!=='master'){return pReply('Gerar inimigos é trabalho do Mestre. Eu não vou entregar o roteiro, humano. 😼',{m:'smug'})}const g=quickNpc();await pReply(g.html,{m:'hype'});if(aiOn())await aiReply(`Escreva em 3 linhas a aparência, a motivação e um comportamento em combate deste NPC: ${g.npc.name}, Estágio ${g.npc.stage}, arma ${g.npc.w.name}.`,[]);return}
  /* comandos de navegação, guias e conversa curta continuam locais e instantâneos */
  const it=intentOf(nq),res=search(q),best=res[0];
  const local=it.go||it.steps||/^(oi|ola|opa|eai|e ai|hey|bom dia|boa tarde|boa noite|miau|salve)\b/.test(nq)&&nq.split(' ').length<=4||/^(ajuda|help|menu)$/.test(nq)||/(piada|dica)/.test(nq);
  if(local||!aiOn()){await _respond(q);if(amigoOn()&&Math.random()<.6)addMsg('p',amigoBit());return}
  const ok=await aiReply(q,res);
  if(ok===true)return;
  if(!gameTopic(q)){addMsg('p',`A IA não respondeu agora (<i>${esc(ok?.message||'erro')}</i>). Sem ela eu só sei falar do Tulpa RPG. Tenta de novo daqui a pouco, humano.`);return}
  if(PS.aiFail===1||PS.aiFail%5===0)addMsg('p',`A IA (${esc(AI_LBL[prefs.aiProvider])}) não respondeu: <i>${esc(ok?.message||'erro')}</i>. Respondo pelo manual mesmo.`);
  await _respond(q);
 };
 T3.perseus.respond=respond;}
refreshChips=function(){const b=$('pchips');if(!b)return;const v=curView(),ch=CHIPS[v]||CHIPS.home;const q=QUICK.filter(x=>x!=='Gerar NPC/Inimigo rápido'||role3()==='master'||!role3());
  b.innerHTML=[...q,...ch,'Me dá uma dica'].filter((x,i,a)=>a.indexOf(x)===i).map((c,i)=>actBtn(c,{t:'ask',q:c},i<q.length)).join('')};
renderCfg=function(){
  const b=$('pcfgbox'),P=prefs.aiProvider||'tulpa';
  b.innerHTML=`<div class="cfg"><div class="field"><label>Cérebro do Perseus (IA)</label><select id="cfgProv">${Object.entries(AI_LBL).map(([k,l])=>`<option value="${k}" ${P===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="sub cfg-k" data-k="tulpa">A melhor opção: usa o Gemini pelo servidor da campanha, sem chave no seu aparelho (precisa estar com a conta conectada). Se o servidor não responder, uso a Pollinations como reserva.</div>
  <div class="field cfg-k" data-k="gemini"><label>Chave do Gemini</label><input id="cfgGem" type="password" value="${esc(prefs.geminiKey||'')}" placeholder="AIza..."><span class="sub">Grátis em aistudio.google.com › Get API key.</span></div>
  <div class="field cfg-k" data-k="groq"><label>Chave da Groq</label><input id="cfgGroq" type="password" value="${esc(prefs.groqKey||'')}" placeholder="gsk_..."><span class="sub">Grátis em console.groq.com › API Keys.</span></div>
  <div class="field cfg-k" data-k="custom"><label>Endereço da IA</label><input id="cfgAI" value="${esc(prefs.aiEndpoint||'')}" placeholder="https://seu-servico/perseus"></div>
  <div class="sub">Com IA ligada, a sua pergunta e um resumo da ficha aberta vão para o serviço escolhido. As chaves ficam só neste navegador. Sem internet ou se a IA falhar, eu respondo com o manual.</div>
  <label class="t3-check"><input type="checkbox" id="cfgReact" ${prefs.perseusReacts?'checked':''}> Comentar rolagens e acontecimentos</label><label class="t3-check"><input type="checkbox" id="cfgAuto" ${PS.autoGo?'checked':''}> Levar automaticamente durante os guias</label><label class="t3-check"><input type="checkbox" id="cfgGif" ${prefs.perseusGifs!==false?'checked':''}> Reações animadas do Perseus (GIFs)</label>
  <div class="pacts"><button class="pbtn pri" id="cfgSave">Salvar</button><button class="pbtn" id="cfgTest">Testar IA</button><button class="pbtn" id="cfgHide">Esconder o Perseus</button></div></div>`;
  const sync=()=>{const v=$('cfgProv').value;$$('.cfg-k',b).forEach(e=>e.style.display=e.dataset.k===v?'':'none')};$('cfgProv').onchange=sync;sync();
  const store=()=>{prefs.aiProvider=$('cfgProv').value;prefs.geminiKey=$('cfgGem').value.trim();prefs.groqKey=$('cfgGroq').value.trim();prefs.aiEndpoint=$('cfgAI').value.trim();prefs.perseusReacts=$('cfgReact').checked;PS.autoGo=$('cfgAuto').checked;if($('cfgGif'))prefs.perseusGifs=$('cfgGif').checked;savePrefs()};
  $('cfgSave').onclick=()=>{store();b.classList.add('hide');toast('Perseus atualizado: '+AI_LBL[prefs.aiProvider]+'.')};
  $('cfgTest').onclick=async()=>{store();b.classList.add('hide');if(!aiOn()){addMsg('p','IA desligada: estou só com o manual.');return}addMsg('u','(teste da IA)');const ok=await aiReply('Diga oi em uma frase e confirme que está me ouvindo.',[]);if(ok===true&&PS.aiSrvErr)addMsg('p',`⚠ A IA do servidor não respondeu (<i>${esc(PS.aiSrvErr)}</i>). Quem respondeu foi a reserva (Pollinations).`);if(ok!==true)addMsg('p',`❌ ${esc(AI_LBL[prefs.aiProvider])} não respondeu: <i>${esc(ok?.message||'erro')}</i>.`)};
  $('cfgHide').onclick=()=>{prefs.perseus=false;savePrefs();closeChat();applyPerseus();toast('Perseus escondido. Reative em ⚙ Aparência.')};
};

/* ---------- Perseus: conhecimento das novidades ---------- */
[['graus-pericia','Graus de perícia: +5, Mestre +10 e Maestria +15',['mestre +10','maestria','+15','pericia +10','subir pericia','grau de pericia','pericia mestre','todas pericias +1','pericia comeca em 1'],'Toda perícia começa em <b>+1</b> (Teosofia em 0). As escolhas extras dão <b>+5</b>. No <b>Estágio 5</b> uma perícia +5 vira <b>Mestre +10</b>; no 7 mais duas; no 8 mais uma (total 4). No <b>Estágio 9</b> uma +10 vira <b>Maestria +15</b>. No <b>Estágio 10</b>, +1 perícia sobe direto para +10. Na aba Perícias use ▲ e ▼.',G('skills','#extraSkillList')],
 ['modo-livre','Modo Criação Livre (“Seu Personagem Teria”)',['modo livre','criacao livre','seu personagem teria','sem limite','liberdade total'],'Na <b>Visão Geral</b>, ligue o <b>Modo Criação Livre</b>: atributos sem limite de pontos, quantas perícias +5/+10/+15 quiser e qualquer Arquétipo/Trilha em qualquer estágio. Combine com o Mestre e mantenha a lógica de um ser humano.',G('overview','#ovFree')],
 ['proficiencia','Proficiência em proteções',['proficiencia','proficiente','defesa completa','sem proficiencia'],'Sem proficiência na proteção vestida, a <b>Retaliação</b> só acontece se a sua Esquiva/Reflexo superar a sua <b>DF</b>; senão conta como <b>Defesa Completa</b> (bloqueia, sem ação extra). Lutadores, Militares e Seguranças são proficientes. Os outros marcam “tenho proficiência” no item vestido do Inventário.',G('inventory','#invBody')],
 ['reacoes','Reações na defesa (Desvio, Brecha, Duplica, Intervenção)',['reacao','reacoes','desvio improvavel','brecha rapida','duplica efemera','intervencao divina'],'Quando você é atacado, o pop-up de defesa mostra as <b>reações</b> que você pode pagar: <b>Desvio Improvável</b> (o atacante repete o ataque se acertar), <b>Brecha Rápida</b> (teleporta e nega o golpe), <b>Duplica Efêmera</b> (1d2: o golpe pode pegar a ilusão) e <b>Intervenção Divina Menor</b> (reduz o dano em 2d6). Cada uma custa 5 ES.'],
 ['invocacoes','Invocações e Tulpas no combate',['invocacao','invocar','fragmento sombrio','lacaio','avatar do abismo','tulpa no combate','criatura aliada'],'Ao usar <b>Fragmento Sombrio</b>, <b>Lacaio da Inexistência</b> ou <b>Avatar do Abismo</b>, eu ofereço criar o card da criatura. Ela ataca 1× por turno sem gastar a sua ação, tem VT próprio (botões −VT/+VT) e some quando as rodadas acabam. Para uma Tulpa qualquer, use <b>🜏 Invocação</b> no painel de combate.',G(null)],
 ['municao','Munição e Arma Favorita',['municao','recarga','recarregar','arma favorita','devastador mental','espada do pensamento'],'Armas de disparo podem <b>controlar munição</b> (marque no Inventário): cada ataque gasta 1 “Munição solta”. No <b>Arsenal Mental</b> e na <b>Lâmina Psíquica</b>, marque a <b>★ Arma Favorita</b>: no Estágio 10 ela ganha +1 dado de dano e +2 na margem de ameaça.',G('inventory','#invBody')],
 ['caido-sonolento','Caído, Sonolento e estados de 1d4',['caido','levantar','sonolento','adormecer','1d4 turnos','duracao do estado'],'<b>Caído</b>: o atacante corpo a corpo ganha vantagem; no seu turno use <b>⬆ Levantar</b> (1 ação). <b>Sonolento</b>: marque cada falha em Concentração no contador (0/3); na 3ª você adormece (Paralisado). Estados de talentos como Briga Tremenda duram <b>1d4 turnos</b>, rolados na hora e descontados sozinhos.',G('states','#stActive')],
 ['ia-perseus','Como ligar a IA do Perseus',['conectar ia','ia do perseus','gemini','groq','pollinations','chave de api','inteligencia artificial'],'Clique em ⚙ no chat. O padrão é a <b>Pollinations</b>, grátis e sem chave. Para respostas melhores, cole uma chave grátis do <b>Gemini</b> (aistudio.google.com) ou da <b>Groq</b> (console.groq.com). Sem internet, eu respondo pelo manual.']
].forEach(([id,title,kws,a,go])=>{if(K.some(x=>x.id===id))return;const e={id,title,kws,a,...(go&&go.tab?{go:[go]}:{})};e.nk=kws.map(normP);e.nt=normP(title).split(' ').filter(w=>!STOP.has(w)&&w.length>2);K.push(e)});


