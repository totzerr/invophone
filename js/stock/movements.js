function deduire(id,q){const c=item(id);if(!c)return;
for(const [pid,x] of Object.entries(c.f||{}))st.stock[pid]=Math.max(0,(st.stock[pid]||0)-qteFicheEnStock(c,pid,x*q))}
/* ═══════════════════════════════════════════════════════════
   TRAÇABILITÉ DES MOUVEMENTS
   Chaîne obligatoire :
     PRODUIT ENREGISTRÉ → STOCK → VENTE/ENVOI → ANNULATION/OFFERT/PERTE
   Aucun mouvement ne peut exister sans produit au catalogue.
   Une annulation doit pointer vers la vente qu'elle annule.
   ═══════════════════════════════════════════════════════════ */

const MOTIFS_PRIMAIRES=['vente','envoi'];              /* créent la consommation */
const MOTIF_REVERSE='annul';                           /* restitue le stock */
/* Ces motifs ne créent jamais une seconde sortie de stock : ils qualifient
   une ligne déjà envoyée par la caisse ou enregistrée comme transaction. */
const MOTIFS_A_TRACER=['annul','offClient','offPart','offGroupe','casse','rate'];

/* Quantité d'une vente/envoi qui peut encore être qualifiée ou annulée.
   Une même quantité ne peut recevoir qu'une seule qualification. */
function resteATracer(mvId){
 const p=(st.mv||[]).find(m=>String(m.id)===String(mvId));
 if(!p||!MOTIFS_PRIMAIRES.includes(p.motif))return 0;
 const deja=(st.mv||[])
  .filter(m=>MOTIFS_A_TRACER.includes(m.motif)&&String(m.parent)===String(mvId))
  .reduce((s,m)=>s+(m.qty||0),0);
 return Math.max(0,(p.qty||0)-deja);
}

/* Ventes/envois d'un produit encore qualifiables, du plus récent au plus ancien */
function ventesATracer(platId){
 return (st.mv||[])
  .filter(m=>MOTIFS_PRIMAIRES.includes(m.motif)&&m.plat===platId&&resteATracer(m.id)>0)
  .sort((a,b)=>new Date(b.ts)-new Date(a.ts));
}

/* Le stock permet-il cette sortie ? Renvoie les matières insuffisantes. */
function stockSuffisant(platId,q){
 const c=item(platId);
 if(!c||!c.f)return{ok:true,manques:[]};
 const manques=[];
 for(const [pid,x] of Object.entries(c.f)){
  const besoin=qteFicheEnStock(c,pid,x*q), dispo=st.stock[pid]||0;
  if(besoin>dispo+1e-9){
   const p=prod(pid);
   manques.push({id:pid,n:p?p.n:pid,u:p?p.u:'',besoin,dispo});
  }
 }
 return{ok:!manques.length,manques};
}

/* ── Validation : refuse tout mouvement incohérent ── */
function validerMouvement(m){
 /* 1. Le produit doit exister au catalogue */
 const c=item(m.plat);
 if(!m.plat||!c)return{ok:false,code:'produit_inconnu',
  msg:t('trProduitInconnu').replace('%p',m.platN||m.plat||'?')};

 /* 2. Quantité exploitable */
 const q=Number(m.qty);
 if(!(q>0)||!isFinite(q))return{ok:false,code:'quantite_invalide',msg:t('trQteInvalide')};

 /* 3. Motif connu */
 const motifsOk=[...MOTIFS_PRIMAIRES,MOTIF_REVERSE,...MOTIFS.map(x=>x.id)];
 if(!m.motif||!motifsOk.includes(m.motif))
  return{ok:false,code:'motif_inconnu',msg:t('trMotifInconnu')};

 /* 4. Annulation, offert et perte : toujours rattachés à une ligne primaire. */
 if(MOTIFS_A_TRACER.includes(m.motif)){
  if(!m.parent)return{ok:false,code:'annul_sans_parent',msg:t('trAnnulSansVente')};
  const p=(st.mv||[]).find(x=>String(x.id)===String(m.parent));
  if(!p)return{ok:false,code:'parent_absent',msg:t('trParentAbsent')};
  if(!MOTIFS_PRIMAIRES.includes(p.motif))
   return{ok:false,code:'parent_invalide',msg:t('trParentInvalide')};
  if(p.plat!==m.plat)
   return{ok:false,code:'parent_autre_produit',msg:t('trParentAutreProduit')};
  const reste=resteATracer(m.parent);
  if(reste<=0)return{ok:false,code:'deja_annule',msg:t('trDejaAnnule')};
  if(q>reste+1e-9)return{ok:false,code:'annul_trop',
   msg:t('trAnnulTrop').replace('%q',fmtQ(q)).replace('%r',fmtQ(reste))};
 }

 /* 5. Seules les transactions primaires et les sorties directes consomment le stock. */
 let alerte=null;
 if(!MOTIFS_A_TRACER.includes(m.motif)){
  const s=stockSuffisant(m.plat,q);
  if(!s.ok){
   alerte={code:'stock_insuffisant',
    msg:t('trStockInsuffisant').replace('%l',s.manques.slice(0,3)
     .map(x=>`${x.n} (${fmtQ(x.dispo)}/${fmtQ(x.besoin)} ${x.u})`).join(', ')),
    manques:s.manques};
  }
 }
 return{ok:true,alerte};
}

