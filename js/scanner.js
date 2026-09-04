/* SWAY · scanner */

/* ═══════════════════════════════════════════════════════════════
   SCAN DES BONS DE LIVRAISON
   Flux : photo → (OCR) → vérification humaine → validation → stock
   Le stock n'est JAMAIS modifié avant validation explicite.
   ═══════════════════════════════════════════════════════════════ */

/* ── Couche de stockage des documents ──
   Isolée volontairement : pour passer au cloud plus tard,
   il suffit de réécrire ces trois fonctions, rien d'autre. */
const Docs={
 /* IndexedDB quand il est disponible : plusieurs dizaines de Mo.
    Repli automatique sur le stockage applicatif si indisponible
    (navigateur restrictif, mode privé). Les documents déjà
    enregistrés dans st.docs restent lisibles et sont migrés. */
 DB:'invo_docs', STORE:'docs', VER:1,
 MAX_IDB:200,          /* documents conservés en base */
 MAX_LOCAL:12,         /* documents conservés en repli */
 _db:null, _dispo:null,

 async _ouvrir(){
  if(Docs._db)return Docs._db;
  if(typeof indexedDB==='undefined')throw new Error('idb');
  Docs._db=await new Promise((res,rej)=>{
   let r;
   try{r=indexedDB.open(Docs.DB,Docs.VER)}catch(e){rej(e);return}
   r.onupgradeneeded=()=>{const d=r.result;
    if(!d.objectStoreNames.contains(Docs.STORE))d.createObjectStore(Docs.STORE);};
   r.onsuccess=()=>res(r.result);
   r.onerror=()=>rej(r.error||new Error('idb'));
   setTimeout(()=>rej(new Error('idb_delai')),4000);
  });
  return Docs._db;
 },
 async dispo(){
  if(Docs._dispo!==null)return Docs._dispo;
  try{await Docs._ouvrir();Docs._dispo=true}catch(e){Docs._dispo=false}
  return Docs._dispo;
 },
 async _tx(mode){
  const db=await Docs._ouvrir();
  return db.transaction(Docs.STORE,mode).objectStore(Docs.STORE);
 },

 async put(dataUrl){
  const k='d_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  if(await Docs.dispo()){
   try{
    const s=await Docs._tx('readwrite');
    await new Promise((res,rej)=>{const r=s.put(dataUrl,k);r.onsuccess=res;r.onerror=()=>rej(r.error)});
    await Docs._purger();
    return k;
   }catch(e){/* on bascule sur le repli */}
  }
  st.docs[k]=dataUrl;
  const ks=Object.keys(st.docs);
  while(ks.length>Docs.MAX_LOCAL)delete st.docs[ks.shift()];
  return k;
 },

 /* Lecture synchrone pour l'affichage : on sert le cache mémoire,
    alimenté par precharger() avant chaque rendu. */
 _cache:{},
 get(k){
  if(!k)return null;
  if(st.docs&&st.docs[k])return st.docs[k];
  return Docs._cache[k]||null;
 },
 async getAsync(k){
  if(!k)return null;
  if(st.docs&&st.docs[k])return st.docs[k];
  if(Docs._cache[k])return Docs._cache[k];
  if(!await Docs.dispo())return null;
  try{
   const s=await Docs._tx('readonly');
   const v=await new Promise((res,rej)=>{const r=s.get(k);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});
   if(v)Docs._cache[k]=v;
   return v;
  }catch(e){return null}
 },
 /* Charge en mémoire les documents dont l'écran va avoir besoin */
 async precharger(cles){
  const m=(cles||[]).filter(k=>k&&!Docs._cache[k]&&!(st.docs&&st.docs[k]));
  for(const k of m.slice(0,30))await Docs.getAsync(k);
 },

 async del(k){
  if(!k)return;
  delete Docs._cache[k];
  if(st.docs)delete st.docs[k];
  if(await Docs.dispo()){
   try{const s=await Docs._tx('readwrite');s.delete(k)}catch(e){}
  }
 },

 /* Ne conserve que les documents encore référencés par une livraison ou l'administration */
 async _purger(){
  if(!await Docs.dispo())return;
  try{
   const s=await Docs._tx('readwrite');
   const cles=await new Promise((res,rej)=>{
    const r=s.getAllKeys();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});
   if(cles.length<=Docs.MAX_IDB)return;
   const utiles=new Set();
   (st.liv||[]).forEach(l=>(l.docs||[]).forEach(k=>utiles.add(k)));
   ((st.administration&&st.administration.documents)||[]).forEach(function(d){if(d.fileKey)utiles.add(d.fileKey)});
   const s2=await Docs._tx('readwrite');
   cles.filter(k=>!utiles.has(k)).forEach(k=>s2.delete(k));
  }catch(e){}
 },

 /* Migration : les documents déjà présents dans st.docs passent en base */
 async migrer(){
  if(!st.docs||!Object.keys(st.docs).length)return 0;
  if(!await Docs.dispo())return 0;
  let n=0;
  try{
   const s=await Docs._tx('readwrite');
   for(const[k,v]of Object.entries(st.docs)){
    await new Promise(res=>{const r=s.put(v,k);r.onsuccess=res;r.onerror=res});
    Docs._cache[k]=v;n++;
   }
   st.docs={};                       /* libère le stockage applicatif */
   await save();
  }catch(e){}
  return n;
 },

 async restaurer(documents){
  if(!obj(documents))return 0;
  let n=0;
  for(const[k,v]of Object.entries(documents)){
   if(!/^d_[a-z0-9]+$/i.test(k)||typeof v!=='string'||!(v.startsWith('data:image/')||v.startsWith('data:application/pdf')))continue;
   let range=false;
   if(await Docs.dispo())try{
    const s=await Docs._tx('readwrite');
    await new Promise((res,rej)=>{const r=s.put(v,k);r.onsuccess=res;r.onerror=()=>rej(r.error)});
    Docs._cache[k]=v;range=true;
   }catch(e){}
   if(!range){st.docs[k]=v;Docs._cache[k]=v}
   n++;
  }
  return n;
 },
 poids(){let n=0;for(const v of Object.values(st.docs||{}))n+=v.length;return n}
};

/* ADMINISTRATION_CORE_START
   Noyau métier partagé par la vue d'ensemble, les listes, le widget d'accueil
   et les tests. Les alertes restent dérivées des données : aucune duplication
   de calcul ni donnée artificielle dans les composants. */
