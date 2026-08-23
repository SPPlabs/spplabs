import MainLayout from "@/components/MainLayout";
import BoosterResenasClient from "./BoosterResenasClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Booster de Reseñas de Google & Email Marketing | SPP Labs",
  description:
    "Aumente sus reseñas de 5 estrellas en Google Maps y automatice recordatorios por email para clientes potenciales y citas.",
  alternates: getAlternates("/servicios/booster-resenas"),
  openGraph: {
    title: "Booster de Reseñas de Google & Email Marketing | SPP Labs",
    description:
      "Aumente sus reseñas de 5 estrellas en Google Maps y automatice recordatorios por email para clientes potenciales y citas.",
    url: `${BASE_URL}/servicios/booster-resenas`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Booster de Reseñas de Google & Email Marketing | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Booster de Reseñas de Google & Email Marketing | SPP Labs",
    description:
      "Aumente sus reseñas de 5 estrellas en Google Maps y automatice recordatorios por email para clientes potenciales y citas.",
    images: ["/logo.webp"],
  },
};

export default function BoosterResenasServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Booster de Reseñas de Google & Email Marketing",
    description:
      "Aumente sus reseñas de 5 estrellas en Google Maps y automatice recordatorios por email para clientes potenciales y citas.",
    url: "/servicios/booster-resenas",
    serviceType: "Reputation & Email Automation",
    category: "Marketing & Growth",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Booster de Reseñas", item: "/servicios/booster-resenas" },
  ]);

  const faqs = [
    {
      q: "¿Cómo se conecta con mi ficha de Google Maps / Google Business?",
      a: "Solo tienes que pegar el enlace de solicitud de reseñas que te proporciona tu panel de Google Business en tu dashboard de SPP Labs. El sistema se encarga del resto automáticamente.",
    },
    {
      q: "¿Puedo elegir si enviarlo tras un contacto web o tras una cita?",
      a: "Sí, dispones de dos interruptores independientes: puedes activarlo para citas presenciales/reuniones, para formularios de contacto web (inmediato o diferido), o para ambos a la vez.",
    },
    {
      q: "¿Los correos llevan el nombre y logo de mi empresa?",
      a: "Totalmente. Los correos se envían con el nombre de tu empresa, tu color corporativo y tu enlace de respuesta directa (Reply-To).",
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
      <BoosterResenasClient />
    </MainLayout>
  );
}
