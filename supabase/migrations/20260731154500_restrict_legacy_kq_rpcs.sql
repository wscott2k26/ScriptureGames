revoke execute on function public.ensure_kq_profile(text) from public;
revoke execute on function public.owns_kq_profile(uuid) from public;
grant execute on function public.ensure_kq_profile(text) to authenticated;
grant execute on function public.owns_kq_profile(uuid) to authenticated;
