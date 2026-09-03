import MainLayout from "@/components/MainLayout";
import InicioSection from "@/components/sections/InicioSection";
import { getBreadcrumbSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "SPP Labs | Diseño web, SEO, IA y Automatización para Empresas en España",
  description:
    "Agencia tecnológica especializada en diseño web premium, posicionamiento SEO, asistentes inteligentes con IA y automatización CRM para empresas en España.",
  alternates: getAlternates("/"),
  openGraph: {
    title: "SPP Labs | Diseño web, SEO, IA y Automatización para Empresas en España",
    description:
      "Agencia tecnológica especializada en diseño web premium, posicionamiento SEO, asistentes inteligentes con IA y automatización CRM para empresas en España.",
    url: BASE_URL,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "SPP Labs | Diseño web, SEO, IA y Automatización para Empresas en España",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPP Labs | Diseño web, SEO, IA y Automatización para Empresas en España",
    description:
      "Agencia tecnológica especializada en diseño web premium, posicionamiento SEO, asistentes inteligentes con IA y automatización CRM para empresas en España.",
    images: ["/logo.webp"],
  },
};

export default function Home() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
  ]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BASE_URL}/#webpage`,
    url: BASE_URL,
    name: "Diseño web, SEO, IA y Automatización para Empresas en España | SPP Labs",
    headline: "Diseño web, SEO, IA y Automatización para Empresas en España",
    description:
      "Agencia tecnológica especializada en diseño web premium, posicionamiento SEO, asistentes inteligentes con IA y automatización CRM para empresas en España.",
    isPartOf: {
      "@id": `${BASE_URL}/#website`,
    },
    about: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: "es-ES",
  };

  return (
    <MainLayout activePage="inicio">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <InicioSection />
    </MainLayout>
  );
}
