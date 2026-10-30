import Image from "next/image";
import { MODALITY_LABELS, formatDate, formatHours } from "@/lib/format";
import type { Certificate } from "@/lib/types";

/**
 * Printable "attestation de fin de formation" (article L6353-1 du Code du
 * travail: objectifs, nature, durée de l'action, résultats de l'évaluation
 * des acquis). Rendered in HTML and printed / saved as PDF from the browser.
 */
export function CertificateSheet({
  certificate,
  objectives,
  assessment,
  verifyUrl,
}: {
  certificate: Certificate;
  objectives: string[];
  assessment: string;
  verifyUrl: string;
}) {
  return (
    <div className="print-sheet mx-auto max-w-[210mm] rounded-2xl border bg-white p-10 text-neutral-900 shadow-sm sm:p-14">
      <div className="flex items-start justify-between gap-6">
        <Image src="/logo.svg" alt="Agenfy" width={140} height={45} className="h-10 w-auto" />
        <div className="text-right text-xs text-neutral-500">
          <p>Attestation n°</p>
          <p className="font-mono text-sm font-semibold text-neutral-900">{certificate.number}</p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3200F8]">Attestation de fin de formation</p>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#3200F8] to-[#AA0BE2]" />
      </div>

      <div className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <p>
          Hasfy SAS, exploitant la marque Agenfy, atteste que <strong>{certificate.learner_name}</strong> a suivi
          l&apos;action de formation :
        </p>
        <p className="text-center text-xl font-bold">{certificate.course_title}</p>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-neutral-200">
              <th scope="row" className="py-2 pr-4 text-left font-medium text-neutral-500">Nature de l&apos;action</th>
              <td className="py-2">Action de formation (article L6313-1 du Code du travail)</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <th scope="row" className="py-2 pr-4 text-left font-medium text-neutral-500">Dates</th>
              <td className="py-2">
                du {formatDate(certificate.training_start)} au {formatDate(certificate.training_end)}
              </td>
            </tr>
            <tr className="border-b border-neutral-200">
              <th scope="row" className="py-2 pr-4 text-left font-medium text-neutral-500">Durée</th>
              <td className="py-2">{formatHours(Number(certificate.duration_hours))}</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <th scope="row" className="py-2 pr-4 text-left font-medium text-neutral-500">Modalité</th>
              <td className="py-2">{MODALITY_LABELS[certificate.modality]}</td>
            </tr>
          </tbody>
        </table>

        <div>
          <p className="font-medium">Objectifs de la formation</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
            {objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium">Résultats de l&apos;évaluation des acquis</p>
          <p className="mt-1 text-sm">{assessment}</p>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-sm">
          <p>Fait le {formatDate(certificate.issued_at)}</p>
          <p className="mt-6 font-medium">Pour Hasfy SAS — Agenfy</p>
          <p className="text-neutral-500">Evan Massé, fondateur</p>
        </div>
        <div className="max-w-xs text-xs text-neutral-500 sm:text-right">
          <p>Authenticité vérifiable en ligne :</p>
          <p className="break-all font-mono text-neutral-900">{verifyUrl}</p>
        </div>
      </div>
    </div>
  );
}
