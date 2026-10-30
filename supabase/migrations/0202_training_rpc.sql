-- app.agenfy.fr — server-side functions (RPC) for the training platform.
--
-- Every function is security definer with an empty search_path and performs
-- its own authorization check. Logic mirrored in TypeScript (and unit-tested):
--   submit_quiz_attempt      <-> apps/app/src/lib/quiz.ts          (scoreQuiz)
--   certificate_check_digit  <-> apps/app/src/lib/certificates.ts  (luhnCheckDigit)
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Quiz scoring. A question is correct when the set of selected indexes equals
-- the set of correct indexes. score = round(100 * correct / total).
-- ---------------------------------------------------------------------------
create or replace function public.submit_quiz_attempt(p_quiz uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quiz public.quizzes%rowtype;
  v_enrollment uuid;
  v_question record;
  v_selected integer[];
  v_correct boolean;
  v_correct_count integer := 0;
  v_total integer := 0;
  v_score integer;
  v_results jsonb := '[]'::jsonb;
  v_attempt uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers' using errcode = '22023';
  end if;

  select * into v_quiz from public.quizzes where id = p_quiz;
  if not found then
    raise exception 'quiz_not_found' using errcode = 'P0002';
  end if;

  select e.id into v_enrollment
  from public.enrollments e
  where e.course_id = v_quiz.course_id and e.user_id = auth.uid() and e.status <> 'cancelled';
  if v_enrollment is null then
    raise exception 'not_enrolled' using errcode = '42501';
  end if;

  for v_question in
    select q.id, q.correct_indexes, q.explanation
    from public.quiz_questions q
    where q.quiz_id = p_quiz
    order by q.position
  loop
    v_total := v_total + 1;
    select coalesce(array_agg(distinct x::integer order by x::integer), '{}')
      into v_selected
    from jsonb_array_elements_text(
      case when jsonb_typeof(p_answers -> v_question.id::text) = 'array'
           then p_answers -> v_question.id::text else '[]'::jsonb end
    ) as x
    where x ~ '^[0-9]+$';

    v_correct := v_selected = (
      select coalesce(array_agg(distinct c order by c), '{}')
      from unnest(v_question.correct_indexes) c
    );
    if v_correct then
      v_correct_count := v_correct_count + 1;
    end if;

    v_results := v_results || jsonb_build_object(
      'question_id', v_question.id,
      'correct', v_correct,
      'selected', to_jsonb(v_selected),
      'correct_indexes', to_jsonb(v_question.correct_indexes),
      'explanation', v_question.explanation
    );
  end loop;

  if v_total = 0 then
    raise exception 'empty_quiz' using errcode = '22023';
  end if;

  v_score := round(v_correct_count * 100.0 / v_total)::integer;

  insert into public.quiz_attempts (quiz_id, enrollment_id, user_id, answers, correct_count, total, score, passed)
  values (p_quiz, v_enrollment, auth.uid(), p_answers, v_correct_count, v_total, v_score, v_score >= v_quiz.pass_score)
  returning id into v_attempt;

  return jsonb_build_object(
    'attempt_id', v_attempt,
    'score', v_score,
    'passed', v_score >= v_quiz.pass_score,
    'pass_score', v_quiz.pass_score,
    'correct_count', v_correct_count,
    'total', v_total,
    'results', v_results
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Attendance signature (émargement). Allowed from 30 min before the session
-- starts to 60 min after it ends. Timestamp, IP and user agent are taken
-- server-side (PostgREST request headers), never from the client payload.
-- ---------------------------------------------------------------------------
create or replace function public.sign_attendance(p_session uuid, p_signature text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.sessions%rowtype;
  v_enrollment uuid;
  v_headers jsonb;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_signature is null or length(p_signature) < 20 or length(p_signature) > 200000 then
    raise exception 'invalid_signature' using errcode = '22023';
  end if;

  select * into v_session from public.sessions where id = p_session;
  if not found then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;

  select e.id into v_enrollment
  from public.enrollments e
  where e.cohort_id = v_session.cohort_id and e.user_id = auth.uid() and e.status <> 'cancelled';
  if v_enrollment is null then
    raise exception 'not_in_cohort' using errcode = '42501';
  end if;

  if now() < v_session.starts_at - interval '30 minutes'
     or now() > v_session.ends_at + interval '60 minutes' then
    raise exception 'signature_window_closed' using errcode = '22023';
  end if;

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    v_headers := null;
  end;

  insert into public.attendance (session_id, enrollment_id, user_id, status, signed_at,
                                 signature_data, signer_ip, signer_user_agent)
  values (
    p_session, v_enrollment, auth.uid(), 'present', now(), p_signature,
    split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1),
    left(coalesce(v_headers ->> 'user-agent', ''), 500)
  )
  on conflict (session_id, user_id) do update
    set status = 'present',
        signed_at = now(),
        signature_data = excluded.signature_data,
        signer_ip = excluded.signer_ip,
        signer_user_agent = excluded.signer_user_agent
    where public.attendance.signed_at is null  -- a signature is never overwritten
  returning id into v_id;

  if v_id is null then
    raise exception 'already_signed' using errcode = '23505';
  end if;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Certificates. Number: AGF-YYYY-NNNNN-C, sequential per year, C = Luhn
-- check digit computed over the 9 digits YYYYNNNNN.
-- ---------------------------------------------------------------------------
create or replace function public.certificate_check_digit(p_digits text)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_sum integer := 0;
  v_digit integer;
  v_double boolean := true;  -- rightmost payload digit is doubled
  i integer;
begin
  if p_digits !~ '^[0-9]+$' then
    raise exception 'digits_only' using errcode = '22023';
  end if;
  for i in reverse length(p_digits)..1 loop
    v_digit := substr(p_digits, i, 1)::integer;
    if v_double then
      v_digit := v_digit * 2;
      if v_digit > 9 then
        v_digit := v_digit - 9;
      end if;
    end if;
    v_sum := v_sum + v_digit;
    v_double := not v_double;
  end loop;
  return (10 - (v_sum % 10)) % 10;
end;
$$;

create or replace function public.next_certificate_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from now() at time zone 'Europe/Paris')::integer;
  v_value integer;
  v_payload text;
begin
  insert into public.certificate_counters as c (year, last_value)
  values (v_year, 1)
  on conflict (year) do update set last_value = c.last_value + 1
  returning last_value into v_value;

  if v_value > 99999 then
    raise exception 'certificate_counter_overflow';
  end if;

  v_payload := v_year::text || lpad(v_value::text, 5, '0');
  return format('AGF-%s-%s-%s', v_year, lpad(v_value::text, 5, '0'),
                public.certificate_check_digit(v_payload));
end;
$$;

revoke execute on function public.next_certificate_number() from public, anon, authenticated;

create or replace function public.issue_certificate(p_enrollment uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment public.enrollments%rowtype;
  v_course public.courses%rowtype;
  v_existing text;
  v_name text;
  v_start date;
  v_end date;
  v_number text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_enrollment from public.enrollments where id = p_enrollment for update;
  if not found then
    raise exception 'enrollment_not_found' using errcode = 'P0002';
  end if;

  if not (
    (v_enrollment.user_id = auth.uid() and v_enrollment.status = 'completed')
    or public.is_training_staff()
  ) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if v_enrollment.status = 'cancelled' then
    raise exception 'enrollment_cancelled' using errcode = '22023';
  end if;

  select number into v_existing from public.certificates where enrollment_id = p_enrollment;
  if v_existing is not null then
    return v_existing;
  end if;

  select nullif(trim(full_name), '') into v_name from public.profiles where id = v_enrollment.user_id;
  if v_name is null then
    raise exception 'missing_learner_name' using errcode = '22023';
  end if;

  select * into v_course from public.courses where id = v_enrollment.course_id;

  select c.start_date, c.end_date into v_start, v_end
  from public.cohorts c where c.id = v_enrollment.cohort_id;
  v_start := coalesce(v_start, (v_enrollment.started_at at time zone 'Europe/Paris')::date,
                      (v_enrollment.created_at at time zone 'Europe/Paris')::date);
  v_end := coalesce(v_end, (v_enrollment.completed_at at time zone 'Europe/Paris')::date,
                    (now() at time zone 'Europe/Paris')::date);

  v_number := public.next_certificate_number();

  insert into public.certificates (number, enrollment_id, user_id, course_id, learner_name,
                                   course_title, duration_hours, modality, training_start,
                                   training_end, issued_by)
  values (v_number, v_enrollment.id, v_enrollment.user_id, v_course.id, v_name, v_course.title,
          v_course.duration_hours, v_course.modality, v_start, v_end, auth.uid());

  return v_number;
end;
$$;

-- Public verification (anon): returns only what is printed on the certificate.
create or replace function public.verify_certificate(p_number text)
returns table (
  number text,
  learner_name text,
  course_title text,
  duration_hours numeric,
  modality text,
  training_start date,
  training_end date,
  issued_at timestamptz,
  revoked boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.number, c.learner_name, c.course_title, c.duration_hours, c.modality,
         c.training_start, c.training_end, c.issued_at, c.revoked_at is not null
  from public.certificates c
  where c.number = upper(trim(p_number));
$$;

-- ---------------------------------------------------------------------------
-- Staff: enroll an existing user by e-mail (the app invites unknown users
-- first with the service role, server-side).
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

  if p_organization is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (p_organization, v_user, 'member')
    on conflict do nothing;
  end if;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- People directory (e-mail + name) for staff and org managers.
-- ---------------------------------------------------------------------------
create or replace function public.training_people()
returns table (user_id uuid, email text, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.email::text, p.full_name
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_staff()
     or exists (
       select 1 from public.organization_members m
       where m.user_id = u.id and public.is_org_manager(m.organization_id)
     );
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
revoke execute on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
revoke execute on function public.sign_attendance(uuid, text) from public, anon;
revoke execute on function public.issue_certificate(uuid) from public, anon;
revoke execute on function public.enroll_by_email(text, uuid, uuid, uuid) from public, anon;
revoke execute on function public.training_people() from public, anon;

grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
grant execute on function public.sign_attendance(uuid, text) to authenticated;
grant execute on function public.issue_certificate(uuid) to authenticated;
grant execute on function public.enroll_by_email(text, uuid, uuid, uuid) to authenticated;
grant execute on function public.training_people() to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
grant execute on function public.certificate_check_digit(text) to anon, authenticated;
