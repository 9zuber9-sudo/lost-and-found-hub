-- Optional reward details for lost item posts.
-- Run this in the Supabase SQL Editor once before using the updated app.

alter table public.items
  add column if not exists reward_details text
  check (
    reward_details is null
    or char_length(btrim(reward_details)) between 1 and 120
  );

grant select (reward_details) on public.items to anon, authenticated;
grant insert (reward_details) on public.items to authenticated;
grant update (reward_details) on public.items to authenticated;
