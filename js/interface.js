/* SWAY · interface */

/* ═════ NAV ═════ */
function renderNav(){
 const iconesNav={dash:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>',caisse:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m5 10V5m5 14v-7m5 7V8"></path></svg>',dec:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle><path d="M12 9v6m-3-3h6"></path></svg>',liv:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14v11H5zM9 4h6M12 4v8m-3-3 3 3 3-3"></path></svg>',cmd:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h3l2 10h9l2-7H8"></path><circle cx="10" cy="19" r="1"></circle><circle cx="18" cy="19" r="1"></circle></svg>',stock:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"></path><path d="m4 7.5 8 4.5 8-4.5M12 12v9"></path></svg>',inv:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"></rect><path d="M9 4.5h6M9 10h6m-6 4h6m-6 4h4"></path></svg>',bil:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 9 13l4 3 7-8"></path><path d="M15 8h5v5"></path></svg>',admin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"></path><path d="M8 7V4h8v3M8 11h8m-8 4h5"></path></svg>'};
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
   <button class="workspace-place" data-reg="1"><span>${st.etabNom||'SP Wallace'}</span><b>⌄</b></button></div>
  <div class="workspace-compose"><button class="workspace-add" data-nav="dec"><span>＋</span>${t('newVente')}</button></div>
  <div class="workspace-content">${groupe('VUE GÉNÉRALE',['dash'])}${groupe('FLUX',['caisse','dec'])}${groupe('STOCK',['liv','cmd','stock','inv'])}${groupe('RAPPORTS',['bil'])}${groupe('DIRECTION',['admin'])}</div>
  <div class="workspace-bottom"><button class="workspace-settings" data-reg="1"><span>⚙</span>${t('reglages')}</button>
   <p>${t('slogan')}</p></div>`;
 const tabs=items;
 document.getElementById('nav').innerHTML=`${tabs.map(x=>`<button class="tab-item ${screen===x.id?'on':''}" data-nav="${x.id}">
  <span class="tab-icon">${x.i}</span><span>${x.l}</span>${x.b?`<i>${x.b>99?'99+':x.b}</i>`:''}</button>`).join('')}
  <button class="tab-item tab-more" data-menu="1"><span class="tab-icon">•••</span><span>Plus</span></button>`;
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{screen=b.dataset.nav;sq='';fermerMenu();go()});
 document.querySelectorAll('[data-reg]').forEach(b=>b.onclick=()=>{fermerMenu();openReglages()});
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
/* ═════ RÉGLAGES · COMPTE · MATÉRIEL CONNECTÉ ═════ */
const roleEstAutorise=id=>id==='admin';
function utilisateursEtablissement(){
 const tous=Object.values(auth.users||{}),etabId=session&&session.etabId;
 return tous.filter(u=>!etabId||!u.etabId||u.etabId===etabId).sort((a,b)=>(a.nom||a.mail).localeCompare(b.nom||b.mail,'fr'));
}
function dateUtilisateur(ts){return ts?new Date(ts).toLocaleDateString('fr-FR'):'—'}
function dessinerUtilisateurs(){
 if(session&&session.supabase)return peutGererRoles()?'<button class="btn" id="addUser" style="margin-bottom:12px">+ Inviter un employé</button><div class="auth-msg info"><b>Équipe Sway sécurisée.</b><br>L’administrateur choisit l’e-mail et les rôles. L’employé crée son mot de passe depuis le lien reçu ; son accès reste limité à cet établissement.</div>':'<div class="auth-msg info">La gestion des rôles et des invitations est réservée à l’administrateur.</div>';
 const autorise=peutGererRoles(),users=utilisateursEtablissement();
 const cards=users.map(u=>{
  const roles=rolesUtilisateur(u),libelles=roles.map(id=>{const p=POSTES.find(x=>x.id===id);return p?p.n:id}).join(' · '),self=!!(session&&session.email===u.mail);
  return `<div class="user-card"><div><div class="user-name">${escapeHTML(u.nom||u.mail)}${self?' · vous':''}</div>
   <div class="user-mail">${escapeHTML(u.mail)}</div><div class="user-meta"><span class="user-status ${u.statut==='invite'?'invite':''}">${u.statut==='invite'?'Invitation':'Actif'}</span>
   <span class="user-date">${u.derniereActivite?'Dernière activité '+dateUtilisateur(u.derniereActivite):'Ajouté le '+dateUtilisateur(u.cree)}</span></div></div>
   <div class="user-actions">${autorise?`<button class="user-role" data-user-roles="${escapeHTML(u.mail)}" aria-label="Rôles de ${escapeHTML(u.nom||u.mail)}">${escapeHTML(libelles)} ›</button>
    <button class="user-remove" data-user-remove="${escapeHTML(u.mail)}" title="Retirer" aria-label="Retirer ${escapeHTML(u.nom||u.mail)}">×</button>`:
    `<span class="pill-etat on">${escapeHTML(libelles)}</span>`}</div></div>`}).join('');
 return `${autorise?'<button class="btn" id="addUser" style="margin-bottom:12px">+ Ajouter un utilisateur</button>':
  '<div class="auth-msg info">La gestion des rôles est réservée à l’administrateur.</div>'}
  <div class="user-list">${cards||'<div class="zone-empty">Aucun utilisateur enregistré pour cet espace.</div>'}</div>
  <div class="auth-msg info">Les comptes utilisent le registre d’accès INVO existant. En mode test, l’écran de connexion reste désactivé.</div>`;
}
function ouvrirRolesUtilisateur(mail){
 const u=auth.users[mail];if(!u||!peutGererRoles())return;const roles=rolesUtilisateur(u);
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgRoles"><div class="sheet"><h3>Rôles de ${escapeHTML(u.nom||u.mail)}</h3><p class="sh-sub">Un utilisateur peut cumuler plusieurs rôles. Le rôle principal est utilisé à sa prochaine connexion.</p><div class="role-checks">${POSTES.map(p=>`<label><input type="checkbox" value="${p.id}" data-role-check ${roles.includes(p.id)?'checked':''}> <span>${p.i}</span> ${p.n}</label>`).join('')}</div><div class="auth-msg err" id="rolesErr" style="display:none"></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="rolesCancel">Annuler</button><button class="btn" id="rolesSave">Enregistrer</button></div></div></div>`;
 document.getElementById('bgRoles').onclick=e=>{if(e.target.id==='bgRoles')openReglages('users')};document.getElementById('rolesCancel').onclick=()=>openReglages('users');document.getElementById('rolesSave').onclick=async()=>{const roles=[...document.querySelectorAll('[data-role-check]:checked')].map(x=>x.value),err=document.getElementById('rolesErr');if(!roles.length){err.textContent='Sélectionnez au moins un rôle.';err.style.display='block';return}await changerRolesUtilisateur(mail,roles)};
}
async function changerRolesUtilisateur(mail,nouveauxRoles){
 const u=auth.users[mail],roles=rolesValides(nouveauxRoles);if(!u||!peutGererRoles()||!roles.length)return;
 const admins=utilisateursEtablissement().filter(estAdministrateurUtilisateur);
 if(estAdministrateurUtilisateur(u)&&!roles.includes('admin')&&admins.length<=1){toast('Le dernier administrateur doit conserver ce rôle.');return}
 u.roles=roles;u.role=roles.includes(u.role)?u.role:roles[0];await saveAuth();toast('Rôles mis à jour.');openReglages('users');
}
async function retirerUtilisateur(mail){
 const u=auth.users[mail];if(!u||!peutGererRoles())return;
 if(session&&session.email===mail){toast('Vous ne pouvez pas retirer votre propre compte.');return}
 const admins=utilisateursEtablissement().filter(estAdministrateurUtilisateur);
 if(estAdministrateurUtilisateur(u)&&admins.length<=1){toast('Impossible de retirer le dernier administrateur.');return}
 if(!confirm(`Êtes-vous sûr de vouloir retirer ${u.nom||u.mail} de INVO ? Il n’aura plus accès à l’espace.`))return;
 delete auth.users[mail];await saveAuth();toast('Utilisateur retiré.');openReglages('users');
}
function openAjouterUtilisateur(){
 if(!peutGererRoles())return;
 const enLigne=!!(session&&session.supabase);
 userForm={nom:'',mail:'',roles:['serveur']};
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgU"><div class="sheet">
  <h3>${enLigne?'Inviter un employé':'Ajouter un utilisateur'}</h3><p class="sh-sub">${enLigne?'Un e-mail sécurisé lui permettra de choisir son mot de passe et d’accéder uniquement à cet établissement.':'Créez un accès dans le registre INVO existant.'}</p>
  <div class="fld"><label>Nom et prénom</label><input id="uNom" autocomplete="name" placeholder="Camille Martin"></div>
  <div class="fld"><label>Adresse e-mail</label><input id="uMail" type="email" inputmode="email" autocomplete="email" placeholder="camille@restaurant.fr"></div>
  <div class="fld"><label>Rôles</label><div class="role-checks">${POSTES.map(p=>`<label><input type="checkbox" value="${p.id}" data-new-role ${p.id==='serveur'?'checked':''}> <span>${p.i}</span> ${p.n}</label>`).join('')}</div></div>
  <div class="auth-msg err" id="uErr" style="display:none"></div>
  <div class="sh-actions"><button class="btn btn-2 btn-sm" id="uCancel">Annuler</button><button class="btn" id="uSave">${enLigne?'Envoyer l’invitation':'Ajouter'}</button></div>
 </div></div>`;
 document.getElementById('bgU').onclick=e=>{if(e.target.id==='bgU')openReglages('users')};
 document.getElementById('uCancel').onclick=()=>openReglages('users');
 document.getElementById('uSave').onclick=ajouterUtilisateur;
}
async function ajouterUtilisateur(){
 const nom=document.getElementById('uNom').value.trim(),mail=normMail(document.getElementById('uMail').value),roles=rolesValides([...document.querySelectorAll('[data-new-role]:checked')].map(x=>x.value));
 const err=document.getElementById('uErr'),fail=msg=>{err.textContent=msg;err.style.display='block'};
 if(!nom||!mail)return fail('Renseignez le nom et l’adresse e-mail.');
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return fail('L’adresse e-mail n’est pas valide.');
 if(!roles.length)return fail('Sélectionnez au moins un rôle valide.');
 if(session&&session.supabase){
  const save=document.getElementById('uSave');save.disabled=true;
  try{
   const service=window.SwaySupabaseAuth;
   const result=await service.workspaceMembers('invite',{establishmentId:session.etabId,fullName:nom,email:mail,roles:roles.map(r=>r==='admin'?'administrateur':r),redirectTo:location.origin+location.pathname});
   if(result.error){save.disabled=false;return fail(result.error)}
   document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgUC"><div class="sheet"><h3>Invitation envoyée</h3><p class="sh-sub">${escapeHTML(nom)} recevra un e-mail à l’adresse ${escapeHTML(mail)}. Ses rôles seront appliqués uniquement après la création de son mot de passe.</p><div class="sh-actions"><button class="btn" id="uDone">Terminer</button></div></div></div>`;
   document.getElementById('uDone').onclick=()=>{toast('Invitation envoyée.');openReglages('users')};
  }catch(error){save.disabled=false;fail('Impossible d’envoyer cette invitation pour le moment.');}
  return;
 }
 if(auth.users[mail])return fail('Un utilisateur possède déjà cette adresse e-mail.');
 const salt=rnd(16),code=rnd(4)+'-'+rnd(4),etabId=(session&&session.etabId)||'local';
 auth.users[mail]={mail,nom,role:roles[0],roles,profilMetier:'',recapMatin:{actif:true,heure:'08:00'},etabId,etabNom:st.etabNom||'SP Wallace',salt,hash:await hashPwd(code,salt),
  codeHash:await hashPwd(code,salt),cree:Date.now(),statut:'invite'};
 await saveAuth();
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgUC"><div class="sheet"><h3>Utilisateur ajouté</h3>
  <p class="sh-sub">L’accès de ${escapeHTML(nom)} est prêt. Transmettez-lui ce code temporaire par un canal sûr.</p>
  <div class="code-box"><div class="code-val">${code}</div><div class="code-lab">Code temporaire · ${escapeHTML(mail)}</div></div>
  <div class="sh-actions"><button class="btn" id="uDone">Terminer</button></div></div></div>`;
 document.getElementById('uDone').onclick=()=>{toast('Utilisateur ajouté.');openReglages('users')};
}
function optionsProfilMetier(){
 const actuel=profilMetierActuel();
 return '<option value="" '+(!actuel?'selected':'')+'>Vue générale (par défaut)</option>'+PROFILS_METIER.map(function(p){return '<option value="'+p.id+'" '+(actuel===p.id?'selected':'')+'>'+p.i+' '+p.n+'</option>'}).join('');
}
function settingsIcon(kind){
 const icons={
  general:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20H4z"></path><path d="M9 20v-5h6v5"></path></svg>',
  users:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><path d="M3.8 20c.6-3.2 2.4-5 5.2-5s4.6 1.8 5.2 5"></path><path d="M16 8h4m-2-2v4"></path></svg>',
  building:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h14v17"></path><path d="M9 8h2m2 0h2M9 12h2m2 0h2M10 21v-4h4v4"></path></svg>',
  profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"></circle><path d="M5.5 20c.8-3.7 3-5.5 6.5-5.5s5.7 1.8 6.5 5.5"></path></svg>',
  pilot:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3m0 9v6M4.9 7.5l2.2 2.2m9.8 4.6 2.2 2.2M3 12h3m12 0h3m-2.1-4.5-2.2 2.2m-9.8 4.6-2.2 2.2"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  backup:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z"></path><path d="M8 4v6h8V4M8 20v-6h8v6"></path></svg>',
  transfer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10"></path><path d="m14 4 3 3-3 3"></path><path d="M17 17H7"></path><path d="m10 14-3 3 3 3"></path></svg>',
  recap:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5l3 2"></path><circle cx="12" cy="12" r="8"></circle><path d="M12 2v2m0 16v2"></path></svg>',
  hardware:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16H7z"></path><path d="M10 7h4m-4 4h4m-2 6h.01"></path></svg>',
  data:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z"></path><path d="M8 9h8M8 13h5M8 17h3"></path></svg>',
  close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"></path></svg>',
  arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>'
 };
 return '<span class="settings-row-icon settings-row-icon--'+kind+'">'+(icons[kind]||icons.general)+'</span>';
}
function openReglages(){
 settingsTab=typeof arguments[0]==='string'?arguments[0]:(settingsTab||'general');
 if(settingsTab==='users'&&!peutGererRoles())settingsTab='general';
 const dos=st.doseurs||{actif:false,releves:{}};
 const textePilote=st.demoParcours?(st.live?'Démo caisse active.':'Démo caisse prête.'):(st.modePilote?t('pilotOn'):t('pilotS')),recapMatin=preferencesRecapMatin();
 const etatPilote=st.demoParcours?(st.live?'Auto':'Démo'):(st.modePilote?'Actif':'Prêt');
 const general=`
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('building')}<span>${t('etablissement')}</span></div>
   <div class="settings-card">
    <div class="settings-field-row">
     <label for="rEtab" class="settings-field-label">${settingsIcon('building')}<span><b>${t('nomEtab')}</b><small>Nom affiché dans INVO.</small></span></label>
     <input class="settings-inline-input" id="rEtab" value="${(st.etabNom===undefined?'SP Wallace':(st.etabNom||'')).replace(/"/g,'&quot;')}" placeholder="SP Wallace">
    </div>
    <div class="settings-field-row">
     <label for="rProfilMetier" class="settings-field-label">${settingsIcon('profile')}<span><b>Profil métier</b><small>Personnalise l’accueil, sans modifier les accès.</small></span></label>
     <select class="settings-inline-select" id="rProfilMetier">${optionsProfilMetier()}</select>
    </div>
    <div class="settings-field-row">
     <label for="rMeteoVille" class="settings-field-label">${settingsIcon('general')}<span><b>Ville pour la météo</b><small>Affiche les conditions locales sur l’accueil. Vous pouvez la modifier à tout moment.</small></span></label>
     <input class="settings-inline-input" id="rMeteoVille" value="${preferencesMeteo().ville.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" placeholder="Ex. Paris">
    </div>
   </div>
  </section>
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('recap')}<span>Récapitulatif quotidien</span></div>
   <div class="settings-card">
    <div class="settings-status-row"><span class="settings-field-label">${settingsIcon('recap')}<span><b>Mon récapitulatif du matin</b><small>Son contenu s’adapte à votre profil métier et aux données réellement enregistrées.</small></span></span><span class="pill-etat ${recapMatin.actif?'on':'off'}">${recapMatin.actif?'Actif':'En pause'}</span></div>
    <div class="settings-field-row"><label for="recapTime" class="settings-field-label">${settingsIcon('recap')}<span><b>Heure de réception</b><small>Choix personnel : chaque utilisateur règle son propre horaire.</small></span></label><input class="settings-inline-input" id="recapTime" type="time" value="${recapMatin.heure}"></div>
    <div class="settings-choice" role="group" aria-label="Statut du récapitulatif"><button class="${recapMatin.actif?'on':''}" data-recap-active="1">Activer</button><button class="${!recapMatin.actif?'on':''}" data-recap-active="0">Mettre en pause</button></div>
    <div class="settings-mini-action"><span>${settingsIcon('profile')}<span><b>Contenu personnalisé</b><small>Profil actuel : ${escapeHTML((PROFILS_METIER.find(function(p){return p.id===profilMetierActuel()})||POSTES.find(function(p){return p.id===st.whoId})||{n:st.who}).n)}.</small></span></span><button class="settings-text-button" id="recapPreview">Voir${settingsIcon('arrow')}</button></div>
   </div>
  </section>
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('users')}<span>Compte</span></div>
   <div class="settings-card"><div class="settings-mini-action"><span>${settingsIcon('users')}<span><b>${session&&session.supabase?'Compte Sway connecté':'Connexion Sway'}</b><small>${session&&session.supabase?'Connexion e-mail active pour '+escapeHTML(session.email)+'.':'Activez la connexion sécurisée par e-mail et mot de passe.'}</small></span></span><button class="settings-text-button" id="swayAuthAction">${session&&session.supabase?'Se déconnecter':'Se connecter'}${settingsIcon('arrow')}</button></div></div>
  </section>`;
 const outils=`<section class="settings-group">
   <div class="settings-group-title">${settingsIcon('hardware')}<span>Matériel</span></div>
   <p class="settings-intro">Ces outils sont facultatifs. INVO continue de fonctionner sans matériel ni service connecté.</p>
   <div class="settings-card">
    <div class="settings-status-row">
     <span class="settings-field-label">${settingsIcon('hardware')}<span><b>${t('doseurs')}</b><small>${t('doseursS')}</small></span></span>
     <span class="pill-etat ${dos.actif?'on':'off'}">${dos.actif?t('activeManuel'):t('nonConfig')}</span>
    </div>
    <div class="settings-choice" role="group" aria-label="${t('doseurs')}"><button class="${!dos.actif?'on':''}" data-dos="0">${t('sansDoseurs')}</button><button class="${dos.actif?'on':''}" data-dos="1">${t('avecDoseurs')}</button></div>
    <div class="settings-static-row"><span>${settingsIcon('hardware')}<span><b>${t('futs')}</b><small>${t('futsS')}</small></span></span><span class="pill-etat soon">${t('aVenir')}</span></div>
    <div class="settings-static-row"><span>${settingsIcon('hardware')}<span><b>${t('balances')}</b><small>${t('balancesS')}</small></span></span><span class="pill-etat soon">${t('aVenir')}</span></div>
   </div>
  </section>
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('data')}<span>Services</span></div>
   <div class="settings-card">
    <div class="settings-static-row"><span>${settingsIcon('data')}<span><b>Caisse</b><small>Connexion à préparer avec le fournisseur de caisse.</small></span></span><span class="pill-etat soon">À connecter</span></div>
    <div class="settings-static-row"><span>${settingsIcon('data')}<span><b>Hygiène</b><small>Connexion à préparer avec le logiciel d’hygiène.</small></span></span><span class="pill-etat soon">À connecter</span></div>
    <div class="settings-static-row"><span>${settingsIcon('data')}<span><b>Comptabilité</b><small>Connexion à préparer avec le logiciel comptable.</small></span></span><span class="pill-etat soon">À connecter</span></div>
   </div>
  </section>`;
 const donnees=`<section class="settings-group">
   <div class="settings-group-title">${settingsIcon('pilot')}<span>${t('pilot')} / ${t('reset')}</span></div>
   <div class="settings-card">
    <div class="settings-status-row">
     <span class="settings-field-label">${settingsIcon('pilot')}<span><b>Test pilote</b><small>${textePilote}</small></span></span>
     <span class="pill-etat ${(st.modePilote||st.demoParcours)?'on':'off'}">${etatPilote}</span>
    </div>
    <div class="settings-action-grid">
     <button class="settings-action-button" id="pilotAutoStart">${settingsIcon('pilot')}<span>Lancer la démo caisse</span></button>
     ${st.modePilote?'':`<button class="settings-action-button" id="pilotStart">${settingsIcon('pilot')}<span>${t('pilotStart')}</span></button>`}
     <button class="settings-action-button" id="resetDemo">${settingsIcon('general')}<span>${t('reset')}</span></button>
    </div>
    ${st.demoParcours?`<div class="settings-mini-action"><span>${settingsIcon('pilot')}<span><b>Démo caisse</b><small>Simule les ventes reçues depuis une caisse. Rien n’est envoyé à la caisse réelle.</small></span></span><button class="settings-text-button" id="pilotAutoPause">${st.live?'Mettre en pause':'Reprendre'}${settingsIcon('arrow')}</button></div>`:''}
   ${st.modePilote?'':`<div class="settings-mini-action"><span>${settingsIcon('pilot')}<span><b>Démo caisse</b><small>${t('pilotDemoS')}</small></span></span><button class="settings-text-button" id="pilotDemoLoad">${t('pilotDemoLoad')}${settingsIcon('arrow')}</button></div>`}
   </div>
  </section>
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('backup')}<span>${t('sauvegarde')}</span></div>
   <div class="settings-card">
    <div class="settings-mini-action"><span>${settingsIcon('backup')}<span><b>${t('exportSauvegarde')}</b><small>${t('sauvegardeS')}</small></span></span><button class="settings-text-button" id="bkExport">Exporter${settingsIcon('arrow')}</button></div>
    <div class="settings-mini-action"><span>${settingsIcon('backup')}<span><b>${t('importSauvegarde')}</b><small>${t('importAide')}</small></span></span><button class="settings-text-button" id="bkImportBtn">Importer${settingsIcon('arrow')}</button><input id="bkImport" type="file" accept=".json,application/json" style="display:none"></div>
   </div>
  </section>${transfertDonneesHTML()}`;
 const users=`<section class="settings-group settings-users-group"><div class="settings-group-title">${settingsIcon('users')}<span>Utilisateurs</span></div><div class="settings-card settings-users-card">${dessinerUtilisateurs()}</div></section>`;
 document.getElementById('modal').innerHTML=`<div class="sheet-bg settings-overlay" id="bgR"><div class="sheet settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
  <header class="settings-header"><div><span class="settings-kicker">SWAY</span><h3 id="settingsTitle">${t('reglages')}</h3><p>Les préférences de votre espace, sans quitter votre travail.</p></div><button type="button" class="settings-close" id="rFerm" aria-label="${t('fermer')}">${settingsIcon('close')}</button></header>
  <div class="settings-layout"><nav class="settings-nav" aria-label="Sections des réglages"><span class="settings-nav-label">ESPACE</span><button class="${settingsTab==='general'?'on':''}" data-settings="general" aria-current="${settingsTab==='general'?'page':'false'}">${settingsIcon('general')}<span>Établissement & compte</span></button><span class="settings-nav-label">CONNEXIONS</span><button class="${settingsTab==='outils'?'on':''}" data-settings="outils" aria-current="${settingsTab==='outils'?'page':'false'}">${settingsIcon('hardware')}<span>Outils connectés</span></button><span class="settings-nav-label">DONNÉES</span><button class="${settingsTab==='donnees'?'on':''}" data-settings="donnees" aria-current="${settingsTab==='donnees'?'page':'false'}">${settingsIcon('data')}<span>Données & sauvegarde</span></button>${peutGererRoles()?`<span class="settings-nav-label">ÉQUIPE</span><button class="${settingsTab==='users'?'on':''}" data-settings="users" aria-current="${settingsTab==='users'?'page':'false'}">${settingsIcon('users')}<span>Équipe & rôles</span></button>`:''}</nav><div class="settings-content">${settingsTab==='general'?general:settingsTab==='outils'?outils:settingsTab==='donnees'?donnees:users}</div></div>
 </div></div>`;
 document.getElementById('bgR').onclick=e=>{if(e.target.id==='bgR')closeModal()};
 document.getElementById('rFerm').onclick=closeModal;
 document.querySelectorAll('[data-settings]').forEach(b=>b.onclick=()=>openReglages(b.dataset.settings));
 const transferStart=document.getElementById('transferStart');if(transferStart)transferStart.onclick=ouvrirTransfertDonnees;
 const transferSource=document.getElementById('transferSource');if(transferSource)transferSource.onclick=()=>toast('Cette connexion nécessite l’API de l’ancien logiciel ou un connecteur partenaire.');
 document.querySelectorAll('[data-transfer-review]').forEach(b=>b.onclick=()=>ouvrirRevueTransfert(b.dataset.transferReview));
 const addUser=document.getElementById('addUser');if(addUser)addUser.onclick=openAjouterUtilisateur;
 document.querySelectorAll('[data-user-roles]').forEach(b=>b.onclick=()=>ouvrirRolesUtilisateur(b.dataset.userRoles));
 document.querySelectorAll('[data-user-remove]').forEach(b=>b.onclick=()=>retirerUtilisateur(b.dataset.userRemove));
 const bkOut=document.getElementById('bkExport'),bkBtn=document.getElementById('bkImportBtn'),bkIn=document.getElementById('bkImport');
 if(bkOut)bkOut.onclick=async()=>{bkOut.disabled=true;try{await exporterSauvegarde();toast(t('backupOk'))}catch(e){toast(t('backupRead'))}bkOut.disabled=false};
 if(bkBtn&&bkIn)bkBtn.onclick=()=>bkIn.click();
 const pilotBtn=document.getElementById('pilotStart');
 if(pilotBtn)pilotBtn.onclick=async()=>{pilotBtn.disabled=true;await preparerTestReel();};
 const pilotAutoBtn=document.getElementById('pilotAutoStart');
 if(pilotAutoBtn)pilotAutoBtn.onclick=async()=>{pilotAutoBtn.disabled=true;await chargerParcoursDemonstration(true);};
 const pilotAutoPause=document.getElementById('pilotAutoPause');
 if(pilotAutoPause)pilotAutoPause.onclick=async()=>{st.live=!st.live;await save();startFeed();if(st.live)setTimeout(posEvent,300);openReglages();};
 const resetBtn=document.getElementById('resetDemo');
 if(resetBtn)resetBtn.onclick=async()=>{resetBtn.disabled=true;await resetDemo();};
 const pilotDemoBtn=document.getElementById('pilotDemoLoad');
 if(pilotDemoBtn)pilotDemoBtn.onclick=async()=>{pilotDemoBtn.disabled=true;await chargerParcoursDemonstration();};
 if(bkIn)bkIn.onchange=async()=>{const f=bkIn.files&&bkIn.files[0];bkIn.value='';await importerSauvegarde(f)};
 const re_=document.getElementById('rEtab');
 if(re_)re_.oninput=e=>{st.etabNom=e.target.value;mettreAJourMarqueEtablissement();save()};
 const profilMetier=document.getElementById('rProfilMetier');
 if(profilMetier)profilMetier.onchange=async function(){profilMetier.disabled=true;try{await enregistrerProfilMetier(profilMetier.value)}catch(e){toast('Impossible d’enregistrer le profil métier.')}profilMetier.disabled=false};
 const meteoVille=document.getElementById('rMeteoVille');if(meteoVille){const enregistrerVille=async function(){meteoVille.disabled=true;try{const ville=await enregistrerVilleMeteo(meteoVille.value);toast(ville?'Ville météo enregistrée.':'Météo désactivée : aucune ville choisie.')}catch(e){toast('Impossible d’enregistrer la ville.')}meteoVille.disabled=false};meteoVille.oninput=function(){if(meteoVilleTimer)clearTimeout(meteoVilleTimer);meteoVilleTimer=setTimeout(enregistrerVille,700)};meteoVille.onchange=function(){if(meteoVilleTimer)clearTimeout(meteoVilleTimer);enregistrerVille()};}
 const recapTime=document.getElementById('recapTime');if(recapTime)recapTime.onchange=async function(){await enregistrerPreferencesRecapMatin({heure:recapTime.value});toast('Heure du récapitulatif enregistrée.');};
 document.querySelectorAll('[data-recap-active]').forEach(function(b){b.onclick=async function(){await enregistrerPreferencesRecapMatin({actif:b.dataset.recapActive==='1'});openReglages('general');};});
 const recapPreview=document.getElementById('recapPreview');if(recapPreview)recapPreview.onclick=ouvrirRecapMatin;
 const swayAuthAction=document.getElementById('swayAuthAction');if(swayAuthAction)swayAuthAction.onclick=async function(){
  if(session&&session.supabase){if(confirm('Se déconnecter de Sway ?'))await deconnecter();return}
  authMode='online';session=null;await Store.set(SESS_KEY,null);closeModal();showAuth('login');
 };
 document.querySelectorAll('[data-dos]').forEach(b=>b.onclick=async()=>{
  st.doseurs.actif=b.dataset.dos==='1';await save();openReglages();
  if(screen==='bil')renderBil()});
}

/* ═════ CONSOMMATION THÉORIQUE (pour les doseurs) ═════ */
function consoTheorique(){
 const c={};
 st.mv.forEach(m=>{const it=item(m.plat);if(!it||!it.f)return;
  for(const [pid,q] of Object.entries(it.f))c[pid]=(c[pid]||0)+qteFicheEnStock(it,pid,q*m.qty)});
 return c;
}

/* ═════ PRÉVISION : RUPTURE OU PÉREMPTION ═════
   Un produit frais ne se termine pas forcément par une rupture :
   s'il en reste plus que sa durée de conservation, il finira à la poubelle.
   On compare donc le nombre de jours de stock à la durée de conservation. */
const HORIZON=30;   /* au-delà, on n'annonce pas de date : ce serait faux */

let _pvCache=null,_pvCle='';
/* Index rapide par produit, recalculé seulement si les données ont changé */
function previsionIndex(){
 const cle=st.mv.length+'|'+st.prods.length+'|'+JSON.stringify(st.stock);
 if(_pvCache&&_pvCle===cle)return _pvCache;
 const pv=prevision();
 const map={};pv.liste.forEach(x=>map[x.id]=x);
 _pvCache={pv,map};_pvCle=cle;
 return _pvCache;
}

function prevision(){
 const jours=new Set(st.mv.map(m=>(m.ts||'').slice(0,10)).filter(Boolean));
 const nbJours=Math.max(1,jours.size);
 const conso={};
 st.mv.forEach(m=>{const it=item(m.plat);if(!it||!it.f)return;
  for(const [pid,q] of Object.entries(it.f))conso[pid]=(conso[pid]||0)+qteFicheEnStock(it,pid,q*m.qty)});
 const liste=[];
 st.prods.forEach(p=>{
  const tot=conso[p.id]||0;
  if(tot<=0)return;
  const parJour=tot/nbJours;
  const stock=st.stock[p.id]??0;
  const jConso=parJour>0?stock/parJour:Infinity;
  const dlc=p.dlc===undefined?0:p.dlc;
  let type='ok', quand=jConso, perte=0, valPerte=0;
  if(stock<=0){type='rupture';quand=0}
  else if(dlc>0&&jConso>dlc){
   /* Il en reste plus que la conservation : une partie sera perdue */
   type='perte';quand=dlc;
   perte=Math.max(0,stock-parJour*dlc);
   valPerte=perte*(p.px||0);
  }else if(jConso<=HORIZON){type='rupture'}
  liste.push({id:p.id,n:p.n,i:p.i,u:p.u,fo:p.fo||'Divers',px:p.px||0,
   stock,parJour,jConso,dlc,type,quand,perte,valPerte,seuil:p.seuil,conso:tot});
 });
 liste.sort((a,b)=>{
  const r={rupture:0,perte:1,ok:2};
  if(r[a.type]!==r[b.type])return r[a.type]-r[b.type];
  return a.quand-b.quand});
 return{nbJours,liste,fiable:nbJours>=2};
}

/* Libellé lisible, borné à un horizon crédible */
function quandRupture(j){
 if(!isFinite(j))return null;
 if(j>HORIZON)return{txt:t('ruptLoin'),urg:0};
 if(j<0.5)return{txt:t('ruptMaintenant'),urg:3};
 if(j<1.5)return{txt:t('ruptAujourdhui'),urg:3};
 if(j<2.5)return{txt:t('ruptDemain'),urg:2};
 if(j<8){
  const d=new Date(Date.now()+j*86400000);
  const JJ=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  return{txt:t('ruptDans').replace('%s',Math.round(j))+
   (st.lang==='fr'?' ('+JJ[d.getDay()]+')':''),urg:1};
 }
 return{txt:t('ruptDans').replace('%s',Math.round(j)),urg:0};
}

/* Étiquette affichée sur une ligne produit */
function badgePrev(x){
 if(x.stock<=0)return{txt:t('ruptDeja'),cls:'rouge'};
 if(x.type==='perte')return{txt:t('perteDans').replace('%s',Math.round(x.dlc)),cls:'ambre'};
 const q=quandRupture(x.quand);
 if(!q)return null;
 return{txt:q.txt,cls:q.urg>=2?'rouge':(q.urg===1?'ambre':'ok')};
}

/* ═════ DÉTECTION D'ANOMALIES ═════ */
function anomalies(){
 const a=[];
 const ventes=st.mv.filter(m=>m.motif==='vente');
 const nv=st.mv.filter(m=>m.motif!=='vente');
 const ca=ventes.reduce((s,m)=>s+pvMv(m),0);
 const matV=ventes.reduce((s,m)=>s+coutMv(m),0);
 const totalNV=nv.reduce((s,m)=>s+coutMv(m),0);

 if(ca>0){
  const r=(matV+totalNV)/ca*100;
  if(r>34)a.push({n:'rouge',t:t('anoRatio').replace('%s',r.toFixed(1).replace('.',',')),
   d:t('anoRatioD').replace('%s',fmt(totalNV))});
 }
 const rupture=st.prods.filter(p=>(st.stock[p.id]??0)<=0);
 const bas=st.prods.filter(p=>{const q=st.stock[p.id]??0;return q>0&&q<=p.seuil});
 if(rupture.length)a.push({n:'rouge',t:t('anoRupture').replace('%s',rupture.length),
  d:rupture.slice(0,4).map(p=>p.n).join(', '),action:'commander'});
 if(bas.length)a.push({n:'ambre',t:t('anoSeuil').replace('%s',bas.length),
  d:bas.slice(0,4).map(p=>p.n).join(', '),action:'commander'});

 /* Ruptures prévues à court terme */
 const pv=previsionIndex().pv;
 const bientot=pv.liste.filter(x=>x.type==='rupture'&&x.stock>0&&x.quand<3);
 if(bientot.length){
  const p1=bientot[0],q=quandRupture(p1.quand);
  a.push({n:q&&q.urg>=2?'rouge':'ambre',
   t:t('anoRupturePrevue').replace('%s',p1.n).replace('%q',q?q.txt.toLowerCase():''),
   d:bientot.length>1?t('anoRupturePrevueD').replace('%s',bientot.length-1)
    +' : '+bientot.slice(1,4).map(x=>x.n).join(', '):
    t('anoRythme').replace('%s',fmtQ(Math.round(p1.parJour*100)/100)).replace('%u',p1.u),action:'commander'});
 }

 /* Produits frais en surstock : ils seront perdus avant d'être consommés */
 const pertes=pv.liste.filter(x=>x.type==='perte');
 if(pertes.length){
  const val=pertes.reduce((s,x)=>s+x.valPerte,0);
  a.push({n:'ambre',t:t('anoPerte').replace('%s',pertes.length).replace('%v',fmt(val)),
  d:pertes.slice(0,3).map(x=>`${x.n} (${t('conservation')} ${Math.round(x.dlc)} j)`).join(', '),action:'surstock'});
 }

 /* Écarts d'inventaire répétés */
 const der={};
 (st.invHist||[]).slice(0,3).forEach(x=>(x.lignes||[]).forEach(l=>{
  if(Math.abs(l.d)>0.001){der[l.id]=der[l.id]||{n:l.n,c:0};der[l.id].c++}}));
 const rep=Object.values(der).filter(x=>x.c>=2);
 if(peutVoirEcartsInventaire()&&rep.length)a.push({n:'ambre',t:t('anoDerive').replace('%s',rep.length),
  d:rep.slice(0,4).map(x=>x.n).join(', ')});

 /* Hausse du prix d'achat */
 const hausse=st.prods.filter(p=>p.pxPrev&&p.px>p.pxPrev*1.05);
 if(hausse.length)a.push({n:'ambre',t:t('anoPrix').replace('%s',hausse.length),
  d:hausse.slice(0,3).map(p=>`${p.n} +${((p.px/p.pxPrev-1)*100).toFixed(0)} %`).join(', ')});

 /* Marges dégradées */
 const marges=st.carte.filter(c=>c.pv>0&&coutMat(c.id,1)/c.pv>0.38);
 if(marges.length)a.push({n:'ambre',t:t('anoMarge').replace('%s',marges.length),
  d:marges.slice(0,3).map(c=>c.n).join(', '),action:'marge'});

 /* Offerts importants */
 const off=nv.filter(m=>['offClient','offPart','offGroupe'].includes(m.motif))
  .reduce((s,m)=>s+coutMv(m),0);
 if(ca>0&&off/ca>0.03)a.push({n:'bleu',t:t('anoOfferts').replace('%s',fmt(off)),
  d:t('anoOffertsD').replace('%s',(off/ca*100).toFixed(1).replace('.',','))});

 /* Écarts doseurs (si activé et relevés saisis) */
 if(peutVoirEcartsInventaire()&&st.doseurs&&st.doseurs.actif){
  const th=consoTheorique();
  Object.entries(st.doseurs.releves||{}).forEach(([pid,v])=>{
   const reel=num(v),theo=th[pid]||0;
   if(reel>0&&theo>0){const ec=(reel-theo)/theo*100;
    if(Math.abs(ec)>10){const p=prod(pid);
     a.push({n:ec>0?'rouge':'bleu',
      t:`${p?p.n:pid} : ${ec>0?'+':''}${ec.toFixed(0)} % ${t('vsTheorique')}`,
      d:`${t('theorique')} ${fmtQ(theo)} ${p?p.u:''} · ${t('reel')} ${fmtQ(reel)} ${p?p.u:''}`})}}
  });
 }
 return a;
}
function ouvrirTraitementAnalyse(action){
 if(action==='commander'){screen='cmd';sq='';}
 else if(action==='surstock'){screen='stock';stockTab='mat';cartePrix=false;sq='';}
 else if(action==='marge'){screen='stock';stockTab='carte';cartePrix=true;prixEdit={};cartCat='tous';sq='';}
 else return;
 go();
}

function mettreAJourMarqueEtablissement(){
 const marque=document.getElementById('topBrand');
 if(!marque)return;
 const nom=String(st&&st.etabNom===undefined?'SP Wallace':(st&&st.etabNom)||'').trim();
 let nomAffiche=marque.querySelector('.top-company');
 if(!nom){if(nomAffiche)nomAffiche.remove();marque.removeAttribute('aria-label');return}
 if(!nomAffiche){
  const logo=marque.querySelector('.logo');
  if(!logo)return;
  nomAffiche=document.createElement('span');
  nomAffiche.className='top-company';
  logo.insertAdjacentElement('afterend',nomAffiche);
 }
 nomAffiche.textContent=nom;
 marque.setAttribute('aria-label','INVO · '+nom);
}
function renderAll(){document.getElementById('langBtn').textContent=t('code');
document.getElementById('whoName').textContent=st.who.split(' ')[0];go()}
async function bootApp(){
 document.body.classList.remove('locked');
 document.getElementById('auth').classList.remove('on');
 await loadAuth();
 if(session&&session.needsWorkspace){showAuth('workspace');return}
 if(session&&session.invitationAccepted){session.invitationAccepted=false;await saveSess();showAuth('new-password',{type:'ok',txt:'Invitation acceptée. Choisissez maintenant votre mot de passe.'});return}
 await load();
 if(session&&auth.users[session.email]){
  const u=auth.users[session.email],poste=POSTES.find(p=>p.id===rolePrincipalUtilisateur(u));
  if(poste){st.whoId=poste.id;st.who=u.nom||poste.n}
 }
 const topBrandTpl=document.getElementById('invoLogo');
 if(topBrandTpl&&!document.getElementById('topBrand')){
   topBrandTpl.insertAdjacentHTML('afterend',`<div class="top-brand" id="topBrand">${topBrandTpl.innerHTML}</div>`);
 }
 mettreAJourMarqueEtablissement();
 seenFeed=st.mv.length;
 Docs.migrer().then(n=>{if(n)console.log('Documents migrés vers IndexedDB :',n)});
 document.getElementById('langBtn').onclick=openLang;
 document.getElementById('whoBtn').onclick=openWho;
 document.getElementById('gearBtn').onclick=()=>{fermerMenu();openReglages()};
 document.getElementById('burgerBtn').onclick=basculerMenu;
 document.getElementById('drBg').onclick=fermerMenu;
 renderAll();programmerRecapMatin();actualiserMeteoAccueil();startFeed();setTimeout(()=>{if(st.live)posEvent();adminSynchronisationAutomatique()},1200);
}

/* INVO · HISTORIQUE D'AUDIT LOCAL · 2026-08-24
   Démonstration locale : la visibilité est contrôlée dans l'interface.
   Une conservation inviolable et un contrôle de rôle serveur exigent un backend. */
let auditJournal=[];
function cleHistoriqueAudit(){return dataKey()+':audit-v1'}
function peutVoirHistoriqueAudit(){
 return !!st&&['admin','gestion','direction'].includes(st.whoId);
}
function roleHistoriqueAudit(){
 if(st&&st.whoId==='admin')return 'Administrateur';
 if(st&&st.whoId==='gestion')return 'Gestion';
 if(st&&st.whoId==='direction')return 'Direction';
 const poste=(POSTES||[]).find(function(p){return p.id===st.whoId});
 return poste?poste.n:(st.who||'Employé');
}
function echapperHistoriqueAudit(v){return escapeHTML(String(v===undefined||v===null||v===''?'—':v))}
function resumeStockHistoriqueAudit(platId){
 const c=item(platId);
 if(!c||!c.f)return 'Aucun ingrédient relié';
 const lignes=Object.entries(c.f).map(function(pair){
  const p=prod(pair[0]),q=st.stock[pair[0]]||0;
  return (p?p.n:pair[0])+' : '+fmtQ(q)+' '+(p?p.u:'');
 });
 return lignes.join(' · ')||'Aucun ingrédient relié';
}
function libelleHistoriqueMotif(motif){
 const lib={vente:'Vente externe enregistrée',envoi:'Sortie enregistrée',annul:'Annulation classée',
  offClient:'Offert client classé',offPart:'Offert partenaire classé',offGroupe:'Offert groupe classé',
  casse:'Perte / casse classée',rate:'Perte / raté classée'};
 return lib[motif]||'Mouvement enregistré';
}
function ajouterHistoriqueAudit(action,element,avant,apres,motif){
 const entry={
  id:'audit_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
  ts:new Date().toISOString(),
  utilisateur:st&&st.who?st.who:'Utilisateur non identifié',
  role:roleHistoriqueAudit(),
  action:action||'Action enregistrée',
  element:element||'—',
  avant:avant===undefined?'—':avant,
  apres:apres===undefined?'—':apres,
  motif:motif||''
 };
 auditJournal.unshift(entry);
 if(auditJournal.length>500)auditJournal.length=500;
 Promise.resolve(Store.set(cleHistoriqueAudit(),auditJournal)).catch(function(){});
 return entry;
}
const chargerDonneesInvoSansHistorique=load;
load=async function(){
 await chargerDonneesInvoSansHistorique();
 const local=await Store.get(cleHistoriqueAudit());
 auditJournal=Array.isArray(local)?local:[];
};
function formatDateHistoriqueAudit(ts){
 const d=new Date(ts);
 return isNaN(d.getTime())?'—':d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})+' · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}
function optionsHistoriqueAudit(values,selected){
 return values.map(function(v){return '<option value="'+echapperHistoriqueAudit(v)+'"'+(v===selected?' selected':'')+'>'+echapperHistoriqueAudit(v)+'</option>'}).join('');
}
function historiqueAuditHTML(){
 const utilisateurs=['',...Array.from(new Set(auditJournal.map(function(x){return x.utilisateur}).filter(Boolean))).sort()];
 const roles=['',...Array.from(new Set(auditJournal.map(function(x){return x.role}).filter(Boolean))).sort()];
 const actions=['',...Array.from(new Set(auditJournal.map(function(x){return x.action}).filter(Boolean))).sort()];
 return '<section class="audit-group">'+
  '<p class="audit-intro"><b>Historique local de démonstration.</b> Il est visible uniquement depuis le profil Gestion / Direction dans cette version. Une conservation inviolable exige un backend.</p>'+
  '<div class="audit-filters">'+
   '<label>Utilisateur<select id="auditUser"><option value="">Tous</option>'+optionsHistoriqueAudit(utilisateurs.slice(1),'')+'</select></label>'+
   '<label>Rôle<select id="auditRole"><option value="">Tous</option>'+optionsHistoriqueAudit(roles.slice(1),'')+'</select></label>'+
   '<label>Action<select id="auditAction"><option value="">Toutes</option>'+optionsHistoriqueAudit(actions.slice(1),'')+'</select></label>'+
   '<label>Période<select id="auditPeriod"><option value="">Toute période</option><option value="day">Aujourd’hui</option><option value="week">7 derniers jours</option><option value="month">30 derniers jours</option></select></label>'+
  '</div><div class="audit-list" id="auditRows"></div></section>';
}
function rendreLignesHistoriqueAudit(){
 const cible=document.getElementById('auditRows');if(!cible)return;
 const utilisateur=document.getElementById('auditUser')?document.getElementById('auditUser').value:'';
 const role=document.getElementById('auditRole')?document.getElementById('auditRole').value:'';
 const action=document.getElementById('auditAction')?document.getElementById('auditAction').value:'';
 const periode=document.getElementById('auditPeriod')?document.getElementById('auditPeriod').value:'';
 const maintenant=Date.now();
 const delai={day:86400000,week:7*86400000,month:30*86400000}[periode]||0;
 const lignes=auditJournal.filter(function(x){
  if(utilisateur&&x.utilisateur!==utilisateur)return false;
  if(role&&x.role!==role)return false;
  if(action&&x.action!==action)return false;
  return !delai||maintenant-new Date(x.ts).getTime()<=delai;
 });
 cible.innerHTML=lignes.length?lignes.map(function(x){
  return '<article class="audit-row"><time>'+echapperHistoriqueAudit(formatDateHistoriqueAudit(x.ts))+'</time><div class="audit-row-main">'+
   '<div class="audit-row-title"><span>'+echapperHistoriqueAudit(x.action)+'</span><span class="audit-role">'+echapperHistoriqueAudit(x.role)+'</span></div>'+
   '<div class="audit-element">'+echapperHistoriqueAudit(x.utilisateur)+' · '+echapperHistoriqueAudit(x.element)+'</div>'+
   '<div class="audit-change"><span>'+echapperHistoriqueAudit(x.avant)+'</span><i>→</i><span>'+echapperHistoriqueAudit(x.apres)+'</span></div>'+
   (x.motif?'<div class="audit-note">Motif / commentaire : '+echapperHistoriqueAudit(x.motif)+'</div>':'')+
  '</div></article>';
 }).join(''):'<div class="audit-empty">Aucune action ne correspond à ces filtres.</div>';
}
function lierHistoriqueAudit(){
 ['auditUser','auditRole','auditAction','auditPeriod'].forEach(function(id){
  const champ=document.getElementById(id);if(champ)champ.onchange=rendreLignesHistoriqueAudit;
 });
 rendreLignesHistoriqueAudit();
}
const ouvrirReglagesSansHistorique=openReglages;
openReglages=function(onglet){
 let voulu=typeof onglet==='string'?onglet:(settingsTab||'general');
 if(voulu==='audit'&&!peutVoirHistoriqueAudit()){voulu='general';toast('Historique réservé à Gestion / Direction.');}
 ouvrirReglagesSansHistorique(voulu==='audit'?'general':voulu);
 synchroniserVisibilitePanierSortie();
 if(!peutVoirHistoriqueAudit())return;
 const nav=document.querySelector('.settings-nav');
 if(nav&&!nav.querySelector('[data-settings="audit"]')){
  nav.insertAdjacentHTML('beforeend','<button data-settings="audit" aria-current="false"><span class="settings-row-icon settings-row-icon--general">◷</span><span>Historique</span></button>');
 }
 const auditBtn=document.querySelector('[data-settings="audit"]');
 if(auditBtn)auditBtn.onclick=function(){openReglages('audit')};
 if(voulu==='audit'){
  settingsTab='audit';
  document.querySelectorAll('[data-settings]').forEach(function(b){const actif=b.dataset.settings==='audit';b.classList.toggle('on',actif);b.setAttribute('aria-current',actif?'page':'false');});
  const contenu=document.querySelector('.settings-content');
  if(contenu){contenu.innerHTML=historiqueAuditHTML();lierHistoriqueAudit();}
 }
};
const creerMouvementSansHistorique=creerMouvement;
creerMouvement=function(m,options){
 const avant=resumeStockHistoriqueAudit(m.plat);
 const resultat=creerMouvementSansHistorique.call(this,m,options);
 if(resultat&&resultat.ok&&m.src!=='demo'){
  const note=m.parent?'Transaction liée : '+m.parent:(m.table&&m.table!=='—'?'Référence : '+m.table:'');
  ajouterHistoriqueAudit(libelleHistoriqueMotif(m.motif),resultat.mv.platN,avant,resumeStockHistoriqueAudit(m.plat),note);
 }
 return resultat;
};
const validerInventaireSansHistorique=validerInv;
validerInv=async function(){
 const avant=(st.invHist||[]).length;
 await validerInventaireSansHistorique.apply(this,arguments);
 const dernier=(st.invHist||[])[0];
 if(dernier&&(st.invHist||[]).length>avant){
  ajouterHistoriqueAudit('Inventaire validé',dernier.nb+' ligne(s) comptée(s)','Écarts avant validation : '+dernier.nbEcart,'Valeur d’écart : '+fmt(dernier.valEcart)+' €','Validation humaine de l’inventaire');
 }
};
const preparerCommandeSansHistorique=preparerCommande;
preparerCommande=async function(){
 const avant=(st.commandes||[]).map(function(x){return x.id}).join('|');
 await preparerCommandeSansHistorique.apply(this,arguments);
 const commande=(st.commandes||[])[0];
 if(commande&&avant.indexOf(commande.id)===-1){
  ajouterHistoriqueAudit('Commande préparée',commande.fournisseur,'Stock inchangé',commande.lines.length+' ligne(s) en attente de réception','Livraison prévue : '+commande.dateLiv);
 }
};
const saveLivSansHistorique=saveLiv;
saveLiv=async function(){
 const avant=(st.liv||[])[0]&&String((st.liv||[])[0].id);
 await saveLivSansHistorique.apply(this,arguments);
 const livraison=(st.liv||[])[0];
 if(livraison&&String(livraison.id)!==avant){
  const controle=livraison.controle||{},ecarts=(controle.manquants||[]).length+(controle.hausses||[]).length+(controle.inattendus||[]).length;
  ajouterHistoriqueAudit('Livraison validée',livraison.fo,'Stock avant réception',livraison.lines.length+' ligne(s) ajoutée(s)',ecarts?ecarts+' écart(s) contrôlé(s) avant validation humaine':'Réception humaine validée sans écart détecté');
 }
};
const signalerEcartsReceptionSansHistorique=signalerEcartsReception;
signalerEcartsReception=function(){
 const resultat=signalerEcartsReceptionSansHistorique.apply(this,arguments);
 if(resultat){
  const element=livForm&&livForm.fo?livForm.fo:'Fournisseur';
  const suite=resultat==='mail'?'E-mail prérempli, envoi à confirmer par l’utilisateur':'Texte copié, aucun envoi automatique';
  ajouterHistoriqueAudit('Écart de réception signalé',element,'Écart détecté avant validation',suite,'Aucune donnée n’est envoyée sans action humaine');
 }
 return resultat;
};
const saveMatSansHistorique=saveMat;
saveMat=async function(){
 const ancien=fm&&fm.id?prod(fm.id):null;
 const avant=ancien?ancien.n+' · stock '+fmtQ(st.stock[ancien.id]||0)+' '+ancien.u:'Matière inexistante';
 const nom= fm&&fm.n?fm.n.trim():'Matière';
 await saveMatSansHistorique.apply(this,arguments);
 const trouve=(st.prods||[]).find(function(p){return p.n===nom});
 if(trouve)ajouterHistoriqueAudit(ancien?'Matière modifiée':'Matière ajoutée',trouve.n,avant,'Stock '+fmtQ(st.stock[trouve.id]||0)+' '+trouve.u,'Catalogue stock');
};
const saveCarteSansHistorique=saveCarte;
saveCarte=async function(){
 const ancien=fm&&fm.id?(st.carte||[]).find(function(x){return x.id===fm.id}):null;
 const nom=fm&&fm.n?fm.n.trim():'Produit';
 await saveCarteSansHistorique.apply(this,arguments);
 const trouve=(st.carte||[]).find(function(x){return x.n===nom});
 if(trouve)ajouterHistoriqueAudit(ancien?'Produit carte modifié':'Produit carte ajouté',trouve.n,ancien?ancien.n:'Produit absent',trouve.n,'Fiche technique');
};
const signalerManquantSansHistorique=signalerProduitManquant;
signalerProduitManquant=function(){
 const resultat=signalerManquantSansHistorique.apply(this,arguments);
 if(resultat)ajouterHistoriqueAudit('Produit manquant signalé',commandeFo||'Fournisseur','Signalement préparé dans INVO',resultat==='mail'?'E-mail prérempli, envoi à confirmer':'Texte copié faute d’e-mail fournisseur','Aucune donnée n’est envoyée automatiquement');
 return resultat;
};
function ouvrirTraitementVente(mvId){
 const cible=(st.mv||[]).find(function(x){return String(x.id)===String(mvId)});
 if(!cible){toast('Cette vente n’est plus disponible.');return;}
 screen='caisse';go();
 requestAnimationFrame(function(){openQualification(mvId);});
}

/* Marque affichée : les clés locales historiques restent volontairement inchangées
   afin de conserver les comptes et données déjà enregistrés sur cet appareil. */
const SWAY_MARQUE={nom:'Sway',logo:'assets/sway-logo-source-black.png'};
function texteSway(texte){return String(texte||'').replace(/\bINVO\b/g,'SWAY').replace(/\bInvo\b/g,'Sway').replace(/\binvo\b/g,'Sway');}
function appliquerMarqueSway(racine){
 const scope=racine||document;
 const template=document.getElementById('invoLogo');
 if(template&&template.content){const image=template.content.querySelector('.logo-img');if(image){image.src=SWAY_MARQUE.logo;image.alt='Logo Sway';image.decoding='async';}}
 if(scope.querySelectorAll){scope.querySelectorAll('.logo-img').forEach(function(image){image.src=SWAY_MARQUE.logo;image.alt='Logo Sway';image.decoding='async';});}
 const cible=scope.nodeType===1?scope:document.body;
 if(!cible)return;
 const filtre={acceptNode:function(noeud){return noeud.parentElement&&noeud.parentElement.closest('script,style,template')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}};
 const textes=document.createTreeWalker(cible,NodeFilter.SHOW_TEXT,filtre);
 let noeud;
 while((noeud=textes.nextNode())){const suivant=texteSway(noeud.nodeValue);if(suivant!==noeud.nodeValue)noeud.nodeValue=suivant;}
 if(scope.querySelectorAll){scope.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(function(element){['title','aria-label','placeholder','alt'].forEach(function(attribut){if(element.hasAttribute(attribut)){const actuel=element.getAttribute(attribut),suivant=texteSway(actuel);if(suivant!==actuel)element.setAttribute(attribut,suivant);}});});}
}
function observerMarqueSway(){
 const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=texteSway(meta.content);document.title=texteSway(document.title);
 appliquerMarqueSway(document);
 new MutationObserver(function(mutations){mutations.forEach(function(mutation){
  if(mutation.type==='characterData'){if(!mutation.target.parentElement||!mutation.target.parentElement.closest('script,style,template')){const suivant=texteSway(mutation.target.nodeValue);if(suivant!==mutation.target.nodeValue)mutation.target.nodeValue=suivant;}}
  else if(mutation.type==='childList'){mutation.addedNodes.forEach(function(noeud){if(noeud.nodeType===3){if(!noeud.parentElement||!noeud.parentElement.closest('script,style,template')){const suivant=texteSway(noeud.nodeValue);if(suivant!==noeud.nodeValue)noeud.nodeValue=suivant;}}else if(noeud.nodeType===1&&!noeud.closest('script,style,template'))appliquerMarqueSway(noeud);});}
 });}).observe(document.body,{childList:true,subtree:true,characterData:true});
}

/* Connexion désactivée pour la phase de test.
   Le code des comptes reste présent (creerCompte, connecter, showAuth…)
   et pourra être réactivé en remplaçant l'appel ci-dessous. */
observerMarqueSway();
(async()=>{await bootApp();appliquerMarqueSway(document)})();
