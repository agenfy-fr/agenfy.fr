"use client";

import { useId, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Eye, ImagePlus, Loader2, Trash2, TriangleAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton, ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Field } from "@/components/shared/field";
import { StatusBadge } from "@/components/shared/status-badge";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import {
  BLOG_AUTHORS,
  BLOG_CATEGORIES,
  MAX_BLOG_IMAGE_BYTES,
  PUBLIC_SITE_URL,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  analyzeSeo,
  blogSlug,
  displayStatus,
  effectiveSeo,
  isoToParisLocal,
  readingMinutes,
  seoScore,
  snippetBreadcrumb,
  truncateForSnippet,
  type BlogPostRecord,
  type SeoCheck,
} from "@/lib/blog";
import { BLOG_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { deleteBlogPost, updateBlogPost, uploadBlogImage } from "./actions";

export function BlogPostEditor({
  post,
  coverUrl,
  ogUrl,
  canEdit,
  now,
}: {
  post: BlogPostRecord;
  coverUrl: string | null;
  ogUrl: string | null;
  canEdit: boolean;
  /** Server time (ISO), so "scheduled" renders the same on server and client. */
  now: string;
}) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content_md);
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post.seo_description ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post.focus_keyword ?? "");
  const [coverPath, setCoverPath] = useState(post.cover_image_path ?? "");
  const [coverAlt, setCoverAlt] = useState(post.cover_image_alt ?? "");

  const status = displayStatus(post.status, post.published_at, new Date(now));
  const isLive = status === "published";
  const action = updateBlogPost.bind(null, post.id);

  const checks = useMemo(
    () =>
      analyzeSeo({
        title,
        slug,
        excerpt,
        contentMd: content,
        seoTitle,
        seoDescription,
        focusKeyword,
        coverImagePath: coverPath,
        coverImageAlt: coverAlt,
      }),
    [title, slug, excerpt, content, seoTitle, seoDescription, focusKeyword, coverPath, coverAlt],
  );
  const autoMinutes = readingMinutes(content);

  return (
    <ActionForm action={action} hideSubmit className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <fieldset disabled={!canEdit} className="min-w-0 space-y-4">
        <legend className="sr-only">Contenu de l&apos;article</legend>
        <Field label="Titre (H1)" htmlFor="blog-title">
          <Input
            id="blog-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="h-11 text-lg font-semibold"
          />
        </Field>
        <Field
          label="Chapô"
          htmlFor="blog-excerpt"
          hint={<Counter value={excerpt.length} max={500} soft={SEO_DESCRIPTION_MAX} label="Affiché sous le titre et dans la liste des articles ; sert de méta-description par défaut." />}
        >
          <Textarea id="blog-excerpt" name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} maxLength={500} />
        </Field>
        <div className="space-y-1.5">
          <Label id="blog-content-label">Article</Label>
          <MarkdownEditor
            name="content_md"
            label="Article"
            defaultValue={post.content_md}
            onChange={setContent}
            uploadImage={canEdit ? uploadBlogImage : undefined}
            maxImageBytes={MAX_BLOG_IMAGE_BYTES}
            placeholder="Commencez par une introduction qui contient votre mot-clé principal…"
            disabled={!canEdit}
          />
          <p className="text-xs text-muted-foreground">
            Enregistré en Markdown. H2 pour les sections, H3 pour les sous-sections : le titre de l&apos;article est déjà le H1.
          </p>
        </div>
      </fieldset>

      <div className="min-w-0 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Publication</CardTitle>
              <StatusBadge {...metaOf(BLOG_STATUS_META, status)} showDot />
            </div>
            {post.published_at && (
              <CardDescription>
                {status === "scheduled" ? "Mise en ligne prévue le " : "Date de publication : "}
                {formatDate(post.published_at)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <fieldset disabled={!canEdit} className="space-y-4">
              <legend className="sr-only">Paramètres de publication</legend>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Statut" htmlFor="blog-status">
                  <NativeSelect id="blog-status" name="status" defaultValue={post.status}>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </NativeSelect>
                </Field>
                <Field label="Catégorie" htmlFor="blog-category">
                  <NativeSelect id="blog-category" name="category" defaultValue={post.category}>
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
              <Field
                label="Date de publication (heure de Paris)"
                htmlFor="blog-published-at"
                hint="Vide = maintenant, au moment de publier. Une date future programme la mise en ligne."
              >
                <Input id="blog-published-at" name="published_at" type="datetime-local" defaultValue={isoToParisLocal(post.published_at)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Auteur" htmlFor="blog-author">
                  <NativeSelect id="blog-author" name="author_slug" defaultValue={post.author_slug}>
                    {BLOG_AUTHORS.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Lecture (min)" htmlFor="blog-reading">
                  <Input
                    id="blog-reading"
                    name="reading_minutes"
                    type="number"
                    min={1}
                    max={240}
                    defaultValue={post.reading_minutes ?? ""}
                    placeholder={`Auto : ${autoMinutes}`}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="blog-featured" name="featured" defaultChecked={post.featured} />
                <Label htmlFor="blog-featured" className="font-normal">
                  Mettre « À la une »
                </Label>
              </div>
            </fieldset>

            {canEdit && (
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <SubmitButton name="intent" value="save" variant="outline">
                  Enregistrer
                </SubmitButton>
                {post.status === "published" ? (
                  <SubmitButton name="intent" value="unpublish" variant="outline">
                    Dépublier
                  </SubmitButton>
                ) : (
                  <SubmitButton name="intent" value="publish">
                    Publier
                  </SubmitButton>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href={`/blog/${post.id}/preview`} target="_blank" rel="noopener">
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                  Aperçu
                </a>
              </Button>
              {isLive && (
                <Button asChild variant="ghost" size="sm">
                  <a href={`${PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                    Voir sur le site
                  </a>
                </Button>
              )}
              {canEdit && (
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  action={() => deleteBlogPost(post.id)}
                  confirm="Supprimer définitivement cet article ?"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Supprimer
                </ActionButton>
              )}
            </div>
            <p className="text-xs text-muted-foreground">L&apos;aperçu affiche la dernière version enregistrée.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Image de couverture</CardTitle>
            <CardDescription>Affichée en tête d&apos;article et utilisée pour le partage si aucune image Open Graph n&apos;est définie. 1200 × 630 px conseillé.</CardDescription>
          </CardHeader>
          <CardContent>
            <fieldset disabled={!canEdit} className="space-y-3">
              <legend className="sr-only">Image de couverture</legend>
              <BlogImageField name="cover_image_path" label="Image de couverture" defaultPath={post.cover_image_path} defaultUrl={coverUrl} onChange={setCoverPath} canEdit={canEdit} />
              <Field label="Texte alternatif" htmlFor="blog-cover-alt">
                <Input id="blog-cover-alt" name="cover_image_alt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={300} />
              </Field>
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">SEO</CardTitle>
              <ScoreBadge score={seoScore(checks)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SnippetPreview
              title={effectiveSeo({ title, excerpt, seoTitle, seoDescription }).title}
              description={effectiveSeo({ title, excerpt, seoTitle, seoDescription }).description}
              slug={slug}
              date={post.published_at}
            />
            <fieldset disabled={!canEdit} className="space-y-4">
              <legend className="sr-only">Référencement</legend>
              <Field label="Mot-clé principal" htmlFor="blog-keyword" hint="L'expression que vos lecteurs tapent dans Google.">
                <Input id="blog-keyword" name="focus_keyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} maxLength={100} placeholder="agents IA PME" />
              </Field>
              <Field
                label="URL (slug)"
                htmlFor="blog-slug"
                hint={
                  isLive ? (
                    <span className="text-amber-700 dark:text-amber-400">Article en ligne : changer l&apos;URL casse les liens existants.</span>
                  ) : (
                    `${PUBLIC_SITE_URL.replace("https://", "")}/blog/${slug}`
                  )
                }
              >
                <div className="flex gap-2">
                  <Input
                    id="blog-slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    required
                    maxLength={120}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  />
                  <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => setSlug(blogSlug(focusKeyword || title))}>
                    Générer
                  </Button>
                </div>
              </Field>
              <Field
                label="Titre SEO"
                htmlFor="blog-seo-title"
                hint={<Counter value={(seoTitle || title).length} max={120} soft={SEO_TITLE_MAX - " | Agenfy".length} label="Vide = titre de l'article. « | Agenfy » est ajouté automatiquement." />}
              >
                <Input id="blog-seo-title" name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={120} placeholder={title} />
              </Field>
              <Field
                label="Méta-description"
                htmlFor="blog-seo-description"
                hint={<Counter value={(seoDescription || excerpt).length} max={320} soft={SEO_DESCRIPTION_MAX} label="Vide = chapô." />}
              >
                <Textarea
                  id="blog-seo-description"
                  name="seo_description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  maxLength={320}
                  placeholder={excerpt}
                />
              </Field>
              <SeoChecklist checks={checks} />
              <details className="rounded-md border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Options avancées</summary>
                <div className="mt-3 space-y-4">
                  <Field label="URL canonique" htmlFor="blog-canonical" hint="Uniquement si l'article est d'abord paru ailleurs. Vide = l'article lui-même.">
                    <Input id="blog-canonical" name="canonical_url" type="url" defaultValue={post.canonical_url ?? ""} placeholder="https://…" />
                  </Field>
                  <div className="flex items-center gap-2">
                    <Checkbox id="blog-noindex" name="noindex" defaultChecked={post.noindex} />
                    <Label htmlFor="blog-noindex" className="font-normal">
                      Ne pas indexer (noindex, hors sitemap)
                    </Label>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">Image de partage (Open Graph)</p>
                    <p className="text-xs text-muted-foreground">Vide = image de couverture. 1200 × 630 px.</p>
                    <BlogImageField name="og_image_path" label="Image Open Graph" defaultPath={post.og_image_path} defaultUrl={ogUrl} canEdit={canEdit} />
                  </div>
                </div>
              </details>
            </fieldset>
          </CardContent>
        </Card>
      </div>
    </ActionForm>
  );
}

// --- Pieces -----------------------------------------------------------------------------

function Counter({ value, max, soft, label }: { value: number; max: number; soft: number; label: string }) {
  return (
    <span className="flex justify-between gap-2">
      <span>{label}</span>
      <span className={cn("shrink-0 tabular-nums", value > soft && "font-medium text-amber-700 dark:text-amber-400")} aria-label={`${value} caractères sur ${soft} conseillés`}>
        {value}/{soft}
        {max !== soft && <span className="sr-only"> (maximum {max})</span>}
      </span>
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? "success" : score >= 50 ? "caution" : "destructive";
  return <StatusBadge variant={variant} label={`Score ${score}/100`} />;
}

function SnippetPreview({ title, description, slug, date }: { title: string; description: string; slug: string; date: string | null }) {
  const fullTitle = title ? `${title} | Agenfy` : "Titre de l'article";
  return (
    <figure className="rounded-md border bg-background p-3" aria-label="Aperçu dans Google">
      <figcaption className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Aperçu Google</figcaption>
      <p className="truncate text-xs text-muted-foreground">{snippetBreadcrumb(slug)}</p>
      <p className="mt-0.5 text-[1.05rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{truncateForSnippet(fullTitle, SEO_TITLE_MAX)}</p>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">
        {date && <span>{formatDate(date)} — </span>}
        {description ? truncateForSnippet(description, SEO_DESCRIPTION_MAX) : "Ajoutez une méta-description ou un chapô."}
      </p>
    </figure>
  );
}

function SeoChecklist({ checks }: { checks: SeoCheck[] }) {
  return (
    <ul className="space-y-1.5 text-sm" aria-label="Vérifications SEO">
      {checks.map((c) => (
        <li key={c.id} className="flex items-start gap-2">
          {c.level === "good" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="OK" />
          ) : c.level === "warn" ? (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-label="À améliorer" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-label="Problème" />
          )}
          <span className={c.level === "good" ? "text-muted-foreground" : undefined}>{c.message}</span>
        </li>
      ))}
    </ul>
  );
}

/** Image stored in the `blog-images` bucket; the form receives its object path. */
function BlogImageField({
  name,
  label,
  defaultPath,
  defaultUrl,
  onChange,
  canEdit,
}: {
  name: string;
  label: string;
  defaultPath: string | null;
  defaultUrl: string | null;
  onChange?: (path: string) => void;
  canEdit: boolean;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [url, setUrl] = useState(defaultUrl);
  const [pending, setPending] = useState(false);
  const inputId = useId();

  const set = (p: string, u: string | null) => {
    setPath(p);
    setUrl(u);
    onChange?.(p);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BLOG_IMAGE_BYTES) {
      toast.error("Image trop lourde (4 Mo maximum).");
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadBlogImage(fd);
      if (res.ok && res.data) set(res.data.path, res.data.url);
      else toast.error(res.ok ? "Téléversement impossible." : res.error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={path} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase public URL, preview only
        <img src={url} alt="" className="aspect-[1200/630] w-full rounded-md border object-cover" />
      ) : (
        <div className="flex aspect-[1200/630] w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Aucune image
        </div>
      )}
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild disabled={pending}>
            <label htmlFor={inputId} className="cursor-pointer">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />}
              {path ? "Remplacer" : "Téléverser"}
            </label>
          </Button>
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="sr-only"
            aria-label={label}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {path && (
            <Button type="button" variant="ghost" size="sm" onClick={() => set("", null)}>
              Retirer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
