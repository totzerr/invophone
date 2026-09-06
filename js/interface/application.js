function renderAll(){document.getElementById('langBtn').textContent=t('code');
document.getElementById('whoName').textContent=st.who.split(' ')[0];go()}
async function bootApp(){
 document.body.classList.remove('locked');
 document.getElementById('auth').classList.remove('on');
 await loadAuth();
 if(session&&session.needsWorkspace){showAuth('workspace');return}
 if(session&&session.invitationAccepted){session.invitationAccepted=false;await saveSess();showAuth('new-password',{type:'ok',txt:'Invitation acceptée. Choisissez maintenant votre mot de passe.'});return}
 await load();
 if(session&&auth.users[session.email]){
  const u=auth.users[session.email],poste=POSTES.find(p=>p.id===rolePrincipalUtilisateur(u));
  if(poste){st.whoId=poste.id;st.who=u.nom||poste.n}
  st.etabId=u.etabId||st.etabId||'';
  st.etabNom=u.etabNom||st.etabNom||'';
  st.organizationId=u.organizationId||st.organizationId||'';
  st.organizationName=u.organizationName||st.organizationName||st.etabNom||'';
 }
 const topBrandTpl=document.getElementById('invoLogo');
 if(topBrandTpl&&!document.getElementById('topBrand')){
   topBrandTpl.insertAdjacentHTML('afterend',`<div class="top-brand" id="topBrand">${topBrandTpl.innerHTML}</div>`);
 }
 mettreAJourMarqueEtablissement();
 seenFeed=st.mv.length;
 Docs.migrer().then(n=>{if(n)console.log('Documents migrés vers IndexedDB :',n)});
 document.getElementById('langBtn').onclick=openLang;
 document.getElementById('whoBtn').onclick=openWho;
 document.getElementById('gearBtn').onclick=()=>{fermerMenu();openReglages()};
 document.getElementById('burgerBtn').onclick=basculerMenu;
 document.getElementById('drBg').onclick=fermerMenu;
 renderAll();programmerRecapMatin();actualiserMeteoAccueil();startFeed();setTimeout(()=>{if(st.live)posEvent();adminSynchronisationAutomatique()},1200);
}

/* INVO · HISTORIQUE D'AUDIT LOCAL · 2026-08-24
   Démonstration locale : la visibilité est contrôlée dans l'interface.
   Une conservation inviolable et un contrôle de rôle serveur exigent un backend. */
let auditJournal=[];
function cleHistoriqueAudit(){return dataKey()+':audit-v1'}
function peutVoirHistoriqueAudit(){
 return !!st&&['admin','gestion','direction'].includes(st.whoId);
}
function roleHistoriqueAudit(){
 if(st&&st.whoId==='admin')return 'Administrateur';
 if(st&&st.whoId==='gestion')return 'Gestion';
 if(st&&st.whoId==='direction')return 'Direction';
 const poste=(POSTES||[]).find(function(p){return p.id===st.whoId});
 return poste?poste.n:(st.who||'Employé');
}
function echapperHistoriqueAudit(v){return escapeHTML(String(v===undefined||v===null||v===''?'—':v))}
function resumeStockHistoriqueAudit(platId){
 const c=item(platId);
 if(!c||!c.f)return 'Aucun ingrédient relié';
 const lignes=Object.entries(c.f).map(function(pair){
  const p=prod(pair[0]),q=st.stock[pair[0]]||0;
  return (p?p.n:pair[0])+' : '+fmtQ(q)+' '+(p?p.u:'');
 });
 return lignes.join(' · ')||'Aucun ingrédient relié';
}
function libelleHistoriqueMotif(motif){
 const lib={vente:'Vente externe enregistrée',envoi:'Sortie enregistrée',annul:'Annulation classée',
  offClient:'Offert client classé',offPart:'Offert partenaire classé',offGroupe:'Offert groupe classé',
  casse:'Perte / casse classée',rate:'Perte / raté classée'};
 return lib[motif]||'Mouvement enregistré';
}
function ajouterHistoriqueAudit(action,element,avant,apres,motif){
 const entry={
  id:'audit_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
  ts:new Date().toISOString(),
  utilisateur:st&&st.who?st.who:'Utilisateur non identifié',
  role:roleHistoriqueAudit(),
  action:action||'Action enregistrée',
  element:element||'—',
  avant:avant===undefined?'—':avant,
  apres:apres===undefined?'—':apres,
  motif:motif||''
 };
 auditJournal.unshift(entry);
 if(auditJournal.length>500)auditJournal.length=500;
 Promise.resolve(Store.set(cleHistoriqueAudit(),auditJournal)).catch(function(){});
 return entry;
}
const chargerDonneesInvoSansHistorique=load;
load=async function(){
 await chargerDonneesInvoSansHistorique();
 const local=await Store.get(cleHistoriqueAudit());
 auditJournal=Array.isArray(local)?local:[];
};
function formatDateHistoriqueAudit(ts){
 const d=new Date(ts);
 return isNaN(d.getTime())?'—':d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})+' · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}
