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

