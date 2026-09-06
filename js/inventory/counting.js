/* ═════ INVENTAIRE ═════ */
function renderInv(){
 const voirEcarts=peutVoirEcartsInventaire();
 const sub=`<div class="subtabs">
  <button class="${invTab==='count'?'on':''}" data-it="count">📋 ${t('tabCount')}</button>
  <button class="${invTab==='hist'?'on':''}" data-it="hist">🕘 ${t('tabHist')}</button></div>`;
 if(invTab==='hist'){renderInvHist(sub);return}

 const zones=['all',...ZONES_L];
 const chips=zones.map(z=>{
  const list=z==='all'?produitsOrdonnesToutesZones():produitsZone(z);
  const done=list.filter(p=>{const v=st.count[p.id];return v!==''&&v!==undefined}).length;
  return `<button class="zchip ${invZone===z?'on':''}" data-iz="${z}">
   ${z==='all'?t('zToutes'):zLabel(z)}<span class="zc">${done}/${list.length}</span></button>`}).join('');

 const list=invZone==='all'?produitsOrdonnesToutesZones():produitsZone(invZone);
 const rows=invOrderMode&&invZone!=='all'?list.map((p,index)=>`<div class="zone-order-row" draggable="true" data-order-id="${p.id}">
  <span class="zone-drag" aria-hidden="true">☰</span>
  <span class="zone-product"><b>${p.i} ${escapeHTML(p.n)}</b><small>${escapeHTML(p.u)} · ${zLabel(p.z||'reserve')}</small></span>
  <span class="zone-moves">
   <button data-move="first" data-id="${p.id}" ${index===0?'disabled':''} title="Première position" aria-label="Placer ${escapeHTML(p.n)} en première position">⇤</button>
   <button data-move="up" data-id="${p.id}" ${index===0?'disabled':''} title="Monter" aria-label="Monter ${escapeHTML(p.n)}">↑</button>
   <button data-move="down" data-id="${p.id}" ${index===list.length-1?'disabled':''} title="Descendre" aria-label="Descendre ${escapeHTML(p.n)}">↓</button>
   <button data-move="last" data-id="${p.id}" ${index===list.length-1?'disabled':''} title="Dernière position" aria-label="Placer ${escapeHTML(p.n)} en dernière position">⇥</button>
  </span></div>`).join(''):list.map(p=>{
  const att=st.stock[p.id]??0;const v=st.count[p.id];
  const has=v!==undefined&&v!=='';const gap=voirEcarts&&has&&Math.abs(parseFloat(v)-att)>0.001;
  const frac=(p.u==='btl'||p.u==='u')?`<div class="frac">
   <button data-fr="${p.id}" data-fv="0.25">¼</button>
   <button data-fr="${p.id}" data-fv="0.5">½</button>
   <button data-fr="${p.id}" data-fv="0.75">¾</button></div>`:'';
  return `<div class="inv-line ${has&&!gap?'done':''} ${gap?'gap':''}">
   <div><div class="iv-nm">${p.i} ${p.n}</div><div class="iv-sub">${p.u} · ${zLabel(p.z||'reserve')}</div></div>
   ${voirEcarts?`<div class="iv-att">${fmtQ(att)}</div>`:''}
   <div><input class="iv-inp ${has?(gap?'bad':'ok'):''}" inputmode="decimal" data-c="${p.id}" value="${has?v:''}" placeholder="—">${frac}</div></div>`}).join('');

 const ordreBar=invZone!=='all'?`<div class="zone-order-bar"><div class="zone-order-copy"><b>${zLabel(invZone)} · ${list.length} produit${list.length>1?'s':''}</b>
  ${invOrderMode?'Glissez les produits ou utilisez les quatre boutons de déplacement.':'Personnalisez l’ordre de comptage de cette zone.'}</div>
  <button class="btn btn-2 btn-sm" id="ivOrder">${invOrderMode?'✓ Terminer':'↕ Réorganiser'}</button></div>`:'';

 let conf=0,ec=0,done=0,ecVal=0;
 st.prods.forEach(p=>{const v=st.count[p.id];if(v===''||v===undefined)return;done++;
  const att=st.stock[p.id]??0;const d=parseFloat(v)-att;
  if(Math.abs(d)>0.001){ec++;ecVal+=Math.abs(d)*(p.px||0)}else conf++});
 const valStock=st.prods.reduce((s,p)=>s+(st.stock[p.id]??0)*(p.px||0),0);

 document.getElementById('s-inv').classList.toggle('inventory-limited',!voirEcarts);
 document.getElementById('s-inv').innerHTML=`
  <div class="h-title">${t('invT')}</div><div class="h-sub">${t('invS')}</div>${sub}
  <div class="inv-head">
   <div class="inv-stat"><span>${t('lignes')}</span><b>${done} / ${st.prods.length}</b></div>
   ${voirEcarts?`<div class="inv-stat"><span>${t('conf')}</span><b style="color:var(--green,#235A34)">${conf}</b></div>
   <div class="inv-stat"><span>${t('ecarts')}</span><b style="color:${ec?'var(--red,#C2414A)':'var(--steel-d,#687386)'}">${ec}</b></div>
   <div class="inv-stat"><span>${t('ecartValeur')}</span><b style="color:${ecVal>0?'var(--red,#C2414A)':'var(--steel-d,#687386)'}">${fmt(ecVal)} €</b></div>
   <div class="inv-stat"><span>${t('valeurStock')}</span><b>${fmt(valStock)} €</b></div>`:''}</div>
  <div class="zone-chips">${chips}</div>${ordreBar}
  ${invOrderMode&&invZone!=='all'?`<div class="zone-order-list">${rows||'<div class="zone-empty">Cette zone ne contient encore aucun produit.</div>'}</div>`:`<div class="inv-table-head">
   <span>${t('prod')}</span>${voirEcarts?`<span style="text-align:right">${t('attendu')}</span>`:''}
   <span style="text-align:center">${t('compte')}</span></div>${rows||'<div class="zone-empty">Cette zone ne contient encore aucun produit.</div>'}`}
  ${invOrderMode&&invZone!=='all'?'':`<div class="inv-actions"><button class="btn" id="ivOk" ${done===0?'disabled':''}>${t('valid')}</button>
   <button class="btn btn-2 btn-sm" id="ivClear">${t('clear')}</button></div>
  <div class="exp-row">${voirEcarts?`<button class="btn btn-2 btn-sm" id="ivCsv">${t('exportCsv')}</button>`:''}
   <button class="btn btn-2 btn-sm" id="ivPrint">${t('imprimer')}</button></div>`}`;

 document.querySelectorAll('[data-c]').forEach(inp=>{
  inp.oninput=e=>{st.count[e.target.dataset.c]=e.target.value;save()};
  inp.onblur=()=>renderInv()});
 document.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.fr,add=parseFloat(b.dataset.fv);
  const cur=st.count[id];const base=(cur===''||cur===undefined)?0:Math.floor(parseFloat(cur)||0);
  st.count[id]=String(base+add);save();renderInv()});
 document.querySelectorAll('[data-iz]').forEach(b=>b.onclick=()=>{invZone=b.dataset.iz;renderInv()});
 const orderBtn=document.getElementById('ivOrder');if(orderBtn)orderBtn.onclick=()=>{invOrderMode=!invOrderMode;renderInv()};
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>deplacerProduitZone(b.dataset.id,b.dataset.move));
 document.querySelectorAll('[data-order-id]').forEach(row=>{
  row.ondragstart=e=>{draggedProductId=row.dataset.orderId;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedProductId)};
  row.ondragover=e=>{e.preventDefault();if(draggedProductId&&draggedProductId!==row.dataset.orderId)row.classList.add('drag-over')};
  row.ondragleave=()=>row.classList.remove('drag-over');
  row.ondrop=e=>{e.preventDefault();row.classList.remove('drag-over');const id=draggedProductId||e.dataTransfer.getData('text/plain');if(id)deplacerProduitZone(id,'before',row.dataset.orderId)};
  row.ondragend=()=>{draggedProductId=null;document.querySelectorAll('.zone-order-row').forEach(x=>x.classList.remove('dragging','drag-over'))};
 });
 document.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{invTab=b.dataset.it;renderInv()});
 const ivOk=document.getElementById('ivOk');if(ivOk)ivOk.onclick=validerInv;
 const ivClear=document.getElementById('ivClear');if(ivClear)ivClear.onclick=async()=>{st.count={};await save();renderInv()};
 const ivCsv=document.getElementById('ivCsv');if(ivCsv)ivCsv.onclick=exportInvCsv;
 const ivPrint=document.getElementById('ivPrint');if(ivPrint)ivPrint.onclick=()=>window.print();
}

