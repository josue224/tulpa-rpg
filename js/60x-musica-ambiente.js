/* TULPA · Ambientes sintetizados (WebAudio): chuva, noir, terror, combate e santuário.
   Zero internet, zero bloqueio. Usa o AudioContext único (A5/actx do js/19). Cada aparelho
   controla o próprio volume (prefs.musicVol) e o mudo; o Mestre escolhe a cena por M6.state.music.amb. */
(function(){
  'use strict';
  var LIST=[['rain','Chuva & Trovões'],['noir','Investigação Noir (drone grave)'],['terror','Tensão & Terror'],['combat','Combate Pulsante'],['sanct','Santuário Místico']];
  var LEVEL={rain:.9,noir:.8,terror:.8,combat:.7,sanct:.8};
  var A={id:null,src:null,bus:null,nodes:[],gen:0,timers:[]};

  function ctx(){try{return actx()}catch(e){return null}}
  function vol(){var v=(typeof prefs!=='undefined'&&prefs.musicVol!=null)?prefs.musicVol:60;return Math.max(0,Math.min(1,v/100))}
  function noiseBuf(c,sec,brown){
    var len=Math.floor(c.sampleRate*sec),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0),last=0;
    for(var i=0;i<len;i++){var w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}
    return b;
  }
  function track(n){A.nodes.push(n);return n}
  function loopNoise(c,brown,freq,q,type,gain,dest){
    var s=track(c.createBufferSource());s.buffer=noiseBuf(c,3,brown);s.loop=true;
    var f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
    var g=c.createGain();g.gain.value=gain;s.connect(f);f.connect(g);g.connect(dest);s.start();return{f:f,g:g};
  }
  function osc(c,type,freq,gain,dest,det){
    var o=track(c.createOscillator());o.type=type;o.frequency.value=freq;if(det)o.detune.value=det;
    var g=c.createGain();g.gain.value=gain;o.connect(g);g.connect(dest);o.start();return{o:o,g:g};
  }
  function lfo(c,rate,depth,param){
    var o=track(c.createOscillator());o.frequency.value=rate;var g=c.createGain();g.gain.value=depth;o.connect(g);g.connect(param);o.start();
  }
  function tone(c,type,f,t,dur,peak,att,to){
    var o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+(att||.01));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(A.bus);o.start(t);o.stop(t+dur+.05);
  }
  function burst(c,t,dur,type,f0,f1,peak,brown){
    var s=c.createBufferSource();s.buffer=noiseBuf(c,Math.min(4,dur+.1),brown);
    var f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);
    var g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+Math.min(.05,dur/4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(A.bus);s.start(t);s.stop(t+dur+.05);
  }
  function every(gen,fn,ms,jit){
    (function go(){var t=setTimeout(function(){if(A.gen!==gen)return;try{fn()}catch(e){}go()},ms+Math.random()*(jit||0));A.timers.push(t)})();
  }

  var SCENES={
    rain:function(c,gen){
      var a=loopNoise(c,false,1400,.6,'bandpass',.55,A.bus);loopNoise(c,false,5200,.7,'highpass',.1,A.bus);
      lfo(c,.07,.12,a.g.gain);
      every(gen,function(){
        var t=c.currentTime+.05;
        burst(c,t,.12,'highpass',1800,0,.25);
        burst(c,t+.12,3.6,'lowpass',320,60,.9,true);
        tone(c,'sine',48,t+.15,2.4,.18,.2,30);
      },9000,14000);
    },
    noir:function(c,gen){
      osc(c,'sine',55,.22,A.bus);osc(c,'sine',55.45,.2,A.bus);
      var s=osc(c,'sawtooth',110,.05,c.createGain()),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=240;
      s.g.disconnect();s.g.connect(lp);lp.connect(A.bus);lfo(c,.05,120,lp.frequency);
      loopNoise(c,true,140,.5,'lowpass',.25,A.bus);
      var N=[110,130.8,98,164.8];
      every(gen,function(){var t=c.currentTime+.05,f=N[Math.floor(Math.random()*N.length)];tone(c,'triangle',f,t,4.5,.09,.4);tone(c,'sine',f*2,t,3,.03,.4)},7000,6000);
    },
    terror:function(c,gen){
      osc(c,'sine',41,.24,A.bus);var s=osc(c,'sawtooth',58.3,.05,c.createGain()),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;
      s.g.disconnect();s.g.connect(lp);lp.connect(A.bus);lfo(c,.11,60,lp.frequency);
      var hi=osc(c,'sine',2093,.006,A.bus);lfo(c,.4,.005,hi.g.gain);
      loopNoise(c,true,90,.4,'lowpass',.3,A.bus);
      every(gen,function(){var t=c.currentTime+.05;burst(c,t,.9,'bandpass',380,900,.1);tone(c,'sawtooth',70,t+.2,.8,.03,.2,50)},5000,9000);
      every(gen,function(){var t=c.currentTime+.05;tone(c,'sine',58,t,.22,.28,.01,38);tone(c,'sine',58,t+.3,.22,.2,.01,38)},1500,0);
    },
    combat:function(c,gen){
      var beat=.469,next=c.currentTime+.1,i=0,bass=[55,55,65.4,49,55,55,73.4,49];
      var iv=setInterval(function(){
        if(A.gen!==gen){clearInterval(iv);return}
        while(next<c.currentTime+.25){
          var t=next,st=i%8;
          if(st%2===0){tone(c,'sine',110,t,.2,.5,.004,40)}
          tone(c,'sawtooth',bass[st],t,beat*.9,.07,.01);
          if(st%2===1)burst(c,t,.05,'highpass',7000,0,.1);
          if(st===2||st===6)burst(c,t,.16,'bandpass',1800,900,.2);
          next+=beat/2;i++;
        }
      },60);
      A.timers.push(iv);
    },
    sanct:function(c,gen){
      var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1300;lp.connect(A.bus);
      [220,261.63,329.63,440].forEach(function(f,k){osc(c,'sine',f,.07,lp,k*3-4)});
      lfo(c,.06,500,lp.frequency);
      var P=[880,987.77,1174.66,1318.5,1567.98];
      every(gen,function(){var t=c.currentTime+.05,f=P[Math.floor(Math.random()*P.length)];tone(c,'sine',f,t,3.2,.07,.01);tone(c,'sine',f*2.76,t,1.2,.015,.01)},3600,4200);
    }
  };

  function level(){return vol()*(LEVEL[A.id]||.8)}
  function applyVol(){if(A.bus&&A.id){try{A.bus.gain.setTargetAtTime(level(),A.bus.context.currentTime,.12)}catch(e){}}}
  function teardown(fast){
    var bus=A.bus,nodes=A.nodes,timers=A.timers;A.gen++;A.bus=null;A.nodes=[];A.timers=[];A.id=null;A.src=null;
    timers.forEach(function(t){clearTimeout(t);clearInterval(t)});
    if(!bus)return;
    var c=bus.context,t=c.currentTime,d=fast?.05:.7;
    try{bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(0,t,d/3)}catch(e){}
    setTimeout(function(){nodes.forEach(function(n){try{n.stop&&n.stop()}catch(e){}try{n.disconnect()}catch(e){}});try{bus.disconnect()}catch(e){}},d*1000+80);
  }
  function start(id,src){
    if(!SCENES[id])return false;
    if(A.id===id&&A.src===src)return true;
    teardown(true);
    var c=ctx();if(!c||!A5.out)return false;
    A.id=id;A.src=src||'state';A.bus=c.createGain();A.bus.gain.value=0;A.bus.connect(A5.out);
    var gen=++A.gen;
    try{SCENES[id](c,gen)}catch(e){console.warn('[ambiente]',e);teardown(true);return false}
    try{A.bus.gain.setTargetAtTime(level(),c.currentTime,.6)}catch(e){}
    try{if(typeof YT6!=='undefined'&&c.state!=='running'){YT6.blocked=true}}catch(e){}
    return true;
  }
  function stop(src){if(!A.id)return;if(src&&A.src!==src)return;teardown(false)}

  /* o navegador só libera o som depois de um toque */
  ['pointerdown','keydown'].forEach(function(ev){document.addEventListener(ev,function(){
    try{var c=A5.ctx;if(A.id&&c&&c.state==='suspended')c.resume().catch(function(){});if(typeof YT6!=='undefined'&&A.id&&c&&c.state==='running'&&YT6.blocked&&!(YT6.player&&YT6.player.getPlayerState&&YT6.player.getPlayerState()===1)){YT6.blocked=false;if(typeof renderVol6==='function')renderVol6()}}catch(e){}
  },{passive:true,capture:true})});

  T3.ambient={list:LIST,start:start,stop:stop,vol:applyVol,state:function(){return{id:A.id,src:A.src}}};
})();
