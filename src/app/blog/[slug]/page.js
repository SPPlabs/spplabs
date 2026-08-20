import { notFound } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { blogArticles } from "@/lib/blogData";

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
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      siteName: "SPP Labs",
      locale: "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
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

  // Structured Data Schema for Article, Breadcrumb and FAQPage
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

      <div className="bg-slate-50 min-h-screen py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-400 font-bold">{article.category.label}</span>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
              {article.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="space-y-4 mb-10 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <span className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-full border border-blue-200/60 uppercase tracking-wider">
                {article.category.label}
              </span>
              <span className="text-slate-500 font-semibold">{article.readTime}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-semibold">{article.publishedAt}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm font-mono">
                SPP
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{article.author.name}</span>
                <span className="text-[11px] text-slate-500 block">{article.author.role}</span>
              </div>
            </div>
          </header>

          {/* Table of Contents Index */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs mb-12">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 font-mono">
              ÍNDICE DE CONTENIDOS
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm font-bold text-slate-700">
              {article.sections.map((sec, idx) => (
                <li key={idx} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{sec.h2}</span>
                </li>
              ))}
              {article.faqs?.length > 0 && (
                <li className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono shrink-0">
                    {article.sections.length + 1}
                  </span>
                  <span>Preguntas Frecuentes (FAQ)</span>
                </li>
              )}
            </ul>
          </div>

          {/* Article Main Body Content */}
          <div className="space-y-12 text-slate-800 leading-relaxed font-sans">
            {article.sections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight pt-4 border-t border-slate-100 first:border-0 first:pt-0">
                  {sec.h2}
                </h2>

                <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium space-y-4">
                  {sec.content}
                </div>

                {/* Optional Table if section has structured comparison */}
                {sec.table && (
                  <div className="my-6 overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          {sec.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="py-3 px-4 font-bold text-xs uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {sec.table.rows.map((row, rIdx) => {
                          const isSpp = row[0].includes("SPP Labs");
                          return (
                            <tr
                              key={rIdx}
                              className={`hover:bg-slate-50 transition-colors ${
                                isSpp ? "bg-blue-50/70 font-bold text-blue-950 border-l-4 border-blue-600" : ""
                              }`}
                            >
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-3.5 px-4 text-xs sm:text-sm">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {/* Contextual SPP Labs Highlight Callout Box */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 border-2 border-blue-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs font-mono shadow-xs">
                  SPP
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Ecosistema Digital SPP Labs (197 €/mes + IVA)
                  </h3>
                  <span className="text-xs text-blue-600 font-bold">
                    Web Premium + SEO Local + Chatbot IA + CRM + Booster Reseñas + Soporte Continuo
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                En lugar de pagar miles de euros a una agencia tradicional y contratar múltiples herramientas externas, en <strong>SPP Labs</strong> obtienes toda tu infraestructura digital lista, mantenida y orientada a la captación constante de clientes por una cuota fija transparente.
              </p>
              <div className="pt-2">
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>Solicitar Información Sin Compromiso</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* FAQ Accordion Section */}
            {article.faqs?.length > 0 && (
              <section className="space-y-4 pt-8 border-t border-slate-200">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Preguntas Frecuentes (FAQ)
                </h2>
                <div className="space-y-3">
                  {article.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2"
                    >
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {faq.q}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Related Articles Footer Grid */}
          <div className="mt-16 pt-12 border-t border-slate-200 space-y-6">
            <h2 className="text-xl font-black text-slate-950">
              Artículos y Guías Relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 block w-fit mb-2">
                      {rel.category.label}
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-4 block">
                    {rel.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Conversion CTA */}
          <div className="mt-16 bg-slate-950 text-white rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black">
              ¿Listo para transformar la presencia digital de tu negocio?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Consigue una página web de última generación con Inteligencia Artificial, SEO local y CRM por solo 197 €/mes + IVA.
            </p>
            <div className="pt-2">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span>Pedir Presupuesto / Contactar</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
