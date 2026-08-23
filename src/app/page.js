import MainLayout from "@/components/MainLayout";
import InicioSection from "@/components/sections/InicioSection";
import { getBreadcrumbSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "SPP labs | Soluciones tecnológicas para empresas",
  description:
    "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
  alternates: getAlternates("/"),
  openGraph: {
    title: "SPP labs | Soluciones tecnológicas para empresas",
    description:
      "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
    url: BASE_URL,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "SPP Labs | Soluciones tecnológicas para empresas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPP labs | Soluciones tecnológicas para empresas",
    description:
      "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
    images: ["/logo.webp"],
  },
};

export default function Home() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
  ]);

  return (
    <MainLayout activePage="inicio">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <InicioSection />
    </MainLayout>
  );
}
