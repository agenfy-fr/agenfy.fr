import type { Metadata } from "next";
import { BillingList } from "../billing-list";

export const metadata: Metadata = { title: "Devis" };

export default function QuotesPage() {
  return <BillingList kind="quote" />;
}
