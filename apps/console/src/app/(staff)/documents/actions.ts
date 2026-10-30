"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { MAX_UPLOAD_BYTES, documentSchema, uuid } from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffWriter } from "@/lib/server/auth";

const DOCUMENTS_BUCKET = "client-documents";

function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (cleaned || "fichier").slice(-120);
}

function revalidateDocumentViews(orgId: string, projectId: string | null) {
  revalidatePath(`/clients/${orgId}`);
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/portal", "layout");
}

/**
 * Add a deliverable: either an uploaded file (Supabase Storage, path
 * `<organization_id>/<uuid>-<name>`, staff-only write policy) or an https link.
 * Uses the staff session: storage and table RLS apply.
 */
export async function addDocument(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase, user } = await requireStaffWriter();
    const raw = formToObject(formData);
    const file = raw.file instanceof File && raw.file.size > 0 ? raw.file : null;
    delete raw.file;
    const input = documentSchema.parse(raw);
    if (!file && !input.external_url) throw new ActionError("Ajoutez un fichier ou un lien https://.");
    if (file && file.size > MAX_UPLOAD_BYTES) throw new ActionError("Fichier trop volumineux (4 Mo maximum) : partagez plutôt un lien https://.");

    let storagePath: string | null = null;
    if (file) {
      storagePath = `${input.organization_id}/${randomUUID()}-${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (error) {
        console.error("[documents] upload failed:", error.message);
        throw new ActionError("Téléversement impossible.");
      }
    }

    const { error } = await supabase.from("client_documents").insert({
      organization_id: input.organization_id,
      project_id: input.project_id,
      title: input.title,
      description: input.description,
      kind: input.kind,
      external_url: file ? null : input.external_url,
      storage_path: storagePath,
      file_name: file?.name ?? null,
      mime_type: file?.type || null,
      size_bytes: file?.size ?? null,
      client_visible: input.client_visible,
      uploaded_by: user.id,
    });
    if (error) {
      if (storagePath) await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
      check({ data: null, error });
    }
    revalidateDocumentViews(input.organization_id, input.project_id);
    return undefined;
  }, "Document ajouté.");
}

export async function setDocumentVisibility(documentId: string, visible: boolean): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const row = check(
      await supabase
        .from("client_documents")
        .update({ client_visible: visible })
        .eq("id", uuid.parse(documentId))
        .select("organization_id, project_id")
        .maybeSingle(),
    );
    if (!row) throw new ActionError("Document introuvable.");
    revalidateDocumentViews(row.organization_id, row.project_id);
    return undefined;
  }, visible ? "Document visible par le client." : "Document masqué au client.");
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireStaffWriter();
    const row = check(
      await supabase
        .from("client_documents")
        .select("id, organization_id, project_id, storage_path")
        .eq("id", uuid.parse(documentId))
        .maybeSingle(),
    );
    if (!row) throw new ActionError("Document introuvable.");
    check(await supabase.from("client_documents").delete().eq("id", row.id));
    if (row.storage_path) await supabase.storage.from(DOCUMENTS_BUCKET).remove([row.storage_path]);
    revalidateDocumentViews(row.organization_id, row.project_id);
    return undefined;
  }, "Document supprimé.");
}
