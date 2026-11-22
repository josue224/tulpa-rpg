/* ==========================================================================
   TULPA RPG — Onda 2 · Fichas: cabeçalho compacto (Vital / Lucidez / Essência)
   Carrega ANTES de js/61-init.js, depois de js/60b-app-shell.js.
   Espelho SOMENTE LEITURA do que já existe em #stats/#charName/#stageTag:
   não altera valores, regras de recurso nem Supabase. IIFE: sem nomes globais.
   ========================================================================== */
(function(){
  if(window.__fi60)return;window.__fi60=true;
  var RES=[['vital','Vital'],['lucidity','Lucidez'],['essence','Essência']];
  var head=null;

  function build(){
    var shell=document.querySelector('.shell'),layout=shell&&shell.querySelector('.layout');
    if(!layout||document.getElementById('sheetHead60'))return;
    head=document.createElement('section');head.id='sheetHead60';head.hidden=true;
    head.setAttribute('aria-label','Resumo do personagem');
    head.innerHTML='<div class="sh-id"><h1 class="sh-name" id="shName60"></h1><p class="sh-sub" id="shSub60"></p></div><div class="sh-res">'+
      RES.map(function(r){return '<button type="button" class="sh-m" data-k="'+r[0]+'" title="Abrir a Visão geral para ajustar '+r[1]+'">'+
        '<span class="sh-top"><span>'+r[1]+'</span><span class="sh-v">–</span></span><span class="sh-b"><i></i></span></button>'}).join('')+'</div>';
    shell.insertBefore(head,layout);
    head.addEventListener('click',function(e){
      if(!e.target.closest('.sh-m'))return;
      var b=document.querySelector('.navbtn[data-tab="overview"]');if(b)b.click();
      var s=document.getElementById('stats');if(s&&s.scrollIntoView)s.scrollIntoView({block:'center'});
    });
  }

  function txt(el){return el?String(el.textContent||'').replace(/\s+/g,' ').trim():''}
  function update(){
    if(!head)return;
    var on=document.body.classList.contains('sheet-view');
    head.hidden=!on;if(!on)return;
    var nm=document.getElementById('charName'),name=(nm&&nm.value||'').trim()||'Personagem sem nome';
    var n=document.getElementById('shName60');if(n&&n.textContent!==name)n.textContent=name;
    var sub=txt(document.getElementById('stageTag'));
    var s=document.getElementById('shSub60');if(s&&s.textContent!==sub)s.textContent=sub;
    RES.forEach(function(r){
      var src=document.querySelector('#stats [data-res-box="'+r[0]+'"]');
      var m=head.querySelector('.sh-m[data-k="'+r[0]+'"]');if(!src||!m)return;
      var val=txt(src.querySelector('.value')).replace(/\s*\/\s*/,' / ');
      var v=m.querySelector('.sh-v');if(v.textContent!==val)v.textContent=val;
      var bar=src.querySelector('.bar span'),i=m.querySelector('.sh-b i');
      if(bar&&i){
        if(i.style.width!==bar.style.width)i.style.width=bar.style.width;
        var cs=getComputedStyle(bar),bg=cs.backgroundImage&&cs.backgroundImage!=='none'?cs.backgroundImage:cs.backgroundColor;
        if(i.style.background!==bg)i.style.background=bg;
      }
    });
  }

  /* altura real do topbar (ele pode quebrar em 2 linhas) para a faixa de abas grudar embaixo */
  function measure(){
    var tb=document.querySelector('.topbar');if(!tb)return;
    var h=Math.round(tb.getBoundingClientRect().height);
    if(h&&document.documentElement.style.getPropertyValue('--tb-h')!==h+'px')document.documentElement.style.setProperty('--tb-h',h+'px');
  }
  function keepActiveTabVisible(){
    var a=document.querySelector('.side .navbtn.active'),side=document.querySelector('.side');
    if(!a||!side||!document.body.classList.contains('sheet-view'))return;
    var l=a.offsetLeft-side.offsetLeft,vw=side.clientWidth;
    if(l<side.scrollLeft||l+a.offsetWidth>side.scrollLeft+vw)side.scrollLeft=Math.max(0,l-vw/2+a.offsetWidth/2);
  }

  function tick(){try{build();update();measure();keepActiveTabVisible()}catch(e){console.warn('[fi60]',e)}}
  function start(){
    tick();
    var q=false,go=function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;tick()})};
    try{new MutationObserver(go).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','hidden']})}catch(e){}
    document.addEventListener('input',go,true);window.addEventListener('resize',go);
    setInterval(go,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
