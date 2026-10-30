import { JsonLd } from "./JsonLd";
import { SITE, DEFAULT_AUTHOR } from "@/lib/site";
import { OFFERS } from "@/lib/offers";

const ORG_ID = `${SITE.url}/#organization`;

const address = {
  "@type": "PostalAddress",
  streetAddress: "229 rue Saint-Honoré",
  postalCode: "75001",
  addressLocality: "Paris",
  addressRegion: "Île-de-France",
  addressCountry: "FR",
};

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        logo: `${SITE.url}/logo.svg`,
        image: `${SITE.url}/og-image.jpg`,
        slogan: SITE.tagline,
        description: SITE.description,
        email: SITE.email,
        telephone: "+33649068354",
        address,
        foundingDate: SITE.foundingDate,
        founder: {
          "@type": "Person",
          "@id": `${SITE.url}/auteurs/${DEFAULT_AUTHOR.slug}#person`,
          name: DEFAULT_AUTHOR.name,
        },
        areaServed: { "@type": "Country", name: "France" },
        availableLanguage: ["French", "English"],
        sameAs: SITE.sameAs,
        knowsAbout: [
          "Intelligence artificielle générative",
          "Agents IA",
          "Automatisation IA",
          "Model Context Protocol",
          "Retrieval-Augmented Generation",
          "Formation à l'IA",
          "AI Act",
          "Data engineering",
          "Cloud computing",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Expertises Agenfy",
          itemListElement: OFFERS.map((offer) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: offer.name,
              description: offer.summary,
              url: `${SITE.url}${offer.path}`,
            },
          })),
        },
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        inLanguage: "fr-FR",
        publisher: { "@id": ORG_ID },
      }}
    />
  );
}
