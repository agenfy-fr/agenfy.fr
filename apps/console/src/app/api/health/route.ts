export const dynamic = "force-dynamic";

/** Liveness probe (no auth, no data). */
export function GET() {
  return Response.json({ ok: true, service: "agenfy-console" }, { headers: { "Cache-Control": "no-store" } });
}
