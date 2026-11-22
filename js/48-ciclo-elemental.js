/* ===================================================================
   TULPA · ETAPA 33 — Diagrama do Ciclo Elemental
   - SVG desenhado no próprio site (nítido, segue a cor de texto e os
     tons de elemento da estética ativa).
   - Manual (cap. 8): tocar num elemento leva aos rituais dele.
   - Ficha (Repertório ritualístico): bloco recolhível; tocar num
     elemento filtra o catálogo de rituais.
   - Passar o mouse/foco num elemento destaca os dois sub-elementos
     que nascem dele.
   =================================================================== */
const CY33={
  els:[
    {n:'Fé',k:'fe',sec:'c8.6'},
    {n:'Natureza',k:'nat',sec:'c8.2'},
    {n:'Inexistência',k:'inx',sec:'c8.3'},
    {n:'Ilusão',k:'ilu',sec:'c8.4'},
    {n:'Verdade',k:'ver',sec:'c8.5'}
  ],
  /* sub-elemento entre o elemento i e o i+1 */
  subs:[
    {n:'Sol',d:['Energia vital','e purificação.']},
    {n:'Desrealização',d:['Dissolução da','realidade física.']},
    {n:'Pofenia',d:['Padrões falsos e','realidades alternativas.']},
    {n:'Confabulação',d:['Memórias falsas que','parecem reais.']},
    {n:'Metáfora',d:['Revelações expressas','simbolicamente.']}
  ],
  icon:{
    fe:'<path d="M0 -44L24 -6L0 30L-24 -6Z"/><path d="M-28 0L0 44L28 0"/><path class="cy-fill" d="M0 -28L4.5 -10.5L20 -6L4.5 -1.5L0 16L-4.5 -1.5L-20 -6L-4.5 -10.5Z"/>',
    nat:'<path d="M0 4C-12 -8 -11 -28 0 -40C11 -28 12 -8 0 4Z"/><path d="M0 4C-10 -4 -28 -8 -34 -26C-18 -28 -4 -18 0 4Z"/><path d="M0 4C10 -4 28 -8 34 -26C18 -28 4 -18 0 4Z"/><path d="M0 4V-30M0 4L-26 -21M0 4L26 -21"/><path d="M-38 12H38"/><path d="M0 4V36M0 14C-6 22 -14 22 -17 34M0 14C6 22 14 22 17 34M-17 34V40M17 34V40M-24 12C-26 18 -32 18 -34 24M24 12C26 18 32 18 34 24"/>',
    inx:'<path class="cy-fill" d="M-4 -30A30 30 0 0 0 -4 30A37 37 0 0 1 -4 -30Z"/><circle cx="4" cy="0" r="27"/><path d="M17 -23.6A27 27 0 0 1 17 23.6"/><path d="M27 -19A33 33 0 0 1 27 19" stroke-dasharray="8 6"/>',
    ilu:'<path d="M0 -38L36 24H-36Z"/><path d="M0 -12L27 34H-27Z"/><path d="M-21 0L-12 -15M21 0L12 -15"/>',
    ver:'<circle cx="0" cy="-36" r="9"/><path d="M0 -27L32 26H-32Z"/><path d="M0 -26V44" stroke-dasharray="9 7"/>'
  }
};
let cyN33=0;
/* conceito atual do sub-elemento (o Mestre pode editar na central ⚙️ → Sub-Elementos) */
function subInfo33(i){
  const b=(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE:[])[i]||{name:CY33.subs[i].n,desc:CY33.subs[i].d.join(' '),k:''};
  let desc=b.desc;try{const c=cur29('subel',b.id);if(c&&c.desc)desc=c.desc}catch(e){}
  return{...b,desc};
}
const split33=t=>{t=String(t||'').trim();if(t.length<=24)return[t,''];const m=Math.round(t.length/2);let i=t.lastIndexOf(' ',m);const j=t.indexOf(' ',m);if(i<0||(j>=0&&j-m<m-i))i=j;return i<0?[t,'']:[t.slice(0,i),t.slice(i+1)]};
/* emblema de sub-elemento (desenho autoral) com gradiente dos dois elementos */
let embN33=0;
function subEmblem33(k,size='md',{node=false}={}){
  const art=(typeof RART34!=='undefined'&&RART34['sub:'+k])||'';
  const b=(typeof SUBEL_BASE!=='undefined'?SUBEL_BASE:[]).find(x=>x.k===k);if(!b)return'';
  const ka=(CY33.els.find(e=>e.n===b.a)||{}).k,kb=(CY33.els.find(e=>e.n===b.b)||{}).k,id='sg'+(++embN33);
  return`<svg class="rsym rs-${size} rs-${k} rs-sub" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="12" y1="12" x2="88" y2="88"><stop offset="0" class="rs-stop-${ka}"/><stop offset="1" class="rs-stop-${kb}"/></linearGradient></defs><circle class="rs-disc" cx="50" cy="50" r="40"/><g class="rs-spin"><circle class="rs-ring" cx="50" cy="50" r="40" style="stroke:url(#${id})"/><circle class="rs-orbit" cx="50" cy="50" r="45.5" style="stroke:url(#${id})"/><g class="rs-art" transform="translate(50 50)" fill="url(#${id})" stroke="url(#${id})">${art}</g></g></svg>`;
}
T3.subEmblem=subEmblem33;
function cycleSvg33(){
  const u='cy'+(++cyN33);
  const W=1560,H=1040,cx=780,cy=500,Rp=300,r=80,rs=46;
  const LP=[[300,-310],[460,90],[0,365],[-460,90],[-300,-310]];
  const P=CY33.els.map((e,i)=>{const a=(-90+72*i)*Math.PI/180;return{...e,x:cx+Rp*Math.cos(a),y:cy+Rp*Math.sin(a),a}});
  const f=v=>v.toFixed(1);
  let star='';for(let i=0;i<5;i++){const A=P[i],B=P[(i+2)%5];star+=`M${f(A.x)} ${f(A.y)}L${f(B.x)} ${f(B.y)}`}
  let defs='',arcs='',subs='';
  P.forEach((A,i)=>{const B=P[(i+1)%5],mx=(A.x+B.x)/2,my=(A.y+B.y)/2,ox=mx-cx,oy=my-cy,ol=Math.hypot(ox,oy),ux=ox/ol,uy=oy/ol;
    const C={x:mx+ux*50,y:my+uy*50};
    const cut=(p,q,d)=>{const dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy);return{x:p.x+dx/l*d,y:p.y+dy/l*d}};
    const s=cut(A,C,r+14),e=cut(B,C,r+20);
    const sb=subInfo33(i),[c1,c2]=split33(sb.desc);
    const gid=`${u}g${i}`;
    defs+=`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="-46" y1="-46" x2="46" y2="46"><stop offset="0" class="rs-stop-${A.k}"/><stop offset="1" class="rs-stop-${B.k}"/></linearGradient>`;
    arcs+=`<path class="cy-arc" data-a="${A.k}" data-b="${B.k}" d="M${f(s.x)} ${f(s.y)}Q${f(C.x)} ${f(C.y)} ${f(e.x)} ${f(e.y)}" marker-end="url(#${u}a)"/>`;
    const mid={x:.25*s.x+.5*C.x+.25*e.x,y:.25*s.y+.5*C.y+.25*e.y};
    const L={x:cx+LP[i][0],y:cy+LP[i][1]},tl=Math.hypot(mid.x-L.x,mid.y-L.y),tx=(mid.x-L.x)/tl,ty=(mid.y-L.y)/tl;
    const teth=`<path class="cy-teth" d="M${f(tx*(rs+10))} ${f(ty*(rs+10))}L${f(mid.x-L.x-tx*10)} ${f(mid.y-L.y-ty*10)}" style="stroke:url(#${gid})"/>`;
    /* texto: ao lado (topo), acima (laterais) ou abaixo (base) */
    let txt;
    if(i!==2){const side=(i===0||i===1)?1:-1,an=side>0?'start':'end',x=side*(rs+22);
      txt=`<text class="cy-sn" x="${x}" y="-16" text-anchor="${an}">${esc(sb.name)}</text><text class="cy-sc" x="${x}" y="16" text-anchor="${an}">${esc(c1)}</text>${c2?`<text class="cy-sc" x="${x}" y="44" text-anchor="${an}">${esc(c2)}</text>`:''}`}
    else if(i===2)txt=`<text class="cy-sn" y="${rs+40}" text-anchor="middle">${esc(sb.name)}</text><text class="cy-sc" y="${rs+72}" text-anchor="middle">${esc(c1)}</text>${c2?`<text class="cy-sc" y="${rs+100}" text-anchor="middle">${esc(c2)}</text>`:''}`;
    else txt=`<text class="cy-sn" y="${-rs-(c2?96:68)}" text-anchor="middle">${esc(sb.name)}</text><text class="cy-sc" y="${-rs-(c2?64:36)}" text-anchor="middle">${esc(c1)}</text>${c2?`<text class="cy-sc" y="${-rs-36}" text-anchor="middle">${esc(c2)}</text>`:''}`;
    const art=(typeof RART34!=='undefined'&&RART34['sub:'+sb.k])||'';
    subs+=`<g class="cy-sub rs-${sb.k}" data-a="${A.k}" data-b="${B.k}" data-subel="${esc(sb.name)}" data-sec="c8.s-${sb.k}" transform="translate(${f(L.x)} ${f(L.y)})" role="button" tabindex="0" aria-label="${esc(sb.name)}, ${esc(A.n)} mais ${esc(B.n)}: ${esc(sb.desc)}">${teth}<circle class="cy-sdisc" r="${rs}" style="fill:url(#${gid})"/><circle class="cy-sring" r="${rs}" style="stroke:url(#${gid})"/><circle class="cy-sorbit" r="${rs+7}" style="stroke:url(#${gid})"/><g class="cy-sic" transform="scale(1.12)" fill="url(#${gid})" stroke="url(#${gid})">${art}</g>${txt}</g>`;
  });
  const lab=(e)=>{const dx=Math.cos(e.a);
    if(e.k==='fe')return`<text class="cy-name" x="0" y="${-r-34}" text-anchor="middle">${esc(e.n.toUpperCase())}</text>`;
    const right=dx>0;return`<text class="cy-name" x="${right?r+26:-r-26}" y="2" text-anchor="${right?'start':'end'}">${esc(e.n.toUpperCase())}</text>`};
  const els=P.map(e=>`<g class="cy-el rs-${e.k}" data-el="${esc(e.n)}" data-k="${e.k}" data-sec="${e.sec}" transform="translate(${f(e.x)} ${f(e.y)})" role="button" tabindex="0" aria-label="${esc(e.n)}: ver rituais deste elemento"><circle class="cy-disc" r="${r}"/><circle class="cy-ring" r="${r}"/><circle class="cy-hair" r="${r-9}"/><g class="cy-ic" transform="scale(1.12)">${CY33.icon[e.k]}</g>${lab(e)}</g>`).join('');
  return`<svg class="cy33" viewBox="0 0 ${W} ${H}" role="group" aria-label="Ciclo Elemental: Fé, Natureza, Inexistência, Ilusão e Verdade, em ciclo, com os cinco sub-elementos que nascem entre eles">
    <defs>${defs}<marker id="${u}a" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10L3 5Z" class="cy-head"/></marker></defs>
    <path class="cy-star" d="${star}"/>${arcs}${subs}${els}</svg>`;
}
function cycle33(where){
  const leg=CY33.subs.map((s,i)=>{const a=CY33.els[i],b=CY33.els[(i+1)%5],sb=subInfo33(i);return`<li data-a="${a.k}" data-b="${b.k}">${subEmblem33(sb.k,'sm')}<div><b>${esc(sb.name)}</b> <span class="cy-eq">${esc(a.n)} + ${esc(b.n)}</span><span class="cy-ld">${esc(sb.desc)}</span></div></li>`}).join('');
  return`<figure class="cy33w cy-${where}">${cycleSvg33()}<figcaption><ul class="cy-leg">${leg}</ul><p class="sub cy-hint">${where==='sheet'?'Toque num elemento ou sub-elemento para ver só os rituais dele.':'Toque num elemento ou sub-elemento para ir aos rituais dele.'}</p></figcaption></figure>`;
}
T3.cycle33=cycle33;
/* celular: sem os textos dos sub-elementos (viram lista), recorta o desenho */
const vb33=()=>{const n=matchMedia('(max-width:640px)').matches;$$('svg.cy33').forEach(s=>{const v=n?'110 50 1340 940':'0 0 1560 1040';if(s.getAttribute('viewBox')!==v)s.setAttribute('viewBox',v)})};
addEventListener('resize',vb33);new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))vb33()}).observe(document.body,{childList:true,subtree:true});

