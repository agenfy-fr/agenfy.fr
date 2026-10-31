/**
 * Form / API validation (zod 4). Values mirror the CHECK constraints of the
 * migrations; the database remains the final authority.
 */
import { z } from "zod";
import { ORG_ROLES, PORTAL_ORG_ROLES, STAFF_ROLES } from "./access-control";
import {
  DOCUMENT_KINDS,
  INVOICE_STATUSES,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  MILESTONE_STATUSES,
  ORG_SIZE_BANDS,
  ORG_STATUSES,
  PROJECT_STATUSES,
  QUOTE_STATUSES,
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
} from "./domain";
import { parseEurosToCents } from "./format";
import { COURSE_CATEGORIES, COURSE_LEVELS, COURSE_MODALITIES, COURSE_STATUSES } from "./training";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuid = z.string().regex(UUID_RE, { error: "Identifiant invalide." });

/** Optional text: undefined/"" → null. */
export const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `${max} caractères maximum.` })
    .optional()
    .transform((v) => (v ? v : null));

export const reqText = (max: number, label = "Ce champ") =>
  z
    .string({ error: `${label} est obligatoire.` })
    .trim()
    .min(1, { error: `${label} est obligatoire.` })
    .max(max, { error: `${max} caractères maximum.` });

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date attendue au format AAAA-MM-JJ." })
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), { error: "Date invalide." });
export const optDate = isoDate.optional().transform((v) => v ?? null);
export const optUuid = uuid.optional().transform((v) => v ?? null);

/** Checkbox: "on" / "true" → true, absent → false. */
export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
  .transform((v) => v === "on" || v === "true");

/** Euros typed by a human ("1 234,50") → integer cents. */
export const eurosToCents = z
  .string()
  .transform((v, ctx) => {
    const cents = parseEurosToCents(v);
    if (cents == null) {
      ctx.addIssue({ code: "custom", message: "Montant invalide (ex. 1 250,00)." });
      return z.NEVER;
    }
    return cents;
  });
export const optEurosToCents = eurosToCents.optional().transform((v) => v ?? null);

const httpsUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => /^https:\/\/[^\s]+$/i.test(u), { error: "URL https:// attendue." });

// --- Organizations ------------------------------------------------------------------
export const organizationSchema = z.object({
  name: reqText(200, "Le nom"),
  siren: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/\s/g, "") : null))
    .refine((v) => v == null || /^\d{9}$/.test(v), { error: "SIREN : 9 chiffres." }),
  website: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null)),
  sector: optText(120),
  size_band: z.enum(ORG_SIZE_BANDS).optional().transform((v) => v ?? null),
});

export const organizationInternalSchema = z.object({
  status: z.enum(ORG_STATUSES),
  account_manager_id: optUuid,
  internal_notes: optText(20000),
});

// --- Contacts (0300): address book; nothing is sent when a contact is added ---------
export const contactSchema = z
  .object({
    full_name: optText(120),
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.toLowerCase() : null))
      .refine((v) => v == null || z.email().safeParse(v).success, { error: "Adresse e-mail invalide." }),
    phone: optText(40),
    job_title: optText(120),
    notes: optText(5000),
    is_primary: checkbox,
  })
  .refine((c) => !!c.full_name || !!c.email, { error: "Indiquez au moins un nom ou un e-mail." });

/** Explicit portal invitation of an existing contact (never the learner role). */
export const inviteContactSchema = z.object({
  role: z.enum(PORTAL_ORG_ROLES).default("member"),
});

export const orgRoleSchema = z.enum(ORG_ROLES);
export const portalRoleSchema = z.enum(PORTAL_ORG_ROLES);

// --- Training (0200 + 0304) -------------------------------------------------------------
const slugText = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, { error: "80 caractères maximum." })
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Identifiant d'URL : minuscules, chiffres et tirets (ex. ia-generative)." });

/** One item per line (objectives…). */
export const linesToArray = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean),
  )
  .refine((a) => a.length <= 30, { error: "30 lignes maximum." })
  .refine((a) => a.every((l) => l.length <= 500), { error: "500 caractères maximum par ligne." });

const minutes = z.coerce
  .number({ error: "Durée en minutes attendue." })
  .int({ error: "Nombre entier de minutes." })
  .min(0, { error: "Durée positive attendue." })
  .max(10000, { error: "Durée trop longue." });

