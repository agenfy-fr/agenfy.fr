import { describe, expect, it } from "vitest";
import { parisDateTime } from "./dates";
import { assessmentSummary } from "./assessment";

describe("parisDateTime", () => {
  it("applies winter time (UTC+1)", () => {
    expect(parisDateTime("2026-01-15", "09:00")).toBe("2026-01-15T08:00:00.000Z");
  });
  it("applies summer time (UTC+2)", () => {
    expect(parisDateTime("2026-07-01", "14:00")).toBe("2026-07-01T12:00:00.000Z");
  });
  it("rejects malformed input", () => {
    expect(parisDateTime("15/01/2026", "09:00")).toBeNull();
    expect(parisDateTime("2026-01-15", "9h")).toBeNull();
  });
});

describe("assessmentSummary", () => {
  it("summarizes best quiz scores", () => {
    expect(
      assessmentSummary([
        { quiz: { bestScore: 80, passed: true } },
        { quiz: { bestScore: 60, passed: false } },
        { quiz: null },
      ]),
    ).toBe("1 quiz validé(s) sur 2 — score moyen : 70 % (meilleur score par module).");
    expect(assessmentSummary([{ quiz: { bestScore: null, passed: false } }])).toMatch(/non réalisés/);
    expect(assessmentSummary([])).toMatch(/formateur/);
  });
});
