import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COURSES } from "../content/courses/index.ts";
import { scoreQuiz } from "../src/lib/quiz";
import { buildSeedSql, sqlString, stableUuid, validateCourse } from "./seed-sql.ts";

describe("course content", () => {
  it.each(COURSES.map((c) => [c.slug, c] as const))("%s is valid", (_slug, course) => {
    expect(() => validateCourse(course)).not.toThrow();
    const minutes = course.modules.reduce((s, m) => s + m.durationMinutes, 0);
    expect(minutes).toBe(course.durationHours * 60);
  });

  it("every quiz answer key scores 100 %", () => {
    for (const c of COURSES) {
      for (const m of c.modules) {
        const questions = m.quiz.questions.map((q, i) => ({ id: String(i), correct: q.correct }));
        const answers = Object.fromEntries(questions.map((q) => [q.id, q.correct]));
        expect(scoreQuiz(questions, answers).score).toBe(100);
      }
    }
  });

  it("never claims Qualiopi certification or OPCO/CPF funding", () => {
    const text = JSON.stringify(COURSES);
    expect(text).not.toMatch(/certifi[ée]e? qualiopi/i);
    expect(text).not.toMatch(/finan[cç]able/i);
  });
});

describe("seed SQL", () => {
  it("produces stable RFC 4122 v5 ids", () => {
    const id = stableUuid("course:x");
    expect(id).toBe(stableUuid("course:x"));
    expect(id).not.toBe(stableUuid("course:y"));
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("escapes single quotes", () => {
    expect(sqlString("l'IA")).toBe("'l''IA'");
    expect(sqlString(null)).toBe("null");
  });

  it("is in sync with the committed migration", () => {
    const committed = readFileSync(
      resolve(__dirname, "../../../supabase/migrations/0250_seed_training_courses.sql"),
      "utf8",
    );
    expect(committed).toBe(buildSeedSql(COURSES));
  });
});
