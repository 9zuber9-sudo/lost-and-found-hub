-- Allow admins to delete any item post and its uploaded photo.
-- Raise the item-images bucket upload limit to 7 MB.
-- Run this in the Supabase SQL Editor after phase-8-admin-approval.sql.

update storage.buckets
set file_size_limit = 7340032
where id = 'item-images';

drop policy if exists "Admins can reject pending items" on public.items;
drop policy if exists "Admins can delete any item" on public.items;
create policy "Admins can delete any item"
on public.items for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can inspect item images for deletion" on storage.objects;
create policy "Admins can inspect item images for deletion"
on storage.objects for select to authenticated
using (bucket_id = 'item-images' and public.is_admin());

drop policy if exists "Admins can delete item images" on storage.objects;
create policy "Admins can delete item images"
on storage.objects for delete to authenticated
using (bucket_id = 'item-images' and public.is_admin());
