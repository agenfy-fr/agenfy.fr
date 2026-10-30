import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { ENROLLMENT_STATUS_LABELS, formatDate } from "@/lib/format";
import type { Enrollment, Person } from "@/lib/types";
import { enrollLearner, issueCertificateForEnrollment, setEnrollmentStatus } from "../actions";

export const metadata: Metadata = { title: "Inscriptions" };

const ERRORS: Record<string, string> = {
  invalid: "Formulaire invalide : e-mail et formation requis.",
  "no-account":
    "Aucun compte pour cet e-mail et SUPABASE_SERVICE_ROLE_KEY n'est pas configurée : invitez l'utilisateur depuis le tableau de bord Supabase (Authentication → Invite), puis recommencez.",
  invite: "L'invitation n'a pas pu être envoyée.",
  cohort: "La session choisie ne correspond pas à cette formation.",
  failed: "L'inscription a échoué (droits insuffisants ?).",
  name: "L'apprenant n'a pas renseigné son nom : impossible d'émettre l'attestation.",
  certificate: "L'attestation n'a pas pu être émise.",
};

const OK: Record<string, string> = {
  enrolled: "Apprenant inscrit.",
  invited: "Invitation envoyée et apprenant inscrit.",
  certificate: "Attestation émise.",
};

const selectClass = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

type Row = Enrollment & {
  courses: { title: string } | null;
  organizations: { name: string } | null;
  cohorts: { name: string } | null;
  certificates: { number: string }[];
};

export default async function EnrollmentsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const [{ data: courses }, { data: orgs }, { data: cohorts }, { data }, { data: people }] = await Promise.all([
    supabase.from("courses").select("id, title").neq("status", "archived").order("title"),
    supabase.from("organizations").select("id, name").order("name"),
    supabase.from("cohorts").select("id, name, course_id").neq("status", "cancelled").order("start_date", { ascending: false }),
    supabase
      .from("enrollments")
      .select("*, courses(title), organizations(name), cohorts(name), certificates(number)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.rpc("training_people"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const directory = new Map(((people ?? []) as Person[]).map((p) => [p.user_id, p]));

  return (
    <>
      <PageTitle title="Inscriptions" description="Inscrire un apprenant à une formation et suivre les inscriptions." />
      {error && ERRORS[error] && (
        <Notice tone="error" className="mb-6">
          {ERRORS[error]}
        </Notice>
      )}
      {ok && OK[ok] && (
        <Notice tone="success" className="mb-6">
          {OK[ok]}
        </Notice>
      )}

      <form action={enrollLearner} className="mb-10 grid gap-4 rounded-2xl border bg-card p-6 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Inscrire un apprenant</h2>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">E-mail *</label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">Nom complet (si nouveau compte)</label>
          <Input id="full_name" name="full_name" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="course_id" className="text-sm font-medium">Formation *</label>
          <select id="course_id" name="course_id" required className={selectClass}>
            {(courses ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="organization_id" className="text-sm font-medium">Organisation cliente</label>
          <select id="organization_id" name="organization_id" className={selectClass} defaultValue="">
            <option value="">— Individuel —</option>
            {(orgs ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="cohort_id" className="text-sm font-medium">Session / groupe (pour l&apos;émargement)</label>
          <select id="cohort_id" name="cohort_id" className={selectClass} defaultValue="">
            <option value="">— Aucun (e-learning) —</option>
            {(cohorts ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {(courses ?? []).find((x) => x.id === c.course_id)?.title}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <SubmitButton className="rounded-full gradient-btn border-0 text-white">Inscrire</SubmitButton>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Apprenant</th>
              <th scope="col" className="px-4 py-3">Formation</th>
              <th scope="col" className="px-4 py-3">Organisation / groupe</th>
              <th scope="col" className="px-4 py-3">Statut</th>
              <th scope="col" className="px-4 py-3">Progression</th>
              <th scope="col" className="px-4 py-3">Attestation</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const p = directory.get(r.user_id);
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p?.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{p?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.courses?.title}
                    <p className="text-xs text-muted-foreground">inscrit le {formatDate(r.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.organizations?.name ?? "Individuel"}
                    {r.cohorts && <p className="text-muted-foreground">{r.cohorts.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "completed" ? "default" : r.status === "cancelled" ? "destructive" : "secondary"}>
                      {ENROLLMENT_STATUS_LABELS[r.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.progress_percent} %</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.certificates[0]?.number ??
                      (r.status !== "cancelled" ? (
                        <form action={issueCertificateForEnrollment}>
                          <input type="hidden" name="enrollment_id" value={r.id} />
                          <SubmitButton size="sm" variant="outline">Émettre</SubmitButton>
                        </form>
                      ) : (
                        "—"
                      ))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={setEnrollmentStatus}>
                      <input type="hidden" name="enrollment_id" value={r.id} />
                      <input type="hidden" name="status" value={r.status === "cancelled" ? "active" : "cancelled"} />
                      <SubmitButton size="sm" variant="ghost">
                        {r.status === "cancelled" ? "Réactiver" : "Annuler"}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
