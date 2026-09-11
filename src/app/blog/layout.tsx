import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Data, IA, Cloud, Conseil : nos experts partagent leurs retours d'expérience, comparatifs et guides pratiques pour votre transformation technologique.",
  alternates: {
    canonical: "https://www.agenfy.fr/blog",
  },
  openGraph: {
    title: "Blog | Agenfy",
    description:
      "Insights tech sur la Data, l'IA, le Cloud et la transformation digitale.",
    url: "https://www.agenfy.fr/blog",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
