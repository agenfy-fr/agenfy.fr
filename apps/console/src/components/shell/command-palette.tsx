"use client";

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, FolderKanban, ListTodo, Magnet, Search } from "lucide-react";
import type { NavGroup } from "@/lib/navigation";
import type { SearchResult, SearchResultType } from "@/lib/search";

const RESULT_GROUPS: { type: SearchResultType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "client", label: "Clients", icon: Building2 },
  { type: "project", label: "Projets", icon: FolderKanban },
  { type: "task", label: "Tâches", icon: ListTodo },
  { type: "lead", label: "Leads", icon: Magnet },
];

export interface CommandPaletteHandle {
  open: () => void;
}

/** `groups`: staff navigation already filtered for the current role. */
export const CommandPalette = forwardRef<CommandPaletteHandle, { groups: NavGroup[] }>(function CommandPalette({ groups }, ref) {
  const ALL_PAGES = groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label })));
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

  // Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search through /api/search: role filtering happens server-side (RLS +
  // ROLE_ACCESS), never in this client component.
  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) { setResults([]); return; }
      const { results } = (await res.json()) as { results: SearchResult[] };
      setResults(results);
    } catch { setResults([]); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  // Filter pages by query
  const filteredPages = query.length >= 1
    ? ALL_PAGES.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : ALL_PAGES;

  // Grouped filtered pages
  const filteredGroups = groups.map((g) => ({
    ...g,
    items: g.items.filter((item) => filteredPages.some((fp) => fp.href === item.href)),
  })).filter((g) => g.items.length > 0);

  // All navigable items for keyboard
  // Same order as rendered: pages, then results grouped by type.
  const orderedResults = RESULT_GROUPS.flatMap((g) => results.filter((r) => r.type === g.type));
  const allItems: Array<{ title: string; href: string }> = [
    ...filteredGroups.flatMap((g) => g.items),
    ...orderedResults.map((r) => ({ title: r.title, href: r.href })),
  ];

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const navigate = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && allItems[selectedIndex]) { navigate(allItems[selectedIndex].href); }
  };

  let flatIdx = 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[560px] rounded-2xl shadow-2xl border-0 gap-0">
        <DialogTitle className="sr-only">Recherche</DialogTitle>
        <DialogDescription className="sr-only">
          Recherchez une page, un client, un projet, une tâche ou un lead. Utilisez les flèches pour naviguer et Entrée pour ouvrir.
        </DialogDescription>
        <div className="flex items-center border-b px-4">
          <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une page, un client, un projet..."
            aria-label="Rechercher une page, un client, un projet, une tâche ou un lead"
            className="h-14 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {/* Page groups - Spotlight style grid */}
            {filteredGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {group.items.map((item) => {
                    const myIdx = flatIdx++;
                    const isSelected = myIdx === selectedIndex;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(myIdx)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors ${
                          isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs font-medium leading-tight">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Search results */}
            {results.length > 0 && (
              <div className="border-t pt-2 mt-1">
                {RESULT_GROUPS.map(({ type, label, icon: Icon }) => {
                  const items = results.filter((r) => r.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className="mb-2">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                      {items.map((r) => {
                        const myIdx = flatIdx++;
                        const isSelected = myIdx === selectedIndex;
                        return (
                          <button key={r.href} type="button" onClick={() => navigate(r.href)} onMouseEnter={() => setSelectedIndex(myIdx)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">{r.title}</span>
                            {r.subtitle && <span className="ml-auto max-w-[200px] truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {query.length >= 2 && filteredPages.length === 0 && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-30" />
                Aucun résultat pour &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
