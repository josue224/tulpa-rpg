/* ==========================================================================
   TULPA RPG — Onda 1 · App Shell (navegação) + painéis retráteis da Mesa
   Carrega ANTES de js/61-init.js. Não altera regras de negócio, combate nem
   Supabase: só dispara as funções/botões que já existem (T3.*, #openTable…).
   Tudo fica dentro de uma IIFE para não criar nomes globais novos.
   ========================================================================== */
(function(){
  if(window.__as60)return;window.__as60=true;

  var LS='t60b.';
  function lsGet(k){try{return localStorage.getItem(LS+k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(LS+k,v)}catch(e){}}
  var mqMobile=window.matchMedia?window.matchMedia('(max-width:860px)'):{matches:false,addEventListener:function(){}};

  /* ---- ícones (traço, herdam currentColor das estéticas) ---- */
  var IC={
    mesa:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    fichas:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
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

  /* ---- helpers seguros (funções globais do app podem ainda não existir) ---- */
  function viewK(){try{return viewKey()}catch(e){return 'home'}}
  function inCamp(){try{return !!camp3()}catch(e){return false}}
  function say(m){try{toast(m)}catch(e){}}
  function isGM(){try{return !!isGM6()}catch(e){return false}}
  function arcOK(){try{return typeof T3.canAccessArcade==='function'?!!T3.canAccessArcade():true}catch(e){return true}}
  function press(id){var b=document.getElementById(id);if(b)b.click()}

  /* Manual e Alterações são "abas": enquanto uma está aberta a tela de baixo some (body.doc-open) */
  function docOpen(){
    var m=document.getElementById('man31'),y=document.getElementById('sys29');
    if(m&&!m.classList.contains('hide')&&m.offsetWidth)return 'manual';
    if(y&&!y.classList.contains('hide')&&y.offsetWidth)return 'sistema';
    return '';
  }
  function closeDocs(){
    var m=document.getElementById('man31'),y=document.getElementById('sys29');
    if(m&&!m.classList.contains('hide'))press('m31x');
    if(y&&!y.classList.contains('hide'))press('sys29x');
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

  /* ---- destinos: cada um só aciona o que o app já tinha ---- */
  var ITEMS=[
    {id:'mesa',   label:'Mesa',               group:'a', go:function(){if(needCamp()&&ensureHub())press('openTable')}},
    {id:'fichas', label:'Fichas',             group:'a', go:function(){if(needCamp()&&ensureHub())press('openCharacters')}},
    {id:'manual', label:'Manual Vivo', short:'Manual', group:'a', go:function(){if(needCamp()&&T3.manualOpen)T3.manualOpen()}},
    {id:'arcade', label:'Tulpa Arcade', short:'Arcade', group:'b', go:function(){if(T3.arcGo)T3.arcGo()}, vis:arcOK},
    {id:'perseus',label:'Perseus',            group:'b', more:1, go:function(){if(!needCamp())return;if(T3.petOpen)T3.petOpen('room')}, vis:arcOK},
    {id:'sistema',label:'Alterações do Sistema',group:'c',more:1, go:function(){if(T3.sysOpen)T3.sysOpen()}, vis:isGM},
    {id:'esteticas',label:'Galeria de Estéticas',group:'d',more:1, go:function(){if(T3.openSettings)T3.openSettings()}},
    {id:'voltar', label:'Voltar',             group:'d', more:1, go:function(){if(T3.back)T3.back()}}
  ];

  var rail=null,more=null,moreBtn=null,els={};

  function mkItem(it,inMore){
    var b=document.createElement('button');
    b.type='button';b.className='rl-item';b.dataset.id=it.id;
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
    rail=document.createElement('nav');rail.id='appRail60';rail.hidden=true;rail.setAttribute('aria-label','Navegação principal');

    var brand=document.createElement('button');brand.type='button';brand.className='rl-brand';
    brand.setAttribute('aria-label','Expandir ou recolher a navegação');brand.setAttribute('aria-expanded','false');brand.title='Expandir navegação';
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
    col.title='Recolher navegação';col.setAttribute('aria-label','Recolher navegação');
    col.innerHTML='<span class="rl-ico">'+svg('recolher')+'</span><span class="rl-lbl">Recolher</span>';
    col.onclick=function(){toggleRail()};
    rail.appendChild(col);

    /* celular: botão "Mais" + gaveta com os destinos secundários */
    var mi=document.createElement('button');mi.type='button';mi.className='rl-item rl-more';
    mi.title='Mais opções';mi.setAttribute('aria-label','Mais opções');mi.setAttribute('aria-expanded','false');
    mi.innerHTML='<span class="rl-ico">'+svg('mais')+'</span><span class="rl-lbl">Mais</span>';
    mi.onclick=function(e){e.stopPropagation();toggleMore()};
    moreBtn=mi;
    /* a lista "a" e "b" já ficaram acima; no celular só 'more!=1' aparece, e o "Mais" entra no fim da lista b */
    rail.querySelectorAll('.rl-list')[1].appendChild(li(mi));

    more=document.createElement('div');more.id='appMore60';more.hidden=true;more.setAttribute('role','menu');
    ITEMS.forEach(function(it){
      if(!it.more)return;
      var b=mkItem(it,true);b.dataset.mid=it.id;b.setAttribute('role','menuitem');more.appendChild(b);
    });

    document.body.appendChild(rail);document.body.appendChild(more);

    document.addEventListener('click',function(e){
      if(more&&!more.hidden&&!more.contains(e.target)&&e.target!==moreBtn)closeMore();
      if(rail.classList.contains('open')&&!rail.contains(e.target))collapse();
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){closeMore();collapse()}
    });
  }

  function toggleRail(){
    var on=!rail.classList.contains('open');
    rail.classList.toggle('open',on);lsSet('rail',on?'1':'0');
    var br=rail.querySelector('.rl-brand');if(br){br.setAttribute('aria-expanded',on?'true':'false');br.title=on?'Recolher navegação':'Expandir navegação'}
  }
  function collapse(){if(rail&&rail.classList.contains('open'))rail.classList.remove('open')}
  function toggleMore(){
    var on=more.hidden;more.hidden=!on;moreBtn.setAttribute('aria-expanded',on?'true':'false');
  }
  function closeMore(){if(more&&!more.hidden){more.hidden=true;moreBtn.setAttribute('aria-expanded','false')}}

  /* ---- painéis retráteis da Mesa ---- */
  function seatsOn(){var v=lsGet('seats');if(v==='1')return true;if(v==='0')return false;return mqMobile.matches||window.innerWidth>=1100}
  function dockOn(){
    var v=lsGet('dock');
    if(v==='1')return true;if(v==='0')return false;
    return mqMobile.matches||window.innerWidth>=1500;
  }
  function applyMesa(){
    var b=document.body;
    b.classList.toggle('mesa-seats-off',!seatsOn());
    b.classList.toggle('mesa-dock-on',dockOn());
    var s=document.getElementById('mbSeats60'),d=document.getElementById('mbDock60');
    if(s)s.setAttribute('aria-pressed',seatsOn()?'true':'false');
    if(d)d.setAttribute('aria-pressed',dockOn()?'true':'false');
    try{window.dispatchEvent(new Event('resize'))}catch(e){}
  }
  function ensureMesaTools(){
    var bar=document.getElementById('mesaBar');
    if(!bar||document.getElementById('mbShell60'))return;
    var g=document.createElement('div');g.id='mbShell60';g.className='mb-group mb-shell60';
    g.innerHTML='<button type="button" class="btn small" id="mbSeats60" title="Mostrar ou ocultar os cartões dos jogadores">Jogadores</button>'+
                '<button type="button" class="btn small" id="mbDock60" title="Mostrar ou ocultar combate, rolagens, chat e notas">Painel</button>';
    bar.appendChild(g);
    document.getElementById('mbSeats60').onclick=function(){lsSet('seats',seatsOn()?'0':'1');applyMesa()};
    document.getElementById('mbDock60').onclick=function(){lsSet('dock',dockOn()?'0':'1');applyMesa()};
    applyMesa();
  }

  /* ---- sincroniza estado (tela atual, permissões, item ativo) ---- */
  var last='';
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
    var cur={mesa:!dk&&k==='hub:table',fichas:!dk&&(k==='hub:chars'||k.indexOf('sheet')===0),manual:dk==='manual',sistema:dk==='sistema'};
    ITEMS.forEach(function(it){
      var show=it.vis?!!it.vis():true;
      [els[it.id],more&&more.querySelector('[data-mid="'+it.id+'"]')].forEach(function(el){
        if(!el)return;
        el.hidden=!show;
        if(cur[it.id])el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
      });
    });
    var camp=document.getElementById('rlCamp60');
    if(camp){try{var c=camp3();var n=c&&c.name?c.name:'';if(camp.textContent!==n)camp.textContent=n}catch(e){}}
    if(k==='hub:table')ensureMesaTools();
    if(k!==last){last=k;if(k==='hub:table')applyMesa()}
  }

  function start(){
    build();sync();
    var queued=false;
    var q=function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;try{sync()}catch(e){console.warn('[as60]',e)}})};
    try{new MutationObserver(q).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']})}catch(e){}
    document.addEventListener('click',q,true);
    window.addEventListener('resize',q);
    setInterval(q,700);
    if(mqMobile.addEventListener)mqMobile.addEventListener('change',function(){closeMore();applyMesa()});
    if(lsGet('rail')==='1'&&!mqMobile.matches)rail.classList.add('open');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
