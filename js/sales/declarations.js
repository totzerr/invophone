function renderCaisse(){
 const rows=st.mv.length?st.mv.slice(0,40).map(m=>{const d=new Date(m.ts),hh=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  const estVente=m.motif==='vente',mt=estVente?pvMv(m):coutMv(m),libMontant=estVente?t('vente'):t('coutMat');
  return `<div class="activity-row"><span class="activity-icon">${m.platI}</span><span class="activity-body"><b>${m.platN}${m.qty>1?' × '+m.qty:''}</b>
  <small>${hh} · ${m.table} · ${libMontant} : ${fmt(mt)} €${m.parent?` · ↩ ${t('trLiee')}`:''}</small></span><span class="tag ${m.motif}">${t(m.motif).toUpperCase()}</span></div>`;}).join('')
 :`<div class="activity-empty"><div>⌁</div><p><b>${t('vide')}</b><br>${t('manualCaisse')}</p></div>`;
 const aVerifier=(st.mv||[]).filter(m=>MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0).slice(0,8);
 const verif=aVerifier.length?`<section class="work-block"><div class="work-heading"><span>${t('aVerifier')}</span><small>${aVerifier.length}</small></div>
  <p class="work-help">${t('aVerifierS')}</p><div class="work-list">${aVerifier.map(m=>`<button class="work-item" data-qual="${m.id}">
   <span>${m.platI}</span><div><b>${m.platN}</b><small>${fmtQ(resteATracer(m.id))} · ${fmt(pvMv(m))} €</small></div><i>›</i></button>`).join('')}</div></section>`
 :`<section class="work-block work-idle"><div class="work-heading"><span>${t('aVerifier')}</span></div><p>${t('verifVide')}</p></section>`;
 const caisseContexte=st.demoParcours
  ?'<div class="sales-eyebrow"><i></i>DÉMO CAISSE · VENTES SIMULÉES</div>'
  :`<div class="sales-eyebrow"><i></i>${t('manuel').toUpperCase()} · VENTES</div>`;
 document.getElementById('s-caisse').innerHTML=`<section class="sales-head">
   <div>${caisseContexte}
   <h1>${t('caisseT')}</h1><p>${t('caisseS')}</p></div>
   <button class="sales-new" id="newSale"><span class="sales-new-plus">＋</span>
    <span><b>${t('newVente')}</b><small>${t('manualCaisse')}</small></span><i>›</i></button>
  </section>
  ${verif}
  <section class="activity-block"><div class="work-heading"><span>${t('jrnl')}</span><small>${st.mv.length}</small></div>
   <div class="activity-list">${rows}</div></section>`;
 document.getElementById('newSale').onclick=()=>{screen='dec';motif='vente';go()};
 document.querySelectorAll('[data-qual]').forEach(function(b){b.type='button';b.onclick=function(){ouvrirTraitementVente(b.dataset.qual);};});seenFeed=st.mv.length;
}
/* ═════ DÉCLARER ═════ */
function catsDispo(){const s=new Set(st.carte.filter(c=>c.sv===st.svc||c.sv==='tous').map(c=>c.c));
return CATS.filter(c=>s.has(c))}
function panierKinds(){const ks=new Set(Object.keys(panier).map(id=>item(id)?.k));
return{food:ks.has('food'),drink:ks.has('drink')}}
function motifsDispo(){const k=panierKinds();
if(!k.food&&!k.drink)return MOTIFS;
return MOTIFS.filter(m=>m.ap==='tous'||(m.ap==='food'&&k.food&&!k.drink)||(m.ap==='drink'&&k.drink&&!k.food))}
function motifsProduit(id){const c=item(id);return MOTIFS.filter(m=>m.ap==='tous'||m.ap===c?.k)}
function motifDuPanier(id){return panierMotifs[id]||(motifsSelectionnes.length===1?motifsSelectionnes[0]:motif)}
function panierPret(){return Object.keys(panier).every(id=>!!motifDuPanier(id))}
const panierCount=()=>Object.values(panier).reduce((a,b)=>a+b,0);
const panierCout=()=>Object.entries(panier).reduce((s,[id,q])=>s+coutMat(id,q),0);
function sessionServiceActive(){return st.serviceActif&&st.serviceActif.id?st.serviceActif:null}
function nomService(type){return type==='midi'?'☀️ '+t('midi'):'🌙 '+t('soir')}
function heureService(ts){const d=new Date(ts);return isNaN(d)?'—':d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function mouvementsDuService(session){return(session&&session.id?(st.mv||[]).filter(function(m){return String(m.serviceId||'')===String(session.id)}):[])}
function resumeService(session){
 const mouvements=mouvementsDuService(session),ventes=mouvements.filter(function(m){return m.motif==='vente'});
 const sorties=mouvements.filter(function(m){return m.motif!=='vente'&&m.motif!==MOTIF_REVERSE&&!MOTIFS_A_TRACER.includes(m.motif)});
 const alertes=mouvements.filter(function(m){return !!m.alerte});
 const aRevoir=mouvements.filter(function(m){return MOTIFS_PRIMAIRES.includes(m.motif)&&resteATracer(m.id)>0});
 return{mouvements:mouvements.length,ventes:ventes.length,sorties:sorties.length,ca:ventes.reduce(function(s,m){return s+pvMv(m)},0),
  cout:ventes.reduce(function(s,m){return s+coutMv(m)},0),alertes:alertes.length,aRevoir:aRevoir.length};
}
function panneauService(){
 const actif=sessionServiceActive();
 if(!actif)return'<div class="service-session"><div class="service-session-head"><div><small>Mode service</small><b>Prêt pour '+nomService(st.svc)+'</b><time>Les ventes et sorties validées seront suivies dans cette session.</time></div></div><button class="btn btn-2 btn-sm" id="openService">Ouvrir le service</button></div>';
 const r=resumeService(actif),aVerifier=r.alertes+r.aRevoir;
 return'<div class="service-session active"><div class="service-session-head"><div><small>Service en cours</small><b>'+nomService(actif.type)+'</b><time>Ouvert à '+heureService(actif.openedAt)+' · '+escapeHTML(actif.who||'Utilisateur')+'</time></div></div><div class="service-session-stats"><div class="service-session-stat"><small>Ventes</small><b>'+r.ventes+'</b></div><div class="service-session-stat"><small>Sorties</small><b>'+r.sorties+'</b></div><div class="service-session-stat"><small>À vérifier</small><b>'+aVerifier+'</b></div></div><button class="btn btn-sm" id="closeService">Clôturer le service</button></div>';
}
async function ouvrirService(){
 const actif=sessionServiceActive();if(actif)return toast('Le service '+nomService(actif.type)+' est déjà ouvert.');
 st.serviceActif={id:uid('svc'),type:st.svc,openedAt:new Date().toISOString(),who:st.who};
 await save();
 if(typeof ajouterHistoriqueAudit==='function')ajouterHistoriqueAudit('Service ouvert',nomService(st.svc),'Aucun service actif','Service '+nomService(st.svc)+' ouvert','Suivi des mouvements validés');
 renderDec();toast('Service '+nomService(st.svc)+' ouvert.');
}
function ouvrirClotureService(){
 const actif=sessionServiceActive();if(!actif)return toast('Aucun service en cours.');
 const r=resumeService(actif),aVerifier=r.alertes+r.aRevoir;
 const controles=[];
 if(r.alertes)controles.push(r.alertes+' alerte'+(r.alertes>1?'s':'')+' de stock');
 if(r.aRevoir)controles.push(r.aRevoir+' ligne'+(r.aRevoir>1?'s':'')+' de caisse à examiner');
 if(!controles.length)controles.push('Aucun écart détecté');
 document.getElementById('modal').innerHTML='<div class="sheet-bg" id="bgService"><div class="sheet"><h3>Clôturer '+nomService(actif.type)+'</h3><p class="sh-sub">Cette clôture n’ajoute ni ne retire aucun stock. Elle enregistre seulement le bilan du service.</p><div class="service-session active"><div class="service-session-stats"><div class="service-session-stat"><small>Ventes</small><b>'+r.ventes+' · '+fmt(r.ca)+' €</b></div><div class="service-session-stat"><small>Sorties</small><b>'+r.sorties+'</b></div><div class="service-session-stat"><small>Coût matière</small><b>'+fmt(r.cout)+' €</b></div></div><div class="reception-control-list">'+controles.map(function(x){return'<div class="reception-control-line"><i></i><span>'+escapeHTML(x)+'</span></div>'}).join('')+'</div></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="serviceCancel">Retour</button><button class="btn" id="serviceConfirm">Clôturer</button></div></div></div>';
 document.getElementById('bgService').onclick=function(e){if(e.target.id==='bgService')closeModal()};
 document.getElementById('serviceCancel').onclick=closeModal;
 document.getElementById('serviceConfirm').onclick=async function(){
  const fin=new Date().toISOString(),bilan={id:actif.id,type:actif.type,openedAt:actif.openedAt,closedAt:fin,who:actif.who,resume:r};
  st.serviceHist.unshift(bilan);if(st.serviceHist.length>60)st.serviceHist.length=60;st.serviceActif=null;
  await save();closeModal();
  if(typeof ajouterHistoriqueAudit==='function')ajouterHistoriqueAudit('Service clôturé',nomService(actif.type),r.mouvements+' mouvement(s) suivis',r.ventes+' vente(s) · '+fmt(r.ca)+' €',controles.join(' · '));
  renderDec();toast('Service '+nomService(actif.type)+' clôturé.');
 };
}
function normaliserMotifsSelectionnes(){const ids=new Set(motifsDispo().map(m=>m.id));motifsSelectionnes=motifsSelectionnes.filter(id=>ids.has(id));if(motif&&!ids.has(motif))motif=null}
function addP(id){msgDec=null;forcerStock=false;panier[id]=(panier[id]||0)+1;
normaliserMotifsSelectionnes();renderDec()}
function subP(id){msgDec=null;forcerStock=false;if(!panier[id])return;panier[id]--;if(panier[id]<=0){delete panier[id];delete panierMotifs[id]}
normaliserMotifsSelectionnes();renderDec()}

function renderDec(){
const dispo=catsDispo();
if(!dispo.includes(cat))cat=dispo[0]||'cPlats';
const svc=`<div class="svc">
<button class="${st.svc==='midi'?'on':''}" data-svc="midi"><span class="si">☀️</span>${t('midi')}</button>
<button class="${st.svc==='soir'?'on':''}" data-svc="soir"><span class="si">🌙</span>${t('soir')}</button></div>`;
const cats=dispo.map(c=>`<button class="cat ${cat===c?'on':''}" data-cat="${c}">${t(c)}</button>`).join('');
const items=st.carte.filter(c=>c.c===cat&&(c.sv===st.svc||c.sv==='tous')).map(c=>{
const q=panier[c.id]||0;
return `<button class="card ${q?'has':''}" data-add="${c.id}">
${q?`<span class="qbadge">${q}</span>`:''}
<span class="ico">${c.i}</span><span class="nm">${c.n}</span>
<span class="pxs">${fmt(c.pv)} €</span></button>`}).join('');
const lignes=Object.entries(panier).map(([id,q])=>{const c=item(id);if(!c)return '';const multi=motifsSelectionnes.length>1;const edition=motifLigneEditee===id||multi;const choisi=panierMotifs[id]||'',tousLesOptions=motifsProduit(id),optionsMulti=multi?tousLesOptions.filter(m=>motifsSelectionnes.includes(m.id)):tousLesOptions,options=(optionsMulti.length?optionsMulti:tousLesOptions).map(m=>`<option value="${m.id}" ${choisi===m.id?'selected':''}>${m.i} ${t(m.id)}</option>`).join('');
return `<div class="pk-row"><span class="pk-ico">${c.i}</span><span class="pk-body"><div class="pk-n">${c.n}</div><div class="pk-c">${fmt(coutMat(id,q))} €</div><button type="button" class="pk-edit-motif" data-editmotif="${id}">${edition?'Fermer':'Modifier'}</button><div class="pk-motif-field" ${edition?'':'hidden'}><select class="pk-motif" aria-label="Motif pour ${c.n}" data-pkmotif="${id}"><option value="">${multi?'Choisir pour cet article':(motif?'Motif général · '+t(motif):'Choisir un motif')}</option>${options}</select></div></span><span class="pk-ctrl"><button class="pk-btn" data-sub="${id}">−</button><span class="pk-q">${q}</span><button class="pk-btn" data-plus="${id}">+</button></span></div>`}).join('');
const pkBlock=panierCount()?`<div class="panier">
<div class="pk-head"><span class="pk-title">${t('panier').toUpperCase()}</span>
<button class="pk-clear" id="pkClear">${t('vider')}</button></div>${lignes}
<div class="pk-total"><span class="pk-tl">${t('coutMat')}</span>
<span class="pk-tv">${fmt(panierCout())} €</span></div></div>`:'';
const motifsRapidesIds=['vente','offClient','casse','perso'];
const motifsActuels=motifsDispo();
const motifsList=[...motifsActuels].sort((a,b)=>(motifsRapidesIds.includes(b.id)?1:0)-(motifsRapidesIds.includes(a.id)?1:0));
const mts=motifsList.map(m=>`<button type="button" aria-pressed="${motifsSelectionnes.includes(m.id)}" class="motif ${motifsRapidesIds.includes(m.id)?'quick':''} ${motifsSelectionnes.includes(m.id)?'sel':''}" data-motif="${m.id}">
<span class="mi">${m.i}</span><span class="mt">${t(m.id)}</span>
<span class="md">${t(m.id+'D')}</span></button>`).join('');
const blocMsg=msgDec?`<div id="decFeedback" class="warn ${msgDec.type==='err'?'err':'dup'}" role="alert">${msgDec.txt}</div>`:'';
document.getElementById('s-dec').innerHTML=`
 <section class="declare-hero"><div class="declare-overline">${t('nDec')}</div>
  <h1>${t('decT')}</h1><p>${t('decS')}</p></section>
 ${blocMsg}
 <section class="declare-service"><div class="declare-section-head"><span>${t('svc')}</span><small>${t('svcHint')}</small></div>${svc}${panneauService()}</section>
 <section class="declare-catalog"><div class="declare-section-head"><span>${t('etape1')}</span><small>${panierCount()?panierCount():''}</small></div>
  <div class="cats">${cats}</div><div class="grid">${items}</div></section>
 ${pkBlock}
 <section class="declare-reason" id="motifBlock"><div class="declare-section-head"><span>2 — Motif</span><small>${motifsSelectionnes.length>1?'Choix par article':'Un ou plusieurs choix'}</small></div>
  <p class="motifs-helper">${motifsSelectionnes.length>1?'<strong>Plusieurs motifs sélectionnés.</strong> Attribuez-en un à chaque article du panier.':'Vous pouvez sélectionner un ou plusieurs motifs de sortie.'}</p>
  <div class="motifs ${motifsOuverts?'open':''}">${mts}</div><button type="button" class="motifs-more-toggle" id="motifsMore">${motifsOuverts?'Réduire les motifs':'Plus de motifs'}</button></section>
 ${(motifsSelectionnes.some(id=>id==='casse'||id==='rate'))?(decPhoto?
  `<div class="photo-prev"><img src="${decPhoto}" alt=""><button class="photo-x" id="rmPhoto">×</button></div>`
  :`<button class="photo-btn" id="addPhoto">${t('addPhoto')}</button>
    <input type="file" id="photoInput" accept="image/*" capture="environment" style="display:none">`):''}
`;
document.querySelectorAll('[data-svc]').forEach(b=>b.onclick=async()=>{const actif=sessionServiceActive();if(actif&&actif.type!==b.dataset.svc)return toast('Clôture d’abord le service '+nomService(actif.type)+'.');st.svc=b.dataset.svc;await save();renderDec()});
const openServiceBtn=document.getElementById('openService');if(openServiceBtn)openServiceBtn.onclick=ouvrirService;
const closeServiceBtn=document.getElementById('closeService');if(closeServiceBtn)closeServiceBtn.onclick=ouvrirClotureService;
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;renderDec()});
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addP(b.dataset.add));
document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>addP(b.dataset.plus));
document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>subP(b.dataset.sub));
const pc=document.getElementById('pkClear');if(pc)pc.onclick=()=>{panier={};panierMotifs={};motif=null;motifsSelectionnes=[];motifLigneEditee=null;motifsOuverts=false;renderDec()};
document.querySelectorAll('[data-motif]').forEach(b=>b.onclick=()=>{const id=b.dataset.motif;motifsSelectionnes=motifsSelectionnes.includes(id)?motifsSelectionnes.filter(x=>x!==id):[...motifsSelectionnes,id];motif=motifsSelectionnes.length===1?motifsSelectionnes[0]:null;msgDec=null;forcerStock=false;renderDec()});
document.querySelectorAll('[data-pkmotif]').forEach(sel=>sel.onchange=()=>{const id=sel.dataset.pkmotif;if(sel.value)panierMotifs[id]=sel.value;else delete panierMotifs[id];motifLigneEditee=null;msgDec=null;forcerStock=false;renderDec()});
const mm=document.getElementById('motifsMore');if(mm)mm.onclick=()=>{motifsOuverts=!motifsOuverts;renderDec()};
document.querySelectorAll('[data-editmotif]').forEach(b=>b.onclick=()=>{motifLigneEditee=motifLigneEditee===b.dataset.editmotif?null:b.dataset.editmotif;renderDec()});
const sendBtn=document.getElementById('sendBtn');if(sendBtn)sendBtn.onclick=valider;
const ap=document.getElementById('addPhoto');
if(ap)ap.onclick=()=>document.getElementById('photoInput').click();
const pi=document.getElementById('photoInput');
if(pi)pi.onchange=e=>{const f=e.target.files[0];if(f)compressPhoto(f)};
const rp=document.getElementById('rmPhoto');
if(rp)rp.onclick=()=>{decPhoto=null;renderDec()};
renderCartbar()}

