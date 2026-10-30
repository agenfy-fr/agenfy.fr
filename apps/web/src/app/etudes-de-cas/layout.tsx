import type { Metadata } from "next";

// These case studies are illustrative ("Exemple / démonstration"), not client references.
// Kept out of the index so search and answer engines never quote them as proof;
// remove this once real, client-approved case studies replace them.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
