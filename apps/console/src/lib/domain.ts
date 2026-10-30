/**
 * Domain enums, French labels and badge colors. Values mirror the CHECK
 * constraints of migrations 0001 / 0100-0102: change both together.
 */
import type { StatusBadgeVariant } from "@/components/shared/status-badge";

type Labeled<T extends string> = Record<T, { label: string; variant: StatusBadgeVariant }>;

// --- Leads (0001 — values are French in the database) ---------------------------
export const LEAD_STATUSES = ["Nouveau", "Contacté", "Qualifié", "Proposition", "Gagné", "Perdu"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_STATUS_META: Labeled<LeadStatus> = {
  Nouveau: { label: "Nouveau", variant: "info" },
  Contacté: { label: "Contacté", variant: "purple" },
  Qualifié: { label: "Qualifié", variant: "caution" },
  Proposition: { label: "Proposition", variant: "warning" },
  Gagné: { label: "Gagné", variant: "success" },
  Perdu: { label: "Perdu", variant: "neutral" },
};
/** Statuses counted in the open pipeline. */
export const OPEN_LEAD_STATUSES: readonly LeadStatus[] = ["Nouveau", "Contacté", "Qualifié", "Proposition"];

export const LEAD_PRIORITIES = ["Basse", "Moyenne", "Haute"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

// --- Organizations (0003 + 0100) -------------------------------------------------
export const ORG_STATUSES = ["prospect", "active", "inactive"] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];
export const ORG_STATUS_META: Labeled<OrgStatus> = {
  prospect: { label: "Prospect", variant: "info" },
  active: { label: "Actif", variant: "success" },
  inactive: { label: "Inactif", variant: "neutral" },
};
export const ORG_SIZE_BANDS = ["1-9", "10-49", "50-249", "250-4999", "5000+"] as const;

// --- Projects ----------------------------------------------------------------------
export const PROJECT_STATUSES = ["draft", "active", "on_hold", "completed", "cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_META: Labeled<ProjectStatus> = {
  draft: { label: "Brouillon", variant: "neutral" },
  active: { label: "En cours", variant: "info" },
  on_hold: { label: "En pause", variant: "caution" },
  completed: { label: "Terminé", variant: "success" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

export const MILESTONE_STATUSES = ["planned", "in_progress", "done"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
export const MILESTONE_STATUS_META: Labeled<MilestoneStatus> = {
  planned: { label: "À venir", variant: "neutral" },
  in_progress: { label: "En cours", variant: "info" },
  done: { label: "Terminé", variant: "success" },
};

// --- Tasks (planning) ----------------------------------------------------------------
export const TASK_STATUSES = ["backlog", "in_progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_STATUS_META: Labeled<TaskStatus> = {
  backlog: { label: "À faire", variant: "neutral" },
  in_progress: { label: "En cours", variant: "info" },
  review: { label: "En revue", variant: "purple" },
  done: { label: "Terminé", variant: "success" },
};
export const TASK_PRIORITIES = ["urgent", "high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export const TASK_PRIORITY_META: Labeled<TaskPriority> = {
  urgent: { label: "Urgente", variant: "destructive" },
  high: { label: "Haute", variant: "warning" },
  medium: { label: "Moyenne", variant: "caution" },
  low: { label: "Basse", variant: "neutral" },
};
export const TASK_TYPES = ["task", "bug", "feature", "improvement", "chore"] as const;
export type TaskType = (typeof TASK_TYPES)[number];
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  task: "Tâche",
  bug: "Bug",
  feature: "Fonctionnalité",
  improvement: "Amélioration",
  chore: "Maintenance",
};

// --- Documents ---------------------------------------------------------------------
export const DOCUMENT_KINDS = ["deliverable", "contract", "report", "other"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  deliverable: "Livrable",
  contract: "Contrat",
  report: "Compte rendu",
  other: "Autre",
};

// --- Billing (0101) -------------------------------------------------------------------
export const QUOTE_STATUSES = ["draft", "sent", "accepted", "declined", "expired"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
export const QUOTE_STATUS_META: Labeled<QuoteStatus> = {
  draft: { label: "Brouillon", variant: "neutral" },
  sent: { label: "Envoyé", variant: "info" },
  accepted: { label: "Accepté", variant: "success" },
  declined: { label: "Refusé", variant: "destructive" },
  expired: { label: "Expiré", variant: "caution" },
};

export const INVOICE_STATUSES = ["draft", "sent", "paid", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_META: Labeled<InvoiceStatus> = {
  draft: { label: "Brouillon", variant: "neutral" },
  sent: { label: "Envoyée", variant: "info" },
  paid: { label: "Payée", variant: "success" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export const DEFAULT_VAT_RATE = 20;

// --- Client requests (0102) ----------------------------------------------------------
export const REQUEST_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const REQUEST_STATUS_META: Labeled<RequestStatus> = {
  open: { label: "Ouverte", variant: "info" },
  in_progress: { label: "En cours", variant: "purple" },
  resolved: { label: "Résolue", variant: "success" },
  closed: { label: "Fermée", variant: "neutral" },
};
export const REQUEST_CATEGORIES = ["question", "change", "bug", "other"] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];
export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
  question: "Question",
  change: "Demande d'évolution",
  bug: "Problème / anomalie",
  other: "Autre",
};
export const REQUEST_PRIORITIES = ["low", "normal", "high"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];
export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
};

/** "ACME" + 7 → "ACME-007". */
export function formatTaskKey(code: string | null | undefined, number: number | null | undefined): string {
  if (number == null) return code ? `${code}-?` : "—";
  return `${code ?? "#"}-${String(number).padStart(3, "0")}`;
}

/** "acme-7" / "ACME-007" → { code: "ACME", number: 7 }. */
export function parseTaskKey(key: string): { code: string; number: number } | null {
  const m = /^([A-Za-z][A-Za-z0-9]{1,9})-(\d{1,7})$/.exec(key.trim());
  if (!m) return null;
  return { code: m[1].toUpperCase(), number: Number.parseInt(m[2], 10) };
}

export function metaOf(
  meta: Readonly<Record<string, { label: string; variant: StatusBadgeVariant }>>,
  value: string | null | undefined,
): { label: string; variant: StatusBadgeVariant } {
  return (value && meta[value]) || { label: value ?? "—", variant: "neutral" };
}
