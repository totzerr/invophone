/* SWAY · catalogue */

/* ═════ PRODUITS : matières + carte ═════ */
function renderStock(){
/* Les prévisions sont calculées une seule fois, même avec une longue liste. */
const pvMap=stockTab==='mat'?previsionIndex().map:{};
const sub=`<div class="subtabs">
<button class="${stockTab==='mat'?'on':''}" data-sub2="mat">📦 ${t('tabMat')} (${st.prods.length})</button>
<button class="${stockTab==='carte'?'on':''}" data-sub2="carte">🍽️ ${t('tabCarte')} (${st.carte.length})</button></div>`;

let body='';
if(stockTab==='mat'){
const rows=st.prods.filter(p=>p.n.toLowerCase().includes(sq.toLowerCase())).map(p=>{
const q=st.stock[p.id]??p.s??0;const cls=q<=0?'out':(q<=p.seuil?'low':'');
const cont=p.bottle?` · ${fmtQ(p.ct)} ${p.ctu||'cl'} / bouteille`:(p.ct?` · ${fmtQ(p.ct)} ${p.u}`:'');
const R=estResp();
const pvx=pvMap[p.id];
const bd=pvx&&q>0&&(pvx.type==='perte'||(pvx.type==='rupture'&&pvx.quand<7))?badgePrev(pvx):null;
const qq=bd?{txt:bd.txt,cls:bd.cls}:null;
const meta=(R?`${fmt(p.px)} €/${p.u}${cont} · ${zLabel(p.z||'reserve')}${p.pxPrev&&p.px>p.pxPrev?' · ▲':''}`
:`${cont?(p.bottle?fmtQ(p.ct)+' '+(p.ctu||'cl')+' / bouteille':fmtQ(p.ct)+' '+p.u)+' · ':''}${zLabel(p.z||'reserve')}`)
+(qq?` · <b style="color:${qq.cls==='rouge'?'var(--red,#C2414A)':'var(--amber,#4355F5)'}">${qq.txt}</b>`:'');
return `<button class="line" ${R?`data-editmat="${p.id}"`:'style="cursor:default"'}><span class="l-ico">${p.i}</span>
<span class="l-body"><div class="l-nm">${p.n}</div>
<div class="l-meta">${meta}</div></span>
<span class="l-val"><div class="l-qty ${cls}">${fmtQ(q)}</div><div class="l-unit">${p.u}</div></span>
${R?'<span class="l-edit">›</span>':''}</button>`}).join('');
body=`${estResp()?`<div class="stock-actions"><button class="btn btn-2" id="addMat">+ ${t('addMat')}</button></div>`:''}
<input class="search" id="sqi" placeholder="${t('search')}" value="${sq}"><div>${rows}</div>`;
}else{
const R=estResp();
const vus=st.carte.filter(c=>c.n.toLowerCase().includes(sq.toLowerCase())
 &&(cartCat==='tous'||c.c===cartCat));

if(R&&cartePrix){
 /* ── Édition rapide des prix de vente ── */
 const chips=['tous',...CATS].map(k=>
  `<button class="cat ${cartCat===k?'on':''}" data-ccat="${k}">${k==='tous'?t('pvTous'):t(k)}</button>`).join('');
 const lignes=vus.map(c=>{
  const cr=coutMat(c.id,1);
  const pv=(prixEdit[c.id]!==undefined)?num(prixEdit[c.id]):c.pv;
  const r=pv>0?(cr/pv*100):0;
  const modif=prixEdit[c.id]!==undefined&&Math.abs(num(prixEdit[c.id])-c.pv)>0.001;
  return `<div class="pv-row ${modif?'modif':''}">
   <span class="pv-ico">${c.i}</span>
   <span class="pv-body"><div class="pv-n">${c.n}</div>
    <div class="pv-m">${t('pvCout')} ${fmt(cr)} €
     <b style="color:${r>35?'var(--red,#C2414A)':'var(--green,#235A34)'}">· ${r.toFixed(0)} %</b>
     ${modif?` · <i>${t('pvAvant')} ${fmt(c.pv)} €</i>`:''}</div></span>
   <span class="pv-in"><input inputmode="decimal" data-pv="${c.id}"
    value="${prixEdit[c.id]!==undefined?prixEdit[c.id]:fmt(c.pv)}"><span>€</span></span>
  </div>`}).join('');
 const nbModif=Object.keys(prixEdit).filter(id=>{
  const c=item(id);return c&&Math.abs(num(prixEdit[id])-c.pv)>0.001}).length;
 body=`<div class="hint">${t('pvAide')}</div>
  <div class="cats">${chips}</div>
  <input class="search" id="sqi" placeholder="${t('search')}" value="${sq}">
  <div class="pv-masse">
   <span class="pv-masse-l">${t('pvAppliquer').replace('%n',vus.length)}</span>
   <div class="pv-masse-b">
    <button class="vl-act" data-pct="-10">−10 %</button>
    <button class="vl-act" data-pct="-5">−5 %</button>
    <button class="vl-act" data-pct="5">+5 %</button>
    <button class="vl-act" data-pct="10">+10 %</button>
   </div></div>
  ${lignes||`<p class="vl-help">${t('pvAucun')}</p>`}
  <div class="pv-actions">
   <button class="btn btn-2 btn-sm" id="pvAnnuler">${t('cancel')}</button>
   <button class="btn" id="pvEnr" ${nbModif?'':'disabled'}>
    ${nbModif?t('pvEnregistrer').replace('%n',nbModif):t('pvRien')}</button></div>`;
}else{
 const rows=vus.map(c=>{
  const cr=coutMat(c.id,1);const r=c.pv>0?(cr/c.pv*100):0;
  return `<button class="line" ${R?`data-editcarte="${c.id}"`:'style="cursor:default"'}><span class="l-ico">${c.i}</span>
  <span class="l-body"><div class="l-nm">${c.n}</div>
  <div class="l-meta">${t(c.c)} · ${c.sv==='tous'?t('svTous'):(c.sv==='midi'?t('midi'):t('soir'))} · ${c.k==='food'?t('tFood'):t('tDrink')}</div></span>
  ${R?`<span class="l-val"><div class="l-qty">${fmt(c.pv)} €</div>
  <div class="l-unit" style="color:${r>35?'var(--red,#C2414A)':'var(--green,#235A34)'}">${r.toFixed(0)} %</div></span>
  <span class="l-edit">›</span>`:''}</button>`}).join('');
 const chips=['tous',...CATS].map(k=>
  `<button class="cat ${cartCat===k?'on':''}" data-ccat="${k}">${k==='tous'?t('pvTous'):t(k)}</button>`).join('');
 body=`${R?`<div class="scan-actions">
   <button class="scan-btn" id="addCarte"><span class="sb-i">➕</span><span class="sb-l">${t('addCarte')}</span></button>
   <button class="scan-btn primary" id="modPrix"><span class="sb-i">💶</span><span class="sb-l">${t('pvModifier')}</span></button>
  </div>`:''}
  <div class="cats">${chips}</div>
  <input class="search" id="sqi" placeholder="${t('search')}" value="${sq}"><div>${rows}</div>`;
}
}
document.getElementById('s-stock').innerHTML=`
<div class="h-title">${t('stockT')}</div><div class="h-sub">${t('stockS')}</div>${sub}${body}`;
document.querySelectorAll('[data-sub2]').forEach(b=>b.onclick=()=>{stockTab=b.dataset.sub2;sq='';renderStock()});
const i=document.getElementById('sqi');
if(i)i.oninput=e=>{sq=e.target.value;renderStock();const el=document.getElementById('sqi');
el.focus();el.setSelectionRange(el.value.length,el.value.length)};
const am=document.getElementById('addMat');if(am)am.onclick=()=>openMat(null);
const ac=document.getElementById('addCarte');if(ac)ac.onclick=()=>openCarte(null);
document.querySelectorAll('[data-editmat]').forEach(b=>b.onclick=()=>openMat(b.dataset.editmat));
document.querySelectorAll('[data-editcarte]').forEach(b=>b.onclick=()=>openCarte(b.dataset.editcarte));
document.querySelectorAll('[data-ccat]').forEach(b=>b.onclick=()=>{cartCat=b.dataset.ccat;renderStock()});
const mp=document.getElementById('modPrix');
if(mp)mp.onclick=()=>{cartePrix=true;prixEdit={};renderStock()};
const pa=document.getElementById('pvAnnuler');
if(pa)pa.onclick=()=>{cartePrix=false;prixEdit={};renderStock()};
document.querySelectorAll('[data-pv]').forEach(inp=>{
 inp.oninput=e=>{prixEdit[inp.dataset.pv]=e.target.value};
 inp.onblur=()=>renderStock();
});
document.querySelectorAll('[data-pct]').forEach(b=>b.onclick=()=>{
 const p=num(b.dataset.pct);
 st.carte.filter(c=>c.n.toLowerCase().includes(sq.toLowerCase())
  &&(cartCat==='tous'||c.c===cartCat)).forEach(c=>{
   const base=prixEdit[c.id]!==undefined?num(prixEdit[c.id]):c.pv;
   prixEdit[c.id]=fmt(Math.max(0,Math.round(base*(1+p/100)*100)/100));
  });
 renderStock();
});
const pe=document.getElementById('pvEnr');
if(pe)pe.onclick=async()=>{
 let n=0;
 Object.entries(prixEdit).forEach(([id,v])=>{
  const c=item(id);if(!c)return;
  const nv=num(v);
  if(nv>=0&&Math.abs(nv-c.pv)>0.001){c.pvPrev=c.pv;c.pv=nv;n++}
 });
 await save();
 cartePrix=false;prixEdit={};
 renderStock();
 toast(t('pvEnregistres').replace('%n',n));
};}

