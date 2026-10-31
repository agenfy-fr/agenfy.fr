/** Row shapes of the console tables (migrations 0001, 0003, 0100-0103). */
import type {
  DocumentKind,
  InvoiceStatus,
  LeadPriority,
  LeadStatus,
  MilestoneStatus,
  OrgStatus,
  ProjectStatus,
  QuoteStatus,
  RequestCategory,
  RequestPriority,
  RequestStatus,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "./domain";
import type { OrgRole, StaffRole } from "./access-control";

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  service: string | null;
  source: string | null;
  priority: LeadPriority;
  status: LeadStatus;
  notes: string | null;
  organization_id: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  siren: string | null;
  website: string | null;
  sector: string | null;
  size_band: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface OrganizationInternal {
  organization_id: string;
  status: OrgStatus;
  account_manager_id: string | null;
  internal_notes: string | null;
  source_lead_id: string | null;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface OrganizationContact {
  id: string;
  organization_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  notes: string | null;
  is_primary: boolean;
  user_id: string | null;
  invited_at: string | null;
  created_at: string;
}

export interface DirectoryUser {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface StaffMember extends DirectoryUser {
  role: StaffRole;
  suspended: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  budget_cents: number | null;
  owner_id: string | null;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  position: number;
  client_visible: boolean;
  completed_at: string | null;
}

export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  milestone_id: string | null;
  number: number;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string | null;
  start_date: string | null;
  due_date: string | null;
  estimate_hours: number | null;
  labels: string[];
  order_index: number;
  client_visible: boolean;
  agent_assignee: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientDocument {
  id: string;
  organization_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  kind: DocumentKind;
  storage_path: string | null;
  external_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  client_visible: boolean;
  created_at: string;
}

export interface BillingLine {
  id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

interface BillingDocumentBase {
  id: string;
  organization_id: string;
  project_id: string | null;
  number: string | null;
  title: string;
  issue_date: string | null;
  vat_rate: number;
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  notes: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface Quote extends BillingDocumentBase {
  status: QuoteStatus;
  valid_until: string | null;
}

export interface Invoice extends BillingDocumentBase {
  status: InvoiceStatus;
  /** 'shine' = issued in Shine, recorded here (number and amounts typed, PDF in document_id). */
  source: "console" | "shine";
  document_id: string | null;
  quote_id: string | null;
  due_date: string | null;
  paid_at: string | null;
}

export interface ClientRequest {
  id: string;
  organization_id: string;
  project_id: string | null;
  created_by: string | null;
  subject: string;
  body: string;
  category: RequestCategory;
  status: RequestStatus;
  priority: RequestPriority;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRequestMessage {
  id: string;
  request_id: string;
  author_id: string | null;
  body: string;
  internal: boolean;
  created_at: string;
}

// --- Training (0200 + 0304) -------------------------------------------------------------
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
  modality: "presentiel" | "distanciel" | "hybride" | "elearning";
  price_ht_cents: number | null;
  price_label: string | null;
  max_group_size: number | null;
  status: "draft" | "published" | "archived";
  version: number;
  published_at: string | null;
  created_at: string;
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
  /** Object in the private `training-videos` bucket (0304). */
  video_path: string | null;
  duration_minutes: number;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  organization_id: string | null;
  cohort_id: string | null;
  status: "active" | "completed" | "cancelled";
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
