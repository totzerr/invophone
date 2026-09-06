/* ═════════════════════════════════════════════
   COMPTES & ÉTABLISSEMENTS
   Les données de chaque établissement sont
   stockées sous une clé distincte : invo_data_<etabId>
   ═════════════════════════════════════════════ */
const AUTH_KEY='invo_auth_v1', SESS_KEY='invo_sess_v1';
let auth={users:{}}, session=null, authVue='login', authMsg=null, authCode=null;
let authMode='online';

const dataKey=()=>session&&session.supabase&&session.etabId?'sway_data_'+session.etabId:'invo_v5';
const peutSynchroniserEspace=()=>{const u=utilisateurConnecte(),roles=rolesUtilisateur(u);return !!(session&&session.supabase&&session.etabId&&session.userId&&roles.some(r=>['admin','gestion','direction'].includes(r)));};
let syncEspaceTimer=null,syncEspaceEnCours=false;
async function synchroniserEspaceSway(){
 if(!peutSynchroniserEspace()||syncEspaceEnCours||!window.SwaySupabaseAuth)return;
 syncEspaceEnCours=true;
 try{const copie=JSON.parse(JSON.stringify(st));delete copie.cloudUpdatedAt;const resultat=await window.SwaySupabaseAuth.saveWorkspaceState(session.etabId,copie,session.userId);if(resultat.error)console.warn('Synchronisation Sway différée :',resultat.error)}catch(error){console.warn('Synchronisation Sway différée :',error)}finally{syncEspaceEnCours=false}
}
function programmerSynchronisationSway(){if(!peutSynchroniserEspace())return;clearTimeout(syncEspaceTimer);syncEspaceTimer=setTimeout(synchroniserEspaceSway,900)}
function demarrerSynchronisationDirecteSway(){
 if(!peutSynchroniserEspace()||!window.SwaySupabaseAuth||!window.SwaySupabaseAuth.watchWorkspaceState)return;
 window.SwaySupabaseAuth.watchWorkspaceState(session.etabId,payload=>{const distant=payload&&payload.new;if(!distant||distant.updated_by===session.userId||!distant.state||typeof distant.state!=='object')return;st=Object.assign(st,distant.state,{cloudUpdatedAt:distant.updated_at||''});Store.set(dataKey(),st);if(typeof renderAll==='function')renderAll();if(typeof toast==='function')toast('Mise à jour reçue de l’équipe.');});
}
const loadAuth=async()=>{
 auth=(await Store.get(AUTH_KEY))||{users:{}};session=await Store.get(SESS_KEY);
 if(!auth.users||typeof auth.users!=='object')auth.users={};
 const service=window.SwaySupabaseAuth;
 if(service&&service.available&&service.available()){
  authMode='online';
  try{
   const remote=await service.identity();
   if(remote){
    const cached=auth.users[remote.email]||{};
    remote.profilMetier=PROFILS_METIER_IDS.includes(cached.profilMetier)?cached.profilMetier:'';
    remote.recapMatin=cached.recapMatin&&typeof cached.recapMatin==='object'?cached.recapMatin:{actif:true,heure:'08:00'};
    auth={users:{[remote.email]:Object.assign({},cached,remote)}};
    await Store.set(AUTH_KEY,auth);
    session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,invitationAccepted:!!remote.invitationAccepted,userId:remote.userId};
    return;
   }
  }catch(error){console.warn('Session Sway indisponible :',error)}
 }else authMode='local';
 let changed=false;
 Object.values(auth.users).forEach(u=>{
 const roles=rolesUtilisateur(u);if(!Array.isArray(u.roles)||u.roles.join('|')!==roles.join('|')){u.roles=roles;changed=true}
 if(!u.role||!roles.includes(u.role)){u.role=roles[0]||'gestion';changed=true}
 if(u.profilMetier&&!PROFILS_METIER_IDS.includes(u.profilMetier)){u.profilMetier='';changed=true}
  if(!u.recapMatin||typeof u.recapMatin!=='object'){u.recapMatin={actif:true,heure:'08:00'};changed=true}
 if(!u.statut){u.statut=u.hash?'actif':'invite';changed=true}
  if(!u.cree){u.cree=Date.now();changed=true}
 });
 const utilisateurs=Object.values(auth.users);if(utilisateurs.length&&!utilisateurs.some(estAdministrateurUtilisateur)){
  const candidat=(session&&session.email&&auth.users[session.email])||utilisateurs.slice().sort((a,b)=>Number(a.cree||0)-Number(b.cree||0))[0];
  candidat.roles=[...new Set(['admin',...rolesUtilisateur(candidat)])];candidat.role='admin';changed=true;
 }
 if(changed)await saveAuth();
};
const saveAuth=()=>Store.set(AUTH_KEY,auth);
const saveSess=()=>Store.set(SESS_KEY,session);
const normMail=e=>(e||'').trim().toLowerCase();
const rnd=n=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';
for(let i=0;i<n;i++)s+=A[Math.floor(Math.random()*A.length)];return s};

