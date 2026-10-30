/**
 * Server action plumbing: a uniform result type and error translation, so a
 * failing action never leaks SQL or stack traces to the browser.
 */
import "server-only";
import { z } from "zod";
import { ForbiddenError, UnauthorizedError } from "./auth";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

/** Business error whose message can be shown as is. */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
}

/** Translate a PostgREST error into a readable French message (no SQL leak). */
export function dbErrorMessage(error: PostgrestLikeError): string {
  switch (error.code) {
    case "23514": // check_violation, incl. RAISE from our triggers (French messages)
      return error.message && /[àéèêçô]/.test(error.message)
        ? error.message
        : "Valeur refusée par une contrainte de la base.";
    case "23503":
      return /introuvable/i.test(error.message ?? "") ? error.message! : "Référence invalide (élément lié inexistant).";
    case "23505":
      return "Cette valeur existe déjà.";
    case "23502":
      return "Champ obligatoire manquant.";
    case "22P02":
    case "22007":
      return "Format de valeur invalide.";
    case "42501":
      return "Action non autorisée pour votre rôle.";
    case "PGRST116":
      return "Élément introuvable ou inaccessible.";
    default:
      console.error("[db] unexpected error", error.code, error.message);
      return "Erreur de base de données.";
  }
}

/** Throw an ActionError from a Supabase `{ data, error }` result. */
export function check<T>(res: { data: T; error: PostgrestLikeError | null }): T {
  if (res.error) throw new ActionError(dbErrorMessage(res.error));
  return res.data;
}

export function errorToMessage(err: unknown): string {
  if (err instanceof ActionError || err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return err.message;
  }
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Données invalides.";
  }
  console.error("[action] unhandled error:", err);
  return "Une erreur inattendue est survenue.";
}

/** Run an action body and convert any thrown error into `{ ok: false, error }`. */
export async function runAction<T>(fn: () => Promise<T>, message?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message };
  } catch (err) {
    // Next.js redirect()/notFound() are implemented with thrown errors.
    if (isNextControlFlow(err)) throw err;
    return { ok: false, error: errorToMessage(err) };
  }
}

function isNextControlFlow(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"));
}

/** FormData → plain object (empty strings become undefined, repeated keys arrays). */
export function formToObject(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    const value = typeof raw === "string" ? (raw.trim() === "" ? undefined : raw) : raw;
    if (key in out) {
      const prev = out[key];
      out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      out[key] = value;
    }
  }
  return out;
}
