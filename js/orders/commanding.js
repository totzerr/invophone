/* ── Fournisseurs et commandes : stock uniquement après réception validée. ── */
function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function assurerFournisseurs(){
 if(!Array.isArray(st.fournisseurs))st.fournisseurs=[];
 const vus=new Set(st.fournisseurs.map(function(f){return String(f.n||'').trim().toLowerCase()}).filter(Boolean));
 (st.prods||[]).forEach(function(p){const n=String(p.fo||'').trim();if(n&&!vus.has(n.toLowerCase())){st.fournisseurs.push({id:uid('fo'),n:n,mail:''});vus.add(n.toLowerCase())}});
 (st.prods||[]).forEach(function(p){(p.fournisseurs||[]).forEach(function(o){const n=String(o&&o.n||'').trim();if(n&&!vus.has(n.toLowerCase())){st.fournisseurs.push({id:uid('fo'),n:n,mail:''});vus.add(n.toLowerCase())}})});
}
function fournisseurParNom(n){return(st.fournisseurs||[]).find(function(f){return String(f.n).toLowerCase()===String(n).toLowerCase()})}
function conseilCommande(p){
 const stock=num(st.stock[p.id]??0),previsions=previsionIndex(),tendance=previsions.map[p.id];
 if(!tendance||!previsions.pv.fiable||num(tendance.parJour)<=0)return{q:0,stock:stock,fiable:false,raison:'Pas assez de ventes reliées aux fiches techniques pour conseiller une commande.'};
 const parJour=num(tendance.parJour),joursStock=stock/parJour,cible=Math.max(num(p.seuil),parJour*7),q=Math.max(0,Math.ceil((cible-stock)*10)/10);
 return{q:q,stock:stock,fiable:true,parJour:parJour,joursStock:joursStock,cibleJours:7};
}
function qteSuggeree(p){return conseilCommande(p).q}
function offresFournisseursProduit(p){const offres=[];const ajouter=function(n,px){n=String(n||'').trim();px=num(px);if(!n)return;const existe=offres.find(function(o){return o.n.toLowerCase()===n.toLowerCase()});if(!existe)offres.push({n:n,px:px});else if(px>0&&(!existe.px||px<existe.px))existe.px=px};ajouter(p&&p.fo,p&&p.px);(p&&p.fournisseurs||[]).forEach(function(o){ajouter(o&&o.n,o&&o.px)});return offres.sort(function(a,b){return(a.px||Infinity)-(b.px||Infinity)||a.n.localeCompare(b.n,'fr')})}
function offreFournisseurProduit(p,fournisseur){return offresFournisseursProduit(p).find(function(o){return o.n===fournisseur})||null}
function cleQteCommande(p,fournisseur){return String(fournisseur||'')+'::'+p.id}
function conditionnementCommande(p,fournisseur){const cle=cleQteCommande(p,fournisseur),v=st.cmdConditionnement&&st.cmdConditionnement[cle];return v==='carton'?'carton':'unite'}
function qteCommande(p,fournisseur){const cle=cleQteCommande(p,fournisseur),v=st.cmdQ&&st.cmdQ[cle];return v!==undefined?num(v):(conditionnementCommande(p,fournisseur)==='carton'?0:qteSuggeree(p))}
function libelleConditionnementCommande(conditionnement,q){return conditionnement==='carton'?fmtQ(q)+' carton'+(num(q)>1?'s':''):fmtQ(q)+' unité'+(num(q)>1?'s':'')}
/* Une commande conserve la trace de chacune de ses réceptions validées. */
function quantitesRecuesCommande(commandeId){
 const recues={unite:{},carton:{}};
 (st.liv||[]).filter(function(l){return String(l.commandeId||'')===String(commandeId)}).forEach(function(l){
  (l.lines||[]).forEach(function(x){const dest=x.conditionnement==='carton'?recues.carton:recues.unite;dest[x.id]=(dest[x.id]||0)+num(x.conditionnement==='carton'?x.qCarton:x.q)});
 });
 return recues;
}
function lignesRestantesCommande(commande){
 if(!commande)return[];
 const recues=quantitesRecuesCommande(commande.id);
 return (commande.lines||[]).map(function(l){
  const conditionnement=l.conditionnement==='carton'?'carton':'unite',recu=num(recues[conditionnement][l.id]||0);
  return{id:l.id,q:Math.max(0,num(l.q)-recu),px:l.px,conditionnement:conditionnement};
 }).filter(function(l){return l.id&&l.q>0.000001});
}
function commandeComplete(commande){return lignesRestantesCommande(commande).length===0}
function dateLocale(v){if(!v)return'à définir';const d=new Date(v+'T12:00:00');return isNaN(d)?'à définir':d.toLocaleDateString('fr-FR')}
function statutCommande(c){
 if(c.statut==='recu')return{txt:'Réceptionnée',cls:'ok'};
 if(c.statut==='partielle')return{txt:'Réception partielle',cls:'warn'};
 if(c.statut==='annulee')return{txt:'Annulée',cls:'muted'};
 return c.dateLiv&&c.dateLiv<=new Date().toISOString().slice(0,10)?{txt:'À vérifier',cls:'warn'}:{txt:'Préparée',cls:'info'};
}
function texteCommande(c){
 const nl=String.fromCharCode(10),f=fournisseurParNom(c.fournisseur);let txt='COMMANDE INVO'+nl+nl+'Fournisseur : '+c.fournisseur+nl+'Livraison souhaitée : '+dateLocale(c.dateLiv)+nl+nl;
 c.lines.forEach(function(l){const p=prod(l.id);if(p)txt+='• '+p.n+' : '+libelleConditionnementCommande(l.conditionnement,l.q)+nl});
 if(String(c.note||'').trim())txt+=nl+'━━━━━━━━━━━━━━━━━━━━'+nl+'NOTES POUR LE FOURNISSEUR'+nl+'━━━━━━━━━━━━━━━━━━━━'+nl+String(c.note).trim()+nl;
 if(f&&f.mail)txt+=nl+'Contact : '+f.mail;return txt;
}
function envoyerCommandeFournisseur(id){
 const c=(st.commandes||[]).find(function(x){return x.id===id});if(!c)return false;
 const mode=ouvrirSignalementFournisseur(c.fournisseur,'INVO · Commande du '+dateLocale(String(c.cree||'').slice(0,10)),texteCommande(c));
 toast(mode==='mail'?'E-mail prérempli : relis les notes puis envoie-le toi-même.':'Commande copiée. Ajoute l’e-mail du fournisseur pour l’ouvrir directement.');return mode;
}
function analyserReception(form){
 const commande=form&&form.commandId?(st.commandes||[]).find(function(c){return c.id===form.commandId}):null;
 const lignes=(form&&form.lines||[]).filter(function(l){return l&&l.id}).map(function(l){
  const p=prod(l.id),attendu=Math.max(0,num(l.attendu)),recu=Math.max(0,num(l.q)),conditionnement=l.conditionnement==='carton'?'carton':'unite',recuCommande=conditionnement==='carton'?Math.max(0,num(l.qCarton)):recu;
  const prixCommande=Math.max(0,num(l.prixCommande)),prixRecu=Math.max(0,num(l.px));
  const manquant=attendu>recuCommande+.0001?attendu-recuCommande:0,surplus=attendu>0&&recuCommande>attendu+.0001?recuCommande-attendu:0;
  const hausse=prixCommande>0&&prixRecu>prixCommande+.0001?prixRecu-prixCommande:0;
  const baisse=prixCommande>0&&prixRecu>0&&prixRecu<prixCommande-.0001?prixCommande-prixRecu:0;
  return{id:l.id,n:p?p.n:'Produit',u:p?p.u:'',attendu:attendu,recu:recu,recuCommande:recuCommande,conditionnement:conditionnement,prixCommande:prixCommande,prixRecu:prixRecu,
   manquant:manquant,surplus:surplus,hausse:hausse,baisse:baisse,inattendu:!!commande&&attendu<=.0001};
 });
 return{commande:commande,fournisseur:form&&form.fo||commande&&commande.fournisseur||'',lignes:lignes,
  manquants:lignes.filter(function(l){return l.manquant>0}),surplus:lignes.filter(function(l){return l.surplus>0}),
  hausses:lignes.filter(function(l){return l.hausse>0}),baisses:lignes.filter(function(l){return l.baisse>0}),
  inattendus:lignes.filter(function(l){return l.inattendu})};
}
function ouvrirSignalementFournisseur(nom,objet,texte){
 const f=fournisseurParNom(nom),mail=f&&String(f.mail||'').trim();
 if(mail){window.location.href='mailto:'+encodeURIComponent(mail)+'?subject='+encodeURIComponent(objet)+'&body='+encodeURIComponent(texte);return'mail'}
 copyText(texte);return'copie';
}
function controleReceptionHTML(form){
 const r=analyserReception(form);if(!r.commande)return'';
 const lignes=[];
 r.manquants.forEach(function(l){lignes.push('<div class="reception-control-line"><i></i><span><b>Manquant</b> · '+escapeHTML(l.n)+' : '+libelleConditionnementCommande(l.conditionnement,l.manquant)+' non reçu</span></div>')});
 r.surplus.forEach(function(l){lignes.push('<div class="reception-control-line extra"><i></i><span><b>Quantité en plus</b> · '+escapeHTML(l.n)+' : '+libelleConditionnementCommande(l.conditionnement,l.surplus)+' au-delà de la commande</span></div>')});
 r.inattendus.forEach(function(l){lignes.push('<div class="reception-control-line extra"><i></i><span><b>Ligne non prévue</b> · '+escapeHTML(l.n)+' sera ajoutée seulement si tu la valides</span></div>')});
 r.hausses.forEach(function(l){const pct=Math.round(l.hausse/l.prixCommande*100);lignes.push('<div class="reception-control-line price"><i></i><span><b>Prix en hausse</b> · '+escapeHTML(l.n)+' : '+fmt(l.prixCommande)+' € → '+fmt(l.prixRecu)+' € (+'+pct+' %)</span></div>')});
 r.baisses.forEach(function(l){const pct=Math.round(l.baisse/l.prixCommande*100);lignes.push('<div class="reception-control-line"><i></i><span><b>Prix en baisse</b> · '+escapeHTML(l.n)+' : '+fmt(l.prixCommande)+' € → '+fmt(l.prixRecu)+' € (-'+pct+' %)</span></div>')});
 const ecarts=lignes.length>0;
 return'<div class="reception-control '+(ecarts?'warn':'ok')+'"><div class="reception-control-head"><b>Contrôle avant validation</b><span class="reception-control-state">'+(ecarts?'Écart à vérifier':'Commande conforme')+'</span></div>'+
  (ecarts?'<div class="reception-control-list">'+lignes.join('')+'</div><button class="btn btn-2 btn-sm" id="reportReceptionSupplier">Préparer le signalement fournisseur</button>':'<div class="reception-control-list"><div class="reception-control-line"><i></i><span>Quantités et prix saisis conformes à la commande.</span></div></div>')+'</div>';
}
function majControleLiv(){
 const cible=document.getElementById('livControl');if(!cible)return;
 cible.innerHTML=controleReceptionHTML(livForm);
 const signaler=document.getElementById('reportReceptionSupplier');if(signaler)signaler.onclick=signalerEcartsReception;
}
function signalerEcartsReception(){
 const r=analyserReception(livForm);if(!r.commande)return false;
 if(!r.manquants.length&&!r.surplus.length&&!r.inattendus.length&&!r.hausses.length)return toast('Aucun écart à signaler pour cette réception.');
 let texte='SIGNALEMENT RÉCEPTION INVO\\n\\nFournisseur : '+r.fournisseur+'\\nCommande du : '+dateLocale(String(r.commande.cree||'').slice(0,10))+'\\n\\n';
 if(r.manquants.length){texte+='PRODUITS MANQUANTS\\n';r.manquants.forEach(function(l){texte+='• '+l.n+' : '+fmtQ(l.manquant)+' '+l.u+' manquant\\n'});texte+='\\n'}
 if(r.hausses.length){texte+='PRIX À CONFIRMER\\n';r.hausses.forEach(function(l){texte+='• '+l.n+' : '+fmt(l.prixCommande)+' € → '+fmt(l.prixRecu)+' €\\n'});texte+='\\n'}
 if(r.surplus.length||r.inattendus.length){texte+='LIGNES À CONFIRMER\\n';r.surplus.forEach(function(l){texte+='• '+l.n+' : '+fmtQ(l.surplus)+' '+l.u+' en plus\\n'});r.inattendus.forEach(function(l){texte+='• '+l.n+' : ligne non prévue à la commande\\n'});texte+='\\n'}
 texte+='Merci de nous confirmer la disponibilité, le délai ou le prix applicable.';
 const mode=ouvrirSignalementFournisseur(r.fournisseur,'INVO · Écart de réception',texte);
 toast(mode==='mail'?'E-mail prérempli : vérifie-le puis envoie-le toi-même.':'Signalement copié. Ajoute l’e-mail du fournisseur pour l’ouvrir directement.');
 return mode;
}
function copierLignesReception(lignes){return(lignes||[]).map(function(l){return Object.assign({},l)})}
function lignesBrouillonCommande(fournisseur){return(st.prods||[]).filter(function(p){return!!offreFournisseurProduit(p,fournisseur)}).map(function(p){const offre=offreFournisseurProduit(p,fournisseur);return{id:p.id,q:qteCommande(p,fournisseur),conditionnement:conditionnementCommande(p,fournisseur),px:offre&&offre.px>0?offre.px:p.px}}).filter(function(l){return l.q>0})}
async function sauvegarderBrouillonCommande(){
 const fournisseur=commandeFo,dateLiv=document.getElementById('cmdDelivery')?.value||'';
 if(!fournisseur)return toast('Ajoute ou sélectionne un fournisseur.');
 const existant=(st.commandeBrouillons||[]).find(function(b){return b.id===commandeBrouillonActif}),maintenant=new Date().toISOString();
 const brouillon={id:commandeBrouillonActif||uid('cmddraft'),fournisseur:fournisseur,dateLiv:dateLiv,cree:existant?existant.cree:maintenant,modifie:maintenant,lines:lignesBrouillonCommande(fournisseur),note:String(document.getElementById('cmdNotes')?.value||st.cmdNote||'').trim()};
 st.commandeBrouillons=st.commandeBrouillons||[];
 const index=st.commandeBrouillons.findIndex(function(b){return b.id===brouillon.id});if(index>=0)st.commandeBrouillons[index]=brouillon;else st.commandeBrouillons.unshift(brouillon);
 if(st.commandeBrouillons.length>20)st.commandeBrouillons.length=20;
 commandeBrouillonActif=brouillon.id;await save();renderCommanderScreen();toast('Brouillon de commande enregistré. Aucun envoi ni stock modifié.');
}
function ouvrirBrouillonCommande(id){
 const b=(st.commandeBrouillons||[]).find(function(x){return x.id===id});if(!b)return;
 commandeFo=b.fournisseur;commandeBrouillonActif=b.id;st.cmdQ={};st.cmdConditionnement={};
 (b.lines||[]).forEach(function(l){const p=prod(l.id);if(!p)return;const cle=cleQteCommande(p,b.fournisseur);st.cmdQ[cle]=l.q;st.cmdConditionnement[cle]=l.conditionnement==='carton'?'carton':'unite'});
 st.cmdNote=b.note||'';st.cmdDateLiv=b.dateLiv||'';renderCommanderScreen();toast('Brouillon repris. Vérifie-le avant de préparer la commande.');
}
async function supprimerBrouillonCommande(id){if(!confirm('Supprimer ce brouillon de commande ?'))return;st.commandeBrouillons=(st.commandeBrouillons||[]).filter(function(b){return b.id!==id});if(commandeBrouillonActif===id)commandeBrouillonActif=null;await save();renderCommanderScreen();toast('Brouillon supprimé.');}
function renderCommander(){
 assurerFournisseurs();
 const noms=(st.fournisseurs||[]).map(function(f){return f.n}).filter(Boolean).sort(function(a,b){return a.localeCompare(b,'fr')});
 if(!commandeFo||!noms.includes(commandeFo))commandeFo=noms[0]||'';
 const fournisseur=fournisseurParNom(commandeFo),produits=(st.prods||[]).filter(function(p){return!!offreFournisseurProduit(p,commandeFo)}),aujourd=new Date().toISOString().slice(0,10),dateCommande=st.cmdDateLiv||aujourd;
 const supplierMenu=noms.length?'<label class="cmd-supplier-select"><span>Fournisseur</span><select id="cmdSupplierSelect" aria-label="Choisir un fournisseur">'+noms.map(function(n){return'<option value="'+escapeHTML(n)+'" '+(n===commandeFo?'selected':'')+'>'+escapeHTML(n)+'</option>'}).join('')+'</select></label>':'<div class="hint">Ajoute ton premier fournisseur pour construire son catalogue.</div>';
 const produitsHTML=produits.length?produits.map(function(p){
  const dispo=st.stock[p.id]??0,bas=dispo<=p.seuil,conseil=conseilCommande(p),sug=conseil.q,cle=cleQteCommande(p,commandeFo),conditionnement=conditionnementCommande(p,commandeFo),q=qteCommande(p,commandeFo),prev=previsionIndex().map[p.id],badge=prev?badgePrev(prev):null,offres=offresFournisseursProduit(p),offre=offreFournisseurProduit(p,commandeFo),meilleure=offres[0],prix=offre&&offre.px>0?fmt(offre.px)+' €/'+p.u:'Prix à renseigner',choix=offres.length>1?(meilleure&&meilleure.n!==commandeFo?'<button class="cmd-best-link" data-cmdcheapest="'+p.id+'">Meilleur prix · '+escapeHTML(meilleure.n)+' · '+fmt(meilleure.px)+' €</button>':'<span class="cmd-best">Meilleur prix</span>'):'';
  const aideCarton=conditionnement==='carton'?'<small class="cmd-conditionnement-note">Le nombre de cartons est saisi par toi. La quantité stock sera vérifiée à la réception.</small>':'';
  const conseilTexte=!conseil.fiable?'<b>À décider manuellement</b> · '+conseil.raison:(sug>0?'<b>Conseil : commander '+fmtQ(sug)+' '+p.u+'</b> · ventes estimées '+fmtQ(conseil.parJour)+' '+p.u+'/jour · objectif '+conseil.cibleJours+' jours':'<b>Pas à commander</b> · stock actuel couvrant environ '+Math.max(0,Math.floor(conseil.joursStock))+' jours de ventes');
  return'<div class="cmd-product '+(bas?'low':'')+'"><div class="cmd-product-top"><span class="l-ico">'+p.i+'</span><span class="cmd-body"><b>'+escapeHTML(p.n)+'</b><small>Stock actuel : '+fmtQ(dispo)+' '+p.u+' · seuil '+fmtQ(p.seuil)+' '+p.u+(badge?' · '+badge.txt:'')+'</small><div class="cmd-price">Chez '+escapeHTML(commandeFo)+' · '+prix+choix+'</div></span><button class="mini-edit" data-cmdedit="'+p.id+'">Modifier</button></div><div class="cmd-advice '+(sug>0?'need':'hold')+'">'+conseilTexte+'</div><div class="cmd-order-line"><span>'+(conditionnement==='carton'?(sug>0?'Conseil en unités : '+fmtQ(sug)+' '+p.u+' · renseigne les cartons':'Quantité à commander en cartons'):(sug>0?'Suggestion : '+fmtQ(sug)+' '+p.u:'Quantité à commander'))+'</span><div class="cmd-order-controls"><select class="cmd-conditionnement" data-cmdcond="'+cle+'" aria-label="Conditionnement de commande pour '+escapeHTML(p.n)+'"><option value="unite" '+(conditionnement==='unite'?'selected':'')+'>À l’unité</option><option value="carton" '+(conditionnement==='carton'?'selected':'')+'>En carton</option></select><label><input class="cmd-inp" inputmode="decimal" data-cmd="'+cle+'" value="'+(q||'')+'"><em>'+ (conditionnement==='carton'?'carton'+(q>1?'s':''):p.u) +'</em></label></div></div>'+aideCarton+'</div>';
 }).join(''):'<div class="empty"><div class="e-ico">📦</div><p><b>Aucun produit pour ce fournisseur</b><br>Ajoute les produits de son catalogue, puis INVO suivra les seuils.</p></div>';
 const commandes=(st.commandes||[]).filter(function(c){return c.fournisseur===commandeFo}).slice(0,12).map(function(c){
  const s=statutCommande(c),cree=c.cree?String(c.cree).slice(0,10):'';
  return'<div class="order-card"><div><b>Commande du '+dateLocale(cree)+'</b><small>Livraison prévue : '+dateLocale(c.dateLiv)+' · '+c.lines.length+' produit'+(c.lines.length>1?'s':'')+(String(c.note||'').trim()?' · notes fournisseur incluses':'')+'</small></div><span class="order-status '+s.cls+'">'+s.txt+'</span><div class="order-actions"><button class="btn btn-2 btn-sm" data-copyorder="'+c.id+'">Copier</button><button class="btn btn-2 btn-sm" data-emailorder="'+c.id+'">Préparer l’e-mail</button>'+(c.statut==='recu'?'':'<button class="btn btn-sm" data-receivecmd="'+c.id+'">'+(c.statut==='partielle'?'Compléter la réception':'Vérifier la réception')+'</button>')+'</div></div>';
 }).join('')||'<div class="hint">Aucune commande enregistrée chez ce fournisseur.</div>';
 const brouillons=(st.commandeBrouillons||[]).filter(function(b){return b.fournisseur===commandeFo}).map(function(b){return'<div class="order-card"><div><b>Brouillon · '+dateLocale(b.dateLiv||String(b.modifie||'').slice(0,10))+'</b><small>'+(b.lines||[]).length+' ligne'+((b.lines||[]).length>1?'s':'')+' · modifié le '+new Date(b.modifie||b.cree).toLocaleDateString("fr-FR")+'</small></div><span class="order-status">Brouillon</span><div class="order-actions"><button class="btn btn-2 btn-sm" data-opencmddraft="'+b.id+'">Reprendre</button><button class="btn btn-2 btn-sm" data-deletecmddraft="'+b.id+'">Supprimer</button></div></div>';}).join('');
 return'<div class="cmd-shell"><div class="cmd-supplier-row">'+supplierMenu+'<button class="cmd-supplier add" id="addSupplier">＋ Fournisseur</button></div><div class="cmd-toolbar"><div><b>'+escapeHTML(commandeFo||'Fournisseur')+'</b><small>'+(fournisseur&&fournisseur.mail?escapeHTML(fournisseur.mail):'Aucun e-mail renseigné')+'</small></div><div class="cmd-toolbar-actions"><button class="btn btn-2 btn-sm" id="manageSuppliers">Gérer</button><button class="btn btn-2 btn-sm" id="addSupplierProduct">＋ Produit</button><button class="btn btn-2 btn-sm" id="missingProduct">Signaler un manque</button></div></div><div class="cmd-catalogue"><div class="eyebrow">PRODUITS À COMMANDER</div>'+produitsHTML+'</div><section class="cmd-notes"><div class="eyebrow">NOTES POUR LE FOURNISSEUR</div><label for="cmdNotes">Annotations incluses clairement dans le bon de commande et l’e-mail.<textarea id="cmdNotes" rows="4" maxlength="1200" placeholder="Ex. Livraison impérative avant 10 h. Merci de confirmer les indisponibilités.">'+escapeHTML(st.cmdNote||'')+'</textarea></label></section><div class="cmd-create"><div><b>Créer la commande</b><small>Le stock changera uniquement après réception vérifiée.</small></div><label>Date de livraison prévue<input type="date" id="cmdDelivery" min="'+aujourd+'" value="'+dateCommande+'"></label><button class="btn btn-2" id="saveOrderDraft">Enregistrer le brouillon</button><button class="btn" id="prepareOrder">Préparer la commande</button></div>'+(brouillons?'<div class="eyebrow" style="margin-top:22px">BROUILLONS</div><div class="cmd-orders">'+brouillons+'</div>':'')+'<div class="eyebrow" style="margin-top:22px">COMMANDES ENREGISTRÉES</div><div class="cmd-orders">'+commandes+'</div></div>';
}
async function preparerCommande(){
 const fournisseur=commandeFo,dateLiv=document.getElementById('cmdDelivery')?.value||st.cmdDateLiv||'';
 if(!fournisseur)return toast('Ajoute ou sélectionne un fournisseur.');
 if(!dateLiv)return toast('Choisis une date de livraison prévue.');
 const lines=(st.prods||[]).filter(function(p){return!!offreFournisseurProduit(p,fournisseur)}).map(function(p){const offre=offreFournisseurProduit(p,fournisseur);return{id:p.id,q:qteCommande(p,fournisseur),conditionnement:conditionnementCommande(p,fournisseur),px:offre&&offre.px>0?offre.px:p.px}}).filter(function(l){return l.q>0});
 if(!lines.length)return toast('Ajoute au moins une quantité à commander.');
 const note=String(document.getElementById('cmdNotes')?.value||st.cmdNote||'').trim();
 st.commandes=st.commandes||[];st.commandes.unshift({id:uid('cmd'),fournisseur:fournisseur,dateLiv:dateLiv,cree:new Date().toISOString(),statut:'preparee',lines:lines,note:note});
 st.cmdQ={};st.cmdConditionnement={};st.cmdNote='';st.cmdDateLiv='';if(commandeBrouillonActif)st.commandeBrouillons=(st.commandeBrouillons||[]).filter(function(b){return b.id!==commandeBrouillonActif});commandeBrouillonActif=null;await save();renderCommanderScreen();toast('Commande enregistrée. Le stock attendra ta validation à réception.');
}
function signalerProduitManquant(){
 const nom=prompt('Quel produit manque chez '+(commandeFo||'ce fournisseur')+' ?');
 if(nom===null||!nom.trim())return false;
 const txt='SIGNALEMENT PRODUIT MANQUANT\\n\\nFournisseur : '+commandeFo+'\\nProduit : '+nom.trim()+'\\nDate : '+new Date().toLocaleDateString('fr-FR')+'\\n\\nMerci de nous indiquer la disponibilité et le délai.';
 const mode=ouvrirSignalementFournisseur(commandeFo,'INVO · Produit manquant',txt);
 toast(mode==='mail'?'E-mail prérempli : vérifie-le puis envoie-le toi-même.':'Signalement copié. Ajoute l’e-mail du fournisseur pour l’ouvrir directement.');return mode;
}
function openFournisseur(nom){
 assurerFournisseurs();const f=nom?fournisseurParNom(nom):null;fournisseurForm=f?{id:f.id,n:f.n,mail:f.mail||''}:{id:null,n:'',mail:''};drawFournisseur();
}
function drawFournisseur(){
 const existe=!!fournisseurForm.id,nb=existe?(st.prods||[]).filter(function(p){return(p.fo||'Divers')===fournisseurForm.n}).length:0;
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="bgF"><div class="sheet"><h3>'+(existe?'Modifier le fournisseur':'Ajouter un fournisseur')+'</h3><p class="sh-sub">'+(existe?nb+' produit'+(nb>1?'s':'')+' associé'+(nb>1?'s':''):'Les contacts restent enregistrés uniquement dans INVO.')+'</p><div class="fld"><label>Nom</label><input id="foN" value="'+escapeHTML(fournisseurForm.n)+'" placeholder="Nom du fournisseur"></div><div class="fld"><label>E-mail de contact (facultatif)</label><input id="foMail" type="email" value="'+escapeHTML(fournisseurForm.mail)+'" placeholder="commandes@fournisseur.fr"></div><div class="sh-actions">'+(existe?'<button class="btn btn-del btn-sm" id="foDel">Retirer</button>':'')+'<button class="btn btn-2 btn-sm" id="foCancel">Annuler</button><button class="btn" id="foSave">Enregistrer</button></div></div></div>';
 document.getElementById('bgF').onclick=function(e){if(e.target.id==='bgF')closeModal()};
 document.getElementById('foN').oninput=function(e){fournisseurForm.n=e.target.value};
 document.getElementById('foMail').oninput=function(e){fournisseurForm.mail=e.target.value};
 document.getElementById('foCancel').onclick=closeModal;document.getElementById('foSave').onclick=saveFournisseur;
 const del=document.getElementById('foDel');if(del)del.onclick=retirerFournisseur;
}
async function saveFournisseur(){
 const n=(fournisseurForm.n||'').trim(),mail=(fournisseurForm.mail||'').trim();
 if(!n)return toast('Indique un nom de fournisseur.');
 const doublon=(st.fournisseurs||[]).find(function(f){return f.id!==fournisseurForm.id&&String(f.n).toLowerCase()===n.toLowerCase()});
 if(doublon)return toast('Ce fournisseur existe déjà.');
 if(fournisseurForm.id){const f=st.fournisseurs.find(function(x){return x.id===fournisseurForm.id}),ancien=f.n;f.n=n;f.mail=mail;(st.prods||[]).forEach(function(p){if(p.fo===ancien)p.fo=n;(p.fournisseurs||[]).forEach(function(o){if(o&&o.n===ancien)o.n=n})});(st.commandes||[]).forEach(function(c){if(c.fournisseur===ancien)c.fournisseur=n});}
 else st.fournisseurs.push({id:uid('fo'),n:n,mail:mail});
 commandeFo=n;await save();closeModal();renderCommanderScreen();toast('Fournisseur enregistré.');
}
async function retirerFournisseur(){
 const f=(st.fournisseurs||[]).find(function(x){return x.id===fournisseurForm.id}),nb=(st.prods||[]).filter(function(p){return p.fo===f.n||(p.fournisseurs||[]).some(function(o){return o&&o.n===f.n})}).length;
 if(nb)return toast('Réassigne ou retire d’abord ses '+nb+' produit'+(nb>1?'s':'')+'.');
 if(!confirm('Retirer ce fournisseur ?'))return;
 st.fournisseurs=st.fournisseurs.filter(function(x){return x.id!==f.id});commandeFo='';await save();closeModal();renderCommanderScreen();toast('Fournisseur retiré.');
}

