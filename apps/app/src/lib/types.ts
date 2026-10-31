/** Hand-written row types for the tables of migrations 0200-0202. */

export type Modality = "presentiel" | "distanciel" | "hybride" | "elearning";
export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: "essentiels" | "technique" | "management";
  level: "debutant" | "intermediaire" | "avance";
  audience: string;
  prerequisites: string;
  objectives: string[];
  teaching_methods: string | null;
  evaluation_methods: string | null;
  accessibility: string | null;
  access_delay: string | null;
  duration_hours: number;
  duration_label: string | null;
  modality: Modality;
  price_ht_cents: number | null;
  price_label: string | null;
  max_group_size: number | null;
  status: "draft" | "published" | "archived";
  version: number;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  position: number;
  title: string;
  summary: string | null;
  duration_minutes: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  module_id: string;
  slug: string;
  position: number;
  title: string;
  objectives: string[];
  content_md: string;
  exercise_md: string | null;
  video_url: string | null;
  /** Uploaded video in the private `training-videos` bucket (migration 0304). */
  video_path: string | null;
  duration_minutes: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  pass_score: number;
}

/** Learner-visible columns only (answer keys are not granted). */
export interface QuizQuestionPublic {
  id: string;
  quiz_id: string;
  position: number;
  prompt: string;
  choices: string[];
  multiple: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  organization_id: string | null;
  cohort_id: string | null;
  status: EnrollmentStatus;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Cohort {
  id: string;
  course_id: string;
  organization_id: string | null;
  name: string;
  trainer_id: string | null;
  modality: Modality;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planned" | "running" | "done" | "cancelled";
}

export interface Session {
  id: string;
  cohort_id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  half_day: "am" | "pm";
  location: string | null;
  meeting_url: string | null;
}

export interface Attendance {
  id: string;
  session_id: string;
  enrollment_id: string;
  user_id: string;
  status: "present" | "absent" | "excused";
  signed_at: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  note: string | null;
}

export interface Evaluation {
  id: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  kind: "positioning" | "hot" | "cold";
  form_version: string;
  answers: Record<string, unknown>;
  overall_rating: number | null;
  comment: string | null;
  submitted_at: string;
}

export interface Certificate {
  id: string;
  number: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  learner_name: string;
  course_title: string;
  duration_hours: number;
  modality: Modality;
  training_start: string | null;
  training_end: string | null;
  issued_at: string;
  revoked_at: string | null;
}

export interface Complaint {
  id: string;
  user_id: string | null;
  course_id: string | null;
  enrollment_id: string | null;
  channel: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  response: string | null;
  corrective_action: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Person {
  user_id: string;
  email: string;
  full_name: string | null;
}
