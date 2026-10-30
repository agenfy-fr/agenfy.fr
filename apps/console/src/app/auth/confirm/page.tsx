"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { setSessionFromTokens } from "@/app/auth/actions";
import { AuthCard } from "../auth-card";

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
    const run = async () => (access_token && refresh_token ? (await setSessionFromTokens({ access_token, refresh_token })).ok : false);
    void run().then((ok) => {
      if (!ok) return setFailed(true);
      const next = params.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(type === "invite" || type === "recovery" ? "/account?welcome=1" : safeNext);
      router.refresh();
    });
  }, [params, router]);

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        Ce lien est invalide ou a expiré.{" "}
        <a href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Revenir à la connexion
        </a>
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Connexion en cours…
    </p>
  );
}

export default function ConfirmPage() {
  return (
    <AuthCard title="Connexion">
      <Suspense>
        <Confirm />
      </Suspense>
    </AuthCard>
  );
}
