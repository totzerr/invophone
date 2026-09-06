/* ═══════ PRÉPARATION DE L'IMAGE ═══════
   Objectif : donner à l'OCR une image aussi lisible que possible.
   Chaque étape est prudente : en cas de doute, on ne touche à rien.
   L'image d'origine est toujours conservée à part. */

function cnv(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}

/* Version réduite en niveaux de gris, pour analyser sans coûter cher */
function grisReduit(img,large){
 const r=Math.min(1,large/img.width);
 const c=cnv(img.width*r,img.height*r);
 const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
 const d=x.getImageData(0,0,c.width,c.height),p=d.data;
 const g=new Uint8ClampedArray(c.width*c.height);
 for(let i=0,j=0;i<p.length;i+=4,j++)g[j]=p[i]*.299+p[i+1]*.587+p[i+2]*.114;
 return{g,w:c.width,h:c.height,ratio:r};
}

/* 1. Contours du document : on cherche la zone claire (la feuille) sur fond plus sombre */
function zoneDocument(gr){
 const{g,w,h}=gr;
 const tri=Float64Array.from(g).sort();
 const seuil=tri[Math.floor(tri.length*0.55)];        /* médiane haute */
 let x0=w,y0=h,x1=0,y1=0,n=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(g[y*w+x]>seuil){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 }
 if(n<w*h*0.15)return null;                           /* pas de feuille identifiable */
 const m=Math.round(Math.min(w,h)*0.012);             /* petite marge */
 x0=Math.max(0,x0-m);y0=Math.max(0,y0-m);
 x1=Math.min(w-1,x1+m);y1=Math.min(h-1,y1+m);
 const lw=(x1-x0)/w, lh=(y1-y0)/h;
 if(lw>0.97&&lh>0.97)return null;                     /* déjà cadré : inutile de rogner */
 if(lw<0.35||lh<0.35)return null;                     /* rognage trop agressif : on refuse */
 return{x0:x0/w,y0:y0/h,x1:x1/w,y1:y1/h};
}

/* 2. Inclinaison : l'angle qui aligne le mieux les lignes de texte */
function angleInclinaison(gr){
 const{g,w,h}=gr;
 const moy=g.reduce((a,b)=>a+b,0)/g.length;
 const sombre=new Uint8Array(g.length);
 for(let i=0;i<g.length;i++)sombre[i]=g[i]<moy*0.82?1:0;   /* pixels d'encre */
 let best=0,bestScore=-1;
 for(let a=-6;a<=6;a+=0.5){
  const t=a*Math.PI/180, tan=Math.tan(t);
  const proj=new Float64Array(h+Math.abs(Math.round(tan*w))+2);
  const off=Math.max(0,Math.round(-tan*w));
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
   if(!sombre[y*w+x])continue;
   const yy=Math.round(y+tan*x)+off;
   if(yy>=0&&yy<proj.length)proj[yy]++;
  }
  /* Plus les lignes sont droites, plus la projection est contrastée */
  let m=0;for(let i=0;i<proj.length;i++)m+=proj[i];m/=proj.length;
  let v=0;for(let i=0;i<proj.length;i++){const d=proj[i]-m;v+=d*d}
  if(v>bestScore){bestScore=v;best=a}
 }
 return Math.abs(best)<0.6?0:best;                    /* on ignore les micro-angles */
}

/* 3. Contraste : étirement sur les percentiles + accentuation de la netteté */
function rehausser(ctx,w,h){
 const d=ctx.getImageData(0,0,w,h),p=d.data;
 const hist=new Uint32Array(256);
 for(let i=0;i<p.length;i+=4)hist[Math.round(p[i]*.299+p[i+1]*.587+p[i+2]*.114)]++;
 const tot=w*h;let c=0,lo=0,hi=255;
 for(let i=0;i<256;i++){c+=hist[i];if(c>tot*0.03){lo=i;break}}
 c=0;for(let i=255;i>=0;i--){c+=hist[i];if(c>tot*0.03){hi=i;break}}
 if(hi-lo<25){lo=0;hi=255}
 const ech=255/(hi-lo);
 const gris=new Float32Array(tot);
 for(let i=0,j=0;i<p.length;i+=4,j++){
  const v=Math.max(0,Math.min(255,(p[i]*.299+p[i+1]*.587+p[i+2]*.114-lo)*ech));
  gris[j]=v;
 }
 /* Accentuation : on renforce l'écart avec le voisinage (masque flou) */
 const out=new Float32Array(tot);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x;
  if(x===0||y===0||x===w-1||y===h-1){out[i]=gris[i];continue}
  const moy=(gris[i-1]+gris[i+1]+gris[i-w]+gris[i+w]+gris[i])/5;
  out[i]=Math.max(0,Math.min(255,gris[i]+(gris[i]-moy)*0.7));
 }
 for(let i=0,j=0;i<p.length;i+=4,j++){p[i]=p[i+1]=p[i+2]=out[j]}
 ctx.putImageData(d,0,0);
}