function bindCommanderActions(){
 document.querySelectorAll('[data-cmd]').forEach(function(i){i.oninput=function(e){st.cmdQ=st.cmdQ||{};st.cmdQ[e.target.dataset.cmd]=e.target.value}});
 document.querySelectorAll('[data-cmdcond]').forEach(function(s){s.onchange=function(e){st.cmdConditionnement=st.cmdConditionnement||{};st.cmdConditionnement[e.target.dataset.cmdcond]=e.target.value;st.cmdQ=st.cmdQ||{};st.cmdQ[e.target.dataset.cmdcond]='';renderCommanderScreen()}});
 const notes=document.getElementById('cmdNotes');if(notes)notes.oninput=function(e){st.cmdNote=e.target.value};
 const delivery=document.getElementById('cmdDelivery');if(delivery)delivery.oninput=function(e){st.cmdDateLiv=e.target.value};
 document.querySelectorAll('[data-cmdfo]').forEach(function(b){b.onclick=function(){commandeFo=b.dataset.cmdfo;renderCommanderScreen()}});
 document.querySelectorAll('[data-cmdcheapest]').forEach(function(b){b.onclick=function(){const p=prod(b.dataset.cmdcheapest),best=offresFournisseursProduit(p)[0];if(best){commandeFo=best.n;renderCommanderScreen()}}});
 const supplierSelect=document.getElementById('cmdSupplierSelect');if(supplierSelect)supplierSelect.onchange=function(e){commandeFo=e.target.value;renderCommanderScreen()};
 document.querySelectorAll('[data-cmdedit]').forEach(function(b){b.onclick=function(){openMat(b.dataset.cmdedit)}});
 const addProd=document.getElementById('addSupplierProduct');if(addProd)addProd.onclick=function(){openMat(null,commandeFo)};
 const addF=document.getElementById('addSupplier');if(addF)addF.onclick=function(){openFournisseur()};
 const manage=document.getElementById('manageSuppliers');if(manage)manage.onclick=function(){openFournisseur(commandeFo)};
 const prep=document.getElementById('prepareOrder');if(prep)prep.onclick=preparerCommande;
 const saveDraft=document.getElementById('saveOrderDraft');if(saveDraft)saveDraft.onclick=sauvegarderBrouillonCommande;
 const manque=document.getElementById('missingProduct');if(manque)manque.onclick=signalerProduitManquant;
 document.querySelectorAll('[data-copyorder]').forEach(function(b){b.onclick=function(){const c=(st.commandes||[]).find(function(x){return x.id===b.dataset.copyorder});if(c){copyText(texteCommande(c));toast('Commande copiée. Tu peux la relire puis l’envoyer au fournisseur.')}}});
 document.querySelectorAll('[data-emailorder]').forEach(function(b){b.onclick=function(){envoyerCommandeFournisseur(b.dataset.emailorder)}});
 document.querySelectorAll('[data-receivecmd]').forEach(function(b){b.onclick=function(){openLiv(b.dataset.receivecmd)}});
 document.querySelectorAll('[data-opencmddraft]').forEach(function(b){b.onclick=function(){ouvrirBrouillonCommande(b.dataset.opencmddraft)}});
 document.querySelectorAll('[data-deletecmddraft]').forEach(function(b){b.onclick=function(){supprimerBrouillonCommande(b.dataset.deletecmddraft)}});
}
function renderCommanderScreen(){
 document.getElementById('s-cmd').innerHTML='<div class="h-title">Commander</div><div class="h-sub">Choisis un fournisseur, ajuste les quantités, puis prépare la commande.</div>'+renderCommander();
 bindCommanderActions();
}

