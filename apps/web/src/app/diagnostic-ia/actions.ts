"use server";

import { getSupabase } from "@/lib/supabase";
import { QUESTIONS, computeResult, isComplete, type Answers } from "@/lib/diagnostic";

export interface DiagnosticLeadState {
  success: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitDiagnosticLead(
  _prevState: DiagnosticLeadState,
  formData: FormData
): Promise<DiagnosticLeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const consent = formData.get("consent") === "on";

  let answers: Answers;
  try {
    answers = JSON.parse(String(formData.get("answers") ?? "{}"));
  } catch {
    return { success: false, error: "Réponses invalides, recommencez le diagnostic." };
  }

  if (!name || !email) return { success: false, error: "Merci d'indiquer votre nom et votre email." };
  if (!EMAIL_RE.test(email)) return { success: false, error: "Adresse email invalide." };
  if (!consent) return { success: false, error: "Merci d'accepter d'être recontacté." };
  if (!isComplete(answers)) return { success: false, error: "Le diagnostic est incomplet." };

  // Recompute on the server: the client-side score is never trusted.
  const result = computeResult(answers);
  const lines = [
    `Diagnostic IA : ${result.score}/100, niveau ${result.level.id} (${result.level.name})`,
    ...result.axes.map((a) => `- ${a.axis.label} : ${a.score}/100`),
    "",
    ...QUESTIONS.map((q) => `${q.text} → ${q.options[answers[q.id]] ?? "?"}`),
  ];

  const { error } = await getSupabase().from("leads").insert([
    {
      name,
      email,
      company: company || null,
      service: "Diagnostic IA",
      message: lines.join("\n"),
      source: "diagnostic_ia",
      status: "Nouveau",
      priority: result.score >= 45 ? "Haute" : "Moyenne",
    },
  ]);

  if (error) {
    console.error("Diagnostic lead insert error:", error);
    return { success: false, error: "Une erreur est survenue. Écrivez-nous à contact@agenfy.fr." };
  }
  return { success: true };
}