/* destaque: elemento acende os sub-elementos que nascem dele; sub-elemento acende seus dois pais */
function hi33(fig,k,sub){
  if(!fig)return;fig.classList.toggle('cy-focus',!!(k||sub));
  if(sub){const a=sub.dataset.a,b=sub.dataset.b;
    fig.querySelectorAll('.cy-el').forEach(g=>g.classList.toggle('on',g.dataset.k===a||g.dataset.k===b));
    fig.querySelectorAll('.cy-arc,.cy-sub,.cy-leg li').forEach(g=>g.classList.toggle('on',g.dataset.a===a&&g.dataset.b===b));return}
  fig.querySelectorAll('.cy-el').forEach(g=>g.classList.toggle('on',g.dataset.k===k));
  fig.querySelectorAll('.cy-arc,.cy-sub,.cy-leg li').forEach(g=>g.classList.toggle('on',!!k&&(g.dataset.a===k||g.dataset.b===k)));
}
const act33=g=>{
  const fig=g.closest('.cy33w');if(!fig)return;
  if(fig.classList.contains('cy-manual')){try{go31(g.dataset.sec)}catch(e){}return}
  const sel=$('ritualElement');if(!sel)return;const el=g.dataset.el||g.dataset.subel;
  const same=sel.value===el;sel.value=same?'':el;sel.dispatchEvent(new Event('change'));
  fig.querySelectorAll('.cy-el,.cy-sub').forEach(x=>x.classList.toggle('sel',!same&&x===g));
  if(!same)toast(`Mostrando rituais de ${el}.`);
};
document.addEventListener('click',e=>{const g=e.target.closest('.cy33 .cy-el,.cy33 .cy-sub');if(g)act33(g)});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const g=e.target.closest?.('.cy33 .cy-el,.cy33 .cy-sub');if(g){e.preventDefault();act33(g)}});
document.addEventListener('pointerover',e=>{const fig=e.target.closest?.('.cy33w');if(!fig)return;const g=e.target.closest('.cy33 .cy-el'),sb=e.target.closest('.cy33 .cy-sub');hi33(fig,g?g.dataset.k:'',g?null:sb)});
document.addEventListener('focusin',e=>{const g=e.target.closest?.('.cy33 .cy-el,.cy33 .cy-sub');if(g)hi33(g.closest('.cy33w'),g.classList.contains('cy-el')?g.dataset.k:'',g.classList.contains('cy-sub')?g:null)});
document.addEventListener('focusout',e=>{const g=e.target.closest?.('.cy33 .cy-el,.cy33 .cy-sub');if(g)hi33(g.closest('.cy33w'),'')});
document.addEventListener('pointerout',e=>{const fig=e.target.closest?.('.cy33w');if(fig&&!fig.contains(e.relatedTarget))hi33(fig,'')});

