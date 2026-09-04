/* SWAY · operations */

/* ═════ LIVRAISONS ═════ */
const ZONES_L=['bar','cave','cuisine','reserve'];
const zLabel=z=>{const l=st&&st.inventory&&Array.isArray(st.inventory.locations)&&st.inventory.locations.find(x=>x.id===z);return l?l.n:t('z'+z.charAt(0).toUpperCase()+z.slice(1))};

/* ═════ INVENTAIRE PAR EMPLACEMENT ═════
   Le stock reste global. L'inventaire, lui, mémorise chaque quantité par
   emplacement afin qu'une même bouteille ne soit jamais écrasée par un autre
   comptage. Cette structure remplace progressivement l'ancien st.count global. */
const INV_CATEGORIES=[
 {id:'spiritueux',n:'Spiritueux'}, {id:'vins',n:'Vins'}, {id:'bieres',n:'Bières'},
 {id:'champagnes',n:'Champagnes'}, {id:'sans_alcool',n:'Boissons sans alcool'},
 {id:'sirops',n:'Sirops'}, {id:'autres',n:'Autres'}
];
const INV_EMPLACEMENTS_DEFAUT=[
 {id:'cave',n:'Cave'}, {id:'reserve',n:'Réserve'}, {id:'frigo_bar',n:'Réfrigérateurs du bar'},
 {id:'bar',n:'Étagères du bar'}, {id:'arriere_bar',n:'Arrière-bar'}, {id:'cuisine',n:'Cuisine'}
];
function inventaireCategorieParDefaut(p){
 const id=String((p&&p.id)||'').toLowerCase(),nom=String((p&&p.n)||'').toLowerCase();
 if(/sirop/.test(id+' '+nom))return 'sirops';
 if(/champ|mo[eë]t|veuve/.test(id+' '+nom))return 'champagnes';
 if(/vin_|tariq|chardo|clape|stnico|prosecco/.test(id+' '+nom))return 'vins';
 if(/biere|bière|ipa|pression/.test(id+' '+nom))return 'bieres';
 if(/soft|coca|redbull|jus|orange|citron|menthe|fruitrouge/.test(id+' '+nom))return 'sans_alcool';
 if((p&&p.bottle)||/gin|vodka|rhum|tequila|whisk|aperol|campari|ricard|martini|cointreau|st.?germain/.test(id+' '+nom))return 'spiritueux';
 return 'autres';
}
function normaliserEmplacementsProduit(p){
 const disponibles=(st.inventory&&Array.isArray(st.inventory.locations)?st.inventory.locations:[]).map(l=>l.id);
 let emplacements=Array.isArray(p.emplacements)?p.emplacements.filter(id=>disponibles.includes(id)):[];
 if(!emplacements.length)emplacements=[p.z||'reserve'];
 p.emplacements=[...new Set(emplacements)];
 p.z=p.emplacements[0]||'reserve'; /* compatibilité avec les écrans historiques */
 if(!p.invCategory||!INV_CATEGORIES.some(c=>c.id===p.invCategory))p.invCategory=inventaireCategorieParDefaut(p);
 return p.emplacements;
}
function creerSessionInventaire(){return{
 version:2,id:uid('inventaire'),startedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
 zones:{},anomalies:[],journal:[]
}}
function migrationInventaireEmplacements(){
 let change=false;
 if(!st.inventory||typeof st.inventory!=='object'){
  st.inventory={version:2,locations:INV_EMPLACEMENTS_DEFAUT.map((l,index)=>({...l,active:true,order:index})),active:null};change=true;
 }
 if(!Array.isArray(st.inventory.locations)||!st.inventory.locations.length){
  st.inventory.locations=INV_EMPLACEMENTS_DEFAUT.map((l,index)=>({...l,active:true,order:index}));change=true;
 }
 st.inventory.locations.forEach((l,index)=>{
  if(!l.id){l.id='emplacement_'+index;change=true}
  if(!l.n){l.n='Emplacement';change=true}
  if(l.active===undefined){l.active=true;change=true}
  if(!Number.isFinite(Number(l.order))){l.order=index;change=true}
 });
 const ids=new Set(st.inventory.locations.map(l=>l.id));
 (st.prods||[]).forEach(p=>{
  const legacy=p.z||'reserve';
  if(!ids.has(legacy)){st.inventory.locations.push({id:legacy,n:zLabel(legacy)||legacy,active:true,order:st.inventory.locations.length});ids.add(legacy);change=true}
  const avant=JSON.stringify({e:p.emplacements,z:p.z,c:p.invCategory});
  normaliserEmplacementsProduit(p);
  if(avant!==JSON.stringify({e:p.emplacements,z:p.z,c:p.invCategory}))change=true;
 });
 if(!st.inventory.active&&Object.keys(st.count||{}).length){
  const active=creerSessionInventaire();
  Object.entries(st.count).forEach(([pid,val])=>{
   if(val===''||val===undefined)return;
   const p=prod(pid);if(!p)return;
   const loc=(p.emplacements||[p.z||'reserve'])[0];
   active.zones[loc]={counts:{[pid]:{q:String(val),ts:new Date().toISOString(),utilisateur:st.who,role:roleHistoriqueAudit()}},extras:[],exclusions:{},doneAt:null};
  });
  st.inventory.active=active;st.count={};change=true;
 }
 if(st.inventory.version!==2){st.inventory.version=2;change=true}
 return change;
}
function emplacementsInventaire(actifsSeulement){
 const list=(st.inventory&&st.inventory.locations||[]).slice().sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
 return actifsSeulement?list.filter(l=>l.active!==false):list;
}
function emplacementInventaire(id){return emplacementsInventaire(false).find(l=>l.id===id)}
function nomEmplacementInventaire(id){const l=emplacementInventaire(id);return l?l.n:(id||'Emplacement')}
function categorieInventaire(id){return INV_CATEGORIES.find(c=>c.id===id)||INV_CATEGORIES.at(-1)}
function peutConfigurerInventaire(){return ['admin','gestion'].includes(st.whoId)}
function sessionInventaire(){
 if(!st.inventory) migrationInventaireEmplacements();
 if(!st.inventory.active)st.inventory.active=creerSessionInventaire();
 return st.inventory.active;
}
function zoneInventaire(session,locId){
 if(!session.zones[locId])session.zones[locId]={counts:{},extras:[],exclusions:{},doneAt:null};
 const z=session.zones[locId];
 if(!z.counts)z.counts={};if(!Array.isArray(z.extras))z.extras=[];if(!z.exclusions)z.exclusions={};
 return z;
}
function produitDansEmplacement(p,locId,session){
 const z=zoneInventaire(session,locId);
 return ((p.emplacements||[]).includes(locId)&&!z.exclusions[p.id])||z.extras.includes(p.id);
}
function produitsInventaireEmplacement(locId,session){
 return (st.prods||[]).filter(p=>produitDansEmplacement(p,locId,session)).sort((a,b)=>a.n.localeCompare(b.n,'fr'));
}

