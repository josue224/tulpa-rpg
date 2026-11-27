/* ==========================================================================
   TULPA RPG — Onda 4 · Ações das especializações (ficha)
   Fôlego (apneia e Exaustão), Varredura de Cena, Segurança (trancas e
   armadilhas, rolagem silenciosa), Condução (checagem de treino), Perícia
   Forense (autópsia), Cirurgia e Psiquiatria. Painel "Ações das
   especializações" dentro da aba Especializações.
   Nenhum número mora aqui: tudo vem do motor (E.*, js/10) e dos efeitos
   das vertentes (js/09b, editáveis pela central ⚙️). Carrega ANTES do 61.
   IIFE: só publica T3.vta60n.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__vta60n)return;
  window.__vta60n=true;

  var V={apn:{on:false,end:0,total:0,left:0},sig:'',pick:{},ctx:{},silent:true,aut:{}};
  var f=function(v){return String(v).replace('.',',')};
  var plus=function(n){return (n>=0?'+':'−')+Math.abs(n)};
  var norm=function(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};

  function canSheet(){
    if(!window.tulpaCloudUser)return true;
    var ch=charById(activeCharacterId);
    return !ch||canEdit(ch);
  }
  var trained=function(id){return E.vertGrade(data,id)>0};
  var def=function(id){return E.vert(id)};
  var ctxLabel=function(q){var t=E.quandoLabel(q);return t.charAt(0).toUpperCase()+t.slice(1)};

  /* ---------- rolagem pela ficha, com a especialização escolhida ---------- */
  function rollV(id,o){
    o=o||{};
    var d=def(id);if(!d)return null;
    var vc=E.vertCalc(data,id,{vocList:vocations,attr:o.attr});
    if(vc.status==='bloqueado'){toast('Essa especialização exige treino específico: o generalista não vale aqui.');return null}
    var extra=o.quando&&vc.status==='treinado'?E.contextDice(data,id,o.quando):0;
    return rollSkill(vc.skill,vc.attr,{vert:id,extraDice:extra,silent:!!o.silent,
      label:vc.skill+' · '+d.name+(o.nome?' · '+o.nome:'')+(vc.status==='generalista'?' (generalista ÷'+E.regra('generalistaDiv')+')':'')});
  }

  /* ---------- Fôlego: apneia e Exaustão ---------- */
  var apnTimer=null;
  function apnText(){
    var a=V.apn;if(!a.on)return a.left===-1?'Sem fôlego! Faça um teste de Resistência (Vigor Físico).':'';
    var s=Math.max(0,Math.ceil((a.end-Date.now())/1000)),rs=E.regra('rodadaSeg'),r=Math.ceil(s/rs);
    return 'Restam '+s+' s ('+r+(r===1?' rodada':' rodadas')+')';
  }
  function apnTick(){
    var a=V.apn,el=document.querySelector('[data-apn-t]');
    if(a.on&&Date.now()>=a.end){
      a.on=false;a.left=-1;clearInterval(apnTimer);apnTimer=null;
      try{toast('Sem fôlego! Faça um teste de Resistência (Vigor Físico).')}catch(e){}
      V.sig='';paint();return;
    }
    if(el)el.textContent=apnText();
  }
  function apnStart(){
    var a=E.apneia(data);
    V.apn={on:true,end:Date.now()+a.seg*1000,total:a.seg,left:0};
    clearInterval(apnTimer);apnTimer=setInterval(apnTick,250);V.sig='';paint();
  }
  function apnStop(){V.apn={on:false,end:0,total:0,left:0};clearInterval(apnTimer);apnTimer=null;V.sig='';paint()}
  function cardFolego(){
    var id='atletismo.folego',d=def(id);if(!d||!trained(id))return '';
    var a=E.apneia(data),fx=E.exhaustionFactor(data),exh=(data.statuses||[]).some(function(s){return s.id==='exausto'});
    var base='('+E.regra('apneiaBase')+' + '+(E.regra('apneiaPorCon')===1?'':f(E.regra('apneiaPorCon'))+' × ')+'CON '+E.attr(data,'Constituição')+')';
    var ex=fx<1?'Penalidades de Exaustão: × '+f(fx)+(exh?' · você está <b>Exausto</b>: a penalidade física caiu de −1 para −'+Math.floor(1*fx)+'.':' (vale quando ficar Exausto ou Sobrecarregado).'):'Sem redução de Exaustão nesta campanha.';
    return '<article class="vta-card" data-tool="folego"><header><h4>'+esc(d.name)+'</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      '<p class="vta-line"><b>Apneia: '+a.rodadas+(a.rodadas===1?' rodada':' rodadas')+'</b> (≈ '+a.seg+' s) · '+base+(a.mult!==1?' × '+f(a.mult)+' do Fôlego':'')+'</p>'+
      '<p class="vta-line">'+ex+'</p>'+
      '<p class="vta-time" data-apn-t aria-live="polite">'+esc(apnText())+'</p>'+
      '<div class="vta-act">'+(V.apn.on?'<button type="button" class="btn" data-vta="apn-stop">Parar cronômetro</button>':'<button type="button" class="btn primary" data-vta="apn-start"'+(canSheet()?'':' disabled')+'>Cronômetro de apneia</button>')+
      '<button type="button" class="btn" data-vta="roll" data-v="resistencia.vigor" data-q="resistirFisico">Rolar Vigor Físico</button></div></article>';
  }

  /* ---------- Varredura de Cena ---------- */
  function cardVarredura(){
    var id='investigacao.varredura',d=def(id);if(!d||!trained(id))return '';
    var min=V.pick.search!=null?V.pick.search:10,t=E.searchTime(data,min);
    return '<article class="vta-card" data-tool="varredura"><header><h4>'+esc(d.name)+'</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      '<div class="vta-row"><label class="field vta-f"><span class="field-label">Tempo normal da busca (min)</span><input type="number" min="0" max="999" step="1" value="'+min+'" data-vta-in="search" inputmode="numeric"></label>'+
      '<p class="vta-big" aria-live="polite"><b>'+t.min+' min</b><span>× '+f(t.mult)+' com Varredura</span></p></div>'+
      '<div class="vta-act"><button type="button" class="btn primary" data-vta="roll" data-v="'+id+'">Rolar Varredura</button></div></article>';
  }

  /* ---------- Segurança: trancas, sistemas e armadilhas (rolagem silenciosa) ---------- */
  var SEG_BASE={'seguranca.arrombamento':'Abrir tranca comum','seguranca.eletronica':'Invadir ou sabotar sistema'};
  function ctxButtons(id,baseLabel,silentOn){
    var list=E.contextList(data,id),h='';
    var sil=silentOn?' data-silent="1"':'';
    h+='<button type="button" class="btn primary" data-vta="roll" data-v="'+id+'"'+sil+(canSheet()?'':' disabled')+'>'+esc(baseLabel)+'</button>';
    list.forEach(function(q){
      var n=E.contextDice(data,id,q);
      h+='<button type="button" class="btn" data-vta="roll" data-v="'+id+'" data-q="'+esc(q)+'"'+sil+(canSheet()?'':' disabled')+'>'+esc(ctxLabel(q))+' <b>+'+n+'d20</b></button>';
    });
    return h;
  }
  function cardSeguranca(){
    var ids=['seguranca.arrombamento','seguranca.eletronica'].filter(function(i){return def(i)&&trained(i)});
    if(!ids.length)return '';
    var anySilent=ids.some(function(i){return E.silentVert(data,i)});
    return '<article class="vta-card" data-tool="seguranca"><header><h4>Segurança: trancas, sistemas e armadilhas</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      (anySilent?'<label class="t3-check vta-silent"><input type="checkbox" data-vta-in="silent"'+(V.silent?' checked':'')+'> Rolagem silenciosa: não avisa a mesa nem entra no histórico (trancas e sistemas sem alarme)</label>':'')+
      ids.map(function(i){
        var sil=E.silentVert(data,i)&&V.silent;
        return '<div class="vta-sub"><h5>'+esc(def(i).name)+'</h5><div class="vta-act">'+ctxButtons(i,SEG_BASE[i]||'Rolar',sil)+'</div></div>';
      }).join('')+
      '<p class="sub vta-note">Quem tem a especialização soma o +d20 da situação sozinho ao usar o botão certo. Fortificação e barricadas ficam no menu do token, no mapa.</p></article>';
  }

  /* ---------- Condução: checagem de treino por classe de veículo ---------- */
  function cardConducao(){
    var all=E.vertsOf('conducao');if(!all.length)return '';
    var any=E.trainedVerts(data,'conducao').length>0||E.pendingVerts(data).some(function(p){return p.pericia==='conducao'});
    if(!any)return '';
    return '<article class="vta-card" data-tool="conducao"><header><h4>Condução: veículos</h4></header>'+
      '<p class="sub vta-note">Veículos complexos exigem treino específico: o generalista (grau ÷'+E.regra('generalistaDiv')+') não vale neles.</p>'+
      all.map(function(v){
        var vc=E.vertCalc(data,v.id,{vocList:vocations}),st=vc.status;
        var badge=st==='treinado'?'<span class="vt-badge on">Treinado +'+vc.grau+'</span>':
          st==='bloqueado'?'<span class="vt-badge vt-req">Bloqueado: exige treino</span>':
          st==='generalista'?'<span class="vt-badge">Generalista ÷'+E.regra('generalistaDiv')+' (+'+vc.grau+')</span>':
          st==='pendente'?'<span class="vt-badge">Treino antigo +'+vc.grau+'</span>':'<span class="vt-badge">Sem treino</span>';
        var btn=st==='bloqueado'?'<button type="button" class="btn" disabled>Sem treino específico</button>':ctxButtons(v.id,'Conduzir',false);
        return '<div class="vta-sub" data-st="'+st+'"><h5>'+esc(v.name)+' '+badge+'</h5><div class="vta-act">'+btn+'</div></div>';
      }).join('')+'</article>';
  }

  /* ---------- Perícia Forense: autópsia com checklist ---------- */
  function cardForense(){
    var id='medicina.forense',d=def(id);if(!d||!trained(id))return '';
    var au=data.autopsia&&typeof data.autopsia==='object'?data.autopsia:null,names=E.AUTOPSY_FINDS;
    var ck=au?'<div class="vta-check" role="group" aria-label="Achados da autópsia">'+names.map(function(n,i){
      return '<label class="t3-check"><input type="checkbox" data-vta-in="find" data-i="'+i+'"'+(au.found&&au.found[i]?' checked':'')+(canSheet()?'':' disabled')+'> '+esc(n)+'</label>';
    }).join('')+'<p class="sub">'+esc(au.nome||'Corpo sem nome')+' · resultado '+au.total+' contra DT '+au.dt+' · '+(au.found||[]).filter(Boolean).length+' de '+names.length+' achados. O Mestre pode ajustar a lista.</p></div>':
      '<p class="sub">Sem laudo ainda. A DT é '+E.regra('autopsiaDT')+' para o 1º achado e cada '+E.regra('autopsiaPasso')+' pontos de margem revelam mais um.</p>';
    return '<article class="vta-card" data-tool="forense"><header><h4>'+esc(d.name)+'</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      '<div class="vta-row"><label class="field vta-f"><span class="field-label">Corpo ou cena</span><input type="text" maxlength="60" value="'+esc(V.pick.corpo||'')+'" data-vta-in="corpo" placeholder="Ex.: vítima do beco"></label></div>'+
      ck+'<div class="vta-act"><button type="button" class="btn primary" data-vta="autopsia"'+(canSheet()?'':' disabled')+'>Realizar autópsia</button></div></article>';
  }
  function autopsia(){
    var id='medicina.forense',vc=E.vertCalc(data,id,{vocList:vocations});
    var r=rollV(id,{quando:'autopsia',nome:'Autópsia'});if(!r)return;
    var dt=E.regra('autopsiaDT'),n=E.autopsy(r.total,dt,E.regra('autopsiaPasso'));
    data.autopsia={nome:V.pick.corpo||'',total:r.total,dt:dt,at:Date.now(),found:E.AUTOPSY_FINDS.map(function(_,i){return i<n?1:0})};
    save();V.sig='';paint();
    toast(n?'Autópsia: '+n+(n===1?' achado revelado':' achados revelados')+'.':'Autópsia inconclusiva: abaixo da DT '+dt+'.');
    return vc;
  }

  /* ---------- Cirurgia (Trégua) ---------- */
  function cardCirurgia(){
    var id='medicina.cirurgia',d=def(id);if(!d||!trained(id))return '';
    var dado=E.healDice(data,'criticoTregua')[0];
    return '<article class="vta-card" data-tool="cirurgia"><header><h4>'+esc(d.name)+'</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      '<p class="vta-line">Na Trégua, a Síntese Cirúrgica em paciente crítico restaura '+(dado?'<b>+'+esc(dado.dado)+'</b> de Vital':'Vital extra')+' sem suprimentos adicionais. No diálogo da Síntese, marque o paciente crítico.</p>'+
      '<div class="vta-act"><button type="button" class="btn primary" data-vta="sintese"'+(canSheet()?'':' disabled')+'>Síntese Cirúrgica</button></div></article>';
  }

  /* ---------- Psiquiatria: estabilizar surto (+Lucidez, nunca Vital) ---------- */
  function cardPsiquiatria(){
    var id='medicina.psiquiatria',d=def(id);if(!d||!trained(id))return '';
    var ps=E.psychSupport(data);
    return '<article class="vta-card" data-tool="psiquiatria"><header><h4>'+esc(d.name)+'</h4><span class="vt-badge on">✓ Efeito tático ativo</span></header>'+
      '<p class="vta-line">Estabiliza um aliado em surto: sucesso contra <b>DT '+ps.dt+'</b> devolve <b>+'+ps.luc+' de Lucidez</b> e acalma uma condição mental passageira.'+(ps.noVital?' <b>Não cura Vital.</b>':'')+' Em combate gasta a Ação Padrão.</p>'+
      '<div class="vta-act"><button type="button" class="btn primary" data-vta="psiq"'+(canSheet()&&camp3()?'':' disabled')+'>Estabilizar surto</button></div>'+(camp3()?'':'<p class="sub vta-note">Abra a campanha para escolher o aliado.</p>')+'</article>';
  }
  async function psiq(){
    var id='medicina.psiquiatria',ch=charById(activeCharacterId);
    if(!trained(id)||!ch||!camp3()){toast('Abra a campanha para estabilizar um aliado.');return}
    var cb=camp3().combat,fight=!!(cb&&cb.active&&cb.phase==='active');
    if(fight){
      if(TURN.actor!==ch.id){toast('Em combate, só no seu turno.');return}
      if(actionsLeft(ch)<=0){toast('Você já usou sua ação neste turno.');return}
    }
    if(E.computeMods(data).flags.has('semAgir')){toast('Neste estado você não pode agir.');return}
    var cands=chars3().filter(function(c){return c.id!==ch.id&&inScene(c)&&!isDeadCh(c)});
    if(!cands.length){toast('Nenhum aliado na cena.');return}
    var p=await pickTargets({title:def(id).name,multi:false,only:cands.map(function(c){return c.id}),skipDead:true,hint:'Quem será estabilizado? (alcance adjacente)'});
    if(!p||!p.ids.length)return;
    var tc=charById(p.ids[0]);if(!tc)return;
    var ps=E.psychSupport(data),r=rollV(id,{quando:null,nome:'Estabilizar surto'});if(!r)return;
    var ok=r.total>=ps.dt;
    if(fight)spend(ch);
    if(!ok){toast('O surto de '+nm(tc)+' não foi contido (DT '+ps.dt+').');return}
    var fx=[];
    if(ps.luc>0)fx.push({t:'luc',n:ps.luc});
    var calm=stIds(tc.data).find(function(s){return E.SURTO_STATUS.indexOf(s)>=0});
    if(calm)fx.push({t:'status',id:calm,on:false});
    /* "não cura Vital": nenhum efeito de Vital sai daqui, mesmo que o catálogo seja editado */
    fx=fx.filter(function(x){return !(ps.noVital&&(x.t==='heal'||x.t==='temp'))});
    await sendFx([tc.id],fx,nm(ch)+' estabilizou '+nm(tc)+' (+'+ps.luc+' Lucidez'+(calm?', acalmou a condição':'')+')',ch);
    toast(nm(tc)+' recuperou '+ps.luc+' de Lucidez.');
  }

  /* ---------- painel ---------- */
  function html(){
    var cards=[cardFolego(),cardVarredura(),cardSeguranca(),cardConducao(),cardForense(),cardCirurgia(),cardPsiquiatria()].filter(Boolean);
    return cards.length?'<h3 class="vt-group">Ações das especializações</h3><div class="vta-grid">'+cards.join('')+'</div>':'';
  }
  function paint(){
    var pan=document.getElementById('vtPanel'),list=document.getElementById('vtList');
    if(!pan||!list)return;
    var box=document.getElementById('vtTools');
    if(!box){
      box=document.createElement('section');box.id='vtTools';box.className='vta-tools';box.setAttribute('aria-label','Ações das especializações');
      list.before(box);
      box.addEventListener('click',onClick);box.addEventListener('change',onChange);box.addEventListener('input',onInput);
    }
    var h;try{h=html()}catch(e){console.warn('[T4] ações',e);h=''}
    var sig=h.replace(/data-apn-t[^>]*>[^<]*/,'');
    /* não refaz enquanto a pessoa digita num campo do painel */
    var act=document.activeElement;
    if(act&&box.contains(act)&&act.matches('input[type=text],input[type=number]'))return;
    if(sig===V.sig)return;
    var focus=act&&box.contains(act)?act.getAttribute('data-vta-in')||act.getAttribute('data-vta')+'|'+(act.dataset.v||'')+'|'+(act.dataset.q||''):'';
    V.sig=sig;box.innerHTML=h;box.hidden=!h;
    if(focus){
      var back=box.querySelector('[data-vta-in="'+focus+'"]');
      if(!back){var p=focus.split('|');back=[].slice.call(box.querySelectorAll('[data-vta="'+p[0]+'"]')).filter(function(b){return (b.dataset.v||'')===p[1]&&(b.dataset.q||'')===p[2]})[0]}
      if(back)back.focus({preventScroll:true});
    }
  }
  function onClick(e){
    var b=e.target.closest('button[data-vta]');if(!b||b.disabled)return;
    var a=b.dataset.vta;
    if(a==='apn-start')return apnStart();
    if(a==='apn-stop')return apnStop();
    if(a==='autopsia')return autopsia();
    if(a==='psiq')return psiq();
    if(a==='sintese'){if(T3.fieldMedicine)T3.fieldMedicine('sintese');return}
    if(a==='roll'){
      var id=b.dataset.v;
      rollV(id,{quando:b.dataset.q||null,silent:b.dataset.silent==='1'});
    }
  }
  function onChange(e){
    var t=e.target,k=t.getAttribute('data-vta-in');
    if(k==='silent'){V.silent=t.checked;V.sig='';paint()}
    else if(k==='find'&&data.autopsia){var i=Number(t.dataset.i);data.autopsia.found=data.autopsia.found||[];data.autopsia.found[i]=t.checked?1:0;save()}
  }
  function onInput(e){
    var t=e.target,k=t.getAttribute('data-vta-in');
    if(k==='search'){V.pick.search=Math.max(0,Math.min(999,Number(t.value)||0));
      var box=document.querySelector('[data-tool="varredura"] .vta-big');
      if(box){var r=E.searchTime(data,V.pick.search);box.innerHTML='<b>'+r.min+' min</b><span>× '+f(r.mult)+' com Varredura</span>'}}
    else if(k==='corpo')V.pick.corpo=t.value;
  }

  /* o painel acompanha a ficha (mesmo caminho do js/60g: renderSkills) */
  {var _sk=renderSkills;renderSkills=function(){
    var out=_sk.apply(this,arguments);
    try{paint()}catch(e){console.warn('[T4] painel',e)}
    return out;
  }}
  M6.hooks.leave.push(function(){apnStop()});

  T3.vta60n={paint:paint,rollV:rollV,apnStart:apnStart,apnStop:apnStop,autopsia:autopsia,psiq:psiq,state:V};
})();
