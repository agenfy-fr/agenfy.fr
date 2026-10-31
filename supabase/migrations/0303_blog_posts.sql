-- Blog (www.agenfy.fr/blog) managed from the console (/blog).
--
-- Articles are written in the console with a WYSIWYG editor that stores
-- Markdown (`content_md`). The public site reads them with the ANON key:
-- only published articles whose publication date is reached are visible
-- (`published_at` in the future = scheduled). Articles hard-coded in
-- apps/web/src/lib/blog-posts.tsx keep working; on a slug conflict the
-- database version wins.
--
-- Access:
--   anon / authenticated -> published articles only (status = 'published' and published_at <= now())
--   staff (is_staff())   -> every article (drafts, scheduled, archived)
--   blog writers         -> owner, admin, consultant, sales (staff_has_role) — mirrors
--                           BLOG_WRITE_ROLES in apps/console/src/lib/access-control.ts
--
-- Images: public Storage bucket `blog-images` (public URL read, staff writers
-- upload, raster images only — no SVG — 5 MB max).
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`,
-- after 0003, 0004 and 0100 (staff_has_role).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  -- Same categories as the static posts (BlogPost["category"] in apps/web).
  category text not null default 'IA'
    check (category in ('Data', 'IA', 'Cloud', 'Conseil', 'Tech')),
  -- Key of AUTHORS in apps/web/src/lib/site.ts.
  author_slug text not null default 'evan-masse'
    check (author_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(author_slug) <= 60),
  content_md text not null default '' check (char_length(content_md) <= 200000),
  -- Object paths inside the `blog-images` bucket (not full URLs).
  cover_image_path text
    check (cover_image_path is null or (cover_image_path ~ '^[A-Za-z0-9][A-Za-z0-9/._-]*$' and char_length(cover_image_path) <= 300 and cover_image_path !~ '\.\.')),
  cover_image_alt text check (char_length(cover_image_alt) <= 300),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  -- Publication date; in the future = scheduled. Set to now() on publish when empty.
  published_at timestamptz,
  featured boolean not null default false,
  -- Reading time in minutes; null = computed from the content by the site.
  reading_minutes integer check (reading_minutes is null or reading_minutes between 1 and 240),
  -- SEO
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  focus_keyword text check (char_length(focus_keyword) <= 100),
  canonical_url text check (canonical_url is null or (canonical_url ~ '^https://[^\s]+$' and char_length(canonical_url) <= 500)),
  og_image_path text
    check (og_image_path is null or (og_image_path ~ '^[A-Za-z0-9][A-Za-z0-9/._-]*$' and char_length(og_image_path) <= 300 and og_image_path !~ '\.\.')),
  noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_published_has_date check (status <> 'published' or published_at is not null)
);

create index if not exists blog_posts_public_idx
  on public.blog_posts (published_at desc) where status = 'published';

-- Publishing without a date publishes now.
create or replace function public.blog_posts_default_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_published_at on public.blog_posts;
create trigger blog_posts_published_at
  before insert or update of status, published_at on public.blog_posts
  for each row execute function public.blog_posts_default_published_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.blog_posts enable row level security;
revoke all on table public.blog_posts from anon;
grant select on table public.blog_posts to anon;
grant select, insert, update, delete on table public.blog_posts to authenticated;

drop policy if exists "Blog posts: public read published" on public.blog_posts;
create policy "Blog posts: public read published" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

drop policy if exists "Blog posts: staff read" on public.blog_posts;
create policy "Blog posts: staff read" on public.blog_posts
  for select to authenticated
  using (public.is_staff());

drop policy if exists "Blog posts: writers insert" on public.blog_posts;
create policy "Blog posts: writers insert" on public.blog_posts
  for insert to authenticated
  with check (public.staff_has_role(array['consultant', 'sales']));

drop policy if exists "Blog posts: writers update" on public.blog_posts;
create policy "Blog posts: writers update" on public.blog_posts
  for update to authenticated
  using (public.staff_has_role(array['consultant', 'sales']))
  with check (public.staff_has_role(array['consultant', 'sales']));

drop policy if exists "Blog posts: writers delete" on public.blog_posts;
create policy "Blog posts: writers delete" on public.blog_posts
  for delete to authenticated
  using (public.staff_has_role(array['consultant', 'sales']));

-- ---------------------------------------------------------------------------
-- Storage: public bucket for article images (served by the public URL
-- /storage/v1/object/public/blog-images/<path>, no read policy needed).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images', 'blog-images', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Listing through the API stays staff-only (public URLs do not need it).
drop policy if exists "Blog images: staff read" on storage.objects;
create policy "Blog images: staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'blog-images' and public.is_staff());

drop policy if exists "Blog images: writers insert" on storage.objects;
create policy "Blog images: writers insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images' and public.staff_has_role(array['consultant', 'sales']));

drop policy if exists "Blog images: writers update" on storage.objects;
create policy "Blog images: writers update" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images' and public.staff_has_role(array['consultant', 'sales']));

drop policy if exists "Blog images: writers delete" on storage.objects;
create policy "Blog images: writers delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images' and public.staff_has_role(array['consultant', 'sales']));