/* Hachage du mot de passe.
   PBKDF2 via Web Crypto quand le contexte est sécurisé (https).
   Repli simple sinon (ouverture en fichier local) — signalé à l'utilisateur. */
let hashFaible=false;
async function hashPwd(pwd,salt){
 try{
  if(window.crypto&&crypto.subtle&&window.isSecureContext){
   const enc=new TextEncoder();
   const k=await crypto.subtle.importKey('raw',enc.encode(pwd),'PBKDF2',false,['deriveBits']);
   const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:120000,hash:'SHA-256'},k,256);
   return 'pbkdf2:'+btoa(String.fromCharCode.apply(null,new Uint8Array(b)));
  }
 }catch(e){}
 hashFaible=true;
 let x=0;const s=pwd+'|'+salt;
 for(let i=0;i<s.length;i++){x=((x<<5)-x)+s.charCodeAt(i);x|=0}
 return 'simple:'+Math.abs(x).toString(36);
}

function stVierge(){return{lang:st?st.lang:'fr',who:'Responsable de salle',whoId:'salle',profilMetier:st&&PROFILS_METIER_IDS.includes(st.profilMetier)?st.profilMetier:'',
stock:{},mv:[],count:{},live:false,modeCaisse:'manuel',modePilote:false,lastSync:Date.now(),svc:'soir',prods:null,carte:null,
liv:[],invHist:[],inventory:null,photos:{},fournisseurs:[],commandes:[],legacyTransfers:[],doseurs:{actif:false,releves:{}},administration:administrationVierge()}}

/* ── Création de compte ── */
async function creerCompte(nom,mail,etab,pwd,pwd2){
 mail=normMail(mail);
 if(!nom.trim()||!mail||!etab.trim()||!pwd)return{e:t('aChamps')};
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return{e:t('aMailInvalide')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 if(auth.users[mail])return{e:t('aDejaPris')};
 const salt=rnd(16), code=rnd(4)+'-'+rnd(4), etabId=uid('etab');
 auth.users[mail]={mail,nom:nom.trim(),etabId,etabNom:etab.trim(),profilMetier:'',recapMatin:{actif:true,heure:'08:00'},
  salt,hash:await hashPwd(pwd,salt),codeHash:await hashPwd(code,salt),cree:Date.now(),role:'admin',roles:['admin','gestion'],statut:'actif'};
 await saveAuth();
 session={email:mail,etabId};await saveSess();
 /* Reprise éventuelle des données de la version précédente (sans compte) */
 const ancien=await Store.get('invo_v5');
 if(ancien&&!(await Store.get(dataKey())))await Store.set(dataKey(),ancien);
 return{ok:true,code};
}

/* ── Connexion ── */
async function connecter(mail,pwd){
 mail=normMail(mail);
 const u=auth.users[mail];
 if(!u)return{e:t('aIntrouvable')};
 if(await hashPwd(pwd,u.salt)!==u.hash)return{e:t('aMauvaisPwd')};
 u.derniereActivite=Date.now();u.statut='actif';await saveAuth();
 session={email:mail,etabId:u.etabId};await saveSess();
 return{ok:true};
}

async function connecterEnLigne(mail,pwd){
 try{
  const service=window.SwaySupabaseAuth;
  const result=await service.signin({email:normMail(mail),password:pwd});
  if(result.error)return{e:result.error};
  const remote=await service.identity();
  if(!remote)return{e:'Connexion confirmée, mais la session n’est pas encore disponible. Réessayez dans quelques secondes.'};
  auth={users:{[remote.email]:remote}};
  session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,invitationAccepted:!!remote.invitationAccepted,userId:remote.userId};
  return remote.needsWorkspace?{workspace:true}:{ok:true};
 }catch(error){return{e:'La connexion est validée, mais Sway ne peut pas encore préparer votre espace. '+String(error&&error.message||'Réessayez ou contactez-nous si le problème persiste.')}}
}

