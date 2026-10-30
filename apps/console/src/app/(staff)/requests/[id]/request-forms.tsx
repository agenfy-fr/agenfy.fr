"use client";

import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ActionForm } from "@/components/shared/action-form";
import { Field } from "@/components/shared/field";
import { REQUEST_PRIORITIES, REQUEST_PRIORITY_LABELS, REQUEST_STATUSES, REQUEST_STATUS_META } from "@/lib/domain";
import type { ClientRequest, StaffMember } from "@/lib/types";
import { replyToRequest, updateRequest } from "../actions";

export function ReplyForm({ requestId }: { requestId: string }) {
  return (
    <ActionForm action={replyToRequest.bind(null, requestId)} resetOnSuccess submitLabel="Envoyer" className="space-y-3 rounded-lg border p-3">
      <Label htmlFor="reply-body">Répondre</Label>
      <Textarea id="reply-body" name="body" rows={4} required />
      <div className="flex items-center gap-2">
        <Checkbox id="reply-internal" name="internal" />
        <Label htmlFor="reply-internal" className="font-normal">
          Note interne (invisible pour le client)
        </Label>
      </div>
    </ActionForm>
  );
}

export function RequestStatusForm({ request, staff, canEdit }: { request: ClientRequest; staff: StaffMember[]; canEdit: boolean }) {
  return (
    <ActionForm action={updateRequest.bind(null, request.id)} className="space-y-3" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-3">
        <Field label="Statut" htmlFor="rq-status">
          <NativeSelect id="rq-status" name="status" defaultValue={request.status}>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {REQUEST_STATUS_META[s].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Priorité" htmlFor="rq-priority">
          <NativeSelect id="rq-priority" name="priority" defaultValue={request.priority}>
            {REQUEST_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {REQUEST_PRIORITY_LABELS[p]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Assignée à" htmlFor="rq-assignee">
          <NativeSelect id="rq-assignee" name="assignee_id" defaultValue={request.assignee_id ?? ""}>
            <option value="">—</option>
            {staff
              .filter((s) => !s.suspended)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
          </NativeSelect>
        </Field>
      </fieldset>
    </ActionForm>
  );
}
