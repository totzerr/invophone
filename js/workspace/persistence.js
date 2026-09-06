async function load(){const s=await Store.get(dataKey());if(s)st=Object.assign(st,s);
if(!s&&peutSynchroniserEspace()&&window.SwaySupabaseAuth){try{const distant=await window.SwaySupabaseAuth.loadWorkspaceState(session.etabId);if(distant.error)console.warn('Chargement Sway différé :',distant.error);else if(distant.state&&typeof distant.state==='object'){st=Object.assign(st,distant.state,{cloudUpdatedAt:distant.updatedAt||''});await Store.set(dataKey(),st)}}catch(error){console.warn('Chargement Sway différé :',error)}}
/* Fin du flux fictif : INVO démarre désormais toujours en caisse manuelle. */
if(!s||s.modeCaisse!=='manuel'){st.modeCaisse='manuel';st.live=false;}
/* Aucun flux fictif ne peut survivre hors du parcours de démonstration explicite. */
if(!st.demoParcours)st.live=false;
if(!st.doseurs)st.doseurs={actif:false,releves:{}};
if(!st.meteo||typeof st.meteo!=='object')st.meteo={ville:'',cache:null};
if(!st.liv)st.liv=[];if(!st.invHist)st.invHist=[];if(!st.photos)st.photos={};
if(!Array.isArray(st.fournisseurs))st.fournisseurs=[];
if(!Array.isArray(st.commandes))st.commandes=[];
if(!Array.isArray(st.commandeBrouillons))st.commandeBrouillons=[];
if(!Array.isArray(st.receptionBrouillons))st.receptionBrouillons=[];
if(!Array.isArray(st.legacyTransfers))st.legacyTransfers=[];
if(!st.administration||typeof st.administration!=='object')st.administration=administrationVierge();
else{
 const a=administrationVierge();
 Object.keys(a).forEach(function(k){if(st.administration[k]===undefined)st.administration[k]=a[k]});
 if(!st.administration.settings||typeof st.administration.settings!=='object')st.administration.settings=a.settings;
 Object.keys(a.settings).forEach(function(k){if(st.administration.settings[k]===undefined)st.administration.settings[k]=a.settings[k]});
 Object.keys(a.settings.integrations).forEach(function(k){if(st.administration.settings.integrations[k]===undefined)st.administration.settings.integrations[k]=a.settings.integrations[k]});
}
if(!st.docs)st.docs={};          /* documents scannés (bons de livraison) */
if(!st.refFo)st.refFo={};        /* mémoire : référence fournisseur -> produit Invo */
if(!st.brouillons)st.brouillons=[];
if(!st.serviceActif||typeof st.serviceActif!=='object')st.serviceActif=null;
if(!Array.isArray(st.serviceHist))st.serviceHist=[];
if(st.modePilote===undefined)st.modePilote=false;
if(!Array.isArray(st.prods))st.prods=st.modePilote?[]:JSON.parse(JSON.stringify(PRODUITS_DEF));
else if(!st.prods.length&&!st.modePilote)st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
let ordreMigre=false;
st.prods.forEach(p=>{if(!p.z){p.z='reserve';ordreMigre=true}if(!p.fo)p.fo='Divers';
 if(p.dlc===undefined){const d=PRODUITS_DEF.find(x=>x.id===p.id);
  p.dlc=d?d.dlc:((p.u==='cl'||p.u==='btl')?0:7)}});
ZONES_L.forEach(z=>{
 const produits=st.prods.map((p,index)=>({p,index})).filter(x=>(x.p.z||'reserve')===z)
  .sort((a,b)=>{
   const ao=Number(a.p.displayOrder),bo=Number(b.p.displayOrder),av=Number.isFinite(ao),bv=Number.isFinite(bo);
   return av&&bv?ao-bo:(av?-1:(bv?1:a.index-b.index))});
 produits.forEach((x,index)=>{if(x.p.displayOrder!==index){x.p.displayOrder=index;ordreMigre=true}});
});
if(!Array.isArray(st.carte))st.carte=st.modePilote?[]:JSON.parse(JSON.stringify(CARTE_DEF));
else if(!st.carte.length&&!st.modePilote)st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
if(migrerUnitesBoissons())ordreMigre=true;
if(migrationInventaireEmplacements())ordreMigre=true;
if(!Object.keys(st.stock).length)st.prods.forEach(p=>st.stock[p.id]=p.s);
assurerFournisseurs();
if(ordreMigre)await Store.set(dataKey(),st);demarrerSynchronisationDirecteSway()}
const save=()=>{const resultat=Store.set(dataKey(),st);programmerSynchronisationSway();return resultat};
/* ── Sauvegarde locale : aucun envoi réseau, uniquement un fichier INVO. ── */
const BACKUP_MAX=120*1024*1024;
const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function dlJson(data,name){
 const blob=new Blob([JSON.stringify(data)],{type:'application/json;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function nomSauvegarde(suffix=''){
 return 'invo-sauvegarde'+suffix+'_'+new Date().toISOString().slice(0,10)+'.json';
}
async function creerSauvegarde(){
 const documents={}, ids=new Set(Object.keys(st.docs||{}));
 (st.liv||[]).forEach(l=>(l.docs||[]).forEach(k=>ids.add(k)));
 ((st.administration&&st.administration.documents)||[]).forEach(function(d){if(d.fileKey)ids.add(d.fileKey)});
 for(const k of ids){
  const v=Docs.get(k)||await Docs.getAsync(k);
  if(typeof v==='string'&&(v.startsWith('data:image/')||v.startsWith('data:application/pdf')))documents[k]=v;
 }
 return {format:'invo-backup',version:1,exportedAt:new Date().toISOString(),
  data:JSON.parse(JSON.stringify(st)),documents};
}
async function exporterSauvegarde(){
 const pack=await creerSauvegarde();dlJson(pack,nomSauvegarde());return pack;
}
function lireTexteFichier(f){
 return new Promise((res,rej)=>{const r=new FileReader();
  r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(r.error||new Error('lecture'));
  r.readAsText(f,'utf-8');});
}
function backupValide(pack){
 const d=pack&&pack.data;
 return obj(pack)&&pack.format==='invo-backup'&&pack.version===1&&obj(d)&&
  Array.isArray(d.prods)&&Array.isArray(d.carte)&&obj(d.stock)&&Array.isArray(d.mv);
}

/* ── Passage volontaire de la démonstration à une base pilote vide. ── */
async function preparerTestReel(){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('pilotConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-pilote'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;
 st.modePilote=true;st.prods=[];st.carte=[];st.stock={};
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='stock';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();toast(t('pilotReady'));
}


/* ── Retour volontaire à la démonstration, toujours précédé d'une sauvegarde. ── */
async function resetDemo(){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('resetConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-reset'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId,svc=st.svc;
 const doseurs=st.doseurs?JSON.parse(JSON.stringify(st.doseurs)):undefined;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;st.svc=svc;
 if(doseurs)st.doseurs=doseurs;
 st.modePilote=false;st.demoParcours=false;
 st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
 st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
 st.prods.forEach(p=>st.stock[p.id]=p.s);
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='caisse';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();toast(t('cleared'));
}

/* Parcours entièrement fictif : il sert à vérifier les connexions commande,
   réception et caisse sans présenter ces données comme celles d'un restaurant. */
async function chargerParcoursDemonstration(fluxAutomatique){
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('pilotDemoConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-demo'));
 const etabNom=st.etabNom,lang=st.lang,who=st.who,whoId=st.whoId,svc=st.svc;
 const doseurs=st.doseurs?JSON.parse(JSON.stringify(st.doseurs)):undefined;
 st=stVierge();
 st.lang=lang;st.who=who;st.whoId=whoId;st.etabNom=etabNom;st.svc=svc;
 if(doseurs)st.doseurs=doseurs;
 st.modePilote=false;st.demoParcours=true;st.live=!!fluxAutomatique;
 st.prods=JSON.parse(JSON.stringify(PRODUITS_DEF));
 st.carte=JSON.parse(JSON.stringify(CARTE_DEF));
 st.prods.forEach(p=>st.stock[p.id]=p.s);
 /* Le stock ci-dessous est l'état actuel fictif après une première réception. */
 st.stock.soft_33=55;st.stock.redbull=20;
 assurerFournisseurs();
 const commandeId='demo_cmd_reception';
 const maintenant=new Date(),hier=new Date(maintenant.getTime()-86400000);
 const dateLiv=maintenant.toISOString().slice(0,10);
 st.commandes=[{id:commandeId,fournisseur:'France Boissons',dateLiv:dateLiv,
  cree:hier.toISOString(),statut:'partielle',
  lines:[{id:'soft_33',q:80,px:.72},{id:'redbull',q:36,px:1.30}]}];
 st.liv=[{id:'demo_liv_partielle',fo:'France Boissons',ts:hier.toISOString(),
  lines:[{id:'soft_33',q:30,px:.72},{id:'redbull',q:12,px:1.30}],
  total:37.20,commandeId:commandeId,src:'demo'}];
 const venteLibre=creerMouvement({id:'demo_vente_a_verifier',src:'demo',motif:'vente',plat:'spritzAp',qty:2,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 const venteOfferte=creerMouvement({id:'demo_vente_offerte',src:'demo',motif:'vente',plat:'wallaceBurger',qty:1,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 if(venteOfferte.ok)creerMouvement({id:'demo_offert',src:'demo',motif:'offClient',plat:'wallaceBurger',qty:1,parent:venteOfferte.mv.id,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 const venteAnnulee=creerMouvement({id:'demo_vente_annulee',src:'demo',motif:'vente',plat:'vAbsolut',qty:1,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 if(venteAnnulee.ok)creerMouvement({id:'demo_annulation',src:'demo',motif:'annul',plat:'vAbsolut',qty:1,parent:venteAnnulee.mv.id,table:'Démo',ts:maintenant.toISOString()},{forcer:true});
 Docs._cache={};panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;screen='dash';
 _pvCache=null;_pvCle='';
 await save();closeModal();renderAll();startFeed();
 if(st.live)setTimeout(posEvent,900);
 toast(st.live?'Démo caisse lancée : données de test uniquement.':t('pilotDemoReady'));
}

async function importerSauvegarde(f){
 if(!f)return;
 if(f.size>BACKUP_MAX){toast(t('backupTooBig'));return}
 let pack;
 try{pack=JSON.parse(await lireTexteFichier(f))}catch(e){toast(t('backupRead'));return}
 if(!backupValide(pack)){toast(t('backupFormat'));return}
 let avant;
 try{avant=await creerSauvegarde()}catch(e){toast(t('backupRead'));return}
 if(!confirm(t('backupConfirm')))return;
 dlJson(avant,nomSauvegarde('-avant-restauration'));
 st=Object.assign(stVierge(),pack.data);
 st.modeCaisse='manuel';st.live=false;st.docs=st.docs||{};
 Docs._cache={};
 await Docs.restaurer(pack.documents||{});
 await save();
 panier={};panierMotifs={};motif=null;motifsSelectionnes=[];decPhoto=null;_pvCache=null;_pvCle='';
 closeModal();renderAll();toast(t('backupRestored'));
}

