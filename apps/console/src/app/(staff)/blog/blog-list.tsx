"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Newspaper, Star } from "lucide-react";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatusBadge } from "@/components/shared/status-badge";
import { displayStatus, type BlogDisplayStatus } from "@/lib/blog";
import { BLOG_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";

export interface BlogListRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  published_at: string | null;
  featured: boolean;
  noindex: boolean;
  updated_at: string;
}

type Filter = "all" | BlogDisplayStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillons" },
  { value: "scheduled", label: "Programmés" },
  { value: "published", label: "Publiés" },
  { value: "archived", label: "Archivés" },
];

export function BlogList({ rows, now }: { rows: BlogListRow[]; now: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const withStatus = useMemo(
    () => rows.map((r) => ({ ...r, display: displayStatus(r.status, r.published_at, new Date(now)) })),
    [rows, now],
  );
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: withStatus.length, draft: 0, scheduled: 0, published: 0, archived: 0 };
    for (const r of withStatus) c[r.display]++;
    return c;
  }, [withStatus]);
  const visible = filter === "all" ? withStatus : withStatus.filter((r) => r.display === filter);

  return (
    <div className="space-y-4">
      <SegmentedFilter
        label="Filtrer par statut"
        value={filter}
        onChange={setFilter}
        options={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-6 w-6" />}
          title="Aucun article"
          description={filter === "all" ? "Créez votre premier article : il reste en brouillon jusqu'à sa publication." : "Aucun article avec ce statut."}
        />
      ) : (
        <DataTable label="Articles du blog">
          <DataTableHead>
            <tr>
              <Th>Article</Th>
              <Th>Statut</Th>
              <Th>Catégorie</Th>
              <Th>Publication</Th>
              <Th>Modifié le</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {visible.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <Link href={`/blog/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">/blog/{r.slug}</span>
                    {r.featured && <Star className="h-3 w-3 shrink-0 fill-current" aria-label="À la une" />}
                    {r.noindex && <span>noindex</span>}
                  </div>
                </Td>
                <Td>
                  <StatusBadge size="sm" {...metaOf(BLOG_STATUS_META, r.display)} />
                </Td>
                <Td muted>{r.category}</Td>
                <Td muted>{r.published_at ? formatDate(r.published_at) : "—"}</Td>
                <Td muted>{formatDate(r.updated_at)}</Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  );
}
