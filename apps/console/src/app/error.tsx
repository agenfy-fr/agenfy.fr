"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.name === "MissingSupabaseEnvError"
          ? "La console n'est pas configurée : variables Supabase manquantes."
          : "Réessayez. Si le problème persiste, contactez l'équipe Agenfy."}
        {error.digest && <span className="mt-1 block font-mono text-xs">Réf. {error.digest}</span>}
      </p>
      <Button type="button" variant="outline" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
