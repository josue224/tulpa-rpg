/* TULPA · Visão dos jogadores configurável pelo Mestre
   Botão "👁 Visão" no mapa (só Mestre): modo "Cone de visão" (abertura e alcance ajustáveis) ou "Só a sala inteira"
   (o jogador enxerga o cômodo em que está, sem espiar por portas). Grava M6.state.vision, que o js/23 lê (visCfg10). */
(function(){
  'use strict';
  function $(s,r){return (r||document).querySelector(s)}
  var DEF={mode:'cone',fov:200,rng:0};
  function cur(){var v=(M6.state&&M6.state.vision)||{};return{mode:v.mode==='room'?'room':'cone',fov:Math.max(30,Math.min(360,Number(v.fov)||200)),rng:Math.max(0,Number(v.rng)||0)}}
  function openDlg(){
    if(!isGM6())return;var c=cur();
    var w=document.createElement('div');w.className='npc-wrap';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Visão dos jogadores');
    var rngs=[0,3,6,9,12,18,30];
    w.innerHTML='<form class="npc-box"><h3 class="npc-t">👁 Visão dos jogadores</h3>'+
      '<fieldset><legend>Modo</legend><label class="npc-chip'+(c.mode==='cone'?' on':'')+'"><input type="radio" name="vm" value="cone"'+(c.mode==='cone'?' checked':'')+'>Cone de visão</label><label class="npc-chip'+(c.mode==='room'?' on':'')+'"><input type="radio" name="vm" value="room"'+(c.mode==='room'?' checked':'')+'>Só a sala inteira</label></fieldset>'+
      '<p class="sub" id="vmHelp"></p>'+
      '<div class="field" id="vmCone"><label for="vmFov">Abertura do cone: <b id="vmFovV">'+c.fov+'°</b></label><input type="range" id="vmFov" min="30" max="360" step="10" value="'+c.fov+'" style="min-height:44px"><label for="vmRng">Alcance</label><select id="vmRng">'+rngs.map(function(r){return '<option value="'+r+'"'+(r===c.rng?' selected':'')+'>'+(r?r+' m':'Ilimitado')+'</option>'}).join('')+'</select></div>'+
      '<p class="sub">Vale para todos os jogadores no mapa agora, ao vivo. A lanterna no escuro continua com o facho dela. Inimigos têm o cone próprio na ficha de IA.</p>'+
      '<div class="cr-row cr-end"><button type="button" class="btn" id="vmReset">Padrão</button><button type="button" class="btn" id="vmCancel">Cancelar</button><button type="submit" class="btn primary">Aplicar</button></div></form>';
    document.body.appendChild(w);
    function help(){var m=(w.querySelector('input[name=vm]:checked')||{}).value;$('#vmHelp',w).textContent=m==='room'?'O jogador vê o cômodo inteiro onde está, mas não enxerga outros cômodos pelas portas.':'O jogador vê dentro do cone, inclusive através de portas abertas.';$('#vmCone',w).style.display=m==='room'?'none':'';}
    help();
    w.addEventListener('change',function(e){if(e.target.type==='radio'){Array.prototype.forEach.call(w.querySelectorAll('input[name=vm]'),function(r){r.closest('.npc-chip').classList.toggle('on',r.checked)});help()}});
    $('#vmFov',w).addEventListener('input',function(e){$('#vmFovV',w).textContent=e.target.value+'°'});
    var done=false;function close(){if(done)return;done=true;document.removeEventListener('keydown',key,true);w.remove()}
    function key(e){if(e.key==='Escape'){e.preventDefault();close()}}
    document.addEventListener('keydown',key,true);
    $('#vmCancel',w).onclick=close;
    $('#vmReset',w).onclick=function(){setState6({vision:Object.assign({},DEF)});try{TAC10.vs=null;mapDraw7()}catch(e){}toast('Visão restaurada ao padrão.');close()};
    $('form',w).addEventListener('submit',function(e){
      e.preventDefault();
      setState6({vision:{mode:(w.querySelector('input[name=vm]:checked')||{}).value==='room'?'room':'cone',fov:Math.max(30,Math.min(360,Number($('#vmFov',w).value)||200)),rng:Number($('#vmRng',w).value)||0}});
      try{TAC10.vs=null;mapDraw7()}catch(x){}toast('Visão dos jogadores atualizada.');close();
    });
    setTimeout(function(){var f=w.querySelector('input[name=vm]:checked');f&&f.focus()},30);
  }
  /* quando o Mestre muda, os jogadores recalculam na hora */
  onState6(function(){try{TAC10.vs=null;mapDraw7()}catch(e){}});
  function ensure(){
    try{
      var gm=isGM6()&&camp3(),st=MAP7&&MAP7.stage,b=st&&st.querySelector('.vis-fab');
      if(st&&gm&&!b){b=document.createElement('button');b.type='button';b.className='btn small npc-fab vis-fab';b.textContent='👁 Visão';b.setAttribute('aria-label','Configurar a visão dos jogadores');b.onclick=openDlg;st.appendChild(b)}
      else if(b&&!gm)b.remove();
    }catch(e){}
  }
  setInterval(function(){if(!document.hidden)ensure()},1500);
  window.addEventListener('tulpa:sync',ensure);
  T3.visionCfg={open:openDlg,get:cur};
})();
