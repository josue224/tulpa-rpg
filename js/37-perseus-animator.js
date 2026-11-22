/* cada momento: animações possíveis, legendas e prioridade */
const PAMAP24={
  nat20:{g:['omg','67'],t:['20 NATURAL!','Isso foi um 20?!','O dado obedeceu.'],p:4},
  crit:{g:['omg'],t:['CRÍTICO!','Isso vai deixar marca.'],p:4},
  high:{g:['67','omg'],t:['Rolagem alta!','Bonito.'],p:1},
  nat1:{g:['haha'],t:['1 natural… HA HA HA','O dado te odeia.'],p:4},
  low:{g:['haha','what'],t:['Ih…','Isso foi… uma rolagem.'],p:1},
  start:{g:['emerge'],t:['Combate!','Rolem Reflexo.'],p:4},
  violent:{g:['bigeyes'],t:['Que golpe!','Isso doeu daqui.'],p:3},
  retal:{g:['bigeyes'],t:['Retaliação!'],p:3},
  dying:{g:['sorry'],t:['Morrendo! Alguém ajuda!'],p:5},
  dead:{g:['sorry'],t:['Descanse em paz…'],p:5},
  collapse:{g:['raccoon','bigeyes'],t:['Colapso de Lucidez','A mente rachou.'],p:5},
  horror:{g:['bigeyes','raccoon'],t:['A Lucidez caiu…','Você viu isso também?'],p:3},
  music:{g:['guitar','headphones'],t:['🎵 Música na mesa','Aumenta o som!'],p:2},
  idle:{g:['loaf','bed','chill'],t:['Intervalo…','zzz','Cortisol baixíssimo.'],p:0},
  noise:{g:['what'],t:['Ouviu isso?','Que barulho foi esse?'],p:2},
  sneak:{g:['back'],t:['Em silêncio…','Ninguém viu nada.'],p:2},
  win:{g:['silly'],t:['Vitória!','Conquista!'],p:3},
  hello:{g:['smile'],t:['Oi! Bem-vindo à mesa.'],p:0},
  extase:{g:['blush'],t:['Êxtase!'],p:3},
};
const PA24={on:null,pri:-1,timer:0,at:{},lastG:{},any:0,lu:{},vt:{},mus:'',mg:false,idleAt:Date.now(),idled:false};
const paOn24=()=>prefs.perseus!==false&&prefs.perseusGifs!==false;
const reduce24=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function paBox24(){
  let b=$('pa24');if(b)return b;
  b=document.createElement('div');b.id='pa24';b.className='pa24';b.setAttribute('role','status');b.setAttribute('aria-live','polite');
  b.innerHTML='<div class="pa24-card"><button type="button" class="pa24-x" aria-label="Fechar reação">✕</button><div class="pa24-frame"><img class="pa24-img" alt=""></div><b class="pa24-cap"></b><button type="button" class="pa24-off">Desligar animações</button></div>';
  document.body.append(b);
  b.querySelector('.pa24-x').onclick=()=>paHide24();
  b.querySelector('.pa24-off').onclick=()=>{prefs.perseusGifs=false;savePrefs();paHide24();toast('Reações animadas desligadas. Dá para religar no ⚙ do Perseus.')};
  return b;
}
function paHide24(){const b=$('pa24');if(!b)return;b.classList.remove('show');PA24.pri=-1;clearTimeout(PA24.timer)}
/* PerseusAnimator.react(kind): mostra a animação do momento (com fila por prioridade e intervalo mínimo) */
function react24(kind){
  try{
    const M=PAMAP24[kind];if(!M||!paOn24())return false;
    const now=Date.now(),showing=$('pa24')?.classList.contains('show');
    if(now-(PA24.at[kind]||0)<9000)return false;               /* o mesmo momento não repete em seguida */
    if(showing&&M.p<=PA24.pri)return false;                    /* algo mais importante já está na tela */
    if(!showing&&now-PA24.any<2500&&M.p<3)return false;
    PA24.at[kind]=now;PA24.any=now;PA24.pri=M.p;
    let gs=M.g.filter(g=>PGIF24[g]);if(!gs.length)return false;if(gs.length>1)gs=gs.filter(g=>g!==PA24.lastG[kind]);
    const g=gs[Math.floor(Math.random()*gs.length)];PA24.lastG[kind]=g;
    const b=paBox24(),img=b.querySelector('.pa24-img'),cap=rnd(M.t);
    img.src=reduce24()?PERSEUS_IMG:PGIF24[g];img.dataset.g=g;b.querySelector('.pa24-cap').textContent=cap;b.dataset.kind=kind;
    b.classList.remove('show');void b.offsetWidth;b.classList.add('show');
    clearTimeout(PA24.timer);PA24.timer=setTimeout(paHide24,M.p>=4?5200:4200);
    return true;
  }catch(e){console.warn('[T24] Perseus',e);return false}
}
const PerseusAnimator={react:react24,hide:paHide24,map:PAMAP24};
window.tulpaPerseus=PerseusAnimator;T3.perseusAnim=PerseusAnimator;

