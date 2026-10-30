/**
 * Certificate numbers: AGF-YYYY-NNNNN-C
 *   YYYY  issue year (Europe/Paris)
 *   NNNNN sequence within the year (certificate_counters table)
 *   C     Luhn check digit over the 9 digits YYYYNNNNN (catches typos when
 *         a third party types the number on /verify)
 * Generation happens in public.next_certificate_number() (migration 0202);
 * this module mirrors it and validates user input.
 */

export const CERTIFICATE_PATTERN = /^AGF-(\d{4})-(\d{5})-(\d)$/;

export function luhnCheckDigit(digits: string): number {
  if (!/^\d+$/.test(digits)) throw new Error("digits_only");
  let sum = 0;
  let double = true; // rightmost payload digit is doubled
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
}

export function formatCertificateNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) throw new Error("invalid_year");
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 99999) throw new Error("invalid_sequence");
  const seq = String(sequence).padStart(5, "0");
  return `AGF-${year}-${seq}-${luhnCheckDigit(`${year}${seq}`)}`;
}

/** Uppercases, trims and removes inner spaces, so "agf 2026 00001 8" style input still matches. */
export function normalizeCertificateNumber(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function parseCertificateNumber(
  input: string,
): { year: number; sequence: number; checkDigit: number } | null {
  const m = CERTIFICATE_PATTERN.exec(normalizeCertificateNumber(input));
  if (!m) return null;
  const [, year, seq, check] = m;
  if (luhnCheckDigit(`${year}${seq}`) !== Number(check)) return null;
  const sequence = Number(seq);
  if (sequence < 1) return null;
  return { year: Number(year), sequence, checkDigit: Number(check) };
}

export function isValidCertificateNumber(input: string): boolean {
  return parseCertificateNumber(input) !== null;
}
