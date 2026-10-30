/**
 * Server guards (lib/server/auth.ts) against a mocked Supabase session:
 * role resolution comes from the staff_role() RPC and organization_members,
 * never from user metadata; failures are closed.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeState {
  user: { id: string; email: string; user_metadata?: Record<string, unknown> } | null;
  staffRole: string | null;
  rpcError: boolean;
  memberships: { organization_id: string; role: string }[];
  /** Staff member signed in without 2FA (staff_role() is null at aal1). */
  mfaPending: boolean;
}

const state: FakeState = { user: null, staffRole: null, rpcError: false, memberships: [], mfaPending: false };

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), cache: <T>(fn: T) => fn }));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw Object.assign(new Error(`REDIRECT ${to}`), { digest: `NEXT_REDIRECT;${to}` });
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user }, error: null }) },
    rpc: async (fn: string) => {
      if (fn === "staff_mfa_pending") return { data: state.mfaPending, error: null };
      if (fn !== "staff_role") throw new Error(`unexpected rpc ${fn}`);
      return state.rpcError ? { data: null, error: { message: "boom" } } : { data: state.staffRole, error: null };
    },
    from: (table: string) => ({
      select: () => ({
        eq: async (_col: string, userId: string) => {
          if (table !== "organization_members") throw new Error(`unexpected table ${table}`);
          return { data: state.user?.id === userId ? state.memberships : [], error: null };
        },
      }),
    }),
  }),
}));

const auth = await import("@/lib/server/auth");
const ORG_A = "aaaaaaaa-0000-4000-8000-000000000000";
const ORG_B = "bbbbbbbb-0000-4000-8000-000000000000";

function signIn(staffRole: string | null, orgs: string[] = [], metadata?: Record<string, unknown>) {
  state.user = { id: "u1", email: "u@example.test", user_metadata: metadata };
  state.staffRole = staffRole;
  state.memberships = orgs.map((organization_id) => ({ organization_id, role: "member" }));
}

async function redirectOf(p: Promise<unknown>): Promise<string | null> {
  try {
    await p;
    return null;
  } catch (err) {
    const m = /^REDIRECT (.+)$/.exec((err as Error).message);
    if (!m) throw err;
    return m[1];
  }
}

beforeEach(() => {
  state.user = null;
  state.staffRole = null;
  state.rpcError = false;
  state.memberships = [];
  state.mfaPending = false;
});

describe("staff 2FA (0004_staff_mfa)", () => {
  it("staff without a verified second factor → 2FA screen, never the staff area", async () => {
    signIn(null);
    state.mfaPending = true;
    expect(await redirectOf(auth.requireStaffPage("/leads"))).toBe("/auth/mfa?next=%2Fleads");
    expect(await redirectOf(auth.requireMemberPage())).toBe("/auth/mfa?next=%2Fportal");
    await expect(auth.requireStaff()).rejects.toThrow(/Double authentification/);
  });

  it("client member is not affected", async () => {
    signIn(null, [ORG_A]);
    expect(await redirectOf(auth.requireMemberPage())).toBeNull();
  });
});

describe("page guards", () => {
  it("anonymous → login", async () => {
    expect(await redirectOf(auth.requireStaffPage())).toBe("/auth/login");
    expect(await redirectOf(auth.requireMemberPage())).toBe("/auth/login");
  });

  it("client member → portal only", async () => {
    signIn(null, [ORG_A]);
    expect(await redirectOf(auth.requireStaffPage("/dashboard"))).toBe("/portal");
    expect(await redirectOf(auth.requireMemberPage())).toBeNull();
  });

  it("staff → back-office, not portal (without membership)", async () => {
    signIn("consultant");
    expect(await redirectOf(auth.requireStaffPage("/projects"))).toBeNull();
    expect(await redirectOf(auth.requireStaffPage("/billing/invoices"))).toBe("/dashboard");
    expect(await redirectOf(auth.requireMemberPage())).toBe("/dashboard");
  });

  it("no role → /unauthorized", async () => {
    signIn(null);
    expect(await redirectOf(auth.requireStaffPage())).toBe("/unauthorized");
    expect(await redirectOf(auth.requireMemberPage())).toBe("/unauthorized");
  });

  it("ignores roles claimed in user metadata", async () => {
    signIn(null, [], { role: "owner", staff: true });
    expect(await redirectOf(auth.requireStaffPage())).toBe("/unauthorized");
  });

  it("fails closed when staff_role() errors", async () => {
    signIn("owner");
    state.rpcError = true;
    expect(await redirectOf(auth.requireStaffPage())).toBe("/unauthorized");
  });
});

describe("action guards", () => {
  it("requireStaff: 401 anonymous, 403 client", async () => {
    await expect(auth.requireStaff()).rejects.toBeInstanceOf(auth.UnauthorizedError);
    signIn(null, [ORG_A]);
    await expect(auth.requireStaff()).rejects.toBeInstanceOf(auth.ForbiddenError);
  });

  it("requireStaffWriter refuses readonly", async () => {
    signIn("readonly");
    await expect(auth.requireStaffWriter()).rejects.toThrow(/lecture seule/);
    signIn("trainer");
    await expect(auth.requireStaffWriter()).resolves.toMatchObject({ role: "trainer" });
  });

  it("requireStaffRole applies domain roles (owner/admin implicit)", async () => {
    signIn("consultant");
    await expect(auth.requireStaffRole(["sales"])).rejects.toBeInstanceOf(auth.ForbiddenError);
    signIn("admin");
    await expect(auth.requireStaffRole(["sales"])).resolves.toMatchObject({ role: "admin" });
  });

  it("requireMemberOf isolates organizations", async () => {
    signIn(null, [ORG_A]);
    await expect(auth.requireMemberOf(ORG_A)).resolves.toBeTruthy();
    await expect(auth.requireMemberOf(ORG_B)).rejects.toBeInstanceOf(auth.ForbiddenError);
  });
});
