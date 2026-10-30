import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";
import { EVALUATION_FORMS, parseEvaluation } from "./evaluation-forms";

describe("csv", () => {
  it("quotes separators, quotes and newlines", () => {
    expect(csvCell("a;b")).toBe('"a;b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(3)).toBe("3");
  });
  it("neutralizes formula injection", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("-2")).toBe("'-2");
  });
  it("adds BOM and CRLF", () => {
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe("﻿a;b\r\n1;x\r\n");
  });
});

describe("parseEvaluation", () => {
  it("parses a complete hot questionnaire and computes the overall rating", () => {
    const fd = new FormData();
    for (const id of ["objectives_met", "content", "trainer", "materials", "organisation"]) fd.set(id, "5");
    fd.set("applicability", "2");
    fd.set("objectives:0", "4");
    fd.set("objectives:1", "3");
    fd.set("recommend", "yes");
    fd.set("improve", "  Plus d'exercices  ");
    const r = parseEvaluation(EVALUATION_FORMS.hot, fd, 2);
    expect(r.errors).toEqual([]);
    expect(r.overallRating).toBe(4.5);
    expect(r.answers.objectives).toEqual({ "0": 4, "1": 3 });
    expect(r.comment).toBe("Plus d'exercices");
  });
  it("reports missing required answers and rejects out-of-range values", () => {
    const fd = new FormData();
    fd.set("objectives_met", "9");
    fd.set("recommend", "absolutely");
    const r = parseEvaluation(EVALUATION_FORMS.hot, fd, 1);
    expect(r.errors).toContain("objectives_met");
    expect(r.errors).toContain("recommend");
    expect(r.errors).toContain("objectives");
  });
  it("uses self-assessed levels as the positioning overall rating", () => {
    const fd = new FormData();
    fd.set("objectives:0", "1");
    fd.set("objectives:1", "2");
    fd.set("ai_usage", "weekly");
    fd.set("job", "Assistante de direction");
    fd.set("expectations", "Gagner du temps sur les comptes rendus");
    const r = parseEvaluation(EVALUATION_FORMS.positioning, fd, 2);
    expect(r.errors).toEqual([]);
    expect(r.overallRating).toBe(1.5);
  });
});
