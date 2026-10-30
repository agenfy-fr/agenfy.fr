import { SITE, absoluteUrl, type Author } from "@/lib/site";

type Schema = Record<string, unknown>;

// `<` is escaped so content can never close the script tag early.
export function JsonLd({ data }: { data: Schema | Schema[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const ORG_REF = { "@id": `${SITE.url}/#organization` };

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FaqItem[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url: absoluteUrl(input.path),
    provider: ORG_REF,
    areaServed: { "@type": "Country", name: "France" },
    availableLanguage: "fr",
  };
}

export function personSchema(author: Author): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE.url}/auteurs/${author.slug}#person`,
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    image: absoluteUrl(author.photo),
    url: absoluteUrl(`/auteurs/${author.slug}`),
    worksFor: ORG_REF,
    knowsAbout: author.knowsAbout,
    ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author: Author;
  section: string;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    articleSection: input.section,
    inLanguage: "fr-FR",
    image: absoluteUrl("/og-image.jpg"),
    author: {
      "@type": "Person",
      "@id": `${SITE.url}/auteurs/${input.author.slug}#person`,
      name: input.author.name,
      url: absoluteUrl(`/auteurs/${input.author.slug}`),
    },
    publisher: ORG_REF,
  };
}

export function courseSchema(input: {
  name: string;
  description: string;
  path: string;
  durationHours: number;
  mode: "online" | "onsite" | "blended";
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "fr",
    provider: ORG_REF,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: input.mode,
      courseWorkload: `PT${input.durationHours}H`,
    },
  };
}
