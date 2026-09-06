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
 const nom=String(st&&(st.organizationName||st.etabNom)||'').trim();
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
