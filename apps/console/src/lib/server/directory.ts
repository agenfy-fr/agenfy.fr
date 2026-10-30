import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DirectoryUser, StaffMember } from "@/lib/types";

/** Staff list with e-mails (definer RPC, empty for non-staff — migration 0100). */
export async function getStaffDirectory(db: SupabaseClient): Promise<StaffMember[]> {
  const { data, error } = await db.rpc("console_staff_directory");
  if (error) {
    console.error("[directory] staff:", error.message);
    return [];
  }
  return (data ?? []) as StaffMember[];
}

/** id → user (e-mail + name) for arbitrary auth users, staff callers only. */
export async function getUserDirectory(db: SupabaseClient, ids: (string | null | undefined)[]): Promise<Map<string, DirectoryUser>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  if (unique.length === 0) return new Map();
  const { data, error } = await db.rpc("console_user_directory", { p_ids: unique });
  if (error) {
    console.error("[directory] users:", error.message);
    return new Map();
  }
  return new Map(((data ?? []) as DirectoryUser[]).map((u) => [u.id, u]));
}

export function displayName(u: DirectoryUser | null | undefined, fallback = "—"): string {
  return u?.full_name?.trim() || u?.email || fallback;
}
