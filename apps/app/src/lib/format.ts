import type { Modality } from "./types";

export const MODALITY_LABELS: Record<Modality, string> = {
  presentiel: "Présentiel",
  distanciel: "Classe virtuelle",
  hybride: "Hybride",
  elearning: "E-learning",
};

export const LEVEL_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const CATEGORY_LABELS: Record<string, string> = {
  essentiels: "Essentiels",
  technique: "Technique",
  management: "Management",
};

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  active: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  open: "Ouverte",
  in_progress: "En traitement",
  resolved: "Résolue",
  closed: "Clôturée",
};

const TZ = "Europe/Paris";

export function formatPrice(cents: number | null, label: string | null): string {
  if (cents === null) return label ?? "Sur devis";
  const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
  return `${euros} HT${label ? ` ${label}` : ""}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function formatHours(hours: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(hours)} h`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: TZ }).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(
    new Date(value),
  );
}

export function formatTime(value: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", { timeStyle: "short", timeZone: TZ }).format(new Date(value));
}

export function formatRating(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)} / 5`;
}

export function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value} %`;
}