async function creerCompteEnLigne(nom,mail,etab,pwd,pwd2){
 mail=normMail(mail);
 if(!nom.trim()||!mail||!etab.trim()||!pwd)return{e:t('aChamps')};
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail))return{e:t('aMailInvalide')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 const result=await window.SwaySupabaseAuth.signup({fullName:nom.trim(),email:mail,organizationName:etab.trim(),establishmentName:etab.trim(),password:pwd});
 if(result.error)return{e:result.error};
 if(result.confirmation)return{confirmation:true};
 const remote=await window.SwaySupabaseAuth.identity();
 if(remote){auth={users:{[remote.email]:remote}};session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:remote.needsWorkspace,invitationAccepted:!!remote.invitationAccepted,userId:remote.userId};}
 return remote&&remote.needsWorkspace?{workspace:true}:{ok:true};
}

async function envoyerLienReinitialisation(mail){
 mail=normMail(mail);
 if(!mail)return{e:t('aMailInvalide')};
 const result=await window.SwaySupabaseAuth.reset(mail);
 return result.error?{e:result.error}:{ok:true};
}

async function definirNouveauMotDePasse(pwd,pwd2){
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 const result=await window.SwaySupabaseAuth.updatePassword(pwd);
 return result.error?{e:result.error}:{ok:true};
}

async function creerEspaceEnLigne(nom,etab){
 if(!nom.trim()||!etab.trim())return{e:t('aChamps')};
 try{
  const result=await window.SwaySupabaseAuth.finalizeWorkspace({fullName:nom.trim(),organizationName:etab.trim(),establishmentName:etab.trim()});
  if(result.error)return{e:result.error};
  const remote=await window.SwaySupabaseAuth.identity();
  if(!remote||remote.needsWorkspace)return{e:'Votre espace n’a pas encore été créé. Réessayez.'};
  auth={users:{[remote.email]:remote}};
  session={email:remote.email,etabId:remote.etabId,supabase:true,needsWorkspace:false,userId:remote.userId};
  return{ok:true};
 }catch(error){return{e:'Impossible de créer l’espace pour le moment. '+String(error&&error.message||'Réessayez.')}}
}

/* ── Réinitialisation par code de secours ── */
async function reinit(mail,code,pwd,pwd2){
 mail=normMail(mail);
 const u=auth.users[mail];
 if(!u)return{e:t('aIntrouvable')};
 if(await hashPwd((code||'').trim().toUpperCase(),u.salt)!==u.codeHash)return{e:t('aCodeFaux')};
 if(pwd.length<8)return{e:t('aPwdCourt')};
 if(pwd!==pwd2)return{e:t('aPwdDiff')};
 u.hash=await hashPwd(pwd,u.salt);await saveAuth();
 return{ok:true};
}

async function deconnecter(){
 if(timer)clearInterval(timer);
 if(session&&session.supabase&&window.SwaySupabaseAuth)await window.SwaySupabaseAuth.signout();
 session=null;await Store.set(SESS_KEY,null);
 st=stVierge();panier={};panierMotifs={};motif=null;motifsSelectionnes=[];screen='dash';
 closeModal();showAuth('login');
}

/* ── Écran de connexion ── */
function showAuth(vue,msg){
 authVue=vue;authMsg=msg||null;
 document.body.classList.add('locked');
 document.getElementById('auth').classList.add('on');
 dessineAuth();
}

