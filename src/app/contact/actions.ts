"use server";

import { supabase } from "@/lib/supabase";

export interface ContactFormState {
  success: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { success: false, error: "Merci de remplir les champs obligatoires." };
  }

  if (!EMAIL_RE.test(email)) {
    return { success: false, error: "Adresse email invalide." };
  }

  const { error } = await supabase.from("leads").insert([
    {
      name,
      email,
      company: company || null,
      phone: phone || null,
      service: service || null,
      message,
      source: "contact_page",
      status: "Nouveau",
    },
  ]);

  if (error) {
    console.error("Lead insert error:", error);
    return {
      success: false,
      error: "Une erreur est survenue. Réessayez ou écrivez-nous directement à contact@agenfy.fr.",
    };
  }

  return { success: true };
}
