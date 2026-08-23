import MainLayout from "@/components/MainLayout";
import ChatbotIaClient from "./ChatbotIaClient";
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Chatbots de Inteligencia Artificial para Empresas | SPP Labs",
  description:
    "Asistentes virtuales entrenados exclusivamente con los datos de su negocio para responder preguntas comerciales y captar clientes 24/7.",
  alternates: getAlternates("/servicios/chatbot-ia"),
  openGraph: {
    title: "Chatbots de Inteligencia Artificial para Empresas | SPP Labs",
    description:
      "Asistentes virtuales entrenados exclusivamente con los datos de su negocio para responder preguntas comerciales y captar clientes 24/7.",
    url: `${BASE_URL}/servicios/chatbot-ia`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Chatbots de Inteligencia Artificial | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatbots de Inteligencia Artificial para Empresas | SPP Labs",
    description:
      "Asistentes virtuales entrenados exclusivamente con los datos de su negocio para responder preguntas comerciales y captar clientes 24/7.",
    images: ["/logo.webp"],
  },
};

export default function ChatbotIaServicePage() {
  const serviceSchema = getServiceSchema({
    name: "Chatbots de Inteligencia Artificial para Empresas",
    description:
      "Asistentes virtuales entrenados exclusivamente con los datos de su negocio para responder preguntas comerciales y captar clientes 24/7.",
    url: "/servicios/chatbot-ia",
    serviceType: "Artificial Intelligence & Customer Support",
    category: "Inteligencia Artificial",
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Servicios", item: "/servicios" },
    { name: "Chatbot de IA 24/7", item: "/servicios/chatbot-ia" },
  ]);

  const faqs = [
    {
      q: "¿El chatbot comete errores o alucina respuestas?",
      a: "No. Utilizamos una arquitectura RAG (Retrieval-Augmented Generation) que restringe al chatbot a responder estrictamente con la información verificada de su empresa.",
    },
    {
      q: "¿Qué pasa si un usuario hace una pregunta no registrada?",
      a: "El chatbot responde cortésmente que derivará la consulta al equipo humano y solicita sus datos de contacto para atenderlo.",
    },
    {
      q: "¿Es fácil instalar el chatbot en mi sitio web?",
      a: "Muy fácil. Se instala mediante un script ligero de una sola línea compatible con cualquier CMS o framework web.",
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
      <ChatbotIaClient />
    </MainLayout>
  );
}
