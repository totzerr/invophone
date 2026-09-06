/* SWAY · interface Liquid Glass progressive et widgets modulables. */
(function(){
 const cleOrdre='sway.dashboard.widgetOrder.v1';
 const nomWidget=el=>el.dataset.widgetKey||[...el.classList].find(x=>/^(wb-|weather-|morning-|profile-)/.test(x))||'';

 window.renderRecipesHub=function(){
  const recettes=(st.carte||[]),cartes=recettes.slice(0,12).map(function(c){
   const cout=Object.entries(c.f||{}).reduce(function(total,[id,q]){const p=prod(id);return total+(p?qteFicheEnStock(c,id,q)*num(p.px):0)},0);
   const marge=num(c.pv)>0?Math.max(0,100-cout/num(c.pv)*100):0;
   return '<button class="sway-simple-card recipe-card" data-recipe="'+c.id+'"><span class="sway-card-icon">'+escapeHTML(c.i||'◇')+'</span><span><b>'+escapeHTML(c.n)+'</b><small>Cette recette coûte '+fmt(cout)+' € par portion</small></span><span class="sway-card-more">Voir la fiche<br><small>Ratio '+marge.toFixed(0)+' %</small></span></button>';
  }).join('');
  document.getElementById('s-recipes').innerHTML='<div class="sway-page"><header class="sway-page-head"><div><small>GESTION DES RECETTES</small><h1>Fiches techniques</h1><p>Comprends simplement ce que coûte chaque plat.</p></div><button class="btn" id="newRecipe">Ajouter une recette</button></header><div class="sway-simple-list">'+(cartes||'<div class="sway-empty">Aucune recette pour le moment.</div>')+'</div></div>';
  document.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>openCarte(b.dataset.recipe));
  const add=document.getElementById('newRecipe');if(add)add.onclick=()=>openCarte();
 };

 window.renderTeamHub=function(){
  const local=typeof utilisateursEtablissement==='function'?utilisateursEtablissement():[];
  const distants=window.equipeEnLigne&&Array.isArray(equipeEnLigne.membres)?equipeEnLigne.membres:[];
  const membres=(distants.length?distants:local).slice(0,12).map(function(u){
   const nom=u.name||u.nom||u.email||'Membre de l’équipe',role=u.roles?libellesRolesSway(u.roles):(u.poste||u.role||'Accès équipe');
   return '<div class="sway-simple-card team-card"><span class="sway-avatar">'+escapeHTML(String(nom).charAt(0).toUpperCase())+'</span><span><b>'+escapeHTML(nom)+'</b><small>'+escapeHTML(String(role))+'</small></span><span class="sway-status">Actif</span></div>';
  }).join('');
  document.getElementById('s-team').innerHTML='<div class="sway-page"><header class="sway-page-head"><div><small>COLLABORATION</small><h1>Équipe</h1><p>Gère simplement les personnes qui ont accès à Sway.</p></div><button class="btn" id="manageTeam">Gérer les accès</button></header><div class="sway-simple-list">'+(membres||'<div class="sway-empty">Les membres apparaîtront ici après leur invitation.</div>')+'</div></div>';
  const manage=document.getElementById('manageTeam');if(manage)manage.onclick=()=>openReglages('users');
 };

 function widgetsDuDashboard(){
  const root=document.querySelector('#s-dash .workbench, #s-dash .profile-dashboard');
  if(!root)return[];
  return [...root.children].filter(el=>el.tagName==='SECTION'&&!el.classList.contains('sway-drag-ready'));
 }
 function sauvegarder(root){
  try{localStorage.setItem(cleOrdre,JSON.stringify([...root.children].map(nomWidget).filter(Boolean)))}catch(e){}
 }
 function appliquerOrdre(root){
  let ordre=[];try{ordre=JSON.parse(localStorage.getItem(cleOrdre)||'[]')}catch(e){}
  ordre.forEach(k=>{const el=[...root.children].find(x=>nomWidget(x)===k);if(el)root.appendChild(el)});
 }
 function activerWidgets(){
  const root=document.querySelector('#s-dash .workbench, #s-dash .profile-dashboard');if(!root)return;
  appliquerOrdre(root);
  [...root.children].filter(el=>el.tagName==='SECTION').forEach(function(el,index){
   if(el.dataset.swayWidget)return;el.dataset.swayWidget='1';el.dataset.widgetKey=nomWidget(el)||'widget-'+index;
   el.insertAdjacentHTML('afterbegin','<button class="sway-drag-handle" type="button" aria-label="Maintenir pour déplacer ce bloc" title="Maintenir pour déplacer">⠿</button>');
   let timer=null,actif=false,startX=0,startY=0;
   const stop=function(){clearTimeout(timer);if(actif){actif=false;el.classList.remove('sway-dragging');document.body.classList.remove('sway-reordering');sauvegarder(root)}};
   el.addEventListener('pointerdown',function(e){if(e.target.closest('button:not(.sway-drag-handle),a,input,select,textarea'))return;startX=e.clientX;startY=e.clientY;timer=setTimeout(function(){actif=true;el.classList.add('sway-dragging');document.body.classList.add('sway-reordering');el.setPointerCapture?.(e.pointerId)},420)});
   el.addEventListener('pointermove',function(e){if(!actif){if(Math.hypot(e.clientX-startX,e.clientY-startY)>9)clearTimeout(timer);return}e.preventDefault();el.style.setProperty('--drag-x',(e.clientX-startX)+'px');el.style.setProperty('--drag-y',(e.clientY-startY)+'px');const cible=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-sway-widget]');if(cible&&cible!==el&&cible.parentElement===root){const rect=cible.getBoundingClientRect();root.insertBefore(el,e.clientY<rect.top+rect.height/2?cible:cible.nextSibling);startX=e.clientX;startY=e.clientY}});
   el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);el.addEventListener('lostpointercapture',stop);
  });
 }
 const observer=new MutationObserver(()=>requestAnimationFrame(activerWidgets));
 const dash=document.getElementById('s-dash');if(dash)observer.observe(dash,{childList:true,subtree:true});
 requestAnimationFrame(activerWidgets);
})();
