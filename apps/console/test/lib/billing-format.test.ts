import { describe, expect, it } from "vitest";
import { BILLING_NUMBER_RE, computeTotals, lineTotalCents } from "@/lib/billing";
import { centsToInput, formatCents, parseEurosToCents, slugify } from "@/lib/format";
import { formatTaskKey, parseTaskKey } from "@/lib/domain";
import { buildCSP, supabaseConnectSources } from "@/lib/csp";
import { billingLineSchema, projectCreateSchema } from "@/lib/schemas";

describe("billing math (mirror of 0101 triggers)", () => {
  it("computes line totals with exact decimals", () => {
    expect(lineTotalCents({ quantity: 2, unit_price_cents: 50000 })).toBe(100000);
    // 0.29 * 50 = 14.5 → 15 (floats would give 14.4999… → 14)
    expect(lineTotalCents({ quantity: 0.29, unit_price_cents: 50 })).toBe(15);
    expect(lineTotalCents({ quantity: 1.5, unit_price_cents: 333 })).toBe(500);
  });

  it("applies 20 % VAT on the subtotal, rounded to the cent", () => {
    expect(computeTotals([{ quantity: 2, unit_price_cents: 50000 }, { quantity: 1, unit_price_cents: 1234 }], 20)).toEqual({
      subtotal_cents: 101234,
      vat_cents: 20247,
      total_cents: 121481,
    });
    expect(computeTotals([], 20)).toEqual({ subtotal_cents: 0, vat_cents: 0, total_cents: 0 });
    expect(computeTotals([{ quantity: 3, unit_price_cents: 80000 }], 20).total_cents).toBe(288000);
  });

  it("recognizes the numbering format", () => {
    expect(BILLING_NUMBER_RE.test("FAC-2026-0001")).toBe(true);
    expect(BILLING_NUMBER_RE.test("DEV-2026-12345")).toBe(true);
    expect(BILLING_NUMBER_RE.test("FAC-26-1")).toBe(false);
  });
});

describe("amount parsing / formatting", () => {
  it.each([
    ["1 234,56", 123456],
    ["1234.5", 123450],
    ["850", 85000],
    ["1 250,00 €", 125000],
    ["0,05", 5],
    ["12,345", null],
    ["-5", null],
    ["abc", null],
    ["", null],
  ])("%s → %s", (input, expected) => {
    expect(parseEurosToCents(input)).toBe(expected);
  });

  it("round-trips through the form input format", () => {
    expect(centsToInput(123456)).toBe("1234,56");
    expect(parseEurosToCents(centsToInput(5))).toBe(5);
    expect(formatCents(123456)).toMatch(/1\s?234,56\s?€/);
    expect(formatCents(null)).toBe("—");
  });

  it("validates billing lines from form strings", () => {
    expect(billingLineSchema.parse({ description: "Atelier", quantity: "1,5", unit_price: "1 000" })).toEqual({
      description: "Atelier",
      quantity: 1.5,
      unit_price: 100000,
    });
    expect(billingLineSchema.safeParse({ description: "x", quantity: "0", unit_price: "1" }).success).toBe(false);
    expect(billingLineSchema.safeParse({ description: "x", quantity: "1", unit_price: "1,234" }).success).toBe(false);
  });
});

describe("misc helpers", () => {
  it("slugifies organization names", () => {
    expect(slugify("Société Démo & Fils SAS")).toBe("societe-demo-fils-sas");
  });

  it("formats and parses task keys", () => {
    expect(formatTaskKey("ACME", 7)).toBe("ACME-007");
    expect(parseTaskKey("acme-7")).toEqual({ code: "ACME", number: 7 });
    expect(parseTaskKey("not a key")).toBeNull();
  });

  it("validates project codes and date ranges", () => {
    const base = { organization_id: "aaaaaaaa-0000-4000-8000-000000000000", name: "Projet" };
    expect(projectCreateSchema.parse({ ...base, code: "acme2" }).code).toBe("ACME2");
    expect(projectCreateSchema.safeParse({ ...base, code: "1AB" }).success).toBe(false);
    expect(projectCreateSchema.safeParse({ ...base, code: "ACME", start_date: "2026-05-01", end_date: "2026-04-01" }).success).toBe(false);
  });

  it("builds a nonce CSP allowing only the configured Supabase origin", () => {
    const csp = buildCSP("abc", { isDev: false, supabaseUrl: "https://xyz.supabase.co" });
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("connect-src 'self' https://xyz.supabase.co wss://xyz.supabase.co");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(supabaseConnectSources(undefined)).toBe("");
    expect(supabaseConnectSources("not a url")).toBe("");
  });
});
