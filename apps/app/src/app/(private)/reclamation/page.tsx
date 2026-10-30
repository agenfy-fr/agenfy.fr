import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { COMPLAINT_STATUS_LABELS, formatDateTime } from "@/lib/format";
import type { Complaint } from "@/lib/types";

export const metadata: Metadata = { title: "Réclamation" };

async function fileComplaint(formData: FormData) {
  "use server";
  const viewer = await requireViewer("/reclamation");
  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const enrollmentId = String(formData.get("enrollment_id") ?? "");
  if (subject.length < 3 || subject.length > 200 || description.length < 10 || description.length > 5000) {
    redirect("/reclamation?error=1");
  }

  const supabase = await createClient();
  let courseId: string | null = null;
  let organizationId: string | null = null;
  if (enrollmentId) {
    const { data } = await supabase
      .from("enrollments")
      .select("course_id, organization_id")
      .eq("id", enrollmentId)
      .eq("user_id", viewer.id)
      .maybeSingle();
    courseId = data?.course_id ?? null;
    organizationId = data?.organization_id ?? null;
  }

  const { error } = await supabase.from("complaints").insert({
    user_id: viewer.id,
    subject,
    description,
    enrollment_id: courseId ? enrollmentId : null,
    course_id: courseId,
    organization_id: organizationId,
    channel: "platform",
  });
  if (error) redirect("/reclamation?error=1");
  revalidatePath("/reclamation");
  redirect("/reclamation?sent=1");
}

export default async function ComplaintPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const viewer = await requireViewer("/reclamation");
  const supabase = await createClient();
  const [{ data: enrollments }, { data: complaints }] = await Promise.all([
    supabase.from("enrollments").select("id, courses(title)").eq("user_id", viewer.id).neq("status", "cancelled"),
    supabase.from("complaints").select("*").eq("user_id", viewer.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle
        title="Réclamation ou difficulté"
        description="Un problème avec une formation, la plateforme ou l'organisation ? Décrivez-le : chaque demande est enregistrée, suivie et reçoit une réponse."
      />
      {error && (
        <Notice tone="error" className="mb-6">
          Vérifiez le formulaire (objet de 3 à 200 caractères, description d&apos;au moins 10 caractères).
        </Notice>
      )}
      {sent && (
        <Notice tone="success" className="mb-6">
          Votre demande a bien été enregistrée. Nous revenons vers vous rapidement.
        </Notice>
      )}

      <form action={fileComplaint} className="space-y-4 rounded-2xl border bg-card p-6">
        <div className="space-y-1.5">
          <label htmlFor="enrollment_id" className="text-sm font-medium">
            Formation concernée
          </label>
          <select
            id="enrollment_id"
            name="enrollment_id"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            defaultValue=""
          >
            <option value="">Aucune / général</option>
            {(enrollments ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {(e.courses as unknown as { title: string } | null)?.title ?? "Formation"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-sm font-medium">
            Objet
          </label>
          <Input id="subject" name="subject" required minLength={3} maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" required minLength={10} maxLength={5000} rows={6} />
        </div>
        <SubmitButton className="rounded-full gradient-btn border-0 text-white">Envoyer</SubmitButton>
      </form>

      {(complaints ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-semibold">Mes demandes</h2>
          <ul className="space-y-3">
            {(complaints as Complaint[]).map((c) => (
              <li key={c.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{c.subject}</p>
                  <Badge variant={c.status === "resolved" || c.status === "closed" ? "default" : "secondary"}>
                    {COMPLAINT_STATUS_LABELS[c.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
                {c.response && (
                  <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Réponse d&apos;Agenfy</p>
                    <p className="whitespace-pre-line">{c.response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
