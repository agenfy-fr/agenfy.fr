import { describe, expect, it } from "vitest";
import { answersFromFormData, isAnswerCorrect, normalizeSelection, scoreQuiz } from "./quiz";

const questions = [
  { id: "q1", correct: [1] },
  { id: "q2", correct: [0, 2] },
  { id: "q3", correct: [3] },
  { id: "q4", correct: [0] },
];

describe("normalizeSelection", () => {
  it("dedupes, sorts and drops invalid values", () => {
    expect(normalizeSelection([2, "0", 2, -1, 1.5, "x", null])).toEqual([0, 2]);
    expect(normalizeSelection("1")).toEqual([]);
    expect(normalizeSelection(undefined)).toEqual([]);
  });
});

describe("isAnswerCorrect", () => {
  it("requires the exact set for multiple-answer questions (no partial credit)", () => {
    expect(isAnswerCorrect([2, 0], [0, 2])).toBe(true);
    expect(isAnswerCorrect([0], [0, 2])).toBe(false);
    expect(isAnswerCorrect([0, 1, 2], [0, 2])).toBe(false);
    expect(isAnswerCorrect([], [0])).toBe(false);
  });
});

describe("scoreQuiz", () => {
  it("scores a perfect attempt", () => {
    const r = scoreQuiz(questions, { q1: [1], q2: [0, 2], q3: [3], q4: [0] });
    expect(r).toMatchObject({ correctCount: 4, total: 4, score: 100, passed: true });
  });
  it("counts unanswered questions as wrong and rounds the score", () => {
    const r = scoreQuiz(questions.slice(0, 3), { q1: [1], q2: [0] });
    expect(r.correctCount).toBe(1);
    expect(r.score).toBe(33);
    expect(r.passed).toBe(false);
    expect(r.perQuestion).toEqual({ q1: true, q2: false, q3: false });
  });
  it("applies the pass threshold inclusively", () => {
    const r = scoreQuiz(questions, { q1: [1], q2: [0, 2], q3: [3] }, 75);
    expect(r.score).toBe(75);
    expect(r.passed).toBe(true);
    expect(scoreQuiz(questions, { q1: [1], q2: [0, 2], q3: [3] }, 76).passed).toBe(false);
  });
  it("rejects empty quizzes", () => {
    expect(() => scoreQuiz([], {})).toThrow("empty_quiz");
  });
});

describe("answersFromFormData", () => {
  it("collects checkbox and radio values per question", () => {
    const fd = new FormData();
    fd.append("q:q1", "1");
    fd.append("q:q2", "2");
    fd.append("q:q2", "0");
    fd.append("q:q2", "0");
    fd.append("q:q3", "-4");
    fd.append("other", "1");
    expect(answersFromFormData(fd)).toEqual({ q1: [1], q2: [0, 2] });
  });
});