/* ── Formulaire MATIÈRE ── */
function openMat(id,fournisseurDefaut){
const p=id?prod(id):null;
fm=p?{...p,mode:p.bottle?'bottle':(p.ct?'cont':'direct'),ctu:p.ctu||'cl',stock:st.stock[p.id]??p.s??0}
:{id:null,n:'',i:'📦',u:'kg',ct:'',ctu:'cl',pc:'',px:'',seuil:'',stock:'',mode:'direct',fo:fournisseurDefaut||''};
drawMat()}

function drawMat(){
const isNew=!fm.id;
const calc=(fm.mode==='cont'||fm.mode==='bottle')&&parseFloat(fm.ct)>0&&parseFloat(fm.pc)>=0
?parseFloat(fm.pc)/parseFloat(fm.ct):null;
const uniteStock=fm.mode==='bottle'?'btl':fm.u;
const used=fm.id?st.carte.filter(c=>c.f&&c.f[fm.id]!==undefined).length:0;
document.getElementById('modal').innerHTML=`<div class="sheet-bg" id="bgM"><div class="sheet">
<h3>${isNew?t('addMat'):t('editMat')}</h3>
<p class="sh-sub">${isNew?'':(used?t('usedIn').replace('%s',used):'')}</p>
<div class="f3">
 <div class="fld"><label>${t('fIcone')}</label><input id="mI" value="${fm.i}" maxlength="4" style="text-align:center;font-size:20px"></div>
 <div class="fld"><label>${t('fNom')}</label><input id="mN" value="${fm.n.replace(/"/g,'&quot;')}" placeholder="Gin Beefeater"></div>
</div>
<div class="fld"><label>${t('fUnite')}</label>${fm.mode==='bottle'
?`<select id="mU" disabled><option>btl</option></select><small>Le stock et l’inventaire sont suivis en bouteilles.</small>`
:`<select id="mU">${UNITES.map(u=>`<option ${fm.u===u?'selected':''}>${u}</option>`).join('')}</select><small>kg pour la cuisine, L pour les fûts, u à la pièce.</small>`}</div>
<div class="fld"><label>${t('fAchat')}</label></div>
<div class="seg">
 <button class="${fm.mode==='bottle'?'on':''}" data-mode="bottle">🍾 Bouteille</button>
 <button class="${fm.mode==='cont'?'on':''}" data-mode="cont">📦 ${t('achCont')}</button>
 <button class="${fm.mode==='direct'?'on':''}" data-mode="direct">⚖️ ${t('achDirect')}</button></div>
${fm.mode==='bottle'?`<div class="f2">
 <div class="fld"><label>${t('fContenance')}</label><div style="display:flex;gap:8px"><input id="mCt" inputmode="decimal" value="${fm.ct}" placeholder="70"><select id="mCtU" style="max-width:82px"><option ${fm.ctu==='cl'?'selected':''}>cl</option><option ${fm.ctu==='ml'?'selected':''}>ml</option></select></div></div>
 <div class="fld"><label>Prix par bouteille (€)</label><input id="mPc" inputmode="decimal" value="${fm.pc}" placeholder="15,40"></div></div>
 ${calc!==null?`<div class="calc"><span class="calc-l">Équivalent au volume</span><span class="calc-v">${fmt(calc)} €/${fm.ctu||'cl'}</span></div>`:''}
 <div class="hint">Dans les fiches techniques de boissons, cette bouteille pourra être dosée en cl ou ml. INVO convertira automatiquement chaque vente en fraction de bouteille.</div>`
:fm.mode==='cont'?`<div class="f2">
 <div class="fld"><label>${t('fContenance')} (${fm.u})</label><input id="mCt" inputmode="decimal" value="${fm.ct}" placeholder="70"></div>
 <div class="fld"><label>${t('fPrixCont')} (€)</label><input id="mPc" inputmode="decimal" value="${fm.pc}" placeholder="15,40"></div></div>
 ${calc!==null?`<div class="calc"><span class="calc-l">${t('fPrixU')}</span>
 <span class="calc-v">${fmt(calc)} €/${fm.u}</span></div>`:''}`
:`<div class="fld"><label>${t('fPrixU')} (€/${fm.u})</label><input id="mPx" inputmode="decimal" value="${fm.px}" placeholder="16,50"></div>`}
<div class="f2">
 <div class="fld"><label>${t('fStock')} (${uniteStock})</label><input id="mS" inputmode="decimal" value="${fm.stock}" placeholder="0"></div>
 <div class="fld"><label>${t('fSeuil')} (${uniteStock})</label><input id="mSe" inputmode="decimal" value="${fm.seuil}" placeholder="0"></div></div>
<div class="fld"><label>${t('fDlc')}</label><input id="mD" inputmode="numeric" value="${fm.dlc===undefined?'':fm.dlc}" placeholder="4">
<small>${t('fDlcAide')}</small></div>
<div class="f2">
 <div class="fld"><label>${t('zone')}</label><select id="mZ">
  ${ZONES_L.map(z=>`<option value="${z}" ${(fm.z||'reserve')===z?'selected':''}>${zLabel(z)}</option>`).join('')}</select></div>
 <div class="fld"><label>${t('fourn')}</label><input id="mFo" value="${(fm.fo||'').replace(/"/g,'&quot;')}" placeholder="Metro"></div></div>
<div class="fld"><label>Fournisseurs alternatifs (facultatif)</label><textarea id="mFos" rows="3" placeholder="Nom du fournisseur | Prix d’achat&#10;Ex. France Boissons | 1,25">${(fm.fournisseurs||[]).filter(o=>o&&o.n).map(o=>escapeHTML(o.n)+' | '+fmt(o.px)).join('&#10;')}</textarea><small>Un fournisseur et son prix par ligne. INVO indiquera la meilleure offre dans Commandes.</small></div>
<div class="sh-actions">
 ${isNew?'':`<button class="btn btn-del btn-sm" id="mDel">🗑️ ${t('del')}</button>`}
 <button class="btn btn-2 btn-sm" id="mCancel">${t('cancel')}</button>
 <button class="btn" id="mSave">${t('save2')}</button></div>
</div></div>`;
document.getElementById('bgM').onclick=e=>{if(e.target.id==='bgM')closeModal()};
const bind=(el,key)=>{const n=document.getElementById(el);if(n)n.oninput=e=>{fm[key]=e.target.value;
 if(key==='ct'||key==='pc')updCalc()}};
bind('mN','n');bind('mI','i');bind('mCt','ct');bind('mPc','pc');bind('mPx','px');
bind('mS','stock');bind('mSe','seuil');bind('mD','dlc');bind('mFo','fo');
const altFos=document.getElementById('mFos');if(altFos)altFos.oninput=e=>fm.fournisseursTexte=e.target.value;
const zSel=document.getElementById('mZ');if(zSel)zSel.onchange=e=>fm.z=e.target.value;
const uSel=document.getElementById('mU');if(uSel&&!uSel.disabled)uSel.onchange=e=>{fm.u=e.target.value;drawMat()};
const ctuSel=document.getElementById('mCtU');if(ctuSel)ctuSel.onchange=e=>{fm.ctu=e.target.value;drawMat()};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{fm.mode=b.dataset.mode;drawMat()});
function updCalc(){const c=document.querySelector('.calc-v');
 const v=parseFloat(String(fm.ct).replace(',','.')),pc=parseFloat(String(fm.pc).replace(',','.'));
 if(c&&v>0&&pc>=0)c.textContent=fmt(pc/v)+' €/'+(fm.mode==='bottle'?(fm.ctu||'cl'):fm.u)}