/* Manual: componente vivo no capítulo 8 */
LIVE31.cycle=()=>cycle33('manual');
{const c8=MAN31.find(c=>c.id==='c8');const s0=c8&&c8.secs.find(s=>s.id==='c8.0');
 if(s0&&!s0.b.some(b=>b&&b.live==='cycle')){const i=s0.b.findIndex(b=>Array.isArray(b)&&b[0]==='c8.l1');s0.b.splice(i>=0?i+1:1,0,{live:'cycle'})}}

/* Ficha: bloco recolhível no Repertório ritualístico */
function sheet33(){
  const cat=$('ritualCatalog');if(!cat||$('cy33sheet'))return;
  const grid=cat.closest('.panel')?.querySelector('.grid.two');if(!grid)return;
  const d=document.createElement('details');d.className='cy-det';d.id='cy33sheet';
  let open=false;try{open=localStorage.getItem('tulpa_cy_open')==='1'}catch(e){}
  d.open=open;
  d.innerHTML=`<summary><span class="cy-sumic" aria-hidden="true">⟡</span> Ciclo Elemental <span class="sub">os cinco elementos e seus sub-elementos</span></summary>${cycle33('sheet')}`;
  d.addEventListener('toggle',()=>{try{localStorage.setItem('tulpa_cy_open',d.open?'1':'0')}catch(e){}});
  grid.before(d);
  const sel=$('ritualElement');if(sel)sel.addEventListener('change',()=>{const fig=d.querySelector('.cy33w');const k=(CY33.els.find(x=>x.n===sel.value)||{}).k||'';fig.querySelectorAll('.cy-el,.cy-sub').forEach(x=>x.classList.toggle('sel',(x.dataset.el||x.dataset.subel)===sel.value&&!!sel.value))});
}
setTimeout(sheet33,500);setInterval(()=>{try{sheet33()}catch(e){}},2500);
console.info('[Tulpa] Etapa 33 carregada (Ciclo Elemental)');

