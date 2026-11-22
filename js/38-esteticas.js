/* ===================================================================
   TULPA · ETAPA 25 — Galeria de Estéticas (data-aesthetic)
   Cada estética muda cores, tipografia, cantos, vidro, sombras, bordas,
   ornamentos, estilo dos botões e textura da tela.
   =================================================================== */
const AE_CATS=[['frutiger','🌊 Frutiger'],['retro','📟 Retrô-Futurismo'],['surreal','🌀 Surreais e Liminares'],['nature','🌿 Natureza e Fantasia'],['classic','🎨 Clássicas e Customizada']];
/* id, nome, categoria, escuro?, [fundo, painel, texto, destaque, secundária], fonte do texto, fonte dos títulos,
   raio, vidro?, botão, textura, ornamento, sombra, fundo de tela, descrição */
const AE_RAW=[
 ['frutiger-aero','Frutiger Aero','frutiger',0,['#cfeefc','#f4fbff','#0b2f4a','#0a7fd0','#3fae3f'],'Hind','Varela Round',16,1,'gloss','none','none','gloss','sky','Vidro brilhante, bolhas e reflexos aqua: céu azul e grama verde.'],
 ['frutiger-metro','Frutiger Metro','frutiger',0,['#f6f4ff','#ffffff','#1d1440','#d81b6f','#0e9cc0'],'Mukta','Lexend',10,0,'flat','none','none','soft','vector','Vectordelia: vetores fluidos, formas coloridas e silhuetas modernas.'],
 ['dark-aero','Dark Aero','frutiger',1,['#04070d','#101a26','#e6f4ff','#3fd2ff','#8af0ff'],'Hind','Exo 2',14,1,'gloss','none','none','glow','smoke','Vidro fumê sobre preto profundo com reflexos neon suaves.'],
 ['helvetica-aqua','Helvetica Aqua Aero','frutiger',0,['#e6ebf2','#fbfcfe','#14223a','#1a6fe0','#8da2bf'],'Archivo','Archivo',12,0,'gel','none','none','soft','aqua','Mac OS X Aqua: botões de gel azul e listras finas.'],
 ['frutiger-eco','Frutiger Eco','frutiger',0,['#eef7e8','#fbfef7','#1d3a1e','#2a8436','#e0b232'],'Hind','Comfortaa',16,1,'gloss','none','none','soft','leaf','Natureza tecnológica: folhas, sol limpo, branco e verde orgânico.'],
 ['frutiger-aurora','Frutiger Aurora','frutiger',1,['#071621','#0f2532','#e8fbf7','#4fe3b5','#b38cff'],'Mukta','Quicksand',18,1,'gloss','none','none','glow','aurora','Gradientes boreais luminosos e ondas de luz difusa.'],
 ['technozen','Technozen','frutiger',0,['#eceeea','#f8f8f5','#2b3530','#4f7d5d','#9aa59c'],'Zen Kaku Gothic New','Zen Maru Gothic',8,0,'soft','grain','none','soft','zen','Minimalismo tecnológico sereno: bambu, água, branco e cinza.'],
 ['dorfic','DORFic','frutiger',0,['#fbfaf7','#ffffff','#1e1a17','#d63c12','#ff8a00'],'Barlow','Barlow Condensed',6,0,'flat','none','corners','soft','dorf','Daylight, Orange, Red, Futurism: branco brilhante e laranja vibrante.'],
 ['frutiger-glacier','Frutiger Glacier','frutiger',0,['#dff4fb','#f5fdff','#0c3443','#0b87a9','#7fd8ee'],'Hind','Varela Round',14,1,'gloss','none','none','gloss','ice','Gelo cristalino, ciano glacial e transparências frias.'],
 ['frutiger-jolly','Frutiger Jolly','frutiger',0,['#fff6d9','#fffdf3','#3a1f0b','#d63a2a','#2fa648'],'Nunito','Baloo 2',18,0,'gloss','none','none','soft','jolly','Cores festivas, confete e um visual amigável e luminoso.'],
 ['frutiger-evil','Frutiger Evil','frutiger',1,['#0a0204','#1c0509','#ffe6e8','#ff2a3d','#7a0d18'],'Hind','Exo 2',14,1,'gloss','none','none','glow','evil','Aero invertido: vidro vermelho-sangue e reflexos ameaçadores.'],
 ['neo-aero','Neo-Aero','frutiger',1,['#0e1430','#1a2246','#eef1ff','#7aa2ff','#c3a6ff'],'Manrope','Manrope',20,1,'gloss','none','none','soft','neo','Glassmorphism moderno com profundidade e brilhos suaves.'],
 ['cassette','Cassette Futurism','retro',1,['#1b1712','#2a241b','#ffcf7a','#ff8a1f','#6fbf6b'],'IBM Plex Mono','VT323',4,0,'emboss','scan','rivets','deep','crt','Botões físicos, monitores CRT âmbar e a nave dos anos 70-80.'],
 ['cyberpunk','Cyberpunk','retro',1,['#0a0614','#140d26','#e8f9ff','#ff2bd6','#00f0ff'],'Rajdhani','Orbitron',0,0,'chamfer','scan','brackets','glow','cyber','Neon ciano e magenta, cantos chanfrados e HUD tático.'],
 ['y2k','Y2K Futurism','retro',0,['#dfe4ec','#f3f5f9','#101c3a','#1f5bff','#a7b4c8'],'Exo 2','Michroma',14,1,'metal','none','none','gloss','chrome','Prata metálico, plástico translúcido e azul elétrico dos anos 2000.'],
 ['cybercore','Cybercore','retro',1,['#020a0a','#061615','#c8fff4','#00e896','#1e88ff'],'!Share Tech Mono','Audiowide',2,0,'neon','grid','brackets','glow','matrix','Matrizes digitais, grades e brilhos cibernéticos.'],
 ['webcore','Webcore (Old Web)','retro',0,['#008080','#c0c0c0','#000000','#000080','#808080'],'Arimo','Pixelify Sans',0,0,'bevel','pixel','none','bevel','teal','Janelas do Windows 95/98, bordas chanfradas e pixel art.'],
 ['flat','Flat Design','retro',0,['#ecf0f1','#ffffff','#2c3e50','#d63c2f','#2f86c8'],'Work Sans','Work Sans',6,0,'flat','none','none','none','flat','Cores sólidas, hierarquia limpa e nenhuma sombra.'],
 ['memphis','Corporate Memphis','retro',0,['#fdf3e7','#fffaf3','#26203d','#ee5a3b','#6c5ce7'],'DM Sans','Fredoka',22,0,'sticker','none','none','hard','memphis','Formas orgânicas ilustradas, pastéis e contraste editorial.'],
 ['vaporwave','Vaporwave','surreal',1,['#1f0f3a','#2d1652','#fdeaff','#ff71ce','#01cdfe'],'!Kosugi Maru','Monoton',4,0,'bevel','scan','none','deep','vapor','Pôr do sol rosa e roxo, estátuas, grades e azul piscina.'],
 ['synthwave','Synthwave (Outrun)','surreal',1,['#12001f','#22063a','#ffe9ff','#ff2a6d','#05d9e8'],'Rajdhani','Audiowide',6,0,'neon','scan','none','glow','synth','Grade laser magenta e roxa no horizonte retrô dos anos 80.'],
 ['seapunk','Seapunk','surreal',1,['#032b3a','#06405a','#e4fffb','#19f5d0','#ff5ec4'],'Comfortaa','Righteous',20,1,'gloss','none','none','glow','sea','Água turquesa, golfinhos e brilho 3D retrô.'],
 ['liminal','Liminal Spaces','surreal',0,['#e9dfae','#f3ecc6','#3d3a24','#806f24','#c9bb7c'],'Arimo','Arimo',2,0,'flat','grain','none','soft','liminal','Amarelo fluorescente, bege vazio e um corredor que não acaba.'],
 ['dreamcore','Dreamcore','surreal',0,['#f3ecff','#fffaff','#3c2f5c','#9a52c7','#8fd6ff'],'Quicksand','Caveat',22,1,'soft','grain','none','soft','dream','Nuvens suaves, pastéis irreais e brilho etéreo difuso.'],
 ['weirdcore','Weirdcore','surreal',0,['#f2f2f2','#ffffff','#000000','#e00000','#0000e0'],'Comic Neue','Rubik Mono One',0,0,'sticker','noise','none','hard','weird','Contraste estranho e cores primárias desconfortáveis.'],
 ['analog-horror','Analog Horror','surreal',1,['#070707','#121212','#e6e6e6','#d10f0f','#6b6b6b'],'!VT323','Special Elite',0,0,'flat','vhs','none','none','vhs','Ruído VHS, scanlines e tipografia de fita.'],
 ['cottagecore','Cottagecore','nature',0,['#efe6d2','#faf5ea','#3b2f22','#5f7340','#c98a8a'],'Lora','Playfair Display',14,0,'soft','paper','frame','soft','linen','Linho bege, verde musgo, flores secas e bordas aconchegantes.'],
 ['goblincore','Goblincore','nature',1,['#1c1a12','#2a2719','#ece3c8','#c09048','#6b7d3a'],'Alegreya','Grenze Gotisch',10,0,'emboss','paper','rivets','deep','moss','Cogumelos, musgo escuro, madeira úmida e tons de terra.'],
 ['fairycore','Fairycore','nature',0,['#f1ecfb','#fdfbff','#3a2c55','#7b4fcc','#3fb3a3'],'Quicksand','Cinzel Decorative',20,1,'gloss','none','corners','soft','fairy','Brilho lilás e verde-água, partículas de luz e encanto.'],
 ['dark-academia','Dark Academia','nature',1,['#15100b','#221911','#eadcc3','#c39448','#6e2a1e'],'EB Garamond','Cinzel',4,0,'ink','paper','frame','deep','wood','Couro, mogno, pergaminho escuro e dourado antigo.'],
 ['light-academia','Light Academia','nature',0,['#efe7db','#faf6ef','#3a2e22','#7d5f36','#b9a88a'],'Libre Baskerville','Cormorant Garamond',4,0,'ink','paper','frame','soft','marble','Mármore claro, creme, tinta sépia e biblioteca ensolarada.'],
 ['kidcore','Kidcore','nature',0,['#fff3a8','#ffffff','#1a1a1a','#e0202a','#1f6fff'],'Fredoka','Bungee',18,0,'sticker','none','none','hard','kid','Cores primárias, adesivos e alto-astral retrô.'],
 ['steampunk','Steampunk','nature',1,['#1a120a','#2b1d10','#f0dfbf','#cf9045','#8a5a2b'],'Alegreya','Rye',6,0,'emboss','paper','rivets','deep','brass','Latão, engrenagens, cobre, couro e vapor.'],
 ['solarpunk','Solarpunk','nature',0,['#f4f7e6','#fffef6','#1d3a24','#17855a','#e0aa1e'],'Outfit','Josefin Sans',16,1,'soft','none','corners','soft','sun','Ouro solar, verde-esmeralda e vitrais orgânicos.'],
 ['mcbling','McBling','nature',0,['#ffe3f3','#fff6fb','#4a0d33','#cc1878','#c0c0d8'],'Poppins','Pacifico',20,1,'metal','none','none','gloss','bling','Rosa choque, strass e brilho metálico dos anos 2000.'],
 ['indie-sleaze','Indie Sleaze','nature',1,['#0b0b0b','#171717','#f5f5f5','#ff2e93','#bfbfbf'],'Archivo Narrow','Anton',0,0,'flat','noise','none','hard','flash','Flash estourado, contraste urbano, preto, prata e magenta.'],
];
const AES=AE_RAW.map(r=>({id:r[0],name:r[1],cat:r[2],dark:!!r[3],pal:{bg:r[4][0],panel:r[4][1],text:r[4][2],accent:r[4][3],second:r[4][4]},ui:r[5],disp:r[6],rad:r[7],glass:!!r[8],btn:r[9],tex:r[10],orn:r[11],sh:r[12],bg:r[13],desc:r[14]}));
const AE_BY=Object.fromEntries(AES.map(a=>[a.id,a]));
T3.aesthetics=AES;

