import type { Metadata } from "next";
import { FileText, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { DOCUMENT_KIND_LABELS, type DocumentKind } from "@/lib/domain";
import { formatBytes, formatDate } from "@/lib/format";
import { portalScope } from "@/lib/server/portal";

export const metadata: Metadata = { title: "Documents" };

export default async function PortalDocumentsPage() {
  const { supabase, orgIds } = await portalScope();
  const { data } = await supabase
    .from("client_documents")
    .select("id, title, description, kind, external_url, size_bytes, created_at, projects(name)")
    .in("organization_id", orgIds)
    .eq("client_visible", true)
    .order("created_at", { ascending: false });
  const docs = data ?? [];

  return (
    <Card className="overflow-hidden">
      {docs.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="Aucun document partagé pour le moment" />
      ) : (
        <DataTable label="Documents partagés">
          <DataTableHead>
            <tr>
              <Th>Document</Th>
              <Th>Type</Th>
              <Th>Projet</Th>
              <Th>Ajouté le</Th>
              <Th numeric>Taille</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {docs.map((d) => (
              <Tr key={d.id}>
                <Td>
                  <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    {d.external_url ? <Link2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> : <FileText className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                    {d.title}
                  </a>
                  {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                </Td>
                <Td muted>{DOCUMENT_KIND_LABELS[d.kind as DocumentKind] ?? d.kind}</Td>
                <Td muted>{(d.projects as unknown as { name: string } | null)?.name ?? "—"}</Td>
                <Td muted>{formatDate(d.created_at)}</Td>
                <Td numeric>{d.external_url ? "Lien" : formatBytes(d.size_bytes)}</Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Card>
  );
}
