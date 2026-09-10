import { notFound } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import BlogArticleClient from "./BlogArticleClient";
import { blogArticles } from "@/lib/blogData";
import { getAlternates } from "@/lib/schemas";

export async function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Artículo no encontrado | SPP Labs",
    };
  }

  const url = `https://spplabs.es/blog/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    alternates: getAlternates(`/blog/${article.slug}`),
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      siteName: "SPP Labs",
      locale: "es_ES",
      images: [
        {
          url: "/logo.webp",
          width: 1200,
          height: 630,
          alt: article.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: ["/logo.webp"],
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Related articles (same category or others, max 3)
  const relatedArticles = blogArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Structured Data Schema for Article, Breadcrumb and FAQPage (Preserved for Googlebot SEO)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://spplabs.es/blog/${article.slug}`,
    },
    author: {
      "@type": "Organization",
      name: article.author.name,
      url: "https://spplabs.es",
    },
    publisher: {
      "@type": "Organization",
      name: "SPP Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://spplabs.es/logo.webp",
      },
    },
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://spplabs.es",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://spplabs.es/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://spplabs.es/blog/${article.slug}`,
      },
    ],
  };

  const faqSchema = article.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      }
    : null;

  return (
    <MainLayout activePage="blog">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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

      <BlogArticleClient article={article} relatedArticles={relatedArticles} />
    </MainLayout>
  );
}
