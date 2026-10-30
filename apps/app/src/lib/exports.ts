import type { SupabaseClient } from "@supabase/supabase-js";
import type { CsvValue } from "./csv";
import type { Person } from "./types";

export const EXPORTS = {
  enrollments: {
    title: "Inscriptions et progression",
    description: "Apprenant, formation, organisation, groupe, statut, progression, dates de début et de fin.",
    indicators: "9, 11, 12",
  },
  attendance: {
    title: "Émargements",
    description: "Présence par demi-journée, horodatage serveur, IP, relevé formateur.",
    indicators: "11, 12 (assiduité)",
  },
  evaluations: {
    title: "Évaluations (positionnement, à chaud, à froid)",
    description: "Réponses détaillées, note globale, commentaires, version du questionnaire.",
    indicators: "8, 11, 30",
  },
  quiz_attempts: {
    title: "Résultats des quiz",
    description: "Chaque tentative : score, réussite, date. Évaluation des acquis.",
    indicators: "11",
  },
  certificates: {
    title: "Attestations délivrées",
    description: "Numéro unique, bénéficiaire, formation, dates, durée, révocation.",
    indicators: "11",
  },
  complaints: {
    title: "Registre des réclamations",
    description: "Réclamations, réponses, actions correctives, dates de traitement.",
    indicators: "31, 32",
  },
} as const;

export type ExportKind = keyof typeof EXPORTS;

export interface ExportTable {
  headers: string[];
  rows: CsvValue[][];
}

type Db = SupabaseClient;

async function directory(db: Db) {
  const { data } = await db.rpc("training_people");
  return new Map(((data ?? []) as Person[]).map((p) => [p.user_id, p]));
}

const one = <T,>(v: unknown) => v as T | null;

export async function buildExport(
  db: Db,
  kind: ExportKind,
  filters: { session?: string | null; kind?: string | null } = {},
): Promise<ExportTable> {
  const people = await directory(db);
  const who = (id: string | null) => {
    const p = id ? people.get(id) : undefined;
    return [p?.full_name ?? "", p?.email ?? ""];
  };

  switch (kind) {
    case "enrollments": {
      const { data } = await db
        .from("enrollments")
        .select("*, courses(title), organizations(name), cohorts(name)")
        .order("created_at");
      return {
        headers: ["id", "apprenant", "email", "formation", "organisation", "groupe", "statut", "progression_%", "inscrit_le", "debut", "fin"],
        rows: (data ?? []).map((r) => [
          r.id,
          ...who(r.user_id),
          one<{ title: string }>(r.courses)?.title,
          one<{ name: string }>(r.organizations)?.name,
          one<{ name: string }>(r.cohorts)?.name,
          r.status,
          r.progress_percent,
          r.created_at,
          r.started_at,
          r.completed_at,
        ]),
      };
    }
    case "attendance": {
      let q = db
        .from("attendance")
        .select("id, session_id, user_id, status, signed_at, signer_ip, signer_user_agent, recorded_by, note, updated_at, sessions(starts_at, ends_at, half_day, cohorts(name, courses(title)))")
        .order("created_at");
      if (filters.session) q = q.eq("session_id", filters.session);
      const { data } = await q;
      return {
        headers: ["id", "formation", "groupe", "debut_session", "fin_session", "demi_journee", "apprenant", "email", "statut", "signe_le", "ip", "user_agent", "releve_par", "note", "mis_a_jour"],
        rows: (data ?? []).map((r) => {
          const s = one<{ starts_at: string; ends_at: string; half_day: string; cohorts: { name: string; courses: { title: string } | null } | null }>(r.sessions);
          return [
            r.id,
            s?.cohorts?.courses?.title,
            s?.cohorts?.name,
            s?.starts_at,
            s?.ends_at,
            s?.half_day,
            ...who(r.user_id),
            r.status,
            r.signed_at,
            r.signer_ip,
            r.signer_user_agent,
            r.recorded_by ? who(r.recorded_by)[1] : "",
            r.note,
            r.updated_at,
          ];
        }),
      };
    }
    case "evaluations": {
      let q = db.from("evaluations").select("*, courses(title)").order("submitted_at");
      if (filters.kind) q = q.eq("kind", filters.kind);
      const { data } = await q;
      return {
        headers: ["id", "type", "version", "formation", "apprenant", "email", "note_globale", "commentaire", "reponses_json", "soumis_le"],
        rows: (data ?? []).map((r) => [
          r.id,
          r.kind,
          r.form_version,
          one<{ title: string }>(r.courses)?.title,
          ...who(r.user_id),
          r.overall_rating,
          r.comment,
          JSON.stringify(r.answers),
          r.submitted_at,
        ]),
      };
    }
    case "quiz_attempts": {
      const { data } = await db
        .from("quiz_attempts")
        .select("id, user_id, score, passed, correct_count, total, created_at, quizzes(title, courses(title))")
        .order("created_at");
      return {
        headers: ["id", "formation", "quiz", "apprenant", "email", "score_%", "bonnes_reponses", "total", "valide", "date"],
        rows: (data ?? []).map((r) => {
          const q = one<{ title: string; courses: { title: string } | null }>(r.quizzes);
          return [r.id, q?.courses?.title, q?.title, ...who(r.user_id), r.score, r.correct_count, r.total, r.passed ? "oui" : "non", r.created_at];
        }),
      };
    }
    case "certificates": {
      const { data } = await db.from("certificates").select("*").order("issued_at");
      return {
        headers: ["numero", "beneficiaire", "email", "formation", "duree_h", "modalite", "debut", "fin", "delivree_le", "revoquee_le", "motif_revocation"],
        rows: (data ?? []).map((r) => [
          r.number,
          r.learner_name,
          who(r.user_id)[1],
          r.course_title,
          r.duration_hours,
          r.modality,
          r.training_start,
          r.training_end,
          r.issued_at,
          r.revoked_at,
          r.revoked_reason,
        ]),
      };
    }
    case "complaints": {
      const { data } = await db.from("complaints").select("*, courses(title)").order("created_at");
      return {
        headers: ["id", "date", "canal", "auteur", "email", "formation", "objet", "description", "statut", "reponse", "action_corrective", "traitee_par", "resolue_le"],
        rows: (data ?? []).map((r) => [
          r.id,
          r.created_at,
          r.channel,
          ...who(r.user_id),
          one<{ title: string }>(r.courses)?.title,
          r.subject,
          r.description,
          r.status,
          r.response,
          r.corrective_action,
          r.handled_by ? who(r.handled_by)[1] : "",
          r.resolved_at,
        ]),
      };
    }
  }
}
