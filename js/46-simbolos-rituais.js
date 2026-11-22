/* ===================================================================
   TULPA · ETAPA 32 — Símbolos dos Rituais
   - RSYM32 (t32s.js): os 40 símbolos do Sistema Tulpa RPG V1.2,
     vetorizados a partir do PDF: anel geométrico + traço original
     suavizado. Cor por elemento, misturada à cor de texto da estética
     ativa (contraste garantido em qualquer data-aesthetic).
   - ritSym32(): um único componente, usado em fichas, menus de
     combate, conjuração, Manual, tooltips e na central de regras.
   - O Mestre pode trocar o símbolo de um ritual (imagem própria),
     voltar ao oficial ou deixar sem símbolo. Fica em rules.ritual[id].sym.
   =================================================================== */
const EL32={'Natureza':'nat','Inexistência':'inx','Ilusão':'ilu','Verdade':'ver','Fé':'fe'};
const slug32=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
const nrm32=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
function ritOf32(x){
  if(!x)return null;if(typeof x==='object')return x;
  return RITUALS.find(r=>r.name===x)||RITUALS.find(r=>nrm32(r.name)===nrm32(x))||null;
}
function symData32(r){return RSYM32[r.id]||RSYM32[slug32(r.name)]||null}
function ring32(s){
  const R=s.r;
  if(!s.a)return`<circle class="rs-ring" cx="50" cy="50" r="${R}"/>`;
  return s.a.map(([a,b])=>{const A=a*Math.PI/180,B=b*Math.PI/180,lg=((b-a+360)%360)>180?1:0;
    return`<path class="rs-ring" d="M${(50+R*Math.cos(A)).toFixed(2)} ${(50+R*Math.sin(A)).toFixed(2)}A${R} ${R} 0 ${lg} 1 ${(50+R*Math.cos(B)).toFixed(2)} ${(50+R*Math.sin(B)).toFixed(2)}"/>`}).join('');
}
/* size: sm (listas/menus) · md (fichas) · lg (Manual) · xl (conjuração) · fx (efeito) */
function ritSym32(x,size='md',{cls=''}={}){
  const r=ritOf32(x);if(!r||r.sym==='none')return'';
  const el=EL32[r.element]||'etc';
  if(r.sym&&/^data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,]/.test(r.sym))
    return`<span class="rsym rs-${size} rs-${el} rs-img ${cls}" aria-hidden="true"><img src="${esc(r.sym)}" alt="" loading="lazy" decoding="async"></span>`;
  const s=symData32(r);
  let body;
  if(s){
    const R=s.r||46;
    body=`<circle class="rs-disc" cx="50" cy="50" r="${R}"/><g class="rs-spin">${s.r?ring32(s)+`<circle class="rs-hair" cx="50" cy="50" r="${(R-5.4).toFixed(1)}"/>`:''}<path class="rs-ink" fill-rule="evenodd" d="${s.d}"/></g>`;
  }else{ /* ritual criado pelo Mestre sem imagem: selo com a inicial */
    const ch=esc((String(r.name||'?').replace(/^ritual\s+d[aoe]s?\s+/i,'').trim()[0]||'?').toUpperCase());
    body=`<circle class="rs-disc" cx="50" cy="50" r="42"/><g class="rs-spin"><circle class="rs-ring" cx="50" cy="50" r="42"/><circle class="rs-hair" cx="50" cy="50" r="36.6"/><text class="rs-mono" x="50" y="51" text-anchor="middle" dominant-baseline="central">${ch}</text></g>`;
  }
  return`<svg class="rsym rs-${size} rs-${el} ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${body}</svg>`;
}
T3.ritSym=ritSym32;window.tulpaRitSym=ritSym32;

/* ---------- decoração das telas existentes (sem reescrever cada uma) ---------- */
function deco32(){
  /* ficha: catálogo de rituais */
  $$('#ritualCatalog .ritual-card').forEach(card=>{
    if(card.querySelector('.rsym'))return;const h=card.querySelector('h4');if(!h)return;
    const r=ritOf32(h.textContent);if(!r)return;const sv=ritSym32(r,'md');if(!sv)return;
    const wrap=document.createElement('span');wrap.className='rs-title';h.before(wrap);wrap.insertAdjacentHTML('afterbegin',sv);wrap.append(h);
    card.classList.add('rs-host');
  });
  /* combate: menu de talentos e rituais conhecidos */
  $$('#modalBody [data-rit]').forEach(b=>{
    const row=b.parentElement;if(!row||row.querySelector('.rsym'))return;
    const r=RITUALS.find(x=>x.id===b.dataset.rit);const sv=r&&ritSym32(r,'sm');if(!sv)return;
    row.insertAdjacentHTML('afterbegin',sv);row.classList.add('rs-host','rs-row');
  });
  /* conjuração: símbolo grande no topo */
  const pw=$('ritualPower');
  if(pw&&!$q('#modalBody .rs-cast')){
    const r=ritOf32($('modalTitle')?.textContent);const sv=r&&ritSym32(r,'xl');
    if(sv){$('modalBody').insertAdjacentHTML('afterbegin',`<div class="rs-cast" aria-hidden="true">${sv}<span class="rs-el">${esc(r.element||'')}</span></div>`)}
  }
  /* central ⚙️: lista de rituais */
  if(typeof R29!=='undefined'&&R29.sec==='ritual'){
    $$('#sys29main .sys29-row').forEach(li=>{
      if(li.querySelector('.rsym'))return;const k=li.querySelector('[data-e29],[data-rs29]');if(!k)return;
      let r=null;try{r=cur29('ritual',k.dataset.e29||k.dataset.rs29)}catch(e){}
      const sv=r&&ritSym32(r,'sm');if(sv){li.insertAdjacentHTML('afterbegin',sv);li.classList.add('rs-host')}
    });
    symCtl32();
  }
}
let deco32q=0;
const deco32k=()=>{if(deco32q)return;deco32q=requestAnimationFrame(()=>{deco32q=0;try{deco32()}catch(e){console.warn('[T32] símbolos',e)}})};
new MutationObserver(muts=>{for(const m of muts){if(m.addedNodes.length){deco32k();return}}}).observe(document.body,{childList:true,subtree:true});
setTimeout(deco32k,400);