async function validerInv(){
 const lignes=[];
 st.prods.forEach(p=>{const v=st.count[p.id];if(v===''||v===undefined)return;
  const att=st.stock[p.id]??0,cpt=parseFloat(v)||0,d=cpt-att;
  lignes.push({id:p.id,n:p.n,u:p.u,att,cpt,d,val:d*(p.px||0)})});
 if(!lignes.length)return;
 const ec=lignes.filter(l=>Math.abs(l.d)>0.001);
 st.invHist.unshift({ts:new Date().toISOString(),lignes,
  nb:lignes.length,nbEcart:ec.length,
  valEcart:ec.reduce((s,l)=>s+Math.abs(l.val),0)});
 if(st.invHist.length>24)st.invHist.length=24;
 // Le comptage devient le nouveau stock théorique
 lignes.forEach(l=>{st.stock[l.id]=l.cpt});
 st.count={};
 await save();renderInv();toast(t('invOk'));
}

function renderInvHist(sub){
 const voirEcarts=peutVoirEcartsInventaire();
 const derive={};
 st.invHist.slice(0,3).forEach(h=>h.lignes.forEach(l=>{
  if(Math.abs(l.d)>0.001){derive[l.id]=derive[l.id]||{n:l.n,c:0};derive[l.id].c++}}));
 const rec=Object.values(derive).filter(x=>x.c>=2);
 const cards=st.invHist.length?st.invHist.map((h,ix)=>{
  const d=new Date(h.ts);
  const jj=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
  return `<button class="hist-card" data-hi="${ix}"><div class="hist-top">
   <div><div class="hist-d">${t('inventaireDu')} ${jj}</div>
   <div class="hist-s">${h.nb} ${t('lignes').toLowerCase()}${voirEcarts?' · '+fmt(h.valEcart)+' € '+t('ecartValeur').toLowerCase():''}</div></div>
   ${voirEcarts?`<span class="hist-badge ${h.nbEcart?'ko':'ok'}">${h.nbEcart} ${t('lignesEcart')}</span>`:''}</div></button>`}).join('')
  :`<div class="empty"><div class="e-ico">🕘</div><p>${t('noHist')}</p></div>`;
 document.getElementById('s-inv').classList.toggle('inventory-limited',!voirEcarts);
 document.getElementById('s-inv').innerHTML=`
  <div class="h-title">${t('histT')}</div><div class="h-sub">${t('invS')}</div>${sub}
  ${voirEcarts&&rec.length?`<div class="banner amber"><b>${t('derive')}</b> — ${t('deriveS')}<br>
   ${rec.map(x=>'• '+x.n+' ('+x.c+'×)').join('<br>')}</div>`:''}
  ${cards}`;
 document.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{invTab=b.dataset.it;renderInv()});
 document.querySelectorAll('[data-hi]').forEach(b=>b.onclick=()=>openHist(+b.dataset.hi));
}

