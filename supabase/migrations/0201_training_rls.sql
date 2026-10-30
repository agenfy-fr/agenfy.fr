-- app.agenfy.fr — Row Level Security for the training platform.
--
-- Access model:
--   learner  (any authenticated user)   -> own enrollments and their content
--   manager  (is_org_manager(org))      -> read-only view of their organization's enrollments
--   staff    (is_staff())               -> read everything
--   training staff (staff, not readonly)-> write catalogue, cohorts, enrollments, attendance
--   anon                                 -> published catalogue only + verify_certificate() RPC
--
-- Rule from CLAUDE.md: never `to authenticated using (true)`.
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
create or replace function public.is_training_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.staff_role() in ('owner', 'admin', 'trainer', 'consultant', 'sales'), false);
$$;

create or replace function public.is_enrolled(p_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_id = p_course and e.user_id = auth.uid() and e.status <> 'cancelled'
  );
$$;

create or replace function public.can_view_enrollment(p_enrollment uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments e
    where e.id = p_enrollment
      and (
        e.user_id = auth.uid()
        or public.is_staff()
        or (e.organization_id is not null and public.is_org_manager(e.organization_id))
      )
  );
$$;

create or replace function public.owns_active_enrollment(p_enrollment uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments e
    where e.id = p_enrollment and e.user_id = auth.uid() and e.status <> 'cancelled'
  );
$$;

create or replace function public.can_view_cohort(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_staff()
    or exists (
      select 1 from public.enrollments e
      where e.cohort_id = p_cohort and e.user_id = auth.uid() and e.status <> 'cancelled'
    )
    or exists (
      select 1 from public.cohorts c
      where c.id = p_cohort and c.organization_id is not null and public.is_org_manager(c.organization_id)
    );
$$;

grant execute on function public.is_training_staff() to authenticated;
grant execute on function public.is_enrolled(uuid) to authenticated;
grant execute on function public.can_view_enrollment(uuid) to authenticated;
grant execute on function public.owns_active_enrollment(uuid) to authenticated;
grant execute on function public.can_view_cohort(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.cohorts enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.attendance enable row level security;
alter table public.evaluations enable row level security;
alter table public.certificate_counters enable row level security; -- no policy: RPC only
alter table public.certificates enable row level security;
alter table public.complaints enable row level security;

-- ---------------------------------------------------------------------------
-- Catalogue: published courses and their outline are public (catalogue page).
-- ---------------------------------------------------------------------------
create policy "Courses: published are public" on public.courses
  for select to anon, authenticated using (status = 'published');
create policy "Courses: staff read all" on public.courses
  for select to authenticated using (public.is_staff());
create policy "Courses: training staff write" on public.courses
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

create policy "Modules: outline of published courses is public" on public.course_modules
  for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "Modules: staff read all" on public.course_modules
  for select to authenticated using (public.is_staff());
create policy "Modules: training staff write" on public.course_modules
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- Lesson content: enrolled learners and staff only.
create policy "Lessons: enrolled or staff read" on public.lessons
  for select to authenticated using (public.is_enrolled(course_id) or public.is_staff());
create policy "Lessons: training staff write" on public.lessons
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

create policy "Quizzes: enrolled or staff read" on public.quizzes
  for select to authenticated using (public.is_enrolled(course_id) or public.is_staff());
create policy "Quizzes: training staff write" on public.quizzes
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

create policy "Quiz questions: enrolled or staff read" on public.quiz_questions
  for select to authenticated
  using (exists (
    select 1 from public.quizzes q
    where q.id = quiz_id and (public.is_enrolled(q.course_id) or public.is_staff())
  ));
create policy "Quiz questions: training staff write" on public.quiz_questions
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- Answer keys never leave the database through the API: column-level grants.
-- Scoring happens in submit_quiz_attempt() (0202). Always select explicit columns.
revoke all on public.quiz_questions from anon, authenticated;
grant select (id, quiz_id, position, prompt, choices, multiple, created_at)
  on public.quiz_questions to authenticated;
grant insert, update, delete on public.quiz_questions to authenticated; -- RLS: training staff only

-- ---------------------------------------------------------------------------
-- Cohorts & sessions
-- ---------------------------------------------------------------------------
create policy "Cohorts: participants, managers, staff read" on public.cohorts
  for select to authenticated using (public.can_view_cohort(id));
create policy "Cohorts: training staff write" on public.cohorts
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

create policy "Sessions: cohort viewers read" on public.sessions
  for select to authenticated using (public.can_view_cohort(cohort_id));
create policy "Sessions: training staff write" on public.sessions
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- ---------------------------------------------------------------------------
-- Enrollments: created by staff (enroll_by_email RPC or direct insert).
-- Learners cannot change their own status/progress (trigger-maintained).
-- ---------------------------------------------------------------------------
create policy "Enrollments: owner, org manager, staff read" on public.enrollments
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_staff()
    or (organization_id is not null and public.is_org_manager(organization_id))
  );
create policy "Enrollments: training staff write" on public.enrollments
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- ---------------------------------------------------------------------------
-- Lesson progress: the learner marks lessons done on their own enrollment.
-- ---------------------------------------------------------------------------
create policy "Lesson progress: viewers read" on public.lesson_progress
  for select to authenticated using (public.can_view_enrollment(enrollment_id));
create policy "Lesson progress: learner marks own lessons" on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.owns_active_enrollment(enrollment_id)
    and exists (
      select 1 from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = lesson_id and e.id = enrollment_id
    )
  );
