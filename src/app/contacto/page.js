import MainLayout from "@/components/MainLayout";
import ContactoSection from "@/components/sections/ContactoSection";
import { getBreadcrumbSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Contacto y Consultoría Técnica | SPP Labs",
  description:
    "Agende una cita de consultoría técnica o envíenos sus requerimientos directamente para diseñar una propuesta a medida para su empresa.",
  alternates: getAlternates("/contacto"),
  openGraph: {
    title: "Contacto y Consultoría Técnica | SPP Labs",
    description:
      "Agende una cita de consultoría técnica o envíenos sus requerimientos directamente para diseñar una propuesta a medida para su empresa.",
    url: `${BASE_URL}/contacto`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Contacto SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto y Consultoría Técnica | SPP Labs",
    description:
      "Agende una cita de consultoría técnica o envíenos sus requerimientos directamente para diseñar una propuesta a medida para su empresa.",
    images: ["/logo.webp"],
  },
};

export default function ContactoPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Contacto", item: "/contacto" },
  ]);

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto y Consultoría Técnica SPP Labs",
    description: "Agende una cita de consultoría técnica o envíe sus requerimientos directamente a SPP Labs.",
    url: `${BASE_URL}/contacto`,
    mainEntity: {
      "@type": "Organization",
      name: "SPP Labs",
      url: BASE_URL,
      email: "info@spplabs.es",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support & Sales",
        email: "info@spplabs.es",
        availableLanguage: ["Spanish", "English"],
      },
    },
  };

  return (
    <MainLayout activePage="contacto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <ContactoSection />
    </MainLayout>
  );
}
