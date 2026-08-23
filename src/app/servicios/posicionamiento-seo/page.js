import MainLayout from "@/components/MainLayout";
import PosicionamientoSeoClient from "./PosicionamientoSeoClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Posicionamiento SEO Orgánico | SPP Labs",
  description:
    "Optimización SEO técnica y de contenido para posicionar su empresa en los primeros resultados de Google de manera orgánica y sostenible.",
  alternates: getAlternates("/servicios/posicionamiento-seo"),
  openGraph: {
    title: "Posicionamiento SEO Orgánico | SPP Labs",
    description:
      "Optimización SEO técnica y de contenido para posicionar su empresa en los primeros resultados de Google de manera orgánica y sostenible.",
    url: `${BASE_URL}/servicios/posicionamiento-seo`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Posicionamiento SEO Orgánico | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Posicionamiento SEO Orgánico | SPP Labs",
    description:
      "Optimización SEO técnica y de contenido para posicionar su empresa en los primeros resultados de Google de manera orgánica y sostenible.",
    images: ["/logo.webp"],
  },
};

export default function PosicionamientoSeoServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Posicionamiento SEO Orgánico",
    description:
      "Optimización SEO técnica y de contenido para posicionar su empresa en los primeros resultados de Google de manera orgánica y sostenible.",
    url: "/servicios/posicionamiento-seo",
    serviceType: "Search Engine Optimization (SEO)",
    category: "SEO & Growth",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Posicionamiento SEO", item: "/servicios/posicionamiento-seo" },
  ]);

  const faqs = [
    {
      q: "¿Cuánto tiempo se tarda en ver resultados en Google?",
      a: "Las mejoras técnicas de velocidad se aprecian en pocos días, mientras que el posicionamiento orgánico estable suele consolidarse entre 2 y 4 meses.",
    },
    {
      q: "¿Es necesario pagar anuncios en Google Ads?",
      a: "No es obligatorio. El SEO genera tráfico orgánico recurrente sin coste por clic, aunque puede combinarse con campañas si desea resultados inmediatos.",
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
      <PosicionamientoSeoClient />
    </MainLayout>
  );
}
