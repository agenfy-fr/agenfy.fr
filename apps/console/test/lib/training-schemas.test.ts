import { describe, expect, it } from "vitest";
import { courseSchema, grantTrainingSchema, inviteContactSchema, lessonSchema, moduleSchema } from "@/lib/schemas";

const COURSE = "cccccccc-0000-4000-8000-000000000001";
const MODULE = "cccccccc-0000-4000-8000-0000000000d1";

describe("training schemas", () => {
  it("parses a course form (objectives one per line, optional numbers)", () => {
    const c = courseSchema.parse({
      title: " IA générative ",
      slug: "IA-Generative",
      category: "essentiels",
      level: "debutant",
      modality: "elearning",
      duration_hours: "7",
      audience: "Tous",
      prerequisites: "Aucun",
      status: "published",
      objectives: "- Comprendre\r\n\n• Pratiquer ",
    });
    expect(c.slug).toBe("ia-generative");
    expect(c.duration_hours).toBe(7);
    expect(c.objectives).toEqual(["Comprendre", "Pratiquer"]);
    expect(c.max_group_size).toBeNull();
    expect(c.price_ht_cents).toBeNull();
  });

  it("rejects an invalid slug and a non-positive duration", () => {
    const base = { title: "x", category: "essentiels", level: "debutant", modality: "elearning", audience: "a", prerequisites: "p", status: "draft" };
    expect(courseSchema.safeParse({ ...base, slug: "a b", duration_hours: "7" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...base, slug: "ok", duration_hours: "0" }).success).toBe(false);
  });

  it("module duration defaults to 0", () => {
    expect(moduleSchema.parse({ title: "M1" }).duration_minutes).toBe(0);
  });

  it("lesson keeps content_md as is", () => {
    const l = lessonSchema.parse({ title: "Intro", slug: "intro", module_id: MODULE, content_md: "# Titre\n\nTexte" });
    expect(l.content_md).toBe("# Titre\n\nTexte");
    expect(l.exercise_md).toBeNull();
  });

  it("grant training: one or several courses, deduplicated", () => {
    expect(grantTrainingSchema.parse({ course_ids: COURSE }).course_ids).toEqual([COURSE]);
    expect(grantTrainingSchema.parse({ course_ids: [COURSE, COURSE] }).course_ids).toEqual([COURSE]);
    expect(grantTrainingSchema.safeParse({}).success).toBe(false);
  });

  it("portal invitation never grants the learner role", () => {
    expect(inviteContactSchema.safeParse({ role: "learner" }).success).toBe(false);
    expect(inviteContactSchema.parse({}).role).toBe("member");
  });
});
