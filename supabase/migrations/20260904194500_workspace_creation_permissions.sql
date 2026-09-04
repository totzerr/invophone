-- Complete the authenticated first-workspace flow without bypassing RLS.

begin;

grant insert on table public.organizations, public.establishments, public.memberships to authenticated;

create or replace function private.is_organization_owner(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.organizations o where o.id = target_organization_id and o.owner_id = (select auth.uid()));
$$;
create or replace function private.is_establishment_owner(target_establishment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.establishments e join public.organizations o on o.id = e.organization_id where e.id = target_establishment_id and o.owner_id = (select auth.uid()));
$$;
revoke all on function private.is_organization_owner(uuid) from public, anon, authenticated;
revoke all on function private.is_establishment_owner(uuid) from public, anon, authenticated;
grant execute on function private.is_organization_owner(uuid) to authenticated;
grant execute on function private.is_establishment_owner(uuid) to authenticated;

drop policy if exists "Owners can view their organization" on public.organizations;
create policy "Owners can view their organization" on public.organizations for select to authenticated using ((select private.is_organization_owner(id)));
drop policy if exists "Organization owners can view their establishment" on public.establishments;
create policy "Organization owners can view their establishment" on public.establishments for select to authenticated using ((select private.is_organization_owner(organization_id)));
drop policy if exists "Organization owner can create establishment" on public.establishments;
create policy "Organization owner can create establishment" on public.establishments for insert to authenticated with check ((select private.is_organization_owner(organization_id)));
drop policy if exists "Account can join its initial workspace" on public.memberships;
create policy "Account can join its initial workspace" on public.memberships for insert to authenticated with check (user_id = (select auth.uid()) and roles @> array['administrateur']::public.app_role[] and (select private.is_establishment_owner(establishment_id)));

create or replace function public.create_initial_workspace(p_organization_name text, p_establishment_name text, p_full_name text default null) returns uuid language plpgsql security invoker set search_path = public, private as $$
declare
 v_user_id uuid := auth.uid(); v_organization_id uuid := gen_random_uuid(); v_establishment_id uuid := gen_random_uuid();
 v_organization_name text := nullif(btrim(p_organization_name), ''); v_establishment_name text := nullif(btrim(p_establishment_name), '');
begin
 if v_user_id is null then raise exception 'Authentication required'; end if;
 if v_organization_name is null or char_length(v_organization_name) > 120 then raise exception 'Organization name must contain 1 to 120 characters'; end if;
 if v_establishment_name is null or char_length(v_establishment_name) > 120 then raise exception 'Establishment name must contain 1 to 120 characters'; end if;
 if exists (select 1 from public.memberships where user_id = v_user_id) then raise exception 'This account already belongs to a workspace'; end if;
 insert into public.organizations (id, name, owner_id) values (v_organization_id, v_organization_name, v_user_id);
 insert into public.establishments (id, organization_id, name) values (v_establishment_id, v_organization_id, v_establishment_name);
 insert into public.memberships (establishment_id, user_id, roles) values (v_establishment_id, v_user_id, array['administrateur', 'gestion']::public.app_role[]);
 update public.profiles set display_name = coalesce(nullif(btrim(p_full_name), ''), display_name) where id = v_user_id;
 return v_establishment_id;
end;
$$;
revoke all on function public.create_initial_workspace(text, text, text) from public, anon;
grant execute on function public.create_initial_workspace(text, text, text) to authenticated;

commit;
