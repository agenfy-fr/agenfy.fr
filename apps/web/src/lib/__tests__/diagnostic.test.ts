import { describe, expect, it } from "vitest";
import { AXES, LEVELS, QUESTIONS, computeResult, isComplete, type Answers } from "@/lib/diagnostic";
import { OFFERS, getOffer } from "@/lib/offers";

const all = (value: number): Answers => Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));

describe("computeResult", () => {
  it("scores 0 and level 1 when every answer is the lowest", () => {
    const r = computeResult(all(0));
    expect(r.score).toBe(0);
    expect(r.level.id).toBe(1);
  });

  it("scores 100 and the top level when every answer is the highest", () => {
    const r = computeResult(all(3));
    expect(r.score).toBe(100);
    expect(r.level.id).toBe(LEVELS.length);
    expect(r.axes.every((a) => a.score === 100)).toBe(true);
  });

  it("clamps out-of-range and tampered values", () => {
    expect(computeResult(all(99)).score).toBe(100);
    expect(computeResult(all(-5)).score).toBe(0);
  });

  it("returns the two weakest axes", () => {
    const answers = all(3);
    for (const q of QUESTIONS.filter((q) => q.axis === "donnees")) answers[q.id] = 0;
    const r = computeResult(answers);
    expect(r.weakest[0].id).toBe("donnees");
    expect(r.weakest).toHaveLength(2);
  });

  it("detects incomplete answers", () => {
    const partial = all(1);
    delete partial[QUESTIONS[0].id];
    expect(isComplete(partial)).toBe(false);
    expect(isComplete(all(1))).toBe(true);
  });
});

describe("catalogue integrity", () => {
  it("every axis has two questions and points to an existing offer", () => {
    for (const axis of AXES) {
      expect(QUESTIONS.filter((q) => q.axis === axis.id)).toHaveLength(2);
      expect(() => getOffer(axis.offerSlug)).not.toThrow();
    }
  });

  it("offers have unique paths, valid related links and quotable summaries", () => {
    expect(new Set(OFFERS.map((o) => o.path)).size).toBe(OFFERS.length);
    for (const offer of OFFERS) {
      for (const slug of offer.related) expect(() => getOffer(slug)).not.toThrow();
      const words = offer.summary.split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(35);
      expect(words).toBeLessThanOrEqual(75);
    }
  });

  it("never claims OPCO/CPF eligibility while Qualiopi is pending", () => {
    // Questions may mention OPCO; claims (summaries, deliverables, answers) must not affirm it.
    const claims = JSON.stringify(
      OFFERS.map(({ summary, deliverables, tagline, faq }) => ({ summary, deliverables, tagline, answers: faq.map((f) => f.answer) }))
    );
    expect(claims).not.toMatch(/finançable/i);
    expect(claims).not.toMatch(/certifié Qualiopi/i);
    const opco = OFFERS.flatMap((o) => o.faq).find((f) => /OPCO/.test(f.question));
    expect(opco?.answer).toMatch(/^Pas encore/);
  });
});
