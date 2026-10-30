import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROJECT_ACME, USER_EVAN, createFakeSupabase, seedPlanning, type FakeDb } from "../helpers/fake-supabase";
import { generateApiToken } from "@/lib/planning/api-tokens";

const state = vi.hoisted(() => ({ db: null as unknown as FakeDb }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createFakeSupabase(state.db),
}));

import { DELETE, GET, POST } from "@/app/api/mcp/route";

function seedWithToken(scopes: string[], role = "consultant") {
  const db = seedPlanning();
  const { token, hash, prefix } = generateApiToken();
  db.tables.staff_api_tokens = [
    { id: "tok-1", user_id: USER_EVAN, token_hash: hash, token_prefix: prefix, scopes, revoked_at: null, expires_at: null, last_used_at: null },
  ];
  db.tables.staff = [{ user_id: USER_EVAN, role, suspended: false }];
  db.tables.console_mcp_audit = [];
  state.db = db;
  return token;
}

let rpcId = 0;
function rpc(token: string | null, method: string, params: Record<string, unknown> = {}) {
  return new Request("https://console.agenfy.fr/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-06-18",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
}

async function toolNames(token: string): Promise<string[]> {
  const res = await POST(rpc(token, "tools/list"));
  expect(res.status).toBe(200);
  return ((await res.json()) as { result: { tools: { name: string }[] } }).result.tools.map((t) => t.name);
}

async function callTool(token: string, name: string, args: Record<string, unknown>) {
  const res = await POST(rpc(token, "tools/call", { name, arguments: args }));
  expect(res.status).toBe(200);
  const body = (await res.json()) as { result: { content: { text: string }[]; isError?: boolean } };
  return { isError: Boolean(body.result.isError), text: body.result.content[0].text };
}

describe("/api/mcp (agenfy-console)", () => {
  beforeEach(() => {
    seedWithToken(["console:read", "console:write"]);
  });

  it("401 without / with an unknown token, 405 on GET/DELETE", async () => {
    expect((await POST(rpc(null, "tools/list"))).status).toBe(401);
    const res = await POST(rpc(generateApiToken().token, "tools/list"));
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toMatch(/agenfy-console/);
    expect(GET().status).toBe(405);
    expect(DELETE().status).toBe(405);
  });

  it("initialize advertises agenfy-console", async () => {
    const token = seedWithToken(["console:read"]);
    const res = await POST(rpc(token, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { result: { serverInfo: { name: string } } }).result.serverInfo.name).toBe("agenfy-console");
  });

  it("hides write tools from read-only tokens and readonly accounts", async () => {
    const readToken = seedWithToken(["console:read"]);
    const names = await toolNames(readToken);
    expect(names).toEqual(expect.arrayContaining(["list_clients", "list_projects", "list_tasks", "get_task", "dashboard_kpis"]));
    expect(names).not.toContain("create_task");

    const demoted = seedWithToken(["console:read", "console:write"], "readonly");
    expect(await toolNames(demoted)).not.toContain("update_task");
  });

  it("hides lead tools from roles without /leads access", async () => {
    const trainer = seedWithToken(["console:read", "console:write"], "trainer");
    const names = await toolNames(trainer);
    expect(names).not.toContain("list_leads");
    expect(names).not.toContain("update_lead_status");
    expect(names).toContain("create_task");
  });

  it("creates and updates a task by key, and audits every call", async () => {
    const token = seedWithToken(["console:read", "console:write"]);
    const created = await callTool(token, "create_task", { project: "ACME", title: "Brancher l'agent", assignee: "me" });
    expect(created.isError).toBe(false);
    const task = JSON.parse(created.text) as { key: string; assignee_id: string; project_id: string; client_visible: boolean };
    expect(task.key).toBe("ACME-007");
    expect(task.assignee_id).toBe(USER_EVAN);
    expect(task.project_id).toBe(PROJECT_ACME);
    expect(task.client_visible).toBe(false);

    const updated = await callTool(token, "update_task", { task: "ACME-007", status: "review" });
    expect(JSON.parse(updated.text).status).toBe("review");

    const bad = await callTool(token, "update_task", { task: "ACME-999", status: "done" });
    expect(bad.isError).toBe(true);
    expect(bad.text).toMatch(/introuvable/);

    const audit = state.db.tables.console_mcp_audit;
    expect(audit.map((a) => [a.tool, a.ok])).toEqual([
      ["create_task", true],
      ["update_task", true],
      ["update_task", false],
    ]);
  });
});
