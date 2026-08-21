"use client";

import Link from "next/link";
import Image from "next/image";
import { SppLabsLogo } from "@/components/SppLabsLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-white border-t border-zinc-100 py-10 md:py-12 mt-auto">
      <div className="max-w-[94rem] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <Link 
          href="/"
          className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.webp"
              alt="SPP Labs Logo"
              width={24}
              height={24}
              sizes="24px"
              className="w-6 h-6 object-contain"
            />
            <SppLabsLogo inline={true} className="text-black" />
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            <span className="hidden sm:inline">| </span>
            {lang === "es" ? "© 2026 SPP Labs. Todos los derechos reservados." : "© 2026 SPP Labs. All rights reserved."}
          </span>
        </Link>

        <div className="flex flex-wrap justify-center items-center gap-y-3 gap-x-6 text-xs font-semibold text-zinc-500">
          <Link href="/blog" className="hover:text-black transition-colors" id="footer-link-blog">Blog & Recursos</Link>
          <a href="mailto:info@spplabs.es" className="hover:text-black transition-colors flex items-center gap-1.5" id="footer-link-email">
            <svg className="w-3.5 h-3.5 shrink-0 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>info@spplabs.es</span>
          </a>
          <Link href="/politica-de-cookies" className="hover:text-black transition-colors" id="footer-link-cookies">Política de Cookies</Link>
          <Link href="/politica-de-privacidad" className="hover:text-black transition-colors" id="footer-link-privacy">Política de Privacidad</Link>
          <Link href="/terminos-y-condiciones" className="hover:text-black transition-colors" id="footer-link-terms">Términos y Condiciones</Link>
        </div>
      </div>
    </footer>
  );
}
