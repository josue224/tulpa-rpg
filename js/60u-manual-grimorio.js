/* ==========================================================================
   TULPA RPG — Onda 4 · Manual Grimório (páginas 3D)
   Uma APRESENTAÇÃO alternativa do Manual Vivo: os mesmos blocos que js/42–44
   já renderizam em #m31content (texto base + edições do Mestre + {{r:id}} em
   vigor + tabelas, vocações, rituais, vertentes…) são clonados e distribuídos
   em páginas de um códice. Nada de texto ou regra é duplicado aqui.

   - Modo Rolagem (Consulta Rápida): o Manual de sempre, intocado. É onde o
     Mestre edita (lápis), reconcilia e onde a busca/Exportar PDF seguem iguais.
   - Modo Grimório (Páginas): leitura fiel em página dupla (>= 1024 px) ou
     página única; virada 3D, índice com número de página real, fitas de
     capítulo, lacre (marcador) e posição lembrada por campanha/usuário.
   Padrão: Grimório em tela >= 768 px (e aparelho não lento); Rolagem no
   celular. A escolha do usuário fica em localStorage `tulpa_manual_modo`.

   Encadeia paint31/go31 (como o js/60p). Carrega ANTES de js/61-init.js.
   IIFE: só publica T3.manualGrim.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__gr60u)return;
  window.__gr60u=true;

  var KMODE='tulpa_manual_modo';
  var G={mode:'',ready:false,busy:false,shown:false,anim:false,animTo:null,pend:null,
    P:[],N:0,max:0,t:0,dbl:false,pw:0,ph:0,W:0,H:0,key:'',lastQ:'',ixN:0,
    chaps:[],secPg:{},chapPg:{},tmr:0,saveT:0,anchor:null,fk:'',sig:'',wired:false};

  /* ---------- utilitários ---------- */
  function $(id){return document.getElementById(id)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function safe(fn,d){try{return fn()}catch(e){return d}}
  function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function reduced(){return safe(function(){return matchMedia('(prefers-reduced-motion: reduce)').matches},false)}
  function sfx(){safe(function(){if(window.T3&&T3.fx)T3.fx('pageTurn')})}
  function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+':'+s.length}
  function gm(){return safe(function(){return isGM6()&&!!camp3()},false)}
  function userKey(p){return 'tulpa_manual_'+p+'_'+safe(function(){return camp3().id},'x')+'_'+safe(function(){return uid3()},'x')}

  /* ---------- cores: papel e tinta derivados da estética, com contraste garantido ---------- */
  var cv=null;
  function parseColor(s){
    s=String(s||'').trim();
    var m=s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+%?))?\s*\)$/i);
    if(m){var a=m[4]==null?1:(/%$/.test(m[4])?parseFloat(m[4])/100:parseFloat(m[4]));return [+m[1],+m[2],+m[3],a]}
    m=s.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
    if(m){var a2=m[4]==null?1:(/%$/.test(m[4])?parseFloat(m[4])/100:parseFloat(m[4]));return [m[1]*255,m[2]*255,m[3]*255,a2]}
    try{
      if(!cv){cv=document.createElement('canvas');cv.width=cv.height=1}
      var c=cv.getContext('2d',{willReadFrequently:true});c.clearRect(0,0,1,1);c.fillStyle='#010203';c.fillStyle=s;c.fillRect(0,0,1,1);
      var d=c.getImageData(0,0,1,1).data;if(d[3]===0)return [0,0,0,0];
      return [d[0]*255/d[3],d[1]*255/d[3],d[2]*255/d[3],d[3]/255];
    }catch(e){return [128,128,128,1]}
  }
  function over(top,base){var a=top[3];return [top[0]*a+base[0]*(1-a),top[1]*a+base[1]*(1-a),top[2]*a+base[2]*(1-a),1]}
  function mix(a,b,t){return [a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t,a[2]*(1-t)+b[2]*t,1]}
  function lin(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}
  function lum(c){return .2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2])}
  function contrast(a,b){var x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+.05)/(lo+.05)}
  function css(c){return 'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')'}
  function resolveVar(host,name,fb){
    var p=document.createElement('span');p.style.cssText='position:absolute;visibility:hidden;color:'+fb;
    p.style.color='var('+name+','+fb+')';host.appendChild(p);var v=getComputedStyle(p).color;p.remove();return parseColor(v);
  }
  /* devolve a assinatura das cores de base: só repinta se mudou */
  function applyPaper(){
    var wrap=$('grWrap'),w=$('man31');if(!wrap||!w)return false;
    var base=parseColor(w.style.getPropertyValue('--m31-base')||getComputedStyle(document.body).backgroundColor);
    if(base[3]<1)base=over(base,[20,22,28,1]);
    var panel=over(resolveVar(wrap,'--panel','#151a21'),base);
    var text=resolveVar(wrap,'--text','#eef2f7'),accent=resolveVar(wrap,'--accent','#b98');
    var dark=lum(panel)<.3;
    var paper=mix(mix(panel,accent,.06),dark?[40,30,18,1]:[236,222,190,1],.16);
    var ink=over(text,paper);
    if(contrast(ink,paper)<7)ink=dark?[243,236,220,1]:[27,22,14,1];
    var ink2=mix(ink,paper,.22);if(contrast(ink2,paper)<5.2)ink2=ink;
    var gold=accent.slice(),i=0;while(contrast(gold,paper)<5&&i++<14)gold=mix(gold,ink,.14);
    var paper2=mix(paper,ink,.07);
    var rule=mix(paper,ink,.32);
    var leather=mix([22,15,10,1],accent,.14),foil=accent.slice();i=0;
    while(contrast(foil,leather)<7&&i++<14)foil=mix(foil,[250,236,190,1],.2);
    var wax=mix(accent,[155,44,36,1],.7);
    var s=wrap.style;
    s.setProperty('--gr-paper',css(paper));s.setProperty('--gr-paper2',css(paper2));
    s.setProperty('--gr-ink',css(ink));s.setProperty('--gr-ink2',css(ink2));s.setProperty('--gr-gold',css(gold));
    s.setProperty('--gr-rule',css(rule));s.setProperty('--gr-leather',css(leather));s.setProperty('--gr-foil',css(foil));
    s.setProperty('--gr-wax',css(wax));s.setProperty('--gr-dark',dark?'1':'0');
    var sig=[css(paper),css(ink),css(gold)].join('|');var ch=sig!==G.sig;G.sig=sig;return ch;
  }

  /* ---------- ornamentos (SVG inline, só currentColor) ---------- */
  var DEFS='<svg class="gr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>'+
    '<symbol id="gr-corner" viewBox="0 0 44 44"><path d="M3 41V13Q3 3 13 3h28M9 41V16Q9 9 16 9h25" fill="none" stroke="currentColor" stroke-width="1"/><path d="M17 17l4 4-4 4-4-4z" fill="currentColor"/><circle cx="3" cy="3" r="2" fill="currentColor"/><path d="M26 3v6M3 26h6" stroke="currentColor" stroke-width="1"/></symbol>'+
    '<symbol id="gr-flourish" viewBox="0 0 200 16"><path d="M2 8h76M122 8h76" fill="none" stroke="currentColor" stroke-width="1"/><path d="M100 2l6 6-6 6-6-6z" fill="currentColor"/><path d="M84 8c6-6 10-6 16 0M116 8c-6 6-10 6-16 0M80 4l4 4-4 4M120 4l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1"/></symbol>'+
    '<symbol id="gr-seal" viewBox="0 0 48 56"><path d="M15 38l-5 16 8-4 4 6 3-18M33 38l5 16-8-4-4 6-3-18" fill="currentColor"/><circle cx="24" cy="24" r="20" fill="currentColor"/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/><path d="M24 13l3 7 7.5 1-5.5 5 1.5 7.5L24 30l-6.5 3.5L19 26l-5.5-5 7.5-1z" fill="#fff" fill-opacity=".75"/></symbol>'+
  '</defs></svg>';
  var DIAG=[
    '<circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="6"/><path d="M50 6v88M6 50h88M19 19l62 62M81 19L19 81"/><path d="M50 14a36 36 0 0 1 36 36" stroke-dasharray="2 2"/><circle cx="50" cy="6" r="3"/>',
    '<rect x="8" y="8" width="84" height="84"/><path d="M8 29h84M8 50h84M8 71h84M29 8v84M50 8v84M71 8v84"/><rect x="29" y="29" width="42" height="21" stroke-dasharray="3 2"/><circle cx="38" cy="40" r="2"/><circle cx="58" cy="36" r="2"/><path d="M60 62l8 6M66 60l-6 10"/>',
    '<path d="M38 10h24M40 10c0 8-14 14-14 34 0 22 10 38 24 38s24-16 24-38c0-20-14-26-14-34"/><path d="M30 40h40M28 56h44M32 70h36" stroke-dasharray="1 3"/><path d="M50 10v72" stroke-dasharray="4 2"/>',
    '<circle cx="50" cy="50" r="40"/><path d="M50 4l6 40 40 6-40 6-6 40-6-40-40-6 40-6z"/><path d="M22 22l56 56M78 22L22 78" stroke-dasharray="2 3"/>',
    '<circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="30"/><path d="M50 8v8M50 84v8M8 50h8M84 50h8M20 20l6 6M74 74l6 6M80 20l-6 6M26 74l-6 6"/><path d="M42 40l8-10 8 10M42 60h16M50 30v40"/>',
    '<path d="M8 20c14-6 22 6 36 0s30-6 48 0M8 36c16 6 24-6 40 0s28 6 44 0M8 52c12-4 26 6 38 0s30-4 46 2M8 68c18 6 22-6 40 0s26 4 44-2"/><path d="M8 84h84M8 8h84v76"/><path d="M20 28l4 4M64 44l5 3M32 60l4 3"/>'
  ];
  function diag(i,cls){return '<svg class="gr-diag '+(cls||'')+'" viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">'+DIAG[((i%DIAG.length)+DIAG.length)%DIAG.length]+'</svg>'}
  function corner(n){return '<svg class="gr-c gr-c'+n+'" viewBox="0 0 44 44" aria-hidden="true" focusable="false"><use href="#gr-corner"/></svg>'}
  var CORNERS=corner(1)+corner(2)+corner(3)+corner(4);

  /* ---------- modo (Grimório x Rolagem) ---------- */
  function defMode(){
    var slow=safe(function(){return (navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)},false);
    return (innerWidth>=768&&!slow)?'grimorio':'rolagem';
  }
  function storedMode(){var v=lsGet(KMODE);return v==='grimorio'||v==='rolagem'?v:''}

  function setMode(m,o){
    o=o||{};if(m!=='grimorio'&&m!=='rolagem')return;
    var w=$('man31');if(!w||!$('grWrap'))return;
    var prev=G.mode;G.mode=m;
    w.classList.toggle('m31-grim',m==='grimorio');
    $('grWrap').inert=(m!=='grimorio');
    qa('[data-gr-mode]',$('grBar')).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.grMode===m))});
    if(o.persist!==false)lsSet(KMODE,m);
    banner();
    if(m==='grimorio'){
      if(prev!=='grimorio'){G.key='';schedule(0)}
      if(o.focus!==false)setTimeout(function(){var s=$('grStage');if(s&&G.mode==='grimorio')s.focus({preventScroll:true})},60);
    }else if(prev==='grimorio'){
      var a=curAnchor();
      if(a&&a.sid&&a.sid.charAt(0)!=='_'&&window.go31)setTimeout(function(){safe(function(){_go31(a.sid)})},60);
      if(o.focus!==false)setTimeout(function(){var mn=$('m31main');if(mn&&G.mode==='rolagem')mn.focus({preventScroll:true})},60);
    }
  }
  function banner(){
    var b=$('grGm');if(!b)return;
    b.hidden=!(G.mode==='grimorio'&&gm());
  }

  /* ---------- interface fixa (barra, palco, controles) ---------- */
  function ensureUi(){
    var w=$('man31');if(!w)return false;
    if($('grWrap'))return true;
    var main=$('m31main'),box=w.querySelector('.m31-box'),body=w.querySelector('.m31-body');
    if(!main||!box||!body)return false;
    var bar=document.createElement('div');bar.id='grBar';bar.className='gr-bar';
    bar.innerHTML='<div class="gr-modes" role="group" aria-label="Modo de leitura do Manual">'+
      '<button type="button" class="gr-mode" data-gr-mode="grimorio" aria-pressed="false" aria-label="Modo Grimório (Páginas)"><span aria-hidden="true">📖</span> <span class="gr-ml">Modo Grimório</span><span class="gr-lg"> (Páginas)</span></button>'+
      '<button type="button" class="gr-mode" data-gr-mode="rolagem" aria-pressed="false" aria-label="Modo Rolagem (Consulta Rápida)"><span aria-hidden="true">📜</span> <span class="gr-ml">Modo Rolagem</span><span class="gr-lg"> (Consulta Rápida)</span></button></div>'+
      '<p class="gr-gmnote sub" id="grGm" hidden>O Grimório é só de leitura. Para editar (✏️), reconciliar textos ou usar a pré-visualização de Player, volte ao <button type="button" class="gr-link" data-gr-mode="rolagem">Modo Rolagem</button>.</p>';
    box.insertBefore(bar,body);
    var wrap=document.createElement('div');wrap.id='grWrap';wrap.className='gr-wrap gr-db';
    wrap.innerHTML=DEFS+
      '<div class="gr-area" id="grArea">'+
        '<div class="gr-stage" id="grStage" tabindex="0" role="group" aria-roledescription="livro" aria-label="Manual em páginas. Use as setas do teclado para virar a página.">'+
          '<div class="gr-book" id="grBook">'+
            '<div class="gr-slot gr-sl" id="grSL"></div><div class="gr-slot gr-sr" id="grSR"></div>'+
            '<span class="gr-spine" aria-hidden="true"></span>'+
            '<div class="gr-edge gr-el" id="grEL" aria-hidden="true"></div><div class="gr-edge gr-er" id="grER" aria-hidden="true"></div>'+
          '</div>'+
        '</div>'+
        '<nav class="gr-tabs" id="grTabs" aria-label="Capítulos do Manual"></nav>'+
      '</div>'+
      '<div class="gr-ctl" id="grCtl">'+
        '<button type="button" class="btn small gr-prev" id="grPrev" aria-label="Página Anterior"><span aria-hidden="true">‹</span> <span class="gr-bt">Página Anterior</span></button>'+
        '<span class="gr-st" id="grSt" aria-hidden="true"></span>'+
        '<button type="button" class="btn small gr-next" id="grNext" aria-label="Próxima Página"><span class="gr-bt">Próxima Página</span> <span aria-hidden="true">›</span></button>'+
        '<button type="button" class="btn small gr-ix" id="grIx" aria-label="Ir ao Índice"><span aria-hidden="true">☰</span> <span class="gr-bt">Índice</span></button>'+
        '<button type="button" class="btn small gr-sealbtn" id="grSeal" aria-pressed="false" aria-label="Lacre: marcar esta página"><svg viewBox="0 0 48 56" width="16" height="18" aria-hidden="true" focusable="false"><use href="#gr-seal"/></svg> <span class="gr-bt">Lacre</span></button>'+
        '<button type="button" class="btn small gr-sealgo" id="grSealGo" hidden><span class="gr-bt">Ir ao lacre</span></button>'+
      '</div>'+
      '<p class="sr-only" id="grLive" aria-live="polite"></p>'+
      '<div class="gr-in gr-measure" id="grMeasure" aria-hidden="true"></div>';
    main.appendChild(wrap);
    wire(w);
    applyPaper();
    var m=storedMode()||defMode();
    setMode(m,{persist:false,focus:false});
    return true;
  }

  function wire(w){
    if(G.wired)return;G.wired=true;
    $('grBar').addEventListener('click',function(e){var b=e.target.closest('[data-gr-mode]');if(b)setMode(b.dataset.grMode)});
    $('grPrev').onclick=function(){step(-1,true)};
    $('grNext').onclick=function(){step(1,true)};
    $('grIx').onclick=function(){goPage(1,{user:true})};
    $('grSeal').onclick=toggleSeal;
    $('grSealGo').onclick=function(){var i=sealIdx();if(i>=0)goPage(i,{user:true})};
    $('grEL').onclick=function(){step(-1,true)};
    $('grER').onclick=function(){step(1,true)};
    var st=$('grStage');
    st.addEventListener('click',function(e){
      var ix=e.target.closest('[data-gr-pg]');if(ix){e.preventDefault();goPage(+ix.dataset.grPg,{user:true});return}
      var a=e.target.closest('a[href^="#"]');if(a){e.preventDefault();var id=(a.getAttribute('href')||'').replace(/^#m31-/,'').replace(/^#/,'');if(id)goSection(id,true)}
    });
    $('grTabs').addEventListener('click',function(e){var b=e.target.closest('[data-gr-chap]');if(b)goPage(G.chapPg[b.dataset.grChap],{user:true})});
    /* deslize do dedo */
    var sx=0,sy=0,stt=0,sOk=false;
    st.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'||!e.isPrimary){sOk=false;return}
      var tw=e.target.closest&&e.target.closest('.m31-tw');
      sOk=!(tw&&tw.scrollWidth>tw.clientWidth+2);sx=e.clientX;sy=e.clientY;stt=Date.now();
    });
    st.addEventListener('pointerup',function(e){
      if(!sOk)return;sOk=false;
      var dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>=48&&Math.abs(dy)<Math.abs(dx)*.7&&Date.now()-stt<1000)step(dx<0?1:-1,true);
    });
    st.addEventListener('pointercancel',function(){sOk=false});
    /* teclado */
    w.addEventListener('keydown',function(e){
      if(G.mode!=='grimorio'||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
      var t=e.target;if(t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]')){
        if(t.id==='m31q'&&e.key==='Enter'&&G.P.length){e.preventDefault();nextHit(e.shiftKey?-1:1)}
        return}
      var sys=$('sys29');if(sys&&!sys.classList.contains('hide'))return;
      var k=e.key;
      if(k==='ArrowRight'||k==='PageDown'){e.preventDefault();step(1,true)}
      else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();step(-1,true)}
      else if(k==='Home'){e.preventDefault();goPage(0,{user:true})}
      else if(k==='End'){e.preventDefault();goPage(G.N-1,{user:true})}
    });
    /* tamanho, orientação, fontes e estética */
    window.addEventListener('resize',function(){schedule(180)});
    window.addEventListener('orientationchange',function(){schedule(260)});
    if(window.ResizeObserver)safe(function(){new ResizeObserver(function(){schedule(160)}).observe(st)});
    if(document.fonts&&document.fonts.addEventListener)safe(function(){document.fonts.addEventListener('loadingdone',function(){schedule(160)})});
    if(window.MutationObserver)safe(function(){new MutationObserver(function(){if(applyPaper()||G.mode==='grimorio')schedule(200)}).observe(document.body,{attributes:true,attributeFilter:['class','data-aesthetic','style','data-ae-glass']})});
  }

  /* ---------- paginação ---------- */
  function schedule(ms){clearTimeout(G.tmr);G.tmr=setTimeout(paginate,ms==null?120:ms)}
  function fontKey(){
    var m=$('grMeasure'),cs=getComputedStyle(m),b=getComputedStyle(document.body);
    return [cs.fontFamily,cs.fontSize,b.getPropertyValue('--f-display'),b.getPropertyValue('--f-ui')].join('|');
  }
  function layout(){
    var wrap=$('grWrap'),st=$('grStage');if(!wrap||!st)return null;
    var dbl=innerWidth>=1024;
    wrap.classList.toggle('gr-sg',!dbl);wrap.classList.toggle('gr-db',dbl);
    var sw=st.clientWidth,sh=st.clientHeight;if(sw<120||sh<160)return null;
    if(dbl&&sw<640){dbl=false;wrap.classList.add('gr-sg');wrap.classList.remove('gr-db');sw=st.clientWidth;sh=st.clientHeight;if(sw<120||sh<160)return null}
    var pw,ph;
    if(dbl){pw=Math.min(Math.floor(sw/2)-2,620,Math.floor((sh-8)*.9));ph=Math.min(sh-8,Math.floor(pw*1.5))}
    else{pw=Math.min(sw-2,640);ph=Math.min(sh-4,Math.floor(pw*1.9))}
    pw=Math.max(240,pw);ph=Math.max(300,ph);
    var px=dbl?34:22,pt=dbl?46:40,pb=dbl?46:40;
    var s=wrap.style;
    s.setProperty('--gr-pw',pw+'px');s.setProperty('--gr-ph',ph+'px');s.setProperty('--gr-n',dbl?'2':'1');
    s.setProperty('--gr-px',px+'px');s.setProperty('--gr-pt',pt+'px');s.setProperty('--gr-pb',pb+'px');
    s.setProperty('--gr-fs',dbl?'.96rem':'.92rem');
    return {dbl:dbl,pw:pw,ph:ph,W:pw-2*px,H:ph-pt-pb};
  }

  function paginate(force){
    var w=$('man31');
    if(G.busy||G.mode!=='grimorio'||!w||w.classList.contains('hide')||!$('grWrap'))return;
    if(G.anim){schedule(300);return}
    var src=$('m31content');if(!src)return;
    var L=layout();if(!L){schedule(250);return}
    var key=[L.dbl,L.pw,L.ph,fontKey(),hashStr(src.innerHTML),G.sig].join('~');
    if(force!==true&&key===G.key&&G.P.length){afterShow(true);return}
    G.busy=true;
    try{
      var keep=G.shown?curAnchor():(G.anchor||loadPos());
      build(L,src);
      G.key=key;
      var idx=resolveAnchor(keep);
      var hit=-1;
      if(M31q()&&M31q()!==G.lastQ){G.lastQ=M31q();hit=firstHit(0,1)}
      else if(!M31q())G.lastQ='';
      if(hit>=0)idx=hit;
      G.shown=false;
      G.t=pageToT(idx);setSlots(G.t);G.shown=true;afterShow();
    }catch(e){
      console.warn('[T60u] paginar',e);
      safe(function(){toast('Não consegui montar as páginas. Abrindo no Modo Rolagem.')});
      setMode('rolagem',{persist:false,focus:false});
    }finally{G.busy=false}
  }
  function M31q(){return safe(function(){return M31.q||''},'')}

  /* limpa o clone: sem controles do Mestre, avisos, ids duplicados nem estados de busca */
  function clean(root){
    qa('.m31-gm,.gm29,.gm29-b,.m31-addrow,.m31-edit,.m31-gone,[class*="rec-"],textarea,input,select,script,style',root).forEach(function(e){e.remove()});
    qa('[id]',root).forEach(function(e){e.removeAttribute('id')});
    qa('.m31-hid',root).forEach(function(e){e.classList.remove('m31-hid')});
    qa('.m31-flash',root).forEach(function(e){e.classList.remove('m31-flash')});
    qa('details',root).forEach(function(d){d.open=true;d.setAttribute('open','')});
    qa('[contenteditable]',root).forEach(function(e){e.removeAttribute('contenteditable')});
    return root;
  }
  function dropCap(c){
    var p=c.querySelector('.m31-blk p');if(!p||p.querySelector('.gr-cap'))return;
    var n=p.firstChild;if(!n||n.nodeType!==3)return;
    var t=n.nodeValue,m=t.match(/^(\s*)([A-Za-zÀ-ÿ])/);if(!m)return;
    var span=document.createElement('span');span.className='gr-cap';span.setAttribute('aria-hidden','true');span.textContent=m[2];
    var sr=document.createElement('span');sr.className='sr-only';sr.textContent=m[2];
    var rest=document.createTextNode(t.slice(m[0].length));
    p.replaceChild(rest,n);p.insertBefore(sr,rest);p.insertBefore(span,sr);
    p.classList.add('gr-dropp');
  }
  function isHead(k){return /^H[1-6]$/.test(k.tagName)||k.classList.contains('m31-perhead')||k.classList.contains('m31-sub')||k.classList.contains('m31-h3')}

  function wrapU(el){var w=document.createElement('div');w.className='gr-u';w.appendChild(el);return w}
  function hOf(w){return Math.ceil(w.getBoundingClientRect().height)}
  function kidsOf(el){return Array.prototype.filter.call(el.childNodes,function(n){return n.nodeType===1||(n.nodeType===3&&n.nodeValue.trim())})}
  /* cadeia de invólucros com um único filho até o miolo (tabela ou contêiner de blocos) */
  function chainOf(el){
    var ch=[el];
    for(;;){var cur=ch[ch.length-1];if(cur.tagName==='TABLE')break;var k=kidsOf(cur);if(k.length===1&&k[0].nodeType===1)ch.push(k[0]);else break}
    return ch;
  }
  function coreOf(el){var ch=chainOf(el);return ch[ch.length-1]}
  function splittable(el){
    if(!el||el.nodeType!==1)return false;
    var core=coreOf(el);
    if(core.tagName==='TABLE')return !!(core.tBodies[0]&&core.tBodies[0].rows.length>1);
    if(/^(P|LI|PRE|SVG|DETAILS|SUMMARY|H[1-6]|BUTTON|SPAN|A|TR|TD|TH|IMG)$/i.test(core.tagName))return false;
    if(core.matches('.m31-chips,.m31-meta,.m31-f,.m31-glitch,.gr-chead'))return false;
    var k=kidsOf(core);if(k.length<2)return false;
    return k.every(function(n){return n.nodeType===1&&!/^(SPAN|A|B|I|EM|STRONG|MARK|SMALL|CODE|BR|SUP|SUB)$/i.test(n.tagName)});
  }
  function contMeta(m){return {cid:m.cid,sid:m.sid}}
  function shellOf(chain,core,tbl){
    var root=chain[0].cloneNode(false),cur=root;
    for(var i=1;i<chain.length;i++){var c=chain[i].cloneNode(false);cur.appendChild(c);cur=c}
    var fill=cur;
    if(tbl){
      Array.prototype.forEach.call(core.children,function(c){if(c.tagName!=='TBODY')cur.appendChild(c.cloneNode(true))});
      fill=core.tBodies[0].cloneNode(false);cur.appendChild(fill);
    }
    return {root:root,fill:fill};
  }
  function mkUnit(root,m,meas){var w=wrapU(root);meas.appendChild(w);return {w:w,el:root,h:hOf(w),m:m}}
  /* corta a unidade (linhas de tabela ou filhos do contêiner) para caber em `room`.
     Devolve {first, rests[]}: `first` cabe na página atual; `rests` voltam à fila. */
  function split(u,room,force,meas){
    var chain=chainOf(u.el),core=chain[chain.length-1],tbl=core.tagName==='TABLE';
    var items=tbl?Array.prototype.slice.call(core.tBodies[0].rows):kidsOf(core);
    var f=shellOf(chain,core,tbl),fw=wrapU(f.root);meas.appendChild(fw);
    var taken=0,deep=false;
    for(var i=0;i<items.length;i++){
      f.fill.appendChild(items[i]);
      if(hOf(fw)>room){
        if(i===0&&force){
          /* o primeiro item sozinho já passa da página: tenta quebrá-lo por dentro */
          if(!tbl){var t=shellOf(chain,core,false);t.fill.appendChild(items[0]);
            if(splittable(t.root)){deep=true;taken=0;break}
            f.fill.appendChild(items[0])}
          taken=1;
        }else{f.fill.removeChild(items[i]);taken=i}
        break;
      }
      taken=i+1;
    }
    if(u.w.parentNode)u.w.parentNode.removeChild(u.w);
    var mm=contMeta(u.m),rests=[];
    if(deep){
      fw.remove();
      var a=shellOf(chain,core,false);a.fill.appendChild(items[0]);rests.push(mkUnit(a.root,u.m,meas));
      if(items.length>1){var rr=shellOf(chain,core,tbl);items.slice(1).forEach(function(x){rr.fill.appendChild(x)});rests.push(mkUnit(rr.root,mm,meas))}
      return {first:null,rests:rests};
    }
    if(taken<items.length){var r=shellOf(chain,core,tbl);items.slice(taken).forEach(function(x){r.fill.appendChild(x)});rests.push(mkUnit(r.root,mm,meas))}
    if(taken===0){fw.remove();return {first:null,rests:rests}}
    return {first:{w:fw,el:f.root,h:hOf(fw),m:u.m},rests:rests};
  }

  /* distribui as unidades (alturas reais medidas) em páginas de altura H */
  function flow(q,H,meas,onPush){
    var pages=[],cur=null,used=0,i=0;
    function np(){cur={u:[],m:null,tall:false};used=0}
    function brk(){if(cur.u.length)pages.push(cur);np()}
    function push(u){
      cur.u.push(u.w);if(!cur.m)cur.m=u.m;used+=u.h;
      if(u.h>H)cur.tall=true;
      if(onPush)onPush(u,pages.length);
    }
    np();
    while(i<q.length){
      var u=q[i++];
      if(u.m.brk&&cur.u.length)brk();
      var room=H-used,nx=q[i],need=u.h+(u.m.head&&nx?Math.min(nx.h,90):0);
      if(need<=room){push(u);continue}
      if(u.m.head&&cur.u.length&&u.h<=room){brk();i--;continue}
      if(u.h<=room){push(u);continue}
      if(splittable(u.el)){
        var r=split(u,room,used===0,meas);
        if(r.first){push(r.first);if(r.rests.length){brk();q.splice.apply(q,[i,0].concat(r.rests))}continue}
        if(cur.u.length){brk();q.splice.apply(q,[i,0].concat(r.rests.length?r.rests:[u]));continue}
        if(r.rests.length){q.splice.apply(q,[i,0].concat(r.rests));continue}
      }
      if(cur.u.length){brk();i--;continue}
      cur.tall=true;push(u);brk();
    }
    if(cur.u.length)pages.push(cur);
    return pages;
  }

  function chapHead(ttl,n,i,intro){
    var d=document.createElement('div');d.className='gr-chead';
    d.innerHTML='<p class="gr-eyebrow">'+(intro?'Prólogo':'Capítulo '+n)+'</p><h2 class="gr-h2">'+esc(ttl)+'</h2><svg class="gr-flourish" viewBox="0 0 200 16" aria-hidden="true" focusable="false"><use href="#gr-flourish"/></svg>'+diag(i,'gr-chdiag');
    return d;
  }

  function build(L,src){
    var meas=$('grMeasure');meas.textContent='';meas.style.width=L.W+'px';
    G.dbl=L.dbl;G.pw=L.pw;G.ph=L.ph;G.W=L.W;G.H=L.H;
    var units=[],chaps=[],nc=0;
    function add(el,m){var w=wrapU(el);meas.appendChild(w);var u={w:w,el:el,h:0,m:m};units.push(u);return u}
    Array.prototype.forEach.call(src.children,function(ce){
      if(!ce.classList||!ce.classList.contains('m31-chap'))return;
      var cid=ce.dataset.chap||('c'+chaps.length),intro=cid==='intro',c=clean(ce.cloneNode(true));
      var h2=c.querySelector(':scope > .m31-h2'),ttl=h2?h2.textContent.replace(/✏️/g,'').trim():'Apresentação';
      if(h2)h2.remove();
      if(!c.textContent.trim())return;
      var n=intro?0:++nc;chaps.push({id:cid,t:ttl,n:n,i:chaps.length});
      dropCap(c);
      add(chapHead(ttl,n,chaps.length-1,intro),{cid:cid,sid:cid,brk:true,head:true,t:ttl,lvl:0,ent:1});
      Array.prototype.forEach.call(c.children,function(sec){
        if(!sec.classList.contains('m31-sec')){add(sec,{cid:cid,sid:cid});return}
        var sid=sec.dataset.sec||cid;
        Array.prototype.slice.call(sec.children).forEach(function(k){
          var m={cid:cid,sid:sid,head:isHead(k)};
          if(k.classList.contains('m31-h3')){var cl=k.cloneNode(true);qa('.m31-st',cl).forEach(function(x){x.remove()});m.t=cl.textContent.trim();m.lvl=1;m.ent=!!m.t}
          add(k,m);
        });
      });
    });
    units.forEach(function(u){u.h=hOf(u.w)});
    var ents=[],secPg={},chapPg={};
    var cpages=flow(units.slice(),L.H,meas,function(u,pi){
      var m=u.m;
      if(m.sid&&secPg[m.sid]==null)secPg[m.sid]=pi;
      if(m.cid&&chapPg[m.cid]==null)chapPg[m.cid]=pi;
      if(m.ent&&m.t)ents.push({lvl:m.lvl,t:m.t,pg:pi,sid:m.sid,cid:m.cid});
    });
    meas.textContent='';
    /* índice do códice: paginado à parte; os números entram depois que se sabe quantas páginas ele tem */
    var ixq=[];
    meas.textContent='';
    function addIx(el,m){var w=wrapU(el);meas.appendChild(w);var u={w:w,el:el,h:0,m:m};ixq.push(u)}
    var hd=document.createElement('div');hd.className='gr-chead gr-ixhead';
    hd.innerHTML='<p class="gr-eyebrow">Códice</p><h2 class="gr-h2">Índice</h2><svg class="gr-flourish" viewBox="0 0 200 16" aria-hidden="true" focusable="false"><use href="#gr-flourish"/></svg>';
    addIx(hd,{head:true});
    var nums=[];
    ents.forEach(function(e){
      var b=document.createElement('button');b.type='button';b.className='gr-ixe gr-ixl'+e.lvl;
      b.innerHTML='<span class="gr-ixt">'+esc(e.t)+'</span><span class="gr-ixd" aria-hidden="true"></span><span class="gr-ixn">000</span>';
      b.setAttribute('aria-label',e.t+', página');
      nums.push({b:b,pg:e.pg});
      addIx(b,{cid:'__ix',sid:'__ix'});
    });
    ixq.forEach(function(u){u.h=hOf(u.w)});
    var ixpages=flow(ixq.slice(),L.H,meas,null);
    meas.textContent='';
    var off=1+ixpages.length;
    nums.forEach(function(x){var n=x.pg+off+1;x.b.querySelector('.gr-ixn').textContent=String(n);x.b.dataset.grPg=String(x.pg+off);x.b.setAttribute('aria-label',x.b.querySelector('.gr-ixt').textContent+', página '+n)});
    var P=[{kind:'cover',u:[],sid:'__cv',cid:'__cv',el:null}];
    ixpages.forEach(function(p,i){P.push({kind:'ix',u:p.u,sid:'__ix',cid:'__ix',tall:p.tall,el:null,ixi:i})});
    var rh={};chaps.forEach(function(c){rh[c.id]=c.t});
    cpages.forEach(function(p){P.push({kind:'c',u:p.u,sid:p.m&&p.m.sid,cid:p.m&&p.m.cid,tall:p.tall,el:null,rh:rh[p.m&&p.m.cid]||'',mk:p.u.some(function(x){return !!x.querySelector('mark.m31-hl')})})});
    G.P=P;G.N=P.length;G.ixN=ixpages.length;
    G.max=G.dbl?Math.ceil((G.N-1)/2):G.N-1;
    G.secPg={'__cv':0,'__ix':1};
    Object.keys(secPg).forEach(function(k){G.secPg[k]=secPg[k]+off});
    G.chapPg={};Object.keys(chapPg).forEach(function(k){G.chapPg[k]=chapPg[k]+off});
    G.chaps=chaps;
    buildTabs();
  }

  function buildTabs(){
    var nav=$('grTabs');if(!nav)return;
    nav.innerHTML=G.chaps.map(function(c){
      var lbl=c.n?String(c.n):'P';
      return '<button type="button" class="gr-tab" data-gr-chap="'+esc(c.id)+'" aria-label="'+esc((c.n?'Capítulo '+c.n+': ':'')+c.t)+'" title="'+esc(c.t)+'"><span class="gr-tabn" aria-hidden="true">'+lbl+'</span><span class="gr-tabt" aria-hidden="true">'+esc(c.t.replace(/^\d+\.\s*/,'').split(/\s+/)[0])+'</span></button>';
    }).join('');
  }

  /* ---------- páginas e posições ---------- */
  function pageToT(i){return G.dbl?Math.ceil(Math.max(0,i)/2):Math.max(0,i)}
  function tToIdx(t){return G.dbl?(t===0?0:2*t-1):t}
  function blank(){var e=document.createElement('article');e.className='gr-page gr-blank';e.setAttribute('aria-hidden','true');e.innerHTML=CORNERS;return e}
  function sealIdx(){
    var s=safe(function(){return JSON.parse(lsGet(userKey('lacre'))||'null')},null);if(!s||!G.N)return -1;
    return resolveAnchor(s);
  }
  function buildEl(i){
    var p=G.P[i];if(!p)return blank();if(p.el)return p.el;
    var el=document.createElement('article');el.className='gr-page'+(p.kind==='cover'?' gr-cover':'');
    el.setAttribute('role','group');el.setAttribute('aria-roledescription','página');el.setAttribute('aria-label','Página '+(i+1)+' de '+G.N);
    el.dataset.grI=String(i);
    var h='<div class="gr-orn" aria-hidden="true">'+CORNERS+'</div>';
    if(p.kind==='cover'){
      var cvr=$('man31').querySelector('.m31-cover'),g=function(s){var n=cvr&&cvr.querySelector(s);return n?n.textContent.trim():''};
      h+='<div class="gr-in gr-cvin">'+diag(0,'gr-emblem')+'<p class="gr-eyebrow">'+esc(g('.m31-eyebrow'))+'</p><h1 class="gr-cvt">'+esc(g('h1'))+'</h1><svg class="gr-flourish" viewBox="0 0 200 16" aria-hidden="true" focusable="false"><use href="#gr-flourish"/></svg><p class="gr-cvs">'+esc(g('.m31-coversub'))+'</p><p class="gr-cvc">'+esc(g('.m31-camp'))+'</p></div>';
    }else{
      var sid=p.sid&&p.sid.charAt(0)!=='_'?p.sid:'',note=sid?('§ '+(sid.replace(/^c/,'').replace(/^intro.*/,'Prólogo'))):(p.kind==='ix'?'Índice':'');
      h+='<div class="gr-rh" aria-hidden="true"><span class="gr-rhl">Manual Vivo</span><span class="gr-rhr">'+esc(p.kind==='ix'?'Índice':(p.rh||''))+'</span></div>'+
         '<div class="gr-in'+(p.tall?' gr-tall':'')+'"></div>'+
         '<div class="gr-folio" aria-hidden="true">'+(i+1)+'</div>'+
         (note?'<div class="gr-mnote" aria-hidden="true">'+esc(note)+'</div>':'');
    }
    h+='<svg class="gr-seal" viewBox="0 0 48 56" aria-hidden="true" focusable="false"><use href="#gr-seal"/></svg><span class="gr-shade" aria-hidden="true"></span>';
    el.innerHTML=h;
    if(p.kind!=='cover'){
      var inn=el.querySelector('.gr-in');p.u.forEach(function(w){inn.appendChild(w)});
      if(p.tall){inn.tabIndex=0;inn.setAttribute('role','region');inn.setAttribute('aria-label','Conteúdo desta página; role para ver tudo')}
    }
    p.el=el;
    return el;
  }
  function put(slot,el,left){
    while(slot.firstChild)slot.removeChild(slot.firstChild);
    el.classList.toggle('gr-v',!!left);el.classList.toggle('gr-r',!left);
    slot.appendChild(el);
  }
  function pgEl(i){return (i<0||i>=G.N)?blank():buildEl(i)}
  function setSlots(t){
    var SL=$('grSL'),SR=$('grSR');
    if(G.dbl){put(SL,t===0?blank():pgEl(2*t-1),true);put(SR,pgEl(2*t),false)}
    else{while(SL.firstChild)SL.removeChild(SL.firstChild);put(SR,pgEl(t),false)}
  }

  function curIdx(){return G.N?Math.min(G.N-1,tToIdx(G.t)):0}
  function curAnchor(){
    var i=curIdx(),p=G.P[i];if(!p)return G.anchor;
    var sid=p.sid||'__cv';return {sid:sid,off:i-(G.secPg[sid]!=null?G.secPg[sid]:i),i:i};
  }
  function loadPos(){return safe(function(){return JSON.parse(lsGet(userKey('pos'))||'null')},null)}
  function resolveAnchor(a){
    if(!a||!G.N)return 0;
    var i=0;
    if(a.sid&&G.secPg[a.sid]!=null)i=G.secPg[a.sid]+(+a.off||0);
    else if(typeof a.i==='number')i=a.i;
    return Math.max(0,Math.min(G.N-1,i));
  }
  function savePos(){
    clearTimeout(G.saveT);
    G.saveT=setTimeout(function(){var a=curAnchor();if(a)lsSet(userKey('pos'),JSON.stringify({sid:a.sid,off:a.off,i:a.i}))},500);
  }

  /* ---------- navegação ---------- */
  function baseT(){return G.pend?G.pend.t:(G.anim&&G.animTo!=null?G.animTo:G.t)}
  function step(d,user){go(baseT()+d,{user:user})}
  function goPage(i,o){if(i==null||isNaN(i)||!G.N)return;go(pageToT(Math.max(0,Math.min(G.N-1,i))),o)}
  function goSection(id,user){
    var i=G.secPg[id];if(i==null)i=G.chapPg[id];
    if(i==null)return false;
    goPage(i,{user:user});return true;
  }
  function firstHit(from,dir){
    var n=G.N;if(!n)return -1;
    for(var k=0;k<n;k++){var i=(((from+dir*k)%n)+n)%n;if(G.P[i].mk)return i}
    return -1;
  }
  function nextHit(dir){
    var cur=curIdx(),vis=G.dbl&&cur>0?[cur,cur+1]:[cur],i=-1;
    for(var k=1;k<=G.N;k++){var j=(((cur+dir*k)%G.N)+G.N)%G.N;if(G.P[j].mk&&vis.indexOf(j)<0){i=j;break}}
    if(i>=0)goPage(i,{user:true});
  }
  function popHide(){safe(function(){pop31(null)})}

  function go(t,o){
    o=o||{};if(!G.N||G.busy)return;
    t=Math.max(0,Math.min(G.max,t));
    if(G.anim){G.pend={t:t,o:o};return}
    if(G.shown&&t===G.t)return;
    var vis=$('grStage')&&$('grStage').clientWidth>0;
    if(o.user)sfx();
    if(!G.shown||!vis||o.instant){setSlots(t);G.t=t;G.shown=true;afterShow();return}
    if(reduced()){setSlots(t);G.t=t;fade();afterShow();return}
    flip(t);
  }
  function fade(){
    var b=$('grBook');if(b&&b.animate)safe(function(){b.animate([{opacity:.0},{opacity:1}],{duration:120,easing:'ease-out'})});
  }

  function mkFace(cls,shadeCls){
    var f=document.createElement('div');f.className='gr-face '+cls;
    var s=document.createElement('span');s.className='gr-sh '+shadeCls;s.setAttribute('aria-hidden','true');
    return {f:f,s:s};
  }
  function flip(t2){
    var book=$('grBook'),SL=$('grSL'),SR=$('grSR'),fwd=t2>G.t;
    if(!book.animate){setSlots(t2);G.t=t2;afterShow();return}
    G.anim=true;G.animTo=t2;popHide();
    var leaf=document.createElement('div');leaf.className='gr-leaf '+(G.dbl?(fwd?'gr-lf':'gr-lb'):'gr-lone '+(fwd?'gr-lf':'gr-lb'));
    leaf.setAttribute('aria-hidden','true');leaf.inert=true;
    var front=mkFace('gr-front','gr-shf'),back=mkFace('gr-back','gr-shb');
    leaf.appendChild(front.f);front.f.appendChild(front.s);
    var cast=document.createElement('span');cast.className='gr-cast '+(fwd?'gr-castr':'gr-castl');cast.setAttribute('aria-hidden','true');
    var finish;
    var kf,dur=700;
    if(G.dbl){
      leaf.appendChild(back.f);back.f.appendChild(back.s);
      if(fwd){
        var cur=SR.firstElementChild||blank();front.f.insertBefore(cur,front.s);cur.classList.add('gr-r');cur.classList.remove('gr-v');
        var l2=t2===0?blank():pgEl(2*t2-1);l2.classList.add('gr-v');l2.classList.remove('gr-r');back.f.insertBefore(l2,back.s);
        put(SR,pgEl(2*t2),false);
        kf=[{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}];
        finish=function(){put(SL,l2,true)};
      }else{
        var cl=SL.firstElementChild||blank();front.f.insertBefore(cl,front.s);cl.classList.add('gr-v');cl.classList.remove('gr-r');
        var r2=pgEl(2*t2);r2.classList.add('gr-r');r2.classList.remove('gr-v');back.f.insertBefore(r2,back.s);
        put(SL,t2===0?blank():pgEl(2*t2-1),true);
        kf=[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}];
        finish=function(){put(SR,r2,false)};
      }
    }else{
      if(fwd){
        var c1=SR.firstElementChild||blank();front.f.insertBefore(c1,front.s);
        put(SR,pgEl(t2),false);
        kf=[{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY(-70deg)',opacity:.92,offset:.55},{transform:'rotateY(-104deg)',opacity:0}];
        finish=function(){};
      }else{
        var tg=pgEl(t2);front.f.insertBefore(tg,front.s);
        kf=[{transform:'rotateY(-104deg)',opacity:0},{transform:'rotateY(-70deg)',opacity:.92,offset:.45},{transform:'rotateY(0deg)',opacity:1}];
        finish=function(){put(SR,tg,false)};
      }
    }
    book.appendChild(cast);book.appendChild(leaf);
    var done=false,tm;
    function end(){
      if(done)return;done=true;clearTimeout(tm);
      safe(finish);leaf.remove();cast.remove();
      G.t=t2;G.anim=false;G.animTo=null;G.shown=true;afterShow();
      if(G.pend){var p=G.pend;G.pend=null;go(p.t,p.o)}
    }
    var a=leaf.animate(kf,{duration:dur,easing:'ease-in-out',fill:'forwards'});
    a.onfinish=end;a.oncancel=end;
    tm=setTimeout(end,dur+500);
    var eo={duration:dur,easing:'ease-in-out',fill:'forwards'};
    safe(function(){front.s.animate(fwd?[{opacity:0},{opacity:.6,offset:.5},{opacity:.6}]:[{opacity:.6},{opacity:.6,offset:.5},{opacity:0}],eo)});
    safe(function(){back.s.animate(fwd?[{opacity:.6},{opacity:.6,offset:.5},{opacity:0}]:[{opacity:0},{opacity:.6,offset:.5},{opacity:.6}],eo)});
    safe(function(){cast.animate([{opacity:0},{opacity:.5,offset:.45},{opacity:0}],eo)});
  }

  /* estado visível: texto de status, leitor de tela, fitas, lacre e posição lembrada */
  function afterShow(quiet){
    if(!G.N)return;
    var t=G.t,N=G.N,txt;
    var a=tToIdx(t),b=G.dbl&&t>0?a+1:-1;
    if(b>=N)b=-1;
    var ct=(G.P[Math.min(N-1,Math.max(0,a))]||{}).rh||'';
    if(b>=0)txt='Páginas '+(a+1)+' e '+(b+1)+' de '+N;else txt='Página '+(a+1)+' de '+N;
    var st=$('grSt');if(st)st.textContent=txt;
    if(!quiet){var lv=$('grLive');if(lv)lv.textContent=txt+(ct?' — '+ct:'')}
    $('grPrev').disabled=t<=0;$('grNext').disabled=t>=G.max;
    var cur=G.P[a],cid=cur&&cur.cid;
    qa('.gr-tab',$('grTabs')).forEach(function(x){if(x.dataset.grChap===cid)x.setAttribute('aria-current','true');else x.removeAttribute('aria-current')});
    var sl=sealIdx();
    G.P.forEach(function(p,i){if(p.el)p.el.classList.toggle('gr-sealed',i===sl)});
    var on=(sl>=0&&sl===a);
    var sb=$('grSeal');sb.setAttribute('aria-pressed',String(on));sb.setAttribute('aria-label',on?'Lacre: retirar desta página':'Lacre: marcar esta página');
    var go2=$('grSealGo');go2.hidden=sl<0||on;if(sl>=0)go2.querySelector('.gr-bt').textContent='Ir ao lacre (p. '+(sl+1)+')';
    var el=$('grEL'),er=$('grER');el.hidden=t<=0;er.hidden=t>=G.max;
    G.anchor=curAnchor();savePos();
    var af=document.activeElement;
    if(G.mode==='grimorio'&&(!af||af===document.body||!document.contains(af)))safe(function(){$('grStage').focus({preventScroll:true})});
  }
  function toggleSeal(){
    if(!G.N)return;
    var a=tToIdx(G.t),sl=sealIdx(),k=userKey('lacre');
    if(sl===a){safe(function(){localStorage.removeItem(k)});say('Lacre retirado.')}
    else{var p=G.P[a],sid=p.sid||'__cv';lsSet(k,JSON.stringify({sid:sid,off:a-(G.secPg[sid]!=null?G.secPg[sid]:a),i:a}));say('Lacre colocado na página '+(a+1)+'.')}
    afterShow(true);
  }
  function say(s){var lv=$('grLive');if(lv)lv.textContent=s}

  /* ---------- encadeia no Manual ---------- */
  function onPaint(){
    if(!ensureUi())return;
    if(safe(function(){return !!M31.edit},false)&&G.mode==='grimorio')setMode('rolagem',{persist:false,focus:false});
    banner();
    if(G.mode==='grimorio'){
      schedule(60);
      var af=document.activeElement;
      if(af&&af.id==='m31main')setTimeout(function(){if(G.mode==='grimorio'&&$('grStage'))$('grStage').focus({preventScroll:true})},40);
    }
  }
  var _paint=paint31;
  paint31=function(){
    var out=_paint.apply(this,arguments);
    try{onPaint()}catch(e){console.warn('[T60u] pintar',e)}
    return out;
  };
  var _go31=go31;
  go31=function(id){
    if(G.mode==='grimorio'&&$('grWrap')&&G.N){if(goSection(String(id),true))return}
    return _go31.apply(this,arguments);
  };
  safe(function(){M6.hooks.leave.push(function(){G.P=[];G.N=0;G.key='';G.shown=false;G.anchor=null;G.lastQ=''})});

  T3.manualGrim={
    setMode:setMode,go:go,goPage:goPage,goSection:goSection,step:step,repaginate:function(){paginate(true)},
    state:function(){return {mode:G.mode,dbl:G.dbl,t:G.t,max:G.max,pages:G.N,index:G.ixN,pw:G.pw,ph:G.ph,anim:G.anim,chaps:G.chaps.map(function(c){return {id:c.id,t:c.t,pg:G.chapPg[c.id]}}),secPg:G.secPg}},
    defMode:defMode
  };
})();
