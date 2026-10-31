import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { JsonLd, personSchema } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { AUTHORS } from "@/lib/site";
import { formatDateFr } from "@/lib/dates";
import { getSummariesByAuthor } from "@/lib/blog";

const author = AUTHORS["evan-masse"];
const path = `/auteurs/${author.slug}`;

export const metadata = buildMetadata({
  title: `${author.name} – ${author.role}`,
  description: author.bio,
  path,
});

export const revalidate = 300;

export default async function EvanMassePage() {
  const posts = await getSummariesByAuthor(author.slug);

  return (
    <PageLayout>
      <JsonLd data={personSchema(author)} />
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ name: author.name, path }]} />
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <Image
                src={author.photo}
                alt={`Portrait de ${author.name}`}
                width={160}
                height={160}
                priority
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border border-border/60"
              />
              <div>
                <h1 className="text-hero font-bold mb-2">
                  <span className="gradient-text">{author.name}</span>
                </h1>
                <p className="text-xl text-foreground/90 mb-6">{author.role}</p>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{author.bio}</p>
                {author.sameAs.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-4 text-sm">
                    {author.sameAs.map((url) => (
                      <li key={url}>
                        <a href={url} rel="me noopener" target="_blank" className="text-primary hover:underline">
                          {new URL(url).hostname.replace(/^www\./, "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-12 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-h2 font-bold mb-6">Domaines d&apos;expertise</h2>
          <ul className="flex flex-wrap gap-2">
            {author.knowsAbout.map((topic) => (
              <li key={topic}>
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm">
                  {topic}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-h2 font-bold mb-8">
            Ses articles <span className="text-muted-foreground font-normal">({posts.length})</span>
          </h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block h-full rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <Badge className="rounded-full">{post.category}</Badge>
                    <time dateTime={post.date}>{formatDateFr(post.date)}</time>
                  </div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-start gap-2">
                    {post.title}
                    <ArrowRight className="w-4 h-4 mt-1 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageLayout>
  );
}
