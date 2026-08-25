-- Estrutura inicial para autenticação e progresso do Rastro SQL.
-- Execute pelo Supabase CLI ou pelo editor SQL do projeto.

create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{
    "version": 1,
    "xp": 0,
    "completedCases": [],
    "attemptsByCase": {},
    "solvedWithoutHints": [],
    "revealedHintsByCase": {},
    "streak": 0,
    "lastActiveDate": null
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_progress enable row level security;

create policy "Jogadores podem ler o próprio progresso"
on public.player_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Jogadores podem criar o próprio progresso"
on public.player_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Jogadores podem atualizar o próprio progresso"
on public.player_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists player_progress_set_updated_at on public.player_progress;
create trigger player_progress_set_updated_at
before update on public.player_progress
for each row execute function public.set_updated_at();