function optionsHistoriqueAudit(values,selected){
 return values.map(function(v){return '<option value="'+echapperHistoriqueAudit(v)+'"'+(v===selected?' selected':'')+'>'+echapperHistoriqueAudit(v)+'</option>'}).join('');
}
function historiqueAuditHTML(){
 const utilisateurs=['',...Array.from(new Set(auditJournal.map(function(x){return x.utilisateur}).filter(Boolean))).sort()];
 const roles=['',...Array.from(new Set(auditJournal.map(function(x){return x.role}).filter(Boolean))).sort()];
 const actions=['',...Array.from(new Set(auditJournal.map(function(x){return x.action}).filter(Boolean))).sort()];
 return '<section class="audit-group">'+
  '<p class="audit-intro"><b>Historique local de démonstration.</b> Il est visible uniquement depuis le profil Gestion / Direction dans cette version. Une conservation inviolable exige un backend.</p>'+
  '<div class="audit-filters">'+
   '<label>Utilisateur<select id="auditUser"><option value="">Tous</option>'+optionsHistoriqueAudit(utilisateurs.slice(1),'')+'</select></label>'+
   '<label>Rôle<select id="auditRole"><option value="">Tous</option>'+optionsHistoriqueAudit(roles.slice(1),'')+'</select></label>'+
   '<label>Action<select id="auditAction"><option value="">Toutes</option>'+optionsHistoriqueAudit(actions.slice(1),'')+'</select></label>'+
   '<label>Période<select id="auditPeriod"><option value="">Toute période</option><option value="day">Aujourd’hui</option><option value="week">7 derniers jours</option><option value="month">30 derniers jours</option></select></label>'+
  '</div><div class="audit-list" id="auditRows"></div></section>';
}
function rendreLignesHistoriqueAudit(){
 const cible=document.getElementById('auditRows');if(!cible)return;
 const utilisateur=document.getElementById('auditUser')?document.getElementById('auditUser').value:'';
 const role=document.getElementById('auditRole')?document.getElementById('auditRole').value:'';
 const action=document.getElementById('auditAction')?document.getElementById('auditAction').value:'';
 const periode=document.getElementById('auditPeriod')?document.getElementById('auditPeriod').value:'';
 const maintenant=Date.now();
 const delai={day:86400000,week:7*86400000,month:30*86400000}[periode]||0;
 const lignes=auditJournal.filter(function(x){
  if(utilisateur&&x.utilisateur!==utilisateur)return false;
  if(role&&x.role!==role)return false;
  if(action&&x.action!==action)return false;
  return !delai||maintenant-new Date(x.ts).getTime()<=delai;
 });
 cible.innerHTML=lignes.length?lignes.map(function(x){
  return '<article class="audit-row"><time>'+echapperHistoriqueAudit(formatDateHistoriqueAudit(x.ts))+'</time><div class="audit-row-main">'+
   '<div class="audit-row-title"><span>'+echapperHistoriqueAudit(x.action)+'</span><span class="audit-role">'+echapperHistoriqueAudit(x.role)+'</span></div>'+
   '<div class="audit-element">'+echapperHistoriqueAudit(x.utilisateur)+' · '+echapperHistoriqueAudit(x.element)+'</div>'+
   '<div class="audit-change"><span>'+echapperHistoriqueAudit(x.avant)+'</span><i>→</i><span>'+echapperHistoriqueAudit(x.apres)+'</span></div>'+
   (x.motif?'<div class="audit-note">Motif / commentaire : '+echapperHistoriqueAudit(x.motif)+'</div>':'')+
  '</div></article>';
 }).join(''):'<div class="audit-empty">Aucune action ne correspond à ces filtres.</div>';
}
function lierHistoriqueAudit(){
 ['auditUser','auditRole','auditAction','auditPeriod'].forEach(function(id){
  const champ=document.getElementById(id);if(champ)champ.onchange=rendreLignesHistoriqueAudit;
 });
 rendreLignesHistoriqueAudit();
}
const ouvrirReglagesSansHistorique=openReglages;
openReglages=function(onglet){
 let voulu=typeof onglet==='string'?onglet:(settingsTab||'general');
 if(voulu==='audit'&&!peutVoirHistoriqueAudit()){voulu='general';toast('Historique réservé à Gestion / Direction.');}
 ouvrirReglagesSansHistorique(voulu==='audit'?'general':voulu);
 synchroniserVisibilitePanierSortie();
 if(!peutVoirHistoriqueAudit())return;
 const nav=document.querySelector('.settings-nav');
 if(nav&&!nav.querySelector('[data-settings="audit"]')){
  nav.insertAdjacentHTML('beforeend','<button data-settings="audit" aria-current="false"><span class="settings-row-icon settings-row-icon--general">◷</span><span>Historique</span></button>');
 }
 const auditBtn=document.querySelector('[data-settings="audit"]');
 if(auditBtn)auditBtn.onclick=function(){openReglages('audit')};
 if(voulu==='audit'){
  settingsTab='audit';
  document.querySelectorAll('[data-settings]').forEach(function(b){const actif=b.dataset.settings==='audit';b.classList.toggle('on',actif);b.setAttribute('aria-current',actif?'page':'false');});
  const contenu=document.querySelector('.settings-content');
  if(contenu){contenu.innerHTML=historiqueAuditHTML();lierHistoriqueAudit();}
 }
};
const creerMouvementSansHistorique=creerMouvement;
creerMouvement=function(m,options){
 const avant=resumeStockHistoriqueAudit(m.plat);
 const resultat=creerMouvementSansHistorique.call(this,m,options);
 if(resultat&&resultat.ok&&m.src!=='demo'){
  const note=m.parent?'Transaction liée : '+m.parent:(m.table&&m.table!=='—'?'Référence : '+m.table:'');
  ajouterHistoriqueAudit(libelleHistoriqueMotif(m.motif),resultat.mv.platN,avant,resumeStockHistoriqueAudit(m.plat),note);
 }
 return resultat;
};
const validerInventaireSansHistorique=validerInv;
validerInv=async function(){
 const avant=(st.invHist||[]).length;
 await validerInventaireSansHistorique.apply(this,arguments);
 const dernier=(st.invHist||[])[0];
 if(dernier&&(st.invHist||[]).length>avant){
  ajouterHistoriqueAudit('Inventaire validé',dernier.nb+' ligne(s) comptée(s)','Écarts avant validation : '+dernier.nbEcart,'Valeur d’écart : '+fmt(dernier.valEcart)+' €','Validation humaine de l’inventaire');
 }
};
const preparerCommandeSansHistorique=preparerCommande;
preparerCommande=async function(){
 const avant=(st.commandes||[]).map(function(x){return x.id}).join('|');
 await preparerCommandeSansHistorique.apply(this,arguments);
 const commande=(st.commandes||[])[0];
 if(commande&&avant.indexOf(commande.id)===-1){
  ajouterHistoriqueAudit('Commande préparée',commande.fournisseur,'Stock inchangé',commande.lines.length+' ligne(s) en attente de réception','Livraison prévue : '+commande.dateLiv);
 }
};
const saveLivSansHistorique=saveLiv;
saveLiv=async function(){
 const avant=(st.liv||[])[0]&&String((st.liv||[])[0].id);
 await saveLivSansHistorique.apply(this,arguments);
 const livraison=(st.liv||[])[0];
 if(livraison&&String(livraison.id)!==avant){
  const controle=livraison.controle||{},ecarts=(controle.manquants||[]).length+(controle.hausses||[]).length+(controle.inattendus||[]).length;
  ajouterHistoriqueAudit('Livraison validée',livraison.fo,'Stock avant réception',livraison.lines.length+' ligne(s) ajoutée(s)',ecarts?ecarts+' écart(s) contrôlé(s) avant validation humaine':'Réception humaine validée sans écart détecté');
 }
};
const signalerEcartsReceptionSansHistorique=signalerEcartsReception;
signalerEcartsReception=function(){
 const resultat=signalerEcartsReceptionSansHistorique.apply(this,arguments);
 if(resultat){
  const element=livForm&&livForm.fo?livForm.fo:'Fournisseur';
  const suite=resultat==='mail'?'E-mail prérempli, envoi à confirmer par l’utilisateur':'Texte copié, aucun envoi automatique';
  ajouterHistoriqueAudit('Écart de réception signalé',element,'Écart détecté avant validation',suite,'Aucune donnée n’est envoyée sans action humaine');
 }
 return resultat;
};
const saveMatSansHistorique=saveMat;
saveMat=async function(){
 const ancien=fm&&fm.id?prod(fm.id):null;
 const avant=ancien?ancien.n+' · stock '+fmtQ(st.stock[ancien.id]||0)+' '+ancien.u:'Matière inexistante';
 const nom= fm&&fm.n?fm.n.trim():'Matière';
 await saveMatSansHistorique.apply(this,arguments);
 const trouve=(st.prods||[]).find(function(p){return p.n===nom});
 if(trouve)ajouterHistoriqueAudit(ancien?'Matière modifiée':'Matière ajoutée',trouve.n,avant,'Stock '+fmtQ(st.stock[trouve.id]||0)+' '+trouve.u,'Catalogue stock');
};
const saveCarteSansHistorique=saveCarte;
saveCarte=async function(){
 const ancien=fm&&fm.id?(st.carte||[]).find(function(x){return x.id===fm.id}):null;
 const nom=fm&&fm.n?fm.n.trim():'Produit';
 await saveCarteSansHistorique.apply(this,arguments);
 const trouve=(st.carte||[]).find(function(x){return x.n===nom});
 if(trouve)ajouterHistoriqueAudit(ancien?'Produit carte modifié':'Produit carte ajouté',trouve.n,ancien?ancien.n:'Produit absent',trouve.n,'Fiche technique');
};
const signalerManquantSansHistorique=signalerProduitManquant;
signalerProduitManquant=function(){
 const resultat=signalerManquantSansHistorique.apply(this,arguments);
 if(resultat)ajouterHistoriqueAudit('Produit manquant signalé',commandeFo||'Fournisseur','Signalement préparé dans INVO',resultat==='mail'?'E-mail prérempli, envoi à confirmer':'Texte copié faute d’e-mail fournisseur','Aucune donnée n’est envoyée automatiquement');
 return resultat;
};
function ouvrirTraitementVente(mvId){
 const cible=(st.mv||[]).find(function(x){return String(x.id)===String(mvId)});
 if(!cible){toast('Cette vente n’est plus disponible.');return;}
 screen='caisse';go();
 requestAnimationFrame(function(){openQualification(mvId);});
}

