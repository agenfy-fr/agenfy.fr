import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { normalizeCertificateNumber } from "@/lib/certificates";

export const metadata: Metadata = {
  title: "Vérifier une attestation",
  description: "Vérifiez l'authenticité d'une attestation de fin de formation délivrée par Agenfy.",
};

async function lookup(formData: FormData) {
  "use server";
  const number = normalizeCertificateNumber(String(formData.get("number") ?? ""));
  if (!number) redirect("/verify?error=1");
  redirect(`/verify/${encodeURIComponent(number)}`);
}

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <ShieldCheck className="mb-4 size-10 text-primary" aria-hidden />
      <h1 className="text-h1 font-bold">Vérifier une attestation</h1>
      <p className="mt-3 text-muted-foreground">
        Saisissez le numéro figurant en haut à droite de l&apos;attestation (format AGF-AAAA-NNNNN-C).
      </p>
      {error && (
        <Notice tone="error" className="mt-6">
          Indiquez un numéro d&apos;attestation.
        </Notice>
      )}
      <form action={lookup} className="mt-6 flex gap-2">
        <label htmlFor="number" className="sr-only">
          Numéro d&apos;attestation
        </label>
        <Input id="number" name="number" placeholder="AGF-2026-00001-4" required className="font-mono" />
        <SubmitButton className="rounded-full">Vérifier</SubmitButton>
      </form>
    </div>
  );
}
