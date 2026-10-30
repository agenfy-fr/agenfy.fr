import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/server";
import { isValidCertificateNumber, normalizeCertificateNumber } from "@/lib/certificates";
import { MODALITY_LABELS, formatDate, formatHours } from "@/lib/format";
import type { Modality } from "@/lib/types";

export const metadata: Metadata = { title: "Vérification d'attestation" };

interface VerifiedCertificate {
  number: string;
  learner_name: string;
  course_title: string;
  duration_hours: number;
  modality: Modality;
  training_start: string | null;
  training_end: string | null;
  issued_at: string;
  revoked: boolean;
}

export default async function VerifyNumberPage({ params }: { params: Promise<{ number: string }> }) {
  await connection();
  const { number: raw } = await params;
  const number = normalizeCertificateNumber(decodeURIComponent(raw));
  const wellFormed = isValidCertificateNumber(number);

  let cert: VerifiedCertificate | null = null;
  if (wellFormed) {
    const supabase = createPublicClient();
    const { data } = supabase ? await supabase.rpc("verify_certificate", { p_number: number }) : { data: null };
    cert = ((data as VerifiedCertificate[] | null) ?? [])[0] ?? null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="font-mono text-sm text-muted-foreground">{number}</p>
      {cert && !cert.revoked ? (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h1 className="flex items-center gap-2 text-h2 font-bold">
            <BadgeCheck className="size-7 text-primary" aria-hidden /> Attestation authentique
          </h1>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Bénéficiaire</dt>
            <dd className="font-medium">{cert.learner_name}</dd>
            <dt className="text-muted-foreground">Formation</dt>
            <dd className="font-medium">{cert.course_title}</dd>
            <dt className="text-muted-foreground">Dates</dt>
            <dd>
              du {formatDate(cert.training_start)} au {formatDate(cert.training_end)}
            </dd>
            <dt className="text-muted-foreground">Durée</dt>
            <dd>{formatHours(Number(cert.duration_hours))}</dd>
            <dt className="text-muted-foreground">Modalité</dt>
            <dd>{MODALITY_LABELS[cert.modality]}</dd>
            <dt className="text-muted-foreground">Délivrée le</dt>
            <dd>{formatDate(cert.issued_at)}</dd>
          </dl>
          <p className="mt-6 text-xs text-muted-foreground">Délivrée par Hasfy SAS (Agenfy).</p>
        </div>
      ) : cert?.revoked ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="flex items-center gap-2 text-h2 font-bold">
            <ShieldAlert className="size-7 text-destructive" aria-hidden /> Attestation révoquée
          </h1>
          <p className="mt-3 text-sm">Cette attestation a été émise puis révoquée par Agenfy. Elle n&apos;est plus valable.</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border p-6">
          <h1 className="flex items-center gap-2 text-h2 font-bold">
            <ShieldX className="size-7 text-destructive" aria-hidden /> Attestation introuvable
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {wellFormed
              ? "Aucune attestation ne correspond à ce numéro."
              : "Ce numéro n'est pas valide (format ou chiffre de contrôle incorrect). Vérifiez la saisie."}
          </p>
        </div>
      )}
      <Link href="/verify" className="mt-6 inline-block text-sm text-primary hover:underline">
        Vérifier un autre numéro
      </Link>
    </div>
  );
}
