import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { RequestThread, type ThreadEntry } from "@/components/shared/request-thread";
import { REQUEST_CATEGORY_LABELS, REQUEST_STATUS_META, metaOf } from "@/lib/domain";
import { UUID_RE } from "@/lib/schemas";
import { portalScope } from "@/lib/server/portal";
import type { ClientRequest } from "@/lib/types";
import { ClientReplyForm } from "../request-forms";

export const metadata: Metadata = { title: "Demande" };

export default async function PortalRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, orgIds } = await portalScope();

  const { data } = await supabase
    .from("client_requests")
    .select("id, organization_id, created_by, subject, body, category, status, created_at")
    .eq("id", id)
    .in("organization_id", orgIds)
    .maybeSingle();
  const request = data as Pick<ClientRequest, "id" | "organization_id" | "created_by" | "subject" | "body" | "category" | "status" | "created_at"> | null;
  if (!request) notFound();

  const [messagesRes, membersRes] = await Promise.all([
    // `internal = false` explicitly: never rely on RLS alone in the portal.
    supabase
      .from("client_request_messages")
      .select("id, author_id, body, created_at")
      .eq("request_id", id)
      .eq("internal", false)
      .order("created_at"),
    supabase.from("organization_members").select("user_id").eq("organization_id", request.organization_id),
  ]);
  const memberIds = new Set((membersRes.data ?? []).map((m) => m.user_id as string));
  const authorIds = [request.created_by, ...(messagesRes.data ?? []).map((m) => m.author_id)].filter(
    (x): x is string => !!x && memberIds.has(x),
  );
  const { data: profiles } = authorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", authorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) || "Membre de votre équipe"]));
  const nameOf = (authorId: string | null) =>
    authorId && memberIds.has(authorId) ? (names.get(authorId) ?? "Membre de votre équipe") : "Équipe Agenfy";

  const entries: ThreadEntry[] = [
    { id: request.id, author: nameOf(request.created_by), fromAgenfy: false, body: request.body, internal: false, created_at: request.created_at },
    ...(messagesRes.data ?? []).map((m) => ({
      id: m.id as string,
      author: nameOf(m.author_id as string | null),
      fromAgenfy: !(m.author_id && memberIds.has(m.author_id as string)),
      body: m.body as string,
      internal: false,
      created_at: m.created_at as string,
    })),
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <BreadcrumbLabel label={request.subject} />
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge {...metaOf(REQUEST_STATUS_META, request.status)} showDot />
        {REQUEST_CATEGORY_LABELS[request.category]}
      </div>
      <RequestThread entries={entries} />
      {request.status !== "closed" && <ClientReplyForm requestId={request.id} />}
    </div>
  );
}
