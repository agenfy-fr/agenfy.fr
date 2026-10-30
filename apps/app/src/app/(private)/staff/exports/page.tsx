import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageTitle } from "@/components/notice";
import { EXPORTS } from "@/lib/exports";

export const metadata: Metadata = { title: "Exports Qualiopi" };

export default function ExportsPage() {
  return (
    <>
      <PageTitle
        title="Exports (preuves Qualiopi)"
        description="Fichiers CSV (séparateur « ; », UTF-8) prêts à archiver comme éléments de preuve. Voir apps/app/docs/QUALIOPI.md pour la correspondance avec les indicateurs."
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {Object.entries(EXPORTS).map(([key, e]) => (
          <li key={key}>
            <a href={`/staff/exports/${key}`} className="flex h-full items-start gap-3 rounded-2xl border bg-card p-5 hover:border-primary">
              <Download className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">{e.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{e.description}</span>
                <span className="mt-2 block text-xs text-muted-foreground">Indicateurs : {e.indicators}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
