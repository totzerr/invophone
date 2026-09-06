function renderLiv(){
 /* Charge les vignettes des livraisons avant de dessiner */
 const cles=[];(st.liv||[]).slice(0,20).forEach(l=>(l.docs||[]).forEach(k=>cles.push(k)));
 if(cles.some(k=>!Docs.get(k)))Docs.precharger(cles).then(()=>{if(screen==='liv')renderLiv()});

 const sub=`<div class="subtabs">
  <button class="${livTab==='recep'?'on':''}" data-lt="recep">📥 ${t('tabRecep')}</button>
  <button class="${livTab==='prev'?'on':''}" data-lt="prev">📈 ${t('tabPrev')}</button></div>`;

 let body='';
 if(livTab==='prev'){
  const pv=previsionIndex().pv;
  if(!pv.liste.length){
   body=`<div class="empty"><div class="e-ico">📈</div><p><b>${t('prevVideT')}</b><br>${t('prevVideD')}</p></div>`;
  }else{
   const carte=x=>{const b=badgePrev(x);
    const cls=b?b.cls:'ok';
    const jauge=x.type==='perte'
     ? Math.max(3,Math.min(100,(x.dlc/Math.max(x.jConso,1))*100))
     : Math.max(3,Math.min(100,(Math.min(x.quand,HORIZON)/HORIZON)*100));
    const detail=x.type==='perte'
     ? t('perteDetail').replace('%q',fmtQ(Math.round(x.perte*100)/100)).replace('%u',x.u)
                       .replace('%v',fmt(x.valPerte)).replace('%d',Math.round(x.dlc))
     : t('resteEn').replace('%s',fmtQ(x.stock)).replace('%u',x.u)+' · '+
       t('rythme').replace('%s',fmtQ(Math.round(x.parJour*100)/100)).replace('%u',x.u);
    return `<div class="prev-card ${cls}">
     <div class="prev-top"><span class="prev-n">${x.i} ${x.n}</span>
     <span class="prev-q ${cls}">${b?b.txt:'—'}</span></div>
     <div class="prev-bar"><i style="width:${jauge}%"></i></div>
     <div class="prev-m">${detail}</div></div>`};

   const urgent=pv.liste.filter(x=>x.type==='rupture'&&x.quand<3);
   const suivre=pv.liste.filter(x=>x.type==='rupture'&&x.quand>=3&&x.quand<10);
   const pertes=pv.liste.filter(x=>x.type==='perte');
   const ok=pv.liste.filter(x=>x.type==='ok'||(x.type==='rupture'&&x.quand>=10));
   const totPerte=pertes.reduce((s,x)=>s+x.valPerte,0);

   body=`<div class="hint">${pv.fiable?t('prevBase').replace('%s',pv.nbJours):t('prevPeuFiable')}</div>
    ${urgent.length?`<div class="eyebrow">${t('prevUrgent')}</div>${urgent.map(carte).join('')}`:''}
    ${pertes.length?`<div class="eyebrow" style="margin-top:18px">${t('prevPerte')} — ${fmt(totPerte)} €</div>
     <div class="hint">${t('prevPerteS')}</div>${pertes.map(carte).join('')}`:''}
    ${suivre.length?`<div class="eyebrow" style="margin-top:18px">${t('prevSuivre')}</div>${suivre.map(carte).join('')}`:''}
    ${ok.length?`<div class="eyebrow" style="margin-top:18px">${t('prevOk')} (${ok.length})</div>
     ${ok.slice(0,6).map(carte).join('')}`:''}`;
  }
 }else if(livTab==='recep'){
  const cards=st.liv.length?st.liv.slice(0,25).map(l=>{
   const d=new Date(l.ts),commandeLiee=l.commandeId?(st.commandes||[]).find(function(c){return c.id===l.commandeId}):null;
   const jj=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
   const lignes=l.lines.map(x=>{const p=prod(x.id);
    return `${p?p.i+' '+p.n:'?'} — ${fmtQ(x.q)} ${p?p.u:''} · ${fmt(x.q*x.px)} €`}).join('<br>');
   const doc=(l.docs||[]).map(k=>Docs.get(k)).find(Boolean);
   return `<div class="liv-card" data-livix="${st.liv.indexOf(l)}" style="cursor:pointer">
    <div class="liv-top" style="align-items:center;gap:10px">
    ${doc?`<img class="doc-th" src="${doc}" alt="">`:''}
    <div style="flex:1;min-width:0"><div class="liv-f">${l.fo}</div>
    <div class="liv-d">${jj}${l.bl?' · '+l.bl:''} · ${l.lines.length} ligne${l.lines.length>1?'s':''}
    ${commandeLiee?' · commande liée : '+commandeLiee.fournisseur:''}${l.par?' · '+l.par:''}</div></div>
    <div style="text-align:right"><div class="liv-t">${fmt(l.total)} €</div>
    <span class="liv-src ${l.src==='scan'?'':'man'}">${l.src==='scan'?t('scScanne'):t('scManuel')}</span></div></div>
    <div class="liv-l">${lignes}</div></div>`}).join('')
   :`<div class="empty"><div class="e-ico">📥</div><p>${t('noLiv')}</p></div>`;
  const brouil=(st.brouillons||[]).length?`<div class="eyebrow">${t('scBrouillons')} (${st.brouillons.length})</div>
   ${st.brouillons.map((b,i)=>`<button class="line" data-brou="${i}"><span class="l-ico">📝</span>
    <span class="l-body"><div class="l-nm">${b.fo||t('scSansFournisseur')}</div>
    <div class="l-meta">${b.lines.length} ${t('scLignes')} · ${new Date(b.ts).toLocaleDateString('fr-FR')}</div></span>
    <span class="l-edit">›</span></button>`).join('')}`:'';
  const brouillonsReception=(st.receptionBrouillons||[]).map(function(b){return'<button class="line" data-openlivdraft="'+b.id+'"><span class="l-ico">📝</span><span class="l-body"><div class="l-nm">Brouillon réception · '+escapeHTML(b.fo||'Sans fournisseur')+'</div><div class="l-meta">'+(b.lines||[]).length+' ligne'+((b.lines||[]).length>1?'s':'')+(b.commandId?' · commande liée':'')+' · modifié le '+new Date(b.modifie||b.cree).toLocaleDateString("fr-FR")+'</div></span><span class="l-edit">›</span></button>';}).join('');
  const commandesEnAttente=(st.commandes||[]).filter(function(c){
   return c&&c.statut!=='recu'&&c.statut!=='annulee'&&lignesRestantesCommande(c).length;
  }).map(function(c){
   const restantes=lignesRestantesCommande(c),s=statutCommande(c);
   const detail=restantes.slice(0,3).map(function(l){const p=prod(l.id);return(p?p.n:'Produit')+' · '+libelleConditionnementCommande(l.conditionnement,l.q)}).join(', ');
   return '<button class="pending-order-card" data-receivecmd="'+c.id+'"><span class="pending-order-icon">🛒</span><span><b>'+escapeHTML(c.fournisseur||'Fournisseur')+'</b><small>'+detail+'</small></span><em class="'+s.cls+'">'+s.txt+'</em><i>›</i></button>';
  }).join('');
  body=`<div class="scan-actions">
   <button class="scan-btn primary" id="scanLiv"><span class="sb-i">📷</span>
    <span class="sb-l">${t('scScannerBon')}</span></button>
   <button class="scan-btn" id="newLiv"><span class="sb-i">✍️</span>
    <span class="sb-l">${t('newLiv')}</span></button></div>
   ${commandesEnAttente?'<div class="eyebrow">COMMANDES À RÉCEPTIONNER</div><div class="pending-orders">'+commandesEnAttente+'</div>':''}
   ${brouillonsReception?'<div class="eyebrow">BROUILLONS DE RÉCEPTION</div>'+brouillonsReception:''}
   ${brouil}
   <div class="eyebrow">${t('histLiv')}</div>${cards}`;
 }else{
  body='';
 }
 document.getElementById('s-liv').innerHTML=`
  <div class="h-title">${livTab==='recep'?t('livT'):'Prévisions'}</div>
  <div class="h-sub">${livTab==='recep'?t('livS'):''}</div>${sub}${body}`;
 document.querySelectorAll('[data-lt]').forEach(b=>b.onclick=()=>{livTab=b.dataset.lt;renderLiv()});
 const sc=document.getElementById('scanLiv');if(sc)sc.onclick=nouveauScan;
 const nl=document.getElementById('newLiv');if(nl)nl.onclick=()=>openLiv();
 document.querySelectorAll('[data-livix]').forEach(c=>c.onclick=()=>voirLivraison(+c.dataset.livix));
 document.querySelectorAll('[data-brou]').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.brou;scan={...st.brouillons[i]};st.brouillons.splice(i,1);save();dessineScan()});
 document.querySelectorAll('[data-receivecmd]').forEach(function(b){b.onclick=function(){openLiv(b.dataset.receivecmd)}});
 document.querySelectorAll('[data-openlivdraft]').forEach(function(b){b.onclick=function(){ouvrirBrouillonReception(b.dataset.openlivdraft)}});

}

