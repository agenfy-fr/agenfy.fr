"use client";

/**
 * WYSIWYG editor that reads and writes MARKDOWN (Tiptap v3 + @tiptap/markdown).
 *
 * Drop it inside any server-action <form>: the Markdown is submitted through a
 * hidden input named `name`. Reused for blog articles (blog_posts.content_md)
 * and meant for training lessons (lessons.content_md, rendered as Markdown).
 *
 * Images are uploaded through `uploadImage` (a server action returning the
 * public URL); without it, the image button is hidden.
 */
import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Code,
  FileCode2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ClientActionResult } from "@/components/shared/action-form";
import { toast } from "@/lib/toast";
import { normalizeLinkHref } from "./markdown-utils";
import { cn } from "@/lib/utils";

export type ImageUploader = (formData: FormData) => Promise<ClientActionResult<{ url: string }>>;

export interface MarkdownEditorProps {
  /** Name of the hidden input carrying the Markdown in the form. */
  name: string;
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  /** Server action uploading `formData.get("file")` and returning its public URL. */
  uploadImage?: ImageUploader;
  /** Max image size accepted client-side (bytes), default 4 MB. */
  maxImageBytes?: number;
  placeholder?: string;
  /** Accessible name of the editing area. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp,image/gif,image/avif";

export function MarkdownEditor({
  name,
  defaultValue = "",
  onChange,
  uploadImage,
  maxImageBytes = 4 * 1024 * 1024,
  placeholder = "Rédigez ici…",
  label = "Contenu",
  disabled = false,
  className,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(defaultValue);
  const [sourceMode, setSourceMode] = useState(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const update = useCallback((md: string) => {
    setMarkdown(md);
    onChangeRef.current?.(md);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        underline: false, // no Markdown equivalent
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["https", "http", "mailto"],
          HTMLAttributes: { rel: "noopener noreferrer", target: null },
        },
      }),
      Image.configure({ allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: defaultValue,
    contentType: "markdown",
    editorProps: {
      attributes: {
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
        class: "markdown-body min-h-[420px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => update(editor.getMarkdown()),
  });

  const toggleSource = () => {
    if (!editor) return;
    if (sourceMode) editor.commands.setContent(markdown, { contentType: "markdown", emitUpdate: true });
    setSourceMode(!sourceMode);
  };

  return (
    <div className={cn("rounded-md border border-input bg-background", disabled && "opacity-70", className)}>
      <input type="hidden" name={name} value={markdown} />
      <Toolbar
        editor={editor}
        sourceMode={sourceMode}
        onToggleSource={toggleSource}
        uploadImage={uploadImage}
        maxImageBytes={maxImageBytes}
        disabled={disabled}
      />
      {sourceMode ? (
        <Textarea
          aria-label={`${label} (Markdown)`}
          value={markdown}
          onChange={(e) => update(e.target.value)}
          disabled={disabled}
          className="min-h-[420px] rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

// --- Toolbar ---------------------------------------------------------------------------

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={cn("h-8 w-8", active && "bg-muted text-foreground")}
    >
      {children}
    </Button>
  );
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
}

function Toolbar({
  editor,
  sourceMode,
  onToggleSource,
  uploadImage,
  maxImageBytes,
  disabled,
}: {
  editor: Editor | null;
  sourceMode: boolean;
  onToggleSource: () => void;
  uploadImage?: ImageUploader;
  maxImageBytes: number;
  disabled: boolean;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            paragraph: e.isActive("paragraph"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            strike: e.isActive("strike"),
            code: e.isActive("code"),
            link: e.isActive("link"),
            bulletList: e.isActive("bulletList"),
            orderedList: e.isActive("orderedList"),
            blockquote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });
  const off = disabled || !editor || sourceMode;
  const chain = () => editor!.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Mise en forme"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-background/95 p-1 backdrop-blur"
    >
      <ToolButton label="Paragraphe" active={state?.paragraph} disabled={off} onClick={() => chain().setParagraph().run()}>
        <Pilcrow className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Titre de section (H2)" active={state?.h2} disabled={off} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Sous-titre (H3)" active={state?.h3} disabled={off} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolButton>
      <Separator />
      <ToolButton label="Gras (Ctrl+B)" active={state?.bold} disabled={off} onClick={() => chain().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Italique (Ctrl+I)" active={state?.italic} disabled={off} onClick={() => chain().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Barré" active={state?.strike} disabled={off} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Code en ligne" active={state?.code} disabled={off} onClick={() => chain().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolButton>
      <LinkButton editor={editor} active={!!state?.link} disabled={off} />
      <Separator />
      <ToolButton label="Liste à puces" active={state?.bulletList} disabled={off} onClick={() => chain().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Liste numérotée" active={state?.orderedList} disabled={off} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Citation / encadré" active={state?.blockquote} disabled={off} onClick={() => chain().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Bloc de code" active={state?.codeBlock} disabled={off} onClick={() => chain().toggleCodeBlock().run()}>
        <FileCode2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Séparateur" disabled={off} onClick={() => chain().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolButton>
      <TableMenu editor={editor} inTable={!!state?.table} disabled={off} />
      {uploadImage && <ImageButton editor={editor} uploadImage={uploadImage} maxImageBytes={maxImageBytes} disabled={off} />}
      <Separator />
      <ToolButton label="Annuler (Ctrl+Z)" disabled={off || !state?.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Rétablir (Ctrl+Maj+Z)" disabled={off || !state?.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolButton>
      <div className="ml-auto">
        <Button
          type="button"
          variant={sourceMode ? "secondary" : "ghost"}
          size="sm"
          className="h-8 text-xs"
          aria-pressed={sourceMode}
          disabled={disabled || !editor}
          onClick={onToggleSource}
        >
          Markdown
        </Button>
      </div>
    </div>
  );
}

function LinkButton({ editor, active, disabled }: { editor: Editor | null; active: boolean; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");
  const id = useId();

  const apply = () => {
    if (!editor) return;
    const url = normalizeLinkHref(href);
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({ type: "text", text: href.trim(), marks: [{ type: "link", attrs: { href: url } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o && editor) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
        setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Lien"
          aria-label="Lien"
          aria-pressed={active}
          disabled={disabled}
          className={cn("h-8 w-8", active && "bg-muted text-foreground")}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2" align="start">
        <Label htmlFor={id}>Adresse du lien</Label>
        <Input
          id={id}
          value={href}
          placeholder="https://… ou /blog/…"
          onChange={(e) => setHref(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // never submit the surrounding form
              apply();
            }
          }}
        />
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!active}
            onClick={() => {
              editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
          >
            Retirer le lien
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Appliquer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TableMenu({ editor, inTable, disabled }: { editor: Editor | null; inTable: boolean; disabled: boolean }) {
  const run = (fn: (e: Editor) => boolean) => () => {
    if (editor) fn(editor);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Tableau"
          aria-label="Tableau"
          disabled={disabled}
          className={cn("h-8 w-8", inTable && "bg-muted text-foreground")}
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          disabled={inTable}
          onSelect={run((e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
        >
          Insérer un tableau 3 × 3
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!inTable} onSelect={run((e) => e.chain().focus().addRowAfter().run())}>
          Ajouter une ligne
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!inTable} onSelect={run((e) => e.chain().focus().addColumnAfter().run())}>
          Ajouter une colonne
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!inTable} onSelect={run((e) => e.chain().focus().deleteRow().run())}>
          Supprimer la ligne
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!inTable} onSelect={run((e) => e.chain().focus().deleteColumn().run())}>
          Supprimer la colonne
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!inTable} onSelect={run((e) => e.chain().focus().deleteTable().run())}>
          Supprimer le tableau
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ImageButton({
  editor,
  uploadImage,
  maxImageBytes,
  disabled,
}: {
  editor: Editor | null;
  uploadImage: ImageUploader;
  maxImageBytes: number;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [pending, setPending] = useState(false);
  const fileId = useId();
  const altId = useId();

  const reset = () => {
    setFile(null);
    setAlt("");
  };

  const submit = async () => {
    if (!editor || !file) return;
    if (file.size > maxImageBytes) {
      toast.error(`Image trop lourde (${Math.round(maxImageBytes / 1024 / 1024)} Mo maximum).`);
      return;
    }
    if (!alt.trim()) {
      toast.error("Décrivez l'image (texte alternatif) : accessibilité et SEO.");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadImage(fd);
      if (!res.ok || !res.data) {
        toast.error(res.ok ? "Téléversement impossible." : res.error);
        return;
      }
      editor.chain().focus().setImage({ src: res.data.url, alt: alt.trim() }).run();
      setOpen(false);
      reset();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <ToolButton label="Image" disabled={disabled} onClick={() => setOpen(true)}>
        <ImagePlus className="h-4 w-4" />
      </ToolButton>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insérer une image</DialogTitle>
            <DialogDescription>PNG, JPEG, WebP, GIF ou AVIF, 4 Mo maximum. Préférez WebP, 1600 px de large.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={fileId}>Fichier</Label>
              <Input id={fileId} type="file" accept={ACCEPTED_IMAGES} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={altId}>Texte alternatif</Label>
              <Input
                id={altId}
                value={alt}
                maxLength={300}
                placeholder="Ce que montre l'image, en une phrase"
                onChange={(e) => setAlt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => void submit()} disabled={!file || pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Insérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
