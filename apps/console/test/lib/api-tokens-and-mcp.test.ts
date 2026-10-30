import { describe, expect, it } from "vitest";
import {
  TOKEN_RE,
  authenticateApiToken,
  boundScopesByRole,
  extractBearer,
  generateApiToken,
  hashApiToken,
} from "@/lib/planning/api-tokens";
import { accessDenied } from "@/lib/mcp/core";
import { LEAD_WRITE_ROLES } from "@/lib/access-control";
import { createFakeSupabase } from "../helpers/fake-supabase";

describe("API tokens", () => {
  it("generates acp_ tokens with 256 bits and a stable SHA-256", () => {
    const { token, hash, prefix } = generateApiToken();
    expect(token).toMatch(TOKEN_RE);
    expect(token.startsWith("acp_")).toBe(true);
    expect(prefix).toBe(token.slice(0, 12));
    expect(hash).toBe(hashApiToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(generateApiToken().token).not.toBe(token);
  });

  it("extracts only well-formed Bearer acp_ tokens", () => {
    const { token } = generateApiToken();
    expect(extractBearer(`Bearer ${token}`)).toBe(token);
    expect(extractBearer(`bearer   ${token}  `)).toBe(token);
    expect(extractBearer(null)).toBeNull();
    expect(extractBearer(`Basic ${token}`)).toBeNull();
    expect(extractBearer("Bearer hcp_" + "a".repeat(43))).toBeNull();
    expect(extractBearer(`Bearer ${token}x`)).toBeNull();
  });

  it("drops write scope for readonly and everything for non-staff", () => {
    expect(boundScopesByRole(["console:read", "console:write"], "consultant")).toEqual(["console:read", "console:write"]);
    expect(boundScopesByRole(["console:read", "console:write"], "readonly")).toEqual(["console:read"]);
    expect(boundScopesByRole(["console:read", "planning:write"], "owner")).toEqual(["console:read"]);
    expect(boundScopesByRole(["console:read"], null)).toEqual([]);
  });

  describe("authenticateApiToken", () => {
    const { token, hash } = generateApiToken();
    const base = () => ({
      tables: {
        staff_api_tokens: [
          { id: "t1", user_id: "u1", token_hash: hash, scopes: ["console:read", "console:write"], expires_at: null, revoked_at: null, last_used_at: null },
        ],
        staff: [{ user_id: "u1", role: "sales", suspended: false }],
      },
    });

    it("accepts a valid token of an active staff member", async () => {
      const db = base();
      const p = await authenticateApiToken(createFakeSupabase(db) as never, token);
      expect(p).toEqual({ tokenId: "t1", userId: "u1", scopes: ["console:read", "console:write"], role: "sales" });
      expect(db.tables.staff_api_tokens[0].last_used_at).not.toBeNull();
    });

    it("rejects revoked, expired, unknown tokens and suspended / removed staff", async () => {
      const revoked = base();
      revoked.tables.staff_api_tokens[0].revoked_at = new Date().toISOString() as never;
      expect(await authenticateApiToken(createFakeSupabase(revoked) as never, token)).toBeNull();

      const expired = base();
      expired.tables.staff_api_tokens[0].expires_at = new Date(Date.now() - 1000).toISOString() as never;
      expect(await authenticateApiToken(createFakeSupabase(expired) as never, token)).toBeNull();

      expect(await authenticateApiToken(createFakeSupabase(base()) as never, generateApiToken().token)).toBeNull();

      const suspended = base();
      suspended.tables.staff[0].suspended = true;
      expect(await authenticateApiToken(createFakeSupabase(suspended) as never, token)).toBeNull();

      const removed = base();
      removed.tables.staff = [];
      expect(await authenticateApiToken(createFakeSupabase(removed) as never, token)).toBeNull();
    });

    it("bounds scopes by the owner's current role", async () => {
      const demoted = base();
      demoted.tables.staff[0].role = "readonly";
      const p = await authenticateApiToken(createFakeSupabase(demoted) as never, token);
      expect(p?.scopes).toEqual(["console:read"]);
    });
  });
});

describe("MCP accessDenied", () => {
  const read = { scopes: ["console:read"] as const };
  const write = { scopes: ["console:write"] as const, write: true };

  it("requires the token scope", () => {
    expect(accessDenied({ scopes: ["console:read"], role: "owner" }, write)).toMatch(/scope console:write/);
    expect(accessDenied({ scopes: ["console:read"], role: "owner" }, read)).toBeNull();
  });

  it("applies the owner's section access and write roles", () => {
    expect(accessDenied({ scopes: ["console:read"], role: "trainer" }, { ...read, section: "/leads" })).toMatch(/\/leads/);
    expect(accessDenied({ scopes: ["console:write"], role: "trainer" }, { ...write, roles: LEAD_WRITE_ROLES })).toMatch(/rôle/);
    expect(accessDenied({ scopes: ["console:write"], role: "sales" }, { ...write, section: "/leads", roles: LEAD_WRITE_ROLES })).toBeNull();
  });

  it("refuses writes to readonly even with the scope", () => {
    expect(accessDenied({ scopes: ["console:write"], role: "readonly" }, write)).toMatch(/lecture seule/);
  });
});