/* ── Création : seul point d'entrée autorisé pour écrire un mouvement ──
   Applique le stock uniquement après validation réussie. */
function creerMouvement(m,opts){
 opts=opts||{};
 const v=validerMouvement(m);
 if(!v.ok)return v;
 if(v.alerte&&!opts.forcer&&!opts.accepteAlerte)
  return{ok:false,code:v.alerte.code,msg:v.alerte.msg,alerte:v.alerte,confirmable:true};

 const c=item(m.plat);
 const q=Number(m.qty);
 const parentMv=m.parent?(st.mv||[]).find(function(x){return String(x.id)===String(m.parent)}):null;
 const sessionEnCours=st.serviceActif&&m.src!=='demo'?st.serviceActif:null;
 const serviceId=m.serviceId||(parentMv&&parentMv.serviceId)||(sessionEnCours&&sessionEnCours.id)||null;
 const serviceType=m.serviceType||(parentMv&&parentMv.serviceType)||(sessionEnCours&&sessionEnCours.type)||null;

 /* Effet sur le stock : annulation restitue ; offert/perte qualifient sans déduire. */
 if(m.motif===MOTIF_REVERSE) rendreStock(m.plat,q);
 else if(!MOTIFS_A_TRACER.includes(m.motif))deduire(m.plat,q);

 const mv={
  id:m.id||(Date.now()+Math.random()),
  src:m.src||'main',
  motif:m.motif,
  plat:m.plat, platN:c.n, platI:c.i,
  qty:q,
  table:m.table||'—',
  who:m.who||st.who,
  ts:m.ts||new Date().toISOString(),
  parent:m.parent||null,
  serviceId:serviceId,
  serviceType:serviceType,
  chaine:m.parent?'qualification':'primaire'
 };
 if(m.ph)mv.ph=m.ph;
 if(v.alerte)mv.alerte=v.alerte.code;

 st.mv.unshift(mv);
 if(st.mv.length>250)st.mv.length=250;
 return{ok:true,mv,alerte:v.alerte||null};
}

/* ── Validation d'un lot : aucune écriture tant que tout le lot n'est pas cohérent. ── */
function validerLotMouvements(mouvements,opts){
 opts=opts||{};
 const refus=[],besoins={};
 for(const m of mouvements){
  const v=validerMouvement(m);
  if(!v.ok){refus.push({msg:v.msg,confirmable:false});continue}
  if(!MOTIFS_A_TRACER.includes(m.motif)){
   const c=item(m.plat);
   for(const [pid,x] of Object.entries(c.f||{})){
    const b=besoins[pid]||{q:0};
    b.q+=qteFicheEnStock(c,pid,x*Number(m.qty));besoins[pid]=b;
   }
  }
 }
 if(refus.length)return{ok:false,refus};
 if(!opts.forcer&&!opts.accepteAlerte){
  const manques=Object.entries(besoins).map(([id,b])=>{
   const p=prod(id),dispo=st.stock[id]||0;
   return{id,n:p?p.n:id,u:p?p.u:'',besoin:b.q,dispo};
  }).filter(x=>x.besoin>x.dispo+1e-9);
  if(manques.length){
   const msg=t('trStockInsuffisant').replace('%l',manques.slice(0,3)
    .map(x=>`${x.n} (${fmtQ(x.dispo)}/${fmtQ(x.besoin)} ${x.u})`).join(', '));
   return{ok:false,refus:[{msg,confirmable:true}]};
  }
 }
 return{ok:true,refus:[]};
}

/* Restitution de stock (annulation) */
function rendreStock(platId,q){
 const c=item(platId);
 if(!c||!c.f)return;
 for(const [pid,x] of Object.entries(c.f))st.stock[pid]=(st.stock[pid]||0)+qteFicheEnStock(c,pid,x*q);
}

/* Remonter la chaîne d'un mouvement, pour l'affichage */
function chaineMouvement(mvId){
 const m=(st.mv||[]).find(x=>x.id===mvId);
 if(!m)return[];
 const ch=[m];
 let cur=m,garde=0;
 while(cur&&cur.parent&&garde++<10){
  const p=(st.mv||[]).find(x=>x.id===cur.parent);
  if(!p)break;
  ch.push(p);cur=p;
 }
 return ch.reverse();
}

