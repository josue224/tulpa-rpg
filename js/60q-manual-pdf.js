/* ==========================================================================
   TULPA RPG — Onda 5 · Exportar Manual (PDF)
   Monta um documento limpo (capa, sumário, capítulos) a partir dos MESMOS dados
   vivos do Manual Vivo (texto base + edições do Mestre + valores de regra em
   vigor + vocações, trilhas, rituais, itens, estados, perícias e vertentes da
   campanha) e chama a impressão do navegador ("Salvar como PDF"). Sem biblioteca
   e sem servidor. Jogador e Mestre exportam o que cada um lê: os controles do
   Mestre e os avisos de reconciliação nunca entram no documento.
   O visual é editorial (preto sobre branco) e não depende da estética ativa.
   Carrega ANTES de js/61-init.js. IIFE: só publica T3.manualPdf.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__pdf60q)return;
  window.__pdf60q=true;

  var cssStr=function(s){return JSON.stringify(String(s)).replace(/</g,'\\3C ').replace(/[\u2028\u2029]/g,' ')};

  var CSS=[
    '*{box-sizing:border-box}',
    'html{font:10pt/1.45 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;color:#000;background:#fff;-webkit-print-color-adjust:economy}',
    'body{margin:0;color:#000;background:#fff;orphans:3;widows:3}',
    'a{color:inherit;text-decoration:none}',
    'p{margin:0 0 5pt}ul,ol{margin:0 0 6pt;padding-left:15pt}li{margin:0 0 2pt}',
    'h1,h2,h3,h4,h5,h6{font-family:"Helvetica Neue",Arial,"Liberation Sans",sans-serif;color:#000;break-after:avoid;page-break-after:avoid;margin:0}',
    /* capa */
    '.cover{min-height:245mm;display:flex;flex-direction:column;justify-content:center;border-top:3pt solid #000;border-bottom:3pt solid #000;padding:18mm 4mm;break-after:page}',
    '.cover .eye{font:700 9pt "Helvetica Neue",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;margin:0 0 10mm}',
    '.cover h1{font-size:34pt;line-height:1.1;margin:0 0 6mm}',
    '.cover .sub{font-size:13pt;margin:0 0 14mm;max-width:130mm}',
    '.cover .camp{font:700 15pt "Helvetica Neue",Arial,sans-serif;margin:0 0 3mm}',
    '.cover .meta{font-size:10pt;margin:0 0 2mm}',
    '.cover .note{font-size:8.5pt;margin-top:14mm;max-width:130mm}',
    /* sumário */
    '.toc{break-after:page}',
    '.toc h2{font-size:20pt;border-bottom:1pt solid #000;padding-bottom:3pt;margin-bottom:8pt}',
    '.toc ol{list-style:none;padding:0;margin:0}',
    '.toc>ol>li{margin:6pt 0 0;break-inside:avoid}',
    '.toc>ol>li>a{font:700 10.5pt "Helvetica Neue",Arial,sans-serif}',
    '.toc ol ol{padding-left:14pt;columns:2;column-gap:14pt}',
    '.toc ol ol li{font-size:9pt;margin:0;break-inside:avoid}',
    '.toc a::after{content:target-counter(attr(href url),page);float:right;font-weight:400}',
    '.toc ol ol a::after{content:none}',
    '@supports not (content:target-counter(attr(href url),page)){.toc a::after{content:none}}',
    /* capítulos */
    '.chap{break-before:page;page-break-before:always}',
    '.chap>h2{font-size:21pt;line-height:1.15;border-bottom:1.5pt solid #000;padding-bottom:4pt;margin:0 0 10pt}',
    '.m31-sec{margin:0 0 8pt}',
    '.m31-h3,h3{font-size:13.5pt;margin:12pt 0 5pt;border-bottom:.5pt solid #777;padding-bottom:2pt}',
    'h4{font-size:11pt;margin:0 0 3pt}h5{font-size:9pt;text-transform:uppercase;letter-spacing:.08em;margin:0 0 3pt}',
    'b,strong{font-weight:700}',
    '.m31-blk,.m31-live{margin:0 0 4pt}',
    '.m31-count,.m31-note{font-size:8.5pt;font-style:italic;margin:0 0 4pt}',
    '.m31-sub{font-size:11pt;margin:8pt 0 4pt}',
    /* tabelas */
    '.m31-tw{overflow:visible;margin:3pt 0 8pt}',
    'table{width:100%;border-collapse:collapse;font-size:8.5pt;line-height:1.3}',
    'thead{display:table-header-group}',
    'td:first-child{min-width:16mm}',
    'th{font:700 8pt "Helvetica Neue",Arial,sans-serif;text-align:left;border-top:1pt solid #000;border-bottom:1pt solid #000;padding:2pt 4pt;vertical-align:bottom}',
    'td{border-bottom:.4pt solid #888;padding:2pt 4pt;vertical-align:top;overflow-wrap:break-word}',
    'tr{break-inside:avoid;page-break-inside:avoid}',
    /* cartões e blocos */
    '.m31-cards,.m31-attrs{display:block}',
    '.m31-card,.m31-track,.m31-rit,.m31-aside,.m31-rules,.m31-subel{display:block;break-inside:avoid;page-break-inside:avoid;border:.5pt solid #555;padding:5pt 7pt;margin:0 0 7pt}',
    '.m31-card header,.m31-track header,.m31-rit header,.m31-perhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:5pt;margin-bottom:3pt}',
    '.m31-perhead{display:block;break-after:avoid;margin:9pt 0 4pt;border-bottom:.5pt solid #999}',
    '.m31-per{margin:0 0 8pt}',
    '.m31-chip{display:inline-block;border:.5pt solid #333;border-radius:3pt;padding:0 3pt;margin:0 3pt 2pt 0;font:700 7.5pt "Helvetica Neue",Arial,sans-serif}',
    '.m31-chips{margin:0 0 3pt}',
    '.m31-desc{font-style:italic}',
    '.m31-meta{font-size:8.5pt;margin:0 0 3pt}.m31-meta span{margin-right:9pt;display:inline-block}',
    '.m31-tal,.m31-stages{margin:0;padding:0 0 0 12pt}',
    '.m31-stages{list-style:none;padding:0}',
    '.m31-stages li{margin:0 0 4pt;break-inside:avoid}',
    '.m31-stg{font:700 8pt "Helvetica Neue",Arial,sans-serif;text-transform:uppercase}',
    '.m31-cost{font-size:8pt;border:.4pt solid #444;padding:0 3pt;border-radius:2pt}',
    '.m31-pot{margin:0}.m31-pot dt{font:700 8.5pt "Helvetica Neue",Arial,sans-serif;margin-top:3pt}.m31-pot dd{margin:0 0 2pt}',
    '.m31-fx{margin:3pt 0 0;font-size:8.5pt}.m31-fx summary{font-weight:700;list-style:none}',
    '.m31-f,pre{font:8.5pt/1.4 "Courier New",Courier,monospace;white-space:pre-wrap;overflow-wrap:anywhere;border-left:2pt solid #000;padding:3pt 0 3pt 8pt;margin:0 0 6pt;break-inside:avoid}',
    '.m31-glitch{margin:4pt 0 8pt;padding:3pt 0 3pt 9pt;border-left:2pt solid #000;font-style:italic;break-inside:avoid}',
    '.m31-aside{border-width:1pt;background:#fff}',
    '.m31-req{border-style:dashed}',
    'svg,img{max-width:12mm;max-height:12mm}',
    'mark{background:none;color:inherit}',
    '.end{margin-top:14pt;font-size:8pt;text-align:center;border-top:.5pt solid #777;padding-top:4pt}'
  ].join('\n');

  /* margens com cabeçalho e rodapé onde o navegador suporta (Chrome 131+, Safari, Firefox recente) */
  function pageCss(camp){
    return '@page{size:A4;margin:19mm 17mm 21mm;'+
      '@top-left{content:'+cssStr('TULPA RPG · Manual Oficial')+';font:8pt "Helvetica Neue",Arial,sans-serif;color:#000;vertical-align:bottom;padding-bottom:3mm;border-bottom:.4pt solid #777}'+
      '@top-right{content:'+cssStr(camp)+';font:8pt "Helvetica Neue",Arial,sans-serif;color:#000;vertical-align:bottom;padding-bottom:3mm;border-bottom:.4pt solid #777}'+
      '@bottom-center{content:"Página " counter(page) " de " counter(pages);font:8pt "Helvetica Neue",Arial,sans-serif;color:#000}}'+
      '@page :first{@top-left{content:none;border:0}@top-right{content:none;border:0}@bottom-center{content:none}}';
  }

  function safe(fn,d){try{return fn()}catch(e){return d}}
  function count(sec){return safe(function(){return list29(sec).filter(function(r){return r.st!=='del'}).length},0)}

  /* corpo do documento: o mesmo HTML do Manual, sem controles do Mestre */
  function bodyParts(){
    var prev={pv:M31.pv,edit:M31.edit,q:M31.q};
    M31.pv=true;M31.edit=null;M31.renderAt=Date.now();
    var chaps=[];
    try{
      var D=man31();
      chapters31().forEach(function(c){
        var h=D.ttl[c.id]!=null?D.ttl[c.id]:c.h;
        var secs=c.secs.map(function(s){return secHtml31(s,c)}).join('');
        if(!secs.replace(/<[^>]*>/g,'').trim())return;
        chaps.push({id:c.id,h:h||'Apresentação',html:secs});
      });
    }finally{M31.pv=prev.pv;M31.edit=prev.edit;M31.q=prev.q}
    return chaps;
  }

  function clean(html){
    var t=document.createElement('template');
    t.innerHTML=html;
    var f=t.content;
    f.querySelectorAll('button:not(.m31-ref),textarea,input,select,script,style,svg.rsym,.m31-gm,.m31-addrow,.gm29,.m31-st,.m31-pop,.m31-edit').forEach(function(e){e.remove()});
    f.querySelectorAll('button.m31-ref').forEach(function(b){b.replaceWith(document.createTextNode(b.textContent))});
    f.querySelectorAll('details').forEach(function(d){d.setAttribute('open','')});
    f.querySelectorAll('[tabindex],[contenteditable]').forEach(function(e){e.removeAttribute('tabindex');e.removeAttribute('contenteditable')});
    var d=document.createElement('div');d.appendChild(f);
    return d;
  }

  function docHtml(){
    var c=safe(function(){return camp3()},null),name=(c&&c.name)||'Campanha';
    var date=new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'});
    var build=(document.querySelector('meta[name="tulpa-build"]')||{}).content||'';
    var chaps=bodyParts();
    var tocItems=[],body='';
    chaps.forEach(function(ch){
      var box=clean('<div>'+ch.html+'</div>');
      var subs=[];
      box.querySelectorAll('.m31-h3').forEach(function(h){
        var sec=h.closest('.m31-sec');
        if(sec&&sec.id)subs.push({id:sec.id,t:h.textContent.trim()});
      });
      tocItems.push({id:'m31-'+ch.id,t:ch.h,subs:subs});
      body+='<section class="chap" id="m31-'+esc(ch.id)+'"><h2>'+esc(ch.h)+'</h2>'+box.firstChild.innerHTML+'</section>';
    });
    var toc='<nav class="toc" aria-label="Sumário"><h2>Sumário</h2><ol>'+tocItems.map(function(it){
      return '<li><a href="#'+esc(it.id)+'">'+esc(it.t)+'</a>'+(it.subs.length?'<ol>'+it.subs.map(function(s){return '<li><a href="#'+esc(s.id)+'">'+esc(s.t)+'</a></li>'}).join('')+'</ol>':'')+'</li>';
    }).join('')+'</ol></nav>';
    var stats=[
      count('attr')?count('attr')+' atributos':'',
      count('pericia')?count('pericia')+' perícias':'',
      count('vert')?count('vert')+' especializações (vertentes)':'',
      count('voc')?count('voc')+' vocações':'',
      count('ritual')?count('ritual')+' rituais':''
    ].filter(Boolean).join(' · ');
    var cover='<header class="cover"><p class="eye">Sistema de Interpretação Teosófica &amp; Realista</p><h1>'+esc(MAN31_TITLE)+'</h1><p class="sub">'+esc(MAN31_SUB)+'</p>'+
      '<p class="camp">Campanha: '+esc(name)+'</p><p class="meta">Edição de '+esc(date)+' · regras, revisão '+esc(String(BASE_REV31))+(build?' · versão do site '+esc(build):'')+'</p>'+
      (stats?'<p class="meta">'+esc(stats)+'</p>':'')+
      '<p class="note">Este documento foi montado a partir do Manual Vivo da campanha: reflete as edições do Mestre e os valores de regra em vigor na data da edição. Se a mesa mudar uma regra depois, exporte de novo.</p></header>';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(MAN31_TITLE+' — '+name)+'</title><style>'+pageCss(name)+'\n'+CSS+'</style></head><body>'+cover+toc+'<main>'+body+'</main><p class="end">Fim do manual · '+esc(name)+' · '+esc(date)+'</p></body></html>';
  }

  /* ---------- impressão ---------- */
  var iOS=function(){return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)};
  function viaBlob(html){
    var h=html.replace('</body>','<script>addEventListener("load",function(){setTimeout(function(){print()},500)})<\/script></body>');
    var url=URL.createObjectURL(new Blob([h],{type:'text/html'}));
    var w=window.open(url,'_blank');
    if(!w)toast('O navegador bloqueou a nova aba. Libere pop-ups para este site e tente de novo.');
    setTimeout(function(){URL.revokeObjectURL(url)},120000);
  }
  function run(){
    var html;
    try{html=docHtml()}
    catch(e){console.warn('[T60q] montar PDF',e);toast('Não consegui montar o PDF agora. Tente de novo.');return}
    if(iOS()){viaBlob(html);return}
    var old=document.getElementById('pdf60Frame');if(old)old.remove();
    var fr=document.createElement('iframe');
    fr.id='pdf60Frame';fr.title='Manual para impressão';fr.setAttribute('aria-hidden','true');
    fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    fr.onload=function(){
      setTimeout(function(){
        try{
          var w=fr.contentWindow;w.focus();
          w.onafterprint=function(){setTimeout(function(){fr.remove()},400)};
          w.print();
        }catch(e){console.warn('[T60q] imprimir',e);fr.remove();viaBlob(html)}
      },300);
    };
    fr.srcdoc=html;
    document.body.appendChild(fr);
    setTimeout(function(){if(fr.isConnected)fr.remove()},180000);
    toast('Preparando o PDF. Na janela de impressão, escolha "Salvar como PDF".');
  }

  T3.manualPdf={run:run,html:docHtml,parts:bodyParts};
})();
