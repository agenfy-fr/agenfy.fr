-- app.agenfy.fr — training platform (LMS) schema.
--
-- Builds on 0003_core_identity.sql (profiles, staff, organizations,
-- organization_members, is_staff(), is_org_member(), is_org_manager()).
-- RLS policies live in 0201, RPC functions in 0202, seed content in 0250.
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text,
  category text not null default 'essentiels'
    check (category in ('essentiels', 'technique', 'management')),
  level text not null default 'debutant'
    check (level in ('debutant', 'intermediaire', 'avance')),
  audience text not null,                      -- public visé
  prerequisites text not null,                 -- prérequis
  objectives text[] not null default '{}',     -- objectifs pédagogiques (évaluables)
  teaching_methods text,                       -- moyens et méthodes pédagogiques
  evaluation_methods text,                     -- modalités d'évaluation
  accessibility text,                          -- accessibilité / handicap (indicateur 26)
  access_delay text,                           -- délais d'accès (indicateur 1)
  duration_hours numeric(5, 1) not null check (duration_hours > 0),
  duration_label text,                         -- ex. "1 jour (7 h)"
  modality text not null
    check (modality in ('presentiel', 'distanciel', 'hybride', 'elearning')),
  price_ht_cents integer check (price_ht_cents is null or price_ht_cents >= 0), -- prix indicatif HT
  price_label text,                            -- ex. "par groupe (jusqu'à 12 personnes)"
  max_group_size integer check (max_group_size is null or max_group_size > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  version integer not null default 1,          -- programme versionné (indicateur 1 : mise à jour)
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null,
  title text not null,
  summary text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position integer not null,
  title text not null,
  objectives text[] not null default '{}',
  content_md text not null default '',
  exercise_md text,
  video_url text check (video_url is null or video_url ~ '^https://'),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (module_id, position)
);

create index if not exists lessons_module_idx on public.lessons(module_id);
create index if not exists course_modules_course_idx on public.course_modules(course_id);

-- ---------------------------------------------------------------------------
-- Quizzes (one per module). Answer keys are hidden from learners by
-- column privileges (see 0201) and scored server-side (see 0202).
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete cascade,
  title text not null,
  pass_score integer not null default 70 check (pass_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position integer not null,
  prompt text not null,
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) >= 2),
  correct_indexes integer[] not null check (cardinality(correct_indexes) >= 1),
  multiple boolean not null default false,
  explanation text,
  created_at timestamptz not null default now(),
  unique (quiz_id, position)
);

