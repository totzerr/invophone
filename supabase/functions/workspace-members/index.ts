import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedRoles = new Set(['administrateur', 'gestion', 'direction', 'barman', 'serveur', 'cuisine']);
const allowedRedirects = new Set([
  'https://totzerr.github.io/invodesktop/',
  'https://totzerr.github.io/invophone/'
]);

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin === 'https://totzerr.github.io' ? origin : 'https://totzerr.github.io',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}
function reply(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: cors(origin) });
}
function safeRoles(value: unknown) {
  const roles = Array.isArray(value) ? value.filter((role): role is string => typeof role === 'string' && allowedRoles.has(role)) : [];
  return [...new Set(roles)];
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, origin);

  const url = Deno.env.get('SUPABASE_URL')!;
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authorization = request.headers.get('authorization');
  if (!authorization) return reply({ error: 'Authentication required' }, 401, origin);

  const callerClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return reply({ error: 'Session invalid' }, 401, origin);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400, origin); }
  const action = body.action;
  if (action === 'accept_invitation') {
    const inviteToken = typeof body.inviteToken === 'string' ? body.inviteToken : '';
    const email = (userData.user.email || '').trim().toLowerCase();
    const { data: invitation, error } = await adminClient
      .from('employee_invitations')
      .select('id,establishment_id,invited_email,roles,status,expires_at')
      .eq('token', inviteToken)
      .maybeSingle();
    if (error || !invitation) return reply({ error: 'Invitation introuvable.' }, 404, origin);
    if (invitation.status !== 'pending' || new Date(invitation.expires_at).getTime() <= Date.now()) return reply({ error: 'Cette invitation n’est plus disponible.' }, 400, origin);
    if (invitation.invited_email !== email) return reply({ error: 'Cette invitation appartient à une autre adresse e-mail.' }, 403, origin);
    const { error: memberError } = await adminClient.from('memberships').upsert({ establishment_id: invitation.establishment_id, user_id: userData.user.id, roles: invitation.roles, active: true }, { onConflict: 'establishment_id,user_id' });
    if (memberError) return reply({ error: memberError.message }, 400, origin);
    await adminClient.from('employee_invitations').update({ status: 'accepted', recipient_user_id: userData.user.id, accepted_at: new Date().toISOString() }).eq('id', invitation.id);
    const { data: establishment } = await adminClient.from('establishments').select('organization_id').eq('id', invitation.establishment_id).single();
    await adminClient.from('audit_events').insert({ organization_id: establishment?.organization_id, establishment_id: invitation.establishment_id, actor_id: userData.user.id, actor_role: invitation.roles[0] || 'serveur', action_type: 'employee.invitation_accepted', entity_type: 'membership', entity_id: userData.user.id, previous_value: null, new_value: { roles: invitation.roles }, reason: 'Invitation accepted by the invited employee' });
    return reply({ ok: true, establishmentId: invitation.establishment_id }, 200, origin);
  }
  const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId : '';
  if (!establishmentId) return reply({ error: 'Establishment required' }, 400, origin);

  const { data: callerMembership } = await adminClient
    .from('memberships')
    .select('id,establishment_id,roles')
    .eq('establishment_id', establishmentId)
    .eq('user_id', userData.user.id)
    .eq('active', true)
    .contains('roles', ['administrateur'])
    .maybeSingle();
  if (!callerMembership) return reply({ error: 'Administrator role required' }, 403, origin);

  if (action === 'list') {
    const { data: memberships, error } = await adminClient
      .from('memberships')
      .select('id,user_id,roles,active,created_at,profiles(display_name)')
      .eq('establishment_id', establishmentId)
      .order('created_at');
    if (error) return reply({ error: error.message }, 400, origin);
    const { data: invitations, error: invitationError } = await adminClient
      .from('employee_invitations')
      .select('id,invited_email,roles,status,expires_at,created_at')
      .eq('establishment_id', establishmentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (invitationError) return reply({ error: invitationError.message }, 400, origin);
    const users = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailById = new Map((users.data.users || []).map((user) => [user.id, user.email || '']));
    return reply({
      members: (memberships || []).map((member: Record<string, unknown>) => ({
        id: member.id, userId: member.user_id, roles: member.roles, active: member.active,
        createdAt: member.created_at, email: emailById.get(member.user_id as string) || '',
        name: (member.profiles as { display_name?: string } | null)?.display_name || ''
      })),
      invitations: invitations || []
    }, 200, origin);
  }

  if (action === 'invite') {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 160) : '';
    const roles = safeRoles(body.roles);
    const redirectTo = typeof body.redirectTo === 'string' && allowedRedirects.has(body.redirectTo) ? body.redirectTo : 'https://totzerr.github.io/invodesktop/';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !roles.length) return reply({ error: 'Email and at least one role are required' }, 400, origin);

    const { data: existingInvitation } = await adminClient
      .from('employee_invitations')
      .select('id')
      .eq('establishment_id', establishmentId)
      .eq('invited_email', email)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingInvitation) return reply({ error: 'An invitation is already pending for this email' }, 409, origin);

    const { data: invitation, error: invitationError } = await adminClient
      .from('employee_invitations')
      .insert({ establishment_id: establishmentId, invited_email: email, roles, invited_by: userData.user.id })
      .select('id,token')
      .single();
    if (invitationError || !invitation) return reply({ error: invitationError?.message || 'Invitation unavailable' }, 400, origin);

    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${redirectTo}?invite=${invitation.token}`,
      data: { full_name: fullName }
    });
    if (inviteError) {
      await adminClient.from('employee_invitations').delete().eq('id', invitation.id);
      return reply({ error: inviteError.message }, 400, origin);
    }
    await adminClient.from('audit_events').insert({
      organization_id: (await adminClient.from('establishments').select('organization_id').eq('id', establishmentId).single()).data?.organization_id,
      establishment_id: establishmentId, actor_id: userData.user.id, actor_role: 'administrateur',
      action_type: 'employee.invited', entity_type: 'invitation', entity_id: invitation.id,
      previous_value: null, new_value: { email, roles }, reason: 'Employee invitation sent by an administrator'
    });
    return reply({ ok: true }, 200, origin);
  }

  const memberId = typeof body.memberId === 'string' ? body.memberId : '';
  const { data: target, error: targetError } = await adminClient
    .from('memberships').select('id,user_id,roles,active').eq('id', memberId).eq('establishment_id', establishmentId).maybeSingle();
  if (targetError || !target) return reply({ error: 'Member not found' }, 404, origin);

  const currentAdmins = async () => (await adminClient.from('memberships').select('id').eq('establishment_id', establishmentId).eq('active', true).contains('roles', ['administrateur'])).data || [];
  if (action === 'update_roles') {
    const roles = safeRoles(body.roles);
    if (!roles.length) return reply({ error: 'At least one role is required' }, 400, origin);
    if ((target.roles as string[]).includes('administrateur') && !roles.includes('administrateur') && (await currentAdmins()).length <= 1) return reply({ error: 'The last administrator must retain this role' }, 400, origin);
    const { error } = await adminClient.from('memberships').update({ roles }).eq('id', target.id);
    if (error) return reply({ error: error.message }, 400, origin);
    await adminClient.from('audit_events').insert({ organization_id: (await adminClient.from('establishments').select('organization_id').eq('id', establishmentId).single()).data?.organization_id, establishment_id: establishmentId, actor_id: userData.user.id, actor_role: 'administrateur', action_type: 'employee.roles_changed', entity_type: 'membership', entity_id: target.id, previous_value: { roles: target.roles }, new_value: { roles }, reason: 'Roles changed by an administrator' });
    return reply({ ok: true }, 200, origin);
  }
  if (action === 'remove') {
    if (target.user_id === userData.user.id) return reply({ error: 'You cannot remove your own access' }, 400, origin);
    if ((target.roles as string[]).includes('administrateur') && (await currentAdmins()).length <= 1) return reply({ error: 'The last administrator cannot be removed' }, 400, origin);
    const { error } = await adminClient.from('memberships').update({ active: false }).eq('id', target.id);
    if (error) return reply({ error: error.message }, 400, origin);
    await adminClient.from('audit_events').insert({ organization_id: (await adminClient.from('establishments').select('organization_id').eq('id', establishmentId).single()).data?.organization_id, establishment_id: establishmentId, actor_id: userData.user.id, actor_role: 'administrateur', action_type: 'employee.removed', entity_type: 'membership', entity_id: target.id, previous_value: { active: true, roles: target.roles }, new_value: { active: false }, reason: 'Access removed by an administrator' });
    return reply({ ok: true }, 200, origin);
  }
  return reply({ error: 'Unknown action' }, 400, origin);
});
