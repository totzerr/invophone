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