create policy "Lesson progress: learner unmarks own lessons" on public.lesson_progress
  for delete to authenticated
  using (user_id = auth.uid() and public.owns_active_enrollment(enrollment_id));
create policy "Lesson progress: training staff write" on public.lesson_progress
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- ---------------------------------------------------------------------------
-- Quiz attempts: inserted only by submit_quiz_attempt() (security definer).
-- ---------------------------------------------------------------------------
create policy "Quiz attempts: viewers read" on public.quiz_attempts
  for select to authenticated using (public.can_view_enrollment(enrollment_id));
create policy "Quiz attempts: staff admins delete" on public.quiz_attempts
  for delete to authenticated using (public.is_staff_admin());

-- ---------------------------------------------------------------------------
-- Attendance: learners sign through sign_attendance() (server timestamp,
-- time window check). Trainers record / correct directly.
-- ---------------------------------------------------------------------------
create policy "Attendance: viewers read" on public.attendance
  for select to authenticated using (public.can_view_enrollment(enrollment_id));
create policy "Attendance: training staff write" on public.attendance
  for all to authenticated using (public.is_training_staff()) with check (public.is_training_staff());

-- ---------------------------------------------------------------------------
-- Evaluations: learner submits once per kind on their own enrollment.
-- Answers are immutable for the learner (traceability).
-- ---------------------------------------------------------------------------
create policy "Evaluations: viewers read" on public.evaluations
  for select to authenticated using (public.can_view_enrollment(enrollment_id));
create policy "Evaluations: learner submits own" on public.evaluations
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id
        and e.user_id = auth.uid()
        and e.course_id = evaluations.course_id
        and e.status <> 'cancelled'
        and (evaluations.kind <> 'cold' or e.completed_at is not null)
    )
  );
create policy "Evaluations: staff admins manage" on public.evaluations
  for all to authenticated using (public.is_staff_admin()) with check (public.is_staff_admin());

-- ---------------------------------------------------------------------------
-- Certificates: issued only by issue_certificate() (numbering + snapshot).
-- ---------------------------------------------------------------------------
create policy "Certificates: owner, org manager, staff read" on public.certificates
  for select to authenticated using (user_id = auth.uid() or public.can_view_enrollment(enrollment_id));
create policy "Certificates: staff admins revoke" on public.certificates
  for update to authenticated using (public.is_staff_admin()) with check (public.is_staff_admin());

-- ---------------------------------------------------------------------------
-- Complaints register
-- ---------------------------------------------------------------------------
create policy "Complaints: author or staff read" on public.complaints
  for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "Complaints: learner files own" on public.complaints
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'open'
    and response is null
    and corrective_action is null
    and handled_by is null
    and resolved_at is null
    and (enrollment_id is null or public.owns_active_enrollment(enrollment_id))
  );
create policy "Complaints: staff handle" on public.complaints
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
