export type SearchResultType = "client" | "project" | "task" | "lead";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

/** Escape a user term for a PostgREST `.or(…ilike…)` filter. */
export function ilikeTerm(q: string): string {
  return `%${q.replace(/[%_,().\\*]/g, " ").trim()}%`;
}
