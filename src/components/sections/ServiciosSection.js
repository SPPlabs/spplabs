"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ServiciosSection() {
  const { lang } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
            {lang === "es" ? "Soluciones de Ingeniería" : "Engineering Solutions"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-3 leading-tight">
            {lang === "es" ? "Servicios Tecnológicos de Alto Rendimiento" : "High-Performance Tech Services"}
          </h2>
          <p className="text-zinc-650 mt-4 text-base md:text-lg leading-relaxed">
            {lang === "es" 
              ? "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio." 
              : "We engineer customized web applications, data analytics layers, and smart AI agents designed to secure and accelerate your business operations."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1: Premium Web Development */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-blue transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Desarrollo Web Premium" : "Premium Web Development"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "Aplicaciones a medida desarrolladas con Next.js y React. Entregamos plataformas rápidas, seguras, completamente adaptativas y listas para conectarse a sus bases de datos en tiempo real." 
                  : "Custom applications built with Next.js and React. We deliver blazing-fast, secure, fully responsive platforms connected to live transactional operations."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">React • Next.js • SSR</span>
              <Link href="/servicios/desarrollo-web" className="text-xs font-black text-black hover:text-brand-blue transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Service 2: SEO */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-green transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Posicionamiento SEO" : "SEO Optimization"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "Optimización avanzada para buscadores tradicionales. Estructura semántica, velocidad de carga óptima en móviles, indexación limpia de URLs y estructuración de meta tags para mejorar el alcance orgánico de su negocio." 
                  : "Advanced index tuning for search engines. Semantic code design, fast mobile load speeds, clean URL maps, and optimized meta configurations to lift your brand’s organic reach."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Speed • Search • Meta</span>
              <Link href="/servicios/posicionamiento-seo" className="text-xs font-black text-black hover:text-brand-green transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Service 3: GEO */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-black transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Optimización GEO (Generative Engine Optimization)" : "Generative Engine Optimization (GEO)"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "El SEO del futuro. Preparamos sus datos, artículos y documentación web para ser correctamente citados y leídos por motores de búsqueda de IA como ChatGPT Search, Gemini y Perplexity, aumentando su relevancia en IA." 
                  : "SEO built for the AI era. We format, schema, and reference your business databases so large AI systems (Gemini, Perplexity, ChatGPT) extract and display your brand as the primary reference."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-black uppercase tracking-wider">AI Search • LLM • Citations</span>
              <Link href="/servicios/optimizacion-geo" className="text-xs font-black text-black hover:text-purple-600 transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Service 4: CRM */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-blue transition-all duration-300 group hover:shadow-lg flex flex-col justify-between ring-2 ring-blue-500/20">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Sistemas CRM y Panel de Control" : "CRM & Operations Dashboard"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "Conectamos formularios, reservas e historiales de clientes directamente en un panel administrativo privado con analíticas en tiempo real para optimizar su embudo comercial." 
                  : "Centralize customer forms, scheduler slots, and support history directly into an optimized operations panel."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">CRM • Analytics • Pipeline</span>
              <Link href="/servicios/crm-dashboard" className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Service 5: AI Chatbot */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-brand-green transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Chatbot de IA 24/7" : "24/7 Custom AI Chatbot"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "Un asistente de inteligencia artificial entrenado con los datos de su empresa para contestar al instante cualquier consulta técnica o comercial las 24 horas del día." 
                  : "Deploy dynamic chat agents trained on your documentation, resolving support tickets instantly 24 hours a day."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">RAG • 24/7 AI • Leads</span>
              <Link href="/servicios/chatbot-ia" className="text-xs font-black text-black hover:text-emerald-600 transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>

          {/* Service 6: Booking System */}
          <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 hover:border-black transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{lang === "es" ? "Sistema de Reservas y Contacto" : "Contact & Booking Scheduler"}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {lang === "es" 
                  ? "Agendador interactivo de reuniones y llamadas comerciales. Bloquea dinámicamente horas ocupadas y sincroniza eventos de forma segura." 
                  : "An interactive call scheduling platform. Disables fully booked days, synchronizes with email notifications, and streams scheduled calls directly to your logs."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs font-bold text-black uppercase tracking-wider">Calendar • Slots • Booking</span>
              <Link href="/servicios/sistema-reservas" className="text-xs font-black text-black hover:text-indigo-600 transition-colors flex items-center gap-1">
                {lang === "es" ? "Ver detalles →" : "Explore →"}
              </Link>
            </div>
          </div>
        </div>

        {/* services cta */}
        <div className="mt-20 border border-zinc-200 rounded-3xl p-12 text-center bg-zinc-50/50 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full"></div>
          <h3 className="text-2xl font-black text-black mb-3">{lang === "es" ? "¿Listo para escalar su infraestructura?" : "Ready to scale your digital workflow?"}</h3>
          <p className="text-sm text-zinc-650 mb-8 max-w-xl mx-auto">
            {lang === "es"
              ? "Programe una consulta con nosotros para diseñar un proyecto adaptado a las métricas y objetivos de su empresa."
              : "Schedule a session with our engineering founders to map out a technical implementation plan for your site."}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 h-12 text-sm font-bold bg-black text-white rounded-lg hover:bg-brand-blue transition-colors duration-300 cursor-pointer shadow-md"
          >
            {lang === "es" ? "Programar Consulta" : "Book Consultation Now"}
          </Link>
        </div>
      </div>
    </section>
  );
}
