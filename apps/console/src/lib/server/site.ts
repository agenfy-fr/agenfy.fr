import "server-only";
import { headers } from "next/headers";

/**
 * Public origin used in e-mail links (magic link, invitations).
 * NEXT_PUBLIC_SITE_URL in production (https://console.agenfy.fr); falls back
 * to the request host in development.
 */
export async function siteOrigin(): Promise<string> {
  const configured = process.env["NEXT_PUBLIC_SITE_URL"];
  if (configured) return configured.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Origin of the training platform (app.agenfy.fr): invitation redirects for
 * learners and links shown to training-only accounts. NEXT_PUBLIC_APP_URL
 * (same name as in apps/app), read at runtime; production default otherwise,
 * localhost:3002 under `next dev`.
 */
export function trainingAppOrigin(): string {
  const configured = process.env["NEXT_PUBLIC_APP_URL"];
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "development" ? "http://localhost:3002" : "https://app.agenfy.fr";
}
