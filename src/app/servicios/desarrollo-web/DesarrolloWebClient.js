"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function DesarrolloWebClient() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [simulatedDevice, setSimulatedDevice] = useState("desktop");
  const [openFaq, setOpenFaq] = useState(null);

  const techStack = [
    { name: "Next.js 16 (App Router)", desc: isEs ? "Renderizado ultra rápido en servidor (SSR/ISR) y optimización nativa de imágenes." : "Blazing fast server rendering (SSR/ISR) with native image optimization." },
    { name: "React 19 & Server Components", desc: isEs ? "Código desacoplado y reactividad instantánea sin sobrecargar el navegador." : "Decoupled architecture and instant reactivity without client bloat." },
    { name: "Tailwind CSS & Mobile First", desc: isEs ? "Estilos extremadamente ligeros adaptados a cualquier pantalla táctil." : "Lightweight, responsive utility styles tailored for every touchscreen." },
    { name: "Edge CDN & Global Cache", desc: isEs ? "Servidores de distribución global para cargas en menos de 0.5 segundos." : "Global distribution network guaranteeing sub-0.5 second load times." },
  ];

  const processSteps = [
    { num: "01", title: isEs ? "Análisis de Requisitos" : "Requirements Audit", text: isEs ? "Estudiamos la marca, estructura de navegación y objetivos de conversión." : "We study your brand goals, site architecture, and conversion funnels." },
    { num: "02", title: isEs ? "Diseño UX/UI & Prototipado" : "UX/UI Prototyping", text: isEs ? "Creamos un diseño moderno, intuitivo y optimizado para captación." : "We design clean, intuitive interfaces engineered for maximum sales conversion." },
    { num: "03", title: isEs ? "Desarrollo Frontend & Backend" : "Frontend & Integration", text: isEs ? "Programamos la web con estándares modernos de seguridad y velocidad." : "We code standard-compliant, secure web applications integrated with APIs." },
    { num: "04", title: isEs ? "Despliegue & Analíticas" : "Launch & Optimization", text: isEs ? "Publicamos la web en CDN de alta velocidad y configuramos analíticas." : "We push to global CDN edge infrastructure with real-time analytics active." },
  ];

  const faqs = [
    { q: isEs ? "¿Cuánto tarda en desarrollarse una web completa?" : "How long does custom web development take?", a: isEs ? "Un proyecto web completo suele entregarse entre 1 y 3 semanas, incluyendo diseño, pruebas y optimización." : "A complete web project is typically delivered in 1 to 3 weeks, including prototyping, testing, and launch." },
    { q: isEs ? "¿La web estará adaptada a teléfonos móviles?" : "Will the site be optimized for mobile phones?", a: isEs ? "Por supuesto. El 100% de nuestros desarrollos se crean bajo el concepto 'Mobile First', asegurando una experiencia perfecta en smartphones." : "Absolutely. 100% of our code is built Mobile-First to guarantee a fluid mobile experience." },
    { q: isEs ? "¿Incluye optimización para buscadores (SEO)?" : "Is search engine optimization (SEO) included?", a: isEs ? "Sí, entregamos la web con la arquitectura técnica SEO lista: metaetiquetas, mapas de sitio XML, tiempos de carga mínimos y semántica HTML5." : "Yes, every build includes technical SEO foundations: XML sitemaps, fast load times, meta tags, and semantic HTML5." },
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
          <span className="text-slate-900 font-bold">{isEs ? "Desarrollo Web Premium" : "Web Development"}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            {isEs ? "Velocidad & Conversión Garantizada" : "Speed & High Conversion"}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            {isEs ? "Desarrollo Web Premium Creado para " : "Premium Web Development Built to "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {isEs ? "Captar Clientes" : "Convert Prospects"}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            {isEs
              ? "Transformamos la presencia digital de tu empresa en un canal comercial activo. Creamos páginas ultra rápidas, adaptadas a móviles y diseñadas para convertir visitas en clientes reales."
              : "Transform your digital footprint into an active sales asset. We engineer ultra-fast, mobile-optimized web applications built for business growth."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEs ? "Solicitar Presupuesto Web" : "Get Web Proposal"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Interactive Live Speed & Performance Test Simulator */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                {isEs ? "SIMULADOR DE RENDIMIENTO EN VIVO" : "LIVE PERFORMANCE SIMULATOR"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {isEs ? "Demostración de Carga Instantánea" : "Instant Loading Demonstration"}
              </h2>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSimulatedDevice("desktop")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${simulatedDevice === "desktop" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                💻 Desktop
              </button>
              <button
                onClick={() => setSimulatedDevice("mobile")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${simulatedDevice === "mobile" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                📱 Mobile
              </button>
            </div>
          </div>

          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">{isEs ? "Rendimiento" : "Performance"}</span>
              <span className="text-3xl font-black font-mono text-emerald-600">100/100</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase block">{isEs ? "Tiempo Carga" : "Load Speed"}</span>
              <span className="text-3xl font-black font-mono text-blue-600">0.38s</span>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-indigo-800 uppercase block">FCP</span>
              <span className="text-3xl font-black font-mono text-indigo-600">0.2s</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-purple-800 uppercase block">SEO Score</span>
              <span className="text-3xl font-black font-mono text-purple-600">100%</span>
            </div>
          </div>

          {/* Simulated Live Web Viewport */}
          <div className={`mx-auto bg-slate-950 rounded-2xl p-4 text-white shadow-xl transition-all duration-300 ${simulatedDevice === "mobile" ? "max-w-xs" : "max-w-3xl"}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-[10px] font-mono text-slate-400 ml-2">https://tuempresa.es</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">⚡ SSL FAST</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">{isEs ? "DISEÑO PREMIUM A MEDIDA" : "CUSTOM PREMIUM DESIGN"}</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">{isEs ? "Impulsa la Presencia Digital de Tu Empresa" : "Power Your Brand Online Presence"}</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {isEs ? "Interfaz fluida, llamadas a la acción instantáneas y conexión directa a tu CRM." : "Fluid UI, instant action triggers, and seamless backend CRM integration."}
              </p>
              <div className="pt-2">
                <span className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl inline-block shadow-md">
                  {isEs ? "Probar Demo" : "Test Live Demo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
              {isEs ? "ARQUITECTURA TÉCNICA" : "TECH ARCHITECTURE"}
            </span>
            <h2 className="text-3xl font-black text-slate-950">{isEs ? "¿Por Qué Nuestras Webs Son Más Rápidas?" : "Why Our Web Applications Perform Better"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((tech, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                  0{idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{tech.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Process Timeline */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-24 shadow-2xl">
          <h3 className="text-2xl font-black mb-8 text-center">{isEs ? "Metodología de Desarrollo en 4 Fases" : "4-Step Development Process"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl">
                <span className="text-2xl font-black font-mono text-blue-400 block mb-2">{step.num}</span>
                <h4 className="font-bold text-white text-base mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto mb-24 space-y-6">
          <h3 className="text-2xl font-black text-center text-slate-950">{isEs ? "Preguntas Frecuentes sobre Desarrollo Web" : "Web Development FAQ"}</h3>
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
          <h3 className="text-3xl font-black mb-4">{isEs ? "¿Preparado para Renovar la Web de Tu Empresa?" : "Ready to Build Your Custom Web App?"}</h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {isEs ? "Cuéntanos tu proyecto y diseñaremos una propuesta a medida para potenciar tu presencia en internet." : "Tell us about your project and we will design a proposal tailored to your business."}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            {isEs ? "Pedir Presupuesto Sin Compromiso" : "Request Custom Proposal"}
          </Link>
        </div>

      </div>
    </div>
  );
}
