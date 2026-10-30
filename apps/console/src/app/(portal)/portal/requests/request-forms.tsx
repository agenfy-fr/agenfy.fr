"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { ActionForm } from "@/components/shared/action-form";
import { Field } from "@/components/shared/field";
import { REQUEST_CATEGORIES, REQUEST_CATEGORY_LABELS } from "@/lib/domain";
import { createClientRequest, postClientMessage } from "./actions";

export function NewRequestForm({
  organizations,
  projects,
}: {
  organizations: { id: string; name: string }[];
  projects: { id: string; name: string; organization_id: string }[];
}) {
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");
  return (
    <ActionForm action={createClientRequest} submitLabel="Envoyer la demande" className="space-y-4">
      {organizations.length > 1 ? (
        <Field label="Organisation" htmlFor="rq-org">
          <NativeSelect id="rq-org" name="organization_id" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      ) : (
        <input type="hidden" name="organization_id" value={orgId} />
      )}
      <Field label="Projet concerné" htmlFor="rq-project">
        <NativeSelect id="rq-project" name="project_id" defaultValue="">
          <option value="">— Général —</option>
          {projects
            .filter((p) => p.organization_id === orgId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </NativeSelect>
      </Field>
      <Field label="Type de demande" htmlFor="rq-category">
        <NativeSelect id="rq-category" name="category" defaultValue="question">
          {REQUEST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {REQUEST_CATEGORY_LABELS[c]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Objet" htmlFor="rq-subject">
        <Input id="rq-subject" name="subject" required maxLength={200} />
      </Field>
      <Field label="Message" htmlFor="rq-body">
        <Textarea id="rq-body" name="body" rows={6} required maxLength={10000} />
      </Field>
    </ActionForm>
  );
}

export function ClientReplyForm({ requestId }: { requestId: string }) {
  return (
    <ActionForm action={postClientMessage.bind(null, requestId)} resetOnSuccess submitLabel="Envoyer" className="space-y-2 rounded-lg border p-3">
      <Label htmlFor="client-reply">Votre réponse</Label>
      <Textarea id="client-reply" name="body" rows={4} required maxLength={10000} />
    </ActionForm>
  );
}
