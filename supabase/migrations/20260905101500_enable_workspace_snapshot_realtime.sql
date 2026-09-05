-- Autorise la diffusion des mises à jour d'état aux membres autorisés de l'établissement.
alter publication supabase_realtime add table public.workspace_snapshots;