function compressPhoto(file){
 const r=new FileReader();
 r.onload=ev=>{const img=new Image();
  img.onload=()=>{const max=420;let w=img.width,h=img.height;
   if(w>h&&w>max){h=h*max/w;w=max}else if(h>max){w=w*max/h;h=max}
   const c=document.createElement('canvas');c.width=w;c.height=h;
   c.getContext('2d').drawImage(img,0,0,w,h);
   decPhoto=c.toDataURL('image/jpeg',0.55);renderDec();toast(t('photoOk'))};
  img.src=ev.target.result};
 r.readAsDataURL(file);
}

function renderCartbar(){
 const el=document.getElementById('cartbar');
 if(screen!=='dec'){el.innerHTML='';return}
 const n=panierCount(),vide=!n,pret=!vide&&panierPret();
 const actifs=[...new Set(Object.keys(panier).map(id=>motifDuPanier(id)).filter(Boolean))];
 const libelle=vide?'AUCUNE SORTIE SÉLECTIONNÉE':pret?(actifs.length>1?'PLUSIEURS MODES':t(actifs[0]).toUpperCase()):t('choisirMotif').toUpperCase();
 const action=vide?'Ajouter un produit':pret?'Valider la sortie':'Choisir un mode';
 el.innerHTML=`<div class="cartbar" role="region" aria-label="Panier des sorties"><button type="button" class="cartbar-in" id="cbGo" ${vide?'disabled':''} aria-label="${action}"><span class="cb-l">${n} ${n>1?t('articlesP'):t('articles')}<small>${libelle}</small></span><span class="cb-action">${action} <i>›</i></span></button></div>`;
 if(!vide)document.getElementById('cbGo').onclick=()=>{if(!pret)document.getElementById('motifBlock').scrollIntoView({behavior:'smooth',block:'center'});else valider()}
}

