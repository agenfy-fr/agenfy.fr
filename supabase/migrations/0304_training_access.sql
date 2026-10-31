-- Training access vs client portal access, lesson videos in private Storage.
--
-- Until now an employee enrolled in a course through enroll_by_email() was
-- added to organization_members as 'member' and therefore saw the client
-- PORTAL of console.agenfy.fr (projects, documents, invoices, requests).
-- This migration separates the two accesses:
--
--   organization_members.role
--     owner    "Responsable"   portal + manager view of the team's training (app /manager)
--     manager  "Gestionnaire"  portal + manager view of the team's training
--     member   "Membre"        portal only
--     learner  "Apprenant"     NO portal: training only (app.agenfy.fr, own enrollments)
--
--   - is_org_member(org)  = portal access = any role EXCEPT learner. Every
--     portal policy (0003, 0100-0102: organizations, projects, documents,
--     invoices, quotes, requests, storage client-documents) keeps using it,
--     so learners lose portal data without touching those policies.
--   - is_org_manager(org) is unchanged (owner/manager): training RLS of
--     0201/0202 (enrollments, progress, certificates, cohorts…) and the
--     manager view keep working, including for the learners of their org.
--   - A user reads their own membership rows (any role) so the console can
--     tell a learner-only account to go to app.agenfy.fr.
--   - Profiles: only portal members (not learners) read the profiles of the
--     people of their organization.
--   - enroll_by_email() adds 'learner' (never 'member') when the person is not
--     yet attached to the organization; an existing role is kept.
--
-- Existing rows are NOT changed: people added as 'member' by enroll_by_email
-- before this migration keep their portal access. Review them in the console
-- (client → Accès) or with the query at the end of this file.
--
-- Lesson videos: private bucket `training-videos`, object path
-- `<course_id>/<lesson_id>/<file>`, referenced by lessons.video_path.
-- Readable by staff and by learners enrolled in the course of a lesson that
-- points at the object (short-lived signed URLs from app.agenfy.fr);
-- writable by training staff only. lessons.video_url stays for https links
-- (YouTube, Vimeo, other).
--
-- Depends on 0003, 0004, 0100, 0200-0202. NOT applied automatically.

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
alter table public.organization_members drop constraint if exists organization_members_role_check;
alter table public.organization_members add constraint organization_members_role_check
  check (role in ('owner', 'manager', 'member', 'learner'));

-- Portal access: every role except learner.
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
      and m.role <> 'learner'
  );
$$;

-- Own membership rows, whatever the role (console area guard, app).
drop policy if exists "Org members: read own rows" on public.organization_members;
create policy "Org members: read own rows" on public.organization_members
  for select to authenticated using (user_id = auth.uid());

-- Profiles of the same organization: portal members only (a learner does not
-- browse the directory of the client organization).
drop policy if exists "Profiles: self or staff can read" on public.profiles;
create policy "Profiles: self or staff can read" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_staff()
    or exists (
      select 1 from public.organization_members a
      join public.organization_members b on a.organization_id = b.organization_id
      where a.user_id = auth.uid() and a.role <> 'learner' and b.user_id = profiles.id
    )
  );

