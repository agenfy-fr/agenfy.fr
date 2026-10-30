import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { MODALITY_LABELS, formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { Cohort, Session } from "@/lib/types";
import { createCohort, createSession } from "../actions";

export const metadata: Metadata = { title: "Sessions & émargement" };

const selectClass = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const [{ data: courses }, { data: orgs }, { data: cohortsData }, { data: sessionsData }, { data: attendance }, { data: enrollments }] =
    await Promise.all([
      supabase.from("courses").select("id, title").neq("status", "archived").order("title"),
      supabase.from("organizations").select("id, name").order("name"),
      supabase.from("cohorts").select("*").order("start_date", { ascending: false }),
      supabase.from("sessions").select("*").order("starts_at"),
      supabase.from("attendance").select("session_id, status, signed_at"),
      supabase.from("enrollments").select("cohort_id").neq("status", "cancelled").not("cohort_id", "is", null),
    ]);
  const cohorts = (cohortsData ?? []) as Cohort[];
  const sessions = (sessionsData ?? []) as Session[];

  return (
    <>
      <PageTitle
        title="Sessions & émargement"
        description="Groupes (cohortes), demi-journées de formation et feuilles d'émargement."
      />
      {error && (
        <Notice tone="error" className="mb-6">
          Enregistrement impossible : vérifiez les champs (date, heures, lien https://).
        </Notice>
      )}
      {ok && (
        <Notice tone="success" className="mb-6">
          Enregistré.
        </Notice>
      )}

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <form action={createCohort} className="grid gap-3 rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Nouveau groupe</h2>
          <label className="text-sm font-medium" htmlFor="c-course">Formation</label>
          <select id="c-course" name="course_id" required className={selectClass}>
            {(courses ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <label className="text-sm font-medium" htmlFor="c-name">Nom du groupe</label>
          <Input id="c-name" name="name" required minLength={3} placeholder="Ex. Intra ACME — juin" />
          <label className="text-sm font-medium" htmlFor="c-org">Organisation (intra)</label>
          <select id="c-org" name="organization_id" className={selectClass} defaultValue="">
            <option value="">— Inter-entreprises —</option>
            {(orgs ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium" htmlFor="c-start">Début</label>
              <Input id="c-start" name="start_date" type="date" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="c-end">Fin</label>
              <Input id="c-end" name="end_date" type="date" />
            </div>
          </div>
          <label className="text-sm font-medium" htmlFor="c-modality">Modalité</label>
          <select id="c-modality" name="modality" className={selectClass} defaultValue="distanciel">
            {Object.entries(MODALITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <label className="text-sm font-medium" htmlFor="c-location">Lieu</label>
          <Input id="c-location" name="location" />
          <SubmitButton className="mt-2 w-fit rounded-full">Créer le groupe</SubmitButton>
        </form>

        <form action={createSession} className="grid gap-3 rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Nouvelle demi-journée</h2>
          <label className="text-sm font-medium" htmlFor="s-cohort">Groupe</label>
          <select id="s-cohort" name="cohort_id" required className={selectClass}>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="text-sm font-medium" htmlFor="s-title">Intitulé (facultatif)</label>
          <Input id="s-title" name="title" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium" htmlFor="s-date">Date</label>
              <Input id="s-date" name="date" type="date" required />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="s-half">Demi-journée</label>
              <select id="s-half" name="half_day" className={selectClass}>
                <option value="am">Matin</option>
                <option value="pm">Après-midi</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="s-start">Début (heure de Paris)</label>
              <Input id="s-start" name="start" type="time" required defaultValue="09:00" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="s-end">Fin</label>
              <Input id="s-end" name="end" type="time" required defaultValue="12:30" />
            </div>
          </div>
          <label className="text-sm font-medium" htmlFor="s-url">Lien de classe virtuelle</label>
          <Input id="s-url" name="meeting_url" type="url" placeholder="https://" />
          <label className="text-sm font-medium" htmlFor="s-loc">Lieu</label>
          <Input id="s-loc" name="location" />
          <SubmitButton className="mt-2 w-fit rounded-full" >Ajouter</SubmitButton>
        </form>
      </div>

      {cohorts.length === 0 ? (
        <p className="text-muted-foreground">Aucun groupe pour le moment.</p>
      ) : (
        <div className="space-y-6">
          {cohorts.map((c) => {
            const list = sessions.filter((s) => s.cohort_id === c.id);
            const learners = (enrollments ?? []).filter((e) => e.cohort_id === c.id).length;
            return (
              <section key={c.id} className="rounded-2xl border bg-card">
                <div className="border-b p-5">
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(courses ?? []).find((x) => x.id === c.course_id)?.title} · {MODALITY_LABELS[c.modality]} ·{" "}
                    {c.start_date ? `${formatDate(c.start_date)} → ${formatDate(c.end_date)}` : "dates à définir"} · {learners} apprenant(s)
                  </p>
                </div>
                {list.length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground">Aucune demi-journée planifiée.</p>
                ) : (
                  <ul className="divide-y">
                    {list.map((s) => {
                      const signed = (attendance ?? []).filter((a) => a.session_id === s.id && a.status === "present").length;
                      return (
                        <li key={s.id}>
                          <Link href={`/staff/sessions/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm hover:bg-secondary/60">
                            <span>
                              {formatDateTime(s.starts_at)} – {formatTime(s.ends_at)}{" "}
                              <span className="text-muted-foreground">({s.half_day === "am" ? "matin" : "après-midi"})</span>
                            </span>
                            <span className="text-muted-foreground">
                              {signed}/{learners} présent(s) · feuille d&apos;émargement →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
