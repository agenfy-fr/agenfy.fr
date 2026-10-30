import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Calendar, RefreshCw } from "lucide-react";
import { Header, Footer } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { JsonLd, articleSchema } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { AUTHORS, DEFAULT_AUTHOR } from "@/lib/site";
import { getOffer } from "@/lib/offers";
import { formatDateFr } from "@/lib/dates";
import { blogPosts, getBlogPostBySlug, getRelatedPosts, CATEGORY_OFFER } from "@/lib/blog-posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  const author = AUTHORS[post.authorSlug] ?? DEFAULT_AUTHOR;
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    authors: [author.name],
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const author = AUTHORS[post.authorSlug] ?? DEFAULT_AUTHOR;
  const authorPath = `/auteurs/${author.slug}`;
  const offer = getOffer(CATEGORY_OFFER[post.category]);
  const related = getRelatedPosts(post, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.excerpt,
          path,
          datePublished: post.date,
          dateModified: post.updated,
          author,
          section: post.category,
        })}
      />
      <Header />
      <main className="pt-20">
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <BackgroundBeams />

          <Reveal className="relative max-w-4xl mx-auto px-6 lg:px-8">
            <Breadcrumbs
              crumbs={[
                { name: "Blog", path: "/blog" },
                { name: post.title, path },
              ]}
            />

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge className="rounded-full">{post.category}</Badge>
              {post.featured && (
                <Badge variant="outline" className="rounded-full border-accent text-accent">
                  À la une
                </Badge>
              )}
            </div>

            <h1 className="text-h1 font-bold text-foreground mb-6">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground pb-8 border-b border-border/50">
              <Link href={authorPath} className="flex items-center gap-2 hover:text-foreground transition-colors" rel="author">
                <Image
                  src={author.photo}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-foreground">{author.name}</span>
              </Link>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden />
                Publié le <time dateTime={post.date}>{formatDateFr(post.date)}</time>
              </span>
              {post.updated && post.updated !== post.date && (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" aria-hidden />
                  Mis à jour le <time dateTime={post.updated}>{formatDateFr(post.updated)}</time>
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" aria-hidden />
                {post.readTime} de lecture
              </span>
            </div>
          </Reveal>
        </section>

        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <article className="prose-custom">{post.content}</article>

            {/* Author box */}
            <aside
              aria-label="À propos de l'auteur"
              className="mt-16 flex flex-col sm:flex-row gap-5 rounded-2xl border border-border/60 bg-card/50 p-6"
            >
              <Link href={authorPath} className="shrink-0" aria-hidden tabIndex={-1}>
                <Image
                  src={author.photo}
                  alt=""
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </Link>
              <div>
                <p className="text-sm text-muted-foreground">Écrit par</p>
                <Link href={authorPath} rel="author" className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {author.name}
                </Link>
                <p className="text-sm text-muted-foreground mb-2">{author.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* Pour aller plus loin */}
        <section className="py-16 bg-secondary/20" aria-labelledby="plus-loin">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 id="plus-loin" className="text-h2 font-bold text-foreground mb-8">
              Pour aller plus loin
            </h2>

            <Link
              href={offer.path}
              className="group block rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-10 hover:border-primary/60 transition-colors"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Notre offre</p>
              <p className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
                {offer.name}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </p>
              <p className="text-muted-foreground">{offer.tagline}</p>
            </Link>

            {related.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-4">À lire aussi</h3>
                <ul className="grid md:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="group block h-full rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition-colors"
                      >
                        <Badge variant="outline" className="rounded-full mb-3">
                          {r.category}
                        </Badge>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-3">
                          {r.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button asChild className="rounded-full gradient-btn border-0">
                <Link href="/contact">Parler de votre projet</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/blog">Voir tous les articles</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