/* fundos de tela: camadas de gradiente com as cores da estética */
function aeBg25(a){
  const p=a.pal,A=p.accent,S=p.second,B=p.bg,P=p.panel;
  const L={
    sky:`radial-gradient(circle at 18% 22%,#ffffffcc 0 14px,#fff0 15px),radial-gradient(circle at 78% 18%,#ffffff99 0 22px,#fff0 23px),radial-gradient(circle at 64% 70%,#ffffff77 0 10px,#fff0 11px),radial-gradient(circle at 30% 82%,#ffffff66 0 18px,#fff0 19px),radial-gradient(ellipse 120% 60% at 50% 118%,#7ed957 0 40%,#7ed95700 41%),linear-gradient(180deg,#5ec8ff 0%,#bfeeff 55%,#e9fbff 100%)`,
    vector:`radial-gradient(ellipse 55% 35% at 0% 0%,${A}40,#0000 70%),radial-gradient(ellipse 45% 40% at 100% 20%,${S}40,#0000 70%),radial-gradient(ellipse 60% 30% at 70% 100%,${A}30,#0000 70%),linear-gradient(135deg,${B},${P})`,
    smoke:`radial-gradient(ellipse 70% 40% at 50% -5%,${A}55,#0000 70%),radial-gradient(ellipse 60% 30% at 50% 105%,${S}33,#0000 70%),linear-gradient(180deg,#0b1422,${B})`,
    aqua:`linear-gradient(180deg,#ffffffaa,#fff0 220px),repeating-linear-gradient(0deg,#ffffff 0 2px,#e7ecf3 2px 4px)`,
    leaf:`radial-gradient(circle at 85% 8%,#fff6c8 0 60px,#fff6c800 260px),radial-gradient(ellipse 130% 50% at 50% 112%,${A}55,#0000 60%),linear-gradient(180deg,#f8fff1,${B})`,
    aurora:`radial-gradient(ellipse 60% 30% at 20% 8%,${A}55,#0000 70%),radial-gradient(ellipse 50% 35% at 80% 0%,${S}55,#0000 70%),radial-gradient(ellipse 80% 30% at 50% 30%,#3aa0ff33,#0000 70%),linear-gradient(180deg,#04101a,${B})`,
    zen:`repeating-radial-gradient(circle at 82% 88%,#0000 0 22px,${S}26 23px 24px),linear-gradient(180deg,#f6f7f3,${B})`,
    dorf:`linear-gradient(115deg,#0000 0 62%,${A}22 62% 70%,#0000 70%),linear-gradient(115deg,#0000 0 72%,${S}26 72% 76%,#0000 76%),linear-gradient(180deg,#ffffff,${B})`,
    ice:`conic-gradient(from 200deg at 70% 20%,#ffffff66,#fff0 25%,#ffffff44 40%,#fff0 60%),linear-gradient(180deg,#f2fcff,${B} 50%,#bfe9f6)`,
    jolly:`radial-gradient(circle at 20% 30%,#ff5a4a 0 4px,#0000 5px) 0 0/180px 180px,radial-gradient(circle at 70% 60%,#ffcc00 0 5px,#0000 6px) 0 0/180px 180px,radial-gradient(circle at 45% 85%,#2f8fff 0 4px,#0000 5px) 0 0/180px 180px,radial-gradient(circle at 85% 15%,#2fb34a 0 3px,#0000 4px) 0 0/180px 180px,linear-gradient(180deg,#fffbe9,${B})`,
    evil:`radial-gradient(ellipse 70% 45% at 50% -5%,${A}55,#0000 70%),radial-gradient(ellipse 40% 30% at 85% 100%,${S}88,#0000 70%),linear-gradient(180deg,#150307,${B})`,
    neo:`radial-gradient(circle at 15% 20%,${A}40 0,#0000 30%),radial-gradient(circle at 85% 70%,${S}40 0,#0000 32%),linear-gradient(160deg,#141b40,${B})`,
    crt:`radial-gradient(ellipse at 50% 40%,${A}18,#0000 60%),radial-gradient(ellipse at 50% 50%,#0000 60%,#000a 100%),linear-gradient(${B},${B})`,
    cyber:`linear-gradient(${S}14 1px,#0000 1px) 0 0/40px 40px,linear-gradient(90deg,${S}14 1px,#0000 1px) 0 0/40px 40px,radial-gradient(ellipse 60% 40% at 80% 0%,${A}40,#0000 70%),linear-gradient(180deg,#0d0820,${B})`,
    chrome:`radial-gradient(ellipse 50% 30% at 80% 10%,${A}22,#0000 70%),linear-gradient(180deg,#ffffff 0%,#d7dde6 30%,#f4f6fa 50%,#c3ccd8 70%,#eef1f6 100%)`,
    matrix:`linear-gradient(${A}10 1px,#0000 1px) 0 0/24px 24px,linear-gradient(90deg,${A}10 1px,#0000 1px) 0 0/24px 24px,radial-gradient(ellipse at 50% 0%,${S}33,#0000 60%),linear-gradient(${B},${B})`,
    teal:`linear-gradient(${B},${B})`,
    flat:`linear-gradient(${B},${B})`,
    memphis:`radial-gradient(circle,${S}44 0 3px,#0000 4px) 0 0/38px 38px,linear-gradient(135deg,#0000 0 47%,${A}26 47% 53%,#0000 53%) 0 0/96px 96px,linear-gradient(${B},${B})`,
    vapor:`repeating-linear-gradient(180deg,#0000 0 14px,${S}40 14px 16px) 0 100%/100% 30% no-repeat,radial-gradient(circle at 50% 66%,#ffb86c 0 80px,#ff71ce99 81px,#0000 230px),linear-gradient(180deg,#2b0f54 0%,#6e2a86 55%,#c64fa7 100%)`,
    synth:`repeating-linear-gradient(180deg,#0000 0 18px,${A}44 18px 20px) 0 100%/100% 32% no-repeat,repeating-linear-gradient(90deg,#0000 0 58px,${A}33 58px 60px) 0 100%/100% 32% no-repeat,radial-gradient(ellipse 70% 25% at 50% 68%,${S}55,#0000 70%),linear-gradient(180deg,#0a0016 0%,#2a0845 62%,#12001f 100%)`,
    sea:`radial-gradient(circle at 20% 80%,#ffffff22 0 8px,#0000 9px) 0 0/160px 160px,radial-gradient(circle at 70% 30%,#ffffff1a 0 5px,#0000 6px) 0 0/120px 120px,linear-gradient(180deg,#0a6f8f 0%,#043e57 50%,${B} 100%)`,
    liminal:`linear-gradient(#0000 0 calc(100% - 1px),#8a7d4433 0) 0 0/120px 80px,linear-gradient(90deg,#0000 0 calc(100% - 1px),#8a7d4433 0) 0 0/120px 80px,radial-gradient(ellipse at 50% 0%,#fffbe0,#0000 60%),linear-gradient(${B},${B})`,
    dream:`radial-gradient(ellipse 30% 14% at 20% 25%,#ffffffcc,#fff0 70%),radial-gradient(ellipse 34% 16% at 75% 15%,#ffffffbb,#fff0 70%),radial-gradient(ellipse 40% 18% at 60% 75%,#ffffffaa,#fff0 70%),linear-gradient(180deg,#cfe6ff 0%,#f1e3ff 55%,#ffe6f3 100%)`,
    weird:`repeating-conic-gradient(#0000ff10 0 25%,#0000 0 50%) 0 0/64px 64px,radial-gradient(circle at 80% 20%,#ff000022,#0000 30%),linear-gradient(${B},${B})`,
    vhs:`radial-gradient(ellipse at 50% 50%,#0000 55%,#000c 100%),linear-gradient(${B},${B})`,
    linen:`repeating-linear-gradient(0deg,#0000 0 3px,#00000009 3px 4px),repeating-linear-gradient(90deg,#0000 0 3px,#00000009 3px 4px),radial-gradient(ellipse at 50% 0%,#fffaf0,#0000 70%),linear-gradient(${B},${B})`,
    moss:`radial-gradient(ellipse 50% 35% at 10% 100%,${S}55,#0000 70%),radial-gradient(ellipse 40% 30% at 90% 0%,${A}22,#0000 70%),linear-gradient(180deg,#22200f,${B})`,
    fairy:`radial-gradient(circle,#ffffffee 0 1.5px,#fff0 2.5px) 0 0/90px 90px,radial-gradient(circle,${S}aa 0 1px,#0000 2px) 45px 30px/120px 120px,radial-gradient(ellipse 60% 40% at 50% 0%,${A}33,#0000 70%),linear-gradient(180deg,#f8f3ff,${B})`,
    wood:`radial-gradient(ellipse at 50% 30%,#0000 40%,#000a 100%),repeating-linear-gradient(95deg,#0000 0 7px,#ffffff06 7px 9px),linear-gradient(180deg,#22170f,${B})`,
    marble:`linear-gradient(115deg,#0000 0 40%,#bfb3a033 40% 40.4%,#0000 40.6%),linear-gradient(160deg,#0000 0 66%,#b9ad9944 66% 66.3%,#0000 66.6%),radial-gradient(ellipse at 50% 0%,#ffffff,#0000 70%),linear-gradient(${B},${B})`,
    kid:`radial-gradient(circle,#e8202a33 0 6px,#0000 7px) 0 0/60px 60px,radial-gradient(circle,#1f6fff33 0 6px,#0000 7px) 30px 30px/60px 60px,linear-gradient(${B},${B})`,
    brass:`radial-gradient(ellipse at 50% 20%,${A}26,#0000 60%),radial-gradient(ellipse at 50% 50%,#0000 50%,#000b 100%),linear-gradient(180deg,#2a1a0c,${B})`,
    sun:`radial-gradient(circle at 85% 6%,#ffe58a 0 50px,#ffe58a00 300px),radial-gradient(ellipse 120% 45% at 50% 115%,${A}44,#0000 60%),linear-gradient(180deg,#fffef2,${B})`,
    bling:`radial-gradient(circle,#ffffff 0 1.5px,#fff0 2.5px) 0 0/70px 70px,radial-gradient(circle,#ffd1ec 0 2px,#0000 3px) 35px 20px/110px 110px,linear-gradient(160deg,#ffd0ea,${B} 50%,#f3d9ff)`,
    flash:`radial-gradient(circle at 12% 8%,#ffffff40 0,#0000 30%),radial-gradient(ellipse at 50% 50%,#0000 55%,#000c 100%),linear-gradient(${B},${B})`,
  };
  return L[a.bg]||L.flat;
}
/* fontes: carrega do Google Fonts só a estética escolhida (ou a categoria aberta na galeria) */
const AE_SERIF=/Garamond|Lora|Playfair|Alegreya|Baskerville|Cinzel|Grenze|Rye|Special Elite/,AE_MONO=/Mono|VT323/;
const aeFam25=f=>String(f).replace(/^!/,'');
const aeStack25=f=>{const n=aeFam25(f);return`"${n}",${AE_MONO.test(n)?'ui-monospace,Menlo,Consolas,monospace':AE_SERIF.test(n)?'Georgia,"Times New Roman",serif':'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif'}`};
function aeFontUrl25(list){
  /* "+Nome" pede os pesos 400 e 700; o resto vem só no peso normal */
  const fams=[...new Set(list)].map(f=>{const w=String(f).startsWith('+'),n=aeFam25(String(f).replace(/^\+/,'')).replace(/ /g,'+');return w?`family=${n}:wght@400;700`:`family=${n}`});
  return`https://fonts.googleapis.com/css2?${fams.join('&')}&display=swap`;
}
function aeLoadFonts25(id,list){
  try{if(!list.length)return;const url=aeFontUrl25(list);let l=document.getElementById(id);if(l&&l.href===url)return;
    if(!l){l=document.createElement('link');l.id=id;l.rel='stylesheet';document.head.append(l)}l.href=url}catch(e){}
}
/* estética customizada: cores do Personalizado + estilo escolhido */
const AE_CUST_DEF={btn:'soft',tex:'none',orn:'corners',sh:'soft',rad:12,glass:0,ui:'IBM Plex Sans',disp:'Cormorant Garamond'};
const AE_OPTS={
  btn:[['soft','Suave'],['gloss','Vidro brilhante'],['gel','Gel Aqua'],['flat','Chapado'],['neon','Neon'],['chamfer','Chanfrado'],['bevel','Windows 95'],['sticker','Adesivo'],['metal','Metálico'],['emboss','Latão em relevo'],['ink','Tinta e serifa']],
  tex:[['none','Nenhuma'],['grain','Grão leve'],['noise','Ruído'],['paper','Papel'],['scan','Scanlines CRT'],['vhs','VHS'],['pixel','Pixel'],['grid','Grade']],
  orn:[['none','Sem ornamento'],['corners','Cantoneiras'],['frame','Moldura interna'],['rivets','Rebites'],['brackets','Colchetes de HUD']],
  sh:[['soft','Suave'],['deep','Profunda'],['hard','Dura (deslocada)'],['glow','Brilho'],['gloss','Vidro'],['none','Nenhuma']],
  font:[['IBM Plex Sans|Cormorant Garamond','Clássica'],['Hind|Varela Round','Aero'],['Rajdhani|Orbitron','Futurista'],['IBM Plex Mono|VT323','Terminal'],['EB Garamond|Cinzel','Acadêmica'],['Fredoka|Bungee','Divertida'],['Lora|Playfair Display','Editorial'],['Quicksand|Caveat','Sonho']],
};
function aeCust25(){const c={...AE_CUST_DEF,...(prefs.customAe||{})};c.rad=clamp12(Number(c.rad)||0,0,28);return c}
const AE_ATTR=['aesthetic','aeBtn','aeTex','aeOrn','aeSh','aeGlass','aeCase'];
const AE_VARS=['--ae-bgimg','--ae-rad','--ae-brad','--f-ui','--f-display'];
function aeTexEl25(){let t=$('aeTex');if(!t){t=document.createElement('div');t.id='aeTex';t.setAttribute('aria-hidden','true');document.body.append(t)}return t}
function ae25(){
  const b=document.body,th=String(prefs.theme||''),A=th.startsWith('ae:')?AE_BY[th.slice(3)]:null;
  b.dataset.aeStruct='1';
  AE_ATTR.forEach(k=>delete b.dataset[k]);AE_VARS.forEach(k=>b.style.removeProperty(k));
  if(A){
    const v=customVars(A.pal);Object.entries(v).forEach(([k,val])=>b.style.setProperty(k,val));
    b.classList.add('t3-pal');b.dataset.pal='ae';b.classList.toggle('t3-dark',A.dark);document.documentElement.dataset.theme=A.dark?'dark':'light';
    Object.assign(b.dataset,{aesthetic:A.id,aeBtn:A.btn,aeTex:A.tex,aeOrn:A.orn,aeSh:A.sh,aeGlass:A.glass?'1':'0'});
    if(['cyberpunk','y2k','cybercore','synthwave'].includes(A.id))b.dataset.aeCase='up';
    b.style.setProperty('--ae-bgimg',aeBg25(A));b.style.setProperty('--ae-rad',A.rad+'px');b.style.setProperty('--ae-brad',(A.btn==='gloss'||A.btn==='gel'?999:Math.min(A.rad,14))+'px');
    b.style.setProperty('--f-ui',aeStack25(A.ui));b.style.setProperty('--f-display',aeStack25(A.disp));
    aeLoadFonts25('aeFont',[String(A.ui).startsWith('!')?A.ui:'+'+A.ui,A.disp].filter(f=>!/(IBM Plex Sans|Cormorant Garamond)$/.test(aeFam25(f))));
    const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=A.pal.bg;
    $$('.t3-themebtn').forEach(x=>{x.textContent=A.dark?'☀':'☾'});
    aeTexEl25();
  }else if(th==='custom'){
    const c=aeCust25(),[ui,disp]=String(c.font||'').split('|');
    Object.assign(b.dataset,{aesthetic:'custom',aeBtn:c.btn,aeTex:c.tex,aeOrn:c.orn,aeSh:c.sh,aeGlass:c.glass?'1':'0'});
    b.style.setProperty('--ae-rad',c.rad+'px');b.style.setProperty('--ae-brad',Math.min(c.rad,14)+'px');
    if(ui&&disp){b.style.setProperty('--f-ui',aeStack25(ui));b.style.setProperty('--f-display',aeStack25(disp));aeLoadFonts25('aeFont',[/^(VT323|Share Tech Mono|Kosugi Maru)$/.test(ui)?ui:'+'+ui,disp].filter(f=>!/(IBM Plex Sans|Cormorant Garamond)$/.test(f)))}
    aeTexEl25();
  }
  try{mapDraw7()}catch(e){}
}
{const _ap25=applyPrefs;applyPrefs=function(){const out=_ap25.apply(this,arguments);try{ae25()}catch(e){console.warn('[T25] estética',e)}return out};T3.applyPrefs=applyPrefs}
T3.ae=ae25;

