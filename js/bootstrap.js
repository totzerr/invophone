/* SWAY · point d'entrée applicatif
   Charge les modules dans un ordre explicite. L'index.html reste volontairement léger. */
(()=>{
 const version='20260906-architecture';
 const scripts=[
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.102.0/dist/umd/supabase.js',
  'js/supabase-auth.js',
  'js/foundation/runtime.js','js/foundation/defaults.js',
  'js/auth/session.js','js/workspace/persistence.js','js/workspace/imports.js',
  'js/stock/movements.js','js/dashboard/dashboard.js','js/sales/declarations.js',
  'js/inventory/locations.js','js/orders/commanding.js','js/orders/receptions.js',
  'js/stock/catalogue.js','js/catalogue/recipes.js','js/inventory/counting.js','js/analytics/reports.js',
  'js/administration/documents.js','js/administration/domain.js','js/administration/screens.js',
  'js/scanner/image-preparation.js','js/scanner/ocr-analysis.js','js/scanner/workflow.js',
  'js/interface/navigation.js','js/interface/settings.js','js/interface/forecasts.js','js/interface/liquid-glass.js','js/interface/application.js'
 ];
 const load=src=>new Promise((resolve,reject)=>{
  const tag=document.createElement('script');
  tag.src=src.startsWith('http')?src:src+'?v='+version;
  tag.async=false;tag.onload=resolve;tag.onerror=()=>reject(new Error('Impossible de charger '+src));
  document.head.appendChild(tag);
 });
 (async()=>{
  try{for(const src of scripts)await load(src)}
  catch(error){console.error(error);document.body.insertAdjacentHTML('afterbegin','<div role="alert" style="position:fixed;inset:16px;z-index:9999;padding:16px;background:#fff;border:1px solid #c83d52;border-radius:12px;color:#132033;font:14px system-ui">SWAY ne peut pas démarrer complètement. Rechargez la page ; si le problème persiste, contactez le support.</div>');}
 })();
})();
