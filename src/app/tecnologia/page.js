import MainLayout from "@/components/MainLayout";
import TecnologiaSection from "@/components/sections/TecnologiaSection";
import { getBreadcrumbSchema, getPageSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Infraestructura y Ecosistema Tecnológico | SPP Labs",
  description:
    "Bases de datos ultra-rápidas, aceleración por hardware y orquestación de inteligencia artificial ejecutadas en los servidores dedicados de SPP Labs.",
  alternates: getAlternates("/tecnologia"),
  openGraph: {
    title: "Infraestructura y Ecosistema Tecnológico | SPP Labs",
    description:
      "Bases de datos ultra-rápidas, aceleración por hardware y orquestación de inteligencia artificial ejecutadas en los servidores dedicados de SPP Labs.",
    url: `${BASE_URL}/tecnologia`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Ecosistema Tecnológico | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infraestructura y Ecosistema Tecnológico | SPP Labs",
    description:
      "Bases de datos ultra-rápidas, aceleración por hardware y orquestación de inteligencia artificial ejecutadas en los servidores dedicados de SPP Labs.",
    images: ["/logo.webp"],
  },
};

export default function TecnologiaPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Tecnología", item: "/tecnologia" },
  ]);

  const pageSchema = getPageSchema({
    type: "WebPage",
    name: "Ecosistema Tecnológico de SPP Labs",
    description:
      "Infraestructura de alto rendimiento: Next.js, Docker, bases de datos vectoriales Qdrant, ClickHouse y aceleración GPU para aplicaciones empresariales e IA.",
    url: "/tecnologia",
  });

  return (
    <MainLayout activePage="tecnologia">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <TecnologiaSection />
    </MainLayout>
  );
}
