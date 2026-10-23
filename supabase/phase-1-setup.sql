-- Campus Lost and Found: Prompt 1 database setup
-- Paste this whole file into Supabase SQL Editor and run it once.

-- 1. Create the items table.
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text,
  category text,
  location text,
  date_happened date,
  reward_details text check (reward_details is null or char_length(btrim(reward_details)) between 1 and 120),
  image_url text,
  contact_info text,
  hidden_detail text,
  status text not null default 'open'
    check (status in ('pending', 'open', 'returned')),
  created_at timestamptz not null default now()
);

-- 2. Turn on Row Level Security.
alter table public.items enable row level security;

-- 3. Add row policies. RLS decides which rows each user may access.
drop policy if exists "Anyone can read open or returned items" on public.items;
create policy "Anyone can read open or returned items"
on public.items for select to anon, authenticated
using (status in ('open', 'returned'));

drop policy if exists "Logged-in users can insert their own items" on public.items;
create policy "Logged-in users can insert their own items"
on public.items for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Owners can update their own items" on public.items;
create policy "Owners can update their own items"
on public.items for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Owners can delete their own items" on public.items;
create policy "Owners can delete their own items"
on public.items for delete to authenticated
using (user_id = (select auth.uid()));

-- RLS filters rows, not columns. Keep private fields out of direct table reads.
revoke all on table public.items from public, anon, authenticated;
grant select (
  id, user_id, type, title, description, category, location,
  date_happened, image_url, reward_details, status, created_at
) on public.items to anon, authenticated;
grant insert (
  type, title, description, category, location, date_happened,
  image_url, reward_details, contact_info, hidden_detail, status
) on public.items to authenticated;
grant update (
  type, title, description, category, location, date_happened,
  image_url, reward_details, contact_info, hidden_detail, status
) on public.items to authenticated;
grant delete on public.items to authenticated;

-- Logged-in users can fetch contact details for a visible item through this RPC.
create or replace function public.get_item_contact(p_item_id uuid)
returns table (contact_info text)
language sql stable security definer set search_path = ''
as $$
  select i.contact_info from public.items as i
  where i.id = p_item_id
    and i.status in ('open', 'returned')
    and (select auth.uid()) is not null;
$$;
revoke all on function public.get_item_contact(uuid) from public, anon;
grant execute on function public.get_item_contact(uuid) to authenticated;

-- Only the poster can fetch their own found item's hidden ownership detail.
create or replace function public.get_my_item_hidden_detail(p_item_id uuid)
returns table (hidden_detail text)
language sql stable security definer set search_path = ''
as $$
  select i.hidden_detail from public.items as i
  where i.id = p_item_id
    and i.type = 'found'
    and i.user_id = (select auth.uid());
$$;
revoke all on function public.get_my_item_hidden_detail(uuid) from public, anon;
grant execute on function public.get_my_item_hidden_detail(uuid) to authenticated;

-- Create a public image bucket, limited to 7 MB and common image formats.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images', 'item-images', true, 7340032,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Only logged-in users can upload files into this bucket.
drop policy if exists "Logged-in users can upload item images" on storage.objects;
create policy "Logged-in users can upload item images"
on storage.objects for insert to authenticated
with check (bucket_id = 'item-images');
