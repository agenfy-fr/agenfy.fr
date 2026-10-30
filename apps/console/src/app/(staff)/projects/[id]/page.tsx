import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { DocumentsPanel } from "@/components/staff/documents-panel";
import { canWrite } from "@/lib/access-control";
import { PROJECT_STATUS_META, metaOf } from "@/lib/domain";
import { formatCents } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { getStaffDirectory } from "@/lib/server/directory";
import { PROJECT_COLUMNS, TASK_COLUMNS } from "@/lib/planning/service";
import type { ClientDocument, Milestone, Project, Task } from "@/lib/types";
import { MilestonesPanel, ProjectForm, ProjectInternalForm } from "../project-forms";
import { TaskBoard, type TaskComment } from "../task-board";

export const metadata: Metadata = { title: "Projet" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/projects");

  const [projectRes, internalRes, milestonesRes, tasksRes, docsRes, staff] = await Promise.all([
    supabase.from("projects").select(`${PROJECT_COLUMNS}, organizations(name)`).eq("id", id).maybeSingle(),
    supabase.from("project_internal").select("internal_notes").eq("project_id", id).maybeSingle(),
    supabase.from("project_milestones").select("*").eq("project_id", id).order("position"),
    supabase.from("project_tasks").select(TASK_COLUMNS).eq("project_id", id).order("order_index").order("number"),
    supabase.from("client_documents").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    getStaffDirectory(supabase),
  ]);
  const project = projectRes.data as (Project & { organizations: { name: string } | null }) | null;
  if (!project) notFound();

  const tasks = (tasksRes.data ?? []) as Task[];
  const { data: comments } = tasks.length
    ? await supabase
        .from("project_task_comments")
        .select("id, task_id, author_id, body, created_at")
        .in("task_id", tasks.map((t) => t.id))
        .order("created_at")
    : { data: [] };
  const milestones = (milestonesRes.data ?? []) as Milestone[];
  const canEdit = canWrite(role);
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={project.name} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge {...metaOf(PROJECT_STATUS_META, project.status)} showDot />
        <span className="font-mono text-muted-foreground">{project.code}</span>
        <Link href={`/clients/${project.organization_id}`} className="text-primary hover:underline">
          {project.organizations?.name}
        </Link>
        <span className="text-muted-foreground">
          {done}/{tasks.length} tâches terminées · avancement {project.progress} %
          {project.budget_cents != null && ` · budget ${formatCents(project.budget_cents, { round: true })} HT`}
        </span>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tâches ({tasks.length})</TabsTrigger>
          <TabsTrigger value="milestones">Jalons ({milestones.length})</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="documents">Livrables</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <TaskBoard
            projectId={project.id}
            projectCode={project.code}
            tasks={tasks}
            staff={staff}
            milestones={milestones}
            comments={(comments ?? []) as TaskComment[]}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4 max-w-3xl">
          <MilestonesPanel projectId={project.id} milestones={milestones} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="details" className="mt-4 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projet</CardTitle>
              <CardDescription>Description, prochaines étapes et avancement sont visibles du client (hors brouillon).</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectForm project={project} staff={staff} canEdit={canEdit} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interne</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectInternalForm projectId={project.id} notes={(internalRes.data?.internal_notes as string | null) ?? null} canEdit={canEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsPanel
            organizationId={project.organization_id}
            projectId={project.id}
            documents={(docsRes.data ?? []) as ClientDocument[]}
            canEdit={canEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
