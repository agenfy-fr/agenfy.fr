"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { Callout } from "@/components/shared/callout";
import { Field, FormGrid } from "@/components/shared/field";
import { toast } from "@/lib/toast";
import { createApiToken, revokeApiToken } from "./actions";

export function NewTokenForm({ canWrite }: { canWrite: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {token && (
        <Callout tone="success" title="Nouveau jeton — affiché une seule fois">
          <div className="mt-1 flex items-center gap-2">
            <code className="break-all">{token}</code>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Copier le jeton"
              onClick={() => {
                void navigator.clipboard.writeText(token).then(() => toast.success("Jeton copié."));
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Callout>
      )}
      <ActionForm<{ token: string }>
        action={createApiToken}
        resetOnSuccess
        onSuccess={(data) => setToken(data?.token ?? null)}
        submitLabel="Créer un jeton"
        className="space-y-3 rounded-lg border border-dashed p-3"
      >
        <FormGrid>
          <Field label="Nom" htmlFor="tok-name">
            <Input id="tok-name" name="name" required placeholder="claude-code@mon-mac" />
          </Field>
          <Field label="Expiration" htmlFor="tok-exp">
            <NativeSelect id="tok-exp" name="expires_in_days" defaultValue="90">
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="365">1 an</option>
              <option value="">Jamais</option>
            </NativeSelect>
          </Field>
        </FormGrid>
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="sr-only">Scopes</legend>
          <Label className="flex items-center gap-2 font-normal">
            <input type="checkbox" name="scopes" value="console:read" defaultChecked className="h-4 w-4 accent-[hsl(var(--primary))]" />
            console:read
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <input
              type="checkbox"
              name="scopes"
              value="console:write"
              defaultChecked={canWrite}
              disabled={!canWrite}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            console:write {!canWrite && "(indisponible en lecture seule)"}
          </Label>
        </fieldset>
      </ActionForm>
    </div>
  );
}

export function RevokeTokenButton({ id, name }: { id: string; name: string }) {
  return (
    <ActionButton size="sm" variant="ghost" className="text-destructive" confirm={`Révoquer le jeton « ${name} » ?`} action={() => revokeApiToken(id)}>
      Révoquer
    </ActionButton>
  );
}