document.getElementById('mCancel').onclick=closeModal;
document.getElementById('mSave').onclick=saveMat;
const d=document.getElementById('mDel');if(d)d.onclick=delMat}

const num=v=>{const x=parseFloat(String(v).replace(',','.'));return isNaN(x)?0:x};

async function saveMat(){
if(!fm.n.trim())return;
const px=fm.mode==='bottle'?num(fm.pc):(fm.mode==='cont'?(num(fm.ct)>0?num(fm.pc)/num(fm.ct):0):num(fm.px));
const ancien=fm.id?prod(fm.id):null,nouvelleZone=fm.z||'reserve';
const emplacements=Array.isArray(fm.emplacements)&&fm.emplacements.length?[...new Set(fm.emplacements)]:[nouvelleZone];
const obj={id:fm.id||uid('m'),n:fm.n.trim(),i:fm.i||'📦',u:fm.mode==='bottle'?'btl':fm.u,px,
 seuil:num(fm.seuil),s:num(fm.stock),dlc:num(fm.dlc),z:emplacements[0],emplacements,
 invCategory:fm.invCategory||inventaireCategorieParDefaut(fm),fo:(fm.fo||'Divers').trim(),
 displayOrder:ancien&&(ancien.z||'reserve')===nouvelleZone&&Number.isFinite(Number(ancien.displayOrder))
  ?Number(ancien.displayOrder):prochainePositionZone(nouvelleZone)};
const texteAlternatives=String(fm.fournisseursTexte!==undefined?fm.fournisseursTexte:(fm.fournisseurs||[]).map(function(o){return String(o.n||'')+' | '+String(o.px??'')}).join(String.fromCharCode(10)));
const alternatives=texteAlternatives.split(String.fromCharCode(10)).map(function(l){const parts=l.split('|'),n=String(parts.shift()||'').trim(),prix=num(parts.join('|'));return{n:n,px:prix}}).filter(function(o){return o.n&&o.px>0&&o.n.toLowerCase()!==obj.fo.toLowerCase()});
if(alternatives.length)obj.fournisseurs=alternatives;
if(fm.pxPrev)obj.pxPrev=fm.pxPrev;if(fm.hist)obj.hist=fm.hist;
if(fm.mode==='bottle'){
 obj.bottle=true;obj.bottleVersion=1;obj.bottleRecipeLegacyUnit=fm.bottleRecipeLegacyUnit||'cl';
 obj.ct=num(fm.ct);obj.ctu=fm.ctu==='ml'?'ml':'cl';obj.pc=num(fm.pc);
}else if(fm.mode==='cont'){obj.ct=num(fm.ct);obj.pc=num(fm.pc)}
if(fm.id){const ix=st.prods.findIndex(p=>p.id===fm.id);st.prods[ix]=obj}
else st.prods.push(obj);
if(ancien&&(ancien.z||'reserve')!==nouvelleZone)normaliserZone(ancien.z||'reserve');
normaliserZone(nouvelleZone);
st.stock[obj.id]=num(fm.stock);assurerFournisseurs();
await save();closeModal();renderStock();if(screen==='cmd')renderCommanderScreen();toast(t('matSaved'))}

