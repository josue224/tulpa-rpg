/* ==========================================================================
   TULPA RPG — Onda 4 · Filtros da vitrine do Tulpa Arcade
   Acrescenta, acima da grade de jogos, uma barra com busca e filtros por modo
   (Solo, Contra o Perseus, Mesa, PvP 1v1). Lê os modos dos próprios botões de
   cada cartão, então jogos novos entram nos filtros sem mexer aqui.
   Observa o #mgRoot: a vitrine é redesenhada a cada volta ao hub, e a barra
   é recriada junto. IIFE estrita, sem variáveis globais. Carrega antes do 61.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__arcFiltros60e)return;
  window.__arcFiltros60e=true;

  var KEY='t60e.arcFilter';
  var MODES=[
    {id:'all',   label:'Todos'},
    {id:'solo',  label:'Solo',            re:/\bsolo\b/i},
    {id:'ia',    label:'Contra o Perseus',re:/contra o perseus/i},
    {id:'mesa',  label:'Mesa',            re:/mesa at[ée]/i},
    {id:'pvp',   label:'PvP 1v1',         re:/pvp/i}
  ];
  var state={mode:'all',q:''};
  try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&MODES.some(function(m){return m.id===s.mode}))state.mode=s.mode}catch(e){}

  function norm(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function modesOf(card){
    if(card._modes)return card._modes;
    var txt=Array.prototype.map.call(card.querySelectorAll('.mg-cbtn .btn,.mg-cbtn button'),function(b){return b.textContent}).join(' | ');
    var m=MODES.filter(function(x){return x.re&&x.re.test(txt)}).map(function(x){return x.id});
    card._modes=m;return m;
  }
  function apply(host){
    var cards=host.querySelectorAll('.mg-card'),shown=0;
    var q=norm(state.q);
    cards.forEach(function(c){
      var okMode=state.mode==='all'||modesOf(c).indexOf(state.mode)>-1;
      var okQ=!q||norm(c.textContent).indexOf(q)>-1;
      var ok=okMode&&okQ;c.hidden=!ok;if(ok)shown++;
    });
    var soon=host.querySelector('.mg-soonh');
    if(soon)soon.hidden=(state.mode!=='all'||!!q);
    var empty=host.querySelector('.af-empty');if(empty)empty.hidden=shown>0;
    var cnt=host.querySelector('.af-count');if(cnt)cnt.textContent=shown+(shown===1?' jogo':' jogos');
    host.querySelectorAll('.af-chip').forEach(function(b){
      var on=b.dataset.mode===state.mode;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
    });
  }
  function counts(host){
    var cards=host.querySelectorAll('.mg-card:not(.soon)');var n={all:cards.length};
    MODES.forEach(function(m){if(m.id!=='all')n[m.id]=0});
    cards.forEach(function(c){modesOf(c).forEach(function(id){n[id]++})});
    return n;
  }
  function build(host){
    var grid=host.querySelector('.mg-grid');if(!grid||host.querySelector('.af-bar'))return;
    var n=counts(host);
    var bar=document.createElement('div');bar.className='af-bar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Filtrar jogos');
    var chips=MODES.filter(function(m){return m.id==='all'||n[m.id]>0}).map(function(m){
      return '<button type="button" class="af-chip" data-mode="'+m.id+'" aria-pressed="false">'+m.label+' <span class="af-n">'+n[m.id]+'</span></button>';
    }).join('');
    bar.innerHTML='<div class="af-chips">'+chips+'</div>'+
      '<label class="af-search"><span class="af-sr">Buscar jogo</span><input type="search" id="afQ" placeholder="Buscar jogo" autocomplete="off" value=""></label>'+
      '<span class="af-count" aria-live="polite"></span>';
    grid.before(bar);
    var empty=document.createElement('div');empty.className='af-empty';empty.hidden=true;
    empty.innerHTML='<p>Nenhum jogo combina com esse filtro.</p><button type="button" class="btn small" data-af="clear">Limpar filtros</button>';
    grid.after(empty);
    bar.addEventListener('click',function(e){
      var b=e.target.closest('.af-chip');if(!b)return;
      state.mode=b.dataset.mode;try{localStorage.setItem(KEY,JSON.stringify({mode:state.mode}))}catch(_){}
      apply(host);
    });
    bar.querySelector('#afQ').addEventListener('input',function(e){state.q=e.target.value;apply(host)});
    empty.addEventListener('click',function(e){
      if(!e.target.closest('[data-af="clear"]'))return;
      state.mode='all';state.q='';bar.querySelector('#afQ').value='';
      try{localStorage.setItem(KEY,JSON.stringify({mode:'all'}))}catch(_){}
      apply(host);
    });
    apply(host);
  }
  var pending=false;
  function scan(){
    pending=false;
    var root=document.getElementById('mgRoot');if(!root)return;
    var host=root.querySelector('.mg-games');if(host)build(host);
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan)}
  function watch(){
    var root=document.getElementById('mgRoot');
    if(!root){new MutationObserver(function(m,o){if(document.getElementById('mgRoot')){o.disconnect();watch()}}).observe(document.body,{childList:true});return}
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
