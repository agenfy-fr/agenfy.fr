import { NextResponse, type NextRequest } from "next/server";
import { UUID_RE } from "@/lib/schemas";
import { getSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/**
 * Download a deliverable (staff or client). Everything goes through the
 * user's session: the row is only readable if RLS allows it (staff, or member
 * of the organization AND client_visible), and the signed URL is only issued
 * if the storage policy allows it. Short-lived URL (60 s).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new NextResponse("Not found", { status: 404 });

  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { data: doc } = await session.supabase
    .from("client_documents")
    .select("id, storage_path, external_url, file_name")
    .eq("id", id)
    .maybeSingle();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  if (doc.external_url) return NextResponse.redirect(doc.external_url);
  if (!doc.storage_path) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await session.supabase.storage
    .from("client-documents")
    .createSignedUrl(doc.storage_path, 60, { download: doc.file_name ?? true });
  if (error || !data?.signedUrl) return new NextResponse("Not found", { status: 404 });

  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
