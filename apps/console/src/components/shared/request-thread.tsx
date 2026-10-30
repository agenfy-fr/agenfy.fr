import { Lock } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ThreadEntry {
  id: string;
  author: string;
  fromAgenfy: boolean;
  body: string;
  internal: boolean;
  created_at: string;
}

/** Conversation of a client request (initial message + replies). */
export function RequestThread({ entries }: { entries: ThreadEntry[] }) {
  return (
    <ol className="space-y-3">
      {entries.map((e) => (
        <li
          key={e.id}
          className={cn(
            "rounded-lg border p-3 text-sm",
            e.internal ? "border-dashed border-amber-500/50 bg-amber-500/5" : e.fromAgenfy ? "bg-primary/5" : "bg-background",
          )}
        >
          <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{e.author}</span>
            <span>{formatDateTime(e.created_at)}</span>
            {e.internal && (
              <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
                <Lock className="h-3 w-3" aria-hidden="true" /> Note interne
              </span>
            )}
          </p>
          <p className="whitespace-pre-wrap">{e.body}</p>
        </li>
      ))}
    </ol>
  );
}
