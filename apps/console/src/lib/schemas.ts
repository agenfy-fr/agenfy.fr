/**
 * Form / API validation (zod 4). Values mirror the CHECK constraints of the
 * migrations; the database remains the final authority.
 */
import { z } from "zod";
import { ORG_ROLES, STAFF_ROLES } from "./access-control";
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

export const inviteMemberSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).max(320),
  full_name: optText(120),
  role: z.enum(ORG_ROLES).default("member"),
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
