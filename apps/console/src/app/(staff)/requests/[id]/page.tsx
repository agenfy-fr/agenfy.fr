import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { RequestThread, type ThreadEntry } from "@/components/shared/request-thread";
import { canWrite } from "@/lib/access-control";
import { REQUEST_CATEGORY_LABELS } from "@/lib/domain";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { displayName, getStaffDirectory, getUserDirectory } from "@/lib/server/directory";
import type { ClientRequest, ClientRequestMessage } from "@/lib/types";
import { ReplyForm, RequestStatusForm } from "./request-forms";

export const metadata: Metadata = { title: "Demande client" };

export default async function StaffRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/requests");

  const [reqRes, msgRes, staff] = await Promise.all([
    supabase.from("client_requests").select("*, organizations(name), projects(name)").eq("id", id).maybeSingle(),
    supabase.from("client_request_messages").select("*").eq("request_id", id).order("created_at"),
    getStaffDirectory(supabase),
  ]);
  const request = reqRes.data as (ClientRequest & { organizations: { name: string } | null; projects: { name: string } | null }) | null;
  if (!request) notFound();
  const messages = (msgRes.data ?? []) as ClientRequestMessage[];
  const staffIds = new Set(staff.map((s) => s.id));
  const users = await getUserDirectory(supabase, [request.created_by, ...messages.map((m) => m.author_id)]);

  const entries: ThreadEntry[] = [
    {
      id: request.id,
      author: displayName(users.get(request.created_by ?? ""), "Client"),
      fromAgenfy: false,
      body: request.body,
      internal: false,
      created_at: request.created_at,
    },
    ...messages.map((m) => ({
      id: m.id,
      author: displayName(users.get(m.author_id ?? "")),
      fromAgenfy: !!m.author_id && staffIds.has(m.author_id),
      body: m.body,
      internal: m.internal,
      created_at: m.created_at,
    })),
  ];
  const canEdit = canWrite(role);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <BreadcrumbLabel label={request.subject} />
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <Link href={`/clients/${request.organization_id}`} className="text-primary hover:underline">
            {request.organizations?.name}
          </Link>
          {request.projects?.name && ` · ${request.projects.name}`} · {REQUEST_CATEGORY_LABELS[request.category]}
        </p>
        <RequestThread entries={entries} />
        {canEdit && <ReplyForm requestId={request.id} />}
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Suivi</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestStatusForm request={request} staff={staff} canEdit={canEdit} />
        </CardContent>
      </Card>
    </div>
  );
}
