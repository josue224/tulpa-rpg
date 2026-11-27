/* ==========================================================================
   TULPA RPG — Carregador sob demanda (Lazy Loader) do Tulpa Arcade
   Carrega ANTES de js/61-init.js. Mantém js/25, js/26 (inclui Levantar a Mão)
   e js/28 (conquistas, broches da mesa e hub) ativos na entrada, e adia os
   15 arquivos pesados de jogos (~686 KB) para a primeira abertura do Arcade.
   IIFE estrita: zero colisão de variáveis globais.
   ========================================================================== */
(function(){
  if(window.__arcLoad60d)return;
  window.__arcLoad60d=true;

  /* Extrai o token ?v=... deste próprio script para manter cache-busting alinhado */
  var VER='2026112711';
  try{
    var cs=document.currentScript||document.querySelector('script[src*="60d-arcade-loader"]');
    if(cs&&cs.src){
      var m=cs.src.match(/[?&]v=([^&]+)/);
      if(m)VER=m[1];
    }
  }catch(e){}

  /* Motor gráfico (60f) primeiro, para existir antes de qualquer jogo;
     depois, a ordem EXATA original dos 15 scripts de jogos e Arcade 2.0 */
  var QUEUE=[
    'js/60f-arcade-gfx.js',
    'js/29-arcade-jogos-a.js',
    'js/30-arcade-jogos-b.js',
    'js/31-arcade-jogos-c.js',
    'js/34-arcade-3-jogos.js',
    'js/50-arcade2-onda1.js',
    'js/51-arcade2-onda2.js',
    'js/52-arcade2-onda3.js',
    'js/53-arcade2-onda4.js',
    'js/54-arcade2-onda5.js',
    'js/55-arcade2-onda6.js',
    'js/56-arcade2-onda7.js',
    'js/57-arcade2-onda8.js',
    'js/58-arcade2-onda9.js',
    'js/59-arcade2-onda10.js',
    'js/60-arcade2-onda11.js'
  ];

  var loaded=false;
  var inflight=null;
  var badge=null;

  var origMgOpen=typeof window.mgOpen==='function'?window.mgOpen:null;
  var origT3MgOpen=window.T3&&typeof T3.mgOpen==='function'?T3.mgOpen:origMgOpen;
  var origArcGo=window.T3&&typeof T3.arcGo==='function'?T3.arcGo:null;

  function showProgress(cur,tot){
    if(!badge){
      badge=document.createElement('div');
      badge.id='arcLoad60d';
      badge.setAttribute('role','status');
      badge.setAttribute('aria-live','polite');
      badge.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(9,11,16,.58);backdrop-filter:blur(4px);';
      badge.innerHTML='<div style="background:#141722;color:#f3ede2;border:1px solid rgba(255,211,107,.38);border-radius:14px;padding:16px 22px;font:600 14px \'IBM Plex Sans\',system-ui,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:8px;min-width:240px;text-align:center"><span>🕹 Carregando Tulpa Arcade…</span><div style="height:6px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden"><i id="arcLoadBar60d" style="display:block;height:100%;width:0%;background:#ffd36b;transition:width .15s ease"></i></div><small id="arcLoadTxt60d" style="opacity:.75;font-weight:500">Preparando módulos</small></div>';
      document.body.appendChild(badge);
    }
    var bar=document.getElementById('arcLoadBar60d');
    var txt=document.getElementById('arcLoadTxt60d');
    if(bar)bar.style.width=Math.round((cur/tot)*100)+'%';
    if(txt)txt.textContent=cur+' / '+tot+' módulos';
  }

  function hideProgress(){
    if(badge){badge.remove();badge=null}
  }

  function loadOne(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src+'?v='+encodeURIComponent(VER);
      s.async=false;
      s.onload=function(){resolve()};
      s.onerror=function(){reject(new Error('Falha ao carregar '+src))};
      document.body.appendChild(s);
    });
  }

  function restoreOriginals(){
    if(origMgOpen&&window.mgOpen===lazyMgOpen)window.mgOpen=origMgOpen;
    if(window.T3&&T3.mgOpen===lazyMgOpen)T3.mgOpen=origT3MgOpen||window.mgOpen;
    if(window.T3&&origArcGo&&T3.arcGo===lazyArcGo)T3.arcGo=origArcGo;
  }

  function ensureArcadeLoaded(){
    if(loaded)return Promise.resolve(true);
    if(inflight)return inflight;

    /* Restaura as referências originais ANTES de injetar js/50–60,
       garantindo que qualquer wrapper do Arcade 2.0 envolva as funções reais. */
    restoreOriginals();
    showProgress(0,QUEUE.length);

    var chain=Promise.resolve();
    QUEUE.forEach(function(src,idx){
      chain=chain.then(function(){
        return loadOne(src).then(function(){showProgress(idx+1,QUEUE.length)});
      });
    });

    inflight=chain.then(function(){
      loaded=true;
      inflight=null;
      hideProgress();
      console.info('[Tulpa] Arcade carregado sob demanda ('+QUEUE.length+' módulos)');
      return true;
    }).catch(function(err){
      inflight=null;
      hideProgress();
      /* Reinstala interceptores para permitir nova tentativa */
      if(origMgOpen)window.mgOpen=lazyMgOpen;
      if(window.T3){
        T3.mgOpen=lazyMgOpen;
        if(origArcGo)T3.arcGo=lazyArcGo;
      }
      console.error('[Tulpa] Erro ao carregar Arcade:',err);
      try{toast('Não foi possível carregar o Tulpa Arcade. Verifique sua conexão e tente novamente.')}catch(e){}
      return false;
    });

    return inflight;
  }

  function allowedNow(){
    try{
      if(window.T3&&typeof T3.canAccessArcade==='function')return !!T3.canAccessArcade();
    }catch(e){}
    return true;
  }

  function lazyMgOpen(){
    var args=arguments;
    if(!loaded){
      /* Não baixa 686 KB se o jogador estiver bloqueado pela call ativa */
      if(!allowedNow()){
        if(origMgOpen)return origMgOpen.apply(this,args);
        return;
      }
      return ensureArcadeLoaded().then(function(ok){
        if(!ok)return;
        var fn=(typeof window.mgOpen==='function'&&window.mgOpen!==lazyMgOpen)?window.mgOpen:origMgOpen;
        if(fn)fn.apply(null,args);
      });
    }
    var fn=(typeof window.mgOpen==='function'&&window.mgOpen!==lazyMgOpen)?window.mgOpen:origMgOpen;
    if(fn)return fn.apply(this,args);
  }

  function lazyArcGo(){
    var args=arguments;
    if(!loaded){
      if(!allowedNow()){
        if(origArcGo)return origArcGo.apply(this,args);
        return;
      }
      return ensureArcadeLoaded().then(function(ok){
        if(!ok)return;
        var fn=(window.T3&&typeof T3.arcGo==='function'&&T3.arcGo!==lazyArcGo)?T3.arcGo:origArcGo;
        if(fn)fn.apply(null,args);
      });
    }
    var fn=(window.T3&&typeof T3.arcGo==='function'&&T3.arcGo!==lazyArcGo)?T3.arcGo:origArcGo;
    if(fn)return fn.apply(this,args);
  }

  if(origMgOpen)window.mgOpen=lazyMgOpen;
  if(window.T3){
    T3.mgOpen=lazyMgOpen;
    if(origArcGo)T3.arcGo=lazyArcGo;
    T3.ensureArcadeLoaded=ensureArcadeLoaded;
  }
})();
