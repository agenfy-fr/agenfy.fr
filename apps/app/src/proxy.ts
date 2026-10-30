import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { mfaStep } from "@/lib/mfa";

const PROTECTED_PREFIXES = ["/dashboard", "/learn", "/manager", "/staff", "/compte", "/reclamation"];

/**
 * Next 16 proxy (ex-middleware): refreshes the Supabase session cookie and
 * redirects anonymous visitors away from private areas. Authorization
 * itself is enforced by RLS and by each page.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) return response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not put logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Enrolled a second factor but this session has not used it: TOTP code first.
  // (Staff without any factor are sent to enrollment by requireViewer.)
  if (isProtected && user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaStep({ currentLevel: aal?.currentLevel, nextLevel: aal?.nextLevel }) === "challenge") {
      const url = request.nextUrl.clone();
      url.pathname = "/login/mfa";
      url.search = "";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  if (path === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/manager/:path*",
    "/staff/:path*",
    "/compte/:path*",
    "/reclamation/:path*",
    "/login",
  ],
};
