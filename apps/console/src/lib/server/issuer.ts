import "server-only";

/**
 * Legal mentions printed on quotes and invoices. Read from server env so no
 * company identifier is hard-coded or invented: an unset value is simply not
 * printed. See apps/console/.env.example.
 */
export interface BillingIssuer {
  brand: string;
  legalName: string;
  address: string | null;
  siren: string | null;
  vatNumber: string | null;
  email: string | null;
  iban: string | null;
  paymentTerms: string | null;
}

export function getBillingIssuer(): BillingIssuer {
  const v = (key: string) => process.env[key]?.trim() || null;
  return {
    brand: "Agenfy",
    legalName: v("BILLING_LEGAL_NAME") ?? "Hasfy SAS",
    address: v("BILLING_ADDRESS"),
    siren: v("BILLING_SIREN"),
    vatNumber: v("BILLING_VAT_NUMBER"),
    email: v("BILLING_EMAIL"),
    iban: v("BILLING_IBAN"),
    paymentTerms: v("BILLING_PAYMENT_TERMS"),
  };
}
