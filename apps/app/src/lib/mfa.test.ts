import { describe, expect, it } from "vitest";
import { mfaStep, normalizeTotpCode, passwordProblem } from "./mfa";

describe("mfaStep", () => {
  it("lets an aal2 session through", () => {
    expect(mfaStep({ currentLevel: "aal2", nextLevel: "aal2", staffPending: true })).toBe("ok");
  });
  it("asks for the code when a factor exists but was not used", () => {
    expect(mfaStep({ currentLevel: "aal1", nextLevel: "aal2" })).toBe("challenge");
    expect(mfaStep({ currentLevel: "aal1", nextLevel: "aal2", staffPending: true })).toBe("challenge");
  });
  it("forces enrollment for staff without a factor", () => {
    expect(mfaStep({ currentLevel: "aal1", nextLevel: "aal1", staffPending: true })).toBe("enroll");
  });
  it("leaves clients without a factor alone", () => {
    expect(mfaStep({ currentLevel: "aal1", nextLevel: "aal1" })).toBe("ok");
    expect(mfaStep({ currentLevel: null, nextLevel: null, staffPending: false })).toBe("ok");
  });
});

describe("normalizeTotpCode", () => {
  it("accepts 6 digits with spaces or dashes", () => {
    expect(normalizeTotpCode("123 456")).toBe("123456");
    expect(normalizeTotpCode("123-456")).toBe("123456");
  });
  it("rejects anything else", () => {
    expect(normalizeTotpCode("12345")).toBeNull();
    expect(normalizeTotpCode("abcdef")).toBeNull();
    expect(normalizeTotpCode(null)).toBeNull();
  });
});

describe("passwordProblem", () => {
  it("accepts a strong password", () => {
    expect(passwordProblem("Correct-Horse-42", "contact@agenfy.fr")).toBeNull();
  });
  it("rejects short, uniform, email-based or repetitive passwords", () => {
    expect(passwordProblem("Ab1!short")).toMatch(/12 caractères/);
    expect(passwordProblem("alllowercaseletters")).toMatch(/3 types/);
    expect(passwordProblem("Contact-2026-Agenfy", "contact@agenfy.fr")).toMatch(/adresse e-mail/);
    expect(passwordProblem("Aaaaa-Secure-1")).toMatch(/répétés/);
  });
  it("rejects passwords beyond the bcrypt limit", () => {
    expect(passwordProblem(`Aa1-${"x".repeat(70)}`)).toMatch(/72/);
  });
});
