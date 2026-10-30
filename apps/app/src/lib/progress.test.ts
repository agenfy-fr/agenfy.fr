import { describe, expect, it } from "vitest";
import {
  averageProgress,
  averageRating,
  coldEvaluationDueDate,
  completionRate,
  computeProgress,
  isColdEvaluationOpen,
  isSignatureWindowOpen,
  lessonNeighbours,
  nextLesson,
  type OutlineModule,
} from "./progress";

const outline: OutlineModule[] = [
  {
    id: "m1",
    title: "Module 1",
    lessons: [
      { id: "l1", slug: "a", title: "A" },
      { id: "l2", slug: "b", title: "B" },
    ],
  },
  { id: "m2", title: "Module 2", lessons: [{ id: "l3", slug: "c", title: "C" }] },
];

describe("computeProgress", () => {
  it("returns 0 for empty courses", () => {
    expect(computeProgress(0, 0)).toBe(0);
    expect(computeProgress(-3, 2)).toBe(0);
  });
  it("floors so 100 means really everything", () => {
    expect(computeProgress(3, 1)).toBe(33);
    expect(computeProgress(3, 2)).toBe(66);
    expect(computeProgress(200, 199)).toBe(99);
    expect(computeProgress(3, 3)).toBe(100);
  });
  it("clamps inconsistent counts", () => {
    expect(computeProgress(3, 5)).toBe(100);
    expect(computeProgress(3, -1)).toBe(0);
  });
});

describe("lesson navigation", () => {
  it("finds the next lesson to do across modules", () => {
    expect(nextLesson(outline, [])?.id).toBe("l1");
    expect(nextLesson(outline, ["l1", "l2"])?.id).toBe("l3");
    expect(nextLesson(outline, ["l1", "l2", "l3"])).toBeNull();
    expect(nextLesson(outline, ["l2"])?.id).toBe("l1");
  });
  it("computes previous/next neighbours", () => {
    const n = lessonNeighbours(outline, "b");
    expect(n.previous?.id).toBe("l1");
    expect(n.next?.id).toBe("l3");
    expect(n.index).toBe(1);
    expect(n.total).toBe(3);
    expect(lessonNeighbours(outline, "a").previous).toBeNull();
    expect(lessonNeighbours(outline, "c").next).toBeNull();
    expect(lessonNeighbours(outline, "zzz").index).toBe(-1);
  });
});

describe("team reporting", () => {
  const enrollments = [
    { status: "completed" as const, progress_percent: 100 },
    { status: "active" as const, progress_percent: 50 },
    { status: "active" as const, progress_percent: 0 },
    { status: "cancelled" as const, progress_percent: 10 },
  ];
  it("computes completion rate without cancelled enrollments", () => {
    expect(completionRate(enrollments)).toBe(33);
    expect(completionRate([])).toBeNull();
    expect(completionRate([{ status: "cancelled", progress_percent: 0 }])).toBeNull();
  });
  it("computes average progress", () => {
    expect(averageProgress(enrollments)).toBe(50);
    expect(averageProgress([])).toBeNull();
  });
  it("averages ratings, ignoring empty values and parsing numeric strings", () => {
    expect(averageRating([4, 5, null, "3.5", undefined])).toBe(4.2);
    expect(averageRating([])).toBeNull();
    expect(averageRating([null, "abc"])).toBeNull();
  });
});

describe("cold evaluation (J+60)", () => {
  it("opens 60 days after completion", () => {
    const completed = "2026-01-01T10:00:00Z";
    expect(coldEvaluationDueDate(completed)?.toISOString()).toBe("2026-03-02T10:00:00.000Z");
    expect(isColdEvaluationOpen(completed, new Date("2026-03-01T10:00:00Z"))).toBe(false);
    expect(isColdEvaluationOpen(completed, new Date("2026-03-02T10:00:00Z"))).toBe(true);
    expect(isColdEvaluationOpen(null)).toBe(false);
    expect(coldEvaluationDueDate("not a date")).toBeNull();
  });
});

describe("attendance signature window", () => {
  const start = "2026-05-12T07:00:00Z";
  const end = "2026-05-12T10:30:00Z";
  it("opens 30 min before start and closes 60 min after end", () => {
    expect(isSignatureWindowOpen(start, end, new Date("2026-05-12T06:29:00Z"))).toBe(false);
    expect(isSignatureWindowOpen(start, end, new Date("2026-05-12T06:30:00Z"))).toBe(true);
    expect(isSignatureWindowOpen(start, end, new Date("2026-05-12T11:30:00Z"))).toBe(true);
    expect(isSignatureWindowOpen(start, end, new Date("2026-05-12T11:31:00Z"))).toBe(false);
  });
});