function openHist(ix){
 const h=st.invHist[ix];if(!h)return;
 const voirEcarts=peutVoirEcartsInventaire();
 const d=new Date(h.ts);
 const jj=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
 const ecarts=h.lignes.filter(l=>Math.abs(l.d)>0.001);
 const lignesAffichees=voirEcarts?(ecarts.length?ecarts:h.lignes.slice(0,20)):h.lignes.slice(0,50);
 const rows=lignesAffichees.map(l=>`
  <div class="alert-row"><span class="alert-b"><div class="alert-n">${l.n}</div>
  <div class="alert-m">${voirEcarts?t('attendu').toLowerCase()+' '+fmtQ(l.att)+' · ':''}${t('compte').toLowerCase()} ${fmtQ(l.cpt)} ${l.u}</div></span>
  ${h.version===2&&l.details&&l.details.length?`<span class="alert-m" style="grid-column:1/-1">${l.details.map(d=>escapeHTML(d.n||nomEmplacementInventaire(d.locId))+' : '+fmtQ(d.q)+' '+l.u).join(' · ')}</span>`:''}
  ${voirEcarts?`<span class="alert-v ${l.d<0?'up':'down'}">${l.d>0?'+':''}${fmtQ(l.d)}</span>`:''}</div>`).join('');
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgH"><div class="sheet">
  <h3>${t('inventaireDu')} ${jj}</h3>
  <p class="sh-sub">${h.nb} ${t('lignes').toLowerCase()}${voirEcarts?' · '+h.nbEcart+' '+t('lignesEcart')+' · '+fmt(h.valEcart)+' €':''}</p>
  ${rows||'<p class="sh-sub">—</p>'}
  <div class="sh-actions"><button class="btn btn-2 btn-sm" id="hCsv">${t('exportCsv')}</button>
   <button class="btn" id="hClose">${t('cancel')}</button></div></div></div>`;
 document.getElementById('bgH').onclick=e=>{if(e.target.id==='bgH')closeModal()};
 document.getElementById('hClose').onclick=closeModal;
 document.getElementById('hCsv').onclick=()=>{
  const rows=voirEcarts?[['Produit','Unite','Attendu','Compte','Ecart','Valeur ecart EUR']]:[['Produit','Unite','Compte']];
  h.lignes.forEach(l=>rows.push(voirEcarts?[l.n,l.u,l.att,l.cpt,l.d,(Math.round(l.val*100)/100)]:[l.n,l.u,l.cpt]));
  dlCsv(rows,'inventaire_'+jj.replace(/\//g,'-')+'.csv')};
}

function dlCsv(rows,name){
 const csv='\ufeff'+rows.map(r=>r.map(c=>{
  const s=String(c).replace(/"/g,'""');return /[";\n]/.test(s)?'"'+s+'"':s}).join(';')).join('\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}

function exportInvCsv(){
 const voirEcarts=peutVoirEcartsInventaire(),rows=voirEcarts?[['Produit','Unite','Zone','Attendu','Compte','Ecart','Prix unitaire EUR','Valeur ecart EUR']]:[['Produit','Unite','Zone','Compte']];
 st.prods.forEach(p=>{const v=st.count[p.id];const att=st.stock[p.id]??0;
  const cpt=(v===''||v===undefined)?'':(parseFloat(v)||0);
  const d=cpt===''?'':(cpt-att);
  rows.push(voirEcarts?[p.n,p.u,zLabel(p.z||'reserve'),att,cpt,d,p.px,d===''?'':(Math.round(d*p.px*100)/100)]:[p.n,p.u,zLabel(p.z||'reserve'),cpt])});
 dlCsv(rows,'inventaire_'+new Date().toISOString().slice(0,10)+'.csv');
}

/* ═════ INVENTAIRE GUIDÉ V2 · EMPLACEMENTS ═════ */
function statsInventaireZone(session,locId){
 const lignes=produitsInventaireEmplacement(locId,session),z=zoneInventaire(session,locId);
 const faits=lignes.filter(p=>z.counts[p.id]&&z.counts[p.id].q!==''&&z.counts[p.id].q!==undefined).length;
 return{lignes,faits,restants:Math.max(0,lignes.length-faits),pourcent:lignes.length?Math.round(faits/lignes.length*100):100,terminee:!!z.doneAt};
}
function resultatInventaireSession(session){
 const map={};
 (st.prods||[]).forEach(p=>map[p.id]={id:p.id,n:p.n,i:p.i,u:p.u,categorie:p.invCategory||inventaireCategorieParDefaut(p),att:st.stock[p.id]??0,total:0,details:[]});
 emplacementsInventaire(true).forEach(loc=>{
  const z=zoneInventaire(session,loc.id);
  Object.entries(z.counts).forEach(([pid,ligne])=>{
   const p=map[pid];if(!p||ligne.q===''||ligne.q===undefined)return;
   const q=num(ligne.q);p.total+=q;p.details.push({locId:loc.id,n:loc.n,q});
  });
 });
 const lignes=Object.values(map).map(l=>({...l,d:l.total-l.att,val:(l.total-l.att)*(prod(l.id)?.px||0)}));
 const ecarts=lignes.filter(l=>Math.abs(l.d)>0.001);
 return{lignes,ecarts,nbEcart:ecarts.length,valEcart:ecarts.reduce((s,l)=>s+Math.abs(l.val),0)};
}
function toutesZonesInventaireTerminees(session){return emplacementsInventaire(true).every(loc=>!!zoneInventaire(session,loc.id).doneAt)}
async function enregistrerComptageInventaire(locId,pid,valeur,avantForce){
 const session=sessionInventaire(),z=zoneInventaire(session,locId),p=prod(pid);if(!p)return;
 const ancien=avantForce===undefined?(z.counts[pid]&&z.counts[pid].q!==undefined?String(z.counts[pid].q):''):String(avantForce);
 const suivant=String(valeur??'').trim();if(ancien===suivant)return;
 const ts=new Date().toISOString();
 z.counts[pid]={q:suivant,ts,utilisateur:st.who,role:roleHistoriqueAudit()};
 session.updatedAt=ts;session.journal.unshift({ts,utilisateur:st.who,role:roleHistoriqueAudit(),locId,pid,avant:ancien,apres:suivant,type:'saisie'});
 if(session.journal.length>500)session.journal.length=500;
 await save();
 ajouterHistoriqueAudit('Comptage inventaire',p.n+' · '+nomEmplacementInventaire(locId),ancien===''?'Non compté':ancien+' '+p.u,suivant===''?'Non compté':suivant+' '+p.u,'Saisie par emplacement');
}
function ouvrirProduitInconnuInventaire(locId){
 document.getElementById('modal').innerHTML=`<div class="sheet-bg inv-sheet" id="bgInvUnknown"><div class="sheet"><h3>Produit absent du catalogue</h3><p class="sh-sub">Il sera signalé au gestionnaire, sans créer de produit ni modifier le stock.</p><div class="fld"><label>Nom observé</label><input id="invUnknownName" placeholder="Ex. bouteille non référencée"></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="invUnknownCancel">${t('cancel')}</button><button class="btn" id="invUnknownSave">Signaler</button></div></div></div>`;
 document.getElementById('bgInvUnknown').onclick=e=>{if(e.target.id==='bgInvUnknown')closeModal()};document.getElementById('invUnknownCancel').onclick=closeModal;
 document.getElementById('invUnknownSave').onclick=async()=>{const nom=document.getElementById('invUnknownName').value.trim();if(!nom)return;
  const s=sessionInventaire(),ts=new Date().toISOString();s.anomalies.push({type:'hors_catalogue',nom,to:locId,ts,utilisateur:st.who,role:roleHistoriqueAudit()});s.updatedAt=ts;await save();
  ajouterHistoriqueAudit('Produit hors catalogue signalé',nom+' · '+nomEmplacementInventaire(locId),'Non référencé','À traiter par un gestionnaire','Inventaire par emplacement');closeModal();renderInv();};
}
async function ajouterProduitInventaire(locId,mode){
 const session=sessionInventaire(),z=zoneInventaire(session,locId),candidates=(st.prods||[]).filter(p=>!produitDansEmplacement(p,locId,session));
 if(!candidates.length){toast('Tous les produits du stock sont déjà affichés dans cet emplacement.');return}
 let selection=candidates[0].id;
 const dessiner=()=>{
  const p=prod(selection),origines=(p&&p.emplacements||[]).filter(id=>id!==locId);
  document.getElementById('modal').innerHTML=`<div class="sheet-bg inv-sheet" id="bgInvAdd"><div class="sheet"><h3>${mode==='move'?'Signaler un déplacement':'Ajouter une bouteille trouvée'}</h3><p class="sh-sub">${mode==='move'?'Le produit sera compté ici et retiré du comptage de son emplacement d’origine.':'Le produit est ajouté à cette zone pour ce seul inventaire ; le catalogue n’est pas modifié.'}</p><div class="fld"><label>Produit du stock</label><select id="invAddProduct">${candidates.map(x=>`<option value="${x.id}" ${x.id===selection?'selected':''}>${x.i} ${escapeHTML(x.n)} · ${x.u}</option>`).join('')}</select></div>${mode==='move'?`<div class="fld"><label>Emplacement d’origine</label><select id="invMoveFrom">${origines.map(id=>`<option value="${id}">${escapeHTML(nomEmplacementInventaire(id))}</option>`).join('')||'<option value="">Aucun emplacement habituel disponible</option>'}</select></div>`:''}<div class="sh-actions"><button class="btn btn-2 btn-sm" id="invAddCancel">${t('cancel')}</button><button class="btn" id="invAddSave">Ajouter au comptage</button></div><button class="auth-link" id="invUnknown">Produit absent du catalogue</button></div></div>`;
  document.getElementById('bgInvAdd').onclick=e=>{if(e.target.id==='bgInvAdd')closeModal()};document.getElementById('invAddCancel').onclick=closeModal;
  document.getElementById('invAddProduct').onchange=e=>{selection=e.target.value;dessiner()};document.getElementById('invUnknown').onclick=()=>ouvrirProduitInconnuInventaire(locId);
  document.getElementById('invAddSave').onclick=async()=>{const produit=prod(selection);if(!produit)return;
   if(mode==='move'){const origine=document.getElementById('invMoveFrom').value,source=origine?zoneInventaire(session,origine):null;if(!origine){toast('Choisis l’emplacement d’origine du produit.');return}if(source.counts[produit.id]&&source.counts[produit.id].q!==''&&source.counts[produit.id].q!==undefined){toast('Une quantité est déjà saisie à l’emplacement d’origine.');return}source.exclusions[produit.id]={to:locId,ts:new Date().toISOString()};session.anomalies.push({type:'deplacement',pid:produit.id,from:origine,to:locId,ts:new Date().toISOString(),utilisateur:st.who,role:roleHistoriqueAudit()})}else session.anomalies.push({type:'inattendu',pid:produit.id,to:locId,ts:new Date().toISOString(),utilisateur:st.who,role:roleHistoriqueAudit()});
   if(!z.extras.includes(produit.id))z.extras.push(produit.id);session.updatedAt=new Date().toISOString();await save();ajouterHistoriqueAudit(mode==='move'?'Déplacement signalé':'Produit inattendu ajouté',produit.n+' · '+nomEmplacementInventaire(locId),'Non prévu dans cet emplacement','Ajouté au comptage','Inventaire par emplacement');closeModal();renderInv();
  };
 };dessiner();
}
function confirmerFinZoneInventaire(locId){
 const session=sessionInventaire(),stat=statsInventaireZone(session,locId),z=zoneInventaire(session,locId),manquants=stat.lignes.filter(p=>!(z.counts[p.id]&&z.counts[p.id].q!==''&&z.counts[p.id].q!==undefined));
 document.getElementById('modal').innerHTML=`<div class="sheet-bg inv-sheet" id="bgInvFinish"><div class="sheet"><h3>Terminer ${escapeHTML(nomEmplacementInventaire(locId))} ?</h3><p class="sh-sub">${manquants.length?`${manquants.length} produit${manquants.length>1?'s restent':' reste'} à compter. Tu peux les confirmer à 0 si aucun n’est présent.`:'Tous les produits de cette zone ont une quantité saisie.'}</p><div class="sh-actions"><button class="btn btn-2 btn-sm" id="invFinishCancel">Continuer à compter</button><button class="btn" id="invFinishConfirm">${manquants.length?`Mettre ${manquants.length} à 0 et terminer`:'Confirmer la zone terminée'}</button></div></div></div>`;
 document.getElementById('bgInvFinish').onclick=e=>{if(e.target.id==='bgInvFinish')closeModal()};document.getElementById('invFinishCancel').onclick=closeModal;
 document.getElementById('invFinishConfirm').onclick=async()=>{const ts=new Date().toISOString();manquants.forEach(p=>{z.counts[p.id]={q:'0',ts,utilisateur:st.who,role:roleHistoriqueAudit()};session.journal.unshift({ts,utilisateur:st.who,role:roleHistoriqueAudit(),locId,pid:p.id,avant:'',apres:'0',type:'absence_confirmee'})});z.doneAt=ts;z.doneBy=st.who;z.doneRole=roleHistoriqueAudit();session.updatedAt=ts;await save();ajouterHistoriqueAudit('Zone d’inventaire terminée',nomEmplacementInventaire(locId),stat.faits+'/'+stat.lignes.length+' produits comptés',manquants.length?manquants.length+' absence(s) confirmée(s) à 0':'Zone complète','Validation humaine de la zone');invZone=null;closeModal();renderInv()};
}
async function reprendreZoneInventaire(locId){const z=zoneInventaire(sessionInventaire(),locId),avant=z.doneAt;z.doneAt=null;z.doneBy='';z.doneRole='';await save();ajouterHistoriqueAudit('Zone d’inventaire reprise',nomEmplacementInventaire(locId),avant?'Terminée':'En cours','En cours','Correction autorisée avant validation finale');renderInv()}

function renduResumeInventaire(session){
 const resultat=resultatInventaireSession(session),parCategorie={};resultat.lignes.forEach(l=>{(parCategorie[l.categorie]||(parCategorie[l.categorie]=[])).push(l)});
 const cards=INV_CATEGORIES.filter(c=>parCategorie[c.id]&&parCategorie[c.id].length).map(c=>`<section class="inv-category-card"><h3>${c.n}</h3>${parCategorie[c.id].sort((a,b)=>a.n.localeCompare(b.n,'fr')).map(l=>`<div class="inv-summary-product"><button data-inv-detail="${l.id}"><span><b>${l.i} ${escapeHTML(l.n)}</b><small>${l.details.length} emplacement${l.details.length>1?'s':''}</small></span><em>Total : ${fmtQ(l.total)} ${l.u}</em><i>›</i></button><div class="inv-summary-locations" id="invDetail_${l.id}">${l.details.map(d=>`<div><span>${escapeHTML(d.n)}</span><b>${fmtQ(d.q)} ${l.u}</b></div>`).join('')||'<div><span>Aucun comptage</span></div>'}</div></div>`).join('')}</section>`).join('');
 const zones=emplacementsInventaire(true),nonFinies=zones.filter(l=>!zoneInventaire(session,l.id).doneAt),anomalies=[...(session.anomalies||[])];
 if(peutVoirEcartsInventaire())resultat.ecarts.forEach(l=>anomalies.push({type:'ecart',pid:l.id,d:l.d}));
 const alertes=anomalies.length?`<div class="inv-anomalies"><b>${anomalies.length} anomalie${anomalies.length>1?'s':''} à contrôler</b>${anomalies.slice(0,8).map(a=>{const p=a.pid?prod(a.pid):null;if(a.type==='deplacement')return `Déplacement : ${escapeHTML(p?p.n:'Produit')} · ${escapeHTML(nomEmplacementInventaire(a.from))} → ${escapeHTML(nomEmplacementInventaire(a.to))}`;if(a.type==='hors_catalogue')return `Hors catalogue : ${escapeHTML(a.nom)} · ${escapeHTML(nomEmplacementInventaire(a.to))}`;if(a.type==='inattendu')return `Produit inattendu : ${escapeHTML(p?p.n:'Produit')} · ${escapeHTML(nomEmplacementInventaire(a.to))}`;return `Écart à vérifier : ${escapeHTML(p?p.n:'Produit')} (${a.d>0?'+':''}${fmtQ(a.d)})`}).join('<br>')}</div>`:'';
 return `<div class="inv-summary"><div class="inv-summary-head"><b>Récapitulatif à vérifier</b><p>${nonFinies.length?`${nonFinies.length} zone${nonFinies.length>1?'s restent':' reste'} non vérifiée${nonFinies.length>1?'s':''}.`:'Toutes les zones sont terminées. Le stock ne changera qu’après ta validation finale.'}</p></div>${cards}${alertes}${toutesZonesInventaireTerminees(session)?'<button class="btn" id="invValidateFinal">Valider l’inventaire</button>':''}</div>`;
}
function renderInventaireChoix(session){
 const locations=emplacementsInventaire(true),toutesTerminees=toutesZonesInventaireTerminees(session);
 const cards=locations.map(loc=>{const s=statsInventaireZone(session,loc.id);return `<button class="inv-location-card ${s.terminee?'done':''}" data-inv-zone="${loc.id}"><span class="inv-location-icon">${s.terminee?'✓':'⌁'}</span><b>${escapeHTML(loc.n)}</b><small>${s.terminee?'Zone terminée':`${s.faits} compté${s.faits>1?'s':''} · ${s.restants} restant${s.restants>1?'s':''}`}</small><span class="inv-progress-track"><i style="width:${s.pourcent}%"></i></span></button>`}).join('');
 return `<div class="inv-session-note"><span>◷</span><span><b>${toutesTerminees?'Inventaire complet — à valider':'Progression enregistrée automatiquement'}</b>${toutesTerminees?'Vérifie le récapitulatif avant de mettre à jour le stock.':'Tu peux quitter et reprendre exactement ici, même plus tard.'}</span></div>${toutesTerminees?renduResumeInventaire(session):''}<div class="inv-location-grid">${cards}</div>`;
}
function renderInventaireZone(session,locId){
 const loc=emplacementInventaire(locId);if(!loc){invZone=null;renderInv();return}
 const z=zoneInventaire(session,locId),stat=statsInventaireZone(session,locId),mouvements=(session.anomalies||[]).filter(a=>a.type==='deplacement'&&a.to===locId);
 const rows=stat.lignes.map(p=>{const ligne=z.counts[p.id],has=ligne&&ligne.q!==''&&ligne.q!==undefined,isExtra=!(p.emplacements||[]).includes(locId),move=mouvements.find(a=>a.pid===p.id),fractions=(p.u==='btl'||p.bottle)?`<div class="frac"><button data-inv-fr="${p.id}" data-inv-fr-val="0.25" ${z.doneAt?'disabled':''}>¼</button><button data-inv-fr="${p.id}" data-inv-fr-val="0.5" ${z.doneAt?'disabled':''}>½</button><button data-inv-fr="${p.id}" data-inv-fr-val="0.75" ${z.doneAt?'disabled':''}>¾</button></div>`:'';return `<div class="inv-count-row ${isExtra?'is-extra':''} ${move?'is-moved':''}"><span><b>${p.i} ${escapeHTML(p.n)}</b><small>${p.u}${isExtra?' · bouteille trouvée ici':''}${move?' · déplacée depuis '+escapeHTML(nomEmplacementInventaire(move.from)):''}</small></span><div><input class="inv-count-input ${has?'is-set':''}" inputmode="decimal" data-inv-count="${p.id}" value="${has?escapeHTML(ligne.q):''}" placeholder="0" ${z.doneAt?'disabled':''}>${fractions}</div></div>`}).join('')||'<div class="zone-empty">Aucun produit n’est prévu dans cet emplacement.</div>';
 document.getElementById('s-inv').innerHTML=`<button class="inv-back" id="invBack">‹ Tous les emplacements</button><div class="inv-count-top"><div class="inv-count-kicker">Vous comptez actuellement</div><h2>${escapeHTML(loc.n)}</h2><div class="inv-count-progress"><span>${stat.faits} produit${stat.faits>1?'s':''} compté${stat.faits>1?'s':''} · ${stat.restants} restant${stat.restants>1?'s':''}</span><b>${stat.pourcent}%</b></div><span class="inv-progress-track"><i style="width:${stat.pourcent}%"></i></span></div>${z.doneAt?'<div class="inv-session-note"><span>✓</span><span><b>Zone terminée</b>Rouvre-la seulement si une correction est nécessaire avant la validation finale.</span></div>':''}<div>${rows}</div>${z.doneAt?'<button class="inv-finish-zone" id="invResumeZone">Reprendre ce comptage</button>':`<div class="inv-open-actions"><button id="invFound">＋ Bouteille trouvée</button><button id="invMoved">↔ Déplacement</button></div><button class="inv-finish-zone" id="invFinishZone">Marquer la zone terminée</button>`}`;
 document.getElementById('invBack').onclick=()=>{invZone=null;renderInv()};
 document.querySelectorAll('[data-inv-count]').forEach(inp=>{let ancien=inp.value;inp.oninput=e=>{const q=e.target.value;z.counts[e.target.dataset.invCount]={q,ts:new Date().toISOString(),utilisateur:st.who,role:roleHistoriqueAudit()};session.updatedAt=new Date().toISOString();save()};inp.onchange=async e=>{await enregistrerComptageInventaire(locId,e.target.dataset.invCount,e.target.value,ancien);ancien=e.target.value;renderInventaireZone(session,locId)};inp.onblur=async e=>{if(e.target.value!==ancien){await enregistrerComptageInventaire(locId,e.target.dataset.invCount,e.target.value,ancien);ancien=e.target.value}}});
 const countInputs=[...document.querySelectorAll('[data-inv-count]')];countInputs.forEach((inp,index)=>inp.onkeydown=async e=>{if(e.key!=='Tab')return;e.preventDefault();e.stopPropagation();const cible=countInputs[index+(e.shiftKey?-1:1)],pidCible=cible?.dataset.invCount,placerFocus=()=>{const suivant=pidCible?[...document.querySelectorAll('[data-inv-count]')].find(x=>x.dataset.invCount===pidCible):(e.shiftKey?document.getElementById('invBack'):document.getElementById('invFound'));if(!suivant)return;suivant.focus({preventScroll:true});if(suivant.matches('[data-inv-count]'))suivant.select();suivant.scrollIntoView({block:'center',behavior:'smooth'})};if(inp.value!==ancien){await enregistrerComptageInventaire(locId,inp.dataset.invCount,inp.value,ancien);ancien=inp.value;renderInventaireZone(session,locId);requestAnimationFrame(()=>requestAnimationFrame(placerFocus))}else placerFocus()});
 document.getElementById('s-inv').onkeydown=e=>{if(e.key!=='Enter'||!e.target.matches('[data-inv-count]'))return;e.preventDefault();e.stopPropagation();e.target.onkeydown({key:'Tab',shiftKey:false,preventDefault(){},stopPropagation(){}})};
 document.querySelectorAll('[data-inv-fr]').forEach(b=>b.onclick=async()=>{const p=prod(b.dataset.invFr),ancien=z.counts[p.id]&&z.counts[p.id].q!==undefined?z.counts[p.id].q:'',suivant=String(Math.floor(num(ancien))+num(b.dataset.invFrVal));await enregistrerComptageInventaire(locId,p.id,suivant,ancien);renderInventaireZone(session,locId)});
 const found=document.getElementById('invFound');if(found)found.onclick=()=>ajouterProduitInventaire(locId,'found');const moved=document.getElementById('invMoved');if(moved)moved.onclick=()=>ajouterProduitInventaire(locId,'move');const finish=document.getElementById('invFinishZone');if(finish)finish.onclick=()=>confirmerFinZoneInventaire(locId);const resume=document.getElementById('invResumeZone');if(resume)resume.onclick=()=>reprendreZoneInventaire(locId);
}
function confirmerValidationInventaire(){
 const session=sessionInventaire(),r=resultatInventaireSession(session);if(!toutesZonesInventaireTerminees(session)){toast('Termine toutes les zones avant de valider.');return}
 document.getElementById('modal').innerHTML=`<div class="sheet-bg inv-sheet" id="bgInvValid"><div class="sheet"><h3>Valider cet inventaire ?</h3><p class="sh-sub">${r.lignes.length} produits seront consolidés par emplacement. Cette action mettra à jour le stock uniquement après cette confirmation humaine.</p><div class="sh-actions"><button class="btn btn-2 btn-sm" id="invValidCancel">Revoir</button><button class="btn" id="invValidConfirm">Valider le stock</button></div></div></div>`;
 document.getElementById('bgInvValid').onclick=e=>{if(e.target.id==='bgInvValid')closeModal()};document.getElementById('invValidCancel').onclick=closeModal;document.getElementById('invValidConfirm').onclick=async()=>{closeModal();await validerInv()};
}
function renderInv(){
 if(invTab==='hist'&&!peutVoirEcartsInventaire())invTab='count';
 const sub=`<div class="subtabs"><button class="${invTab==='count'?'on':''}" data-it="count">📋 ${t('tabCount')}</button>${peutVoirEcartsInventaire()?`<button class="${invTab==='hist'?'on':''}" data-it="hist">🕘 ${t('tabHist')}</button>`:''}</div>`;
 if(invTab==='hist'){renderInvHist(sub);return}
 const session=sessionInventaire();if(!emplacementInventaire(invZone))invZone=null;
 document.getElementById('s-inv').classList.remove('inventory-limited');
 document.getElementById('s-inv').innerHTML=`<div class="inv-guide-head"><div><h1>Inventaire</h1><p>Choisis l’emplacement à compter. Une quantité par emplacement, un total automatique à la fin.</p></div>${peutConfigurerInventaire()?'<button class="inv-config-btn" id="invConfig">Configurer</button>':''}</div>${sub}<div id="invGuideBody"></div>`;
 document.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{invTab=b.dataset.it;invZone=null;renderInv()});const config=document.getElementById('invConfig');if(config)config.onclick=ouvrirConfigurationInventaire;
 const body=document.getElementById('invGuideBody');if(invZone){renderInventaireZone(session,invZone);return}body.innerHTML=renderInventaireChoix(session);document.querySelectorAll('[data-inv-zone]').forEach(b=>b.onclick=()=>{invZone=b.dataset.invZone;renderInv()});document.querySelectorAll('[data-inv-detail]').forEach(b=>b.onclick=()=>{const el=document.getElementById('invDetail_'+b.dataset.invDetail);if(el)el.classList.toggle('on')});const valider=document.getElementById('invValidateFinal');if(valider)valider.onclick=confirmerValidationInventaire;
}
async function validerInv(){
 const session=sessionInventaire();if(!toutesZonesInventaireTerminees(session))return;
 const r=resultatInventaireSession(session),lignes=r.lignes.map(l=>({id:l.id,n:l.n,u:l.u,att:l.att,cpt:l.total,d:l.d,val:l.val,details:l.details,categorie:l.categorie}));if(!lignes.length)return;
 st.invHist.unshift({version:2,ts:new Date().toISOString(),lignes,zones:emplacementsInventaire(true).map(l=>({id:l.id,n:l.n,terminee:true,doneAt:zoneInventaire(session,l.id).doneAt})),anomalies:session.anomalies||[],nb:lignes.length,nbEcart:r.nbEcart,valEcart:r.valEcart});if(st.invHist.length>24)st.invHist.length=24;
 lignes.forEach(l=>{st.stock[l.id]=l.cpt});st.inventory.active=null;st.count={};await save();invTab='hist';invZone=null;renderInv();toast(t('invOk'));
}

function ouvrirConfigurationInventaire(){
 if(!peutConfigurerInventaire()){toast('Configuration réservée à Gestion / Direction.');return}
 const locations=emplacementsInventaire(false).map(l=>({...l}));let pid=(st.prods[0]||{}).id||'';
 const produitDraft={};(st.prods||[]).forEach(p=>produitDraft[p.id]={emplacements:[...(p.emplacements||[p.z||'reserve'])],categorie:p.invCategory||inventaireCategorieParDefaut(p)});
 const memoriserProduit=()=>{const checks=[...document.querySelectorAll('[data-inv-location-check]:checked')].map(x=>x.value);if(pid)produitDraft[pid]={emplacements:checks,categorie:document.getElementById('invProductCategory')?.value||'autres'}};
 const dessiner=()=>{
  const p=prod(pid),draft=produitDraft[pid]||{emplacements:[],categorie:'autres'};
  document.getElementById('modal').innerHTML=`<div class="sheet-bg inv-sheet" id="bgInvConfig"><div class="sheet"><h3>Configuration inventaire</h3><p class="sh-sub">Les emplacements guident le comptage. La catégorie sert uniquement au récapitulatif final.</p><div class="eyebrow">EMPLACEMENTS</div><div class="inv-config-list">${locations.map((l,index)=>`<div class="inv-config-location"><input data-inv-location-name="${l.id}" value="${escapeHTML(l.n)}" aria-label="Nom de l’emplacement"><button data-inv-location-up="${l.id}" ${index===0?'disabled':''} aria-label="Monter">↑</button><button data-inv-location-down="${l.id}" ${index===locations.length-1?'disabled':''} aria-label="Descendre">↓</button><button class="danger" data-inv-location-remove="${l.id}" aria-label="Supprimer l’emplacement">×</button><label class="inv-active-toggle"><input type="checkbox" data-inv-location-active="${l.id}" ${l.active!==false?'checked':''}> Actif pour les prochains inventaires</label></div>`).join('')}</div><button class="btn btn-2 btn-sm" id="invLocationAdd">+ Ajouter un emplacement</button><div class="inv-config-product"><div class="eyebrow">PRODUIT</div><select id="invConfigProduct">${(st.prods||[]).map(x=>`<option value="${x.id}" ${x.id===pid?'selected':''}>${x.i} ${escapeHTML(x.n)}</option>`).join('')}</select><div class="fld"><label>Catégorie d’inventaire</label><select id="invProductCategory">${INV_CATEGORIES.map(c=>`<option value="${c.id}" ${c.id===draft.categorie?'selected':''}>${c.n}</option>`).join('')}</select></div><div class="inv-config-checks">${locations.map(l=>`<label><input type="checkbox" value="${l.id}" data-inv-location-check ${draft.emplacements.includes(l.id)?'checked':''}> ${escapeHTML(l.n)}${l.active===false?' (désactivé)':''}</label>`).join('')}</div></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="invConfigCancel">${t('cancel')}</button><button class="btn" id="invConfigSave">Enregistrer</button></div></div></div>`;
  document.getElementById('bgInvConfig').onclick=e=>{if(e.target.id==='bgInvConfig')closeModal()};document.getElementById('invConfigCancel').onclick=closeModal;
  document.querySelectorAll('[data-inv-location-name]').forEach(i=>i.oninput=e=>{const l=locations.find(x=>x.id===e.target.dataset.invLocationName);if(l)l.n=e.target.value});document.querySelectorAll('[data-inv-location-active]').forEach(i=>i.onchange=e=>{const l=locations.find(x=>x.id===e.target.dataset.invLocationActive);if(l)l.active=e.target.checked});
  document.querySelectorAll('[data-inv-location-up],[data-inv-location-down]').forEach(b=>b.onclick=()=>{const id=b.dataset.invLocationUp||b.dataset.invLocationDown,ix=locations.findIndex(x=>x.id===id),target=b.dataset.invLocationUp?ix-1:ix+1;if(target<0||target>=locations.length)return;[locations[ix],locations[target]]=[locations[target],locations[ix]];dessiner()});
  document.querySelectorAll('[data-inv-location-remove]').forEach(b=>b.onclick=()=>{const id=b.dataset.invLocationRemove;if(locations.length===1){toast('Au moins un emplacement est nécessaire.');return}const used=(st.prods||[]).some(p=>(p.emplacements||[]).includes(id));if(used){toast('Désactive cet emplacement au lieu de le supprimer : il est déjà attribué.');return}locations.splice(locations.findIndex(x=>x.id===id),1);dessiner()});
  document.getElementById('invLocationAdd').onclick=()=>{memoriserProduit();locations.push({id:uid('loc'),n:'Nouvel emplacement',active:true,order:locations.length});dessiner()};
  document.getElementById('invConfigProduct').onchange=e=>{memoriserProduit();pid=e.target.value;dessiner()};
  document.getElementById('invConfigSave').onclick=async()=>{memoriserProduit();if(locations.some(l=>!String(l.n||'').trim())){toast('Chaque emplacement doit avoir un nom.');return}const current=produitDraft[pid];if(!current.emplacements.length){toast('Attribue au moins un emplacement habituel à ce produit.');return}const enCours=st.inventory&&st.inventory.active;if(enCours&&locations.some(l=>l.active===false&&enCours.zones&&enCours.zones[l.id]&&(enCours.zones[l.id].doneAt||Object.keys(enCours.zones[l.id].counts||{}).length))){toast('Termine ou annule l’inventaire en cours avant de désactiver un emplacement compté.');return}locations.forEach((l,index)=>{l.n=String(l.n).trim();l.order=index});st.inventory.locations=locations;const produit=prod(pid);if(produit){produit.emplacements=[...new Set(current.emplacements)];produit.z=produit.emplacements[0];produit.invCategory=current.categorie}await save();ajouterHistoriqueAudit('Configuration inventaire',produit?produit.n:'Emplacements', 'Configuration précédente','Emplacements et catégorie enregistrés','Gestion / Direction');closeModal();renderInv()};
 };
 dessiner();
}

/* ═════ BILAN ═════ */
