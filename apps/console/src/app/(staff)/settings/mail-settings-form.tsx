"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { Field, FormGrid } from "@/components/shared/field";
import { OVH_MAIL_PRESETS } from "@/lib/mail";
import { toast } from "@/lib/toast";
import { deleteMailSettings, saveMailSettings, testMailSettings } from "../mail/actions";

export interface MailSettingsInitial {
  stored: boolean;
  email: string;
  display_name: string;
  username: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  signature: string;
}

export function MailSettingsForm({ initial }: { initial: MailSettingsInitial }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [testing, startTest] = useTransition();
  const [server, setServer] = useState({
    imap_host: initial.imap_host,
    imap_port: String(initial.imap_port),
    smtp_host: initial.smtp_host,
    smtp_port: String(initial.smtp_port),
  });

  const applyPreset = (id: string) => {
    const p = OVH_MAIL_PRESETS.find((x) => x.id === id);
    if (p) setServer({ imap_host: p.imap_host, imap_port: String(p.imap_port), smtp_host: p.smtp_host, smtp_port: String(p.smtp_port) });
  };

  const test = () => {
    const form = wrapRef.current?.querySelector("form");
    if (!form) return;
    startTest(async () => {
      const res = await testMailSettings(null, new FormData(form));
      if (res.ok) toast.success(res.message ?? "Connexion réussie.");
      else toast.error(res.error);
    });
  };

  return (
    <div ref={wrapRef} className="space-y-4">
      <ActionForm action={saveMailSettings} className="space-y-4">
        <FormGrid>
          <Field label="Adresse e-mail" htmlFor="mail-email">
            <Input id="mail-email" name="email" type="email" required defaultValue={initial.email} placeholder="contact@agenfy.fr" />
          </Field>
          <Field label="Nom affiché" htmlFor="mail-name">
            <Input id="mail-name" name="display_name" defaultValue={initial.display_name} placeholder="Agenfy" />
          </Field>
          <Field label="Identifiant" htmlFor="mail-user" hint="Vide = l'adresse e-mail (cas OVH).">
            <Input id="mail-user" name="username" defaultValue={initial.username} autoComplete="off" />
          </Field>
          <Field
            label="Mot de passe de la boîte"
            htmlFor="mail-pass"
            hint={initial.stored ? "Enregistré (chiffré). Laissez vide pour le conserver." : "Chiffré avant enregistrement, jamais réaffiché."}
          >
            <Input id="mail-pass" name="password" type="password" autoComplete="new-password" required={!initial.stored} />
          </Field>
        </FormGrid>
        <Field label="Offre OVH (pré-remplit les serveurs)" htmlFor="mail-preset">
          <NativeSelect id="mail-preset" defaultValue="" onChange={(e) => applyPreset(e.target.value)}>
            <option value="">— Choisir —</option>
            {OVH_MAIL_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <FormGrid>
          <Field label="Serveur IMAP" htmlFor="mail-imap">
            <Input id="mail-imap" name="imap_host" required value={server.imap_host} onChange={(e) => setServer({ ...server, imap_host: e.target.value })} />
          </Field>
          <Field label="Port IMAP" htmlFor="mail-imap-port" hint="993 = SSL/TLS.">
            <Input id="mail-imap-port" name="imap_port" inputMode="numeric" required value={server.imap_port} onChange={(e) => setServer({ ...server, imap_port: e.target.value })} />
          </Field>
          <Field label="Serveur SMTP" htmlFor="mail-smtp">
            <Input id="mail-smtp" name="smtp_host" required value={server.smtp_host} onChange={(e) => setServer({ ...server, smtp_host: e.target.value })} />
          </Field>
          <Field label="Port SMTP" htmlFor="mail-smtp-port" hint="465 = SSL/TLS, 587 = STARTTLS.">
            <Input id="mail-smtp-port" name="smtp_port" inputMode="numeric" required value={server.smtp_port} onChange={(e) => setServer({ ...server, smtp_port: e.target.value })} />
          </Field>
        </FormGrid>
        <Field label="Signature" htmlFor="mail-sig">
          <Textarea id="mail-sig" name="signature" rows={4} defaultValue={initial.signature} />
        </Field>
      </ActionForm>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={test} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlugZap className="h-4 w-4" aria-hidden="true" />} Tester la connexion
        </Button>
        {initial.stored && (
          <ActionButton variant="ghost" className="text-destructive" confirm="Supprimer la configuration de la boîte mail et le mot de passe chiffré ?" action={deleteMailSettings}>
            Supprimer la configuration
          </ActionButton>
        )}
      </div>
    </div>
  );
}
