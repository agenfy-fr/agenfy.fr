"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["Nouveau", "Contacté", "Qualifié", "Proposition", "Gagné", "Perdu"] as const;

export async function updateLeadStatus(leadId: string, status: string) {
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Statut invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { error: null };
}
