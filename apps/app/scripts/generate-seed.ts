/**
 * Writes supabase/migrations/0250_seed_training_courses.sql from content/courses.
 * Usage: pnpm --filter @agenfy/app seed:generate   (Node >= 22.18, native TS)
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COURSES } from "../content/courses/index.ts";
import { buildSeedSql } from "./seed-sql.ts";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../../../supabase/migrations/0250_seed_training_courses.sql");

writeFileSync(target, buildSeedSql(COURSES), "utf8");
console.log(`Wrote ${target}`);
