"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { blogArticles, blogCategories } from "@/lib/blogData";

export default function NosotrosSection() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  // 3 featured preview articles for the blog section
  const previewArticles = blogArticles.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section 1: About us */}
        <div className="grid md:grid-cols-12 gap-12 items-center mb-24">
          <div className="md:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full inline-block">
              {isEs ? "Conoce SPP Labs" : "About SPP Labs"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
              {isEs ? "En SPP Labs ayudamos a empresas a crecer" : "Empowering Business Growth with Digital Solutions"}
            </h1>
            <p className="text-zinc-650 text-base md:text-lg leading-relaxed font-medium">
              {isEs
                ? "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización."
                : "At SPP Labs we help businesses grow through digital solutions combining premium web design, artificial intelligence, and automation."}
            </p>
            <p className="text-zinc-650 text-sm md:text-base leading-relaxed">
              {isEs
                ? "Creamos experiencias digitales enfocadas en atraer clientes, optimizar procesos y generar resultados reales. Cada proyecto está diseñado para ofrecer el máximo rendimiento, un diseño cuidado y tecnología preparada para el futuro."
                : "We build digital experiences focused on attracting clients, streamlining processes, and delivering real results. Every project is crafted for peak performance, thoughtful design, and future-proof technology."}
            </p>
            <p className="text-brand-blue font-extrabold text-sm md:text-base">
              {isEs
                ? "Innovamos para que tu negocio destaque."
                : "We innovate so your business stands out."}
            </p>
          </div>

          <div className="md:col-span-5 border border-zinc-200 rounded-3xl p-8 bg-zinc-50/50 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
            <h2 className="text-lg font-bold text-black mb-4">{isEs ? "Nuestros Pilares" : "Our Core Ethos"}</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{isEs ? "Velocidad Sub-Milisegundo" : "Sub-Millisecond Performance"}</span>
                  <span className="text-xs text-zinc-500 block">{isEs ? "Analíticas y métricas en tiempo real." : "Real-time analytics and instant metrics."}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{isEs ? "Modelos de IA Locales" : "Local AI Architectures"}</span>
                  <span className="text-xs text-zinc-500 block">{isEs ? "Inferencia en GPUs propias." : "vLLM model hosting inside our server rack."}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-zinc-200 text-black font-black flex items-center justify-center shrink-0 text-xs">✓</span>
                <div>
                  <span className="text-sm font-bold text-black block">{isEs ? "Soberanía Hardware" : "In-House Server Nodes"}</span>
                  <span className="text-xs text-zinc-500 block">{isEs ? "Sin silos de nubes externas." : "Completely free from external SaaS clouds."}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Comunidad (TikTok) */}
        <div className="border-t border-zinc-150 pt-20 mb-24">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800/90 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-cyan-400/10 to-brand-green/10 pointer-events-none -z-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/90 text-xs font-extrabold uppercase tracking-widest text-brand-green mb-6 shadow-sm">
              {isEs ? "ÚNETE A NUESTRA COMUNIDAD" : "JOIN OUR COMMUNITY"}
            </span>
            
            <div className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-green tracking-tighter mb-4 font-sans drop-shadow-sm">
              30.000+
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 font-sans tracking-tight">
              {isEs ? "Seguidores Activos en Redes Sociales" : "Active Social Media Followers"}
            </h2>
            
            <p className="text-zinc-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-10 font-medium">
              {isEs
                ? "Nuestros canales de redes sociales acumulan más de 30.000 seguidores activos encantados con nuestros servicios."
                : "Our social media channels accumulate over 30,000 active followers delighted with our services."}
            </p>

            <div className="flex justify-center">
              <a
                href="https://www.tiktok.com/@spplabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 hover:from-black hover:to-zinc-950 text-white rounded-2xl border border-zinc-700 shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 font-extrabold text-sm sm:text-base group cursor-pointer"
                id="comunidad-tiktok-cta"
              >
                <svg className="w-6 h-6 fill-current text-white group-hover:text-cyan-400 transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.63a6.34 6.34 0 0 0-4.66 1.83 6.34 6.34 0 0 0-1.85 4.66 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.33V9.05a8.28 8.28 0 0 0 4.95 1.63V7.24a4.83 4.83 0 0 1-1.0.55z" />
                </svg>
                <span>{isEs ? "Síguenos en TikTok" : "Follow us on TikTok"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section 3: Blog Preview & Categorization */}
        <div className="border-t border-zinc-150 pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                {isEs ? "Blog & Recursos" : "Blog & Resources"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                {isEs ? "Estrategias para Digitalizar y Escalar tu Empresa" : "Playbooks to Grow and Scale Your Business"}
              </h2>
              <p className="text-zinc-500 text-sm mt-2 max-w-2xl">
                {isEs
                  ? "Análisis de costes reales, posicionamiento en Google, inteligencia artificial aplicada y automatización comercial."
                  : "Transparent pricing analysis, Google positioning, applied AI and customer acquisition automation."}
              </p>
            </div>

            <Link
              href="/blog"
              className="px-6 py-3 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
            >
              <span>{isEs ? "Ver todos los artículos del Blog" : "View all Blog Articles"}</span>
              <span>→</span>
            </Link>
          </div>

          {/* Categories Grid Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {blogCategories.filter(c => c.id !== "todos").map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.id}`}
                className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 text-center transition-all hover:shadow-sm group cursor-pointer"
              >
                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors block">
                  {cat.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  {cat.count} {isEs ? "artículos" : "articles"}
                </span>
              </Link>
            ))}
          </div>

          {/* 3 Highlighted Articles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewArticles.map((article) => (
              <article
                key={article.slug}
                className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-zinc-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {article.category.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-black leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10.5px] font-mono text-zinc-400">
                    {article.publishedAt}
                  </span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-xs font-bold text-brand-blue group-hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isEs ? "Leer guía" : "Read guide"}</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
