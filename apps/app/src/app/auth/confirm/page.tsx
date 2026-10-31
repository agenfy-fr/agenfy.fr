"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";

/**
 * Implicit-flow landing: invitations sent by the console (auth.admin.inviteUserByEmail
 * with the default Supabase template) come back with the tokens in the URL
 * fragment, which never reaches the server. /auth/callback forwards here.
 */
function Confirm() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // The fragment is consumed (and erased) once: StrictMode re-runs effects.
    if (started.current) return;
    started.current = true;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    // Never keep tokens in the address bar / history.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    const type = hash.get("type");
    const session =
      access_token && refresh_token
        ? createClient().auth.setSession({ access_token, refresh_token })
        : Promise.resolve({ error: new Error("missing tokens") });
    void session.then(({ error }) => {
      if (error) return setFailed(true);
      router.replace(type === "invite" || type === "recovery" ? "/compte?welcome=1" : safeNext(params.get("next")));
      router.refresh();
    });
  }, [params, router]);

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        Ce lien est invalide ou a expiré.{" "}
        <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Revenir à la connexion
        </a>
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground" role="status">
      Connexion en cours…
    </p>
  );
}

export default function ConfirmPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Suspense>
        <Confirm />
      </Suspense>
    </main>
  );
}
