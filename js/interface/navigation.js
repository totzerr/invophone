/* SWAY · interface */

/* ═════ NAV ═════ */
function renderNav(){
 const iconesNav={dash:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>',caisse:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m5 10V5m5 14v-7m5 7V8"></path></svg>',dec:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle><path d="M12 9v6m-3-3h6"></path></svg>',liv:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14v11H5zM9 4h6M12 4v8m-3-3 3 3 3-3"></path></svg>',cmd:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h3l2 10h9l2-7H8"></path><circle cx="10" cy="19" r="1"></circle><circle cx="18" cy="19" r="1"></circle></svg>',stock:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"></path><path d="m4 7.5 8 4.5 8-4.5M12 12v9"></path></svg>',inv:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"></rect><path d="M9 4.5h6M9 10h6m-6 4h6m-6 4h4"></path></svg>',bil:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 9 13l4 3 7-8"></path><path d="M15 8h5v5"></path></svg>',admin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"></path><path d="M8 7V4h8v3M8 11h8m-8 4h5"></path></svg>'};
 iconesNav.recipes='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM9 8h6m-6 4h6m-6 4h4"></path></svg>';
 iconesNav.team='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.5"></circle><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6m0-5c3 0 5 1.7 5 5"></path></svg>';
 const nouv=Math.max(0,st.mv.length-seenFeed),pc=panierCount();
 const aujourdHui=new Date().toISOString().slice(0,10);
 const receptionsEnAttente=(st.commandes||[]).filter(function(c){return c&&c.statut!=='recu'&&c.statut!=='annulee'&&c.dateLiv&&c.dateLiv<=aujourdHui}).length;
 let items=[
  {id:'dash',i:iconesNav.dash,l:'Vue générale',group:'pilotage'},
  {id:'caisse',i:iconesNav.caisse,l:'Ventes',b:screen!=='caisse'?nouv:0,group:'activité'},
  {id:'dec',i:iconesNav.dec,l:'Déclarer',b:screen!=='dec'?pc:0,group:'activité'},
  {id:'liv',i:iconesNav.liv,l:'Réceptions',b:receptionsEnAttente,group:'gestion'},
  {id:'cmd',i:iconesNav.cmd,l:'Commandes',group:'gestion'},
  {id:'stock',i:iconesNav.stock,l:'Stock',group:'gestion'},
  {id:'inv',i:iconesNav.inv,l:'Inventaire',group:'gestion'},
  {id:'bil',i:iconesNav.bil,l:'Analyse',group:'analyse'},
  {id:'recipes',i:iconesNav.recipes,l:'Fiches techniques',group:'analyse'},
  {id:'team',i:iconesNav.team,l:'Équipe',group:'administration'},
  {id:'admin',i:iconesNav.admin,l:'Administration',group:'administration'}
 ];
 items=items.filter(x=>peutAccederOnglet(x.id));
 const logoTpl=document.getElementById('invoLogo');
 const logoHTML=logoTpl?logoTpl.innerHTML:'';
 const groupe=(nom,ids)=>{const xs=items.filter(x=>ids.includes(x.id));if(!xs.length)return '';
  return `<div class="workspace-group"><span class="workspace-label">${nom}</span>
   <div class="workspace-list">${xs.map(x=>`<button class="workspace-link ${screen===x.id?'on':''}" data-nav="${x.id}">
    <span class="workspace-icon">${x.i}</span><span class="workspace-name">${x.l}</span>
    ${x.b?`<span class="workspace-badge">${x.b>99?'99+':x.b}</span>`:''}</button>`).join('')}</div></div>`;};
 document.getElementById('drawer').innerHTML=`
  <div class="workspace-head"><div class="workspace-brand">${logoHTML}</div>
   <button class="workspace-close" type="button" data-menu="1" aria-label="Fermer le menu">×</button>
   <button class="workspace-place" data-reg="1"><span>${st.organizationName||st.etabNom||'Mon entreprise'}</span><b>⌄</b></button></div>
  <div class="workspace-compose"><button class="workspace-add" data-nav="dec"><span>＋</span>${t('newVente')}</button></div>
  <div class="workspace-content">${groupe('VUE GÉNÉRALE',['dash'])}${groupe('FLUX',['caisse','dec'])}${groupe('STOCK',['liv','cmd','stock','inv'])}${groupe('RAPPORTS',['bil','recipes'])}${groupe('DIRECTION',['team','admin'])}</div>
  <div class="workspace-bottom"><button class="workspace-settings" data-reg="1"><span>⚙</span>${t('reglages')}</button>
   <button class="workspace-settings workspace-signout" data-signout="1"><span>↪</span>${t('seDeconnecter')}</button>
   <p>${t('slogan')}</p></div>`;
 const tabs=items;
 document.getElementById('nav').innerHTML=`${tabs.map(x=>`<button class="tab-item ${screen===x.id?'on':''}" data-nav="${x.id}">
  <span class="tab-icon">${x.i}</span><span>${x.l}</span>${x.b?`<i>${x.b>99?'99+':x.b}</i>`:''}</button>`).join('')}
  <button class="tab-item tab-more" data-menu="1"><span class="tab-icon">•••</span><span>Plus</span></button>`;
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{screen=b.dataset.nav;sq='';fermerMenu();go()});
 document.querySelectorAll('[data-reg]').forEach(b=>b.onclick=()=>{fermerMenu();openReglages()});
 document.querySelectorAll('[data-signout]').forEach(b=>b.onclick=async()=>{fermerMenu();if(confirm('Se déconnecter de Sway ?'))await deconnecter()});
 document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>basculerMenu());
}

