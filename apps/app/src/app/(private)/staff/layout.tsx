import Link from "next/link";
import { requireStaff } from "@/lib/auth";

const NAV = [
  { href: "/staff", label: "Formations" },
  { href: "/staff/inscriptions", label: "Inscriptions" },
  { href: "/staff/sessions", label: "Sessions & émargement" },
  { href: "/staff/evaluations", label: "Évaluations" },
  { href: "/staff/reclamations", label: "Réclamations" },
  { href: "/staff/exports", label: "Exports Qualiopi" },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return (
    <>
      <nav aria-label="Espace formateur" className="no-print mb-8 -mx-1 flex gap-1 overflow-x-auto border-b pb-2">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
