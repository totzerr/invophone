-- Allow signed-in users to evaluate the private helper functions used by RLS policies.
-- The functions remain unavailable to anonymous users and PUBLIC.

begin;

grant execute on function private.is_establishment_member(uuid) to authenticated;
grant execute on function private.has_establishment_role(uuid, public.app_role[]) to authenticated;

commit;
