create table if not exists public.scripture_game_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  payload jsonb not null default '{}'::jsonb,
  device_id text,
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scripture_game_backups enable row level security;

create or replace function public.set_scripture_game_backup_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scripture_game_backups_set_updated_at on public.scripture_game_backups;
create trigger scripture_game_backups_set_updated_at
before update on public.scripture_game_backups
for each row execute function public.set_scripture_game_backup_updated_at();

drop policy if exists "Players can read their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can read their own Scripture Games backup"
on public.scripture_game_backups
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Players can create their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can create their own Scripture Games backup"
on public.scripture_game_backups
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Players can update their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can update their own Scripture Games backup"
on public.scripture_game_backups
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players can delete their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can delete their own Scripture Games backup"
on public.scripture_game_backups
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on public.scripture_game_backups from anon;
grant select, insert, update, delete on public.scripture_game_backups to authenticated;