/* ── Ouverture / fermeture du menu ── */
function ouvrirMenu(){
 document.getElementById('drawer').classList.add('on');
 document.getElementById('drBg').classList.add('on');
 document.getElementById('burgerBtn').classList.add('open');
}
function fermerMenu(){
 document.getElementById('drawer').classList.remove('on');
 document.getElementById('drBg').classList.remove('on');
 document.getElementById('burgerBtn').classList.remove('open');
}
function basculerMenu(){
 document.getElementById('drawer').classList.contains('on')?fermerMenu():ouvrirMenu();
}

function go(){
if(!peutAccederOnglet(screen))screen='dash';
document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
document.getElementById('s-'+screen).classList.add('on');window.scrollTo({top:0});renderNav();
if(screen==='dash')renderDash();if(screen==='caisse')renderCaisse();if(screen==='dec')renderDec();
if(screen==='liv')renderLiv();if(screen==='cmd')renderCommanderScreen();
if(screen==='stock')renderStock();if(screen==='inv')renderInv();if(screen==='bil')renderBil();
if(screen==='recipes')renderRecipesHub();if(screen==='team')renderTeamHub();
if(screen==='admin')renderAdministration();
if(screen!=='dec')document.getElementById('cartbar').innerHTML=''}

function synchroniserVisibilitePanierSortie(){
 const modal=document.getElementById('modal');
 document.body.classList.toggle('invo-modal-open',!!(modal&&modal.childElementCount));
}
const modalPanierSortie=document.getElementById('modal');
if(modalPanierSortie&&typeof MutationObserver!=='undefined'){
 new MutationObserver(synchroniserVisibilitePanierSortie).observe(modalPanierSortie,{childList:true,subtree:true});
}
const closeModal=()=>{document.getElementById('modal').innerHTML='';fm=null};
function openLang(){document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bg1"><div class="sheet">
<h3>${t('lang')}</h3><p class="sh-sub">${t('langS')}</p>
${Object.keys(L).map(k=>`<button class="opt ${st.lang===k?'on':''}" data-l="${k}">
<span class="oi">${L[k].fl}</span>${L[k].nom}</button>`).join('')}</div></div>`;
document.getElementById('bg1').onclick=e=>{if(e.target.id==='bg1')closeModal()};
document.querySelectorAll('[data-l]').forEach(b=>b.onclick=async()=>{
st.lang=b.dataset.l;await save();closeModal();renderAll()})}
function openWho(){document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bg2"><div class="sheet">
<h3>${t('who')}</h3><p class="sh-sub">${t('whoS')}</p>
${POSTES.filter(p=>rolesTemporairesDisponibles().includes(p.id)).map(p=>`<button class="opt ${st.whoId===p.id?'on':''}" data-w="${p.id}"><span class="oi">${p.i}</span>
<span>${p.n}<small>${p.resp?t('accesTout'):t('accesEquipe')}</small></span></button>`).join('')}
</div></div>`;
document.getElementById('bg2').onclick=e=>{if(e.target.id==='bg2')closeModal()};
document.querySelectorAll('[data-w]').forEach(b=>b.onclick=async()=>{
const p=POSTES.find(x=>x.id===b.dataset.w),u=utilisateurConnecte();if(!p)return;st.whoId=p.id;st.who=(u&&u.nom)||p.n;
await synchroniserProfilMetierAvecVue(p.id);await save();closeModal();renderAll()})}