export const courseCreateSchema = z.object({
  title: reqText(200, "Le titre"),
  slug: slugText.optional(),
  category: z.enum(COURSE_CATEGORIES),
  level: z.enum(COURSE_LEVELS),
  modality: z.enum(COURSE_MODALITIES),
  duration_hours: z.coerce
    .number({ error: "Durée en heures attendue." })
    .gt(0, { error: "La durée doit être positive." })
    .max(9999, { error: "Durée trop longue." }),
  audience: reqText(2000, "Le public visé"),
  prerequisites: reqText(2000, "Les prérequis"),
});

export const courseSchema = courseCreateSchema.extend({
  slug: slugText,
  subtitle: optText(300),
  status: z.enum(COURSE_STATUSES),
  objectives: linesToArray,
  teaching_methods: optText(5000),
  evaluation_methods: optText(5000),
  accessibility: optText(5000),
  access_delay: optText(1000),
  duration_label: optText(120),
  price_ht_cents: optEurosToCents,
  price_label: optText(200),
  max_group_size: z.coerce
    .number()
    .int()
    .min(1, { error: "Au moins 1 personne." })
    .max(10000)
    .optional()
    .transform((v) => v ?? null),
});

export const moduleSchema = z.object({
  title: reqText(200, "Le titre"),
  summary: optText(2000),
  duration_minutes: minutes.default(0),
});

export const lessonCreateSchema = z.object({
  title: reqText(200, "Le titre"),
  module_id: uuid,
});

export const lessonSchema = z.object({
  title: reqText(200, "Le titre"),
  slug: slugText,
  module_id: uuid,
  duration_minutes: minutes.default(0),
  objectives: linesToArray,
  content_md: z.string().max(200000, { error: "Contenu trop long (200 000 caractères maximum)." }).optional().transform((v) => v ?? ""),
  exercise_md: optText(50000),
});

export const lessonVideoUrlSchema = z.object({
  video_url: httpsUrl,
});

export const videoUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  size: z.number().int().positive(),
  type: z.string().max(100),
});

/** Give training access: one or more courses. */
export const grantTrainingSchema = z.object({
  course_ids: z
    .union([uuid, z.array(uuid)], { error: "Choisissez au moins une formation." })
    .transform((v) => [...new Set(Array.isArray(v) ? v : [v])])
    .refine((v) => v.length > 0 && v.length <= 20, { error: "Choisissez entre 1 et 20 formations." }),
  full_name: optText(120),
});

// --- Leads ----------------------------------------------------------------------------
export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const leadSchema = z.object({
  name: reqText(200, "Le nom"),
  company: optText(200),
  email: z.email({ error: "Adresse e-mail invalide." }).max(320),
  phone: optText(40),
  service: optText(120),
  source: optText(120),
  message: optText(5000),
  priority: z.enum(LEAD_PRIORITIES).default("Moyenne"),
});

export const leadUpdateSchema = z.object({
  status: leadStatusSchema,
  priority: z.enum(LEAD_PRIORITIES),
  notes: optText(10000),
});

// --- Projects ---------------------------------------------------------------------------
export const projectCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z][A-Z0-9]{1,9}$/, { error: "Code : 2 à 10 lettres/chiffres, commençant par une lettre." }));

const dateRange = <T extends { start_date: string | null; end_date: string | null }>(v: T) =>
  !v.start_date || !v.end_date || v.start_date <= v.end_date;

export const projectCreateSchema = z
  .object({
    organization_id: uuid,
    code: projectCodeSchema,
    name: reqText(200, "Le nom"),
    description: optText(20000),
    status: z.enum(PROJECT_STATUSES).default("draft"),
    start_date: optDate,
    end_date: optDate,
    budget: optEurosToCents,
    owner_id: optUuid,
  })
  .refine(dateRange, { error: "La date de début doit précéder la date de fin.", path: ["start_date"] });

export const projectUpdateSchema = z
  .object({
    name: reqText(200, "Le nom"),
    description: optText(20000),
    status: z.enum(PROJECT_STATUSES),
    progress: z.coerce.number().int().min(0).max(100),
    start_date: optDate,
    end_date: optDate,
    budget: optEurosToCents,
    owner_id: optUuid,
    next_steps: optText(5000),
  })
  .refine(dateRange, { error: "La date de début doit précéder la date de fin.", path: ["start_date"] });

export const milestoneSchema = z.object({
  title: reqText(200, "Le titre"),
  description: optText(5000),
  status: z.enum(MILESTONE_STATUSES).default("planned"),
  due_date: optDate,
  client_visible: checkbox,
});

