import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PrintButton } from "@/components/print-button";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { Attendance, Cohort, Person, Session } from "@/lib/types";
import { recordAttendance } from "../../actions";

export const metadata: Metadata = { title: "Feuille d'émargement" };

const STATUS = { present: "Présent", absent: "Absent", excused: "Absence excusée" } as const;

export default async function AttendanceSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle<Session>();
  if (!session) notFound();

  const [{ data: cohort }, { data: enrollments }, { data: attendanceData }, { data: people }] = await Promise.all([
    supabase.from("cohorts").select("*, courses(title)").eq("id", session.cohort_id).single(),
    supabase.from("enrollments").select("id, user_id").eq("cohort_id", session.cohort_id).neq("status", "cancelled"),
    supabase
      .from("attendance")
      .select("id, session_id, enrollment_id, user_id, status, signed_at, signer_ip, signer_user_agent, note, signature_data")
      .eq("session_id", id),
    supabase.rpc("training_people"),
  ]);
  const c = cohort as (Cohort & { courses: { title: string } | null }) | null;
  const attendance = new Map(
    ((attendanceData ?? []) as (Attendance & { signature_data: string | null })[]).map((a) => [a.user_id, a]),
  );
  const directory = new Map(((people ?? []) as Person[]).map((p) => [p.user_id, p]));

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/staff/sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Sessions
        </Link>
        <div className="flex gap-2">
          <a href={`/staff/exports/attendance?session=${id}`} className="rounded-full border px-4 py-2 text-sm hover:bg-secondary">
            Export CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="print-sheet rounded-2xl border bg-card p-6">
        <h1 className="text-h2 font-bold">Feuille d&apos;émargement</h1>
        <dl className="mt-4 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <div><dt className="inline text-muted-foreground">Formation : </dt><dd className="inline font-medium">{c?.courses?.title}</dd></div>
          <div><dt className="inline text-muted-foreground">Groupe : </dt><dd className="inline">{c?.name}</dd></div>
          <div>
            <dt className="inline text-muted-foreground">Date : </dt>
            <dd className="inline">
              {formatDate(session.starts_at)}, {formatTime(session.starts_at)} – {formatTime(session.ends_at)} (
              {session.half_day === "am" ? "matin" : "après-midi"})
            </dd>
          </div>
          <div><dt className="inline text-muted-foreground">Lieu / modalité : </dt><dd className="inline">{session.location ?? (session.meeting_url ? "Classe virtuelle" : "—")}</dd></div>
          <div><dt className="inline text-muted-foreground">Organisme : </dt><dd className="inline">Hasfy SAS — Agenfy</dd></div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="py-2 pr-3">Apprenant</th>
                <th scope="col" className="py-2 pr-3">Statut</th>
                <th scope="col" className="py-2 pr-3">Signature</th>
                <th scope="col" className="py-2 pr-3">Horodatage (serveur)</th>
                <th scope="col" className="no-print py-2">Relevé formateur</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(enrollments ?? []).map((e) => {
                const a = attendance.get(e.user_id);
                const p = directory.get(e.user_id);
                return (
                  <tr key={e.id} className="align-top">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{p?.full_name || p?.email}</p>
                      {p?.full_name && <p className="text-xs text-muted-foreground">{p.email}</p>}
                    </td>
                    <td className="py-3 pr-3">{a ? STATUS[a.status] : "—"}{a?.note && <p className="text-xs text-muted-foreground">{a.note}</p>}</td>
                    <td className="py-3 pr-3">
                      {a?.signature_data?.startsWith("data:image/png;base64,") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.signature_data} alt={`Signature de ${p?.full_name ?? "l'apprenant"}`} className="h-12 w-auto bg-white" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {a?.signed_at ? (
                        <>
                          {formatDateTime(a.signed_at)}
                          <p className="text-muted-foreground">IP {a.signer_ip || "—"}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="no-print py-3">
                      <form action={recordAttendance} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="session_id" value={id} />
                        <input type="hidden" name="enrollment_id" value={e.id} />
                        <input type="hidden" name="user_id" value={e.user_id} />
                        <select name="status" defaultValue={a?.status ?? "present"} className="h-8 rounded-md border border-input bg-transparent px-2 text-xs" aria-label="Statut">
                          {Object.entries(STATUS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <Input name="note" defaultValue={a?.note ?? ""} placeholder="Note" className="h-8 w-32 text-xs" aria-label="Note" />
                        <SubmitButton size="sm" variant="outline">OK</SubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-muted-foreground">Signature du formateur</p>
            <div className="mt-2 h-16 border-b" />
          </div>
        </div>
      </div>
    </div>
  );
}
