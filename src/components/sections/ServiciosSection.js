"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ServiciosSection() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const isEs = lang === "es";

  const categories = [
    { id: "all", label: isEs ? "Todos los Servicios" : "All Services" },
    { id: "dev", label: isEs ? "Desarrollo & CRM" : "Development & CRM" },
    { id: "ai", label: isEs ? "Inteligencia Artificial" : "Artificial Intelligence" },
    { id: "growth", label: isEs ? "SEO & Posicionamiento" : "SEO & Growth" },
  ];

  const services = [
    {
      id: "desarrollo-web",
      category: "dev",
      title: isEs ? "Desarrollo Web Premium" : "Premium Web Development",
      description: isEs
        ? "Aplicaciones a medida desarrolladas con Next.js y React. Entregamos plataformas ultrarrápidas, seguras, totalmente adaptadas a móviles y listas para convertir visitas en clientes."
        : "Custom applications engineered with Next.js and React. We build blazing-fast, secure, mobile-optimized platforms designed to turn visitors into customers.",
      tags: ["React", "Next.js", "SSR", "Edge CDN"],
      badge: isEs ? "Rendimiento 100/100" : "100/100 Performance",
      color: "blue",
      href: "/servicios/desarrollo-web",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "crm-dashboard",
      category: "dev",
      title: isEs ? "Sistemas CRM y Panel de Control" : "CRM & Operations Dashboard",
      description: isEs
        ? "Centralice formularios de clientes, reservas automáticas, analíticas de tráfico e historial de soporte en una sola plataforma privada y fácil de usar."
        : "Centralize customer form submissions, automated booking slots, traffic analytics, and support history into a secure private operations hub.",
      tags: ["CRM", "Analytics", "Lead Pipeline", "Real-Time"],
      badge: isEs ? "Gestión Todo-En-Uno" : "All-in-One Hub",
      color: "blue",
      href: "/servicios/crm-dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "chatbot-ia",
      category: "ai",
      title: isEs ? "Chatbot de IA 24/7" : "24/7 Custom AI Chatbot",
      description: isEs
        ? "Un asistente inteligente entrenado exclusivamente con los datos y catálogos de su empresa para resolver dudas comerciales y captar clientes las 24 horas del día."
        : "Deploy intelligent AI chat agents trained on your business data to resolve inquiries instantly and convert prospects 24 hours a day.",
      tags: ["RAG AI", "Captación Leads", "Respuestas 24/7"],
      badge: isEs ? "Atención Automatizada" : "Automated Sales",
      color: "emerald",
      href: "/servicios/chatbot-ia",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "optimizacion-geo",
      category: "ai",
      title: isEs ? "Optimización GEO (Buscadores de IA)" : "GEO (Generative Engine Optimization)",
      description: isEs
        ? "Estructuramos la información de su negocio para que ChatGPT Search, Gemini y Perplexity lo citen y recomienden como primera opción a los usuarios."
        : "Format and optimize your business data so large generative AI engines (Gemini, Perplexity, ChatGPT) cite and recommend your brand first.",
      tags: ["AI Search", "Perplexity", "ChatGPT", "JSON-LD"],
      badge: isEs ? "SEO del Futuro" : "Next-Gen Search",
      color: "purple",
      href: "/servicios/optimizacion-geo",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: "posicionamiento-seo",
      category: "growth",
      title: isEs ? "Posicionamiento SEO Orgánico" : "Organic SEO Optimization",
      description: isEs
        ? "Optimización técnica y de contenido para lograr las primeras posiciones en Google sin depender exclusivamente de campañas de publicidad pagada."
        : "Comprehensive technical and content optimization to secure top organic rankings on Google and attract high-intent leads consistently.",
      tags: ["Google #1", "Core Vitals", "Tráfico Orgánico"],
      badge: isEs ? "Tráfico Recurrente" : "High Intent Leads",
      color: "emerald",
      href: "/servicios/posicionamiento-seo",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: "sistema-reservas",
      category: "dev",
      title: isEs ? "Sistema de Reservas y Citas" : "Contact & Booking System",
      description: isEs
        ? "Permita que sus clientes reserven citas comerciales o reuniones directamente desde su web en franjas disponibles sin llamadas ni errores de agenda."
        : "Allow prospects to schedule consultations directly from your website in open time slots without back-and-forth emails or phone calls.",
      tags: ["Calendario", "Sincronización", "Confirmación Email"],
      badge: isEs ? "Agenda Automatizada" : "Zero Friction",
      color: "indigo",
      href: "/servicios/sistema-reservas",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "booster-resenas",
      category: "growth",
      title: isEs ? "Booster de Reseñas de Google & Email" : "Google Reviews & Email Booster",
      description: isEs
        ? "Multiplique sus valoraciones de 5 estrellas en Google Maps y envíe recordatorios de cita automáticos por email para fidelizar y eliminar ausencias."
        : "Generate continuous 5-star Google Maps reviews and send automated email reminders to reduce no-shows and build local authority.",
      tags: ["Google Maps ⭐", "Reseñas 5★", "Email Lifecycle", "Anti No-Show"],
      badge: isEs ? "+350% Más Reseñas" : "+350% More Reviews",
      color: "amber",
      href: "/servicios/booster-resenas",
      icon: (
        <svg
          className="w-6 h-6 text-amber-400"
          viewBox="0 0 24 24"
          fill="white"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(s => s.category === selectedCategory);

  const steps = [
    {
      number: "01",
      title: isEs ? "Auditoría y Diagnóstico" : "Audit & Assessment",
      desc: isEs
        ? "Analizamos la situación actual de su negocio, infraestructura web y embudo de conversión para identificar oportunidades clave."
        : "We inspect your business workflow, technical stack, and conversion path to uncover immediate growth opportunities.",
    },
    {
      number: "02",
      title: isEs ? "Diseño y Arquitectura" : "Design & Architecture",
      desc: isEs
        ? "Definimos la arquitectura de datos, interfaz de usuario y componentes inteligentes adaptados a las métricas de su empresa."
        : "We model tailored data architectures, high-converting interfaces, and AI tools built for your specific metrics.",
    },
    {
      number: "03",
      title: isEs ? "Integración y Pruebas" : "Integration & Testing",
      desc: isEs
        ? "Desarrollamos el código, conectamos el CRM o Chatbot e implementamos pruebas rigurosas de rendimiento y seguridad."
        : "We engineer clean code, integrate custom tools or AI agents, and run rigorous performance and security tests.",
    },
    {
      number: "04",
      title: isEs ? "Despliegue y Escalabilidad" : "Deployment & Growth",
      desc: isEs
        ? "Lanzamos su proyecto en servidores de alta velocidad con monitorización continua y optimización post-lanzamiento."
        : "We deploy on global high-speed edge infrastructure with continuous monitoring and proactive optimizations.",
    },
  ];

  const faqs = [
    {
      q: isEs ? "¿Cuánto tiempo toma implementar un servicio?" : "How long does implementation take?",
      a: isEs
        ? "Dependiendo de la complejidad, la mayoría de nuestros desarrollos web, integración de CRM y chatbots de IA se despliegan en un plazo de 1 a 3 semanas."
        : "Depending on project scope, most custom web developments, CRM setups, and AI chatbot integrations are deployed within 1 to 3 weeks.",
    },
    {
      q: isEs ? "¿Puedo integrar el CRM y el Chatbot en una web existente?" : "Can I integrate the CRM and Chatbot into an existing site?",
      a: isEs
        ? "Sí, nuestras herramientas son modulares y pueden conectarse fácilmente a su sitio web actual mediante código ligero sin interrumpir su operación."
        : "Yes, our modular systems seamlessly integrate into existing platforms via lightweight code snippets without disrupting live operations.",
    },
    {
      q: isEs ? "¿Cómo se entrena el chatbot de Inteligencia Artificial?" : "How is the custom AI chatbot trained?",
      a: isEs
        ? "Cargamos los datos, catálogos, preguntas frecuentes y documentación de su empresa en el panel de control. El chatbot aprende en minutos y usted puede actualizar su conocimiento cuando lo desee."
        : "We index your company FAQs, product catalogs, and service guides into your dashboard. The AI updates in minutes and can be modified anytime.",
    },
    {
      q: isEs ? "¿Qué diferencia al SEO tradicional de la Optimización GEO?" : "What is the difference between traditional SEO and GEO?",
      a: isEs
        ? "El SEO optimiza su web para la lista de resultados de Google. La Optimización GEO (Generative Engine Optimization) estructura sus datos para que buscadores conversacionales de IA (ChatGPT, Gemini, Perplexity) recomienden su empresa cuando los usuarios hacen preguntas abiertas."
        : "Traditional SEO targets rank lists on Google. GEO (Generative Engine Optimization) structures your data so AI search engines (ChatGPT, Gemini, Perplexity) recommend your brand directly in conversational answers.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-4 py-1.5 rounded-full inline-block font-mono shadow-2xs">
            {isEs ? "Soluciones de Ingeniería Digital" : "Digital Engineering Solutions"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            {isEs ? "Servicios Tecnológicos para Escalar Tu Empresa" : "High-Performance Engineering Services"}
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
            {isEs
              ? "Diseñamos aplicaciones web, arquitecturas analíticas, paneles CRM y asistentes de IA diseñados para acelerar la captación de clientes y asegurar la operación digital de su negocio."
              : "We build custom web platforms, real-time CRM layers, and custom AI agents designed to automate operations and drive revenue."}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex-wrap justify-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="border border-slate-200/90 bg-slate-50/40 rounded-3xl p-8 hover:border-slate-400 transition-all duration-300 group hover:shadow-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-950 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  {service.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SPP Labs</span>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-900 bg-white border border-slate-200 shadow-2xs hover:bg-slate-950 hover:text-white hover:border-slate-950 hover:shadow-md transition-all duration-300 group/btn cursor-pointer active:scale-95"
                  >
                    <span>{isEs ? "Saber más" : "Learn more"}</span>
                    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metodología de Trabajo / Process Section */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 mb-24 relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full inline-block">
              {isEs ? "Nuestra Metodología" : "Our Process"}
            </span>
            <h3 className="text-3xl font-black">{isEs ? "¿Cómo Trabajamos con Tu Empresa?" : "How We Implement Solutions"}</h3>
            <p className="text-slate-400 text-sm">{isEs ? "Un proceso estructurado en 4 fases para garantizar resultados rápidos y seguros." : "A structured 4-step execution plan ensuring precision and speed."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
                <span className="text-3xl font-black font-mono text-blue-400 block mb-4">{step.number}</span>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto mb-24 space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
              FAQ
            </span>
            <h3 className="text-3xl font-black text-slate-950">
              {isEs ? "Preguntas Frecuentes sobre Nuestros Servicios" : "Frequently Asked Questions"}
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 cursor-pointer transition-all hover:bg-white hover:shadow-md"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</h4>
                  <span className="text-slate-400 font-bold text-lg">{openFaqIndex === idx ? "−" : "+"}</span>
                </div>
                {openFaqIndex === idx && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="border border-slate-200 rounded-3xl p-8 sm:p-12 text-center bg-slate-50/70 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-full pointer-events-none"></div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3">
            {isEs ? "¿Listo para Impulsar Tu Proyecto Digital?" : "Ready to scale your digital operations?"}
          </h3>
          <p className="text-sm text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
            {isEs
              ? "Agende una sesión técnica con nuestro equipo para diseñar un plan a medida según las necesidades de su empresa."
              : "Book a consultation session to map out an engineering plan tailored to your targets."}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-extrabold bg-slate-950 text-white rounded-2xl hover:bg-blue-600 transition-colors duration-300 cursor-pointer shadow-md active:scale-98"
          >
            {isEs ? "Solicitar Consulta Gratuita" : "Schedule Free Consultation"}
          </Link>
        </div>

      </div>
    </section>
  );
}