async function valider(){if(!panierCount()||!panierPret())return;
const now=new Date().toISOString();
const projets=[],refus=[];
for(const [id,q] of Object.entries(panier)){
 const ligneMotif=motifDuPanier(id);let parent=null;
 if(MOTIFS_A_TRACER.includes(ligneMotif)){
  const cand=ventesATracer(id);
  if(!cand.length){refus.push({id,msg:t('trAnnulSansVente')});continue}
  parent=cand[0].id;
 }
 projets.push({src:'main',motif:ligneMotif,plat:id,qty:q,who:st.who,ts:now,
  ph:decPhoto?1:0,parent});
}

/* Pré-vol du lot entier : aucune ligne ni aucun stock ne sont modifiés ici. */
if(!refus.length){
 const lot=validerLotMouvements(projets,{forcer:!!forcerStock});
 if(!lot.ok)refus.push(...lot.refus);
}
if(refus.length){
 const confirmable=refus.every(x=>x.confirmable);
 msgDec={type:confirmable?'warn':'err',
  txt:refus.map(x=>x.msg).join('<br>')+(confirmable?'<br><b>'+t('trAppuyerEncore')+'</b>':'')};
 if(confirmable)forcerStock=true;
 await save();renderDec();
 requestAnimationFrame(()=>{const feedback=document.getElementById('decFeedback');if(feedback)feedback.scrollIntoView({behavior:'smooth',block:'center'});toast(refus[0].msg)});
 return;
}

/* Le lot est validé : les écritures se font maintenant, sans état intermédiaire visible. */
const creations=[];
for(const projet of projets){
 const r=creerMouvement(projet,{accepteAlerte:true});
 if(!r.ok)throw new Error('Validation de lot incohérente : '+r.code);
 creations.push(r.mv);
}
msgDec=null;forcerStock=false;
if(decPhoto){
 const k='p'+Date.now();st.photos[k]=decPhoto;
 creations.forEach(m=>m.pk=k);
 const ks=Object.keys(st.photos);if(ks.length>25)delete st.photos[ks[0]];
}
await save();panier={};panierMotifs={};motif=null;motifsSelectionnes=[];motifLigneEditee=null;motifsOuverts=false;decPhoto=null;renderDec();toast(t('saved'))}
