/* ── Formulaire CARTE ── */
function openCarte(id){
const c=id?item(id):null;
fm=c?{...c,f:{...(c.f||{})},fu:{...(c.fu||{})},ing:Object.entries(c.f||{}).map(([k,v])=>({k,v,u:uniteFiche(c,k)}))}
:{id:null,n:'',i:'🍽️',c:'cPlats',k:'food',sv:'tous',pv:'',ing:[]};
drawCarte()}

function changerTypeFiche(type){
 if(type===fm.k)return;
 fm.ing.forEach(r=>{const p=prod(r.k);if(!p||!p.bottle)return;
  if(type==='drink'&&r.u==='btl'){
   r.v=num(r.v)*qteUnite(p.ct,p.ctu||'cl','cl');r.u='cl';
  }else if(fm.k==='drink'&&(r.u==='cl'||r.u==='ml')){
   r.v=qteFicheEnStock({k:'drink',fu:{[r.k]:r.u}},r.k,num(r.v));r.u='btl';
  }
 });
 fm.k=type;drawCarte();
}

function drawCarte(){
const isNew=!fm.id;
const cr=fm.ing.reduce((s,r)=>{const p=prod(r.k),fiche={k:fm.k,fu:{[r.k]:r.u}};return s+(p?qteFicheEnStock(fiche,r.k,num(r.v))*p.px:0)},0);
const pv=num(fm.pv);const ratio=pv>0?cr/pv*100:0;
const ings=fm.ing.map((r,ix)=>{const p=prod(r.k),uStock=p?p.u:'',unites=unitesFiche(fm,p);
 const uSaisie=unites.includes(r.u)?r.u:(fm.k==='drink'&&p&&p.bottle?(p.ctu||'cl'):uStock);r.u=uSaisie;
 const fiche={k:fm.k,fu:{[r.k]:uSaisie}},qStock=p?qteFicheEnStock(fiche,r.k,num(r.v)):0;
 const equivalent=uStock&&uSaisie!==uStock?'<span class="ing-equivalent">≈ '+fmtQ(qStock)+' '+uStock+'</span>':'';
 return `<div class="ing-row"><select data-ik="${ix}">${st.prods.map(p=>`<option value="${p.id}" ${r.k===p.id?'selected':''}>${p.i} ${p.n} (${p.u})</option>`).join('')}</select><input data-iv="${ix}" inputmode="decimal" value="${r.v}" placeholder="0"><select class="ing-unit" data-iu="${ix}">${unites.map(u=>`<option value="${u}" ${u===uSaisie?'selected':''}>${u}</option>`).join('')}</select><button class="ing-x" data-ix="${ix}">×</button>${equivalent}</div>`}).join('');
document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgC"><div class="sheet">
<h3>${isNew?t('addCarte'):t('editCarte')}</h3><p class="sh-sub">${t('ficheS')}</p>
<div class="f3">
 <div class="fld"><label>${t('fIcone')}</label><input id="cI" value="${fm.i}" maxlength="4" style="text-align:center;font-size:20px"></div>
 <div class="fld"><label>${t('fNom')}</label><input id="cN" value="${fm.n.replace(/"/g,'&quot;')}" placeholder="Mojito"></div></div>
<div class="f2">
 <div class="fld"><label>${t('fCat')}</label><select id="cC">
 ${CATS.map(x=>`<option value="${x}" ${fm.c===x?'selected':''}>${t(x)}</option>`).join('')}</select></div>
 <div class="fld"><label>${t('fPV')} (€)</label><input id="cPv" inputmode="decimal" value="${fm.pv}" placeholder="10,00"></div></div>
<div class="fld"><label>${t('fType')}</label></div>
<div class="seg">
 <button class="${fm.k==='food'?'on':''}" data-k="food">🍽️ ${t('tFood')}</button>
 <button class="${fm.k==='drink'?'on':''}" data-k="drink">🍹 ${t('tDrink')}</button></div>
<div class="fld"><label>${t('fService')}</label></div>
<div class="seg">
 <button class="${fm.sv==='midi'?'on':''}" data-sv="midi">☀️ ${t('midi')}</button>
 <button class="${fm.sv==='soir'?'on':''}" data-sv="soir">🌙 ${t('soir')}</button>
 <button class="${fm.sv==='tous'?'on':''}" data-sv="tous">🕐 ${t('svTous')}</button></div>
