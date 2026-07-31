drop policy if exists "Players can read their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can read their own Scripture Games backup"
on public.scripture_game_backups
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Players can create their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can create their own Scripture Games backup"
on public.scripture_game_backups
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can update their own Scripture Games backup"
on public.scripture_game_backups
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete their own Scripture Games backup" on public.scripture_game_backups;
create policy "Players can delete their own Scripture Games backup"
on public.scripture_game_backups
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Legacy Kingdom Quest helpers require a signed-in user. Remove anonymous RPC access
-- while preserving authenticated access for any existing Kingdom Quest clients.
revoke execute on function public.ensure_kq_profile(text) from anon;
revoke execute on function public.owns_kq_profile(uuid) from anon;