/* ---------- Galeria de Estéticas (dentro de ⚙ Aparência) ---------- */
const AEG={cat:null};
const aeCur25=()=>{const th=String(prefs.theme||'');return th.startsWith('ae:')?AE_BY[th.slice(3)]:null};
function aeNowName25(){const a=aeCur25();if(a)return a.name;const p=(typeof PALETTES!=='undefined'?PALETTES:[]).find(p=>p.id===prefs.theme);return p?p.name.replace(/^🎨 /,''):'Clássica'}
function aePrev25(a){
  const btnBg=a.btn==='neon'||a.btn==='ink'?'transparent':a.pal.accent;
  return`<span class="ae-prev" style="background:${aeBg25(a).replace(/"/g,"'")},${a.pal.bg};--pp:${a.pal.panel};--pt:${a.pal.text};--pa:${a.pal.accent};--ps:${a.pal.second};--pr:${Math.min(a.rad,12)}px" data-btn="${a.btn}" data-glass="${a.glass?1:0}" aria-hidden="true">
    <span class="ae-pw"><span class="ae-pt" style="font-family:${aeStack25(a.disp).replace(/"/g,"'")}">Aa</span><span class="ae-pl"></span><span class="ae-pl s"></span><span class="ae-pb" style="background:${btnBg}"></span></span></span>`;
}
function aeCard25(a){const on=prefs.theme==='ae:'+a.id;return`<button type="button" class="ae-card${on?' on':''}" data-ae="${a.id}" role="radio" aria-checked="${on}">${aePrev25(a)}<span class="ae-name">${esc(a.name)}</span><span class="ae-desc">${esc(a.desc)}</span></button>`}
function gallery25(){
  const mb=$('modalBody');if(!mb||mb.querySelector('.ae-gal'))return;
  const grid=mb.querySelector('.pal-grid');if(!grid)return;const field=grid.closest('.field')||grid.parentElement;
  const cur=aeCur25();AEG.cat=cur?cur.cat:(AEG.cat||'frutiger');
  const g=document.createElement('section');g.className='ae-gal';
  g.innerHTML=`<div class="ae-head"><div><b class="ae-title">Galeria de Estéticas</b><span class="sub">Cada estética muda cores, letras, cantos, brilho, sombras e textura da tela inteira.</span></div><span class="ae-now">Agora: <b id="aeNow">${esc(aeNowName25())}</b></span></div>
    <div class="ae-tabs" role="tablist" aria-label="Categorias de estética">${AE_CATS.map(([k,l])=>`<button type="button" role="tab" class="ae-tab" data-aec="${k}" aria-selected="${k===AEG.cat}">${l}${k!=='classic'?` <span class="ae-n">${AES.filter(a=>a.cat===k).length}</span>`:''}</button>`).join('')}</div>
    <div class="ae-grid" id="aeGrid" role="radiogroup" aria-label="Estéticas"></div>`;
  field.before(g);field.classList.add('ae-classic');
  const lab=field.querySelector('label');if(lab&&/Paleta/.test(lab.textContent))lab.textContent='Paletas clássicas';
  const cust=mb.querySelector('#palCustom');
  if(cust&&!cust.querySelector('.ae-cust')){
    const c=aeCust25(),sel=(k,v)=>`<select data-aecu="${k}">${AE_OPTS[k].map(([val,l])=>`<option value="${val}" ${String(v)===val?'selected':''}>${l}</option>`).join('')}</select>`;
    const box=document.createElement('div');box.className='ae-cust';
    box.innerHTML=`<p class="sub">Monte o estilo da sua estética:</p><div class="ae-cgrid"><label>Botões${sel('btn',c.btn)}</label><label>Textura${sel('tex',c.tex)}</label><label>Ornamento${sel('orn',c.orn)}</label><label>Sombra${sel('sh',c.sh)}</label><label>Letras${sel('font',c.font||AE_OPTS.font[0][0])}</label><label>Cantos <input type="range" min="0" max="28" step="1" value="${c.rad}" data-aecu="rad"></label><label class="t3-check ae-cglass"><input type="checkbox" data-aecu="glass" ${c.glass?'checked':''}> Painéis de vidro</label></div>`;
    cust.append(box);
    $$('[data-aecu]',box).forEach(i=>i.oninput=()=>{const k=i.dataset.aecu,v=i.type==='checkbox'?(i.checked?1:0):i.value;prefs.customAe={...aeCust25(),[k]:k==='rad'?Number(v):v};prefs.theme='custom';savePrefs();applyPrefs();aeSync25()});
  }
  const render=()=>{
    $$('.ae-tab',g).forEach(t=>t.setAttribute('aria-selected',t.dataset.aec===AEG.cat));
    const grid2=$('aeGrid');field.classList.toggle('hide',AEG.cat!=='classic');
    if(AEG.cat==='classic'){grid2.innerHTML='';grid2.hidden=true;return}
    grid2.hidden=false;const list=AES.filter(a=>a.cat===AEG.cat);grid2.innerHTML=list.map(aeCard25).join('');
    aeLoadFonts25('aeFontPrev',list.map(a=>a.disp));
    $$('.ae-card',grid2).forEach(b=>b.onclick=()=>{prefs.theme='ae:'+b.dataset.ae;savePrefs();applyPrefs();aeSync25();if(cust)cust.classList.add('hide');T3.fx?.('click')});
  };
  $$('.ae-tab',g).forEach(t=>t.onclick=()=>{AEG.cat=t.dataset.aec;render()});
  /* setas do teclado entre as abas */
  g.querySelector('.ae-tabs').addEventListener('keydown',e=>{if(!/Arrow(Left|Right)/.test(e.key))return;const ts=$$('.ae-tab',g),i=ts.findIndex(t=>t.dataset.aec===AEG.cat),n=ts[(i+(e.key==='ArrowRight'?1:-1)+ts.length)%ts.length];AEG.cat=n.dataset.aec;render();n.focus()});
  grid.addEventListener('click',()=>setTimeout(aeSync25,0));
  render();
}
function aeSync25(){
  const mb=$('modalBody');if(!mb)return;
  $$('.ae-card',mb).forEach(b=>{const on=prefs.theme==='ae:'+b.dataset.ae;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
  $$('.pal-card',mb).forEach(b=>{const on=prefs.theme===b.dataset.pal;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
  const n=$('aeNow');if(n)n.textContent=aeNowName25();
}
{const _os25=openSettings;openSettings=function(){const out=_os25.apply(this,arguments);try{gallery25()}catch(e){console.warn('[T25] galeria',e)}return out};T3.openSettings=openSettings}
const aeRebind25=()=>$$('.t3-setbtn').forEach(b=>{if(b.onclick!==openSettings)b.onclick=openSettings});
setTimeout(aeRebind25,0);setTimeout(aeRebind25,1500);setInterval(aeRebind25,5000);
try{ae25()}catch(e){}

