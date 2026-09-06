const OCR={
 CDN:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
 WORKER:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
 CORE:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/',
 LANG:'https://tessdata.projectnaptha.com/4.0.0',
 detail:'',                       /* dernière erreur technique, affichée à l'utilisateur */

 async charger(){
  if(typeof Tesseract!=='undefined')return true;
  try{
   await new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=OCR.CDN;s.async=true;
    s.onload=res;s.onerror=()=>rej(new Error('cdn'));
    document.head.appendChild(s);
    setTimeout(()=>rej(new Error('delai')),40000);
   });
   return typeof Tesseract!=='undefined';
  }catch(e){OCR.detail='chargement : '+(e.message||e);return false}
 },

 /* Trois méthodes essayées dans l'ordre : certains navigateurs intégrés
    (aperçu dans une app, WebView) bloquent les Web Workers ou les blob:.
    On dégrade proprement au lieu d'échouer d'un bloc. */
 async lire(images,prog){
  if(!await OCR.charger())throw new Error('moteur');
  const erreurs=[];

  /* ── Méthode 1 : worker avec chemins explicites (le plus fiable) ── */
  try{
   const w=await Tesseract.createWorker('fra',1,{
    workerPath:OCR.WORKER, corePath:OCR.CORE, langPath:OCR.LANG,
    logger:m=>{if(m.status==='recognizing text'&&prog)prog(m.progress)}
   });
   try{
    const pages=[];
    for(let i=0;i<images.length;i++){
     if(prog)prog(0,i+1,images.length);
     const{data}=await w.recognize(images[i]);
     pages.push({texte:data.text||'',
      lignes:(data.lines||[]).map(l=>({t:(l.text||'').trim(),c:l.confidence||0})),
      mots:(data.words||[]).map(m=>({t:(m.text||'').trim(),c:m.confidence||0,
       x0:m.bbox?m.bbox.x0:0,x1:m.bbox?m.bbox.x1:0,y0:m.bbox?m.bbox.y0:0,y1:m.bbox?m.bbox.y1:0})),
      conf:data.confidence||0});
    }
    return pages;
   }finally{try{await w.terminate()}catch(e){}}
  }catch(e1){erreurs.push('worker: '+(e1&&e1.message||e1))}

  /* ── Méthode 2 : worker par défaut, sans chemins imposés ── */
  try{
   const w=await Tesseract.createWorker('fra',1,{
    logger:m=>{if(m.status==='recognizing text'&&prog)prog(m.progress)}
   });
   try{
    const pages=[];
    for(let i=0;i<images.length;i++){
     if(prog)prog(0,i+1,images.length);
     const{data}=await w.recognize(images[i]);
     pages.push({texte:data.text||'',
      lignes:(data.lines||[]).map(l=>({t:(l.text||'').trim(),c:l.confidence||0})),
      mots:(data.words||[]).map(m=>({t:(m.text||'').trim(),c:m.confidence||0,
       x0:m.bbox?m.bbox.x0:0,x1:m.bbox?m.bbox.x1:0,y0:m.bbox?m.bbox.y0:0,y1:m.bbox?m.bbox.y1:0})),
      conf:data.confidence||0});
    }
    return pages;
   }finally{try{await w.terminate()}catch(e){}}
  }catch(e2){erreurs.push('defaut: '+(e2&&e2.message||e2))}

  /* ── Méthode 3 : appel direct, sans gérer le worker nous-mêmes ── */
  try{
   const pages=[];
   for(let i=0;i<images.length;i++){
    if(prog)prog(0,i+1,images.length);
    const{data}=await Tesseract.recognize(images[i],'fra',{
     logger:m=>{if(m.status==='recognizing text'&&prog)prog(m.progress)}
    });
    pages.push({texte:data.text||'',
     lignes:(data.lines||[]).map(l=>({t:(l.text||'').trim(),c:l.confidence||0})),
     mots:(data.words||[]).map(m=>({t:(m.text||'').trim(),c:m.confidence||0,
      x0:m.bbox?m.bbox.x0:0,x1:m.bbox?m.bbox.x1:0,y0:m.bbox?m.bbox.y0:0,y1:m.bbox?m.bbox.y1:0})),
     conf:data.confidence||0});
   }
   return pages;
  }catch(e3){erreurs.push('direct: '+(e3&&e3.message||e3))}

  OCR.detail=erreurs.join(' | ');
  throw new Error('worker');
 }
};

/* ═══════ ANALYSE DU DOCUMENT ═══════
   Transforme le texte brut de l'OCR en données structurées.
   Chaque information extraite porte un indice de fiabilité :
   tout ce qui est douteux est signalé, jamais deviné en silence. */

const sansAcc=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const normProd=s=>sansAcc(s).toLowerCase()
 .replace(/\b\d+[\s,.]?\d*\s*(cl|ml|l|kg|g|gr)\b/g,' ')   /* retire les contenances */
 .replace(/\bx\s*\d+\b/g,' ')
 .replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();

