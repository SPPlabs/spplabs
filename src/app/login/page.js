"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations } from "@/lib/translations";
import { SppLabsLogo } from "@/components/SppLabsLogo";

export default function LoginPage() {
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center overflow-y-auto py-12 px-4 selection:bg-brand-blue selection:text-white">
      {/* Top Header Navigation for Auth pages */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
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

      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-blue/5 blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-green/5 blur-[120px] -z-10"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative">
        {/* SPP Labs Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.webp" alt="SPP Labs Logo" className="w-16 h-16 object-contain mb-3" />
          <SppLabsLogo inline={true} className="text-slate-950" style={{ fontSize: "1.75rem" }} />
          <p className="text-slate-500 text-sm mt-3">{t.loginSubtitle}</p>
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
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">
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
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
              <div className="absolute right-4 top-3.5 text-slate-400">
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
