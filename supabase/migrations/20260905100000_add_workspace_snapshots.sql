-- État synchronisé par établissement, accessible uniquement à la gestion.
create table if not exists public.workspace_snapshots (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_snapshots_state_object check (jsonb_typeof(state) = 'object')
);
alter table public.workspace_snapshots enable row level security;
revoke all on table public.workspace_snapshots from anon, authenticated;
grant select, insert, update on table public.workspace_snapshots to authenticated;
create trigger workspace_snapshots_touch_updated_at before update on public.workspace_snapshots for each row execute function private.touch_updated_at();
create policy "Management can read workspace snapshot" on public.workspace_snapshots for select to authenticated using ((select private.has_establishment_role(establishment_id, array['administrateur','gestion','direction']::public.app_role[])));
create policy "Management can create workspace snapshot" on public.workspace_snapshots for insert to authenticated with check (updated_by=(select auth.uid()) and (select private.has_establishment_role(establishment_id, array['administrateur','gestion','direction']::public.app_role[])));
create policy "Management can update workspace snapshot" on public.workspace_snapshots for update to authenticated using ((select private.has_establishment_role(establishment_id, array['administrateur','gestion','direction']::public.app_role[]))) with check (updated_by=(select auth.uid()) and (select private.has_establishment_role(establishment_id, array['administrateur','gestion','direction']::public.app_role[])));
