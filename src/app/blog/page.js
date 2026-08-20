"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import { blogCategories, blogArticles } from "@/lib/blogData";

export default function BlogHubPage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return blogArticles.filter((article) => {
      // Category match
      if (selectedCategory !== "todos" && article.category.id !== selectedCategory) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = article.title.toLowerCase().includes(q);
        const inExcerpt = article.excerpt.toLowerCase().includes(q);
        const inKw = article.primaryKeyword.toLowerCase().includes(q) || article.secondaryKeywords.some(k => k.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inKw) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = blogArticles[0]; // ¿Cuánto cuesta una página web en España en 2026?

  return (
    <MainLayout activePage="blog">
      <div className="bg-slate-50 min-h-screen py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {isEs ? "Inicio" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              {isEs ? "Blog & Recursos" : "Blog & Resources"}
            </span>
          </nav>

          {/* Hero Header Banner */}
          <div className="text-center max-w-4xl mx-auto mb-16 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>{isEs ? "Guías Prácticas & Estrategia Digital 2026" : "Actionable Guides & Digital Strategy 2026"}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              {isEs ? "Blog & Recursos para " : "Insights & Playbooks to "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
                {isEs ? "Hacer Crecer tu Empresa" : "Scale Your Business"}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              {isEs
                ? "Guías claras, análisis de precios reales y estrategias prácticas sobre páginas web, SEO local, inteligencia artificial, CRM y captación de clientes en España."
                : "Honest pricing breakdowns, local SEO playbooks, AI implementation guides, and CRM workflows engineered for high-growth businesses."}
            </p>
          </div>

          {/* Search & Categories Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm mb-12 space-y-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none flex-1">
                {blogCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-slate-950 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEs ? "Buscar en el blog..." : "Search articles..."}
                  className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Article Card (Shown when on "todos" and no search query) */}
          {selectedCategory === "todos" && !searchQuery.trim() && (
            <div className="mb-14">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                {isEs ? "Artículo Destacado" : "Featured Playbook"}
              </span>
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="max-w-3xl space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                      {featuredArticle.category.label}
                    </span>
                    <span className="text-slate-400 font-semibold">{featuredArticle.readTime}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-semibold">{featuredArticle.publishedAt}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight group-hover:text-blue-300 transition-colors">
                    <Link href={`/blog/${featuredArticle.slug}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-blue-300 font-mono">
                        SPP
                      </div>
                      <span className="text-xs text-slate-300 font-bold">{featuredArticle.author.name}</span>
                    </div>

                    <Link
                      href={`/blog/${featuredArticle.slug}`}
                      className="px-5 py-2.5 bg-white text-slate-950 hover:bg-blue-50 text-xs font-black rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>{isEs ? "Leer Artículo Completo" : "Read Full Article"}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Articles */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <p className="text-base font-bold text-slate-800 mb-1">
                {isEs ? "No se encontraron artículos" : "No articles found"}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                {isEs
                  ? "Prueba a buscar con otras palabras o selecciona otra categoría."
                  : "Try searching with different keywords or select another category."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("todos");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isEs ? "Restablecer filtros" : "Reset filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Meta Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {article.category.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {article.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-950 leading-snug mb-2.5 group-hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 font-sans">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10.5px] font-mono text-slate-400">
                      {article.publishedAt}
                    </span>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-xs font-extrabold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>{isEs ? "Leer más" : "Read more"}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Bottom Conversion Banner for SPP Labs */}
          <div className="mt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
                {isEs ? "DIGITALIZACIÓN INTEGRAL PARA EMPRESAS" : "ALL-IN-ONE DIGITAL ECOSYSTEM"}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {isEs ? "¿Quieres una infraestructura digital completa para tu empresa?" : "Ready to scale your business with SPP Labs?"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {isEs
                  ? "Página web de alto rendimiento, SEO local, Chatbot con IA, CRM, reservas y booster de reseñas de Google por solo 197 €/mes + IVA."
                  : "Ultra-fast website, local SEO, AI Chatbot, CRM, bookings engine, and Google Reviews booster for just 197 €/month."}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/contacto"
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {isEs ? "Hablar con un Especialista" : "Talk to a Specialist"}
                </Link>
                <Link
                  href="/servicios"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  {isEs ? "Explorar Todos los Servicios" : "Explore All Services"}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
