import { PageLayout } from "@/components/layouts";
import { Newsletter } from "@/components/sections";
import { buildMetadata } from "@/lib/seo";
import { AUTHORS, DEFAULT_AUTHOR } from "@/lib/site";
import { blogPosts } from "@/lib/blog-posts";
import { BlogList, type BlogListItem } from "./BlogList";

export const metadata = buildMetadata({
  title: "Blog IA, Data et Cloud pour les entreprises",
  description:
    "Guides pratiques, comparatifs et retours d'expérience sur l'IA générative, les agents IA, le RAG, la data et le cloud pour les PME et ETI.",
  path: "/blog",
  keywords: ["blog IA", "IA en entreprise", "agents IA", "RAG", "data engineering", "cloud"],
});

export default function BlogPage() {
  const posts: BlogListItem[] = [...blogPosts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      featured: p.featured,
      readTime: p.readTime,
      date: p.date,
      authorName: (AUTHORS[p.authorSlug] ?? DEFAULT_AUTHOR).name,
    }));

  return (
    <PageLayout>
      <BlogList posts={posts} />
      {/* Wired to /api/newsletter (Supabase table `newsletter_subscribers`). */}
      <Newsletter />
    </PageLayout>
  );
}
