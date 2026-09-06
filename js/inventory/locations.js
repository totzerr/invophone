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