function toast(msg,type){const el=document.getElementById('toast');if(!el)return;const text=String(msg||''),lower=text.toLowerCase();const tone=type||(/impossible|erreur|échec|refus|invalide|manquant/.test(lower)?'danger':/attention|vérifier|hausse|alerte/.test(lower)?'warning':/démo|prévisualisation|prévu/.test(lower)?'info':'success');const icons={success:'✓',warning:'!',danger:'×',info:'i'};el.innerHTML='';const notice=document.createElement('div');notice.className='toast is-'+tone;const icon=document.createElement('span');icon.className='toast-icon';icon.textContent=icons[tone]||icons.success;const label=document.createElement('span');label.textContent=text;notice.append(icon,label);el.appendChild(notice);setTimeout(()=>{if(el.contains(notice))el.innerHTML=''},2600)}

/* ═════ FLUX CAISSE ═════ */
function posEvent(){
 /* Flux automatique réservé au parcours fictif : jamais au test réel. */
 if(!st.live||!st.demoParcours||!st.carte.length)return;
 const c=st.carte[Math.floor(Math.random()*st.carte.length)];
 const pool=c.k==='food'
 ?['vente','vente','vente','vente','vente','vente','vente','offClient','annul','perso']
 :['vente','vente','vente','vente','vente','vente','vente','offClient','offGroupe','annul'];
 let mo=pool[Math.floor(Math.random()*pool.length)];
 const q=mo==='vente'?(Math.random()<.72?1:(Math.random()<.7?2:3)):1;

 /* Annulation/offert/perte : uniquement après une ligne primaire correspondante. */
 let parent=null;
 if(MOTIFS_A_TRACER.includes(mo)){
  const cand=ventesATracer(c.id);
  if(cand.length){parent=cand[0].id}
  else{mo='vente'}                      /* sinon on retombe sur une vente */
 }
 const r=creerMouvement({src:'demo',motif:mo,plat:c.id,qty:q,
  table:'Démo automatique',who:'INVO · Démo',
  parent},{accepteAlerte:true});        /* la caisse reflète le réel : on enregistre et on signale */
 if(!r.ok)return;                       /* mouvement incohérent : jamais écrit */

 st.lastSync=Date.now();save();
 /* La Démo caisse actualise immédiatement les indicateurs visibles. */
 if(screen==='dash'){renderNav();renderDash();}
 else if(screen==='caisse'){seenFeed=st.mv.length;renderCaisse();}
 else renderNav();
}

function startFeed(){if(timer)clearInterval(timer);timer=setInterval(()=>{if(st.live)posEvent()},3800)}
function sinceSync(){const s=Math.floor((Date.now()-st.lastSync)/1000);return s<60?s+' s':Math.floor(s/60)+' min'}

function openQualification(mvId){
 const m=(st.mv||[]).find(x=>String(x.id)===String(mvId)),reste=resteATracer(mvId);if(!m||reste<=0)return;
 const c=item(m.plat),choix=MOTIFS.filter(x=>MOTIFS_A_TRACER.includes(x.id)&&(x.ap==='tous'||x.ap===c.k));
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgQual"><div class="sheet">
 <h3>${t('qualifier')}</h3><p class="sh-sub">${t('qualifierS')}</p>
 <div class="hint">${m.platI} <b>${m.platN}</b><br>${t('resteQ')} : ${fmtQ(reste)}</div>
 <div class="fld"><label>${t('etape2')}</label><select id="qMotif">${choix.map(x=>`<option value="${x.id}">${x.i} ${t(x.id)}</option>`).join('')}</select></div>
 <div class="fld"><label>${t('resteQ')}</label><input id="qQty" inputmode="decimal" value="${fmtQ(reste)}"></div>
 <div class="sh-actions"><button class="btn btn-2" id="qCancel">${t('cancel')}</button><button class="btn" id="qSave">${t('confQual')}</button></div></div></div>`;
 const bg=document.getElementById('bgQual');bg.onclick=e=>{if(e.target===bg)closeModal()};
 document.getElementById('qCancel').onclick=closeModal;
 document.getElementById('qSave').onclick=async()=>{
  const q=Number((document.getElementById('qQty').value||'').replace(',','.')),motifQ=document.getElementById('qMotif').value;
  if(!(q>0)||q>reste+1e-9){toast(t('trQteInvalide'));return}
  const r=creerMouvement({src:'main',motif:motifQ,plat:m.plat,qty:q,table:m.table,who:st.who,parent:m.id},{accepteAlerte:true});
  if(!r.ok){toast(r.msg);return}await save();closeModal();renderCaisse();toast(t('qualSaved'));
 };
}
