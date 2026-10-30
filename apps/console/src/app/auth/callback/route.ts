import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/access-control";

const OTP_TYPES: readonly EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * E-mail link landing (magic link, invitation, recovery):
 *  - `?code=…`                 PKCE flow (magic link sent by this app);
 *  - `?token_hash=…&type=…`    recommended e-mail templates (see README);
 *  - neither                   implicit flow: tokens are in the URL fragment,
 *                              which the browser keeps across this redirect
 *                              to /auth/confirm (client page).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get("next")) ?? "/";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const to = (path: string) => NextResponse.redirect(new URL(path, url.origin));

  if (!code && !tokenHash) {
    const confirm = new URL("/auth/confirm", url.origin);
    confirm.searchParams.set("next", next);
    return NextResponse.redirect(confirm);
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return to("/auth/login?error=config");
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return to("/auth/login?error=link");
    return to(next);
  }

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return to("/auth/login?error=link");
    // Invited users choose their password first.
    return to(type === "invite" || type === "recovery" ? "/account?welcome=1" : next);
  }

  return to("/auth/login?error=link");
}