/* Nombre à la française : "1 234,56" ou "15.20" */
function nbFr(s){
 if(s==null)return NaN;
 let x=String(s).replace(/\s/g,'');
 if(x.includes(',')&&x.includes('.'))x=x.replace(/\./g,'');      /* 1.234,56 */
 x=x.replace(',','.');
 const v=parseFloat(x);
 return isNaN(v)?NaN:v;
}

const UNITES_OCR={btl:'btl',bt:'btl',bouteille:'btl',bouteilles:'btl',blle:'btl',
 kg:'kg',kgs:'kg',g:'g',gr:'g',l:'L',lt:'L',litre:'L',litres:'L',cl:'cl',ml:'ml',
 pc:'u',pce:'u',pces:'u',piece:'u',pieces:'u',u:'u',un:'u',unite:'u',unites:'u',
 carton:'carton',cart:'carton',ct:'carton',colis:'carton',caisse:'carton',cs:'carton',
 pack:'carton',lot:'carton',fut:'fut',sac:'sac',bidon:'bidon',boite:'boite',bte:'boite'};

const RE_TOTAUX=/(total|t\.?v\.?a\b|net\s*a\s*payer|montant\s|remise|port\b|acompte|escompte|franco|sous.?total|arrondi)/i;
/* Lignes d'en-tête / de pied à ne jamais prendre pour des produits */
const RE_ENTETE=/^(bon\s*de\s*livraison|bon\s*n|facture|devis|commande|date|n[°o ]|client|adresse|t[ée]l|siret|ape\b|tva\s*intra|page\s|code\s*client|r[ée]f[ée]rence\s*client|d[ée]signation|libell[ée]|article\s*d[ée]signation|conditions|signature|cachet|livr[ée]\s*le|merci)/i;

/* Nombres : "1 234,56" accepté (espace + 3 chiffres), mais deux nombres
   séparés par plusieurs espaces ne doivent JAMAIS fusionner. */
