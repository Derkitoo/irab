create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{"schemaVersion":1,"lessons":[],"questions":[],"wrongs":{},"cards":{},"activity":[],"preferences":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learning_progress enable row level security;

grant select, insert, update, delete on public.learning_progress to authenticated;
revoke all on public.learning_progress from anon;

drop policy if exists "Users can read their own learning progress" on public.learning_progress;
create policy "Users can read their own learning progress"
on public.learning_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own learning progress" on public.learning_progress;
create policy "Users can insert their own learning progress"
on public.learning_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own learning progress" on public.learning_progress;
create policy "Users can update their own learning progress"
on public.learning_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own learning progress" on public.learning_progress;
create policy "Users can delete their own learning progress"
on public.learning_progress for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Suppression de compte demandée par l'utilisateur lui-même.
-- La fonction s'exécute avec des droits élevés mais n'agit jamais que sur
-- auth.uid() : aucune ligne appartenant à un autre compte n'est atteignable.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentification requise' using errcode = '42501';
  end if;

  delete from public.learning_progress where user_id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
