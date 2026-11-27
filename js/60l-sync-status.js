/* ===================================================================
   TULPA · Onda 1 — Sincronização: reconexão com espera, ressincronização
   e indicador de status na barra superior.
   - Tempo real saudável: não faz nada além de mostrar "Sincronizado".
   - Canal caído (CHANNEL_ERROR / TIMED_OUT / CLOSED) ou sem rede: espera um
     pouco (o supabase-js também tenta sozinho), refaz os canais com espera
     crescente (4, 8, 16, 30 s) e, só enquanto estiver caído, confere o
     banco a cada ~25 s.
   - Ao voltar: relê estado da mesa, Manual, regras e fichas.
   - Ao a aba ganhar foco / a rede voltar: confere só o updated_at das chaves
     state, rules e manual e relê só o que mudou.
   Usa M6, camp3 e T3 (globais do js/20 e js/11). Sem nomes globais novos.
   =================================================================== */
(function(){
  'use strict';
  var BAD={CHANNEL_ERROR:1,TIMED_OUT:1,CLOSED:1};
  var KEYS=['state','rules','manual'];
  var ST={cur:'',badSince:0,attempt:0,timer:0,lastPoll:0,lastProbe:0,probing:false,seen:{},camp:'',hiddenAt:0,wakeAt:0};
  var LABEL={ok:'Sincronizado',reconnecting:'Reconectando',offline:'Offline'};
  var TITLE={
    ok:'Sincronizado: mudanças do Mestre chegam ao vivo. Toque para conferir agora.',
    reconnecting:'Reconectando ao tempo real. Toque para conferir agora.',
    offline:'Offline: sem conexão com a nuvem. Toque para tentar de novo.'
  };
  var el=null;

  function sbc(){return window.tulpaSupabase||null}
  function campId(){try{var c=camp3();return c&&c.id||''}catch(e){return ''}}
  function cloudOn(){
    try{return !!(sbc()&&window.tulpaCloudUser&&campId()&&typeof sbc().from==='function'&&M6.backend!=='local')}catch(e){return false}
  }
  /* '' = esconder (fora de campanha na nuvem) */
  function compute(){
    if(!cloudOn())return '';
    if(navigator.onLine===false)return 'offline';
    var cs=window.__tulpaCampSt||'',db=M6.dbSt||'';
    if(!M6.campId)return ST.attempt>=3?'offline':'reconnecting'; /* entrada na mesa falhou ou ainda não terminou */
    var ok=db==='SUBSCRIBED'&&!BAD[cs]&&cs!=='JOINING';
    if(ok)return 'ok';
    return ST.attempt>=3&&BAD[db]?'offline':'reconnecting';
  }
  function ensureEl(){
    if(el&&el.isConnected)return el;
    if(!el){
      el=document.createElement('button');el.type='button';el.id='syncStatus60';el.className='sync60';el.hidden=true;
      el.setAttribute('role','status');
      el.innerHTML='<i class="sync60-dot" aria-hidden="true"></i><span class="sync60-txt"></span>';
      el.addEventListener('click',function(){wake(true)});
    }
    return el;
  }
  /* a barra superior da ficha ou, na Visão de Mesa (onde ela some), a barra da mesa */
  function place(){
    var e=ensureEl(),top=document.querySelector('.topbar .top-actions'),tb=document.querySelector('.topbar');
    var topVisible=!!(tb&&tb.offsetHeight>0&&top);
    var mesa=document.querySelector('#mesaBar .mb-right');
    var host=topVisible?top:(mesa&&mesa.offsetHeight>0?mesa:(top||mesa));
    if(host&&e.parentNode!==host)host.insertBefore(e,host.firstChild);
  }
  function paint(st){
    var e=ensureEl();
    if(!st){e.hidden=true;return}
    e.hidden=false;e.setAttribute('data-st',st);
    var t=e.querySelector('.sync60-txt');if(t.textContent!==LABEL[st])t.textContent=LABEL[st];
    e.setAttribute('aria-label','Sincronização: '+LABEL[st]);e.title=TITLE[st];
  }

  /* ---------- checagem leve + relida só do que mudou ---------- */
  async function probe(force){
    if(ST.probing||!cloudOn())return;
    ST.probing=true;var id=campId();
    try{
      var s=sbc(),rows;
      if(M6.backend==='store'){
        var r=await s.from('campaign_store').select('key,updated_at').eq('campaign_id',id).in('key',KEYS);
        if(r.error)throw r.error;rows=(r.data||[]).map(function(x){return{key:x.key,at:x.updated_at}});
      }else{
        var r2=await s.from('campaign_items').select('item_key,updated_at').eq('campaign_id',id).in('item_key',KEYS.map(function(k){return 'mesa~'+k}));
        if(r2.error)throw r2.error;rows=(r2.data||[]).map(function(x){return{key:String(x.item_key).slice(5),at:x.updated_at}});
      }
      if(campId()!==id)return;
      if(ST.camp!==id){ST.camp=id;ST.seen={}}
      ST.lastProbe=Date.now();
      var changed={};
      rows.forEach(function(x){if(force||ST.seen[x.key]!==x.at)changed[x.key]=1;ST.seen[x.key]=x.at});
      if(changed.state&&T3.mesaResync)await T3.mesaResync();
      if(changed.manual&&typeof fetchMan31==='function')fetchMan31();
      if(changed.rules&&typeof fetchRules29==='function')fetchRules29(true);
      if(force&&window.tulpaResyncCharacters)await window.tulpaResyncCharacters();
    }catch(e){console.warn('[sync] conferência',e&&e.message||e)}
    finally{ST.probing=false}
  }

  /* ---------- reconexão com espera ---------- */
  function reconnectNow(){
    if(!cloudOn()||navigator.onLine===false)return;
    try{
      if(!M6.campId){if(T3.mesaJoin)T3.mesaJoin();return}
      if(M6.dbSt!=='SUBSCRIBED'||BAD[M6.chSt]){if(T3.mesaResub)T3.mesaResub()}
      var cs=window.__tulpaCampSt||'';
      if(BAD[cs]&&window.tulpaResubCampaign)window.tulpaResubCampaign();
    }catch(e){console.warn('[sync] reconectar',e)}
  }
  function schedule(){
    if(ST.timer)return;
    var wait=ST.attempt===0?4000:Math.min(30000,4000*Math.pow(2,ST.attempt));
    wait+=Math.floor(Math.random()*800);
    ST.timer=setTimeout(function(){
      ST.timer=0;
      if(compute()==='ok'||!cloudOn())return;
      ST.attempt++;reconnectNow();
      setTimeout(evaluate,300);
    },wait);
  }
  function wake(manual){
    var now=Date.now();
    if(!manual&&now-ST.wakeAt<5000)return;
    ST.wakeAt=now;
    if(!cloudOn())return;
    var away=ST.hiddenAt?now-ST.hiddenAt:0;ST.hiddenAt=0;
    var st=compute();
    if(st!=='ok'){ST.attempt=Math.max(ST.attempt,1);reconnectNow();probe(true);return}
    if(manual||away>60000||now-ST.lastProbe>20000)probe(manual||away>60000);
  }

  function evaluate(){
    var st=compute(),prev=ST.cur;
    if(st!==prev){
      ST.cur=st;paint(st);
      if(st==='ok'&&prev&&prev!=='ok'){ /* voltou: relê tudo uma vez */
        ST.attempt=0;ST.badSince=0;if(ST.timer){clearTimeout(ST.timer);ST.timer=0}
        probe(true);
      }
    }
    if(st==='reconnecting'||st==='offline'){
      if(!ST.badSince)ST.badSince=Date.now();
      schedule();
    }else if(st==='ok'){ST.badSince=0}
  }
  function tick(){
    try{
      place();evaluate();
      var st=ST.cur,now=Date.now();
      /* reserva: só com o tempo real caído e a aba à vista */
      if((st==='reconnecting'||st==='offline')&&!document.hidden&&navigator.onLine!==false&&now-ST.lastPoll>25000){ST.lastPoll=now;probe(true)}
    }catch(e){}
  }

  window.addEventListener('tulpa:sync',function(){try{evaluate()}catch(e){}});
  window.addEventListener('online',function(){ST.attempt=0;try{reconnectNow();wake(true)}catch(e){}});
  window.addEventListener('offline',function(){try{evaluate()}catch(e){}});
  window.addEventListener('focus',function(){wake(false)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)ST.hiddenAt=Date.now();else wake(false)});
  setInterval(tick,2000);
  setTimeout(tick,600);
  T3.syncStatus=function(){return{state:ST.cur,attempt:ST.attempt,db:M6.dbSt||'',mesa:M6.chSt||'',campanha:window.__tulpaCampSt||''}};
})();
