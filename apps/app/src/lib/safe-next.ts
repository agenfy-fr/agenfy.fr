/** Only allow relative in-app redirect targets (prevents open redirects). */
export function safeNext(raw: unknown, fallback = "/dashboard"): string {
  const value = typeof raw === "string" ? raw : "";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