/* ---------- efeito ao conjurar ---------- */
function flash32(r){
  const sv=ritSym32(r,'fx');if(!sv)return;
  const el=document.createElement('div');el.className='rs-flash';el.setAttribute('aria-hidden','true');el.innerHTML=sv;
  document.body.append(el);setTimeout(()=>el.remove(),1500);
}
{const _cast=castRitual;castRitual=async function(id){
  const before=(data.ritualHistory||[]).length;
  const out=await _cast.apply(this,arguments);
  try{if((data.ritualHistory||[]).length>before)flash32(RITUALS.find(r=>r.id===id))}catch(e){}
  return out}}
T3.ritFlash=flash32;T3.abilitiesMenu=abilitiesMenu;T3.open29=open29;

/* ---------- Mestre: trocar o símbolo de um ritual ---------- */
const SYMP32={key:null,set:false,v:null};
T3.symPending=key=>SYMP32.set&&SYMP32.key===String(key??'__new')?SYMP32.v:undefined;
function symCtl32(){
  const l2=$('e29l2');if(!l2||typeof R29==='undefined'||R29.edit?.sec!=='ritual')return;
  const host=l2.closest('.field,label,div')||l2;if($('rs32ctl'))return;
  const key=R29.edit.key;
  Object.assign(SYMP32,{key:String(key??'__new'),set:false,v:null});
  let c=null;try{c=key==null?null:cur29('ritual',key)}catch(e){}
  const box=document.createElement('fieldset');box.className='sys29-fs rs-ctl';box.id='rs32ctl';
  box.innerHTML=`<legend>Símbolo do ritual</legend><div class="rs-ctlrow"><div class="rs-prev" id="rs32prev"></div><div class="rs-ctlb">
    <label class="btn small"><input type="file" id="rs32file" accept="image/svg+xml,image/png,image/jpeg,image/webp" hidden>Enviar imagem</label>
    <button type="button" class="btn small" id="rs32off">Símbolo oficial</button>
    <button type="button" class="btn small" id="rs32none">Sem símbolo</button>
    <p class="sub" id="rs32msg">SVG, PNG, JPG ou WEBP. Imagens grandes são reduzidas automaticamente.</p></div></div>`;
  host.after(box);
  const prev=()=>{const base=c?{...c}:{name:$('e29n')?.value||'Novo',element:$('e29el')?.value||'Natureza',id:'__new'};
    const v=SYMP32.set?SYMP32.v:base.sym;const r={...base};if(v)r.sym=v;else delete r.sym;
    $('rs32prev').innerHTML=ritSym32(r,'lg')||'<span class="sub">Sem símbolo</span>';
    $('rs32off').disabled=!(SYMP32.set?SYMP32.v:base.sym)};
  prev();
  ['e29n','e29el'].forEach(id=>$(id)?.addEventListener('input',prev));$('e29el')?.addEventListener('change',prev);
  $('rs32off').onclick=()=>{Object.assign(SYMP32,{set:true,v:null});prev()};
  $('rs32none').onclick=()=>{Object.assign(SYMP32,{set:true,v:'none'});prev()};
  $('rs32file').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;
    const msg=$('rs32msg');
    try{
      if(f.size>2*1024*1024){msg.textContent='Imagem grande demais (máximo 2 MB).';return}
      let url;
      if(f.type==='image/svg+xml'){
        const txt=await f.text();
        if(/<script|on\w+\s*=|javascript:|<foreignObject/i.test(txt)){msg.textContent='Esse SVG tem código embutido. Envie um SVG simples ou um PNG.';return}
        if(txt.length>60000){msg.textContent='SVG grande demais (máximo 60 KB).';return}
        url='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(txt)));
      }else{
        const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});
        const S=192,cv=document.createElement('canvas'),k=Math.min(1,S/Math.max(img.width,img.height));
        cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        url=cv.toDataURL('image/png');if(url.length>90000)url=cv.toDataURL('image/webp',.85);
      }
      Object.assign(SYMP32,{set:true,v:url});msg.textContent='Pronto. Salve o ritual para aplicar.';prev();
    }catch(err){msg.textContent='Não consegui ler essa imagem.'}};
}

/* ---------- regras: o símbolo viaja junto com o ritual ---------- */
{const _rs=ritSet29;ritSet29=function(x,o){_rs.apply(this,arguments);if(o&&o.sym!==undefined){if(o.sym)x.sym=o.sym;else delete x.sym}}}
console.info('[Tulpa] Etapa 32 carregada (símbolos dos rituais)');

/* Sigilos autorais do grimório TULPA: emblemas dos Sub-Elementos e todos os rituais oficiais */
