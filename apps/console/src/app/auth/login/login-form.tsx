"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Callout } from "@/components/shared/callout";
import { sendMagicLink, signInWithPassword, type LoginState } from "../actions";

export function LoginForm({ next, initialError }: { next: string; initialError: string | null }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState<LoginState, FormData>(signInWithPassword, null);
  const [mlState, mlAction, mlPending] = useActionState<LoginState, FormData>(sendMagicLink, null);
  const state = mode === "password" ? pwState : mlState;
  const error = state?.error ?? (state ? null : initialError);

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Méthode de connexion" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm">
        {(
          [
            ["password", "Mot de passe"],
            ["magic", "Lien magique"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              mode === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <Callout tone="destructive">{error}</Callout>}
      {mode === "magic" && mlState?.info && <Callout tone="success">{mlState.info}</Callout>}

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" className="w-full" disabled={pwPending}>
            {pwPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Se connecter
          </Button>
        </form>
      ) : (
        <form action={mlAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label htmlFor="magic-email">E-mail</Label>
            <Input id="magic-email" name="email" type="email" autoComplete="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={mlPending}>
            {mlPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Recevoir un lien de connexion
          </Button>
          <p className="text-xs text-muted-foreground">
            Pas encore de compte ? Les accès sont créés sur invitation par l&apos;équipe Agenfy.
          </p>
        </form>
      )}
    </div>
  );
}