// --- Documents --------------------------------------------------------------------------
export const documentSchema = z.object({
  organization_id: uuid,
  project_id: optUuid,
  title: reqText(200, "Le titre"),
  description: optText(5000),
  kind: z.enum(DOCUMENT_KINDS).default("deliverable"),
  external_url: httpsUrl.optional().transform((v) => v ?? null),
  client_visible: checkbox,
});

/**
 * Uploads go through a server action: Vercel caps request bodies at 4.5 MB,
 * so files are limited to 4 MB (larger deliverables: share an https link).
 * Keep next.config.ts serverActions.bodySizeLimit just above this value.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// --- Billing ----------------------------------------------------------------------------
export const billingCreateSchema = z.object({
  organization_id: uuid,
  project_id: optUuid,
  title: reqText(200, "L'objet"),
});

export const billingHeaderSchema = z.object({
  title: reqText(200, "L'objet"),
  project_id: optUuid,
  vat_rate: z.coerce.number().min(0).max(100),
  notes: optText(5000),
  issue_date: optDate,
  valid_until: optDate,
  due_date: optDate,
});

export const billingLineSchema = z.object({
  description: reqText(1000, "La désignation"),
  quantity: z
    .string()
    .trim()
    .transform((v) => Number(v.replace(",", ".")))
    .pipe(z.number({ error: "Quantité invalide." }).positive({ error: "Quantité > 0." }).max(1_000_000)),
  unit_price: eurosToCents,
});

/** Invoice issued in Shine, recorded in the console (0301). Amounts typed in euros. */
export const shineInvoiceSchema = z
  .object({
    organization_id: uuid,
    project_id: optUuid,
    quote_id: optUuid,
    number: reqText(60, "Le numéro Shine"),
    title: reqText(200, "L'objet"),
    issue_date: isoDate,
    due_date: optDate,
    subtotal: eurosToCents,
    vat: eurosToCents,
    status: z.enum(["sent", "paid", "cancelled"]).default("sent"),
    paid_at: optDate,
    notes: optText(5000),
  })
  .transform((v) => ({
    ...v,
    paid_at: v.status === "paid" ? (v.paid_at ?? new Date().toISOString().slice(0, 10)) : null,
  }));

export const quoteStatusSchema = z.enum(QUOTE_STATUSES);
export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

// --- Requests ---------------------------------------------------------------------------
export const clientRequestSchema = z.object({
  organization_id: uuid,
  project_id: optUuid,
  subject: reqText(200, "L'objet"),
  body: reqText(10000, "Le message"),
  category: z.enum(REQUEST_CATEGORIES).default("question"),
});

export const requestMessageSchema = z.object({
  body: reqText(10000, "Le message"),
  internal: checkbox,
});

export const requestStaffUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  priority: z.enum(REQUEST_PRIORITIES),
  assignee_id: optUuid,
});

// --- Team ---------------------------------------------------------------------------------
export const inviteStaffSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).max(320),
  full_name: optText(120),
  role: z.enum(STAFF_ROLES),
});

export const staffUpdateSchema = z.object({
  role: z.enum(STAFF_ROLES),
  suspended: checkbox,
});

// --- Mailbox (0302) -------------------------------------------------------------------
const host = z
  .string()
  .trim()
  .min(1, { error: "Serveur obligatoire." })
  .max(255)
  .regex(/^[a-z0-9.-]+$/i, { error: "Nom de serveur invalide." });
const port = z.coerce.number().int().min(1).max(65535);

export const mailSettingsSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).max(320),
  display_name: optText(120),
  username: z.string().trim().max(320).optional().transform((v) => v || null),
  /** Empty = keep the stored password. */
  password: z.string().max(500).optional().transform((v) => v || null),
  imap_host: host,
  imap_port: port.default(993),
  smtp_host: host,
  smtp_port: port.default(465),
  signature: optText(2000),
});

export const composeSchema = z.object({
  to: reqText(5000, "Le destinataire"),
  cc: optText(5000),
  bcc: optText(5000),
  subject: z.string().trim().max(500).optional().transform((v) => v ?? ""),
  body: z.string().max(200_000).optional().transform((v) => v ?? ""),
  in_reply_to: optText(1000),
  references: optText(10000),
  reply_folder: optText(1000),
  reply_uid: z.coerce.number().int().positive().optional(),
});