<div class="fld"><label>${t('fiche')}</label></div>
${fm.k==='drink'?`<div class="hint">Les ingrédients stockés en bouteilles se saisissent en cl ou ml. Chaque vente est automatiquement convertie en fraction de bouteille dans le stock et les analyses.</div>`:''}
${ings||`<p style="font-size:12px;color:var(--steel-d,#687386);margin-bottom:8px">${t('noIng')}</p>`}
<button class="ing-add" id="cAddIng">${t('addIng')}</button>
<div class="calc" style="margin-top:14px">
 <span class="calc-l">${t('coutRev')} · ${t('ratioP')}</span>
 <span class="calc-v">${fmt(cr)} €<span style="color:${ratio>35?'var(--red,#C2414A)':'var(--green,#235A34)'};font-size:13px"> · ${ratio.toFixed(0)} %</span></span></div>
<div class="sh-actions">
 ${isNew?'':`<button class="btn btn-del btn-sm" id="cDel">🗑️ ${t('del')}</button>`}
 <button class="btn btn-2 btn-sm" id="cCancel">${t('cancel')}</button>
 <button class="btn" id="cSave">${t('save2')}</button></div>
</div></div>`;
document.getElementById('bgC').onclick=e=>{if(e.target.id==='bgC')closeModal()};
const b=(el,key)=>{const n=document.getElementById(el);if(n)n.oninput=e=>fm[key]=e.target.value};
b('cN','n');b('cI','i');
document.getElementById('cPv').oninput=e=>{fm.pv=e.target.value;
 const c2=document.querySelector('.calc-v');const p=num(fm.pv);
 const r=p>0?cr/p*100:0;
 c2.innerHTML=`${fmt(cr)} €<span style="color:${r>35?'var(--red,#C2414A)':'var(--green,#235A34)'};font-size:13px"> · ${r.toFixed(0)} %</span>`};
document.getElementById('cC').onchange=e=>fm.c=e.target.value;
document.querySelectorAll('[data-k]').forEach(x=>x.onclick=()=>changerTypeFiche(x.dataset.k));
document.querySelectorAll('[data-sv]').forEach(x=>x.onclick=()=>{fm.sv=x.dataset.sv;drawCarte()});
document.querySelectorAll('[data-ik]').forEach(s=>s.onchange=e=>{const r=fm.ing[+s.dataset.ik];r.k=e.target.value;const p=prod(r.k);r.u=fm.k==='drink'&&p?.bottle?(p.ctu||'cl'):(p?.u||r.u);drawCarte()});
document.querySelectorAll('[data-iv]').forEach(inp=>inp.oninput=e=>{fm.ing[+inp.dataset.iv].v=e.target.value});
document.querySelectorAll('[data-iu]').forEach(sel=>sel.onchange=e=>{fm.ing[+sel.dataset.iu].u=e.target.value;drawCarte()});
document.querySelectorAll('[data-ix]').forEach(x=>x.onclick=()=>{fm.ing.splice(+x.dataset.ix,1);drawCarte()});
document.getElementById('cAddIng').onclick=()=>{
 if(!st.prods.length)return;const p=st.prods[0];fm.ing.push({k:p.id,v:'',u:fm.k==='drink'&&p.bottle?(p.ctu||'cl'):p.u});drawCarte()};
document.getElementById('cCancel').onclick=closeModal;
document.getElementById('cSave').onclick=saveCarte;
const d=document.getElementById('cDel');if(d)d.onclick=delCarte}

async function saveCarte(){
if(!fm.n.trim())return;
const f={},fu={};fm.ing.forEach(r=>{if(r.k&&num(r.v)>0){f[r.k]=num(r.v);fu[r.k]=r.u||prod(r.k)?.u||''}});
const obj={id:fm.id||uid('c'),n:fm.n.trim(),i:fm.i||'🍽️',c:fm.c,k:fm.k,sv:fm.sv,pv:num(fm.pv),f,fu};
if(fm.k==='drink')obj.beverageUnitsVersion=1;
if(fm.id){const ix=st.carte.findIndex(x=>x.id===fm.id);st.carte[ix]=obj}
else st.carte.push(obj);
await save();closeModal();renderStock();toast(t('carteSaved'))}

async function delCarte(){
if(!confirm(t('confDel')))return;
st.carte=st.carte.filter(x=>x.id!==fm.id);delete panier[fm.id];
await save();closeModal();renderStock();toast(t('carteDel'))}

