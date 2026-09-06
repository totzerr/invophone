let scan=null, scanBusy=false;

function nouveauScan(){
 scan={etape:'capture',imgs:[],fo:'',bl:'',date:new Date().toISOString().slice(0,10),
  lines:[],ht:'',tva:'',ttc:'',doublon:null,forcer:false,ameliorer:true,msg:null,ocr:null};
 dessineScan();
}

function ajouterPage(source){
 const inp=document.createElement('input');
 inp.type='file';inp.accept='image/*';
 if(source==='camera')inp.capture='environment';
 inp.onchange=async e=>{
  const f=e.target.files&&e.target.files[0];
  if(!f)return;
  if(!scan)return;                                  /* écran quitté entre-temps */
  scan.msg={type:'info',txt:t('scTraitement')};dessineScan();
  try{
   const d=await prepDoc(f,scan.ameliorer);
   if(!scan)return;                                 /* re-vérification après await */
   scan.imgs.push(d.prep);
   (scan.origs=scan.origs||[]).push(d.orig);
   scan.traite=d.traite||{};
   scan.msg=null;
   /* Diagnostic qualité sur l'original, avant tout traitement */
   const q=await qualiteDepuisDataUrl(d.orig);
   if(!scan)return;
   (scan.qual=scan.qual||[]).push(q);
  }catch(err){
   if(!scan)return;
   const m={type:t('errType'),taille:t('errTaille'),lecture:t('errLecture'),
    image:t('errImage'),traitement:t('errTraitement')}[err.message]||t('errImage');
   scan.msg={type:'err',txt:m};
  }
  dessineScan();
 };
 inp.click();
}

/* ── Lancement de l'analyse ── */
async function analyser(){
 if(!scan||scanBusy)return;
 if(!scan.imgs.length){scan.msg={type:'err',txt:t('scAucunePage')};dessineScan();return}
 scanBusy=true;
 scan.prog={p:0,page:1,total:scan.imgs.length};
 scan.msg={type:'info',txt:t('scAnalyse')};
 dessineScan();
 let r;
 try{
  r=await ocrBonLivraison(scan.imgs,(p,page,tot)=>{
   if(!scan)return;
   scan.prog={p:p||0,page:page||scan.prog.page,total:tot||scan.prog.total};
   majProgres();
  });
 }catch(e){ r={dispo:false,raison:'erreur'}; }
 scanBusy=false;
 if(!scan)return;                       /* écran quitté pendant l'analyse */
 scan.prog=null;scan.ocr=r;

 if(r.dispo){
  scan.fo=r.fo||'';scan.bl=r.bl||'';scan.date=r.date||scan.date;
  scan.ht=r.ht||'';scan.tva=r.tva||'';scan.ttc=r.ttc||'';
  scan.incEntete=[];
  if(!r.fo||r.foC<0.6)scan.incEntete.push('fo');
  if(!r.bl)scan.incEntete.push('bl');
  if(!r.date)scan.incEntete.push('date');
  scan.lines=(r.lignes||[]).map(l=>({
   ref:l.ref||'',label:l.label||'',id:l.id||'',q:l.q===''?'':String(l.q),
   px:l.px===''?'':String(l.px),unite:l.unite||'',
   etat:l.etat,choix:l.choix,inc:l.inc||[],score:l.score,conf:l.conf}));
  const nInc=scan.lines.filter(l=>l.inc&&l.inc.length).length;
  if(!scan.lines.length){
   scan.lines=[ligneVide()];
   scan.msg={type:'warn',txt:t('scRienLu')};
  }else{
   scan.msg={type:nInc?'warn':'info',
    txt:nInc?t('scPartiel').replace('%n',scan.lines.length).replace('%i',nInc)
            :t('scLu').replace('%n',scan.lines.length)};
  }
 }else{
  scan.lines=[ligneVide()];
  const horsLigne=(r.raison==='moteur'||r.raison==='cdn'||r.raison==='delai');
  const bloque=(r.raison==='worker');
  scan.msg={type:'warn',
   txt:(horsLigne?t('scOcrHorsLigne'):(bloque?t('scOcrBloque'):t('scOcrEchec')))
    +(r.detail?`<br><span class="err-tech">${String(r.detail).slice(0,180)}</span>`:'')};
 }
 scan.etape='verif';
 dessineScan();
}

