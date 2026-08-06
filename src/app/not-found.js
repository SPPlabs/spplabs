"use client";

import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function NotFound() {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.es;

  const quickLinks = [
    {
      title: t.notFoundNavInicio || (lang === "es" ? "Página Principal" : "Home Page"),
      desc: t.notFoundNavInicioDesc || (lang === "es" ? "Vuelve al punto de partida de nuestro sitio." : "Return to our homepage."),
      href: "/",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
        </svg>
      ),
      badge: "01",
    },
    {
      title: t.notFoundNavServicios || (lang === "es" ? "Servicios Digitales" : "Digital Services"),
      desc: t.notFoundNavServiciosDesc || (lang === "es" ? "Descubre nuestro catálogo de soluciones web e IA." : "Explore our catalog of web & AI solutions."),
      href: "/servicios",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      badge: "02",
    },
    {
      title: t.notFoundNavTecnologia || (lang === "es" ? "Nuestra Tecnología" : "Our Technology"),
      desc: t.notFoundNavTecnologiaDesc || (lang === "es" ? "Conoce nuestro stack moderno y arquitectura." : "Learn about our modern stack and architecture."),
      href: "/tecnologia",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      badge: "03",
    },
    {
      title: t.notFoundNavContacto || (lang === "es" ? "Contacto" : "Contact"),
      desc: t.notFoundNavContactoDesc || (lang === "es" ? "Ponte en contacto directamente con nuestro equipo." : "Get in touch directly with our team."),
      href: "/contacto",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      badge: "04",
    },
  ];

  return (
    <MainLayout activePage="404">
      <div className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28 min-h-[75vh] flex items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)", 
              backgroundSize: "24px 24px" 
            }} 
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-700">
              Error 404
            </span>
          </div>

          {/* Main 404 Visual Heading */}
          <h1 className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 select-none drop-shadow-sm mb-4">
            404
          </h1>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {t.notFoundTitle || (lang === "es" ? "Página no encontrada" : "Page Not Found")}
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-8">
            {t.notFoundSubtitle || (
              lang === "es"
                ? "Lo sentimos, la página que buscas no existe, ha sido movida o la URL ingresada es incorrecta."
                : "Sorry, the page you are looking for doesn't exist, has been moved, or the link is broken."
            )}
          </p>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {t.notFoundBackHome || (lang === "es" ? "Volver al Inicio" : "Back to Home")}
            </Link>

            <Link
              href="/contacto"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-extrabold rounded-xl shadow-xs hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.notFoundContact || (lang === "es" ? "Contactar Soporte" : "Contact Support")}
            </Link>
          </div>

          {/* Quick Links Section Grid */}
          <div className="pt-8 border-t border-slate-200/80 text-left">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">
              {t.notFoundQuickLinksTitle || (lang === "es" ? "Secciones recomendadas de SPP Labs" : "Recommended SPP Labs Sections")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group relative p-5 bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{lang === "es" ? "Ir a la sección" : "Visit page"}</span>
                    <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
