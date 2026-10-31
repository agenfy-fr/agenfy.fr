import "server-only";

/** Supabase Storage bucket for client documents (migration 0100). */
export const DOCUMENTS_BUCKET = "client-documents";

/** ASCII-only, path-safe file name (keeps the extension, max 120 chars). */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (cleaned || "fichier").slice(-120);
}
