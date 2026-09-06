/* ── Transfert depuis un ancien logiciel ────────────────────────────────
   Le fichier reste dans le navigateur. Aucun stock ni donnée INVO n'est
   modifié avant la validation finale et explicite de la personne connectée. */
const TRANSFERT_ANCIEN_TYPES={
 produits:{label:'Produits',description:'Noms, unités, catégories, fournisseurs et seuils.',champs:{nom:{label:'Nom du produit',obligatoire:true,alias:['nom','produit','article','désignation','designation','libellé','libelle','name']},unite:{label:'Unité',obligatoire:true,alias:['unité','unite','uom','unit','conditionnement']},categorie:{label:'Catégorie',alias:['catégorie','categorie','famille','rayon']},fournisseur:{label:'Fournisseur',alias:['fournisseur','supplier','marque']},prix:{label:'Prix d’achat',alias:['prix','prix achat','prix d achat','pa','cout','coût','cost']},seuil:{label:'Seuil d’alerte',alias:['seuil','stock minimum','stock mini','min']},stock:{label:'Quantité en stock',alias:['stock','quantité','quantite','qte','qty']},emplacement:{label:'Emplacement',alias:['emplacement','zone','lieu','location']}}},
 fournisseurs:{label:'Fournisseurs',description:'Noms et coordonnées fournisseurs.',champs:{nom:{label:'Nom du fournisseur',obligatoire:true,alias:['nom','fournisseur','supplier','raison sociale','entreprise','name']},email:{label:'E-mail',alias:['email','e-mail','mail','courriel']}}},
 stocks:{label:'Stocks',description:'Quantités à rapprocher de produits déjà présents dans INVO.',champs:{produit:{label:'Produit INVO',obligatoire:true,alias:['produit','article','nom','désignation','designation','libellé','libelle','product']},quantite:{label:'Quantité comptée',obligatoire:true,alias:['quantité','quantite','qte','qty','stock','niveau']},emplacement:{label:'Emplacement',alias:['emplacement','zone','lieu','location']}}},
 commandes:{label:'Commandes',description:'Archive préparée pour une reprise contrôlée.',champs:{reference:{label:'Référence',obligatoire:true,alias:['référence','reference','commande','numéro','numero','id']},date:{label:'Date',alias:['date','créé le','cree le','created at']},commentaire:{label:'Note',alias:['note','commentaire','comment','remarque']}}},
 livraisons:{label:'Livraisons',description:'Archive préparée pour un rapprochement avec les commandes.',champs:{reference:{label:'Référence',obligatoire:true,alias:['référence','reference','livraison','bon','numéro','numero','id']},date:{label:'Date',alias:['date','reçu le','recu le','received at']},commentaire:{label:'Note',alias:['note','commentaire','comment','remarque']}}},
 fiches:{label:'Fiches techniques',description:'Archive à reprendre dans les fiches techniques INVO.',champs:{reference:{label:'Nom ou référence',obligatoire:true,alias:['nom','référence','reference','fiche','recette','produit','name']},commentaire:{label:'Note',alias:['note','commentaire','comment','description']}}},
 historique:{label:'Historique',description:'Archive à contrôler avant toute reprise dans le journal INVO.',champs:{reference:{label:'Action ou référence',obligatoire:true,alias:['action','référence','reference','libellé','libelle','description']},date:{label:'Date',alias:['date','date heure','timestamp','created at']},commentaire:{label:'Commentaire',alias:['note','commentaire','comment','motif']}}},
 utilisateurs:{label:'Utilisateurs',description:'Archive à vérifier : les accès et mots de passe ne sont jamais importés.',champs:{reference:{label:'Nom ou e-mail',obligatoire:true,alias:['nom','email','e-mail','mail','utilisateur','user','name']},commentaire:{label:'Rôle ou note',alias:['rôle','role','note','commentaire','comment']}}}
};
let transfertAncienForm=null;
function normaliserCleTransfert(v){return String(v??'').trim().toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function defTransfertAncien(type){return TRANSFERT_ANCIEN_TYPES[type]||TRANSFERT_ANCIEN_TYPES.produits}
function valeursTransfertAncien(){return Object.keys(TRANSFERT_ANCIEN_TYPES)}
function valeurTransfertAncien(row,mapping,champ){const col=mapping&&mapping[champ];return col?String(row&&row[col]!==undefined?row[col]:'').trim():''}
function uniteImportee(v){
 const n=normaliserCleTransfert(v),aliases={bouteille:'btl',bouteilles:'btl',btl:'btl',unite:'u',unites:'u',piece:'u',pieces:'u',litre:'L',litres:'L',l:'L',centilitre:'cl',centilitres:'cl',cl:'cl',millilitre:'ml',millilitres:'ml',ml:'ml',kilogramme:'kg',kilogrammes:'kg',kg:'kg',gramme:'g',grammes:'g',g:'g',carton:'carton',cartons:'carton'};
 return aliases[n]||UNITES.find(function(u){return normaliserCleTransfert(u)===n})||'';
}
function emplacementImporte(v){
 const cle=normaliserCleTransfert(v),locations=(st.inventory&&Array.isArray(st.inventory.locations)?st.inventory.locations:INV_EMPLACEMENTS_DEFAUT||[]);
 const trouve=locations.find(function(l){return normaliserCleTransfert(l.id)===cle||normaliserCleTransfert(l.n)===cle});
 return trouve?trouve.id:'';
}
function categorieImportee(v){const cle=normaliserCleTransfert(v),trouve=(INV_CATEGORIES||[]).find(function(c){return normaliserCleTransfert(c.id)===cle||normaliserCleTransfert(c.n)===cle});return trouve?trouve.id:''}
function nombreTransfere(v){
 let s=String(v??'').trim().replace(/\s/g,'');
 if(!s)return{vide:true,valeur:null};
 if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');
 if(!/^-?\d+(\.\d+)?$/.test(s))return{vide:false,invalide:true,valeur:null};
 const valeur=Number(s);return Number.isFinite(valeur)?{vide:false,valeur:valeur}:{vide:false,invalide:true,valeur:null};
}
function parserCsvTransfert(text){
 const premiereLigne=String(text).split(/\r?\n/).find(function(ligne){return ligne.trim()!==''})||'';
 const separateur=(premiereLigne.match(/;/g)||[]).length>=(premiereLigne.match(/,/g)||[]).length?';':',';
 const lignes=[[]];let cellule='',entreGuillemets=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],suivant=text[i+1];
  if(c==='"'&&entreGuillemets&&suivant==='"'){cellule+='"';i++;continue}
  if(c==='"'){entreGuillemets=!entreGuillemets;continue}
  if(c===separateur){lignes[lignes.length-1].push(cellule.trim());cellule='';continue}
  if(c==='\n'||c==='\r'){if(c==='\r'&&suivant==='\n')i++;lignes[lignes.length-1].push(cellule.trim());cellule='';lignes.push([]);continue}
  cellule+=c;
 }
 lignes[lignes.length-1].push(cellule.trim());
 const utiles=lignes.filter(function(l){return l.some(function(x){return String(x).trim()!==''})});
 if(utiles.length<2)throw new Error('Le fichier doit contenir une ligne de titres et au moins une ligne de données.');
 const vus={},headers=utiles[0].map(function(v,index){let nom=String(v||'Colonne '+(index+1)).replace(/^\uFEFF/,'').trim()||'Colonne '+(index+1);const base=nom;let n=2;while(vus[nom])nom=base+' ('+(n++)+')';vus[nom]=true;return nom});
 return{headers:headers,lignes:utiles.slice(1).map(function(cells){const row={};headers.forEach(function(h,index){row[h]=cells[index]===undefined?'':cells[index]});return row})};
}
function parserJsonTransfert(text){
 let source=JSON.parse(text);
 if(!Array.isArray(source)&&source&&typeof source==='object')source=source.data||source.rows||source.items||Object.values(source).find(Array.isArray);
 if(!Array.isArray(source)||!source.length)throw new Error('Le JSON doit contenir une liste de données.');
 const lignes=source.map(function(row){return row&&typeof row==='object'&&!Array.isArray(row)?row:{valeur:row}});
 const headers=[];lignes.forEach(function(row){Object.keys(row).forEach(function(k){if(!headers.includes(k))headers.push(k)})});
 if(!headers.length)throw new Error('Aucune colonne détectée dans le fichier.');
 return{headers:headers,lignes:lignes};
}
async function lireFichierTransfert(fichier){
 if(!fichier)throw new Error('Sélectionnez un fichier.');
 if(fichier.size>15*1024*1024)throw new Error('Le fichier dépasse 15 Mo. Découpez-le avant de l’importer.');
 const texte=await lireTexteFichier(fichier);
 if(/\.json$/i.test(fichier.name)||/json/i.test(fichier.type||''))return parserJsonTransfert(texte);
 return parserCsvTransfert(texte);
}
function mappingAutomatiqueTransfert(type,headers){
 const champs=defTransfertAncien(type).champs,cles=headers.map(normaliserCleTransfert),mapping={};
 Object.entries(champs).forEach(function(pair){
  const champ=pair[0],conf=pair[1],cibles=(conf.alias||[]).map(normaliserCleTransfert);let index=cles.findIndex(function(c){return cibles.includes(c)});
  if(index<0)index=cles.findIndex(function(c){return cibles.some(function(a){return a&&c&&(c.includes(a)||a.includes(c))})});
  mapping[champ]=index>=0?headers[index]:'';
 });
 return mapping;
}
function optionsMappingTransfert(headers,selection){return '<option value="">Ne pas associer</option>'+headers.map(function(h){return '<option value="'+escapeHTML(h)+'"'+(h===selection?' selected':'')+'>'+escapeHTML(h)+'</option>'}).join('')}
function ligneErreurTransfert(index,texte){return 'Ligne '+(index+2)+' : '+texte}
function analyserTransfertAncien(form){
 const type=form.type,conf=defTransfertAncien(type),erreurs=[],alertes=[],valides=[],vus=new Set();
 const existantsProduits=new Set((st.prods||[]).map(function(p){return normaliserCleTransfert(p.n)}));
 const existantsFournisseurs=new Set((st.fournisseurs||[]).map(function(f){return normaliserCleTransfert(f.n)}));
 (form.lignes||[]).forEach(function(row,index){
  let correcte=true;
  Object.entries(conf.champs).forEach(function(pair){if(pair[1].obligatoire&&!valeurTransfertAncien(row,form.mapping,pair[0])){erreurs.push(ligneErreurTransfert(index,'champ obligatoire absent : '+pair[1].label+'.'));correcte=false}});
  if(type==='produits'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'nom'));
   const unite=uniteImportee(valeurTransfertAncien(row,form.mapping,'unite'));
   if(valeurTransfertAncien(row,form.mapping,'unite')&&!unite){erreurs.push(ligneErreurTransfert(index,'unité non reconnue.'));correcte=false}
   if(nom&&(vus.has(nom)||existantsProduits.has(nom))){alertes.push(ligneErreurTransfert(index,'produit déjà présent : il sera ignoré.'));correcte=false}
   if(nom)vus.add(nom);
   ['prix','seuil','stock'].forEach(function(champ){const valeur=valeurTransfertAncien(row,form.mapping,champ),n=nombreTransfere(valeur);if(valeur&&n.invalide){erreurs.push(ligneErreurTransfert(index,defTransfertAncien(type).champs[champ].label+' invalide.'));correcte=false}});
  }else if(type==='fournisseurs'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'nom')),email=valeurTransfertAncien(row,form.mapping,'email');
   if(nom&&(vus.has(nom)||existantsFournisseurs.has(nom))){alertes.push(ligneErreurTransfert(index,'fournisseur déjà présent : il sera ignoré.'));correcte=false}
   if(nom)vus.add(nom);
   if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){erreurs.push(ligneErreurTransfert(index,'adresse e-mail invalide.'));correcte=false}
  }else if(type==='stocks'){
   const nom=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'produit')),quantite=nombreTransfere(valeurTransfertAncien(row,form.mapping,'quantite'));
   if(nom&&!existantsProduits.has(nom)){alertes.push(ligneErreurTransfert(index,'produit absent d’INVO : aucune quantité ne sera appliquée.'));correcte=false}
   if(quantite.invalide){erreurs.push(ligneErreurTransfert(index,'quantité invalide.'));correcte=false}
   if(nom&&vus.has(nom)){alertes.push(ligneErreurTransfert(index,'produit dupliqué dans ce fichier : une seule ligne est admise.'));correcte=false}
   if(nom)vus.add(nom);
  }else{
   const ref=normaliserCleTransfert(valeurTransfertAncien(row,form.mapping,'reference'));
   if(ref&&vus.has(ref)){alertes.push(ligneErreurTransfert(index,'référence dupliquée : elle sera ignorée.'));correcte=false}
   if(ref)vus.add(ref);
  }
  if(correcte)valides.push(row);
 });
 return{valides:valides,erreurs:erreurs,alertes:alertes};
}
function nomStatutTransfert(statut){return statut==='importé'?'Importé':statut==='à compléter'?'À compléter':'À vérifier'}
function classeStatutTransfert(statut){return statut==='importé'?'done':statut==='à compléter'?'todo':''}
function escapeTableTransfert(v){const s=String(v??'');return escapeHTML(s.length>90?s.slice(0,87)+'…':s)}
function transfertDonneesHTML(){
 const brouillons=(st.legacyTransfers||[]).slice(0,8);
 const liste=brouillons.length?'<div class="transfer-draft-list">'+brouillons.map(function(x){return '<div class="transfer-draft"><span><b>'+escapeHTML(defTransfertAncien(x.type).label)+' · '+escapeHTML(x.fileName||'Fichier sans nom')+'</b><small>'+escapeHTML(String((x.lignes||[]).length))+' ligne(s) préparée(s) · '+escapeHTML(formatDateHistoriqueAudit(x.cree))+'</small></span><span style="display:flex;align-items:center;gap:8px"><span class="transfer-status '+classeStatutTransfert(x.statut)+'">'+nomStatutTransfert(x.statut)+'</span><button class="settings-text-button" data-transfer-review="'+escapeHTML(x.id)+'">Ouvrir'+settingsIcon('arrow')+'</button></span></div>'}).join('')+'</div>':'<p class="transfer-note">Aucun transfert préparé. Les fichiers sont analysés localement avant toute modification.</p>';
 return '<section class="settings-group"><div class="settings-group-title">'+settingsIcon('transfer')+'<span>Transférer mes données</span></div><div class="settings-card"><div class="settings-mini-action"><span>'+settingsIcon('transfer')+'<span><b>Reprendre des données existantes</b><small>Fichier CSV ou JSON · aucune donnée INVO n’est modifiée sans votre validation finale.</small></span></span><button class="settings-text-button" id="transferStart">Démarrer'+settingsIcon('arrow')+'</button></div><div class="settings-mini-action"><span>'+settingsIcon('hardware')+'<span><b>Connexion à un ancien logiciel</b><small>Disponible lorsque son API ou un connecteur partenaire est configuré.</small></span></span><button class="settings-text-button transfer-source-disabled" id="transferSource" aria-disabled="true">À configurer</button></div></div></section><section class="settings-group"><div class="settings-group-title">'+settingsIcon('backup')+'<span>Parcours contrôlé</span></div><div class="transfer-steps"><div class="transfer-step"><b><strong>1</strong>Choisir</b>Le type de données et le fichier source.</div><div class="transfer-step"><b><strong>2</strong>Vérifier</b>Colonnes, erreurs et doublons détectés.</div><div class="transfer-step"><b><strong>3</strong>Valider</b>Confirmation humaine avant tout import.</div></div><p class="transfer-note"><b>Protection du stock :</b> une quantité importée reste sans effet jusqu’à la validation finale. Sur GitHub Pages, ce contrôle reste local à l’appareil ; une traçabilité inviolable exige un backend.</p></section><section class="settings-group"><div class="settings-group-title">'+settingsIcon('backup')+'<span>Transferts préparés</span></div>'+liste+'</section>';
}
function renduApercuTransfert(form,analyse){
 const visibles=(form.lignes||[]).slice(0,5),headers=(form.headers||[]).slice(0,7);
 const table=visibles.length?'<div class="transfer-preview"><table><thead><tr>'+headers.map(function(h){return '<th>'+escapeHTML(h)+'</th>'}).join('')+'</tr></thead><tbody>'+visibles.map(function(row){return '<tr>'+headers.map(function(h){return '<td>'+escapeTableTransfert(row[h])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>':'';
 const erreurs=analyse.erreurs.length?'<div class="transfer-warning transfer-error"><b>'+analyse.erreurs.length+' erreur(s) à corriger</b><br>'+analyse.erreurs.slice(0,4).map(escapeHTML).join('<br>')+(analyse.erreurs.length>4?'<br>…':'')+'</div>':'';
 const alertes=analyse.alertes.length?'<div class="transfer-warning"><b>'+analyse.alertes.length+' alerte(s)</b><br>'+analyse.alertes.slice(0,4).map(escapeHTML).join('<br>')+(analyse.alertes.length>4?'<br>…':'')+'</div>':'';
 return '<div class="transfer-summary"><div><b>'+form.lignes.length+'</b>lignes lues</div><div><b>'+analyse.valides.length+'</b>lignes prêtes</div><div><b>'+analyse.erreurs.length+'</b>erreurs à corriger</div></div>'+erreurs+alertes+table;
}
function ouvrirTransfertDonnees(){
 transfertAncienForm={type:'produits',headers:[],lignes:[],mapping:{},fileName:'',analyse:null};
 afficherTransfertDonnees();
}
function afficherTransfertDonnees(){
 const form=transfertAncienForm;if(!form)return;
 const conf=defTransfertAncien(form.type);if(!Object.keys(form.mapping||{}).length)form.mapping=mappingAutomatiqueTransfert(form.type,form.headers||[]);
 const analyse=form.lignes.length?analyserTransfertAncien(form):null;form.analyse=analyse;
 const champs=form.lignes.length?'<div class="transfer-form-grid">'+Object.entries(conf.champs).map(function(pair){const champ=pair[0],meta=pair[1];return '<div class="fld"><label>'+escapeHTML(meta.label)+(meta.obligatoire?' *':'')+'</label><select data-transfer-map="'+escapeHTML(champ)+'">'+optionsMappingTransfert(form.headers,form.mapping[champ])+'</select></div>'}).join('')+'</div>'+renduApercuTransfert(form,analyse):'<p class="transfer-note">Le fichier ne quitte pas cet appareil. Après lecture, INVO affichera les colonnes, la prévisualisation et les problèmes à corriger.</p>';
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="transferBg"><div class="sheet transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transferTitle"><h3 id="transferTitle">Transférer mes données</h3><p class="sh-sub">1. Choisissez les données · 2. vérifiez leur lecture · 3. validez uniquement ce que vous souhaitez importer.</p><div class="transfer-form-grid"><div class="fld"><label for="transferType">Données à importer</label><select id="transferType">'+valeursTransfertAncien().map(function(type){return '<option value="'+type+'"'+(type===form.type?' selected':'')+'>'+escapeHTML(defTransfertAncien(type).label)+'</option>'}).join('')+'</select></div><div class="fld"><label for="transferFile">Fichier CSV ou JSON</label><input id="transferFile" type="file" accept=".csv,.json,text/csv,application/json"></div></div><p class="transfer-note"><b>'+escapeHTML(conf.label)+' :</b> '+escapeHTML(conf.description)+(form.fileName?' · Fichier : <b>'+escapeHTML(form.fileName)+'</b>':'')+'</p>'+champs+'<div class="sh-actions"><button class="btn btn-2" id="transferCancel">Annuler</button>'+(form.lignes.length?'<button class="btn" id="transferPrepare" '+(!analyse.valides.length?'disabled':'')+'>Préparer la vérification</button>':'')+'</div></div></div>';
 document.getElementById('transferBg').onclick=function(e){if(e.target.id==='transferBg')closeModal()};
 document.getElementById('transferCancel').onclick=closeModal;
 document.getElementById('transferType').onchange=function(e){form.type=e.target.value;form.mapping=mappingAutomatiqueTransfert(form.type,form.headers||[]);afficherTransfertDonnees()};
 document.getElementById('transferFile').onchange=async function(e){const fichier=e.target.files&&e.target.files[0];if(!fichier)return;try{const lu=await lireFichierTransfert(fichier);form.headers=lu.headers;form.lignes=lu.lignes;form.fileName=fichier.name;form.mapping=mappingAutomatiqueTransfert(form.type,lu.headers);afficherTransfertDonnees()}catch(err){toast(err&&err.message?err.message:'Fichier impossible à lire.')}};
 document.querySelectorAll('[data-transfer-map]').forEach(function(select){select.onchange=function(){form.mapping[select.dataset.transferMap]=select.value;afficherTransfertDonnees()}});
 const preparer=document.getElementById('transferPrepare');if(preparer)preparer.onclick=preparerTransfertDonnees;
}
async function preparerTransfertDonnees(){
 const form=transfertAncienForm,analyse=analyserTransfertAncien(form);
 if(!analyse.valides.length){toast('Aucune ligne ne peut être préparée : corrigez les erreurs ou les associations.');return}
 const brouillon={id:uid('transfer'),type:form.type,fileName:form.fileName,cree:new Date().toISOString(),statut:'à vérifier',mapping:Object.assign({},form.mapping),lignes:analyse.valides,erreurs:analyse.erreurs,alertes:analyse.alertes};
 st.legacyTransfers.unshift(brouillon);await save();
 ajouterHistoriqueAudit('Transfert préparé',defTransfertAncien(form.type).label,'Aucune donnée modifiée',analyse.valides.length+' ligne(s) à vérifier','Fichier '+form.fileName+' · validation humaine requise');
 transfertAncienForm=null;closeModal();openReglages('donnees');toast('Transfert préparé : vérifiez-le avant de valider.');
}
function ouvrirRevueTransfert(id){
 const transfert=(st.legacyTransfers||[]).find(function(x){return x.id===id});if(!transfert)return;
 const analyse={valides:transfert.lignes||[],erreurs:transfert.erreurs||[],alertes:transfert.alertes||[]};
 const form={type:transfert.type,headers:Object.keys((transfert.lignes||[])[0]||{}),lignes:transfert.lignes||[],mapping:transfert.mapping||{}};
 const priseEnCharge=['produits','fournisseurs','stocks'].includes(transfert.type);
 const action=transfert.statut==='à vérifier'?(priseEnCharge?'Valider l’import':'Conserver pour reprise manuelle'):'Fermer';
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="transferReviewBg"><div class="sheet transfer-modal" role="dialog" aria-modal="true"><h3>Vérifier le transfert</h3><p class="sh-sub">'+escapeHTML(defTransfertAncien(transfert.type).label)+' · '+escapeHTML(transfert.fileName||'Fichier sans nom')+'</p>'+renduApercuTransfert(form,analyse)+(priseEnCharge?'<p class="transfer-note"><b>Validation finale :</b> les '+(transfert.type==='stocks'?'quantités de stock':'données')+' ci-dessus seront appliquées seulement après votre confirmation. Les doublons signalés restent exclus.</p>':'<p class="transfer-note"><b>Reprise manuelle :</b> ce type est archivé avec ses colonnes et ses lignes. INVO ne le convertit pas automatiquement car le modèle de données doit être contrôlé au cas par cas.</p>')+'<div class="sh-actions"><button class="btn btn-2" id="transferReviewClose">Fermer</button>'+(transfert.statut==='à vérifier'?'<button class="btn" id="transferValidate">'+action+'</button>':'')+'</div></div></div>';
 document.getElementById('transferReviewBg').onclick=function(e){if(e.target.id==='transferReviewBg')closeModal()};
 document.getElementById('transferReviewClose').onclick=closeModal;
 const valider=document.getElementById('transferValidate');if(valider)valider.onclick=function(){validerTransfertDonnees(transfert.id)};
}
function produitParNomTransfere(nom){const cle=normaliserCleTransfert(nom);return(st.prods||[]).find(function(p){return normaliserCleTransfert(p.n)===cle})}
function appliquerProduitTransfere(row,mapping){
 const n=valeurTransfertAncien(row,mapping,'nom'),unite=uniteImportee(valeurTransfertAncien(row,mapping,'unite')),prix=nombreTransfere(valeurTransfertAncien(row,mapping,'prix')),seuil=nombreTransfere(valeurTransfertAncien(row,mapping,'seuil')),stock=nombreTransfere(valeurTransfertAncien(row,mapping,'stock'));
 if(!n||!unite||produitParNomTransfere(n))return null;
 const id=uid('m'),emplacement=emplacementImporte(valeurTransfertAncien(row,mapping,'emplacement'));
 const z=emplacement||'reserve';
 const produit={id:id,n:n,i:'📦',u:unite,px:prix.valeur===null?0:prix.valeur,seuil:seuil.valeur===null?0:seuil.valeur,s:stock.valeur===null?0:stock.valeur,dlc:0,z:z,emplacements:[z],invCategory:categorieImportee(valeurTransfertAncien(row,mapping,'categorie')),fo:valeurTransfertAncien(row,mapping,'fournisseur'),displayOrder:produitsZone(z).length};
 st.prods.push(produit);if(stock.valeur!==null)st.stock[id]=stock.valeur;return{produit:produit,stock:stock.valeur};
}
async function validerTransfertDonnees(id){
 const transfert=(st.legacyTransfers||[]).find(function(x){return x.id===id});if(!transfert||transfert.statut!=='à vérifier')return;
 const type=transfert.type,rows=transfert.lignes||[];
 if(!['produits','fournisseurs','stocks'].includes(type)){
  if(!confirm('Conserver ce transfert en attente de reprise manuelle ? Aucune donnée INVO ne sera modifiée.'))return;
  transfert.statut='à compléter';transfert.valideLe=new Date().toISOString();await save();
  ajouterHistoriqueAudit('Transfert à compléter',defTransfertAncien(type).label,'Aucune donnée modifiée',rows.length+' ligne(s) archivées','Reprise manuelle nécessaire');
  closeModal();openReglages('donnees');toast('Transfert conservé pour reprise manuelle.');return;
 }
 const message=type==='stocks'?'Appliquer les quantités de stock après cette vérification humaine ?':'Importer les '+rows.length+' ligne(s) vérifiées ?';
 if(!confirm(message))return;
 let ajouts=0,stocksModifies=0,ignores=0;
 if(type==='produits')rows.forEach(function(row){const resultat=appliquerProduitTransfere(row,transfert.mapping);if(!resultat){ignores++;return}ajouts++;if(resultat.stock!==null){stocksModifies++;ajouterHistoriqueAudit('Stock transféré',resultat.produit.n,'—',fmtQ(resultat.stock)+' '+resultat.produit.u,'Import validé manuellement')}});
 if(type==='fournisseurs')rows.forEach(function(row){const nom=valeurTransfertAncien(row,transfert.mapping,'nom');if(fournisseurParNom(nom)){ignores++;return}st.fournisseurs.push({id:uid('fo'),n:nom,mail:valeurTransfertAncien(row,transfert.mapping,'email')});ajouts++});
 if(type==='stocks')rows.forEach(function(row){const produit=produitParNomTransfere(valeurTransfertAncien(row,transfert.mapping,'produit')),quantite=nombreTransfere(valeurTransfertAncien(row,transfert.mapping,'quantite'));if(!produit||quantite.valeur===null){ignores++;return}const avant=st.stock[produit.id]??0;st.stock[produit.id]=quantite.valeur;stocksModifies++;ajouterHistoriqueAudit('Stock transféré',produit.n,fmtQ(avant)+' '+produit.u,fmtQ(quantite.valeur)+' '+produit.u,'Import validé manuellement')});
 assurerFournisseurs();transfert.statut='importé';transfert.valideLe=new Date().toISOString();transfert.resultat={ajouts:ajouts,stocksModifies:stocksModifies,ignores:ignores};
 await save();ajouterHistoriqueAudit('Transfert validé',defTransfertAncien(type).label,'Aucune donnée modifiée avant validation',ajouts+' ajout(s) · '+stocksModifies+' stock(s) appliqué(s)','Validation humaine explicite');
 closeModal();renderAll();openReglages('donnees');toast('Transfert validé : '+ajouts+' ajout(s), '+stocksModifies+' stock(s) appliqué(s).');
}

function coutMat(id,q){const c=item(id);if(!c)return 0;let v=0;
for(const [pid,x] of Object.entries(c.f||{}))v+=qteFicheEnStock(c,pid,x*q)*(prod(pid)?.px||0);return v}
const coutMv=m=>coutMat(m.plat,m.qty);
const pvMv=m=>{const c=item(m.plat);return c?c.pv*m.qty:0};