/* Progression sans redessiner tout l'écran */
function majProgres(){
 const el=document.getElementById('scProg');
 if(!el||!scan||!scan.prog)return;
 const{p,page,total}=scan.prog;
 el.innerHTML=`<span class="spin"></span> ${t('scPage')} ${page}/${total} — ${Math.round(p*100)} %`;
}

const ligneVide=()=>({ref:'',label:'',id:st.prods[0]?.id||'',q:'',px:'',etat:'ok',choix:'assoc'});

/* ── Écran de scan et de vérification ── */
function dessineScan(){
 if(!scan){document.getElementById('modal').innerHTML='';return}
 const msg=scan.msg?`<div class="warn ${scan.msg.type==='err'?'err':'dup'}">${scan.msg.txt}</div>`:'';
 let corps='';

 if(scan.etape==='capture'){
  const pages=scan.imgs.map((d,i)=>{
   const q=(scan.qual||[])[i];
   const nv=q?(q.niveau||(q.bloquant?'rouge':(q.note<78?'orange':'vert'))):null;
   const cl=!q?'':{vert:'pg-ok',orange:'pg-moy',rouge:'pg-ko'}[nv];
   return `<div class="pg"><img src="${d}" alt="" class="${cl}">
   <span class="pg-n">${i+1}</span>
   ${q?`<span class="pg-q ${cl}">${q.note}</span>`:''}
   <button class="pg-x" data-delpg="${i}">×</button></div>`}).join('');
  const qs=(scan.qual||[]).filter(Boolean);
  const pire=qs.length?qs.reduce((a,b)=>a.note<b.note?a:b):null;
  const niv=pire?(pire.niveau||(pire.bloquant?'rouge':(pire.note<78?'orange':'vert'))):null;
  const cls={vert:'ok',orange:'moy',rouge:'ko'}[niv]||'ok';
  const ico={vert:'🟢',orange:'🟠',rouge:'🔴'}[niv]||'';
  const blocQ=pire?`<div class="qual ${cls}">
   <div class="qual-t"><span>${ico} ${t('qTitre')} — ${pire.note} / 100</span>
    <span class="qual-j"><i style="width:${pire.note}%"></i></span></div>
   <div class="qual-verdict">${pire.conseil||''}</div>
   ${pire.soucis.length?`<ul class="qual-l">${pire.soucis.map(s=>`<li>${s.txt}</li>`).join('')}</ul>`
    :`<div class="qual-ok">${t('qBonne')}</div>`}
   ${niv==='rouge'?`<div class="qual-a">${t('qConseilRefaire')}</div>`:''}</div>`:'';

  corps=`<p class="sh-sub">${t('scCaptureS')}</p>${msg}
  ${!scan.imgs.length?`<div class="viseur">
   <div class="viseur-cadre"><span class="vc c1"></span><span class="vc c2"></span>
   <span class="vc c3"></span><span class="vc c4"></span>
   <div class="viseur-txt">${t('qViseur')}</div></div>
   <ul class="viseur-conseils">
    <li>${t('qC1')}</li><li>${t('qC2')}</li><li>${t('qC3')}</li></ul></div>`:''}
  ${blocQ}
  <div class="scan-actions">
   <button class="scan-btn primary" data-cap="camera"><span class="sb-i">📷</span>
    <span class="sb-l">${t('scPhoto')}</span></button>
   <button class="scan-btn" data-cap="galerie"><span class="sb-i">🖼️</span>
    <span class="sb-l">${t('scGalerie')}</span></button></div>
  ${scan.imgs.length?`<div class="eyebrow">${t('scPages')} (${scan.imgs.length})</div>
   <div class="pages">${pages}<button class="pg-add" data-cap="camera">+</button></div>`:''}
  <label class="set-row" style="cursor:pointer"><span class="set-lab">${t('scAmeliorer')}
   <small>${t('scAmeliorerS')}</small></span>
   <input type="checkbox" id="scAm" ${scan.ameliorer?'checked':''} style="width:22px;height:22px"></label>
  <div class="sh-actions">
   <button class="btn btn-2 btn-sm" data-fermer="1">${t('cancel')}</button>
   <button class="btn" id="scGo" ${scan.imgs.length&&!scanBusy?'':'disabled'}>
    ${scanBusy?`<span id="scProg"><span class="spin"></span> ${t('scAnalyse')}</span>`:t('scAnalyser')}</button></div>
  ${scanBusy?`<p class="vl-help" style="text-align:center;margin-top:9px">${t('scPatience')}</p>`:''}`;
 }else{
  const total=totalScan(scan);
  const dup=scan.doublon?`<div class="warn dup"><b>⚠️ ${t('scDoublon')}</b><br>
   ${scan.doublon.fo} · ${(scan.doublon.bl||'—')} · ${fmt(scan.doublon.total||0)} €
   <div class="warn-b"><button class="vl-act" data-voirdup="1">${t('scVoirExistante')}</button>
   <button class="vl-act ${scan.forcer?'on':''}" data-forcer="1">${t('scContinuer')}</button></div></div>`:'';

  const lignes=scan.lines.map((l,i)=>{
   const aConfirmer=l.etat==='confirmer'&&l.choix!=='assoc';
   const inconnu=(l.etat==='inconnu'&&l.choix!=='assoc'&&l.choix!=='ignore')||aConfirmer;
   const opts=st.prods.map(p=>`<option value="${p.id}" ${l.id===p.id?'selected':''}>${p.i} ${p.n}</option>`).join('');
   const nom=l.label||(prod(l.id)?prod(l.id).n:t('scLigne')+' '+(i+1));
   return `<div class="vl-row ${inconnu?'inconnu':''}">
    <div class="vl-top"><span class="vl-nm">${nom}</span>
    <span class="vl-et ${inconnu?(aConfirmer?'conf':'ko'):'ok'}">${
      aConfirmer?t('scAConfirmer'):(inconnu?t('scNonReconnu'):t('scReconnu'))}</span>
    <button class="vl-x" data-delln="${i}" title="${t('del')}">✕</button></div>
    ${inconnu?`<div class="vl-help">${aConfirmer&&l.id
      ?t('scConfirmerAide').replace('%p',(prod(l.id)?prod(l.id).n:'')).replace('%s',Math.round((l.score||0)*100))
      :t('scInconnuAide')}${l.label?`<br><i>${t('scTexteLu')} « ${l.label} »</i>`:''}</div>
     ${l.doublonPossible?`<div class="vl-warn">⚠️ ${t('scDoublonPage')}</div>`:''}
     <div class="vl-acts">
      <button class="vl-act ${aConfirmer?'on':''}" data-ch="assoc" data-i="${i}">${
       aConfirmer?t('scConfirmer'):t('scAssocier')}</button>
      <button class="vl-act" data-ch="creer" data-i="${i}">${t('scCreer')}</button>
      <button class="vl-act" data-ch="ignore" data-i="${i}">${t('scIgnorer')}</button></div>`
    :`<div class="vl-g">
      <select data-lid="${i}" class="${(l.inc||[]).includes('prod')?'douteux':''}">${opts}</select>
      <input data-lq="${i}" inputmode="decimal" value="${l.q}" placeholder="${t('scQte')}"
       class="${(l.inc||[]).includes('q')?'douteux':''}">
      <input data-lpx="${i}" inputmode="decimal" value="${l.px}" placeholder="${t('scPu')}"
       class="${(l.inc||[]).includes('px')?'douteux':''}"></div>
      ${l.doublonPossible?`<div class="vl-warn">⚠️ ${t('scDoublonPage')}</div>`:''}
      ${(l.ctrl||[]).length?`<div class="vl-warn">${l.ctrl.map(a=>
        `<div>${a.niv==='rouge'?'⛔':'⚠️'} ${a.txt}</div>`).join('')}</div>`
       :((l.inc||[]).length?`<div class="vl-warn">⚠ ${t('scVerifChamp')} :
       ${l.inc.map(c=>({q:t('scQte'),px:t('scPu'),prod:t('scLeProduit')}[c]||c)).join(', ')}</div>`:'')}
      ${l.cond?`<div class="cond-box">${t('scCond')} : ${l.cond.type} ${t('scDe')} ${l.cond.par}
        <button class="vl-act" data-conv="${i}">× ${l.cond.par} → ${t('scEnUnites')}</button></div>`:''}
      ${(l.ref||l.unite||l.confQ)?`<div class="vl-help">
        ${l.ref?t('scRef')+' '+l.ref:''}${l.ref&&l.unite?' · ':''}${l.unite||''}
        ${l.confQ?` · ${t('scFiab')} ${l.confQ} %`:''}</div>`:''}`}
   </div>`}).join('');

  marquerAnomalies(scan);
  const oc=scan.ocr;
  const cg=scan.ctrlGlobal||[];
  const res=scan.ctrlResume||{rouges:0,ambres:0};
  const blocCtrl=cg.length?`<div class="warn ${cg.some(a=>a.niv==='rouge')?'err':'dup'}">
   <b>${t('ctrlTitre')}</b>${cg.map(a=>`<div class="ctrl-l">${a.niv==='rouge'?'⛔':'⚠️'} ${a.txt}</div>`).join('')}</div>`:'';
  const blocOk=(!cg.length&&!res.rouges&&!res.ambres&&scan.lines.length)?
   `<div class="warn ok-ctrl">✓ ${t('ctrlOk')}</div>`:'';
  const meth={colonnes:t('scMethColonnes'),mixte:t('scMethMixte'),lignes:t('scMethLignes')}[oc&&oc.methode]||'';
  const bandeau=oc&&oc.dispo?`<div class="ocr-info">${t('scMoteur')} · ${t('scFiab')} ${oc.conf} %
   ${meth?' · '+meth:''}
   ${scan.traite&&(scan.traite.recadre||scan.traite.angle)?`<br>${t('scImageOpt')}${scan.traite.recadre?' '+t('scRecadre'):''}${scan.traite.angle?' '+t('scRedresse').replace('%a',scan.traite.angle):''}`:''}
   ${oc.conf<70?`<br><b>${t('scFiabBasse')}</b>`:''}</div>`:'';
  corps=`<p class="sh-sub">${t('scVerifS')}</p>${msg}${bandeau}${blocCtrl}${blocOk}${dup}
  ${scan.imgs.length?`<div class="pages">${scan.imgs.map((d,i)=>
    `<div class="pg"><img src="${d}" alt="" data-voirdoc="${i}"><span class="pg-n">${i+1}</span></div>`).join('')}</div>`:''}
  <div class="f2">
   <div class="fld"><label>${t('scFournisseur')}${(scan.incEntete||[]).includes('fo')?' ⚠':''}</label>
    <input id="scFo" list="foList" class="${(scan.incEntete||[]).includes('fo')?'douteux':''}"
     value="${(scan.fo||'').replace(/"/g,'&quot;')}" placeholder="Metro">
    <datalist id="foList">${[...new Set(st.prods.map(p=>p.fo).filter(Boolean))].map(f=>`<option value="${f}">`).join('')}</datalist></div>
   <div class="fld"><label>${t('scNumBl')}${(scan.incEntete||[]).includes('bl')?' ⚠':''}</label>
    <input id="scBl" class="${(scan.incEntete||[]).includes('bl')?'douteux':''}"
     value="${(scan.bl||'').replace(/"/g,'&quot;')}" placeholder="BL-45872"></div></div>
  <div class="fld"><label>${t('scDate')}</label><input id="scDate" type="date" value="${scan.date||''}"></div>
  <div class="eyebrow">${t('scProduits')} (${scan.lines.length})</div>
  ${lignes||`<p class="vl-help">${t('scAucuneLigne')}</p>`}
  <button class="ing-add" id="scAddLn">${t('scAjouterLigne')}</button>
  <div class="tot-box">
   <div class="tot-l"><span>${t('scLignesSaisies')}</span><span>${scan.lines.length}</span></div>
   <div class="tot-l big"><span>${t('scTotal')}</span><span>${fmt(total)} €</span></div></div>
  <div class="sh-actions">
   ${scan.imgs.length&&(!scan.ocr||!scan.ocr.dispo)?
     `<button class="btn btn-2 btn-sm" id="scRelire">${t('scRelire')}</button>`:''}
   <button class="btn btn-2 btn-sm" id="scBrouillon">${t('scBrouillon')}</button>
   <button class="btn" id="scValider">${scan.forcerCtrl==='demande'?t('ctrlValiderQuandMeme'):t('scValider')}</button></div>`;
 }

 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgSc"><div class="sheet">
  <h3>${scan.etape==='capture'?t('scTitre'):t('scVerifTitre')}</h3>${corps}</div></div>`;

 /* ── Branchements ── */
 const $=id=>document.getElementById(id);
 $('bgSc').onclick=e=>{if(e.target.id==='bgSc')fermerScan()};
 document.querySelectorAll('[data-fermer]').forEach(b=>b.onclick=fermerScan);
 document.querySelectorAll('[data-cap]').forEach(b=>b.onclick=()=>ajouterPage(b.dataset.cap));
 document.querySelectorAll('[data-delpg]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.delpg;
  scan.imgs.splice(i,1);
  if(scan.origs)scan.origs.splice(i,1);
  if(scan.qual)scan.qual.splice(i,1);
  dessineScan()});
 const am=$('scAm');if(am)am.onchange=e=>{scan.ameliorer=e.target.checked};
 const go=$('scGo');if(go)go.onclick=analyser;

 const bind=(sel,f)=>document.querySelectorAll(sel).forEach(el=>{
  el.oninput=e=>f(+el.dataset[Object.keys(el.dataset)[0]],e.target.value)});
 document.querySelectorAll('[data-lq]').forEach(el=>el.oninput=e=>{scan.lines[+el.dataset.lq].q=e.target.value;majTotalScan()});
 document.querySelectorAll('[data-lpx]').forEach(el=>el.oninput=e=>{scan.lines[+el.dataset.lpx].px=e.target.value;majTotalScan()});
 document.querySelectorAll('[data-lid]').forEach(el=>el.onchange=e=>{
  const i=+el.dataset.lid;scan.lines[i].id=e.target.value;
  /* Mémoriser l'association référence fournisseur → produit */
  if(scan.lines[i].ref&&scan.fo)st.refFo[(scan.fo||'')+'|'+scan.lines[i].ref.toUpperCase()]=e.target.value;
  dessineScan()});
 document.querySelectorAll('[data-conv]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.conv,l=scan.lines[i];
  if(!l.cond)return;
  l.q=String(num(l.q)*l.cond.par);
  if(num(l.px)>0)l.px=String(Math.round(num(l.px)/l.cond.par*10000)/10000);
  l.cond=null;dessineScan();toast(t('scConverti'));
 });
 document.querySelectorAll('[data-delln]').forEach(b=>b.onclick=()=>{
  scan.lines.splice(+b.dataset.delln,1);dessineScan()});
 document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.i,c=b.dataset.ch;
  if(c==='creer'){creerDepuisScan(i);return}
  if(c==='ignore'){scan.lines.splice(i,1);dessineScan();return}
  scan.lines[i].choix='assoc';scan.lines[i].etat='ok';
  if(!scan.lines[i].id)scan.lines[i].id=st.prods[0]?.id||'';
  dessineScan()});
 const fo=$('scFo');if(fo)fo.oninput=e=>{scan.fo=e.target.value};
 const bl=$('scBl');if(bl)bl.oninput=e=>{scan.bl=e.target.value};
 const dt=$('scDate');if(dt)dt.oninput=e=>{scan.date=e.target.value};
 const add=$('scAddLn');if(add)add.onclick=()=>{scan.lines.push(ligneVide());dessineScan()};
 const rl=$('scRelire');
 if(rl)rl.onclick=()=>{scan.etape='capture';scan.msg=null;dessineScan()};
 const br=$('scBrouillon');if(br)br.onclick=sauverBrouillon;
 const va=$('scValider');
 if(va)va.onclick=()=>{if(scan.forcerCtrl==='demande')scan.forcerCtrl=true;validerScan()};
 document.querySelectorAll('[data-voirdoc]').forEach(im=>im.onclick=()=>voirDoc(scan.imgs[+im.dataset.voirdoc]));
 document.querySelectorAll('[data-forcer]').forEach(b=>b.onclick=()=>{scan.forcer=!scan.forcer;dessineScan()});
 document.querySelectorAll('[data-voirdup]').forEach(b=>b.onclick=()=>{
  const d=scan.doublon;fermerScan();if(d)voirLivraison(st.liv.indexOf(d))});
}

/* Mise à jour du total sans redessiner (préserve le focus du champ) */
function majTotalScan(){
 const el=document.querySelector('.tot-l.big span:last-child');
 if(el)el.textContent=fmt(totalScan(scan))+' €';
}

function fermerScan(){scan=null;scanBusy=false;document.getElementById('modal').innerHTML=''}

/* Créer une nouvelle matière depuis une ligne non reconnue */
function creerDepuisScan(i){
 const l=scan.lines[i];
 const nom=(l.label||'').trim()||t('scNouveauProduit');
 const p={id:uid('m'),n:nom,i:'📦',u:'u',px:num(l.px),seuil:0,s:0,dlc:7,
  z:'reserve',fo:scan.fo||'Divers'};
 st.prods.push(p);st.stock[p.id]=0;
 if(l.ref&&scan.fo)st.refFo[(scan.fo||'')+'|'+l.ref.toUpperCase()]=p.id;
 l.id=p.id;l.etat='ok';l.choix='assoc';
 save();dessineScan();toast(t('scProduitCree'));
}

function voirDoc(src){
 if(!src)return;
 const m=document.createElement('div');
 m.className='sheet-bg';m.style.zIndex='400';
 m.innerHTML=`<div class="sheet"><h3>${t('scDocument')}</h3>
  <img class="doc-full" src="${src}" alt="">
  <div class="sh-actions"><button class="btn" id="fdoc">${t('fermer')}</button></div></div>`;
 document.body.appendChild(m);
 const close=()=>m.remove();
 m.onclick=e=>{if(e.target===m)close()};
 m.querySelector('#fdoc').onclick=close;
}

async function sauverBrouillon(){
 if(!scan)return;
 st.brouillons.unshift({...scan,ts:new Date().toISOString()});
 if(st.brouillons.length>5)st.brouillons.length=5;
 await save();fermerScan();renderLiv();toast(t('scBrouillonOk'));
}

/* ── Validation : seul moment où le stock est modifié ── */
async function validerScan(){
 if(!scan||scanBusy)return;
 const aValider=scan.lines.filter(l=>l.etat==='confirmer'&&l.choix!=='assoc');
 if(aValider.length){
  scan.msg={type:'err',txt:t('scConfirmerDabord').replace('%n',aValider.length)};
  dessineScan();return;
 }
 const valides=scan.lines.filter(l=>l.id&&num(l.q)>0&&l.etat!=='inconnu');
 if(!valides.length){scan.msg={type:'err',txt:t('scRienAValider')};dessineScan();return}
 if(!scan.fo||!scan.fo.trim()){scan.msg={type:'err',txt:t('scFoManquant')};dessineScan();return}

 /* Anomalies graves : confirmation explicite exigée */
 const ctrl=controlerCoherence(scan);
 if(ctrl.rouges>0&&!scan.forcerCtrl){
  scan.forcerCtrl='demande';
  scan.msg={type:'err',txt:t('ctrlBloque').replace('%n',ctrl.rouges)};
  dessineScan();return;
 }

 /* Contrôle de doublon avant écriture */
 if(!scan.forcer){
  const d=chercherDoublon(scan);
  if(d){scan.doublon=d;scan.msg=null;dessineScan();return}
 }

 scanBusy=true;
 try{
  /* Archivage du document (page 1 ; les suivantes si la place le permet) */
  const docs=[];
  const src=(scan.origs&&scan.origs.length)?scan.origs:scan.imgs;   /* on archive l'original */
  for(const img of src.slice(0,3)) docs.push(await Docs.put(img));

  const total=valides.reduce((a,l)=>a+num(l.q)*num(l.px),0);
  const lines=valides.map(l=>({id:l.id,q:num(l.q),px:num(l.px)}));

  /* Entrée en stock — uniquement ici */
  lines.forEach(l=>{
   st.stock[l.id]=(st.stock[l.id]||0)+l.q;
   const p=prod(l.id);
   if(p&&l.px>0&&p.px!==l.px){p.pxPrev=p.px;p.px=l.px}   /* suivi de la hausse des prix */
  });

  st.liv.unshift({id:Date.now(),fo:scan.fo.trim(),ts:new Date().toISOString(),
   dateBl:scan.date||'',bl:(scan.bl||'').trim(),lines,total,
   ht:num(scan.ht)||null,tva:num(scan.tva)||null,ttc:num(scan.ttc)||null,
   docs,src:'scan',par:st.who});
  if(st.liv.length>60){const vieux=st.liv.pop();for(const k of (vieux.docs||[]))await Docs.del(k)}

  await save();
  scanBusy=false;fermerScan();renderLiv();toast(t('scValide'));
 }catch(e){
  scanBusy=false;
  if(scan){scan.msg={type:'err',txt:t('scErrEnreg')};dessineScan()}
 }
}

/* ── Consultation d'une livraison passée ── */
function voirLivraison(ix){
 const l=st.liv[ix];if(!l)return;
 if((l.docs||[]).some(k=>!Docs.get(k))){
  Docs.precharger(l.docs).then(()=>voirLivraison(ix));
 }
 const d=new Date(l.ts),commandeLiee=l.commandeId?(st.commandes||[]).find(function(c){return c.id===l.commandeId}):null;
 const jj=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
 const lignes=l.lines.map(x=>{const p=prod(x.id);
  return `<div class="set-row"><span class="set-lab">${p?p.i+' '+p.n:t('scProduitSupprime')}
   <small>${fmtQ(x.q)} ${p?p.u:''} × ${fmt(x.px)} €</small></span>
   <span class="set-val">${fmt(x.q*x.px)} €</span></div>`}).join('');
 const docs=(l.docs||[]).map(k=>Docs.get(k)).filter(Boolean);
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgLv"><div class="sheet">
  <h3>${l.fo}</h3><p class="sh-sub">${jj}${l.bl?' · '+l.bl:''} ·
  ${l.src==='scan'?t('scScanne'):t('scManuel')}${commandeLiee?' · commande liée : '+commandeLiee.fournisseur:''}${l.par?' · '+l.par:''}</p>
  ${docs.length?`<div class="eyebrow">${t('scDocument')}</div>
   ${docs.map(s=>`<img class="doc-full" src="${s}" alt="">`).join('')}`
   :(l.docs&&l.docs.length?`<div class="warn dup">${t('scDocPurge')}</div>`:'')}
  <div class="eyebrow">${t('scProduits')} (${l.lines.length})</div>${lignes}
  <div class="tot-box"><div class="tot-l big"><span>${t('scTotal')}</span><span>${fmt(l.total)} €</span></div></div>
  <div class="sh-actions">${estResp()?'<button class="btn btn-2 btn-sm" id="lvEdit">Corriger la réception</button>':''}<button class="btn" id="lvF">${t('fermer')}</button></div></div></div>`;
 document.getElementById('bgLv').onclick=e=>{if(e.target.id==='bgLv')closeModal()};
 document.getElementById('lvF').onclick=closeModal;
 const edit=document.getElementById('lvEdit');if(edit)edit.onclick=function(){modifierLivraison(ix)};
}
