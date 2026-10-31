"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "./markdown-view";

/**
 * Markdown editor for lesson articles: textarea + live preview.
 *
 * Deliberately isolated: the reusable WYSIWYG Markdown editor
 * (src/components/editor/) will replace this component. Keep the contract:
 * an uncontrolled form field named `name` (e.g. `content_md`) holding Markdown.
 */
export function MarkdownField({
  id,
  name,
  defaultValue,
  rows = 18,
  disabled,
}: {
  id: string;
  name: string;
  defaultValue: string;
  rows?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        disabled={disabled}
        spellCheck
        className="font-mono text-xs leading-relaxed"
      />
      <div className="min-h-32 overflow-auto rounded-md border bg-card p-4" aria-label="Aperçu" role="region">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Aperçu</p>
        {value.trim() ? <MarkdownView>{value}</MarkdownView> : <p className="text-sm text-muted-foreground">Rien à afficher.</p>}
      </div>
    </div>
  );
}
