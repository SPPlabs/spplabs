"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if visitor has already set consent preference
    const consent = localStorage.getItem("spp_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("spp_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("spp_cookie_consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-8 md:right-auto md:max-w-md z-[100] bg-white/95 backdrop-blur-md border border-zinc-200/90 p-5 rounded-3xl shadow-2xl animate-fade-in text-black font-sans">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🍪</span>
        <h3 className="text-sm font-bold text-black tracking-tight">Política de Cookies y Privacidad</h3>
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
        Utilizamos cookies propias y de analítica para mejorar tu experiencia de navegación. Al hacer clic en &quot;Aceptar todas&quot;, consientes el uso de cookies y aceptas nuestra{" "}
        <Link href="/politica-de-privacidad" className="font-semibold text-black underline hover:text-zinc-700">
          política de privacidad
        </Link>{" "}
        y nuestra{" "}
        <Link href="/politica-de-cookies" className="font-semibold text-black underline hover:text-zinc-700">
          política de cookies
        </Link>.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer text-center"
        >
          Aceptar todas
        </button>
        <button
          onClick={handleReject}
          className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