-- ---------------------------------------------------------------------------
-- Cohorts & live sessions (classes virtuelles / présentiel)
-- A session is one half-day slot: attendance is signed per session.
-- ---------------------------------------------------------------------------
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null, -- intra-entreprise
  name text not null,
  trainer_id uuid references public.staff(user_id) on delete set null,
  modality text not null default 'distanciel'
    check (modality in ('presentiel', 'distanciel', 'hybride', 'elearning')),
  location text,
  start_date date,
  end_date date,
  status text not null default 'planned'
    check (status in ('planned', 'running', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  half_day text not null default 'am' check (half_day in ('am', 'pm')),
  trainer_id uuid references public.staff(user_id) on delete set null,
  location text,
  meeting_url text check (meeting_url is null or meeting_url ~ '^https://'),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists sessions_cohort_idx on public.sessions(cohort_id, starts_at);

-- ---------------------------------------------------------------------------
-- Enrollments & progress
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null,
  cohort_id uuid references public.cohorts(id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  started_at timestamptz,
  completed_at timestamptz,
  enrolled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists enrollments_course_idx on public.enrollments(course_id);
create index if not exists enrollments_org_idx on public.enrollments(organization_id);
create index if not exists enrollments_cohort_idx on public.enrollments(cohort_id);

create table if not exists public.lesson_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (enrollment_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,           -- { "<question_id>": [choice indexes] }
  correct_count integer not null,
  total integer not null,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_enrollment_idx on public.quiz_attempts(enrollment_id, quiz_id);

-- ---------------------------------------------------------------------------
-- Attendance (émargement numérique) — one row per learner per half-day session
-- ---------------------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'present' check (status in ('present', 'absent', 'excused')),
  signed_at timestamptz,               -- server timestamp of the learner's signature
  signature_data text check (signature_data is null or length(signature_data) <= 200000),
  signer_ip text,
  signer_user_agent text,
  recorded_by uuid references auth.users(id) on delete set null, -- trainer who recorded / corrected
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Evaluations: positioning (before), hot (end of training), cold (J+60)
-- Questions are defined in the app (apps/app/src/lib/evaluation-forms.ts),
-- identified by form_version so answers stay interpretable over time.
-- ---------------------------------------------------------------------------
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  kind text not null check (kind in ('positioning', 'hot', 'cold')),
  form_version text not null,
  answers jsonb not null,
  overall_rating numeric(3, 2) check (overall_rating is null or overall_rating between 0 and 5),
  comment text check (comment is null or length(comment) <= 5000),
  submitted_at timestamptz not null default now(),
  unique (enrollment_id, kind)
);

create index if not exists evaluations_course_idx on public.evaluations(course_id, kind);

-- ---------------------------------------------------------------------------
-- Certificates (attestations de fin de formation)
-- Number format: AGF-YYYY-NNNNN-C (C = Luhn check digit over YYYYNNNNN).
-- ---------------------------------------------------------------------------
create table if not exists public.certificate_counters (
  year integer primary key,
  last_value integer not null default 0
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  number text not null unique check (number ~ '^AGF-[0-9]{4}-[0-9]{5}-[0-9]$'),
  enrollment_id uuid not null unique references public.enrollments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  -- Snapshots: the certificate must stay identical even if names/courses change.
  learner_name text not null,
  course_title text not null,
  duration_hours numeric(5, 1) not null,
  modality text not null,
  training_start date,
  training_end date,
  issued_at timestamptz not null default now(),
  issued_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_reason text
);

-- ---------------------------------------------------------------------------
-- Complaints register (registre des réclamations — indicateur 31)
-- ---------------------------------------------------------------------------
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  channel text not null default 'platform' check (channel in ('platform', 'email', 'phone', 'other')),
  subject text not null check (length(subject) between 3 and 200),
  description text not null check (length(description) between 10 and 5000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  response text,
  corrective_action text,        -- action d'amélioration (indicateur 32)
  handled_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers (public.set_updated_at() comes from 0001)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['courses', 'course_modules', 'lessons', 'quizzes', 'cohorts',
                           'enrollments', 'attendance', 'complaints']
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Progress: recompute enrollment progress whenever lesson_progress changes.
-- Mirrors computeProgress() in apps/app/src/lib/progress.ts.
-- ---------------------------------------------------------------------------
create or replace function public.refresh_enrollment_progress(p_enrollment uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_done integer;
  v_percent integer;
begin
  select count(*) into v_total
  from public.lessons l
  join public.enrollments e on e.course_id = l.course_id
  where e.id = p_enrollment;

  select count(*) into v_done
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  where lp.enrollment_id = p_enrollment;

  v_percent := case when v_total = 0 then 0
                    else least(100, floor(v_done * 100.0 / v_total)::integer) end;

  update public.enrollments e
  set progress_percent = v_percent,
      started_at = coalesce(e.started_at, case when v_done > 0 then now() end),
      status = case
                 when e.status = 'cancelled' then e.status
                 when v_percent = 100 then 'completed'
                 else 'active'
               end,
      completed_at = case
                       when v_percent = 100 then coalesce(e.completed_at, now())
                       else null
                     end
  where e.id = p_enrollment;
end;
$$;

create or replace function public.on_lesson_progress_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_enrollment_progress(coalesce(new.enrollment_id, old.enrollment_id));
  return null;
end;
$$;

drop trigger if exists lesson_progress_refresh on public.lesson_progress;
create trigger lesson_progress_refresh
  after insert or delete on public.lesson_progress
  for each row execute function public.on_lesson_progress_change();

revoke execute on function public.refresh_enrollment_progress(uuid) from public, anon, authenticated;
revoke execute on function public.on_lesson_progress_change() from public, anon, authenticated;
