import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

/**
 * Landing route for magic links, invitations and password recovery.
 * Supports the PKCE flow (?code=), the token-hash flow (?token_hash=&type=,
 * recommended in the Supabase e-mail templates) and the implicit flow
 * (tokens in the fragment → /auth/confirm), used by console invitations.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = safeNext(searchParams.get("next"));

  // Neither: implicit flow, the tokens are in the URL fragment (kept by the
  // browser across this redirect) and handled client-side by /auth/confirm.
  if (!code && !tokenHash) {
    const confirm = new URL("/auth/confirm", origin);
    confirm.searchParams.set("next", next);
    return NextResponse.redirect(confirm);
  }

  const supabase = await createClient();
  let ok = false;

  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
    // Invited users and password recovery land on the account page to set a password.
    if (ok && (type === "invite" || type === "recovery")) next = "/compte?welcome=1";
  }

  if (!ok) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "Lien invalide ou expiré. Demandez-en un nouveau.");
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(new URL(next, origin));
}
