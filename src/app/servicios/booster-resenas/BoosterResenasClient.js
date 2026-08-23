"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BoosterResenasClient() {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const [activeSimulatorTab, setActiveSimulatorTab] = useState("reviews"); // 'reviews' | 'reminder' | 'welcome'
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      num: "01",
      title: isEs ? "Envío Inteligente y Oportuno" : "Smart & Timely Triggers",
      desc: isEs
        ? "Envía la solicitud de reseña en el momento óptimo: inmediatamente tras un contacto web o 2 horas después de finalizar una cita, cuando la satisfacción del cliente es máxima."
        : "Send review requests at the ideal moment: instantly after web inquiries or 2 hours post-appointment when customer satisfaction peaks.",
    },
    {
      num: "02",
      title: isEs ? "Recordatorios de Cita Anti No-Show" : "Anti No-Show Booking Reminders",
      desc: isEs
        ? "Reduce hasta un 80% las ausencias y cancelaciones de última hora gracias a recordatorios automáticos 24 horas antes por correo con botones de confirmación."
        : "Reduce no-shows and missed appointments by up to 80% with automated email reminders sent 24 hours in advance.",
    },
    {
      num: "03",
      title: isEs ? "Dominio del SEO Local en Google Maps" : "Google Maps Local SEO Dominance",
      desc: isEs
        ? "El algoritmo de Google prioriza negocios con opiniones recientes y valoraciones altas. Consigue más llamadas y clientes nuevos de forma constante."
        : "Google's algorithm prioritizes businesses with consistent positive ratings. Attract more local calls and walk-in leads effortlessly.",
    },
  ];

  const faqs = [
    {
      q: isEs ? "¿Cómo se conecta con mi ficha de Google Maps / Google Business?" : "How does it connect to my Google Maps / Google Business Profile?",
      a: isEs
        ? "Solo tienes que pegar el enlace de solicitud de reseñas que te proporciona tu panel de Google Business en tu dashboard de SPP Labs. El sistema se encarga del resto automáticamente."
        : "You just need to paste your direct Google Business review link into your SPP Labs dashboard. The system handles all dispatching automatically.",
    },
    {
      q: isEs ? "¿Puedo elegir si enviarlo tras un contacto web o tras una cita?" : "Can I choose between contact form and booking triggers?",
      a: isEs
        ? "Sí, dispones de dos interruptores independientes: puedes activarlo para citas presenciales/reuniones, para formularios de contacto web (inmediato o diferido), o para ambos a la vez."
        : "Yes, you have two independent toggles: enable it for bookings, for contact forms (instant or delayed), or both simultaneously.",
    },
    {
      q: isEs ? "¿Los correos llevan el nombre y logo de mi empresa?" : "Do emails carry my business name and brand?",
      a: isEs
        ? "Totalmente. Los correos se envían con el nombre de tu empresa, tu color corporativo y tu enlace de respuesta directa (Reply-To)."
        : "Absolutely. All emails are branded with your company name, accent colors, and direct Reply-To routing.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 font-mono">
          <Link href="/" className="hover:text-amber-600 transition-colors">{isEs ? "Inicio" : "Home"}</Link>
          <span>/</span>
          <Link href="/servicios" className="hover:text-amber-600 transition-colors">{isEs ? "Servicios" : "Services"}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{isEs ? "Booster de Reseñas & Email" : "Google Reviews & Email Booster"}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <svg
              className="w-4 h-4 text-amber-500 shrink-0"
              viewBox="0 0 24 24"
              fill="white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {isEs ? "Potenciador de Reseñas de Google & Email" : "Google Reviews Booster & Email Lifecycle"}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            {isEs ? "Multiplica tus Reseñas de " : "Boost Your 5-Star "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              {isEs ? "5 Estrellas en Google" : "Google Maps Reviews"}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            {isEs
              ? "Convierte a cada cliente en un embajador de tu marca. Automatiza solicitudes de reseña tras visitas o citas, envía recordatorios inteligentes y fideliza en piloto automático sin esfuerzo manual."
              : "Turn every client into a brand advocate. Automate review requests after bookings or inquiries, send smart reminders, and build unbeatable local reputation on autopilot."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contacto"
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-black text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEs ? "Activar Booster para Mi Negocio" : "Get Review Booster"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Interactive Simulator / Showcase Section */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl mb-24 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                {isEs ? "SIMULADOR EN VIVO" : "LIVE SIMULATOR"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {isEs ? "Impacto y Automatización en Acción" : "Impact & Automation in Action"}
              </h2>
            </div>

            {/* Tabs Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveSimulatorTab("reviews")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSimulatorTab === "reviews"
                    ? "bg-white text-slate-950 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                ⭐ Solicitud Google
              </button>
              <button
                onClick={() => setActiveSimulatorTab("reminder")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSimulatorTab === "reminder"
                    ? "bg-white text-slate-950 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                ⏰ Recordatorio Cita
              </button>
              <button
                onClick={() => setActiveSimulatorTab("welcome")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeSimulatorTab === "welcome"
                    ? "bg-white text-slate-950 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                👋 Bienvenida Contacto
              </button>
            </div>
          </div>

          {/* Showcase Visual Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Business Reputation Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-amber-500/15 via-white to-amber-500/5 border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    Ficha de Google Maps
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Verificado ✓
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950">Tu Empresa en Google</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-amber-500">4.9</span>
                    <div className="flex text-amber-400 text-lg">★★★★★</div>
                    <span className="text-xs text-slate-500 font-bold">(148 reseñas)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-200/60 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Incremento mensual de valoraciones:</span>
                    <strong className="text-emerald-600 font-mono">+350%</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tasa de respuesta de clientes:</span>
                    <strong className="text-slate-900 font-mono">42.8%</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Reducción de No-Shows:</span>
                    <strong className="text-blue-600 font-mono">-80%</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-3xl p-5 text-xs space-y-2">
                <span className="font-mono text-[10px] text-amber-400 uppercase font-black tracking-widest block">
                  POR QUÉ ES CRUCIAL:
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  El 93% de los consumidores leen reseñas en Google antes de elegir un negocio local. Con SPP Labs, recopilas opiniones automáticamente sin tener que pedirlas a mano.
                </p>
              </div>
            </div>

            {/* Right Column: Simulated Email Card */}
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-xs font-mono text-slate-400 ml-2">Email Transaccional Automático</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">Resend Verified ⚡</span>
              </div>

              {activeSimulatorTab === "reviews" && (
                <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner space-y-4 text-center">
                  <div className="text-3xl">⭐⭐⭐⭐⭐</div>
                  <h4 className="text-lg font-black text-slate-950">¿Qué tal fue tu experiencia hoy, Carlos?</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    En <strong>Tu Empresa</strong> trabajamos para darte la mejor atención. ¿Nos regalarías 30 segundos valorando nuestro servicio en Google Maps?
                  </p>
                  <div className="pt-2">
                    <div className="inline-block bg-slate-950 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md">
                      ⭐ Dejar Reseña en Google Maps →
                    </div>
                  </div>
                </div>
              )}

              {activeSimulatorTab === "reminder" && (
                <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner space-y-4 text-center">
                  <div className="inline-block bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full">
                    ⏰ Recordatorio de Cita Mañana
                  </div>
                  <h4 className="text-lg font-black text-slate-950">¡Hola Carlos! Te recordamos tu cita</h4>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 max-w-sm mx-auto">
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">FECHA RESERVADA</span>
                    <strong className="text-sm text-slate-900 block mt-0.5">Mañana, 11:30 AM</strong>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Te esperamos puntualmente. Si necesitas reagendar, avísanos con antelación.
                  </p>
                </div>
              )}

              {activeSimulatorTab === "welcome" && (
                <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-inner space-y-4 text-center">
                  <div className="inline-block bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full">
                    ✓ Mensaje Recibido
                  </div>
                  <h4 className="text-lg font-black text-slate-950">¡Gracias por contactar con nosotros!</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Hemos recibido tu consulta a través de nuestra web. Nuestro equipo la está revisando y te responderemos en breve.
                  </p>
                  <div className="pt-1">
                    <div className="inline-block bg-slate-950 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
                      Visitar Sitio Web →
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Section */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block mb-3">
              {isEs ? "VENTAJAS ESTRATÉGICAS" : "KEY BENEFITS"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              {isEs ? "Fidelización y Crecimiento en Piloto Automático" : "Retention and Growth on Autopilot"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.num} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <span className="text-2xl font-mono font-black text-amber-500 block">{f.num}</span>
                <h3 className="text-lg font-black text-slate-950">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 text-center mb-8">
            {isEs ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 flex justify-between items-center cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-amber-500 text-lg font-mono">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl space-y-6">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800 inline-block">
            {isEs ? "IMPULSA TU REPUTACIÓN DIGITAL" : "BOOST YOUR DIGITAL REPUTATION"}
          </span>
          <h3 className="text-3xl sm:text-4xl font-black">
            {isEs ? "¿Listo para dominar las opiniones de tu sector?" : "Ready to dominate your market reviews?"}
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            {isEs
              ? "Configura tu enlace de Google Maps en 1 minuto y empieza a recibir reseñas de 5 estrellas de manera continua."
              : "Set up your Google Maps link in 1 minute and start generating continuous 5-star reviews."}
          </p>
          <div className="pt-2">
            <Link
              href="/contacto"
              className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all"
            >
              {isEs ? "Empezar Ahora →" : "Get Started Now →"}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
