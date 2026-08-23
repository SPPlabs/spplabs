import MainLayout from "@/components/MainLayout";
import NosotrosSection from "@/components/sections/NosotrosSection";
import { getBreadcrumbSchema, getPageSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Sobre Nosotros | SPP Labs",
  description:
    "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización.",
  alternates: getAlternates("/nosotros"),
  openGraph: {
    title: "Sobre Nosotros | SPP Labs",
    description:
      "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización.",
    url: `${BASE_URL}/nosotros`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sobre SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros | SPP Labs",
    description:
      "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización.",
    images: ["/logo.webp"],
  },
};

export default function NosotrosPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Nosotros", item: "/nosotros" },
  ]);

  const aboutSchema = getPageSchema({
    type: "AboutPage",
    name: "Sobre SPP Labs",
    description:
      "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización de procesos.",
    url: "/nosotros",
  });

  return (
    <MainLayout activePage="nosotros">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <NosotrosSection />
    </MainLayout>
  );
}
