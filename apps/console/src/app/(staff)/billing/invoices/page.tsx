import type { Metadata } from "next";
import { BillingList } from "../billing-list";

export const metadata: Metadata = { title: "Factures" };

export default function InvoicesPage() {
  return <BillingList kind="invoice" />;
}
