import type { Metadata } from "next";
import { BillingEditor } from "../../billing-editor";

export const metadata: Metadata = { title: "Devis" };

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillingEditor kind="quote" id={id} />;
}
