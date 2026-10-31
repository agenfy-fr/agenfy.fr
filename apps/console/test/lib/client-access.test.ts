import { describe, expect, it } from "vitest";
import { buildAccessPeople, grantableCourseIds } from "@/lib/client-access";
import { isLessonVideoPath, lessonVideoPath, uniqueSlug, videoProvider } from "@/lib/training";

const U1 = "00000000-0000-4000-8000-000000000001";
const U2 = "00000000-0000-4000-8000-000000000002";
const U3 = "00000000-0000-4000-8000-000000000003";

describe("buildAccessPeople — one row per person of the client", () => {
  const people = buildAccessPeople(
    [
      { id: "c1", full_name: "Alice Resp", email: "alice@a.test", job_title: "DG", is_primary: true, user_id: U1 },
      { id: "c2", full_name: "Eve Salariée", email: "eve@a.test", job_title: null, is_primary: false, user_id: null },
      { id: "c3", full_name: null, email: "carol@a.test", job_title: null, is_primary: false, user_id: U2 },
    ],
    [
      { user_id: U1, role: "owner", created_at: "2026-01-01" },
      { user_id: U2, role: "learner", created_at: "2026-01-02" },
      { user_id: U3, role: "member", created_at: "2026-01-03" },
    ],
    [
      { id: "e1", user_id: U2, course_id: "k1", course_title: "IA", status: "active", progress_percent: 40 },
      { id: "e2", user_id: U2, course_id: "k2", course_title: "Agents", status: "cancelled", progress_percent: 0 },
    ],
    new Map([[U3, { email: "dan@a.test", full_name: "Dan" }]]),
  );

  it("merges contacts, accounts and enrollments without duplicates", () => {
    expect(people.map((p) => p.name)).toEqual(["Alice Resp", "Dan", "carol@a.test", "Eve Salariée"]);
  });

  it("portal access only for owner/manager/member", () => {
    const byName = new Map(people.map((p) => [p.name, p]));
    expect(byName.get("Alice Resp")?.portalAccess).toBe(true);
    expect(byName.get("Dan")?.portalAccess).toBe(true);
    expect(byName.get("carol@a.test")?.portalAccess).toBe(false);
    expect(byName.get("carol@a.test")?.role).toBe("learner");
    expect(byName.get("Eve Salariée")?.role).toBeNull();
    expect(byName.get("Eve Salariée")?.key).toBe("contact:c2");
  });

  it("lists trainings sorted and offers only the courses not already active", () => {
    const carol = people.find((p) => p.userId === U2)!;
    expect(carol.enrollments.map((e) => e.course_title)).toEqual(["Agents", "IA"]);
    expect(grantableCourseIds(carol, ["k1", "k2", "k3"])).toEqual(["k2", "k3"]);
  });
});

describe("lesson videos", () => {
  const C = "cccccccc-0000-4000-8000-000000000001";
  const L = "cccccccc-0000-4000-8000-0000000000e1";

  it("builds a safe storage path under <course>/<lesson>/", () => {
    const path = lessonVideoPath(C, L, "Intro Vidéo (v2).MP4", 123);
    expect(path).toBe(`${C}/${L}/123-intro-video-v2.mp4`);
    expect(isLessonVideoPath(path, C, L)).toBe(true);
    expect(isLessonVideoPath(`${C}/other/x.mp4`, C, L)).toBe(false);
    expect(isLessonVideoPath(`${C}/${L}/../x.mp4`, C, L)).toBe(false);
    expect(isLessonVideoPath(`${C}/${L}/a/b.mp4`, C, L)).toBe(false);
  });

  it("recognizes providers", () => {
    expect(videoProvider("https://youtu.be/abc")).toBe("youtube");
    expect(videoProvider("https://www.youtube.com/watch?v=abc")).toBe("youtube");
    expect(videoProvider("https://vimeo.com/123")).toBe("vimeo");
    expect(videoProvider("https://cdn.example.test/v.mp4")).toBe("other");
  });

  it("unique slugs", () => {
    expect(uniqueSlug("Introduction à l'IA", ["introduction-a-l-ia"])).toBe("introduction-a-l-ia-2");
    expect(uniqueSlug("!!!", [])).toBe("lecon");
  });
});
