import type { Metadata } from "next";
import { BillingEditor } from "../../billing-editor";

export const metadata: Metadata = { title: "Facture" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillingEditor kind="invoice" id={id} />;
}
