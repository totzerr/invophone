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
