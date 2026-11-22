/* ==========================================================================
   TULPA RPG — Onda 2 · Fichas: Cabeçalho Editorial (Avatar, Resumo & Recursos)
   Carrega ANTES de js/61-init.js, depois de js/60b-app-shell.js.
   Espelho SOMENTE LEITURA dos dados já presentes na ficha (#stats, #charName,
   #stageTag, data.*): não altera valores, regras nem Supabase. IIFE estrita.
   ========================================================================== */
(function(){
  if(window.__fi60)return;
  window.__fi60=true;

  var RES=[
    ['vital','Vital'],
    ['lucidity','Lucidez'],
    ['essence','Essência']
  ];
  var head=null;
  var lastAv='';

  function txt(el){return el?String(el.textContent||'').replace(/\s+/g,' ').trim():''}

  function goTab(tabId,focusId){
    var b=document.querySelector('.side .navbtn[data-tab="'+tabId+'"]');
    if(b)b.click();
    if(focusId){
      var t=document.getElementById(focusId);
      if(t&&t.scrollIntoView)setTimeout(function(){t.scrollIntoView({block:'center',behavior:'smooth'})},40);
    }
  }

  function build(){
    var shell=document.querySelector('.shell'),layout=shell&&shell.querySelector('.layout');
    if(!layout||document.getElementById('sheetHead60'))return;

    head=document.createElement('section');
    head.id='sheetHead60';
    head.hidden=true;
    head.setAttribute('aria-label','Resumo do personagem');
    head.innerHTML=
      '<div class="sh-left">'+
        '<div class="sh-av" id="shAv60" aria-hidden="true">✧</div>'+
        '<div class="sh-id">'+
          '<h1 class="sh-name" id="shName60"></h1>'+
          '<div class="sh-chips">'+
            '<button type="button" class="sh-chip sh-stage" id="shStage60" data-go="overview|stageList" title="Ver progressão de estágio"></button>'+
            '<button type="button" class="sh-chip" id="shVoc60" data-go="vocation" title="Abrir aba Vocação" hidden></button>'+
            '<button type="button" class="sh-chip" id="shTrack60" data-go="track" title="Abrir aba Arquétipo & Trilha" hidden></button>'+
            '<button type="button" class="sh-chip" id="shDef60" data-go="attributes" title="Defesa final (DF) · abrir Atributos" hidden></button>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="sh-res">'+
        RES.map(function(r){
          return '<button type="button" class="sh-m" data-k="'+r[0]+'" title="Ir para Estatísticas Vitais para ajustar '+r[1]+'">'+
            '<span class="sh-top"><span>'+r[1]+'</span><span class="sh-v">–</span></span>'+
            '<span class="sh-b"><i></i></span>'+
          '</button>';
        }).join('')+
      '</div>';

    shell.insertBefore(head,layout);

    head.addEventListener('click',function(e){
      var meter=e.target.closest('.sh-m');
      if(meter){goTab('overview','stats');return}
      var chip=e.target.closest('[data-go]');
      if(chip){
        var p=String(chip.dataset.go||'').split('|');
        goTab(p[0],p[1]||'');
      }
    });

    /* Navegação por setas quando o foco está na faixa de abas */
    var side=document.querySelector('.side');
    if(side&&!side.__kbd60c){
      side.__kbd60c=true;
      side.addEventListener('keydown',function(e){
        if(!document.body.classList.contains('sheet-view'))return;
        if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
        var btns=[].slice.call(side.querySelectorAll('.navbtn:not([hidden])'));
        var idx=btns.indexOf(document.activeElement);
        if(idx<0)return;
        e.preventDefault();
        var next=btns[(idx+(e.key==='ArrowRight'?1:-1)+btns.length)%btns.length];
        if(next){next.focus();next.click()}
      });
    }
  }

  function setChip(id,label){
    var el=document.getElementById(id);
    if(!el)return;
    var clean=String(label||'').trim();
    el.hidden=!clean;
    if(clean&&el.textContent!==clean)el.textContent=clean;
  }

  function readAvatarSrc(){
    try{
      if(typeof data!=='undefined'&&data&&typeof data.avatar==='string'&&data.avatar.length>20)return data.avatar;
    }catch(e){}
    var img=document.querySelector('#avEdit img');
    return (img&&img.getAttribute('src'))||'';
  }

  function readDefense(){
    try{
      if(typeof E!=='undefined'&&E&&typeof E.defenseInfo==='function'&&typeof data!=='undefined'&&data){
        var di=E.defenseInfo(data);
        if(di&&isFinite(di.DF))return 'DF '+di.DF;
      }
    }catch(e){}
    var bd=Number(document.getElementById('baseDefense')?.value||10);
    var eq=Number(document.getElementById('defense')?.value||0);
    return isFinite(bd+eq)?'DF '+(bd+eq):'';
  }

  function findStatBox(key){
    var el=document.querySelector('#stats [data-res-box="'+key+'"]');
    if(el)return el;
    var inp=document.querySelector('#stats [data-stat="'+key+'"]');
    return inp?inp.closest('.stat'):null;
  }

  function update(){
    if(!head)return;
    var on=document.body.classList.contains('sheet-view');
    head.hidden=!on;
    if(!on)return;

    var nm=document.getElementById('charName');
    var name=(nm&&nm.value||'').trim()||'Personagem sem nome';
    var nEl=document.getElementById('shName60');
    if(nEl&&nEl.textContent!==name)nEl.textContent=name;

    /* Avatar (evita recriar <img> se não mudou) */
    var avSrc=readAvatarSrc();
    var avKey=avSrc?('img:'+avSrc.slice(0,48)+':'+avSrc.length):('ini:'+name.slice(0,2));
    if(avKey!==lastAv){
      lastAv=avKey;
      var avEl=document.getElementById('shAv60');
      if(avEl){
        if(avSrc){
          var im=document.createElement('img');im.src=avSrc;im.alt='';
          avEl.replaceChildren(im);
        }else{
          var ini=name==='Personagem sem nome'?'✧':name.slice(0,2).toUpperCase();
          avEl.textContent=ini;
        }
      }
    }

    /* Chips de identificação rápida */
    setChip('shStage60',txt(document.getElementById('stageTag'))||'ESTÁGIO 1');
    var voc='',trk='';
    try{
      if(typeof data!=='undefined'&&data){
        voc=data.vocation||'';
        trk=data.track?(data.archetype?data.archetype+' · '+data.track:data.track):(data.archetype||'');
      }
    }catch(e){}
    setChip('shVoc60',voc);
    setChip('shTrack60',trk);
    setChip('shDef60',readDefense());

    /* Espelho das 3 barras de recurso */
    RES.forEach(function(r){
      var src=findStatBox(r[0]);
      var m=head.querySelector('.sh-m[data-k="'+r[0]+'"]');
      if(!src||!m)return;
      var val=txt(src.querySelector('.value')).replace(/\s*\/\s*/,' / ');
      var vEl=m.querySelector('.sh-v');
      if(vEl&&vEl.textContent!==val)vEl.textContent=val;

      var bar=src.querySelector('.bar span');
      var fill=m.querySelector('.sh-b i');
      if(bar&&fill){
        var w=bar.style.width||'0%';
        if(fill.style.width!==w)fill.style.width=w;
        var cs=getComputedStyle(bar);
        var bg=(cs.backgroundImage&&cs.backgroundImage!=='none')?cs.backgroundImage:cs.backgroundColor;
        if(fill.style.background!==bg)fill.style.background=bg;
        var pct=parseFloat(w);
        m.dataset.low=(isFinite(pct)&&pct<=25)?'1':'0';
      }
    });
  }

  function measure(){
    var tb=document.querySelector('.topbar');
    if(!tb)return;
    var h=Math.round(tb.getBoundingClientRect().height);
    if(h&&document.documentElement.style.getPropertyValue('--tb-h')!==h+'px'){
      document.documentElement.style.setProperty('--tb-h',h+'px');
    }
  }

  /* Marca o botão "← Central" (criado sem classe em js/02) para o CSS poder escondê-lo na ficha */
  function tagTopbar(){
    var bs=document.querySelectorAll('.topbar .top-actions>button');
    for(var i=0;i<bs.length;i++){
      if(!bs[i].classList.contains('tb-central60')&&/Central/.test(bs[i].textContent||'')&&!bs[i].id)bs[i].classList.add('tb-central60');
    }
  }
  /* Altura do cabeçalho fixo: a coluna de abas gruda logo abaixo dele */
  function measureHead(){
    var h=head&&!head.hidden&&getComputedStyle(head).position==='sticky'?Math.round(head.getBoundingClientRect().height)+1:0;
    if(document.documentElement.style.getPropertyValue('--sh-h')!==h+'px')document.documentElement.style.setProperty('--sh-h',h+'px');
  }

  function keepActiveTabVisible(){
    var a=document.querySelector('.side .navbtn.active');
    var side=document.querySelector('.side');
    if(!a||!side||!document.body.classList.contains('sheet-view'))return;
    var l=a.offsetLeft-side.offsetLeft,vw=side.clientWidth;
    if(l<side.scrollLeft||l+a.offsetWidth>side.scrollLeft+vw){
      side.scrollLeft=Math.max(0,l-vw/2+a.offsetWidth/2);
    }
  }

  function tick(){
    try{build();update();measure();tagTopbar();measureHead();keepActiveTabVisible()}
    catch(e){console.warn('[fi60]',e)}
  }

  function start(){
    tick();
    var q=false;
    var go=function(){
      if(q)return;q=true;
      requestAnimationFrame(function(){q=false;tick()});
    };
    try{
      new MutationObserver(go).observe(document.body,{
        subtree:true,childList:true,characterData:true,attributes:true,
        attributeFilter:['class','style','hidden']
      });
    }catch(e){}
    document.addEventListener('input',go,true);
    window.addEventListener('resize',go);
    setInterval(go,1200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