async function delMat(){
const used=st.carte.filter(c=>c.f&&c.f[fm.id]!==undefined).length;
if(!confirm(t('confDel')+(used?'\n'+t('usedIn').replace('%s',used):'')))return;
const ancienneZone=(prod(fm.id)?.z)||'reserve';
st.prods=st.prods.filter(p=>p.id!==fm.id);delete st.stock[fm.id];delete st.count[fm.id];
st.carte.forEach(c=>{if(c.f&&c.f[fm.id]!==undefined)delete c.f[fm.id]});
normaliserZone(ancienneZone);
await save();closeModal();renderStock();toast(t('matDel'))}

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
function renderBil(){
const ventes=st.mv.filter(m=>m.motif==='vente');
const nv=st.mv.filter(m=>m.motif!=='vente');
const ca=ventes.reduce((s,m)=>s+pvMv(m),0);
const matV=ventes.reduce((s,m)=>s+coutMv(m),0);
const totalNV=nv.reduce((s,m)=>s+coutMv(m),0);
const autoNV=nv.filter(m=>m.src==='auto').reduce((s,m)=>s+coutMv(m),0);
const mainNV=nv.filter(m=>m.src==='main').reduce((s,m)=>s+coutMv(m),0);
const ratio=ca>0?((matV+totalNV)/ca*100):0;
let ecInv=0;
st.prods.forEach(p=>{const v=st.count[p.id];if(v===''||v===undefined)return;
if(Math.abs(parseFloat(v)-(st.stock[p.id]??p.s??0))>0.001)ecInv++});
const allM=['offClient','offPart','offGroupe','annul','perso','casse','rate','degus','entame'];
const cols={offClient:'var(--blue,#254A67)',offPart:'var(--teal,#0F4E53)',offGroupe:'var(--purple,#4F3D5E)',annul:'var(--red,#C2414A)',
perso:'var(--purple,#4F3D5E)',casse:'var(--red,#C2414A)',rate:'var(--red,#C2414A)',degus:'var(--amber,#4355F5)',entame:'var(--amber,#4355F5)'};
const par={};allM.forEach(k=>par[k]=0);
nv.forEach(m=>{if(par[m.motif]!==undefined)par[m.motif]+=coutMv(m)});
const max=Math.max(...Object.values(par),0.01);
const bars=allM.filter(k=>par[k]>0).map(k=>`
<div class="bar-row"><div class="bar-top"><span>${t(k)}</span><b>${fmt(par[k])} €</b></div>
<div class="bar"><i style="width:${par[k]/max*100}%;background:${cols[k]}"></i></div></div>`).join('')
||`<p style="font-size:13px;color:var(--steel-d,#687386)">${t('videD')}</p>`;
const jrnl=st.mv.length?st.mv.slice(0,30).map(m=>{const d=new Date(m.ts);
const hh=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
const jj=d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0');
return `<div class="feed-row">${m.pk&&st.photos[m.pk]?`<img class="f-thumb" src="${st.photos[m.pk]}" alt="">`:`<span class="f-ico">${m.platI}</span>`}
<span class="f-body"><div class="f-t">${m.platN}${m.qty>1?' × '+m.qty:''}</div>
<div class="f-m">${jj} ${hh} · ${m.who} · ${fmt(coutMv(m))} €${
 m.parent?` · ↩ ${t('trLiee')}`:''}${m.alerte?` · ⚠ ${t('trStockAlerte')}`:''}</div></span>
<span style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
<span class="tag ${m.motif}">${t(m.motif).toUpperCase()}</span>
<span class="src ${m.src}">${m.src==='auto'?t('auto'):t('manuel')}</span></span></div>`}).join('')
:`<div class="empty"><div class="e-ico">📊</div><p><b>${t('vide')}</b><br>${t('videD')}</p></div>`;
// Alertes : hausses de prix et plats sous marge
const hausses=st.prods.filter(p=>p.pxPrev&&p.px>p.pxPrev)
 .map(p=>({p,var:(p.px-p.pxPrev)/p.pxPrev*100}))
 .filter(x=>x.var>=5).sort((a,b)=>b.var-a.var).slice(0,6);
const sousMarge=st.carte.map(c=>({c,r:c.pv>0?coutMat(c.id,1)/c.pv*100:0}))
 .filter(x=>x.r>35).sort((a,b)=>b.r-a.r).slice(0,6);
const alertesHtml=(hausses.length||sousMarge.length)?`
 ${hausses.length?`<div class="mini-note" style="margin:0 0 6px">${t('alertPrix')}</div>`+hausses.map(x=>`
  <div class="alert-row"><span class="alert-ico">${x.p.i}</span>
  <span class="alert-b"><div class="alert-n">${x.p.n}</div>
  <div class="alert-m">${fmt(x.p.pxPrev)} → ${fmt(x.p.px)} €/${x.p.u}</div></span>
  <span class="alert-v up">+${x.var.toFixed(0)} %</span></div>`).join(''):''}
 ${sousMarge.length?`<div class="mini-note" style="margin:14px 0 6px">${t('alertMarge')}</div>`+sousMarge.map(x=>`
  <div class="alert-row"><span class="alert-ico">${x.c.i}</span>
  <span class="alert-b"><div class="alert-n">${x.c.n}</div>
  <div class="alert-m">${fmt(coutMat(x.c.id,1))} € / ${fmt(x.c.pv)} €</div></span>
  <span class="alert-v up">${x.r.toFixed(0)} %</span></div>`).join(''):''}`
 :`<p class="mini-note">${t('noAlerte')}</p>`;

const anos=anomalies();
const blocAno=anos.length?`<div class="eyebrow">${t('attention')}</div>
<div style="margin-bottom:22px">${anos.map(x=>{const action=x.action?` data-analysis-action="${x.action}" aria-label="${escapeHTML(x.t)} · ouvrir le traitement"`:'';return `<${x.action?'button type="button"':'div'} class="ano ${x.n}${x.action?' ano-action':''}"${action}>
<div class="ano-t">${x.n==='rouge'?'⚠️ ':''}${x.t}</div>
${x.d?`<div class="ano-d">${x.d}</div>`:''}</${x.action?'button':'div'}>`}).join('')}</div>`
:`<div class="eyebrow">${t('attention')}</div>
<div class="ano" style="margin-bottom:22px"><div class="ano-t">${t('rasT')}</div>
<div class="ano-d">${t('rasD')}</div></div>`;

let blocDos='';
if(peutVoirEcartsInventaire()&&st.doseurs&&st.doseurs.actif){
 const th=consoTheorique();
 const bouteilles=st.prods.filter(p=>p.u==='cl'&&(th[p.id]||0)>0)
  .sort((a,b)=>(th[b.id]||0)-(th[a.id]||0)).slice(0,12);
 const lignes=bouteilles.map(p=>{
  const theo=th[p.id]||0, v=st.doseurs.releves[p.id], has=v!==undefined&&v!=='';
  const reel=num(v), ec=has&&theo>0?(reel-theo)/theo*100:null;
  const col=ec===null?'var(--steel-d,#687386)':(Math.abs(ec)>10?'var(--red,#C2414A)':'var(--green,#235A34)');
  return `<div class="dos-row"><span class="dos-n">${p.i} ${p.n}</span>
  <span class="dos-th">${fmtQ(Math.round(theo*10)/10)}</span>
  <input class="dos-in" inputmode="decimal" data-dosr="${p.id}" value="${has?v:''}" placeholder="—">
  <span class="dos-ec" style="color:${col}">${ec===null?'—':(ec>0?'+':'')+ec.toFixed(0)+' %'}</span></div>`}).join('');
 blocDos=`<div class="eyebrow" style="margin-top:24px">${t('doseurs')}</div>
 <div class="auth-msg info">${t('doseursDemo')}</div>
 ${bouteilles.length?`<div class="dos-h"><span>${t('prod')}</span><span>${t('theo')}</span>
 <span style="text-align:center">${t('releve')}</span><span>${t('ecart')}</span></div>${lignes}`
 :`<p style="font-size:13px;color:var(--steel-d,#687386)">${t('videD')}</p>`}`;
}

document.getElementById('s-bil').innerHTML=`
<div class="h-title">${t('bilT')}</div><div class="h-sub">${t('bilS')}</div>
${blocAno}
<div class="kpis">
<div class="kpi green"><div class="kpi-v">${fmt(ca)} €</div><div class="kpi-l">${t('kCA')}</div></div>
<div class="kpi amber"><div class="kpi-v">${fmt(totalNV)} €</div><div class="kpi-l">${t('kNonVendu')}</div></div>
<div class="kpi ${ratio>34?'red':'green'}"><div class="kpi-v">${ratio.toFixed(1).replace('.',',')} %</div><div class="kpi-l">${t('kRatio')}</div></div>
${peutVoirEcartsInventaire()?`<div class="kpi ${ecInv?'red':'green'}"><div class="kpi-v">${ecInv}</div><div class="kpi-l">${t('kEcart')}</div></div>`:''}</div>
<div class="eyebrow">${t('origine')}</div>
<div class="split">
<div class="split-cell"><div class="sp-lab a">${t('auto')}</div>
<div class="sp-v" style="color:var(--blue,#254A67)">${fmt(autoNV)} €</div>
<div class="sp-d">${t('srcAuto')} — ${t('srcAutoD')}</div></div>
<div class="split-cell"><div class="sp-lab b">${t('manuel')}</div>
<div class="sp-v" style="color:var(--amber,#4355F5)">${fmt(mainNV)} €</div>
<div class="sp-d">${t('srcMain')} — ${t('srcMainD')}</div></div></div>
<div class="eyebrow">${t('repart')}</div><div style="margin-bottom:24px">${bars}</div>
<div class="eyebrow">${t('alertes')}</div>${alertesHtml}
${blocDos}
<div class="eyebrow" style="margin-top:24px">${t('jrnl')}</div><div>${jrnl}</div>
<div class="exp-row"><button class="btn btn-2 btn-sm" id="bilCsv">${t('exportCsv')}</button>
<button class="btn btn-2 btn-sm" id="bilPrint">${t('imprimer')}</button></div>`;
document.querySelectorAll('[data-dosr]').forEach(inp=>{
 inp.oninput=e=>{st.doseurs.releves[e.target.dataset.dosr]=e.target.value;save()};
 inp.onblur=()=>renderBil()});
document.querySelectorAll('[data-analysis-action]').forEach(b=>b.onclick=()=>ouvrirTraitementAnalyse(b.dataset.analysisAction));
document.getElementById('bilPrint').onclick=()=>window.print();
document.getElementById('bilCsv').onclick=()=>{
 const rows=[['Date','Heure','Produit','Qte','Motif','Source','Cout matiere EUR','Prix vente EUR']];
 st.mv.forEach(m=>{const d=new Date(m.ts);
  rows.push([d.toLocaleDateString('fr-FR'),d.toLocaleTimeString('fr-FR').slice(0,5),
   m.platN,m.qty,t(m.motif),m.src==='auto'?'Caisse':'Manuel',
   Math.round(coutMv(m)*100)/100,Math.round(pvMv(m)*100)/100])});
 dlCsv(rows,'bilan_'+new Date().toISOString().slice(0,10)+'.csv')};
}