/* ═══════ CONTRÔLE QUALITÉ DE LA PHOTO ═══════
   Mesuré AVANT l'OCR, pour prévenir l'utilisateur tout de suite
   plutôt que de le laisser attendre une lecture qui échouera.
   On ne bloque jamais : on informe, l'utilisateur décide. */

/* Netteté : variance du laplacien. Une image floue a peu de contrastes locaux. */
function mesureNettete(gr){
 const{g,w,h}=gr;
 let som=0,som2=0,n=0;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const i=y*w+x;
  const l=4*g[i]-g[i-1]-g[i+1]-g[i-w]-g[i+w];
  som+=l;som2+=l*l;n++;
 }
 if(!n)return 0;
 const moy=som/n;
 return som2/n-moy*moy;                 /* variance */
}

/* Luminosité et contraste global */
function mesureLumiere(gr){
 const{g}=gr;
 let som=0,min=255,max=0;
 for(let i=0;i<g.length;i++){som+=g[i];if(g[i]<min)min=g[i];if(g[i]>max)max=g[i]}
 const moy=som/g.length;
 let v=0;for(let i=0;i<g.length;i++){const d=g[i]-moy;v+=d*d}
 return{moy,ecart:Math.sqrt(v/g.length),etendue:max-min};
}

/* Part de l'image occupée par le document */
function mesureCadrage(gr){
 const{g,w,h}=gr;
 /* Seuil à mi-chemin entre le plus sombre et le plus clair :
    stable même quand le document occupe peu de place. */
 let mn=255,mx=0;
 for(let i=0;i<g.length;i++){if(g[i]<mn)mn=g[i];if(g[i]>mx)mx=g[i]}
 const seuil=(mn+mx)/2;
 let x0=w,y0=h,x1=0,y1=0,n=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(g[y*w+x]>=seuil){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 }
 if(!n)return{part:0,zone:null,densite:0};
 const boite=((x1-x0+1)/w)*((y1-y0+1)/h);
 const densite=n/(w*h);
 /* On retient la boîte englobante du document.
    Le texte étant sombre, la densité de pixels clairs sous-estime la surface :
    elle ne sert que de garde-fou si la boîte a été gonflée par un point isolé. */
 const densiteBoite=n/Math.max(1,(x1-x0+1)*(y1-y0+1));
 const part=densiteBoite>=0.15?boite:Math.max(densite,boite*0.3);
 return{part,densite,densiteBoite,zone:zoneDocument(gr)};
}

/* Document coupé : du contenu touche un bord de l'image.
   Prudent : une simple bordure qui dépasse n'est pas un défaut. */
function mesureCoupe(gr){
 const{g,w,h}=gr;
 /* Même seuil que le cadrage : milieu entre extrêmes, comparaison inclusive */
 let mn=255,mx=0;
 for(let i=0;i<g.length;i++){if(g[i]<mn)mn=g[i];if(g[i]>mx)mx=g[i]}
 const seuil=(mn+mx)/2;
 const dense=b=>{                       /* part de pixels "document" sur une bande */
  let n=0,tot=0;
  b.forEach(([x,y])=>{if(g[y*w+x]>=seuil)n++;tot++});
  return tot?n/tot:0;
 };
 const bandes={haut:[],bas:[],gauche:[],droite:[]};
 const ep=Math.max(2,Math.round(Math.min(w,h)*0.02));
 for(let x=0;x<w;x++)for(let k=0;k<ep;k++){
  bandes.haut.push([x,k]);bandes.bas.push([x,h-1-k]);
 }
 for(let y=0;y<h;y++)for(let k=0;k<ep;k++){
  bandes.gauche.push([k,y]);bandes.droite.push([w-1-k,y]);
 }
 const cotes=Object.entries(bandes)
  .map(([c,b])=>({c,part:dense(b)}))
  .filter(x=>x.part>0.45);              /* le bord est occupé par le document : il déborde */
 return{cotes:cotes.map(x=>x.c),nb:cotes.length};
}

