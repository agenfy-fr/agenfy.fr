"use client";

import { MarkdownEditor } from "@/components/editor/markdown-editor";

/**
 * Lesson article field: the shared WYSIWYG Markdown editor (also used by the
 * blog). Contract unchanged: a form field named `name` holding Markdown,
 * rendered as Markdown by app.agenfy.fr. No image upload here (blog images
 * are public; lesson visuals go through video or external links).
 */
export function MarkdownField({
  id,
  name,
  defaultValue,
  disabled,
}: {
  id: string;
  name: string;
  defaultValue: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <div id={id}>
      <MarkdownEditor name={name} defaultValue={defaultValue} disabled={disabled} label="Contenu de la leçon" />
    </div>
  );
}
