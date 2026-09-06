/* DASHBOARD_PROFILE_CORE_START
   Les intégrations attendues sont centralisées dans st.dashboardIntegrations :
   covers {date,midi,soir}, recommendedProductIds {date,ids},
   unsavedPurchaseOrders {date,count}. Aucune valeur n'est déduite ou simulée. */
function dateLocaleDashboard(date){
 const d=date instanceof Date?date:new Date(date),p=function(v){return String(v).padStart(2,'0')};
 return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
}
function resumeVentesDashboard(maintenant){
 const debut=new Date(maintenant);debut.setHours(0,0,0,0);
 const fin=new Date(debut);fin.setDate(fin.getDate()+1);
 const ventes=(st.mv||[]).filter(function(m){
  if(!m||m.motif!=='vente'||!m.ts)return false;
  const d=new Date(m.ts);return !isNaN(d.getTime())&&d>=debut&&d<fin;
 });
 return ventes.reduce(function(r,m){
  const c=item(m.plat),montant=pvMv(m);
  r.ca+=montant;r.nombreVentes+=1;
  if(c&&c.k==='drink')r.liquide+=montant;else if(c)r.solide+=montant;
  if(c&&c.c==='cCock')r.cocktails+=Number(m.qty)||0;
  return r;
 },{ventes:ventes,ca:0,solide:0,liquide:0,cocktails:0,nombreVentes:0});
}
function integrationDashboard(nom){return st.dashboardIntegrations&&st.dashboardIntegrations[nom]}
function sourceCouvertsDashboard(dateISO){
 const source=integrationDashboard('covers');
 if(!source)return{status:'missing',message:'Aucune source de couverts n’est connectée.'};
 if(typeof source.date!=='string'||!Object.prototype.hasOwnProperty.call(source,'midi')||!Object.prototype.hasOwnProperty.call(source,'soir'))
  return{status:'error',message:'La source de couverts ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucune donnée de couverts reçue pour aujourd’hui.'};
 const midi=Number(source.midi),soir=Number(source.soir);
 if(!Number.isFinite(midi)||midi<0||!Number.isFinite(soir)||soir<0)
  return{status:'error',message:'Les nombres de couverts reçus sont invalides.'};
 return{status:'ready',midi:Math.round(midi),soir:Math.round(soir),total:Math.round(midi+soir)};
}
function sourceRecommandationsDashboard(dateISO){
 const source=integrationDashboard('recommendedProductIds');
 if(!source)return{status:'missing',message:'Aucun service de recommandation produit n’est connecté.'};
 if(typeof source.date!=='string'||!Array.isArray(source.ids))
  return{status:'error',message:'La source de recommandations ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucune recommandation reçue pour aujourd’hui.'};
 const vus=new Set(),produits=source.ids.map(function(id){return item(id)}).filter(function(p){if(!p||vus.has(p.id))return false;vus.add(p.id);return true});
 if(!produits.length)return{status:'empty',message:'Aucun produit à recommander pour le moment.'};
 return{status:'ready',items:produits};
}
function sourceBonsNonSaisisDashboard(dateISO){
 const source=integrationDashboard('unsavedPurchaseOrders');
 if(!source)return{status:'missing',message:'Aucune source de bons de commande non saisis n’est connectée.'};
 if(typeof source.date!=='string'||!Object.prototype.hasOwnProperty.call(source,'count'))
  return{status:'error',message:'La source des bons de commande ne respecte pas le format attendu.'};
 if(source.date!==dateISO)return{status:'empty',message:'Aucun état des bons non saisis reçu pour aujourd’hui.'};
 const count=Number(source.count);
 if(!Number.isFinite(count)||count<0)return{status:'error',message:'Le nombre de bons non saisis reçu est invalide.'};
 return{status:'ready',count:Math.round(count)};
}
function periodesSemaineDashboard(maintenant){
 const debut=new Date(maintenant);debut.setHours(0,0,0,0);debut.setDate(debut.getDate()-((debut.getDay()+6)%7));
 const fin=new Date(debut);fin.setDate(fin.getDate()+7);
 const precedente=new Date(debut);precedente.setDate(precedente.getDate()-7);
 return{debut:debut,fin:fin,precedente:precedente};
}
function ventesDashboardEntre(debut,fin){
 return(st.mv||[]).filter(function(m){if(!m||m.motif!=='vente'||!m.ts)return false;const d=new Date(m.ts);return !isNaN(d.getTime())&&d>=debut&&d<fin});
}
function resumePerformanceSemaineDashboard(maintenant){
 const periode=periodesSemaineDashboard(maintenant),ventes=ventesDashboardEntre(periode.debut,periode.fin),ventesPrecedentes=ventesDashboardEntre(periode.precedente,periode.debut);
 const jours=Array.from({length:7},function(_,ix){const d=new Date(periode.debut);d.setDate(d.getDate()+ix);return{d:d,ca:0}});
 const joursPrecedents=Array.from({length:7},function(_,ix){const d=new Date(periode.precedente);d.setDate(d.getDate()+ix);return{d:d,ca:0}});
 ventes.forEach(function(m){const d=new Date(m.ts),ix=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-periode.debut)/86400000);if(jours[ix])jours[ix].ca+=pvMv(m)});
 ventesPrecedentes.forEach(function(m){const d=new Date(m.ts),ix=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-periode.precedente)/86400000);if(joursPrecedents[ix])joursPrecedents[ix].ca+=pvMv(m)});
 return{periode:periode,ventes:ventes,ventesPrecedentes:ventesPrecedentes,jours:jours,joursPrecedents:joursPrecedents,
  ca:ventes.reduce(function(s,m){return s+pvMv(m)},0),caPrecedent:ventesPrecedentes.reduce(function(s,m){return s+pvMv(m)},0)};
}
const CATEGORIES_BOISSONS_DASHBOARD=[
 {id:'bieres',label:'Bières'},{id:'cocktails',label:'Cocktails'},{id:'softs',label:'Softs'},{id:'chaudes',label:'Boissons chaudes'},
 {id:'vinsVerres',label:'Vins au verre'},{id:'vinsBouteilles',label:'Vins à la bouteille'},{id:'digestifs',label:'Digestifs'},{id:'aperitifs',label:'Apéritifs'}
];
const APERITIFS_DASHBOARD=new Set(['vRicard','dblRicard']);
function categorieBoissonDashboard(produit){
 if(!produit||produit.k!=='drink')return'';
 if(produit.c==='cBieres')return'bieres';if(produit.c==='cCock')return'cocktails';if(produit.c==='cSofts')return'softs';if(produit.c==='cCafe')return'chaudes';
 if(produit.c==='cVins')return /^bt/.test(produit.id)?'vinsBouteilles':'vinsVerres';
 if(produit.c==='cAlc')return APERITIFS_DASHBOARD.has(produit.id)?'aperitifs':'digestifs';
 return'';
}
function resumeBoissonsSemaineDashboard(maintenant){
 const periode=periodesSemaineDashboard(maintenant),ventes=ventesDashboardEntre(periode.debut,periode.fin),categories={};
 CATEGORIES_BOISSONS_DASHBOARD.forEach(function(c){categories[c.id]=0});
 let total=0;
 ventes.forEach(function(m){const produit=item(m.plat),categorie=categorieBoissonDashboard(produit),quantite=Math.max(0,Number(m.qty)||0);if(!produit||produit.k!=='drink')return;total+=quantite;if(categorie)categories[categorie]+=quantite});
 return{periode:periode,ventes:ventes,total:total,categories:categories};
}
/* DASHBOARD_PROFILE_CORE_END */

