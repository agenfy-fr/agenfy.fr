import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import { EXPORTS, buildExport, type ExportKind } from "@/lib/exports";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const { kind } = await ctx.params;
  if (!(kind in EXPORTS)) return new NextResponse("Not found", { status: 404 });

  // Route handlers are not wrapped by the staff layout: check access here.
  const viewer = await getViewer();
  if (!viewer?.staffRole) return new NextResponse("Forbidden", { status: 403 });

  const session = request.nextUrl.searchParams.get("session");
  const evalKind = request.nextUrl.searchParams.get("kind");
  const supabase = await createClient();
  const table = await buildExport(supabase, kind as ExportKind, {
    session: session && UUID_RE.test(session) ? session : null,
    kind: evalKind && ["positioning", "hot", "cold"].includes(evalKind) ? evalKind : null,
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(table.headers, table.rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="agenfy-${kind}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
