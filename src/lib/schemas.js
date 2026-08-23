/**
 * Centralized Schema.org JSON-LD structured data generators for SPP Labs.
 * Fully compatible with Google Rich Results & Generative Engine Optimization (GEO).
 */

export const BASE_URL = "https://spplabs.es";

/**
 * Standardized canonical and hreflang configuration for Next.js metadata.
 */
export function getAlternates(path = "") {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const url = `${BASE_URL}${cleanPath}`;
  return {
    canonical: url,
    languages: {
      "es-ES": url,
      "es": url,
      "x-default": url,
    },
  };
}

/**
 * Root Organization & ProfessionalService schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${BASE_URL}/#organization`,
    name: "SPP Labs",
    alternateName: "SPP Labs Soluciones Tecnológicas",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.webp`,
      caption: "SPP Labs Logo",
    },
    image: `${BASE_URL}/logo.webp`,
    description:
      "Desarrollo web a medida, sistemas CRM, asistentes inteligentes con IA y optimización SEO/GEO para empresas.",
    email: "info@spplabs.es",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
    },
    areaServed: {
      "@type": "Country",
      name: "España",
    },
    sameAs: [
      "https://github.com",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios Tecnológicos SPP Labs",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desarrollo Web Premium",
            url: `${BASE_URL}/servicios/desarrollo-web`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Sistemas CRM y Panel de Control",
            url: `${BASE_URL}/servicios/crm-dashboard`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Chatbot de IA 24/7",
            url: `${BASE_URL}/servicios/chatbot-ia`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Optimización GEO (Buscadores de IA)",
            url: `${BASE_URL}/servicios/optimizacion-geo`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Posicionamiento SEO Orgánico",
            url: `${BASE_URL}/servicios/posicionamiento-seo`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Sistema de Reservas y Citas",
            url: `${BASE_URL}/servicios/sistema-reservas`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Booster de Reseñas de Google & Email",
            url: `${BASE_URL}/servicios/booster-resenas`,
          },
        },
      ],
    },
  };
}

/**
 * WebSite schema
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "SPP Labs",
    alternateName: "SPP Labs | Soluciones tecnológicas para empresas",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: ["es", "en"],
  };
}

/**
 * Service schema generator
 */
export function getServiceSchema({
  name,
  description,
  url,
  serviceType,
  category = "Tecnología",
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
    serviceType,
    category,
    provider: {
      "@type": "Organization",
      name: "SPP Labs",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.webp`,
    },
    areaServed: {
      "@type": "Country",
      name: "España",
    },
    termsOfService: `${BASE_URL}/terminos-y-condiciones`,
  };
}

/**
 * BreadcrumbList schema generator
 * @param {Array<{ name: string, item: string }>} items
 */
export function getBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item.startsWith("http") ? crumb.item : `${BASE_URL}${crumb.item}`,
    })),
  };
}

/**
 * FAQPage schema generator
 * @param {Array<{ q: string, a: string }>} faqs
 */
export function getFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

/**
 * Generic WebPage / AboutPage / ContactPage schema
 */
export function getPageSchema({ type = "WebPage", name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
    isPartOf: {
      "@id": `${BASE_URL}/#website`,
    },
    about: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: ["es", "en"],
  };
}
