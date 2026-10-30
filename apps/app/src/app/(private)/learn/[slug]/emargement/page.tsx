import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Notice, PageTitle } from "@/components/notice";
import { SignaturePad } from "@/components/signature-pad";
import { SubmitButton } from "@/components/submit-button";
import { getLearnerCourse } from "@/lib/learner";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatTime } from "@/lib/format";
import { isSignatureWindowOpen } from "@/lib/progress";
import type { Attendance, Session } from "@/lib/types";
import { signAttendance } from "../../actions";

export const metadata: Metadata = { title: "Émargement" };

const ERRORS: Record<string, string> = {
  signature: "Signez dans le cadre avant de valider.",
  window: "L'émargement n'est possible que de 30 minutes avant le début à 1 heure après la fin de la session.",
  already: "Vous avez déjà signé pour cette session.",
  failed: "La signature n'a pas pu être enregistrée. Réessayez ou prévenez votre formateur.",
};

export default async function EmargementPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; signed?: string }>;
}) {
  const { slug } = await params;
  const { error, signed } = await searchParams;
  const { course, enrollment } = await getLearnerCourse(slug);
  const supabase = await createClient();

  const [{ data: sessionsData }, { data: attendanceData }] = enrollment.cohort_id
    ? await Promise.all([
        supabase.from("sessions").select("*").eq("cohort_id", enrollment.cohort_id).order("starts_at"),
        supabase.from("attendance").select("*").eq("enrollment_id", enrollment.id),
      ])
    : [{ data: [] }, { data: [] }];
  const sessions = (sessionsData ?? []) as Session[];
  const attendance = new Map(((attendanceData ?? []) as Attendance[]).map((a) => [a.session_id, a]));
  const now = new Date();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/learn/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {course.title}
      </Link>
      <PageTitle
        title="Émargement"
        description="Signez votre présence pour chaque demi-journée de formation. L'heure de signature est enregistrée par le serveur."
      />
      {error && ERRORS[error] && (
        <Notice tone="error" className="mb-6">
          {ERRORS[error]}
        </Notice>
      )}
      {signed && (
        <Notice tone="success" className="mb-6">
          Présence enregistrée. Merci !
        </Notice>
      )}

      {sessions.length === 0 ? (
        <Notice>Aucune session live n&apos;est planifiée pour votre groupe.</Notice>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => {
            const a = attendance.get(s.id);
            const open = isSignatureWindowOpen(s.starts_at, s.ends_at, now);
            return (
              <li key={s.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {s.title ?? course.title}{" "}
                      <span className="text-muted-foreground">({s.half_day === "am" ? "matin" : "après-midi"})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(s.starts_at)} – {formatTime(s.ends_at)}
                      {s.location ? ` · ${s.location}` : ""}
                    </p>
                  </div>
                  {a?.signed_at ? (
                    <Badge>
                      <CheckCircle2 /> Signé le {formatDateTime(a.signed_at)}
                    </Badge>
                  ) : a?.status === "absent" ? (
                    <Badge variant="destructive">Absent</Badge>
                  ) : a?.status === "excused" ? (
                    <Badge variant="secondary">Absence excusée</Badge>
                  ) : a?.status === "present" ? (
                    <Badge>Présence relevée par le formateur</Badge>
                  ) : open ? (
                    <Badge variant="outline">Émargement ouvert</Badge>
                  ) : new Date(s.starts_at) > now ? (
                    <Badge variant="secondary">À venir</Badge>
                  ) : (
                    <Badge variant="secondary">Non signé</Badge>
                  )}
                </div>
                {s.meeting_url && open && (
                  <a
                    href={s.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Video className="size-4" /> Rejoindre la classe virtuelle
                  </a>
                )}
                {open && !a?.signed_at && (
                  <form action={signAttendance} className="mt-4">
                    <input type="hidden" name="course" value={slug} />
                    <input type="hidden" name="session_id" value={s.id} />
                    <SignaturePad />
                    <SubmitButton className="mt-3 rounded-full gradient-btn border-0 text-white" pendingLabel="Enregistrement…">
                      Je signe ma présence
                    </SubmitButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
