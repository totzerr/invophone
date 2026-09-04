-- Sway : socle de données multi-établissements.
-- Cette migration ne crée aucune donnée métier : elle prépare uniquement les tables et les règles d'accès.

begin;

create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace) then
    create type public.app_role as enum ('administrateur', 'gestion', 'direction', 'barman', 'serveur', 'cuisine');
  end if;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  timezone text not null default 'Europe/Paris',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  roles public.app_role[] not null default array['barman']::public.app_role[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_roles_not_empty check (cardinality(roles) > 0),
  constraint memberships_establishment_user_unique unique (establishment_id, user_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  establishment_id uuid references public.establishments(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role public.app_role,
  action_type text not null check (char_length(trim(action_type)) between 1 and 120),
  entity_type text not null check (char_length(trim(entity_type)) between 1 and 120),
  entity_id text,
  previous_value jsonb,
  new_value jsonb,
  reason text,
  occurred_at timestamptz not null default now()
);

create index if not exists establishments_organization_id_idx on public.establishments (organization_id);
create index if not exists memberships_establishment_id_idx on public.memberships (establishment_id);
create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists audit_events_organization_occurred_at_idx on public.audit_events (organization_id, occurred_at desc);
create index if not exists audit_events_establishment_occurred_at_idx on public.audit_events (establishment_id, occurred_at desc);
create index if not exists audit_events_actor_id_idx on public.audit_events (actor_id);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function private.is_establishment_member(target_establishment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.establishment_id = target_establishment_id
      and m.user_id = (select auth.uid())
      and m.active
  );
$$;

create or replace function private.has_establishment_role(target_establishment_id uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.establishment_id = target_establishment_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.roles && allowed_roles
  );
$$;

revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function private.is_establishment_member(uuid) from public, anon, authenticated;
revoke all on function private.has_establishment_role(uuid, public.app_role[]) from public, anon, authenticated;
grant execute on function private.is_establishment_member(uuid) to authenticated;
grant execute on function private.has_establishment_role(uuid, public.app_role[]) to authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function private.touch_updated_at();

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at before update on public.organizations
for each row execute function private.touch_updated_at();

drop trigger if exists establishments_touch_updated_at on public.establishments;
create trigger establishments_touch_updated_at before update on public.establishments
for each row execute function private.touch_updated_at();

drop trigger if exists memberships_touch_updated_at on public.memberships;
create trigger memberships_touch_updated_at before update on public.memberships
for each row execute function private.touch_updated_at();

drop trigger if exists auth_user_profile_created on auth.users;
create trigger auth_user_profile_created
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

alter table public.organizations enable row level security;
alter table public.establishments enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_events enable row level security;

revoke all on table public.organizations, public.establishments, public.profiles, public.memberships, public.audit_events from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.organizations, public.establishments, public.memberships, public.audit_events to authenticated;
grant select, update on public.profiles to authenticated;

create policy "Profiles are visible to their owner"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Profiles can be updated by their owner"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Members can view their organization"
on public.organizations for select to authenticated
using (
  exists (
    select 1 from public.establishments e
    where e.organization_id = organizations.id
      and (select private.is_establishment_member(e.id))
  )
);

create policy "Members can view their establishment"
on public.establishments for select to authenticated
using ((select private.is_establishment_member(id)));

create policy "Members can view their own membership"
on public.memberships for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.has_establishment_role(establishment_id, array['administrateur']::public.app_role[]))
);

create policy "Management can consult the audit history"
on public.audit_events for select to authenticated
using (
  establishment_id is not null
  and (select private.has_establishment_role(establishment_id, array['administrateur', 'gestion', 'direction']::public.app_role[]))
);

comment on table public.audit_events is 'Journal d''audit. Les clients ne peuvent ni créer, modifier, ni supprimer ces événements.';
comment on table public.memberships is 'Un membre peut posséder plusieurs rôles dans un établissement.';

commit;
