import { describe, expect, it } from "vitest";
import {
  formatCertificateNumber,
  isValidCertificateNumber,
  luhnCheckDigit,
  normalizeCertificateNumber,
  parseCertificateNumber,
} from "./certificates";

describe("luhnCheckDigit", () => {
  it("matches the reference Luhn values", () => {
    // Classic example: 7992739871 -> check digit 3
    expect(luhnCheckDigit("7992739871")).toBe(3);
    expect(luhnCheckDigit("0")).toBe(0);
    expect(luhnCheckDigit("1")).toBe(8);
  });
  it("rejects non-digits", () => {
    expect(() => luhnCheckDigit("12a")).toThrow();
  });
});

describe("formatCertificateNumber", () => {
  it("pads the sequence and appends the check digit", () => {
    const n = formatCertificateNumber(2026, 1);
    expect(n).toMatch(/^AGF-2026-00001-\d$/);
    expect(n).toBe(`AGF-2026-00001-${luhnCheckDigit("202600001")}`);
  });
  it("produces unique numbers per sequence", () => {
    const set = new Set(Array.from({ length: 500 }, (_, i) => formatCertificateNumber(2026, i + 1)));
    expect(set.size).toBe(500);
  });
  it("rejects out-of-range input", () => {
    expect(() => formatCertificateNumber(2026, 0)).toThrow();
    expect(() => formatCertificateNumber(2026, 100000)).toThrow();
    expect(() => formatCertificateNumber(99, 1)).toThrow();
  });
});

describe("parseCertificateNumber", () => {
  it("round-trips generated numbers", () => {
    for (const seq of [1, 42, 999, 12345, 99999]) {
      const n = formatCertificateNumber(2027, seq);
      expect(parseCertificateNumber(n)).toMatchObject({ year: 2027, sequence: seq });
      expect(isValidCertificateNumber(n)).toBe(true);
    }
  });
  it("detects single-digit typos and transpositions of adjacent digits", () => {
    const n = formatCertificateNumber(2026, 4271);
    const typo = n.replace("04271", "04371");
    const swap = n.replace("04271", "02471");
    expect(isValidCertificateNumber(typo)).toBe(false);
    expect(isValidCertificateNumber(swap)).toBe(false);
  });
  it("normalizes case and spacing", () => {
    const n = formatCertificateNumber(2026, 7);
    expect(normalizeCertificateNumber(` ${n.toLowerCase()} `)).toBe(n);
    expect(isValidCertificateNumber(n.replace(/-/g, " ").toLowerCase())).toBe(true);
    expect(isValidCertificateNumber("AGF-2026-00000-0")).toBe(false);
    expect(isValidCertificateNumber("hello")).toBe(false);
  });
});