function dessineAuth(){
 if(authVue==='login'&&window.SwaySupabaseAuth&&window.SwaySupabaseAuth.isRecovery&&window.SwaySupabaseAuth.isRecovery())authVue='new-password';
 const logo=document.querySelector('.logo-img')?.outerHTML||'';
 const compte=session&&session.email&&auth.users?auth.users[session.email]:null;
 const etablissement=String((compte&&compte.etabNom)||st.etabNom||'Votre établissement').trim()||'Votre établissement';
 const accueil=authVue==='login'?`<div class="auth-welcome"><span>Bienvenue</span><b>${escapeHTML(etablissement)}</b></div>`:'';
 const msg=authMsg?`<div class="auth-msg ${authMsg.type}">${authMsg.txt}</div>`:'';
 let corps='';
 if(authVue==='login'){
  corps=`<div class="auth-h">${t('aConnexion')}</div>
  <div class="auth-s">${t('aConnexionS')}</div>${msg}
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" autocomplete="username" placeholder="thomas@restaurant.fr"></div>
  <div class="fld"><label>${t('aPwd')}</label><input id="aP" type="password" autocomplete="current-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">${t('aSeConnecter')}</button>
  <button class="auth-link" id="aOubli">${t('aOubli')}</button>
  <div class="auth-sep">${t('aOu')}</div>
  <button class="btn btn-2" id="aVersCreer">${t('aCreerCompte')}</button>${authMode==='online'?'<p class="auth-note">Connexion sécurisée par Sway. Votre mot de passe n’est jamais stocké dans l’application.</p>':'<button class="auth-link" id="aVersOnline">Utiliser la connexion Sway sécurisée</button>'}`;
 }else if(authVue==='signup'){
  corps=`<div class="auth-h">${t('aCreerCompte')}</div>
  <div class="auth-s">${t('aCreerS')}</div>${msg}
  <div class="fld"><label>${t('aNom')}</label><input id="aN" placeholder="Thomas Martin"></div>
  <div class="fld"><label>${t('aEtab')}</label><input id="aE" placeholder="SP Wallace"></div>
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" autocomplete="username" placeholder="thomas@restaurant.fr"></div>
  <div class="fld"><label>${t('aPwd')}</label><input id="aP" type="password" autocomplete="new-password" placeholder="8 caractères minimum"></div>
  <div class="fld"><label>${t('aPwd2')}</label><input id="aP2" type="password" autocomplete="new-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">${t('aCreer')}</button>
  <button class="auth-link" id="aVersLogin">${t('aDejaCompte')}</button>`;
 }else if(authVue==='workspace'){
  corps=`<div class="auth-h">Créez votre espace</div>
  <div class="auth-s">Votre adresse e-mail est confirmée. Donnez un nom à votre premier établissement.</div>${msg}
  <div class="fld"><label>${t('aNom')}</label><input id="aN" autocomplete="name" placeholder="Thomas Martin"></div>
  <div class="fld"><label>${t('aEtab')}</label><input id="aE" placeholder="Le Wallace Paris"></div>
  <button class="btn" id="aGo">Créer mon espace</button>`;
 }else if(authVue==='new-password'){
  corps=`<div class="auth-h">Nouveau mot de passe</div>
  <div class="auth-s">Choisissez un nouveau mot de passe sécurisé.</div>${msg}
  <div class="fld"><label>${t('aNouveauPwd')}</label><input id="aP" type="password" autocomplete="new-password" placeholder="8 caractères minimum"></div>
  <div class="fld"><label>${t('aPwd2')}</label><input id="aP2" type="password" autocomplete="new-password" placeholder="••••••••"></div>
  <button class="btn" id="aGo">Enregistrer le mot de passe</button>`;
 }else if(authVue==='code'){
  corps=`<div class="auth-h">${t('aCodeTitre')}</div>
  <div class="auth-s">${t('aCodeS')}</div>
  <div class="code-box"><div class="code-val">${authCode}</div>
  <div class="code-lab">${t('aCodeNote')}</div></div>
  <button class="btn" id="aEntrer">${t('aEntrer')}</button>`;
 }else{
  corps=`<div class="auth-h">${t('aOubliTitre')}</div>
  <div class="auth-s">${t('aOubliS')}</div>${msg}
  <div class="fld"><label>${t('aMail')}</label><input id="aM" type="email" inputmode="email" placeholder="thomas@restaurant.fr"></div>
  ${authMode==='online'?'':'<div class="fld"><label>'+t('aCode')+'</label><input id="aC" placeholder="XXXX-XXXX" style="text-transform:uppercase"></div><div class="fld"><label>'+t('aNouveauPwd')+'</label><input id="aP" type="password" placeholder="8 caractères minimum"></div><div class="fld"><label>'+t('aPwd2')+'</label><input id="aP2" type="password" placeholder="••••••••"></div>'}
  <button class="btn" id="aGo">${authMode==='online'?'Envoyer le lien sécurisé':t('aReinit')}</button>
  <button class="auth-link" id="aVersLogin">${t('aRetourConnexion')}</button>`;
 }
 document.getElementById('auth').innerHTML=`<div class="auth-box">
 <div class="auth-brand"><div class="auth-logo">${logo}</div><div class="auth-venue">${escapeHTML(etablissement)}</div></div>
 ${accueil}<div class="auth-slogan">${t('slogan')}</div>${corps}</div>`;

 const V=id=>{const e=document.getElementById(id);return e?e.value:''};
 const go=document.getElementById('aGo');
 const lien=(id,vue)=>{const e=document.getElementById(id);if(e)e.onclick=()=>showAuth(vue)};
 lien('aVersCreer','signup');lien('aVersLogin','login');lien('aOubli','reset');
 const online=document.getElementById('aVersOnline');if(online)online.onclick=()=>{authMode='online';showAuth('login')};

 if(authVue==='login'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await connecterEnLigne(V('aM'),V('aP')):await connecter(V('aM'),V('aP'));go.disabled=false;
  if(r.e)showAuth('login',{type:'err',txt:r.e});else if(r.workspace)showAuth('workspace');else{document.getElementById('auth').classList.remove('on');await bootApp()}};
 if(authVue==='signup'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await creerCompteEnLigne(V('aN'),V('aM'),V('aE'),V('aP'),V('aP2')):await creerCompte(V('aN'),V('aM'),V('aE'),V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('signup',{type:'err',txt:r.e});else if(r.confirmation)showAuth('login',{type:'ok',txt:'Compte créé. Vérifiez votre e-mail, puis connectez-vous pour créer votre espace.'});else if(r.workspace)showAuth('workspace');else if(authMode==='online'){document.getElementById('auth').classList.remove('on');await bootApp()}else{authCode=r.code;showAuth('code')}};
 if(authVue==='reset'&&go)go.onclick=async()=>{
  go.disabled=true;const r=authMode==='online'?await envoyerLienReinitialisation(V('aM')):await reinit(V('aM'),V('aC'),V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('reset',{type:'err',txt:r.e});
  else showAuth('login',{type:'ok',txt:authMode==='online'?'Si cette adresse est enregistrée, un lien sécurisé vient d’être envoyé.':t('aReinitOk')})};
 if(authVue==='new-password'&&go)go.onclick=async()=>{
  go.disabled=true;const r=await definirNouveauMotDePasse(V('aP'),V('aP2'));go.disabled=false;
  if(r.e)showAuth('new-password',{type:'err',txt:r.e});else showAuth('login',{type:'ok',txt:'Mot de passe mis à jour. Vous pouvez vous connecter.'})};
 if(authVue==='workspace'&&go)go.onclick=async()=>{
  go.disabled=true;const r=await creerEspaceEnLigne(V('aN'),V('aE'));go.disabled=false;
  if(r.e)showAuth('workspace',{type:'err',txt:r.e});else{document.getElementById('auth').classList.remove('on');await bootApp()}};
 const ent=document.getElementById('aEntrer');
 if(ent)ent.onclick=async()=>{document.getElementById('auth').classList.remove('on');await bootApp()};
}

