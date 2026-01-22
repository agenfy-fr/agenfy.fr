export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agenfy',
    legalName: 'Hasfy SAS',
    url: 'https://www.agenfy.fr',
    logo: 'https://www.agenfy.fr/logo.svg',
    description:
      "Cabinet de conseil tech spécialisé en Data Engineering, Intelligence Artificielle et Infrastructure Cloud",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressLocality: 'Paris',
      addressRegion: 'Île-de-France',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@agenfy.fr',
      availableLanguage: ['French', 'English'],
    },
    sameAs: [
      'https://www.linkedin.com/company/agenfy-fr/',
      'https://x.com/Agenfy_',
      'https://github.com/agenfy-fr',
    ],
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    knowsAbout: [
      'Data Engineering',
      'Intelligence Artificielle',
      'Machine Learning',
      'Cloud Computing',
      'AWS',
      'Google Cloud Platform',
      'Azure',
      'PostgreSQL',
      'Data Lakehouse',
      'RAG',
      'LLM',
      'MLOps',
      'FinOps',
    ],
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Data Engineering',
          description: 'Architecture de données, pipelines ETL/ELT, Data Lakehouse',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Intelligence Artificielle',
          description: 'Développement de solutions IA, RAG, agents conversationnels',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Infrastructure Cloud',
          description: 'Architecture cloud, migration, optimisation FinOps',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Conseil Technologique',
          description: 'Stratégie data, transformation digitale, accompagnement',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Agenfy',
    url: 'https://www.agenfy.fr',
    description:
      'Cabinet de conseil tech - Data, IA, Cloud',
    publisher: {
      '@type': 'Organization',
      name: 'Agenfy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.agenfy.fr/logo.svg',
      },
    },
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.agenfy.fr/blog?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Agenfy',
    image: 'https://www.agenfy.fr/logo.svg',
    url: 'https://www.agenfy.fr',
    telephone: '',
    email: 'contact@agenfy.fr',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressRegion: 'Île-de-France',
      addressCountry: 'FR',
    },
    priceRange: '€€€',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://www.linkedin.com/company/agenfy-fr/',
      'https://x.com/Agenfy_',
      'https://github.com/agenfy-fr',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
