import { NextResponse, type NextRequest } from "next/server";
import { attachmentContentType, contentDisposition } from "@/lib/mail";
import { getMessage, withImap } from "@/lib/server/mail/imap";
import { guardMailRoute } from "@/lib/server/mail/route-guard";

export const dynamic = "force-dynamic";

/** Download one attachment (`?folder=&uid=&i=`), always as a file, never rendered. */
export async function GET(request: NextRequest) {
  const ref = await guardMailRoute(request);
  if (ref instanceof NextResponse) return ref;
  const index = Number(request.nextUrl.searchParams.get("i"));
  if (!Number.isInteger(index) || index < 0) return new NextResponse("Bad request", { status: 400 });

  try {
    const msg = await withImap((client) => getMessage(client, ref.folder, ref.uid));
    const meta = msg?.attachments[index];
    const content = msg?.contents[index];
    if (!meta || !content) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(new Uint8Array(content), {
      headers: {
        "Content-Type": attachmentContentType(meta.contentType),
        "Content-Disposition": contentDisposition(meta.filename),
        "Content-Length": String(content.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[mail] attachment failed:", (err as Error).message);
    return new NextResponse("Pièce jointe indisponible", { status: 502 });
  }
}