const RE_NOMBRE=/\d{1,3}(?: \d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g;

function nombresDe(txt){
 const out=[];let m;RE_NOMBRE.lastIndex=0;
 while((m=RE_NOMBRE.exec(txt))!==null){
  const v=nbFr(m[0]);
  if(!isNaN(v))out.push({v,txt:m[0],i:m.index,fin:m.index+m[0].length,dec:/[.,]\d{1,2}$/.test(m[0])});
 }
 return out;
}

/* ── Extraction des lignes de produits ── */
function extraireLignes(lignesOcr){
 const out=[];
 lignesOcr.forEach(L=>{
  let brut=(L.t||'').trim();
  if(brut.length<4)return;
  const sa=sansAcc(brut);
  if(RE_TOTAUX.test(sa))return;
  if(RE_ENTETE.test(sa.trim()))return;
  if((brut.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3)return;

  /* Référence en début de ligne, retirée avant analyse des nombres */
  let ref='';
  const mr=brut.match(/^\s*([A-Z0-9][A-Z0-9\-\/\.]{3,15})(?=\s)/i);
  if(mr&&/\d/.test(mr[1])&&/[A-Z]/i.test(mr[1])&&!/^\d/.test(mr[1])){
   ref=mr[1].toUpperCase();brut=brut.slice(mr[0].length);
  }

  const nums=nombresDe(brut);
  if(!nums.length)return;

  /* Les montants : nombres à décimales. Les deux derniers = PU puis total. */
  const decs=nums.filter(n=>n.dec);
  let px=NaN,tot=NaN,posPrix=Infinity;
  if(decs.length>=2){px=decs[decs.length-2].v;tot=decs[decs.length-1].v;posPrix=decs[decs.length-2].i}
  else if(decs.length===1){px=decs[0].v;posPrix=decs[0].i}

  /* La quantité est le dernier nombre situé AVANT la colonne des prix */
  let qte=NaN,posQ=-1;
  const avant=nums.filter(n=>n.i<posPrix&&!n.dec);
  if(avant.length){const c=avant[avant.length-1];qte=c.v;posQ=c.fin}
  else{
   const e=nums.filter(n=>!n.dec&&Number.isInteger(n.v)&&n.v>0&&n.v<10000);
   if(e.length){qte=e[0].v;posQ=e[0].fin}
  }

  /* Unité : mot suivant immédiatement la quantité */
  let unite='';
  if(posQ>=0){
   const mu=brut.slice(posQ,posQ+12).match(/^\s*([a-zà-ÿ]{1,8})\b/i);
   if(mu)unite=UNITES_OCR[sansAcc(mu[1]).toLowerCase()]||'';
  }

  /* Une ligne produit doit avoir soit un prix, soit quantité + unité */
  if(isNaN(px)&&!(qte>0&&unite))return;

  /* Cohérence quantité × prix = total ; sinon on recalcule la quantité */
  let coherent=null;
  if(!isNaN(qte)&&!isNaN(px)&&!isNaN(tot)&&px>0){
   coherent=Math.abs(qte*px-tot)<Math.max(0.05,tot*0.02);
   if(!coherent){
    const q2=tot/px;
    if(q2>0&&q2<10000&&Math.abs(q2-Math.round(q2*100)/100)<0.001){
     qte=Math.round(q2*100)/100;coherent=null;
    }
   }
  }

  /* Libellé : texte restant, nettoyé */
  let label=brut.replace(RE_NOMBRE,' ')
   .replace(/\b(btl|bt|blle|kg|kgs|gr?|lt?|litres?|cl|ml|pcs?|pces?|pi[eè]ces?|un|unit[ée]s?|cart|carton|ct|colis|caisse|cs|pack|lot|bte|bo[iî]te|fut|sac|bidon|eur|€|ht|ttc|tva)\b/gi,' ')
   .replace(/[^A-Za-zÀ-ÿ0-9 %'\-]/g,' ').replace(/\s+/g,' ').trim();
  if((label.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3)return;

  /* Ce qui est douteux est signalé, jamais corrigé en silence */
  const inc=[],confL=L.c||0;
  if(isNaN(qte)||qte<=0)inc.push('q'); else if(confL&&confL<72)inc.push('q');
  if(isNaN(px)||px<=0)inc.push('px'); else if(confL&&confL<65)inc.push('px');
  if(coherent===false){inc.push('q');inc.push('px')}

  out.push({ref,label,q:isNaN(qte)?'':qte,unite,
   px:isNaN(px)?'':Math.round(px*10000)/10000,
   total:isNaN(tot)?'':tot,conf:Math.round(confL),inc:[...new Set(inc)]});
 });
 return out;
}

/* ── Totaux, fournisseur, numéro et date ── */
function extraireEntete(texte,lignesOcr){
 const T=sansAcc(texte||'');
 /* Un total se lit sur SA ligne : on prend le dernier nombre, en ignorant les % */
 const totalDe=re=>{
  for(const L of (lignesOcr||[])){
   const s=sansAcc(L.t||'');
   if(!re.test(s))continue;
   const ns=nombresDe(s.replace(/\d+\s*%/g,' '));
   if(ns.length)return ns[ns.length-1].v;
  }
  return NaN;
 };
 const ht =totalDe(/total\s*h\.?\s*t\.?/i);
 const tva=totalDe(/t\.?\s*v\.?\s*a\.?/i);
 const ttc=totalDe(/total\s*t\.?\s*t\.?\s*c\.?|net\s*a\s*payer/i);

 let bl='',blC=0;
 let m=T.match(/(?:bon\s*de\s*livraison|b\.?\s?l\.?)\s*(?:n[°o]?)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]{3,20})/i);
 if(!m)m=T.match(/n[°o]\s*[:\-]?\s*([A-Z]{0,4}[-\s]?\d{4,12})/i);
 if(m){bl=m[1].replace(/\s/g,'').toUpperCase();blC=0.8}

 let date='',dateC=0;
 const dm=[...T.matchAll(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/g)];
 for(const d of dm){
  let j=+d[1],mo=+d[2],a=+d[3];
  if(a<100)a+=2000;
  if(j>=1&&j<=31&&mo>=1&&mo<=12&&a>=2015&&a<=2100){
   date=`${a}-${String(mo).padStart(2,'0')}-${String(j).padStart(2,'0')}`;dateC=0.85;break;
  }
 }

 let fo='',foC=0;
 const connus=[...new Set(st.prods.map(p=>p.fo).filter(Boolean))];
 for(const f of connus){
  if(f.length>2&&sansAcc(T).toLowerCase().includes(sansAcc(f).toLowerCase())){fo=f;foC=0.95;break}
 }
 if(!fo){
  for(const L of (lignesOcr||[]).slice(0,8)){
   const s=(L.t||'').trim();
   if(s.length<3||s.length>40)continue;
   if(/\d{2}[\/\-.]\d{2}/.test(s))continue;
   if(RE_TOTAUX.test(sansAcc(s))||RE_ENTETE.test(sansAcc(s)))continue;
   if((s.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3)continue;
   fo=s.replace(/[^A-Za-zÀ-ÿ0-9 &'\-.]/g,'').trim();foC=0.4;break;
  }
 }
 return{fo,foC,bl,blC,date,dateC,
  ht:isNaN(ht)?'':ht,tva:isNaN(tva)?'':tva,ttc:isNaN(ttc)?'':ttc};
}

/* ═══════ ANALYSE DE LA STRUCTURE DU TABLEAU ═══════
   Au lieu de deviner par expressions régulières sur une ligne de texte,
   on regroupe les mots par ligne puis par colonne, à partir de leur
   position réelle sur l'image. C'est ce qui permet de distinguer
   la quantité du prix quand les deux sont des nombres. */

/* Regroupe les mots en lignes selon leur chevauchement vertical */
function motsEnLignes(mots){
 if(!mots||!mots.length)return [];
 const ms=mots.filter(m=>m.t&&m.t.length).sort((a,b)=>a.y0-b.y0);
 const hMoy=ms.reduce((s,m)=>s+(m.y1-m.y0),0)/ms.length||10;
 const lignes=[];
 ms.forEach(m=>{
  const cy=(m.y0+m.y1)/2;
  let L=lignes.find(l=>Math.abs(l.cy-cy)<hMoy*0.6);
  if(!L){L={cy,mots:[],y0:m.y0,y1:m.y1};lignes.push(L)}
  L.mots.push(m);
  L.cy=(L.cy*(L.mots.length-1)+cy)/L.mots.length;
  L.y0=Math.min(L.y0,m.y0);L.y1=Math.max(L.y1,m.y1);
 });
 lignes.forEach(l=>{
  l.mots.sort((a,b)=>a.x0-b.x0);
  l.t=l.mots.map(m=>m.t).join(' ');
  l.c=l.mots.reduce((s,m)=>s+(m.c||0),0)/l.mots.length;
  l.x0=Math.min(...l.mots.map(m=>m.x0));
  l.x1=Math.max(...l.mots.map(m=>m.x1));
 });
 return lignes.sort((a,b)=>a.cy-b.cy);
}

/* Cherche la ligne d'en-tête du tableau et en déduit les colonnes */
const ENTETES={
 ref:/^(ref|réf|reference|référence|code|article|art)\.?$/i,
 des:/^(designation|désignation|libelle|libellé|produit|description|article)$/i,
 qte:/^(qte|qté|quantite|quantité|q\.?t\.?é?|nb|nbre|livre|livré)\.?$/i,
 uni:/^(un|unite|unité|u\.?m\.?|cond|conditionnement|format)\.?$/i,
 pu:/^(pu|p\.u\.?|prix|tarif|unitaire)$/i,
 tot:/^(total|montant|mt|net)$/i
};
function detecterColonnes(lignes){
 for(let i=0;i<Math.min(lignes.length,25);i++){
  const L=lignes[i];const trouv={};
  L.mots.forEach(m=>{
   const t=sansAcc(m.t).replace(/[^a-zé]/gi,'').toLowerCase();
   for(const[cle,re]of Object.entries(ENTETES)){
    if(re.test(t)&&!trouv[cle])trouv[cle]={x0:m.x0,x1:m.x1,cx:(m.x0+m.x1)/2};
   }
  });
  /* Un vrai en-tête de tableau contient au moins une désignation et une quantité ou un prix */
  const n=Object.keys(trouv).length;
  if(n>=3&&(trouv.des||trouv.ref)&&(trouv.qte||trouv.pu||trouv.tot)){
   return{cols:trouv,ligneEntete:i,fiable:true};
  }
 }
 return null;
}

/* Construit les lignes produits à partir des colonnes détectées */
function lignesParColonnes(lignes,struct){
 const{cols,ligneEntete}=struct;
 const bornes=[];
 const ordre=['ref','des','qte','uni','pu','tot'].filter(k=>cols[k]);
 ordre.sort((a,b)=>cols[a].cx-cols[b].cx);
 ordre.forEach((k,i)=>{
  const prec=i>0?cols[ordre[i-1]]:null;
  const suiv=i<ordre.length-1?cols[ordre[i+1]]:null;
  bornes.push({k,
   min:prec?(prec.cx+cols[k].cx)/2:-Infinity,
   max:suiv?(cols[k].cx+suiv.cx)/2:Infinity});
 });
 const colDe=x=>{const b=bornes.find(b=>x>=b.min&&x<b.max);return b?b.k:null};

 const items=[];
 /* On recolle d'abord les désignations coupées sur deux lignes */
 const colDes=bornes.find(b=>b.k==='des')||null;
 const corps=fusionnerLignesCoupees(lignes.slice(ligneEntete+1),colDes);
 for(let i=0;i<corps.length;i++){
  const L=corps[i];
  const sa=sansAcc(L.t);
  if(RE_TOTAUX.test(sa))continue;
  if(RE_ENTETE.test(sa.trim()))continue;
  if((L.t.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3)continue;

  const cell={};
  L.mots.forEach(m=>{
   const k=colDe((m.x0+m.x1)/2);
   if(!k)return;
   (cell[k]=cell[k]||[]).push(m);
  });
  const txt=k=>(cell[k]||[]).map(m=>m.t).join(' ').trim();
  const conf=k=>{const a=cell[k]||[];return a.length?a.reduce((s,m)=>s+(m.c||0),0)/a.length:0};
  const num1=k=>{const ns=nombresDe(txt(k));return ns.length?ns[ns.length-1].v:NaN};

  const label=txt('des')||txt('ref');
  if((label.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3)continue;

  let q=num1('qte'), pu=num1('pu'), tot=num1('tot');
  const ref=(txt('ref')||'').toUpperCase().replace(/\s/g,'');
  let unite=UNITES_OCR[sansAcc(txt('uni')).toLowerCase().replace(/[^a-z]/g,'')]||'';

  /* Cohérence : si q × pu ≠ total, on privilégie le total (souvent mieux imprimé) */
  let coherent=null;
  if(!isNaN(q)&&!isNaN(pu)&&!isNaN(tot)&&pu>0){
   coherent=Math.abs(q*pu-tot)<Math.max(0.05,tot*0.02);
   if(!coherent){const q2=tot/pu;if(q2>0&&q2<10000){q=Math.round(q2*100)/100;coherent=null}}
  }
  if(isNaN(pu)&&!isNaN(tot)&&q>0)pu=tot/q;

  const inc=[];
  const cq=conf('qte'),cp=conf('pu'),cd=conf('des');
  if(isNaN(q)||q<=0)inc.push('q'); else if(cq&&cq<75)inc.push('q');
  if(isNaN(pu)||pu<=0)inc.push('px'); else if(cp&&cp<70)inc.push('px');
  if(coherent===false){inc.push('q');inc.push('px')}

  items.push({__y:(L.y0+L.y1)/2,__h:Math.max(1,L.y1-L.y0),
   ref:/\d/.test(ref)?ref:'',label:nettoyerLabel(label),
   q:isNaN(q)?'':q,unite,px:isNaN(pu)?'':Math.round(pu*10000)/10000,
   total:isNaN(tot)?'':tot,conf:Math.round(cd||L.c||0),
   confQ:Math.round(cq||0),confPx:Math.round(cp||0),
   inc:[...new Set(inc)],src:'colonnes'});
 }
 return items;
}

function nettoyerLabel(s){
 return String(s||'')
  .replace(/\b(caisse|colis|carton|pack|lot|bo[iî]te|bte|paquet)\s*(?:de\s*)?\d{1,3}\b/gi,' ')
  .replace(/\bx\s*\d{1,3}\b/gi,' ')
  .replace(RE_NOMBRE,' ')
  .replace(/\b(btl|bt|blle|kg|kgs|gr?|lt?|litres?|cl|ml|pcs?|pces?|pi[eè]ces?|un|unit[ée]s?|cart|carton|ct|colis|caisse|cs|pack|lot|bte|bo[iî]te|fut|sac|bidon|eur|€|ht|ttc|tva)\b/gi,' ')
  .replace(/[^A-Za-zÀ-ÿ0-9 %'\-]/g,' ').replace(/\s+/g,' ').trim();
}

/* ═══════ FUSION DES LIGNES COUPÉES ═══════
   Une désignation longue est souvent imprimée sur deux lignes.
   On ne fusionne que si l'on est raisonnablement sûr qu'il s'agit
   de la suite du produit précédent, jamais de deux produits distincts. */

/* La ligne ressemble-t-elle à une suite de désignation ? */
function estSuite(L,prec,colDes){
 if(!L||!prec)return false;
 const txt=(L.t||'').trim();
 if(txt.length<2)return false;
 const sa=sansAcc(txt);
 if(RE_TOTAUX.test(sa)||RE_ENTETE.test(sa.trim()))return false;

 /* Une suite n'a ni quantité ni prix : que du texte */
 const ns=nombresDe(txt);
 const aDecimale=ns.some(n=>n.dec);
 if(aDecimale)return false;                       /* un prix => nouvelle ligne produit */
 const lettres=(txt.match(/[A-Za-zÀ-ÿ]/g)||[]).length;
 if(lettres<2)return false;
 if(lettres<txt.length*0.4)return false;          /* surtout des chiffres => pas une suite */

 /* Elle doit rester dans la colonne désignation, pas déborder à droite */
 if(colDes&&L.mots&&L.mots.length){
  const dedans=L.mots.filter(m=>(m.x0+m.x1)/2<colDes.max).length;
  if(dedans/L.mots.length<0.75)return false;
 }
 /* Verticalement proche de la ligne précédente */
 if(prec.y1&&L.y0){
  const h=Math.max(1,prec.y1-prec.y0);
  if(L.y0-prec.y1>h*1.2)return false;             /* trop loin : autre bloc */
 }
 /* Un début de référence => c'est une nouvelle ligne, pas une suite */
 if(/^\s*[A-Z0-9]{4,}[-\/]?\d/.test(txt)&&/\d/.test(txt.slice(0,8)))return false;
 return true;
}

/* Fusionne les suites dans la ligne produit qui précède */
function fusionnerLignesCoupees(lignes,colDes){
 const out=[];
 for(let i=0;i<lignes.length;i++){
  const L=lignes[i];
  const prec=out.length?out[out.length-1]:null;
  if(prec&&prec.__produit&&estSuite(L,prec,colDes)){
   prec.t=(prec.t+' '+L.t).replace(/\s+/g,' ').trim();
   prec.mots=(prec.mots||[]).concat(L.mots||[]);
   prec.y1=Math.max(prec.y1||0,L.y1||0);
   prec.c=Math.min(prec.c||100,L.c||100);
   prec.__fusion=(prec.__fusion||0)+1;
   continue;
  }
  const copie=Object.assign({},L);
  /* Une ligne produit contient au moins un nombre décimal ou une quantité */
  const ns=nombresDe(copie.t||'');
  copie.__produit=ns.length>0&&(copie.t||'').match(/[A-Za-zÀ-ÿ]{3,}/);
  out.push(copie);
 }
 return out;
}

/* Conditionnement : "caisse de 24", "x6", "colis de 12" */
function detecterCond(txt){
 const s=sansAcc(String(txt||'')).toLowerCase();
 let m=s.match(/(caisse|colis|carton|pack|lot|bo[iî]te|bte|paquet)\s*(?:de\s*)?(\d{1,3})\b/);
 if(m)return{type:m[1],par:+m[2]};
 m=s.match(/\bx\s*(\d{1,3})\b/);
 if(m&&+m[1]>1&&+m[1]<=200)return{type:'lot',par:+m[1]};
 return null;
}

/* ── Fusion multi-pages avec suppression des doublons ── */
function fusionnerPages(pages){
 const toutesLignes=[],texte=pages.map(p=>p.texte).join('\n');
 pages.forEach(p=>toutesLignes.push(...(p.lignes||[])));
 const items=[];
 let methode='lignes',structOk=0;

 pages.forEach((p,ip)=>{
  let extraits=[];
  if(p.mots&&p.mots.length){
   const lg=motsEnLignes(p.mots);
   const st_=detecterColonnes(lg);
   if(st_){extraits=lignesParColonnes(lg,st_);structOk++;}
  }
  if(!extraits.length)extraits=extraireLignes(p.lignes||[]);

  /* ── Dédoublonnage prudent ──
     Une même ligne peut légitimement apparaître deux fois sur un bon
     (deux lots, deux dates de péremption). On ne supprime que ce qui
     est certainement une relecture OCR de la MÊME rangée :
     même page, et lignes voisines verticalement.
     Entre deux pages, on ne supprime jamais : on signale. */
  extraits.forEach((it,ix)=>{
   it.page=ip;
   it.cond=detecterCond(it.label)||null;
   const cle=normProd(it.label)+'|'+it.q+'|'+it.px;

   const jumeauMemePage=items.find(o=>o.page===ip&&o.__cle===cle&&
    o.__y!==undefined&&it.__y!==undefined&&Math.abs(o.__y-it.__y)<(it.__h||20)*1.6);
   if(jumeauMemePage){
    jumeauMemePage.__relu=(jumeauMemePage.__relu||1)+1;   /* relecture OCR : ignorée */
    return;
   }
   const jumeauAilleurs=items.find(o=>o.__cle===cle);
   if(jumeauAilleurs){
    it.doublonPossible=true;                              /* signalé, jamais supprimé */
    if(!it.inc)it.inc=[];
    if(!it.inc.includes('prod'))it.inc.push('prod');
   }
   it.__cle=cle;
   items.push(it);
  });
 });
 if(structOk)methode=structOk===pages.length?'colonnes':'mixte';
 return{texte,lignes:toutesLignes,items,methode,
  conf:pages.reduce((a,p)=>a+(p.conf||0),0)/(pages.length||1)};
}

/* ═══════ CONTRÔLES DE COHÉRENCE ═══════
   Une donnée douteuse est signalée, jamais corrigée en silence.
   Tout se fait localement, sans appel réseau. */

/* Historique des prix d'achat déjà payés pour un produit */
function prixHistorique(prodId){
 const px=[];
 (st.liv||[]).forEach(l=>(l.lines||[]).forEach(x=>{
  if(x.id===prodId&&x.px>0)px.push(x.px);
 }));
 const p=prod(prodId);
 if(p&&p.px>0)px.push(p.px);
 return px;
}

/* Quantités habituellement reçues pour un produit */
function qteHistorique(prodId){
 const q=[];
 (st.liv||[]).forEach(l=>(l.lines||[]).forEach(x=>{
  if(x.id===prodId&&x.q>0)q.push(x.q);
 }));
 return q;
}
const mediane=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);
 const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};

/* Contrôle complet d'un scan : renvoie la liste des anomalies détectées */
function controlerCoherence(s){
 const A=[];
 const lignes=s.lines||[];

 lignes.forEach((l,i)=>{
  const q=num(l.q), px=num(l.px), tot=num(l.total);
  const nom=l.label||(prod(l.id)?prod(l.id).n:t('scLigne')+' '+(i+1));

  /* a. Multiplication quantité × prix = total imprimé */
  if(q>0&&px>0&&tot>0){
   const ecart=Math.abs(q*px-tot);
   if(ecart>Math.max(0.05,tot*0.02)){
    A.push({i,champ:'q',niv:'rouge',
     txt:t('ctrlMulti').replace('%n',nom)
      .replace('%c',fmt(q*px)).replace('%t',fmt(tot))});
   }
  }
  /* b. Quantité manquante ou absurde */
  if(!(q>0)) A.push({i,champ:'q',niv:'rouge',txt:t('ctrlQteVide').replace('%n',nom)});
  else if(q>2000) A.push({i,champ:'q',niv:'ambre',txt:t('ctrlQteEnorme').replace('%n',nom).replace('%q',fmtQ(q))});
  else if(!Number.isInteger(q)&&q<1) A.push({i,champ:'q',niv:'ambre',txt:t('ctrlQtePetite').replace('%n',nom).replace('%q',fmtQ(q))});

  /* c. Prix manquant ou hors norme */
  if(!(px>0)) A.push({i,champ:'px',niv:'ambre',txt:t('ctrlPxVide').replace('%n',nom)});
  else if(px>3000) A.push({i,champ:'px',niv:'ambre',txt:t('ctrlPxEnorme').replace('%n',nom).replace('%p',fmt(px))});

  /* d. Comparaison au prix habituel : un « 1 » lu « 4 » se voit ici */
  if(l.id&&px>0){
   const hist=prixHistorique(l.id), med=mediane(hist);
   if(med&&med>0){
    const r=px/med;
    if(r>1.6||r<0.55){
     A.push({i,champ:'px',niv:r>2.5||r<0.4?'rouge':'ambre',
      txt:t('ctrlPxInhab').replace('%n',nom).replace('%p',fmt(px)).replace('%h',fmt(med))});
    }
   }
  }

  /* e. Comparaison à la quantité habituelle */
  if(l.id&&q>0){
   const hq=qteHistorique(l.id), mq=mediane(hq);
   if(mq&&mq>0&&hq.length>=2){
    const r=q/mq;
    if(r>5||r<0.2){
     A.push({i,champ:'q',niv:'ambre',
      txt:t('ctrlQteInhab').replace('%n',nom).replace('%q',fmtQ(q)).replace('%h',fmtQ(mq))});
    }
   }
  }

  /* f. Doublon de ligne à l'intérieur du même bon */
  const jumeau=lignes.findIndex((o,j)=>j<i&&o.id&&o.id===l.id&&num(o.q)===q&&num(o.px)===px);
  if(jumeau>=0&&q>0){
   A.push({i,champ:'prod',niv:'ambre',txt:t('ctrlDoublonLigne').replace('%n',nom)});
  }
 });

 /* g. Somme des lignes contre le total du document */
 const somme=lignes.reduce((a,l)=>a+num(l.q)*num(l.px),0);
 const htDoc=num(s.ht), ttcDoc=num(s.ttc), tvaDoc=num(s.tva);
 let ecartHT=null;
 if(htDoc>0&&somme>0){
  const d=Math.abs(somme-htDoc);
  ecartHT=d;
  if(d>Math.max(0.5,htDoc*0.02)){
   A.push({i:-1,champ:'total',niv:d>htDoc*0.1?'rouge':'ambre',
    txt:t('ctrlSomme').replace('%s',fmt(somme)).replace('%h',fmt(htDoc)).replace('%d',fmt(d))});
  }
 }
 /* h. Cohérence HT + TVA = TTC */
 if(htDoc>0&&tvaDoc>0&&ttcDoc>0){
  const d=Math.abs(htDoc+tvaDoc-ttcDoc);
  if(d>Math.max(0.05,ttcDoc*0.01)){
   A.push({i:-1,champ:'total',niv:'ambre',
    txt:t('ctrlHtTva').replace('%h',fmt(htDoc)).replace('%v',fmt(tvaDoc)).replace('%t',fmt(ttcDoc))});
  }
 }
 /* i. Taux de TVA plausible (5,5 / 10 / 20 %) */
 if(htDoc>0&&tvaDoc>0){
  const taux=tvaDoc/htDoc*100;
  const connus=[2.1,5.5,10,20];
  if(!connus.some(x=>Math.abs(taux-x)<0.6)){
   A.push({i:-1,champ:'total',niv:'ambre',
    txt:t('ctrlTaux').replace('%x',taux.toFixed(1).replace('.',','))});
  }
 }
 /* j. Rien à valider */
 if(!lignes.some(l=>l.id&&num(l.q)>0)){
  A.push({i:-1,champ:'total',niv:'rouge',txt:t('ctrlAucuneLigne')});
 }
 return{anomalies:A,somme,ecartHT,
  rouges:A.filter(x=>x.niv==='rouge').length,
  ambres:A.filter(x=>x.niv==='ambre').length};
}

/* Applique les anomalies sur les champs concernés pour l'affichage */
function marquerAnomalies(s){
 const r=controlerCoherence(s);
 (s.lines||[]).forEach(l=>{l.ctrl=[]});
 r.anomalies.forEach(a=>{
  if(a.i>=0&&s.lines[a.i]){
   s.lines[a.i].ctrl=s.lines[a.i].ctrl||[];
   s.lines[a.i].ctrl.push(a);
   if(!s.lines[a.i].inc)s.lines[a.i].inc=[];
   if(a.champ&&!s.lines[a.i].inc.includes(a.champ))s.lines[a.i].inc.push(a.champ);
  }
 });
 s.ctrlGlobal=r.anomalies.filter(a=>a.i<0);
 s.ctrlResume=r;
 return r;
}

/* ── Rapprochement souple avec le catalogue ── */
/* Distance d'édition : tolère les fautes de lecture (HAVANNA / HAVANA) */
function lev(a,b){
 if(a===b)return 0;
 const m=a.length,n=b.length;
 if(!m)return n;if(!n)return m;
 let prev=Array.from({length:n+1},(_,i)=>i),cur=new Array(n+1);
 for(let i=1;i<=m;i++){
  cur[0]=i;
  for(let j=1;j<=n;j++){
   cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
  }
  [prev,cur]=[cur,prev];
 }
 return prev[n];
}
const simMot=(a,b)=>{
 if(a===b)return 1;
 const L=Math.max(a.length,b.length);
 if(L<3)return a===b?1:0;
 return Math.max(0,1-lev(a,b)/L);
};
function scoreLabel(a,b){
 const A=normProd(a).split(' ').filter(x=>x.length>1);
 const B=normProd(b).split(' ').filter(x=>x.length>1);
 if(!A.length||!B.length)return 0;
 /* Chaque mot cherche son meilleur équivalent, même approximatif */
 let som=0;
 A.forEach(w=>{
  let best=0;
  B.forEach(v=>{const s=simMot(w,v);if(s>best)best=s});
  som+=best>=0.78?best:0;
 });
 const couv=som/A.length;
 const couvB=som/B.length;
 return Math.min(1,Math.max(couv*0.92,Math.min(couv,couvB)*1.02));
}
function meilleurProduit(fo,ref,label){
 const cle=(fo||'')+'|'+(ref||'').toUpperCase();
 if(ref&&st.refFo[cle]&&prod(st.refFo[cle]))return{id:st.refFo[cle],score:1};
 let best={id:null,score:0};
 st.prods.forEach(p=>{
  const s=scoreLabel(label,p.n);
  if(s>best.score)best={id:p.id,score:s};
 });
 return best;
}

/* ── Point d'entrée : lecture puis analyse ──
   Pour passer plus tard à un OCR cloud plus précis (Mindee, Textract, Vision),
   il suffit de remplacer l'appel à OCR.lire ci-dessous : le reste ne bouge pas. */
async function ocrBonLivraison(images,prog){
 let pages;
 try{
  pages=await OCR.lire(images,prog);
 }catch(e){
  return{dispo:false,raison:e.message||'moteur',detail:OCR.detail||''};
 }
 const f=fusionnerPages(pages);
 const ent=extraireEntete(f.texte,f.lignes);
 const lignes=f.items.map(it=>{
  const mp=meilleurProduit(ent.fo,it.ref,it.label);
  /* Trois niveaux :
     - certain (référence connue, ou score très élevé) : association retenue
     - à confirmer : proposition affichée, l'utilisateur doit valider
     - inconnu : aucune association */
  const CERTAIN=0.86, PROPOSE=0.58;
  let etat,choix,id;
  if(mp.score>=CERTAIN){etat='ok';choix='assoc';id=mp.id}
  else if(mp.score>=PROPOSE){etat='confirmer';choix=null;id=mp.id}
  else{etat='inconnu';choix=null;id=''}
  const inc=[...it.inc];
  if(etat!=='ok'&&!inc.includes('prod'))inc.push('prod');
  return{ref:it.ref,label:it.label,q:it.q,unite:it.unite,px:it.px,cond:it.cond||null,
   doublonPossible:!!it.doublonPossible,page:it.page||0,
   id:id||'',score:Math.round(mp.score*100)/100,etat,choix,
   inc,conf:it.conf,confQ:it.confQ||0,confPx:it.confPx||0};
 });
 return{dispo:true,moteur:'tesseract',conf:Math.round(f.conf),methode:f.methode,
  fo:ent.fo,foC:ent.foC,bl:ent.bl,blC:ent.blC,date:ent.date,dateC:ent.dateC,
  ht:ent.ht,tva:ent.tva,ttc:ent.ttc,lignes,brut:f.texte};
}

/* ── Rapprochement d'une ligne détectée avec le catalogue Invo ── */
function trouverProduit(fo,ref,label){
 /* 1. Association mémorisée lors d'un scan précédent */
 const cle=(fo||'')+'|'+(ref||'').toUpperCase();
 if(ref&&st.refFo[cle]&&prod(st.refFo[cle]))return st.refFo[cle];
 /* 2. Correspondance sur le libellé */
 const l=(label||'').toLowerCase().trim();
 if(!l)return null;
 let p=st.prods.find(x=>x.n.toLowerCase()===l);
 if(p)return p.id;
 p=st.prods.find(x=>l.includes(x.n.toLowerCase())||x.n.toLowerCase().includes(l));
 return p?p.id:null;
}

/* ── Détection de doublon ── */
function chercherDoublon(s){
 const total=totalScan(s);
 return st.liv.find(l=>{
  if(s.bl&&l.bl&&s.bl.trim().toUpperCase()===l.bl.trim().toUpperCase())return true;
  const memeFo=(l.fo||'').toLowerCase()===(s.fo||'').toLowerCase();
  const memeJour=(l.dateBl||l.ts||'').slice(0,10)===(s.date||'').slice(0,10);
  const memeTotal=Math.abs((l.total||0)-total)<0.01&&total>0;
  return memeFo&&memeJour&&memeTotal;
 })||null;
}

const totalScan=s=>s.lines.reduce((a,l)=>a+num(l.q)*num(l.px),0);

/* ── État du scan ── */