/* Ordre d'affichage persistant et indépendant pour chaque zone. */
function produitsZone(z){
 return st.prods.map((p,index)=>({p,index})).filter(x=>(x.p.z||'reserve')===z)
  .sort((a,b)=>{
   const ao=Number(a.p.displayOrder),bo=Number(b.p.displayOrder),av=Number.isFinite(ao),bv=Number.isFinite(bo);
   return av&&bv?ao-bo:(av?-1:(bv?1:a.index-b.index))})
  .map(x=>x.p);
}
function produitsOrdonnesToutesZones(){
 const ids=new Set(),liste=[];
 ZONES_L.forEach(z=>produitsZone(z).forEach(p=>{ids.add(p.id);liste.push(p)}));
 st.prods.forEach(p=>{if(!ids.has(p.id))liste.push(p)});
 return liste;
}
function normaliserZone(z){produitsZone(z).forEach((p,index)=>p.displayOrder=index)}
function prochainePositionZone(z){const ps=produitsZone(z);return ps.length?Math.max(...ps.map(p=>Number(p.displayOrder)||0))+1:0}
function planifierSauvegardeOrdre(){
 if(zoneOrderSaveTimer)clearTimeout(zoneOrderSaveTimer);
 zoneOrderSaveTimer=setTimeout(async()=>{zoneOrderSaveTimer=null;await save()},180);
}
window.addEventListener('pagehide',()=>{
 if(zoneOrderSaveTimer){clearTimeout(zoneOrderSaveTimer);zoneOrderSaveTimer=null;Store.set(dataKey(),st)}
});
async function deplacerProduitZone(id,action,cibleId){
 const p=prod(id);if(!p)return;
 const z=p.z||'reserve',liste=produitsZone(z),depart=liste.findIndex(x=>x.id===id);
 if(depart<0)return;
 let arrivee=depart;
 if(action==='first')arrivee=0;
 else if(action==='up')arrivee=Math.max(0,depart-1);
 else if(action==='down')arrivee=Math.min(liste.length-1,depart+1);
 else if(action==='last')arrivee=liste.length-1;
 else if(action==='before')arrivee=liste.findIndex(x=>x.id===cibleId);
 if(arrivee<0||arrivee===depart)return;
 const [moved]=liste.splice(depart,1);
 if(action==='before'&&depart<arrivee)arrivee--;
 liste.splice(arrivee,0,moved);liste.forEach((x,index)=>x.displayOrder=index);
 planifierSauvegardeOrdre();renderInv();
}


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
