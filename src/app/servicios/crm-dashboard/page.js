import MainLayout from "@/components/MainLayout";
import CrmDashboardClient from "./CrmDashboardClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Sistemas CRM y Panel de Control | SPP Labs",
  description:
    "Panel de control centralizado para empresas. Gestión de formularios, reservas automáticas, analíticas de visitas y base de conocimiento de IA.",
  alternates: getAlternates("/servicios/crm-dashboard"),
  openGraph: {
    title: "Sistemas CRM y Panel de Control | SPP Labs",
    description:
      "Panel de control centralizado para empresas. Gestión de formularios, reservas automáticas, analíticas de visitas y base de conocimiento de IA.",
    url: `${BASE_URL}/servicios/crm-dashboard`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sistemas CRM y Panel de Control | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistemas CRM y Panel de Control | SPP Labs",
    description:
      "Panel de control centralizado para empresas. Gestión de formularios, reservas automáticas, analíticas de visitas y base de conocimiento de IA.",
    images: ["/logo.webp"],
  },
};

export default function CrmDashboardServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Sistemas CRM y Panel de Control",
    description:
      "Panel de control centralizado para empresas. Gestión de formularios, reservas automáticas, analíticas de visitas y base de conocimiento de IA.",
    url: "/servicios/crm-dashboard",
    serviceType: "CRM & Business Management Systems",
    category: "Software & CRM",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "CRM y Panel de Control", item: "/servicios/crm-dashboard" },
  ]);

  const faqs = [
    {
      q: "¿Es complicado aprender a usar el panel de control?",
      a: "No, la interfaz está diseñada de forma muy intuitiva para que cualquier miembro de su equipo pueda gestionar leads y citas sin conocimientos técnicos.",
    },
    {
      q: "¿Cumple con la normativa de privacidad RGPD?",
      a: "Sí, los datos se almacenan de forma segura con cifrado Argon2id y cumplimiento estricto del RGPD europeo.",
    },
    {
      q: "¿Puedo exportar los datos de mis clientes?",
      a: "Sí, el panel permite descargar reportes de contactos y citas en cualquier momento.",
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
      <CrmDashboardClient />
    </MainLayout>
  );
}
