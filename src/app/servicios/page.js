import MainLayout from "@/components/MainLayout";
import ServiciosSection from "@/components/sections/ServiciosSection";
import { getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Catálogo de Servicios Tecnológicos para Empresas | SPP Labs",
  description:
    "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio.",
  alternates: getAlternates("/servicios"),
  openGraph: {
    title: "Catálogo de Servicios Tecnológicos para Empresas | SPP Labs",
    description:
      "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio.",
    url: `${BASE_URL}/servicios`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Servicios Tecnológicos | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Servicios Tecnológicos para Empresas | SPP Labs",
    description:
      "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio.",
    images: ["/logo.webp"],
  },
};

export default function ServiciosPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catálogo de Servicios Tecnológicos de SPP Labs",
    description: "Servicios de desarrollo web, CRM, automatización con IA, SEO y optimización GEO.",
    url: `${BASE_URL}/servicios`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Desarrollo Web Premium",
        url: `${BASE_URL}/servicios/desarrollo-web`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sistemas CRM y Panel de Control",
        url: `${BASE_URL}/servicios/crm-dashboard`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Chatbot de IA 24/7",
        url: `${BASE_URL}/servicios/chatbot-ia`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Optimización GEO (Buscadores de IA)",
        url: `${BASE_URL}/servicios/optimizacion-geo`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Posicionamiento SEO Orgánico",
        url: `${BASE_URL}/servicios/posicionamiento-seo`,
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Sistema de Reservas y Citas",
        url: `${BASE_URL}/servicios/sistema-reservas`,
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Booster de Reseñas de Google & Email",
        url: `${BASE_URL}/servicios/booster-resenas`,
      },
    ],
  };

  const faqSchema = getFAQSchema([
    {
      q: "¿Cuánto tiempo toma implementar un servicio?",
      a: "Dependiendo de la complejidad, la mayoría de nuestros desarrollos web, integración de CRM y chatbots de IA se despliegan en un plazo de 1 a 3 semanas.",
    },
    {
      q: "¿Puedo integrar el CRM y el Chatbot en una web existente?",
      a: "Sí, nuestras herramientas son modulares y pueden conectarse fácilmente a su sitio web actual mediante código ligero sin interrumpir su operación.",
    },
    {
      q: "¿Cómo se entrena el chatbot de Inteligencia Artificial?",
      a: "Cargamos los datos, catálogos, preguntas frecuentes y documentación de su empresa en el panel de control. El chatbot aprende en minutos y usted puede actualizar su conocimiento cuando lo desee.",
    },
    {
      q: "¿Qué diferencia al SEO tradicional de la Optimización GEO?",
      a: "El SEO optimiza su web para la lista de resultados de Google. La Optimización GEO (Generative Engine Optimization) estructura sus datos para que buscadores conversacionales de IA (ChatGPT, Gemini, Perplexity) recomienden su empresa cuando los usuarios hacen preguntas abiertas.",
    },
  ]);

  return (
    <MainLayout activePage="servicios">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ServiciosSection />
    </MainLayout>
  );
}
