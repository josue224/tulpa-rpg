/* TULPA · Recortador manual de retrato/token (estilo C.R.I.S.)
   T3.cropImage(fileOuUrl,{title}) -> Promise<string|null>: dataURL 256x256 (WebP 0,85; JPEG de reserva), ~15–35 KB.
   Enquadramento 1:1 com guia circular de token, arrastar (mouse/1 dedo), zoom 100–300 % (slider, roda, pinça),
   Centralizar, Girar 90°, Cancelar e Confirmar. Liga-se à ficha (avLoad), ao token (imgSquare6) e ao criador de NPCs. */
(function(){
  'use strict';
  var OUT=256,MAXSRC=1600,MAXLEN=60000;
  function $(s,r){return (r||document).querySelector(s)}

  function loadImg(src){
    return new Promise(function(ok,no){var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){no(new Error('imagem inválida'))};i.src=src});
  }
  function toSource(img){
    var k=Math.min(1,MAXSRC/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*k)),h=Math.max(1,Math.round(img.naturalHeight*k));
    var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c;
  }
  function rotate90(src){
    var c=document.createElement('canvas');c.width=src.height;c.height=src.width;var x=c.getContext('2d');
    x.translate(c.width,0);x.rotate(Math.PI/2);x.drawImage(src,0,0);return c;
  }
  function exportOut(src,st){
    var side=Math.min(src.width,src.height)/st.z,sx=st.cx-side/2,sy=st.cy-side/2;
    var c=document.createElement('canvas');c.width=c.height=OUT;var x=c.getContext('2d');
    x.fillStyle='#2b211b';x.fillRect(0,0,OUT,OUT);x.imageSmoothingQuality='high';x.drawImage(src,sx,sy,side,side,0,0,OUT,OUT);
    var q=.85,out=c.toDataURL('image/webp',q);
    if(out.indexOf('data:image/webp')!==0){out=c.toDataURL('image/jpeg',q)}
    while(out.length>MAXLEN&&q>.4){q-=.1;out=c.toDataURL(out.indexOf('data:image/webp')===0?'image/webp':'image/jpeg',q)}
    return out;
  }

  function open(input,opts){
    opts=opts||{};
    return new Promise(function(resolve){
      var url=null,srcP;
      if(typeof input==='string')srcP=loadImg(input);
      else if(input&&/^image\//.test(input.type||'')){
        if(input.size>20e6){resolve(null);if(typeof toast==='function')toast('Essa imagem é grande demais (máximo de 20 MB).');return}
        url=URL.createObjectURL(input);srcP=loadImg(url);
      }else{resolve(null);if(typeof toast==='function')toast('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');return}

      srcP.then(function(img){
        var src=toSource(img),st={z:1,cx:src.width/2,cy:src.height/2},prevFocus=document.activeElement;
        var wrap=document.createElement('div');wrap.className='cr-wrap';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-label',opts.title||'Recortar imagem');
        wrap.innerHTML='<div class="cr-box">'+
          '<h3 class="cr-t">'+(opts.title||'Enquadrar o retrato')+'</h3>'+
          '<p class="cr-sub">Arraste para posicionar. Use o zoom para aproximar. O círculo é o que aparece no token.</p>'+
          '<div class="cr-stage" id="crStage" tabindex="0" aria-label="Área de enquadramento. Setas movem, + e − dão zoom."><canvas id="crCv" width="320" height="320"></canvas><span class="cr-mask" aria-hidden="true"></span><span class="cr-ring" aria-hidden="true"></span></div>'+
          '<label class="cr-zoom"><span>Zoom <b id="crZv">100%</b></span><input type="range" id="crZ" min="100" max="300" step="1" value="100" aria-label="Zoom de 100% a 300%"></label>'+
          '<div class="cr-row"><button type="button" class="btn small" id="crCenter">Centralizar</button><button type="button" class="btn small" id="crRot">Girar 90°</button></div>'+
          '<div class="cr-row cr-end"><button type="button" class="btn" id="crCancel">Cancelar</button><button type="button" class="btn primary" id="crOk">Confirmar Recorte</button></div></div>';
        document.body.appendChild(wrap);
        var cv=$('#crCv',wrap),stage=$('#crStage',wrap),zr=$('#crZ',wrap),zv=$('#crZv',wrap),V=320;
        var raf=0;
        function fit(){var w=Math.max(200,Math.min(320,stage.clientWidth||320));if(cv.width!==w){cv.width=cv.height=w}V=cv.width}
        function clamp(){
          var side=Math.min(src.width,src.height)/st.z,h=side/2;
          st.cx=Math.max(h,Math.min(src.width-h,st.cx));st.cy=Math.max(h,Math.min(src.height-h,st.cy));
        }
        function draw(){
          raf=0;clamp();fit();var side=Math.min(src.width,src.height)/st.z,x=cv.getContext('2d');
          x.fillStyle='#1b1612';x.fillRect(0,0,V,V);x.imageSmoothingQuality='high';x.drawImage(src,st.cx-side/2,st.cy-side/2,side,side,0,0,V,V);
          zr.value=String(Math.round(st.z*100));zv.textContent=Math.round(st.z*100)+'%';
        }
        function sched(){if(!raf)raf=requestAnimationFrame(draw)}
        function setZ(z,fx,fy){
          z=Math.max(1,Math.min(3,z));if(z===st.z)return;
          var o=Math.min(src.width,src.height)/st.z,n=Math.min(src.width,src.height)/z;
          st.cx+=(fx-.5)*(o-n);st.cy+=(fy-.5)*(o-n);st.z=z;sched();
        }
        var ptrs={},drag=null,pinch=null;
        stage.addEventListener('pointerdown',function(e){
          try{stage.setPointerCapture(e.pointerId)}catch(x){}
          ptrs[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(ptrs);
          if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:st.z};drag=null}
          else drag={x:e.clientX,y:e.clientY,cx:st.cx,cy:st.cy};
          e.preventDefault();
        });
        stage.addEventListener('pointermove',function(e){
          if(!ptrs[e.pointerId])return;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(ptrs);
          if(ids.length>=2&&pinch){var a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch.d>0)setZ(pinch.z*d/pinch.d,.5,.5);return}
          if(drag){var side=Math.min(src.width,src.height)/st.z,k=side/V;st.cx=drag.cx-(e.clientX-drag.x)*k;st.cy=drag.cy-(e.clientY-drag.y)*k;sched()}
        });
        function up(e){delete ptrs[e.pointerId];pinch=null;var ids=Object.keys(ptrs);if(ids.length===1){var p=ptrs[ids[0]];drag={x:p.x,y:p.y,cx:st.cx,cy:st.cy}}else drag=null}
        stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
        stage.addEventListener('wheel',function(e){e.preventDefault();var r=stage.getBoundingClientRect();setZ(st.z*(e.deltaY<0?1.1:1/1.1),(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)},{passive:false});
        zr.addEventListener('input',function(){setZ(Number(zr.value)/100,.5,.5)});
        $('#crCenter',wrap).onclick=function(){st.z=1;st.cx=src.width/2;st.cy=src.height/2;sched()};
        $('#crRot',wrap).onclick=function(){src=rotate90(src);st.cx=src.width/2;st.cy=src.height/2;sched()};
        var done=false;
        function close(v){
          if(done)return;done=true;document.removeEventListener('keydown',key,true);if(raf)cancelAnimationFrame(raf);
          wrap.remove();if(url)URL.revokeObjectURL(url);try{prevFocus&&prevFocus.focus&&prevFocus.focus()}catch(e){}resolve(v);
        }
        $('#crCancel',wrap).onclick=function(){close(null)};
        $('#crOk',wrap).onclick=function(){var out;try{out=exportOut(src,st)}catch(e){out=null;if(typeof toast==='function')toast('Não consegui recortar essa imagem.')}close(out)};
        function key(e){
          if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(null);return}
          if(e.key==='Tab'){var f=wrap.querySelectorAll('button,input,[tabindex="0"]');if(!f.length)return;var a=f[0],b=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}return}
          if(document.activeElement===stage){
            var side=Math.min(src.width,src.height)/st.z,stp=side*.04;
            if(e.key==='ArrowLeft'){st.cx-=stp}else if(e.key==='ArrowRight'){st.cx+=stp}else if(e.key==='ArrowUp'){st.cy-=stp}else if(e.key==='ArrowDown'){st.cy+=stp}
            else if(e.key==='+'||e.key==='='){setZ(st.z*1.1,.5,.5)}else if(e.key==='-'){setZ(st.z/1.1,.5,.5)}else return;
            e.preventDefault();sched();
          }
        }
        document.addEventListener('keydown',key,true);
        draw();setTimeout(function(){draw();stage.focus({preventScroll:true})},30);
      }).catch(function(err){if(url)URL.revokeObjectURL(url);if(typeof toast==='function')toast('Não consegui abrir essa imagem: '+(err&&err.message||'erro')+'.');resolve(null)});
    });
  }
  window.T3.cropImage=open;

  /* ---- ligações: retrato da ficha, token do jogador e foto de entrada na mesa ---- */
  if(typeof imgSquare6==='function'){
    imgSquare6=async function(file){
      var out=await open(file,{title:'Enquadrar o retrato'});
      if(!out)throw new Error('recorte cancelado');
      if(typeof avOk==='function'&&!avOk(out))throw new Error('não consegui converter a imagem');
      return out;
    };
    T3._imgSquare=imgSquare6;
  }
  if(typeof avLoad==='function'){
    avLoad=async function(file){
      if(!file)return;
      var out=await open(file,{title:'Enquadrar a foto do personagem'});if(!out)return;
      if(typeof avOk==='function'&&!avOk(out)){toast('Não consegui converter a imagem.');return}
      data.avatar=out;save();fx5('confirm');toast('Foto do personagem atualizada.');
    };
    T3._avLoad=avLoad;
  }
})();
