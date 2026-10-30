import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbSchema, type Crumb } from "@/components/schemas/JsonLd";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={crumb.path} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="hover:text-foreground transition-colors">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
