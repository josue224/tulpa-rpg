/* ==========================================================================
   TULPA RPG — Onda 5 · Reconciliação do Manual Vivo
   O Manual guarda o texto base (js/42) e, por campanha, as edições do Mestre
   (chave "manual": ed = texto por bloco, tbl.tb = tabelas editadas).
   Quando o texto base muda e o Mestre já tinha reescrito aquele trecho, o texto
   dele pode contradizer a regra nova. Esta camada avisa SÓ O MESTRE, mostra a
   diferença e deixa escolher. Nada é apagado: o texto antigo vai para o
   histórico (manual.hist) e volta com "Desfazer".

   Dados novos no mesmo registro "manual" (sem SQL):
     ed[id].br / tbl.tb[id].br  revisão-base em que o Mestre editou (sem marca = 1)
     ack[id]                    revisão em que ele escolheu manter o texto dele
     hist[id]                   até 5 textos antigos: {at,bt,k,t|head+rows,br,ack}
   BASE_REV31 e BASE_CHG31 ficam no js/42. Escritas só pelo Mestre (RLS já cobre).
   Carrega ANTES de js/61-init.js. IIFE: só publica T3.manualRec.
   ========================================================================== */
(function(){
  'use strict';
  if(window.__rec60p)return;
  window.__rec60p=true;

  var HIST_MAX=5;
  var rec={armed:false,open:{},snack:null};

  /* ---------- leitura do texto base ---------- */
  function tbText(head,rows){
    return [head].concat(rows).map(function(r){return r.join(' | ')}).join('\n');
  }
  function baseIndex(){
    var m={},D=man31();
    chapters31().forEach(function(c){
      var ch=D.ttl[c.id]!=null?D.ttl[c.id]:c.h;
      c.secs.forEach(function(s){
        var st=D.ttl[s.id]!=null?D.ttl[s.id]:s.h;
        var where={sec:st||ch,chap:ch};
        (s.b||[]).forEach(function(b){
          if(!b)return;
          var id,o=null;
          if(Array.isArray(b)){id=b[0];o={tx:b[1]}}
          else if(b.live==='turn'||b.live==='doors'){id='live:'+b.live;var d=b.live==='turn'?TURN31:DOORS31;o={tb:true,tx:tbText(d.head,d.rows)}}
          else if(b.live){return}
          else if(b.tb&&b.id){id=b.id;o={tb:true,tx:tbText(b.tb[0],b.tb.slice(1))}}
          else if(b.f!=null&&b.id){id=b.id;o={tx:b.f}}
          else{id=bid31(b);if(!id)return;o={tx:btxt31(b)}}
          o.sec=where.sec;o.chap=where.chap;m[id]=o;
        });
      });
    });
    return m;
  }
  var norm=function(s){return String(s||'').replace(/\s+/g,' ').trim()};

  /* trechos editados antes da revisão em que o texto base mudou, ainda sem resposta do Mestre */
  function pending(){
    var D=man31(),idx=baseIndex(),ack=D.ack||{},out=[];
    var late=function(id,br){var r=BASE_CHG31[id];return !!r&&(Number(br)||1)<r&&(Number(ack[id])||0)<r};
    Object.keys(D.ed||{}).forEach(function(id){
      var ed=D.ed[id],b=idx[id];
      if(!b||b.tb||!ed||!late(id,ed.br))return;
      if(!ed.del&&norm(ed.t)===norm(b.tx))return;
      out.push({id:id,kind:ed.del?'del':'ed',old:ed.del?'':String(ed.t||''),neu:b.tx,sec:b.sec,chap:b.chap});
    });
    var tb=(D.tbl&&D.tbl.tb)||{};
    Object.keys(tb).forEach(function(id){
      var o=tb[id],b=idx[id];
      if(!b||!b.tb||!o||!Array.isArray(o.head)||!Array.isArray(o.rows)||!late(id,o.br))return;
      var old=tbText(o.head,o.rows);
      if(norm(old)===norm(b.tx))return;
      out.push({id:id,kind:'tb',old:old,neu:b.tx,sec:b.sec,chap:b.chap});
    });
    var order=Object.keys(idx);
    out.sort(function(a,b){return order.indexOf(a.id)-order.indexOf(b.id)});
    return out;
  }

  /* ---------- diferença por palavra (LCS), sem biblioteca ---------- */
  function tok(s){return String(s).match(/\n|[^\S\n]+|[^\s]+/g)||[]}
  function diff(a,b){
    var A=tok(a),B=tok(b),p=0,q=0;
    while(p<A.length&&p<B.length&&A[p]===B[p])p++;
    while(q<A.length-p&&q<B.length-p&&A[A.length-1-q]===B[B.length-1-q])q++;
    var x=A.slice(p,A.length-q),y=B.slice(p,B.length-q),mid=[];
    if(x.length*y.length>4000000){
      if(x.length)mid.push({t:'-',s:x.join('')});
      if(y.length)mid.push({t:'+',s:y.join('')});
    }else if(x.length||y.length){
      var n=x.length,m=y.length,w=m+1,L=new Uint16Array((n+1)*w),i,j;
      for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--)L[i*w+j]=x[i]===y[j]?L[(i+1)*w+j+1]+1:Math.max(L[(i+1)*w+j],L[i*w+j+1]);
      i=0;j=0;
      while(i<n&&j<m){
        if(x[i]===y[j]){mid.push({t:'=',s:x[i]});i++;j++}
        else if(L[(i+1)*w+j]>=L[i*w+j+1]){mid.push({t:'-',s:x[i]});i++}
        else{mid.push({t:'+',s:y[j]});j++}
      }
      while(i<n){mid.push({t:'-',s:x[i++]})}
      while(j<m){mid.push({t:'+',s:y[j++]})}
    }
    var ops=[];
    if(p)ops.push({t:'=',s:A.slice(0,p).join('')});
    mid.forEach(function(o){var l=ops[ops.length-1];if(l&&l.t===o.t)l.s+=o.s;else ops.push({t:o.t,s:o.s})});
    if(q){var tail=A.slice(A.length-q).join(''),l=ops[ops.length-1];if(l&&l.t==='=')l.s+=tail;else ops.push({t:'=',s:tail})}
    /* espaço solto entre duas trocas some na leitura: junta tudo numa troca só */
    for(var k=1;k<ops.length-1;k++){
      if(ops[k].t==='='&&!ops[k].s.trim()&&ops[k-1].t!=='='&&ops[k+1].t!=='='){
        var pre=ops[k-1],nx=ops[k+1];
        if(pre.t===nx.t){pre.s+=ops[k].s+nx.s;ops.splice(k,2);k--}
      }
    }
    return ops;
  }
  function diffHtml(old,neu){
    var ops=diff(old,neu);
    return ops.map(function(o){
      if(o.t==='=')return esc(o.s);
      if(o.t==='-')return '<del class="rec-d"><span class="sr-only">[removido: </span>'+esc(o.s)+'<span class="sr-only">]</span></del>';
      return '<ins class="rec-i"><span class="sr-only">[novo: </span>'+esc(o.s)+'<span class="sr-only">]</span></ins>';
    }).join('');
  }

  /* ---------- histórico e gravação ---------- */
  function pushHist(D,id,e){
    D.hist=D.hist||{};
    var l=D.hist[id]=D.hist[id]||[];
    e.at=Date.now();
    l.unshift(e);
    if(l.length>HIST_MAX)l.length=HIST_MAX;
  }
  /* grava sem avisar os jogadores (dispensar um aviso não muda nada para eles) */
  async function saveQuiet(label){
    if(!isGM6()||!camp3())return false;
    var D=man31();
    D.rev=Math.max((Number(D.rev)||0)+1,Date.now());
    D.log=[{at:Date.now(),label:String(label||'').slice(0,120)}].concat(D.log||[]).slice(0,40);
    try{await stPut6('manual','manual',JSON.parse(JSON.stringify(D)));seenSet31(D.rev);paint31(true);return true}
    catch(e){console.warn('[T60p] gravar manual',e);toast('Não consegui salvar. Tente de novo.');return false}
  }
  async function withRollback(fn){
    var snap=JSON.parse(JSON.stringify(man31()));
    var ok=false;
    try{ok=await fn()}catch(e){console.warn('[T60p]',e)}
    if(!ok){M31.data=snap;paint31(true)}
    return ok;
  }

  async function atualizar(items,label){
    var bt=Date.now().toString(36);
    items=items.filter(Boolean);
    if(!items.length)return false;
    var ok=await withRollback(function(){
      var D=man31();
      items.forEach(function(it){
        var ack=D.ack&&D.ack[it.id];
        if(it.kind==='tb'){
          var o=D.tbl.tb[it.id];
          pushHist(D,it.id,{k:'tb',head:o.head,rows:o.rows,br:o.br,ack:ack,bt:bt});
          delete D.tbl.tb[it.id];
          if(!Object.keys(D.tbl.tb).length)delete D.tbl.tb;
        }else{
          var ed=D.ed[it.id];
          pushHist(D,it.id,{k:ed.del?'del':'ed',t:ed.t,br:ed.br,ack:ack,bt:bt});
          delete D.ed[it.id];
        }
        if(D.ack)delete D.ack[it.id];
      });
      M31.edit=null;
      return saveMan31(label);
    });
    if(ok)showSnack(items.length===1?'Texto atualizado. O seu texto antigo ficou guardado.':items.length+' trechos atualizados. Os textos antigos ficaram guardados.',{bt:bt,id:items.length===1?items[0].id:null});
    return ok;
  }

  async function manter(items){
    var D=man31();
    if(!items.length)return false;
    var ok=await withRollback(function(){
      D.ack=D.ack||{};
      items.forEach(function(it){D.ack[it.id]=BASE_CHG31[it.id]||BASE_REV31});
      return saveQuiet('Texto do Mestre mantido');
    });
    if(ok)toast('Aviso dispensado. Ele só volta se as regras mudarem de novo.');
    return ok;
  }

  /* devolve o texto antigo (um trecho, ou o lote inteiro do "atualizar todas") */
  async function desfazer(sel){
    var D=man31(),found=[];
    Object.keys(D.hist||{}).forEach(function(id){
      var l=D.hist[id]||[];
      var e=sel.bt?l.filter(function(x){return x.bt===sel.bt})[0]:(id===sel.id?l[0]:null);
      if(e)found.push({id:id,e:e});
    });
    if(!found.length){toast('Não há texto antigo guardado aqui.');return false}
    var ok=await withRollback(function(){
      found.forEach(function(f){
        var id=f.id,e=f.e;
        D.hist[id]=D.hist[id].filter(function(x){return x!==e&&!(sel.bt&&x.bt===sel.bt)});
        if(!D.hist[id].length)delete D.hist[id];
        if(e.k==='tb'){
          D.tbl=D.tbl||{};D.tbl.tb=D.tbl.tb||{};
          if(D.tbl.tb[id])pushHist(D,id,{k:'tb',head:D.tbl.tb[id].head,rows:D.tbl.tb[id].rows,br:D.tbl.tb[id].br});
          D.tbl.tb[id]={head:e.head,rows:e.rows};if(e.br)D.tbl.tb[id].br=e.br;
        }else{
          if(D.ed[id]){var c=D.ed[id];pushHist(D,id,{k:c.del?'del':'ed',t:c.t,br:c.br})}
          D.ed[id]=e.k==='del'?{del:1}:{t:e.t};
          if(e.br)D.ed[id].br=e.br;
        }
        if(e.ack){D.ack=D.ack||{};D.ack[id]=e.ack}
      });
      return saveMan31(found.length===1?'Texto anterior do Mestre recuperado':found.length+' textos anteriores recuperados');
    });
    if(ok)hideSnack();
    return ok;
  }

  /* ---------- aviso de desfazer ---------- */
  function hideSnack(){
    clearTimeout(rec.snackT);
    var s=document.getElementById('rec60Snack');if(s)s.remove();
  }
  function showSnack(msg,sel){
    hideSnack();
    var box=document.getElementById('man31');if(!box)return;
    var s=document.createElement('div');s.id='rec60Snack';s.className='rec-snack';s.setAttribute('role','status');
    s.innerHTML='<span>'+esc(msg)+'</span><button type="button" class="btn small" data-rec-do="undo">Desfazer</button><button type="button" class="btn small ghost" data-rec-do="snackx" aria-label="Fechar aviso">Fechar</button>';
    s._sel=sel;
    box.appendChild(s);
    rec.snackT=setTimeout(hideSnack,20000);
  }

  /* ---------- desenho dos avisos (só o Mestre) ---------- */
  var fmtDate=function(t){try{return new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}catch(e){return''}};
  function anchorOf(root,it){
    var q=function(sel){try{return root.querySelector(sel)}catch(e){return null}};
    if(it.kind==='tb'){var bar=q('[data-g="open:'+CSS.escape(it.id)+'"]');var live=bar&&bar.closest('.m31-live,.m31-tw');return live||(bar&&bar.parentElement)}
    return q('[data-bid="'+CSS.escape(it.id)+'"]')||(function(){var b=q('[data-m31r="'+CSS.escape(it.id)+'"]');return b&&b.closest('.m31-blk')})();
  }
  function diffBlock(it,n){
    var lbl=it.kind==='del'?'Você removeu este trecho. Abaixo, o texto novo do manual.':'Seu texto (antigo) comparado com o texto novo do manual.';
    return '<div class="rec-diff" id="rec60d'+n+'"><p class="rec-leg"><span class="rec-k rec-d">removido do seu texto</span> <span class="rec-k rec-i">novo no manual</span></p>'+
      '<p class="rec-sub">'+esc(lbl)+' O texto novo aparece como está na base: códigos como {{r:db}} viram o número em vigor quando o manual é lido.</p>'+
      '<div class="rec-text" tabindex="0" role="region" aria-label="Diferença entre o seu texto e o texto novo">'+diffHtml(it.old,it.neu)+'</div>'+
      '<details class="rec-full"><summary>Ler os dois textos completos</summary><h6>Seu texto (antigo)</h6><div class="rec-text">'+(it.old?esc(it.old):'<i>(trecho removido)</i>')+'</div><h6>Texto novo do manual</h6><div class="rec-text">'+esc(it.neu)+'</div></details>'+
      '<p class="rec-sub">Ao atualizar, o seu texto antigo fica guardado e volta com "Desfazer".</p></div>';
  }
  function noteHtml(it,n){
    var open=!!rec.open[it.id];
    return '<div class="rec-note" role="group" aria-label="Aviso do Mestre: trecho editado antes da atualização das regras" data-rec-id="'+esc(it.id)+'">'+
      '<p class="rec-t"><b>Este trecho foi editado antes da atualização das regras.</b> O texto base mudou depois da sua edição e o seu pode contradizer a regra nova. Só você vê este aviso.</p>'+
      '<div class="rec-act"><button type="button" class="btn small" data-rec-do="diff" aria-expanded="'+open+'" aria-controls="rec60d'+n+'">Ver diferença</button>'+
      '<button type="button" class="btn small primary" data-rec-do="upd">Atualizar para regra nova</button>'+
      '<button type="button" class="btn small" data-rec-do="keep" title="Dispensa este aviso. Ele só volta se as regras mudarem de novo.">Manter meu texto</button></div>'+
      (open?diffBlock(it,n):'')+'</div>';
  }
  function histHtml(id,e){
    return '<div class="rec-hist" data-rec-id="'+esc(id)+'"><span>Seu texto anterior, de '+esc(fmtDate(e.at))+', está guardado.</span> <button type="button" class="btn small" data-rec-do="undo-one">Desfazer a atualização</button></div>';
  }
  function topHtml(list){
    var n=list.length;
    var h='<div class="rec-top" role="region" aria-label="Textos desatualizados no Manual"><p class="rec-t"><b>'+n+(n===1?' trecho editado':' trechos editados')+' antes da atualização das regras.</b> Só você vê isto. Revise cada aviso ou troque tudo de uma vez.</p>'+
      '<div class="rec-act"><button type="button" class="btn small'+(rec.armed?' primary':'')+'" data-rec-do="'+(rec.armed?'all-ok':'all')+'">'+(rec.armed?'Toque de novo para trocar '+n+(n===1?' trecho':' trechos'):'Atualizar todas as seções desatualizadas ('+n+')')+'</button>'+
      (rec.armed?'<button type="button" class="btn small" data-rec-do="all-cancel">Cancelar</button>':'<button type="button" class="btn small" data-rec-do="first">Ir ao primeiro</button>')+'</div>';
    if(rec.armed){
      h+='<div class="rec-sum" role="status"><p class="rec-sub">Estes trechos passam para o texto novo. Os seus ficam guardados e dá para desfazer o lote inteiro.</p><ul>'+
        list.map(function(it){return '<li><b>'+esc(it.sec)+'</b> <span>'+(it.kind==='tb'?'(tabela)':it.kind==='del'?'(trecho removido por você)':'')+'</span></li>'}).join('')+'</ul></div>';
    }
    return h+'</div>';
  }

  function decorate(){
    var root=document.getElementById('m31content');
    if(!root||!M31.open)return;
    Array.prototype.forEach.call(root.querySelectorAll('.rec-note,.rec-top,.rec-hist'),function(e){e.remove()});
    if(!gm31())return;
    var list=pending(),D=man31();
    if(!list.length)rec.armed=false;
    var seen={};
    list.forEach(function(it,n){
      var a=anchorOf(root,it);if(!a)return;
      seen[it.id]=1;
      a.insertAdjacentHTML('beforebegin',noteHtml(it,n));
    });
    Object.keys(D.hist||{}).forEach(function(id){
      if(seen[id]||!D.hist[id].length)return;
      var a=anchorOf(root,{id:id,kind:D.hist[id][0].k==='tb'?'tb':'ed'});
      if(a)a.insertAdjacentHTML('beforebegin',histHtml(id,D.hist[id][0]));
    });
    if(list.length)root.insertAdjacentHTML('afterbegin',topHtml(list));
  }

  /* ---------- cliques ---------- */
  document.addEventListener('click',function(e){
    if(!M31.open)return;
    var b=e.target.closest&&e.target.closest('[data-rec-do]');if(!b)return;
    var act=b.dataset.recDo,wrap=b.closest('[data-rec-id]'),id=wrap&&wrap.dataset.recId;
    var list=pending(),it=id?list.filter(function(x){return x.id===id})[0]:null;
    if(act==='snackx'){hideSnack();return}
    if(act==='undo'){var s=document.getElementById('rec60Snack');desfazer((s&&s._sel)||{});return}
    if(!isGM6()||!gm31())return;
    if(act==='diff'&&it){rec.open[id]=!rec.open[id];paint31(true);return}
    if(act==='upd'&&it){atualizar([it],'Texto atualizado para a regra nova: '+it.sec);return}
    if(act==='keep'&&it){manter([it]);return}
    if(act==='undo-one'&&id){desfazer({id:id});return}
    if(act==='all'){rec.armed=true;clearTimeout(rec.armT);rec.armT=setTimeout(function(){rec.armed=false;if(M31.open)paint31(true)},12000);paint31(true);
      setTimeout(function(){var x=document.querySelector('.rec-top [data-rec-do="all-ok"]');if(x)x.focus()},30);return}
    if(act==='all-cancel'){rec.armed=false;clearTimeout(rec.armT);paint31(true);return}
    if(act==='all-ok'){rec.armed=false;clearTimeout(rec.armT);atualizar(list,list.length+(list.length===1?' trecho atualizado':' trechos atualizados')+' para as regras novas');return}
    if(act==='first'&&list.length){var n=document.querySelector('.rec-note');if(n){n.scrollIntoView({block:'center'});var f=n.querySelector('button');if(f)f.focus()}return}
  });

  /* ---------- encadeia na pintura do Manual ---------- */
  var _paint=paint31;
  paint31=function(){
    var out=_paint.apply(this,arguments);
    try{decorate()}catch(e){console.warn('[T60p] avisos',e)}
    return out;
  };
  M6.hooks.leave.push(function(){rec.armed=false;rec.open={};hideSnack()});

  T3.manualRec={pending:pending,diff:diff,diffHtml:diffHtml,atualizar:atualizar,manter:manter,desfazer:desfazer,baseIndex:baseIndex};
})();
