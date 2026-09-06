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

