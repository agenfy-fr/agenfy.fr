/**
 * Source format for course content. Files in content/courses/*.ts are the
 * editorial source of truth; `pnpm --filter @agenfy/app seed:generate`
 * turns them into supabase/migrations/0250_seed_training_courses.sql.
 */

export type Modality = "presentiel" | "distanciel" | "hybride" | "elearning";

export interface QuizQuestionSeed {
  prompt: string;
  choices: string[];
  /** 0-based indexes of the correct choices. More than one => multiple choice. */
  correct: number[];
  explanation: string;
}

export interface LessonSeed {
  slug: string;
  title: string;
  durationMinutes: number;
  objectives: string[];
  /** Main lesson content, Markdown (GFM). */
  content: string;
  /** Practical exercise, Markdown (GFM). */
  exercise: string;
  videoUrl?: string;
}

export interface ModuleSeed {
  title: string;
  summary: string;
  durationMinutes: number;
  lessons: LessonSeed[];
  quiz: {
    title: string;
    passScore?: number;
    /** 5 to 8 questions. */
    questions: QuizQuestionSeed[];
  };
}

export interface CourseSeed {
  slug: string;
  title: string;
  subtitle: string;
  category: "essentiels" | "technique" | "management";
  level: "debutant" | "intermediaire" | "avance";
  audience: string;
  prerequisites: string;
  objectives: string[];
  teachingMethods: string;
  evaluationMethods: string;
  accessibility: string;
  accessDelay: string;
  durationHours: number;
  durationLabel: string;
  modality: Modality;
  /** Indicative price, excl. VAT, in cents. */
  priceHtCents: number | null;
  priceLabel: string | null;
  maxGroupSize: number | null;
  modules: ModuleSeed[];
}
