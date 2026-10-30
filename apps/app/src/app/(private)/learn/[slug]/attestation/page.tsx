import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { CertificateSheet } from "@/components/certificate-sheet";
import { PrintButton } from "@/components/print-button";
import { getLearnerCourse } from "@/lib/learner";
import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/supabase/env";
import { assessmentSummary } from "@/lib/assessment";
import type { Certificate } from "@/lib/types";
import { requestCertificate } from "../../actions";

export const metadata: Metadata = { title: "Attestation de fin de formation" };

export default async function AttestationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const { course, enrollment, modules, certificate } = await getLearnerCourse(slug);

  const back = (
    <Link href={`/learn/${slug}`} className="no-print mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {course.title}
    </Link>
  );

  if (certificate) {
    const supabase = await createClient();
    const { data } = await supabase.from("certificates").select("*").eq("id", certificate.id).single<Certificate>();
    if (data) {
      return (
        <div>
          {back}
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Imprimez l&apos;attestation ou enregistrez-la en PDF depuis la fenêtre d&apos;impression.
            </p>
            <PrintButton />
          </div>
          {data.revoked_at && (
            <Notice tone="error" className="no-print mb-6">
              Cette attestation a été révoquée. Contactez Agenfy.
            </Notice>
          )}
          <CertificateSheet
            certificate={data}
            objectives={course.objectives}
            assessment={assessmentSummary(modules)}
            verifyUrl={`${appUrl()}/verify/${data.number}`}
          />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {back}
      <PageTitle title="Attestation de fin de formation" />
      {error === "name" && (
        <Notice tone="error" className="mb-4">
          Renseignez votre nom complet dans{" "}
          <Link href="/compte" className="underline">
            votre compte
          </Link>{" "}
          : il figurera sur l&apos;attestation.
        </Notice>
      )}
      {error === "failed" && (
        <Notice tone="error" className="mb-4">
          L&apos;attestation n&apos;a pas pu être générée. Réessayez ou contactez Agenfy.
        </Notice>
      )}
      {enrollment.status === "completed" ? (
        <div className="rounded-2xl border bg-card p-6">
          <p>Félicitations, vous avez terminé la formation. Votre attestation est prête à être générée.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Elle reçoit un numéro unique, vérifiable publiquement. Vérifiez que votre nom est correct dans votre
            compte avant de la générer : il ne pourra plus être modifié ensuite.
          </p>
          <form action={requestCertificate} className="mt-5 flex flex-wrap gap-2">
            <input type="hidden" name="course" value={slug} />
            <SubmitButton className="rounded-full gradient-btn border-0 text-white" pendingLabel="Génération…">
              Générer mon attestation
            </SubmitButton>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/compte">Vérifier mon nom</Link>
            </Button>
          </form>
        </div>
      ) : (
        <Notice>
          L&apos;attestation sera disponible lorsque vous aurez terminé toutes les leçons (progression actuelle :{" "}
          {enrollment.progress_percent} %).
        </Notice>
      )}
    </div>
  );
}
