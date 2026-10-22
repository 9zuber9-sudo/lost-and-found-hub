-- Phase 8: hold new posts for review and add a protected admin queue.
-- Run this in the Supabase SQL Editor after phase-1-setup.sql.

-- 1. Only the Supabase project owner can add trusted admins.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on table public.admins from public, anon, authenticated;

-- RLS policies use this helper to check the signed-in user's admin role.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admins as a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- New posts wait for approval. The browser cannot choose a different status.
alter table public.items alter column status set default 'pending';
revoke insert (status) on table public.items from authenticated;

-- Admins can see pending rows. Owners can see their own pending post while it waits.
drop policy if exists "Admins can read pending items" on public.items;
create policy "Admins can read pending items"
on public.items for select to authenticated
using (public.is_admin());

drop policy if exists "Owners can read their pending items" on public.items;
create policy "Owners can read their pending items"
on public.items for select to authenticated
using (user_id = (select auth.uid()) and status = 'pending');

-- Owners can still update their published posts, including marking one returned.
-- Pending posts cannot be changed by their owner to bypass admin review.
drop policy if exists "Owners can update their own items" on public.items;
create policy "Owners can update their own items"
on public.items for update to authenticated
using (
  user_id = (select auth.uid())
  and status in ('open', 'returned')
)
with check (
  user_id = (select auth.uid())
  and status in ('open', 'returned')
);

-- Admins can approve a pending post, or remove one when rejecting it.
drop policy if exists "Admins can approve pending items" on public.items;
create policy "Admins can approve pending items"
on public.items for update to authenticated
using (public.is_admin() and status = 'pending')
with check (public.is_admin() and status = 'open');

drop policy if exists "Admins can reject pending items" on public.items;
create policy "Admins can reject pending items"
on public.items for delete to authenticated
using (public.is_admin() and status = 'pending');

-- After this migration succeeds, replace the email below with your verified login
-- email and run the INSERT separately to make your account the first admin.
-- insert into public.admins (user_id)
-- select id from auth.users where lower(email) = lower('YOUR_VERIFIED_EMAIL')
-- on conflict (user_id) do nothing;
