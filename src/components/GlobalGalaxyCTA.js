"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalGalaxyCTA() {
  const { lang } = useLanguage();

  return (
    <section id="prueba-gratis" className="py-20 md:py-28 bg-zinc-950 text-white relative overflow-hidden border-b border-zinc-900">
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/15 via-purple-600/15 to-brand-green/15 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
          {lang === "es" ? "Promoción Especial 2026-2027" : "Special Offer 2026-2027"}
        </span>
        
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
          {lang === "es" ? "Empieza tu prueba gratis hasta 2027" : "Start your free trial until 2027"}
        </h2>
        
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          {lang === "es"
            ? "Accede hoy mismo a nuestro ecosistema completo de Inteligencia Artificial, desarrollo web de alto rendimiento, optimización SEO/GEO y gestión CRM sin compromiso."
            : "Get instant access to our complete AI ecosystem, high-performance web development, SEO/GEO optimization, and client CRM management risk-free."}
        </p>

        <div className="flex justify-center">
          <Link
            href="/contacto"
            className="galaxy-btn inline-flex items-center justify-center cursor-pointer"
            id="cta-galaxy-btn"
          >
            <span className="galaxy-btn__content">
              <span className="galaxy-btn__text">
                {lang === "es" ? "Empezar Prueba Gratis" : "Start Free Trial"}
              </span>
              <svg className="galaxy-btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24}>
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.136 10.136 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5z" fill="currentColor" />
              </svg>
            </span>
            <span className="galaxy-btn__glow" />
            <span className="galaxy-btn__stars" />
          </Link>
        </div>
      </div>
    </section>
  );
}