/* Reflet : zone très claire, étendue et concentrée, qui écrase le texte */
function mesureReflet(gr){
 const{g,w,h}=gr;
 let clairs=0;
 for(let i=0;i<g.length;i++)if(g[i]>246)clairs++;
 const part=clairs/g.length;
 if(part<0.045)return{part,concentre:false};
 /* Un reflet est groupé : on regarde si les pixels très clairs se concentrent
    dans quelques blocs plutôt que d'être répartis (papier blanc uniforme). */
 const C=6,blocs=new Array(C*C).fill(0),tailles=new Array(C*C).fill(0);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const b=Math.floor(y/h*C)*C+Math.floor(x/w*C);
  tailles[b]++;
  if(g[y*w+x]>246)blocs[b]++;
 }
 const parts=blocs.map((n,i)=>tailles[i]?n/tailles[i]:0);
 const chauds=parts.filter(p=>p>0.55).length;
 return{part,concentre:chauds>0&&chauds<=Math.ceil(C*C*0.3)};
}

/* Diagnostic complet, avec messages compréhensibles */
let _qualCache=null,_qualCle='';
function analyserQualite(img){
 /* Une même image n'est jamais analysée deux fois */
 const cle=(img.src||'').slice(-64)+'|'+img.width+'x'+img.height;
 if(_qualCache&&_qualCle===cle)return _qualCache;
 const gr=grisReduit(img,400);
 const net=mesureNettete(gr);
 const lum=mesureLumiere(gr);
 const cad=mesureCadrage(gr);
 const ang=angleInclinaison(gr);
 const cou=mesureCoupe(gr);
 const ref=mesureReflet(gr);

 const soucis=[];
 let note=100;

 if(net<45){soucis.push({k:'flou',niv:'rouge',txt:t('qFlou')});note-=45}
 else if(net<110){soucis.push({k:'flou',niv:'ambre',txt:t('qPeuNet')});note-=18}

 if(lum.moy<70){soucis.push({k:'sombre',niv:'rouge',txt:t('qSombre')});note-=35}
 else if(lum.moy>218){soucis.push({k:'clair',niv:'ambre',txt:t('qSurexpose')});note-=20}

 if(lum.etendue<70){soucis.push({k:'contraste',niv:'ambre',txt:t('qPeuContraste')});note-=18}

 if(cad.part<0.35){soucis.push({k:'loin',niv:'rouge',txt:t('qTropLoin')});note-=35}
 else if(cad.part<0.55){soucis.push({k:'loin',niv:'ambre',txt:t('qUnPeuLoin')});note-=15}

 if(Math.abs(ang)>4.5){soucis.push({k:'incline',niv:'ambre',txt:t('qIncline').replace('%a',Math.abs(ang).toFixed(1).replace('.',','))});note-=12}

 if(img.width<900||img.height<900){
  soucis.push({k:'petit',niv:'ambre',txt:t('qPetite')});note-=15;
 }

 /* Document coupé : on n'alerte qu'à partir de deux bords touchés
    (un seul bord = simple bordure qui dépasse, sans conséquence) */
 if(cou.nb>=3){soucis.push({k:'coupe',niv:'rouge',txt:t('qCoupeFort')});note-=35}
 else if(cou.nb===2){soucis.push({k:'coupe',niv:'ambre',txt:t('qCoupe')});note-=15}

 /* Reflet : seulement s'il est étendu ET concentré */
 if(ref.concentre&&ref.part>0.14){soucis.push({k:'reflet',niv:'rouge',txt:t('qRefletFort')});note-=32}
 else if(ref.concentre&&ref.part>0.075){soucis.push({k:'reflet',niv:'ambre',txt:t('qReflet')});note-=16}

 note=Math.max(0,Math.min(100,Math.round(note)));

 /* Verdict en trois niveaux */
 const rouges=soucis.filter(s=>s.niv==='rouge').length;
 let niveau,conseil;
 if(rouges>0||note<45){niveau='rouge';conseil=t('qVerdictRouge')}
 else if(soucis.length||note<78){niveau='orange';conseil=t('qVerdictOrange')}
 else{niveau='vert';conseil=t('qVerdictVert')}

 const res={note,soucis,niveau,conseil,
  bloquant:niveau==='rouge',
  exploitable:niveau!=='rouge',
  mesures:{nettete:Math.round(net),lumiere:Math.round(lum.moy),
   etendue:Math.round(lum.etendue),cadrage:Math.round(cad.part*100),
   angle:Math.round(ang*10)/10,
   bordsTouches:cou.nb,reflet:Math.round(ref.part*100)}};
 _qualCache=res;_qualCle=cle;
 return res;
}

