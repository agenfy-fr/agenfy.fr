/**
 * Two-factor authentication (TOTP) and password policy, shared by the proxy,
 * the session helpers and the account / 2FA pages. Pure: unit-tested.
 *
 * Rules:
 *  - staff: 2FA mandatory (enforced in the database by 0004_staff_mfa.sql,
 *    staff privileges require an aal2 session);
 *  - anyone who enrolled a factor must pass it at every sign-in.
 */

export type AssuranceLevel = string | null | undefined;

/** What the user must do before reaching a protected page. */
export type MfaStep = "ok" | "challenge" | "enroll";

export function mfaStep(input: {
  currentLevel: AssuranceLevel;
  nextLevel: AssuranceLevel;
  /** Active staff member without an aal2 session (RPC staff_mfa_pending). */
  staffPending?: boolean;
}): MfaStep {
  if (input.currentLevel === "aal2") return "ok";
  // A verified factor exists but this session has not used it yet.
  if (input.nextLevel === "aal2") return "challenge";
  if (input.staffPending) return "enroll";
  return "ok";
}

export const TOTP_CODE_PATTERN = /^\d{6}$/;

/** Accepts "123 456" / "123-456" as typed or pasted from an authenticator app. */
export function normalizeTotpCode(raw: unknown): string | null {
  const code = String(raw ?? "").replace(/[\s-]/g, "");
  return TOTP_CODE_PATTERN.test(code) ? code : null;
}

export const PASSWORD_MIN_LENGTH = 12;
/** bcrypt (Supabase Auth) ignores everything after 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_HINT = "12 caractères minimum, avec au moins 3 types parmi : minuscules, majuscules, chiffres, symboles.";

/** Returns an error message in French, or null when the password is acceptable. */
export function passwordProblem(password: string, email?: string | null): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `${PASSWORD_MIN_LENGTH} caractères minimum.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH) return `${PASSWORD_MAX_LENGTH} caractères maximum.`;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) return "Mélangez au moins 3 types : minuscules, majuscules, chiffres, symboles.";
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
    return "Le mot de passe ne doit pas contenir votre adresse e-mail.";
  }
  if (/(.)\1{3,}/.test(password)) return "Évitez les caractères répétés (ex. « aaaa »).";
  return null;
}
