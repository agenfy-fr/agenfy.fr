import { NextResponse, type NextRequest } from "next/server";
import { mailBodyCsp, renderMailDocument } from "@/lib/mail";
import { getMessage, withImap } from "@/lib/server/mail/imap";
import { guardMailRoute } from "@/lib/server/mail/route-guard";

export const dynamic = "force-dynamic";

/** Inline images larger than this stay as attachments. */
const MAX_INLINE_BYTES = 2 * 1024 * 1024;

/**
 * Message body for the sandboxed iframe of /mail/message (owner/admin).
 * Served with its own CSP (no script, no form, remote images only on demand)
 * and excluded from the app-wide CSP / X-Frame-Options (proxy.ts, next.config.ts).
 */
export async function GET(request: NextRequest) {
  const ref = await guardMailRoute(request);
  if (ref instanceof NextResponse) return ref;
  const allowImages = request.nextUrl.searchParams.get("images") === "1";

  try {
    const msg = await withImap((client) => getMessage(client, ref.folder, ref.uid));
    if (!msg) return new NextResponse("Not found", { status: 404 });
    const inline = msg.attachments
      .filter((a) => a.cid && a.size <= MAX_INLINE_BYTES)
      .map((a) => ({ cid: a.cid!, contentType: a.contentType, base64: msg.contents[a.index]!.toString("base64") }));
    return new NextResponse(renderMailDocument(msg.html, msg.text, inline), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": mailBodyCsp(allowImages),
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err) {
    console.error("[mail] body failed:", (err as Error).message);
    return new NextResponse("Message indisponible", { status: 502 });
  }
}
