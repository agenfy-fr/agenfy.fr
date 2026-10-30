/**
 * Billing math — TypeScript mirror of the 0101 triggers, used for live
 * previews in the editor and covered by unit tests. The database recomputes
 * every amount itself: these values are never sent as authoritative.
 */

export interface BillingLineInput {
  quantity: number;
  unit_price_cents: number;
}

export interface BillingTotals {
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
}

/**
 * round(quantity * unit_price_cents) with exact decimal arithmetic, like
 * PostgreSQL numeric(12,2) (half away from zero). Floats would give
 * 0.29 * 50 = 14.4999… → 14 instead of 15.
 */
export function lineTotalCents(line: BillingLineInput): number {
  const hundredths = Math.round(line.quantity * 100); // quantity has 2 decimals in the DB
  const product = hundredths * line.unit_price_cents; // = total * 100, exact integer
  const sign = product < 0 ? -1 : 1;
  return sign * Math.floor((Math.abs(product) + 50) / 100);
}

export function computeTotals(lines: readonly BillingLineInput[], vatRate: number): BillingTotals {
  const subtotal = lines.reduce((sum, l) => sum + lineTotalCents(l), 0);
  const vat = Math.round((subtotal * vatRate) / 100);
  return { subtotal_cents: subtotal, vat_cents: vat, total_cents: subtotal + vat };
}

/** Number format assigned by public.next_billing_number(): DEV-2026-0001 / FAC-2026-0001. */
export const BILLING_NUMBER_RE = /^(DEV|FAC)-\d{4}-\d{4,}$/;
