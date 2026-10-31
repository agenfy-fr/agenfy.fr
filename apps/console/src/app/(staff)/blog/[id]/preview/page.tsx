import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { MarkdownView } from "@/components/editor/markdown-view";
import { Callout } from "@/components/shared/callout";
import { StatusBadge } from "@/components/shared/status-badge";
import { BLOG_AUTHORS, BLOG_POST_COLUMNS, displayStatus, readingMinutes, type BlogPostRecord } from "@/lib/blog";
import { BLOG_STATUS_META, metaOf } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { blogImagePublicUrl } from "@/lib/server/blog";

export const metadata: Metadata = { title: "Aperçu de l'article" };

/** Staff-only preview of the saved version (drafts included): same content as the public page. */
export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase } = await requireStaffPage("/blog");
  const { data } = await supabase.from("blog_posts").select(BLOG_POST_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as unknown as BlogPostRecord;
  const cover = blogImagePublicUrl(post.cover_image_path);
  const author = BLOG_AUTHORS.find((a) => a.slug === post.author_slug)?.name ?? post.author_slug;
  const status = displayStatus(post.status, post.published_at);

  return (
    <article className="mx-auto max-w-3xl space-y-6 pb-16">
      <BreadcrumbLabel label="Aperçu" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à l&apos;édition
        </Link>
        <StatusBadge {...metaOf(BLOG_STATUS_META, status)} showDot />
      </div>
      {status !== "published" && (
        <Callout tone="info" title="Aperçu interne">
          Cet article n&apos;est pas visible sur www.agenfy.fr tant qu&apos;il n&apos;est pas publié (et que sa date de publication n&apos;est pas atteinte).
        </Callout>
      )}
      <header className="space-y-3 border-b pb-6">
        <p className="text-sm font-medium text-primary">{post.category}</p>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
        <p className="text-sm text-muted-foreground">
          {author} · {post.published_at ? formatDate(post.published_at) : "Non publié"} · {post.reading_minutes ?? readingMinutes(post.content_md)} min de lecture
        </p>
      </header>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase public URL
        <img src={cover} alt={post.cover_image_alt ?? ""} className="aspect-[1200/630] w-full rounded-xl border object-cover" />
      )}
      <MarkdownView markdown={post.content_md} />
    </article>
  );
}
