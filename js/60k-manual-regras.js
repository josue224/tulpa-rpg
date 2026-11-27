/* ==========================================================================
   TULPA RPG — Onda 13 · Manual Vivo das regras novas e +d20 concedido
   Componentes vivos do Manual (atributos, vertentes, bloqueio, manobras,
   tiroteio, coberturas e condições) e T3.vertGrant (Comando Tático e
   bônus ao grupo). Nenhum número mora aqui: tudo vem do motor (E.*, js/10)
   e de list29/cur29 (chave "rules"). Carrega ANTES de js/61-init.js.
   IIFE: só publica T3.vertGrant e entradas em LIVE31.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__man60k)return;
  window.__man60k=true;

  var f=function(v){return String(v).replace('.',',')};
  var r=function(id){return f(E.regra(id))};
  var S3=function(a){return a.slice(0,3).toUpperCase()};
  /* lápis do Mestre sem lixeira (benefícios, perícias, estados e valores não se excluem aqui) */
  function edit(sec,key,label){
    return gm31()?'<button type="button" class="gm29-b m31-ed60" data-g29e="'+sec+'" data-k="'+esc(key)+'" title="Editar (Mestre)" aria-label="Editar '+esc(label)+'">✏️</button>':'';
  }
  function values(group){
    return gm31()?'<div class="m31-addrow"><button type="button" class="gm29-b gm29-add" data-g29e="num" data-k="'+esc(group)+'">✏️ Editar valores: '+esc(group)+'</button></div>':'';
  }
  function rows(head,list,cls){
    return tb31(head,list.map(function(c){return tr31(c.map(function(x,i){return i?esc(x):'<b>'+esc(x)+'</b>'}))}),cls||'');
  }

  LIVE31.attrs=function(){
    return '<div class="m31-cards m31-attrs">'+list29('attr').map(function(row){
      var a=cur29('attr',row.key);
      return '<article class="m31-card m31-row" data-key="'+esc(row.key)+'"><header><h4>'+esc(a.name)+' <span class="m31-chip">'+a.sigla+'</span></h4>'+tag31(row.st)+edit('attr',row.key,a.name)+'</header>'+
        (a.desc?'<p class="m31-desc">'+esc(a.desc)+'</p>':'')+'<ul class="m31-tal">'+E.attrBenefits(a.name).map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul></article>';
    }).join('')+'</div>';
  };

  LIVE31.verts=function(b){
    var rowsV=list29('vert').filter(function(x){return x.st!=='del'}).map(function(x){return{row:x,v:cur29('vert',x.key)}});
    var per=list29('pericia').filter(function(x){return x.st!=='del'}).map(function(x){return{row:x,p:cur29('pericia',x.key)}}).filter(function(x){return x.p.grupo===b.grupo});
    return per.map(function(x){
      var p=x.p,mine=rowsV.filter(function(y){return y.v.pericia===p.id});
      var add=gm31()?'<div class="m31-addrow"><button type="button" class="gm29-b gm29-add" data-g29a="vert" data-p="'+esc(p.id)+'">＋ Especialização de '+esc(p.name)+'</button></div>':'';
      return '<div class="m31-per" data-pericia="'+esc(p.id)+'"><div class="m31-perhead m31-row"><h4>'+esc(p.name)+'</h4>'+tag31(x.row.st)+edit('pericia',p.id,p.name)+
        '<span class="m31-count">'+mine.length+(mine.length===1?' vertente':' vertentes')+'</span>'+(p.desc?'<p class="m31-desc">'+link31(esc(p.desc))+'</p>':'')+'</div>'+
        '<div class="m31-cards">'+mine.map(function(y){var v=y.v;
          return '<article class="m31-card m31-row m31-vert" data-key="'+esc(y.row.key)+'"><header><h4>'+esc(v.name)+'</h4>'+tag31(y.row.st)+gmB31('vert',y.row.key,v.name)+'</header>'+
            '<div class="m31-chips">'+v.attrs.map(function(a){return '<span class="m31-chip">'+S3(a)+'</span>'}).join('')+(v.requiresTraining?'<span class="m31-chip m31-req">Exige treino</span>':'')+'</div>'+
            '<p>'+link31(esc(v.desc||''))+'</p>'+
            ((v.effects||[]).length?'<details class="m31-fx"><summary>Efeitos aplicados pelo sistema</summary><ul>'+v.effects.map(function(e){return '<li>'+esc(effText29(e))+'</li>'}).join('')+'</ul></details>':'')+'</article>';
        }).join('')+'</div>'+add+'</div>';
    }).join('');
  };

  LIVE31.bloqueio=function(){
    var DB=E.DB,m=r('brechaMargem');
    return rows(['Desfecho','Quando','Resultado'],[
      ['Erro total do agressor','Ataque < '+DB+' e Bloqueio ≥ '+DB+' (20 natural vira Parcial)','Nenhum dano e 1 Contra-Ataque corpo a corpo grátis.'],
      ['Bloqueio com brecha','Bloqueio ≥ ataque com ataque < '+DB+', ou folga de '+m+' ou mais','Dano ÷ '+r('bloqueioDivisor')+' − redução (mín. '+r('bloqueioMinimo')+') e 1 Contra-Ataque grátis.'],
      ['Bloqueio parcial','Bloqueio ≥ '+DB+' e ataque maior; também os casos que sobram','Dano ÷ '+r('bloqueioDivisor')+' − redução (mín. '+r('bloqueioMinimo')+'), sem Contra-Ataque.'],
      ['Guarda quebrada','Bloqueio < '+DB+' e ataque ≥ '+DB,'Dano total, sem redução e sem Contra-Ataque.']
    ])+'<p class="m31-note">Redução = CON × '+r('bloqPorCon')+' + especialização (ex.: Boxe / Muay Thai) + '+r('guardaBonus')+' com a Guarda Fechada.</p>'+values('Bloqueio e Reação');
  };

  LIVE31.manobras=function(){
    var how={desarmar:'Briga ou Armas Brancas contra Briga ou Armas Brancas (−'+r('desarmeDuasMaos')+' para o atacante se a arma for de duas mãos). Empate favorece quem defende.',
      derrubar:'Briga contra Briga. Empate favorece quem defende.',agarrar:'Briga contra Briga. Empate favorece quem defende.',escapar:'Briga contra quem segura. Empate favorece quem segura.',
      empurrar:'Briga contra DT '+r('empurraoDT')+' + maior entre FOR e CON do alvo.'};
    var step=E.regra('empurraoPasso');
    var what={desarmar:'A arma do alvo é desequipada e cai no chão.',derrubar:'Alvo fica Caído. Judô / Wrestling pode gastar a Reação para mantê-lo Agarrado.',
      agarrar:'Alvo fica Agarrado. Jiu-Jitsu soma dano contra alvo Agarrado e Caído.',escapar:'Você se solta.',
      empurrar:'Margem 0 a '+(E.regra('empurraoMargem2')-1)+': '+f(step)+' m · '+r('empurraoMargem2')+' a '+(E.regra('empurraoMargem3')-1)+': '+f(step*2)+' m · '+r('empurraoMargem3')+' ou mais: '+f(step*3)+' m. Teto de '+r('empurraoTeto')+' m × FOR do atacante.'};
    return rows(['Manobra','Teste','Sucesso'],Object.keys(E.MANOBRAS).map(function(k){return[E.MANOBRAS[k].name,how[k],what[k]]}))+values('Manobras');
  };

  LIVE31.tiro=function(){
    var DB=E.DB,guns=list29('vert').filter(function(x){return x.st!=='del'}).map(function(x){return{row:x,v:cur29('vert',x.key)}}).filter(function(x){return x.v.pericia==='armasdisparo'});
    return '<p><b>Alvo ciente, na ordem:</b></p>'+rows(['Desfecho','Quando','Resultado'],[
      ['Crítico garantido','20 natural no ataque','Acerta em cheio; o Mergulho não adianta.'],
      ['Erro e recuperação','Ataque < '+DB+' e Mergulho ≥ '+DB,'Sem dano, o alvo fica de pé.'],
      ['Mergulho bem-sucedido','Ataque ≥ '+DB+' e Mergulho ≥ '+DB,'Sem dano; termina Caído ou abrigado.'],
      ['Acerto violento','Ataque ≥ '+DB+' e Mergulho < '+DB,'Acerta, o alvo cai e o atirador ganha o 2º Disparo.'],
      ['Erro e queda','Ataque < '+DB+' e Mergulho < '+DB,'Sem dano, mas o alvo termina Caído.']
    ])+'<p class="m31-note">Sem Mergulho (desprevenido, sem Reação ou ficando firme): o tiro acerta se o ataque alcançar a DF.</p>'+
    '<h4 class="m31-sub">Especializações de disparo</h4>'+rows(['Vertente','Atributo','Benefício'],guns.map(function(x){return[x.v.name,x.v.attrs.map(S3).join(' ou '),x.v.desc||'']}))+values('Tiroteio Tático');
  };

  LIVE31.cobertura=function(){
    return rows(['Situação','Efeito na Defesa'],[
      ['Cobertura parcial','+'+E.COVER.parcial+' na DF'],
      ['Cobertura pesada','+'+E.COVER.pesada+' na DF'],
      ['Cobertura total','Bloqueia a linha de visão: não há tiro'],
      ['Alvo em Disparada','+'+E.SPRINT_DF+' na DF contra disparos'],
      ['Alvo Caído (à distância)','+'+E.PRONE_DF+' na DF contra disparos'],
      ['Alvo Caído (corpo a corpo)','Vantagem para o atacante; cobertura não conta']
    ])+values('Defesa e Coberturas');
  };

  LIVE31.condicoes=function(){
    var list=list29('status').filter(function(x){return x.st!=='del'});
    return tb31(['Condição','Efeito',''],['caido','agarrado','segurando','suprimido','sangrando'].map(function(id){
      var row=list.find(function(x){return x.key===id});if(!row)return '';
      var s=cur29('status',id),dot=s.dot&&(s.dot.fixed||s.dot.dice);
      return tr31(['<b>'+esc(s.name)+'</b>'+tag31(row.st),esc(s.text||''),(dot?'<b>'+esc(String(dot))+' de dano por rodada</b>':'')+edit('status',id,s.name)],{key:id});
    }).filter(Boolean),'m31-conds');
  };

  /* ---------- Comando Tático e efeitos "+d20 ao grupo" ---------- */
  T3.vertGrant=async function(id){
    var def=E.vert(id),g=def&&E.grant(data,id);if(!g)return;
    var ch=charById(activeCharacterId),who=ch?nm(ch):(data.name||'Personagem');
    if(g.cena&&g.used){toast(def.name+': já usada nesta cena.');return}
    var effect={name:def.name,type:'once',dieDelta:g.dice,left:0,desc:'+'+g.dice+'d20 no próximo teste.'};
    var spend=function(){if(g.cena){E.useGrant(data,id);save()}try{renderSkills()}catch(e){}};
    if(!ch||!camp3()||!sb()){spend();toast(def.name+': avise quem ouviu — +'+g.dice+'d20 no próximo teste.');return}
    var cb=camp3().combat,fight=!!(cb&&cb.active&&cb.phase==='active');
    if(fight&&g.movimento){
      if(TURN.actor!==ch.id){toast('Em combate, use no seu turno: gasta a Ação de Movimento.');return}
      var mv=mvState14(ch);if(mv.used>.05||mv.run){toast('Você já se moveu neste turno: não sobra Ação de Movimento.');return}
    }
    var cands=chars3().filter(function(c){return c.id!==ch.id&&inScene(c)&&!isDeadCh(c)});
    if(!cands.length){toast('Nenhum aliado na cena para receber o bônus.');return}
    var p=await pickTargets({title:def.name,multi:g.grupo,exclude:[ch.id],only:cands.map(function(c){return c.id}),skipDead:true,
      hint:(g.grupo?'Quem recebe':'Qual aliado recebe')+' +'+g.dice+'d20 no próximo teste? (precisa ouvir você)'});
    if(!p||!p.ids.length)return;
    var ids=g.grupo?p.ids:p.ids.slice(0,1);
    var text=who+' concedeu +'+g.dice+'d20 ('+def.name+') a '+ids.map(function(i){return nm(charById(i))}).join(', ');
    try{await sendFx(ids,[{t:'effect',effect:effect}],text,ch)}catch(e){fail3('bônus de aliado',e);return}
    spend();
    if(fight&&g.movimento&&T3.lockMove)T3.lockMove(ch,{cmd:true});
    toast(text+'.');
  };
})();
