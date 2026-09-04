/* SWAY · Auth Supabase
   This module contains the public project URL/key only. RLS policies protect data;
   privileged Supabase keys are never sent to the browser. */
(function(){
 'use strict';
 const url='https://fjwrpbnhigyzzvposkhi.supabase.co';
 const key='sb_publishable_I6LooCk90KSTO6pbmogRlg_bZAQAFit';
 const roleMap={administrateur:'admin',gestion:'gestion',direction:'direction',barman:'barman',serveur:'serveur',cuisine:'cuisine'};
 let client=null,recovery=String(location.hash||'').includes('type=recovery');
 try{
  if(window.supabase&&typeof window.supabase.createClient==='function'){
   client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
   client.auth.onAuthStateChange(function(event){if(event==='PASSWORD_RECOVERY')recovery=true});
  }
 }catch(error){console.warn('Connexion Sway indisponible :',error)}
 const errorMessage=error=>String((error&&error.message)||'Connexion impossible. Réessayez.');
 const identity=async()=>{
  if(!client)return null;
  const result=await client.auth.getSession();
  if(result.error||!result.data.session)return null;
  const authSession=result.data.session,user=authSession.user;
  const profileResult=await client.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
  const membershipResult=await client.from('memberships').select('establishment_id,roles').eq('user_id',user.id).order('created_at',{ascending:true}).limit(1).maybeSingle();
  if(profileResult.error||membershipResult.error)throw new Error(errorMessage(profileResult.error||membershipResult.error));
  const membership=membershipResult.data;
  let establishment=null;
  if(membership&&membership.establishment_id){
   const establishmentResult=await client.from('establishments').select('name,organization_id').eq('id',membership.establishment_id).maybeSingle();
   if(establishmentResult.error)throw new Error(errorMessage(establishmentResult.error));
   establishment=establishmentResult.data;
  }
  const remoteRoles=(membership&&Array.isArray(membership.roles)?membership.roles:[]).map(function(role){return roleMap[role]}).filter(Boolean);
  return {email:user.email||'',nom:(profileResult.data&&profileResult.data.display_name)||(user.user_metadata&&user.user_metadata.full_name)||user.email||'',etabId:membership&&membership.establishment_id||'',etabNom:establishment&&establishment.name||'',organizationId:establishment&&establishment.organization_id||'',roles:remoteRoles,role:remoteRoles[0]||'gestion',supabase:true,needsWorkspace:!membership,userId:user.id};
 };
 const signup=async values=>{
  if(!client)return {error:'Le service de connexion est momentanément indisponible.'};
  const result=await client.auth.signUp({email:values.email,password:values.password,options:{emailRedirectTo:location.origin+location.pathname,data:{full_name:values.fullName,organization_name:values.organizationName,establishment_name:values.establishmentName}}});
  if(result.error)return {error:errorMessage(result.error)};
  if(!result.data.session)return {confirmation:true};
  return finalizeWorkspace(values);
 };
 const signin=async values=>{
  if(!client)return {error:'Le service de connexion est momentanément indisponible.'};
  const result=await client.auth.signInWithPassword({email:values.email,password:values.password});
  return result.error?{error:errorMessage(result.error)}:{ok:true};
 };
 const reset=async email=>{
  if(!client)return {error:'Le service de connexion est momentanément indisponible.'};
  const result=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  return result.error?{error:errorMessage(result.error)}:{ok:true};
 };
 const updatePassword=async password=>{
  if(!client)return {error:'Le service de connexion est momentanément indisponible.'};
  const result=await client.auth.updateUser({password:password});
  return result.error?{error:errorMessage(result.error)}:{ok:true};
 };
 const finalizeWorkspace=async values=>{
  if(!client)return {error:'Le service de connexion est momentanément indisponible.'};
  const sessionResult=await client.auth.getSession();
  const user=sessionResult.data&&sessionResult.data.session&&sessionResult.data.session.user;
  if(!user)return {error:'Confirmez d’abord votre adresse e-mail, puis reconnectez-vous.'};
  const metadata=user.user_metadata||{};
  const organizationName=(values&&values.organizationName)||metadata.organization_name||'';
  const establishmentName=(values&&values.establishmentName)||metadata.establishment_name||'';
  const fullName=(values&&values.fullName)||metadata.full_name||'';
  const result=await client.rpc('create_initial_workspace',{p_organization_name:organizationName,p_establishment_name:establishmentName,p_full_name:fullName});
  if(result.error){
   const current=await identity();
   if(current&&!current.needsWorkspace)return {ok:true};
   return {error:errorMessage(result.error)};
  }
  return {ok:true};
 };
 window.SwaySupabaseAuth={available:function(){return !!client},identity:identity,signup:signup,signin:signin,reset:reset,updatePassword:updatePassword,finalizeWorkspace:finalizeWorkspace,isRecovery:function(){return recovery},signout:async function(){if(client)await client.auth.signOut()}};
})();