function blocPerformanceHebdomadaireDashboard(maintenant){
 const performance=resumePerformanceSemaineDashboard(maintenant),joursSemaine=performance.jours,joursSemainePrecedente=performance.joursPrecedents;
 const caSemaine=performance.ca,caSemainePrecedente=performance.caPrecedent,ecartSemaine=caSemaine-caSemainePrecedente;
 const ecartPct=caSemainePrecedente>0?Math.round(ecartSemaine/caSemainePrecedente*100):null;
 const comparaisonSemaine=caSemainePrecedente>0?(ecartSemaine>=0?'+':'−')+fmt(Math.abs(ecartSemaine))+' € · '+(ecartPct>=0?'+':'')+ecartPct+' % vs sem. dernière':(caSemaine>0?'Aucune vente la semaine dernière':'Pas encore de comparaison');
 const comparaisonClasse=caSemainePrecedente>0?(ecartSemaine>0?'up':ecartSemaine<0?'down':'neutral'):'empty';
 const meilleurJour=joursSemaine.reduce(function(max,j){return j.ca>max.ca?j:max},joursSemaine[0]);
 const detailMeilleurJour=caSemaine>0?'Meilleur jour : '+meilleurJour.d.toLocaleDateString('fr-FR',{weekday:'long'})+' · '+fmt(meilleurJour.ca)+' €':'Aucune vente cette semaine';
 const maximumGraphique=Math.max.apply(null,joursSemaine.map(function(j){return j.ca}).concat(joursSemainePrecedente.map(function(j){return j.ca}),[1]));
 const historiqueDisponible=caSemainePrecedente>0,pasBrut=maximumGraphique/4;
 const pasGraphique=pasBrut<=5?Math.max(1,Math.ceil(pasBrut)):pasBrut<=25?Math.ceil(pasBrut/5)*5:Math.ceil(pasBrut/10)*10;
 const plafondGraphique=Math.max(pasGraphique*4,1),xGraphique=function(ix){return 48+ix*(564/6)},yGraphique=function(valeur){return 158-Math.max(0,Math.min(valeur/plafondGraphique,1))*126};
 const pointsActuels=joursSemaine.map(function(j,ix){return{x:xGraphique(ix),y:yGraphique(j.ca),ca:j.ca,d:j.d}}),pointsPrecedents=joursSemainePrecedente.map(function(j,ix){return{x:xGraphique(ix),y:yGraphique(j.ca),ca:j.ca,d:j.d}});
 const traceCourbe=function(points){if(points.length<2)return'';let trace='M '+points[0].x.toFixed(1)+' '+points[0].y.toFixed(1);for(let ix=1;ix<points.length-1;ix++){const suivant=points[ix+1],x=(points[ix].x+suivant.x)/2,y=(points[ix].y+suivant.y)/2;trace+=' Q '+points[ix].x.toFixed(1)+' '+points[ix].y.toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)}const dernier=points[points.length-1];return trace+' Q '+dernier.x.toFixed(1)+' '+dernier.y.toFixed(1)+' '+dernier.x.toFixed(1)+' '+dernier.y.toFixed(1)};
 const courbeActuelle=traceCourbe(pointsActuels),courbePrecedente=traceCourbe(pointsPrecedents),aireActuelle=courbeActuelle+' L '+pointsActuels[pointsActuels.length-1].x.toFixed(1)+' 158 L '+pointsActuels[0].x.toFixed(1)+' 158 Z';
 const contientDesVentes=caSemaine>0||caSemainePrecedente>0;
 const lignesGrille=Array.from({length:5},function(_,ix){const valeur=plafondGraphique-(plafondGraphique/4*ix),y=yGraphique(valeur);return '<line class="dash-chart-gridline" x1="48" y1="'+y.toFixed(1)+'" x2="612" y2="'+y.toFixed(1)+'"></line><text class="dash-chart-ylabel" x="39" y="'+(y+3).toFixed(1)+'">'+fmt(valeur)+' €</text>'}).join('');
 const libellesJours=pointsActuels.map(function(point){return '<text class="dash-chart-xlabel" x="'+point.x.toFixed(1)+'" y="181" text-anchor="middle">'+point.d.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','')+'</text>'}).join('');
 const pointsInteractifs=pointsActuels.map(function(point){const datePoint=point.d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric'});return '<circle class="dash-chart-point" cx="'+point.x.toFixed(1)+'" cy="'+point.y.toFixed(1)+'" r="3.4"><title>'+datePoint+' · '+fmt(point.ca)+' €</title></circle>'}).join('');
 const legendeGraphique='<div class="dash-chart-legend"><span class="current"><i></i>Cette semaine</span>'+(historiqueDisponible?'<span class="previous"><i></i>Semaine dernière</span>':'<span class="muted">Semaine dernière indisponible</span>')+'</div>';
 const graphiqueSvg=contientDesVentes?'<div class="dash-pilot-plot"><svg class="dash-pilot-svg" viewBox="0 0 640 194" role="img" aria-label="Évolution du chiffre d’affaires par jour"><defs><linearGradient id="invoPilotArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5365F5" stop-opacity=".28"></stop><stop offset="100%" stop-color="#5365F5" stop-opacity="0"></stop></linearGradient></defs>'+lignesGrille+'<path class="dash-chart-area" d="'+aireActuelle+'"></path>'+(historiqueDisponible?'<path class="dash-chart-previous" d="'+courbePrecedente+'"></path>':'')+'<path class="dash-chart-current" d="'+courbeActuelle+'"></path>'+pointsInteractifs+libellesJours+'</svg></div>':'<div class="dash-pilot-empty"><b>Pas encore de ventes à afficher</b><span>La courbe se dessinera dès la première vente enregistrée.</span></div>';
 const graphique='<section class="dash-pilot-chart" aria-label="Performance des ventes"><header class="dash-pilot-head"><div><small>PERFORMANCE</small><b>Évolution du chiffre d’affaires</b></div>'+legendeGraphique+'</header>'+graphiqueSvg+'<footer class="dash-pilot-footer"><span class="dash-performance-delta '+comparaisonClasse+'">'+comparaisonSemaine+'</span><span class="dash-performance-best">'+detailMeilleurJour+'</span></footer></section>';
 return '<section class="dash-performance-banner" aria-label="Performance de la semaine"><div class="dash-performance-copy"><article class="dash-performance-metric"><small>CA VENTES · CETTE SEMAINE</small><b>'+fmt(caSemaine)+' €</b><span class="dash-performance-delta '+comparaisonClasse+'">'+comparaisonSemaine+'</span></article><article class="dash-performance-metric secondary"><small>VENTES ENREGISTRÉES</small><b>'+performance.ventes.length+'</b><span>'+detailMeilleurJour+'</span></article></div><div class="dash-performance-chart">'+graphique+'</div></section>';
}
function blocBoissonsHebdomadaireDashboard(maintenant){
 const resume=resumeBoissonsSemaineDashboard(maintenant),categories=CATEGORIES_BOISSONS_DASHBOARD.map(function(c){return '<article class="profile-drink-stat"><span>'+c.label+'</span><b>'+fmtQ(resume.categories[c.id])+'</b></article>'}).join('');
 return '<section class="profile-drinks-banner" aria-label="Ventes de boissons de la semaine"><article class="profile-drinks-total"><small>BOISSONS VENDUES · CETTE SEMAINE</small><b>'+fmtQ(resume.total)+'</b><span>'+(resume.total?'Total issu des ventes enregistrées':'Aucune boisson vendue cette semaine')+'</span></article><div class="profile-drinks-grid">'+categories+'</div></section>';
}

function utilisateurDashboardActuel(){
 return session&&session.email&&auth.users&&auth.users[session.email]?auth.users[session.email]:null;
}
let recapMatinTimer=null;
function preferencesRecapMatin(){
 const utilisateur=utilisateurDashboardActuel(),source=utilisateur&&utilisateur.recapMatin&&typeof utilisateur.recapMatin==='object'?utilisateur.recapMatin:(st.recapMatin&&typeof st.recapMatin==='object'?st.recapMatin:{});
 const heure=/^([01]\d|2[0-3]):[0-5]\d$/.test(String(source.heure||''))?source.heure:'08:00';
 return{actif:source.actif!==false,heure:heure};
}
async function enregistrerPreferencesRecapMatin(changement){
 const actuel=preferencesRecapMatin(),suivant={...actuel,...changement};
 const utilisateur=utilisateurDashboardActuel();
 if(utilisateur){utilisateur.recapMatin=suivant;await saveAuth()}else{st.recapMatin=suivant;await save()}
 programmerRecapMatin();
 return suivant;
}
function recapMatinPret(preferences,maintenant){
 if(!preferences.actif)return false;
 const parts=preferences.heure.split(':').map(Number),minutes=maintenant.getHours()*60+maintenant.getMinutes();
 return minutes>=parts[0]*60+parts[1];
}
function bilanRecapMatin(){
 const maintenant=new Date(),debutJour=new Date(maintenant);debutJour.setHours(0,0,0,0);
 const produits=st.prods||[],mouvements=st.mv||[],commandes=st.commandes||[];
 const ventes=mouvements.filter(function(m){return m.motif==='vente'&&new Date(m.ts)>=debutJour});
 const ca=ventes.reduce(function(s,m){return s+pvMv(m)},0);
 const ruptures=produits.filter(function(p){return(st.stock[p.id]??0)<=0}).length;
 const sousSeuil=produits.filter(function(p){const q=st.stock[p.id]??0;return q>0&&q<=p.seuil}).length;
 const receptions=commandes.filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'&&c.dateLiv&&c.dateLiv<=maintenant.toISOString().slice(0,10)}).length;
 const aClasser=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0}).length;
 const profil=profilMetierActuel()||st.whoId||'gestion';
 let cartes=[];
 if(profil==='barman')cartes=[['VENTES DU JOUR',fmt(ventes.length),ventes.length?'Vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':''):'Aucune vente enregistrée'],['STOCK BAR À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':'')+' à traiter':sousSeuil?'Sous seuil à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['À CLASSER',fmt(aClasser),aClasser?'Sortie liée à vérifier':'Caisse à jour']];
 else if(profil==='chef')cartes=[['STOCK À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':'')+' à traiter':sousSeuil?'Sous seuil à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['VENTES DU JOUR',fmt(ventes.length),ventes.length?'Donnée issue des ventes enregistrées':'Aucune vente enregistrée'],['À CLASSER',fmt(aClasser),aClasser?'À contrôler avant clôture':'Aucune sortie à classer']];
 else if(profil==='salle')cartes=[['CHIFFRE D’AFFAIRES',fmt(ca)+' €',ventes.length+' vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':'')],['À CLASSER',fmt(aClasser),aClasser?'Sortie liée à vérifier':'Caisse à jour'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler avant entrée en stock':'Aucune prévue'],['STOCK À SURVEILLER',fmt(ruptures+sousSeuil),ruptures?'Rupture'+(ruptures>1?'s':''):'Niveaux à surveiller']];
 else cartes=[['CHIFFRE D’AFFAIRES',fmt(ca)+' €',ventes.length+' vente'+(ventes.length>1?'s':'')+' enregistrée'+(ventes.length>1?'s':'')],['RUPTURES',fmt(ruptures),ruptures?'À traiter en priorité':'Aucune rupture'],['SOUS SEUIL',fmt(sousSeuil),sousSeuil?'Commande à anticiper':'Aucun niveau critique'],['RÉCEPTIONS',fmt(receptions),receptions?'À contrôler humainement':'Aucune prévue']];
 const poste=PROFILS_METIER.find(function(p){return p.id===profil})||POSTES.find(function(p){return p.id===st.whoId});
 return{date:maintenant,profil:poste?poste.n:(st.who||'Utilisateur'),cartes:cartes};
}
function recapMatinHTML(){
 const preferences=preferencesRecapMatin(),bilan=bilanRecapMatin(),pret=recapMatinPret(preferences,bilan.date),premiere=bilan.cartes[0];
 return '<section class="morning-recap '+(pret?'':'pending')+'"><div><small>RÉCAPITULATIF DU MATIN · '+escapeHTML(preferences.heure)+'</small><b>'+(!preferences.actif?'Récapitulatif en pause':pret?'Votre récapitulatif est prêt.':'Prévu à '+escapeHTML(preferences.heure)+'.')+'</b><span>'+escapeHTML(bilan.profil)+' · '+escapeHTML(premiere[0])+' : '+escapeHTML(premiere[1])+' — '+escapeHTML(premiere[2])+'</span></div><button class="settings-text-button" data-open-recap>Ouvrir'+settingsIcon('arrow')+'</button></section>';
}
let meteoChargement=false,meteoVilleTimer=null;
function preferencesMeteo(){
 const source=st&&st.meteo&&typeof st.meteo==='object'?st.meteo:{};
 return{ville:String(source.ville||'').trim().slice(0,80),cache:source.cache&&typeof source.cache==='object'?source.cache:null};
}
function libelleMeteo(code){
 const libelles={0:['☀️','Ciel dégagé'],1:['🌤️','Plutôt dégagé'],2:['⛅','Partiellement nuageux'],3:['☁️','Couvert'],45:['🌫️','Brouillard'],48:['🌫️','Brouillard givrant'],51:['🌦️','Bruine légère'],53:['🌦️','Bruine'],55:['🌧️','Forte bruine'],61:['🌧️','Pluie faible'],63:['🌧️','Pluie'],65:['🌧️','Forte pluie'],71:['🌨️','Neige faible'],73:['🌨️','Neige'],75:['🌨️','Forte neige'],80:['🌦️','Averses faibles'],81:['🌧️','Averses'],82:['🌧️','Fortes averses'],95:['⛈️','Orage'],96:['⛈️','Orage avec grêle'],99:['⛈️','Orage avec grêle']};
 return libelles[Number(code)]||['🌡️','Conditions actuelles'];
}
function meteoAccueilHTML(){
 const preferences=preferencesMeteo(),cache=preferences.cache,valide=cache&&cache.ville===preferences.ville&&Date.now()-Number(cache.fetchedAt||0)<30*60*1000;
 if(!preferences.ville)return '<section class="weather-brief pending" data-meteo-accueil><div><small>MÉTÉO</small><b>Ville non configurée</b><span>Choisissez une ville dans Réglages → Général.</span></div><i aria-hidden="true">⌁</i></section>';
 if(!valide)return '<section class="weather-brief pending" data-meteo-accueil><div><small>MÉTÉO · '+escapeHTML(preferences.ville)+'</small><b>Mise à jour en cours</b><span>Les conditions locales sont chargées depuis une source publique.</span></div><i aria-hidden="true">⌁</i></section>';
 const condition=libelleMeteo(cache.code),temperature=Number(cache.temperature);
 return '<section class="weather-brief" data-meteo-accueil><div><small>MÉTÉO · '+escapeHTML(cache.nom||preferences.ville)+'</small><b>'+escapeHTML(condition[1])+' · '+(Number.isFinite(temperature)?temperature.toLocaleString('fr-FR',{maximumFractionDigits:1})+' °C':'Indisponible')+'</b><span>Actualisée à '+escapeHTML(new Date(cache.fetchedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))+'.</span></div><i aria-hidden="true">'+condition[0]+'</i></section>';
}
function mettreAJourMeteoAccueil(){document.querySelectorAll('[data-meteo-accueil]').forEach(function(el){el.outerHTML=meteoAccueilHTML()})}
async function actualiserMeteoAccueil(force){
 const preferences=preferencesMeteo(),cache=preferences.cache;
 if(!preferences.ville||meteoChargement)return;
 if(!force&&cache&&cache.ville===preferences.ville&&Date.now()-Number(cache.fetchedAt||0)<30*60*1000){mettreAJourMeteoAccueil();return}
 meteoChargement=true;mettreAJourMeteoAccueil();
 try{
  const recherche=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(preferences.ville)+'&count=1&language=fr&format=json');
  if(!recherche.ok)throw new Error('Ville introuvable');
  const geo=await recherche.json(),lieu=geo&&Array.isArray(geo.results)?geo.results[0]:null;
  if(!lieu)throw new Error('Ville introuvable');
  const reponse=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lieu.latitude)+'&longitude='+encodeURIComponent(lieu.longitude)+'&current_weather=true&timezone=auto');
  if(!reponse.ok)throw new Error('Météo indisponible');
  const data=await reponse.json(),courant=data&&data.current_weather;
  if(!courant||!Number.isFinite(Number(courant.temperature)))throw new Error('Météo indisponible');
  if(preferencesMeteo().ville!==preferences.ville)return;
  st.meteo={ville:preferences.ville,cache:{ville:preferences.ville,nom:String(lieu.name||preferences.ville),temperature:Number(courant.temperature),code:Number(courant.weathercode),fetchedAt:Date.now()}};await save();
 }catch(e){if(preferencesMeteo().ville===preferences.ville){st.meteo={ville:preferences.ville,cache:null};await save();toast('Météo indisponible pour le moment.');}}
 finally{meteoChargement=false;mettreAJourMeteoAccueil()}
}
async function enregistrerVilleMeteo(ville){const propre=String(ville||'').replace(/\s+/g,' ').trim().slice(0,80);st.meteo={ville:propre,cache:null};await save();if(screen==='dash')renderDash();if(propre)actualiserMeteoAccueil(true);return propre}
function ouvrirRecapMatin(){
 const bilan=bilanRecapMatin(),preferences=preferencesRecapMatin(),date=bilan.date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="bgRecap"><div class="sheet"><div class="recap-summary"><div class="recap-summary-head"><small>RÉCAPITULATIF DU MATIN · '+escapeHTML(preferences.heure)+'</small><b>'+escapeHTML(bilan.profil)+'</b><p>'+escapeHTML(date.charAt(0).toUpperCase()+date.slice(1))+' · informations calculées à partir des données enregistrées dans INVO.</p></div><div class="recap-summary-grid">'+bilan.cartes.map(function(c){return '<article><small>'+escapeHTML(c[0])+'</small><b>'+escapeHTML(c[1])+'</b><span>'+escapeHTML(c[2])+'</span></article>'}).join('')+'</div><p class="transfer-note">Sur GitHub Pages, ce récapitulatif est préparé lorsque l’application est ouverte. Un envoi programmé par e-mail ou notification, même application fermée, nécessite un backend et un service de notification.</p><div class="sh-actions"><button class="btn" id="recapClose">Fermer</button></div></div></div></div>';
 document.getElementById('bgRecap').onclick=function(e){if(e.target.id==='bgRecap')closeModal()};document.getElementById('recapClose').onclick=closeModal;
}
function programmerRecapMatin(){
 if(recapMatinTimer)clearTimeout(recapMatinTimer);
 const preferences=preferencesRecapMatin();if(!preferences.actif)return;
 const maintenant=new Date(),parts=preferences.heure.split(':').map(Number),prochain=new Date(maintenant);
 prochain.setHours(parts[0],parts[1],0,0);if(prochain<=maintenant)prochain.setDate(prochain.getDate()+1);
 recapMatinTimer=setTimeout(function(){if(screen==='dash'){renderDash();toast('Votre récapitulatif du matin est prêt.')}programmerRecapMatin()},Math.min(prochain-maintenant,2147483647));
}
function profilMetierDepuisVue(id){
 return PROFILS_METIER_IDS.includes(id)?id:'';
}
function profilMetierActuel(){
 const utilisateur=utilisateurDashboardActuel(),id=utilisateur?utilisateur.profilMetier:st.profilMetier;
 return PROFILS_METIER_IDS.includes(id)?id:profilMetierDepuisVue(st.whoId);
}
async function synchroniserProfilMetierAvecVue(id){
 const profilId=profilMetierDepuisVue(id),utilisateur=utilisateurDashboardActuel();
 st.profilMetier=profilId;
 if(utilisateur){utilisateur.profilMetier=profilId;await saveAuth()}
 return profilId;
}
async function enregistrerProfilMetier(id){
 if(id&&!PROFILS_METIER_IDS.includes(id))throw new Error('Profil métier invalide');
 const utilisateur=utilisateurDashboardActuel();
 if(utilisateur){utilisateur.profilMetier=id;await saveAuth()}else{st.profilMetier=id;await save()}
 if(screen==='dash')renderDash();
 toast(id?'Profil métier enregistré.':'Vue générale restaurée.');
}
function etatSourceDashboard(source){
 const titre=source.status==='error'?'Donnée en erreur':source.status==='empty'?'Aucune donnée':'Donnée indisponible';
 return '<div class="profile-state '+(source.status==='error'?'error':'')+'"><b>'+titre+'</b><span>'+escapeHTML(source.message||'')+'</span></div>';
}
function carteMetier(label,valeur,note,classes){
 return '<article class="profile-metric '+(classes||'')+'"><small>'+label+'</small><strong class="profile-value">'+valeur+'</strong><p class="profile-note">'+note+'</p></article>';
}
function carteSourceMetier(label,source,contenu,classes){
 return '<article class="profile-metric '+(classes||'')+'"><small>'+label+'</small>'+(source.status==='ready'?contenu(source):etatSourceDashboard(source))+'</article>';
}
function enteteTableauMetier(profil,maintenant){
 const utilisateur=utilisateurDashboardActuel(),nom=((utilisateur&&utilisateur.nom)||st.who||'').split(' ')[0];
 const date=maintenant.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
 return '<section class="profile-head"><div><div class="profile-eyebrow"><i></i>'+escapeHTML(profil.i+' '+profil.n)+' · '+date.toUpperCase()+'</div><h1>Bonjour.</h1><p class="profile-intro">Les informations utiles à votre activité sont mises en avant. Ce choix ne modifie ni votre rôle, ni vos accès.</p></div><button class="profile-change" data-profile-settings>Modifier le profil métier</button></section>';
}
function renderDashboardMetier(profilId){
 const profil=PROFILS_METIER.find(function(p){return p.id===profilId});
 if(!profil){renderDashboardGeneral();return}
 const maintenant=new Date(),dateISO=dateLocaleDashboard(maintenant),ventes=resumeVentesDashboard(maintenant);
 const couverts=sourceCouvertsDashboard(dateISO),recommandations=sourceRecommandationsDashboard(dateISO),bons=sourceBonsNonSaisisDashboard(dateISO);
 const noteVentes=ventes.nombreVentes?ventes.nombreVentes+' vente'+(ventes.nombreVentes>1?'s':'')+' enregistrée'+(ventes.nombreVentes>1?'s':'')+' aujourd’hui':'Aucune vente enregistrée aujourd’hui';
 let classeGrille='',cartes='',bandeau=profilId==='barman'?blocBoissonsHebdomadaireDashboard(maintenant):blocPerformanceHebdomadaireDashboard(maintenant);
 if(profilId==='barman'){
  classeGrille=' two';
  cartes=carteMetier('COCKTAILS VENDUS',fmtQ(ventes.cocktails),noteVentes,'primary')
   +carteSourceMetier('PRODUITS À RECOMMANDER',recommandations,function(s){return '<div class="profile-list">'+s.items.slice(0,4).map(function(p){return '<div class="profile-list-row"><b>'+escapeHTML((p.i||'')+' '+p.n)+'</b><span>'+fmt(p.pv||0)+' €</span></div>'}).join('')+'</div>'});
 }else if(profilId==='chef'){
  cartes=carteSourceMetier('COUVERTS · JOURNÉE',couverts,function(s){return '<strong class="profile-value">'+s.total+'</strong><p class="profile-note">Total du midi et du soir</p>'},'primary')
   +carteSourceMetier('SERVICE DU MIDI',couverts,function(s){return '<strong class="profile-value">'+s.midi+'</strong><p class="profile-note">Couverts réalisés</p>'})
   +carteSourceMetier('SERVICE DU SOIR',couverts,function(s){return '<strong class="profile-value">'+s.soir+'</strong><p class="profile-note">Couverts réalisés</p>'});
 }else if(profilId==='salle'){
  classeGrille=' two';
  cartes=carteMetier('CHIFFRE D’AFFAIRES',fmt(ventes.ca)+' €',noteVentes,'primary')
   +carteSourceMetier('COUVERTS RÉALISÉS',couverts,function(s){return '<strong class="profile-value">'+s.total+'</strong><p class="profile-note">'+s.midi+' midi · '+s.soir+' soir</p>'});
 }else{
  const partSolide=ventes.ca>0?ventes.solide/ventes.ca*100:0,partLiquide=ventes.ca>0?ventes.liquide/ventes.ca*100:0;
  cartes=carteMetier('CHIFFRE D’AFFAIRES',fmt(ventes.ca)+' €',noteVentes,'primary')
   +'<article class="profile-metric"><small>RÉPARTITION DU CA</small>'+(ventes.ca>0?'<div class="profile-breakdown"><div class="profile-share"><span>Solide</span><b>'+fmt(ventes.solide)+' €</b><div class="profile-bar"><i style="width:'+Math.min(100,partSolide)+'%"></i></div></div><div class="profile-share"><span>Liquide</span><b>'+fmt(ventes.liquide)+' €</b><div class="profile-bar"><i style="width:'+Math.min(100,partLiquide)+'%"></i></div></div></div>':'<div class="profile-state"><b>Aucune donnée</b><span>La répartition apparaîtra dès la première vente enregistrée aujourd’hui.</span></div>')+'</article>'
   +carteSourceMetier('BONS NON SAISIS',bons,function(s){return '<strong class="profile-value">'+s.count+'</strong><p class="profile-note">Bon'+(s.count>1?'s':'')+' de commande à saisir</p>'});
 }
 const racine=document.getElementById('s-dash');
 racine.innerHTML='<div class="profile-dashboard dashboard-new">'+enteteTableauMetier(profil,maintenant)+meteoAccueilHTML()+recapMatinHTML()+bandeau+'<section class="profile-metrics'+classeGrille+'" aria-label="Indicateurs '+escapeHTML(profil.n)+'">'+cartes+'</section>'+adminWidgetAccueil()+'</div>';
 const reglages=racine.querySelector('[data-profile-settings]');if(reglages)reglages.onclick=function(){openReglages('general')};
 const recap=racine.querySelector('[data-open-recap]');if(recap)recap.onclick=ouvrirRecapMatin;
 lierWidgetAdministration(racine);
 actualiserMeteoAccueil();
}
let dashboardRenderVersion=0;
function renderDash(){
 const profilId=profilMetierActuel(),racine=document.getElementById('s-dash'),version=++dashboardRenderVersion;
 if(!profilId){renderDashboardGeneral();return}
 racine.innerHTML='<div class="dashboard-state" role="status"><div class="dashboard-state-card"><div class="dashboard-loader"></div><b>Chargement du tableau de bord</b><span>Préparation des indicateurs de votre profil métier…</span></div></div>';
 Promise.resolve().then(function(){
  if(version!==dashboardRenderVersion||screen!=='dash')return;
  try{renderDashboardMetier(profilId)}catch(e){renderDashboardErreur(e)}
 });
}
function renderDashboardErreur(erreur){
 console.error('Tableau de bord indisponible',erreur);
 const racine=document.getElementById('s-dash');
 racine.innerHTML='<div class="dashboard-state" role="alert"><div class="dashboard-state-card"><b>Tableau de bord indisponible</b><span>Les indicateurs n’ont pas pu être chargés. Vos données et vos accès n’ont pas été modifiés.</span><button id="dashboardRetry">Réessayer</button></div></div>';
 const retry=document.getElementById('dashboardRetry');if(retry)retry.onclick=renderDash;
}

