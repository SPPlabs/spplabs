import MainLayout from "@/components/MainLayout";
import DesarrolloWebClient from "./DesarrolloWebClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Desarrollo Web Premium | SPP Labs",
  description:
    "Diseño y desarrollo de páginas web y aplicaciones modernas con Next.js y React. Ultrarrápidas, adaptadas a móviles y optimizadas para convertir.",
  alternates: getAlternates("/servicios/desarrollo-web"),
  openGraph: {
    title: "Desarrollo Web Premium | SPP Labs",
    description:
      "Diseño y desarrollo de páginas web y aplicaciones modernas con Next.js y React. Ultrarrápidas, adaptadas a móviles y optimizadas para convertir.",
    url: `${BASE_URL}/servicios/desarrollo-web`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Desarrollo Web Premium | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollo Web Premium | SPP Labs",
    description:
      "Diseño y desarrollo de páginas web y aplicaciones modernas con Next.js y React. Ultrarrápidas, adaptadas a móviles y optimizadas para convertir.",
    images: ["/logo.webp"],
  },
};

export default function DesarrolloWebServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Desarrollo Web Premium",
    description:
      "Diseño y desarrollo de páginas web y aplicaciones modernas con Next.js y React. Ultrarrápidas, adaptadas a móviles y optimizadas para convertir.",
    url: "/servicios/desarrollo-web",
    serviceType: "Web Development & Software Engineering",
    category: "Desarrollo Web",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Desarrollo Web", item: "/servicios/desarrollo-web" },
  ]);

  const faqs = [
    {
      q: "¿Cuánto tarda en desarrollarse una web completa?",
      a: "Un proyecto web completo suele entregarse entre 1 y 3 semanas, incluyendo diseño, pruebas y optimización.",
    },
    {
      q: "¿La web estará adaptada a teléfonos móviles?",
      a: "Por supuesto. El 100% de nuestros desarrollos se crean bajo el concepto 'Mobile First', asegurando una experiencia perfecta en smartphones.",
    },
    {
      q: "¿Incluye optimización para buscadores (SEO)?",
      a: "Sí, entregamos la web con la arquitectura técnica SEO lista: metaetiquetas, mapas de sitio XML, tiempos de carga mínimos y semántica HTML5.",
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
      <DesarrolloWebClient />
    </MainLayout>
  );
}