function copyText(txt){
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).catch(()=>fallbackCopy(txt))}
 else fallbackCopy(txt);
}
function fallbackCopy(txt){
 const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';
 document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}
 document.body.removeChild(ta);
}

function openLiv(commandeId){
 const commande=commandeId?(st.commandes||[]).find(function(c){return c.id===commandeId}):null;
 if(commande){
 const restantes=lignesRestantesCommande(commande);
 if(!restantes.length){toast('Cette commande est déjà entièrement réceptionnée.');return}
  livForm={fo:commande.fournisseur,commandId:commande.id,lines:restantes.map(function(l){const conditionnement=l.conditionnement==='carton'?'carton':'unite';return{id:l.id,q:'',qCarton:'',conditionnement:conditionnement,px:l.px??prod(l.id)?.px??'',attendu:l.q,prixCommande:l.px??prod(l.id)?.px??0}})};
 }else livForm={fo:st.prods[0]?.fo||'',lines:[{id:st.prods[0]?.id||'',q:'',px:'',attendu:0,prixCommande:0}]};
 drawLiv();
}
function ouvrirBrouillonReception(id){
 const b=(st.receptionBrouillons||[]).find(function(x){return x.id===id});if(!b)return;
 livForm={fo:b.fo||'',commandId:b.commandId||null,brouillonId:b.id,lines:copierLignesReception(b.lines)};
 if(!livForm.lines.length)livForm.lines=[{id:st.prods[0]?.id||'',q:'',px:'',attendu:0,prixCommande:0}];
 drawLiv();
}
async function sauvegarderBrouillonReception(){
 if(!livForm)return;
 const existant=(st.receptionBrouillons||[]).find(function(b){return b.id===livForm.brouillonId}),maintenant=new Date().toISOString();
 const brouillon={id:livForm.brouillonId||uid('livdraft'),fo:String(livForm.fo||'').trim(),commandId:livForm.commandId||null,cree:existant?existant.cree:maintenant,modifie:maintenant,lines:copierLignesReception(livForm.lines)};
 st.receptionBrouillons=st.receptionBrouillons||[];
 const index=st.receptionBrouillons.findIndex(function(b){return b.id===brouillon.id});if(index>=0)st.receptionBrouillons[index]=brouillon;else st.receptionBrouillons.unshift(brouillon);
 if(st.receptionBrouillons.length>20)st.receptionBrouillons.length=20;
 livForm.brouillonId=brouillon.id;await save();closeModal();renderLiv();toast('Brouillon de réception enregistré. Aucun stock modifié.');
}
function drawLiv(){
 const estCorrection=!!livForm.editId,estCommande=!!livForm.commandId&&!estCorrection;
 const total=livForm.lines.reduce((s,l)=>s+num(l.q)*num(l.px),0);
 const fournis=[...new Set(st.prods.map(p=>p.fo).filter(Boolean))];
 const lignes=livForm.lines.map((l,ix)=>{
  const p=prod(l.id);
  const commandeAttendue=!estCommande?'':l.conditionnement==='carton'?`<div style="font-size:10px;color:var(--steel-d,#687386);margin:-4px 0 8px 2px"><b>Commandé : ${fmtQ(l.attendu)} carton${num(l.attendu)>1?'s':''}</b> · Cartons reçus <input data-lcart="${ix}" inputmode="decimal" value="${l.qCarton}" aria-label="Cartons reçus" placeholder="0" style="width:42px;margin-left:4px;text-align:center">. Saisis aussi ci-dessus la quantité réellement entrée en stock (${p?p.u:'unité'}).</div>`:`<div style="font-size:10px;color:var(--steel-d,#687386);margin:-4px 0 8px 2px"><b>Attendu : ${fmtQ(l.attendu)} ${p?p.u:'unité'}</b> · Saisis la quantité réellement reçue ci-dessus.</div>`;
  return `<div class="ing-row" style="grid-template-columns:1fr 58px 62px 34px">
   <select data-lk="${ix}">${st.prods.map(x=>`<option value="${x.id}" ${l.id===x.id?'selected':''}>${x.i} ${x.n}</option>`).join('')}</select>
   <input data-lq="${ix}" inputmode="decimal" value="${l.q}" placeholder="Reçu" aria-label="Quantité réellement reçue pour ${p?escapeHTML(p.n):'ce produit'}">
   <input data-lp="${ix}" inputmode="decimal" value="${l.px}" placeholder="Prix" aria-label="Prix unitaire reçu pour ${p?escapeHTML(p.n):'ce produit'}">
   <button class="ing-x" data-lx="${ix}">×</button></div>
   ${commandeAttendue}${p?`<div style="font-size:10px;color:var(--steel-d,#687386);margin:-4px 0 8px 2px">${p.u} · prix actuel ${fmt(p.px)} €/${p.u}</div>`:''}`;
 }).join('');
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgL"><div class="sheet">
  <h3>${estCorrection?'Corriger la réception':(estCommande?'Contrôler la réception':'Nouvelle réception')}</h3><p class="sh-sub">${estCorrection?'Vérifie les quantités. Après confirmation, seul l’écart avec la réception initiale ajustera le stock.':(estCommande?'Compare la commande au bon de livraison, puis saisis uniquement les quantités réellement reçues. Aucun stock ne sera ajouté avant ta validation.':t('livS'))}</p>
  ${estCommande?'<div class="reception-steps"><div class="reception-step on"><b>1 · Comparer</b>Commande et bon</div><div class="reception-step on"><b>2 · Saisir</b>Reçu et prix réel</div><div class="reception-step"><b>3 · Valider</b>Entrée en stock</div></div>':''}
  <div class="fld"><label>${t('fourn')}</label>
   <input id="lFo" value="${livForm.fo}" list="fournList" placeholder="Metro">
   <datalist id="fournList">${fournis.map(f=>`<option value="${f}">`).join('')}</datalist></div>
  <div class="fld"><label>${estCommande?'Quantité réellement reçue · Prix unitaire réellement facturé':t('qteRecue')+' · '+t('prixU2')}</label></div>
  ${lignes}
  <button class="ing-add" id="lAdd">${t('addLine')}</button>
  <div id="livControl">${controleReceptionHTML(livForm)}</div>
  <div class="calc" style="margin-top:14px"><span class="calc-l">${t('totalLiv')}</span>
   <span class="calc-v">${fmt(total)} €</span></div>
  <div class="sh-actions"><button class="btn btn-2 btn-sm" id="lCancel">${t('cancel')}</button>${estCorrection?'':'<button class="btn btn-2 btn-sm" id="lSaveDraft">Enregistrer le brouillon</button>'}
   <button class="btn" id="lSave">${estCorrection?'Valider la correction':(estCommande?'Valider l’entrée en stock':t('validLiv'))}</button></div></div></div>`;
 document.getElementById('bgL').onclick=e=>{if(e.target.id==='bgL')closeModal()};
 document.getElementById('lFo').oninput=e=>livForm.fo=e.target.value;
 document.querySelectorAll('[data-lk]').forEach(s=>s.onchange=e=>{
  livForm.lines[+s.dataset.lk].id=e.target.value;
  livForm.lines[+s.dataset.lk].attendu=0;livForm.lines[+s.dataset.lk].prixCommande=0;
  const p=prod(e.target.value);if(p&&!livForm.lines[+s.dataset.lk].px)livForm.lines[+s.dataset.lk].px=p.px;
  drawLiv()});
 document.querySelectorAll('[data-lq]').forEach(i=>i.oninput=e=>{livForm.lines[+i.dataset.lq].q=e.target.value;majTotalLiv()});
 document.querySelectorAll('[data-lcart]').forEach(i=>i.oninput=e=>{livForm.lines[+i.dataset.lcart].qCarton=e.target.value;majControleLiv()});
 document.querySelectorAll('[data-lp]').forEach(i=>i.oninput=e=>{livForm.lines[+i.dataset.lp].px=e.target.value;majTotalLiv()});
 document.querySelectorAll('[data-lx]').forEach(b=>b.onclick=()=>{livForm.lines.splice(+b.dataset.lx,1);
 if(!livForm.lines.length)livForm.lines.push({id:st.prods[0].id,q:'',px:'',attendu:0,prixCommande:0});drawLiv()});
 document.getElementById('lAdd').onclick=()=>{livForm.lines.push({id:st.prods[0].id,q:'',qCarton:'',conditionnement:'unite',px:'',attendu:0,prixCommande:0});drawLiv()};
 document.getElementById('lCancel').onclick=closeModal;
 const saveDraft=document.getElementById('lSaveDraft');if(saveDraft)saveDraft.onclick=sauvegarderBrouillonReception;
 document.getElementById('lSave').onclick=saveLiv;
 majControleLiv();
}
function majTotalLiv(){const c=document.querySelector('.calc-v');
 if(c)c.textContent=fmt(livForm.lines.reduce((s,l)=>s+num(l.q)*num(l.px),0))+' €';majControleLiv()}

async function saveLiv(){
 if(!livForm||livForm.saving)return;
 if(livForm.editId)return corrigerLivraison();
 const lines=livForm.lines.filter(l=>l.id&&num(l.q)>0);
 if(!lines.length)return toast('Saisis au moins une quantité réellement reçue.');
 livForm.saving=true;
 const controle=analyserReception(livForm),total=lines.reduce((s,l)=>s+num(l.q)*num(l.px),0),receptionId=Date.now();
 lines.forEach(l=>{
  const q=num(l.q),px=num(l.px);
  st.stock[l.id]=(st.stock[l.id]||0)+q;
  const p=prod(l.id);
  if(p&&px>0&&Math.abs(px-p.px)>0.0001){
   p.hist=p.hist||[];p.hist.push({ts:new Date().toISOString(),px:p.px});
   if(p.hist.length>10)p.hist.shift();
   p.pxPrev=p.px;p.px=px;
  }
 });
 st.liv.unshift({id:receptionId,fo:livForm.fo||'Divers',ts:new Date().toISOString(),
  lines:lines.map(l=>({id:l.id,q:num(l.q),qCarton:l.conditionnement==='carton'?num(l.qCarton):undefined,conditionnement:l.conditionnement==='carton'?'carton':'unite',px:num(l.px)})),total,commandeId:livForm.commandId||null,
  controle:{manquants:controle.manquants.map(function(l){return{id:l.id,q:l.manquant}}),hausses:controle.hausses.map(function(l){return{id:l.id,avant:l.prixCommande,apres:l.prixRecu}}),inattendus:controle.inattendus.map(function(l){return{id:l.id}})}});
 if(livForm.commandId){
  const c=(st.commandes||[]).find(function(x){return x.id===livForm.commandId});
  if(c){
   c.receptionId=receptionId;c.recuLe=new Date().toISOString();
   c.statut=commandeComplete(c)?'recu':'partielle';
  }
 }
 if(livForm.brouillonId)st.receptionBrouillons=(st.receptionBrouillons||[]).filter(function(b){return b.id!==livForm.brouillonId});
 if(st.liv.length>60)st.liv.length=60;
 await save();closeModal();renderLiv();toast(t('livSaved'));
}
function resumeLignesLivraison(lignes){return(lignes||[]).map(function(l){const p=prod(l.id);return(p?p.n:'Produit')+' : '+fmtQ(num(l.q))+' '+(p?p.u:'')}).join(' · ')||'Aucune ligne';}
function modifierLivraison(ix){
 const l=(st.liv||[])[ix];if(!l)return;if(!estResp())return toast('Seuls les profils responsables peuvent corriger une réception.');
 livForm={editId:l.id,editIndex:ix,fo:l.fo||'',linkedCommandId:l.commandeId||null,lines:copierLignesReception(l.lines)};drawLiv();
}
async function corrigerLivraison(){
 const cible=(st.liv||[]).find(function(l){return String(l.id)===String(livForm.editId)});if(!cible)return toast('Cette réception n’est plus disponible.');
 const avant=resumeLignesLivraison(cible.lines),nouvelles=livForm.lines.filter(function(l){return l.id&&num(l.q)>=0}).map(function(l){return{id:l.id,q:num(l.q),qCarton:l.conditionnement==='carton'?num(l.qCarton):undefined,conditionnement:l.conditionnement==='carton'?'carton':'unite',px:num(l.px)}}),ids=new Set([...(cible.lines||[]).map(function(l){return l.id}),...nouvelles.map(function(l){return l.id})]);
 const delta={};ids.forEach(function(id){const ancien=(cible.lines||[]).filter(function(l){return l.id===id}).reduce(function(s,l){return s+num(l.q)},0),nouveau=nouvelles.filter(function(l){return l.id===id}).reduce(function(s,l){return s+num(l.q)},0);delta[id]=nouveau-ancien});
 const impossible=Array.from(ids).find(function(id){return (st.stock[id]||0)+(delta[id]||0)<-0.00001});
 if(impossible){const p=prod(impossible);return toast('Correction impossible : le stock de '+(p?p.n:'ce produit')+' deviendrait négatif.');}
 if(!confirm('Valider cette correction ? Seul l’écart avec la réception initiale ajustera le stock.'))return;
 Array.from(ids).forEach(function(id){st.stock[id]=(st.stock[id]||0)+(delta[id]||0)});
 nouvelles.forEach(function(l){const p=prod(l.id);if(p&&l.px>0&&Math.abs(l.px-p.px)>0.0001){p.hist=p.hist||[];p.hist.push({ts:new Date().toISOString(),px:p.px});if(p.hist.length>10)p.hist.shift();p.pxPrev=p.px;p.px=l.px}});
 cible.fo=livForm.fo||cible.fo;cible.lines=nouvelles;cible.total=nouvelles.reduce(function(s,l){return s+num(l.q)*num(l.px)},0);cible.modifieLe=new Date().toISOString();cible.modifiePar=st.who||'Utilisateur';cible.corrections=cible.corrections||[];cible.corrections.push({ts:cible.modifieLe,par:cible.modifiePar,avant:avant,apres:resumeLignesLivraison(nouvelles)});
 if(cible.commandeId){const c=(st.commandes||[]).find(function(x){return x.id===cible.commandeId});if(c)c.statut=commandeComplete(c)?'recu':'partielle';}
 await save();ajouterHistoriqueAudit('Livraison corrigée',cible.fo,avant,resumeLignesLivraison(nouvelles),'Correction humaine : seul l’écart a ajusté le stock.');closeModal();renderLiv();toast('Réception corrigée. Le stock a été ajusté uniquement de l’écart.');
}