/* ═════ TABLEAU DE BORD · vue générale et données réellement enregistrées ═════ */
function renderDashboardGeneral(){
 const produits=st.prods||[],mouvements=st.mv||[],commandes=st.commandes||[];
 const ruptures=produits.filter(function(p){return(st.stock[p.id]??0)<=0});
 const sousSeuil=produits.filter(function(p){const q=st.stock[p.id]??0;return q>0&&q<=p.seuil});
 const commandesEnCours=commandes.filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'});
 const maintenant=new Date(),jourISO=maintenant.toISOString().slice(0,10);
 const commandesARecevoir=commandesEnCours.filter(function(c){return c.dateLiv&&c.dateLiv<=jourISO});
 const aVerifier=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0});
 const debutJour=new Date();debutJour.setHours(0,0,0,0);
 const ventesJour=mouvements.filter(function(m){return m.motif==='vente'&&new Date(m.ts)>=debutJour});
 const caJour=ventesJour.reduce(function(s,m){return s+pvMv(m)},0);
 const date=maintenant.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}),heure=maintenant.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 let performance='<section class="wb-empty">Les ventes enregistrées alimenteront les tendances ici.</section>';
 try{performance=blocPerformanceHebdomadaireDashboard(maintenant)}catch(e){console.warn('Performance indisponible',e)}
 let complements='';
 try{complements=meteoAccueilHTML()+recapMatinHTML()+adminWidgetAccueil()}catch(e){console.warn('Compléments du tableau de bord indisponibles',e)}
 const decisions=[];
 if(ruptures.length)decisions.push({title:ruptures.length+' rupture'+(ruptures.length>1?'s':''),detail:ruptures.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Voir le stock',screen:'stock',tone:'critical'});
 if(sousSeuil.length)decisions.push({title:sousSeuil.length+' produit'+(sousSeuil.length>1?'s':'')+' sous le seuil',detail:sousSeuil.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Préparer la commande',screen:'cmd',tone:'watch'});
 if(commandesARecevoir.length)decisions.push({title:commandesARecevoir.length+' réception'+(commandesARecevoir.length>1?'s':''),detail:'Quantités à contrôler avant l’entrée en stock',action:'Réceptionner',screen:'liv',tone:'receive'});
 if(aVerifier.length)decisions.push({title:aVerifier.length+' sortie'+(aVerifier.length>1?'s':'')+' à classer',detail:'Offert, perte ou annulation à rattacher à une vente',action:'Traiter',screen:'caisse',tone:'review'});
 const decisionRows=decisions.length?decisions.slice(0,4).map(function(d){return '<button class="wb-decision '+d.tone+'" data-dashgo="'+d.screen+'"><span class="wb-decision-mark"></span><span><b>'+escapeHTML(d.title)+'</b><small>'+escapeHTML(d.detail)+'</small></span><em>'+d.action+'</em><i>›</i></button>'}).join(''):'<div class="wb-empty">Aucune action urgente. Les données disponibles sont à jour.</div>';
 const stockRows=ruptures.concat(sousSeuil).slice(0,5).map(function(p){const q=st.stock[p.id]??0,etat=q<=0?'Rupture':'Sous seuil';return '<button class="wb-stock-row" data-dashgo="stock"><span>'+escapeHTML(p.i||'□')+'</span><b>'+escapeHTML(p.n)+'</b><small>'+fmtQ(q)+' '+escapeHTML(p.u||'')+'</small><em class="'+(q<=0?'critical':'watch')+'">'+etat+'</em><i>›</i></button>'}).join('')||'<div class="wb-empty">Aucun produit à surveiller.</div>';
 const service=st.serviceActif&&st.serviceActif.id?st.serviceActif:null;
 const serviceTexte=service?'Service '+(service.type==='midi'?'du midi':'du soir')+' ouvert':'Aucun service ouvert';
 document.getElementById('s-dash').innerHTML='<div class="workbench">'
  +'<header class="wb-head"><div><small>OPÉRATIONS</small><h1>Bonjour</h1><p>'+date.charAt(0).toUpperCase()+date.slice(1)+' · mise à jour à '+heure+'</p></div><button class="wb-service" data-dashgo="dec"><i></i><span>'+serviceTexte+'</span><b>Ouvrir</b></button></header>'
  +'<section class="wb-focus"><header><div><small>À TRAITER</small><b>Ce qui demande une décision</b></div><span>'+decisions.length+' élément'+(decisions.length>1?'s':'')+'</span></header><div class="wb-decision-list">'+decisionRows+'</div></section>'
  +'<section class="wb-overview"><section class="wb-performance">'+performance+'</section><section class="wb-stock"><header><div><small>STOCK</small><b>Niveaux à surveiller</b></div><button data-dashgo="stock">Tout voir</button></header><div class="wb-stock-list">'+stockRows+'</div></section></section>'
  +'<section class="wb-ledger"><header><div><small>ACTIVITÉ DU JOUR</small><b>Ventes enregistrées</b></div><button data-dashgo="caisse">Ouvrir les ventes</button></header><div class="wb-ledger-line"><span>Chiffre d’affaires issu des ventes enregistrées</span><b>'+fmt(caJour)+' €</b><em>'+ventesJour.length+' vente'+(ventesJour.length>1?'s':'')+'</em></div></section>'
  +complements+'</div>';
 document.querySelectorAll('[data-dashgo]').forEach(function(b){b.onclick=function(){screen=b.dataset.dashgo;sq='';go()}});
 document.querySelectorAll('[data-open-recap]').forEach(function(b){b.onclick=ouvrirRecapMatin});
 lierWidgetAdministration(document.getElementById('s-dash'));
 try{actualiserMeteoAccueil()}catch(e){console.warn('Météo indisponible',e)}
}
function renderDashboardGeneralLegacy(){
 const produits=st.prods||[],mouvements=st.mv||[],commandes=st.commandes||[];
 const ruptures=produits.filter(function(p){return(st.stock[p.id]??0)<=0});
 const sousSeuil=produits.filter(function(p){const q=st.stock[p.id]??0;return q>0&&q<=p.seuil});
 const commandesEnCours=commandes.filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'});
 const maintenant=new Date(),jourISO=maintenant.toISOString().slice(0,10);
 const commandesARecevoir=commandesEnCours.filter(function(c){return c.dateLiv&&c.dateLiv<=jourISO});
 const aVerifier=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0});
 const debutJour=new Date();debutJour.setHours(0,0,0,0);
 const ventesJour=mouvements.filter(function(m){return m.motif==='vente'&&new Date(m.ts)>=debutJour});
 const caJour=ventesJour.reduce(function(s,m){return s+pvMv(m)},0);
 const nom=(st.who||'').split(' ')[0]||'';
 const performanceHebdomadaire=blocPerformanceHebdomadaireDashboard(maintenant);
 const priorite=ruptures.length?{titre:ruptures.length+' rupture'+(ruptures.length>1?'s':''),detail:ruptures.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Voir le stock',screen:'stock',etat:'critical'}:sousSeuil.length?{titre:sousSeuil.length+' sous seuil',detail:sousSeuil.slice(0,2).map(function(p){return p.n}).join(' · '),action:'Préparer la commande',screen:'cmd',etat:'watch'}:commandesARecevoir.length?{titre:commandesARecevoir.length+' réception'+(commandesARecevoir.length>1?'s':''),detail:'Quantités à contrôler',action:'Réceptionner',screen:'liv',commandeId:commandesARecevoir[0].id,etat:'pending'}:aVerifier.length?{titre:aVerifier.length+' vente'+(aVerifier.length>1?'s':'')+' à classer',detail:'Offert, perte ou annulation',action:'Ouvrir la caisse',screen:'caisse',etat:'review'}:{titre:'Tout est prêt.',detail:'Aucune action urgente pour le moment.',action:'Voir le stock',screen:'stock',etat:'clear'};
 const attr=priorite.commandeId?'data-dashreceive="'+priorite.commandeId+'"':'data-dashgo="'+priorite.screen+'"';
 const stockRows=ruptures.concat(sousSeuil).slice(0,4).map(function(p){const q=st.stock[p.id]??0,etat=q<=0?'Rupture':'Sous seuil';return '<button class="dash-row" data-dashgo="stock"><span class="dash-row-icon">'+(p.i||'□')+'</span><span><b>'+escapeHTML(p.n)+'</b><small>'+fmtQ(q)+' '+escapeHTML(p.u||'')+' en stock</small></span><em class="'+(q<=0?'danger':'warning')+'">'+etat+'</em><i>›</i></button>'}).join('')||'<div class="dash-empty">Aucun produit à surveiller.</div>';
 const actions=[];
 commandesARecevoir.slice(0,2).forEach(function(c){actions.push('<button data-dashreceive="'+c.id+'"><span>Réception · '+escapeHTML(c.fournisseur||'Fournisseur')+'</span><i>›</i></button>')});
 aVerifier.slice(0,2).forEach(function(m){actions.push('<button data-dashgo="caisse"><span>À classer · '+escapeHTML(m.platN||'Vente')+'</span><i>›</i></button>')});
 commandesEnCours.filter(function(c){return !commandesARecevoir.some(function(a){return a.id===c.id})}).slice(0,1).forEach(function(c){actions.push('<button data-dashgo="cmd"><span>Commande en cours · '+escapeHTML(c.fournisseur||'Fournisseur')+'</span><i>›</i></button>')});
 const actionRows=actions.length?actions.slice(0,3).join(''):'<div class="dash-actions-empty">Rien à faire maintenant.</div>';
 const date=maintenant.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}),heure=maintenant.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 const titre=priorite.etat==='clear'?'Bonjour.':'À traiter maintenant.';
 const demo='';
 document.getElementById('s-dash').innerHTML=demo+'<div class="dashboard-new">'
 +performanceHebdomadaire
 +meteoAccueilHTML()
 +recapMatinHTML()
 +'<section class="dash-head"><div><div class="dash-eyebrow"><i></i>VUE D’ENSEMBLE · '+date.toUpperCase()+'</div><h1>'+titre+'</h1><p>'+escapeHTML(priorite.detail)+'</p><button class="dash-main-action" '+attr+'>'+priorite.action+' <i>›</i></button></div><aside class="dash-sales"><small>VENTES AUJOURD’HUI</small><b>'+fmt(caJour)+' €</b><span>'+ventesJour.length+' vente'+(ventesJour.length>1?'s':'')+' enregistrée'+(ventesJour.length>1?'s':'')+'</span><time>Actualisé · '+heure+'</time></aside></section>'
 +'<section class="dash-kpis" aria-label="Raccourcis de suivi">'
 +'<button class="dash-kpi '+(ruptures.length?'critical':'clear')+'" data-dashgo="stock"><small>RUPTURES</small><b>'+ruptures.length+'</b><span>'+(ruptures.length?'À traiter':'Stock stable')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(sousSeuil.length?'watch':'clear')+'" data-dashgo="cmd"><small>SOUS SEUIL</small><b>'+sousSeuil.length+'</b><span>'+(sousSeuil.length?'À anticiper':'Rien à commander')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(commandesARecevoir.length?'pending':'clear')+'" data-dashgo="liv"><small>RÉCEPTIONS</small><b>'+commandesARecevoir.length+'</b><span>'+(commandesARecevoir.length?'À contrôler':'Aucune prévue')+'<i>›</i></span></button>'
 +'<button class="dash-kpi '+(aVerifier.length?'review':'clear')+'" data-dashgo="caisse"><small>À CLASSER</small><b>'+aVerifier.length+'</b><span>'+(aVerifier.length?'Caisse à vérifier':'Caisse à jour')+'<i>›</i></span></button></section>'
 +'<section class="dash-grid"><section class="dash-panel"><header class="dash-panel-head"><div><small>STOCK</small><b>À surveiller</b></div><button data-dashgo="stock">Voir le stock</button></header><div class="dash-list">'+stockRows+'</div></section><aside class="dash-side"><section class="dash-actions"><small>PROCHAINES ACTIONS</small><b>À faire</b>'+actionRows+'</section></aside></section>'
 +'<section class="dash-cash"><div class="dash-cash-copy"><i>€</i><div><small>CAISSE</small><b>'+fmt(caJour)+' € aujourd’hui</b><span>'+aVerifier.length+' mouvement'+(aVerifier.length>1?'s':'')+' à classer</span></div></div><button data-dashgo="caisse">Ouvrir la caisse</button></section>'+adminWidgetAccueil()+'</div>';
 document.querySelectorAll('[data-dashgo]').forEach(function(b){b.onclick=function(){screen=b.dataset.dashgo;sq='';go()}});
 document.querySelectorAll('[data-dashreceive]').forEach(function(b){b.onclick=function(){screen='liv';sq='';go();openLiv(b.dataset.dashreceive)}});
 document.querySelectorAll('[data-open-recap]').forEach(function(b){b.onclick=ouvrirRecapMatin});
 lierWidgetAdministration(document.getElementById('s-dash'));
 actualiserMeteoAccueil();
}
