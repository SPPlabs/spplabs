import MainLayout from "@/components/MainLayout";
import BlogClient from "./BlogClient";
import { blogArticles } from "@/lib/blogData";
import { getBreadcrumbSchema, BASE_URL, getAlternates } from "@/lib/schemas";

export const metadata = {
  title: "Blog & Recursos de Tecnología y Estrategia Digital | SPP Labs",
  description:
    "Guías, comparativas de precios y estrategias sobre desarrollo web, SEO local, chatbots con IA, CRM y captación de clientes para empresas.",
  alternates: getAlternates("/blog"),
  openGraph: {
    title: "Blog & Recursos de Tecnología y Estrategia Digital | SPP Labs",
    description:
      "Guías, comparativas de precios y estrategias sobre desarrollo web, SEO local, chatbots con IA, CRM y captación de clientes para empresas.",
    url: `${BASE_URL}/blog`,
    siteName: "SPP Labs",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Blog & Recursos de Tecnología | SPP Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Recursos de Tecnología y Estrategia Digital | SPP Labs",
    description:
      "Guías, comparativas de precios y estrategias sobre desarrollo web, SEO local, chatbots con IA, CRM y captación de clientes para empresas.",
    images: ["/logo.webp"],
  },
};

export default function BlogHubPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", item: "/" },
    { name: "Blog", item: "/blog" },
  ]);

  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": ["Blog", "CollectionPage"],
    name: "Blog & Recursos de Tecnología y Estrategia Digital | SPP Labs",
    description:
      "Guías, comparativas y estrategias sobre páginas web, SEO, chatbots con inteligencia artificial, CRM y captación de clientes para empresas.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "SPP Labs",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.webp`,
    },
    blogPost: blogArticles.slice(0, 10).map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.publishedAt,
      url: `${BASE_URL}/blog/${article.slug}`,
      author: {
        "@type": "Organization",
        name: article.author.name,
      },
    })),
  };

  return (
    <MainLayout activePage="blog">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionSchema) }}
      />
      <BlogClient />
    </MainLayout>
  );
}
