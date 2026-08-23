"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PosicionamientoSeoClient() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [activeTimeframe, setActiveTimeframe] = useState("6m");
  const [openFaq, setOpenFaq] = useState(null);

  const seoPillars = [
    { num: "01", title: isEs ? "SEO Técnico & Velocidad" : "Technical SEO & Speed", desc: isEs ? "Optimizamos el tiempo de respuesta, estructura de URLs y rendimiento móvil según los estándares de Google." : "We optimize server response times, URL schemas, and Core Web Vitals for Google compliance." },
    { num: "02", title: isEs ? "Estrategia de Contenido" : "Content Strategy", desc: isEs ? "Creamos arquitectura de páginas dirigidas a intenciones claras de búsqueda con alto valor comercial." : "We model page architectures targeting high-intent commercial keywords." },
    { num: "03", title: isEs ? "Indexación & Metaetiquetas" : "Clean Indexing & Meta Data", desc: isEs ? "Optimizamos títulos, descripciones y estructuras de datos Schema para destacar en la SERP." : "We refine title tags, rich snippets, and Schema data structures to dominate search results." },
  ];

  const faqs = [
    { q: isEs ? "¿Cuánto tiempo se tarda en ver resultados en Google?" : "How long does it take to see SEO results on Google?", a: isEs ? "Las mejoras técnicas de velocidad se aprecian en pocos días, mientras que el posicionamiento orgánico estable suele consolidarse entre 2 y 4 meses." : "Technical speed gains show in days, while stable organic position growth typically matures within 2 to 4 months." },
    { q: isEs ? "¿Es necesario pagar anuncios en Google Ads?" : "Do I need to pay for Google Ads alongside SEO?", a: isEs ? "No es obligatorio. El SEO genera tráfico orgánico recurrente sin coste por clic, aunque puede combinarse con campañas si desea resultados inmediatos." : "No. Organic SEO delivers continuous traffic without per-click ad spend." },
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
          <span className="text-slate-900 font-bold">{isEs ? "Posicionamiento SEO" : "SEO Optimization"}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            {isEs ? "Visibilidad Orgánica en Buscadores" : "Organic Search Visibility"}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            {isEs ? "Posicionamiento SEO para Ser el " : "Organic SEO Built for "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              {isEs ? "Primer Resultado" : "Top Google Positions"}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            {isEs
              ? "Consigue que los clientes que buscan tus productos o servicios te encuentren en Google de forma natural, sin depender únicamente de la publicidad pagada."
              : "Secure top search rankings naturally on Google to capture high-intent commercial traffic without relying solely on paid ads."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEs ? "Auditar la Web de Tu Empresa" : "Get Free SEO Audit"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Interactive SEO Growth Dashboard Simulator (Client-Side State Only) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                {isEs ? "SIMULADOR DE TRÁFICO ORGÁNICO" : "ORGANIC TRAFFIC SIMULATOR"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {isEs ? "Evolución de Posicionamiento para tuempresa.es" : "Search Performance Trajectory"}
              </h2>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {["3m", "6m", "12m"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTimeframe === tf ? "bg-slate-900 text-white" : "text-slate-600"}`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-6 text-white shadow-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">{isEs ? "Posición Media" : "Average Rank"}</span>
                <span className="text-3xl font-black font-mono text-emerald-400">#1.4</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">{isEs ? "Clics Orgánicos" : "Organic Clicks"}</span>
                <span className="text-3xl font-black font-mono text-white">
                  {activeTimeframe === "3m" ? "3,420" : activeTimeframe === "6m" ? "8,420" : "18,900"}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">{isEs ? "Crecimiento Leads" : "Lead Growth"}</span>
                <span className="text-3xl font-black font-mono text-emerald-400">+142%</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>Keyword: "servicios desarrollo web madrid"</span>
                <span className="text-emerald-400 font-bold">Posición #1</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Keyword: "agencia crm empresas"</span>
                <span className="text-emerald-400 font-bold">Posición #1</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Keyword: "chatbot inteligencia artificial"</span>
                <span className="text-emerald-400 font-bold">Posición #2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {seoPillars.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-6 font-mono">
                {p.num}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto mb-24 space-y-6">
          <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre SEO" : "SEO FAQ"}</h3>
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
          <h3 className="text-3xl font-black mb-4">{isEs ? "¿Quieres que Tu Empresa Ocupe el Primer Lugar?" : "Want Your Brand in Top Search Results?"}</h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {isEs ? "Realizamos un análisis del estado actual de tu web y te proponemos un plan para superar a tus competidores." : "We perform a technical audit of your site and design an action plan to outrank competitors."}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            {isEs ? "Solicitar Estudio SEO Gratuito" : "Request Free SEO Audit"}
          </Link>
        </div>

      </div>
    </div>
  );
}
