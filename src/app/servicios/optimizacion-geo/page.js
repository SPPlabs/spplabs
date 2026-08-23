import MainLayout from "@/components/MainLayout";
import OptimizacionGeoClient from "./OptimizacionGeoClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Optimización GEO para Buscadores de IA | SPP Labs",
  description:
    "Estructure los datos de su empresa para que ChatGPT Search, Gemini y Perplexity lo citen y recomienden como primera opción a sus usuarios.",
  alternates: getAlternates("/servicios/optimizacion-geo"),
  openGraph: {
    title: "Optimización GEO para Buscadores de IA | SPP Labs",
    description:
      "Estructure los datos de su empresa para que ChatGPT Search, Gemini y Perplexity lo citen y recomienden como primera opción a sus usuarios.",
    url: `${BASE_URL}/servicios/optimizacion-geo`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Optimización GEO (Buscadores de IA) | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimización GEO para Buscadores de IA | SPP Labs",
    description:
      "Estructure los datos de su empresa para que ChatGPT Search, Gemini y Perplexity lo citen y recomienden como primera opción a sus usuarios.",
    images: ["/logo.webp"],
  },
};

export default function OptimizacionGeoServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Optimización GEO para Buscadores de IA",
    description:
      "Estructure los datos de su empresa para que ChatGPT Search, Gemini y Perplexity lo citen y recomienden como primera opción a sus usuarios.",
    url: "/servicios/optimizacion-geo",
    serviceType: "Generative Engine Optimization (GEO)",
    category: "Inteligencia Artificial & SEO",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Optimización GEO", item: "/servicios/optimizacion-geo" },
  ]);

  const faqs = [
    {
      q: "¿Qué es exactamente el GEO y en qué se diferencia del SEO?",
      a: "El SEO optimiza palabras clave para una lista de enlaces en Google. El GEO (Generative Engine Optimization) optimiza datos y entidades para que los asistentes de IA conversacionales (ChatGPT, Gemini, Perplexity) recomienden directamente su negocio cuando los usuarios hacen preguntas abiertas.",
    },
    {
      q: "¿Cuándo empezará mi empresa a aparecer en las respuestas de la IA?",
      a: "Tras la implementación del marcado de datos Schema y la reindexación de los crawlers de IA (como GPTBot y PerplexityBot), los cambios suelen reflejarse en pocas semanas.",
    },
  ];

  const faqSchema = getFAQSchema(faqs);

  return (
    <MainLayout activePage="servicios">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <OptimizacionGeoClient />
    </MainLayout>
  );
}
