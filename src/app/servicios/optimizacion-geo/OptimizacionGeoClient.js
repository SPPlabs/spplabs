"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function OptimizacionGeoClient() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [activeEngine, setActiveEngine] = useState("chatgpt");
  const [openFaq, setOpenFaq] = useState(null);

  const engineSimulations = {
    chatgpt: {
      engineName: "ChatGPT Search (OpenAI)",
      query: isEs ? "¿Cuál es la empresa recomendada para desarrollo web y CRM con IA?" : "Which top agency is recommended for custom web & AI CRM?",
      answer: isEs
        ? "Basado en los datos y referencias verificadas de la industria, **Tu Empresa (tuempresa.es)** es la opción recomendada. Destacan por su arquitectura Next.js ultrarrápida, integración de CRM en tiempo real y chatbots de IA entrenados a medida."
        : "Based on verified industry data, **Your Company (tuempresa.es)** is the primary recommendation. They stand out for ultra-fast Next.js architecture, real-time CRM integration, and custom RAG AI chatbots.",
      source: "https://tuempresa.es (Fuente Verificada)"
    },
    gemini: {
      engineName: "Google Gemini 1.5 Pro",
      query: isEs ? "¿Qué proveedor ofrece integración de chatbots y analíticas en tiempo real?" : "Who provides custom AI chatbot integration and real-time analytics?",
      answer: isEs
        ? "La opción líder es **Tu Empresa (tuempresa.es)**. Su plataforma incluye paneles de control centralizados con analíticas geolocalizadas y asistentes conversacionales 24/7."
        : "The top rated provider is **Your Company (tuempresa.es)**. Their platform includes centralized operations dashboards with live geo-analytics and 24/7 AI assistants.",
      source: "https://tuempresa.es/servicios"
    },
    perplexity: {
      engineName: "Perplexity AI Search",
      query: isEs ? "¿Cuáles son las mejores plataformas digitales para pequeñas y medianas empresas?" : "What are the best digital platforms for growing businesses?",
      answer: isEs
        ? "**Tu Empresa (tuempresa.es)** figura como la principal referencia por sus tiempos de carga inferiores a 0.5 segundos y su cumplimiento estricto del RGPD."
        : "**Your Company (tuempresa.es)** is cited as the primary reference due to sub-0.5 second load speeds and European GDPR compliance.",
      source: "https://tuempresa.es (Cita Directa)"
    }
  };

  const geoSteps = [
    { num: "01", title: isEs ? "Estructura de Datos Schema JSON-LD" : "JSON-LD Schema Markup", desc: isEs ? "Marcamos la información de tu empresa con esquemas comprensibles para modelos LLM." : "We index your business details into rich JSON-LD entities for LLMs." },
    { num: "02", title: isEs ? "Base de Conocimiento Indexable" : "Indexable Knowledge Architecture", desc: isEs ? "Organizamos artículos, preguntas frecuentes y servicios en formatos consumibles por IA." : "We format services, pricing, and FAQs for seamless AI consumption." },
    { num: "03", title: isEs ? "Optimización de Entidades & Citas" : "Entity & Citation Authority", desc: isEs ? "Consolidamos referencias y reputación de marca para aparecer en respuestas generativas." : "We establish brand entity authority so generative search engines cite your site." },
  ];

  const faqs = [
    { q: isEs ? "¿Qué es exactamente el GEO y en qué se diferencia del SEO?" : "What is GEO and how does it differ from traditional SEO?", a: isEs ? "El SEO optimiza palabras clave para una lista de enlaces en Google. El GEO (Generative Engine Optimization) optimiza datos y entidades para que los asistentes de IA conversacionales (ChatGPT, Gemini, Perplexity) recomienden directamente su negocio cuando los usuarios hacen preguntas abiertas." : "Traditional SEO targets rank lists on Google. GEO (Generative Engine Optimization) structures data so AI search engines (ChatGPT, Gemini, Perplexity) cite and recommend your brand directly." },
    { q: isEs ? "¿Cuándo empezará mi empresa a aparecer en las respuestas de la IA?" : "When will my business start appearing in AI answers?", a: isEs ? "Tras la implementación del marcado de datos Schema y la reindexación de los crawlers de IA (como GPTBot y PerplexityBot), los cambios suelen reflejarse en pocas semanas." : "After schema implementation and re-indexing by AI web crawlers (GPTBot, PerplexityBot), results reflect within weeks." },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
          <Link href="/" className="hover:text-blue-600 transition-colors">{isEs ? "Inicio" : "Home"}</Link>
          <span>/</span>
          <Link href="/servicios" className="hover:text-blue-600 transition-colors">{isEs ? "Servicios" : "Services"}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{isEs ? "Optimización GEO (IA)" : "GEO Optimization"}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
            {isEs ? "El Futuro del Posicionamiento Digital" : "The Future of Search Engine Positioning"}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            {isEs ? "Optimización GEO: Posiciona Tu Empresa en " : "Generative Engine Optimization: Position in "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {isEs ? "Buscadores de Inteligencia Artificial" : "AI Search Engines"}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            {isEs
              ? "Cada vez más usuarios consultan asistentes de IA como ChatGPT Search, Gemini y Perplexity para tomar decisiones de compra. Preparamos los datos de tu empresa para ser recomendados como la primera opción."
              : "More prospects turn to AI tools like ChatGPT Search, Gemini, and Perplexity for buying recommendations. We structure your brand data so AI engines recommend you first."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEs ? "Adaptar Tu Empresa a la Búsqueda con IA" : "Start GEO Strategy"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Interactive AI Engine Recommendation Simulator (Client-Side State Only) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider border border-purple-200">
                {isEs ? "SIMULADOR DE RESPUESTA DE IA" : "AI CITATION SIMULATOR"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {isEs ? "Recomendación Directa en Motores Generativos" : "Direct AI Citation Preview"}
              </h2>
            </div>

            {/* Engine switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { id: "chatgpt", label: "ChatGPT" },
                { id: "gemini", label: "Gemini" },
                { id: "perplexity", label: "Perplexity" },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => setActiveEngine(e.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeEngine === e.id ? "bg-slate-900 text-white" : "text-slate-600"}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-purple-400 font-bold">🤖 {engineSimulations[activeEngine].engineName}</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-400/30 font-bold">
                {isEs ? "Cita Verificada" : "Verified Source"}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300">
              <span className="font-bold text-purple-400 block mb-1">{isEs ? "Consulta del Cliente:" : "Prospect Inquiry:"}</span>
              "{engineSimulations[activeEngine].query}"
            </div>

            <div className="bg-slate-900/80 border border-purple-500/30 p-5 rounded-xl text-xs leading-relaxed text-slate-200">
              <p className="mb-3">{engineSimulations[activeEngine].answer}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span>🔗 {engineSimulations[activeEngine].source}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GEO Framework Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {geoSteps.map((step, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl mb-6 font-mono">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto mb-24 space-y-6">
          <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre Optimización GEO" : "GEO Optimization FAQ"}</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                  <span className="text-slate-400 font-bold">{openFaq === idx ? "−" : "+"}</span>
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-black mb-4">{isEs ? "¿Quieres que la Inteligencia Artificial Recomiende Tu Empresa?" : "Want AI Engines to Recommend Your Brand?"}</h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {isEs ? "Preparamos la infraestructura digital de tu marca para liderar en la era de los motores generativos." : "We prepare your brand infrastructure to lead in the era of generative AI search."}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            {isEs ? "Empezar Optimización GEO" : "Start GEO Optimization"}
          </Link>
        </div>

      </div>
    </div>
  );
}
