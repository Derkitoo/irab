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