const ADMIN_INVOICE_STATUSES=[
 {id:'a_verifier',label:'À vérifier'},{id:'a_valider',label:'À valider'},
 {id:'a_payer',label:'À payer'},{id:'payee',label:'Payée'},
 {id:'litige',label:'Litige'},{id:'archivee',label:'Archivée'}
];
const ADMIN_DOCUMENT_TYPES=[
 {id:'facture',label:'Facture'},{id:'avoir',label:'Avoir'},{id:'devis',label:'Devis'},
 {id:'bon_livraison',label:'Bon de livraison'},{id:'contrat',label:'Contrat'},
 {id:'assurance',label:'Assurance'},{id:'justificatif',label:'Justificatif'},
 {id:'fournisseur',label:'Document fournisseur'},{id:'administratif',label:'Document administratif'},
 {id:'autre',label:'Autre'}
];
const ADMIN_PROCESSING_STATUSES=[
 {id:'pending',label:'En attente'},{id:'processing',label:'Traitement'},
 {id:'completed',label:'Traité'},{id:'error',label:'Erreur'},
 {id:'needs_review',label:'À vérifier'}
];
const ADMIN_CONTRACT_STATUSES=[{id:'actif',label:'Actif'},{id:'a_renouveler',label:'À renouveler'},{id:'resilie',label:'Résilié'},{id:'expire',label:'Expiré'}];
const ADMIN_OBLIGATION_STATUSES=[{id:'conforme',label:'Conforme'},{id:'a_renouveler',label:'À renouveler'},{id:'bientot_expire',label:'Bientôt expiré'},{id:'expire',label:'Expiré'},{id:'manquant',label:'Manquant'}];
const ADMIN_APPROVAL_STATUSES=[{id:'pending',label:'En attente'},{id:'approved',label:'Approuvée'},{id:'rejected',label:'Rejetée'},{id:'cancelled',label:'Annulée'}];
const ADMIN_EMAIL_PROVIDERS=[{id:'gmail',label:'Google Gmail / Workspace'},{id:'microsoft',label:'Microsoft Outlook / 365'},{id:'imap',label:'Autre messagerie (passerelle IMAP)'}];
const ADMIN_MAX_FILE=15*1024*1024;
const adminDateISO=function(date){const d=date||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function adminDate(value){if(!value)return null;const d=value instanceof Date?new Date(value):new Date(String(value).slice(0,10)+'T12:00:00');return isNaN(d.getTime())?null:d}
function adminDiffJours(value,maintenant){
 const cible=adminDate(value);if(!cible)return null;
 const jour=adminDate(adminDateISO(maintenant||new Date()));
 return Math.ceil((cible-jour)/86400000);
}
function adminEtablissementId(){return(session&&session.etabId)||st.etabId||'etablissement-local'}
function adminOrganisationId(){return st.organizationId||null}
function adminAuteur(){return(session&&session.email)||st.who||'Utilisateur local'}
function adminData(){if(!st.administration)st.administration=administrationVierge();return st.administration}
function adminDansEtablissement(liste){
 const id=adminEtablissementId();
 return(liste||[]).filter(function(x){return !x.establishmentId||x.establishmentId===id});
}
function adminStatutFacture(facture,maintenant){
 const statut=facture.status||'a_verifier';
 if(statut==='payee'||statut==='archivee')return statut;
 return facture.dueDate&&adminDiffJours(facture.dueDate,maintenant)<0?'en_retard':statut;
}
function adminFactureOuverte(facture){const s=facture.status||'a_verifier';return s!=='payee'&&s!=='archivee'}
function adminRegleApprobation(facture){
 const montant=num(facture.amountTTC),etab=facture.establishmentId||adminEtablissementId();
 const rules=(adminData().approvalWorkflows||[]).length?adminData().approvalWorkflows:(adminData().settings.approvalRules||[]);
 return rules.slice().sort(function(a,b){return num(a.minAmount)-num(b.minAmount)}).find(function(r){
  const max=r.maxAmount===null||r.maxAmount===''||r.maxAmount===undefined?Infinity:num(r.maxAmount);
  return r.enabled!==false&&montant>=num(r.minAmount)&&montant<=max&&(!r.establishmentId||r.establishmentId==='all'||r.establishmentId===etab)&&(!r.documentType||r.documentType==='facture');
 });
}
function adminCoutsContrat(contrat){
 let mensuel=Math.max(0,num(contrat.costMonthly)),annuel=Math.max(0,num(contrat.costAnnual));
 if(!annuel&&mensuel)annuel=mensuel*12;if(!mensuel&&annuel)mensuel=annuel/12;
 return{monthly:mensuel,annual:annuel};
}
function adminStatutContrat(contrat,maintenant){
 if(contrat.status==='resilie')return'resilie';
 const jours=adminDiffJours(contrat.endDate,maintenant);
 return jours!==null&&jours<0?'expire':jours!==null&&jours<=Math.max.apply(null,adminData().settings.contractAlertDays||[90])?'a_renouveler':(contrat.status||'actif');
}
function adminStatutObligation(obligation,maintenant){
 if(obligation.status==='manquant')return'manquant';
 const jours=adminDiffJours(obligation.nextDue,maintenant);
 return jours!==null&&jours<0?'expire':jours!==null&&jours<=30?'bientot_expire':jours!==null&&jours<=90?'a_renouveler':(obligation.status||'conforme');
}
function adminAnomaliesDetectees(maintenant){
 const factures=adminDansEtablissement(adminData().invoices),resultats=[],sauvees=adminData().anomalies||[];
 const ajouter=function(a){const saved=sauvees.find(function(s){return s.key===a.key});resultats.push(Object.assign(a,{status:saved?saved.status:'detectee',resolution:saved?saved.resolution||'':'',detectedAt:saved?saved.detectedAt:new Date().toISOString()}))};
 const doublons={};
 factures.forEach(function(f){const n=String(f.invoiceNumber||'').trim().toLowerCase(),fo=String(f.supplier||'').trim().toLowerCase();if(n&&fo)(doublons[fo+'|'+n]||(doublons[fo+'|'+n]=[])).push(f)});
 Object.entries(doublons).filter(function(x){return x[1].length>1}).forEach(function(x){const f=x[1][0];ajouter({key:'duplicate_'+x[0],type:'facture_dupliquee',severity:'high',description:(f.supplier||'Fournisseur')+' · facture n° '+f.invoiceNumber,entityType:'SupplierInvoice',entityId:f.id})});
 factures.forEach(function(f){
  if(!String(f.invoiceNumber||'').trim())ajouter({key:'missing_number_'+f.id,type:'information_manquante',severity:'medium',description:(f.supplier||'Fournisseur')+' · numéro de facture manquant',entityType:'SupplierInvoice',entityId:f.id});
  const autres=factures.filter(function(x){return x.id!==f.id&&x.supplier===f.supplier&&num(x.amountTTC)>0});
  if(autres.length>=3){const moyenne=autres.reduce(function(s,x){return s+num(x.amountTTC)},0)/autres.length;if(moyenne>0&&num(f.amountTTC)>moyenne*1.5)ajouter({key:'unusual_'+f.id,type:'montant_inhabituel',severity:'high',description:(f.supplier||'Fournisseur')+' · montant '+Math.round((num(f.amountTTC)/moyenne-1)*100)+' % supérieur à la moyenne',entityType:'SupplierInvoice',entityId:f.id})}
  if(f.orderReference){const c=(st.commandes||[]).find(function(x){return x.id===f.orderReference});if(c){const attendu=(c.lines||[]).reduce(function(s,l){return s+num(l.q)*num(l.px)},0),ecart=Math.abs(attendu-num(f.amountHT));if(ecart>Math.max(1,attendu*.05))ajouter({key:'order_diff_'+f.id,type:'difference_commande_facture',severity:'high',description:(f.supplier||'Fournisseur')+' · écart commande/facture de '+fmt(ecart)+' €',entityType:'SupplierInvoice',entityId:f.id})}}
  if(f.deliveryReference){const l=(st.liv||[]).find(function(x){return x.id===f.deliveryReference});if(l){const ecart=Math.abs(num(l.total)-num(f.amountHT));if(ecart>Math.max(1,num(l.total)*.05))ajouter({key:'delivery_diff_'+f.id,type:'difference_livraison_facture',severity:'high',description:(f.supplier||'Fournisseur')+' · écart livraison/facture de '+fmt(ecart)+' €',entityType:'SupplierInvoice',entityId:f.id})}}
 });
 const seuil=Math.max(0,num(adminData().settings.priceIncreaseAlertPercent||10));
 (st.prods||[]).filter(function(p){return p.fo&&num(p.pxPrev)>0&&num(p.px)>num(p.pxPrev)}).forEach(function(p){const hausse=(num(p.px)/num(p.pxPrev)-1)*100;if(hausse>=seuil)ajouter({key:'supplier_price_'+p.id,type:'augmentation_prix',severity:hausse>=25?'high':'medium',description:(p.fo||'Fournisseur')+' · '+(p.n||p.id)+' en hausse de '+Math.round(hausse)+' %',entityType:'Supplier',entityId:p.fo})});
 return resultats;
}
function adminCalendrier(maintenant){
 const events=[];
 adminDansEtablissement(adminData().invoices).filter(adminFactureOuverte).forEach(function(f){if(f.dueDate)events.push({id:'inv_'+f.id,date:f.dueDate,type:'facture',title:'Facture · '+(f.supplier||'Fournisseur'),detail:fmt(num(f.amountTTC))+' €',objectId:f.id,tab:'invoices'})});
 adminDansEtablissement(adminData().contracts).forEach(function(c){if(c.endDate&&adminStatutContrat(c,maintenant)!=='resilie')events.push({id:'contract_'+c.id,date:c.endDate,type:'contrat',title:'Contrat · '+c.name,detail:c.supplier||'',objectId:c.id,tab:'contracts'})});
 adminDansEtablissement(adminData().documents).forEach(function(d){if(d.expiryDate&&d.status!=='archive')events.push({id:'doc_'+d.id,date:d.expiryDate,type:'document',title:'Expiration · '+(d.title||d.fileName||'Document'),detail:d.supplier||'',objectId:d.id,tab:'documents'})});
 adminDansEtablissement(adminData().obligations).forEach(function(o){if(o.nextDue)events.push({id:'obl_'+o.id,date:o.nextDue,type:'obligation',title:'Conformité · '+o.name,detail:o.responsible||'',objectId:o.id,tab:'compliance'})});
 adminDansEtablissement(adminData().deadlines).filter(function(d){return d.status!=='completed'}).forEach(function(d){events.push({id:'deadline_'+d.id,date:d.date,type:d.type||'manuel',title:d.title,detail:d.notes||'',objectId:d.id,tab:'calendar'})});
 return events.filter(function(e){return adminDate(e.date)}).sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
}
function adminPrevisionTresorerie(maintenant){
 const data=adminData(),solde=data.settings.currentCashBalance===null||data.settings.currentCashBalance===''||data.settings.currentCashBalance===undefined?null:num(data.settings.currentCashBalance),events=[];
 adminDansEtablissement(data.invoices).filter(adminFactureOuverte).forEach(function(f){if(f.dueDate)events.push({id:'invoice_'+f.id,date:f.dueDate,title:'Fournisseur · '+(f.supplier||'Facture'),amount:-num(f.amountTTC),source:'invoice'})});
 adminDansEtablissement(data.cashFlowForecasts).forEach(function(e){if(e.date)events.push({id:e.id,date:e.date,title:e.title||'Mouvement prévisionnel',amount:(e.direction==='in'?1:-1)*Math.abs(num(e.amount)),source:'manual'})});
 events.sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
 let courant=solde,pointBas=solde,pointBasDate=null;
 const projection=events.map(function(e){if(courant!==null){courant+=e.amount;if(pointBas===null||courant<pointBas){pointBas=courant;pointBasDate=e.date}}return Object.assign({},e,{balance:courant})});
 return{status:solde===null?'missing':'ready',currentBalance:solde,events:projection,forecastBalance:courant,lowPoint:pointBas,lowPointDate:pointBasDate};
}
function adminTVA(maintenant){
 const factures=adminDansEtablissement(adminData().invoices),rates=adminData().settings.taxRates||[5.5,10,20],parTaux={},parMois={};
 rates.forEach(function(r){parTaux[String(num(r))]=0});
 factures.forEach(function(f){
  const k=String(num(f.taxRate));if(f.taxRate!==null&&f.taxRate!==undefined)parTaux[k]=(parTaux[k]||0)+num(f.taxAmount);
  const mois=String(f.documentDate||'').slice(0,7);if(/^\d{4}-\d{2}$/.test(mois))parMois[mois]=(parMois[mois]||0)+num(f.taxAmount);
 });
 const deductible=factures.reduce(function(s,f){return s+num(f.taxAmount)},0),source=adminData().settings.vatCollectedSource;
 const collected=source&&Number.isFinite(num(source.amount))?num(source.amount):null;
 return{deductible,collected,estimated:collected===null?null:collected-deductible,byRate:parTaux,byMonth:Object.entries(parMois).sort(function(a,b){return a[0].localeCompare(b[0])}).slice(-12),rates};
}
function adminResume(maintenant){
 const data=adminData(),factures=adminDansEtablissement(data.invoices),documents=adminDansEtablissement(data.documents);
 const ouvertes=factures.filter(adminFactureOuverte),retard=ouvertes.filter(function(f){return adminStatutFacture(f,maintenant)==='en_retard'});
 const sous30=ouvertes.filter(function(f){const j=adminDiffJours(f.dueDate,maintenant);return j!==null&&j>=0&&j<=30});
 const documentsAction=documents.filter(function(d){const j=adminDiffJours(d.expiryDate,maintenant);return d.processingStatus==='needs_review'||d.processingStatus==='error'||(j!==null&&j<=30)});
 const contrats=adminDansEtablissement(data.contracts),obligations=adminDansEtablissement(data.obligations),cash=adminPrevisionTresorerie(maintenant);
 return{
  invoicesToPay:ouvertes.length,totalToPay:ouvertes.reduce(function(s,f){return s+num(f.amountTTC)},0),
  overdueCount:retard.length,overdueAmount:retard.reduce(function(s,f){return s+num(f.amountTTC)},0),
  deadlines30:sous30.length,contractsExpiring:contrats.filter(function(c){const j=adminDiffJours(c.endDate,maintenant);return j!==null&&j>=0&&j<=30}).length,
  documentsAction:documentsAction.length,deductibleTax:factures.reduce(function(s,f){return s+num(f.taxAmount)},0),
  contractAnnualCost:contrats.filter(function(c){return adminStatutContrat(c,maintenant)!=='resilie'}).reduce(function(s,c){return s+adminCoutsContrat(c).annual},0),
  obligationsAction:obligations.filter(function(o){return['a_renouveler','bientot_expire','expire','manquant'].includes(adminStatutObligation(o,maintenant))}).length,
  pendingApprovals:factures.filter(function(f){return f.approvalStatus==='pending'}).length,
  currentCash:cash.currentBalance,forecastCash:cash.forecastBalance
 };
}
function adminAlertes(maintenant){
 const data=adminData(),alertes=[],factures=adminDansEtablissement(data.invoices),documents=adminDansEtablissement(data.documents);
 factures.filter(adminFactureOuverte).forEach(function(f){
  const jours=adminDiffJours(f.dueDate,maintenant),retard=jours!==null&&jours<0;
  if(retard||jours!==null&&jours<=30)alertes.push({
   id:'invoice_due_'+f.id,priority:retard&&(Math.abs(jours)>7)?'critical':retard||jours<=7?'high':'medium',
   category:'Facture',title:retard?'Facture en retard':'Facture à échéance',
   description:(f.supplier||'Fournisseur')+(retard?' · '+Math.abs(jours)+' jour'+(Math.abs(jours)>1?'s':'')+' de retard':' · dans '+jours+' jour'+(jours>1?'s':'')),
   amount:num(f.amountTTC),deadline:f.dueDate,establishmentId:f.establishmentId,objectId:f.id,tab:'invoices'
  });
 });
 documents.forEach(function(d){
  if(d.processingStatus==='error'||d.processingStatus==='needs_review')alertes.push({
   id:'document_review_'+d.id,priority:d.processingStatus==='error'?'high':'medium',category:'Document',
   title:d.processingStatus==='error'?'Traitement du document en erreur':'Document à vérifier',
   description:d.title||d.fileName||'Document administratif',amount:null,deadline:null,
   establishmentId:d.establishmentId,objectId:d.id,tab:'inbox'
  });
  const jours=adminDiffJours(d.expiryDate,maintenant);
  if(jours!==null&&jours<=30)alertes.push({
   id:'document_expiry_'+d.id,priority:jours<0?'high':jours<=7?'high':'medium',category:d.type==='contrat'?'Contrat':'Document',
   title:jours<0?'Document expiré':'Document bientôt expiré',description:d.title||d.fileName||'Document administratif',
   amount:null,deadline:d.expiryDate,establishmentId:d.establishmentId,objectId:d.id,tab:'documents'
  });
 });
 adminDansEtablissement(data.contracts).forEach(function(c){const jours=adminDiffJours(c.endDate,maintenant),delais=data.settings.contractAlertDays||[90,60,30,7];if(jours!==null&&jours<=Math.max.apply(null,delais)&&adminStatutContrat(c,maintenant)!=='resilie')alertes.push({id:'contract_due_'+c.id,priority:jours<0||jours<=7?'high':jours<=30?'medium':'info',category:'Contrat',title:jours<0?'Contrat expiré':'Contrat à renouveler',description:c.name+(c.supplier?' · '+c.supplier:''),amount:adminCoutsContrat(c).annual,deadline:c.endDate,establishmentId:c.establishmentId,objectId:c.id,tab:'contracts'})});
 adminDansEtablissement(data.obligations).forEach(function(o){const statut=adminStatutObligation(o,maintenant),jours=adminDiffJours(o.nextDue,maintenant);if(statut!=='conforme')alertes.push({id:'obligation_'+o.id,priority:statut==='expire'||statut==='manquant'?'critical':jours!==null&&jours<=7?'high':'medium',category:'Conformité',title:statut==='manquant'?'Document obligatoire manquant':statut==='expire'?'Obligation expirée':'Obligation à renouveler',description:o.name,amount:null,deadline:o.nextDue,establishmentId:o.establishmentId,objectId:o.id,tab:'compliance'})});
 adminDansEtablissement(data.deadlines).filter(function(d){const j=adminDiffJours(d.date,maintenant);return d.status!=='completed'&&j!==null&&j<=30}).forEach(function(d){const j=adminDiffJours(d.date,maintenant);alertes.push({id:'deadline_'+d.id,priority:j<0?'high':j<=7?'medium':'info',category:'Échéance',title:j<0?'Échéance dépassée':'Échéance administrative proche',description:d.title,amount:num(d.amount)||null,deadline:d.date,establishmentId:d.establishmentId,objectId:d.id,tab:'calendar'})});
 factures.filter(function(f){return f.approvalStatus==='pending'}).forEach(function(f){alertes.push({id:'approval_'+f.id,priority:'high',category:'Validation',title:'Facture en attente de validation',description:(f.supplier||'Fournisseur')+' · '+fmt(num(f.amountTTC))+' €',amount:num(f.amountTTC),deadline:f.dueDate,establishmentId:f.establishmentId,objectId:f.id,tab:'invoices'})});
 adminAnomaliesDetectees(maintenant).filter(function(a){return a.status!=='resolue'&&a.status!=='ignoree'}).forEach(function(a){alertes.push({id:'anomaly_'+a.key,priority:a.severity,category:'Anomalie',title:a.type==='facture_dupliquee'?'Facture potentiellement dupliquée':a.type==='montant_inhabituel'?'Montant inhabituel':a.type==='information_manquante'?'Information manquante':'Écart détecté',description:a.description,amount:null,deadline:null,establishmentId:adminEtablissementId(),objectId:a.key,tab:'anomalies'})});
 const cash=adminPrevisionTresorerie(maintenant),seuil=num(data.settings.cashWarningThreshold);
 if(cash.status==='ready'&&cash.lowPoint!==null&&cash.lowPoint<seuil)alertes.push({id:'cash_low',priority:cash.lowPoint<0?'critical':'high',category:'Trésorerie',title:'Trésorerie prévisionnelle trop faible',description:'Point bas prévu à '+fmt(cash.lowPoint)+' €'+(cash.lowPointDate?' le '+adminFormatDate(cash.lowPointDate):''),amount:cash.lowPoint,deadline:cash.lowPointDate,establishmentId:adminEtablissementId(),objectId:'cash',tab:'cashflow'});
 const ordre={critical:0,high:1,medium:2,info:3};
 return alertes.sort(function(a,b){return ordre[a.priority]-ordre[b.priority]||String(a.deadline||'9999').localeCompare(String(b.deadline||'9999'))});
}
function adminAssistant(maintenant){
 const r=adminResume(maintenant),alertes=adminAlertes(maintenant),phrases=[];
 if(r.overdueCount)phrases.push(r.overdueCount+' facture'+(r.overdueCount>1?'s sont':' est')+' en retard pour '+fmt(r.overdueAmount)+' €.');
 if(r.deadlines30)phrases.push(r.deadlines30+' facture'+(r.deadlines30>1?'s arrivent':' arrive')+' à échéance sous 30 jours pour un total de '+fmt(adminDansEtablissement(adminData().invoices).filter(adminFactureOuverte).filter(function(f){const j=adminDiffJours(f.dueDate,maintenant);return j!==null&&j>=0&&j<=30}).reduce(function(s,f){return s+num(f.amountTTC)},0))+' €.');
 const expiration=alertes.find(function(a){return a.id.indexOf('document_expiry_')===0});
 if(expiration)phrases.push(expiration.description+' '+(adminDiffJours(expiration.deadline,maintenant)<0?'a expiré.':'arrive à échéance dans '+adminDiffJours(expiration.deadline,maintenant)+' jours.'));
 const contrat=alertes.find(function(a){return a.id.indexOf('contract_due_')===0});if(contrat)phrases.push(contrat.description+' arrive à échéance '+(adminDiffJours(contrat.deadline,maintenant)<0?'et doit être régularisé.':'dans '+adminDiffJours(contrat.deadline,maintenant)+' jours.'));
 if(alertes.some(function(a){return a.id.indexOf('anomaly_duplicate_')===0}))phrases.push('Une facture potentiellement dupliquée nécessite une vérification.');
 const cash=adminPrevisionTresorerie(maintenant);if(cash.status==='ready'&&cash.lowPointDate)phrases.push('Le point bas de trésorerie prévu est de '+fmt(cash.lowPoint)+' € le '+adminFormatDate(cash.lowPointDate)+'.');
 if(!phrases.length)phrases.push('Aucune action administrative urgente n’est détectée avec les données présentes.');
 return phrases.slice(0,4);
}
function adminJournaliser(action,entityType,entityId,details){
 const log=adminData().auditLog;
 log.unshift({id:uid('audit'),action,entityType,entityId,details:details||'',createdAt:new Date().toISOString(),createdBy:adminAuteur(),establishmentId:adminEtablissementId(),organizationId:adminOrganisationId()});
 if(log.length>250)log.length=250;
}
function adminConstruireFacture(input,existante,maintenant){
 const f=existante||{},date=(maintenant||new Date()).toISOString(),statuts=ADMIN_INVOICE_STATUSES.map(function(x){return x.id});
 const statut=statuts.includes(input.status)?input.status:'a_verifier',ht=Math.max(0,num(input.amountHT)),taxe=Math.max(0,num(input.taxAmount));
 const ttc=input.amountTTC===''||input.amountTTC===null||input.amountTTC===undefined?ht+taxe:Math.max(0,num(input.amountTTC));
 const etab=f.establishmentId||input.establishmentId||adminEtablissementId(),regle=adminRegleApprobation({amountTTC:ttc,establishmentId:etab});
 return{
  id:f.id||uid('ainv'),documentId:input.documentId||null,invoiceNumber:String(input.invoiceNumber||'').trim(),
  supplier:String(input.supplier||'').trim(),establishmentId:etab,
  organizationId:f.organizationId===undefined?(input.organizationId===undefined?adminOrganisationId():input.organizationId):f.organizationId,
  documentDate:input.documentDate||null,dueDate:input.dueDate||null,amountHT:ht,taxAmount:taxe,amountTTC:ttc,taxRate:input.taxRate===''?null:num(input.taxRate),status:statut,
  paymentDate:input.paymentDate||(statut==='payee'?adminDateISO(maintenant):null),paymentMethod:String(input.paymentMethod||'').trim(),
  orderReference:String(input.orderReference||'').trim(),deliveryReference:String(input.deliveryReference||'').trim(),
  lines:Array.isArray(input.lines)?input.lines:(Array.isArray(f.lines)?f.lines:[]),categories:Array.isArray(input.categories)?input.categories:(Array.isArray(f.categories)?f.categories:[]),
  expenseCategoryId:input.expenseCategoryId||null,accountingCategoryId:input.accountingCategoryId||null,
  approvalRuleId:regle?regle.id:null,approvalStatus:input.approvalStatus||f.approvalStatus||(regle?'pending':'approved'),
  notes:String(input.notes||'').trim(),
  createdAt:f.createdAt||date,updatedAt:date,createdBy:f.createdBy||adminAuteur()
 };
}
function adminSynchroniserDemandeApprobation(facture,maintenant){
 const data=adminData(),date=(maintenant||new Date()).toISOString(),demandes=data.approvalRequests||(data.approvalRequests=[]);
 let demande=demandes.find(function(x){return x.invoiceId===facture.id&&x.status==='pending'});
 if(facture.approvalStatus==='pending'){
  if(!demande){demande={id:uid('arequest'),invoiceId:facture.id,documentType:'facture',documentId:facture.documentId||null,workflowId:facture.approvalRuleId||null,requestedRole:(adminRegleApprobation(facture)||{}).role||null,status:'pending',establishmentId:facture.establishmentId,organizationId:facture.organizationId,createdAt:date,updatedAt:date,createdBy:adminAuteur()};demandes.unshift(demande)}
  else{demande.workflowId=facture.approvalRuleId||null;demande.updatedAt=date}
 }else if(demande){demande.status=facture.approvalStatus||'cancelled';demande.updatedAt=date;demande.resolvedBy=adminAuteur();demande.resolvedAt=date}
 return demande||null;
}
function adminAppliquerStatutFacture(facture,statut,maintenant){
 if(!facture||!ADMIN_INVOICE_STATUSES.some(function(x){return x.id===statut}))return false;
 facture.status=statut;facture.updatedAt=(maintenant||new Date()).toISOString();
 if(statut==='payee'&&!facture.paymentDate)facture.paymentDate=adminDateISO(maintenant);
 return true;
}
/* ADMINISTRATION_CORE_END */

function adminLibelleStatut(statut){
 if(statut==='en_retard')return'En retard';
 const x=ADMIN_INVOICE_STATUSES.find(function(s){return s.id===statut});return x?x.label:statut||'—';
}
function adminClasseStatut(statut){
 return statut==='en_retard'?'critical':statut==='payee'?'ok':statut==='a_payer'||statut==='a_valider'?'warn':statut==='a_verifier'?'info':'';
}
function adminFormatDate(date){const d=adminDate(date);return d?d.toLocaleDateString('fr-FR'):'—'}
function adminMailConfig(){
 const s=adminData().settings;if(!s.mailInbox)s.mailInbox={provider:'',address:'',status:'not_configured',autoImport:true,unreadOnly:true,lastSync:null,lastError:''};return s.mailInbox;
}
function adminMailStatusLabel(status){return status==='connected'?'Connectée':status==='syncing'?'Synchronisation…':status==='error'?'Erreur':status==='needs_configuration'?'Connexion à finaliser':'Non configurée'}
function adminEmailAdapter(provider){return(window.INVO_ADMIN_EMAIL_ADAPTERS||{})[provider]||null}
function adminEmailExpediteur(message){
 const from=message&&message.from;if(typeof from==='string')return{name:from.split('@')[0]||'',address:from};return{name:String((from&&from.name)||''),address:String((from&&from.address)||'')};
}
function adminEmailPieceValide(piece){
 if(!piece||!piece.dataUrl)return false;const type=String(piece.type||'').toLowerCase(),nom=String(piece.name||'').toLowerCase();
 const accepte=type==='application/pdf'||type.startsWith('image/')||/\.(pdf|png|jpe?g|webp|heic)$/.test(nom),taille=num(piece.size)||Math.floor(String(piece.dataUrl).split(',').pop().length*.75);return accepte&&taille>0&&taille<=ADMIN_MAX_FILE;
}
async function adminImporterMessagesEmail(messages){
 const data=adminData(),journal=data.emailMessages||(data.emailMessages=[]);let documents=0,factures=0,ignores=0;
 for(const message of(Array.isArray(messages)?messages:[])){
  const messageId=String(message.id||message.messageId||'').trim();if(!messageId||journal.some(function(x){return x.messageId===messageId})){ignores++;continue}
  const expediteur=adminEmailExpediteur(message),pieces=(message.attachments||[]).filter(adminEmailPieceValide);let importees=0;
  for(const piece of pieces){
   const sourceKey=messageId+'|'+String(piece.id||piece.name||importees);if(data.documents.some(function(d){return d.sourceKey===sourceKey})){ignores++;continue}
   const now=new Date().toISOString(),extrait=Object.assign({},message.extracted||{},piece.extracted||{}),fileKey=await Docs.put(String(piece.dataUrl)),dateDoc=extrait.documentDate||String(message.receivedAt||now).slice(0,10),record={
    id:uid('adoc'),title:String(message.subject||piece.name||'Facture reçue par email'),type:'facture',supplier:String(extrait.supplier||expediteur.name||expediteur.address||''),establishmentId:adminEtablissementId(),organizationId:adminOrganisationId(),documentDate:dateDoc,dueDate:extrait.dueDate||null,expiryDate:extrait.dueDate||null,status:'actif',notes:'Importée automatiquement depuis la messagerie configurée.',fileKey,fileName:String(piece.name||'facture'),fileType:String(piece.type||''),fileSize:num(piece.size),processingStatus:'needs_review',source:'email',sourceKey,sourceMessageId:messageId,receivedAt:message.receivedAt||now,createdAt:now,updatedAt:now,createdBy:'Connecteur email'
   };data.documents.unshift(record);documents++;importees++;
   const facture=adminConstruireFacture({documentId:record.id,invoiceNumber:extrait.invoiceNumber||'',supplier:record.supplier,establishmentId:record.establishmentId,organizationId:record.organizationId,documentDate:record.documentDate,dueDate:record.dueDate,amountHT:extrait.amountHT??0,taxAmount:extrait.taxAmount??0,amountTTC:extrait.amountTTC??0,taxRate:extrait.taxRate??'',status:'a_verifier',paymentDate:null,paymentMethod:'',orderReference:extrait.orderReference||'',deliveryReference:extrait.deliveryReference||'',expenseCategoryId:null,accountingCategoryId:null,notes:'Créée depuis un email · informations à vérifier'},null,new Date());
   facture.source='email';facture.sourceMessageId=messageId;data.invoices.unshift(facture);adminSynchroniserDemandeApprobation(facture,new Date());factures++;
  }
  journal.unshift({id:uid('aemail'),messageId,subject:String(message.subject||''),from:expediteur.address,receivedAt:message.receivedAt||null,status:importees?'imported':'no_supported_attachment',documentCount:importees,createdAt:new Date().toISOString(),establishmentId:adminEtablissementId(),organizationId:adminOrganisationId()});
 }
 if(documents)adminJournaliser('Factures importées depuis la messagerie','AdministrativeEmailInbox','sync',documents+' document'+(documents>1?'s':'')+' · '+factures+' facture'+(factures>1?'s':''));
 return{documents,factures,ignored:ignores};
}
async function adminSynchroniserMessagerie(options){
 const silencieux=!!(options&&options.silent),cfg=adminMailConfig(),adapter=adminEmailAdapter(cfg.provider);
 if(!cfg.address||!cfg.provider)return{status:'not_configured',documents:0};
 if(!adapter||typeof adapter.listInvoices!=='function'){
  cfg.status='needs_configuration';cfg.lastError='Un backend OAuth sécurisé doit être connecté à INVO avant la première relève.';adminData().settings.integrations.emailInbox='needs_configuration';await save();if(screen==='admin')renderAdministration();if(!silencieux)toast('La connexion email nécessite encore le service OAuth côté serveur.');return{status:cfg.status,documents:0};
 }
 try{
  cfg.status='syncing';cfg.lastError='';if(screen==='admin')renderAdministration();
  if(typeof adapter.connect==='function'&&adapter.isConnected&&!(await adapter.isConnected()))await adapter.connect({address:cfg.address});
  const messages=await adapter.listInvoices({address:cfg.address,since:cfg.lastSync,unreadOnly:cfg.unreadOnly!==false,attachmentTypes:['application/pdf','image/*']});
  const resultat=await adminImporterMessagesEmail(messages);cfg.status='connected';cfg.lastSync=new Date().toISOString();adminData().settings.integrations.emailInbox='connected';await save();if(screen==='admin')renderAdministration();if(!silencieux)toast(resultat.documents?resultat.documents+' facture'+(resultat.documents>1?'s':'')+' importée'+(resultat.documents>1?'s':'')+'.':'Aucune nouvelle facture trouvée.');return Object.assign({status:'connected'},resultat);
 }catch(e){console.error('Synchronisation email impossible',e);cfg.status='error';cfg.lastError='La relève a échoué. Vérifiez la connexion du fournisseur de messagerie.';adminData().settings.integrations.emailInbox='error';await save();if(screen==='admin')renderAdministration();if(!silencieux)toast('Impossible de relever la messagerie.');return{status:'error',documents:0}}
}
function adminSynchronisationAutomatique(){
 const cfg=adminMailConfig(),derniere=cfg.lastSync?new Date(cfg.lastSync).getTime():0;if(cfg.autoImport&&cfg.status==='connected'&&Date.now()-derniere>15*60*1000)adminSynchroniserMessagerie({silent:true});
}
function adminWidgetAccueil(){
 if(!estResp())return'';
 const r=adminResume(new Date()),urgentes=adminAlertes(new Date()).filter(function(a){return a.priority==='critical'||a.priority==='high'}).length;
 return '<section class="admin-widget" aria-label="Synthèse Administration"><div><small>ADMINISTRATION</small><h2>Votre centre de contrôle administratif</h2><div class="admin-widget-stats"><span><b>'+urgentes+'</b> action'+(urgentes>1?'s':'')+' urgente'+(urgentes>1?'s':'')+'</span><span><b>'+r.invoicesToPay+'</b> facture'+(r.invoicesToPay>1?'s':'')+' à payer</span><span><b>'+fmt(r.totalToPay)+' €</b> à décaisser</span><span><b>'+r.deadlines30+'</b> échéance'+(r.deadlines30>1?'s':'')+' ce mois</span></div></div><button class="btn btn-sm" data-admin-open>Voir l’administration</button></section>';
}
function lierWidgetAdministration(racine){
 const b=(racine||document).querySelector('[data-admin-open]');
 if(b)b.onclick=function(){screen='admin';adminTab='overview';sq='';go()};
}

function adminTabs(){
 const tabs=[['overview','Vue d’ensemble'],['inbox','Inbox'],['invoices','Factures'],['deadlines','Échéancier'],['cashflow','Trésorerie'],['vat','TVA'],['accounting','Pré-comptabilité'],['contracts','Contrats'],['documents','Documents'],['calendar','Calendrier'],['compliance','Conformité'],['anomalies','Anomalies'],['settings','Paramètres']];
 return '<nav class="admin-tabs" aria-label="Navigation Administration">'+tabs.map(function(x){return '<button class="'+(adminTab===x[0]?'on':'')+'" data-admin-tab="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</nav>';
}
function adminPaginer(liste,cle){
 const taille=20,totalPages=Math.max(1,Math.ceil(liste.length/taille));let page=Math.max(1,Math.min(totalPages,adminPages[cle]||1));adminPages[cle]=page;
 return{items:liste.slice((page-1)*taille,page*taille),page,totalPages,total:liste.length};
}
function adminPagerHTML(p,cle){
 if(p.totalPages<=1)return'';
 return '<div class="admin-pager"><button data-admin-page="'+cle+'" data-page="'+(p.page-1)+'" '+(p.page<=1?'disabled':'')+'>Précédent</button><span>Page '+p.page+' / '+p.totalPages+' · '+p.total+' éléments</span><button data-admin-page="'+cle+'" data-page="'+(p.page+1)+'" '+(p.page>=p.totalPages?'disabled':'')+'>Suivant</button></div>';
}
function adminVide(icone,titre,texte,action){
 return '<div class="admin-empty"><i>'+icone+'</i><b>'+titre+'</b><span>'+texte+'</span>'+(action||'')+'</div>';
}
function adminPrioriteLabel(p){return p==='critical'?'Critique':p==='high'?'Haute':p==='medium'?'Moyenne':'Information'}
function adminActionsHTML(alertes){
 if(!alertes.length)return adminVide('✓','Rien à traiter','Aucune échéance, anomalie ou pièce à vérifier avec les données présentes.','');
 return '<div class="admin-actions">'+alertes.slice(0,8).map(function(a){
  return '<article class="admin-action"><i class="admin-priority '+a.priority+'" title="'+adminPrioriteLabel(a.priority)+'"></i><div class="admin-action-copy"><b>'+escapeHTML(a.title)+'</b><span>'+escapeHTML(a.category+' · '+a.description)+(a.deadline?' · limite '+adminFormatDate(a.deadline):'')+'</span></div><div class="admin-action-meta">'+(a.amount!==null?'<strong>'+fmt(a.amount)+' €</strong>':'')+'<button data-admin-action="'+a.tab+'" data-admin-object="'+a.objectId+'">Traiter</button></div></article>';
 }).join('')+'</div>';
}
function adminVueOverview(){
 const maintenant=new Date(),r=adminResume(maintenant),alertes=adminAlertes(maintenant),phrases=adminAssistant(maintenant);
 const journal=adminDansEtablissement(adminData().auditLog).slice(0,5);
 return '<section class="admin-summary" aria-label="Résumé administratif">'
  +'<article class="admin-kpi '+(r.invoicesToPay?'warn':'')+'"><small>FACTURES À PAYER</small><b>'+r.invoicesToPay+'</b><span>'+fmt(r.totalToPay)+' € au total</span></article>'
  +'<article class="admin-kpi '+(r.overdueCount?'critical':'')+'"><small>EN RETARD</small><b>'+r.overdueCount+'</b><span>'+fmt(r.overdueAmount)+' € concernés</span></article>'
  +'<article class="admin-kpi"><small>ÉCHÉANCES · 30 JOURS</small><b>'+r.deadlines30+'</b><span>'+r.contractsExpiring+' contrat'+(r.contractsExpiring>1?'s':'')+' proche'+(r.contractsExpiring>1?'s':'')+'</span></article>'
  +'<article class="admin-kpi '+(r.documentsAction?'warn':'')+'"><small>DOCUMENTS À TRAITER</small><b>'+r.documentsAction+'</b><span>TVA déductible saisie · '+fmt(r.deductibleTax)+' €</span></article></section>'
  +'<section class="admin-subgrid"><article class="admin-data-card"><small>COÛT ANNUEL DES CONTRATS</small><b>'+fmt(r.contractAnnualCost)+' €</b><span>Contrats actifs enregistrés</span></article><article class="admin-data-card"><small>CONFORMITÉ</small><b>'+r.obligationsAction+'</b><span>Obligation'+(r.obligationsAction>1?'s':'')+' nécessitant une action</span></article><article class="admin-data-card"><small>TRÉSORERIE PRÉVISIONNELLE</small><b>'+(r.forecastCash===null?'Non configurée':fmt(r.forecastCash)+' €')+'</b><span>'+(r.currentCash===null?'Renseignez un solde pour activer la projection':'Solde après mouvements enregistrés')+'</span></article></section>'
  +'<section class="admin-grid"><section class="admin-panel"><header class="admin-section-head"><div><small>PRIORITÉ</small><b>Actions requises</b></div><button class="admin-link-btn" data-admin-tab="deadlines">Voir l’échéancier</button></header>'+adminActionsHTML(alertes)+'</section>'
  +'<aside class="admin-panel"><header class="admin-section-head"><div><small>ASSISTANT</small><b>Ce qu’il faut savoir</b></div></header><div class="admin-assistant">'+phrases.map(function(p){return '<p class="admin-insight">'+escapeHTML(p)+'</p>'}).join('')+'</div><p class="admin-source-note">Analyse déterministe des données enregistrées. Les sources non connectées sont signalées et ne sont jamais remplacées par des valeurs fictives.</p></aside></section>'
  +'<section class="admin-panel"><header class="admin-section-head"><div><small>TRAÇABILITÉ LOCALE</small><b>Dernières actions</b></div></header>'+(journal.length?'<div class="admin-actions">'+journal.map(function(l){return '<div class="admin-action"><i class="admin-priority info"></i><div class="admin-action-copy"><b>'+escapeHTML(l.action)+'</b><span>'+escapeHTML((l.details||l.entityType)+' · '+l.createdBy)+' · '+new Date(l.createdAt).toLocaleString('fr-FR')+'</span></div></div>'}).join('')+'</div>':adminVide('⌁','Aucune action journalisée','Les créations, modifications et paiements apparaîtront ici.',''))+'</section>';
}
function adminFournisseurs(){
 const noms=[];
 (st.fournisseurs||[]).forEach(function(f){const n=typeof f==='string'?f:f.nom||f.name;if(n)noms.push(n)});
 adminData().invoices.forEach(function(f){if(f.supplier)noms.push(f.supplier)});
 adminData().documents.forEach(function(d){if(d.supplier)noms.push(d.supplier)});
 return[...new Set(noms)].sort(function(a,b){return a.localeCompare(b,'fr')});
}
function adminVueInbox(){
 const cfg=adminMailConfig(),provider=ADMIN_EMAIL_PROVIDERS.find(function(x){return x.id===cfg.provider}),docs=adminDansEtablissement(adminData().documents).slice().sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt))});
 const p=adminPaginer(docs,'inbox'),lignes=p.items.map(function(d){
  const ps=ADMIN_PROCESSING_STATUSES.find(function(s){return s.id===d.processingStatus});
  return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(d.title||d.fileName||'Document')+'</b><small>'+escapeHTML(d.fileName||'Sans fichier')+'</small></div><span>'+escapeHTML((ADMIN_DOCUMENT_TYPES.find(function(x){return x.id===d.type})||{}).label||d.type)+'</span><span>'+adminFormatDate(d.documentDate||d.createdAt)+'</span><span><i class="admin-badge '+(d.processingStatus==='error'?'critical':d.processingStatus==='completed'?'ok':'warn')+'">'+escapeHTML(ps?ps.label:d.processingStatus)+'</i></span><div class="admin-row-actions">'+(d.fileKey?'<button data-admin-view-doc="'+d.id+'">Voir</button>':'')+'<button class="primary" data-admin-edit-doc="'+d.id+'">Modifier</button></div></div>';
 }).join('');
 const detail=cfg.address?(escapeHTML(cfg.address)+' · '+escapeHTML(provider?provider.label:'Messagerie')+(cfg.lastSync?' · dernière relève '+adminFormatDate(cfg.lastSync):'')+(cfg.lastError?' · '+escapeHTML(cfg.lastError):'')):'Aucune adresse de facturation configurée.';
 return '<section class="admin-email-card"><div class="admin-email-icon" aria-hidden="true">✉</div><div class="admin-email-copy"><b>Réception automatique des factures · '+escapeHTML(adminMailStatusLabel(cfg.status))+'</b><span>'+detail+'</span></div><div class="admin-email-actions"><button class="btn btn-2 btn-sm" data-admin-email-settings>Configurer</button>'+(cfg.address?'<button class="btn btn-sm" data-admin-email-sync>'+(cfg.status==='connected'?'Relever maintenant':'Finaliser la connexion')+'</button>':'')+'</div></section>'
  +'<section class="admin-upload"><div><b>Centralisez un document entrant</b><span>PDF ou image, 15 Mo maximum. Les fichiers restent dans le stockage local du navigateur actuel.</span></div><button class="btn btn-sm" data-admin-new-doc>Importer un document</button></section>'
  +'<section class="admin-list-panel"><div class="admin-list-head"><span>Document</span><span>Type</span><span>Date</span><span>Traitement</span><span>Actions</span></div>'+(lignes||adminVide('⇧','Inbox vide','Importez votre première facture ou pièce administrative pour commencer le suivi.','<button class="btn btn-sm" data-admin-new-doc>Importer</button>'))+adminPagerHTML(p,'inbox')+'</section>';
}
function adminVueFactures(){
 const fs=adminFilters,fo=adminFournisseurs();
 const factures=adminDansEtablissement(adminData().invoices).filter(function(f){
  const q=(fs.search||'').toLowerCase(),texte=(f.supplier+' '+(f.invoiceNumber||'')+' '+(f.notes||'')).toLowerCase();
 const statut=adminStatutFacture(f,new Date());
  return(!q||texte.indexOf(q)>=0)&&(!fs.supplier||f.supplier===fs.supplier)&&(!fs.status||statut===fs.status);
 }).sort(function(a,b){return String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999'))});
 const p=adminPaginer(factures,'invoices'),lignes=p.items.map(function(f){
  const statut=adminStatutFacture(f,new Date());
  return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(f.supplier||'Fournisseur à renseigner')+'</b><small>N° '+escapeHTML(f.invoiceNumber||'à vérifier')+(f.approvalStatus==='pending'?' · validation requise':'')+'</small></div><span>HT '+fmt(num(f.amountHT))+' €<br>TVA '+fmt(num(f.taxAmount))+' €</span><span class="admin-amount">'+fmt(num(f.amountTTC))+' €</span><span><i class="admin-badge '+adminClasseStatut(statut)+'">'+adminLibelleStatut(statut)+'</i><br>'+adminFormatDate(f.dueDate)+'</span><div class="admin-row-actions">'+(f.documentId?'<button data-admin-invoice-doc="'+f.documentId+'">Pièce</button>':'')+(f.approvalStatus==='pending'?'<button data-admin-approval="'+f.id+'" data-status="approved">Valider</button><button data-admin-approval="'+f.id+'" data-status="rejected">Rejeter</button>':'')+(adminFactureOuverte(f)&&f.approvalStatus!=='rejected'?'<button data-admin-paid="'+f.id+'">Payée</button>':'')+'<button class="primary" data-admin-edit-invoice="'+f.id+'">Modifier</button></div></div>';
 }).join('');
 return '<section class="admin-toolbar"><div class="admin-filters"><div class="admin-filter"><label>Rechercher</label><input id="adminInvoiceSearch" value="'+escapeHTML(fs.search)+'" placeholder="Fournisseur, numéro…"></div><div class="admin-filter"><label>Fournisseur</label><select id="adminInvoiceSupplier"><option value="">Tous</option>'+fo.map(function(n){return '<option '+(fs.supplier===n?'selected':'')+'>'+escapeHTML(n)+'</option>'}).join('')+'</select></div><div class="admin-filter"><label>Statut</label><select id="adminInvoiceStatus"><option value="">Tous</option>'+ADMIN_INVOICE_STATUSES.concat([{id:'en_retard',label:'En retard'}]).map(function(s){return '<option value="'+s.id+'" '+(fs.status===s.id?'selected':'')+'>'+s.label+'</option>'}).join('')+'</select></div></div><button class="btn btn-sm" data-admin-new-invoice>Nouvelle facture</button></section>'
  +'<section class="admin-list-panel"><div class="admin-list-head"><span>Fournisseur</span><span>Montants</span><span>TTC</span><span>Échéance</span><span>Actions</span></div>'+(lignes||adminVide('□','Aucune facture','Créez une facture ou importez un PDF dans l’Inbox.','<button class="btn btn-sm" data-admin-new-invoice>Créer une facture</button>'))+adminPagerHTML(p,'invoices')+'</section>';
}
function adminVueEcheances(){
 const factures=adminDansEtablissement(adminData().invoices).filter(adminFactureOuverte);
 const groupes=[
  {id:'late',label:'En retard',test:function(j){return j!==null&&j<0}},
  {id:'today',label:'Aujourd’hui',test:function(j){return j===0}},
  {id:'week',label:'Cette semaine',test:function(j){return j!==null&&j>0&&j<=7}},
  {id:'month',label:'Ce mois',test:function(j){return j!==null&&j>7&&j<=30}}
 ];
 return '<section class="admin-deadlines">'+groupes.map(function(g){
  const xs=factures.filter(function(f){return g.test(adminDiffJours(f.dueDate,new Date()))}).sort(function(a,b){return String(a.dueDate).localeCompare(String(b.dueDate))});
  return '<article class="admin-deadline"><h3>'+g.label+' <span>'+xs.length+'</span></h3>'+(xs.length?xs.map(function(f){return '<button class="admin-deadline-line admin-link-btn" data-admin-edit-invoice="'+f.id+'"><b>'+escapeHTML(f.supplier||'Fournisseur')+'</b><strong>'+fmt(num(f.amountTTC))+' €</strong><small>Échéance '+adminFormatDate(f.dueDate)+' · '+escapeHTML(st.etabNom||'Établissement courant')+'</small></button>'}).join(''):'<div class="admin-empty" style="padding:20px 6px"><span>Aucune facture dans cette période.</span></div>')+'</article>';
 }).join('')+'</section>';
}
function adminVueDocuments(){
 const fs=adminFilters,q=(fs.search||'').toLowerCase();
 const docs=adminDansEtablissement(adminData().documents).filter(function(d){const txt=((d.title||'')+' '+(d.supplier||'')+' '+(d.notes||'')).toLowerCase();return(!q||txt.indexOf(q)>=0)&&(!fs.type||d.type===fs.type)}).sort(function(a,b){return String(a.expiryDate||'9999').localeCompare(String(b.expiryDate||'9999'))});
 const p=adminPaginer(docs,'documents'),lignes=p.items.map(function(d){const j=adminDiffJours(d.expiryDate,new Date()),expire=j!==null&&j<0,proche=j!==null&&j>=0&&j<=30;return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(d.title||d.fileName||'Document')+'</b><small>'+escapeHTML(d.supplier||'Sans organisme')+'</small></div><span>'+escapeHTML((ADMIN_DOCUMENT_TYPES.find(function(x){return x.id===d.type})||{}).label||d.type)+'</span><span>'+adminFormatDate(d.documentDate)+'</span><span>'+(d.expiryDate?'<i class="admin-badge '+(expire?'critical':proche?'warn':'ok')+'">'+(expire?'Expiré':proche?'Expire bientôt':adminFormatDate(d.expiryDate))+'</i>':'—')+'</span><div class="admin-row-actions">'+(d.fileKey?'<button data-admin-view-doc="'+d.id+'">Voir</button>':'')+'<button class="primary" data-admin-edit-doc="'+d.id+'">Modifier</button></div></div>'}).join('');
 return '<section class="admin-toolbar"><div class="admin-filters"><div class="admin-filter"><label>Rechercher</label><input id="adminDocumentSearch" value="'+escapeHTML(fs.search)+'" placeholder="Titre, fournisseur…"></div><div class="admin-filter"><label>Catégorie</label><select id="adminDocumentType"><option value="">Toutes</option>'+ADMIN_DOCUMENT_TYPES.map(function(x){return '<option value="'+x.id+'" '+(fs.type===x.id?'selected':'')+'>'+x.label+'</option>'}).join('')+'</select></div></div><button class="btn btn-sm" data-admin-new-doc>Ajouter un document</button></section>'
  +'<section class="admin-list-panel"><div class="admin-list-head"><span>Document</span><span>Catégorie</span><span>Date</span><span>Expiration</span><span>Actions</span></div>'+(lignes||adminVide('◇','Aucun document','Ajoutez une pièce pour constituer le coffre-fort administratif.','<button class="btn btn-sm" data-admin-new-doc>Ajouter</button>'))+adminPagerHTML(p,'documents')+'</section>';
}
function adminVueTresorerie(){
 const cash=adminPrevisionTresorerie(new Date()),manuels=adminDansEtablissement(adminData().cashFlowForecasts);
 const timeline=cash.events.map(function(e){return '<div class="admin-timeline-row"><time>'+adminFormatDate(e.date)+'</time><i class="'+(e.amount<0?'out':'in')+'"></i><div><b>'+escapeHTML(e.title)+'</b><small>'+(e.source==='invoice'?'Facture fournisseur':'Prévision saisie manuellement')+(e.balance!==null?' · solde '+fmt(e.balance)+' €':'')+'</small></div><strong class="'+(e.amount<0?'out':'in')+'">'+(e.amount>0?'+':'')+fmt(e.amount)+' €</strong></div>'}).join('');
 return '<section class="admin-disclaimer">Projection indicative fondée sur le solde et les mouvements enregistrés. Aucune donnée bancaire n’est connectée automatiquement.</section>'
  +'<section class="admin-subgrid"><article class="admin-data-card"><small>SOLDE ACTUEL</small><b>'+(cash.currentBalance===null?'À renseigner':fmt(cash.currentBalance)+' €')+'</b><span>'+(adminData().settings.cashBalanceUpdatedAt?'Mis à jour le '+adminFormatDate(adminData().settings.cashBalanceUpdatedAt):'Source bancaire non connectée')+'</span></article><article class="admin-data-card"><small>SOLDE PRÉVISIONNEL</small><b>'+(cash.forecastBalance===null?'Indisponible':fmt(cash.forecastBalance)+' €')+'</b><span>'+cash.events.length+' mouvement'+(cash.events.length>1?'s':'')+' futur'+(cash.events.length>1?'s':'')+'</span></article><article class="admin-data-card"><small>POINT BAS</small><b>'+(cash.lowPoint===null?'Indisponible':fmt(cash.lowPoint)+' €')+'</b><span>'+(cash.lowPointDate?'Prévu le '+adminFormatDate(cash.lowPointDate):'Aucune projection datée')+'</span></article></section>'
  +'<section class="admin-toolbar"><div><b>Projection de trésorerie</b><small style="display:block;color:#788395">Factures ouvertes + mouvements prévisionnels saisis.</small></div><div class="admin-inline-actions"><button class="btn btn-2 btn-sm" data-admin-cash-settings>Configurer le solde</button><button class="btn btn-sm" data-admin-new-cash>Ajouter un mouvement</button></div></section>'
  +'<section class="admin-panel">'+(timeline?'<div class="admin-timeline">'+timeline+'</div>':adminVide('↝','Aucun mouvement prévisionnel','Ajoutez une charge, un encaissement ou une facture avec échéance.','<button class="btn btn-sm" data-admin-new-cash>Ajouter un mouvement</button>'))+(manuels.length?'<p class="admin-source-note">'+manuels.length+' mouvement'+(manuels.length>1?'s':'')+' saisi'+(manuels.length>1?'s':'')+' manuellement.</p>':'')+'</section>';
}
function adminVueTVA(){
 const v=adminTVA(new Date()),ventilation=Object.entries(v.byRate).map(function(x){const total=v.deductible||1,pct=Math.min(100,num(x[1])/total*100);return '<article class="admin-data-card"><small>TAUX '+escapeHTML(x[0])+' %</small><b>'+fmt(num(x[1]))+' €</b><span>TVA déductible associée</span><div class="admin-progress"><i style="width:'+pct+'%"></i></div></article>'}).join('');
 const maxMois=Math.max.apply(null,v.byMonth.map(function(x){return num(x[1])}).concat([1])),evolution=v.byMonth.map(function(x){const d=adminDate(x[0]+'-01'),label=d?d.toLocaleDateString('fr-FR',{month:'short',year:'numeric'}):x[0],pct=Math.max(3,num(x[1])/maxMois*100);return '<div class="admin-timeline-row"><time>'+escapeHTML(label)+'</time><i class="in"></i><div><b>TVA déductible</b><div class="admin-progress"><i style="width:'+pct+'%"></i></div></div><strong>'+fmt(num(x[1]))+' €</strong></div>'}).join('');
 return '<section class="admin-disclaimer">Estimation indicative basée sur les données présentes dans le logiciel. Elle ne constitue pas une déclaration fiscale officielle.</section>'
  +'<section class="admin-subgrid"><article class="admin-data-card"><small>TVA COLLECTÉE</small><b>'+(v.collected===null?'Non disponible':fmt(v.collected)+' €')+'</b><span>Source caisse ou saisie manuelle</span></article><article class="admin-data-card"><small>TVA DÉDUCTIBLE</small><b>'+fmt(v.deductible)+' €</b><span>Issue des factures fournisseurs</span></article><article class="admin-data-card"><small>TVA ESTIMÉE</small><b>'+(v.estimated===null?'Non calculable':fmt(v.estimated)+' €')+'</b><span>Collectée moins déductible</span></article></section>'
  +'<section class="admin-toolbar"><div><b>Ventilation par taux</b><small style="display:block;color:#788395">Taux configurables, appliqués aux factures renseignées.</small></div><button class="btn btn-sm" data-admin-vat-settings>Configurer la TVA</button></section>'
  +(ventilation?'<section class="admin-subgrid">'+ventilation+'</section>':adminVide('%','Aucun taux configuré','Ajoutez au moins un taux de TVA dans les paramètres.',''))
  +'<section class="admin-panel"><header class="admin-section-head"><div><small>12 DERNIERS MOIS</small><b>Évolution de la TVA déductible</b></div></header>'+(evolution?'<div class="admin-timeline">'+evolution+'</div>':adminVide('↗','Historique indisponible','Renseignez la date et la TVA des factures pour obtenir cette évolution.',''))+'</section>';
}
function adminVuePreCompta(){
 const factures=adminDansEtablissement(adminData().invoices),cat=adminData().expenseCategories||[],comptes=adminData().accountingCategories||[];
 const categorisees=factures.filter(function(f){return f.expenseCategoryId||f.accountingCategoryId}).length;
 const lignes=factures.slice(0,50).map(function(f){const c=cat.find(function(x){return x.id===f.expenseCategoryId}),a=comptes.find(function(x){return x.id===f.accountingCategoryId});return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(f.supplier||'Fournisseur')+'</b><small>'+escapeHTML(f.invoiceNumber||'Sans numéro')+'</small></div><span>'+escapeHTML(c?c.name:'Non catégorisée')+'</span><span>'+escapeHTML(a?(a.code? a.code+' · ':'')+a.name:'Compte non affecté')+'</span><span class="admin-amount">'+fmt(num(f.amountTTC))+' €</span><div class="admin-row-actions"><button class="primary" data-admin-edit-invoice="'+f.id+'">Affecter</button></div></div>'}).join('');
 return '<section class="admin-disclaimer">La pré-comptabilité prépare les pièces et affectations. Elle ne remplace pas un logiciel de comptabilité générale.</section>'
  +'<section class="admin-subgrid"><article class="admin-data-card"><small>PIÈCES</small><b>'+factures.length+'</b><span>Factures disponibles</span></article><article class="admin-data-card"><small>CATÉGORISÉES</small><b>'+categorisees+'</b><span>'+Math.max(0,factures.length-categorisees)+' restent à affecter</span></article><article class="admin-data-card"><small>EXPORT</small><b>CSV</b><span>Format générique, aucune intégration simulée</span></article></section>'
  +'<section class="admin-toolbar"><div><b>Affectations comptables</b><small style="display:block;color:#788395">Catégories de dépenses, comptes et TVA.</small></div><div class="admin-inline-actions"><button class="btn btn-2 btn-sm" data-admin-category-settings>Configurer</button><button class="btn btn-sm" data-admin-export-accounting>Exporter</button></div></section>'
  +'<section class="admin-list-panel"><div class="admin-list-head"><span>Facture</span><span>Dépense</span><span>Compte</span><span>TTC</span><span>Action</span></div>'+(lignes||adminVide('≡','Aucune pièce','Les factures enregistrées apparaîtront ici.',''))+'</section>';
}
function adminVueContrats(){
 const contrats=adminDansEtablissement(adminData().contracts).sort(function(a,b){return String(a.endDate||'9999').localeCompare(String(b.endDate||'9999'))}),p=adminPaginer(contrats,'contracts');
 const lignes=p.items.map(function(c){const cout=adminCoutsContrat(c),statut=adminStatutContrat(c,new Date()),jours=adminDiffJours(c.endDate,new Date());return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(c.name||'Contrat')+'</b><small>'+escapeHTML(c.supplier||'Sans fournisseur')+' · '+escapeHTML(c.category||'Autre')+'</small></div><span>'+fmt(cout.monthly)+' €/mois<br>'+fmt(cout.annual)+' €/an</span><span>'+adminFormatDate(c.endDate)+'</span><span><i class="admin-badge '+(statut==='expire'?'critical':statut==='a_renouveler'?'warn':'ok')+'">'+escapeHTML((ADMIN_CONTRACT_STATUSES.find(function(x){return x.id===statut})||{}).label||statut)+'</i>'+(jours!==null&&jours>=0?'<br>'+jours+' jours':'')+'</span><div class="admin-row-actions"><button class="primary" data-admin-edit-contract="'+c.id+'">Modifier</button></div></div>'}).join('');
 return '<section class="admin-toolbar"><div><b>Contrats et abonnements</b><small style="display:block;color:#788395">Coûts, renouvellements et préavis.</small></div><button class="btn btn-sm" data-admin-new-contract>Nouveau contrat</button></section><section class="admin-list-panel"><div class="admin-list-head"><span>Contrat</span><span>Coût</span><span>Fin</span><span>Statut</span><span>Action</span></div>'+(lignes||adminVide('⌘','Aucun contrat','Enregistrez un contrat pour suivre ses coûts et renouvellements.','<button class="btn btn-sm" data-admin-new-contract>Créer</button>'))+adminPagerHTML(p,'contracts')+'</section>';
}
function adminVueCalendrier(){
 const events=adminCalendrier(new Date()),prochains=events.filter(function(e){const j=adminDiffJours(e.date,new Date());return j!==null&&j>=0}).slice(0,80);
 const lignes=prochains.map(function(e){const d=adminDate(e.date),mois=d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','');return '<article class="admin-calendar-item"><div class="admin-calendar-date"><b>'+d.getDate()+'</b><span>'+escapeHTML(mois)+'</span></div><div><h3>'+escapeHTML(e.title)+'</h3><p>'+escapeHTML(e.detail||'Échéance administrative')+' · '+adminFormatDate(e.date)+'</p></div>'+(e.id.indexOf('deadline_')===0?'<button class="admin-link-btn" data-admin-complete-deadline="'+e.objectId+'">Marquer faite</button>':'<button class="admin-link-btn" data-admin-action="'+e.tab+'">Voir</button>')+'</article>'}).join('');
 return '<section class="admin-toolbar"><div><b>Prochaines échéances</b><small style="display:block;color:#788395">Factures, contrats, documents, conformité et événements manuels.</small></div><button class="btn btn-sm" data-admin-new-deadline>Ajouter une échéance</button></section><section class="admin-panel">'+(lignes?'<div class="admin-calendar-list">'+lignes+'</div>':adminVide('◫','Calendrier vide','Ajoutez une échéance ou renseignez les dates de vos documents.','<button class="btn btn-sm" data-admin-new-deadline>Ajouter</button>'))+'</section>';
}
function adminVueConformite(){
 const obligations=adminDansEtablissement(adminData().obligations).sort(function(a,b){return String(a.nextDue||'9999').localeCompare(String(b.nextDue||'9999'))}),p=adminPaginer(obligations,'compliance');
 const lignes=p.items.map(function(o){const statut=adminStatutObligation(o,new Date()),lab=(ADMIN_OBLIGATION_STATUSES.find(function(x){return x.id===statut})||{}).label||statut;return '<div class="admin-row"><div class="admin-cell-main"><b>'+escapeHTML(o.name||'Obligation')+'</b><small>'+escapeHTML(o.category||'Autre')+'</small></div><span>'+escapeHTML(o.responsible||'Non attribué')+'</span><span>'+adminFormatDate(o.lastValidation)+'</span><span><i class="admin-badge '+(statut==='expire'||statut==='manquant'?'critical':statut==='conforme'?'ok':'warn')+'">'+escapeHTML(lab)+'</i><br>'+adminFormatDate(o.nextDue)+'</span><div class="admin-row-actions"><button class="primary" data-admin-edit-obligation="'+o.id+'">Modifier</button></div></div>'}).join('');
 return '<section class="admin-disclaimer">La liste des obligations est configurable par l’établissement. Aucune liste réglementaire exhaustive n’est codée en dur.</section><section class="admin-toolbar"><div><b>Obligations et conformité</b><small style="display:block;color:#788395">Permis, licences, assurances et contrôles périodiques.</small></div><button class="btn btn-sm" data-admin-new-obligation>Nouvelle obligation</button></section><section class="admin-list-panel"><div class="admin-list-head"><span>Obligation</span><span>Responsable</span><span>Dernière validation</span><span>Prochaine échéance</span><span>Action</span></div>'+(lignes||adminVide('✓','Aucune obligation','Créez les obligations adaptées à votre établissement.','<button class="btn btn-sm" data-admin-new-obligation>Créer</button>'))+adminPagerHTML(p,'compliance')+'</section>';
}
function adminVueAnomalies(){
 const anomalies=adminAnomaliesDetectees(new Date());
 const lignes=anomalies.map(function(a){const statut=a.status||'detectee';return '<article class="admin-action"><i class="admin-priority '+a.severity+'"></i><div class="admin-action-copy"><b>'+escapeHTML(a.type.replaceAll('_',' '))+'</b><span>'+escapeHTML(a.description)+' · '+escapeHTML(statut.replaceAll('_',' '))+'</span></div><div class="admin-action-meta"><button data-admin-anomaly="'+escapeHTML(a.key)+'" data-status="ignoree">Ignorer</button><button data-admin-anomaly="'+escapeHTML(a.key)+'" data-status="resolue">Résoudre</button></div></article>'}).join('');
 return '<section class="admin-disclaimer">Détection déterministe : doublons, montants inhabituels, informations manquantes et écarts avec commandes ou livraisons lorsqu’une référence existe.</section><section class="admin-panel"><header class="admin-section-head"><div><small>CONTRÔLES</small><b>Anomalies détectées</b></div></header>'+(lignes?'<div class="admin-actions">'+lignes+'</div>':adminVide('✓','Aucune anomalie','Aucun contrôle automatique ne nécessite votre attention.',''))+'</section>';
}
function adminVueParametres(){
 const s=adminData().settings,rates=(s.taxRates||[]).join(' · '),delais=(s.contractAlertDays||[]).join(' · '),rules=(adminData().approvalWorkflows||[]).length?adminData().approvalWorkflows:(s.approvalRules||[]);
 const integrations=Object.entries(s.integrations||{}).map(function(x){const labels={ocr:'OCR / IA',emailInbox:'Réception par email',accounting:'Comptabilité',banking:'Banque',electronicInvoicing:'Facturation électronique',supplierImport:'Fournisseurs / EDI'};return '<div class="admin-config-row"><div><b>'+escapeHTML(labels[x[0]]||x[0])+'</b><small>Aucun connecteur fictif : adaptateur prêt à être remplacé par une API.</small></div><i class="admin-badge info">'+escapeHTML(x[1]==='not_configured'?'Non configuré':x[1])+'</i></div>'}).join('');
 const ruleRows=rules.map(function(r){return '<div class="admin-config-row"><div><b>'+fmt(num(r.minAmount))+' € à '+(r.maxAmount===null||r.maxAmount===''?'∞':fmt(num(r.maxAmount))+' €')+'</b><small>'+escapeHTML(r.role||'Rôle à définir')+' · '+escapeHTML(r.documentType||'facture')+'</small></div><div class="admin-row-actions"><button data-admin-edit-rule="'+r.id+'">Modifier</button></div></div>'}).join('');
 return '<section class="admin-grid"><section class="admin-panel"><header class="admin-section-head"><div><small>RÈGLES MÉTIER</small><b>Configuration</b></div></header><div class="admin-config-list"><div class="admin-config-row"><div><b>Taux de TVA</b><small>'+escapeHTML(rates||'Aucun')+' %</small></div><button class="admin-link-btn" data-admin-vat-settings>Modifier</button></div><div class="admin-config-row"><div><b>Alertes contrats</b><small>'+escapeHTML(delais||'Aucun')+' jours avant échéance</small></div><button class="admin-link-btn" data-admin-contract-settings>Modifier</button></div><div class="admin-config-row"><div><b>Hausse tarifaire</b><small>Alerte à partir de '+fmt(num(s.priceIncreaseAlertPercent||10))+' %</small></div><button class="admin-link-btn" data-admin-anomaly-settings>Modifier</button></div><div class="admin-config-row"><div><b>Seuil de trésorerie</b><small>'+fmt(num(s.cashWarningThreshold))+' €</small></div><button class="admin-link-btn" data-admin-cash-settings>Modifier</button></div><div class="admin-config-row"><div><b>Catégories comptables</b><small>'+(adminData().expenseCategories.length+adminData().accountingCategories.length)+' configuration'+((adminData().expenseCategories.length+adminData().accountingCategories.length)>1?'s':'')+'</small></div><button class="admin-link-btn" data-admin-category-settings>Modifier</button></div></div></section><section class="admin-panel"><header class="admin-section-head"><div><small>INTÉGRATIONS</small><b>Connecteurs futurs</b></div></header><div class="admin-config-list">'+integrations+'</div></section></section><section class="admin-panel"><header class="admin-section-head"><div><small>VALIDATION</small><b>Workflows d’approbation</b></div><button class="admin-link-btn" data-admin-new-rule>Ajouter une règle</button></header><div class="admin-config-list">'+(ruleRows||adminVide('↳','Aucune règle','Sans règle, les factures ne nécessitent pas d’approbation supplémentaire.',''))+'</div></section>';
}
function renderAdministration(){
 const racine=document.getElementById('s-admin'),version=++adminRenderVersion;
 racine.innerHTML='<div class="dashboard-state" role="status"><div class="dashboard-state-card"><div class="dashboard-loader"></div><b>Chargement de l’administration</b><span>Analyse des échéances et actions requises…</span></div></div>';
 Promise.resolve().then(function(){
  if(version!==adminRenderVersion||screen!=='admin')return;
  try{
   const vues={overview:adminVueOverview,inbox:adminVueInbox,invoices:adminVueFactures,deadlines:adminVueEcheances,
    cashflow:adminVueTresorerie,vat:adminVueTVA,accounting:adminVuePreCompta,contracts:adminVueContrats,
    documents:adminVueDocuments,calendar:adminVueCalendrier,compliance:adminVueConformite,
    anomalies:adminVueAnomalies,settings:adminVueParametres};
   const contenu=(vues[adminTab]||adminVueOverview)();
   racine.innerHTML='<div class="admin-shell"><header class="admin-head"><div><small>CENTRE DE CONTRÔLE</small><h1>Administration</h1><p>Les actions et anomalies sont présentées avant les documents bruts. Toutes les données affichées proviennent de vos saisies.</p></div>'+(adminTab==='overview'?'<button class="btn btn-sm" data-admin-new-doc>Importer un document</button>':'')+'</header>'+adminTabs()+contenu+'</div>';
   lierAdministration(racine);
  }catch(e){
   console.error('Administration indisponible',e);
   racine.innerHTML='<div class="dashboard-state" role="alert"><div class="dashboard-state-card"><b>Administration indisponible</b><span>Les données n’ont pas pu être chargées. Aucune modification n’a été effectuée.</span><button id="adminRetry">Réessayer</button></div></div>';
   document.getElementById('adminRetry').onclick=renderAdministration;
  }
 });
}
function lierAdministration(racine){
 racine.querySelectorAll('[data-admin-tab]').forEach(function(b){b.onclick=function(){adminTab=b.dataset.adminTab;adminFilters={search:'',supplier:'',status:'',type:''};renderAdministration()}});
 racine.querySelectorAll('[data-admin-new-doc]').forEach(function(b){b.onclick=function(){openAdminDocument()}});
 racine.querySelectorAll('[data-admin-email-settings]').forEach(function(b){b.onclick=openAdminEmailSettings});
 racine.querySelectorAll('[data-admin-email-sync]').forEach(function(b){b.onclick=function(){adminSynchroniserMessagerie()}});
 racine.querySelectorAll('[data-admin-edit-doc]').forEach(function(b){b.onclick=function(){openAdminDocument(b.dataset.adminEditDoc)}});
 racine.querySelectorAll('[data-admin-view-doc]').forEach(function(b){b.onclick=function(){adminVoirDocument(b.dataset.adminViewDoc)}});
 racine.querySelectorAll('[data-admin-new-invoice]').forEach(function(b){b.onclick=function(){openAdminInvoice()}});
 racine.querySelectorAll('[data-admin-edit-invoice]').forEach(function(b){b.onclick=function(){openAdminInvoice(b.dataset.adminEditInvoice)}});
 racine.querySelectorAll('[data-admin-paid]').forEach(function(b){b.onclick=function(){adminMarquerPayee(b.dataset.adminPaid)}});
 racine.querySelectorAll('[data-admin-approval]').forEach(function(b){b.onclick=function(){adminSetApproval(b.dataset.adminApproval,b.dataset.status)}});
 racine.querySelectorAll('[data-admin-invoice-doc]').forEach(function(b){b.onclick=function(){adminVoirDocument(b.dataset.adminInvoiceDoc)}});
 racine.querySelectorAll('[data-admin-action]').forEach(function(b){b.onclick=function(){adminTab=b.dataset.adminAction;renderAdministration()}});
 racine.querySelectorAll('[data-admin-page]').forEach(function(b){b.onclick=function(){adminPages[b.dataset.adminPage]=num(b.dataset.page);renderAdministration()}});
 racine.querySelectorAll('[data-admin-new-contract]').forEach(function(b){b.onclick=function(){openAdminContract()}});
 racine.querySelectorAll('[data-admin-edit-contract]').forEach(function(b){b.onclick=function(){openAdminContract(b.dataset.adminEditContract)}});
 racine.querySelectorAll('[data-admin-new-obligation]').forEach(function(b){b.onclick=function(){openAdminObligation()}});
 racine.querySelectorAll('[data-admin-edit-obligation]').forEach(function(b){b.onclick=function(){openAdminObligation(b.dataset.adminEditObligation)}});
 racine.querySelectorAll('[data-admin-new-deadline]').forEach(function(b){b.onclick=function(){openAdminDeadline()}});
 racine.querySelectorAll('[data-admin-complete-deadline]').forEach(function(b){b.onclick=function(){adminCompleteDeadline(b.dataset.adminCompleteDeadline)}});
 racine.querySelectorAll('[data-admin-new-cash]').forEach(function(b){b.onclick=function(){openAdminCash()}});
 racine.querySelectorAll('[data-admin-cash-settings]').forEach(function(b){b.onclick=openAdminCashSettings});
 racine.querySelectorAll('[data-admin-vat-settings]').forEach(function(b){b.onclick=openAdminVatSettings});
 racine.querySelectorAll('[data-admin-category-settings]').forEach(function(b){b.onclick=openAdminCategorySettings});
 racine.querySelectorAll('[data-admin-contract-settings]').forEach(function(b){b.onclick=openAdminContractSettings});
 racine.querySelectorAll('[data-admin-anomaly-settings]').forEach(function(b){b.onclick=openAdminAnomalySettings});
 racine.querySelectorAll('[data-admin-new-rule]').forEach(function(b){b.onclick=function(){openAdminApprovalRule()}});
 racine.querySelectorAll('[data-admin-edit-rule]').forEach(function(b){b.onclick=function(){openAdminApprovalRule(b.dataset.adminEditRule)}});
 racine.querySelectorAll('[data-admin-anomaly]').forEach(function(b){b.onclick=function(){adminSetAnomalyStatus(b.dataset.adminAnomaly,b.dataset.status)}});
 const exp=racine.querySelector('[data-admin-export-accounting]');if(exp)exp.onclick=adminExportAccounting;
 const is=racine.querySelector('#adminInvoiceSearch'),ifo=racine.querySelector('#adminInvoiceSupplier'),ist=racine.querySelector('#adminInvoiceStatus');
 if(is)is.onchange=function(){adminFilters.search=is.value.trim();renderAdministration()};
 if(ifo)ifo.onchange=function(){adminFilters.supplier=ifo.value;renderAdministration()};
 if(ist)ist.onchange=function(){adminFilters.status=ist.value;renderAdministration()};
 const ds=racine.querySelector('#adminDocumentSearch'),dt=racine.querySelector('#adminDocumentType');
 if(ds)ds.onchange=function(){adminFilters.search=ds.value.trim();renderAdministration()};
 if(dt)dt.onchange=function(){adminFilters.type=dt.value;renderAdministration()};
}

function lireFichierAdmin(fichier){
 return new Promise(function(resolve,reject){const r=new FileReader();r.onload=function(){resolve(String(r.result||''))};r.onerror=function(){reject(r.error||new Error('lecture'))};r.readAsDataURL(fichier)});
}
function adminValeur(id){const e=document.getElementById(id);return e?e.value.trim():''}
function adminOptions(liste,valeur){return liste.map(function(x){return '<option value="'+x.id+'" '+(valeur===x.id?'selected':'')+'>'+x.label+'</option>'}).join('')}
function openAdminEmailSettings(){
 const cfg=adminMailConfig();
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminEmailBg"><div class="sheet"><h3>Messagerie de facturation</h3><p class="sh-sub">Préparez la relève des factures reçues par email. INVO ne demande et ne conserve jamais le mot de passe de la boîte.</p><div class="admin-modal-hint">La version GitHub Pages nécessite un service OAuth sécurisé côté serveur pour terminer la connexion Gmail ou Microsoft. Tant que ce service n’est pas branché, aucune relève n’est simulée.</div><div class="admin-modal-grid"><div class="fld"><label>Fournisseur *</label><select id="aemProvider"><option value="">Sélectionner</option>'+adminOptions(ADMIN_EMAIL_PROVIDERS,cfg.provider)+'</select></div><div class="fld"><label>Adresse recevant les factures *</label><input id="aemAddress" type="email" inputmode="email" value="'+escapeHTML(cfg.address||'')+'" placeholder="factures@restaurant.fr"></div><div class="fld wide"><label><input id="aemAuto" type="checkbox" '+(cfg.autoImport!==false?'checked':'')+'> Relever automatiquement à l’ouverture d’INVO</label></div><div class="fld wide"><label><input id="aemUnread" type="checkbox" '+(cfg.unreadOnly!==false?'checked':'')+'> Importer uniquement les nouveaux messages non traités</label></div></div><button class="btn" id="aemSave">Enregistrer la configuration</button><button class="btn btn-2" id="aemCancel">Annuler</button></div></div>';
 document.getElementById('aemCancel').onclick=closeModal;document.getElementById('adminEmailBg').onclick=function(e){if(e.target.id==='adminEmailBg')closeModal()};
 document.getElementById('aemSave').onclick=async function(){const provider=adminValeur('aemProvider'),address=adminValeur('aemAddress').toLowerCase();if(!provider||!/^\S+@\S+\.\S+$/.test(address)){toast('Sélectionnez un fournisseur et renseignez une adresse email valide.');return}const change=provider!==cfg.provider||address!==cfg.address;cfg.provider=provider;cfg.address=address;cfg.autoImport=document.getElementById('aemAuto').checked;cfg.unreadOnly=document.getElementById('aemUnread').checked;if(change){cfg.status='needs_configuration';cfg.lastSync=null;cfg.lastError='Un backend OAuth sécurisé doit être connecté à INVO avant la première relève.'}adminData().settings.integrations.emailInbox=cfg.status==='connected'?'connected':'needs_configuration';adminJournaliser('Messagerie de facturation configurée','AdministrativeEmailInbox','settings',address+' · '+provider);await save();closeModal();renderAdministration();toast('Configuration email enregistrée.');};
}
function openAdminDocument(id){
 const existant=id?adminData().documents.find(function(d){return d.id===id}):null,d=existant||{},fournisseurs=adminFournisseurs();
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminDocBg"><div class="sheet"><h3>'+(existant?'Modifier le document':'Importer un document')+'</h3><p class="sh-sub">Le fichier original et ses métadonnées alimentent les échéances et alertes.</p><div class="admin-modal-hint">PDF ou image uniquement · 15 Mo maximum. Une facture importée crée automatiquement une fiche « À vérifier ».</div><div class="admin-modal-grid">'
  +'<div class="fld wide"><label>Titre *</label><input id="adTitle" value="'+escapeHTML(d.title||'')+'" placeholder="Ex. Facture fournisseur août"></div>'
  +'<div class="fld"><label>Type *</label><select id="adType">'+adminOptions(ADMIN_DOCUMENT_TYPES,d.type||'facture')+'</select></div>'
  +'<div class="fld"><label>Fournisseur / organisme</label><input id="adSupplier" list="adminSupplierList" value="'+escapeHTML(d.supplier||'')+'" placeholder="Nom"><datalist id="adminSupplierList">'+fournisseurs.map(function(n){return '<option value="'+escapeHTML(n)+'">' }).join('')+'</datalist></div>'
  +'<div class="fld"><label>Date du document</label><input id="adDate" type="date" value="'+escapeHTML(d.documentDate||adminDateISO())+'"></div>'
  +'<div class="fld"><label>Échéance / expiration</label><input id="adExpiry" type="date" value="'+escapeHTML(d.expiryDate||'')+'"></div>'
  +'<div class="fld"><label>État de traitement</label><select id="adProcessing">'+adminOptions(ADMIN_PROCESSING_STATUSES,d.processingStatus||'needs_review')+'</select></div>'
  +'<div class="fld"><label>Statut du document</label><select id="adStatus"><option value="actif" '+(d.status!=='archive'?'selected':'')+'>Actif</option><option value="archive" '+(d.status==='archive'?'selected':'')+'>Archivé</option></select></div>'
  +'<div class="fld wide"><label>Notes</label><textarea id="adNotes" rows="3" placeholder="Informations utiles">'+escapeHTML(d.notes||'')+'</textarea></div>'
  +'<div class="fld wide"><label>Fichier '+(existant?'(laisser vide pour conserver)':'*')+'</label><input id="adFile" type="file" accept="application/pdf,image/*"></div></div>'
  +'<button class="btn" id="adSave">'+(existant?'Enregistrer les modifications':'Importer le document')+'</button><button class="btn btn-2" id="adCancel">Annuler</button></div></div>';
 document.getElementById('adCancel').onclick=closeModal;
 document.getElementById('adminDocBg').onclick=function(e){if(e.target.id==='adminDocBg')closeModal()};
 document.getElementById('adSave').onclick=async function(){
  const bouton=this,titre=adminValeur('adTitle'),type=adminValeur('adType'),fichier=document.getElementById('adFile').files[0];
  if(!titre){toast('Renseignez le titre du document.');return}
  if(!existant&&!fichier){toast('Sélectionnez un PDF ou une image.');return}
  if(fichier&&fichier.size>ADMIN_MAX_FILE){toast('Le fichier dépasse 15 Mo.');return}
  if(fichier&&fichier.type!=='application/pdf'&&!fichier.type.startsWith('image/')){toast('Format refusé : PDF ou image uniquement.');return}
  bouton.disabled=true;let fileKey=d.fileKey||null,ancienFileKey=d.fileKey||null;
  try{
   if(fichier)fileKey=await Docs.put(await lireFichierAdmin(fichier));
   const maintenant=new Date().toISOString(),record={
    id:d.id||uid('adoc'),title,type,supplier:adminValeur('adSupplier'),establishmentId:d.establishmentId||adminEtablissementId(),
    organizationId:d.organizationId===undefined?adminOrganisationId():d.organizationId,documentDate:adminValeur('adDate')||null,
    dueDate:adminValeur('adExpiry')||null,expiryDate:adminValeur('adExpiry')||null,status:adminValeur('adStatus')||'actif',
    notes:adminValeur('adNotes'),fileKey,fileName:fichier?fichier.name:(d.fileName||''),fileType:fichier?fichier.type:(d.fileType||''),
    fileSize:fichier?fichier.size:(d.fileSize||0),processingStatus:adminValeur('adProcessing')||'pending',
    createdAt:d.createdAt||maintenant,updatedAt:maintenant,createdBy:d.createdBy||adminAuteur()
   };
   if(existant)Object.assign(existant,record);else adminData().documents.unshift(record);
   if(!existant&&type==='facture'){
    const facture=adminConstruireFacture({documentId:record.id,invoiceNumber:'',supplier:record.supplier,
     establishmentId:record.establishmentId,organizationId:record.organizationId,documentDate:record.documentDate,dueDate:record.dueDate,
     amountHT:0,taxAmount:0,amountTTC:0,taxRate:'',status:'a_verifier',paymentDate:null,paymentMethod:'',orderReference:'',
     deliveryReference:'',expenseCategoryId:null,accountingCategoryId:null,notes:'Créée depuis l’Inbox · informations à vérifier'},null,new Date());
    adminData().invoices.unshift(facture);adminSynchroniserDemandeApprobation(facture,new Date());
   }
   adminJournaliser(existant?'Document modifié':'Document importé','AdministrativeDocument',record.id,record.title);
   await save();if(fichier&&ancienFileKey&&ancienFileKey!==fileKey)await Docs.del(ancienFileKey);
   closeModal();renderAdministration();toast(existant?'Document mis à jour.':'Document importé.');
  }catch(e){console.error(e);bouton.disabled=false;toast('Impossible d’enregistrer ce document.')}
 };
}
function openAdminInvoice(id){
 const existant=id?adminData().invoices.find(function(f){return f.id===id}):null,f=existant||{},data=adminData(),docs=adminDansEtablissement(data.documents).filter(function(d){return d.type==='facture'}),rates=data.settings.taxRates||[5.5,10,20],expenses=data.expenseCategories||[],accounts=data.accountingCategories||[],orders=st.commandes||[],deliveries=st.liv||[];
 const dans30=new Date();dans30.setDate(dans30.getDate()+30);
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminInvBg"><div class="sheet"><h3>'+(existant?'Modifier la facture':'Nouvelle facture')+'</h3><p class="sh-sub">Les montants et l’échéance alimentent automatiquement le résumé administratif.</p><div class="admin-modal-grid">'
  +'<div class="fld wide"><label>Pièce associée</label><select id="aiDocument"><option value="">Aucune pièce</option>'+docs.map(function(d){return '<option value="'+d.id+'" '+(f.documentId===d.id?'selected':'')+'>'+escapeHTML(d.title||d.fileName||'Document')+'</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>Fournisseur *</label><input id="aiSupplier" list="adminInvoiceSuppliers" value="'+escapeHTML(f.supplier||'')+'" placeholder="Nom du fournisseur"><datalist id="adminInvoiceSuppliers">'+adminFournisseurs().map(function(n){return '<option value="'+escapeHTML(n)+'">' }).join('')+'</datalist></div>'
  +'<div class="fld"><label>Numéro</label><input id="aiNumber" value="'+escapeHTML(f.invoiceNumber||'')+'" placeholder="N° de facture"></div>'
  +'<div class="fld"><label>Date du document *</label><input id="aiDate" type="date" value="'+escapeHTML(f.documentDate||adminDateISO())+'"></div>'
  +'<div class="fld"><label>Échéance *</label><input id="aiDue" type="date" value="'+escapeHTML(f.dueDate||adminDateISO(dans30))+'"></div>'
  +'<div class="fld"><label>Montant HT</label><input id="aiHT" inputmode="decimal" value="'+escapeHTML(f.amountHT??'')+'" placeholder="0,00"></div>'
  +'<div class="fld"><label>Taux de TVA</label><select id="aiTaxRate"><option value="">Non ventilé</option>'+rates.map(function(r){return '<option value="'+r+'" '+(num(f.taxRate)===num(r)&&f.taxRate!==null&&f.taxRate!==undefined?'selected':'')+'>'+fmt(num(r))+' %</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>TVA</label><input id="aiTax" inputmode="decimal" value="'+escapeHTML(f.taxAmount??'')+'" placeholder="0,00"></div>'
  +'<div class="fld"><label>Montant TTC</label><input id="aiTTC" inputmode="decimal" value="'+escapeHTML(f.amountTTC??'')+'" placeholder="0,00"></div>'
  +'<div class="fld"><label>Statut</label><select id="aiStatus">'+adminOptions(ADMIN_INVOICE_STATUSES,f.status||'a_verifier')+'</select></div>'
  +'<div class="fld"><label>Catégorie de dépense</label><select id="aiExpense"><option value="">Non catégorisée</option>'+expenses.map(function(x){return '<option value="'+x.id+'" '+(f.expenseCategoryId===x.id?'selected':'')+'>'+escapeHTML(x.name)+'</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>Compte comptable</label><select id="aiAccounting"><option value="">Non affecté</option>'+accounts.map(function(x){return '<option value="'+x.id+'" '+(f.accountingCategoryId===x.id?'selected':'')+'>'+escapeHTML((x.code?x.code+' · ':'')+x.name)+'</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>Référence commande</label><select id="aiOrder"><option value="">Aucune</option>'+orders.map(function(x){return '<option value="'+x.id+'" '+(String(f.orderReference||'')===String(x.id)?'selected':'')+'>'+escapeHTML((x.fournisseur||'Commande')+' · '+(x.dateLiv||x.cree||x.id))+'</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>Référence livraison</label><select id="aiDelivery"><option value="">Aucune</option>'+deliveries.map(function(x){return '<option value="'+x.id+'" '+(String(f.deliveryReference||'')===String(x.id)?'selected':'')+'>'+escapeHTML((x.fo||'Livraison')+' · '+String(x.ts||x.id).slice(0,10))+'</option>'}).join('')+'</select></div>'
  +'<div class="fld"><label>Date de paiement</label><input id="aiPaidDate" type="date" value="'+escapeHTML(f.paymentDate||'')+'"></div>'
  +'<div class="fld"><label>Moyen de paiement</label><input id="aiMethod" value="'+escapeHTML(f.paymentMethod||'')+'" placeholder="Virement, carte…"></div>'
  +(f.approvalStatus?'<div class="fld wide"><label>Validation</label><div class="admin-modal-hint">Statut : '+escapeHTML((ADMIN_APPROVAL_STATUSES.find(function(x){return x.id===f.approvalStatus})||{}).label||f.approvalStatus)+(f.approvalRuleId?' · règle automatique appliquée':'')+'</div></div>':'')
  +'<div class="fld wide"><label>Lignes de facture</label><textarea id="aiLines" rows="4" placeholder="Description | quantité | prix unitaire HT | taux TVA">'+escapeHTML((f.lines||[]).map(function(l){return[l.description||'',l.quantity||1,l.unitPriceHT||0,l.taxRate??''].join(' | ')}).join('\n'))+'</textarea><small>Une ligne par article ou service. Les montants peuvent être calculés automatiquement si les champs ci-dessus restent vides.</small></div>'
  +'<div class="fld wide"><label>Notes</label><textarea id="aiNotes" rows="3">'+escapeHTML(f.notes||'')+'</textarea></div></div>'
  +'<button class="btn" id="aiSave">'+(existant?'Enregistrer les modifications':'Créer la facture')+'</button><button class="btn btn-2" id="aiCancel">Annuler</button></div></div>';
 document.getElementById('aiCancel').onclick=closeModal;
 document.getElementById('adminInvBg').onclick=function(e){if(e.target.id==='adminInvBg')closeModal()};
 document.getElementById('aiSave').onclick=async function(){
  const fournisseur=adminValeur('aiSupplier'),date=adminValeur('aiDate'),echeance=adminValeur('aiDue');
  if(!fournisseur||!date||!echeance){toast('Renseignez le fournisseur et les dates.');return}
  const lignes=adminValeur('aiLines').split('\n').map(function(line){const p=line.split('|').map(function(x){return x.trim()});if(!p[0])return null;const quantity=Math.max(0,num(p[1]||1)),unitPriceHT=Math.max(0,num(p[2])),taxRate=p[3]===''||p[3]===undefined?null:num(p[3]);return{id:uid('ailine'),description:p[0],quantity,unitPriceHT,taxRate,amountHT:quantity*unitPriceHT,taxAmount:taxRate===null?0:quantity*unitPriceHT*taxRate/100}}).filter(Boolean);
  const saisieHT=adminValeur('aiHT'),saisieTax=adminValeur('aiTax'),tauxGlobal=adminValeur('aiTaxRate'),montantHT=saisieHT===''?lignes.reduce(function(s,l){return s+l.amountHT},0):num(saisieHT),tva=saisieTax===''?(lignes.length?lignes.reduce(function(s,l){return s+l.taxAmount},0):(tauxGlobal===''?0:montantHT*num(tauxGlobal)/100)):num(saisieTax),saisieTTC=adminValeur('aiTTC'),montantTTC=saisieTTC?num(saisieTTC):montantHT+tva;
  if(montantHT<0||tva<0||montantTTC<0){toast('Les montants doivent être positifs.');return}
  const record=adminConstruireFacture({
   documentId:adminValeur('aiDocument')||null,invoiceNumber:adminValeur('aiNumber'),supplier:fournisseur,
   documentDate:date,dueDate:echeance,amountHT:montantHT,taxAmount:tva,amountTTC:montantTTC,taxRate:adminValeur('aiTaxRate'),status:adminValeur('aiStatus'),
   paymentDate:adminValeur('aiPaidDate')||null,paymentMethod:adminValeur('aiMethod'),
   orderReference:adminValeur('aiOrder'),deliveryReference:adminValeur('aiDelivery'),expenseCategoryId:adminValeur('aiExpense')||null,accountingCategoryId:adminValeur('aiAccounting')||null,lines:lignes,notes:adminValeur('aiNotes')
  },existant||null,new Date());
  if(existant)Object.assign(existant,record);else adminData().invoices.unshift(record);
  adminSynchroniserDemandeApprobation(record,new Date());
  adminJournaliser(existant?'Facture modifiée':'Facture créée','SupplierInvoice',record.id,record.supplier+' · '+fmt(record.amountTTC)+' €');
  await save();closeModal();renderAdministration();toast(existant?'Facture mise à jour.':'Facture créée.');
 };
}
async function adminMarquerPayee(id){
 const f=adminData().invoices.find(function(x){return x.id===id});if(!f)return;
 if(f.approvalStatus==='pending'||f.approvalStatus==='rejected'){toast('Cette facture doit être validée avant d’être marquée comme payée.');return}
 adminAppliquerStatutFacture(f,'payee',new Date());
 adminJournaliser('Facture marquée payée','SupplierInvoice',f.id,(f.supplier||'Fournisseur')+' · '+fmt(num(f.amountTTC))+' €');
 await save();renderAdministration();toast('Facture marquée comme payée.');
}
async function adminVoirDocument(id){
 const d=adminData().documents.find(function(x){return x.id===id});if(!d||!d.fileKey){toast('Aucun fichier associé.');return}
 const popup=window.open('','_blank');
 const contenu=Docs.get(d.fileKey)||await Docs.getAsync(d.fileKey);
 if(!contenu){if(popup)popup.close();toast('Le fichier est indisponible sur cet appareil.');return}
 if(popup){popup.opener=null;popup.location.href=contenu}else toast('Autorisez l’ouverture d’un nouvel onglet pour voir le fichier.');
}
function openAdminContract(id){
 const existant=id?adminData().contracts.find(function(x){return x.id===id}):null,c=existant||{},docs=adminDansEtablissement(adminData().documents);
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminContractBg"><div class="sheet"><h3>'+(existant?'Modifier le contrat':'Nouveau contrat')+'</h3><p class="sh-sub">Les coûts et échéances alimentent automatiquement le dashboard.</p><div class="admin-modal-grid">'
  +'<div class="fld wide"><label>Nom *</label><input id="acName" value="'+escapeHTML(c.name||'')+'" placeholder="Ex. Assurance multirisque"></div><div class="fld"><label>Fournisseur *</label><input id="acSupplier" value="'+escapeHTML(c.supplier||'')+'"></div><div class="fld"><label>Catégorie</label><input id="acCategory" value="'+escapeHTML(c.category||'')+'" placeholder="Énergie, assurance, logiciel…"></div><div class="fld"><label>Coût mensuel</label><input id="acMonthly" inputmode="decimal" value="'+escapeHTML(c.costMonthly??'')+'"></div><div class="fld"><label>Coût annuel</label><input id="acAnnual" inputmode="decimal" value="'+escapeHTML(c.costAnnual??'')+'"></div><div class="fld"><label>Date de début</label><input id="acStart" type="date" value="'+escapeHTML(c.startDate||'')+'"></div><div class="fld"><label>Date de fin *</label><input id="acEnd" type="date" value="'+escapeHTML(c.endDate||'')+'"></div><div class="fld"><label>Préavis (jours)</label><input id="acNotice" type="number" min="0" value="'+escapeHTML(c.noticeDays??30)+'"></div><div class="fld"><label>Statut</label><select id="acStatus">'+adminOptions(ADMIN_CONTRACT_STATUSES,c.status||'actif')+'</select></div><div class="fld"><label>Reconduction automatique</label><select id="acRenew"><option value="non" '+(!c.autoRenewal?'selected':'')+'>Non</option><option value="oui" '+(c.autoRenewal?'selected':'')+'>Oui</option></select></div><div class="fld"><label>Document associé</label><select id="acDocument"><option value="">Aucun</option>'+docs.map(function(d){return '<option value="'+d.id+'" '+(c.documentId===d.id?'selected':'')+'>'+escapeHTML(d.title||d.fileName||'Document')+'</option>'}).join('')+'</select></div><div class="fld wide"><label>Notes</label><textarea id="acNotes" rows="3">'+escapeHTML(c.notes||'')+'</textarea></div></div><button class="btn" id="acSave">Enregistrer</button><button class="btn btn-2" id="acCancel">Annuler</button></div></div>';
 document.getElementById('acCancel').onclick=closeModal;document.getElementById('adminContractBg').onclick=function(e){if(e.target.id==='adminContractBg')closeModal()};
 document.getElementById('acSave').onclick=async function(){const name=adminValeur('acName'),supplier=adminValeur('acSupplier'),end=adminValeur('acEnd');if(!name||!supplier||!end){toast('Renseignez le nom, le fournisseur et la date de fin.');return}const now=new Date().toISOString(),cost=adminCoutsContrat({costMonthly:adminValeur('acMonthly'),costAnnual:adminValeur('acAnnual')}),start=adminValeur('acStart');const record={id:c.id||uid('acontract'),name,supplier,category:adminValeur('acCategory'),establishmentId:c.establishmentId||adminEtablissementId(),organizationId:c.organizationId===undefined?adminOrganisationId():c.organizationId,costMonthly:cost.monthly,costAnnual:cost.annual,startDate:start||null,endDate:end,durationMonths:start?Math.max(0,Math.round((adminDate(end)-adminDate(start))/2629800000)):null,autoRenewal:adminValeur('acRenew')==='oui',noticeDays:Math.max(0,num(adminValeur('acNotice'))),documentId:adminValeur('acDocument')||null,status:adminValeur('acStatus'),notes:adminValeur('acNotes'),createdAt:c.createdAt||now,updatedAt:now,createdBy:c.createdBy||adminAuteur()};if(existant)Object.assign(existant,record);else adminData().contracts.unshift(record);adminJournaliser(existant?'Contrat modifié':'Contrat créé','AdministrativeContract',record.id,record.name);await save();closeModal();renderAdministration();toast('Contrat enregistré.');};
}
function openAdminObligation(id){
 const existant=id?adminData().obligations.find(function(x){return x.id===id}):null,o=existant||{},docs=adminDansEtablissement(adminData().documents);
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminObligationBg"><div class="sheet"><h3>'+(existant?'Modifier l’obligation':'Nouvelle obligation')+'</h3><p class="sh-sub">Créez uniquement les obligations adaptées à votre établissement.</p><div class="admin-modal-grid"><div class="fld wide"><label>Nom *</label><input id="aoName" value="'+escapeHTML(o.name||'')+'"></div><div class="fld"><label>Catégorie</label><input id="aoCategory" value="'+escapeHTML(o.category||'')+'" placeholder="Licence, sécurité…"></div><div class="fld"><label>Responsable</label><input id="aoResponsible" value="'+escapeHTML(o.responsible||'')+'"></div><div class="fld"><label>Dernière validation</label><input id="aoLast" type="date" value="'+escapeHTML(o.lastValidation||'')+'"></div><div class="fld"><label>Prochaine échéance</label><input id="aoNext" type="date" value="'+escapeHTML(o.nextDue||'')+'"></div><div class="fld"><label>Fréquence</label><input id="aoFrequency" value="'+escapeHTML(o.frequency||'')+'" placeholder="Annuelle, trimestrielle…"></div><div class="fld"><label>Statut</label><select id="aoStatus">'+adminOptions(ADMIN_OBLIGATION_STATUSES,o.status||'conforme')+'</select></div><div class="fld"><label>Document associé</label><select id="aoDocument"><option value="">Aucun</option>'+docs.map(function(d){return '<option value="'+d.id+'" '+(o.documentId===d.id?'selected':'')+'>'+escapeHTML(d.title||d.fileName||'Document')+'</option>'}).join('')+'</select></div><div class="fld wide"><label>Notes</label><textarea id="aoNotes" rows="3">'+escapeHTML(o.notes||'')+'</textarea></div></div><button class="btn" id="aoSave">Enregistrer</button><button class="btn btn-2" id="aoCancel">Annuler</button></div></div>';
 document.getElementById('aoCancel').onclick=closeModal;document.getElementById('adminObligationBg').onclick=function(e){if(e.target.id==='adminObligationBg')closeModal()};
 document.getElementById('aoSave').onclick=async function(){const name=adminValeur('aoName');if(!name){toast('Renseignez le nom de l’obligation.');return}const now=new Date().toISOString(),record={id:o.id||uid('aobl'),name,category:adminValeur('aoCategory'),establishmentId:o.establishmentId||adminEtablissementId(),organizationId:o.organizationId===undefined?adminOrganisationId():o.organizationId,lastValidation:adminValeur('aoLast')||null,nextDue:adminValeur('aoNext')||null,frequency:adminValeur('aoFrequency'),responsible:adminValeur('aoResponsible'),documentId:adminValeur('aoDocument')||null,status:adminValeur('aoStatus'),notes:adminValeur('aoNotes'),createdAt:o.createdAt||now,updatedAt:now,createdBy:o.createdBy||adminAuteur()};if(existant)Object.assign(existant,record);else adminData().obligations.unshift(record);adminJournaliser(existant?'Obligation modifiée':'Obligation créée','AdministrativeObligation',record.id,record.name);await save();closeModal();renderAdministration();toast('Obligation enregistrée.');};
}
function openAdminDeadline(){
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminDeadlineBg"><div class="sheet"><h3>Nouvelle échéance</h3><p class="sh-sub">Ajoutez un événement administratif propre à votre établissement.</p><div class="admin-modal-grid"><div class="fld wide"><label>Titre *</label><input id="adeTitle"></div><div class="fld"><label>Date *</label><input id="adeDate" type="date"></div><div class="fld"><label>Type</label><input id="adeType" value="administratif"></div><div class="fld"><label>Montant éventuel</label><input id="adeAmount" inputmode="decimal"></div><div class="fld wide"><label>Notes</label><textarea id="adeNotes" rows="3"></textarea></div></div><button class="btn" id="adeSave">Ajouter</button><button class="btn btn-2" id="adeCancel">Annuler</button></div></div>';document.getElementById('adeCancel').onclick=closeModal;document.getElementById('adminDeadlineBg').onclick=function(e){if(e.target.id==='adminDeadlineBg')closeModal()};document.getElementById('adeSave').onclick=async function(){const title=adminValeur('adeTitle'),date=adminValeur('adeDate');if(!title||!date){toast('Renseignez le titre et la date.');return}const now=new Date().toISOString();adminData().deadlines.unshift({id:uid('adeadline'),title,date,type:adminValeur('adeType')||'administratif',amount:num(adminValeur('adeAmount')),notes:adminValeur('adeNotes'),status:'pending',establishmentId:adminEtablissementId(),organizationId:adminOrganisationId(),createdAt:now,updatedAt:now,createdBy:adminAuteur()});adminJournaliser('Échéance créée','AdministrativeDeadline',adminData().deadlines[0].id,title);await save();closeModal();renderAdministration();toast('Échéance ajoutée.');};
}
async function adminCompleteDeadline(id){
 const d=adminData().deadlines.find(function(x){return x.id===id});if(!d)return;
 d.status='completed';d.completedAt=new Date().toISOString();d.completedBy=adminAuteur();d.updatedAt=d.completedAt;
 adminJournaliser('Échéance terminée','AdministrativeDeadline',d.id,d.title);await save();renderAdministration();toast('Échéance marquée comme terminée.');
}
function openAdminCash(){
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminCashBg"><div class="sheet"><h3>Mouvement prévisionnel</h3><p class="sh-sub">Saisie manuelle clairement séparée des factures fournisseurs.</p><div class="admin-modal-grid"><div class="fld wide"><label>Libellé *</label><input id="acfTitle"></div><div class="fld"><label>Date *</label><input id="acfDate" type="date"></div><div class="fld"><label>Sens</label><select id="acfDirection"><option value="out">Décaissement</option><option value="in">Encaissement</option></select></div><div class="fld"><label>Montant *</label><input id="acfAmount" inputmode="decimal"></div><div class="fld"><label>Catégorie</label><input id="acfCategory" placeholder="Loyer, salaires…"></div></div><button class="btn" id="acfSave">Ajouter</button><button class="btn btn-2" id="acfCancel">Annuler</button></div></div>';document.getElementById('acfCancel').onclick=closeModal;document.getElementById('adminCashBg').onclick=function(e){if(e.target.id==='adminCashBg')closeModal()};document.getElementById('acfSave').onclick=async function(){const title=adminValeur('acfTitle'),date=adminValeur('acfDate'),amount=num(adminValeur('acfAmount'));if(!title||!date||!(amount>0)){toast('Renseignez le libellé, la date et un montant positif.');return}const now=new Date().toISOString();adminData().cashFlowForecasts.unshift({id:uid('acash'),title,date,direction:adminValeur('acfDirection'),amount,category:adminValeur('acfCategory'),establishmentId:adminEtablissementId(),organizationId:adminOrganisationId(),createdAt:now,updatedAt:now,createdBy:adminAuteur()});adminJournaliser('Prévision de trésorerie créée','CashFlowForecast',adminData().cashFlowForecasts[0].id,title);await save();closeModal();renderAdministration();toast('Mouvement ajouté.');};
}
function openAdminCashSettings(){
 const s=adminData().settings;document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminCashSettingsBg"><div class="sheet"><h3>Paramètres de trésorerie</h3><p class="sh-sub">Ces valeurs sont saisies manuellement tant qu’aucune banque n’est connectée.</p><div class="fld"><label>Solde actuel</label><input id="acsBalance" inputmode="decimal" value="'+escapeHTML(s.currentCashBalance??'')+'" placeholder="Laisser vide si inconnu"></div><div class="fld"><label>Seuil d’alerte</label><input id="acsThreshold" inputmode="decimal" value="'+escapeHTML(s.cashWarningThreshold??0)+'"></div><button class="btn" id="acsSave">Enregistrer</button><button class="btn btn-2" id="acsCancel">Annuler</button></div></div>';document.getElementById('acsCancel').onclick=closeModal;document.getElementById('adminCashSettingsBg').onclick=function(e){if(e.target.id==='adminCashSettingsBg')closeModal()};document.getElementById('acsSave').onclick=async function(){const balance=adminValeur('acsBalance');s.currentCashBalance=balance===''?null:num(balance);s.cashWarningThreshold=num(adminValeur('acsThreshold'));s.cashBalanceUpdatedAt=s.currentCashBalance===null?null:adminDateISO();adminJournaliser('Trésorerie configurée','CashFlowForecast','settings','Solde et seuil mis à jour');await save();closeModal();renderAdministration();toast('Trésorerie configurée.');};
}
function openAdminVatSettings(){
 const s=adminData().settings,source=s.vatCollectedSource||{};document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminVatBg"><div class="sheet"><h3>Paramètres TVA</h3><p class="sh-sub">Les taux restent configurables et les montants sont indicatifs.</p><div class="fld"><label>Taux séparés par des virgules</label><input id="avsRates" value="'+escapeHTML((s.taxRates||[]).join(', '))+'"></div><div class="fld"><label>TVA collectée disponible</label><input id="avsCollected" inputmode="decimal" value="'+escapeHTML(source.amount??'')+'" placeholder="Laisser vide si la source n’existe pas"></div><div class="fld"><label>Période de la source</label><input id="avsPeriod" type="month" value="'+escapeHTML(source.period||'')+'"></div><button class="btn" id="avsSave">Enregistrer</button><button class="btn btn-2" id="avsCancel">Annuler</button></div></div>';document.getElementById('avsCancel').onclick=closeModal;document.getElementById('adminVatBg').onclick=function(e){if(e.target.id==='adminVatBg')closeModal()};document.getElementById('avsSave').onclick=async function(){const rates=adminValeur('avsRates').split(/[,;]/).map(num).filter(function(x){return x>0&&x<=100});if(!rates.length){toast('Renseignez au moins un taux valide.');return}s.taxRates=[...new Set(rates)];const amount=adminValeur('avsCollected');s.vatCollectedSource=amount===''?null:{amount:num(amount),period:adminValeur('avsPeriod')||null,source:'manual'};adminJournaliser('TVA configurée','TaxRate','settings',s.taxRates.join(', ')+' %');await save();closeModal();renderAdministration();toast('TVA configurée.');};
}
function openAdminContractSettings(){
 const s=adminData().settings;document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminContractSettingsBg"><div class="sheet"><h3>Alertes contrats</h3><p class="sh-sub">Délais en jours avant l’échéance.</p><div class="fld"><label>Délais séparés par des virgules</label><input id="actDays" value="'+escapeHTML((s.contractAlertDays||[]).join(', '))+'"></div><button class="btn" id="actSave">Enregistrer</button><button class="btn btn-2" id="actCancel">Annuler</button></div></div>';document.getElementById('actCancel').onclick=closeModal;document.getElementById('adminContractSettingsBg').onclick=function(e){if(e.target.id==='adminContractSettingsBg')closeModal()};document.getElementById('actSave').onclick=async function(){const days=adminValeur('actDays').split(/[,;]/).map(num).filter(function(x){return x>=0}).sort(function(a,b){return b-a});if(!days.length){toast('Renseignez au moins un délai.');return}s.contractAlertDays=[...new Set(days)];await save();closeModal();renderAdministration();toast('Délais enregistrés.');};
}
function openAdminAnomalySettings(){
 const s=adminData().settings;document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminAnomalySettingsBg"><div class="sheet"><h3>Détection des hausses tarifaires</h3><p class="sh-sub">Le contrôle compare le prix fournisseur courant au prix précédent déjà conservé par l’application.</p><div class="fld"><label>Seuil d’alerte en pourcentage</label><input id="aasThreshold" type="number" min="0" step="0.1" value="'+escapeHTML(s.priceIncreaseAlertPercent??10)+'"></div><button class="btn" id="aasSave">Enregistrer</button><button class="btn btn-2" id="aasCancel">Annuler</button></div></div>';document.getElementById('aasCancel').onclick=closeModal;document.getElementById('adminAnomalySettingsBg').onclick=function(e){if(e.target.id==='adminAnomalySettingsBg')closeModal()};document.getElementById('aasSave').onclick=async function(){s.priceIncreaseAlertPercent=Math.max(0,num(adminValeur('aasThreshold')));adminJournaliser('Seuil tarifaire configuré','AdministrativeAnomaly','settings',fmt(s.priceIncreaseAlertPercent)+' %');await save();closeModal();renderAdministration();toast('Seuil enregistré.');};
}
function openAdminCategorySettings(){
 const data=adminData();document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminCategoryBg"><div class="sheet"><h3>Catégories de pré-comptabilité</h3><p class="sh-sub">Une ligne par catégorie. Pour les comptes : code puis nom, séparés par « : ».</p><div class="fld"><label>Catégories de dépenses</label><textarea id="apcExpenses" rows="6">'+escapeHTML((data.expenseCategories||[]).map(function(x){return x.name}).join('\n'))+'</textarea></div><div class="fld"><label>Comptes comptables</label><textarea id="apcAccounts" rows="6">'+escapeHTML((data.accountingCategories||[]).map(function(x){return(x.code?x.code+': ':'')+x.name}).join('\n'))+'</textarea></div><button class="btn" id="apcSave">Enregistrer</button><button class="btn btn-2" id="apcCancel">Annuler</button></div></div>';document.getElementById('apcCancel').onclick=closeModal;document.getElementById('adminCategoryBg').onclick=function(e){if(e.target.id==='adminCategoryBg')closeModal()};document.getElementById('apcSave').onclick=async function(){const oldE=data.expenseCategories||[],oldA=data.accountingCategories||[];data.expenseCategories=adminValeur('apcExpenses').split('\n').map(function(x){return x.trim()}).filter(Boolean).map(function(name){const old=oldE.find(function(x){return x.name===name});return{id:old?old.id:uid('expense'),name}});data.accountingCategories=adminValeur('apcAccounts').split('\n').map(function(x){return x.trim()}).filter(Boolean).map(function(line){const p=line.split(':'),code=p.length>1?p.shift().trim():'',name=p.join(':').trim()||code,old=oldA.find(function(x){return x.code===code&&x.name===name});return{id:old?old.id:uid('account'),code,name}});adminJournaliser('Catégories comptables configurées','AccountingCategory','settings',data.expenseCategories.length+' dépenses · '+data.accountingCategories.length+' comptes');await save();closeModal();renderAdministration();toast('Catégories enregistrées.');};
}
function openAdminApprovalRule(id){
 const data=adminData(),s=data.settings;let workflows=data.approvalWorkflows||(data.approvalWorkflows=[]);if(!workflows.length&&(s.approvalRules||[]).length){workflows=s.approvalRules.slice();data.approvalWorkflows=workflows}const rules=workflows,r=id?rules.find(function(x){return x.id===id}):null,x=r||{};
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="adminRuleBg"><div class="sheet"><h3>'+(r?'Modifier la règle':'Nouvelle règle de validation')+'</h3><p class="sh-sub">Les seuils ne sont jamais figés dans l’interface.</p><div class="admin-modal-grid"><div class="fld"><label>Montant minimum</label><input id="arMin" inputmode="decimal" value="'+escapeHTML(x.minAmount??0)+'"></div><div class="fld"><label>Montant maximum</label><input id="arMax" inputmode="decimal" value="'+escapeHTML(x.maxAmount??'')+'" placeholder="Vide = sans limite"></div><div class="fld"><label>Rôle validateur</label><select id="arRole">'+POSTES.filter(function(p){return p.resp}).map(function(p){return '<option value="'+p.id+'" '+(x.role===p.id?'selected':'')+'>'+escapeHTML(p.n)+'</option>'}).join('')+'</select></div><div class="fld"><label>Type de document</label><select id="arType"><option value="facture">Facture</option></select></div></div><button class="btn" id="arSave">Enregistrer</button><button class="btn btn-2" id="arCancel">Annuler</button></div></div>';document.getElementById('arCancel').onclick=closeModal;document.getElementById('adminRuleBg').onclick=function(e){if(e.target.id==='adminRuleBg')closeModal()};document.getElementById('arSave').onclick=async function(){const min=Math.max(0,num(adminValeur('arMin'))),max=adminValeur('arMax')===''?null:Math.max(0,num(adminValeur('arMax')));if(max!==null&&max<min){toast('Le maximum doit être supérieur au minimum.');return}const record={id:x.id||uid('arule'),minAmount:min,maxAmount:max,role:adminValeur('arRole'),establishmentId:adminEtablissementId(),documentType:'facture',required:true,enabled:true};if(r)Object.assign(r,record);else workflows.push(record);s.approvalRules=workflows;adminJournaliser(r?'Règle de validation modifiée':'Règle de validation créée','ApprovalWorkflow',record.id,fmt(min)+' € à '+(max===null?'∞':fmt(max)+' €'));await save();closeModal();renderAdministration();toast('Règle enregistrée.');};
}
async function adminSetApproval(id,status){
 const f=adminData().invoices.find(function(x){return x.id===id});if(!f||!ADMIN_APPROVAL_STATUSES.some(function(x){return x.id===status}))return;f.approvalStatus=status;f.updatedAt=new Date().toISOString();f.approvedBy=status==='approved'?adminAuteur():null;f.approvedAt=status==='approved'?f.updatedAt:null;adminSynchroniserDemandeApprobation(f,new Date());adminJournaliser(status==='approved'?'Facture validée':'Facture rejetée','ApprovalRequest',f.id,f.supplier+' · '+fmt(num(f.amountTTC))+' €');await save();renderAdministration();toast(status==='approved'?'Facture validée.':'Facture rejetée.');}
async function adminSetAnomalyStatus(key,status){
 const data=adminData(),found=(data.anomalies||[]).find(function(x){return x.key===key}),now=new Date().toISOString();if(found){found.status=status;found.updatedAt=now}else data.anomalies.push({id:uid('aanomaly'),key,status,detectedAt:now,updatedAt:now,resolution:status==='resolue'?'Résolue manuellement':''});adminJournaliser(status==='resolue'?'Anomalie résolue':'Anomalie ignorée','AdministrativeAnomaly',key,key);await save();renderAdministration();toast('Anomalie mise à jour.');}
function adminExportAccounting(){
 const expenses=adminData().expenseCategories||[],accounts=adminData().accountingCategories||[],rows=[['Date','Fournisseur','Numero','HT','TVA','TTC','Taux TVA','Categorie depense','Compte','Statut','Piece']];
 adminDansEtablissement(adminData().invoices).forEach(function(f){const e=expenses.find(function(x){return x.id===f.expenseCategoryId}),a=accounts.find(function(x){return x.id===f.accountingCategoryId});rows.push([f.documentDate||'',f.supplier||'',f.invoiceNumber||'',num(f.amountHT),num(f.taxAmount),num(f.amountTTC),f.taxRate??'',e?e.name:'',a?(a.code? a.code+' ':'')+a.name:'',f.status||'',f.documentId?'oui':'non'])});
 dlCsv(rows,'pre-comptabilite_'+adminDateISO()+'.csv');adminJournaliser('Pré-comptabilité exportée','AccountingExport','csv',rows.length-1+' factures');save();
}

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