-- ---------------------------------------------------------------------------
-- enroll_by_email(): employees become learners, not portal members.
-- ---------------------------------------------------------------------------
create or replace function public.enroll_by_email(
  p_email text,
  p_course uuid,
  p_organization uuid default null,
  p_cohort uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_id uuid;
begin
  if not public.is_training_staff() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  select u.id into v_user from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  if p_cohort is not null and not exists (
    select 1 from public.cohorts c where c.id = p_cohort and c.course_id = p_course
  ) then
    raise exception 'cohort_course_mismatch' using errcode = '22023';
  end if;

  insert into public.enrollments (user_id, course_id, organization_id, cohort_id, enrolled_by)
  values (v_user, p_course, p_organization, p_cohort, auth.uid())
  on conflict (user_id, course_id) do update
    set organization_id = coalesce(excluded.organization_id, public.enrollments.organization_id),
        cohort_id = coalesce(excluded.cohort_id, public.enrollments.cohort_id),
        status = case when public.enrollments.status = 'cancelled' then 'active'
                      else public.enrollments.status end
  returning id into v_id;

  -- Training only: an existing membership (owner/manager/member) is kept as is.
  if p_organization is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (p_organization, v_user, 'learner')
    on conflict do nothing;
  end if;

  return v_id;
end;
$$;

revoke execute on function public.enroll_by_email(text, uuid, uuid, uuid) from public, anon;
grant execute on function public.enroll_by_email(text, uuid, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Lessons: uploaded video (private Storage) + ordering helpers
-- ---------------------------------------------------------------------------
alter table public.lessons add column if not exists video_path text;
alter table public.lessons drop constraint if exists lessons_video_path_check;
alter table public.lessons add constraint lessons_video_path_check
  check (video_path is null or (video_path like course_id::text || '/' || id::text || '/%' and video_path !~ '\.\.'));
alter table public.lessons drop constraint if exists lessons_single_video_check;
alter table public.lessons add constraint lessons_single_video_check
  check (video_url is null or video_path is null);

create unique index if not exists lessons_video_path_uniq on public.lessons(video_path) where video_path is not null;

-- Swap a module (or a lesson inside its module) with its neighbour, in one
-- transaction (positions are unique). Security invoker: RLS applies, so only
-- training staff can move anything. p_direction: -1 = up, 1 = down.
create or replace function public.move_course_module(p_module uuid, p_direction integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_course uuid;
  v_pos integer;
  v_other uuid;
  v_other_pos integer;
begin
  if not public.is_training_staff() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  select course_id, position into v_course, v_pos from public.course_modules where id = p_module;
  if v_course is null then
    return false;
  end if;
  if p_direction < 0 then
    select id, position into v_other, v_other_pos from public.course_modules
    where course_id = v_course and position < v_pos order by position desc limit 1;
  else
    select id, position into v_other, v_other_pos from public.course_modules
    where course_id = v_course and position > v_pos order by position asc limit 1;
  end if;
  if v_other is null then
    return false;
  end if;
  update public.course_modules set position = -1 - v_pos where id = p_module;
  update public.course_modules set position = v_pos where id = v_other;
  update public.course_modules set position = v_other_pos where id = p_module;
  return true;
end;
$$;

create or replace function public.move_lesson(p_lesson uuid, p_direction integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_module uuid;
  v_pos integer;
  v_other uuid;
  v_other_pos integer;
begin
  if not public.is_training_staff() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  select module_id, position into v_module, v_pos from public.lessons where id = p_lesson;
  if v_module is null then
    return false;
  end if;
  if p_direction < 0 then
    select id, position into v_other, v_other_pos from public.lessons
    where module_id = v_module and position < v_pos order by position desc limit 1;
  else
    select id, position into v_other, v_other_pos from public.lessons
    where module_id = v_module and position > v_pos order by position asc limit 1;
  end if;
  if v_other is null then
    return false;
  end if;
  update public.lessons set position = -1 - v_pos where id = p_lesson;
  update public.lessons set position = v_pos where id = v_other;
  update public.lessons set position = v_other_pos where id = p_lesson;
  return true;
end;
$$;

revoke execute on function public.move_course_module(uuid, integer) from public, anon;
revoke execute on function public.move_lesson(uuid, integer) from public, anon;
grant execute on function public.move_course_module(uuid, integer) to authenticated;
grant execute on function public.move_lesson(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for lesson videos.
-- 50 MB per file = Supabase free plan global limit; raise both the global
-- limit (Storage settings, paid plan) and this bucket limit together.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('training-videos', 'training-videos', false, 52428800,
        array['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'])
on conflict (id) do nothing;

drop policy if exists "Training videos: staff or enrolled read" on storage.objects;
create policy "Training videos: staff or enrolled read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'training-videos'
    and (
      public.is_staff()
      or exists (
        select 1 from public.lessons l
        where l.video_path = storage.objects.name
          and public.is_enrolled(l.course_id)
      )
    )
  );

drop policy if exists "Training videos: training staff insert" on storage.objects;
create policy "Training videos: training staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'training-videos' and public.is_training_staff());

drop policy if exists "Training videos: training staff update" on storage.objects;
create policy "Training videos: training staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'training-videos' and public.is_training_staff())
  with check (bucket_id = 'training-videos' and public.is_training_staff());

drop policy if exists "Training videos: training staff delete" on storage.objects;
create policy "Training videos: training staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'training-videos' and public.is_training_staff());

-- ---------------------------------------------------------------------------
-- Review (manual, read-only): portal members who were probably added by
-- enroll_by_email() before this migration (they have enrollments in the
-- organization and were never explicitly invited from a contact). Switch them
-- to 'learner' from the console (client → Accès) if they should not see the
-- client portal.
--
--   select o.name, u.email, m.role, m.created_at
--   from public.organization_members m
--   join public.organizations o on o.id = m.organization_id
--   join auth.users u on u.id = m.user_id
--   where m.role = 'member'
--     and exists (select 1 from public.enrollments e
--                 where e.user_id = m.user_id and e.organization_id = m.organization_id)
--   order by o.name, u.email;
-- ---------------------------------------------------------------------------