/* Analyse une image déjà encodée (dataURL) */
function qualiteDepuisDataUrl(src){
 return new Promise(res=>{
  const img=new Image();
  img.onerror=()=>res(null);
  img.onload=()=>{try{res(analyserQualite(img))}catch(e){res(null)}};
  img.src=src;
 });
}

/* Chaîne complète : original conservé + version optimisée pour la lecture */
function prepDoc(file,ameliorer){
 return new Promise((res,rej)=>{
  if(!file){rej(new Error('nofile'));return}
  if(!/^image\//.test(file.type||'')){rej(new Error('type'));return}
  if(file.size>25*1024*1024){rej(new Error('taille'));return}
  const r=new FileReader();
  r.onerror=()=>rej(new Error('lecture'));
  r.onload=ev=>{
   const img=new Image();
   img.onerror=()=>rej(new Error('image'));
   img.onload=()=>{
    try{
     /* Image d'origine, simplement redimensionnée */
     const maxO=1400;let ow=img.width,oh=img.height;
     if(ow>oh&&ow>maxO){oh=oh*maxO/ow;ow=maxO}else if(oh>maxO){ow=ow*maxO/oh;oh=maxO}
     const co=cnv(ow,oh);co.getContext('2d').drawImage(img,0,0,ow,oh);
     const orig=co.toDataURL('image/jpeg',0.7);

     if(!ameliorer){res({prep:orig,orig,traite:{}});return}

     /* Analyse sur miniature */
     const gr=grisReduit(img,420);
     const zone=zoneDocument(gr);
     const ang=angleInclinaison(gr);

     /* Recadrage sur le document */
     let sx=0,sy=0,sw=img.width,sh=img.height;
     if(zone){sx=zone.x0*img.width;sy=zone.y0*img.height;
      sw=(zone.x1-zone.x0)*img.width;sh=(zone.y1-zone.y0)*img.height}

     const maxP=1500;let pw=sw,ph=sh;
     if(pw>ph&&pw>maxP){ph=ph*maxP/pw;pw=maxP}else if(ph>maxP){pw=pw*maxP/ph;ph=maxP}
     const c=cnv(pw,ph),x=c.getContext('2d');
     x.fillStyle='#fff';x.fillRect(0,0,pw,ph);
     if(ang){
      /* Redressement autour du centre */
      x.save();x.translate(pw/2,ph/2);x.rotate(-ang*Math.PI/180);
      x.drawImage(img,sx,sy,sw,sh,-pw/2,-ph/2,pw,ph);x.restore();
     }else{
      x.drawImage(img,sx,sy,sw,sh,0,0,pw,ph);
     }
     rehausser(x,pw,ph);
     res({prep:c.toDataURL('image/jpeg',0.72),orig,
      traite:{recadre:!!zone,angle:Math.round(ang*10)/10}});
    }catch(e){rej(new Error('traitement'))}
   };
   img.src=ev.target.result;
  };
  r.readAsDataURL(file);
 });
}

/* ═══════════════════════════════════════════════════════════
   MOTEUR OCR — Tesseract.js, exécuté dans le navigateur
   Aucune clé API, aucun serveur, aucune donnée envoyée ailleurs.
   Le moteur est téléchargé au premier usage puis mis en cache.
   ═══════════════════════════════════════════════════════════ */
