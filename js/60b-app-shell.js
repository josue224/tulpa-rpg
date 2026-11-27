/* ==========================================================================
   TULPA RPG — Onda 1 · App Shell + Controlador do Workspace da Mesa (VTT)
   Carrega ANTES de js/61-init.js. IIFE estrita: zero colisão global.
   Não altera regras de negócio, combate, WebRTC nem Supabase: apenas
   orquestra navegação, painéis retráteis, Modo Foco e atalhos ergonômicos.
   ========================================================================== */
(function(){
  if(window.__as60)return;
  window.__as60=true;

  var LS='t60b.';
  function lsGet(k){try{return localStorage.getItem(LS+k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(LS+k,v)}catch(e){}}
  var mqMobile=window.matchMedia?window.matchMedia('(max-width:860px)'):{matches:false,addEventListener:function(){}};

  /* ---- Ícones em traço limpo (herdam currentColor de qualquer estética) ---- */
  var IC={
    mesa:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    fichas:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    bancada:'<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="11" cy="13" r="2.6"/><path d="M13 15l3 3"/>',
    manual:'<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>',
    arcade:'<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18.5" cy="14" r=".8"/>',
    perseus:'<path d="M5 9l1-5 4 3h4l4-3 1 5v6a7 7 0 01-14 0z"/><circle cx="9.5" cy="12" r=".7"/><circle cx="14.5" cy="12" r=".7"/>',
    sistema:'<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    esteticas:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2.5 1.5-2.5H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    voltar:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    recolher:'<path d="M15 6l-6 6 6 6"/>',
    mais:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    sigil:'<path d="M12 2l10 10-10 10L2 12z"/><path d="M12 8v8M8 12h8"/>'
  };
  function svg(n){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+IC[n]+'</svg>'}

  /* ---- Helpers seguros ---- */
  function viewK(){try{return viewKey()}catch(e){return 'home'}}
  function inCamp(){try{return !!camp3()}catch(e){return false}}
  function say(m){try{toast(m)}catch(e){}}
  function isGM(){try{return !!isGM6()}catch(e){return false}}
  function arcOK(){try{return typeof T3.canAccessArcade==='function'?!!T3.canAccessArcade():true}catch(e){return true}}
  function combatOn(){try{return !!(camp3()&&camp3().combat&&camp3().combat.active)}catch(e){return false}}
  function press(id){var b=document.getElementById(id);if(b)b.click()}
  function isTyping(el){return !!(el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))}

  function docOpen(){
    var m=document.getElementById('man31'),y=document.getElementById('sys29');
    if(m&&!m.classList.contains('hide')&&m.offsetWidth)return 'manual';
    if(y&&!y.classList.contains('hide')&&y.offsetWidth)return 'sistema';
    var bn=document.getElementById('bn60r');
    if(bn&&!bn.classList.contains('hide')&&bn.offsetWidth)return 'bancada';
    return '';
  }
  function closeDocs(){
    var m=document.getElementById('man31'),y=document.getElementById('sys29');
    if(m&&!m.classList.contains('hide'))press('m31x');
    if(y&&!y.classList.contains('hide'))press('sys29x');
    var bn=document.getElementById('bn60r');
    if(bn&&!bn.classList.contains('hide'))press('bn60rClose');
  }
  function ensureHub(){
    var k=viewK();
    if(k.indexOf('hub')===0)return true;
    if(k.indexOf('sheet')===0){
      try{syncActiveCharacter()}catch(e){}
      try{showPortalPart('campaignHub');return true}catch(e){return false}
    }
    return false;
  }
  function needCamp(){if(inCamp())return true;say('Entre numa campanha primeiro.');return false}

  var ITEMS=[
    {id:'mesa',     label:'Mesa',                 group:'a', key:'1', go:function(){if(needCamp()&&ensureHub())press('openTable')}},
    {id:'fichas',   label:'Fichas',               group:'a', key:'2', go:function(){if(needCamp()&&ensureHub())press('openCharacters')}},
    {id:'manual',   label:'Manual Vivo', short:'Manual', group:'a', key:'3', go:function(){if(needCamp()&&T3.manualOpen)T3.manualOpen()}},
    {id:'bancada',  label:'Bancada & Investigação', short:'Bancada', group:'a', key:'5', go:function(){if(needCamp()&&T3.bancada)T3.bancada.open()}},
    {id:'arcade',   label:'Tulpa Arcade', short:'Arcade', group:'b', key:'4', go:function(){if(T3.arcGo)T3.arcGo()}, vis:arcOK},
    {id:'perseus',  label:'Perseus',              group:'b', more:1,  go:function(){if(!needCamp())return;if(T3.petOpen)T3.petOpen('room')}, vis:arcOK},
    {id:'sistema',  label:'Alterações do Sistema',group:'c', more:1,  go:function(){if(T3.sysOpen)T3.sysOpen()}, vis:isGM},
    {id:'esteticas',label:'Galeria de Estéticas', group:'d', more:1,  go:function(){if(T3.openSettings)T3.openSettings()}},
    {id:'voltar',   label:'Campanhas',            group:'d', more:1,  go:function(){if(T3.back)T3.back()}}
  ];

  var rail=null,more=null,moreBg=null,moreBtn=null,els={};
  var focusMode=false;
  var mobPane=lsGet('mobPane')==='seats'?'seats':'dock';

  function mkItem(it,inMore){
    var b=document.createElement('button');
    b.type='button';b.className='rl-item';b.dataset.id=it.id;
    b.dataset.tip=it.key?it.label+' (Alt+'+it.key+')':it.label;
    if(it.more&&!inMore)b.dataset.more='1';
    b.title=it.label;b.setAttribute('aria-label',it.label);
    b.innerHTML='<span class="rl-ico">'+svg(it.id)+'</span><span class="rl-lbl">'+it.label+'</span>'+
      (it.short&&!inMore?'<span class="rl-sh">'+it.short+'</span>':'');
    b.onclick=function(){
      closeMore();collapse();
      var d=docOpen();
      if(it.id==='voltar'&&d){closeDocs();return}
      if(d&&d===it.id)return;
      if(d)closeDocs();
      it.go();
    };
    return b;
  }
  function li(el){var l=document.createElement('li');l.appendChild(el);return l}
  function list(group){
    var ul=document.createElement('ul');ul.className='rl-list';
    ITEMS.forEach(function(it){
      if(it.group!==group)return;
      var b=mkItem(it,false);els[it.id]=b;ul.appendChild(li(b));
    });
    return ul;
  }

  function build(){
    if(document.getElementById('appRail60'))return;
    rail=document.createElement('nav');rail.id='appRail60';rail.hidden=true;
    rail.setAttribute('aria-label','Navegação principal');

    var brand=document.createElement('button');brand.type='button';brand.className='rl-brand';
    brand.setAttribute('aria-label','Expandir ou recolher a navegação');
    brand.setAttribute('aria-expanded','false');brand.title='Expandir navegação ([)';
    brand.innerHTML='<span class="rl-ico">'+svg('sigil')+'</span><span class="rl-camp"><b>TULPA RPG</b><small id="rlCamp60"></small></span>';
    brand.onclick=function(){toggleRail()};
    rail.appendChild(brand);

    rail.appendChild(list('a'));
    var s1=document.createElement('hr');s1.className='rl-sep';rail.appendChild(s1);
    rail.appendChild(list('b'));
    var s2=document.createElement('hr');s2.className='rl-sep';rail.appendChild(s2);
    rail.appendChild(list('c'));
    var g=document.createElement('div');g.className='rl-grow';rail.appendChild(g);
    rail.appendChild(list('d'));

    var col=document.createElement('button');col.type='button';col.className='rl-item rl-collapse';
    col.dataset.tip='Expandir / Recolher ([)';
    col.title='Recolher navegação';col.setAttribute('aria-label','Recolher navegação');
    col.innerHTML='<span class="rl-ico">'+svg('recolher')+'</span><span class="rl-lbl">Recolher</span>';
    col.onclick=function(){toggleRail()};
    rail.appendChild(col);

    /* Celular: botão "Mais" + bottom sheet com backdrop */
    var mi=document.createElement('button');mi.type='button';mi.className='rl-item rl-more';
    mi.title='Mais opções';mi.setAttribute('aria-label','Mais opções');mi.setAttribute('aria-expanded','false');
    mi.innerHTML='<span class="rl-ico">'+svg('mais')+'</span><span class="rl-lbl">Mais</span>';
    mi.onclick=function(e){e.stopPropagation();toggleMore()};
    moreBtn=mi;
    rail.querySelectorAll('.rl-list')[1].appendChild(li(mi));

    moreBg=document.createElement('div');moreBg.id='appMoreBg60';moreBg.hidden=true;
    moreBg.onclick=closeMore;

    more=document.createElement('div');more.id='appMore60';more.hidden=true;more.setAttribute('role','menu');
    ITEMS.forEach(function(it){
      if(!it.more)return;
      var b=mkItem(it,true);b.dataset.mid=it.id;b.setAttribute('role','menuitem');more.appendChild(b);
    });

    document.body.appendChild(rail);
    document.body.appendChild(moreBg);
    document.body.appendChild(more);

    document.addEventListener('click',function(e){
      if(more&&!more.hidden&&!more.contains(e.target)&&e.target!==moreBtn)closeMore();
      if(rail.classList.contains('open')&&!rail.contains(e.target))collapse();
    });

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){closeMore();collapse();return}
      if(isTyping(e.target))return;
      if(window.T3&&T3.mg&&T3.mg.open)return;
      if(!document.body.classList.contains('has-shell'))return;

      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key==='['){
        if(!mqMobile.matches){e.preventDefault();toggleRail()}
        return;
      }
      if(e.altKey&&!e.ctrlKey&&!e.metaKey){
        var k=String(e.key||'').toLowerCase();
        if(k==='f'&&viewK()==='hub:table'){e.preventDefault();toggleFocus();return}
        for(var i=0;i<ITEMS.length;i++){
          if(ITEMS[i].key===k&&els[ITEMS[i].id]&&!els[ITEMS[i].id].hidden){
            e.preventDefault();els[ITEMS[i].id].click();return;
          }
        }
      }
    });
  }

  function toggleRail(){
    var on=!rail.classList.contains('open');
    rail.classList.toggle('open',on);lsSet('rail',on?'1':'0');
    var br=rail.querySelector('.rl-brand');
    if(br){br.setAttribute('aria-expanded',on?'true':'false');br.title=on?'Recolher navegação ([)':'Expandir navegação ([)'}
  }
  function collapse(){if(rail&&rail.classList.contains('open'))rail.classList.remove('open')}
  function toggleMore(){
    var on=more.hidden;
    more.hidden=!on;
    if(moreBg)moreBg.hidden=!on;
    moreBtn.setAttribute('aria-expanded',on?'true':'false');
  }
  function closeMore(){
    if(more&&!more.hidden){
      more.hidden=true;
      if(moreBg)moreBg.hidden=true;
      moreBtn.setAttribute('aria-expanded','false');
    }
  }

  /* ---- Painéis Retráteis & Modo Foco da Mesa (VTT) ---- */
  function seatsOn(){
    var v=lsGet('seats');
    if(v==='1')return true;
    if(v==='0')return false;
    return window.innerWidth>=1200;
  }
  function dockOn(){
    var v=lsGet('dock');
    if(v==='1')return true;
    if(v==='0')return false;
    return window.innerWidth>=1360;
  }
  function toggleFocus(){
    focusMode=!focusMode;
    applyMesa();
    if(focusMode)say('Modo Foco ativado (Alt+F para restaurar os painéis).');
  }
  function applyMesa(){
    var b=document.body;
    b.classList.toggle('mesa-seats-off',!seatsOn());
    b.classList.toggle('mesa-dock-on',dockOn());
    b.classList.toggle('mesa-focus',focusMode);
    b.dataset.mobPane=mobPane;

    var s=document.getElementById('mbSeats60');
    var d=document.getElementById('mbDock60');
    var f=document.getElementById('mbFocus60');
    if(s)s.setAttribute('aria-pressed',(!focusMode&&seatsOn())?'true':'false');
    if(d)d.setAttribute('aria-pressed',(!focusMode&&dockOn())?'true':'false');
    if(f)f.setAttribute('aria-pressed',focusMode?'true':'false');

    var mt=document.getElementById('mesaMobTabs60');
    if(mt){
      mt.querySelectorAll('button').forEach(function(btn){
        btn.setAttribute('aria-selected',btn.dataset.mp===mobPane?'true':'false');
      });
    }
    try{window.dispatchEvent(new Event('resize'))}catch(e){}
  }

  /* ---- Popover "Mais" da barra da Mesa ----
     Move (não recria) os grupos secundários para dentro dele, então todos os
     IDs e handlers dos outros arquivos continuam valendo. Grupos criados
     depois por outros scripts são adotados no próximo sync. */
  var MORE_SEL=['.mb-right','#mbArc26','#mbScr28'];
  function moreOpen(){var p=document.getElementById('mbMore60');return !!(p&&!p.hidden)}
  function moreSet(on){
    var p=document.getElementById('mbMore60'),b=document.getElementById('mbMoreBtn60');
    if(!p||!b)return;
    p.hidden=!on;b.setAttribute('aria-expanded',on?'true':'false');
  }
  function adoptMore(){
    var bar=document.getElementById('mesaBar');
    if(!bar)return;
    var pop=document.getElementById('mbMore60');
    if(!pop){
      pop=document.createElement('div');pop.id='mbMore60';pop.hidden=true;
      pop.setAttribute('role','group');pop.setAttribute('aria-label','Mais ferramentas da mesa');
      var btn=document.createElement('button');
      btn.type='button';btn.className='btn small';btn.id='mbMoreBtn60';
      btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','mbMore60');
      btn.title='Música, imagens, Perseus, Arcade e transmissão';btn.textContent='⋯ Mais';
      btn.onclick=function(e){e.stopPropagation();moreSet(!moreOpen())};
      bar.appendChild(btn);bar.appendChild(pop);
      document.addEventListener('click',function(e){
        if(moreOpen()&&!pop.contains(e.target)&&e.target!==btn)moreSet(false);
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape'&&moreOpen()){moreSet(false);btn.focus()}
      });
    }
    MORE_SEL.forEach(function(sel){
      var g=bar.querySelector(':scope > '+sel);
      if(g&&g.parentNode!==pop)pop.appendChild(g);
    });
  }

  function ensureMesaTools(){
    var bar=document.getElementById('mesaBar');
    if(bar&&!document.getElementById('mbShell60')){
      var g=document.createElement('div');
      g.id='mbShell60';g.className='mb-group mb-shell60';
      g.innerHTML='<span class="mb-live60" title="Sincronizado em tempo real"><i></i>Ao vivo</span>'+
                  '<button type="button" class="btn small" id="mbSeats60" title="Mostrar ou ocultar cartões dos jogadores">Jogadores</button>'+
                  '<button type="button" class="btn small" id="mbDock60" title="Mostrar ou ocultar painel de combate, rolagens, chat e notas">Painel</button>'+
                  '<button type="button" class="btn small" id="mbFocus60" title="Modo Foco: mapa em tela máxima (Alt+F)">⛶ Foco</button>';
      bar.appendChild(g);

      document.getElementById('mbSeats60').onclick=function(){
        if(focusMode){focusMode=false;lsSet('seats','1');applyMesa();return}
        var next=!seatsOn();
        lsSet('seats',next?'1':'0');
        /* Em telas médias, evita espremer o mapa abrindo tudo ao mesmo tempo */
        if(next&&window.innerWidth<1260&&dockOn())lsSet('dock','0');
        applyMesa();
      };
      document.getElementById('mbDock60').onclick=function(){
        if(focusMode){focusMode=false;lsSet('dock','1');applyMesa();return}
        var next=!dockOn();
        lsSet('dock',next?'1':'0');
        if(next&&window.innerWidth<1260&&seatsOn())lsSet('seats','0');
        applyMesa();
      };
      document.getElementById('mbFocus60').onclick=toggleFocus;
      applyMesa();
    }

    adoptMore();

    /* Alternador mobile limpo (Painel vs Jogadores) logo abaixo do mapa */
    var center=document.getElementById('mesaCenter');
    var dock=document.getElementById('mesaDock');
    if(center&&dock&&!document.getElementById('mesaMobTabs60')){
      var mt=document.createElement('div');
      mt.id='mesaMobTabs60';mt.setAttribute('role','tablist');mt.setAttribute('aria-label','Painéis da mesa');
      mt.innerHTML='<button type="button" role="tab" data-mp="dock">⚔ Painel & Chat</button>'+
                   '<button type="button" role="tab" data-mp="seats">👥 Jogadores</button>';
      center.insertBefore(mt,dock);
      mt.querySelectorAll('button').forEach(function(btn){
        btn.onclick=function(){
          mobPane=btn.dataset.mp;lsSet('mobPane',mobPane);applyMesa();
        };
      });
      applyMesa();
    }
  }

  /* ---- Sincronização de Estado ---- */
  var lastView='';
  function sync(){
    if(!rail)return;
    var k=viewK();
    var shell=(k.indexOf('hub')===0||k.indexOf('sheet')===0);
    var b=document.body;
    b.classList.toggle('has-shell',shell);
    b.classList.toggle('mesa-view',k==='hub:table');
    b.classList.toggle('sheet-view',k.indexOf('sheet')===0);
    rail.hidden=!shell;
    if(!shell){closeMore();return}

    var dk=docOpen();
    b.classList.toggle('doc-open',!!dk);
    var cur={
      mesa:!dk&&k==='hub:table',
      fichas:!dk&&(k==='hub:chars'||k.indexOf('sheet')===0),
      manual:dk==='manual',
      sistema:dk==='sistema',
      bancada:dk==='bancada'
    };
    var cmb=combatOn();
    ITEMS.forEach(function(it){
      var show=it.vis?!!it.vis():true;
      [els[it.id],more&&more.querySelector('[data-mid="'+it.id+'"]')].forEach(function(el){
        if(!el)return;
        el.hidden=!show;
        if(cur[it.id])el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
        if(it.id==='mesa')el.classList.toggle('has-alert',cmb&&!cur.mesa);
      });
    });

    var camp=document.getElementById('rlCamp60');
    if(camp){
      try{
        var c=camp3();
        var n=c&&c.name?c.name:'';
        if(camp.textContent!==n)camp.textContent=n;
      }catch(e){}
    }

    if(k==='hub:table')ensureMesaTools();
    if(k!==lastView){
      lastView=k;
      if(k==='hub:table')applyMesa();
    }
  }

  function start(){
    build();sync();
    var queued=false;
    var q=function(){
      if(queued)return;
      queued=true;
      requestAnimationFrame(function(){
        queued=false;
        try{sync()}catch(e){console.warn('[as60]',e)}
      });
    };
    try{
      new MutationObserver(q).observe(document.body,{
        subtree:true,attributes:true,attributeFilter:['class','hidden']
      });
    }catch(e){}
    document.addEventListener('click',q,true);
    window.addEventListener('resize',q);
    setInterval(q,1200);
    if(mqMobile.addEventListener)mqMobile.addEventListener('change',function(){closeMore();applyMesa()});
    if(lsGet('rail')==='1'&&!mqMobile.matches)rail.classList.add('open');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
