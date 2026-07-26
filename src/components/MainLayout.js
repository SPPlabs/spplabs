"use client";

import Script from "next/script";
import Header from "./Header";
import Footer from "./Footer";
import GlobalGalaxyCTA from "./GlobalGalaxyCTA";
import { LanguageProvider } from "@/context/LanguageContext";

export default function MainLayout({ activePage, children }) {
  return (
    <LanguageProvider>
      <div className="bg-white min-h-screen text-black flex flex-col font-sans selection:bg-brand-blue selection:text-white">
        <Header activePage={activePage} />

        <main className="flex-1 bg-white">
          {children}
          {activePage !== "contacto" && <GlobalGalaxyCTA />}
        </main>

        <Footer />

        <Script
          defer
          src={`${process.env.NEXT_PUBLIC_API_URL || "https://api.spplabs.es"}/tracker.js`}
          data-domain="spplabs.es"
          data-api-key={process.env.NEXT_PUBLIC_SPP_API_KEY || "spp_api_spplabs_es_admin_key_2026_dev_placeholder"}
        />
      </div>
    </LanguageProvider>
  );
}