/* Marque affichée : les clés locales historiques restent volontairement inchangées
   afin de conserver les comptes et données déjà enregistrés sur cet appareil. */
const SWAY_MARQUE={nom:'Sway',logo:'assets/sway-logo-source-black.png'};
function texteSway(texte){return String(texte||'').replace(/\bINVO\b/g,'SWAY').replace(/\bInvo\b/g,'Sway').replace(/\binvo\b/g,'Sway');}
function appliquerMarqueSway(racine){
 const scope=racine||document;
 const template=document.getElementById('invoLogo');
 if(template&&template.content){const image=template.content.querySelector('.logo-img');if(image){image.src=SWAY_MARQUE.logo;image.alt='Logo Sway';image.decoding='async';}}
 if(scope.querySelectorAll){scope.querySelectorAll('.logo-img').forEach(function(image){image.src=SWAY_MARQUE.logo;image.alt='Logo Sway';image.decoding='async';});}
 const cible=scope.nodeType===1?scope:document.body;
 if(!cible)return;
 const filtre={acceptNode:function(noeud){return noeud.parentElement&&noeud.parentElement.closest('script,style,template')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}};
 const textes=document.createTreeWalker(cible,NodeFilter.SHOW_TEXT,filtre);
 let noeud;
 while((noeud=textes.nextNode())){const suivant=texteSway(noeud.nodeValue);if(suivant!==noeud.nodeValue)noeud.nodeValue=suivant;}
 if(scope.querySelectorAll){scope.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(function(element){['title','aria-label','placeholder','alt'].forEach(function(attribut){if(element.hasAttribute(attribut)){const actuel=element.getAttribute(attribut),suivant=texteSway(actuel);if(suivant!==actuel)element.setAttribute(attribut,suivant);}});});}
}
function observerMarqueSway(){
 const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=texteSway(meta.content);document.title=texteSway(document.title);
 appliquerMarqueSway(document);
 new MutationObserver(function(mutations){mutations.forEach(function(mutation){
  if(mutation.type==='characterData'){if(!mutation.target.parentElement||!mutation.target.parentElement.closest('script,style,template')){const suivant=texteSway(mutation.target.nodeValue);if(suivant!==mutation.target.nodeValue)mutation.target.nodeValue=suivant;}}
  else if(mutation.type==='childList'){mutation.addedNodes.forEach(function(noeud){if(noeud.nodeType===3){if(!noeud.parentElement||!noeud.parentElement.closest('script,style,template')){const suivant=texteSway(noeud.nodeValue);if(suivant!==noeud.nodeValue)noeud.nodeValue=suivant;}}else if(noeud.nodeType===1&&!noeud.closest('script,style,template'))appliquerMarqueSway(noeud);});}
 });}).observe(document.body,{childList:true,subtree:true,characterData:true});
}

/* Connexion désactivée pour la phase de test.
   Le code des comptes reste présent (creerCompte, connecter, showAuth…)
   et pourra être réactivé en remplaçant l'appel ci-dessous. */
observerMarqueSway();
(async()=>{await bootApp();appliquerMarqueSway(document)})();
