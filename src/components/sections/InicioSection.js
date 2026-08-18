"use client";

import Link from "next/link";
import Image from "next/image";
import { SppLabsLogo } from "@/components/SppLabsLogo";
import { InlineChatbot } from "@/components/chatbot/InlineChatbot";
import { useLanguage } from "@/context/LanguageContext";

export default function InicioSection() {
  const { lang } = useLanguage();

  // Simulated metrics for the interactive dashboard mockup
  const metrics = {
    throughput: {
      title: lang === "es" ? "Rendimiento de Red" : "Network Throughput",
      value: "1,248.4 Mb/s",
      change: lang === "es" ? "+14.2% desde la última hora" : "+14.2% from last hour",
      isPositive: true,
      color: "blue",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,100 L50,110 L100,85 L150,90 L200,60 L250,75 L300,45 L350,55 L400,30 L450,42 L500,20" />
          <path d="M0,100 L50,110 L100,85 L150,90 L200,60 L250,75 L300,45 L350,55 L400,30 L450,42 L500,20 L500,150 L0,150 Z" fill="url(#blueGrad)" stroke="none" />
          <circle cx="500" cy="20" r="6" fill="#2563eb" className="animate-ping" />
          <circle cx="500" cy="20" r="4" fill="#2563eb" />
        </svg>
      )
    },
    cpu: {
      title: lang === "es" ? "Uso de CPU" : "CPU Utilization",
      value: "42.8%",
      change: lang === "es" ? "-5.3% desde la última hora" : "-5.3% from last hour",
      isPositive: true,
      color: "green",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-brand-green" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,130 L50,120 L100,125 L150,80 L200,95 L250,70 L300,50 L350,85 L400,60 L450,48 L500,40" />
          <path d="M0,130 L50,120 L100,125 L150,80 L200,95 L250,70 L300,50 L350,85 L400,60 L450,48 L500,40 L500,150 L0,150 Z" fill="url(#greenGrad)" stroke="none" />
          <circle cx="500" cy="40" r="6" fill="#10b981" className="animate-ping" />
          <circle cx="500" cy="40" r="4" fill="#10b981" />
        </svg>
      )
    },
    latency: {
      title: lang === "es" ? "Tiempo de Respuesta API" : "API Response Time",
      value: "14ms",
      change: lang === "es" ? "+0.4% desde la última hora" : "+0.4% from last hour",
      isPositive: false,
      color: "black",
      svgPath: (
        <svg viewBox="0 0 500 150" className="w-full h-40 text-black" fill="none" stroke="currentColor" strokeWidth="3">
          <defs>
            <linearGradient id="blackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0,45 L50,42 L100,40 L150,43 L200,41 L250,38 L300,40 L350,42 L400,39 L450,41 L500,40" />
          <path d="M0,45 L50,42 L100,40 L150,43 L200,41 L250,38 L300,40 L350,42 L400,39 L450,41 L500,40 L500,150 L0,150 Z" fill="url(#blackGrad)" stroke="none" />
          <circle cx="500" cy="40" r="6" fill="#000000" className="animate-ping" />
          <circle cx="500" cy="40" r="4" fill="#000000" />
        </svg>
      )
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 md:py-32 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-bold bg-white mb-6 shadow-sm">
                <span className="text-brand-blue">IA</span>
                <span className="text-zinc-350">•</span>
                <span className="text-cyan-500">WEB</span>
                <span className="text-zinc-350">•</span>
                <span className="text-brand-blue">SEO</span>
                <span className="text-zinc-350">•</span>
                <span className="text-brand-green">CRM</span>
                <span className="text-zinc-350">•</span>
                <span className="text-yellow-400 font-extrabold">RESEÑAS</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] mb-8 lowercase font-sans">
                {lang === "es" ? (
                  <>
                    convierte <br className="hidden sm:inline" />
                    visitas en{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
                      clientes
                    </span>
                  </>
                ) : (
                  <>
                    convert <br className="hidden sm:inline" />
                    visits into{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
                      clients
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-base sm:text-lg text-zinc-650 max-w-xl leading-relaxed mb-10">
                {lang === "es"
                  ? "Fusión perfecta entre diseño web premium, posicionamiento estratégico y asistencia inteligente. Atrae más tráfico, automatiza tus reservas y domina tus métricas con la suite todo en uno de SPP Labs."
                  : "Perfect fusion between premium web design, strategic positioning, and intelligent assistance. Attract more traffic, automate your bookings, and master your metrics with the all-in-one suite of SPP Labs."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                <Link
                  href="/contacto"
                  className="btn-donate cursor-pointer inline-flex items-center justify-center font-semibold w-full sm:w-auto"
                  id="hero-primary-cta"
                >
                  {lang === "es" ? "Contactar" : "Contact Us"}
                </Link>
                <div className="prueba-gratis-styled-wrapper w-full sm:w-auto">
                  <div className="container">
                    <button
                      className="button w-full sm:w-auto"
                      id="hero-secondary-cta"
                      onClick={() => {
                        const el = document.getElementById("prueba-gratis");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        } else {
                          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                        }
                      }}
                    >
                      Prueba Gratis
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom feature badges */}
              <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-zinc-150/60 w-full flex flex-wrap items-center justify-start gap-x-4 sm:gap-x-6 gap-y-3 text-zinc-600">
                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Chatbot IA</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Web Premium</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>SEO + GEO</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue-dark shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Reservas</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>CRM</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-bold tracking-wide shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>Reseñas</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Mockup */}
            <div className="lg:col-span-6 relative w-full flex items-center justify-center py-4 lg:py-0">
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-gradient-to-r from-brand-blue/25 via-cyan-400/25 to-brand-green/25 blur-2xl rounded-full pointer-events-none -z-10"></div>
              
              <div className="relative w-full max-w-2xl flex items-center justify-center">
                <Image
                  src="/foto_inicio_portatil_movil.webp"
                  alt="SPP Labs Dispositivos Portátil y Móvil"
                  width={800}
                  height={445}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 672px, 672px"
                  priority={true}
                  className="w-full h-auto object-contain mix-blend-multiply transition-transform duration-500 hover:scale-[1.02] block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Chatbot Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-[94rem] mx-auto px-6">
          <InlineChatbot />
          
          {/* 5 Service Cards with Floating Holographic Numbers */}
          <div className="mt-24">
            {/* Section Header matching Soluciones design */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-zinc-200 bg-white shadow-xs mb-5">
                <span className="text-xs font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-green">
                  {lang === "es" ? "SOLUCIONES COMPLETAS" : "COMPLETE SOLUTIONS"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.15] mb-5 font-sans">
                {lang === "es" ? (
                  <>
                    Todo lo que tu negocio necesita <br className="hidden sm:inline" />
                    para{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-green">
                      crecer
                    </span>
                  </>
                ) : (
                  <>
                    Everything your business needs <br className="hidden sm:inline" />
                    to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-green">
                      grow
                    </span>
                  </>
                )}
              </h2>

              <p className="text-zinc-500 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
                {lang === "es"
                  ? "Combinamos diseño, tecnología e inteligencia artificial para ofrecerte una solución 360°."
                  : "We combine design, technology, and artificial intelligence to deliver a 360° solution."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6 justify-items-center">
              {/* Card 1 */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">1</div>
                    <div className="card-6__layer card-6__layer--mid">1</div>
                    <div className="card-6__layer card-6__layer--front">1</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-brand-green text-2xl mb-4">
                        <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "Desarrollo Web" : "Web Development"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Sitios Next.js interactivos y responsivos, con velocidad de carga optimizada y soporte transaccional nativo."
                          : "Interactive, fast Next.js applications featuring optimized runtime performance and database pipelines."}
                      </p>
                    </div>
                    <span className="text-brand-green text-[9px] uppercase font-bold tracking-wider">01 // Front-End</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">2</div>
                    <div className="card-6__layer card-6__layer--mid">2</div>
                    <div className="card-6__layer card-6__layer--front">2</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-brand-green text-2xl mb-4">
                        <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "Optimización SEO y GEO" : "SEO & GEO Optimization"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Indexación orgánica en Google (SEO) y estructura de datos optimizada (GEO) para ser recomendados por motores de IA como Perplexity y ChatGPT."
                          : "Increase organic search visibility on Google and structure your data (GEO) to be cited by AI engines like ChatGPT and Perplexity."}
                      </p>
                    </div>
                    <span className="text-brand-blue text-[9px] uppercase font-bold tracking-wider">02 // SEO & GEO</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">3</div>
                    <div className="card-6__layer card-6__layer--mid">3</div>
                    <div className="card-6__layer card-6__layer--front">3</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-brand-green text-2xl mb-4">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "CRM" : "CRM"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Gestión centralizada de clientes y contactos, seguimiento de leads y analíticas."
                          : "Centralized client and contact management, lead tracking, and analytics."}
                      </p>
                    </div>
                    <span className="text-purple-400 text-[9px] uppercase font-bold tracking-wider">03 // CRM & Leads</span>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">4</div>
                    <div className="card-6__layer card-6__layer--mid">4</div>
                    <div className="card-6__layer card-6__layer--front">4</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-brand-green text-2xl mb-4">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "Agente de IA 24/7" : "24/7 AI Chatbot"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Modelos RAG locales entrenados con sus manuales de negocio, respondiendo de inmediato a peticiones comerciales."
                          : "Private RAG chatbot instances trained on your documents, executing query responses locally with zero data leak."}
                      </p>
                    </div>
                    <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-wider">04 // Support</span>
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">5</div>
                    <div className="card-6__layer card-6__layer--mid">5</div>
                    <div className="card-6__layer card-6__layer--front">5</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-cyan-400 text-2xl mb-4">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "Sistema de Reservas y Contacto" : "Booking & Contact System"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Gestión automatizada de citas en tiempo real y recepción directa de clientes potenciales integrados con CRM."
                          : "Automated real-time appointment scheduling and instant lead capture integrated into your CRM."}
                      </p>
                    </div>
                    <span className="text-cyan-400 text-[9px] uppercase font-bold tracking-wider">05 // Bookings & Leads</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Google Reviews & Email Booster */}
              <div className="flex flex-col items-center">
                <div className="card-6" aria-hidden="true">
                  <div className="card-6__holo">
                    <div className="card-6__layer card-6__layer--back">6</div>
                    <div className="card-6__layer card-6__layer--mid">6</div>
                    <div className="card-6__layer card-6__layer--front">6</div>
                  </div>
                </div>
                
                <div className="service-card">
                  <div className="service-card-inner p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="text-amber-400 mb-4">
                        <svg
                          className="w-8 h-8 text-amber-400"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <h4 className="text-white text-base font-extrabold mb-2">
                        {lang === "es" ? "Aumenta tus Reseñas en Google" : "Boost Your Google Reviews"}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {lang === "es"
                          ? "Multiplica tus valoraciones de 5 estrellas en Google Maps y envía recordatorios automáticos por email tras cada contacto o cita."
                          : "Automate 5-star Google Maps review requests and smart email booking reminders on autopilot."}
                      </p>
                    </div>
                    <span className="text-amber-400 text-[9px] uppercase font-bold tracking-wider">06 // Reseñas & Email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Todo en Uno Section */}
      <section className="py-20 md:py-28 bg-white border-b border-zinc-100 overflow-hidden">
        <div className="max-w-[94rem] mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Copy & Checklist */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-white shadow-xs mb-6">
                <span className="text-xs font-black uppercase tracking-wider text-brand-blue">DASHBOARD</span>
                <span className="text-xs font-black uppercase tracking-wider text-brand-green">TODO EN UNO</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-[1.12] mb-8 font-sans">
                {lang === "es" ? (
                  <>
                    Gestiona y mide <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-green">
                      todo desde un solo lugar
                    </span>
                  </>
                ) : (
                  <>
                    Manage and measure <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-green">
                      everything from one place
                    </span>
                  </>
                )}
              </h2>

              <ul className="space-y-4 mb-10 w-full text-zinc-850 font-semibold text-base sm:text-lg">
                {[
                  lang === "es" ? "Panel de control intuitivo" : "Intuitive control panel",
                  lang === "es" ? "Estadísticas en tiempo real" : "Real-time statistics",
                  lang === "es" ? "Clientes y leads organizados" : "Organized clients & leads",
                  lang === "es" ? "Reservas y citas automáticas" : "Automated bookings & scheduling",
                  lang === "es" ? "Chatbot IA integrado" : "Integrated AI Chatbot",
                  lang === "es" ? "Booster de Reseñas en Google & Email" : "Google Reviews & Email Booster",
                  lang === "es" ? "Reportes y métricas avanzadas" : "Advanced metrics & reports"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3.5 group">
                    <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-zinc-900 group-hover:text-black transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Full Dashboard Mockup Container */}
            <div className="lg:col-span-7 relative w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/15 via-cyan-400/10 to-brand-green/15 rounded-[2.5rem] blur-3xl -z-10"></div>
              
              <div className="w-full bg-white border border-zinc-200/90 rounded-[2rem] shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col md:flex-row gap-6 border-zinc-200 text-black">
                
                {/* Sidebar Mockup */}
                <div className="w-full md:w-56 shrink-0 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <Image
                        src="/logo.webp"
                        alt="SPP Logo"
                        width={24}
                        height={24}
                        sizes="24px"
                        className="w-6 h-6 object-contain"
                      />
                      <SppLabsLogo inline={true} className="text-black scale-90" />
                    </div>

                    <div className="space-y-1">
                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                          <span>Resumen</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                          <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                            4
                          </span>
                        </span>
                      </div>
                      
                      <div className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-950 text-white flex items-center justify-between gap-2 shadow-sm relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          <span>Analíticas</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                          <span className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40" />
                        </span>
                      </div>

                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          <span>Clientes</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                          <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                            8
                          </span>
                        </span>
                      </div>

                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <span>IA</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                          <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                            3
                          </span>
                        </span>
                      </div>

                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                          <span className="truncate">Notificaciones...</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="absolute -inset-0.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                          <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(239,68,68,0.9)] border border-white/40">
                            5
                          </span>
                        </span>
                      </div>

                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span>Informes</span>
                        </div>
                      </div>

                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-between gap-2 relative">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                          <span>Email y Reseñas</span>
                        </div>
                        <span className="relative flex items-center justify-center shrink-0">
                          <span className="relative z-10 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[8.5px] font-black leading-none shadow-[0_0_8px_rgba(245,158,11,0.9)] border border-white/40">
                            <svg className="w-2.5 h-2.5 text-amber-300" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-2 pt-4 border-t border-zinc-200">
                    <div className="p-2.5 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-black block">Tu Empresa</span>
                        <span className="text-[9px] text-zinc-400 block font-mono">tuempresa.es</span>
                      </div>
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                    </div>
                    <div className="w-full py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-600 text-center flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span>Cerrar Sesión</span>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Panel */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-150">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded">TUEMPRESA.ES</span>
                      <h3 className="text-base font-black text-black mt-1">Analíticas de Tráfico</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Métricas de visitas e interacción ingeridas en tiempo real</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex bg-zinc-100 p-1 rounded-xl text-[10px] font-bold">
                        <span className="px-2 py-1 text-zinc-600">Día</span>
                        <span className="px-2 py-1 bg-black text-white rounded-lg shadow-xs">Semana</span>
                        <span className="px-2 py-1 text-zinc-600">Mes</span>
                        <span className="px-2 py-1 text-zinc-600">Año</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-ping"></span>
                        <span>2 activos</span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="bg-zinc-50 border-t-2 border-purple-500 border-x border-b border-zinc-200 p-3 rounded-xl text-center">
                      <span className="text-[8px] font-bold uppercase text-purple-600 tracking-wider block">Total Impresiones</span>
                      <span className="text-lg font-black text-black my-0.5 block">934</span>
                      <span className="text-[8px] font-bold text-emerald-600 block">↑ +100% vs semana</span>
                    </div>

                    <div className="bg-zinc-50 border-t-2 border-brand-cyan border-x border-b border-zinc-200 p-3 rounded-xl text-center">
                      <span className="text-[8px] font-bold uppercase text-cyan-600 tracking-wider block">Visitantes Únicos</span>
                      <span className="text-lg font-black text-black my-0.5 block">30</span>
                      <span className="text-[8px] font-bold text-emerald-600 block">↑ +100% vs semana</span>
                    </div>

                    <div className="bg-zinc-50 border-t-2 border-brand-green border-x border-b border-zinc-200 p-3 rounded-xl text-center">
                      <span className="text-[8px] font-bold uppercase text-brand-green tracking-wider block">Sesiones</span>
                      <span className="text-lg font-black text-black my-0.5 block">53</span>
                      <span className="text-[8px] font-bold text-emerald-600 block">↑ +100% vs semana</span>
                    </div>

                    <div className="bg-zinc-50 border-t-2 border-amber-500 border-x border-b border-zinc-200 p-3 rounded-xl text-center">
                      <span className="text-[8px] font-bold uppercase text-amber-600 tracking-wider block">Duración Promedio</span>
                      <span className="text-lg font-black text-black my-0.5 block">72s</span>
                      <span className="text-[8px] font-bold text-zinc-400 block">Promedio por sesión</span>
                    </div>

                    <div className="bg-zinc-50 border-t-2 border-blue-500 border-x border-b border-zinc-200 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                      <span className="text-[8px] font-bold uppercase text-blue-600 tracking-wider block">Tasa Rebote</span>
                      <span className="text-lg font-black text-black my-0.5 block">28%</span>
                      <span className="text-[8px] font-bold text-emerald-600 block">Excelente</span>
                    </div>
                  </div>

                  {/* Traffic Volume Chart */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-zinc-950 text-brand-cyan flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22" /></svg>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-black uppercase tracking-wider block">Volumen de Tráfico (Últimos 7 días)</span>
                          <span className="text-[9px] text-zinc-400 block">Histórico de visitas e interacción</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">Semana</span>
                    </div>

                    <div className="relative w-full h-32 pt-2">
                      <svg viewBox="0 0 500 120" className="w-full h-full text-brand-cyan overflow-visible" fill="none" stroke="currentColor" strokeWidth="3">
                        <defs>
                          <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00c8ff" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00c8ff" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 10 90 Q 75 75 140 70 T 270 20 T 390 30 T 490 75" />
                        <path d="M 10 90 Q 75 75 140 70 T 270 20 T 390 30 T 490 75 L 490 120 L 10 120 Z" fill="url(#dashboardGrad)" stroke="none" />
                        <circle cx="140" cy="70" r="4" fill="#00c8ff" />
                        <circle cx="270" cy="20" r="5" fill="#0052ff" className="animate-ping" />
                        <circle cx="270" cy="20" r="4" fill="#0052ff" />
                        <circle cx="390" cy="30" r="4" fill="#00c8ff" />
                      </svg>
                    </div>
                  </div>

                  {/* Traffic Sources Progress Rows */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">Orígenes de Tráfico</span>
                    
                    <div className="space-y-2 text-[11px] font-semibold">
                      <div>
                        <div className="flex justify-between text-zinc-800 mb-1">
                          <span>● Direct / None</span>
                          <span className="font-mono">622 (66.6%)</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: "66.6%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-800 mb-1">
                          <span>● Organic Google SEO</span>
                          <span className="font-mono">270 (28.9%)</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-brand-cyan h-full rounded-full" style={{ width: "28.9%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-800 mb-1">
                          <span>● Internal AI Engine</span>
                          <span className="font-mono">15 (1.6%)</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-brand-green h-full rounded-full" style={{ width: "1.6%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
