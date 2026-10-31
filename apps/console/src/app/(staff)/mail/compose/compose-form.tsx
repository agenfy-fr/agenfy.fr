"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionForm } from "@/components/shared/action-form";
import { Field } from "@/components/shared/field";
import { sendMailAction } from "../actions";

export interface ComposeDefaults {
  to: string;
  cc: string;
  subject: string;
  body: string;
  inReplyTo: string | null;
  references: string | null;
  reply: { folder: string; uid: number } | null;
  forward: { folder: string; uid: number; attachments: string[] } | null;
}

export function ComposeForm({ from, defaults }: { from: string; defaults: ComposeDefaults }) {
  const [showCc, setShowCc] = useState(!!defaults.cc);
  return (
    <ActionForm
      action={sendMailAction}
      submitLabel={<><Send className="h-4 w-4" aria-hidden="true" /> Envoyer</>}
      successToast={false}
      className="space-y-4"
    >
      {defaults.inReplyTo && <input type="hidden" name="in_reply_to" value={defaults.inReplyTo} />}
      {defaults.references && <input type="hidden" name="references" value={defaults.references} />}
      {defaults.reply && (
        <>
          <input type="hidden" name="reply_folder" value={defaults.reply.folder} />
          <input type="hidden" name="reply_uid" value={defaults.reply.uid} />
        </>
      )}
      {defaults.forward && (
        <>
          <input type="hidden" name="forward_folder" value={defaults.forward.folder} />
          <input type="hidden" name="forward_uid" value={defaults.forward.uid} />
        </>
      )}
      <p className="text-sm text-muted-foreground">De : {from}</p>
      <Field label="À" htmlFor="m-to" hint="Plusieurs adresses : séparez-les par une virgule.">
        <Input id="m-to" name="to" required defaultValue={defaults.to} autoComplete="off" />
      </Field>
      {showCc ? (
        <>
          <Field label="Cc" htmlFor="m-cc">
            <Input id="m-cc" name="cc" defaultValue={defaults.cc} autoComplete="off" />
          </Field>
          <Field label="Cci" htmlFor="m-bcc">
            <Input id="m-bcc" name="bcc" autoComplete="off" />
          </Field>
        </>
      ) : (
        <button type="button" className="text-sm text-primary hover:underline" onClick={() => setShowCc(true)}>
          Ajouter Cc / Cci
        </button>
      )}
      <Field label="Objet" htmlFor="m-subject">
        <Input id="m-subject" name="subject" defaultValue={defaults.subject} />
      </Field>
      <Field label="Message" htmlFor="m-body">
        <Textarea id="m-body" name="body" rows={16} defaultValue={defaults.body} className="font-mono text-sm" />
      </Field>
      {defaults.forward && defaults.forward.attachments.length > 0 && (
        <p className="text-sm text-muted-foreground">Pièces jointes transférées : {defaults.forward.attachments.join(", ")}</p>
      )}
      <Field label="Pièces jointes" htmlFor="m-files" hint="4 Mo au total.">
        <Input id="m-files" name="attachments" type="file" multiple />
      </Field>
    </ActionForm>
  );
}
