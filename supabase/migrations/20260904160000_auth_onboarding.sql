/* SWAY · Auth onboarding. RLS controls the public RPC. */
alter table public.organizations add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.organizations alter column owner_id set default auth.uid();
create index if not exists organizations_owner_id_idx on public.organizations(owner_id);

drop policy if exists "Account can create its own organization" on public.organizations;
create policy "Account can create its own organization" on public.organizations for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Organization owner can create establishment" on public.establishments;
create policy "Organization owner can create establishment" on public.establishments for insert to authenticated with check (exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = (select auth.uid())));
drop policy if exists "Account can join its initial workspace" on public.memberships;
create policy "Account can join its initial workspace" on public.memberships for insert to authenticated with check (user_id = (select auth.uid()) and roles @> array['administrateur']::public.app_role[] and exists (select 1 from public.establishments e join public.organizations o on o.id = e.organization_id where e.id = establishment_id and o.owner_id = (select auth.uid())));

create or replace function private.audit_initial_membership() returns trigger language plpgsql security definer set search_path = public, private as $$
begin
 if new.user_id = (select auth.uid()) and new.roles @> array['administrateur']::public.app_role[] and exists (select 1 from public.establishments e join public.organizations o on o.id = e.organization_id where e.id = new.establishment_id and o.owner_id = (select auth.uid())) then
  insert into public.audit_events (organization_id, establishment_id, actor_id, actor_role, action_type, entity_type, entity_id, previous_value, next_value, reason)
  values ((select organization_id from public.establishments where id = new.establishment_id), new.establishment_id, new.user_id, 'administrateur', 'workspace.created', 'workspace', new.establishment_id::text, null, jsonb_build_object('establishment_id', new.establishment_id), 'Initial workspace created by the account owner');
 end if;
 return new;
end;
$$;
revoke all on function private.audit_initial_membership() from public;
drop trigger if exists audit_initial_membership on public.memberships;
create trigger audit_initial_membership after insert on public.memberships for each row execute function private.audit_initial_membership();

create or replace function public.create_initial_workspace(p_organization_name text, p_establishment_name text, p_full_name text default null) returns uuid language plpgsql security invoker set search_path = public, private as $$
declare
 v_user_id uuid := auth.uid(); v_organization_id uuid; v_establishment_id uuid;
 v_organization_name text := nullif(btrim(p_organization_name), ''); v_establishment_name text := nullif(btrim(p_establishment_name), '');
begin
 if v_user_id is null then raise exception 'Authentication required'; end if;
 if v_organization_name is null or char_length(v_organization_name) > 120 then raise exception 'Organization name must contain 1 to 120 characters'; end if;
 if v_establishment_name is null or char_length(v_establishment_name) > 120 then raise exception 'Establishment name must contain 1 to 120 characters'; end if;
 if exists (select 1 from public.memberships where user_id = v_user_id) then raise exception 'This account already belongs to a workspace'; end if;
 insert into public.organizations (name, owner_id) values (v_organization_name, v_user_id) returning id into v_organization_id;
 insert into public.establishments (organization_id, name) values (v_organization_id, v_establishment_name) returning id into v_establishment_id;
 insert into public.memberships (establishment_id, user_id, roles) values (v_establishment_id, v_user_id, array['administrateur', 'gestion']::public.app_role[]);
 update public.profiles set display_name = coalesce(nullif(btrim(p_full_name), ''), display_name) where id = v_user_id;
 return v_establishment_id;
end;
$$;
revoke all on function public.create_initial_workspace(text, text, text) from public;
grant execute on function public.create_initial_workspace(text, text, text) to authenticated;
