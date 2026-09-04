-- SWAY · Invitations d'employés sécurisées.
-- Les rôles restent dans la base de données : ils ne sont jamais lus depuis les métadonnées d'un compte.

begin;

create table if not exists public.employee_invitations (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  invited_email text not null check (invited_email = lower(btrim(invited_email))),
  roles public.app_role[] not null check (cardinality(roles) > 0),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employee_invitations_establishment_status_idx
  on public.employee_invitations (establishment_id, status, created_at desc);

alter table public.employee_invitations enable row level security;
revoke all on table public.employee_invitations from anon, authenticated;
grant select on public.employee_invitations to authenticated;

drop policy if exists "Administrators can view their establishment invitations" on public.employee_invitations;
create policy "Administrators can view their establishment invitations"
on public.employee_invitations for select to authenticated
using ((select private.has_establishment_role(establishment_id, array['administrateur']::public.app_role[])));

drop trigger if exists employee_invitations_touch_updated_at on public.employee_invitations;
create trigger employee_invitations_touch_updated_at
before update on public.employee_invitations
for each row execute function private.touch_updated_at();

create or replace function public.accept_employee_invitation(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_invitation public.employee_invitations%rowtype;
  v_user_id uuid := auth.uid();
  v_email text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(email) into v_email from auth.users where id = v_user_id;
  if v_email is null then
    raise exception 'Authenticated email required';
  end if;

  select * into v_invitation
  from public.employee_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invitation not found';
  end if;
  if v_invitation.status <> 'pending' then
    raise exception 'Invitation is no longer available';
  end if;
  if v_invitation.expires_at <= now() then
    update public.employee_invitations set status = 'expired' where id = v_invitation.id;
    raise exception 'Invitation expired';
  end if;
  if v_invitation.invited_email <> v_email then
    raise exception 'This invitation belongs to another email address';
  end if;

  insert into public.memberships (establishment_id, user_id, roles, active)
  values (v_invitation.establishment_id, v_user_id, v_invitation.roles, true)
  on conflict (establishment_id, user_id) do update
  set roles = excluded.roles, active = true;

  update public.employee_invitations
  set status = 'accepted', recipient_user_id = v_user_id, accepted_at = now()
  where id = v_invitation.id;

  insert into public.audit_events (
    organization_id, establishment_id, actor_id, actor_role,
    action_type, entity_type, entity_id, previous_value, new_value, reason
  )
  select e.organization_id, v_invitation.establishment_id, v_user_id,
         coalesce(v_invitation.roles[1], 'serveur'::public.app_role),
         'employee.invitation_accepted', 'membership', v_user_id::text,
         null, jsonb_build_object('roles', v_invitation.roles),
         'Invitation accepted by the invited employee'
  from public.establishments e where e.id = v_invitation.establishment_id;

  return v_invitation.establishment_id;
end;
$$;

revoke all on function public.accept_employee_invitation(uuid) from public, anon, authenticated;

commit;
