"use client";

import Link from "next/link";
import Image from "next/image";
import { SppLabsLogo } from "@/components/SppLabsLogo";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function Header({ activePage }) {
  const { lang, changeLanguage } = useLanguage();
  const t = translations[lang] || translations.es;

  const navItems = [
    { id: "inicio", href: "/", labelEs: "Inicio", labelEn: "Inicio" },
    { id: "servicios", href: "/servicios", labelEs: "Servicios", labelEn: "Servicios" },
    { id: "tecnologia", href: "/tecnologia", labelEs: "Tecnología", labelEn: "Tecnología" },
    { id: "nosotros", href: "/nosotros", labelEs: "Nosotros", labelEn: "Nosotros" },
    { id: "contacto", href: "/contacto", labelEs: "Contacto", labelEn: "Contacto" }
  ];

  return (
    <header className="border-b border-zinc-150/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[94rem] mx-auto px-3 sm:px-8 md:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 group shrink transition-transform hover:scale-[1.01] min-w-0" 
          id="nav-logo"
        >
          <Image
            src="/logo.webp"
            alt="SPP Labs Logo"
            width={32}
            height={32}
            sizes="(max-width: 640px) 28px, 32px"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
          />
          <SppLabsLogo inline={true} className="text-black text-xs sm:text-base shrink min-w-0" />
        </Link>

        {/* Desktop Navigation - Pill Box */}
        <nav className="hidden md:flex items-center bg-zinc-100/80 border border-zinc-200/60 p-1 rounded-full shadow-sm gap-0.5">
          {navItems.map((item) => {
            const active = activePage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3.5 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ease-out cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                  active
                    ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-sm shadow-brand-blue/20 hover:shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                    : "text-zinc-600 hover:text-black hover:bg-zinc-200/50"
                }`}
                id={`nav-link-${item.id}`}
              >
                {lang === "es" ? item.labelEs : item.labelEn}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Language Switcher Link */}
          <div className="flex gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold bg-zinc-50 border border-zinc-200 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xs">
            <button
              onClick={() => changeLanguage("es")}
              className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "es" ? "text-brand-blue font-black" : "text-zinc-400"}`}
            >
              ES
            </button>
            <span className="text-zinc-200">|</span>
            <button
              onClick={() => changeLanguage("en")}
              className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "en" ? "text-brand-blue font-black" : "text-zinc-400"}`}
            >
              EN
            </button>
          </div>

          <a
            href="/signup"
            className="text-sm font-semibold text-zinc-650 hover:text-black transition-colors hidden lg:inline-block"
            id="nav-signup-link"
          >
            {t.loginRegisterLink}
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-3 sm:px-5 h-8.5 sm:h-10 text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-sm shadow-brand-blue/15 hover:shadow-lg hover:shadow-brand-green/20 cursor-pointer whitespace-nowrap"
            id="nav-cta"
          >
            {t.navLogin}
          </a>

        </div>
      </div>

      {/* Mobile Horizontal Web Sections Sub-Banner Navigation Bar */}
      <div className="md:hidden border-t border-zinc-150/70 bg-white/95 backdrop-blur-md px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 shadow-xs">
          {navItems.map((item) => {
            const active = activePage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer text-center truncate ${
                  active
                    ? "bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-xs"
                    : "text-zinc-650 hover:text-black hover:bg-zinc-200/50"
                }`}
                id={`mobile-nav-link-${item.id}`}
              >
                {lang === "es" ? item.labelEs : item.labelEn}
              </Link>
            );
          })}
        </div>
      </div>

    </header>
  );
}
