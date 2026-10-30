"use client";

import { Eye, EyeOff, FileText, Link2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DOCUMENT_KINDS, DOCUMENT_KIND_LABELS } from "@/lib/domain";
import { formatBytes, formatDate } from "@/lib/format";
import type { ClientDocument } from "@/lib/types";
import { addDocument, deleteDocument, setDocumentVisibility } from "@/app/(staff)/documents/actions";

export function DocumentsPanel({
  organizationId,
  projectId,
  projects,
  documents,
  canEdit,
}: {
  organizationId: string;
  /** Fixed project (project page) — otherwise a select is shown. */
  projectId?: string | null;
  projects?: { id: string; name: string }[];
  documents: ClientDocument[];
  canEdit: boolean;
}) {
  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex justify-end">
          <FormDialog
            trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un document</>}
            triggerProps={{ size: "sm", variant: "outline" }}
            title="Ajouter un document"
            description="Fichier (4 Mo max.) ou lien https:// (Drive, SharePoint…)."
            action={addDocument}
            submitLabel="Ajouter"
          >
            <input type="hidden" name="organization_id" value={organizationId} />
            {projectId ? (
              <input type="hidden" name="project_id" value={projectId} />
            ) : (
              projects &&
              projects.length > 0 && (
                <Field label="Projet" htmlFor="doc-project">
                  <NativeSelect id="doc-project" name="project_id" defaultValue="">
                    <option value="">— Aucun —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              )
            )}
            <FormGrid>
              <Field label="Titre" htmlFor="doc-title">
                <Input id="doc-title" name="title" required />
              </Field>
              <Field label="Type" htmlFor="doc-kind">
                <NativeSelect id="doc-kind" name="kind" defaultValue="deliverable">
                  {DOCUMENT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {DOCUMENT_KIND_LABELS[k]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </FormGrid>
            <Field label="Fichier" htmlFor="doc-file">
              <Input id="doc-file" name="file" type="file" />
            </Field>
            <Field label="ou lien" htmlFor="doc-url">
              <Input id="doc-url" name="external_url" type="url" placeholder="https://" />
            </Field>
            <Field label="Description" htmlFor="doc-desc">
              <Textarea id="doc-desc" name="description" rows={2} />
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox id="doc-visible" name="client_visible" defaultChecked />
              <Label htmlFor="doc-visible" className="font-normal">
                Visible par le client dans son espace
              </Label>
            </div>
          </FormDialog>
        </div>
      )}
      {documents.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="Aucun document" className="p-4" />
      ) : (
        <ul className="divide-y rounded-lg border">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <a href={`/api/documents/${d.id}`} className="font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                  {d.external_url ? <Link2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> : <FileText className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                  {d.title}
                </a>
                <p className="text-xs text-muted-foreground">
                  {DOCUMENT_KIND_LABELS[d.kind]} · {formatDate(d.created_at)}
                  {d.size_bytes != null && ` · ${formatBytes(d.size_bytes)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge size="sm" label={d.client_visible ? "Visible client" : "Interne"} variant={d.client_visible ? "success" : "neutral"} />
                {canEdit && (
                  <>
                    <ActionButton
                      size="icon"
                      variant="ghost"
                      aria-label={d.client_visible ? "Masquer au client" : "Rendre visible au client"}
                      title={d.client_visible ? "Masquer au client" : "Rendre visible au client"}
                      action={() => setDocumentVisibility(d.id, !d.client_visible)}
                    >
                      {d.client_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </ActionButton>
                    <ActionButton
                      size="icon"
                      variant="ghost"
                      aria-label="Supprimer"
                      title="Supprimer"
                      confirm={`Supprimer « ${d.title} » ?`}
                      action={() => deleteDocument(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ActionButton>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
