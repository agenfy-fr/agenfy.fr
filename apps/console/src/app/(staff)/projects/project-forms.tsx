"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { MILESTONE_STATUSES, MILESTONE_STATUS_META, PROJECT_STATUSES, PROJECT_STATUS_META } from "@/lib/domain";
import { centsToInput, formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { Milestone, Project, StaffMember } from "@/lib/types";
import { addMilestone, createProject, deleteMilestone, setMilestoneStatus, updateProject, updateProjectInternal } from "./actions";

function StaffSelect({ id, name, staff, defaultValue }: { id: string; name: string; staff: StaffMember[]; defaultValue?: string | null }) {
  return (
    <NativeSelect id={id} name={name} defaultValue={defaultValue ?? ""}>
      <option value="">—</option>
      {staff
        .filter((s) => !s.suspended)
        .map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name || s.email}
          </option>
        ))}
    </NativeSelect>
  );
}

export function NewProjectButton({
  organizations,
  fixedOrganizationId,
  staff,
}: {
  organizations?: { id: string; name: string }[];
  fixedOrganizationId?: string;
  staff: StaffMember[];
}) {
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Nouveau projet</>}
      triggerProps={fixedOrganizationId ? { size: "sm", variant: "outline" } : undefined}
      title="Nouveau projet"
      description="Le code projet préfixe les clés de tâche (ex. ACME-001)."
      action={createProject}
      submitLabel="Créer"
      wide
    >
      {fixedOrganizationId ? (
        <input type="hidden" name="organization_id" value={fixedOrganizationId} />
      ) : (
        <Field label="Client" htmlFor="prj-org">
          <NativeSelect id="prj-org" name="organization_id" required defaultValue="">
            <option value="" disabled>
              Choisir un client…
            </option>
            {(organizations ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <FormGrid>
        <Field label="Nom du projet" htmlFor="prj-name">
          <Input id="prj-name" name="name" required />
        </Field>
        <Field label="Code" htmlFor="prj-code" hint="2-10 lettres/chiffres, ex. ACME">
          <Input id="prj-code" name="code" required maxLength={10} className="uppercase" />
        </Field>
        <Field label="Début" htmlFor="prj-start">
          <Input id="prj-start" name="start_date" type="date" />
        </Field>
        <Field label="Fin prévue" htmlFor="prj-end">
          <Input id="prj-end" name="end_date" type="date" />
        </Field>
        <Field label="Budget HT (€)" htmlFor="prj-budget">
          <Input id="prj-budget" name="budget" inputMode="decimal" placeholder="12 000,00" />
        </Field>
        <Field label="Responsable" htmlFor="prj-owner">
          <StaffSelect id="prj-owner" name="owner_id" staff={staff} />
        </Field>
      </FormGrid>
      <Field label="Description (visible du client)" htmlFor="prj-desc">
        <Textarea id="prj-desc" name="description" rows={3} />
      </Field>
      <p className="text-xs text-muted-foreground">Le projet est créé en brouillon : il n&apos;apparaît dans l&apos;espace client qu&apos;une fois passé « En cours ».</p>
    </FormDialog>
  );
}

export function ProjectForm({ project, staff, canEdit }: { project: Project; staff: StaffMember[]; canEdit: boolean }) {
  return (
    <ActionForm action={updateProject.bind(null, project.id)} className="space-y-4" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-4">
        <FormGrid>
          <Field label="Nom" htmlFor="p-name">
            <Input id="p-name" name="name" defaultValue={project.name} required />
          </Field>
          <Field label="Statut" htmlFor="p-status" hint="« Brouillon » = invisible pour le client.">
            <NativeSelect id="p-status" name="status" defaultValue={project.status}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_META[s].label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Avancement (%)" htmlFor="p-progress">
            <Input id="p-progress" name="progress" type="number" min={0} max={100} defaultValue={project.progress} />
          </Field>
          <Field label="Responsable" htmlFor="p-owner">
            <StaffSelect id="p-owner" name="owner_id" staff={staff} defaultValue={project.owner_id} />
          </Field>
          <Field label="Début" htmlFor="p-start">
            <Input id="p-start" name="start_date" type="date" defaultValue={project.start_date ?? ""} />
          </Field>
          <Field label="Fin prévue" htmlFor="p-end">
            <Input id="p-end" name="end_date" type="date" defaultValue={project.end_date ?? ""} />
          </Field>
          <Field label="Budget HT (€)" htmlFor="p-budget">
            <Input id="p-budget" name="budget" inputMode="decimal" defaultValue={centsToInput(project.budget_cents)} />
          </Field>
        </FormGrid>
        <Field label="Description (visible du client)" htmlFor="p-desc">
          <Textarea id="p-desc" name="description" rows={3} defaultValue={project.description ?? ""} />
        </Field>
        <Field label="Prochaines étapes (visibles du client)" htmlFor="p-next">
          <Textarea id="p-next" name="next_steps" rows={3} defaultValue={project.next_steps ?? ""} />
        </Field>
      </fieldset>
    </ActionForm>
  );
}

export function ProjectInternalForm({ projectId, notes, canEdit }: { projectId: string; notes: string | null; canEdit: boolean }) {
  return (
    <ActionForm action={updateProjectInternal.bind(null, projectId)} className="space-y-3" hideSubmit={!canEdit}>
      <Field label="Notes internes" htmlFor="p-internal" hint="Réservé à l'équipe : marge, risques, contexte. Jamais visible par le client.">
        <Textarea id="p-internal" name="internal_notes" rows={6} defaultValue={notes ?? ""} disabled={!canEdit} />
      </Field>
    </ActionForm>
  );
}

export function MilestonesPanel({ projectId, milestones, canEdit }: { projectId: string; milestones: Milestone[]; canEdit: boolean }) {
  return (
    <div className="space-y-3">
      {milestones.length === 0 ? (
        <EmptyState title="Aucun jalon" description="Découpez le projet en phases visibles par le client." className="p-4" />
      ) : (
        <ol className="space-y-2">
          {milestones.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {m.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.due_date ? `Échéance ${formatDate(m.due_date)}` : "Sans échéance"}
                  {!m.client_visible && " · interne"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canEdit ? (
                  <NativeSelect
                    aria-label={`Statut du jalon ${m.title}`}
                    className="h-8 w-32"
                    defaultValue={m.status}
                    onChange={async (e) => {
                      const res = await setMilestoneStatus(m.id, e.target.value);
                      if (!res.ok) toast.error(res.error);
                    }}
                  >
                    {MILESTONE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {MILESTONE_STATUS_META[s].label}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <StatusBadge size="sm" {...MILESTONE_STATUS_META[m.status]} />
                )}
                {canEdit && (
                  <ActionButton
                    size="icon"
                    variant="ghost"
                    aria-label={`Supprimer le jalon ${m.title}`}
                    confirm={`Supprimer le jalon « ${m.title} » ?`}
                    action={() => deleteMilestone(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </ActionButton>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {canEdit && (
        <ActionForm action={addMilestone.bind(null, projectId)} resetOnSuccess submitLabel="Ajouter le jalon" submitProps={{ size: "sm", variant: "outline" }} className="space-y-3 rounded-lg border border-dashed p-3">
          <FormGrid>
            <Field label="Nouveau jalon" htmlFor="ms-title">
              <Input id="ms-title" name="title" required placeholder="Cadrage, POC, mise en production…" />
            </Field>
            <Field label="Échéance" htmlFor="ms-due">
              <Input id="ms-due" name="due_date" type="date" />
            </Field>
          </FormGrid>
          <div className="flex items-center gap-2">
            <Checkbox id="ms-visible" name="client_visible" defaultChecked />
            <Label htmlFor="ms-visible" className="font-normal">
              Visible par le client
            </Label>
          </div>
        </ActionForm>
      )}
    </div>
  );
}
