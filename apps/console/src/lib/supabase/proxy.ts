import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { SUPABASE_COOKIE_OPTIONS, getSupabasePublicEnv } from "./env";
import { mfaStep } from "@/lib/mfa";

/** Paths reachable without a session (the API authenticates itself: Bearer token / own checks). */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/") ||
    pathname === "/auth" ||
    pathname.startsWith("/api/") ||
    pathname === "/robots.txt"
  );
}

/**
 * Refreshes the Supabase session cookie (token rotation) and performs the
 * optimistic redirects. Authorization itself (staff vs client) is enforced by
 * the route-group layouts and by RLS — never by the proxy alone.
 *
 * `requestHeaders` carries the CSP nonce headers; cookie writes made by
 * Supabase are mirrored onto it so the render sees the refreshed session.
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  const forward = () => NextResponse.next({ request: { headers: withCookies(requestHeaders, request) } });
  let response = forward();

  const env = getSupabasePublicEnv();
  const pathname = request.nextUrl.pathname;
  if (!env) {
    // Misconfigured deployment: show the configuration error on the login
    // page instead of a 500 on every page.
    if (isPublicPath(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "?error=config";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(env.url, env.key, {
    cookieOptions: SUPABASE_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = forward();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Network failure: treat as signed out.
  }

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("next", pathname + request.nextUrl.search);
    return redirectKeepingCookies(url, response);
  }

  // Enrolled a second factor but this session has not used it: TOTP code first.
  // (Staff without any factor are sent to enrollment by the session helpers.)
  if (user && !isPublicPath(pathname)) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaStep({ currentLevel: aal?.currentLevel, nextLevel: aal?.nextLevel }) === "challenge") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/mfa";
      url.search = "";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return redirectKeepingCookies(url, response);
    }
  }

  // Already signed in: skip the login page (but not the callback / sign-out).
  if (user && pathname === "/auth/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectKeepingCookies(url, response);
  }

  return response;
}

function redirectKeepingCookies(url: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

function withCookies(headers: Headers, request: NextRequest): Headers {
  const h = new Headers(headers);
  const cookie = request.cookies.toString();
  if (cookie) h.set("cookie", cookie);
  else h.delete("cookie");
  return h;
}
