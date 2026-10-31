import { describe, expect, it } from "vitest";
import {
  BILLING_WRITE_ROLES,
  LEAD_WRITE_ROLES,
  STAFF_ROLES,
  TRAINING_WRITE_ROLES,
  canAccessRoute,
  canWrite,
  canWriteDomain,
  decideArea,
  filterNavForRole,
  isLearnerOnly,
  isMember,
  resolveHome,
  splitMemberships,
  safeNextPath,
  type AccessContext,
  type StaffRole,
} from "@/lib/access-control";
import { navigationGroups } from "@/lib/navigation";

const ORG_A = "aaaaaaaa-0000-4000-8000-000000000000";

function ctx(staffRole: StaffRole | null, orgs: string[] = []): AccessContext {
  return {
    userId: "u1",
    email: "u@example.test",
    staffRole,
    memberships: orgs.map((organization_id) => ({ organization_id, role: "member" as const })),
  };
}

describe("resolveHome — landing after sign-in", () => {
  it.each([
    ["anonymous", null, "/auth/login"],
    ["staff owner", ctx("owner"), "/dashboard"],
    ["staff readonly", ctx("readonly"), "/dashboard"],
    ["client member", ctx(null, [ORG_A]), "/portal"],
    ["staff AND client member → staff wins", ctx("consultant", [ORG_A]), "/dashboard"],
    ["authenticated, no role (e.g. learner of app.agenfy.fr)", ctx(null), "/unauthorized"],
  ] as const)("%s → %s", (_label, c, expected) => {
    expect(resolveHome(c)).toBe(expected);
  });

  it("treats an unknown / forged role as not staff", () => {
    expect(resolveHome({ ...ctx(null), staffRole: "superuser" as StaffRole })).toBe("/unauthorized");
  });
});

describe("decideArea — (staff) and (portal) route-group guards", () => {
  it("redirects anonymous users to login in both areas", () => {
    expect(decideArea("staff", null)).toEqual({ allow: false, redirect: "/auth/login" });
    expect(decideArea("portal", null)).toEqual({ allow: false, redirect: "/auth/login" });
  });

  it("keeps clients out of the back-office (sent to their portal)", () => {
    expect(decideArea("staff", ctx(null, [ORG_A]))).toEqual({ allow: false, redirect: "/portal" });
  });

  it("keeps staff without membership out of the portal (sent to the dashboard)", () => {
    expect(decideArea("portal", ctx("admin"))).toEqual({ allow: false, redirect: "/dashboard" });
  });

  it("sends accounts with no role to /unauthorized from both areas", () => {
    expect(decideArea("staff", ctx(null))).toEqual({ allow: false, redirect: "/unauthorized" });
    expect(decideArea("portal", ctx(null))).toEqual({ allow: false, redirect: "/unauthorized" });
  });

  it("allows every staff role in the staff area and members in the portal", () => {
    for (const role of STAFF_ROLES) expect(decideArea("staff", ctx(role), "/projects")).toEqual({ allow: true });
    expect(decideArea("portal", ctx(null, [ORG_A]))).toEqual({ allow: true });
    expect(decideArea("portal", ctx("sales", [ORG_A]))).toEqual({ allow: true });
  });

  it("applies ROLE_ACCESS inside the staff area", () => {
    expect(decideArea("staff", ctx("trainer"), "/billing/invoices")).toEqual({ allow: false, redirect: "/dashboard" });
    expect(decideArea("staff", ctx("consultant"), "/billing/quotes/x")).toEqual({ allow: false, redirect: "/dashboard" });
    expect(decideArea("staff", ctx("sales"), "/billing/invoices")).toEqual({ allow: true });
    expect(decideArea("staff", ctx("trainer"), "/leads")).toEqual({ allow: false, redirect: "/dashboard" });
  });
});

describe("role matrix — sections", () => {
  const matrix: Record<StaffRole, { leads: boolean; billing: boolean }> = {
    owner: { leads: true, billing: true },
    admin: { leads: true, billing: true },
    consultant: { leads: true, billing: false },
    sales: { leads: true, billing: true },
    trainer: { leads: false, billing: false },
    readonly: { leads: true, billing: true },
  };
  it.each(Object.entries(matrix))("%s", (role, expected) => {
    expect(canAccessRoute(role, "/leads")).toBe(expected.leads);
    expect(canAccessRoute(role, "/billing/invoices?x=1")).toBe(expected.billing);
    expect(canAccessRoute(role, "/projects")).toBe(true);
    expect(canAccessRoute(role, "/clients/123")).toBe(true);
  });

  it("denies everything to a non-staff role", () => {
    expect(canAccessRoute(null, "/projects")).toBe(false);
    expect(canAccessRoute("member", "/dashboard")).toBe(false);
  });

  it("does not match prefixes partially (/leadsx is not /leads)", () => {
    expect(canAccessRoute("trainer", "/leadsx")).toBe(true);
  });
});

