import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_STATUS_LABELS, formatDateTime } from "@/lib/format";
import type { Complaint, Person } from "@/lib/types";
import { updateComplaint } from "../actions";

export const metadata: Metadata = { title: "Registre des réclamations" };

type Row = Complaint & { courses: { title: string } | null };

export default async function ComplaintsRegisterPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: people }] = await Promise.all([
    supabase.from("complaints").select("*, courses(title)").order("created_at", { ascending: false }),
    supabase.rpc("training_people"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const directory = new Map(((people ?? []) as Person[]).map((p) => [p.user_id, p]));

  return (
    <>
      <PageTitle
        title="Registre des réclamations"
        description="Réclamations et difficultés signalées, réponses apportées et actions d'amélioration."
        actions={
          // CSV download from a route handler: a plain link, not client navigation.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/staff/exports/complaints" className="rounded-full border px-4 py-2 text-sm hover:bg-secondary">
            Export CSV
          </a>
        }
      />
      {ok && <Notice tone="success" className="mb-6">Réclamation mise à jour.</Notice>}
      {error && <Notice tone="error" className="mb-6">La mise à jour a échoué.</Notice>}
      {rows.length === 0 ? (
        <p className="text-muted-foreground">Aucune réclamation enregistrée.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((c) => {
            const p = c.user_id ? directory.get(c.user_id) : null;
            return (
              <li key={c.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{c.subject}</p>
                  <Badge variant={c.status === "open" ? "destructive" : c.status === "in_progress" ? "secondary" : "default"}>
                    {COMPLAINT_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(c.created_at)} · {p?.full_name || p?.email || "Anonyme"}
                  {c.courses ? ` · ${c.courses.title}` : ""} · canal : {c.channel}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm">{c.description}</p>
                <form action={updateComplaint} className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
                  <input type="hidden" name="complaint_id" value={c.id} />
                  <div className="space-y-1.5">
                    <label htmlFor={`r-${c.id}`} className="text-xs font-medium">Réponse à l&apos;apprenant</label>
                    <Textarea id={`r-${c.id}`} name="response" defaultValue={c.response ?? ""} rows={3} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`a-${c.id}`} className="text-xs font-medium">Action corrective / d&apos;amélioration</label>
                    <Textarea id={`a-${c.id}`} name="corrective_action" defaultValue={c.corrective_action ?? ""} rows={3} />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <select name="status" defaultValue={c.status} aria-label="Statut" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                      {Object.entries(COMPLAINT_STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <SubmitButton size="sm" className="rounded-full">Enregistrer</SubmitButton>
                    {c.resolved_at && <span className="text-xs text-muted-foreground">Résolue le {formatDateTime(c.resolved_at)}</span>}
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
