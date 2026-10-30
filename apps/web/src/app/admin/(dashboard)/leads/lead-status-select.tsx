"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "./actions";

const STATUSES = ["Nouveau", "Contacté", "Qualifié", "Proposition", "Gagné", "Perdu"];

const STATUS_STYLES: Record<string, string> = {
  Nouveau: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  Contacté: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  Qualifié: "border-purple-500/30 bg-purple-500/10 text-purple-500",
  Proposition: "border-orange-500/30 bg-orange-500/10 text-orange-500",
  Gagné: "border-green-500/30 bg-green-500/10 text-green-500",
  Perdu: "border-red-500/30 bg-red-500/10 text-red-500",
};

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await updateLeadStatus(leadId, next);
        });
      }}
      className={`rounded-full border px-3 py-1 text-xs font-medium outline-none disabled:opacity-50 ${
        STATUS_STYLES[status] ?? "border-border bg-secondary text-foreground"
      }`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-background text-foreground">
          {s}
        </option>
      ))}
    </select>
  );
}