describe("role matrix — writes (mirror of staff_can_write / staff_has_role)", () => {
  const writes: Record<StaffRole, { any: boolean; leads: boolean; billing: boolean }> = {
    owner: { any: true, leads: true, billing: true },
    admin: { any: true, leads: true, billing: true },
    consultant: { any: true, leads: true, billing: false },
    sales: { any: true, leads: true, billing: true },
    trainer: { any: true, leads: false, billing: false },
    readonly: { any: false, leads: false, billing: false },
  };
  it.each(Object.entries(writes))("%s", (role, expected) => {
    expect(canWrite(role)).toBe(expected.any);
    expect(canWriteDomain(role, LEAD_WRITE_ROLES)).toBe(expected.leads);
    expect(canWriteDomain(role, BILLING_WRITE_ROLES)).toBe(expected.billing);
  });

  it("fails closed on empty / unknown roles", () => {
    expect(canWrite(undefined)).toBe(false);
    expect(canWrite("")).toBe(false);
    expect(canWrite("root")).toBe(false);
  });

  it("team management (empty role list) is owner/admin only", () => {
    expect(canWriteDomain("owner", [])).toBe(true);
    expect(canWriteDomain("admin", [])).toBe(true);
    expect(canWriteDomain("sales", [])).toBe(false);
  });
});

describe("navigation filtering", () => {
  it("hides billing and leads from a trainer", () => {
    const hrefs = filterNavForRole(navigationGroups, "trainer").flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).not.toContain("/leads");
    expect(hrefs).not.toContain("/billing/invoices");
    expect(hrefs).toContain("/projects");
  });

  it("returns nothing for a non-staff role", () => {
    expect(filterNavForRole(navigationGroups, null)).toEqual([]);
  });
});

describe("safeNextPath — open-redirect protection", () => {
  it.each([
    ["/projects/1", "/projects/1"],
    ["/portal?x=1", "/portal?x=1"],
    ["https://evil.test", null],
    ["//evil.test", null],
    ["/\\evil.test", null],
    ["/auth/callback", null],
    ["", null],
    [null, null],
  ])("%s → %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("training access (0304): learners never enter the console portal", () => {
  const learner = (orgs: string[] = [ORG_A]): AccessContext => ({ ...ctx(null), learnerOrgIds: orgs });

  it("splits own membership rows into portal memberships and training-only organizations", () => {
    expect(
      splitMemberships([
        { organization_id: ORG_A, role: "owner" },
        { organization_id: "b", role: "learner" },
        { organization_id: "c", role: "superuser" },
      ]),
    ).toEqual({ memberships: [{ organization_id: ORG_A, role: "owner" }], learnerOrgIds: ["b"] });
  });

  it("a learner-only account lands on /unauthorized (message + link to app.agenfy.fr), never the portal", () => {
    expect(isLearnerOnly(learner())).toBe(true);
    expect(resolveHome(learner())).toBe("/unauthorized");
    expect(decideArea("portal", learner())).toEqual({ allow: false, redirect: "/unauthorized" });
    expect(decideArea("staff", learner())).toEqual({ allow: false, redirect: "/unauthorized" });
  });

  it("a learner row passed as a membership by mistake still does not open the portal", () => {
    const forged: AccessContext = { ...ctx(null), memberships: [{ organization_id: ORG_A, role: "learner" }] };
    expect(isMember(forged)).toBe(false);
    expect(decideArea("portal", forged)).toEqual({ allow: false, redirect: "/unauthorized" });
  });

  it("a responsable who also follows a training keeps the portal", () => {
    const both: AccessContext = { ...ctx(null, [ORG_A]), learnerOrgIds: ["other"] };
    expect(isLearnerOnly(both)).toBe(false);
    expect(decideArea("portal", both)).toEqual({ allow: true });
  });

  it("staff who are also learners stay staff", () => {
    expect(isLearnerOnly({ ...ctx("trainer"), learnerOrgIds: [ORG_A] })).toBe(false);
  });

  it("training section: every staff role reads, writes mirror is_training_staff()", () => {
    for (const role of STAFF_ROLES) {
      expect(canAccessRoute(role, "/training")).toBe(true);
      expect(canAccessRoute(role, "/training/access")).toBe(true);
      expect(canWriteDomain(role, TRAINING_WRITE_ROLES)).toBe(role !== "readonly");
    }
  });

  it("training entries appear in the staff navigation", () => {
    const hrefs = filterNavForRole(navigationGroups, "trainer").flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toEqual(expect.arrayContaining(["/training", "/training/access"]));
  });
});