/* ---------- gatilhos ---------- */
/* narração da mesa (rolagens, combate, mortes) e reações antigas do gato */
{const _nr24=narrate;narrate=function(kind){const out=_nr24.apply(this,arguments);try{react24(kind)}catch(e){}return out};T3.narrate=narrate}
{const _pr24=T3.perseusReact;T3.perseusReact=function(kind){try{react24(kind)}catch(e){}return _pr24?_pr24.apply(this,arguments):undefined}}
/* conquista nova e vitória nos mini-games */
{const _ac24=achieve;achieve=function(){const out=_ac24.apply(this,arguments);if(out)setTimeout(()=>react24('win'),300);return out};T3.achieve=achieve}
{const _so24=mgShowOver;mgShowOver=function(res){const out=_so24.apply(this,arguments);try{const mine=(res?.rows||[]).find(q=>q.u===uid3());if(mine&&mine.w)react24('win')}catch(e){}return out}}
/* vigia: música, Lucidez, Vital, Intervalo e ociosidade */
['pointerdown','keydown','wheel'].forEach(ev=>addEventListener(ev,()=>{PA24.idleAt=Date.now();PA24.idled=false},{passive:true,capture:true}));
setInterval(()=>{
  try{
    if(!paOn24())return;const c=camp3();
    /* música começou ou trocou */
    try{const m=typeof wantMusic6==='function'?wantMusic6():null,k=m&&m.playing&&!m.synth?String(m.title||m.id||'música'):'';if(k&&k!==PA24.mus)react24('music');PA24.mus=k}catch(e){}
    if(c){
      const cb=!!(c.combat&&c.combat.active);if(cb&&PA24.cb===false)react24('start');PA24.cb=cb;
      (c.characters||[]).forEach(ch=>{if(!inScene(ch))return;const d=dOf6(ch);if(!d)return;
        const lu=Number(d.lucidity),vt=Number(d.vital);
        if(isFinite(lu)){const p=PA24.lu[ch.id];if(p!=null&&lu<p&&(ch.ownerId===uid3()||p-lu>=3||lu<=0))react24(lu<=0?'collapse':'horror');PA24.lu[ch.id]=lu}
        if(isFinite(vt)){const p=PA24.vt[ch.id];if(p!=null&&p>0&&vt<=0)react24('dying');PA24.vt[ch.id]=vt}
      });
    }
    /* Intervalo aberto */
    const mg=!!document.querySelector('#mgMain')&&!!document.querySelector('#mgMain')?.offsetParent;if(mg&&!PA24.mg)react24('idle');PA24.mg=mg;
    /* 4 minutos sem mexer */
    if(!PA24.idled&&Date.now()-PA24.idleAt>240000){PA24.idled=true;react24('idle')}
    /* boas-vindas na primeira vez que a mesa abre nesta sessão */
    if(c&&!PA24.hi&&$('tablePanel')&&!$('tablePanel').classList.contains('hide')){PA24.hi=true;try{if(!sessionStorage.getItem('tulpa_pa_hi')){sessionStorage.setItem('tulpa_pa_hi','1');setTimeout(()=>react24('hello'),1500)}}catch(e){}}
  }catch(e){}
},1500);

