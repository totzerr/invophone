/* ═════ RÉGLAGES · COMPTE · MATÉRIEL CONNECTÉ ═════ */
const roleEstAutorise=id=>id==='admin';
let equipeEnLigne={etat:'idle',membres:[],invitations:[],erreur:''};
const rolesServeurVersApp=roles=>(Array.isArray(roles)?roles:[]).map(role=>role==='administrateur'?'admin':role).filter(role=>POSTES.some(p=>p.id===role));
const rolesAppVersServeur=roles=>roles.map(role=>role==='admin'?'administrateur':role);
function libellesRolesSway(roles){return rolesServeurVersApp(roles).map(id=>{const poste=POSTES.find(p=>p.id===id);return poste?poste.n:id}).join(' · ')||'Sans rôle';}
async function chargerEquipeEnLigne(){
 if(!(session&&session.supabase&&session.etabId)||!peutGererRoles()||equipeEnLigne.etat==='loading'||equipeEnLigne.etat==='ready')return;
 equipeEnLigne.etat='loading';equipeEnLigne.erreur='';
 try{
  const resultat=await window.SwaySupabaseAuth.workspaceMembers('list',{establishmentId:session.etabId});
  if(resultat.error)throw new Error(resultat.error);
  equipeEnLigne={etat:'ready',membres:Array.isArray(resultat.members)?resultat.members:[],invitations:Array.isArray(resultat.invitations)?resultat.invitations:[],erreur:''};
 }catch(error){equipeEnLigne={etat:'error',membres:[],invitations:[],erreur:String(error&&error.message||'Impossible de charger l’équipe.')};}
 if(document.querySelector('.settings-users-group'))openReglages('users');
}
function utilisateursEtablissement(){
 const tous=Object.values(auth.users||{}),etabId=session&&session.etabId;
 return tous.filter(u=>!etabId||!u.etabId||u.etabId===etabId).sort((a,b)=>(a.nom||a.mail).localeCompare(b.nom||b.mail,'fr'));
}
function dateUtilisateur(ts){return ts?new Date(ts).toLocaleDateString('fr-FR'):'—'}
function dessinerUtilisateurs(){
 if(session&&session.supabase){
  if(!peutGererRoles())return '<div class="auth-msg info">La gestion des rôles et des invitations est réservée à l’administrateur.</div>';
  if(equipeEnLigne.etat==='loading'||equipeEnLigne.etat==='idle')return '<button class="btn" id="addUser" style="margin-bottom:12px">+ Inviter un employé</button><div class="auth-msg info">Chargement sécurisé de l’équipe…</div>';
  if(equipeEnLigne.etat==='error')return '<button class="btn" id="addUser" style="margin-bottom:12px">+ Inviter un employé</button><div class="auth-msg err">'+escapeHTML(equipeEnLigne.erreur)+'</div>';
  const membres=equipeEnLigne.membres.map(membre=>{
   const estMoi=session&&session.userId===membre.userId,roles=libellesRolesSway(membre.roles),nom=String(membre.name||membre.email||'Membre');
   return '<div class="user-card"><div><div class="user-name">'+escapeHTML(nom)+(estMoi?' · vous':'')+'</div><div class="user-mail">'+escapeHTML(membre.email||'')+'</div><div class="user-meta"><span class="user-status">Actif</span><span class="user-date">Ajouté le '+dateUtilisateur(membre.createdAt)+'</span></div></div><div class="user-actions"><button class="user-role" data-online-user-roles="'+escapeHTML(membre.id)+'" aria-label="Rôles de '+escapeHTML(nom)+'">'+escapeHTML(roles)+' ›</button>'+(estMoi?'':'<button class="user-remove" data-online-user-remove="'+escapeHTML(membre.id)+'" title="Retirer" aria-label="Retirer '+escapeHTML(nom)+'">×</button>')+'</div></div>';
  }).join('');
  const invitations=equipeEnLigne.invitations.map(invitation=>'<div class="user-card"><div><div class="user-name">Invitation en attente</div><div class="user-mail">'+escapeHTML(invitation.invited_email||'')+'</div><div class="user-meta"><span class="user-status invite">Invitation</span><span class="user-date">Expire le '+dateUtilisateur(invitation.expires_at)+'</span></div></div><div class="user-actions"><span class="pill-etat off">'+escapeHTML(libellesRolesSway(invitation.roles))+'</span></div></div>').join('');
  return '<button class="btn" id="addUser" style="margin-bottom:12px">+ Inviter un employé</button><div class="user-list">'+(membres||'<div class="zone-empty">Aucun membre actif pour cet établissement.</div>')+invitations+'</div><div class="auth-msg info"><b>Équipe Sway sécurisée.</b><br>Les rôles, invitations et retraits sont enregistrés côté serveur. Les employés ne peuvent pas les modifier.</div>';
 }
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
function ouvrirRolesMembreEnLigne(memberId){
 const membre=equipeEnLigne.membres.find(m=>m.id===memberId);if(!membre||!peutGererRoles())return;
 const roles=rolesServeurVersApp(membre.roles),nom=String(membre.name||membre.email||'Membre');
 document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgRoles"><div class="sheet"><h3>Rôles de ${escapeHTML(nom)}</h3><p class="sh-sub">Un utilisateur peut cumuler plusieurs rôles. Les accès sont mis à jour dans son espace Sway.</p><div class="role-checks">${POSTES.map(p=>`<label><input type="checkbox" value="${p.id}" data-role-check ${roles.includes(p.id)?'checked':''}> <span>${p.i}</span> ${p.n}</label>`).join('')}</div><div class="auth-msg err" id="rolesErr" style="display:none"></div><div class="sh-actions"><button class="btn btn-2 btn-sm" id="rolesCancel">Annuler</button><button class="btn" id="rolesSave">Enregistrer</button></div></div></div>`;
 document.getElementById('bgRoles').onclick=e=>{if(e.target.id==='bgRoles')openReglages('users')};document.getElementById('rolesCancel').onclick=()=>openReglages('users');document.getElementById('rolesSave').onclick=async()=>{const roles=rolesValides([...document.querySelectorAll('[data-role-check]:checked')].map(x=>x.value)),err=document.getElementById('rolesErr');if(!roles.length){err.textContent='Sélectionnez au moins un rôle.';err.style.display='block';return}const save=document.getElementById('rolesSave');save.disabled=true;const resultat=await window.SwaySupabaseAuth.workspaceMembers('update_roles',{establishmentId:session.etabId,memberId:memberId,roles:rolesAppVersServeur(roles)});if(resultat.error){save.disabled=false;err.textContent=resultat.error;err.style.display='block';return}equipeEnLigne.etat='idle';toast('Rôles mis à jour.');openReglages('users');};
}
async function retirerMembreEnLigne(memberId){
 const membre=equipeEnLigne.membres.find(m=>m.id===memberId);if(!membre||!peutGererRoles()||!confirm(`Retirer ${membre.name||membre.email||'ce membre'} de cet établissement ?`))return;
 const resultat=await window.SwaySupabaseAuth.workspaceMembers('remove',{establishmentId:session.etabId,memberId:memberId});
 if(resultat.error){toast(resultat.error);return}equipeEnLigne.etat='idle';toast('Accès retiré.');openReglages('users');
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
   document.getElementById('uDone').onclick=()=>{equipeEnLigne.etat='idle';toast('Invitation envoyée.');openReglages('users')};
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
 const recapMatin=preferencesRecapMatin();
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
   <div class="settings-group-title">${settingsIcon('pilot')}<span>Démo caisse</span></div>
   <div class="settings-card">
    <div class="settings-status-row">
     <span class="settings-field-label">${settingsIcon('pilot')}<span><b>${st.demoParcours?'Démo caisse en cours':'Démo caisse'}</b><small>${st.demoParcours?'Les ventes sont simulées. Rien n’est envoyé à une caisse réelle.':'Simule les ventes reçues depuis une caisse. Rien n’est envoyé à une caisse réelle.'}</small></span></span>
     <span class="pill-etat ${st.demoParcours?'on':'off'}">${st.demoParcours?'Active':'Arrêtée'}</span>
    </div>
    <div class="settings-action-grid">
     ${st.demoParcours?`<button class="settings-action-button" id="pilotAutoStop">${settingsIcon('general')}<span>Arrêter la démo caisse</span></button>`:`<button class="settings-action-button" id="pilotAutoStart">${settingsIcon('pilot')}<span>Lancer la démo caisse</span></button>`}
    </div>
   </div>
  </section>
  <section class="settings-group">
   <div class="settings-group-title">${settingsIcon('backup')}<span>${t('sauvegarde')}</span></div>
   <div class="settings-card">
    <div class="settings-mini-action"><span>${settingsIcon('backup')}<span><b>${t('exportSauvegarde')}</b><small>${t('sauvegardeS')}</small></span></span><button class="settings-text-button" id="bkExport">Exporter${settingsIcon('arrow')}</button></div>
    <div class="settings-mini-action"><span>${settingsIcon('backup')}<span><b>${t('importSauvegarde')}</b><small>${t('importAide')}</small></span></span><button class="settings-text-button" id="bkImportBtn">Importer${settingsIcon('arrow')}</button><input id="bkImport" type="file" accept=".json,application/json" style="display:none"></div>
    ${session&&session.supabase&&peutGererRoles()?`<div class="settings-mini-action"><span>${settingsIcon('data')}<span><b>Préparer le catalogue Supabase</b><small>${(st.prods||[]).length} produits détectés. Aucun stock n’est modifié : vous confirmez avant l’envoi.</small></span></span><button class="settings-text-button" id="catalogueSwayImport">Prévisualiser${settingsIcon('arrow')}</button></div>`:''}
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
 const catalogueSwayImport=document.getElementById('catalogueSwayImport');if(catalogueSwayImport)catalogueSwayImport.onclick=async()=>{const produits=st.prods||[],resume=produits.slice(0,6).map(p=>p.n||p.name).filter(Boolean).join(', ');if(!confirm(`Importer ${produits.length} produits dans Supabase ?\n\nAucun stock ne sera modifié. Aperçu : ${resume}${produits.length>6?'…':''}`))return;catalogueSwayImport.disabled=true;const resultat=await window.SwaySupabaseAuth.importProductCatalogue(session.etabId,session.userId,produits);catalogueSwayImport.disabled=false;toast(resultat.error||`${resultat.count} produits préparés dans Supabase.`)};
 const transferSource=document.getElementById('transferSource');if(transferSource)transferSource.onclick=()=>toast('Cette connexion nécessite l’API de l’ancien logiciel ou un connecteur partenaire.');
 document.querySelectorAll('[data-transfer-review]').forEach(b=>b.onclick=()=>ouvrirRevueTransfert(b.dataset.transferReview));
 const addUser=document.getElementById('addUser');if(addUser)addUser.onclick=openAjouterUtilisateur;
 document.querySelectorAll('[data-user-roles]').forEach(b=>b.onclick=()=>ouvrirRolesUtilisateur(b.dataset.userRoles));
 document.querySelectorAll('[data-user-remove]').forEach(b=>b.onclick=()=>retirerUtilisateur(b.dataset.userRemove));
 document.querySelectorAll('[data-online-user-roles]').forEach(b=>b.onclick=()=>ouvrirRolesMembreEnLigne(b.dataset.onlineUserRoles));
 document.querySelectorAll('[data-online-user-remove]').forEach(b=>b.onclick=()=>retirerMembreEnLigne(b.dataset.onlineUserRemove));
 if(settingsTab==='users'&&session&&session.supabase&&peutGererRoles())chargerEquipeEnLigne();
 const bkOut=document.getElementById('bkExport'),bkBtn=document.getElementById('bkImportBtn'),bkIn=document.getElementById('bkImport');
 if(bkOut)bkOut.onclick=async()=>{bkOut.disabled=true;try{await exporterSauvegarde();toast(t('backupOk'))}catch(e){toast(t('backupRead'))}bkOut.disabled=false};
 if(bkBtn&&bkIn)bkBtn.onclick=()=>bkIn.click();
 const pilotAutoBtn=document.getElementById('pilotAutoStart');
 if(pilotAutoBtn)pilotAutoBtn.onclick=async()=>{pilotAutoBtn.disabled=true;await chargerParcoursDemonstration(true);};
 const pilotAutoStop=document.getElementById('pilotAutoStop');
 if(pilotAutoStop)pilotAutoStop.onclick=async()=>{pilotAutoStop.disabled=true;await arreterDemoCaisse();};
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

