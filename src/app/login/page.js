"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { translations } from "@/lib/translations";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function LoginPage() {
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Language selection logic matching dashboard clients
  const [lang, setLang] = useState("es");
  useEffect(() => {
    const savedLang = localStorage.getItem("spp_lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("spp_lang", newLang);
  };

  const t = translations[lang] || translations.es;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-6 sm:py-12 px-4 selection:bg-brand-blue selection:text-white">
      {/* Background Gradients constrained inside overflow-hidden container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-blue/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-green/5 blur-[120px]"></div>
      </div>

      {/* Top Header Navigation for Auth pages */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 sm:mb-8">
        {/* Back to Home Link */}
        <a
          href="/"
          className="text-sm font-semibold text-slate-500 hover:text-black transition-colors duration-200 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.authBack}
        </a>

        {/* Language Switcher in Auth Screens */}
        <div className="flex gap-3 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => changeLanguage("es")}
            className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "es" ? "text-brand-blue font-black" : "text-slate-400"}`}
          >
            ES
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => changeLanguage("en")}
            className={`hover:text-brand-blue cursor-pointer transition-colors ${lang === "en" ? "text-brand-blue font-black" : "text-slate-400"}`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
        {/* SPP Labs Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Image
            src="/logo.webp"
            alt="SPP Labs Logo"
            width={64}
            height={64}
            sizes="64px"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-3"
          />
          <SppLabsLogo inline={true} className="text-slate-950" style={{ fontSize: "1.75rem" }} />
          <p className="text-slate-500 text-xs sm:text-sm mt-3 text-center">{t.loginSubtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t.loginDomain}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="spplabs.es"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
              <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t.loginPassword}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />

              {/* Eye toggle button to the left of the lock logo */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-11 top-3.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer p-0.5"
                title={showPassword ? (lang === "es" ? "Ocultar contraseña" : "Hide password") : (lang === "es" ? "Mostrar contraseña" : "Show password")}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.326 16.17 7.26 19.17 12 19.17c1.78 0 3.463-.43 4.965-1.196m2.28-1.57A10.457 10.457 0 0022.066 12c-1.392-4.17-5.326-7.17-10.066-7.17-1.42 0-2.77.276-4.004.777M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.73 10.73a3 3 0 004.243 4.243" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              {/* Lock logo on the right */}
              <div className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue-dark rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              t.loginButton
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 mt-6 pt-6 text-center text-sm text-slate-500">
          {t.loginNoAccount}{" "}
          <a href="/signup" className="text-brand-blue hover:text-brand-green font-semibold transition-colors duration-200">
            {t.loginRegisterLink}
          </a>
        </div>
      </div>
    </div>
  );
}
