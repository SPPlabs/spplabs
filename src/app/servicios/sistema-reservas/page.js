import MainLayout from "@/components/MainLayout";
import SistemaReservasClient from "./SistemaReservasClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Sistema de Reservas y Citas Automatizado | SPP Labs",
  description:
    "Permita que sus clientes reserven consultas comerciales directamente desde su web en franjas disponibles, sin fricción ni llamadas.",
  alternates: getAlternates("/servicios/sistema-reservas"),
  openGraph: {
    title: "Sistema de Reservas y Citas Automatizado | SPP Labs",
    description:
      "Permita que sus clientes reserven consultas comerciales directamente desde su web en franjas disponibles, sin fricción ni llamadas.",
    url: `${BASE_URL}/servicios/sistema-reservas`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Sistema de Reservas y Citas Automatizado | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Reservas y Citas Automatizado | SPP Labs",
    description:
      "Permita que sus clientes reserven consultas comerciales directamente desde su web en franjas disponibles, sin fricción ni llamadas.",
    images: ["/logo.webp"],
  },
};

export default function SistemaReservasServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Sistema de Reservas y Citas Automatizado",
    description:
      "Permita que sus clientes reserven consultas comerciales directamente desde su web en franjas disponibles, sin fricción ni llamadas.",
    url: "/servicios/sistema-reservas",
    serviceType: "Booking & Scheduling Platform",
    category: "Software & Automatización",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Sistema de Reservas", item: "/servicios/sistema-reservas" },
  ]);

  const faqs = [
    {
      q: "¿Se puede integrar con mi calendario existente (Google/Outlook)?",
      a: "Sí, el sistema se sincroniza bidireccionalmente para evitar duplicidades en su agenda.",
    },
    {
      q: "¿Puedo personalizar los campos del formulario de reserva?",
      a: "Totalmente. Puede solicitar nombre, email, teléfono, tipo de servicio o cualquier pregunta relevante.",
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
      <SistemaReservasClient />
    </MainLayout>
  );
}
