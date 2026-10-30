import type { CourseSeed } from "../types.ts";
import { iaGenerativeEssentiels } from "./ia-generative-essentiels.ts";
import { automatiserIaAgents } from "./automatiser-ia-agents-n8n-mcp.ts";

export const COURSES: CourseSeed[] = [iaGenerativeEssentiels, automatiserIaAgents];
